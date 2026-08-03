import {
  G4B_U06_SLICE019_SOURCE_ID,
  G4B_U06_TWO_DECIMAL_KP_ID,
  G4B_U06_RATE_TOTAL_KP_ID,
  G4B_U06_TWO_DECIMAL_NUMERIC_GROUP_ID,
  G4B_U06_TWO_DECIMAL_APPLICATION_GROUP_ID,
  G4B_U06_RATE_NUMERIC_GROUP_ID,
  G4B_U06_RATE_APPLICATION_GROUP_ID,
  G4B_U06_TWO_DECIMAL_NUMERIC_SPEC_ID,
  G4B_U06_TWO_DECIMAL_APPLICATION_SPEC_ID,
  G4B_U06_RATE_TOTAL_NUMERIC_SPEC_ID,
  G4B_U06_RATE_COMBINED_NUMERIC_SPEC_ID,
  G4B_U06_RATE_TOTAL_APPLICATION_SPEC_ID,
  G4B_U06_RATE_COMBINED_APPLICATION_SPEC_ID,
  G4B_U06_SLICE019_PATTERN_SPEC_IDS,
} from "../registry/g4b-u06-two-decimal-rate-selector-projection.js";

export const P03F19_REQUIRED_CAPABILITY_IDS = Object.freeze([
  "cap_decimal_arithmetic",
  "cap_decimal_domain_validator",
  "cap_decimal_number_system",
]);

export const P03F19_CONTEXT_AUTHORITIES = Object.freeze({
  [G4B_U06_RATE_COMBINED_APPLICATION_SPEC_ID]: Object.freeze({
    bindingCandidateId: "w02_bind_ps_g4b_u06_rate_distance_context_combined_application",
    itemCandidateId: "w02_item_ps_g4b_u06_rate_distance_context_combined_application",
    macroContextId: "gctx_macro_commerce_budget",
    mesoSituationId: "gctx_meso_market_exchange",
    microScenarioId: "gctx_micro_market_batch_exchange",
    atomicEpisodeId: "gctx_episode_market_batch_exchange_direct_quantity",
    surfaceTemplateId: "tpl_fusion_market_exchange_direct_01",
  }),
  [G4B_U06_RATE_TOTAL_APPLICATION_SPEC_ID]: Object.freeze({
    bindingCandidateId: "w02_bind_ps_g4b_u06_rate_distance_context_total_application",
    itemCandidateId: "w02_item_ps_g4b_u06_rate_distance_context_total_application",
    macroContextId: "gctx_macro_water_energy",
    mesoSituationId: "gctx_meso_energy_conservation",
    microScenarioId: "gctx_micro_energy_use_tracking",
    atomicEpisodeId: "gctx_episode_energy_use_tracking_direct_quantity",
    surfaceTemplateId: "tpl_fusion_energy_conservation_direct_01",
  }),
  [G4B_U06_TWO_DECIMAL_APPLICATION_SPEC_ID]: Object.freeze({
    bindingCandidateId: "w02_bind_ps_g4b_u06_two_decimal_times_integer_product_application",
    itemCandidateId: "w02_item_ps_g4b_u06_two_decimal_times_integer_product_application",
    macroContextId: "gctx_macro_disaster_resilience",
    mesoSituationId: "gctx_meso_disaster_preparedness",
    microScenarioId: "gctx_micro_emergency_supply_preposition",
    atomicEpisodeId: "gctx_episode_emergency_supply_preposition_direct_quantity",
    surfaceTemplateId: "tpl_fusion_disaster_preparedness_direct_01",
  }),
});

const CASES = Object.freeze([
  [125, 4, 275], [208, 3, 145], [315, 6, 225], [407, 5, 180],
  [532, 7, 264], [649, 8, 351], [715, 9, 420], [826, 2, 573],
  [934, 4, 186], [1045, 3, 295], [1176, 5, 324], [1288, 6, 407],
  [1395, 7, 512], [1462, 8, 635], [1574, 9, 248], [1683, 2, 759],
  [1796, 4, 381], [1847, 3, 526], [1958, 5, 647], [2069, 6, 718],
  [2175, 7, 839], [2286, 8, 954], [2397, 9, 165], [2484, 2, 276],
]);

function hashSeed(value) {
  let acc = 2166136261;
  for (const char of String(value ?? "p03f19")) {
    acc ^= char.charCodeAt(0);
    acc = Math.imul(acc, 16777619) >>> 0;
  }
  return acc || 1;
}

