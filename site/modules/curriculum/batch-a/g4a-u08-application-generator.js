import { getBatchASourceUnit } from "./source-units.js";
import {
  BATCH_A_RESOLVER_SELECTION_MODES,
  resolveVisiblePatternGroupSelection
} from "./visible-pattern-group-resolver.js";
import {
  G4A_U08_PHASE2A_PATTERN_SPEC_IDS,
  G4A_U08_SOURCE_ID,
  getBatchABrowserPatternDefinition,
  isG4AU08Phase2APatternSpecId
} from "./source-pattern-g4a-u08-phase2a-extension.js";
import {
  G4A_U08_PHASE2A_CONVERSION_TARGET_RATE,
  cloneValue,
  convertByRule,
  getDefaultConversionRuleForDomain,
  isConversionEligibleDomain
} from "./g4a-u08-application-units.js";

const OPERATORS = new Set(["+", "-", "×", "÷"]);
const PRECEDENCE = Object.freeze({ "+": 1, "-": 1, "×": 2, "÷": 2 });
const DIVISION_GROUPS = Object.freeze([2, 4, 5, 10]);
const TEMPLATE_KP = Object.freeze({
  tpl_app_add_three_quantities: "kp_g4a_u08_app_add_sub_sequence",
  tpl_app_add_then_subtract_state_change: "kp_g4a_u08_app_add_sub_sequence",
  tpl_app_subtract_then_add_state_change: "kp_g4a_u08_app_add_sub_sequence",
  tpl_app_subtract_twice_state_change: "kp_g4a_u08_app_add_sub_sequence",
  tpl_app_adjusted_amount_then_subtract: "kp_g4a_u08_app_parentheses_grouping",
  tpl_app_divide_by_group_product: "kp_g4a_u08_app_parentheses_grouping",
  tpl_app_multiply_after_difference_then_add_sub: "kp_g4a_u08_app_parentheses_grouping",
  tpl_app_multiply_then_share: "kp_g4a_u08_app_mul_div_sequence",
  tpl_app_unit_rate_then_scale: "kp_g4a_u08_app_mul_div_sequence",
  tpl_app_divide_then_divide: "kp_g4a_u08_app_mul_div_sequence",
  tpl_app_payment_minus_unit_cost_times_quantity: "kp_g4a_u08_app_mul_div_before_add_sub",
  tpl_app_subtract_divided_amount_or_add_divided_amount: "kp_g4a_u08_app_mul_div_before_add_sub"
});

