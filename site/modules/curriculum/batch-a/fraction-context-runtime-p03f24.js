import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f24.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f24-extension.js";
import { G3B_U07_SOURCE_ID } from "../registry/g3b-u07-quotient-fraction-selector-projection.js";
import {
  G3B_U07_P03F24_KP_IDS,
  G3B_U07_P03F24_PATTERN_SPEC_IDS,
  G3B_U07_P03F24_APPLICATION_SPEC_IDS,
} from "../registry/g3b-u07-fraction-context-selector-projection-p03f24.js";

const IDS = new Set(G3B_U07_P03F24_PATTERN_SPEC_IDS);
const APP_IDS = new Set(G3B_U07_P03F24_APPLICATION_SPEC_IDS);
const PRODUCTION_PACKAGE_PATH = "docs/curriculum/output/postg-app/w02-a06/POSTG_APP_W02_A06_PRODUCTION_EQUIVALENT_PACKAGE.json";
const gcd = (a, b) => { let x = Math.abs(a), y = Math.abs(b); while (y) [x, y] = [y, x % y]; return x || 1; };
const rational = (numerator, denominator) => { const sign = denominator < 0 ? -1 : 1; const g = gcd(numerator, denominator); return Object.freeze({ numerator: sign * numerator / g, denominator: Math.abs(denominator) / g }); };
const add = (a, b) => rational(a.numerator * b.denominator + b.numerator * a.denominator, a.denominator * b.denominator);
const sub = (a, b) => rational(a.numerator * b.denominator - b.numerator * a.denominator, a.denominator * b.denominator);
const cmp = (a, b) => a.numerator * b.denominator - b.numerator * a.denominator;
const fractionText = (value) => value.denominator === 1 ? String(value.numerator) : `${value.numerator}/${value.denominator}`;
const hashSeed = (value) => {
  let hash = 2166136261;
  for (const character of String(value ?? "p03f24")) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};
const isApplication = (patternSpecId) => APP_IDS.has(patternSpecId);
const roleFor = (patternSpecId) => patternSpecId.match(/_(total|original|difference)_(?:numeric|application)$/)?.[1] ?? "result";
const fixtureAt = (fixtures, ordinal, seed, namespace) => fixtures[(hashSeed(`${seed}:${namespace}`) + ordinal) % fixtures.length];

const WHOLE_FRACTION_FIXTURES = Object.freeze(Array.from({ length: 22 }, (_, index) => index + 3).flatMap((denominator) =>
  Array.from({ length: 12 }, (_, index) => index + 1).flatMap((whole) =>
    Array.from({ length: denominator - 1 }, (_, index) => index + 1).flatMap((numerator) => [
      Object.freeze({ denominator, whole, numerator, operator: "add" }),
      Object.freeze({ denominator, whole, numerator, operator: "sub" }),
    ]),
  ),
));

const FRACTION_PAIR_FIXTURES = Object.freeze(Array.from({ length: 22 }, (_, index) => index + 3).flatMap((denominator) =>
  Array.from({ length: denominator - 1 }, (_, index) => index + 1).flatMap((leftNumerator) =>
    Array.from({ length: denominator - 1 }, (_, index) => Object.freeze({
      denominator,
      leftNumerator,
      rightNumerator: index + 1,
    })),
  ),
));

const FRACTION_PLUS_COUNT_FIXTURES = Object.freeze(Array.from({ length: 33 }, (_, index) => index + 4).flatMap((itemsPerWhole) =>
  Array.from({ length: Math.min(12, itemsPerWhole) - 1 }, (_, index) => index + 2)
    .filter((denominator) => itemsPerWhole % denominator === 0)
    .flatMap((denominator) => Array.from({ length: denominator - 1 }, (_, index) => index + 1).flatMap((numerator) =>
      Array.from({ length: itemsPerWhole }, (_, index) => Object.freeze({
        itemsPerWhole,
        denominator,
        numerator,
        count: index + 1,
      })),
    )),
));

export const P03F24_APPLICATION_AUTHORITY = Object.freeze(Object.fromEntries(G3B_U07_P03F24_APPLICATION_SPEC_IDS.map((patternSpecId) => [patternSpecId, Object.freeze({
  applicationQuestionRecordId: `app_qr_w02_${patternSpecId}`,
  bindingCandidateId: `w02_bind_${patternSpecId}`,
  proofCandidateId: `w02_n1proof_${patternSpecId}`,
  fixtureId: `w02_fixture_${patternSpecId}_single_positive`,
  productionPackagePath: PRODUCTION_PACKAGE_PATH,
  lineageStatus: "W02_A06_PRODUCTION_EQUIVALENT_EXISTING_AUTHORITY",
})])));

