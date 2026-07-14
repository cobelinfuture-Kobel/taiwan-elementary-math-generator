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

const BASE_URL = process.env.G4B_U04_R2F_SITE_URL
  ?? "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/index.html";
const DEPLOYMENT_SHA = process.env.G4B_U04_R2F_DEPLOYMENT_SHA ?? "unknown";
const SOURCE_ID = G4B_U04_SOURCE_ID;
const EXPECTED_KP_COUNT = 13;
const EXPECTED_PATTERN_GROUP_COUNT = 13;
const EXPECTED_PATTERN_SPEC_COUNT = 19;
const OUTPUT_DIR = resolve("docs/curriculum/output/stress/g4b-u04-r2f-deployed-pages");
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
  if (!promotion.ok || !production.ok) fail("G4B_U04_R2F_LOCAL_AUTHORITY_INVALID", { promotion, production });
  const counts = {
    knowledgePoints: G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS.length,
    patternGroups: G4B_U04_PROMOTED_PATTERN_GROUP_IDS.length,
    patternSpecs: G4B_U04_PROMOTED_PATTERN_SPEC_IDS.length,
  };
  if (counts.knowledgePoints !== EXPECTED_KP_COUNT
    || counts.patternGroups !== EXPECTED_PATTERN_GROUP_COUNT
    || counts.patternSpecs !== EXPECTED_PATTERN_SPEC_COUNT) {
    fail("G4B_U04_R2F_LOCAL_AUTHORITY_COUNT_MISMATCH", counts);
  }
  if (G4B_U04_PRODUCTION_LIFECYCLE.productionUse !== "allowed"
    || G4B_U04_PRODUCTION_LIFECYCLE.distance !== "D0_G4B_U04") {
    fail("G4B_U04_R2F_PRODUCTION_LIFECYCLE_INVALID", G4B_U04_PRODUCTION_LIFECYCLE);
  }
  return { promotion, production, counts };
}

async function sha256Url(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) fail("G4B_U04_R2F_ASSET_FETCH_FAILED", { url, status: response.status });
  const bytes = Buffer.from(await response.arrayBuffer());
  return { url, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") };
}

function normalizeNumberText(value) {
  return String(value ?? "").replace(/\s+/g, "").replace(/[。．]/g, ".");
}

async function readOutput(page) {
  const frame = page.frameLocator("#preview-frame");
  await frame.locator("body").waitFor({ state: "attached", timeout: 120000 });
  return {
    questionCards: await frame.locator(".g4b-u04-cell--question").count(),
    answerCards: await frame.locator(".g4b-u04-cell--answer").count(),
    questionPages: await frame.locator(".g4b-u04-page--questions").count(),
    answerPages: await frame.locator(".g4b-u04-page--answers").count(),
    questionNumbers: (await frame.locator(".g4b-u04-cell--question .g4b-u04-cell__number").allTextContents()).map(normalizeNumberText),
    answerNumbers: (await frame.locator(".g4b-u04-cell--answer .g4b-u04-cell__number").allTextContents()).map(normalizeNumberText),
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
  if (tone !== "success") fail("G4B_U04_R2F_DEPLOYED_GENERATION_FAILED", { label, status, validation, previewMeta });
  if (!status.includes(`已產生 ${questionCount} 題`)) {
    fail("G4B_U04_R2F_DEPLOYED_STATUS_MISMATCH", { label, status, questionCount });
  }
  const output = await readOutput(page);
  if (output.questionCards !== questionCount) {
    fail("G4B_U04_R2F_DEPLOYED_QUESTION_COUNT_MISMATCH", { label, questionCount, ...output });
  }
  const expectedAnswers = includeAnswerKey ? questionCount : 0;
  if (output.answerCards !== expectedAnswers) {
    fail("G4B_U04_R2F_DEPLOYED_ANSWER_COUNT_MISMATCH", { label, expectedAnswers, ...output });
  }
  if (includeAnswerKey) {
    if (output.questionNumbers.length !== questionCount || output.answerNumbers.length !== questionCount) {
      fail("G4B_U04_R2F_DEPLOYED_NUMBER_COUNT_MISMATCH", { label, ...output });
    }
    if (JSON.stringify(output.questionNumbers) !== JSON.stringify(output.answerNumbers)) {
      fail("G4B_U04_R2F_DEPLOYED_NUMBER_SEQUENCE_MISMATCH", { label, ...output });
    }
  }
  if (/\b(?:kp|pg|ps|fm|fmc|tpl)_g4b_u04_[a-z0-9_]+\b/i.test(output.publicText)) {
    fail("G4B_U04_R2F_DEPLOYED_INTERNAL_ID_LEAK", { label });
  }
  if (/\{\{[^}]+\}\}|\[[A-Z_]+\]|undefined|null/.test(output.publicText)) {
    fail("G4B_U04_R2F_DEPLOYED_PLACEHOLDER_LEAK", { label });
  }
  if (await page.locator("#print-button").isDisabled()) fail("G4B_U04_R2F_DEPLOYED_PRINT_DISABLED", { label });
  return { status, validation, previewMeta, ...output };
}

