import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  materializeGciS01WorkflowInventory
} from "../../tools/governance/materialize-gci-s01-workflow-inventory.mjs";

const PR_GATE = ".github/workflows/pr-gate.yml";
const NODE_BRIDGE = ".github/workflows/node-test.yml";
const NODE_POST_MERGE = ".github/workflows/node-test-post-merge.yml";

test("GCI-S03A transfers pull-request full-regression authority to PR Gate", () => {
  const prGate = fs.readFileSync(PR_GATE, "utf8");
  const nodeBridge = fs.readFileSync(NODE_BRIDGE, "utf8");
  const nodePostMerge = fs.readFileSync(NODE_POST_MERGE, "utf8");
  const contract = JSON.parse(fs.readFileSync(
    ".github/ci/gci-s03a/primary-regression-authority-transfer.json",
    "utf8"
  ));

  assert.match(prGate, /^name: PR Gate$/m);
  assert.match(prGate, /^\s{2}pull_request:$/m);
  assert.doesNotMatch(prGate, /^\s{4}paths:$/m);
  assert.match(prGate, /^\s{2}contents: read$/m);
  assert.equal((prGate.match(/(?:^|\s)npm\s+test(?:\s|$)/gm) ?? []).length, 1);
  assert.doesNotMatch(prGate, /\bgit\s+(?:commit|push|rebase)\b/);
  assert.match(prGate, /name: PR Gate \/ aggregate/);

  assert.match(nodeBridge, /^name: Node Test$/m);
  assert.match(nodeBridge, /^\s{2}pull_request:$/m);
  assert.doesNotMatch(nodeBridge, /^\s{2}push:$/m);
  assert.doesNotMatch(nodeBridge, /(?:^|\s)npm\s+test(?:\s|$)/m);
  assert.doesNotMatch(nodeBridge, /npm\s+(?:install|ci)/);
  assert.doesNotMatch(nodeBridge, /\bgit\s+(?:commit|push|rebase)\b/);

  assert.match(nodePostMerge, /^name: Node Test Post-Merge$/m);
  assert.match(nodePostMerge, /^\s{2}push:$/m);
  assert.doesNotMatch(nodePostMerge, /^\s{2}pull_request:$/m);
  assert.match(nodePostMerge, /^\s{2}contents: read$/m);
  assert.equal((nodePostMerge.match(/(?:^|\s)npm\s+test(?:\s|$)/gm) ?? []).length, 1);
  assert.doesNotMatch(nodePostMerge, /\bgit\s+(?:commit|push|rebase)\b/);

  assert.equal(contract.authorityAfter.authoritativeWorkflow, "pr-gate");
  assert.deepEqual(contract.authorityAfter.pullRequestFullRegressionWorkflows, ["pr-gate"]);
  assert.equal(contract.compatibilityBridge.runsFullRegression, false);
  assert.equal(contract.postMergeGuard.runsFullRegression, true);
  assert.equal(contract.productFilesModified, false);
  assert.equal(contract.branchProtectionModified, false);
});

test("GCI-S03A live inventory records one fewer pull-request full regression", () => {
  const current = materializeGciS01WorkflowInventory();

  assert.equal(current.summary.workflowFileCount, 112);
  assert.equal(current.summary.pullRequestWorkflowCount, 67);
  assert.equal(current.summary.prBranchWriterCount, 20);
  assert.equal(current.summary.prFullRegressionWorkflowCount, 24);
  assert.equal(current.summary.lateSkipCandidateCount, 26);

  const prGate = current.workflows.find((row) => row.workflowId === "pr-gate");
  const nodeBridge = current.workflows.find((row) => row.workflowId === "node-test");
  const nodePostMerge = current.workflows.find((row) => row.workflowId === "node-test-post-merge");

  assert.equal(prGate?.runsFullRegression, true);
  assert.equal(prGate?.writesPullRequestBranch, false);
  assert.equal(nodeBridge?.runsFullRegression, false);
  assert.equal(nodeBridge?.writesPullRequestBranch, false);
  assert.equal(nodePostMerge?.triggerClasses.includes("PULL_REQUEST"), false);
  assert.equal(nodePostMerge?.runsFullRegression, true);

  const registry = JSON.parse(fs.readFileSync(".github/ci/workflow-registry.json", "utf8"));
  const prAuthorities = registry.workflows.filter((row) => row.fullRegressionRole === "PR_AUTHORITY");
  assert.deepEqual(prAuthorities.map((row) => row.workflowId), ["pr-gate"]);
  assert.equal(registry.workflows.find((row) => row.workflowId === "node-test")?.fullRegressionRole, "NONE");
  assert.equal(
    registry.workflows.find((row) => row.workflowId === "node-test-post-merge")?.fullRegressionRole,
    "POST_MERGE_GUARD"
  );
});
