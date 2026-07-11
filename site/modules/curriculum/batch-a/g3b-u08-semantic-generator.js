import {
  G3B_U08_SOURCE_ID,
  G3B_U08_SEMANTIC_PATTERN_SPEC_IDS,
  getG3BU08SemanticPatternDefinition,
  listG3BU08SemanticPatternDefinitions
} from "./source-pattern-g3b-u08-semantic-extension.js";
import {
  getG3BU08SemanticContextVariant,
  listG3BU08SemanticContextVariantsForPatternSpec,
  validateG3BU08SemanticContextRegistry
} from "./g3b-u08-semantic-context-registry.js";
import {
  sampleG3BU08RealisticForSpec
} from "./g3b-u08-semantic-realism-policy.js";

const MAX_GENERATION_ATTEMPTS = 64;
const MAX_HIDDEN_BATCH_COUNT = 1000;

function issue(code, path, message) {
  return { code, severity: "error", path, message };
}

function clone(value) {
  if (Array.isArray(value)) return value.map((entry) => clone(entry));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, clone(entry)]));
  }
  return value;
}

function hashSeed(value) {
  let acc = 2166136261;
  for (const char of String(value ?? "s58d")) {
    acc ^= char.charCodeAt(0);
    acc = Math.imul(acc, 16777619);
  }
  return acc >>> 0 || 1;
}

function mix32(value) {
  let mixed = value >>> 0;
  mixed = Math.imul(mixed ^ (mixed >>> 16), 0x7feb352d);
  mixed = Math.imul(mixed ^ (mixed >>> 15), 0x846ca68b);
  return (mixed ^ (mixed >>> 16)) >>> 0;
}

function randomInt(seed, offset, min, max) {
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || max < min) {
    throw new Error(`G3B_U08_GEN_INVALID_RANGE:${min}:${max}`);
  }
  const mixed = mix32(seed + Math.imul(offset + 1, 0x9e3779b1));
  return min + (mixed % (max - min + 1));
}

function pick(seed, offset, values) {
  return values[randomInt(seed, offset, 0, values.length - 1)];
}

function answerUnitForRole(role, scenario) {
  if (/amount|price|budget/.test(role)) return "元";
  if (/score|points/.test(role)) return "分";
  if (/day_count/.test(role)) return "天";
  if (/success_count/.test(role)) return scenario.bindings.eventUnit ?? "次";
  if (/material/.test(role)) return scenario.bindings.materialUnit ?? scenario.answerUnit ?? "個";
  if (/product_count/.test(role)) return scenario.bindings.productUnit ?? scenario.answerUnit ?? "個";
  if (/segment_count/.test(role)) return "段";
  if (/length/.test(role)) return scenario.bindings.lengthUnit ?? scenario.answerUnit ?? "公分";
  if (/package_count/.test(role)) return scenario.bindings.packageUnit ?? scenario.answerUnit ?? "包";
  if (/item_count|items_per_person|base_quantity|comparison_quantity/.test(role)) {
    return scenario.bindings.itemUnit ?? scenario.answerUnit ?? "個";
  }
  if (/recipient_count/.test(role)) return "人";
  if (/capacity/.test(role)) return scenario.bindings.capacityUnit ?? scenario.answerUnit ?? "毫升";
  if (/container_count/.test(role)) return scenario.bindings.containerUnit ?? "個";
  if (/multiple/.test(role)) return "倍";
  if (/packs_option/.test(role)) return scenario.bindings.packageUnit ?? "包";
  if (/bottles_option/.test(role)) return "瓶";
  if (/rolls_option/.test(role)) return "捲";
  if (/weight_per_pack/.test(role)) return "克";
  if (/items_per_pack/.test(role)) return scenario.bindings.itemUnit ?? "個";
  return scenario.answerUnit ?? "個";
}

function sampleMultiply(seed) {
  const b = randomInt(seed, 1, 2, 9);
  const maxA = Math.min(250, Math.floor(999 / b));
  const a = randomInt(seed, 2, 2, maxA);
  const answer = a * b;
  return {
    values: { a, b },
    answer,
    intermediateResults: [answer]
  };
}