function decimalText(coefficient) {
  const whole = Math.floor(coefficient / 100);
  return `${whole}.${String(coefficient % 100).padStart(2, "0")}`;
}

function definitionFor(patternSpecId) {
  const definitions = {
    [G4B_U06_TWO_DECIMAL_NUMERIC_SPEC_ID]: {
      knowledgePointId: G4B_U06_TWO_DECIMAL_KP_ID,
      patternGroupId: G4B_U06_TWO_DECIMAL_NUMERIC_GROUP_ID,
      questionMode: "numeric",
      requestedUnknownRole: "product",
      operationFamilyId: "decimal_multiply",
      applicationClassification: "APPLICATION_COMPATIBLE",
      answerUnit: null,
    },
    [G4B_U06_TWO_DECIMAL_APPLICATION_SPEC_ID]: {
      knowledgePointId: G4B_U06_TWO_DECIMAL_KP_ID,
      patternGroupId: G4B_U06_TWO_DECIMAL_APPLICATION_GROUP_ID,
      questionMode: "application",
      requestedUnknownRole: "product",
      operationFamilyId: "decimal_multiply",
      applicationClassification: "APPLICATION_COMPATIBLE",
      answerUnit: "箱",
    },
    [G4B_U06_RATE_TOTAL_NUMERIC_SPEC_ID]: {
      knowledgePointId: G4B_U06_RATE_TOTAL_KP_ID,
      patternGroupId: G4B_U06_RATE_NUMERIC_GROUP_ID,
      questionMode: "numeric",
      requestedUnknownRole: "total",
      operationFamilyId: "rate_total",
      applicationClassification: "APPLICATION_REQUIRED",
      answerUnit: null,
    },
    [G4B_U06_RATE_COMBINED_NUMERIC_SPEC_ID]: {
      knowledgePointId: G4B_U06_RATE_TOTAL_KP_ID,
      patternGroupId: G4B_U06_RATE_NUMERIC_GROUP_ID,
      questionMode: "numeric",
      requestedUnknownRole: "combined",
      operationFamilyId: "rate_total",
      applicationClassification: "APPLICATION_REQUIRED",
      answerUnit: null,
    },
    [G4B_U06_RATE_TOTAL_APPLICATION_SPEC_ID]: {
      knowledgePointId: G4B_U06_RATE_TOTAL_KP_ID,
      patternGroupId: G4B_U06_RATE_APPLICATION_GROUP_ID,
      questionMode: "application",
      requestedUnknownRole: "total",
      operationFamilyId: "rate_total",
      applicationClassification: "APPLICATION_REQUIRED",
      answerUnit: "度",
    },
    [G4B_U06_RATE_COMBINED_APPLICATION_SPEC_ID]: {
      knowledgePointId: G4B_U06_RATE_TOTAL_KP_ID,
      patternGroupId: G4B_U06_RATE_APPLICATION_GROUP_ID,
      questionMode: "application",
      requestedUnknownRole: "combined",
      operationFamilyId: "rate_total",
      applicationClassification: "APPLICATION_REQUIRED",
      answerUnit: "份",
    },
  };
  return definitions[patternSpecId] ?? null;
}

function promptFor(patternSpecId, decimalFactor, integerFactor, secondTotal) {
  if (patternSpecId === G4B_U06_TWO_DECIMAL_NUMERIC_SPEC_ID) return `${decimalFactor} × ${integerFactor} = ？`;
  if (patternSpecId === G4B_U06_TWO_DECIMAL_APPLICATION_SPEC_ID) return `防災物資預先配置時，每組準備 ${decimalFactor} 箱物資，${integerFactor} 組共準備多少箱物資？`;
  if (patternSpecId === G4B_U06_RATE_TOTAL_NUMERIC_SPEC_ID) return `${decimalFactor} × ${integerFactor} = ？（求總量）`;
  if (patternSpecId === G4B_U06_RATE_COMBINED_NUMERIC_SPEC_ID) return `先算 ${decimalFactor} × ${integerFactor}，再加上 ${secondTotal}，合計是多少？`;
  if (patternSpecId === G4B_U06_RATE_TOTAL_APPLICATION_SPEC_ID) return `節能紀錄顯示，設備每次使用 ${decimalFactor} 度能源，使用 ${integerFactor} 次共使用多少度能源？`;
  return `市場每批交換 ${decimalFactor} 份貨物，${integerFactor} 批完成後，又加入 ${secondTotal} 份貨物，貨物總量是多少份？`;
}

