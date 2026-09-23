import { listG5AU02PublicKnowledgePoints } from "../batch-b/g5a-u02-public-knowledge-points.js";

export const G5A_U02_SELECTOR_SOURCE_ID = "g5a_u02_5a02";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

const rows = Object.freeze(
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

const rowById = new Map(rows.map((row) => [row.knowledgePointId, row]));
const sourceRowById = new Map(listG5AU02PublicKnowledgePoints().map((row) => [row.knowledgePointId, row]));

export const G5A_U02_SELECTOR_PROJECTION = Object.freeze({
  task: "S96J_G5A_U02_SelectorIsolation",
  sourceId: G5A_U02_SELECTOR_SOURCE_ID,
  status: "independent_projection_ready_for_shared_composer",
  visibleKnowledgePointCount: rows.length,
  visiblePatternGroupCount: rows.length,
  visiblePatternSpecCount: new Set(rows.flatMap((row) => row.patternSpecIds)).size,
  arbitraryRegeneration: true,
  genericFallback: false,
  freeFormAI: false,
  productionUse: "allowed_dynamic_knowledge_point_release",
});

export function listG5AU02SelectorRows() {
  return rows.map(clone);
}

export function getG5AU02SelectorRow(knowledgePointId) {
  return clone(rowById.get(knowledgePointId) ?? null);
}

export function listG5AU02SelectorPatternGroups(knowledgePointId) {
  const row = rowById.get(knowledgePointId);
  const sourceRow = sourceRowById.get(knowledgePointId);
  if (!row || !sourceRow) return [];
  return clone([{
    patternGroupId: sourceRow.patternGroupId,
    hiddenAuthorityGroupId: sourceRow.patternGroupId,
    sourceId: G5A_U02_SELECTOR_SOURCE_ID,
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
    promotionRole: "s96j_independent_g5a_u02_projection",
  }]);
}

export function resolveG5AU02SelectorPatternSpecIds(knowledgePointId) {
  const row = rowById.get(knowledgePointId);
  return row ? [...row.patternSpecIds] : [];
}

export function auditG5AU02SelectorProjection() {
  const errors = [];
  const ids = rows.map((row) => row.knowledgePointId);
  const patternIds = new Set(rows.flatMap((row) => row.patternSpecIds));
  if (rows.length !== 18) errors.push("G5AU02_SELECTOR_KP_COUNT_MISMATCH");
  if (new Set(ids).size !== ids.length) errors.push("G5AU02_SELECTOR_KP_DUPLICATE");
  if (patternIds.size !== 22) errors.push("G5AU02_SELECTOR_PATTERN_COVERAGE_MISMATCH");
  if (rows.some((row) => row.sourceId !== G5A_U02_SELECTOR_SOURCE_ID || !row.worksheetEligible)) {
    errors.push("G5AU02_SELECTOR_ROW_INVALID");
  }
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    knowledgePointCount: rows.length,
    patternSpecCount: patternIds.size,
  });
}
