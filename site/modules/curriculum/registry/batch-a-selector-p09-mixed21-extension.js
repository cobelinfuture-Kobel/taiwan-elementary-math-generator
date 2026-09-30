export * from "./batch-a-selector-p09-a03b-extension.js";
import * as base from "./batch-a-selector-p09-a03b-extension.js";

export const P09_MIXED21_TARGET_SOURCE_IDS = Object.freeze([
  "g3b_u10_3b10",
  "g4a_u03_4a03",
  "g4a_u05_4a05",
  "g4a_u07_4a07",
  "g4b_u05_4b05",
  "g5a_u05_5a05a",
  "g5a_u05_5a05a1",
  "g5a_u07_5a07",
  "g5a_u10_5a10a",
  "g5b_u08_5b08",
  "g5b_u11_5b11",
  "g6a_u03_6a03",
  "g6a_u05_6a05",
  "g6a_u06_6a06",
  "g6a_u07_6a07",
  "g6a_u08_6a08",
  "g6a_u09_6a09",
  "g6b_u03_6b03",
  "g6b_u04_6b04",
  "g6b_u05_6b05",
  "g6b_u06_6b06",
]);

const TARGETS = new Set(P09_MIXED21_TARGET_SOURCE_IDS);
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

function patchedAvailability(sourceId) {
  const current = base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
  if (!TARGETS.has(sourceId) || !current) return current;
  return {
    ...clone(current),
    sameUnitMixedAllowed: true,
    sameUnitMixedAdmission: "P09_UI_SAME_UNIT_MIXED21_SHARED_AGGREGATION",
    publicSelectorStatus: current.publicSelectorStatus
      ? `${current.publicSelectorStatus}+p09_mixed21`
      : "p09_mixed21_same_unit_mixed_enabled",
  };
}

const mixedAvailabilityEntries = Object.fromEntries(
  P09_MIXED21_TARGET_SOURCE_IDS.map((sourceId) => [
    sourceId,
    Object.freeze(patchedAvailability(sourceId)),
  ]),
);

export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  bySourceId: Object.freeze({
    ...(base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId ?? {}),
    ...mixedAvailabilityEntries,
  }),
});

export function listVisibleBatchAKnowledgePoints() {
  return base.listVisibleBatchAKnowledgePoints();
}

export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  if (TARGETS.has(sourceId)) return clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId]);
  return base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
}

export function getVisibleBatchAKnowledgePoint(knowledgePointId) {
  return base.getVisibleBatchAKnowledgePoint(knowledgePointId);
}

export function getVisiblePatternGroupsForKnowledgePoint(knowledgePointId) {
  return base.getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
}

export function resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId, mode = null) {
  return base.resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId, mode);
}

export function auditP09Mixed21SelectorAdmission() {
  const errors = [];
  for (const sourceId of P09_MIXED21_TARGET_SOURCE_IDS) {
    const availability = listBatchAKnowledgePointAvailabilityBySource(sourceId);
    const rows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === sourceId);
    if (!availability || availability.sameUnitMixedAllowed !== true) {
      errors.push(`P09_MIXED21_SELECTOR_ADMISSION_MISSING:${sourceId}`);
    }
    if (rows.length < 2 || rows.length !== availability?.visibleCount) {
      errors.push(`P09_MIXED21_SELECTOR_VISIBLE_COUNT_INVALID:${sourceId}`);
    }
  }
  return Object.freeze({
    ok: errors.length === 0,
    sourceCount: P09_MIXED21_TARGET_SOURCE_IDS.length,
    errors: Object.freeze(errors),
  });
}
