import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f8-extension.js";
import {
  G3B_U09_DECIMAL_READ_WRITE_KP_ID,
  G3B_U09_DECIMAL_READ_WRITE_PATTERN_GROUP_ID,
  G3B_U09_DECIMAL_READ_WRITE_PATTERN_SPEC_ID,
  G3B_U09_SOURCE_ID,
} from "../registry/g3b-u09-decimal-read-write-selector-projection.js";

const DIGIT_ZH = Object.freeze(["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"]);
function buildReadWriteWitnesses() {
  const rows = [];
  for (let whole = 0; whole <= 9; whole += 1) {
    for (let tenths = 1; tenths <= 9; tenths += 1) {
      rows.push(Object.freeze({ whole, tenths, direction: "notation_to_reading" }));
      rows.push(Object.freeze({ whole, tenths, direction: "reading_to_notation" }));
    }
  }
  return rows;
}
const WITNESSES = Object.freeze(buildReadWriteWitnesses()); // PGC-R04 decimal read-write parameter space

function hashSeed(value) {
  let acc = 2166136261;
  for (const char of String(value ?? "p03f8-read-write")) {
    acc ^= char.charCodeAt(0);
    acc = Math.imul(acc, 16777619) >>> 0;
  }
  return acc || 1;
}
function notation(whole, tenths) { return `${whole}.${tenths}`; }
function reading(whole, tenths) { return `${DIGIT_ZH[whole]}點${DIGIT_ZH[tenths]}`; }
function metadata(definition, coefficient, direction) {
  return Object.freeze({
    patternId: definition.patternSpecId,
    sourceId: definition.sourceId,
    patternTags: Object.freeze(["full_product_w3_slice008", definition.sourceId, definition.patternSpecId, direction]),
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
    readWriteDirection: direction,
    productAdmissionTask: "P03F_W3DirectProductVerticalSlice008Implementation",
    generatorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
    validatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
  });
}
function buildQuestion(index, seed) {
  const definition = getBatchABrowserPatternDefinition(G3B_U09_DECIMAL_READ_WRITE_PATTERN_SPEC_ID);
  const row = WITNESSES[(hashSeed(seed) + index - 1) % WITNESSES.length];
  const decimalText = notation(row.whole, row.tenths);
  const readingText = reading(row.whole, row.tenths);
  const coefficient = row.whole * 10 + row.tenths;
  const prompt = row.direction === "notation_to_reading"
    ? `${decimalText} 讀作什麼？`
    : `「${readingText}」寫成小數是多少？`;
  const answerText = row.direction === "notation_to_reading" ? readingText : decimalText;
  return Object.freeze({
    id: `${G3B_U09_DECIMAL_READ_WRITE_PATTERN_SPEC_ID}-${index}`,
    sourceId: G3B_U09_SOURCE_ID,
    patternSpecId: G3B_U09_DECIMAL_READ_WRITE_PATTERN_SPEC_ID,
    kind: "g3bU09DecimalReadWrite",
    operation: "decimal_read_write",
    operationFamilyId: "decimal_read_write",
    questionMode: "numeric",
    promptText: prompt,
    questionText: prompt,
    blankedDisplayText: prompt,
    displayText: `${prompt} ${answerText}`,
    answerText,
    whole: row.whole,
    tenthsDigit: row.tenths,
    digitsByPlace: Object.freeze({ ones: row.whole, tenths: row.tenths }),
    decimalValue: decimalText,
    decimalReading: readingText,
    readWriteDirection: row.direction,
    finalAnswer: Object.freeze({ coefficient: String(coefficient), scale: 1, canonicalText: decimalText, exact: true }),
    metadata: metadata(definition, coefficient, row.direction),
  });
}

