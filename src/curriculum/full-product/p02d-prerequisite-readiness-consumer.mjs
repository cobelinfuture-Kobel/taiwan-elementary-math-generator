import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeR03GlobalKnowledgePointPrerequisiteGraph } from "../global/r03-global-kp-prerequisite-graph.mjs";
import { materializeP02BGlobalAuthorityLookupConsumer } from "./p02b-global-authority-lookup-consumer.mjs";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../../..");
const P02D_DIR = path.join(ROOT, "data/curriculum/full-product/p02d");

export const P02D_PREREQUISITE_READINESS_CONSUMER_VERSION = "p02d-prerequisite-readiness-v1";

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(P02D_DIR, fileName), "utf8"));
}

function readRepoJson(repoPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, repoPath), "utf8"));
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function unique(values) {
  return [...new Set((values ?? []).filter(Boolean))];
}

function freezeArray(values) {
  return Object.freeze([...values]);
}

function groupAlternativeEdges(edges, graph, errors, targetKnowledgePointId) {
  const grouped = new Map();
  for (const edge of edges) {
    if (!edge.alternativeGroupId || !graph.alternativeGroups[edge.alternativeGroupId]) {
      errors.push(`P02D_ALTERNATIVE_GROUP_CONTRACT_MISSING:${targetKnowledgePointId}:${edge.alternativeGroupId ?? "null"}`);
      continue;
    }
    if (!grouped.has(edge.alternativeGroupId)) grouped.set(edge.alternativeGroupId, []);
    grouped.get(edge.alternativeGroupId).push(edge.fromKnowledgePointId);
  }
  return [...grouped.entries()].map(([alternativeGroupId, sourceKnowledgePointIds]) => Object.freeze({
    alternativeGroupId,
    minimumSatisfied: graph.alternativeGroups[alternativeGroupId].minimumSatisfied,
    sourceKnowledgePointIds: freezeArray(unique(sourceKnowledgePointIds).sort()),
  })).sort((a, b) => a.alternativeGroupId.localeCompare(b.alternativeGroupId));
}

function buildDescriptors(graph, globalAuthority) {
  const descriptorErrors = [];
  const descriptors = graph.knowledgePoints.map((knowledgePoint) => {
    const knowledgePointId = knowledgePoint.knowledgePointId;
    const authority = globalAuthority.getKnowledgePoint(knowledgePointId);
    if (!authority) descriptorErrors.push(`P02D_UNKNOWN_TARGET_KP:${knowledgePointId}`);
    const incoming = graph.incomingByTarget.get(knowledgePointId) ?? [];
    const requiredEdges = incoming.filter((edge) => edge.dependencyStrength === "required");
    const alternativeEdges = incoming.filter((edge) => edge.dependencyStrength === "alternative");
    const supportingEdges = incoming.filter((edge) => edge.dependencyStrength === "supporting");
    const alternativeGroups = groupAlternativeEdges(
      alternativeEdges,
      graph,
      descriptorErrors,
      knowledgePointId,
    );
    return Object.freeze({
      readinessDescriptorId: `p02dready_${knowledgePointId.replace(/^kp_/, "")}`,
      knowledgePointId,
      canonicalNameZh: authority?.canonicalNameZh ?? knowledgePoint.canonicalNameZh ?? null,
      requiredPrerequisiteKnowledgePointIds: freezeArray(unique(requiredEdges.map((edge) => edge.fromKnowledgePointId)).sort()),
      alternativePrerequisiteGroups: freezeArray(alternativeGroups),
      supportingKnowledgePointIds: freezeArray(unique(supportingEdges.map((edge) => edge.fromKnowledgePointId)).sort()),
      blockingDirectEdgeCount: requiredEdges.length + alternativeEdges.length,
      supportingDirectEdgeCount: supportingEdges.length,
      isRoot: requiredEdges.length === 0 && alternativeEdges.length === 0,
      graphVersion: graph.graphVersion,
      authorityMode: "GLOBAL_PRIMARY",
      consumerMode: "PRODUCTION_READ_ONLY_PREREQUISITE_READINESS",
      productionAdmissionState: "PRODUCTION_ADMITTED",
    });
  }).sort((a, b) => a.knowledgePointId.localeCompare(b.knowledgePointId));
  return { descriptors, descriptorErrors };
}

