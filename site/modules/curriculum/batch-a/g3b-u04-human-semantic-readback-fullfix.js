import {
  getG3BU04SemanticPatternDefinition
} from "./source-pattern-g3b-u04-semantic-extension.js";
import {
  resolveG3BU04SemanticScenarioProfile
} from "./g3b-u04-semantic-scenarios.js";

export const G3B_U04_HUMAN_SEMANTIC_READBACK_FULLFIX = Object.freeze({
  task: "S57F7R1_G3B_U04_HumanSemanticReadbackQA_FullFix",
  sourceId: "g3b_u04_3b04",
  status: "human_semantic_readback_fullfix_applied",
  version: "s57f7r1-g3b-u04-human-semantic-readback-v1",
  auditedFamilyCount: 32,
  auditedFamilyContextVariantCount: 117,
  authorityMutationAllowed: false,
  productionOverlayOnly: true,
  freeFormAIGenerationAllowed: false
});

export const G3B_U04_HUMAN_SEMANTIC_BLOCKING_ERROR_CODES = Object.freeze([
  "G3B_U04_READBACK_BATCH_QUANTITIES_AMBIGUOUS",
  "G3B_U04_READBACK_PARTICIPANT_SCOPE_AMBIGUOUS",
  "G3B_U04_READBACK_EQUIVALENCE_DIMENSION_MISSING",
  "G3B_U04_READBACK_COMMON_PERIOD_UNDEFINED",
  "G3B_U04_READBACK_CLASSIFIER_OBJECT_DUPLICATED",
  "G3B_U04_READBACK_ANSWER_UNIT_ROLE_MISMATCH",
  "G3B_U04_READBACK_CONTEXT_ACTION_INCOMPATIBLE",
  "G3B_U04_READBACK_PROMOTION_OWNERSHIP_UNCLEAR",
  "G3B_U04_READBACK_CONTEXT_QUANTITY_IMPLAUSIBLE",
  "G3B_U04_READBACK_RELATION_DIMENSION_IMPLICIT"
]);

const PRICE_EQUIVALENCE_LEXICON = Object.freeze({
  bakery: Object.freeze({
    baseItem: "麵包", baseUnit: "個",
    middleItem: "蛋糕", middleUnit: "袋",
    finalItem: "麵包", finalUnit: "箱"
  }),
  drinks: Object.freeze({
    baseItem: "果汁", baseUnit: "瓶",
    middleItem: "牛奶", middleUnit: "箱",
    finalItem: "果汁", finalUnit: "箱"
  }),
  tickets: Object.freeze({
    baseItem: "門票", baseUnit: "張",
    middleItem: "車票", middleUnit: "本",
    finalItem: "門票", finalUnit: "本"
  }),
  school_store: Object.freeze({
    baseItem: "鉛筆", baseUnit: "支",
    middleItem: "筆記本", middleUnit: "盒",
    finalItem: "文具", finalUnit: "箱"
  })
});

const ARRAY_CONTEXT_LEXICON = Object.freeze({
  building_blocks: Object.freeze({ item: "積木", itemUnit: "個" }),
  storage_grid: Object.freeze({ item: "收納盒", itemUnit: "個" }),
  display_array: Object.freeze({ item: "展示品", itemUnit: "件" })
});

const PROMOTION_SHARED_USE_LEXICON = Object.freeze({
  daily_goods: Object.freeze({ item: "清潔用品組合", use: "共同使用" }),
  food: Object.freeze({ item: "分享餐組合", use: "一起分享" }),
  school_supplies: Object.freeze({ item: "文具組合", use: "作為班級共用物資" })
});

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  }
  return value;
}

function issue(code, path, message) {
  return {
    code,
    severity: "error",
    stage: "human_semantic_readback",
    path,
    message
  };
}

function greatestCommonDivisor(left, right) {
  let a = Math.abs(left);
  let b = Math.abs(right);
  while (b > 0) [a, b] = [b, a % b];
  return a || 1;
}

