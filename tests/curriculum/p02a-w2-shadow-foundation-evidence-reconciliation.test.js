import test from "node:test";
import assert from "node:assert/strict";

import { materializeP02AW2ShadowFoundationEvidenceReconciliation } from "../../src/curriculum/full-product/p02a-w2-shadow-foundation-evidence-reconciliation.mjs";
import { validateP02AW2ShadowFoundationEvidenceReconciliation } from "../../tools/curriculum/validate-p02a-w2-shadow-foundation-evidence-reconciliation.mjs";

const EXPECTED_ORDER = Object.freeze([
  "cap_kp_authority_lookup",
  "cap_quantity_dimension_unit_identity",
  "cap_prerequisite_readiness",
  "cap_quantity_semantic_role_binding",
  "cap_same_unit_quantity_arithmetic",
]);

test("P02A preserves the five-capability dependency-safe hardening order", () => {
  const matrix = materializeP02AW2ShadowFoundationEvidenceReconciliation();
  assert.deepEqual(matrix.evidenceRows.map((row) => row.capabilityId), EXPECTED_ORDER);
  assert.deepEqual(matrix.evidenceRows.map((row) => row.hardeningOrder), [1, 2, 3, 4, 5]);
  assert.equal(matrix.evidenceRows.every((row) => row.dependencyOrderValid), true);
  assert.equal(matrix.metrics.rootCapabilityCount, 2);
  assert.equal(matrix.metrics.dependentCapabilityCount, 3);
});

test("P02A reconciles global source and KnowledgePoint scope", () => {
  const matrix = materializeP02AW2ShadowFoundationEvidenceReconciliation();
  assert.equal(matrix.metrics.globalSourceNodeCount, 79);
  assert.equal(matrix.metrics.canonicalKnowledgePointCount, 482);
  assert.equal(matrix.metrics.currentPublicSourceCount, 19);
  const authority = matrix.getEvidenceRow("cap_kp_authority_lookup");
  const prerequisite = matrix.getEvidenceRow("cap_prerequisite_readiness");
  assert.equal(authority.currentProductionCoverageCount, 19);
  assert.equal(authority.scopeTargetCount, 79);
  assert.equal(authority.remainingCoverageCount, 60);
  assert.equal(prerequisite.currentProductionCoverageCount, 0);
  assert.equal(prerequisite.scopeTargetCount, 482);
});

test("P02A reconciles quantity capability coverage from the P02 product matrix", () => {
  const matrix = materializeP02AW2ShadowFoundationEvidenceReconciliation();
  const quantityIdentity = matrix.getEvidenceRow("cap_quantity_dimension_unit_identity");
  const semanticRole = matrix.getEvidenceRow("cap_quantity_semantic_role_binding");
  const sameUnit = matrix.getEvidenceRow("cap_same_unit_quantity_arithmetic");
  assert.deepEqual(
    [quantityIdentity.currentProductionCoverageCount, quantityIdentity.scopeTargetCount],
    [3, 51],
  );
  assert.deepEqual(
    [semanticRole.currentProductionCoverageCount, semanticRole.scopeTargetCount],
    [2, 26],
  );
  assert.deepEqual(
    [sameUnit.currentProductionCoverageCount, sameUnit.scopeTargetCount],
    [0, 2],
  );
});

test("P02A distinguishes partial production evidence from shadow-only evidence", () => {
  const matrix = materializeP02AW2ShadowFoundationEvidenceReconciliation();
  assert.equal(matrix.metrics.partialProductionEvidenceCount, 3);
  assert.equal(matrix.metrics.shadowOnlyCount, 2);
  assert.equal(matrix.metrics.promotionEvidenceCompleteCount, 0);
  assert.equal(matrix.metrics.promotionAllowedCount, 0);
  assert.equal(matrix.getEvidenceRow("cap_kp_authority_lookup").disposition, "PARTIAL_PRODUCTION_EVIDENCE_HARDENING_REQUIRED");
  assert.equal(matrix.getEvidenceRow("cap_quantity_dimension_unit_identity").disposition, "PARTIAL_PRODUCTION_EVIDENCE_HARDENING_REQUIRED");
  assert.equal(matrix.getEvidenceRow("cap_quantity_semantic_role_binding").disposition, "PARTIAL_PRODUCTION_EVIDENCE_HARDENING_REQUIRED");
  assert.equal(matrix.getEvidenceRow("cap_prerequisite_readiness").disposition, "SHADOW_ONLY_PRODUCTION_CONSUMER_REQUIRED");
  assert.equal(matrix.getEvidenceRow("cap_same_unit_quantity_arithmetic").disposition, "SHADOW_ONLY_PRODUCTION_CONSUMER_REQUIRED");
});

