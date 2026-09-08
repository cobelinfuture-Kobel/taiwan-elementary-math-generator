import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const SITE_URL = process.env.PATH1_P105_SITE_URL
  ?? "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/path1/";
const DEPLOYMENT_SHA = process.env.PATH1_P105_DEPLOYMENT_SHA ?? "";
const OUTPUT_DIR = "docs/curriculum/output/stress/path1-p105-deployed-public-acceptance";
const MANIFEST_PATH = path.join(OUTPUT_DIR, "manifest.json");
const FAILURE_PATH = path.join(OUTPUT_DIR, "failure.json");
const FAILURE_PNG = path.join(OUTPUT_DIR, "failure.png");

function invariant(condition, code, details = {}) {
  if (condition) return;
  const error = new Error(code);
  error.details = details;
  throw error;
}

function occurrences(text, needle) {
  return String(text ?? "").split(needle).length - 1;
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

async function buildViaDeployedPublicAdapter(page, options) {
  return page.evaluate(async ({ options: rawOptions, deploymentSha }) => {
    const moduleUrl = new URL("../assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js", window.location.href);
    moduleUrl.searchParams.set("deployment", deploymentSha);
    const mod = await import(moduleUrl.href);
    const result = mod.buildPath1ManualWorksheet(rawOptions);
    const doc = result?.worksheetDocument ?? null;
    const answerCount = (doc?.answerKeyPages ?? [])
      .flatMap((pageEntry) => pageEntry.cells ?? [])
      .filter((cell) => cell.cellType === "answerKey").length;
    return {
      ok: Boolean(result?.ok),
      errors: result?.errors ?? [],
      warnings: result?.warnings ?? [],
      questionCount: doc?.questions?.length ?? 0,
      answerCount,
      metadata: doc?.configSnapshot?.metadata ?? null,
      questions: (doc?.questions ?? []).map((item) => ({
        prompt: item.prompt,
        answerText: item.answerText,
        knowledgePointId: item.knowledgePointId,
        arithmeticKnowledgePointId: item.arithmeticKnowledgePointId,
        patternSpecId: item.patternSpecId,
        relationId: item.relationId,
        unknownRole: item.unknownRole,
        amountPerGroup: item.amountPerGroup,
        groupCount: item.groupCount,
        totalAmount: item.totalAmount,
        metadata: {
          publicCutoverApplied: item.metadata?.publicCutoverApplied,
          g4bU01ModelingExpanded: item.metadata?.g4bU01ModelingExpanded,
          singleRelationOnly: item.metadata?.singleRelationOnly,
          unitConversionUsed: item.metadata?.unitConversionUsed,
          semanticCommutativeRoleSwapAllowed: item.metadata?.semanticCommutativeRoleSwapAllowed,
        },
      })),
    };
  }, { options, deploymentSha: DEPLOYMENT_SHA });
}

await fs.mkdir(OUTPUT_DIR, { recursive: true });
invariant(DEPLOYMENT_SHA, "PATH1_P105_DEPLOYMENT_SHA_REQUIRED");

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
const pageErrors = [];
const consoleErrors = [];
page.on("pageerror", (error) => pageErrors.push(String(error?.message ?? error)));
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});

const evidence = {
  schemaName: "Path1P105DeployedPublicAcceptanceV1",
  task: "PATH1_WORD_PROBLEM_P1_05_MULTIPLICATIVE_MODELING_DEPLOYED_PUBLIC_ACCEPTANCE_V1",
  status: "FAIL",
  siteUrl: SITE_URL,
  deploymentSha: DEPLOYMENT_SHA,
  pageErrors,
  consoleErrors,
};

