import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {getR03DirectPrerequisites} from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
const pre=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p07f/q016-g5b-u08-find-base-and-percent-application-source-authority-preflight.json",import.meta.url),"utf8"));
const ids=["kp_g5b_u08_find_base_quantity_percent","kp_g5b_u08_percent_discount_increase_application"];

test("Q016 exact frozen row is two-KP ratio-percent slice after Q015",()=>{
 const row=materializeP07EW7DirectProductVerticalSliceQueue().queueEntries[15];
 assert.equal(row.queuePosition,16);assert.equal(row.sliceId,"p07e_q016_r11_g5b_u08_5b08_profile_ratio_percent_c1");assert.deepEqual([...row.knowledgePointIds],ids);assert.equal(row.previousSliceId,"p07e_q015_r10_g6b_u05_6b05_profile_factor_multiple_c1");
 assert.equal(pre.predecessorD0Evidence.q015Status,"PASS_E6_D0_COMPLETE");
});

test("Q016 exact PDF identity and current 200 DPI visual readback are locked",()=>{
 const s=pre.sourceAuthority;
 assert.equal(s.sourcePdfDriveFileId,"1k6bQoFDRjVNtHwOXPlD5Op9dnD5RpPrw");assert.equal(s.sourcePdfSizeBytes,716229);assert.equal(s.sourcePdfSha256,"5f170aa99ab3a8bde561a8c6bf0cbacce5fc368ab4ea5c9a89ddbc6e0e45c9e7");assert.deepEqual(s.reviewedPages,[1,2]);assert.equal(s.reviewMethod,"CURRENT_FULL_PAGE_VISUAL_READBACK_200_DPI");assert.equal(s.ocrUsedAsAuthority,false);
});

test("Q016 reverse-base direct witness is absent but discount/increase is directly visible",()=>{
 const v=pre.currentVisualEvidenceResolution;
 assert.equal(v.findBaseQuantityPercent.directSupport,false);assert.deepEqual(v.findBaseQuantityPercent.directVisualEvidencePages,[]);assert.equal(v.findBaseQuantityPercent.supportClassification,"DIRECT_EVIDENCE_MISSING");assert.ok(v.findBaseQuantityPercent.inspectedNearMisses.length>=3);
 assert.equal(v.percentDiscountIncreaseApplication.directSupport,true);assert.deepEqual(v.percentDiscountIncreaseApplication.directVisualEvidencePages,[1,2]);assert.equal(v.percentDiscountIncreaseApplication.supportClassification,"DIRECT_LITERAL_APPLICATION");assert.ok(v.percentDiscountIncreaseApplication.directWitnesses.length>=4);
 assert.equal(v.manualSourceChoiceRequired,false);assert.equal(v.manualEvidenceChoiceRequired,true);assert.equal(v.partialImplementationAllowed,false);
});

test("Q016 exact executable R03 R04 R05 authority is frozen by readback",()=>{
 const strip=e=>({edgeId:e.edgeId,fromKnowledgePointId:e.fromKnowledgePointId,toKnowledgePointId:e.toKnowledgePointId,dependencyStrength:e.dependencyStrength,dependencyRole:e.dependencyRole,alternativeGroupId:e.alternativeGroupId,distanceBearing:e.distanceBearing,rationale:e.rationale,evidenceRefs:e.evidenceRefs});
 assert.equal(pre.executableAuthorityReadback.pending,false);
 for(const expected of pre.executableAuthorityReadback.targets){
   const kp=expected.knowledgePointId;
   const r03=getR03DirectPrerequisites(kp).map(strip).sort((a,b)=>a.edgeId.localeCompare(b.edgeId));
   assert.deepEqual(r03,[...expected.r03IncomingEdges].sort((a,b)=>a.edgeId.localeCompare(b.edgeId)));
   const r04=getR04KnowledgePointCapabilityMapping(kp);assert.ok(r04);
   assert.equal(r04.primaryRuntimeProfileId,expected.r04.primaryRuntimeProfileId);assert.equal(r04.classificationRuleId,expected.r04.classificationRuleId);
   assert.deepEqual([...r04.appliedModifierIds],expected.r04.appliedModifierIds);
   assert.deepEqual([...r04.requiredRuntimeCapabilityIds],expected.r04.requiredRuntimeCapabilityIds);
   assert.deepEqual([...r04.optionalRuntimeCapabilityIds],expected.r04.optionalRuntimeCapabilityIds);
   assert.deepEqual([...r04.forbiddenRuntimeCapabilityIds],expected.r04.forbiddenRuntimeCapabilityIds);
   const r05=getR05DeliveryWaveAssignment(kp);assert.ok(r05);
   for(const key of ["baseDeliveryWaveId","deliveryWaveId","waveEscalatedByPrerequisite","prerequisiteWaveLowerBound","intraWavePrerequisiteRank"])assert.equal(r05[key],expected.r05[key]);
 }
});

test("Q016 semantic ownership stays bounded and does not promote near-miss reverse-base evidence",()=>{
 const s=pre.semanticOwnershipLock;
 assert.equal(s.findBaseQuantityPercent.lockedCandidateOnly,true);assert.equal(s.findBaseQuantityPercent.implementationLocked,false);assert.equal(s.findBaseQuantityPercent.directSourceEvidenceRequiredBeforeImplementation,true);
 assert.equal(s.percentDiscountIncreaseApplication.locked,true);assert.equal(s.percentDiscountIncreaseApplication.directSourceEvidenceSufficient,true);assert.equal(s.percentDiscountIncreaseApplication.markupThenDiscountAllowed,true);
 for(const x of ["Q008_FRACTION_DECIMAL_PERCENT_CONVERSION_REOWNERSHIP","Q013_FIND_PERCENTAGE_RATE_REOWNERSHIP","Q013_PERCENTAGE_OF_QUANTITY_REOWNERSHIP","GENERIC_RATIO_APPLICATION_REOWNERSHIP","SUGAR_WATER_RATIO_AS_Q016_CORE"])assert.ok(s.exclusions.includes(x));
});

test("Q016 remains planning-only and blocked until reverse-base supplementary evidence is selected",()=>{
 assert.equal(pre.status,"BLOCKED_FIND_BASE_QUANTITY_PERCENT_DIRECT_EVIDENCE_MISSING_REQUIRES_OPERATOR_SUPPLEMENTARY_EVIDENCE_SELECTION");
 assert.equal(pre.preflightDecision.findBaseQuantityPercentSourceAuthoritySufficient,false);
 assert.equal(pre.preflightDecision.percentDiscountIncreaseApplicationSourceAuthoritySufficient,true);
 assert.equal(pre.preflightDecision.newSupplementaryEvidenceRequiredForFindBaseQuantityPercent,true);
 assert.equal(pre.preflightDecision.manualEvidenceChoiceRequired,true);
 assert.equal(pre.preflightDecision.partialImplementationAllowed,false);
 assert.equal(pre.preflightDecision.implementationAllowed,false);
 assert.equal(pre.preflightDecision.nextTask,"P07F_W7_Q016_FindBaseQuantityPercentSupplementaryEvidenceAuthorityRepair_ThenSemanticOwnershipLock");
});
