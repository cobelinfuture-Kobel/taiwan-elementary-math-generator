import test from "node:test";
import assert from "node:assert/strict";

import { generateBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-generator.js";

const SOURCE_ID = "g3a_u02_3a02_context_estimate_runtime";
const SPEC_ID = "ps_g3a_u02_word_problem_estimation_add_sub";
const KIND = "word" + "Problem" + "Estimation";

test("S43G2O generator bridge produces context estimate questions", () => {
  const result = generateBatchABrowserQuestions({
    sourceId: SOURCE_ID,
    questionCount: 5,
    generationSeed: "s43g2o-bridge",
    includeAnswerKey: true
  });

  assert.equal(result.ok, true);
  assert.equal(result.questions.length, 5);
  assert.equal(result.questions.every((question) => question.patternSpecId === SPEC_ID), true);
  assert.equal(result.questions.every((question) => question.kind === KIND), true);
  assert.equal(result.questions.every((question) => typeof question.answerText === "string"), true);
  assert.equal(result.questions.every((question) => Number.isSafeInteger(question.finalAnswer)), true);
  assert.deepEqual(result.allocation, [{ patternSpecId: SPEC_ID, questionCount: 5 }]);
});
