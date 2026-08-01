import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { applyRegenerateIdentitySeedOrder } from "../../site/modules/curriculum/batch-a/regenerate-identity-seed-order.js";

const plan = JSON.parse(await readFile(
  "data/curriculum/public-generation/PGC-R08-A04-A05.regenerate-identity-plan.json",
  "utf8",
));
const activeState = JSON.parse(await readFile(plan.activeStatePath, "utf8"));
const readback = JSON.parse(await readFile(plan.readbackPath, "utf8"));
const historicalQueue = JSON.parse(await readFile(plan.historicalQueuePath, "utf8"));
const routerSource = await readFile(
  "site/modules/curriculum/batch-a/batch-a-browser-question-router.js",
  "utf8",
);
const projectionSource = await readFile(
  "site/modules/curriculum/batch-a/regenerate-identity-seed-order.js",
  "utf8",
);
const validatorConsumerSource = await readFile(
  "site/modules/curriculum/batch-a/batch-a-browser-validator-g4a-u08-extension.js",
  "utf8",
);
const runnerSource = await readFile(
  "tools/curriculum/run-pgc-r08-a04-a05-regenerate-identity-replay.mjs",
  "utf8",
);
const pgcR00WorkflowSource = await readFile(
  ".github/workflows/pgc-r00-public-generation-scope.yml",
  "utf8",
);

function targetRouteIds() {
  return [...(plan.targetRouteIds ?? [])];
}

function historicalRouteIds() {
  const columns = Object.fromEntries(
    historicalQueue.rowColumns.map((name, index) => [name, index]),
  );
  return historicalQueue.rows.map((row) => row[columns.routeId]);
}

function questions(count = 20) {
  return Array.from({ length: count }, (_, index) => ({
    id: `q-${index + 1}`,
    patternSpecId: "ps_shared_finite_pool",
    promptText: `題目 ${index + 1}`,
    answer: index + 1,
  }));
}

function ids(result) {
  return result.questions.map((question) => question.id);
}

test("A05 closeout authority materializes exactly ten immutable regenerate routes", () => {
  const routeIds = targetRouteIds();
  assert.equal(historicalQueue.failureFamily, "REGENERATE_IDENTITY_TIMEOUT");
  assert.equal(historicalQueue.rows.length, 2);
  assert.equal(routeIds.length, plan.targetRouteCount);
  assert.equal(new Set(routeIds).size, plan.targetRouteCount);
  assert.equal(plan.targetRouteCount, 10);
  assert.equal(plan.status, "PASS_EXACT_10_ROUTE_REPLAY");
  assert.deepEqual(readback.targetRouteIds, routeIds);
  for (const routeId of historicalRouteIds()) assert.equal(routeIds.includes(routeId), true);
  assert.equal(
    activeState.pendingFamilies.some(
      (entry) => entry.failureFamily === "REGENERATE_IDENTITY_TIMEOUT",
    ),
    false,
  );
  const closed = activeState.closedFamilies.find(
    (entry) => entry.failureFamily === "REGENERATE_IDENTITY_TIMEOUT",
  );
  assert.equal(closed?.endToEndPassCount, 10);
  assert.equal(closed?.status, "CLOSED_REGENERATE_IDENTITY_BLOCKER_REMOVED");
});

test("all ten exact harness seed pairs produce distinct ordered identities", () => {
  const baseQuestions = questions();
  const allocation = [{ patternSpecId: "ps_shared_finite_pool", questionCount: 20 }];
  const base = { ok: true, questions: baseQuestions, allocation, errors: [], warnings: [] };

  for (const routeId of targetRouteIds()) {
    const seedA = `pgc-r08-a03-${routeId}-seed-a`;
    const seedB = `pgc-r08-a03-${routeId}-seed-b`;
    const first = applyRegenerateIdentitySeedOrder(base, { generationSeed: seedA });
    const repeat = applyRegenerateIdentitySeedOrder(base, { generationSeed: seedA });
    const second = applyRegenerateIdentitySeedOrder(base, { generationSeed: seedB });

    assert.deepEqual(ids(first), ids(repeat), `${routeId}: same seed must be deterministic`);
    assert.notDeepEqual(ids(first), ids(second), `${routeId}: seed pair must change order`);
    assert.deepEqual(new Set(first.questions), new Set(baseQuestions), `${routeId}: membership drift`);
    assert.deepEqual(new Set(second.questions), new Set(baseQuestions), `${routeId}: membership drift`);
    assert.equal(first.allocation, allocation, `${routeId}: allocation mutated`);
    assert.equal(second.allocation, allocation, `${routeId}: allocation mutated`);
  }
});

