import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
import {getR03DirectPrerequisites} from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const pre=read("data/curriculum/full-product/p07f/q021-g6b-u06-pie-chart-quantity-from-rate-source-authority-preflight.json");
const q020=read("docs/ci/latest-p07f-w7-q020-pages-e2e.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-08.json");
const impact=read("data/project/change-impact/P07F_W7_Q021_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P07F_W7_Q021_PREFLIGHT.validation.json");
const KP="kp_g6b_u06_pie_chart_quantity_from_rate";

test("Q021 exact frozen W7 successor follows Q020 D0",()=>{
  const q=materializeP07EW7DirectProductVerticalSliceQueue(),row=q.queueEntries[20];
  assert.equal(q020.status,"PASS_E6_D0_COMPLETE");
  assert.equal(q020.exactHeadSha,"ace3ae699a96d24be43bdfeeb15cb57be6e279ad");
  assert.equal(row.queuePosition,21);
  assert.equal(row.sliceId,"p07e_q021_r11_g6b_u06_6b06_profile_ratio_percent_c1");
  assert.equal(row.previousSliceId,"p07e_q020_r11_g6b_u05_6b05_profile_factor_multiple_c1");
  assert.equal(row.primarySourceNodeId,"g6b_u06_6b06");
  assert.equal(row.primaryRuntimeProfileId,"profile_ratio_percent");
  assert.equal(row.intraWavePrerequisiteRank,11);
  assert.deepEqual([...row.knowledgePointIds],[KP]);
  assert.deepEqual([...row.requiredW7CapabilityIds],["cap_ratio_percent_reasoning","cap_ratio_rate_validator"]);
});

test("Q021 binds reviewed G6B-U06 source and exact R02 quantity-from-rate candidate",()=>{
  const src=r02.sourceRecords.find(x=>x.sourceNodeId==="g6b_u06_6b06"),c=src?.candidates.find(x=>x.knowledgePointId===KP);
  assert.ok(src);assert.ok(c);
  assert.equal(src.sourceTitle,"圓形圖");
  assert.equal(src.sourcePdfTitle,"meow911_6b06_source.pdf");
  assert.deepEqual(src.reviewedPages,[1]);
  assert.equal(c.canonicalNameZh,"由圓形圖比率求數量");
  assert.equal(c.capabilityStatement,"學生能由總量與扇形比率求各類數量。");
  assert.equal(c.reasoningInvariant,"部分量等於總量乘扇形比例。");
  assert.deepEqual(c.evidencePages,[1]);
  assert.equal(pre.sourceAuthority.sourcePdfDriveFileId,"1mVO-Fp8NqR68eevJ3aJK-MdoiHEYWqhz");
  assert.equal(pre.sourceAuthority.sourcePdfSizeBytes,518350);
  assert.equal(pre.sourceAuthority.currentDirectVisualVerification.completed,true);
  assert.equal(pre.sourceAuthority.currentDirectVisualVerification.ocrUsedAsAuthority,false);
  assert.deepEqual(pre.sourceAuthority.currentDirectVisualVerification.targetEvidencePages,[1]);
});

test("Q021 protects prior and later G6B-U06 ownership",()=>{
  assert.deepEqual(pre.r02ReviewedCandidateAuthority.predecessorOwnedKnowledgePointIds,[
    "kp_g6b_u06_pie_chart_part_whole",
    "kp_g6b_u06_compare_pie_charts"
  ]);
  assert.deepEqual(pre.r02ReviewedCandidateAuthority.protectedFutureSameSourceKnowledgePointIds,[
    "kp_g6b_u06_pie_chart_percent_angle_conversion",
    "kp_g6b_u06_construct_pie_chart"
  ]);
  assert.equal(pre.r02ReviewedCandidateAuthority.remainingCandidateCountAfterQ021,2);
  const s=pre.semanticProfileLock.implementationSemanticLock;
  assert.equal(s.totalQuantityGiven,true);
  assert.equal(s.pieChartSectorRateGiven,true);
  assert.equal(s.solvePartQuantity,true);
  assert.equal(s.answerMustEqualTotalTimesRate,true);
  assert.equal(s.predecessorPartWholeReownershipAllowed,false);
  assert.equal(s.predecessorComparePieChartsReownershipAllowed,false);
  assert.equal(s.percentAngleConversionOwnershipAllowed,false);
  assert.equal(s.pieChartConstructionOwnershipAllowed,false);
});

