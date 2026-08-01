import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import {
  DISABLED_CONTROL_POLICY_CODES,
  installDisabledCurrentValueSelectionPolicy,
} from "../../tools/curriculum/pgc-r08-browser-control-selection-policy.mjs";

const plan = JSON.parse(await readFile("data/curriculum/public-generation/PGC-R08-A04-A02.disabled-control-harness-family-replay-plan.json", "utf8"));
const readback = JSON.parse(await readFile(plan.finalReadbackPath, "utf8"));
const activeState = JSON.parse(await readFile(plan.activeRepairStatePath, "utf8"));
const runner = await readFile("tools/curriculum/run-pgc-r08-a04-a02-disabled-control-family-replay.mjs", "utf8");
const temporaryWorkflowPath = ".github/workflows/pgc-r08-a04-a02-disabled-control-family-replay.yml";

function mockPage({ disabled, initialValue }) {
  let value = initialValue;
  let mutationCount = 0;
  const page = {
    selectOption: async (_selector, requested) => {
      mutationCount += 1;
      value = requested;
      return [requested];
    },
    locator: () => ({ isDisabled: async () => disabled, inputValue: async () => value }),
  };
  return { page, getValue: () => value, getMutationCount: () => mutationCount };
}

test("enabled control uses normal selection", async () => {
  const dispositions = [];
  const mock = mockPage({ disabled: false, initialValue: "numeric" });
  installDisabledCurrentValueSelectionPolicy(mock.page, { onDisposition: (event) => dispositions.push(event) });
  await mock.page.selectOption("#type", "application");
  assert.equal(mock.getValue(), "application");
  assert.equal(mock.getMutationCount(), 1);
  assert.equal(dispositions[0].disposition, DISABLED_CONTROL_POLICY_CODES.ENABLED_SELECTION);
});

test("disabled matching authority passes without mutation and mismatches fail closed", async () => {
  const matching = mockPage({ disabled: true, initialValue: "numeric" });
  installDisabledCurrentValueSelectionPolicy(matching.page);
  assert.deepEqual(await matching.page.selectOption("#type", "numeric"), ["numeric"]);
  assert.equal(matching.getMutationCount(), 0);

  const mismatch = mockPage({ disabled: true, initialValue: "numeric" });
  installDisabledCurrentValueSelectionPolicy(mismatch.page);
  await assert.rejects(mismatch.page.selectOption("#type", "application"), (error) => error?.message === "PGC_R08_BROWSER_DISABLED_CONTROL_VALUE_MISMATCH");
  assert.equal(mismatch.getMutationCount(), 0);
});

test("A02 exact browser replay closes both disabled-control families", () => {
  assert.equal(plan.status, "PASS_DISABLED_CONTROL_FAMILIES_CLOSED_WITH_ORTHOGONAL_REGENERATE_TRANSFER");
  assert.equal(readback.sourceEvidence.headSha, "7406a163e39e290a26299868b4c83f91f2192ffc");
  assert.equal(readback.sourceEvidence.workflowRunId, 30603122800);
  assert.equal(readback.sourceEvidence.artifactId, 8782694763);
  assert.equal(readback.replaySummary.terminalRouteCount, 180);
  assert.equal(readback.replaySummary.disabledControlAuthorityConformanceCount, 180);
  assert.equal(readback.replaySummary.disabledValueMismatchDispositionCount, 0);
  assert.equal(readback.replaySummary.endToEndPassRouteCount, 179);
  assert.equal(readback.familyCloseout.length, 2);
  assert.ok(readback.familyCloseout.every((family) => family.status.startsWith("CLOSED")));
});

test("the A02 orthogonal route remains historically transferred and is closed by A05 without a per-route patch", () => {
  assert.equal(readback.transferredRoutes.length, 1);
  const transferred = readback.transferredRoutes[0];
  assert.equal(transferred.routeIndex, 297);
  assert.equal(transferred.toFailureFamily, "REGENERATE_IDENTITY_TIMEOUT");
  assert.equal(transferred.passedGateCodes.length, 8);
  assert.equal(transferred.remainingGateCode, "REGENERATE_PASS");
  assert.equal(transferred.perRoutePatchAuthorized, false);

  const closedRegenerate = activeState.closedFamilies.find(
    (family) => family.failureFamily === "REGENERATE_IDENTITY_TIMEOUT",
  );
  assert.ok(closedRegenerate);
  assert.equal(closedRegenerate.originalRouteCount, 2);
  assert.equal(closedRegenerate.overlayRouteCount, 8);
  assert.equal(closedRegenerate.endToEndPassCount, 10);
  assert.equal(
    closedRegenerate.status,
    "CLOSED_REGENERATE_IDENTITY_BLOCKER_REMOVED",
  );
  assert.equal(
    activeState.pendingFamilies.some(
      (family) => family.failureFamily === "REGENERATE_IDENTITY_TIMEOUT",
    ),
    false,
  );
});

test("A02 historical readback remains immutable while active state advances through A06", () => {
  assert.equal(readback.replaySummary.endToEndPassRouteCount, 179);
  assert.equal(readback.transferredRoutes.length, 1);
  assert.equal(activeState.status, "PASS_ALL_793_LEGAL_ROUTES_CLOSED");
  assert.equal(activeState.current.cumulativePassRouteCount, 793);
  assert.equal(activeState.current.unresolvedFailedRouteCount, 0);
  assert.equal(activeState.current.closedOriginalFailureRouteCount, 327);
  assert.equal(activeState.pendingFamilies.length, 0);
  assert.equal(activeState.reconciliation.activeCapacityShortfallRouteCount, 0);
  assert.equal(activeState.reconciliation.pendingFailedRouteCount, 0);
  assert.equal(activeState.reconciliation.nextRepairPosition, 6);
  assert.equal(activeState.reconciliation.nextTask, "PGC-R08-A04-A07_FinalGlobalReconciliationAndD0Closeout");
});

test("A02 runner creates shared output directories and temporary workflow is removed", async () => {
  assert.match(runner, /mkdir\(CORE_SAMPLE, \{ recursive: true \}\)/);
  assert.match(runner, /mkdir\(CORE_FAILURE, \{ recursive: true \}\)/);
  await assert.rejects(access(temporaryWorkflowPath), (error) => error?.code === "ENOENT");
  assert.equal(readback.decisions.temporaryWorkflowRemovedBeforeMerge, true);
});
