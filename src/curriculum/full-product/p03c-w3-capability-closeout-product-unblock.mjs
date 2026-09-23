import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP03W3ProductAdmissionInventory } from "./p03-w3-product-admission-inventory.mjs";
import { materializeP03AW3CapabilityHardeningOrderEvidence } from "./p03a-w3-capability-hardening-order-evidence.mjs";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../../..");
const P03C_DIR = path.join(ROOT, "data/curriculum/full-product/p03c");
const FINAL_PROMOTION_REGISTRY_PATH = "data/curriculum/full-product/p03b7/w3-capability-promotion-registry.json";

const CLAIM_PATH_BY_CAPABILITY_ID = Object.freeze({
  cap_fraction_number_system: "data/project/milestones/FPL-P03B1.claim.json",
  cap_decimal_number_system: "data/project/milestones/FPL-P03B2.claim.json",
  cap_fraction_domain_validator: "data/project/milestones/FPL-P03B3.claim.json",
  cap_decimal_domain_validator: "data/project/milestones/FPL-P03B4.claim.json",
  cap_fraction_arithmetic: "data/project/milestones/FPL-P03B5.claim.json",
  cap_decimal_arithmetic: "data/project/milestones/FPL-P03B6.claim.json",
  cap_mixed_number_domain_normalization: "data/project/milestones/FPL-P03B7.claim.json",
});

export const P03C_W3_CAPABILITY_CLOSEOUT_PRODUCT_UNBLOCK_VERSION =
  "p03c-w3-capability-closeout-product-unblock-v1";

function readJsonAt(repoPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, repoPath), "utf8"));
}

function readP03CJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(P03C_DIR, fileName), "utf8"));
}

function freezeArray(values) {
  return Object.freeze([...values]);
}

function unique(values) {
  return [...new Set((values ?? []).filter(Boolean))];
}

