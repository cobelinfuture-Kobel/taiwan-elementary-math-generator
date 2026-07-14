import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.S76R2_SITE_URL ?? "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/index.html";
const DEPLOYMENT_SHA = process.env.S76R2_DEPLOYMENT_SHA ?? "unknown";
const SOURCE_ID = "g4a_u08_4a08";
const EXPECTED_TITLE = "Batch A 4A-U08 整數四則 canonical 全題組";
const EXPECTED_KP_COUNT = 15;
const EXPECTED_PATTERN_GROUP_COUNT = 28;
const PER_KP_QUESTION_COUNT = 8;
const FULL_QUESTION_COUNT = 112;
const OUTPUT_DIR = resolve("docs/curriculum/output/stress/s76r2-deployed-pages");
const FAILURE_JSON = resolve(OUTPUT_DIR, "failure.json");
const FAILURE_SCREENSHOT = resolve(OUTPUT_DIR, "failure.png");

function fail(message, details = {}) {
  const error = new Error(message);
  error.details = details;
  throw error;
}

async function sha256Url(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) fail("S76R2_ASSET_FETCH_FAILED", { url, status: response.status });
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

function expectedPreviewMeta(questionCount, includeAnswerKey) {
  return `${EXPECTED_TITLE}｜${questionCount} 題｜${includeAnswerKey ? "含答案頁" : "不含答案頁"}`;
}

async function readOutputCounts(page) {
  const frame = page.frameLocator("#preview-frame");
  await frame.locator("body").waitFor({ state: "attached", timeout: 120000 });
  return {
    questionCards: await frame.locator(".worksheet-cell--question").count(),
    answerCards: await frame.locator(".worksheet-cell--answer-key").count(),
    questionPages: await frame.locator(".worksheet-page--questions").count(),
    answerPages: await frame.locator(".worksheet-page--answer-key").count(),
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
    fail("S76R2_DEPLOYED_GENERATION_FAILED", { label, status, validation, previewMeta });
  }
  if (status !== expectedStatus(questionCount)) {
    fail("S76R2_DEPLOYED_STATUS_MISMATCH", {
      label,
      status,
      expected: expectedStatus(questionCount),
    });
  }
  if (previewMeta !== expectedPreviewMeta(questionCount, includeAnswerKey)) {
    fail("S76R2_DEPLOYED_PREVIEW_META_MISMATCH", {
      label,
      previewMeta,
      expected: expectedPreviewMeta(questionCount, includeAnswerKey),
    });
  }
  if (/undefined|null/i.test(previewMeta)) {
    fail("S76R2_DEPLOYED_PREVIEW_TITLE_UNDEFINED", { label, previewMeta });
  }
  const counts = await readOutputCounts(page);
  if (counts.questionCards !== questionCount) {
    fail("S76R2_DEPLOYED_QUESTION_COUNT_MISMATCH", { label, ...counts, questionCount });
  }
  const expectedAnswerCards = includeAnswerKey ? questionCount : 0;
  if (counts.answerCards !== expectedAnswerCards) {
    fail("S76R2_DEPLOYED_ANSWER_COUNT_MISMATCH", {
      label,
      ...counts,
      expectedAnswerCards,
    });
  }
  if (counts.questionPages < 1 || (includeAnswerKey && counts.answerPages < 1) || (!includeAnswerKey && counts.answerPages !== 0)) {
    fail("S76R2_DEPLOYED_PAGE_COUNT_INVALID", { label, includeAnswerKey, ...counts });
  }
  if (/\b(?:kp|pg|ps|tpl)_g4a_u08_[a-z0-9_]+\b/i.test(counts.publicText)) {
    fail("S76R2_DEPLOYED_INTERNAL_ID_LEAK", { label });
  }
  if (/\{\{[^}]+\}\}|\[[A-Z_]+\]|undefined|null/.test(counts.publicText)) {
    fail("S76R2_DEPLOYED_PLACEHOLDER_LEAK", { label });
  }
  if (await page.locator("#print-button").isDisabled()) {
    fail("S76R2_DEPLOYED_PRINT_DISABLED", { label });
  }
  return { status, validation, previewMeta, ...counts };
}