function metadata(definition) {
  const authority = isApplication(definition.patternSpecId) ? P03F24_APPLICATION_AUTHORITY[definition.patternSpecId] : null;
  return Object.freeze({
    patternId: definition.patternSpecId,
    sourceId: G3B_U07_SOURCE_ID,
    patternTags: Object.freeze(["full_product_w3_slice024", definition.patternSpecId]),
    skillTags: definition.skillTags,
    difficultyTags: definition.difficultyTags,
    curriculumNodeIds: Object.freeze([G3B_U07_SOURCE_ID]),
    canonicalSkillIds: definition.canonicalSkillIds,
    knowledgePointId: definition.knowledgePointId,
    patternGroupId: definition.patternGroupId,
    operationFamilyId: definition.operationFamilyId,
    operationModelId: definition.operationModelId,
    requestedUnknownRole: definition.requestedUnknownRole,
    requiredCapabilityIds: definition.requiredCapabilityIds,
    applicationClassification: definition.applicationClassification,
    productAdmissionTask: "P03F_W3DirectProductVerticalSlice024Implementation",
    generatorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
    validatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
    globalContextAuthorityPath: authority ? "data/curriculum/context/registry/global-context-authority-index.json" : null,
    applicationQuestionRecordId: authority?.applicationQuestionRecordId ?? null,
    bindingCandidateId: authority?.bindingCandidateId ?? null,
    proofCandidateId: authority?.proofCandidateId ?? null,
    fixtureId: authority?.fixtureId ?? null,
    productionPackagePath: authority?.productionPackagePath ?? null,
    contextLineageStatus: authority?.lineageStatus ?? null,
  });
}

function wholeFractionQuestion(definition, ordinal, seed) {
  const fixture = fixtureAt(WHOLE_FRACTION_FIXTURES, ordinal, seed, definition.patternSpecId);
  const { denominator, whole, numerator: fractionNumerator, operator } = fixture;
  const left = rational(whole, 1);
  const right = rational(fractionNumerator, denominator);
  const answer = operator === "add" ? add(left, right) : sub(left, right);
  const application = definition.questionMode === "application";
  const promptText = application
    ? operator === "add"
      ? `活動材料原有 ${whole} 份，又補上 ${fractionText(right)} 份，現在共有多少份？`
      : `活動材料原有 ${whole} 份，用掉 ${fractionText(right)} 份，還剩多少份？`
    : `${whole} ${operator === "add" ? "+" : "−"} ${fractionText(right)} = ?`;
  return { left, right, operator, answer, promptText, unitLabel: "份", conversion: null };
}

function combinedQuestion(definition, ordinal, seed) {
  const fixture = fixtureAt(FRACTION_PAIR_FIXTURES, ordinal, seed, definition.patternSpecId);
  const first = rational(fixture.leftNumerator, fixture.denominator);
  const second = rational(fixture.rightNumerator, fixture.denominator);
  const role = definition.requestedUnknownRole;
  const answer = role === "difference" ? (cmp(first, second) >= 0 ? sub(first, second) : sub(second, first)) : add(first, second);
  const application = definition.questionMode === "application";
  const promptText = role === "total"
    ? application ? `班級上午完成 ${fractionText(first)} 份工作，下午完成 ${fractionText(second)} 份，共完成多少份？` : `${fractionText(first)} + ${fractionText(second)} = ?`
    : role === "original"
      ? application ? `一批工作已完成 ${fractionText(first)} 份，還剩 ${fractionText(second)} 份，原來共有多少份？` : `已用 ${fractionText(first)}，剩餘 ${fractionText(second)}，原量 = ?`
      : application ? `甲完成 ${fractionText(first)}，乙完成 ${fractionText(second)}，兩者相差多少？` : `${fractionText(first)} 與 ${fractionText(second)} 相差多少？`;
  return { left: first, right: second, operator: role === "difference" ? "difference" : "add", answer, promptText, unitLabel: "份", conversion: null };
}

function fractionPlusCountQuestion(definition, ordinal, seed) {
  const fixture = fixtureAt(FRACTION_PLUS_COUNT_FIXTURES, ordinal, seed, definition.patternSpecId);
  const { itemsPerWhole, denominator, numerator: fractionNumerator, count } = fixture;
  const fractionQuantity = rational(fractionNumerator, denominator);
  const countQuantity = rational(count, itemsPerWhole);
  const role = definition.requestedUnknownRole;
  const answer = role === "difference" ? (cmp(fractionQuantity, countQuantity) >= 0 ? sub(fractionQuantity, countQuantity) : sub(countQuantity, fractionQuantity)) : add(fractionQuantity, countQuantity);
  const application = definition.questionMode === "application";
  const promptText = role === "total"
    ? application ? `每盒有 ${itemsPerWhole} 顆。已有 ${fractionText(fractionQuantity)} 盒，又有 ${count} 顆，合起來相當於多少盒？` : `${fractionText(fractionQuantity)} 盒 + ${count}/${itemsPerWhole} 盒 = ?`
    : role === "original"
      ? application ? `每盒有 ${itemsPerWhole} 顆。已用 ${fractionText(fractionQuantity)} 盒，還有 ${count} 顆，原有相當於多少盒？` : `已用 ${fractionText(fractionQuantity)} 盒，剩 ${count}/${itemsPerWhole} 盒，原量 = ?`
      : application ? `每盒有 ${itemsPerWhole} 顆。${fractionText(fractionQuantity)} 盒和 ${count} 顆相差相當於多少盒？` : `${fractionText(fractionQuantity)} 盒與 ${count}/${itemsPerWhole} 盒相差多少？`;
  return { left: fractionQuantity, right: countQuantity, operator: role === "difference" ? "difference" : "add", answer, promptText, unitLabel: "盒", conversion: Object.freeze({ itemsPerWhole, itemCount: count }) };
}

