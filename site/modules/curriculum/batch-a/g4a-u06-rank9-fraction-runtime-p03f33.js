import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f33.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f33-extension.js";
import {
  G4A_U06_P03F33_PATTERN_SPEC_IDS,
  G4A_U06_P03F33_SOURCE_ID,
  P03F33_REQUIRED_CAPABILITY_IDS,
} from "../registry/g4a-u06-rank9-fraction-selector-projection-p03f33.js";

const ALL_IDS = new Set(G4A_U06_P03F33_PATTERN_SPEC_IDS);
const DENOMINATORS = Object.freeze([3,4,5,6,7,8,9,10,12]);
const seedOffset = (seed, size) => [...String(seed ?? "p03f33")].reduce((sum, char) => (sum + char.charCodeAt(0)) % Math.max(1, size), 0);
const gcd = (a, b) => { let x = Math.abs(a), y = Math.abs(b); while (y) [x, y] = [y, x % y]; return x || 1; };
function normalize(numerator, denominator) {
  if (!Number.isSafeInteger(numerator) || !Number.isSafeInteger(denominator) || denominator === 0) throw new Error("P03F33_INVALID_RATIONAL");
  const sign = denominator < 0 ? -1 : 1;
  const n = numerator * sign;
  const d = Math.abs(denominator);
  const g = gcd(n, d);
  return Object.freeze({ numerator:n / g, denominator:d / g });
}
function rationalText(value) {
  const { numerator, denominator } = normalize(value.numerator, value.denominator);
  if (denominator === 1) return String(numerator);
  if (numerator > denominator) {
    const whole = Math.floor(numerator / denominator);
    const remainder = numerator % denominator;
    return remainder === 0 ? String(whole) : `${whole} ${remainder}/${denominator}`;
  }
  return `${numerator}/${denominator}`;
}
const improperText = (numerator, denominator) => `${numerator}/${denominator}`;
const compareProducts = (ln, ld, rn, rd) => ln * rd < rn * ld ? "<" : ln * rd > rn * ld ? ">" : "=";
const issue = (code, path) => ({ code, severity:"error", path, message:code });

function metadata(definition) {
  return Object.freeze({
    patternId:definition.patternSpecId,
    sourceId:G4A_U06_P03F33_SOURCE_ID,
    patternTags:Object.freeze(["full_product_w3_slice033", definition.patternSpecId]),
    skillTags:definition.skillTags,
    difficultyTags:definition.difficultyTags,
    curriculumNodeIds:Object.freeze([G4A_U06_P03F33_SOURCE_ID]),
    canonicalSkillIds:definition.canonicalSkillIds,
    knowledgePointId:definition.knowledgePointId,
    patternGroupId:definition.patternGroupId,
    operationFamilyId:definition.operationFamilyId,
    requestedUnknownRole:definition.requestedUnknownRole,
    requiredCapabilityIds:P03F33_REQUIRED_CAPABILITY_IDS,
    applicationClassification:definition.applicationClassification,
    productAdmissionTask:"P03F_W3DirectProductVerticalSlice033Implementation",
    generatorAdapterId:"SHARED_OPERATION_FAMILY_GENERATOR_V1",
    validatorAdapterId:"SHARED_OPERATION_FAMILY_VALIDATOR_V1",
    globalContextAuthorityPath:null,
  });
}

function compareFixture(ordinal, seed) {
  const offset = seedOffset(seed, 101);
  const denominator = DENOMINATORS[(ordinal + offset) % DENOMINATORS.length];
  const leftNumerator = denominator + 1 + ((ordinal * 3 + offset) % denominator);
  let rightNumerator = denominator + 1 + ((ordinal * 5 + offset + 2) % denominator);
  if (ordinal % 4 === 3) rightNumerator = leftNumerator;
  else if (rightNumerator === leftNumerator) rightNumerator += 1;
  return { leftNumerator, leftDenominator:denominator, rightNumerator, rightDenominator:denominator };
}

