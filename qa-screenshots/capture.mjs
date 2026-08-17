// qa-screenshots/capture.mjs
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("qa-screenshots");
const BASE = "http://127.0.0.1:5173";

const widths = [
  { name: "1440", width: 1440, height: 900 },
  { name: "1280", width: 1280, height: 800 },
  { name: "1024", width: 1024, height: 768 },
  { name: "768", width: 768, height: 1024 },
  { name: "390", width: 390, height: 844 },
  { name: "360", width: 360, height: 800 },
];

async function shot(page, file) {
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, file), fullPage: false });
}

async function login(page, email) {
  await page.goto(`${BASE}/connexion`, { waitUntil: "networkidle" });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', "password123");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1200);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  for (const w of widths) {
    await page.setViewportSize({ width: w.width, height: w.height });
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await shot(page, `home-${w.name}.png`);
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  for (const route of [
    ["/annuaire", "annuaire"],
    ["/gazette", "gazette"],
    ["/gazette/portrait-boulangerie-martin", "article"],
    ["/commercants/boulangerie-martin", "merchant-profile"],
    ["/gazette/immo", "immo"],
  ]) {
    await page.goto(`${BASE}${route[0]}`, { waitUntil: "networkidle" });
    await shot(page, `${route[1]}-1440.png`);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await shot(page, "home-mobile-full.png");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await shot(page, "home-mobile-footer-nav.png");

  const dashboards = [
    ["admin@fenetreouverte.fr", "admin"],
    ["martin@boulangerie.fr", "merchant"],
    ["client@demo.fr", "client"],
    ["super@fenetreouverte.fr", "platform"],
  ];

  for (const [email, name] of dashboards) {
    const ctx = await browser.newContext();
    const p = await ctx.newPage();
    await p.setViewportSize({ width: 1440, height: 900 });
    await login(p, email);
    await shot(p, `dashboard-${name}-1440.png`);
    if (name === "merchant") {
      await p.goto(`${BASE}/espace-commercant/publier`, { waitUntil: "networkidle" });
      await shot(p, "merchant-publish-1440.png");
    }
    await ctx.close();
  }

  await browser.close();
  console.log("OK screenshots in", OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
