import {
  G3B_U04_SOURCE_ID,
  getG3BU04SemanticPatternDefinition,
  listG3BU04SemanticPatternDefinitions
} from "./source-pattern-g3b-u04-semantic-extension.js";
import { resolveG3BU04SemanticScenarioProfile } from "./g3b-u04-semantic-scenarios.js";

const MULTIPLICATIVE_KNOWLEDGE_POINT_IDS = Object.freeze([
  "kp_g3b_u04_composite_multiplicative_ratio",
  "kp_g3b_u04_multiplicative_quantity_chain"
]);
const MULTIPLICATIVE_KP_SET = new Set(MULTIPLICATIVE_KNOWLEDGE_POINT_IDS);
const AGE_COMBINATIONS = Object.freeze([
  Object.freeze({ a: 6, m: 2, n: 3 }),
  Object.freeze({ a: 6, m: 2, n: 4 }),
  Object.freeze({ a: 6, m: 2, n: 5 }),
  Object.freeze({ a: 6, m: 3, n: 2 }),
  Object.freeze({ a: 6, m: 3, n: 3 }),
  Object.freeze({ a: 7, m: 2, n: 2 }),
  Object.freeze({ a: 7, m: 2, n: 3 }),
  Object.freeze({ a: 7, m: 2, n: 4 }),
  Object.freeze({ a: 7, m: 3, n: 2 }),
  Object.freeze({ a: 8, m: 2, n: 2 }),
  Object.freeze({ a: 8, m: 2, n: 3 }),
  Object.freeze({ a: 8, m: 3, n: 2 }),
  Object.freeze({ a: 9, m: 2, n: 2 }),
  Object.freeze({ a: 9, m: 2, n: 3 }),
  Object.freeze({ a: 10, m: 2, n: 2 }),
  Object.freeze({ a: 10, m: 2, n: 3 }),
  Object.freeze({ a: 11, m: 2, n: 2 }),
  Object.freeze({ a: 12, m: 2, n: 2 })
]);

function issue(code, path, message) {
  return { code, severity: "error", path, message };
}

function hashSeed(value) {
  let acc = 2166136261;
  for (const char of String(value ?? "default")) {
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
  return min + (mix32(seed + Math.imul(offset + 1, 0x9e3779b1)) % (max - min + 1));
}

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  }
  return value;
}

function sampleRatio(seed) {
  const m = randomInt(seed, 1, 2, 6);
  const n = randomInt(seed, 2, 2, 6);
  return {
    values: { m, n },
    intermediateResults: [m, m * n],
    answer: m * n
  };
}

function samplePersonalQuantity(seed) {
  const a = randomInt(seed, 3, 2, 20);
  const m = randomInt(seed, 4, 2, 5);
  const n = randomInt(seed, 5, 2, 5);
  const middle = a * m;
  return { values: { a, m, n }, intermediateResults: [middle, middle * n], answer: middle * n };
}

function samplePriceEquivalence(seed) {
  const a = randomInt(seed, 6, 2, 15) * 5;
  const m = randomInt(seed, 7, 2, 4);
  const n = randomInt(seed, 8, 2, 4);
  const middle = a * m;
  return { values: { a, m, n }, intermediateResults: [middle, middle * n], answer: middle * n };
}

function sampleProduction(seed) {
  const a = randomInt(seed, 9, 2, 25);
  const m = randomInt(seed, 10, 2, 5);
  const n = randomInt(seed, 11, 2, 5);
  const middle = a * m;
  return { values: { a, m, n }, intermediateResults: [middle, middle * n], answer: middle * n };
}

function sampleAge(seed) {
  const selected = AGE_COMBINATIONS[seed % AGE_COMBINATIONS.length];
  const middle = selected.a * selected.m;
  const answer = middle * selected.n;
  return {
    values: { ...selected },
    intermediateResults: [middle, answer],
    answer,
    ageModel: {
      childAge: selected.a,
      siblingAge: middle,
      parentAge: answer,
      ordering: "child<sibling<parent"
    }
  };
}

