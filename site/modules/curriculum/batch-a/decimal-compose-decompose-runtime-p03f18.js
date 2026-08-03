import {
  G4A_U09_DECIMAL_COMPOSE_SOURCE_ID,
  G4A_U09_DECIMAL_COMPOSE_KP_ID,
  G4A_U09_DECIMAL_COMPOSE_GROUP_ID,
  G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID,
} from "../registry/g4a-u09-decimal-compose-decompose-selector-projection.js";

const CAPABILITIES = Object.freeze(["cap_decimal_domain_validator", "cap_decimal_number_system"]);
const CASES = Object.freeze([
  [3, 4, 7], [5, 0, 8], [0, 6, 2], [8, 9, 0], [12, 3, 5], [24, 0, 9],
  [7, 1, 4], [16, 8, 3], [2, 5, 0], [31, 2, 6], [9, 0, 1], [45, 7, 8],
  [6, 3, 0], [18, 4, 2], [27, 0, 5], [40, 6, 9], [13, 1, 7], [22, 9, 4],
]);

function hashSeed(value) {
  let acc = 2166136261;
  for (const char of String(value ?? "p03f18")) { acc ^= char.charCodeAt(0); acc = Math.imul(acc, 16777619) >>> 0; }
  return acc || 1;
}
function canonicalDecimal(whole, tenths, hundredths) {
  return `${whole}.${tenths}${hundredths}`;
}
function buildQuestion(index, seed = "p03f18") {
  const offset = hashSeed(seed) % CASES.length;
  const [whole, tenths, hundredths] = CASES[(offset + index - 1) % CASES.length];
  const answerText = canonicalDecimal(whole, tenths, hundredths);
  const promptText = `${whole} 個一、${tenths} 個 0.1 和 ${hundredths} 個 0.01 合起來是多少？`;
  return Object.freeze({
    id: `${G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID}-${index}`,
    sourceId: G4A_U09_DECIMAL_COMPOSE_SOURCE_ID,
    patternSpecId: G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID,
    kind: "g4aU09DecimalComposeDecompose",
    operation: "decimal_representation",
    operationFamilyId: "decimal_representation",
    questionMode: "numeric",
    promptText,
    questionText: promptText,
    blankedDisplayText: promptText,
    displayText: `${promptText} ${answerText}`,
    answerText,
    whole,
    tenths,
    hundredths,
    decimalValue: answerText,
    finalAnswer: Object.freeze({ coefficient: String(whole * 100 + tenths * 10 + hundredths), scale: 2, canonicalText: answerText, exact: true }),
    metadata: Object.freeze({
      patternId: G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID,
      sourceId: G4A_U09_DECIMAL_COMPOSE_SOURCE_ID,
      patternTags: Object.freeze(["full_product_w3_slice018", "decimal_compose_decompose", G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID]),
      skillTags: Object.freeze(["decimal", "place_value", "compose_decompose", "hundredths"]),
      difficultyTags: Object.freeze(["two_decimal_places", "full_product_w3_slice018"]),
      curriculumNodeIds: Object.freeze([G4A_U09_DECIMAL_COMPOSE_SOURCE_ID]),
      canonicalSkillIds: Object.freeze([G4A_U09_DECIMAL_COMPOSE_KP_ID]),
      knowledgePointId: G4A_U09_DECIMAL_COMPOSE_KP_ID,
      patternGroupId: G4A_U09_DECIMAL_COMPOSE_GROUP_ID,
      operationFamilyId: "decimal_representation",
      requestedUnknownRole: "decimal",
      requiredCapabilityIds: CAPABILITIES,
      applicationClassification: "APPLICATION_NOT_APPLICABLE",
      decimalScale: 2,
      productAdmissionTask: "P03F_W3DirectProductVerticalSlice018Implementation",
      generatorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
      validatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
    }),
  });
}