function sampleExactDivision(seed) {
  const b = randomInt(seed, 3, 2, 9);
  const minQuotient = Math.max(2, Math.ceil(10 / b));
  const maxQuotient = Math.min(99, Math.floor(999 / b));
  const answer = randomInt(seed, 4, minQuotient, maxQuotient);
  const a = answer * b;
  return {
    values: { a, b },
    answer,
    intermediateResults: [answer]
  };
}

function sampleNearestHundredEstimate(seed) {
  const h = pick(seed, 5, [100, 200, 300]);
  const delta = randomInt(seed, 6, 5, 40);
  const direction = randomInt(seed, 7, 0, 1) === 0 ? -1 : 1;
  const a = h + direction * delta;
  const maxB = Math.max(2, Math.min(9, Math.floor(999 / Math.max(h, a))));
  const b = randomInt(seed, 8, 2, maxB);
  const estimateValue = h * b;
  const exactValue = a * b;
  return {
    values: { a, b, h },
    answer: estimateValue,
    estimateValue,
    exactValue,
    exactDifference: exactValue - estimateValue,
    judgment: "approximately",
    estimateEquationModel: `${h} × ${b} = ${estimateValue}`,
    exactEquationModel: `${a} × ${b} = ${exactValue}`,
    intermediateResults: [h, estimateValue, exactValue]
  };
}

function sampleUpperBudgetEstimate(seed) {
  const h = pick(seed, 9, [100, 200, 300]);
  const d = randomInt(seed, 10, 5, 40);
  const a = h - d;
  const maxB = Math.max(2, Math.min(9, Math.floor(999 / h)));
  const b = randomInt(seed, 11, 2, maxB);
  const c = h * b;
  const exactValue = a * b;
  return {
    values: { a, b, c, h, d },
    answer: c,
    estimateValue: c,
    exactValue,
    exactDifference: c - exactValue,
    judgment: "enough",
    estimateEquationModel: `${h} × ${b} = ${c}`,
    exactEquationModel: `${a} × ${b} = ${exactValue}`,
    intermediateResults: [h, c, exactValue]
  };
}

function sampleBenchmarkDifference(seed, direction) {
  const h = pick(seed, 12, [100, 200, 300]);
  const d = randomInt(seed, 13, 5, 25);
  const unitPrice = direction === "over" ? h + d : h - d;
  const maxB = Math.max(2, Math.min(9, Math.floor(999 / Math.max(h, unitPrice))));
  const b = randomInt(seed, 14, 2, maxB);
  const c = h * b;
  const exactValue = unitPrice * b;
  const exactDifference = d * b;
  return {
    values: { h, d, b, c, unitPrice },
    answer: exactDifference,
    estimateValue: c,
    exactValue,
    exactDifference,
    judgment: direction === "over" ? "more_by" : "less_by",
    estimateEquationModel: `${h} × ${b} = ${c}`,
    exactEquationModel: `${unitPrice} × ${b} = ${exactValue}`,
    intermediateResults: [c, exactValue, exactDifference]
  };
}

function sampleSamePriceComparison(seed) {
  const a = randomInt(seed, 15, 2, 6);
  const c = randomInt(seed, 16, 2, 6);
  const b = randomInt(seed, 17, 12, Math.min(250, Math.floor(999 / a)));
  let d = randomInt(seed, 18, 12, Math.min(250, Math.floor(999 / c)));
  const optionATotal = a * b;
  let optionBTotal = c * d;
  if (optionATotal === optionBTotal) {
    if (d < Math.min(250, Math.floor(999 / c))) d += 1;
    else d -= 1;
    optionBTotal = c * d;
  }
  const winner = optionATotal > optionBTotal ? "option_a" : "option_b";
  return {
    values: { a, b, c, d },
    answer: winner,
    optionATotal,
    optionBTotal,
    winner,
    intermediateResults: [optionATotal, optionBTotal]
  };
}

function sampleForSpec(spec, scenario, seed) {
  return sampleG3BU08RealisticForSpec(spec, scenario, seed);
}

