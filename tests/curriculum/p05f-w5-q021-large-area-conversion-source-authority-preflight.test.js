import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import { getR04KnowledgePointCapabilityMapping } from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const preflight = JSON.parse(readFileSync(
  new URL("../../data/curriculum/full-product/p05f/q021-g5b-u10a-large-area-conversion-source-authority-preflight.json", import.meta.url),
  "utf8",
));
const r02Chunk = JSON.parse(readFileSync(
  new URL("../../data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-05.json", import.meta.url),
  "utf8",
));
const mappingPolicy = JSON.parse(readFileSync(
  new URL("../../data/curriculum/global/runtime/r04/runtime-capability-mapping-policy.json", import.meta.url),
  "utf8",
));

const SOURCE = "g5b_u10_5b10a";
const HECTARE_M2 = "kp_g5b_u10a_hectare_square_meter_conversion";
const KM2_HECTARE = "kp_g5b_u10a_square_kilometer_hectare_conversion";
const TARGETS = [HECTARE_M2, KM2_HECTARE];
const EXPECTED_CAPS = [
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_formula_evaluation",
  "cap_geometry_property_reasoning",
];
const EXCLUDED_SIBLINGS = [
  "kp_g5b_u10a_large_area_unit_identity",
  "kp_g5b_u10a_metric_ton_kilogram_conversion",
  "kp_g5b_u10a_large_unit_estimation_application",
];

test("P05F W5 Q021 frozen queue identity is exact and Q020 predecessor is E6 D0 complete", () => {
  const queue = materializeP05EW5DirectProductVerticalSliceQueue();
  const slice = queue.queueEntries[20];

  assert.equal(queue.queueFrozen, true);
  assert.equal(queue.queueRegistry.queueDigest, "a4dae65a1a907ba963a135fce84ba292b8486a12513ae8f1fa54fbf07a6598ae");
  assert.equal(slice.queuePosition, 21);
  assert.equal(slice.sliceId, "p05e_q021_r1_g5b_u10_5b10a_profile_geometry_formula_c1");
  assert.equal(slice.implementationTaskId, "P05F_W5DirectProductVerticalSlice021Implementation");
  assert.equal(slice.previousSliceId, "p05e_q020_r1_g5b_u03_5b03_profile_geometry_formula_c1");
  assert.equal(slice.previousSliceMustBeD0Complete, true);
  assert.equal(slice.primarySourceNodeId, SOURCE);
  assert.equal(slice.intraWavePrerequisiteRank, 1);
  assert.equal(slice.primaryRuntimeProfileId, "profile_geometry_formula");
  assert.equal(slice.knowledgePointCount, 2);
  assert.deepEqual(slice.knowledgePointIds, TARGETS);
  assert.deepEqual(slice.requiredW5CapabilityIds, EXPECTED_CAPS);
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds, TARGETS);
  assert.deepEqual(preflight.queueAuthority.requiredW5CapabilityIds, EXPECTED_CAPS);

  const predecessor = preflight.previousSliceD0Evidence;
  assert.equal(predecessor.sliceId, "p05e_q020_r1_g5b_u03_5b03_profile_geometry_formula_c1");
  assert.equal(predecessor.productPrNumber, 870);
  assert.equal(predecessor.productMergeSha, "1577f468c50ef1e0a11e099782391ba06bbead9a");
  assert.equal(predecessor.prGateRunId, "34440190133");
  assert.equal(predecessor.pagesDeploymentRunId, "34440304100");
  assert.equal(predecessor.exactPagesRunId, "34440304139");
  assert.equal(predecessor.evidenceArtifactId, "10137701415");
  assert.equal(predecessor.evidenceArtifactDigest, "sha256:c7b7efb531e2e0d9dd1bdc4b7c696eca2d33c0b19bc69eb46d3a9f7637ddaeb5");
  assert.equal(predecessor.status, "PASS_E6_D0_COMPLETE");
  assert.equal(predecessor.exactPagesWorkflowConclusion, "success");
  assert.equal(predecessor.exactPagesEvidenceUploaded, true);
});

