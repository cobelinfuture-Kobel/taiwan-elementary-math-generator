import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {getR03DirectPrerequisites} from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const repair=read("data/curriculum/full-product/p07f/q016-g5b-u08-find-base-quantity-percent-supplementary-evidence-authority-repair.json");
const prior=read("data/curriculum/full-product/p07f/q016-g5b-u08-find-base-and-percent-application-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-05.json");
const F="kp_g5b_u08_find_base_quantity_percent",D="kp_g5b_u08_percent_discount_increase_application";

test("Q016 repair preserves blocked preflight audit and original source truth",()=>{
  assert.equal(prior.status,"BLOCKED_FIND_BASE_QUANTITY_PERCENT_DIRECT_EVIDENCE_MISSING_REQUIRES_OPERATOR_SUPPLEMENTARY_EVIDENCE_SELECTION");
  assert.equal(prior.currentVisualEvidenceResolution.findBaseQuantityPercent.directSupport,false);
  assert.equal(prior.currentVisualEvidenceResolution.percentDiscountIncreaseApplication.directSupport,true);
  assert.equal(repair.priorPreflight.auditStatePreserved,true);
  assert.equal(repair.sourceAuthorityReconciliation.originalCurriculumSource.findBaseQuantityPercentDirectEvidencePresent,false);
  assert.equal(repair.sourceAuthorityReconciliation.originalCurriculumSource.percentDiscountIncreaseApplicationDirectEvidencePresent,true);
});

test("Q016 supplementary exam PDF directly witnesses reverse base quantity from percent",()=>{
  const s=repair.sourceAuthorityReconciliation.supplementaryEvidence;
  assert.equal(s.authorityType,"EXISTING_PROJECT_DRIVE_EXAM_PDF_SUPPLEMENTARY_EVIDENCE");
  assert.equal(s.driveFileId,"1grJyszUbRVBWShcWAoxqOjIeD_zQCKVj");
  assert.equal(s.sizeBytes,265965);
  assert.equal(s.pageCount,3);
  assert.equal(s.sha256,"b58dd564626ae6295be2499a4f4b60801d39d81a5cf3decf369d3ee541ade780");
  assert.equal(s.exactEvidencePage,1);
  assert.equal(s.exactEvidenceLocation,"一、選擇題，第15題");
  assert.match(s.exactProblemText,/打破了9顆/);
  assert.match(s.exactProblemText,/1\.5％/);
  assert.match(s.exactProblemText,/原有幾顆雞蛋/);
  assert.deepEqual(s.directSemanticWitness,{
    comparisonQuantity:9,
    percentRateDecimal:0.015,
    percentRateDisplay:"1.5%",
    baseQuantity:600,
    reconstruction:"600 × 1.5% = 9",
    invariant:"基準量 = 比較量 ÷ 百分率；反求後以基準量 × 原百分率必須重建比較量。",
    semanticClass:"FIND_BASE_QUANTITY_FROM_COMPARISON_AND_PERCENT_RATE"
  });
  assert.deepEqual(Object.values(s.directSemanticCoverage),[true,true,true,true,true,true]);
  assert.equal(s.sufficiency,"SUFFICIENT_FOR_Q016_FIND_BASE_QUANTITY_PERCENT_SEMANTIC_PLANNING_AND_OWNERSHIP_LOCK");
  assert.equal(s.curriculumScopeInheritanceAllowed,false);
  assert.equal(s.publisherOrEditionUsedToReclassifyPrimarySource,false);
  assert.equal(s.durableDriveMutationRequired,false);
});

test("Q016 reconciliation preserves frozen R02 candidate text and does not rewrite historical evidence pages",()=>{
  const src=r02.sourceRecords.find(x=>x.sourceNodeId==="g5b_u08_5b08");assert.ok(src);
  const f=src.candidates.find(x=>x.knowledgePointId===F),d=src.candidates.find(x=>x.knowledgePointId===D);assert.ok(f);assert.ok(d);
  assert.equal(f.canonicalNameZh,"由百分率反求基準量");assert.equal(d.canonicalNameZh,"折扣與增減百分率");
  assert.deepEqual(f.evidencePages,[1,2]);assert.deepEqual(d.evidencePages,[1,2]);
  const rec=repair.sourceAuthorityReconciliation.r02Reconciliation;
  assert.equal(rec.r02MutationApplied,false);assert.equal(rec.historicalCandidateTextPreserved,true);assert.equal(rec.historicalEvidencePagesConsumedAsDirectFindBaseWitness,false);assert.equal(rec.silentRewriteAllowed,false);
});

test("Q016 exact R03 prerequisite ownership remains unchanged",()=>{
  const expected=repair.prerequisiteLock.byKnowledgePoint;
  for(const kp of [F,D]){
    const actual=getR03DirectPrerequisites(kp).map(e=>({knowledgePointId:e.fromKnowledgePointId,dependencyStrength:e.dependencyStrength,dependencyRole:e.dependencyRole,distanceBearing:e.distanceBearing})).sort((a,b)=>a.knowledgePointId.localeCompare(b.knowledgePointId));
    assert.deepEqual(actual,[...expected[kp]].sort((a,b)=>a.knowledgePointId.localeCompare(b.knowledgePointId)));
  }
  assert.equal(repair.prerequisiteLock.r03MutationApplied,false);
});

