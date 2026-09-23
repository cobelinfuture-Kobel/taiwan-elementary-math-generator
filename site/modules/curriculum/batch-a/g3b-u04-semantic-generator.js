import {
  G3B_U04_SOURCE_ID,
  getG3BU04SemanticPatternDefinition,
  listG3BU04SemanticPatternDefinitions
} from "./source-pattern-g3b-u04-semantic-extension.js";
import {
  resolveG3BU04SemanticScenarioProfile
} from "./g3b-u04-semantic-scenarios.js";

const STRUCTURAL_KNOWLEDGE_POINT_IDS = Object.freeze([
  "kp_g3b_u04_add_then_divide",
  "kp_g3b_u04_multiply_then_divide_average_unit_price",
  "kp_g3b_u04_subtract_then_divide",
  "kp_g3b_u04_divide_then_add",
  "kp_g3b_u04_total_minus_shared_amount",
  "kp_g3b_u04_group_total_minus_remaining",
  "kp_g3b_u04_consecutive_multiplication"
]);
const STRUCTURAL_KP_SET = new Set(STRUCTURAL_KNOWLEDGE_POINT_IDS);
const MAX_GENERATION_ATTEMPTS = 64;

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
  const mixed = mix32(seed + Math.imul(offset + 1, 0x9e3779b1));
  return min + (mixed % (max - min + 1));
}

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  }
  return value;
}

function scaleForScenario(scenario) {
  if (scenario.currencyUnit === "元") return 5;
  if (scenario.capacityUnit === "毫升") return 10;
  if (scenario.measureUnit === "公克" || scenario.measureUnit === "公分") return 5;
  return 1;
}

function sampleAddThenDivide(seed, scale) {
  const c = randomInt(seed, 1, 2, 6);
  const answer = randomInt(seed, 2, 3, 24) * scale;
  const total = answer * c;
  const splitUnits = randomInt(seed, 3, 1, Math.max(1, Math.floor(total / scale) - 1));
  const a = splitUnits * scale;
  const b = total - a;
  return { values: { a, b, c }, answer, intermediateResults: [a + b, answer] };
}

function sampleMultiplyThenDivide(seed, scale, withExplicitBonus) {
  const q = randomInt(seed, 4, 2, 5);
  const bonus = randomInt(seed, 5, 1, 3);
  const received = q + bonus;
  const base = randomInt(seed, 6, 2, 10) * scale;
  if (withExplicitBonus) {
    const p = base * received;
    const answer = base * q;
    return {
      values: { p, q, g: bonus },
      answer,
      intermediateResults: [p * q, received, answer]
    };
  }
  const p = base * received;
  const answer = base * q;
  return {
    values: { p, q, r: received },
    answer,
    intermediateResults: [p * q, answer]
  };
}

function sampleSubtractThenDivide(seed, scale) {
  const c = randomInt(seed, 7, 2, 6);
  const answer = randomInt(seed, 8, 2, 24) * scale;
  const b = randomInt(seed, 9, 1, 12) * scale;
  const a = answer * c + b;
  return { values: { a, b, c }, answer, intermediateResults: [a - b, answer] };
}

function sampleDivideThenAdd(seed, scale) {
  const b = randomInt(seed, 10, 2, 8);
  const quotient = randomInt(seed, 11, 2, 20) * scale;
  const c = randomInt(seed, 12, 1, 12) * scale;
  const a = b * quotient;
  const answer = quotient + c;
  return { values: { a, b, c }, answer, intermediateResults: [quotient, answer] };
}

function sampleTotalMinusSharedAmount(seed, scale) {
  const c = randomInt(seed, 13, 2, 6);
  const personalShare = randomInt(seed, 14, 1, 12) * scale;
  const b = c * personalShare;
  const answer = randomInt(seed, 15, 2, 24) * scale;
  const a = personalShare + answer;
  return { values: { a, b, c }, answer, intermediateResults: [personalShare, answer] };
}

function sampleGroupTotalMinusRemaining(seed) {
  const b = randomInt(seed, 16, 2, 8);
  const c = randomInt(seed, 17, 1, 6);
  const answer = randomInt(seed, 18, 1, 15);
  const groupTotal = c + answer;
  const a = b * groupTotal;
  return { values: { a, b, c }, answer, intermediateResults: [groupTotal, answer] };
}

