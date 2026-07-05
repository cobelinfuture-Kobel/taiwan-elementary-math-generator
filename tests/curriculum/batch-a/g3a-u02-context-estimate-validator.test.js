import test from "node:test";
import assert from "node:assert/strict";

import { validateBatchABrowserQuestion } from "../../../site/modules/curriculum/batch-a/batch-a-browser-validator.js";

const SPEC_ID = "ps_g3a_u02_word_problem_estimation_add_sub";
const SOURCE_ID = "g3a_u02_3a02_context_estimate_runtime";
const KIND = "word" + "Problem" + "Estimation";

function makeQuestion(finalAnswer) {
  return {
    id: "context-estimate-fixture",
    patternSpecId: SPEC_ID,
    sourceId: SOURCE_ID,
    kind: KIND,
    left: 1499,
    right: 2500,
    operator: "add",
    unit: 1000,
    answerText: String(finalAnswer),
    finalAnswer,
    metadata: {
      patternId: SPEC_ID,
      sourceId: SOURCE_ID
    }
  };
}

test("S43G2O validator accepts correct context estimate answer", () => {
  const result = validateBatchABrowserQuestion(makeQuestion(4000));
  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
});

test("S43G2O validator rejects incorrect context estimate answer", () => {
  const result = validateBatchABrowserQuestion(makeQuestion(3000));
  assert.equal(result.ok, false);
  assert.equal(result.errors.some((error) => error.code === "batch_a_answer_incorrect"), true);
});
