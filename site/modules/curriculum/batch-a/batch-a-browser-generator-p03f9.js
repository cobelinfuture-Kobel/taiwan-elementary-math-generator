export * from "./batch-a-browser-generator-p03f8.js";
import { buildBatchABrowserPlan as buildBasePlan } from "./batch-a-browser-generator-p03f8.js";
import { getBatchASourceUnit } from "./source-units.js";
import {
  G3B_U09_SOURCE_ID,
  G3B_U09_TENTHS_FRACTION_DECIMAL_KP_ID,
  G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_GROUP_ID,
  G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_SPEC_ID,
} from "../registry/g3b-u09-tenths-fraction-decimal-selector-projection.js";

const includes = (values, id) => Array.isArray(values) && values.includes(id);
export function requestsP03F9TenthsFractionDecimal(options = {}) {
  return options.sourceId === G3B_U09_SOURCE_ID && (
    includes(options.selectedKnowledgePointIds, G3B_U09_TENTHS_FRACTION_DECIMAL_KP_ID)
    || includes(options.selectedPatternGroupIds, G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_GROUP_ID)
    || includes(options.patternSpecIds, G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_SPEC_ID)
  );
}

export function buildBatchABrowserPlan(options = {}) {
  const plan = buildBasePlan(options);
  if (!requestsP03F9TenthsFractionDecimal(options)) return plan;
  return {
    ...plan,
    sourceUnit: { ...getBatchASourceUnit(G3B_U09_SOURCE_ID) },
    patternSpecIds: [G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_SPEC_ID],
    allocation: null,
    questionMode: "numeric",
    requestedKnowledgePointIds: [G3B_U09_TENTHS_FRACTION_DECIMAL_KP_ID],
    requestedPatternGroupIds: [G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_GROUP_ID],
    publicControls: {
      sourceId: G3B_U09_SOURCE_ID,
      questionMode: "numeric",
      productWave: "R05-W3",
      productAdmissionTask: "P03F_W3DirectProductVerticalSlice009Implementation",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice009Implementation",
      globalContextAuthority: "NOT_APPLICABLE",
    },
    publicPatternSpecInjectionUsed: false,
    genericFallbackAllowed: false,
  };
}
