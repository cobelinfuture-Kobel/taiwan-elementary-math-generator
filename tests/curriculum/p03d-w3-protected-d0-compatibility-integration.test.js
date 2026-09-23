import test from "node:test";
import assert from "node:assert/strict";

import { materializeP03CW3CapabilityCloseoutProductUnblockReconciliation } from "../../src/curriculum/full-product/p03c-w3-capability-closeout-product-unblock.mjs";
import { materializeP03DW3ProtectedD0CompatibilityRevalidation } from "../../src/curriculum/full-product/p03d-w3-protected-d0-compatibility-revalidation.mjs";
import { auditFifteenUnitPublicWorksheetCloseout } from "../../tools/curriculum/audit-15-unit-public-worksheet-closeout-v2.mjs";

const PROTECTED_SOURCE_IDS = [
  "g3a_u01_3a01",
  "g4a_u01_4a01",
  "g4b_u01_4b01",
];

test("P03D protected source units retain the existing 15-unit worksheet baseline", () => {
  const report = auditFifteenUnitPublicWorksheetCloseout();
  assert.equal(report.closeoutComplete, true);
  assert.equal(report.status, "D0_PUBLIC_WORKSHEET_CLOSEOUT_PASS");

  const rows = report.rows.filter((row) => PROTECTED_SOURCE_IDS.includes(row.sourceId));
  assert.equal(rows.length, 3);
  for (const row of rows) {
    assert.deepEqual(row.blockers, [], `${row.sourceId}: ${row.blockers.join(",")}`);
    assert.equal(row.checks.publicSelectable, true, row.sourceId);
    assert.equal(row.checks.numericWorksheet, true, row.sourceId);
    assert.equal(row.checks.validatorPass, true, row.sourceId);
    assert.equal(row.checks.answerKey, true, row.sourceId);
    assert.equal(row.checks.htmlPreview, true, row.sourceId);
    assert.equal(row.checks.browserPrintData, true, row.sourceId);
  }
});

test("P03D changes only the protected compatibility state and keeps new products fail closed", () => {
  const predecessor = materializeP03CW3CapabilityCloseoutProductUnblockReconciliation();
  const runtime = materializeP03DW3ProtectedD0CompatibilityRevalidation();

  assert.equal(predecessor.metrics.dependentKnowledgePointCount, 119);
  assert.equal(predecessor.metrics.protectedExistingD0KnowledgePointCount, 4);
  assert.equal(predecessor.metrics.newProductDependentKnowledgePointCount, 115);
  assert.equal(predecessor.metrics.newProductAdmissionCount, 0);

  assert.equal(runtime.rows.length, 4);
  assert.equal(runtime.unaffectedNewProductRows.length, 115);
  assert.equal(runtime.metrics.newProductAdmissionCount, 0);
  assert.ok(runtime.unaffectedNewProductRows.every((row) => row.productAdmissionState === "PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED"));
  assert.ok(runtime.unaffectedNewProductRows.every((row) => row.productProductionAdmitted === false));
  assert.ok(runtime.unaffectedNewProductRows.every((row) => row.newlyProductAdmittedByP03C === false));
});

test("P03D preserves predecessor and policy authorities as read-only inputs", () => {
  const runtime = materializeP03DW3ProtectedD0CompatibilityRevalidation();
  assert.equal(runtime.manifest.mainlineBoundary.historicalP03InventoryMutated, false);
  assert.equal(runtime.manifest.mainlineBoundary.p03CReconciliationMutated, false);
  assert.equal(runtime.manifest.mainlineBoundary.capabilityPromotionChanged, false);
  assert.equal(runtime.manifest.mainlineBoundary.protectedProductAdmissionChanged, false);
  assert.equal(runtime.manifest.mainlineBoundary.newProductAdmissionChanged, false);
  assert.equal(runtime.manifest.mainlineBoundary.formalMappingImplementationStarted, false);
  assert.equal(runtime.manifest.mainlineBoundary.patternSpecImplementationStarted, false);
  assert.equal(runtime.manifest.mainlineBoundary.generatorBehaviorChanged, false);
  assert.equal(runtime.manifest.mainlineBoundary.publicUiFeatureChanged, false);
  assert.equal(runtime.manifest.mainlineBoundary.worksheetRendererBehaviorChanged, false);
  assert.equal(runtime.manifest.mainlineBoundary.visibleOutputChanged, false);
  assert.equal(runtime.policy.scopeBoundary.newProductRowsInScope, 0);
  assert.equal(runtime.policy.scopeBoundary.newProductVerticalSliceImplementationAllowed, false);
});
