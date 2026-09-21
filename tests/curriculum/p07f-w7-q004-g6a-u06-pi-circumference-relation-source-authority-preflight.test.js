import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p07f/q004-g6a-u06-pi-circumference-relation-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-07.json");
const KP="kp_g6a_u06_pi_circumference_relation";

test("W7 Q004 preflight binds exact fourth frozen queue slice after Q003 D0",()=>{
  const result=materializeP07EW7DirectProductVerticalSliceQueue(),slice=result.queueEntries[3];
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(result.queueEntries.length,26);assert.equal(result.queueRegistryParity,true);
  assert.equal(slice.queuePosition,4);
  assert.equal(slice.sliceId,"p07e_q004_r7_g6a_u06_6a06_profile_geometry_formula_c1");
  assert.equal(slice.implementationTaskId,"P07F_W7DirectProductVerticalSlice004Implementation");
  assert.equal(slice.previousSliceId,"p07e_q003_r7_g6a_u05_6a05_profile_integer_operations_c1");
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.primarySourceNodeId,"g6a_u06_6a06");
  assert.deepEqual(slice.supportingSourceNodeIds,["g6a_u06_6a06"]);
  assert.equal(slice.intraWavePrerequisiteRank,7);
  assert.equal(slice.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.equal(slice.chunkIndex,1);
  assert.deepEqual(slice.knowledgePointIds,[KP]);
  assert.deepEqual(slice.requiredW7CapabilityIds,[]);
  assert.equal(p.predecessorD0Evidence.q003Status,"PASS_E6_D0_COMPLETE");
  assert.equal(p.predecessorD0Evidence.q003MergeSha,"f787cdd8ff09c65dc32c9056a09ac936e5119429");
  assert.equal(p.predecessorD0Evidence.q003PostMergeWorkflowRunId,35601785628);
  assert.equal(p.predecessorD0Evidence.exactDeployedAssetDigestParity,true);
});

test("W7 Q004 binds reviewed G6A-U06 candidate and transparent current visual readback",()=>{
  const source=r02.sourceRecords.find(row=>row.sourceNodeId==="g6a_u06_6a06");assert.ok(source);
  const target=source.candidates.find(row=>row.knowledgePointId===KP);assert.ok(target);
  assert.equal(source.sourceTitle,"圓周長與扇形周長");
  assert.equal(source.sourcePdfTitle,"meow911_6a06_source.pdf");
  assert.equal(source.pageCount,2);assert.deepEqual(source.reviewedPages,[1,2]);
  assert.equal(target.canonicalNameZh,"圓周率與圓周長關係");
  assert.equal(target.capabilityStatement,"學生能理解圓周長除以直徑約為圓周率。");
  assert.equal(target.reasoningInvariant,"同類圓的圓周長與直徑成固定比。");
  assert.deepEqual(target.evidencePages,[1,2]);assert.equal(target.category,"geometry");
  assert.equal(p.sourceAuthority.sourcePdfDriveFileId,"1kUsHZcQ9pyLNyBc6bduLb7UOnQPUFmOk");
  assert.equal(p.sourceAuthority.sourcePdfSizeBytes,644331);
  assert.equal(p.sourceAuthority.sourcePdfSha256,"e21d00e73df47d6ce7ae2d8d1dd2e8cbed04380a45ece38bc4d4df7fe08ebcf4");
  assert.equal(p.sourceAuthority.currentVisualReadbackAuthority.reviewMethod,"CURRENT_FULL_PAGE_VISUAL_READBACK_200_DPI");
  assert.equal(p.sourceAuthority.currentVisualReadbackAuthority.literalPiCircumferenceRatioStatementVisiblyPresent,false);
  assert.equal(p.sourceAuthority.currentVisualReadbackAuthority.targetSemanticAuthorityTherefore,"R02_REVIEWED_CANDIDATE_PRIMARY_CURRENT_VISUAL_CONTEXT_SECONDARY");
  assert.equal(p.sourceAuthority.directPageEvidence.pages1To2.currentVisualSupportLevel,"INDIRECT_CONTEXTUAL_NOT_LITERAL_STATEMENT");
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.sourceRefAmbiguity,false);
});

