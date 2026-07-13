import test from "node:test";
import assert from "node:assert/strict";

import {
  G5A_U02_CLASS_D_LIFECYCLE,
  generateAndValidateG5AU02ClassD,
  generateG5AU02ClassD,
  getG5AU02ClassDPatternIds,
  validateG5AU02ClassD,
} from "../../src/curriculum/g5a-u02/class-d-semantic-generator-validator.js";

function clone(value) { return JSON.parse(JSON.stringify(value)); }

const IDS = getG5AU02ClassDPatternIds();

test("S87 exposes exactly eight Class D PatternSpecs", () => {
  assert.equal(IDS.length, 8);
  assert.equal(new Set(IDS).size, 8);
});

test("S87 generates and blocks-validates every Class D PatternSpec", () => {
  for (const [index, id] of IDS.entries()) {
    const item = generateAndValidateG5AU02ClassD(id, { seed: 8700 + index });
    assert.equal(item.patternSpecId, id);
    assert.equal(item.implementationClass, "D");
    assert.equal(item.lifecycle.selectorStatus, "hidden");
    assert.equal(item.lifecycle.canonicalRouting, "disabled");
    assert.equal(item.lifecycle.productionUse, "forbidden");
    assert.equal(item.lifecycle.genericFallback, "forbidden");
    assert.equal(item.lifecycle.freeFormAI, "forbidden");
    assert.ok(item.templateFamilyId.startsWith("tpl_g5a_u02_"));
    assert.ok(item.data.semanticRole);
    assert.deepEqual(validateG5AU02ClassD(item), { ok: true, errors: [] });
  }
});

test("S87 remains deterministic for equal PatternSpec and seed", () => {
  for (const id of IDS) {
    assert.deepEqual(generateG5AU02ClassD(id, { seed: 8711 }), generateG5AU02ClassD(id, { seed: 8711 }));
  }
});

test("S87 blocks unknown and Class C PatternSpecs without fallback", () => {
  assert.throws(() => generateG5AU02ClassD("ps_unknown"), /G5AU02_PATTERN_SPEC_ID_INVALID/);
  assert.throws(() => generateG5AU02ClassD("ps_g5a_u02_greatest_common_factor"), /G5AU02_PATTERN_SPEC_ID_INVALID/);
});

test("S87 blocks controlled-template drift and missing semantic roles", () => {
  const item = clone(generateG5AU02ClassD(IDS[0], { seed: 8721 }));
  item.templateFamilyId = "tpl_unknown";
  delete item.data.semanticRole;
  const result = validateG5AU02ClassD(item);
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("G5AU02_CONTROLLED_TEMPLATE_REQUIRED"));
  assert.ok(result.errors.includes("G5AU02_TEMPLATE_ROLE_MISSING"));
});

test("S87 blocks equal-partition and packaging non-divisor answers", () => {
  for (const id of [
    "ps_g5a_u02_equal_partition_all_segment_counts",
    "ps_g5a_u02_equal_partition_range_constrained_recipients",
    "ps_g5a_u02_possible_equal_packaging_counts",
  ]) {
    const item = clone(generateG5AU02ClassD(id, { seed: 8731 }));
    item.answer.values = [999];
    const result = validateG5AU02ClassD(item);
    assert.equal(result.ok, false);
    assert.ok(result.errors.includes("G5AU02_EQUAL_PARTITION_NONDIVISOR"));
  }
});

test("S87 blocks a non-maximum equal grouping answer", () => {
  const item = clone(generateG5AU02ClassD("ps_g5a_u02_maximum_equal_grouping", { seed: 8741 }));
  item.answer.value = item.answer.value + 1;
  const result = validateG5AU02ClassD(item);
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("G5AU02_GCF_NOT_MAXIMUM"));
});

test("S87 enforces remainder divisor relation, range and canonical remainder", () => {
  const id = "ps_g5a_u02_remainder_transfer";
  const relation = clone(generateG5AU02ClassD(id, { seed: 8751 }));
  relation.data.largerDivisor += 1;
  assert.ok(validateG5AU02ClassD(relation).errors.includes("G5AU02_REMAINDER_DIVISOR_RELATION_INVALID"));

  const range = clone(generateG5AU02ClassD(id, { seed: 8752 }));
  range.data.knownRemainder = range.data.smallerDivisor;
  assert.ok(validateG5AU02ClassD(range).errors.includes("G5AU02_REMAINDER_RANGE_INVALID"));

  const wrong = clone(generateG5AU02ClassD(id, { seed: 8753 }));
  wrong.answer.remainder = (wrong.answer.remainder + 1) % wrong.data.smallerDivisor;
  assert.ok(validateG5AU02ClassD(wrong).errors.includes("G5AU02_REMAINDER_NOT_REDUCED"));
});

test("S87 blocks invalid geometry side and area answers", () => {
  const side = clone(generateG5AU02ClassD("ps_g5a_u02_rectangle_square_side_lengths", { seed: 8761 }));
  side.answer.values = [side.data.length + 1];
  assert.ok(validateG5AU02ClassD(side).errors.includes("G5AU02_RECTANGLE_SIDE_NOT_COMMON_DIVISOR"));

  const area = clone(generateG5AU02ClassD("ps_g5a_u02_square_tile_area_possibilities", { seed: 8762 }));
  area.answer.values = [2];
  assert.ok(validateG5AU02ClassD(area).errors.includes("G5AU02_SQUARE_AREA_NOT_SIDE_SQUARED"));
});

test("S87 binds the source password to the unique tuple 1725", () => {
  const item = generateG5AU02ClassD("ps_g5a_u02_multi_constraint_digit_code", { seed: 8771 });
  assert.deepEqual(item.answer, { digits: [1, 7, 2, 5], value: 1725 });
  const mutated = clone(item);
  mutated.answer = { digits: [1, 7, 2, 6], value: 1726 };
  assert.ok(validateG5AU02ClassD(mutated).errors.includes("G5AU02_DIGIT_TUPLE_NOT_1725"));
});

test("S87 lifecycle cannot be promoted", () => {
  assert.deepEqual(G5A_U02_CLASS_D_LIFECYCLE, {
    unitId: "g5a_u02",
    generatorStatus: "class_d_semantic_implemented_hidden",
    validatorStatus: "class_d_blocking_runtime",
    selectorStatus: "hidden",
    canonicalRouting: "disabled",
    productionUse: "forbidden",
    genericFallback: "forbidden",
    freeFormAI: "forbidden",
  });
  const item = clone(generateG5AU02ClassD(IDS[0], { seed: 8781 }));
  item.lifecycle.productionUse = "allowed";
  assert.ok(validateG5AU02ClassD(item).errors.includes("G5AU02_PRODUCTION_USE_FORBIDDEN"));
});
