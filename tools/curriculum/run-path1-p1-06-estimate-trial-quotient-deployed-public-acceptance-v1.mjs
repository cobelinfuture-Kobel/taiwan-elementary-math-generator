import { createHash } from "node:crypto";
import { chromium } from "playwright";

const REPOSITORY = "cobelinfuture-Kobel/taiwan-elementary-math-generator";
const DEPLOYMENT_SHA = process.env.PATH1_P106_DEPLOYMENT_SHA ?? "df1ec7d4b4b31f7c02236472129bbfb69b4f620d";
const SITE_ROOT = process.env.PATH1_P106_SITE_ROOT ?? "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/";
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
  invariant(response.ok, "PATH1_P106_DEPLOYED_ASSET_FETCH_FAILED", { url, status: response.status });
  return Buffer.from(await response.arrayBuffer());
}

async function verifyExactDeploymentIdentity() {
  const evidence = [];
  for (let index = 0; index < ASSETS.length; index += 1) {
    const [repoPath, deployedPath] = ASSETS[index];
    const rawUrl = new URL(repoPath, RAW_ROOT);
    const liveUrl = new URL(deployedPath, SITE_ROOT);
    liveUrl.searchParams.set("p106Asset", `${DEPLOYMENT_SHA}-${Date.now()}-${index}`);
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
    invariant(row.exact, "PATH1_P106_DEPLOYED_ASSET_IDENTITY_MISMATCH", row);
    evidence.push(row);
  }
  return evidence;
}

