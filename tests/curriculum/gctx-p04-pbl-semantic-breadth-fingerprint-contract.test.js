import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDirectory, "../..");

const readJson = (relativePath) => JSON.parse(readFileSync(
  path.join(repoRoot, relativePath),
  "utf8",
));

const schema = readJson(
  "data/curriculum/context/schemas/GCTX_PBLSemanticBreadthAndFingerprint.schema.json",
);
const contract = readJson(
  "data/curriculum/contracts/GCTX_P04_PBLSemanticBreadthFingerprintAndNearDuplicateContract.json",
);
const p00 = readJson(
  "data/curriculum/contracts/GCTX_P00_GlobalOwnershipScopeAndRuleVersioningContract.json",
);
const p02 = readJson(
  "data/curriculum/contracts/GCTX_P02_ScenarioChainBoundedPBLAndCompleteProjectionContract.json",
);
const p03 = readJson(
  "data/curriculum/contracts/GCTX_P03_SourceMiningCommonKnowledgeAndEvidenceGovernanceContract.json",
);

const defs = schema.$defs;

const identityDimensions = Object.freeze([
  "project_archetype",
  "project_goal",
  "required_milestones",
  "event_flow",
  "quantity_dependency_graph",
  "decision_model",
  "mathematical_composition",
  "terminal_deliverable",
]);

const excludedSurfaceDimensions = Object.freeze([
  "numeric_values",
  "numeric_profile_ids",
  "random_seed",
  "actor_names",
  "place_names",
  "object_names",
  "language_variant_ids",
  "wording_variants",
  "cosmetic_context_nouns",
  "context_domain_labels",
  "source_urls",
]);

const blockingCodes = Object.freeze([
  "PBL_FINGERPRINT_MISSING",
  "PBL_FINGERPRINT_VERSION_MISMATCH",
  "PBL_FINGERPRINT_CANONICALIZATION_FAILED",
  "PBL_EXACT_SEMANTIC_DUPLICATE",
  "PBL_SURFACE_RESKIN_DETECTED",
  "PBL_NEAR_DUPLICATE_CHAIN",
  "PBL_NEAR_DUPLICATE_REVIEW_MISSING",
  "PBL_NEAR_DUPLICATE_WAIVER_FORBIDDEN",
  "PBL_ARCHETYPE_BREADTH_INSUFFICIENT",
  "PBL_SEMANTIC_FAMILY_BREADTH_INSUFFICIENT",
  "PBL_APPROVED_CHAIN_BREADTH_INSUFFICIENT",
  "PBL_CONTEXT_DOMAIN_COVERAGE_INSUFFICIENT",
  "PBL_EVENT_FLOW_BREADTH_INSUFFICIENT",
  "PBL_DECISION_MODEL_BREADTH_INSUFFICIENT",
  "PBL_NEAR_DUPLICATE_RATE_EXCEEDED",
  "PBL_APPROVED_CHAIN_FINGERPRINT_COLLISION",
  "PBL_SURFACE_VARIANT_COUNTING_FORBIDDEN",
  "PBL_NUMERIC_CAPACITY_COUNTING_FORBIDDEN",
  "PBL_P02_CLOSURE_REFERENCE_MISSING",
  "PBL_P03_EVIDENCE_REFERENCE_MISSING",
]);

test("GCTX-P04 follows P00/P02/P03 and remains schema-only", () => {
  assert.equal(
    contract.task,
    "GCTX-P04_PBLSemanticBreadthFingerprintAndNearDuplicateContract",
  );
  assert.match(contract.status, /^contract_locked_/);
  assert.equal(contract.rulesetVersion, p00.rulesetVersioning.currentPlannedVersion);
  assert.equal(defs.registryEnvelope.properties.rulesetVersion.const, "0.1.0");
  assert.equal(p03.nextTask, contract.task);
  assert.equal(p02.status, "contract_locked_ci_accepted");
  assert.equal(p03.status, "governance_locked_ci_accepted");

  assert.equal(contract.scope.schemaAndContractOnly, true);
  assert.equal(contract.scope.archetypeSeedsMaterialized, false);
  assert.equal(contract.scope.semanticFamilySeedsMaterialized, false);
  assert.equal(contract.scope.pblChainSeedsMaterialized, false);
  assert.equal(contract.scope.fingerprintsMaterialized, false);
  assert.equal(contract.scope.runtimeBehaviorChange, false);
  assert.equal(contract.scope.unitMigrationChange, false);
  assert.equal(contract.scope.validatorImplementationChange, false);
});

