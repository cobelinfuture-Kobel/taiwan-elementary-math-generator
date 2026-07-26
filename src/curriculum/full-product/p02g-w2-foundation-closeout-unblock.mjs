import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP02W2ProductAdmissionInventory } from "./p02-w2-product-admission-inventory.mjs";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../../..");
const P02G_DIR = path.join(ROOT, "data/curriculum/full-product/p02g");
const FINAL_PROMOTION_REGISTRY_PATH = "data/curriculum/full-product/p02f/w2-capability-promotion-registry.json";

const CLAIM_PATH_BY_CAPABILITY_ID = Object.freeze({
  cap_kp_authority_lookup: "data/project/milestones/FPL-P02B.claim.json",
  cap_quantity_dimension_unit_identity: "data/project/milestones/FPL-P02C.claim.json",
  cap_prerequisite_readiness: "data/project/milestones/FPL-P02D.claim.json",
  cap_quantity_semantic_role_binding: "data/project/milestones/FPL-P02E.claim.json",
  cap_same_unit_quantity_arithmetic: "data/project/milestones/FPL-P02F.claim.json",
});

export const P02G_W2_FOUNDATION_CLOSEOUT_UNBLOCK_VERSION = "p02g-w2-foundation-closeout-unblock-v1";

function readJsonAt(repoPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, repoPath), "utf8"));
}

function readP02GJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(P02G_DIR, fileName), "utf8"));
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
  return Object.freeze(Object.fromEntries([...counts.entries()].sort(([a], [b]) => a.localeCompare(b))));
}

function downstreamProductStateFor(row, policy) {
  const state = policy.downstreamStateMapping[row.productGapState];
  if (!state) throw new Error(`P02G_UNKNOWN_PRODUCT_GAP_STATE:${row.knowledgePointId}:${row.productGapState}`);
  return state;
}

function productAdmissionStateFor(downstreamProductState) {
  if (downstreamProductState === "CAPABILITY_UNBLOCKED_EXISTING_PUBLIC_PATTERN_ACCEPTANCE_PENDING") {
    return "PRODUCT_ACCEPTANCE_PENDING";
  }
  if (downstreamProductState === "CAPABILITY_UNBLOCKED_PATTERN_BINDING_REQUIRED") {
    return "PATTERN_BINDING_REQUIRED";
  }
  return "PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED";
}

