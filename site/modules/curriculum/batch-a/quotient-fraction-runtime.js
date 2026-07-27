import { buildBatchABrowserPlan } from "./batch-a-browser-generator.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f3-extension.js";
import {
  G3B_U07_SOURCE_ID,
  G3B_U07_QUOTIENT_FRACTION_KP_ID,
  G3B_U07_QUOTIENT_FRACTION_PATTERN_GROUP_ID,
  G3B_U07_QUOTIENT_FRACTION_PATTERN_SPEC_ID,
} from "../registry/g3b-u07-quotient-fraction-selector-projection.js";

const PAIRS = Object.freeze([
  Object.freeze([1, 2]), Object.freeze([2, 3]), Object.freeze([3, 4]), Object.freeze([4, 5]),
  Object.freeze([5, 6]), Object.freeze([7, 8]), Object.freeze([8, 3]), Object.freeze([9, 4]),
  Object.freeze([10, 3]), Object.freeze([11, 5]), Object.freeze([12, 5]), Object.freeze([12, 7]),
]);
const gcd = (a, b) => { let x = Math.abs(a); let y = Math.abs(b); while (y) [x, y] = [y, x % y]; return x || 1; };
function hashSeed(value) {
  let acc = 2166136261;
  for (const char of String(value ?? "p03f3")) { acc ^= char.charCodeAt(0); acc = Math.imul(acc, 16777619) >>> 0; }
  return acc || 1;
}
function magnitudeClass(dividend, divisor) {
  if (dividend < divisor) return "PROPER_FRACTION";
  if (dividend % divisor === 0) return "WHOLE_NUMBER";
  return "IMPROPER_FRACTION";
}
function metadata(definition, dividend, divisor) {
  return Object.freeze({
    patternId: definition.patternSpecId,
    sourceId: definition.sourceId,
    patternTags: Object.freeze(["full_product_w3_slice003", definition.sourceId, definition.patternSpecId]),
    skillTags: definition.skillTags,
    difficultyTags: definition.difficultyTags,
    curriculumNodeIds: Object.freeze([definition.sourceId]),
    canonicalSkillIds: definition.canonicalSkillIds,
    knowledgePointId: definition.knowledgePointId,
    patternGroupId: definition.patternGroupId,
    operationFamilyId: definition.operationFamilyId,
    requestedUnknownRole: definition.requestedUnknownRole,
    requiredCapabilityIds: definition.requiredCapabilityIds,
    applicationClassification: "APPLICATION_NOT_APPLICABLE",
    magnitudeClass: magnitudeClass(dividend, divisor),
    productAdmissionTask: "P03F_W3DirectProductVerticalSlice003Implementation",
    generatorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
    validatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
  });
}
function buildQuestion(index, seed) {
  const definition = getBatchABrowserPatternDefinition(G3B_U07_QUOTIENT_FRACTION_PATTERN_SPEC_ID);
  const offset = hashSeed(seed) % PAIRS.length;
  const [dividend, divisor] = PAIRS[(offset + index - 1) % PAIRS.length];
  const commonDivisor = gcd(dividend, divisor);
  const simplified = Object.freeze({ numerator: dividend / commonDivisor, denominator: divisor / commonDivisor });
  const promptText = `把 ${dividend} ÷ ${divisor} 的商用分數表示。`;
  const answerText = `${dividend}/${divisor}`;
  return Object.freeze({
    id: `${G3B_U07_QUOTIENT_FRACTION_PATTERN_SPEC_ID}-${index}`,
    sourceId: G3B_U07_SOURCE_ID,
    patternSpecId: G3B_U07_QUOTIENT_FRACTION_PATTERN_SPEC_ID,
    kind: "g3bU07QuotientAsFraction",
    operation: "quotient_fraction",
    operationFamilyId: "quotient_fraction",
    questionMode: "numeric",
    promptText,
    questionText: promptText,
    blankedDisplayText: promptText,
    displayText: `${promptText} ${answerText}`,
    answerText,
    dividend,
    divisor,
    finalAnswer: Object.freeze({ numerator: dividend, denominator: divisor, simplified }),
    metadata: metadata(definition, dividend, divisor),
  });
}

