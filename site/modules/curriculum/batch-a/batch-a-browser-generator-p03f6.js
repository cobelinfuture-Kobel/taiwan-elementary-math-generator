
export * from "./batch-a-browser-generator-p03f5.js";
import { buildBatchABrowserPlan as buildBasePlan } from "./batch-a-browser-generator-p03f5.js";
import { getBatchASourceUnit } from "./source-units.js";
import { G3A_U08_SOURCE_ID } from "../registry/g3a-u08-part-whole-fraction-selector-projection.js";
import {
  G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID,
  G3A_U08_SAME_DENOMINATOR_NUMERIC_GROUP_ID,
  G3A_U08_SAME_DENOMINATOR_APPLICATION_GROUP_ID,
  G3A_U08_SAME_DENOMINATOR_NUMERIC_SPEC_ID,
  G3A_U08_SAME_DENOMINATOR_APPLICATION_SPEC_ID,
} from "../registry/g3a-u08-same-denominator-compare-selector-projection.js";

const includes = (values, id) => Array.isArray(values) && values.includes(id);
export function requestsP03F6SameDenominatorCompare(options = {}) {
  return options.sourceId === G3A_U08_SOURCE_ID && (
    includes(options.selectedKnowledgePointIds, G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID)
    || includes(options.selectedPatternGroupIds, G3A_U08_SAME_DENOMINATOR_NUMERIC_GROUP_ID)
    || includes(options.selectedPatternGroupIds, G3A_U08_SAME_DENOMINATOR_APPLICATION_GROUP_ID)
  );
}
export function buildBatchABrowserPlan(options = {}) {
  const plan = buildBasePlan(options);
  if (!requestsP03F6SameDenominatorCompare(options)) return plan;
  const questionMode = options.questionMode === "application" ? "application" : "numeric";
  const groupId = questionMode === "application" ? G3A_U08_SAME_DENOMINATOR_APPLICATION_GROUP_ID : G3A_U08_SAME_DENOMINATOR_NUMERIC_GROUP_ID;
  const specId = questionMode === "application" ? G3A_U08_SAME_DENOMINATOR_APPLICATION_SPEC_ID : G3A_U08_SAME_DENOMINATOR_NUMERIC_SPEC_ID;
  return {
    ...plan, sourceUnit: { ...getBatchASourceUnit(G3A_U08_SOURCE_ID) }, patternSpecIds: [specId], allocation: null,
    questionMode, requestedKnowledgePointIds: [G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID], requestedPatternGroupIds: [groupId],
    publicControls: { sourceId: G3A_U08_SOURCE_ID, questionMode, productWave: "R05-W3", productAdmissionTask: "P03F_W3DirectProductVerticalSlice006Implementation", publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice006Implementation", globalContextAuthority: questionMode === "application" ? "W02_ATOMIC_CONTEXT_BINDING" : "NOT_APPLICABLE" },
    publicPatternSpecInjectionUsed: false, genericFallbackAllowed: false,
  };
}