const SCENARIO_BANK = Object.freeze({
  money: Object.freeze([
    Object.freeze({ scene: "校外教學", item: "門票", packageNoun: "張門票", groupNoun: "門票", packUnit: "張", extraVerb: "加購", restoreVerb: "加購" }),
    Object.freeze({ scene: "文具店", item: "筆記本", packageNoun: "本筆記本", groupNoun: "筆記本", packUnit: "本", extraVerb: "加買", restoreVerb: "加買" }),
    Object.freeze({ scene: "麵包店", item: "麵包", packageNoun: "個麵包", groupNoun: "麵包", packUnit: "個", extraVerb: "多買", restoreVerb: "多買" }),
    Object.freeze({ scene: "園遊會", item: "點券", packageNoun: "張點券", groupNoun: "點券", packUnit: "張", extraVerb: "加購", restoreVerb: "加購" }),
    Object.freeze({ scene: "公車站", item: "車票", packageNoun: "張車票", groupNoun: "車票", packUnit: "張", extraVerb: "加買", restoreVerb: "加買" }),
    Object.freeze({ scene: "明信片小店", item: "明信片", packageNoun: "張明信片", groupNoun: "明信片", packUnit: "張", extraVerb: "多買", restoreVerb: "多買" })
  ]),
  count_items: Object.freeze([
    Object.freeze({ scene: "圖書館活動", item: "書籤", container: "批", groupNoun: "書籤", perPack: "包書籤", packUnit: "包", unitLabels: Object.freeze(["張"]), extraVerb: "加印", restoreVerb: "補印", consumeVerb: "發出" }),
    Object.freeze({ scene: "美術課", item: "貼紙", container: "疊", groupNoun: "貼紙", perPack: "疊貼紙", packUnit: "疊", unitLabels: Object.freeze(["張"]), extraVerb: "補發", restoreVerb: "補發", consumeVerb: "用掉" }),
    Object.freeze({ scene: "班級獎勵", item: "獎勵卡", container: "疊", groupNoun: "獎勵卡", perPack: "盒獎勵卡", packUnit: "盒", unitLabels: Object.freeze(["張"]), extraVerb: "補進", restoreVerb: "補進", consumeVerb: "發出" }),
    Object.freeze({ scene: "運動會", item: "毛巾", container: "箱", groupNoun: "毛巾", perPack: "箱毛巾", packUnit: "箱", unitLabels: Object.freeze(["條"]), extraVerb: "加準備", restoreVerb: "補進", consumeVerb: "發出" }),
    Object.freeze({ scene: "自然課", item: "實驗卡", container: "疊", groupNoun: "實驗卡", perPack: "組實驗卡", packUnit: "組", unitLabels: Object.freeze(["張"]), extraVerb: "加印", restoreVerb: "補印", consumeVerb: "用掉" }),
    Object.freeze({ scene: "積木角", item: "積木", container: "盒", groupNoun: "積木", perPack: "盒積木", packUnit: "盒", unitLabels: Object.freeze(["個"]), extraVerb: "補進", restoreVerb: "補進", consumeVerb: "拿走" })
  ]),
  capacity: Object.freeze([
    Object.freeze({ scene: "運動會補給站", item: "運動飲料", container: "桶", groupNoun: "運動飲料", perPack: "箱運動飲料", packUnit: "箱", extraVerb: "再倒入", restoreVerb: "補充", consumeVerb: "分裝" }),
    Object.freeze({ scene: "生日會", item: "果汁", container: "壺", groupNoun: "果汁", perPack: "壺果汁", packUnit: "壺", extraVerb: "多準備", restoreVerb: "補充", consumeVerb: "喝掉" }),
    Object.freeze({ scene: "午餐廚房", item: "湯", container: "鍋", groupNoun: "湯", perPack: "鍋湯", packUnit: "鍋", extraVerb: "再加入", restoreVerb: "再加入", consumeVerb: "盛出" }),
    Object.freeze({ scene: "教室飲水區", item: "飲用水", container: "桶", groupNoun: "飲用水", perPack: "桶飲用水", packUnit: "桶", extraVerb: "補充", restoreVerb: "補充", consumeVerb: "倒出" }),
    Object.freeze({ scene: "園藝課", item: "澆花水", container: "桶", groupNoun: "澆花水", perPack: "桶澆花水", packUnit: "桶", extraVerb: "再裝", restoreVerb: "補水", consumeVerb: "澆掉" }),
    Object.freeze({ scene: "早餐店", item: "豆漿", container: "瓶", groupNoun: "豆漿", perPack: "箱豆漿", packUnit: "箱", extraVerb: "多準備", restoreVerb: "補充", consumeVerb: "賣出" })
  ]),
  weight: Object.freeze([
    Object.freeze({ scene: "烘焙社", item: "麵粉", container: "袋", groupNoun: "麵粉", perPack: "袋麵粉", packUnit: "袋", extraVerb: "再加入", restoreVerb: "補進", consumeVerb: "用掉" }),
    Object.freeze({ scene: "午餐廚房", item: "白米", container: "袋", groupNoun: "白米", perPack: "袋白米", packUnit: "袋", extraVerb: "補進", restoreVerb: "補進", consumeVerb: "煮掉" }),
    Object.freeze({ scene: "市場採買", item: "蔬菜", container: "籃", groupNoun: "蔬菜", perPack: "籃蔬菜", packUnit: "籃", extraVerb: "多買", restoreVerb: "補買", consumeVerb: "賣出" }),
    Object.freeze({ scene: "資源回收", item: "回收紙", container: "捆", groupNoun: "回收紙", perPack: "捆回收紙", packUnit: "捆", extraVerb: "再收集", restoreVerb: "再收集", consumeVerb: "送出" }),
    Object.freeze({ scene: "寵物照顧", item: "飼料", container: "包", groupNoun: "飼料", perPack: "包飼料", packUnit: "包", extraVerb: "補充", restoreVerb: "補充", consumeVerb: "餵掉" }),
    Object.freeze({ scene: "郵局寄件", item: "包裹", container: "件", groupNoun: "包裹", perPack: "箱包裹", packUnit: "箱", extraVerb: "加寄", restoreVerb: "加寄", consumeVerb: "寄出" })
  ]),
  length: Object.freeze([
    Object.freeze({ scene: "美術課", item: "緞帶", container: "段", groupNoun: "緞帶", perPack: "卷緞帶", packUnit: "卷", extraVerb: "再剪下一段", restoreVerb: "接上一段", consumeVerb: "剪下" }),
    Object.freeze({ scene: "園藝課", item: "水管", container: "段", groupNoun: "水管", perPack: "卷水管", packUnit: "卷", extraVerb: "接上", restoreVerb: "接上", consumeVerb: "剪掉" }),
    Object.freeze({ scene: "布置教室", item: "紙膠帶", container: "段", groupNoun: "紙膠帶", perPack: "卷紙膠帶", packUnit: "卷", extraVerb: "再貼", restoreVerb: "補上一段", consumeVerb: "用掉" }),
    Object.freeze({ scene: "童軍活動", item: "繩子", container: "段", groupNoun: "繩子", perPack: "捆繩子", packUnit: "捆", extraVerb: "加接", restoreVerb: "加接", consumeVerb: "剪下" }),
    Object.freeze({ scene: "木工角", item: "木條", container: "段", groupNoun: "木條", perPack: "束木條", packUnit: "束", extraVerb: "補上一段", restoreVerb: "接上一段", consumeVerb: "鋸下" }),
    Object.freeze({ scene: "運動場", item: "跑道標線", container: "段", groupNoun: "跑道標線", perPack: "卷標線帶", packUnit: "卷", extraVerb: "再畫", restoreVerb: "補畫", consumeVerb: "移除" })
  ]),
  time: Object.freeze([
    Object.freeze({ scene: "閱讀課", item: "閱讀時間", container: "次", groupNoun: "閱讀時間", perPack: "段閱讀時間", packUnit: "段", extraVerb: "再安排", restoreVerb: "再安排", consumeVerb: "完成" }),
    Object.freeze({ scene: "籃球隊", item: "練球時間", container: "次", groupNoun: "練球時間", perPack: "段練球時間", packUnit: "段", extraVerb: "加練", restoreVerb: "加練", consumeVerb: "完成" }),
    Object.freeze({ scene: "資訊課", item: "影片播放時間", container: "段", groupNoun: "影片播放時間", perPack: "段影片", packUnit: "段", extraVerb: "再播放", restoreVerb: "再播放", consumeVerb: "播放完" }),
    Object.freeze({ scene: "科學社", item: "實驗觀察時間", container: "次", groupNoun: "實驗觀察時間", perPack: "段觀察時間", packUnit: "段", extraVerb: "延長", restoreVerb: "延長", consumeVerb: "完成" }),
    Object.freeze({ scene: "家政課", item: "烘烤時間", container: "次", groupNoun: "烘烤時間", perPack: "段烘烤時間", packUnit: "段", extraVerb: "延長", restoreVerb: "延長", consumeVerb: "完成" }),
    Object.freeze({ scene: "平板充電站", item: "充電時間", container: "次", groupNoun: "充電時間", perPack: "段充電時間", packUnit: "段", extraVerb: "延長", restoreVerb: "延長", consumeVerb: "完成" })
  ])
});

