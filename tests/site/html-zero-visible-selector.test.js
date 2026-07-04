import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const indexHtml = fs.readFileSync("site/index.html", "utf8");
const mainJs = fs.readFileSync("site/assets/browser/main.js", "utf8");

const VISIBLE_SELECTOR_IDS = [
  "kp_g3a_u02_add_multi_carry",
  "pg_g3a_u02_add_multi_carry_seed"
];

const FORBIDDEN_SELECTOR_IDS = [
  "kp_g3a_u02_sub_multi_borrow",
  "kp_g3a_u02_estimate_nearest_thousand",
  "kp_g3a_u02_word_problem_estimation_add_sub",
  "pg_g3a_u02_sub_multi_borrow_seed",
  "pg_g3a_u02_estimate_nearest_thousand",
  "pg_g3a_u02_word_problem_estimation_add_sub"
];

test("index.html contains the KnowledgePoint selector shell", () => {
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

test("index.html enables only sourceUnit and singleKnowledgePoint modes", () => {
  assert.match(indexHtml, /<option value="sourceUnit" selected>單元出題<\/option>/);
  assert.match(indexHtml, /<option value="singleKnowledgePoint">單一知識點加強<\/option>/);
  assert.match(indexHtml, /<option value="mixedKnowledgePointsSameUnit" disabled>同單元知識點混合<\/option>/);
  assert.match(indexHtml, /<option value="mixedKnowledgePointsCrossUnit" disabled>跨單元知識點混合<\/option>/);
});

test("static HTML does not render visible, hidden, or D row IDs directly", () => {
  for (const id of [...VISIBLE_SELECTOR_IDS, ...FORBIDDEN_SELECTOR_IDS]) {
    assert.equal(indexHtml.includes(id), false, `${id} must not be in static index.html`);
  }
});

test("main.js binds visible KP selector state without enabling mixed modes", () => {
  assert.match(mainJs, /BATCH_A_SELECTOR_AVAILABILITY/);
  assert.match(mainJs, /listBatchAKnowledgePointAvailabilityBySource/);
  assert.match(mainJs, /listVisibleBatchAKnowledgePoints/);
  assert.match(mainJs, /setBatchASelectorSelection/);
  assert.match(mainJs, /SINGLE_KNOWLEDGE_POINT/);
  assert.match(mainJs, /MIXED_KNOWLEDGE_POINTS_SAME_UNIT/);
  assert.match(mainJs, /MIXED_KNOWLEDGE_POINTS_CROSS_UNIT/);
  assert.doesNotMatch(mainJs, /resolveVisiblePatternGroupSelection/);
});

test("main.js does not hardcode visible, hidden, or D row IDs into selector DOM code", () => {
  for (const id of [...VISIBLE_SELECTOR_IDS, ...FORBIDDEN_SELECTOR_IDS]) {
    assert.equal(mainJs.includes(id), false, `${id} must not be hardcoded in main.js`);
  }
});
