import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const SITE_URL = process.env.PATH1_P104_SITE_URL
  ?? "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/path1/";
const DEPLOYMENT_SHA = process.env.PATH1_P104_DEPLOYMENT_SHA ?? "";
const OUTPUT_DIR = "docs/curriculum/output/stress/path1-p104-deployed-public-acceptance";
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
        mode: item.mode,
        path1BlockId: item.path1BlockId,
        practiceMode: item.practiceMode,
        arithmeticFormId: item.arithmeticFormId,
        arithmeticKnowledgePointId: item.arithmeticKnowledgePointId,
        knowledgePointId: item.knowledgePointId,
        patternSpecId: item.patternSpecId,
        relationId: item.relationId,
        unknownRole: item.unknownRole,
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
invariant(DEPLOYMENT_SHA, "PATH1_P104_DEPLOYMENT_SHA_REQUIRED");

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
const pageErrors = [];
const consoleErrors = [];
page.on("pageerror", (error) => pageErrors.push(String(error?.message ?? error)));
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});

const evidence = {
  schemaName: "Path1P104DeployedPublicAcceptanceV1",
  task: "PATH1_WORD_PROBLEM_P1_04_MULTIPLICATIVE_MODELING_DEPLOYED_PUBLIC_ACCEPTANCE_V1",
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
  invariant(helpText.includes("P1-04"), "PATH1_P104_DEPLOYED_HELP_TEXT_MISSING_P104", { helpText });
  invariant(await page.locator("#path1-block-select").inputValue() === "P1-01", "PATH1_P104_DEPLOYED_DEFAULT_BLOCK_MISMATCH");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "arithmetic", "PATH1_P104_DEPLOYED_DEFAULT_MODE_MISMATCH");

  const directP104 = await buildViaDeployedPublicAdapter(page, {
    blockId: "P1-04",
    practiceMode: "multiplicativeModelingTransfer",
    questionCount: 40,
    generationSeed: `p104-deployed:${DEPLOYMENT_SHA}`,
    includeAnswerKey: true,
  });
  invariant(directP104.ok, "PATH1_P104_DEPLOYED_PUBLIC_ADAPTER_FAILED", { errors: directP104.errors });
  invariant(directP104.questionCount === 40, "PATH1_P104_DEPLOYED_DIRECT_QUESTION_COUNT_MISMATCH", { actual: directP104.questionCount });
  invariant(directP104.answerCount === 40, "PATH1_P104_DEPLOYED_DIRECT_ANSWER_COUNT_MISMATCH", { actual: directP104.answerCount });
  invariant(directP104.metadata?.publicCutoverApplied === true, "PATH1_P104_DEPLOYED_PUBLIC_CUTOVER_METADATA_FALSE", { metadata: directP104.metadata });
  invariant(directP104.metadata?.publicRoute === "path1-manual", "PATH1_P104_DEPLOYED_PUBLIC_ROUTE_METADATA_MISMATCH", { metadata: directP104.metadata });
  invariant(directP104.metadata?.publicCutoverGateId === "PATH1_P104_MULTIPLICATIVE_MODELING_PUBLIC_CUTOVER_V1", "PATH1_P104_DEPLOYED_GATE_ID_MISMATCH", { metadata: directP104.metadata });

  const forms = new Set(directP104.questions.map((item) => item.arithmeticFormId));
  invariant(forms.size === 2 && forms.has("P104_2D_BY_3D") && forms.has("P104_3D_BY_2D"), "PATH1_P104_DEPLOYED_FORM_COVERAGE_MISMATCH", { forms: [...forms] });
  const patterns = new Set(directP104.questions.map((item) => item.patternSpecId));
  const requiredPatterns = [
    "P104_R03_ITEMS_PER_PACKAGE_TOTAL",
    "P104_R03_MATERIAL_PER_PRODUCT_TOTAL",
    "P104_R03_SCORE_PER_EVENT_TOTAL",
    "P104_R03_AMOUNT_PER_PERIOD_TOTAL",
  ];
  invariant(requiredPatterns.every((id) => patterns.has(id)), "PATH1_P104_DEPLOYED_PATTERN_COVERAGE_MISMATCH", { patterns: [...patterns] });
  invariant(new Set(directP104.questions.map((item) => item.prompt)).size === 40, "PATH1_P104_DEPLOYED_PROMPTS_NOT_DISTINCT");

  const allowedKps = new Set(["kp_g4a_u02_2digit_by_3digit", "kp_g4a_u02_3digit_by_2digit"]);
  const forbiddenKps = new Set(["kp_g4b_u01_3digit_by_3digit", "kp_g4b_u01_4digit_by_3digit"]);
  for (const item of directP104.questions) {
    invariant(item.mode === "application", "PATH1_P104_DEPLOYED_ITEM_MODE_MISMATCH", { item });
    invariant(item.path1BlockId === "P1-04", "PATH1_P104_DEPLOYED_ITEM_BLOCK_MISMATCH", { item });
    invariant(allowedKps.has(item.arithmeticKnowledgePointId), "PATH1_P104_DEPLOYED_MODELING_KP_OUTSIDE_MATRIX_PAIR", { item });
    invariant(!forbiddenKps.has(item.arithmeticKnowledgePointId), "PATH1_P104_DEPLOYED_G4BU01_MODELING_LEAK", { item });
    invariant(item.relationId === "R03_EQUAL_GROUPS", "PATH1_P104_DEPLOYED_RELATION_MISMATCH", { item });
    invariant(item.unknownRole === "totalAmount", "PATH1_P104_DEPLOYED_UNKNOWN_ROLE_MISMATCH", { item });
    invariant(item.metadata?.publicCutoverApplied === false, "PATH1_P104_DEPLOYED_ITEM_SEMANTIC_METADATA_MUTATED", { item });
    invariant(item.metadata?.g4bU01ModelingExpanded === false, "PATH1_P104_DEPLOYED_G4BU01_EXPANSION_LEAK", { item });
    invariant(item.metadata?.singleRelationOnly === true, "PATH1_P104_DEPLOYED_MULTI_RELATION_LEAK", { item });
    invariant(item.metadata?.unitConversionUsed === false, "PATH1_P104_DEPLOYED_UNIT_CONVERSION_LEAK", { item });
    invariant(item.metadata?.semanticCommutativeRoleSwapAllowed === false, "PATH1_P104_DEPLOYED_ROLE_SWAP_LEAK", { item });
    invariant(String(item.answerText).includes(" × ") && String(item.answerText).includes("；答："), "PATH1_P104_DEPLOYED_ANSWER_SHAPE_MISMATCH", { item });
  }

  await page.locator("#path1-block-select").selectOption("P1-03");
  const p103State = await optionState(page, "multiplicativeModelingTransfer");
  invariant(!p103State.disabled && !p103State.hidden, "PATH1_P104_DEPLOYED_P103_MODELING_OPTION_REGRESSED", p103State);
  await page.locator("#path1-practice-mode").selectOption("multiplicativeModelingTransfer");
  await page.locator("#path1-question-count").fill("8");
  const p103Text = await waitForGenerated(page, 8);
  invariant(occurrences(p103Text, "答：") === 8, "PATH1_P104_DEPLOYED_P103_ANSWER_COUNT_MISMATCH", { actual: occurrences(p103Text, "答：") });

  await page.locator("#path1-block-select").selectOption("P1-04");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "multiplicativeModelingTransfer", "PATH1_P104_DEPLOYED_P103_TO_P104_MODE_NOT_RETAINED");
  const p104State = await optionState(page, "multiplicativeModelingTransfer");
  const earlyState = await optionState(page, "equalGroupsTransfer");
  invariant(!p104State.disabled && !p104State.hidden, "PATH1_P104_DEPLOYED_MODELING_OPTION_NOT_AVAILABLE", p104State);
  invariant(earlyState.disabled && earlyState.hidden, "PATH1_P104_DEPLOYED_EQUAL_GROUPS_SHOULD_BE_HIDDEN", earlyState);

  await page.locator("#path1-practice-mode").selectOption("arithmetic");
  await page.locator("#path1-question-count").fill("8");
  const p104ArithmeticText = await waitForGenerated(page, 8);
  invariant(p104ArithmeticText.length > 0, "PATH1_P104_DEPLOYED_ARITHMETIC_PREVIEW_EMPTY");

  await page.locator("#path1-practice-mode").selectOption("multiplicativeModelingTransfer");
  await page.locator("#path1-question-count").fill("40");
  const p104Text = await waitForGenerated(page, 40);
  invariant(occurrences(p104Text, "答：") === 40, "PATH1_P104_DEPLOYED_UI_ANSWER_COUNT_MISMATCH", { actual: occurrences(p104Text, "答：") });
  const previewMeta = await page.locator("#path1-preview-meta").innerText();
  invariant(previewMeta.includes("文字建模練習｜40 題｜含答案頁"), "PATH1_P104_DEPLOYED_PREVIEW_META_MISMATCH", { previewMeta });
  invariant(!(await page.locator("#path1-print-button").isDisabled()), "PATH1_P104_DEPLOYED_PRINT_NOT_ENABLED");

  await page.evaluate(() => {
    const frame = document.getElementById("path1-preview-frame");
    frame.contentWindow.print = () => {
      window.__path1P104PrintSnapshot = frame.contentDocument.body.innerText;
    };
  });
  await page.locator("#path1-print-button").click();
  const printSnapshot = await page.evaluate(() => window.__path1P104PrintSnapshot ?? "");
  invariant(printSnapshot === p104Text, "PATH1_P104_DEPLOYED_PREVIEW_PRINT_PARITY_FAILED");
  invariant(occurrences(printSnapshot, "答：") === 40, "PATH1_P104_DEPLOYED_PRINT_ANSWER_COUNT_MISMATCH");

  const deepLink = new URL(SITE_URL);
  deepLink.searchParams.set("path1BlockId", "P1-04");
  deepLink.searchParams.set("practiceMode", "multiplicativeModelingTransfer");
  deepLink.searchParams.set("deployment", DEPLOYMENT_SHA);
  await page.goto(deepLink.href, { waitUntil: "networkidle", timeout: 30000 });
  invariant(await page.locator("#path1-block-select").inputValue() === "P1-04", "PATH1_P104_DEPLOYED_DEEPLINK_BLOCK_FAILED");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "multiplicativeModelingTransfer", "PATH1_P104_DEPLOYED_DEEPLINK_MODE_FAILED");
  await page.reload({ waitUntil: "networkidle", timeout: 30000 });
  invariant(await page.locator("#path1-block-select").inputValue() === "P1-04", "PATH1_P104_DEPLOYED_REFRESH_BLOCK_FAILED");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "multiplicativeModelingTransfer", "PATH1_P104_DEPLOYED_REFRESH_MODE_FAILED");

  await page.locator("#path1-block-select").selectOption("P1-03");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "multiplicativeModelingTransfer", "PATH1_P104_DEPLOYED_P104_TO_P103_MODE_NOT_RETAINED");
  await page.locator("#path1-block-select").selectOption("P1-04");
  await page.locator("#path1-block-select").selectOption("P1-05");
  invariant(await page.locator("#path1-practice-mode").inputValue() === "arithmetic", "PATH1_P104_DEPLOYED_P105_NOT_NORMALIZED");
  invariant(new URL(page.url()).searchParams.get("practiceMode") === "arithmetic", "PATH1_P104_DEPLOYED_P105_QUERY_NOT_NORMALIZED");
  invariant((await page.locator("#path1-status-panel").innerText()).includes("已切回算式練習"), "PATH1_P104_DEPLOYED_P105_WARNING_MISSING");

  for (const blockId of ["P1-01", "P1-02"]) {
    const url = new URL(SITE_URL);
    url.searchParams.set("path1BlockId", blockId);
    url.searchParams.set("practiceMode", "equalGroupsTransfer");
    url.searchParams.set("deployment", DEPLOYMENT_SHA);
    await page.goto(url.href, { waitUntil: "networkidle", timeout: 30000 });
    invariant(await page.locator("#path1-practice-mode").inputValue() === "equalGroupsTransfer", "PATH1_P104_DEPLOYED_EARLY_TRANSFER_RESTORE_FAILED", { blockId });
    const sharedModeState = await optionState(page, "multiplicativeModelingTransfer");
    invariant(sharedModeState.disabled && sharedModeState.hidden, "PATH1_P104_DEPLOYED_LATER_MODELING_SHOULD_BE_HIDDEN_ON_EARLY_BLOCK", { blockId, sharedModeState });
    await page.locator("#path1-question-count").fill("6");
    const text = await waitForGenerated(page, 6);
    invariant(occurrences(text, "答：") === 6, "PATH1_P104_DEPLOYED_EARLY_TRANSFER_ANSWER_COUNT_MISMATCH", { blockId, actual: occurrences(text, "答：") });
  }

  invariant(pageErrors.length === 0, "PATH1_P104_DEPLOYED_PAGE_ERRORS", { pageErrors });
  invariant(consoleErrors.length === 0, "PATH1_P104_DEPLOYED_CONSOLE_ERRORS", { consoleErrors });

  Object.assign(evidence, {
    status: "PASS",
    defaultRoute: "P1-01/arithmetic",
    p103ModelingGenerated: 8,
    p104ArithmeticGenerated: 8,
    p104ModelingGenerated: 40,
    p104ModelingAnswers: 40,
    p104PatternFamilies: [...patterns].sort(),
    p104ArithmeticForms: [...forms].sort(),
    p104AllowedModelingKps: [...allowedKps].sort(),
    p104ForbiddenModelingKpsAbsent: true,
    p104PublicGateId: directP104.metadata.publicCutoverGateId,
    deepLinkRefresh: true,
    p103P104ModeCarryover: true,
    unsupportedP105Normalization: true,
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
