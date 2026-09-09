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
if (!port) throw new Error("PATH1_P107_PUBLIC_BROWSER_SERVER_PORT_UNAVAILABLE");
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
  invariant(await page.locator("#path1-block-select").inputValue() === "P1-01", "PATH1_P107_BROWSER_DEFAULT_BLOCK_MISMATCH");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "arithmetic", "PATH1_P107_BROWSER_DEFAULT_MODE_MISMATCH");

  await page.goto(`${baseUrl}/path1/?path1BlockId=P1-06&practiceMode=estimateTrialQuotient`, { waitUntil: "networkidle" });
  invariant(await page.locator("#path1-practice-mode").inputValue() === "estimateTrialQuotient", "PATH1_P107_BROWSER_P106_ESTIMATE_REGRESSION");
  await page.locator("#path1-question-count").fill("6");
  invariant((await waitForGenerated(page, 6)).length > 0, "PATH1_P107_BROWSER_P106_ESTIMATE_PREVIEW_EMPTY");

  await page.goto(`${baseUrl}/path1/?path1BlockId=P1-07&practiceMode=arithmetic`, { waitUntil: "networkidle" });
  const quotientState = await optionState(page, "quotientStartPlace");
  const estimateState = await optionState(page, "estimateTrialQuotient");
  const earlyModeState = await optionState(page, "equalGroupsTransfer");
  const multiplicativeState = await optionState(page, "multiplicativeModelingTransfer");
  invariant(!quotientState.disabled && !quotientState.hidden, "PATH1_P107_BROWSER_QUOTIENT_OPTION_NOT_AVAILABLE", quotientState);
  invariant(estimateState.disabled && estimateState.hidden, "PATH1_P107_BROWSER_ESTIMATE_SHOULD_BE_HIDDEN", estimateState);
  invariant(earlyModeState.disabled && earlyModeState.hidden, "PATH1_P107_BROWSER_EQUAL_GROUPS_SHOULD_BE_HIDDEN", earlyModeState);
  invariant(multiplicativeState.disabled && multiplicativeState.hidden, "PATH1_P107_BROWSER_MULTIPLICATIVE_SHOULD_BE_HIDDEN", multiplicativeState);
  await page.locator("#path1-question-count").fill("8");
  invariant((await waitForGenerated(page, 8)).length > 0, "PATH1_P107_BROWSER_ARITHMETIC_PREVIEW_EMPTY");

  await page.locator("#path1-practice-mode").selectOption("quotientStartPlace");
  await page.locator("#path1-question-count").fill("40");
  const quotientText = await waitForGenerated(page, 40);
  invariant(quotientText.length > 0, "PATH1_P107_BROWSER_QUOTIENT_PREVIEW_EMPTY");
  invariant((await page.locator("#path1-preview-meta").innerText()).includes("商的位值練習｜40 題｜含答案頁"), "PATH1_P107_BROWSER_PREVIEW_META_MISMATCH");
  invariant(!(await page.locator("#path1-print-button").isDisabled()), "PATH1_P107_BROWSER_PRINT_NOT_ENABLED");

  const semanticWitness = await page.evaluate(async () => {
    const mod = await import("/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js");
    const result = mod.buildPath1ManualWorksheet({
      blockId: "P1-07",
      practiceMode: "quotientStartPlace",
      questionCount: 120,
      generationSeed: "p107-browser-semantic-witness",
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
      patternSpecIds: [...new Set(questions.map((item) => item.patternSpecId))].sort(),
      caseIds: [...new Set(questions.map((item) => item.caseId))].sort(),
      distinctPrompts: new Set(questions.map((item) => item.prompt)).size,
      answerCount,
      divisorBoundaryOk: questions.every((item) => item.divisor >= 2 && item.divisor <= 9),
      exactDivisionOk: questions.every((item) => item.dividend % item.divisor === 0 && item.remainder === 0 && item.quotient === item.dividend / item.divisor),
      quotientZeroUsed: questions.some((item) => String(item.quotient).includes("0")),
      relationIds: [...new Set(questions.map((item) => item.relationId))],
      itemPublicCutoverFlags: [...new Set(questions.map((item) => item.metadata?.publicCutoverApplied))],
      twoDigitDivisorFlags: [...new Set(questions.map((item) => item.metadata?.twoDigitDivisorRepresentationUsed))],
      estimateFlags: [...new Set(questions.map((item) => item.metadata?.divisorEstimationUsed))],
      remainderContextFlags: [...new Set(questions.map((item) => item.metadata?.remainderContextInterpretationUsed))],
      wordProblemFlags: [...new Set(questions.map((item) => item.metadata?.wordProblemRelationUsed))],
    };
  });
  invariant(semanticWitness.ok === true, "PATH1_P107_BROWSER_SEMANTIC_WITNESS_BUILD_FAILED", semanticWitness);
  invariant(semanticWitness.gateId === "PATH1_P107_QUOTIENT_START_PLACE_PUBLIC_CUTOVER_V1", "PATH1_P107_BROWSER_GATE_ID_MISMATCH", semanticWitness);
  invariant(semanticWitness.knowledgePointIds.length === 2, "PATH1_P107_BROWSER_KP_COVERAGE_MISMATCH", semanticWitness);
  invariant(semanticWitness.patternSpecIds.length === 4, "PATH1_P107_BROWSER_PATTERN_COVERAGE_MISMATCH", semanticWitness);
  invariant(semanticWitness.caseIds.length === 4, "PATH1_P107_BROWSER_CASE_COVERAGE_MISMATCH", semanticWitness);
  invariant(semanticWitness.distinctPrompts === 120, "PATH1_P107_BROWSER_DISTINCT_PROMPT_MISMATCH", semanticWitness);
  invariant(semanticWitness.answerCount === 120, "PATH1_P107_BROWSER_ANSWER_COUNT_MISMATCH", semanticWitness);
  invariant(semanticWitness.divisorBoundaryOk === true, "PATH1_P107_BROWSER_DIVISOR_BOUNDARY_FAILED", semanticWitness);
  invariant(semanticWitness.exactDivisionOk === true, "PATH1_P107_BROWSER_EXACT_DIVISION_FAILED", semanticWitness);
  invariant(semanticWitness.quotientZeroUsed === false, "PATH1_P107_BROWSER_QUOTIENT_ZERO_LEAK", semanticWitness);
  invariant(JSON.stringify(semanticWitness.relationIds) === JSON.stringify([null]), "PATH1_P107_BROWSER_RELATION_LEAK", semanticWitness);
  invariant(JSON.stringify(semanticWitness.itemPublicCutoverFlags) === JSON.stringify([false]), "PATH1_P107_BROWSER_ITEM_METADATA_MUTATED", semanticWitness);
  invariant(JSON.stringify(semanticWitness.twoDigitDivisorFlags) === JSON.stringify([false]), "PATH1_P107_BROWSER_TWO_DIGIT_DIVISOR_LEAK", semanticWitness);
  invariant(JSON.stringify(semanticWitness.estimateFlags) === JSON.stringify([false]), "PATH1_P107_BROWSER_ESTIMATE_LEAK", semanticWitness);
  invariant(JSON.stringify(semanticWitness.remainderContextFlags) === JSON.stringify([false]), "PATH1_P107_BROWSER_REMAINDER_CONTEXT_LEAK", semanticWitness);
  invariant(JSON.stringify(semanticWitness.wordProblemFlags) === JSON.stringify([false]), "PATH1_P107_BROWSER_WORD_PROBLEM_LEAK", semanticWitness);

  await page.evaluate(() => {
    const frame = document.getElementById("path1-preview-frame");
    frame.contentWindow.print = () => {
      window.__path1P107PrintSnapshot = frame.contentDocument.body.innerText;
    };
  });
  await page.locator("#path1-print-button").click();
  const printSnapshot = await page.evaluate(() => window.__path1P107PrintSnapshot ?? "");
  invariant(printSnapshot === quotientText, "PATH1_P107_BROWSER_PREVIEW_PRINT_PARITY_FAILED");

  await page.goto(`${baseUrl}/path1/?path1BlockId=P1-07&practiceMode=quotientStartPlace`, { waitUntil: "networkidle" });
  invariant(await page.locator("#path1-block-select").inputValue() === "P1-07", "PATH1_P107_BROWSER_DEEPLINK_BLOCK_FAILED");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "quotientStartPlace", "PATH1_P107_BROWSER_DEEPLINK_MODE_FAILED");
  await page.reload({ waitUntil: "networkidle" });
  invariant(await page.locator("#path1-practice-mode").inputValue() === "quotientStartPlace", "PATH1_P107_BROWSER_REFRESH_MODE_FAILED");

  for (const blockId of ["P1-06", "P1-08"]) {
    await page.goto(`${baseUrl}/path1/?path1BlockId=${blockId}&practiceMode=quotientStartPlace`, { waitUntil: "networkidle" });
    invariant(await page.locator("#path1-practice-mode").inputValue() === "arithmetic", "PATH1_P107_BROWSER_UNSUPPORTED_BLOCK_NOT_NORMALIZED", { blockId });
    invariant(new URL(page.url()).searchParams.get("practiceMode") === "arithmetic", "PATH1_P107_BROWSER_UNSUPPORTED_QUERY_NOT_NORMALIZED", { blockId });
    invariant((await page.locator("#path1-status-panel").innerText()).includes("已切回算式練習"), "PATH1_P107_BROWSER_UNSUPPORTED_WARNING_MISSING", { blockId });
  }

  for (const blockId of ["P1-01", "P1-02"]) {
    await page.goto(`${baseUrl}/path1/?path1BlockId=${blockId}&practiceMode=equalGroupsTransfer`, { waitUntil: "networkidle" });
    invariant(await page.locator("#path1-practice-mode").inputValue() === "equalGroupsTransfer", "PATH1_P107_BROWSER_EQUAL_GROUPS_RESTORE_FAILED", { blockId });
  }
  for (const blockId of ["P1-03", "P1-04", "P1-05"]) {
    await page.goto(`${baseUrl}/path1/?path1BlockId=${blockId}&practiceMode=multiplicativeModelingTransfer`, { waitUntil: "networkidle" });
    invariant(await page.locator("#path1-practice-mode").inputValue() === "multiplicativeModelingTransfer", "PATH1_P107_BROWSER_MULTIPLICATIVE_RESTORE_FAILED", { blockId });
  }

  invariant(pageErrors.length === 0, "PATH1_P107_BROWSER_PAGE_ERROR", { pageErrors });
  invariant(consoleErrors.length === 0, "PATH1_P107_BROWSER_CONSOLE_ERROR", { consoleErrors });

  process.stdout.write(`${JSON.stringify({
    schemaName: "Path1P107QuotientStartPlacePublicCutoverBrowserV1",
    status: "PASS",
    page: "/path1/",
    defaultRoute: "P1-01/arithmetic",
    p106EstimatePreserved: true,
    p107ArithmeticGenerated: 8,
    p107QuotientStartPlaceGenerated: 40,
    p107SemanticWitnessCount: 120,
    p107DeepLinkRefresh: true,
    unsupportedQuotientStartPlaceNormalization: ["P1-06", "P1-08"],
    p107GateId: semanticWitness.gateId,
    p107KnowledgePointIds: semanticWitness.knowledgePointIds,
    p107PatternSpecIds: semanticWitness.patternSpecIds,
    p107CaseIds: semanticWitness.caseIds,
    p107OneDigitExactBoundaryPreserved: semanticWitness.divisorBoundaryOk && semanticWitness.exactDivisionOk && !semanticWitness.quotientZeroUsed,
    earlyEqualGroupsTransferBlocksPreserved: ["P1-01", "P1-02"],
    multiplicativeModelingBlocksPreserved: ["P1-03", "P1-04", "P1-05"],
    previewPrintParity: true,
    pageErrors,
    consoleErrors,
  }, null, 2)}\n`);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
