import { createHash } from "node:crypto";
import { chromium } from "playwright";

const REPOSITORY = "cobelinfuture-Kobel/taiwan-elementary-math-generator";
const DEPLOYMENT_SHA = process.env.PATH1_P107_DEPLOYMENT_SHA ?? "732589ba5507128ca89514de69e624ebf3f50ac7";
const SITE_ROOT = process.env.PATH1_P107_SITE_ROOT ?? "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/";
const PATH1_URL = new URL("path1/", SITE_ROOT).href;
const RAW_ROOT = `https://raw.githubusercontent.com/${REPOSITORY}/${DEPLOYMENT_SHA}/`;
const ASSETS = [
  ["site/path1/index.html", "path1/index.html"],
  ["site/assets/browser/path1-manual.js", "assets/browser/path1-manual.js"],
  ["site/assets/browser/state/path1-manual-query-state.js", "assets/browser/state/path1-manual-query-state.js"],
  ["site/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js", "assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js"],
];

function invariant(condition, code, details = {}) {
  if (condition) return;
  const error = new Error(code);
  error.details = details;
  throw error;
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function fetchBytes(url) {
  const response = await fetch(url, { cache: "no-store" });
  invariant(response.ok, "PATH1_P107_DEPLOYED_ASSET_FETCH_FAILED", { url, status: response.status });
  return Buffer.from(await response.arrayBuffer());
}

async function verifyExactDeploymentIdentity() {
  const evidence = [];
  for (let index = 0; index < ASSETS.length; index += 1) {
    const [repoPath, deployedPath] = ASSETS[index];
    const rawUrl = new URL(repoPath, RAW_ROOT);
    const liveUrl = new URL(deployedPath, SITE_ROOT);
    liveUrl.searchParams.set("p107Asset", `${DEPLOYMENT_SHA}-${Date.now()}-${index}`);
    const [referenceBytes, deployedBytes] = await Promise.all([
      fetchBytes(rawUrl.href),
      fetchBytes(liveUrl.href),
    ]);
    const row = {
      repoPath,
      deployedPath,
      referenceBytes: referenceBytes.length,
      deployedBytes: deployedBytes.length,
      referenceSha256: sha256(referenceBytes),
      deployedSha256: sha256(deployedBytes),
    };
    row.exact = row.referenceBytes === row.deployedBytes && row.referenceSha256 === row.deployedSha256;
    invariant(row.exact, "PATH1_P107_DEPLOYED_ASSET_IDENTITY_MISMATCH", row);
    evidence.push(row);
  }
  return evidence;
}

function routeUrl(blockId, practiceMode) {
  const url = new URL(PATH1_URL);
  if (blockId) url.searchParams.set("path1BlockId", blockId);
  if (practiceMode) url.searchParams.set("practiceMode", practiceMode);
  url.searchParams.set("p107Deployed", `${DEPLOYMENT_SHA}-${Date.now()}`);
  return url.href;
}

async function waitForGenerated(page, count) {
  await page.locator("#path1-generate-button").click();
  await page.locator("#path1-status-panel").filter({ hasText: `已產生 ${count} 題` }).waitFor({ timeout: 30000 });
  const frameBody = page.frameLocator("#path1-preview-frame").locator("body");
  await frameBody.waitFor({ timeout: 30000 });
  return frameBody.innerText();
}

async function optionState(page, value) {
  return page.locator(`#path1-practice-mode option[value="${value}"]`).evaluate((option) => ({
    disabled: option.disabled,
    hidden: option.hidden,
  }));
}

const assetIdentity = await verifyExactDeploymentIdentity();
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const pageErrors = [];
const consoleErrors = [];
page.on("pageerror", (error) => pageErrors.push(String(error?.message ?? error)));
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});