function blockedResult(request, errors, operation) {
  return Object.freeze({
    ok: false,
    blocked: true,
    ready: false,
    operation,
    errors: freezeArray(errors),
    request: Object.freeze(clone(request)),
    consumerVersion: P02D_PREREQUISITE_READINESS_CONSUMER_VERSION,
    consumerMode: "PRODUCTION_READ_ONLY_PREREQUISITE_READINESS",
    productionAdmissionState: "PRODUCTION_ADMITTED",
    readiness: null,
    candidates: Object.freeze([]),
  });
}

function validateMasteredSet(masteredKnowledgePointIds, globalAuthority) {
  if (masteredKnowledgePointIds === undefined || masteredKnowledgePointIds === null) {
    return { masteredSet: null, normalizedIds: [], errors: ["P02D_MASTERED_SET_REQUIRED"] };
  }
  if (!Array.isArray(masteredKnowledgePointIds)) {
    return { masteredSet: null, normalizedIds: [], errors: ["P02D_MASTERED_SET_INVALID"] };
  }
  if (masteredKnowledgePointIds.some((id) => typeof id !== "string" || id.length === 0)) {
    return { masteredSet: null, normalizedIds: [], errors: ["P02D_MASTERED_SET_INVALID"] };
  }
  const normalizedIds = [...masteredKnowledgePointIds].sort();
  const duplicateIds = normalizedIds.filter((id, index) => index > 0 && id === normalizedIds[index - 1]);
  if (duplicateIds.length > 0) {
    return {
      masteredSet: null,
      normalizedIds,
      errors: unique(duplicateIds).map((id) => `P02D_DUPLICATE_MASTERED_KP:${id}`),
    };
  }
  const unknownIds = normalizedIds.filter((id) => !globalAuthority.getKnowledgePoint(id));
  if (unknownIds.length > 0) {
    return {
      masteredSet: null,
      normalizedIds,
      errors: unknownIds.map((id) => `P02D_UNKNOWN_MASTERED_KP:${id}`),
    };
  }
  return { masteredSet: new Set(normalizedIds), normalizedIds, errors: [] };
}

function evaluateDescriptor(descriptor, masteredSet) {
  const missingRequiredKnowledgePointIds = descriptor.requiredPrerequisiteKnowledgePointIds
    .filter((knowledgePointId) => !masteredSet.has(knowledgePointId));
  const alternativePrerequisiteGroups = descriptor.alternativePrerequisiteGroups.map((group) => {
    const satisfiedKnowledgePointIds = group.sourceKnowledgePointIds
      .filter((knowledgePointId) => masteredSet.has(knowledgePointId));
    return Object.freeze({
      alternativeGroupId: group.alternativeGroupId,
      minimumSatisfied: group.minimumSatisfied,
      sourceKnowledgePointIds: group.sourceKnowledgePointIds,
      satisfiedKnowledgePointIds: freezeArray(satisfiedKnowledgePointIds),
      satisfied: satisfiedKnowledgePointIds.length >= group.minimumSatisfied,
    });
  });
  const unsatisfiedAlternativeGroups = alternativePrerequisiteGroups.filter((group) => !group.satisfied);
  const ready = missingRequiredKnowledgePointIds.length === 0 && unsatisfiedAlternativeGroups.length === 0;
  return Object.freeze({
    knowledgePointId: descriptor.knowledgePointId,
    ready,
    readinessState: ready ? "READY_N_PLUS_ONE" : "BLOCKED_BY_PREREQUISITES",
    missingRequiredKnowledgePointIds: freezeArray(missingRequiredKnowledgePointIds),
    alternativePrerequisiteGroups: freezeArray(alternativePrerequisiteGroups),
    unsatisfiedAlternativeGroupIds: freezeArray(unsatisfiedAlternativeGroups.map((group) => group.alternativeGroupId)),
    supportingKnowledgePointIdsIgnoredForBlocking: descriptor.supportingKnowledgePointIds,
  });
}

