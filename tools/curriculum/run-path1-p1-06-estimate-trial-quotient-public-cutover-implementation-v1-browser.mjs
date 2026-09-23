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
if (!port) throw new Error("PATH1_P106_PUBLIC_BROWSER_SERVER_PORT_UNAVAILABLE");
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
  invariant(await page.locator("#path1-block-select").inputValue() === "P1-01", "PATH1_P106_BROWSER_DEFAULT_BLOCK_MISMATCH");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "arithmetic", "PATH1_P106_BROWSER_DEFAULT_MODE_MISMATCH");

  await page.goto(`${baseUrl}/path1/?path1BlockId=P1-05&practiceMode=multiplicativeModelingTransfer`, { waitUntil: "networkidle" });
  invariant(await page.locator("#path1-practice-mode").inputValue() === "multiplicativeModelingTransfer", "PATH1_P106_BROWSER_P105_MODELING_REGRESSION");
  await page.locator("#path1-question-count").fill("6");
  invariant((await waitForGenerated(page, 6)).length > 0, "PATH1_P106_BROWSER_P105_MODELING_PREVIEW_EMPTY");

  await page.goto(`${baseUrl}/path1/?path1BlockId=P1-06&practiceMode=arithmetic`, { waitUntil: "networkidle" });
  const estimateState = await optionState(page, "estimateTrialQuotient");
  const earlyModeState = await optionState(page, "equalGroupsTransfer");
  const multiplicativeState = await optionState(page, "multiplicativeModelingTransfer");
  invariant(!estimateState.disabled && !estimateState.hidden, "PATH1_P106_BROWSER_ESTIMATE_OPTION_NOT_AVAILABLE", estimateState);
  invariant(earlyModeState.disabled && earlyModeState.hidden, "PATH1_P106_BROWSER_EQUAL_GROUPS_SHOULD_BE_HIDDEN", earlyModeState);
  invariant(multiplicativeState.disabled && multiplicativeState.hidden, "PATH1_P106_BROWSER_MULTIPLICATIVE_SHOULD_BE_HIDDEN", multiplicativeState);
  await page.locator("#path1-question-count").fill("8");
  invariant((await waitForGenerated(page, 8)).length > 0, "PATH1_P106_BROWSER_ARITHMETIC_PREVIEW_EMPTY");

  await page.locator("#path1-practice-mode").selectOption("estimateTrialQuotient");
  await page.locator("#path1-question-count").fill("40");
  const estimateText = await waitForGenerated(page, 40);
  invariant(estimateText.length > 0, "PATH1_P106_BROWSER_ESTIMATE_PREVIEW_EMPTY");
  invariant((await page.locator("#path1-preview-meta").innerText()).includes("估商與試商練習｜40 題｜含答案頁"), "PATH1_P106_BROWSER_PREVIEW_META_MISMATCH");
  invariant(!(await page.locator("#path1-print-button").isDisabled()), "PATH1_P106_BROWSER_PRINT_NOT_ENABLED");

  const semanticWitness = await page.evaluate(async () => {
    const mod = await import("/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js");
    const result = mod.buildPath1ManualWorksheet({
      blockId: "P1-06",
      practiceMode: "estimateTrialQuotient",
      questionCount: 120,
      generationSeed: "p106-browser-semantic-witness",
      includeAnswerKey: true,
    });
    const questions = result.worksheetDocument?.questions ?? [];
    const answerCount = (result.worksheetDocument?.answerKeyPages ?? [])
      .flatMap((pageEntry) => pageEntry.cells ?? [])
      .filter((cell) => cell.cellType === "answerKey").length;
    const anchors = new Set(questions.map((item) => `${item.divisor}->${item.estimateDivisor}`));
    return {
      ok: result.ok,
      gateId: result.worksheetDocument?.configSnapshot?.metadata?.publicCutoverGateId ?? null,
      knowledgePointIds: [...new Set(questions.map((item) => item.knowledgePointId))].sort(),
      patternSpecIds: [...new Set(questions.map((item) => item.patternSpecId))].sort(),
      distinctPrompts: new Set(questions.map((item) => item.prompt)).size,
      answerCount,
      allowedEndingsOnly: questions.every((item) => [1, 2, 3, 4, 6, 7, 8, 9].includes(item.divisor % 10)),
      endingFiveUsed: questions.some((item) => item.divisor % 10 === 5),
      endingZeroUsed: questions.some((item) => item.divisor % 10 === 0),
      anchorsPresent: ["11->10", "38->40", "47->50", "92->90"].every((anchor) => anchors.has(anchor)),
      exactDivisionOk: questions.every((item) => item.divisor * item.quotient + item.remainder === item.dividend && item.remainder >= 0 && item.remainder < item.divisor),
      relationIds: [...new Set(questions.map((item) => item.relationId))],
      itemPublicCutoverFlags: [...new Set(questions.map((item) => item.metadata?.publicCutoverApplied))],
      quotientPlaceFlags: [...new Set(questions.map((item) => item.metadata?.quotientPlaceTeachingUsed))],
      remainderContextFlags: [...new Set(questions.map((item) => item.metadata?.remainderContextInterpretationUsed))],
    };
  });
  invariant(semanticWitness.ok === true, "PATH1_P106_BROWSER_SEMANTIC_WITNESS_BUILD_FAILED", semanticWitness);
  invariant(semanticWitness.gateId === "PATH1_P106_ESTIMATE_TRIAL_QUOTIENT_PUBLIC_CUTOVER_V1", "PATH1_P106_BROWSER_GATE_ID_MISMATCH", semanticWitness);
  invariant(semanticWitness.knowledgePointIds.length === 2, "PATH1_P106_BROWSER_KP_COVERAGE_MISMATCH", semanticWitness);
  invariant(semanticWitness.patternSpecIds.length === 4, "PATH1_P106_BROWSER_PATTERN_COVERAGE_MISMATCH", semanticWitness);
  invariant(semanticWitness.distinctPrompts === 120, "PATH1_P106_BROWSER_DISTINCT_PROMPT_MISMATCH", semanticWitness);
  invariant(semanticWitness.answerCount === 120, "PATH1_P106_BROWSER_ANSWER_COUNT_MISMATCH", semanticWitness);
  invariant(semanticWitness.allowedEndingsOnly === true && semanticWitness.endingFiveUsed === false && semanticWitness.endingZeroUsed === false, "PATH1_P106_BROWSER_ESTIMATE_ENDING_BOUNDARY_FAILED", semanticWitness);
  invariant(semanticWitness.anchorsPresent === true, "PATH1_P106_BROWSER_SOURCE_ANCHORS_MISSING", semanticWitness);
  invariant(semanticWitness.exactDivisionOk === true, "PATH1_P106_BROWSER_DIVISION_INVARIANT_FAILED", semanticWitness);
  invariant(JSON.stringify(semanticWitness.relationIds) === JSON.stringify([null]), "PATH1_P106_BROWSER_RELATION_LEAK", semanticWitness);
  invariant(JSON.stringify(semanticWitness.itemPublicCutoverFlags) === JSON.stringify([false]), "PATH1_P106_BROWSER_ITEM_METADATA_MUTATED", semanticWitness);
  invariant(JSON.stringify(semanticWitness.quotientPlaceFlags) === JSON.stringify([false]), "PATH1_P106_BROWSER_QUOTIENT_PLACE_LEAK", semanticWitness);
  invariant(JSON.stringify(semanticWitness.remainderContextFlags) === JSON.stringify([false]), "PATH1_P106_BROWSER_REMAINDER_CONTEXT_LEAK", semanticWitness);

  await page.evaluate(() => {
    const frame = document.getElementById("path1-preview-frame");
    frame.contentWindow.print = () => {
      window.__path1P106PrintSnapshot = frame.contentDocument.body.innerText;
    };
  });
  await page.locator("#path1-print-button").click();
  const printSnapshot = await page.evaluate(() => window.__path1P106PrintSnapshot ?? "");
  invariant(printSnapshot === estimateText, "PATH1_P106_BROWSER_PREVIEW_PRINT_PARITY_FAILED");

  await page.goto(`${baseUrl}/path1/?path1BlockId=P1-06&practiceMode=estimateTrialQuotient`, { waitUntil: "networkidle" });
  invariant(await page.locator("#path1-block-select").inputValue() === "P1-06", "PATH1_P106_BROWSER_DEEPLINK_BLOCK_FAILED");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "estimateTrialQuotient", "PATH1_P106_BROWSER_DEEPLINK_MODE_FAILED");
  await page.reload({ waitUntil: "networkidle" });
  invariant(await page.locator("#path1-practice-mode").inputValue() === "estimateTrialQuotient", "PATH1_P106_BROWSER_REFRESH_MODE_FAILED");

  for (const blockId of ["P1-05", "P1-07"]) {
    await page.goto(`${baseUrl}/path1/?path1BlockId=${blockId}&practiceMode=estimateTrialQuotient`, { waitUntil: "networkidle" });
    invariant(await page.locator("#path1-practice-mode").inputValue() === "arithmetic", "PATH1_P106_BROWSER_UNSUPPORTED_BLOCK_NOT_NORMALIZED", { blockId });
    invariant(new URL(page.url()).searchParams.get("practiceMode") === "arithmetic", "PATH1_P106_BROWSER_UNSUPPORTED_QUERY_NOT_NORMALIZED", { blockId });
    invariant((await page.locator("#path1-status-panel").innerText()).includes("已切回算式練習"), "PATH1_P106_BROWSER_UNSUPPORTED_WARNING_MISSING", { blockId });
  }

  for (const blockId of ["P1-01", "P1-02"]) {
    await page.goto(`${baseUrl}/path1/?path1BlockId=${blockId}&practiceMode=equalGroupsTransfer`, { waitUntil: "networkidle" });
    invariant(await page.locator("#path1-practice-mode").inputValue() === "equalGroupsTransfer", "PATH1_P106_BROWSER_EQUAL_GROUPS_RESTORE_FAILED", { blockId });
    await page.locator("#path1-question-count").fill("4");
    invariant((await waitForGenerated(page, 4)).length > 0, "PATH1_P106_BROWSER_EQUAL_GROUPS_PREVIEW_EMPTY", { blockId });
  }

  for (const blockId of ["P1-03", "P1-04", "P1-05"]) {
    await page.goto(`${baseUrl}/path1/?path1BlockId=${blockId}&practiceMode=multiplicativeModelingTransfer`, { waitUntil: "networkidle" });
    invariant(await page.locator("#path1-practice-mode").inputValue() === "multiplicativeModelingTransfer", "PATH1_P106_BROWSER_MULTIPLICATIVE_RESTORE_FAILED", { blockId });
  }

  invariant(pageErrors.length === 0, "PATH1_P106_BROWSER_PAGE_ERROR", { pageErrors });
  invariant(consoleErrors.length === 0, "PATH1_P106_BROWSER_CONSOLE_ERROR", { consoleErrors });

  process.stdout.write(`${JSON.stringify({
    schemaName: "Path1P106EstimateTrialQuotientPublicCutoverBrowserV1",
    status: "PASS",
    page: "/path1/",
    defaultRoute: "P1-01/arithmetic",
    p105ModelingPreserved: true,
    p106ArithmeticGenerated: 8,
    p106EstimateGenerated: 40,
    p106SemanticWitnessCount: 120,
    p106DeepLinkRefresh: true,
    unsupportedEstimateModeNormalization: ["P1-05", "P1-07"],
    p106GateId: semanticWitness.gateId,
    p106KnowledgePointIds: semanticWitness.knowledgePointIds,
    p106PatternSpecIds: semanticWitness.patternSpecIds,
    p106SourceAnchorsPresent: semanticWitness.anchorsPresent,
    p106EndingBoundaryPreserved: semanticWitness.allowedEndingsOnly && !semanticWitness.endingFiveUsed && !semanticWitness.endingZeroUsed,
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