test("Q016 exact R04 and R05 runtime identities remain frozen per KP",()=>{
  for(const kp of [F,D]){
    const expected=repair.runtimeLock.byKnowledgePoint[kp];
    const r04=getR04KnowledgePointCapabilityMapping(kp),r05=getR05DeliveryWaveAssignment(kp);assert.ok(r04);assert.ok(r05);
    assert.equal(r04.primaryRuntimeProfileId,expected.primaryRuntimeProfileId);
    assert.equal(r04.classificationRuleId,expected.classificationRuleId);
    assert.deepEqual([...r04.appliedModifierIds],expected.appliedModifierIds);
    assert.deepEqual([...r04.requiredRuntimeCapabilityIds],expected.requiredRuntimeCapabilityIds);
    assert.deepEqual([...r04.optionalRuntimeCapabilityIds],expected.optionalRuntimeCapabilityIds);
    assert.deepEqual([...r04.forbiddenRuntimeCapabilityIds],expected.forbiddenRuntimeCapabilityIds);
    for(const key of ["baseDeliveryWaveId","deliveryWaveId","waveEscalatedByPrerequisite","prerequisiteWaveLowerBound","intraWavePrerequisiteRank"])assert.equal(r05[key],expected[key]);
  }
  assert.equal(repair.runtimeLock.r04MutationApplied,false);
  assert.equal(repair.runtimeLock.r05MutationApplied,false);
});

test("Q016 two-KP semantic ownership is explicit and non-overlapping",()=>{
  const s=repair.semanticOwnershipLock;
  assert.equal(s.present,true);
  assert.equal(s.findBaseQuantityPercent.semanticCore,"FIND_BASE_QUANTITY_FROM_COMPARISON_AND_PERCENT_RATE");
  assert.equal(s.percentDiscountIncreaseApplication.semanticCore,"PERCENT_DISCOUNT_INCREASE_APPLICATION");
  assert.equal(s.findBaseQuantityPercent.implementationSemanticLockAllowed,true);
  assert.equal(s.percentDiscountIncreaseApplication.implementationSemanticLockAllowed,true);
  assert.ok(s.findBaseQuantityPercent.owns.includes("BASE_QUANTITY_EQUALS_COMPARISON_DIVIDED_BY_PERCENT_RATE"));
  assert.ok(s.percentDiscountIncreaseApplication.owns.includes("MARKUP_THEN_DISCOUNT_APPLICATION"));
  assert.equal(s.ownershipSeparation.findBaseDoesNotReownForwardDiscountOrMarkupApplications,true);
  assert.equal(s.ownershipSeparation.discountIncreaseDoesNotReownGenericReverseBaseQuantity,true);
  for(const x of ["Q008_FRACTION_DECIMAL_PERCENT_CONVERSION","Q013_FIND_PERCENTAGE_RATE","Q013_PERCENTAGE_OF_QUANTITY","GENERIC_RATIO_APPLICATION","SUGAR_WATER_RATIO_AS_Q016_CORE","SAME_UNIT_MIXED_MODE","CROSS_UNIT_MIXED_MODE"])assert.ok(s.sharedDoesNotOwn.includes(x));
});

test("Q016 repair closes evidence blocker and stops at implementation approval",()=>{
  assert.equal(repair.status,"PASS_SUPPLEMENTARY_EVIDENCE_RECONCILED_TWO_KP_SEMANTIC_OWNERSHIP_LOCKED_IMPLEMENTATION_APPROVAL_REQUIRED");
  assert.equal(repair.decision.findBaseOriginalPdfDirectSupport,false);
  assert.equal(repair.decision.supplementaryEvidenceDirectlySupportsFindBaseQuantityPercent,true);
  assert.equal(repair.decision.percentDiscountIncreaseApplicationPrimarySourceAuthoritySufficient,true);
  assert.equal(repair.decision.sourceEvidenceBlockerResolved,true);
  assert.equal(repair.decision.twoKnowledgePointSemanticOwnershipLockBound,true);
  assert.equal(repair.decision.implementationPlanningReady,true);
  assert.equal(repair.decision.implementationMayProceedWithoutSeparateApproval,false);
  assert.equal(repair.decision.separateImplementationApprovalRequired,true);
  assert.equal(repair.scopeLock.productImplementationAllowedByThisRepair,false);
  assert.equal(repair.decision.nextTask,"P07F_W7DirectProductVerticalSlice016Implementation");
});

test("Q016 repair remains bounded planning-only",()=>{
  const impact=read("data/project/change-impact/P07F_W7_Q016_SUPPLEMENTARY_EVIDENCE_AUTHORITY_REPAIR.impact.json");
  const validation=read("data/project/validation-plans/P07F_W7_Q016_SUPPLEMENTARY_EVIDENCE_AUTHORITY_REPAIR.validation.json");
  const queue=materializeP07EW7DirectProductVerticalSliceQueue(),row=queue.queueEntries[15];
  assert.deepEqual([...row.knowledgePointIds],[F,D]);
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.equal(impact.scopeGuards.r02Mutation,false);
  assert.equal(impact.scopeGuards.supplementaryEvidenceDriveMutation,false);
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(validation.lanes.SHARED_RUNTIME_BOUNDED[1].runtime,"NODE_ONLY");
  assert.equal(repair.validationBoundary.fullRepositoryRegressionAllowed,false);
  assert.equal(repair.validationBoundary.globalBrowserReplayAllowed,false);
});