export function generateG3BU09DecimalReadWriteQuestions({ questionCount = 8, generationSeed = "p03f8-read-write" } = {}) {
  if (!Number.isInteger(questionCount) || questionCount <= 0 || questionCount > WITNESSES.length) {
    return { ok: false, questions: [], allocation: [], errors: [{ code: "p03f8_read_write_question_count_invalid", severity: "error", path: "questionCount", message: "Read-write witness count must be between 1 and 8." }], warnings: [] };
  }
  const questions = Array.from({ length: questionCount }, (_, offset) => buildQuestion(offset + 1, generationSeed));
  const errors = questions.flatMap((question) => validateG3BU09DecimalReadWriteQuestion(question).errors);
  if (new Set(questions.map((row) => row.blankedDisplayText)).size !== questions.length) errors.push({ code: "p03f8_read_write_duplicate_prompt", severity: "error", path: "questions", message: "Duplicate read-write prompt." });
  return { ok: errors.length === 0, questions, allocation: [{ patternSpecId: G3B_U09_DECIMAL_READ_WRITE_PATTERN_SPEC_ID, questionCount }], errors, warnings: [] };
}

export function validateG3BU09DecimalReadWriteQuestion(question = {}) {
  const errors = [];
  const add = (code, path) => errors.push({ code, severity: "error", path, message: code });
  if (question.sourceId !== G3B_U09_SOURCE_ID || question.metadata?.sourceId !== G3B_U09_SOURCE_ID) add("p03f8_read_write_source_mismatch", "sourceId");
  if (question.patternSpecId !== G3B_U09_DECIMAL_READ_WRITE_PATTERN_SPEC_ID || question.metadata?.patternId !== G3B_U09_DECIMAL_READ_WRITE_PATTERN_SPEC_ID) add("p03f8_read_write_pattern_mismatch", "patternSpecId");
  if (question.metadata?.knowledgePointId !== G3B_U09_DECIMAL_READ_WRITE_KP_ID) add("p03f8_read_write_kp_mismatch", "metadata.knowledgePointId");
  if (question.metadata?.patternGroupId !== G3B_U09_DECIMAL_READ_WRITE_PATTERN_GROUP_ID) add("p03f8_read_write_group_mismatch", "metadata.patternGroupId");
  if (!Number.isInteger(question.whole) || question.whole < 0 || question.whole > 9) add("p03f8_read_write_whole_invalid", "whole");
  if (!Number.isInteger(question.tenthsDigit) || question.tenthsDigit < 0 || question.tenthsDigit > 9) add("p03f8_read_write_tenths_invalid", "tenthsDigit");
  const expectedNotation = notation(question.whole, question.tenthsDigit);
  const expectedReading = reading(question.whole, question.tenthsDigit);
  const expectedCoefficient = question.whole * 10 + question.tenthsDigit;
  if (question.decimalValue !== expectedNotation || question.decimalReading !== expectedReading) add("p03f8_read_write_identity_invalid", "decimalValue");
  if (!Object.freeze(["notation_to_reading", "reading_to_notation"]).includes(question.readWriteDirection)) add("p03f8_read_write_direction_invalid", "readWriteDirection");
  const expectedAnswer = question.readWriteDirection === "notation_to_reading" ? expectedReading : expectedNotation;
  if (question.answerText !== expectedAnswer) add("p03f8_read_write_answer_invalid", "answerText");
  if (question.finalAnswer?.coefficient !== String(expectedCoefficient) || question.finalAnswer?.scale !== 1 || question.finalAnswer?.canonicalText !== expectedNotation || question.finalAnswer?.exact !== true) add("p03f8_read_write_canonical_identity_invalid", "finalAnswer");
  if (question.metadata?.canonicalDecimalIdentity !== `${expectedCoefficient}e-1`) add("p03f8_read_write_metadata_identity_invalid", "metadata.canonicalDecimalIdentity");
  const expectedCapabilities = ["cap_decimal_domain_validator", "cap_decimal_number_system"];
  if (JSON.stringify(question.metadata?.requiredCapabilityIds) !== JSON.stringify(expectedCapabilities)) add("p03f8_read_write_capability_set_invalid", "metadata.requiredCapabilityIds");
  if (question.metadata?.applicationClassification !== "APPLICATION_NOT_APPLICABLE" || question.questionMode !== "numeric") add("p03f8_read_write_application_scope_violation", "questionMode");
  if (String(question.blankedDisplayText ?? "").match(/(?:算式|_{2,}|答\s*[:：]|\{\{)/)) add("p03f8_read_write_forbidden_surface_present", "blankedDisplayText");
  return { ok: errors.length === 0, errors, warnings: [] };
}
