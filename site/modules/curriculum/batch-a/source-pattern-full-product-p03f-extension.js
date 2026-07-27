import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds,
} from "./source-pattern-full-product-p01d3-extension.js";
import {
  G3A_U08_PART_WHOLE_KP_ID,
  G3A_U08_PART_WHOLE_PATTERN_GROUP_ID,
  G3A_U08_PART_WHOLE_PATTERN_SPEC_ID,
  G3A_U08_SOURCE_ID,
} from "../registry/g3a-u08-part-whole-fraction-selector-projection.js";

export const G3A_U08_PART_WHOLE_PATTERN_DEFINITION = Object.freeze({
  patternSpecId: G3A_U08_PART_WHOLE_PATTERN_SPEC_ID,
  sourceId: G3A_U08_SOURCE_ID,
  title: "等分整體與分數意義",
  kind: "g3aU08PartWholeFraction",
  operation: "part_whole_fraction",
  knowledgePointId: G3A_U08_PART_WHOLE_KP_ID,
  patternGroupId: G3A_U08_PART_WHOLE_PATTERN_GROUP_ID,
  canonicalSkillIds: Object.freeze([G3A_U08_PART_WHOLE_KP_ID]),
  skillTags: Object.freeze([
    "fraction",
    "part_whole",
    "equal_partition",
    G3A_U08_SOURCE_ID,
  ]),
  difficultyTags: Object.freeze([
    "full_product_w3_slice001",
    "grade_3_fraction_representation",
    "application_not_applicable",
  ]),
  numericDomain: Object.freeze({
    minimumSelectedParts: 0,
    maximumEqualParts: 12,
    denominatorPositive: true,
    selectedPartsNotGreaterThanEqualParts: true,
  }),
  representationModes: Object.freeze([
    "CONTINUOUS_EQUAL_PARTITION",
    "DISCRETE_SET_PARTITION",
  ]),
});

export function getBatchABrowserPatternDefinition(patternSpecId) {
  return patternSpecId === G3A_U08_PART_WHOLE_PATTERN_SPEC_ID
    ? G3A_U08_PART_WHOLE_PATTERN_DEFINITION
    : baseGetDefinition(patternSpecId);
}

export function getBatchAPatternSpecIdsForSource(sourceId) {
  if (sourceId === G3A_U08_SOURCE_ID) return [G3A_U08_PART_WHOLE_PATTERN_SPEC_ID];
  return baseGetPatternIds(sourceId);
}

export function validateP03FPatternDefinition() {
  const definition = G3A_U08_PART_WHOLE_PATTERN_DEFINITION;
  const errors = [];
  if (definition.patternSpecId !== G3A_U08_PART_WHOLE_PATTERN_SPEC_ID) errors.push("P03F_PATTERN_ID_INVALID");
  if (definition.knowledgePointId !== G3A_U08_PART_WHOLE_KP_ID) errors.push("P03F_KP_BINDING_INVALID");
  if (definition.patternGroupId !== G3A_U08_PART_WHOLE_PATTERN_GROUP_ID) errors.push("P03F_GROUP_BINDING_INVALID");
  if (definition.representationModes.length !== 2) errors.push("P03F_REPRESENTATION_MODE_COUNT_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), patternSpecCount: 1 });
}
