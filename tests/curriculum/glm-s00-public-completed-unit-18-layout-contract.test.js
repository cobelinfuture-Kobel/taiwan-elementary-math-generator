import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  BATCH_A_SOURCE_UNITS,
  PUBLIC_CANDIDATE_SOURCE_UNITS,
} from "../../site/modules/curriculum/batch-a/source-units.js";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const contractPath = path.resolve(
  testDirectory,
  "../../data/curriculum/contracts/GLM_S00_PublicCompletedUnit18LayoutContract.json",
);
const contract = JSON.parse(readFileSync(contractPath, "utf8"));

const expectedLayoutIds = Object.freeze([
  "3x1", "3x2", "3x3", "3x4", "3x5",
  "2x1", "2x2", "2x3", "2x4", "2x5", "2x6",
  "1x1", "1x2", "1x3", "1x4", "1x5", "1x6", "1x7",
]);

function sorted(values) {
  return [...values].sort((left, right) => left.localeCompare(right));
}

test("GLM-S00 inventory matches every unit exposed by the public source registry", () => {
  const registryUnits = [...BATCH_A_SOURCE_UNITS, ...PUBLIC_CANDIDATE_SOURCE_UNITS];
  const registrySourceIds = registryUnits.map((unit) => unit.sourceId);
  const contractSourceIds = contract.publicUnits.map((unit) => unit.sourceId);

  assert.equal(registryUnits.length, 15);
  assert.equal(contract.scope.publicUnitCount, 15);
  assert.equal(new Set(contractSourceIds).size, contractSourceIds.length);
  assert.deepEqual(sorted(contractSourceIds), sorted(registrySourceIds));

  const registryBySourceId = new Map(registryUnits.map((unit) => [unit.sourceId, unit]));
  for (const unit of contract.publicUnits) {
    const registryUnit = registryBySourceId.get(unit.sourceId);
    assert.ok(registryUnit, `missing public source ${unit.sourceId}`);
    assert.equal(unit.unitCode, registryUnit.unitCode);
    assert.equal(unit.title, registryUnit.title);
  }
});

test("GLM-S00 approved question-page matrix is exactly the requested 18 layouts", () => {
  const layoutIds = contract.approvedLayouts.map((layout) => layout.layoutId);
  assert.equal(contract.scope.approvedLayoutCountPerUnit, 18);
  assert.equal(contract.approvedLayouts.length, 18);
  assert.equal(new Set(layoutIds).size, layoutIds.length);
  assert.deepEqual(layoutIds, expectedLayoutIds);

  const expectedRanges = new Map([
    [3, [1, 2, 3, 4, 5]],
    [2, [1, 2, 3, 4, 5, 6]],
    [1, [1, 2, 3, 4, 5, 6, 7]],
  ]);
  for (const [columns, rows] of expectedRanges) {
    const actualRows = contract.approvedLayouts
      .filter((layout) => layout.columns === columns)
      .map((layout) => layout.rowsPerPage);
    assert.deepEqual(actualRows, rows);
  }

  for (const layout of contract.approvedLayouts) {
    assert.equal(layout.layoutId, `${layout.columns}x${layout.rowsPerPage}`);
    assert.ok(layout.columns >= 1 && layout.columns <= 3);
  }
});

test("GLM-S00 scenario totals and exact-layout safety rules are locked", () => {
  assert.equal(
    contract.scope.baseScenarioCount,
    contract.scope.publicUnitCount * contract.scope.approvedLayoutCountPerUnit,
  );
  assert.equal(contract.scope.baseScenarioCount, 270);
  assert.equal(contract.scope.answerKeyBoundaryScenarioCount, 15 * 3 * 2);
  assert.equal(contract.scope.answerKeyBoundaryScenarioCount, 90);

  assert.equal(contract.rules.questionLayoutMustResolveExactly, true);
  assert.equal(contract.rules.silentCapForbidden, true);
  assert.equal(contract.rules.ignoredSettingForbidden, true);
  assert.equal(contract.rules.unapprovedLayoutProductionUse, "forbidden");
  assert.equal(contract.rules.answerKeyLayoutIndependent, true);
  assert.equal(contract.rules.queryReplayRequired, true);
  assert.equal(contract.rules.sourceSwitchIsolationRequired, true);
  assert.equal(contract.rules.domOverflowAllowed, 0);
  assert.equal(contract.rules.interCardOverlapAllowed, 0);
  assert.equal(contract.rules.blankPdfPagesAllowed, 0);
  assert.equal(contract.rules.truncatedQuestionsAllowed, 0);
});

test("GLM-S00 task chain continues into the current 15-unit behavior audit", () => {
  assert.equal(contract.taskSequence[0], "GLM-S00_PublicCompletedUnitInventoryAnd18LayoutContract");
  assert.equal(contract.taskSequence.at(-1), "GLM-S08_DeployedClassicUIAndD0Closeout");
  assert.equal(contract.nextTask, "GLM-S01_Current15UnitLayoutBehaviorAudit");
});
