import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP02W2ProductAdmissionInventory } from "./p02-w2-product-admission-inventory.mjs";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../../..");
const P02A_DIR = path.join(ROOT, "data/curriculum/full-product/p02a");
const LEVEL_INDEX = new Map([
  ["E0_PLANNING_ONLY", 0],
  ["E1_DATA_STRUCTURE_READY", 1],
  ["E2_CONTENT_AUTHORED", 2],
  ["E3_SHADOW_RUNTIME_INTEGRATED", 3],
  ["E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED", 4],
  ["E5_PRODUCTION_ADMITTED", 5],
  ["E6_D0_COMPLETE", 6],
]);

function readJson(repoPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, repoPath), "utf8"));
}

function readP02AJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(P02A_DIR, fileName), "utf8"));
}

function freezeArray(values) {
  return Object.freeze([...values]);
}

function unique(values) {
  return [...new Set((values ?? []).filter(Boolean))];
}

function atLeast(claim, level) {
  return (LEVEL_INDEX.get(claim?.actualEvidenceLevel) ?? -1) >= (LEVEL_INDEX.get(level) ?? Infinity);
}

function currentCoverageCount(capabilityId, capability, inventory, publicSourceCount) {
  if (capabilityId === "cap_kp_authority_lookup") return publicSourceCount;
  if (capabilityId === "cap_prerequisite_readiness") return 0;
  return inventory.dependentKnowledgePointRows.filter((row) => (
    row.w2FoundationCapabilityIds.includes(capabilityId)
    && row.currentProductCoverage.publicPatternBindingPresent
  )).length;
}

function scopeTargetCount(policyRow, capability, globalMetrics) {
  if (policyRow.scopeBasis === "SOURCE_NODE") return globalMetrics.globalSourceNodeCount;
  if (policyRow.scopeBasis === "CANONICAL_KNOWLEDGE_POINT") return globalMetrics.canonicalKnowledgePointCount;
  return capability.effectiveDependentKnowledgePointCount;
}

function missingEvidence(capabilityId, coverageCount, targetCount) {
  const remaining = Math.max(0, targetCount - coverageCount);
  if (capabilityId === "cap_kp_authority_lookup") {
    return [
      `EXTEND_GLOBAL_AUTHORITY_CONSUMER_COVERAGE:${remaining}_SOURCE_NODES`,
      "ADD_CAPABILITY_SPECIFIC_FAIL_CLOSED_LOOKUP_VALIDATOR",
      "PROMOTE_R04_CAPABILITY_STATUS_ONLY_AFTER_GLOBAL_E5_PROOF",
    ];
  }
  if (capabilityId === "cap_prerequisite_readiness") {
    return [
      "CONNECT_PREREQUISITE_READINESS_TO_PRODUCTION_LEARNER_OR_PLANNER_CONSUMER",
      "ADD_MASTERED_SET_N_PLUS_ONE_FAIL_CLOSED_GATE",
      `PROVE_GLOBAL_READINESS_SCOPE:${remaining}_KNOWLEDGE_POINTS`,
    ];
  }
  if (capabilityId === "cap_quantity_dimension_unit_identity") {
    return [
      "MATERIALIZE_GLOBAL_QUANTITY_DIMENSION_UNIT_IDENTITY_CONTRACT",
      `COVER_REMAINING_DEPENDENT_KPS:${remaining}`,
      "ADD_SHARED_QUANTITY_DOMAIN_VALIDATOR",
    ];
  }
  if (capabilityId === "cap_quantity_semantic_role_binding") {
    return [
      "MATERIALIZE_QUANTITY_SEMANTIC_ROLE_BINDING_CONTRACT",
      `COVER_REMAINING_DEPENDENT_KPS:${remaining}`,
      "ADD_SEMANTIC_ROLE_BINDING_VALIDATOR",
    ];
  }
  return [
    "MATERIALIZE_SHARED_SAME_UNIT_QUANTITY_ARITHMETIC_RUNTIME",
    `COVER_REMAINING_DEPENDENT_KPS:${remaining}`,
    "ADD_SAME_UNIT_QUANTITY_ARITHMETIC_VALIDATOR",
  ];
}

function classifyDisposition({ coverageCount, targetCount, capabilitySpecificConsumer, failClosedValidatorPresent }) {
  if (coverageCount >= targetCount && targetCount > 0 && capabilitySpecificConsumer && failClosedValidatorPresent) {
    return "PROMOTION_EVIDENCE_COMPLETE";
  }
  if (coverageCount > 0) return "PARTIAL_PRODUCTION_EVIDENCE_HARDENING_REQUIRED";
  return "SHADOW_ONLY_PRODUCTION_CONSUMER_REQUIRED";
}