function issue(code, path, message, severity = "error") {
  return { code, severity, path, message };
}

function hashSeed(value) {
  let acc = 0;
  for (const char of String(value ?? "default")) acc = ((acc * 31) + char.charCodeAt(0)) >>> 0;
  return acc || 1;
}

function mix32(value) {
  let mixed = value >>> 0;
  mixed = Math.imul(mixed ^ (mixed >>> 16), 0x7feb352d);
  mixed = Math.imul(mixed ^ (mixed >>> 15), 0x846ca68b);
  return (mixed ^ (mixed >>> 16)) >>> 0;
}

function randomInt(seedValue, min, max) {
  return min + (seedValue % (max - min + 1));
}

function toRpn(tokens) {
  const output = [];
  const ops = [];
  for (const token of tokens) {
    if (Number.isInteger(token)) output.push(token);
    else if (token === "(") ops.push(token);
    else if (token === ")") {
      while (ops.length > 0 && ops[ops.length - 1] !== "(") output.push(ops.pop());
      ops.pop();
    } else if (OPERATORS.has(token)) {
      while (ops.length > 0 && OPERATORS.has(ops[ops.length - 1]) && PRECEDENCE[ops[ops.length - 1]] >= PRECEDENCE[token]) output.push(ops.pop());
      ops.push(token);
    }
  }
  while (ops.length > 0) output.push(ops.pop());
  return output;
}

export function evaluateG4AU08ApplicationEquationTokens(tokens) {
  const stack = [];
  const operations = [];
  for (const token of toRpn(tokens)) {
    if (Number.isInteger(token)) {
      stack.push(token);
      continue;
    }
    const right = stack.pop();
    const left = stack.pop();
    let result;
    if (token === "+") result = left + right;
    else if (token === "-") result = left - right;
    else if (token === "×") result = left * right;
    else if (token === "÷") result = left / right;
    operations.push({ op: token, left, right, result });
    stack.push(result);
  }
  return { finalAnswer: stack[0], operations, intermediateResults: operations.map((operation) => operation.result) };
}

function tokensToExpression(tokens) {
  return tokens.join(" ").replaceAll("( ", "(").replaceAll(" )", ")");
}

function spreadCounts(patternSpecIds, questionCount) {
  if (patternSpecIds.length === 0 || questionCount <= 0) return [];
  const base = Math.floor(questionCount / patternSpecIds.length);
  let remainder = questionCount % patternSpecIds.length;
  return patternSpecIds.map((patternSpecId) => {
    const count = base + (remainder > 0 ? 1 : 0);
    remainder -= remainder > 0 ? 1 : 0;
    return { patternSpecId, questionCount: count };
  }).filter((entry) => entry.questionCount > 0);
}

function appMetadata(definition, scenario) {
  return {
    patternId: definition.patternSpecId,
    sourceId: definition.sourceId,
    scenarioScene: scenario.scene,
    scenarioItem: scenario.item,
    patternTags: ["batch_a", "browser_bridge", definition.sourceId, definition.patternSpecId, "phase2a_application", `scene:${scenario.scene}`],
    skillTags: [...definition.skillTags],
    difficultyTags: [...definition.difficultyTags],
    curriculumNodeIds: [definition.sourceId],
    canonicalSkillIds: [...definition.canonicalSkillIds]
  };
}

