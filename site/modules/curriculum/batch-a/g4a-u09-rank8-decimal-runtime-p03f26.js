import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f26.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f26-extension.js";
import {
  G4A_U09_P03F26_NUMERIC_PATTERN_SPEC_IDS,
  G4A_U09_P03F26_SOURCE_ID,
} from "../registry/g4a-u09-rank8-decimal-selector-projection-p03f26.js";

const ALL_IDS = new Set(G4A_U09_P03F26_NUMERIC_PATTERN_SPEC_IDS);
const seedOffset = (seed, size) => [...String(seed ?? "p03f26")].reduce((sum, char) => (sum + char.charCodeAt(0)) % Math.max(1, size), 0);
const pad2 = (value) => String(value).padStart(2, "0");
const decimal2 = (hundredths) => `${Math.floor(hundredths / 100)}.${pad2(Math.abs(hundredths % 100))}`;
const decimal1 = (hundredths) => `${Math.floor(hundredths / 100)}.${Math.floor(Math.abs(hundredths % 100) / 10)}`;
const compare = (left, right) => left < right ? "<" : left > right ? ">" : "=";

function compareFixture(ordinal, seed) {
  const offset = seedOffset(seed, 97);
  if (ordinal % 5 === 0) {
    const tenths = 10 + ((ordinal * 7 + offset) % 80);
    const hundredths = tenths * 10;
    return { leftHundredths: hundredths, rightHundredths: hundredths, leftScale: 2, rightScale: 1 };
  }
  const leftHundredths = 200 + ((ordinal * 37 + offset * 11) % 500);
  const delta = 1 + ((ordinal * 13 + offset) % 75);
  const rightHundredths = ordinal % 2 === 0 ? leftHundredths + delta : leftHundredths - delta;
  return { leftHundredths, rightHundredths, leftScale: 2, rightScale: 2 };
}

function sequenceFixture(ordinal, seed) {
  const offset = seedOffset(seed, 89);
  const startHundredths = 5 + ((ordinal * 23 + offset) % 250);
  const steps = [5, 10, 15, 20, 25, 30, 40];
  const stepHundredths = steps[(ordinal + offset) % steps.length];
  return { startHundredths, stepHundredths, shownCount: 4, answerIndex: 4 };
}

function missingDigitFixture(ordinal, seed) {
  const offset = seedOffset(seed, 83);
  const operation = ordinal % 2 === 0 ? "add" : "sub";
  let leftHundredths = 210 + ((ordinal * 73 + offset * 17) % 620);
  let rightHundredths = 11 + ((ordinal * 41 + offset * 13) % 145);
  let resultHundredths;
  if (operation === "add") {
    resultHundredths = leftHundredths + rightHundredths;
  } else {
    if (rightHundredths >= leftHundredths) [leftHundredths, rightHundredths] = [rightHundredths + 200, leftHundredths % 150];
    resultHundredths = leftHundredths - rightHundredths;
  }
  const maskPosition = ordinal % 3 === 0 ? "tenths" : "hundredths";
  const leftText = decimal2(leftHundredths);
  const digitIndex = maskPosition === "tenths" ? leftText.length - 2 : leftText.length - 1;
  const missingDigit = Number(leftText[digitIndex]);
  const maskedLeftText = `${leftText.slice(0, digitIndex)}□${leftText.slice(digitIndex + 1)}`;
  return { operation, leftHundredths, rightHundredths, resultHundredths, maskPosition, missingDigit, maskedLeftText };
}

function placeFactorFixture(patternSpecId, ordinal, seed) {
  const offset = seedOffset(seed, 9);
  const digit = 1 + ((ordinal + offset) % 9);
  const higherRequested = patternSpecId.endsWith("higher_place_value_numeric");
  const lowerPlaceValueHundredths = digit;
  const higherPlaceValueHundredths = digit * 10;
  return { digit, higherRequested, lowerPlaceValueHundredths, higherPlaceValueHundredths };
}

