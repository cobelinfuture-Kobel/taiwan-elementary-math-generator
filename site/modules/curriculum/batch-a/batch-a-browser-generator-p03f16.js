export * from "./batch-a-browser-generator-p03f15.js";
import { buildBatchABrowserPlan as buildBasePlan } from "./batch-a-browser-generator-p03f15.js";
import { getBatchASourceUnit } from "./source-units.js";
import {
  G3B_U09_DECIMAL_ARITHMETIC_SOURCE_ID,
  G3B_U09_DECIMAL_ADD_SUB_KP_ID,
  G3B_U09_DECIMAL_COMPARE_KP_ID,
  G3B_U09_DECIMAL_ADD_SUB_GROUP_ID,
  G3B_U09_DECIMAL_COMPARE_GROUP_ID,
  G3B_U09_DECIMAL_ADD_SUB_PATTERN_SPEC_IDS,
  G3B_U09_DECIMAL_COMPARE_PATTERN_SPEC_IDS,
} from "../registry/g3b-u09-decimal-add-sub-compare-selector-projection.js";

const ALL_KPS = Object.freeze([G3B_U09_DECIMAL_ADD_SUB_KP_ID, G3B_U09_DECIMAL_COMPARE_KP_ID]);
const ALL_GROUPS = Object.freeze([G3B_U09_DECIMAL_ADD_SUB_GROUP_ID, G3B_U09_DECIMAL_COMPARE_GROUP_ID]);
const ALL_SPECS = Object.freeze([...G3B_U09_DECIMAL_ADD_SUB_PATTERN_SPEC_IDS, ...G3B_U09_DECIMAL_COMPARE_PATTERN_SPEC_IDS]);
const includesAny = (values, ids) => Array.isArray(values) && ids.some((id) => values.includes(id));

export function requestsP03F16(options = {}) {
  return options.sourceId === G3B_U09_DECIMAL_ARITHMETIC_SOURCE_ID && (
    includesAny(options.selectedKnowledgePointIds, ALL_KPS)
    || includesAny(options.selectedPatternGroupIds, ALL_GROUPS)
    || includesAny(options.patternSpecIds, ALL_SPECS)
  );
}

export function buildBatchABrowserPlan(options = {}) {
  const plan = buildBasePlan(options);
  if (!requestsP03F16(options)) return plan;
  const requestedKps = ALL_KPS.filter((id) => includesAny(options.selectedKnowledgePointIds, [id]));
  const requestedGroups = ALL_GROUPS.filter((id) => includesAny(options.selectedPatternGroupIds, [id]));
  const requestedSpecs = ALL_SPECS.filter((id) => includesAny(options.patternSpecIds, [id]));
  let patternSpecIds = requestedSpecs;
  if (patternSpecIds.length === 0 && requestedGroups.length > 0) patternSpecIds = requestedGroups.flatMap((id) => id === G3B_U09_DECIMAL_ADD_SUB_GROUP_ID ? G3B_U09_DECIMAL_ADD_SUB_PATTERN_SPEC_IDS : G3B_U09_DECIMAL_COMPARE_PATTERN_SPEC_IDS);
  if (patternSpecIds.length === 0 && requestedKps.length > 0) patternSpecIds = requestedKps.flatMap((id) => id === G3B_U09_DECIMAL_ADD_SUB_KP_ID ? G3B_U09_DECIMAL_ADD_SUB_PATTERN_SPEC_IDS : G3B_U09_DECIMAL_COMPARE_PATTERN_SPEC_IDS);
  if (patternSpecIds.length === 0) patternSpecIds = [...ALL_SPECS];
  const effectiveKps = requestedKps.length ? requestedKps : ALL_KPS.filter((kpId) => patternSpecIds.some((id) => kpId === G3B_U09_DECIMAL_ADD_SUB_KP_ID ? G3B_U09_DECIMAL_ADD_SUB_PATTERN_SPEC_IDS.includes(id) : G3B_U09_DECIMAL_COMPARE_PATTERN_SPEC_IDS.includes(id)));
  const effectiveGroups = requestedGroups.length ? requestedGroups : ALL_GROUPS.filter((groupId) => patternSpecIds.some((id) => groupId === G3B_U09_DECIMAL_ADD_SUB_GROUP_ID ? G3B_U09_DECIMAL_ADD_SUB_PATTERN_SPEC_IDS.includes(id) : G3B_U09_DECIMAL_COMPARE_PATTERN_SPEC_IDS.includes(id)));
  return {
    ...plan,
    sourceUnit: { ...getBatchASourceUnit(G3B_U09_DECIMAL_ARITHMETIC_SOURCE_ID) },
    patternSpecIds: [...new Set(patternSpecIds)],
    allocation: null,
    questionMode: "numeric",
    requestedKnowledgePointIds: effectiveKps,
    requestedPatternGroupIds: effectiveGroups,
    publicControls: {
      sourceId: G3B_U09_DECIMAL_ARITHMETIC_SOURCE_ID,
      questionMode: "numeric",
      productWave: "R05-W3",
      productAdmissionTask: "P03F_W3DirectProductVerticalSlice016Implementation",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice016Implementation",
      globalContextAuthority: "NOT_APPLICABLE_FOR_SLICE016",
    },
    publicPatternSpecInjectionUsed: false,
    genericFallbackAllowed: false,
  };
}