test("P02A does not treat E5 product claims as global capability promotion", () => {
  const matrix = materializeP02AW2ShadowFoundationEvidenceReconciliation();
  const authority = matrix.getEvidenceRow("cap_kp_authority_lookup");
  const quantityIdentity = matrix.getEvidenceRow("cap_quantity_dimension_unit_identity");
  assert.equal(authority.e5ConsumerClaimPaths.length, 3);
  assert.equal(quantityIdentity.e5ConsumerClaimPaths.length, 2);
  assert.equal(authority.capabilitySpecificConsumer, false);
  assert.equal(quantityIdentity.capabilitySpecificConsumer, false);
  assert.equal(matrix.evidenceRows.every((row) => row.promotionAllowed === false), true);
});

test("P02A produces explicit missing-evidence work for every capability", () => {
  const matrix = materializeP02AW2ShadowFoundationEvidenceReconciliation();
  assert.equal(matrix.evidenceRows.every((row) => row.missingEvidence.length >= 3), true);
  assert.ok(matrix.getEvidenceRow("cap_kp_authority_lookup").missingEvidence.includes(
    "EXTEND_GLOBAL_AUTHORITY_CONSUMER_COVERAGE:60_SOURCE_NODES",
  ));
  assert.ok(matrix.getEvidenceRow("cap_quantity_dimension_unit_identity").missingEvidence.includes(
    "COVER_REMAINING_DEPENDENT_KPS:48",
  ));
  console.log(`P02A_W2_EVIDENCE_READBACK=${JSON.stringify({
    metrics: matrix.metrics,
    rows: matrix.evidenceRows,
  })}`);
});

test("P02A validator passes the evidence reconciliation matrix", () => {
  const report = validateP02AW2ShadowFoundationEvidenceReconciliation();
  assert.equal(report.ok, true, JSON.stringify(report.errors, null, 2));
  assert.equal(report.summary.capabilityCount, 5);
  assert.equal(report.summary.promotionAllowedCount, 0);
});

test("P02A validator fails closed on premature promotion", () => {
  const matrix = materializeP02AW2ShadowFoundationEvidenceReconciliation();
  const evidenceRows = matrix.evidenceRows.map((row, index) => index === 0 ? {
    ...row,
    coverageComplete: true,
    promotionAllowed: true,
  } : row);
  const tampered = {
    ...matrix,
    evidenceRows,
    metrics: { ...matrix.metrics, promotionAllowedCount: 1 },
  };
  const report = validateP02AW2ShadowFoundationEvidenceReconciliation(tampered);
  assert.equal(report.ok, false);
  assert.ok(report.errors.some((row) => row.code === "P02A_PREMATURE_PROMOTION"));
});

test("P02A validator fails closed on dependency order drift", () => {
  const matrix = materializeP02AW2ShadowFoundationEvidenceReconciliation();
  const evidenceRows = matrix.evidenceRows.map((row) => row.capabilityId === "cap_prerequisite_readiness" ? {
    ...row,
    dependencyOrderValid: false,
  } : row);
  const tampered = {
    ...matrix,
    evidenceRows,
    metrics: { ...matrix.metrics, dependencyOrderFailureCount: 1 },
  };
  const report = validateP02AW2ShadowFoundationEvidenceReconciliation(tampered);
  assert.equal(report.ok, false);
  assert.ok(report.errors.some((row) => row.code === "P02A_DEPENDENCY_ORDER_INVALID"));
});

test("P02A freezes implementation behind a separate approval boundary", () => {
  const matrix = materializeP02AW2ShadowFoundationEvidenceReconciliation();
  assert.equal(matrix.policy.nextTask.taskId, "P02B_W2GlobalAuthorityLookupConsumerAdmission");
  assert.equal(matrix.policy.nextTask.implementationBoundary, true);
  assert.equal(matrix.policy.nextTask.separateApprovalRequired, true);
  assert.equal(matrix.manifest.mainlineBoundary.r04CapabilityStatusChanged, false);
  assert.equal(matrix.manifest.mainlineBoundary.productionConsumerChanged, false);
  assert.equal(matrix.manifest.mainlineBoundary.productionAdmissionChanged, false);
});
