import test from "node:test";
import assert from "node:assert/strict";

import { buildBatchABrowserWorksheetDocument } from "../../../site/modules/curriculum/batch-a/batch-a-browser-worksheet.js";
import { extractBatchAExpressionOperandValues } from "../../../site/modules/curriculum/batch-a/carry-policy.js";
import { BATCH_A_RESOLVER_SELECTION_MODES } from "../../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";

const sourceId = "g3a_u03_3a03";
const rows = [
  ["kp_g3a_u03_2digit_by_1digit_carry", "pg_g3a_u03_2digit_by_1digit_carry", "ps_g3a_u03_2digit_by_1digit_carry", "twoDigit"],
  ["kp_g3a_u03_10_multiple_by_1digit", "pg_g3a_u03_10_multiple_by_1digit", "ps_g3a_u03_10_multiple_by_1digit", "tenMultiple"],
  ["kp_g3a_u03_3digit_by_1digit", "pg_g3a_u03_3digit_by_1digit", "ps_g3a_u03_3digit_by_1digit", "threeDigit"],
  ["kp_g3a_u03_consecutive_multiplication_two_step", "pg_g3a_u03_consecutive_multiplication_two_step", "ps_g3a_u03_consecutive_multiplication_two_step", "twoStep"]
];

function worksheet(kpId, groupId) {
  return buildBatchABrowserWorksheetDocument({
    sourceId,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [kpId],
    selectedPatternGroupIds: [groupId],
    questionCount: 12,
    generationSeed: `s43g5b-${kpId}`,
    includeAnswerKey: true
  });
}

function checkAnswerKey(document) {
  for (const item of document.answerKeyItems) {
    assert.equal(item.promptText.includes("___"), true);
    assert.equal(item.promptText.endsWith(`= ${item.answerText}`), false);
  }
}

function checkShape(kind, operands) {
  if (kind === "twoDigit") {
    assert.equal(operands.length, 2);
    assert.equal(operands[0] >= 10 && operands[0] <= 99, true);
    assert.equal(operands[1] >= 2 && operands[1] <= 9, true);
  } else if (kind === "tenMultiple") {
    assert.equal(operands.length, 2);
    assert.equal(operands[0] % 10, 0);
    assert.equal(operands[0] >= 10 && operands[0] <= 90, true);
    assert.equal(operands[1] >= 2 && operands[1] <= 9, true);
  } else if (kind === "threeDigit") {
    assert.equal(operands.length, 2);
    assert.equal(operands[0] >= 100 && operands[0] <= 999, true);
    assert.equal(operands[1] >= 2 && operands[1] <= 9, true);
  } else if (kind === "twoStep") {
    assert.equal(operands.length, 3);
    assert.equal(operands[0] >= 2 && operands[0] <= 9, true);
    assert.equal(operands[1] >= 2 && operands[1] <= 9, true);
    assert.equal([3, 6, 10, 13, 17, 20].includes(operands[2]), true);
    assert.equal(operands[0] * operands[1] * operands[2] <= 729, true);
  }
}

test("S43G5B all visible G3A U03 KPs match their locked operand shapes", () => {
  for (const [kpId, groupId, specId, kind] of rows) {
    const result = worksheet(kpId, groupId);
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    assert.equal(result.worksheetDocument.generatedQuestions.every((question) => question.patternSpecId === specId), true);
    for (const question of result.worksheetDocument.generatedQuestions) {
      checkShape(kind, extractBatchAExpressionOperandValues(question.expression));
    }
    checkAnswerKey(result.worksheetDocument);
  }
});
