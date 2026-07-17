import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

import { buildG5AU02BrowserDynamicWorksheet } from "../../site/modules/curriculum/batch-b/g5a-u02-browser-dynamic-runtime.bundle.js";
import { projectG5AU02DynamicDocumentForGlobalLayout } from "../../site/modules/curriculum/batch-a/g5a-u02-global-layout-projection.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer-s73-extension.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const layouts = JSON.parse(readFileSync(path.join(root, "data/curriculum/contracts/GLM_S00_PublicCompletedUnit18LayoutContract.json"), "utf8")).approvedLayouts;
const css = readFileSync(path.join(root, "site/assets/styles/print-styles.css"), "utf8");
const patternSpecId = "ps_g5a_u02_factor_relation_equivalence";

function build(layout, index) {
  const built = buildG5AU02BrowserDynamicWorksheet({
    sourceId: "g5a_u02_5a02",
    patternSpecIds: [patternSpecId],
    questionCount: layout.columns * layout.rowsPerPage,
    generationSeed: 104001 + index,
    includeAnswerKey: false,
    questionRowsPerPage: layout.columns * layout.rowsPerPage,
    answerRowsPerPage: layout.columns * layout.rowsPerPage,
  });
  if (!built?.ok) throw new Error(built?.errors?.join(","));
  const projected = projectG5AU02DynamicDocumentForGlobalLayout({ ok: true, errors: [], worksheetDocument: built.worksheetDocument });
  if (!projected?.ok) throw new Error(projected?.errors?.join(","));
  return projected.worksheetDocument;
}

const documents = layouts.map(build);
const combined = {
  ...documents[0],
  questionDisplayModels: documents.flatMap((document) => document.questionDisplayModels),
  answerKeyItems: [],
  answerKeyEnabled: false,
  questionPages: documents.map((document, index) => ({
    pageNumber: layouts[index].layoutId,
    columns: layouts[index].columns,
    cells: document.questionDisplayModels.map((displayModel) => ({ cellType: "question", questionNumber: displayModel.questionNumber, displayModel })),
  })),
  answerKeyPages: [],
};
const html = renderWorksheetDocumentToHtml(combined, { stylesheetHref: "" }).replace("</head>", `<style>${css}</style></head>`);
const htmlPath = path.join("/tmp", "g5a-u02-s104-layout-diagnostic.html");
writeFileSync(htmlPath, html, "utf8");

const browser = await chromium.launch({ headless: true, args: ["--allow-file-access-from-files"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
await page.emulateMedia({ media: "print" });
const result = await page.evaluate((expectedLayouts) => {
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
  return [...document.querySelectorAll('.worksheet-page[data-page-type="question"]')].map((node, index) => {
    const expected = expectedLayouts[index];
    const cards = [...node.querySelectorAll(".worksheet-cell--question")];
    const grid = node.querySelector(".worksheet-page__grid");
    const x = clusters(cards.map((card) => card.getBoundingClientRect().left));
    const computed = grid ? getComputedStyle(grid).gridTemplateColumns.split(/\s+/).filter(Boolean).length : 0;
    const cardOverflow = cards.filter((card) => card.scrollHeight > card.clientHeight + 1 || card.scrollWidth > card.clientWidth + 1).length;
    const pageOverflow = node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1;
    const overlap = overlaps(cards);
    const expectedCardCount = expected.columns * expected.rowsPerPage;
    return {
      layoutId: expected.layoutId,
      expectedColumns: expected.columns,
      expectedCardCount,
      cardCount: cards.length,
      actualColumnCount: x.length,
      xClusters: x,
      computedGridColumnCount: computed,
      cardOverflow,
      pageOverflow,
      overlap,
      pageClient: [node.clientWidth, node.clientHeight],
      pageScroll: [node.scrollWidth, node.scrollHeight],
      firstCardClientScroll: cards[0] ? [cards[0].clientWidth, cards[0].scrollWidth, cards[0].clientHeight, cards[0].scrollHeight] : null,
      pass: cards.length === expectedCardCount && x.length === expected.columns && computed === expected.columns && cardOverflow === 0 && !pageOverflow && !overlap,
    };
  });
}, layouts);
await browser.close();
console.log(JSON.stringify(result, null, 2));
if (!result.every((row) => row.pass)) process.exitCode = 1;
