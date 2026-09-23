import test from "node:test";
import assert from "node:assert/strict";

import {
  auditG5AU02ClassCHiddenProjectionBinding,
  generateG5AU02ClassCFromHiddenProjection,
  getG5AU02BoundClassCSpecById,
  getG5AU02BoundClassCSpecs,
  validateG5AU02ClassCFromHiddenProjection,
} from "../../src/curriculum/g5a-u02/class-c-hidden-projection-binding.js";

const CLASS_D_ID = "ps_g5a_u02_maximum_equal_grouping";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test("S86 audits the 22 hidden specs as 14 bound Class C plus 8 unbound Class D", () => {
  assert.deepEqual(auditG5AU02ClassCHiddenProjectionBinding(), {
    ok: true,
    errors: [],
    totalProjectionCount: 22,
    boundClassCCount: 14,
    unboundClassDCount: 8,
  });
});

test("S86 exposes exactly 14 immutable hidden Class C bindings", () => {
  const bindings = getG5AU02BoundClassCSpecs();
  assert.equal(bindings.length, 14);
  assert.equal(Object.isFrozen(bindings), true);
  for (const binding of bindings) {
    assert.equal(binding.implementationClass, "C");
    assert.equal(binding.lifecycle.bindingStatus, "class_c_runtime_bound_hidden");
    assert.equal(binding.lifecycle.selectorStatus, "hidden");
    assert.equal(binding.lifecycle.canonicalRouting, "disabled");
    assert.equal(binding.lifecycle.productionUse, "forbidden");
    assert.equal(binding.lifecycle.genericFallback, "forbidden");
    assert.ok(binding.formalMappingId.startsWith("fm_g5a_u02_"));
    assert.ok(binding.patternGroupId.startsWith("pg_g5a_u02_"));
    assert.ok(binding.knowledgePointId.startsWith("kp_g5a_u02_"));
    assert.ok(binding.answerModelId.length > 0);
    assert.ok(binding.sourceEvidence.length > 0);
  }
});

test("S86 generates and validates every bound Class C item through hidden projection metadata", () => {
  for (const [index, binding] of getG5AU02BoundClassCSpecs().entries()) {
    const item = generateG5AU02ClassCFromHiddenProjection(binding.patternSpecId, { seed: index + 301 });
    assert.equal(item.patternSpecId, binding.patternSpecId);
    assert.deepEqual(item.projectionBinding, binding);
    assert.deepEqual(validateG5AU02ClassCFromHiddenProjection(item), { ok: true, errors: [] });
  }
});

test("S86 preserves deterministic generation through the hidden projection binding", () => {
  const patternSpecId = "ps_g5a_u02_common_factor_enumeration";
  const first = generateG5AU02ClassCFromHiddenProjection(patternSpecId, { seed: 8602 });
  const second = generateG5AU02ClassCFromHiddenProjection(patternSpecId, { seed: 8602 });
  assert.deepEqual(first, second);
});

test("S86 blocks Class D and unknown IDs without generic fallback", () => {
  assert.throws(
    () => generateG5AU02ClassCFromHiddenProjection(CLASS_D_ID, { seed: 1 }),
    /G5AU02_HIDDEN_PROJECTION_CLASS_C_ID_INVALID/,
  );
  assert.throws(
    () => generateG5AU02ClassCFromHiddenProjection("ps_unknown", { seed: 1 }),
    /G5AU02_HIDDEN_PROJECTION_CLASS_C_ID_INVALID/,
  );
  assert.equal(getG5AU02BoundClassCSpecById(CLASS_D_ID), null);
});

test("S86 blocks missing projection binding", () => {
  const item = clone(generateG5AU02ClassCFromHiddenProjection("ps_g5a_u02_greatest_common_factor", { seed: 8621 }));
  delete item.projectionBinding;
  const result = validateG5AU02ClassCFromHiddenProjection(item);
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("G5AU02_HIDDEN_PROJECTION_BINDING_MISSING"));
});

test("S86 blocks metadata drift inside a projection binding", () => {
  const item = clone(generateG5AU02ClassCFromHiddenProjection("ps_g5a_u02_factor_pair_enumeration", { seed: 8622 }));
  item.projectionBinding.answerModelId = "integerAnswer";
  const result = validateG5AU02ClassCFromHiddenProjection(item);
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("G5AU02_HIDDEN_PROJECTION_BINDING_MISMATCH"));
});

test("S86 blocks projection PatternSpec mismatch", () => {
  const item = clone(generateG5AU02ClassCFromHiddenProjection("ps_g5a_u02_factor_enumeration_trial_division", { seed: 8623 }));
  item.projectionBinding = clone(getG5AU02BoundClassCSpecById("ps_g5a_u02_factor_list_from_pairs"));
  const result = validateG5AU02ClassCFromHiddenProjection(item);
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("G5AU02_HIDDEN_PROJECTION_PATTERN_ID_MISMATCH"));
});

test("S86 continues to block wrong runtime answers after projection binding", () => {
  const item = clone(generateG5AU02ClassCFromHiddenProjection("ps_g5a_u02_greatest_common_factor", { seed: 8624 }));
  item.answer.greatestCommonFactor += 1;
  const result = validateG5AU02ClassCFromHiddenProjection(item);
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("G5AU02_P0_GCF_NOT_MAXIMUM"));
});

test("S86 does not promote hidden binding into selector, canonical routing, or production use", () => {
  for (const binding of getG5AU02BoundClassCSpecs()) {
    assert.equal(binding.lifecycle.selectorStatus, "hidden");
    assert.equal(binding.lifecycle.canonicalRouting, "disabled");
    assert.equal(binding.lifecycle.productionUse, "forbidden");
  }
});