function selectUnitDomain(definition, sequenceNumber, conversionRequired) {
  const domains = definition.allowedUnitDomains ?? [];
  const eligibleDomains = domains.filter(isConversionEligibleDomain);
  const pool = conversionRequired && eligibleDomains.length > 0 ? eligibleDomains : domains;
  return pool[(sequenceNumber - 1) % pool.length] ?? "count_items";
}

function scenarioFor(unitDomain, sequenceNumber) {
  const pool = SCENARIO_BANK[unitDomain] ?? SCENARIO_BANK.count_items;
  return pool[(sequenceNumber - 1) % pool.length];
}

function defaultUnitLabel(unitDomain, sequenceNumber, scenario = null) {
  if (Array.isArray(scenario?.unitLabels) && scenario.unitLabels.length > 0) {
    return scenario.unitLabels[(sequenceNumber - 1) % scenario.unitLabels.length];
  }
  const labels = {
    money: ["元"],
    count_items: ["個", "張", "條", "本", "包"],
    capacity: ["mL", "L"],
    weight: ["g", "kg"],
    length: ["cm", "m", "mm"],
    time: ["分", "秒"]
  }[unitDomain] ?? ["個"];
  return labels[(sequenceNumber - 1) % labels.length];
}

function measuredValue(unitDomain, sequenceNumber, fallback) {
  if (unitDomain === "time") return [10, 15, 20, 25, 30, 40, 45, 60][sequenceNumber % 8];
  if (unitDomain === "money") return [12, 15, 18, 20, 25][sequenceNumber % 5];
  return fallback;
}

function makeMeasurement({ unitDomain, sequenceNumber, baseValue, conversionRequired, scenario = null }) {
  if (conversionRequired && isConversionEligibleDomain(unitDomain)) {
    const rule = getDefaultConversionRuleForDomain(unitDomain);
    const sourceValue = Math.max(1, Math.min(6, Math.ceil(baseValue / Math.max(rule.factor, 1))));
    const conversion = convertByRule(rule, sourceValue);
    return {
      displayValue: conversion.sourceValue,
      displayUnitLabel: conversion.fromUnit,
      equationValue: conversion.convertedValue,
      finalUnitLabel: conversion.toUnit,
      conversion
    };
  }
  const unitLabel = defaultUnitLabel(unitDomain, sequenceNumber, scenario);
  return { displayValue: baseValue, displayUnitLabel: unitLabel, equationValue: baseValue, finalUnitLabel: unitLabel, conversion: null };
}

function valueText(value, unitLabel) {
  return `${value}${unitLabel}`;
}

function prefixConversion(conversion) {
  return conversion ? `${conversion.lineText}。` : "";
}

function normalStartValue(unitDomain, sequenceNumber, n) {
  if (unitDomain === "time") return [120, 180, 240, 300, 360][sequenceNumber % 5];
  if (unitDomain === "weight") return n(100, 120, 500);
  if (unitDomain === "capacity") return n(101, 120, 500);
  if (unitDomain === "length") return n(102, 120, 500);
  return n(103, 120, 500);
}

function packTotalBaseValue(unitDomain, conversionRequired, sequenceNumber, n) {
  if (conversionRequired) return n(104, 1, 5) * 1000;
  if (unitDomain === "time") return [120, 180, 240, 300, 360][sequenceNumber % 5];
  if (unitDomain === "capacity") return n(105, 200, 900);
  if (unitDomain === "weight") return n(106, 200, 900);
  return n(107, 200, 1200);
}

function unitBaseValue(unitDomain, conversionRequired, sequenceNumber, n) {
  if (conversionRequired) return n(108, 1, 4) * 100;
  if (unitDomain === "time") return [20, 30, 40, 45, 60][sequenceNumber % 5];
  if (unitDomain === "capacity") return n(109, 40, 150);
  if (unitDomain === "weight") return n(110, 40, 150);
  if (unitDomain === "length") return n(111, 40, 180);
  return n(112, 40, 180);
}

function displayQuantityForConvertedTotal(total, conversion, displayedUnitValue) {
  return conversion ? total / (conversion.convertedValue / displayedUnitValue) : total;
}

