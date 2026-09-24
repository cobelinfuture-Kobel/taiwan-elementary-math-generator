import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
import {getR03DirectPrerequisites} from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const pre=read("data/curriculum/full-product/p07f/q022-g6b-u04-three-rate-quantity-relations-source-authority-preflight.json");
const q021=read("docs/ci/latest-p07f-w7-q021-pages-e2e.json");
const q019=read("data/curriculum/full-product/p07f/q019-g6b-u04-base-comparison-rate-roles-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-08.json");
const impact=read("data/project/change-impact/P07F_W7_Q022_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P07F_W7_Q022_PREFLIGHT.validation.json");
const KPS=[
  "kp_g6b_u04_find_base_quantity",
  "kp_g6b_u04_find_comparison_quantity",
  "kp_g6b_u04_find_rate_from_quantities"
];
const MAP_IDS=[
  "r04map_g6b_u04_find_base_quantity",
  "r04map_g6b_u04_find_comparison_quantity",
  "r04map_g6b_u04_find_rate_from_quantities"
];
const EDGE_IDS=["kpe_r03_0609","kpe_r03_0610","kpe_r03_0611"];
const REQUIRED=[
  "cap_pattern_spec_resolution",
  "cap_deterministic_answer_model",
  "cap_worksheet_document_assembly",
  "cap_answer_key_projection",
  "cap_html_print_renderer",
  "cap_ratio_percent_reasoning",
  "cap_ratio_rate_validator",
  "cap_text_application_representation"
];

test("Q022 exact frozen three-KP successor follows Q021 D0",()=>{
  const row=materializeP07EW7DirectProductVerticalSliceQueue().queueEntries[21];
  assert.equal(q021.status,"PASS_E6_D0_COMPLETE");
  assert.equal(q021.exactHeadSha,"b5c106342e20cfcdcffe5f315499289cc569e63d");
  assert.equal(row.queuePosition,22);
  assert.equal(row.sliceId,"p07e_q022_r12_g6b_u04_6b04_profile_ratio_percent_c1");
  assert.equal(row.previousSliceId,"p07e_q021_r11_g6b_u06_6b06_profile_ratio_percent_c1");
  assert.equal(row.primarySourceNodeId,"g6b_u04_6b04");
  assert.equal(row.primaryRuntimeProfileId,"profile_ratio_percent");
  assert.equal(row.intraWavePrerequisiteRank,12);
  assert.equal(row.knowledgePointCount,3);
  assert.deepEqual([...row.knowledgePointIds],KPS);
  assert.deepEqual([...row.requiredW7CapabilityIds],["cap_ratio_percent_reasoning","cap_ratio_rate_validator"]);
});

test("Q022 binds unchanged G6B-U04 source authority and three exact R02 candidates",()=>{
  const src=r02.sourceRecords.find(x=>x.sourceNodeId==="g6b_u04_6b04");
  assert.ok(src);assert.equal(src.sourceTitle,"基準量與比較量");assert.equal(src.sourcePdfTitle,"meow911_6b04_source.pdf");assert.deepEqual(src.reviewedPages,[1,2]);
  assert.equal(pre.sourceAuthority.sourcePdfDriveFileId,q019.sourceAuthority.sourcePdfDriveFileId);
  assert.equal(pre.sourceAuthority.sourcePdfSha256,q019.sourceAuthority.sourcePdfSha256);
  assert.equal(pre.sourceAuthority.inheritedCurrentVisualVerification.completed,true);
  assert.equal(pre.sourceAuthority.inheritedCurrentVisualVerification.ocrUsedAsAuthority,false);
  assert.equal(pre.sourceAuthority.directConnectorReadback.extractedTextNotUsedAsSemanticAuthority,true);
  assert.deepEqual(pre.r02ReviewedCandidateAuthority.targetCandidates.map(x=>x.knowledgePointId),KPS);
  for(const id of KPS){const c=src.candidates.find(x=>x.knowledgePointId===id);assert.ok(c);assert.deepEqual(c.evidencePages,[1,2]);}
});