function routeUrl(blockId, practiceMode) {
  const url = new URL(PATH1_URL);
  if (blockId) url.searchParams.set("path1BlockId", blockId);
  if (practiceMode) url.searchParams.set("practiceMode", practiceMode);
  url.searchParams.set("p106Deployed", `${DEPLOYMENT_SHA}-${Date.now()}`);
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
  invariant(await page.locator("#path1-block-select").inputValue() === "P1-01", "PATH1_P106_DEPLOYED_DEFAULT_BLOCK_MISMATCH");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "arithmetic", "PATH1_P106_DEPLOYED_DEFAULT_MODE_MISMATCH");

  await page.goto(routeUrl("P1-05", "multiplicativeModelingTransfer"), { waitUntil: "networkidle", timeout: 60000 });
  invariant(await page.locator("#path1-practice-mode").inputValue() === "multiplicativeModelingTransfer", "PATH1_P106_DEPLOYED_P105_MODELING_REGRESSION");
  await page.locator("#path1-question-count").fill("6");
  invariant((await waitForGenerated(page, 6)).length > 0, "PATH1_P106_DEPLOYED_P105_MODELING_PREVIEW_EMPTY");

  await page.goto(routeUrl("P1-06", "arithmetic"), { waitUntil: "networkidle", timeout: 60000 });
  const estimateState = await optionState(page, "estimateTrialQuotient");
  const earlyModeState = await optionState(page, "equalGroupsTransfer");
  const multiplicativeState = await optionState(page, "multiplicativeModelingTransfer");
  invariant(!estimateState.disabled && !estimateState.hidden, "PATH1_P106_DEPLOYED_ESTIMATE_OPTION_NOT_AVAILABLE", estimateState);
  invariant(earlyModeState.disabled && earlyModeState.hidden, "PATH1_P106_DEPLOYED_EQUAL_GROUPS_SHOULD_BE_HIDDEN", earlyModeState);
  invariant(multiplicativeState.disabled && multiplicativeState.hidden, "PATH1_P106_DEPLOYED_MULTIPLICATIVE_SHOULD_BE_HIDDEN", multiplicativeState);
  await page.locator("#path1-question-count").fill("8");
  invariant((await waitForGenerated(page, 8)).length > 0, "PATH1_P106_DEPLOYED_ARITHMETIC_PREVIEW_EMPTY");

  await page.locator("#path1-practice-mode").selectOption("estimateTrialQuotient");
  await page.locator("#path1-question-count").fill("40");
  const estimateText = await waitForGenerated(page, 40);
  invariant(estimateText.length > 0, "PATH1_P106_DEPLOYED_ESTIMATE_PREVIEW_EMPTY");
  invariant((await page.locator("#path1-preview-meta").innerText()).includes("估商與試商練習｜40 題｜含答案頁"), "PATH1_P106_DEPLOYED_PREVIEW_META_MISMATCH");
  invariant(!(await page.locator("#path1-print-button").isDisabled()), "PATH1_P106_DEPLOYED_PRINT_NOT_ENABLED");

  const semanticWitness = await page.evaluate(async () => {
    const moduleUrl = new URL("../assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js", window.location.href).href;
    const mod = await import(moduleUrl);
    const result = mod.buildPath1ManualWorksheet({
      blockId: "P1-06",
      practiceMode: "estimateTrialQuotient",
      questionCount: 120,
      generationSeed: "p106-deployed-semantic-witness",
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
  invariant(semanticWitness.ok === true, "PATH1_P106_DEPLOYED_SEMANTIC_WITNESS_BUILD_FAILED", semanticWitness);
  invariant(semanticWitness.gateId === "PATH1_P106_ESTIMATE_TRIAL_QUOTIENT_PUBLIC_CUTOVER_V1", "PATH1_P106_DEPLOYED_GATE_ID_MISMATCH", semanticWitness);
  invariant(semanticWitness.knowledgePointIds.length === 2, "PATH1_P106_DEPLOYED_KP_COVERAGE_MISMATCH", semanticWitness);
  invariant(semanticWitness.patternSpecIds.length === 4, "PATH1_P106_DEPLOYED_PATTERN_COVERAGE_MISMATCH", semanticWitness);
  invariant(semanticWitness.distinctPrompts === 120, "PATH1_P106_DEPLOYED_DISTINCT_PROMPT_MISMATCH", semanticWitness);
  invariant(semanticWitness.answerCount === 120, "PATH1_P106_DEPLOYED_ANSWER_COUNT_MISMATCH", semanticWitness);
  invariant(semanticWitness.allowedEndingsOnly && !semanticWitness.endingFiveUsed && !semanticWitness.endingZeroUsed, "PATH1_P106_DEPLOYED_ESTIMATE_ENDING_BOUNDARY_FAILED", semanticWitness);
  invariant(semanticWitness.anchorsPresent, "PATH1_P106_DEPLOYED_SOURCE_ANCHORS_MISSING", semanticWitness);
  invariant(semanticWitness.exactDivisionOk, "PATH1_P106_DEPLOYED_DIVISION_INVARIANT_FAILED", semanticWitness);
  invariant(JSON.stringify(semanticWitness.relationIds) === JSON.stringify([null]), "PATH1_P106_DEPLOYED_RELATION_LEAK", semanticWitness);
  invariant(JSON.stringify(semanticWitness.itemPublicCutoverFlags) === JSON.stringify([false]), "PATH1_P106_DEPLOYED_ITEM_METADATA_MUTATED", semanticWitness);
  invariant(JSON.stringify(semanticWitness.quotientPlaceFlags) === JSON.stringify([false]), "PATH1_P106_DEPLOYED_QUOTIENT_PLACE_LEAK", semanticWitness);
  invariant(JSON.stringify(semanticWitness.remainderContextFlags) === JSON.stringify([false]), "PATH1_P106_DEPLOYED_REMAINDER_CONTEXT_LEAK", semanticWitness);

  await page.evaluate(() => {
    const frame = document.getElementById("path1-preview-frame");
    frame.contentWindow.print = () => {
      window.__path1P106PrintSnapshot = frame.contentDocument.body.innerText;
    };
  });
  await page.locator("#path1-print-button").click();
  const printSnapshot = await page.evaluate(() => window.__path1P106PrintSnapshot ?? "");
  invariant(printSnapshot === estimateText, "PATH1_P106_DEPLOYED_PREVIEW_PRINT_PARITY_FAILED");

  await page.goto(routeUrl("P1-06", "estimateTrialQuotient"), { waitUntil: "networkidle", timeout: 60000 });
  invariant(await page.locator("#path1-block-select").inputValue() === "P1-06", "PATH1_P106_DEPLOYED_DEEPLINK_BLOCK_FAILED");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "estimateTrialQuotient", "PATH1_P106_DEPLOYED_DEEPLINK_MODE_FAILED");
  await page.reload({ waitUntil: "networkidle", timeout: 60000 });
  invariant(await page.locator("#path1-practice-mode").inputValue() === "estimateTrialQuotient", "PATH1_P106_DEPLOYED_REFRESH_MODE_FAILED");

  for (const blockId of ["P1-05", "P1-07"]) {
    await page.goto(routeUrl(blockId, "estimateTrialQuotient"), { waitUntil: "networkidle", timeout: 60000 });
    invariant(await page.locator("#path1-practice-mode").inputValue() === "arithmetic", "PATH1_P106_DEPLOYED_UNSUPPORTED_BLOCK_NOT_NORMALIZED", { blockId });
    invariant(new URL(page.url()).searchParams.get("practiceMode") === "arithmetic", "PATH1_P106_DEPLOYED_UNSUPPORTED_QUERY_NOT_NORMALIZED", { blockId });
    invariant((await page.locator("#path1-status-panel").innerText()).includes("已切回算式練習"), "PATH1_P106_DEPLOYED_UNSUPPORTED_WARNING_MISSING", { blockId });
  }

  for (const blockId of ["P1-01", "P1-02"]) {
    await page.goto(routeUrl(blockId, "equalGroupsTransfer"), { waitUntil: "networkidle", timeout: 60000 });
    invariant(await page.locator("#path1-practice-mode").inputValue() === "equalGroupsTransfer", "PATH1_P106_DEPLOYED_EQUAL_GROUPS_RESTORE_FAILED", { blockId });
    await page.locator("#path1-question-count").fill("4");
    invariant((await waitForGenerated(page, 4)).length > 0, "PATH1_P106_DEPLOYED_EQUAL_GROUPS_PREVIEW_EMPTY", { blockId });
  }

  for (const blockId of ["P1-03", "P1-04", "P1-05"]) {
    await page.goto(routeUrl(blockId, "multiplicativeModelingTransfer"), { waitUntil: "networkidle", timeout: 60000 });
    invariant(await page.locator("#path1-practice-mode").inputValue() === "multiplicativeModelingTransfer", "PATH1_P106_DEPLOYED_MULTIPLICATIVE_RESTORE_FAILED", { blockId });
  }

  invariant(pageErrors.length === 0, "PATH1_P106_DEPLOYED_PAGE_ERROR", { pageErrors });
  invariant(consoleErrors.length === 0, "PATH1_P106_DEPLOYED_CONSOLE_ERROR", { consoleErrors });

  process.stdout.write(`${JSON.stringify({
    schemaName: "Path1P106EstimateTrialQuotientDeployedPublicAcceptanceV1",
    status: "PASS",
    deploymentSha: DEPLOYMENT_SHA,
    pagesUrl: PATH1_URL,
    assetIdentityExact: assetIdentity.every((entry) => entry.exact),
    assetIdentity,
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
}
