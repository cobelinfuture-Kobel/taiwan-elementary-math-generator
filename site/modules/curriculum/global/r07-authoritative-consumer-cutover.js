import {
  resolveGlobalPublicSourceUnitAdapterDescriptor,
  resolvePostGoldenSourceUnitAdapterDescriptor,
} from "../batch-a/global-public-source-unit-adapter-registry.js";
import {
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../registry/batch-a-selector-extension.js";

export const R07_AUTHORITATIVE_CONSUMER_VERSION = "r07-global-authority-primary-v1";
export const R07_PUBLIC_PRODUCT_UNIT_IDS = Object.freeze([
  "g3a_u01_3a01",
  "g3a_u02_3a02",
  "g3a_u03_3a03",
  "g3a_u06_3a06",
  "g3b_u01_3b01",
  "g3b_u04_3b04",
  "g3b_u08_3b08",
  "g4a_u01_4a01",
  "g4a_u02_4a02",
  "g4a_u04_4a04",
  "g4a_u08_4a08",
  "g4b_u01_4b01",
  "g4b_u04_4b04",
  "g5a_u02_5a02",
  "g5a_u08_5a08",
]);

const PRODUCT_UNIT_ID_SET = new Set(R07_PUBLIC_PRODUCT_UNIT_IDS);

function unique(values) {
  return [...new Set((values ?? []).filter(Boolean))];
}

function freezeArray(values) {
  return Object.freeze([...values]);
}

function freezeResult(result) {
  return Object.freeze({
    ...result,
    errors: freezeArray(result.errors ?? []),
  });
}

function passthrough(plan) {
  return freezeResult({
    plan: { ...plan },
    applied: false,
    blocked: false,
    errors: [],
    adapter: null,
    dualReadParity: null,
  });
}

function blocked(plan, descriptor, errors) {
  return freezeResult({
    plan: null,
    applied: false,
    blocked: true,
    errors,
    adapter: Object.freeze({
      version: R07_AUTHORITATIVE_CONSUMER_VERSION,
      sourceId: plan.sourceId ?? null,
      authorityMode: "GLOBAL_PRIMARY",
      legacyAuthorityRole: "COMPATIBILITY_ALIAS_READ_ONLY",
      descriptorOrigin: descriptor?.descriptorOrigin ?? null,
      applied: false,
      blocked: true,
    }),
    dualReadParity: null,
  });
}

function visibleDescriptor(sourceId) {
  const knowledgePoints = listVisibleBatchAKnowledgePoints()
    .filter((row) => row.sourceId === sourceId);
  const patternGroups = [...new Map(knowledgePoints.flatMap((knowledgePoint) => (
    getVisiblePatternGroupsForKnowledgePoint(knowledgePoint.knowledgePointId)
  )).map((row) => [row.patternGroupId, row])).values()];
  if (knowledgePoints.length === 0 || patternGroups.length === 0) return null;
  return {
    sourceId,
    descriptorOrigin: "GLOBAL_BROWSER_VISIBLE_REGISTRY",
    knowledgePointIds: unique(knowledgePoints.map((row) => row.knowledgePointId)),
    patternGroupIds: unique(patternGroups.map((row) => row.patternGroupId)),
    patternSpecIds: unique(patternGroups.flatMap((row) => row.patternSpecIds ?? [])),
    patternGroups,
  };
}

function legacyDescriptorFallback(sourceId) {
  const descriptor = resolvePostGoldenSourceUnitAdapterDescriptor(sourceId)
    ?? resolveGlobalPublicSourceUnitAdapterDescriptor(sourceId);
  if (!descriptor) return null;
  return {
    sourceId,
    descriptorOrigin: "LEGACY_DESCRIPTOR_COMPATIBILITY_FALLBACK",
    knowledgePointIds: unique(descriptor.knowledgePointIds),
    patternGroupIds: unique(descriptor.patternGroupIds),
    patternSpecIds: unique(descriptor.patternSpecIds),
    patternGroups: [],
  };
}

export function resolveR07GlobalAuthorityDescriptor(sourceId) {
  if (!PRODUCT_UNIT_ID_SET.has(sourceId)) return null;
  const visible = visibleDescriptor(sourceId);
  const fallback = legacyDescriptorFallback(sourceId);
  if (!visible) return fallback ? Object.freeze({ ...fallback }) : null;
  if (!fallback) return Object.freeze({ ...visible });
  return Object.freeze({
    ...visible,
    descriptorOrigin: "GLOBAL_BROWSER_VISIBLE_REGISTRY_WITH_LEGACY_PARITY_READ",
    knowledgePointIds: freezeArray(unique([...visible.knowledgePointIds, ...fallback.knowledgePointIds])),
    patternGroupIds: freezeArray(unique([...visible.patternGroupIds, ...fallback.patternGroupIds])),
    patternSpecIds: freezeArray(unique([...visible.patternSpecIds, ...fallback.patternSpecIds])),
  });
}

export function listR07GlobalAuthorityDescriptors() {
  return R07_PUBLIC_PRODUCT_UNIT_IDS.map(resolveR07GlobalAuthorityDescriptor).filter(Boolean);
}

function groupsForSelectedKnowledgePoints(descriptor, selectedKnowledgePointIds) {
  const selectedSet = new Set(selectedKnowledgePointIds);
  const matching = descriptor.patternGroups.filter((group) => (
    selectedSet.has(group.primaryKnowledgePointId)
    || (group.knowledgePointIds ?? []).some((knowledgePointId) => selectedSet.has(knowledgePointId))
  ));
  return unique(matching.map((group) => group.patternGroupId));
}

function patternSpecsForSelectedGroups(descriptor, selectedPatternGroupIds) {
  const selectedSet = new Set(selectedPatternGroupIds);
  const matching = descriptor.patternGroups.filter((group) => selectedSet.has(group.patternGroupId));
  const ids = unique(matching.flatMap((group) => group.patternSpecIds ?? []));
  return ids.length > 0 ? ids : [...descriptor.patternSpecIds];
}

export function applyR07AuthoritativeConsumerCutover(plan = {}) {
  if (!PRODUCT_UNIT_ID_SET.has(plan.sourceId)) return passthrough(plan);

  const descriptor = resolveR07GlobalAuthorityDescriptor(plan.sourceId);
  if (!descriptor || descriptor.knowledgePointIds.length === 0 || descriptor.patternGroupIds.length === 0) {
    return blocked(plan, descriptor, ["R07_GLOBAL_AUTHORITY_DESCRIPTOR_MISSING"]);
  }

  const requestedKnowledgePointIds = unique(plan.selectedKnowledgePointIds ?? plan.knowledgePointIds ?? []);
  const unknownKnowledgePointIds = requestedKnowledgePointIds.filter((id) => !descriptor.knowledgePointIds.includes(id));
  if (unknownKnowledgePointIds.length > 0) {
    return blocked(plan, descriptor, unknownKnowledgePointIds.map((id) => `R07_UNKNOWN_KNOWLEDGE_POINT:${id}`));
  }

  const selectedKnowledgePointIds = requestedKnowledgePointIds.length > 0
    ? requestedKnowledgePointIds
    : [...descriptor.knowledgePointIds];
  const requestedPatternGroupIds = unique(plan.selectedPatternGroupIds ?? []);
  const derivedPatternGroupIds = groupsForSelectedKnowledgePoints(descriptor, selectedKnowledgePointIds);
  const selectedPatternGroupIds = requestedPatternGroupIds.length > 0
    ? requestedPatternGroupIds
    : (derivedPatternGroupIds.length > 0 ? derivedPatternGroupIds : [...descriptor.patternGroupIds]);
  const extensionPatternGroupIds = selectedPatternGroupIds.filter((id) => !descriptor.patternGroupIds.includes(id));
  const requestedPatternSpecIds = unique(plan.patternSpecIds ?? []);
  const patternSpecIds = requestedPatternSpecIds.length > 0
    ? requestedPatternSpecIds
    : patternSpecsForSelectedGroups(descriptor, selectedPatternGroupIds);
  const selectionMode = plan.selectionMode === "sourceUnit" || plan.selectionMode == null
    ? (selectedKnowledgePointIds.length > 1 ? "mixedKnowledgePointsSameUnit" : "singleKnowledgePoint")
    : plan.selectionMode;

  const adapter = Object.freeze({
    version: R07_AUTHORITATIVE_CONSUMER_VERSION,
    sourceId: plan.sourceId,
    authorityMode: "GLOBAL_PRIMARY",
    legacyAuthorityRole: "COMPATIBILITY_ALIAS_READ_ONLY",
    descriptorOrigin: descriptor.descriptorOrigin,
    knowledgePointCount: selectedKnowledgePointIds.length,
    patternGroupCount: selectedPatternGroupIds.length,
    patternSpecCount: patternSpecIds.length,
    extensionPatternGroupCount: extensionPatternGroupIds.length,
    applied: true,
    blocked: false,
  });
  const dualReadParity = Object.freeze({
    sourceIdPreserved: true,
    requestedKnowledgePointIdsPreserved: requestedKnowledgePointIds.every((id) => selectedKnowledgePointIds.includes(id)),
    requestedPatternGroupIdsPreserved: requestedPatternGroupIds.every((id) => selectedPatternGroupIds.includes(id)),
    legacySelectionMode: plan.selectionMode ?? null,
    globalSelectionMode: selectionMode,
    visibleOutputChangeExpected: false,
  });
  const cutoverPlan = Object.freeze({
    ...plan,
    selectionMode,
    selectedKnowledgePointIds: freezeArray(selectedKnowledgePointIds),
    knowledgePointIds: freezeArray(selectedKnowledgePointIds),
    selectedPatternGroupIds: freezeArray(selectedPatternGroupIds),
    patternSpecIds: freezeArray(patternSpecIds),
    globalAuthorityCutover: adapter,
    legacyCompatibilityAlias: Object.freeze({
      sourceId: plan.sourceId,
      role: "COMPATIBILITY_ALIAS_READ_ONLY",
      postGoldenMigrationTaskId: plan.postGoldenMigrationTaskId ?? null,
    }),
  });

  return freezeResult({
    plan: cutoverPlan,
    applied: true,
    blocked: false,
    errors: [],
    adapter,
    dualReadParity,
  });
}

export function validateR07BrowserAuthorityRegistry() {
  const errors = [];
  const descriptors = listR07GlobalAuthorityDescriptors();
  if (descriptors.length !== R07_PUBLIC_PRODUCT_UNIT_IDS.length) {
    errors.push("R07_BROWSER_AUTHORITY_UNIT_COUNT_INVALID");
  }
  for (const sourceId of R07_PUBLIC_PRODUCT_UNIT_IDS) {
    const descriptor = resolveR07GlobalAuthorityDescriptor(sourceId);
    if (!descriptor) {
      errors.push(`R07_BROWSER_AUTHORITY_DESCRIPTOR_MISSING:${sourceId}`);
      continue;
    }
    if (descriptor.knowledgePointIds.length === 0) errors.push(`R07_BROWSER_AUTHORITY_KP_EMPTY:${sourceId}`);
    if (descriptor.patternGroupIds.length === 0) errors.push(`R07_BROWSER_AUTHORITY_PATTERN_GROUP_EMPTY:${sourceId}`);
    const cutover = applyR07AuthoritativeConsumerCutover({ sourceId, selectionMode: "sourceUnit" });
    if (!cutover.applied || cutover.blocked || cutover.plan?.globalAuthorityCutover?.authorityMode !== "GLOBAL_PRIMARY") {
      errors.push(`R07_BROWSER_AUTHORITY_CUTOVER_INVALID:${sourceId}`);
    }
  }
  return Object.freeze({
    ok: errors.length === 0,
    errors: freezeArray(errors),
    affectedUnitCount: descriptors.length,
  });
}
