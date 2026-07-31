import test from "node:test";
import assert from "node:assert/strict";

globalThis.document = Object.freeze({});

const {
  generateBatchABrowserQuestions,
} = await import("../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js");

const BASE_OPTIONS = Object.freeze({
  sourceId: "g3b_u04_3b04",
  questionMode: "application",
  selectionMode: "singleKnowledgePoint",
  selectedKnowledgePointIds: Object.freeze(["kp_g3b_u04_consecutive_multiplication"]),
  selectedPatternGroupIds: Object.freeze(["pg_g3b_u04_consecutive_multiplication_numeric"]),
  questionCount: 20,
  ordering: "groupedByPattern",
  includeAnswerKey: true,
});

test("A05 browser selector route generates twenty validated G3B-U04 application prompts", () => {
  const first = generateBatchABrowserQuestions({
    ...BASE_OPTIONS,
    generationSeed: "pgc-r08-browser-selector-g3b-u04-seed-a",
  });
  const second = generateBatchABrowserQuestions({
    ...BASE_OPTIONS,
    generationSeed: "pgc-r08-browser-selector-g3b-u04-seed-b",
  });

  for (const result of [first, second]) {
    assert.equal(result.ok, true, JSON.stringify({
      errors: result.errors,
      warnings: result.warnings,
      plan: result.plan,
    }));
    assert.equal(result.questions.length, 20);
    assert.equal(new Set(result.questions.map((question) => question.promptText)).size, 20);
    assert.equal(
      result.questions.every((question) => (
        question.resolvedPatternGroupId === "pg_g3b_u04_consecutive_multiplication_application"
      )),
      true,
    );
  }
  assert.notDeepEqual(
    first.questions.map((question) => question.promptText),
    second.questions.map((question) => question.promptText),
  );
});
