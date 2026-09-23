import test from "node:test";
import assert from "node:assert/strict";

import { parseQueryState } from "../../site/assets/browser/state/query-state.js";

const SOURCE_ID = "g3a_u03_3a03";
const KP_ID = "kp_g3a_u03_consecutive_multiplication_two_step_word_problem";
const PG_ID = "pg_g3a_u03_consecutive_multiplication_two_step_word_problem";

function wordProblemQuery() {
  const params = new URLSearchParams({
    sourceId: SOURCE_ID,
    questionCount: "10",
    ordering: "groupedByPattern",
    answerKey: "1",
    generationSeed: "g3a-u03-word-problem-browser-smoke",
    columns: "1",
    rowsPerPage: "8",
    selectionMode: "singleKnowledgePoint",
    kp: KP_ID,
    pg: PG_ID
  });
  return `?${params.toString()}`;
}

test("G3A U03 word problem KP query params survive parseQueryState", () => {
  const state = parseQueryState(wordProblemQuery());
  assert.equal(state.sourceId, SOURCE_ID);
  assert.equal(state.questionCount, 10);
  assert.equal(state.selectionMode, "singleKnowledgePoint");
  assert.deepEqual(state.selectedKnowledgePointIds, [KP_ID]);
  assert.deepEqual(state.selectedPatternGroupIds, [PG_ID]);
  assert.deepEqual(state.selectorWarnings, []);
});
