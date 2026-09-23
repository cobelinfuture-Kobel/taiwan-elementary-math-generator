import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import { getR04KnowledgePointCapabilityMapping } from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const preflight = JSON.parse(readFileSync(
  new URL("../../data/curriculum/full-product/p05f/q031-g5b-u10a-large-unit-estimation-application-source-authority-preflight.json", import.meta.url),
  "utf8",
));
const q009 = JSON.parse(readFileSync(
  new URL("../../data/curriculum/full-product/p05f/q009-g5b-u10a-large-area-unit-identity-source-authority-preflight.json", import.meta.url),
  "utf8",
));
const q021 = JSON.parse(readFileSync(
  new URL("../../data/curriculum/full-product/p05f/q021-g5b-u10a-large-area-conversion-source-authority-preflight.json", import.meta.url),
  "utf8",
));
const r02Chunk = JSON.parse(readFileSync(
  new URL("../../data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-05.json", import.meta.url),
  "utf8",
));

const TARGET_KP = "kp_g5b_u10a_large_unit_estimation_application";
const REQUIRED_RUNTIME_CAPS = [
  "cap_pattern_spec_resolution",
  "cap_deterministic_answer_model",
  "cap_worksheet_document_assembly",
  "cap_answer_key_projection",
  "cap_html_print_renderer",
  "cap_quantity_dimension_unit_identity",
  "cap_quantity_domain_validator",
  "cap_text_numeric_representation",
  "cap_unit_conversion",
  "cap_mixed_unit_normalization",
  "cap_quantity_semantic_role_binding",
  "cap_relation_model_binding",
  "cap_word_problem_semantic_validation",
  "cap_text_application_representation",
];
const EXPECTED_MODIFIERS = [
  "mod_unit_conversion",
  "mod_quantity_relation_semantics",
  "mod_application_semantics",
];
const PROTECTED_SIBLINGS = [
  "kp_g5b_u10a_large_area_unit_identity",
  "kp_g5b_u10a_hectare_square_meter_conversion",
  "kp_g5b_u10a_square_kilometer_hectare_conversion",
  "kp_g5b_u10a_metric_ton_kilogram_conversion",
];

test("P05F W5 Q031 binds the exact frozen queue-position-31 row and Q030 E6/D0 predecessor evidence", () => {
  const queue = materializeP05EW5DirectProductVerticalSliceQueue();
  const slice = queue.queueEntries.find((row) => row.queuePosition === 31);

  assert.equal(queue.queueFrozen, true);
  assert.equal(queue.queueRegistryParity, true);
  assert.equal(queue.queueRegistry.queueDigest, "a4dae65a1a907ba963a135fce84ba292b8486a12513ae8f1fa54fbf07a6598ae");
  assert.ok(slice);
  assert.equal(slice.sliceId, "p05e_q031_r2_g5b_u10_5b10a_profile_quantity_measurement_c1");
  assert.equal(slice.implementationTaskId, "P05F_W5DirectProductVerticalSlice031Implementation");
  assert.equal(slice.previousSliceId, "p05e_q030_r2_g5b_u03_5b03_profile_geometry_formula_c1");
  assert.equal(slice.previousSliceMustBeD0Complete, true);
  assert.equal(slice.primarySourceNodeId, "g5b_u10_5b10a");
  assert.deepEqual(slice.supportingSourceNodeIds, ["g5b_u10_5b10a"]);
  assert.equal(slice.intraWavePrerequisiteRank, 2);
  assert.equal(slice.primaryRuntimeProfileId, "profile_quantity_measurement");
  assert.equal(slice.chunkIndex, 1);
  assert.equal(slice.knowledgePointCount, 1);
  assert.deepEqual(slice.knowledgePointIds, [TARGET_KP]);
  assert.deepEqual(slice.requiredW5CapabilityIds, []);
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds, [TARGET_KP]);
  assert.deepEqual(preflight.queueAuthority.requiredW5CapabilityIds, []);

  const predecessor = preflight.previousSliceD0Evidence;
  assert.equal(predecessor.productPrNumber, 899);
  assert.equal(predecessor.productMergeSha, "813bdf225ba1dc8fa0f18101905edf7e31524d4f");
  assert.equal(predecessor.productPrGateRunId, "34687048394");
  assert.equal(predecessor.pagesHarnessPrNumber, 900);
  assert.equal(predecessor.pagesHarnessMergeSha, "8deefa8c6ed52ef6ec8dc9e024ca8f39fff2c7e3");
  assert.equal(predecessor.pagesHarnessRepairPrNumber, 901);
  assert.equal(predecessor.pagesHarnessRepairMergeSha, "73cdf7f06f2880c79693f9992dae6455314b16a8");
  assert.equal(predecessor.exactPagesRunId, "34695982313");
  assert.equal(predecessor.evidenceArtifactId, "10297784308");
  assert.equal(predecessor.evidenceArtifactDigest, "sha256:9ac0de34bed0ccfc8691264e8af94bf0bb0653069eadd56d1776ad321d0adb28");
  assert.equal(predecessor.status, "PASS_E6_D0_COMPLETE");
  assert.equal(predecessor.productPrGateConclusion, "success");
  assert.equal(predecessor.exactPagesWorkflowConclusion, "success");
});

