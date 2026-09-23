import {
  applyG3BU04HumanSemanticReadbackFullFix,
  validateG3BU04HumanSemanticReadback
} from "./g3b-u04-human-semantic-readback-fullfix.js";
import {
  resolveG3BU04SemanticScenarioProfile
} from "./g3b-u04-semantic-scenarios.js";

export const G3B_U04_HUMAN_SEMANTIC_QUALITY_V2 = Object.freeze({
  task: "S57F7R1_G3B_U04_HumanSemanticReadbackQA_FullFix",
  version: "s57f7r1-g3b-u04-human-semantic-quality-v2",
  familyCount: 32,
  familyContextVariantCount: 117,
  status: "full_117_variant_quality_overlay_applied",
  authorityMutationAllowed: false,
  publicProductionRequired: true
});

export const G3B_U04_HUMAN_SEMANTIC_QUALITY_V2_ERROR_CODES = Object.freeze([
  "G3B_U04_READBACK_SHARED_ACTIVITY_SCOPE_UNCLEAR",
  "G3B_U04_READBACK_MEASURE_UNIT_MISMATCH",
  "G3B_U04_READBACK_COST_IMPLAUSIBLE",
  "G3B_U04_READBACK_PER_RECIPIENT_QUANTITY_IMPLAUSIBLE",
  "G3B_U04_READBACK_CONTEXT_LEXICON_UNNATURAL"
]);

const G3B_U04_P13_REVIEW_BOUND_SHARED_SCOPE_SHA256 =
  "777ac95e2bd138895dda1822de58d0c9f52571513e63ff74d14687de6875e0f0";

const G3B_U04_P13_REVIEW_BOUND_SHARED_SCOPE_VARIANTS = Object.freeze({
  gctx_semvar_g3b_u04_joint_purchase_class_festival: "共同準備班級園遊會",
  gctx_semvar_g3b_u04_joint_purchase_field_learning: "一起準備戶外學習",
  gctx_semvar_g3b_u04_joint_purchase_sports_practice: "一起安排運動練習",
  gctx_semvar_g3b_u04_joint_purchase_community_cleanup: "共同準備社區清潔活動",
  gctx_semvar_g3b_u04_joint_purchase_camping_activity: "一起準備露營活動"
});

function isG3BU04P13ReviewBoundSharedActivityScope(question = {}, prompt = "") {
  const binding = question.globalContextProduction ?? {};
  const requiredPhrase = G3B_U04_P13_REVIEW_BOUND_SHARED_SCOPE_VARIANTS[binding.semanticVariantId];
  const participantCount = question.quantities?.c;
  return Boolean(
    requiredPhrase
    && binding.reviewArtifactSha256 === G3B_U04_P13_REVIEW_BOUND_SHARED_SCOPE_SHA256
    && binding.productionAdmitted === true
    && binding.publicQuerySelectable === true
    && binding.productionUse === "allowed"
    && question.productionUse === "allowed"
    && Number.isInteger(participantCount)
    && participantCount > 0
    && prompt.startsWith(`${participantCount}位同學`)
    && prompt.includes(requiredPhrase)
    && prompt.includes(`兩項費用由${participantCount}人平均分擔`)
    && prompt.endsWith("每人要付多少元？")
  );
}

const PRICE_EQUIVALENCE = Object.freeze({
  bakery: Object.freeze({
    basePrice: 30,
    base: "個麵包",
    middle: "盒蛋糕",
    final: "箱麵包"
  }),
  drinks: Object.freeze({
    basePrice: 25,
    base: "瓶果汁",
    middle: "箱牛奶",
    final: "箱果汁"
  }),
  tickets: Object.freeze({
    basePrice: 50,
    base: "張門票",
    middle: "組車票套票",
    final: "套門票套票"
  }),
  school_store: Object.freeze({
    basePrice: 10,
    base: "支鉛筆",
    middle: "盒筆記本",
    final: "箱文具"
  })
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
    stage: "human_semantic_quality_v2",
    path,
    message
  };
}