function sampleForSpec(spec, seed) {
  if (spec.knowledgePointId === "kp_g3b_u04_composite_multiplicative_ratio") return sampleRatio(seed);
  if (spec.templateFamilyId === "tpl_g3b_u04_quantity_chain_personal_quantity_ratio_chain") return samplePersonalQuantity(seed);
  if (spec.templateFamilyId === "tpl_g3b_u04_quantity_chain_price_equivalence_chain") return samplePriceEquivalence(seed);
  if (spec.templateFamilyId === "tpl_g3b_u04_quantity_chain_production_capacity_chain") return sampleProduction(seed);
  if (spec.templateFamilyId === "tpl_g3b_u04_quantity_chain_age_ratio_chain") return sampleAge(seed);
  return null;
}

function renderPrompt(spec, scenario, values) {
  const bindings = { ...scenario.placeholderBindings, ...values };
  return spec.promptSkeletonZh.replace(/\{([^}]+)\}/g, (_, key) => {
    const value = bindings[key];
    if (value === undefined || value === null || value === "") {
      throw new Error(`G3B_U04_SEM_PROMPT_PLACEHOLDER_UNRESOLVED:${key}`);
    }
    return String(value);
  });
}

function answerUnitFor(spec, scenario) {
  if (spec.knowledgePointId === "kp_g3b_u04_composite_multiplicative_ratio") return "倍";
  if (spec.templateFamilyId === "tpl_g3b_u04_quantity_chain_price_equivalence_chain") return "元";
  if (spec.templateFamilyId === "tpl_g3b_u04_quantity_chain_age_ratio_chain") return "歲";
  return scenario.itemUnit ?? "個";
}

function roleUnitLabel(role, scenario, answerUnit) {
  if (role.unitDimension === "currency") return "元";
  if (role.unitDimension === "points") return "點";
  if (role.unitDimension === "dimensionless_times") return "倍";
  if (role.unitDimension === "age_years") return "歲";
  if (role.unitDimension === "capacity") return scenario.capacityUnit ?? "毫升";
  if (role.unitDimension === "count_per_period") return scenario.itemUnit ?? "個";
  return scenario.itemUnit ?? answerUnit;
}

function bindQuantities(spec, scenario, values, answerUnit) {
  return Object.fromEntries(Object.entries(spec.quantityRoles).map(([symbol, semanticRole]) => {
    const role = scenario.quantityBounds[symbol];
    if (!role) throw new Error(`G3B_U04_SEM_QUANTITY_ROLE_MISSING:${symbol}`);
    return [symbol, {
      semanticRole,
      value: values[symbol],
      unitDimension: role.unitDimension,
      unitLabel: roleUnitLabel(role, scenario, answerUnit)
    }];
  }));
}

function relationshipDimension(spec) {
  if (spec.templateFamilyId.includes("ratio_length")) return "length";
  if (spec.templateFamilyId.includes("ratio_capacity")) return "capacity";
  if (spec.templateFamilyId.includes("ratio_weight")) return "weight";
  return null;
}

function eventSequence(spec, sampled) {
  const values = sampled.values;
  if (spec.knowledgePointId === "kp_g3b_u04_composite_multiplicative_ratio") {
    return [
      { step: 1, action: "bind_middle_to_base_multiplier", inputRoles: ["m"], result: values.m },
      { step: 2, action: "bind_final_to_middle_multiplier", inputRoles: ["n"], result: values.n },
      { step: 3, action: "compose_multipliers", inputRoles: ["m", "n"], result: sampled.answer }
    ];
  }
  return [
    { step: 1, action: "scale_base_to_middle", inputRoles: ["a", "m"], result: sampled.intermediateResults[0] },
    { step: 2, action: "scale_middle_to_final", inputRoles: ["middle_quantity", "n"], result: sampled.answer }
  ];
}

