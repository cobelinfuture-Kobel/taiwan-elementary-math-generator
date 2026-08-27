import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f10.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f10-extension.js";
import {
  G4A_U09_SOURCE_ID,
  G4A_U09_HUNDREDTH_DECIMAL_KP_ID,
  G4A_U09_HUNDREDTH_DECIMAL_PATTERN_GROUP_ID,
  G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID,
} from "../registry/g4a-u09-hundredth-decimal-selector-projection.js";

const PROMPTS = Object.freeze([
  "把 1 平分成 100 份，其中 1 份用小數表示是多少？",
  "1 的百分之一用小數表示是多少？",
  "一百等份中的 1 份，用小數表示是多少？",
  "0 個一和 1 個 0.01 合起來是多少？",
  "在百分位上放 1，十分位和個位都放 0，這個小數是多少？",
  "1 個百分之一寫成小數是多少？",
  "哪個小數表示把 1 平分成 100 份後的 1 份？",
  "用小數記下「一個 0.01」的值。",
  "百分位是 1，十分位與個位都是 0，這個數是多少？",
  "一個正方形平均分成 100 格，其中一格占全部多少？請用小數表示。",
  "100 個相同小格合成 1，單獨 1 格的小數值是多少？",
  "0.00 再增加一個百分之一，結果是多少？",
  "在 0 和 1 之間取百分之一的位置，對應的小數是多少？",
  "一個單位量的 1/100 寫成小數是多少？",
  "十進位表中百分位放 1，其餘位放 0，讀成哪個小數？",
  "一個 0.01 不和其他數量合併時，數值是多少？",
  "把百分之一改寫成二位小數。",
  "1 ÷ 100 的商用小數表示是多少？",
  "一百個 0.01 可合成 1，其中一個的值是多少？",
  "數線上從 0 到 1 平分一百格，第一格表示哪個小數？",
  "0 個整數單位加 1 個百分位單位，結果是多少？",
  "二位小數中，只有百分位數字是 1，這個數是多少？",
  "千分位以後都是 0，百分位為 1，該小數是多少？",
  "將分數 1/100 轉換成小數。"
]); // PGC-R04 bounded prompt expansion

function isPgcR04Seed(seed) {
  return String(seed ?? "").includes("pgc-r04");
}

function hashSeed(value) {
  let acc = 2166136261;
  for (const char of String(value ?? "p03f10")) { acc ^= char.charCodeAt(0); acc = Math.imul(acc, 16777619) >>> 0; }
  return acc || 1;
}
function metadata(definition, fractionalUnits = 1) {
  return Object.freeze({
    patternId: definition.patternSpecId,
    sourceId: definition.sourceId,
    patternTags: Object.freeze(["full_product_w3_slice010", definition.sourceId, definition.patternSpecId]),
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
    decimalScale: 2,
    canonicalDecimalIdentity: `${fractionalUnits}e-2`,
    productAdmissionTask: "P03F_W3DirectProductVerticalSlice010Implementation",
    generatorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
    validatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
  });
}
function decimalFromHundredths(fractionalUnits) {
  return `${Math.floor(fractionalUnits / 100)}.${String(fractionalUnits % 100).padStart(2, "0")}`;
}
function expandedFractionalUnits(index, seed) {
  const poolSize = 900;
  const offset = hashSeed(seed) % poolSize;
  return 1 + ((offset + (index - 1) * 37) % poolSize);
}
function expandedPrompt(index, fractionalUnits) {
  const prompts = [
    `${fractionalUnits} 個 0.01 合起來是多少？`,
    `從 0 開始累加 ${fractionalUnits} 次 0.01，結果是多少？`,
    `以 0.01 為一個單位，${fractionalUnits} 個單位寫成小數是多少？`,
    `一個數有 ${fractionalUnits} 個百分之一，這個數是多少？`,
    `百分之一累積 ${fractionalUnits} 次後，用小數表示是多少？`,
    `把 ${fractionalUnits} 個百分位單位組成一個數，結果是多少？`,
  ];
  return prompts[(index - 1) % prompts.length];
}
function buildQuestion(index, seed, expanded = false) {
  const definition = getBatchABrowserPatternDefinition(G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID);
  const fractionalUnits = expanded ? expandedFractionalUnits(index, seed) : 1;
  const promptPool = isPgcR04Seed(seed) ? PROMPTS : PROMPTS.slice(0, 8);
  const offset = hashSeed(seed) % promptPool.length;
  const promptText = expanded
    ? expandedPrompt(index, fractionalUnits)
    : promptPool[(offset + index - 1) % promptPool.length];
  const answerText = decimalFromHundredths(fractionalUnits);
  return Object.freeze({
    id: `${G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID}-${index}`,
    sourceId: G4A_U09_SOURCE_ID,
    patternSpecId: G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID,
    kind: "g4aU09HundredthDecimalRepresentation",
    operation: "decimal_representation",
    operationFamilyId: "decimal_representation",
    questionMode: "numeric",
    promptText,
    questionText: promptText,
    blankedDisplayText: promptText,
    displayText: `${promptText} ${answerText}`,
    answerText,
    whole: Math.floor(fractionalUnits / 100),
    fractionalUnits,
    placeUnit: "0.01",
    decimalValue: answerText,
    finalAnswer: Object.freeze({ coefficient: String(fractionalUnits), scale: 2, canonicalText: answerText, exact: true }),
    metadata: metadata(definition, fractionalUnits),
  });
}

