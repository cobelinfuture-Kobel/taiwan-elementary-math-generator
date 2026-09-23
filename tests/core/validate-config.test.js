import test from "node:test";
import assert from "node:assert/strict";

import {
  ALLOCATION_MODES,
  GENERATION_MODES,
  NUMBER_DOMAINS,
  QUESTION_KINDS,
  SUPPORT_STATUSES
} from "../../src/core/constants.js";
import { createDefaultConfig } from "../../src/core/default-config.js";
import { validateConfig } from "../../src/core/validate-config.js";

test("default config validates", () => {
  const result = validateConfig(createDefaultConfig());
  assert.equal(result.ok, true);
  assert.equal(result.errors.length, 0);
});

test("decimal active domain is rejected", () => {
  const config = createDefaultConfig();
  config.numberDomain.kind = NUMBER_DOMAINS.DECIMAL;
  const result = validateConfig(config);
  assert.equal(result.ok, false);
  assert.match(result.errors.map((e) => e.code).join(","), /number_domain_not_supported_in_v1/);
});

test("fraction active domain is rejected", () => {
  const config = createDefaultConfig();
  config.numberDomain.kind = NUMBER_DOMAINS.FRACTION;
  const result = validateConfig(config);
  assert.equal(result.ok, false);
  assert.match(result.errors.map((e) => e.code).join(","), /number_domain_not_supported_in_v1/);
});

test("non-expression question kind is rejected for v1 generation", () => {
  const config = createDefaultConfig();
  config.questionKind = QUESTION_KINDS.WORD_PROBLEM;
  const result = validateConfig(config);
  assert.equal(result.ok, false);
  assert.match(result.errors.map((e) => e.code).join(","), /question_kind_not_supported_in_v1/);
});

test("printLayout.questionCount is not required and absence passes", () => {
  const config = createDefaultConfig();
  const result = validateConfig(config);
  assert.equal(result.ok, true);
  assert.equal("questionCount" in config.printLayout, false);
});

test("invalid operator is rejected", () => {
  const config = createDefaultConfig();
  config.expression.globalOperators = ["^"];
  config.expression.operatorSlots[0].allowedOperators = ["^"];
  const result = validateConfig(config);
  assert.equal(result.ok, false);
  assert.match(result.errors.map((e) => e.code).join(","), /operator_invalid|slot_operator_invalid/);
});

test("canonical multiplication and division operators validate", () => {
  const config = createDefaultConfig();
  config.expression.globalOperators = ["+", "-", "×", "÷"];
  config.expression.operatorSlots[0].allowedOperators = ["×", "÷"];
  config.patternPlan.patternPool.patterns[0].expressionTemplate.allowedOperatorsBySlot = [["×", "÷"]];
  const result = validateConfig(config);
  assert.equal(result.ok, true);
});

test("ASCII operator aliases are accepted at config input level", () => {
  const config = createDefaultConfig();
  config.expression.globalOperators = ["+", "-", "*", "/"];
  config.expression.operatorSlots[0].allowedOperators = ["*", "/"];
  config.patternPlan.patternPool.patterns[0].expressionTemplate.allowedOperatorsBySlot = [["*", "/"]];
  const result = validateConfig(config);
  assert.equal(result.ok, true);
});

test("invalid digit constraint is rejected", () => {
  const config = createDefaultConfig();
  config.expression.digitConstraints.push({
    target: "operand1",
    minDigits: 3,
    maxDigits: 2,
    allowZero: false,
    allowNegative: false
  });
  const result = validateConfig(config);
  assert.equal(result.ok, false);
  assert.match(result.errors.map((e) => e.code).join(","), /digit_constraint_range_invalid/);
});

test("future support-status pattern cannot be active for v1 generation", () => {
  const config = createDefaultConfig();
  config.generationMode = GENERATION_MODES.SINGLE_PATTERN;
  config.patternPlan.patternPool.patterns[0].supportStatus = [
    SUPPORT_STATUSES.V1_EXPRESSION_SUPPORTED,
    SUPPORT_STATUSES.FUTURE_DECIMAL_DOMAIN
  ];
  const result = validateConfig(config);
  assert.equal(result.ok, false);
  assert.match(result.errors.map((e) => e.code).join(","), /pattern_support_status_blocked|pattern_not_v1_generatable/);
});

test("fixedCounts not summing to generation.questionCount fails", () => {
  const config = createDefaultConfig();
  config.patternPlan.allocation.mode = ALLOCATION_MODES.FIXED_COUNTS;
  config.patternPlan.allocation.fixedCounts = [
    { patternId: "default_integer_add_sub_2op", questionCount: 19 }
  ];
  const result = validateConfig(config);
  assert.equal(result.ok, false);
  assert.match(result.errors.map((e) => e.code).join(","), /pattern_fixed_counts_sum_invalid/);
});
