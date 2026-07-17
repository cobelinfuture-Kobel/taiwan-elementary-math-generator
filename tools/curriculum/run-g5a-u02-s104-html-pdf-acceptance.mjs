import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

import { buildG5AU02BrowserDynamicWorksheet } from "../../site/modules/curriculum/batch-b/g5a-u02-browser-dynamic-runtime.bundle.js";
import { projectG5AU02DynamicDocumentForGlobalLayout } from "../../site/modules/curriculum/batch-a/g5a-u02-global-layout-projection.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer-s73-extension.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outputRoot = path.join(root, "docs/curriculum/output/g5a-u02-s104");
const htmlRoot = path.join(outputRoot, "html");
const pdfRoot = path.join(outputRoot, "pdf");
const contract = JSON.parse(readFileSync(path.join(root, "data/curriculum/contracts/G5AU02_S99_P0SourceMethodAndRepresentationFullFixContract.json"), "utf8"));
const layoutContract = JSON.parse(readFileSync(path.join(root, "data/curriculum/contracts/GLM_S00_PublicCompletedUnit18LayoutContract.json"), "utf8"));
const printCss = readFileSync(path.join(root, "site/assets/styles/print-styles.css"), "utf8");
const SOURCE_ID = "g5a_u02_5a02";
const P0_PATTERNS = Object.freeze(contract.patternContracts.map((row) => row.patternSpecId));
const APPROVED_LAYOUTS = Object.freeze(layoutContract.approvedLayouts);
const BOUNDARY_LAYOUT_IDS = Object.freeze(contract.acceptance.answerBoundaryMatrix.layouts);
const BOUNDARY_LAYOUTS = Object.freeze(BOUNDARY_LAYOUT_IDS.map((id) => APPROVED_LAYOUTS.find((layout) => layout.layoutId === id)));

function slug(id) { return id.replace(/^ps_g5a_u02_/, ""); }

function buildProjected(patternSpecId, layout, seed, includeAnswerKey) {
  const questionCount = layout.columns * layout.rowsPerPage;
  const built = buildG5AU02BrowserDynamicWorksheet({
    sourceId: SOURCE_ID,
    patternSpecIds: [patternSpecId],
    questionCount,
    generationSeed: seed,
    includeAnswerKey,
    questionRowsPerPage: questionCount,
    answerRowsPerPage: questionCount,
  });
  if (!built?.ok) throw new Error(`S104_GENERATION_BLOCKED:${patternSpecId}:${layout.layoutId}:${built?.errors?.join(",")}`);
  const projected = projectG5AU02DynamicDocumentForGlobalLayout({ ok: true, errors: [], worksheetDocument: built.worksheetDocument });
  if (!projected?.ok) throw new Error(`S104_PROJECTION_BLOCKED:${patternSpecId}:${layout.layoutId}:${projected?.errors?.join(",")}`);
  return projected.worksheetDocument;
}

function questionPage(document, layout) {
  return {
    pageNumber: layout.layoutId,
    columns: layout.columns,
    cells: document.questionDisplayModels.map((displayModel) => ({ cellType: "question", questionNumber: displayModel.questionNumber, displayModel })),
  };
}

function answerPage(document, layout) {
  return {
    pageNumber: `answer-${layout.layoutId}`,
    columns: 1,
    cells: document.answerKeyItems.map((answerKeyItem) => ({ cellType: "answerKey", answerKeyItem })),
  };
}

function combinedDocument(documents, layouts, includeAnswerKey) {
  return {
    ...documents[0],
    title: "G5A-U02 S104 P0 Integrated Acceptance",
    questionDisplayModels: documents.flatMap((document) => document.questionDisplayModels),
    answerKeyItems: includeAnswerKey ? documents.flatMap((document) => document.answerKeyItems) : [],
    questionPages: documents.map((document, index) => questionPage(document, layouts[index])),
    answerKeyPages: includeAnswerKey ? documents.map((document, index) => answerPage(document, layouts[index])) : [],
    answerKeyEnabled: includeAnswerKey,
  };
}

function htmlWithCss(document) {
  return renderWorksheetDocumentToHtml(document, { stylesheetHref: "" })
    .replace("</head>", `<style id="s104-print-authority">${printCss}</style></head>`);
}