test("GCTX-P04 registry envelope separates policy, families, fingerprints and assessments", () => {
  assert.deepEqual(defs.registryEnvelope.required, [
    "schemaVersion",
    "rulesetVersion",
    "fingerprintPolicy",
    "metricCountingPolicy",
    "archetypes",
    "semanticFamilies",
    "fingerprints",
    "nearDuplicateAssessments",
    "unitBreadthProfiles",
  ]);
  assert.equal(
    defs.registryEnvelope.properties.schemaVersion.const,
    "gctx-pbl-semantic-breadth-v1",
  );
  assert.ok(defs.registryEnvelope.properties.archetypes);
  assert.ok(defs.registryEnvelope.properties.semanticFamilies);
  assert.ok(defs.registryEnvelope.properties.fingerprints);
  assert.ok(defs.registryEnvelope.properties.nearDuplicateAssessments);
  assert.ok(defs.registryEnvelope.properties.unitBreadthProfiles);
});

test("GCTX-P04 locks exactly eight semantic identity dimensions", () => {
  assert.deepEqual(contract.semanticIdentityDimensions, identityDimensions);
  assert.deepEqual(defs.fingerprintDimensionNames.enum, identityDimensions);

  const identitySchema = defs.fingerprintPolicy.properties.identityDimensions;
  assert.equal(identitySchema.minItems, 8);
  assert.equal(identitySchema.maxItems, 8);
  assert.equal(identitySchema.items, false);
  assert.deepEqual(
    identitySchema.prefixItems.map((entry) => entry.const),
    identityDimensions,
  );
});

test("GCTX-P04 excludes all surface and numeric reskin dimensions", () => {
  assert.deepEqual(contract.excludedSurfaceDimensions, excludedSurfaceDimensions);
  assert.deepEqual(defs.surfaceOnlyDimensionNames.enum, excludedSurfaceDimensions);

  const difference = contract.semanticDifferenceContract;
  for (const key of [
    "numericVariationCreatesNewChain",
    "numericProfileChangeCreatesNewChain",
    "randomSeedChangeCreatesNewChain",
    "actorNameChangeCreatesNewChain",
    "placeNameChangeCreatesNewChain",
    "objectNameChangeCreatesNewChain",
    "languageVariantChangeCreatesNewChain",
    "wordingChangeCreatesNewChain",
    "cosmeticContextNounChangeCreatesNewChain",
    "contextDomainChangeAloneCreatesNewChain",
    "sourceUrlChangeCreatesNewChain",
    "archetypeLabelChangeAloneCreatesNewChain",
  ]) {
    assert.equal(difference[key], false, `${key} must remain false`);
  }
  assert.equal(difference.surfaceReskinCountsAsExactSemanticDuplicate, true);
  assert.equal(difference.genuineChainDifferenceRequiresMaterialIdentityChange, true);

  const policy = defs.fingerprintPolicy.properties;
  assert.equal(policy.contextChangeAloneCreatesNewChain.const, false);
  assert.equal(policy.numericVariationCreatesNewChain.const, false);
  assert.equal(policy.surfaceLanguageVariationCreatesNewChain.const, false);
});

