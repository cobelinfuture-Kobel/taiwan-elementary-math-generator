import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

import {materializeP05EW5DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {materializeR05DeliveryWaveRebase} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const preflight=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p05f/q039-g5b-u03-capacity-volume-conversion-source-authority-preflight.json",import.meta.url),"utf8"));
const q020=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p05f/q020-g5b-u03-container-volume-capacity-distinction-source-authority-preflight.json",import.meta.url),"utf8"));
const q030=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p05f/q030-g5b-u03-capacity-volume-equivalence-source-authority-preflight.json",import.meta.url),"utf8"));
const r02Chunk=JSON.parse(readFileSync(new URL("../../data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-04.json",import.meta.url),"utf8"));
const mappingPolicy=JSON.parse(readFileSync(new URL("../../data/curriculum/global/runtime/r04/runtime-capability-mapping-policy.json",import.meta.url),"utf8"));

const KP="kp_g5b_u03_capacity_volume_conversion";
const EXPECTED_CAPS=[
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_formula_evaluation",
  "cap_geometry_property_reasoning",
];

test("P05F W5 Q039 binds exact frozen queue position 39 and Q038 E6/D0 predecessor evidence",()=>{
  const queue=materializeP05EW5DirectProductVerticalSliceQueue();
  const slice=queue.queueEntries.find(row=>row.queuePosition===39);
  assert.equal(queue.queueFrozen,true);
  assert.equal(queue.queueRegistryParity,true);
  assert.equal(queue.derivedRegistrySnapshot.queueDigest,"a4dae65a1a907ba963a135fce84ba292b8486a12513ae8f1fa54fbf07a6598ae");
  assert.ok(slice);
  assert.equal(slice.sliceId,"p05e_q039_r3_g5b_u03_5b03_profile_geometry_formula_c1");
  assert.equal(slice.implementationTaskId,"P05F_W5DirectProductVerticalSlice039Implementation");
  assert.equal(slice.previousSliceId,"p05e_q038_r3_g5a_u10_5a10a1_profile_spatial_solid_c1");
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.primarySourceNodeId,"g5b_u03_5b03");
  assert.equal(slice.intraWavePrerequisiteRank,3);
  assert.equal(slice.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.equal(slice.knowledgePointCount,1);
  assert.deepEqual(slice.knowledgePointIds,[KP]);
  assert.deepEqual(slice.requiredW5CapabilityIds,EXPECTED_CAPS);
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds,[KP]);
  assert.deepEqual(preflight.queueAuthority.requiredW5CapabilityIds,EXPECTED_CAPS);

  const predecessor=preflight.previousSliceD0Evidence;
  assert.equal(predecessor.sliceId,"p05e_q038_r3_g5a_u10_5a10a1_profile_spatial_solid_c1");
  assert.equal(predecessor.preflightPrNumber,918);
  assert.equal(predecessor.productPrNumber,919);
  assert.equal(predecessor.productHeadSha,"357f2be1376f542d9086ef82ff615b70b791f51e");
  assert.equal(predecessor.productMergeSha,"1cf6fd5f1e566d252903c8df9e04e16752a156cf");
  assert.equal(predecessor.prGateRunId,"34792220260");
  assert.equal(predecessor.pagesDeploymentRunId,"34792339202");
  assert.equal(predecessor.exactPagesRunId,"34792339256");
  assert.equal(predecessor.evidenceArtifactId,"10328328999");
  assert.equal(predecessor.evidenceArtifactDigest,"sha256:b959c4d2af74f53679baf14c03923639ff708adac76d31395a70625393c9f3ce");
  assert.equal(predecessor.status,"PASS_E6_D0_COMPLETE");
  assert.equal(predecessor.prGateConclusion,"success");
  assert.equal(predecessor.pagesDeploymentConclusion,"success");
  assert.equal(predecessor.exactPagesWorkflowConclusion,"success");
  assert.equal(predecessor.exactPagesEvidenceUploaded,true);
});

test("P05F W5 Q039 reuses exact verified G5B-U03 source identity from Q020 and Q030 without inventing a source",()=>{
  const source=preflight.sourceAuthority;
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  for(const prior of [q020.sourceAuthority,q030.sourceAuthority]){
    assert.equal(source.sourceNodeId,prior.sourceNodeId);
    assert.equal(source.sourceTitle,prior.sourceTitle);
    assert.equal(source.sourcePdfTitle,prior.sourcePdfTitle);
    assert.equal(source.sourcePdfDriveFileId,prior.sourcePdfDriveFileId);
    assert.equal(source.sourceUrl,prior.sourceUrl);
  }
  assert.equal(source.pageCount,2);
  assert.deepEqual(source.reviewedPages,[1,2]);
  assert.equal(source.sourceIdentityReuse.q020AuthorityConfirmed,true);
  assert.equal(source.sourceIdentityReuse.q030AuthorityConfirmed,true);
  assert.equal(source.sourceIdentityReuse.sameSourceNodeConfirmed,true);
  assert.equal(source.sourceIdentityReuse.samePdfDriveFileIdConfirmed,true);
  assert.equal(source.sourceIdentityReuse.sameSourceUrlConfirmed,true);
  assert.equal(source.sourceIdentityReuse.sourceRefAmbiguity,false);
  assert.equal(source.sourceIdentityReuse.manualSourceChoiceRequired,false);
});