function buildTemplateData(definition, sequenceNumber, seed, conversionRequired) {
  const seedValue = mix32(hashSeed(`${seed}:${definition.patternSpecId}:${sequenceNumber}`));
  const n = (offset, min, max) => randomInt(mix32(seedValue + offset + sequenceNumber * 37), min, max);
  const unitDomain = selectUnitDomain(definition, sequenceNumber, conversionRequired);
  const scenario = scenarioFor(unitDomain, sequenceNumber + G4A_U08_PHASE2A_PATTERN_SPEC_IDS.indexOf(definition.patternSpecId));
  const first = (baseValue) => makeMeasurement({ unitDomain, sequenceNumber, baseValue, conversionRequired, scenario });
  let tokens;
  let prompt;
  let quantities = {};
  let convertedQuantities = null;
  let finalUnitLabel;
  let conversion = null;

  switch (definition.storyTemplateId) {
    case "tpl_app_add_three_quantities": {
      const aM = first(normalStartValue(unitDomain, sequenceNumber, n));
      const b = measuredValue(unitDomain, sequenceNumber + 1, n(2, 30, 140));
      const c = measuredValue(unitDomain, sequenceNumber + 2, n(3, 30, 140));
      tokens = [aM.equationValue, "+", b, "+", c];
      finalUnitLabel = aM.finalUnitLabel;
      conversion = aM.conversion;
      quantities = { a: aM.displayValue, b, c };
      prompt = `${prefixConversion(conversion)}${scenario.scene}準備了三${scenario.container}${scenario.item}，分別是${valueText(aM.displayValue, aM.displayUnitLabel)}、${valueText(b, finalUnitLabel)}和${valueText(c, finalUnitLabel)}。一共有多少${finalUnitLabel}？`;
      break;
    }
    case "tpl_app_add_then_subtract_state_change": {
      const aM = first(normalStartValue(unitDomain, sequenceNumber, n));
      const b = measuredValue(unitDomain, sequenceNumber + 3, n(5, 30, 130));
      const c = Math.min(aM.equationValue + b, measuredValue(unitDomain, sequenceNumber + 4, n(6, 20, 100)));
      tokens = [aM.equationValue, "+", b, "-", c];
      finalUnitLabel = aM.finalUnitLabel;
      conversion = aM.conversion;
      quantities = { start: aM.displayValue, increase: b, decrease: c };
      prompt = `${prefixConversion(conversion)}${scenario.scene}原本有${valueText(aM.displayValue, aM.displayUnitLabel)}的${scenario.item}，又${scenario.extraVerb}${valueText(b, finalUnitLabel)}，後來${scenario.consumeVerb ?? "用掉"}${valueText(c, finalUnitLabel)}，還剩多少${finalUnitLabel}？`;
      break;
    }
    case "tpl_app_subtract_then_add_state_change": {
      const aM = first(normalStartValue(unitDomain, sequenceNumber, n));
      const b = measuredValue(unitDomain, sequenceNumber + 5, n(8, 30, 120));
      const c = measuredValue(unitDomain, sequenceNumber + 6, n(9, 20, 120));
      tokens = [aM.equationValue, "-", Math.min(b, aM.equationValue), "+", c];
      finalUnitLabel = aM.finalUnitLabel;
      conversion = aM.conversion;
      quantities = { start: aM.displayValue, decrease: Math.min(b, aM.equationValue), increase: c };
      prompt = `${prefixConversion(conversion)}${scenario.scene}原本有${valueText(aM.displayValue, aM.displayUnitLabel)}的${scenario.item}，先${scenario.consumeVerb ?? "用掉"}${valueText(quantities.decrease, finalUnitLabel)}，後來${scenario.restoreVerb ?? scenario.extraVerb}${valueText(c, finalUnitLabel)}，現在有多少${finalUnitLabel}？`;
      break;
    }
    case "tpl_app_subtract_twice_state_change": {
      const aM = first(normalStartValue(unitDomain, sequenceNumber, n));
      const b = measuredValue(unitDomain, sequenceNumber + 7, n(11, 20, 110));
      const c = measuredValue(unitDomain, sequenceNumber + 8, n(12, 20, 110));
      const safeB = Math.min(b, Math.floor(aM.equationValue / 2));
      const safeC = Math.min(c, aM.equationValue - safeB);
      tokens = [aM.equationValue, "-", safeB, "-", safeC];
      finalUnitLabel = aM.finalUnitLabel;
      conversion = aM.conversion;
      quantities = { start: aM.displayValue, firstUse: safeB, secondUse: safeC };
      if (unitDomain === "time") prompt = `${prefixConversion(conversion)}${scenario.scene}安排了${valueText(aM.displayValue, aM.displayUnitLabel)}的${scenario.item}，上午完成${valueText(safeB, finalUnitLabel)}，下午又完成${valueText(safeC, finalUnitLabel)}，還剩多少${finalUnitLabel}？`;
      else prompt = `${prefixConversion(conversion)}${scenario.scene}原本有${valueText(aM.displayValue, aM.displayUnitLabel)}的${scenario.item}，上午${scenario.consumeVerb ?? "用掉"}${valueText(safeB, finalUnitLabel)}，下午又${scenario.consumeVerb ?? "用掉"}${valueText(safeC, finalUnitLabel)}，還剩多少${finalUnitLabel}？`;
      break;
    }
    case "tpl_app_adjusted_amount_then_subtract": {
      const outerM = first(conversionRequired ? n(13, 1, 5) * 1000 : normalStartValue(unitDomain, sequenceNumber, n));
      const base = measuredValue(unitDomain, sequenceNumber + 9, n(14, 80, 180));
      const decrease = Math.min(base - 1, measuredValue(unitDomain, sequenceNumber + 10, n(15, 10, 60)));
      tokens = [outerM.equationValue, "-", "(", base, "-", decrease, ")"];
      finalUnitLabel = outerM.finalUnitLabel;
      conversion = outerM.conversion;
      quantities = { outer: outerM.displayValue, base, decrease };
      if (unitDomain === "money") prompt = `${scenario.scene}每${scenario.packageNoun}原價${base}元，活動折扣${decrease}元。付${outerM.displayValue}元，找回多少元？`;
      else prompt = `${prefixConversion(conversion)}${scenario.scene}每份${scenario.item}原本需要${valueText(base, finalUnitLabel)}，調整後少用${valueText(decrease, finalUnitLabel)}。現有${valueText(outerM.displayValue, outerM.displayUnitLabel)}，扣掉調整後的一份，還剩多少${finalUnitLabel}？`;
      break;
    }
    case "tpl_app_divide_by_group_product": {
      const totalM = first(packTotalBaseValue(unitDomain, conversionRequired, sequenceNumber, n));
      const groups = [2, 4, 5][sequenceNumber % 3];
      const perGroup = 5;
      tokens = [totalM.equationValue, "÷", "(", groups, "×", perGroup, ")"];
      finalUnitLabel = totalM.finalUnitLabel;
      conversion = totalM.conversion;
      quantities = { total: totalM.displayValue, groups, perGroup };
      prompt = `${prefixConversion(conversion)}${scenario.scene}每份材料包需要${groups}組，每組用${valueText(perGroup, finalUnitLabel)}的${scenario.item}。共有${valueText(totalM.displayValue, totalM.displayUnitLabel)}，可以分成幾份材料包？`;
      finalUnitLabel = "份";
      break;
    }
    case "tpl_app_multiply_after_difference_then_add_sub": {
      const unitM = first(unitBaseValue(unitDomain, conversionRequired, sequenceNumber, n));
      const planned = n(18, 6, 12);
      const cancelled = n(19, 1, Math.min(4, planned - 1));
      const extra = measuredValue(unitDomain, sequenceNumber + 11, n(20, 20, 80));
      tokens = [unitM.equationValue, "×", "(", planned, "-", cancelled, ")", "+", extra];
      finalUnitLabel = unitM.finalUnitLabel;
      conversion = unitM.conversion;
      quantities = { unit: unitM.displayValue, planned, cancelled, extra };
      prompt = `${prefixConversion(conversion)}${scenario.scene}每份作品需要${valueText(unitM.displayValue, unitM.displayUnitLabel)}的${scenario.item}，原本要做${planned}份，後來取消${cancelled}份，又${scenario.restoreVerb ?? scenario.extraVerb}${valueText(extra, finalUnitLabel)}，共需要多少${finalUnitLabel}？`;
      break;
    }
    case "tpl_app_multiply_then_share": {
      const boxes = DIVISION_GROUPS[sequenceNumber % DIVISION_GROUPS.length];
      const perBoxM = first(unitBaseValue(unitDomain, conversionRequired, sequenceNumber, n));
      const groups = DIVISION_GROUPS[(sequenceNumber + 1) % DIVISION_GROUPS.length];
      tokens = [boxes, "×", perBoxM.equationValue, "÷", groups];
      finalUnitLabel = perBoxM.finalUnitLabel;
      conversion = perBoxM.conversion;
      quantities = { boxes, perBox: perBoxM.displayValue, groups };
      prompt = `${prefixConversion(conversion)}${scenario.scene}有${boxes}${scenario.perPack}，每${scenario.packUnit}有${valueText(perBoxM.displayValue, perBoxM.displayUnitLabel)}，平均分給${groups}組，每組分到多少${finalUnitLabel}？`;
      break;
    }
    case "tpl_app_unit_rate_then_scale": {
      const knownUnits = [2, 3, 4, 5][sequenceNumber % 4];
      const targetUnits = knownUnits * 2;
      const perUnitM = first(unitBaseValue(unitDomain, conversionRequired, sequenceNumber, n));
      const total = perUnitM.equationValue * knownUnits;
      tokens = [total, "÷", knownUnits, "×", targetUnits];
      finalUnitLabel = perUnitM.finalUnitLabel;
      conversion = perUnitM.conversion;
      quantities = { total: displayQuantityForConvertedTotal(total, conversion, perUnitM.displayValue), knownUnits, targetUnits };
      prompt = `${prefixConversion(conversion)}在${scenario.scene}中，${knownUnits}份${scenario.item}共需要${valueText(quantities.total, perUnitM.displayUnitLabel)}，照這樣計算，${targetUnits}份需要多少${finalUnitLabel}？`;
      break;
    }
    case "tpl_app_divide_then_divide": {
      const groups = [2, 4, 5][sequenceNumber % 3];
      const peoplePerGroup = [2, 4, 5][(sequenceNumber + 1) % 3];
      const perPersonM = first(unitBaseValue(unitDomain, conversionRequired, sequenceNumber, n));
      const total = perPersonM.equationValue * groups * peoplePerGroup;
      tokens = [total, "÷", groups, "÷", peoplePerGroup];
      finalUnitLabel = perPersonM.finalUnitLabel;
      conversion = perPersonM.conversion;
      quantities = { total: displayQuantityForConvertedTotal(total, conversion, perPersonM.displayValue), groups, peoplePerGroup };
      prompt = `${prefixConversion(conversion)}${scenario.scene}共有${valueText(quantities.total, perPersonM.displayUnitLabel)}的${scenario.item}，先平均分成${groups}份，每份再平均分給${peoplePerGroup}人，每人得到多少${finalUnitLabel}？`;
      break;
    }
    case "tpl_app_payment_minus_unit_cost_times_quantity": {
      const unitPrice = n(25, 10, 25);
      const quantity = n(26, 2, 6);
      const cost = unitPrice * quantity;
      const payment = [50, 100, 200, 500].find((candidate) => candidate > cost) ?? 500;
      tokens = [payment, "-", unitPrice, "×", quantity];
      finalUnitLabel = "元";
      quantities = { payment, unitPrice, quantity };
      prompt = `${scenario.scene}每${scenario.packageNoun}要${unitPrice}元，買${quantity}${scenario.packageNoun}，付${payment}元，可以找回幾元？`;
      break;
    }
    case "tpl_app_subtract_divided_amount_or_add_divided_amount":
    default: {
      const totalM = first(packTotalBaseValue(unitDomain, conversionRequired, sequenceNumber, n));
      const groups = DIVISION_GROUPS[sequenceNumber % DIVISION_GROUPS.length];
      const used = measuredValue(unitDomain, sequenceNumber + 12, n(28, 10, 60));
      tokens = [totalM.equationValue, "÷", groups, "+", used];
      finalUnitLabel = totalM.finalUnitLabel;
      conversion = totalM.conversion;
      quantities = { total: totalM.displayValue, groups, used };
      prompt = `${prefixConversion(conversion)}${scenario.scene}共有${valueText(totalM.displayValue, totalM.displayUnitLabel)}的${scenario.item}，平均分成${groups}份後，又${scenario.restoreVerb ?? scenario.extraVerb}${valueText(used, finalUnitLabel)}，合起來是多少${finalUnitLabel}？`;
      break;
    }
  }

  const evaluated = evaluateG4AU08ApplicationEquationTokens(tokens);
  if (conversion) convertedQuantities = { first: conversion };
  return { tokens, prompt, quantities, convertedQuantities, conversion, finalUnitLabel, finalAnswer: evaluated.finalAnswer, scenario };
}

