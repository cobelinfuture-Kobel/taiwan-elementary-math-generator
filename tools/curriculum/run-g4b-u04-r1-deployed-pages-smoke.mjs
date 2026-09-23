import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";

import {
  G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4B_U04_PROMOTED_PATTERN_GROUP_IDS,
  G4B_U04_PROMOTED_PATTERN_SPEC_IDS,
  G4B_U04_PUBLIC_CONTROLS,
  G4B_U04_SOURCE_ID,
  validateG4BU04PromotionProjection,
} from "../../site/modules/curriculum/registry/g4b-u04-promotion.js";
import {
  G4B_U04_PRODUCTION_LIFECYCLE,
  validateG4BU04ProductionPromotionProjection,
} from "../../site/modules/curriculum/registry/g4b-u04-production-promotion.js";

const BASE_URL = process.env.G4B_U04_R1_SITE_URL
  ?? "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/index.html";
const DEPLOYMENT_SHA = process.env.G4B_U04_R1_DEPLOYMENT_SHA ?? "unknown";
const SOURCE_ID = G4B_U04_SOURCE_ID;
const EXPECTED_KP_COUNT = 12;
const EXPECTED_PATTERN_GROUP_COUNT = 12;
const EXPECTED_PATTERN_SPEC_COUNT = 17;
const PER_KP_QUESTION_COUNT = 8;
const PER_MODE_QUESTION_COUNT = 12;
const FULL_QUESTION_COUNT = 68;
const OUTPUT_DIR = resolve("docs/curriculum/output/stress/g4b-u04-r1-deployed-pages");
const FAILURE_JSON = resolve(OUTPUT_DIR, "failure.json");
const FAILURE_SCREENSHOT = resolve(OUTPUT_DIR, "failure.png");

function fail(message, details = {}) {
  const error = new Error(message);
  error.details = details;
  throw error;
}

function assertLocalAuthority() {
  const promotion = validateG4BU04PromotionProjection();
  const production = validateG4BU04ProductionPromotionProjection();
  if (!promotion.ok || !production.ok) {
    fail("G4B_U04_R1_LOCAL_AUTHORITY_INVALID", { promotion, production });
  }
  if (
    G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS.length !== EXPECTED_KP_COUNT
    || G4B_U04_PROMOTED_PATTERN_GROUP_IDS.length !== EXPECTED_PATTERN_GROUP_COUNT
    || G4B_U04_PROMOTED_PATTERN_SPEC_IDS.length !== EXPECTED_PATTERN_SPEC_COUNT
  ) {
    fail("G4B_U04_R1_LOCAL_AUTHORITY_COUNT_MISMATCH", {
      knowledgePoints: G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS.length,
      patternGroups: G4B_U04_PROMOTED_PATTERN_GROUP_IDS.length,
      patternSpecs: G4B_U04_PROMOTED_PATTERN_SPEC_IDS.length,
    });
  }
  if (
    G4B_U04_PRODUCTION_LIFECYCLE.productionUse !== "allowed"
    || G4B_U04_PRODUCTION_LIFECYCLE.distance !== "D0_G4B_U04"
  ) {
    fail("G4B_U04_R1_PRODUCTION_LIFECYCLE_NOT_ALLOWED", {
      lifecycle: G4B_U04_PRODUCTION_LIFECYCLE,
    });
  }
  return { promotion, production };
}

async function sha256Url(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) fail("G4B_U04_R1_ASSET_FETCH_FAILED", { url, status: response.status });
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
  const questionNumbers = (await frame.locator(".g4b-u04-cell--question .g4b-u04-cell__number").allTextContents())
    .map(normalizeNumberText);
  const answerNumbers = (await frame.locator(".g4b-u04-cell--answer .g4b-u04-cell__number").allTextContents())
    .map(normalizeNumberText);
  return {
    questionCards: await frame.locator(".g4b-u04-cell--question").count(),
    answerCards: await frame.locator(".g4b-u04-cell--answer").count(),
    questionPages: await frame.locator(".g4b-u04-page--questions").count(),
    answerPages: await frame.locator(".g4b-u04-page--answers").count(),
    questionNumbers,
    answerNumbers,
    publicText: await frame.locator("body").innerText(),
  };
}