test("P05F W5 Q039 locks exact R02 compound conversion candidate and source-backed invariant",()=>{
  const source=r02Chunk.sourceRecords.find(row=>row.sourceNodeId==="g5b_u03_5b03");
  assert.ok(source);
  assert.equal(source.sourceTitle,"容積和容量");
  assert.equal(source.sourcePdfTitle,"meow911_5b03_source.pdf");
  assert.deepEqual(source.reviewedPages,[1,2]);
  const candidate=source.candidates.find(row=>row.knowledgePointId===KP);
  assert.ok(candidate);
  assert.equal(candidate.canonicalNameZh,"容積容量複合換算");
  assert.equal(candidate.capabilityStatement,"學生能在公升、毫升、立方公分與立方公寸間換算。");
  assert.equal(candidate.reasoningInvariant,"換算須同時符合1000倍與等價單位關係。");
  assert.equal(candidate.category,"measurement");
  assert.deepEqual(candidate.evidencePages,[1,2]);
  assert.equal(candidate.applicationSuitability,"APPLICATION_COMPATIBLE");
  assert.deepEqual(preflight.r02ReviewedCandidateAuthority.knowledgePoint,candidate);
  assert.deepEqual(preflight.sourceAuthority.targetEvidenceBoundary.evidencePages,[1,2]);
  assert.equal(preflight.q039ScopeLock.factor1000AndEquivalentUnitRelationsMustBothHold,true);
});