function originalDifferenceQuestion(definition, ordinal, seed) {
  const fixture = fixtureAt(FRACTION_PAIR_FIXTURES, ordinal, seed, definition.patternSpecId);
  const used = rational(fixture.leftNumerator, fixture.denominator);
  const remaining = rational(fixture.rightNumerator, fixture.denominator);
  const role = definition.requestedUnknownRole;
  const answer = role === "difference" ? (cmp(used, remaining) >= 0 ? sub(used, remaining) : sub(remaining, used)) : add(used, remaining);
  const application = definition.questionMode === "application";
  const promptText = role === "total"
    ? application ? `第一段用了 ${fractionText(used)} 公尺，第二段用了 ${fractionText(remaining)} 公尺，共用了多少公尺？` : `${fractionText(used)} + ${fractionText(remaining)} = ?`
    : role === "original"
      ? application ? `一條繩子用了 ${fractionText(used)} 公尺，還剩 ${fractionText(remaining)} 公尺，原來長多少公尺？` : `已用 ${fractionText(used)}，剩餘 ${fractionText(remaining)}，原量 = ?`
      : application ? `兩段長度分別是 ${fractionText(used)} 公尺與 ${fractionText(remaining)} 公尺，相差多少公尺？` : `${fractionText(used)} 與 ${fractionText(remaining)} 相差多少？`;
  return { left: used, right: remaining, operator: role === "difference" ? "difference" : "add", answer, promptText, unitLabel: "公尺", conversion: null };
}

function buildQuestion(patternSpecId, ordinal, seed) {
  const definition = getBatchABrowserPatternDefinition(patternSpecId);
  let fixture;
  if (definition.knowledgePointId === "kp_g3b_u07_whole_and_fraction_add_sub") fixture = wholeFractionQuestion(definition, ordinal, seed);
  else if (definition.knowledgePointId === "kp_g3b_u07_combined_fraction_context") fixture = combinedQuestion(definition, ordinal, seed);
  else if (definition.knowledgePointId === "kp_g3b_u07_fraction_plus_count_context") fixture = fractionPlusCountQuestion(definition, ordinal, seed);
  else fixture = originalDifferenceQuestion(definition, ordinal, seed);
  const authority = isApplication(patternSpecId) ? P03F24_APPLICATION_AUTHORITY[patternSpecId] : null;
  const answerText = fractionText(fixture.answer);
  return Object.freeze({
    id: `${patternSpecId}-${ordinal + 1}`,
    sourceId: G3B_U07_SOURCE_ID,
    patternSpecId,
    kind: definition.kind,
    operation: definition.operation,
    operationFamilyId: definition.operationFamilyId,
    questionMode: definition.questionMode,
    mode: definition.mode,
    promptText: fixture.promptText,
    questionText: fixture.promptText,
    blankedDisplayText: fixture.promptText,
    displayText: `${fixture.promptText} ${answerText}`,
    answerText,
    finalAnswer: fixture.answer,
    requestedUnknownRole: roleFor(patternSpecId),
    leftValue: fixture.left,
    rightValue: fixture.right,
    relationOperator: fixture.operator,
    resultValue: fixture.answer,
    unitLabel: fixture.unitLabel,
    conversion: fixture.conversion,
    metadata: metadata(definition),
    globalContextProduction: authority ? Object.freeze({ status: "GLOBAL_CONTEXT_BOUND_EXISTING_W02_A06", ...authority }) : null,
  });
}

export function canGenerateG3BU07P03F24Questions(plan = {}) {
  return plan.sourceId === G3B_U07_SOURCE_ID
    && Array.isArray(plan.patternSpecIds)
    && plan.patternSpecIds.length > 0
    && plan.patternSpecIds.every((id) => IDS.has(id));
}

