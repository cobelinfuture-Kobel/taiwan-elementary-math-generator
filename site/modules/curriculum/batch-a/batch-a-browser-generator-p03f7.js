export * from "./batch-a-browser-generator-p03f6.js";
import { buildBatchABrowserPlan as buildBasePlan } from "./batch-a-browser-generator-p03f6.js";
import { getBatchASourceUnit } from "./source-units.js";
import { G3B_U07_SOURCE_ID } from "../registry/g3b-u07-quotient-fraction-selector-projection.js";
import {
  G3B_U07_FRACTION_UNIT_CONVERSION_KP_ID, G3B_U07_FRACTION_UNIT_CONVERSION_NUMERIC_GROUP_ID,
  G3B_U07_FRACTION_UNIT_CONVERSION_APPLICATION_GROUP_ID, G3B_U07_FRACTION_UNIT_CONVERSION_NUMERIC_SPEC_IDS,
  G3B_U07_FRACTION_UNIT_CONVERSION_APPLICATION_SPEC_IDS,
} from "../registry/g3b-u07-fraction-unit-conversion-selector-projection.js";
const includes = (values, id) => Array.isArray(values) && values.includes(id);
export function requestsP03F7FractionUnitConversion(options = {}) {
  return options.sourceId === G3B_U07_SOURCE_ID && (includes(options.selectedKnowledgePointIds, G3B_U07_FRACTION_UNIT_CONVERSION_KP_ID) || includes(options.selectedPatternGroupIds, G3B_U07_FRACTION_UNIT_CONVERSION_NUMERIC_GROUP_ID) || includes(options.selectedPatternGroupIds, G3B_U07_FRACTION_UNIT_CONVERSION_APPLICATION_GROUP_ID));
}
export function buildBatchABrowserPlan(options = {}) {
  const plan = buildBasePlan(options);
  if (!requestsP03F7FractionUnitConversion(options)) return plan;
  const questionMode = options.questionMode === "application" ? "application" : "numeric";
  const groupId = questionMode === "application" ? G3B_U07_FRACTION_UNIT_CONVERSION_APPLICATION_GROUP_ID : G3B_U07_FRACTION_UNIT_CONVERSION_NUMERIC_GROUP_ID;
  const specIds = questionMode === "application" ? G3B_U07_FRACTION_UNIT_CONVERSION_APPLICATION_SPEC_IDS : G3B_U07_FRACTION_UNIT_CONVERSION_NUMERIC_SPEC_IDS;
  return {
    ...plan, sourceUnit: { ...getBatchASourceUnit(G3B_U07_SOURCE_ID) }, patternSpecIds: [...specIds], allocation: null,
    questionMode, requestedKnowledgePointIds: [G3B_U07_FRACTION_UNIT_CONVERSION_KP_ID], requestedPatternGroupIds: [groupId],
    publicControls: { sourceId: G3B_U07_SOURCE_ID, questionMode, productWave: "R05-W3", productAdmissionTask: "P03F_W3DirectProductVerticalSlice007Implementation", publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice007Implementation", globalContextAuthority: questionMode === "application" ? "W02_ATOMIC_CONTEXT_BINDING" : "NOT_APPLICABLE" },
    publicPatternSpecInjectionUsed: false, genericFallbackAllowed: false,
  };
}
