import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP03W3ProductAdmissionInventory } from "./p03-w3-product-admission-inventory.mjs";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../../..");
const P03A_DIR = path.join(ROOT, "data/curriculum/full-product/p03a");

export const P03A_W3_HARDENING_ORDER_VERSION = "p03a-w3-hardening-order-evidence-v1";

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(P03A_DIR, fileName), "utf8"));
}

function freezeArray(values) {
  return Object.freeze([...values]);
}

function unique(values) {
  return [...new Set((values ?? []).filter(Boolean))];
}

function dependencyRank(capabilityId, capabilityById, w3Ids, memo = new Map(), visiting = new Set()) {
  if (memo.has(capabilityId)) return memo.get(capabilityId);
  if (visiting.has(capabilityId)) throw new Error(`P03A_CAPABILITY_DEPENDENCY_CYCLE:${capabilityId}`);
  visiting.add(capabilityId);
  const row = capabilityById.get(capabilityId);
  if (!row) throw new Error(`P03A_CAPABILITY_SUMMARY_MISSING:${capabilityId}`);
  const dependencyRanks = row.dependencyCapabilityIds
    .filter((dependencyId) => w3Ids.has(dependencyId))
    .map((dependencyId) => dependencyRank(dependencyId, capabilityById, w3Ids, memo, visiting));
  visiting.delete(capabilityId);
  const rank = dependencyRanks.length === 0 ? 0 : Math.max(...dependencyRanks) + 1;
  memo.set(capabilityId, rank);
  return rank;
}

function evidenceBundleState(summary) {
  return Object.freeze({
    AUTHORITATIVE_CONTRACT: true,
    SOURCE_DEPENDENT_COHORT: summary.effectiveDependentKnowledgePointCount > 0,
    RUNTIME_CONSUMER: summary.runtimeEvidencePaths.length > 0,
    DETERMINISTIC_VALIDATOR: false,
    FOCUSED_TESTS: false,
    INTEGRATION_TESTS: false,
    PROMOTION_CLAIM: false,
  });
}

