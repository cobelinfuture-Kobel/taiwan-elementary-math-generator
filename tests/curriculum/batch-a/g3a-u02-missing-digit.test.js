import test from "node:test";
import assert from "node:assert/strict";

import { generateBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-generator.js";
import { validateBatchABrowserQuestion } from "../../../site/modules/curriculum/batch-a/batch-a-browser-validator.js";
import { BATCH_A_RESOLVER_SELECTION_MODES, resolveVisiblePatternGroupSelection } from "../../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";
import { BATCH_A_SELECTOR_AVAILABILITY, getVisibleBatchAKnowledgePoint, listBatchAKnowledgePointAvailabilityBySource, listVisibleBatchAKnowledgePoints, resolveVisiblePatternSpecIdsForKnowledgePoint } from "../../../site/modules/curriculum/registry/batch-a-selector-extension.js";

const sourceId = "g3a_u02_3a02";
const addKp = "kp_g3a_u02_add_missing_digit_operand";
const subKp = "kp_g3a_u02_sub_missing_digit_operand";
const addGroup = "pg_g3a_u02_add_missing_digit_operand";
const subGroup = "pg_g3a_u02_sub_missing_digit_operand";
const addSpec = "ps_g3a_u02_add_missing_digit_operand";
const subSpec = "ps_g3a_u02_sub_missing_digit_operand";

function make(kpId, groupId, count = 8) {
  return generateBatchABrowserQuestions({ sourceId, selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT, selectedKnowledgePointIds: [kpId], selectedPatternGroupIds: [groupId], questionCount: count, generationSeed: `s43g4h-${kpId}`, includeAnswerKey: true });
}

function checkMissingDigitQuestion(question, operator) {
  assert.equal(question.kind, "missingDigit");
  assert.equal(question.operator, operator);
  assert.equal((question.blankedDisplayText.match(/□/g) ?? []).length, 1);
  assert.match(question.answerText, /^[0-9]$/);
  assert.equal(question.finalAnswer, Number(question.answerText));
  const expected = operator === "add" ? question.left + question.right : question.left - question.right;
  assert.equal(question.result, expected);
  assert.equal(validateBatchABrowserQuestion(question).ok, true);
}

test("S43G4L selector exposes G3A U02 missing digit KPs", () => {
  const availability = listBatchAKnowledgePointAvailabilityBySource(sourceId);
  assert.equal(listVisibleBatchAKnowledgePoints().length, BATCH_A_SELECTOR_AVAILABILITY.visibleCount);
  assert.equal(availability.visibleCount, 10);
  assert.equal(getVisibleBatchAKnowledgePoint(addKp)?.displayName, "加法缺位填空");
  assert.equal(getVisibleBatchAKnowledgePoint(subKp)?.displayName, "減法缺位填空");
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(addKp), [addSpec]);
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(subKp), [subSpec]);
});

test("S43G4K addition missing digit generation and validation", () => {
  const result = make(addKp, addGroup, 8);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const rightDigitCounts = new Set();
  for (const question of result.questions) {
    checkMissingDigitQuestion(question, "add");
    rightDigitCounts.add(String(question.right).length);
  }
  assert.deepEqual([...rightDigitCounts].sort(), [1, 2, 3, 4]);
  const altered = { ...result.questions[0], answerText: String((Number(result.questions[0].answerText) + 1) % 10) };
  assert.equal(validateBatchABrowserQuestion(altered).ok, false);
});

test("S43G4K subtraction missing digit generation and validation", () => {
  const result = make(subKp, subGroup, 8);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const rightDigitCounts = new Set();
  for (const question of result.questions) {
    checkMissingDigitQuestion(question, "subtract");
    rightDigitCounts.add(String(question.right).length);
  }
  assert.deepEqual([...rightDigitCounts].sort(), [1, 2, 3, 4]);
});

test("S43G4L resolver accepts same-unit missing digit mix", () => {
  const plan = resolveVisiblePatternGroupSelection({ sourceId, selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT, selectedKnowledgePointIds: [addKp, subKp], selectedPatternGroupIds: [addGroup, subGroup], questionCount: 8, generationSeed: "s43g4l" });
  assert.equal(plan.ok, true);
  assert.deepEqual(plan.knowledgePointIds, [addKp, subKp]);
  assert.deepEqual(plan.patternSpecIds, [addSpec, subSpec].sort());
});
