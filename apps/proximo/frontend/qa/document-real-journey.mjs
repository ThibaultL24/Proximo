import { chromium } from "playwright";
import { mkdir, copyFile } from "node:fs/promises";
import path from "node:path";

const output = path.resolve("qa-output/real-ui");
await mkdir(output, { recursive: true });

let currentMembership = "owner";
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
  if (p === "/api/v1/proximo/organizations") return send(route, organizations.map(org => ({...org,membership_role:currentMembership})));
  if (p === "/api/v1/proximo/organizations/1/leads" && method === "GET") return send(route, leads);
  if (p === "/api/v1/proximo/organizations/1/leads" && method === "POST") {
    const payload = route.request().postDataJSON()?.lead ?? {};
    const lead = {
      id:104,contact_name:payload.contact_name||"Nadia Lefèvre (fictif)",
      contact_phone:payload.contact_phone||"0100000004",
      contact_email:payload.contact_email||"nadia@example.invalid",
      lead_type:payload.lead_type||"sell",property_city:payload.property_city||"Bourg-Saint-Andéol",
      description:payload.description||"Projet fictif",status:"received",submitted_by_id:1,
      created_at:"2026-11-04T10:15:00Z",
    };
    if (!leads.some(item => item.id === lead.id)) leads.unshift(lead);
    return send(route, lead, 201);
  }
  if (p === "/api/v1/proximo/organizations/1/client_dossiers") return currentMembership === "member" ? send(route,{error:"Forbidden"},403) : send(route,dossiers);
  if (p === "/api/v1/proximo/organizations/1/property_listings" && method === "GET") {
    return send(route, [{
      id:301, title:"Appartement avec terrasse (fictif)",
      description:"Appartement lumineux à deux pas du centre, présentation de démonstration.",
      city:"Bourg-Saint-Andéol", postal_code:"07700",
      property_kind:"appartement", transaction_type:"sale",
      price_cents:25900000, area_sqm:"76.00",
      rooms:3, bedrooms:2, mandate_reference:"DEMO-001",
      status:"ready", external_publication:false, legal_review_required:true,
      created_at:"2026-11-04T10:00:00Z",
    }]);
  }
  if (p === "/api/v1/proximo/organizations/1/property_listings/channels") {
    return send(route, [
      { id:"seloger", label:"SeLoger", mode:"contract", notes:"Accord commercial et flux agréé requis" },
      { id:"logic_immo", label:"Logic-Immo", mode:"contract", notes:"Partenaire professionnel requis" },
      { id:"diffuze", label:"Diffuze", mode:"paid_partner", notes:"Prestataire externe payant" },
      { id:"wordpress", label:"WordPress", mode:"owner_blog", notes:"Blog contrôlé par l'agence" },
    ]);
  }
  if (p === "/api/v1/proximo/organizations/1/partners") return send(route, []);
  if (p === "/api/v1/proximo/organizations/1/commissions") return currentMembership === "member"
    ? send(route,{error:"Forbidden"},403)
    : send(route, [{id:11,lead_id:103,amount_cents:45000,platform_fee_cents:4500,status:"pending",currency:"EUR"}]);
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
  await page.screenshot({ path: path.join(output, name + ".png"), fullPage: true });
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
  await page.goto("http://127.0.0.1:5174/", { waitUntil:"domcontentloaded" });
  await page.getByRole("heading", { name: /L'immobilier/ }).first().waitFor();
  await overlay(); await wait(900); await capture("00-public-accueil");

  await page.goto("http://127.0.0.1:5174/connexion", { waitUntil:"domcontentloaded" });
  await page.getByRole("heading", { name: "Connexion" }).waitFor();
  await overlay(); await wait(900); await capture("00b-connexion");

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

  await page.goto("http://127.0.0.1:5174/annonces", { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: "Atelier des annonces" }).waitFor();
  await page.getByText("Appartement avec terrasse (fictif)").first().waitFor();
  await overlay(); await wait(1600); await capture("04-diffusion-annonces-reelle");
  await page.getByRole("heading", { name: "Où diffuser ?" }).scrollIntoViewIfNeeded();
  await wait(600); await capture("04b-portails-et-blogs");

  await page.goto("http://127.0.0.1:5174/dossiers/nouveau?organization_id=1", { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: "Nouvelle fiche client" }).waitFor();
  await overlay(); await wait(1600); await capture("05-dossier-client-reel");

  // Les mêmes composants avec un autre rôle : apporteur non gestionnaire.
  currentMembership = "member";
  await page.goto("http://127.0.0.1:5174/recommandations", { waitUntil:"domcontentloaded" });
  await page.getByRole("heading", { name: /Du contact à l'opportunité/ }).waitFor();
  await overlay(); await wait(1000); await capture("06-apporteur-recommandation");

  await page.getByRole("heading", { name: "Nouvelle recommandation" }).scrollIntoViewIfNeeded();
  await page.getByLabel("Nom du contact fictif").fill("Nadia Lefèvre (fictif)");
  await page.getByLabel("Téléphone fictif").fill("0100000004");
  await page.getByLabel("Commune").fill("Bourg-Saint-Andéol");
  await page.getByLabel("Description du projet").fill("Souhaite être rappelée pour vendre un bien (scénario fictif).");
  await page.locator('input[type="checkbox"]').check();
  await page.getByRole("button", { name:"Transmettre la recommandation" }).click();
  await page.getByText(/Recommandation fictive créée/).waitFor();
  await overlay(); await wait(650); await capture("07-apporteur-contact-transmis");

  currentMembership = "owner";
  await page.goto("http://127.0.0.1:5174/recommandations", { waitUntil:"domcontentloaded" });
  await page.getByRole("heading", { name: /Du contact à l'opportunité/ }).waitFor();
  await page.getByRole("button", { name:"Historique" }).first().click();
  await overlay(); await wait(600); await capture("08-responsable-historique");

} finally {
  const video = page.video();
  await context.close();
  if (video) await copyFile(await video.path(), path.join(output, "proximo-react-authentique.webm"));
  await browser.close();
}
console.log("PASS: vraie interface Proximo filmée avec données fictives");
