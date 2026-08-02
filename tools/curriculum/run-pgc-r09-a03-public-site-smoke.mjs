import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const SITE_URL = process.env.PGC_R09_PUBLIC_SITE_URL
  ?? "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/";
const OUT = path.resolve("tmp/pgc-r09-a03-public-site-smoke");
const REPORT = path.join(OUT, "report.json");
const SCREENSHOT = path.join(OUT, "public-site.png");

const SELECTORS = {
  source: "#batch-a-source-select",
  mode: "#batch-a-selection-mode-select",
  count: "#batch-a-question-count-input",
  answerKey: "#batch-a-answer-key-input",
  generate: "#regenerate-button",
  status: "#status-panel",
  meta: "#preview-meta",
  frame: "#preview-frame",
};
const QUESTION_SELECTOR = '[data-cell-type="question"],.worksheet-cell--question,.g5a-u08-cell--question,.g4b-u04-cell--question';
const ANSWER_SELECTOR = '[data-cell-type="answerKey"],.worksheet-cell--answer-key,.g5a-u08-cell--answer,.g4b-u04-cell--answer';

function fail(code, details = {}) {
  const error = new Error(code);
  error.details = details;
  throw error;
}

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true });
let page;
const consoleErrors = [];
const pageErrors = [];
let report;
try {
  page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  const smokeUrl = `${SITE_URL}${SITE_URL.includes("?") ? "&" : "?"}pgcR09A03=${Date.now()}`;
  const response = await page.goto(smokeUrl, { waitUntil: "networkidle", timeout: 120000 });
  if (!response?.ok()) fail("PGC_R09_A03_PUBLIC_SITE_HTTP_FAILED", { status: response?.status(), smokeUrl });

  for (const selector of [SELECTORS.source, SELECTORS.mode, SELECTORS.count, SELECTORS.generate, SELECTORS.status, SELECTORS.frame]) {
    await page.locator(selector).waitFor({ state: "attached", timeout: 120000 });
  }

  const sourceOptions = await page.locator(`${SELECTORS.source} option`).evaluateAll((nodes) =>
    nodes.map((node) => ({ value: node.value, disabled: node.disabled, text: node.textContent?.trim() ?? "" }))
      .filter((row) => row.value && !row.disabled),
  );
  if (sourceOptions.length < 1) fail("PGC_R09_A03_PUBLIC_SOURCE_OPTIONS_EMPTY");
  const selectedSource = sourceOptions[0].value;
  await page.selectOption(SELECTORS.source, selectedSource);

  const modeOptions = await page.locator(`${SELECTORS.mode} option`).evaluateAll((nodes) =>
    nodes.map((node) => ({ value: node.value, disabled: node.disabled })).filter((row) => row.value && !row.disabled),
  );
  const sourceUnitMode = modeOptions.find((row) => row.value === "sourceUnit")?.value ?? modeOptions[0]?.value;
  if (!sourceUnitMode) fail("PGC_R09_A03_SELECTION_MODE_OPTIONS_EMPTY");
  await page.selectOption(SELECTORS.mode, sourceUnitMode);

  const max = Number(await page.locator(SELECTORS.count).getAttribute("max"));
  const min = Number(await page.locator(SELECTORS.count).getAttribute("min"));
  const requestedQuestionCount = Math.max(Number.isFinite(min) && min > 0 ? min : 1, Math.min(Number.isFinite(max) && max > 0 ? max : 6, 6));
  await page.fill(SELECTORS.count, String(requestedQuestionCount));
  if (await page.locator(SELECTORS.answerKey).count()) await page.check(SELECTORS.answerKey);

  await page.click(SELECTORS.generate);
  await page.waitForFunction(() => ["success", "error"].includes(document.querySelector("#status-panel")?.dataset.tone), null, { timeout: 120000 });
  const statusTone = await page.locator(SELECTORS.status).getAttribute("data-tone");
  const statusText = (await page.locator(SELECTORS.status).textContent())?.trim() ?? "";
  if (statusTone !== "success") fail("PGC_R09_A03_PUBLIC_GENERATION_FAILED", { statusTone, statusText });

  const frameHandle = await page.locator(SELECTORS.frame).elementHandle();
  const frame = await frameHandle?.contentFrame();
  if (!frame) fail("PGC_R09_A03_PREVIEW_FRAME_MISSING");
  await frame.locator("body").waitFor({ state: "attached", timeout: 120000 });
  const questionCount = await frame.locator(QUESTION_SELECTOR).count();
  const answerCount = await frame.locator(ANSWER_SELECTOR).count();
  const previewText = (await frame.locator("body").innerText()).trim();
  const previewMeta = (await page.locator(SELECTORS.meta).textContent())?.trim() ?? "";

  if (questionCount < 1) fail("PGC_R09_A03_PUBLIC_QUESTION_OUTPUT_EMPTY");
  if (answerCount < 1) fail("PGC_R09_A03_PUBLIC_ANSWER_OUTPUT_EMPTY");
  if (questionCount !== answerCount) fail("PGC_R09_A03_PUBLIC_ANSWER_BIJECTION_FAILED", { questionCount, answerCount });
  if (!previewText || /undefined|null|\{\{[^}]+\}\}/.test(previewText)) fail("PGC_R09_A03_PUBLIC_PREVIEW_INVALID");
  if (!previewMeta) fail("PGC_R09_A03_PUBLIC_PREVIEW_META_EMPTY");
  if (consoleErrors.length || pageErrors.length) fail("PGC_R09_A03_PUBLIC_BROWSER_ERRORS", { consoleErrors, pageErrors });

  await page.screenshot({ path: SCREENSHOT, fullPage: true });
  report = {
    schemaName: "PGCR09A03PublicSiteSmokeV1",
    schemaVersion: 1,
    programId: "PUBLIC_KP_GENERATION_CONFORMANCE_V1",
    taskId: "PGC-R09-A03_PublicSiteSmokeAndReleaseCandidateReadback",
    status: "PASS_DEPLOYED_PUBLIC_SITE_SMOKE",
    siteUrl: SITE_URL,
    observedUrl: page.url(),
    httpStatus: response.status(),
    selectedSource,
    selectionMode: sourceUnitMode,
    requestedQuestionCount,
    renderedQuestionCount: questionCount,
    renderedAnswerCount: answerCount,
    previewMeta,
    browserConsoleErrorCount: 0,
    browserPageErrorCount: 0,
    releaseCandidate: {
      a01rPullRequest: 504,
      a01rAcceptedHeadSha: "e3d52833780bd99c882ee882cef04d8359580470",
      a01rMergeSha: "94f3661052cdcfc1760f1a2fffcde29160535e93",
      a02MergeSha: "6ade4ad2bcbee06a01c550a559859f12e39ff9e2",
      slice014Frozen: true,
    },
  };
  await writeFile(REPORT, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  report = {
    schemaName: "PGCR09A03PublicSiteSmokeV1",
    schemaVersion: 1,
    programId: "PUBLIC_KP_GENERATION_CONFORMANCE_V1",
    taskId: "PGC-R09-A03_PublicSiteSmokeAndReleaseCandidateReadback",
    status: "FAIL_DEPLOYED_PUBLIC_SITE_SMOKE",
    siteUrl: SITE_URL,
    errorCode: error.message,
    details: error.details ?? null,
    browserConsoleErrors: consoleErrors,
    browserPageErrors: pageErrors,
  };
  await writeFile(REPORT, `${JSON.stringify(report, null, 2)}\n`);
  if (page) {
    try { await page.screenshot({ path: SCREENSHOT, fullPage: true }); } catch {}
  }
  console.error(JSON.stringify(report, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}
