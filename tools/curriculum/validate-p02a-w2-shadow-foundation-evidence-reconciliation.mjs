import path from "node:path";
import { pathToFileURL } from "node:url";

import { materializeP02AW2ShadowFoundationEvidenceReconciliation } from "../../src/curriculum/full-product/p02a-w2-shadow-foundation-evidence-reconciliation.mjs";

const EXPECTED_IDS = Object.freeze([
  "cap_kp_authority_lookup",
  "cap_quantity_dimension_unit_identity",
  "cap_prerequisite_readiness",
  "cap_quantity_semantic_role_binding",
  "cap_same_unit_quantity_arithmetic",
]);

const EXPECTED_COVERAGE = Object.freeze({
  cap_kp_authority_lookup: [19, 79],
  cap_quantity_dimension_unit_identity: [3, 51],
  cap_prerequisite_readiness: [0, 482],
  cap_quantity_semantic_role_binding: [2, 26],
  cap_same_unit_quantity_arithmetic: [0, 2],
});

function issue(code, details = {}) {
  return Object.freeze({ code, ...details });
}

export function validateP02AW2ShadowFoundationEvidenceReconciliation(candidate = null) {
  const matrix = candidate ?? materializeP02AW2ShadowFoundationEvidenceReconciliation();
  const rows = matrix.evidenceRows ?? [];
  const metrics = matrix.metrics ?? {};
  const errors = [];

  if (matrix.programId !== "FULL_PRODUCT_LINE_D0_V1") {
    errors.push(issue("P02A_PROGRAM_ID_INVALID", { actual: matrix.programId }));
  }
  if (matrix.taskId !== "P02A_W2ShadowFoundationHardeningOrderAndEvidenceReconciliation") {
    errors.push(issue("P02A_TASK_ID_INVALID", { actual: matrix.taskId }));
  }
  const ids = rows.map((row) => row.capabilityId).sort();
  if (JSON.stringify(ids) !== JSON.stringify([...EXPECTED_IDS].sort())) {
    errors.push(issue("P02A_CAPABILITY_IDENTITY_DRIFT", { expected: EXPECTED_IDS, actual: ids }));
  }
  if (new Set(rows.map((row) => row.hardeningOrder)).size !== rows.length) {
    errors.push(issue("P02A_HARDENING_ORDER_DUPLICATED"));
  }

  for (const row of rows) {
    const expectedCoverage = EXPECTED_COVERAGE[row.capabilityId];
    if (!expectedCoverage) {
      errors.push(issue("P02A_UNKNOWN_CAPABILITY", { capabilityId: row.capabilityId }));
      continue;
    }
    if (row.r04DeliveryStatus !== "shadow_available") {
      errors.push(issue("P02A_R04_STATUS_NOT_SHADOW", {
        capabilityId: row.capabilityId,
        status: row.r04DeliveryStatus,
      }));
    }
    if (row.dependencyOrderValid !== true) {
      errors.push(issue("P02A_DEPENDENCY_ORDER_INVALID", { capabilityId: row.capabilityId }));
    }
    if (row.producerEvidenceReady !== true) {
      errors.push(issue("P02A_PRODUCER_EVIDENCE_BELOW_E3", {
        capabilityId: row.capabilityId,
        level: row.producerEvidenceLevel,
      }));
    }
    if (row.currentProductionCoverageCount !== expectedCoverage[0]
      || row.scopeTargetCount !== expectedCoverage[1]) {
      errors.push(issue("P02A_COVERAGE_MISMATCH", {
        capabilityId: row.capabilityId,
        expectedCurrent: expectedCoverage[0],
        actualCurrent: row.currentProductionCoverageCount,
        expectedTarget: expectedCoverage[1],
        actualTarget: row.scopeTargetCount,
      }));
    }
    if (row.coverageComplete !== false || row.promotionAllowed !== false) {
      errors.push(issue("P02A_PREMATURE_PROMOTION", { capabilityId: row.capabilityId }));
    }
    if (!Array.isArray(row.missingEvidence) || row.missingEvidence.length === 0) {
      errors.push(issue("P02A_MISSING_EVIDENCE_PLAN_EMPTY", { capabilityId: row.capabilityId }));
    }
  }

  const expectedMetrics = {
    capabilityCount: 5,
    rootCapabilityCount: 2,
    dependentCapabilityCount: 3,
    partialProductionEvidenceCount: 3,
    shadowOnlyCount: 2,
    promotionEvidenceCompleteCount: 0,
    promotionAllowedCount: 0,
    dependencyOrderFailureCount: 0,
    globalSourceNodeCount: 79,
    canonicalKnowledgePointCount: 482,
    currentPublicSourceCount: 19,
  };
  for (const [key, expected] of Object.entries(expectedMetrics)) {
    if (metrics[key] !== expected) {
      errors.push(issue("P02A_METRIC_MISMATCH", { key, expected, actual: metrics[key] }));
    }
  }

  const manifest = matrix.manifest ?? {};
  if (manifest.expectedCapabilityCount !== metrics.capabilityCount
    || manifest.expectedPromotionReadyCount !== metrics.promotionEvidenceCompleteCount
    || manifest.expectedPartialProductionEvidenceCount !== metrics.partialProductionEvidenceCount
    || manifest.expectedShadowOnlyCount !== metrics.shadowOnlyCount) {
    errors.push(issue("P02A_MANIFEST_COUNT_MISMATCH"));
  }

  const boundary = manifest.mainlineBoundary ?? {};
  if (boundary.evidenceReconciliationOnly !== true
    || boundary.r04CapabilityStatusChanged !== false
    || boundary.productionConsumerChanged !== false
    || boundary.productionAdmissionChanged !== false
    || boundary.publicUiChanged !== false
    || boundary.existing19SourceProductPreserved !== true
    || boundary.nextTaskRequiresSeparateApproval !== true) {
    errors.push(issue("P02A_BOUNDARY_INVALID", { boundary }));
  }

  if (matrix.policy?.nextTask?.taskId !== "P02B_W2GlobalAuthorityLookupConsumerAdmission"
    || matrix.policy?.nextTask?.implementationBoundary !== true
    || matrix.policy?.nextTask?.separateApprovalRequired !== true) {
    errors.push(issue("P02A_NEXT_TASK_BOUNDARY_INVALID"));
  }

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    summary: Object.freeze({ ...metrics }),
  });
}

export function runP02AW2ShadowFoundationEvidenceValidation() {
  const report = validateP02AW2ShadowFoundationEvidenceReconciliation();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!report.ok) process.exitCode = 1;
  return report;
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) runP02AW2ShadowFoundationEvidenceValidation();