function setBinding(question, symbol, value) {
  question.quantities[symbol] = value;
  if (question.quantityRoleBindings?.[symbol]) question.quantityRoleBindings[symbol].value = value;
  if (question.semanticSnapshot?.quantityRoleBindings?.[symbol]) {
    question.semanticSnapshot.quantityRoleBindings[symbol].value = value;
  }
}

function setEvent(question, index, value) {
  if (question.eventSequence?.[index]) question.eventSequence[index].result = value;
  if (question.semanticSnapshot?.eventSequence?.[index]) {
    question.semanticSnapshot.eventSequence[index].result = value;
  }
}

function setPrompt(question, promptText) {
  question.promptText = promptText;
  question.blankedDisplayText = promptText;
  question.displayText = `${promptText} 答案：${question.answerText}`;
}

function setAnswer(question, answerUnit, answer) {
  question.finalAnswer = answer;
  question.answerUnit = answerUnit;
  question.answerText = `${answer}${answerUnit}`;
  question.finalAnswerWithUnit = question.answerText;
  question.semanticSnapshot.answerUnit = answerUnit;
  if (question.countNounModel?.answerClassifier) question.countNounModel.answerClassifier = answerUnit;
  question.displayText = `${question.promptText} 答案：${question.answerText}`;
}

function updateAddThenDivide(question, a, b) {
  const c = question.quantities.c;
  const answer = (a + b) / c;
  setBinding(question, "a", a);
  setBinding(question, "b", b);
  question.intermediateResults = [a + b, answer];
  setEvent(question, 0, a + b);
  setEvent(question, 1, answer);
  question.equationModel = `(${a} + ${b}) ÷ ${c}`;
  question.equationTokens = ["(", a, "+", b, ")", "÷", c];
  setAnswer(question, question.answerUnit, answer);
}

function updateDivideThenAdd(question, quotient, personalOrExisting) {
  const b = question.quantities.b;
  const a = b * quotient;
  const answer = quotient + personalOrExisting;
  setBinding(question, "a", a);
  setBinding(question, "c", personalOrExisting);
  question.intermediateResults = [quotient, answer];
  setEvent(question, 0, quotient);
  setEvent(question, 1, answer);
  question.equationModel = `${a} ÷ ${b} + ${personalOrExisting}`;
  question.equationTokens = [a, "÷", b, "+", personalOrExisting];
  setAnswer(question, question.answerUnit, answer);
}

function updateTotalMinusShare(question, personalShare, remaining) {
  const c = question.quantities.c;
  const b = c * personalShare;
  const a = personalShare + remaining;
  setBinding(question, "a", a);
  setBinding(question, "b", b);
  question.intermediateResults = [personalShare, remaining];
  setEvent(question, 0, personalShare);
  setEvent(question, 1, remaining);
  question.equationModel = `${a} - (${b} ÷ ${c})`;
  question.equationTokens = [a, "-", "(", b, "÷", c, ")"];
  setAnswer(question, question.answerUnit, remaining);
}

function updateConsecutive(question, a, b, c, answerUnit = question.answerUnit) {
  const first = a * b;
  const answer = first * c;
  setBinding(question, "a", a);
  setBinding(question, "b", b);
  setBinding(question, "c", c);
  question.intermediateResults = [first, answer];
  setEvent(question, 0, first);
  setEvent(question, 1, answer);
  question.equationModel = `${a} × ${b} × ${c}`;
  question.equationTokens = [a, "×", b, "×", c];
  setAnswer(question, answerUnit, answer);
}

function updateQuantityChain(question, a) {
  const m = question.quantities.m;
  const n = question.quantities.n;
  const middle = a * m;
  const answer = middle * n;
  setBinding(question, "a", a);
  question.intermediateResults = [middle, answer];
  setEvent(question, 0, middle);
  setEvent(question, 1, answer);
  question.equationModel = `${a} × ${m} × ${n}`;
  question.equationTokens = [a, "×", m, "×", n];
  setAnswer(question, question.answerUnit, answer);
}

function legacyV1Unit(question, scenario) {
  const role = String(question.unknownRole ?? "");
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
  return question.answerUnit ?? scenario?.itemUnit ?? scenario?.measureUnit ?? "個";
}

