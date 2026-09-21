import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP06EW6DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p06e-w6-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p06f/q019-g6b-u05-sum-difference-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-08.json");
const profiles=read("data/curriculum/global/runtime/r04/runtime-capability-profiles.json");
const KP="kp_g6b_u05_sum_difference_problem";

test("W6 Q019 preflight closes Q018 full-regression blocker as exact baseline-only parity",()=>{
  const a=p.predecessorD0Evidence.postMergeFullRegressionAttribution;
  assert.equal(a.currentRunId,35558809801);
  assert.equal(a.currentFailureCount,134);
  assert.equal(a.comparisonBaselineRunId,35555787005);
  assert.equal(a.comparisonBaselineFailureCount,134);
  assert.equal(a.addedFailureCount,0);
  assert.equal(a.removedFailureCount,0);
  assert.equal(a.failureNameSetIdentical,true);
  assert.equal(a.classification,"BASELINE_ONLY_NON_GATING_FOR_Q018_D0");
});

test("W6 Q019 preflight binds exact frozen queue position 19 after Q018 D0",()=>{
  const slice=materializeP06EW6DirectProductVerticalSliceQueue().queueEntries[18];
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(slice.queuePosition,19);
  assert.equal(slice.sliceId,"p06e_q019_r10_g6b_u05_6b05_profile_decimal_c1");
  assert.equal(slice.implementationTaskId,"P06F_W6DirectProductVerticalSlice019Implementation");
  assert.equal(slice.previousSliceId,"p06e_q018_r9_g6a_u03_6a03_profile_pattern_relation_c1");
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.primarySourceNodeId,"g6b_u05_6b05");
  assert.deepEqual(slice.supportingSourceNodeIds,["g6b_u05_6b05"]);
  assert.equal(slice.intraWavePrerequisiteRank,10);
  assert.equal(slice.primaryRuntimeProfileId,"profile_decimal");
  assert.equal(slice.chunkIndex,1);
  assert.deepEqual(slice.knowledgePointIds,[KP]);
  assert.deepEqual(slice.requiredW6CapabilityIds,[]);
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.prNumber,1008);
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.mergeSha,"eb8f8bf20b47c1ce9a38a572a58d655747d8a4c7");
  assert.equal(p.predecessorD0Evidence.immediatePredecessor.liveReportStatus,"PASS_E6_D0_COMPLETE");
});

test("W6 Q019 binds current two-page visual review and R02 sum-difference candidate",()=>{
  const source=r02.sourceRecords.find(row=>row.sourceNodeId==="g6b_u05_6b05");assert.ok(source);
  assert.equal(source.sourceTitle,"怎樣解題");assert.equal(source.sourcePdfTitle,"meow911_6b05_source.pdf");assert.deepEqual(source.reviewedPages,[1,2]);
  const target=source.candidates.find(row=>row.knowledgePointId===KP);assert.ok(target);
  assert.equal(target.canonicalNameZh,"和差問題");
  assert.equal(target.capabilityStatement,"學生能由兩量的和與差求各量。");
  assert.equal(target.reasoningInvariant,"較大數等於和加差的一半，較小數等於和減差的一半。");
  assert.deepEqual(target.evidencePages,[1,2]);
  assert.equal(p.sourceAuthority.sourcePdfDriveFileId,"19lrR3_bvpKIoJq5DsKaiQOUecsCzNDsl");
  assert.equal(p.sourceAuthority.sourcePdfSizeBytes,849178);
  assert.equal(p.sourceAuthority.sourcePdfSha256,"1be6a253b422a427bf4a20a09ee478400f39a11e9b817c1acee308e5f6b9403b");
  assert.equal(p.sourceAuthority.pageCount,2);
  assert.equal(p.sourceAuthority.reviewMethod,"FULL_PAGE_VISUAL_READBACK_200_DPI");
  assert.deepEqual(p.sourceAuthority.visualReadback.targetEvidencePages,[1,2]);
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.sourceRefAmbiguity,false);
});

test("W6 Q019 freezes profile_decimal as runtime envelope without changing source semantic ownership",()=>{
  const profile=profiles.profiles.find(row=>row.profileId==="profile_decimal");assert.ok(profile);
  assert.deepEqual(profile.requiredCapabilityIds,["cap_decimal_number_system","cap_decimal_domain_validator","cap_text_numeric_representation"]);
  assert.deepEqual(profile.optionalCapabilityIds,[]);
  const mapping=getR04KnowledgePointCapabilityMapping(KP);assert.ok(mapping);
  assert.equal(mapping.primaryRuntimeProfileId,"profile_decimal");
  assert.equal(p.runtimeCapabilityAuthority.profileSemanticMismatch.present,true);
  assert.equal(p.runtimeCapabilityAuthority.profileSemanticMismatch.profileIsRuntimeEnvelopeOnly,true);
  assert.equal(p.runtimeCapabilityAuthority.profileSemanticMismatch.decimalPlaceValueMayNotBecomeCore,true);
  assert.equal(p.runtimeCapabilityAuthority.profileSemanticMismatch.decimalNotationMayNotBeForcedByProfileName,true);
  assert.equal(p.runtimeCapabilityAuthority.runtimeProfileReclassificationAllowed,false);
});

test("W6 Q019 semantic lock is exact sum-difference decomposition and protects adjacent G6B-U05 capabilities",()=>{
  const s=p.semanticProfileLock.implementationSemanticLock;
  assert.equal(s.knownSumAndDifferenceAreCore,true);
  assert.equal(s.largerQuantityFormula,"(sum + difference) / 2");
  assert.equal(s.smallerQuantityFormula,"(sum - difference) / 2");
  assert.equal(s.largerPlusSmallerMustReconstructSum,true);
  assert.equal(s.largerMinusSmallerMustReconstructDifference,true);
  assert.equal(s.differenceMeansLargerMinusSmaller,true);
  assert.equal(s.integerExactPartitionIsSourceBacked,true);
  assert.equal(s.decimalPlaceValueReasoningIsCore,false);
  assert.equal(s.decimalNotationIsCore,false);
  assert.equal(s.sumMultipleProblemReownershipAllowed,false);
  assert.equal(s.differenceMultipleProblemReownershipAllowed,false);
  assert.equal(s.ageOrRepeatedRelationProblemReownershipAllowed,false);
  assert.equal(s.workOrDistributionStrategyReownershipAllowed,false);
  assert.equal(s.q020ReownershipAllowed,false);
});

test("W6 Q019 remains planning-only SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(p.q019ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q019ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(p.q019ScopeLock.q001ToQ018ProductMutationAllowed,false);
  assert.equal(p.q019ScopeLock.q020Touched,false);
  assert.equal(p.preflightDecision.separateImplementationApprovalRequired,true);
  assert.equal(p.preflightDecision.nextTask,"P06F_W6DirectProductVerticalSlice019Implementation");
  const impact=read("data/project/change-impact/P06F_W6_Q019_PREFLIGHT.impact.json");
  const validation=read("data/project/validation-plans/P06F_W6_Q019_PREFLIGHT.validation.json");
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.changeImpact.affectedRoutes,"BOUNDED");
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(validation.lanes.SHARED_RUNTIME_BOUNDED[1].runtime,"NODE_ONLY");
  assert.equal(p.preflightValidationBoundary.fullRepositoryRegressionAllowed,false);
  assert.equal(p.preflightValidationBoundary.globalBrowserReplayAllowed,false);
  assert.equal(p.preflightDecision.manualSourceChoiceRequired,false);
  assert.equal(p.preflightDecision.sourceRefAmbiguity,false);
});
