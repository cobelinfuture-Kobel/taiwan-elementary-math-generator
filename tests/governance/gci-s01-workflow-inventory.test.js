import assert from "node:assert/strict";
import test from "node:test";

import {
  materializeGciS01WorkflowInventory
} from "../../tools/governance/materialize-gci-s01-workflow-inventory.mjs";

test("GCI-S01 exhaustively inventories checked-out workflow files and exposes fan-out evidence", () => {
  const report = materializeGciS01WorkflowInventory();

  assert.equal(report.inventoryCompleteness, "COMPLETE_FROM_CHECKED_OUT_MAIN_TREE");
  assert.ok(report.summary.workflowFileCount >= 10, report.summary);
  assert.ok(report.summary.pullRequestWorkflowCount >= 10, report.summary);
  assert.ok(report.summary.prBranchWriterCount >= 2, report.workflowIds);
  assert.ok(report.summary.prFullRegressionWorkflowCount >= 3, report.workflowIds);
  assert.ok(report.summary.lateSkipCandidateCount >= 9, report.workflowIds);

  const files = report.workflows.map((row) => row.file);
  assert.equal(new Set(files).size, files.length, "workflow file paths must be unique");
  assert.ok(report.workflows.some((row) => row.file === ".github/workflows/node-test.yml"));
  assert.ok(report.workflows.some((row) => row.file === ".github/workflows/pgc-r05-application-generation-full-fix.yml"));
  assert.ok(report.workflows.some((row) => row.file === ".github/workflows/pgc-r05-capacity-contract-reconciliation-d0-closeout.yml"));

  const serialized = JSON.stringify(report);
  console.log(`GCI_S01_WORKFLOW_INVENTORY_BASE64=${Buffer.from(serialized, "utf8").toString("base64")}`);
});
