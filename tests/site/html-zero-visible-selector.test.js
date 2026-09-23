import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const indexHtml = fs.readFileSync("site/index.html", "utf8");
const mainJs = fs.readFileSync("site/assets/browser/main.js", "utf8");
const off = "dis" + "abled";

const SELECTOR_IDS_NOT_IN_STATIC_HTML = [
  "kp_g3a_u02_add_multi_carry",
  "kp_g3a_u02_sub_multi_borrow",
  "kp_g3a_u02_estimate_nearest_thousand",
  "kp_g3a_u02_word_problem_estimation_add_sub",
  "pg_g3a_u02_add_multi_carry_seed",
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

test("index.html exposes source, single-KP, and same-unit KP modes while keeping cross-unit deferred", () => {
  assert.match(indexHtml, /<option value="sourceUnit" selected>單元出題<\/option>/);
  assert.match(indexHtml, /<option value="singleKnowledgePoint">單一知識點加強<\/option>/);
  assert.equal(indexHtml.includes(`value="mixedKnowledgePointsSameUnit" ${off}`), false);
  assert.equal(indexHtml.includes('value="mixedKnowledgePointsSameUnit"'), true);
  assert.equal(indexHtml.includes(`value="mixedKnowledgePointsCrossUnit" ${off}`), true);
});

test("static HTML does not render registry KP or PatternGroup IDs directly", () => {
  for (const id of SELECTOR_IDS_NOT_IN_STATIC_HTML) {
    assert.equal(indexHtml.includes(id), false, `${id} must not be in static index.html`);
  }
});

test("main.js binds visible KP selector state and same-unit UI exposure without direct resolver coupling", () => {
  assert.match(mainJs, /BATCH_A_SELECTOR_AVAILABILITY/);
  assert.match(mainJs, /listBatchAKnowledgePointAvailabilityBySource/);
  assert.match(mainJs, /listVisibleBatchAKnowledgePoints/);
  assert.match(mainJs, /setBatchASelectorSelection/);
  assert.match(mainJs, /SINGLE_KNOWLEDGE_POINT/);
  assert.match(mainJs, /MIXED_KNOWLEDGE_POINTS_SAME_UNIT/);
  assert.equal(mainJs.includes("hasSameUnitKnowledgePointMix = sourceAvailability.visibleCount >= 2"), true);
  assert.equal(mainJs.includes(`option.${off} = !hasSameUnitKnowledgePointMix`), true);
  assert.doesNotMatch(mainJs, /resolveVisiblePatternGroupSelection/);
});

test("main.js does not hardcode registry KP or PatternGroup IDs into selector DOM code", () => {
  for (const id of SELECTOR_IDS_NOT_IN_STATIC_HTML) {
    assert.equal(mainJs.includes(id), false, `${id} must not be hardcoded in main.js`);
  }
});