function expressionData(spec, sampled) {
  const values = sampled.values;
  if (spec.equationShape === "a*b") {
    return { text: `${values.a} × ${values.b} = ${sampled.answer}`, tokens: [values.a, "×", values.b, "=", sampled.answer] };
  }
  if (spec.equationShape === "a/b") {
    return { text: `${values.a} ÷ ${values.b} = ${sampled.answer}`, tokens: [values.a, "÷", values.b, "=", sampled.answer] };
  }
  if (["round100(a)*b", "ceil100(a)*b", "(h+d)*b", "(h-d)*b"].includes(spec.equationShape)) {
    return { text: sampled.estimateEquationModel, tokens: sampled.estimateEquationModel.split(" ") };
  }
  if (spec.equationShape === "a*b vs c*d") {
    const optionA = `${values.b} × ${values.a} = ${sampled.optionATotal}`;
    const optionB = `${values.d} × ${values.c} = ${sampled.optionBTotal}`;
    return { text: `${optionA}；${optionB}`, tokens: [values.b, "×", values.a, "=", sampled.optionATotal, "；", values.d, "×", values.c, "=", sampled.optionBTotal], optionA, optionB };
  }
  return null;
}

function renderPrompt(spec, scenario, values) {
  if (spec.templateFamilyId === "tpl_g3b_u08_total_score_per_success") {
    const { person, successAction, successVerb, eventUnit } = scenario.bindings;
    return `每${successAction}可得${values.a}分，${person}${successVerb}了${values.b}${eventUnit}，一共得到多少分？`;
  }
  if (spec.templateFamilyId === "tpl_g3b_u08_group_count_score_events") {
    const { person, successAction, successVerb, eventUnit } = scenario.bindings;
    return `${person}共得到${values.a}分，每${successAction}可得${values.b}分，${person}${successVerb}了幾${eventUnit}？`;
  }
  if (spec.templateFamilyId === "tpl_g3b_u08_same_price_compare_capacity" && scenario.bindings.item) {
    const { item, containerUnit = "瓶", capacityUnit = "毫升" } = scenario.bindings;
    return `兩種${item}組合價格相同。甲有${values.a}${containerUnit}，每${containerUnit}${values.b}${capacityUnit}；乙有${values.c}${containerUnit}，每${containerUnit}${values.d}${capacityUnit}。哪一種總容量較多？`;
  }
  const bindings = { ...scenario.bindings, ...values };
  return spec.promptSkeletonZh.replace(/\{([^}]+)\}/g, (_, key) => {
    const value = bindings[key];
    if (value === undefined || value === null || value === "") {
      throw new Error(`G3B_U08_GEN_PROMPT_PLACEHOLDER_UNRESOLVED:${key}`);
    }
    return String(value);
  });
}

function eventSequence(spec, sampled) {
  const values = sampled.values;
  if (spec.equationShape === "a*b") {
    return [{ step: 1, action: "multiply_equal_groups", inputRoles: ["a", "b"], result: sampled.answer }];
  }
  if (spec.equationShape === "a/b") {
    return [{ step: 1, action: "divide_exactly", inputRoles: ["a", "b"], result: sampled.answer }];
  }
  if (spec.equationShape === "round100(a)*b") {
    return [
      { step: 1, action: "round_to_nearest_hundred", inputRoles: ["a"], result: values.h },
      { step: 2, action: "multiply_estimate", inputRoles: ["h", "b"], result: sampled.estimateValue }
    ];
  }
  if (spec.equationShape === "ceil100(a)*b") {
    return [
      { step: 1, action: "round_up_to_hundred", inputRoles: ["a"], result: values.h },
      { step: 2, action: "multiply_upper_estimate", inputRoles: ["h", "b"], result: sampled.estimateValue },
      { step: 3, action: "judge_budget_sufficiency", inputRoles: ["estimate", "c"], result: sampled.judgment }
    ];
  }
  if (spec.equationShape === "(h+d)*b" || spec.equationShape === "(h-d)*b") {
    return [
      { step: 1, action: "multiply_hundred_benchmark", inputRoles: ["h", "b"], result: sampled.estimateValue },
      { step: 2, action: spec.equationShape === "(h+d)*b" ? "restore_positive_difference" : "restore_negative_difference", inputRoles: ["d", "b"], result: sampled.exactDifference }
    ];
  }
  if (spec.equationShape === "a*b vs c*d") {
    return [
      { step: 1, action: "calculate_option_a_total", inputRoles: ["b", "a"], result: sampled.optionATotal },
      { step: 2, action: "calculate_option_b_total", inputRoles: ["d", "c"], result: sampled.optionBTotal },
      { step: 3, action: "compare_same_dimension_totals", inputRoles: ["option_a_total", "option_b_total"], result: sampled.winner }
    ];
  }
  return [];
}

