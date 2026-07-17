import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDirectory, "../..");

const schema = JSON.parse(readFileSync(path.join(
  repoRoot,
  "data/curriculum/context/schemas/GCTX_ScenarioChainAndBoundedPBL.schema.json",
), "utf8"));
const contract = JSON.parse(readFileSync(path.join(
  repoRoot,
  "data/curriculum/contracts/GCTX_P02_ScenarioChainBoundedPBLAndCompleteProjectionContract.json",
), "utf8"));
const p01 = JSON.parse(readFileSync(path.join(
  repoRoot,
  "data/curriculum/contracts/GCTX_P01_ApprovedSemanticChainSchemaContract.json",
), "utf8"));

const itemStructureClasses = Object.freeze([
  "independent_application",
  "common_scenario_independent",
  "scenario_chain_dependent",
  "bounded_pbl_closed",
]);

const dependencyGraphTypes = Object.freeze([
  "common_scenario_independent",
  "linear_dependency",
  "branch_merge",
  "parallel_comparison",
  "constraint_merge",
]);

const allowedMilestoneCoverageModes = Object.freeze([
  "question",
  "supplied_as_stimulus",
  "merged_into_question",
  "precomputed_and_visible",
]);

const deferredP03 = Object.freeze([
  "sourceAdmissionPolicy",
  "commonKnowledgeEvidence",
  "sourceExpiryPolicy",
  "webVerificationLifecycle",
]);

const deferredP04 = Object.freeze([
  "pblSemanticFingerprint",
  "nearDuplicateDetection",
  "semanticFamilyRegistry",
  "perUnitSemanticBreadthGate",
]);

test("GCTX-P02 is schema-only, ruleset-aligned and downstream of merged P01", () => {
  assert.equal(contract.task, "GCTX-P02_ScenarioChainBoundedPBLAndCompleteProjectionContract");
  assert.equal(contract.rulesetVersion, p01.rulesetVersion);
  assert.equal(schema.$defs.registryEnvelope.properties.rulesetVersion.const, "0.1.0");
  assert.equal(contract.scope.schemaAndContractOnly, true);
  assert.equal(contract.scope.seedContentMaterialized, false);
  assert.equal(contract.scope.runtimeBehaviorChange, false);
  assert.equal(contract.scope.unitMigrationChange, false);
  assert.equal(contract.scope.rendererImplementationChange, false);
  assert.equal(contract.authorityDependencies.p00OwnershipContractRequired, true);
  assert.equal(contract.authorityDependencies.p01ApprovedSemanticBindingRequired, true);
  assert.equal(contract.authorityDependencies.p01BindingMustBeApproved, true);
});

test("GCTX-P02 preserves the four item-structure classes and separates PBL from shared context", () => {
  assert.deepEqual(contract.itemStructureClasses, itemStructureClasses);
  assert.deepEqual(schema.$defs.itemStructureClass.enum, itemStructureClasses);
  assert.deepEqual(contract.scenarioChainContract.allowedItemStructureClasses, [
    "common_scenario_independent",
    "scenario_chain_dependent",
  ]);
  assert.equal(contract.scenarioChainContract.sharedScenarioAloneQualifiesAsPbl, false);
  assert.equal(schema.$defs.boundedPblEntry.properties.itemStructureClass.const, "bounded_pbl_closed");
});

test("GCTX-P02 supports exact two-to-five-question complete profiles", () => {
  const profile = schema.$defs.completeQuestionCountProfile;
  assert.equal(profile.properties.questionCount.minimum, 2);
  assert.equal(profile.properties.questionCount.maximum, 5);
  assert.equal(profile.properties.subquestions.minItems, 2);
  assert.equal(profile.properties.subquestions.maxItems, 5);
  assert.equal(contract.questionCountContract.minimum, 2);
  assert.equal(contract.questionCountContract.maximum, 5);
  assert.equal(contract.questionCountContract.questionCountSelectsApprovedCompleteProjection, true);
  assert.equal(contract.questionCountContract.questionCountMayTruncateCanonicalChain, false);
  assert.equal(contract.questionCountContract.questionCountMaySelectArbitrarySubset, false);
  assert.equal(contract.questionCountContract.eachQuestionCountProfileIndependentlyApproved, true);
  assert.equal(profile.properties.approvalState.const, "approved");
});