export function materializeP03AW3CapabilityHardeningOrderEvidence() {
  const policy = readJson("w3-capability-hardening-order-policy.json");
  const manifest = readJson("w3-capability-hardening-order.manifest.json");
  const p03 = materializeP03W3ProductAdmissionInventory();
  const capabilityById = new Map(p03.capabilitySummaries.map((row) => [row.capabilityId, row]));
  const queueById = new Map(policy.hardeningQueue.map((row) => [row.capabilityId, row]));
  const w3Ids = new Set(policy.hardeningQueue.map((row) => row.capabilityId));
  const rankMemo = new Map();

  const queue = policy.hardeningQueue.map((configured) => {
    const summary = capabilityById.get(configured.capabilityId);
    if (!summary) throw new Error(`P03A_CAPABILITY_SUMMARY_MISSING:${configured.capabilityId}`);
    const canonicalDependencyCapabilityIds = summary.dependencyCapabilityIds
      .filter((id) => w3Ids.has(id))
      .sort();
    const candidatePaths = unique(policy.partialCandidateEvidence[configured.capabilityId] ?? []).sort();
    const candidateEvidence = candidatePaths.map((repoPath) => Object.freeze({
      repoPath,
      exists: fs.existsSync(path.join(ROOT, repoPath)),
      evidenceClass: "PARTIAL_COMPONENT_CANDIDATE",
      productionSufficient: false,
    }));
    const bundleState = evidenceBundleState(summary);
    const missingEvidenceIds = policy.requiredAdmissionEvidenceBundle.filter((id) => bundleState[id] !== true);
    const priorQueueEntries = policy.hardeningQueue.filter((row) => row.order < configured.order);
    const configuredGateIds = [...configured.hardeningGateCapabilityIds];
    const gateOrderValid = configuredGateIds.every((gateId) => (
      priorQueueEntries.some((row) => row.capabilityId === gateId)
    ));
    const canonicalDependenciesInGate = canonicalDependencyCapabilityIds.every((id) => configuredGateIds.includes(id));

    return Object.freeze({
      queueOrder: configured.order,
      stageId: configured.stageId,
      capabilityId: configured.capabilityId,
      capabilityClass: summary.capabilityClass,
      deliveryStatusBeforeP03A: summary.deliveryStatusBeforeP03,
      canonicalDependencyCapabilityIds: freezeArray(canonicalDependencyCapabilityIds),
      hardeningGateCapabilityIds: freezeArray(configuredGateIds),
      dependencyRank: dependencyRank(configured.capabilityId, capabilityById, w3Ids, rankMemo),
      hardeningGateOrderValid: gateOrderValid,
      canonicalDependenciesIncludedInHardeningGate: canonicalDependenciesInGate,
      effectiveDependentKnowledgePointCount: summary.effectiveDependentKnowledgePointCount,
      directW3KnowledgePointCount: summary.directW3KnowledgePointCount,
      protectedExistingD0KnowledgePointCount: summary.protectedExistingD0KnowledgePointCount,
      dependentSourceNodeIds: freezeArray(summary.dependentSourceNodeIds),
      existingRuntimeEvidencePaths: freezeArray(summary.runtimeEvidencePaths),
      partialCandidateEvidence: freezeArray(candidateEvidence),
      productCompatibilityWitnessCount: summary.protectedExistingD0KnowledgePointCount,
      productCompatibilityWitnessEvidenceClass: summary.protectedExistingD0KnowledgePointCount > 0
        ? "PRODUCT_COMPATIBILITY_WITNESS_ONLY"
        : null,
      evidenceBundleState: bundleState,
      missingBlockingEvidenceIds: freezeArray(missingEvidenceIds),
      evidenceReconciliationState: missingEvidenceIds.length === 0
        ? "ADMISSION_EVIDENCE_COMPLETE"
        : "MISSING_BLOCKING_EVIDENCE",
      implementationState: "CONTRACT_ONLY_NOT_IMPLEMENTED",
      readyForImplementationTask: configured.order === 1,
      readyForProductionAdmission: false,
      nextTaskId: configured.nextTaskId,
      directProductionAdmissionAllowed: false,
    });
  }).sort((a, b) => a.queueOrder - b.queueOrder);

  const stageIds = unique(queue.map((row) => row.stageId));
  const stageSummaries = stageIds.map((stageId) => {
    const rows = queue.filter((row) => row.stageId === stageId);
    return Object.freeze({
      stageId,
      capabilityCount: rows.length,
      capabilityIds: freezeArray(rows.map((row) => row.capabilityId)),
      effectiveDependentKnowledgePointRelationshipCount: rows.reduce(
        (sum, row) => sum + row.effectiveDependentKnowledgePointCount,
        0,
      ),
    });
  });

  const metrics = Object.freeze({
    capabilityCount: queue.length,
    hardeningStageCount: stageSummaries.length,
    rootNumberSystemCapabilityCount: queue.filter((row) => row.stageId === "W3-H0-NUMBER-SYSTEM").length,
    domainValidatorCapabilityCount: queue.filter((row) => row.stageId === "W3-H1-DOMAIN-VALIDATOR").length,
    arithmeticCapabilityCount: queue.filter((row) => row.stageId === "W3-H2-ARITHMETIC").length,
    crossDomainNormalizationCapabilityCount: queue.filter((row) => row.stageId === "W3-H3-CROSS-DOMAIN-NORMALIZATION").length,
    canonicalDependencyEdgeCount: queue.reduce((sum, row) => sum + row.canonicalDependencyCapabilityIds.length, 0),
    hardeningGateEdgeCount: queue.reduce((sum, row) => sum + row.hardeningGateCapabilityIds.length, 0),
    authoritativeContractEvidenceCount: queue.filter((row) => row.evidenceBundleState.AUTHORITATIVE_CONTRACT).length,
    sourceDependentCohortEvidenceCount: queue.filter((row) => row.evidenceBundleState.SOURCE_DEPENDENT_COHORT).length,
    capabilityWithExistingRuntimeEvidenceCount: queue.filter((row) => row.existingRuntimeEvidencePaths.length > 0).length,
    capabilityWithoutExistingRuntimeEvidenceCount: queue.filter((row) => row.existingRuntimeEvidencePaths.length === 0).length,
    capabilityWithPartialCandidateCount: queue.filter((row) => row.partialCandidateEvidence.length > 0).length,
    partialCandidateRelationshipCount: queue.reduce((sum, row) => sum + row.partialCandidateEvidence.length, 0),
    uniquePartialCandidatePathCount: new Set(queue.flatMap((row) => row.partialCandidateEvidence.map((item) => item.repoPath))).size,
    partialCandidateExistingPathCount: queue.reduce(
      (sum, row) => sum + row.partialCandidateEvidence.filter((item) => item.exists).length,
      0,
    ),
    capabilityWithProductCompatibilityWitnessCount: queue.filter((row) => row.productCompatibilityWitnessCount > 0).length,
    missingBlockingEvidenceRelationshipCount: queue.reduce((sum, row) => sum + row.missingBlockingEvidenceIds.length, 0),
    productionReadyCapabilityCount: queue.filter((row) => row.readyForProductionAdmission).length,
    contractOnlyCapabilityCount: queue.filter((row) => row.deliveryStatusBeforeP03A === "contract_only").length,
    firstImplementationTaskId: queue[0]?.nextTaskId ?? null,
  });

  return Object.freeze({
    schemaName: manifest.schemaName,
    schemaVersion: manifest.schemaVersion,
    programId: manifest.programId,
    taskId: manifest.taskId,
    status: manifest.status,
    version: P03A_W3_HARDENING_ORDER_VERSION,
    policy: Object.freeze(policy),
    manifest: Object.freeze(manifest),
    predecessorInventory: p03,
    queue: freezeArray(queue),
    stageSummaries: freezeArray(stageSummaries),
    metrics,
    getCapability(capabilityId) {
      return queue.find((row) => row.capabilityId === capabilityId) ?? null;
    },
    getQueueEntry(order) {
      return queue.find((row) => row.queueOrder === order) ?? null;
    },
    getConfiguredQueueEntry(capabilityId) {
      return queueById.get(capabilityId) ?? null;
    },
  });
}

export function listP03AW3HardeningQueue() {
  return materializeP03AW3CapabilityHardeningOrderEvidence().queue;
}

export function getP03AW3CapabilityEvidence(capabilityId) {
  return materializeP03AW3CapabilityHardeningOrderEvidence().getCapability(capabilityId);
}
