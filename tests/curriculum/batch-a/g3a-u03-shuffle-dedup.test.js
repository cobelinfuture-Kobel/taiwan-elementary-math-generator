import test from "node:test";
import assert from "node:assert/strict";

import { buildBatchABrowserWorksheetDocument } from "../../../site/modules/curriculum/batch-a/batch-a-browser-worksheet.js";
import { BATCH_A_RESOLVER_SELECTION_MODES } from "../../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";
import { renderWorksheetDocumentToHtml } from "../../../site/modules/renderer/html-renderer.js";

const sourceId = "g3a_u03_3a03";
const kpIds = [
  "kp_g3a_u03_10_multiple_by_1digit",
  "kp_g3a_u03_2digit_by_1digit_carry",
  "kp_g3a_u03_3digit_by_1digit",
  "kp_g3a_u03_3digit_zero_middle_by_1digit",
  "kp_g3a_u03_consecutive_multiplication_two_step",
  "kp_g3a_u03_multiplication_missing_digit_inference"
];
const groupIds = [
  "pg_g3a_u03_10_multiple_by_1digit",
  "pg_g3a_u03_2digit_by_1digit_carry",
  "pg_g3a_u03_3digit_by_1digit",
  "pg_g3a_u03_3digit_zero_middle_by_1digit",
  "pg_g3a_u03_consecutive_multiplication_two_step",
  "pg_g3a_u03_multiplication_missing_digit_inference"
];

function promptKey(question) {
  if (question.kind === "multiplicationMissingDigit") return question.blankedDisplayText;
  return question.duplicateKey ?? JSON.stringify(question.expression);
}

test("S43G5L G3A U03 mixed mode interleaves six KPs and dedupes questions", () => {
  const result = buildBatchABrowserWorksheetDocument({
    sourceId,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: kpIds,
    selectedPatternGroupIds: groupIds,
    questionCount: 150,
    ordering: "shuffleAcrossPatterns",
    generationSeed: "s43g5l",
    includeAnswerKey: true
  });

  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.summary.questionCount, 150);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 150);

  const questions = result.worksheetDocument.generatedQuestions;
  const first30SpecCount = new Set(questions.slice(0, 30).map((question) => question.patternSpecId)).size;
  assert.equal(first30SpecCount >= 4, true);
  assert.equal(new Set(questions.map((question) => promptKey(question))).size, questions.length);

  const firstSix = questions.slice(0, 6).map((question) => question.patternSpecId);
  assert.equal(new Set(firstSix).size, 6);

  const html = renderWorksheetDocumentToHtml(result.worksheetDocument, { stylesheetHref: "" });
  assert.equal(html.includes("worksheet-page--questions"), true);
  assert.equal(html.includes("worksheet-page--answer-key"), true);
});
