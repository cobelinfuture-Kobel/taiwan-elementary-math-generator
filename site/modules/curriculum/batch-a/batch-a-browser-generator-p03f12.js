export * from "./batch-a-browser-generator-p03f11.js";
import { buildBatchABrowserPlan as buildBasePlan } from "./batch-a-browser-generator-p03f11.js";
import { getBatchASourceUnit } from "./source-units.js";
import { G4B_U08_SOURCE_ID } from "../registry/g4b-u08-equivalent-fraction-selector-projection.js";
import {
  G4B_U08_EQUIVALENCE_CROSS_PRODUCT_KP_ID,
  G4B_U08_EQUIVALENCE_CROSS_PRODUCT_GROUP_ID,
  G4B_U08_EQUIVALENCE_CROSS_PRODUCT_SPEC_ID,
} from "../registry/g4b-u08-equivalence-cross-product-selector-projection.js";

const includes = (values, id) => Array.isArray(values) && values.includes(id);

export function requestsP03F12EquivalenceCrossProduct(options = {}) {
  return options.sourceId === G4B_U08_SOURCE_ID && (
    includes(options.selectedKnowledgePointIds, G4B_U08_EQUIVALENCE_CROSS_PRODUCT_KP_ID)
    || includes(options.selectedPatternGroupIds, G4B_U08_EQUIVALENCE_CROSS_PRODUCT_GROUP_ID)
    || includes(options.patternSpecIds, G4B_U08_EQUIVALENCE_CROSS_PRODUCT_SPEC_ID)
  );
}

export function buildBatchABrowserPlan(options = {}) {
  const plan = buildBasePlan(options);
  if (!requestsP03F12EquivalenceCrossProduct(options)) return plan;
  return {
    ...plan,
    sourceUnit: { ...getBatchASourceUnit(G4B_U08_SOURCE_ID) },
    patternSpecIds: [G4B_U08_EQUIVALENCE_CROSS_PRODUCT_SPEC_ID],
    allocation: null,
    questionMode: "numeric",
    requestedKnowledgePointIds: [G4B_U08_EQUIVALENCE_CROSS_PRODUCT_KP_ID],
    requestedPatternGroupIds: [G4B_U08_EQUIVALENCE_CROSS_PRODUCT_GROUP_ID],
    publicControls: {
      sourceId: G4B_U08_SOURCE_ID,
      questionMode: "numeric",
      productWave: "R05-W3",
      productAdmissionTask: "P03F_W3DirectProductVerticalSlice012Implementation",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice012Implementation",
      globalContextAuthority: "NOT_APPLICABLE",
    },
    publicPatternSpecInjectionUsed: false,
    genericFallbackAllowed: false,
  };
}
