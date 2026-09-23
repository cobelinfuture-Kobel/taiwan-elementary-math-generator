export const G5B_U05_SOURCE_ID = "g5b_u05_5b05a";
export const G5B_U05_UNIT_CODE = "5B-U05";
export const G5B_U05_UNIT_TITLE = "數的十進位結構與億以上的數";

const freeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freeze(nested);
  return Object.freeze(value);
};
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

export const G5B_U05_PATTERN_GROUPS = freeze([
  {
    patternGroupId: "pg_g5b_u05a_large_number_place_value",
    sourceId: G5B_U05_SOURCE_ID,
    unitCode: G5B_U05_UNIT_CODE,
    unitTitle: G5B_U05_UNIT_TITLE,
    displayName: "億以上大數位值",
    primaryKnowledgePointId: "kp_g5b_u05a_large_number_place_value_extension",
    knowledgePointIds: ["kp_g5b_u05a_large_number_place_value_extension"],
    supportClass: "A",
    mode: "numeric",
    publicQuestionMode: "numeric",
    representationTag: "large_number_place_value",
    representationTags: ["large_number_place_value", "text_numeric"],
    patternSpecIds: [
      "ps_g5b_u05a_large_number_digit_value",
      "ps_g5b_u05a_large_number_place_composition",
    ],
    allocationPolicy: "balanced_by_pattern_spec",
    visibilityStatus: "visible",
    holdReason: null,
  },
  {
    patternGroupId: "pg_g5b_u05a_large_number_read_write",
    sourceId: G5B_U05_SOURCE_ID,
    unitCode: G5B_U05_UNIT_CODE,
    unitTitle: G5B_U05_UNIT_TITLE,
    displayName: "億以上大數讀寫",
    primaryKnowledgePointId: "kp_g5b_u05a_large_number_read_write",
    knowledgePointIds: ["kp_g5b_u05a_large_number_read_write"],
    supportClass: "A",
    mode: "numeric",
    publicQuestionMode: "numeric",
    representationTag: "large_number_read_write",
    representationTags: ["large_number_read_write", "text_numeric"],
    patternSpecIds: [
      "ps_g5b_u05a_large_number_to_chinese",
      "ps_g5b_u05a_chinese_to_large_number",
    ],
    allocationPolicy: "balanced_by_pattern_spec",
    visibilityStatus: "visible",
    holdReason: null,
  },
  {
    patternGroupId: "pg_g5b_u05a_power_of_ten_scaling",
    sourceId: G5B_U05_SOURCE_ID,
    unitCode: G5B_U05_UNIT_CODE,
    unitTitle: G5B_U05_UNIT_TITLE,
    displayName: "乘除10的次方與位值移動",
    primaryKnowledgePointId: "kp_g5b_u05a_power_of_ten_scaling",
    knowledgePointIds: ["kp_g5b_u05a_power_of_ten_scaling"],
    supportClass: "A",
    mode: "numeric",
    publicQuestionMode: "numeric",
    representationTag: "power_of_ten_scaling",
    representationTags: ["power_of_ten_scaling", "place_value_shift"],
    patternSpecIds: [
      "ps_g5b_u05a_multiply_power_of_ten",
      "ps_g5b_u05a_divide_power_of_ten_exact",
    ],
    allocationPolicy: "balanced_by_pattern_spec",
    visibilityStatus: "visible",
    holdReason: null,
  },
  {
    patternGroupId: "pg_g5b_u05a_large_number_decompose_compare",
    sourceId: G5B_U05_SOURCE_ID,
    unitCode: G5B_U05_UNIT_CODE,
    unitTitle: G5B_U05_UNIT_TITLE,
    displayName: "大數分解與比較",
    primaryKnowledgePointId: "kp_g5b_u05a_large_number_decompose_compare",
    knowledgePointIds: ["kp_g5b_u05a_large_number_decompose_compare"],
    supportClass: "A",
    mode: "numeric",
    publicQuestionMode: "numeric",
    representationTag: "large_number_decompose_compare",
    representationTags: ["expanded_form", "large_number_comparison"],
    patternSpecIds: [
      "ps_g5b_u05a_large_number_expanded_form",
      "ps_g5b_u05a_large_number_compare",
    ],
    allocationPolicy: "balanced_by_pattern_spec",
    visibilityStatus: "visible",
    holdReason: null,
  },
]);

const GROUPS_BY_KP = new Map(G5B_U05_PATTERN_GROUPS.map((group) => [
  group.primaryKnowledgePointId,
  Object.freeze([group]),
]));

