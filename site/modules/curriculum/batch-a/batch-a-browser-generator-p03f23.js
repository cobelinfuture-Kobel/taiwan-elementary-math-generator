export * from "./batch-a-browser-generator-p03f22.js";
import { buildBatchABrowserPlan as baseBuild } from "./batch-a-browser-generator-p03f22.js";
import { G6A_U02_SOURCE_ID, G6A_U02_RECIPROCAL_KP_ID, G6A_U02_RECIPROCAL_GROUP_ID, G6A_U02_RECIPROCAL_SPEC_IDS } from "../registry/g6a-u02-reciprocal-selector-projection.js";
const hasAny = (values, candidates) => Array.isArray(values) && values.some((value) => candidates.includes(value));
export function requestsP03F23(options = {}) { return options.sourceId === G6A_U02_SOURCE_ID && (hasAny(options.selectedKnowledgePointIds, [G6A_U02_RECIPROCAL_KP_ID]) || hasAny(options.selectedPatternGroupIds, [G6A_U02_RECIPROCAL_GROUP_ID]) || hasAny(options.patternSpecIds, G6A_U02_RECIPROCAL_SPEC_IDS) || (!options.selectedKnowledgePointIds?.length && !options.selectedPatternGroupIds?.length && !options.patternSpecIds?.length)); }
export function buildBatchABrowserPlan(options = {}) {
  const plan = baseBuild(options); if (!requestsP03F23(options)) return plan;
  return { ...plan, sourceId: G6A_U02_SOURCE_ID, patternSpecIds: [...G6A_U02_RECIPROCAL_SPEC_IDS], questionMode: "numeric",
    requestedKnowledgePointIds: [G6A_U02_RECIPROCAL_KP_ID], requestedPatternGroupIds: [G6A_U02_RECIPROCAL_GROUP_ID],
    allocation: null, publicControls: { sourceId: G6A_U02_SOURCE_ID, questionMode: "numeric", productWave: "R05-W3",
      productAdmissionTask: "P03F_W3DirectProductVerticalSlice023Implementation", publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice023Implementation", globalContextAuthority: "NOT_ADMITTED_FOR_SLICE023" },
    publicPatternSpecInjectionUsed: false, genericFallbackAllowed: false };
}