function contextItem(scenario, contextDomain) {
  if (contextDomain === "beverages") return { item: "飲料", itemUnit: "罐" };
  return {
    item: scenario?.placeholderBindings?.item ?? "物品",
    itemUnit: scenario?.placeholderBindings?.itemUnit ?? "個"
  };
}

function expectedAnswerUnit(question, scenario) {
  const role = String(question?.unknownRole ?? "");
  if (/cost|price|money|budget/.test(role)) return "元";
  if (/points/.test(role)) return "點";
  if (/capacity/.test(role)) return scenario?.capacityUnit ?? scenario?.measureUnit ?? "毫升";
  if (/composite_multiplier/.test(role)) return "倍";
  if (/(^|_)age($|_)/.test(role)) return "歲";
  if (/team/.test(role)) return "隊";
  if (/tray/.test(role)) return "盤";
  if (/group_count/.test(role)) return "組";
  if (/package/.test(role)) return scenario?.packageUnit ?? "盒";
  if (/quantity|item_count|unit_count|share|resource|participant/.test(role)) {
    return scenario?.itemUnit ?? scenario?.measureUnit ?? "個";
  }
  return question?.answerUnit ?? scenario?.itemUnit ?? scenario?.measureUnit ?? "個";
}

function setBindingValue(question, symbol, value) {
  if (question.quantityRoleBindings?.[symbol]) question.quantityRoleBindings[symbol].value = value;
  if (question.semanticSnapshot?.quantityRoleBindings?.[symbol]) {
    question.semanticSnapshot.quantityRoleBindings[symbol].value = value;
  }
}

function setEventResult(question, index, value) {
  if (question.eventSequence?.[index]) question.eventSequence[index].result = value;
  if (question.semanticSnapshot?.eventSequence?.[index]) {
    question.semanticSnapshot.eventSequence[index].result = value;
  }
}

function setAnswer(question, answerUnit, finalAnswer) {
  const answerText = `${finalAnswer}${answerUnit}`;
  question.answerUnit = answerUnit;
  question.finalAnswer = finalAnswer;
  question.answerText = answerText;
  question.finalAnswerWithUnit = answerText;
  question.semanticSnapshot.answerUnit = answerUnit;
  question.displayText = `${question.promptText} 答案：${answerText}`;
  for (const binding of Object.values(question.quantityRoleBindings ?? {})) {
    if (binding.semanticRole === question.unknownRole) binding.unitLabel = answerUnit;
  }
  for (const binding of Object.values(question.semanticSnapshot?.quantityRoleBindings ?? {})) {
    if (binding.semanticRole === question.unknownRole) binding.unitLabel = answerUnit;
  }
  if (question.countNounModel && typeof question.countNounModel === "object") {
    question.countNounModel.answerClassifier = answerUnit;
  }
}

function normalizePromotionUnitPrice(question) {
  const q = question.quantities.q;
  const divisor = question.quantities.r ?? (q + question.quantities.g);
  const step = divisor / greatestCommonDivisor(q, divisor);
  const multiplier = 3 + ((question.quantities.p + q + divisor) % 6);
  const p = step * multiplier;
  const total = p * q;
  const answer = total / divisor;
  question.quantities.p = p;
  setBindingValue(question, "p", p);
  if (question.quantities.r !== undefined) {
    question.intermediateResults = [total, answer];
    setEventResult(question, 0, total);
    setEventResult(question, 1, answer);
    question.equationModel = `(${p} × ${q}) ÷ ${divisor}`;
    question.equationTokens = ["(", p, "×", q, ")", "÷", divisor];
  } else {
    question.intermediateResults = [total, divisor, answer];
    setEventResult(question, 0, total);
    setEventResult(question, 1, divisor);
    setEventResult(question, 2, answer);
    question.equationModel = `(${p} × ${q}) ÷ (${q} + ${question.quantities.g})`;
    question.equationTokens = ["(", p, "×", q, ")", "÷", "(", q, "+", question.quantities.g, ")"];
  }
  setAnswer(question, "元", answer);
}

