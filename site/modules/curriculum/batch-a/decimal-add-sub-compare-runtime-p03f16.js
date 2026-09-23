import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f16.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f16-extension.js";
import {
  G3B_U09_DECIMAL_ARITHMETIC_SOURCE_ID,
  G3B_U09_DECIMAL_ADD_SUB_PATTERN_SPEC_IDS,
  G3B_U09_DECIMAL_COMPARE_PATTERN_SPEC_IDS,
} from "../registry/g3b-u09-decimal-add-sub-compare-selector-projection.js";

const ALL_IDS = new Set([...G3B_U09_DECIMAL_ADD_SUB_PATTERN_SPEC_IDS, ...G3B_U09_DECIMAL_COMPARE_PATTERN_SPEC_IDS]);
const seedOffset = (seed, size) => [...String(seed ?? "p03f16")].reduce((sum, char) => (sum + char.charCodeAt(0)) % size, 0);
const decimalText = (tenths) => `${Math.floor(tenths / 10)}.${Math.abs(tenths % 10)}`;
const compare = (a, b) => a < b ? "<" : a > b ? ">" : "=";

function fixturesFor(patternSpecId) {
  const rows = [];
  if (patternSpecId === G3B_U09_DECIMAL_ADD_SUB_PATTERN_SPEC_IDS[0]) {
    for (let left = 1; left <= 89; left += 1) for (let right = 1; right <= 99 - left; right += 7) rows.push({ left, right });
  } else if (patternSpecId === G3B_U09_DECIMAL_ADD_SUB_PATTERN_SPEC_IDS[1]) {
    for (let left = 10; left <= 99; left += 1) for (let right = 1; right <= left; right += 6) rows.push({ left, right });
  } else {
    for (let left = 0; left <= 99; left += 3) for (let right = 0; right <= 99; right += 7) if (left !== right || left % 2 === 0) rows.push({ left, right });
  }
  return rows;
}

function metadata(definition) {
  return Object.freeze({
    patternId: definition.patternSpecId,
    sourceId: G3B_U09_DECIMAL_ARITHMETIC_SOURCE_ID,
    patternTags: Object.freeze(["full_product_w3_slice016", definition.patternSpecId]),
    skillTags: definition.skillTags,
    difficultyTags: definition.difficultyTags,
    curriculumNodeIds: Object.freeze([G3B_U09_DECIMAL_ARITHMETIC_SOURCE_ID]),
    canonicalSkillIds: definition.canonicalSkillIds,
    knowledgePointId: definition.knowledgePointId,
    patternGroupId: definition.patternGroupId,
    operationFamilyId: definition.operationFamilyId,
    requestedUnknownRole: definition.requestedUnknownRole,
    requiredCapabilityIds: definition.requiredCapabilityIds,
    applicationClassification: definition.applicationClassification,
    productAdmissionTask: "P03F_W3DirectProductVerticalSlice016Implementation",
    generatorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
    validatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
    globalContextAuthorityPath: null,
  });
}

function buildQuestion(patternSpecId, ordinal, seed) {
  const definition = getBatchABrowserPatternDefinition(patternSpecId);
  const fixtures = fixturesFor(patternSpecId);
  const fixture = fixtures[(ordinal + seedOffset(seed, fixtures.length)) % fixtures.length];
  const { left, right } = fixture;
  let answerText;
  let resultTenths = null;
  let relation = null;
  let promptText;
  if (definition.operation === "add" || definition.operation === "sub") {
    resultTenths = definition.operation === "add" ? left + right : left - right;
    answerText = decimalText(resultTenths);
    promptText = `${decimalText(left)} ${definition.operation === "add" ? "+" : "−"} ${decimalText(right)} = ?`;
  } else {
    relation = compare(left, right);
    answerText = relation;
    promptText = `${decimalText(left)} ○ ${decimalText(right)}，請填入 <、= 或 >。`;
  }
  return Object.freeze({
    id: `${patternSpecId}-${ordinal + 1}`,
    sourceId: G3B_U09_DECIMAL_ARITHMETIC_SOURCE_ID,
    patternSpecId,
    kind: definition.kind,
    operation: definition.operation,
    operationFamilyId: definition.operationFamilyId,
    questionMode: "numeric",
    mode: "NUMERIC",
    promptText,
    questionText: promptText,
    blankedDisplayText: promptText,
    displayText: `${promptText} ${answerText}`,
    answerText,
    finalAnswer: answerText,
    leftTenths: left,
    rightTenths: right,
    leftDecimal: decimalText(left),
    rightDecimal: decimalText(right),
    resultTenths,
    resultDecimal: resultTenths == null ? null : decimalText(resultTenths),
    comparison: relation,
    decimalPlaces: 1,
    metadata: metadata(definition),
    globalContextProduction: null,
  });
}

