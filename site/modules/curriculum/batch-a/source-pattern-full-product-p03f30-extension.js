import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds,
} from "./source-pattern-full-product-p03f29-extension.js";
import {
  G5A_U06_P03F30_SOURCE_ID,
  G5A_U06_P03F30_SURFACES,
  P03F30_REQUIRED_CAPABILITY_IDS,
} from "../registry/g5a-u06-rank8-fraction-selector-projection-p03f30.js";

const definitions = Object.freeze(Object.fromEntries(G5A_U06_P03F30_SURFACES.map((surface) => [surface.patternSpecId, Object.freeze({
  sourceId: G5A_U06_P03F30_SOURCE_ID,
  title: surface.displayName,
  kind: `g5aU06Rank8_${surface.operationFamilyId}_${surface.requestedUnknownRole}`,
  operation: surface.operationFamilyId,
  operationFamilyId: surface.operationFamilyId,
  operationModelId: surface.operationModelId,
  knowledgePointId: surface.knowledgePointId,
  patternGroupId: surface.patternGroupId,
  patternSpecId: surface.patternSpecId,
  mode: "NUMERIC",
  questionMode: "numeric",
  requestedUnknownRole: surface.requestedUnknownRole,
  givenRoles: Object.freeze(surface.operationFamilyId === "reciprocal_sum"
    ? ["firstDenominator", "secondDenominator"]
    : ["leftNumerator", "leftDenominator", "rightNumerator", "rightDenominator"]),
  answerType: surface.operationFamilyId === "fraction_compare" ? "comparison_symbol_or_order" : "fraction",
  canonicalExpressions: Object.freeze(surface.operationFamilyId === "reciprocal_sum"
    ? ["sum = 1/firstDenominator + 1/secondDenominator"]
    : surface.operationFamilyId === "fraction_compare"
      ? ["comparison = compare(leftNumerator * rightDenominator, rightNumerator * leftDenominator)"]
      : [surface.knowledgePointId.endsWith("_add")
          ? "result = leftNumerator/leftDenominator + rightNumerator/rightDenominator"
          : "result = leftNumerator/leftDenominator - rightNumerator/rightDenominator"]),
  canonicalSkillIds: Object.freeze([surface.knowledgePointId]),
  skillTags: Object.freeze(["fraction", surface.operationFamilyId, G5A_U06_P03F30_SOURCE_ID]),
  difficultyTags: Object.freeze(["unlike_denominator", "exact_rational", "full_product_w3_slice030"]),
  requiredCapabilityIds: P03F30_REQUIRED_CAPABILITY_IDS,
  applicationClassification: surface.applicationClassification,
  globalContextRequired: false,
  sharedGeneratorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
  sharedValidatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
  numericDomain: Object.freeze({
    denominatorsPositive: true,
    exactRationalIdentityRequired: true,
    nonnegativeSubtractionRequired: surface.knowledgePointId.endsWith("_sub"),
    applicationRequired: false,
    applicationExpansionAllowed: false,
  }),
})])));

export const G5A_U06_P03F30_PATTERN_DEFINITIONS = definitions;

export function getBatchABrowserPatternDefinition(id) {
  return definitions[id] ?? baseGetDefinition(id);
}

export function getBatchAPatternSpecIdsForSource(sourceId) {
  const prior = baseGetPatternIds(sourceId);
  return sourceId === G5A_U06_P03F30_SOURCE_ID
    ? [...new Set([...prior, ...Object.keys(definitions)])]
    : prior;
}

export function validateP03F30PatternDefinitions() {
  const errors = [];
  const rows = Object.values(definitions);
  if (rows.length !== 4) errors.push("P03F30_PATTERN_COUNT_INVALID");
  if (rows.some((row) => row.sourceId !== G5A_U06_P03F30_SOURCE_ID || row.questionMode !== "numeric" || row.globalContextRequired)) errors.push("P03F30_PATTERN_BOUNDARY_INVALID");
  if (rows.some((row) => JSON.stringify(row.requiredCapabilityIds) !== JSON.stringify(P03F30_REQUIRED_CAPABILITY_IDS))) errors.push("P03F30_CAPABILITY_SET_INVALID");
  if (rows.some((row) => row.numericDomain.applicationRequired || row.numericDomain.applicationExpansionAllowed)) errors.push("P03F30_APPLICATION_EXPANSION_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), patternSpecCount: rows.length });
}
