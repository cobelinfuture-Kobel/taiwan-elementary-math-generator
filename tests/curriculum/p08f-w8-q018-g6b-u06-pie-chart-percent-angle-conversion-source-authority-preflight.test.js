import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p08f/q018-g6b-u06-pie-chart-percent-angle-conversion-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-08.json");
const index=read("data/curriculum/full-product/p08e/w8-source-authority-index.json");
const q017=read("data/curriculum/full-product/p08f/q017-final-learner-visual-d0-closeout.json");
const q014=read("data/curriculum/full-product/p06f/q014-g6b-u06-pie-chart-part-whole-implementation.json");
const q016=read("data/curriculum/full-product/p06f/q016-g6b-u06-compare-pie-charts-implementation.json");
const q021=read("data/curriculum/full-product/p07f/q021-g6b-u06-pie-chart-quantity-from-rate-implementation.json");
const impact=read("data/project/change-impact/P08F_W8_Q018_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P08F_W8_Q018_PREFLIGHT.validation.json");

const SRC="g6b_u06_6b06";
const KP="kp_g6b_u06_pie_chart_percent_angle_conversion";

test("W8 Q018 binds exact eighteenth frozen queue slice after Q017 D0",()=>{
  const result=materializeP08EW8DirectProductVerticalSliceQueue(),slice=result.queueEntries[17];
  assert.equal(q017.status,"Q017_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(q017.operatorAcceptance.d0Granted,true);
  assert.equal(p.predecessorAuthority.q017FinalCloseoutMergeSha,"1b97e0cd29006ad4288569a8053c7c6df16124cf");
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(result.queueFrozen,true);
  assert.equal(slice.queuePosition,18);
  assert.equal(slice.sliceId,"p08e_q018_r10_g6b_u06_6b06_profile_ratio_percent_c1");
  assert.equal(slice.implementationTaskId,"P08F_W8DirectProductVerticalSlice018Implementation");
  assert.equal(slice.previousSliceId,"p08e_q017_r10_g6a_u06_6a06_profile_geometry_formula_c1");
  assert.equal(slice.assignedDeliveryWaveId,"R05-W8");
  assert.equal(slice.primarySourceNodeId,SRC);
  assert.deepEqual(slice.supportingSourceNodeIds,[SRC]);
  assert.equal(slice.intraWavePrerequisiteRank,10);
  assert.equal(slice.primaryRuntimeProfileId,"profile_ratio_percent");
  assert.deepEqual(slice.knowledgePointIds,[KP]);
  assert.deepEqual(slice.blockingCapabilityIds,[
    "cap_fraction_number_system",
    "cap_ratio_percent_reasoning",
    "cap_ratio_rate_validator"
  ]);
  assert.deepEqual(slice.blockingCapabilityWaveIds,["R05-W3","R05-W7"]);
});

test("W8 Q018 binds reviewed percent-angle candidate and immutable G6B-U06 source",()=>{
  const source=r02.sourceRecords.find(x=>x.sourceNodeId===SRC);assert.ok(source);
  const indexed=index.sources.find(x=>x.sourceNodeId===SRC);assert.ok(indexed);
  const target=source.candidates.find(x=>x.knowledgePointId===KP);assert.ok(target);
  assert.equal(target.canonicalNameZh,"百分率與圓心角換算");
  assert.equal(target.capabilityStatement,"學生能在百分率與扇形圓心角間換算。");
  assert.equal(target.reasoningInvariant,"圓心角等於百分率乘360度。");
  assert.equal(target.category,"data");
  assert.deepEqual(target.evidencePages,[1]);
  assert.equal(target.applicationSuitability,"APPLICATION_COMPATIBLE");
  assert.ok(indexed.primaryW8KnowledgePointIds.includes(KP));
  assert.equal(p.sourceAuthority.sourcePdfDriveFileId,"1mVO-Fp8NqR68eevJ3aJK-MdoiHEYWqhz");
  assert.equal(p.sourceAuthority.sourcePdfSizeBytes,518350);
  assert.equal(p.sourceAuthority.currentVisualReadbackAuthority.percentAngleConversionVisiblyPresent,true);
  assert.equal(p.sourceAuthority.currentVisualReadbackAuthority.ocrUsedAsAuthority,false);
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.manualSourceChoiceRequired,false);
});

