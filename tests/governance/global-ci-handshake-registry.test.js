import assert from "node:assert/strict";
import test from "node:test";

import {
  validateGlobalCiHandshakeRegistry
} from "../../tools/governance/validate-global-ci-handshake-registry.mjs";

test("GCI workflow registry and policy lock pass deterministic QA after UIV01 promotion", () => {
  const result = validateGlobalCiHandshakeRegistry();

  assert.equal(result.ok, true, JSON.stringify(result.errors, null, 2));
  assert.equal(result.schemaVersion, "1.0.0");
  assert.equal(result.inventoryCompleteness, "BOOTSTRAP_PARTIAL");
  assert.equal(result.workflowCount, 5);
  assert.equal(result.prFullRegressionAuthorityCount, 1);
  assert.equal(result.openNonconformityCount, 3);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.warnings, [
    {
      code: "GCI_BOOTSTRAP_PARTIAL_INVENTORY",
      detail: "GCI-S01 must enumerate every workflow and replace bootstrap counts with exhaustive fan-out evidence."
    }
  ]);
});
