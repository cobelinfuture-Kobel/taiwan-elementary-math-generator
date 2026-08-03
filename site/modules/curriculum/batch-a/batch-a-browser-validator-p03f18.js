export * from "./batch-a-browser-validator-p03f17.js";
import { validateBatchABrowserPlan as validateBasePlan, validateBatchABrowserQuestion as validateBaseQuestion, validateBatchABrowserQuestions as validateBaseQuestions } from "./batch-a-browser-validator-p03f17.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f18-extension.js";
import { validateG4AU09DecimalComposeSlice018Question } from "./decimal-compose-decompose-runtime-p03f18.js";
import { G4A_U09_DECIMAL_COMPOSE_SOURCE_ID, G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID } from "../registry/g4a-u09-decimal-compose-decompose-selector-projection.js";

const issue = (code, path) => ({ code, severity: "error", path, message: code });
const patternId = (question = {}) => question.patternSpecId ?? question.metadata?.patternId;
const isP03F18 = (question = {}) => patternId(question) === G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID;

export function validateBatchABrowserPlan(plan = {}) {
  const slice018 = plan.sourceId === G4A_U09_DECIMAL_COMPOSE_SOURCE_ID && Array.isArray(plan.patternSpecIds) && plan.patternSpecIds.length === 1 && plan.patternSpecIds[0] === G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID;
  if (!slice018) return validateBasePlan(plan);
  const errors = [];
  if (!Number.isInteger(plan.questionCount) || plan.questionCount <= 0 || plan.questionCount > 18) errors.push(issue("p03f18_question_count_invalid", "questionCount"));
  if (plan.questionMode !== "numeric") errors.push(issue("p03f18_question_mode_mismatch", "questionMode"));
  if (plan.genericFallbackAllowed !== false) errors.push(issue("p03f18_generic_fallback_must_be_disabled", "genericFallbackAllowed"));
  if (!getBatchABrowserPatternDefinition(G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID)) errors.push(issue("p03f18_pattern_definition_invalid", "patternSpecIds"));
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function validateBatchABrowserQuestion(question = {}) {
  return isP03F18(question) ? validateG4AU09DecimalComposeSlice018Question(question) : validateBaseQuestion(question);
}

export function validateBatchABrowserQuestions(questions = []) {
  if (!questions.some(isP03F18)) return validateBaseQuestions(questions);
  const errors = []; const warnings = [];
  for (const [index, question] of questions.entries()) {
    const result = validateBatchABrowserQuestion(question);
    errors.push(...result.errors.map((entry) => ({ ...entry, path: `questions[${index}].${entry.path}` })));
    warnings.push(...(result.warnings ?? []));
  }
  return { ok: errors.length === 0, errors, warnings, infos: [], validatorVersion: "p03f18-g4a-u09-decimal-compose-v1", validatedAt: null };
}
