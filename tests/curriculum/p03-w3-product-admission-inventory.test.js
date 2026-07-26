import test from "node:test";
import assert from "node:assert/strict";

import {
  getP03W3ProductAdmissionInventoryRow,
  listP03W3CapabilityDependentRows,
  listP03W3DirectKnowledgePointRows,
  materializeP03W3ProductAdmissionInventory,
} from "../../src/curriculum/full-product/p03-w3-product-admission-inventory.mjs";
import { validateP03W3ProductAdmissionInventory } from "../../tools/curriculum/validate-p03-w3-product-admission-inventory.mjs";

const EXPECTED_CAPABILITY_IDS = [
  "cap_decimal_arithmetic",
  "cap_decimal_domain_validator",
  "cap_decimal_number_system",
  "cap_fraction_arithmetic",
  "cap_fraction_domain_validator",
  "cap_fraction_number_system",
  "cap_mixed_number_domain_normalization",
];

const EXPECTED_PROTECTED_IDS = [
  "kp_g3a_u01_digit_arrangement_max_min",
  "kp_g4a_u01_boundary_number_difference",
  "kp_g4a_u01_missing_digit_comparison_extreme_digit",
  "kp_g4b_u01_trailing_zero_division_remainder_restore",
];

test("P03 inventories the exact seven R05-W3 decimal and fraction contract capabilities", () => {
  const runtime = materializeP03W3ProductAdmissionInventory();
  assert.deepEqual([...runtime.requiredW3CapabilityIds].sort(), EXPECTED_CAPABILITY_IDS);
  assert.deepEqual([...runtime.plannedW3CapabilityIds].sort(), EXPECTED_CAPABILITY_IDS);
  assert.equal(runtime.capabilitySummaries.length, 7);
  assert.equal(runtime.metrics.capabilityWithDependentsCount, 7);
  assert.equal(runtime.metrics.capabilityWithoutDependentsCount, 0);
  for (const row of runtime.capabilitySummaries) {
    assert.equal(row.deliveryStatusBeforeP03, "contract_only", row.capabilityId);
    assert.equal(row.implementationState, "CONTRACT_ONLY_NOT_IMPLEMENTED", row.capabilityId);
    assert.equal(row.productionAdmissionState, "CAPABILITY_INVENTORIED_NOT_ADMITTED", row.capabilityId);
    assert.equal(row.directProductionAdmissionAllowed, false, row.capabilityId);
    assert.ok(row.effectiveDependentKnowledgePointCount > 0, row.capabilityId);
  }
});

test("P03 separates 82 direct W3 rows, 12 base-W3 escalations and 33 later-wave dependents", () => {
  const runtime = materializeP03W3ProductAdmissionInventory();
  const directRows = listP03W3DirectKnowledgePointRows();
  const dependentRows = listP03W3CapabilityDependentRows();
  assert.equal(directRows.length, 82);
  assert.equal(runtime.metrics.directW3SourceNodeCount, 17);
  assert.equal(runtime.metrics.baseW3KnowledgePointCount, 94);
  assert.equal(runtime.baseW3EscalatedBeyondW3Rows.length, 12);
  assert.equal(runtime.laterWaveDependentRows.length, 33);
  assert.equal(dependentRows.length, 119);
  const dependentIds = new Set(dependentRows.map((row) => row.knowledgePointId));
  for (const row of directRows) {
    assert.equal(row.assignedDeliveryWaveId, "R05-W3", row.knowledgePointId);
    assert.equal(row.directW3CohortMember, true, row.knowledgePointId);
    assert.equal(row.protectedExistingD0, false, row.knowledgePointId);
    assert.equal(dependentIds.has(row.knowledgePointId), true, row.knowledgePointId);
    assert.deepEqual(getP03W3ProductAdmissionInventoryRow(row.knowledgePointId), row);
  }
  process.stdout.write(`P03_DIRECT_KPS ${JSON.stringify(directRows.map((row) => ({
    knowledgePointId: row.knowledgePointId,
    canonicalNameZh: row.canonicalNameZh,
    sourceNodeIds: row.sourceNodeIds,
    w3CapabilityIds: row.w3CapabilityIds,
    productGapState: row.productGapState,
  })))}\n`);
});

test("P03 preserves four protected D0 rows instead of falsely de-admitting them", () => {
  const runtime = materializeP03W3ProductAdmissionInventory();
  assert.deepEqual(runtime.protectedExistingD0Rows.map((row) => row.knowledgePointId).sort(), EXPECTED_PROTECTED_IDS);
  assert.equal(runtime.metrics.protectedExistingD0CompatibilityCount, 4);
  assert.equal(runtime.metrics.currentProtectedProductAdmissionCount, 4);
  assert.equal(runtime.metrics.newlyProductAdmittedByP03Count, 0);
  for (const row of runtime.protectedExistingD0Rows) {
    assert.equal(row.assignedDeliveryWaveId, "R05-W0", row.knowledgePointId);
    assert.equal(row.r05ProductionAdmissionState, "PROTECTED_EXISTING_D0", row.knowledgePointId);
    assert.equal(row.capabilityGateState, "PROTECTED_EXISTING_D0_W3_COMPATIBILITY_REVALIDATION_REQUIRED", row.knowledgePointId);
    assert.equal(row.productGapState, "PROTECTED_EXISTING_D0_COMPATIBILITY_REVALIDATION_REQUIRED", row.knowledgePointId);
    assert.equal(row.productProductionAdmitted, true, row.knowledgePointId);
    assert.equal(row.newlyProductAdmittedByP03, false, row.knowledgePointId);
    assert.equal(row.productionAdmissionState, "PROTECTED_EXISTING_D0_PRESERVED_PENDING_W3_COMPATIBILITY_REVALIDATION", row.knowledgePointId);
    assert.equal(row.currentProductCoverage.publicPatternBindingPresent, true, row.knowledgePointId);
  }
  process.stdout.write(`P03_PROTECTED_KPS ${JSON.stringify(runtime.protectedExistingD0Rows.map((row) => ({
    knowledgePointId: row.knowledgePointId,
    sourceNodeIds: row.sourceNodeIds,
    patternSpecIds: row.currentProductCoverage.patternSpecIds,
    w3CapabilityIds: row.w3CapabilityIds,
  })))}\n`);
});

