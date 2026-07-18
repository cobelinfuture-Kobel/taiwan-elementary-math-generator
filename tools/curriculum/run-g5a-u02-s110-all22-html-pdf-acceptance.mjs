import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

import { buildG5AU02BrowserDynamicWorksheet } from "../../site/modules/curriculum/batch-b/g5a-u02-browser-dynamic-runtime.bundle.js";
import { getG5AU02HiddenPatternSpecs } from "../../site/modules/curriculum/batch-b/source-pattern-g5a-u02-extension.js";
import { projectG5AU02DynamicDocumentForGlobalLayout } from "../../site/modules/curriculum/batch-a/g5a-u02-global-layout-projection.js";
import { applyGlobalPublicLayoutOverlay } from "../../site/modules/curriculum/batch-a/global-public-layout-overlay.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer-s73-extension.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outputRoot = path.join(root, "docs/curriculum/output/g5a-u02-s110");
const htmlRoot = path.join(outputRoot, "html");
const pdfRoot = path.join(outputRoot, "pdf");
const acceptance = JSON.parse(readFileSync(path.join(root, "data/curriculum/contracts/G5AU02_S110_All22IntegratedAcceptance.json"), "utf8"));
const layoutContract = JSON.parse(readFileSync(path.join(root, "data/curriculum/contracts/GLM_S00_PublicCompletedUnit18LayoutContract.json"), "utf8"));
const printCss = readFileSync(path.join(root, "site/assets/styles/print-styles.css"), "utf8");
const SOURCE_ID = "g5a_u02_5a02";
const RENDERER_PROFILE = acceptance.authority.rendererProfile;
const ANSWER_COLUMNS = 1;
const ANSWER_ROWS = 5;
const PATTERNS = Object.freeze([...getG5AU02HiddenPatternSpecs()].sort((a, b) => a.patternOrder - b.patternOrder));
const APPROVED_LAYOUTS = Object.freeze(layoutContract.approvedLayouts);
const BOUNDARY_LAYOUT_IDS = Object.freeze(acceptance.acceptance.answerBoundaryMatrix.layouts);
const BOUNDARY_LAYOUTS = Object.freeze(BOUNDARY_LAYOUT_IDS.map((id) => APPROVED_LAYOUTS.find((layout) => layout.layoutId === id)));

function slug(id) { return id.replace(/^ps_g5a_u02_/, ""); }
function cellsFor(layout) { return layout.columns * layout.rowsPerPage; }

function buildScenario(patternSpecId, layout, seed, includeAnswerKey) {
  const built = buildG5AU02BrowserDynamicWorksheet({
    sourceId: SOURCE_ID,
    patternSpecIds: [patternSpecId],
    questionCount: cellsFor(layout),
    generationSeed: seed,
    includeAnswerKey,
    questionRowsPerPage: cellsFor(layout),
    answerRowsPerPage: ANSWER_ROWS,
  });
  if (!built?.ok) throw new Error(`S110_GENERATION_BLOCKED:${patternSpecId}:${layout.layoutId}:${built?.errors?.join(",")}`);
  const projected = projectG5AU02DynamicDocumentForGlobalLayout({ ok: true, errors: [], worksheetDocument: built.worksheetDocument });
  if (!projected?.ok) throw new Error(`S110_PROJECTION_BLOCKED:${patternSpecId}:${layout.layoutId}:${projected?.errors?.join(",")}`);
  const overlaid = applyGlobalPublicLayoutOverlay(projected, {
    sourceId: SOURCE_ID,
    includeAnswerKey,
    printLayout: { columns: layout.columns, rowsPerPage: layout.rowsPerPage },
  });
  if (!overlaid?.ok) throw new Error(`S110_LAYOUT_OVERLAY_BLOCKED:${patternSpecId}:${layout.layoutId}:${JSON.stringify(overlaid?.errors ?? [])}`);
  const document = overlaid.worksheetDocument;
  if (document.layoutResolution?.layoutExact !== true
    || document.layoutResolution?.resolvedQuestionLayout?.columns !== layout.columns
    || document.layoutResolution?.resolvedQuestionLayout?.rowsPerPage !== layout.rowsPerPage) {
    throw new Error(`S110_LAYOUT_RESOLUTION_MISMATCH:${patternSpecId}:${layout.layoutId}`);
  }
  if (document.layoutResolution?.resolvedAnswerLayout?.columns !== ANSWER_COLUMNS
    || document.layoutResolution?.resolvedAnswerLayout?.rowsPerPage !== ANSWER_ROWS) {
    throw new Error(`S110_ANSWER_PROFILE_MISMATCH:${patternSpecId}:${layout.layoutId}`);
  }
  return document;
}

