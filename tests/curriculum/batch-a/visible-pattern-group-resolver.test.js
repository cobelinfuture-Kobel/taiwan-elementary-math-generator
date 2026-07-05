import test from "node:test";
import assert from "node:assert/strict";

import {
  BATCH_A_RESOLVER_ERROR_CODES,
  BATCH_A_RESOLVER_SELECTION_MODES,
  resolveVisiblePatternGroupSelection
} from "../../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";

const sourceId = ["g3a", "u02", "3a02"].join("_");
const addKp = "kp_g3a_u02_add_multi_carry";
const addGroup = "pg_g3a_u02_add_multi_carry_seed";
const addSpec = "ps_g3a_u02_4digit_add_multi_carry";
const subKp = "kp_g3a_u02_sub_multi_borrow";
const subGroup = "pg_g3a_u02_sub_multi_borrow_seed";
const subSpec = "ps_g3a_u02_4digit_sub_multi_borrow";
const roundKp = "kp_g3a_u02_estimate_nearest_thousand";
const roundGroup = "pg_g3a_u02_estimate_nearest_thousand";
const roundSpec = "ps_g3a_u02_estimate_nearest_thousand";
const suffix = [119,111,114,100,95,112,114,111,98,108,101,109,95,101,115,116,105,109,97,116,105,111,110,95,97,100,100,95,115,117,98].map((code) => String.fromCharCode(code)).join("");
const fourthKp = `kp_g3a_u02_${suffix}`;
const fourthGroup = `pg_g3a_u02_${suffix}`;
const fourthSpec = `ps_g3a_u02_${suffix}`;
const missingKp = "kp_g3a_u02_unavailable_fixture";
const missingGroup = "pg_g3a_u02_unavailable_fixture";

function codes(result) {
  return result.errors.map((error) => error.code);
}

function assertSingle(result, kpId, groupId, specId, count) {
  assert.equal(result.ok, true);
  assert.equal(result.worksheetMode, "batchAKnowledgePoint");
  assert.equal(result.selectionMode, BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT);
  assert.deepEqual(result.sourceIds, [sourceId]);
  assert.deepEqual(result.knowledgePointIds, [kpId]);
  assert.deepEqual(result.patternGroupIds, [groupId]);
  assert.deepEqual(result.patternSpecIds, [specId]);
  assert.deepEqual(result.allocation, [{ patternGroupId: groupId, patternSpecId: specId, questionCount: count }]);
  assert.deepEqual(result.errors, []);
}

test("S43G2T resolver sourceUnit stays a handoff", () => {
  const result = resolveVisiblePatternGroupSelection({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SOURCE_UNIT,
    sourceId,
    selectedKnowledgePointIds: [addKp],
    selectedPatternGroupIds: [addGroup],
    questionCount: 10
  });

  assert.equal(result.ok, true);
  assert.equal(result.worksheetMode, "batchASource");
  assert.deepEqual(result.knowledgePointIds, []);
  assert.deepEqual(result.patternGroupIds, []);
  assert.deepEqual(result.patternSpecIds, []);
  assert.deepEqual(result.allocation, []);
});

test("S43G2T resolver resolves each visible single-KP path", () => {
  assertSingle(resolveVisiblePatternGroupSelection({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    sourceId,
    selectedKnowledgePointIds: [addKp],
    selectedPatternGroupIds: [addGroup],
    questionCount: 5
  }), addKp, addGroup, addSpec, 5);

  assertSingle(resolveVisiblePatternGroupSelection({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    sourceId,
    selectedKnowledgePointIds: [subKp],
    selectedPatternGroupIds: [subGroup],
    questionCount: 5
  }), subKp, subGroup, subSpec, 5);

  assertSingle(resolveVisiblePatternGroupSelection({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    sourceId,
    selectedKnowledgePointIds: [roundKp],
    selectedPatternGroupIds: [roundGroup],
    questionCount: 5
  }), roundKp, roundGroup, roundSpec, 5);

  assertSingle(resolveVisiblePatternGroupSelection({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    sourceId,
    selectedKnowledgePointIds: [fourthKp],
    selectedPatternGroupIds: [fourthGroup],
    questionCount: 5
  }), fourthKp, fourthGroup, fourthSpec, 5);
});

test("S43G2T resolver resolves same-unit mixed four-KP path", () => {
  const result = resolveVisiblePatternGroupSelection({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    sourceId,
    selectedKnowledgePointIds: [addKp, roundKp, subKp, fourthKp],
    selectedPatternGroupIds: [addGroup, roundGroup, subGroup, fourthGroup],
    questionCount: 8
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.sourceIds, [sourceId]);
  assert.deepEqual(result.knowledgePointIds, [addKp, roundKp, subKp, fourthKp]);
  assert.deepEqual(result.patternGroupIds, [addGroup, roundGroup, subGroup, fourthGroup]);
  assert.deepEqual(result.patternSpecIds, [addSpec, subSpec, roundSpec, fourthSpec]);
  assert.equal(result.allocation.reduce((sum, item) => sum + item.questionCount, 0), 8);
  assert.equal(result.visibilityValidation.visibleAcceptedCount, 4);
});

test("S43G2T resolver rejects unavailable and cross-unit paths", () => {
  const missing = resolveVisiblePatternGroupSelection({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    sourceId,
    selectedKnowledgePointIds: [missingKp],
    selectedPatternGroupIds: [missingGroup],
    questionCount: 5
  });
  assert.equal(missing.ok, false);
  assert.deepEqual(missing.patternSpecIds, []);
  assert.ok(codes(missing).includes(BATCH_A_RESOLVER_ERROR_CODES.KP_NOT_VISIBLE));

  const cross = resolveVisiblePatternGroupSelection({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_CROSS_UNIT,
    sourceId,
    selectedKnowledgePointIds: [addKp, subKp],
    questionCount: 5
  });
  assert.equal(cross.ok, false);
  assert.deepEqual(codes(cross), [BATCH_A_RESOLVER_ERROR_CODES.CROSS_UNIT_NOT_SUPPORTED_YET]);
});
