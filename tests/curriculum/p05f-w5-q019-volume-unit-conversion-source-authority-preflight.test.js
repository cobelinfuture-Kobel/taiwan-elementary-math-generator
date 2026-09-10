import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import { getR04KnowledgePointCapabilityMapping } from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const preflight = JSON.parse(readFileSync(
  new URL("../../data/curriculum/full-product/p05f/q019-g5b-u01-volume-unit-conversion-source-authority-preflight.json", import.meta.url),
  "utf8",
));
const r02Chunk = JSON.parse(readFileSync(
  new URL("../../data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-03.json", import.meta.url),
  "utf8",
));
const mappingPolicy = JSON.parse(readFileSync(
  new URL("../../data/curriculum/global/runtime/r04/runtime-capability-mapping-policy.json", import.meta.url),
  "utf8",
));

const EXPECTED_KP = "kp_g5b_u01_volume_unit_conversion";
const EXPECTED_CAPS = [
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_formula_evaluation",
  "cap_geometry_property_reasoning",
];
const EXCLUDED_SIBLINGS = [
  "kp_g5b_u01_rectangular_prism_volume_formula",
  "kp_g5b_u01_cube_volume_formula",
  "kp_g5b_u01_composite_rectangular_volume",
  "kp_g5b_u01_volume_unknown_dimension",
];

test("P05F W5 Q019 frozen queue identity is exact and Q018 predecessor is E6 D0 complete", () => {
  const queue = materializeP05EW5DirectProductVerticalSliceQueue();
  const slice = queue.queueEntries[18];

  assert.equal(queue.queueFrozen, true);
  assert.equal(queue.queueRegistry.queueDigest, "a4dae65a1a907ba963a135fce84ba292b8486a12513ae8f1fa54fbf07a6598ae");
  assert.equal(slice.queuePosition, 19);
  assert.equal(slice.sliceId, "p05e_q019_r1_g5b_u01_5b01_profile_geometry_formula_c1");
  assert.equal(slice.implementationTaskId, "P05F_W5DirectProductVerticalSlice019Implementation");
  assert.equal(slice.previousSliceId, "p05e_q018_r1_g5a_u10_5a10a1_profile_spatial_solid_c1");
  assert.equal(slice.previousSliceMustBeD0Complete, true);
  assert.equal(slice.primarySourceNodeId, "g5b_u01_5b01");
  assert.equal(slice.intraWavePrerequisiteRank, 1);
  assert.equal(slice.primaryRuntimeProfileId, "profile_geometry_formula");
  assert.equal(slice.knowledgePointCount, 1);
  assert.deepEqual(slice.knowledgePointIds, [EXPECTED_KP]);
  assert.deepEqual(slice.requiredW5CapabilityIds, EXPECTED_CAPS);
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds, [EXPECTED_KP]);
  assert.deepEqual(preflight.queueAuthority.requiredW5CapabilityIds, EXPECTED_CAPS);

  const predecessor = preflight.previousSliceD0Evidence;
  assert.equal(predecessor.sliceId, "p05e_q018_r1_g5a_u10_5a10a1_profile_spatial_solid_c1");
  assert.equal(predecessor.productPrNumber, 862);
  assert.equal(predecessor.productMergeSha, "bd6db262c73e1078c61f07bb896cc742eb397021");
  assert.equal(predecessor.prGateRunId, "34424464958");
  assert.equal(predecessor.pagesDeploymentRunId, "34426815467");
  assert.equal(predecessor.exactPagesRunId, "34426815557");
  assert.equal(predecessor.evidenceArtifactId, "10133004774");
  assert.equal(predecessor.evidenceArtifactDigest, "sha256:937f830c9fef96ecad55f5399cde1faa4c504ed45e662fb26872fa77beabc373");
  assert.equal(predecessor.status, "PASS_E6_D0_COMPLETE");
  assert.equal(predecessor.exactPagesMachineStatus, "PASS_E6_D0_COMPLETE");
  assert.equal(predecessor.exactDeployedBytesVerified, true);
});

