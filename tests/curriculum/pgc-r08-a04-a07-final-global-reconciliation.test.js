import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const reconciliation = JSON.parse(await readFile(
  "data/curriculum/public-generation/PGC-R08-A04-A07.final-global-reconciliation.json",
  "utf8",
));
const activeState = JSON.parse(await readFile(
  reconciliation.authority.activeStatePath,
  "utf8",
));
const a05 = JSON.parse(await readFile(
  reconciliation.authority.a05ReadbackPath,
  "utf8",
));
const a06 = JSON.parse(await readFile(
  reconciliation.authority.a06ReadbackPath,
  "utf8",
));

test("A07 reconciles the complete 793-route authority", () => {
  assert.equal(reconciliation.status, "PASS_ALL_793_LEGAL_ROUTES_RECONCILED");
  assert.deepEqual(reconciliation.routeReconciliation, {
    legalRouteCount: 793,
    initialPassRouteCount: 466,
    initialFailedRouteCount: 327,
    finalPassRouteCount: 793,
    finalFailedRouteCount: 0,
    closedOriginalFailureRouteCount: 327,
    reclassifiedUnresolvedRouteCount: 0,
    allLegalRoutesConformant: true,
  });
  assert.equal(activeState.current.cumulativePassRouteCount, 793);
  assert.equal(activeState.current.unresolvedFailedRouteCount, 0);
  assert.equal(activeState.current.closedOriginalFailureRouteCount, 327);
  assert.equal(activeState.pendingFamilies.length, 0);
});

test("A07 reconciles all failure families without reopening historical queues", () => {
  assert.equal(reconciliation.failureFamilyReconciliation.closedFamilyCount, 6);
  assert.equal(reconciliation.failureFamilyReconciliation.pendingFamilyCount, 0);
  assert.equal(reconciliation.failureFamilyReconciliation.families.length, 6);
  assert.equal(activeState.historicalAuthority.immutable, true);
  assert.equal(activeState.reconciliation.pendingFailedRouteCount, 0);
  assert.equal(activeState.reconciliation.activeCapacityShortfallRouteCount, 0);
  assert.equal(activeState.reconciliation.allLegalRoutesConformant, true);
});

test("A07 preserves A05 and A06 exact browser replay evidence", () => {
  assert.equal(a05.exactReplay.targetRouteCount, 10);
  assert.equal(a05.exactReplay.fullNineGatePassCount, 10);
  assert.equal(a05.exactReplay.regenerateIdentityResidualCount, 0);
  assert.equal(a06.exactReplay.targetRouteCount, 3);
  assert.equal(a06.exactReplay.fullNineGatePassCount, 3);
  assert.equal(a06.exactReplay.failedRouteCount, 0);
  assert.equal(a06.exactReplay.questionCountPassCount, 3);
  assert.equal(a06.exactReplay.generateButtonPassCount, 3);
  assert.equal(a06.exactReplay.browserConsoleErrorCount, 0);
  assert.equal(a06.exactReplay.browserPageErrorCount, 0);
  assert.deepEqual(a06.fullRegression, reconciliation.terminalEvidence.fullRegression);
});

test("A07 D0 closeout is reconciliation-only and terminal", () => {
  assert.equal(reconciliation.d0Gate.status, "PASS_R08_D0");
  assert.equal(reconciliation.d0Gate.allLegalRoutesClosed, true);
  assert.equal(reconciliation.d0Gate.allFailureFamiliesClosed, true);
  assert.equal(reconciliation.d0Gate.pendingRepairCount, 0);
  assert.equal(reconciliation.d0Gate.productionRouteAuthorityConsistent, true);
  assert.equal(reconciliation.invariants.capacityAuthorityMutatedByA07, false);
  assert.equal(reconciliation.invariants.generatorRuntimeMutatedByA07, false);
  assert.equal(reconciliation.invariants.validatorMutatedByA07, false);
  assert.equal(reconciliation.invariants.rendererMutatedByA07, false);
  assert.equal(reconciliation.invariants.routeSpecificPatchAddedByA07, false);
  assert.equal(activeState.reconciliation.terminal, true);
  assert.equal(activeState.reconciliation.terminalStatus, "PASS_R08_D0_ALL_793_LEGAL_ROUTES_CLOSED");
  assert.equal(activeState.reconciliation.d0Status, "PASS_R08_D0");
  assert.equal(activeState.reconciliation.nextTask, null);
  assert.equal(reconciliation.terminal, true);
  assert.equal(reconciliation.nextTask, null);
});
