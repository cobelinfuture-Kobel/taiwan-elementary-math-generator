import test from "node:test";
import assert from "node:assert/strict";

import {
  generateAndValidateG5AU02ClassC,
  generateG5AU02ClassC,
  getG5AU02ClassCPatternIds,
  validateG5AU02ClassC,
} from "../../src/curriculum/g5a-u02/class-c-generator-validator.js";

const EXPECTED_CLASS_C_IDS = [
  "ps_g5a_u02_factor_relation_equivalence",
  "ps_g5a_u02_factor_enumeration_trial_division",
  "ps_g5a_u02_factor_pair_enumeration",
  "ps_g5a_u02_factor_list_from_pairs",
  "ps_g5a_u02_factor_order_and_symmetry",
  "ps_g5a_u02_missing_factor_reconstruction",
  "ps_g5a_u02_divisor_candidate_selection",
  "ps_g5a_u02_factor_statement_judgement",
  "ps_g5a_u02_problem_type_classification",
  "ps_g5a_u02_complete_factor_list_unknown_values",
  "ps_g5a_u02_complete_factor_list_statement_evaluation",
  "ps_g5a_u02_common_factor_concept_identification",
  "ps_g5a_u02_common_factor_enumeration",
  "ps_g5a_u02_greatest_common_factor",
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test("S85 exposes exactly the 14 S84 Class C PatternSpecs", () => {
  assert.deepEqual(getG5AU02ClassCPatternIds(), EXPECTED_CLASS_C_IDS);
});

for (const [index, patternSpecId] of EXPECTED_CLASS_C_IDS.entries()) {
  test(`S85 generates and validates ${patternSpecId}`, () => {
    const item = generateAndValidateG5AU02ClassC(patternSpecId, { seed: index + 17 });
    assert.equal(item.patternSpecId, patternSpecId);
    assert.equal(item.implementationClass, "C");
    assert.equal(item.lifecycle.unitId, "g5a_u02");
    assert.equal(item.lifecycle.selectorStatus, "hidden");
    assert.equal(item.lifecycle.canonicalRouting, "disabled");
    assert.equal(item.lifecycle.productionUse, "forbidden");
    assert.equal(item.lifecycle.genericFallback, "forbidden");
    assert.deepEqual(validateG5AU02ClassC(item), { ok: true, errors: [] });
  });
}

test("S85 generation is deterministic for the same PatternSpec and seed", () => {
  const first = generateG5AU02ClassC("ps_g5a_u02_common_factor_enumeration", { seed: 2026 });
  const second = generateG5AU02ClassC("ps_g5a_u02_common_factor_enumeration", { seed: 2026 });
  assert.deepEqual(first, second);
});

test("S85 rejects Class D PatternSpecs and never uses a generic fallback", () => {
  assert.throws(
    () => generateG5AU02ClassC("ps_g5a_u02_maximum_equal_grouping", { seed: 1 }),
    /G5AU02_PATTERN_SPEC_ID_INVALID/,
  );
});

test("S85 blocks a non-factor injected into a complete factor list", () => {
  const item = clone(generateG5AU02ClassC("ps_g5a_u02_factor_enumeration_trial_division", { seed: 31 }));
  item.answer.values.push(item.data.target + 1);
  const result = validateG5AU02ClassC(item);
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("G5AU02_FACTOR_SET_INCOMPLETE"));
});

test("S85 blocks a factor-pair product mismatch", () => {
  const item = clone(generateG5AU02ClassC("ps_g5a_u02_factor_pair_enumeration", { seed: 32 }));
  item.answer.pairs[0][1] += 1;
  const result = validateG5AU02ClassC(item);
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("G5AU02_FACTOR_PAIR_PRODUCT_MISMATCH"));
});

test("S85 blocks a false quotient witness", () => {
  const item = clone(generateG5AU02ClassC("ps_g5a_u02_factor_relation_equivalence", { seed: 33 }));
  item.answer.isFactor = true;
  item.answer.quotient = 999;
  const result = validateG5AU02ClassC(item);
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("G5AU02_FACTOR_QUOTIENT_WITNESS_INVALID"));
});

test("S85 blocks a missing-factor position mutation", () => {
  const item = clone(generateG5AU02ClassC("ps_g5a_u02_missing_factor_reconstruction", { seed: 34 }));
  const key = Object.keys(item.answer.valuesByPosition)[0];
  item.answer.valuesByPosition[key] += 1;
  const result = validateG5AU02ClassC(item);
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("G5AU02_MISSING_FACTOR_POSITION_INVALID"));
});

test("S85 blocks an incomplete selection set", () => {
  const item = clone(generateG5AU02ClassC("ps_g5a_u02_divisor_candidate_selection", { seed: 35 }));
  item.answer.selectedValues.pop();
  const result = validateG5AU02ClassC(item);
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("G5AU02_SELECTION_SET_INCOMPLETE"));
});

test("S85 blocks an invalid boolean truth value", () => {
  const item = clone(generateG5AU02ClassC("ps_g5a_u02_factor_statement_judgement", { seed: 36 }));
  item.answer.value = !item.answer.value;
  const result = validateG5AU02ClassC(item);
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("G5AU02_BOOLEAN_TRUTH_VALUE_INVALID"));
});

test("S85 blocks an unsupported problem-type label", () => {
  const item = clone(generateG5AU02ClassC("ps_g5a_u02_problem_type_classification", { seed: 37 }));
  item.answer.label = "free_form";
  const result = validateG5AU02ClassC(item);
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("G5AU02_PROBLEM_TYPE_NOT_ALLOWED"));
});

test("S85 blocks a non-common value in common-factor selection", () => {
  const item = clone(generateG5AU02ClassC("ps_g5a_u02_common_factor_concept_identification", { seed: 38 }));
  item.answer.selectedValues.push(Math.max(item.data.a, item.data.b) + 1);
  const result = validateG5AU02ClassC(item);
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("G5AU02_COMMON_FACTOR_NONCOMMON_INCLUDED"));
});

test("S85 blocks a non-maximum GCF answer", () => {
  const item = clone(generateG5AU02ClassC("ps_g5a_u02_greatest_common_factor", { seed: 39 }));
  item.answer.value = 1;
  const result = validateG5AU02ClassC(item);
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("G5AU02_GCF_NOT_MAXIMUM"));
});

test("S85 blocks lifecycle promotion to public or production use", () => {
  const item = clone(generateG5AU02ClassC("ps_g5a_u02_common_factor_enumeration", { seed: 40 }));
  item.lifecycle.selectorStatus = "visible";
  item.lifecycle.productionUse = "allowed";
  const result = validateG5AU02ClassC(item);
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("G5AU02_LIFECYCLE_NOT_HIDDEN"));
  assert.ok(result.errors.includes("G5AU02_PRODUCTION_USE_FORBIDDEN"));
});

test("S85 blocks generic fallback permission", () => {
  const item = clone(generateG5AU02ClassC("ps_g5a_u02_common_factor_enumeration", { seed: 41 }));
  item.lifecycle.genericFallback = "allowed";
  const result = validateG5AU02ClassC(item);
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("G5AU02_GENERIC_FALLBACK_FORBIDDEN"));
});

test("S85 blocks an unknown PatternSpec at validation time", () => {
  const item = clone(generateG5AU02ClassC("ps_g5a_u02_greatest_common_factor", { seed: 42 }));
  item.patternSpecId = "ps_unknown";
  const result = validateG5AU02ClassC(item);
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("G5AU02_PATTERN_SPEC_ID_INVALID"));
});
