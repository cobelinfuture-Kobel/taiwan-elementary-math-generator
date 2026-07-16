import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  GLM_S06_QUESTION_COUNT,
  GLM_S06_SHARD_COUNT,
  buildGLMS06ScenarioPlan,
  readGLMS06Contract,
  scenariosForGLMS06Shard,
} from "../../tools/curriculum/glm-s06-scenario-plan.mjs";

test("GLM-S06 scenario plan is exactly 15 units by 18 approved layouts", () => {
  const contract = readGLMS06Contract();
  const plan = buildGLMS06ScenarioPlan();
  assert.equal(contract.scope.publicUnitCount, 15);
  assert.equal(contract.scope.approvedLayoutCountPerUnit, 18);
  assert.equal(contract.scope.baseScenarioCount, 270);
  assert.equal(GLM_S06_QUESTION_COUNT, 18);
  assert.equal(GLM_S06_SHARD_COUNT, 5);
  assert.equal(plan.length, 270);
  assert.equal(new Set(plan.map((scenario) => scenario.scenarioId)).size, 270);
  assert.deepEqual(
    Array.from({ length: GLM_S06_SHARD_COUNT }, (_, index) => scenariosForGLMS06Shard(index).length),
    [54, 54, 54, 54, 54],
  );
  for (const unit of contract.publicUnits) {
    const rows = plan.filter((scenario) => scenario.sourceId === unit.sourceId);
    assert.equal(rows.length, 18, unit.sourceId);
    assert.deepEqual(
      new Set(rows.map((scenario) => scenario.layoutId)),
      new Set(contract.approvedLayouts.map((layout) => layout.layoutId)),
    );
  }
});

test("GLM-S06 uses the post-fix public runtime for every unit including G5A-U02", () => {
  const runner = readFileSync("tools/curriculum/run-glm-s06-html-pdf-shard.mjs", "utf8");
  assert.match(runner, /buildWorksheetDocumentFromState/);
  assert.match(runner, /renderWorksheetDocumentToHtml/);
  assert.doesNotMatch(runner, /staticG5AU02Html/);
  assert.doesNotMatch(runner, /S93_G5A_U02_HiddenWorksheet\.html/);
  assert.match(runner, /documentAcceptance/);
  assert.match(runner, /layoutExact/);
  assert.match(runner, /layoutCapped/);
  assert.match(runner, /QUESTION_CARD_COUNT_MISMATCH/);
  assert.match(runner, /PDF_BOUNDING_BOX_OVERFLOW/);
});

test("GLM-S06 aggregate authority requires all 270 document and render passes", () => {
  const aggregate = readFileSync("tools/curriculum/aggregate-glm-s06-html-pdf-acceptance.mjs", "utf8");
  assert.match(aggregate, /ALL_270_POSTFIX_HTML_PDF_PASS/);
  assert.match(aggregate, /PASS_ACCEPTED/);
  assert.match(aggregate, /generatedScenarioCount === scenarios\.length/);
  assert.match(aggregate, /renderPassCount === scenarios\.length/);
  assert.match(aggregate, /acceptancePassCount === scenarios\.length/);
  assert.match(aggregate, /source\.acceptancePassCount === 18/);
  assert.match(aggregate, /GLM-S07_AnswerKeyAndMaximumBoundaryStress/);
});
