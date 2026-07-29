import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f13.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f13-extension.js";
import {
  G5A_U04_SOURCE_ID,
  G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID,
  G5A_U04_EXPAND_REDUCE_SIMPLEST_GROUP_ID,
  G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS,
} from "../registry/g5a-u04-expand-reduce-simplest-selector-projection.js";

const REQUIRED_CAPABILITY_IDS = Object.freeze([
  "cap_fraction_domain_validator",
  "cap_fraction_number_system",
]);
const [COMMON_FACTOR_SPEC, SIMPLEST_NUMERATOR_SPEC, SIMPLEST_DENOMINATOR_SPEC] = G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS;
function buildCases() {
  const rows = [];
  for (let simplestDenominator = 2; simplestDenominator <= 12; simplestDenominator += 1) {
    for (let simplestNumerator = 1; simplestNumerator < simplestDenominator; simplestNumerator += 1) {
      if (gcd(simplestNumerator, simplestDenominator) !== 1) continue;
      for (let commonFactor = 2; commonFactor <= 12; commonFactor += 1) {
        const numerator = simplestNumerator * commonFactor;
        const denominator = simplestDenominator * commonFactor;
        rows.push({ patternSpecId: COMMON_FACTOR_SPEC, numerator, denominator, commonFactor, simplestNumerator, simplestDenominator, promptText: numerator + "/" + denominator + " 約成最簡分數時，分子和分母同除的最大公因數是多少？" });
        rows.push({ patternSpecId: SIMPLEST_NUMERATOR_SPEC, numerator, denominator, commonFactor, simplestNumerator, simplestDenominator, promptText: numerator + "/" + denominator + " 約成最簡分數後，分子是多少？" });
        rows.push({ patternSpecId: SIMPLEST_DENOMINATOR_SPEC, numerator, denominator, commonFactor, simplestNumerator, simplestDenominator, promptText: numerator + "/" + denominator + " 約成最簡分數後，分母是多少？" });
      }
    }
  }
  return rows;
}
const CASES = Object.freeze(buildCases());
function gcd(a, b) { let x = Math.abs(a); let y = Math.abs(b); while (y !== 0) [x, y] = [y, x % y]; return x; }
function hashSeed(value) { let acc = 2166136261; for (const char of String(value ?? "p03f13")) { acc ^= char.charCodeAt(0); acc = Math.imul(acc, 16777619) >>> 0; } return acc || 1; }
function buildQuestion(row, index) {
  const definition = getBatchABrowserPatternDefinition(row.patternSpecId);
  const answer = Number(row[definition.requestedUnknownRole]);
  return Object.freeze({
    id: `${row.patternSpecId}-${index}`, sourceId: G5A_U04_SOURCE_ID, patternSpecId: row.patternSpecId,
    kind: "g5aU04ExpandReduceSimplest", operation: "simplify_fraction", operationFamilyId: "simplify_fraction", questionMode: "numeric",
    promptText: row.promptText, questionText: row.promptText, blankedDisplayText: row.promptText, displayText: `${row.promptText} ${answer}`, answerText: String(answer),
    numerator: row.numerator, denominator: row.denominator, commonFactor: row.commonFactor, simplestNumerator: row.simplestNumerator, simplestDenominator: row.simplestDenominator,
    requestedUnknownRole: definition.requestedUnknownRole, finalAnswer: Object.freeze({ value: answer, answerType: "missing_integer", exact: true }),
    metadata: Object.freeze({
      patternId: definition.patternSpecId, sourceId: definition.sourceId,
      patternTags: Object.freeze(["full_product_w3_slice013", definition.sourceId, definition.patternSpecId]), skillTags: definition.skillTags, difficultyTags: definition.difficultyTags,
      curriculumNodeIds: Object.freeze([definition.sourceId]), canonicalSkillIds: definition.canonicalSkillIds,
      knowledgePointId: definition.knowledgePointId, patternGroupId: definition.patternGroupId, operationFamilyId: definition.operationFamilyId,
      requestedUnknownRole: definition.requestedUnknownRole, requiredCapabilityIds: definition.requiredCapabilityIds,
      applicationClassification: "APPLICATION_NOT_APPLICABLE", exactRationalIdentity: true,
      productAdmissionTask: "P03F_W3DirectProductVerticalSlice013Implementation",
      generatorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1", validatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
    }),
  });
}
export function canGenerateG5AU04SimplestFractionQuestions(plan = {}) {
  return plan.sourceId === G5A_U04_SOURCE_ID && Array.isArray(plan.patternSpecIds) && plan.patternSpecIds.length === 3 && G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS.every((id) => plan.patternSpecIds.includes(id));
}
export function validateG5AU04SimplestFractionQuestion(question = {}) {
  const errors = []; const add = (code, path) => errors.push({ code, severity: "error", path, message: code });
  if (question.sourceId !== G5A_U04_SOURCE_ID || question.metadata?.sourceId !== G5A_U04_SOURCE_ID) add("p03f13_source_mismatch", "sourceId");
  if (!G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS.includes(question.patternSpecId) || question.metadata?.patternId !== question.patternSpecId) add("p03f13_pattern_mismatch", "patternSpecId");
  if (question.metadata?.knowledgePointId !== G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID) add("p03f13_kp_mismatch", "metadata.knowledgePointId");
  if (question.metadata?.patternGroupId !== G5A_U04_EXPAND_REDUCE_SIMPLEST_GROUP_ID) add("p03f13_group_mismatch", "metadata.patternGroupId");
  const roles = ["numerator", "denominator", "commonFactor", "simplestNumerator", "simplestDenominator"];
  if (roles.some((role) => !Number.isInteger(question[role]) || question[role] <= 0) || question.denominator <= 1) add("p03f13_fraction_roles_invalid", "numerator");
  const factor = gcd(question.numerator, question.denominator);
  if (question.commonFactor !== factor || question.simplestNumerator !== question.numerator / factor || question.simplestDenominator !== question.denominator / factor) add("p03f13_simplification_identity_invalid", "commonFactor");
  if (gcd(question.simplestNumerator, question.simplestDenominator) !== 1 || question.numerator * question.simplestDenominator !== question.simplestNumerator * question.denominator) add("p03f13_simplest_fraction_invalid", "simplestNumerator");
  const expectedAnswer = Number(question[question.requestedUnknownRole]);
  if (!["commonFactor", "simplestNumerator", "simplestDenominator"].includes(question.requestedUnknownRole) || question.answerText !== String(expectedAnswer) || question.finalAnswer?.value !== expectedAnswer || question.finalAnswer?.exact !== true) add("p03f13_answer_identity_invalid", "answerText");
  if (JSON.stringify(question.metadata?.requiredCapabilityIds) !== JSON.stringify(REQUIRED_CAPABILITY_IDS)) add("p03f13_capability_set_invalid", "metadata.requiredCapabilityIds");
  if (question.metadata?.applicationClassification !== "APPLICATION_NOT_APPLICABLE" || question.questionMode !== "numeric") add("p03f13_application_scope_violation", "questionMode");
  if (/(?:算式|_{2,}|答\s*[:：]|\{\{)/.test(String(question.blankedDisplayText ?? ""))) add("p03f13_forbidden_surface_present", "blankedDisplayText");
  return { ok: errors.length === 0, errors, warnings: [] };
}
export function generateG5AU04SimplestFractionQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!canGenerateG5AU04SimplestFractionQuestions(plan)) return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "p03f13_plan_not_supported", severity: "error", path: "plan", message: "Slice013 accepts only the three admitted simplest-fraction PatternSpecs." }], warnings: [] };
  if (plan.questionCount > CASES.length) return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "p03f13_question_count_exceeds_unique_witnesses", severity: "error", path: "questionCount", message: "Slice013 provides at most nine unique bounded witnesses." }], warnings: [] };
  const offset = hashSeed(plan.generationSeed) % CASES.length;
  const selected = Array.from({ length: plan.questionCount }, (_, index) => CASES[(offset + index) % CASES.length]);
  const questions = selected.map((row, index) => buildQuestion(row, index + 1));
  const errors = questions.flatMap((question) => validateG5AU04SimplestFractionQuestion(question).errors);
  if (new Set(questions.map((row) => row.blankedDisplayText)).size !== questions.length) errors.push({ code: "p03f13_duplicate_prompt_detected", severity: "error", path: "questions", message: "The worksheet contains duplicate prompts." });
  const allocation = G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS.map((patternSpecId) => ({ patternSpecId, questionCount: questions.filter((row) => row.patternSpecId === patternSpecId).length })).filter((row) => row.questionCount > 0);
  return { ok: errors.length === 0 && questions.length === plan.questionCount, plan, questions, allocation, errors, warnings: [] };
}