export const G5B_U05_KNOWLEDGE_POINT_ROWS = freeze([
  {
    knowledgePointId: "kp_g5b_u05a_large_number_place_value_extension",
    sourceId: G5B_U05_SOURCE_ID,
    unitCode: G5B_U05_UNIT_CODE,
    unitTitle: G5B_U05_UNIT_TITLE,
    displayName: "億以上大數位值",
    mode: "numeric",
    questionMode: "numeric",
    visibilityStatus: "visible",
    selectorStatus: "visible",
    holdReason: null,
    canonicalPatternGroupIds: ["pg_g5b_u05a_large_number_place_value"],
    canonicalPatternSpecIds: [
      "ps_g5b_u05a_large_number_digit_value",
      "ps_g5b_u05a_large_number_place_composition",
    ],
    productionUse: "full_product_w1_production",
  },
  {
    knowledgePointId: "kp_g5b_u05a_large_number_read_write",
    sourceId: G5B_U05_SOURCE_ID,
    unitCode: G5B_U05_UNIT_CODE,
    unitTitle: G5B_U05_UNIT_TITLE,
    displayName: "億以上大數讀寫",
    mode: "numeric",
    questionMode: "numeric",
    visibilityStatus: "visible",
    selectorStatus: "visible",
    holdReason: null,
    canonicalPatternGroupIds: ["pg_g5b_u05a_large_number_read_write"],
    canonicalPatternSpecIds: [
      "ps_g5b_u05a_large_number_to_chinese",
      "ps_g5b_u05a_chinese_to_large_number",
    ],
    productionUse: "full_product_w1_production",
  },
  {
    knowledgePointId: "kp_g5b_u05a_power_of_ten_scaling",
    sourceId: G5B_U05_SOURCE_ID,
    unitCode: G5B_U05_UNIT_CODE,
    unitTitle: G5B_U05_UNIT_TITLE,
    displayName: "乘除10的次方與位值移動",
    mode: "numeric",
    questionMode: "numeric",
    visibilityStatus: "visible",
    selectorStatus: "visible",
    holdReason: null,
    canonicalPatternGroupIds: ["pg_g5b_u05a_power_of_ten_scaling"],
    canonicalPatternSpecIds: [
      "ps_g5b_u05a_multiply_power_of_ten",
      "ps_g5b_u05a_divide_power_of_ten_exact",
    ],
    productionUse: "full_product_w1_production",
  },
  {
    knowledgePointId: "kp_g5b_u05a_large_number_decompose_compare",
    sourceId: G5B_U05_SOURCE_ID,
    unitCode: G5B_U05_UNIT_CODE,
    unitTitle: G5B_U05_UNIT_TITLE,
    displayName: "大數分解與比較",
    mode: "numeric",
    questionMode: "numeric",
    visibilityStatus: "visible",
    selectorStatus: "visible",
    holdReason: null,
    canonicalPatternGroupIds: ["pg_g5b_u05a_large_number_decompose_compare"],
    canonicalPatternSpecIds: [
      "ps_g5b_u05a_large_number_expanded_form",
      "ps_g5b_u05a_large_number_compare",
    ],
    productionUse: "full_product_w1_production",
  },
]);

const ROW_BY_ID = new Map(G5B_U05_KNOWLEDGE_POINT_ROWS.map((row) => [row.knowledgePointId, row]));

export const G5B_U05_PATTERN_SPEC_IDS = freeze(
  [...new Set(G5B_U05_PATTERN_GROUPS.flatMap((group) => group.patternSpecIds))],
);

export const G5B_U05_SELECTOR_PROJECTION = freeze({
  taskId: "P01D1_G5BU05LargeNumberVerticalSlice",
  sourceId: G5B_U05_SOURCE_ID,
  status: "FOUR_W1_KPS_PUBLIC_VERTICAL_SLICE",
  knowledgePointCount: G5B_U05_KNOWLEDGE_POINT_ROWS.length,
  patternGroupCount: G5B_U05_PATTERN_GROUPS.length,
  patternSpecCount: G5B_U05_PATTERN_SPEC_IDS.length,
  excludedKnowledgePointIds: ["kp_g5b_u05a_decimal_base10_structure"],
  publicSelectionEnabled: true,
  sharedPipelineRequired: true,
});

export function listG5BU05SelectorRows() {
  return clone(G5B_U05_KNOWLEDGE_POINT_ROWS);
}

export function getG5BU05SelectorRow(knowledgePointId) {
  return clone(ROW_BY_ID.get(knowledgePointId) ?? null);
}

export function listG5BU05SelectorPatternGroups(knowledgePointId) {
  return clone(GROUPS_BY_KP.get(knowledgePointId) ?? []);
}

export function resolveG5BU05SelectorPatternSpecIds(knowledgePointId) {
  return [...new Set(listG5BU05SelectorPatternGroups(knowledgePointId).flatMap((group) => group.patternSpecIds ?? []))];
}

export function auditG5BU05SelectorProjection() {
  const errors = [];
  const rowIds = G5B_U05_KNOWLEDGE_POINT_ROWS.map((row) => row.knowledgePointId);
  const groupIds = G5B_U05_PATTERN_GROUPS.map((group) => group.patternGroupId);
  if (rowIds.length !== 4 || new Set(rowIds).size !== 4) errors.push("G5B_U05_KP_COUNT_OR_IDENTITY_INVALID");
  if (groupIds.length !== 4 || new Set(groupIds).size !== 4) errors.push("G5B_U05_PATTERN_GROUP_COUNT_OR_IDENTITY_INVALID");
  if (G5B_U05_PATTERN_SPEC_IDS.length !== 8) errors.push("G5B_U05_PATTERN_SPEC_COUNT_INVALID");
  if (G5B_U05_KNOWLEDGE_POINT_ROWS.some((row) => row.visibilityStatus !== "visible" || row.holdReason !== null)) errors.push("G5B_U05_KP_VISIBILITY_INVALID");
  if (G5B_U05_PATTERN_GROUPS.some((group) => group.visibilityStatus !== "visible" || group.holdReason !== null)) errors.push("G5B_U05_GROUP_VISIBILITY_INVALID");
  if (G5B_U05_KNOWLEDGE_POINT_ROWS.some((row) => listG5BU05SelectorPatternGroups(row.knowledgePointId).length !== 1)) errors.push("G5B_U05_KP_GROUP_BINDING_INVALID");
  if (rowIds.includes("kp_g5b_u05a_decimal_base10_structure")) errors.push("G5B_U05_DECIMAL_KP_SCOPE_VIOLATION");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({ knowledgePoints: rowIds.length, patternGroups: groupIds.length, patternSpecs: G5B_U05_PATTERN_SPEC_IDS.length }),
  });
}
