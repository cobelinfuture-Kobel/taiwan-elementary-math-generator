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

function hasMiddleBlank(question) { return question.blanks.some((blank) => blank.placeValue === 1 || blank.placeValue === 2); }

test("S43G4O4 selector exposes sub middle missing digit KP", () => {
  const availability = listBatchAKnowledgePointAvailabilityBySource(sourceId);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount, 24);
  assert.equal(availability.visibleCount, 10);
  assert.equal(getVisibleBatchAKnowledgePoint(kpId)?.displayName, "減法中間缺位填空");
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(kpId), [specId]);
});

test("S43G4O2 generator creates subtraction middle-place blanks", () => {
  const result = generateBatchABrowserQuestions({ sourceId, selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT, selectedKnowledgePointIds: [kpId], selectedPatternGroupIds: [groupId], questionCount: 8, generationSeed: "s43g4o2", includeAnswerKey: true });
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

test("S43G4O3 validator rejects sub middle question without middle place", () => {
  const question = { id: "manual-submid-invalid", patternSpecId: specId, sourceId, kind: "missingDigitEquation", operator: "subtract", left: 8000, right: 1000, result: 7000, blanks: [{ target: "left", index: 0, placeValue: 3, digit: 8 }, { target: "result", index: 3, placeValue: 0, digit: 0 }], missingDigits: [8, 0], answerOrder: "prompt_left_to_right", promptText: "依照□出現順序，填入正確的數字。", displayText: "8000 - 1000 = 7000", blankedDisplayText: "□000 - 1000 = 700□", answerText: "8,0", finalAnswer: "8,0", metadata: { patternId: specId, sourceId } };
  assert.equal(validateBatchABrowserQuestion(question).ok, false);
});

test("S43G4O4 resolver accepts sub middle KP", () => {
  const plan = resolveVisiblePatternGroupSelection({ sourceId, selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT, selectedKnowledgePointIds: [kpId], selectedPatternGroupIds: [groupId], questionCount: 8, generationSeed: "s43g4o4" });
  assert.equal(plan.ok, true, JSON.stringify(plan.errors));
  assert.deepEqual(plan.knowledgePointIds, [kpId]);
  assert.deepEqual(plan.patternSpecIds, [specId]);
});
