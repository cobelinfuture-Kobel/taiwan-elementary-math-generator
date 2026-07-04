import test from "node:test";
import assert from "node:assert/strict";

import {
  BATCH_A_RESOLVER_ERROR_CODES,
  BATCH_A_RESOLVER_SELECTION_MODES,
  resolveVisiblePatternGroupSelection
} from "../../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";
import { BATCH_A_SELECTOR_AVAILABILITY } from "../../../site/modules/curriculum/registry/batch-a-selector-candidates.js";

function errorCodes(result) {
  return result.errors.map((error) => error.code);
}

function createS43C9VisibleAddMultiCarryFixtureAccess() {
  const knowledgePoint = Object.freeze({
    knowledgePointId: "kp_g3a_u02_add_multi_carry",
    sourceId: "g3a_u02_3a02",
    displayName: "四位數加法進位"
  });
  const patternGroup = Object.freeze({
    patternGroupId: "pg_g3a_u02_add_multi_carry_seed",
    sourceId: "g3a_u02_3a02",
    patternSpecIds: ["ps_g3a_u02_4digit_add_multi_carry"],
    allocationPolicy: "single_pattern",
    visibilityStatus: "visible"
  });
  const patternSpecIds = ["ps_g3a_u02_4digit_add_multi_carry"];

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

function assertAddMultiCarryResolved(result, expectedQuestionCount) {
  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
  assert.equal(result.worksheetMode, "batchAKnowledgePoint");
  assert.equal(result.selectionMode, BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT);
  assert.deepEqual(result.sourceIds, ["g3a_u02_3a02"]);
  assert.deepEqual(result.knowledgePointIds, ["kp_g3a_u02_add_multi_carry"]);
  assert.deepEqual(result.patternGroupIds, ["pg_g3a_u02_add_multi_carry_seed"]);
  assert.deepEqual(result.patternSpecIds, ["ps_g3a_u02_4digit_add_multi_carry"]);
  assert.deepEqual(result.allocation, [{
    patternGroupId: "pg_g3a_u02_add_multi_carry_seed",
    patternSpecId: "ps_g3a_u02_4digit_add_multi_carry",
    questionCount: expectedQuestionCount
  }]);
  assert.equal(result.visibilityValidation.visibleAcceptedCount, 1);
  assert.equal(result.visibilityValidation.rejectedCount, 0);
  assert.deepEqual(result.visibilityValidation.rejectionCodes, []);
  assert.deepEqual(result.provenance, {
    resolver: "visiblePatternGroupResolver",
    sourceIds: ["g3a_u02_3a02"],
    knowledgePointIds: ["kp_g3a_u02_add_multi_carry"],
    patternGroupIds: ["pg_g3a_u02_add_multi_carry_seed"],
    patternSpecIds: ["ps_g3a_u02_4digit_add_multi_carry"]
  });
}

test("sourceUnit mode returns a safe handoff to the existing sourceId path", () => {
  const result = resolveVisiblePatternGroupSelection({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SOURCE_UNIT,
    sourceId: "g3a_u02_3a02",
    questionCount: 20,
    ordering: "groupedByPattern",
    generationSeed: "batch-a-browser",
    includeAnswerKey: true,
    selectedKnowledgePointIds: ["kp_g3a_u02_add_multi_carry"],
    selectedPatternGroupIds: ["pg_g3a_u02_add_multi_carry_seed"]
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
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount, 1);

  const result = resolveVisiblePatternGroupSelection({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    sourceId: "g3a_u02_3a02",
    selectedKnowledgePointIds: ["kp_g3a_u02_add_multi_carry"],
    selectedPatternGroupIds: ["pg_g3a_u02_add_multi_carry_seed"],
    questionCount: 10
  });

  assertAddMultiCarryResolved(result, 10);
});

test("hidden A-row IDs do not resolve to PatternSpec IDs", () => {
  const result = resolveVisiblePatternGroupSelection({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    sourceId: "g3a_u02_3a02",
    selectedKnowledgePointIds: ["kp_g3a_u02_sub_multi_borrow"],
    selectedPatternGroupIds: ["pg_g3a_u02_sub_multi_borrow_seed"],
    questionCount: 10
  });

  assert.equal(result.ok, false);
  assert.deepEqual(result.knowledgePointIds, []);
  assert.deepEqual(result.patternGroupIds, []);
  assert.deepEqual(result.patternSpecIds, []);
  assert.deepEqual(result.allocation, []);
  assert.ok(errorCodes(result).includes(BATCH_A_RESOLVER_ERROR_CODES.KP_NOT_VISIBLE));
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
    selectedKnowledgePointIds: ["kp_g3a_u02_add_multi_carry", "kp_g3a_u02_sub_multi_borrow"],
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
    selectedKnowledgePointIds: ["kp_g3a_u02_add_multi_carry"],
    selectedPatternGroupIds: ["pg_g3a_u02_add_multi_carry_seed"],
    questionCount: 7,
    ordering: "groupedByPattern",
    generationSeed: "s43c9-visible-kp-fixture",
    includeAnswerKey: true
  }, {
    registryAccess: createS43C9VisibleAddMultiCarryFixtureAccess()
  });

  assertAddMultiCarryResolved(result, 7);
});
