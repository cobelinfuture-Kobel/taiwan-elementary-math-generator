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
import { listFullProductPublicSourceUnits } from "../../site/modules/curriculum/batch-a/source-units.js";
import {
  BATCH_A_SELECTOR_AVAILABILITY,
  listVisibleBatchAKnowledgePoints
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";

test("Pixel registry bridge exposes the nineteen-source public registry without duplicating data", () => {
  const sourceUnits = listFullProductPublicSourceUnits();
  const options = listPixelSourceOptions();
  assert.equal(sourceUnits.length, 19);
  assert.equal(options.length, sourceUnits.length);
  assert.equal(options.length, 19);
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

test("Pixel registry snapshot keeps public source and global selector counts aligned", () => {
  const snapshot = getPixelRegistrySnapshot();
  assert.equal(snapshot.sourceCount, 19);
  assert.equal(snapshot.visibleKnowledgePointCount, BATCH_A_SELECTOR_AVAILABILITY.visibleCount);
  assert.deepEqual(snapshot.grades, [3, 4, 5, 6]);
  assert.equal(Object.keys(snapshot.bySourceId).length, 19);
  assert.ok(snapshot.bySourceId.g4a_u08_4a08);
  assert.ok(snapshot.bySourceId.g6a_u01_6a01);
  assert.equal(snapshot.bySourceId.g4a_u08_4a08.visibleKnowledgePoints.length >= 4, true);
  assert.equal(snapshot.bySourceId.g6a_u01_6a01.visibleKnowledgePoints.length, 5);
});

test("Pixel unit selector filters grade and semester while preserving nineteen-source IDs", () => {
  assert.deepEqual(listPixelGrades(), [3, 4, 5, 6]);
  assert.deepEqual(listPixelSemestersForGrade(3), ["upper", "lower"]);
  assert.deepEqual(listPixelSemestersForGrade(5), ["upper", "lower"]);
  assert.deepEqual(listPixelSemestersForGrade(6), ["upper"]);

  const grade3Upper = listPixelSourceOptionsByFilter({ grade: 3, semester: "upper" });
  assert.deepEqual(grade3Upper.map((entry) => entry.sourceId), [
    "g3a_u01_3a01",
    "g3a_u02_3a02",
    "g3a_u03_3a03",
    "g3a_u06_3a06"
  ]);

  const grade4Lower = listPixelSourceOptionsByFilter({ grade: 4, semester: "lower" });
  assert.deepEqual(grade4Lower.map((entry) => entry.sourceId), [
    "g4b_u01_4b01",
    "g4b_u04_4b04"
  ]);

  const grade5Upper = listPixelSourceOptionsByFilter({ grade: 5, semester: "upper" });
  assert.deepEqual(grade5Upper.map((entry) => entry.sourceId), [
    "g5a_u08_5a08",
    "g5a_u02_5a02",
    "g5a_u03_5a03a",
    "g5a_u03_5a03a1"
  ]);
  assert.deepEqual(
    listPixelSourceOptionsByFilter({ grade: 5, semester: "lower" }).map((entry) => entry.sourceId),
    ["g5b_u05_5b05a"]
  );
  assert.deepEqual(
    listPixelSourceOptionsByFilter({ grade: 6, semester: "upper" }).map((entry) => entry.sourceId),
    ["g6a_u01_6a01"]
  );
});