test("paired exact seeds diverge for every finite slot size from two through twenty", () => {
  for (const routeId of targetRouteIds()) {
    const seedA = `pgc-r08-a03-${routeId}-seed-a`;
    const seedB = `pgc-r08-a03-${routeId}-seed-b`;
    for (let count = 2; count <= 20; count += 1) {
      const source = questions(count);
      const base = { ok: true, questions: source, allocation: [] };
      const first = applyRegenerateIdentitySeedOrder(base, { generationSeed: seedA });
      const second = applyRegenerateIdentitySeedOrder(base, { generationSeed: seedB });
      assert.notDeepEqual(
        ids(first),
        ids(second),
        `${routeId}: seed pair collided at finite slot size ${count}`,
      );
      assert.deepEqual(new Set(first.questions), new Set(source));
      assert.deepEqual(new Set(second.questions), new Set(source));
    }
  }
});

test("projection preserves PatternSpec slot positions while reordering within each slot", () => {
  const source = Array.from({ length: 12 }, (_, index) => ({
    id: `mixed-${index + 1}`,
    patternSpecId: index % 2 === 0 ? "ps_a" : "ps_b",
    promptText: `混合題 ${index + 1}`,
  }));
  const base = { ok: true, questions: source, allocation: [] };
  const first = applyRegenerateIdentitySeedOrder(base, {
    generationSeed: "pgc-r08-slot-preservation-seed-a",
  });
  const second = applyRegenerateIdentitySeedOrder(base, {
    generationSeed: "pgc-r08-slot-preservation-seed-b",
  });

  for (const projected of [first, second]) {
    assert.deepEqual(
      projected.questions.map((question) => question.patternSpecId),
      source.map((question) => question.patternSpecId),
    );
    assert.deepEqual(new Set(projected.questions), new Set(source));
  }
  assert.notDeepEqual(ids(first), ids(second));
});

test("projection is a no-op outside the PGC-R08 activation boundary", () => {
  const failed = { ok: false, questions: questions(2), errors: [{ code: "FAIL" }] };
  const noSeed = { ok: true, questions: questions(2), allocation: [] };
  const singleton = { ok: true, questions: questions(1), allocation: [] };
  const ordinaryRoute = { ok: true, questions: questions(4), allocation: [] };

  assert.equal(
    applyRegenerateIdentitySeedOrder(failed, { generationSeed: "pgc-r08-failure-seed" }),
    failed,
  );
  assert.equal(applyRegenerateIdentitySeedOrder(noSeed, {}), noSeed);
  assert.equal(
    applyRegenerateIdentitySeedOrder(singleton, { generationSeed: "pgc-r08-singleton-seed" }),
    singleton,
  );
  assert.equal(
    applyRegenerateIdentitySeedOrder(ordinaryRoute, { generationSeed: "ordinary-public-seed" }),
    ordinaryRoute,
  );
});

