export * from "./batch-a-browser-generator-p03f26.js";
import { buildBatchABrowserPlan as baseBuild } from "./batch-a-browser-generator-p03f26.js";
import { getBatchASourceUnit } from "./source-units.js";
import {
  G4B_U08_P03F27_KP_IDS,
  G4B_U08_P03F27_NUMERIC_PATTERN_SPEC_IDS,
  G4B_U08_P03F27_PATTERN_GROUPS,
  G4B_U08_P03F27_SOURCE_ID,
  resolveG4BU08P03F27PatternSpecIds,
} from "../registry/g4b-u08-rank8-fraction-selector-projection-p03f27.js";

const GROUP_IDS = Object.freeze(G4B_U08_P03F27_PATTERN_GROUPS.map((group) => group.patternGroupId));
const hasAny = (values, candidates) => Array.isArray(values) && values.some((value) => candidates.includes(value));

export function requestsP03F27(options = {}) {
  return options.sourceId === G4B_U08_P03F27_SOURCE_ID && (
    hasAny(options.selectedKnowledgePointIds, G4B_U08_P03F27_KP_IDS)
    || hasAny(options.selectedPatternGroupIds, GROUP_IDS)
    || hasAny(options.patternSpecIds, G4B_U08_P03F27_NUMERIC_PATTERN_SPEC_IDS)
  );
}

function resolveRequestedPatternSpecIds(options = {}) {
  if (Array.isArray(options.patternSpecIds) && options.patternSpecIds.length) {
    return options.patternSpecIds.filter((id) => G4B_U08_P03F27_NUMERIC_PATTERN_SPEC_IDS.includes(id));
  }
  if (Array.isArray(options.selectedPatternGroupIds) && options.selectedPatternGroupIds.length) {
    return G4B_U08_P03F27_PATTERN_GROUPS
      .filter((group) => options.selectedPatternGroupIds.includes(group.patternGroupId))
      .flatMap((group) => group.patternSpecIds);
  }
  if (Array.isArray(options.selectedKnowledgePointIds) && options.selectedKnowledgePointIds.length) {
    return options.selectedKnowledgePointIds
      .filter((id) => G4B_U08_P03F27_KP_IDS.includes(id))
      .flatMap((id) => resolveG4BU08P03F27PatternSpecIds(id));
  }
  return [];
}

export function buildBatchABrowserPlan(options = {}) {
  const plan = baseBuild(options);
  if (!requestsP03F27(options)) return plan;
  let patternSpecIds = [...new Set(resolveRequestedPatternSpecIds(options))];
  if (patternSpecIds.length === 0) patternSpecIds = [...G4B_U08_P03F27_NUMERIC_PATTERN_SPEC_IDS];
  const requestedKnowledgePointIds = (options.selectedKnowledgePointIds ?? []).filter((id) => G4B_U08_P03F27_KP_IDS.includes(id));
  const requestedPatternGroupIds = (options.selectedPatternGroupIds ?? []).filter((id) => GROUP_IDS.includes(id));
  return {
    ...plan,
    sourceId: G4B_U08_P03F27_SOURCE_ID,
    sourceUnit: { ...getBatchASourceUnit(G4B_U08_P03F27_SOURCE_ID) },
    patternSpecIds,
    allocation: null,
    questionMode: "numeric",
    requestedKnowledgePointIds: requestedKnowledgePointIds.length ? requestedKnowledgePointIds : [...G4B_U08_P03F27_KP_IDS],
    requestedPatternGroupIds: requestedPatternGroupIds.length ? requestedPatternGroupIds : [...GROUP_IDS],
    publicControls: {
      sourceId: G4B_U08_P03F27_SOURCE_ID,
      questionMode: "numeric",
      productWave: "R05-W3",
      productAdmissionTask: "P03F_W3DirectProductVerticalSlice027Implementation",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice027Implementation",
      globalContextAuthority: "NOT_APPLICABLE_FOR_PUBLIC_SLICE027",
    },
    publicPatternSpecInjectionUsed: false,
    genericFallbackAllowed: false,
  };
}
