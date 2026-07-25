export * from "./batch-a-browser-validator-p01d1.js";

import {
  validateBatchABrowserPlan as validateBasePlan,
  validateBatchABrowserQuestion as validateBaseQuestion,
  validateBatchABrowserQuestions as validateBaseQuestions,
} from "./batch-a-browser-validator-p01d1.js";
import {
  G6A_U01_PATTERN_SPEC_IDS,
  G6A_U01_SOURCE_ID,
} from "./source-pattern-full-product-p01d2-extension.js";
import {
  G5A_U03_PATTERN_SPEC_IDS,
  G5A_U03_SOURCE_IDS,
  getBatchABrowserPatternDefinition,
  getP01D3PatternSpecIdsForSource,
} from "./source-pattern-full-product-p01d3-extension.js";
import { validateG6AU01NumberTheoryQuestion } from "./number-theory-runtime.js";
import { validateG5AU03FactorMultipleQuestion } from "./factor-multiple-runtime.js";

const G6_SPEC_SET = new Set(G6A_U01_PATTERN_SPEC_IDS);
const G5_SPEC_SET = new Set(G5A_U03_PATTERN_SPEC_IDS);

function isG6Question(question = {}) {
  const id = question.patternSpecId ?? question.metadata?.patternId;
  return question.sourceId === G6A_U01_SOURCE_ID || question.metadata?.sourceId === G6A_U01_SOURCE_ID || G6_SPEC_SET.has(id);
}
function isG5Question(question = {}) {
  const id = question.patternSpecId ?? question.metadata?.patternId;
  return G5A_U03_SOURCE_IDS.includes(question.sourceId) || G5A_U03_SOURCE_IDS.includes(question.metadata?.sourceId) || G5_SPEC_SET.has(id);
}
function issue(code, path, message = code) { return { code, severity: "error", path, message }; }

export function validateBatchABrowserPlan(plan = {}) {
  if (!G5A_U03_SOURCE_IDS.includes(plan.sourceId) && plan.sourceId !== G6A_U01_SOURCE_ID) return validateBasePlan(plan);
  const errors = [];
  if (!Array.isArray(plan.patternSpecIds) || plan.patternSpecIds.length === 0) errors.push(issue("full_product_plan_has_no_patterns", "patternSpecIds"));
  const allowed = plan.sourceId === G6A_U01_SOURCE_ID
    ? G6_SPEC_SET
    : new Set(getP01D3PatternSpecIdsForSource(plan.sourceId));
  for (const patternSpecId of plan.patternSpecIds ?? []) {
    const definition = getBatchABrowserPatternDefinition(patternSpecId);
    if (!allowed.has(patternSpecId) || !definition || definition.sourceId !== plan.sourceId) {
      errors.push(issue("full_product_plan_pattern_not_admitted", "patternSpecIds", `PatternSpec '${patternSpecId}' is not admitted for '${plan.sourceId}'.`));
    }
  }
  if (!Number.isInteger(plan.questionCount) || plan.questionCount <= 0) errors.push(issue("full_product_question_count_invalid", "questionCount"));
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function validateBatchABrowserQuestion(question = {}) {
  if (isG5Question(question)) return validateG5AU03FactorMultipleQuestion(question);
  if (isG6Question(question)) return validateG6AU01NumberTheoryQuestion(question);
  return validateBaseQuestion(question);
}

export function validateBatchABrowserQuestions(questions = []) {
  const containsG5 = questions.some(isG5Question);
  const containsG6 = questions.some(isG6Question);
  if (!containsG5 && !containsG6) return validateBaseQuestions(questions);
  const errors = [];
  const warnings = [];
  for (const [index, question] of questions.entries()) {
    const result = validateBatchABrowserQuestion(question);
    errors.push(...result.errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` })));
    warnings.push(...result.warnings);
  }
  return {
    ok: errors.length === 0,
    errors,
    warnings,
    infos: [],
    validatorVersion: containsG5 ? "p01d3-g5a-u03-factor-multiple-v1" : "p01d2-g6a-u01-number-theory-v1",
    validatedAt: null,
  };
}
