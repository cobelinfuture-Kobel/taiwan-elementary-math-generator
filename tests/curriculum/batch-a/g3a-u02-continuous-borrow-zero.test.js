import test from "node:test";
import assert from "node:assert/strict";

import { generateBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-generator.js";
import { countSubtractionRegroups, extractBatchAExpressionOperandValues } from "../../../site/modules/curriculum/batch-a/carry-policy.js";
import { hasContinuousBorrowThroughZero } from "../../../site/modules/curriculum/batch-a/continuous-borrow-zero-policy.js";
import { validateBatchABrowserQuestion } from "../../../site/modules/curriculum/batch-a/batch-a-browser-validator.js";
import { BATCH_A_RESOLVER_SELECTION_MODES, resolveVisiblePatternGroupSelection } from "../../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";
import { BATCH_A_SELECTOR_AVAILABILITY, getVisibleBatchAKnowledgePoint, listBatchAKnowledgePointAvailabilityBySource, resolveVisiblePatternSpecIdsForKnowledgePoint } from "../../../site/modules/curriculum/registry/batch-a-selector-equation-extension.js";

const sourceId = "g3a_u02_3a02";
const kpId = "kp_g3a_u02_continuous_borrow_zero";
const groupId = "pg_g3a_u02_continuous_borrow_zero";
const specId = "ps_g3a_u02_continuous_borrow_zero";

const EXPECTED_BATCH_A_VISIBLE_COUNT = 26;

test("S43G4P4 selector exposes continuous borrow zero KP", () => {
  const availability = listBatchAKnowledgePointAvailabilityBySource(sourceId);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount, EXPECTED_BATCH_A_VISIBLE_COUNT);
  assert.equal(availability.visibleCount, 10);
  assert.equal(getVisibleBatchAKnowledgePoint(kpId)?.displayName, "連續退位中間有 0");
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(kpId), [specId]);
});

test("S43G4P2 generator creates continuous borrow through zero subtraction", () => {
  const result = generateBatchABrowserQuestions({ sourceId, selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT, selectedKnowledgePointIds: [kpId], selectedPatternGroupIds: [groupId], questionCount: 8, generationSeed: "s43g4p2", includeAnswerKey: true });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const rightDigitCounts = new Set();
  for (const question of result.questions) {
    assert.equal(question.patternSpecId, specId);
    const [left, right] = extractBatchAExpressionOperandValues(question.expression);
    rightDigitCounts.add(String(right).length);
    assert.equal(String(left).length, 4);
    assert.equal(left >= right, true);
    assert.equal(hasContinuousBorrowThroughZero(left, right), true);
    assert.equal(countSubtractionRegroups(left, right, 10, { checkedColumns: ["ones", "tens", "hundreds"] }) >= 3, true);
    assert.equal(validateBatchABrowserQuestion(question).ok, true);
  }
  assert.deepEqual([...rightDigitCounts].sort(), [3, 4]);
});

test("S43G4P3 validator rejects subtraction without zero borrow chain", () => {
  const result = generateBatchABrowserQuestions({ sourceId, selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT, selectedKnowledgePointIds: [kpId], selectedPatternGroupIds: [groupId], questionCount: 1, generationSeed: "s43g4p3", includeAnswerKey: true });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const question = result.questions[0];
  const edited = { ...question, expression: question.expression };
  edited.expression = { ...question.expression, left: { ...question.expression.left, value: { kind: "integer", value: 4321 } }, right: { ...question.expression.right, value: { kind: "integer", value: 1111 } } };
  assert.equal(validateBatchABrowserQuestion(edited).ok, false);
});

test("S43G4P4 resolver accepts continuous borrow zero KP", () => {
  const plan = resolveVisiblePatternGroupSelection({ sourceId, selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT, selectedKnowledgePointIds: [kpId], selectedPatternGroupIds: [groupId], questionCount: 8, generationSeed: "s43g4p4" });
  assert.equal(plan.ok, true, JSON.stringify(plan.errors));
  assert.deepEqual(plan.knowledgePointIds, [kpId]);
  assert.deepEqual(plan.patternSpecIds, [specId]);
});
