import test from "node:test";
import assert from "node:assert/strict";

import {
  ALLOCATION_MODES,
  GENERATION_MODES,
  QUESTION_KINDS,
  SUPPORT_STATUSES
} from "../../src/core/constants.js";
import { createDefaultConfig } from "../../src/core/default-config.js";
import {
  allocatePatternCounts,
  isPatternV1Generatable,
  validatePatternPlan
} from "../../src/core/pattern-planning.js";

test("fixedCounts allocation works", () => {
  const config = createDefaultConfig();
  const result = allocatePatternCounts(config);
  assert.equal(result.ok, true);
  assert.deepEqual(result.allocations, [
    { patternId: "default_integer_add_sub_2op", questionCount: 20 }
  ]);
});

test("equalDistribution allocation works", () => {
  const config = createDefaultConfig();
  config.generationMode = GENERATION_MODES.MIXED_PATTERN;
  config.generation.questionCount = 5;
  config.patternPlan.patternPool.selectionMode = "multiple";
  config.patternPlan.patternPool.patterns = [
    {
      ...config.patternPlan.patternPool.patterns[0],
      patternId: "pattern_a",
      enabled: true
    },
    {
      ...config.patternPlan.patternPool.patterns[0],
      patternId: "pattern_b",
      enabled: true
    }
  ];
  config.patternPlan.allocation = {
    mode: ALLOCATION_MODES.EQUAL_DISTRIBUTION,
    totalQuestionCount: 5,
    fixedCounts: [],
    weights: []
  };

  const result = allocatePatternCounts(config);
  assert.equal(result.ok, true);
  assert.deepEqual(result.allocations, [
    { patternId: "pattern_a", questionCount: 3 },
    { patternId: "pattern_b", questionCount: 2 }
  ]);
});

test("duplicate pattern ids rejected", () => {
  const config = createDefaultConfig();
  config.generationMode = GENERATION_MODES.MIXED_PATTERN;
  config.patternPlan.patternPool.selectionMode = "multiple";
  config.patternPlan.patternPool.patterns = [
    {
      ...config.patternPlan.patternPool.patterns[0],
      patternId: "dup",
      enabled: true
    },
    {
      ...config.patternPlan.patternPool.patterns[0],
      patternId: "dup",
      enabled: true
    }
  ];
  config.patternPlan.allocation = {
    mode: ALLOCATION_MODES.EQUAL_DISTRIBUTION,
    totalQuestionCount: 20,
    fixedCounts: [],
    weights: []
  };

  const result = validatePatternPlan(config);
  assert.equal(result.ok, false);
  assert.match(result.errors.map((e) => e.code).join(","), /pattern_id_duplicate/);
});

test("weightedDistribution returns scaffold warning or error", () => {
  const config = createDefaultConfig();
  config.patternPlan.allocation.mode = ALLOCATION_MODES.WEIGHTED_DISTRIBUTION;
  config.patternPlan.allocation.weights = [
    { patternId: "default_integer_add_sub_2op", weight: 1 }
  ];
  const validation = validatePatternPlan(config);
  assert.match(validation.warnings.map((e) => e.code).join(","), /pattern_weighted_distribution_scaffold_only/);

  const allocation = allocatePatternCounts(config);
  assert.equal(allocation.ok, false);
  assert.match(allocation.errors.map((e) => e.code).join(","), /pattern_weighted_distribution_not_implemented/);
});

test("v1 non-generatable pattern is blocked", () => {
  const config = createDefaultConfig();
  const pattern = {
    ...config.patternPlan.patternPool.patterns[0],
    patternId: "future_decimal",
    supportStatus: [SUPPORT_STATUSES.FUTURE_DECIMAL_DOMAIN],
    questionKind: QUESTION_KINDS.EXPRESSION
  };
  assert.equal(isPatternV1Generatable(pattern), false);
});
