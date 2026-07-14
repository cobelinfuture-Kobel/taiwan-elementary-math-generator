export * from "./batch-a-selector-g4a-u08-extension.js";

import * as base from "./batch-a-selector-g4a-u08-extension.js";
import { listG5AU02PublicKnowledgePoints } from "../batch-b/g5a-u02-public-knowledge-points.js";

const SOURCE_ID = "g5a_u02_5a02";
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

const visibleKnowledgePoints = Object.freeze(
  listG5AU02PublicKnowledgePoints().map((row) => Object.freeze({
    knowledgePointId: row.knowledgePointId,
    sourceId: row.sourceId,
    unitCode: row.unitCode,
    unitTitle: row.unitTitle,
    displayName: row.displayName,
    displayOrder: row.displayOrder,
    supportClass: row.implementationClasses.join("+"),
    mode: row.modes[0] ?? "concept",
    publicQuestionMode: row.modes.includes("application") || row.modes.includes("reasoning_application")
      ? "application"
      : "numeric",
    representationTag: "canonical_g5a_u02",
    representationTags: Object.freeze(["canonical_g5a_u02", ...row.modes]),
    subskillTags: Object.freeze([...row.modes]),
    patternGroupIds: Object.freeze([row.patternGroupId]),
    patternSpecIds: Object.freeze([...row.patternSpecIds]),
    answerModelIds: Object.freeze([...row.answerModelIds]),
    visibilityStatus: "visible",
    holdReason: null,
    worksheetEligible: true,
    arbitraryRegenerationEligible: true,
    selectorStatus: "visible_s96e",
  })),
);

const rowById = new Map(visibleKnowledgePoints.map((row) => [row.knowledgePointId, row]));

export const G5A_U02_VISIBLE_SELECTOR_PROJECTION = Object.freeze({
  task: "S96E_G5A_U02_KnowledgePointSelector",
  sourceId: SOURCE_ID,
  status: "18_knowledge_points_visible",
  visibleKnowledgePointCount: visibleKnowledgePoints.length,
  visiblePatternGroupCount: visibleKnowledgePoints.length,
  visiblePatternSpecCount: new Set(visibleKnowledgePoints.flatMap((row) => row.patternSpecIds)).size,
  arbitraryRegeneration: true,
  genericFallback: false,
  freeFormAI: false,
  productionUse: "forbidden_until_s96g_stress_pass",
});

export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = base.BATCH_A_SELECTOR_AVAILABILITY;

export function listVisibleBatchAKnowledgePoints() {
  return clone([...base.listVisibleBatchAKnowledgePoints(), ...visibleKnowledgePoints]);
}

export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  if (sourceId !== SOURCE_ID) return base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
  return Object.freeze({
    sourceId: SOURCE_ID,
    visibleCount: visibleKnowledgePoints.length,
    selectableCount: visibleKnowledgePoints.length,
    builtButHiddenCount: 0,
    unavailableCount: 0,
    totalCount: visibleKnowledgePoints.length,
  });
}

export function getVisibleBatchAKnowledgePoint(knowledgePointId) {
  return clone(rowById.get(knowledgePointId) ?? base.getVisibleBatchAKnowledgePoint(knowledgePointId));
}

export function getVisiblePatternGroupsForKnowledgePoint(knowledgePointId) {
  const row = rowById.get(knowledgePointId);
  if (!row) return base.getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
  return clone(row.patternGroupIds.map((patternGroupId) => ({
    patternGroupId,
    sourceId: SOURCE_ID,
    unitCode: row.unitCode,
    unitTitle: row.unitTitle,
    displayName: row.displayName,
    primaryKnowledgePointId: row.knowledgePointId,
    knowledgePointIds: [row.knowledgePointId],
    supportClass: row.supportClass,
    mode: row.mode,
    publicQuestionMode: row.publicQuestionMode,
    representationTag: row.representationTag,
    representationTags: row.representationTags,
    patternSpecIds: row.patternSpecIds,
    allocationPolicy: "balanced_by_pattern_spec",
    visibilityStatus: "visible",
    holdReason: null,
  })));
}

export function resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId) {
  const row = rowById.get(knowledgePointId);
  return row ? [...row.patternSpecIds] : base.resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId);
}

export function validateG5AU02VisibleSelectorProjection() {
  const errors = [];
  const ids = visibleKnowledgePoints.map((row) => row.knowledgePointId);
  const patternIds = new Set(visibleKnowledgePoints.flatMap((row) => row.patternSpecIds));
  if (visibleKnowledgePoints.length !== 18) errors.push("G5AU02_SELECTOR_KP_COUNT_MISMATCH");
  if (new Set(ids).size !== ids.length) errors.push("G5AU02_SELECTOR_KP_DUPLICATE");
  if (patternIds.size !== 22) errors.push("G5AU02_SELECTOR_PATTERN_COVERAGE_MISMATCH");
  if (visibleKnowledgePoints.some((row) => row.sourceId !== SOURCE_ID || row.visibilityStatus !== "visible" || !row.worksheetEligible)) {
    errors.push("G5AU02_SELECTOR_ROW_INVALID");
  }
  const availability = listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID);
  if (availability.selectableCount !== 18 || availability.totalCount !== 18) errors.push("G5AU02_SELECTOR_AVAILABILITY_MISMATCH");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), knowledgePointCount: 18, patternSpecCount: 22 });
}
