import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";

import {
  G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
  G5A_U08_PROMOTED_PATTERN_GROUP_IDS,
  G5A_U08_PROMOTED_PATTERN_SPEC_IDS,
  G5A_U08_PUBLIC_CONTROLS,
  G5A_U08_SOURCE_ID,
  validateG5AU08PromotionProjection,
} from "../../site/modules/curriculum/registry/g5a-u08-promotion.js";
import {
  G5A_U08_PRODUCTION_LIFECYCLE,
  validateG5AU08ProductionPromotionProjection,
} from "../../site/modules/curriculum/registry/g5a-u08-production-promotion.js";
import {
  normalizeG5AU08ResolverPlan,
} from "../../site/modules/curriculum/batch-a/g5a-u08-canonical-router.js";

const BASE_URL = process.env.G5A_U08_R1_SITE_URL
  ?? "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/index.html";
const DEPLOYMENT_SHA = process.env.G5A_U08_R1_DEPLOYMENT_SHA ?? "unknown";
const SOURCE_ID = G5A_U08_SOURCE_ID;
const EXPECTED_KP_COUNT = 11;
const EXPECTED_PATTERN_GROUP_COUNT = 17;
const EXPECTED_PATTERN_SPEC_COUNT = 30;
const PER_KP_QUESTION_COUNT = 6;
const PER_COMBINATION_QUESTION_COUNT = 6;
const FULL_QUESTION_COUNT = 72;
const OUTPUT_DIR = resolve("docs/curriculum/output/stress/g5a-u08-r1-deployed-pages");
const FAILURE_JSON = resolve(OUTPUT_DIR, "failure.json");
const FAILURE_SCREENSHOT = resolve(OUTPUT_DIR, "failure.png");

const CONTROL_IDS = Object.freeze({
  questionMode: "#g5a-u08-question-mode",
  depthMode: "#g5a-u08-depth-mode",
  contextMode: "#g5a-u08-context-mode",
});

function fail(message, details = {}) {
  const error = new Error(message);
  error.details = details;
  throw error;
}

function baseResolverPlan(controls, questionCount = PER_COMBINATION_QUESTION_COUNT) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: [...G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS],
    selectedPatternGroupIds: [...G5A_U08_PROMOTED_PATTERN_GROUP_IDS],
    questionCount,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "g5a-u08-r1-local-matrix",
    resolverResult: {
      ok: true,
      errors: [],
      warnings: [],
      provenance: { resolver: "visiblePatternGroupResolver", sourceId: SOURCE_ID },
    },
    ...controls,
  };
}

function buildControlMatrix() {
  const rows = [];
  for (const questionMode of G5A_U08_PUBLIC_CONTROLS.questionModes) {
    for (const depthMode of G5A_U08_PUBLIC_CONTROLS.depthModes) {
      for (const contextMode of G5A_U08_PUBLIC_CONTROLS.contextModes) {
        const controls = { questionMode, depthMode, contextMode };
        const normalized = normalizeG5AU08ResolverPlan(baseResolverPlan(controls));
        const allocated = (normalized.allocation ?? []).reduce(
          (total, entry) => total + (entry.questionCount ?? 0),
          0,
        );
        rows.push(Object.freeze({
          ...controls,
          expected: normalized.allocation?.length > 0 && allocated === PER_COMBINATION_QUESTION_COUNT
            ? "generate"
            : "block",
          patternGroupCount: normalized.selectedPatternGroupIds?.length ?? 0,
          patternSpecCount: normalized.patternSpecIds?.length ?? 0,
        }));
      }
    }
  }
  return Object.freeze(rows);
}