function normalizeBulkRepackPrice(question) {
  const q = question.quantities.q;
  const r = question.quantities.r;
  const step = r / greatestCommonDivisor(q, r);
  const multiplier = 6 + ((question.quantities.p + q + r) % 10);
  const p = step * multiplier;
  const total = p * q;
  const answer = total / r;
  question.quantities.p = p;
  setBindingValue(question, "p", p);
  question.intermediateResults = [total, answer];
  setEventResult(question, 0, total);
  setEventResult(question, 1, answer);
  question.equationModel = `(${p} × ${q}) ÷ ${r}`;
  question.equationTokens = ["(", p, "×", q, ")", "÷", r];
  setAnswer(question, "元", answer);
}

function normalizeTechnologyPerStudent(question) {
  if (question.contextDomain !== "technology") return;
  const b = question.quantities.b;
  const quotient = 1 + ((question.quantities.a / b + question.quantities.c) % 3);
  const c = 1 + ((question.quantities.a + question.quantities.c) % 2);
  const a = b * quotient;
  const answer = quotient + c;
  question.quantities.a = a;
  question.quantities.c = c;
  setBindingValue(question, "a", a);
  setBindingValue(question, "c", c);
  question.intermediateResults = [quotient, answer];
  setEventResult(question, 0, quotient);
  setEventResult(question, 1, answer);
  question.equationModel = `${a} ÷ ${b} + ${c}`;
  question.equationTokens = [a, "÷", b, "+", c];
  setAnswer(question, "臺", answer);
}

