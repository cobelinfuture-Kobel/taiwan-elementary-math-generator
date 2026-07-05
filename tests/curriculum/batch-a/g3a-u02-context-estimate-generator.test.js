import test from "node:test";
import assert from "node:assert/strict";

import { generateBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-generator.js";
import { BATCH_A_RESOLVER_SELECTION_MODES } from "../../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";

const SOURCE_ID = "g3a_u02_3a02";
const KP_ID = "kp_g3a_u02_word_problem_estimation_add_sub";
const GROUP_ID = "pg_g3a_u02_word_problem_estimation_add_sub";
const SPEC_ID = "ps_g3a_u02_word_problem_estimation_add_sub";
const KIND = "word" + "Problem" + "Estimation";

test("S43G2P generator produces promoted context estimate questions", () => {
  const result = generateBatchABrowserQuestions({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [KP_ID],
    selectedPatternGroupIds: [GROUP_ID],
    questionCount: 5,
    generationSeed: "s43g2p-selector",
    includeAnswerKey: true
  });

  assert.equal(result.ok, true);
  assert.equal(result.questions.length, 5);
  assert.equal(result.plan.sourceIds.includes(SOURCE_ID), true);
  assert.deepEqual(result.plan.knowledgePointIds, [KP_ID]);
  assert.deepEqual(result.plan.patternGroupIds, [GROUP_ID]);
  assert.deepEqual(result.plan.patternSpecIds, [SPEC_ID]);
  assert.equal(result.questions.every((question) => question.patternSpecId === SPEC_ID), true);
  assert.equal(result.questions.every((question) => question.kind === KIND), true);
  assert.equal(result.questions.every((question) => typeof question.answerText === "string"), true);
  assert.equal(result.questions.every((question) => Number.isSafeInteger(question.finalAnswer)), true);
  assert.deepEqual(result.allocation, [{ patternGroupId: GROUP_ID, patternSpecId: SPEC_ID, questionCount: 5 }]);
});
