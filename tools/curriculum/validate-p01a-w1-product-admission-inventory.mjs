import path from "node:path";
import { pathToFileURL } from "node:url";

import { materializeP01AW1ProductAdmissionInventory } from "../../src/curriculum/full-product/p01-w1-product-admission-inventory.mjs";

function issue(code, details = {}) {
  return Object.freeze({ code, ...details });
}

function sameMembers(left, right) {
  if (left.length !== right.length) return false;
  const rightSet = new Set(right);
  return left.every((value) => rightSet.has(value));
}

export function validateP01AW1ProductAdmissionInventory(candidate = materializeP01AW1ProductAdmissionInventory()) {
  const errors = [];
  const rows = candidate.rows ?? [];
  const sourceSummaries = candidate.sourceSummaries ?? [];
  const metrics = candidate.metrics ?? {};
  const policy = candidate.policy ?? {};
  const expectedW1Ids = candidate.deliveryWaveAuthority.knowledgePointAssignments
    .filter((row) => row.deliveryWaveId === "R05-W1")
    .map((row) => row.knowledgePointId)
    .sort();
  const actualIds = rows.map((row) => row.knowledgePointId).sort();

  if (rows.length !== 22 || metrics.knowledgePointCount !== 22) {
    errors.push(issue("P01A_W1_KNOWLEDGE_POINT_COUNT_INVALID", { rowCount: rows.length, metricCount: metrics.knowledgePointCount }));
  }
  if (!sameMembers(actualIds, expectedW1Ids)) errors.push(issue("P01A_W1_IDENTITY_SET_INVALID"));
  if (new Set(actualIds).size !== actualIds.length) errors.push(issue("P01A_DUPLICATE_KNOWLEDGE_POINT"));
  if (sourceSummaries.length === 0 || metrics.sourceNodeCount !== sourceSummaries.length) {
    errors.push(issue("P01A_SOURCE_SUMMARY_INVALID", { sourceSummaryCount: sourceSummaries.length, metricCount: metrics.sourceNodeCount }));
  }
  if (metrics.allRequiredCapabilitiesProductionAdmittedCount !== 22) {
    errors.push(issue("P01A_PRODUCTION_CAPABILITY_PROOF_INCOMPLETE", { actual: metrics.allRequiredCapabilitiesProductionAdmittedCount }));
  }
  if (metrics.shadowCapabilityGapCount !== 0) errors.push(issue("P01A_SHADOW_CAPABILITY_GAP_PRESENT", { actual: metrics.shadowCapabilityGapCount }));
  if (metrics.contractOnlyCapabilityGapCount !== 0) errors.push(issue("P01A_CONTRACT_CAPABILITY_GAP_PRESENT", { actual: metrics.contractOnlyCapabilityGapCount }));
  if (metrics.directProductionAdmissionCount !== 0) errors.push(issue("P01A_DIRECT_ADMISSION_OCCURRED", { actual: metrics.directProductionAdmissionCount }));

  const gapTotal = (metrics.admissionReadyExistingPublicPatternCount ?? 0)
    + (metrics.patternGroupOrSpecBindingRequiredCount ?? 0)
    + (metrics.publicProductVerticalSliceRequiredCount ?? 0);
  if (gapTotal !== 22) errors.push(issue("P01A_GAP_ACCOUNTING_INVALID", { actual: gapTotal }));

  for (const row of rows) {
    if (row.deliveryWaveId !== "R05-W1") errors.push(issue("P01A_NON_W1_ROW", { knowledgePointId: row.knowledgePointId }));
    if (!Array.isArray(row.sourceNodeIds) || row.sourceNodeIds.length === 0) {
      errors.push(issue("P01A_SOURCE_NODE_MISSING", { knowledgePointId: row.knowledgePointId }));
    }
    if (!row.capabilityProof?.allRequiredCapabilitiesProductionAdmitted) {
      errors.push(issue("P01A_CAPABILITY_PROOF_INVALID", { knowledgePointId: row.knowledgePointId }));
    }
    if (row.shadowRequiredCapabilityIds.length > 0 || row.contractOnlyRequiredCapabilityIds.length > 0) {
      errors.push(issue("P01A_W1_CAPABILITY_GAP_INVALID", { knowledgePointId: row.knowledgePointId }));
    }
    if (row.effectiveRequiredRuntimeCapabilityIds.length !== row.productionAdmittedRequiredCapabilityIds.length
      || !sameMembers(row.effectiveRequiredRuntimeCapabilityIds, row.productionAdmittedRequiredCapabilityIds)) {
      errors.push(issue("P01A_EFFECTIVE_CAPABILITY_SET_NOT_ADMITTED", { knowledgePointId: row.knowledgePointId }));
    }
    if (!Array.isArray(row.capabilityProof.runtimeEvidencePaths) || row.capabilityProof.runtimeEvidencePaths.length === 0) {
      errors.push(issue("P01A_RUNTIME_EVIDENCE_MISSING", { knowledgePointId: row.knowledgePointId }));
    }
    if (!policy.gapStates.includes(row.productGapState)) {
      errors.push(issue("P01A_GAP_STATE_INVALID", { knowledgePointId: row.knowledgePointId, productGapState: row.productGapState }));
    }
    if (!Array.isArray(row.nextAdmissionActions) || row.nextAdmissionActions.length === 0) {
      errors.push(issue("P01A_NEXT_ACTION_MISSING", { knowledgePointId: row.knowledgePointId }));
    }
    if (row.directProductionAdmissionAllowed !== false || row.productionAdmissionState !== "INVENTORIED_NOT_ADMITTED") {
      errors.push(issue("P01A_INVENTORY_BOUNDARY_VIOLATION", { knowledgePointId: row.knowledgePointId }));
    }
  }

  const boundary = candidate.manifest?.mainlineBoundary ?? {};
  if (boundary.inventoryOnly !== true || boundary.productionAdmissionChanged !== false) {
    errors.push(issue("P01A_MANIFEST_INVENTORY_BOUNDARY_INVALID"));
  }
  if (boundary.existing15UnitProductionUsePreserved !== true || boundary.w2ToW8WorkStarted !== false) {
    errors.push(issue("P01A_MAINLINE_SCOPE_INVALID"));
  }
  if (boundary.recursiveImprovementAdminAllowed !== false
    || policy.fullProductBoundary?.recursiveImprovementAdminStartAllowedAfter !== "P10_FullUIHTMLPDFPrintProductCloseout") {
    errors.push(issue("P01A_RECURSIVE_ADMIN_SEQUENCE_INVALID"));
  }

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    summary: Object.freeze({ ...metrics }),
  });
}

export function runP01AW1ProductAdmissionInventoryCli() {
  const report = validateP01AW1ProductAdmissionInventory();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!report.ok) process.exitCode = 1;
  return report;
}

const isCli = process.argv[1]
  && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isCli) runP01AW1ProductAdmissionInventoryCli();
