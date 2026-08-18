export * from "./batch-a-browser-generator-p03f42.js";
import { buildBatchABrowserPlan as baseBuild } from "./batch-a-browser-generator-p03f42.js";
import { getBatchASourceUnit } from "./source-units.js";
import {
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
  resolveVisiblePatternSpecIdsForKnowledgePoint,
} from "../registry/batch-a-selector-p03f43-extension.js";
import {
  G4B_U08_P03F43_SOURCE_ID,
  P03F43_GROUP_IDS,
  P03F43_KP_IDS,
  P03F43_SPEC_IDS,
} from "../registry/g4b-u08-rank10-fraction-selector-projection-p03f43.js";

const unique = (values = []) => [...new Set(values.filter(Boolean))];
const intersects = (values, targets) => Array.isArray(values) && values.some((value) => targets.includes(value));
const sourceRows = () => listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === G4B_U08_P03F43_SOURCE_ID);
const allowedSpecIds = () => unique(sourceRows().flatMap((row) => resolveVisiblePatternSpecIdsForKnowledgePoint(row.knowledgePointId, "numeric")));
const allowedGroupIds = () => unique(sourceRows().flatMap((row) => getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId).filter((group) => group.publicQuestionMode === "numeric" || group.mode === "numeric").map((group) => group.patternGroupId)));

export function requestsP03F43(options = {}) {
  return options.sourceId === G4B_U08_P03F43_SOURCE_ID && (
    options.selectionMode === "sourceUnit"
    || intersects(options.selectedKnowledgePointIds, P03F43_KP_IDS)
    || intersects(options.patternSpecIds, P03F43_SPEC_IDS)
    || intersects(options.selectedPatternGroupIds, P03F43_GROUP_IDS)
  );
}
function resolveRequestedPatternSpecIds(options = {}) {
  const allowed = new Set(allowedSpecIds());
  const hasTarget = (ids) => ids.some((id) => P03F43_SPEC_IDS.includes(id));
  if (Array.isArray(options.patternSpecIds)) {
    const ids = unique(options.patternSpecIds.filter((id) => allowed.has(id)));
    if (ids.length && (hasTarget(ids) || options.selectionMode === "sourceUnit")) return ids;
  }
  if (Array.isArray(options.selectedPatternGroupIds) && options.selectedPatternGroupIds.length) {
    const requested = new Set(options.selectedPatternGroupIds);
    const ids = unique(sourceRows().flatMap((row) => getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId).filter((group) => requested.has(group.patternGroupId) && (group.publicQuestionMode === "numeric" || group.mode === "numeric")).flatMap((group) => group.patternSpecIds)).filter((id) => allowed.has(id)));
    if (hasTarget(ids)) return ids;
  }
  if (Array.isArray(options.selectedKnowledgePointIds) && options.selectedKnowledgePointIds.length) {
    const selected = new Set(options.selectedKnowledgePointIds);
    const ids = unique(sourceRows().filter((row) => selected.has(row.knowledgePointId)).flatMap((row) => resolveVisiblePatternSpecIdsForKnowledgePoint(row.knowledgePointId, "numeric")).filter((id) => allowed.has(id)));
    if (hasTarget(ids)) return ids;
  }
  if (options.selectionMode === "sourceUnit") return allowedSpecIds();
  return [P03F43_SPEC_IDS[0]];
}
export function buildBatchABrowserPlan(options = {}) {
  const plan = baseBuild(options);
  if (!requestsP03F43(options)) return plan;
  const rows = sourceRows();
  const rowIds = new Set(rows.map((row) => row.knowledgePointId));
  const groups = new Set(allowedGroupIds());
  const requestedKnowledgePointIds = unique((options.selectedKnowledgePointIds ?? []).filter((id) => rowIds.has(id)));
  const requestedPatternGroupIds = unique((options.selectedPatternGroupIds ?? []).filter((id) => groups.has(id)));
  const patternSpecIds = resolveRequestedPatternSpecIds(options);
  return {
    ...plan,
    sourceId: G4B_U08_P03F43_SOURCE_ID,
    sourceUnit: { ...(getBatchASourceUnit(G4B_U08_P03F43_SOURCE_ID) ?? { sourceId: G4B_U08_P03F43_SOURCE_ID, grade: 4, semester: "lower", unitCode: "4B-U08", title: "等值分數", domain: "equivalent_fraction_structure" }) },
    patternSpecIds,
    allocation: null,
    questionMode: "numeric",
    requestedKnowledgePointIds: requestedKnowledgePointIds.length ? requestedKnowledgePointIds : (options.selectionMode === "sourceUnit" ? rows.map((row) => row.knowledgePointId) : [P03F43_KP_IDS[0]]),
    requestedPatternGroupIds,
    publicControls: {
      sourceId: G4B_U08_P03F43_SOURCE_ID,
      questionMode: "numeric",
      productWave: "R05-W3",
      productAdmissionTask: "P03F_W3DirectProductVerticalSlice043Implementation",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice043Implementation",
      globalContextAuthority: "NOT_APPLICABLE_FOR_SLICE043_NUMERIC_ONLY",
    },
    publicPatternSpecInjectionUsed: false,
    genericFallbackAllowed: false,
  };
}
