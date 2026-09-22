import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p07f/q009-g6a-u05-ratio-partition-application-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-06.json");
const KP="kp_g6a_u05_ratio_partition_application";

test("W7 Q009 preflight binds frozen ninth queue slice after Q008 D0",()=>{
  const result=materializeP07EW7DirectProductVerticalSliceQueue(),slice=result.queueEntries[8];
  assert.ok(["PREFLIGHT_MATERIALIZED_AWAITING_EXECUTABLE_RUNTIME_READBACK","PASS_SOURCE_AUTHORITY_PREFLIGHT"].includes(p.status));
  assert.equal(result.queueEntries.length,26);assert.equal(result.queueRegistryParity,true);
  assert.equal(slice.queuePosition,9);
  assert.equal(slice.sliceId,"p07e_q009_r9_g6a_u05_6a05_profile_ratio_percent_c1");
  assert.equal(slice.implementationTaskId,"P07F_W7DirectProductVerticalSlice009Implementation");
  assert.equal(slice.previousSliceId,"p07e_q008_r9_g5b_u08_5b08_profile_ratio_percent_c1");
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.primarySourceNodeId,"g6a_u05_6a05");
  assert.ok(slice.supportingSourceNodeIds.includes("g6a_u05_6a05"));
  assert.equal(slice.intraWavePrerequisiteRank,9);
  assert.equal(slice.primaryRuntimeProfileId,"profile_ratio_percent");
  assert.ok(slice.knowledgePointIds.includes(KP));
  assert.equal(p.predecessorD0Evidence.q008Status,"PASS_E6_D0_COMPLETE");
  assert.equal(p.predecessorD0Evidence.q008PostMergeWorkflowRunId,35706697557);
});

test("W7 Q009 binds R02 ratio-partition candidate and preserves page-localization mismatch explicitly",()=>{
  const source=r02.sourceRecords.find(row=>row.sourceNodeId==="g6a_u05_6a05");assert.ok(source);
  const target=source.candidates.find(row=>row.knowledgePointId===KP);assert.ok(target);
  assert.equal(target.canonicalNameZh,"按比分配");
  assert.equal(target.capabilityStatement,"學生能依給定比把總量分配成各部分。");
  assert.equal(target.reasoningInvariant,"各部分份數比符合指定比，部分和等於總量。");
  assert.deepEqual(target.evidencePages,[1]);
  assert.equal(p.sourceAuthority.sourcePdfDriveFileId,"1f2VouY0XucxQ_jjVHzi1CbHklyQhpnAF");
  assert.equal(p.sourceAuthority.sourcePdfSizeBytes,1463604);
  assert.equal(p.sourceAuthority.sourcePdfSha256,"282b7ee25093afdd3b50c1077c168c30da0118bac4010f98aed09471e1ae5e4c");
  assert.ok(p.sourceAuthority.currentVisualReadbackAuthority.page3VisibleFamilies.includes("RATIO_PARTITION_APPLICATION"));
  assert.deepEqual(p.sourceAuthority.directEvidence.r02TargetEvidencePages,[1]);
  assert.deepEqual(p.sourceAuthority.directEvidence.currentVisualDirectSupportingPages,[3]);
  assert.equal(p.sourceAuthority.directEvidence.evidenceLocalizationMismatchPreservedExplicitly,true);
  assert.equal(p.sourceAuthority.directEvidence.semanticConflictDetected,false);
  assert.equal(p.sourceAuthority.driveMetadataReadback.verificationNotesStatus,"pending");
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.sourceRefAmbiguity,false);
});

test("W7 Q009 runtime readback resolves frozen ratio-percent profile without reclassification",()=>{
  const r04=getR04KnowledgePointCapabilityMapping(KP),r05=getR05DeliveryWaveAssignment(KP);
  assert.ok(r04);assert.ok(r05);
  assert.equal(r04.primaryRuntimeProfileId,"profile_ratio_percent");
  assert.equal(r05.primaryRuntimeProfileId,"profile_ratio_percent");
  assert.equal(r05.deliveryWaveId,"R05-W7");
  assert.equal(r05.intraWavePrerequisiteRank,9);
  assert.equal(p.runtimeCapabilityAuthority.runtimeProfileReclassificationAllowed,false);
});

test("W7 Q009 semantic lock owns ratio partition with total conservation only",()=>{
  const s=p.semanticProfileLock.implementationSemanticLock;
  assert.equal(p.semanticProfileLock.targetSemanticCore,"PARTITION_TOTAL_BY_GIVEN_RATIO_WITH_SUM_CONSERVATION");
  assert.equal(s.givenTotalQuantityRequired,true);
  assert.equal(s.givenOrderedRatioTermsRequired,true);
  assert.equal(s.ratioTermsMustBePositiveForInitialGenerator,true);
  assert.equal(s.ratioTermSumMustBePositive,true);
  assert.equal(s.computeTotalRatioUnitsAllowed,true);
  assert.equal(s.computeOneRatioUnitFromTotalAllowed,true);
  assert.equal(s.computeEachPartByRatioTermAllowed,true);
  assert.equal(s.verifyPartSumEqualsTotalRequired,true);
  assert.equal(s.verifyResultingPartRatioMatchesGivenRatioRequired,true);
  assert.equal(s.ratioPartitionTextApplicationContextAllowed,true);
  assert.equal(s.q001RatioNotationTeachingReownershipAllowed,false);
  assert.equal(s.q002RatioValueTeachingReownershipAllowed,false);
  assert.equal(s.q003EquivalentRatioTeachingReownershipAllowed,false);
  assert.equal(s.q005SimplifyRatioTeachingReownershipAllowed,false);
  assert.equal(s.ratioDifferenceApplicationAllowed,false);
  assert.equal(s.unitRateApplicationAllowed,false);
  assert.equal(s.mixedFractionRatioApplicationAllowed,false);
  assert.equal(s.proportionCrossMultiplicationAsTaughtMethodAllowed,false);
  assert.equal(s.directProportionTableOrGraphAllowed,false);
  assert.equal(s.percentConversionAllowed,false);
  assert.equal(s.nonPartitionRateApplicationAllowed,false);
  assert.equal(s.ratioScaleApplicationAllowed,false);
  assert.equal(s.sameUnitMixedModeAllowed,false);
  assert.equal(s.crossUnitMixedModeAllowed,false);
});

test("W7 Q009 preflight remains planning-only SHARED_RUNTIME_BOUNDED",()=>{
  const impact=read("data/project/change-impact/P07F_W7_Q009_PREFLIGHT.impact.json");
  const validation=read("data/project/validation-plans/P07F_W7_Q009_PREFLIGHT.validation.json");
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.equal(impact.scopeGuards.publicAdmission,false);
  assert.equal(p.q009ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q009ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(validation.lanes.SHARED_RUNTIME_BOUNDED[1].runtime,"NODE_ONLY");
  assert.equal(p.preflightValidationBoundary.fullRepositoryRegressionAllowed,false);
  assert.equal(p.preflightValidationBoundary.globalBrowserReplayAllowed,false);
});