test("Q021 executable authority is structurally compatible with frozen ratio-percent envelope",()=>{
  const r03=getR03DirectPrerequisites(KP),r04=getR04KnowledgePointCapabilityMapping(KP),r05=getR05DeliveryWaveAssignment(KP);
  assert.deepEqual(r03.map(e=>e.edgeId),["kpe_r03_0632","kpe_r03_0633"]);
  assert.deepEqual(r03.map(e=>e.fromKnowledgePointId),["kp_g5b_u08_percentage_of_quantity","kp_g6b_u06_pie_chart_part_whole"]);
  assert.ok(r03.every(e=>e.toKnowledgePointId===KP&&e.dependencyStrength==="required"&&e.distanceBearing===true));
  assert.ok(r04);assert.ok(r05);
  assert.equal(r04.primaryRuntimeProfileId,"profile_ratio_percent");
  assert.equal(r04.classificationRuleId,"rule_ratio_percent");
  assert.deepEqual([...r04.requiredRuntimeCapabilityIds],[
    "cap_pattern_spec_resolution",
    "cap_deterministic_answer_model",
    "cap_worksheet_document_assembly",
    "cap_answer_key_projection",
    "cap_html_print_renderer",
    "cap_ratio_percent_reasoning",
    "cap_ratio_rate_validator",
    "cap_text_application_representation"
  ]);
  assert.equal(r05.baseDeliveryWaveId,"R05-W7");
  assert.equal(r05.deliveryWaveId,"R05-W7");
  assert.equal(r05.intraWavePrerequisiteRank,11);
  assert.equal(r05.prerequisiteWaveLowerBound,7);
  assert.equal(r05.waveEscalatedByPrerequisite,false);
  assert.equal(r05.primaryRuntimeProfileId,"profile_ratio_percent");
  assert.deepEqual([...r05.contractOnlyRequiredCapabilityIds].sort(),[
    "cap_fraction_number_system",
    "cap_ratio_percent_reasoning",
    "cap_ratio_rate_validator"
  ].sort());
});

test("Q021 preflight remains planning-only SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(pre.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(pre.executableAuthorityReadback.pending,false);
  assert.deepEqual(pre.prerequisiteGraphAuthority.requiredPrerequisiteKnowledgePointIds,["kp_g5b_u08_percentage_of_quantity","kp_g6b_u06_pie_chart_part_whole"]);
  assert.equal(pre.runtimeCapabilityAuthority.profileId,"profile_ratio_percent");
  assert.equal(pre.r05AssignmentAuthority.deliveryWaveId,"R05-W7");
  assert.equal(pre.q021ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(pre.q021ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(pre.preflightDecision.separateImplementationApprovalRequired,true);
  assert.equal(pre.preflightDecision.nextTask,"P07F_W7DirectProductVerticalSlice021Implementation");
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.changeImpact.affectedRoutes,"BOUNDED");
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(validation.lanes.SHARED_RUNTIME_BOUNDED[1].runtime,"NODE_ONLY");
  assert.equal(pre.preflightValidationBoundary.fullRepositoryRegressionAllowed,false);
  assert.equal(pre.preflightValidationBoundary.globalBrowserReplayAllowed,false);
  assert.equal(pre.preflightDecision.manualSourceChoiceRequired,false);
  assert.equal(pre.preflightDecision.manualEvidenceChoiceRequired,false);
});