function makeApplicationQuestion(definition, sequenceNumber, seed, conversionRequired) {
  const data = buildTemplateData(definition, sequenceNumber, seed, conversionRequired);
  const equationModel = tokensToExpression(data.tokens);
  const finalAnswer = data.finalAnswer;
  const finalAnswerWithUnit = `${finalAnswer} ${data.finalUnitLabel}`;
  const conversionLine = data.conversion?.conversionText ?? null;
  return {
    id: `${definition.patternSpecId}-${sequenceNumber}`,
    sourceId: definition.sourceId,
    phase: "Phase2A",
    kind: "g4aU08ApplicationWordProblem",
    knowledgePointId: TEMPLATE_KP[definition.storyTemplateId] ?? definition.knowledgePointId,
    patternSpecId: definition.patternSpecId,
    storyTemplateId: definition.storyTemplateId,
    unitDomain: data.conversion?.unitDomain ?? selectUnitDomain(definition, sequenceNumber, Boolean(data.conversion)),
    unitLabel: data.conversion?.fromUnit ?? data.finalUnitLabel,
    finalUnitLabel: data.finalUnitLabel,
    quantities: data.quantities,
    conversionRequired: Boolean(data.conversion),
    conversionRule: data.conversion ? { ruleId: data.conversion.ruleId, fromUnit: data.conversion.fromUnit, toUnit: data.conversion.toUnit, factor: data.conversion.convertedValue / data.conversion.sourceValue } : null,
    convertedQuantities: data.convertedQuantities,
    conversionLine,
    equationModel,
    equationTokens: data.tokens,
    finalAnswer,
    finalAnswerWithUnit,
    answerText: finalAnswerWithUnit,
    displayText: `${data.prompt} 答案：${finalAnswerWithUnit}`,
    blankedDisplayText: data.prompt,
    promptText: data.prompt,
    operationOrderTags: [...definition.operationOrderTags],
    metadata: appMetadata(definition, data.scenario)
  };
}

