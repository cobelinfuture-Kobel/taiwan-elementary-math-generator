export * from "./batch-a-browser-generator-p03f24.js";
import { buildBatchABrowserPlan as baseBuild } from "./batch-a-browser-generator-p03f24.js";
import { getBatchASourceUnit } from "./source-units.js";
import { G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID } from "../registry/g4a-u06-fraction-type-classification-selector-projection.js";
import {
  G4A_U06_P03F25_GROUP_ID,
  G4A_U06_P03F25_KP_ID,
  G4A_U06_P03F25_PATTERN_SPEC_IDS,
} from "../registry/g4a-u06-improper-mixed-conversion-selector-projection-p03f25.js";

const ALL_KPS = Object.freeze([G4A_U06_P03F25_KP_ID]);
const ALL_GROUPS = Object.freeze([G4A_U06_P03F25_GROUP_ID]);
const ALL_SPECS = Object.freeze([...G4A_U06_P03F25_PATTERN_SPEC_IDS]);
const includesAny = (values, ids) => Array.isArray(values) && ids.some((id) => values.includes(id));

export function requestsP03F25(options = {}) {
  return options.sourceId === G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID && (
    includesAny(options.selectedKnowledgePointIds, ALL_KPS)
    || includesAny(options.selectedPatternGroupIds, ALL_GROUPS)
    || includesAny(options.patternSpecIds, ALL_SPECS)
  );
}

export function buildBatchABrowserPlan(options = {}) {
  const plan = baseBuild(options);
  if (!requestsP03F25(options)) return plan;
  const requestedKps = ALL_KPS.filter((id) => includesAny(options.selectedKnowledgePointIds, [id]));
  const requestedGroups = ALL_GROUPS.filter((id) => includesAny(options.selectedPatternGroupIds, [id]));
  const requestedSpecs = ALL_SPECS.filter((id) => includesAny(options.patternSpecIds, [id]));
  let patternSpecIds = requestedSpecs;
  if (patternSpecIds.length === 0 && (requestedGroups.length > 0 || requestedKps.length > 0)) patternSpecIds = [...ALL_SPECS];
  if (patternSpecIds.length === 0) patternSpecIds = [...ALL_SPECS];
  return {
    ...plan,
    sourceId: G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID,
    sourceUnit: { ...getBatchASourceUnit(G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID) },
    patternSpecIds: [...new Set(patternSpecIds)],
    allocation: null,
    questionMode: "numeric",
    requestedKnowledgePointIds: requestedKps.length ? requestedKps : [...ALL_KPS],
    requestedPatternGroupIds: requestedGroups.length ? requestedGroups : [...ALL_GROUPS],
    publicControls: {
      sourceId: G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID,
      questionMode: "numeric",
      productWave: "R05-W3",
      productAdmissionTask: "P03F_W3DirectProductVerticalSlice025Implementation",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice025Implementation",
      globalContextAuthority: "NOT_APPLICABLE_FOR_SLICE025",
    },
    publicPatternSpecInjectionUsed: false,
    genericFallbackAllowed: false,
  };
}
