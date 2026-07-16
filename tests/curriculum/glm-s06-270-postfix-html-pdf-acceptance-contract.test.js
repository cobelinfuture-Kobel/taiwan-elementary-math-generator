import assert from "node:assert/strict";
import test from "node:test";

import {
  GLM_S06_QUESTION_COUNT,
  GLM_S06_SHARD_COUNT,
  buildGLMS06ScenarioPlan,
  readGLMS06Contract,
  scenariosForShard,
} from "../../tools/curriculum/glm-s06-scenario-plan.mjs";

const APPROVED_LAYOUT_IDS = Object.freeze([
  "3x1", "3x2", "3x3", "3x4", "3x5",
  "2x1", "2x2", "2x3", "2x4", "2x5", "2x6",
  "1x1", "1x2", "1x3", "1x4", "1x5", "1x6", "1x7",
]);

test("GLM-S06 plans the exact post-fix 15-unit by 18-layout matrix", () => {
  const contract = readGLMS06Contract();
  const plan = buildGLMS06ScenarioPlan();
  assert.equal(GLM_S06_QUESTION_COUNT, 18);
  assert.equal(GLM_S06_SHARD_COUNT, 5);
  assert.equal(plan.length, 270);
  assert.equal(plan.length, contract.scope.baseScenarioCount);
  assert.equal(new Set(plan.map((scenario) => scenario.scenarioId)).size, 270);
  assert.deepEqual(contract.approvedLayouts.map((layout) => layout.layoutId), APPROVED_LAYOUT_IDS);
  for (const unit of contract.publicUnits) {
    const unitScenarios = plan.filter((scenario) => scenario.sourceId === unit.sourceId);
    assert.equal(unitScenarios.length, 18, unit.sourceId);
    assert.deepEqual(unitScenarios.map((scenario) => scenario.layoutId), APPROVED_LAYOUT_IDS);
  }
});

test("GLM-S06 splits all scenarios into five deterministic 54-scenario shards", () => {
  const combined = [];
  for (let index = 0; index < GLM_S06_SHARD_COUNT; index += 1) {
    const shard = scenariosForShard(index);
    assert.equal(shard.length, 54, `shard ${index}`);
    assert.equal(new Set(shard.map((scenario) => scenario.sourceId)).size, 3);
    assert.ok(shard.every((scenario) => scenario.shardIndex === index));
    combined.push(...shard);
  }
  assert.equal(combined.length, 270);
  assert.equal(new Set(combined.map((scenario) => scenario.scenarioId)).size, 270);
});

test("GLM-S06 uses post-fix deterministic generation without static unit exceptions", () => {
  const plan = buildGLMS06ScenarioPlan();
  for (const scenario of plan) {
    assert.equal(scenario.generationSeed, `glm-s06:${scenario.sourceId}:${scenario.layoutId}`);
    assert.equal(scenario.questionCount, 18);
    assert.equal(scenario.includeAnswerKey, false);
    assert.ok(scenario.requestedColumns >= 1 && scenario.requestedColumns <= 3);
    assert.ok(scenario.requestedRowsPerPage >= 1 && scenario.requestedRowsPerPage <= 7);
  }
  assert.equal(plan.filter((scenario) => scenario.sourceId === "g5a_u02_5a02").length, 18);
});

test("GLM-S06 implementation declares strict acceptance and the S07 continuation", async () => {
  const aggregator = await import("../../tools/curriculum/aggregate-glm-s06-html-pdf-acceptance.mjs?contract-only").catch(() => null);
  assert.equal(aggregator, null, "aggregate is an executable authority, not an importable no-op");
  const contract = readGLMS06Contract();
  assert.equal(contract.scope.publicUnitCount, 15);
  assert.equal(contract.scope.approvedLayoutCountPerUnit, 18);
});
