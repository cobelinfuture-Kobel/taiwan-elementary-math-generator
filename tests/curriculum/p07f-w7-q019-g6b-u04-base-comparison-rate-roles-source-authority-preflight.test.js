import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const pre=read("data/curriculum/full-product/p07f/q019-g6b-u04-base-comparison-rate-roles-source-authority-preflight.json");
const q018=read("docs/ci/latest-p07f-w7-q018-pages-e2e.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-08.json");
const KP="kp_g6b_u04_base_comparison_rate_roles";

test("Q019 exact frozen queue successor follows Q018 D0",()=>{
  const q=materializeP07EW7DirectProductVerticalSliceQueue(),row=q.queueEntries[18];
  assert.equal(q018.status,"PASS_E6_D0_COMPLETE");
  assert.equal(q018.exactHeadSha,"e3b29cb2d67839d796f6ce030f647adf8fe4611f");
  assert.equal(row.queuePosition,19);
  assert.equal(row.sliceId,"p07e_q019_r11_g6b_u04_6b04_profile_ratio_percent_c1");
  assert.equal(row.previousSliceId,"p07e_q018_r11_g6b_u03_6b03_profile_spatial_solid_c1");
  assert.deepEqual([...row.knowledgePointIds],[KP]);
  assert.equal(row.primarySourceNodeId,"g6b_u04_6b04");
  assert.equal(row.primaryRuntimeProfileId,"profile_ratio_percent");
  assert.equal(row.intraWavePrerequisiteRank,11);
});

test("Q019 source identity and direct role-relation visual witness are locked",()=>{
  const s=pre.sourceAuthority,v=s.currentDirectVisualVerification;
  assert.equal(s.sourcePdfDriveFileId,"1hfuht0gTaeU21wGybATAxszE9R5T8ted");
  assert.equal(s.sourcePdfSizeBytes,998852);
  assert.equal(s.sourcePdfSha256,"5b4ac562056913988f3267eb745fb5bf5d1ba693ee2df039d831281930457b0b");
  assert.equal(s.pageCount,2);
  assert.deepEqual(s.reviewedPages,[1,2]);
  assert.equal(v.completed,true);
  assert.equal(v.ocrUsedAsAuthority,false);
  assert.equal(v.directSupportClassification,"DIRECT_LITERAL_RATE_RELATION_ROLE_EVIDENCE");
  assert.deepEqual(s.targetEvidenceReconciliation.exactDirectVisualEvidencePages,[1,2]);
  assert.equal(s.newSupplementaryEvidenceRequired,false);
});

test("Q019 exact R02 candidate is base/comparison/rate roles and future same-source ownership remains protected",()=>{
  const src=r02.sourceRecords.find(x=>x.sourceNodeId==="g6b_u04_6b04"),c=src?.candidates.find(x=>x.knowledgePointId===KP);assert.ok(c);
  assert.equal(c.canonicalNameZh,"基準量比較量比率角色");
  assert.equal(c.capabilityStatement,"學生能辨認基準量、比較量與比率。");
  assert.equal(c.reasoningInvariant,"比較量等於基準量乘比率，分母角色固定為基準量。");
  assert.deepEqual(c.evidencePages,[1,2]);
  assert.deepEqual(pre.r02ReviewedCandidateAuthority.protectedFutureSameSourceKnowledgePointIds,[
    "kp_g6b_u04_find_base_quantity","kp_g6b_u04_find_comparison_quantity","kp_g6b_u04_find_rate_from_quantities","kp_g6b_u04_successive_rate_change"
  ]);
});

test("Q019 semantic lock owns role identification only",()=>{
  const s=pre.semanticProfileLock,m=s.implementationSemanticLock;
  assert.equal(s.targetSemanticCore,"IDENTIFY_BASE_COMPARISON_RATE_ROLES_AND_DIRECTION");
  assert.equal(m.identifyBaseQuantityRoleRequired,true);
  assert.equal(m.identifyComparisonQuantityRoleRequired,true);
  assert.equal(m.identifyRateRoleRequired,true);
  assert.equal(m.relationDirectionRequired,true);
  assert.equal(m.baseQuantityIsDenominatorRoleRequired,true);
  assert.equal(m.solveForBaseQuantityAllowed,false);
  assert.equal(m.solveForComparisonQuantityAllowed,false);
  assert.equal(m.solveForRateAllowed,false);
  assert.equal(m.successiveRateChangeAllowed,false);
  assert.equal(m.sameUnitMixedModeAllowed,false);
  assert.equal(m.crossUnitMixedModeAllowed,false);
});

test("Q019 provisional preflight remains planning-only until exact executable authority readback",()=>{
  assert.equal(pre.status,"PREFLIGHT_EXECUTABLE_AUTHORITY_READBACK_PENDING");
  assert.equal(pre.executableAuthorityReadback.pending,true);
  assert.equal(pre.q019ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(pre.q019ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(pre.preflightDecision.sourceAuthoritySufficientForQ019ImplementationPlanning,true);
  assert.equal(pre.preflightDecision.manualSourceChoiceRequired,false);
  assert.equal(pre.preflightDecision.manualEvidenceChoiceRequired,false);
  assert.equal(pre.preflightDecision.executableRuntimeReadbackRequiredBeforeMerge,true);
  assert.equal(pre.preflightDecision.separateImplementationApprovalRequired,true);
  const impact=read("data/project/change-impact/P07F_W7_Q019_PREFLIGHT.impact.json"),plan=read("data/project/validation-plans/P07F_W7_Q019_PREFLIGHT.validation.json");
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.deepEqual(plan.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(pre.preflightValidationBoundary.fullRepositoryRegressionAllowed,false);
  assert.equal(pre.preflightValidationBoundary.globalBrowserReplayAllowed,false);
});