function relabelPages(pages, layoutId, type) {
  return pages.map((page, index) => ({
    ...page,
    pageNumber: type === "question" ? layoutId : `${layoutId}-a${index + 1}`,
    s110LayoutId: layoutId,
    s110PageType: type,
  }));
}

function combineDocuments(documents, layouts, includeAnswerKey, patternSpecId) {
  const questionPages = documents.flatMap((document, index) => relabelPages(document.questionPages, layouts[index].layoutId, "question"));
  const answerKeyPages = includeAnswerKey
    ? documents.flatMap((document, index) => relabelPages(document.answerKeyPages, layouts[index].layoutId, "answer"))
    : [];
  return {
    ...documents[0],
    title: `G5A-U02 S110 ${patternSpecId}`,
    questionDisplayModels: documents.flatMap((document) => document.questionDisplayModels),
    answerKeyItems: includeAnswerKey ? documents.flatMap((document) => document.answerKeyItems) : [],
    questionPages,
    answerKeyPages,
    answerKeyEnabled: includeAnswerKey,
  };
}

function htmlWithCss(document) {
  return renderWorksheetDocumentToHtml(document, { stylesheetHref: "" })
    .replace("</head>", `<style id="s110-print-authority">${printCss}</style></head>`);
}

function expectedQuestionPages(layouts) {
  return layouts.map((layout) => ({
    layoutId: layout.layoutId,
    columns: layout.columns,
    rows: layout.rowsPerPage,
    cardCount: cellsFor(layout),
    answer: false,
  }));
}

function expectedAnswerPages(layouts) {
  return layouts.flatMap((layout) => {
    const total = cellsFor(layout);
    const pages = Math.ceil(total / (ANSWER_COLUMNS * ANSWER_ROWS));
    return Array.from({ length: pages }, (_, index) => ({
      layoutId: layout.layoutId,
      columns: ANSWER_COLUMNS,
      rows: ANSWER_ROWS,
      cardCount: Math.min(ANSWER_ROWS, total - index * ANSWER_ROWS),
      answer: true,
      localPage: index + 1,
    }));
  });
}

