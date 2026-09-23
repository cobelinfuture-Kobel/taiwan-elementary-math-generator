import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDirectory, "../..");

const schema = JSON.parse(readFileSync(path.join(
  repoRoot,
  "data/curriculum/context/schemas/GCTX_SourceEvidenceGovernance.schema.json",
), "utf8"));
const contract = JSON.parse(readFileSync(path.join(
  repoRoot,
  "data/curriculum/contracts/GCTX_P03_SourceMiningCommonKnowledgeAndEvidenceGovernanceContract.json",
), "utf8"));
const p00 = JSON.parse(readFileSync(path.join(
  repoRoot,
  "data/curriculum/contracts/GCTX_P00_GlobalOwnershipScopeAndRuleVersioningContract.json",
), "utf8"));
const p02 = JSON.parse(readFileSync(path.join(
  repoRoot,
  "data/curriculum/contracts/GCTX_P02_ScenarioChainBoundedPBLAndCompleteProjectionContract.json",
), "utf8"));

const defs = schema.$defs;

const expectedAuthorityTiers = Object.freeze([
  "official_public_authority",
  "museum_library_university",
  "education_or_science_institution",
  "trusted_reference",
  "discovery_only",
  "disallowed",
]);

const expectedBlockingCodes = Object.freeze([
  "GCTX_SOURCE_NOT_ADMITTED",
  "GCTX_SOURCE_USE_NOT_PERMITTED",
  "GCTX_DISCOVERY_RECORD_NOT_EVIDENCE",
  "GCTX_EVIDENCE_REFERENCE_MISSING",
  "GCTX_SPECIFIC_CLAIM_REFERENCE_COUNT_INSUFFICIENT",
  "GCTX_EVIDENCE_REVIEW_MISSING",
  "GCTX_OCR_ONLY_PROMOTION_FORBIDDEN",
  "GCTX_VISUAL_SOURCE_HUMAN_REVIEW_MISSING",
  "GCTX_AI_SELF_APPROVAL_FORBIDDEN",
  "GCTX_EVIDENCE_EXPIRED",
  "GCTX_EVIDENCE_DISPUTED",
  "GCTX_EVIDENCE_CONTRADICTION_UNRESOLVED",
  "GCTX_EXACT_CLAIM_NOT_SOURCE_BOUND",
  "GCTX_EXACT_VALUE_MUTATION_FORBIDDEN",
  "GCTX_AUTHENTIC_PROBLEM_VERBATIM_COPY_FORBIDDEN",
  "GCTX_RUNTIME_WEB_SEARCH_FORBIDDEN",
  "GCTX_UNAPPROVED_EVIDENCE_FALLBACK_FORBIDDEN",
  "GCTX_EVIDENCE_MATH_AUTHORITY_VIOLATION",
  "GCTX_CONSUMER_TRACEABILITY_MISSING",
]);

test("GCTX-P03 follows merged P00/P02 authority and remains governance-only", () => {
  assert.equal(contract.task, "GCTX-P03_SourceMiningCommonKnowledgeAndEvidenceGovernance");
  assert.match(contract.status, /^governance_locked_/);
  assert.equal(contract.rulesetVersion, p00.rulesetVersioning.currentPlannedVersion);
  assert.equal(defs.registryEnvelope.properties.rulesetVersion.const, "0.1.0");
  assert.equal(p02.nextTask, contract.task);

  assert.equal(contract.scope.schemaAndContractOnly, true);
  assert.equal(contract.scope.sourceCorpusMaterialized, false);
  assert.equal(contract.scope.commonKnowledgeSeedMaterialized, false);
  assert.equal(contract.scope.authenticProblemSeedMaterialized, false);
  assert.equal(contract.scope.runtimeBehaviorChange, false);
  assert.equal(contract.scope.unitMigrationChange, false);
  assert.equal(contract.scope.semanticBreadthImplemented, false);
  assert.equal(contract.scope.rendererImplementationChange, false);
});

