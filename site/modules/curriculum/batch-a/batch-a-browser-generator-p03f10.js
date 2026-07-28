export * from "./batch-a-browser-generator-p03f9.js";
import { buildBatchABrowserPlan as buildBasePlan } from "./batch-a-browser-generator-p03f9.js";
import { getBatchASourceUnit } from "./source-units.js";
import {
  G4A_U09_SOURCE_ID,
  G4A_U09_HUNDREDTH_DECIMAL_KP_ID,
  G4A_U09_HUNDREDTH_DECIMAL_PATTERN_GROUP_ID,
  G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID,
} from "../registry/g4a-u09-hundredth-decimal-selector-projection.js";

const includes = (values, id) => Array.isArray(values) && values.includes(id);
export function requestsP03F10HundredthDecimal(options = {}) {
  return options.sourceId === G4A_U09_SOURCE_ID && (
    includes(options.selectedKnowledgePointIds, G4A_U09_HUNDREDTH_DECIMAL_KP_ID)
    || includes(options.selectedPatternGroupIds, G4A_U09_HUNDREDTH_DECIMAL_PATTERN_GROUP_ID)
    || includes(options.patternSpecIds, G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID)
    || (options.selectionMode ?? "sourceUnit") === "sourceUnit"
  );
}

export function buildBatchABrowserPlan(options = {}) {
  const plan = buildBasePlan(options);
  if (!requestsP03F10HundredthDecimal(options)) return plan;
  return {
    ...plan,
    sourceUnit: { ...getBatchASourceUnit(G4A_U09_SOURCE_ID) },
    patternSpecIds: [G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID],
    allocation: null,
    questionMode: "numeric",
    requestedKnowledgePointIds: [G4A_U09_HUNDREDTH_DECIMAL_KP_ID],
    requestedPatternGroupIds: [G4A_U09_HUNDREDTH_DECIMAL_PATTERN_GROUP_ID],
    publicControls: {
      sourceId: G4A_U09_SOURCE_ID,
      questionMode: "numeric",
      productWave: "R05-W3",
      productAdmissionTask: "P03F_W3DirectProductVerticalSlice010Implementation",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice010Implementation",
      globalContextAuthority: "NOT_APPLICABLE",
    },
    publicPatternSpecInjectionUsed: false,
    genericFallbackAllowed: false,
  };
}
