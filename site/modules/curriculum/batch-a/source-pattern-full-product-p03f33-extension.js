import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds,
} from "./source-pattern-full-product-p03f32-extension.js";
import {
  G4A_U06_P03F33_SOURCE_ID,
  G4A_U06_P03F33_SURFACES,
  P03F33_REQUIRED_CAPABILITY_IDS,
} from "../registry/g4a-u06-rank9-fraction-selector-projection-p03f33.js";

const definitions={};
for(const surface of G4A_U06_P03F33_SURFACES){
  for(const patternSpecId of surface.patternSpecIds){
    const isCoordinate=patternSpecId.endsWith("_coordinate_numeric");
    const isDistance=patternSpecId.endsWith("_distance_numeric");
    definitions[patternSpecId]=Object.freeze({
      sourceId:G4A_U06_P03F33_SOURCE_ID,
      title:surface.displayName,
      kind:`g4aU06Rank9_${surface.operationFamilyId}_${isCoordinate?"coordinate":isDistance?"distance":surface.requestedUnknownRole}`,
      operation:surface.operationFamilyId,
      operationFamilyId:surface.operationFamilyId,
      operationModelId:surface.operationModelId,
      knowledgePointId:surface.knowledgePointId,
      sourceCanonicalKnowledgePointId:surface.sourceCanonicalKnowledgePointId,
      patternGroupId:surface.patternGroupId,
      patternSpecId,
      mode:"NUMERIC",
      questionMode:"numeric",
      requestedUnknownRole:isCoordinate?"coordinate":isDistance?"distance":surface.requestedUnknownRole,
      givenRoles:Object.freeze(surface.operationFamilyId==="number_line"
        ? (isCoordinate?["origin","unitStep","stepCount"]:["leftCoordinate","rightCoordinate"])
        : ["leftNumerator","leftDenominator","rightNumerator","rightDenominator"]),
      answerType:surface.operationFamilyId==="fraction_compare"?"comparison_symbol_or_order":"fraction_or_mixed_number",
      canonicalExpressions:Object.freeze(surface.operationFamilyId==="fraction_compare"
        ? ["comparison = compare(leftNumerator * rightDenominator, rightNumerator * leftDenominator)"]
        : surface.operationFamilyId==="number_line"
          ? (isCoordinate?["coordinate = origin + stepCount * unitStep"]:["distance = abs(rightCoordinate - leftCoordinate)"])
          : ["result = leftNumerator/leftDenominator ± rightNumerator/rightDenominator"]),
      canonicalSkillIds:Object.freeze([surface.knowledgePointId]),
      skillTags:Object.freeze(["fraction",surface.operationFamilyId,G4A_U06_P03F33_SOURCE_ID]),
      difficultyTags:Object.freeze(["rank9","improper_mixed_fraction","exact_rational","full_product_w3_slice033"]),
      requiredCapabilityIds:P03F33_REQUIRED_CAPABILITY_IDS,
      applicationClassification:surface.applicationClassification,
      globalContextRequired:false,
      sharedGeneratorAdapterId:"SHARED_OPERATION_FAMILY_GENERATOR_V1",
      sharedValidatorAdapterId:"SHARED_OPERATION_FAMILY_VALIDATOR_V1",
      numericDomain:Object.freeze({
        exactRationalIdentityRequired:true,
        positiveDenominatorsRequired:true,
        mixedOrImproperWitnessRequired:true,
        sameDenominatorRequired:surface.operationFamilyId==="fraction_add_sub",
        nonnegativeSubtractionRequired:surface.operationFamilyId==="fraction_add_sub",
        numberLineRequired:surface.operationFamilyId==="number_line",
        applicationRequired:false,
        applicationExpansionAllowed:false,
      }),
    });
  }
}
Object.freeze(definitions);
export const G4A_U06_P03F33_PATTERN_DEFINITIONS=definitions;
export function getBatchABrowserPatternDefinition(id){ return definitions[id]??baseGetDefinition(id); }
export function getBatchAPatternSpecIdsForSource(sourceId){ const prior=baseGetPatternIds(sourceId); return sourceId===G4A_U06_P03F33_SOURCE_ID?[...new Set([...prior,...Object.keys(definitions)])]:prior; }
export function validateP03F33PatternDefinitions(){
  const errors=[];
  const rows=Object.values(definitions);
  if(rows.length!==4) errors.push("P03F33_PATTERN_COUNT_INVALID");
  if(rows.some((row)=>row.sourceId!==G4A_U06_P03F33_SOURCE_ID||row.questionMode!=="numeric"||row.globalContextRequired)) errors.push("P03F33_PATTERN_BOUNDARY_INVALID");
  if(rows.some((row)=>JSON.stringify(row.requiredCapabilityIds)!==JSON.stringify(P03F33_REQUIRED_CAPABILITY_IDS))) errors.push("P03F33_CAPABILITY_SET_INVALID");
  if(rows.some((row)=>row.numericDomain.applicationRequired||row.numericDomain.applicationExpansionAllowed)) errors.push("P03F33_APPLICATION_EXPANSION_INVALID");
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),patternSpecCount:rows.length});
}
