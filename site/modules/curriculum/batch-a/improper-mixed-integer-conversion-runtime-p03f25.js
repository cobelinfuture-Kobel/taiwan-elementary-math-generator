import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f25.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f25-extension.js";
import { G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID } from "../registry/g4a-u06-fraction-type-classification-selector-projection.js";
import { G4A_U06_P03F25_PATTERN_SPEC_IDS } from "../registry/g4a-u06-improper-mixed-conversion-selector-projection-p03f25.js";

const ALL_IDS = new Set(G4A_U06_P03F25_PATTERN_SPEC_IDS);
const seedOffset = (seed, size) => [...String(seed ?? "p03f25")].reduce((sum, char) => (sum + char.charCodeAt(0)) % size, 0);

function fixtureFor(patternSpecId, ordinal, seed) {
  const definition = getBatchABrowserPatternDefinition(patternSpecId);
  const direction = definition?.numericDomain?.conversionDirection;
  const denominator = 2 + ((ordinal + seedOffset(seed, 8)) % 8);
  const whole = 1 + ((ordinal * 2 + seedOffset(seed, 6)) % 6);
  if (direction === "integer_to_improper_fraction") {
    return { whole, denominator, remainder: 0, improperNumerator: whole * denominator };
  }
  if (direction === "improper_to_mixed_or_integer") {
    const makeInteger = (ordinal + seedOffset(seed, 3)) % 3 === 0;
    const remainder = makeInteger ? 0 : 1 + ((ordinal * 3 + seedOffset(seed, denominator - 1)) % (denominator - 1));
    return { whole, denominator, remainder, improperNumerator: whole * denominator + remainder };
  }
  const remainder = 1 + ((ordinal * 3 + seedOffset(seed, denominator - 1)) % (denominator - 1));
  return { whole, denominator, remainder, improperNumerator: whole * denominator + remainder };
}

function mixedText({ whole, remainder, denominator }) {
  return remainder === 0 ? `${whole}` : `${whole} ${remainder}/${denominator}`;
}
function improperText({ improperNumerator, denominator }) { return `${improperNumerator}/${denominator}`; }

function metadata(definition) {
  return Object.freeze({
    patternId: definition.patternSpecId,
    sourceId: G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID,
    patternTags: Object.freeze(["full_product_w3_slice025", definition.patternSpecId]),
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
    productAdmissionTask: "P03F_W3DirectProductVerticalSlice025Implementation",
    generatorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
    validatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
    globalContextAuthorityPath: null,
  });
}

function buildQuestion(patternSpecId, ordinal, seed) {
  const definition = getBatchABrowserPatternDefinition(patternSpecId);
  const fixture = fixtureFor(patternSpecId, ordinal, seed);
  const direction = definition.numericDomain.conversionDirection;
  let promptText;
  let answerText;
  if (direction === "improper_to_mixed_or_integer") {
    promptText = `把 ${improperText(fixture)} 改寫成帶分數或整數。`;
    answerText = mixedText(fixture);
  } else if (direction === "mixed_to_improper_fraction") {
    promptText = `把 ${mixedText(fixture)} 改寫成假分數。`;
    answerText = improperText(fixture);
  } else {
    promptText = `把整數 ${fixture.whole} 改寫成分母為 ${fixture.denominator} 的假分數。`;
    answerText = improperText(fixture);
  }
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
    numerator: fixture.improperNumerator,
    improperNumerator: fixture.improperNumerator,
    remainder: fixture.remainder,
    denominator: fixture.denominator,
    conversionDirection: direction,
    metadata: metadata(definition),
    globalContextProduction: null,
  });
}

export function canGenerateG4AU06P03F25Questions(plan = {}) {
  return plan.sourceId === G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID
    && Array.isArray(plan.patternSpecIds)
    && plan.patternSpecIds.length > 0
    && plan.patternSpecIds.every((id) => ALL_IDS.has(id));
}

