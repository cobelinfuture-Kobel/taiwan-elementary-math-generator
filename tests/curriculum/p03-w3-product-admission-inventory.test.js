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

test("P03 inventories the exact seven R05-W3 decimal and fraction contract capabilities", () => {
  const runtime = materializeP03W3ProductAdmissionInventory();
  assert.deepEqual([...runtime.requiredW3CapabilityIds].sort(), EXPECTED_CAPABILITY_IDS);
  assert.deepEqual([...runtime.plannedW3CapabilityIds].sort(), EXPECTED_CAPABILITY_IDS);
  assert.equal(runtime.capabilitySummaries.length, 7);
  for (const row of runtime.capabilitySummaries) {
    assert.equal(row.deliveryStatusBeforeP03, "contract_only", row.capabilityId);
    assert.equal(row.implementationState, "CONTRACT_ONLY_NOT_IMPLEMENTED", row.capabilityId);
    assert.equal(row.productionAdmissionState, "CAPABILITY_INVENTORIED_NOT_ADMITTED", row.capabilityId);
    assert.equal(row.directProductionAdmissionAllowed, false, row.capabilityId);
  }
});

test("P03 separates direct W3 membership from all W3 capability dependents", () => {
  const runtime = materializeP03W3ProductAdmissionInventory();
  const directRows = listP03W3DirectKnowledgePointRows();
  const dependentRows = listP03W3CapabilityDependentRows();
  assert.ok(directRows.length > 0);
  assert.ok(dependentRows.length >= directRows.length);
  const dependentIds = new Set(dependentRows.map((row) => row.knowledgePointId));
  for (const row of directRows) {
    assert.equal(row.assignedDeliveryWaveId, "R05-W3", row.knowledgePointId);
    assert.equal(row.directW3CohortMember, true, row.knowledgePointId);
    assert.equal(dependentIds.has(row.knowledgePointId), true, row.knowledgePointId);
    assert.deepEqual(getP03W3ProductAdmissionInventoryRow(row.knowledgePointId), row);
  }
  assert.equal(runtime.metrics.directW3KnowledgePointCount, directRows.length);
  assert.equal(runtime.metrics.w3CapabilityDependentKnowledgePointCount, dependentRows.length);
  assert.equal(runtime.metrics.laterWaveDependentKnowledgePointCount, dependentRows.length - directRows.length);
  process.stdout.write(`P03_DIRECT_KPS ${JSON.stringify(directRows.map((row) => ({
    knowledgePointId: row.knowledgePointId,
    canonicalNameZh: row.canonicalNameZh,
    sourceNodeIds: row.sourceNodeIds,
    baseDeliveryWaveId: row.baseDeliveryWaveId,
    assignedDeliveryWaveId: row.assignedDeliveryWaveId,
    w3CapabilityIds: row.w3CapabilityIds,
    directlyRequiredW3CapabilityIds: row.directlyRequiredW3CapabilityIds,
    productGapState: row.productGapState,
    patternSpecIds: row.currentProductCoverage.patternSpecIds,
  })))}\n`);
});

test("P03 preserves P02G W2 unblock state while failing closed on missing W3 capabilities", () => {
  const runtime = materializeP03W3ProductAdmissionInventory();
  for (const row of runtime.rows) {
    assert.ok(row.w3CapabilityIds.length > 0, row.knowledgePointId);
    assert.deepEqual([...row.missingW3CapabilityIds].sort(), [...row.w3CapabilityIds].sort(), row.knowledgePointId);
    assert.equal(row.capabilityGateState, "W3_CONTRACT_CAPABILITY_BLOCKED", row.knowledgePointId);
    assert.equal(row.productProductionAdmitted, false, row.knowledgePointId);
    assert.equal(row.directProductionAdmissionAllowed, false, row.knowledgePointId);
    assert.equal(row.productionAdmissionState, "W3_DEPENDENCY_INVENTORIED_NOT_ADMITTED", row.knowledgePointId);
    if (row.inheritedW2DependencyPresent) {
      assert.equal(row.inheritedW2DependencyUnblocked, true, row.knowledgePointId);
      assert.equal(row.inheritedW2GateState, "W2_FOUNDATION_DEPENDENCY_UNBLOCKED", row.knowledgePointId);
    }
  }
  assert.equal(runtime.metrics.inheritedW2DependencyUnblockedCount, runtime.metrics.inheritedW2DependencyCount);
  assert.equal(runtime.metrics.capabilityBlockedKnowledgePointCount, runtime.rows.length);
  assert.equal(runtime.metrics.capabilityUnblockedKnowledgePointCount, 0);
  assert.equal(runtime.metrics.directProductAdmissionCount, 0);
});

