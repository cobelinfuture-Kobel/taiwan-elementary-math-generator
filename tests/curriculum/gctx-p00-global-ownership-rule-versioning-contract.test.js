import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDirectory, "../..");
const contract = JSON.parse(readFileSync(path.join(
  repoRoot,
  "data/curriculum/contracts/GCTX_P00_GlobalOwnershipScopeAndRuleVersioningContract.json",
), "utf8"));
const s00 = JSON.parse(readFileSync(path.join(
  repoRoot,
  "data/curriculum/contracts/GCTX_S00_GlobalContextScopeContract.json",
), "utf8"));

const expectedAuthorities = Object.freeze([
  "source_and_evidence_authority",
  "shared_context_authority",
  "unit_semantic_binding_authority",
  "scenario_and_bounded_pbl_authority",
  "layout_authority",
  "runtime_selection_authority",
]);

const expectedItemClasses = Object.freeze([
  "independent_application",
  "common_scenario_independent",
  "scenario_chain_dependent",
  "bounded_pbl_closed",
]);

function authority(name) {
  return contract.authorityLayers.find((entry) => entry.authority === name);
}

test("GCTX-P00 is planning-only and preserves existing curriculum authorities", () => {
  assert.equal(contract.task, "GCTX-P00_GlobalOwnershipScopeAndRuleVersioningContract");
  assert.equal(contract.scope.planningOnly, true);
  assert.equal(contract.scope.runtimeBehaviorChange, false);
  assert.equal(contract.scope.registrySeedChange, false);
  assert.equal(contract.scope.unitMigrationChange, false);
  assert.equal(contract.scope.rendererImplementationChange, false);
  assert.equal(contract.scope.s101ToS104RuntimeLineTouched, false);
  assert.equal(contract.scope.curriculumAuthoritiesPreserved, true);
  assert.equal(contract.scope.existingG3ToG6UnitArtifactsPreserved, true);
  assert.equal(s00.ownership.knowledgePointAuthorityUnchanged, true);
  assert.equal(s00.ownership.patternSpecAuthorityUnchanged, true);
  assert.equal(s00.ownership.mathGeneratorAuthorityUnchanged, true);
  assert.equal(s00.ownership.mathValidatorAuthorityUnchanged, true);
});

test("GCTX-P00 limits current layout evidence to G4-G6 without granting G7 authority", () => {
  assert.deepEqual(contract.scope.applicationPblLayoutEvidenceGrades, ["G4", "G5", "G6"]);
  assert.equal(contract.scope.g1ToG3LayoutEvidenceProfileRequired, false);
  assert.equal(contract.scope.grade7EvidenceRole, "structure_reference_only");
  assert.equal(contract.evidencePolicy.grade7EvidenceMaySetElementaryCurriculumAuthority, false);
});

test("GCTX-P00 publishes six non-overlapping authority layers", () => {
  assert.deepEqual(
    contract.authorityLayers.map((entry) => entry.authority),
    expectedAuthorities,
  );

  for (const layer of contract.authorityLayers) {
    assert.equal(typeof layer.owner, "string");
    assert.ok(layer.owner.length > 0, `${layer.authority} must have an owner`);
    assert.ok(layer.owns.length > 0, `${layer.authority} must own at least one responsibility`);
    assert.ok(layer.mustNotOwn.length > 0, `${layer.authority} must forbid at least one responsibility`);
  }

  assert.ok(authority("shared_context_authority").mustNotOwn.includes("complete mathematical prompt"));
  assert.ok(authority("layout_authority").mustNotOwn.includes("semantic milestone removal"));
  assert.ok(authority("runtime_selection_authority").mustNotOwn.includes("new semantic-chain composition"));
});

test("GCTX-P00 forbids runtime composition and PBL truncation", () => {
  const invariants = contract.nonNegotiableInvariants;
  assert.equal(invariants.randomnessMaySelectApprovedBinding, true);
  assert.equal(invariants.randomnessMayCreateNewSemanticBinding, false);
  assert.equal(invariants.questionCountSelectsApprovedCompleteProjection, true);
  assert.equal(invariants.questionCountMayTruncatePblChain, false);
  assert.equal(invariants.sharedScenarioAloneQualifiesAsPbl, false);
  assert.equal(invariants.numericVariationCountsAsNewPblChain, false);
  assert.equal(invariants.surfaceLanguageVariationCountsAsNewPblChain, false);
  assert.equal(invariants.runtimeWebSearchAllowed, false);
  assert.equal(invariants.freeFormAIGenerationAllowed, false);
  assert.equal(invariants.genericFallbackAllowed, false);
  assert.equal(invariants.canonicalAnswerRecomputationRequired, true);
  assert.equal(invariants.blockingSemanticValidatorRequired, true);
  assert.deepEqual(contract.itemStructureClasses, expectedItemClasses);
});

