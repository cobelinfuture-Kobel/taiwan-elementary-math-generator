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

function appMetadata(definition) {
  return {
    patternId: definition.patternSpecId,
    sourceId: definition.sourceId,
    patternTags: ["batch_a", "browser_bridge", definition.sourceId, definition.patternSpecId, "phase2a_application"],
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

function defaultUnitLabel(unitDomain, sequenceNumber) {
  const labels = {
    money: ["元"],
    count_items: ["個", "盒", "包", "張", "支"],
    capacity: ["mL", "L"],
    weight: ["g", "kg"],
    length: ["cm", "m", "mm"],
    time: ["分", "秒", "時"]
  }[unitDomain] ?? ["個"];
  return labels[(sequenceNumber - 1) % labels.length];
}

function contextNoun(unitDomain, sequenceNumber) {
  const nouns = {
    money: ["門票", "寄物櫃", "明信片"],
    count_items: ["貼紙", "粉筆", "晶片", "毛巾"],
    capacity: ["飲料", "藥水", "水箱水", "果汁"],
    weight: ["麵粉", "藥粉", "包裹", "食材"],
    length: ["電線", "緞帶", "道路", "布料"],
    time: ["練習時間", "機器運轉時間", "充電時間", "課程時間"]
  }[unitDomain] ?? ["物品"];
  return nouns[(sequenceNumber - 1) % nouns.length];
}

function measuredValue(unitDomain, sequenceNumber, fallback) {
  if (unitDomain === "time") return [10, 15, 20, 30, 40, 45, 60][sequenceNumber % 7];
  if (unitDomain === "money") return [12, 15, 18, 20, 25][sequenceNumber % 5];
  return fallback;
}

function makeMeasurement({ unitDomain, sequenceNumber, baseValue, conversionRequired }) {
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
  const unitLabel = defaultUnitLabel(unitDomain, sequenceNumber);
  return { displayValue: baseValue, displayUnitLabel: unitLabel, equationValue: baseValue, finalUnitLabel: unitLabel, conversion: null };
}

function buildTemplateData(definition, sequenceNumber, seed, conversionRequired) {
  const seedValue = mix32(hashSeed(`${seed}:${definition.patternSpecId}:${sequenceNumber}`));
  const n = (offset, min, max) => randomInt(mix32(seedValue + offset + sequenceNumber * 37), min, max);
  const unitDomain = selectUnitDomain(definition, sequenceNumber, conversionRequired);
  const noun = contextNoun(unitDomain, sequenceNumber);
  const first = (baseValue) => makeMeasurement({ unitDomain, sequenceNumber, baseValue, conversionRequired });
  let tokens;
  let prompt;
  let quantities = {};
  let convertedQuantities = null;
  let finalUnitLabel;
  let conversion = null;

  switch (definition.storyTemplateId) {
    case "tpl_app_add_three_quantities": {
      const aM = first(n(1, 2, 5) * 100);
      const b = measuredValue(unitDomain, sequenceNumber + 1, n(2, 40, 180));
      const c = measuredValue(unitDomain, sequenceNumber + 2, n(3, 30, 160));
      tokens = [aM.equationValue, "+", b, "+", c];
      finalUnitLabel = aM.finalUnitLabel;
      conversion = aM.conversion;
      quantities = { a: aM.displayValue, b, c };
      prompt = `${conversion ? `${conversion.lineText}。` : ""}${noun}分成三批，分別是 ${aM.displayValue} ${aM.displayUnitLabel}、${b} ${finalUnitLabel} 和 ${c} ${finalUnitLabel}。總共是多少 ${finalUnitLabel}？`;
      break;
    }
    case "tpl_app_add_then_subtract_state_change": {
      const aM = first(n(4, 2, 5) * 100);
      const b = measuredValue(unitDomain, sequenceNumber + 3, n(5, 40, 160));
      const c = Math.min(aM.equationValue + b, measuredValue(unitDomain, sequenceNumber + 4, n(6, 20, 120)));
      tokens = [aM.equationValue, "+", b, "-", c];
      finalUnitLabel = aM.finalUnitLabel;
      conversion = aM.conversion;
      quantities = { start: aM.displayValue, increase: b, decrease: c };
      prompt = `${conversion ? `${conversion.lineText}。` : ""}${noun}原本有 ${aM.displayValue} ${aM.displayUnitLabel}，又增加 ${b} ${finalUnitLabel}，後來用掉 ${c} ${finalUnitLabel}，還剩多少 ${finalUnitLabel}？`;
      break;
    }
    case "tpl_app_subtract_then_add_state_change": {
      const aM = first(n(7, 2, 5) * 100);
      const b = measuredValue(unitDomain, sequenceNumber + 5, n(8, 30, 140));
      const c = measuredValue(unitDomain, sequenceNumber + 6, n(9, 20, 150));
      tokens = [aM.equationValue, "-", Math.min(b, aM.equationValue), "+", c];
      finalUnitLabel = aM.finalUnitLabel;
      conversion = aM.conversion;
      quantities = { start: aM.displayValue, decrease: Math.min(b, aM.equationValue), increase: c };
      prompt = `${conversion ? `${conversion.lineText}。` : ""}${noun}原本有 ${aM.displayValue} ${aM.displayUnitLabel}，先用掉 ${quantities.decrease} ${finalUnitLabel}，後來補進 ${c} ${finalUnitLabel}，現在有多少 ${finalUnitLabel}？`;
      break;
    }
    case "tpl_app_subtract_twice_state_change": {
      const aM = first(n(10, 2, 5) * 100);
      const b = measuredValue(unitDomain, sequenceNumber + 7, n(11, 20, 120));
      const c = measuredValue(unitDomain, sequenceNumber + 8, n(12, 20, 120));
      const safeB = Math.min(b, Math.floor(aM.equationValue / 2));
      const safeC = Math.min(c, aM.equationValue - safeB);
      tokens = [aM.equationValue, "-", safeB, "-", safeC];
      finalUnitLabel = aM.finalUnitLabel;
      conversion = aM.conversion;
      quantities = { start: aM.displayValue, firstUse: safeB, secondUse: safeC };
      prompt = `${conversion ? `${conversion.lineText}。` : ""}${noun}原本有 ${aM.displayValue} ${aM.displayUnitLabel}，上午用掉 ${safeB} ${finalUnitLabel}，下午又用掉 ${safeC} ${finalUnitLabel}，還剩多少 ${finalUnitLabel}？`;
      break;
    }
    case "tpl_app_adjusted_amount_then_subtract": {
      const outerM = first(n(13, 2, 5) * 100);
      const base = measuredValue(unitDomain, sequenceNumber + 9, n(14, 80, 180));
      const decrease = Math.min(base - 1, measuredValue(unitDomain, sequenceNumber + 10, n(15, 10, 60)));
      tokens = [outerM.equationValue, "-", "(", base, "-", decrease, ")"];
      finalUnitLabel = outerM.finalUnitLabel;
      conversion = outerM.conversion;
      quantities = { outer: outerM.displayValue, base, decrease };
      prompt = `${conversion ? `${conversion.lineText}。` : ""}標準${noun}是 ${base} ${finalUnitLabel}，調整後少 ${decrease} ${finalUnitLabel}。用 ${outerM.displayValue} ${outerM.displayUnitLabel} 扣除調整後的量，還剩多少 ${finalUnitLabel}？`;
      break;
    }
    case "tpl_app_divide_by_group_product": {
      const totalM = first(n(16, 2, 5) * 1000);
      const groups = [2, 4, 5][sequenceNumber % 3];
      const perGroup = 5;
      tokens = [totalM.equationValue, "÷", "(", groups, "×", perGroup, ")"];
      finalUnitLabel = totalM.finalUnitLabel;
      conversion = totalM.conversion;
      quantities = { total: totalM.displayValue, groups, perGroup };
      prompt = `${conversion ? `${conversion.lineText}。` : ""}每份${noun}需要 ${groups} 組，每組 ${perGroup} ${finalUnitLabel}。共有 ${totalM.displayValue} ${totalM.displayUnitLabel}，可以分成幾份？`;
      finalUnitLabel = "份";
      break;
    }
    case "tpl_app_multiply_after_difference_then_add_sub": {
      const unitM = first(n(17, 1, 4) * 50);
      const planned = n(18, 6, 12);
      const cancelled = n(19, 1, Math.min(4, planned - 1));
      const extra = measuredValue(unitDomain, sequenceNumber + 11, n(20, 20, 80));
      tokens = [unitM.equationValue, "×", "(", planned, "-", cancelled, ")", "+", extra];
      finalUnitLabel = unitM.finalUnitLabel;
      conversion = unitM.conversion;
      quantities = { unit: unitM.displayValue, planned, cancelled, extra };
      prompt = `${conversion ? `${conversion.lineText}。` : ""}每份${noun}需要 ${unitM.displayValue} ${unitM.displayUnitLabel}，原本要做 ${planned} 份，後來取消 ${cancelled} 份，又多準備 ${extra} ${finalUnitLabel}，共需要多少 ${finalUnitLabel}？`;
      break;
    }
    case "tpl_app_multiply_then_share": {
      const boxes = DIVISION_GROUPS[sequenceNumber % DIVISION_GROUPS.length];
      const perBoxM = first(n(22, 1, 4) * 100);
      const groups = DIVISION_GROUPS[(sequenceNumber + 1) % DIVISION_GROUPS.length];
      tokens = [boxes, "×", perBoxM.equationValue, "÷", groups];
      finalUnitLabel = perBoxM.finalUnitLabel;
      conversion = perBoxM.conversion;
      quantities = { boxes, perBox: perBoxM.displayValue, groups };
      prompt = `${conversion ? `${conversion.lineText}。` : ""}有 ${boxes} 盒${noun}，每盒有 ${perBoxM.displayValue} ${perBoxM.displayUnitLabel}，平均分給 ${groups} 組，每組分到多少 ${finalUnitLabel}？`;
      break;
    }
    case "tpl_app_unit_rate_then_scale": {
      const knownUnits = [2, 3, 4, 5][sequenceNumber % 4];
      const targetUnits = knownUnits * 2;
      const perUnitM = first(n(23, 1, 4) * 60);
      const total = perUnitM.equationValue * knownUnits;
      tokens = [total, "÷", knownUnits, "×", targetUnits];
      finalUnitLabel = perUnitM.finalUnitLabel;
      conversion = perUnitM.conversion;
      quantities = { total: conversion ? total / (conversion.convertedValue / perUnitM.displayValue) : total, knownUnits, targetUnits };
      prompt = `${conversion ? `${conversion.lineText}。` : ""}${knownUnits} 份${noun}共有 ${quantities.total} ${perUnitM.displayUnitLabel}，照這樣計算，${targetUnits} 份有多少 ${finalUnitLabel}？`;
      break;
    }
    case "tpl_app_divide_then_divide": {
      const groups = [2, 4, 5][sequenceNumber % 3];
      const peoplePerGroup = [2, 4, 5][(sequenceNumber + 1) % 3];
      const perPersonM = first(n(24, 1, 4) * 40);
      const total = perPersonM.equationValue * groups * peoplePerGroup;
      tokens = [total, "÷", groups, "÷", peoplePerGroup];
      finalUnitLabel = perPersonM.finalUnitLabel;
      conversion = perPersonM.conversion;
      quantities = { total: conversion ? total / (conversion.convertedValue / perPersonM.displayValue) : total, groups, peoplePerGroup };
      prompt = `${conversion ? `${conversion.lineText}。` : ""}${noun}共有 ${quantities.total} ${perPersonM.displayUnitLabel}，先平均分成 ${groups} 份，每份再平均分給 ${peoplePerGroup} 人，每人得到多少 ${finalUnitLabel}？`;
      break;
    }
    case "tpl_app_payment_minus_unit_cost_times_quantity": {
      const unitPrice = n(25, 10, 25);
      const quantity = n(26, 2, 6);
      const payment = [200, 500, 1000][sequenceNumber % 3];
      tokens = [payment, "-", unitPrice, "×", quantity];
      finalUnitLabel = "元";
      quantities = { payment, unitPrice, quantity };
      prompt = `每次使用${noun}要 ${unitPrice} 元，使用 ${quantity} 次，付 ${payment} 元，可以找回幾元？`;
      break;
    }
    case "tpl_app_subtract_divided_amount_or_add_divided_amount":
    default: {
      const totalM = first(n(27, 2, 5) * 100);
      const groups = DIVISION_GROUPS[sequenceNumber % DIVISION_GROUPS.length];
      const used = measuredValue(unitDomain, sequenceNumber + 12, n(28, 10, 60));
      tokens = [totalM.equationValue, "÷", groups, "+", used];
      finalUnitLabel = totalM.finalUnitLabel;
      conversion = totalM.conversion;
      quantities = { total: totalM.displayValue, groups, used };
      prompt = `${conversion ? `${conversion.lineText}。` : ""}${noun}共有 ${totalM.displayValue} ${totalM.displayUnitLabel}，平均分成 ${groups} 份後，又多準備 ${used} ${finalUnitLabel}，合起來是多少 ${finalUnitLabel}？`;
      break;
    }
  }

  const evaluated = evaluateG4AU08ApplicationEquationTokens(tokens);
  if (conversion) convertedQuantities = { first: conversion };
  return { tokens, prompt, quantities, convertedQuantities, conversion, finalUnitLabel, finalAnswer: evaluated.finalAnswer };
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
    unitDomain: data.conversion?.unitDomain ?? selectUnitDomain(definition, sequenceNumber, conversionRequired),
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
    metadata: appMetadata(definition)
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
    const maxAttempts = Math.max(entry.questionCount * 6, 60);
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
    if (generatedForPattern < entry.questionCount) errors.push(issue("g4a_u08_phase2a_unique_pool_exhausted", entry.patternSpecId, `${entry.patternSpecId} requires ${entry.questionCount} questions but generated ${generatedForPattern} unique prompts.`));
  }
  return { ok: errors.length === 0, plan, questions: shuffleQuestions(questions, plan), allocation, errors, warnings: [] };
}
