export const G4B_U01_SOURCE_ID = "g4b_u01_4b01";

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

const sharedLifecycle = deepFreeze({
  sourceId: G4B_U01_SOURCE_ID,
  unitCode: "4B-U01",
  unitTitle: "多位數的乘與除",
  kind: "g4bU01HorizontalCalculation",
  representation: "horizontal_only",
  applicationTextAllowed: false,
  formalMappingRef:
    "data/curriculum/contracts/S59B_G4B_U01_TagRegistryFormalMappingAndBoundaryDesign.json",
  generatorStatus: "hidden_not_implemented",
  validatorStatus: "contract_only_not_runtime",
  runtimeProjectionStatus: "materialized_not_routed",
  selectorStatus: "hidden",
  canonicalRouting: "disabled",
  productionUse: "forbidden",
});

const groupRows = [
  ["pg_g4b_u01_3digit_by_3digit", "kp_g4b_u01_3digit_by_3digit", "三位數乘三位數", "numericAnswer", ["ps_g4b_u01_3digit_by_3digit"]],
  ["pg_g4b_u01_4digit_by_3digit", "kp_g4b_u01_4digit_by_3digit", "四位數乘三位數", "numericAnswer", ["ps_g4b_u01_4digit_by_3digit"]],
  ["pg_g4b_u01_multiplier_internal_zero", "kp_g4b_u01_multiplier_internal_zero", "乘數中間有0的乘法", "numericAnswer", ["ps_g4b_u01_multiplier_internal_zero"]],
  ["pg_g4b_u01_trailing_zero_multiplication", "kp_g4b_u01_trailing_zero_multiplication", "尾0乘法與位值簡算", "numericAnswer", ["ps_g4b_u01_multiplier_trailing_zero", "ps_g4b_u01_multiplicand_trailing_zero", "ps_g4b_u01_both_factors_trailing_zero", "ps_g4b_u01_power10_multiplication"]],
  ["pg_g4b_u01_3digit_div_3digit", "kp_g4b_u01_3digit_div_3digit", "三位數除以三位數", "quotientRemainderAnswer", ["ps_g4b_u01_3digit_div_3digit"]],
  ["pg_g4b_u01_4digit_div_3digit_2digit_quotient", "kp_g4b_u01_4digit_div_3digit_2digit_quotient", "四位數除以三位數，商為兩位數", "quotientRemainderAnswer", ["ps_g4b_u01_4digit_div_3digit_2digit_quotient"]],
  ["pg_g4b_u01_4digit_div_3digit_1digit_quotient", "kp_g4b_u01_4digit_div_3digit_1digit_quotient", "四位數除以三位數，商為一位數", "quotientRemainderAnswer", ["ps_g4b_u01_4digit_div_3digit_1digit_quotient"]],
  ["pg_g4b_u01_trailing_zero_division_exact", "kp_g4b_u01_trailing_zero_division_exact", "尾0除法，整除", "numericAnswer", ["ps_g4b_u01_trailing_zero_division_exact"]],
  ["pg_g4b_u01_trailing_zero_division_remainder_restore", "kp_g4b_u01_trailing_zero_division_remainder_restore", "尾0除法，有餘數及餘數還原", "quotientRemainderAnswer", ["ps_g4b_u01_trailing_zero_division_remainder_restore"]],
];