test("W8 Q018 locks exact R04 ratio-percent mapping without reclassification",()=>{
  const mapping=getR04KnowledgePointCapabilityMapping(KP);assert.ok(mapping);
  assert.equal(mapping.mappingId,p.runtimeCapabilityAuthority.mappingId);
  assert.equal(mapping.primaryRuntimeProfileId,"profile_ratio_percent");
  assert.equal(mapping.classificationRuleId,"rule_ratio_percent");
  assert.deepEqual(mapping.appliedModifierIds,[]);
  assert.deepEqual(mapping.requiredRuntimeCapabilityIds,p.runtimeCapabilityAuthority.requiredRuntimeCapabilityIds);
  assert.deepEqual(mapping.optionalRuntimeCapabilityIds,[]);
  assert.deepEqual(mapping.forbiddenRuntimeCapabilityIds,[]);
});

test("W8 Q018 is prerequisite-escalated from R05-W7 to R05-W8",()=>{
  const row=getR05DeliveryWaveAssignment(KP);assert.ok(row);
  assert.equal(row.baseDeliveryWaveId,"R05-W7");
  assert.equal(row.deliveryWaveId,"R05-W8");
  assert.equal(row.prerequisiteWaveLowerBound,8);
  assert.equal(row.waveEscalatedByPrerequisite,true);
  assert.equal(row.intraWavePrerequisiteRank,10);
  assert.equal(row.primaryRuntimeProfileId,"profile_ratio_percent");
  assert.deepEqual(row.effectiveRequiredRuntimeCapabilityIds,p.runtimeCapabilityAuthority.effectiveRequiredRuntimeCapabilityIds);
  assert.deepEqual(row.contractOnlyCapabilityWaveIds,["R05-W3","R05-W7"]);
  assert.deepEqual(new Set(row.contractOnlyRequiredCapabilityIds),new Set([
    "cap_fraction_number_system",
    "cap_ratio_percent_reasoning",
    "cap_ratio_rate_validator"
  ]));
});

test("W8 Q018 preserves prior same-source owners and protects construction successor",()=>{
  assert.deepEqual(q014.queueAuthority.knowledgePointIds,["kp_g6b_u06_pie_chart_part_whole"]);
  assert.deepEqual(q016.queueAuthority.knowledgePointIds,["kp_g6b_u06_compare_pie_charts"]);
  assert.deepEqual(q021.queueAuthority.targetKnowledgePointIds,["kp_g6b_u06_pie_chart_quantity_from_rate"]);
  assert.deepEqual(p.ownershipBoundary.priorSameSourceImplementedKnowledgePointIds,[
    "kp_g6b_u06_pie_chart_part_whole",
    "kp_g6b_u06_compare_pie_charts",
    "kp_g6b_u06_pie_chart_quantity_from_rate"
  ]);
  assert.deepEqual(p.ownershipBoundary.currentQ018KnowledgePointIds,[KP]);
  assert.deepEqual(p.ownershipBoundary.futureSameSourceW8KnowledgePointIds,["kp_g6b_u06_construct_pie_chart"]);
  assert.equal(p.ownershipBoundary.priorOwnersMayBeConsumedAsPrerequisiteButNotReowned,true);
});

test("W8 Q018 semantic lock is bidirectional percent-angle conversion only",()=>{
  const c=p.semanticProfileLock.implementationSemanticLock;
  assert.equal(c.percentToCentralAngleIsCore,true);
  assert.equal(c.centralAngleToPercentIsCore,true);
  assert.equal(c.fullCircleEquals360Degrees,true);
  assert.equal(c.fullCircleEquals100Percent,true);
  assert.equal(c.q014PartWholeTeachingReownershipAllowed,false);
  assert.equal(c.q016ComparePieChartsTeachingReownershipAllowed,false);
  assert.equal(c.q021QuantityFromRateTeachingReownershipAllowed,false);
  assert.equal(c.futurePieChartConstructionTeachingReownershipAllowed,false);
  assert.equal(c.genericSectorGeometryTeachingReownershipAllowed,false);
  assert.equal(c.applicationContextAllowed,false);
  assert.equal(c.sameUnitMixedModeAllowed,false);
  assert.equal(c.crossUnitMixedModeAllowed,false);
  assert.ok(p.q018ScopeLock.excludedRelations.includes("Q019_OR_LATER_IMPLEMENTATION"));
});

test("W8 Q018 preflight remains planning-only SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(p.q018ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q018ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.deepEqual(impact.currentKnowledgePointIds,[KP]);
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.equal(impact.scopeGuards.r04Mutation,false);
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_NODE_REGRESSION"),false);
  assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
  assert.equal(p.preflightDecision.separateImplementationApprovalRequired,true);
  assert.equal(p.preflightDecision.nextTask,"P08F_W8DirectProductVerticalSlice018Implementation");
});
