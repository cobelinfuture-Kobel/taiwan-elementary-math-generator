import test from "node:test";
import assert from "node:assert/strict";

import { materializeP01AW1ProductAdmissionInventory } from "../../src/curriculum/full-product/p01-w1-product-admission-inventory.mjs";
import { validateP01AW1ProductAdmissionInventory } from "../../tools/curriculum/validate-p01a-w1-product-admission-inventory.mjs";

const PATTERN_KP_ID = "kp_g4a_u07_quantity_multiplicative_pattern";
const ORDINARY_MULTIPLE_KP_ID = "kp_g5a_u03a_multiple_identify_enumerate";
const G5B_U05_SOURCE_ID = "g5b_u05_5b05a";
const G5B_U05_KP_IDS = Object.freeze([
  "kp_g5b_u05a_large_number_place_value_extension",
  "kp_g5b_u05a_large_number_read_write",
  "kp_g5b_u05a_power_of_ten_scaling",
  "kp_g5b_u05a_large_number_decompose_compare",
]);


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


test("P01A proves shared runtime capability readiness without claiming direct admission in inventory", () => {
  const inventory = materializeP01AW1ProductAdmissionInventory();
  assert.equal(inventory.metrics.allRequiredCapabilitiesProductionAdmittedCount, 21);
  assert.equal(inventory.metrics.shadowCapabilityGapCount, 0);
  assert.equal(inventory.metrics.contractOnlyCapabilityGapCount, 0);
  assert.equal(inventory.metrics.directProductionAdmissionCount, 0);
  assert.equal(inventory.rows.every((row) => row.capabilityProof.runtimeEvidencePaths.length > 0), true);
  assert.equal(inventory.rows.every((row) => row.productionAdmissionState === "INVENTORIED_NOT_ADMITTED"), true);
});


test("P01A accounts for the four admitted G5B-U05 patterns and 17 remaining vertical slices", () => {
  const inventory = materializeP01AW1ProductAdmissionInventory();
  const gapCount = inventory.metrics.admissionReadyExistingPublicPatternCount
    + inventory.metrics.patternGroupOrSpecBindingRequiredCount
    + inventory.metrics.publicProductVerticalSliceRequiredCount;
  assert.equal(gapCount, 21);
  assert.equal(inventory.metrics.sourceNodeCount, 4);
  assert.equal(inventory.sourceSummaries.length, 4);
  assert.equal(inventory.metrics.admissionReadyExistingPublicPatternCount, 4);
  assert.equal(inventory.metrics.patternGroupOrSpecBindingRequiredCount, 0);
  assert.equal(inventory.metrics.publicProductVerticalSliceRequiredCount, 17);
  assert.equal(inventory.metrics.publicKnowledgePointVisibleCount, 4);
  assert.equal(inventory.metrics.publicPatternBindingPresentCount, 4);
  assert.equal(inventory.metrics.publicSourceSelectableCount, 1);
  assert.equal(inventory.rows.every((row) => row.sourceNodeIds.length > 0), true);
  assert.equal(inventory.rows.every((row) => row.nextAdmissionActions.length > 0), true);
  for (const knowledgePointId of G5B_U05_KP_IDS) {
    const row = inventory.getRow(knowledgePointId);
    assert.equal(row.productGapState, "ADMISSION_READY_EXISTING_PUBLIC_PATTERN");
    assert.equal(row.currentProductCoverage.publicSourceSelectable, true);
  }

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


test("P01A preserves the protected W0 baseline while allowing the new W1 public source", () => {
  const inventory = materializeP01AW1ProductAdmissionInventory();
  const baselineSourceIds = new Set(inventory.deliveryWaveAuthority.policy.publicBaseline.sourceNodeIds);
  assert.equal(inventory.rows.every((row) => row.sourceNodeIds.every((id) => !baselineSourceIds.has(id))), true);
  const g5bRows = inventory.rows.filter((row) => row.sourceNodeIds.includes(G5B_U05_SOURCE_ID));
  const remainingRows = inventory.rows.filter((row) => !row.sourceNodeIds.includes(G5B_U05_SOURCE_ID));
  assert.equal(g5bRows.length, 4);
  assert.equal(g5bRows.every((row) => row.currentProductCoverage.publicSourceSelectable === true), true);
  assert.equal(remainingRows.every((row) => row.currentProductCoverage.publicSourceSelectable === false), true);
});


test("P01A validator passes the post-P01D1 executable gap matrix", () => {
  const report = validateP01AW1ProductAdmissionInventory();
  assert.equal(report.ok, true, JSON.stringify(report.errors, null, 2));
  assert.equal(report.summary.knowledgePointCount, 21);
  assert.equal(report.summary.sourceNodeCount, 4);
  assert.equal(report.summary.admissionReadyExistingPublicPatternCount, 4);
  assert.equal(report.summary.publicProductVerticalSliceRequiredCount, 17);
  assert.equal(report.summary.directProductionAdmissionCount, 0);
});


test("P01A validator fails closed if inventory is misreported as directly admitted", () => {
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
