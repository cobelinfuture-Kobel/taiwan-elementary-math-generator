import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { materializeR03GlobalKnowledgePointPrerequisiteGraph } from "./r03-global-kp-prerequisite-graph.mjs";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../../..");
const R04_DIR = path.join(ROOT, "data/curriculum/global/runtime/r04");

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(R04_DIR, fileName), "utf8"));
}

function freezeArray(values) {
  return Object.freeze([...values]);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function semanticCorpus(knowledgePoint) {
  return [
    knowledgePoint.knowledgePointId,
    knowledgePoint.canonicalNameZh,
    knowledgePoint.capabilityStatement,
    knowledgePoint.reasoningInvariant,
    ...(knowledgePoint.indispensableConcepts ?? []),
    ...(knowledgePoint.misconceptionFamilies ?? []),
    knowledgePoint.validatorCapability?.validatorCapabilityId,
  ].filter(Boolean).join(" ").toLowerCase();
}

function matchesTerms(corpus, terms = []) {
  return terms.some((term) => corpus.includes(String(term).toLowerCase()));
}

function selectProfile(corpus, policy) {
  for (const rule of policy.classificationRules) {
    if (rule.default === true || matchesTerms(corpus, rule.anyTerms)) {
      return rule;
    }
  }
  throw new Error("R04_UNCLASSIFIED_KNOWLEDGE_POINT");
}

function modifierMatches(modifier, profileId, corpus) {
  if (Array.isArray(modifier.profileIds) && !modifier.profileIds.includes(profileId)) return false;
  if (!matchesTerms(corpus, modifier.anyTerms)) return false;
  if (matchesTerms(corpus, modifier.noneTerms)) return false;
  return true;
}

function deliveryState(requiredIds, capabilityById) {
  const production = [];
  const shadow = [];
  const undelivered = [];
  for (const capabilityId of requiredIds) {
    const row = capabilityById.get(capabilityId);
    if (row.deliveryStatus === "production_admitted") production.push(capabilityId);
    else if (row.deliveryStatus === "shadow_available") shadow.push(capabilityId);
    else undelivered.push(capabilityId);
  }
  let state = "ALL_REQUIRED_CAPABILITIES_PRODUCTION_ADMITTED";
  if (undelivered.length > 0) state = "BLOCKED_BY_CONTRACT_ONLY_CAPABILITIES";
  else if (shadow.length > 0) state = "ALL_REQUIRED_CAPABILITIES_AVAILABLE_SHADOW";
  return {
    state,
    productionAdmittedRequiredCapabilityIds: production,
    shadowRequiredCapabilityIds: shadow,
    undeliveredRequiredCapabilityIds: undelivered,
  };
}

function materializeMapping(knowledgePoint, registry) {
  const corpus = semanticCorpus(knowledgePoint);
  const selectedRule = selectProfile(corpus, registry.policy);
  const profile = registry.profileById.get(selectedRule.profileId);
  const appliedModifiers = registry.policy.modifiers.filter((modifier) => (
    modifierMatches(modifier, profile.profileId, corpus)
  ));

  const requiredIds = unique([
    ...registry.profiles.commonRequiredCapabilityIds,
    ...profile.requiredCapabilityIds,
    ...appliedModifiers.flatMap((row) => row.addRequiredCapabilityIds ?? []),
  ]);
  const operationCapabilityIds = new Set([
    "cap_integer_add_sub",
    "cap_integer_multiplication",
    "cap_integer_division",
    "cap_integer_mixed_operations",
  ]);
  if (
    profile.profileId === "profile_integer_operations"
    && !requiredIds.some((id) => operationCapabilityIds.has(id))
  ) {
    requiredIds.push("cap_integer_mixed_operations");
  }

  const forbiddenIds = unique(appliedModifiers.flatMap((row) => row.addForbiddenCapabilityIds ?? []))
    .filter((id) => !requiredIds.includes(id));
  const optionalIds = unique([
    ...(profile.optionalCapabilityIds ?? []),
    ...appliedModifiers.flatMap((row) => row.addOptionalCapabilityIds ?? []),
  ]).filter((id) => !requiredIds.includes(id) && !forbiddenIds.includes(id));

  const delivery = deliveryState(requiredIds, registry.capabilityById);
  return Object.freeze({
    mappingId: `r04map_${knowledgePoint.knowledgePointId.replace(/^kp_/, "")}`,
    knowledgePointId: knowledgePoint.knowledgePointId,
    primaryRuntimeProfileId: profile.profileId,
    classificationRuleId: selectedRule.ruleId,
    appliedModifierIds: freezeArray(appliedModifiers.map((row) => row.modifierId)),
    requiredRuntimeCapabilityIds: freezeArray(requiredIds),
    optionalRuntimeCapabilityIds: freezeArray(optionalIds),
    forbiddenRuntimeCapabilityIds: freezeArray(forbiddenIds),
    runtimeCapabilityDeliveryState: delivery.state,
    productionAdmittedRequiredCapabilityIds: freezeArray(delivery.productionAdmittedRequiredCapabilityIds),
    shadowRequiredCapabilityIds: freezeArray(delivery.shadowRequiredCapabilityIds),
    undeliveredRequiredCapabilityIds: freezeArray(delivery.undeliveredRequiredCapabilityIds),
    knowledgePointProductionAdmissionState: "DEFERRED_TO_R06_R07",
    sourceRefs: freezeArray(knowledgePoint.sourceRefs ?? []),
    legacyBatchRefs: freezeArray(knowledgePoint.legacyBatchRefs ?? []),
    mappingBasis: Object.freeze({
      semanticFieldsOnly: true,
      legacyBatchUsedForClassification: false,
      sourceTitleOnlyClassificationAllowed: false,
    }),
  });
}

function buildMetrics(mappings, capabilities) {
  const profileCounts = {};
  const deliveryStateCounts = {};
  const capabilityUsageCounts = Object.fromEntries(capabilities.map((row) => [row.capabilityId, 0]));
  for (const mapping of mappings) {
    profileCounts[mapping.primaryRuntimeProfileId] = (profileCounts[mapping.primaryRuntimeProfileId] ?? 0) + 1;
    deliveryStateCounts[mapping.runtimeCapabilityDeliveryState] = (
      deliveryStateCounts[mapping.runtimeCapabilityDeliveryState] ?? 0
    ) + 1;
    for (const capabilityId of [
      ...mapping.requiredRuntimeCapabilityIds,
      ...mapping.optionalRuntimeCapabilityIds,
    ]) {
      capabilityUsageCounts[capabilityId] = (capabilityUsageCounts[capabilityId] ?? 0) + 1;
    }
  }
  return Object.freeze({
    knowledgePointCount: mappings.length,
    mappedKnowledgePointCount: mappings.length,
    capabilityCount: capabilities.length,
    profileCounts: Object.freeze(profileCounts),
    deliveryStateCounts: Object.freeze(deliveryStateCounts),
    capabilityUsageCounts: Object.freeze(capabilityUsageCounts),
  });
}

export function materializeR04SharedRuntimeCapabilityMatrix() {
  const capabilityDoc = readJson("shared-runtime-capabilities.json");
  const profiles = readJson("runtime-capability-profiles.json");
  const policy = readJson("runtime-capability-mapping-policy.json");
  const manifest = readJson("runtime-capability-matrix.manifest.json");
  const r03 = materializeR03GlobalKnowledgePointPrerequisiteGraph();
  const capabilities = capabilityDoc.capabilities.map((row) => Object.freeze({
    capabilityId: row.capabilityId,
    capabilityClass: row.class,
    capabilityScope: row.scope,
    deliveryStatus: row.status,
    dependsOnCapabilityIds: freezeArray(row.dependsOn ?? []),
    runtimeEvidencePaths: freezeArray(
      row.evidenceRef ? (capabilityDoc.evidenceRegistry[row.evidenceRef] ?? []) : []
    ),
    evidenceRef: row.evidenceRef ?? null,
  }));

  const capabilityById = new Map(capabilities.map((row) => [row.capabilityId, row]));
  const profileById = new Map(profiles.profiles.map((row) => [row.profileId, row]));
  const registry = { capabilityById, profileById, profiles, policy };
  const mappings = r03.knowledgePoints.map((knowledgePoint) => materializeMapping(knowledgePoint, registry));
  const mappingByKnowledgePointId = new Map(mappings.map((row) => [row.knowledgePointId, row]));

  return Object.freeze({
    schemaName: manifest.schemaName,
    schemaVersion: manifest.schemaVersion,
    programId: manifest.programId,
    taskId: manifest.taskId,
    status: manifest.status,
    capabilities: freezeArray(capabilities),
    profiles: freezeArray(profiles.profiles.map((row) => Object.freeze({ ...row }))),
    classificationRules: freezeArray(policy.classificationRules.map((row) => Object.freeze({ ...row }))),
    modifiers: freezeArray(policy.modifiers.map((row) => Object.freeze({ ...row }))),
    knowledgePointMappings: freezeArray(mappings),
    knowledgePoints: r03.knowledgePoints,
    prerequisiteGraph: r03,
    metrics: buildMetrics(mappings, capabilities),
    manifest: Object.freeze(manifest),
    mainlineBoundary: Object.freeze(manifest.mainlineBoundary),
    getMapping(knowledgePointId) {
      return mappingByKnowledgePointId.get(knowledgePointId) ?? null;
    },
  });
}

export function getR04KnowledgePointCapabilityMapping(knowledgePointId) {
  return materializeR04SharedRuntimeCapabilityMatrix().getMapping(knowledgePointId);
}

export function listR04SharedRuntimeCapabilities() {
  return materializeR04SharedRuntimeCapabilityMatrix().capabilities;
}

export function listR04MappingsByDeliveryState(state) {
  return materializeR04SharedRuntimeCapabilityMatrix().knowledgePointMappings
    .filter((row) => row.runtimeCapabilityDeliveryState === state);
}
