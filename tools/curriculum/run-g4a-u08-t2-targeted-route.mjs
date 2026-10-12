import assert from "node:assert/strict";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s76j-entry.js";
import { validateG4AU08AllCanonicalPublicQuestion } from "../../site/modules/curriculum/batch-a/g4a-u08-all-canonical-public-router.js";

const sourceId = "g4a_u08_4a08";
const knowledgePointId = "kp_g4a_u08_num_repeated_subtract_group";
const patternGroupId = "pg_g4a_u08_num_repeated_subtract_group";
const result = buildBatchABrowserWorksheetDocument({
  sourceId,
  selectionMode: "singleKnowledgePoint",
  selectedKnowledgePointIds: [knowledgePointId],
  selectedPatternGroupIds: [patternGroupId],
  questionMode: "numeric",
  questionCount: 6,
  ordering: "groupedByPattern",
  generationSeed: "g4a-u08-t2-route-replay",
  includeAnswerKey: true,
  title: "四上整數四則：錯誤診斷",
});
assert.equal(result.ok, true, JSON.stringify(result.errors));
const document = result.worksheetDocument;
assert.equal(document.generatedQuestions.length, 6);
assert.equal(document.answerKeyItems.length, 6);
const diagnostic = document.generatedQuestions.filter((question) => question.reasoningVariant === "error_diagnosis");
assert.ok(diagnostic.length >= 2, "Expected error-diagnosis questions in the generated worksheet");
for (const question of diagnostic) {
  assert.equal(validateG4AU08AllCanonicalPublicQuestion(question).ok, true);
  assert.equal(question.diagnosticWitness.correctAnswer, question.finalAnswer);
  assert.notEqual(question.diagnosticWitness.incorrectAnswer, question.finalAnswer);
}
console.log(JSON.stringify({ status: "PASS", generated: 6, diagnosis: diagnostic.length, answerKey: document.answerKeyItems.length }));
