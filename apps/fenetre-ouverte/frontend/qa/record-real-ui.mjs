import { chromium } from "playwright";
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

const output = path.resolve("qa-output/real-ui");
await mkdir(output, { recursive: true });

let role = "client";
const article = {
  id: 41, title: "Portrait d'un artisan de nos villages",
  slug: "portrait-artisan-demo", body: [
    "Au coeur du village, une nouvelle initiative donne à découvrir un métier et une passion.",
    "Les habitants apprécient les savoir-faire locaux et les échanges qui rendent le territoire vivant.",
    "Cet article fictif présente l'utilisation du Studio Gazette. Il ne reproduit pas le contenu du client.",
  ].join("\n\n"),
  excerpt: "Une rencontre et une histoire de proximité",
  category: "merchant_spotlight", cover_image_url: "/territory/hero-gorges.png",
};

function send(route, value, status = 200) {
  return route.fulfill({ status, contentType: "application/json", body: JSON.stringify(value) });
}
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1,
  recordVideo: { dir: output, size: { width: 1440, height: 900 } },
});
const page = await context.newPage();
let pageErrors = [];
page.on("pageerror", error => pageErrors.push(error.message));
await page.addInitScript(() => localStorage.setItem("fenetre_ouverte_token", "test-token-local"));

await page.route("**/api/v1/**", route => {
  const url = new URL(route.request().url());
  const p = url.pathname;
  if (p === "/api/v1/auth/me") {
    return send(route, {
      id: role === "admin" ? 2 : role === "merchant" ? 3 : 1,
      role, full_name: role === "admin" ? "Jean-Michel (démo)" : role === "merchant" ? "Commerçant (démo)" : "Habitant (démo)",
      email: role + "@example.invalid", agency_id: 1,
    });
  }
  if (/\/(feed|public\/feed)$/.test(p)) return send(route, []);
  if (p === "/api/v1/merchant/stats") return send(route, {
    merchant_name: "L'Atelier des collines (fictif)", qr_scan_count: 128,
    qr_unique_scans: 84, qr_scans_this_week: 21, qr_url: "#", qr_token: "fictif",
  });
  if (p === "/api/v1/merchant/publications") return send(route, [{
    id:120, body:"Nous vous retrouvons samedi au marché des artisans !",
    category:"commerces", status:"published", syndicated:false,
    requested_providers:[], requested_syndication:false, social_posts:[],
    merchant:{id:12,name:"L'Atelier des collines (fictif)"},
  }]);
  if (p === "/api/v1/merchant/social_accounts") return send(route, {
    providers:[
      {provider:"facebook",page_configured:true,page_label:"Page démo",oauth_configured:false,
        connected:false,demo:true,account_name:"Compte démo"},
      {provider:"instagram",page_configured:false,oauth_configured:false,connected:false,demo:false},
      {provider:"tiktok",page_configured:false,oauth_configured:false,connected:false,demo:false}
    ], accounts:[]
  });
  if (p === "/api/v1/merchant/social_channels") return send(route, [
    {id:"facebook",label:"Facebook Pages",mode:"oauth",notes:"Page autorisée requise",configured:false,connected_live:false,demo:true},
    {id:"instagram",label:"Instagram",mode:"oauth",notes:"Compte professionnel requis",configured:false,connected_live:false,demo:false},
    {id:"tiktok",label:"TikTok",mode:"oauth",notes:"Audit de l'application requis",configured:false,connected_live:false,demo:false},
    {id:"linkedin",label:"LinkedIn",mode:"planned",notes:"API Posts après autorisation",configured:false,connected_live:false,demo:false},
    {id:"wordpress",label:"WordPress",mode:"partner",notes:"Blog que vous contrôlez",configured:false,connected_live:false,demo:false},
    {id:"x",label:"X",mode:"paid",notes:"API facturée à l'usage",configured:false,connected_live:false,demo:false}
  ]);
  if (p === "/api/v1/merchant/leads") return send(route, []);
  if (p === "/api/v1/merchant/subscription" || p === "/api/v1/merchant/subscription/status") {
    return send(route, { active: true, status: "active", current_period_end: null });
  }
  if (p === "/api/v1/admin/stats") return send(route, {
    merchants: { total: 48, published: 42, featured: 8 },
    qr_scans: { total: 362, this_week: 21, unique: 218 },
    leads: { total: 0, this_month: 0 },
    articles: { gazette: 18, immo: 0 },
  });
  if (p === "/api/v1/admin/publication_moderations") return send(route, [
    {
      id: 91, body: "Marché des artisans samedi matin, au coeur du village !",
      category: "vie_locale", requested_syndication: false, requested_providers: [],
      created_at: "2026-11-04T10:00:00Z",
      merchant: { id: 12, name: "L'Atelier des collines (fictif)" },
    },
  ]);
  if (p === "/api/v1/admin/profile_reviews") return send(route, []);
  if (p === "/api/v1/admin/gazette_editions") return send(route, []);
  if (p === "/api/v1/admin/articles") return send(route, [article]);
  if (p === "/api/v1/public/gazette_editions") return send(route, [
    { id:7, issue_label:"N° 7", edition_label:"Octobre 2026", status:"published",
      published_at:"2026-10-01T10:00:00Z" },
    { id:6, issue_label:"N° 6", edition_label:"Septembre 2026", status:"archived",
      published_at:"2026-09-01T10:00:00Z" },
  ]);
  if (p === "/api/v1/public/gazette_editions/7") return send(route, {
    id:7, issue_label:"N° 7", edition_label:"Octobre 2026", status:"published",
    published_at:"2026-10-01T10:00:00Z",
    settings:{
      subtitle:"de Martine et Jean-Michel",
      territory:"SECTEUR DRÔME - ARDÈCHE, VAUCLUSE ET SES ENVIRONS",
      banner:"ANNONCEUR DE DÉMONSTRATION",
      contact:"Coordonnées fictives",
      legal:"EXEMPLE TECHNIQUE, NON DESTINÉ À L'IMPRESSION",
    },
    pages:[
      { id:1, template:"portrait", articleId:41, rubric:"L'histoire des",
        note:"", leftHeading:"Une histoire de proximité",
        article_snapshot:{
          id:41, title:article.title, excerpt:article.excerpt,
          body:article.body, cover_image_url:article.cover_image_url,
        },
      },
    ],
    asset_urls:{},
  });
  if (/invoice/i.test(p)) return send(route, { invoices: [] });
  if (/subscription/i.test(p)) return send(route, { active: true, status: "active" });
  return send(route, []);
});

