import test from "node:test";
import assert from "node:assert/strict";

import { buildBatchABrowserWorksheetDocument } from "../../../site/modules/curriculum/batch-a/batch-a-browser-worksheet.js";
import { extractBatchAExpressionOperandValues } from "../../../site/modules/curriculum/batch-a/carry-policy.js";
import { validateBatchABrowserQuestion } from "../../../site/modules/curriculum/batch-a/batch-a-browser-validator.js";
import { BATCH_A_RESOLVER_SELECTION_MODES, resolveVisiblePatternGroupSelection } from "../../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";
import { BATCH_A_SELECTOR_AVAILABILITY, getVisibleBatchAKnowledgePoint, listBatchAKnowledgePointAvailabilityBySource, resolveVisiblePatternSpecIdsForKnowledgePoint } from "../../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import { renderWorksheetDocumentToHtml } from "../../../site/modules/renderer/html-renderer.js";

const sourceId = "g3a_u03_3a03";
const zeroKp = "kp_g3a_u03_3digit_zero_middle_by_1digit";
const zeroGroup = "pg_g3a_u03_3digit_zero_middle_by_1digit";
const zeroSpec = "ps_g3a_u03_3digit_zero_middle_by_1digit";
const missKp = "kp_g3a_u03_multiplication_missing_digit_inference";
const missGroup = "pg_g3a_u03_multiplication_missing_digit_inference";
const missSpec = "ps_g3a_u03_multiplication_missing_digit_inference";

function worksheet(kpId, groupId, count = 8) {
  return buildBatchABrowserWorksheetDocument({
    sourceId,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [kpId],
    selectedPatternGroupIds: [groupId],
    questionCount: count,
    generationSeed: `s43g5-${kpId}`,
    includeAnswerKey: true
  });
}

function digitAt(value, placeValue) {
  return Math.floor(value / (10 ** placeValue)) % 10;
}

test("S43G5I UI selector exposes six G3A U03 KPs", () => {
  const availability = listBatchAKnowledgePointAvailabilityBySource(sourceId);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount, 18);
  assert.equal(availability.visibleCount, 6);
  assert.equal(getVisibleBatchAKnowledgePoint(zeroKp)?.displayName, "三位數中間為0乘一位數");
  assert.equal(getVisibleBatchAKnowledgePoint(missKp)?.displayName, "乘法缺位推理");
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(zeroKp), [zeroSpec]);
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(missKp), [missSpec]);
});

test("S43G5F zero-middle multiplication generates 3-digit zero-ten × 1-digit", () => {
  const result = worksheet(zeroKp, zeroGroup, 8);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  for (const question of result.worksheetDocument.generatedQuestions) {
    const [left, right] = extractBatchAExpressionOperandValues(question.expression);
    assert.equal(question.patternSpecId, zeroSpec);
    assert.equal(left >= 100 && left <= 999, true);
    assert.equal(digitAt(left, 1), 0);
    assert.equal(right >= 2 && right <= 9, true);
    assert.equal(validateBatchABrowserQuestion(question).ok, true);
  }
  const html = renderWorksheetDocumentToHtml(result.worksheetDocument, { stylesheetHref: "" });
  assert.equal(html.includes("worksheet-page--questions"), true);
  assert.equal(html.includes("worksheet-page--answer-key"), true);
});

test("S43G5H multiplication missing digit inference validates non-same-place blanks", () => {
  const result = worksheet(missKp, missGroup, 8);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  for (const question of result.worksheetDocument.generatedQuestions) {
    assert.equal(question.kind, "multiplicationMissingDigit");
    assert.equal(question.patternSpecId, missSpec);
    assert.equal(question.blanks.some((blank) => blank.target === "result"), true);
    assert.equal(new Set(question.blanks.map((blank) => blank.placeValue)).size, question.blanks.length);
    assert.equal(question.answerText, question.missingDigits.join(","));
    assert.equal(validateBatchABrowserQuestion(question).ok, true);
  }
  const html = renderWorksheetDocumentToHtml(result.worksheetDocument, { stylesheetHref: "" });
  assert.equal(html.includes("□"), true);
});

test("S43G5H validator rejects same-place A/C blank: 3□2 × 2 = 6□4", () => {
  const invalid = {
    id: "manual-same-place-fail",
    patternSpecId: missSpec,
    sourceId,
    kind: "multiplicationMissingDigit",
    operator: "multiply",
    shape: "AC",
    left: 342,
    right: 2,
    result: 684,
    blanks: [
      { target: "left", index: 1, placeValue: 1, digit: 4 },
      { target: "result", index: 1, placeValue: 1, digit: 8 }
    ],
    missingDigits: [4, 8],
    answerOrder: "prompt_left_to_right",
    promptText: "依照□出現順序，填入正確的數字。",
    displayText: "342 × 2 = 684",
    blankedDisplayText: "3□2 × 2 = 6□4",
    answerText: "4,8",
    finalAnswer: "4,8",
    metadata: { patternId: missSpec, sourceId }
  };
  assert.equal(validateBatchABrowserQuestion(invalid).ok, false);
});

test("S43G5J mixed supplementary worksheet can be printed", () => {
  const plan = resolveVisiblePatternGroupSelection({
    sourceId,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: [zeroKp, missKp],
    selectedPatternGroupIds: [zeroGroup, missGroup],
    questionCount: 8,
    generationSeed: "s43g5j"
  });
  assert.equal(plan.ok, true, JSON.stringify(plan.errors));

  const result = buildBatchABrowserWorksheetDocument({
    sourceId,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: [zeroKp, missKp],
    selectedPatternGroupIds: [zeroGroup, missGroup],
    questionCount: 8,
    generationSeed: "s43g5j",
    includeAnswerKey: true
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.answerKeyItems.length, 8);
  const html = renderWorksheetDocumentToHtml(result.worksheetDocument, { stylesheetHref: "" });
  assert.equal(html.includes("worksheet-page--questions"), true);
  assert.equal(html.includes("worksheet-page--answer-key"), true);
});
