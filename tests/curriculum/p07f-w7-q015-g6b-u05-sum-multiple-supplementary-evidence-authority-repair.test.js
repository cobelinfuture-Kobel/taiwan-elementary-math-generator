import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {getR03DirectPrerequisites} from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const repair=read("data/curriculum/full-product/p07f/q015-g6b-u05-sum-multiple-supplementary-evidence-authority-repair.json");
const prior=read("data/curriculum/full-product/p07f/q015-g6b-u05-factor-multiple-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-08.json");
const D="kp_g6b_u05_difference_multiple_problem",S="kp_g6b_u05_sum_multiple_problem";

test("Q015 repair preserves blocked preflight audit and original source truth",()=>{
  assert.equal(prior.status,"BLOCKED_SUM_MULTIPLE_DIRECT_EVIDENCE_MISSING_REQUIRES_OPERATOR_SUPPLEMENTARY_EVIDENCE_SELECTION");
  assert.equal(prior.currentVisualEvidenceResolution.differenceMultiple.directSupport,true);
  assert.equal(prior.currentVisualEvidenceResolution.sumMultiple.directSupport,false);
  assert.equal(repair.priorPreflight.auditStatePreserved,true);
  assert.equal(repair.sourceAuthorityReconciliation.originalCurriculumSource.differenceMultipleDirectEvidencePresent,true);
  assert.equal(repair.sourceAuthorityReconciliation.originalCurriculumSource.sumMultipleDirectEvidencePresent,false);
});

test("Q015 supplementary exam PDF directly and exactly witnesses the sum-multiple invariant",()=>{
  const s=repair.sourceAuthorityReconciliation.supplementaryEvidence;
  assert.equal(s.authorityType,"EXISTING_PROJECT_DRIVE_EXAM_PDF_SUPPLEMENTARY_EVIDENCE");
  assert.equal(s.driveFileId,"1-m7SwI4NcyWEhyymQ9gE3mL_KeDE21Wc");
  assert.equal(s.sizeBytes,191925);
  assert.equal(s.pageCount,3);
  assert.equal(s.sha256,"b69d5e746ccc8c986dce156edcb92f7a75c2fad60dccf185a6894013d52d0467");
  assert.equal(s.exactEvidencePage,1);
  assert.equal(s.exactEvidenceLocation,"二、填填看，第5題");
  assert.match(s.exactProblemText,/甲數是乙數的5倍/);
  assert.match(s.exactProblemText,/和是480/);
  assert.deepEqual(s.directSemanticWitness,{totalQuantity:480,largerIsSmallerTimes:5,totalParts:6,onePart:80,smallerQuantity:80,largerQuantity:400,invariant:"總量按總份數 k+1 平均分，先求一份，再依倍數重建各量。",semanticClass:"SUM_MULTIPLE_RELATION_MODEL"});
  assert.deepEqual(Object.values(s.directSemanticCoverage),[true,true,true,true,true,true]);
  assert.equal(s.sufficiency,"SUFFICIENT_FOR_Q015_SUM_MULTIPLE_SEMANTIC_PLANNING_AND_OWNERSHIP_LOCK");
  assert.equal(s.durableDriveMutationRequired,false);
});

test("Q015 reconciliation keeps frozen R02 text for both KPs and does not silently rewrite evidence pages",()=>{
  const src=r02.sourceRecords.find(x=>x.sourceNodeId==="g6b_u05_6b05");assert.ok(src);
  const d=src.candidates.find(x=>x.knowledgePointId===D),s=src.candidates.find(x=>x.knowledgePointId===S);assert.ok(d);assert.ok(s);
  assert.equal(d.canonicalNameZh,"差倍問題");assert.equal(s.canonicalNameZh,"和倍問題");
  assert.deepEqual(d.evidencePages,[1,2]);assert.deepEqual(s.evidencePages,[1,2]);
  const rec=repair.sourceAuthorityReconciliation.r02Reconciliation;
  assert.equal(rec.r02MutationApplied,false);assert.equal(rec.historicalCandidateTextPreserved,true);assert.equal(rec.historicalEvidencePagesConsumedAsDirectSumMultipleWitness,false);assert.equal(rec.silentRewriteAllowed,false);
});