function buildQuestion(spec, scenario, sampled, options) {
  const answerUnit = answerUnitFor(spec, scenario);
  const promptText = renderPrompt(spec, scenario, sampled.values);
  const answerText = `${sampled.answer}${answerUnit}`;
  const quantityRoleBindings = bindQuantities(spec, scenario, sampled.values, answerUnit);
  const events = eventSequence(spec, sampled);
  const equationModel = spec.equationShape === "m*n"
    ? `${sampled.values.m} × ${sampled.values.n}`
    : `${sampled.values.a} × ${sampled.values.m} × ${sampled.values.n}`;
  const equationTokens = spec.equationShape === "m*n"
    ? [sampled.values.m, "×", sampled.values.n]
    : [sampled.values.a, "×", sampled.values.m, "×", sampled.values.n];
  const measureDimension = relationshipDimension(spec);
  const timePeriodModel = spec.templateFamilyId === "tpl_g3b_u04_quantity_chain_production_capacity_chain"
    ? { basePeriod: "same_period", middlePeriod: "same_period", finalPeriod: "same_period", label: "每段時間" }
    : null;
  const ageModel = sampled.ageModel ?? null;
  const safeguards = {
    relationshipDirection: "base_to_middle_then_middle_to_final",
    measureDimension,
    timePeriodModel,
    ageModel
  };
  const semanticSnapshot = {
    sourceId: G3B_U04_SOURCE_ID,
    knowledgePointId: spec.knowledgePointId,
    templateFamilyId: spec.templateFamilyId,
    semanticSignature: spec.semanticSignature,
    equationShape: spec.equationShape,
    quantityRoleBindings: cloneValue(quantityRoleBindings),
    eventSequence: cloneValue(events),
    unknownRole: spec.unknownRole,
    answerUnit,
    contextDomain: scenario.contextDomain,
    realismProfile: cloneValue(scenario.realismProfile),
    safeguards: cloneValue(safeguards),
    validationCodes: []
  };
  return {
    id: options.id ?? `${spec.patternSpecId}-${options.sequenceNumber}`,
    sourceId: G3B_U04_SOURCE_ID,
    kind: "g3bU04SemanticWordProblem",
    phase: "S57E4",
    patternSpecId: spec.patternSpecId,
    patternGroupId: spec.patternGroupId,
    knowledgePointId: spec.knowledgePointId,
    templateFamilyId: spec.templateFamilyId,
    semanticSignature: spec.semanticSignature,
    promptText,
    blankedDisplayText: promptText,
    displayText: `${promptText} 答案：${answerText}`,
    equationModel,
    equationTokens,
    intermediateResults: [...sampled.intermediateResults],
    finalAnswer: sampled.answer,
    finalAnswerWithUnit: answerText,
    answerUnit,
    answerText,
    quantities: { ...sampled.values },
    quantityRoleBindings,
    eventSequence: events,
    unknownRole: spec.unknownRole,
    contextDomain: scenario.contextDomain,
    scenarioId: scenario.scenarioId,
    ownershipModel: scenario.ownershipModel,
    realismProfile: cloneValue(scenario.realismProfile),
    relationshipDirection: safeguards.relationshipDirection,
    measureDimension,
    timePeriodModel,
    ageModel,
    semanticSnapshot,
    selectorStatus: "hidden",
    generatorRouting: "not_implemented_in_s57e4",
    productionUse: "forbidden",
    metadata: {
      patternId: spec.patternSpecId,
      patternGroupId: spec.patternGroupId,
      sourceId: G3B_U04_SOURCE_ID,
      templateFamilyId: spec.templateFamilyId,
      patternTags: [...spec.patternTags, "s57e4_multiplicative_generator"],
      skillTags: [...spec.skillTags],
      difficultyTags: [...spec.difficultyTags, "s57e4_multiplicative_hidden"],
      curriculumNodeIds: [...spec.curriculumNodeIds],
      canonicalSkillIds: [...spec.canonicalSkillIds]
    }
  };
}

function samplingPasses(spec, scenario, sampled) {
  if (!sampled || !Number.isSafeInteger(sampled.answer) || sampled.answer <= 0 || sampled.answer > 10000) return false;
  if (Object.values(sampled.values).some((value) => !Number.isSafeInteger(value) || value <= 0 || value > 10000)) return false;
  if (sampled.intermediateResults.some((value) => !Number.isSafeInteger(value) || value <= 0 || value > 10000)) return false;
  for (const [symbol, role] of Object.entries(scenario.quantityBounds)) {
    const value = sampled.values[symbol];
    if (!Number.isSafeInteger(value) || value < role.min || value > role.max) return false;
  }
  if (spec.equationShape === "m*n") {
    if (sampled.values.m < 2 || sampled.values.m > 9 || sampled.values.n < 2 || sampled.values.n > 9) return false;
  }
  if (spec.templateFamilyId === "tpl_g3b_u04_quantity_chain_age_ratio_chain") {
    const age = sampled.ageModel;
    if (!age) return false;
    if (age.childAge < 6 || age.childAge > 12) return false;
    if (age.siblingAge < 10 || age.siblingAge > 24) return false;
    if (age.parentAge < 25 || age.parentAge > 60) return false;
    if (!(age.childAge < age.siblingAge && age.siblingAge < age.parentAge)) return false;
  }
  return true;
}

