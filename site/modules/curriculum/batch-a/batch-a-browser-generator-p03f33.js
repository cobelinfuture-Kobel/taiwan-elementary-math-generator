export * from "./batch-a-browser-generator-p03f32.js";
import { buildBatchABrowserPlan as baseBuild } from "./batch-a-browser-generator-p03f32.js";
import { getBatchASourceUnit } from "./source-units.js";
import {
  G4A_U06_P03F33_KP_IDS,
  G4A_U06_P03F33_PATTERN_GROUPS,
  G4A_U06_P03F33_PATTERN_SPEC_IDS,
  G4A_U06_P03F33_SOURCE_ID,
} from "../registry/g4a-u06-rank9-fraction-selector-projection-p03f33.js";

const ALL_GROUPS = Object.freeze(G4A_U06_P03F33_PATTERN_GROUPS.map((row) => row.patternGroupId));
const unique = (values) => [...new Set((Array.isArray(values) ? values : []).filter(Boolean))];
const includesAny = (values, ids) => Array.isArray(values) && ids.some((id) => values.includes(id));

export function requestsP03F33(options = {}) {
  return options.sourceId === G4A_U06_P03F33_SOURCE_ID && (
    includesAny(options.selectedKnowledgePointIds, G4A_U06_P03F33_KP_IDS)
    || includesAny(options.selectedPatternGroupIds, ALL_GROUPS)
    || includesAny(options.patternSpecIds, G4A_U06_P03F33_PATTERN_SPEC_IDS)
  );
}

export function buildBatchABrowserPlan(options = {}) {
  const plan = baseBuild(options);
  if (!requestsP03F33(options)) return plan;
  const requestedKps = G4A_U06_P03F33_KP_IDS.filter((id) => includesAny(options.selectedKnowledgePointIds, [id]));
  const requestedGroups = ALL_GROUPS.filter((id) => includesAny(options.selectedPatternGroupIds, [id]));
  let requestedSpecs = unique(options.patternSpecIds).filter((id) => G4A_U06_P03F33_PATTERN_SPEC_IDS.includes(id));
  if (requestedSpecs.length === 0) {
    const targetKps = requestedKps.length ? requestedKps : G4A_U06_P03F33_KP_IDS;
    requestedSpecs = G4A_U06_P03F33_PATTERN_GROUPS
      .filter((group) => targetKps.includes(group.primaryKnowledgePointId) || requestedGroups.includes(group.patternGroupId))
      .flatMap((group) => group.patternSpecIds);
  }
  if (requestedSpecs.length === 0) requestedSpecs = [...G4A_U06_P03F33_PATTERN_SPEC_IDS];
  return {
    ...plan,
    sourceId:G4A_U06_P03F33_SOURCE_ID,
    sourceUnit:{ ...(getBatchASourceUnit(G4A_U06_P03F33_SOURCE_ID) ?? { sourceId:G4A_U06_P03F33_SOURCE_ID, grade:4, semester:"lower", unitCode:"4A-U06", title:"假分數與帶分數", domain:"fraction" }) },
    patternSpecIds:[...new Set(requestedSpecs)],
    allocation:null,
    questionMode:"numeric",
    requestedKnowledgePointIds:requestedKps.length ? requestedKps : [...G4A_U06_P03F33_KP_IDS],
    requestedPatternGroupIds:requestedGroups.length ? requestedGroups : [...ALL_GROUPS],
    publicControls:{
      sourceId:G4A_U06_P03F33_SOURCE_ID,
      questionMode:"numeric",
      productWave:"R05-W3",
      productAdmissionTask:"P03F_W3DirectProductVerticalSlice033Implementation",
      publicDropdownCutoverTask:"P03F_W3DirectProductVerticalSlice033Implementation",
      globalContextAuthority:"APPLICATION_SPECS_NOT_ADMITTED_BY_SLICE033",
      fractionTimesIntegerAuthority:"LATER_QUEUE_NOT_ADMITTED",
    },
    publicPatternSpecInjectionUsed:false,
    genericFallbackAllowed:false,
  };
}
