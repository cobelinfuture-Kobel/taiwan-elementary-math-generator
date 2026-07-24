import test from "node:test";
import assert from "node:assert/strict";

import { materializeP01AW1ProductAdmissionInventory } from "../../src/curriculum/full-product/p01-w1-product-admission-inventory.mjs";
import { validateP01AW1ProductAdmissionInventory } from "../../tools/curriculum/validate-p01a-w1-product-admission-inventory.mjs";

const PATTERN_KP_ID = "kp_g4a_u07_quantity_multiplicative_pattern";
const ORDINARY_MULTIPLE_KP_ID = "kp_g5a_u03a_multiple_identify_enumerate";


test("P01A materializes exactly the corrected 21 W1 KnowledgePoints", () => {
  const inventory = materializeP01AW1ProductAdmissionInventory();
  assert.equal(inventory.rows.length, 21);
  assert.equal(inventory.metrics.knowledgePointCount, 21);
  assert.equal(new Set(inventory.rows.map((row) => row.knowledgePointId)).size, 21);
  assert.equal(inventory.rows.every((row) => row.deliveryWaveId === "R05-W1"), true);
  assert.equal(inventory.getRow(PATTERN_KP_ID), null);
});


test("P01A1 classifies multiplicative quantity pattern as pattern relation and routes it to W6", () => {
  const inventory = materializeP01AW1ProductAdmissionInventory();
  const r05 = inventory.deliveryWaveAuthority;
  const mapping = r05.runtimeCapabilityMatrix.getMapping(PATTERN_KP_ID);
  const assignment = r05.getAssignment(PATTERN_KP_ID);
  assert.equal(mapping.primaryRuntimeProfileId, "profile_pattern_relation");
  assert.equal(mapping.classificationRuleId, "rule_pattern_relation");
  assert.ok(mapping.requiredRuntimeCapabilityIds.includes("cap_pattern_sequence_reasoning"));
  assert.ok(mapping.requiredRuntimeCapabilityIds.includes("cap_pattern_relation_validator"));
  assert.ok(mapping.undeliveredRequiredCapabilityIds.includes("cap_pattern_sequence_reasoning"));
  assert.ok(mapping.undeliveredRequiredCapabilityIds.includes("cap_pattern_relation_validator"));
  assert.equal(mapping.runtimeCapabilityDeliveryState, "BLOCKED_BY_CONTRACT_ONLY_CAPABILITIES");
  assert.equal(assignment.deliveryWaveId, "R05-W6");
});


test("P01A1 leaves ordinary multiple reasoning in the factor multiple profile", () => {
  const inventory = materializeP01AW1ProductAdmissionInventory();
  const r05 = inventory.deliveryWaveAuthority;
  const mapping = r05.runtimeCapabilityMatrix.getMapping(ORDINARY_MULTIPLE_KP_ID);
  const assignment = r05.getAssignment(ORDINARY_MULTIPLE_KP_ID);
  assert.ok(mapping, ORDINARY_MULTIPLE_KP_ID);
  assert.equal(mapping.primaryRuntimeProfileId, "profile_factor_multiple");
  assert.equal(mapping.classificationRuleId, "rule_factor_multiple");
  assert.ok(mapping.requiredRuntimeCapabilityIds.includes("cap_factor_multiple_reasoning"));
  assert.ok(mapping.requiredRuntimeCapabilityIds.includes("cap_factor_multiple_validator"));
  assert.equal(mapping.runtimeCapabilityDeliveryState, "ALL_REQUIRED_CAPABILITIES_PRODUCTION_ADMITTED");
  assert.equal(assignment.deliveryWaveId, "R05-W1");
});


test("P01A proves shared runtime capability readiness without claiming product readiness", () => {
  const inventory = materializeP01AW1ProductAdmissionInventory();
  assert.equal(inventory.metrics.allRequiredCapabilitiesProductionAdmittedCount, 21);
  assert.equal(inventory.metrics.shadowCapabilityGapCount, 0);
  assert.equal(inventory.metrics.contractOnlyCapabilityGapCount, 0);
  assert.equal(inventory.metrics.directProductionAdmissionCount, 0);
  assert.equal(inventory.rows.every((row) => row.capabilityProof.runtimeEvidencePaths.length > 0), true);
  assert.equal(inventory.rows.every((row) => row.productionAdmissionState === "INVENTORIED_NOT_ADMITTED"), true);
});


