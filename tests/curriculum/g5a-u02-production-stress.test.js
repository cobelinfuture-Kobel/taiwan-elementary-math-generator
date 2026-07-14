import test from "node:test";
import assert from "node:assert/strict";

import {
  G5A_U02_PRODUCTION_LIFECYCLE,
  G5A_U02_PRODUCTION_STRESS_MATRIX,
  buildG5AU02ProductionStressScenarios,
  runG5AU02ProductionStressAudit,
} from "../../src/curriculum/g5a-u02/production-stress.js";

test("S95 production stress matrix covers release boundaries", () => {
  assert.deepEqual(G5A_U02_PRODUCTION_STRESS_MATRIX.questionCounts, [1, 22, 44, 100, 200]);
  assert.equal(G5A_U02_PRODUCTION_STRESS_MATRIX.seeds.length, 10);
  assert.deepEqual(G5A_U02_PRODUCTION_STRESS_MATRIX.answerKeyModes, [true, false]);
  assert.equal(buildG5AU02ProductionStressScenarios().length, 100);
});

test("S95 lifecycle promotes only canonical static public release", () => {
  assert.equal(G5A_U02_PRODUCTION_LIFECYCLE.productionUse, "allowed_canonical_static_release");
  assert.equal(G5A_U02_PRODUCTION_LIFECYCLE.selectorStatus, "public_source_unit");
  assert.equal(G5A_U02_PRODUCTION_LIFECYCLE.arbitraryBrowserRegeneration, false);
  assert.equal(G5A_U02_PRODUCTION_LIFECYCLE.genericFallback, false);
  assert.equal(G5A_U02_PRODUCTION_LIFECYCLE.freeFormAI, false);
});

test("S95 focused audit proves exact counts, determinism, variation and answer suppression", () => {
  const audit = runG5AU02ProductionStressAudit({
    questionCounts: [1, 22],
    seeds: [95, 195],
    answerKeyModes: [true, false],
    expectedPatternSpecCount: 22,
    expectedAnswerModelShapeCount: 16,
    maxQuestionCount: 200,
  });
  assert.equal(audit.ok, true, audit.errors.join("\n"));
  assert.equal(audit.scenarioCount, 8);
  assert.equal(audit.deterministicReplayCount, 8);
  assert.equal(audit.patternSpecCount, 22);
  assert.equal(audit.answerModelShapeCount, 16);
  assert.ok(audit.totalQuestions > 0);
  assert.ok(audit.totalAnswers > 0);
  assert.ok(audit.maxHtmlBytes > 0);
});
