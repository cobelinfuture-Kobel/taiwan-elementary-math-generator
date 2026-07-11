const SOURCE_ID = "g3b_u08_3b08";

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

function profile(templateFamilyId, suffix, contextDomain, bindings, options = {}) {
  return {
    scenarioId: `scn_g3b_u08_${suffix}`,
    sourceId: SOURCE_ID,
    templateFamilyId,
    contextDomain,
    bindings,
    answerUnit: options.answerUnit ?? null,
    comparisonDimension: options.comparisonDimension ?? null,
    scale: options.scale ?? 1,
    realismProfile: {
      audience: "taiwan_elementary_grade3",
      language: "zh-Hant",
      controlledContext: true,
      ownershipScope: options.ownershipScope ?? "single_actor_or_explicit_group",
      notes: options.notes ?? "deterministic_registered_context"
    }
  };
}

const profiles = [
  profile("tpl_g3b_u08_total_daily_saving_accumulation", "saving_piggy_bank", "saving", { person: "小安" }, { answerUnit: "元", scale: 5 }),
  profile("tpl_g3b_u08_total_daily_saving_accumulation", "saving_class_fund", "saving", { person: "小琪" }, { answerUnit: "元", scale: 10 }),
  profile("tpl_g3b_u08_total_daily_saving_accumulation", "allowance_envelope", "allowance", { person: "小明" }, { answerUnit: "元", scale: 5 }),

  profile("tpl_g3b_u08_total_score_per_success", "score_basketball", "sports", { person: "小凱", successAction: "投進一球", successVerb: "投進", eventUnit: "球" }, { answerUnit: "分" }),
  profile("tpl_g3b_u08_total_score_per_success", "score_quiz", "game", { person: "小芸", successAction: "答對一題", successVerb: "答對", eventUnit: "題" }, { answerUnit: "分" }),
  profile("tpl_g3b_u08_total_score_per_success", "score_level", "game", { person: "小哲", successAction: "完成一關", successVerb: "完成", eventUnit: "關" }, { answerUnit: "分" }),

  profile("tpl_g3b_u08_total_material_per_product", "material_bracelet_beads", "craft", { productUnit: "條", product: "手鍊", materialUnit: "顆", material: "珠子" }, { answerUnit: "顆" }),
  profile("tpl_g3b_u08_total_material_per_product", "material_card_stickers", "classroom", { productUnit: "張", product: "卡片", materialUnit: "張", material: "貼紙" }, { answerUnit: "張" }),
  profile("tpl_g3b_u08_total_material_per_product", "material_flower_paper", "craft", { productUnit: "朵", product: "紙花", materialUnit: "張", material: "色紙" }, { answerUnit: "張" }),

  profile("tpl_g3b_u08_total_items_per_package", "package_cookie_boxes", "food", { packageUnit: "盒", package: "餅乾", itemUnit: "片", item: "餅乾" }, { answerUnit: "片" }),
  profile("tpl_g3b_u08_total_items_per_package", "package_pencil_packs", "stationery", { packageUnit: "包", package: "鉛筆", itemUnit: "枝", item: "鉛筆" }, { answerUnit: "枝" }),
  profile("tpl_g3b_u08_total_items_per_package", "package_toy_boxes", "toys", { packageUnit: "箱", package: "玩具車", itemUnit: "輛", item: "玩具車" }, { answerUnit: "輛" }),

  profile("tpl_g3b_u08_group_count_score_events", "group_score_basketball", "sports", { person: "小凱", successAction: "投進一球", successVerb: "投進", eventUnit: "球" }, { answerUnit: "球" }),
  profile("tpl_g3b_u08_group_count_score_events", "group_score_quiz", "game", { person: "小芸", successAction: "答對一題", successVerb: "答對", eventUnit: "題" }, { answerUnit: "題" }),
  profile("tpl_g3b_u08_group_count_score_events", "group_score_level", "game", { person: "小哲", successAction: "完成一關", successVerb: "完成", eventUnit: "關" }, { answerUnit: "關" }),

  profile("tpl_g3b_u08_group_count_craft_products", "craft_bracelets", "craft", { materialUnit: "顆", material: "珠子", productUnit: "條", product: "手鍊" }, { answerUnit: "條" }),
  profile("tpl_g3b_u08_group_count_craft_products", "craft_necklaces", "jewelry", { materialUnit: "顆", material: "珠子", productUnit: "條", product: "項鍊" }, { answerUnit: "條" }),
  profile("tpl_g3b_u08_group_count_craft_products", "craft_paper_flowers", "craft", { materialUnit: "張", material: "色紙", productUnit: "朵", product: "紙花" }, { answerUnit: "朵" }),

  profile("tpl_g3b_u08_group_count_equal_segments", "segments_ribbon", "ribbon", { item: "緞帶", lengthUnit: "公分" }, { answerUnit: "段" }),
  profile("tpl_g3b_u08_group_count_equal_segments", "segments_rope", "rope", { item: "繩子", lengthUnit: "公分" }, { answerUnit: "段" }),
  profile("tpl_g3b_u08_group_count_equal_segments", "segments_paper_strip", "paper_strip", { item: "紙條", lengthUnit: "公分" }, { answerUnit: "段" }),

  profile("tpl_g3b_u08_group_count_packaging", "packaging_eggs", "food", { itemUnit: "顆", item: "雞蛋", packageUnit: "盒" }, { answerUnit: "盒" }),
  profile("tpl_g3b_u08_group_count_packaging", "packaging_pencils", "classroom", { itemUnit: "枝", item: "鉛筆", packageUnit: "盒" }, { answerUnit: "盒" }),
  profile("tpl_g3b_u08_group_count_packaging", "packaging_shuttlecocks", "sports", { itemUnit: "顆", item: "羽毛球", packageUnit: "筒" }, { answerUnit: "筒" }),

  profile("tpl_g3b_u08_per_group_daily_saving", "daily_saving_piggy_bank", "saving", { person: "小安" }, { answerUnit: "元", scale: 5 }),
  profile("tpl_g3b_u08_per_group_daily_saving", "daily_saving_class_goal", "saving", { person: "小琪" }, { answerUnit: "元", scale: 10 }),
  profile("tpl_g3b_u08_per_group_daily_saving", "daily_allowance_envelope", "allowance", { person: "小明" }, { answerUnit: "元", scale: 5 }),

  profile("tpl_g3b_u08_per_group_equal_share_people", "share_crayons", "classroom", { itemUnit: "枝", item: "蠟筆" }, { answerUnit: "枝", ownershipScope: "explicit_recipient_group" }),
  profile("tpl_g3b_u08_per_group_equal_share_people", "share_cookies", "snacks", { itemUnit: "片", item: "餅乾" }, { answerUnit: "片", ownershipScope: "explicit_recipient_group" }),
  profile("tpl_g3b_u08_per_group_equal_share_people", "share_beads", "craft", { itemUnit: "顆", item: "珠子" }, { answerUnit: "顆", ownershipScope: "explicit_recipient_group" }),

  profile("tpl_g3b_u08_per_group_equal_container_capacity", "capacity_juice_bottles", "drinks", { capacityUnit: "毫升", liquid: "果汁", containerUnit: "瓶" }, { answerUnit: "毫升", scale: 10 }),
  profile("tpl_g3b_u08_per_group_equal_container_capacity", "capacity_soup_bowls", "cooking", { capacityUnit: "毫升", liquid: "湯", containerUnit: "碗" }, { answerUnit: "毫升", scale: 10 }),
  profile("tpl_g3b_u08_per_group_equal_container_capacity", "capacity_colored_water_cups", "experiment", { capacityUnit: "毫升", liquid: "色水", containerUnit: "杯" }, { answerUnit: "毫升", scale: 10 }),

  profile("tpl_g3b_u08_per_group_equal_segment_length", "equal_length_ribbon", "ribbon", { item: "緞帶", lengthUnit: "公分" }, { answerUnit: "公分" }),
  profile("tpl_g3b_u08_per_group_equal_segment_length", "equal_length_rope", "rope", { item: "繩子", lengthUnit: "公分" }, { answerUnit: "公分" }),
  profile("tpl_g3b_u08_per_group_equal_segment_length", "equal_length_track", "track", { item: "練習跑道", lengthUnit: "公尺" }, { answerUnit: "公尺" }),

  profile("tpl_g3b_u08_reverse_base_price_multiple", "price_clothing", "clothing", { item1: "外套", item2: "帽子" }, { answerUnit: "元", scale: 10 }),
  profile("tpl_g3b_u08_reverse_base_price_multiple", "price_stationery", "stationery", { item1: "書包", item2: "筆記本" }, { answerUnit: "元", scale: 5 }),
  profile("tpl_g3b_u08_reverse_base_price_multiple", "price_daily_goods", "daily_goods", { item1: "大瓶洗衣精", item2: "肥皂" }, { answerUnit: "元", scale: 5 }),

  profile("tpl_g3b_u08_reverse_base_quantity_multiple", "quantity_collections", "collections", { person1: "小安", person2: "小琪", itemUnit: "張", item: "郵票" }, { answerUnit: "張" }),
  profile("tpl_g3b_u08_reverse_base_quantity_multiple", "quantity_books", "books", { person1: "小明", person2: "小華", itemUnit: "本", item: "故事書" }, { answerUnit: "本" }),
  profile("tpl_g3b_u08_reverse_base_quantity_multiple", "quantity_stickers", "stickers", { person1: "小芸", person2: "小哲", itemUnit: "張", item: "貼紙" }, { answerUnit: "張" }),

  profile("tpl_g3b_u08_reverse_base_length_multiple", "length_ribbons", "ribbon", { item1: "紅緞帶", item2: "藍緞帶", lengthUnit: "公分" }, { answerUnit: "公分" }),
  profile("tpl_g3b_u08_reverse_base_length_multiple", "length_ropes", "rope", { item1: "長繩", item2: "短繩", lengthUnit: "公分" }, { answerUnit: "公分" }),
  profile("tpl_g3b_u08_reverse_base_length_multiple", "length_tracks", "track", { item1: "大跑道", item2: "小跑道", lengthUnit: "公尺" }, { answerUnit: "公尺" }),

  profile("tpl_g3b_u08_reverse_base_capacity_multiple", "capacity_buckets", "containers", { container1: "大水桶", container2: "小水桶", capacityUnit: "公升" }, { answerUnit: "公升" }),
  profile("tpl_g3b_u08_reverse_base_capacity_multiple", "capacity_kettle_bottle", "drinks", { container1: "水壺", container2: "水瓶", capacityUnit: "毫升" }, { answerUnit: "毫升", scale: 10 }),
  profile("tpl_g3b_u08_reverse_base_capacity_multiple", "capacity_tank_jug", "containers", { container1: "儲水箱", container2: "量水壺", capacityUnit: "公升" }, { answerUnit: "公升" }),

  profile("tpl_g3b_u08_estimate_near_hundred_total", "estimate_notebooks", "shopping", { itemUnit: "本", item: "筆記本" }, { answerUnit: "元" }),
  profile("tpl_g3b_u08_estimate_near_hundred_total", "estimate_lunch_boxes", "shopping", { itemUnit: "個", item: "餐盒" }, { answerUnit: "元" }),
  profile("tpl_g3b_u08_estimate_near_hundred_total", "estimate_cookie_boxes", "food", { itemUnit: "盒", item: "餅乾" }, { answerUnit: "元" }),

  profile("tpl_g3b_u08_estimate_budget_sufficiency_upper", "budget_books", "shopping", { itemUnit: "本", item: "故事書" }, { answerUnit: "元" }),
  profile("tpl_g3b_u08_estimate_budget_sufficiency_upper", "budget_cake_boxes", "food", { itemUnit: "盒", item: "蛋糕" }, { answerUnit: "元" }),
  profile("tpl_g3b_u08_estimate_budget_sufficiency_upper", "budget_gift_sets", "shopping", { itemUnit: "組", item: "文具禮盒" }, { answerUnit: "元" }),

  profile("tpl_g3b_u08_estimate_exact_over_benchmark", "over_toy_sets", "shopping", { itemUnit: "組", item: "玩具組" }, { answerUnit: "元" }),
  profile("tpl_g3b_u08_estimate_exact_over_benchmark", "over_snack_boxes", "food", { itemUnit: "盒", item: "點心" }, { answerUnit: "元" }),
  profile("tpl_g3b_u08_estimate_exact_over_benchmark", "over_stationery_sets", "shopping", { itemUnit: "組", item: "文具組" }, { answerUnit: "元" }),

  profile("tpl_g3b_u08_estimate_exact_under_benchmark", "under_notebooks", "shopping", { itemUnit: "本", item: "筆記本" }, { answerUnit: "元" }),
  profile("tpl_g3b_u08_estimate_exact_under_benchmark", "under_cookie_boxes", "food", { itemUnit: "盒", item: "餅乾" }, { answerUnit: "元" }),
  profile("tpl_g3b_u08_estimate_exact_under_benchmark", "under_art_sets", "shopping", { itemUnit: "組", item: "美術用品" }, { answerUnit: "元" }),

  profile("tpl_g3b_u08_same_price_compare_weight", "compare_weight_crackers", "food", { item: "蘇打餅乾", unitLabel: "克" }, { comparisonDimension: "weight", answerUnit: "克" }),
  profile("tpl_g3b_u08_same_price_compare_weight", "compare_weight_rice", "food", { item: "米", unitLabel: "克" }, { comparisonDimension: "weight", answerUnit: "克" }),
  profile("tpl_g3b_u08_same_price_compare_weight", "compare_weight_candy", "food", { item: "糖果", unitLabel: "克" }, { comparisonDimension: "weight", answerUnit: "克" }),

  profile("tpl_g3b_u08_same_price_compare_capacity", "compare_capacity_juice", "drinks", { item: "果汁", containerUnit: "瓶", capacityUnit: "毫升" }, { comparisonDimension: "capacity", answerUnit: "毫升" }),
  profile("tpl_g3b_u08_same_price_compare_capacity", "compare_capacity_milk", "drinks", { item: "牛奶", containerUnit: "盒", capacityUnit: "毫升" }, { comparisonDimension: "capacity", answerUnit: "毫升" }),
  profile("tpl_g3b_u08_same_price_compare_capacity", "compare_capacity_water", "drinks", { item: "飲用水", containerUnit: "瓶", capacityUnit: "毫升" }, { comparisonDimension: "capacity", answerUnit: "毫升" }),

  profile("tpl_g3b_u08_same_price_compare_item_count", "compare_count_pencils", "stationery", { item: "鉛筆", packageUnit: "包", itemUnit: "枝" }, { comparisonDimension: "count", answerUnit: "枝" }),
  profile("tpl_g3b_u08_same_price_compare_item_count", "compare_count_stickers", "stationery", { item: "貼紙", packageUnit: "包", itemUnit: "張" }, { comparisonDimension: "count", answerUnit: "張" }),
  profile("tpl_g3b_u08_same_price_compare_item_count", "compare_count_marbles", "toys", { item: "彈珠", packageUnit: "袋", itemUnit: "顆" }, { comparisonDimension: "count", answerUnit: "顆" }),

  profile("tpl_g3b_u08_same_price_compare_total_length", "compare_length_ribbon", "ribbon", { item: "緞帶", lengthUnit: "公分" }, { comparisonDimension: "length", answerUnit: "公分" }),
  profile("tpl_g3b_u08_same_price_compare_total_length", "compare_length_rope", "rope", { item: "繩子", lengthUnit: "公分" }, { comparisonDimension: "length", answerUnit: "公分" }),
  profile("tpl_g3b_u08_same_price_compare_total_length", "compare_length_tape", "stationery", { item: "紙膠帶", lengthUnit: "公分" }, { comparisonDimension: "length", answerUnit: "公分" })
];