function publicExpectedUnit(question, scenario) {
  if (question.templateFamilyId === "tpl_g3b_u04_sub_div_used_amount_then_share") {
    return scenario?.measureUnit ?? scenario?.capacityUnit ?? question.answerUnit;
  }
  if (question.templateFamilyId === "tpl_g3b_u04_consecutive_length_width_layers_array"
    && question.contextDomain === "display_array") return "件";
  return question.answerUnit;
}

function projectForV1Validation(question, scenario) {
  const projected = cloneValue(question);
  const unit = legacyV1Unit(projected, scenario);
  projected.answerUnit = unit;
  projected.answerText = `${projected.finalAnswer}${unit}`;
  projected.finalAnswerWithUnit = projected.answerText;
  projected.semanticSnapshot.answerUnit = unit;
  if (projected.countNounModel?.answerClassifier) projected.countNounModel.answerClassifier = unit;
  delete projected.humanSemanticQuality;
  if (projected.semanticSnapshot) delete projected.semanticSnapshot.humanSemanticQuality;
  return projected;
}

function normalizeJointPurchase(question) {
  const total = question.quantities.a + question.quantities.b;
  let a = Math.floor(total / 10) * 5;
  if (a < 15) a = Math.max(5, Math.floor(total / 2));
  const b = total - a;
  updateAddThenDivide(question, a, b);
  const c = question.quantities.c;
  if (question.contextDomain === "food") {
    setPrompt(question, `三明治費用共${a}元，果汁費用共${b}元。${c}人一起訂購並分享餐點，總費用平均分擔，每人要付多少元？`);
  } else if (question.contextDomain === "school_supplies") {
    setPrompt(question, `筆記本費用共${a}元，彩色筆費用共${b}元。${c}人共同購買作為小組共用文具，總費用平均分擔，每人要付多少元？`);
  } else if (question.contextDomain === "tickets") {
    setPrompt(question, `${c}人的門票費用共${a}元，車票費用共${b}元。兩項總費用由${c}人平均分擔，每人要付多少元？`);
  } else if (question.contextDomain === "equipment_rental") {
    setPrompt(question, `帳篷租金共${a}元，睡袋租金共${b}元。${c}人共同租用，總租金平均分擔，每人要付多少元？`);
  }
}

function normalizePooledMoney(question, scenario) {
  const unitPriceByContext = { snacks: 15, stationery: 10, tickets: 50 };
  const unitPrice = unitPriceByContext[question.contextDomain] ?? 15;
  const total = question.quantities.c * unitPrice;
  const a = Math.floor(total / 2);
  const b = total - a;
  updateAddThenDivide(question, a, b);
  const p = scenario.placeholderBindings;
  setPrompt(question, `${p.person1}有${a}元，${p.person2}有${b}元，兩人的錢合起來剛好買${question.quantities.c}${p.itemUnit}${p.item}，每${p.itemUnit}${p.item}多少元？`);
}

function normalizeCombinedInventory(question, scenario) {
  const perRecipientByContext = { classroom: 6, library: 4, sports: 2, crafts: 8 };
  const perRecipient = perRecipientByContext[question.contextDomain] ?? 5;
  const total = question.quantities.c * perRecipient;
  const a = Math.floor(total / 2);
  const b = total - a;
  updateAddThenDivide(question, a, b);
  const p = scenario.placeholderBindings;
  setPrompt(question, `老師把第一批${a}${p.itemUnit}${p.item}和第二批${b}${p.itemUnit}${p.item}合在一起，平均分給${question.quantities.c}${p.recipientUnit}${p.recipient}，每${p.recipientUnit}分到多少${p.itemUnit}${p.item}？`);
}

function normalizeCombinedLiquid(question, scenario) {
  const total = question.quantities.a + question.quantities.b;
  const scale = scenario.capacityUnit === "毫升" ? 10 : 1;
  const halfUnits = Math.floor(total / 2 / scale);
  const a = Math.max(scale, halfUnits * scale);
  const b = total - a;
  updateAddThenDivide(question, a, b);
  const p = scenario.placeholderBindings;
  const liquid = question.contextDomain === "school_experiment" ? "實驗用水" : p.liquid;
  setPrompt(question, `把${a}${p.capacityUnit}和${b}${p.capacityUnit}的同一種${liquid}倒在一起，平均裝成${question.quantities.c}${p.containerUnit}，每${p.containerUnit}有多少${p.capacityUnit}？`);
}

