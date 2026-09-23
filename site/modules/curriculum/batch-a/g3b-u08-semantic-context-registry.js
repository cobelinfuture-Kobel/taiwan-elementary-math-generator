import {
  getG3BU08SemanticPatternDefinition,
  listG3BU08SemanticPatternDefinitions
} from "./source-pattern-g3b-u08-semantic-extension.js";

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

function row(templateFamilyId, variants) {
  return variants.map((variant, index) => ({
    contextVariantId: `ctx_${templateFamilyId.slice(4)}_${variant.key}`,
    templateFamilyId,
    variantOrder: index + 1,
    contextDomain: variant.contextDomain,
    sceneLabelZh: variant.sceneLabelZh,
    bindings: variant.bindings,
    answerUnit: variant.answerUnit ?? null,
    comparisonDimension: variant.comparisonDimension ?? null,
    realismProfile: {
      gradeBand: "grade_3",
      locale: "zh-TW",
      numberDomain: "positive_integers",
      representation: "horizontal_only",
      publicUse: "forbidden",
      ...variant.realismProfile
    },
    status: "approved_hidden_s58d_context_variant"
  }));
}

const rows = [
  ...row("tpl_g3b_u08_total_daily_saving_accumulation", [
    { key: "saving_xiaoan", contextDomain: "saving", sceneLabelZh: "每日存錢", bindings: { person: "小安" }, answerUnit: "元" },
    { key: "allowance_xiaomei", contextDomain: "allowance", sceneLabelZh: "零用錢儲蓄", bindings: { person: "小美" }, answerUnit: "元" },
    { key: "saving_xiaojie", contextDomain: "saving", sceneLabelZh: "存錢目標", bindings: { person: "小杰" }, answerUnit: "元" }
  ]),
  ...row("tpl_g3b_u08_total_score_per_success", [
    { key: "basketball", contextDomain: "sports", sceneLabelZh: "籃球得分", bindings: { person: "小安", successAction: "投進一球", successVerb: "投進", eventUnit: "球" }, answerUnit: "分" },
    { key: "quiz", contextDomain: "game", sceneLabelZh: "答題得分", bindings: { person: "小美", successAction: "答對一題", successVerb: "答對", eventUnit: "題" }, answerUnit: "分" },
    { key: "level", contextDomain: "game", sceneLabelZh: "闖關得分", bindings: { person: "小杰", successAction: "完成一關", successVerb: "完成", eventUnit: "關" }, answerUnit: "分" }
  ]),
  ...row("tpl_g3b_u08_total_material_per_product", [
    { key: "paper_card", contextDomain: "craft", sceneLabelZh: "製作卡片", bindings: { productUnit: "張", product: "卡片", materialUnit: "張", material: "色紙" }, answerUnit: "張" },
    { key: "bracelet", contextDomain: "craft", sceneLabelZh: "製作手鍊", bindings: { productUnit: "條", product: "手鍊", materialUnit: "顆", material: "珠子" }, answerUnit: "顆" },
    { key: "paper_flower", contextDomain: "classroom", sceneLabelZh: "製作紙花", bindings: { productUnit: "朵", product: "紙花", materialUnit: "張", material: "色紙" }, answerUnit: "張" }
  ]),
  ...row("tpl_g3b_u08_total_items_per_package", [
    { key: "cookies", contextDomain: "food", sceneLabelZh: "餅乾包裝", bindings: { packageUnit: "包", package: "餅乾", itemUnit: "片", item: "餅乾" }, answerUnit: "片" },
    { key: "crayons", contextDomain: "stationery", sceneLabelZh: "蠟筆盒", bindings: { packageUnit: "盒", package: "蠟筆", itemUnit: "枝", item: "蠟筆" }, answerUnit: "枝" },
    { key: "blocks", contextDomain: "toys", sceneLabelZh: "積木袋", bindings: { packageUnit: "袋", package: "積木", itemUnit: "塊", item: "積木" }, answerUnit: "塊" }
  ]),
  ...row("tpl_g3b_u08_group_count_score_events", [
    { key: "basketball", contextDomain: "sports", sceneLabelZh: "反推投球數", bindings: { person: "小安", successAction: "投進一球", successVerb: "投進", eventUnit: "球" }, answerUnit: "球" },
    { key: "quiz", contextDomain: "game", sceneLabelZh: "反推答對題數", bindings: { person: "小美", successAction: "答對一題", successVerb: "答對", eventUnit: "題" }, answerUnit: "題" },
    { key: "level", contextDomain: "game", sceneLabelZh: "反推完成關數", bindings: { person: "小杰", successAction: "完成一關", successVerb: "完成", eventUnit: "關" }, answerUnit: "關" }
  ]),
  ...row("tpl_g3b_u08_group_count_craft_products", [
    { key: "bracelet", contextDomain: "craft", sceneLabelZh: "珠子做手鍊", bindings: { materialUnit: "顆", material: "珠子", productUnit: "條", product: "手鍊" }, answerUnit: "條" },
    { key: "necklace", contextDomain: "jewelry", sceneLabelZh: "珠子做項鍊", bindings: { materialUnit: "顆", material: "珠子", productUnit: "條", product: "項鍊" }, answerUnit: "條" },
    { key: "paper_flower", contextDomain: "craft", sceneLabelZh: "色紙做紙花", bindings: { materialUnit: "張", material: "色紙", productUnit: "朵", product: "紙花" }, answerUnit: "朵" }
  ]),
  ...row("tpl_g3b_u08_group_count_equal_segments", [
    { key: "ribbon", contextDomain: "ribbon", sceneLabelZh: "緞帶剪段", bindings: { item: "緞帶", lengthUnit: "公分" }, answerUnit: "段" },
    { key: "rope", contextDomain: "rope", sceneLabelZh: "繩子剪段", bindings: { item: "繩子", lengthUnit: "公分" }, answerUnit: "段" },
    { key: "paper_strip", contextDomain: "paper_strip", sceneLabelZh: "紙條剪段", bindings: { item: "紙條", lengthUnit: "公分" }, answerUnit: "段" }
  ]),
  ...row("tpl_g3b_u08_group_count_packaging", [
    { key: "oranges", contextDomain: "food", sceneLabelZh: "橘子裝袋", bindings: { itemUnit: "顆", item: "橘子", packageUnit: "袋" }, answerUnit: "袋" },
    { key: "pencils", contextDomain: "classroom", sceneLabelZh: "鉛筆裝盒", bindings: { itemUnit: "枝", item: "鉛筆", packageUnit: "盒" }, answerUnit: "盒" },
    { key: "tennis_balls", contextDomain: "sports", sceneLabelZh: "網球裝筒", bindings: { itemUnit: "顆", item: "網球", packageUnit: "筒" }, answerUnit: "筒" }
  ]),
  ...row("tpl_g3b_u08_per_group_daily_saving", [
    { key: "saving_xiaoan", contextDomain: "saving", sceneLabelZh: "平均每日存款", bindings: { person: "小安" }, answerUnit: "元" },
    { key: "allowance_xiaomei", contextDomain: "allowance", sceneLabelZh: "平均每日零用錢儲蓄", bindings: { person: "小美" }, answerUnit: "元" },
    { key: "saving_xiaojie", contextDomain: "saving", sceneLabelZh: "平均每日存錢", bindings: { person: "小杰" }, answerUnit: "元" }
  ]),
  ...row("tpl_g3b_u08_per_group_equal_share_people", [
    { key: "pencils", contextDomain: "classroom", sceneLabelZh: "平均分鉛筆", bindings: { itemUnit: "枝", item: "鉛筆" }, answerUnit: "枝" },
    { key: "cookies", contextDomain: "snacks", sceneLabelZh: "平均分餅乾", bindings: { itemUnit: "片", item: "餅乾" }, answerUnit: "片" },
    { key: "beads", contextDomain: "craft", sceneLabelZh: "平均分珠子", bindings: { itemUnit: "顆", item: "珠子" }, answerUnit: "顆" }
  ]),
  ...row("tpl_g3b_u08_per_group_equal_container_capacity", [
    { key: "juice_bottles", contextDomain: "drinks", sceneLabelZh: "果汁平均裝瓶", bindings: { capacityUnit: "毫升", liquid: "果汁", containerUnit: "瓶" }, answerUnit: "毫升" },
    { key: "soup_bowls", contextDomain: "cooking", sceneLabelZh: "湯平均裝碗", bindings: { capacityUnit: "毫升", liquid: "湯", containerUnit: "碗" }, answerUnit: "毫升" },
    { key: "colored_water_cups", contextDomain: "experiment", sceneLabelZh: "色水平均裝杯", bindings: { capacityUnit: "毫升", liquid: "色水", containerUnit: "杯" }, answerUnit: "毫升" }
  ]),
  ...row("tpl_g3b_u08_per_group_equal_segment_length", [
    { key: "ribbon", contextDomain: "ribbon", sceneLabelZh: "緞帶平均分段", bindings: { item: "緞帶", lengthUnit: "公分" }, answerUnit: "公分" },
    { key: "rope", contextDomain: "rope", sceneLabelZh: "繩子平均分段", bindings: { item: "繩子", lengthUnit: "公分" }, answerUnit: "公分" },
    { key: "track", contextDomain: "track", sceneLabelZh: "跑道平均分段", bindings: { item: "跑道", lengthUnit: "公尺" }, answerUnit: "公尺" }
  ]),
  ...row("tpl_g3b_u08_reverse_base_price_multiple", [
    { key: "clothing", contextDomain: "clothing", sceneLabelZh: "服飾價格倍數", bindings: { item1: "外套", item2: "帽子" }, answerUnit: "元" },
    { key: "stationery", contextDomain: "stationery", sceneLabelZh: "文具價格倍數", bindings: { item1: "書包", item2: "鉛筆盒" }, answerUnit: "元" },
    { key: "daily_goods", contextDomain: "daily_goods", sceneLabelZh: "日用品價格倍數", bindings: { item1: "大浴巾", item2: "小毛巾" }, answerUnit: "元" }
  ]),
  ...row("tpl_g3b_u08_reverse_base_quantity_multiple", [
    { key: "cards", contextDomain: "collections", sceneLabelZh: "卡片數量倍數", bindings: { person1: "小安", person2: "小美", itemUnit: "張", item: "卡片" }, answerUnit: "張" },
    { key: "books", contextDomain: "books", sceneLabelZh: "故事書數量倍數", bindings: { person1: "小杰", person2: "小華", itemUnit: "本", item: "故事書" }, answerUnit: "本" },
    { key: "stickers", contextDomain: "stickers", sceneLabelZh: "貼紙數量倍數", bindings: { person1: "小美", person2: "小安", itemUnit: "張", item: "貼紙" }, answerUnit: "張" }
  ]),
  ...row("tpl_g3b_u08_reverse_base_length_multiple", [
    { key: "ribbon", contextDomain: "ribbon", sceneLabelZh: "緞帶長度倍數", bindings: { item1: "紅緞帶", item2: "藍緞帶", lengthUnit: "公分" }, answerUnit: "公分" },
    { key: "rope", contextDomain: "rope", sceneLabelZh: "繩子長度倍數", bindings: { item1: "長繩", item2: "短繩", lengthUnit: "公分" }, answerUnit: "公分" },
    { key: "track", contextDomain: "track", sceneLabelZh: "跑道長度倍數", bindings: { item1: "主跑道", item2: "練習跑道", lengthUnit: "公尺" }, answerUnit: "公尺" }
  ]),
  ...row("tpl_g3b_u08_reverse_base_capacity_multiple", [
    { key: "jugs", contextDomain: "containers", sceneLabelZh: "水壺容量倍數", bindings: { container1: "大水壺", container2: "小水壺", capacityUnit: "毫升" }, answerUnit: "毫升" },
    { key: "juice_bottles", contextDomain: "drinks", sceneLabelZh: "果汁瓶容量倍數", bindings: { container1: "大瓶果汁", container2: "小瓶果汁", capacityUnit: "毫升" }, answerUnit: "毫升" },
    { key: "measuring_cups", contextDomain: "containers", sceneLabelZh: "量杯容量倍數", bindings: { container1: "大量杯", container2: "小量杯", capacityUnit: "毫升" }, answerUnit: "毫升" }
  ]),
  ...row("tpl_g3b_u08_estimate_near_hundred_total", [
    { key: "notebooks", contextDomain: "shopping", sceneLabelZh: "筆記本估價", bindings: { itemUnit: "本", item: "筆記本" }, answerUnit: "元" },
    { key: "cakes", contextDomain: "food", sceneLabelZh: "蛋糕估價", bindings: { itemUnit: "盒", item: "蛋糕" }, answerUnit: "元" },
    { key: "colored_pencils", contextDomain: "shopping", sceneLabelZh: "色鉛筆估價", bindings: { itemUnit: "盒", item: "色鉛筆" }, answerUnit: "元" }
  ]),
  ...row("tpl_g3b_u08_estimate_budget_sufficiency_upper", [
    { key: "notebooks", contextDomain: "shopping", sceneLabelZh: "筆記本預算", bindings: { itemUnit: "本", item: "筆記本" }, answerUnit: "元" },
    { key: "cakes", contextDomain: "food", sceneLabelZh: "蛋糕預算", bindings: { itemUnit: "盒", item: "蛋糕" }, answerUnit: "元" },
    { key: "colored_pencils", contextDomain: "shopping", sceneLabelZh: "色鉛筆預算", bindings: { itemUnit: "盒", item: "色鉛筆" }, answerUnit: "元" }
  ]),
  ...row("tpl_g3b_u08_estimate_exact_over_benchmark", [
    { key: "notebooks", contextDomain: "shopping", sceneLabelZh: "筆記本超出整百基準", bindings: { itemUnit: "本", item: "筆記本" }, answerUnit: "元" },
    { key: "cakes", contextDomain: "food", sceneLabelZh: "蛋糕超出整百基準", bindings: { itemUnit: "盒", item: "蛋糕" }, answerUnit: "元" },
    { key: "colored_pencils", contextDomain: "shopping", sceneLabelZh: "色鉛筆超出整百基準", bindings: { itemUnit: "盒", item: "色鉛筆" }, answerUnit: "元" }
  ]),
  ...row("tpl_g3b_u08_estimate_exact_under_benchmark", [
    { key: "notebooks", contextDomain: "shopping", sceneLabelZh: "筆記本低於整百基準", bindings: { itemUnit: "本", item: "筆記本" }, answerUnit: "元" },
    { key: "cakes", contextDomain: "food", sceneLabelZh: "蛋糕低於整百基準", bindings: { itemUnit: "盒", item: "蛋糕" }, answerUnit: "元" },
    { key: "colored_pencils", contextDomain: "shopping", sceneLabelZh: "色鉛筆低於整百基準", bindings: { itemUnit: "盒", item: "色鉛筆" }, answerUnit: "元" }
  ]),
  ...row("tpl_g3b_u08_same_price_compare_weight", [
    { key: "cookies", contextDomain: "food", sceneLabelZh: "同價餅乾重量", bindings: { item: "餅乾" }, answerUnit: "克", comparisonDimension: "weight" },
    { key: "nuts", contextDomain: "food", sceneLabelZh: "同價堅果重量", bindings: { item: "堅果" }, answerUnit: "克", comparisonDimension: "weight" },
    { key: "rice_crackers", contextDomain: "food", sceneLabelZh: "同價米果重量", bindings: { item: "米果" }, answerUnit: "克", comparisonDimension: "weight" }
  ]),
  ...row("tpl_g3b_u08_same_price_compare_capacity", [
    { key: "juice", contextDomain: "drinks", sceneLabelZh: "同價果汁容量", bindings: { item: "果汁", containerUnit: "瓶", capacityUnit: "毫升" }, answerUnit: "毫升", comparisonDimension: "capacity" },
    { key: "milk", contextDomain: "drinks", sceneLabelZh: "同價牛奶容量", bindings: { item: "牛奶", containerUnit: "盒", capacityUnit: "毫升" }, answerUnit: "毫升", comparisonDimension: "capacity" },
    { key: "water", contextDomain: "drinks", sceneLabelZh: "同價飲用水容量", bindings: { item: "飲用水", containerUnit: "瓶", capacityUnit: "毫升" }, answerUnit: "毫升", comparisonDimension: "capacity" }
  ]),
  ...row("tpl_g3b_u08_same_price_compare_item_count", [
    { key: "pencils", contextDomain: "stationery", sceneLabelZh: "同價鉛筆數量", bindings: { item: "鉛筆", packageUnit: "盒", itemUnit: "枝" }, answerUnit: "枝", comparisonDimension: "count" },
    { key: "stickers", contextDomain: "stickers", sceneLabelZh: "同價貼紙數量", bindings: { item: "貼紙", packageUnit: "包", itemUnit: "張" }, answerUnit: "張", comparisonDimension: "count" },
    { key: "blocks", contextDomain: "toys", sceneLabelZh: "同價積木數量", bindings: { item: "積木", packageUnit: "袋", itemUnit: "塊" }, answerUnit: "塊", comparisonDimension: "count" }
  ]),
  ...row("tpl_g3b_u08_same_price_compare_total_length", [
    { key: "ribbon", contextDomain: "ribbon", sceneLabelZh: "同價緞帶長度", bindings: { item: "緞帶", lengthUnit: "公分" }, answerUnit: "公分", comparisonDimension: "length" },
    { key: "rope", contextDomain: "rope", sceneLabelZh: "同價繩子長度", bindings: { item: "繩子", lengthUnit: "公分" }, answerUnit: "公分", comparisonDimension: "length" },
    { key: "streamer", contextDomain: "ribbon", sceneLabelZh: "同價彩帶長度", bindings: { item: "彩帶", lengthUnit: "公分" }, answerUnit: "公分", comparisonDimension: "length" }
  ])
];

