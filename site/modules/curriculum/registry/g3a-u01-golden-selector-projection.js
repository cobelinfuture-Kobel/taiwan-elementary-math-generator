export const G3A_U01_GOLDEN_SOURCE_ID = "g3a_u01_3a01";
export const G3A_U01_GOLDEN_SELECTOR_PROJECTION_VERSION = "postg-mig-a01-g3a-u01-v1";

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freeze(nested);
  return Object.freeze(value);
}

const DEFINITIONS = freeze([
  {
    knowledgePointId: "kp_g3a_u01_place_value_decompose",
    displayName: "四位數位值分解",
    canonicalSkillTags: ["number_place_value", "place_value_decomposition"],
    patternGroupId: "pg_g3a_u01_place_value_decompose",
    patternSpecIds: [
      "ps_g3a_u01_4digit_place_value_full_decomposition",
      "ps_g3a_u01_4digit_digit_value_identification",
      "ps_g3a_u01_4digit_same_digit_different_place"
    ]
  },
  {
    knowledgePointId: "kp_g3a_u01_place_value_compose",
    displayName: "四位數位值組合",
    canonicalSkillTags: ["number_place_value", "place_value_composition"],
    patternGroupId: "pg_g3a_u01_place_value_compose",
    patternSpecIds: [
      "ps_g3a_u01_place_value_standard_composition",
      "ps_g3a_u01_place_value_nonstandard_composition",
      "ps_g3a_u01_place_value_partial_composition",
      "ps_g3a_u01_tens_to_hundreds_conversion",
      "ps_g3a_u01_hundreds_to_thousands_conversion"
    ]
  },
  {
    knowledgePointId: "kp_g3a_u01_number_to_chinese",
    displayName: "四位數數字寫中文",
    canonicalSkillTags: ["number_reading_writing", "number_to_chinese"],
    patternGroupId: "pg_g3a_u01_number_to_chinese",
    patternSpecIds: ["ps_g3a_u01_4digit_number_to_chinese_basic"]
  },
  {
    knowledgePointId: "kp_g3a_u01_chinese_to_number",
    displayName: "四位數中文寫數字",
    canonicalSkillTags: ["number_reading_writing", "chinese_to_number"],
    patternGroupId: "pg_g3a_u01_chinese_to_number",
    patternSpecIds: ["ps_g3a_u01_chinese_to_4digit_number_basic"]
  },
  {
    knowledgePointId: "kp_g3a_u01_zero_reading",
    displayName: "中間有 0 的四位數讀寫",
    canonicalSkillTags: ["number_reading_writing", "zero_handling"],
    patternGroupId: "pg_g3a_u01_zero_reading",
    patternSpecIds: [
      "ps_g3a_u01_4digit_number_to_chinese_with_zero",
      "ps_g3a_u01_chinese_to_4digit_number_with_zero"
    ]
  },
  {
    knowledgePointId: "kp_g3a_u01_place_sequence",
    displayName: "依位值步進的四位數規律",
    canonicalSkillTags: ["number_sequence", "place_value_step"],
    patternGroupId: "pg_g3a_u01_place_sequence",
    patternSpecIds: ["ps_g3a_u01_place_sequence_step"]
  },
  {
    knowledgePointId: "kp_g3a_u01_between_numbers",
    displayName: "兩數之間的規律",
    canonicalSkillTags: ["number_sequence", "between_numbers"],
    patternGroupId: "pg_g3a_u01_between_numbers",
    patternSpecIds: ["ps_g3a_u01_between_numbers_sequence"]
  },
  {
    knowledgePointId: "kp_g3a_u01_number_compare",
    displayName: "四位數比大小與範圍判斷",
    canonicalSkillTags: ["number_comparison", "range_reasoning"],
    patternGroupId: "pg_g3a_u01_number_compare",
    patternSpecIds: [
      "ps_g3a_u01_4digit_compare",
      "ps_g3a_u01_4digit_range_compare_reasoning",
      "ps_g3a_u01_4digit_serial_number_range",
      "ps_g3a_u01_4digit_price_range_reasoning"
    ]
  },
  {
    knowledgePointId: "kp_g3a_u01_digit_permutation",
    displayName: "指定數字組成最大與最小四位數",
    canonicalSkillTags: ["place_value_reasoning", "digit_arrangement"],
    patternGroupId: "pg_g3a_u01_digit_permutation",
    patternSpecIds: [
      "ps_g3a_u01_digit_arrangement_max_4digit",
      "ps_g3a_u01_digit_arrangement_min_4digit_no_leading_zero",
      "ps_g3a_u01_digit_arrangement_max_min_pair"
    ]
  },
  {
    knowledgePointId: "kp_g3a_u01_number_line_reading",
    displayName: "整數數線文字替代判讀",
    canonicalSkillTags: ["number_line", "text_fallback"],
    patternGroupId: "pg_g3a_u01_number_line_reading",
    patternSpecIds: ["ps_g3a_u01_number_line_text_fallback"]
  },
  {
    knowledgePointId: "kp_g3a_u01_money_counting",
    displayName: "錢幣數量換算與合計",
    canonicalSkillTags: ["money_representation", "money_counting"],
    patternGroupId: "pg_g3a_u01_money_counting",
    patternSpecIds: ["ps_g3a_u01_money_counting_text_fallback"]
  },
  {
    knowledgePointId: "kp_g3a_u01_money_payment",
    displayName: "四位數錢幣付款與位值兌換",
    canonicalSkillTags: ["money_representation", "money_payment"],
    patternGroupId: "pg_g3a_u01_money_payment",
    patternSpecIds: ["ps_g3a_u01_money_place_value_exchange"]
  }
]);