function metadata(definition) {
  return Object.freeze({
    patternId: definition.patternSpecId,
    sourceId: G4A_U09_P03F26_SOURCE_ID,
    patternTags: Object.freeze(["full_product_w3_slice026", definition.patternSpecId]),
    skillTags: definition.skillTags,
    difficultyTags: definition.difficultyTags,
    curriculumNodeIds: Object.freeze([G4A_U09_P03F26_SOURCE_ID]),
    canonicalSkillIds: definition.canonicalSkillIds,
    knowledgePointId: definition.knowledgePointId,
    patternGroupId: definition.patternGroupId,
    operationFamilyId: definition.operationFamilyId,
    requestedUnknownRole: definition.requestedUnknownRole,
    requiredCapabilityIds: definition.requiredCapabilityIds,
    applicationClassification: definition.applicationClassification,
    productAdmissionTask: "P03F_W3DirectProductVerticalSlice026Implementation",
    generatorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
    validatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
    globalContextAuthorityPath: null,
  });
}

function buildQuestion(patternSpecId, ordinal, seed) {
  const definition = getBatchABrowserPatternDefinition(patternSpecId);
  if (definition.operation === "compare") {
    const fixture = compareFixture(ordinal, seed);
    const leftText = fixture.leftScale === 1 ? decimal1(fixture.leftHundredths) : decimal2(fixture.leftHundredths);
    const rightText = fixture.rightScale === 1 ? decimal1(fixture.rightHundredths) : decimal2(fixture.rightHundredths);
    const answerText = compare(fixture.leftHundredths, fixture.rightHundredths);
    const promptText = `${leftText} ○ ${rightText}，請填入 <、= 或 >。`;
    return Object.freeze({ id: `${patternSpecId}-${ordinal + 1}`, sourceId: G4A_U09_P03F26_SOURCE_ID, patternSpecId, kind: definition.kind, operation: definition.operation, operationFamilyId: definition.operationFamilyId, questionMode: "numeric", mode: "NUMERIC", promptText, questionText: promptText, blankedDisplayText: promptText, displayText: `${promptText} ${answerText}`, answerText, finalAnswer: answerText, leftHundredths: fixture.leftHundredths, rightHundredths: fixture.rightHundredths, leftDecimal: leftText, rightDecimal: rightText, leftDisplayScale: fixture.leftScale, rightDisplayScale: fixture.rightScale, comparison: answerText, decimalPlaces: 2, metadata: metadata(definition), globalContextProduction: null });
  }
  if (definition.operation === "sequence") {
    const fixture = sequenceFixture(ordinal, seed);
    const terms = Array.from({ length: fixture.shownCount }, (_, index) => fixture.startHundredths + index * fixture.stepHundredths);
    const answerHundredths = fixture.startHundredths + fixture.answerIndex * fixture.stepHundredths;
    const answerText = decimal2(answerHundredths);
    const promptText = `${terms.map(decimal2).join("，")}，下一個數是多少？`;
    return Object.freeze({ id: `${patternSpecId}-${ordinal + 1}`, sourceId: G4A_U09_P03F26_SOURCE_ID, patternSpecId, kind: definition.kind, operation: definition.operation, operationFamilyId: definition.operationFamilyId, questionMode: "numeric", mode: "NUMERIC", promptText, questionText: promptText, blankedDisplayText: promptText, displayText: `${promptText} ${answerText}`, answerText, finalAnswer: answerText, startHundredths: fixture.startHundredths, stepHundredths: fixture.stepHundredths, shownTermsHundredths: Object.freeze(terms), answerHundredths, decimalPlaces: 2, metadata: metadata(definition), globalContextProduction: null });
  }
  if (definition.operation === "missing_digit") {
    const fixture = missingDigitFixture(ordinal, seed);
    const symbol = fixture.operation === "add" ? "+" : "−";
    const answerText = String(fixture.missingDigit);
    const promptText = `${fixture.maskedLeftText} ${symbol} ${decimal2(fixture.rightHundredths)} = ${decimal2(fixture.resultHundredths)}，□ 是多少？`;
    return Object.freeze({ id: `${patternSpecId}-${ordinal + 1}`, sourceId: G4A_U09_P03F26_SOURCE_ID, patternSpecId, kind: definition.kind, operation: definition.operation, operationFamilyId: definition.operationFamilyId, arithmeticOperation: fixture.operation, questionMode: "numeric", mode: "NUMERIC", promptText, questionText: promptText, blankedDisplayText: promptText, displayText: `${promptText} ${answerText}`, answerText, finalAnswer: answerText, leftHundredths: fixture.leftHundredths, rightHundredths: fixture.rightHundredths, resultHundredths: fixture.resultHundredths, maskedLeftText: fixture.maskedLeftText, maskPosition: fixture.maskPosition, missingDigit: fixture.missingDigit, decimalPlaces: 2, metadata: metadata(definition), globalContextProduction: null });
  }
  const fixture = placeFactorFixture(patternSpecId, ordinal, seed);
  const answerHundredths = fixture.higherRequested ? fixture.higherPlaceValueHundredths : fixture.lowerPlaceValueHundredths;
  const answerText = decimal2(answerHundredths);
  const promptText = fixture.higherRequested
    ? `數字 ${fixture.digit} 在百分位表示 ${decimal2(fixture.lowerPlaceValueHundredths)}；移到相鄰較高的十分位時表示多少？`
    : `數字 ${fixture.digit} 在十分位表示 ${decimal2(fixture.higherPlaceValueHundredths)}；移到相鄰較低的百分位時表示多少？`;
  return Object.freeze({ id: `${patternSpecId}-${ordinal + 1}`, sourceId: G4A_U09_P03F26_SOURCE_ID, patternSpecId, kind: definition.kind, operation: definition.operation, operationFamilyId: definition.operationFamilyId, questionMode: "numeric", mode: "NUMERIC", promptText, questionText: promptText, blankedDisplayText: promptText, displayText: `${promptText} ${answerText}`, answerText, finalAnswer: answerText, digit: fixture.digit, lowerPlaceValueHundredths: fixture.lowerPlaceValueHundredths, higherPlaceValueHundredths: fixture.higherPlaceValueHundredths, requestedPlaceDirection: fixture.higherRequested ? "higher" : "lower", decimalPlaces: 2, metadata: metadata(definition), globalContextProduction: null });
}

