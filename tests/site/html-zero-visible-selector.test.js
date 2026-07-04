import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const indexHtml = fs.readFileSync("site/index.html", "utf8");
const mainJs = fs.readFileSync("site/assets/browser/main.js", "utf8");

const FORBIDDEN_SELECTOR_IDS = [
  "kp_g3a_u02_add_multi_carry",
  "kp_g3a_u02_sub_multi_borrow",
  "kp_g3a_u02_estimate_nearest_thousand",
  "kp_g3a_u02_word_problem_estimation_add_sub",
  "pg_g3a_u02_add_multi_carry_seed",
  "pg_g3a_u02_sub_multi_borrow_seed",
  "pg_g3a_u02_estimate_nearest_thousand",
  "pg_g3a_u02_word_problem_estimation_add_sub"
];

test("index.html contains the zero-visible KnowledgePoint selector shell", () => {
  for (const id of [
    "batch-a-selection-mode-select",
    "batch-a-knowledge-point-panel",
    "batch-a-knowledge-point-empty-state",
    "batch-a-knowledge-point-availability-summary",
    "batch-a-knowledge-point-warning-list"
  ]) {
    assert.match(indexHtml, new RegExp(`id="${id}"`));
  }
});

test("index.html keeps KnowledgePoint modes disabled in zero-visible state", () => {
  assert.match(indexHtml, /<option value="sourceUnit" selected>單元出題<\/option>/);
  assert.match(indexHtml, /<option value="singleKnowledgePoint" disabled>單一知識點加強<\/option>/);
  assert.match(indexHtml, /<option value="mixedKnowledgePointsSameUnit" disabled>同單元知識點混合<\/option>/);
  assert.match(indexHtml, /<option value="mixedKnowledgePointsCrossUnit" disabled>跨單元知識點混合<\/option>/);
});

test("zero-visible selector shell does not render hidden or D row IDs in static HTML", () => {
  for (const forbiddenId of FORBIDDEN_SELECTOR_IDS) {
    assert.equal(indexHtml.includes(forbiddenId), false, `${forbiddenId} must not be in index.html`);
  }
});

test("main.js binds selector availability without enabling KP generation", () => {
  assert.match(mainJs, /BATCH_A_SELECTOR_AVAILABILITY/);
  assert.match(mainJs, /listBatchAKnowledgePointAvailabilityBySource/);
  assert.match(mainJs, /setBatchASelectionMode\(state, BATCH_A_SELECTION_MODES\.SOURCE_UNIT\)/);
  assert.doesNotMatch(mainJs, /resolveVisiblePatternGroupSelection/);
});

test("main.js does not hardcode hidden or D row IDs into selector DOM code", () => {
  for (const forbiddenId of FORBIDDEN_SELECTOR_IDS) {
    assert.equal(mainJs.includes(forbiddenId), false, `${forbiddenId} must not be in main.js`);
  }
});
