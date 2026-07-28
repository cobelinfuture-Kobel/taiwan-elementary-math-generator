
export * from "./batch-a-browser-validator-p03f5.js";
import { validateBatchABrowserPlan as validateBasePlan, validateBatchABrowserQuestion as validateBaseQuestion, validateBatchABrowserQuestions as validateBaseQuestions } from "./batch-a-browser-validator-p03f5.js";
import { G3A_U08_SOURCE_ID } from "../registry/g3a-u08-part-whole-fraction-selector-projection.js";
import { G3A_U08_SAME_DENOMINATOR_NUMERIC_SPEC_ID, G3A_U08_SAME_DENOMINATOR_APPLICATION_SPEC_ID, G3A_U08_SAME_DENOMINATOR_PATTERN_SPEC_IDS } from "../registry/g3a-u08-same-denominator-compare-selector-projection.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f6-extension.js";
import { validateG3AU08SameDenominatorCompareQuestion } from "./same-denominator-fraction-compare-runtime.js";
const IDS = new Set(G3A_U08_SAME_DENOMINATOR_PATTERN_SPEC_IDS);
const issue = (code, path) => ({ code, severity: "error", path, message: code });
const patternId = (q = {}) => q.patternSpecId ?? q.metadata?.patternId;
const isP03F6Question = (q = {}) => IDS.has(patternId(q));
export function validateBatchABrowserPlan(plan = {}) {
  const ids = Array.isArray(plan.patternSpecIds) ? plan.patternSpecIds : [];
  if (plan.sourceId !== G3A_U08_SOURCE_ID || ids.length !== 1 || !ids.every((id) => IDS.has(id))) return validateBasePlan(plan);
  const errors = [];
  if (!Number.isInteger(plan.questionCount) || plan.questionCount <= 0 || plan.questionCount > 6) errors.push(issue("p03f6_question_count_invalid", "questionCount"));
  const expected = plan.questionMode === "application" ? G3A_U08_SAME_DENOMINATOR_APPLICATION_SPEC_ID : G3A_U08_SAME_DENOMINATOR_NUMERIC_SPEC_ID;
  if (ids[0] !== expected) errors.push(issue("p03f6_mode_pattern_mismatch", "patternSpecIds"));
  if (plan.genericFallbackAllowed !== false) errors.push(issue("p03f6_generic_fallback_must_be_disabled", "genericFallbackAllowed"));
  if (getBatchABrowserPatternDefinition(ids[0])?.questionMode !== plan.questionMode) errors.push(issue("p03f6_pattern_definition_invalid", "patternSpecIds"));
  return { ok: errors.length === 0, errors, warnings: [] };
}
export function validateBatchABrowserQuestion(question = {}) { return isP03F6Question(question) ? validateG3AU08SameDenominatorCompareQuestion(question) : validateBaseQuestion(question); }
export function validateBatchABrowserQuestions(questions = []) {
  if (!questions.some(isP03F6Question)) return validateBaseQuestions(questions);
  const errors = [], warnings = [];
  for (const [index, question] of questions.entries()) {
    const result = validateBatchABrowserQuestion(question);
    errors.push(...result.errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` })));
    warnings.push(...result.warnings);
  }
  return { ok: errors.length === 0, errors, warnings, infos: [], validatorVersion: "p03f6-g3a-u08-same-denominator-compare-v1", validatedAt: null };
}
