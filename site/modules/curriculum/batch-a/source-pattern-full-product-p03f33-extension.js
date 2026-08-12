import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds,
} from "./source-pattern-full-product-p03f32-extension.js";
import {
  G4A_U06_P03F33_SOURCE_ID,
  G4A_U06_P03F33_SURFACES,
  P03F33_REQUIRED_CAPABILITY_IDS,
} from "../registry/g4a-u06-rank9-fraction-selector-projection-p03f33.js";

const definitions = {};
for (const surface of G4A_U06_P03F33_SURFACES) {
  for (const spec of surface.patternSpecs) {
    const isCompare = surface.operationFamilyId === "fraction_compare";
    const isNumberLine = surface.operationFamilyId === "number_line";
    const givenRoles = isCompare
      ? ["leftNumerator", "leftDenominator", "rightNumerator", "rightDenominator"]
      : isNumberLine
        ? spec.requestedUnknownRole === "coordinate"
          ? ["origin", "unitStep", "stepCount", "distance"]
          : ["origin", "unitStep", "stepCount", "coordinate"]
        : ["leftNumerator", "leftDenominator", "rightNumerator", "rightDenominator"];
    const canonicalExpressions = isCompare
      ? ["comparison = compare(leftNumerator * rightDenominator, rightNumerator * leftDenominator)"]
      : isNumberLine
        ? ["coordinate = origin + stepCount * unitStep", "distance = abs(rightCoordinate - leftCoordinate)"]
        : [
            "result = leftNumerator/leftDenominator + rightNumerator/rightDenominator",
            "result = leftNumerator/leftDenominator - rightNumerator/rightDenominator",
          ];
    definitions[spec.patternSpecId] = Object.freeze({
      sourceId:G4A_U06_P03F33_SOURCE_ID,
      title:surface.displayName,
      kind:`g4aU06Rank9_${surface.operationFamilyId}_${spec.requestedUnknownRole}`,
      operation:surface.operationFamilyId,
      operationFamilyId:surface.operationFamilyId,
      operationModelId:surface.operationModelId,
      knowledgePointId:surface.knowledgePointId,
      patternGroupId:surface.patternGroupId,
      patternSpecId:spec.patternSpecId,
      mode:"NUMERIC",
      questionMode:"numeric",
      requestedUnknownRole:spec.requestedUnknownRole,
      givenRoles:Object.freeze(givenRoles),
      answerType:isCompare ? "comparison_symbol_or_order" : isNumberLine ? "number_or_distance" : "fraction",
      canonicalExpressions:Object.freeze(canonicalExpressions),
      canonicalSkillIds:Object.freeze([surface.knowledgePointId]),
      skillTags:Object.freeze(["fraction", surface.operationFamilyId, G4A_U06_P03F33_SOURCE_ID]),
      difficultyTags:Object.freeze(["rank9", "improper_mixed_fraction", "exact_rational", "full_product_w3_slice033"]),
      requiredCapabilityIds:P03F33_REQUIRED_CAPABILITY_IDS,
      applicationClassification:surface.applicationClassification,
      globalContextRequired:false,
      sharedGeneratorAdapterId:"SHARED_OPERATION_FAMILY_GENERATOR_V1",
      sharedValidatorAdapterId:"SHARED_OPERATION_FAMILY_VALIDATOR_V1",
      numericDomain:Object.freeze({
        positiveDenominatorsRequired:true,
        exactRationalIdentityRequired:true,
        nonnegativeDistanceRequired:isNumberLine,
        nonnegativeSubtractionRequired:surface.operationFamilyId === "fraction_add_sub",
        applicationRequired:false,
        applicationExpansionAllowed:false,
      }),
    });
  }
}
Object.freeze(definitions);

export const G4A_U06_P03F33_PATTERN_DEFINITIONS = definitions;
export function getBatchABrowserPatternDefinition(id) { return definitions[id] ?? baseGetDefinition(id); }
export function getBatchAPatternSpecIdsForSource(sourceId) {
  const prior = baseGetPatternIds(sourceId);
  return sourceId === G4A_U06_P03F33_SOURCE_ID ? [...new Set([...prior, ...Object.keys(definitions)])] : prior;
}
export function validateP03F33PatternDefinitions() {
  const errors = [];
  const rows = Object.values(definitions);
  if (rows.length !== 4) errors.push("P03F33_PATTERN_COUNT_INVALID");
  if (rows.some((row) => row.sourceId !== G4A_U06_P03F33_SOURCE_ID || row.questionMode !== "numeric" || row.globalContextRequired)) errors.push("P03F33_PATTERN_BOUNDARY_INVALID");
  if (rows.some((row) => JSON.stringify(row.requiredCapabilityIds) !== JSON.stringify(P03F33_REQUIRED_CAPABILITY_IDS))) errors.push("P03F33_CAPABILITY_SET_INVALID");
  if (rows.some((row) => row.numericDomain.applicationRequired || row.numericDomain.applicationExpansionAllowed)) errors.push("P03F33_APPLICATION_EXPANSION_INVALID");
  return Object.freeze({ ok:errors.length===0, errors:Object.freeze(errors), patternSpecCount:rows.length });
}
