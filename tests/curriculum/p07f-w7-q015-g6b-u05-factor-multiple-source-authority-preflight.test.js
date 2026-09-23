import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {getR03DirectPrerequisites} from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
const pre=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p07f/q015-g6b-u05-factor-multiple-source-authority-preflight.json",import.meta.url),"utf8"));
const ids=["kp_g6b_u05_difference_multiple_problem","kp_g6b_u05_sum_multiple_problem"];
const strip=e=>({edgeId:e.edgeId,fromKnowledgePointId:e.fromKnowledgePointId,toKnowledgePointId:e.toKnowledgePointId,dependencyStrength:e.dependencyStrength,dependencyRole:e.dependencyRole,alternativeGroupId:e.alternativeGroupId,distanceBearing:e.distanceBearing,rationale:e.rationale,evidenceRefs:e.evidenceRefs});

test("Q015 exact frozen row is two-KP factor-multiple slice after Q014",()=>{
 const row=materializeP07EW7DirectProductVerticalSliceQueue().queueEntries[14];
 assert.equal(row.queuePosition,15);assert.equal(row.sliceId,"p07e_q015_r10_g6b_u05_6b05_profile_factor_multiple_c1");assert.deepEqual([...row.knowledgePointIds],ids);assert.equal(row.previousSliceId,"p07e_q014_r10_g6a_u07_6a07_profile_geometry_formula_c1");
 assert.equal(pre.predecessorD0Evidence.q014Status,"PASS_E6_D0_COMPLETE");
});

test("Q015 exact PDF identity and full-page visual review are locked",()=>{
 const s=pre.sourceAuthority;
 assert.equal(s.sourcePdfDriveFileId,"19lrR3_bvpKIoJq5DsKaiQOUecsCzNDsl");assert.equal(s.sourcePdfSizeBytes,849178);assert.equal(s.sourcePdfSha256,"1be6a253b422a427bf4a20a09ee478400f39a11e9b817c1acee308e5f6b9403b");assert.deepEqual(s.reviewedPages,[1,2]);assert.equal(s.reviewMethod,"CURRENT_FULL_PAGE_VISUAL_READBACK_200_DPI");assert.equal(s.ocrUsedAsAuthority,false);
});

test("Q015 difference-multiple has direct canonical evidence but sum-multiple does not",()=>{
 const v=pre.currentVisualEvidenceResolution;
 assert.equal(v.differenceMultiple.directSupport,true);assert.deepEqual(v.differenceMultiple.directVisualEvidencePages,[1]);assert.equal(v.differenceMultiple.supportClassification,"DIRECT_CANONICAL_INVARIANT_EVIDENCE");assert.ok(v.differenceMultiple.directWitnesses.length>=2);
 assert.equal(v.sumMultiple.directSupport,false);assert.deepEqual(v.sumMultiple.directVisualEvidencePages,[]);assert.equal(v.sumMultiple.conflictType,"R02_TARGET_CANDIDATE_NOT_VISIBLE_IN_CURRENT_SOURCE_PDF");assert.equal(v.sumMultiple.supportClassification,"DIRECT_EVIDENCE_MISSING");
 assert.equal(v.manualSourceChoiceRequired,false);assert.equal(v.manualEvidenceChoiceRequired,true);assert.equal(v.partialImplementationAllowed,false);
});

test("Q015 executable R03 R04 R05 authority exactly matches frozen readback",()=>{
 for(const expected of pre.executableAuthorityReadback.targets){
   const kp=expected.knowledgePointId;
   assert.deepEqual(getR03DirectPrerequisites(kp).map(strip).sort((a,b)=>a.edgeId.localeCompare(b.edgeId)),[...expected.r03IncomingEdges].sort((a,b)=>a.edgeId.localeCompare(b.edgeId)));
   const r04=getR04KnowledgePointCapabilityMapping(kp);assert.ok(r04);for(const k of ["primaryRuntimeProfileId","classificationRuleId"])assert.equal(r04[k],expected.r04[k]);assert.deepEqual([...r04.appliedModifierIds],expected.r04.appliedModifierIds);assert.deepEqual([...r04.requiredRuntimeCapabilityIds],expected.r04.requiredRuntimeCapabilityIds);
   const r05=getR05DeliveryWaveAssignment(kp);assert.ok(r05);for(const k of ["baseDeliveryWaveId","deliveryWaveId","waveEscalatedByPrerequisite","prerequisiteWaveLowerBound","intraWavePrerequisiteRank"])assert.equal(r05[k],expected.r05[k]);
 }
});

test("Q015 semantic lock does not silently turn near-miss families into sum/difference multiple authority",()=>{
 const s=pre.semanticOwnershipLock;
 assert.equal(s.differenceMultiple.locked,true);assert.equal(s.differenceMultiple.semanticCore,"DIFFERENCE_MULTIPLE_RELATION_MODEL");
 assert.equal(s.sumMultiple.lockedCandidateOnly,true);assert.equal(s.sumMultiple.implementationLocked,false);assert.equal(s.sumMultiple.directSourceEvidenceRequiredBeforeImplementation,true);
 for(const x of ["SUM_DIFFERENCE_PROBLEM_REOWNERSHIP","AGE_OR_REPEATED_RELATION_REOWNERSHIP","WORK_OR_DISTRIBUTION_STRATEGY_REOWNERSHIP","AFFINE_MULTIPLE_WITH_OFFSET_AS_PURE_DIFFERENCE_MULTIPLE","COMBINATORICS","ROUTE_COUNTING"])assert.ok(s.exclusions.includes(x));
});

test("Q015 remains planning-only and blocked until sum-multiple supplementary evidence is selected",()=>{
 assert.equal(pre.status,"BLOCKED_SUM_MULTIPLE_DIRECT_EVIDENCE_MISSING_REQUIRES_OPERATOR_SUPPLEMENTARY_EVIDENCE_SELECTION");
 assert.equal(pre.preflightDecision.differenceMultipleSourceAuthoritySufficient,true);
 assert.equal(pre.preflightDecision.sumMultipleSourceAuthoritySufficient,false);
 assert.equal(pre.preflightDecision.newSupplementaryEvidenceRequiredForSumMultiple,true);
 assert.equal(pre.preflightDecision.manualEvidenceChoiceRequired,true);
 assert.equal(pre.preflightDecision.partialImplementationAllowed,false);
 assert.equal(pre.preflightDecision.implementationAllowed,false);
 assert.equal(pre.preflightDecision.nextTask,"P07F_W7_Q015_SumMultipleSupplementaryEvidenceAuthorityRepair_ThenSemanticOwnershipLock");
});