export function canGenerateG4AU09P03F26Questions(plan = {}) {
  return plan.sourceId === G4A_U09_P03F26_SOURCE_ID
    && Array.isArray(plan.patternSpecIds)
    && plan.patternSpecIds.length > 0
    && plan.patternSpecIds.every((id) => ALL_IDS.has(id));
}

export function validateG4AU09P03F26Question(question = {}) {
  const errors = [];
  const add = (code, path) => errors.push({ code, severity: "error", path, message: code });
  const id = question.patternSpecId ?? question.metadata?.patternId;
  const definition = getBatchABrowserPatternDefinition(id);
  if (!ALL_IDS.has(id) || !definition) add("p03f26_pattern_invalid", "patternSpecId");
  if (question.sourceId !== G4A_U09_P03F26_SOURCE_ID || question.metadata?.sourceId !== G4A_U09_P03F26_SOURCE_ID) add("p03f26_source_mismatch", "sourceId");
  if (question.questionMode !== "numeric" || question.globalContextProduction != null || question.metadata?.globalContextAuthorityPath != null) add("p03f26_application_scope_leak", "questionMode");
  if (question.metadata?.knowledgePointId !== definition?.knowledgePointId || question.metadata?.patternGroupId !== definition?.patternGroupId) add("p03f26_lineage_mismatch", "metadata");
  const caps = question.metadata?.requiredCapabilityIds ?? [];
  if (!caps.includes("cap_decimal_domain_validator") || !caps.includes("cap_decimal_number_system")) add("p03f26_decimal_capability_missing", "metadata.requiredCapabilityIds");
  if (caps.includes("cap_decimal_arithmetic") !== (definition?.operation === "missing_digit")) add("p03f26_arithmetic_capability_scope_invalid", "metadata.requiredCapabilityIds");

  if (definition?.operation === "compare") {
    if (![question.leftHundredths, question.rightHundredths].every(Number.isSafeInteger)) add("p03f26_compare_value_invalid", "decimalValue");
    const expected = compare(question.leftHundredths, question.rightHundredths);
    if (question.comparison !== expected || question.answerText !== expected || question.finalAnswer !== expected) add("p03f26_compare_answer_invalid", "answerText");
  } else if (definition?.operation === "sequence") {
    const terms = question.shownTermsHundredths ?? [];
    if (terms.length !== 4 || !terms.every(Number.isSafeInteger) || !Number.isSafeInteger(question.stepHundredths)) add("p03f26_sequence_value_invalid", "shownTermsHundredths");
    if (terms.some((value, index) => index > 0 && value - terms[index - 1] !== question.stepHundredths)) add("p03f26_sequence_step_invalid", "shownTermsHundredths");
    const expected = terms[terms.length - 1] + question.stepHundredths;
    if (question.answerHundredths !== expected || question.answerText !== decimal2(expected) || question.finalAnswer !== question.answerText) add("p03f26_sequence_answer_invalid", "answerText");
  } else if (definition?.operation === "missing_digit") {
    if (![question.leftHundredths, question.rightHundredths, question.resultHundredths, question.missingDigit].every(Number.isSafeInteger) || question.missingDigit < 0 || question.missingDigit > 9) add("p03f26_missing_digit_value_invalid", "missingDigit");
    const expectedResult = question.arithmeticOperation === "add" ? question.leftHundredths + question.rightHundredths : question.leftHundredths - question.rightHundredths;
    if (expectedResult !== question.resultHundredths || question.answerText !== String(question.missingDigit) || question.finalAnswer !== question.answerText) add("p03f26_column_operation_invalid", "answerText");
    if (!String(question.maskedLeftText).includes("□")) add("p03f26_missing_digit_mask_invalid", "maskedLeftText");
  } else if (definition?.operation?.startsWith("place_factor")) {
    if (![question.lowerPlaceValueHundredths, question.higherPlaceValueHundredths, question.digit].every(Number.isSafeInteger)) add("p03f26_place_factor_value_invalid", "placeValue");
    if (question.higherPlaceValueHundredths !== question.lowerPlaceValueHundredths * 10) add("p03f26_place_factor_relation_invalid", "placeValue");
    const expected = definition.operation === "place_factor_higher" ? question.higherPlaceValueHundredths : question.lowerPlaceValueHundredths;
    if (question.answerText !== decimal2(expected) || question.finalAnswer !== question.answerText) add("p03f26_place_factor_answer_invalid", "answerText");
  }
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function generateG4AU09P03F26Questions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!canGenerateG4AU09P03F26Questions(plan)) return { ok: false, errors: [{ code: "p03f26_plan_not_supported", severity: "error", path: "patternSpecIds", message: "p03f26_plan_not_supported" }], warnings: [], questions: [], plan };
  const count = Number.isInteger(plan.questionCount) ? plan.questionCount : 25;
  const ids = plan.patternSpecIds;
  const occurrenceBySpec = new Map(ids.map((patternSpecId) => [patternSpecId, 0]));
  const questions = Array.from({ length: count }, (_, index) => {
    const patternSpecId = ids[index % ids.length];
    const ordinal = occurrenceBySpec.get(patternSpecId) ?? 0;
    occurrenceBySpec.set(patternSpecId, ordinal + 1);
    return buildQuestion(patternSpecId, ordinal, plan.generationSeed);
  });
  const validationErrors = questions.flatMap((question, index) => validateG4AU09P03F26Question(question).errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` })));
  const allocation = ids.map((patternSpecId) => Object.freeze({ patternSpecId, questionCount: questions.filter((q) => q.patternSpecId === patternSpecId).length }));
  return Object.freeze({ ok: validationErrors.length === 0, errors: Object.freeze(validationErrors), warnings: Object.freeze([]), questions: Object.freeze(questions), plan: Object.freeze(plan), allocation: Object.freeze(allocation) });
}
