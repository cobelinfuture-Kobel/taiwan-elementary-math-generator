import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f43-extension.js";
import {
  G4B_U08_P03F43_BOUNDS_SPEC_ID,
  G4B_U08_P03F43_COORDINATE_SPEC_ID,
  G4B_U08_P03F43_DISTANCE_SPEC_ID,
  G4B_U08_P03F43_SOURCE_ID,
  P03F43_SPEC_IDS,
} from "../registry/g4b-u08-rank10-fraction-selector-projection-p03f43.js";

const ALL_IDS = new Set(P03F43_SPEC_IDS);
const DENOMINATORS = Object.freeze([2, 3, 4, 5, 6, 8]);
const issue = (code, path) => ({ code, severity: "error", path, message: code });
const seedOffset = (seed, size) => [...String(seed ?? "p03f43")].reduce((sum, char) => (sum + char.charCodeAt(0)) % Math.max(1, size), 0);
const gcd = (a, b) => { let x = Math.abs(a), y = Math.abs(b); while (y) [x, y] = [y, x % y]; return x || 1; };
function normalize(numerator, denominator) {
  if (!Number.isSafeInteger(numerator) || !Number.isSafeInteger(denominator) || denominator === 0) throw new Error("P03F43_INVALID_RATIONAL");
  const sign = denominator < 0 ? -1 : 1;
  const n = numerator * sign;
  const d = Math.abs(denominator);
  const g = gcd(n, d);
  return Object.freeze({ numerator: n / g, denominator: d / g });
}
function compareRational(an, ad, bn, bd) {
  const left = an * bd;
  const right = bn * ad;
  return left < right ? -1 : left > right ? 1 : 0;
}
function fractionText(value) { return value.denominator === 1 ? String(value.numerator) : `${value.numerator}/${value.denominator}`; }
function mixedText(value) {
  const normalized = normalize(value.numerator, value.denominator);
  if (normalized.numerator < normalized.denominator) return fractionText(normalized);
  const whole = Math.floor(normalized.numerator / normalized.denominator);
  const remainder = normalized.numerator % normalized.denominator;
  return remainder === 0 ? String(whole) : `${whole} ${remainder}/${normalized.denominator}`;
}
function metadata(definition) {
  return Object.freeze({
    patternId: definition.patternSpecId,
    sourceId: G4B_U08_P03F43_SOURCE_ID,
    patternTags: Object.freeze(["full_product_w3_slice043", definition.patternSpecId]),
    skillTags: definition.skillTags,
    difficultyTags: definition.difficultyTags,
    curriculumNodeIds: Object.freeze([G4B_U08_P03F43_SOURCE_ID]),
    canonicalSkillIds: definition.canonicalSkillIds,
    knowledgePointId: definition.knowledgePointId,
    patternGroupId: definition.patternGroupId,
    operationFamilyId: definition.operationFamilyId,
    requestedUnknownRole: definition.requestedUnknownRole,
    requiredCapabilityIds: definition.requiredCapabilityIds,
    applicationClassification: definition.applicationClassification,
    productAdmissionTask: "P03F_W3DirectProductVerticalSlice043Implementation",
    generatorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
    validatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
    globalContextAuthorityPath: null,
  });
}
function makeTicks(denominator, maxStep) {
  return Object.freeze(Array.from({ length: maxStep + 1 }, (_, index) => {
    const value = normalize(index, denominator);
    return Object.freeze({ index, numerator: value.numerator, denominator: value.denominator, label: mixedText(value) });
  }));
}
function buildCoordinate(definition, ordinal, seed) {
  const offset = seedOffset(seed, 97);
  const denominator = DENOMINATORS[(ordinal + offset) % DENOMINATORS.length];
  const stepCount = 1 + (ordinal * 2) + (offset % 2);
  const coordinate = normalize(stepCount, denominator);
  const maxStep = Math.max(denominator * 2, stepCount + 2);
  const ticks = makeTicks(denominator, maxStep);
  const answerText = mixedText(coordinate);
  const promptText = `數線每一小格代表 1/${denominator}，從 0 向右第 ${stepCount} 格的位置是多少？`;
  return Object.freeze({
    id: `${definition.patternSpecId}-${ordinal + 1}`,
    sourceId: G4B_U08_P03F43_SOURCE_ID,
    patternSpecId: definition.patternSpecId,
    kind: definition.kind,
    operation: "number_line",
    operationFamilyId: "number_line",
    numberLineTask: "coordinate",
    questionMode: "numeric",
    mode: "NUMERIC",
    promptText,
    questionText: promptText,
    blankedDisplayText: promptText,
    displayText: `${promptText} ${answerText}`,
    answerText,
    finalAnswer: answerText,
    originNumerator: 0,
    originDenominator: 1,
    unitStepNumerator: 1,
    unitStepDenominator: denominator,
    stepCount,
    coordinateNumerator: coordinate.numerator,
    coordinateDenominator: coordinate.denominator,
    distanceNumerator: coordinate.numerator,
    distanceDenominator: coordinate.denominator,
    numberLine: Object.freeze({
      kind: "fraction_number_line",
      tickCount: ticks.length,
      ticks,
      points: Object.freeze([Object.freeze({ label: "P", tickIndex: stepCount, numerator: coordinate.numerator, denominator: coordinate.denominator })]),
      ariaLabel: "分數數線，標示目標位置 P",
    }),
    metadata: metadata(definition),
    globalContextProduction: null,
  });
}
function buildDistance(definition, ordinal, seed) {
  const offset = seedOffset(seed, 89);
  const denominator = DENOMINATORS[(ordinal + offset) % DENOMINATORS.length];
  const leftStep = ordinal + (offset % 2);
  const gap = 1 + ((ordinal + offset) % 3);
  const rightStep = leftStep + gap;
  const left = normalize(leftStep, denominator);
  const right = normalize(rightStep, denominator);
  const distance = normalize(rightStep - leftStep, denominator);
  const maxStep = Math.max(denominator * 2, rightStep + 2);
  const ticks = makeTicks(denominator, maxStep);
  const answerText = mixedText(distance);
  const promptText = `數線上 A=${mixedText(left)}、B=${mixedText(right)}，A 到 B 的距離是多少？`;
  return Object.freeze({
    id: `${definition.patternSpecId}-${ordinal + 1}`,
    sourceId: G4B_U08_P03F43_SOURCE_ID,
    patternSpecId: definition.patternSpecId,
    kind: definition.kind,
    operation: "number_line",
    operationFamilyId: "number_line",
    numberLineTask: "distance",
    questionMode: "numeric",
    mode: "NUMERIC",
    promptText,
    questionText: promptText,
    blankedDisplayText: promptText,
    displayText: `${promptText} ${answerText}`,
    answerText,
    finalAnswer: answerText,
    originNumerator: left.numerator,
    originDenominator: left.denominator,
    unitStepNumerator: 1,
    unitStepDenominator: denominator,
    stepCount: gap,
    coordinateNumerator: right.numerator,
    coordinateDenominator: right.denominator,
    leftCoordinateNumerator: left.numerator,
    leftCoordinateDenominator: left.denominator,
    rightCoordinateNumerator: right.numerator,
    rightCoordinateDenominator: right.denominator,
    distanceNumerator: distance.numerator,
    distanceDenominator: distance.denominator,
    numberLine: Object.freeze({
      kind: "fraction_number_line",
      tickCount: ticks.length,
      ticks,
      points: Object.freeze([
        Object.freeze({ label: "A", tickIndex: leftStep, numerator: left.numerator, denominator: left.denominator }),
        Object.freeze({ label: "B", tickIndex: rightStep, numerator: right.numerator, denominator: right.denominator }),
      ]),
      ariaLabel: "分數數線，標示 A、B 兩點",
    }),
    metadata: metadata(definition),
    globalContextProduction: null,
  });
}
function enumeratePossibleValues(lowerNumerator, upperNumerator) {
  const values = [];
  for (let candidate = lowerNumerator + 1; candidate < upperNumerator; candidate += 1) values.push(candidate);
  return values;
}
function buildBounds(definition, ordinal, seed) {
  const offset = seedOffset(seed, 83);
  const denominator = DENOMINATORS[(ordinal + offset) % DENOMINATORS.length];
  const lowerWhole = 1 + ((ordinal + offset) % 2);
  const lowerRemainder = 1 + ((ordinal * 3 + offset) % Math.max(1, denominator - 1));
  const lowerNumerator = lowerWhole * denominator + lowerRemainder;
  const width = 2 + ((ordinal * 5 + offset) % 4);
  const upperNumerator = lowerNumerator + width + 1;
  const possibleValues = Object.freeze(enumeratePossibleValues(lowerNumerator, upperNumerator));
  const lower = normalize(lowerNumerator, denominator);
  const upper = normalize(upperNumerator, denominator);
  const answerText = possibleValues.join("、");
  const promptText = `已知 ${mixedText(lower)} < □/${denominator} < ${mixedText(upper)}，□ 可能是哪些整數？`;
  return Object.freeze({
    id: `${definition.patternSpecId}-${ordinal + 1}`,
    sourceId: G4B_U08_P03F43_SOURCE_ID,
    patternSpecId: definition.patternSpecId,
    kind: definition.kind,
    operation: "fraction_bounds",
    operationFamilyId: "fraction_bounds",
    questionMode: "numeric",
    mode: "NUMERIC",
    promptText,
    questionText: promptText,
    blankedDisplayText: promptText,
    displayText: `${promptText} ${answerText}`,
    answerText,
    finalAnswer: answerText,
    lowerBoundNumerator: lowerNumerator,
    lowerBoundDenominator: denominator,
    upperBoundNumerator: upperNumerator,
    upperBoundDenominator: denominator,
    unknownDenominator: denominator,
    possibleValues,
    metadata: metadata(definition),
    globalContextProduction: null,
  });
}
function buildQuestion(patternSpecId, ordinal, seed) {
  const definition = getBatchABrowserPatternDefinition(patternSpecId);
  if (patternSpecId === G4B_U08_P03F43_COORDINATE_SPEC_ID) return buildCoordinate(definition, ordinal, seed);
  if (patternSpecId === G4B_U08_P03F43_DISTANCE_SPEC_ID) return buildDistance(definition, ordinal, seed);
  if (patternSpecId === G4B_U08_P03F43_BOUNDS_SPEC_ID) return buildBounds(definition, ordinal, seed);
  throw new Error("P03F43_PATTERN_NOT_SUPPORTED");
}

