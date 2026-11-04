import { chromium } from "playwright";
import { mkdir, copyFile } from "node:fs/promises";
import path from "node:path";

const output = path.resolve("qa-output/real-ui");
await mkdir(output, { recursive: true });

const organizations = [{ id: 1, name: "Agence partenaire — démonstration", slug: "agence-demo", membership_role: "owner" }];
const leads = [
  {
    id: 101, contact_name: "Camille Martin (fictif)", contact_phone: "0100000001",
    contact_email: "camille@example.invalid", lead_type: "sell", status: "received",
    property_city: "Bourg-Saint-Andéol", submitted_by_id: 1,
    created_at: "2026-11-04T10:00:00Z",
  },
  {
    id: 102, contact_name: "Léa Robert (fictif)", contact_phone: "0100000002",
    lead_type: "rent", status: "qualified", property_city: "Saint-Remèze",
    submitted_by_id: 1, created_at: "2026-11-03T10:00:00Z",
  },
  {
    id: 103, contact_name: "Marc Petit (fictif)", contact_phone: "0100000003",
    lead_type: "buy", status: "converted", property_city: "Viviers",
    submitted_by_id: 1, created_at: "2026-11-02T10:00:00Z",
  },
];
const dossiers = [
  { id: 201, full_name: "Émilie Durand (fictif)", project_type: "achat",
    property_city: "Bourg-Saint-Andéol", mandate_status: "a_verifier",
    created_at: "2026-11-01T10:00:00Z" },
  { id: 202, full_name: "Paul Bernard (fictif)", project_type: "vente",
    property_city: "Pierrelatte", mandate_status: "non_recu",
    created_at: "2026-11-02T10:00:00Z" },
];
const history = [{ from_status: null, to_status: "received", note: "Recommandation reçue", created_at: "2026-11-04T10:00:00Z" }];

function send(route, body, status = 200) {
  return route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
}

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  recordVideo: { dir: output, size: { width: 1440, height: 900 } },
});

const page = await context.newPage();
await page.addInitScript(() => localStorage.setItem("proximo_token", "test-token-local"));

await page.route("**/api/v1/**", route => {
  const url = new URL(route.request().url());
  const p = url.pathname;
  const method = route.request().method();
  if (p === "/api/v1/auth/me") return send(route, {
    id: 1, email: "demo.proximo@example.invalid", full_name: "Responsable (démo)", role: "admin",
  });
  if (p === "/api/v1/proximo/organizations") return send(route, organizations);
  if (p === "/api/v1/proximo/organizations/1/leads" && method === "GET") return send(route, leads);
  if (p === "/api/v1/proximo/organizations/1/client_dossiers") return send(route, dossiers);
  if (p === "/api/v1/proximo/organizations/1/partners") return send(route, []);
  if (p === "/api/v1/proximo/organizations/1/commissions") return send(route, []);
  if (/\/leads\/\d+$/.test(p) && method === "GET") {
    const lead = leads.find(x => p.endsWith("/" + x.id));
    return send(route, lead ? { ...lead, history } : {}, lead ? 200 : 404);
  }
  if (/\/leads\/\d+\/(qualify|start|convert|reject)$/.test(p) && method === "PATCH") {
    const parts = p.split("/");
    const id = Number(parts[parts.length - 2]);
    const lead = leads.find(x => x.id === id);
    if (!lead) return send(route, {}, 404);
    const statuses = { qualify: "qualified", start: "in_progress", convert: "converted", reject: "rejected" };
    lead.status = statuses[parts.at(-1)] || lead.status;
    history.push({ from_status: "received", to_status: lead.status, note: "Action de démonstration", created_at: "2026-11-04T10:01:00Z" });
    return send(route, lead);
  }
  return send(route, []);
});

async function wait(ms = 1100) {
  await page.waitForTimeout(ms);
}
async function capture(name) {
  await page.screenshot({ path: path.join(output, name + ".png"), fullPage: false });
}
async function overlay() {
  await page.evaluate(() => {
    let label = document.getElementById("authentic-demo-label");
    if (!label) {
      label = document.createElement("div");
      label.id = "authentic-demo-label";
      label.style.cssText = [
        "position:fixed", "bottom:14px", "right:14px", "z-index:999999",
        "background:#0b182be8", "border:1px solid #d9f87188", "border-radius:9px",
        "color:#efff9a", "padding:9px 13px", "font:700 11px Arial,sans-serif",
        "box-shadow:0 4px 15px #0005",
      ].join(";");
      label.textContent = "INTERFACE REACT RÉELLE · DONNÉES FICTIVES";
      document.body.appendChild(label);
    }
  });
}

try {
  await page.goto("http://127.0.0.1:5174/espace", { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: /Votre vue d'ensemble/ }).waitFor({ timeout: 30000 });
  await page.waitForFunction(() => {
    const value = document.querySelector(".proximo-stat-value")?.textContent?.trim();
    return value !== undefined && value !== "—";
  });
  await overlay(); await wait(1800); await capture("01-cockpit-reel");

  await page.getByRole("link", { name: /Voir les recommandations/ }).click();
  await page.getByRole("heading", { name: /Du contact à l'opportunité/ }).waitFor();
  await page.getByText("Camille Martin (fictif)").first().waitFor();
  await overlay(); await wait(1600); await capture("02-recommandations-reelles");

  await page.getByRole("button", { name: "Qualifier" }).first().click();
  await page.getByText("Le suivi de la recommandation a été actualisé.").waitFor();
  await overlay(); await wait(1500); await capture("03-qualification-reelle");

  await page.goto("http://127.0.0.1:5174/dossiers/nouveau?organization_id=1", { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: "Nouvelle fiche client" }).waitFor();
  await overlay(); await wait(1600); await capture("04-dossier-client-reel");
} finally {
  const video = page.video();
  await context.close();
  if (video) await copyFile(await video.path(), path.join(output, "proximo-react-authentique.webm"));
  await browser.close();
}
console.log("PASS: vraie interface Proximo filmée avec données fictives");