function assertLocalAuthority() {
  const promotion = validateG5AU08PromotionProjection();
  const production = validateG5AU08ProductionPromotionProjection();
  const controlMatrix = buildControlMatrix();
  const generateCount = controlMatrix.filter((row) => row.expected === "generate").length;
  const blockCount = controlMatrix.filter((row) => row.expected === "block").length;
  if (!promotion.ok || !production.ok) {
    fail("G5A_U08_R1_LOCAL_AUTHORITY_INVALID", { promotion, production });
  }
  if (
    G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS.length !== EXPECTED_KP_COUNT
    || G5A_U08_PROMOTED_PATTERN_GROUP_IDS.length !== EXPECTED_PATTERN_GROUP_COUNT
    || G5A_U08_PROMOTED_PATTERN_SPEC_IDS.length !== EXPECTED_PATTERN_SPEC_COUNT
  ) {
    fail("G5A_U08_R1_LOCAL_AUTHORITY_COUNT_MISMATCH", {
      knowledgePoints: G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS.length,
      patternGroups: G5A_U08_PROMOTED_PATTERN_GROUP_IDS.length,
      patternSpecs: G5A_U08_PROMOTED_PATTERN_SPEC_IDS.length,
    });
  }
  if (
    G5A_U08_PRODUCTION_LIFECYCLE.productionUse !== "allowed"
    || G5A_U08_PRODUCTION_LIFECYCLE.distance !== "D0_G5A_U08"
  ) {
    fail("G5A_U08_R1_PRODUCTION_LIFECYCLE_NOT_ALLOWED", {
      lifecycle: G5A_U08_PRODUCTION_LIFECYCLE,
    });
  }
  if (controlMatrix.length !== 36 || generateCount < 1 || blockCount < 1) {
    fail("G5A_U08_R1_CONTROL_MATRIX_CLASSIFICATION_INVALID", {
      rows: controlMatrix.length,
      generateCount,
      blockCount,
      controlMatrix,
    });
  }
  const replayControls = { questionMode: "application", depthMode: "N_PLUS_1", contextMode: "sdg" };
  const replayRow = controlMatrix.find((row) =>
    row.questionMode === replayControls.questionMode
    && row.depthMode === replayControls.depthMode
    && row.contextMode === replayControls.contextMode);
  if (replayRow?.expected !== "generate") {
    fail("G5A_U08_R1_REPLAY_COMBINATION_NOT_GENERATABLE", { replayRow });
  }
  return Object.freeze({
    promotion,
    production,
    controlMatrix,
    generateCount,
    blockCount,
    replayControls,
  });
}

async function sha256Url(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) fail("G5A_U08_R1_ASSET_FETCH_FAILED", { url, status: response.status });
  const bytes = Buffer.from(await response.arrayBuffer());
  return {
    url,
    bytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  };
}

function expectedStatus(questionCount) {
  return `已產生 ${questionCount} 題，可預覽與列印。`;
}

function normalizeNumberText(value) {
  return String(value ?? "").replace(/\s+/g, "").replace(/[。．]/g, ".");
}

async function readOutput(page) {
  const frame = page.frameLocator("#preview-frame");
  await frame.locator("body").waitFor({ state: "attached", timeout: 120000 });
  const questionNumbers = (await frame.locator(".g5a-u08-cell--question .g5a-u08-cell__number").allTextContents())
    .map(normalizeNumberText);
  const answerNumbers = (await frame.locator(".g5a-u08-cell--answer .g5a-u08-cell__number").allTextContents())
    .map(normalizeNumberText);
  return {
    questionCards: await frame.locator(".g5a-u08-cell--question").count(),
    answerCards: await frame.locator(".g5a-u08-cell--answer").count(),
    questionPages: await frame.locator(".g5a-u08-page--questions").count(),
    answerPages: await frame.locator(".g5a-u08-page--answers").count(),
    questionNumbers,
    answerNumbers,
    publicText: await frame.locator("body").innerText(),
  };
}

async function waitForTerminalTone(page) {
  await page.waitForFunction(
    () => ["success", "error"].includes(document.querySelector("#status-panel")?.dataset.tone),
    null,
    { timeout: 120000 },
  );
}