export function canGenerateG4BU08P03F43Questions(plan = {}) {
  return plan.sourceId === G4B_U08_P03F43_SOURCE_ID
    && Array.isArray(plan.patternSpecIds)
    && plan.patternSpecIds.length > 0
    && plan.patternSpecIds.every((id) => ALL_IDS.has(id));
}
export function validateG4BU08P03F43Question(question = {}) {
  const errors = [];
  const patternSpecId = question.patternSpecId ?? question.metadata?.patternId;
  const definition = getBatchABrowserPatternDefinition(patternSpecId);
  if (!ALL_IDS.has(patternSpecId) || !definition) errors.push(issue("p03f43_pattern_invalid", "patternSpecId"));
  if (question.sourceId !== G4B_U08_P03F43_SOURCE_ID || question.metadata?.sourceId !== G4B_U08_P03F43_SOURCE_ID) errors.push(issue("p03f43_source_mismatch", "sourceId"));
  if (question.questionMode !== "numeric" || question.globalContextProduction != null || question.metadata?.globalContextAuthorityPath != null) errors.push(issue("p03f43_application_scope_leak", "questionMode"));
  if (question.metadata?.requiredCapabilityIds?.includes("cap_fraction_arithmetic")) errors.push(issue("p03f43_fraction_arithmetic_leak", "metadata.requiredCapabilityIds"));
  if (question.metadata?.knowledgePointId !== definition?.knowledgePointId || question.metadata?.patternGroupId !== definition?.patternGroupId) errors.push(issue("p03f43_lineage_mismatch", "metadata"));

  if (patternSpecId === G4B_U08_P03F43_COORDINATE_SPEC_ID) {
    const expected = normalize(question.originNumerator * question.unitStepDenominator + question.stepCount * question.unitStepNumerator * question.originDenominator, question.originDenominator * question.unitStepDenominator);
    if (question.unitStepDenominator <= 0 || question.stepCount < 0 || question.coordinateNumerator !== expected.numerator || question.coordinateDenominator !== expected.denominator || question.answerText !== mixedText(expected) || question.numberLine?.kind !== "fraction_number_line") errors.push(issue("p03f43_number_line_coordinate_invalid", "answerText"));
  } else if (patternSpecId === G4B_U08_P03F43_DISTANCE_SPEC_ID) {
    const rawNumerator = Math.abs(question.rightCoordinateNumerator * question.leftCoordinateDenominator - question.leftCoordinateNumerator * question.rightCoordinateDenominator);
    const rawDenominator = question.leftCoordinateDenominator * question.rightCoordinateDenominator;
    const expected = normalize(rawNumerator, rawDenominator);
    if (question.leftCoordinateDenominator <= 0 || question.rightCoordinateDenominator <= 0 || question.distanceNumerator !== expected.numerator || question.distanceDenominator !== expected.denominator || question.answerText !== mixedText(expected) || question.numberLine?.kind !== "fraction_number_line") errors.push(issue("p03f43_number_line_distance_invalid", "answerText"));
  } else if (patternSpecId === G4B_U08_P03F43_BOUNDS_SPEC_ID) {
    if (question.lowerBoundDenominator <= 0 || question.upperBoundDenominator !== question.lowerBoundDenominator || question.unknownDenominator !== question.lowerBoundDenominator) errors.push(issue("p03f43_bounds_denominator_invalid", "bounds"));
    const expected = enumeratePossibleValues(question.lowerBoundNumerator, question.upperBoundNumerator);
    const actual = Array.isArray(question.possibleValues) ? question.possibleValues : [];
    if (expected.length === 0 || JSON.stringify(actual) !== JSON.stringify(expected) || question.answerText !== expected.join("、") || actual.some((value) => compareRational(value, question.unknownDenominator, question.lowerBoundNumerator, question.lowerBoundDenominator) <= 0 || compareRational(value, question.unknownDenominator, question.upperBoundNumerator, question.upperBoundDenominator) >= 0)) errors.push(issue("p03f43_bounds_possible_values_invalid", "possibleValues"));
  }
  if (question.finalAnswer !== question.answerText) errors.push(issue("p03f43_final_answer_mismatch", "finalAnswer"));
  return { ok: errors.length === 0, errors, warnings: [] };
}
export function generateG4BU08P03F43Questions(options = {}) {
  const plan = options.plan;
  if (!canGenerateG4BU08P03F43Questions(plan)) return { ok: false, errors: [issue("p03f43_plan_not_supported", "patternSpecIds")], warnings: [], questions: [], allocation: [], plan };
  const count = Number(options.questionCount ?? plan.questionCount ?? 24);
  if (!Number.isInteger(count) || count < 1 || count > 240) return { ok: false, errors: [issue("p03f43_question_count_invalid", "questionCount")], warnings: [], questions: [], allocation: [], plan };
  const occurrences = new Map(plan.patternSpecIds.map((id) => [id, 0]));
  const seed = options.generationSeed ?? plan.generationSeed;
  const questions = Array.from({ length: count }, (_, index) => {
    const patternSpecId = plan.patternSpecIds[index % plan.patternSpecIds.length];
    const ordinal = occurrences.get(patternSpecId) ?? 0;
    occurrences.set(patternSpecId, ordinal + 1);
    return buildQuestion(patternSpecId, ordinal, seed);
  });
  const errors = questions.flatMap((question, index) => validateG4BU08P03F43Question(question).errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` })));
  if (new Set(questions.map((question) => `${question.patternSpecId}|${question.blankedDisplayText}`)).size !== questions.length) errors.push(issue("p03f43_duplicate_prompt_detected", "questions"));
  const allocation = plan.patternSpecIds.map((patternSpecId) => Object.freeze({ patternSpecId, questionCount: questions.filter((question) => question.patternSpecId === patternSpecId).length }));
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), warnings: Object.freeze([]), questions: Object.freeze(questions), allocation: Object.freeze(allocation), plan });
}