import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const plan = JSON.parse(fs.readFileSync(
  "data/curriculum/public-generation/PGC-R09-A01R.325-route-fullfix-plan.json",
  "utf8",
));
const canonicalRunner = fs.readFileSync(
  "tools/curriculum/run-pgc-r08-a03-all-legal-routes.mjs",
  "utf8",
);
const convergedRunner = fs.readFileSync(
  "tools/curriculum/run-pgc-r09-a01r-converged-all-legal-routes.mjs",
  "utf8",
);

test("R09 A01R classifies the exact-head regression as stale canonical harness convergence", () => {
  assert.equal(plan.baseline.legalRouteCount, 793);
  assert.equal(plan.baseline.passRouteCount, 468);
  assert.equal(plan.baseline.failRouteCount, 325);
  assert.equal(
    plan.rootCause.classification,
    "CANONICAL_793_RUNNER_NOT_CONVERGED_ONTO_R08_A04_REPAIR_ADAPTERS",
  );
  assert.equal(plan.repairContract.publicUiMutationAllowed, false);
  assert.equal(plan.repairContract.capacityAuthorityMutationAllowed, false);
  assert.equal(plan.repairContract.generatorMutationAllowed, false);
  assert.equal(plan.repairContract.validatorMutationAllowed, false);
  assert.equal(plan.repairContract.rendererMutationAllowed, false);
  assert.equal(plan.repairContract.perRoutePatchAllowed, false);
  assert.equal(plan.repairContract.timeoutExtensionAllowed, false);
});

test("canonical 793-route entrypoint delegates to the converged repaired harness", () => {
  assert.match(canonicalRunner, /run-pgc-r09-a01r-converged-all-legal-routes\.mjs/);
  assert.match(convergedRunner, /enrichBrowserRowWithExactPatternGroups/);
  assert.match(convergedRunner, /wrapBrowserWithExactPatternGroupBinder/);
  assert.match(convergedRunner, /wrapBrowserWithDisabledCurrentValueSelectionPolicy/);
  assert.match(convergedRunner, /executeConvergedRoute/);
  assert.match(convergedRunner, /return executeRoute\(convergedBrowser\(/);
});

test("A01R acceptance remains the full 793-route nine-gate contract", () => {
  assert.deepEqual(plan.acceptance, {
    executedRouteCount: 793,
    terminalRouteCount: 793,
    passRouteCount: 793,
    failRouteCount: 0,
    fullNineGatePassCount: 793,
    browserConsoleErrorCount: 0,
    browserPageErrorCount: 0,
    fullRegressionRequired: true,
    r08TenRouteReplayRequired: true,
    r08ThreeRouteReplayRequired: true,
  });
  assert.equal(plan.nextTaskOnPass, "PGC-R09-A02_RealArtifactArchiveAndHashManifest");
});