function numberLineFixture(ordinal, seed) {
  const offset = seedOffset(seed, 89);
  const denominator = DENOMINATORS[(ordinal * 2 + offset) % DENOMINATORS.length];
  const originStep = (ordinal + offset) % 3;
  const stepCount = denominator + 1 + ((ordinal * 4 + offset) % (denominator + 2));
  const origin = normalize(originStep, denominator);
  const unitStep = normalize(1, denominator);
  const coordinate = normalize(originStep + stepCount, denominator);
  const distance = normalize(stepCount, denominator);
  return {
    originNumerator:origin.numerator,
    originDenominator:origin.denominator,
    unitStepNumerator:unitStep.numerator,
    unitStepDenominator:unitStep.denominator,
    stepCount,
    coordinateNumerator:coordinate.numerator,
    coordinateDenominator:coordinate.denominator,
    distanceNumerator:distance.numerator,
    distanceDenominator:distance.denominator,
  };
}

function addSubFixture(ordinal, seed) {
  const offset = seedOffset(seed, 79);
  const denominator = DENOMINATORS[(ordinal * 3 + offset) % DENOMINATORS.length];
  const operation = ordinal % 2 === 0 ? "add" : "sub";
  let leftNumerator = denominator + 1 + ((ordinal * 5 + offset) % (denominator + 2));
  let rightNumerator = denominator + 1 + ((ordinal * 7 + offset + 1) % denominator);
  if (operation === "sub" && leftNumerator < rightNumerator) [leftNumerator, rightNumerator] = [rightNumerator, leftNumerator];
  if (operation === "sub" && leftNumerator === rightNumerator) leftNumerator += 1;
  return { leftNumerator, leftDenominator:denominator, rightNumerator, rightDenominator:denominator, arithmeticOperation:operation };
}

function buildQuestion(patternSpecId, ordinal, seed) {
  const definition = getBatchABrowserPatternDefinition(patternSpecId);
  if (definition.operationFamilyId === "fraction_compare") {
    const fixture = compareFixture(ordinal, seed);
    const answerText = compareProducts(fixture.leftNumerator, fixture.leftDenominator, fixture.rightNumerator, fixture.rightDenominator);
    const promptText = `${improperText(fixture.leftNumerator, fixture.leftDenominator)} ○ ${rationalText({ numerator:fixture.rightNumerator, denominator:fixture.rightDenominator })}，請填入 <、= 或 >。`;
    return Object.freeze({ id:`${patternSpecId}-${ordinal+1}`, sourceId:G4A_U06_P03F33_SOURCE_ID, patternSpecId, kind:definition.kind, operation:"fraction_compare", operationFamilyId:"fraction_compare", questionMode:"numeric", mode:"NUMERIC", promptText, questionText:promptText, blankedDisplayText:promptText, displayText:`${promptText} ${answerText}`, answerText, finalAnswer:answerText, comparison:answerText, ...fixture, metadata:metadata(definition), globalContextProduction:null });
  }
  if (definition.operationFamilyId === "number_line") {
    const fixture = numberLineFixture(ordinal, seed);
    const originText = rationalText({ numerator:fixture.originNumerator, denominator:fixture.originDenominator });
    const stepText = rationalText({ numerator:fixture.unitStepNumerator, denominator:fixture.unitStepDenominator });
    const coordinate = { numerator:fixture.coordinateNumerator, denominator:fixture.coordinateDenominator };
    const distance = { numerator:fixture.distanceNumerator, denominator:fixture.distanceDenominator };
    const asksCoordinate = definition.requestedUnknownRole === "coordinate";
    const answerText = rationalText(asksCoordinate ? coordinate : distance);
    const promptText = asksCoordinate
      ? `數線起點是 ${originText}，每格是 ${stepText}，向右 ${fixture.stepCount} 格的位置是多少？`
      : `從數線上的 ${originText} 向右走 ${fixture.stepCount} 格，每格是 ${stepText}，兩點距離是多少？`;
    return Object.freeze({ id:`${patternSpecId}-${ordinal+1}`, sourceId:G4A_U06_P03F33_SOURCE_ID, patternSpecId, kind:definition.kind, operation:"number_line", operationFamilyId:"number_line", questionMode:"numeric", mode:"NUMERIC", promptText, questionText:promptText, blankedDisplayText:promptText, displayText:`${promptText} ${answerText}`, answerText, finalAnswer:answerText, ...fixture, metadata:metadata(definition), globalContextProduction:null });
  }
  const fixture = addSubFixture(ordinal, seed);
  const rawNumerator = fixture.arithmeticOperation === "add" ? fixture.leftNumerator + fixture.rightNumerator : fixture.leftNumerator - fixture.rightNumerator;
  const result = normalize(rawNumerator, fixture.leftDenominator);
  const answerText = rationalText(result);
  const symbol = fixture.arithmeticOperation === "add" ? "+" : "−";
  const leftText = rationalText({ numerator:fixture.leftNumerator, denominator:fixture.leftDenominator });
  const rightText = rationalText({ numerator:fixture.rightNumerator, denominator:fixture.rightDenominator });
  const promptText = `${leftText} ${symbol} ${rightText} = ?`;
  return Object.freeze({ id:`${patternSpecId}-${ordinal+1}`, sourceId:G4A_U06_P03F33_SOURCE_ID, patternSpecId, kind:definition.kind, operation:"fraction_add_sub", operationFamilyId:"fraction_add_sub", questionMode:"numeric", mode:"NUMERIC", promptText, questionText:promptText, blankedDisplayText:promptText, displayText:`${promptText} ${answerText}`, answerText, finalAnswer:answerText, ...fixture, resultNumerator:result.numerator, resultDenominator:result.denominator, metadata:metadata(definition), globalContextProduction:null });
}