function sampleConsecutiveMultiplication(seed) {
  const a = randomInt(seed, 19, 2, 9);
  const b = randomInt(seed, 20, 2, 9);
  const c = randomInt(seed, 21, 2, 9);
  const first = a * b;
  const answer = first * c;
  return { values: { a, b, c }, answer, intermediateResults: [first, answer] };
}

function sampleForShape(shape, seed, scale) {
  if (shape === "(a+b)/c") return sampleAddThenDivide(seed, scale);
  if (shape === "(p*q)/r") return sampleMultiplyThenDivide(seed, scale, false);
  if (shape === "(p*q)/(q+g)") return sampleMultiplyThenDivide(seed, scale, true);
  if (shape === "(a-b)/c") return sampleSubtractThenDivide(seed, scale);
  if (shape === "a/b+c") return sampleDivideThenAdd(seed, scale);
  if (shape === "a-(b/c)") return sampleTotalMinusSharedAmount(seed, scale);
  if (shape === "(a/b)-c") return sampleGroupTotalMinusRemaining(seed);
  if (shape === "a*b*c") return sampleConsecutiveMultiplication(seed);
  return null;
}

function expressionData(shape, values) {
  if (shape === "(a+b)/c") {
    return { tokens: ["(", values.a, "+", values.b, ")", "÷", values.c], text: `(${values.a} + ${values.b}) ÷ ${values.c}` };
  }
  if (shape === "(p*q)/r") {
    return { tokens: ["(", values.p, "×", values.q, ")", "÷", values.r], text: `(${values.p} × ${values.q}) ÷ ${values.r}` };
  }
  if (shape === "(p*q)/(q+g)") {
    return { tokens: ["(", values.p, "×", values.q, ")", "÷", "(", values.q, "+", values.g, ")"], text: `(${values.p} × ${values.q}) ÷ (${values.q} + ${values.g})` };
  }
  if (shape === "(a-b)/c") {
    return { tokens: ["(", values.a, "-", values.b, ")", "÷", values.c], text: `(${values.a} - ${values.b}) ÷ ${values.c}` };
  }
  if (shape === "a/b+c") {
    return { tokens: [values.a, "÷", values.b, "+", values.c], text: `${values.a} ÷ ${values.b} + ${values.c}` };
  }
  if (shape === "a-(b/c)") {
    return { tokens: [values.a, "-", "(", values.b, "÷", values.c, ")"], text: `${values.a} - (${values.b} ÷ ${values.c})` };
  }
  if (shape === "(a/b)-c") {
    return { tokens: ["(", values.a, "÷", values.b, ")", "-", values.c], text: `(${values.a} ÷ ${values.b}) - ${values.c}` };
  }
  if (shape === "a*b*c") {
    return { tokens: [values.a, "×", values.b, "×", values.c], text: `${values.a} × ${values.b} × ${values.c}` };
  }
  return null;
}

function eventSequence(shape, values, intermediateResults) {
  if (shape === "(a+b)/c") return [
    { step: 1, action: "combine", inputRoles: ["a", "b"], result: intermediateResults[0] },
    { step: 2, action: "equal_share", inputRoles: ["combined_total", "c"], result: intermediateResults[1] }
  ];
  if (shape === "(p*q)/r") return [
    { step: 1, action: "calculate_total_cost", inputRoles: ["p", "q"], result: intermediateResults[0] },
    { step: 2, action: "average_over_received_units", inputRoles: ["total_cost", "r"], result: intermediateResults[1] }
  ];
  if (shape === "(p*q)/(q+g)") return [
    { step: 1, action: "calculate_total_cost", inputRoles: ["p", "q"], result: intermediateResults[0] },
    { step: 2, action: "calculate_received_units", inputRoles: ["q", "g"], result: intermediateResults[1] },
    { step: 3, action: "average_over_received_units", inputRoles: ["total_cost", "received_units"], result: intermediateResults[2] }
  ];
  if (shape === "(a-b)/c") return [
    { step: 1, action: "subtract", inputRoles: ["a", "b"], result: intermediateResults[0] },
    { step: 2, action: "equal_share_or_group", inputRoles: ["remaining", "c"], result: intermediateResults[1] }
  ];
  if (shape === "a/b+c") return [
    { step: 1, action: "divide", inputRoles: ["a", "b"], result: intermediateResults[0] },
    { step: 2, action: "add_existing", inputRoles: ["quotient", "c"], result: intermediateResults[1] }
  ];
  if (shape === "a-(b/c)") return [
    { step: 1, action: "calculate_personal_share", inputRoles: ["b", "c"], result: intermediateResults[0] },
    { step: 2, action: "subtract_personal_share", inputRoles: ["a", "personal_share"], result: intermediateResults[1] }
  ];
  if (shape === "(a/b)-c") return [
    { step: 1, action: "form_groups", inputRoles: ["a", "b"], result: intermediateResults[0] },
    { step: 2, action: "subtract_remaining_groups", inputRoles: ["group_total", "c"], result: intermediateResults[1] }
  ];
  if (shape === "a*b*c") return [
    { step: 1, action: "multiply_first_two_levels", inputRoles: ["a", "b"], result: intermediateResults[0] },
    { step: 2, action: "multiply_outer_level", inputRoles: ["first_product", "c"], result: intermediateResults[1] }
  ];
  return [];
}