function buildPlan(options = {}) {
  const sourceId = options.sourceId;
  const questionCount = Number.isInteger(options.questionCount) ? options.questionCount : 20;
  const selectionMode = options.selectionMode ?? BATCH_A_RESOLVER_SELECTION_MODES.SOURCE_UNIT;
  const basePlan = {
    sourceId,
    questionCount,
    ordering: options.ordering ?? "groupedByPattern",
    includeAnswerKey: options.includeAnswerKey !== false,
    generationSeed: String(options.generationSeed ?? "batch-a-browser"),
    sourceUnit: getBatchASourceUnit(sourceId)
  };
  if (selectionMode === BATCH_A_RESOLVER_SELECTION_MODES.SOURCE_UNIT) return { ...basePlan, worksheetMode: "batchASource", selectionMode, selectedKnowledgePointIds: [], selectedPatternGroupIds: [], patternSpecIds: [], allocation: [], resolverResult: null };
  const resolverResult = resolveVisiblePatternGroupSelection({ ...options, sourceId, selectionMode, questionCount });
  return {
    ...basePlan,
    worksheetMode: resolverResult.worksheetMode ?? "batchAKnowledgePoint",
    selectionMode: resolverResult.selectionMode ?? selectionMode,
    selectedKnowledgePointIds: cloneValue(resolverResult.knowledgePointIds ?? []),
    selectedPatternGroupIds: cloneValue(resolverResult.patternGroupIds ?? []),
    patternSpecIds: cloneValue((resolverResult.patternSpecIds ?? []).filter(isG4AU08Phase2APatternSpecId)),
    allocation: cloneValue((resolverResult.allocation ?? []).filter((entry) => isG4AU08Phase2APatternSpecId(entry.patternSpecId))),
    resolverResult
  };
}