function renderFullFixPrompt(question, scenario) {
  const family = question.templateFamilyId;
  const q = question.quantities;
  const p = scenario.placeholderBindings;
  const { item, itemUnit } = contextItem(scenario, question.contextDomain);

  if (family === "tpl_g3b_u04_add_divide_combined_inventory_equal_distribution") {
    return `老師把第一批${q.a}${itemUnit}${item}和第二批${q.b}${itemUnit}${item}合在一起，平均分給${q.c}${p.recipientUnit}${p.recipient}，每${p.recipientUnit}分到多少${itemUnit}${item}？`;
  }
  if (family === "tpl_g3b_u04_add_divide_combined_liquid_equal_portions" && question.contextDomain === "school_experiment") {
    return `把${q.a}${p.capacityUnit}和${q.b}${p.capacityUnit}的同一種實驗用水倒在一起，平均裝成${q.c}${p.containerUnit}，每${p.containerUnit}有多少${p.capacityUnit}？`;
  }
  if (family === "tpl_g3b_u04_mul_div_buy_get_free_average_price") {
    return `${item}每${itemUnit}${q.p}元，活動期間付${q.q}${itemUnit}的錢可以拿到${q.r}${itemUnit}，平均每${itemUnit}${item}多少元？`;
  }
  if (family === "tpl_g3b_u04_mul_div_bonus_units_average_cost") {
    const bonusItem = question.contextDomain === "coupons" ? "遊戲券" : item;
    return `每${itemUnit}${bonusItem}${q.p}元，買${q.q}${itemUnit}另外贈送${q.g}${itemUnit}，把總費用平均到收到的全部${bonusItem}，每${itemUnit}${bonusItem}平均多少元？`;
  }
  if (family === "tpl_g3b_u04_mul_div_bulk_repack_average_cost") {
    return `買了${q.q}${p.largePackUnit}${item}，每${p.largePackUnit}${q.p}元，重新平均分裝成${q.r}${p.smallPackUnit}，平均每${p.smallPackUnit}${item}的成本是多少元？`;
  }
  if (family === "tpl_g3b_u04_div_add_new_packages_plus_existing_stock") {
    return `把新準備的${q.a}${itemUnit}${item}每${q.b}${itemUnit}裝一${p.packageUnit}，再加上原有的${q.c}${p.packageUnit}，現在共有幾${p.packageUnit}？`;
  }
  if (family === "tpl_g3b_u04_div_add_distributed_resources_plus_existing_per_group") {
    return `把${q.a}${itemUnit}${item}平均分給${q.b}${p.recipientUnit}${p.recipient}，每${p.recipientUnit}原本已有${q.c}${itemUnit}${item}，分完後每${p.recipientUnit}共有多少${itemUnit}${item}？`;
  }
  if (family === "tpl_g3b_u04_total_minus_share_wallet_minus_shared_purchase") {
    return `${p.person}原有${q.a}元，${p.person}和其他人共${q.c}人，平均分擔一筆${q.b}元的費用。付完自己的部分後，${p.person}還剩多少元？`;
  }
  if (family === "tpl_g3b_u04_consecutive_items_per_row_per_box") {
    return `每排有${q.a}${itemUnit}${item}，每箱有${q.b}排，共有${q.c}箱。一共有多少${itemUnit}${item}？`;
  }
  if (family === "tpl_g3b_u04_consecutive_units_per_group_per_container") {
    return `每組有${q.a}${itemUnit}${item}，每${p.containerUnit}有${q.b}組，共有${q.c}${p.containerUnit}。一共有多少${itemUnit}${item}？`;
  }
  if (family === "tpl_g3b_u04_consecutive_length_width_layers_array") {
    const lexicon = ARRAY_CONTEXT_LEXICON[question.contextDomain] ?? ARRAY_CONTEXT_LEXICON.building_blocks;
    return `每層沿長邊排${q.a}${lexicon.itemUnit}${lexicon.item}，沿寬邊排${q.b}${lexicon.itemUnit}${lexicon.item}，共有${q.c}層。一共有多少${lexicon.itemUnit}${lexicon.item}？`;
  }
  if (family === "tpl_g3b_u04_ratio_capacity_ratio_composition") {
    return `${p.middleContainer}的容量是${p.baseContainer}的${q.m}倍，${p.finalContainer}的容量是${p.middleContainer}的${q.n}倍，${p.finalContainer}的容量是${p.baseContainer}的幾倍？`;
  }
  if (family === "tpl_g3b_u04_ratio_weight_ratio_composition") {
    return `${p.middleObject}的重量是${p.baseObject}的${q.m}倍，${p.finalObject}的重量是${p.middleObject}的${q.n}倍，${p.finalObject}的重量是${p.baseObject}的幾倍？`;
  }
  if (family === "tpl_g3b_u04_quantity_chain_price_equivalence_chain") {
    const lexicon = PRICE_EQUIVALENCE_LEXICON[question.contextDomain];
    return `每${lexicon.baseUnit}${lexicon.baseItem}${q.a}元，1${lexicon.middleUnit}${lexicon.middleItem}的價錢等於${q.m}${lexicon.baseUnit}${lexicon.baseItem}的價錢，1${lexicon.finalUnit}${lexicon.finalItem}的價錢等於${q.n}${lexicon.middleUnit}${lexicon.middleItem}的價錢。1${lexicon.finalUnit}${lexicon.finalItem}多少元？`;
  }
  if (family === "tpl_g3b_u04_quantity_chain_production_capacity_chain") {
    return `小型工作臺每小時完成${q.a}${itemUnit}${item}。中型工作臺每小時的完成量是小型工作臺的${q.m}倍，大型工作臺每小時的完成量是中型工作臺的${q.n}倍。大型工作臺每小時完成多少${itemUnit}${item}？`;
  }
  if (family === "tpl_g3b_u04_add_divide_promotion_total_equal_share") {
    const lexicon = PROMOTION_SHARED_USE_LEXICON[question.contextDomain];
    return `${lexicon.item}原價${q.a}元，活動期間再加${q.b}元可以多拿一組相同商品。${q.c}人共同購買，${lexicon.use}，並平均分擔總費用。每人要付多少元？`;
  }
  return question.promptText;
}

function applyPrompt(question, promptText) {
  question.promptText = promptText;
  question.blankedDisplayText = promptText;
  question.displayText = `${promptText} 答案：${question.answerText}`;
}