function quantityRoleBindings(spec, scenario, values) {
  return Object.fromEntries(Object.entries(spec.quantityRoles).map(([symbol, semanticRole]) => [symbol, {
    semanticRole,
    value: values[symbol],
    unitLabel: answerUnitForRole(semanticRole, scenario)
  }]));
}

function buildAnswerDetails(spec, scenario, sampled, expression) {
  if (spec.answerModel.shape === "semantic_single_integer_with_unit") {
    const unit = scenario.answerUnit;
    return {
      answerModelShape: spec.answerModel.shape,
      equationModel: expression.text,
      finalAnswer: sampled.answer,
      finalAnswerUnit: unit,
      finalAnswerWithUnit: `${sampled.answer}${unit}`,
      answerText: `${sampled.answer}${unit}`
    };
  }
  if (spec.answerModel.shape === "semantic_estimation_judgment") {
    let finalAnswerWithUnit;
    if (sampled.judgment === "approximately") finalAnswerWithUnit = `大約${sampled.estimateValue}元`;
    else if (sampled.judgment === "enough") finalAnswerWithUnit = `夠，估計最多需要${sampled.estimateValue}元`;
    else if (sampled.judgment === "more_by") finalAnswerWithUnit = `多${sampled.exactDifference}元`;
    else finalAnswerWithUnit = `少${sampled.exactDifference}元`;
    return {
      answerModelShape: spec.answerModel.shape,
      equationModel: expression.text,
      estimateEquationModel: sampled.estimateEquationModel,
      estimateValue: sampled.estimateValue,
      judgment: sampled.judgment,
      exactEquationModel: sampled.exactEquationModel,
      exactDifference: sampled.exactDifference,
      finalAnswer: sampled.judgment === "approximately" || sampled.judgment === "enough" ? sampled.estimateValue : sampled.exactDifference,
      finalAnswerUnit: "元",
      finalAnswerWithUnit,
      answerText: finalAnswerWithUnit
    };
  }
  const unit = scenario.answerUnit;
  const winnerLabel = sampled.winner === "option_a" ? "甲" : "乙";
  const winningTotal = sampled.winner === "option_a" ? sampled.optionATotal : sampled.optionBTotal;
  const dimensionLabel = scenario.comparisonDimension === "weight" ? "總重量" : scenario.comparisonDimension === "capacity" ? "總容量" : scenario.comparisonDimension === "length" ? "總長度" : "總數量";
  const comparisonAdjective = scenario.comparisonDimension === "length" ? "較長" : "較多";
  const conclusionZh = `${winnerLabel}的${dimensionLabel}${comparisonAdjective}（${winningTotal}${unit}）`;
  return {
    answerModelShape: spec.answerModel.shape,
    equationModel: expression.text,
    optionAEquationModel: expression.optionA,
    optionATotal: sampled.optionATotal,
    optionBEquationModel: expression.optionB,
    optionBTotal: sampled.optionBTotal,
    comparisonDimension: scenario.comparisonDimension,
    winner: sampled.winner,
    conclusionZh,
    finalAnswer: sampled.winner,
    finalAnswerUnit: unit,
    finalAnswerWithUnit: conclusionZh,
    answerText: conclusionZh
  };
}

