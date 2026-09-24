import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const pre=read("data/curriculum/full-product/p07f/q020-g6b-u05-work-distribution-source-authority-preflight.json");
const q019=read("docs/ci/latest-p07f-w7-q019-pages-e2e.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-08.json");
const KP="kp_g6b_u05_work_or_distribution_strategy";

test("Q020 exact frozen queue successor follows Q019 D0",()=>{
  const q=materializeP07EW7DirectProductVerticalSliceQueue(),row=q.queueEntries[19];
  assert.equal(q019.status,"PASS_E6_D0_COMPLETE");
  assert.equal(q019.exactHeadSha,"610a71b81faadb9b44d8c24adfb574d676c421e0");
  assert.equal(row.queuePosition,20);
  assert.equal(row.sliceId,"p07e_q020_r11_g6b_u05_6b05_profile_factor_multiple_c1");
  assert.equal(row.previousSliceId,"p07e_q019_r11_g6b_u04_6b04_profile_ratio_percent_c1");
  assert.deepEqual([...row.knowledgePointIds],[KP]);
  assert.equal(row.primarySourceNodeId,"g6b_u05_6b05");
  assert.equal(row.primaryRuntimeProfileId,"profile_factor_multiple");
  assert.equal(row.intraWavePrerequisiteRank,11);
});

test("Q020 source identity and direct multi-condition visual witness are locked",()=>{
  const s=pre.sourceAuthority,v=s.currentDirectVisualVerification;
  assert.equal(s.sourcePdfDriveFileId,"19lrR3_bvpKIoJq5DsKaiQOUecsCzNDsl");
  assert.equal(s.sourcePdfSizeBytes,849178);
  assert.equal(s.sourcePdfSha256,"1be6a253b422a427bf4a20a09ee478400f39a11e9b817c1acee308e5f6b9403b");
  assert.equal(s.pageCount,2);
  assert.deepEqual(s.reviewedPages,[1,2]);
  assert.equal(v.completed,true);
  assert.equal(v.ocrUsedAsAuthority,false);
  assert.deepEqual(v.targetEvidencePages,[2]);
  assert.equal(v.directSupportClassification,"DIRECT_LITERAL_MULTI_CONDITION_SHARED_QUANTITY_MODEL_EVIDENCE");
  assert.equal(s.evidenceResolution.newSupplementaryEvidenceRequired,false);
  assert.equal(s.evidenceResolution.manualEvidenceChoiceRequired,false);
});

test("Q020 exact R02 target is the last same-source candidate and prior owners remain protected",()=>{
  const src=r02.sourceRecords.find(x=>x.sourceNodeId==="g6b_u05_6b05"),c=src?.candidates.find(x=>x.knowledgePointId===KP);assert.ok(c);
  assert.equal(c.canonicalNameZh,"工作分配與策略問題");
  assert.equal(c.capabilityStatement,"學生能把複合條件轉成份數、倍數或總量關係。");
  assert.equal(c.reasoningInvariant,"每個條件都必須在同一數量模型中成立，答案須回代驗證。");
  assert.deepEqual(c.evidencePages,[1,2]);
  assert.deepEqual(pre.r02ReviewedCandidateAuthority.predecessorOwnedKnowledgePointIds,[
    "kp_g6b_u05_sum_difference_problem",
    "kp_g6b_u05_age_or_repeated_relation_problem",
    "kp_g6b_u05_difference_multiple_problem",
    "kp_g6b_u05_sum_multiple_problem"
  ]);
  assert.equal(pre.r02ReviewedCandidateAuthority.sameSourceCandidateSetCompleteAfterQ020Implementation,true);
});

test("Q020 semantic lock owns shared multi-condition model and excludes combinatorics or predecessor reownership",()=>{
  const s=pre.semanticProfileLock,m=s.implementationSemanticLock;
  assert.equal(s.targetSemanticCore,"MULTI_CONDITION_TO_SHARED_QUANTITY_MODEL_AND_BACK_SUBSTITUTION");
  assert.equal(m.multipleConditionsMustBindSameUnknownQuantities,true);
  assert.equal(m.totalCountOrTotalQuantityConditionAllowed,true);
  assert.equal(m.weightedTotalConditionAllowed,true);
  assert.equal(m.answerMustBackSubstituteAllSourceConditions,true);
  assert.equal(m.sourceBoatDistributionFamilyAllowed,true);
  assert.equal(m.sourceTransportCostDistributionFamilyAllowed,true);
  assert.equal(m.sumDifferenceProblemReownershipAllowed,false);
  assert.equal(m.sumMultipleProblemReownershipAllowed,false);
  assert.equal(m.differenceMultipleProblemReownershipAllowed,false);
  assert.equal(m.ageOrRepeatedRelationProblemReownershipAllowed,false);
  assert.equal(m.pureCombinatoricsOwnershipAllowed,false);
  assert.equal(m.routeCountingOwnershipAllowed,false);
  assert.equal(m.sameUnitMixedModeAllowed,false);
  assert.equal(m.crossUnitMixedModeAllowed,false);
});

test("Q020 provisional preflight remains planning-only until exact executable authority readback",()=>{
  assert.equal(pre.status,"PREFLIGHT_EXECUTABLE_AUTHORITY_READBACK_PENDING");
  assert.equal(pre.executableAuthorityReadback.pending,true);
  assert.equal(pre.q020ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(pre.q020ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(pre.preflightDecision.sourceAuthoritySufficientForQ020ImplementationPlanning,true);
  assert.equal(pre.preflightDecision.manualSourceChoiceRequired,false);
  assert.equal(pre.preflightDecision.manualEvidenceChoiceRequired,false);
  assert.equal(pre.preflightDecision.executableRuntimeReadbackRequiredBeforeMerge,true);
  assert.equal(pre.preflightDecision.separateImplementationApprovalRequired,true);
  const impact=read("data/project/change-impact/P07F_W7_Q020_PREFLIGHT.impact.json"),plan=read("data/project/validation-plans/P07F_W7_Q020_PREFLIGHT.validation.json");
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.deepEqual(plan.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(pre.preflightValidationBoundary.fullRepositoryRegressionAllowed,false);
  assert.equal(pre.preflightValidationBoundary.globalBrowserReplayAllowed,false);
});