test("P03 partitions every W3 dependent row into one explicit downstream product gap", () => {
  const runtime = materializeP03W3ProductAdmissionInventory();
  const existing = runtime.rows.filter((row) => row.productGapState === "EXISTING_PUBLIC_PATTERN_AFTER_W3_CAPABILITY");
  const binding = runtime.rows.filter((row) => row.productGapState === "PATTERN_GROUP_OR_SPEC_BINDING_REQUIRED_AFTER_W3_CAPABILITY");
  const vertical = runtime.rows.filter((row) => row.productGapState === "PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED_AFTER_W3_CAPABILITY");
  assert.equal(existing.length + binding.length + vertical.length, runtime.rows.length);
  for (const row of existing) {
    assert.equal(row.currentProductCoverage.publicKnowledgePointVisible, true, row.knowledgePointId);
    assert.equal(row.currentProductCoverage.publicPatternBindingPresent, true, row.knowledgePointId);
  }
  for (const row of runtime.rows) {
    assert.ok(row.nextAdmissionActions.some((action) => action.startsWith("IMPLEMENT_VALIDATE_AND_ADMIT_W3_CAPABILITY:")), row.knowledgePointId);
    assert.equal(row.nextAdmissionActions.some((action) => action.startsWith("HARDEN_AND_ADMIT_SHARED_CAPABILITY")), false, row.knowledgePointId);
  }
  process.stdout.write(`P03_EXISTING_PATTERN_ROWS ${JSON.stringify(existing.map((row) => ({
    knowledgePointId: row.knowledgePointId,
    sourceNodeIds: row.sourceNodeIds,
    assignedDeliveryWaveId: row.assignedDeliveryWaveId,
    patternGroupIds: row.currentProductCoverage.patternGroupIds,
    patternSpecIds: row.currentProductCoverage.patternSpecIds,
  })))}\n`);
});

test("P03 emits capability, source and wave matrices without product admission", () => {
  const runtime = materializeP03W3ProductAdmissionInventory();
  assert.equal(runtime.sourceSummaries.length, runtime.metrics.dependentSourceNodeCount);
  assert.equal(runtime.waveSummaries.length, runtime.metrics.dependentWaveCount);
  assert.equal(runtime.waveSummaries.reduce((sum, row) => sum + row.dependentKnowledgePointCount, 0), runtime.rows.length);
  assert.equal(runtime.capabilitySummaries.some((row) => row.effectiveDependentKnowledgePointCount > 0), true);
  process.stdout.write(`P03_CAPABILITY_MATRIX ${JSON.stringify(runtime.capabilitySummaries)}\n`);
  process.stdout.write(`P03_WAVE_MATRIX ${JSON.stringify(runtime.waveSummaries)}\n`);
});

test("P03 validator accepts the inventory and reports machine-readable counts", () => {
  const result = validateP03W3ProductAdmissionInventory();
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.equal(result.counts.contractCapabilities, 7);
  assert.ok(result.counts.directW3KnowledgePoints > 0);
  assert.ok(result.counts.w3CapabilityDependentKnowledgePoints >= result.counts.directW3KnowledgePoints);
  assert.equal(result.counts.inheritedW2DependenciesUnblocked, result.counts.inheritedW2Dependencies);
  assert.equal(result.counts.capabilityBlockedKnowledgePoints, result.counts.w3CapabilityDependentKnowledgePoints);
  assert.equal(result.counts.capabilityUnblockedKnowledgePoints, 0);
  assert.equal(result.counts.directProductAdmissions, 0);
  process.stdout.write(`P03_READBACK ${JSON.stringify(result.counts)}\n`);
});
