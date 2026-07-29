import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f9.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f9-extension.js";
import {
  G3B_U09_SOURCE_ID,
  G3B_U09_TENTHS_FRACTION_DECIMAL_KP_ID,
  G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_GROUP_ID,
  G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_SPEC_ID,
} from "../registry/g3b-u09-tenths-fraction-decimal-selector-projection.js";

const NUMERATORS = Object.freeze([1, 2, 3, 4, 5, 6, 7, 8, 9]);
const SURFACE_VARIANTS = Object.freeze(["direct", "equivalence", "place_value"]); // PGC-R04 tenths conversion surface parameter space
const REQUIRED_CAPABILITY_IDS = Object.freeze(["cap_fraction_domain_validator", "cap_fraction_number_system"]);
function hashSeed(value) {
  let acc = 2166136261;
  for (const char of String(value ?? "p03f9")) { acc ^= char.charCodeAt(0); acc = Math.imul(acc, 16777619) >>> 0; }
  return acc || 1;
}
function metadata(definition, direction, numerator) {
  return Object.freeze({
    patternId: definition.patternSpecId,
    sourceId: definition.sourceId,
    patternTags: Object.freeze(["full_product_w3_slice009", definition.sourceId, definition.patternSpecId, direction]),
    skillTags: definition.skillTags,
    difficultyTags: definition.difficultyTags,
    curriculumNodeIds: Object.freeze([definition.sourceId]),
    canonicalSkillIds: definition.canonicalSkillIds,
    knowledgePointId: definition.knowledgePointId,
    patternGroupId: definition.patternGroupId,
    operationFamilyId: definition.operationFamilyId,
    requestedUnknownRole: definition.requestedUnknownRole,
    requiredCapabilityIds: REQUIRED_CAPABILITY_IDS,
    applicationClassification: "APPLICATION_NOT_APPLICABLE",
    conversionDirection: direction,
    sourceNumerator: numerator,
    sourceDenominator: 10,
    decimalScale: 1,
    productAdmissionTask: "P03F_W3DirectProductVerticalSlice009Implementation",
    generatorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
    validatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
  });
}
function buildQuestion(index, seed) {
  const definition = getBatchABrowserPatternDefinition(G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_SPEC_ID);
  const offset = hashSeed(seed) % (NUMERATORS.length * SURFACE_VARIANTS.length * 2);
  const variantIndex = (offset + index - 1) % (NUMERATORS.length * SURFACE_VARIANTS.length * 2);
  const numerator = NUMERATORS[variantIndex % NUMERATORS.length];
  const direction = Math.floor(variantIndex / NUMERATORS.length) % 2 === 0 ? "fraction_to_decimal" : "decimal_to_fraction";
  const surfaceVariant = SURFACE_VARIANTS[Math.floor(variantIndex / (NUMERATORS.length * 2)) % SURFACE_VARIANTS.length];
  const fractionText = numerator + "/10";
  const decimalText = "0." + numerator;
  const promptText = direction === "fraction_to_decimal"
    ? surfaceVariant === "direct" ? "把 " + fractionText + " 寫成一位小數。" : surfaceVariant === "equivalence" ? fractionText + " 和哪個一位小數表示相同的值？" : "十分位有 " + numerator + " 個 0.1，對應的小數是多少？"
    : surfaceVariant === "direct" ? decimalText + " 是十分之幾？請用分母 10 的分數表示。" : surfaceVariant === "equivalence" ? "哪個分母為 10 的分數和 " + decimalText + " 相等？" : decimalText + " 含有幾個十分之一？請寫成分數。";
  const answerText = direction === "fraction_to_decimal" ? decimalText : fractionText;
  return Object.freeze({
    id: `${G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_SPEC_ID}-${index}`,
    sourceId: G3B_U09_SOURCE_ID,
    patternSpecId: G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_SPEC_ID,
    kind: "g3bU09TenthsFractionDecimalConversion",
    operation: "fraction_decimal_conversion",
    operationFamilyId: "fraction_decimal_conversion",
    questionMode: "numeric",
    promptText,
    questionText: promptText,
    blankedDisplayText: promptText,
    displayText: `${promptText} ${answerText}`,
    answerText,
    conversionDirection: direction,
    sourceRepresentation: direction === "fraction_to_decimal" ? "fraction_denominator_10" : "one_decimal_place",
    targetRepresentation: direction === "fraction_to_decimal" ? "one_decimal_place" : "fraction_denominator_10",
    numerator,
    denominator: 10,
    fractionValue: Object.freeze({ numerator, denominator: 10 }),
    fractionText,
    decimalValue: decimalText,
    decimalScale: 1,
    finalAnswer: Object.freeze({
      representation: direction === "fraction_to_decimal" ? "decimal" : "fraction",
      text: answerText,
      numerator,
      denominator: 10,
      decimalText,
      exact: true,
    }),
    metadata: metadata(definition, direction, numerator),
  });
}
export function canGenerateG3BU09TenthsFractionDecimalQuestions(plan = {}) {
  return plan.sourceId === G3B_U09_SOURCE_ID
    && Array.isArray(plan.patternSpecIds)
    && plan.patternSpecIds.length === 1
    && plan.patternSpecIds[0] === G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_SPEC_ID;
}
export function validateG3BU09TenthsFractionDecimalQuestion(question = {}) {
  const errors = [];
  const add = (code, path) => errors.push({ code, severity: "error", path, message: code });
  if (question.sourceId !== G3B_U09_SOURCE_ID || question.metadata?.sourceId !== G3B_U09_SOURCE_ID) add("p03f9_source_mismatch", "sourceId");
  if (question.patternSpecId !== G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_SPEC_ID || question.metadata?.patternId !== G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_SPEC_ID) add("p03f9_pattern_mismatch", "patternSpecId");
  if (question.metadata?.knowledgePointId !== G3B_U09_TENTHS_FRACTION_DECIMAL_KP_ID) add("p03f9_kp_mismatch", "metadata.knowledgePointId");
  if (question.metadata?.patternGroupId !== G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_GROUP_ID) add("p03f9_group_mismatch", "metadata.patternGroupId");
  if (!Number.isInteger(question.numerator) || question.numerator < 1 || question.numerator > 9 || question.denominator !== 10) add("p03f9_fraction_domain_invalid", "fractionValue");
  if (question.decimalScale !== 1 || question.decimalValue !== `0.${question.numerator}` || question.fractionText !== `${question.numerator}/10`) add("p03f9_representation_identity_invalid", "decimalValue");
  if (!["fraction_to_decimal", "decimal_to_fraction"].includes(question.conversionDirection)) add("p03f9_direction_invalid", "conversionDirection");
  const expectedAnswer = question.conversionDirection === "fraction_to_decimal" ? question.decimalValue : question.fractionText;
  if (question.answerText !== expectedAnswer || question.finalAnswer?.text !== expectedAnswer || question.finalAnswer?.exact !== true) add("p03f9_answer_invalid", "answerText");
  if (question.finalAnswer?.numerator !== question.numerator || question.finalAnswer?.denominator !== 10 || question.finalAnswer?.decimalText !== question.decimalValue) add("p03f9_final_answer_identity_invalid", "finalAnswer");
  if (JSON.stringify(question.metadata?.requiredCapabilityIds) !== JSON.stringify(REQUIRED_CAPABILITY_IDS)) add("p03f9_capability_set_invalid", "metadata.requiredCapabilityIds");
  if (question.metadata?.applicationClassification !== "APPLICATION_NOT_APPLICABLE" || question.questionMode !== "numeric") add("p03f9_application_scope_violation", "questionMode");
  if (String(question.blankedDisplayText ?? "").match(/(?:算式|_{2,}|答\s*[:：]|\{\{)/)) add("p03f9_forbidden_surface_present", "blankedDisplayText");
  return { ok: errors.length === 0, errors, warnings: [] };
}
export function generateG3BU09TenthsFractionDecimalQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!canGenerateG3BU09TenthsFractionDecimalQuestions(plan)) return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "p03f9_plan_not_supported", severity: "error", path: "plan", message: "Slice009 accepts only the admitted tenths fraction-decimal PatternSpec." }], warnings: [] };
  if (!Number.isInteger(plan.questionCount) || plan.questionCount < 1 || plan.questionCount > NUMERATORS.length * SURFACE_VARIANTS.length * 2) return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "p03f9_question_count_invalid", severity: "error", path: "questionCount", message: "Slice009 supports one to eight bounded witnesses." }], warnings: [] };
  const questions = Array.from({ length: plan.questionCount }, (_, offset) => buildQuestion(offset + 1, plan.generationSeed));
  const errors = questions.flatMap((question) => validateG3BU09TenthsFractionDecimalQuestion(question).errors);
  if (new Set(questions.map((row) => row.blankedDisplayText)).size !== questions.length) errors.push({ code: "p03f9_duplicate_prompt_detected", severity: "error", path: "questions", message: "The worksheet contains duplicate prompts." });
  const directionCounts = Object.freeze({
    fraction_to_decimal: questions.filter((row) => row.conversionDirection === "fraction_to_decimal").length,
    decimal_to_fraction: questions.filter((row) => row.conversionDirection === "decimal_to_fraction").length,
  });
  return { ok: errors.length === 0 && questions.length === plan.questionCount, plan, questions, allocation: [{ patternSpecId: G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_SPEC_ID, questionCount: plan.questionCount }], directionCounts, errors, warnings: [] };
}
