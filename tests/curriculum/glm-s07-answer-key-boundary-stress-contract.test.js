import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import {
  GLM_S07_ANSWER_STATES,
  GLM_S07_BOUNDARY_LAYOUT_IDS,
  GLM_S07_QUESTION_COUNT,
  GLM_S07_SHARD_COUNT,
  buildGLMS07ScenarioPlan,
  readGLMS07Contract,
  scenariosForGLMS07Shard,
} from "../../tools/curriculum/glm-s07-scenario-plan.mjs";

test("GLM-S06 accepted authority is closed before S07 starts", () => {
  const passPath = "docs/curriculum/output/GLM_S06_270_POSTFIX_HTML_PDF_ACCEPTANCE_PASS.marker";
  const pendingPath = "docs/curriculum/output/GLM_S06_270_POSTFIX_HTML_PDF_ACCEPTANCE_PENDING.marker";
  assert.equal(existsSync(passPath), true);
  assert.equal(existsSync(pendingPath), false);
  const marker = readFileSync(passPath, "utf8");
  assert.match(marker, /STATUS=PASS_ACCEPTED_AND_MERGED/);
  assert.match(marker, /SCENARIO_COUNT=270/);
  assert.match(marker, /ACCEPTANCE_PASS_COUNT=270/);
  assert.match(marker, /GLOBAL_STATUS=ALL_270_POSTFIX_HTML_PDF_PASS/);
});

test("GLM-S07 plan is exactly 15 units by 3 boundary layouts by 2 answer states", () => {
  const contract = readGLMS07Contract();
  const plan = buildGLMS07ScenarioPlan();
  assert.equal(contract.scope.publicUnitCount, 15);
  assert.equal(contract.scope.answerKeyBoundaryScenarioCount, 90);
  assert.equal(GLM_S07_QUESTION_COUNT, 18);
  assert.equal(GLM_S07_SHARD_COUNT, 5);
  assert.deepEqual(GLM_S07_BOUNDARY_LAYOUT_IDS, ["3x5", "2x6", "1x7"]);
  assert.deepEqual(
    GLM_S07_ANSWER_STATES.map((state) => state.answerStateId),
    ["answer-off", "answer-on"],
  );
  assert.equal(plan.length, 90);
  assert.equal(new Set(plan.map((scenario) => scenario.scenarioId)).size, 90);
  assert.deepEqual(
    Array.from({ length: GLM_S07_SHARD_COUNT }, (_, index) => scenariosForGLMS07Shard(index).length),
    [18, 18, 18, 18, 18],
  );
  for (const unit of contract.publicUnits) {
    const rows = plan.filter((scenario) => scenario.sourceId === unit.sourceId);
    assert.equal(rows.length, 6, unit.sourceId);
    assert.deepEqual(new Set(rows.map((scenario) => scenario.layoutId)), new Set(GLM_S07_BOUNDARY_LAYOUT_IDS));
    assert.deepEqual(
      new Set(rows.map((scenario) => scenario.answerStateId)),
      new Set(["answer-off", "answer-on"]),
    );
  }
  for (const layoutId of GLM_S07_BOUNDARY_LAYOUT_IDS) {
    assert.equal(plan.filter((scenario) => scenario.layoutId === layoutId).length, 30, layoutId);
  }
  for (const state of GLM_S07_ANSWER_STATES) {
    assert.equal(plan.filter((scenario) => scenario.answerStateId === state.answerStateId).length, 45);
  }
});

test("GLM-S07 runner validates independent answer layout, alignment and rendered boundaries", () => {
  const runner = readFileSync("tools/curriculum/run-glm-s07-answer-key-boundary-shard.mjs", "utf8");
  assert.match(runner, /setBatchAIncludeAnswerKey\(state, scenario\.includeAnswerKey\)/);
  assert.match(runner, /resolvedAnswerLayout/);
  assert.match(runner, /answerKeyPrintLayout/);
  assert.match(runner, /QUESTION_ANSWER_ID_ALIGNMENT_MISMATCH/);
  assert.match(runner, /ANSWER_NUMBER_SEQUENCE_MISMATCH/);
  assert.match(runner, /ANSWER_KEY_OFF_LEAK/);
  assert.match(runner, /ANSWER_ITEM_COUNT_MISMATCH/);
  assert.match(runner, /ANSWER_CARD_COUNT_MISMATCH/);
  assert.match(runner, /ANSWER_PAGE_MISSING/);
  assert.match(runner, /ANSWER_TEXT_MISSING/);
  assert.match(runner, /PDF_PAGE_COUNT_MISMATCH/);
  assert.match(runner, /PDF_BOUNDING_BOX_OVERFLOW/);
  assert.match(runner, /inspect-glm-s06-pdfs\.py/);
  assert.doesNotMatch(runner, /S93_G5A_U02_HiddenWorksheet\.html/);
});

test("GLM-S07 aggregate authority requires every one of the 90 scenarios", () => {
  const aggregate = readFileSync("tools/curriculum/aggregate-glm-s07-answer-key-boundary.mjs", "utf8");
  assert.match(aggregate, /ALL_90_ANSWER_KEY_BOUNDARY_HTML_PDF_PASS/);
  assert.match(aggregate, /PASS_ACCEPTED/);
  assert.match(aggregate, /acceptancePassCount === expectedScenarioCount/);
  assert.match(aggregate, /questionItemCount === expectedQuestionItemCount/);
  assert.match(aggregate, /answerItemCount === expectedAnswerItemCount/);
  assert.match(aggregate, /summary\.acceptancePassCount === 6/);
  assert.match(aggregate, /summary\.acceptancePassCount === 30/);
  assert.match(aggregate, /summary\.acceptancePassCount === 45/);
  assert.match(aggregate, /GLM-S08_DeployedClassicUIAndD0Closeout/);
});