export function applyG3BU04HumanSemanticReadbackFullFix(inputQuestion = {}) {
  const question = cloneValue(inputQuestion);
  if (question.sourceId !== G3B_U04_HUMAN_SEMANTIC_READBACK_FULLFIX.sourceId
    || question.kind !== "g3bU04SemanticWordProblem") return question;

  const spec = getG3BU04SemanticPatternDefinition(question.patternSpecId);
  const scenario = resolveG3BU04SemanticScenarioProfile(question.templateFamilyId, question.contextDomain);
  if (!spec || !scenario) return question;

  if ([
    "tpl_g3b_u04_mul_div_buy_get_free_average_price",
    "tpl_g3b_u04_mul_div_bonus_units_average_cost"
  ].includes(question.templateFamilyId)) {
    normalizePromotionUnitPrice(question);
  }
  if (question.templateFamilyId === "tpl_g3b_u04_mul_div_bulk_repack_average_cost") {
    normalizeBulkRepackPrice(question);
  }
  if (question.templateFamilyId === "tpl_g3b_u04_div_add_distributed_resources_plus_existing_per_group") {
    normalizeTechnologyPerStudent(question);
  }

  const answerUnit = expectedAnswerUnit(question, scenario);
  setAnswer(question, answerUnit, question.finalAnswer);
  const promptText = renderFullFixPrompt(question, scenario);
  applyPrompt(question, promptText);

  if (question.templateFamilyId === "tpl_g3b_u04_quantity_chain_production_capacity_chain") {
    question.timePeriodModel = {
      basePeriod: "one_hour",
      middlePeriod: "one_hour",
      finalPeriod: "one_hour",
      label: "每小時"
    };
    question.semanticSnapshot.safeguards = {
      ...(question.semanticSnapshot.safeguards ?? {}),
      timePeriodModel: cloneValue(question.timePeriodModel)
    };
  }

  question.phase = "S57F7R1";
  question.humanSemanticReadback = {
    task: G3B_U04_HUMAN_SEMANTIC_READBACK_FULLFIX.task,
    version: G3B_U04_HUMAN_SEMANTIC_READBACK_FULLFIX.version,
    fullFixApplied: true,
    familyContextScope: 117,
    authorityMutated: false
  };
  question.semanticSnapshot.humanSemanticReadback = cloneValue(question.humanSemanticReadback);
  question.metadata = {
    ...(question.metadata ?? {}),
    patternTags: [...new Set([...(question.metadata?.patternTags ?? []), "s57f7r1_human_semantic_readback_fullfix"])],
    difficultyTags: [...new Set([...(question.metadata?.difficultyTags ?? []), "human_semantic_readback_accepted"])]
  };
  return question;
}

