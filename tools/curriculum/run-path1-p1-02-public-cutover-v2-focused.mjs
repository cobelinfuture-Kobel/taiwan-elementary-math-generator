import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = path.join(ROOT, "site");
const OUTPUT = path.join(ROOT, "tmp/path1-p1-02-public-cutover-v2-focused");
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

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(String(error)));

  await page.goto(`${baseUrl}/path1/`, { waitUntil: "networkidle" });
  const p102OptionCount = await page.locator('#path1-block-select option[value="P1-02"]').count();
  if (p102OptionCount !== 1) throw new Error(`P1_02_OPTION_MISSING:${p102OptionCount}`);

  await page.locator("#path1-block-select").selectOption("P1-02");
  await page.locator("#path1-question-count").fill("8");
  await page.locator("#path1-generation-seed").fill("p1-02-public-cutover-v2-browser");
  await page.locator("#path1-generate-button").click();
  await page.waitForFunction(() => {
    const panel = document.querySelector("#path1-status-panel");
    return panel?.dataset?.tone === "success" || panel?.dataset?.tone === "error";
  });

  const tone = await page.locator("#path1-status-panel").getAttribute("data-tone");
  const statusText = await page.locator("#path1-status-panel").textContent();
  if (tone !== "success") throw new Error(`P1_02_UI_FAILED:${statusText}`);

  const previewMeta = await page.locator("#path1-preview-meta").textContent();
  if (!previewMeta?.includes("P1-02") || !previewMeta.includes("8 題")) {
    throw new Error(`P1_02_PREVIEW_META_MISMATCH:${previewMeta}`);
  }
  if (await page.locator("#path1-print-button").isDisabled()) throw new Error("P1_02_PRINT_BUTTON_DISABLED");

  const frame = page.frames().find((candidate) => candidate !== page.mainFrame() && candidate.url() === "about:srcdoc")
    ?? page.frames().find((candidate) => candidate !== page.mainFrame());
  if (!frame) throw new Error("P1_02_PREVIEW_FRAME_MISSING");

  const questionCells = frame.locator(".worksheet-section--questions .worksheet-cell--question");
  const answerCells = frame.locator(".worksheet-section--answer-key .worksheet-cell--answer-key");
  const questionCellCount = await questionCells.count();
  const answerCellCount = await answerCells.count();
  if (questionCellCount !== 8) throw new Error(`P1_02_VISIBLE_QUESTION_COUNT_MISMATCH:${questionCellCount}`);
  if (answerCellCount !== 8) throw new Error(`P1_02_VISIBLE_ANSWER_COUNT_MISMATCH:${answerCellCount}`);

  const questionBodies = await questionCells.locator(".worksheet-cell__prompt").evaluateAll((nodes) => (
    nodes.map((node) => String(node.textContent ?? "").trim())
  ));
  const answerBodies = await answerCells.locator(".worksheet-cell__answer").evaluateAll((nodes) => (
    nodes.map((node) => String(node.textContent ?? "").trim())
  ));
  if (questionBodies.some((text) => !text)) throw new Error(`P1_02_VISIBLE_QUESTION_BODY_EMPTY:${JSON.stringify(questionBodies)}`);
  if (answerBodies.some((text) => !text)) throw new Error(`P1_02_VISIBLE_ANSWER_BODY_EMPTY:${JSON.stringify(answerBodies)}`);

  const relationWitnessCount = questionBodies.filter((text) => text.includes("○") || text.includes("相同／不同")).length;
  const decompositionWitnessCount = questionBodies.filter((text) => text.includes("+") && text.includes("×") && !text.includes("乘積")).length;
  const columnTraceWitnessCount = questionBodies.filter((text) => text.includes("乘積") && text.includes("個位")).length;
  if (relationWitnessCount < 1) throw new Error(`P1_02_C1_BROWSER_WITNESS_MISSING:${JSON.stringify(questionBodies)}`);
  if (decompositionWitnessCount < 1) throw new Error(`P1_02_C2_BROWSER_WITNESS_MISSING:${JSON.stringify(questionBodies)}`);
  if (columnTraceWitnessCount < 1) throw new Error(`P1_02_C3_BROWSER_WITNESS_MISSING:${JSON.stringify(questionBodies)}`);

  const html = await frame.content();
  const pdfPage = await browser.newPage();
  await pdfPage.setContent(html, { waitUntil: "networkidle" });
  const pdfPath = path.join(OUTPUT, "P1-02-public-cutover-v2-focused.pdf");
  await pdfPage.pdf({ path: pdfPath, format: "A4", printBackground: true, preferCSSPageSize: true });
  await pdfPage.close();
  if (!fs.existsSync(pdfPath) || fs.statSync(pdfPath).size < 1000) throw new Error("P1_02_FOCUSED_PDF_NOT_MATERIALIZED");

  if (consoleErrors.length > 0 || pageErrors.length > 0) {
    throw new Error(`P1_02_BROWSER_RUNTIME_ERRORS:${JSON.stringify({ consoleErrors, pageErrors })}`);
  }

  const report = {
    schemaName: "Path1P102PublicCutoverV2FocusedV1",
    status: "PASS",
    blockId: "P1-02",
    requestedQuestionCount: 8,
    visibleQuestionCount: questionCellCount,
    visibleAnswerCount: answerCellCount,
    relationWitnessCount,
    decompositionWitnessCount,
    columnTraceWitnessCount,
    consoleErrorCount: consoleErrors.length,
    pageErrorCount: pageErrors.length,
    pdfBytes: fs.statSync(pdfPath).size,
    p103Touched: false,
    p105Touched: false,
    globalReplay: false,
  };
  fs.writeFileSync(path.join(OUTPUT, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`PATH1_P1_02_PUBLIC_CUTOVER_V2_FOCUSED=${JSON.stringify(report)}`);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
