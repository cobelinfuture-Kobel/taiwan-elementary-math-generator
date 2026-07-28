export * from "./batch-a-browser-generator-p03f12.js";
import { buildBatchABrowserPlan as buildBasePlan } from "./batch-a-browser-generator-p03f12.js";
import { getBatchASourceUnit } from "./source-units.js";
import {
  G5A_U04_SOURCE_ID,
  G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID,
  G5A_U04_EXPAND_REDUCE_SIMPLEST_GROUP_ID,
  G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS,
} from "../registry/g5a-u04-expand-reduce-simplest-selector-projection.js";

const includes = (values, id) => Array.isArray(values) && values.includes(id);

export function requestsP03F13ExpandReduceSimplest(options = {}) {
  return options.sourceId === G5A_U04_SOURCE_ID && (
    includes(options.selectedKnowledgePointIds, G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID)
    || includes(options.selectedPatternGroupIds, G5A_U04_EXPAND_REDUCE_SIMPLEST_GROUP_ID)
    || G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS.some((id) => includes(options.patternSpecIds, id))
    || options.selectionMode === "sourceUnit"
  );
}

export function buildBatchABrowserPlan(options = {}) {
  const plan = buildBasePlan(options);
  if (!requestsP03F13ExpandReduceSimplest(options)) return plan;
  return {
    ...plan,
    sourceUnit: { ...getBatchASourceUnit(G5A_U04_SOURCE_ID) },
    patternSpecIds: [...G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS],
    allocation: null,
    questionMode: "numeric",
    requestedKnowledgePointIds: [G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID],
    requestedPatternGroupIds: [G5A_U04_EXPAND_REDUCE_SIMPLEST_GROUP_ID],
    publicControls: {
      sourceId: G5A_U04_SOURCE_ID,
      questionMode: "numeric",
      productWave: "R05-W3",
      productAdmissionTask: "P03F_W3DirectProductVerticalSlice013Implementation",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice013Implementation",
      globalContextAuthority: "NOT_APPLICABLE",
    },
    publicPatternSpecInjectionUsed: false,
    genericFallbackAllowed: false,
  };
}
