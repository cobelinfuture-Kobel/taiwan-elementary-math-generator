export const PATH1_P1_03_MULTIPLICATIVE_MODELING_PRACTICE_MODE = "multiplicativeModelingTransfer";
export const PATH1_P1_03_MULTIPLICATIVE_MODELING_OPERATION_FAMILY_ID =
  "PATH1_P1_03_MULTIPLICATIVE_MODELING_TRANSFER";
export const PATH1_P1_03_MULTIPLICATIVE_MODELING_ARITHMETIC_KP_ID =
  "kp_g4a_u02_2digit_by_2digit";
export const PATH1_P1_03_MULTIPLICATIVE_MODELING_RELATION_KP_ID =
  "kp_g3b_u08_total_from_groups";
export const PATH1_P1_03_MULTIPLICATIVE_MODELING_RELATION_ID = "R03_EQUAL_GROUPS";
export const PATH1_P1_03_MULTIPLICATIVE_MODELING_INVARIANT =
  "totalAmount = amountPerGroup * groupCount";
export const PATH1_P1_03_MULTIPLICATIVE_MODELING_LANGUAGE_DIFFICULTY =
  "LD0_DIRECT_ROLE_EXPLICIT";
export const PATH1_P1_03_MULTIPLICATIVE_MODELING_MASTERY_CREDIT =
  "NONE_UNTIL_SEPARATE_MASTERY_INTEGRATION_APPROVAL";

function context(contextVariantId, itemLabel, perGroupUnit, groupUnit, promptTemplate) {
  return Object.freeze({
    contextVariantId,
    itemLabel,
    perGroupUnit,
    groupUnit,
    answerUnit: perGroupUnit,
    promptTemplate,
  });
}

function spec({
  patternSpecId,
  sourceParentPatternSpecId,
  semanticShape,
  contexts,
}) {
  return Object.freeze({
    patternSpecId,
    sourceParentPatternSpecId,
    sourceSurfaceLineageOnly: true,
    sourceParentNumericAuthorityReused: false,
    path1BlockId: "P1-03",
    arithmeticKnowledgePointId: PATH1_P1_03_MULTIPLICATIVE_MODELING_ARITHMETIC_KP_ID,
    relationKnowledgePointId: PATH1_P1_03_MULTIPLICATIVE_MODELING_RELATION_KP_ID,
    relationId: PATH1_P1_03_MULTIPLICATIVE_MODELING_RELATION_ID,
    canonicalInvariant: PATH1_P1_03_MULTIPLICATIVE_MODELING_INVARIANT,
    unknownRole: "totalAmount",
    languageDifficulty: PATH1_P1_03_MULTIPLICATIVE_MODELING_LANGUAGE_DIFFICULTY,
    semanticShape,
    numericEnvelope: Object.freeze({
      amountPerGroupMin: 10,
      amountPerGroupMax: 99,
      groupCountMin: 10,
      groupCountMax: 99,
      totalAmountMin: 100,
      totalAmountMax: 9801,
    }),
    contexts: Object.freeze(contexts),
  });
}