function answerUnitFor(spec, scenario) {
  const role = spec.unknownRole;
  if (/cost|price|money|budget/.test(role)) return "元";
  if (/points/.test(role)) return "點";
  if (/capacity/.test(role)) return scenario.capacityUnit ?? scenario.measureUnit ?? "毫升";
  if (/team/.test(role)) return "隊";
  if (/tray/.test(role)) return "盤";
  if (/group_count/.test(role)) return "組";
  if (/package/.test(role)) return scenario.packageUnit ?? "盒";
  return scenario.measureUnit ?? scenario.itemUnit ?? "個";
}

function renderPrompt(spec, scenario, values) {
  const bindings = { ...scenario.placeholderBindings, ...values };
  let prompt = spec.promptSkeletonZh.replace(/\{([^}]+)\}/g, (_, key) => {
    const value = bindings[key];
    if (value === undefined || value === null || value === "") {
      throw new Error(`G3B_U04_SEM_PROMPT_PLACEHOLDER_UNRESOLVED:${key}`);
    }
    return String(value);
  });
  if (spec.templateFamilyId === "tpl_g3b_u04_add_divide_joint_purchase_equal_share") {
    prompt = `${scenario.placeholderBindings.item1}費用${values.a}元，${scenario.placeholderBindings.item2}費用${values.b}元。${prompt}`;
  }
  return prompt;
}

function bindQuantities(spec, scenario, values, answerUnit) {
  return Object.fromEntries(Object.entries(spec.quantityRoles).map(([symbol, semanticRole]) => {
    const roleDefinition = scenario.quantityBounds[symbol];
    return [symbol, {
      semanticRole,
      value: values[symbol],
      unitDimension: roleDefinition.unitDimension,
      unitLabel: roleDefinition.unitDimension === "currency" ? "元" : roleDefinition.unitDimension === "points" ? "點" : answerUnit
    }];
  }));
}

function buildQuestion(spec, scenario, sampled, options) {
  const expression = expressionData(spec.equationShape, sampled.values);
  const answerUnit = answerUnitFor(spec, scenario);
  const promptText = renderPrompt(spec, scenario, sampled.values);
  const answerText = `${sampled.answer}${answerUnit}`;
  const quantityRoleBindings = bindQuantities(spec, scenario, sampled.values, answerUnit);
  const events = eventSequence(spec.equationShape, sampled.values, sampled.intermediateResults);
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
    validationCodes: []
  };
  return {
    id: options.id ?? `${spec.patternSpecId}-${options.sequenceNumber}`,
    sourceId: G3B_U04_SOURCE_ID,
    kind: "g3bU04SemanticWordProblem",
    phase: "S57E3",
    patternSpecId: spec.patternSpecId,
    patternGroupId: spec.patternGroupId,
    knowledgePointId: spec.knowledgePointId,
    templateFamilyId: spec.templateFamilyId,
    semanticSignature: spec.semanticSignature,
    promptText,
    blankedDisplayText: promptText,
    displayText: `${promptText} 答案：${answerText}`,
    equationModel: expression.text,
    equationTokens: expression.tokens,
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
    semanticSnapshot,
    selectorStatus: "hidden",
    generatorRouting: "not_implemented_in_s57e3",
    productionUse: "forbidden",
    metadata: {
      patternId: spec.patternSpecId,
      patternGroupId: spec.patternGroupId,
      sourceId: G3B_U04_SOURCE_ID,
      templateFamilyId: spec.templateFamilyId,
      patternTags: [...spec.patternTags, "s57e3_structural_generator"],
      skillTags: [...spec.skillTags],
      difficultyTags: [...spec.difficultyTags, "s57e3_structural_hidden"],
      curriculumNodeIds: [...spec.curriculumNodeIds],
      canonicalSkillIds: [...spec.canonicalSkillIds]
    }
  };
}

