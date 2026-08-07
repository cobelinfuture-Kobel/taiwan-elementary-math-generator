export * from "./batch-a-browser-generator-p03f25.js";
import { buildBatchABrowserPlan as baseBuild } from "./batch-a-browser-generator-p03f25.js";
import { getBatchASourceUnit } from "./source-units.js";
import {
  G4A_U09_P03F26_KP_IDS,
  G4A_U09_P03F26_NUMERIC_PATTERN_SPEC_IDS,
  G4A_U09_P03F26_PATTERN_GROUPS,
  G4A_U09_P03F26_SOURCE_ID,
  resolveG4AU09P03F26PatternSpecIds,
} from "../registry/g4a-u09-rank8-decimal-selector-projection-p03f26.js";

const GROUP_IDS = Object.freeze(G4A_U09_P03F26_PATTERN_GROUPS.map((group) => group.patternGroupId));
const hasAny = (values, candidates) => Array.isArray(values) && values.some((value) => candidates.includes(value));

export function requestsP03F26(options = {}) {
  return options.sourceId === G4A_U09_P03F26_SOURCE_ID && (
    hasAny(options.selectedKnowledgePointIds, G4A_U09_P03F26_KP_IDS)
    || hasAny(options.selectedPatternGroupIds, GROUP_IDS)
    || hasAny(options.patternSpecIds, G4A_U09_P03F26_NUMERIC_PATTERN_SPEC_IDS)
  );
}

function resolveRequestedPatternSpecIds(options = {}) {
  if (Array.isArray(options.patternSpecIds) && options.patternSpecIds.length) {
    return options.patternSpecIds.filter((id) => G4A_U09_P03F26_NUMERIC_PATTERN_SPEC_IDS.includes(id));
  }
  if (Array.isArray(options.selectedPatternGroupIds) && options.selectedPatternGroupIds.length) {
    return G4A_U09_P03F26_PATTERN_GROUPS
      .filter((group) => options.selectedPatternGroupIds.includes(group.patternGroupId))
      .flatMap((group) => group.patternSpecIds);
  }
  if (Array.isArray(options.selectedKnowledgePointIds) && options.selectedKnowledgePointIds.length) {
    return options.selectedKnowledgePointIds
      .filter((id) => G4A_U09_P03F26_KP_IDS.includes(id))
      .flatMap((id) => resolveG4AU09P03F26PatternSpecIds(id));
  }
  return [];
}

export function buildBatchABrowserPlan(options = {}) {
  const plan = baseBuild(options);
  if (!requestsP03F26(options)) return plan;
  let patternSpecIds = [...new Set(resolveRequestedPatternSpecIds(options))];
  if (patternSpecIds.length === 0) patternSpecIds = [...G4A_U09_P03F26_NUMERIC_PATTERN_SPEC_IDS];
  const requestedKnowledgePointIds = (options.selectedKnowledgePointIds ?? []).filter((id) => G4A_U09_P03F26_KP_IDS.includes(id));
  const requestedPatternGroupIds = (options.selectedPatternGroupIds ?? []).filter((id) => GROUP_IDS.includes(id));
  return {
    ...plan,
    sourceId: G4A_U09_P03F26_SOURCE_ID,
    sourceUnit: { ...getBatchASourceUnit(G4A_U09_P03F26_SOURCE_ID) },
    patternSpecIds,
    allocation: null,
    questionMode: "numeric",
    requestedKnowledgePointIds: requestedKnowledgePointIds.length ? requestedKnowledgePointIds : [...G4A_U09_P03F26_KP_IDS],
    requestedPatternGroupIds: requestedPatternGroupIds.length ? requestedPatternGroupIds : [...GROUP_IDS],
    publicControls: {
      sourceId: G4A_U09_P03F26_SOURCE_ID,
      questionMode: "numeric",
      productWave: "R05-W3",
      productAdmissionTask: "P03F_W3DirectProductVerticalSlice026Implementation",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice026Implementation",
      globalContextAuthority: "NOT_APPLICABLE_FOR_PUBLIC_SLICE026",
    },
    publicPatternSpecInjectionUsed: false,
    genericFallbackAllowed: false,
  };
}