test("P05F W5 Q021 locks the exact Drive/R02 source identity without source-ref ambiguity", () => {
  const source = preflight.sourceAuthority;
  assert.equal(preflight.status, "PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(source.sourceNodeId, SOURCE);
  assert.equal(source.sourceTitle, "生活中的大單位");
  assert.equal(source.sourcePdfTitle, "meow911_5b10a_source.pdf");
  assert.equal(source.sourcePdfDriveFileId, "1pCtllVtZRsUAO4WFCqJlgMOMk_QNA5X8");
  assert.equal(source.sourceUrl, "https://meow911.com/5b10a/");
  assert.equal(source.pageCount, 1);
  assert.equal(source.reviewMethod, "R02_REVIEWED_SOURCE_PAGES_PLUS_DRIVE_IDENTITY_READBACK");
  assert.deepEqual(source.reviewedPages, [1]);
  assert.equal(source.sourceIdentityCrossCheck.queueSourceNodeId, SOURCE);
  assert.equal(source.sourceIdentityCrossCheck.r02SourceNodeId, SOURCE);
  assert.equal(source.sourceIdentityCrossCheck.sourceRefAmbiguity, false);
  assert.equal(source.sourceIdentityCrossCheck.disposition, "MATCHING_QUEUE_R02_AND_DRIVE_SOURCE_IDENTITY");
});

test("P05F W5 Q021 locks exactly the two R02 large-area conversion candidates and excludes same-source siblings", () => {
  const source = r02Chunk.sourceRecords.find((row) => row.sourceNodeId === SOURCE);
  assert.ok(source);
  assert.equal(source.sourceTitle, "生活中的大單位");
  assert.equal(source.sourcePdfTitle, "meow911_5b10a_source.pdf");
  assert.deepEqual(source.reviewedPages, [1]);
  assert.equal(source.candidates.length, 5);

  const authorityById = new Map(
    preflight.r02ReviewedCandidateAuthority.knowledgePoints.map((entry) => [entry.knowledgePointId, entry]),
  );
  assert.deepEqual([...authorityById.keys()], TARGETS);

  for (const kpId of TARGETS) {
    const candidate = source.candidates.find((row) => row.knowledgePointId === kpId);
    const authority = authorityById.get(kpId);
    assert.ok(candidate, `R02 candidate missing ${kpId}`);
    assert.ok(authority, `Q021 authority missing ${kpId}`);
    assert.equal(authority.canonicalNameZh, candidate.canonicalNameZh);
    assert.equal(authority.capabilityStatement, candidate.capabilityStatement);
    assert.equal(authority.reasoningInvariant, candidate.reasoningInvariant);
    assert.equal(authority.category, candidate.category);
    assert.deepEqual(authority.evidencePages, candidate.evidencePages);
    assert.equal(authority.applicationSuitability, candidate.applicationSuitability);
  }

  const sourceIds = source.candidates.map((row) => row.knowledgePointId);
  for (const sibling of EXCLUDED_SIBLINGS) assert.ok(sourceIds.includes(sibling));
  assert.deepEqual(preflight.q021ScopeLock.excludedKnowledgePointIdsFromSameSource, EXCLUDED_SIBLINGS);
  assert.equal(preflight.q021ScopeLock.sameSourceSiblingSemanticsTouched, false);
});

test("P05F W5 Q021 preserves frozen/current R04 geometry-formula mappings for both KPs", () => {
  for (const kpId of TARGETS) {
    const mapping = getR04KnowledgePointCapabilityMapping(kpId);
    assert.ok(mapping, `R04 mapping missing ${kpId}`);
    assert.equal(mapping.primaryRuntimeProfileId, "profile_geometry_formula");
    assert.equal(mapping.classificationRuleId, "rule_geometry_formula");
    assert.deepEqual(mapping.appliedModifierIds, []);
  }

  const runtime = preflight.runtimeCapabilityAuthority;
  assert.equal(runtime.profileId, "profile_geometry_formula");
  assert.deepEqual(runtime.profileRequiredCapabilityIds, [
    "cap_geometry_formula_evaluation",
    "cap_geometry_domain_validator",
    "cap_geometry_diagram_representation",
  ]);
  assert.deepEqual(runtime.perKnowledgePointMappings, TARGETS.map((knowledgePointId) => ({
    knowledgePointId,
    classificationRuleId: "rule_geometry_formula",
    appliedModifierIds: [],
  })));
  assert.deepEqual(runtime.unionAppliedModifierIds, []);
  assert.deepEqual(runtime.modifierAddedRequiredCapabilityIds, []);
  assert.deepEqual(runtime.dependencyClosureAddedCapabilityIds, ["cap_geometry_property_reasoning"]);
  assert.deepEqual(runtime.exactFrozenQueueRequiredW5CapabilityIds, EXPECTED_CAPS);
  assert.deepEqual(runtime.r02CandidateCategories, ["measurement"]);
  assert.equal(runtime.profileCategoryMismatchAcknowledged, true);
  assert.equal(runtime.profileCategoryMismatchDisposition, "R02_MEASUREMENT_CATEGORY_DOES_NOT_OVERRIDE_FROZEN_QUEUE_OR_CURRENT_R04_GEOMETRY_FORMULA_PROFILE");

  const modifier = mappingPolicy.modifiers.find((row) => row.modifierId === "mod_unit_conversion");
  assert.ok(modifier);
  assert.deepEqual(modifier.profileIds, ["profile_quantity_measurement", "profile_time", "profile_speed_rate"]);
  assert.equal(modifier.profileIds.includes("profile_geometry_formula"), false);
  assert.equal(runtime.modifierEligibilityObservation.q021ProfileEligible, false);
  assert.equal(runtime.modifierEligibilityObservation.disposition, "PRESERVE_CURRENT_FROZEN_R04_POLICY_NO_MODIFIER");
});

test("P05F W5 Q021 scope is atomic two-KP area conversion only and does not absorb sibling or Q022+ semantics", () => {
  const scope = preflight.q021ScopeLock;
  assert.deepEqual(scope.includedKnowledgePointIds, TARGETS);
  for (const relation of [
    "CONVERT_HECTARE_AND_SQUARE_METER_BY_SOURCE_EQUIVALENCE",
    "CONVERT_SQUARE_KILOMETER_AND_HECTARE_BY_SOURCE_EQUIVALENCE",
    "PRESERVE_AREA_EQUIVALENCE_ACROSS_UNIT_REPRESENTATIONS",
  ]) assert.ok(scope.includedRelations.includes(relation));

  for (const relation of [
    "LARGE_AREA_UNIT_IDENTITY_AS_TARGET_KP",
    "METRIC_TON_KILOGRAM_CONVERSION_AS_TARGET_KP",
    "LARGE_UNIT_ESTIMATION_AS_TARGET_KP",
    "GENERAL_UNIT_CONVERSION_FRAMEWORK_REDESIGN",
    "Q022_OR_LATER_SEMANTICS",
  ]) assert.ok(scope.excludedRelations.includes(relation));

  assert.equal(preflight.sourceConstraintReconciliation.sameSourceSiblingAbsorptionAllowedByThisPreflight, false);
  assert.equal(preflight.sourceConstraintReconciliation.generalUnitConversionPolicyRewriteAllowedByThisPreflight, false);
  assert.equal(preflight.sourceConstraintReconciliation.applicationImplementationAllowedByThisPreflight, false);
  assert.equal(scope.implementationAllowedByThisPreflight, false);
  assert.equal(scope.publicProductAdmissionAllowedByThisPreflight, false);
  assert.equal(scope.q022OrLaterTouched, false);
  assert.equal(scope.frozenQueueAuthorityTouched, false);
});

test("P05F W5 Q021 validation boundary remains SHARED_RUNTIME_BOUNDED and preflight stops before implementation", () => {
  const boundary = preflight.preflightValidationBoundary;
  assert.equal(boundary.policyId, "UNIT_INCREMENTAL_VALIDATION_V1");
  assert.equal(boundary.derivedLane, "SHARED_RUNTIME_BOUNDED");
  assert.equal(boundary.focusedNodeContractRequired, true);
  assert.equal(boundary.nodeOnlyReadbackRequired, true);
  assert.equal(boundary.fullRepositoryRegressionAllowed, false);
  assert.equal(boundary.globalBrowserReplayAllowed, false);
  assert.equal(boundary.productImplementationAllowed, false);
  assert.equal(boundary.publicCutoverAllowed, false);

  const decision = preflight.preflightDecision;
  assert.equal(decision.sourceAuthoritySufficientForQ021ImplementationPlanning, true);
  assert.equal(decision.previousSliceD0Satisfied, true);
  assert.equal(decision.runtimeCapabilityContractLocked, true);
  assert.equal(decision.twoKnowledgePointSliceLocked, true);
  assert.equal(decision.sameSourceSiblingProtectionLocked, true);
  assert.equal(decision.runtimeProfileCategoryMismatchExplicitlyBounded, true);
  assert.equal(decision.manualSourceChoiceRequired, false);
  assert.equal(decision.sourceRefAmbiguity, false);
  assert.equal(decision.nextTaskRequiresSeparateImplementationApproval, true);
  assert.equal(decision.nextTask, "P05F_W5DirectProductVerticalSlice021Implementation");
});
