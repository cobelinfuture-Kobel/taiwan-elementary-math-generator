import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  validateGlobalCiHandshakeRegistry
} from "../../tools/governance/validate-global-ci-handshake-registry.mjs";

test("GCI workflow registry and policy lock pass deterministic QA after UIV02 R05 retirement", () => {
  const result = validateGlobalCiHandshakeRegistry();

  assert.equal(result.ok, true, JSON.stringify(result.errors, null, 2));
  assert.equal(result.schemaVersion, "1.0.0");
  assert.equal(result.inventoryCompleteness, "BOOTSTRAP_PARTIAL");
  assert.equal(result.workflowCount, 5);
  assert.equal(result.prFullRegressionAuthorityCount, 1);
  assert.equal(result.openNonconformityCount, 0);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.warnings, [
    {
      code: "GCI_BOOTSTRAP_PARTIAL_INVENTORY",
      detail: "GCI-S01 must enumerate every workflow and replace bootstrap counts with exhaustive fan-out evidence."
    }
  ]);
});

test("legacy R05 workflows no longer participate in pull-request CI or mutate branches", () => {
  for (const file of [
    ".github/workflows/pgc-r05-application-generation-full-fix.yml",
    ".github/workflows/pgc-r05-capacity-contract-reconciliation-d0-closeout.yml",
  ]) {
    const workflow = fs.readFileSync(file, "utf8");
    assert.match(workflow, /workflow_dispatch:/);
    assert.doesNotMatch(workflow, /pull_request:/);
    assert.match(workflow, /permissions:\n  contents: read/);
    assert.doesNotMatch(workflow, /git push|git commit|git rebase/);
    assert.doesNotMatch(workflow, /Full repository regression|npm test/);
  }
});