export function canGenerateG4AU06P03F33Questions(plan = {}) {
  return plan.sourceId === G4A_U06_P03F33_SOURCE_ID && Array.isArray(plan.patternSpecIds) && plan.patternSpecIds.length > 0 && plan.patternSpecIds.every((id) => ALL_IDS.has(id));
}

export function validateG4AU06P03F33Question(question = {}) {
  const errors = [];
  const id = question.patternSpecId ?? question.metadata?.patternId;
  const definition = getBatchABrowserPatternDefinition(id);
  if (!ALL_IDS.has(id) || !definition) return { ok:false, errors:[issue("p03f33_pattern_invalid","patternSpecId")], warnings:[] };
  if (question.sourceId !== G4A_U06_P03F33_SOURCE_ID || question.metadata?.sourceId !== G4A_U06_P03F33_SOURCE_ID) errors.push(issue("p03f33_source_mismatch","sourceId"));
  if (question.questionMode !== "numeric" || question.globalContextProduction != null || question.metadata?.globalContextAuthorityPath != null) errors.push(issue("p03f33_application_scope_leak","questionMode"));
  if (question.metadata?.knowledgePointId !== definition.knowledgePointId || question.metadata?.patternGroupId !== definition.patternGroupId) errors.push(issue("p03f33_lineage_mismatch","metadata"));
  if (JSON.stringify(question.metadata?.requiredCapabilityIds) !== JSON.stringify(P03F33_REQUIRED_CAPABILITY_IDS)) errors.push(issue("p03f33_fraction_capability_set_invalid","metadata.requiredCapabilityIds"));

  if (definition.operationFamilyId === "fraction_compare") {
    const ints = [question.leftNumerator, question.leftDenominator, question.rightNumerator, question.rightDenominator];
    if (!ints.every(Number.isSafeInteger) || question.leftDenominator <= 0 || question.rightDenominator <= 0) errors.push(issue("p03f33_compare_operand_invalid","fractionOperands"));
    else {
      const expected = compareProducts(question.leftNumerator, question.leftDenominator, question.rightNumerator, question.rightDenominator);
      if (question.comparison !== expected || question.answerText !== expected || question.finalAnswer !== expected) errors.push(issue("p03f33_compare_answer_invalid","answerText"));
    }
  } else if (definition.operationFamilyId === "number_line") {
    const ints = [question.originNumerator, question.originDenominator, question.unitStepNumerator, question.unitStepDenominator, question.stepCount, question.coordinateNumerator, question.coordinateDenominator, question.distanceNumerator, question.distanceDenominator];
    if (!ints.every(Number.isSafeInteger) || question.originDenominator <= 0 || question.unitStepDenominator <= 0 || question.unitStepNumerator <= 0 || question.stepCount < 0) errors.push(issue("p03f33_number_line_operand_invalid","numberLineOperands"));
    else {
      const originScaled = question.originNumerator * question.unitStepDenominator;
      const stepScaled = question.stepCount * question.unitStepNumerator * question.originDenominator;
      const coordinate = normalize(originScaled + stepScaled, question.originDenominator * question.unitStepDenominator);
      const distance = normalize(question.stepCount * question.unitStepNumerator, question.unitStepDenominator);
      const expected = definition.requestedUnknownRole === "coordinate" ? coordinate : distance;
      if (question.coordinateNumerator !== coordinate.numerator || question.coordinateDenominator !== coordinate.denominator || question.distanceNumerator !== distance.numerator || question.distanceDenominator !== distance.denominator || question.answerText !== rationalText(expected) || question.finalAnswer !== question.answerText) errors.push(issue("p03f33_number_line_answer_invalid","answerText"));
    }
  } else {
    const ints = [question.leftNumerator, question.leftDenominator, question.rightNumerator, question.rightDenominator];
    if (!ints.every(Number.isSafeInteger) || question.leftDenominator <= 0 || question.rightDenominator <= 0 || question.leftDenominator !== question.rightDenominator || !["add","sub"].includes(question.arithmeticOperation)) errors.push(issue("p03f33_add_sub_operand_invalid","fractionOperands"));
    else {
      const raw = question.arithmeticOperation === "add" ? question.leftNumerator + question.rightNumerator : question.leftNumerator - question.rightNumerator;
      if (raw < 0) errors.push(issue("p03f33_negative_subtraction_invalid","resultNumerator"));
      const expected = normalize(raw, question.leftDenominator);
      if (question.resultNumerator !== expected.numerator || question.resultDenominator !== expected.denominator || question.answerText !== rationalText(expected) || question.finalAnswer !== question.answerText) errors.push(issue("p03f33_add_sub_answer_invalid","answerText"));
    }
  }
  return { ok:errors.length===0, errors, warnings:[] };
}

