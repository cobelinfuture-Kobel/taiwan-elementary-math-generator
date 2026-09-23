export * from "./batch-a-browser-generator-p03f17.js";
import { buildBatchABrowserPlan as buildBasePlan } from "./batch-a-browser-generator-p03f17.js";
import { getBatchASourceUnit } from "./source-units.js";
import {
  G4A_U09_DECIMAL_COMPOSE_SOURCE_ID,
  G4A_U09_DECIMAL_COMPOSE_KP_ID,
  G4A_U09_DECIMAL_COMPOSE_GROUP_ID,
  G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID,
} from "../registry/g4a-u09-decimal-compose-decompose-selector-projection.js";

const includes = (values, id) => Array.isArray(values) && values.includes(id);
export function requestsP03F18(options = {}) {
  return options.sourceId === G4A_U09_DECIMAL_COMPOSE_SOURCE_ID && (
    includes(options.selectedKnowledgePointIds, G4A_U09_DECIMAL_COMPOSE_KP_ID)
    || includes(options.selectedPatternGroupIds, G4A_U09_DECIMAL_COMPOSE_GROUP_ID)
    || includes(options.patternSpecIds, G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID)
  );
}

export function buildBatchABrowserPlan(options = {}) {
  const plan = buildBasePlan(options);
  if (!requestsP03F18(options)) return plan;
  return {
    ...plan,
    sourceId: G4A_U09_DECIMAL_COMPOSE_SOURCE_ID,
    sourceUnit: { ...getBatchASourceUnit(G4A_U09_DECIMAL_COMPOSE_SOURCE_ID) },
    patternSpecIds: [G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID],
    allocation: null,
    questionMode: "numeric",
    requestedKnowledgePointIds: [G4A_U09_DECIMAL_COMPOSE_KP_ID],
    requestedPatternGroupIds: [G4A_U09_DECIMAL_COMPOSE_GROUP_ID],
    publicControls: {
      sourceId: G4A_U09_DECIMAL_COMPOSE_SOURCE_ID,
      questionMode: "numeric",
      productWave: "R05-W3",
      productAdmissionTask: "P03F_W3DirectProductVerticalSlice018Implementation",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice018Implementation",
      globalContextAuthority: "NOT_APPLICABLE_FOR_SLICE018",
    },
    publicPatternSpecInjectionUsed: false,
    genericFallbackAllowed: false,
  };
}