export function canGenerateG3BU09DecimalSlice016Questions(plan = {}) {
  return plan.sourceId === G3B_U09_DECIMAL_ARITHMETIC_SOURCE_ID
    && Array.isArray(plan.patternSpecIds)
    && plan.patternSpecIds.length > 0
    && plan.patternSpecIds.every((id) => ALL_IDS.has(id));
}

export function validateG3BU09DecimalSlice016Question(question = {}) {
  const errors = [];
  const add = (code, path) => errors.push({ code, severity: "error", path, message: code });
  const id = question.patternSpecId ?? question.metadata?.patternId;
  const definition = getBatchABrowserPatternDefinition(id);
  if (!ALL_IDS.has(id) || !definition) add("p03f16_pattern_invalid", "patternSpecId");
  if (question.sourceId !== G3B_U09_DECIMAL_ARITHMETIC_SOURCE_ID || question.metadata?.sourceId !== G3B_U09_DECIMAL_ARITHMETIC_SOURCE_ID) add("p03f16_source_mismatch", "sourceId");
  if (![question.leftTenths, question.rightTenths].every(Number.isSafeInteger) || question.leftTenths < 0 || question.rightTenths < 0) add("p03f16_decimal_value_invalid", "decimalValue");
  if (question.decimalPlaces !== 1 || !/^\d+\.\d$/.test(String(question.leftDecimal)) || !/^\d+\.\d$/.test(String(question.rightDecimal))) add("p03f16_one_decimal_required", "decimalPlaces");
  if (question.globalContextProduction != null || question.metadata?.globalContextAuthorityPath != null) add("p03f16_global_context_leak", "globalContextProduction");
  if (definition?.operation === "add" || definition?.operation === "sub") {
    const expected = definition.operation === "add" ? question.leftTenths + question.rightTenths : question.leftTenths - question.rightTenths;
    if (expected < 0) add("p03f16_negative_result_forbidden", "resultTenths");
    if (question.resultTenths !== expected || question.resultDecimal !== decimalText(expected)) add("p03f16_decimal_arithmetic_invalid", "answerText");
    if (question.answerText !== decimalText(expected) || question.finalAnswer !== question.answerText) add("p03f16_decimal_answer_invalid", "answerText");
    if (!question.metadata?.requiredCapabilityIds?.includes("cap_decimal_arithmetic")) add("p03f16_decimal_arithmetic_capability_missing", "metadata.requiredCapabilityIds");
  } else {
    const expected = compare(question.leftTenths, question.rightTenths);
    if (question.comparison !== expected || question.answerText !== expected || question.finalAnswer !== expected) add("p03f16_decimal_compare_invalid", "answerText");
    if (question.metadata?.requiredCapabilityIds?.includes("cap_decimal_arithmetic")) add("p03f16_compare_arithmetic_capability_leak", "metadata.requiredCapabilityIds");
  }
  if (question.metadata?.knowledgePointId !== definition?.knowledgePointId || question.metadata?.patternGroupId !== definition?.patternGroupId) add("p03f16_lineage_mismatch", "metadata");
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function generateG3BU09DecimalSlice016Questions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!canGenerateG3BU09DecimalSlice016Questions(plan)) return { ok: false, errors: [{ code: "p03f16_plan_not_supported", severity: "error", path: "patternSpecIds", message: "p03f16_plan_not_supported" }], warnings: [], questions: [], plan };
  const count = Number.isInteger(plan.questionCount) ? plan.questionCount : 18;
  const ids = plan.patternSpecIds;
  const questions = Array.from({ length: count }, (_, index) => buildQuestion(ids[index % ids.length], index, plan.generationSeed));
  const validationErrors = questions.flatMap((question, index) => validateG3BU09DecimalSlice016Question(question).errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` })));
  const allocation = ids.map((patternSpecId) => Object.freeze({ patternSpecId, questionCount: questions.filter((q) => q.patternSpecId === patternSpecId).length }));
  return Object.freeze({ ok: validationErrors.length === 0, errors: Object.freeze(validationErrors), warnings: Object.freeze([]), questions: Object.freeze(questions), plan: Object.freeze(plan), allocation: Object.freeze(allocation) });
}
