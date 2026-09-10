import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import { getR04KnowledgePointCapabilityMapping } from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const preflight = JSON.parse(readFileSync(
  new URL("../../data/curriculum/full-product/p05f/q020-g5b-u03-container-volume-capacity-distinction-source-authority-preflight.json", import.meta.url),
  "utf8",
));
const r02Chunk = JSON.parse(readFileSync(
  new URL("../../data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-04.json", import.meta.url),
  "utf8",
));
const mappingPolicy = JSON.parse(readFileSync(
  new URL("../../data/curriculum/global/runtime/r04/runtime-capability-mapping-policy.json", import.meta.url),
  "utf8",
));

const EXPECTED_KP = "kp_g5b_u03_container_volume_capacity_distinction";
const EXPECTED_CAPS = [
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_formula_evaluation",
  "cap_geometry_property_reasoning",
];
const EXCLUDED_SIBLINGS = [
  "kp_g5b_u03_ml_cm3_equivalence",
  "kp_g5b_u03_l_dm3_equivalence",
  "kp_g5b_u03_capacity_volume_conversion",
  "kp_g5b_u03_container_fill_displacement",
];

test("P05F W5 Q020 frozen queue identity is exact and Q019 predecessor is E6 D0 complete", () => {
  const queue = materializeP05EW5DirectProductVerticalSliceQueue();
  const slice = queue.queueEntries[19];

  assert.equal(queue.queueFrozen, true);
  assert.equal(queue.queueRegistry.queueDigest, "a4dae65a1a907ba963a135fce84ba292b8486a12513ae8f1fa54fbf07a6598ae");
  assert.equal(slice.queuePosition, 20);
  assert.equal(slice.sliceId, "p05e_q020_r1_g5b_u03_5b03_profile_geometry_formula_c1");
  assert.equal(slice.implementationTaskId, "P05F_W5DirectProductVerticalSlice020Implementation");
  assert.equal(slice.previousSliceId, "p05e_q019_r1_g5b_u01_5b01_profile_geometry_formula_c1");
  assert.equal(slice.previousSliceMustBeD0Complete, true);
  assert.equal(slice.primarySourceNodeId, "g5b_u03_5b03");
  assert.equal(slice.intraWavePrerequisiteRank, 1);
  assert.equal(slice.primaryRuntimeProfileId, "profile_geometry_formula");
  assert.equal(slice.knowledgePointCount, 1);
  assert.deepEqual(slice.knowledgePointIds, [EXPECTED_KP]);
  assert.deepEqual(slice.requiredW5CapabilityIds, EXPECTED_CAPS);
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds, [EXPECTED_KP]);
  assert.deepEqual(preflight.queueAuthority.requiredW5CapabilityIds, EXPECTED_CAPS);

  const predecessor = preflight.previousSliceD0Evidence;
  assert.equal(predecessor.sliceId, "p05e_q019_r1_g5b_u01_5b01_profile_geometry_formula_c1");
  assert.equal(predecessor.productPrNumber, 868);
  assert.equal(predecessor.productMergeSha, "22435f3d2e1a33d6ba29fe0e381d410544464a5d");
  assert.equal(predecessor.prGateRunId, "34432564630");
  assert.equal(predecessor.pagesDeploymentRunId, "34432716590");
  assert.equal(predecessor.exactPagesRunId, "34432716637");
  assert.equal(predecessor.evidenceArtifactId, "10135081241");
  assert.equal(predecessor.evidenceArtifactDigest, "sha256:de1eba3ae09759c4a626d0f2a372d0fa37137cae82f807a4e1c0fb52b05947db");
  assert.equal(predecessor.status, "PASS_E6_D0_COMPLETE");
  assert.equal(predecessor.exactPagesMachineStatus, "PASS_E6_D0_COMPLETE");
  assert.equal(predecessor.exactDeployedBytesVerified, true);
});

