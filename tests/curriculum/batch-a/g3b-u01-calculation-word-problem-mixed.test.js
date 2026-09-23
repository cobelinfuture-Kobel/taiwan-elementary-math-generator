import test from "node:test";
import assert from "node:assert/strict";

import { buildBatchABrowserWorksheetDocument } from "../../../site/modules/curriculum/batch-a/batch-a-browser-worksheet.js";
import { BATCH_A_RESOLVER_SELECTION_MODES } from "../../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";
import { renderWorksheetDocumentToHtml } from "../../../site/modules/renderer/html-renderer.js";

const sourceId = "g3b_u01_3b01";
const calculationRows = Object.freeze([
  ["kp_g3b_u01_2digit_division_place_value_cases", "pg_g3b_u01_2digit_division_place_value_cases"],
  ["kp_g3b_u01_3digit_by_1digit_regroup_hundreds", "pg_g3b_u01_3digit_by_1digit_regroup_hundreds"],
  ["kp_g3b_u01_3digit_division_place_value_cases", "pg_g3b_u01_3digit_division_place_value_cases"],
  ["kp_g3b_u01_quotient_zero_cases", "pg_g3b_u01_quotient_zero_cases"],
  ["kp_g3b_u01_division_with_remainder", "pg_g3b_u01_division_with_remainder"]
]);
const wordProblemRows = Object.freeze([
  ["kp_g3b_u01_wp_partitive_division", "pg_g3b_u01_wp_partitive_division"],
  ["kp_g3b_u01_wp_quotative_division", "pg_g3b_u01_wp_quotative_division"],
  ["kp_g3b_u01_wp_division_with_remainder", "pg_g3b_u01_wp_division_with_remainder"],
  ["kp_g3b_u01_wp_remainder_interpretation", "pg_g3b_u01_wp_remainder_interpretation"],
  ["kp_g3b_u01_wp_two_step_division", "pg_g3b_u01_wp_two_step_division"]
]);
const rows = Object.freeze([...calculationRows, ...wordProblemRows]);

function buildMixedWorksheet(questionCount = 30) {
  return buildBatchABrowserWorksheetDocument({
    sourceId,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: rows.map((row) => row[0]),
    selectedPatternGroupIds: rows.map((row) => row[1]),
    questionCount,
    ordering: "shuffleAcrossPatterns",
    generationSeed: "s43e5-r4l-calculation-word-problem-mixed",
    includeAnswerKey: true,
    printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 15, showAnswerKeyPage: true }
  });
}

test("S43E5 R4L G3B-U01 same-unit mix supports calculation and word-problem KPs", () => {
  const result = buildMixedWorksheet(30);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.summary.questionCount, 30);
  assert.equal(result.worksheetDocument.generatedQuestions.length, 30);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 30);
  assert.deepEqual(result.worksheetDocument.batchA.knowledgePointIds, rows.map((row) => row[0]).sort());
});

test("S43E5 R4L mixed output contains both calculation and word-problem questions", () => {
  const result = buildMixedWorksheet(30);
  const questions = result.worksheetDocument.generatedQuestions;
  const wordProblems = questions.filter((question) => question.kind === "g3bU01WordProblem");
  const calculations = questions.filter((question) => question.kind !== "g3bU01WordProblem");
  assert.equal(wordProblems.length > 0, true);
  assert.equal(calculations.length > 0, true);
  assert.equal(wordProblems.every((question) => question.answerText && !question.blankedDisplayText.includes("{")), true);
  assert.equal(calculations.every((question) => question.sourceId === sourceId), true);
});

test("S43E5 R4L mixed calculation plus word-problem worksheet renders printable HTML", () => {
  const result = buildMixedWorksheet(30);
  const html = renderWorksheetDocumentToHtml(result.worksheetDocument, { stylesheetHref: "", debugDataAttributes: true, title: "G3B-U01 mixed calculation word problem smoke" });
  assert.equal(html.includes("worksheet-page--questions"), true);
  assert.equal(html.includes("worksheet-page--answer-key"), true);
  assert.equal(html.includes("g3bU01WordProblem"), false);
  assert.equal(html.includes("{"), false);
});
