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
  "tools/curriculum/run-glm-s02-unit-renderer-worst-case-audit.mjs",
);
const enrichmentPath = path.join(
  repositoryRoot,
  "tools/curriculum/enrich-glm-s02-g5a-u02-static-html.mjs",
);
const manifestPath = path.join(
  repositoryRoot,
  "docs/curriculum/output/glm-s02-unit-renderer-worst-case-audit/current.json",
);
const contractPath = path.join(
  repositoryRoot,
  "data/curriculum/contracts/GLM_S00_PublicCompletedUnit18LayoutContract.json",
);
const s01BaselinePath = path.join(
  repositoryRoot,
  "docs/curriculum/output/GLM_S01_CURRENT_15_UNIT_LAYOUT_BEHAVIOR_BASELINE.json",
);

let generatedByThisTestProcess = false;

function ensureManifest() {
  if (!existsSync(manifestPath)) {
    execFileSync(process.execPath, [toolPath], {
      cwd: repositoryRoot,
      encoding: "utf8",
      stdio: "pipe",
    });
    execFileSync(process.execPath, [enrichmentPath], {
      cwd: repositoryRoot,
      encoding: "utf8",
      stdio: "pipe",
    });
    generatedByThisTestProcess = true;
  }
  return JSON.parse(readFileSync(manifestPath, "utf8"));
}

after(() => {
  if (generatedByThisTestProcess && existsSync(manifestPath)) {
    unlinkSync(manifestPath);
  }
});

const contract = JSON.parse(readFileSync(contractPath, "utf8"));
const s01Baseline = JSON.parse(readFileSync(s01BaselinePath, "utf8"));

test("GLM-S02 audits renderer and question-shape evidence for all public units", () => {
  const manifest = ensureManifest();
  assert.equal(manifest.status, "AUDIT_CAPTURED");
  assert.equal(manifest.publicUnitCount, 15);
  assert.equal(manifest.auditedUnitCount, contract.scope.publicUnitCount);
  assert.equal(manifest.unitSummaries.length, contract.scope.publicUnitCount);
  assert.ok(manifest.attemptedRouteCount >= contract.scope.publicUnitCount * 3);
  assert.equal(
    manifest.successfulRouteCount + manifest.failedRouteCount,
    manifest.attemptedRouteCount,
  );
  assert.ok(manifest.totalQuestionSamples > 0);
  assert.deepEqual(manifest.unitsWithoutSamples, []);
});

test("GLM-S02 records one or more worst-case question shapes for every unit", () => {
  const manifest = ensureManifest();
  for (const unit of manifest.unitSummaries) {
    assert.ok(unit.attemptedRouteCount >= 3, unit.sourceId);
    assert.ok(unit.successfulRouteCount >= 1, unit.sourceId);
    assert.ok(unit.questionSampleCount >= 1, unit.sourceId);
    assert.ok(unit.shapeFamilyCount >= 1, unit.sourceId);
    assert.ok(unit.worstCases.byShape.length >= 1, unit.sourceId);
    assert.ok(unit.worstCases.highestBurden.length >= 1, unit.sourceId);
    assert.ok(unit.maxTextMetrics.promptLength >= 1, unit.sourceId);

    for (const sample of unit.worstCases.byShape) {
      assert.equal(sample.sourceId, unit.sourceId);
      assert.ok(typeof sample.promptText === "string");
      assert.ok(Number.isInteger(sample.promptLength));
      assert.ok(Number.isInteger(sample.responsePromptLength));
      assert.ok(Number.isInteger(sample.answerLength));
      assert.equal(
        sample.burdenScore,
        sample.promptLength + sample.responsePromptLength + sample.answerLength,
      );
    }
  }
});

test("GLM-S02 preserves G5A-U02 static canonical prompt evidence after runtime repair", () => {
  const manifest = ensureManifest();
  const unit = manifest.unitSummaries.find((entry) => entry.sourceId === "g5a_u02_5a02");
  assert.equal(manifest.g5aU02StaticHtmlEnrichment.status, "APPLIED");
  assert.equal(manifest.g5aU02StaticHtmlEnrichment.questionCount, 22);
  assert.equal(unit.staticCanonicalHtmlEvidence.questionCount, 22);
  assert.ok(unit.staticCanonicalHtmlEvidence.renderKinds.length >= 3);
  assert.ok(unit.maxTextMetrics.promptLength > 0);
  assert.ok(unit.worstCases.byShape.some((sample) => sample.routeKind === "staticCanonicalHtml"));
  assert.ok(unit.diagnoses.includes("static_canonical_html_question_shapes_recovered"));
  assert.ok(Array.isArray(unit.diagnoses));
  assert.deepEqual(unit.s01Gap.classificationCounts, s01Baseline.gapUnits
    .find((gap) => gap.sourceId === "g5a_u02_5a02").classificationCounts);
});

test("GLM-S02 carries forward the four S01 historical gap snapshots without requiring gaps to remain open", () => {
  const manifest = ensureManifest();
  assert.equal(s01Baseline.gapUnitCount, 4);
  const bySourceId = new Map(manifest.unitSummaries.map((unit) => [unit.sourceId, unit]));
  assert.deepEqual(
    new Set(s01Baseline.gapUnits.map((gap) => gap.sourceId)),
    new Set(["g4a_u01_4a01", "g4a_u02_4a02", "g4b_u04_4b04", "g5a_u02_5a02"]),
  );

  for (const gap of s01Baseline.gapUnits) {
    const unit = bySourceId.get(gap.sourceId);
    assert.ok(unit, gap.sourceId);
    assert.deepEqual(unit.s01Gap.classificationCounts, gap.classificationCounts);
    assert.ok(Array.isArray(unit.diagnoses), gap.sourceId);
    assert.equal(
      Object.values(unit.s01Gap.classificationCounts).reduce((sum, count) => sum + count, 0),
      18,
      gap.sourceId,
    );
  }
});

test("GLM-S02 retains route, profile and answer-key evidence for S03", () => {
  const manifest = ensureManifest();
  assert.equal(manifest.nextTask, "GLM-S03_270ScenarioHTMLPDFBaseline");
  assert.equal(manifest.routeSummaries.length, manifest.attemptedRouteCount);

  for (const route of manifest.routeSummaries) {
    assert.ok(typeof route.routeId === "string");
    assert.ok(typeof route.routeKind === "string");
    assert.ok(Array.isArray(route.issueCodes));
    assert.ok(Object.hasOwn(route, "rendererProfile"));
    assert.ok(Object.hasOwn(route, "printOptions"));
    assert.ok(Object.hasOwn(route, "answerPageCount"));
  }
});
