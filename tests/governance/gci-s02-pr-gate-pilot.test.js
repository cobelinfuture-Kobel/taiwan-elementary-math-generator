import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const CONTRACT_FILE = ".github/ci/gci-s02/pr-gate-pilot-contract.json";

test("GCI-S02 pilot contract remains frozen as historical evidence after successor promotion", () => {
  const contract = JSON.parse(fs.readFileSync(CONTRACT_FILE, "utf8"));

  assert.equal(contract.schemaVersion, "1.0.0");
  assert.equal(contract.programId, "GLOBAL_GITHUB_CI_HANDSHAKE_STANDARD_V1");
  assert.equal(contract.taskId, "GCI-S02_SinglePrGateOrchestratorPilot");
  assert.equal(contract.workflowId, "pr-gate");
  assert.equal(contract.workflowFile, ".github/workflows/pr-gate.yml");
  assert.equal(contract.mode, "PILOT_GOVERNANCE_PATHS_ONLY");
  assert.equal(contract.permissions.contents, "read");
  assert.equal(contract.fullRegressionOccurrenceCount, 1);
  assert.equal(contract.writesPullRequestBranch, false);
  assert.equal(contract.legacyPullRequestWorkflowsModified, false);
  assert.equal(contract.branchProtectionModified, false);
  assert.equal(contract.aggregateCheckName, "PR Gate / aggregate");
  assert.equal(contract.legacyWorkflowRetirementStatus, "DEFERRED_TO_GCI_S03");
  assert.equal(contract.requiredCheckMigrationStatus, "DEFERRED_TO_GCI_S04");
});

test("GCI-S02 historical pilot does not override current UIV01 authority", () => {
  const workflow = fs.readFileSync(".github/workflows/pr-gate.yml", "utf8");
  assert.match(workflow, /^name: PR Gate$/m);
  assert.doesNotMatch(workflow, /^name: PR Gate Pilot$/m);
  assert.match(workflow, /classify-unit-validation-impact\.mjs/);
});
