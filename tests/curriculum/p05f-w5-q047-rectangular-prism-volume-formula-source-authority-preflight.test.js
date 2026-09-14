import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {materializeP05EW5DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import {materializeR04SharedRuntimeCapabilityMatrix} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {materializeR05DeliveryWaveRebase} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),"utf8"));
const preflight=read("data/curriculum/full-product/p05f/q047-g5b-u01-rectangular-prism-volume-formula-source-authority-preflight.json");
const q019=read("data/curriculum/full-product/p05f/q019-g5b-u01-volume-unit-conversion-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-03.json");
const KP="kp_g5b_u01_rectangular_prism_volume_formula";
const REQUIRED_W5=["cap_geometry_domain_validator","cap_geometry_property_reasoning","cap_solid_geometry_representation","cap_spatial_solid_reasoning"];
const PROFILE_REQUIRED=["cap_spatial_solid_reasoning","cap_geometry_domain_validator","cap_solid_geometry_representation"];
const PROFILE_OPTIONAL=["cap_geometry_construction"];
const sorted=values=>[...values].sort();

test("Q047 binds exact frozen queue row and Q046 D0 predecessor",()=>{
  const queue=materializeP05EW5DirectProductVerticalSliceQueue();
  assert.equal(queue.status,"W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN");
  assert.equal(queue.queueFrozen,true);
  assert.equal(queue.queueRegistryParity,true);
  const row=queue.queueEntries.find(x=>x.queuePosition===47); assert.ok(row);
  assert.equal(row.sliceId,"p05e_q047_r4_g5b_u01_5b01_profile_spatial_solid_c1");
  assert.equal(row.implementationTaskId,"P05F_W5DirectProductVerticalSlice047Implementation");
  assert.equal(row.previousSliceId,"p05e_q046_r4_g5a_u09_5a09_profile_geometry_formula_c1");
  assert.equal(row.previousSliceMustBeD0Complete,true);
  assert.equal(row.assignedDeliveryWaveId,"R05-W5");
  assert.equal(row.primarySourceNodeId,"g5b_u01_5b01");
  assert.deepEqual(row.supportingSourceNodeIds,["g5b_u01_5b01"]);
  assert.equal(row.intraWavePrerequisiteRank,4);
  assert.equal(row.primaryRuntimeProfileId,"profile_spatial_solid");
  assert.equal(row.chunkIndex,1);
  assert.equal(row.knowledgePointCount,1);
  assert.deepEqual(row.knowledgePointIds,[KP]);
  assert.deepEqual(sorted(row.requiredW5CapabilityIds),sorted(REQUIRED_W5));
  assert.equal(row.targetEvidenceLevel,"E6_D0_COMPLETE");
  assert.equal(preflight.queueAuthority.queueDigest,queue.derivedRegistrySnapshot.queueDigest);
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds,row.knowledgePointIds);
  assert.equal(preflight.previousSliceD0Evidence.preflightPrNumber,935);
  assert.equal(preflight.previousSliceD0Evidence.productPrNumber,936);
  assert.equal(preflight.previousSliceD0Evidence.productHeadSha,"25aa335cbc751f9d9bc10b21f7dbd34d76dfa95b");
  assert.equal(preflight.previousSliceD0Evidence.productMergeSha,"525f698242e4c9f7014723693b6818c72c4593ed");
  assert.equal(preflight.previousSliceD0Evidence.prGateRunId,"34827144328");
  assert.equal(preflight.previousSliceD0Evidence.pagesDeploymentRunId,"34849444705");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesRunId,"34849444628");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactId,"10350190444");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactDigest,"sha256:7f68c3b77b41f2216d8ab2ad45b3d9a233c1c5d03d92532e4bae1092492fa548");
  assert.equal(preflight.previousSliceD0Evidence.status,"PASS_E6_D0_COMPLETE");
});

test("Q047 binds exact R02 rectangular-prism volume formula candidate",()=>{
  const source=r02.sourceRecords.find(x=>x.sourceNodeId==="g5b_u01_5b01"); assert.ok(source);
  assert.equal(source.sourceTitle,"長方體和正方體的體積");
  assert.equal(source.sourcePdfTitle,"meow911_5b01_source.pdf");
  assert.equal(source.pageCount,2);
  assert.deepEqual(source.reviewedPages,[1,2]);
  const candidate=source.candidates.find(x=>x.knowledgePointId===KP); assert.ok(candidate);
  assert.equal(candidate.canonicalNameZh,"長方體體積公式");
  assert.equal(candidate.capabilityStatement,"學生能以長乘寬乘高求長方體體積。");
  assert.equal(candidate.reasoningInvariant,"每層單位方塊數為長乘寬，總層數為高。");
  assert.equal(candidate.category,"geometry");
  assert.deepEqual(candidate.evidencePages,[1,2]);
  assert.equal(candidate.applicationSuitability,"APPLICATION_COMPATIBLE");
  assert.deepEqual(preflight.r02ReviewedCandidateAuthority.knowledgePoint,candidate);
  assert.deepEqual(preflight.r02ReviewedCandidateAuthority.sameSourceCandidateIds,source.candidates.map(x=>x.knowledgePointId));
});