export function canGenerateG3BU07QuotientFractionQuestions(plan = {}) {
  return plan.sourceId === G3B_U07_SOURCE_ID
    && Array.isArray(plan.patternSpecIds)
    && plan.patternSpecIds.length === 1
    && plan.patternSpecIds[0] === G3B_U07_QUOTIENT_FRACTION_PATTERN_SPEC_ID;
}
export function validateG3BU07QuotientFractionQuestion(question = {}) {
  const errors = [];
  const add = (code, path) => errors.push({ code, severity: "error", path, message: code });
  if (question.sourceId !== G3B_U07_SOURCE_ID || question.metadata?.sourceId !== G3B_U07_SOURCE_ID) add("p03f3_source_mismatch", "sourceId");
  if (question.patternSpecId !== G3B_U07_QUOTIENT_FRACTION_PATTERN_SPEC_ID || question.metadata?.patternId !== G3B_U07_QUOTIENT_FRACTION_PATTERN_SPEC_ID) add("p03f3_pattern_mismatch", "patternSpecId");
  if (question.metadata?.knowledgePointId !== G3B_U07_QUOTIENT_FRACTION_KP_ID) add("p03f3_kp_mismatch", "metadata.knowledgePointId");
  if (question.metadata?.patternGroupId !== G3B_U07_QUOTIENT_FRACTION_PATTERN_GROUP_ID) add("p03f3_group_mismatch", "metadata.patternGroupId");
  if (!Number.isSafeInteger(question.dividend) || question.dividend <= 0 || question.dividend > 12) add("p03f3_dividend_invalid", "dividend");
  if (!Number.isSafeInteger(question.divisor) || question.divisor <= 1 || question.divisor > 12) add("p03f3_divisor_invalid", "divisor");
  const expected = `${question.dividend}/${question.divisor}`;
  if (question.answerText !== expected) add("p03f3_answer_invalid", "answerText");
  if (question.finalAnswer?.numerator !== question.dividend || question.finalAnswer?.denominator !== question.divisor) add("p03f3_ordered_fraction_identity_invalid", "finalAnswer");
  const commonDivisor = gcd(question.dividend, question.divisor);
  if (question.finalAnswer?.simplified?.numerator !== question.dividend / commonDivisor || question.finalAnswer?.simplified?.denominator !== question.divisor / commonDivisor) add("p03f3_simplified_identity_invalid", "finalAnswer.simplified");
  if (question.metadata?.applicationClassification !== "APPLICATION_NOT_APPLICABLE" || question.questionMode !== "numeric") add("p03f3_application_scope_violation", "questionMode");
  if (String(question.blankedDisplayText ?? "").match(/(?:算式|_{2,}|答\s*[:：]|\{\{)/)) add("p03f3_forbidden_surface_present", "blankedDisplayText");
  return { ok: errors.length === 0, errors, warnings: [] };
}
export function generateG3BU07QuotientFractionQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!canGenerateG3BU07QuotientFractionQuestions(plan)) return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "p03f3_plan_not_supported", severity: "error", path: "plan", message: "Slice003 accepts only the admitted quotient-as-fraction PatternSpec." }], warnings: [] };
  const questions = Array.from({ length: plan.questionCount }, (_, offset) => buildQuestion(offset + 1, plan.generationSeed));
  const promptSet = new Set(questions.map((row) => row.blankedDisplayText));
  const errors = questions.flatMap((question) => validateG3BU07QuotientFractionQuestion(question).errors);
  if (promptSet.size !== questions.length) errors.push({ code: "p03f3_duplicate_prompt_detected", severity: "error", path: "questions", message: "The worksheet contains duplicate prompts." });
  return { ok: errors.length === 0 && questions.length === plan.questionCount, plan, questions, allocation: [{ patternSpecId: G3B_U07_QUOTIENT_FRACTION_PATTERN_SPEC_ID, questionCount: plan.questionCount }], errors, warnings: [] };
}
