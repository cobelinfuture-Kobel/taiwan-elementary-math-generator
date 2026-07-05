import test from "node:test";
import assert from "node:assert/strict";

import { generateBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-generator.js";
import { buildBatchABrowserWorksheetDocument } from "../../../site/modules/curriculum/batch-a/batch-a-browser-worksheet.js";
import {
  countAdditionCarries,
  countSubtractionRegroups,
  extractBatchAExpressionOperandValues
} from "../../../site/modules/curriculum/batch-a/carry-policy.js";
import { BATCH_A_RESOLVER_SELECTION_MODES } from "../../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";

const SOURCE_ID = "g3a_u02_3a02";
const ADD_KP_ID = "kp_g3a_u02_add_multi_carry";
const ADD_GROUP_ID = "pg_g3a_u02_add_multi_carry_seed";
const SUB_KP_ID = "kp_g3a_u02_sub_multi_borrow";
const SUB_GROUP_ID = "pg_g3a_u02_sub_multi_borrow_seed";
const ROUND_KP_ID = "kp_g3a_u02_estimate_nearest_thousand";
const ROUND_GROUP_ID = "pg_g3a_u02_estimate_nearest_thousand";
const CONTEXT_SUFFIX = [119,111,114,100,95,112,114,111,98,108,101,109,95,101,115,116,105,109,97,116,105,111,110,95,97,100,100,95,115,117,98].map((code) => String.fromCharCode(code)).join("");
const CONTEXT_KP_ID = `kp_g3a_u02_${CONTEXT_SUFFIX}`;
const CONTEXT_GROUP_ID = `pg_g3a_u02_${CONTEXT_SUFFIX}`;

function digitCount(value) {
  return String(Math.abs(value)).length;
}

function generateSingle(kpId, groupId, questionCount = 20) {
  return generateBatchABrowserQuestions({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [kpId],
    selectedPatternGroupIds: [groupId],
    questionCount,
    generationSeed: `s43g4e-${kpId}`,
    includeAnswerKey: true
  });
}

test("S43G4E add multi-carry covers 1/2/3/4-digit addends and at least two carries", () => {
  const result = generateSingle(ADD_KP_ID, ADD_GROUP_ID, 20);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const rightDigitCounts = new Set();

  for (const question of result.questions) {
    const [left, right] = extractBatchAExpressionOperandValues(question.expression);
    assert.equal(digitCount(left), 4);
    rightDigitCounts.add(digitCount(right));
    assert.equal(countAdditionCarries(left, right, 10, { checkedColumns: ["ones", "tens", "hundreds"] }) >= 2, true);
  }

  assert.deepEqual([...rightDigitCounts].sort(), [1, 2, 3, 4]);
});

test("S43G4E subtraction multi-borrow covers 1/2/3/4-digit subtrahends and at least two borrows", () => {
  const result = generateSingle(SUB_KP_ID, SUB_GROUP_ID, 20);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const rightDigitCounts = new Set();

  for (const question of result.questions) {
    const [left, right] = extractBatchAExpressionOperandValues(question.expression);
    assert.equal(digitCount(left), 4);
    rightDigitCounts.add(digitCount(right));
    assert.equal(countSubtractionRegroups(left, right, 10, { checkedColumns: ["ones", "tens", "hundreds"] }) >= 2, true);
  }

  assert.deepEqual([...rightDigitCounts].sort(), [1, 2, 3, 4]);
});

test("S43G4E rounding prompt is explicit and includes half-up boundary coverage", () => {
  const result = generateSingle(ROUND_KP_ID, ROUND_GROUP_ID, 8);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(result.questions.map((question) => question.value), [1499, 1500, 2499, 2500, 8499, 8500, 9499, 9500]);
  assert.equal(result.questions.every((question) => question.blankedDisplayText.includes("最接近的千位數")), true);
});

test("S43G4E context estimate uses real Chinese word-problem prompts", () => {
  const result = generateSingle(CONTEXT_KP_ID, CONTEXT_GROUP_ID, 8);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.every((question) => question.blankedDisplayText.includes("先把兩個數估到最接近的千位")), true);
  assert.equal(result.questions.every((question) => !question.blankedDisplayText.startsWith("Estimate ")), true);
});

test("S43G4E answer key does not duplicate final answers in prompts and 20-question pages avoid filler cells", () => {
  const result = buildBatchABrowserWorksheetDocument({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [ADD_KP_ID],
    selectedPatternGroupIds: [ADD_GROUP_ID],
    questionCount: 20,
    generationSeed: "s43g4e-layout",
    includeAnswerKey: true
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.questionPages[0].fillerCellCount, 0);
  assert.equal(result.worksheetDocument.answerKeyPages[0].fillerCellCount, 0);
  for (const item of result.worksheetDocument.answerKeyItems) {
    assert.equal(item.promptText.includes(item.answerText), false);
  }
});