function structurallyAcceptable(spec, scenario, sampled) {
  if (!sampled || !scenario || spec.representation !== "horizontal_only") return false;
  for (const value of Object.values(sampled.values)) {
    if (!Number.isSafeInteger(value) || value <= 0 || value > 999) return false;
  }
  for (const value of sampled.intermediateResults) {
    if (typeof value === "number" && (!Number.isSafeInteger(value) || value <= 0 || value > 999)) return false;
  }
  if (spec.equationShape === "a*b") {
    return sampled.values.b <= 9 && sampled.values.a * sampled.values.b === sampled.answer;
  }
  if (spec.equationShape === "a/b") {
    return sampled.values.b <= 9 && sampled.values.a % sampled.values.b === 0 && sampled.values.a / sampled.values.b === sampled.answer;
  }
  if (spec.equationShape === "round100(a)*b") {
    return sampled.values.b <= 9 && Math.round(sampled.values.a / 100) * 100 === sampled.values.h && sampled.estimateValue === sampled.values.h * sampled.values.b;
  }
  if (spec.equationShape === "ceil100(a)*b") {
    return sampled.values.a < sampled.values.h && sampled.values.c === sampled.values.h * sampled.values.b && sampled.exactValue <= sampled.values.c;
  }
  if (spec.equationShape === "(h+d)*b") {
    return sampled.values.unitPrice === sampled.values.h + sampled.values.d && sampled.exactDifference === sampled.values.d * sampled.values.b;
  }
  if (spec.equationShape === "(h-d)*b") {
    return sampled.values.unitPrice === sampled.values.h - sampled.values.d && sampled.exactDifference === sampled.values.d * sampled.values.b;
  }
  if (spec.equationShape === "a*b vs c*d") {
    return sampled.values.a <= 9 && sampled.values.c <= 9 && sampled.optionATotal !== sampled.optionBTotal && ["option_a", "option_b"].includes(sampled.winner);
  }
  return false;
}

function buildQuestion(spec, scenario, sampled, options) {
  const expression = expressionData(spec, sampled);
  const promptText = renderPrompt(spec, scenario, sampled.values);
  const answerDetails = buildAnswerDetails(spec, scenario, sampled, expression);
  const roleBindings = quantityRoleBindings(spec, scenario, sampled.values);
  const events = eventSequence(spec, sampled);
  const semanticSnapshot = {
    sourceId: G3B_U08_SOURCE_ID,
    knowledgePointId: spec.knowledgePointId,
    patternGroupId: spec.patternGroupId,
    patternSpecId: spec.patternSpecId,
    templateFamilyId: spec.templateFamilyId,
    semanticSignature: spec.semanticSignature,
    equationShape: spec.equationShape,
    unknownRole: spec.unknownRole,
    quantityRoleBindings: clone(roleBindings),
    eventSequence: clone(events),
    contextVariantId: scenario.contextVariantId,
    contextDomain: scenario.contextDomain,
    sceneLabelZh: scenario.sceneLabelZh,
    answerModelShape: spec.answerModel.shape,
    representation: "horizontal_only",
    validationCodes: []
  };
  return {
    id: options.id ?? `${spec.patternSpecId}-${options.sequenceNumber}`,
    sourceId: G3B_U08_SOURCE_ID,
    unitCode: "3B-U08",
    kind: "g3bU08SemanticApplication",
    phase: "S58D",
    patternSpecId: spec.patternSpecId,
    patternGroupId: spec.patternGroupId,
    knowledgePointId: spec.knowledgePointId,
    templateFamilyId: spec.templateFamilyId,
    semanticSignature: spec.semanticSignature,
    contextVariantId: scenario.contextVariantId,
    contextDomain: scenario.contextDomain,
    sceneLabelZh: scenario.sceneLabelZh,
    promptText,
    blankedDisplayText: promptText,
    displayText: `${promptText} 答案：${answerDetails.answerText}`,
    equationTokens: expression.tokens,
    intermediateResults: [...sampled.intermediateResults],
    quantities: { ...sampled.values },
    quantityRoleBindings: roleBindings,
    eventSequence: events,
    unknownRole: spec.unknownRole,
    representation: "horizontal_only",
    ...answerDetails,
    semanticSnapshot,
    selectorStatus: "hidden",
    generatorRouting: "hidden_only_not_canonical",
    productionUse: "forbidden",
    deterministicReplayKey: `${options.seed ?? "s58d"}:${spec.patternSpecId}:${options.sequenceNumber}:${scenario.contextVariantId}`,
    metadata: {
      patternId: spec.patternSpecId,
      patternGroupId: spec.patternGroupId,
      sourceId: G3B_U08_SOURCE_ID,
      templateFamilyId: spec.templateFamilyId,
      contextVariantId: scenario.contextVariantId,
      patternTags: [...spec.patternTags, "s58d_hidden_generator"],
      skillTags: [...spec.skillTags],
      difficultyTags: [...spec.difficultyTags, "s58d_hidden_deterministic"],
      curriculumNodeIds: [...spec.curriculumNodeIds],
      canonicalSkillIds: [...spec.canonicalSkillIds]
    }
  };
}