function structurallyAcceptable(spec, scenario, sampled) {
  if (!sampled || !Number.isSafeInteger(sampled.answer) || sampled.answer <= 0 || sampled.answer > 10000) return false;
  if (Object.values(sampled.values).some((value) => !Number.isSafeInteger(value) || value <= 0 || value > 10000)) return false;
  if (sampled.intermediateResults.some((value) => !Number.isSafeInteger(value) || value <= 0 || value > 10000)) return false;
  for (const [symbol, role] of Object.entries(scenario.quantityBounds)) {
    const value = sampled.values[symbol];
    if (!Number.isSafeInteger(value) || value < role.min || value > role.max) return false;
  }
  if (spec.equationShape.includes("/") && sampled.intermediateResults.some((value) => !Number.isInteger(value))) return false;
  return true;
}

export const G3B_U04_STRUCTURAL_SEMANTIC_KNOWLEDGE_POINT_IDS = STRUCTURAL_KNOWLEDGE_POINT_IDS;
export const G3B_U04_STRUCTURAL_SEMANTIC_PATTERN_SPEC_IDS = Object.freeze(
  listG3BU04SemanticPatternDefinitions()
    .filter((spec) => STRUCTURAL_KP_SET.has(spec.knowledgePointId))
    .map((spec) => spec.patternSpecId)
);

export function isG3BU04StructuralSemanticPatternSpecId(patternSpecId) {
  const spec = getG3BU04SemanticPatternDefinition(patternSpecId);
  return Boolean(spec && STRUCTURAL_KP_SET.has(spec.knowledgePointId));
}

