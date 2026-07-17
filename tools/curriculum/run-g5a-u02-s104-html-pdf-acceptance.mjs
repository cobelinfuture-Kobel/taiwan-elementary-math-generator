import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

import { buildG5AU02BrowserDynamicWorksheet } from "../../site/modules/curriculum/batch-b/g5a-u02-browser-dynamic-runtime.bundle.js";
import { projectG5AU02DynamicDocumentForGlobalLayout } from "../../site/modules/curriculum/batch-a/g5a-u02-global-layout-projection.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer-s73-extension.js";

const toolDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(toolDirectory, "../..");
const outputRoot = path.join(repositoryRoot, "docs/curriculum/output/g5a-u02-s104");
const htmlRoot = path.join(outputRoot, "html");
const pdfRoot = path.join(outputRoot, "pdf");
const contract = JSON.parse(readFileSync(path.join(repositoryRoot, "data/curriculum/contracts/G5AU02_S99_P0SourceMethodAndRepresentationFullFixContract.json"), "utf8"));
const layoutContract = JSON.parse(readFileSync(path.join(repositoryRoot, "data/curriculum/contracts/GLM_S00_PublicCompletedUnit18LayoutContract.json"), "utf8"));
const printCss = readFileSync(path.join(repositoryRoot, "site/assets/styles/print-styles.css"), "utf8");
const SOURCE_ID = "g5a_u02_5a02";
const P0_PATTERNS = Object.freeze(contract.patternContracts.map((row) => row.patternSpecId));
const APPROVED_LAYOUTS = Object.freeze(layoutContract.approvedLayouts);
const BOUNDARY_LAYOUT_IDS = Object.freeze(contract.acceptance.answerBoundaryMatrix.layouts);
const BOUNDARY_LAYOUTS = Object.freeze(BOUNDARY_LAYOUT_IDS.map((layoutId) => APPROVED_LAYOUTS.find((layout) => layout.layoutId === layoutId)));

function slug(patternSpecId) {
  return patternSpecId.replace(/^ps_g5a_u02_/, "");
}

function buildProjected(patternSpecId, questionCount, seed, includeAnswerKey) {
  const built = buildG5AU02BrowserDynamicWorksheet({
    sourceId: SOURCE_ID,
    patternSpecIds: [patternSpecId],
    questionCount,
    generationSeed: seed,
    includeAnswerKey,
    questionRowsPerPage: Math.max(1, questionCount),
    answerRowsPerPage: Math.max(1, questionCount),
  });
  if (!built?.ok) throw new Error(`S104_GENERATION_BLOCKED:${patternSpecId}:${seed}:${built?.errors?.join(",")}`);
  const projected = projectG5AU02DynamicDocumentForGlobalLayout({ ok: true, errors: [], worksheetDocument: built.worksheetDocument });
  if (!projected?.ok) throw new Error(`S104_PROJECTION_BLOCKED:${patternSpecId}:${seed}:${projected?.errors?.join(",")}`);
  return projected.worksheetDocument;
}

function questionPage(document, layout, pageNumber) {
  return {
    pageNumber,
    columns: layout.columns,
    cells: document.questionDisplayModels.map((displayModel) => ({
      cellType: "question",
      questionNumber: displayModel.questionNumber,
      displayModel,
    })),
  };
}

function answerPage(document, pageNumber) {
  return {
    pageNumber,
    columns: 1,
    cells: document.answerKeyItems.map((answerKeyItem) => ({ cellType: "answerKey", answerKeyItem })),
  };
}

function combinedDocument(documents, questionPages, answerKeyPages, includeAnswerKey) {
  const first = documents[0];
  return {
    ...first,
    title: "G5A-U02 S104 P0 Integrated Acceptance",
    questionDisplayModels: documents.flatMap((document) => document.questionDisplayModels),
    answerKeyItems: includeAnswerKey ? documents.flatMap((document) => document.answerKeyItems) : [],
    questionPages,
    answerKeyPages,
    answerKeyEnabled: includeAnswerKey,
  };
}