function validateArithmetic(question, spec) {
  const v = question.quantities ?? {};
  if (spec.equationShape === "a*b") return question.finalAnswer === v.a * v.b;
  if (spec.equationShape === "a/b") return v.b > 0 && v.a % v.b === 0 && question.finalAnswer === v.a / v.b;
  if (spec.equationShape === "round100(a)*b") return question.estimateValue === v.h * v.b;
  if (spec.equationShape === "ceil100(a)*b") return question.estimateValue === v.c && v.a * v.b <= v.c;
  if (spec.equationShape === "(h+d)*b" || spec.equationShape === "(h-d)*b") return question.exactDifference === v.d * v.b;
  if (spec.equationShape === "a*b vs c*d") {
    const aTotal = v.a * v.b;
    const bTotal = v.c * v.d;
    return question.optionATotal === aTotal && question.optionBTotal === bTotal && aTotal !== bTotal && question.winner === (aTotal > bTotal ? "option_a" : "option_b");
  }
  return false;
}

export function validateG3BU08HiddenGeneratedQuestion(question = {}) {
  const errors = [];
  const spec = getG3BU08SemanticPatternDefinition(question.patternSpecId ?? question.metadata?.patternId);
  if (!spec) {
    errors.push(issue("G3B_U08_GEN_PATTERN_SPEC_UNREGISTERED", "patternSpecId", "Hidden semantic PatternSpec is not registered."));
    return { ok: false, errors, warnings: [] };
  }
  const scenario = getG3BU08SemanticContextVariant(question.contextVariantId);
  if (!scenario || scenario.templateFamilyId !== spec.templateFamilyId) {
    errors.push(issue("G3B_U08_GEN_CONTEXT_VARIANT_MISMATCH", "contextVariantId", "Context variant is not registered for the PatternSpec family."));
  }
  if (question.kind !== "g3bU08SemanticApplication") errors.push(issue("G3B_U08_GEN_KIND_INVALID", "kind", "Question kind is invalid."));
  if (question.sourceId !== G3B_U08_SOURCE_ID) errors.push(issue("G3B_U08_GEN_SOURCE_INVALID", "sourceId", "Source id is invalid."));
  if (question.knowledgePointId !== spec.knowledgePointId) errors.push(issue("G3B_U08_GEN_KP_MISMATCH", "knowledgePointId", "KnowledgePoint does not match PatternSpec."));
  if (question.templateFamilyId !== spec.templateFamilyId) errors.push(issue("G3B_U08_GEN_FAMILY_MISMATCH", "templateFamilyId", "Template family does not match PatternSpec."));
  if (!question.promptText || /\{[^}]+\}/.test(question.promptText)) errors.push(issue("G3B_U08_GEN_PROMPT_PLACEHOLDER_UNRESOLVED", "promptText", "Prompt contains an unresolved placeholder."));
  if (question.representation !== "horizontal_only") errors.push(issue("G3B_U08_GEN_NON_HORIZONTAL_REPRESENTATION", "representation", "S58D only supports horizontal representation."));
  if (question.selectorStatus !== "hidden" || question.productionUse !== "forbidden" || question.generatorRouting !== "hidden_only_not_canonical") {
    errors.push(issue("G3B_U08_GEN_SCOPE_PROMOTION_FORBIDDEN", "productionUse", "S58D output escaped hidden scope."));
  }
  if (question.answerModelShape !== spec.answerModel.shape) errors.push(issue("G3B_U08_GEN_ANSWER_MODEL_MISMATCH", "answerModelShape", "Answer model does not match PatternSpec."));
  if (!question.semanticSnapshot || question.semanticSnapshot.contextVariantId !== question.contextVariantId) {
    errors.push(issue("G3B_U08_GEN_SEMANTIC_SNAPSHOT_INCOMPLETE", "semanticSnapshot", "Semantic snapshot is missing or incomplete."));
  }
  if (!question.quantityRoleBindings || Object.keys(question.quantityRoleBindings).length !== Object.keys(spec.quantityRoles).length) {
    errors.push(issue("G3B_U08_GEN_QUANTITY_ROLE_BINDING_INCOMPLETE", "quantityRoleBindings", "Quantity role bindings are incomplete."));
  }
  if (!Array.isArray(question.eventSequence) || question.eventSequence.length === 0) {
    errors.push(issue("G3B_U08_GEN_EVENT_SEQUENCE_MISSING", "eventSequence", "Event sequence is missing."));
  }
  if (!validateArithmetic(question, spec)) errors.push(issue("G3B_U08_GEN_ARITHMETIC_MISMATCH", "finalAnswer", "Generated arithmetic does not match the PatternSpec."));
  return { ok: errors.length === 0, errors, warnings: [] };
}

