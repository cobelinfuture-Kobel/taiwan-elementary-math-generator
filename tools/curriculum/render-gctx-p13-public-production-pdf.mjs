import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

import { chromium } from "playwright";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(HERE, "../../docs/curriculum/output/gctx");
const HTML_PATH = resolve(OUT_DIR, "GCTX_P13_G3BU04_PUBLIC_PRODUCTION.html");
const PDF_PATH = resolve(OUT_DIR, "GCTX_P13_G3BU04_PUBLIC_PRODUCTION.pdf");

readFileSync(HTML_PATH);
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(pathToFileURL(HTML_PATH).href, { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print" });
  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" }
  });
  writeFileSync(PDF_PATH, pdf);
  console.log(JSON.stringify({ pdfPath: PDF_PATH, pdfBytes: pdf.length }, null, 2));
} finally {
  await browser.close();
}
