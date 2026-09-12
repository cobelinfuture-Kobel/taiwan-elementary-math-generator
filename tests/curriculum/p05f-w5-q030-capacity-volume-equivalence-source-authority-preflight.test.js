import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import { getR04KnowledgePointCapabilityMapping } from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const preflight = JSON.parse(readFileSync(
  new URL("../../data/curriculum/full-product/p05f/q030-g5b-u03-capacity-volume-equivalence-source-authority-preflight.json", import.meta.url),
  "utf8",
));
const q020 = JSON.parse(readFileSync(
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

const EXPECTED_KPS = [
  "kp_g5b_u03_l_dm3_equivalence",
  "kp_g5b_u03_ml_cm3_equivalence",
];
const EXPECTED_CAPS = [
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_formula_evaluation",
  "cap_geometry_property_reasoning",
];
const EXCLUDED_SIBLINGS = [
  "kp_g5b_u03_capacity_volume_conversion",
  "kp_g5b_u03_container_fill_displacement",
];

test("P05F W5 Q030 binds the exact frozen queue-position-30 row and Q029 E6/D0 predecessor evidence", () => {
  const queue = materializeP05EW5DirectProductVerticalSliceQueue();
  const slice = queue.queueEntries.find((row) => row.queuePosition === 30);

  assert.equal(queue.queueFrozen, true);
  assert.equal(queue.queueRegistryParity, true);
  assert.equal(queue.queueRegistry.queueDigest, "a4dae65a1a907ba963a135fce84ba292b8486a12513ae8f1fa54fbf07a6598ae");
  assert.ok(slice);
  assert.equal(slice.sliceId, "p05e_q030_r2_g5b_u03_5b03_profile_geometry_formula_c1");
  assert.equal(slice.implementationTaskId, "P05F_W5DirectProductVerticalSlice030Implementation");
  assert.equal(slice.previousSliceId, "p05e_q029_r2_g5a_u10_5a10a1_profile_spatial_solid_c1");
  assert.equal(slice.previousSliceMustBeD0Complete, true);
  assert.equal(slice.primarySourceNodeId, "g5b_u03_5b03");
  assert.equal(slice.intraWavePrerequisiteRank, 2);
  assert.equal(slice.primaryRuntimeProfileId, "profile_geometry_formula");
  assert.equal(slice.knowledgePointCount, 2);
  assert.deepEqual(slice.knowledgePointIds, EXPECTED_KPS);
  assert.deepEqual(slice.requiredW5CapabilityIds, EXPECTED_CAPS);
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds, EXPECTED_KPS);
  assert.deepEqual(preflight.queueAuthority.requiredW5CapabilityIds, EXPECTED_CAPS);

  const predecessor = preflight.previousSliceD0Evidence;
  assert.equal(predecessor.productPrNumber, 896);
  assert.equal(predecessor.productMergeSha, "55b7d9c2ea56a311fe047109e7d90953962a2178");
  assert.equal(predecessor.pagesHarnessPrNumber, 897);
  assert.equal(predecessor.pagesHarnessMergeSha, "2517c478baea696d00f1a7b3179d4cee5cfafc84");
  assert.equal(predecessor.prGateRunId, "34677351265");
  assert.equal(predecessor.exactPagesRunId, "34677707862");
  assert.equal(predecessor.evidenceArtifactId, "10292474250");
  assert.equal(predecessor.evidenceArtifactDigest, "sha256:5852c1c516d7ab2f94d63fe62bd811ca8eabc1ef6700a3d0aea6d7fa3e43aa77");
  assert.equal(predecessor.status, "PASS_E6_D0_COMPLETE");
  assert.equal(predecessor.prGateConclusion, "success");
  assert.equal(predecessor.exactPagesWorkflowConclusion, "success");
});

test("P05F W5 Q030 reuses the verified G5B-U03 source identity without touching Q029 or inventing new source metadata", () => {
  const source = preflight.sourceAuthority;
  assert.equal(preflight.status, "PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(source.sourceNodeId, q020.sourceAuthority.sourceNodeId);
  assert.equal(source.sourceTitle, q020.sourceAuthority.sourceTitle);
  assert.equal(source.sourcePdfTitle, q020.sourceAuthority.sourcePdfTitle);
  assert.equal(source.sourcePdfDriveFileId, q020.sourceAuthority.sourcePdfDriveFileId);
  assert.equal(source.sourceUrl, q020.sourceAuthority.sourceUrl);
  assert.equal(source.pageCount, 2);
  assert.deepEqual(source.reviewedPages, [1, 2]);
  assert.equal(source.sourceIdentityReuse.q020AuthorityPreflightPath, "data/curriculum/full-product/p05f/q020-g5b-u03-container-volume-capacity-distinction-source-authority-preflight.json");
  assert.equal(source.sourceIdentityReuse.sourceRefAmbiguity, false);
  assert.equal(source.evidenceBoundary.authorityBasis, "R02_REVIEWED_SOURCE_PAGES_1_2");
  assert.deepEqual(source.evidenceBoundary.directlySupportedRelations, [
    "ONE_MILLILITER_EQUALS_ONE_CUBIC_CENTIMETER",
    "ONE_LITER_EQUALS_ONE_CUBIC_DECIMETER",
    "EQUIVALENT_CAPACITY_AND_VOLUME_UNITS_REPRESENT_THE_SAME_SPATIAL_QUANTITY",
  ]);
});

test("P05F W5 Q030 locks exactly the two R02 equivalence candidates and preserves sibling ownership", () => {
  const source = r02Chunk.sourceRecords.find((row) => row.sourceNodeId === "g5b_u03_5b03");
  assert.ok(source);
  assert.equal(source.sourceTitle, "容積和容量");
  assert.equal(source.sourcePdfTitle, "meow911_5b03_source.pdf");
  assert.deepEqual(source.reviewedPages, [1, 2]);

  const expected = [
    {
      id: "kp_g5b_u03_l_dm3_equivalence",
      name: "公升與立方公寸等價",
      capability: "學生能運用1公升等於1立方公寸。",
      invariant: "容量與體積單位等價時代表同一空間量。",
    },
    {
      id: "kp_g5b_u03_ml_cm3_equivalence",
      name: "毫升與立方公分等價",
      capability: "學生能運用1毫升等於1立方公分。",
      invariant: "相同內部空間以液量或體積表示時數值相等。",
    },
  ];

  for (const row of expected) {
    const candidate = source.candidates.find((candidateRow) => candidateRow.knowledgePointId === row.id);
    assert.ok(candidate);
    assert.equal(candidate.canonicalNameZh, row.name);
    assert.equal(candidate.capabilityStatement, row.capability);
    assert.equal(candidate.reasoningInvariant, row.invariant);
    assert.equal(candidate.category, "measurement");
    assert.deepEqual(candidate.evidencePages, [1, 2]);
    assert.equal(candidate.applicationSuitability, "APPLICATION_COMPATIBLE");
  }

  assert.deepEqual(preflight.r02ReviewedCandidateAuthority.knowledgePoints.map((row) => row.knowledgePointId), EXPECTED_KPS);
  assert.deepEqual(preflight.q030ScopeLock.protectedExistingSameSourceKnowledgePointIds, ["kp_g5b_u03_container_volume_capacity_distinction"]);
  assert.deepEqual(preflight.q030ScopeLock.excludedKnowledgePointIdsFromSameSource, EXCLUDED_SIBLINGS);
  assert.equal(preflight.q030ScopeLock.sameSourceSiblingSemanticsTouched, false);
  assert.equal(preflight.q030ScopeLock.q020SemanticsMustRemainUnchanged, true);
});

test("P05F W5 Q030 preserves frozen/current R04 geometry-formula classification and does not silently enable unit-conversion modifier semantics", () => {
  const mappings = EXPECTED_KPS.map((id) => getR04KnowledgePointCapabilityMapping(id));
  for (const mapping of mappings) {
    assert.ok(mapping);
    assert.equal(mapping.primaryRuntimeProfileId, "profile_geometry_formula");
    assert.equal(mapping.classificationRuleId, "rule_geometry_formula");
    assert.deepEqual(mapping.appliedModifierIds, []);
  }

  const runtime = preflight.runtimeCapabilityAuthority;
  assert.deepEqual(runtime.profileRequiredCapabilityIds, [
    "cap_geometry_formula_evaluation",
    "cap_geometry_domain_validator",
    "cap_geometry_diagram_representation",
  ]);
  assert.deepEqual(runtime.perKnowledgePointMappings, [
    { knowledgePointId: EXPECTED_KPS[0], classificationRuleId: "rule_geometry_formula", appliedModifierIds: [] },
    { knowledgePointId: EXPECTED_KPS[1], classificationRuleId: "rule_geometry_formula", appliedModifierIds: [] },
  ]);
  assert.deepEqual(runtime.unionAppliedModifierIds, []);
  assert.deepEqual(runtime.dependencyClosureAddedCapabilityIds, ["cap_geometry_property_reasoning"]);
  assert.deepEqual(runtime.exactFrozenQueueRequiredW5CapabilityIds, EXPECTED_CAPS);
  assert.equal(runtime.profileCategoryMismatchAcknowledged, true);

  const geometryRule = mappingPolicy.classificationRules.find((row) => row.ruleId === "rule_geometry_formula");
  const measurementRule = mappingPolicy.classificationRules.find((row) => row.ruleId === "rule_quantity_measurement");
  assert.ok(geometryRule);
  assert.ok(measurementRule);
  assert.ok(mappingPolicy.classificationRules.indexOf(geometryRule) < mappingPolicy.classificationRules.indexOf(measurementRule));
  assert.ok(geometryRule.anyTerms.includes("體積"));

  const modifier = mappingPolicy.modifiers.find((row) => row.modifierId === "mod_unit_conversion");
  assert.ok(modifier);
  assert.equal(modifier.profileIds.includes("profile_geometry_formula"), false);
  assert.equal(runtime.modifierEligibilityObservation.q030ProfileEligible, false);
  assert.equal(runtime.modifierEligibilityObservation.disposition, "PRESERVE_CURRENT_FROZEN_R04_POLICY_NO_MODIFIER");
});

test("P05F W5 Q030 evidence boundary admits only two unit-equivalence KPs and excludes compound conversion, displacement, application, and later semantics", () => {
  assert.deepEqual(preflight.q030ScopeLock.includedKnowledgePointIds, EXPECTED_KPS);
  for (const relation of [
    "ASSERT_ONE_LITER_EQUALS_ONE_CUBIC_DECIMETER",
    "ASSERT_ONE_MILLILITER_EQUALS_ONE_CUBIC_CENTIMETER",
    "PRESERVE_EQUIVALENT_SPATIAL_QUANTITY_ACROSS_CAPACITY_AND_VOLUME_REPRESENTATIONS",
  ]) assert.ok(preflight.q030ScopeLock.includedRelations.includes(relation));

  for (const relation of [
    "REOWN_CONTAINER_VOLUME_CAPACITY_DISTINCTION",
    "COMPOUND_CAPACITY_VOLUME_CONVERSION_AS_TARGET_KP",
    "CONTAINER_FILL_OR_DISPLACEMENT_AS_TARGET_KP",
    "GENERAL_UNIT_CONVERSION_FRAMEWORK_REDESIGN",
    "APPLICATION_CONTEXT_IMPLEMENTATION",
    "Q031_OR_LATER_SEMANTICS",
  ]) assert.ok(preflight.q030ScopeLock.excludedRelations.includes(relation));

  assert.equal(preflight.sourceConstraintReconciliation.sameSourceSiblingAbsorptionAllowedByThisPreflight, false);
  assert.equal(preflight.sourceConstraintReconciliation.generalUnitConversionPolicyRewriteAllowedByThisPreflight, false);
  assert.equal(preflight.q030ScopeLock.implementationAllowedByThisPreflight, false);
  assert.equal(preflight.q030ScopeLock.publicProductAdmissionAllowedByThisPreflight, false);
  assert.equal(preflight.q030ScopeLock.q031OrLaterTouched, false);
  assert.equal(preflight.q030ScopeLock.frozenQueueAuthorityTouched, false);
  assert.equal(preflight.q030ScopeLock.r02AuthorityTouched, false);
  assert.equal(preflight.q030ScopeLock.r04AuthorityTouched, false);
});

test("P05F W5 Q030 validation remains SHARED_RUNTIME_BOUNDED and preflight stops at the implementation approval boundary", () => {
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
  assert.equal(decision.sourceAuthoritySufficientForQ030ImplementationPlanning, true);
  assert.equal(decision.previousSliceD0Satisfied, true);
  assert.equal(decision.twoKnowledgePointSliceLocked, true);
  assert.equal(decision.sourceEvidenceBoundaryLocked, true);
  assert.equal(decision.runtimeProfileCategoryMismatchExplicitlyBounded, true);
  assert.equal(decision.manualSourceChoiceRequired, false);
  assert.equal(decision.sourceRefAmbiguity, false);
  assert.equal(decision.nextTaskRequiresSeparateImplementationApproval, true);
  assert.equal(decision.nextTask, "P05F_W5DirectProductVerticalSlice030Implementation");
});
