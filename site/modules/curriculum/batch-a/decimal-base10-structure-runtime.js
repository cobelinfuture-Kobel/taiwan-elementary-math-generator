import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f14.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f14-extension.js";
import {
  G5B_U05_DECIMAL_BASE10_SOURCE_ID,
  G5B_U05_DECIMAL_BASE10_KP_ID,
  G5B_U05_DECIMAL_BASE10_GROUP_ID,
  G5B_U05_DECIMAL_BASE10_PATTERN_SPEC_IDS,
} from "../registry/g5b-u05-decimal-base10-selector-projection.js";

const SAME_SIDE_PROMPTS = Object.freeze([
  ["千位的位值是百位的幾倍？", "10"],
  ["百位的位值是十位的幾倍？", "10"],
  ["十位的位值是個位的幾倍？", "10"],
  ["十分位的位值是百分位的幾倍？", "10"],
  ["百分位的位值是千分位的幾倍？", "10"],
  ["右邊相鄰一位的位值，是左邊位值的幾分之幾？", "1/10"],
  ["一個位值向右移到相鄰一位，新的位值是原來的幾分之幾？", "1/10"],
  ["相鄰兩個位值中，左邊位值和右邊位值的倍數關係是多少？", "10倍"],
]);
const CROSS_POINT_PROMPTS = Object.freeze([
  ["個位的位值是十分位的幾倍？", "10"],
  ["十分位的位值是個位的幾分之幾？", "1/10"],
  ["1 個一等於幾個 0.1？", "10"],
  ["10 個 0.1 合起來是多少？", "1"],
  ["0.1 是 1 的幾分之幾？", "1/10"],
  ["從個位向右跨過小數點到十分位，位值變成原來的幾分之幾？", "1/10"],
  ["從十分位向左跨過小數點到個位，位值變成原來的幾倍？", "10"],
  ["個位與十分位仍維持幾倍的相鄰位值關係？", "10倍"],
]);

function hashSeed(value) {
  let acc = 2166136261;
  for (const char of String(value ?? "p03f14")) { acc ^= char.charCodeAt(0); acc = Math.imul(acc, 16777619) >>> 0; }
  return acc || 1;
}
function meta(definition) {
  return Object.freeze({
    patternId: definition.patternSpecId,
    sourceId: definition.sourceId,
    patternTags: Object.freeze(["full_product_w3_slice014", definition.sourceId, definition.patternSpecId]),
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
    base10Relation: 10,
    productAdmissionTask: "P03F_W3DirectProductVerticalSlice014Implementation",
    generatorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
    validatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
  });
}
function buildQuestion(patternSpecId, index, seed) {
  const definition = getBatchABrowserPatternDefinition(patternSpecId);
  const crossPoint = patternSpecId === G5B_U05_DECIMAL_BASE10_PATTERN_SPEC_IDS[1];
  const pool = crossPoint ? CROSS_POINT_PROMPTS : SAME_SIDE_PROMPTS;
  const [promptText, answerText] = pool[(hashSeed(`${seed}:${patternSpecId}`) + index - 1) % pool.length];
  return Object.freeze({
    id: `${patternSpecId}-${index}`,
    sourceId: G5B_U05_DECIMAL_BASE10_SOURCE_ID,
    patternSpecId,
    kind: "g5bU05DecimalBase10Structure",
    operation: "decimal_place_relation",
    operationFamilyId: "decimal_place_relation",
    questionMode: "numeric",
    promptText,
    questionText: promptText,
    blankedDisplayText: promptText,
    displayText: `${promptText} ${answerText}`,
    answerText,
    relationBase: 10,
    crossDecimalPoint: crossPoint,
    finalAnswer: Object.freeze({ canonicalText: answerText, exact: true, relationBase: 10 }),
    metadata: meta(definition),
  });
}

