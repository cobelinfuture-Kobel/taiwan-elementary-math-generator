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

test("P02 materializes a non-empty exact R05-W2 KnowledgePoint inventory", () => {
  const inventory = materializeP02W2ProductAdmissionInventory();
  assert.ok(inventory.rows.length > 0);
  assert.equal(inventory.rows.length, inventory.metrics.knowledgePointCount);
  assert.equal(new Set(inventory.rows.map((row) => row.knowledgePointId)).size, inventory.rows.length);
  assert.equal(inventory.rows.every((row) => row.deliveryWaveId === "R05-W2"), true);
  assert.equal(inventory.sourceSummaries.length, inventory.metrics.sourceNodeCount);
});

test("P02 proves W2 is blocked by shadow foundations and not contract-only capabilities", () => {
  const inventory = materializeP02W2ProductAdmissionInventory();
  assert.equal(inventory.metrics.shadowCapabilityGapKnowledgePointCount, inventory.rows.length);
  assert.equal(inventory.metrics.capabilityReadyForProductAdmissionCount, 0);
  assert.equal(inventory.metrics.contractOnlyCapabilityDriftCount, 0);
  assert.equal(inventory.rows.every((row) => row.shadowRequiredCapabilityIds.length > 0), true);
  assert.equal(inventory.rows.every((row) => row.contractOnlyRequiredCapabilityIds.length === 0), true);
  assert.equal(inventory.rows.every((row) => row.capabilityGapState === "SHADOW_CAPABILITY_HARDENING_REQUIRED"), true);
});

test("P02 inventories the complete five-capability W2 shadow foundation plan", () => {
  const inventory = materializeP02W2ProductAdmissionInventory();
  assert.deepEqual(
    inventory.capabilitySummaries.map((row) => row.capabilityId).sort(),
    [...EXPECTED_SHADOW_CAPABILITIES].sort(),
  );
  assert.equal(inventory.metrics.shadowFoundationCapabilityCount, EXPECTED_SHADOW_CAPABILITIES.length);
  assert.equal(inventory.capabilitySummaries.every((row) => row.deliveryStatusBeforeP02 === "shadow_available"), true);
  assert.equal(inventory.capabilitySummaries.every((row) => row.nextAction === "HARDEN_AND_ADMIT_SHARED_CAPABILITY"), true);
  assert.equal(inventory.capabilitySummaries.every((row) => row.productionAdmissionState === "INVENTORIED_NOT_ADMITTED"), true);
  const authority = inventory.capabilitySummaries.find((row) => row.capabilityId === "cap_kp_authority_lookup");
  const prerequisite = inventory.capabilitySummaries.find((row) => row.capabilityId === "cap_prerequisite_readiness");
  const quantityIdentity = inventory.capabilitySummaries.find((row) => row.capabilityId === "cap_quantity_dimension_unit_identity");
  const sameUnit = inventory.capabilitySummaries.find((row) => row.capabilityId === "cap_same_unit_quantity_arithmetic");
  const semanticRole = inventory.capabilitySummaries.find((row) => row.capabilityId === "cap_quantity_semantic_role_binding");
  assert.equal(authority.foundationSequenceRank, 0);
  assert.equal(quantityIdentity.foundationSequenceRank, 0);
  assert.equal(prerequisite.foundationSequenceRank, 1);
  assert.equal(sameUnit.foundationSequenceRank, 1);
  assert.equal(semanticRole.foundationSequenceRank, 1);
});

test("P02 separates capability blockers from downstream product vertical-slice blockers", () => {
  const inventory = materializeP02W2ProductAdmissionInventory();
  const productGapTotal = inventory.metrics.admissionReadyExistingPublicPatternAfterCapabilityCount
    + inventory.metrics.patternGroupOrSpecBindingRequiredAfterCapabilityCount
    + inventory.metrics.publicProductVerticalSliceRequiredAfterCapabilityCount;
  assert.equal(productGapTotal, inventory.rows.length);
  assert.equal(inventory.rows.every((row) => row.nextAdmissionActions.length > 0), true);
  assert.equal(inventory.rows.every((row) => row.nextAdmissionActions[0].startsWith("HARDEN_AND_ADMIT_SHARED_CAPABILITY:")), true);
  console.log(`P02_W2_INVENTORY_DIAGNOSTIC=${JSON.stringify({
    metrics: inventory.metrics,
    sourceSummaries: inventory.sourceSummaries,
    capabilitySummaries: inventory.capabilitySummaries,
  })}`);
});