export function materializeP02DPrerequisiteReadinessConsumer() {
  const policy = readJson("prerequisite-readiness-policy.json");
  const manifest = readJson("prerequisite-readiness.manifest.json");
  const promotionRegistry = readJson("w2-capability-promotion-registry.json");
  const predecessorPromotionRegistry = readRepoJson(promotionRegistry.predecessorPromotionRegistryPath);
  const graph = materializeR03GlobalKnowledgePointPrerequisiteGraph({ root: ROOT });
  const globalAuthority = materializeP02BGlobalAuthorityLookupConsumer();
  const { descriptors, descriptorErrors } = buildDescriptors(graph, globalAuthority);
  const descriptorByKnowledgePointId = new Map(descriptors.map((row) => [row.knowledgePointId, row]));
  const inheritedPromotionIds = predecessorPromotionRegistry.effectivePromotionCapabilityIds
    ?? unique([
      ...(predecessorPromotionRegistry.inheritedPromotionCapabilityIds ?? []),
      ...(predecessorPromotionRegistry.promotions ?? []).map((row) => row.capabilityId),
    ]);
  const effectivePromotionCapabilityIds = unique([
    ...inheritedPromotionIds,
    ...promotionRegistry.promotions.map((row) => row.capabilityId),
  ]).sort();

  function resolve({ targetKnowledgePointId = null, masteredKnowledgePointIds } = {}) {
    const request = {
      targetKnowledgePointId: typeof targetKnowledgePointId === "string" && targetKnowledgePointId.length > 0
        ? targetKnowledgePointId
        : null,
      masteredKnowledgePointIds: Array.isArray(masteredKnowledgePointIds)
        ? [...masteredKnowledgePointIds]
        : masteredKnowledgePointIds,
    };
    if (!request.targetKnowledgePointId) {
      return blockedResult(request, ["P02D_TARGET_KP_ID_REQUIRED"], "target_readiness");
    }
    if (!globalAuthority.getKnowledgePoint(request.targetKnowledgePointId)) {
      return blockedResult(
        request,
        [`P02D_UNKNOWN_TARGET_KP:${request.targetKnowledgePointId}`],
        "target_readiness",
      );
    }
    const masteredValidation = validateMasteredSet(masteredKnowledgePointIds, globalAuthority);
    if (masteredValidation.errors.length > 0) {
      return blockedResult(request, masteredValidation.errors, "target_readiness");
    }
    if (masteredValidation.masteredSet.has(request.targetKnowledgePointId)) {
      return blockedResult(
        request,
        [`P02D_TARGET_ALREADY_MASTERED:${request.targetKnowledgePointId}`],
        "target_readiness",
      );
    }
    const descriptor = descriptorByKnowledgePointId.get(request.targetKnowledgePointId);
    if (!descriptor) {
      return blockedResult(
        request,
        [`P02D_UNKNOWN_TARGET_KP:${request.targetKnowledgePointId}`],
        "target_readiness",
      );
    }
    const descriptorSpecificErrors = descriptorErrors.filter((code) => code.includes(request.targetKnowledgePointId));
    if (descriptorSpecificErrors.length > 0) {
      return blockedResult(request, descriptorSpecificErrors, "target_readiness");
    }
    const readiness = evaluateDescriptor(descriptor, masteredValidation.masteredSet);
    return Object.freeze({
      ok: true,
      blocked: false,
      ready: readiness.ready,
      operation: "target_readiness",
      errors: Object.freeze([]),
      request: Object.freeze({
        targetKnowledgePointId: request.targetKnowledgePointId,
        masteredKnowledgePointIds: freezeArray(masteredValidation.normalizedIds),
      }),
      consumerVersion: P02D_PREREQUISITE_READINESS_CONSUMER_VERSION,
      consumerMode: "PRODUCTION_READ_ONLY_PREREQUISITE_READINESS",
      productionAdmissionState: "PRODUCTION_ADMITTED",
      readiness,
      candidates: Object.freeze([]),
    });
  }

  function listReady(masteredKnowledgePointIds) {
    const request = { masteredKnowledgePointIds: Array.isArray(masteredKnowledgePointIds) ? [...masteredKnowledgePointIds] : masteredKnowledgePointIds };
    const masteredValidation = validateMasteredSet(masteredKnowledgePointIds, globalAuthority);
    if (masteredValidation.errors.length > 0) {
      return blockedResult(request, masteredValidation.errors, "ready_candidate_list");
    }
    if (descriptorErrors.length > 0) {
      return blockedResult(request, descriptorErrors, "ready_candidate_list");
    }
    const candidates = descriptors
      .filter((descriptor) => !masteredValidation.masteredSet.has(descriptor.knowledgePointId))
      .map((descriptor) => evaluateDescriptor(descriptor, masteredValidation.masteredSet))
      .filter((readiness) => readiness.ready)
      .sort((a, b) => a.knowledgePointId.localeCompare(b.knowledgePointId));
    return Object.freeze({
      ok: true,
      blocked: false,
      ready: candidates.length > 0,
      operation: "ready_candidate_list",
      errors: Object.freeze([]),
      request: Object.freeze({ masteredKnowledgePointIds: freezeArray(masteredValidation.normalizedIds) }),
      consumerVersion: P02D_PREREQUISITE_READINESS_CONSUMER_VERSION,
      consumerMode: "PRODUCTION_READ_ONLY_PREREQUISITE_READINESS",
      productionAdmissionState: "PRODUCTION_ADMITTED",
      readiness: null,
      candidates: freezeArray(candidates),
    });
  }

  const edgeCounts = {
    required: graph.edges.filter((edge) => edge.dependencyStrength === "required").length,
    alternative: graph.edges.filter((edge) => edge.dependencyStrength === "alternative").length,
    supporting: graph.edges.filter((edge) => edge.dependencyStrength === "supporting").length,
  };

  return Object.freeze({
    schemaName: manifest.schemaName,
    schemaVersion: manifest.schemaVersion,
    programId: manifest.programId,
    taskId: manifest.taskId,
    status: manifest.status,
    consumerVersion: P02D_PREREQUISITE_READINESS_CONSUMER_VERSION,
    consumerMode: "PRODUCTION_READ_ONLY_PREREQUISITE_READINESS",
    productionAdmissionState: "PRODUCTION_ADMITTED",
    policy: Object.freeze(policy),
    manifest: Object.freeze(manifest),
    promotionRegistry: Object.freeze(promotionRegistry),
    predecessorPromotionRegistry: Object.freeze(predecessorPromotionRegistry),
    descriptors: freezeArray(descriptors),
    descriptorErrors: freezeArray(descriptorErrors),
    graphAuthority: graph,
    globalAuthority,
    effectivePromotionCapabilityIds: freezeArray(effectivePromotionCapabilityIds),
    metrics: Object.freeze({
      canonicalKnowledgePointCount: descriptors.length,
      directPrerequisiteEdgeCount: graph.edges.length,
      requiredEdgeCount: edgeCounts.required,
      alternativeEdgeCount: edgeCounts.alternative,
      supportingEdgeCount: edgeCounts.supporting,
      rootKnowledgePointCount: descriptors.filter((row) => row.isRoot).length,
      alternativeGroupCount: Object.keys(graph.alternativeGroups).length,
      descriptorErrorCount: descriptorErrors.length,
      inheritedPromotionCount: inheritedPromotionIds.length,
      newPromotionCount: promotionRegistry.promotions.length,
      effectivePromotionCount: effectivePromotionCapabilityIds.length,
      remainingShadowFoundationCount: promotionRegistry.remainingShadowFoundationCapabilityIds.length,
    }),
    resolve,
    listReady,
    getDescriptor(knowledgePointId) {
      return descriptorByKnowledgePointId.get(knowledgePointId) ?? null;
    },
  });
}

export function resolveP02DPrerequisiteReadiness(request = {}) {
  return materializeP02DPrerequisiteReadinessConsumer().resolve(request);
}

export function listP02DReadyKnowledgePoints(masteredKnowledgePointIds) {
  return materializeP02DPrerequisiteReadinessConsumer().listReady(masteredKnowledgePointIds);
}

export function listP02DPrerequisiteReadinessDescriptors() {
  return clone(materializeP02DPrerequisiteReadinessConsumer().descriptors);
}

export function getP02DPrerequisiteReadinessDescriptor(knowledgePointId) {
  const descriptor = materializeP02DPrerequisiteReadinessConsumer().getDescriptor(knowledgePointId);
  return descriptor ? clone(descriptor) : null;
}

export function listP02DEffectiveW2PromotionCapabilityIds() {
  return clone(materializeP02DPrerequisiteReadinessConsumer().effectivePromotionCapabilityIds);
}