export const G3B_U08_SEMANTIC_CONTEXT_VARIANTS = deepFreeze(rows);

const byId = new Map(rows.map((variant) => [variant.contextVariantId, variant]));
const byFamily = new Map();
for (const variant of rows) {
  const existing = byFamily.get(variant.templateFamilyId) ?? [];
  existing.push(variant);
  byFamily.set(variant.templateFamilyId, existing);
}

function clone(value) {
  if (Array.isArray(value)) return value.map((entry) => clone(entry));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, clone(entry)]));
  }
  return value;
}

export function getG3BU08SemanticContextVariant(contextVariantId) {
  const variant = byId.get(contextVariantId);
  return variant ? clone(variant) : null;
}

export function listG3BU08SemanticContextVariants() {
  return rows.map((variant) => clone(variant));
}

export function listG3BU08SemanticContextVariantsForFamily(templateFamilyId) {
  return (byFamily.get(templateFamilyId) ?? []).map((variant) => clone(variant));
}

export function listG3BU08SemanticContextVariantsForPatternSpec(patternSpecId) {
  const spec = getG3BU08SemanticPatternDefinition(patternSpecId);
  return spec ? listG3BU08SemanticContextVariantsForFamily(spec.templateFamilyId) : [];
}

export function validateG3BU08SemanticContextRegistry() {
  const errors = [];
  const specs = listG3BU08SemanticPatternDefinitions();
  const specByFamily = new Map(specs.map((spec) => [spec.templateFamilyId, spec]));
  if (rows.length !== 72) errors.push(`Expected 72 context variants, received ${rows.length}.`);
  if (new Set(rows.map((variant) => variant.contextVariantId)).size !== rows.length) {
    errors.push("Context variant ids are not unique.");
  }
  for (const spec of specs) {
    const variants = byFamily.get(spec.templateFamilyId) ?? [];
    if (variants.length !== 3) errors.push(`${spec.templateFamilyId} must have exactly three context variants.`);
    for (const variant of variants) {
      if (!spec.contextDomains.includes(variant.contextDomain)) {
        errors.push(`${variant.contextVariantId} uses unapproved context domain '${variant.contextDomain}'.`);
      }
      if (variant.realismProfile.representation !== "horizontal_only") {
        errors.push(`${variant.contextVariantId} escaped the horizontal-only boundary.`);
      }
    }
  }
  for (const variant of rows) {
    if (!specByFamily.has(variant.templateFamilyId)) {
      errors.push(`${variant.contextVariantId} references an unknown template family.`);
    }
  }
  return { ok: errors.length === 0, errors };
}