test("GCTX-P04 dimension weights are deterministic and total 100", () => {
  assert.deepEqual(contract.dimensionWeights, {
    projectArchetype: 15,
    projectGoal: 15,
    requiredMilestones: 15,
    eventFlow: 15,
    quantityDependencyGraph: 15,
    decisionModel: 10,
    mathematicalComposition: 10,
    terminalDeliverable: 5,
    total: 100,
  });
  assert.equal(
    Object.entries(contract.dimensionWeights)
      .filter(([key]) => key !== "total")
      .reduce((sum, [, value]) => sum + value, 0),
    100,
  );

  const weights = defs.fingerprintPolicy.properties.dimensionWeights.properties;
  assert.equal(weights.projectArchetype.const, 15);
  assert.equal(weights.projectGoal.const, 15);
  assert.equal(weights.requiredMilestones.const, 15);
  assert.equal(weights.eventFlow.const, 15);
  assert.equal(weights.quantityDependencyGraph.const, 15);
  assert.equal(weights.decisionModel.const, 10);
  assert.equal(weights.mathematicalComposition.const, 10);
  assert.equal(weights.terminalDeliverable.const, 5);
  assert.equal(weights.total.const, 100);
});

test("GCTX-P04 canonicalization excludes wording and numbers while preserving structure", () => {
  const canonical = defs.fingerprintPolicy.properties.canonicalization.properties;
  assert.equal(canonical.orderedMilestonesPreserved.const, true);
  assert.equal(canonical.orderedEventFlowPreserved.const, true);
  assert.equal(canonical.dependencyGraphCanonicalized.const, true);
  assert.equal(canonical.unorderedTagSetsSorted.const, true);
  assert.equal(canonical.rawWordingExcluded.const, true);
  assert.equal(canonical.numericValuesExcluded.const, true);
  assert.equal(canonical.stableIdsRequired.const, true);

  assert.equal(contract.canonicalizationContract.canonicalSha256Required, true);
  assert.equal(contract.canonicalizationContract.fingerprintVersionRequired, true);
  assert.equal(contract.fingerprintVersion, "pbl-semantic-fingerprint-v1");
});

test("GCTX-P04 fingerprint entries require P02 closure and P03 evidence traceability", () => {
  const fingerprint = defs.pblSemanticFingerprintEntry;
  for (const field of [
    "archetypeId",
    "projectGoalSignature",
    "requiredMilestoneSignature",
    "eventFlowSignature",
    "quantityDependencyGraphSignature",
    "decisionModelSignature",
    "mathematicalCompositionSignature",
    "terminalDeliverableSignature",
    "canonicalFingerprintHash",
    "p02ProjectionProfileIds",
    "p03EvidenceIds",
  ]) {
    assert.ok(fingerprint.required.includes(field), `fingerprint missing ${field}`);
  }
  assert.equal(fingerprint.properties.p02ProjectionProfileIds.minItems, 1);
  assert.equal(fingerprint.properties.p03EvidenceIds.minItems, 1);
  assert.equal(fingerprint.properties.fingerprintVersion.const, contract.fingerprintVersion);
  assert.ok(fingerprint.required.includes("surfaceVariantCount"));
  assert.ok(fingerprint.required.includes("numericInstanceCapacity"));

  assert.equal(
    contract.productionEligibilityContract.p02ApprovedCompleteProjectionRequired,
    true,
  );
  assert.equal(
    contract.productionEligibilityContract.p03ApprovedEvidenceReferencesRequired,
    true,
  );
});

test("GCTX-P04 blocks exact and near duplicates without waiver", () => {
  const assessment = defs.nearDuplicateAssessmentEntry;
  const exactRule = assessment.allOf.find((rule) => (
    rule.if?.properties?.classification?.const === "exact_semantic_duplicate"
  ));
  const nearRule = assessment.allOf.find((rule) => (
    rule.if?.properties?.classification?.const === "near_duplicate"
  ));
  const sameFamilyRule = assessment.allOf.find((rule) => (
    rule.if?.properties?.classification?.const === "same_family_distinct_chain"
  ));

  assert.equal(exactRule.then.properties.totalSimilarityScore.const, 100);
  assert.equal(exactRule.then.properties.exactIdentityCollision.const, true);
  assert.equal(exactRule.then.properties.countsAsDistinctApprovedChain.const, false);
  assert.equal(exactRule.then.properties.blocking.const, true);

  assert.equal(nearRule.then.properties.countsAsDistinctApprovedChain.const, false);
  assert.equal(nearRule.then.properties.countsAsDistinctSemanticFamily.const, false);
  assert.equal(nearRule.then.properties.blocking.const, true);

  assert.equal(sameFamilyRule.then.properties.countsAsDistinctApprovedChain.const, true);
  assert.equal(sameFamilyRule.then.properties.countsAsDistinctSemanticFamily.const, false);
  assert.equal(sameFamilyRule.then.properties.blocking.const, false);

  assert.equal(defs.assessmentReview.properties.humanConfirmed.const, true);
  assert.equal(defs.assessmentReview.properties.nearDuplicateWaiverAllowed.const, false);
  assert.equal(contract.pairwiseAssessmentContract.humanConfirmationRequired, true);
  assert.equal(contract.pairwiseAssessmentContract.nearDuplicateWaiverAllowed, false);
});