function resolveScenario(spec, options, baseSeed) {
  const variants = listG3BU08SemanticContextVariantsForPatternSpec(spec.patternSpecId);
  if (options.contextVariantId) {
    const explicit = getG3BU08SemanticContextVariant(options.contextVariantId);
    return explicit && explicit.templateFamilyId === spec.templateFamilyId ? explicit : null;
  }
  const eligible = options.contextDomain ? variants.filter((variant) => variant.contextDomain === options.contextDomain) : variants;
  if (eligible.length === 0) return null;
  return eligible[baseSeed % eligible.length];
}

export function generateG3BU08HiddenSemanticQuestion(options = {}) {
  const patternSpecId = options.patternSpecId;
  const spec = getG3BU08SemanticPatternDefinition(patternSpecId);
  if (!spec) {
    return {
      ok: false,
      question: null,
      errors: [issue("G3B_U08_GEN_PATTERN_SPEC_UNREGISTERED", "patternSpecId", `PatternSpec '${patternSpecId ?? ""}' is not supported by S58D.`)],
      warnings: []
    };
  }
  const contextRegistry = validateG3BU08SemanticContextRegistry();
  if (!contextRegistry.ok) {
    return {
      ok: false,
      question: null,
      errors: contextRegistry.errors.map((message) => issue("G3B_U08_GEN_CONTEXT_REGISTRY_INVALID", "contextRegistry", message)),
      warnings: []
    };
  }
  const sequenceNumber = Number.isInteger(options.sequenceNumber) && options.sequenceNumber > 0 ? options.sequenceNumber : 1;
  const baseSeed = hashSeed(`${options.seed ?? "s58d"}:${patternSpecId}:${sequenceNumber}`);
  const scenario = resolveScenario(spec, options, baseSeed);
  if (!scenario) {
    return {
      ok: false,
      question: null,
      errors: [issue("G3B_U08_GEN_CONTEXT_VARIANT_UNREGISTERED", "contextVariantId", "No approved context variant matches the request.")],
      warnings: []
    };
  }
  for (let attempt = 1; attempt <= (options.maxAttempts ?? MAX_GENERATION_ATTEMPTS); attempt += 1) {
    const attemptSeed = mix32(baseSeed + attempt * 7919);
    const sampled = sampleForSpec(spec, scenario, attemptSeed);
    if (!structurallyAcceptable(spec, scenario, sampled)) continue;
    try {
      const question = buildQuestion(spec, scenario, sampled, { ...options, sequenceNumber });
      const checked = validateG3BU08HiddenGeneratedQuestion(question);
      if (checked.ok) return { ok: true, question, errors: [], warnings: checked.warnings };
    } catch (error) {
      if (String(error?.message ?? "").startsWith("G3B_U08_GEN_PROMPT_PLACEHOLDER_UNRESOLVED")) {
        return {
          ok: false,
          question: null,
          errors: [issue("G3B_U08_GEN_PROMPT_PLACEHOLDER_UNRESOLVED", "promptText", error.message)],
          warnings: []
        };
      }
      throw error;
    }
  }
  return {
    ok: false,
    question: null,
    errors: [issue("G3B_U08_GEN_GENERATION_EXHAUSTED", "generation", `Unable to generate a valid hidden semantic question for '${patternSpecId}'.`)],
    warnings: []
  };
}

