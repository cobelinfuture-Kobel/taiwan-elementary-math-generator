import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f30.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f30-extension.js";
import {
  G5A_U06_P03F30_NUMERIC_PATTERN_SPEC_IDS,
  G5A_U06_P03F30_SOURCE_ID,
  P03F30_REQUIRED_CAPABILITY_IDS,
} from "../registry/g5a-u06-rank8-fraction-selector-projection-p03f30.js";

const ALL_IDS = new Set(G5A_U06_P03F30_NUMERIC_PATTERN_SPEC_IDS);
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

function hashSeed(value) {
  let hash = 2166136261;
  for (const character of String(value ?? "p03f30")) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function rotate(rows, seed) {
  const offset = hashSeed(seed) % rows.length;
  return Object.freeze([...rows.slice(offset), ...rows.slice(0, offset)]);
}

function buildArithmeticCasePool(operation) {
  const rows = [];
  const seen = new Set();
  for (let leftDenominator = 2; leftDenominator <= 18; leftDenominator += 1) {
    for (let rightDenominator = leftDenominator + 1; rightDenominator <= 18; rightDenominator += 1) {
      for (let leftNumerator = 1; leftNumerator <= leftDenominator + 2; leftNumerator += 1) {
        if (gcd(leftNumerator, leftDenominator) !== 1) continue;
        for (let rightNumerator = 1; rightNumerator <= rightDenominator + 2; rightNumerator += 1) {
          if (gcd(rightNumerator, rightDenominator) !== 1) continue;
          let row = { leftNumerator, leftDenominator, rightNumerator, rightDenominator };
          const relation = compareProducts(leftNumerator, leftDenominator, rightNumerator, rightDenominator);
          if (operation === "sub" && relation === "=") continue;
          if (operation === "sub" && relation === "<") row = {
            leftNumerator: rightNumerator,
            leftDenominator: rightDenominator,
            rightNumerator: leftNumerator,
            rightDenominator: leftDenominator,
          };
          const key = `${row.leftNumerator}/${row.leftDenominator}|${row.rightNumerator}/${row.rightDenominator}`;
          if (seen.has(key)) continue;
          seen.add(key);
          rows.push(Object.freeze(row));
        }
      }
    }
  }
  return Object.freeze(rows);
}

function buildReciprocalCasePool() {
  const rows = [];
  for (let firstDenominator = 2; firstDenominator <= 25; firstDenominator += 1) {
    for (let secondDenominator = firstDenominator + 1; secondDenominator <= 25; secondDenominator += 1) {
      rows.push(Object.freeze({ firstDenominator, secondDenominator }));
    }
  }
  return Object.freeze(rows);
}

function buildCompareCasePool() {
  const nonEqual = buildArithmeticCasePool("add").filter((row) => compareProducts(
    row.leftNumerator, row.leftDenominator, row.rightNumerator, row.rightDenominator,
  ) !== "=");
  const equal = [];
  for (let denominator = 2; denominator <= 12; denominator += 1) {
    for (let numerator = 1; numerator < denominator; numerator += 1) {
      if (gcd(numerator, denominator) !== 1) continue;
      for (let scale = 2; scale <= 5 && denominator * scale <= 30; scale += 1) {
        equal.push(Object.freeze({
          leftNumerator: numerator,
          leftDenominator: denominator,
          rightNumerator: numerator * scale,
          rightDenominator: denominator * scale,
        }));
      }
    }
  }
  const rows = [];
  let nonEqualIndex = 0;
  let equalIndex = 0;
  while (rows.length < 480) {
    if (rows.length % 5 === 4) {
      rows.push(equal[equalIndex % equal.length]);
      equalIndex += 1;
    } else {
      const row = nonEqual[nonEqualIndex % nonEqual.length];
      rows.push(nonEqualIndex % 2 === 0 ? row : Object.freeze({
        leftNumerator: row.rightNumerator,
        leftDenominator: row.rightDenominator,
        rightNumerator: row.leftNumerator,
        rightDenominator: row.leftDenominator,
      }));
      nonEqualIndex += 1;
    }
  }
  return Object.freeze(rows);
}

const RECIPROCAL_CASE_POOL = buildReciprocalCasePool();
const ADD_CASE_POOL = buildArithmeticCasePool("add");
const SUB_CASE_POOL = buildArithmeticCasePool("sub");
const COMPARE_CASE_POOL = buildCompareCasePool();
export const P03F30_DISTINCT_CAPACITY_BY_PATTERN = Object.freeze({
  [G5A_U06_P03F30_NUMERIC_PATTERN_SPEC_IDS[0]]: RECIPROCAL_CASE_POOL.length,
  [G5A_U06_P03F30_NUMERIC_PATTERN_SPEC_IDS[1]]: ADD_CASE_POOL.length,
  [G5A_U06_P03F30_NUMERIC_PATTERN_SPEC_IDS[2]]: COMPARE_CASE_POOL.length,
  [G5A_U06_P03F30_NUMERIC_PATTERN_SPEC_IDS[3]]: SUB_CASE_POOL.length,
});

function casePoolForPattern(patternSpecId) {
  if (patternSpecId === G5A_U06_P03F30_NUMERIC_PATTERN_SPEC_IDS[0]) return RECIPROCAL_CASE_POOL;
  if (patternSpecId === G5A_U06_P03F30_NUMERIC_PATTERN_SPEC_IDS[1]) return ADD_CASE_POOL;
  if (patternSpecId === G5A_U06_P03F30_NUMERIC_PATTERN_SPEC_IDS[2]) return COMPARE_CASE_POOL;
  return SUB_CASE_POOL;
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

function buildQuestion(patternSpecId, ordinal, fixture) {
  const definition = getBatchABrowserPatternDefinition(patternSpecId);
  if (definition.operationFamilyId === "reciprocal_sum") {
    const result = normalize(fixture.firstDenominator + fixture.secondDenominator, fixture.firstDenominator * fixture.secondDenominator);
    const answerText = fractionText(result);
    const promptText = `1/${fixture.firstDenominator} + 1/${fixture.secondDenominator} = ?`;
    return Object.freeze({ id:`${patternSpecId}-${ordinal+1}`, sourceId:G5A_U06_P03F30_SOURCE_ID, patternSpecId, kind:definition.kind, operation:"reciprocal_sum", operationFamilyId:"reciprocal_sum", questionMode:"numeric", mode:"NUMERIC", promptText, questionText:promptText, blankedDisplayText:promptText, displayText:`${promptText} ${answerText}`, answerText, finalAnswer:answerText, ...fixture, resultNumerator:result.numerator, resultDenominator:result.denominator, metadata:metadata(definition), globalContextProduction:null });
  }
  if (definition.operationFamilyId === "fraction_compare") {
    const answerText = compareProducts(fixture.leftNumerator, fixture.leftDenominator, fixture.rightNumerator, fixture.rightDenominator);
    const promptText = `${fixture.leftNumerator}/${fixture.leftDenominator} ○ ${fixture.rightNumerator}/${fixture.rightDenominator}，請填入 <、= 或 >。`;
    return Object.freeze({ id:`${patternSpecId}-${ordinal+1}`, sourceId:G5A_U06_P03F30_SOURCE_ID, patternSpecId, kind:definition.kind, operation:"fraction_compare", operationFamilyId:"fraction_compare", questionMode:"numeric", mode:"NUMERIC", promptText, questionText:promptText, blankedDisplayText:promptText, displayText:`${promptText} ${answerText}`, answerText, finalAnswer:answerText, ...fixture, comparison:answerText, metadata:metadata(definition), globalContextProduction:null });
  }
  const arithmeticOperation = definition.knowledgePointId.endsWith("_add") ? "add" : "sub";
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
  const requiredPerSpec = new Map(plan.patternSpecIds.map((id, index) => [id, Math.floor(count / plan.patternSpecIds.length) + (index < count % plan.patternSpecIds.length ? 1 : 0)]));
  const insufficient = [...requiredPerSpec].find(([id, required]) => required > (P03F30_DISTINCT_CAPACITY_BY_PATTERN[id] ?? 0));
  if (insufficient) return { ok:false, errors:[issue("p03f30_distinct_capacity_exceeded",`patternSpecIds.${insufficient[0]}`)], warnings:[], questions:[], plan };
  const seed = options.generationSeed ?? plan.generationSeed;
  const fixturesBySpec = new Map(plan.patternSpecIds.map((id) => [id, rotate(casePoolForPattern(id), `${seed}:${id}`)]));
  const questions = Array.from({ length: count }, (_, index) => {
    const patternSpecId = plan.patternSpecIds[index % plan.patternSpecIds.length];
    const ordinal = occurrenceBySpec.get(patternSpecId) ?? 0;
    occurrenceBySpec.set(patternSpecId, ordinal + 1);
    return buildQuestion(patternSpecId, ordinal, fixturesBySpec.get(patternSpecId)[ordinal]);
  });
  const errors = questions.flatMap((question, index) => validateG5AU06P03F30Question(question).errors.map((error) => ({ ...error, path:`questions[${index}].${error.path}` })));
  if (new Set(questions.map((question) => question.blankedDisplayText)).size !== questions.length) errors.push(issue("p03f30_duplicate_prompt_detected", "questions"));
  const allocation = plan.patternSpecIds.map((patternSpecId) => Object.freeze({ patternSpecId, questionCount: questions.filter((q) => q.patternSpecId === patternSpecId).length }));
  return Object.freeze({ ok:errors.length===0, errors:Object.freeze(errors), warnings:Object.freeze([]), questions:Object.freeze(questions), allocation:Object.freeze(allocation), plan });
}
