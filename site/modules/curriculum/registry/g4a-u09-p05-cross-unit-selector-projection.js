/**
 * G4A_U09 P05 Cross-unit selector CONTRACT ONLY.
 * Does not register in the public coordinator or enable a generator.
 * Existing G3B owner KP identities and G4A hidden state remain untouched.
 */
export const P05_CROSS_UNIT_TASK_ID = "G4A_U09_P05_CrossUnitAuthoritySelectorOnlyImplementation";
export const P05_CROSS_UNIT_SOURCE_ID = "g4a_u09_4a09";
export const P05_CROSS_UNIT_STATUS = "AUTHORITY_SELECTOR_STAGED_NOT_PUBLIC";
export const P05_COMPARISON_KP_ID = "kp_g4a_u09_decimal_compare";

const deepFreeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const item of Object.values(value)) deepFreeze(item);
  return Object.freeze(value);
};
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

export const P05_DIMENSION_OWNERS = deepFreeze({
  LENGTH: {
    dimensionId: "LENGTH", ownerKpId: "kp_g4a_u09_decimal_length_conversion",
    ownerUnitCode: "G4A_U09", factor: 100, majorUnit: "公尺", minorUnit: "公分",
    maxMinor: 2599, minorDivisibility: 1,
    visibility: "HIDDEN_PENDING_GLOBALLY", applicationRequired: true,
  },
  MASS: {
    dimensionId: "MASS", ownerKpId: "kp_mass_kg_g_conversion",
    ownerUnitCode: "G3B_U06", factor: 1000, majorUnit: "公斤", minorUnit: "公克",
    maxMinor: 25990, minorDivisibility: 10,
    visibility: "G3B_OWNER_UNCHANGED", applicationRequired: false,
  },
  CAPACITY: {
    dimensionId: "CAPACITY", ownerKpId: "kp_capacity_l_ml_conversion",
    ownerUnitCode: "G3B_U02", factor: 1000, majorUnit: "公升", minorUnit: "毫升",
    maxMinor: 25990, minorDivisibility: 10,
    visibility: "G3B_OWNER_UNCHANGED", applicationRequired: false,
  },
});
const PATTERN_RECORDS = [
  ["01", "centimeters_to_decimal_meters", "小單位轉二位小數大單位"],
  ["02", "decimal_meters_to_centimeters", "二位小數大單位轉小單位"],
  ["03", "mixed_meters_centimeters_to_decimal", "複名數轉二位小數大單位"],
  ["04", "decimal_meters_to_mixed", "二位小數大單位轉複名數"],
  ["05", "hundredth_meter_count", "百分之一大單位數量計數"],
  ["06", "identify_equivalent_length", "跨表示等值選擇"],
  ["07", "compare_cross_unit_length", "同量綱跨單位兩量比較"],
  ["08", "order_three_mixed_lengths", "同量綱多表示數量排序"],
  ["09", "solve_missing_equivalent_unit", "等值換算缺數逆推"],
  ["10", "threshold_selection_mixed_units", "生活情境跨表示門檻篩選"],
];
const COMPARISON_IDS = new Set(["P05-06", "P05-07", "P05-08", "P05-10"]);
export const P05_CROSS_UNIT_PATTERN_ROWS = deepFreeze(PATTERN_RECORDS.map(([num, slug, name]) => {
  const patternId = "P05-" + num;
  return {
    patternId, patternSpecId: "ps_g4a_u09_p05_" + slug,
    patternGroupId: "pg_g4a_u09_p05_" + slug,
    displayName: name, sourceId: P05_CROSS_UNIT_SOURCE_ID,
    dimensionIds: ["LENGTH", "MASS", "CAPACITY"],
    primaryKnowledgePointByDimension: Object.fromEntries(
      Object.entries(P05_DIMENSION_OWNERS).map(([dimensionId, owner]) => [dimensionId, owner.ownerKpId])
    ),
    requiredComparisonKpId: COMPARISON_IDS.has(patternId) ? P05_COMPARISON_KP_ID : null,
    applicationContextRequired: patternId === "P05-10",
    selectorVisibility: "hidden",
    generatorStatus: "NOT_IMPLEMENTED",
    admissionStatus: P05_CROSS_UNIT_STATUS,
  };
}));
const PATTERN_BY_ID = Object.freeze(Object.fromEntries(P05_CROSS_UNIT_PATTERN_ROWS.map((row) => [row.patternId, row])));

