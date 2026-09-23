export * from "./batch-a-browser-generator-p03f14.js";
import { buildBatchABrowserPlan as buildBasePlan } from "./batch-a-browser-generator-p03f14.js";
import { getBatchASourceUnit } from "./source-units.js";
import {
  G3B_U07_SAME_DENOMINATOR_SOURCE_ID,
  G3B_U07_SAME_DENOMINATOR_ADD_SUB_KP_ID,
  G3B_U07_SAME_DENOMINATOR_COMPARE_KP_ID,
  G3B_U07_SAME_DENOMINATOR_ADD_SUB_GROUP_ID,
  G3B_U07_SAME_DENOMINATOR_COMPARE_GROUP_ID,
  G3B_U07_SAME_DENOMINATOR_ADD_SUB_PATTERN_SPEC_IDS,
  G3B_U07_SAME_DENOMINATOR_COMPARE_PATTERN_SPEC_IDS,
} from "../registry/g3b-u07-same-denominator-selector-projection.js";

const ALL_KPS = Object.freeze([G3B_U07_SAME_DENOMINATOR_ADD_SUB_KP_ID, G3B_U07_SAME_DENOMINATOR_COMPARE_KP_ID]);
const ALL_GROUPS = Object.freeze([G3B_U07_SAME_DENOMINATOR_ADD_SUB_GROUP_ID, G3B_U07_SAME_DENOMINATOR_COMPARE_GROUP_ID]);
const ALL_SPECS = Object.freeze([...G3B_U07_SAME_DENOMINATOR_ADD_SUB_PATTERN_SPEC_IDS, ...G3B_U07_SAME_DENOMINATOR_COMPARE_PATTERN_SPEC_IDS]);
const includesAny = (values, ids) => Array.isArray(values) && ids.some((id) => values.includes(id));

export function requestsP03F15(options = {}) {
  return options.sourceId === G3B_U07_SAME_DENOMINATOR_SOURCE_ID && (
    includesAny(options.selectedKnowledgePointIds, ALL_KPS)
    || includesAny(options.selectedPatternGroupIds, ALL_GROUPS)
    || includesAny(options.patternSpecIds, ALL_SPECS)
  );
}

export function buildBatchABrowserPlan(options = {}) {
  const plan = buildBasePlan(options);
  if (!requestsP03F15(options)) return plan;
  const requestedKps = ALL_KPS.filter((id) => includesAny(options.selectedKnowledgePointIds, [id]));
  const requestedGroups = ALL_GROUPS.filter((id) => includesAny(options.selectedPatternGroupIds, [id]));
  const requestedSpecs = ALL_SPECS.filter((id) => includesAny(options.patternSpecIds, [id]));
  let patternSpecIds = requestedSpecs;
  if (patternSpecIds.length === 0 && requestedGroups.length > 0) {
    patternSpecIds = requestedGroups.flatMap((groupId) => groupId === G3B_U07_SAME_DENOMINATOR_ADD_SUB_GROUP_ID ? G3B_U07_SAME_DENOMINATOR_ADD_SUB_PATTERN_SPEC_IDS : G3B_U07_SAME_DENOMINATOR_COMPARE_PATTERN_SPEC_IDS);
  }
  if (patternSpecIds.length === 0 && requestedKps.length > 0) {
    patternSpecIds = requestedKps.flatMap((kpId) => kpId === G3B_U07_SAME_DENOMINATOR_ADD_SUB_KP_ID ? G3B_U07_SAME_DENOMINATOR_ADD_SUB_PATTERN_SPEC_IDS : G3B_U07_SAME_DENOMINATOR_COMPARE_PATTERN_SPEC_IDS);
  }
  if (patternSpecIds.length === 0) patternSpecIds = [...ALL_SPECS];
  const effectiveKps = requestedKps.length ? requestedKps : ALL_KPS.filter((kpId) => patternSpecIds.some((id) => kpId === G3B_U07_SAME_DENOMINATOR_ADD_SUB_KP_ID ? G3B_U07_SAME_DENOMINATOR_ADD_SUB_PATTERN_SPEC_IDS.includes(id) : G3B_U07_SAME_DENOMINATOR_COMPARE_PATTERN_SPEC_IDS.includes(id)));
  const effectiveGroups = requestedGroups.length ? requestedGroups : ALL_GROUPS.filter((groupId) => patternSpecIds.some((id) => groupId === G3B_U07_SAME_DENOMINATOR_ADD_SUB_GROUP_ID ? G3B_U07_SAME_DENOMINATOR_ADD_SUB_PATTERN_SPEC_IDS.includes(id) : G3B_U07_SAME_DENOMINATOR_COMPARE_PATTERN_SPEC_IDS.includes(id)));
  return {
    ...plan,
    sourceUnit: { ...getBatchASourceUnit(G3B_U07_SAME_DENOMINATOR_SOURCE_ID) },
    patternSpecIds: [...new Set(patternSpecIds)],
    allocation: null,
    questionMode: "numeric",
    requestedKnowledgePointIds: effectiveKps,
    requestedPatternGroupIds: effectiveGroups,
    publicControls: {
      sourceId: G3B_U07_SAME_DENOMINATOR_SOURCE_ID,
      questionMode: "numeric",
      productWave: "R05-W3",
      productAdmissionTask: "P03F_W3DirectProductVerticalSlice015Implementation",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice015Implementation",
      globalContextAuthority: "NOT_APPLICABLE_FOR_SLICE015",
    },
    publicPatternSpecInjectionUsed: false,
    genericFallbackAllowed: false,
  };
}
