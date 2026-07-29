import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f8.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f8-extension.js";
import {
  G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KP_ID,
  G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_GROUP_ID,
  G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_SPEC_ID,
  G3B_U09_SOURCE_ID,
} from "../registry/g3b-u09-decimal-compose-decompose-selector-projection.js";

function buildComposeWitnesses() {
  const rows = [];
  const templates = [
    (whole, fraction) => whole + " 個一和 " + fraction + " 個 0.1 合起來是多少？",
    (whole, fraction) => "個位有 " + whole + "，十分位有 " + fraction + "，這個小數是多少？",
    (whole, fraction) => whole + " + " + fraction + " × 0.1 所組成的小數是多少？",
  ];
  for (let whole = 0; whole <= 9; whole += 1) {
    for (let fractionalUnits = 1; fractionalUnits <= 9; fractionalUnits += 1) {
      for (const template of templates) rows.push(Object.freeze({ whole, fractionalUnits, prompt: template(whole, fractionalUnits) }));
    }
  }
  return rows;
}
const WITNESSES = Object.freeze(buildComposeWitnesses()); // PGC-R04 decimal compose parameter space

function hashSeed(value) {
  let acc = 2166136261;
  for (const char of String(value ?? "p03f8")) {
    acc ^= char.charCodeAt(0);
    acc = Math.imul(acc, 16777619) >>> 0;
  }
  return acc || 1;
}
function canonicalText(whole, fractionalUnits) { return `${whole}.${fractionalUnits}`; }
function metadata(definition, coefficient) {
  return Object.freeze({
    patternId: definition.patternSpecId,
    sourceId: definition.sourceId,
    patternTags: Object.freeze(["full_product_w3_slice008", definition.sourceId, definition.patternSpecId]),
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
    canonicalDecimalIdentity: `${coefficient}e-1`,
    productAdmissionTask: "P03F_W3DirectProductVerticalSlice008Implementation",
    generatorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
    validatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
  });
}
function buildQuestion(index, seed) {
  const definition = getBatchABrowserPatternDefinition(G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_SPEC_ID);
  const row = WITNESSES[(hashSeed(seed) + index - 1) % WITNESSES.length];
  const answerText = canonicalText(row.whole, row.fractionalUnits);
  const coefficient = row.whole * 10 + row.fractionalUnits;
  return Object.freeze({
    id: `${G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_SPEC_ID}-${index}`,
    sourceId: G3B_U09_SOURCE_ID,
    patternSpecId: G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_SPEC_ID,
    kind: "g3bU09DecimalComposeDecompose",
    operation: "decimal_representation",
    operationFamilyId: "decimal_representation",
    questionMode: "numeric",
    promptText: row.prompt,
    questionText: row.prompt,
    blankedDisplayText: row.prompt,
    displayText: `${row.prompt} ${answerText}`,
    answerText,
    whole: row.whole,
    fractionalUnits: row.fractionalUnits,
    placeUnit: "0.1",
    decimalValue: answerText,
    expandedDecimalText: `${row.whole} + ${row.fractionalUnits} × 0.1`,
    finalAnswer: Object.freeze({ coefficient: String(coefficient), scale: 1, canonicalText: answerText, exact: true }),
    metadata: metadata(definition, coefficient),
  });
}

export function canGenerateG3BU09DecimalComposeDecomposeQuestions(plan = {}) {
  return plan.sourceId === G3B_U09_SOURCE_ID
    && Array.isArray(plan.patternSpecIds)
    && plan.patternSpecIds.length === 1
    && plan.patternSpecIds[0] === G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_SPEC_ID;
}
export function validateG3BU09DecimalComposeDecomposeQuestion(question = {}) {
  const errors = [];
  const add = (code, path) => errors.push({ code, severity: "error", path, message: code });
  if (question.sourceId !== G3B_U09_SOURCE_ID || question.metadata?.sourceId !== G3B_U09_SOURCE_ID) add("p03f8_source_mismatch", "sourceId");
  if (question.patternSpecId !== G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_SPEC_ID || question.metadata?.patternId !== G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_SPEC_ID) add("p03f8_pattern_mismatch", "patternSpecId");
  if (question.metadata?.knowledgePointId !== G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KP_ID) add("p03f8_kp_mismatch", "metadata.knowledgePointId");
  if (question.metadata?.patternGroupId !== G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_GROUP_ID) add("p03f8_group_mismatch", "metadata.patternGroupId");
  if (!Number.isInteger(question.whole) || question.whole < 0 || question.whole > 9) add("p03f8_whole_invalid", "whole");
  if (!Number.isInteger(question.fractionalUnits) || question.fractionalUnits < 1 || question.fractionalUnits > 9) add("p03f8_fractional_units_invalid", "fractionalUnits");
  if (question.placeUnit !== "0.1") add("p03f8_place_unit_invalid", "placeUnit");
  const expectedCoefficient = Number(question.whole) * 10 + Number(question.fractionalUnits);
  const expectedText = canonicalText(question.whole, question.fractionalUnits);
  if (question.decimalValue !== expectedText || question.answerText !== expectedText) add("p03f8_decimal_answer_invalid", "answerText");
  if (question.finalAnswer?.coefficient !== String(expectedCoefficient) || question.finalAnswer?.scale !== 1 || question.finalAnswer?.canonicalText !== expectedText || question.finalAnswer?.exact !== true) add("p03f8_canonical_decimal_identity_invalid", "finalAnswer");
  if (question.metadata?.canonicalDecimalIdentity !== `${expectedCoefficient}e-1`) add("p03f8_metadata_identity_invalid", "metadata.canonicalDecimalIdentity");
  const expectedCapabilities = ["cap_decimal_domain_validator", "cap_decimal_number_system"];
  if (JSON.stringify(question.metadata?.requiredCapabilityIds) !== JSON.stringify(expectedCapabilities)) add("p03f8_capability_set_invalid", "metadata.requiredCapabilityIds");
  if (question.metadata?.applicationClassification !== "APPLICATION_NOT_APPLICABLE" || question.questionMode !== "numeric") add("p03f8_application_scope_violation", "questionMode");
  if (String(question.blankedDisplayText ?? "").match(/(?:算式|_{2,}|答\s*[:：]|\{\{)/)) add("p03f8_forbidden_surface_present", "blankedDisplayText");
  return { ok: errors.length === 0, errors, warnings: [] };
}
export function generateG3BU09DecimalComposeDecomposeQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!canGenerateG3BU09DecimalComposeDecomposeQuestions(plan)) {
    return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "p03f8_plan_not_supported", severity: "error", path: "plan", message: "Slice008 accepts only the admitted decimal compose/decompose PatternSpec." }], warnings: [] };
  }
  if (plan.questionCount > WITNESSES.length) {
    return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "p03f8_question_count_exceeds_unique_witnesses", severity: "error", path: "questionCount", message: "Slice008 provides at most eight unique bounded witnesses." }], warnings: [] };
  }
  const questions = Array.from({ length: plan.questionCount }, (_, offset) => buildQuestion(offset + 1, plan.generationSeed));
  const promptSet = new Set(questions.map((row) => row.blankedDisplayText));
  const errors = questions.flatMap((question) => validateG3BU09DecimalComposeDecomposeQuestion(question).errors);
  if (promptSet.size !== questions.length) errors.push({ code: "p03f8_duplicate_prompt_detected", severity: "error", path: "questions", message: "The worksheet contains duplicate prompts." });
  return { ok: errors.length === 0 && questions.length === plan.questionCount, plan, questions, allocation: [{ patternSpecId: G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_SPEC_ID, questionCount: plan.questionCount }], errors, warnings: [] };
}
