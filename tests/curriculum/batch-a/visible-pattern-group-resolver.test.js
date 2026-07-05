import test from "node:test";
import assert from "node:assert/strict";

import {
  BATCH_A_RESOLVER_ERROR_CODES,
  BATCH_A_RESOLVER_SELECTION_MODES,
  resolveVisiblePatternGroupSelection
} from "../../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";
import { BATCH_A_SELECTOR_AVAILABILITY } from "../../../site/modules/curriculum/registry/batch-a-selector-candidates.js";

const ADD_KP_ID = "kp_g3a_u02_add_multi_carry";
const ADD_GROUP_ID = "pg_g3a_u02_add_multi_carry_seed";
const ADD_SPEC_ID = "ps_g3a_u02_4digit_add_multi_carry";
const SUB_KP_ID = "kp_g3a_u02_sub_multi_borrow";
const SUB_GROUP_ID = "pg_g3a_u02_sub_multi_borrow_seed";
const SUB_SPEC_ID = "ps_g3a_u02_4digit_sub_multi_borrow";

function errorCodes(result) {
  return result.errors.map((error) => error.code);
}

function createS43C9VisibleAddMultiCarryFixtureAccess() {
  const knowledgePoint = Object.freeze({
    knowledgePointId: ADD_KP_ID,
    sourceId: "g3a_u02_3a02",
    displayName: "四位數加法進位"
  });
  const patternGroup = Object.freeze({
    patternGroupId: ADD_GROUP_ID,
    sourceId: "g3a_u02_3a02",
    patternSpecIds: [ADD_SPEC_ID],
    allocationPolicy: "single_pattern",
    visibilityStatus: "visible"
  });
  const patternSpecIds = [ADD_SPEC_ID];

  return {
    listVisibleBatchAKnowledgePoints: () => [{ ...knowledgePoint }],
    getVisibleBatchAKnowledgePoint: (knowledgePointId) => (
      knowledgePointId === knowledgePoint.knowledgePointId ? { ...knowledgePoint } : null
    ),
    getVisiblePatternGroupsForKnowledgePoint: (knowledgePointId) => (
      knowledgePointId === knowledgePoint.knowledgePointId ? [{ ...patternGroup, patternSpecIds: [...patternGroup.patternSpecIds] }] : []
    ),
    resolveVisiblePatternSpecIdsForKnowledgePoint: (knowledgePointId) => (
      knowledgePointId === knowledgePoint.knowledgePointId ? [...patternSpecIds] : []
    )
  };
}

function assertSingleResolved(result, expected) {
  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
  assert.equal(result.worksheetMode, "batchAKnowledgePoint");
  assert.equal(result.selectionMode, BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT);
  assert.deepEqual(result.sourceIds, ["g3a_u02_3a02"]);
  assert.deepEqual(result.knowledgePointIds, [expected.knowledgePointId]);
  assert.deepEqual(result.patternGroupIds, [expected.patternGroupId]);
  assert.deepEqual(result.patternSpecIds, [expected.patternSpecId]);
  assert.deepEqual(result.allocation, [{
    patternGroupId: expected.patternGroupId,
    patternSpecId: expected.patternSpecId,
    questionCount: expected.questionCount
  }]);
  assert.equal(result.visibilityValidation.visibleAcceptedCount, 1);
  assert.equal(result.visibilityValidation.rejectedCount, 0);
  assert.deepEqual(result.visibilityValidation.rejectionCodes, []);
}

test("sourceUnit mode returns a safe handoff to the existing sourceId path", () => {
  const result = resolveVisiblePatternGroupSelection({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SOURCE_UNIT,
    sourceId: "g3a_u02_3a02",
    questionCount: 20,
    ordering: "groupedByPattern",
    generationSeed: "batch-a-browser",
    includeAnswerKey: true,
    selectedKnowledgePointIds: [ADD_KP_ID],
    selectedPatternGroupIds: [ADD_GROUP_ID]
  });

  assert.equal(result.ok, true);
  assert.equal(result.worksheetMode, "batchASource");
  assert.equal(result.selectionMode, BATCH_A_RESOLVER_SELECTION_MODES.SOURCE_UNIT);
  assert.deepEqual(result.sourceIds, ["g3a_u02_3a02"]);
  assert.deepEqual(result.knowledgePointIds, []);
  assert.deepEqual(result.patternGroupIds, []);
  assert.deepEqual(result.patternSpecIds, []);
  assert.deepEqual(result.allocation, []);
  assert.deepEqual(result.errors, []);
});