function buildQuestion(patternSpecId, fixture, ordinal) {
  const definition = definitionFor(patternSpecId);
  const [rateHundredths, integerFactor, secondHundredths] = fixture;
  const firstTotalHundredths = rateHundredths * integerFactor;
  const answerCoefficient = definition.requestedUnknownRole === "combined"
    ? firstTotalHundredths + secondHundredths
    : firstTotalHundredths;
  const decimalFactor = decimalText(rateHundredths);
  const firstTotal = decimalText(firstTotalHundredths);
  const secondTotal = decimalText(secondHundredths);
  const canonicalAnswer = decimalText(answerCoefficient);
  const promptText = promptFor(patternSpecId, decimalFactor, integerFactor, secondTotal);
  const answerText = definition.answerUnit ? `${canonicalAnswer} ${definition.answerUnit}` : canonicalAnswer;
  const contextAuthority = P03F19_CONTEXT_AUTHORITIES[patternSpecId] ?? null;
  return Object.freeze({
    id: `${patternSpecId}-${ordinal}`,
    sourceId: G4B_U06_SLICE019_SOURCE_ID,
    patternSpecId,
    kind: "g4bU06TwoDecimalRateSlice019",
    operation: definition.operationFamilyId,
    operationFamilyId: definition.operationFamilyId,
    questionMode: definition.questionMode,
    promptText,
    questionText: promptText,
    blankedDisplayText: promptText,
    displayText: `${promptText} ${answerText}`,
    answerText,
    decimalFactor,
    decimalFactorHundredths: rateHundredths,
    integerFactor,
    firstTotal,
    firstTotalHundredths,
    secondTotal,
    secondTotalHundredths: secondHundredths,
    product: firstTotal,
    total: firstTotal,
    combined: decimalText(firstTotalHundredths + secondHundredths),
    finalAnswer: Object.freeze({
      coefficient: String(answerCoefficient),
      scale: 2,
      canonicalText: canonicalAnswer,
      exact: true,
      unit: definition.answerUnit,
    }),
    metadata: Object.freeze({
      patternId: patternSpecId,
      sourceId: G4B_U06_SLICE019_SOURCE_ID,
      patternTags: Object.freeze(["full_product_w3_slice019", patternSpecId]),
      skillTags: Object.freeze(["decimal", "multiplication", definition.requestedUnknownRole]),
      difficultyTags: Object.freeze(["exact_scale_2", "full_product_w3_slice019"]),
      curriculumNodeIds: Object.freeze([G4B_U06_SLICE019_SOURCE_ID]),
      canonicalSkillIds: Object.freeze([definition.knowledgePointId]),
      knowledgePointId: definition.knowledgePointId,
      patternGroupId: definition.patternGroupId,
      operationFamilyId: definition.operationFamilyId,
      requestedUnknownRole: definition.requestedUnknownRole,
      requiredCapabilityIds: P03F19_REQUIRED_CAPABILITY_IDS,
      applicationClassification: definition.applicationClassification,
      decimalScale: 2,
      productAdmissionTask: "P03F_W3DirectProductVerticalSlice019Implementation",
      generatorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
      validatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
      contextAuthority,
    }),
  });
}

export function canGenerateG4BU06Slice019Questions(plan = {}) {
  return plan.sourceId === G4B_U06_SLICE019_SOURCE_ID
    && Array.isArray(plan.patternSpecIds)
    && plan.patternSpecIds.length === 1
    && G4B_U06_SLICE019_PATTERN_SPEC_IDS.includes(plan.patternSpecIds[0]);
}

