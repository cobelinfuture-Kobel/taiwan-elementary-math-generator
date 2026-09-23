import test from "node:test";
import assert from "node:assert/strict";

import {
  auditG5AU02ClassDHiddenProjectionBinding,
  generateG5AU02ClassDFromHiddenProjection,
  getG5AU02BoundClassDSpecById,
  getG5AU02BoundClassDSpecs,
  validateG5AU02ClassDFromHiddenProjection,
} from "../../src/curriculum/g5a-u02/class-d-hidden-projection-binding.js";
import { G5A_U02_S103_SOURCE_PROFILE_ID } from "../../src/curriculum/g5a-u02/s103-digit-code-runtime.js";

const CLASS_C_ID = "ps_g5a_u02_greatest_common_factor";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test("S88 audits 22 hidden specs as 8 bound Class D plus 14 untouched Class C", () => {
  assert.deepEqual(auditG5AU02ClassDHiddenProjectionBinding(), {
    ok: true,
    errors: [],
    totalProjectionCount: 22,
    unboundClassCCount: 14,
    boundClassDCount: 8,
  });
});

test("S88 exposes exactly 8 immutable Class D bindings with projection metadata parity", () => {
  const bindings = getG5AU02BoundClassDSpecs();
  assert.equal(bindings.length, 8);
  assert.equal(Object.isFrozen(bindings), true);
  for (const binding of bindings) {
    assert.equal(binding.implementationClass, "D");
    assert.equal(binding.templateFamilyIds.length, 1);
    assert.ok(binding.formalMappingId.startsWith("fm_g5a_u02_"));
    assert.ok(binding.sourceMappingCandidateId.startsWith("fmc_g5a_u02_"));
    assert.ok(binding.patternGroupId.startsWith("pg_g5a_u02_"));
    assert.ok(binding.knowledgePointId.startsWith("kp_g5a_u02_"));
    assert.ok(binding.answerModelId.length > 0);
    assert.ok(binding.sourceEvidence.length > 0);
    assert.equal(binding.lifecycle.bindingStatus, "class_d_runtime_bound_hidden");
    assert.equal(binding.lifecycle.selectorStatus, "hidden");
    assert.equal(binding.lifecycle.canonicalRouting, "disabled");
    assert.equal(binding.lifecycle.productionUse, "forbidden");
    assert.equal(binding.lifecycle.genericFallback, "forbidden");
    assert.equal(binding.lifecycle.freeFormAI, "forbidden");
  }
});

test("S88 generates and validates every Class D item through hidden projection metadata", () => {
  for (const [index, binding] of getG5AU02BoundClassDSpecs().entries()) {
    const item = generateG5AU02ClassDFromHiddenProjection(binding.patternSpecId, { seed: 8800 + index });
    assert.equal(item.patternSpecId, binding.patternSpecId);
    assert.equal(item.templateFamilyId, binding.templateFamilyIds[0]);
    assert.deepEqual(item.projectionBinding, binding);
    assert.deepEqual(validateG5AU02ClassDFromHiddenProjection(item), { ok: true, errors: [] });
  }
});

test("S88 preserves deterministic generation through Class D projection binding", () => {
  const patternSpecId = "ps_g5a_u02_remainder_transfer";
  const first = generateG5AU02ClassDFromHiddenProjection(patternSpecId, { seed: 8802 });
  const second = generateG5AU02ClassDFromHiddenProjection(patternSpecId, { seed: 8802 });
  assert.deepEqual(first, second);
});

test("S88 blocks Class C and unknown IDs without fallback", () => {
  assert.throws(
    () => generateG5AU02ClassDFromHiddenProjection(CLASS_C_ID, { seed: 1 }),
    /G5AU02_HIDDEN_PROJECTION_CLASS_D_ID_INVALID/,
  );
  assert.throws(
    () => generateG5AU02ClassDFromHiddenProjection("ps_unknown", { seed: 1 }),
    /G5AU02_HIDDEN_PROJECTION_CLASS_D_ID_INVALID/,
  );
  assert.equal(getG5AU02BoundClassDSpecById(CLASS_C_ID), null);
});

test("S88 blocks missing projection binding", () => {
  const item = clone(generateG5AU02ClassDFromHiddenProjection("ps_g5a_u02_maximum_equal_grouping", { seed: 8811 }));
  delete item.projectionBinding;
  const result = validateG5AU02ClassDFromHiddenProjection(item);
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("G5AU02_HIDDEN_PROJECTION_BINDING_MISSING"));
});

test("S88 blocks mutated projection metadata", () => {
  const item = clone(generateG5AU02ClassDFromHiddenProjection("ps_g5a_u02_possible_equal_packaging_counts", { seed: 8812 }));
  item.projectionBinding.answerModelId = "integerAnswer";
  const result = validateG5AU02ClassDFromHiddenProjection(item);
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("G5AU02_HIDDEN_PROJECTION_BINDING_MISMATCH"));
});

test("S88 blocks projection PatternSpec mismatch", () => {
  const item = clone(generateG5AU02ClassDFromHiddenProjection("ps_g5a_u02_rectangle_square_side_lengths", { seed: 8813 }));
  item.projectionBinding = clone(getG5AU02BoundClassDSpecById("ps_g5a_u02_square_tile_area_possibilities"));
  const result = validateG5AU02ClassDFromHiddenProjection(item);
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("G5AU02_HIDDEN_PROJECTION_PATTERN_ID_MISMATCH"));
});

test("S88 blocks template-family drift between projection and runtime", () => {
  const item = clone(generateG5AU02ClassDFromHiddenProjection("ps_g5a_u02_equal_partition_all_segment_counts", { seed: 8814 }));
  item.templateFamilyId = "tpl_g5a_u02_wrong";
  const result = validateG5AU02ClassDFromHiddenProjection(item);
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("G5AU02_HIDDEN_PROJECTION_TEMPLATE_FAMILY_MISMATCH"));
  assert.ok(result.errors.includes("G5AU02_CONTROLLED_TEMPLATE_REQUIRED"));
});

test("S88 retains Class D blocking validation after projection binding", () => {
  const item = clone(generateG5AU02ClassDFromHiddenProjection("ps_g5a_u02_multi_constraint_digit_code", {
    seed: 8815,
    digitCodeProfileId: G5A_U02_S103_SOURCE_PROFILE_ID,
  }));
  item.answer = { digits: [1, 7, 2, 6], value: 1726 };
  const result = validateG5AU02ClassDFromHiddenProjection(item);
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("G5AU02_DIGIT_TUPLE_NOT_1725"));
  assert.ok(result.errors.includes("G5AU02_P0_DIGIT_CODE_NOT_UNIQUE"));
});

test("S88 does not promote selector, canonical routing, production, fallback, or free-form AI", () => {
  for (const binding of getG5AU02BoundClassDSpecs()) {
    assert.deepEqual(binding.lifecycle, {
      unitId: "g5a_u02",
      bindingStatus: "class_d_runtime_bound_hidden",
      selectorStatus: "hidden",
      canonicalRouting: "disabled",
      productionUse: "forbidden",
      genericFallback: "forbidden",
      freeFormAI: "forbidden",
    });
  }
});
