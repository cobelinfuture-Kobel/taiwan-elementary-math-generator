import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f15.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f15-extension.js";
import {
  G3B_U07_SAME_DENOMINATOR_SOURCE_ID,
  G3B_U07_SAME_DENOMINATOR_ADD_SUB_PATTERN_SPEC_IDS,
  G3B_U07_SAME_DENOMINATOR_COMPARE_PATTERN_SPEC_IDS,
} from "../registry/g3b-u07-same-denominator-selector-projection.js";

const ALL_IDS = new Set([...G3B_U07_SAME_DENOMINATOR_ADD_SUB_PATTERN_SPEC_IDS, ...G3B_U07_SAME_DENOMINATOR_COMPARE_PATTERN_SPEC_IDS]);
const seedOffset = (seed, size) => [...String(seed ?? "p03f15")].reduce((sum, char) => (sum + char.charCodeAt(0)) % size, 0);
const gcd = (a, b) => b === 0 ? Math.abs(a) : gcd(b, a % b);
const fractionText = (n, d) => `${n}/${d}`;
const compare = (a, b) => a < b ? "<" : a > b ? ">" : "=";

function fixturesFor(patternSpecId) {
  const rows = [];
  for (let denominator = 3; denominator <= 12; denominator += 1) {
    if (patternSpecId === G3B_U07_SAME_DENOMINATOR_ADD_SUB_PATTERN_SPEC_IDS[0]) {
      for (let left = 1; left < denominator; left += 1) for (let right = 1; right < denominator; right += 1) if (left + right <= denominator + 2) rows.push({ left, right, denominator });
    } else if (patternSpecId === G3B_U07_SAME_DENOMINATOR_ADD_SUB_PATTERN_SPEC_IDS[1]) {
      for (let left = 2; left <= denominator + 2; left += 1) for (let right = 1; right < left; right += 1) rows.push({ left, right, denominator });
    } else if (patternSpecId === G3B_U07_SAME_DENOMINATOR_COMPARE_PATTERN_SPEC_IDS[0]) {
      for (let left = 1; left <= denominator + 2; left += 1) for (let right = 1; right <= denominator + 2; right += 1) if (left !== right || left % 2 === 1) rows.push({ left, right, denominator });
    } else {
      for (let left = 1; left <= denominator + 2; left += 1) rows.push({ left, right: denominator, denominator });
    }
  }
  return rows;
}

function metadata(definition) {
  return Object.freeze({
    patternId: definition.patternSpecId,
    sourceId: G3B_U07_SAME_DENOMINATOR_SOURCE_ID,
    patternTags: Object.freeze(["full_product_w3_slice015", definition.patternSpecId]),
    skillTags: definition.skillTags,
    difficultyTags: definition.difficultyTags,
    curriculumNodeIds: Object.freeze([G3B_U07_SAME_DENOMINATOR_SOURCE_ID]),
    canonicalSkillIds: definition.canonicalSkillIds,
    knowledgePointId: definition.knowledgePointId,
    patternGroupId: definition.patternGroupId,
    operationFamilyId: definition.operationFamilyId,
    requestedUnknownRole: definition.requestedUnknownRole,
    requiredCapabilityIds: definition.requiredCapabilityIds,
    applicationClassification: definition.applicationClassification,
    productAdmissionTask: "P03F_W3DirectProductVerticalSlice015Implementation",
    generatorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
    validatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
    globalContextAuthorityPath: null,
  });
}

function buildQuestion(patternSpecId, ordinal, seed) {
  const definition = getBatchABrowserPatternDefinition(patternSpecId);
  const fixtures = fixturesFor(patternSpecId);
  const fixture = fixtures[(ordinal + seedOffset(seed, fixtures.length)) % fixtures.length];
  const { left, right, denominator } = fixture;
  let promptText;
  let answerText;
  let finalAnswer;
  let resultNumerator = null;
  let resultDenominator = null;
  let relation = null;
  if (definition.operation === "add" || definition.operation === "sub") {
    resultNumerator = definition.operation === "add" ? left + right : left - right;
    resultDenominator = denominator;
    answerText = fractionText(resultNumerator, resultDenominator);
    finalAnswer = answerText;
    promptText = `${fractionText(left, denominator)} ${definition.operation === "add" ? "+" : "−"} ${fractionText(right, denominator)} = ?`;
  } else {
    relation = compare(left, right);
    const rightText = definition.numericDomain.wholeOneRewrite ? "1" : fractionText(right, denominator);
    promptText = `${fractionText(left, denominator)} ○ ${rightText}，請填入 <、= 或 >。`;
    answerText = relation;
    finalAnswer = relation;
  }
  return Object.freeze({
    id: `${patternSpecId}-${ordinal + 1}`,
    sourceId: G3B_U07_SAME_DENOMINATOR_SOURCE_ID,
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
    finalAnswer,
    leftNumerator: left,
    rightNumerator: right,
    denominator,
    leftDenominator: denominator,
    rightDenominator: denominator,
    resultNumerator,
    resultDenominator,
    comparison: relation,
    wholeOneRewrite: definition.numericDomain.wholeOneRewrite,
    metadata: metadata(definition),
    globalContextProduction: null,
  });
}

