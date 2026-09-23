export * from "./batch-a-browser-generator-p03f30.js";
import { buildBatchABrowserPlan as baseBuild } from "./batch-a-browser-generator-p03f30.js";
import { getBatchASourceUnit } from "./source-units.js";
import {
  G5B_U04_P03F31_GROUP_ID,
  G5B_U04_P03F31_KP_ID,
  G5B_U04_P03F31_SOURCE_ID,
  G5B_U04_P03F31_SPEC_ID,
} from "../registry/g5b-u04-rank8-decimal-times-integer-selector-projection-p03f31.js";

const unique = (values) => [...new Set((Array.isArray(values) ? values : []).filter(Boolean))];
export function requestsP03F31(options = {}) {
  if (options.sourceId !== G5B_U04_P03F31_SOURCE_ID) return false;
  return options.selectionMode === "sourceUnit"
    || unique(options.selectedKnowledgePointIds).includes(G5B_U04_P03F31_KP_ID)
    || unique(options.selectedPatternGroupIds).includes(G5B_U04_P03F31_GROUP_ID)
    || unique(options.patternSpecIds).includes(G5B_U04_P03F31_SPEC_ID)
    || (!options.selectedKnowledgePointIds && !options.selectedPatternGroupIds && !options.patternSpecIds);
}

export function buildBatchABrowserPlan(options = {}) {
  const plan = baseBuild(options);
  if (!requestsP03F31(options)) return plan;
  return {
    ...plan,
    sourceId: G5B_U04_P03F31_SOURCE_ID,
    sourceUnit: { ...(getBatchASourceUnit(G5B_U04_P03F31_SOURCE_ID) ?? { sourceId: G5B_U04_P03F31_SOURCE_ID, grade: 5, semester: "lower", unitCode: "5B-U04", title: "小數的乘法", domain: "decimal_multiplication" }) },
    patternSpecIds: [G5B_U04_P03F31_SPEC_ID],
    allocation: null,
    questionMode: "numeric",
    requestedKnowledgePointIds: [G5B_U04_P03F31_KP_ID],
    requestedPatternGroupIds: [G5B_U04_P03F31_GROUP_ID],
    publicControls: {
      sourceId: G5B_U04_P03F31_SOURCE_ID,
      questionMode: "numeric",
      productWave: "R05-W3",
      productAdmissionTask: "P03F_W3DirectProductVerticalSlice031Implementation",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice031Implementation",
      globalContextAuthority: "FUTURE_APPLICATION_QUEUE_NOT_ADMITTED",
    },
    publicPatternSpecInjectionUsed: false,
    genericFallbackAllowed: false,
  };
}