test("P05F W5 Q031 reuses the verified G5B-U10A source identity and exact reviewed page 1", () => {
  const source = preflight.sourceAuthority;
  assert.equal(preflight.status, "PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(source.sourceNodeId, q009.sourceAuthority.sourceNodeId);
  assert.equal(source.sourceNodeId, q021.sourceAuthority.sourceNodeId);
  assert.equal(source.sourceTitle, q009.sourceAuthority.sourceTitle);
  assert.equal(source.sourcePdfTitle, q009.sourceAuthority.sourcePdfTitle);
  assert.equal(source.sourcePdfDriveFileId, q009.sourceAuthority.sourcePdfDriveFileId);
  assert.equal(source.sourcePdfDriveFileId, q021.sourceAuthority.sourcePdfDriveFileId);
  assert.equal(source.sourceUrl, q021.sourceAuthority.sourceUrl);
  assert.equal(source.pageCount, 1);
  assert.deepEqual(source.reviewedPages, [1]);
  assert.equal(source.sourceIdentityReuse.sourceRefAmbiguity, false);
  assert.equal(source.evidenceBoundary.authorityBasis, "R02_REVIEWED_SOURCE_PAGE_1");
});

test("P05F W5 Q031 locks exactly the R02 large-unit estimation/application candidate and preserves all sibling ownership", () => {
  const source = r02Chunk.sourceRecords.find((row) => row.sourceNodeId === "g5b_u10_5b10a");
  assert.ok(source);
  assert.equal(source.sourceTitle, "生活中的大單位");
  assert.equal(source.sourcePdfTitle, "meow911_5b10a_source.pdf");
  assert.equal(source.pageCount, 1);
  assert.deepEqual(source.reviewedPages, [1]);

  const candidate = source.candidates.find((row) => row.knowledgePointId === TARGET_KP);
  assert.ok(candidate);
  assert.equal(candidate.canonicalNameZh, "大單位估測與應用");
  assert.equal(candidate.capabilityStatement, "學生能以合理的大單位估測土地、距離或重量。");
  assert.equal(candidate.reasoningInvariant, "估測結果須符合實際尺度與單位換算界限。");
  assert.equal(candidate.category, "measurement");
  assert.deepEqual(candidate.evidencePages, [1]);
  assert.equal(candidate.applicationSuitability, "APPLICATION_COMPATIBLE");

  assert.equal(preflight.r02ReviewedCandidateAuthority.knowledgePoint.knowledgePointId, TARGET_KP);
  assert.deepEqual(preflight.q031ScopeLock.protectedExistingSameSourceKnowledgePointIds, PROTECTED_SIBLINGS);
  assert.equal(preflight.q031ScopeLock.sameSourceSiblingSemanticsTouched, false);
});

test("P05F W5 Q031 preserves current R04 quantity-measurement classification and exact modifiers", () => {
  const mapping = getR04KnowledgePointCapabilityMapping(TARGET_KP);
  assert.ok(mapping);
  assert.equal(mapping.primaryRuntimeProfileId, "profile_quantity_measurement");
  assert.equal(mapping.classificationRuleId, "rule_quantity_measurement");
  assert.deepEqual(mapping.appliedModifierIds, EXPECTED_MODIFIERS);
  assert.deepEqual(mapping.requiredRuntimeCapabilityIds, REQUIRED_RUNTIME_CAPS);

  const runtime = preflight.runtimeCapabilityAuthority;
  assert.equal(runtime.profileId, mapping.primaryRuntimeProfileId);
  assert.equal(runtime.classificationRuleId, mapping.classificationRuleId);
  assert.deepEqual(runtime.appliedModifierIds, mapping.appliedModifierIds);
  assert.deepEqual(runtime.exactRequiredRuntimeCapabilityIds, mapping.requiredRuntimeCapabilityIds);
  assert.deepEqual(runtime.exactFrozenQueueRequiredW5CapabilityIds, []);
  assert.equal(runtime.emptyDirectW5CapabilitySubsetAcknowledged, true);
  assert.equal(runtime.frozenProfileCategoryAligned, true);
  assert.equal(runtime.unitConversionModifierApplied, true);
  assert.equal(runtime.r04AuthorityTouched, false);
  assert.equal(preflight.sourceConstraintReconciliation.currentR04UnitConversionModifierMustBePreserved, true);
  assert.equal(preflight.q031ScopeLock.requiresUnitConversionByCurrentR04, true);
  assert.equal(preflight.q031ScopeLock.requiresMixedUnitNormalizationByCurrentR04, true);
  assert.equal(preflight.q031ScopeLock.unitConversionSemanticsBoundedToReviewedQ031Evidence, true);
});

test("P05F W5 Q031 evidence boundary admits only large-unit estimation/application and excludes re-ownership or later semantics", () => {
  assert.deepEqual(preflight.q031ScopeLock.includedKnowledgePointIds, [TARGET_KP]);
  for (const relation of [
    "CHOOSE_REASONABLE_LARGE_UNIT_BY_QUANTITY_TYPE_AND_SCALE",
    "ESTIMATE_LAND_DISTANCE_OR_MASS_WITH_REALISTIC_MAGNITUDE",
    "REJECT_SCALE_OR_UNIT_MISMATCHES",
  ]) assert.ok(preflight.q031ScopeLock.includedRelations.includes(relation));

  for (const relation of [
    "REOWN_Q009_LARGE_AREA_UNIT_IDENTITY",
    "REOWN_Q021_AREA_UNIT_CONVERSIONS",
    "REOWN_P04F19_METRIC_TON_KILOGRAM_CONVERSION",
    "GENERAL_UNIT_CONVERSION_FRAMEWORK_REDESIGN",
    "GLOBAL_CONTEXT_REGISTRY_EXPANSION",
    "PBL_TASK_SET_EXPANSION",
    "Q032_OR_LATER_SEMANTICS",
  ]) assert.ok(preflight.q031ScopeLock.excludedRelations.includes(relation));

  assert.equal(preflight.sourceConstraintReconciliation.sameSourceSiblingAbsorptionAllowedByThisPreflight, false);
  assert.equal(preflight.sourceConstraintReconciliation.generalUnitConversionPolicyRewriteAllowedByThisPreflight, false);
  assert.equal(preflight.sourceConstraintReconciliation.globalContextExpansionAllowedByThisPreflight, false);
  assert.equal(preflight.q031ScopeLock.implementationAllowedByThisPreflight, false);
  assert.equal(preflight.q031ScopeLock.publicProductAdmissionAllowedByThisPreflight, false);
  assert.equal(preflight.q031ScopeLock.q032OrLaterTouched, false);
  assert.equal(preflight.q031ScopeLock.frozenQueueAuthorityTouched, false);
  assert.equal(preflight.q031ScopeLock.r02AuthorityTouched, false);
  assert.equal(preflight.q031ScopeLock.r04AuthorityTouched, false);
});

test("P05F W5 Q031 validation remains SHARED_RUNTIME_BOUNDED and stops at the separate implementation approval boundary", () => {
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
  assert.equal(decision.exactFrozenQueueRowResolved, true);
  assert.equal(decision.sourceAuthoritySufficientForQ031ImplementationPlanning, true);
  assert.equal(decision.previousSliceD0Satisfied, true);
  assert.equal(decision.runtimeCapabilityContractLocked, true);
  assert.equal(decision.singleKnowledgePointSliceLocked, true);
  assert.equal(decision.sourceEvidenceBoundaryLocked, true);
  assert.equal(decision.sameSourceSiblingProtectionLocked, true);
  assert.equal(decision.runtimeProfileCategoryAligned, true);
  assert.equal(decision.manualSourceChoiceRequired, false);
  assert.equal(decision.sourceRefAmbiguity, false);
  assert.equal(decision.nextTaskRequiresSeparateImplementationApproval, true);
  assert.equal(decision.nextTask, "P05F_W5DirectProductVerticalSlice031Implementation");
});