function shuffleQuestions(questions, plan) {
  if (plan.ordering !== "shuffleAcrossPatterns") return questions;
  const shuffled = [...questions];
  let seedValue = hashSeed(`${plan.generationSeed}:g4a-u08-phase2a-shuffle:${plan.questionCount}`);
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    seedValue = mix32(seedValue + index);
    const swapIndex = seedValue % (index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function canGenerateG4AU08ApplicationQuestions(optionsOrPlan = {}) {
  return optionsOrPlan?.sourceId === G4A_U08_SOURCE_ID
    && Array.isArray(optionsOrPlan.patternSpecIds)
    && optionsOrPlan.patternSpecIds.some(isG4AU08Phase2APatternSpecId);
}

export function generateG4AU08ApplicationQuestions(options = {}) {
  const plan = buildPlan(options);
  if (plan.sourceId !== G4A_U08_SOURCE_ID) return { ok: false, plan, questions: [], allocation: [], errors: [issue("g4a_u08_phase2a_source_mismatch", "sourceId", "Phase2A application generator received a non-G4A-U08 sourceId.")], warnings: [] };
  if (plan.resolverResult && !plan.resolverResult.ok) return { ok: false, plan, questions: [], allocation: [], errors: plan.resolverResult.errors ?? [], warnings: plan.resolverResult.warnings ?? [] };
  if (plan.patternSpecIds.length === 0) return { ok: false, plan, questions: [], allocation: [], errors: [issue("g4a_u08_phase2a_no_pattern_selected", "patternSpecIds", "No Phase2A G4A-U08 application PatternSpec is selected.")], warnings: [] };
  const allocation = plan.allocation.length > 0 ? plan.allocation : spreadCounts(plan.patternSpecIds, plan.questionCount);
  const targetConversionCount = Math.round(plan.questionCount * G4A_U08_PHASE2A_CONVERSION_TARGET_RATE);
  let conversionCount = 0;
  const questions = [];
  const errors = [];
  const promptKeys = new Set();
  for (const entry of allocation) {
    const definition = getBatchABrowserPatternDefinition(entry.patternSpecId);
    if (!definition || !isG4AU08Phase2APatternSpecId(entry.patternSpecId)) {
      errors.push(issue("g4a_u08_phase2a_definition_missing", entry.patternSpecId, `Missing Phase2A definition for ${entry.patternSpecId}.`));
      continue;
    }
    let generatedForPattern = 0;
    const maxAttempts = Math.max(entry.questionCount * 8, 120);
    for (let attempt = 1; generatedForPattern < entry.questionCount && attempt <= maxAttempts; attempt += 1) {
      const conversionWanted = conversionCount < targetConversionCount;
      const question = makeApplicationQuestion(definition, attempt, `${plan.generationSeed}:${entry.patternSpecId}:${attempt}`, conversionWanted);
      if (question.conversionRequired) conversionCount += 1;
      const promptKey = `${question.patternSpecId}:${question.blankedDisplayText}`;
      if (promptKeys.has(promptKey)) continue;
      promptKeys.add(promptKey);
      questions.push({ ...question, id: `${entry.patternSpecId}-${questions.length + 1}` });
      generatedForPattern += 1;
    }
    if (generatedForPattern < entry.questionCount) errors.push(issue("g4a_u08_phase2a_unique_pool_exhausted", entry.patternSpecId, `${entry.patternSpecId} requires ${entry.questionCount} questions but generated ${generatedForPattern} unique prompts after ${maxAttempts} attempts.`));
  }
  return { ok: errors.length === 0, plan, questions: shuffleQuestions(questions, plan), allocation, errors, warnings: [] };
}