test("GCTX-P03 registry envelope contains governance, discovery, evidence and lifecycle registries", () => {
  assert.deepEqual(defs.registryEnvelope.required, [
    "schemaVersion",
    "rulesetVersion",
    "governancePolicy",
    "sourceAuthorities",
    "discoveryRecords",
    "commonKnowledgeEvidence",
    "authenticProblemEvidence",
    "verificationEvents",
  ]);
  assert.equal(
    defs.registryEnvelope.properties.schemaVersion.const,
    "gctx-source-evidence-governance-v1",
  );
  assert.ok(defs.registryEnvelope.properties.sourceAuthorities);
  assert.ok(defs.registryEnvelope.properties.discoveryRecords);
  assert.ok(defs.registryEnvelope.properties.commonKnowledgeEvidence);
  assert.ok(defs.registryEnvelope.properties.authenticProblemEvidence);
  assert.ok(defs.registryEnvelope.properties.verificationEvents);
});

test("GCTX-P03 separates design-time discovery from admissible evidence", () => {
  const discovery = defs.discoveryRecordEntry;
  assert.equal(discovery.properties.runtimeDiscovered.const, false);
  assert.equal(discovery.properties.admissibleEvidence.const, false);
  assert.equal(discovery.properties.requiresAdmissionReview.const, true);
  assert.ok(discovery.properties.discoveryMethod.enum.includes("design_time_web_search"));
  assert.ok(discovery.properties.discoveryMethod.enum.includes("operator_upload"));

  assert.equal(contract.sourceDiscoveryBoundary.designTimeOnly, true);
  assert.equal(contract.sourceDiscoveryBoundary.runtimeWebSearchAllowed, false);
  assert.equal(contract.sourceDiscoveryBoundary.runtimeSourceDiscoveryAllowed, false);
  assert.equal(contract.sourceDiscoveryBoundary.discoveryRecordIsAdmissibleEvidence, false);
  assert.equal(contract.sourceDiscoveryBoundary.admissionReviewRequiredAfterDiscovery, true);
});

test("GCTX-P03 locks source-authority tiers and disallows discovery-only production authority", () => {
  assert.deepEqual(defs.sourceAuthorityTier.enum, expectedAuthorityTiers);
  assert.deepEqual(contract.sourceAuthorityTiers, expectedAuthorityTiers);

  const authority = defs.sourceAuthorityEntry;
  for (const field of [
    "sourceAuthorityId",
    "authorityTier",
    "permittedEvidenceKinds",
    "permittedUses",
    "approvedDomains",
    "admissionStatus",
    "reviewedAt",
    "lifecycleStatus",
  ]) {
    assert.ok(authority.required.includes(field), `source authority missing ${field}`);
  }

  assert.equal(contract.sourceAdmissionContract.discoveryOnlyMaySolelySupportApprovedEvidence, false);
  assert.equal(contract.sourceAdmissionContract.disallowedSourceMaySupportAnyEvidence, false);
  assert.equal(contract.sourceAdmissionContract.suspendedSourceMaySupportNewApproval, false);
});

test("GCTX-P03 requires human review and forbids OCR-only or AI-only promotion", () => {
  const review = defs.reviewAuthority;
  assert.equal(review.properties.aiSoleReviewer.const, false);
  assert.equal(review.properties.ocrSoleEvidence.const, false);
  assert.equal(review.properties.humanReviewRequired.const, true);
  assert.ok(review.properties.reviewMethod.enum.includes("operator_visual_review"));
  assert.ok(review.properties.reviewMethod.enum.includes("ocr_assisted_human_review"));

  const policy = defs.governancePolicy.properties;
  assert.equal(policy.aiMaySelfApproveEvidence.const, false);
  assert.equal(policy.ocrMayEstablishSourceBackedEvidence.const, false);
  assert.equal(policy.ocrDraftRequiresHumanReview.const, true);
  assert.equal(policy.visualPdfRequiresOperatorVisualReview.const, true);

  assert.equal(contract.humanVerificationAuthority.aiMayPromoteCandidateToVerified, false);
  assert.equal(contract.humanVerificationAuthority.ocrMayEstablishVerifiedEvidence, false);
  assert.equal(contract.humanVerificationAuthority.ocrMayCreateDraftCandidate, true);
  assert.equal(contract.humanVerificationAuthority.automatedApprovalAllowed, false);
});

