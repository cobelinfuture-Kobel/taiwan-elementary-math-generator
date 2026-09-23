import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.S96R_SITE_URL ?? "http://127.0.0.1:4174/index.html";
const OUTPUT_DIR = resolve("docs/curriculum/output/stress/s96r-control-matrix");
const SOURCE_ID = "g5a_u02_5a02";
const QUESTION_MODES = ["concept", "numeric", "application", "reasoning"];
const DEPTH_MODES = ["basic", "extended"];
const CONTEXT_MODES = ["abstract_math", "daily_life", "geometry_context"];
const QUESTION_COUNT = 20;
const QUESTION_CARD_SELECTOR = ".g5a-u02-card--question, .worksheet-cell--question";
const ANSWER_CARD_SELECTOR = ".g5a-u02-card--answer, .worksheet-cell--answer-key";
const PAGE_SELECTOR = ".g5a-u02-page, .worksheet-page";
const CARD_SELECTOR = ".g5a-u02-card, .worksheet-cell";

await mkdir(OUTPUT_DIR, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
const pageErrors = [];
const consoleErrors = [];
page.on("pageerror", (error) => pageErrors.push(error.message));
page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });

const results = [];
try {
  await page.goto(`${BASE_URL}?s96r=${Date.now()}`, { waitUntil: "networkidle" });
  await page.selectOption("#batch-a-source-select", SOURCE_ID);
  await page.selectOption("#batch-a-selection-mode-select", "mixedKnowledgePointsSameUnit");
  await page.fill("#batch-a-question-count-input", String(QUESTION_COUNT));
  await page.check("#batch-a-answer-key-input");

  for (const questionMode of QUESTION_MODES) {
    for (const depthMode of DEPTH_MODES) {
      for (const contextMode of CONTEXT_MODES) {
        const key = `${questionMode}__${depthMode}__${contextMode}`;
        await page.selectOption("#g5a-u08-question-mode", questionMode);
        await page.selectOption("#g5a-u08-depth-mode", depthMode);
        await page.selectOption("#g5a-u08-context-mode", contextMode);
        await page.fill("#generation-seed-input", `s96r-${key}`);
        await page.click("#regenerate-button");
        await page.waitForFunction(() => ["success", "error"].includes(document.querySelector("#status-panel")?.dataset.tone));

        const tone = await page.locator("#status-panel").getAttribute("data-tone");
        const status = (await page.locator("#status-panel").textContent())?.trim() ?? "";
        const validation = (await page.locator("#validation-panel").textContent())?.trim() ?? "";
        const previewMeta = (await page.locator("#preview-meta").textContent())?.trim() ?? "";
        const row = { key, questionMode, depthMode, contextMode, tone, status, validation, previewMeta };

        if (tone === "success") {
          const expectedStatus = `已產生 ${QUESTION_COUNT} 題，可預覽與列印。`;
          if (status !== expectedStatus || !previewMeta.includes(`｜${QUESTION_COUNT} 題｜`)) {
            throw new Error(`S96R_PUBLIC_COUNT_STATUS_MISMATCH ${JSON.stringify({ ...row, expectedStatus })}`);
          }
          const frame = page.frameLocator("#preview-frame");
          await frame.locator("body").waitFor({ state: "attached" });
          row.questionCards = await frame.locator(QUESTION_CARD_SELECTOR).count();
          row.answerCards = await frame.locator(ANSWER_CARD_SELECTOR).count();
          row.pageCount = await frame.locator(PAGE_SELECTOR).count();
          row.sharedQuestionCards = await frame.locator(".worksheet-cell--question").count();
          row.sharedAnswerCards = await frame.locator(".worksheet-cell--answer-key").count();
          row.legacyQuestionCards = await frame.locator(".g5a-u02-card--question").count();
          row.legacyAnswerCards = await frame.locator(".g5a-u02-card--answer").count();
          row.overflowCount = await frame.locator(CARD_SELECTOR).evaluateAll((cards) => cards.filter((node) => node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1).length);
          row.bodyControls = await frame.locator("body").evaluate((body) => ({
            questionMode: body.dataset.publicQuestionMode,
            depthMode: body.dataset.publicDepthMode,
            contextMode: body.dataset.publicContextMode,
            genericFallback: body.dataset.publicGenericFallback,
          }));
          if (row.questionCards !== QUESTION_COUNT || row.answerCards !== QUESTION_COUNT || row.overflowCount !== 0) {
            throw new Error(`S96R_SUCCESS_OUTPUT_INVALID ${JSON.stringify(row)}`);
          }
          if (row.bodyControls.questionMode !== questionMode || row.bodyControls.depthMode !== depthMode || row.bodyControls.contextMode !== contextMode || row.bodyControls.genericFallback !== "false") {
            throw new Error(`S96R_CONTROL_METADATA_MISMATCH ${JSON.stringify(row)}`);
          }
          const html = await page.locator("#preview-frame").evaluate((iframe) => iframe.srcdoc);
          await writeFile(resolve(OUTPUT_DIR, `${key}.html`), html, "utf8");
          const framePage = await browser.newPage({ viewport: { width: 1280, height: 960 } });
          await framePage.setContent(html, { waitUntil: "networkidle" });
          await framePage.emulateMedia({ media: "print" });
          await framePage.pdf({ path: resolve(OUTPUT_DIR, `${key}.pdf`), format: "A4", printBackground: true, preferCSSPageSize: true, margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" } });
          await framePage.close();
        } else {
          row.printDisabled = await page.locator("#print-button").isDisabled();
          if (!row.printDisabled) throw new Error(`S96R_BLOCKED_PRINT_ENABLED ${JSON.stringify(row)}`);
        }
        results.push(row);
      }
    }
  }

  const successCount = results.filter((row) => row.tone === "success").length;
  const blockedCount = results.filter((row) => row.tone === "error").length;
  if (successCount === 0 || blockedCount === 0) throw new Error(`S96R_MATRIX_CLASSIFICATION_INVALID success=${successCount} blocked=${blockedCount}`);
  if (pageErrors.length || consoleErrors.length) throw new Error(`S96R_BROWSER_ERRORS ${JSON.stringify({ pageErrors, consoleErrors })}`);

  const manifest = {
    task: "S96R_G5A_U02_ControlMatrixHTMLPDFStress",
    status: "PASS",
    sourceId: SOURCE_ID,
    matrixSize: results.length,
    successCount,
    blockedCount,
    questionCount: QUESTION_COUNT,
    acceptedRendererSelectors: {
      question: QUESTION_CARD_SELECTOR,
      answer: ANSWER_CARD_SELECTOR,
      page: PAGE_SELECTOR,
    },
    publicCountStatusVerified: true,
    genericFallback: false,
    freeFormAI: false,
    results,
  };
  await writeFile(resolve(OUTPUT_DIR, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(manifest, null, 2));
} catch (error) {
  const failure = {
    task: "S96R_G5A_U02_ControlMatrixHTMLPDFStress",
    status: "FAIL",
    error: error.message,
    results,
    pageErrors,
    consoleErrors,
  };
  await writeFile(resolve(OUTPUT_DIR, "failure.json"), `${JSON.stringify(failure, null, 2)}\n`, "utf8");
  throw error;
} finally {
  await browser.close();
}
