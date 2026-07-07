import test from "node:test";
import assert from "node:assert/strict";

import { buildBatchABrowserWorksheetDocument } from "../../../site/modules/curriculum/batch-a/batch-a-browser-worksheet.js";
import { BATCH_A_RESOLVER_SELECTION_MODES } from "../../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";
import { renderWorksheetDocumentToHtml } from "../../../site/modules/renderer/html-renderer.js";

const sourceId = "g3b_u01_3b01";
const rows = Object.freeze([
  ["kp_g3b_u01_wp_partitive_division", "pg_g3b_u01_wp_partitive_division"],
  ["kp_g3b_u01_wp_quotative_division", "pg_g3b_u01_wp_quotative_division"],
  ["kp_g3b_u01_wp_division_with_remainder", "pg_g3b_u01_wp_division_with_remainder"],
  ["kp_g3b_u01_wp_remainder_interpretation", "pg_g3b_u01_wp_remainder_interpretation"],
  ["kp_g3b_u01_wp_two_step_division", "pg_g3b_u01_wp_two_step_division"]
]);

function smokeWorksheet(questionCount = 20) {
  return buildBatchABrowserWorksheetDocument({
    sourceId,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: rows.map((row) => row[0]),
    selectedPatternGroupIds: rows.map((row) => row[1]),
    questionCount,
    ordering: "shuffleAcrossPatterns",
    generationSeed: "s43e5-r4k-browser-pdf-smoke",
    includeAnswerKey: true,
    title: "3B-U01 除法應用題 PDF Smoke",
    printLayout: { paperSize: "A4", columns: 1, rowsPerPage: 10, showAnswerKeyPage: true }
  });
}

function renderSmokeHtml(worksheetDocument) {
  return renderWorksheetDocumentToHtml(worksheetDocument, { stylesheetHref: "", debugDataAttributes: true, title: worksheetDocument.title });
}

test("S43E5 R4K browser PDF smoke has deterministic page counts", () => {
  const result = smokeWorksheet(20);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.questionPages.length, 2);
  assert.equal(result.worksheetDocument.answerKeyPages.length, 2);
  assert.equal(result.worksheetDocument.questionPages.every((page) => page.fillerCellCount === 0), true);
  assert.equal(result.worksheetDocument.answerKeyPages.every((page) => page.fillerCellCount === 0), true);
});

test("S43E5 R4K browser PDF smoke renders expected print pages", () => {
  const result = smokeWorksheet(20);
  const html = renderSmokeHtml(result.worksheetDocument);
  assert.equal((html.match(/worksheet-page--questions/g) ?? []).length, 2);
  assert.equal((html.match(/worksheet-page--answer-key/g) ?? []).length, 2);
  assert.equal((html.match(/print-page/g) ?? []).length, 4);
  assert.equal(html.includes("3B-U01 除法應用題 PDF Smoke"), true);
  assert.equal(html.includes("{"), false);
});

test("S43E5 R4K browser PDF smoke keeps all rendered cells bound to questions", () => {
  const result = smokeWorksheet(20);
  const questionCells = result.worksheetDocument.questionPages.flatMap((page) => page.cells).filter((cell) => cell.cellType === "question");
  const answerCells = result.worksheetDocument.answerKeyPages.flatMap((page) => page.cells).filter((cell) => cell.cellType === "answerKey");
  assert.equal(questionCells.length, 20);
  assert.equal(answerCells.length, 20);
  assert.deepEqual(questionCells.map((cell) => cell.questionNumber), Array.from({ length: 20 }, (_, index) => index + 1));
  assert.deepEqual(answerCells.map((cell) => cell.questionNumber), Array.from({ length: 20 }, (_, index) => index + 1));
});