export const G3B_U04_MULTIPLICATIVE_SEMANTIC_KNOWLEDGE_POINT_IDS = MULTIPLICATIVE_KNOWLEDGE_POINT_IDS;
export const G3B_U04_MULTIPLICATIVE_SEMANTIC_PATTERN_SPEC_IDS = Object.freeze(
  listG3BU04SemanticPatternDefinitions()
    .filter((spec) => MULTIPLICATIVE_KP_SET.has(spec.knowledgePointId))
    .map((spec) => spec.patternSpecId)
);

export function isG3BU04MultiplicativeSemanticPatternSpecId(patternSpecId) {
  const spec = getG3BU04SemanticPatternDefinition(patternSpecId);
  return Boolean(spec && MULTIPLICATIVE_KP_SET.has(spec.knowledgePointId));
}

export function validateG3BU04MultiplicativeGeneratedQuestion(question = {}) {
  const errors = [];
  const spec = getG3BU04SemanticPatternDefinition(question.patternSpecId ?? question.metadata?.patternId);
  if (!spec || !MULTIPLICATIVE_KP_SET.has(spec.knowledgePointId)) {
    errors.push(issue("G3B_U04_SEM_PATTERN_SPEC_UNREGISTERED", "patternSpecId", "Multiplicative semantic PatternSpec is not registered for S57E4."));
    return { ok: false, errors, warnings: [] };
  }
  if (question.kind !== "g3bU04SemanticWordProblem") errors.push(issue("G3B_U04_SEM_KIND_INVALID", "kind", "Question kind is invalid."));
  if (!question.promptText || /\{[^}]+\}/.test(question.promptText)) errors.push(issue("G3B_U04_SEM_PROMPT_PLACEHOLDER_UNRESOLVED", "promptText", "Prompt contains an unresolved placeholder."));
  const q = question.quantities ?? {};
  const expected = spec.equationShape === "m*n" ? q.m * q.n : q.a * q.m * q.n;
  if (!Number.isSafeInteger(expected) || expected !== question.finalAnswer) errors.push(issue("G3B_U04_SEM_ANSWER_RECONSTRUCTION_FAILED", "finalAnswer", "Multiplicative answer reconstruction failed."));
  if (q.m < 2 || q.m > 9 || q.n < 2 || q.n > 9) errors.push(issue("G3B_U04_SEM_MULTIPLIER_RANGE_INVALID", "quantities", "Multiplier is outside 2 to 9."));
  if (question.relationshipDirection !== "base_to_middle_then_middle_to_final") errors.push(issue("G3B_U04_SEM_COMPARISON_DIRECTION_MISMATCH", "relationshipDirection", "Relationship direction is invalid."));
  if (spec.knowledgePointId === "kp_g3b_u04_composite_multiplicative_ratio") {
    if (question.answerUnit !== "倍") errors.push(issue("G3B_U04_SEM_ANSWER_UNIT_MISMATCH", "answerUnit", "Composite ratio answer unit must be 倍."));
    if (!["length", "capacity", "weight"].includes(question.measureDimension)) errors.push(issue("G3B_U04_SEM_UNIT_FLOW_MISMATCH", "measureDimension", "Ratio measure dimension is missing."));
  }
  if (spec.templateFamilyId === "tpl_g3b_u04_quantity_chain_age_ratio_chain") {
    const age = question.ageModel;
    if (!age || age.childAge < 6 || age.childAge > 12 || age.siblingAge < 10 || age.siblingAge > 24 || age.parentAge < 25 || age.parentAge > 60 || !(age.childAge < age.siblingAge && age.siblingAge < age.parentAge)) {
      errors.push(issue("G3B_U04_SEM_AGE_IMPLAUSIBLE", "ageModel", "Age chain is outside approved plausibility bounds."));
    }
  }
  if (spec.templateFamilyId === "tpl_g3b_u04_quantity_chain_production_capacity_chain") {
    const periods = question.timePeriodModel;
    if (!periods || periods.basePeriod !== "same_period" || periods.middlePeriod !== "same_period" || periods.finalPeriod !== "same_period") {
      errors.push(issue("G3B_U04_SEM_TIME_PERIOD_MISMATCH", "timePeriodModel", "Production quantities do not share one period."));
    }
  }
  if (!question.semanticSnapshot || question.semanticSnapshot.templateFamilyId !== spec.templateFamilyId) errors.push(issue("G3B_U04_SEM_SNAPSHOT_INCOMPLETE", "semanticSnapshot", "Semantic snapshot is incomplete."));
  if (question.answerText !== `${question.finalAnswer}${question.answerUnit}`) errors.push(issue("G3B_U04_SEM_ANSWER_TEXT_MISMATCH", "answerText", "Answer text does not match answer and unit."));
  if (question.selectorStatus !== "hidden" || question.productionUse !== "forbidden") errors.push(issue("G3B_U04_SEM_SCOPE_PROMOTION_FORBIDDEN", "productionUse", "S57E4 question escaped hidden scope."));
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function generateG3BU04MultiplicativeSemanticQuestion(options = {}) {
  const spec = getG3BU04SemanticPatternDefinition(options.patternSpecId);
  if (!spec || !MULTIPLICATIVE_KP_SET.has(spec.knowledgePointId)) {
    return {
      ok: false,
      question: null,
      errors: [issue("G3B_U04_SEM_PATTERN_SPEC_UNREGISTERED", "patternSpecId", `PatternSpec '${options.patternSpecId ?? ""}' is not supported by S57E4.`)],
      warnings: []
    };
  }
  const sequenceNumber = Number.isInteger(options.sequenceNumber) && options.sequenceNumber > 0 ? options.sequenceNumber : 1;
  const baseSeed = hashSeed(`${options.seed ?? "s57e4"}:${spec.patternSpecId}:${sequenceNumber}`);
  if (options.contextDomain && !spec.contextDomains.includes(options.contextDomain)) {
    return {
      ok: false,
      question: null,
      errors: [issue("G3B_U04_SEM_SCENARIO_PROFILE_UNREGISTERED", "contextDomain", `Context '${options.contextDomain}' is not approved for ${spec.patternSpecId}.`)],
      warnings: []
    };
  }
  const contextDomain = options.contextDomain ?? spec.contextDomains[baseSeed % spec.contextDomains.length];
  const scenario = resolveG3BU04SemanticScenarioProfile(spec.templateFamilyId, contextDomain);
  if (!scenario) {
    return {
      ok: false,
      question: null,
      errors: [issue("G3B_U04_SEM_SCENARIO_PROFILE_UNREGISTERED", "scenarioId", `No scenario profile exists for ${spec.templateFamilyId}/${contextDomain}.`)],
      warnings: []
    };
  }
  for (let attempt = 1; attempt <= (options.maxAttempts ?? 64); attempt += 1) {
    const attemptSeed = mix32(baseSeed + attempt * 7919);
    const sampled = sampleForSpec(spec, attemptSeed);
    if (!samplingPasses(spec, scenario, sampled)) continue;
    try {
      const question = buildQuestion(spec, scenario, sampled, { ...options, sequenceNumber });
      const checked = validateG3BU04MultiplicativeGeneratedQuestion(question);
      if (checked.ok) return { ok: true, question, errors: [], warnings: checked.warnings };
    } catch (error) {
      if (String(error?.message ?? "").startsWith("G3B_U04_SEM_PROMPT_PLACEHOLDER_UNRESOLVED")) {
        return { ok: false, question: null, errors: [issue("G3B_U04_SEM_PROMPT_PLACEHOLDER_UNRESOLVED", "promptText", error.message)], warnings: [] };
      }
      throw error;
    }
  }
  return {
    ok: false,
    question: null,
    errors: [issue("G3B_U04_SEM_GENERATION_EXHAUSTED", "generation", `Unable to generate a valid multiplicative semantic question for '${spec.patternSpecId}'.`)],
    warnings: []
  };
}