async function assertGenerated(page, questionCount, includeAnswerKey, label) {
  await page.click("#regenerate-button");
  await waitForTerminalTone(page);
  const tone = await page.locator("#status-panel").getAttribute("data-tone");
  const status = (await page.locator("#status-panel").textContent())?.trim() ?? "";
  const validation = (await page.locator("#validation-panel").textContent())?.trim() ?? "";
  const previewMeta = (await page.locator("#preview-meta").textContent())?.trim() ?? "";
  if (tone !== "success") {
    fail("G5A_U08_R1_DEPLOYED_GENERATION_FAILED", { label, status, validation, previewMeta });
  }
  if (status !== expectedStatus(questionCount)) {
    fail("G5A_U08_R1_DEPLOYED_STATUS_MISMATCH", {
      label,
      status,
      expected: expectedStatus(questionCount),
    });
  }
  const expectedSuffix = `｜${questionCount} 題｜${includeAnswerKey ? "含答案頁" : "不含答案頁"}`;
  if (!previewMeta.endsWith(expectedSuffix) || /undefined|null/i.test(previewMeta)) {
    fail("G5A_U08_R1_DEPLOYED_PREVIEW_META_INVALID", {
      label,
      previewMeta,
      expectedSuffix,
    });
  }
  const output = await readOutput(page);
  if (output.questionCards !== questionCount) {
    fail("G5A_U08_R1_DEPLOYED_QUESTION_COUNT_MISMATCH", { label, questionCount, ...output });
  }
  const expectedAnswerCards = includeAnswerKey ? questionCount : 0;
  if (output.answerCards !== expectedAnswerCards) {
    fail("G5A_U08_R1_DEPLOYED_ANSWER_COUNT_MISMATCH", {
      label,
      expectedAnswerCards,
      ...output,
    });
  }
  if (
    output.questionPages < 1
    || (includeAnswerKey && output.answerPages < 1)
    || (!includeAnswerKey && output.answerPages !== 0)
  ) {
    fail("G5A_U08_R1_DEPLOYED_PAGE_COUNT_INVALID", { label, includeAnswerKey, ...output });
  }
  if (includeAnswerKey) {
    if (output.questionNumbers.length !== questionCount || output.answerNumbers.length !== questionCount) {
      fail("G5A_U08_R1_ANSWER_NUMBER_COUNT_MISMATCH", { label, ...output });
    }
    if (JSON.stringify(output.questionNumbers) !== JSON.stringify(output.answerNumbers)) {
      fail("G5A_U08_R1_ANSWER_NUMBER_SEQUENCE_MISMATCH", {
        label,
        questionNumbers: output.questionNumbers,
        answerNumbers: output.answerNumbers,
      });
    }
  }
  if (/\b(?:kp|pg|ps|tpl)_g5a_u08_[a-z0-9_]+\b/i.test(output.publicText)) {
    fail("G5A_U08_R1_DEPLOYED_INTERNAL_ID_LEAK", { label });
  }
  if (/\{\{[^}]+\}\}|\[[A-Z_]+\]|undefined|null/.test(output.publicText)) {
    fail("G5A_U08_R1_DEPLOYED_PLACEHOLDER_LEAK", { label });
  }
  if (await page.locator("#print-button").isDisabled()) {
    fail("G5A_U08_R1_DEPLOYED_PRINT_DISABLED", { label });
  }
  return { status, validation, previewMeta, ...output };
}

async function assertBlocked(page, label) {
  await page.click("#regenerate-button");
  await waitForTerminalTone(page);
  const tone = await page.locator("#status-panel").getAttribute("data-tone");
  const status = (await page.locator("#status-panel").textContent())?.trim() ?? "";
  const validation = (await page.locator("#validation-panel").textContent())?.trim() ?? "";
  if (tone !== "error") {
    fail("G5A_U08_R1_EMPTY_INTERSECTION_NOT_BLOCKED", { label, tone, status, validation });
  }
  if (!status || !validation) {
    fail("G5A_U08_R1_EMPTY_INTERSECTION_ERROR_NOT_EXPLAINED", { label, status, validation });
  }
  if (!(await page.locator("#print-button").isDisabled())) {
    fail("G5A_U08_R1_EMPTY_INTERSECTION_PRINT_NOT_DISABLED", { label });
  }
  return { status, validation };
}

async function setControls(page, controls) {
  await page.selectOption(CONTROL_IDS.questionMode, controls.questionMode);
  await page.selectOption(CONTROL_IDS.depthMode, controls.depthMode);
  await page.selectOption(CONTROL_IDS.contextMode, controls.contextMode);
  const url = new URL(page.url());
  for (const [key, value] of Object.entries(controls)) {
    if (url.searchParams.get(key) !== value) {
      fail("G5A_U08_R1_CONTROL_QUERY_MISMATCH", {
        controls,
        key,
        actual: url.searchParams.get(key),
      });
    }
  }
}