async function inspectHtml(page, htmlPath, expectedLayouts, includeAnswerKey) {
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print" });
  return page.evaluate(({ expectedLayouts, includeAnswerKey }) => {
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
    function inspectPage(node, expected, answer) {
      const cards = [...node.querySelectorAll(answer ? ".worksheet-cell--answer-key" : ".worksheet-cell--question")]
        .filter((card) => getComputedStyle(card).display !== "none");
      const grid = node.querySelector(".worksheet-page__grid");
      const actual = clusters(cards.map((card) => card.getBoundingClientRect().left));
      const computedColumns = grid ? getComputedStyle(grid).gridTemplateColumns.split(/\s+/).filter(Boolean).length : 0;
      const cardOverflowCount = cards.filter((card) => card.scrollHeight > card.clientHeight + 1 || card.scrollWidth > card.clientWidth + 1).length;
      const pageOverflow = node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1;
      const overlaps = overlapCount(cards);
      const expectedColumns = answer ? 1 : expected.columns;
      const expectedCardCount = expected.columns * expected.rowsPerPage;
      return {
        layoutId: expected.layoutId,
        answer,
        expectedColumns,
        expectedCardCount,
        cardCount: cards.length,
        actualColumnCount: actual.length,
        xClusters: actual,
        computedGridColumnCount: computedColumns,
        cardOverflowCount,
        pageOverflow,
        overlapCount: overlaps,
        pageClientWidth: node.clientWidth,
        pageScrollWidth: node.scrollWidth,
        pageClientHeight: node.clientHeight,
        pageScrollHeight: node.scrollHeight,
        pass: cards.length === expectedCardCount
          && actual.length === expectedColumns
          && computedColumns === expectedColumns
          && cardOverflowCount === 0
          && !pageOverflow
          && overlaps === 0,
      };
    }
    const questionNodes = [...document.querySelectorAll('.worksheet-page[data-page-type="question"]')];
    const answerNodes = [...document.querySelectorAll('.worksheet-page[data-page-type="answer"]')];
    const questionResults = questionNodes.map((node, index) => inspectPage(node, expectedLayouts[index], false));
    const answerResults = answerNodes.map((node, index) => inspectPage(node, expectedLayouts[index], true));
    const questionSection = document.querySelector(".worksheet-section--questions");
    const answerSection = document.querySelector(".worksheet-section--answer-key");
    const answerNodeInQuestionSectionCount = questionSection?.querySelectorAll(".worksheet-cell__answer").length ?? 0;
    const internalIdLeakCount = (document.body.innerText.match(/\b(?:ps|fm|fmc|pg|kp)_g5a_u02_[a-z0-9_]+\b/gi) ?? []).length;
    return {
      rendererProfile: document.body.dataset.rendererProfile,
      questionPageCount: questionNodes.length,
      answerPageCount: answerNodes.length,
      questionResults,
      answerResults,
      answerSectionPresent: Boolean(answerSection),
      answerNodeInQuestionSectionCount,
      internalIdLeakCount,
      pass: document.body.dataset.rendererProfile === "g5a_u02_pre_s104_semantic_v1"
        && questionNodes.length === expectedLayouts.length
        && answerNodes.length === (includeAnswerKey ? expectedLayouts.length : 0)
        && questionResults.every((row) => row.pass)
        && answerResults.every((row) => row.pass)
        && Boolean(answerSection) === includeAnswerKey
        && answerNodeInQuestionSectionCount === 0
        && internalIdLeakCount === 0,
    };
  }, { expectedLayouts, includeAnswerKey });
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
  for (const [patternIndex, patternSpecId] of P0_PATTERNS.entries()) {
    const documents = APPROVED_LAYOUTS.map((layout, index) => buildProjected(patternSpecId, layout, 104000 + patternIndex * 100 + index + 1, false));
    const combined = combinedDocument(documents, APPROVED_LAYOUTS, false);
    const htmlPath = path.join(htmlRoot, `${slug(patternSpecId)}-18-layouts.html`);
    const pdfPath = path.join(pdfRoot, `${slug(patternSpecId)}-18-layouts.pdf`);
    writeFileSync(htmlPath, htmlWithCss(combined), "utf8");
    const inspection = await inspectHtml(page, htmlPath, APPROVED_LAYOUTS, false);
    await page.pdf({ path: pdfPath, format: "A4", printBackground: true, preferCSSPageSize: true, margin: { top: "0", right: "0", bottom: "0", left: "0" } });
    const pdf = verifyPdf(pdfPath, APPROVED_LAYOUTS.length);
    for (const row of inspection.questionResults) layoutResults.push({
      patternSpecId,
      ...row,
      rendererProfile: inspection.rendererProfile,
      internalIdLeakCount: inspection.internalIdLeakCount,
      pdf,
      status: row.pass && pdf.pass && inspection.internalIdLeakCount === 0 ? "PASS" : "FAIL",
    });

    for (const includeAnswerKey of [false, true]) {
      const documentsForBoundary = BOUNDARY_LAYOUTS.map((layout, index) => buildProjected(patternSpecId, layout, 204000 + patternIndex * 100 + index + 1, includeAnswerKey));
      const boundaryDocument = combinedDocument(documentsForBoundary, BOUNDARY_LAYOUTS, includeAnswerKey);
      const state = includeAnswerKey ? "answers-on" : "answers-off";
      const boundaryHtmlPath = path.join(htmlRoot, `${slug(patternSpecId)}-${state}.html`);
      const boundaryPdfPath = path.join(pdfRoot, `${slug(patternSpecId)}-${state}.pdf`);
      writeFileSync(boundaryHtmlPath, htmlWithCss(boundaryDocument), "utf8");
      const inspectionForBoundary = await inspectHtml(page, boundaryHtmlPath, BOUNDARY_LAYOUTS, includeAnswerKey);
      const expectedPages = BOUNDARY_LAYOUTS.length * (includeAnswerKey ? 2 : 1);
      await page.pdf({ path: boundaryPdfPath, format: "A4", printBackground: true, preferCSSPageSize: true, margin: { top: "0", right: "0", bottom: "0", left: "0" } });
      const boundaryPdf = verifyPdf(boundaryPdfPath, expectedPages);
      for (const row of inspectionForBoundary.questionResults) {
        const answerRow = includeAnswerKey ? inspectionForBoundary.answerResults.find((candidate) => candidate.layoutId === row.layoutId) : null;
        const boundaryPass = inspectionForBoundary.answerSectionPresent === includeAnswerKey
          && inspectionForBoundary.answerNodeInQuestionSectionCount === 0
          && inspectionForBoundary.internalIdLeakCount === 0
          && (!includeAnswerKey || answerRow?.pass === true);
        boundaryResults.push({
          patternSpecId,
          layoutId: row.layoutId,
          includeAnswerKey,
          question: row,
          answer: answerRow,
          answerSectionPresent: inspectionForBoundary.answerSectionPresent,
          answerNodeInQuestionSectionCount: inspectionForBoundary.answerNodeInQuestionSectionCount,
          internalIdLeakCount: inspectionForBoundary.internalIdLeakCount,
          pdf: boundaryPdf,
          status: row.pass && boundaryPass && boundaryPdf.pass ? "PASS" : "FAIL",
        });
      }
    }
  }
} finally {
  await page.close();
  await browser.close();
}