await mkdir(OUTPUT_DIR, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
const consoleErrors = [];
const pageErrors = [];
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => pageErrors.push(error.message));

try {
  const testedUrl = `${BASE_URL}?s76r2=${encodeURIComponent(DEPLOYMENT_SHA)}-${Date.now()}`;
  const response = await page.goto(testedUrl, { waitUntil: "networkidle", timeout: 120000 });
  if (!response?.ok()) fail("S76R2_DEPLOYED_PAGE_HTTP_FAILED", { status: response?.status(), testedUrl });

  const moduleSrcs = await page.locator('script[type="module"][src]').evaluateAll((nodes) =>
    nodes.map((node) => new URL(node.getAttribute("src"), document.baseURI).href),
  );
  if (!moduleSrcs.length) fail("S76R2_DEPLOYED_MODULE_ENTRY_MISSING");
  const mainAsset = await sha256Url(moduleSrcs.find((url) => url.endsWith("/assets/browser/main.js")) ?? moduleSrcs[0]);
  const canonicalRouterAsset = await sha256Url(
    new URL("./modules/curriculum/batch-a/g4a-u08-all-canonical-public-router.js", BASE_URL).href,
  );

  await page.selectOption("#batch-a-source-select", SOURCE_ID);
  await page.selectOption("#batch-a-selection-mode-select", "singleKnowledgePoint");
  const kpButtons = page.locator("#batch-a-knowledge-point-panel [data-knowledge-point-id]");
  await kpButtons.first().waitFor({ state: "visible", timeout: 120000 });
  const knowledgePointCount = await kpButtons.count();
  if (knowledgePointCount !== EXPECTED_KP_COUNT) {
    fail("S76R2_DEPLOYED_KP_COUNT_MISMATCH", { knowledgePointCount, expected: EXPECTED_KP_COUNT });
  }

  await page.fill("#batch-a-question-count-input", String(PER_KP_QUESTION_COUNT));
  await page.fill("#generation-seed-input", "s76r2-g4a-u08-per-kp");
  await page.check("#batch-a-answer-key-input");

  const generatedKnowledgePoints = [];
  for (let index = 0; index < knowledgePointCount; index += 1) {
    const button = kpButtons.nth(index);
    const knowledgePointId = await button.getAttribute("data-knowledge-point-id");
    const label = (await button.locator("strong").textContent())?.replace(/^已選｜/, "").trim() ?? knowledgePointId;
    await button.click();
    const output = await assertGenerated(page, PER_KP_QUESTION_COUNT, true, label);
    generatedKnowledgePoints.push({
      knowledgePointId,
      label,
      questionCards: output.questionCards,
      answerCards: output.answerCards,
      status: output.status,
      previewMeta: output.previewMeta,
    });
  }

  await page.selectOption("#batch-a-selection-mode-select", "mixedKnowledgePointsSameUnit");
  const selectedKpCount = await page.locator('#batch-a-knowledge-point-panel [data-knowledge-point-id][data-selected="true"]').count();
  if (selectedKpCount !== EXPECTED_KP_COUNT) {
    fail("S76R2_DEPLOYED_MIXED_KP_SELECTION_MISMATCH", { selectedKpCount });
  }

  let clickCount = 0;
  while (true) {
    const unselected = page.locator('#batch-a-pattern-group-panel [data-pattern-group-id][data-selected="false"]');
    if (await unselected.count() === 0) break;
    await unselected.first().click();
    clickCount += 1;
    if (clickCount > 40) fail("S76R2_PATTERN_GROUP_SELECTION_LOOP_EXCEEDED");
  }

  let url = new URL(page.url());
  const selectedKnowledgePointIds = [...new Set(url.searchParams.getAll("kp"))];
  const selectedPatternGroupIds = [...new Set(url.searchParams.getAll("pg"))];
  if (selectedKnowledgePointIds.length !== EXPECTED_KP_COUNT) {
    fail("S76R2_QUERY_KP_COUNT_MISMATCH", { selectedKnowledgePointIds });
  }
  if (selectedPatternGroupIds.length !== EXPECTED_PATTERN_GROUP_COUNT) {
    fail("S76R2_QUERY_PATTERN_GROUP_COUNT_MISMATCH", { selectedPatternGroupIds });
  }

  await page.reload({ waitUntil: "networkidle", timeout: 120000 });
  if (await page.locator("#batch-a-source-select").inputValue() !== SOURCE_ID) {
    fail("S76R2_QUERY_SOURCE_REPLAY_FAILED");
  }
  if (await page.locator("#batch-a-selection-mode-select").inputValue() !== "mixedKnowledgePointsSameUnit") {
    fail("S76R2_QUERY_MODE_REPLAY_FAILED");
  }
  if (await page.locator('#batch-a-knowledge-point-panel [data-knowledge-point-id][data-selected="true"]').count() !== EXPECTED_KP_COUNT) {
    fail("S76R2_QUERY_KP_REPLAY_SELECTION_MISMATCH");
  }
  url = new URL(page.url());
  if (new Set(url.searchParams.getAll("pg")).size !== EXPECTED_PATTERN_GROUP_COUNT) {
    fail("S76R2_QUERY_PATTERN_GROUP_REPLAY_COUNT_MISMATCH");
  }

  await page.fill("#batch-a-question-count-input", String(FULL_QUESTION_COUNT));
  await page.fill("#generation-seed-input", "s76r2-g4a-u08-full-source");
  await page.check("#batch-a-answer-key-input");
  const withAnswerKey = await assertGenerated(page, FULL_QUESTION_COUNT, true, "full-source-with-answer-key");

  await page.locator("#preview-frame").evaluate((iframe) => {
    iframe.contentWindow.__s76r2PrintCalled = false;
    iframe.contentWindow.print = () => {
      iframe.contentWindow.__s76r2PrintCalled = true;
    };
  });
  await page.click("#print-button");
  const printCalled = await page.locator("#preview-frame").evaluate(
    (iframe) => iframe.contentWindow.__s76r2PrintCalled,
  );
  if (!printCalled) fail("S76R2_DEPLOYED_PRINT_TARGET_NOT_INVOKED");

  await page.uncheck("#batch-a-answer-key-input");
  const withoutAnswerKey = await assertGenerated(page, FULL_QUESTION_COUNT, false, "full-source-without-answer-key");

  if (consoleErrors.length || pageErrors.length) {
    fail("S76R2_DEPLOYED_BROWSER_ERRORS", { consoleErrors, pageErrors });
  }

  const manifest = {
    task: "S76R2_G4A_U08_DeployedPagesAndFreshMainD0Closeout",
    status: "PASS",
    productionUse: "allowed",
    goalDistance: "D0",
    deploymentSha: DEPLOYMENT_SHA,
    testedUrl,
    sourceId: SOURCE_ID,
    expectedTitle: EXPECTED_TITLE,
    knowledgePointCount,
    generatedKnowledgePointCount: generatedKnowledgePoints.length,
    generatedKnowledgePoints,
    selectedKnowledgePointCount: selectedKnowledgePointIds.length,
    selectedPatternGroupCount: selectedPatternGroupIds.length,
    selectedPatternGroupIds,
    questionCount: FULL_QUESTION_COUNT,
    answerKeyItemCount: withAnswerKey.answerCards,
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
    deployedAssets: { mainAsset, canonicalRouterAsset },
  };
  await writeFile(resolve(OUTPUT_DIR, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(manifest, null, 2));
} catch (error) {
  const failure = {
    task: "S76R2_G4A_U08_DeployedPagesAndFreshMainD0Closeout",
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
