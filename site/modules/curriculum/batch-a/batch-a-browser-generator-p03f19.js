export * from "./batch-a-browser-generator-p03f18.js";
import { buildBatchABrowserPlan as buildBasePlan } from "./batch-a-browser-generator-p03f18.js";
import { getBatchASourceUnit } from "./source-units.js";
import {
  G4B_U06_SLICE019_SOURCE_ID,
  G4B_U06_SLICE019_KNOWLEDGE_POINT_ROWS,
  G4B_U06_SLICE019_PATTERN_GROUPS,
  G4B_U06_SLICE019_PATTERN_SPEC_IDS,
  resolveG4BU06Slice019PatternSpecIds,
} from "../registry/g4b-u06-two-decimal-rate-selector-projection.js";

const KP_IDS = Object.freeze(G4B_U06_SLICE019_KNOWLEDGE_POINT_ROWS.map((row) => row.knowledgePointId));
const GROUP_IDS = Object.freeze(G4B_U06_SLICE019_PATTERN_GROUPS.map((row) => row.patternGroupId));
const includesAny = (values, ids) => Array.isArray(values) && ids.some((id) => values.includes(id));
const modeForSpec = (id) => G4B_U06_SLICE019_PATTERN_GROUPS.find((row) => row.patternSpecIds.includes(id))?.publicQuestionMode ?? null;

export function requestsP03F19(options = {}) {
  return options.sourceId === G4B_U06_SLICE019_SOURCE_ID && (
    includesAny(options.selectedKnowledgePointIds, KP_IDS)
    || includesAny(options.selectedPatternGroupIds, GROUP_IDS)
    || includesAny(options.patternSpecIds, G4B_U06_SLICE019_PATTERN_SPEC_IDS)
  );
}

export function buildBatchABrowserPlan(options = {}) {
  const plan = buildBasePlan(options);
  if (!requestsP03F19(options)) return plan;
  const selectedKps = KP_IDS.filter((id) => includesAny(options.selectedKnowledgePointIds, [id]));
  const selectedGroups = G4B_U06_SLICE019_PATTERN_GROUPS.filter((row) => includesAny(options.selectedPatternGroupIds, [row.patternGroupId]));
  const explicitSpecs = G4B_U06_SLICE019_PATTERN_SPEC_IDS.filter((id) => includesAny(options.patternSpecIds, [id]));
  const inferredMode = selectedGroups.length && new Set(selectedGroups.map((row) => row.publicQuestionMode)).size === 1 ? selectedGroups[0].publicQuestionMode : null;
  const questionMode = ["numeric", "application"].includes(options.questionMode) ? options.questionMode : inferredMode ?? "numeric";
  let patternSpecIds = explicitSpecs.filter((id) => modeForSpec(id) === questionMode);
  if (!patternSpecIds.length && selectedGroups.length) patternSpecIds = selectedGroups.filter((row) => row.publicQuestionMode === questionMode).flatMap((row) => row.patternSpecIds);
  if (!patternSpecIds.length) patternSpecIds = (selectedKps.length ? selectedKps : KP_IDS.slice(0, 1)).flatMap((id) => resolveG4BU06Slice019PatternSpecIds(id, questionMode));
  return {
    ...plan,
    sourceId: G4B_U06_SLICE019_SOURCE_ID,
    sourceUnit: { ...getBatchASourceUnit(G4B_U06_SLICE019_SOURCE_ID) },
    patternSpecIds: [...new Set(patternSpecIds)],
    allocation: null,
    questionMode,
    requestedKnowledgePointIds: selectedKps.length ? selectedKps : [...new Set(selectedGroups.map((row) => row.primaryKnowledgePointId))],
    requestedPatternGroupIds: selectedGroups.map((row) => row.patternGroupId),
    publicControls: {
      sourceId: G4B_U06_SLICE019_SOURCE_ID,
      questionMode,
      productWave: "R05-W3",
      productAdmissionTask: "P03F_W3DirectProductVerticalSlice019Implementation",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice019Implementation",
      globalContextAuthority: questionMode === "application" ? "POSTG_APP_W02_A02_EXISTING_CONTEXT_CANDIDATES" : "NOT_REQUIRED_FOR_NUMERIC",
    },
    publicPatternSpecInjectionUsed: false,
    genericFallbackAllowed: false,
  };
}