const KNOWLEDGE_POINTS = freeze(DEFINITIONS.map((definition) => ({
  knowledgePointId: definition.knowledgePointId,
  sourceId: G3A_U01_GOLDEN_SOURCE_ID,
  unitCode: "3A-U01",
  unitTitle: "10000以內的數",
  displayName: definition.displayName,
  canonicalSkillTags: [...definition.canonicalSkillTags],
  canonicalPatternGroupIds: [definition.patternGroupId],
  canonicalPatternSpecIds: [...definition.patternSpecIds],
  visibilityStatus: "visible",
  htmlSelectableStatus: "selectable",
  selectorStatus: "visible",
  printableStatus: "supported",
  generatorStatus: "shared_runtime_supported",
  validatorStatus: "blocking_validator_supported",
  rendererStatus: "shared_renderer_supported",
  answerKeyStatus: "supported",
  productionUse: "allowed_golden_conformant",
  holdReason: null,
  goldenContractId: "G5AU08_GOLDEN_V1",
  goldenContractVersion: "1.0.0",
  projectionVersion: G3A_U01_GOLDEN_SELECTOR_PROJECTION_VERSION
})));

const PATTERN_GROUPS = freeze(DEFINITIONS.map((definition) => ({
  patternGroupId: definition.patternGroupId,
  knowledgePointId: definition.knowledgePointId,
  primaryKnowledgePointId: definition.knowledgePointId,
  sourceId: G3A_U01_GOLDEN_SOURCE_ID,
  unitCode: "3A-U01",
  displayName: definition.displayName,
  patternSpecIds: [...definition.patternSpecIds],
  representationTag: definition.knowledgePointId.includes("number_line") || definition.knowledgePointId.includes("money_counting")
    ? "deterministic_text_fallback"
    : "numeric_or_text_number_sense",
  visibilityStatus: "visible",
  htmlSelectableStatus: "selectable",
  generatorStatus: "shared_runtime_supported",
  validatorStatus: "blocking_validator_supported",
  htmlWorksheetStatus: "printable",
  answerKeyStatus: "supported",
  productionUse: "allowed_golden_conformant",
  holdReason: null,
  goldenContractId: "G5AU08_GOLDEN_V1",
  goldenContractVersion: "1.0.0",
  projectionVersion: G3A_U01_GOLDEN_SELECTOR_PROJECTION_VERSION
})));

const ROW_BY_ID = new Map(KNOWLEDGE_POINTS.map((row) => [row.knowledgePointId, row]));
const GROUPS_BY_KP = new Map(KNOWLEDGE_POINTS.map((row) => [
  row.knowledgePointId,
  PATTERN_GROUPS.filter((group) => group.knowledgePointId === row.knowledgePointId)
]));

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

export const G3A_U01_GOLDEN_SELECTOR_PROJECTION = freeze({
  sourceId: G3A_U01_GOLDEN_SOURCE_ID,
  projectionVersion: G3A_U01_GOLDEN_SELECTOR_PROJECTION_VERSION,
  knowledgePointCount: KNOWLEDGE_POINTS.length,
  patternGroupCount: PATTERN_GROUPS.length,
  patternSpecCount: new Set(PATTERN_GROUPS.flatMap((row) => row.patternSpecIds)).size,
  sourceBackedKnowledgePointCount: 12,
  textFallbackPatternSpecIds: [
    "ps_g3a_u01_number_line_text_fallback",
    "ps_g3a_u01_money_counting_text_fallback"
  ],
  perUnitRuntimeAdditions: { generator: 0, validator: 0, renderer: 0, workflow: 0 }
});

export function listG3AU01GoldenSelectorRows() {
  return KNOWLEDGE_POINTS.map(clone);
}

export function getG3AU01GoldenSelectorRow(knowledgePointId) {
  return clone(ROW_BY_ID.get(knowledgePointId) ?? null);
}

export function listG3AU01GoldenPatternGroups(knowledgePointId) {
  return clone(GROUPS_BY_KP.get(knowledgePointId) ?? []);
}

export function listG3AU01GoldenPatternSpecIds() {
  return [...new Set(PATTERN_GROUPS.flatMap((row) => row.patternSpecIds))];
}

export function auditG3AU01GoldenSelectorProjection() {
  const ids = new Set(KNOWLEDGE_POINTS.map((row) => row.knowledgePointId));
  const groupIds = new Set(PATTERN_GROUPS.map((row) => row.patternGroupId));
  const errors = [];
  if (KNOWLEDGE_POINTS.length !== 12 || ids.size !== 12) errors.push("G3A_U01_GOLDEN_KP_COUNT_INVALID");
  if (PATTERN_GROUPS.length !== 12 || groupIds.size !== 12) errors.push("G3A_U01_GOLDEN_GROUP_COUNT_INVALID");
  if (listG3AU01GoldenPatternSpecIds().length !== 24) errors.push("G3A_U01_GOLDEN_PATTERN_SPEC_COUNT_INVALID");
  if (KNOWLEDGE_POINTS.some((row) => row.visibilityStatus !== "visible" || row.productionUse !== "allowed_golden_conformant")) {
    errors.push("G3A_U01_GOLDEN_KP_VISIBILITY_INVALID");
  }
  if (PATTERN_GROUPS.some((row) => row.patternSpecIds.length === 0 || row.htmlWorksheetStatus !== "printable")) {
    errors.push("G3A_U01_GOLDEN_GROUP_RUNTIME_INVALID");
  }
  return freeze({
    ok: errors.length === 0,
    errors,
    counts: {
      knowledgePoints: KNOWLEDGE_POINTS.length,
      patternGroups: PATTERN_GROUPS.length,
      patternSpecs: listG3AU01GoldenPatternSpecIds().length
    }
  });
}
