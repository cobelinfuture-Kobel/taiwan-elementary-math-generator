import test from "node:test";
import assert from "node:assert/strict";

import { materializeP01AW1ProductAdmissionInventory } from "../../src/curriculum/full-product/p01-w1-product-admission-inventory.mjs";
import { validateP01AW1ProductAdmissionInventory } from "../../tools/curriculum/validate-p01a-w1-product-admission-inventory.mjs";


test("P01A materializes exactly the 22 W1 KnowledgePoints", () => {
  const inventory = materializeP01AW1ProductAdmissionInventory();
  assert.equal(inventory.rows.length, 22);
  assert.equal(inventory.metrics.knowledgePointCount, 22);
  assert.equal(new Set(inventory.rows.map((row) => row.knowledgePointId)).size, 22);
  assert.equal(inventory.rows.every((row) => row.deliveryWaveId === "R05-W1"), true);
});


test("P01A proves shared runtime capability readiness without claiming product readiness", () => {
  const inventory = materializeP01AW1ProductAdmissionInventory();
  assert.equal(inventory.metrics.allRequiredCapabilitiesProductionAdmittedCount, 22);
  assert.equal(inventory.metrics.shadowCapabilityGapCount, 0);
  assert.equal(inventory.metrics.contractOnlyCapabilityGapCount, 0);
  assert.equal(inventory.metrics.directProductionAdmissionCount, 0);
  assert.equal(inventory.rows.every((row) => row.capabilityProof.runtimeEvidencePaths.length > 0), true);
  assert.equal(inventory.rows.every((row) => row.productionAdmissionState === "INVENTORIED_NOT_ADMITTED"), true);
});


test("P01A accounts for every W1 product gap and source node", () => {
  const inventory = materializeP01AW1ProductAdmissionInventory();
  const gapCount = inventory.metrics.admissionReadyExistingPublicPatternCount
    + inventory.metrics.patternGroupOrSpecBindingRequiredCount
    + inventory.metrics.publicProductVerticalSliceRequiredCount;
  assert.equal(gapCount, 22);
  assert.ok(inventory.metrics.sourceNodeCount > 0);
  assert.equal(inventory.sourceSummaries.length, inventory.metrics.sourceNodeCount);
  assert.equal(inventory.rows.every((row) => row.sourceNodeIds.length > 0), true);
  assert.equal(inventory.rows.every((row) => row.nextAdmissionActions.length > 0), true);

  console.log(`P01A_INVENTORY_READBACK=${JSON.stringify({
    metrics: inventory.metrics,
    sourceSummaries: inventory.sourceSummaries,
    rows: inventory.rows.map((row) => ({
      knowledgePointId: row.knowledgePointId,
      canonicalNameZh: row.canonicalNameZh,
      sourceNodeIds: row.sourceNodeIds,
      productGapState: row.productGapState,
      publicKnowledgePointVisible: row.currentProductCoverage.publicKnowledgePointVisible,
      patternGroupIds: row.currentProductCoverage.patternGroupIds,
      patternSpecIds: row.currentProductCoverage.patternSpecIds,
    })),
  })}`);
});


test("P01A excludes the protected W0 baseline from W1 product population", () => {
  const inventory = materializeP01AW1ProductAdmissionInventory();
  const baselineSourceIds = new Set(inventory.deliveryWaveAuthority.policy.publicBaseline.sourceNodeIds);
  assert.equal(inventory.rows.every((row) => row.sourceNodeIds.every((id) => !baselineSourceIds.has(id))), true);
  assert.equal(inventory.rows.every((row) => row.currentProductCoverage.publicSourceSelectable === false), true);
});


test("P01A validator passes the executable gap matrix", () => {
  const report = validateP01AW1ProductAdmissionInventory();
  assert.equal(report.ok, true, JSON.stringify(report.errors, null, 2));
  assert.equal(report.summary.knowledgePointCount, 22);
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