test("GCTX-P02 makes every profile self-contained and forbids runtime truncation or assembly", () => {
  const profile = schema.$defs.completeQuestionCountProfile;
  for (const requiredField of [
    "subquestions",
    "dependencyEdges",
    "quantityLedger",
    "milestoneCoverage",
    "decisionCriteria",
    "terminalOutcome",
    "projectionBoundary",
    "closureAssertions",
  ]) {
    assert.ok(profile.required.includes(requiredField), `missing profile field ${requiredField}`);
  }

  const closure = schema.$defs.closureAssertions.properties;
  assert.equal(closure.allRequiredMilestonesCovered.const, true);
  assert.equal(closure.dependencyGraphAcyclic.const, true);
  assert.equal(closure.allConsumedQuantitiesAvailable.const, true);
  assert.equal(closure.noOrphanSubquestions.const, true);
  assert.equal(closure.terminalOutcomeReached.const, true);
  assert.equal(closure.runtimeTruncationAllowed.const, false);
  assert.equal(closure.runtimeQuestionAssemblyAllowed.const, false);
  assert.equal(closure.completeProjection.const, true);

  assert.equal(contract.completeProjectionContract.runtimeTruncationAllowed, false);
  assert.equal(contract.completeProjectionContract.runtimeQuestionAssemblyAllowed, false);
  assert.ok(contract.forbiddenRuntimeBehavior.includes("partial_pbl_extraction"));
  assert.ok(contract.forbiddenRuntimeBehavior.includes("arbitrary_subquestion_sampling"));
  assert.ok(contract.forbiddenRuntimeBehavior.includes("runtime_question_chain_assembly"));
});

test("GCTX-P02 requires explicit dependency graphs and closed quantity ledgers", () => {
  assert.deepEqual(contract.dependencyGraphTypes, dependencyGraphTypes);
  assert.deepEqual(schema.$defs.dependencyGraphType.enum, dependencyGraphTypes);

  const node = schema.$defs.subquestionNode;
  for (const field of [
    "approvedSemanticBindingId",
    "dependsOnSubquestionIds",
    "consumesQuantityIds",
    "producesQuantityIds",
    "coversMilestoneIds",
    "terminalForProjection",
  ]) {
    assert.ok(node.required.includes(field), `subquestion node missing ${field}`);
  }
  assert.equal(node.properties.order.minimum, 1);
  assert.equal(node.properties.order.maximum, 5);

  const ledger = schema.$defs.quantityLedgerEntry;
  assert.ok(ledger.required.includes("originType"));
  assert.ok(ledger.required.includes("visibleBeforeSubquestionIds"));
  assert.ok(ledger.required.includes("consumedBySubquestionIds"));
  assert.equal(ledger.properties.immutableWithinProjection.const, true);
  assert.deepEqual(ledger.properties.originType.enum, [
    "stimulus",
    "precomputed_visible",
    "subquestion_output",
  ]);

  assert.equal(contract.quantityLedgerContract.hiddenUnavailableQuantityConsumptionAllowed, false);
  assert.equal(contract.quantityLedgerContract.crossQuestionQuantityDependencyMustBeExplicit, true);
});

test("GCTX-P02 accounts for every milestone without silent removal", () => {
  const coverage = schema.$defs.milestoneCoverage;
  assert.deepEqual(coverage.properties.coverageMode.enum, allowedMilestoneCoverageModes);
  assert.equal(coverage.properties.accounted.const, true);
  assert.equal(coverage.properties.silentlyRemoved.const, false);
  assert.deepEqual(contract.omittedMilestoneContract.allowedCoverageModes, allowedMilestoneCoverageModes);
  assert.equal(contract.omittedMilestoneContract.silentlyRemovedAllowed, false);
  assert.equal(contract.omittedMilestoneContract.stimulusCoverageRequiresVisibleEvidenceQuantity, true);
  assert.equal(contract.omittedMilestoneContract.precomputedCoverageRequiresVisibleEvidenceQuantity, true);
  assert.equal(contract.omittedMilestoneContract.mergedCoverageRequiresQuestionReference, true);
});

test("GCTX-P02 requires bounded PBL goal, milestones, deterministic decision and deliverable", () => {
  const pbl = schema.$defs.boundedPblEntry;
  for (const field of [
    "projectArchetypeId",
    "projectGoal",
    "requiredMilestones",
    "decisionCriteria",
    "terminalDeliverableContract",
    "approvedQuestionCountProfiles",
    "pblApprovalAsWhole",
  ]) {
    assert.ok(pbl.required.includes(field), `bounded PBL missing ${field}`);
  }
  assert.equal(pbl.properties.requiredMilestones.minItems, 2);
  assert.equal(pbl.properties.decisionCriteria.minItems, 1);
  assert.equal(pbl.properties.pblApprovalAsWhole.const, true);
  assert.equal(schema.$defs.decisionCriterion.properties.deterministic.const, true);
  assert.equal(contract.boundedPblContract.openEndedOpinionDecisionAllowed, false);
  assert.equal(contract.boundedPblContract.runtimeMayAssembleProjectFromSeparateQuestions, false);
});

