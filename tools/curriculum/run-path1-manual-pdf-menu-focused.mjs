import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = path.join(ROOT, "site");
const OUTPUT = path.join(ROOT, "tmp/path1-manual-pdf-menu-focused");
fs.mkdirSync(OUTPUT, { recursive: true });

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
]);

function safeSitePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const requested = decoded.endsWith("/") ? `${decoded}index.html` : decoded;
  const normalized = path.normalize(requested).replace(/^([.][.][/\\])+/, "");
  const absolute = path.join(SITE, normalized.replace(/^[/\\]+/, ""));
  return absolute.startsWith(SITE) ? absolute : null;
}

const server = http.createServer((request, response) => {
  const filePath = safeSitePath(request.url ?? "/");
  if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("not found");
    return;
  }
  response.writeHead(200, { "content-type": contentTypes.get(path.extname(filePath)) ?? "application/octet-stream" });
  response.end(fs.readFileSync(filePath));
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
const baseUrl = `http://127.0.0.1:${address.port}`;
const consoleErrors = [];
const pageErrors = [];
const blockReports = [];

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(String(error)));

  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  const pathLinkCount = await page.locator('a[href="./path1/"]').count();
  if (pathLinkCount !== 1) throw new Error(`PATH1_CLASSIC_LINK_MISSING:${pathLinkCount}`);

  await page.goto(`${baseUrl}/path1/`, { waitUntil: "networkidle" });
  const optionValues = await page.locator("#path1-block-select option").evaluateAll((options) => options.map((option) => option.value));
  const expected = Array.from({ length: 27 }, (_, index) => `P1-${String(index + 1).padStart(2, "0")}`);
  if (JSON.stringify(optionValues) !== JSON.stringify(expected)) {
    throw new Error(`PATH1_OPTION_SEQUENCE_MISMATCH:${JSON.stringify(optionValues)}`);
  }

  await page.locator("#path1-question-count").fill("6");
  await page.locator("#path1-generation-seed").fill("path1-focused-pages");

  for (const blockId of expected) {
    await page.locator("#path1-block-select").selectOption(blockId);
    await page.locator("#path1-generate-button").click();
    await page.waitForFunction(() => {
      const panel = document.querySelector("#path1-status-panel");
      return panel?.dataset?.tone === "success" || panel?.dataset?.tone === "error";
    });
    const tone = await page.locator("#path1-status-panel").getAttribute("data-tone");
    const statusText = await page.locator("#path1-status-panel").textContent();
    if (tone !== "success") throw new Error(`PATH1_BLOCK_UI_FAILED:${blockId}:${statusText}`);
    const previewMeta = await page.locator("#path1-preview-meta").textContent();
    if (!previewMeta?.includes(blockId) || !previewMeta.includes("6 題")) {
      throw new Error(`PATH1_PREVIEW_META_MISMATCH:${blockId}:${previewMeta}`);
    }
    if (await page.locator("#path1-print-button").isDisabled()) {
      throw new Error(`PATH1_PRINT_BUTTON_DISABLED:${blockId}`);
    }
    const frame = page.frames().find((candidate) => candidate !== page.mainFrame() && candidate.url() === "about:srcdoc")
      ?? page.frames().find((candidate) => candidate !== page.mainFrame());
    const worksheetPages = frame ? await frame.locator(".worksheet-page").count() : 0;
    if (worksheetPages < 1) throw new Error(`PATH1_PREVIEW_EMPTY:${blockId}`);
    blockReports.push({ blockId, worksheetPages, statusText });
  }

  const lastFrame = page.frames().find((candidate) => candidate !== page.mainFrame() && candidate.url() === "about:srcdoc")
    ?? page.frames().find((candidate) => candidate !== page.mainFrame());
  const html = lastFrame ? await lastFrame.content() : "";
  if (!html.includes("P1-27")) throw new Error("PATH1_LAST_BLOCK_HTML_MISSING");
  const pdfPage = await browser.newPage();
  await pdfPage.setContent(html, { waitUntil: "networkidle" });
  const pdfPath = path.join(OUTPUT, "P1-27-focused.pdf");
  await pdfPage.pdf({ path: pdfPath, format: "A4", printBackground: true, preferCSSPageSize: true });
  await pdfPage.close();
  if (!fs.existsSync(pdfPath) || fs.statSync(pdfPath).size < 1000) throw new Error("PATH1_FOCUSED_PDF_NOT_MATERIALIZED");

  const report = {
    schemaName: "Path1ManualPdfMenuFocusedV1",
    status: "PASS",
    blockCount: blockReports.length,
    firstBlockId: blockReports[0]?.blockId,
    lastBlockId: blockReports.at(-1)?.blockId,
    consoleErrorCount: consoleErrors.length,
    pageErrorCount: pageErrors.length,
    pdfBytes: fs.statSync(pdfPath).size,
    automaticNPlus1: false,
    manualProgression: true,
  };
  if (consoleErrors.length > 0 || pageErrors.length > 0 || report.blockCount !== 27 || report.lastBlockId !== "P1-27") {
    throw new Error(`PATH1_FOCUSED_REPLAY_FAILED:${JSON.stringify(report)}`);
  }
  fs.writeFileSync(path.join(OUTPUT, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`PATH1_MANUAL_PDF_MENU_FOCUSED=${JSON.stringify(report)}`);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
