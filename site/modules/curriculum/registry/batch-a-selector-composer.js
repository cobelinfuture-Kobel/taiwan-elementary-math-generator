export * from "./batch-a-selector-g4a-u08-extension.js";

import * as base from "./batch-a-selector-g4a-u08-extension.js";
import {
  G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS,
  getVisibleBatchAKnowledgePoint as getCanonicalG4AU08KnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint as getCanonicalG4AU08PatternGroups,
  validateG4AU08AllCanonicalPublicSelectorProjection as validateCanonicalG4AU08Projection,
} from "./batch-a-selector-g4a-u08-all-canonical.js";
import {
  G5A_U02_SELECTOR_PROJECTION,
  G5A_U02_SELECTOR_SOURCE_ID,
  auditG5AU02SelectorProjection,
  getG5AU02SelectorRow,
  listG5AU02SelectorPatternGroups,
  listG5AU02SelectorRows,
  resolveG5AU02SelectorPatternSpecIds,
} from "./g5a-u02-selector-projection.js";

const G4A_U08_SOURCE_ID = "g4a_u08_4a08";
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const g5aRows = Object.freeze(listG5AU02SelectorRows().map((row) => Object.freeze(row)));
const g5aRowById = new Map(g5aRows.map((row) => [row.knowledgePointId, row]));
const g4aCanonicalKnowledgePointIds = Object.freeze([
  ...new Set(G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS.map((row) => row.primaryKnowledgePointId)),
]);
const g4aCanonicalKnowledgePointIdSet = new Set(g4aCanonicalKnowledgePointIds);

function enrichG4AU08Availability(entry) {
  if (!entry) return entry;
  return {
    ...entry,
    compatibilityProjection: "legacy_source_availability_preserved_canonical_rows_resolvable_by_id",
    canonicalReachableKnowledgePointCount: g4aCanonicalKnowledgePointIds.length,
    canonicalReachableKnowledgePointIds: [...g4aCanonicalKnowledgePointIds],
  };
}

function availabilityBySource() {
  const entries = new Map(Object.entries(base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId));
  const g4a = entries.get(G4A_U08_SOURCE_ID);
  if (g4a) entries.set(G4A_U08_SOURCE_ID, enrichG4AU08Availability(g4a));
  const current = entries.get(G5A_U02_SELECTOR_SOURCE_ID) ?? {
    sourceId: G5A_U02_SELECTOR_SOURCE_ID,
    visibleCount: 0,
    hiddenPendingCount: 0,
    notSelectableCount: 0,
  };
  entries.set(G5A_U02_SELECTOR_SOURCE_ID, {
    ...current,
    visibleCount: current.visibleCount + g5aRows.length,
  });
  return Object.fromEntries(entries);
}

export { G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS, G5A_U02_SELECTOR_PROJECTION };
export const G5A_U02_VISIBLE_SELECTOR_PROJECTION = Object.freeze({
  ...G5A_U02_SELECTOR_PROJECTION,
  status: "18_knowledge_points_dynamic_production",
  visibleKnowledgePointCount: G5A_U02_SELECTOR_PROJECTION.visibleKnowledgePointCount,
  visiblePatternGroupCount: G5A_U02_SELECTOR_PROJECTION.visiblePatternGroupCount,
  visiblePatternSpecCount: G5A_U02_SELECTOR_PROJECTION.visiblePatternSpecCount,
  htmlPdfStressStatus: "s96g_passed",
});
export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + g5aRows.length,
  bySourceId: availabilityBySource(),
});

export function listVisibleBatchAKnowledgePoints() {
  return [...base.listVisibleBatchAKnowledgePoints(), ...g5aRows.map(clone)];
}

export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  const entry = BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId];
  if (entry) return clone(entry);
  const fallback = base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
  return sourceId === G4A_U08_SOURCE_ID ? clone(enrichG4AU08Availability(fallback)) : fallback;
}

