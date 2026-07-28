import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f12.js";
import { G4B_U08_EQUIVALENCE_CROSS_PRODUCT_CASES } from "./equivalence-cross-product-cases.js";
import {
  buildG4BU08EquivalenceCrossProductQuestion,
  validateG4BU08EquivalenceCrossProductQuestion,
} from "./equivalence-cross-product-question.js";
import { G4B_U08_SOURCE_ID } from "../registry/g4b-u08-equivalent-fraction-selector-projection.js";
import { G4B_U08_EQUIVALENCE_CROSS_PRODUCT_SPEC_ID } from "../registry/g4b-u08-equivalence-cross-product-selector-projection.js";

function hashSeed(value) {
  let acc = 2166136261;
  for (const char of String(value ?? "p03f12")) {
    acc ^= char.charCodeAt(0);
    acc = Math.imul(acc, 16777619) >>> 0;
  }
  return acc || 1;
}

export function canGenerateG4BU08EquivalenceCrossProductQuestions(plan = {}) {
  return plan.sourceId === G4B_U08_SOURCE_ID
    && Array.isArray(plan.patternSpecIds)
    && plan.patternSpecIds.length === 1
    && plan.patternSpecIds[0] === G4B_U08_EQUIVALENCE_CROSS_PRODUCT_SPEC_ID;
}

export { validateG4BU08EquivalenceCrossProductQuestion };

export function generateG4BU08EquivalenceCrossProductQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!canGenerateG4BU08EquivalenceCrossProductQuestions(plan)) {
    return {
      ok: false,
      plan,
      questions: [],
      allocation: [],
      errors: [{
        code: "p03f12_plan_not_supported",
        severity: "error",
        path: "plan",
        message: "Slice012 accepts only the admitted cross-product equivalence PatternSpec.",
      }],
      warnings: [],
    };
  }
  if (plan.questionCount > G4B_U08_EQUIVALENCE_CROSS_PRODUCT_CASES.length) {
    return {
      ok: false,
      plan,
      questions: [],
      allocation: [],
      errors: [{
        code: "p03f12_question_count_exceeds_unique_witnesses",
        severity: "error",
        path: "questionCount",
        message: "Slice012 provides at most eight unique witnesses.",
      }],
      warnings: [],
    };
  }
  const offset = hashSeed(plan.generationSeed) % G4B_U08_EQUIVALENCE_CROSS_PRODUCT_CASES.length;
  const selected = Array.from(
    { length: plan.questionCount },
    (_, index) => G4B_U08_EQUIVALENCE_CROSS_PRODUCT_CASES[
      (offset + index) % G4B_U08_EQUIVALENCE_CROSS_PRODUCT_CASES.length
    ],
  );
  const questions = selected.map((row, index) => buildG4BU08EquivalenceCrossProductQuestion(row, index + 1));
  const errors = questions.flatMap((question) => validateG4BU08EquivalenceCrossProductQuestion(question).errors);
  if (new Set(questions.map((row) => row.blankedDisplayText)).size !== questions.length) {
    errors.push({
      code: "p03f12_duplicate_prompt_detected",
      severity: "error",
      path: "questions",
      message: "The worksheet contains duplicate prompts.",
    });
  }
  return {
    ok: errors.length === 0 && questions.length === plan.questionCount,
    plan,
    questions,
    allocation: [{
      patternSpecId: G4B_U08_EQUIVALENCE_CROSS_PRODUCT_SPEC_ID,
      questionCount: questions.length,
    }],
    errors,
    warnings: [],
  };
}