test("Q015 exact R03 remains unchanged for both factor-multiple KPs",()=>{
  const expected=repair.prerequisiteLock.byKnowledgePoint;
  for(const kp of [D,S]){
    const actual=getR03DirectPrerequisites(kp).map(e=>({knowledgePointId:e.fromKnowledgePointId,dependencyStrength:e.dependencyStrength,dependencyRole:e.dependencyRole,distanceBearing:e.distanceBearing})).sort((a,b)=>a.knowledgePointId.localeCompare(b.knowledgePointId));
    assert.deepEqual(actual,[...expected[kp]].sort((a,b)=>a.knowledgePointId.localeCompare(b.knowledgePointId));
  }
  assert.equal(repair.prerequisiteLock.r03MutationApplied,false);
});

test("Q015 R04 and R05 runtime identity remains frozen factor-multiple W7 rank10",()=>{
  for(const kp of [D,S]){
    const r04=getR04KnowledgePointCapabilityMapping(kp),r05=getR05DeliveryWaveAssignment(kp);assert.ok(r04);assert.ok(r05);
    assert.equal(r04.primaryRuntimeProfileId,"profile_factor_multiple");assert.equal(r04.classificationRuleId,"rule_factor_multiple");assert.deepEqual([...r04.appliedModifierIds],[]);
    assert.deepEqual([...r04.requiredRuntimeCapabilityIds],repair.runtimeLock.requiredRuntimeCapabilityIds);
    assert.equal(r05.baseDeliveryWaveId,"R05-W1");assert.equal(r05.deliveryWaveId,"R05-W7");assert.equal(r05.waveEscalatedByPrerequisite,true);assert.equal(r05.prerequisiteWaveLowerBound,7);assert.equal(r05.intraWavePrerequisiteRank,10);
  }
});

test("Q015 two-KP semantic ownership is now explicit and non-overlapping",()=>{
  const s=repair.semanticOwnershipLock;
  assert.equal(s.present,true);
  assert.equal(s.differenceMultiple.semanticCore,"DIFFERENCE_MULTIPLE_RELATION_MODEL");
  assert.equal(s.sumMultiple.semanticCore,"SUM_MULTIPLE_RELATION_MODEL");
  assert.equal(s.sumMultiple.implementationSemanticLockAllowed,true);
  assert.ok(s.differenceMultiple.owns.includes("DIFFERENCE_DIVIDED_BY_K_MINUS_ONE"));
  assert.ok(s.sumMultiple.owns.includes("TOTAL_DIVIDED_BY_K_PLUS_ONE"));
  for(const x of ["SUM_DIFFERENCE_PROBLEM","WORK_OR_DISTRIBUTION_STRATEGY","AFFINE_MULTIPLE_WITH_OFFSET_AS_PURE_FACTOR_MULTIPLE","COMBINATORICS","ROUTE_COUNTING","SAME_UNIT_MIXED_MODE","CROSS_UNIT_MIXED_MODE"])assert.ok(s.sharedDoesNotOwn.includes(x));
});

test("Q015 repair closes source blocker and stops at implementation approval",()=>{
  assert.equal(repair.status,"PASS_SUPPLEMENTARY_EVIDENCE_RECONCILED_TWO_KP_SEMANTIC_OWNERSHIP_LOCKED_IMPLEMENTATION_APPROVAL_REQUIRED");
  assert.equal(repair.decision.differenceMultipleSourceAuthoritySufficient,true);
  assert.equal(repair.decision.sumMultipleOriginalPdfDirectSupport,false);
  assert.equal(repair.decision.supplementaryEvidenceDirectlySupportsSumMultiple,true);
  assert.equal(repair.decision.sourceEvidenceBlockerResolved,true);
  assert.equal(repair.decision.twoKnowledgePointSemanticOwnershipLockBound,true);
  assert.equal(repair.decision.implementationPlanningReady,true);
  assert.equal(repair.decision.implementationMayProceedWithoutSeparateApproval,false);
  assert.equal(repair.decision.separateImplementationApprovalRequired,true);
  assert.equal(repair.scopeLock.productImplementationAllowedByThisRepair,false);
  assert.equal(repair.decision.nextTask,"P07F_W7DirectProductVerticalSlice015Implementation");
});

test("Q015 repair remains bounded planning-only",()=>{
  const impact=read("data/project/change-impact/P07F_W7_Q015_SUPPLEMENTARY_EVIDENCE_AUTHORITY_REPAIR.impact.json");
  const validation=read("data/project/validation-plans/P07F_W7_Q015_SUPPLEMENTARY_EVIDENCE_AUTHORITY_REPAIR.validation.json");
  const queue=materializeP07EW7DirectProductVerticalSliceQueue(),row=queue.queueEntries[14];
  assert.deepEqual([...row.knowledgePointIds],[D,S]);
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.equal(impact.scopeGuards.r02Mutation,false);
  assert.equal(impact.scopeGuards.supplementaryEvidenceDriveMutation,false);
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(validation.lanes.SHARED_RUNTIME_BOUNDED[1].runtime,"NODE_ONLY");
  assert.equal(repair.validationBoundary.fullRepositoryRegressionAllowed,false);
  assert.equal(repair.validationBoundary.globalBrowserReplayAllowed,false);
});