function htmlWithPrintCss(document) {
  const html = renderWorksheetDocumentToHtml(document, { stylesheetHref: "" });
  return html.replace("</head>", `<style id="s104-print-authority">${printCss}</style></head>`);
}

function xClusters(values) {
  const clusters = [];
  for (const value of [...values].sort((a, b) => a - b)) {
    const existing = clusters.find((row) => Math.abs(row.center - value) <= 2);
    if (existing) {
      existing.values.push(value);
      existing.center = existing.values.reduce((sum, item) => sum + item, 0) / existing.values.length;
    } else clusters.push({ center: value, values: [value] });
  }
  return clusters.map((row) => Number(row.center.toFixed(2)));
}

async function inspectHtml(page, htmlPath, expectedQuestionPages, expectedAnswerPageCount) {
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print" });
  return page.evaluate(({ expectedQuestionPages, expectedAnswerPageCount }) => {
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
    function overlaps(nodes) {
      const boxes = nodes.map((node) => node.getBoundingClientRect());
      for (let left = 0; left < boxes.length; left += 1) {
        for (let right = left + 1; right < boxes.length; right += 1) {
          const a = boxes[left];
          const b = boxes[right];
          const width = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          const height = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if (width > 1 && height > 1) return true;
        }
      }
      return false;
    }
    function inspectPage(node, expected) {
      const cards = [...node.querySelectorAll(expected.answer ? ".worksheet-cell--answer-key" : ".worksheet-cell--question")]
        .filter((card) => getComputedStyle(card).display !== "none");
      const grid = node.querySelector(".worksheet-page__grid");
      const actualClusters = clusters(cards.map((card) => card.getBoundingClientRect().left));
      const computedColumns = grid ? getComputedStyle(grid).gridTemplateColumns.split(/\s+/).filter(Boolean).length : 0;
      const cardOverflowCount = cards.filter((card) => card.scrollHeight > card.clientHeight + 1 || card.scrollWidth > card.clientWidth + 1).length;
      const pageOverflow = node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1;
      return {
        layoutId: expected.layoutId,
        answer: expected.answer,
        expectedColumns: expected.columns,
        expectedCardCount: expected.cardCount,
        cardCount: cards.length,
        actualColumnCount: actualClusters.length,
        xClusters: actualClusters,
        computedGridColumnCount: computedColumns,
        cardOverflowCount,
        pageOverflow,
        overlap: overlaps(cards),
        pass: cards.length === expected.cardCount
          && actualClusters.length === expected.columns
          && computedColumns === expected.columns
          && cardOverflowCount === 0
          && !pageOverflow
          && !overlaps(cards),
      };
    }
    const questionNodes = [...document.querySelectorAll('.worksheet-page[data-page-type="question"]')];
    const answerNodes = [...document.querySelectorAll('.worksheet-page[data-page-type="answer"]')];
    const questionResults = questionNodes.map((node, index) => inspectPage(node, expectedQuestionPages[index]));
    const answerResults = answerNodes.map((node, index) => inspectPage(node, {
      layoutId: `answer-${index + 1}`,
      answer: true,
      columns: 1,
      cardCount: expectedQuestionPages[index]?.cardCount ?? node.querySelectorAll(".worksheet-cell--answer-key").length,
    }));
    const questionSection = document.querySelector(".worksheet-section--questions");
    const answerSection = document.querySelector(".worksheet-section--answer-key");
    return {
      rendererProfile: document.body.dataset.rendererProfile,
      questionPageCount: questionNodes.length,
      answerPageCount: answerNodes.length,
      questionResults,
      answerResults,
      answerSectionPresent: Boolean(answerSection),
      answerNodeInQuestionSectionCount: questionSection?.querySelectorAll(".worksheet-cell__answer").length ?? 0,
      internalIdLeakCount: (document.body.innerText.match(/\b(?:ps|fm|fmc|pg|kp)_g5a_u02_[a-z0-9_]+\b/gi) ?? []).length,
      pass: document.body.dataset.rendererProfile === "g5a_u02_pre_s104_semantic_v1"
        && questionNodes.length === expectedQuestionPages.length
        && answerNodes.length === expectedAnswerPageCount
        && questionResults.every((row) => row.pass)
        && answerResults.every((row) => row.pass)
        && (expectedAnswerPageCount > 0) === Boolean(answerSection)
        && (questionSection?.querySelectorAll(".worksheet-cell__answer").length ?? 0) === 0
        && (document.body.innerText.match(/\b(?:ps|fm|fmc|pg|kp)_g5a_u02_[a-z0-9_]+\b/gi) ?? []).length === 0,
    };
  }, { expectedQuestionPages, expectedAnswerPageCount });
}