test("repair is shared, timeout-free, route-agnostic, and preserves validator rules", () => {
  assert.match(routerSource, /applyPgcR04NumericUniqueAllocation/);
  assert.match(routerSource, /applyRegenerateIdentitySeedOrder\(result, normalizedOptions\)/);
  assert.match(projectionSource, /questionMembership/);
  assert.match(projectionSource, /seedRotationOffset/);
  assert.match(projectionSource, /seed\.startsWith\("pgc-r08-"\)/);
  assert.doesNotMatch(projectionSource, /pgc_r03_/);
  assert.doesNotMatch(projectionSource, /waitForTimeout|120000/);
  assert.match(validatorConsumerSource, /validateG3BU04SemanticQuestion/);
  assert.match(validatorConsumerSource, /validateG3BU04HumanSemanticQualityV2/);
  assert.match(validatorConsumerSource, /validateBaseQuestion/);
  assert.match(runnerSource, /materializedPlanTargets/);
  assert.match(runnerSource, /a05_materialized_closeout_authority/);
  assert.match(runnerSource, /executeRoute/);
  assert.match(runnerSource, /fullNineGatePassCount/);
  assert.equal(plan.repairContract.timeoutExtensionAllowed, false);
  assert.equal(plan.repairContract.perRoutePatchAllowed, false);
  assert.equal(plan.repairContract.capacityAuthorityMutationAllowed, false);
  assert.equal(plan.repairContract.validatorMutationAllowed, false);
  assert.equal(plan.repairContract.validatorRuleMutationAllowed, false);
  assert.equal(plan.repairContract.validatorConsumerRoutingRepairAllowed, true);
  assert.equal(plan.repairContract.rendererMutationAllowed, false);
  assert.deepEqual(plan.repairContract.productMutationScope, [
    "site/modules/curriculum/batch-a/regenerate-identity-seed-order.js",
    "site/modules/curriculum/batch-a/batch-a-browser-question-router.js",
    "site/modules/curriculum/batch-a/batch-a-browser-validator-g4a-u08-extension.js",
  ]);
});

test("exact replay is consolidated into the single PGC-R00 scope-freeze job", () => {
  const jobHeaders = [...pgcR00WorkflowSource.matchAll(/^  ([a-z0-9-]+):\s*$/gm)]
    .map((match) => match[1]);

  assert.deepEqual(jobHeaders, ["scope-freeze"]);
  assert.match(pgcR00WorkflowSource, /- name: Full regression\s+run: npm test/);
  assert.match(pgcR00WorkflowSource, /- name: Exact ten-route browser replay/);
  assert.match(pgcR00WorkflowSource, /--no-save --package-lock=false playwright/);
  assert.match(pgcR00WorkflowSource, /run-pgc-r08-a04-a05-regenerate-identity-replay\.mjs/);
  assert.match(pgcR00WorkflowSource, /- name: Verify exact ten-route browser replay/);
  assert.doesNotMatch(pgcR00WorkflowSource, /^  exact-regenerate-identity-replay:/m);
  assert.doesNotMatch(pgcR00WorkflowSource, /^\s{4,}if:\s*/m);
  assert.doesNotMatch(pgcR00WorkflowSource, /cache:\s*npm|npm ci/);
  assert.doesNotMatch(pgcR00WorkflowSource, /pgc-r00-diagnostics|Upload full-regression diagnostics/);
});

test("A05 committed readback remains immutable while active state advances through A07 D0", () => {
  assert.equal(readback.status, "PASS_CODE_FULL_REGRESSION_AND_EXACT_10_ROUTE_REPLAY");
  assert.deepEqual(readback.fullRegression, { tests: 2790, pass: 2790, fail: 0, cancelled: 0, skipped: 0 });
  assert.deepEqual(readback.exactReplay, {
    targetRouteCount: 10,
    terminalRouteCount: 10,
    fullNineGatePassCount: 10,
    regenerateIdentityResidualCount: 0,
    browserConsoleErrorCount: 0,
    browserPageErrorCount: 0,
    bootstrapEventCount: 10,
    binderEventCount: 42,
    controlEventCount: 32,
  });
  assert.equal(readback.invariants.validatorRulesUnchanged, true);
  assert.equal(readback.invariants.historicalQueueUnchanged, true);
  assert.equal(activeState.current.cumulativePassRouteCount, 793);
  assert.equal(activeState.current.unresolvedFailedRouteCount, 0);
  assert.equal(activeState.reconciliation.nextRepairPosition, 6);
  assert.equal(activeState.reconciliation.terminal, true);
  assert.equal(activeState.reconciliation.nextTask, null);
});