const specRows = [
  ["ps_g4b_u01_3digit_by_3digit", "pg_g4b_u01_3digit_by_3digit", "kp_g4b_u01_3digit_by_3digit", "multiply", "a*b", "numericAnswer"],
  ["ps_g4b_u01_4digit_by_3digit", "pg_g4b_u01_4digit_by_3digit", "kp_g4b_u01_4digit_by_3digit", "multiply", "a*b", "numericAnswer"],
  ["ps_g4b_u01_multiplier_internal_zero", "pg_g4b_u01_multiplier_internal_zero", "kp_g4b_u01_multiplier_internal_zero", "multiply", "a*b", "numericAnswer"],
  ["ps_g4b_u01_multiplier_trailing_zero", "pg_g4b_u01_trailing_zero_multiplication", "kp_g4b_u01_trailing_zero_multiplication", "multiply", "a*b", "numericAnswer"],
  ["ps_g4b_u01_multiplicand_trailing_zero", "pg_g4b_u01_trailing_zero_multiplication", "kp_g4b_u01_trailing_zero_multiplication", "multiply", "a*b", "numericAnswer"],
  ["ps_g4b_u01_both_factors_trailing_zero", "pg_g4b_u01_trailing_zero_multiplication", "kp_g4b_u01_trailing_zero_multiplication", "multiply", "a*b", "numericAnswer"],
  ["ps_g4b_u01_power10_multiplication", "pg_g4b_u01_trailing_zero_multiplication", "kp_g4b_u01_trailing_zero_multiplication", "multiply", "a*b", "numericAnswer"],
  ["ps_g4b_u01_3digit_div_3digit", "pg_g4b_u01_3digit_div_3digit", "kp_g4b_u01_3digit_div_3digit", "divide", "a/b", "quotientRemainderAnswer"],
  ["ps_g4b_u01_4digit_div_3digit_2digit_quotient", "pg_g4b_u01_4digit_div_3digit_2digit_quotient", "kp_g4b_u01_4digit_div_3digit_2digit_quotient", "divide", "a/b", "quotientRemainderAnswer"],
  ["ps_g4b_u01_4digit_div_3digit_1digit_quotient", "pg_g4b_u01_4digit_div_3digit_1digit_quotient", "kp_g4b_u01_4digit_div_3digit_1digit_quotient", "divide", "a/b", "quotientRemainderAnswer"],
  ["ps_g4b_u01_trailing_zero_division_exact", "pg_g4b_u01_trailing_zero_division_exact", "kp_g4b_u01_trailing_zero_division_exact", "divide", "a/b", "numericAnswer"],
  ["ps_g4b_u01_trailing_zero_division_remainder_restore", "pg_g4b_u01_trailing_zero_division_remainder_restore", "kp_g4b_u01_trailing_zero_division_remainder_restore", "divide", "a/b", "quotientRemainderAnswer"],
];

export const G4B_U01_HIDDEN_PATTERN_GROUPS = deepFreeze(
  groupRows.map(([patternGroupId, knowledgePointId, displayName, answerModel, patternSpecIds]) => ({
    patternGroupId,
    sourceId: G4B_U01_SOURCE_ID,
    unitCode: "4B-U01",
    unitTitle: "多位數的乘與除",
    displayName,
    primaryKnowledgePointId: knowledgePointId,
    knowledgePointIds: [knowledgePointId],
    supportClass: "B",
    answerModelShape: answerModel,
    patternSpecIds,
    allocationPolicy: "balanced_by_pattern_spec",
    visibilityStatus: "hidden",
    holdReason: "hidden_generator_validator_and_public_smoke_required",
  })),
);

export const G4B_U01_HIDDEN_PATTERN_SPECS = deepFreeze(
  specRows.map(([patternSpecId, patternGroupId, knowledgePointId, operation, equationShape, answerModel], index) => ({
    ...sharedLifecycle,
    patternSpecId,
    patternGroupId,
    knowledgePointId,
    operation,
    equationShape,
    answerModel: { shape: answerModel },
    patternOrder: index + 1,
    legacyRuntimeIdPreserved: patternSpecId === "ps_g4b_u01_multiplier_trailing_zero",
  })),
);

export function getG4BU01HiddenPatternGroups() {
  return G4B_U01_HIDDEN_PATTERN_GROUPS;
}

export function getG4BU01HiddenPatternSpecs() {
  return G4B_U01_HIDDEN_PATTERN_SPECS;
}

export function getG4BU01HiddenPatternSpecById(patternSpecId) {
  return G4B_U01_HIDDEN_PATTERN_SPECS.find((row) => row.patternSpecId === patternSpecId) ?? null;
}