export function getVisibleBatchAKnowledgePoint(knowledgePointId) {
  if (g5aRowById.has(knowledgePointId)) return getG5AU02SelectorRow(knowledgePointId);
  const legacyRow = base.getVisibleBatchAKnowledgePoint(knowledgePointId);
  if (!g4aCanonicalKnowledgePointIdSet.has(knowledgePointId)) return legacyRow;
  const canonicalRow = getCanonicalG4AU08KnowledgePoint(knowledgePointId);
  if (!legacyRow) return canonicalRow;
  return clone({
    ...canonicalRow,
    ...legacyRow,
    canonicalPatternGroupIds: canonicalRow.canonicalPatternGroupIds,
    canonicalPatternSpecIds: canonicalRow.canonicalPatternSpecIds,
    canonicalSelectorStatus: canonicalRow.canonicalSelectorStatus,
    visibilityStatus: "visible",
  });
}

export function getVisiblePatternGroupsForKnowledgePoint(knowledgePointId) {
  if (g5aRowById.has(knowledgePointId)) return listG5AU02SelectorPatternGroups(knowledgePointId);
  const legacyGroups = base.getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
  if (legacyGroups.length > 0) return legacyGroups;
  return g4aCanonicalKnowledgePointIdSet.has(knowledgePointId)
    ? getCanonicalG4AU08PatternGroups(knowledgePointId)
    : [];
}

export function resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId) {
  if (g5aRowById.has(knowledgePointId)) return resolveG5AU02SelectorPatternSpecIds(knowledgePointId);
  return [...new Set(getVisiblePatternGroupsForKnowledgePoint(knowledgePointId).flatMap((group) => group.patternSpecIds ?? []))];
}

export function validateG4AU08AllCanonicalPublicSelectorProjection() {
  const canonical = validateCanonicalG4AU08Projection();
  const availability = listBatchAKnowledgePointAvailabilityBySource(G4A_U08_SOURCE_ID);
  const errors = [...canonical.errors];
  if (availability.visibleCount !== base.listBatchAKnowledgePointAvailabilityBySource(G4A_U08_SOURCE_ID).visibleCount) {
    errors.push("legacy_source_availability_changed");
  }
  if (availability.canonicalReachableKnowledgePointCount !== 15) errors.push("canonical_reachable_count_mismatch");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({
      knowledgePoints: 15,
      patternGroups: G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS.length,
      patternSpecs: new Set(G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS.flatMap((group) => group.patternSpecIds)).size,
      globalRegistryRows: listVisibleBatchAKnowledgePoints().length,
      legacyVisibleKnowledgePoints: availability.visibleCount,
    }),
  });
}

export function validateG5AU02VisibleSelectorProjection() {
  const audit = auditG5AU02SelectorProjection();
  const availability = listBatchAKnowledgePointAvailabilityBySource(G5A_U02_SELECTOR_SOURCE_ID);
  const errors = [...audit.errors];
  if (availability.visibleCount !== 18 || availability.hiddenPendingCount !== 0 || availability.notSelectableCount !== 0) {
    errors.push("G5AU02_SELECTOR_AVAILABILITY_MISMATCH");
  }
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    knowledgePointCount: 18,
    patternSpecCount: 22,
  });
}

export function auditBatchASelectorComposition() {
  const errors = [];
  const baseRows = base.listVisibleBatchAKnowledgePoints();
  const allRows = listVisibleBatchAKnowledgePoints();
  const g5aIds = new Set(g5aRows.map((row) => row.knowledgePointId));
  if (allRows.length !== baseRows.length + 18) errors.push("SELECTOR_COMPOSER_COUNT_MISMATCH");
  if (new Set(allRows.map((row) => row.knowledgePointId)).size !== allRows.length) errors.push("SELECTOR_COMPOSER_DUPLICATE_KP");
  if (g5aRows.some((row) => row.sourceId !== G5A_U02_SELECTOR_SOURCE_ID)) errors.push("SELECTOR_COMPOSER_G5A_SOURCE_MISMATCH");
  if (baseRows.some((row) => g5aIds.has(row.knowledgePointId))) errors.push("SELECTOR_COMPOSER_CROSS_PROJECTION_COLLISION");
  const availability = listBatchAKnowledgePointAvailabilityBySource(G5A_U02_SELECTOR_SOURCE_ID);
  if (availability.visibleCount !== 18 || availability.hiddenPendingCount !== 0 || availability.notSelectableCount !== 0) {
    errors.push("SELECTOR_COMPOSER_G5A_AVAILABILITY_MISMATCH");
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}