async function assertGenerated(page, questionCount, includeAnswerKey, label) {
  await page.click("#regenerate-button");
  await page.waitForFunction(
    () => ["success", "error"].includes(document.querySelector("#status-panel")?.dataset.tone),
    null,
    { timeout: 120000 },
  );
  const tone = await page.locator("#status-panel").getAttribute("data-tone");
  const status = (await page.locator("#status-panel").textContent())?.trim() ?? "";
  const validation = (await page.locator("#validation-panel").textContent())?.trim() ?? "";
  const previewMeta = (await page.locator("#preview-meta").textContent())?.trim() ?? "";
  if (tone !== "success") {
    fail("G4B_U04_R1_DEPLOYED_GENERATION_FAILED", { label, status, validation, previewMeta });
  }
  if (status !== expectedStatus(questionCount)) {
    fail("G4B_U04_R1_DEPLOYED_STATUS_MISMATCH", {
      label,
      status,
      expected: expectedStatus(questionCount),
    });
  }
  const expectedSuffix = `｜${questionCount} 題｜${includeAnswerKey ? "含答案頁" : "不含答案頁"}`;
  if (!previewMeta.endsWith(expectedSuffix) || /undefined|null/i.test(previewMeta)) {
    fail("G4B_U04_R1_DEPLOYED_PREVIEW_META_INVALID", {
      label,
      previewMeta,
      expectedSuffix,
    });
  }
  const output = await readOutput(page);
  if (output.questionCards !== questionCount) {
    fail("G4B_U04_R1_DEPLOYED_QUESTION_COUNT_MISMATCH", { label, questionCount, ...output });
  }
  const expectedAnswerCards = includeAnswerKey ? questionCount : 0;
  if (output.answerCards !== expectedAnswerCards) {
    fail("G4B_U04_R1_DEPLOYED_ANSWER_COUNT_MISMATCH", {
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
    fail("G4B_U04_R1_DEPLOYED_PAGE_COUNT_INVALID", { label, includeAnswerKey, ...output });
  }
  if (includeAnswerKey) {
    if (output.questionNumbers.length !== questionCount || output.answerNumbers.length !== questionCount) {
      fail("G4B_U04_R1_ANSWER_NUMBER_COUNT_MISMATCH", { label, ...output });
    }
    if (JSON.stringify(output.questionNumbers) !== JSON.stringify(output.answerNumbers)) {
      fail("G4B_U04_R1_ANSWER_NUMBER_SEQUENCE_MISMATCH", {
        label,
        questionNumbers: output.questionNumbers,
        answerNumbers: output.answerNumbers,
      });
    }
  }
  if (/\b(?:kp|pg|ps|fm|tpl)_g4b_u04_[a-z0-9_]+\b/i.test(output.publicText)) {
    fail("G4B_U04_R1_DEPLOYED_INTERNAL_ID_LEAK", { label });
  }
  if (/\{\{[^}]+\}\}|\[[A-Z_]+\]|undefined|null/.test(output.publicText)) {
    fail("G4B_U04_R1_DEPLOYED_PLACEHOLDER_LEAK", { label });
  }
  if (await page.locator("#print-button").isDisabled()) {
    fail("G4B_U04_R1_DEPLOYED_PRINT_DISABLED", { label });
  }
  return { status, validation, previewMeta, ...output };
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
  const testedUrl = `${BASE_URL}?g4bU04R1=${encodeURIComponent(DEPLOYMENT_SHA)}-${Date.now()}`;
  const response = await page.goto(testedUrl, { waitUntil: "networkidle", timeout: 120000 });
  if (!response?.ok()) {
    fail("G4B_U04_R1_DEPLOYED_PAGE_HTTP_FAILED", { status: response?.status(), testedUrl });
  }

  const moduleSrcs = await page.locator('script[type="module"][src]').evaluateAll((nodes) =>
    nodes.map((node) => new URL(node.getAttribute("src"), document.baseURI).href),
  );
  if (!moduleSrcs.length) fail("G4B_U04_R1_DEPLOYED_MODULE_ENTRY_MISSING");
  const deployedAssets = {
    main: await sha256Url(moduleSrcs.find((url) => url.endsWith("/assets/browser/main.js")) ?? moduleSrcs[0]),
    controls: await sha256Url(new URL("./assets/browser/g4b-u04-public-controls.js", BASE_URL).href),
    router: await sha256Url(new URL("./modules/curriculum/batch-b/g4b-u04-canonical-router.js", BASE_URL).href),
    renderer: await sha256Url(new URL("./modules/renderer/html-renderer-s73-extension.js", BASE_URL).href),
  };

  await page.selectOption("#batch-a-source-select", SOURCE_ID);
  await page.selectOption("#batch-a-selection-mode-select", "singleKnowledgePoint");
  const modeControl = page.locator("#g4b-u04-question-mode");
  await modeControl.waitFor({ state: "visible", timeout: 120000 });
  await modeControl.selectOption("mixed");

  const kpButtons = page.locator("#batch-a-knowledge-point-panel [data-knowledge-point-id]");
  await kpButtons.first().waitFor({ state: "visible", timeout: 120000 });
  const knowledgePointCount = await kpButtons.count();
  if (knowledgePointCount !== EXPECTED_KP_COUNT) {
    fail("G4B_U04_R1_DEPLOYED_KP_COUNT_MISMATCH", {
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
    await page.fill("#generation-seed-input", `g4b-u04-r1-kp-${index + 1}`);
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
    fail("G4B_U04_R1_DEPLOYED_MIXED_KP_SELECTION_MISMATCH", { selectedKpCount });
  }

  let selectionClicks = 0;
  while (true) {
    const unselected = page.locator(
      '#batch-a-pattern-group-panel [data-pattern-group-id][data-selected="false"]',
    );
    if (await unselected.count() === 0) break;
    await unselected.first().click();
    selectionClicks += 1;
    if (selectionClicks > 20) fail("G4B_U04_R1_PATTERN_GROUP_SELECTION_LOOP_EXCEEDED");
  }

  let url = new URL(page.url());
  const selectedKnowledgePointIds = [...new Set(url.searchParams.getAll("kp"))];
  const selectedPatternGroupIds = [...new Set(url.searchParams.getAll("pg"))];
  if (selectedKnowledgePointIds.length !== EXPECTED_KP_COUNT) {
    fail("G4B_U04_R1_QUERY_KP_COUNT_MISMATCH", { selectedKnowledgePointIds });
  }
  if (selectedPatternGroupIds.length !== EXPECTED_PATTERN_GROUP_COUNT) {
    fail("G4B_U04_R1_QUERY_PATTERN_GROUP_COUNT_MISMATCH", { selectedPatternGroupIds });
  }

  const modeResults = [];
  for (const questionMode of G4B_U04_PUBLIC_CONTROLS.questionModes) {
    await modeControl.selectOption(questionMode);
    await page.fill("#batch-a-question-count-input", String(PER_MODE_QUESTION_COUNT));
    await page.fill("#generation-seed-input", `g4b-u04-r1-mode-${questionMode}`);
    const modeUrl = new URL(page.url());
    if (modeUrl.searchParams.get("questionMode") !== questionMode) {
      fail("G4B_U04_R1_QUESTION_MODE_QUERY_MISMATCH", {
        questionMode,
        queryValue: modeUrl.searchParams.get("questionMode"),
      });
    }
    const output = await assertGenerated(page, PER_MODE_QUESTION_COUNT, true, `mode:${questionMode}`);
    modeResults.push({
      questionMode,
      questionCards: output.questionCards,
      answerCards: output.answerCards,
      previewMeta: output.previewMeta,
    });
  }

  await modeControl.selectOption("reasoning");
  url = new URL(page.url());
  if (url.searchParams.has("depthMode") || url.searchParams.has("contextMode")) {
    fail("G4B_U04_R1_FOREIGN_QUERY_CONTROL_LEAK", {
      depthMode: url.searchParams.get("depthMode"),
      contextMode: url.searchParams.get("contextMode"),
    });
  }
  await page.reload({ waitUntil: "networkidle", timeout: 120000 });
  if (await page.locator("#batch-a-source-select").inputValue() !== SOURCE_ID) {
    fail("G4B_U04_R1_QUERY_SOURCE_REPLAY_FAILED");
  }
  if (await page.locator("#batch-a-selection-mode-select").inputValue() !== "mixedKnowledgePointsSameUnit") {
    fail("G4B_U04_R1_QUERY_SELECTION_MODE_REPLAY_FAILED");
  }
  await page.locator("#g4b-u04-question-mode").waitFor({ state: "visible", timeout: 120000 });
  if (await page.locator("#g4b-u04-question-mode").inputValue() !== "reasoning") {
    fail("G4B_U04_R1_QUERY_QUESTION_MODE_REPLAY_FAILED");
  }
  if (await page.locator(
    '#batch-a-knowledge-point-panel [data-knowledge-point-id][data-selected="true"]',
  ).count() !== EXPECTED_KP_COUNT) {
    fail("G4B_U04_R1_QUERY_KP_REPLAY_FAILED");
  }
  url = new URL(page.url());
  if (new Set(url.searchParams.getAll("pg")).size !== EXPECTED_PATTERN_GROUP_COUNT) {
    fail("G4B_U04_R1_QUERY_PATTERN_GROUP_REPLAY_FAILED");
  }

  await page.locator("#g4b-u04-question-mode").selectOption("mixed");
  await page.fill("#batch-a-question-count-input", String(FULL_QUESTION_COUNT));
  await page.fill("#generation-seed-input", "g4b-u04-r1-full-deployed");
  await page.check("#batch-a-answer-key-input");
  const withAnswerKey = await assertGenerated(page, FULL_QUESTION_COUNT, true, "full-mixed-with-answer-key");

  await page.locator("#preview-frame").evaluate((iframe) => {
    iframe.contentWindow.__g4bU04R1PrintCalled = false;
    iframe.contentWindow.print = () => {
      iframe.contentWindow.__g4bU04R1PrintCalled = true;
    };
  });
  await page.click("#print-button");
  const printCalled = await page.locator("#preview-frame").evaluate(
    (iframe) => iframe.contentWindow.__g4bU04R1PrintCalled,
  );
  if (!printCalled) fail("G4B_U04_R1_DEPLOYED_PRINT_TARGET_NOT_INVOKED");

  await page.uncheck("#batch-a-answer-key-input");
  const withoutAnswerKey = await assertGenerated(
    page,
    FULL_QUESTION_COUNT,
    false,
    "full-mixed-without-answer-key",
  );

  if (consoleErrors.length || pageErrors.length) {
    fail("G4B_U04_R1_DEPLOYED_BROWSER_ERRORS", { consoleErrors, pageErrors });
  }

  const manifest = {
    task: "G4B_U04_R1_DeployedLiveUIGeneratePreviewPrintAuditAndRecloseout",
    status: "PASS",
    productionUse: "allowed_deployed_ui_print",
    goalDistance: "D0",
    deploymentSha: DEPLOYMENT_SHA,
    testedUrl,
    sourceId: SOURCE_ID,
    audit: {
      mappingComplete: true,
      publicSelectorComplete: true,
      questionTypeControlsConnected: true,
      queryStatePreserved: true,
      generatorValidatorRendererConsistent: true,
      localAuthority,
    },
    knowledgePointCount,
    generatedKnowledgePointCount: generatedKnowledgePoints.length,
    generatedKnowledgePoints,
    selectedKnowledgePointCount: selectedKnowledgePointIds.length,
    selectedPatternGroupCount: selectedPatternGroupIds.length,
    selectedPatternGroupIds,
    patternSpecCount: EXPECTED_PATTERN_SPEC_COUNT,
    questionModes: [...G4B_U04_PUBLIC_CONTROLS.questionModes],
    questionModeResults: modeResults,
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
    publicPatternSpecInjection: false,
    deployedAssets,
  };
  await writeFile(resolve(OUTPUT_DIR, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(manifest, null, 2));
} catch (error) {
  const failure = {
    task: "G4B_U04_R1_DeployedLiveUIGeneratePreviewPrintAuditAndRecloseout",
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