export function materializeP02GW2FoundationCloseoutUnblockMatrix() {
  const policy = readP02GJson("w2-foundation-closeout-unblock-policy.json");
  const manifest = readP02GJson("w2-foundation-closeout-unblock.manifest.json");
  const p02 = materializeP02W2ProductAdmissionInventory();
  const finalPromotionRegistry = readJsonAt(FINAL_PROMOTION_REGISTRY_PATH);
  const requiredFoundationCapabilityIds = [...policy.requiredFoundationCapabilityIds].sort();
  const effectivePromotionCapabilityIds = [...finalPromotionRegistry.effectivePromotionCapabilityIds].sort();
  const promotedCapabilityIdSet = new Set(effectivePromotionCapabilityIds);

  const foundationClaimSummaries = requiredFoundationCapabilityIds.map((capabilityId) => {
    const claimPath = CLAIM_PATH_BY_CAPABILITY_ID[capabilityId];
    if (!claimPath) throw new Error(`P02G_FOUNDATION_CLAIM_PATH_MISSING:${capabilityId}`);
    const claim = readJsonAt(claimPath);
    return Object.freeze({
      capabilityId,
      claimPath,
      taskId: claim.taskId,
      actualEvidenceLevel: claim.actualEvidenceLevel,
      runtimeIntegrated: claim.claims?.runtimeIntegrated === true,
      productionAdmitted: claim.claims?.productionAdmitted === true,
      visibleOutputChanged: claim.claims?.visibleOutputChanged === true,
      d0Complete: claim.claims?.d0Complete === true,
    });
  });
  const claimByCapabilityId = new Map(foundationClaimSummaries.map((row) => [row.capabilityId, row]));

  const foundationCloseoutRows = p02.capabilitySummaries.map((row) => {
    const claim = claimByCapabilityId.get(row.capabilityId) ?? null;
    return Object.freeze({
      capabilityId: row.capabilityId,
      foundationSequenceRank: row.foundationSequenceRank,
      effectiveDependentKnowledgePointCount: row.effectiveDependentKnowledgePointCount,
      directlyRequiredDependentKnowledgePointCount: row.directlyRequiredDependentKnowledgePointCount,
      dependentSourceNodeIds: row.dependentSourceNodeIds,
      historicalDeliveryStatus: row.deliveryStatusBeforeP02,
      effectiveDeliveryStatus: promotedCapabilityIdSet.has(row.capabilityId)
        ? "production_admitted"
        : row.deliveryStatusBeforeP02,
      claimPath: claim?.claimPath ?? null,
      actualEvidenceLevel: claim?.actualEvidenceLevel ?? null,
      runtimeIntegrated: claim?.runtimeIntegrated ?? false,
      productionAdmitted: claim?.productionAdmitted ?? false,
      systemicFoundationWithoutDirectRows: row.directlyRequiredDependentKnowledgePointCount === 0,
      closeoutState: promotedCapabilityIdSet.has(row.capabilityId)
        && claim?.actualEvidenceLevel === "E5_PRODUCTION_ADMITTED"
        && claim?.runtimeIntegrated === true
        && claim?.productionAdmitted === true
        ? "FOUNDATION_PRODUCTION_ADMISSION_CLOSED"
        : "FOUNDATION_CLOSEOUT_INCOMPLETE",
    });
  }).sort((a, b) => (
    a.foundationSequenceRank - b.foundationSequenceRank
    || a.capabilityId.localeCompare(b.capabilityId)
  ));

  const downstreamUnblockRows = p02.dependentKnowledgePointRows.map((row) => {
    const requiredW2CapabilityIds = [...row.w2FoundationCapabilityIds].sort();
    const missingW2CapabilityIds = requiredW2CapabilityIds.filter((id) => !promotedCapabilityIdSet.has(id));
    const capabilityUnblocked = missingW2CapabilityIds.length === 0;
    const downstreamProductState = downstreamProductStateFor(row, policy);
    return Object.freeze({
      inventoryRowId: row.inventoryRowId,
      knowledgePointId: row.knowledgePointId,
      canonicalNameZh: row.canonicalNameZh,
      sourceNodeIds: row.sourceNodeIds,
      assignedDeliveryWaveId: row.assignedDeliveryWaveId,
      baseDeliveryWaveId: row.baseDeliveryWaveId,
      primaryRuntimeProfileId: row.primaryRuntimeProfileId,
      requiredW2CapabilityIds: freezeArray(requiredW2CapabilityIds),
      promotedW2CapabilityIds: freezeArray(requiredW2CapabilityIds.filter((id) => promotedCapabilityIdSet.has(id))),
      missingW2CapabilityIds: freezeArray(missingW2CapabilityIds),
      historicalCapabilityBlocked: row.capabilityProof.w2FoundationCapabilityBlocked === true,
      capabilityUnblocked,
      capabilityGateState: capabilityUnblocked
        ? "W2_FOUNDATION_DEPENDENCY_UNBLOCKED"
        : "W2_FOUNDATION_DEPENDENCY_BLOCKED",
      currentProductCoverage: row.currentProductCoverage,
      historicalProductGapState: row.productGapState,
      downstreamProductState,
      productAdmissionState: productAdmissionStateFor(downstreamProductState),
      nextProductActions: freezeArray(policy.nextActionMapping[downstreamProductState] ?? []),
      directProductAdmissionAllowed: false,
      productProductionAdmitted: false,
    });
  });

  const sourceNodeIds = unique(downstreamUnblockRows.flatMap((row) => row.sourceNodeIds)).sort();
  const sourceSummaries = sourceNodeIds.map((sourceNodeId) => {
    const rows = downstreamUnblockRows.filter((row) => row.sourceNodeIds.includes(sourceNodeId));
    return Object.freeze({
      sourceNodeId,
      dependentKnowledgePointCount: rows.length,
      capabilityUnblockedKnowledgePointCount: rows.filter((row) => row.capabilityUnblocked).length,
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
      existingPublicPatternAcceptancePendingCount: rows.filter((row) => row.productAdmissionState === "PRODUCT_ACCEPTANCE_PENDING").length,
      patternBindingRequiredCount: rows.filter((row) => row.productAdmissionState === "PATTERN_BINDING_REQUIRED").length,
      publicProductVerticalSliceRequiredCount: rows.filter((row) => row.productAdmissionState === "PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED").length,
    });
  });

  const metrics = Object.freeze({
    foundationCapabilityCount: requiredFoundationCapabilityIds.length,
    productionAdmittedFoundationCount: foundationCloseoutRows.filter((row) => row.closeoutState === "FOUNDATION_PRODUCTION_ADMISSION_CLOSED").length,
    remainingShadowFoundationCount: requiredFoundationCapabilityIds.filter((id) => !promotedCapabilityIdSet.has(id)).length,
    foundationE5ClaimCount: foundationClaimSummaries.filter((row) => row.actualEvidenceLevel === "E5_PRODUCTION_ADMITTED" && row.productionAdmitted).length,
    directW2KnowledgePointCount: p02.metrics.directW2KnowledgePointCount,
    dependentKnowledgePointCount: downstreamUnblockRows.length,
    capabilityUnblockedKnowledgePointCount: downstreamUnblockRows.filter((row) => row.capabilityUnblocked).length,
    capabilityBlockedKnowledgePointCount: downstreamUnblockRows.filter((row) => !row.capabilityUnblocked).length,
    dependentSourceNodeCount: sourceSummaries.length,
    dependentWaveCount: waveSummaries.length,
    existingPublicPatternAcceptancePendingCount: downstreamUnblockRows.filter((row) => row.productAdmissionState === "PRODUCT_ACCEPTANCE_PENDING").length,
    patternBindingRequiredCount: downstreamUnblockRows.filter((row) => row.productAdmissionState === "PATTERN_BINDING_REQUIRED").length,
    publicProductVerticalSliceRequiredCount: downstreamUnblockRows.filter((row) => row.productAdmissionState === "PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED").length,
    directProductAdmissionCount: downstreamUnblockRows.filter((row) => row.productProductionAdmitted).length,
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
    version: P02G_W2_FOUNDATION_CLOSEOUT_UNBLOCK_VERSION,
    policy: Object.freeze(policy),
    manifest: Object.freeze(manifest),
    historicalInventory: p02,
    finalPromotionRegistry: Object.freeze(finalPromotionRegistry),
    requiredFoundationCapabilityIds: freezeArray(requiredFoundationCapabilityIds),
    effectivePromotionCapabilityIds: freezeArray(effectivePromotionCapabilityIds),
    foundationClaimSummaries: freezeArray(foundationClaimSummaries),
    foundationCloseoutRows: freezeArray(foundationCloseoutRows),
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

export function listP02GW2DownstreamUnblockRows() {
  return materializeP02GW2FoundationCloseoutUnblockMatrix().downstreamUnblockRows;
}

export function getP02GW2DownstreamUnblockRow(knowledgePointId) {
  return materializeP02GW2FoundationCloseoutUnblockMatrix().getRow(knowledgePointId);
}