test("GCTX-P04 semantic families require material structural changes", () => {
  assert.deepEqual(contract.semanticFamilyIdentity.dimensions, [
    "archetype_id",
    "goal_class_signature",
    "milestone_pattern_signature",
    "decision_model_class",
    "terminal_deliverable_class",
    "mathematical_composition_class",
  ]);
  assert.equal(contract.semanticFamilyIdentity.newFamilyRequiresMaterialDimensionChanges, 2);
  assert.equal(contract.semanticFamilyIdentity.archetypeChangeRequiresAdditionalFamilyDimensionChange, true);
  assert.equal(contract.semanticFamilyIdentity.contextDomainChangeAloneCreatesNewFamily, false);
  assert.equal(contract.semanticFamilyIdentity.surfaceVariationCreatesNewFamily, false);
  assert.equal(contract.semanticFamilyIdentity.numericVariationCreatesNewFamily, false);

  const family = defs.pblSemanticFamilyEntry;
  assert.ok(family.required.includes("goalClassSignature"));
  assert.ok(family.required.includes("milestonePatternSignature"));
  assert.ok(family.required.includes("decisionModelClass"));
  assert.ok(family.required.includes("terminalDeliverableClass"));
  assert.ok(family.required.includes("mathematicalCompositionClass"));
});

test("GCTX-P04 separates semantic breadth from surface and numeric capacity", () => {
  const counting = defs.metricCountingPolicy.properties;
  assert.equal(counting.theoreticalCombinationCountIsProductionMetric.const, false);
  assert.equal(counting.surfaceVariantCountCountsAsApprovedChain.const, false);
  assert.equal(counting.numericInstanceCapacityCountsAsApprovedChain.const, false);
  assert.equal(counting.contextDomainChangeAloneCountsAsApprovedChain.const, false);
  assert.equal(counting.approvedChainRequiresDistinctFingerprint.const, true);
  assert.equal(counting.nearDuplicatesCountTowardBreadth.const, false);

  assert.equal(contract.metricCountingContract.theoreticalCombinationCountIsProductionMetric, false);
  assert.equal(contract.metricCountingContract.surfaceVariantCountCountsAsApprovedChain, false);
  assert.equal(contract.metricCountingContract.numericInstanceCapacityCountsAsApprovedChain, false);
  assert.equal(contract.metricCountingContract.nearDuplicateCountsTowardBreadth, false);
  assert.equal(contract.metricCountingContract.approvedChainRequiresDistinctFingerprint, true);
});

