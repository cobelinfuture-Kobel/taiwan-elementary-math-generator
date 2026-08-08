export * from "./batch-a-browser-generator-p03f28.js";
import { buildBatchABrowserPlan as baseBuild } from "./batch-a-browser-generator-p03f28.js";
import { getBatchASourceUnit } from "./source-units.js";
import {
  G5A_U04_P03F29_GROUP_ID,
  G5A_U04_P03F29_KP_ID,
  G5A_U04_P03F29_SOURCE_ID,
  G5A_U04_P03F29_SPEC_ID,
} from "../registry/g5a-u04-rank8-fraction-selector-projection-p03f29.js";

const has = (values, id) => Array.isArray(values) && values.includes(id);

export function requestsP03F29(options = {}) {
  return options.sourceId === G5A_U04_P03F29_SOURCE_ID && (
    has(options.selectedKnowledgePointIds, G5A_U04_P03F29_KP_ID)
    || has(options.selectedPatternGroupIds, G5A_U04_P03F29_GROUP_ID)
    || has(options.patternSpecIds, G5A_U04_P03F29_SPEC_ID)
  );
}

export function buildBatchABrowserPlan(options = {}) {
  const plan = baseBuild(options);
  if (!requestsP03F29(options)) return plan;
  return {
    ...plan,
    sourceId: G5A_U04_P03F29_SOURCE_ID,
    sourceUnit: { ...getBatchASourceUnit(G5A_U04_P03F29_SOURCE_ID) },
    patternSpecIds: [G5A_U04_P03F29_SPEC_ID],
    allocation: null,
    questionMode: "numeric",
    requestedKnowledgePointIds: [G5A_U04_P03F29_KP_ID],
    requestedPatternGroupIds: [G5A_U04_P03F29_GROUP_ID],
    publicControls: {
      sourceId: G5A_U04_P03F29_SOURCE_ID,
      questionMode: "numeric",
      productWave: "R05-W3",
      productAdmissionTask: "P03F_W3DirectProductVerticalSlice029Implementation",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice029Implementation",
      globalContextAuthority: "HIDDEN_APPLICATION_SURFACE_NOT_ADMITTED",
    },
    publicPatternSpecInjectionUsed: false,
    genericFallbackAllowed: false,
  };
}
