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
if (!port) throw new Error("PATH1_P105_PUBLIC_BROWSER_SERVER_PORT_UNAVAILABLE");
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
  invariant(await page.locator("#path1-block-select").inputValue() === "P1-01", "PATH1_P105_BROWSER_DEFAULT_BLOCK_MISMATCH");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "arithmetic", "PATH1_P105_BROWSER_DEFAULT_MODE_MISMATCH");

  for (const blockId of ["P1-03", "P1-04"]) {
    await page.goto(`${baseUrl}/path1/?path1BlockId=${blockId}&practiceMode=multiplicativeModelingTransfer`, { waitUntil: "networkidle" });
    invariant(await page.locator("#path1-practice-mode").inputValue() === "multiplicativeModelingTransfer", "PATH1_P105_BROWSER_PRIOR_MODELING_MODE_REGRESSION", { blockId });
    await page.locator("#path1-question-count").fill("6");
    const text = await waitForGenerated(page, 6);
    invariant(occurrences(text, "答：") === 6, "PATH1_P105_BROWSER_PRIOR_MODELING_ANSWER_COUNT_MISMATCH", { blockId });
  }

  await page.goto(`${baseUrl}/path1/?path1BlockId=P1-05&practiceMode=arithmetic`, { waitUntil: "networkidle" });
  const p105ModeState = await optionState(page, "multiplicativeModelingTransfer");
  const earlyModeState = await optionState(page, "equalGroupsTransfer");
  invariant(!p105ModeState.disabled && !p105ModeState.hidden, "PATH1_P105_BROWSER_MODELING_OPTION_NOT_AVAILABLE", p105ModeState);
  invariant(earlyModeState.disabled && earlyModeState.hidden, "PATH1_P105_BROWSER_EARLY_MODE_SHOULD_BE_HIDDEN", earlyModeState);
  await page.locator("#path1-question-count").fill("8");
  const arithmeticText = await waitForGenerated(page, 8);
  invariant(arithmeticText.length > 0, "PATH1_P105_BROWSER_ARITHMETIC_PREVIEW_EMPTY");

  await page.locator("#path1-practice-mode").selectOption("multiplicativeModelingTransfer");
  await page.locator("#path1-question-count").fill("40");
  const modelingText = await waitForGenerated(page, 40);
  invariant(occurrences(modelingText, "答：") === 40, "PATH1_P105_BROWSER_ANSWER_COUNT_MISMATCH", {
    actual: occurrences(modelingText, "答："),
  });
  invariant(modelingText.includes(" × "), "PATH1_P105_BROWSER_EQUATION_NOT_RENDERED");
  invariant((await page.locator("#path1-preview-meta").innerText()).includes("文字建模練習｜40 題｜含答案頁"), "PATH1_P105_BROWSER_PREVIEW_META_MISMATCH");
  invariant(!(await page.locator("#path1-print-button").isDisabled()), "PATH1_P105_BROWSER_PRINT_NOT_ENABLED");

  const semanticWitness = await page.evaluate(async () => {
    const mod = await import("/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js");
    const result = mod.buildPath1ManualWorksheet({
      blockId: "P1-05",
      practiceMode: "multiplicativeModelingTransfer",
      questionCount: 40,
      generationSeed: "p105-browser-semantic-witness",
      includeAnswerKey: true,
    });
    const questions = result.worksheetDocument?.questions ?? [];
    const answerCount = (result.worksheetDocument?.answerKeyPages ?? [])
      .flatMap((pageEntry) => pageEntry.cells ?? [])
      .filter((cell) => cell.cellType === "answerKey").length;
    return {
      ok: result.ok,
      gateId: result.worksheetDocument?.configSnapshot?.metadata?.publicCutoverGateId ?? null,
      knowledgePointIds: [...new Set(questions.map((item) => item.knowledgePointId))].sort(),
      arithmeticKnowledgePointIds: [...new Set(questions.map((item) => item.arithmeticKnowledgePointId))].sort(),
      patternSpecIds: [...new Set(questions.map((item) => item.patternSpecId))].sort(),
      distinctPrompts: new Set(questions.map((item) => item.prompt)).size,
      answerCount,
      zeroMiddleOk: questions.every((item) => Math.floor(item.amountPerGroup / 10) % 10 === 0 && item.amountPerGroup % 10 !== 0),
      includesAbove999: questions.some((item) => item.totalAmount > 999),
      itemPublicCutoverFlags: [...new Set(questions.map((item) => item.metadata?.publicCutoverApplied))],
      itemG4bExpansionFlags: [...new Set(questions.map((item) => item.metadata?.g4bU01ModelingExpanded))],
    };
  });
  invariant(semanticWitness.ok === true, "PATH1_P105_BROWSER_SEMANTIC_WITNESS_BUILD_FAILED", semanticWitness);
  invariant(semanticWitness.gateId === "PATH1_P105_MULTIPLICATIVE_MODELING_PUBLIC_CUTOVER_V1", "PATH1_P105_BROWSER_GATE_ID_MISMATCH", semanticWitness);
  invariant(JSON.stringify(semanticWitness.knowledgePointIds) === JSON.stringify(["kp_g3a_u03_3digit_zero_middle_by_1digit"]), "PATH1_P105_BROWSER_MODELING_KP_SCOPE_LEAK", semanticWitness);
  invariant(JSON.stringify(semanticWitness.arithmeticKnowledgePointIds) === JSON.stringify(["kp_g3a_u03_3digit_zero_middle_by_1digit"]), "PATH1_P105_BROWSER_ARITHMETIC_KP_SCOPE_LEAK", semanticWitness);
  invariant(!semanticWitness.knowledgePointIds.includes("kp_g4b_u01_multiplier_internal_zero") && !semanticWitness.knowledgePointIds.includes("kp_g4b_u01_trailing_zero_multiplication"), "PATH1_P105_BROWSER_G4BU01_MODELING_SCOPE_LEAK", semanticWitness);
  invariant(semanticWitness.patternSpecIds.length === 4, "PATH1_P105_BROWSER_PATTERN_COVERAGE_MISMATCH", semanticWitness);
  invariant(semanticWitness.distinctPrompts === 40, "PATH1_P105_BROWSER_DISTINCT_PROMPT_MISMATCH", semanticWitness);
  invariant(semanticWitness.answerCount === 40, "PATH1_P105_BROWSER_DIRECT_ANSWER_COUNT_MISMATCH", semanticWitness);
  invariant(semanticWitness.zeroMiddleOk === true, "PATH1_P105_BROWSER_ZERO_MIDDLE_SHAPE_FAILED", semanticWitness);
  invariant(semanticWitness.includesAbove999 === true, "PATH1_P105_BROWSER_LOCAL_ENVELOPE_NOT_WITNESSED", semanticWitness);
  invariant(JSON.stringify(semanticWitness.itemPublicCutoverFlags) === JSON.stringify([false]), "PATH1_P105_BROWSER_ITEM_SEMANTIC_METADATA_MUTATED", semanticWitness);
  invariant(JSON.stringify(semanticWitness.itemG4bExpansionFlags) === JSON.stringify([false]), "PATH1_P105_BROWSER_G4BU01_EXPANSION_LEAK", semanticWitness);

  await page.evaluate(() => {
    const frame = document.getElementById("path1-preview-frame");
    frame.contentWindow.print = () => {
      window.__path1P105PrintSnapshot = frame.contentDocument.body.innerText;
    };
  });
  await page.locator("#path1-print-button").click();
  const printSnapshot = await page.evaluate(() => window.__path1P105PrintSnapshot ?? "");
  invariant(printSnapshot === modelingText, "PATH1_P105_BROWSER_PREVIEW_PRINT_PARITY_FAILED");
  invariant(occurrences(printSnapshot, "答：") === 40, "PATH1_P105_BROWSER_PRINT_ANSWER_COUNT_MISMATCH");

  await page.goto(`${baseUrl}/path1/?path1BlockId=P1-05&practiceMode=multiplicativeModelingTransfer`, { waitUntil: "networkidle" });
  invariant(await page.locator("#path1-block-select").inputValue() === "P1-05", "PATH1_P105_BROWSER_DEEPLINK_BLOCK_FAILED");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "multiplicativeModelingTransfer", "PATH1_P105_BROWSER_DEEPLINK_MODE_FAILED");
  await page.reload({ waitUntil: "networkidle" });
  invariant(await page.locator("#path1-block-select").inputValue() === "P1-05", "PATH1_P105_BROWSER_REFRESH_BLOCK_FAILED");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "multiplicativeModelingTransfer", "PATH1_P105_BROWSER_REFRESH_MODE_FAILED");

  for (const blockId of ["P1-04", "P1-03", "P1-04", "P1-05"]) {
    await page.locator("#path1-block-select").selectOption(blockId);
    invariant(await page.locator("#path1-practice-mode").inputValue() === "multiplicativeModelingTransfer", "PATH1_P105_BROWSER_CROSS_BLOCK_MODE_NOT_RETAINED", { blockId });
  }

  await page.locator("#path1-block-select").selectOption("P1-06");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "arithmetic", "PATH1_P105_BROWSER_P106_NOT_NORMALIZED");
  invariant(new URL(page.url()).searchParams.get("practiceMode") === "arithmetic", "PATH1_P105_BROWSER_P106_QUERY_NOT_NORMALIZED");
  invariant((await page.locator("#path1-status-panel").innerText()).includes("已切回算式練習"), "PATH1_P105_BROWSER_P106_WARNING_MISSING");

  for (const blockId of ["P1-01", "P1-02"]) {
    await page.goto(`${baseUrl}/path1/?path1BlockId=${blockId}&practiceMode=equalGroupsTransfer`, { waitUntil: "networkidle" });
    invariant(await page.locator("#path1-practice-mode").inputValue() === "equalGroupsTransfer", "PATH1_P105_BROWSER_EARLY_TRANSFER_RESTORE_FAILED", { blockId });
    const modelingState = await optionState(page, "multiplicativeModelingTransfer");
    invariant(modelingState.disabled && modelingState.hidden, "PATH1_P105_BROWSER_MODELING_MODE_SHOULD_BE_HIDDEN_ON_EARLY_BLOCK", { blockId, modelingState });
    await page.locator("#path1-question-count").fill("6");
    const text = await waitForGenerated(page, 6);
    invariant(occurrences(text, "答：") === 6, "PATH1_P105_BROWSER_EARLY_TRANSFER_ANSWER_COUNT_MISMATCH", { blockId });
  }

  invariant(pageErrors.length === 0, "PATH1_P105_BROWSER_PAGE_ERROR", { pageErrors });
  invariant(consoleErrors.length === 0, "PATH1_P105_BROWSER_CONSOLE_ERROR", { consoleErrors });

  process.stdout.write(`${JSON.stringify({
    schemaName: "Path1WordProblemP105MultiplicativeModelingPublicCutoverBrowserV1",
    status: "PASS",
    page: "/path1/",
    defaultRoute: "P1-01/arithmetic",
    p103P104ModelingPreserved: true,
    p105ArithmeticGenerated: 8,
    p105ModelingGenerated: 40,
    p105ModelingAnswers: 40,
    p105DeepLinkRefresh: true,
    p103P104P105ModeCarryover: true,
    p106SafeNormalization: true,
    p105GateId: semanticWitness.gateId,
    p105ModelingKnowledgePointIds: semanticWitness.knowledgePointIds,
    p105PatternSpecIds: semanticWitness.patternSpecIds,
    p105ZeroMiddleShape: semanticWitness.zeroMiddleOk,
    p105IncludesTotalAbove999: semanticWitness.includesAbove999,
    earlyEqualGroupsTransferBlocksPreserved: ["P1-01", "P1-02"],
    previewPrintParity: true,
    pageErrors,
    consoleErrors,
  }, null, 2)}\n`);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
