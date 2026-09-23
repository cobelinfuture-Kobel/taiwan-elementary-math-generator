export * from "./batch-a-browser-generator-p03f21.js";
import { buildBatchABrowserPlan as baseBuild } from "./batch-a-browser-generator-p03f21.js";
import {
  G5A_U04_SOURCE_ID, G5A_U04_SLICE022_KP_IDS,
  G5A_U04_COMMON_DENOMINATOR_GROUP_ID, G5A_U04_DIVISIBILITY_REDUCTION_GROUP_ID,
  G5A_U04_COMMON_DENOMINATOR_SPEC_IDS, G5A_U04_DIVISIBILITY_REDUCTION_SPEC_IDS,
} from "../registry/g5a-u04-rank7-fraction-selector-projection.js";

const GROUP_IDS = Object.freeze([G5A_U04_COMMON_DENOMINATOR_GROUP_ID, G5A_U04_DIVISIBILITY_REDUCTION_GROUP_ID]);
const hasAny = (values, candidates) => Array.isArray(values) && values.some((value) => candidates.includes(value));
export function requestsP03F22(options = {}) {
  return options.sourceId === G5A_U04_SOURCE_ID
    && (hasAny(options.selectedKnowledgePointIds, G5A_U04_SLICE022_KP_IDS)
      || hasAny(options.selectedPatternGroupIds, GROUP_IDS)
      || hasAny(options.patternSpecIds, [...G5A_U04_COMMON_DENOMINATOR_SPEC_IDS, ...G5A_U04_DIVISIBILITY_REDUCTION_SPEC_IDS]));
}
export function buildBatchABrowserPlan(options = {}) {
  const plan = baseBuild(options);
  if (!requestsP03F22(options)) return plan;
  const requestedKnowledgePointIds = G5A_U04_SLICE022_KP_IDS.filter((id) => options.selectedKnowledgePointIds?.includes(id));
  const effectiveKnowledgePointIds = requestedKnowledgePointIds.length ? requestedKnowledgePointIds : [...G5A_U04_SLICE022_KP_IDS];
  const requestedPatternGroupIds = GROUP_IDS.filter((id) => options.selectedPatternGroupIds?.includes(id));
  const effectivePatternGroupIds = requestedPatternGroupIds.length ? requestedPatternGroupIds : GROUP_IDS.filter((id, index) => effectiveKnowledgePointIds.includes(G5A_U04_SLICE022_KP_IDS[index]));
  const patternSpecIds = [
    ...(effectivePatternGroupIds.includes(G5A_U04_COMMON_DENOMINATOR_GROUP_ID) ? G5A_U04_COMMON_DENOMINATOR_SPEC_IDS : []),
    ...(effectivePatternGroupIds.includes(G5A_U04_DIVISIBILITY_REDUCTION_GROUP_ID) ? G5A_U04_DIVISIBILITY_REDUCTION_SPEC_IDS : []),
  ];
  return { ...plan, sourceId: G5A_U04_SOURCE_ID, patternSpecIds, questionMode: "numeric",
    requestedKnowledgePointIds: effectiveKnowledgePointIds, requestedPatternGroupIds: effectivePatternGroupIds,
    allocation: null, publicControls: { sourceId: G5A_U04_SOURCE_ID, questionMode: "numeric", productWave: "R05-W3",
      productAdmissionTask: "P03F_W3DirectProductVerticalSlice022Implementation",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice022Implementation", globalContextAuthority: "NOT_APPLICABLE" },
    publicPatternSpecInjectionUsed: false, genericFallbackAllowed: false };
}