/** Metadata resolver only. An ok result is NOT permission to generate or print. */
export function resolveG4AU09P05CrossUnitRoute({ patternId, dimensionId, questionMode = "numeric", sourceId = P05_CROSS_UNIT_SOURCE_ID } = {}) {
  if (sourceId !== P05_CROSS_UNIT_SOURCE_ID) return { ok: false, code: "P05_SOURCE_INVALID" };
  const pattern = PATTERN_BY_ID[patternId];
  if (!pattern) return { ok: false, code: "P05_PATTERN_INVALID" };
  const dimension = P05_DIMENSION_OWNERS[dimensionId];
  if (!dimension) return { ok: false, code: "P05_DIMENSION_INVALID" };
  if (questionMode !== "numeric" && questionMode !== "application") return { ok: false, code: "P05_MODE_INVALID" };
  if (pattern.applicationContextRequired && questionMode !== "application") return { ok: false, code: "P05_CONTEXT_MODE_REQUIRED" };
  return {
    ok: true, status: P05_CROSS_UNIT_STATUS,
    patternId: pattern.patternId,
    patternSpecId: pattern.patternSpecId,
    patternGroupId: pattern.patternGroupId,
    dimensionId,
    ownerKnowledgePointId: dimension.ownerKpId,
    ownerSourceUnitCode: dimension.ownerUnitCode,
    comparisonKnowledgePointId: pattern.requiredComparisonKpId,
    applicationContextRequired: dimension.applicationRequired || pattern.applicationContextRequired || questionMode === "application",
    applicationContextAuthorized: false,
    globalSelectorVisible: false,
    generatorAllowed: false,
    publicProductionAllowed: false,
  };
}

/** Pre-generator exact unit-domain contract, using integer minor units. */
export function validateG4AU09P05MinorQuantity({ dimensionId, minorInteger } = {}) {
  const dimension = P05_DIMENSION_OWNERS[dimensionId];
  if (!dimension) return { ok: false, code: "P05_DIMENSION_INVALID" };
  if (!Number.isSafeInteger(minorInteger) || minorInteger < 0 || minorInteger > dimension.maxMinor)
    return { ok: false, code: "P05_MINOR_VALUE_INVALID" };
  if (minorInteger % dimension.minorDivisibility !== 0)
    return { ok: false, code: "P05_THIRD_DECIMAL_FORBIDDEN" };
  const majorHundredths = (minorInteger * 100) / dimension.factor;
  if (!Number.isSafeInteger(majorHundredths))
    return { ok: false, code: "P05_THIRD_DECIMAL_FORBIDDEN" };
  return {
    ok: true, dimensionId, minorInteger, majorHundredths,
    majorText: (majorHundredths / 100).toFixed(2),
    minorUnit: dimension.minorUnit, majorUnit: dimension.majorUnit,
  };
}

/** Reject cross-dimension questions even when numerical values coincide. */
export function validateG4AU09P05SameDimension(dimensionIds) {
  return Array.isArray(dimensionIds)
    && dimensionIds.length > 0
    && dimensionIds.every((id) => Object.hasOwn(P05_DIMENSION_OWNERS, id))
    && new Set(dimensionIds).size === 1;
}
export function listG4AU09P05CrossUnitPatternRows() { return clone(P05_CROSS_UNIT_PATTERN_ROWS); }
export function listG4AU09P05CrossUnitOwners() { return clone(P05_DIMENSION_OWNERS); }