export function canGenerateG4AU09DecimalComposeSlice018Questions(plan = {}) {
  return plan.sourceId === G4A_U09_DECIMAL_COMPOSE_SOURCE_ID
    && Array.isArray(plan.patternSpecIds)
    && plan.patternSpecIds.length === 1
    && plan.patternSpecIds[0] === G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID;
}

export function validateG4AU09DecimalComposeSlice018Question(question = {}) {
  const errors = [];
  const add = (code, path) => errors.push({ code, severity: "error", path, message: code });
  if (question.sourceId !== G4A_U09_DECIMAL_COMPOSE_SOURCE_ID || question.metadata?.sourceId !== G4A_U09_DECIMAL_COMPOSE_SOURCE_ID) add("p03f18_source_mismatch", "sourceId");
  if (question.patternSpecId !== G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID || question.metadata?.patternId !== G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID) add("p03f18_pattern_mismatch", "patternSpecId");
  if (question.metadata?.knowledgePointId !== G4A_U09_DECIMAL_COMPOSE_KP_ID) add("p03f18_kp_mismatch", "metadata.knowledgePointId");
  if (question.metadata?.patternGroupId !== G4A_U09_DECIMAL_COMPOSE_GROUP_ID) add("p03f18_group_mismatch", "metadata.patternGroupId");
  if (!Number.isInteger(question.whole) || question.whole < 0 || !Number.isInteger(question.tenths) || question.tenths < 0 || question.tenths > 9 || !Number.isInteger(question.hundredths) || question.hundredths < 0 || question.hundredths > 9) add("p03f18_place_value_digits_invalid", "whole");
  const expected = canonicalDecimal(question.whole, question.tenths, question.hundredths);
  if (question.decimalValue !== expected || question.answerText !== expected) add("p03f18_decimal_answer_invalid", "answerText");
  const coefficient = String(question.whole * 100 + question.tenths * 10 + question.hundredths);
  if (question.finalAnswer?.coefficient !== coefficient || question.finalAnswer?.scale !== 2 || question.finalAnswer?.canonicalText !== expected || question.finalAnswer?.exact !== true) add("p03f18_canonical_decimal_identity_invalid", "finalAnswer");
  if (JSON.stringify(question.metadata?.requiredCapabilityIds) !== JSON.stringify(CAPABILITIES)) add("p03f18_capability_set_invalid", "metadata.requiredCapabilityIds");
  if (question.metadata?.applicationClassification !== "APPLICATION_NOT_APPLICABLE" || question.questionMode !== "numeric") add("p03f18_application_scope_violation", "questionMode");
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function generateG4AU09DecimalComposeSlice018Questions(options = {}) {
  const questionCount = Number(options.questionCount ?? 8);
  const generationSeed = String(options.generationSeed ?? "p03f18");
  const plan = options.plan ?? { sourceId: options.sourceId, patternSpecIds: options.patternSpecIds, questionCount, generationSeed };
  if (!canGenerateG4AU09DecimalComposeSlice018Questions(plan)) return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "p03f18_plan_not_supported", severity: "error", path: "plan", message: "Slice018 accepts only the admitted G4A-U09 decimal compose/decompose PatternSpec." }], warnings: [] };
  if (!Number.isInteger(questionCount) || questionCount <= 0 || questionCount > CASES.length) return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "p03f18_question_count_invalid", severity: "error", path: "questionCount", message: "Question count must be between 1 and 18." }], warnings: [] };
  const questions = Array.from({ length: questionCount }, (_, offset) => buildQuestion(offset + 1, generationSeed));
  const errors = questions.flatMap((question) => validateG4AU09DecimalComposeSlice018Question(question).errors);
  if (new Set(questions.map((row) => row.blankedDisplayText)).size !== questions.length) errors.push({ code: "p03f18_duplicate_prompt_detected", severity: "error", path: "questions", message: "Duplicate prompts are forbidden." });
  return { ok: errors.length === 0, plan, questions, allocation: [{ patternSpecId: G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID, questionCount }], errors, warnings: [] };
}
