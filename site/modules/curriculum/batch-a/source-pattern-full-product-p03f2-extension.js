import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds,
} from "./source-pattern-full-product-p03f-extension.js";
import { G3A_U08_PART_WHOLE_PATTERN_SPEC_ID, G3A_U08_SOURCE_ID } from "../registry/g3a-u08-part-whole-fraction-selector-projection.js";
import {
  G3A_U08_UNIT_FRACTION_KP_ID,
  G3A_U08_DISCRETE_FRACTION_KP_ID,
  G3A_U08_UNIT_FRACTION_NUMERIC_GROUP_ID,
  G3A_U08_UNIT_FRACTION_APPLICATION_GROUP_ID,
  G3A_U08_DISCRETE_NUMERIC_GROUP_ID,
  G3A_U08_DISCRETE_APPLICATION_GROUP_ID,
  G3A_U08_UNIT_FRACTION_NUMERIC_SPEC_ID,
  G3A_U08_UNIT_FRACTION_APPLICATION_SPEC_ID,
  G3A_U08_DISCRETE_ITEM_COUNT_NUMERIC_SPEC_ID,
  G3A_U08_DISCRETE_FRACTIONAL_UNITS_NUMERIC_SPEC_ID,
  G3A_U08_DISCRETE_ITEM_COUNT_APPLICATION_SPEC_ID,
  G3A_U08_DISCRETE_FRACTIONAL_UNITS_APPLICATION_SPEC_ID,
  G3A_U08_SLICE002_PATTERN_SPEC_IDS,
} from "../registry/g3a-u08-slice002-selector-projection.js";

const freeze = (value) => Object.freeze(value);
const definition = ({ patternSpecId, title, kind, operation, knowledgePointId, patternGroupId, mode, requestedUnknownRole, givenRoles, applicationClassification }) => freeze({
  patternSpecId, sourceId: G3A_U08_SOURCE_ID, title, kind, operation, operationFamilyId: operation,
  knowledgePointId, patternGroupId, mode, questionMode: mode.toLowerCase(), requestedUnknownRole, givenRoles: freeze(givenRoles),
  canonicalSkillIds: freeze([knowledgePointId]),
  skillTags: freeze(["fraction", operation, knowledgePointId, G3A_U08_SOURCE_ID]),
  difficultyTags: freeze(["full_product_w3_slice002", "grade_3_fraction_quantity", applicationClassification.toLowerCase()]),
  requiredCapabilityIds: freeze(["cap_fraction_domain_validator", "cap_fraction_number_system"]),
  applicationClassification,
  numericDomain: freeze({ denominatorMinimum: 2, denominatorMaximum: 12, properFractionComponentRequired: true, integerItemCountRequiredWhenRequested: true }),
  globalContextRequired: mode === "APPLICATION",
  sharedGeneratorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
  sharedValidatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
});

