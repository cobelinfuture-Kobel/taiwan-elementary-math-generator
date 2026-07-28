import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f10.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f10-extension.js";
import {
  G4A_U09_SOURCE_ID,
  G4A_U09_HUNDREDTH_DECIMAL_KP_ID,
  G4A_U09_HUNDREDTH_DECIMAL_PATTERN_GROUP_ID,
  G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID,
} from "../registry/g4a-u09-hundredth-decimal-selector-projection.js";

const PROMPTS = Object.freeze([
  "把 1 平分成 100 份，其中 1 份用小數表示是多少？",
  "1 的百分之一用小數表示是多少？",
  "一百等份中的 1 份，用小數表示是多少？",
  "0 個一、0 個 0.1 和 1 個 0.01 合起來是多少？",
  "在百分位上放 1，十分位和個位都放 0，這個小數是多少？",
  "1 個百分之一寫成小數是多少？",
  "哪個小數表示把 1 平分成 100 份後的 1 份？",
  "用小數記下「一個 0.01」的值。",
]);

function hashSeed(value) {
  let acc = 2166136261;
  for (const char of String(value ?? "p03f10")) { acc ^= char.charCodeAt(0); acc = Math.imul(acc, 16777619) >>> 0; }
  return acc || 1;
}
function metadata(definition) {
  return Object.freeze({
    patternId: definition.patternSpecId,
    sourceId: definition.sourceId,
    patternTags: Object.freeze(["full_product_w3_slice010", definition.sourceId, definition.patternSpecId]),
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
    decimalScale: 2,
    canonicalDecimalIdentity: "1e-2",
    productAdmissionTask: "P03F_W3DirectProductVerticalSlice010Implementation",
    generatorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
    validatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
  });
}
function buildQuestion(index, seed) {
  const definition = getBatchABrowserPatternDefinition(G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID);
  const offset = hashSeed(seed) % PROMPTS.length;
  const promptText = PROMPTS[(offset + index - 1) % PROMPTS.length];
  const answerText = "0.01";
  return Object.freeze({
    id: `${G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID}-${index}`,
    sourceId: G4A_U09_SOURCE_ID,
    patternSpecId: G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID,
    kind: "g4aU09HundredthDecimalRepresentation",
    operation: "decimal_representation",
    operationFamilyId: "decimal_representation",
    questionMode: "numeric",
    promptText,
    questionText: promptText,
    blankedDisplayText: promptText,
    displayText: `${promptText} ${answerText}`,
    answerText,
    whole: 0,
    tenths: 0,
    hundredths: 1,
    placeUnit: "0.01",
    decimalValue: "0.01",
    finalAnswer: Object.freeze({ coefficient: "1", scale: 2, canonicalText: "0.01", exact: true }),
    metadata: metadata(definition),
  });
}

export function canGenerateG4AU09HundredthDecimalQuestions(plan = {}) {
  return plan.sourceId === G4A_U09_SOURCE_ID
    && Array.isArray(plan.patternSpecIds)
    && plan.patternSpecIds.length === 1
    && plan.patternSpecIds[0] === G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID;
}
export function validateG4AU09HundredthDecimalQuestion(question = {}) {
  const errors = [];
  const add = (code, path) => errors.push({ code, severity: "error", path, message: code });
  if (question.sourceId !== G4A_U09_SOURCE_ID || question.metadata?.sourceId !== G4A_U09_SOURCE_ID) add("p03f10_source_mismatch", "sourceId");
  if (question.patternSpecId !== G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID || question.metadata?.patternId !== G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID) add("p03f10_pattern_mismatch", "patternSpecId");
  if (question.metadata?.knowledgePointId !== G4A_U09_HUNDREDTH_DECIMAL_KP_ID) add("p03f10_kp_mismatch", "metadata.knowledgePointId");
  if (question.metadata?.patternGroupId !== G4A_U09_HUNDREDTH_DECIMAL_PATTERN_GROUP_ID) add("p03f10_group_mismatch", "metadata.patternGroupId");
  if (question.whole !== 0 || question.tenths !== 0 || question.hundredths !== 1 || question.placeUnit !== "0.01") add("p03f10_place_value_roles_invalid", "whole");
  if (question.decimalValue !== "0.01" || question.answerText !== "0.01") add("p03f10_decimal_answer_invalid", "answerText");
  if (question.finalAnswer?.coefficient !== "1" || question.finalAnswer?.scale !== 2 || question.finalAnswer?.canonicalText !== "0.01" || question.finalAnswer?.exact !== true) add("p03f10_canonical_decimal_identity_invalid", "finalAnswer");
  const expectedCapabilities = ["cap_decimal_domain_validator", "cap_decimal_number_system"];
  if (JSON.stringify(question.metadata?.requiredCapabilityIds) !== JSON.stringify(expectedCapabilities)) add("p03f10_capability_set_invalid", "metadata.requiredCapabilityIds");
  if (question.metadata?.applicationClassification !== "APPLICATION_NOT_APPLICABLE" || question.questionMode !== "numeric") add("p03f10_application_scope_violation", "questionMode");
  if (String(question.blankedDisplayText ?? "").match(/(?:算式|_{2,}|答\s*[:：]|\{\{)/)) add("p03f10_forbidden_surface_present", "blankedDisplayText");
  return { ok: errors.length === 0, errors, warnings: [] };
}
export function generateG4AU09HundredthDecimalQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!canGenerateG4AU09HundredthDecimalQuestions(plan)) return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "p03f10_plan_not_supported", severity: "error", path: "plan", message: "Slice010 accepts only the admitted hundredth-decimal PatternSpec." }], warnings: [] };
  if (plan.questionCount > PROMPTS.length) return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "p03f10_question_count_exceeds_unique_witnesses", severity: "error", path: "questionCount", message: "Slice010 provides at most eight unique bounded witnesses." }], warnings: [] };
  const questions = Array.from({ length: plan.questionCount }, (_, offset) => buildQuestion(offset + 1, plan.generationSeed));
  const promptSet = new Set(questions.map((row) => row.blankedDisplayText));
  const errors = questions.flatMap((question) => validateG4AU09HundredthDecimalQuestion(question).errors);
  if (promptSet.size !== questions.length) errors.push({ code: "p03f10_duplicate_prompt_detected", severity: "error", path: "questions", message: "The worksheet contains duplicate prompts." });
  return { ok: errors.length === 0 && questions.length === plan.questionCount, plan, questions, allocation: [{ patternSpecId: G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID, questionCount: plan.questionCount }], errors, warnings: [] };
}
