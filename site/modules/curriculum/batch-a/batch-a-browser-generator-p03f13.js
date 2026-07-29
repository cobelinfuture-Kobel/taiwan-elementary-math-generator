export * from "./batch-a-browser-generator-p03f12.js";
import { buildBatchABrowserPlan as buildBasePlan } from "./batch-a-browser-generator-p03f12.js";
import { getBatchASourceUnit } from "./source-units.js";
import {
  G5A_U04_SOURCE_ID,
  G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID,
  G5A_U04_EXPAND_REDUCE_SIMPLEST_GROUP_ID,
  G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS,
  G5A_U04_QUOTIENT_CONTEXT_KP_ID,
  G5A_U04_QUOTIENT_CONTEXT_NUMERIC_GROUP_ID,
  G5A_U04_QUOTIENT_CONTEXT_APPLICATION_GROUP_ID,
  G5A_U04_QUOTIENT_CONTEXT_NUMERIC_SPEC_ID,
  G5A_U04_QUOTIENT_CONTEXT_APPLICATION_SPEC_ID,
  G5A_U04_SLICE013_PATTERN_SPEC_IDS,
} from "../registry/g5a-u04-expand-reduce-simplest-selector-projection.js";

const includes = (values, id) => Array.isArray(values) && values.includes(id);
const includesAny = (values, ids) => ids.some((id) => includes(values, id));

export function requestsP03F13(options = {}) {
  return options.sourceId === G5A_U04_SOURCE_ID && (
    includesAny(options.selectedKnowledgePointIds, [G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID, G5A_U04_QUOTIENT_CONTEXT_KP_ID])
    || includesAny(options.selectedPatternGroupIds, [G5A_U04_EXPAND_REDUCE_SIMPLEST_GROUP_ID, G5A_U04_QUOTIENT_CONTEXT_NUMERIC_GROUP_ID, G5A_U04_QUOTIENT_CONTEXT_APPLICATION_GROUP_ID])
    || includesAny(options.patternSpecIds, G5A_U04_SLICE013_PATTERN_SPEC_IDS)
    || options.selectionMode === "sourceUnit"
  );
}
export const requestsP03F13ExpandReduceSimplest = requestsP03F13;

function requestsQuotient(options = {}) {
  return includes(options.selectedKnowledgePointIds, G5A_U04_QUOTIENT_CONTEXT_KP_ID)
    || includesAny(options.selectedPatternGroupIds, [G5A_U04_QUOTIENT_CONTEXT_NUMERIC_GROUP_ID, G5A_U04_QUOTIENT_CONTEXT_APPLICATION_GROUP_ID])
    || includesAny(options.patternSpecIds, [G5A_U04_QUOTIENT_CONTEXT_NUMERIC_SPEC_ID, G5A_U04_QUOTIENT_CONTEXT_APPLICATION_SPEC_ID])
    || (options.selectionMode === "sourceUnit" && options.questionMode === "application");
}

export function buildBatchABrowserPlan(options = {}) {
  const plan = buildBasePlan(options);
  if (!requestsP03F13(options)) return plan;
  const quotient = requestsQuotient(options);
  const questionMode = quotient && options.questionMode === "application" ? "application" : "numeric";
  const patternSpecIds = quotient
    ? [questionMode === "application" ? G5A_U04_QUOTIENT_CONTEXT_APPLICATION_SPEC_ID : G5A_U04_QUOTIENT_CONTEXT_NUMERIC_SPEC_ID]
    : [...G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS];
  const requestedKnowledgePointIds = [quotient ? G5A_U04_QUOTIENT_CONTEXT_KP_ID : G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID];
  const requestedPatternGroupIds = [quotient
    ? (questionMode === "application" ? G5A_U04_QUOTIENT_CONTEXT_APPLICATION_GROUP_ID : G5A_U04_QUOTIENT_CONTEXT_NUMERIC_GROUP_ID)
    : G5A_U04_EXPAND_REDUCE_SIMPLEST_GROUP_ID];
  return {
    ...plan,
    sourceUnit: { ...getBatchASourceUnit(G5A_U04_SOURCE_ID) },
    patternSpecIds,
    allocation: null,
    questionMode,
    requestedKnowledgePointIds,
    requestedPatternGroupIds,
    publicControls: {
      sourceId: G5A_U04_SOURCE_ID,
      questionMode,
      productWave: "R05-W3",
      productAdmissionTask: "P03F_W3DirectProductVerticalSlice013Implementation",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice013Implementation",
      globalContextAuthority: questionMode === "application" ? "W02_ATOMIC_CONTEXT_BINDING" : "NOT_APPLICABLE",
    },
    publicPatternSpecInjectionUsed: false,
    genericFallbackAllowed: false,
  };
}