test("P02 performs no capability hardening, product admission, or public UI mutation", () => {
  const inventory = materializeP02W2ProductAdmissionInventory();
  assert.equal(inventory.metrics.directProductionAdmissionCount, 0);
  assert.equal(inventory.rows.every((row) => row.directProductionAdmissionAllowed === false), true);
  assert.equal(inventory.rows.every((row) => row.productionAdmissionState === "INVENTORIED_NOT_ADMITTED"), true);
  assert.equal(inventory.policy.rules.inventoryOnly, true);
  assert.equal(inventory.policy.rules.sharedCapabilityHardeningAllowed, false);
  assert.equal(inventory.policy.rules.patternSpecImplementationAllowed, false);
  assert.equal(inventory.policy.rules.publicUiChangeAllowed, false);
  assert.equal(inventory.policy.rules.w3ToW8ImplementationAllowed, false);
  assert.equal(inventory.manifest.mainlineBoundary.existing19SourceProductPreserved, true);
});

test("P02 validator passes the executable inventory and gap matrix", () => {
  const report = validateP02W2ProductAdmissionInventory();
  assert.equal(report.ok, true, JSON.stringify(report.errors, null, 2));
  assert.ok(report.summary.knowledgePointCount > 0);
  assert.equal(report.summary.shadowFoundationCapabilityCount, 5);
  assert.equal(report.summary.contractOnlyCapabilityDriftCount, 0);
  assert.equal(report.summary.directProductionAdmissionCount, 0);
});

test("P02 validator fails closed on contract-only wave drift", () => {
  const inventory = materializeP02W2ProductAdmissionInventory();
  const rows = inventory.rows.map((row, index) => index === 0 ? {
    ...row,
    capabilityGapState: "OUT_OF_W2_CONTRACT_CAPABILITY_DRIFT",
    contractOnlyRequiredCapabilityIds: ["cap_fraction_number_system"],
  } : row);
  const tampered = {
    ...inventory,
    rows,
    metrics: {
      ...inventory.metrics,
      shadowCapabilityGapKnowledgePointCount: inventory.metrics.shadowCapabilityGapKnowledgePointCount - 1,
      contractOnlyCapabilityDriftCount: 1,
    },
  };
  const report = validateP02W2ProductAdmissionInventory(tampered);
  assert.equal(report.ok, false);
  assert.ok(report.errors.some((row) => row.code === "P02_CONTRACT_ONLY_CAPABILITY_DRIFT"));
});

test("P02 validator fails closed on direct production admission", () => {
  const inventory = materializeP02W2ProductAdmissionInventory();
  const rows = inventory.rows.map((row, index) => index === 0 ? {
    ...row,
    directProductionAdmissionAllowed: true,
    productionAdmissionState: "PRODUCTION_ADMITTED",
  } : row);
  const tampered = {
    ...inventory,
    rows,
    metrics: { ...inventory.metrics, directProductionAdmissionCount: 1 },
  };
  const report = validateP02W2ProductAdmissionInventory(tampered);
  assert.equal(report.ok, false);
  assert.ok(report.errors.some((row) => row.code === "P02_INVENTORY_BOUNDARY_VIOLATION"));
});

test("P02 keeps later waves and full-product closeout behind their gates", () => {
  const inventory = materializeP02W2ProductAdmissionInventory();
  assert.equal(inventory.policy.inventoryDecision.selectedNextTask, "P02A_W2SharedFoundationCapabilityHardeningPlan");
  assert.equal(inventory.policy.rules.w3ToW8ImplementationAllowed, false);
  assert.equal(inventory.policy.rules.recursiveImprovementAdminAllowed, false);
  assert.equal(inventory.policy.fullProductBoundary.fullProductLineCloseTask, "P10_FullUIHTMLPDFPrintProductCloseout");
});