export function validateG3BU07P03F24Question(question = {}) {
  const errors = [];
  const addError = (code, path) => errors.push({ code, severity: "error", path, message: code });
  const id = question.patternSpecId ?? question.metadata?.patternId;
  const definition = getBatchABrowserPatternDefinition(id);
  if (!IDS.has(id) || !definition) addError("p03f24_pattern_invalid", "patternSpecId");
  if (question.sourceId !== G3B_U07_SOURCE_ID || question.metadata?.sourceId !== G3B_U07_SOURCE_ID) addError("p03f24_source_mismatch", "sourceId");
  if (!G3B_U07_P03F24_KP_IDS.includes(question.metadata?.knowledgePointId) || question.metadata?.knowledgePointId !== definition?.knowledgePointId) addError("p03f24_kp_lineage_invalid", "metadata.knowledgePointId");
  if (question.metadata?.patternGroupId !== definition?.patternGroupId || question.metadata?.operationFamilyId !== definition?.operationFamilyId) addError("p03f24_pattern_lineage_invalid", "metadata");
  const left = question.leftValue, right = question.rightValue;
  if (![left?.numerator, left?.denominator, right?.numerator, right?.denominator].every(Number.isSafeInteger) || left.denominator <= 0 || right.denominator <= 0) addError("p03f24_fraction_domain_invalid", "fraction");
  let expected = null;
  if (question.relationOperator === "add") expected = add(left, right);
  else if (question.relationOperator === "difference") expected = cmp(left, right) >= 0 ? sub(left, right) : sub(right, left);
  else if (question.relationOperator === "sub") expected = sub(left, right);
  else addError("p03f24_relation_operator_invalid", "relationOperator");
  if (expected && (question.resultValue?.numerator !== expected.numerator || question.resultValue?.denominator !== expected.denominator || question.answerText !== fractionText(expected))) addError("p03f24_answer_invalid", "answerText");
  if (question.requestedUnknownRole !== definition?.requestedUnknownRole || question.metadata?.requestedUnknownRole !== definition?.requestedUnknownRole) addError("p03f24_unknown_role_invalid", "requestedUnknownRole");
  for (const cap of ["cap_fraction_arithmetic", "cap_fraction_domain_validator", "cap_fraction_number_system"]) if (!question.metadata?.requiredCapabilityIds?.includes(cap)) addError("p03f24_capability_missing", `metadata.requiredCapabilityIds.${cap}`);
  if (isApplication(id)) {
    const authority = P03F24_APPLICATION_AUTHORITY[id];
    if (question.questionMode !== "application" || question.globalContextProduction?.status !== "GLOBAL_CONTEXT_BOUND_EXISTING_W02_A06") addError("p03f24_application_context_missing", "globalContextProduction");
    if (question.metadata?.bindingCandidateId !== authority.bindingCandidateId || question.metadata?.proofCandidateId !== authority.proofCandidateId || question.metadata?.fixtureId !== authority.fixtureId) addError("p03f24_w02_lineage_invalid", "metadata.bindingCandidateId");
    if (question.metadata?.productionPackagePath !== PRODUCTION_PACKAGE_PATH) addError("p03f24_w02_package_invalid", "metadata.productionPackagePath");
  } else if (question.globalContextProduction != null || question.metadata?.bindingCandidateId != null) addError("p03f24_numeric_context_leak", "globalContextProduction");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), warnings: Object.freeze([]) });
}

export function generateG3BU07P03F24Questions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!canGenerateG3BU07P03F24Questions(plan)) return Object.freeze({ ok: false, errors: Object.freeze([{ code: "p03f24_plan_not_supported", severity: "error", path: "patternSpecIds", message: "p03f24_plan_not_supported" }]), warnings: Object.freeze([]), questions: Object.freeze([]), plan });
  const count = Number.isInteger(plan.questionCount) ? plan.questionCount : Math.max(20, plan.patternSpecIds.length);
  const occurrenceByPattern = new Map(plan.patternSpecIds.map((patternSpecId) => [patternSpecId, 0]));
  const questions = Array.from({ length: count }, (_, index) => {
    const patternSpecId = plan.patternSpecIds[index % plan.patternSpecIds.length];
    const occurrence = occurrenceByPattern.get(patternSpecId) ?? 0;
    occurrenceByPattern.set(patternSpecId, occurrence + 1);
    return buildQuestion(patternSpecId, occurrence, plan.generationSeed);
  });
  const validationErrors = questions.flatMap((question, index) => validateG3BU07P03F24Question(question).errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` })));
  const allocation = plan.patternSpecIds.map((patternSpecId) => Object.freeze({ patternSpecId, questionCount: questions.filter((question) => question.patternSpecId === patternSpecId).length }));
  return Object.freeze({ ok: validationErrors.length === 0, errors: Object.freeze(validationErrors), warnings: Object.freeze([]), questions: Object.freeze(questions), plan: Object.freeze(plan), allocation: Object.freeze(allocation) });
}
