import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..", "site");
const MIME = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
]);

function createStaticServer() {
  return http.createServer((request, response) => {
    try {
      const url = new URL(request.url ?? "/", "http://127.0.0.1");
      let pathname = decodeURIComponent(url.pathname);
      if (pathname.endsWith("/")) pathname += "index.html";
      const target = path.resolve(ROOT, `.${pathname}`);
      if (!target.startsWith(`${ROOT}${path.sep}`) && target !== ROOT) {
        response.writeHead(403).end("Forbidden");
        return;
      }
      if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
        response.writeHead(404).end("Not found");
        return;
      }
      response.writeHead(200, {
        "content-type": MIME.get(path.extname(target)) ?? "application/octet-stream",
        "cache-control": "no-store",
      });
      fs.createReadStream(target).pipe(response);
    } catch (error) {
      response.writeHead(500).end(String(error?.message ?? error));
    }
  });
}

function invariant(condition, code, details = {}) {
  if (condition) return;
  const error = new Error(code);
  error.details = details;
  throw error;
}

function occurrences(text, needle) {
  return String(text).split(needle).length - 1;
}

async function waitForGenerated(page, count) {
  await page.locator("#path1-generate-button").click();
  await page.locator("#path1-status-panel").filter({ hasText: `已產生 ${count} 題` }).waitFor({ timeout: 20000 });
  const frameBody = page.frameLocator("#path1-preview-frame").locator("body");
  await frameBody.waitFor({ timeout: 20000 });
  return frameBody.innerText();
}

async function optionState(page, value) {
  return page.locator(`#path1-practice-mode option[value="${value}"]`).evaluate((option) => ({
    disabled: option.disabled,
    hidden: option.hidden,
  }));
}

const server = createStaticServer();
await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolve);
});
const address = server.address();
const port = typeof address === "object" && address ? address.port : null;
if (!port) throw new Error("PATH1_P104_PUBLIC_BROWSER_SERVER_PORT_UNAVAILABLE");
const baseUrl = `http://127.0.0.1:${port}`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const pageErrors = [];
const consoleErrors = [];
page.on("pageerror", (error) => pageErrors.push(String(error?.message ?? error)));
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});

