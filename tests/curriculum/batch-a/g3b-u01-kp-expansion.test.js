import test from "node:test";
import assert from "node:assert/strict";

import { buildBatchABrowserWorksheetDocument } from "../../../site/modules/curriculum/batch-a/batch-a-browser-worksheet.js";
import { validateBatchABrowserQuestion } from "../../../site/modules/curriculum/batch-a/batch-a-browser-validator.js";
import { BATCH_A_RESOLVER_SELECTION_MODES, resolveVisiblePatternGroupSelection } from "../../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";
import { BATCH_A_SELECTOR_AVAILABILITY, getVisibleBatchAKnowledgePoint, getVisiblePatternGroupsForKnowledgePoint, listBatchAKnowledgePointAvailabilityBySource, resolveVisiblePatternSpecIdsForKnowledgePoint } from "../../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import { extractBatchAExpressionOperandValues } from "../../../site/modules/curriculum/batch-a/carry-policy.js";

const SOURCE_ID = "g3b_u01_3b01";
const THREE_DIGIT_SPEC_ID = "ps_g3b_u01_3digit_by_1digit_regroup_hundreds";
const TWO_DIGIT_SPEC_ID = "ps_g3b_u01_2digit_by_1digit_regroup_tens";
const ROWS = Object.freeze([
  ["kp_g3b_u01_3digit_by_1digit_regroup_hundreds", "pg_g3b_u01_3digit_by_1digit_regroup_hundreds", THREE_DIGIT_SPEC_ID, "三位數除以一位數"],
  ["kp_g3b_u01_2digit_by_1digit_regroup_tens", "pg_g3b_u01_2digit_by_1digit_regroup_tens", TWO_DIGIT_SPEC_ID, "二位數除以一位數退位"]
]);

function worksheet(kpId, groupId, count = 8) {
  return buildBatchABrowserWorksheetDocument({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [kpId],
    selectedPatternGroupIds: [groupId],
    questionCount: count,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: `s43e5-${kpId}`,
    printLayout: { columns: 4, rowsPerPage: 5, showAnswerKeyPage: true }
  });
}

function assertDivisionRange(question) {
  const [dividend, divisor] = extractBatchAExpressionOperandValues(question.expression);
  assert.equal(divisor >= 2 && divisor <= 9, true);
  assert.equal(dividend % divisor, 0);
  if (question.patternSpecId === THREE_DIGIT_SPEC_ID) {
    assert.equal(dividend >= 100 && dividend <= 999, true, `expected 3-digit dividend, got ${dividend}`);
  } else if (question.patternSpecId === TWO_DIGIT_SPEC_ID) {
    assert.equal(dividend >= 10 && dividend <= 99, true, `expected 2-digit dividend, got ${dividend}`);
  }
}

test("S43E5 G3B U01 exposes two division KPs", () => {
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount, 26);
  assert.equal(listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID).visibleCount, 2);
  for (const [kpId, groupId, specId, displayName] of ROWS) {
    const kp = getVisibleBatchAKnowledgePoint(kpId);
    assert.equal(kp.sourceId, SOURCE_ID);
    assert.equal(kp.displayName, displayName);
    assert.deepEqual(kp.patternSpecIds, [specId]);
    const groups = getVisiblePatternGroupsForKnowledgePoint(kpId);
    assert.equal(groups.length, 1);
    assert.equal(groups[0].patternGroupId, groupId);
    assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(kpId), [specId]);
  }
});

test("S43E5 G3B U01 resolver accepts same-unit division mix", () => {
  const plan = resolveVisiblePatternGroupSelection({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: ROWS.map((row) => row[0]),
    selectedPatternGroupIds: ROWS.map((row) => row[1]),
    questionCount: 8,
    generationSeed: "s43e5-g3b-u01"
  });
  assert.equal(plan.ok, true, JSON.stringify(plan.errors));
  assert.deepEqual(plan.knowledgePointIds, ROWS.map((row) => row[0]).sort());
  assert.deepEqual(plan.patternSpecIds, ROWS.map((row) => row[2]).sort());
});

test("S43E5 G3B U01 single-KP worksheets are printable, valid, and range-correct", () => {
  for (const [kpId, groupId, specId] of ROWS) {
    const result = worksheet(kpId, groupId, 8);
    assert.equal(result.ok, true, JSON.stringify(result.errors, null, 2));
    assert.equal(result.worksheetDocument.batchA.sourceId, SOURCE_ID);
    assert.equal(result.worksheetDocument.questionDisplayModels.length, 8);
    assert.equal(result.worksheetDocument.answerKeyItems.length, 8);
    for (const question of result.worksheetDocument.generatedQuestions) {
      assert.equal(question.patternSpecId, specId);
      assert.equal(question.sourceId, SOURCE_ID);
      assertDivisionRange(question);
      assert.equal(validateBatchABrowserQuestion(question).ok, true);
    }
  }
});

test("S43E5 G3B U01 mixed worksheet includes both division ranges", () => {
  const result = buildBatchABrowserWorksheetDocument({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: ROWS.map((row) => row[0]),
    selectedPatternGroupIds: ROWS.map((row) => row[1]),
    questionCount: 12,
    ordering: "shuffleAcrossPatterns",
    includeAnswerKey: true,
    generationSeed: "s43e5-g3b-u01-mixed-range",
    printLayout: { columns: 4, rowsPerPage: 5, showAnswerKeyPage: true }
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors, null, 2));
  assert.deepEqual(new Set(result.worksheetDocument.generatedQuestions.map((question) => question.patternSpecId)), new Set([THREE_DIGIT_SPEC_ID, TWO_DIGIT_SPEC_ID]));
  for (const question of result.worksheetDocument.generatedQuestions) assertDivisionRange(question);
});
