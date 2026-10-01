import assert from "node:assert/strict";
import { chromium } from "playwright";

const LIVE_BASE =
  "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator";
const liveUrl =
  LIVE_BASE + "/exam-template/?g06CrossUnit5A49=" + Date.now();

const DESIRED_UNIT_CODES = Object.freeze([
  "5A-U01",
  "5A-U02",
  "5A-U03A",
  "5A-U03A1",
  "5A-U09",
  "5A-U10A",
]);

async function gotoWithRetry(page, url, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      if (response?.status() === 200) return response;
      lastError = new Error("HTTP_" + (response?.status() ?? "NO_RESPONSE"));
    } catch (error) {
      lastError = error;
    }
    await page.waitForTimeout(1000 * attempt);
  }
  throw lastError;
}

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1800, height: 1200 } });
  const pageErrors = [];
  const consoleErrors = [];
  const failedRequests = [];

  page.on("pageerror", (error) =>
    pageErrors.push(error?.stack ?? error?.message ?? String(error)),
  );
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("requestfailed", (request) => {
    failedRequests.push({
      url: request.url(),
      error: request.failure()?.errorText ?? "unknown",
    });
  });

  const response = await gotoWithRetry(page, liveUrl);
  assert.equal(response.status(), 200);

  await page.waitForFunction(
    () =>
      (document.querySelector("#exam-grade")?.options?.length ?? 0) > 1
      && (document.querySelector("#exam-semester")?.options?.length ?? 0) > 1
      && (document.querySelector("#exam-source")?.options?.length ?? 0) > 1,
    undefined,
    { timeout: 45000 },
  );

  const deployedCoordinatorText = await page.evaluate(async (base) => {
    const response = await fetch(
      base + "/modules/exam/school-exam-cross-unit-coordinator.js?g06=" + Date.now(),
      { cache: "no-store" },
    );
    if (!response.ok) throw new Error("DEPLOYED_COORDINATOR_HTTP_" + response.status);
    return response.text();
  }, LIVE_BASE);

  assert.match(deployedCoordinatorText, /function materializedQuestions/);
  assert.match(deployedCoordinatorText, /document\?\.questionItems/);
  assert.match(deployedCoordinatorText, /document\?\.questionRecords/);
  assert.match(deployedCoordinatorText, /const actualQuestions = materializedQuestions/);

  await page.selectOption("#exam-grade", "5");
  await page.selectOption("#exam-semester", "upper");
  await page.selectOption("#exam-composition-mode", "MIXED_KP_CROSS_UNIT");

  await page.waitForFunction(
    (desired) => {
      const labels = [...document.querySelectorAll(
        "#exam-cross-unit-source-panel [data-cross-source-id]",
      )].map((button) => button.textContent ?? "");
      return desired.every((code) => labels.some((label) => label.includes(code)));
    },
    DESIRED_UNIT_CODES,
    { timeout: 30000 },
  );

  const sourceButtons = page.locator(
    "#exam-cross-unit-source-panel [data-cross-source-id]",
  );
  const sourceButtonCount = await sourceButtons.count();
  for (let index = 0; index < sourceButtonCount; index += 1) {
    const button = sourceButtons.nth(index);
    const label = (await button.textContent())?.trim() ?? "";
    const shouldSelect = DESIRED_UNIT_CODES.some((code) => label.includes(code));
    const isSelected = (await button.getAttribute("aria-pressed")) === "true";
    if (shouldSelect !== isSelected) await button.click();
  }

  const selectedUnits = await page.locator(
    '#exam-cross-unit-source-panel [data-cross-source-id][aria-pressed="true"]',
  ).evaluateAll((buttons) => buttons.map((button) => ({
    sourceId: button.dataset.crossSourceId,
    label: button.textContent?.trim() ?? "",
  })));

  const selectedUnitCodes = selectedUnits
    .map((row) => DESIRED_UNIT_CODES.find((code) => row.label.includes(code)) ?? null)
    .filter(Boolean)
    .sort();
  assert.deepEqual(selectedUnitCodes, [...DESIRED_UNIT_CODES].sort());

  const unselectedKps = page.locator(
    '#exam-cross-unit-kp-groups [data-cross-knowledge-point-id][aria-pressed="false"]',
  );
  while (await unselectedKps.count() > 0) {
    await unselectedKps.first().click();
  }

  const selectedKnowledgePointCount = await page.locator(
    '#exam-cross-unit-kp-groups [data-cross-knowledge-point-id][aria-pressed="true"]',
  ).count();
  assert.equal(selectedKnowledgePointCount, 49);

  await page.fill("#exam-question-count", "49");
  await page.fill("#exam-seed", "g06-5a49-cross-unit-live");
  await page.click("#exam-generate");

  await page.waitForFunction(
    () =>
      document.querySelector("#exam-status")?.dataset?.tone === "success"
      && document.querySelector("#exam-preview")?.getAttribute("srcdoc")?.includes(
        "school-exam-page",
      ),
    undefined,
    { timeout: 60000 },
  );

  const statusText =
    (await page.locator("#exam-status").textContent())?.trim() ?? "";
  assert.doesNotMatch(statusText, /SCHOOL_EXAM_CROSS_UNIT_OUTPUT_COUNT_MISMATCH/);

  const iframe = await page.$("#exam-preview");
  const frame = await iframe.contentFrame();
  assert.ok(frame, "G06_5A49_PREVIEW_FRAME_MISSING");
  await frame.waitForSelector(".school-exam-page");

  const audit = await frame.evaluate(() => ({
    questionCount: document.querySelectorAll(
      ".school-exam-page--questions .worksheet-cell",
    ).length,
    answerCount: document.querySelectorAll(
      ".school-exam-page--answers .worksheet-cell",
    ).length,
    questionNumbers: [...document.querySelectorAll(
      ".school-exam-page--questions .worksheet-cell",
    )].map((cell) => Number(cell.dataset.questionNumber)),
  }));

  assert.equal(audit.questionCount, 49);
  assert.equal(audit.answerCount, 49);
  assert.deepEqual(
    audit.questionNumbers,
    Array.from({ length: 49 }, (_, index) => index + 1),
  );

  const evidence = {
    status: "PASS",
    liveUrl,
    selectedUnits,
    selectedUnitCodes,
    selectedKnowledgePointCount,
    questionCount: audit.questionCount,
    answerCount: audit.answerCount,
    statusText,
    deployedCoordinatorContract: {
      materializedQuestionsHelper: true,
      supportsQuestionItems: true,
      supportsQuestionRecords: true,
      validatesMaterializedQuestionCount: true,
    },
    pageErrors,
    consoleErrors,
    failedRequests,
  };

  console.log("G06_5A49_DEPLOYED_LIVE_READBACK=" + JSON.stringify(evidence));

  assert.equal(pageErrors.length, 0, "page errors: " + pageErrors.join(" | "));
  assert.equal(consoleErrors.length, 0, "console errors: " + consoleErrors.join(" | "));
  assert.equal(failedRequests.length, 0, "failed requests: " + JSON.stringify(failedRequests));
} finally {
  if (browser) await browser.close();
}