export function materializeP02AW2ShadowFoundationEvidenceReconciliation() {
  const policy = readP02AJson("w2-shadow-foundation-evidence-policy.json");
  const manifest = readP02AJson("w2-shadow-foundation-evidence.manifest.json");
  const inventory = materializeP02W2ProductAdmissionInventory();
  const p01eAuthority = readJson("data/curriculum/full-product/p01e/w1-public-ui-html-pdf-print-closeout.json");
  const globalSourceNodeIds = unique(inventory.deliveryWaveAuthority.knowledgePointAssignments.flatMap((row) => row.sourceNodeIds));
  const globalMetrics = Object.freeze({
    globalSourceNodeCount: globalSourceNodeIds.length,
    canonicalKnowledgePointCount: inventory.deliveryWaveAuthority.knowledgePointAssignments.length,
    currentPublicSourceCount: p01eAuthority.publicFleet.finalPublicSourceCount,
  });
  const capabilityById = new Map(inventory.capabilitySummaries.map((row) => [row.capabilityId, row]));
  const orderById = new Map(policy.hardeningOrder.map((row) => [row.capabilityId, row.order]));

  const evidenceRows = policy.hardeningOrder.map((policyRow) => {
    const capability = capabilityById.get(policyRow.capabilityId);
    if (!capability) throw new Error(`P02A_CAPABILITY_MISSING:${policyRow.capabilityId}`);
    const producerClaim = readJson(policyRow.producerClaimPath);
    const consumerClaims = policyRow.consumerClaimPaths.map((claimPath) => ({
      claimPath,
      claim: readJson(claimPath),
    }));
    const targetCount = scopeTargetCount(policyRow, capability, globalMetrics);
    const coverageCount = currentCoverageCount(
      policyRow.capabilityId,
      capability,
      inventory,
      globalMetrics.currentPublicSourceCount,
    );
    const producerEvidenceReady = atLeast(
      producerClaim,
      policy.promotionCriteria.minimumProducerEvidenceLevel,
    );
    const e5ConsumerClaimPaths = consumerClaims
      .filter(({ claim }) => (
        atLeast(claim, policy.promotionCriteria.minimumConsumerEvidenceLevel)
        && claim.claims?.productionAdmitted === true
      ))
      .map(({ claimPath }) => claimPath);
    const capabilitySpecificConsumer = policyRow.evidenceSpecificity === "DIRECT_CONSUMER_GLOBAL_SCOPE";
    const failClosedValidatorPresent = false;
    const coverageComplete = targetCount > 0 && coverageCount >= targetCount;
    const disposition = classifyDisposition({
      coverageCount,
      targetCount,
      capabilitySpecificConsumer,
      failClosedValidatorPresent,
    });
    const promotionAllowed = disposition === "PROMOTION_EVIDENCE_COMPLETE"
      && producerEvidenceReady
      && e5ConsumerClaimPaths.length > 0;

    return Object.freeze({
      evidenceRowId: `p02a_${policyRow.capabilityId.replace(/^cap_/, "")}`,
      hardeningOrder: policyRow.order,
      lane: policyRow.lane,
      capabilityId: policyRow.capabilityId,
      capabilityClass: capability.capabilityClass,
      r04DeliveryStatus: capability.deliveryStatusBeforeP02,
      dependencyCapabilityIds: freezeArray(policyRow.dependsOnCapabilityIds),
      dependencyOrderValid: policyRow.dependsOnCapabilityIds.every((dependencyId) => (
        (orderById.get(dependencyId) ?? Infinity) < policyRow.order
      )),
      producerClaimPath: policyRow.producerClaimPath,
      producerEvidenceLevel: producerClaim.actualEvidenceLevel,
      producerEvidenceReady,
      consumerClaimPaths: freezeArray(policyRow.consumerClaimPaths),
      e5ConsumerClaimPaths: freezeArray(e5ConsumerClaimPaths),
      evidenceSpecificity: policyRow.evidenceSpecificity,
      scopeBasis: policyRow.scopeBasis,
      scopeTargetCount: targetCount,
      currentProductionCoverageCount: coverageCount,
      remainingCoverageCount: Math.max(0, targetCount - coverageCount),
      coverageComplete,
      capabilitySpecificConsumer,
      failClosedValidatorPresent,
      dependentKnowledgePointCount: capability.effectiveDependentKnowledgePointCount,
      dependentSourceNodeCount: capability.dependentSourceNodeIds.length,
      disposition,
      promotionAllowed,
      missingEvidence: freezeArray(missingEvidence(policyRow.capabilityId, coverageCount, targetCount)),
      nextTaskId: policyRow.order === 1
        ? policy.nextTask.taskId
        : `P02${String.fromCharCode(65 + policyRow.order)}_${policyRow.capabilityId.replace(/^cap_/, "")}_Hardening`,
    });
  });

  const metrics = Object.freeze({
    capabilityCount: evidenceRows.length,
    rootCapabilityCount: evidenceRows.filter((row) => row.dependencyCapabilityIds.length === 0).length,
    dependentCapabilityCount: evidenceRows.filter((row) => row.dependencyCapabilityIds.length > 0).length,
    partialProductionEvidenceCount: evidenceRows.filter((row) => (
      row.disposition === "PARTIAL_PRODUCTION_EVIDENCE_HARDENING_REQUIRED"
    )).length,
    shadowOnlyCount: evidenceRows.filter((row) => (
      row.disposition === "SHADOW_ONLY_PRODUCTION_CONSUMER_REQUIRED"
    )).length,
    promotionEvidenceCompleteCount: evidenceRows.filter((row) => (
      row.disposition === "PROMOTION_EVIDENCE_COMPLETE"
    )).length,
    promotionAllowedCount: evidenceRows.filter((row) => row.promotionAllowed).length,
    dependencyOrderFailureCount: evidenceRows.filter((row) => !row.dependencyOrderValid).length,
    globalSourceNodeCount: globalMetrics.globalSourceNodeCount,
    canonicalKnowledgePointCount: globalMetrics.canonicalKnowledgePointCount,
    currentPublicSourceCount: globalMetrics.currentPublicSourceCount,
  });

  return Object.freeze({
    schemaName: manifest.schemaName,
    schemaVersion: manifest.schemaVersion,
    programId: manifest.programId,
    taskId: manifest.taskId,
    status: manifest.status,
    policy: Object.freeze(policy),
    manifest: Object.freeze(manifest),
    evidenceRows: freezeArray(evidenceRows),
    metrics,
    p02Inventory: inventory,
    getEvidenceRow(capabilityId) {
      return evidenceRows.find((row) => row.capabilityId === capabilityId) ?? null;
    },
  });
}

export function listP02AW2EvidenceRows() {
  return materializeP02AW2ShadowFoundationEvidenceReconciliation().evidenceRows;
}