function normalizePromotionPrice(question, scenario) {
  const q = question.quantities.q;
  const divisor = question.quantities.r ?? q + question.quantities.g;
  const gcd = (left, right) => right === 0 ? left : gcd(right, left % right);
  const step = divisor / gcd(q, divisor);
  const targetByContext = {
    bakery: 25,
    drinks: 30,
    stationery: 10,
    daily_goods: 28,
    tickets: 48,
    stickers: 14,
    sports_cards: 20,
    coupons: 25
  };
  const target = targetByContext[question.contextDomain] ?? step * 4;
  const p = Math.max(step, Math.ceil(target / step) * step);
  const total = p * q;
  const answer = total / divisor;
  setBinding(question, "p", p);
  if (question.quantities.r !== undefined) {
    question.intermediateResults = [total, answer];
    setEvent(question, 0, total);
    setEvent(question, 1, answer);
    question.equationModel = `(${p} × ${q}) ÷ ${divisor}`;
    question.equationTokens = ["(", p, "×", q, ")", "÷", divisor];
    const item = scenario.placeholderBindings.item;
    const unit = scenario.placeholderBindings.itemUnit;
    setPrompt(question, `${item}每${unit}${p}元，活動期間付${q}${unit}的錢可以拿到${divisor}${unit}，平均每${unit}${item}多少元？`);
  } else {
    question.intermediateResults = [total, divisor, answer];
    setEvent(question, 0, total);
    setEvent(question, 1, divisor);
    setEvent(question, 2, answer);
    question.equationModel = `(${p} × ${q}) ÷ (${q} + ${question.quantities.g})`;
    question.equationTokens = ["(", p, "×", q, ")", "÷", "(", q, "+", question.quantities.g, ")"];
    const unit = scenario.placeholderBindings.itemUnit;
    const item = question.contextDomain === "coupons" ? "遊戲券" : scenario.placeholderBindings.item;
    setPrompt(question, `每${unit}${item}${p}元，買${q}${unit}另外贈送${question.quantities.g}${unit}，把總費用平均到收到的全部${item}，每${unit}${item}平均多少元？`);
  }
  setAnswer(question, "元", answer);
}

function updateSubtractThenDivide(question, total, removed) {
  const divisor = question.quantities.c;
  const remaining = total - removed;
  const answer = remaining / divisor;
  setBinding(question, "a", total);
  setBinding(question, "b", removed);
  question.intermediateResults = [remaining, answer];
  setEvent(question, 0, remaining);
  setEvent(question, 1, answer);
  question.equationModel = `(${total} - ${removed}) ÷ ${divisor}`;
  question.equationTokens = ["(", total, "-", removed, ")", "÷", divisor];
  setAnswer(question, question.answerUnit, answer);
}

function normalizePromotionSharedPurchase(question) {
  const perPersonByContext = { daily_goods: 20, food: 30, school_supplies: 15 };
  const perPerson = perPersonByContext[question.contextDomain] ?? 20;
  const participantCount = question.quantities.c;
  const total = participantCount * perPerson;
  const addOn = Math.max(5, Math.floor(total / 15) * 5);
  const originalPrice = total - addOn;
  updateAddThenDivide(question, originalPrice, addOn);
  const labels = {
    daily_goods: { item: "清潔用品組合", use: "共同使用" },
    food: { item: "分享餐組合", use: "一起分享" },
    school_supplies: { item: "文具組合", use: "作為班級共用物資" }
  };
  const label = labels[question.contextDomain] ?? labels.daily_goods;
  setPrompt(question, `${label.item}原價${originalPrice}元，活動期間再加${addOn}元可以多拿一組相同商品。${participantCount}人共同購買，${label.use}，並平均分擔總費用。每人要付多少元？`);
}

