import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds,
} from "./source-pattern-full-product-p03f26-extension.js";
import {
  G4B_U08_P03F27_KP_IDS,
  G4B_U08_P03F27_NUMERIC_PATTERN_SPEC_IDS,
  G4B_U08_P03F27_PATTERN_GROUPS,
  G4B_U08_P03F27_SOURCE_ID,
} from "../registry/g4b-u08-rank8-fraction-selector-projection-p03f27.js";

export const P03F27_FRACTION_CAPABILITY_IDS = Object.freeze([
  "cap_fraction_arithmetic",
  "cap_fraction_domain_validator",
  "cap_fraction_number_system",
]);

const groupBySpec = new Map(G4B_U08_P03F27_PATTERN_GROUPS.flatMap((group) => group.patternSpecIds.map((id) => [id, group])));
const metaBySpec = Object.freeze({
  ps_g4b_u08_fraction_compare_cross_product_comparison_numeric: Object.freeze({
    kp: "kp_g4b_u08_fraction_compare_cross_product", op: "fraction_compare", family: "fraction_compare", model: "op_g4b_u08_fraction_compare_cross_product", unknown: "comparison", roles: ["leftNumerator", "leftDenominator", "rightNumerator", "rightDenominator"], answerType: "comparison_symbol_or_order", title: "異分母分數比較",
  }),
  ps_g4b_u08_unlike_denominator_add_sub_result_numeric: Object.freeze({
    kp: "kp_g4b_u08_unlike_denominator_add_sub", op: "fraction_add_sub", family: "fraction_add_sub", model: "op_g4b_u08_unlike_denominator_add_sub", unknown: "result", roles: ["leftNumerator", "leftDenominator", "rightNumerator", "rightDenominator"], answerType: "fraction", title: "異分母分數加減",
  }),
});

function definition(patternSpecId) {
  const meta = metaBySpec[patternSpecId];
  const group = groupBySpec.get(patternSpecId);
  if (!meta || !group) return null;
  return Object.freeze({
    sourceId: G4B_U08_P03F27_SOURCE_ID,
    title: meta.title,
    kind: "g4bU08Rank8Fraction",
    operation: meta.op,
    operationFamilyId: meta.family,
    operationModelId: meta.model,
    knowledgePointId: meta.kp,
    patternGroupId: group.patternGroupId,
    patternSpecId,
    mode: "NUMERIC",
    questionMode: "numeric",
    requestedUnknownRole: meta.unknown,
    givenRoles: Object.freeze([...meta.roles]),
    answerType: meta.answerType,
    canonicalExpressions: Object.freeze(meta.op === "fraction_compare"
      ? ["comparison = compare(leftNumerator * rightDenominator, rightNumerator * leftDenominator)"]
      : ["result = leftNumerator/leftDenominator ± rightNumerator/rightDenominator"]),
    canonicalSkillIds: Object.freeze([meta.kp]),
    skillTags: Object.freeze(["fraction", meta.family, G4B_U08_P03F27_SOURCE_ID]),
    difficultyTags: Object.freeze([meta.op, "full_product_w3_slice027"]),
    requiredCapabilityIds: P03F27_FRACTION_CAPABILITY_IDS,
    applicationClassification: "APPLICATION_COMPATIBLE",
    globalContextRequired: false,
    sharedGeneratorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
    sharedValidatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
    numericDomain: Object.freeze({
      positiveDenominators: true,
      unlikeDenominatorsRequired: true,
      exactRationalIdentityRequired: true,
      crossProductComparisonRequired: meta.op === "fraction_compare",
      fractionAddSubRequired: meta.op === "fraction_add_sub",
      nonNegativeSubtractionRequired: meta.op === "fraction_add_sub",
      applicationRequired: false,
      numberLineDistanceAllowed: false,
      mixedFractionOrderConstraintAllowed: false,
    }),
  });
}

export const G4B_U08_P03F27_PATTERN_DEFINITIONS = Object.freeze(G4B_U08_P03F27_NUMERIC_PATTERN_SPEC_IDS.map(definition));
const BY_ID = new Map(G4B_U08_P03F27_PATTERN_DEFINITIONS.map((row) => [row.patternSpecId, row]));

export function getBatchABrowserPatternDefinition(id){ return BY_ID.get(id) ?? baseGetDefinition(id); }
export function getBatchAPatternSpecIdsForSource(sourceId){
  if(sourceId!==G4B_U08_P03F27_SOURCE_ID) return baseGetPatternIds(sourceId);
  return [...new Set([...baseGetPatternIds(sourceId), ...BY_ID.keys()])];
}
export function validateP03F27PatternDefinitions(){
  const errors=[];
  if(G4B_U08_P03F27_PATTERN_DEFINITIONS.length!==2) errors.push("P03F27_PATTERN_COUNT_INVALID");
  if(new Set(G4B_U08_P03F27_PATTERN_DEFINITIONS.map((row)=>row.knowledgePointId)).size!==G4B_U08_P03F27_KP_IDS.length) errors.push("P03F27_KP_PATTERN_COVERAGE_INVALID");
  for(const row of G4B_U08_P03F27_PATTERN_DEFINITIONS){
    if(row.sourceId!==G4B_U08_P03F27_SOURCE_ID || row.questionMode!=="numeric" || row.globalContextRequired) errors.push(`P03F27_PATTERN_BOUNDARY_INVALID:${row.patternSpecId}`);
    for(const cap of P03F27_FRACTION_CAPABILITY_IDS) if(!row.requiredCapabilityIds.includes(cap)) errors.push(`P03F27_FRACTION_CAPABILITY_MISSING:${row.patternSpecId}:${cap}`);
    if(row.numericDomain.applicationRequired || row.numericDomain.numberLineDistanceAllowed || row.numericDomain.mixedFractionOrderConstraintAllowed) errors.push(`P03F27_DOMAIN_EXPANSION_INVALID:${row.patternSpecId}`);
  }
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),patternSpecCount:2});
}