test("GCTX-P03 defines common-knowledge reference and exact-claim boundaries", () => {
  const evidence = defs.commonKnowledgeEvidenceEntry;
  assert.equal(evidence.properties.references.minItems, 1);
  assert.ok(evidence.required.includes("reviewAuthority"));
  assert.ok(evidence.required.includes("freshnessPolicy"));
  assert.ok(evidence.required.includes("contradictionState"));
  assert.ok(evidence.required.includes("consumerTraceability"));

  const specificRule = evidence.allOf.find((rule) => (
    rule.if?.properties?.claimScope?.const === "specific_species_region_era_or_institution"
  ));
  assert.equal(specificRule.then.properties.references.minItems, 2);

  const exactRule = evidence.allOf.find((rule) => (
    rule.if?.properties?.claimScope?.const === "exact_fact_or_statistic"
  ));
  assert.equal(
    exactRule.then.properties.exactClaimPolicy.properties.sourceBound.const,
    true,
  );
  assert.equal(
    exactRule.then.properties.exactClaimPolicy.properties.valueMutationAllowed.const,
    false,
  );
  assert.equal(
    exactRule.then.properties.exerciseNumbersPolicy.const,
    "source_bound_exact_values_only",
  );

  assert.equal(
    contract.commonKnowledgeEvidenceContract.generalCommonKnowledgeMinimumAdmissibleReferences,
    1,
  );
  assert.equal(
    contract.commonKnowledgeEvidenceContract
      .specificSpeciesRegionEraInstitutionMinimumIndependentReferences,
    2,
  );
  assert.equal(contract.commonKnowledgeEvidenceContract.exactClaimMustBeSourceBound, true);
  assert.equal(contract.commonKnowledgeEvidenceContract.exactValueMutationAllowed, false);
  assert.equal(contract.commonKnowledgeEvidenceContract.evidenceMayOwnUnitMathematics, false);
});

test("GCTX-P03 authentic-problem evidence extracts structure without approving or copying a PBL", () => {
  const structure = defs.projectStructureExtraction;
  assert.equal(structure.properties.requiredMilestoneFunctions.minItems, 2);
  assert.equal(structure.properties.eventFlowSummaryZh.minItems, 1);
  assert.equal(structure.properties.decisionCriteriaSummaryZh.minItems, 1);
  assert.equal(structure.properties.originalWordingReuseAllowed.const, false);
  assert.equal(structure.properties.extractionIsApprovedPblChain.const, false);

  const copyright = defs.authenticProblemEvidenceEntry.properties.copyrightUsePolicy.properties;
  assert.equal(copyright.structureOnlyParaphrase.const, true);
  assert.equal(copyright.fullPromptCopyAllowed.const, false);
  assert.equal(copyright.answerKeyCopyAllowed.const, false);
  assert.equal(copyright.sourceAttributionRequired.const, true);

  assert.equal(contract.authenticProblemEvidenceContract.sourceEvidenceIsApprovedPblChain, false);
  assert.equal(contract.authenticProblemEvidenceContract.sourceEvidenceMayDirectlyPopulateRuntime, false);
  assert.equal(contract.authenticProblemEvidenceContract.verbatimProblemReuseAllowed, false);
  assert.equal(contract.authenticProblemEvidenceContract.structureOnlyParaphraseRequired, true);
});

