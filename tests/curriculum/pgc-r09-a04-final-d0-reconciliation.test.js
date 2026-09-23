import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

const a00 = readJson("data/curriculum/public-generation/PGC-R09-A00.d0-closeout-preflight.json");
const a01r = readJson("data/curriculum/public-generation/PGC-R09-A01R.325-route-fullfix-plan.json");
const a02 = readJson("data/curriculum/public-generation/PGC-R09-A02.real-artifact-hash-manifest.json");
const a04 = readJson("data/curriculum/public-generation/PGC-R09-A04.final-d0-reconciliation.json");

test("R09 A04 is the terminal milestone frozen by A00", () => {
  assert.equal(a00.orderedMilestones.length, 5);
  assert.equal(a00.orderedMilestones.at(-1), "PGC-R09-A04_FinalD0ReconciliationMergeAndSlice014Unfreeze");
  assert.equal(a04.taskId, a00.orderedMilestones.at(-1));
  assert.equal(a00.canonicalAcceptanceMatrix.length, 20);
  assert.equal(a04.canonicalGateReconciliation.length, 20);
});

test("R09 A04 reconciles accepted A01R, A02 and deployed A03 evidence", () => {
  assert.equal(a01r.acceptance.executedRouteCount, 793);
  assert.equal(a01r.acceptance.terminalRouteCount, 793);
  assert.equal(a01r.acceptance.passRouteCount, 793);
  assert.equal(a01r.acceptance.failRouteCount, 0);

  assert.equal(a02.status, "PASS_ARTIFACT_MANIFEST_MATERIALIZED");
  assert.equal(a02.terminalExecution.passRouteCount, 793);
  assert.equal(a02.terminalExecution.failRouteCount, 0);
  assert.equal(a04.a02ArtifactArchive.primaryArtifactId, a02.sourceExecution.primaryArtifactId);
  assert.equal(a04.a02ArtifactArchive.htmlHashSampleCount, 16);
  assert.equal(a04.a02ArtifactArchive.pdfHashSampleCount, 16);

  assert.equal(a04.a03ReleaseCandidateAcceptance.status, "PASS_DEPLOYED_PUBLIC_SITE_SMOKE");
  assert.equal(a04.a03ReleaseCandidateAcceptance.pullRequest, 506);
  assert.equal(a04.a03ReleaseCandidateAcceptance.acceptedHeadSha, "397b66cf110cd5f783aecaa173ab5d6844e9c14b");
  assert.equal(a04.a03ReleaseCandidateAcceptance.mergeSha, "477eca2c61875390ffd4749f5c467792805956bc");
  assert.ok(a04.a03ReleaseCandidateAcceptance.relevantWorkflowRuns.length >= 4);
  assert.ok(a04.a03ReleaseCandidateAcceptance.relevantWorkflowRuns.every((row) => row.conclusion === "success"));
});

test("R09 A04 deployed Pages smoke is real and error free", () => {
  const smoke = a04.a03ReleaseCandidateAcceptance.deployedSmoke;
  assert.equal(smoke.publicRoutesChecked, 2);
  assert.equal(smoke.reachableUnsafeContextCount, 0);
  assert.equal(smoke.redirectErrorCount, 0);
  assert.equal(smoke.routeMismatchCount, 0);
  assert.equal(smoke.browserConsoleErrorCount, 0);
  assert.equal(smoke.browserPageErrorCount, 0);
  assert.equal(smoke.printLayoutContractErrorCount, 0);
  assert.equal(smoke.artifactId, 8821188559);
  assert.equal(smoke.artifactDigest, "sha256:9e463af75a9b1ba1f41626bb5e935a0609b348b00403aa2770dbec75a708e0fe");
});

test("R09 A04 preserves all canonical D0 gates and self-closes only through green CI plus merge", () => {
  const expectedGateIds = a00.canonicalAcceptanceMatrix.map((row) => row.gateId);
  const actualGateIds = a04.canonicalGateReconciliation.map((row) => row.gateId);
  assert.deepEqual(actualGateIds, expectedGateIds);

  const ordinaryGates = a04.canonicalGateReconciliation.slice(0, 17);
  assert.ok(ordinaryGates.every((row) => row.status === "PASS"));
  assert.equal(a04.canonicalGateReconciliation[17].gateId, "CI_ALL_GREEN");
  assert.match(a04.canonicalGateReconciliation[17].status, /A04_SELF_GATE_REQUIRED/);
  assert.equal(a04.canonicalGateReconciliation[18].status, "SELF_CLOSING_ON_A04_MERGE");
  assert.equal(a04.canonicalGateReconciliation[19].status, "SELF_CLOSING_ON_A04_MERGE");
  assert.equal(a04.selfClosingA04Gate.requiredCiMustBeGreen, true);
  assert.equal(a04.selfClosingA04Gate.mergeToMainRequired, true);
  assert.equal(a04.selfClosingA04Gate.d0EffectiveOnlyAfterAllConditions, true);
});

test("R09 A04 unfreezes Slice014 without implementing or widening product scope", () => {
  assert.equal(a04.slice014.stateBeforeA04, "FROZEN_THROUGH_R09");
  assert.equal(a04.slice014.unfreezeDecision, "AUTHORIZED");
  assert.equal(a04.slice014.stateAfterEffectiveA04, "UNFROZEN");
  assert.equal(a04.slice014.implementationPerformedByA04, false);
  assert.equal(a04.slice014.nextTask, "P03F_W3DirectProductVerticalSlice014Implementation");

  for (const value of Object.values(a04.frozenBoundaryCompliance)) {
    assert.equal(value, false);
  }

  assert.equal(a04.goalDistance.afterWhenEffectiveOnMain, "D0_PUBLIC_KP_GENERATION_CONFORMANCE_V1_R09_CLOSED");
  assert.deepEqual(a04.goalDistance.remainingBlockersWhenEffectiveOnMain, []);
});