test("GCTX-P00 separates numeric and application layout authorities", () => {
  const layout = contract.layoutBoundary;
  assert.deepEqual(layout.numericLayoutProfiles, [
    { columns: 3, rowsMinimum: 1, rowsMaximum: 5 },
    { columns: 2, rowsMinimum: 1, rowsMaximum: 6 },
    { columns: 1, rowsMinimum: 1, rowsMaximum: 7 },
  ]);
  assert.equal(layout.applicationLayoutUsesNumericGrid, false);
  assert.equal(layout.applicationPageMinimumScoringItems, 5);
  assert.equal(layout.scenarioBlockCountSeparatedFromScoringItemCount, true);
  assert.equal(layout.finalPageRebalanceRequired, true);
  assert.equal(layout.unapprovedApplicationBlockSplitAllowed, false);
  assert.equal(layout.approvedCompleteTwoPagePblProjectionAllowed, true);
  assert.deepEqual(layout.questionSheet.writingSpaceClasses, ["compact", "standard", "extended"]);
  assert.deepEqual(layout.questionSheet.forbiddenLabels, ["答", "答案", "商", "餘", "餘數", "算式"]);
  assert.equal(layout.answerKey.writingSpaceAllowed, false);
  assert.deepEqual(layout.answerKey.answerVisualDistinction, ["accent_color", "bold"]);
  assert.equal(layout.answerKey.studentResponseSheetIsTeacherAnswerKey, false);
});

test("GCTX-P00 closes design-inference evidence requirements", () => {
  const evidence = contract.evidencePolicy;
  assert.equal(evidence.missingExternalPblSampleIsBlocking, false);
  assert.equal(evidence.missingExternalTeacherAnswerKeySampleIsBlocking, false);
  assert.equal(
    evidence.missingSampleTreatment,
    "design_inference_with_executable_positive_negative_fixtures",
  );
  assert.deepEqual(evidence.designDerivedRuleRequires, [
    "schema contract",
    "positive fixture",
    "negative fixture",
    "html acceptance",
    "pdf overflow acceptance",
    "answer-boundary acceptance",
    "existing-unit pilot",
  ]);
});

test("GCTX-P00 versions rules and requires impact analysis", () => {
  const versioning = contract.rulesetVersioning;
  assert.equal(versioning.currentPlannedVersion, "0.1.0");
  assert.equal(versioning.identifierFormat, "GCTX_RULESET_V<major>.<minor>.<patch>");
  assert.deepEqual(versioning.statuses, ["draft", "candidate", "baseline", "deprecated"]);
  assert.ok(versioning.changeClasses.patch.length > 0);
  assert.ok(versioning.changeClasses.minor.length > 0);
  assert.ok(versioning.changeClasses.major.length > 0);
  assert.equal(versioning.impactAnalysisRequiredBeforeChange, true);
  assert.equal(versioning.affectedUnitMatrixRequired, true);
  assert.equal(versioning.migrationNoteRequired, true);
  assert.equal(versioning.impactedUnitRegressionRequired, true);
  assert.equal(versioning.silentRuleMutationAllowed, false);
  assert.equal(versioning.grandfatheringAllowedForBlockingCorrectness, false);
});

test("GCTX-P00 closes unit compliance and bounded audit mutation policy", () => {
  const compliance = contract.unitCompliance;
  assert.deepEqual(compliance.requiredDeclarations, [
    "rulesetVersion",
    "semanticChainStatus",
    "pblClosureStatus",
    "applicationLayoutStatus",
    "questionSheetStatus",
    "answerKeyStatus",
    "validatorStatus",
  ]);
  assert.deepEqual(compliance.statuses, [
    "compliant_current",
    "compliant_with_approved_exception",
    "backfill_required",
    "blocked_by_source_or_schema",
    "not_applicable_numeric_only",
  ]);
  assert.deepEqual(compliance.auditFindingClasses, [
    "global_rule_defect",
    "missing_global_rule",
    "unit_implementation_defect",
    "unit_specific_approved_exception",
    "source_or_evidence_blocker",
  ]);
  assert.equal(compliance.globalRuleMayBeChangedForUnitImplementationDefect, false);
  assert.equal(compliance.approvedExceptionMayWeakenBlockingCorrectness, false);
});

test("GCTX-P00 locks the next bounded task and keeps old S02 draft non-authoritative", () => {
  assert.equal(contract.taskSequence[0], "GCTX-P00_GlobalOwnershipScopeAndRuleVersioningContract");
  assert.equal(contract.taskSequence[1], "GCTX-P01_ApprovedSemanticChainSchema");
  assert.equal(contract.nextTask, "GCTX-P01_ApprovedSemanticChainSchema");
  assert.equal(contract.supersession.draftPr243SchemaIsNotProductionAuthority, true);
  assert.equal(contract.supersession.draftPr243MayBeReusedOnlyAfterP00OwnershipReview, true);
  assert.equal(contract.supersession.p00BecomesPlanningAuthorityAfterCiAndMerge, true);
  assert.deepEqual(contract.unitAuditPhases, [
    "UA_compliance_audit",
    "UB_bounded_fullfix",
    "UC_renderer_html_pdf_acceptance",
    "UD_closeout_and_rule_impact_readback",
  ]);
});