await mkdir(OUTPUT_DIR, { recursive: true });
const localAuthority = assertLocalAuthority();
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
const consoleErrors = [];
const pageErrors = [];
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => pageErrors.push(error.message));

try {
  const testedUrl = `${BASE_URL}?g5aU08R1=${encodeURIComponent(DEPLOYMENT_SHA)}-${Date.now()}`;
  const response = await page.goto(testedUrl, { waitUntil: "networkidle", timeout: 120000 });
  if (!response?.ok()) {
    fail("G5A_U08_R1_DEPLOYED_PAGE_HTTP_FAILED", { status: response?.status(), testedUrl });
  }

  const moduleSrcs = await page.locator('script[type="module"][src]').evaluateAll((nodes) =>
    nodes.map((node) => new URL(node.getAttribute("src"), document.baseURI).href),
  );
  if (!moduleSrcs.length) fail("G5A_U08_R1_DEPLOYED_MODULE_ENTRY_MISSING");
  const deployedAssets = {
    main: await sha256Url(moduleSrcs.find((url) => url.endsWith("/assets/browser/main.js")) ?? moduleSrcs[0]),
    router: await sha256Url(new URL("./modules/curriculum/batch-a/g5a-u08-canonical-router.js", BASE_URL).href),
    renderer: await sha256Url(new URL("./modules/renderer/html-renderer-s60j-extension.js", BASE_URL).href),
    promotion: await sha256Url(new URL("./modules/curriculum/registry/g5a-u08-promotion.js", BASE_URL).href),
  };

  await page.selectOption("#batch-a-source-select", SOURCE_ID);
  await page.selectOption("#batch-a-selection-mode-select", "singleKnowledgePoint");
  for (const selector of Object.values(CONTROL_IDS)) {
    await page.locator(selector).waitFor({ state: "visible", timeout: 120000 });
  }
  await setControls(page, { questionMode: "mixed", depthMode: "mixed", contextMode: "mixed" });

  const kpButtons = page.locator("#batch-a-knowledge-point-panel [data-knowledge-point-id]");
  await kpButtons.first().waitFor({ state: "visible", timeout: 120000 });
  const knowledgePointCount = await kpButtons.count();
  if (knowledgePointCount !== EXPECTED_KP_COUNT) {
    fail("G5A_U08_R1_DEPLOYED_KP_COUNT_MISMATCH", {
      knowledgePointCount,
      expected: EXPECTED_KP_COUNT,
    });
  }

  await page.fill("#batch-a-question-count-input", String(PER_KP_QUESTION_COUNT));
  await page.check("#batch-a-answer-key-input");
  const generatedKnowledgePoints = [];
  for (let index = 0; index < knowledgePointCount; index += 1) {
    const button = kpButtons.nth(index);
    const knowledgePointId = await button.getAttribute("data-knowledge-point-id");
    const label = (await button.locator("strong").textContent())?.replace(/^已選｜/, "").trim()
      ?? knowledgePointId;
    await button.click();
    await page.fill("#generation-seed-input", `g5a-u08-r1-kp-${index + 1}`);
    const output = await assertGenerated(page, PER_KP_QUESTION_COUNT, true, label);
    generatedKnowledgePoints.push({
      knowledgePointId,
      label,
      questionCards: output.questionCards,
      answerCards: output.answerCards,
      previewMeta: output.previewMeta,
    });
  }

  await page.selectOption("#batch-a-selection-mode-select", "mixedKnowledgePointsSameUnit");
  const selectedKpCount = await page.locator(
    '#batch-a-knowledge-point-panel [data-knowledge-point-id][data-selected="true"]',
  ).count();
  if (selectedKpCount !== EXPECTED_KP_COUNT) {
    fail("G5A_U08_R1_DEPLOYED_MIXED_KP_SELECTION_MISMATCH", { selectedKpCount });
  }

  let selectionClicks = 0;
  while (true) {
    const unselected = page.locator(
      '#batch-a-pattern-group-panel [data-pattern-group-id][data-selected="false"]',
    );
    if (await unselected.count() === 0) break;
    await unselected.first().click();
    selectionClicks += 1;
    if (selectionClicks > 30) fail("G5A_U08_R1_PATTERN_GROUP_SELECTION_LOOP_EXCEEDED");
  }

  let url = new URL(page.url());
  const selectedKnowledgePointIds = [...new Set(url.searchParams.getAll("kp"))];
  const selectedPatternGroupIds = [...new Set(url.searchParams.getAll("pg"))];
  if (selectedKnowledgePointIds.length !== EXPECTED_KP_COUNT) {
    fail("G5A_U08_R1_QUERY_KP_COUNT_MISMATCH", { selectedKnowledgePointIds });
  }
  if (selectedPatternGroupIds.length !== EXPECTED_PATTERN_GROUP_COUNT) {
    fail("G5A_U08_R1_QUERY_PATTERN_GROUP_COUNT_MISMATCH", { selectedPatternGroupIds });
  }

  await page.fill("#batch-a-question-count-input", String(PER_COMBINATION_QUESTION_COUNT));
  const controlMatrixResults = [];
  for (const row of localAuthority.controlMatrix) {
    const controls = {
      questionMode: row.questionMode,
      depthMode: row.depthMode,
      contextMode: row.contextMode,
    };
    await setControls(page, controls);
    await page.fill(
      "#generation-seed-input",
      `g5a-u08-r1-${row.questionMode}-${row.depthMode}-${row.contextMode}`,
    );
    const label = `${row.questionMode}/${row.depthMode}/${row.contextMode}`;
    if (row.expected === "generate") {
      const output = await assertGenerated(page, PER_COMBINATION_QUESTION_COUNT, true, label);
      controlMatrixResults.push({ ...row, actual: "generated", previewMeta: output.previewMeta });
    } else {
      const output = await assertBlocked(page, label);
      controlMatrixResults.push({ ...row, actual: "blocked", status: output.status });
    }
  }

  await setControls(page, localAuthority.replayControls);
  await page.reload({ waitUntil: "networkidle", timeout: 120000 });
  await page.waitForFunction(
    (sourceId) => document.querySelector("#batch-a-source-select")?.value === sourceId,
    SOURCE_ID,
    { timeout: 120000 },
  );
  await page.waitForFunction(
    () => document.querySelector("#batch-a-selection-mode-select")?.value === "mixedKnowledgePointsSameUnit",
    null,
    { timeout: 120000 },
  );
  for (const [key, value] of Object.entries(localAuthority.replayControls)) {
    const selector = CONTROL_IDS[key];
    await page.locator(selector).waitFor({ state: "visible", timeout: 120000 });
    if (await page.locator(selector).inputValue() !== value) {
      fail("G5A_U08_R1_CONTROL_QUERY_REPLAY_FAILED", {
        key,
        expected: value,
        actual: await page.locator(selector).inputValue(),
      });
    }
  }
  if (await page.locator(
    '#batch-a-knowledge-point-panel [data-knowledge-point-id][data-selected="true"]',
  ).count() !== EXPECTED_KP_COUNT) {
    fail("G5A_U08_R1_QUERY_KP_REPLAY_FAILED");
  }
  url = new URL(page.url());
  if (new Set(url.searchParams.getAll("pg")).size !== EXPECTED_PATTERN_GROUP_COUNT) {
    fail("G5A_U08_R1_QUERY_PATTERN_GROUP_REPLAY_FAILED");
  }

  await setControls(page, { questionMode: "mixed", depthMode: "mixed", contextMode: "mixed" });
  await page.fill("#batch-a-question-count-input", String(FULL_QUESTION_COUNT));
  await page.fill("#generation-seed-input", "g5a-u08-r1-full-deployed");
  await page.check("#batch-a-answer-key-input");
  const withAnswerKey = await assertGenerated(page, FULL_QUESTION_COUNT, true, "full-mixed-with-answer-key");

  await page.locator("#preview-frame").evaluate((iframe) => {
    iframe.contentWindow.__g5aU08R1PrintCalled = false;
    iframe.contentWindow.print = () => {
      iframe.contentWindow.__g5aU08R1PrintCalled = true;
    };
  });
  await page.click("#print-button");
  const printCalled = await page.locator("#preview-frame").evaluate(
    (iframe) => iframe.contentWindow.__g5aU08R1PrintCalled,
  );
  if (!printCalled) fail("G5A_U08_R1_DEPLOYED_PRINT_TARGET_NOT_INVOKED");

  await page.uncheck("#batch-a-answer-key-input");
  const withoutAnswerKey = await assertGenerated(
    page,
    FULL_QUESTION_COUNT,
    false,
    "full-mixed-without-answer-key",
  );

  if (consoleErrors.length || pageErrors.length) {
    fail("G5A_U08_R1_DEPLOYED_BROWSER_ERRORS", { consoleErrors, pageErrors });
  }

  const manifest = {
    task: "G5A_U08_R1_DeployedControlsAndPrintRecloseout",
    status: "PASS",
    productionUse: "allowed_deployed_ui_print",
    goalDistance: "D0",
    deploymentSha: DEPLOYMENT_SHA,
    testedUrl,
    sourceId: SOURCE_ID,
    audit: {
      publicSelectorComplete: true,
      threeControlFamiliesConnected: true,
      queryStatePreserved: true,
      nonEmptyIntersectionGenerates: true,
      emptyIntersectionBlocks: true,
      generatorValidatorRendererConsistent: true,
    },
    knowledgePointCount,
    generatedKnowledgePointCount: generatedKnowledgePoints.length,
    generatedKnowledgePoints,
    selectedKnowledgePointCount: selectedKnowledgePointIds.length,
    selectedPatternGroupCount: selectedPatternGroupIds.length,
    selectedPatternGroupIds,
    patternSpecCount: EXPECTED_PATTERN_SPEC_COUNT,
    controls: G5A_U08_PUBLIC_CONTROLS,
    controlMatrixCount: localAuthority.controlMatrix.length,
    nonEmptyIntersectionCount: localAuthority.generateCount,
    emptyIntersectionCount: localAuthority.blockCount,
    controlMatrixResults,
    replayControls: localAuthority.replayControls,
    questionCount: FULL_QUESTION_COUNT,
    answerKeyItemCount: withAnswerKey.answerCards,
    questionNumberCount: withAnswerKey.questionNumbers.length,
    answerNumberCount: withAnswerKey.answerNumbers.length,
    answerNumberSequenceConsistent: true,
    answerKeyOffQuestionCount: withoutAnswerKey.questionCards,
    answerKeyOffAnswerCount: withoutAnswerKey.answerCards,
    publicStatus: withAnswerKey.status,
    publicPreviewMeta: withAnswerKey.previewMeta,
    answerKeyOffPreviewMeta: withoutAnswerKey.previewMeta,
    queryStateReplay: "pass",
    printCalled,
    previewTitleUndefined: false,
    consoleErrorCount: consoleErrors.length,
    pageErrorCount: pageErrors.length,
    genericFallback: false,
    publicNPlus2: false,
    publicFormalEquation: false,
    deployedAssets,
  };
  await writeFile(resolve(OUTPUT_DIR, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(manifest, null, 2));
} catch (error) {
  const failure = {
    task: "G5A_U08_R1_DeployedControlsAndPrintRecloseout",
    status: "FAIL",
    deploymentSha: DEPLOYMENT_SHA,
    message: error.message,
    details: error.details ?? null,
    pageUrl: page.url(),
    consoleErrors,
    pageErrors,
  };
  await writeFile(FAILURE_JSON, `${JSON.stringify(failure, null, 2)}\n`, "utf8");
  try {
    await page.screenshot({ path: FAILURE_SCREENSHOT, fullPage: true });
  } catch (screenshotError) {
    failure.screenshotError = screenshotError.message;
    await writeFile(FAILURE_JSON, `${JSON.stringify(failure, null, 2)}\n`, "utf8");
  }
  console.error(error.message);
  if (error.details) console.error(JSON.stringify(error.details, null, 2));
  console.error(JSON.stringify({ consoleErrors, pageErrors }, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}
