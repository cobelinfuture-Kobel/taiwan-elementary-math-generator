import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f30.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f30-extension.js";
import {
  G5A_U06_P03F30_NUMERIC_PATTERN_SPEC_IDS,
  G5A_U06_P03F30_SOURCE_ID,
  P03F30_REQUIRED_CAPABILITY_IDS,
} from "../registry/g5a-u06-rank8-fraction-selector-projection-p03f30.js";

const ALL_IDS = new Set(G5A_U06_P03F30_NUMERIC_PATTERN_SPEC_IDS);
const DENOMINATOR_PAIRS = Object.freeze([[3,4],[4,5],[5,6],[5,8],[6,7],[7,9],[8,12],[9,10],[10,12],[11,12]]);
const UNIT_DENOMINATOR_PAIRS = Object.freeze([[2,3],[3,4],[3,5],[4,5],[4,7],[5,6],[5,8],[6,7],[7,8],[8,9],[9,10],[10,12]]);
const EQUAL_COMPARE = Object.freeze([[1,2,2,4],[2,3,4,6],[3,4,6,8],[2,5,4,10],[3,5,6,10],[5,6,10,12]]);
const seedOffset = (seed, size) => [...String(seed ?? "p03f30")].reduce((sum, char) => (sum + char.charCodeAt(0)) % Math.max(1, size), 0);
const gcd = (a, b) => { let x = Math.abs(a), y = Math.abs(b); while (y) [x, y] = [y, x % y]; return x || 1; };
function normalize(numerator, denominator) {
  if (denominator === 0) throw new Error("P03F30_ZERO_DENOMINATOR");
  const sign = denominator < 0 ? -1 : 1;
  const n = numerator * sign;
  const d = Math.abs(denominator);
  const g = gcd(n, d);
  return Object.freeze({ numerator: n / g, denominator: d / g });
}
const fractionText = ({ numerator, denominator }) => denominator === 1 ? String(numerator) : `${numerator}/${denominator}`;
const compareProducts = (ln, ld, rn, rd) => ln * rd < rn * ld ? "<" : ln * rd > rn * ld ? ">" : "=";
const issue = (code, path) => ({ code, severity: "error", path, message: code });

function fractionFixture(ordinal, seed, operation) {
  const offset = seedOffset(seed, 97);
  let [leftDenominator, rightDenominator] = DENOMINATOR_PAIRS[(ordinal + offset) % DENOMINATOR_PAIRS.length];
  let leftNumerator = 1 + ((ordinal * 5 + offset + 1) % (leftDenominator + 2));
  let rightNumerator = 1 + ((ordinal * 7 + offset + 2) % (rightDenominator + 2));
  if (operation === "sub" && compareProducts(leftNumerator, leftDenominator, rightNumerator, rightDenominator) === "<") {
    [leftNumerator, leftDenominator, rightNumerator, rightDenominator] = [rightNumerator, rightDenominator, leftNumerator, leftDenominator];
  }
  if (operation === "sub" && compareProducts(leftNumerator, leftDenominator, rightNumerator, rightDenominator) === "=") leftNumerator += 1;
  return { leftNumerator, leftDenominator, rightNumerator, rightDenominator };
}

function compareFixture(ordinal, seed) {
  const offset = seedOffset(seed, 83);
  if (ordinal % 5 === 4) {
    const row = EQUAL_COMPARE[(Math.floor(ordinal / 5) + offset) % EQUAL_COMPARE.length];
    return { leftNumerator: row[0], leftDenominator: row[1], rightNumerator: row[2], rightDenominator: row[3] };
  }
  const fixture = fractionFixture(ordinal, seed, "add");
  if (compareProducts(fixture.leftNumerator, fixture.leftDenominator, fixture.rightNumerator, fixture.rightDenominator) === "=") fixture.rightNumerator += 1;
  const target = ordinal % 2 === 0 ? "<" : ">";
  if (compareProducts(fixture.leftNumerator, fixture.leftDenominator, fixture.rightNumerator, fixture.rightDenominator) !== target) {
    [fixture.leftNumerator, fixture.leftDenominator, fixture.rightNumerator, fixture.rightDenominator] = [fixture.rightNumerator, fixture.rightDenominator, fixture.leftNumerator, fixture.leftDenominator];
  }
  return fixture;
}

function reciprocalFixture(ordinal, seed) {
  const offset = seedOffset(seed, 71);
  const [firstDenominator, secondDenominator] = UNIT_DENOMINATOR_PAIRS[(ordinal * 5 + offset) % UNIT_DENOMINATOR_PAIRS.length];
  return { firstDenominator, secondDenominator };
}

