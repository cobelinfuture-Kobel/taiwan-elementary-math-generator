import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {getR03DirectPrerequisites} from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const pre=read("data/curriculum/full-product/p07f/q013-g5b-u08-rate-and-percentage-quantity-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-05.json");
const KPS=["kp_g5b_u08_find_percentage_rate","kp_g5b_u08_percentage_of_quantity"];
const strip=e=>({edgeId:e.edgeId,fromKnowledgePointId:e.fromKnowledgePointId,toKnowledgePointId:e.toKnowledgePointId,dependencyStrength:e.dependencyStrength,dependencyRole:e.dependencyRole,alternativeGroupId:e.alternativeGroupId,distanceBearing:e.distanceBearing,rationale:e.rationale,evidenceRefs:e.evidenceRefs});

test("Q013 preflight binds exact frozen two-KP row and Q012 D0",()=>{
  const row=materializeP07EW7DirectProductVerticalSliceQueue().queueEntries[12];
  assert.equal(pre.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(row.queuePosition,13);
  assert.equal(row.sliceId,"p07e_q013_r10_g5b_u08_5b08_profile_ratio_percent_c1");
  assert.deepEqual([...row.knowledgePointIds],KPS);
  assert.deepEqual(pre.queueAuthority.knowledgePointIds,KPS);
  assert.deepEqual([...row.requiredW7CapabilityIds],["cap_ratio_percent_reasoning","cap_ratio_rate_validator"]);
  assert.equal(pre.predecessorD0Evidence.q012Status,"PASS_E6_D0_COMPLETE");
});

test("Q013 exact source identity and current page-2 visual evidence directly support both targets",()=>{
  assert.equal(pre.sourceAuthority.sourcePdfDriveFileId,"1k6bQoFDRjVNtHwOXPlD5Op9dnD5RpPrw");
  assert.equal(pre.sourceAuthority.sourcePdfSizeBytes,716229);
  assert.equal(pre.sourceAuthority.sourcePdfSha256,"5f170aa99ab3a8bde561a8c6bf0cbacce5fc368ab4ea5c9a89ddbc6e0e45c9e7");
  const v=pre.sourceAuthority.currentVisualReadbackAuthority;
  assert.equal(v.reviewMethod,"CURRENT_FULL_PAGE_VISUAL_READBACK_200_DPI");
  assert.equal(v.ocrUsedAsAuthority,false);
  assert.equal(v.findPercentageRateDirectVisualEvidence.directEvidencePresent,true);
  assert.equal(v.findPercentageRateDirectVisualEvidence.visibleExamples.length,2);
  assert.equal(v.percentageOfQuantityDirectVisualEvidence.directEvidencePresent,true);
  assert.equal(v.percentageOfQuantityDirectVisualEvidence.visibleExamples.length,2);
  assert.deepEqual(pre.sourceAuthority.currentQ013DirectEvidencePages,[2]);
});

test("Q013 exact R02 candidates preserve Q008 predecessor and Q016 future ownership",()=>{
  const src=r02.sourceRecords.find(x=>x.sourceNodeId==="g5b_u08_5b08");assert.ok(src);
  const targets=KPS.map(id=>src.candidates.find(x=>x.knowledgePointId===id));assert.ok(targets.every(Boolean));
  assert.deepEqual(pre.r02ReviewedCandidateAuthority.targetCandidates,targets);
  assert.equal(pre.r02ReviewedCandidateAuthority.predecessorOwnedKnowledgePointRows[0].knowledgePointId,"kp_g5b_u08_ratio_fraction_decimal_percent_conversion");
  assert.deepEqual(pre.r02ReviewedCandidateAuthority.protectedFutureQueueOwnership[0].knowledgePointIds,["kp_g5b_u08_find_base_quantity_percent","kp_g5b_u08_percent_discount_increase_application"]);
});

test("Q013 exact R03 prerequisite graphs match executable authority for both KPs",()=>{
  for(const kp of KPS){
    const actual=getR03DirectPrerequisites(kp).map(strip).sort((a,b)=>a.edgeId.localeCompare(b.edgeId));
    const expected=[...pre.prerequisiteGraphAuthority.byKnowledgePoint[kp].exactIncomingRequiredDistanceBearingEdges].sort((a,b)=>a.edgeId.localeCompare(b.edgeId));
    assert.deepEqual(actual,expected,kp);
  }
  assert.deepEqual(pre.prerequisiteGraphAuthority.byKnowledgePoint.kp_g5b_u08_find_percentage_rate.requiredPrerequisiteKnowledgePointIds,["kp_g5b_u08_ratio_fraction_decimal_percent_conversion"]);
  assert.deepEqual(pre.prerequisiteGraphAuthority.byKnowledgePoint.kp_g5b_u08_percentage_of_quantity.requiredPrerequisiteKnowledgePointIds,["kp_g5b_u02_fraction_of_quantity","kp_g5b_u08_ratio_fraction_decimal_percent_conversion"]);
});

test("Q013 exact R04 mappings are identical frozen ratio-percent envelopes",()=>{
  for(const kp of KPS){
    const r04=getR04KnowledgePointCapabilityMapping(kp),expected=pre.runtimeCapabilityAuthority.executableR04MappingsByKnowledgePoint[kp];assert.ok(r04);
    assert.equal(r04.primaryRuntimeProfileId,expected.primaryRuntimeProfileId);
    assert.equal(r04.classificationRuleId,expected.classificationRuleId);
    assert.deepEqual([...r04.appliedModifierIds],expected.appliedModifierIds);
    assert.deepEqual([...r04.requiredRuntimeCapabilityIds],expected.requiredRuntimeCapabilityIds);
    assert.deepEqual([...r04.optionalRuntimeCapabilityIds],expected.optionalRuntimeCapabilityIds);
    assert.deepEqual([...r04.forbiddenRuntimeCapabilityIds],expected.forbiddenRuntimeCapabilityIds);
  }
  assert.equal(pre.runtimeCapabilityAuthority.exactR04MappingsVerified,true);
});

test("Q013 exact R05 assignments are direct W7 base rows at rank 10 for both KPs",()=>{
  for(const kp of KPS){
    const r05=getR05DeliveryWaveAssignment(kp),e=pre.r05AssignmentAuthority.exactR05AssignmentsByKnowledgePoint[kp];assert.ok(r05);
    for(const key of ["baseDeliveryWaveId","deliveryWaveId","waveEscalatedByPrerequisite","prerequisiteWaveLowerBound","intraWavePrerequisiteRank"])assert.equal(r05[key],e[key],kp+":"+key);
  }
  assert.equal(pre.r05AssignmentAuthority.exactR05AssignmentsVerified,true);
});

test("Q013 semantic locks separate find-rate and percent-of-quantity while excluding Q008/Q016 ownership",()=>{
  const byId=Object.fromEntries(pre.semanticProfileLocks.map(x=>[x.knowledgePointId,x]));
  assert.equal(byId.kp_g5b_u08_find_percentage_rate.targetSemanticCore,"COMPARISON_QUANTITY_DIVIDED_BY_BASE_QUANTITY_GIVES_PERCENTAGE_RATE");
  assert.equal(byId.kp_g5b_u08_percentage_of_quantity.targetSemanticCore,"BASE_QUANTITY_TIMES_PERCENTAGE_RATE_GIVES_COMPARISON_QUANTITY");
  assert.equal(byId.kp_g5b_u08_find_percentage_rate.implementationSemanticLock.denominatorMustBeBaseQuantity,true);
  assert.equal(byId.kp_g5b_u08_percentage_of_quantity.implementationSemanticLock.comparisonQuantityEqualsBaseTimesRateRequired,true);
  for(const row of pre.semanticProfileLocks){
    assert.equal(row.implementationSemanticLock.q008RepresentationConversionTeachingReownershipAllowed,false);
    assert.equal(row.implementationSemanticLock.q016FindBaseQuantityAllowed,false);
    assert.equal(row.implementationSemanticLock.q016DiscountIncreaseApplicationAllowed,false);
    assert.equal(row.implementationSemanticLock.sameUnitMixedModeAllowed,false);
    assert.equal(row.implementationSemanticLock.crossUnitMixedModeAllowed,false);
  }
});

test("Q013 preflight is planning-only and ready only for separate implementation approval",()=>{
  assert.equal(pre.q013ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(pre.q013ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(pre.preflightDecision.executableRuntimeReadbackRequiredBeforeMerge,false);
  assert.equal(pre.preflightDecision.exactRuntimeMappingsBound,true);
  assert.equal(pre.preflightDecision.exactR05AssignmentsBound,true);
  assert.equal(pre.preflightDecision.exactPrerequisiteGraphsBound,true);
  assert.equal(pre.preflightDecision.separateImplementationApprovalRequired,true);
  assert.equal(pre.preflightDecision.nextTask,"P07F_W7DirectProductVerticalSlice013Implementation");
});
