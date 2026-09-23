export * from "./batch-a-browser-generator.js";

import { buildBatchABrowserPlan as buildBasePlan } from "./batch-a-browser-generator.js";
import { getBatchASourceUnit } from "./source-units.js";
import {
  G4B_U08_SOURCE_ID,
  G4B_U08_EQUIVALENT_FRACTION_KP_ID,
  G4B_U08_EQUIVALENT_FRACTION_PATTERN_GROUP_ID,
  G4B_U08_EQUIVALENT_FRACTION_PATTERN_SPEC_IDS,
} from "../registry/g4b-u08-equivalent-fraction-selector-projection.js";

export function buildBatchABrowserPlan(options = {}) {
  const plan = buildBasePlan(options);
  if (options.sourceId !== G4B_U08_SOURCE_ID) return plan;
  const sourceUnit = getBatchASourceUnit(G4B_U08_SOURCE_ID);
  const requestedKnowledgePointIds = Array.isArray(options.selectedKnowledgePointIds)
    ? [...new Set(options.selectedKnowledgePointIds.filter(Boolean))]
    : [];
  const requestedPatternGroupIds = Array.isArray(options.selectedPatternGroupIds)
    ? [...new Set(options.selectedPatternGroupIds.filter(Boolean))]
    : [];
  return {
    ...plan,
    sourceUnit: { ...sourceUnit },
    patternSpecIds: [...G4B_U08_EQUIVALENT_FRACTION_PATTERN_SPEC_IDS],
    allocation: null,
    questionMode: "numeric",
    requestedKnowledgePointIds: requestedKnowledgePointIds.length
      ? requestedKnowledgePointIds
      : [G4B_U08_EQUIVALENT_FRACTION_KP_ID],
    requestedPatternGroupIds: requestedPatternGroupIds.length
      ? requestedPatternGroupIds
      : [G4B_U08_EQUIVALENT_FRACTION_PATTERN_GROUP_ID],
    publicControls: {
      sourceId: G4B_U08_SOURCE_ID,
      questionMode: "numeric",
      productWave: "R05-W3",
      productAdmissionTask: "P03F_W3DirectProductVerticalSlice005Implementation",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice005Implementation",
      globalContextAuthority: "NOT_APPLICABLE",
    },
    publicPatternSpecInjectionUsed: false,
    genericFallbackAllowed: false,
  };
}
