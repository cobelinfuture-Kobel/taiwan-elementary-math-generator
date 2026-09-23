export * from "./batch-a-browser-generator-p03f7.js";
import { buildBatchABrowserPlan as buildBasePlan } from "./batch-a-browser-generator-p03f7.js";
import { getBatchASourceUnit } from "./source-units.js";
import {
  G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KP_ID,
  G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_GROUP_ID,
  G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_SPEC_ID,
  G3B_U09_SOURCE_ID,
} from "../registry/g3b-u09-decimal-compose-decompose-selector-projection.js";
import {
  G3B_U09_DECIMAL_READ_WRITE_KP_ID,
  G3B_U09_DECIMAL_READ_WRITE_PATTERN_GROUP_ID,
  G3B_U09_DECIMAL_READ_WRITE_PATTERN_SPEC_ID,
} from "../registry/g3b-u09-decimal-read-write-selector-projection.js";

const includes = (values, id) => Array.isArray(values) && values.includes(id);
export function requestsP03F8DecimalSlice(options = {}) {
  return options.sourceId === G3B_U09_SOURCE_ID && (
    includes(options.selectedKnowledgePointIds, G3B_U09_DECIMAL_READ_WRITE_KP_ID)
    || includes(options.selectedKnowledgePointIds, G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KP_ID)
    || includes(options.selectedPatternGroupIds, G3B_U09_DECIMAL_READ_WRITE_PATTERN_GROUP_ID)
    || includes(options.selectedPatternGroupIds, G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_GROUP_ID)
  );
}
export const requestsP03F8DecimalComposeDecompose = requestsP03F8DecimalSlice;

export function buildBatchABrowserPlan(options = {}) {
  const plan = buildBasePlan(options);
  if (!requestsP03F8DecimalSlice(options)) return plan;
  const readWriteRequested = includes(options.selectedKnowledgePointIds, G3B_U09_DECIMAL_READ_WRITE_KP_ID)
    || includes(options.selectedPatternGroupIds, G3B_U09_DECIMAL_READ_WRITE_PATTERN_GROUP_ID);
  const composeRequested = includes(options.selectedKnowledgePointIds, G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KP_ID)
    || includes(options.selectedPatternGroupIds, G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_GROUP_ID);
  const requestedKnowledgePointIds = [];
  const requestedPatternGroupIds = [];
  const patternSpecIds = [];
  if (readWriteRequested) {
    requestedKnowledgePointIds.push(G3B_U09_DECIMAL_READ_WRITE_KP_ID);
    requestedPatternGroupIds.push(G3B_U09_DECIMAL_READ_WRITE_PATTERN_GROUP_ID);
    patternSpecIds.push(G3B_U09_DECIMAL_READ_WRITE_PATTERN_SPEC_ID);
  }
  if (composeRequested) {
    requestedKnowledgePointIds.push(G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KP_ID);
    requestedPatternGroupIds.push(G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_GROUP_ID);
    patternSpecIds.push(G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_SPEC_ID);
  }
  return {
    ...plan,
    sourceUnit: { ...getBatchASourceUnit(G3B_U09_SOURCE_ID) },
    patternSpecIds,
    allocation: null,
    questionMode: "numeric",
    requestedKnowledgePointIds,
    requestedPatternGroupIds,
    publicControls: {
      sourceId: G3B_U09_SOURCE_ID,
      questionMode: "numeric",
      productWave: "R05-W3",
      productAdmissionTask: "P03F_W3DirectProductVerticalSlice008Implementation",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice008Implementation",
      globalContextAuthority: "NOT_APPLICABLE",
    },
    publicPatternSpecInjectionUsed: false,
    genericFallbackAllowed: false,
  };
}
