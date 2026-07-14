export * from "./batch-a-selector-g4a-u08-all-canonical.js";

import * as legacy from "./batch-a-selector-g4a-u08-extension.js";
import * as canonical from "./batch-a-selector-g4a-u08-all-canonical.js";

const SOURCE_ID = "g4a_u08_4a08";
const clone = (value) => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
const CANONICAL_KP_IDS = Object.freeze([...new Set(canonical.G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS.map((row) => row.primaryKnowledgePointId))]);

export function listVisibleBatchAKnowledgePoints() {
  return clone(legacy.listVisibleBatchAKnowledgePoints());
}

export function getVisibleBatchAKnowledgePoint(knowledgePointId) {
  const legacyRow = legacy.getVisibleBatchAKnowledgePoint(knowledgePointId);
  if (legacyRow) return clone(legacyRow);
  if (CANONICAL_KP_IDS.includes(knowledgePointId)) return clone(canonical.getVisibleBatchAKnowledgePoint(knowledgePointId));
  return null;
}

export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  const availability = legacy.listBatchAKnowledgePointAvailabilityBySource(sourceId);
  if (sourceId !== SOURCE_ID) return availability;
  return {
    ...availability,
    compatibilityProjection: "legacy_source_availability_preserved_canonical_rows_resolvable_by_id",
    canonicalReachableKnowledgePointCount: CANONICAL_KP_IDS.length,
    canonicalReachableKnowledgePointIds: [...CANONICAL_KP_IDS],
  };
}

export function getVisiblePatternGroupsForKnowledgePoint(knowledgePointId) {
  const legacyGroups = legacy.getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
  if (legacyGroups.length > 0) return clone(legacyGroups);
  if (CANONICAL_KP_IDS.includes(knowledgePointId)) return clone(canonical.getVisiblePatternGroupsForKnowledgePoint(knowledgePointId));
  return [];
}

export function resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId) {
  return [...new Set(getVisiblePatternGroupsForKnowledgePoint(knowledgePointId).flatMap((group) => group.patternSpecIds ?? []))];
}

export function validateG4AU08AllCanonicalPublicSelectorProjection() {
  const groups = canonical.G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS;
  const specs = new Set(groups.flatMap((group) => group.patternSpecIds));
  const globalRows = listVisibleBatchAKnowledgePoints();
  const legacyGlobalRows = legacy.listVisibleBatchAKnowledgePoints();
  const legacyAvailability = legacy.listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID);
  const errors = [];
  if (CANONICAL_KP_IDS.length !== 15) errors.push("knowledge_point_count_mismatch");
  if (groups.length !== 28) errors.push("pattern_group_count_mismatch");
  if (specs.size !== 33) errors.push("pattern_spec_count_mismatch");
  if (globalRows.length !== legacyGlobalRows.length) errors.push("global_registry_cardinality_changed");
  if (listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID).visibleCount !== legacyAvailability.visibleCount) errors.push("legacy_source_availability_changed");
  if (groups.some((group) => group.visibilityStatus !== "visible" || group.holdReason !== null)) errors.push("group_visibility_invalid");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({ knowledgePoints: 15, patternGroups: 28, patternSpecs: 33, globalRegistryRows: globalRows.length, legacyVisibleKnowledgePoints: legacyAvailability.visibleCount }),
  });
}