async function inspectHtml(page, htmlPath, expectedQuestions, expectedAnswers) {
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print" });
  return page.evaluate(({ expectedQuestions, expectedAnswers, rendererProfile }) => {
    function clusters(values) {
      const rows = [];
      for (const value of [...values].sort((a, b) => a - b)) {
        const existing = rows.find((row) => Math.abs(row.center - value) <= 2);
        if (existing) {
          existing.values.push(value);
          existing.center = existing.values.reduce((sum, item) => sum + item, 0) / existing.values.length;
        } else rows.push({ center: value, values: [value] });
      }
      return rows.map((row) => Number(row.center.toFixed(2)));
    }
    function overlapCount(nodes) {
      const boxes = nodes.map((node) => node.getBoundingClientRect());
      let count = 0;
      for (let left = 0; left < boxes.length; left += 1) {
        for (let right = left + 1; right < boxes.length; right += 1) {
          const a = boxes[left];
          const b = boxes[right];
          if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1
            && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1) count += 1;
        }
      }
      return count;
    }
    function inspectPage(node, expected) {
      const selector = expected.answer ? ".worksheet-cell--answer-key" : ".worksheet-cell--question";
      const cards = [...node.querySelectorAll(selector)].filter((card) => getComputedStyle(card).display !== "none");
      const grid = node.querySelector(".worksheet-page__grid");
      const actual = clusters(cards.map((card) => card.getBoundingClientRect().left));
      const computedColumns = grid ? getComputedStyle(grid).gridTemplateColumns.split(/\s+/).filter(Boolean).length : 0;
      const computedRows = grid ? getComputedStyle(grid).gridTemplateRows.split(/\s+/).filter(Boolean).length : 0;
      const cardOverflowCount = cards.filter((card) => card.scrollHeight > card.clientHeight + 1 || card.scrollWidth > card.clientWidth + 1).length;
      const pageOverflow = node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1;
      const overlaps = overlapCount(cards);
      return {
        ...expected,
        cardCount: cards.length,
        actualColumnCount: actual.length,
        xClusters: actual,
        computedGridColumnCount: computedColumns,
        computedGridRowCount: computedRows,
        cardOverflowCount,
        pageOverflow,
        overlapCount: overlaps,
        pass: cards.length === expected.cardCount
          && actual.length === expected.columns
          && computedColumns === expected.columns
          && computedRows === expected.rows
          && cardOverflowCount === 0
          && !pageOverflow
          && overlaps === 0,
      };
    }
    const questionNodes = [...document.querySelectorAll('.worksheet-page[data-page-type="question"]')];
    const answerNodes = [...document.querySelectorAll('.worksheet-page[data-page-type="answer"]')];
    const questionResults = questionNodes.map((node, index) => inspectPage(node, expectedQuestions[index]));
    const answerResults = answerNodes.map((node, index) => inspectPage(node, expectedAnswers[index]));
    const questionSection = document.querySelector(".worksheet-section--questions");
    const answerSection = document.querySelector(".worksheet-section--answer-key");
    const answerNodeInQuestionSectionCount = questionSection?.querySelectorAll(".worksheet-cell__answer").length ?? 0;
    const internalIdLeakCount = (document.body.innerText.match(/\b(?:ps|fm|fmc|pg|kp)_g5a_u02_[a-z0-9_]+\b/gi) ?? []).length;
    return {
      rendererProfile: document.body.dataset.rendererProfile,
      questionResults,
      answerResults,
      answerSectionPresent: Boolean(answerSection),
      answerNodeInQuestionSectionCount,
      internalIdLeakCount,
      pass: document.body.dataset.rendererProfile === rendererProfile
        && questionNodes.length === expectedQuestions.length
        && answerNodes.length === expectedAnswers.length
        && questionResults.every((row) => row.pass)
        && answerResults.every((row) => row.pass)
        && Boolean(answerSection) === (expectedAnswers.length > 0)
        && answerNodeInQuestionSectionCount === 0
        && internalIdLeakCount === 0,
    };
  }, { expectedQuestions, expectedAnswers, rendererProfile: RENDERER_PROFILE });
}

