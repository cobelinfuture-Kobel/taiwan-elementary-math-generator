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

function build(count = 20) {
  return buildBatchABrowserWorksheetDocument({
    sourceId,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: rows.map((row) => row[0]),
    selectedPatternGroupIds: rows.map((row) => row[1]),
    questionCount: count,
    ordering: "shuffleAcrossPatterns",
    generationSeed: "s43e5-r4j-word-problem-mixed",
    includeAnswerKey: true,
    printLayout: { columns: 1, rowsPerPage: 20, showAnswerKeyPage: true }
  });
}

test("S43E5 R4J G3B-U01 word-problem mixed worksheet builds", () => {
  const result = build(20);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.summary.questionCount, 20);
  assert.equal(result.worksheetDocument.generatedQuestions.length, 20);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 20);
  assert.deepEqual(result.worksheetDocument.batchA.knowledgePointIds, rows.map((row) => row[0]).sort());
});

test("S43E5 R4J mixed worksheet uses all five word-problem pattern groups", () => {
  const result = build(20);
  const generatedPatternIds = new Set(result.worksheetDocument.generatedQuestions.map((question) => question.patternSpecId));
  assert.equal(generatedPatternIds.size, 5);
  assert.equal(result.worksheetDocument.batchA.allocation.length, 5);
  assert.equal(result.worksheetDocument.batchA.allocation.every((entry) => entry.questionCount === 4), true);
});

test("S43E5 R4J mixed worksheet questions and answer keys are printable text", () => {
  const result = build(20);
  for (const question of result.worksheetDocument.generatedQuestions) {
    assert.equal(question.kind, "g3bU01WordProblem");
    assert.equal(question.sourceId, sourceId);
    assert.equal(question.blankedDisplayText.includes("{"), false);
    assert.equal(typeof question.answerText, "string");
    assert.equal(question.answerText.length > 0, true);
  }
  const html = renderWorksheetDocumentToHtml(result.worksheetDocument, { stylesheetHref: "" });
  assert.equal(html.includes("worksheet-page--questions"), true);
  assert.equal(html.includes("worksheet-page--answer-key"), true);
  assert.equal(html.includes("{"), false);
});
