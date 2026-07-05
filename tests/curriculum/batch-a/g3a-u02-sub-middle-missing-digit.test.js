import test from "node:test";
import assert from "node:assert/strict";

import { generateBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-generator.js";
import { validateBatchABrowserQuestion } from "../../../site/modules/curriculum/batch-a/batch-a-browser-validator.js";
import { BATCH_A_RESOLVER_SELECTION_MODES, resolveVisiblePatternGroupSelection } from "../../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";
import { BATCH_A_SELECTOR_AVAILABILITY, getVisibleBatchAKnowledgePoint, listBatchAKnowledgePointAvailabilityBySource, resolveVisiblePatternSpecIdsForKnowledgePoint } from "../../../site/modules/curriculum/registry/batch-a-selector-equation-extension.js";

const sourceId = "g3a_u02_3a02";
const kpId = "kp_g3a_u02_sub_middle_missing_digit";
const groupId = "pg_g3a_u02_sub_middle_missing_digit";
const specId = "ps_g3a_u02_sub_middle_missing_digit";

function hasMiddleBlank(question) {
  return question.blanks.some((blank) => blank.placeValue === 1 || blank.placeValue === 2);
}

test("S43G4O4 selector exposes sub middle missing digit KP", () => {
  const availability = listBatchAKnowledgePointAvailabilityBySource(sourceId);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount, 15);
  assert.equal(availability.visibleCount, 9);
  assert.equal(getVisibleBatchAKnowledgePoint(kpId)?.displayName, "減法中間缺位填空");
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(kpId), [specId]);
});

test("S43G4O2 generator creates subtraction middle-place blanks", () => {
  const result = generateBatchABrowserQuestions({
    sourceId,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [kpId],
    selectedPatternGroupIds: [groupId],
    questionCount: 8,
    generationSeed: "s43g4o2",
    includeAnswerKey: true
  });

  assert.equal(result.ok, true, JSON.stringify(result.errors));
  for (const question of result.questions) {
    assert.equal(question.kind, "missingDigitEquation");
    assert.equal(question.operator, "subtract");
    assert.equal(String(question.left).length, 4);
    assert.equal(question.left - question.right, question.result);
    assert.equal(hasMiddleBlank(question), true);
    assert.equal(new Set(question.blanks.map((blank) => blank.placeValue)).size, question.blanks.length);
    assert.equal(validateBatchABrowserQuestion(question).ok, true);
  }
});

test("S43G4O4 resolver accepts sub middle KP", () => {
  const plan = resolveVisiblePatternGroupSelection({
    sourceId,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [kpId],
    selectedPatternGroupIds: [groupId],
    questionCount: 8,
    generationSeed: "s43g4o4"
  });

  assert.equal(plan.ok, true, JSON.stringify(plan.errors));
  assert.deepEqual(plan.knowledgePointIds, [kpId]);
  assert.deepEqual(plan.patternSpecIds, [specId]);
});
