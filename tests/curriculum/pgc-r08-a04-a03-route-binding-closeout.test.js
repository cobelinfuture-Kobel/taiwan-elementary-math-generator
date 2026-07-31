import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const readback = JSON.parse(await readFile("data/curriculum/public-generation/PGC-R08-A04-A03.route-binding-repair-readback.json", "utf8"));
const state = JSON.parse(await readFile("data/curriculum/public-generation/PGC-R08-A04.active-repair-state.json", "utf8"));
const overlay = JSON.parse(await readFile("data/curriculum/public-generation/PGC-R08-A04-A03.downstream-reclassification-overlay.json", "utf8"));

test("A03 closes all 136 route-binding failures", () => {
  assert.equal(readback.replay.targetRouteCount, 136);
  assert.equal(readback.replay.routeBindingResolvedCount, 136);
  assert.equal(readback.replay.routeBindingStillFailedCount, 0);
  assert.equal(readback.replay.fullNineGatePassCount, 127);
  assert.equal(readback.replay.downstreamFailCount, 9);
});

test("A03 reconciliation preserves the 793-route identity", () => {
  assert.equal(state.current.cumulativePassRouteCount, 772);
  assert.equal(state.current.unresolvedFailedRouteCount, 21);
  assert.equal(state.current.cumulativePassRouteCount + state.current.unresolvedFailedRouteCount, 793);
  assert.equal(state.reconciliation.nextRepairPosition, 3);
  assert.equal(state.reconciliation.nextTask, "PGC-R08-A04-A04_QuestionTypeStateSettlementFocusedReproductionAndRepair");
});

test("A03 downstream overlay contains six regenerate and three capacity shortfall routes", () => {
  assert.equal(overlay.regenerateIdentityTimeoutRows.length, 6);
  assert.equal(overlay.capacityProjectionShortfallRows.length, 3);
  assert.equal(state.reconciliation.capacityReconciliationRouteCount, 38);
  assert.equal(state.reconciliation.capacityReconciliationOverlapWithFailureCount, 3);
});