test("P05F W5 Q020 locks the current Drive source identity without inventing unavailable metadata authority", () => {
  const source = preflight.sourceAuthority;
  assert.equal(preflight.status, "PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(source.sourceNodeId, "g5b_u03_5b03");
  assert.equal(source.sourceTitle, "容積和容量");
  assert.equal(source.sourcePdfTitle, "meow911_5b03_source.pdf");
  assert.equal(source.sourcePdfDriveFileId, "1k87iKFmra0RQ17__kXRPwuPbezKvtiPG");
  assert.equal(source.sourceUrl, "https://meow911.com/5b03/");
  assert.equal(source.pageCount, 2);
  assert.equal(source.reviewMethod, "R02_REVIEWED_SOURCE_PAGES_PLUS_DRIVE_IDENTITY_READBACK");
  assert.deepEqual(source.reviewedPages, [1, 2]);
  assert.equal(source.sourceIdentityCrossCheck.queueSourceNodeId, "g5b_u03_5b03");
  assert.equal(source.sourceIdentityCrossCheck.r02SourceNodeId, "g5b_u03_5b03");
  assert.equal(source.sourceIdentityCrossCheck.sourceRefAmbiguity, false);
  assert.equal(source.sourceIdentityCrossCheck.disposition, "MATCHING_QUEUE_R02_AND_DRIVE_SOURCE_IDENTITY");
  assert.equal("sourceMetadataDriveFileId" in source, false);
  assert.equal("verificationNotesDriveFileId" in source, false);
});

test("P05F W5 Q020 locks the exact R02 container-volume-capacity candidate and excludes all same-source siblings", () => {
  const source = r02Chunk.sourceRecords.find((row) => row.sourceNodeId === "g5b_u03_5b03");
  assert.ok(source);
  assert.equal(source.sourceTitle, "容積和容量");
  assert.equal(source.sourcePdfTitle, "meow911_5b03_source.pdf");
  assert.deepEqual(source.reviewedPages, [1, 2]);

  const candidate = source.candidates.find((row) => row.knowledgePointId === EXPECTED_KP);
  assert.ok(candidate);
  assert.equal(candidate.canonicalNameZh, "容積與容量辨識");
  assert.equal(candidate.capabilityStatement, "學生能區分容器內部空間的容積與可容納液體量。");
  assert.equal(candidate.reasoningInvariant, "容積是內部空間大小，容量是可裝入的量，兩者依單位等價連結。");
  assert.equal(candidate.category, "measurement");
  assert.deepEqual(candidate.evidencePages, [1, 2]);
  assert.equal(candidate.applicationSuitability, "APPLICATION_COMPATIBLE");

  const locked = preflight.r02ReviewedCandidateAuthority;
  assert.equal(locked.knowledgePointId, candidate.knowledgePointId);
  assert.equal(locked.canonicalNameZh, candidate.canonicalNameZh);
  assert.equal(locked.capabilityStatement, candidate.capabilityStatement);
  assert.equal(locked.reasoningInvariant, candidate.reasoningInvariant);
  assert.equal(locked.category, candidate.category);
  assert.deepEqual(locked.evidencePages, candidate.evidencePages);
  assert.equal(locked.applicationSuitability, candidate.applicationSuitability);

  const sourceIds = source.candidates.map((row) => row.knowledgePointId);
  assert.equal(sourceIds.length, 5);
  for (const sibling of EXCLUDED_SIBLINGS) assert.ok(sourceIds.includes(sibling));
  assert.deepEqual(preflight.q020ScopeLock.excludedKnowledgePointIdsFromSameSource, EXCLUDED_SIBLINGS);
  assert.equal(preflight.q020ScopeLock.sameSourceSiblingSemanticsTouched, false);
});

test("P05F W5 Q020 preserves frozen/current R04 geometry-formula classification while explicitly bounding the R02 measurement-category mismatch", () => {
  const mapping = getR04KnowledgePointCapabilityMapping(EXPECTED_KP);
  assert.ok(mapping);
  assert.equal(mapping.primaryRuntimeProfileId, "profile_geometry_formula");
  assert.equal(mapping.classificationRuleId, "rule_geometry_formula");
  assert.deepEqual(mapping.appliedModifierIds, []);

  const runtime = preflight.runtimeCapabilityAuthority;
  assert.equal(runtime.profileId, "profile_geometry_formula");
  assert.deepEqual(runtime.profileRequiredCapabilityIds, [
    "cap_geometry_formula_evaluation",
    "cap_geometry_domain_validator",
    "cap_geometry_diagram_representation",
  ]);
  assert.deepEqual(runtime.perKnowledgePointMappings, [{
    knowledgePointId: EXPECTED_KP,
    classificationRuleId: "rule_geometry_formula",
    appliedModifierIds: [],
  }]);
  assert.deepEqual(runtime.unionAppliedModifierIds, []);
  assert.deepEqual(runtime.modifierAddedRequiredCapabilityIds, []);
  assert.deepEqual(runtime.dependencyClosureAddedCapabilityIds, ["cap_geometry_property_reasoning"]);
  assert.deepEqual(runtime.exactFrozenQueueRequiredW5CapabilityIds, EXPECTED_CAPS);
  assert.deepEqual(runtime.r02CandidateCategories, ["measurement"]);
  assert.equal(runtime.profileCategoryMismatchAcknowledged, true);
  assert.equal(runtime.profileCategoryMismatchDisposition, "R02_MEASUREMENT_CATEGORY_DOES_NOT_OVERRIDE_FROZEN_QUEUE_OR_CURRENT_R04_GEOMETRY_FORMULA_PROFILE");

  const geometryRule = mappingPolicy.classificationRules.find((row) => row.ruleId === "rule_geometry_formula");
  const measurementRule = mappingPolicy.classificationRules.find((row) => row.ruleId === "rule_quantity_measurement");
  assert.ok(geometryRule);
  assert.ok(measurementRule);
  assert.ok(mappingPolicy.classificationRules.indexOf(geometryRule) < mappingPolicy.classificationRules.indexOf(measurementRule));
  assert.ok(geometryRule.anyTerms.includes("volume_"));

  const modifier = mappingPolicy.modifiers.find((row) => row.modifierId === "mod_unit_conversion");
  assert.ok(modifier);
  assert.deepEqual(modifier.profileIds, ["profile_quantity_measurement", "profile_time", "profile_speed_rate"]);
  assert.equal(modifier.profileIds.includes("profile_geometry_formula"), false);
  assert.equal(runtime.modifierEligibilityObservation.q020ProfileEligible, false);
  assert.equal(runtime.modifierEligibilityObservation.disposition, "PRESERVE_CURRENT_FROZEN_R04_POLICY_NO_MODIFIER");
});

test("P05F W5 Q020 scope is distinction-only and does not absorb equivalence, compound conversion, fill/displacement, general conversion-policy, or Q021+ semantics", () => {
  assert.deepEqual(preflight.q020ScopeLock.includedKnowledgePointIds, [EXPECTED_KP]);
  for (const relation of [
    "DISTINGUISH_CONTAINER_VOLUME_FROM_CAPACITY",
    "BIND_VOLUME_TO_INTERNAL_SPACE_AND_CAPACITY_TO_CONTAINABLE_AMOUNT",
    "CONNECT_VOLUME_AND_CAPACITY_ONLY_THROUGH_SOURCE_BACKED_UNIT_EQUIVALENCE",
  ]) assert.ok(preflight.q020ScopeLock.includedRelations.includes(relation));

  for (const relation of [
    "ASSERT_ML_CM3_EQUIVALENCE_AS_TARGET_KP",
    "ASSERT_L_DM3_EQUIVALENCE_AS_TARGET_KP",
    "COMPOUND_CAPACITY_VOLUME_CONVERSION_AS_TARGET_KP",
    "CONTAINER_FILL_OR_DISPLACEMENT_AS_TARGET_KP",
    "GENERAL_UNIT_CONVERSION_FRAMEWORK_REDESIGN",
    "Q021_OR_LATER_SEMANTICS",
  ]) assert.ok(preflight.q020ScopeLock.excludedRelations.includes(relation));

  assert.equal(preflight.sourceConstraintReconciliation.sameSourceSiblingAbsorptionAllowedByThisPreflight, false);
  assert.equal(preflight.sourceConstraintReconciliation.generalUnitConversionPolicyRewriteAllowedByThisPreflight, false);
  assert.equal(preflight.sourceConstraintReconciliation.applicationImplementationAllowedByThisPreflight, false);
  assert.equal(preflight.q020ScopeLock.implementationAllowedByThisPreflight, false);
  assert.equal(preflight.q020ScopeLock.publicProductAdmissionAllowedByThisPreflight, false);
  assert.equal(preflight.q020ScopeLock.q021OrLaterTouched, false);
  assert.equal(preflight.q020ScopeLock.frozenQueueAuthorityTouched, false);
});

test("P05F W5 Q020 validation boundary remains SHARED_RUNTIME_BOUNDED and preflight stops before implementation", () => {
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
  assert.equal(decision.sourceAuthoritySufficientForQ020ImplementationPlanning, true);
  assert.equal(decision.previousSliceD0Satisfied, true);
  assert.equal(decision.runtimeCapabilityContractLocked, true);
  assert.equal(decision.singleKnowledgePointSliceLocked, true);
  assert.equal(decision.sameSourceSiblingProtectionLocked, true);
  assert.equal(decision.runtimeProfileCategoryMismatchExplicitlyBounded, true);
  assert.equal(decision.manualSourceChoiceRequired, false);
  assert.equal(decision.sourceRefAmbiguity, false);
  assert.equal(decision.nextTaskRequiresSeparateImplementationApproval, true);
  assert.equal(decision.nextTask, "P05F_W5DirectProductVerticalSlice020Implementation");
});