test("GCTX-P03 requires freshness, expiry and contradiction governance", () => {
  const freshness = defs.freshnessPolicy;
  assert.deepEqual(freshness.properties.freshnessClass.enum, [
    "stable",
    "slow_changing",
    "time_bounded",
    "rapidly_changing",
  ]);
  assert.equal(freshness.properties.autoApproveOnRefresh.const, false);
  assert.ok(freshness.required.includes("reviewDueAt"));
  assert.ok(freshness.required.includes("validUntil"));

  const contradiction = defs.contradictionState;
  assert.deepEqual(contradiction.properties.status.enum, ["none", "unresolved", "resolved"]);
  const unresolvedRule = contradiction.allOf.find((rule) => (
    rule.if?.properties?.status?.const === "unresolved"
  ));
  assert.equal(unresolvedRule.then.properties.conflictingReferenceIds.minItems, 2);
  assert.equal(unresolvedRule.then.properties.resolutionNote.type, "null");

  assert.equal(contract.freshnessContract.expiredEvidenceProductionAdmissible, false);
  assert.equal(contract.freshnessContract.expiredEvidenceRequiresReverification, true);
  assert.equal(contract.contradictionContract.unresolvedContradictionProductionAdmissible, false);
  assert.equal(contract.contradictionContract.resolvedEvidenceRequiresHumanDecision, true);
});

test("GCTX-P03 approval is blocking and traceable to approved consumers", () => {
  const evidence = defs.commonKnowledgeEvidenceEntry;
  const approvalRule = evidence.allOf.find((rule) => (
    rule.if?.properties?.lifecycleStatus?.const === "approved"
  ));
  assert.equal(approvalRule.then.properties.productionAdmissible.const, true);
  assert.deepEqual(
    approvalRule.then.properties.contradictionState.properties.status.enum,
    ["none", "resolved"],
  );
  assert.equal(approvalRule.else.properties.productionAdmissible.const, false);

  assert.deepEqual(defs.consumerTraceability.properties.consumerType.enum, [
    "common_knowledge_asset",
    "context_family",
    "approved_semantic_binding",
    "scenario_chain",
    "bounded_pbl_chain",
  ]);
  assert.equal(contract.productionAdmissionContract.consumerTraceabilityRequiredWhenUsed, true);
  assert.equal(contract.traceabilityContract.consumerMayReferenceOnlyApprovedEvidence, true);
  assert.equal(contract.traceabilityContract.deprecatedOrExpiredEvidenceRequiresImpactAudit, true);
});

test("GCTX-P03 reserves blocking codes and preserves the P04/runtime boundary", () => {
  assert.deepEqual(contract.blockingCodesReserved, expectedBlockingCodes);
  assert.ok(contract.forbiddenBehavior.includes("runtime_web_search"));
  assert.ok(contract.forbiddenBehavior.includes("ai_self_approval"));
  assert.ok(contract.forbiddenBehavior.includes("ocr_only_verified_promotion"));
  assert.ok(contract.forbiddenBehavior.includes("source_evidence_changing_unit_math"));

  assert.deepEqual(contract.deferredToP04, [
    "pblSemanticFingerprint",
    "nearDuplicateDetection",
    "semanticFamilyRegistry",
    "perUnitSemanticBreadthGate",
    "crossDomainCoverageGate",
  ]);
  assert.equal(contract.compatibilityContract.existingKnowledgePointAuthorityUnchanged, true);
  assert.equal(contract.compatibilityContract.existingPatternSpecAuthorityUnchanged, true);
  assert.equal(contract.compatibilityContract.existingMathValidatorAuthorityUnchanged, true);
  assert.equal(contract.compatibilityContract.p01ApprovedSemanticBindingAuthorityUnchanged, true);
  assert.equal(contract.compatibilityContract.p02ScenarioClosureAuthorityUnchanged, true);
  assert.equal(contract.compatibilityContract.g5aU02FilesMayBeModified, false);
  assert.equal(
    contract.nextTask,
    "GCTX-P04_PBLSemanticBreadthFingerprintAndNearDuplicateContract",
  );
});
