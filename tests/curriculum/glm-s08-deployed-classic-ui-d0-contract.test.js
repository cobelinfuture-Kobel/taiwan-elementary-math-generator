import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import {
  GLM_S08_BOUNDARY_LAYOUT_IDS,
  GLM_S08_QUESTION_COUNT,
  buildGLMS08DeployedScenarioPlan,
  readGLMS08Contract,
} from "../../tools/curriculum/glm-s08-deployed-scenario-plan.mjs";

test("GLM-S07 accepted authority is closed before S08 starts", () => {
  const passPath = "docs/curriculum/output/GLM_S07_ANSWER_KEY_BOUNDARY_STRESS_PASS.marker";
  const pendingPath = "docs/curriculum/output/GLM_S07_ANSWER_KEY_BOUNDARY_STRESS_PENDING.marker";
  assert.equal(existsSync(passPath), true);
  assert.equal(existsSync(pendingPath), false);
  const marker = readFileSync(passPath, "utf8");
  assert.match(marker, /STATUS=PASS_ACCEPTED_AND_MERGED/);
  assert.match(marker, /ACCEPTANCE_PASS_COUNT=90/);
  assert.match(marker, /QUESTION_ITEM_COUNT=1620/);
  assert.match(marker, /ANSWER_ITEM_COUNT=810/);
  assert.match(marker, /GLOBAL_STATUS=ALL_90_ANSWER_KEY_BOUNDARY_HTML_PDF_PASS/);
});

test("GLM-S08 deployed plan contains the exact 315-scenario closeout matrix", () => {
  const contract = readGLMS08Contract();
  const plan = buildGLMS08DeployedScenarioPlan();
  assert.equal(contract.scope.publicUnitCount, 15);
  assert.equal(contract.scope.approvedLayoutCountPerUnit, 18);
  assert.equal(GLM_S08_QUESTION_COUNT, 18);
  assert.deepEqual(GLM_S08_BOUNDARY_LAYOUT_IDS, ["3x5", "2x6", "1x7"]);
  assert.equal(plan.length, 315);
  assert.equal(new Set(plan.map((row) => row.scenarioId)).size, 315);
  assert.equal(plan.filter((row) => !row.includeAnswerKey).length, 270);
  assert.equal(plan.filter((row) => row.includeAnswerKey).length, 45);
  assert.equal(plan.filter((row) => row.printRequired).length, 90);
  assert.equal(plan.filter((row) => row.reloadRequired).length, 15);
  assert.equal(new Set(plan.map((row) => row.sourceId)).size, 15);
  assert.equal(new Set(plan.filter((row) => !row.includeAnswerKey).map((row) => row.layoutId)).size, 18);
  for (const unit of contract.publicUnits) {
    const rows = plan.filter((row) => row.sourceId === unit.sourceId);
    assert.equal(rows.length, 21, unit.sourceId);
    assert.equal(rows.filter((row) => !row.includeAnswerKey).length, 18, unit.sourceId);
    assert.equal(rows.filter((row) => row.includeAnswerKey).length, 3, unit.sourceId);
    assert.equal(rows.filter((row) => row.printRequired).length, 6, unit.sourceId);
    assert.equal(rows.filter((row) => row.reloadRequired).length, 1, unit.sourceId);
  }
});

test("GLM-S08 harness validates deployed identity, query replay, preview and print", () => {
  const runner = readFileSync("tools/curriculum/run-glm-s08-deployed-classic-ui-d0.mjs", "utf8");
  assert.match(runner, /deployedAssetEvidence/);
  assert.match(runner, /localSha256/);
  assert.match(runner, /remoteSha256/);
  assert.match(runner, /batch-a-source-select/);
  assert.match(runner, /sourceSwitchResults/);
  assert.match(runner, /waitForHydration/);
  assert.match(runner, /exact_approved_matrix/);
  assert.match(runner, /g4bU04RequestedColumns/);
  assert.match(runner, /g4bU04ResolvedColumns/);
  assert.match(runner, /ANSWER_CARD_COUNT_MISMATCH/);
  assert.match(runner, /ANSWER_PAGE_OFF_LEAK/);
  assert.match(runner, /OVERFLOW/);
  assert.match(runner, /OVERLAP/);
  assert.match(runner, /printRequired/);
  assert.match(runner, /reloadRequired/);
  assert.match(runner, /D0_GLOBAL_COMPLETED_UNITS_18_LAYOUT_MATRIX_CLOSED/);
  assert.match(runner, /scenarioCount !== 315/);
  assert.match(runner, /printPassCount !== 90/);
  assert.match(runner, /reloadPassCount !== 15/);
  assert.match(runner, /sourceSwitchPassCount !== 15/);
  assert.doesNotMatch(runner, /genericFallback:\s*true/);
  assert.doesNotMatch(runner, /freeFormAI:\s*true/);
});