export function canGenerateG5BU05DecimalBase10Questions(plan = {}) {
  return plan.sourceId === G5B_U05_DECIMAL_BASE10_SOURCE_ID
    && Array.isArray(plan.patternSpecIds)
    && plan.patternSpecIds.length === 2
    && G5B_U05_DECIMAL_BASE10_PATTERN_SPEC_IDS.every((id) => plan.patternSpecIds.includes(id));
}
export function validateG5BU05DecimalBase10Question(question = {}) {
  const errors = [];
  const add = (code, path) => errors.push({ code, severity: "error", path, message: code });
  if (question.sourceId !== G5B_U05_DECIMAL_BASE10_SOURCE_ID || question.metadata?.sourceId !== G5B_U05_DECIMAL_BASE10_SOURCE_ID) add("p03f14_source_mismatch", "sourceId");
  if (!G5B_U05_DECIMAL_BASE10_PATTERN_SPEC_IDS.includes(question.patternSpecId) || question.metadata?.patternId !== question.patternSpecId) add("p03f14_pattern_mismatch", "patternSpecId");
  if (question.metadata?.knowledgePointId !== G5B_U05_DECIMAL_BASE10_KP_ID) add("p03f14_kp_mismatch", "metadata.knowledgePointId");
  if (question.metadata?.patternGroupId !== G5B_U05_DECIMAL_BASE10_GROUP_ID) add("p03f14_group_mismatch", "metadata.patternGroupId");
  if (question.relationBase !== 10 || question.metadata?.base10Relation !== 10) add("p03f14_base10_relation_invalid", "relationBase");
  if (!question.answerText || question.finalAnswer?.canonicalText !== question.answerText || question.finalAnswer?.exact !== true) add("p03f14_answer_identity_invalid", "answerText");
  const expectedCapabilities = ["cap_decimal_domain_validator", "cap_decimal_number_system"];
  if (JSON.stringify(question.metadata?.requiredCapabilityIds) !== JSON.stringify(expectedCapabilities)) add("p03f14_capability_set_invalid", "metadata.requiredCapabilityIds");
  if (question.metadata?.applicationClassification !== "APPLICATION_NOT_APPLICABLE" || question.questionMode !== "numeric") add("p03f14_application_scope_violation", "questionMode");
  const shouldCross = question.patternSpecId === G5B_U05_DECIMAL_BASE10_PATTERN_SPEC_IDS[1];
  if (question.crossDecimalPoint !== shouldCross) add("p03f14_decimal_boundary_identity_invalid", "crossDecimalPoint");
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function generateG5BU05DecimalBase10Questions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!canGenerateG5BU05DecimalBase10Questions(plan)) {
    return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "p03f14_plan_not_supported", severity: "error", path: "plan", message: "Slice014 accepts only the two admitted decimal base-10 PatternSpecs." }], warnings: [] };
  }
  if (!Number.isInteger(plan.questionCount) || plan.questionCount < 1 || plan.questionCount > 16) {
    return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "p03f14_question_count_invalid", severity: "error", path: "questionCount", message: "Slice014 supports 1-16 deterministic witnesses." }], warnings: [] };
  }
  const counts = [Math.ceil(plan.questionCount / 2), Math.floor(plan.questionCount / 2)];
  const questions = [];
  for (let specIndex = 0; specIndex < 2; specIndex += 1) {
    for (let index = 1; index <= counts[specIndex]; index += 1) {
      questions.push(buildQuestion(G5B_U05_DECIMAL_BASE10_PATTERN_SPEC_IDS[specIndex], index, plan.generationSeed));
    }
  }
  const errors = questions.flatMap((question) => validateG5BU05DecimalBase10Question(question).errors);
  if (new Set(questions.map((row) => row.blankedDisplayText)).size !== questions.length) errors.push({ code: "p03f14_duplicate_prompt_detected", severity: "error", path: "questions", message: "The worksheet contains duplicate prompts." });
  return {
    ok: errors.length === 0 && questions.length === plan.questionCount,
    plan,
    questions,
    allocation: G5B_U05_DECIMAL_BASE10_PATTERN_SPEC_IDS.map((patternSpecId, index) => ({ patternSpecId, questionCount: counts[index] })),
    errors,
    warnings: [],
  };
}
