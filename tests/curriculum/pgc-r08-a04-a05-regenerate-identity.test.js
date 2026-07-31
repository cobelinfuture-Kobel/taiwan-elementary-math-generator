import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { applyRegenerateIdentitySeedOrder } from "../../site/modules/curriculum/batch-a/regenerate-identity-seed-order.js";

const plan = JSON.parse(await readFile(
  "data/curriculum/public-generation/PGC-R08-A04-A05.regenerate-identity-plan.json",
  "utf8",
));
const activeState = JSON.parse(await readFile(plan.activeStatePath, "utf8"));
const historicalQueue = JSON.parse(await readFile(plan.historicalQueuePath, "utf8"));
const routerSource = await readFile(
  "site/modules/curriculum/batch-a/batch-a-browser-question-router.js",
  "utf8",
);
const projectionSource = await readFile(
  "site/modules/curriculum/batch-a/regenerate-identity-seed-order.js",
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
  const columns = Object.fromEntries(
    historicalQueue.rowColumns.map((name, index) => [name, index]),
  );
  const historical = historicalQueue.rows.map((row) => row[columns.routeId]);
  const family = activeState.pendingFamilies.find(
    (entry) => entry.failureFamily === "REGENERATE_IDENTITY_TIMEOUT",
  );
  return [...historical, ...(family?.overlayRows ?? []).map((row) => row.routeId)];
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

test("A05 authority contains exactly ten regenerate routes from immutable queue plus overlays", () => {
  const routeIds = targetRouteIds();
  assert.equal(historicalQueue.failureFamily, "REGENERATE_IDENTITY_TIMEOUT");
  assert.equal(historicalQueue.rows.length, 2);
  assert.equal(routeIds.length, plan.targetRouteCount);
  assert.equal(new Set(routeIds).size, plan.targetRouteCount);
  assert.equal(plan.targetRouteCount, 10);
  assert.equal(plan.acceptance.fullNineGatePassCount, 10);
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

test("projection preserves PatternSpec slot positions while reordering within each slot", () => {
  const source = Array.from({ length: 12 }, (_, index) => ({
    id: `mixed-${index + 1}`,
    patternSpecId: index % 2 === 0 ? "ps_a" : "ps_b",
    promptText: `混合題 ${index + 1}`,
  }));
  const base = { ok: true, questions: source, allocation: [] };
  const projected = applyRegenerateIdentitySeedOrder(base, {
    generationSeed: "pgc-r08-slot-preservation-seed",
  });

  assert.deepEqual(
    projected.questions.map((question) => question.patternSpecId),
    source.map((question) => question.patternSpecId),
  );
  assert.deepEqual(new Set(projected.questions), new Set(source));
  assert.notDeepEqual(ids(projected), ids(base));
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

test("repair is shared, post-generation, timeout-free, and route-agnostic", () => {
  assert.match(routerSource, /applyPgcR04NumericUniqueAllocation/);
  assert.match(routerSource, /applyRegenerateIdentitySeedOrder\(result, options\)/);
  assert.match(projectionSource, /questionMembership/);
  assert.match(projectionSource, /seed\.startsWith\("pgc-r08-"\)/);
  assert.doesNotMatch(projectionSource, /pgc_r03_/);
  assert.doesNotMatch(projectionSource, /waitForTimeout|120000/);
  assert.match(runnerSource, /executeRoute/);
  assert.match(runnerSource, /fullNineGatePassCount/);
  assert.equal(plan.repairContract.timeoutExtensionAllowed, false);
  assert.equal(plan.repairContract.perRoutePatchAllowed, false);
  assert.equal(plan.repairContract.capacityAuthorityMutationAllowed, false);
  assert.equal(plan.repairContract.validatorMutationAllowed, false);
  assert.equal(plan.repairContract.rendererMutationAllowed, false);
  assert.deepEqual(plan.repairContract.productMutationScope, [
    "site/modules/curriculum/batch-a/regenerate-identity-seed-order.js",
    "site/modules/curriculum/batch-a/batch-a-browser-question-router.js",
  ]);
});

test("exact replay is consolidated into the single PGC-R00 scope-freeze job", () => {
  const jobHeaders = [...pgcR00WorkflowSource.matchAll(/^  ([a-z0-9-]+):\s*$/gm)]
    .map((match) => match[1]);

  assert.deepEqual(jobHeaders, ["scope-freeze"]);
  assert.match(pgcR00WorkflowSource, /- name: Exact ten-route browser replay/);
  assert.match(pgcR00WorkflowSource, /npm install --no-audit --no-fund/);
  assert.match(pgcR00WorkflowSource, /run-pgc-r08-a04-a05-regenerate-identity-replay\.mjs/);
  assert.doesNotMatch(pgcR00WorkflowSource, /^\s{2}exact-regenerate-identity-replay:/m);
  assert.doesNotMatch(pgcR00WorkflowSource, /cache:\s*npm|npm ci/);
});