export const PATH1_P1_03_MULTIPLICATIVE_MODELING_PATTERN_SPECS = Object.freeze([
  spec({
    patternSpecId: "P103_R03_ITEMS_PER_PACKAGE_TOTAL",
    sourceParentPatternSpecId: "ps_g3b_u08_total_items_per_package",
    semanticShape: "itemsPerPackage * packageCount = totalItems",
    contexts: [
      context(
        "cookies_box",
        "餅乾",
        "片",
        "盒",
        "一盒餅乾有{amountPerGroup}片，有{groupCount}盒，一共有多少片餅乾？",
      ),
      context(
        "colored_pencils_box",
        "彩色筆",
        "枝",
        "盒",
        "一盒彩色筆有{amountPerGroup}枝，有{groupCount}盒，一共有多少枝彩色筆？",
      ),
      context(
        "workbooks_carton",
        "練習簿",
        "本",
        "箱",
        "每箱有{amountPerGroup}本練習簿，有{groupCount}箱，一共有多少本練習簿？",
      ),
    ],
  }),
  spec({
    patternSpecId: "P103_R03_MATERIAL_PER_PRODUCT_TOTAL",
    sourceParentPatternSpecId: "ps_g3b_u08_total_material_per_product",
    semanticShape: "materialPerProduct * productCount = totalMaterial",
    contexts: [
      context(
        "paper_flower",
        "色紙",
        "張",
        "個紙花",
        "做一個紙花需要{amountPerGroup}張色紙，做{groupCount}個紙花，共需要多少張色紙？",
      ),
      context(
        "model_parts",
        "零件",
        "個",
        "台模型",
        "組一台模型需要{amountPerGroup}個零件，組{groupCount}台模型，共需要多少個零件？",
      ),
      context(
        "bracelet_beads",
        "珠子",
        "顆",
        "串手環",
        "做一串手環需要{amountPerGroup}顆珠子，做{groupCount}串手環，共需要多少顆珠子？",
      ),
    ],
  }),
  spec({
    patternSpecId: "P103_R03_SCORE_PER_EVENT_TOTAL",
    sourceParentPatternSpecId: "ps_g3b_u08_total_score_per_success",
    semanticShape: "scorePerEvent * eventCount = totalScore",
    contexts: [
      context(
        "quiz_correct",
        "分數",
        "分",
        "題",
        "每答對一題得{amountPerGroup}分，答對{groupCount}題，一共得多少分？",
      ),
      context(
        "game_level",
        "分數",
        "分",
        "關",
        "每完成一關得{amountPerGroup}分，完成{groupCount}關，一共得多少分？",
      ),
      context(
        "challenge_score",
        "分數",
        "分",
        "項挑戰",
        "每完成一項挑戰得{amountPerGroup}分，完成{groupCount}項挑戰，一共得多少分？",
      ),
    ],
  }),
  spec({
    patternSpecId: "P103_R03_AMOUNT_PER_PERIOD_TOTAL",
    sourceParentPatternSpecId: "ps_g3b_u08_total_daily_saving_accumulation",
    semanticShape: "amountPerPeriod * periodCount = totalAmount",
    contexts: [
      context(
        "reading_pages_daily",
        "閱讀頁數",
        "頁",
        "天",
        "每天閱讀{amountPerGroup}頁，連續{groupCount}天，共閱讀多少頁？",
      ),
      context(
        "saving_daily",
        "存款",
        "元",
        "天",
        "每天存{amountPerGroup}元，連續{groupCount}天，共存多少元？",
      ),
      context(
        "practice_minutes_weekly",
        "練習時間",
        "分鐘",
        "週",
        "每週練習{amountPerGroup}分鐘，連續{groupCount}週，共練習多少分鐘？",
      ),
    ],
  }),
]);

export const PATH1_P1_03_MULTIPLICATIVE_MODELING_PATTERN_SPEC_IDS = Object.freeze(
  PATH1_P1_03_MULTIPLICATIVE_MODELING_PATTERN_SPECS.map(({ patternSpecId }) => patternSpecId),
);

const SPEC_BY_ID = new Map(
  PATH1_P1_03_MULTIPLICATIVE_MODELING_PATTERN_SPECS.map((entry) => [entry.patternSpecId, entry]),
);

export function getPath1P103MultiplicativeModelingPatternSpec(patternSpecId) {
  return SPEC_BY_ID.get(patternSpecId) ?? null;
}

export function getPath1P103MultiplicativeModelingContext(patternSpecId, contextVariantId) {
  const patternSpec = getPath1P103MultiplicativeModelingPatternSpec(patternSpecId);
  return patternSpec?.contexts.find((entry) => entry.contextVariantId === contextVariantId) ?? null;
}

export function renderPath1P103MultiplicativeModelingPrompt({
  patternSpecId,
  contextVariantId,
  amountPerGroup,
  groupCount,
}) {
  const contextEntry = getPath1P103MultiplicativeModelingContext(patternSpecId, contextVariantId);
  if (!contextEntry) return null;
  return contextEntry.promptTemplate
    .replaceAll("{amountPerGroup}", String(amountPerGroup))
    .replaceAll("{groupCount}", String(groupCount));
}