test("GCTX-P02 allows only declared complete one-page or two-page semantic projections", () => {
  const projection = schema.$defs.projectionBoundary;
  assert.deepEqual(projection.properties.projectionKind.enum, [
    "single_page_complete",
    "approved_two_page_complete",
  ]);
  assert.equal(projection.properties.rendererMayMoveBreak.const, false);
  assert.equal(projection.properties.semanticBlockMayBeTruncated.const, false);
  assert.equal(contract.projectionBoundaryContract.singlePageBreakReferenceMustBeNull, true);
  assert.equal(contract.projectionBoundaryContract.twoPageBreakReferenceMustBeDeclaredSubquestion, true);
  assert.equal(contract.projectionBoundaryContract.physicalMeasurementsDeferredToLayoutContract, true);
  assert.equal(contract.completeProjectionContract.undeclaredPageSplitAllowed, false);
});

test("GCTX-P02 reserves blocking closure validation without implementing runtime", () => {
  const validation = schema.$defs.chainValidationContract.properties;
  for (const field of [
    "blocking",
    "approvedP01BindingsRequired",
    "questionCountMatchesProfileRequired",
    "dependencyGraphAcyclicRequired",
    "quantityLedgerClosedRequired",
    "milestoneCoverageCompleteRequired",
    "terminalOutcomeRequired",
    "canonicalAnswerRecomputationPerQuestionRequired",
    "canonicalChainRecomputationRequired",
    "runtimeTruncationForbidden",
    "runtimeQuestionAssemblyForbidden",
    "undeclaredPageSplitForbidden",
  ]) {
    assert.equal(validation[field].const, true, `validation contract missing const true for ${field}`);
  }
  assert.ok(contract.blockingCodesReserved.includes("PBL_CHAIN_INCOMPLETE"));
  assert.ok(contract.blockingCodesReserved.includes("PBL_RUNTIME_TRUNCATION_FORBIDDEN"));
  assert.ok(contract.blockingCodesReserved.includes("SCENARIO_QUANTITY_LEDGER_OPEN"));
});

test("GCTX-P02 keeps source governance, breadth, layout and runtime out of scope", () => {
  assert.deepEqual(contract.deferredToP03, deferredP03);
  assert.deepEqual(contract.deferredToP04, deferredP04);
  assert.equal(contract.scope.sourceGovernanceImplemented, false);
  assert.equal(contract.scope.semanticBreadthImplemented, false);
  assert.equal(contract.scope.nearDuplicateDetectionImplemented, false);
  assert.equal(contract.scope.physicalLayoutImplemented, false);
  assert.ok(contract.deferredToLayout.includes("applicationPageDensity"));
  assert.ok(contract.deferredToLayout.includes("answerKeyRendering"));
  assert.ok(contract.deferredToRuntime.includes("approvedProfileResolver"));
  assert.ok(contract.deferredToRuntime.includes("chainValidatorImplementation"));
});

test("GCTX-P02 preserves existing authorities and locks the next shortest task", () => {
  assert.equal(contract.compatibilityContract.existingKnowledgePointAuthorityUnchanged, true);
  assert.equal(contract.compatibilityContract.existingPatternSpecAuthorityUnchanged, true);
  assert.equal(contract.compatibilityContract.existingMathValidatorAuthorityUnchanged, true);
  assert.equal(contract.compatibilityContract.p01ApprovedSemanticBindingAuthorityUnchanged, true);
  assert.equal(contract.compatibilityContract.existingUnitRuntimeUnchanged, true);
  assert.equal(contract.compatibilityContract.g5aU02FilesMayBeModified, false);
  assert.equal(contract.ciPolicy.ownedGatesMustPass, true);
  assert.equal(contract.ciPolicy.newFailureRelativeToMainAllowed, false);
  assert.equal(contract.ciPolicy.inheritedFailureMayBeRepairedInP02, false);
  assert.equal(contract.nextTask, "GCTX-P03_SourceMiningCommonKnowledgeAndEvidenceGovernance");
});
