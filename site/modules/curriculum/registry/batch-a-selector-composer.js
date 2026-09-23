export * from "./batch-a-selector-g4a-u08-extension.js";

import * as base from "./batch-a-selector-g4a-u08-extension.js";
import {
  G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS,
  getVisibleBatchAKnowledgePoint as getCanonicalG4AU08KnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint as getCanonicalG4AU08PatternGroups,
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
const baseRows = Object.freeze(base.listVisibleBatchAKnowledgePoints().map((row) => Object.freeze(row)));
const baseRowsWithoutG4AU08 = Object.freeze(baseRows.filter((row) => row.sourceId !== G4A_U08_SOURCE_ID));
const baseG4AU08Rows = Object.freeze(baseRows.filter((row) => row.sourceId === G4A_U08_SOURCE_ID));
const baseG4AU08RowById = new Map(baseG4AU08Rows.map((row) => [row.knowledgePointId, row]));

const g5aRows = Object.freeze(listG5AU02SelectorRows().map((row) => Object.freeze(row)));
const g5aRowById = new Map(g5aRows.map((row) => [row.knowledgePointId, row]));

const g4aCanonicalKnowledgePointIds = Object.freeze([
  ...new Set(G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS.map((row) => row.primaryKnowledgePointId)),
]);
const g4aCanonicalKnowledgePointIdSet = new Set(g4aCanonicalKnowledgePointIds);

function composeG4AU08PublicRow(knowledgePointId) {
  const canonical = getCanonicalG4AU08KnowledgePoint(knowledgePointId);
  if (!canonical) return null;
  const legacy = baseG4AU08RowById.get(knowledgePointId);
  const promotionRegistryIds = [...new Set([
    ...(canonical.promotionRegistryIds ?? []),
    ...(legacy?.promotionRegistryIds ?? []),
    "s76q_g4a_u08_all_canonical_groups_public",
    "s76r_g4a_u08_full_source_production_promotion",
  ])];
  return Object.freeze({
    ...clone(canonical),
    ...clone(legacy ?? {}),
    knowledgePointId,
    sourceId: G4A_U08_SOURCE_ID,
    unitCode: canonical.unitCode ?? legacy?.unitCode ?? "4A-U08",
    unitTitle: canonical.unitTitle ?? legacy?.unitTitle ?? "整數四則",
    displayName: canonical.displayName ?? legacy?.displayName ?? knowledgePointId,
    mode: canonical.mode ?? legacy?.mode ?? "mixed",
    questionMode: canonical.questionMode ?? legacy?.questionMode ?? canonical.mode ?? "mixed",
    visibilityStatus: "visible",
    holdReason: null,
    canonicalPatternGroupIds: [...(canonical.canonicalPatternGroupIds ?? [])],
    canonicalPatternSpecIds: [...(canonical.canonicalPatternSpecIds ?? [])],
    canonicalSelectorStatus: "visible_explicit_group_selection",
    selectorStatus: "visible",
    productionUse: "preview_only_pending_s76r",
    promotionRegistryIds,
  });
}

const g4aPublicRows = Object.freeze(
  g4aCanonicalKnowledgePointIds.map(composeG4AU08PublicRow).filter(Boolean),
);
const g4aPublicRowById = new Map(g4aPublicRows.map((row) => [row.knowledgePointId, row]));

function g4aAvailability() {
  const current = base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId[G4A_U08_SOURCE_ID]
    ?? base.listBatchAKnowledgePointAvailabilityBySource(G4A_U08_SOURCE_ID)
    ?? { sourceId: G4A_U08_SOURCE_ID, visibleCount: 0, hiddenPendingCount: 0, notSelectableCount: 0 };
  return {
    ...current,
    sourceId: G4A_U08_SOURCE_ID,
    visibleCount: g4aPublicRows.length,
    compatibilityProjection: "legacy_aliases_preserved_all_canonical_rows_publicly_visible",
    canonicalReachableKnowledgePointCount: g4aPublicRows.length,
    canonicalReachableKnowledgePointIds: g4aPublicRows.map((row) => row.knowledgePointId),
    publicSelectorStatus: "15_canonical_knowledge_points_visible",
  };
}

function availabilityBySource() {
  const entries = new Map(Object.entries(base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId));
  entries.set(G4A_U08_SOURCE_ID, g4aAvailability());
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
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount
    - baseG4AU08Rows.length
    + g4aPublicRows.length
    + g5aRows.length,
  bySourceId: availabilityBySource(),
});

export function listVisibleBatchAKnowledgePoints() {
  return [
    ...baseRowsWithoutG4AU08.map(clone),
    ...g4aPublicRows.map(clone),
    ...g5aRows.map(clone),
  ];
}

export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  const entry = BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId];
  return entry ? clone(entry) : base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
}