export function canGenerateG3BU07SameDenominatorSlice015Questions(plan = {}) {
  return plan.sourceId === G3B_U07_SAME_DENOMINATOR_SOURCE_ID
    && Array.isArray(plan.patternSpecIds)
    && plan.patternSpecIds.length > 0
    && plan.patternSpecIds.every((id) => ALL_IDS.has(id));
}

export function validateG3BU07SameDenominatorSlice015Question(question = {}) {
  const errors = [];
  const add = (code, path) => errors.push({ code, severity: "error", path, message: code });
  const id = question.patternSpecId ?? question.metadata?.patternId;
  const definition = getBatchABrowserPatternDefinition(id);
  if (!ALL_IDS.has(id) || !definition) add("p03f15_pattern_invalid", "patternSpecId");
  if (question.sourceId !== G3B_U07_SAME_DENOMINATOR_SOURCE_ID || question.metadata?.sourceId !== G3B_U07_SAME_DENOMINATOR_SOURCE_ID) add("p03f15_source_mismatch", "sourceId");
  if (![question.leftNumerator, question.rightNumerator, question.denominator].every(Number.isSafeInteger) || question.denominator <= 0) add("p03f15_fraction_value_invalid", "fraction");
  if (question.leftDenominator !== question.denominator || question.rightDenominator !== question.denominator) add("p03f15_same_denominator_required", "denominator");
  if (question.globalContextProduction != null || question.metadata?.globalContextAuthorityPath != null) add("p03f15_global_context_leak", "globalContextProduction");
  if (definition?.operation === "add" || definition?.operation === "sub") {
    const expectedNumerator = definition.operation === "add" ? question.leftNumerator + question.rightNumerator : question.leftNumerator - question.rightNumerator;
    if (question.resultNumerator !== expectedNumerator || question.resultDenominator !== question.denominator) add("p03f15_fraction_arithmetic_invalid", "answerText");
    if (question.answerText !== fractionText(expectedNumerator, question.denominator) || question.finalAnswer !== question.answerText) add("p03f15_fraction_answer_invalid", "answerText");
    if (!question.metadata?.requiredCapabilityIds?.includes("cap_fraction_arithmetic")) add("p03f15_fraction_arithmetic_capability_missing", "metadata.requiredCapabilityIds");
  } else {
    const expected = compare(question.leftNumerator, question.rightNumerator);
    if (question.comparison !== expected || question.answerText !== expected || question.finalAnswer !== expected) add("p03f15_fraction_compare_invalid", "answerText");
    if (definition?.numericDomain?.wholeOneRewrite && question.rightNumerator !== question.denominator) add("p03f15_whole_one_rewrite_invalid", "rightNumerator");
  }
  if (question.metadata?.knowledgePointId !== definition?.knowledgePointId || question.metadata?.patternGroupId !== definition?.patternGroupId) add("p03f15_lineage_mismatch", "metadata");
  if (definition?.numericDomain?.unlikeDenominatorConversion || definition?.numericDomain?.mixedNumberNormalization) add("p03f15_domain_expansion_invalid", "metadata");
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function generateG3BU07SameDenominatorSlice015Questions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!canGenerateG3BU07SameDenominatorSlice015Questions(plan)) return { ok: false, errors: [{ code: "p03f15_plan_not_supported", severity: "error", path: "patternSpecIds", message: "p03f15_plan_not_supported" }], warnings: [], questions: [], plan };
  const count = Number.isInteger(plan.questionCount) ? plan.questionCount : 8;
  const ids = plan.patternSpecIds;
  const questions = Array.from({ length: count }, (_, index) => buildQuestion(ids[index % ids.length], index, plan.generationSeed));
  const validationErrors = questions.flatMap((question, index) => validateG3BU07SameDenominatorSlice015Question(question).errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` })));
  const allocation = ids.map((patternSpecId) => Object.freeze({ patternSpecId, questionCount: questions.filter((q) => q.patternSpecId === patternSpecId).length }));
  return Object.freeze({ ok: validationErrors.length === 0, errors: Object.freeze(validationErrors), warnings: Object.freeze([]), questions: Object.freeze(questions), plan: Object.freeze(plan), allocation: Object.freeze(allocation) });
}
