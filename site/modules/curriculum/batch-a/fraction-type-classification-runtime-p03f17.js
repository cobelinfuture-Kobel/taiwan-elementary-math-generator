import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f17.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f17-extension.js";
import {
  G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID,
  G4A_U06_FRACTION_CLASSIFICATION_PATTERN_SPEC_IDS,
} from "../registry/g4a-u06-fraction-type-classification-selector-projection.js";

const ALL_IDS = new Set(G4A_U06_FRACTION_CLASSIFICATION_PATTERN_SPEC_IDS);
const LABEL_BY_TYPE = Object.freeze({
  proper_fraction: "真分數",
  improper_fraction: "假分數",
  mixed_number: "帶分數",
});
const seedOffset = (seed, size) => [...String(seed ?? "p03f17")].reduce((sum, char) => (sum + char.charCodeAt(0)) % size, 0);

function fixturesFor(patternSpecId) {
  const targetType = getBatchABrowserPatternDefinition(patternSpecId)?.numericDomain?.targetType;
  const rows = [];
  if (targetType === "proper_fraction") {
    for (let denominator = 2; denominator <= 19; denominator += 1) {
      for (let numerator = 1; numerator < denominator; numerator += 1) rows.push({ whole: 0, numerator, denominator });
    }
  } else if (targetType === "improper_fraction") {
    for (let denominator = 2; denominator <= 10; denominator += 1) {
      for (let numerator = denominator; numerator <= denominator * 3; numerator += 1) rows.push({ whole: 0, numerator, denominator });
    }
  } else {
    for (let whole = 1; whole <= 6; whole += 1) {
      for (let denominator = 2; denominator <= 10; denominator += 1) {
        for (let numerator = 1; numerator < denominator; numerator += 1) rows.push({ whole, numerator, denominator });
      }
    }
  }
  return rows;
}

function classify({ whole, numerator, denominator }) {
  if (!Number.isSafeInteger(denominator) || denominator <= 0 || !Number.isSafeInteger(numerator) || numerator <= 0 || !Number.isSafeInteger(whole) || whole < 0) return null;
  if (whole > 0 && numerator < denominator) return "mixed_number";
  if (whole === 0 && numerator < denominator) return "proper_fraction";
  if (whole === 0 && numerator >= denominator) return "improper_fraction";
  return null;
}

function displayValue({ whole, numerator, denominator }) {
  return whole > 0 ? `${whole} ${numerator}/${denominator}` : `${numerator}/${denominator}`;
}

function metadata(definition) {
  return Object.freeze({
    patternId: definition.patternSpecId,
    sourceId: G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID,
    patternTags: Object.freeze(["full_product_w3_slice017", definition.patternSpecId]),
    skillTags: definition.skillTags,
    difficultyTags: definition.difficultyTags,
    curriculumNodeIds: Object.freeze([G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID]),
    canonicalSkillIds: definition.canonicalSkillIds,
    knowledgePointId: definition.knowledgePointId,
    patternGroupId: definition.patternGroupId,
    operationFamilyId: definition.operationFamilyId,
    requestedUnknownRole: definition.requestedUnknownRole,
    requiredCapabilityIds: definition.requiredCapabilityIds,
    applicationClassification: definition.applicationClassification,
    productAdmissionTask: "P03F_W3DirectProductVerticalSlice017Implementation",
    generatorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
    validatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
    globalContextAuthorityPath: null,
  });
}

function buildQuestion(patternSpecId, ordinal, seed) {
  const definition = getBatchABrowserPatternDefinition(patternSpecId);
  const fixtures = fixturesFor(patternSpecId);
  const fixture = fixtures[(ordinal + seedOffset(seed, fixtures.length)) % fixtures.length];
  const fractionType = classify(fixture);
  const answerText = LABEL_BY_TYPE[fractionType];
  const valueText = displayValue(fixture);
  const promptText = `${valueText} 是哪一種分數？請填「真分數」、「假分數」或「帶分數」。`;
  return Object.freeze({
    id: `${patternSpecId}-${ordinal + 1}`,
    sourceId: G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID,
    patternSpecId,
    kind: definition.kind,
    operation: definition.operation,
    operationFamilyId: definition.operationFamilyId,
    questionMode: "numeric",
    mode: "NUMERIC",
    promptText,
    questionText: promptText,
    blankedDisplayText: promptText,
    displayText: `${promptText} ${answerText}`,
    answerText,
    finalAnswer: answerText,
    whole: fixture.whole,
    numerator: fixture.numerator,
    denominator: fixture.denominator,
    fractionType,
    targetFractionType: definition.numericDomain.targetType,
    metadata: metadata(definition),
    globalContextProduction: null,
  });
}

export function canGenerateG4AU06FractionClassificationSlice017Questions(plan = {}) {
  return plan.sourceId === G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID
    && Array.isArray(plan.patternSpecIds)
    && plan.patternSpecIds.length > 0
    && plan.patternSpecIds.every((id) => ALL_IDS.has(id));
}