function metadata(definition) {
  return Object.freeze({
    patternId: definition.patternSpecId,
    sourceId: G5A_U06_P03F30_SOURCE_ID,
    patternTags: Object.freeze(["full_product_w3_slice030", definition.patternSpecId]),
    skillTags: definition.skillTags,
    difficultyTags: definition.difficultyTags,
    curriculumNodeIds: Object.freeze([G5A_U06_P03F30_SOURCE_ID]),
    canonicalSkillIds: definition.canonicalSkillIds,
    knowledgePointId: definition.knowledgePointId,
    patternGroupId: definition.patternGroupId,
    operationFamilyId: definition.operationFamilyId,
    requestedUnknownRole: definition.requestedUnknownRole,
    requiredCapabilityIds: P03F30_REQUIRED_CAPABILITY_IDS,
    applicationClassification: definition.applicationClassification,
    productAdmissionTask: "P03F_W3DirectProductVerticalSlice030Implementation",
    generatorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
    validatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
    globalContextAuthorityPath: null,
  });
}

function buildQuestion(patternSpecId, ordinal, seed) {
  const definition = getBatchABrowserPatternDefinition(patternSpecId);
  if (definition.operationFamilyId === "reciprocal_sum") {
    const fixture = reciprocalFixture(ordinal, seed);
    const result = normalize(fixture.firstDenominator + fixture.secondDenominator, fixture.firstDenominator * fixture.secondDenominator);
    const answerText = fractionText(result);
    const promptText = `1/${fixture.firstDenominator} + 1/${fixture.secondDenominator} = ?`;
    return Object.freeze({ id:`${patternSpecId}-${ordinal+1}`, sourceId:G5A_U06_P03F30_SOURCE_ID, patternSpecId, kind:definition.kind, operation:"reciprocal_sum", operationFamilyId:"reciprocal_sum", questionMode:"numeric", mode:"NUMERIC", promptText, questionText:promptText, blankedDisplayText:promptText, displayText:`${promptText} ${answerText}`, answerText, finalAnswer:answerText, ...fixture, resultNumerator:result.numerator, resultDenominator:result.denominator, metadata:metadata(definition), globalContextProduction:null });
  }
  if (definition.operationFamilyId === "fraction_compare") {
    const fixture = compareFixture(ordinal, seed);
    const answerText = compareProducts(fixture.leftNumerator, fixture.leftDenominator, fixture.rightNumerator, fixture.rightDenominator);
    const promptText = `${fixture.leftNumerator}/${fixture.leftDenominator} ○ ${fixture.rightNumerator}/${fixture.rightDenominator}，請填入 <、= 或 >。`;
    return Object.freeze({ id:`${patternSpecId}-${ordinal+1}`, sourceId:G5A_U06_P03F30_SOURCE_ID, patternSpecId, kind:definition.kind, operation:"fraction_compare", operationFamilyId:"fraction_compare", questionMode:"numeric", mode:"NUMERIC", promptText, questionText:promptText, blankedDisplayText:promptText, displayText:`${promptText} ${answerText}`, answerText, finalAnswer:answerText, ...fixture, comparison:answerText, metadata:metadata(definition), globalContextProduction:null });
  }
  const arithmeticOperation = definition.knowledgePointId.endsWith("_add") ? "add" : "sub";
  const fixture = fractionFixture(ordinal, seed, arithmeticOperation);
  const rawNumerator = arithmeticOperation === "add"
    ? fixture.leftNumerator * fixture.rightDenominator + fixture.rightNumerator * fixture.leftDenominator
    : fixture.leftNumerator * fixture.rightDenominator - fixture.rightNumerator * fixture.leftDenominator;
  const result = normalize(rawNumerator, fixture.leftDenominator * fixture.rightDenominator);
  const answerText = fractionText(result);
  const symbol = arithmeticOperation === "add" ? "+" : "−";
  const promptText = `${fixture.leftNumerator}/${fixture.leftDenominator} ${symbol} ${fixture.rightNumerator}/${fixture.rightDenominator} = ?`;
  return Object.freeze({ id:`${patternSpecId}-${ordinal+1}`, sourceId:G5A_U06_P03F30_SOURCE_ID, patternSpecId, kind:definition.kind, operation:"fraction_add_sub", operationFamilyId:"fraction_add_sub", arithmeticOperation, questionMode:"numeric", mode:"NUMERIC", promptText, questionText:promptText, blankedDisplayText:promptText, displayText:`${promptText} ${answerText}`, answerText, finalAnswer:answerText, ...fixture, resultNumerator:result.numerator, resultDenominator:result.denominator, metadata:metadata(definition), globalContextProduction:null });
}

export function canGenerateG5AU06P03F30Questions(plan = {}) {
  return plan.sourceId === G5A_U06_P03F30_SOURCE_ID && Array.isArray(plan.patternSpecIds) && plan.patternSpecIds.length > 0 && plan.patternSpecIds.every((id) => ALL_IDS.has(id));
}

