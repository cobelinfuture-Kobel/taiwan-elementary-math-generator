import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  materializeGciS01WorkflowInventory
} from "../../tools/governance/materialize-gci-s01-workflow-inventory.mjs";

const WORKFLOW_FILE = ".github/workflows/pr-gate.yml";
const CONTRACT_FILE = ".github/ci/gci-s02/pr-gate-pilot-contract.json";

test("GCI-S02 historical PR gate pilot contract remains preserved", () => {
  const contract = JSON.parse(fs.readFileSync(CONTRACT_FILE, "utf8"));

  assert.equal(contract.taskId, "GCI-S02_SinglePrGateOrchestratorPilot");
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

test("GCI-S02 PR gate successor remains read-only and structurally complete", () => {
  const workflow = fs.readFileSync(WORKFLOW_FILE, "utf8");

  assert.match(workflow, /^name: PR Gate(?: Pilot)?$/m);
  assert.match(workflow, /^\s{2}contents: read$/m);
  assert.match(workflow, /group: pr-gate-\$\{\{ github\.event\.pull_request\.number \|\| github\.ref \}\}/);
  assert.match(workflow, /cancel-in-progress: true/);
  assert.match(workflow, /^\s{2}detect_changes:$/m);
  assert.match(workflow, /^\s{2}focused_governance:$/m);
  assert.match(workflow, /^\s{2}full_regression:$/m);
  assert.match(workflow, /^\s{2}aggregate:$/m);
  assert.match(workflow, /name: PR Gate \/ aggregate/);
  assert.equal((workflow.match(/(?:^|\s)npm\s+test(?:\s|$)/gm) ?? []).length, 1);
  assert.doesNotMatch(workflow, /\bgit\s+(?:commit|push|rebase)\b/);
  assert.match(workflow, /uses: actions\/upload-artifact@v4/);

  const current = materializeGciS01WorkflowInventory();
  const prGate = current.workflows.find((row) => row.file === WORKFLOW_FILE);
  assert.ok(prGate, "PR gate must be present in the live workflow inventory");
  assert.deepEqual(prGate.triggerClasses, ["PULL_REQUEST", "WORKFLOW_DISPATCH"]);
  assert.equal(prGate.contentsPermission, "read");
  assert.equal(prGate.writesPullRequestBranch, false);
  assert.equal(prGate.runsFullRegression, true);
  assert.equal(prGate.npmTestOccurrenceCount, 1);
  assert.equal(prGate.proposedDisposition, "PILOT_ORCHESTRATOR");
});