export function validateG3BU04StructuralGeneratedQuestion(question = {}) {
  const errors = [];
  const spec = getG3BU04SemanticPatternDefinition(question.patternSpecId ?? question.metadata?.patternId);
  if (!spec || !STRUCTURAL_KP_SET.has(spec.knowledgePointId)) {
    errors.push(issue("G3B_U04_SEM_PATTERN_SPEC_UNREGISTERED", "patternSpecId", "Structural semantic PatternSpec is not registered for S57E3."));
    return { ok: false, errors, warnings: [] };
  }
  if (question.kind !== "g3bU04SemanticWordProblem") errors.push(issue("G3B_U04_SEM_KIND_INVALID", "kind", "Question kind is invalid."));
  if (question.sourceId !== G3B_U04_SOURCE_ID) errors.push(issue("G3B_U04_SEM_SOURCE_INVALID", "sourceId", "Source id is invalid."));
  if (question.knowledgePointId !== spec.knowledgePointId) errors.push(issue("G3B_U04_SEM_KP_MISMATCH", "knowledgePointId", "KnowledgePoint does not match PatternSpec."));
  if (question.templateFamilyId !== spec.templateFamilyId) errors.push(issue("G3B_U04_SEM_TEMPLATE_MISMATCH", "templateFamilyId", "Template family does not match PatternSpec."));
  if (!question.promptText || /\{[^}]+\}/.test(question.promptText)) errors.push(issue("G3B_U04_SEM_PROMPT_PLACEHOLDER_UNRESOLVED", "promptText", "Prompt contains an unresolved placeholder."));
  if (!Number.isSafeInteger(question.finalAnswer) || question.finalAnswer <= 0 || question.finalAnswer > 10000) errors.push(issue("G3B_U04_SEM_FINAL_ANSWER_INVALID", "finalAnswer", "Final answer is outside the structural scope."));
  if (question.answerText !== `${question.finalAnswer}${question.answerUnit}`) errors.push(issue("G3B_U04_SEM_ANSWER_TEXT_MISMATCH", "answerText", "Answer text does not match answer value and unit."));
  if (!question.semanticSnapshot || question.semanticSnapshot.templateFamilyId !== spec.templateFamilyId) errors.push(issue("G3B_U04_SEM_SNAPSHOT_INCOMPLETE", "semanticSnapshot", "Semantic snapshot is missing or incomplete."));
  if (!Array.isArray(question.eventSequence) || question.eventSequence.length < 2) errors.push(issue("G3B_U04_SEM_EVENT_SEQUENCE_MISSING", "eventSequence", "Event sequence is missing."));
  if (!question.quantityRoleBindings || Object.keys(question.quantityRoleBindings).length !== Object.keys(spec.quantityRoles).length) errors.push(issue("G3B_U04_SEM_QUANTITY_ROLE_MISSING", "quantityRoleBindings", "Quantity role bindings are incomplete."));
  if (question.selectorStatus !== "hidden" || question.productionUse !== "forbidden") errors.push(issue("G3B_U04_SEM_SCOPE_PROMOTION_FORBIDDEN", "productionUse", "S57E3 question escaped hidden scope."));
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function generateG3BU04StructuralSemanticQuestion(options = {}) {
  const patternSpecId = options.patternSpecId;
  const spec = getG3BU04SemanticPatternDefinition(patternSpecId);
  if (!spec || !STRUCTURAL_KP_SET.has(spec.knowledgePointId)) {
    return {
      ok: false,
      question: null,
      errors: [issue("G3B_U04_SEM_PATTERN_SPEC_UNREGISTERED", "patternSpecId", `PatternSpec '${patternSpecId ?? ""}' is not supported by S57E3.`)],
      warnings: []
    };
  }
  const sequenceNumber = Number.isInteger(options.sequenceNumber) && options.sequenceNumber > 0 ? options.sequenceNumber : 1;
  const baseSeed = hashSeed(`${options.seed ?? "s57e3"}:${patternSpecId}:${sequenceNumber}`);
  const requestedContext = options.contextDomain;
  if (requestedContext && !spec.contextDomains.includes(requestedContext)) {
    return {
      ok: false,
      question: null,
      errors: [issue("G3B_U04_SEM_SCENARIO_PROFILE_UNREGISTERED", "contextDomain", `Context '${requestedContext}' is not approved for ${patternSpecId}.`)],
      warnings: []
    };
  }
  const contextDomain = requestedContext ?? spec.contextDomains[baseSeed % spec.contextDomains.length];
  const scenario = resolveG3BU04SemanticScenarioProfile(spec.templateFamilyId, contextDomain);
  if (!scenario) {
    return {
      ok: false,
      question: null,
      errors: [issue("G3B_U04_SEM_SCENARIO_PROFILE_UNREGISTERED", "scenarioId", `No scenario profile exists for ${spec.templateFamilyId}/${contextDomain}.`)],
      warnings: []
    };
  }
  const scale = scaleForScenario(scenario);
  for (let attempt = 1; attempt <= (options.maxAttempts ?? MAX_GENERATION_ATTEMPTS); attempt += 1) {
    const attemptSeed = mix32(baseSeed + attempt * 7919);
    const sampled = sampleForShape(spec.equationShape, attemptSeed, scale);
    if (!structurallyAcceptable(spec, scenario, sampled)) continue;
    try {
      const question = buildQuestion(spec, scenario, sampled, { ...options, sequenceNumber });
      const checked = validateG3BU04StructuralGeneratedQuestion(question);
      if (checked.ok) return { ok: true, question, errors: [], warnings: checked.warnings };
    } catch (error) {
      if (String(error?.message ?? "").startsWith("G3B_U04_SEM_PROMPT_PLACEHOLDER_UNRESOLVED")) {
        return {
          ok: false,
          question: null,
          errors: [issue("G3B_U04_SEM_PROMPT_PLACEHOLDER_UNRESOLVED", "promptText", error.message)],
          warnings: []
        };
      }
      throw error;
    }
  }
  return {
    ok: false,
    question: null,
    errors: [issue("G3B_U04_SEM_GENERATION_EXHAUSTED", "generation", `Unable to generate a valid structural semantic question for '${patternSpecId}'.`)],
    warnings: []
  };
}