test("Q047 reuses Q019 verified same-source identity without re-owning volume-unit conversion",()=>{
  const source=preflight.sourceAuthority;
  assert.equal(source.sourceNodeId,"g5b_u01_5b01");
  assert.equal(source.sourcePdfDriveFileId,"1IYHtSOWSxqbjcyEi94rmMEyqtOflGQ2f");
  assert.equal(source.sourceUrl,"https://meow911.com/5b01/");
  assert.equal(source.pageCount,2);
  assert.deepEqual(source.reviewedPages,[1,2]);
  assert.equal(q019.sourceAuthority.sourceNodeId,source.sourceNodeId);
  assert.equal(q019.sourceAuthority.sourcePdfTitle,source.sourcePdfTitle);
  assert.equal(q019.sourceAuthority.sourcePdfDriveFileId,source.sourcePdfDriveFileId);
  assert.equal(q019.sourceAuthority.sourceUrl,source.sourceUrl);
  assert.equal(source.targetEvidenceReconciliation.rectangularPrismVolumeFormula.samePdfIdentityAlreadyCorroboratedByQ019,true);
  assert.equal(source.targetEvidenceReconciliation.rectangularPrismVolumeFormula.newTargetVisualReplayRequiredForPreflight,false);
  assert.equal(source.sourceIdentityReuse.q019AuthorityConfirmed,true);
  assert.equal(source.sourceIdentityReuse.samePdfDriveFileIdConfirmed,true);
  assert.equal(source.sourceRefAmbiguity,false);
  assert.equal(source.manualSourceChoiceRequired,false);
  assert.equal(source.ocrUsedAsAuthority,false);
});

test("Q047 binds current R04 spatial-solid mapping and exact R05 W5 closure",()=>{
  const r04=materializeR04SharedRuntimeCapabilityMatrix();
  const r05=materializeR05DeliveryWaveRebase();
  const mapping=r04.getMapping(KP); assert.ok(mapping);
  const profile=r04.profiles.find(x=>x.profileId==="profile_spatial_solid"); assert.ok(profile);
  assert.equal(mapping.mappingId,"r04map_g5b_u01_rectangular_prism_volume_formula");
  assert.equal(mapping.primaryRuntimeProfileId,"profile_spatial_solid");
  assert.equal(mapping.classificationRuleId,"rule_spatial_solid");
  assert.deepEqual(mapping.appliedModifierIds,[]);
  assert.deepEqual(profile.requiredCapabilityIds,PROFILE_REQUIRED);
  assert.deepEqual(profile.optionalCapabilityIds,PROFILE_OPTIONAL);
  assert.deepEqual(mapping.optionalRuntimeCapabilityIds,PROFILE_OPTIONAL);
  assert.deepEqual(mapping.forbiddenRuntimeCapabilityIds,[]);
  assert.deepEqual(preflight.runtimeCapabilityAuthority.mapping.requiredRuntimeCapabilityIds,mapping.requiredRuntimeCapabilityIds);
  assert.deepEqual(preflight.runtimeCapabilityAuthority.mapping.optionalRuntimeCapabilityIds,mapping.optionalRuntimeCapabilityIds);
  assert.deepEqual(preflight.runtimeCapabilityAuthority.mapping.forbiddenRuntimeCapabilityIds,mapping.forbiddenRuntimeCapabilityIds);
  const assignment=r05.getAssignment(KP); assert.ok(assignment);
  assert.equal(assignment.deliveryWaveId,"R05-W5");
  assert.equal(assignment.intraWavePrerequisiteRank,4);
  assert.equal(assignment.primaryRuntimeProfileId,"profile_spatial_solid");
  assert.deepEqual(sorted(assignment.contractOnlyRequiredCapabilityIds),sorted(REQUIRED_W5));
  assert.deepEqual(sorted(preflight.runtimeCapabilityAuthority.exactFrozenQueueRequiredW5CapabilityIds),sorted(REQUIRED_W5));
  assert.equal(preflight.q047ScopeLock.geometryConstructionRemainsOptionalNotW5Required,true);
  assert.equal(REQUIRED_W5.includes("cap_geometry_construction"),false);
});

