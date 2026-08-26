import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { detectPostgApplicationImpact } from "../../tools/governance/detect-postg-application-impact.mjs";
import { inventoryCurrentPrWorkflows } from "../../tools/governance/inventory-current-pr-workflows.mjs";
import { prepareSinglePrOrchestratorCutover } from "../../tools/governance/prepare-single-pr-orchestrator-cutover.mjs";

test("POSTG focused-gate impact detection is bounded to the current POSTG path contract", () => {
  assert.deepEqual(
    detectPostgApplicationImpact([
      "src/curriculum/application/foo.mjs",
      "tests/curriculum/postg-app-a.test.js",
      "site/index.html",
    ]),
    {
      postgChanged: true,
      matchedFiles: [
        "src/curriculum/application/foo.mjs",
        "tests/curriculum/postg-app-a.test.js",
      ],
    },
  );
  assert.deepEqual(detectPostgApplicationImpact(["site/index.html", "README.md"]), {
    postgChanged: false,
    matchedFiles: [],
  });
});

test("single-orchestrator preview retires every noncanonical direct PR trigger without editing workflow bodies", () => {
  const before = inventoryCurrentPrWorkflows();
  assert.ok(before.summary.pullRequestWorkflowCount > 1);

  const stageRoot = fs.mkdtempSync(path.join(os.tmpdir(), "uiv02-cutover-"));
  try {
    const result = prepareSinglePrOrchestratorCutover({ stageRoot });
    assert.equal(result.manifest.before.pullRequestWorkflowCount, before.summary.pullRequestWorkflowCount);
    assert.equal(result.manifest.after.pullRequestWorkflowCount, 1);
    assert.equal(result.manifest.after.prBranchWriterCount, 0);
    assert.equal(result.manifest.after.prFullRegressionWorkflowCount, 1);
    assert.equal(result.manifest.retiredWorkflowCount, before.summary.pullRequestWorkflowCount - 1);

    const after = inventoryCurrentPrWorkflows({ workflowDir: path.join(stageRoot, ".github/workflows") });
    assert.equal(after.pullRequestWorkflowPaths.length, 1);
    assert.match(after.pullRequestWorkflowPaths[0], /\/pr-gate\.yml$/);

    for (const row of result.manifest.retired) {
      const source = fs.readFileSync(row.file, "utf8");
      const staged = fs.readFileSync(path.join(stageRoot, row.file), "utf8");
      assert.match(source, /^name: .+/m, row.file);
      assert.match(staged, /^name: .+/m, row.file);
      assert.match(staged, /^jobs:/m, row.file);
      assert.doesNotMatch(staged, /\bpull_request:/, row.file);
      assert.ok(staged.length > 100, `${row.file}: workflow body unexpectedly collapsed`);
    }
  } finally {
    fs.rmSync(stageRoot, { recursive: true, force: true });
  }
});

test("POSTG Application is reusable only while PR Gate remains the sole direct pull-request orchestrator", () => {
  const postg = fs.readFileSync(".github/workflows/postg-application-pr-gate.yml", "utf8");
  const prGate = fs.readFileSync(".github/workflows/pr-gate.yml", "utf8");
  assert.doesNotMatch(postg, /\bpull_request:/);
  assert.match(postg, /workflow_call:/);
  assert.match(prGate, /\bpull_request:/);
  assert.match(prGate, /uses: \.\/\.github\/workflows\/postg-application-pr-gate\.yml/);
});