const frozenProfiles = deepFreeze(profiles);
const profilesByScenario = new Map(frozenProfiles.map((entry) => [entry.scenarioId, entry]));
const profilesByFamily = new Map();
for (const entry of frozenProfiles) {
  const current = profilesByFamily.get(entry.templateFamilyId) ?? [];
  current.push(entry);
  profilesByFamily.set(entry.templateFamilyId, current);
}
for (const [familyId, entries] of profilesByFamily) profilesByFamily.set(familyId, Object.freeze([...entries]));

export const G3B_U08_SEMANTIC_SCENARIO_PROFILE_COUNT = frozenProfiles.length;
export const G3B_U08_SEMANTIC_SCENARIO_FAMILY_COUNT = profilesByFamily.size;

export function listG3BU08SemanticScenarioProfiles() {
  return [...frozenProfiles];
}

export function listG3BU08SemanticScenarioProfilesForFamily(templateFamilyId) {
  return [...(profilesByFamily.get(templateFamilyId) ?? [])];
}

export function getG3BU08SemanticScenarioProfile(scenarioId) {
  return profilesByScenario.get(scenarioId) ?? null;
}

export function resolveG3BU08SemanticScenarioProfile({ templateFamilyId, scenarioId, contextDomain, selectionIndex = 0 } = {}) {
  const familyProfiles = profilesByFamily.get(templateFamilyId) ?? [];
  if (scenarioId) {
    const exact = profilesByScenario.get(scenarioId);
    return exact?.templateFamilyId === templateFamilyId ? exact : null;
  }
  const eligible = contextDomain
    ? familyProfiles.filter((entry) => entry.contextDomain === contextDomain)
    : familyProfiles;
  if (eligible.length === 0) return null;
  const index = Math.abs(Number(selectionIndex) || 0) % eligible.length;
  return eligible[index];
}