function normalizeReservedDistribution(question, scenario) {
  const perRecipientByContext = { books: 4, prizes: 3, snacks: 4, sports_equipment: 2 };
  const reservedByContext = { books: 4, prizes: 6, snacks: 4, sports_equipment: 2 };
  const perRecipient = perRecipientByContext[question.contextDomain] ?? 4;
  const reserved = reservedByContext[question.contextDomain] ?? 4;
  const total = reserved + question.quantities.c * perRecipient;
  updateSubtractThenDivide(question, total, reserved);
  const p = scenario.placeholderBindings;
  setPrompt(question, `共有${total}${p.itemUnit}${p.item}，先保留${reserved}${p.itemUnit}，其餘平均分給${question.quantities.c}${p.recipientUnit}${p.recipient}，每${p.recipientUnit}分到多少${p.itemUnit}${p.item}？`);
}

function normalizeMeasuredPortion(question, scenario) {
  const unit = scenario.measureUnit ?? scenario.capacityUnit;
  setAnswer(question, unit, question.finalAnswer);
  const p = scenario.placeholderBindings;
  setPrompt(question, `原有${question.quantities.a}${unit}${p.item}，先用掉${question.quantities.b}${unit}，剩下的平均分成${question.quantities.c}份，每份有多少${unit}？`);
}

function normalizeSharedCostPlusPersonal(question) {
  const perPersonByContext = { meal: 30, transport: 40, class_activity: 25, equipment_rental: 60 };
  const personalByContext = { meal: 15, transport: 20, class_activity: 10, equipment_rental: 30 };
  const quotient = perPersonByContext[question.contextDomain] ?? 30;
  const personal = personalByContext[question.contextDomain] ?? 15;
  updateDivideThenAdd(question, quotient, personal);
  const b = question.quantities.b;
  const a = question.quantities.a;
  setPrompt(question, `小安和其他人共${b}人，平均分擔${a}元的共同費用。小安另外花了${personal}元，小安一共花了多少元？`);
}

function normalizeDistributedResources(question, scenario) {
  const limits = {
    classroom: { quotient: 6, existing: 3 },
    library: { quotient: 5, existing: 3 },
    sports: { quotient: 2, existing: 1 },
    technology: { quotient: 1, existing: 1 }
  }[question.contextDomain] ?? { quotient: 4, existing: 2 };
  const quotient = 1 + ((question.quantities.a + question.quantities.b) % limits.quotient);
  const existing = 1 + ((question.quantities.c + question.quantities.b) % limits.existing);
  updateDivideThenAdd(question, quotient, existing);
  const p = scenario.placeholderBindings;
  setPrompt(question, `把${question.quantities.a}${p.itemUnit}${p.item}平均分給${question.quantities.b}${p.recipientUnit}${p.recipient}，每${p.recipientUnit}原本已有${existing}${p.itemUnit}${p.item}，分完後每${p.recipientUnit}共有多少${p.itemUnit}${p.item}？`);
}

function normalizeWalletOrBudget(question, contextLabel) {
  const personalShare = 20 + ((question.quantities.b + question.quantities.c) % 4) * 10;
  const remaining = 60 + ((question.quantities.a + question.quantities.c) % 7) * 10;
  updateTotalMinusShare(question, personalShare, remaining);
  const a = question.quantities.a;
  const b = question.quantities.b;
  const c = question.quantities.c;
  if (contextLabel === "wallet") {
    setPrompt(question, `小安原有${a}元，小安和其他人共${c}人，平均分擔一筆${b}元的費用。付完自己的部分後，小安還剩多少元？`);
  } else {
    setPrompt(question, `每人有${a}元活動預算，${c}人平均分擔${b}元的共同費用，每人還剩多少元預算？`);
  }
}

function normalizePlantContainer(question) {
  const q = question.quantities;
  setPrompt(question, `每排有${q.a}盆盆栽，每個展示架有${q.b}排，共有${q.c}個展示架。一共有多少盆盆栽？`);
}

