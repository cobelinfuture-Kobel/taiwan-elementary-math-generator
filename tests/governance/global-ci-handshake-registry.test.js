import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  validateGlobalCiHandshakeRegistry
} from "../../tools/governance/validate-global-ci-handshake-registry.mjs";

test("GCI workflow registry and policy lock pass deterministic QA", () => {
  const result = validateGlobalCiHandshakeRegistry();
  const registry = JSON.parse(fs.readFileSync(".github/ci/workflow-registry.json", "utf8"));

  assert.equal(result.ok, true, JSON.stringify(result.errors, null, 2));
  assert.equal(result.schemaVersion, "1.0.0");
  assert.equal(result.inventoryCompleteness, "BOOTSTRAP_PARTIAL");
  assert.equal(result.workflowCount, 6);
  assert.equal(result.prFullRegressionAuthorityCount, 1);
  assert.equal(result.openNonconformityCount, 3);
  assert.deepEqual(result.errors, []);

  const byId = new Map(registry.workflows.map((row) => [row.workflowId, row]));
  assert.equal(byId.get("pr-gate")?.fullRegressionRole, "PR_AUTHORITY");
  assert.equal(byId.get("pr-gate")?.writesPullRequestBranch, false);
  assert.equal(byId.get("node-test")?.fullRegressionRole, "NONE");
  assert.equal(byId.get("node-test-post-merge")?.fullRegressionRole, "POST_MERGE_GUARD");
  assert.equal(byId.get("node-test-post-merge")?.triggerClasses.includes("PULL_REQUEST"), false);

  assert.deepEqual(result.warnings, [
    {
      code: "GCI_BOOTSTRAP_PARTIAL_INVENTORY",
      detail: "GCI-S01 must enumerate every workflow and replace bootstrap counts with exhaustive fan-out evidence."
    }
  ]);
});
