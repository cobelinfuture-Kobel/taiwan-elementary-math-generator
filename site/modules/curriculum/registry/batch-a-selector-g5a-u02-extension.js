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
    canonicalSkillTag: row.patternGroupId,
    subskillTags: Object.freeze([...row.modes]),
    difficultyTags: Object.freeze(["g5a_u02", "factor_common_factor"]),
    representationTags: Object.freeze(["canonical_g5a_u02", ...row.modes]),
    publicQuestionModes: Object.freeze([...row.modes]),
    patternGroupIds: Object.freeze([row.patternGroupId]),
    patternSpecIds: Object.freeze([...row.patternSpecIds]),
    answerModelIds: Object.freeze([...row.answerModelIds]),
    qaStatusLabel: "blocking_validator_accepted",
    visibilityStatus: "visible",
    holdReason: null,
    worksheetEligible: true,
    arbitraryRegenerationEligible: true,
    selectorStatus: "public_dynamic_production",
  })),
);

const rowById = new Map(visibleKnowledgePoints.map((row) => [row.knowledgePointId, row]));

function availabilityBySource() {
  const entries = new Map(Object.entries(base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId));
  const current = entries.get(SOURCE_ID) ?? {
    sourceId: SOURCE_ID,
    visibleCount: 0,
    hiddenPendingCount: 0,
    notSelectableCount: 0,
  };
  entries.set(SOURCE_ID, {
    ...current,
    visibleCount: current.visibleCount + visibleKnowledgePoints.length,
  });
  return Object.fromEntries(entries);
}

export const G5A_U02_VISIBLE_SELECTOR_PROJECTION = Object.freeze({
  task: "S96H_G5A_U02_ProductionPromotionAndCloseout",
  sourceId: SOURCE_ID,
  status: "18_knowledge_points_dynamic_production",
  visibleKnowledgePointCount: visibleKnowledgePoints.length,
  visiblePatternGroupCount: visibleKnowledgePoints.length,
  visiblePatternSpecCount: new Set(visibleKnowledgePoints.flatMap((row) => row.patternSpecIds)).size,
  arbitraryRegeneration: true,
  genericFallback: false,
  freeFormAI: false,
  htmlPdfStressStatus: "s96g_passed",
  productionUse: "allowed_dynamic_knowledge_point_release",
});

export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + visibleKnowledgePoints.length,
  bySourceId: availabilityBySource(),
});

export function listVisibleBatchAKnowledgePoints() {
  return [...base.listVisibleBatchAKnowledgePoints(), ...visibleKnowledgePoints.map(clone)];
}

export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  const entry = BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId];
  return entry ? clone(entry) : base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
}

export function getVisibleBatchAKnowledgePoint(knowledgePointId) {
  return rowById.has(knowledgePointId)
    ? clone(rowById.get(knowledgePointId))
    : base.getVisibleBatchAKnowledgePoint(knowledgePointId);
}

export function getVisiblePatternGroupsForKnowledgePoint(knowledgePointId) {
  const row = rowById.get(knowledgePointId);
  if (!row) return base.getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
  const sourceRow = listG5AU02PublicKnowledgePoints().find((candidate) => candidate.knowledgePointId === knowledgePointId);
  return clone([{
    patternGroupId: sourceRow.patternGroupId,
    hiddenAuthorityGroupId: sourceRow.patternGroupId,
    sourceId: SOURCE_ID,
    unitCode: row.unitCode,
    unitTitle: row.unitTitle,
    displayName: row.displayName,
    primaryKnowledgePointId: row.knowledgePointId,
    knowledgePointIds: [row.knowledgePointId],
    supportClass: row.supportClass,
    mode: sourceRow.modes[0] ?? "concept",
    publicQuestionMode: sourceRow.modes[0] ?? "concept",
    implementationClasses: sourceRow.implementationClasses,
    representationTag: "canonical_g5a_u02",
    representationTags: row.representationTags,
    allowedDepths: sourceRow.implementationClasses.includes("D") ? ["S"] : ["N"],
    contextTypes: sourceRow.implementationClasses.includes("D") ? ["controlled_source_context"] : [],
    patternSpecIds: row.patternSpecIds,
    allocationPolicy: "balanced_by_pattern_spec",
    visibilityStatus: "visible",
    holdReason: null,
    promotionRole: "s96h_public_dynamic_knowledge_point",
  }]);
}

export function resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId) {
  const row = rowById.get(knowledgePointId);
  return row ? [...row.patternSpecIds] : base.resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId);
}

export function validateG5AU02VisibleSelectorProjection() {
  const errors = [];
  const baseIds = base.listVisibleBatchAKnowledgePoints().map((row) => row.knowledgePointId);
  const ids = visibleKnowledgePoints.map((row) => row.knowledgePointId);
  const patternIds = new Set(visibleKnowledgePoints.flatMap((row) => row.patternSpecIds));
  if (visibleKnowledgePoints.length !== 18) errors.push("G5AU02_SELECTOR_KP_COUNT_MISMATCH");
  if (new Set([...baseIds, ...ids]).size !== baseIds.length + ids.length) errors.push("G5AU02_SELECTOR_KP_DUPLICATE");
  if (patternIds.size !== 22) errors.push("G5AU02_SELECTOR_PATTERN_COVERAGE_MISMATCH");
  if (visibleKnowledgePoints.some((row) => row.sourceId !== SOURCE_ID || row.visibilityStatus !== "visible" || !row.worksheetEligible)) {
    errors.push("G5AU02_SELECTOR_ROW_INVALID");
  }
  const availability = listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID);
  if (availability.visibleCount !== 18 || availability.hiddenPendingCount !== 0 || availability.notSelectableCount !== 0) {
    errors.push("G5AU02_SELECTOR_AVAILABILITY_MISMATCH");
  }
  if (G5A_U02_VISIBLE_SELECTOR_PROJECTION.productionUse !== "allowed_dynamic_knowledge_point_release") {
    errors.push("G5AU02_SELECTOR_PRODUCTION_NOT_PROMOTED");
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), knowledgePointCount: 18, patternSpecCount: 22 });
}
