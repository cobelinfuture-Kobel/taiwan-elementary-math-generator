import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import process from "node:process";
import { chromium } from "playwright";

const port = 4174;
const server = spawn(process.execPath, ["tools/site/serve-site.js"], {
  env: { ...process.env, SITE_PORT: String(port), SITE_HOST: "127.0.0.1" },
  stdio: ["ignore", "pipe", "pipe"],
});

let serverOutput = "";
server.stdout.on("data", (chunk) => { serverOutput += chunk.toString(); });
server.stderr.on("data", (chunk) => { serverOutput += chunk.toString(); });

async function waitForServer() {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/exam-template/`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error(`SITE_SERVER_NOT_READY\n${serverOutput}`);
}

async function waitForSelectors(page) {
  await page.waitForFunction(() =>
    (document.querySelector("#exam-grade")?.options?.length ?? 0) > 1
    && (document.querySelector("#exam-semester")?.options?.length ?? 0) > 1
    && (document.querySelector("#exam-source")?.options?.length ?? 0) > 1
  );
}

async function selectUnit(page, { grade, semester, sourceId }) {
  await page.selectOption("#exam-grade", String(grade));
  await page.selectOption("#exam-semester", semester);
  await page.selectOption("#exam-source", sourceId);
}

async function generate(page, { mode, count, seed }) {
  await page.selectOption("#exam-composition-mode", mode);
  await page.fill("#exam-question-count", String(count));
  await page.fill("#exam-seed", seed);
  await page.click("#exam-generate");
  await page.waitForFunction(() =>
    document.querySelector("#exam-status")?.dataset?.tone === "success"
    && document.querySelector("#exam-preview")?.getAttribute("srcdoc")?.includes("school-exam-page")
  );
  const iframe = await page.$("#exam-preview");
  const frame = await iframe.contentFrame();
  assert.ok(frame, "M6_PREVIEW_FRAME_MISSING");
  await frame.waitForSelector(".school-exam-page");
  return frame;
}

async function visualAudit(page, frame, scenarioId) {
  const screenAudit = await frame.evaluate(() => {
    const pages = [...document.querySelectorAll(".school-exam-page")];
    const questionPages = pages.filter((node) => node.dataset.pageType === "question");
    const answerPages = pages.filter((node) => node.dataset.pageType === "answer");
    const columnStats = questionPages.map((page) => {
      const columns = [...page.querySelectorAll(".school-exam-column--questions")];
      return {
        counts: columns.map((column) => column.querySelectorAll(".worksheet-cell").length),
        display: getComputedStyle(page.querySelector(".school-exam-columns")).display,
        gridTemplateColumns: getComputedStyle(page.querySelector(".school-exam-columns")).gridTemplateColumns,
      };
    });
    return {
      totalPages: pages.length,
      questionPages: questionPages.length,
      answerPages: answerPages.length,
      layoutVersions: [...new Set(pages.map((node) => node.dataset.layoutVersion))],
      columnStats,
      questionCellCount: document.querySelectorAll(".school-exam-page--questions .worksheet-cell").length,
      answerCellCount: document.querySelectorAll(".school-exam-page--answers .worksheet-cell").length,
      bodyTextLength: document.body.innerText.trim().length,
    };
  });

  assert.ok(screenAudit.questionPages > 0, `${scenarioId}: no question pages`);
  assert.ok(screenAudit.answerPages > 0, `${scenarioId}: no answer pages`);
  assert.deepEqual(screenAudit.layoutVersions, ["school_exam_layout_v1_1"], `${scenarioId}: wrong layout version`);
  assert.ok(screenAudit.questionCellCount > 0, `${scenarioId}: no question cells`);
  assert.equal(screenAudit.answerCellCount, screenAudit.questionCellCount, `${scenarioId}: answer parity`);
  assert.ok(screenAudit.bodyTextLength > 100, `${scenarioId}: preview looks blank`);

  for (let i = 0; i < screenAudit.columnStats.length; i += 1) {
    const stat = screenAudit.columnStats[i];
    assert.equal(stat.display, "grid", `${scenarioId}: page ${i + 1} not grid`);
    assert.equal(stat.counts.length, 2, `${scenarioId}: page ${i + 1} missing second column`);
    if (i < screenAudit.columnStats.length - 1) {
      assert.ok(stat.counts[0] > 0 && stat.counts[1] > 0, `${scenarioId}: non-final page has empty column`);
    }
  }

  await page.emulateMedia({ media: "print" });
  const printAudit = await frame.evaluate(() => {
    const tolerance = 1.5;
    const pages = [...document.querySelectorAll(".school-exam-page")];
    let outsidePage = 0;
    let outsideColumn = 0;
    let internalCellOverflow = 0;
    let columnOverflow = 0;
    let wrongPrintHeight = 0;

    const details = pages.map((page) => {
      const pageRect = page.getBoundingClientRect();
      if (Math.abs(pageRect.height - (296 * 96 / 25.4)) > 6) wrongPrintHeight += 1;
      const columns = [...page.querySelectorAll(".school-exam-column")];
      for (const column of columns) {
        if (column.scrollHeight > column.clientHeight + 2) columnOverflow += 1;
        const columnRect = column.getBoundingClientRect();
        for (const cell of column.querySelectorAll(".worksheet-cell")) {
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
          if (cell.scrollHeight > cell.clientHeight + 2 || cell.scrollWidth > cell.clientWidth + 2) {
            internalCellOverflow += 1;
          }
        }
      }
      return {
        type: page.dataset.pageType,
        width: pageRect.width,
        height: pageRect.height,
        columns: columns.map((column) => column.querySelectorAll(".worksheet-cell").length),
      };
    });

    const qPages = details.filter((row) => row.type === "question");
    const aPages = details.filter((row) => row.type === "answer");
    const questionItems = qPages.reduce((sum, row) => sum + row.columns.reduce((a, b) => a + b, 0), 0);
    const answerItems = aPages.reduce((sum, row) => sum + row.columns.reduce((a, b) => a + b, 0), 0);

    return {
      outsidePage,
      outsideColumn,
      internalCellOverflow,
      columnOverflow,
      wrongPrintHeight,
      questionPageCount: qPages.length,
      answerPageCount: aPages.length,
      questionItems,
      answerItems,
      averageQuestionItemsPerPage: questionItems / qPages.length,
      averageAnswerItemsPerPage: answerItems / aPages.length,
      details,
    };
  });

  assert.equal(printAudit.outsidePage, 0, `${scenarioId}: cells outside A4 page`);
  assert.equal(printAudit.outsideColumn, 0, `${scenarioId}: cells outside assigned column`);
  assert.equal(printAudit.internalCellOverflow, 0, `${scenarioId}: clipped cell content`);
  assert.equal(printAudit.columnOverflow, 0, `${scenarioId}: clipped column content`);
  assert.equal(printAudit.wrongPrintHeight, 0, `${scenarioId}: print page is not fixed 296mm`);
  assert.equal(printAudit.questionItems, printAudit.answerItems, `${scenarioId}: print answer parity`);
  assert.ok(
    printAudit.averageAnswerItemsPerPage >= printAudit.averageQuestionItemsPerPage,
    `${scenarioId}: answer packing is not denser`,
  );

  const firstQuestion = frame.locator(".school-exam-page--questions").first();
  const firstAnswer = frame.locator(".school-exam-page--answers").first();
  const questionPng = await firstQuestion.screenshot({ type: "png" });
  const answerPng = await firstAnswer.screenshot({ type: "png" });
  assert.ok(questionPng.length > 5000, `${scenarioId}: question raster looks empty`);
  assert.ok(answerPng.length > 5000, `${scenarioId}: answer raster looks empty`);

  const raster = {
    questionBytes: questionPng.length,
    questionSha256: createHash("sha256").update(questionPng).digest("hex"),
    answerBytes: answerPng.length,
    answerSha256: createHash("sha256").update(answerPng).digest("hex"),
  };

  await page.emulateMedia({ media: "screen" });
  return { screenAudit, printAudit, raster };
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1800, height: 1200 } });
  const pageErrors = [];
  const consoleErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error?.stack ?? error?.message ?? String(error)));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto(`http://127.0.0.1:${port}/exam-template/`, { waitUntil: "networkidle" });
  await waitForSelectors(page);

  const results = [];

  await selectUnit(page, { grade: 3, semester: "upper", sourceId: "g3a_u02_3a02" });
  let frame = await generate(page, {
    mode: "SINGLE_UNIT",
    count: 60,
    seed: "g06-m6-single-arithmetic",
  });
  results.push({
    scenarioId: "SINGLE_UNIT_ARITHMETIC_60",
    ...(await visualAudit(page, frame, "SINGLE_UNIT_ARITHMETIC_60")),
  });

  await selectUnit(page, { grade: 3, semester: "upper", sourceId: "g3a_u05_3a05" });
  frame = await generate(page, {
    mode: "SINGLE_UNIT",
    count: 20,
    seed: "g06-m6-single-geometry",
  });
  results.push({
    scenarioId: "SINGLE_UNIT_GEOMETRY_20",
    ...(await visualAudit(page, frame, "SINGLE_UNIT_GEOMETRY_20")),
  });

  await selectUnit(page, { grade: 3, semester: "upper", sourceId: "g3a_u02_3a02" });
  const sameUnitOption = page.locator('#exam-composition-mode option[value="MIXED_KP_SAME_UNIT"]');
  assert.equal(await sameUnitOption.isDisabled(), false, "M6_SAME_UNIT_MODE_NOT_AVAILABLE_FOR_G3A_U02");
  frame = await generate(page, {
    mode: "MIXED_KP_SAME_UNIT",
    count: 30,
    seed: "g06-m6-same-unit-mixed",
  });
  results.push({
    scenarioId: "MIXED_KP_SAME_UNIT_30",
    ...(await visualAudit(page, frame, "MIXED_KP_SAME_UNIT_30")),
  });

  await selectUnit(page, { grade: 3, semester: "upper", sourceId: "g3a_u02_3a02" });
  const crossOption = page.locator('#exam-composition-mode option[value="MIXED_KP_CROSS_UNIT"]');
  assert.equal(await crossOption.isDisabled(), false, "M6_CROSS_UNIT_MODE_NOT_AVAILABLE_FOR_G3_UPPER");
  frame = await generate(page, {
    mode: "MIXED_KP_CROSS_UNIT",
    count: 30,
    seed: "g06-m6-cross-unit-mixed",
  });
  results.push({
    scenarioId: "MIXED_KP_CROSS_UNIT_30",
    ...(await visualAudit(page, frame, "MIXED_KP_CROSS_UNIT_30")),
  });

  console.log("G06_M6_ACTUAL_VISUAL_QA=" + JSON.stringify({
    status: "PASS",
    scenarioCount: results.length,
    results,
    pageErrors,
    consoleErrors,
  }));

  assert.equal(pageErrors.length, 0, `page errors: ${pageErrors.join(" | ")}`);
  assert.equal(consoleErrors.length, 0, `console errors: ${consoleErrors.join(" | ")}`);
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
}