test("P05F W5 Q039 preserves frozen/current R04 geometry-formula classification and does not silently activate mod_unit_conversion",()=>{
  const mapping=getR04KnowledgePointCapabilityMapping(KP);
  assert.ok(mapping);
  assert.equal(mapping.mappingId,"r04map_g5b_u03_capacity_volume_conversion");
  assert.equal(mapping.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.equal(mapping.classificationRuleId,"rule_geometry_formula");
  assert.deepEqual(mapping.appliedModifierIds,[]);

  const geometryRule=mappingPolicy.classificationRules.find(row=>row.ruleId==="rule_geometry_formula");
  const measurementRule=mappingPolicy.classificationRules.find(row=>row.ruleId==="rule_quantity_measurement");
  assert.ok(geometryRule);
  assert.ok(measurementRule);
  assert.ok(mappingPolicy.classificationRules.indexOf(geometryRule)<mappingPolicy.classificationRules.indexOf(measurementRule));
  assert.ok(geometryRule.anyTerms.includes("volume_"));
  assert.ok(geometryRule.anyTerms.includes("體積"));

  const modifier=mappingPolicy.modifiers.find(row=>row.modifierId==="mod_unit_conversion");
  assert.ok(modifier);
  assert.ok(modifier.anyTerms.includes("conversion"));
  assert.ok(modifier.anyTerms.includes("換算"));
  assert.equal(modifier.profileIds.includes("profile_geometry_formula"),false);
  assert.equal(preflight.runtimeCapabilityAuthority.profileId,"profile_geometry_formula");
  assert.equal(preflight.runtimeCapabilityAuthority.classificationRuleId,"rule_geometry_formula");
  assert.equal(preflight.runtimeCapabilityAuthority.profileCategoryMismatchAcknowledged,true);
  assert.equal(preflight.runtimeCapabilityAuthority.modifierEligibilityObservation.q039ProfileEligible,false);
  assert.equal(preflight.runtimeCapabilityAuthority.modifierEligibilityObservation.appliedModifierIdsRemainEmptyUnderCurrentR04,true);
  assert.equal(preflight.q039ScopeLock.unitConversionModifierPolicyRewriteAllowed,false);
});

test("P05F W5 Q039 R05 dependency closure exactly matches frozen W5 capability contract",()=>{
  const r05=materializeR05DeliveryWaveRebase();
  const assignment=r05.getAssignment(KP);
  assert.ok(assignment);
  assert.equal(assignment.deliveryWaveId,"R05-W5");
  assert.equal(assignment.intraWavePrerequisiteRank,3);
  assert.equal(assignment.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.deepEqual([...assignment.contractOnlyRequiredCapabilityIds].sort(),[...EXPECTED_CAPS].sort());
  assert.deepEqual([...preflight.runtimeCapabilityAuthority.exactFrozenQueueRequiredW5CapabilityIds].sort(),[...EXPECTED_CAPS].sort());
  assert.ok(assignment.contractOnlyRequiredCapabilityIds.includes("cap_geometry_property_reasoning"));
  assert.equal(assignment.contractOnlyRequiredCapabilityIds.includes("cap_unit_conversion"),false);
  assert.equal(assignment.contractOnlyRequiredCapabilityIds.includes("cap_mixed_unit_normalization"),false);
});

test("P05F W5 Q039 preserves exact same-source frozen ownership for Q020 Q030 and future Q053",()=>{
  const queue=materializeP05EW5DirectProductVerticalSliceQueue();
  const ownership={
    kp_g5b_u03_container_volume_capacity_distinction:20,
    kp_g5b_u03_l_dm3_equivalence:30,
    kp_g5b_u03_ml_cm3_equivalence:30,
    kp_g5b_u03_container_fill_displacement:53,
  };
  for(const [kp,position] of Object.entries(ownership)){
    const row=queue.queueEntries.find(entry=>entry.knowledgePointIds.includes(kp));
    assert.ok(row,`${kp} missing`);
    assert.equal(row.queuePosition,position,kp);
    assert.equal(preflight.q039ScopeLock.protectedFrozenQueueOwnership[kp],`Q${String(position).padStart(3,"0")}`);
  }
  assert.deepEqual(preflight.q039ScopeLock.protectedExistingSameSourceKnowledgePointIds,[
    "kp_g5b_u03_container_volume_capacity_distinction",
    "kp_g5b_u03_l_dm3_equivalence",
    "kp_g5b_u03_ml_cm3_equivalence",
  ]);
  assert.deepEqual(preflight.q039ScopeLock.excludedKnowledgePointIdsFromSameSource,["kp_g5b_u03_container_fill_displacement"]);
  assert.equal(preflight.q039ScopeLock.simpleEquivalenceFactsMayBeUsedAsPrerequisitesButNotReowned,true);
  assert.equal(preflight.q039ScopeLock.sameSourceSiblingSemanticsTouched,false);
});

test("P05F W5 Q039 excludes sibling ownership application mixed modes global framework redesign and Q040+",()=>{
  for(const relation of [
    "REOWN_CONTAINER_VOLUME_CAPACITY_DISTINCTION",
    "REOWN_SIMPLE_LITER_CUBIC_DECIMETER_EQUIVALENCE",
    "REOWN_SIMPLE_MILLILITER_CUBIC_CENTIMETER_EQUIVALENCE",
    "CONTAINER_FILL_OR_DISPLACEMENT_AS_TARGET_KP",
    "GENERAL_UNIT_CONVERSION_FRAMEWORK_REDESIGN",
    "APPLICATION_CONTEXT_IMPLEMENTATION",
    "SAME_UNIT_MIXED_MODE",
    "CROSS_UNIT_MIXED_MODE",
    "Q040_OR_LATER_SEMANTICS",
  ]) assert.ok(preflight.q039ScopeLock.excludedRelations.includes(relation),relation);
  assert.equal(preflight.q039ScopeLock.applicationImplementationAllowedByThisPreflight,false);
  assert.equal(preflight.q039ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(preflight.q039ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(preflight.q039ScopeLock.sameUnitMixedTouched,false);
  assert.equal(preflight.q039ScopeLock.crossUnitMixedTouched,false);
  assert.equal(preflight.q039ScopeLock.q040OrLaterTouched,false);
  assert.equal(preflight.q039ScopeLock.frozenQueueAuthorityTouched,false);
  assert.equal(preflight.q039ScopeLock.r02AuthorityTouched,false);
  assert.equal(preflight.q039ScopeLock.r04AuthorityTouched,false);
  assert.equal(preflight.q039ScopeLock.r05AuthorityTouched,false);
});

test("P05F W5 Q039 validation stays SHARED_RUNTIME_BOUNDED and stops at planning-to-implementation policy boundary",()=>{
  const boundary=preflight.preflightValidationBoundary;
  assert.equal(boundary.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");
  assert.equal(boundary.derivedLane,"SHARED_RUNTIME_BOUNDED");
  assert.deepEqual(boundary.allowedLaneGateIds,["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(boundary.focusedNodeContractRequired,true);
  assert.equal(boundary.nodeOnlyReadbackRequired,true);
  assert.equal(boundary.fullRepositoryRegressionAllowed,false);
  assert.equal(boundary.globalBrowserReplayAllowed,false);
  assert.equal(boundary.productImplementationAllowed,false);
  assert.equal(boundary.publicCutoverAllowed,false);

  const decision=preflight.preflightDecision;
  assert.equal(decision.exactFrozenQueueRowResolved,true);
  assert.equal(decision.sourceAuthoritySufficientForQ039ImplementationPlanning,true);
  assert.equal(decision.previousSliceD0Satisfied,true);
  assert.equal(decision.runtimeCapabilityContractLocked,true);
  assert.equal(decision.singleKnowledgePointSliceLocked,true);
  assert.equal(decision.sourceEvidenceBoundaryLocked,true);
  assert.equal(decision.sameSourceOwnershipProtectionLocked,true);
  assert.equal(decision.runtimeProfileCategoryMismatchExplicitlyBounded,true);
  assert.equal(decision.manualSourceChoiceRequired,false);
  assert.equal(decision.sourceRefAmbiguity,false);
  assert.equal(decision.separateImplementationApprovalSatisfiedByCurrentOperatorInstruction,false);
  assert.equal(decision.nextTaskRequiresNewOperatorApproval,true);
  assert.equal(decision.nextTask,"P05F_W5DirectProductVerticalSlice039Implementation");
});
