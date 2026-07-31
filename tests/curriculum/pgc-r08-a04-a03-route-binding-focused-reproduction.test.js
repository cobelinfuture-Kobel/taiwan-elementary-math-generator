import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const plan = JSON.parse(await readFile("data/curriculum/public-generation/PGC-R08-A04-A03.route-binding-focused-reproduction-plan.json", "utf8"));
const activeState = JSON.parse(await readFile(plan.activeRepairStatePath, "utf8"));
const queue = JSON.parse(await readFile(plan.queuePath, "utf8"));
const runner = await readFile("tools/curriculum/run-pgc-r08-a04-a03-route-binding-focused-reproduction.mjs", "utf8");
const workflow = await readFile(".github/workflows/pgc-r08-a04-a03-route-binding-focused-reproduction.yml", "utf8");

test("A03 targets the frozen 136-route binding family with four exact canaries", () => {
  assert.equal(activeState.reconciliation.nextRepairPosition, 2);
  assert.equal(queue.failureFamily, "ROUTE_BINDING_NOT_CONVERGED");
  assert.equal(queue.rows.length, 136);
  assert.equal(plan.canaries.length, 4);
  assert.deepEqual(plan.canaries.map((row) => row.routeIndex), [1, 570, 735, 784]);
  assert.ok(plan.canaries.every((canary) => queue.rows.some((row) => row[0] === canary.routeIndex && row[1] === canary.routeId)));
});

test("A03 is diagnostic-only and preserves product authority", () => {
  assert.equal(plan.diagnosticPolicy.mode, "REPRODUCTION_ONLY");
  assert.equal(plan.diagnosticPolicy.publicUiMutationAllowed, false);
  assert.equal(plan.diagnosticPolicy.capacityAuthorityMutationAllowed, false);
  assert.equal(plan.diagnosticPolicy.perRoutePatchAllowed, false);
});

test("A03 captures exact public binding state and uses the admitted disabled-control policy", () => {
  assert.match(runner, /installDisabledCurrentValueSelectionPolicy/);
  assert.match(runner, /captureSnapshot/);
  assert.match(runner, /patternGroups/);
  assert.match(runner, /capacityRouteIds/);
  assert.match(runner, /GREEDY_PATTERN_GROUP_OVERSHOOT/);
  assert.match(runner, /TARGET_ROUTE_NOT_PROJECTED_BY_PUBLIC_BINDING/);
});

test("A03 temporary workflow is read-only and uploads browser evidence", () => {
  assert.match(workflow, /permissions:\s*\n\s*contents: read/);
  assert.match(workflow, /playwright install --with-deps chromium/);
  assert.match(workflow, /upload-artifact@v4/);
  assert.match(workflow, /pgc-r08-a04-a03-route-binding-focused-reproduction/);
});