export function validateG5AU06P03F30Question(question = {}) {
  const errors = [];
  const id = question.patternSpecId ?? question.metadata?.patternId;
  const definition = getBatchABrowserPatternDefinition(id);
  if (!ALL_IDS.has(id) || !definition) errors.push(issue("p03f30_pattern_invalid", "patternSpecId"));
  if (question.sourceId !== G5A_U06_P03F30_SOURCE_ID || question.metadata?.sourceId !== G5A_U06_P03F30_SOURCE_ID) errors.push(issue("p03f30_source_mismatch", "sourceId"));
  if (question.questionMode !== "numeric" || question.globalContextProduction != null || question.metadata?.globalContextAuthorityPath != null) errors.push(issue("p03f30_application_scope_leak", "questionMode"));
  if (question.metadata?.knowledgePointId !== definition?.knowledgePointId || question.metadata?.patternGroupId !== definition?.patternGroupId) errors.push(issue("p03f30_lineage_mismatch", "metadata"));
  if (JSON.stringify(question.metadata?.requiredCapabilityIds) !== JSON.stringify(P03F30_REQUIRED_CAPABILITY_IDS)) errors.push(issue("p03f30_fraction_capability_set_invalid", "metadata.requiredCapabilityIds"));
  if (definition?.operationFamilyId === "reciprocal_sum") {
    if (![question.firstDenominator, question.secondDenominator].every(Number.isSafeInteger) || question.firstDenominator <= 0 || question.secondDenominator <= 0) errors.push(issue("p03f30_reciprocal_operand_invalid", "denominators"));
    else {
      const expected = normalize(question.firstDenominator + question.secondDenominator, question.firstDenominator * question.secondDenominator);
      if (question.resultNumerator !== expected.numerator || question.resultDenominator !== expected.denominator || question.answerText !== fractionText(expected) || question.finalAnswer !== question.answerText) errors.push(issue("p03f30_reciprocal_answer_invalid", "answerText"));
    }
    return { ok: errors.length === 0, errors, warnings: [] };
  }
  const ints = [question.leftNumerator, question.leftDenominator, question.rightNumerator, question.rightDenominator];
  if (!ints.every(Number.isSafeInteger) || question.leftDenominator <= 0 || question.rightDenominator <= 0 || question.leftDenominator === question.rightDenominator) errors.push(issue("p03f30_fraction_operand_invalid", "fractionOperands"));
  if (definition?.operationFamilyId === "fraction_compare") {
    const expected = compareProducts(question.leftNumerator, question.leftDenominator, question.rightNumerator, question.rightDenominator);
    if (question.comparison !== expected || question.answerText !== expected || question.finalAnswer !== expected) errors.push(issue("p03f30_compare_answer_invalid", "answerText"));
  } else {
    const expectedOperation = definition?.knowledgePointId?.endsWith("_add") ? "add" : "sub";
    if (question.arithmeticOperation !== expectedOperation) errors.push(issue("p03f30_operation_invalid", "arithmeticOperation"));
    const rawNumerator = expectedOperation === "add"
      ? question.leftNumerator * question.rightDenominator + question.rightNumerator * question.leftDenominator
      : question.leftNumerator * question.rightDenominator - question.rightNumerator * question.leftDenominator;
    if (expectedOperation === "sub" && rawNumerator < 0) errors.push(issue("p03f30_negative_subtraction_invalid", "resultNumerator"));
    const expected = normalize(rawNumerator, question.leftDenominator * question.rightDenominator);
    if (question.resultNumerator !== expected.numerator || question.resultDenominator !== expected.denominator || question.answerText !== fractionText(expected) || question.finalAnswer !== question.answerText) errors.push(issue("p03f30_add_sub_answer_invalid", "answerText"));
  }
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function generateG5AU06P03F30Questions(options = {}) {
  const plan = options.plan ?? buildBatchABrowserPlan(options);
  if (!canGenerateG5AU06P03F30Questions(plan)) return { ok:false, errors:[issue("p03f30_plan_not_supported","patternSpecIds")], warnings:[], questions:[], plan };
  const count = Number(options.questionCount ?? plan.questionCount ?? 24);
  if (!Number.isInteger(count) || count < 1 || count > 240) return { ok:false, errors:[issue("p03f30_question_count_invalid","questionCount")], warnings:[], questions:[], plan };
  const occurrenceBySpec = new Map(plan.patternSpecIds.map((id) => [id, 0]));
  const questions = Array.from({ length: count }, (_, index) => {
    const patternSpecId = plan.patternSpecIds[index % plan.patternSpecIds.length];
    const ordinal = occurrenceBySpec.get(patternSpecId) ?? 0;
    occurrenceBySpec.set(patternSpecId, ordinal + 1);
    return buildQuestion(patternSpecId, ordinal, options.generationSeed ?? plan.generationSeed);
  });
  const errors = questions.flatMap((question, index) => validateG5AU06P03F30Question(question).errors.map((error) => ({ ...error, path:`questions[${index}].${error.path}` })));
  if (new Set(questions.map((question) => question.blankedDisplayText)).size !== questions.length) errors.push(issue("p03f30_duplicate_prompt_detected", "questions"));
  const allocation = plan.patternSpecIds.map((patternSpecId) => Object.freeze({ patternSpecId, questionCount: questions.filter((q) => q.patternSpecId === patternSpecId).length }));
  return Object.freeze({ ok:errors.length===0, errors:Object.freeze(errors), warnings:Object.freeze([]), questions:Object.freeze(questions), allocation:Object.freeze(allocation), plan });
}
