import test from "node:test";
import assert from "node:assert/strict";

import {
  BATCH_A_RESOLVER_ERROR_CODES,
  BATCH_A_RESOLVER_SELECTION_MODES,
  resolveVisiblePatternGroupSelection
} from "../../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";

function errorCodes(result) {
  return result.errors.map((error) => error.code);
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

test("singleKnowledgePoint mode fails safely when current selector projection has zero visible KPs", () => {
  const result = resolveVisiblePatternGroupSelection({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    sourceId: "g3a_u02_3a02",
    selectedKnowledgePointIds: ["kp_g3a_u02_add_multi_carry"],
    selectedPatternGroupIds: ["pg_g3a_u02_add_multi_carry_seed"],
    questionCount: 10
  });

  assert.equal(result.ok, false);
  assert.deepEqual(result.patternSpecIds, []);
  assert.deepEqual(result.allocation, []);
  assert.ok(errorCodes(result).includes(BATCH_A_RESOLVER_ERROR_CODES.NO_VISIBLE_KP));
  assert.equal(result.visibilityValidation.rejectedCount, 1);
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
  assert.ok(errorCodes(result).includes(BATCH_A_RESOLVER_ERROR_CODES.NO_VISIBLE_KP));
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
  assert.ok(errorCodes(result).includes(BATCH_A_RESOLVER_ERROR_CODES.NO_VISIBLE_KP));
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