function verifyPdf(pdfPath, expectedPageCount) {
  try {
    const info = execFileSync("pdfinfo", [pdfPath], { encoding: "utf8" });
    const pageCount = Number(info.match(/^Pages:\s+(\d+)/m)?.[1]);
    const bboxPath = pdfPath.replace(/\.pdf$/i, ".bbox.html");
    execFileSync("pdftotext", ["-bbox-layout", pdfPath, bboxPath]);
    const bbox = readFileSync(bboxPath, "utf8");
    const pages = [...bbox.matchAll(/<page[^>]*width="([0-9.]+)"[^>]*height="([0-9.]+)"[^>]*>([\s\S]*?)<\/page>/g)];
    let blankPageCount = 0;
    let bboxOverflowCount = 0;
    for (const page of pages) {
      const width = Number(page[1]);
      const height = Number(page[2]);
      const words = [...page[3].matchAll(/<word[^>]*xMin="([0-9.]+)"[^>]*yMin="([0-9.]+)"[^>]*xMax="([0-9.]+)"[^>]*yMax="([0-9.]+)"/g)];
      if (words.length === 0) blankPageCount += 1;
      for (const word of words) {
        const [x0, y0, x1, y1] = word.slice(1).map(Number);
        if (x0 < -0.5 || y0 < -0.5 || x1 > width + 0.5 || y1 > height + 0.5) bboxOverflowCount += 1;
      }
    }
    return {
      expectedPageCount,
      pageCount,
      bboxPageCount: pages.length,
      blankPageCount,
      bboxOverflowCount,
      pass: pageCount === expectedPageCount && pages.length === expectedPageCount && blankPageCount === 0 && bboxOverflowCount === 0,
    };
  } catch (error) {
    return { expectedPageCount, pass: false, error: error.message };
  }
}

rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(htmlRoot, { recursive: true });
mkdirSync(pdfRoot, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ["--allow-file-access-from-files"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
const layoutResults = [];
const boundaryResults = [];

try {
  for (const [patternIndex, spec] of PATTERNS.entries()) {
    const patternSpecId = spec.patternSpecId;
    const documents = APPROVED_LAYOUTS.map((layout, index) => buildScenario(patternSpecId, layout, 1100000 + patternIndex * 100 + index + 1, false));
    const combined = combineDocuments(documents, APPROVED_LAYOUTS, false, patternSpecId);
    const htmlPath = path.join(htmlRoot, `${slug(patternSpecId)}-18-layouts.html`);
    const pdfPath = path.join(pdfRoot, `${slug(patternSpecId)}-18-layouts.pdf`);
    writeFileSync(htmlPath, htmlWithCss(combined), "utf8");
    const expectedQuestions = expectedQuestionPages(APPROVED_LAYOUTS);
    const inspection = await inspectHtml(page, htmlPath, expectedQuestions, []);
    await page.pdf({ path: pdfPath, format: "A4", printBackground: true, preferCSSPageSize: true, margin: { top: "0", right: "0", bottom: "0", left: "0" } });
    const pdf = verifyPdf(pdfPath, expectedQuestions.length);
    for (const row of inspection.questionResults) layoutResults.push({
      patternOrder: spec.patternOrder,
      patternSpecId,
      ...row,
      rendererProfile: inspection.rendererProfile,
      internalIdLeakCount: inspection.internalIdLeakCount,
      pdf,
      status: row.pass && pdf.pass && inspection.internalIdLeakCount === 0 ? "PASS" : "FAIL",
    });

    for (const includeAnswerKey of [false, true]) {
      const boundaryDocuments = BOUNDARY_LAYOUTS.map((layout, index) => buildScenario(patternSpecId, layout, 1200000 + patternIndex * 100 + index + 1, includeAnswerKey));
      const boundaryDocument = combineDocuments(boundaryDocuments, BOUNDARY_LAYOUTS, includeAnswerKey, patternSpecId);
      const state = includeAnswerKey ? "answers-on" : "answers-off";
      const boundaryHtmlPath = path.join(htmlRoot, `${slug(patternSpecId)}-${state}.html`);
      const boundaryPdfPath = path.join(pdfRoot, `${slug(patternSpecId)}-${state}.pdf`);
      writeFileSync(boundaryHtmlPath, htmlWithCss(boundaryDocument), "utf8");
      const expectedQuestionsForBoundary = expectedQuestionPages(BOUNDARY_LAYOUTS);
      const expectedAnswersForBoundary = includeAnswerKey ? expectedAnswerPages(BOUNDARY_LAYOUTS) : [];
      const boundaryInspection = await inspectHtml(page, boundaryHtmlPath, expectedQuestionsForBoundary, expectedAnswersForBoundary);
      await page.pdf({ path: boundaryPdfPath, format: "A4", printBackground: true, preferCSSPageSize: true, margin: { top: "0", right: "0", bottom: "0", left: "0" } });
      const boundaryPdf = verifyPdf(boundaryPdfPath, expectedQuestionsForBoundary.length + expectedAnswersForBoundary.length);
      for (const question of boundaryInspection.questionResults) {
        const relatedAnswers = boundaryInspection.answerResults.filter((answer) => answer.layoutId === question.layoutId);
        const boundaryPass = boundaryInspection.answerSectionPresent === includeAnswerKey
          && boundaryInspection.answerNodeInQuestionSectionCount === 0
          && boundaryInspection.internalIdLeakCount === 0
          && relatedAnswers.every((answer) => answer.pass);
        boundaryResults.push({
          patternOrder: spec.patternOrder,
          patternSpecId,
          layoutId: question.layoutId,
          includeAnswerKey,
          question,
          answerPages: relatedAnswers,
          answerSectionPresent: boundaryInspection.answerSectionPresent,
          answerNodeInQuestionSectionCount: boundaryInspection.answerNodeInQuestionSectionCount,
          internalIdLeakCount: boundaryInspection.internalIdLeakCount,
          pdf: boundaryPdf,
          status: question.pass && boundaryPass && boundaryPdf.pass ? "PASS" : "FAIL",
        });
      }
    }
  }
} finally {
  await page.close();
  await browser.close();
}

const layoutManifest = {
  schemaName: "G5AU02S110All22LayoutMatrixManifest",
  schemaVersion: 1,
  task: acceptance.task,
  rendererProfile: RENDERER_PROFILE,
  patternCount: PATTERNS.length,
  layoutsPerPattern: APPROVED_LAYOUTS.length,
  scenarioCount: layoutResults.length,
  passCount: layoutResults.filter((row) => row.status === "PASS").length,
  failureCount: layoutResults.filter((row) => row.status !== "PASS").length,
  status: layoutResults.length === 396 && layoutResults.every((row) => row.status === "PASS") ? "PASS" : "FAIL",
  results: layoutResults,
};
const boundaryManifest = {
  schemaName: "G5AU02S110All22AnswerBoundaryManifest",
  schemaVersion: 1,
  task: acceptance.task,
  rendererProfile: RENDERER_PROFILE,
  answerProfile: { columns: ANSWER_COLUMNS, rowsPerPage: ANSWER_ROWS },
  patternCount: PATTERNS.length,
  layouts: BOUNDARY_LAYOUT_IDS,
  answerStates: ["off", "on"],
  scenarioCount: boundaryResults.length,
  passCount: boundaryResults.filter((row) => row.status === "PASS").length,
  failureCount: boundaryResults.filter((row) => row.status !== "PASS").length,
  status: boundaryResults.length === 132 && boundaryResults.every((row) => row.status === "PASS") ? "PASS" : "FAIL",
  results: boundaryResults,
};
writeFileSync(path.join(outputRoot, "layout-manifest.json"), `${JSON.stringify(layoutManifest, null, 2)}\n`, "utf8");
writeFileSync(path.join(outputRoot, "answer-boundary-manifest.json"), `${JSON.stringify(boundaryManifest, null, 2)}\n`, "utf8");
const failures = [
  ...layoutResults.filter((row) => row.status !== "PASS").slice(0, 20),
  ...boundaryResults.filter((row) => row.status !== "PASS").slice(0, 20),
];
console.log(JSON.stringify({
  layout: { scenarioCount: layoutManifest.scenarioCount, passCount: layoutManifest.passCount, status: layoutManifest.status },
  answerBoundary: { scenarioCount: boundaryManifest.scenarioCount, passCount: boundaryManifest.passCount, status: boundaryManifest.status },
  firstFailures: failures,
}, null, 2));
if (layoutManifest.status !== "PASS" || boundaryManifest.status !== "PASS") process.exitCode = 1;