test("P03 keeps 115 new products fail closed and preserves all inherited W2 unblocks", () => {
  const runtime = materializeP03W3ProductAdmissionInventory();
  const newRows = runtime.rows.filter((row) => !row.protectedExistingD0);
  assert.equal(newRows.length, 115);
  assert.equal(runtime.metrics.capabilityBlockedNewProductCount, 115);
  assert.equal(runtime.metrics.capabilityUnblockedNewProductCount, 0);
  assert.equal(runtime.metrics.inheritedW2DependencyCount, 5);
  assert.equal(runtime.metrics.inheritedW2DependencyUnblockedCount, 5);
  for (const row of runtime.rows) {
    assert.ok(row.w3CapabilityIds.length > 0, row.knowledgePointId);
    assert.deepEqual([...row.missingW3CapabilityIds].sort(), [...row.w3CapabilityIds].sort(), row.knowledgePointId);
    assert.equal(row.directProductionAdmissionAllowed, false, row.knowledgePointId);
    assert.equal(row.newlyProductAdmittedByP03, false, row.knowledgePointId);
    assert.ok(row.nextAdmissionActions.some((action) => action.startsWith("IMPLEMENT_VALIDATE_AND_ADMIT_W3_CAPABILITY:")), row.knowledgePointId);
    if (row.inheritedW2DependencyPresent) {
      assert.equal(row.inheritedW2DependencyUnblocked, true, row.knowledgePointId);
      assert.equal(row.inheritedW2GateState, "W2_FOUNDATION_DEPENDENCY_UNBLOCKED", row.knowledgePointId);
    }
  }
  for (const row of newRows) {
    assert.equal(row.capabilityGateState, "W3_CONTRACT_CAPABILITY_BLOCKED", row.knowledgePointId);
    assert.equal(row.productProductionAdmitted, false, row.knowledgePointId);
    assert.equal(row.productionAdmissionState, "W3_DEPENDENCY_INVENTORIED_NOT_ADMITTED", row.knowledgePointId);
  }
});

test("P03 partitions protected compatibility and 115 vertical slices across six waves", () => {
  const runtime = materializeP03W3ProductAdmissionInventory();
  assert.equal(runtime.metrics.protectedD0CompatibilityRevalidationCount, 4);
  assert.equal(runtime.metrics.existingPublicPatternAfterCapabilityCount, 0);
  assert.equal(runtime.metrics.patternBindingRequiredAfterCapabilityCount, 0);
  assert.equal(runtime.metrics.publicProductVerticalSliceRequiredAfterCapabilityCount, 115);
  assert.deepEqual(runtime.metrics.dependentCountsByWave, {
    "R05-W0": 4,
    "R05-W3": 82,
    "R05-W4": 11,
    "R05-W6": 1,
    "R05-W7": 18,
    "R05-W8": 3,
  });
  assert.equal(runtime.sourceSummaries.length, 28);
  assert.equal(runtime.waveSummaries.length, 6);
  assert.equal(runtime.waveSummaries.reduce((sum, row) => sum + row.dependentKnowledgePointCount, 0), 119);
  process.stdout.write(`P03_CAPABILITY_MATRIX ${JSON.stringify(runtime.capabilitySummaries)}\n`);
  process.stdout.write(`P03_WAVE_MATRIX ${JSON.stringify(runtime.waveSummaries)}\n`);
});

test("P03 validator accepts the exact inventory and reports machine-readable counts", () => {
  const result = validateP03W3ProductAdmissionInventory();
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.deepEqual(result.counts, {
    contractCapabilities: 7,
    capabilitiesWithDependents: 7,
    capabilitiesWithoutDependents: 0,
    directW3KnowledgePoints: 82,
    directW3Sources: 17,
    baseW3KnowledgePoints: 94,
    baseW3EscalatedBeyondW3: 12,
    w3CapabilityDependentKnowledgePoints: 119,
    protectedExistingD0Compatibility: 4,
    newProductDependentKnowledgePoints: 115,
    laterWaveDependentKnowledgePoints: 33,
    dependentSources: 28,
    dependentWaves: 6,
    inheritedW2Dependencies: 5,
    inheritedW2DependenciesUnblocked: 5,
    publicKnowledgePointsVisible: 4,
    publicPatternBindingsPresent: 4,
    publicSourcesSelectable: 4,
    protectedD0CompatibilityRevalidation: 4,
    existingPublicPatternAfterCapability: 0,
    patternBindingRequiredAfterCapability: 0,
    publicProductVerticalSliceRequiredAfterCapability: 115,
    capabilityBlockedNewProducts: 115,
    capabilityUnblockedNewProducts: 0,
    currentProtectedProductAdmissions: 4,
    newlyProductAdmittedByP03: 0,
  });
  process.stdout.write(`P03_READBACK ${JSON.stringify(result.counts)}\n`);
});
