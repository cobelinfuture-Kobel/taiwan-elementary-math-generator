export * from "./batch-a-browser-generator-p03f13.js";
import { buildBatchABrowserPlan as buildBasePlan } from "./batch-a-browser-generator-p03f13.js";
import { getBatchASourceUnit } from "./source-units.js";
import {
  G5B_U05_DECIMAL_BASE10_SOURCE_ID,
  G5B_U05_DECIMAL_BASE10_KP_ID,
  G5B_U05_DECIMAL_BASE10_GROUP_ID,
  G5B_U05_DECIMAL_BASE10_PATTERN_SPEC_IDS,
} from "../registry/g5b-u05-decimal-base10-selector-projection.js";

const includes = (values, id) => Array.isArray(values) && values.includes(id);
const includesAny = (values, ids) => ids.some((id) => includes(values, id));

export function requestsP03F14(options = {}) {
  return options.sourceId === G5B_U05_DECIMAL_BASE10_SOURCE_ID && (
    includes(options.selectedKnowledgePointIds, G5B_U05_DECIMAL_BASE10_KP_ID)
    || includes(options.selectedPatternGroupIds, G5B_U05_DECIMAL_BASE10_GROUP_ID)
    || includesAny(options.patternSpecIds, G5B_U05_DECIMAL_BASE10_PATTERN_SPEC_IDS)
  );
}

export function buildBatchABrowserPlan(options = {}) {
  const plan = buildBasePlan(options);
  if (!requestsP03F14(options)) return plan;
  return {
    ...plan,
    sourceUnit: { ...getBatchASourceUnit(G5B_U05_DECIMAL_BASE10_SOURCE_ID) },
    patternSpecIds: [...G5B_U05_DECIMAL_BASE10_PATTERN_SPEC_IDS],
    allocation: null,
    questionMode: "numeric",
    requestedKnowledgePointIds: [G5B_U05_DECIMAL_BASE10_KP_ID],
    requestedPatternGroupIds: [G5B_U05_DECIMAL_BASE10_GROUP_ID],
    publicControls: {
      sourceId: G5B_U05_DECIMAL_BASE10_SOURCE_ID,
      questionMode: "numeric",
      productWave: "R05-W3",
      productAdmissionTask: "P03F_W3DirectProductVerticalSlice014Implementation",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice014Implementation",
      globalContextAuthority: "NOT_APPLICABLE",
    },
    publicPatternSpecInjectionUsed: false,
    genericFallbackAllowed: false,
  };
}