test("Q047 owns only rectangular-prism volume formula and protects prior and future same-source siblings",()=>{
  const queue=materializeP05EW5DirectProductVerticalSliceQueue();
  assert.deepEqual(preflight.q047ScopeLock.includedKnowledgePointIds,[KP]);
  for(const relation of [
    "COMPUTE_RECTANGULAR_PRISM_VOLUME_AS_LENGTH_TIMES_WIDTH_TIMES_HEIGHT",
    "DERIVE_RECTANGULAR_PRISM_VOLUME_AS_UNITS_PER_LAYER_TIMES_NUMBER_OF_LAYERS",
    "INTERPRET_LENGTH_TIMES_WIDTH_AS_UNIT_CUBE_COUNT_PER_LAYER",
    "PRESERVE_LAYER_COUNT_AS_HEIGHT_IN_RECTANGULAR_PRISM_MODEL",
  ]) assert.ok(preflight.q047ScopeLock.includedRelations.includes(relation));
  const owners={
    kp_g5b_u01_volume_unit_conversion:19,
    kp_g5b_u01_cube_volume_formula:52,
    kp_g5b_u01_composite_rectangular_volume:52,
    kp_g5b_u01_volume_unknown_dimension:58,
  };
  for(const [kp,position] of Object.entries(owners)){
    const owner=queue.queueEntries.find(x=>x.knowledgePointIds.includes(kp)); assert.ok(owner,kp);
    assert.equal(owner.queuePosition,position,kp);
    assert.equal(preflight.q047ScopeLock.protectedFrozenQueueOwnership[kp],`Q${String(position).padStart(3,"0")}`);
  }
  assert.ok(preflight.q047ScopeLock.excludedRelations.includes("REOWN_VOLUME_UNIT_CONVERSION"));
  assert.ok(preflight.q047ScopeLock.excludedRelations.includes("DERIVE_OR_APPLY_CUBE_VOLUME_FORMULA_AS_TARGET_KP"));
  assert.ok(preflight.q047ScopeLock.excludedRelations.includes("COMPOSITE_RECTANGULAR_VOLUME_DECOMPOSITION_OR_COMPLETION"));
  assert.ok(preflight.q047ScopeLock.excludedRelations.includes("SOLVE_UNKNOWN_LENGTH_WIDTH_OR_HEIGHT_FROM_VOLUME"));
  assert.equal(preflight.q047ScopeLock.q019VolumeUnitConversionMayBeUsedAsSupportingUnitKnowledgeButNotReowned,true);
  assert.equal(preflight.q047ScopeLock.applicationImplementationAllowedByThisPreflight,false);
  assert.equal(preflight.q047ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(preflight.q047ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(preflight.q047ScopeLock.sameSourceSiblingSemanticsTouched,false);
  assert.equal(preflight.q047ScopeLock.frozenQueueAuthorityTouched,false);
  assert.equal(preflight.q047ScopeLock.r02AuthorityTouched,false);
  assert.equal(preflight.q047ScopeLock.r04AuthorityTouched,false);
  assert.equal(preflight.q047ScopeLock.r05AuthorityTouched,false);
  assert.equal(preflight.q047ScopeLock.q048OrLaterTouched,false);
});

test("Q047 preflight uses bounded validation and stops before implementation",()=>{
  assert.equal(preflight.preflightValidationBoundary.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");
  assert.equal(preflight.preflightValidationBoundary.derivedLane,"SHARED_RUNTIME_BOUNDED");
  assert.deepEqual(preflight.preflightValidationBoundary.allowedLaneGateIds,["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(preflight.preflightValidationBoundary.focusedNodeContractRequired,true);
  assert.equal(preflight.preflightValidationBoundary.nodeOnlyReadbackRequired,true);
  assert.equal(preflight.preflightValidationBoundary.fullRepositoryRegressionAllowed,false);
  assert.equal(preflight.preflightValidationBoundary.globalBrowserReplayAllowed,false);
  assert.equal(preflight.preflightValidationBoundary.productImplementationAllowed,false);
  assert.equal(preflight.preflightValidationBoundary.publicProductAdmissionAllowed,false);
  assert.equal(preflight.preflightDecision.exactFrozenQueueRowResolved,true);
  assert.equal(preflight.preflightDecision.sourceAuthoritySufficientForQ047ImplementationPlanning,true);
  assert.equal(preflight.preflightDecision.previousSliceD0Satisfied,true);
  assert.equal(preflight.preflightDecision.r02AuthorityBoundForTargetKnowledgePoint,true);
  assert.equal(preflight.preflightDecision.runtimeCapabilityContractLockedForTargetKnowledgePoint,true);
  assert.equal(preflight.preflightDecision.sameSourcePriorSliceOwnershipProtected,true);
  assert.equal(preflight.preflightDecision.futureSameSourceOwnershipProtected,true);
  assert.equal(preflight.preflightDecision.q019SameSourceIdentityReusedWithoutReclassification,true);
  assert.equal(preflight.preflightDecision.manualSourceChoiceRequired,false);
  assert.equal(preflight.preflightDecision.sourceRefAmbiguity,false);
  assert.equal(preflight.preflightDecision.separateImplementationApprovalSatisfiedByCurrentOperatorInstruction,false);
  assert.equal(preflight.preflightDecision.nextTaskRequiresNewOperatorApproval,true);
  assert.equal(preflight.preflightDecision.nextTask,"P05F_W5DirectProductVerticalSlice047Implementation");
});
