import test from "node:test";
import assert from "node:assert/strict";

globalThis.document = Object.freeze({
  getElementById() { return null; },
});

const {
  generateBatchABrowserQuestions,
} = await import("../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js");
const {
  createConfigState,
  getBatchAWorksheetPlan,
} = await import("../../site/assets/browser/state/config-state.js");
const {
  buildWorksheetDocumentFromPlan,
} = await import("../../site/assets/browser/pipeline/build-worksheet-document.js");

const BASE_OPTIONS = Object.freeze({
  sourceId: "g3b_u04_3b04",
  questionMode: "application",
  selectionMode: "singleKnowledgePoint",
  selectedKnowledgePointIds: Object.freeze(["kp_g3b_u04_consecutive_multiplication"]),
  selectedPatternGroupIds: Object.freeze(["pg_g3b_u04_consecutive_multiplication_numeric"]),
  questionCount: 20,
  ordering: "groupedByPattern",
  includeAnswerKey: true,
  columns: 3,
  rowsPerPage: 5,
});

function assertTwentyApplicationQuestions(result) {
  assert.equal(result.ok, true, JSON.stringify({
    errors: result.errors,
    warnings: result.warnings,
    validation: result.validation,
    plan: result.plan,
    requestedPlan: result.requestedPlan,
  }));
  const questions = result.questions
    ?? result.worksheetDocument?.generatedQuestions
    ?? result.worksheetDocument?.questions
    ?? [];
  assert.equal(questions.length, 20);
  assert.equal(new Set(questions.map((question) => question.promptText)).size, 20);
  assert.equal(
    questions.every((question) => (
      question.resolvedPatternGroupId === "pg_g3b_u04_consecutive_multiplication_application"
    )),
    true,
  );
  return questions;
}

test("A05 browser selector route generates twenty validated G3B-U04 application prompts", () => {
  const first = generateBatchABrowserQuestions({
    ...BASE_OPTIONS,
    generationSeed: "pgc-r08-browser-selector-g3b-u04-seed-a",
  });
  const second = generateBatchABrowserQuestions({
    ...BASE_OPTIONS,
    generationSeed: "pgc-r08-browser-selector-g3b-u04-seed-b",
  });

  const firstQuestions = assertTwentyApplicationQuestions(first);
  const secondQuestions = assertTwentyApplicationQuestions(second);
  assert.notDeepEqual(
    firstQuestions.map((question) => question.promptText),
    secondQuestions.map((question) => question.promptText),
  );
});

test("A05 Classic query state preserves application mode through the worksheet pipeline", () => {
  const queryState = {
    ...BASE_OPTIONS,
    generationSeed: "pgc-r08-a03-pgc_r03_g3b_u04_3b04_application_3602182d8a79-seed-a",
  };
  const state = createConfigState({ queryState });
  const plan = getBatchAWorksheetPlan(state);

  assert.equal(plan.questionMode, "application");
  assert.equal(plan.generationSeed, queryState.generationSeed);
  assert.deepEqual(plan.selectedKnowledgePointIds, queryState.selectedKnowledgePointIds);
  assert.deepEqual(plan.selectedPatternGroupIds, queryState.selectedPatternGroupIds);

  const result = buildWorksheetDocumentFromPlan(plan);
  assertTwentyApplicationQuestions(result);
});