test("P05F W5 Q019 locks the current Drive source identity without inventing unavailable metadata authority", () => {
  const source = preflight.sourceAuthority;
  assert.equal(preflight.status, "PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(source.sourceNodeId, "g5b_u01_5b01");
  assert.equal(source.sourceTitle, "長方體和正方體的體積");
  assert.equal(source.sourcePdfTitle, "meow911_5b01_source.pdf");
  assert.equal(source.sourcePdfDriveFileId, "1IYHtSOWSxqbjcyEi94rmMEyqtOflGQ2f");
  assert.equal(source.sourceUrl, "https://meow911.com/5b01/");
  assert.equal(source.pageCount, 2);
  assert.equal(source.reviewMethod, "R02_REVIEWED_SOURCE_PAGES_PLUS_DRIVE_IDENTITY_READBACK");
  assert.deepEqual(source.reviewedPages, [1, 2]);
  assert.equal(source.sourceIdentityCrossCheck.queueSourceNodeId, "g5b_u01_5b01");
  assert.equal(source.sourceIdentityCrossCheck.r02SourceNodeId, "g5b_u01_5b01");
  assert.equal(source.sourceIdentityCrossCheck.sourceRefAmbiguity, false);
  assert.equal(source.sourceIdentityCrossCheck.disposition, "MATCHING_QUEUE_R02_AND_DRIVE_SOURCE_IDENTITY");
  assert.equal("sourceMetadataDriveFileId" in source, false);
  assert.equal("verificationNotesDriveFileId" in source, false);
});

test("P05F W5 Q019 locks the exact R02 volume-unit-conversion candidate and excludes all same-source siblings", () => {
  const source = r02Chunk.sourceRecords.find((row) => row.sourceNodeId === "g5b_u01_5b01");
  assert.ok(source);
  assert.equal(source.sourceTitle, "長方體和正方體的體積");
  assert.equal(source.sourcePdfTitle, "meow911_5b01_source.pdf");
  assert.deepEqual(source.reviewedPages, [1, 2]);

  const candidate = source.candidates.find((row) => row.knowledgePointId === EXPECTED_KP);
  assert.ok(candidate);
  assert.equal(candidate.canonicalNameZh, "立方公分與立方公尺換算");
  assert.equal(candidate.capabilityStatement, "學生能在常用體積單位間進行等值換算。");
  assert.equal(candidate.reasoningInvariant, "單位邊長倍率須在三個維度同時作用。");
  assert.equal(candidate.category, "geometry");
  assert.deepEqual(candidate.evidencePages, [1, 2]);
  assert.equal(candidate.applicationSuitability, "APPLICATION_COMPATIBLE");

  const locked = preflight.r02ReviewedCandidateAuthority;
  assert.equal(locked.knowledgePointId, candidate.knowledgePointId);
  assert.equal(locked.canonicalNameZh, candidate.canonicalNameZh);
  assert.equal(locked.capabilityStatement, candidate.capabilityStatement);
  assert.equal(locked.reasoningInvariant, candidate.reasoningInvariant);
  assert.deepEqual(locked.evidencePages, candidate.evidencePages);
  assert.equal(locked.applicationSuitability, candidate.applicationSuitability);

  const sourceIds = source.candidates.map((row) => row.knowledgePointId);
  assert.equal(sourceIds.length, 5);
  for (const sibling of EXCLUDED_SIBLINGS) assert.ok(sourceIds.includes(sibling));
  assert.deepEqual(preflight.q019ScopeLock.excludedKnowledgePointIdsFromSameSource, EXCLUDED_SIBLINGS);
  assert.equal(preflight.q019ScopeLock.sameSourceSiblingSemanticsTouched, false);
});

test("P05F W5 Q019 preserves current R04 geometry-formula classification and does not force the unit-conversion modifier", () => {
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
  assert.equal(runtime.profileCategoryMismatchAcknowledged, false);
  assert.equal(runtime.profileCategoryMismatchDisposition, "NONE");

  const modifier = mappingPolicy.modifiers.find((row) => row.modifierId === "mod_unit_conversion");
  assert.ok(modifier);
  assert.deepEqual(modifier.profileIds, ["profile_quantity_measurement", "profile_time", "profile_speed_rate"]);
  assert.equal(modifier.profileIds.includes("profile_geometry_formula"), false);
  assert.equal(runtime.modifierEligibilityObservation.q019ProfileEligible, false);
  assert.equal(runtime.modifierEligibilityObservation.disposition, "PRESERVE_CURRENT_FROZEN_R04_POLICY_NO_MODIFIER");
});

test("P05F W5 Q019 scope is conversion-only and does not absorb formula, composite, inverse-dimension, capacity, application, or Q020+ semantics", () => {
  assert.deepEqual(preflight.q019ScopeLock.includedKnowledgePointIds, [EXPECTED_KP]);
  for (const relation of [
    "CONVERT_COMMON_VOLUME_UNITS_BY_EQUIVALENT_VALUE",
    "APPLY_LINEAR_UNIT_SCALE_FACTOR_ACROSS_THREE_DIMENSIONS",
    "PRESERVE_VOLUME_VALUE_UNDER_UNIT_CONVERSION",
  ]) assert.ok(preflight.q019ScopeLock.includedRelations.includes(relation));

  for (const relation of [
    "DERIVE_OR_APPLY_RECTANGULAR_PRISM_VOLUME_FORMULA_AS_TARGET_KP",
    "DERIVE_OR_APPLY_CUBE_VOLUME_FORMULA_AS_TARGET_KP",
    "COMPOSITE_RECTANGULAR_VOLUME_DECOMPOSITION_OR_COMPLETION",
    "SOLVE_UNKNOWN_LENGTH_WIDTH_OR_HEIGHT_FROM_VOLUME",
    "CAPACITY_OR_CONTAINER_VOLUME_CONVERSION",
    "APPLICATION_CONTEXT",
    "GENERAL_UNIT_CONVERSION_FRAMEWORK_REDESIGN",
    "Q020_OR_LATER_SEMANTICS",
  ]) assert.ok(preflight.q019ScopeLock.excludedRelations.includes(relation));

  assert.equal(preflight.sourceConstraintReconciliation.sameSourceSiblingAbsorptionAllowedByThisPreflight, false);
  assert.equal(preflight.sourceConstraintReconciliation.capacityOrContainerConversionAllowedByThisPreflight, false);
  assert.equal(preflight.sourceConstraintReconciliation.applicationImplementationAllowedByThisPreflight, false);
  assert.equal(preflight.sourceConstraintReconciliation.generalUnitConversionPolicyRewriteAllowedByThisPreflight, false);
  assert.equal(preflight.q019ScopeLock.implementationAllowedByThisPreflight, false);
  assert.equal(preflight.q019ScopeLock.publicProductAdmissionAllowedByThisPreflight, false);
  assert.equal(preflight.q019ScopeLock.q020OrLaterTouched, false);
  assert.equal(preflight.q019ScopeLock.frozenQueueAuthorityTouched, false);
});

test("P05F W5 Q019 validation boundary remains SHARED_RUNTIME_BOUNDED and preflight stops before implementation", () => {
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
  assert.equal(decision.sourceAuthoritySufficientForQ019ImplementationPlanning, true);
  assert.equal(decision.previousSliceD0Satisfied, true);
  assert.equal(decision.runtimeCapabilityContractLocked, true);
  assert.equal(decision.singleKnowledgePointSliceLocked, true);
  assert.equal(decision.sameSourceSiblingProtectionLocked, true);
  assert.equal(decision.manualSourceChoiceRequired, false);
  assert.equal(decision.sourceRefAmbiguity, false);
  assert.equal(decision.nextTaskRequiresSeparateImplementationApproval, true);
  assert.equal(decision.nextTask, "P05F_W5DirectProductVerticalSlice019Implementation");
});
