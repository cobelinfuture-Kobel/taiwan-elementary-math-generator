import test from "node:test";
import assert from "node:assert/strict";

import { materializeP02W2ProductAdmissionInventory } from "../../src/curriculum/full-product/p02-w2-product-admission-inventory.mjs";
import { validateP02W2ProductAdmissionInventory } from "../../tools/curriculum/validate-p02-w2-product-admission-inventory.mjs";

const EXPECTED_SHADOW_CAPABILITIES = Object.freeze([
  "cap_kp_authority_lookup",
  "cap_prerequisite_readiness",
  "cap_quantity_dimension_unit_identity",
  "cap_quantity_semantic_role_binding",
  "cap_same_unit_quantity_arithmetic",
]);

const EXPECTED_ALL_KP_DEPENDENT_COUNTS = Object.freeze({
  cap_kp_authority_lookup: 0,
  cap_prerequisite_readiness: 0,
  cap_quantity_dimension_unit_identity: 51,
  cap_quantity_semantic_role_binding: 26,
  cap_same_unit_quantity_arithmetic: 2,
});

test("P02 proves R05-W2 has zero direct KnowledgePoints and is capability-only", () => {
  const inventory = materializeP02W2ProductAdmissionInventory();
  assert.equal(inventory.directW2KnowledgePointRows.length, 0);
  assert.equal(inventory.metrics.directW2KnowledgePointCount, 0);
  assert.equal(inventory.policy.inventoryDecision.selectedRoute, "CAPABILITY_ONLY_W2_NO_DIRECT_PRODUCT_COHORT");
});

test("P02 inventories the exact five-capability W2 shadow foundation plan", () => {
  const inventory = materializeP02W2ProductAdmissionInventory();
  assert.deepEqual(
    inventory.capabilitySummaries.map((row) => row.capabilityId).sort(),
    [...EXPECTED_SHADOW_CAPABILITIES].sort(),
  );
  assert.equal(inventory.metrics.shadowFoundationCapabilityCount, 5);
  assert.equal(inventory.capabilitySummaries.every((row) => row.deliveryStatusBeforeP02 === "shadow_available"), true);
  assert.equal(inventory.capabilitySummaries.every((row) => row.nextAction === "HARDEN_AND_ADMIT_SHARED_CAPABILITY"), true);
  assert.equal(inventory.capabilitySummaries.every((row) => row.productionAdmissionState === "CAPABILITY_INVENTORIED_NOT_ADMITTED"), true);
  for (const capability of inventory.capabilitySummaries) {
    assert.equal(
      capability.requiredByAllKnowledgePointCount,
      EXPECTED_ALL_KP_DEPENDENT_COUNTS[capability.capabilityId],
      capability.capabilityId,
    );
  }
});

test("P02 preserves the W2 foundation dependency order", () => {
  const inventory = materializeP02W2ProductAdmissionInventory();
  const byId = new Map(inventory.capabilitySummaries.map((row) => [row.capabilityId, row]));
  assert.equal(byId.get("cap_kp_authority_lookup").foundationSequenceRank, 0);
  assert.equal(byId.get("cap_quantity_dimension_unit_identity").foundationSequenceRank, 0);
  assert.equal(byId.get("cap_prerequisite_readiness").foundationSequenceRank, 1);
  assert.equal(byId.get("cap_quantity_semantic_role_binding").foundationSequenceRank, 1);
  assert.equal(byId.get("cap_same_unit_quantity_arithmetic").foundationSequenceRank, 1);
  assert.deepEqual(
    byId.get("cap_prerequisite_readiness").dependencyCapabilityIds,
    ["cap_kp_authority_lookup"],
  );
  assert.deepEqual(
    byId.get("cap_same_unit_quantity_arithmetic").dependencyCapabilityIds,
    ["cap_quantity_dimension_unit_identity"],
  );
});

test("P02 materializes downstream dependents across later delivery waves", () => {
  const inventory = materializeP02W2ProductAdmissionInventory();
  assert.equal(inventory.dependentKnowledgePointRows.length, 51);
  assert.equal(inventory.metrics.dependentKnowledgePointCount, 51);
  assert.equal(new Set(inventory.dependentKnowledgePointRows.map((row) => row.knowledgePointId)).size, 51);
  assert.equal(inventory.dependentKnowledgePointRows.every((row) => row.w2FoundationCapabilityIds.length > 0), true);
  assert.equal(inventory.dependentKnowledgePointRows.every((row) => row.assignedDeliveryWaveId !== "R05-W2"), true);
  assert.equal(inventory.waveSummaries.length > 0, true);
  assert.equal(inventory.sourceSummaries.length > 0, true);
});