test("W7 Q004 executable R04 and R05 mapping match frozen geometry-formula envelope",()=>{
  const r04=getR04KnowledgePointCapabilityMapping(KP);assert.ok(r04);
  const r05=getR05DeliveryWaveAssignment(KP);assert.ok(r05);
  assert.equal(r04.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.equal(r04.classificationRuleId,"rule_geometry_formula");
  assert.deepEqual(r04.appliedModifierIds,p.runtimeCapabilityAuthority.executableR04Mapping.appliedModifierIds);
  assert.deepEqual(r04.requiredRuntimeCapabilityIds,p.runtimeCapabilityAuthority.executableR04Mapping.requiredRuntimeCapabilityIds);
  assert.deepEqual(r04.optionalRuntimeCapabilityIds,p.runtimeCapabilityAuthority.executableR04Mapping.optionalRuntimeCapabilityIds);
  assert.equal(r05.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.equal(r05.baseDeliveryWaveId,"R05-W5");
  assert.equal(r05.deliveryWaveId,"R05-W7");
  assert.equal(r05.waveEscalatedByPrerequisite,true);
  assert.equal(r05.prerequisiteWaveLowerBound,7);
  assert.equal(r05.intraWavePrerequisiteRank,7);
  assert.deepEqual(p.runtimeCapabilityAuthority.r05Assignment,{baseDeliveryWaveId:"R05-W5",deliveryWaveId:"R05-W7",waveEscalatedByPrerequisite:true,prerequisiteWaveLowerBound:7,intraWavePrerequisiteRank:7});
  assert.equal(p.runtimeCapabilityAuthority.exactR04R05ProfileParityVerified,true);
  assert.equal(r04.primaryRuntimeProfileId,r05.primaryRuntimeProfileId);
  assert.equal(p.runtimeCapabilityAuthority.runtimeProfileReclassificationAllowed,false);
});

test("W7 Q004 semantic lock owns C over d approximately pi relation but not circumference formula applications",()=>{
  const s=p.semanticProfileLock.implementationSemanticLock;
  assert.equal(p.semanticProfileLock.targetSemanticCore,"CIRCUMFERENCE_DIVIDED_BY_DIAMETER_APPROX_PI");
  assert.equal(s.circumferenceRoleRequired,true);
  assert.equal(s.diameterRoleRequired,true);
  assert.equal(s.diameterMustBePositiveNonzero,true);
  assert.equal(s.quotientDirectionRequired,"CIRCUMFERENCE_DIVIDED_BY_DIAMETER");
  assert.equal(s.quotientApproximatelyPiRequired,true);
  assert.equal(s.fixedRatioAcrossCirclesRequired,true);
  assert.equal(s.approximatePiValueMayBeRepresentedAs3Point14,true);
  assert.equal(s.solveCircumferenceFromDiameterAllowed,false);
  assert.equal(s.solveDiameterFromCircumferenceAllowed,false);
  assert.equal(s.circumferenceFormulaTeachingReownershipAllowed,false);
  assert.equal(s.radiusBasedFormulaAllowed,false);
  assert.equal(s.semicirclePerimeterAllowed,false);
  assert.equal(s.sectorArcLengthAllowed,false);
  assert.equal(s.compositeArcPerimeterAllowed,false);
  assert.equal(s.rollingWheelApplicationAllowed,false);
  assert.equal(s.genericGeometryFormulaDrillAllowed,false);
  assert.equal(s.applicationContextAllowed,false);
  assert.equal(s.sameUnitMixedModeAllowed,false);
  assert.equal(s.crossUnitMixedModeAllowed,false);
  assert.deepEqual(p.r02ReviewedCandidateAuthority.futureFrozenQueueOwnedKnowledgePointRows.map(x=>x.queuePosition),[6,10]);
  assert.deepEqual(p.r02ReviewedCandidateAuthority.sourceOnlyNotAdmittedByQ004KnowledgePointIds,["kp_g6a_u06_sector_arc_length","kp_g6a_u06_composite_arc_perimeter"]);
});

test("W7 Q004 preflight stays planning-only SHARED_RUNTIME_BOUNDED",()=>{
  const impact=read("data/project/change-impact/P07F_W7_Q004_PREFLIGHT.impact.json");
  const validation=read("data/project/validation-plans/P07F_W7_Q004_PREFLIGHT.validation.json");
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.equal(impact.scopeGuards.publicAdmission,false);
  assert.equal(impact.scopeGuards.q003ProductMutation,false);
  assert.equal(impact.scopeGuards.q005OrLater,false);
  assert.equal(p.q004ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q004ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(validation.lanes.SHARED_RUNTIME_BOUNDED[1].runtime,"NODE_ONLY");
  assert.equal(p.preflightValidationBoundary.fullRepositoryRegressionAllowed,false);
  assert.equal(p.preflightValidationBoundary.globalBrowserReplayAllowed,false);
  assert.equal(p.preflightDecision.separateImplementationApprovalRequired,true);
  assert.equal(p.preflightDecision.nextTask,"P07F_W7DirectProductVerticalSlice004Implementation");
});