export function generateG4AU06P03F33Questions(options = {}) {
  const plan = options.plan ?? buildBatchABrowserPlan(options);
  if (!canGenerateG4AU06P03F33Questions(plan)) return { ok:false, errors:[issue("p03f33_plan_not_supported","patternSpecIds")], warnings:[], questions:[], plan };
  const count = Number(options.questionCount ?? plan.questionCount ?? 24);
  if (!Number.isInteger(count) || count < 1 || count > 240) return { ok:false, errors:[issue("p03f33_question_count_invalid","questionCount")], warnings:[], questions:[], plan };
  const occurrenceBySpec = new Map(plan.patternSpecIds.map((id) => [id, 0]));
  const questions = Array.from({ length:count }, (_, index) => {
    const patternSpecId = plan.patternSpecIds[index % plan.patternSpecIds.length];
    const ordinal = occurrenceBySpec.get(patternSpecId) ?? 0;
    occurrenceBySpec.set(patternSpecId, ordinal + 1);
    return buildQuestion(patternSpecId, ordinal, options.generationSeed ?? plan.generationSeed);
  });
  const errors = questions.flatMap((question, index) => validateG4AU06P03F33Question(question).errors.map((error) => ({ ...error, path:`questions[${index}].${error.path}` })));
  if (new Set(questions.map((question) => question.blankedDisplayText)).size !== questions.length) errors.push(issue("p03f33_duplicate_prompt_detected","questions"));
  const allocation = plan.patternSpecIds.map((patternSpecId) => Object.freeze({ patternSpecId, questionCount:questions.filter((q) => q.patternSpecId === patternSpecId).length }));
  return Object.freeze({ ok:errors.length===0, errors:Object.freeze(errors), warnings:Object.freeze([]), questions:Object.freeze(questions), allocation:Object.freeze(allocation), plan });
}