async function overlay() {
  await page.evaluate(() => {
    const old = document.getElementById("authentic-demo-label");
    old?.remove();
    const label = document.createElement("div");
    label.id = "authentic-demo-label";
    label.style.cssText = [
      "position:fixed", "bottom:14px", "right:14px", "z-index:999999",
      "background:#072a57ef", "border:1px solid #f7cd7e", "border-radius:9px",
      "color:#ffe39d", "padding:9px 13px", "font:700 11px Arial,sans-serif",
      "box-shadow:0 4px 15px #0005",
    ].join(";");
    label.textContent = "INTERFACE REACT RÉELLE · DONNÉES FICTIVES";
    document.body.appendChild(label);
  });
}
async function scene(url, heading, name) {
  pageErrors = [];
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: heading }).first().waitFor({ timeout: 30000 });
  await page.waitForTimeout(950);
  await overlay();
  await page.waitForTimeout(1350);
  if (pageErrors.length > 0) {
    throw new Error(name + " : erreur React détectée : " + pageErrors.join(" ; "));
  }
  const screenVisible = await page.getByRole("heading", { name: heading }).first().isVisible();
  if (!screenVisible) {
    throw new Error(name + " : écran React vide ou masqué, capture refusée");
  }
  await page.screenshot({ path: path.join(output, name + ".png") });
}
try {
  role = "client";
  await scene("http://127.0.0.1:5173/", /La vie locale/, "01-habitant-accueil");
  await scene("http://127.0.0.1:5173/gazette", "La Gazette", "02-habitant-gazette");
  await scene("http://127.0.0.1:5173/gazette/editions/7", /N° 7/, "03-habitant-edition-publiee");
  role = "merchant";
  await scene("http://127.0.0.1:5173/espace-commercant", /Votre vitrine locale/, "03-commercant-cockpit");
  await scene("http://127.0.0.1:5173/espace-commercant/publier", "Atelier de diffusion", "04-commercant-distribution");
  role = "admin";
  await scene("http://127.0.0.1:5173/admin", "Piloter la vie locale", "04-admin-cockpit");
  await scene("http://127.0.0.1:5173/admin/moderation", "Centre de modération", "05-admin-moderation");
  await scene("http://127.0.0.1:5173/admin/gazette-studio", "Studio Gazette", "06-studio-gazette");
} finally {
  const video = page.video();
  await context.close();
  if (video) await copyFile(await video.path(), path.join(output, "fenetre-ouverte-react-authentique.webm"));
  await browser.close();
}
console.log("PASS: véritables interfaces Fenêtre Ouverte filmées avec des données fictives");
