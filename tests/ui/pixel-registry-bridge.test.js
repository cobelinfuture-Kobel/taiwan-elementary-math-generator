import test from "node:test";
import assert from "node:assert/strict";

import {
  getPixelRegistrySnapshot,
  getPixelSourceSummary,
  listPixelGrades,
  listPixelKnowledgePointsForSource,
  listPixelSemestersForGrade,
  listPixelSourceOptions,
  listPixelSourceOptionsByFilter
} from "../../site/pixel/pixel-registry-bridge.js";
import { listBatchASourceUnits } from "../../site/modules/curriculum/batch-a/source-units.js";
import {
  BATCH_A_SELECTOR_AVAILABILITY,
  listVisibleBatchAKnowledgePoints
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";

test("Pixel registry bridge exposes Batch A source options without duplicating registry data", () => {
  const sourceUnits = listBatchASourceUnits();
  const options = listPixelSourceOptions();
  assert.equal(options.length, sourceUnits.length);
  assert.equal(options.length, 13);
  assert.deepEqual(options.map((entry) => entry.sourceId), sourceUnits.map((entry) => entry.sourceId));
  for (const option of options) {
    assert.equal(option.label, `${option.unitCode} ${option.title}`);
    assert.equal(option.semesterLabel, option.semester === "upper" ? "上學期" : "下學期");
    assert.equal(typeof option.visibleKnowledgePointCount, "number");
    assert.equal(option.visibleKnowledgePointCount >= 0, true);
  }
});

test("Pixel registry bridge source summaries match shared visible KnowledgePoint registry", () => {
  const visibleKps = listVisibleBatchAKnowledgePoints();
  for (const option of listPixelSourceOptions()) {
    const summary = getPixelSourceSummary(option.sourceId);
    assert.ok(summary);
    const expectedKps = visibleKps.filter((entry) => entry.sourceId === option.sourceId);
    assert.equal(summary.visibleKnowledgePoints.length, expectedKps.length);
    assert.equal(listPixelKnowledgePointsForSource(option.sourceId).length, expectedKps.length);
    assert.equal(summary.summaryText.includes(option.sourceId), false);
    assert.equal(summary.summaryText.includes(option.unitCode), true);
    assert.equal(summary.previewText.includes(option.unitCode), true);
  }
});

test("Pixel registry snapshot keeps global selector counts aligned with shared registry", () => {
  const snapshot = getPixelRegistrySnapshot();
  assert.equal(snapshot.sourceCount, 13);
  assert.equal(snapshot.visibleKnowledgePointCount, BATCH_A_SELECTOR_AVAILABILITY.visibleCount);
  assert.deepEqual(snapshot.grades, [3, 4, 5]);
  assert.equal(Object.keys(snapshot.bySourceId).length, 13);
  assert.ok(snapshot.bySourceId.g4a_u08_4a08);
  assert.equal(snapshot.bySourceId.g4a_u08_4a08.visibleKnowledgePoints.length >= 4, true);
});

test("Pixel unit selector filters grade and semester while preserving authoritative source IDs", () => {
  assert.deepEqual(listPixelGrades(), [3, 4, 5]);
  assert.deepEqual(listPixelSemestersForGrade(3), ["upper", "lower"]);
  assert.deepEqual(listPixelSemestersForGrade(5), ["upper"]);

  const grade3Upper = listPixelSourceOptionsByFilter({ grade: 3, semester: "upper" });
  assert.deepEqual(grade3Upper.map((entry) => entry.sourceId), [
    "g3a_u01_3a01",
    "g3a_u02_3a02",
    "g3a_u03_3a03",
    "g3a_u06_3a06"
  ]);

  const grade4Lower = listPixelSourceOptionsByFilter({ grade: 4, semester: "lower" });
  assert.deepEqual(grade4Lower.map((entry) => entry.sourceId), ["g4b_u01_4b01"]);

  const grade5Upper = listPixelSourceOptionsByFilter({ grade: 5, semester: "upper" });
  assert.deepEqual(grade5Upper.map((entry) => entry.sourceId), ["g5a_u08_5a08"]);
});
