import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));

test("PGC-R08 A07 starts only after all 793 legal routes are closed", () => {
  const plan = readJson("data/curriculum/public-generation/PGC-R08-A04-A07.final-global-d0-closeout-plan.json");
  const state = readJson("data/curriculum/public-generation/PGC-R08-A04.active-repair-state.json");

  assert.equal(plan.programId, "PUBLIC_KP_GENERATION_CONFORMANCE_V1");
  assert.equal(plan.taskId, "PGC-R08-A04-A07_FinalGlobalReconciliationAndD0Closeout");
  assert.equal(plan.status, "PENDING_EXACT_793_ROUTE_REPLAY");
  assert.equal(plan.routeCount, 793);
  assert.equal(plan.questionCountPerRoute, 20);
  assert.equal(plan.requiredGates.length, 9);

  assert.equal(state.status, "PASS_ALL_793_LEGAL_ROUTES_CLOSED");
  assert.equal(state.current.cumulativePassRouteCount, 793);
  assert.equal(state.current.unresolvedFailedRouteCount, 0);
  assert.equal(state.current.closedOriginalFailureRouteCount, 327);
  assert.deepEqual(state.pendingFamilies, []);
  assert.equal(state.reconciliation.allLegalRoutesConformant, true);
  assert.equal(state.reconciliation.activeCapacityShortfallRouteCount, 0);
  assert.equal(state.reconciliation.nextTask, plan.taskId);

  assert.deepEqual(plan.boundary, {
    knowledgePointMutation: false,
    patternGroupMutation: false,
    patternSpecMutation: false,
    capacityAuthorityMutation: false,
    generatorMutation: false,
    validatorMutation: false,
    rendererMutation: false,
    uiControlMutation: false,
    secondPipeline: false,
  });
});