test("GCTX-P04 locks per-unit breadth floors and the nonblocking target band", () => {
  assert.deepEqual(contract.perUnitBreadthGate, {
    minimumArchetypeCount: 4,
    minimumSemanticFamilyCount: 12,
    minimumApprovedChainCount: 20,
    targetApprovedChainMinimum: 30,
    targetApprovedChainMaximum: 40,
    minimumContextDomainCount: 3,
    minimumEventFlowSignatureCount: 4,
    minimumDecisionModelCount: 3,
    maximumNearDuplicateRate: 0.2,
    allApprovedChainsFingerprintUnique: true,
    targetBandReachedIsBlocking: false,
    minimumFloorPassIsBlocking: true,
  });

  const thresholds = defs.breadthGateThresholds.properties;
  assert.equal(thresholds.minimumArchetypeCount.const, 4);
  assert.equal(thresholds.minimumSemanticFamilyCount.const, 12);
  assert.equal(thresholds.minimumApprovedChainCount.const, 20);
  assert.equal(thresholds.targetApprovedChainMinimum.const, 30);
  assert.equal(thresholds.targetApprovedChainMaximum.const, 40);
  assert.equal(thresholds.minimumContextDomainCount.const, 3);
  assert.equal(thresholds.minimumEventFlowSignatureCount.const, 4);
  assert.equal(thresholds.minimumDecisionModelCount.const, 3);
  assert.equal(thresholds.maximumNearDuplicateRate.const, 0.2);

  const approvedRule = defs.unitBreadthProfileEntry.allOf[0];
  assert.equal(approvedRule.then.properties.productionEligible.const, true);
  assert.equal(
    approvedRule.then.properties.gateResults.properties.approvedChainFloorPass.const,
    true,
  );
  assert.equal(
    approvedRule.then.properties.gateResults.properties.allApprovedChainsFingerprintUnique.const,
    true,
  );
  assert.equal(approvedRule.else.properties.productionEligible.const, false);
});

test("GCTX-P04 measures cross-domain coverage separately from chain breadth", () => {
  assert.deepEqual(contract.crossDomainCoverageContract.availableDomains, [
    "daily_life",
    "sdg",
    "natural_science",
    "social_studies",
    "history",
  ]);
  assert.equal(contract.crossDomainCoverageContract.minimumCoveredDomainsPerProductionUnit, 3);
  assert.equal(contract.crossDomainCoverageContract.sameChainRecontextualizedAcrossDomainsCountsOnce, true);
  assert.equal(contract.crossDomainCoverageContract.domainCoverageMeasuredSeparatelyFromChainBreadth, true);
  assert.equal(contract.crossDomainCoverageContract.domainLabelChangeMayIncreaseDomainCoverage, true);
  assert.equal(contract.crossDomainCoverageContract.domainLabelChangeMayIncreaseChainCount, false);
});

test("GCTX-P04 reserves blocking codes and preserves P05/P06/runtime boundaries", () => {
  assert.deepEqual(contract.blockingCodesReserved, blockingCodes);
  assert.ok(contract.forbiddenBehavior.includes("count_numeric_variants_as_new_chains"));
  assert.ok(contract.forbiddenBehavior.includes("count_surface_variants_as_new_chains"));
  assert.ok(contract.forbiddenBehavior.includes("approve_near_duplicate_with_waiver"));
  assert.ok(contract.forbiddenBehavior.includes("use_theoretical_combination_count_as_breadth"));
  assert.ok(contract.forbiddenBehavior.includes("change_p02_chain_closure"));
  assert.ok(contract.forbiddenBehavior.includes("use_unapproved_p03_evidence"));

  assert.deepEqual(contract.deferredToP05, [
    "representativeArchetypeFixtures",
    "representativeSemanticFamilyFixtures",
    "positiveDistinctChainPairs",
    "negativeSurfaceReskinPairs",
    "negativeNearDuplicatePairs",
    "unitBreadthProfileFixture",
  ]);
  assert.deepEqual(contract.deferredToP06, [
    "fingerprintValidatorImplementationContract",
    "nearDuplicateClassifierValidatorContract",
    "breadthGateValidatorContract",
    "blockingCodeExecutionContract",
  ]);

  assert.equal(contract.compatibilityContract.p02ClosureAuthorityUnchanged, true);
  assert.equal(contract.compatibilityContract.p03EvidenceAuthorityUnchanged, true);
  assert.equal(contract.compatibilityContract.existingPatternSpecAuthorityUnchanged, true);
  assert.equal(contract.compatibilityContract.existingUnitRuntimeUnchanged, true);
  assert.equal(contract.compatibilityContract.g5aU02FilesMayBeModified, false);
  assert.equal(contract.nextTask, "GCTX-P05_RepresentativePositiveNegativeFixtureCorpus");
});
