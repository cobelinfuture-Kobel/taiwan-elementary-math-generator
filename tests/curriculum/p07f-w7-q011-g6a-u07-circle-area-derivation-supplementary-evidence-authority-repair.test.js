import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
import {materializeR04SharedRuntimeCapabilityMatrix,getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const repair=read("data/curriculum/full-product/p07f/q011-g6a-u07-circle-area-derivation-supplementary-evidence-authority-repair.json");
const prior=read("data/curriculum/full-product/p07f/q011-g6a-u07-circle-area-derivation-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-07.json");
const KP="kp_g6a_u07_circle_area_derivation";

test("Q011 repair preserves prior fail-closed audit and original PDF truth",()=>{
  assert.equal(prior.status,"BLOCKED_SOURCE_EVIDENCE_MISMATCH_REQUIRES_OPERATOR_SOURCE_EVIDENCE_SELECTION");
  assert.equal(prior.sourceAuthority.currentVisualReadbackAuthority.targetVisualFamilyPresent,false);
  assert.equal(repair.priorPreflight.auditStatePreserved,true);
  assert.equal(repair.sourceAuthorityReconciliation.originalCurriculumSource.directDerivationEvidencePresent,false);
  assert.equal(repair.sourceAuthorityReconciliation.originalCurriculumSource.roleForQ011,"PRIMARY_CURRICULUM_CONTEXT_NOT_DIRECT_DERIVATION_WITNESS");
});

test("Q011 supplementary evidence is durable, additive, and directly covers the derivation chain",()=>{
  const s=repair.sourceAuthorityReconciliation.supplementaryVisualEvidence;
  assert.equal(s.authorityType,"OPERATOR_PROVIDED_SUPPLEMENTARY_VISUAL_EVIDENCE");
  assert.equal(s.driveFolderId,"1j9IL4gBUKRm-PoTf_4O45uFluALDAlW_");
  assert.equal(s.evidenceItems.length,3);
  assert.deepEqual(s.evidenceItems.map(x=>x.driveFileId),[
    "1ENnQeJzHafoGtU4_JzFvhfNGCPO9y4-j",
    "1bh1Jt09sz2CMAj2IT84vf86xMSOXK7Zh",
    "1E1UTujUoXt_AwZAzK7B1Ezn2e1ocdNab"
  ]);
  for(const item of s.evidenceItems){
    assert.match(item.sha256,/^[0-9a-f]{64}$/);
    assert.ok(item.sizeBytes>0);
    assert.ok(item.widthPx>0&&item.heightPx>0);
    assert.ok(item.directSemanticWitnesses.length>=4);
  }
  assert.deepEqual(Object.values(s.directSemanticCoverage),[true,true,true,true,true,true,true]);
  assert.equal(s.sufficiency,"SUFFICIENT_FOR_Q011_SEMANTIC_PLANNING_AND_OWNERSHIP_LOCK");
});

test("Q011 reconciliation does not silently rewrite frozen R02 evidence",()=>{
  const source=r02.sourceRecords.find(row=>row.sourceNodeId==="g6a_u07_6a07");assert.ok(source);
  const target=source.candidates.find(row=>row.knowledgePointId===KP);assert.ok(target);
  assert.equal(target.canonicalNameZh,"圓面積剪拼推導");
  assert.equal(target.capabilityStatement,"學生能由扇形剪拼近似長方形理解公式。");
  assert.equal(target.reasoningInvariant,"剪拼保持面積，近似長方形長為半圓周、寬為半徑。");
  assert.deepEqual(target.evidencePages,[1,2]);
  const rec=repair.sourceAuthorityReconciliation.r02Reconciliation;
  assert.equal(rec.r02MutationApplied,false);
  assert.equal(rec.historicalCandidateTextPreserved,true);
  assert.equal(rec.historicalEvidencePagesConsumedAsDirectDerivationWitness,false);
  assert.equal(rec.silentRewriteAllowed,false);
});

test("Q011 exact R03 prerequisites remain area conservation plus circle circumference",()=>{
  const graph=materializeR04SharedRuntimeCapabilityMatrix().prerequisiteGraph;
  const incoming=(graph.incomingByTarget.get(KP)??[]).map(e=>({
    knowledgePointId:e.fromKnowledgePointId,
    dependencyStrength:e.dependencyStrength,
    dependencyRole:e.dependencyRole,
    distanceBearing:e.distanceBearing
  })).sort((a,b)=>a.knowledgePointId.localeCompare(b.knowledgePointId));
  const expected=[...repair.prerequisiteLock.requiredIncomingPrerequisites].sort((a,b)=>a.knowledgePointId.localeCompare(b.knowledgePointId));
  assert.deepEqual(incoming,expected);
  assert.equal(repair.prerequisiteLock.r03MutationApplied,false);
});

test("Q011 R04/R05 identity is unchanged while semantic ownership becomes locked",()=>{
  const r04=getR04KnowledgePointCapabilityMapping(KP),r05=getR05DeliveryWaveAssignment(KP);
  assert.ok(r04);assert.ok(r05);
  assert.equal(r04.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.equal(r04.classificationRuleId,"rule_geometry_formula");
  assert.deepEqual([...r04.appliedModifierIds],[]);
  assert.equal(r05.baseDeliveryWaveId,"R05-W5");
  assert.equal(r05.deliveryWaveId,"R05-W7");
  assert.equal(r05.waveEscalatedByPrerequisite,true);
  assert.equal(r05.prerequisiteWaveLowerBound,7);
  assert.equal(r05.intraWavePrerequisiteRank,9);
  assert.equal(repair.semanticOwnershipLock.present,true);
  assert.equal(repair.semanticOwnershipLock.targetSemanticCore,"CIRCLE_AREA_DERIVATION_BY_SECTOR_REARRANGEMENT_TO_APPROX_RECTANGLE");
  assert.equal(repair.semanticOwnershipLock.implementationSemanticLockAllowed,true);
});

test("Q011 ownership protects Q014 circle-area production and Q017 annulus successors",()=>{
  const queue=materializeP07EW7DirectProductVerticalSliceQueue();
  const q11=queue.queueEntries[10],q14=queue.queueEntries[13],q17=queue.queueEntries[16];
  assert.equal(q11.sliceId,"p07e_q011_r9_g6a_u07_6a07_profile_geometry_formula_c1");
  assert.ok(q11.knowledgePointIds.includes(KP));
  assert.ok(q14.knowledgePointIds.includes("kp_g6a_u07_circle_area_formula"));
  assert.ok(q17.knowledgePointIds.includes("kp_g6a_u07_annulus_area"));
  assert.ok(repair.semanticOwnershipLock.doesNotOwn.includes("CIRCLE_AREA_FORMULA_PRODUCTION_DRILL"));
  assert.ok(repair.semanticOwnershipLock.doesNotOwn.includes("ANNULUS_AREA"));
});

test("Q011 repair closes the evidence blocker but stops at implementation approval",()=>{
  assert.equal(repair.status,"PASS_SUPPLEMENTARY_EVIDENCE_RECONCILED_SEMANTIC_OWNERSHIP_LOCKED_IMPLEMENTATION_APPROVAL_REQUIRED");
  assert.equal(repair.decision.sourceEvidenceBlockerResolved,true);
  assert.equal(repair.decision.semanticOwnershipLockBound,true);
  assert.equal(repair.decision.implementationPlanningReady,true);
  assert.equal(repair.decision.implementationMayProceedWithoutSeparateApproval,false);
  assert.equal(repair.decision.separateImplementationApprovalRequired,true);
  assert.equal(repair.scopeLock.productImplementationAllowedByThisRepair,false);
  assert.equal(repair.scopeLock.publicProductAdmissionAllowedByThisRepair,false);
  assert.equal(repair.decision.nextTask,"P07F_W7DirectProductVerticalSlice011Implementation");
});

test("Q011 repair remains SHARED_RUNTIME_BOUNDED planning-only",()=>{
  const impact=read("data/project/change-impact/P07F_W7_Q011_SUPPLEMENTARY_EVIDENCE_AUTHORITY_REPAIR.impact.json");
  const validation=read("data/project/validation-plans/P07F_W7_Q011_SUPPLEMENTARY_EVIDENCE_AUTHORITY_REPAIR.validation.json");
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.equal(impact.scopeGuards.r02Mutation,false);
  assert.equal(impact.scopeGuards.originalSourcePdfMutation,false);
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(validation.lanes.SHARED_RUNTIME_BOUNDED[1].runtime,"NODE_ONLY");
  assert.equal(repair.validationBoundary.fullRepositoryRegressionAllowed,false);
  assert.equal(repair.validationBoundary.globalBrowserReplayAllowed,false);
});