export function validateG4AU06FractionClassificationSlice017Question(question = {}) {
  const errors = [];
  const add = (code, path) => errors.push({ code, severity: "error", path, message: code });
  const id = question.patternSpecId ?? question.metadata?.patternId;
  const definition = getBatchABrowserPatternDefinition(id);
  if (!ALL_IDS.has(id) || !definition) add("p03f17_pattern_invalid", "patternSpecId");
  if (question.sourceId !== G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID || question.metadata?.sourceId !== G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID) add("p03f17_source_mismatch", "sourceId");
  if (![question.whole, question.numerator, question.denominator].every(Number.isSafeInteger) || question.whole < 0 || question.numerator <= 0 || question.denominator <= 0) add("p03f17_fraction_value_invalid", "fraction");
  const expectedType = classify(question);
  if (!expectedType || question.fractionType !== expectedType || question.targetFractionType !== expectedType) add("p03f17_fraction_classification_invalid", "fractionType");
  const expectedAnswer = LABEL_BY_TYPE[expectedType];
  if (!expectedAnswer || question.answerText !== expectedAnswer || question.finalAnswer !== expectedAnswer) add("p03f17_fraction_answer_invalid", "answerText");
  if (question.globalContextProduction != null || question.metadata?.globalContextAuthorityPath != null) add("p03f17_global_context_leak", "globalContextProduction");
  if (question.metadata?.knowledgePointId !== definition?.knowledgePointId || question.metadata?.patternGroupId !== definition?.patternGroupId) add("p03f17_lineage_mismatch", "metadata");
  if (!question.metadata?.requiredCapabilityIds?.includes("cap_fraction_domain_validator") || !question.metadata?.requiredCapabilityIds?.includes("cap_fraction_number_system")) add("p03f17_fraction_capability_missing", "metadata.requiredCapabilityIds");
  if (question.metadata?.requiredCapabilityIds?.includes("cap_fraction_arithmetic")) add("p03f17_arithmetic_capability_leak", "metadata.requiredCapabilityIds");
  if (definition?.numericDomain?.conversionRequired || definition?.numericDomain?.comparisonRequired || definition?.numericDomain?.numberLineRequired || definition?.numericDomain?.arithmeticRequired) add("p03f17_domain_expansion_invalid", "metadata");
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function generateG4AU06FractionClassificationSlice017Questions(options = {}) {
  const plan = buildBatchABrowserPlan(options);

  if (!canGenerateG4AU06FractionClassificationSlice017Questions(plan)) {
    return {
      ok: false,
      errors: [{
        code: "p03f17_plan_not_supported",
        severity: "error",
        path: "patternSpecIds",
        message: "p03f17_plan_not_supported",
      }],
      warnings: [],
      questions: [],
      plan,
    };
  }

  const count = Number.isInteger(plan.questionCount)
    ? plan.questionCount
    : 9;

  if (count < 1 || count > 240) {
    return Object.freeze({
      ok: false,
      errors: Object.freeze([{
        code: "p03f17_question_count_invalid",
        severity: "error",
        path: "questionCount",
        message: "p03f17_question_count_invalid",
      }]),
      warnings: Object.freeze([]),
      questions: Object.freeze([]),
      plan: Object.freeze(plan),
      allocation: Object.freeze([]),
    });
  }

  const ids = plan.patternSpecIds;

  // 每個 PatternSpec 使用自己的連續 ordinal：
  // 0、1、2、3……，不再使用全域 index 的 0、3、6、9……
  const occurrenceBySpec = new Map(
    ids.map((patternSpecId) => [patternSpecId, 0]),
  );

  const questions = Array.from({ length: count }, (_, index) => {
    const patternSpecId = ids[index % ids.length];
    const ordinal = occurrenceBySpec.get(patternSpecId) ?? 0;

    occurrenceBySpec.set(patternSpecId, ordinal + 1);

    return buildQuestion(
      patternSpecId,
      ordinal,
      plan.generationSeed,
    );
  });

  const validationErrors = questions.flatMap(
    (question, index) =>
      validateG4AU06FractionClassificationSlice017Question(question)
        .errors
        .map((error) => ({
          ...error,
          path: `questions[${index}].${error.path}`,
        })),
  );

  // 檢查整份題目是否有相同的題目文字。
  const uniquePromptCount = new Set(
    questions.map((question) => question.blankedDisplayText),
  ).size;

  if (uniquePromptCount !== questions.length) {
    validationErrors.push({
      code: "p03f17_duplicate_prompt_detected",
      severity: "error",
      path: "questions",
      message: "p03f17_duplicate_prompt_detected",
    });
  }

  const allocation = ids.map((patternSpecId) =>
    Object.freeze({
      patternSpecId,
      questionCount: questions.filter(
        (question) => question.patternSpecId === patternSpecId,
      ).length,
    }),
  );

  return Object.freeze({
    ok: validationErrors.length === 0,
    errors: Object.freeze(validationErrors),
    warnings: Object.freeze([]),
    questions: Object.freeze(questions),
    plan: Object.freeze(plan),
    allocation: Object.freeze(allocation),
  });
}