test("Q022 semantic ownership is exact and successive-rate-change remains protected",()=>{
  assert.deepEqual(pre.r02ReviewedCandidateAuthority.predecessorOwnedKnowledgePointIds,["kp_g6b_u04_base_comparison_rate_roles"]);
  assert.deepEqual(pre.r02ReviewedCandidateAuthority.protectedFutureSameSourceKnowledgePointIds,["kp_g6b_u04_successive_rate_change"]);
  assert.deepEqual(pre.q022ScopeLock.includedKnowledgePointIds,KPS);
  const s=pre.semanticProfileLock.implementationSemanticLock;
  assert.equal(s.solveBaseQuantityAllowed,true);assert.equal(s.solveComparisonQuantityAllowed,true);assert.equal(s.solveRateFromQuantitiesAllowed,true);
  assert.equal(s.baseComparisonRateRoleModelMustBePreserved,true);assert.equal(s.answerBackSubstitutionRequired,true);
  assert.equal(s.predecessorRoleClassificationReownershipAllowed,false);assert.equal(s.successiveRateChangeAllowed,false);
  assert.equal(s.sameUnitMixedModeAllowed,false);assert.equal(s.crossUnitMixedModeAllowed,false);
});

test("Q022 binds exact R03 R04 and R05 authority for all three KPs",()=>{
  KPS.forEach((id,i)=>{
    const r03=getR03DirectPrerequisites(id),r04=getR04KnowledgePointCapabilityMapping(id),r05=getR05DeliveryWaveAssignment(id);
    assert.equal(r03.length,1);assert.equal(r03[0].edgeId,EDGE_IDS[i]);assert.equal(r03[0].fromKnowledgePointId,"kp_g6b_u04_base_comparison_rate_roles");
    assert.equal(r03[0].dependencyStrength,"required");assert.equal(r03[0].dependencyRole,"relation_model_foundation");assert.equal(r03[0].distanceBearing,true);
    assert.ok(r04);assert.equal(r04.mappingId,MAP_IDS[i]);assert.equal(r04.primaryRuntimeProfileId,"profile_ratio_percent");assert.equal(r04.classificationRuleId,"rule_ratio_percent");
    assert.deepEqual([...r04.requiredRuntimeCapabilityIds],REQUIRED);assert.deepEqual([...r04.optionalRuntimeCapabilityIds],[]);assert.deepEqual([...r04.forbiddenRuntimeCapabilityIds],[]);
    assert.ok(r05);assert.equal(r05.baseDeliveryWaveId,"R05-W7");assert.equal(r05.deliveryWaveId,"R05-W7");assert.equal(r05.intraWavePrerequisiteRank,12);
    assert.equal(r05.prerequisiteWaveLowerBound,7);assert.equal(r05.waveEscalatedByPrerequisite,false);assert.equal(r05.primaryRuntimeProfileId,"profile_ratio_percent");
    assert.deepEqual([...r05.contractOnlyRequiredCapabilityIds].sort(),["cap_fraction_number_system","cap_ratio_percent_reasoning","cap_ratio_rate_validator"].sort());
    assert.equal(r05.productionAdmissionState,"PLANNED_NOT_ADMITTED");
  });
});

test("Q022 preflight stays planning-only and requests separate implementation approval",()=>{
  assert.equal(pre.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(pre.goalDistance.reduced,"D3_TO_D2");
  assert.equal(pre.executableAuthorityReadback.pending,false);
  assert.equal(pre.preflightDecision.exactThreeKnowledgePointSetResolved,true);
  assert.equal(pre.preflightDecision.sourceAuthoritySufficientForQ022ImplementationPlanning,true);
  assert.equal(pre.preflightDecision.separateImplementationApprovalRequired,true);
  assert.equal(pre.preflightDecision.nextTask,"P07F_W7DirectProductVerticalSlice022Implementation");
  assert.equal(pre.q022ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(pre.q022ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.deepEqual(impact.currentKnowledgePointIds,KPS);
  assert.ok(Object.values(impact.unitKnowledgePointGateStatus).every(x=>x==="PLANNING_READY_IMPLEMENTATION_APPROVAL_REQUIRED"));
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(validation.lanes.SHARED_RUNTIME_BOUNDED[1].runtime,"NODE_ONLY");
  assert.equal(pre.preflightValidationBoundary.fullRepositoryRegressionAllowed,false);
  assert.equal(pre.preflightValidationBoundary.globalBrowserReplayAllowed,false);
  assert.equal(pre.preflightDecision.manualSourceChoiceRequired,false);
  assert.equal(pre.preflightDecision.manualEvidenceChoiceRequired,false);
});