const layoutManifest = {
  schemaName: "G5AU02S104LayoutMatrixManifest",
  schemaVersion: 1,
  task: "G5AU02-S104_P0IntegratedSemanticRendererHTMLPDFAcceptance",
  patternCount: P0_PATTERNS.length,
  layoutsPerPattern: APPROVED_LAYOUTS.length,
  scenarioCount: layoutResults.length,
  passCount: layoutResults.filter((row) => row.status === "PASS").length,
  failureCount: layoutResults.filter((row) => row.status !== "PASS").length,
  status: layoutResults.length === 216 && layoutResults.every((row) => row.status === "PASS") ? "PASS" : "FAIL",
  results: layoutResults,
};
const boundaryManifest = {
  schemaName: "G5AU02S104AnswerBoundaryManifest",
  schemaVersion: 1,
  task: "G5AU02-S104_P0IntegratedSemanticRendererHTMLPDFAcceptance",
  patternCount: P0_PATTERNS.length,
  layouts: BOUNDARY_LAYOUT_IDS,
  answerStates: ["off", "on"],
  scenarioCount: boundaryResults.length,
  passCount: boundaryResults.filter((row) => row.status === "PASS").length,
  failureCount: boundaryResults.filter((row) => row.status !== "PASS").length,
  status: boundaryResults.length === 72 && boundaryResults.every((row) => row.status === "PASS") ? "PASS" : "FAIL",
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