function countBy(rows, keySelector) {
  const counts = new Map();
  for (const row of rows) {
    const key = keySelector(row);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Object.freeze(Object.fromEntries(
    [...counts.entries()].sort(([a], [b]) => String(a).localeCompare(String(b))),
  ));
}

function downstreamProductStateFor(row, policy) {
  const state = policy.downstreamStateMapping[row.productGapState];
  if (!state) throw new Error(`P03C_UNKNOWN_PRODUCT_GAP_STATE:${row.knowledgePointId}:${row.productGapState}`);
  return state;
}

function productAdmissionStateFor(downstreamProductState) {
  if (downstreamProductState === "CAPABILITY_UNBLOCKED_PROTECTED_D0_COMPATIBILITY_REVALIDATION_PENDING") {
    return "PROTECTED_D0_COMPATIBILITY_REVALIDATION_PENDING";
  }
  if (downstreamProductState === "CAPABILITY_UNBLOCKED_EXISTING_PUBLIC_PATTERN_ACCEPTANCE_PENDING") {
    return "PRODUCT_ACCEPTANCE_PENDING";
  }
  if (downstreamProductState === "CAPABILITY_UNBLOCKED_PATTERN_BINDING_REQUIRED") {
    return "PATTERN_BINDING_REQUIRED";
  }
  return "PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED";
}

export function materializeP03CW3CapabilityCloseoutProductUnblockReconciliation() {
  const policy = readP03CJson("w3-capability-closeout-product-unblock-policy.json");
  const manifest = readP03CJson("w3-capability-closeout-product-unblock.manifest.json");
  const p03 = materializeP03W3ProductAdmissionInventory();
  const p03a = materializeP03AW3CapabilityHardeningOrderEvidence();
  const finalPromotionRegistry = readJsonAt(FINAL_PROMOTION_REGISTRY_PATH);
  const requiredW3CapabilityIds = [...policy.requiredW3CapabilityIds];
  const effectivePromotionCapabilityIds = [...finalPromotionRegistry.effectivePromotionCapabilityIds].sort();
  const promotedCapabilityIdSet = new Set(effectivePromotionCapabilityIds);
  const capabilitySummaryById = new Map(p03.capabilitySummaries.map((row) => [row.capabilityId, row]));

  const capabilityClaimSummaries = p03a.queue.map((queueEntry) => {
    const claimPath = CLAIM_PATH_BY_CAPABILITY_ID[queueEntry.capabilityId];
    if (!claimPath) throw new Error(`P03C_CAPABILITY_CLAIM_PATH_MISSING:${queueEntry.capabilityId}`);
    const claim = readJsonAt(claimPath);
    return Object.freeze({
      queueOrder: queueEntry.queueOrder,
      capabilityId: queueEntry.capabilityId,
      claimPath,
      taskId: claim.taskId,
      actualEvidenceLevel: claim.actualEvidenceLevel,
      runtimeIntegrated: claim.claims?.runtimeIntegrated === true,
      productionAdmitted: claim.claims?.productionAdmitted === true,
      visibleOutputChanged: claim.claims?.visibleOutputChanged === true,
      d0Complete: claim.claims?.d0Complete === true,
    });
  });
  const claimByCapabilityId = new Map(capabilityClaimSummaries.map((row) => [row.capabilityId, row]));

  const capabilityCloseoutRows = p03a.queue.map((queueEntry) => {
    const summary = capabilitySummaryById.get(queueEntry.capabilityId);
    const claim = claimByCapabilityId.get(queueEntry.capabilityId);
    if (!summary || !claim) throw new Error(`P03C_CAPABILITY_AUTHORITY_MISSING:${queueEntry.capabilityId}`);
    const promoted = promotedCapabilityIdSet.has(queueEntry.capabilityId);
    const hardeningGateSatisfied = queueEntry.hardeningGateCapabilityIds.every((id) => promotedCapabilityIdSet.has(id));
    const closed = promoted
      && hardeningGateSatisfied
      && claim.actualEvidenceLevel === "E5_PRODUCTION_ADMITTED"
      && claim.runtimeIntegrated
      && claim.productionAdmitted;
    return Object.freeze({
      queueOrder: queueEntry.queueOrder,
      stageId: queueEntry.stageId,
      capabilityId: queueEntry.capabilityId,
      hardeningGateCapabilityIds: queueEntry.hardeningGateCapabilityIds,
      hardeningGateSatisfied,
      effectiveDependentKnowledgePointCount: summary.effectiveDependentKnowledgePointCount,
      directlyRequiredDependentKnowledgePointCount: summary.directlyRequiredDependentKnowledgePointCount,
      directW3KnowledgePointCount: summary.directW3KnowledgePointCount,
      protectedExistingD0KnowledgePointCount: summary.protectedExistingD0KnowledgePointCount,
      dependentSourceNodeIds: summary.dependentSourceNodeIds,
      historicalDeliveryStatus: summary.deliveryStatusBeforeP03,
      effectiveDeliveryStatus: promoted ? "production_admitted" : summary.deliveryStatusBeforeP03,
      claimPath: claim.claimPath,
      actualEvidenceLevel: claim.actualEvidenceLevel,
      runtimeIntegrated: claim.runtimeIntegrated,
      productionAdmitted: claim.productionAdmitted,
      closeoutState: closed
        ? "W3_CAPABILITY_PRODUCTION_ADMISSION_CLOSED"
        : "W3_CAPABILITY_CLOSEOUT_INCOMPLETE",
    });
  }).sort((a, b) => a.queueOrder - b.queueOrder);

  const downstreamUnblockRows = p03.dependentKnowledgePointRows.map((row) => {
    const requiredRowCapabilityIds = [...row.w3CapabilityIds].sort();
    const promotedW3CapabilityIds = requiredRowCapabilityIds.filter((id) => promotedCapabilityIdSet.has(id));
    const missingW3CapabilityIds = requiredRowCapabilityIds.filter((id) => !promotedCapabilityIdSet.has(id));
    const capabilityUnblocked = missingW3CapabilityIds.length === 0;
    const downstreamProductState = downstreamProductStateFor(row, policy);
    const protectedExistingD0 = row.protectedExistingD0 === true;
    return Object.freeze({
      inventoryRowId: row.inventoryRowId,
      knowledgePointId: row.knowledgePointId,
      canonicalNameZh: row.canonicalNameZh,
      sourceNodeIds: row.sourceNodeIds,
      assignedDeliveryWaveId: row.assignedDeliveryWaveId,
      baseDeliveryWaveId: row.baseDeliveryWaveId,
      directW3CohortMember: row.directW3CohortMember,
      laterWaveDependent: row.laterWaveDependent,
      primaryRuntimeProfileId: row.primaryRuntimeProfileId,
      requiredW3CapabilityIds: freezeArray(requiredRowCapabilityIds),
      promotedW3CapabilityIds: freezeArray(promotedW3CapabilityIds),
      missingW3CapabilityIds: freezeArray(missingW3CapabilityIds),
      historicalCapabilityBlocked: row.missingW3CapabilityIds.length > 0,
      capabilityUnblocked,
      capabilityGateState: capabilityUnblocked
        ? protectedExistingD0
          ? "W3_CAPABILITY_SET_AVAILABLE_PROTECTED_D0_REVALIDATION_REQUIRED"
          : "W3_CAPABILITY_DEPENDENCY_UNBLOCKED"
        : "W3_CAPABILITY_DEPENDENCY_BLOCKED",
      inheritedW2DependencyPresent: row.inheritedW2DependencyPresent,
      inheritedW2DependencyUnblocked: row.inheritedW2DependencyUnblocked,
      currentProductCoverage: row.currentProductCoverage,
      historicalProductGapState: row.productGapState,
      downstreamProductState,
      productAdmissionState: productAdmissionStateFor(downstreamProductState),
      nextProductActions: freezeArray(policy.nextActionMapping[downstreamProductState] ?? []),
      directNewProductAdmissionAllowed: false,
      protectedExistingD0,
      productProductionAdmitted: protectedExistingD0,
      newlyProductAdmittedByP03C: false,
    });
  });

  const sourceNodeIds = unique(downstreamUnblockRows.flatMap((row) => row.sourceNodeIds)).sort();
  const sourceSummaries = sourceNodeIds.map((sourceNodeId) => {
    const rows = downstreamUnblockRows.filter((row) => row.sourceNodeIds.includes(sourceNodeId));
    return Object.freeze({
      sourceNodeId,
      dependentKnowledgePointCount: rows.length,
      capabilityUnblockedKnowledgePointCount: rows.filter((row) => row.capabilityUnblocked).length,
      protectedD0CompatibilityRevalidationPendingCount: rows.filter((row) => row.productAdmissionState === "PROTECTED_D0_COMPATIBILITY_REVALIDATION_PENDING").length,
      existingPublicPatternAcceptancePendingCount: rows.filter((row) => row.productAdmissionState === "PRODUCT_ACCEPTANCE_PENDING").length,
      patternBindingRequiredCount: rows.filter((row) => row.productAdmissionState === "PATTERN_BINDING_REQUIRED").length,
      publicProductVerticalSliceRequiredCount: rows.filter((row) => row.productAdmissionState === "PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED").length,
      deliveryWaveIds: freezeArray(unique(rows.map((row) => row.assignedDeliveryWaveId)).sort()),
    });
  });

  const deliveryWaveIds = unique(downstreamUnblockRows.map((row) => row.assignedDeliveryWaveId)).sort();
  const waveSummaries = deliveryWaveIds.map((deliveryWaveId) => {
    const rows = downstreamUnblockRows.filter((row) => row.assignedDeliveryWaveId === deliveryWaveId);
    return Object.freeze({
      deliveryWaveId,
      dependentKnowledgePointCount: rows.length,
      dependentSourceNodeCount: new Set(rows.flatMap((row) => row.sourceNodeIds)).size,
      capabilityUnblockedKnowledgePointCount: rows.filter((row) => row.capabilityUnblocked).length,
      protectedD0CompatibilityRevalidationPendingCount: rows.filter((row) => row.productAdmissionState === "PROTECTED_D0_COMPATIBILITY_REVALIDATION_PENDING").length,
      existingPublicPatternAcceptancePendingCount: rows.filter((row) => row.productAdmissionState === "PRODUCT_ACCEPTANCE_PENDING").length,
      patternBindingRequiredCount: rows.filter((row) => row.productAdmissionState === "PATTERN_BINDING_REQUIRED").length,
      publicProductVerticalSliceRequiredCount: rows.filter((row) => row.productAdmissionState === "PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED").length,
    });
  });

  const metrics = Object.freeze({
    w3CapabilityCount: requiredW3CapabilityIds.length,
    productionAdmittedW3CapabilityCount: capabilityCloseoutRows.filter((row) => row.closeoutState === "W3_CAPABILITY_PRODUCTION_ADMISSION_CLOSED").length,
    remainingW3ContractCapabilityCount: requiredW3CapabilityIds.filter((id) => !promotedCapabilityIdSet.has(id)).length,
    w3E5ClaimCount: capabilityClaimSummaries.filter((row) => row.actualEvidenceLevel === "E5_PRODUCTION_ADMITTED" && row.productionAdmitted).length,
    effectivePromotionCount: effectivePromotionCapabilityIds.length,
    directW3KnowledgePointCount: p03.metrics.directW3KnowledgePointCount,
    dependentKnowledgePointCount: downstreamUnblockRows.length,
    capabilityUnblockedKnowledgePointCount: downstreamUnblockRows.filter((row) => row.capabilityUnblocked).length,
    capabilityBlockedKnowledgePointCount: downstreamUnblockRows.filter((row) => !row.capabilityUnblocked).length,
    protectedExistingD0KnowledgePointCount: downstreamUnblockRows.filter((row) => row.protectedExistingD0).length,
    newProductDependentKnowledgePointCount: downstreamUnblockRows.filter((row) => !row.protectedExistingD0).length,
    dependentSourceNodeCount: sourceSummaries.length,
    dependentWaveCount: waveSummaries.length,
    protectedD0CompatibilityRevalidationPendingCount: downstreamUnblockRows.filter((row) => row.productAdmissionState === "PROTECTED_D0_COMPATIBILITY_REVALIDATION_PENDING").length,
    existingPublicPatternAcceptancePendingCount: downstreamUnblockRows.filter((row) => row.productAdmissionState === "PRODUCT_ACCEPTANCE_PENDING").length,
    patternBindingRequiredCount: downstreamUnblockRows.filter((row) => row.productAdmissionState === "PATTERN_BINDING_REQUIRED").length,
    publicProductVerticalSliceRequiredCount: downstreamUnblockRows.filter((row) => row.productAdmissionState === "PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED").length,
    currentProtectedProductAdmissionCount: downstreamUnblockRows.filter((row) => row.protectedExistingD0 && row.productProductionAdmitted).length,
    newProductAdmissionCount: downstreamUnblockRows.filter((row) => !row.protectedExistingD0 && row.productProductionAdmitted).length,
    dependentCountsByWave: countBy(downstreamUnblockRows, (row) => row.assignedDeliveryWaveId),
    downstreamProductStateCounts: countBy(downstreamUnblockRows, (row) => row.downstreamProductState),
  });

  const rowByKnowledgePointId = new Map(downstreamUnblockRows.map((row) => [row.knowledgePointId, row]));

  return Object.freeze({
    schemaName: manifest.schemaName,
    schemaVersion: manifest.schemaVersion,
    programId: manifest.programId,
    taskId: manifest.taskId,
    status: manifest.status,
    version: P03C_W3_CAPABILITY_CLOSEOUT_PRODUCT_UNBLOCK_VERSION,
    policy: Object.freeze(policy),
    manifest: Object.freeze(manifest),
    historicalInventory: p03,
    hardeningAuthority: p03a,
    finalPromotionRegistry: Object.freeze(finalPromotionRegistry),
    requiredW3CapabilityIds: freezeArray(requiredW3CapabilityIds),
    effectivePromotionCapabilityIds: freezeArray(effectivePromotionCapabilityIds),
    capabilityClaimSummaries: freezeArray(capabilityClaimSummaries),
    capabilityCloseoutRows: freezeArray(capabilityCloseoutRows),
    downstreamUnblockRows: freezeArray(downstreamUnblockRows),
    rows: freezeArray(downstreamUnblockRows),
    sourceSummaries: freezeArray(sourceSummaries),
    waveSummaries: freezeArray(waveSummaries),
    metrics,
    getRow(knowledgePointId) {
      return rowByKnowledgePointId.get(knowledgePointId) ?? null;
    },
  });
}

export function listP03CW3DownstreamUnblockRows() {
  return materializeP03CW3CapabilityCloseoutProductUnblockReconciliation().downstreamUnblockRows;
}

export function getP03CW3DownstreamUnblockRow(knowledgePointId) {
  return materializeP03CW3CapabilityCloseoutProductUnblockReconciliation().getRow(knowledgePointId);
}