function normalizeTicketUnitPrice(question, scenario) {
  const priceByContext = { stationery: 10, snacks: 15, tickets: 50, craft_materials: 20 };
  const packageUnitByContext = { stationery: "盒", snacks: "盒", tickets: "本", craft_materials: "包" };
  const price = priceByContext[question.contextDomain] ?? question.quantities.a;
  const packageUnit = packageUnitByContext[question.contextDomain] ?? "包";
  updateConsecutive(question, price, question.quantities.b, question.quantities.c, "元");
  const p = scenario.placeholderBindings;
  setPrompt(question, `每${p.itemUnit}${p.item}${price}元，每${packageUnit}有${question.quantities.b}${p.itemUnit}，買${question.quantities.c}${packageUnit}一共要付多少元？`);
}

function normalizeDisplayArray(question) {
  if (question.contextDomain !== "display_array") return;
  setAnswer(question, "件", question.finalAnswer);
  const q = question.quantities;
  setPrompt(question, `每層沿長邊排${q.a}件展示品，沿寬邊排${q.b}件展示品，共有${q.c}層。一共有多少件展示品？`);
}

function normalizeLengthTarget(question, scenario) {
  const p = scenario.placeholderBindings;
  const q = question.quantities;
  setPrompt(question, `${p.middleObject}的長度是${p.baseObject}的${q.m}倍，${p.finalObject}的長度是${p.middleObject}的${q.n}倍，${p.finalObject}的長度是${p.baseObject}的幾倍？`);
}

function normalizePriceEquivalence(question) {
  const lexicon = PRICE_EQUIVALENCE[question.contextDomain];
  if (!lexicon) return;
  updateQuantityChain(question, lexicon.basePrice);
  const q = question.quantities;
  setPrompt(question, `每${lexicon.base}${q.a}元，1${lexicon.middle}的價錢等於${q.m}${lexicon.base}的價錢，1${lexicon.final}的價錢等於${q.n}${lexicon.middle}的價錢。1${lexicon.final}多少元？`);
}

export function applyG3BU04HumanSemanticQualityV2(inputQuestion = {}) {
  const question = applyG3BU04HumanSemanticReadbackFullFix(inputQuestion);
  if (question.sourceId !== "g3b_u04_3b04" || question.kind !== "g3bU04SemanticWordProblem") return question;
  const scenario = resolveG3BU04SemanticScenarioProfile(question.templateFamilyId, question.contextDomain);
  if (!scenario) return question;

  switch (question.templateFamilyId) {
    case "tpl_g3b_u04_add_divide_joint_purchase_equal_share": normalizeJointPurchase(question); break;
    case "tpl_g3b_u04_add_divide_pooled_money_unit_price": normalizePooledMoney(question, scenario); break;
    case "tpl_g3b_u04_add_divide_combined_inventory_equal_distribution": normalizeCombinedInventory(question, scenario); break;
    case "tpl_g3b_u04_add_divide_combined_liquid_equal_portions": normalizeCombinedLiquid(question, scenario); break;
    case "tpl_g3b_u04_add_divide_promotion_total_equal_share": normalizePromotionSharedPurchase(question); break;
    case "tpl_g3b_u04_mul_div_buy_get_free_average_price":
    case "tpl_g3b_u04_mul_div_bonus_units_average_cost": normalizePromotionPrice(question, scenario); break;
    case "tpl_g3b_u04_sub_div_used_amount_then_share": normalizeMeasuredPortion(question, scenario); break;
    case "tpl_g3b_u04_sub_div_reserved_amount_then_distribute": normalizeReservedDistribution(question, scenario); break;
    case "tpl_g3b_u04_div_add_shared_cost_plus_personal_purchase": normalizeSharedCostPlusPersonal(question); break;
    case "tpl_g3b_u04_div_add_distributed_resources_plus_existing_per_group": normalizeDistributedResources(question, scenario); break;
    case "tpl_g3b_u04_total_minus_share_wallet_minus_shared_purchase": normalizeWalletOrBudget(question, "wallet"); break;
    case "tpl_g3b_u04_total_minus_share_personal_budget_minus_group_fee": normalizeWalletOrBudget(question, "budget"); break;
    case "tpl_g3b_u04_consecutive_items_per_row_per_box": if (question.contextDomain === "plants") normalizePlantContainer(question); break;
    case "tpl_g3b_u04_consecutive_unit_price_items_per_pack_packs": normalizeTicketUnitPrice(question, scenario); break;
    case "tpl_g3b_u04_consecutive_length_width_layers_array": normalizeDisplayArray(question); break;
    case "tpl_g3b_u04_ratio_length_ratio_composition": normalizeLengthTarget(question, scenario); break;
    case "tpl_g3b_u04_quantity_chain_price_equivalence_chain": normalizePriceEquivalence(question); break;
    default: break;
  }

  question.humanSemanticQuality = {
    task: G3B_U04_HUMAN_SEMANTIC_QUALITY_V2.task,
    version: G3B_U04_HUMAN_SEMANTIC_QUALITY_V2.version,
    all117VariantsAudited: true,
    authorityMutated: false
  };
  question.semanticSnapshot.humanSemanticQuality = cloneValue(question.humanSemanticQuality);
  question.metadata = {
    ...(question.metadata ?? {}),
    patternTags: [...new Set([...(question.metadata?.patternTags ?? []), "s57f7r1_full_117_variant_semantic_quality"])],
    difficultyTags: [...new Set([...(question.metadata?.difficultyTags ?? []), "human_semantic_quality_v2_accepted"])]
  };
  return question;
}