try {
  await page.goto(routeUrl(), { waitUntil: "networkidle", timeout: 60000 });
  invariant(await page.locator("#path1-block-select").inputValue() === "P1-01", "PATH1_P107_DEPLOYED_DEFAULT_BLOCK_MISMATCH");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "arithmetic", "PATH1_P107_DEPLOYED_DEFAULT_MODE_MISMATCH");

  await page.goto(routeUrl("P1-06", "estimateTrialQuotient"), { waitUntil: "networkidle", timeout: 60000 });
  invariant(await page.locator("#path1-practice-mode").inputValue() === "estimateTrialQuotient", "PATH1_P107_DEPLOYED_P106_ESTIMATE_REGRESSION");
  await page.locator("#path1-question-count").fill("6");
  invariant((await waitForGenerated(page, 6)).length > 0, "PATH1_P107_DEPLOYED_P106_ESTIMATE_PREVIEW_EMPTY");

  await page.goto(routeUrl("P1-07", "arithmetic"), { waitUntil: "networkidle", timeout: 60000 });
  const quotientState = await optionState(page, "quotientStartPlace");
  const estimateState = await optionState(page, "estimateTrialQuotient");
  const earlyModeState = await optionState(page, "equalGroupsTransfer");
  const multiplicativeState = await optionState(page, "multiplicativeModelingTransfer");
  invariant(!quotientState.disabled && !quotientState.hidden, "PATH1_P107_DEPLOYED_QUOTIENT_OPTION_NOT_AVAILABLE", quotientState);
  invariant(estimateState.disabled && estimateState.hidden, "PATH1_P107_DEPLOYED_ESTIMATE_SHOULD_BE_HIDDEN", estimateState);
  invariant(earlyModeState.disabled && earlyModeState.hidden, "PATH1_P107_DEPLOYED_EQUAL_GROUPS_SHOULD_BE_HIDDEN", earlyModeState);
  invariant(multiplicativeState.disabled && multiplicativeState.hidden, "PATH1_P107_DEPLOYED_MULTIPLICATIVE_SHOULD_BE_HIDDEN", multiplicativeState);
  await page.locator("#path1-question-count").fill("8");
  invariant((await waitForGenerated(page, 8)).length > 0, "PATH1_P107_DEPLOYED_ARITHMETIC_PREVIEW_EMPTY");

  await page.locator("#path1-practice-mode").selectOption("quotientStartPlace");
  await page.locator("#path1-question-count").fill("40");
  const quotientText = await waitForGenerated(page, 40);
  invariant(quotientText.length > 0, "PATH1_P107_DEPLOYED_QUOTIENT_PREVIEW_EMPTY");
  invariant((await page.locator("#path1-preview-meta").innerText()).includes("商的位值練習｜40 題｜含答案頁"), "PATH1_P107_DEPLOYED_PREVIEW_META_MISMATCH");
  invariant(!(await page.locator("#path1-print-button").isDisabled()), "PATH1_P107_DEPLOYED_PRINT_NOT_ENABLED");

  const semanticWitness = await page.evaluate(async () => {
    const moduleUrl = new URL("../assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js", window.location.href).href;
    const mod = await import(moduleUrl);
    const result = mod.buildPath1ManualWorksheet({
      blockId: "P1-07",
      practiceMode: "quotientStartPlace",
      questionCount: 120,
      generationSeed: "p107-deployed-semantic-witness",
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
  invariant(semanticWitness.ok === true, "PATH1_P107_DEPLOYED_SEMANTIC_WITNESS_BUILD_FAILED", semanticWitness);
  invariant(semanticWitness.gateId === "PATH1_P107_QUOTIENT_START_PLACE_PUBLIC_CUTOVER_V1", "PATH1_P107_DEPLOYED_GATE_ID_MISMATCH", semanticWitness);
  invariant(semanticWitness.knowledgePointIds.length === 2, "PATH1_P107_DEPLOYED_KP_COVERAGE_MISMATCH", semanticWitness);
  invariant(semanticWitness.patternSpecIds.length === 4, "PATH1_P107_DEPLOYED_PATTERN_COVERAGE_MISMATCH", semanticWitness);
  invariant(semanticWitness.caseIds.length === 4, "PATH1_P107_DEPLOYED_CASE_COVERAGE_MISMATCH", semanticWitness);
  invariant(semanticWitness.distinctPrompts === 120, "PATH1_P107_DEPLOYED_DISTINCT_PROMPT_MISMATCH", semanticWitness);
  invariant(semanticWitness.answerCount === 120, "PATH1_P107_DEPLOYED_ANSWER_COUNT_MISMATCH", semanticWitness);
  invariant(semanticWitness.divisorBoundaryOk, "PATH1_P107_DEPLOYED_DIVISOR_BOUNDARY_FAILED", semanticWitness);
  invariant(semanticWitness.exactDivisionOk, "PATH1_P107_DEPLOYED_EXACT_DIVISION_FAILED", semanticWitness);
  invariant(semanticWitness.quotientZeroUsed === false, "PATH1_P107_DEPLOYED_QUOTIENT_ZERO_LEAK", semanticWitness);
  invariant(JSON.stringify(semanticWitness.relationIds) === JSON.stringify([null]), "PATH1_P107_DEPLOYED_RELATION_LEAK", semanticWitness);
  invariant(JSON.stringify(semanticWitness.itemPublicCutoverFlags) === JSON.stringify([false]), "PATH1_P107_DEPLOYED_ITEM_METADATA_MUTATED", semanticWitness);
  invariant(JSON.stringify(semanticWitness.twoDigitDivisorFlags) === JSON.stringify([false]), "PATH1_P107_DEPLOYED_TWO_DIGIT_DIVISOR_LEAK", semanticWitness);
  invariant(JSON.stringify(semanticWitness.estimateFlags) === JSON.stringify([false]), "PATH1_P107_DEPLOYED_ESTIMATE_LEAK", semanticWitness);
  invariant(JSON.stringify(semanticWitness.remainderContextFlags) === JSON.stringify([false]), "PATH1_P107_DEPLOYED_REMAINDER_CONTEXT_LEAK", semanticWitness);
  invariant(JSON.stringify(semanticWitness.wordProblemFlags) === JSON.stringify([false]), "PATH1_P107_DEPLOYED_WORD_PROBLEM_LEAK", semanticWitness);

  await page.evaluate(() => {
    const frame = document.getElementById("path1-preview-frame");
    frame.contentWindow.print = () => {
      window.__path1P107PrintSnapshot = frame.contentDocument.body.innerText;
    };
  });
  await page.locator("#path1-print-button").click();
  const printSnapshot = await page.evaluate(() => window.__path1P107PrintSnapshot ?? "");
  invariant(printSnapshot === quotientText, "PATH1_P107_DEPLOYED_PREVIEW_PRINT_PARITY_FAILED");

  await page.goto(routeUrl("P1-07", "quotientStartPlace"), { waitUntil: "networkidle", timeout: 60000 });
  invariant(await page.locator("#path1-block-select").inputValue() === "P1-07", "PATH1_P107_DEPLOYED_DEEPLINK_BLOCK_FAILED");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "quotientStartPlace", "PATH1_P107_DEPLOYED_DEEPLINK_MODE_FAILED");
  await page.reload({ waitUntil: "networkidle", timeout: 60000 });
  invariant(await page.locator("#path1-practice-mode").inputValue() === "quotientStartPlace", "PATH1_P107_DEPLOYED_REFRESH_MODE_FAILED");

  for (const blockId of ["P1-06", "P1-08"]) {
    await page.goto(routeUrl(blockId, "quotientStartPlace"), { waitUntil: "networkidle", timeout: 60000 });
    invariant(await page.locator("#path1-practice-mode").inputValue() === "arithmetic", "PATH1_P107_DEPLOYED_UNSUPPORTED_BLOCK_NOT_NORMALIZED", { blockId });
    invariant(new URL(page.url()).searchParams.get("practiceMode") === "arithmetic", "PATH1_P107_DEPLOYED_UNSUPPORTED_QUERY_NOT_NORMALIZED", { blockId });
    invariant((await page.locator("#path1-status-panel").innerText()).includes("已切回算式練習"), "PATH1_P107_DEPLOYED_UNSUPPORTED_WARNING_MISSING", { blockId });
  }

  for (const blockId of ["P1-01", "P1-02"]) {
    await page.goto(routeUrl(blockId, "equalGroupsTransfer"), { waitUntil: "networkidle", timeout: 60000 });
    invariant(await page.locator("#path1-practice-mode").inputValue() === "equalGroupsTransfer", "PATH1_P107_DEPLOYED_EQUAL_GROUPS_RESTORE_FAILED", { blockId });
    await page.locator("#path1-question-count").fill("4");
    invariant((await waitForGenerated(page, 4)).length > 0, "PATH1_P107_DEPLOYED_EQUAL_GROUPS_PREVIEW_EMPTY", { blockId });
  }

  for (const blockId of ["P1-03", "P1-04", "P1-05"]) {
    await page.goto(routeUrl(blockId, "multiplicativeModelingTransfer"), { waitUntil: "networkidle", timeout: 60000 });
    invariant(await page.locator("#path1-practice-mode").inputValue() === "multiplicativeModelingTransfer", "PATH1_P107_DEPLOYED_MULTIPLICATIVE_RESTORE_FAILED", { blockId });
    await page.locator("#path1-question-count").fill("4");
    invariant((await waitForGenerated(page, 4)).length > 0, "PATH1_P107_DEPLOYED_MULTIPLICATIVE_PREVIEW_EMPTY", { blockId });
  }

  invariant(pageErrors.length === 0, "PATH1_P107_DEPLOYED_PAGE_ERROR", { pageErrors });
  invariant(consoleErrors.length === 0, "PATH1_P107_DEPLOYED_CONSOLE_ERROR", { consoleErrors });

  process.stdout.write(`${JSON.stringify({
    schemaName: "Path1P107QuotientStartPlaceDeployedPublicAcceptanceV1",
    status: "PASS",
    deploymentSha: DEPLOYMENT_SHA,
    pagesUrl: PATH1_URL,
    assetIdentityExact: assetIdentity.every((entry) => entry.exact),
    assetIdentity,
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
}