try {
  await page.goto(`${baseUrl}/path1/`, { waitUntil: "networkidle" });
  invariant(await page.locator("#path1-block-select").inputValue() === "P1-01", "PATH1_P104_BROWSER_DEFAULT_BLOCK_MISMATCH");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "arithmetic", "PATH1_P104_BROWSER_DEFAULT_MODE_MISMATCH");

  await page.locator("#path1-block-select").selectOption("P1-03");
  const p103ModeState = await optionState(page, "multiplicativeModelingTransfer");
  invariant(!p103ModeState.disabled && !p103ModeState.hidden, "PATH1_P104_BROWSER_P103_MODELING_OPTION_NOT_AVAILABLE", p103ModeState);
  await page.locator("#path1-practice-mode").selectOption("multiplicativeModelingTransfer");
  await page.locator("#path1-question-count").fill("6");
  const p103Text = await waitForGenerated(page, 6);
  invariant(occurrences(p103Text, "答：") === 6, "PATH1_P104_BROWSER_P103_PRESERVATION_FAILED");

  await page.locator("#path1-block-select").selectOption("P1-04");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "multiplicativeModelingTransfer", "PATH1_P104_BROWSER_P103_TO_P104_MODE_NOT_RETAINED");
  invariant(new URL(page.url()).searchParams.get("practiceMode") === "multiplicativeModelingTransfer", "PATH1_P104_BROWSER_P104_QUERY_NOT_RETAINED");
  const p104ModeState = await optionState(page, "multiplicativeModelingTransfer");
  const earlyModeOnP104 = await optionState(page, "equalGroupsTransfer");
  invariant(!p104ModeState.disabled && !p104ModeState.hidden, "PATH1_P104_BROWSER_MODELING_OPTION_NOT_AVAILABLE", p104ModeState);
  invariant(earlyModeOnP104.disabled && earlyModeOnP104.hidden, "PATH1_P104_BROWSER_EARLY_MODE_SHOULD_BE_HIDDEN", earlyModeOnP104);

  await page.locator("#path1-practice-mode").selectOption("arithmetic");
  await page.locator("#path1-question-count").fill("8");
  const arithmeticText = await waitForGenerated(page, 8);
  invariant(arithmeticText.length > 0, "PATH1_P104_BROWSER_ARITHMETIC_PREVIEW_EMPTY");

  await page.locator("#path1-practice-mode").selectOption("multiplicativeModelingTransfer");
  await page.locator("#path1-question-count").fill("40");
  const modelingText = await waitForGenerated(page, 40);
  invariant(occurrences(modelingText, "答：") === 40, "PATH1_P104_BROWSER_ANSWER_COUNT_MISMATCH", {
    actual: occurrences(modelingText, "答："),
  });
  invariant(modelingText.includes(" × "), "PATH1_P104_BROWSER_EQUATION_NOT_RENDERED");
  invariant((await page.locator("#path1-preview-meta").innerText()).includes("文字建模練習｜40 題｜含答案頁"), "PATH1_P104_BROWSER_PREVIEW_META_MISMATCH");
  invariant(!(await page.locator("#path1-print-button").isDisabled()), "PATH1_P104_BROWSER_PRINT_NOT_ENABLED");

  const semanticWitness = await page.evaluate(async () => {
    const mod = await import("/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js");
    const result = mod.buildPath1ManualWorksheet({
      blockId: "P1-04",
      practiceMode: "multiplicativeModelingTransfer",
      questionCount: 40,
      generationSeed: "p104-browser-semantic-witness",
      includeAnswerKey: true,
    });
    const questions = result.worksheetDocument?.questions ?? [];
    return {
      ok: result.ok,
      gateId: result.worksheetDocument?.configSnapshot?.metadata?.publicCutoverGateId ?? null,
      forms: [...new Set(questions.map((item) => item.arithmeticFormId))].sort(),
      knowledgePointIds: [...new Set(questions.map((item) => item.knowledgePointId))].sort(),
      distinctPrompts: new Set(questions.map((item) => item.prompt)).size,
    };
  });
  invariant(semanticWitness.ok === true, "PATH1_P104_BROWSER_SEMANTIC_WITNESS_BUILD_FAILED", semanticWitness);
  invariant(semanticWitness.gateId === "PATH1_P104_MULTIPLICATIVE_MODELING_PUBLIC_CUTOVER_V1", "PATH1_P104_BROWSER_GATE_ID_MISMATCH", semanticWitness);
  invariant(JSON.stringify(semanticWitness.forms) === JSON.stringify(["P104_2D_BY_3D", "P104_3D_BY_2D"]), "PATH1_P104_BROWSER_FORM_COVERAGE_MISMATCH", semanticWitness);
  invariant(semanticWitness.knowledgePointIds.every((id) => ["kp_g4a_u02_2digit_by_3digit", "kp_g4a_u02_3digit_by_2digit"].includes(id)), "PATH1_P104_BROWSER_MODELING_KP_SCOPE_LEAK", semanticWitness);
  invariant(!semanticWitness.knowledgePointIds.includes("kp_g4b_u01_3digit_by_3digit") && !semanticWitness.knowledgePointIds.includes("kp_g4b_u01_4digit_by_3digit"), "PATH1_P104_BROWSER_G4BU01_MODELING_SCOPE_LEAK", semanticWitness);
  invariant(semanticWitness.distinctPrompts === 40, "PATH1_P104_BROWSER_DISTINCT_PROMPT_MISMATCH", semanticWitness);

  await page.evaluate(() => {
    const frame = document.getElementById("path1-preview-frame");
    frame.contentWindow.print = () => {
      window.__path1P104PrintSnapshot = frame.contentDocument.body.innerText;
    };
  });
  await page.locator("#path1-print-button").click();
  const printSnapshot = await page.evaluate(() => window.__path1P104PrintSnapshot ?? "");
  invariant(printSnapshot === modelingText, "PATH1_P104_BROWSER_PREVIEW_PRINT_PARITY_FAILED");
  invariant(occurrences(printSnapshot, "答：") === 40, "PATH1_P104_BROWSER_PRINT_ANSWER_COUNT_MISMATCH");

  await page.goto(`${baseUrl}/path1/?path1BlockId=P1-04&practiceMode=multiplicativeModelingTransfer`, { waitUntil: "networkidle" });
  invariant(await page.locator("#path1-block-select").inputValue() === "P1-04", "PATH1_P104_BROWSER_DEEPLINK_BLOCK_FAILED");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "multiplicativeModelingTransfer", "PATH1_P104_BROWSER_DEEPLINK_MODE_FAILED");
  await page.reload({ waitUntil: "networkidle" });
  invariant(await page.locator("#path1-block-select").inputValue() === "P1-04", "PATH1_P104_BROWSER_REFRESH_BLOCK_FAILED");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "multiplicativeModelingTransfer", "PATH1_P104_BROWSER_REFRESH_MODE_FAILED");

  await page.locator("#path1-block-select").selectOption("P1-03");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "multiplicativeModelingTransfer", "PATH1_P104_BROWSER_P104_TO_P103_MODE_NOT_RETAINED");
  await page.locator("#path1-block-select").selectOption("P1-04");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "multiplicativeModelingTransfer", "PATH1_P104_BROWSER_P103_TO_P104_SECOND_RETENTION_FAILED");

  await page.locator("#path1-block-select").selectOption("P1-05");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "arithmetic", "PATH1_P104_BROWSER_P105_NOT_NORMALIZED");
  invariant(new URL(page.url()).searchParams.get("practiceMode") === "arithmetic", "PATH1_P104_BROWSER_P105_QUERY_NOT_NORMALIZED");
  invariant((await page.locator("#path1-status-panel").innerText()).includes("已切回算式練習"), "PATH1_P104_BROWSER_P105_WARNING_MISSING");

  for (const blockId of ["P1-01", "P1-02"]) {
    await page.goto(`${baseUrl}/path1/?path1BlockId=${blockId}&practiceMode=equalGroupsTransfer`, { waitUntil: "networkidle" });
    invariant(await page.locator("#path1-practice-mode").inputValue() === "equalGroupsTransfer", "PATH1_P104_BROWSER_EARLY_TRANSFER_RESTORE_FAILED", { blockId });
    const modelingState = await optionState(page, "multiplicativeModelingTransfer");
    invariant(modelingState.disabled && modelingState.hidden, "PATH1_P104_BROWSER_MODELING_MODE_SHOULD_BE_HIDDEN_ON_EARLY_BLOCK", { blockId, modelingState });
    await page.locator("#path1-question-count").fill("6");
    const text = await waitForGenerated(page, 6);
    invariant(occurrences(text, "答：") === 6, "PATH1_P104_BROWSER_EARLY_TRANSFER_ANSWER_COUNT_MISMATCH", { blockId });
  }

  invariant(pageErrors.length === 0, "PATH1_P104_BROWSER_PAGE_ERROR", { pageErrors });
  invariant(consoleErrors.length === 0, "PATH1_P104_BROWSER_CONSOLE_ERROR", { consoleErrors });

  process.stdout.write(`${JSON.stringify({
    schemaName: "Path1WordProblemP104MultiplicativeModelingPublicCutoverBrowserV1",
    status: "PASS",
    page: "/path1/",
    defaultRoute: "P1-01/arithmetic",
    p103ModelingPreserved: 6,
    p104ArithmeticGenerated: 8,
    p104ModelingGenerated: 40,
    p104ModelingAnswers: 40,
    p104DeepLinkRefresh: true,
    p103P104ModeCarryover: true,
    p105SafeNormalization: true,
    p104GateId: semanticWitness.gateId,
    p104ArithmeticForms: semanticWitness.forms,
    p104ModelingKnowledgePointIds: semanticWitness.knowledgePointIds,
    earlyEqualGroupsTransferBlocksPreserved: ["P1-01", "P1-02"],
    previewPrintParity: true,
    pageErrors,
    consoleErrors,
  }, null, 2)}\n`);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