function deterministicShuffle(items, seedValue) {
  const output = [...items];
  const seed = hashSeed(seedValue);
  for (let index = output.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(seed, output.length - index, 0, index);
    [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
  }
  return output;
}

export function generateG3BU08HiddenSemanticBatch(options = {}) {
  const patternSpecIds = options.patternSpecIds?.length ? [...options.patternSpecIds] : [...G3B_U08_SEMANTIC_PATTERN_SPEC_IDS];
  const questionCount = options.questionCount ?? patternSpecIds.length;
  if (!Number.isInteger(questionCount) || questionCount < 1 || questionCount > MAX_HIDDEN_BATCH_COUNT) {
    return { ok: false, questions: [], errors: [issue("G3B_U08_GEN_BATCH_COUNT_INVALID", "questionCount", `questionCount must be an integer from 1 to ${MAX_HIDDEN_BATCH_COUNT}.`)], warnings: [] };
  }
  if (patternSpecIds.length === 0 || patternSpecIds.some((patternSpecId) => !getG3BU08SemanticPatternDefinition(patternSpecId))) {
    return { ok: false, questions: [], errors: [issue("G3B_U08_GEN_BATCH_PATTERN_SPEC_INVALID", "patternSpecIds", "Every requested PatternSpec must be registered for S58D.")], warnings: [] };
  }
  if (new Set(patternSpecIds).size !== patternSpecIds.length) {
    return { ok: false, questions: [], errors: [issue("G3B_U08_GEN_BATCH_PATTERN_SPEC_DUPLICATE", "patternSpecIds", "Duplicate PatternSpec ids are not allowed.")], warnings: [] };
  }
  const occurrenceByPattern = new Map();
  const generated = [];
  for (let index = 0; index < questionCount; index += 1) {
    const patternSpecId = patternSpecIds[index % patternSpecIds.length];
    const sequenceNumber = (occurrenceByPattern.get(patternSpecId) ?? 0) + 1;
    occurrenceByPattern.set(patternSpecId, sequenceNumber);
    const result = generateG3BU08HiddenSemanticQuestion({
      patternSpecId,
      sequenceNumber,
      seed: `${options.seed ?? "s58d-batch"}:${index + 1}`
    });
    if (!result.ok) return { ok: false, questions: [], errors: result.errors, warnings: result.warnings };
    generated.push(result.question);
  }
  const ordering = options.ordering ?? "stable";
  if (!["stable", "shuffledAcrossPatterns"].includes(ordering)) {
    return { ok: false, questions: [], errors: [issue("G3B_U08_GEN_BATCH_ORDERING_INVALID", "ordering", "ordering must be stable or shuffledAcrossPatterns.")], warnings: [] };
  }
  const ordered = ordering === "shuffledAcrossPatterns"
    ? deterministicShuffle(generated, `${options.orderingSeed ?? options.seed ?? "s58d-order"}:ordering`)
    : generated;
  const questions = ordered.map((question, index) => ({ ...question, questionNumber: index + 1 }));
  return {
    ok: true,
    questions,
    errors: [],
    warnings: [],
    allocation: Object.fromEntries(patternSpecIds.map((patternSpecId) => [patternSpecId, questions.filter((question) => question.patternSpecId === patternSpecId).length])),
    ordering
  };
}

export const G3B_U08_HIDDEN_SEMANTIC_PATTERN_SPEC_IDS = Object.freeze(
  listG3BU08SemanticPatternDefinitions().map((spec) => spec.patternSpecId)
);
