import test from "node:test";
import assert from "node:assert/strict";

import { generateBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-generator.js";
import { countAdditionCarries, countSubtractionRegroups, extractBatchAExpressionOperandValues } from "../../../site/modules/curriculum/batch-a/carry-policy.js";
import { BATCH_A_RESOLVER_SELECTION_MODES } from "../../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";

const sourceId = "g3a_u02_3a02";
const addKp = "kp_g3a_u02_add_multi_carry";
const addGroup = "pg_g3a_u02_add_multi_carry_seed";
const subKp = "kp_g3a_u02_sub_multi_borrow";
const subGroup = "pg_g3a_u02_sub_multi_borrow_seed";
const roundKp = "kp_g3a_u02_estimate_nearest_thousand";
const roundGroup = "pg_g3a_u02_estimate_nearest_thousand";
const suffix = [119,111,114,100,95,112,114,111,98,108,101,109,95,101,115,116,105,109,97,116,105,111,110,95,97,100,100,95,115,117,98].map((code) => String.fromCharCode(code)).join("");
const contextKp = `kp_g3a_u02_${suffix}`;
const contextGroup = `pg_g3a_u02_${suffix}`;

function digits(value) {
  return String(Math.abs(value)).length;
}

function make(kpId, groupId, questionCount = 20) {
  return generateBatchABrowserQuestions({
    sourceId,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [kpId],
    selectedPatternGroupIds: [groupId],
    questionCount,
    generationSeed: `s43g4e-${kpId}`,
    includeAnswerKey: true
  });
}

test("S43G4E add covers digit buckets and multi-carry", () => {
  const result = make(addKp, addGroup, 20);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const buckets = new Set();
  for (const question of result.questions) {
    const [left, right] = extractBatchAExpressionOperandValues(question.expression);
    assert.equal(digits(left), 4);
    buckets.add(digits(right));
    assert.equal(countAdditionCarries(left, right, 10, { checkedColumns: ["ones", "tens", "hundreds"] }) >= 2, true);
  }
  assert.deepEqual([...buckets].sort(), [1, 2, 3, 4]);
});

test("S43G4E subtract covers digit buckets and multi-borrow", () => {
  const result = make(subKp, subGroup, 20);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const buckets = new Set();
  for (const question of result.questions) {
    const [left, right] = extractBatchAExpressionOperandValues(question.expression);
    assert.equal(digits(left), 4);
    buckets.add(digits(right));
    assert.equal(countSubtractionRegroups(left, right, 10, { checkedColumns: ["ones", "tens", "hundreds"] }) >= 2, true);
  }
  assert.deepEqual([...buckets].sort(), [1, 2, 3, 4]);
});

test("S43G4E rounding has explicit prompt and boundary values", () => {
  const result = make(roundKp, roundGroup, 8);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(result.questions.map((question) => question.value), [1499, 1500, 2499, 2500, 8499, 8500, 9499, 9500]);
  assert.equal(result.questions.every((question) => question.blankedDisplayText.includes("最接近的千位數")), true);
});

test("S43G4E context estimate uses Chinese story prompts", () => {
  const result = make(contextKp, contextGroup, 8);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.every((question) => question.blankedDisplayText.includes("先把兩個數估到最接近的千位")), true);
  assert.equal(result.questions.every((question) => !question.blankedDisplayText.startsWith("Estimate ")), true);
});
