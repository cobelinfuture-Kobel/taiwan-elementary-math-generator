import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p08f/q021-g6b-u06-construct-pie-chart-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-08.json");
const index=read("data/curriculum/full-product/p08e/w8-source-authority-index.json");
const q020=read("data/curriculum/full-product/p08f/q020-final-learner-visual-d0-closeout.json");
const q014=read("data/curriculum/full-product/p06f/q014-g6b-u06-pie-chart-part-whole-implementation.json");
const q016=read("data/curriculum/full-product/p06f/q016-g6b-u06-compare-pie-charts-implementation.json");
const q021w7=read("data/curriculum/full-product/p07f/q021-g6b-u06-pie-chart-quantity-from-rate-implementation.json");
const q018=read("data/curriculum/full-product/p08f/q018-g6b-u06-pie-chart-percent-angle-conversion-implementation.json");
const impact=read("data/project/change-impact/P08F_W8_Q021_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P08F_W8_Q021_PREFLIGHT.validation.json");
const SRC="g6b_u06_6b06",KP="kp_g6b_u06_construct_pie_chart";

test("W8 Q021 binds exact twenty-first frozen queue slice after Q020 D0",()=>{
  const result=materializeP08EW8DirectProductVerticalSliceQueue(),slice=result.queueEntries[20];
  assert.equal(q020.status,"Q020_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(q020.operatorAcceptance.d0Granted,true);
  assert.equal(p.predecessorAuthority.q020FinalCloseoutMergeSha,"62580cd274c2e83cd5c74401fa27c77599a3b555");
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(result.queueFrozen,true);
  assert.equal(result.queueEntries.length,22);
  assert.equal(slice.queuePosition,21);
  assert.equal(slice.sliceId,"p08e_q021_r12_g6b_u06_6b06_profile_ratio_percent_c1");
  assert.equal(slice.implementationTaskId,"P08F_W8DirectProductVerticalSlice021Implementation");
  assert.equal(slice.previousSliceId,"p08e_q020_r12_g6a_u07_6a07_profile_geometry_formula_c1");
  assert.equal(slice.assignedDeliveryWaveId,"R05-W8");
  assert.equal(slice.primarySourceNodeId,SRC);
  assert.deepEqual(slice.supportingSourceNodeIds,[SRC]);
  assert.equal(slice.intraWavePrerequisiteRank,12);
  assert.equal(slice.primaryRuntimeProfileId,"profile_ratio_percent");
  assert.deepEqual(slice.knowledgePointIds,[KP]);
});

test("W8 Q021 binds reviewed construction candidate and immutable G6B-U06 source",()=>{
  const source=r02.sourceRecords.find(x=>x.sourceNodeId===SRC);assert.ok(source);
  const indexed=index.sources.find(x=>x.sourceNodeId===SRC);assert.ok(indexed);
  const target=source.candidates.find(x=>x.knowledgePointId===KP);assert.ok(target);
  assert.equal(target.canonicalNameZh,"繪製圓形圖");
  assert.equal(target.capabilityStatement,"學生能由分類資料計算比例與角度並畫圖。");
  assert.equal(target.reasoningInvariant,"各扇形角度按資料比率分配且總和360度。");
  assert.equal(target.category,"data");
  assert.deepEqual(target.evidencePages,[1]);
  assert.equal(target.applicationSuitability,"APPLICATION_COMPATIBLE");
  assert.ok(indexed.primaryW8KnowledgePointIds.includes(KP));
  assert.equal(p.sourceAuthority.sourcePdfDriveFileId,"1mVO-Fp8NqR68eevJ3aJK-MdoiHEYWqhz");
  assert.equal(p.sourceAuthority.sourcePdfSizeBytes,518350);
  assert.equal(p.sourceAuthority.currentVisualReadbackAuthority.pieChartConstructionVisiblyPresent,true);
  assert.ok(p.sourceAuthority.currentVisualReadbackAuthority.page1VisibleFamilies.includes("PIE_CHART_CONSTRUCTION"));
  assert.equal(p.sourceAuthority.currentVisualReadbackAuthority.ocrUsedAsAuthority,false);
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.manualSourceChoiceRequired,false);
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.manualEvidenceChoiceRequired,false);
});

test("W8 Q021 reads exact R04 ratio-percent mapping without reclassification",()=>{
  const mapping=getR04KnowledgePointCapabilityMapping(KP);assert.ok(mapping);
  assert.equal(mapping.mappingId,"r04map_g6b_u06_construct_pie_chart");
  assert.equal(mapping.primaryRuntimeProfileId,"profile_ratio_percent");
  assert.equal(mapping.classificationRuleId,"rule_ratio_percent");
  assert.deepEqual(mapping.appliedModifierIds,[]);
  assert.deepEqual(mapping.requiredRuntimeCapabilityIds,p.runtimeCapabilityAuthority.requiredRuntimeCapabilityIds);
  assert.deepEqual(mapping.optionalRuntimeCapabilityIds,[]);
  assert.deepEqual(mapping.forbiddenRuntimeCapabilityIds,[]);
  assert.equal(p.runtimeCapabilityAuthority.exactR04MappingBoundByFocusedCI,true);
});