export const G3A_U08_SLICE002_PATTERN_DEFINITIONS = freeze([
  definition({ patternSpecId: G3A_U08_UNIT_FRACTION_NUMERIC_SPEC_ID, title: "單位分數累積", kind: "g3aU08UnitFractionAccumulation", operation: "fraction_accumulation", knowledgePointId: G3A_U08_UNIT_FRACTION_KP_ID, patternGroupId: G3A_U08_UNIT_FRACTION_NUMERIC_GROUP_ID, mode: "NUMERIC", requestedUnknownRole: "fraction", givenRoles: ["unitFractionCount", "denominator"], applicationClassification: "APPLICATION_COMPATIBLE" }),
  definition({ patternSpecId: G3A_U08_UNIT_FRACTION_APPLICATION_SPEC_ID, title: "活動補給的單位分數累積", kind: "g3aU08UnitFractionAccumulation", operation: "fraction_accumulation", knowledgePointId: G3A_U08_UNIT_FRACTION_KP_ID, patternGroupId: G3A_U08_UNIT_FRACTION_APPLICATION_GROUP_ID, mode: "APPLICATION", requestedUnknownRole: "fraction", givenRoles: ["unitFractionCount", "denominator"], applicationClassification: "APPLICATION_COMPATIBLE" }),
  definition({ patternSpecId: G3A_U08_DISCRETE_ITEM_COUNT_NUMERIC_SPEC_ID, title: "分數單位換算成個數", kind: "g3aU08DiscreteSetFraction", operation: "discrete_fraction_conversion", knowledgePointId: G3A_U08_DISCRETE_FRACTION_KP_ID, patternGroupId: G3A_U08_DISCRETE_NUMERIC_GROUP_ID, mode: "NUMERIC", requestedUnknownRole: "itemCount", givenRoles: ["wholeUnits", "itemsPerWhole", "numerator", "denominator", "fractionalUnits"], applicationClassification: "APPLICATION_REQUIRED" }),
  definition({ patternSpecId: G3A_U08_DISCRETE_FRACTIONAL_UNITS_NUMERIC_SPEC_ID, title: "個數換算成分數單位", kind: "g3aU08DiscreteSetFraction", operation: "discrete_fraction_conversion", knowledgePointId: G3A_U08_DISCRETE_FRACTION_KP_ID, patternGroupId: G3A_U08_DISCRETE_NUMERIC_GROUP_ID, mode: "NUMERIC", requestedUnknownRole: "fractionalUnits", givenRoles: ["wholeUnits", "itemsPerWhole", "numerator", "denominator", "itemCount"], applicationClassification: "APPLICATION_REQUIRED" }),
  definition({ patternSpecId: G3A_U08_DISCRETE_ITEM_COUNT_APPLICATION_SPEC_ID, title: "古代交易盒數換算個數", kind: "g3aU08DiscreteSetFraction", operation: "discrete_fraction_conversion", knowledgePointId: G3A_U08_DISCRETE_FRACTION_KP_ID, patternGroupId: G3A_U08_DISCRETE_APPLICATION_GROUP_ID, mode: "APPLICATION", requestedUnknownRole: "itemCount", givenRoles: ["wholeUnits", "itemsPerWhole", "numerator", "denominator", "fractionalUnits"], applicationClassification: "APPLICATION_REQUIRED" }),
  definition({ patternSpecId: G3A_U08_DISCRETE_FRACTIONAL_UNITS_APPLICATION_SPEC_ID, title: "家務卡個數換算組數", kind: "g3aU08DiscreteSetFraction", operation: "discrete_fraction_conversion", knowledgePointId: G3A_U08_DISCRETE_FRACTION_KP_ID, patternGroupId: G3A_U08_DISCRETE_APPLICATION_GROUP_ID, mode: "APPLICATION", requestedUnknownRole: "fractionalUnits", givenRoles: ["wholeUnits", "itemsPerWhole", "numerator", "denominator", "itemCount"], applicationClassification: "APPLICATION_REQUIRED" }),
]);
const BY_ID = new Map(G3A_U08_SLICE002_PATTERN_DEFINITIONS.map((row) => [row.patternSpecId, row]));

export function getBatchABrowserPatternDefinition(patternSpecId) { return BY_ID.get(patternSpecId) ?? baseGetDefinition(patternSpecId); }
export function getBatchAPatternSpecIdsForSource(sourceId) {
  return sourceId === G3A_U08_SOURCE_ID
    ? [G3A_U08_PART_WHOLE_PATTERN_SPEC_ID, ...G3A_U08_SLICE002_PATTERN_SPEC_IDS]
    : baseGetPatternIds(sourceId);
}
export function validateP03F2PatternDefinitions() {
  const errors = [];
  if (G3A_U08_SLICE002_PATTERN_DEFINITIONS.length !== 6 || BY_ID.size !== 6) errors.push("P03F2_PATTERN_COUNT_INVALID");
  if (G3A_U08_SLICE002_PATTERN_DEFINITIONS.filter((row) => row.mode === "NUMERIC").length !== 3) errors.push("P03F2_NUMERIC_PATTERN_COUNT_INVALID");
  if (G3A_U08_SLICE002_PATTERN_DEFINITIONS.filter((row) => row.mode === "APPLICATION").length !== 3) errors.push("P03F2_APPLICATION_PATTERN_COUNT_INVALID");
  if (G3A_U08_SLICE002_PATTERN_DEFINITIONS.some((row) => row.requiredCapabilityIds.length !== 2 || row.sharedGeneratorAdapterId !== "SHARED_OPERATION_FAMILY_GENERATOR_V1" || row.sharedValidatorAdapterId !== "SHARED_OPERATION_FAMILY_VALIDATOR_V1")) errors.push("P03F2_SHARED_ADAPTER_OR_CAPABILITY_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), patternSpecCount: BY_ID.size });
}
