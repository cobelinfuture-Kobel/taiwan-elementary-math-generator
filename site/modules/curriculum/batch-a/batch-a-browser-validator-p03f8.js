export * from "./batch-a-browser-validator-p03f7.js";
import { validateBatchABrowserPlan as validateBasePlan, validateBatchABrowserQuestion as validateBaseQuestion, validateBatchABrowserQuestions as validateBaseQuestions } from "./batch-a-browser-validator-p03f7.js";
import { G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_SPEC_ID, G3B_U09_SOURCE_ID } from "../registry/g3b-u09-decimal-compose-decompose-selector-projection.js";
import { G3B_U09_DECIMAL_READ_WRITE_PATTERN_SPEC_ID } from "../registry/g3b-u09-decimal-read-write-selector-projection.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f8-extension.js";
import { validateP03F8DecimalSliceQuestion } from "./decimal-slice008-runtime.js";

const IDS = new Set([G3B_U09_DECIMAL_READ_WRITE_PATTERN_SPEC_ID, G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_SPEC_ID]);
const patternId = (question = {}) => question.patternSpecId ?? question.metadata?.patternId;
const isP03F8 = (question = {}) => IDS.has(patternId(question));
const issue = (code, path) => ({ code, severity: "error", path, message: code });

export function validateBatchABrowserPlan(plan = {}) {
  const ids = Array.isArray(plan.patternSpecIds) ? plan.patternSpecIds : [];
  if (plan.sourceId !== G3B_U09_SOURCE_ID || ids.length < 1 || ids.length > 2 || !ids.every((id) => IDS.has(id))) return validateBasePlan(plan);
  const errors = [];
  if (!Number.isInteger(plan.questionCount) || plan.questionCount <= 0 || plan.questionCount > 20) errors.push(issue("p03f8_question_count_invalid", "questionCount"));
  if (plan.questionMode !== "numeric") errors.push(issue("p03f8_application_scope_violation", "questionMode"));
  if (plan.genericFallbackAllowed !== false) errors.push(issue("p03f8_generic_fallback_must_be_disabled", "genericFallbackAllowed"));
  for (const id of ids) {
    const definition = getBatchABrowserPatternDefinition(id);
    if (!definition || definition.questionMode !== "numeric" || !["decimal", "decimalText"].includes(definition.requestedUnknownRole)) errors.push(issue(`p03f8_pattern_definition_invalid:${id}`, "patternSpecIds"));
  }
  return { ok: errors.length === 0, errors, warnings: [] };
}
export function validateBatchABrowserQuestion(question = {}) { return isP03F8(question) ? validateP03F8DecimalSliceQuestion(question) : validateBaseQuestion(question); }
export function validateBatchABrowserQuestions(questions = []) {
  if (!questions.some(isP03F8)) return validateBaseQuestions(questions);
  const errors = [], warnings = [];
  for (const [index, question] of questions.entries()) {
    const result = validateBatchABrowserQuestion(question);
    errors.push(...result.errors.map((entry) => ({ ...entry, path: `questions[${index}].${entry.path}` })));
    warnings.push(...result.warnings);
  }
  return { ok: errors.length === 0, errors, warnings, infos: [], validatorVersion: "p03f8-g3b-u09-two-kp-decimal-v1", validatedAt: null };
}
