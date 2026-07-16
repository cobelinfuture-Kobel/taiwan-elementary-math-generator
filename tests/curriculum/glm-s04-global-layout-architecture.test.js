import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../..");

function readJson(relativePath) {
  return JSON.parse(readFileSync(path.join(repositoryRoot, relativePath), "utf8"));
}

const s00 = readJson("data/curriculum/contracts/GLM_S00_PublicCompletedUnit18LayoutContract.json");
const s03 = readJson("docs/curriculum/output/GLM_S03_270_HTML_PDF_BASELINE.json");
const architecture = readJson("data/curriculum/contracts/GLM_S04_Global18LayoutArchitecture.json");

test("GLM-S04 keeps the S00 public unit and layout authorities singular", () => {
  assert.equal(architecture.status, "design_locked_pending_ci");
  assert.equal(architecture.authority.publicUnitCount, s00.scope.publicUnitCount);
  assert.equal(architecture.authority.approvedLayoutCount, s00.scope.approvedLayoutCountPerUnit);
  assert.equal(architecture.authority.defaultApprovedLayoutId, "3x5");
  assert.equal(architecture.authority.publicQuestionLayoutMode, "exact_approved_matrix");
  assert.equal(
    architecture.authority.approvedLayoutSource,
    "data/curriculum/contracts/GLM_S00_PublicCompletedUnit18LayoutContract.json",
  );
  assert.equal(architecture.components.approvedLayoutRegistry.forbidden.includes("per_unit_public_layout_allowlist"), true);
});

test("GLM-S04 derives exactly four repair units and eleven regression-only units from S03", () => {
  const repairIds = architecture.gapRepairs.map((entry) => entry.sourceId);
  const s03GapIds = s03.gapUnits.map((entry) => entry.sourceId);
  assert.deepEqual(repairIds, s03GapIds);
  assert.equal(repairIds.length, 4);
  assert.equal(architecture.regressionOnlyUnits.length, 11);
  assert.equal(new Set([...repairIds, ...architecture.regressionOnlyUnits]).size, 15);
  assert.deepEqual(
    [...architecture.regressionOnlyUnits].sort(),
    [...s03.exactUnits].sort(),
  );
});

test("GLM-S04 approved requests resolve exactly and legacy migration is explicit", () => {
  const normalizer = architecture.components.publicLayoutNormalizer;
  const overlay = architecture.components.globalExactQuestionLayoutOverlay;
  assert.equal(normalizer.approvedRequestBehavior, "preserve_exactly");
  assert.equal(normalizer.legacyUnapprovedRequestBehavior, "migrate_to_3x5_with_explicit_warning");
  assert.equal(normalizer.invalidRequestBehavior, "block_with_public_validation_error");
  assert.equal(normalizer.silentNormalizationAllowed, false);
  assert.equal(overlay.approvedRequestResolution, "requested_equals_resolved");
  assert.equal(overlay.sourceProfileMayReduceApprovedRowsOrColumns, false);
  assert.equal(overlay.preserveQuestionContent, true);
  assert.equal(overlay.preserveQuestionOrder, true);
});

test("GLM-S04 source-unit adapters preserve canonical authority", () => {
  const adapters = architecture.components.sourceUnitPlanAdapter;
  const g4b = adapters.g4b_u04_4b04;
  const g5a = adapters.g5a_u02_5a02;
  assert.equal(g4b.internalCanonicalSelectionMode, "mixedKnowledgePointsSameUnit");
  assert.equal(g4b.mustReuseExistingCanonicalRouter, true);
  assert.equal(g4b.mustReuseExistingG4BU04LayoutResolver, true);
  assert.equal(g4b.genericFallbackAllowed, false);
  assert.equal(g5a.internalCanonicalSelectionMode, "mixedKnowledgePointsSameUnit");
  assert.equal(g5a.requestedQuestionCountAuthoritative, true);
  assert.equal(g5a.fixedStaticWorksheetProductionUse, "legacy_diagnostic_only");
  assert.equal(g5a.genericFallbackAllowed, false);
});

test("GLM-S04 keeps answer layout and curriculum authority independent", () => {
  const answer = architecture.components.answerLayoutResolver;
  const boundaries = architecture.implementationBoundaries;
  assert.equal(answer.independentFromQuestionLayout, true);
  assert.equal(answer.preserveExistingProfileAuthority, true);
  assert.equal(answer.global18LayoutMatrixApplies, false);
  assert.equal(boundaries.fullFixRequired, true);
  assert.equal(boundaries.minimalFixForbidden, true);
  assert.equal(boundaries.perUnitTemporaryLayoutPatchForbidden, true);
  assert.equal(boundaries.curriculumAuthorityChangeAllowed, false);
  assert.equal(boundaries.formulaChangeAllowed, false);
  assert.equal(boundaries.answerModelChangeAllowed, false);
  assert.equal(boundaries.genericFallbackAllowed, false);
  assert.equal(boundaries.freeFormAIAllowed, false);
});

test("GLM-S04 acceptance continues to the global FullFix", () => {
  assert.equal(architecture.acceptance.s06ScenarioCount, 270);
  assert.equal(architecture.acceptance.s07ScenarioCount, 90);
  assert.equal(architecture.acceptance.s08DeployedRequired, true);
  assert.ok(architecture.acceptance.requiredZeroCounts.includes("silent_caps"));
  assert.ok(architecture.acceptance.requiredZeroCounts.includes("ignored_layouts"));
  assert.ok(architecture.acceptance.requiredZeroCounts.includes("generation_blocked_layout_scenarios"));
  assert.equal(architecture.nextTask, "GLM-S05_Global18LayoutFullFix");
});