await mkdir(OUTPUT_DIR, { recursive: true });
const localAuthority = assertLocalAuthority();
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
const consoleErrors = [];
const pageErrors = [];
page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
page.on("pageerror", (error) => pageErrors.push(error.message));

try {
  const testedUrl = `${BASE_URL}?g4bU04R2F=${encodeURIComponent(DEPLOYMENT_SHA)}-${Date.now()}`;
  const response = await page.goto(testedUrl, { waitUntil: "networkidle", timeout: 120000 });
  if (!response?.ok()) fail("G4B_U04_R2F_DEPLOYED_PAGE_HTTP_FAILED", { status: response?.status(), testedUrl });

  const deployedAssets = {
    main: await sha256Url(new URL("./assets/browser/main.js", BASE_URL).href),
    controls: await sha256Url(new URL("./assets/browser/g4b-u04-public-controls.js", BASE_URL).href),
    router: await sha256Url(new URL("./modules/curriculum/batch-b/g4b-u04-canonical-router-r2e.js", BASE_URL).href),
    contexts: await sha256Url(new URL("./modules/curriculum/batch-b/g4b-u04-controlled-context-variants.js", BASE_URL).href),
    worksheet: await sha256Url(new URL("./modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js", BASE_URL).href),
    renderer: await sha256Url(new URL("./modules/renderer/html-renderer-s73-extension.js", BASE_URL).href),
  };

  await page.selectOption("#batch-a-source-select", SOURCE_ID);
  await page.selectOption("#batch-a-selection-mode-select", "mixedKnowledgePointsSameUnit");
  const questionModeControl = page.locator("#g4b-u04-question-mode");
  const contextModeControl = page.locator("#g4b-u04-context-mode");
  const layoutModeControl = page.locator("#g4b-u04-layout-mode");
  await questionModeControl.waitFor({ state: "visible", timeout: 120000 });
  await contextModeControl.waitFor({ state: "visible", timeout: 120000 });
  await layoutModeControl.waitFor({ state: "visible", timeout: 120000 });

  const kpButtons = page.locator("#batch-a-knowledge-point-panel [data-knowledge-point-id]");
  await kpButtons.first().waitFor({ state: "visible", timeout: 120000 });
  const knowledgePointCount = await kpButtons.count();
  if (knowledgePointCount !== EXPECTED_KP_COUNT) {
    fail("G4B_U04_R2F_DEPLOYED_KP_COUNT_MISMATCH", { knowledgePointCount, expected: EXPECTED_KP_COUNT });
  }
  let selectedKpCount = await page.locator('#batch-a-knowledge-point-panel [data-knowledge-point-id][data-selected="true"]').count();
  if (selectedKpCount !== EXPECTED_KP_COUNT) {
    for (let index = 0; index < knowledgePointCount; index += 1) {
      const button = kpButtons.nth(index);
      if (await button.getAttribute("data-selected") !== "true") await button.click();
    }
  }
  selectedKpCount = await page.locator('#batch-a-knowledge-point-panel [data-knowledge-point-id][data-selected="true"]').count();
  if (selectedKpCount !== EXPECTED_KP_COUNT) fail("G4B_U04_R2F_DEPLOYED_KP_SELECTION_MISMATCH", { selectedKpCount });

  let guard = 0;
  while (await page.locator('#batch-a-pattern-group-panel [data-pattern-group-id][data-selected="false"]').count()) {
    await page.locator('#batch-a-pattern-group-panel [data-pattern-group-id][data-selected="false"]').first().click();
    guard += 1;
    if (guard > 30) fail("G4B_U04_R2F_PATTERN_GROUP_SELECTION_LOOP_EXCEEDED");
  }
  const selectedGroupCount = await page.locator('#batch-a-pattern-group-panel [data-pattern-group-id][data-selected="true"]').count();
  if (selectedGroupCount !== EXPECTED_PATTERN_GROUP_COUNT) {
    fail("G4B_U04_R2F_DEPLOYED_PATTERN_GROUP_COUNT_MISMATCH", { selectedGroupCount });
  }

  await questionModeControl.selectOption("operation_estimation");
  await page.fill("#batch-a-question-count-input", "12");
  await page.check("#batch-a-answer-key-input");
  const contextResults = [];
  for (const contextMode of G4B_U04_PUBLIC_CONTROLS.contextModes) {
    await contextModeControl.selectOption(contextMode);
    await page.fill("#generation-seed-input", `g4b-u04-r2f-${contextMode}`);
    const currentUrl = new URL(page.url());
    const queryValue = currentUrl.searchParams.get("contextMode");
    if (contextMode === "mixed" ? queryValue !== null : queryValue !== contextMode) {
      fail("G4B_U04_R2F_CONTEXT_QUERY_MISMATCH", { contextMode, queryValue });
    }
    const output = await assertGenerated(page, 12, true, `context-${contextMode}`);
    if (contextMode === "sdg" && !/(節水|再生能源|回收|植樹|復育|大眾運輸)/u.test(output.publicText)) {
      fail("G4B_U04_R2F_SDG_PUBLIC_TEXT_MISSING", { publicText: output.publicText.slice(0, 1000) });
    }
    contextResults.push({ contextMode, queryValue, previewMeta: output.previewMeta, questionCards: output.questionCards });
  }

  await layoutModeControl.selectOption("custom_with_caps");
  if (new URL(page.url()).searchParams.get("layoutMode") !== "custom_with_caps") {
    fail("G4B_U04_R2F_LAYOUT_QUERY_MISMATCH", { url: page.url() });
  }
  await contextModeControl.selectOption("sdg");
  await page.reload({ waitUntil: "networkidle", timeout: 120000 });
  await page.waitForFunction(
    (sourceId) => document.querySelector("#batch-a-source-select")?.value === sourceId,
    SOURCE_ID,
    { timeout: 120000 },
  );
  await page.locator("#g4b-u04-context-mode").waitFor({ state: "visible", timeout: 120000 });
  if (await page.locator("#g4b-u04-context-mode").inputValue() !== "sdg") {
    fail("G4B_U04_R2F_CONTEXT_QUERY_REPLAY_FAILED");
  }
  if (await page.locator("#g4b-u04-layout-mode").inputValue() !== "custom_with_caps") {
    fail("G4B_U04_R2F_LAYOUT_QUERY_REPLAY_FAILED");
  }
  if (new Set(new URL(page.url()).searchParams.getAll("kp")).size !== EXPECTED_KP_COUNT
    || new Set(new URL(page.url()).searchParams.getAll("pg")).size !== EXPECTED_PATTERN_GROUP_COUNT) {
    fail("G4B_U04_R2F_SELECTOR_QUERY_REPLAY_FAILED", { url: page.url() });
  }

  await page.locator("#g4b-u04-question-mode").selectOption("mixed");
  await page.locator("#g4b-u04-context-mode").selectOption("mixed");
  await page.locator("#g4b-u04-layout-mode").selectOption("auto_safe");
  await page.fill("#batch-a-question-count-input", "68");
  await page.fill("#generation-seed-input", "g4b-u04-r2f-full-deployed");
  await page.check("#batch-a-answer-key-input");
  const withAnswerKey = await assertGenerated(page, 68, true, "full-mixed-with-answer-key");

  await page.locator("#preview-frame").evaluate((iframe) => {
    iframe.contentWindow.__g4bU04R2FPrintCalled = false;
    iframe.contentWindow.print = () => { iframe.contentWindow.__g4bU04R2FPrintCalled = true; };
  });
  await page.click("#print-button");
  const printCalled = await page.locator("#preview-frame").evaluate(
    (iframe) => iframe.contentWindow.__g4bU04R2FPrintCalled,
  );
  if (!printCalled) fail("G4B_U04_R2F_DEPLOYED_PRINT_TARGET_NOT_INVOKED");

  await page.uncheck("#batch-a-answer-key-input");
  await page.fill("#batch-a-question-count-input", "12");
  const withoutAnswerKey = await assertGenerated(page, 12, false, "answer-key-suppressed");

  if (consoleErrors.length || pageErrors.length) {
    fail("G4B_U04_R2F_DEPLOYED_BROWSER_ERRORS", { consoleErrors, pageErrors });
  }

  const manifest = {
    task: "G4B_U04_R2F_ProductionStressAndD0Recloseout",
    status: "PASS",
    productionUse: "allowed_deployed_ui_print",
    goalDistance: "D0_G4B_U04_R2_CLOSED",
    deploymentSha: DEPLOYMENT_SHA,
    testedUrl,
    sourceId: SOURCE_ID,
    localAuthority,
    knowledgePointCount,
    selectedKnowledgePointCount: selectedKpCount,
    selectedPatternGroupCount: selectedGroupCount,
    patternSpecCount: EXPECTED_PATTERN_SPEC_COUNT,
    contextModes: [...G4B_U04_PUBLIC_CONTROLS.contextModes],
    contextResults,
    layoutModes: [...G4B_U04_PUBLIC_CONTROLS.layoutModes],
    queryStateReplay: "pass",
    fullQuestionCount: withAnswerKey.questionCards,
    fullAnswerCount: withAnswerKey.answerCards,
    answerNumberSequenceConsistent: true,
    answerKeyOffQuestionCount: withoutAnswerKey.questionCards,
    answerKeyOffAnswerCount: withoutAnswerKey.answerCards,
    printCalled,
    consoleErrorCount: consoleErrors.length,
    pageErrorCount: pageErrors.length,
    genericFallback: false,
    freeFormAI: false,
    deployedAssets,
  };
  await writeFile(resolve(OUTPUT_DIR, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(manifest, null, 2));
} catch (error) {
  const failure = {
    task: "G4B_U04_R2F_ProductionStressAndD0Recloseout",
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
  process.exitCode = 1;
} finally {
  await browser.close();
}
