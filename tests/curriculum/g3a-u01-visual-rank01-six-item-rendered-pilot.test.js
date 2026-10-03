import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  validateOneWayStatisticsTable,
  renderOneWayStatisticsTable
} from "../../site/modules/renderer/one-way-statistics-table.js";

const PILOT_PATH = new URL("../../data/curriculum/application/pilots/g3a_u01/g3a-u01-visual-rank01-six-item-pilot.json", import.meta.url);
const PREVIEW_PATH = new URL("../../docs/curriculum/output/G3A_U01_VISUAL_RANK01_SIX_ITEM_RENDERED_PILOT_PREVIEW.html", import.meta.url);

const pilot = JSON.parse(fs.readFileSync(PILOT_PATH, "utf8"));
const preview = fs.readFileSync(PREVIEW_PATH, "utf8");

function uniqueExtremum(rows, direction) {
  return rows.reduce((best,row)=>
    direction === "max"
      ? (row.displayValue > best.displayValue ? row : best)
      : (row.displayValue < best.displayValue ? row : best)
  );
}

test("Rank01 visual pilot contains exactly six fixed-seed review items across all four prompt variants", () => {
  assert.equal(pilot.schemaName, "G3AU01VisualRank01SixItemRenderedPilot");
  assert.equal(pilot.patternSpecId, "ps_g3a_u01_visual_one_way_table_compare");
  assert.equal(pilot.counts.pilotItemCount, 6);
  assert.equal(new Set(pilot.items.map((row) => row.pilotId)).size, 6);
  assert.deepEqual(
    new Set(pilot.items.map((row) => row.promptVariant)),
    new Set(["MAXIMUM_CATEGORY","MINIMUM_CATEGORY","COMPARE_TWO_ROWS","UNIQUE_THRESHOLD_MATCH"])
  );
  assert.equal(pilot.lifecycle.productionGeneratorUsed, false);
  assert.equal(pilot.lifecycle.nativeRendererUsed, true);
  assert.equal(pilot.lifecycle.mergeBeforeHumanApproval, false);
});

test("all six pilot models are accepted by the actual native one-way table renderer", () => {
  for (const item of pilot.items) {
    assert.equal(validateOneWayStatisticsTable(item.model), true, item.pilotId);
    const rendered = renderOneWayStatisticsTable(item.model);
    assert.match(rendered, /data-representation="one-way-statistics-table"/);
    assert.ok(preview.includes(rendered), `${item.pilotId} preview must contain exact native renderer output`);
  }
});

test("pilot covers 3, 4, 6, and 8 row visual densities", () => {
  assert.deepEqual(
    [...new Set(pilot.items.map((row) => row.model.rows.length))].sort((a,b)=>a-b),
    [3,4,6,8]
  );
});

test("maximum and minimum pilot answers independently recompute", () => {
  for (const item of pilot.items.filter((row) => row.promptVariant === "MAXIMUM_CATEGORY")) {
    const best = uniqueExtremum(item.model.rows, "max");
    assert.equal(item.expectedAnswer.selectedCategory, best.displayCategory);
    assert.equal(item.expectedAnswer.selectedValue, best.displayValue);
  }
  for (const item of pilot.items.filter((row) => row.promptVariant === "MINIMUM_CATEGORY")) {
    const best = uniqueExtremum(item.model.rows, "min");
    assert.equal(item.expectedAnswer.selectedCategory, best.displayCategory);
    assert.equal(item.expectedAnswer.selectedValue, best.displayValue);
  }
});

test("two-row comparison and threshold pilot answers independently recompute", () => {
  const compare = pilot.items.find((row) => row.promptVariant === "COMPARE_TWO_ROWS");
  const [a,b] = compare.expectedAnswer.comparedCategories.map((name) =>
    compare.model.rows.find((row) => row.displayCategory === name)
  );
  assert.ok(a && b);
  assert.equal(compare.expectedAnswer.comparisonSymbol, a.displayValue > b.displayValue ? ">" : "<");
  assert.equal(compare.expectedAnswer.selectedCategory, a.displayValue > b.displayValue ? a.displayCategory : b.displayCategory);

  const threshold = pilot.items.find((row) => row.promptVariant === "UNIQUE_THRESHOLD_MATCH");
  const matches = threshold.model.rows.filter((row) =>
    threshold.threshold.relation === ">" ? row.displayValue > threshold.threshold.value : false
  );
  assert.equal(matches.length, 1);
  assert.equal(threshold.expectedAnswer.selectedCategory, matches[0].displayCategory);
  assert.equal(threshold.expectedAnswer.selectedValue, matches[0].displayValue);
});

test("human visual review is explicit and automatic approval is forbidden", () => {
  assert.equal(pilot.humanReview.ready, true);
  assert.equal(pilot.humanReview.automaticApprovalForbidden, true);
  assert.equal(pilot.humanReview.decision, null);
  assert.ok(pilot.humanReview.checklist.length >= 6);
  assert.equal(pilot.lifecycle.productionUse, "forbidden");
});
