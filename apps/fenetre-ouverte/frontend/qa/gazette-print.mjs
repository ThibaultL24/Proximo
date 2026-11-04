import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const output = path.resolve("qa-output");
await mkdir(output, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox"],
});

try {
  for (const [name, query, minimum] of [
    ["reference", "", 2],
    ["automatic-continuation", "?auto=1", 3],
  ]) {
    const page = await browser.newPage({
      viewport: { width: 1500, height: 900 },
      deviceScaleFactor: 1,
    });

    const url = "http://127.0.0.1:5173/__qa/gazette-print" + query;
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.locator('[data-qa-ready="true"]').waitFor({ timeout: 120_000 });
    await page.evaluate(() => document.fonts.ready);
    await page.locator('[data-testid="gazette-check"]').click();
    const result = (await page.locator('[data-testid="gazette-check-result"]').textContent())?.trim();
    if (result !== "OK") {
      throw new Error(name + ": A4 preflight failed: " + result);
    }

    const count = await page.locator(".gazette-proof-page").count();
    if (count < minimum) {
      throw new Error(name + ": expected at least " + minimum + " pages, got " + count);
    }

    const geometry = await page.locator(".gazette-proof-page").first().evaluate((element) => {
      const box = element.getBoundingClientRect();
      const footer = element.querySelector(".gazette-reference-footer")?.getBoundingClientRect();
      return { width: box.width, height: box.height, footerTop: footer?.top, pageTop: box.top };
    });

    if (Math.abs(geometry.width - 793.7) > 4 || Math.abs(geometry.height - 1122.5) > 4) {
      throw new Error(name + ": wrong CSS A4 geometry: " + JSON.stringify(geometry));
    }

    await page.locator(".gazette-proof-page").first().screenshot({
      path: path.join(output, name + "-first-page.png"),
    });
    await page.pdf({
      path: path.join(output, name + ".pdf"),
      format: "A4",
      preferCSSPageSize: true,
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });

    console.log("PASS", name, count + " A4 pages", geometry.width.toFixed(1), "x", geometry.height.toFixed(1));
    await page.close();
  }
} finally {
  await browser.close();
}
