import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds,
} from "./source-pattern-full-product-p03f11-extension.js";
import { G4B_U08_SOURCE_ID } from "../registry/g4b-u08-equivalent-fraction-selector-projection.js";
import {
  G4B_U08_EQUIVALENCE_CROSS_PRODUCT_KP_ID,
  G4B_U08_EQUIVALENCE_CROSS_PRODUCT_GROUP_ID,
  G4B_U08_EQUIVALENCE_CROSS_PRODUCT_SPEC_ID,
} from "../registry/g4b-u08-equivalence-cross-product-selector-projection.js";

export const P03F12_REQUIRED_CAPABILITY_IDS = Object.freeze([
  "cap_fraction_arithmetic",
  "cap_fraction_domain_validator",
  "cap_fraction_number_system",
]);

export const G4B_U08_EQUIVALENCE_CROSS_PRODUCT_PATTERN_DEFINITION = Object.freeze({
  sourceId: G4B_U08_SOURCE_ID,
  title: "交叉乘積判定等值｜數字題",
  kind: "g4bU08EquivalenceCrossProduct",
  operation: "cross_product_equivalence",
  operationFamilyId: "cross_product_equivalence",
  operationModelId: "op_g4b_u08_equivalence_cross_product",
  knowledgePointId: G4B_U08_EQUIVALENCE_CROSS_PRODUCT_KP_ID,
  patternGroupId: G4B_U08_EQUIVALENCE_CROSS_PRODUCT_GROUP_ID,
  patternSpecId: G4B_U08_EQUIVALENCE_CROSS_PRODUCT_SPEC_ID,
  mode: "NUMERIC",
  questionMode: "numeric",
  requestedUnknownRole: "equivalent",
  givenRoles: Object.freeze([
    "leftNumerator",
    "leftDenominator",
    "rightNumerator",
    "rightDenominator",
  ]),
  answerType: "boolean",
  canonicalExpressions: Object.freeze([
    "equivalent = leftNumerator * rightDenominator == rightNumerator * leftDenominator",
  ]),
  canonicalSkillIds: Object.freeze([G4B_U08_EQUIVALENCE_CROSS_PRODUCT_KP_ID]),
  skillTags: Object.freeze(["fraction", "equivalence", "cross_product", G4B_U08_SOURCE_ID]),
  difficultyTags: Object.freeze([
    "exact_integer_cross_products",
    "boolean_judgment",
    "full_product_w3_slice012",
  ]),
  requiredCapabilityIds: P03F12_REQUIRED_CAPABILITY_IDS,
  applicationClassification: "APPLICATION_NOT_APPLICABLE",
  globalContextRequired: false,
  sharedGeneratorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
  sharedValidatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
  numericDomain: Object.freeze({ denominatorMin: 2, denominatorMax: 20, positiveTerms: true }),
});

export function getBatchABrowserPatternDefinition(id) {
  return id === G4B_U08_EQUIVALENCE_CROSS_PRODUCT_SPEC_ID
    ? G4B_U08_EQUIVALENCE_CROSS_PRODUCT_PATTERN_DEFINITION
    : baseGetDefinition(id);
}

// Source-unit mode intentionally remains bound to the Slice005 default PatternSpecs.
export function getBatchAPatternSpecIdsForSource(sourceId) {
  return baseGetPatternIds(sourceId);
}

export function validateP03F12PatternDefinitions() {
  const d = G4B_U08_EQUIVALENCE_CROSS_PRODUCT_PATTERN_DEFINITION;
  const errors = [];
  if (d.knowledgePointId !== G4B_U08_EQUIVALENCE_CROSS_PRODUCT_KP_ID) errors.push("P03F12_KP_BINDING_INVALID");
  if (d.requestedUnknownRole !== "equivalent") errors.push("P03F12_UNKNOWN_ROLE_INVALID");
  if (JSON.stringify(d.givenRoles) !== JSON.stringify([
    "leftNumerator",
    "leftDenominator",
    "rightNumerator",
    "rightDenominator",
  ])) errors.push("P03F12_GIVEN_ROLE_PARITY_INVALID");
  if (JSON.stringify(d.requiredCapabilityIds) !== JSON.stringify(P03F12_REQUIRED_CAPABILITY_IDS)) {
    errors.push("P03F12_CAPABILITY_SET_INVALID");
  }
  if (d.globalContextRequired || d.applicationClassification !== "APPLICATION_NOT_APPLICABLE") {
    errors.push("P03F12_APPLICATION_SCOPE_INVALID");
  }
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    patternSpecCount: 1,
  });
}