export function getVisibleBatchAKnowledgePoint(knowledgePointId) {
  if (g5aRowById.has(knowledgePointId)) return getG5AU02SelectorRow(knowledgePointId);
  if (g4aPublicRowById.has(knowledgePointId)) return clone(g4aPublicRowById.get(knowledgePointId));
  return base.getVisibleBatchAKnowledgePoint(knowledgePointId);
}

export function getVisiblePatternGroupsForKnowledgePoint(knowledgePointId) {
  if (g5aRowById.has(knowledgePointId)) return listG5AU02SelectorPatternGroups(knowledgePointId);
  if (g4aCanonicalKnowledgePointIdSet.has(knowledgePointId)) {
    return clone(getCanonicalG4AU08PatternGroups(knowledgePointId));
  }
  return base.getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
}

export function resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId) {
  if (g5aRowById.has(knowledgePointId)) return resolveG5AU02SelectorPatternSpecIds(knowledgePointId);
  return [...new Set(getVisiblePatternGroupsForKnowledgePoint(knowledgePointId).flatMap((group) => group.patternSpecIds ?? []))];
}

export function validateG4AU08AllCanonicalPublicSelectorProjection() {
  const availability = listBatchAKnowledgePointAvailabilityBySource(G4A_U08_SOURCE_ID);
  const visibleRows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === G4A_U08_SOURCE_ID);
  const patternSpecIds = new Set(G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS.flatMap((group) => group.patternSpecIds));
  const errors = [];
  if (visibleRows.length !== 15) errors.push("knowledge_point_count_mismatch");
  if (availability.visibleCount !== 15) errors.push("availability_visible_count_mismatch");
  if (G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS.length !== 28) errors.push("pattern_group_count_mismatch");
  if (patternSpecIds.size !== 33) errors.push("pattern_spec_count_mismatch");
  if (visibleRows.some((row) => row.visibilityStatus !== "visible" || row.holdReason != null)) errors.push("knowledge_point_visibility_invalid");
  if (visibleRows.some((row) => getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId).length === 0)) errors.push("canonical_pattern_group_missing");
  if (G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS.some((group) => group.visibilityStatus !== "visible" || group.holdReason !== null)) errors.push("group_visibility_invalid");
  if (availability.canonicalReachableKnowledgePointCount !== 15) errors.push("canonical_reachable_count_mismatch");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({
      knowledgePoints: visibleRows.length,
      patternGroups: G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS.length,
      patternSpecs: patternSpecIds.size,
      globalRegistryRows: listVisibleBatchAKnowledgePoints().length,
      visibleKnowledgePoints: availability.visibleCount,
      legacyAliasKnowledgePoints: baseG4AU08Rows.length,
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
  const allRows = listVisibleBatchAKnowledgePoints();
  const expectedCount = baseRowsWithoutG4AU08.length + g4aPublicRows.length + g5aRows.length;
  const g5aIds = new Set(g5aRows.map((row) => row.knowledgePointId));
  const g4aIds = new Set(g4aPublicRows.map((row) => row.knowledgePointId));
  if (allRows.length !== expectedCount) errors.push("SELECTOR_COMPOSER_COUNT_MISMATCH");
  if (new Set(allRows.map((row) => row.knowledgePointId)).size !== allRows.length) errors.push("SELECTOR_COMPOSER_DUPLICATE_KP");
  if (g5aRows.some((row) => row.sourceId !== G5A_U02_SELECTOR_SOURCE_ID)) errors.push("SELECTOR_COMPOSER_G5A_SOURCE_MISMATCH");
  if (g4aPublicRows.some((row) => row.sourceId !== G4A_U08_SOURCE_ID)) errors.push("SELECTOR_COMPOSER_G4A_SOURCE_MISMATCH");
  if (baseRowsWithoutG4AU08.some((row) => g5aIds.has(row.knowledgePointId) || g4aIds.has(row.knowledgePointId))) errors.push("SELECTOR_COMPOSER_CROSS_PROJECTION_COLLISION");
  const g5aAvailability = listBatchAKnowledgePointAvailabilityBySource(G5A_U02_SELECTOR_SOURCE_ID);
  const g4aAvailabilityEntry = listBatchAKnowledgePointAvailabilityBySource(G4A_U08_SOURCE_ID);
  if (g5aAvailability.visibleCount !== 18 || g5aAvailability.hiddenPendingCount !== 0 || g5aAvailability.notSelectableCount !== 0) {
    errors.push("SELECTOR_COMPOSER_G5A_AVAILABILITY_MISMATCH");
  }
  if (g4aAvailabilityEntry.visibleCount !== 15) errors.push("SELECTOR_COMPOSER_G4A_AVAILABILITY_MISMATCH");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}