test("singleKnowledgePoint mode resolves production visible add-multi-carry KP", () => {
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount, 2);

  const result = resolveVisiblePatternGroupSelection({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    sourceId: "g3a_u02_3a02",
    selectedKnowledgePointIds: [ADD_KP_ID],
    selectedPatternGroupIds: [ADD_GROUP_ID],
    questionCount: 10
  });

  assertSingleResolved(result, {
    knowledgePointId: ADD_KP_ID,
    patternGroupId: ADD_GROUP_ID,
    patternSpecId: ADD_SPEC_ID,
    questionCount: 10
  });
});

test("singleKnowledgePoint mode resolves production visible subtraction regroup KP", () => {
  const result = resolveVisiblePatternGroupSelection({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    sourceId: "g3a_u02_3a02",
    selectedKnowledgePointIds: [SUB_KP_ID],
    selectedPatternGroupIds: [SUB_GROUP_ID],
    questionCount: 10
  });

  assertSingleResolved(result, {
    knowledgePointId: SUB_KP_ID,
    patternGroupId: SUB_GROUP_ID,
    patternSpecId: SUB_SPEC_ID,
    questionCount: 10
  });
});

test("D-row IDs do not resolve to PatternSpec IDs", () => {
  const result = resolveVisiblePatternGroupSelection({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    sourceId: "g3a_u02_3a02",
    selectedKnowledgePointIds: ["kp_g3a_u02_word_problem_estimation_add_sub"],
    selectedPatternGroupIds: ["pg_g3a_u02_word_problem_estimation_add_sub"],
    questionCount: 10
  });

  assert.equal(result.ok, false);
  assert.deepEqual(result.knowledgePointIds, []);
  assert.deepEqual(result.patternGroupIds, []);
  assert.deepEqual(result.patternSpecIds, []);
  assert.deepEqual(result.allocation, []);
  assert.ok(errorCodes(result).includes(BATCH_A_RESOLVER_ERROR_CODES.KP_NOT_VISIBLE));
});

test("same-unit KP mode resolves both G3A U02 Phase 1 KPs", () => {
  const result = resolveVisiblePatternGroupSelection({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    sourceId: "g3a_u02_3a02",
    selectedKnowledgePointIds: [ADD_KP_ID, SUB_KP_ID],
    questionCount: 10
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.knowledgePointIds, [ADD_KP_ID, SUB_KP_ID]);
  assert.deepEqual(result.patternGroupIds, [ADD_GROUP_ID, SUB_GROUP_ID]);
  assert.deepEqual(result.patternSpecIds, [ADD_SPEC_ID, SUB_SPEC_ID]);
  assert.equal(result.allocation.reduce((sum, item) => sum + item.questionCount, 0), 10);
  assert.equal(result.visibilityValidation.visibleAcceptedCount, 2);
});

test("unknown selection mode returns deterministic selection-mode error", () => {
  const result = resolveVisiblePatternGroupSelection({
    selectionMode: "unsupportedMode",
    sourceId: "g3a_u02_3a02",
    questionCount: 10
  });

  assert.equal(result.ok, false);
  assert.deepEqual(errorCodes(result), [BATCH_A_RESOLVER_ERROR_CODES.SELECTION_MODE_INVALID]);
  assert.deepEqual(result.patternSpecIds, []);
  assert.deepEqual(result.allocation, []);
});

test("cross-unit KP mode remains deferred before cross-unit resolver QA", () => {
  const result = resolveVisiblePatternGroupSelection({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_CROSS_UNIT,
    sourceId: "g3a_u02_3a02",
    selectedKnowledgePointIds: [ADD_KP_ID, SUB_KP_ID],
    questionCount: 10
  });

  assert.equal(result.ok, false);
  assert.deepEqual(errorCodes(result), [BATCH_A_RESOLVER_ERROR_CODES.CROSS_UNIT_NOT_SUPPORTED_YET]);
  assert.deepEqual(result.patternSpecIds, []);
  assert.deepEqual(result.allocation, []);
});

test("S43C9 fixture still resolves add-multi-carry visible KP through injected registry access", () => {
  const result = resolveVisiblePatternGroupSelection({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    sourceId: "g3a_u02_3a02",
    selectedKnowledgePointIds: [ADD_KP_ID],
    selectedPatternGroupIds: [ADD_GROUP_ID],
    questionCount: 7,
    ordering: "groupedByPattern",
    generationSeed: "s43c9-visible-kp-fixture",
    includeAnswerKey: true
  }, {
    registryAccess: createS43C9VisibleAddMultiCarryFixtureAccess()
  });

  assertSingleResolved(result, {
    knowledgePointId: ADD_KP_ID,
    patternGroupId: ADD_GROUP_ID,
    patternSpecId: ADD_SPEC_ID,
    questionCount: 7
  });
});
