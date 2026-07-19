import assert from "node:assert/strict";
import test from "node:test";

import { buildGS02Registries } from "../../tools/curriculum/build-gs02-g5a-u08-global-context-expansion.mjs";
import { validateGS02Registries } from "../../tools/curriculum/validate-gs02-g5a-u08-global-context-expansion.mjs";

const clone = (value) => structuredClone(value);
const codes = (result) => new Set(result.errors.map((row) => row.code));

test("GS02 materializes 18 distinct context families, 54 templates and 90 recomputable seeds", () => {
  const result = validateGS02Registries();
  assert.equal(result.ok, true, JSON.stringify(result.errors, null, 2));
  assert.deepEqual(result.summary.contextFamilyCount, 18);
  assert.ok(result.summary.domainCount >= 6);
  assert.deepEqual(result.summary.surfaceTemplateCount, 54);
  assert.deepEqual(result.summary.seedQACount, 90);
  assert.deepEqual(result.summary.bindingCount, 18);
  assert.ok(result.summary.minimumFamiliesPerWordPattern >= 5);
});

test("GS02 families are event-structure distinct and remain candidate-only", () => {
  const { familyRegistry, bindingRegistry } = buildGS02Registries();
  const families = familyRegistry.contextFamilies;
  assert.equal(new Set(families.map((row) => row.canonicalSemanticModel.eventStructureId)).size, 18);
  assert.equal(new Set(families.map((row) => row.canonicalSemanticModel.semanticFingerprint)).size, 18);
  assert.ok(families.every((row) => row.surfaceTemplates.length === 3));
  assert.ok(families.every((row) => row.seedQA.length === 5));
  assert.ok(families.every((row) => row.lifecycle.productionSelectable === false));
  assert.ok(families.every((row) => row.lifecycle.runtimeResolvable === false));
  assert.ok(bindingRegistry.bindings.every((row) => row.lifecycle.productionSelectable === false));
  assert.ok(bindingRegistry.bindings.every((row) => row.lifecycle.runtimeResolvable === false));
});

test("GS02 rejects duplicate semantic fingerprints", () => {
  const input = clone(buildGS02Registries());
  input.familyRegistry.contextFamilies[1].canonicalSemanticModel.semanticFingerprint =
    input.familyRegistry.contextFamilies[0].canonicalSemanticModel.semanticFingerprint;
  const result = validateGS02Registries(input);
  assert.equal(result.ok, false);
  assert.ok(codes(result).has("GS02_DUPLICATE_OR_MISSING_SEMANTIC_FINGERPRINT"));
});

test("GS02 rejects noun-only family inflation through missing template breadth", () => {
  const input = clone(buildGS02Registries());
  input.familyRegistry.contextFamilies[0].surfaceTemplates.splice(1);
  input.coverage.surfaceTemplateCount -= 2;
  const result = validateGS02Registries(input);
  assert.equal(result.ok, false);
  assert.ok(codes(result).has("GS02_FAMILY_TEMPLATE_COUNT_TOO_LOW"));
  assert.ok(codes(result).has("GS02_SURFACE_TEMPLATE_TOTAL_TOO_LOW"));
});

test("GS02 rejects corrupted mathematical witnesses", () => {
  const input = clone(buildGS02Registries());
  input.familyRegistry.contextFamilies[0].seedQA[0].answer += 1;
  const result = validateGS02Registries(input);
  assert.equal(result.ok, false);
  assert.ok(codes(result).has("GS02_SEED_ANSWER_WITNESS_MISMATCH"));
});

test("GS02 rejects word patterns with fewer than five compatible families", () => {
  const input = clone(buildGS02Registries());
  const target = "tf_g5a_u08_discount_and_change";
  let retained = 0;
  for (const family of input.familyRegistry.contextFamilies) {
    if (!family.compatibleTemplateFamilyIds.includes(target)) continue;
    retained += 1;
    if (retained <= 4) continue;
    family.compatibleTemplateFamilyIds = family.compatibleTemplateFamilyIds.filter((id) => id !== target);
  }
  const result = validateGS02Registries(input);
  assert.equal(result.ok, false);
  assert.ok(codes(result).has("GS02_WORD_PATTERN_FAMILY_COVERAGE_TOO_LOW"));
});

test("GS02 rejects premature production or runtime admission", () => {
  const input = clone(buildGS02Registries());
  input.familyRegistry.contextFamilies[0].lifecycle.productionSelectable = true;
  input.bindingRegistry.bindings[0].lifecycle.runtimeResolvable = true;
  const result = validateGS02Registries(input);
  assert.equal(result.ok, false);
  assert.ok(codes(result).has("GS02_PREMATURE_FAMILY_PRODUCTION_OR_RUNTIME"));
  assert.ok(codes(result).has("GS02_PREMATURE_BINDING_PRODUCTION_OR_RUNTIME"));
});

test("GS02 rejects context ownership of mathematics", () => {
  const input = clone(buildGS02Registries());
  input.bindingRegistry.bindings[0].eligibilityRules.contextMayChangeMath = true;
  const result = validateGS02Registries(input);
  assert.equal(result.ok, false);
  assert.ok(codes(result).has("GS02_CONTEXT_OWNS_MATH_ILLEGALLY"));
});
