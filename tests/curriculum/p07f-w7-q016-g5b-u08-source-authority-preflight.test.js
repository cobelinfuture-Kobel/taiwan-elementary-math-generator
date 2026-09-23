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

test("Q016 live executable authority resolves to ratio-percent W7 rank11 for both targets",()=>{
 for(const kp of ids){
   const r03=getR03DirectPrerequisites(kp);assert.ok(r03.length>0,kp+":R03_EMPTY");assert.ok(r03.every(e=>e.toKnowledgePointId===kp));
   const r04=getR04KnowledgePointCapabilityMapping(kp);assert.ok(r04);assert.equal(r04.primaryRuntimeProfileId,"profile_ratio_percent");assert.equal(r04.classificationRuleId,"rule_ratio_percent");assert.deepEqual([...r04.appliedModifierIds],[]);assert.ok(r04.requiredRuntimeCapabilityIds.includes("cap_ratio_percent_reasoning"));assert.ok(r04.requiredRuntimeCapabilityIds.includes("cap_ratio_rate_validator"));
   const r05=getR05DeliveryWaveAssignment(kp);assert.ok(r05);assert.equal(r05.deliveryWaveId,"R05-W7");assert.equal(r05.intraWavePrerequisiteRank,11);
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