try {
  const cacheBustedUrl = new URL(SITE_URL);
  cacheBustedUrl.searchParams.set("deployment", DEPLOYMENT_SHA);
  await page.goto(cacheBustedUrl.href, { waitUntil: "networkidle", timeout: 30000 });

  const helpText = await page.locator(".help-text").innerText();
  invariant(helpText.includes("P1-05"), "PATH1_P105_DEPLOYED_HELP_TEXT_MISSING_P105", { helpText });
  invariant(await page.locator("#path1-block-select").inputValue() === "P1-01", "PATH1_P105_DEPLOYED_DEFAULT_BLOCK_MISMATCH");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "arithmetic", "PATH1_P105_DEPLOYED_DEFAULT_MODE_MISMATCH");

  const directP105 = await buildViaDeployedPublicAdapter(page, {
    blockId: "P1-05",
    practiceMode: "multiplicativeModelingTransfer",
    questionCount: 40,
    generationSeed: `p105-deployed:${DEPLOYMENT_SHA}`,
    includeAnswerKey: true,
  });
  invariant(directP105.ok, "PATH1_P105_DEPLOYED_PUBLIC_ADAPTER_FAILED", { errors: directP105.errors });
  invariant(directP105.questionCount === 40, "PATH1_P105_DEPLOYED_DIRECT_QUESTION_COUNT_MISMATCH", { actual: directP105.questionCount });
  invariant(directP105.answerCount === 40, "PATH1_P105_DEPLOYED_DIRECT_ANSWER_COUNT_MISMATCH", { actual: directP105.answerCount });
  invariant(directP105.metadata?.publicCutoverApplied === true, "PATH1_P105_DEPLOYED_PUBLIC_CUTOVER_METADATA_FALSE", { metadata: directP105.metadata });
  invariant(directP105.metadata?.publicRoute === "path1-manual", "PATH1_P105_DEPLOYED_PUBLIC_ROUTE_METADATA_MISMATCH", { metadata: directP105.metadata });
  invariant(directP105.metadata?.publicCutoverGateId === "PATH1_P105_MULTIPLICATIVE_MODELING_PUBLIC_CUTOVER_V1", "PATH1_P105_DEPLOYED_GATE_ID_MISMATCH", { metadata: directP105.metadata });

  const requiredPatterns = [
    "P105_R03_ITEMS_PER_PACKAGE_TOTAL",
    "P105_R03_MATERIAL_PER_PRODUCT_TOTAL",
    "P105_R03_SCORE_PER_EVENT_TOTAL",
    "P105_R03_AMOUNT_PER_PERIOD_TOTAL",
  ];
  const patterns = new Set(directP105.questions.map((item) => item.patternSpecId));
  invariant(requiredPatterns.every((id) => patterns.has(id)), "PATH1_P105_DEPLOYED_PATTERN_COVERAGE_MISMATCH", { patterns: [...patterns] });
  invariant(new Set(directP105.questions.map((item) => item.prompt)).size === 40, "PATH1_P105_DEPLOYED_PROMPTS_NOT_DISTINCT");

  const allowedKp = "kp_g3a_u03_3digit_zero_middle_by_1digit";
  const forbiddenKps = new Set(["kp_g4b_u01_multiplier_internal_zero", "kp_g4b_u01_trailing_zero_multiplication"]);
  invariant(directP105.questions.some((item) => item.totalAmount > 999), "PATH1_P105_DEPLOYED_LOCAL_NUMERIC_ENVELOPE_NOT_WITNESSED");
  for (const item of directP105.questions) {
    invariant(item.knowledgePointId === allowedKp, "PATH1_P105_DEPLOYED_MODELING_KP_OUTSIDE_MATRIX_AUTHORITY", { item });
    invariant(item.arithmeticKnowledgePointId === allowedKp, "PATH1_P105_DEPLOYED_ARITHMETIC_KP_OUTSIDE_MATRIX_AUTHORITY", { item });
    invariant(!forbiddenKps.has(item.knowledgePointId) && !forbiddenKps.has(item.arithmeticKnowledgePointId), "PATH1_P105_DEPLOYED_G4BU01_MODELING_LEAK", { item });
    invariant(Number.isInteger(item.amountPerGroup) && item.amountPerGroup >= 101 && item.amountPerGroup <= 909, "PATH1_P105_DEPLOYED_AMOUNT_RANGE_MISMATCH", { item });
    invariant(Math.floor(item.amountPerGroup / 10) % 10 === 0 && item.amountPerGroup % 10 !== 0, "PATH1_P105_DEPLOYED_ZERO_MIDDLE_SHAPE_MISMATCH", { item });
    invariant(item.groupCount >= 2 && item.groupCount <= 9, "PATH1_P105_DEPLOYED_GROUP_COUNT_MISMATCH", { item });
    invariant(item.totalAmount === item.amountPerGroup * item.groupCount, "PATH1_P105_DEPLOYED_TOTAL_INVARIANT_FAILED", { item });
    invariant(item.relationId === "R03_EQUAL_GROUPS" && item.unknownRole === "totalAmount", "PATH1_P105_DEPLOYED_RELATION_ROLE_MISMATCH", { item });
    invariant(item.metadata?.publicCutoverApplied === false, "PATH1_P105_DEPLOYED_ITEM_SEMANTIC_METADATA_MUTATED", { item });
    invariant(item.metadata?.g4bU01ModelingExpanded === false, "PATH1_P105_DEPLOYED_G4BU01_EXPANSION_LEAK", { item });
    invariant(item.metadata?.singleRelationOnly === true && item.metadata?.unitConversionUsed === false, "PATH1_P105_DEPLOYED_SEMANTIC_SCOPE_LEAK", { item });
    invariant(item.metadata?.semanticCommutativeRoleSwapAllowed === false, "PATH1_P105_DEPLOYED_ROLE_SWAP_LEAK", { item });
    invariant(String(item.answerText).includes(" × ") && String(item.answerText).includes("；答："), "PATH1_P105_DEPLOYED_ANSWER_SHAPE_MISMATCH", { item });
  }

  for (const blockId of ["P1-03", "P1-04"]) {
    const url = new URL(SITE_URL);
    url.searchParams.set("path1BlockId", blockId);
    url.searchParams.set("practiceMode", "multiplicativeModelingTransfer");
    url.searchParams.set("deployment", DEPLOYMENT_SHA);
    await page.goto(url.href, { waitUntil: "networkidle", timeout: 30000 });
    invariant(await page.locator("#path1-practice-mode").inputValue() === "multiplicativeModelingTransfer", "PATH1_P105_DEPLOYED_PRIOR_MODELING_MODE_REGRESSION", { blockId });
    await page.locator("#path1-question-count").fill("6");
    const text = await waitForGenerated(page, 6);
    invariant(occurrences(text, "答：") === 6, "PATH1_P105_DEPLOYED_PRIOR_MODELING_ANSWER_COUNT_MISMATCH", { blockId });
  }

  await page.goto(`${SITE_URL}?path1BlockId=P1-05&practiceMode=arithmetic&deployment=${DEPLOYMENT_SHA}`, { waitUntil: "networkidle", timeout: 30000 });
  const p105State = await optionState(page, "multiplicativeModelingTransfer");
  const earlyState = await optionState(page, "equalGroupsTransfer");
  invariant(!p105State.disabled && !p105State.hidden, "PATH1_P105_DEPLOYED_MODELING_OPTION_NOT_AVAILABLE", p105State);
  invariant(earlyState.disabled && earlyState.hidden, "PATH1_P105_DEPLOYED_EQUAL_GROUPS_SHOULD_BE_HIDDEN", earlyState);
  await page.locator("#path1-question-count").fill("8");
  const p105ArithmeticText = await waitForGenerated(page, 8);
  invariant(p105ArithmeticText.length > 0, "PATH1_P105_DEPLOYED_ARITHMETIC_PREVIEW_EMPTY");

  await page.locator("#path1-practice-mode").selectOption("multiplicativeModelingTransfer");
  await page.locator("#path1-question-count").fill("40");
  const p105Text = await waitForGenerated(page, 40);
  invariant(occurrences(p105Text, "答：") === 40, "PATH1_P105_DEPLOYED_UI_ANSWER_COUNT_MISMATCH", { actual: occurrences(p105Text, "答：") });
  const previewMeta = await page.locator("#path1-preview-meta").innerText();
  invariant(previewMeta.includes("文字建模練習｜40 題｜含答案頁"), "PATH1_P105_DEPLOYED_PREVIEW_META_MISMATCH", { previewMeta });
  invariant(!(await page.locator("#path1-print-button").isDisabled()), "PATH1_P105_DEPLOYED_PRINT_NOT_ENABLED");

  await page.evaluate(() => {
    const frame = document.getElementById("path1-preview-frame");
    frame.contentWindow.print = () => {
      window.__path1P105PrintSnapshot = frame.contentDocument.body.innerText;
    };
  });
  await page.locator("#path1-print-button").click();
  const printSnapshot = await page.evaluate(() => window.__path1P105PrintSnapshot ?? "");
  invariant(printSnapshot === p105Text, "PATH1_P105_DEPLOYED_PREVIEW_PRINT_PARITY_FAILED");
  invariant(occurrences(printSnapshot, "答：") === 40, "PATH1_P105_DEPLOYED_PRINT_ANSWER_COUNT_MISMATCH");

  const deepLink = new URL(SITE_URL);
  deepLink.searchParams.set("path1BlockId", "P1-05");
  deepLink.searchParams.set("practiceMode", "multiplicativeModelingTransfer");
  deepLink.searchParams.set("deployment", DEPLOYMENT_SHA);
  await page.goto(deepLink.href, { waitUntil: "networkidle", timeout: 30000 });
  invariant(await page.locator("#path1-block-select").inputValue() === "P1-05", "PATH1_P105_DEPLOYED_DEEPLINK_BLOCK_FAILED");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "multiplicativeModelingTransfer", "PATH1_P105_DEPLOYED_DEEPLINK_MODE_FAILED");
  await page.reload({ waitUntil: "networkidle", timeout: 30000 });
  invariant(await page.locator("#path1-block-select").inputValue() === "P1-05", "PATH1_P105_DEPLOYED_REFRESH_BLOCK_FAILED");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "multiplicativeModelingTransfer", "PATH1_P105_DEPLOYED_REFRESH_MODE_FAILED");

  for (const blockId of ["P1-04", "P1-03", "P1-04", "P1-05"]) {
    await page.locator("#path1-block-select").selectOption(blockId);
    invariant(await page.locator("#path1-practice-mode").inputValue() === "multiplicativeModelingTransfer", "PATH1_P105_DEPLOYED_CROSS_BLOCK_MODE_NOT_RETAINED", { blockId });
  }
  await page.locator("#path1-block-select").selectOption("P1-06");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "arithmetic", "PATH1_P105_DEPLOYED_P106_NOT_NORMALIZED");
  invariant(new URL(page.url()).searchParams.get("practiceMode") === "arithmetic", "PATH1_P105_DEPLOYED_P106_QUERY_NOT_NORMALIZED");
  invariant((await page.locator("#path1-status-panel").innerText()).includes("已切回算式練習"), "PATH1_P105_DEPLOYED_P106_WARNING_MISSING");

  for (const blockId of ["P1-01", "P1-02"]) {
    const url = new URL(SITE_URL);
    url.searchParams.set("path1BlockId", blockId);
    url.searchParams.set("practiceMode", "equalGroupsTransfer");
    url.searchParams.set("deployment", DEPLOYMENT_SHA);
    await page.goto(url.href, { waitUntil: "networkidle", timeout: 30000 });
    invariant(await page.locator("#path1-practice-mode").inputValue() === "equalGroupsTransfer", "PATH1_P105_DEPLOYED_EARLY_TRANSFER_RESTORE_FAILED", { blockId });
    const laterModeState = await optionState(page, "multiplicativeModelingTransfer");
    invariant(laterModeState.disabled && laterModeState.hidden, "PATH1_P105_DEPLOYED_LATER_MODELING_SHOULD_BE_HIDDEN_ON_EARLY_BLOCK", { blockId, laterModeState });
    await page.locator("#path1-question-count").fill("6");
    const text = await waitForGenerated(page, 6);
    invariant(occurrences(text, "答：") === 6, "PATH1_P105_DEPLOYED_EARLY_TRANSFER_ANSWER_COUNT_MISMATCH", { blockId });
  }

  invariant(pageErrors.length === 0, "PATH1_P105_DEPLOYED_PAGE_ERRORS", { pageErrors });
  invariant(consoleErrors.length === 0, "PATH1_P105_DEPLOYED_CONSOLE_ERRORS", { consoleErrors });

  Object.assign(evidence, {
    status: "PASS",
    defaultRoute: "P1-01/arithmetic",
    p103P104ModelingPreserved: true,
    p105ArithmeticGenerated: 8,
    p105ModelingGenerated: 40,
    p105ModelingAnswers: 40,
    p105PatternFamilies: [...patterns].sort(),
    p105AllowedModelingKp: allowedKp,
    p105ForbiddenG4bKpsAbsent: true,
    p105ZeroMiddleShape: true,
    p105IncludesTotalAbove999: true,
    p105PublicGateId: directP105.metadata.publicCutoverGateId,
    deepLinkRefresh: true,
    p103P104P105ModeCarryover: true,
    unsupportedP106Normalization: true,
    earlyEqualGroupsTransferBlocksPreserved: ["P1-01", "P1-02"],
    previewPrintParity: true,
    verifiedAt: new Date().toISOString(),
  });
  await fs.writeFile(MANIFEST_PATH, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify(evidence, null, 2)}\n`);
} catch (error) {
  evidence.message = String(error?.message ?? error);
  evidence.details = error?.details ?? null;
  evidence.verifiedAt = new Date().toISOString();
  await page.screenshot({ path: FAILURE_PNG, fullPage: true }).catch(() => {});
  await fs.writeFile(FAILURE_PATH, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
  process.stderr.write(`${JSON.stringify(evidence, null, 2)}\n`);
  process.exitCode = 1;
} finally {
  await browser.close();
}