test("W8 Q021 reads exact R05 assignment and frozen rank twelve envelope",()=>{
  const row=getR05DeliveryWaveAssignment(KP);assert.ok(row);
  assert.equal(row.deliveryWaveId,"R05-W8");
  assert.equal(row.intraWavePrerequisiteRank,12);
  assert.equal(row.primaryRuntimeProfileId,"profile_ratio_percent");
  assert.ok(row.sourceNodeIds.includes(SRC));
  assert.equal(row.baseDeliveryWaveId,"R05-W7");
  assert.equal(row.prerequisiteWaveLowerBound,8);
  assert.equal(row.waveEscalatedByPrerequisite,true);
  assert.deepEqual(row.effectiveRequiredRuntimeCapabilityIds,p.runtimeCapabilityAuthority.effectiveRequiredRuntimeCapabilityIds);
  assert.deepEqual(new Set(row.contractOnlyRequiredCapabilityIds),new Set(p.runtimeCapabilityAuthority.contractOnlyRequiredCapabilityIds));
  assert.deepEqual(row.contractOnlyCapabilityWaveIds,["R05-W3","R05-W7"]);
  assert.equal(p.runtimeCapabilityAuthority.exactR05AssignmentBoundByFocusedCI,true);
});

test("W8 Q021 preserves all four prior G6B-U06 owners and completes remaining W8 target",()=>{
  assert.deepEqual(q014.queueAuthority.knowledgePointIds,["kp_g6b_u06_pie_chart_part_whole"]);
  assert.deepEqual(q016.queueAuthority.knowledgePointIds,["kp_g6b_u06_compare_pie_charts"]);
  assert.deepEqual(q021w7.queueAuthority.targetKnowledgePointIds,["kp_g6b_u06_pie_chart_quantity_from_rate"]);
  assert.deepEqual(q018.queueAuthority.knowledgePointIds,["kp_g6b_u06_pie_chart_percent_angle_conversion"]);
  assert.deepEqual(p.ownershipBoundary.priorSameSourceImplementedKnowledgePointIds,[
    "kp_g6b_u06_pie_chart_part_whole",
    "kp_g6b_u06_compare_pie_charts",
    "kp_g6b_u06_pie_chart_quantity_from_rate",
    "kp_g6b_u06_pie_chart_percent_angle_conversion"
  ]);
  assert.deepEqual(p.ownershipBoundary.currentQ021KnowledgePointIds,[KP]);
  assert.deepEqual(p.ownershipBoundary.futureSameSourceW8KnowledgePointIds,[]);
  assert.equal(p.ownershipBoundary.q021CompletesRemainingFrozenW8G6BU06KnowledgePoints,true);
});

test("W8 Q021 semantic lock is pie-chart construction only",()=>{
  const c=p.semanticProfileLock.implementationSemanticLock;
  assert.equal(c.classifiedDataToProportionIsCore,true);
  assert.equal(c.percentShareCalculationIsCore,true);
  assert.equal(c.percentToCentralAngleMayConsumeQ018,true);
  assert.equal(c.sectorAllocationByCentralAngleIsCore,true);
  assert.equal(c.chartConstructionIsCore,true);
  assert.equal(c.fullCircleEquals100Percent,true);
  assert.equal(c.fullCircleEquals360Degrees,true);
  assert.equal(c.q014PartWholeTeachingReownershipAllowed,false);
  assert.equal(c.q016ComparePieChartsTeachingReownershipAllowed,false);
  assert.equal(c.q021QuantityFromRateTeachingReownershipAllowed,false);
  assert.equal(c.q018PercentAngleTeachingReownershipAllowed,false);
  assert.equal(c.genericSectorGeometryTeachingReownershipAllowed,false);
  assert.equal(c.applicationContextAllowed,false);
  assert.equal(c.sameUnitMixedModeAllowed,false);
  assert.equal(c.crossUnitMixedModeAllowed,false);
  assert.ok(p.q021ScopeLock.excludedRelations.includes("Q022_OR_LATER_IMPLEMENTATION"));
});

test("W8 Q021 preflight remains planning-only SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(p.q021ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q021ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.deepEqual(impact.currentKnowledgePointIds,[KP]);
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.equal(impact.scopeGuards.r04Mutation,false);
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_NODE_REGRESSION"),false);
  assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
  assert.equal(p.preflightDecision.separateImplementationApprovalRequired,true);
  assert.equal(p.preflightDecision.nextTask,"P08F_W8DirectProductVerticalSlice021Implementation");
});