function verifyPdf(pdfPath, expectedPageCount) {
  const info = execFileSync("pdfinfo", [pdfPath], { encoding: "utf8" });
  const pages = Number(info.match(/^Pages:\s+(\d+)/m)?.[1]);
  if (pages !== expectedPageCount) throw new Error(`S104_PDF_PAGE_COUNT_MISMATCH:${pdfPath}:${pages}:${expectedPageCount}`);
  const bboxPath = pdfPath.replace(/\.pdf$/i, ".bbox.html");
  execFileSync("pdftotext", ["-bbox-layout", pdfPath, bboxPath]);
  const bbox = readFileSync(bboxPath, "utf8");
  const pageMatches = [...bbox.matchAll(/<page[^>]*width="([0-9.]+)"[^>]*height="([0-9.]+)"[^>]*>([\s\S]*?)<\/page>/g)];
  if (pageMatches.length !== expectedPageCount) throw new Error(`S104_PDF_BBOX_PAGE_COUNT_MISMATCH:${pdfPath}`);
  let blankPageCount = 0;
  let bboxOverflowCount = 0;
  for (const match of pageMatches) {
    const width = Number(match[1]);
    const height = Number(match[2]);
    const body = match[3];
    const words = [...body.matchAll(/<word[^>]*xMin="([0-9.]+)"[^>]*yMin="([0-9.]+)"[^>]*xMax="([0-9.]+)"[^>]*yMax="([0-9.]+)"/g)];
    if (words.length === 0) blankPageCount += 1;
    for (const word of words) {
      const [x0, y0, x1, y1] = word.slice(1).map(Number);
      if (x0 < -0.5 || y0 < -0.5 || x1 > width + 0.5 || y1 > height + 0.5) bboxOverflowCount += 1;
    }
  }
  if (blankPageCount || bboxOverflowCount) throw new Error(`S104_PDF_VISUAL_BOUNDARY_FAIL:${pdfPath}:blank=${blankPageCount}:bbox=${bboxOverflowCount}`);
  return { pageCount: pages, blankPageCount, bboxOverflowCount };
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
    const documents = APPROVED_LAYOUTS.map((layout, layoutIndex) => buildProjected(
      patternSpecId,
      layout.columns * layout.rowsPerPage,
      104000 + patternIndex * 100 + layoutIndex + 1,
      false,
    ));
    const pages = documents.map((document, index) => questionPage(document, APPROVED_LAYOUTS[index], APPROVED_LAYOUTS[index].layoutId));
    const combined = combinedDocument(documents, pages, [], false);
    const htmlPath = path.join(htmlRoot, `${slug(patternSpecId)}-18-layouts.html`);
    const pdfPath = path.join(pdfRoot, `${slug(patternSpecId)}-18-layouts.pdf`);
    writeFileSync(htmlPath, htmlWithPrintCss(combined), "utf8");
    const expected = APPROVED_LAYOUTS.map((layout) => ({
      layoutId: layout.layoutId,
      answer: false,
      columns: layout.columns,
      cardCount: layout.columns * layout.rowsPerPage,
    }));
    const inspection = await inspectHtml(page, htmlPath, expected, 0);
    if (!inspection.pass) throw new Error(`S104_LAYOUT_HTML_FAIL:${patternSpecId}:${JSON.stringify(inspection)}`);
    await page.pdf({ path: pdfPath, format: "A4", printBackground: true, preferCSSPageSize: true, margin: { top: "0", right: "0", bottom: "0", left: "0" } });
    const pdf = verifyPdf(pdfPath, APPROVED_LAYOUTS.length);
    inspection.questionResults.forEach((row) => layoutResults.push({ patternSpecId, ...row, pdf }));

    for (const includeAnswerKey of [false, true]) {
      const boundaryDocuments = BOUNDARY_LAYOUTS.map((layout, layoutIndex) => buildProjected(
        patternSpecId,
        layout.columns * layout.rowsPerPage,
        204000 + patternIndex * 100 + layoutIndex + 1,
        includeAnswerKey,
      ));
      const boundaryQuestionPages = boundaryDocuments.map((document, index) => questionPage(document, BOUNDARY_LAYOUTS[index], BOUNDARY_LAYOUTS[index].layoutId));
      const boundaryAnswerPages = includeAnswerKey
        ? boundaryDocuments.map((document, index) => answerPage(document, `answer-${BOUNDARY_LAYOUTS[index].layoutId}`))
        : [];
      const boundaryCombined = combinedDocument(boundaryDocuments, boundaryQuestionPages, boundaryAnswerPages, includeAnswerKey);
      const state = includeAnswerKey ? "answers-on" : "answers-off";
      const boundaryHtmlPath = path.join(htmlRoot, `${slug(patternSpecId)}-${state}.html`);
      const boundaryPdfPath = path.join(pdfRoot, `${slug(patternSpecId)}-${state}.pdf`);
      writeFileSync(boundaryHtmlPath, htmlWithPrintCss(boundaryCombined), "utf8");
      const expectedBoundary = BOUNDARY_LAYOUTS.map((layout) => ({
        layoutId: layout.layoutId,
        answer: false,
        columns: layout.columns,
        cardCount: layout.columns * layout.rowsPerPage,
      }));
      const boundaryInspection = await inspectHtml(page, boundaryHtmlPath, expectedBoundary, includeAnswerKey ? BOUNDARY_LAYOUTS.length : 0);
      if (!boundaryInspection.pass) throw new Error(`S104_ANSWER_BOUNDARY_HTML_FAIL:${patternSpecId}:${state}:${JSON.stringify(boundaryInspection)}`);
      const expectedPdfPages = BOUNDARY_LAYOUTS.length * (includeAnswerKey ? 2 : 1);
      await page.pdf({ path: boundaryPdfPath, format: "A4", printBackground: true, preferCSSPageSize: true, margin: { top: "0", right: "0", bottom: "0", left: "0" } });
      const boundaryPdf = verifyPdf(boundaryPdfPath, expectedPdfPages);
      boundaryInspection.questionResults.forEach((row) => boundaryResults.push({
        patternSpecId,
        layoutId: row.layoutId,
        includeAnswerKey,
        questionPass: row.pass,
        answerBoundaryPass: boundaryInspection.answerNodeInQuestionSectionCount === 0
          && boundaryInspection.answerSectionPresent === includeAnswerKey
          && boundaryInspection.answerResults.every((answerRow) => answerRow.pass),
        pdf: boundaryPdf,
        status: row.pass && boundaryInspection.answerNodeInQuestionSectionCount === 0
          && boundaryInspection.answerSectionPresent === includeAnswerKey
          && boundaryInspection.answerResults.every((answerRow) => answerRow.pass) ? "PASS" : "FAIL",
      }));
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
  passCount: layoutResults.filter((row) => row.pass).length,
  failureCount: layoutResults.filter((row) => !row.pass).length,
  status: layoutResults.length === 216 && layoutResults.every((row) => row.pass) ? "PASS" : "FAIL",
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
console.log(JSON.stringify({
  layout: { scenarioCount: layoutManifest.scenarioCount, passCount: layoutManifest.passCount, status: layoutManifest.status },
  answerBoundary: { scenarioCount: boundaryManifest.scenarioCount, passCount: boundaryManifest.passCount, status: boundaryManifest.status },
}, null, 2));
if (layoutManifest.status !== "PASS" || boundaryManifest.status !== "PASS") process.exitCode = 1;
