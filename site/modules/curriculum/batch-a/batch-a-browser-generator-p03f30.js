export * from "./batch-a-browser-generator-p03f29.js";
import { buildBatchABrowserPlan as baseBuild } from "./batch-a-browser-generator-p03f29.js";
import { getBatchASourceUnit } from "./source-units.js";
import {
  G5A_U06_P03F30_KP_IDS,
  G5A_U06_P03F30_NUMERIC_PATTERN_SPEC_IDS,
  G5A_U06_P03F30_SOURCE_ID,
  G5A_U06_P03F30_SURFACES,
} from "../registry/g5a-u06-rank8-fraction-selector-projection-p03f30.js";

const ALL_SPECS = new Set(G5A_U06_P03F30_NUMERIC_PATTERN_SPEC_IDS);
const byKp = new Map(G5A_U06_P03F30_SURFACES.map((surface) => [surface.knowledgePointId, surface]));
const byGroup = new Map(G5A_U06_P03F30_SURFACES.map((surface) => [surface.patternGroupId, surface]));
const unique = (values) => [...new Set((Array.isArray(values) ? values : []).filter(Boolean))];

export function requestsP03F30(options = {}) {
  if (options.sourceId !== G5A_U06_P03F30_SOURCE_ID) return false;
  const selected = [
    ...unique(options.selectedKnowledgePointIds).map((id) => byKp.get(id)?.patternSpecId),
    ...unique(options.selectedPatternGroupIds).map((id) => byGroup.get(id)?.patternSpecId),
    ...unique(options.patternSpecIds).filter((id) => ALL_SPECS.has(id)),
  ].filter(Boolean);
  return selected.length > 0 || options.selectionMode === "sourceUnit" || (!options.selectedKnowledgePointIds && !options.selectedPatternGroupIds && !options.patternSpecIds);
}

function resolveSpecs(options = {}) {
  const explicit = [
    ...unique(options.selectedKnowledgePointIds).map((id) => byKp.get(id)?.patternSpecId),
    ...unique(options.selectedPatternGroupIds).map((id) => byGroup.get(id)?.patternSpecId),
    ...unique(options.patternSpecIds).filter((id) => ALL_SPECS.has(id)),
  ].filter(Boolean);
  return explicit.length ? unique(explicit) : [...G5A_U06_P03F30_NUMERIC_PATTERN_SPEC_IDS];
}

export function buildBatchABrowserPlan(options = {}) {
  const plan = baseBuild(options);
  if (!requestsP03F30(options)) return plan;
  const patternSpecIds = resolveSpecs(options);
  const surfaces = patternSpecIds.map((id) => G5A_U06_P03F30_SURFACES.find((surface) => surface.patternSpecId === id)).filter(Boolean);
  return {
    ...plan,
    sourceId: G5A_U06_P03F30_SOURCE_ID,
    sourceUnit: { ...(getBatchASourceUnit(G5A_U06_P03F30_SOURCE_ID) ?? { sourceId: G5A_U06_P03F30_SOURCE_ID, grade: 5, semester: "upper", unitCode: "5A-U06", title: "異分母分數加減", domain: "fraction_addition_subtraction" }) },
    patternSpecIds,
    allocation: null,
    questionMode: "numeric",
    requestedKnowledgePointIds: unique(surfaces.map((surface) => surface.knowledgePointId)),
    requestedPatternGroupIds: unique(surfaces.map((surface) => surface.patternGroupId)),
    publicControls: {
      sourceId: G5A_U06_P03F30_SOURCE_ID,
      questionMode: "numeric",
      productWave: "R05-W3",
      productAdmissionTask: "P03F_W3DirectProductVerticalSlice030Implementation",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice030Implementation",
      globalContextAuthority: "HIDDEN_APPLICATION_SURFACES_NOT_ADMITTED",
    },
    publicPatternSpecInjectionUsed: false,
    genericFallbackAllowed: false,
  };
}
