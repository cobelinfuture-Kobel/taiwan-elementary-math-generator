import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const plan = JSON.parse(await readFile("data/curriculum/public-generation/PGC-R08-A04-A03.route-binding-exact-authority-probe-plan.json", "utf8"));
const focusedPlan = JSON.parse(await readFile(plan.sourceFocusedPlanPath, "utf8"));
const runner = await readFile("tools/curriculum/run-pgc-r08-a04-a03-route-binding-exact-authority-probe.mjs", "utf8");

test("A03 exact authority control uses the same four frozen canaries", () => {
  assert.equal(focusedPlan.canaries.length, 4);
  assert.deepEqual(focusedPlan.canaries.map((row) => row.routeIndex), [1, 570, 735, 784]);
  assert.equal(plan.acceptance.canaryCount, 4);
  assert.equal(plan.acceptance.terminalCanaryCount, 4);
});

test("A03 exact authority probe remains diagnostic-only", () => {
  assert.equal(plan.interactionPolicy.stopBeforeGeneration, true);
  assert.equal(plan.mutationBoundary.publicUiMutationAllowed, false);
  assert.equal(plan.mutationBoundary.capacityAuthorityMutationAllowed, false);
  assert.equal(plan.mutationBoundary.harnessRepairAllowed, false);
  assert.equal(plan.mutationBoundary.perRoutePatchAllowed, false);
  assert.equal(plan.mutationBoundary.browserClickProbeOnly, true);
});

test("A03 reads the exact capacity PatternGroup authority and tests target projection", () => {
  assert.match(runner, /publicPatternGroupIds/);
  assert.match(runner, /publicPatternGroupKey/);
  assert.match(runner, /DESELECT_EXTRA/);
  assert.match(runner, /SELECT_AUTHORITY_GROUP/);
  assert.match(runner, /EXACT_AUTHORITY_SET_BINDS_TARGET/);
  assert.match(runner, /EXACT_AUTHORITY_GROUP_NOT_SELECTABLE/);
  assert.match(runner, /EXACT_AUTHORITY_SET_NOT_PROJECTED/);
  assert.doesNotMatch(runner, /#regenerate-button/);
  assert.doesNotMatch(runner, /page\.click\([^\n]*generate/);
});