test("P01A accounts for every corrected W1 product gap and source node", () => {
  const inventory = materializeP01AW1ProductAdmissionInventory();
  const gapCount = inventory.metrics.admissionReadyExistingPublicPatternCount
    + inventory.metrics.patternGroupOrSpecBindingRequiredCount
    + inventory.metrics.publicProductVerticalSliceRequiredCount;
  assert.equal(gapCount, 21);
  assert.equal(inventory.metrics.sourceNodeCount, 4);
  assert.equal(inventory.sourceSummaries.length, 4);
  assert.equal(inventory.rows.every((row) => row.sourceNodeIds.length > 0), true);
  assert.equal(inventory.rows.every((row) => row.nextAdmissionActions.length > 0), true);

  console.log(`P01A_REBASED_INVENTORY_READBACK=${JSON.stringify({
    metrics: inventory.metrics,
    sourceSummaries: inventory.sourceSummaries,
    correctedPatternKnowledgePoint: {
      knowledgePointId: PATTERN_KP_ID,
      deliveryWaveId: inventory.deliveryWaveAuthority.getAssignment(PATTERN_KP_ID).deliveryWaveId,
      profileId: inventory.deliveryWaveAuthority.runtimeCapabilityMatrix.getMapping(PATTERN_KP_ID).primaryRuntimeProfileId,
    },
    ordinaryMultipleKnowledgePoint: {
      knowledgePointId: ORDINARY_MULTIPLE_KP_ID,
      deliveryWaveId: inventory.deliveryWaveAuthority.getAssignment(ORDINARY_MULTIPLE_KP_ID).deliveryWaveId,
      profileId: inventory.deliveryWaveAuthority.runtimeCapabilityMatrix.getMapping(ORDINARY_MULTIPLE_KP_ID).primaryRuntimeProfileId,
    },
    rows: inventory.rows.map((row) => ({
      knowledgePointId: row.knowledgePointId,
      canonicalNameZh: row.canonicalNameZh,
      sourceNodeIds: row.sourceNodeIds,
      productGapState: row.productGapState,
    })),
  })}`);
});


test("P01A excludes the protected W0 baseline from W1 product population", () => {
  const inventory = materializeP01AW1ProductAdmissionInventory();
  const baselineSourceIds = new Set(inventory.deliveryWaveAuthority.policy.publicBaseline.sourceNodeIds);
  assert.equal(inventory.rows.every((row) => row.sourceNodeIds.every((id) => !baselineSourceIds.has(id))), true);
  assert.equal(inventory.rows.every((row) => row.currentProductCoverage.publicSourceSelectable === false), true);
});


test("P01A validator passes the rebased executable gap matrix", () => {
  const report = validateP01AW1ProductAdmissionInventory();
  assert.equal(report.ok, true, JSON.stringify(report.errors, null, 2));
  assert.equal(report.summary.knowledgePointCount, 21);
  assert.equal(report.summary.sourceNodeCount, 4);
  assert.equal(report.summary.directProductionAdmissionCount, 0);
});


test("P01A validator fails closed if inventory is misreported as admitted", () => {
  const inventory = materializeP01AW1ProductAdmissionInventory();
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
  const report = validateP01AW1ProductAdmissionInventory(tampered);
  assert.equal(report.ok, false);
  assert.ok(report.errors.some((row) => row.code === "P01A_DIRECT_ADMISSION_OCCURRED"));
  assert.ok(report.errors.some((row) => row.code === "P01A_INVENTORY_BOUNDARY_VIOLATION"));
});


test("P01A keeps recursive-improvement administration behind P10", () => {
  const inventory = materializeP01AW1ProductAdmissionInventory();
  assert.equal(inventory.policy.rules.recursiveImprovementAdminAllowed, false);
  assert.equal(inventory.policy.fullProductBoundary.fullProductLineCloseTask, "P10_FullUIHTMLPDFPrintProductCloseout");
  assert.equal(inventory.policy.fullProductBoundary.recursiveImprovementAdminStartAllowedAfter, "P10_FullUIHTMLPDFPrintProductCloseout");
});
