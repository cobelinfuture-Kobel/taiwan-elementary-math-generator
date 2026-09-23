import test from "node:test";
import assert from "node:assert/strict";

import {
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
  resolveVisiblePatternSpecIdsForKnowledgePoint
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/g3a-u03-quality-generator.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet.js";
import { extractBatchAExpressionOperandValues } from "../../site/modules/curriculum/batch-a/carry-policy.js";

const SOURCE_ID = "g3a_u03_3a03";
const KP_ID = "kp_g3a_u03_consecutive_multiplication_two_step_word_problem";
const PG_ID = "pg_g3a_u03_consecutive_multiplication_two_step_word_problem";
const PS_ID = "ps_g3a_u03_consecutive_multiplication_two_step_word_problem";

function createWordProblemPlan(questionCount = 5) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [KP_ID],
    selectedPatternGroupIds: [PG_ID],
    questionCount,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "g3a-u03-word-problem-selector-smoke",
    printLayout: { columns: 1, rowsPerPage: 8, showAnswerKeyPage: true }
  };
}

test("G3A U03 two-step multiplication word problem is visible in the KP selector registry", () => {
  const availability = listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID);
  assert.equal(availability.visibleCount, 7);

  const kp = getVisibleBatchAKnowledgePoint(KP_ID);
  assert.ok(kp);
  assert.equal(kp.displayName, "兩步驟連續乘法應用題");
  assert.equal(kp.sourceId, SOURCE_ID);
  assert.deepEqual(kp.patternSpecIds, [PS_ID]);
  assert.deepEqual(kp.patternGroupIds, [PG_ID]);
  assert.ok(kp.subskillTags.includes("word_problem"));

  const groups = getVisiblePatternGroupsForKnowledgePoint(KP_ID);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].patternGroupId, PG_ID);
  assert.deepEqual(groups[0].patternSpecIds, [PS_ID]);
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(KP_ID), [PS_ID]);
});

test("G3A U03 word problem KP selector path generates validated word-problem questions", () => {
  const result = generateBatchABrowserQuestions(createWordProblemPlan(4));
  assert.equal(result.ok, true, JSON.stringify(result.errors, null, 2));
  assert.equal(result.questions.length, 4);
  assert.deepEqual(result.plan.patternSpecIds, [PS_ID]);
  assert.deepEqual(result.allocation, [{ patternGroupId: PG_ID, patternSpecId: PS_ID, questionCount: 4 }]);

  for (const question of result.questions) {
    assert.equal(question.patternSpecId, PS_ID);
    assert.equal(question.metadata.patternId, PS_ID);
    assert.equal(question.metadata.sourceId, SOURCE_ID);
    assert.equal(question.kind, "multiplicationWordProblem");
    assert.equal(question.operandCount, 3);
    assert.deepEqual(question.operatorsUsed, ["×", "×"]);
    assert.match(question.blankedDisplayText, /多少/);
    assert.match(question.blankedDisplayText, /____$/);
    assert.match(question.answerText, /^\d+$/);
  }
});

test("G3A U03 word problem operands are seed-permuted instead of lexicographic", () => {
  const result = generateBatchABrowserQuestions({
    ...createWordProblemPlan(20),
    generationSeed: "g3a-u03-word-problem-permutation-regression"
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors, null, 2));
  assert.equal(result.questions.length, 20);

  const operands = result.questions.map((question) => extractBatchAExpressionOperandValues(question.expression));
  const firstEight = operands.slice(0, 8);

  assert.notDeepEqual(firstEight, [
    [2, 2, 3],
    [2, 3, 3],
    [2, 4, 3],
    [2, 5, 3],
    [2, 6, 3],
    [2, 7, 3],
    [2, 8, 3],
    [2, 9, 3]
  ]);

  const firstFactors = new Set(firstEight.map(([left]) => left));
  const thirdFactors = new Set(firstEight.map(([, , third]) => third));
  assert.equal(firstFactors.size > 1, true);
  assert.equal(thirdFactors.size > 1, true);
});

test("G3A U03 word problem seeded permutation is deterministic by generationSeed", () => {
  const first = generateBatchABrowserQuestions({ ...createWordProblemPlan(12), generationSeed: "same-seed" });
  const second = generateBatchABrowserQuestions({ ...createWordProblemPlan(12), generationSeed: "same-seed" });
  const third = generateBatchABrowserQuestions({ ...createWordProblemPlan(12), generationSeed: "different-seed" });
  assert.deepEqual(first.questions.map((question) => question.blankedDisplayText), second.questions.map((question) => question.blankedDisplayText));
  assert.notDeepEqual(first.questions.map((question) => question.blankedDisplayText), third.questions.map((question) => question.blankedDisplayText));
});

test("G3A U03 word problem KP selector path renders worksheet and answer key", () => {
  const result = buildBatchABrowserWorksheetDocument(createWordProblemPlan(3));
  assert.equal(result.ok, true, JSON.stringify(result.errors, null, 2));
  assert.equal(result.worksheetDocument.batchA.selectionMode, "singleKnowledgePoint");
  assert.deepEqual(result.worksheetDocument.batchA.knowledgePointIds, [KP_ID]);
  assert.deepEqual(result.worksheetDocument.batchA.patternGroupIds, [PG_ID]);
  assert.deepEqual(result.worksheetDocument.batchA.patternSpecIds, [PS_ID]);
  assert.equal(result.worksheetDocument.summary.questionCount, 3);
  assert.equal(result.worksheetDocument.questionDisplayModels.length, 3);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 3);
  assert.match(result.worksheetDocument.questionDisplayModels[0].blankedDisplayText, /多少/);
  assert.match(result.worksheetDocument.questionDisplayModels[0].blankedDisplayText, /____$/);
});
