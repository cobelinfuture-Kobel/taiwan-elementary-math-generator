import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  GLM_S03_QUESTION_COUNT,
  GLM_S03_SHARD_COUNT,
  buildGLMS03ScenarioPlan,
  readGLMS03Contract,
  scenariosForShard,
} from "../../tools/curriculum/glm-s03-scenario-plan.mjs";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../..");
const s02Path = path.join(repositoryRoot, "docs/curriculum/output/GLM_S02_UNIT_RENDERER_WORST_CASE_BASELINE.json");
const s02 = JSON.parse(readFileSync(s02Path, "utf8"));

test("GLM-S03 plans the exact 15-unit by 18-layout baseline", () => {
  const contract = readGLMS03Contract();
  const plan = buildGLMS03ScenarioPlan();
  assert.equal(GLM_S03_QUESTION_COUNT, 18);
  assert.equal(GLM_S03_SHARD_COUNT, 5);
  assert.equal(plan.length, 270);
  assert.equal(plan.length, contract.scope.baseScenarioCount);
  assert.equal(new Set(plan.map((scenario) => scenario.scenarioId)).size, 270);
  for (const unit of contract.publicUnits) {
    const unitScenarios = plan.filter((scenario) => scenario.sourceId === unit.sourceId);
    assert.equal(unitScenarios.length, 18, unit.sourceId);
    assert.deepEqual(unitScenarios.map((scenario) => scenario.layoutId), contract.approvedLayouts.map((layout) => layout.layoutId));
  }
});

test("GLM-S03 splits the baseline into five deterministic shards", () => {
  const combined = [];
  for (let index = 0; index < GLM_S03_SHARD_COUNT; index += 1) {
    const shard = scenariosForShard(index);
    assert.equal(shard.length, 54, `shard ${index}`);
    assert.equal(new Set(shard.map((scenario) => scenario.sourceId)).size, 3);
    assert.ok(shard.every((scenario) => scenario.shardIndex === index));
    combined.push(...shard);
  }
  assert.equal(combined.length, 270);
  assert.equal(new Set(combined.map((scenario) => scenario.scenarioId)).size, 270);
});

test("GLM-S03 preserves deterministic generation settings", () => {
  const plan = buildGLMS03ScenarioPlan();
  for (const scenario of plan) {
    assert.equal(scenario.generationSeed, `glm-s01:${scenario.sourceId}:${scenario.layoutId}`);
    assert.equal(scenario.questionCount, 18);
    assert.equal(scenario.includeAnswerKey, false);
    assert.ok(scenario.requestedColumns >= 1 && scenario.requestedColumns <= 3);
    assert.ok(scenario.requestedRowsPerPage >= 1 && scenario.requestedRowsPerPage <= 7);
  }
});

test("GLM-S03 follows the accepted S02 audit authority", () => {
  assert.equal(s02.status, "AUDIT_CAPTURED_AND_VALIDATED");
  assert.equal(s02.scope.publicUnitCount, 15);
  assert.equal(s02.scope.unitsWithoutSamples, 0);
  assert.equal(s02.nextTask, "GLM-S03_270ScenarioHTMLPDFBaseline");
  assert.ok(s02.s03Priorities.includes("G4B-U04 inverse_possible_values under all 18 layouts"));
});
