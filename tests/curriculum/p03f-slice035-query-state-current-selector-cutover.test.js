import test from "node:test";
import assert from "node:assert/strict";

import { parseQueryState } from "../../site/assets/browser/state/query-state.js";

const SOURCE_ID = "g4b_u06_4b06";
const KP_ID = "kp_g4b_u06_decimal_scale_ten_hundred";
const GROUP_ID = "pg_g4b_u06_decimal_scale_ten_hundred_numeric";

function slice035Search(overrides = {}) {
  const params = new URLSearchParams({
    sourceId: SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    questionCount: "24",
    ordering: "groupedByPattern",
    answerKey: "1",
    generationSeed: "p03f35-postmerge-pages-e2e",
    columns: "2",
    rowsPerPage: "4",
    ...overrides,
  });
  params.append("kp", KP_ID);
  params.append("pg", GROUP_ID);
  return `?${params.toString()}`;
}

test("P03F35 current query-state consumer preserves the Slice035 deep-link KP and pattern group", () => {
  const state = parseQueryState(slice035Search());

  assert.equal(state.sourceId, SOURCE_ID);
  assert.equal(state.selectionMode, "singleKnowledgePoint");
  assert.deepEqual(state.selectedKnowledgePointIds, [KP_ID]);
  assert.deepEqual(state.selectedPatternGroupIds, [GROUP_ID]);
  assert.deepEqual(state.selectorWarnings, []);
  assert.equal(state.questionCount, 24);
  assert.equal(state.ordering, "groupedByPattern");
  assert.equal(state.includeAnswerKey, true);
  assert.equal(state.generationSeed, "p03f35-postmerge-pages-e2e");
  assert.equal(state.columns, 2);
  assert.equal(state.rowsPerPage, 4);
});

test("P03F35 query-state still enforces source scoping for the current KP", () => {
  const state = parseQueryState(slice035Search({ sourceId: "g4b_u05_4b05" }));

  assert.equal(state.selectionMode, "sourceUnit");
  assert.deepEqual(state.selectedKnowledgePointIds, []);
  assert.deepEqual(state.selectedPatternGroupIds, []);
  assert.ok(state.selectorWarnings.some((entry) => entry.code === "selector_id_dropped" && entry.field === "knowledgePointIds"));
  assert.ok(state.selectorWarnings.some((entry) => entry.code === "selector_mode_fallback"));
});
