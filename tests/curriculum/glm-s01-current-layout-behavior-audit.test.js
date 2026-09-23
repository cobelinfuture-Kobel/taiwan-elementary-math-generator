import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, unlinkSync } from "node:fs";
import path from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../..");
const toolPath = path.join(
  repositoryRoot,
  "tools/curriculum/run-glm-s01-current-layout-behavior-audit.mjs",
);
const manifestPath = path.join(
  repositoryRoot,
  "docs/curriculum/output/glm-s01-current-layout-behavior-audit/current.json",
);
const contractPath = path.join(
  repositoryRoot,
  "data/curriculum/contracts/GLM_S00_PublicCompletedUnit18LayoutContract.json",
);

let generatedByThisTestProcess = false;

function ensureManifest() {
  if (!existsSync(manifestPath)) {
    execFileSync(process.execPath, [toolPath], {
      cwd: repositoryRoot,
      encoding: "utf8",
      stdio: "pipe",
    });
    generatedByThisTestProcess = true;
  }
  return JSON.parse(readFileSync(manifestPath, "utf8"));
}

after(() => {
  // The dedicated GLM-S01 workflow runs the audit tool before this test and
  // retains the manifest for artifact upload. Full-suite test jobs create the
  // manifest only for validation, so remove that temporary output to preserve
  // the repository clean-tree contract.
  if (generatedByThisTestProcess && existsSync(manifestPath)) {
    unlinkSync(manifestPath);
  }
});

const contract = JSON.parse(readFileSync(contractPath, "utf8"));

test("GLM-S01 captures and classifies all 270 current document-layer scenarios", () => {
  const manifest = ensureManifest();
  assert.equal(manifest.status, "BASELINE_CAPTURED");
  assert.equal(manifest.publicUnitCount, 15);
  assert.equal(manifest.approvedLayoutCountPerUnit, 18);
  assert.equal(manifest.expectedScenarioCount, 270);
  assert.equal(manifest.actualScenarioCount, 270);
  assert.equal(manifest.scenarios.length, 270);
  assert.equal(manifest.sourceSummaries.length, 15);

  const allowedCodes = new Set(contract.baselineResultCodes);
  for (const scenario of manifest.scenarios) {
    assert.ok(allowedCodes.has(scenario.classification), scenario.scenarioId);
    assert.equal(
      scenario.scenarioId,
      `${scenario.sourceId}:${scenario.layoutId}`,
    );
  }
});

test("GLM-S01 contains exactly 18 unique layout results for every public unit", () => {
  const manifest = ensureManifest();
  for (const source of manifest.sourceSummaries) {
    const sourceScenarios = manifest.scenarios.filter(
      (scenario) => scenario.sourceId === source.sourceId,
    );
    assert.equal(source.scenarioCount, 18);
    assert.equal(sourceScenarios.length, 18);
    assert.equal(new Set(sourceScenarios.map((scenario) => scenario.layoutId)).size, 18);
    assert.deepEqual(
      sourceScenarios.map((scenario) => scenario.layoutId),
      contract.approvedLayouts.map((layout) => layout.layoutId),
    );
  }
});

test("GLM-S01 preserves evidence needed for renderer-profile and worst-case follow-up", () => {
  const manifest = ensureManifest();
  assert.equal(manifest.auditLayer, "worksheet_document_before_dom_pdf");
  assert.equal(manifest.includeAnswerKey, false);
  assert.equal(manifest.questionCountPerScenario, 18);
  assert.equal(manifest.nextTask, "GLM-S02_UnitRendererProfileAndWorstCaseQuestionAudit");

  for (const scenario of manifest.scenarios) {
    assert.ok(Object.hasOwn(scenario, "rendererProfileId"));
    assert.ok(Object.hasOwn(scenario, "readback"));
    assert.ok(Object.hasOwn(scenario.readback, "printOptions"));
    assert.ok(Object.hasOwn(scenario.readback, "layoutResolution"));
    assert.ok(Array.isArray(scenario.issueCodes));
  }
});