export function validateG4BU06Slice019Question(question = {}) {
  const errors = [];
  const add = (code, path) => errors.push({ code, severity: "error", path, message: code });
  const definition = definitionFor(question.patternSpecId);
  if (!definition) {
    add("p03f19_pattern_not_admitted", "patternSpecId");
    return { ok: false, errors, warnings: [] };
  }
  if (question.sourceId !== G4B_U06_SLICE019_SOURCE_ID || question.metadata?.sourceId !== G4B_U06_SLICE019_SOURCE_ID) add("p03f19_source_mismatch", "sourceId");
  if (question.metadata?.patternId !== question.patternSpecId) add("p03f19_pattern_identity_mismatch", "metadata.patternId");
  if (question.metadata?.knowledgePointId !== definition.knowledgePointId || question.metadata?.patternGroupId !== definition.patternGroupId) add("p03f19_kp_group_mismatch", "metadata");
  if (question.questionMode !== definition.questionMode || question.metadata?.requestedUnknownRole !== definition.requestedUnknownRole) add("p03f19_mode_role_mismatch", "questionMode");
  if (!Number.isInteger(question.decimalFactorHundredths) || question.decimalFactorHundredths <= 0 || question.decimalFactorHundredths % 100 === 0) add("p03f19_decimal_factor_invalid", "decimalFactorHundredths");
  if (!Number.isInteger(question.integerFactor) || question.integerFactor < 2 || question.integerFactor > 9) add("p03f19_integer_factor_invalid", "integerFactor");
  if (!Number.isInteger(question.secondTotalHundredths) || question.secondTotalHundredths <= 0) add("p03f19_second_total_invalid", "secondTotalHundredths");
  const firstCoefficient = question.decimalFactorHundredths * question.integerFactor;
  const expectedCoefficient = definition.requestedUnknownRole === "combined"
    ? firstCoefficient + question.secondTotalHundredths
    : firstCoefficient;
  const expectedCanonical = decimalText(expectedCoefficient);
  if (question.firstTotalHundredths !== firstCoefficient || question.firstTotal !== decimalText(firstCoefficient) || question.product !== decimalText(firstCoefficient) || question.total !== decimalText(firstCoefficient)) add("p03f19_first_total_identity_invalid", "firstTotal");
  if (question.combined !== decimalText(firstCoefficient + question.secondTotalHundredths)) add("p03f19_combined_identity_invalid", "combined");
  if (question.finalAnswer?.coefficient !== String(expectedCoefficient) || question.finalAnswer?.scale !== 2 || question.finalAnswer?.canonicalText !== expectedCanonical || question.finalAnswer?.exact !== true || question.finalAnswer?.unit !== definition.answerUnit) add("p03f19_final_answer_invalid", "finalAnswer");
  const expectedAnswerText = definition.answerUnit ? `${expectedCanonical} ${definition.answerUnit}` : expectedCanonical;
  if (question.answerText !== expectedAnswerText) add("p03f19_answer_text_invalid", "answerText");
  if (JSON.stringify(question.metadata?.requiredCapabilityIds) !== JSON.stringify(P03F19_REQUIRED_CAPABILITY_IDS)) add("p03f19_capability_set_invalid", "metadata.requiredCapabilityIds");
  const expectedContext = P03F19_CONTEXT_AUTHORITIES[question.patternSpecId] ?? null;
  if (definition.questionMode === "application") {
    if (!expectedContext || JSON.stringify(question.metadata?.contextAuthority) !== JSON.stringify(expectedContext)) add("p03f19_context_lineage_invalid", "metadata.contextAuthority");
  } else if (question.metadata?.contextAuthority !== null) {
    add("p03f19_numeric_context_leakage", "metadata.contextAuthority");
  }
  if (/(?:算式|_{2,}|答\s*[:：]|\{\{)/.test(String(question.blankedDisplayText ?? ""))) add("p03f19_forbidden_surface_present", "blankedDisplayText");
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function generateG4BU06Slice019Questions(options = {}) {
  const questionCount = Number(options.questionCount ?? 8);
  const generationSeed = String(options.generationSeed ?? "p03f19");
  const plan = options.plan ?? {
    sourceId: options.sourceId,
    patternSpecIds: options.patternSpecIds,
    questionCount,
    generationSeed,
  };
  if (!canGenerateG4BU06Slice019Questions(plan)) {
    return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "p03f19_plan_not_supported", severity: "error", path: "plan", message: "Slice019 accepts one admitted G4B-U06 PatternSpec at a time." }], warnings: [] };
  }
  if (!Number.isInteger(questionCount) || questionCount <= 0 || questionCount > CASES.length) {
    return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "p03f19_question_count_invalid", severity: "error", path: "questionCount", message: "Question count must be between 1 and 24." }], warnings: [] };
  }
  const patternSpecId = plan.patternSpecIds[0];
  const offset = hashSeed(generationSeed) % CASES.length;
  const questions = Array.from({ length: questionCount }, (_, index) => buildQuestion(patternSpecId, CASES[(offset + index) % CASES.length], index + 1));
  const errors = questions.flatMap((question) => validateG4BU06Slice019Question(question).errors);
  if (new Set(questions.map((row) => row.blankedDisplayText)).size !== questions.length) errors.push({ code: "p03f19_duplicate_prompt_detected", severity: "error", path: "questions", message: "Duplicate prompts are forbidden." });
  return { ok: errors.length === 0, plan, questions, allocation: [{ patternSpecId, questionCount }], errors, warnings: [] };
}