export function canGenerateG4AU09HundredthDecimalQuestions(plan = {}) {
  return plan.sourceId === G4A_U09_SOURCE_ID
    && Array.isArray(plan.patternSpecIds)
    && plan.patternSpecIds.length === 1
    && plan.patternSpecIds[0] === G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID;
}
export function validateG4AU09HundredthDecimalQuestion(question = {}) {
  const errors = [];
  const add = (code, path) => errors.push({ code, severity: "error", path, message: code });
  if (question.sourceId !== G4A_U09_SOURCE_ID || question.metadata?.sourceId !== G4A_U09_SOURCE_ID) add("p03f10_source_mismatch", "sourceId");
  if (question.patternSpecId !== G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID || question.metadata?.patternId !== G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID) add("p03f10_pattern_mismatch", "patternSpecId");
  if (question.metadata?.knowledgePointId !== G4A_U09_HUNDREDTH_DECIMAL_KP_ID) add("p03f10_kp_mismatch", "metadata.knowledgePointId");
  if (question.metadata?.patternGroupId !== G4A_U09_HUNDREDTH_DECIMAL_PATTERN_GROUP_ID) add("p03f10_group_mismatch", "metadata.patternGroupId");
  const fractionalUnits = question.fractionalUnits;
  if (!Number.isSafeInteger(fractionalUnits) || fractionalUnits <= 0 || question.whole !== Math.floor(fractionalUnits / 100) || question.placeUnit !== "0.01") add("p03f10_place_value_roles_invalid", "whole");
  const expectedDecimal = Number.isSafeInteger(fractionalUnits) && fractionalUnits > 0 ? decimalFromHundredths(fractionalUnits) : null;
  if (question.decimalValue !== expectedDecimal || question.answerText !== expectedDecimal) add("p03f10_decimal_answer_invalid", "answerText");
  if (question.finalAnswer?.coefficient !== String(fractionalUnits) || question.finalAnswer?.scale !== 2 || question.finalAnswer?.canonicalText !== expectedDecimal || question.finalAnswer?.exact !== true) add("p03f10_canonical_decimal_identity_invalid", "finalAnswer");
  const expectedCapabilities = ["cap_decimal_domain_validator", "cap_decimal_number_system"];
  if (JSON.stringify(question.metadata?.requiredCapabilityIds) !== JSON.stringify(expectedCapabilities)) add("p03f10_capability_set_invalid", "metadata.requiredCapabilityIds");
  if (question.metadata?.applicationClassification !== "APPLICATION_NOT_APPLICABLE" || question.questionMode !== "numeric") add("p03f10_application_scope_violation", "questionMode");
  if (String(question.blankedDisplayText ?? "").match(/(?:算式|_{2,}|答\s*[:：]|\{\{)/)) add("p03f10_forbidden_surface_present", "blankedDisplayText");
  return { ok: errors.length === 0, errors, warnings: [] };
}
export function generateG4AU09HundredthDecimalQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!canGenerateG4AU09HundredthDecimalQuestions(plan)) return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "p03f10_plan_not_supported", severity: "error", path: "plan", message: "Slice010 accepts only the admitted hundredth-decimal PatternSpec." }], warnings: [] };
  const maximumQuestionCount = 240;
  if (plan.questionCount > maximumQuestionCount) return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "p03f10_question_count_exceeds_unique_witnesses", severity: "error", path: "questionCount", message: "The selected generation namespace does not provide enough unique witnesses." }], warnings: [] };
  const expanded = plan.questionCount > (isPgcR04Seed(plan.generationSeed) ? PROMPTS.length : 8);
  const questions = Array.from({ length: plan.questionCount }, (_, offset) => buildQuestion(offset + 1, plan.generationSeed, expanded));
  const promptSet = new Set(questions.map((row) => row.blankedDisplayText));
  const errors = questions.flatMap((question) => validateG4AU09HundredthDecimalQuestion(question).errors);
  if (promptSet.size !== questions.length) errors.push({ code: "p03f10_duplicate_prompt_detected", severity: "error", path: "questions", message: "The worksheet contains duplicate prompts." });
  return { ok: errors.length === 0 && questions.length === plan.questionCount, plan, questions, allocation: [{ patternSpecId: G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID, questionCount: plan.questionCount }], errors, warnings: [] };
}

// PGC-R04 legacy contract reconciliation V1