test("P02 separates W2 capability blockers from downstream product blockers", () => {
  const inventory = materializeP02W2ProductAdmissionInventory();
  const productGapTotal = inventory.metrics.admissionReadyExistingPublicPatternAfterCapabilityCount
    + inventory.metrics.patternGroupOrSpecBindingRequiredAfterCapabilityCount
    + inventory.metrics.publicProductVerticalSliceRequiredAfterCapabilityCount;
  assert.equal(productGapTotal, inventory.dependentKnowledgePointRows.length);
  assert.equal(inventory.dependentKnowledgePointRows.every((row) => row.nextAdmissionActions.length > 0), true);
  assert.equal(inventory.dependentKnowledgePointRows.every((row) => (
    row.nextAdmissionActions[0].startsWith("HARDEN_AND_ADMIT_SHARED_CAPABILITY:")
  )), true);
  console.log(`P02_W2_GAP_MATRIX_READBACK=${JSON.stringify({
    metrics: inventory.metrics,
    capabilitySummaries: inventory.capabilitySummaries,
    waveSummaries: inventory.waveSummaries,
    sourceSummaries: inventory.sourceSummaries,
  })}`);
});

test("P02 performs no hardening, admission, PatternSpec, or public UI mutation", () => {
  const inventory = materializeP02W2ProductAdmissionInventory();
  assert.equal(inventory.metrics.directProductionAdmissionCount, 0);
  assert.equal(inventory.dependentKnowledgePointRows.every((row) => row.directProductionAdmissionAllowed === false), true);
  assert.equal(inventory.capabilitySummaries.every((row) => row.directProductionAdmissionAllowed === false), true);
  assert.equal(inventory.policy.rules.inventoryOnly, true);
  assert.equal(inventory.policy.rules.sharedCapabilityHardeningAllowed, false);
  assert.equal(inventory.policy.rules.patternSpecImplementationAllowed, false);
  assert.equal(inventory.policy.rules.publicUiChangeAllowed, false);
  assert.equal(inventory.policy.rules.w3ToW8ImplementationAllowed, false);
  assert.equal(inventory.manifest.mainlineBoundary.existing19SourceProductPreserved, true);
});

test("P02 validator passes the capability-first dependency matrix", () => {
  const report = validateP02W2ProductAdmissionInventory();
  assert.equal(report.ok, true, JSON.stringify(report.errors, null, 2));
  assert.equal(report.summary.directW2KnowledgePointCount, 0);
  assert.equal(report.summary.dependentKnowledgePointCount, 51);
  assert.equal(report.summary.shadowFoundationCapabilityCount, 5);
  assert.equal(report.summary.directProductionAdmissionCount, 0);
});

test("P02 validator fails closed if a direct W2 product cohort is invented", () => {
  const inventory = materializeP02W2ProductAdmissionInventory();
  const tampered = {
    ...inventory,
    directW2KnowledgePointRows: [{ knowledgePointId: "kp_invented_w2_product" }],
    metrics: { ...inventory.metrics, directW2KnowledgePointCount: 1 },
  };
  const report = validateP02W2ProductAdmissionInventory(tampered);
  assert.equal(report.ok, false);
  assert.ok(report.errors.some((row) => row.code === "P02_DIRECT_W2_PRODUCT_COHORT_MUST_BE_EMPTY"));
});

test("P02 validator fails closed on capability identity drift", () => {
  const inventory = materializeP02W2ProductAdmissionInventory();
  const capabilitySummaries = inventory.capabilitySummaries.slice(1);
  const tampered = {
    ...inventory,
    capabilitySummaries,
    metrics: {
      ...inventory.metrics,
      shadowFoundationCapabilityCount: capabilitySummaries.length,
    },
  };
  const report = validateP02W2ProductAdmissionInventory(tampered);
  assert.equal(report.ok, false);
  assert.ok(report.errors.some((row) => row.code === "P02_W2_CAPABILITY_IDENTITY_DRIFT"));
});

test("P02 validator fails closed on direct production admission", () => {
  const inventory = materializeP02W2ProductAdmissionInventory();
  const dependentKnowledgePointRows = inventory.dependentKnowledgePointRows.map((row, index) => index === 0 ? {
    ...row,
    directProductionAdmissionAllowed: true,
    productionAdmissionState: "PRODUCTION_ADMITTED",
  } : row);
  const tampered = {
    ...inventory,
    dependentKnowledgePointRows,
    rows: dependentKnowledgePointRows,
    metrics: { ...inventory.metrics, directProductionAdmissionCount: 1 },
  };
  const report = validateP02W2ProductAdmissionInventory(tampered);
  assert.equal(report.ok, false);
  assert.ok(report.errors.some((row) => row.code === "P02_DEPENDENCY_INVENTORY_BOUNDARY_VIOLATION"));
});

test("P02 keeps capability hardening and later waves behind separate tasks", () => {
  const inventory = materializeP02W2ProductAdmissionInventory();
  assert.equal(inventory.policy.inventoryDecision.selectedNextTask, "P02A_W2ShadowFoundationHardeningOrderAndEvidenceReconciliation");
  assert.equal(inventory.policy.rules.w3ToW8ImplementationAllowed, false);
  assert.equal(inventory.policy.rules.recursiveImprovementAdminAllowed, false);
  assert.equal(inventory.policy.fullProductBoundary.fullProductLineCloseTask, "P10_FullUIHTMLPDFPrintProductCloseout");
});
