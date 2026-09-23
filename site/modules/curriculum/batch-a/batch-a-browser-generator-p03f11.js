export * from "./batch-a-browser-generator-p03f10.js";
import { buildBatchABrowserPlan as buildBasePlan } from "./batch-a-browser-generator-p03f10.js";
import { getBatchASourceUnit } from "./source-units.js";
import { G4B_U06_SOURCE_ID, G4B_U06_ONE_DECIMAL_TIMES_INTEGER_KP_ID, G4B_U06_NUMERIC_GROUP_ID, G4B_U06_APPLICATION_GROUP_ID, G4B_U06_NUMERIC_SPEC_ID, G4B_U06_APPLICATION_SPEC_ID } from "../registry/g4b-u06-one-decimal-times-integer-selector-projection.js";

const includes = (values, id) => Array.isArray(values) && values.includes(id);
export function requestsP03F11DecimalMultiplication(options = {}) { return options.sourceId === G4B_U06_SOURCE_ID && (includes(options.selectedKnowledgePointIds, G4B_U06_ONE_DECIMAL_TIMES_INTEGER_KP_ID) || includes(options.selectedPatternGroupIds, G4B_U06_NUMERIC_GROUP_ID) || includes(options.selectedPatternGroupIds, G4B_U06_APPLICATION_GROUP_ID) || includes(options.patternSpecIds, G4B_U06_NUMERIC_SPEC_ID) || includes(options.patternSpecIds, G4B_U06_APPLICATION_SPEC_ID) || (options.selectionMode ?? "sourceUnit") === "sourceUnit"); }
export function buildBatchABrowserPlan(options = {}) {
  const plan = buildBasePlan(options);
  if (!requestsP03F11DecimalMultiplication(options)) return plan;
  const mode = options.questionMode === "application" ? "application" : "numeric";
  const patternSpecId = mode === "application" ? G4B_U06_APPLICATION_SPEC_ID : G4B_U06_NUMERIC_SPEC_ID;
  const patternGroupId = mode === "application" ? G4B_U06_APPLICATION_GROUP_ID : G4B_U06_NUMERIC_GROUP_ID;
  return { ...plan, sourceUnit: { ...getBatchASourceUnit(G4B_U06_SOURCE_ID) }, patternSpecIds: [patternSpecId], allocation: null, questionMode: mode, requestedKnowledgePointIds: [G4B_U06_ONE_DECIMAL_TIMES_INTEGER_KP_ID], requestedPatternGroupIds: [patternGroupId], publicControls: { sourceId: G4B_U06_SOURCE_ID, questionMode: mode, productWave: "R05-W3", productAdmissionTask: "P03F_W3DirectProductVerticalSlice011Implementation", publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice011Implementation", globalContextAuthority: mode === "application" ? "POSTG_APP_M01_GLOBAL_CONTEXT_AUTHORITY_INDEX_V1" : "NOT_APPLICABLE" }, publicPatternSpecInjectionUsed: false, genericFallbackAllowed: false };
}