export function validateG4AU06P03F25Question(question = {}) {
  const errors = [];
  const add = (code, path) => errors.push({ code, severity: "error", path, message: code });
  const id = question.patternSpecId ?? question.metadata?.patternId;
  const definition = getBatchABrowserPatternDefinition(id);
  if (!ALL_IDS.has(id) || !definition) add("p03f25_pattern_invalid", "patternSpecId");
  if (question.sourceId !== G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID || question.metadata?.sourceId !== G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID) add("p03f25_source_mismatch", "sourceId");
  if (![question.whole, question.improperNumerator, question.remainder, question.denominator].every(Number.isSafeInteger)) add("p03f25_fraction_value_invalid", "fraction");
  if (question.denominator <= 0 || question.whole < 1 || question.remainder < 0 || question.remainder >= question.denominator) add("p03f25_fraction_domain_invalid", "fraction");
  if (question.improperNumerator !== question.whole * question.denominator + question.remainder) add("p03f25_conversion_identity_invalid", "improperNumerator");
  const direction = definition?.numericDomain?.conversionDirection;
  if (question.conversionDirection !== direction) add("p03f25_conversion_direction_invalid", "conversionDirection");
  const expectedAnswer = direction === "improper_to_mixed_or_integer" ? mixedText(question) : improperText(question);
  if (question.answerText !== expectedAnswer || question.finalAnswer !== expectedAnswer) add("p03f25_answer_invalid", "answerText");
  if (direction === "mixed_to_improper_fraction" && question.remainder === 0) add("p03f25_mixed_remainder_required", "remainder");
  if (direction === "integer_to_improper_fraction" && question.remainder !== 0) add("p03f25_integer_remainder_must_be_zero", "remainder");
  if (question.globalContextProduction != null || question.metadata?.globalContextAuthorityPath != null) add("p03f25_global_context_leak", "globalContextProduction");
  if (question.metadata?.knowledgePointId !== definition?.knowledgePointId || question.metadata?.patternGroupId !== definition?.patternGroupId) add("p03f25_lineage_mismatch", "metadata");
  if (!question.metadata?.requiredCapabilityIds?.includes("cap_fraction_domain_validator") || !question.metadata?.requiredCapabilityIds?.includes("cap_fraction_number_system")) add("p03f25_fraction_capability_missing", "metadata.requiredCapabilityIds");
  if (question.metadata?.requiredCapabilityIds?.includes("cap_fraction_arithmetic")) add("p03f25_arithmetic_capability_leak", "metadata.requiredCapabilityIds");
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function generateG4AU06P03F25Questions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!canGenerateG4AU06P03F25Questions(plan)) return { ok: false, errors: [{ code: "p03f25_plan_not_supported", severity: "error", path: "patternSpecIds", message: "p03f25_plan_not_supported" }], warnings: [], questions: [], plan };
  const count = Number.isInteger(plan.questionCount) ? plan.questionCount : 9;
  const ids = plan.patternSpecIds;
  const occurrenceBySpec = new Map(ids.map((patternSpecId) => [patternSpecId, 0]));
  const questions = Array.from({ length: count }, (_, index) => {
    const patternSpecId = ids[index % ids.length];
    const ordinal = occurrenceBySpec.get(patternSpecId) ?? 0;
    occurrenceBySpec.set(patternSpecId, ordinal + 1);
    return buildQuestion(patternSpecId, ordinal, plan.generationSeed);
  });
  const validationErrors = questions.flatMap((question, index) => validateG4AU06P03F25Question(question).errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` })));
  const allocation = ids.map((patternSpecId) => Object.freeze({ patternSpecId, questionCount: questions.filter((q) => q.patternSpecId === patternSpecId).length }));
  return Object.freeze({ ok: validationErrors.length === 0, errors: Object.freeze(validationErrors), warnings: Object.freeze([]), questions: Object.freeze(questions), plan: Object.freeze(plan), allocation: Object.freeze(allocation) });
}