export function validateG3BU04HumanSemanticReadback(question = {}) {
  if (question?.sourceId !== G3B_U04_HUMAN_SEMANTIC_READBACK_FULLFIX.sourceId
    || question?.kind !== "g3bU04SemanticWordProblem") {
    return { ok: true, errors: [], warnings: [], stage: "human_semantic_readback" };
  }

  const errors = [];
  const family = question.templateFamilyId;
  const prompt = String(question.promptText ?? "");
  const scenario = resolveG3BU04SemanticScenarioProfile(family, question.contextDomain);
  const expectedUnit = expectedAnswerUnit(question, scenario);

  if (family === "tpl_g3b_u04_add_divide_combined_inventory_equal_distribution"
    && (!prompt.includes("第一批") || !prompt.includes("第二批") || prompt.includes("兩批共"))) {
    errors.push(issue(
      "G3B_U04_READBACK_BATCH_QUANTITIES_AMBIGUOUS",
      "promptText",
      "The two inventory batch quantities must be stated as separate first and second batches."
    ));
  }
  if (family === "tpl_g3b_u04_total_minus_share_wallet_minus_shared_purchase"
    && (!prompt.includes(`和其他人共${question.quantities?.c}人`) || prompt.includes("和另外的人共"))) {
    errors.push(issue(
      "G3B_U04_READBACK_PARTICIPANT_SCOPE_AMBIGUOUS",
      "promptText",
      "The participant count must explicitly include the named person."
    ));
  }
  if (family === "tpl_g3b_u04_quantity_chain_price_equivalence_chain"
    && ((prompt.match(/價錢等於/g) ?? []).length !== 2 || prompt.includes("一樣多"))) {
    errors.push(issue(
      "G3B_U04_READBACK_EQUIVALENCE_DIMENSION_MISSING",
      "promptText",
      "Both price-equivalence links must explicitly state that prices are equal."
    ));
  }
  if (family === "tpl_g3b_u04_quantity_chain_production_capacity_chain"
    && ((prompt.match(/每小時/g) ?? []).length < 3 || prompt.includes("每段時間") || question.timePeriodModel?.label !== "每小時")) {
    errors.push(issue(
      "G3B_U04_READBACK_COMMON_PERIOD_UNDEFINED",
      "timePeriodModel",
      "Production quantities must share one explicit one-hour period."
    ));
  }
  if (prompt.includes("罐飲料罐") || prompt.includes("兩批共")) {
    errors.push(issue(
      "G3B_U04_READBACK_CLASSIFIER_OBJECT_DUPLICATED",
      "promptText",
      "Classifier and object wording must not duplicate or collide."
    ));
  }
  if (question.answerUnit !== expectedUnit
    || question.answerText !== `${question.finalAnswer}${expectedUnit}`
    || question.semanticSnapshot?.answerUnit !== expectedUnit) {
    errors.push(issue(
      "G3B_U04_READBACK_ANSWER_UNIT_ROLE_MISMATCH",
      "answerUnit",
      "The answer unit must match the semantic unknown role and context object."
    ));
  }
  if (family === "tpl_g3b_u04_div_add_new_packages_plus_existing_stock" && prompt.includes("新做好的")) {
    errors.push(issue(
      "G3B_U04_READBACK_CONTEXT_ACTION_INCOMPATIBLE",
      "promptText",
      "The preparation verb must remain compatible with books, balls, blocks, and bakery items."
    ));
  }
  if (family === "tpl_g3b_u04_add_divide_promotion_total_equal_share"
    && (!/共同使用|一起分享|班級共用/.test(prompt) || !prompt.includes("平均分擔總費用"))) {
    errors.push(issue(
      "G3B_U04_READBACK_PROMOTION_OWNERSHIP_UNCLEAR",
      "promptText",
      "Promotion items and the shared-payment ownership model must be explicit."
    ));
  }
  if ((family === "tpl_g3b_u04_mul_div_buy_get_free_average_price" && question.quantities?.p > 100)
    || (family === "tpl_g3b_u04_div_add_distributed_resources_plus_existing_per_group"
      && question.contextDomain === "technology"
      && (question.quantities?.a / question.quantities?.b > 3 || question.quantities?.c > 2 || question.finalAnswer > 5))) {
    errors.push(issue(
      "G3B_U04_READBACK_CONTEXT_QUANTITY_IMPLAUSIBLE",
      "quantities",
      "Context-specific prices and per-student device counts must remain plausible."
    ));
  }
  if ((family === "tpl_g3b_u04_ratio_capacity_ratio_composition" && (prompt.match(/容量是/g) ?? []).length < 2)
    || (family === "tpl_g3b_u04_ratio_weight_ratio_composition" && (prompt.match(/重量是/g) ?? []).length < 2)) {
    errors.push(issue(
      "G3B_U04_READBACK_RELATION_DIMENSION_IMPLICIT",
      "promptText",
      "Both multiplicative comparison links must state the compared dimension explicitly."
    ));
  }

  if (question.humanSemanticReadback?.fullFixApplied !== true
    || question.humanSemanticReadback?.version !== G3B_U04_HUMAN_SEMANTIC_READBACK_FULLFIX.version) {
    errors.push(issue(
      "G3B_U04_READBACK_CONTEXT_ACTION_INCOMPATIBLE",
      "humanSemanticReadback",
      "Canonical production questions must carry the accepted human semantic readback provenance."
    ));
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings: [],
    stage: "human_semantic_readback",
    validatorVersion: G3B_U04_HUMAN_SEMANTIC_READBACK_FULLFIX.version
  };
}
