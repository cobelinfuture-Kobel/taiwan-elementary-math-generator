import { buildBatchABrowserPlan } from "./batch-a-browser-generator.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f4-extension.js";
import {
  G3B_U09_SOURCE_ID,
  G3B_U09_TENTH_DECIMAL_KP_ID,
  G3B_U09_TENTH_DECIMAL_PATTERN_GROUP_ID,
  G3B_U09_TENTH_DECIMAL_PATTERN_SPEC_ID,
} from "../registry/g3b-u09-tenth-decimal-selector-projection.js";

const PROMPTS = Object.freeze([
  "把 1 平分成 10 份，其中 1 份用小數表示是多少？",
  "1 的十分之一用小數表示是多少？",
  "十等份中的 1 份，用小數表示是多少？",
  "0 個一和 1 個 0.1 合起來是多少？",
  "在十分位上放 1，個位放 0，這個小數是多少？",
  "1 個十分之一寫成小數是多少？",
  "哪個小數表示把 1 平分成 10 份後的 1 份？",
  "用小數記下「一個 0.1」的值。",
]);

function hashSeed(value) {
  let acc = 2166136261;
  for (const char of String(value ?? "p03f4")) { acc ^= char.charCodeAt(0); acc = Math.imul(acc, 16777619) >>> 0; }
  return acc || 1;
}
function metadata(definition) {
  return Object.freeze({
    patternId: definition.patternSpecId,
    sourceId: definition.sourceId,
    patternTags: Object.freeze(["full_product_w3_slice004", definition.sourceId, definition.patternSpecId]),
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
    decimalScale: 1,
    canonicalDecimalIdentity: "1e-1",
    productAdmissionTask: "P03F_W3DirectProductVerticalSlice004Implementation",
    generatorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
    validatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
  });
}
function buildQuestion(index, seed) {
  const definition = getBatchABrowserPatternDefinition(G3B_U09_TENTH_DECIMAL_PATTERN_SPEC_ID);
  const offset = hashSeed(seed) % PROMPTS.length;
  const promptText = PROMPTS[(offset + index - 1) % PROMPTS.length];
  const answerText = "0.1";
  return Object.freeze({
    id: `${G3B_U09_TENTH_DECIMAL_PATTERN_SPEC_ID}-${index}`,
    sourceId: G3B_U09_SOURCE_ID,
    patternSpecId: G3B_U09_TENTH_DECIMAL_PATTERN_SPEC_ID,
    kind: "g3bU09TenthDecimalRepresentation",
    operation: "decimal_representation",
    operationFamilyId: "decimal_representation",
    questionMode: "numeric",
    promptText,
    questionText: promptText,
    blankedDisplayText: promptText,
    displayText: `${promptText} ${answerText}`,
    answerText,
    whole: 0,
    fractionalUnits: 1,
    placeUnit: "0.1",
    decimalValue: "0.1",
    finalAnswer: Object.freeze({ coefficient: "1", scale: 1, canonicalText: "0.1", exact: true }),
    metadata: metadata(definition),
  });
}

export function canGenerateG3BU09TenthDecimalQuestions(plan = {}) {
  return plan.sourceId === G3B_U09_SOURCE_ID
    && Array.isArray(plan.patternSpecIds)
    && plan.patternSpecIds.length === 1
    && plan.patternSpecIds[0] === G3B_U09_TENTH_DECIMAL_PATTERN_SPEC_ID;
}
export function validateG3BU09TenthDecimalQuestion(question = {}) {
  const errors = [];
  const add = (code, path) => errors.push({ code, severity: "error", path, message: code });
  if (question.sourceId !== G3B_U09_SOURCE_ID || question.metadata?.sourceId !== G3B_U09_SOURCE_ID) add("p03f4_source_mismatch", "sourceId");
  if (question.patternSpecId !== G3B_U09_TENTH_DECIMAL_PATTERN_SPEC_ID || question.metadata?.patternId !== G3B_U09_TENTH_DECIMAL_PATTERN_SPEC_ID) add("p03f4_pattern_mismatch", "patternSpecId");
  if (question.metadata?.knowledgePointId !== G3B_U09_TENTH_DECIMAL_KP_ID) add("p03f4_kp_mismatch", "metadata.knowledgePointId");
  if (question.metadata?.patternGroupId !== G3B_U09_TENTH_DECIMAL_PATTERN_GROUP_ID) add("p03f4_group_mismatch", "metadata.patternGroupId");
  if (question.whole !== 0 || question.fractionalUnits !== 1 || question.placeUnit !== "0.1") add("p03f4_place_value_roles_invalid", "whole");
  if (question.decimalValue !== "0.1" || question.answerText !== "0.1") add("p03f4_decimal_answer_invalid", "answerText");
  if (question.finalAnswer?.coefficient !== "1" || question.finalAnswer?.scale !== 1 || question.finalAnswer?.canonicalText !== "0.1" || question.finalAnswer?.exact !== true) add("p03f4_canonical_decimal_identity_invalid", "finalAnswer");
  const expectedCapabilities = ["cap_decimal_domain_validator", "cap_decimal_number_system"];
  if (JSON.stringify(question.metadata?.requiredCapabilityIds) !== JSON.stringify(expectedCapabilities)) add("p03f4_capability_set_invalid", "metadata.requiredCapabilityIds");
  if (question.metadata?.applicationClassification !== "APPLICATION_NOT_APPLICABLE" || question.questionMode !== "numeric") add("p03f4_application_scope_violation", "questionMode");
  if (String(question.blankedDisplayText ?? "").match(/(?:算式|_{2,}|答\s*[:：]|\{\{)/)) add("p03f4_forbidden_surface_present", "blankedDisplayText");
  return { ok: errors.length === 0, errors, warnings: [] };
}
export function generateG3BU09TenthDecimalQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!canGenerateG3BU09TenthDecimalQuestions(plan)) return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "p03f4_plan_not_supported", severity: "error", path: "plan", message: "Slice004 accepts only the admitted tenth-decimal PatternSpec." }], warnings: [] };
  if (plan.questionCount > PROMPTS.length) return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "p03f4_question_count_exceeds_unique_witnesses", severity: "error", path: "questionCount", message: "Slice004 provides at most eight unique bounded witnesses." }], warnings: [] };
  const questions = Array.from({ length: plan.questionCount }, (_, offset) => buildQuestion(offset + 1, plan.generationSeed));
  const promptSet = new Set(questions.map((row) => row.blankedDisplayText));
  const errors = questions.flatMap((question) => validateG3BU09TenthDecimalQuestion(question).errors);
  if (promptSet.size !== questions.length) errors.push({ code: "p03f4_duplicate_prompt_detected", severity: "error", path: "questions", message: "The worksheet contains duplicate prompts." });
  return { ok: errors.length === 0 && questions.length === plan.questionCount, plan, questions, allocation: [{ patternSpecId: G3B_U09_TENTH_DECIMAL_PATTERN_SPEC_ID, questionCount: plan.questionCount }], errors, warnings: [] };
}
