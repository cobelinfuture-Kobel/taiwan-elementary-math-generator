import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const DEPLOYMENT_SHA = "e4adda63f212c28838b6a2ef6c0c0b879800f196";
const LIVE_BASE =
  "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator";
const liveUrl = `${LIVE_BASE}/exam-template/?g06M7=${DEPLOYMENT_SHA}-${Date.now()}`;

async function gotoWithRetry(page, url, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      if (response?.status() === 200) return response;
      lastError = new Error(`HTTP_${response?.status() ?? "NO_RESPONSE"}`);
    } catch (error) {
      lastError = error;
    }
    await page.waitForTimeout(1000 * attempt);
  }
  throw lastError;
}

function assertMetric(metric) {
  if (metric.itemCount === 0) return;
  if (metric.itemCount >= 2) {
    assert.ok(
      metric.minGapMm >= 4.7 && metric.maxGapMm <= 5.3,
      `fixed 5mm gap violated: ${JSON.stringify(metric)}`,
    );
  }
  assert.ok(
    metric.bottomSafeMm >= 5.5,
    `bottom safety below 6mm tolerance: ${JSON.stringify(metric)}`,
  );
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

  const deployedRendererText = await page.evaluate(async (base) => {
    const response = await fetch(
      base + "/modules/renderer/school-exam-template-renderer.js?m7=" + Date.now(),
      { cache: "no-store" },
    );
    if (!response.ok) throw new Error("DEPLOYED_RENDERER_HTTP_" + response.status);
    return response.text();
  }, LIVE_BASE);

  assert.match(deployedRendererText, /school-exam-question-reflow-v1/);
  assert.match(deployedRendererText, /questionGapMm:\s*5/);
  assert.match(deployedRendererText, /actualHeightFlow:\s*true/);
  assert.match(deployedRendererText, /BOTTOM_SAFE_MM/);

  const uiContract = await page.evaluate(() => ({
    targetOptions: Array.from(
      document.querySelector("#exam-page-question-target")?.options ?? [],
    ).map((option) => option.value),
    actualHeightChecked:
      document.querySelector("#exam-page-auto-fill")?.checked === true,
    actualHeightLabel:
      document.querySelector("#exam-page-auto-fill")?.parentElement?.innerText?.trim() ?? "",
  }));
  assert.deepEqual(uiContract.targetOptions, ["auto", "8", "10", "12", "16", "20"]);
  assert.equal(uiContract.actualHeightChecked, true);
  assert.match(uiContract.actualHeightLabel, /實際題目高度/);

  await page.selectOption("#exam-grade", "4");
  await page.selectOption("#exam-semester", "upper");
  await page.selectOption("#exam-composition-mode", "MIXED_KP_CROSS_UNIT");

  for (const unitCode of ["4A-U03", "4A-U04", "4A-U05"]) {
    const button = page.locator(
      "#exam-cross-unit-source-panel [data-cross-source-id]",
      { hasText: unitCode },
    );
    assert.equal(await button.count(), 1, `missing source button ${unitCode}`);
    if ((await button.getAttribute("aria-pressed")) !== "true") await button.click();
  }

  const unselectedKps = page.locator(
    '#exam-cross-unit-kp-groups [data-cross-knowledge-point-id][aria-pressed="false"]',
  );
  while (await unselectedKps.count() > 0) {
    await unselectedKps.first().click();
  }

  await page.fill("#exam-question-count", "120");
  await page.selectOption("#exam-page-question-target", "auto");
  await page.locator("#exam-page-auto-fill").setChecked(true);
  await page.fill("#exam-seed", "g06-m6r2-g4a-u01-u05-120-trial");
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

  const iframe = await page.$("#exam-preview");
  const frame = await iframe.contentFrame();
  assert.ok(frame, "M7_PREVIEW_FRAME_MISSING");
  await frame.waitForSelector(".school-exam-page");
  await frame.waitForFunction(
    () =>
      document.body.dataset.questionLayoutReady === "true"
      && document.body.dataset.questionLayoutMode === "actual-height",
    undefined,
    { timeout: 45000 },
  );

  const previewMeta = await page.locator("#exam-preview-meta").textContent();
  assert.match(previewMeta ?? "", /固定 5mm 題間距/);
  assert.match(previewMeta ?? "", /實際高度換頁/);

  await page.emulateMedia({ media: "print" });
  const audit = await frame.evaluate(() => {
    const tolerance = 1.5;
    const pxToMm = 25.4 / 96;
    const pages = [...document.querySelectorAll(".school-exam-page")];
    const questionPages = pages.filter((page) => page.dataset.pageType === "question");
    const answerPages = pages.filter((page) => page.dataset.pageType === "answer");
    let outsidePage = 0;
    let outsideColumn = 0;
    let internalCellOverflow = 0;
    let columnOverflow = 0;
    let wrongPrintHeight = 0;
    const questionFlowMetrics = [];

    for (const [pageIndex, page] of pages.entries()) {
      const pageRect = page.getBoundingClientRect();
      if (Math.abs(pageRect.height - (296 * 96 / 25.4)) > 6) wrongPrintHeight += 1;
      const columns = [...page.querySelectorAll(".school-exam-column")];
      for (const column of columns) {
        const columnRect = column.getBoundingClientRect();
        if (column.scrollHeight > column.clientHeight + 2) columnOverflow += 1;
        const cells = [...column.querySelectorAll(".worksheet-cell")];

        if (column.classList.contains("school-exam-column--question-flow")) {
          const rects = cells.map((cell) => cell.getBoundingClientRect());
          const gapsMm = [];
          for (let i = 0; i < rects.length - 1; i += 1) {
            gapsMm.push((rects[i + 1].top - rects[i].bottom) * pxToMm);
          }
          const lastRect = rects.at(-1);
          questionFlowMetrics.push({
            pageNumber: pageIndex + 1,
            columnIndex: Number(column.dataset.columnIndex ?? 0),
            itemCount: cells.length,
            configuredGapMm: Number(column.dataset.questionGapMm),
            minGapMm: gapsMm.length ? Math.min(...gapsMm) : null,
            maxGapMm: gapsMm.length ? Math.max(...gapsMm) : null,
            bottomSafeMm: lastRect
              ? (columnRect.bottom - lastRect.bottom) * pxToMm
              : null,
          });
        }

        for (const cell of cells) {
          const rect = cell.getBoundingClientRect();
          if (
            rect.left < pageRect.left - tolerance
            || rect.right > pageRect.right + tolerance
            || rect.top < pageRect.top - tolerance
            || rect.bottom > pageRect.bottom + tolerance
          ) outsidePage += 1;
          if (
            rect.left < columnRect.left - tolerance
            || rect.right > columnRect.right + tolerance
            || rect.top < columnRect.top - tolerance
            || rect.bottom > columnRect.bottom + tolerance
          ) outsideColumn += 1;
          if (
            cell.scrollHeight > cell.clientHeight + 2
            || cell.scrollWidth > cell.clientWidth + 2
          ) internalCellOverflow += 1;
        }
      }
    }

    const questionNumbers = [...document.querySelectorAll(
      ".school-exam-page--questions .school-exam-column--questions .worksheet-cell",
    )].map((cell) => Number(cell.dataset.questionNumber));

    return {
      questionPageCount: questionPages.length,
      answerPageCount: answerPages.length,
      questionColumnCounts: questionPages.map((page) =>
        [...page.querySelectorAll(".school-exam-column--questions")].map(
          (column) => column.querySelectorAll(".worksheet-cell").length,
        ),
      ),
      questionCount: document.querySelectorAll(
        ".school-exam-page--questions .worksheet-cell",
      ).length,
      answerCount: document.querySelectorAll(
        ".school-exam-page--answers .worksheet-cell",
      ).length,
      questionNumbers,
      questionFlowMetrics,
      outsidePage,
      outsideColumn,
      internalCellOverflow,
      columnOverflow,
      wrongPrintHeight,
      layoutMode: document.body.dataset.questionLayoutMode,
      gapMm: Number(document.body.dataset.questionGapMm),
    };
  });

  assert.equal(audit.layoutMode, "actual-height");
  assert.equal(audit.gapMm, 5);
  assert.equal(audit.questionCount, 120);
  assert.equal(audit.answerCount, 120);
  assert.equal(audit.questionPageCount, 4);
  assert.deepEqual(audit.questionColumnCounts, [
    [17, 17],
    [17, 17],
    [17, 17],
    [17, 1],
  ]);
  assert.equal(audit.outsidePage, 0);
  assert.equal(audit.outsideColumn, 0);
  assert.equal(audit.internalCellOverflow, 0);
  assert.equal(audit.columnOverflow, 0);
  assert.equal(audit.wrongPrintHeight, 0);
  assert.deepEqual(
    audit.questionNumbers,
    Array.from({ length: 120 }, (_, index) => index + 1),
  );
  audit.questionFlowMetrics.forEach(assertMetric);

  const firstQuestion = frame.locator(".school-exam-page--questions").first();
  const lastQuestion = frame.locator(".school-exam-page--questions").last();
  const firstPng = await firstQuestion.screenshot({ type: "png" });
  const lastPng = await lastQuestion.screenshot({ type: "png" });

  const evidence = {
    status: "PASS",
    targetDeploymentSha: DEPLOYMENT_SHA,
    liveUrl,
    uiContract,
    previewMeta,
    audit,
    raster: {
      firstQuestionBytes: firstPng.length,
      firstQuestionSha256: createHash("sha256").update(firstPng).digest("hex"),
      lastQuestionBytes: lastPng.length,
      lastQuestionSha256: createHash("sha256").update(lastPng).digest("hex"),
    },
    pageErrors,
    consoleErrors,
    failedRequests,
  };

  console.log("G06_M7_DEPLOYED_E2E=" + JSON.stringify(evidence));

  assert.equal(pageErrors.length, 0, `page errors: ${pageErrors.join(" | ")}`);
  assert.equal(consoleErrors.length, 0, `console errors: ${consoleErrors.join(" | ")}`);
  assert.equal(failedRequests.length, 0, `failed requests: ${JSON.stringify(failedRequests)}`);
} finally {
  if (browser) await browser.close();
}
