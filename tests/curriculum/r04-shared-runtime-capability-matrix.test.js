import test from "node:test";
import assert from "node:assert/strict";
import { getR04KnowledgePointCapabilityMapping, materializeR04SharedRuntimeCapabilityMatrix } from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import { validateR04SharedRuntimeCapabilityMatrix } from "../../tools/curriculum/validate-r04-shared-runtime-capability-matrix.mjs";

test("R04 materializes one shared capability mapping for all 482 KnowledgePoints", () => {
  const matrix = materializeR04SharedRuntimeCapabilityMatrix();
  assert.equal(matrix.capabilities.length, 58);
  assert.equal(matrix.profiles.length, 18);
  assert.equal(matrix.knowledgePoints.length, 482);
  assert.equal(matrix.knowledgePointMappings.length, 482);
  assert.equal(new Set(matrix.knowledgePointMappings.map((row) => row.knowledgePointId)).size, 482);
  assert.deepEqual(matrix.mainlineBoundary, { currentProductionConsumer: "site/assets/browser/pipeline/build-worksheet-document.js", productionConsumerChanged: false, runtimeCapabilityMappingsMaterialized: true, deliveryWaveRebased: false, legacyCompatibilityMigrated: false, productionCutoverAllowed: false, parallelRuntimePipelineAllowed: false, nextTask: "R05_DeliveryWaveRebase" });
});

test("R04 preserves same-unit quantity arithmetic without importing conversion", () => {
  const mapping = getR04KnowledgePointCapabilityMapping("kp_mass_times_integer");
  assert.ok(mapping);
  assert.equal(mapping.primaryRuntimeProfileId, "profile_quantity_measurement");
  assert.ok(mapping.requiredRuntimeCapabilityIds.includes("cap_quantity_dimension_unit_identity"));
  assert.ok(mapping.requiredRuntimeCapabilityIds.includes("cap_same_unit_quantity_arithmetic"));
  assert.ok(mapping.requiredRuntimeCapabilityIds.includes("cap_integer_multiplication"));
  assert.ok(mapping.forbiddenRuntimeCapabilityIds.includes("cap_unit_conversion"));
  assert.ok(mapping.forbiddenRuntimeCapabilityIds.includes("cap_mixed_unit_normalization"));
});

test("R04 requires conversion and normalization for mixed-unit mass arithmetic", () => {
  const mapping = getR04KnowledgePointCapabilityMapping("kp_mass_mixed_unit_add_sub");
  assert.ok(mapping);
  assert.ok(mapping.requiredRuntimeCapabilityIds.includes("cap_unit_conversion"));
  assert.ok(mapping.requiredRuntimeCapabilityIds.includes("cap_mixed_unit_normalization"));
  assert.ok(mapping.requiredRuntimeCapabilityIds.includes("cap_integer_add_sub"));
  assert.equal(mapping.runtimeCapabilityDeliveryState, "BLOCKED_BY_CONTRACT_ONLY_CAPABILITIES");
});

test("R04 distinguishes admitted capabilities from deferred domains without admitting KPs", () => {
  const matrix = materializeR04SharedRuntimeCapabilityMatrix();
  const integer = matrix.knowledgePointMappings.find((row) => row.primaryRuntimeProfileId === "profile_number_representation" && row.runtimeCapabilityDeliveryState === "ALL_REQUIRED_CAPABILITIES_PRODUCTION_ADMITTED");
  const rounding = matrix.getMapping("kp_g4b_u04_round_half_up_place_value");
  const decimal = matrix.knowledgePointMappings.find((row) => row.primaryRuntimeProfileId === "profile_decimal");
  const fraction = matrix.knowledgePointMappings.find((row) => row.primaryRuntimeProfileId === "profile_fraction");
  assert.ok(integer);
  assert.equal(rounding?.runtimeCapabilityDeliveryState, "ALL_REQUIRED_CAPABILITIES_PRODUCTION_ADMITTED");
  assert.equal(decimal?.runtimeCapabilityDeliveryState, "BLOCKED_BY_CONTRACT_ONLY_CAPABILITIES");
  assert.equal(fraction?.runtimeCapabilityDeliveryState, "BLOCKED_BY_CONTRACT_ONLY_CAPABILITIES");
  assert.ok(matrix.knowledgePointMappings.every((row) => row.knowledgePointProductionAdmissionState === "DEFERRED_TO_R06_R07"));
});

test("R04 mappings are independent of legacy Batch A-E classification", () => {
  const matrix = materializeR04SharedRuntimeCapabilityMatrix();
  for (const mapping of matrix.knowledgePointMappings) {
    assert.equal(mapping.mappingBasis.legacyBatchUsedForClassification, false);
    assert.equal("deliveryWave" in mapping, false);
    assert.equal("primaryBatch" in mapping, false);
  }
});

test("R04 validator passes the authoritative matrix", () => {
  const matrix = materializeR04SharedRuntimeCapabilityMatrix();
  const report = validateR04SharedRuntimeCapabilityMatrix(matrix);
  assert.equal(report.ok, true, JSON.stringify(report.errors, null, 2));
  assert.equal(report.summary.mappingCount, 482);
});

test("R04 validator fails closed on unknown capabilities and premature delivery-wave fields", () => {
  const matrix = materializeR04SharedRuntimeCapabilityMatrix();
  const changed = matrix.knowledgePointMappings.map((row, index) => index === 0 ? { ...row, requiredRuntimeCapabilityIds: [...row.requiredRuntimeCapabilityIds, "cap_not_registered"], deliveryWave: "wave_should_not_exist" } : row);
  const tampered = { ...matrix, knowledgePointMappings: changed, getMapping(id) { return changed.find((row) => row.knowledgePointId === id) ?? null; } };
  const report = validateR04SharedRuntimeCapabilityMatrix(tampered);
  assert.equal(report.ok, false);
  assert.ok(report.errors.some((row) => row.code === "R04_MAPPING_UNKNOWN_CAPABILITY"));
  assert.ok(report.errors.some((row) => row.code === "R04_DELIVERY_WAVE_PREMATURE"));
});