export function validateG3BU04HumanSemanticQualityV2(question = {}) {
  if (question?.sourceId !== "g3b_u04_3b04" || question?.kind !== "g3bU04SemanticWordProblem") {
    return { ok: true, errors: [], warnings: [], stage: "human_semantic_quality_v2" };
  }
  const errors = [];
  const scenario = resolveG3BU04SemanticScenarioProfile(question.templateFamilyId, question.contextDomain);
  const v1Result = validateG3BU04HumanSemanticReadback(projectForV1Validation(question, scenario));
  errors.push(...(v1Result.errors ?? []));
  const prompt = String(question.promptText ?? "");
  const family = question.templateFamilyId;
  const reviewedPromptCompatibilityApplied = family === "tpl_g3b_u04_add_divide_joint_purchase_equal_share"
    && isG3BU04P13ReviewBoundSharedActivityScope(question, prompt);

  if (family === "tpl_g3b_u04_div_add_shared_cost_plus_personal_purchase"
  && !prompt.includes("小安和其他人共")) {
  errors.push(issue("G3B_U04_READBACK_SHARED_ACTIVITY_SCOPE_UNCLEAR", "promptText", "The named student must be explicitly included in the shared-cost participant total."));
}

  if (family === "tpl_g3b_u04_add_divide_joint_purchase_equal_share") {
    const allowed = reviewedPromptCompatibilityApplied
      || (question.contextDomain === "equipment_rental"
        ? /共同租用|總租金/.test(prompt)
        : question.contextDomain === "tickets"
          ? /人的門票費用共/.test(prompt) && /車票費用共/.test(prompt)
          : /共同購買|一起訂購/.test(prompt));
    if (!allowed) errors.push(issue("G3B_U04_READBACK_SHARED_ACTIVITY_SCOPE_UNCLEAR", "promptText", "Shared purchase, use, or rental scope is unclear."));
  }

  const expectedUnit = publicExpectedUnit(question, scenario);
  if (question.answerUnit !== expectedUnit
    || question.answerText !== `${question.finalAnswer}${expectedUnit}`
    || question.semanticSnapshot?.answerUnit !== expectedUnit) {
    errors.push(issue("G3B_U04_READBACK_MEASURE_UNIT_MISMATCH", "answerUnit", "Public answer unit does not match the measured or counted target."));
  }

  if ((family === "tpl_g3b_u04_add_divide_joint_purchase_equal_share"
      && Math.min(question.quantities.a, question.quantities.b) < 15)
    || (family === "tpl_g3b_u04_add_divide_pooled_money_unit_price"
      && Math.min(question.quantities.a, question.quantities.b) < 5)
    || (family === "tpl_g3b_u04_mul_div_buy_get_free_average_price" && question.quantities.p > 50)
    || (family === "tpl_g3b_u04_mul_div_bonus_units_average_cost" && question.quantities.p > 50)
    || (family === "tpl_g3b_u04_consecutive_unit_price_items_per_pack_packs"
      && question.contextDomain === "tickets" && question.quantities.a < 30)
    || (family === "tpl_g3b_u04_total_minus_share_personal_budget_minus_group_fee" && question.quantities.a < 50)
    || (family === "tpl_g3b_u04_add_divide_promotion_total_equal_share"
      && question.quantities.b > question.quantities.a)) {
    errors.push(issue("G3B_U04_READBACK_COST_IMPLAUSIBLE", "quantities", "Context-specific prices, contributions, or budgets are implausible."));
  }

  if (family === "tpl_g3b_u04_div_add_distributed_resources_plus_existing_per_group") {
    const quotient = question.quantities.a / question.quantities.b;
    const caps = { classroom: 9, library: 8, sports: 3, technology: 2 };
    if (!Number.isInteger(quotient) || question.finalAnswer > (caps[question.contextDomain] ?? 8)) {
      errors.push(issue("G3B_U04_READBACK_PER_RECIPIENT_QUANTITY_IMPLAUSIBLE", "quantities", "Per-recipient resource quantity is implausible for the selected context."));
    }
  }
  if (family === "tpl_g3b_u04_sub_div_reserved_amount_then_distribute") {
  const caps = { books: 4, prizes: 3, snacks: 4, sports_equipment: 2 };
  if (question.finalAnswer > (caps[question.contextDomain] ?? 4)) {
    errors.push(issue("G3B_U04_READBACK_PER_RECIPIENT_QUANTITY_IMPLAUSIBLE", "quantities", "Per-recipient reserved-distribution quantity is implausible for the selected context."));
  }
}
if (family === "tpl_g3b_u04_add_divide_combined_inventory_equal_distribution") {
  const caps = { classroom: 10, library: 6, sports: 2, crafts: 10 };
  if (question.finalAnswer > (caps[question.contextDomain] ?? 8)) {
    errors.push(issue("G3B_U04_READBACK_PER_RECIPIENT_QUANTITY_IMPLAUSIBLE", "quantities", "Per-recipient combined inventory quantity is implausible for the selected context."));
  }
}

  if (prompt.includes("undefined") || prompt.includes("本車票") || prompt.includes("本門票")
    || (family === "tpl_g3b_u04_div_add_new_packages_plus_existing_stock" && prompt.includes("新做好的"))
    || (family === "tpl_g3b_u04_consecutive_items_per_row_per_box" && question.contextDomain === "plants" && prompt.includes("每箱"))
    || (family === "tpl_g3b_u04_consecutive_length_width_layers_array" && question.contextDomain === "display_array" && !prompt.includes("展示品"))) {
    errors.push(issue("G3B_U04_READBACK_CONTEXT_LEXICON_UNNATURAL", "promptText", "Context noun, classifier, action, or container wording is unnatural."));
  }

  if (question.humanSemanticQuality?.version !== G3B_U04_HUMAN_SEMANTIC_QUALITY_V2.version
    || question.humanSemanticQuality?.all117VariantsAudited !== true
    || question.semanticSnapshot?.humanSemanticQuality?.version !== G3B_U04_HUMAN_SEMANTIC_QUALITY_V2.version) {
    errors.push(issue("G3B_U04_READBACK_CONTEXT_LEXICON_UNNATURAL", "humanSemanticQuality", "Full 117-variant semantic quality provenance is missing."));
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings: [],
    stage: "human_semantic_quality_v2",
    validatorVersion: G3B_U04_HUMAN_SEMANTIC_QUALITY_V2.version,
    reviewedPromptCompatibility: {
      applied: reviewedPromptCompatibilityApplied,
      reviewArtifactSha256: reviewedPromptCompatibilityApplied
        ? G3B_U04_P13_REVIEW_BOUND_SHARED_SCOPE_SHA256
        : null,
      resolvedErrorCodes: reviewedPromptCompatibilityApplied
        ? ["G3B_U04_READBACK_SHARED_ACTIVITY_SCOPE_UNCLEAR"]
        : []
    }
  };
}
