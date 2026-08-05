export * from "./batch-a-browser-generator-p03f23.js";
import { buildBatchABrowserPlan as baseBuild } from "./batch-a-browser-generator-p03f23.js";
import { G3B_U07_SOURCE_ID } from "../registry/g3b-u07-quotient-fraction-selector-projection.js";
import {
  G3B_U07_P03F24_KP_IDS,
  G3B_U07_P03F24_PATTERN_GROUPS,
  G3B_U07_P03F24_PATTERN_SPEC_IDS,
  resolveG3BU07P03F24PatternSpecIds,
} from "../registry/g3b-u07-fraction-context-selector-projection-p03f24.js";

const groupIds = Object.freeze(G3B_U07_P03F24_PATTERN_GROUPS.map((group) => group.patternGroupId));
const hasAny = (values, candidates) => Array.isArray(values) && values.some((value) => candidates.includes(value));
export function requestsP03F24(options = {}) {
  return options.sourceId === G3B_U07_SOURCE_ID && (
    hasAny(options.selectedKnowledgePointIds, G3B_U07_P03F24_KP_IDS)
    || hasAny(options.selectedPatternGroupIds, groupIds)
    || hasAny(options.patternSpecIds, G3B_U07_P03F24_PATTERN_SPEC_IDS)
  );
}

function resolveRequestedPatternSpecIds(options) {
  if (Array.isArray(options.patternSpecIds) && options.patternSpecIds.length) return options.patternSpecIds.filter((id) => G3B_U07_P03F24_PATTERN_SPEC_IDS.includes(id));
  if (Array.isArray(options.selectedPatternGroupIds) && options.selectedPatternGroupIds.length) {
    return G3B_U07_P03F24_PATTERN_GROUPS.filter((group) => options.selectedPatternGroupIds.includes(group.patternGroupId)).flatMap((group) => group.patternSpecIds);
  }
  if (Array.isArray(options.selectedKnowledgePointIds) && options.selectedKnowledgePointIds.length) {
    return options.selectedKnowledgePointIds.filter((id) => G3B_U07_P03F24_KP_IDS.includes(id)).flatMap((id) => resolveG3BU07P03F24PatternSpecIds(id, options.questionMode ?? null));
  }
  return [];
}

export function buildBatchABrowserPlan(options = {}) {
  const plan = baseBuild(options);
  if (!requestsP03F24(options)) return plan;
  const patternSpecIds = [...new Set(resolveRequestedPatternSpecIds(options))];
  const selectedKnowledgePointIds = (options.selectedKnowledgePointIds ?? []).filter((id) => G3B_U07_P03F24_KP_IDS.includes(id));
  const selectedPatternGroupIds = (options.selectedPatternGroupIds ?? []).filter((id) => groupIds.includes(id));
  const modes = new Set(patternSpecIds.map((id) => id.endsWith("_application") ? "application" : "numeric"));
  const questionMode = modes.size === 1 ? [...modes][0] : (options.questionMode ?? "mixed");
  return {
    ...plan,
    sourceId: G3B_U07_SOURCE_ID,
    patternSpecIds,
    questionMode,
    requestedKnowledgePointIds: selectedKnowledgePointIds,
    requestedPatternGroupIds: selectedPatternGroupIds,
    allocation: null,
    publicControls: {
      sourceId: G3B_U07_SOURCE_ID,
      questionMode,
      productWave: "R05-W3",
      productAdmissionTask: "P03F_W3DirectProductVerticalSlice024Implementation",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice024Implementation",
      globalContextAuthority: patternSpecIds.some((id) => id.endsWith("_application")) ? "W02_A06_EXISTING_PRODUCTION_EQUIVALENT_LINEAGE" : "NOT_REQUIRED",
    },
    publicPatternSpecInjectionUsed: false,
    genericFallbackAllowed: false,
  };
}
