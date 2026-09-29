import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p08f/q016-g6a-u09-scale-drawing-similar-angle-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-07.json");
const index=read("data/curriculum/full-product/p08e/w8-source-authority-index.json");
const q015=read("data/curriculum/full-product/p08f/q015-final-learner-visual-d0-closeout.json");
const q007=read("data/curriculum/full-product/p07f/q007-g6a-u09-scale-factor-length-implementation.json");
const q012=read("data/curriculum/full-product/p07f/q012-g6a-u09-scale-area-change-implementation.json");
const q014=read("data/curriculum/full-product/p08f/q014-g6a-u09-map-scale-distance-implementation.json");
const impact=read("data/project/change-impact/P08F_W8_Q016_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P08F_W8_Q016_PREFLIGHT.validation.json");

const SRC="g6a_u09_6a09";
const KPS=["kp_g6a_u09_scale_drawing_construction","kp_g6a_u09_similar_shape_angle"];

test("W8 Q016 preflight binds exact sixteenth frozen queue slice after Q015 D0",()=>{
  const result=materializeP08EW8DirectProductVerticalSliceQueue(),slice=result.queueEntries[15];
  assert.equal(q015.status,"Q015_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(q015.operatorAcceptance.d0Granted,true);
  assert.equal(p.predecessorAuthority.q015FinalCloseoutStatus,"Q015_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(p.predecessorAuthority.q015FinalCloseoutMergeSha,"c7d8c6d9360f599d6712f3ebc6e25e73604e62fb");
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(result.queueFrozen,true);
  assert.equal(result.queueEntries.length,22);
  assert.equal(slice.queuePosition,16);
  assert.equal(slice.sliceId,"p08e_q016_r9_g6a_u09_6a09_profile_geometry_property_c1");
  assert.equal(slice.implementationTaskId,"P08F_W8DirectProductVerticalSlice016Implementation");
  assert.equal(slice.previousSliceId,"p08e_q015_r9_g6a_u06_6a06_profile_geometry_formula_c1");
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.assignedDeliveryWaveId,"R05-W8");
  assert.equal(slice.primarySourceNodeId,SRC);
  assert.deepEqual(slice.supportingSourceNodeIds,[SRC]);
  assert.equal(slice.intraWavePrerequisiteRank,9);
  assert.equal(slice.primaryRuntimeProfileId,"profile_geometry_property");
  assert.equal(slice.chunkIndex,1);
  assert.equal(slice.knowledgePointCount,2);
  assert.deepEqual(slice.knowledgePointIds,KPS);
  assert.deepEqual(slice.blockingCapabilityIds,[
    "cap_geometry_construction",
    "cap_geometry_diagram_representation",
    "cap_geometry_domain_validator",
    "cap_geometry_property_reasoning"
  ]);
  assert.deepEqual(slice.blockingCapabilityWaveIds,["R05-W5"]);
  assert.equal(slice.targetEvidenceLevel,"E6_D0_COMPLETE");
  assert.equal(p.queueAuthority.queueDigest,"597a6fa497c8ac7738247847ef321d0c753e79800f5c38097b7a7a160be2f484");
});

test("W8 Q016 binds both reviewed G6A-U09 candidates and immutable source authority",()=>{
  const source=r02.sourceRecords.find(x=>x.sourceNodeId===SRC);assert.ok(source);
  const indexed=index.sources.find(x=>x.sourceNodeId===SRC);assert.ok(indexed);
  assert.equal(source.sourceTitle,"放大圖縮圖與比例尺");
  assert.equal(source.sourcePdfTitle,"meow911_6a09_source.pdf");
  assert.deepEqual(source.reviewedPages,[1]);
  const scale=source.candidates.find(x=>x.knowledgePointId===KPS[0]);
  const angle=source.candidates.find(x=>x.knowledgePointId===KPS[1]);
  assert.ok(scale);assert.ok(angle);
  assert.equal(scale.canonicalNameZh,"繪製放大圖與縮圖");
  assert.equal(scale.capabilityStatement,"學生能在方格或坐標上按比例畫圖。");
  assert.equal(scale.reasoningInvariant,"每個對應點相對基準的位置須按同一比例縮放。");
  assert.equal(angle.canonicalNameZh,"放大縮圖形狀與角度");
  assert.equal(angle.capabilityStatement,"學生能判斷放大縮圖保持形狀與對應角。");
  assert.equal(angle.reasoningInvariant,"比例變換改變長度但保持角度與平行關係。");
  assert.ok(KPS.every(id=>indexed.primaryW8KnowledgePointIds.includes(id)));
  assert.equal(p.sourceAuthority.sourcePdfDriveFileId,"1qnZyEDcmOgb94BYU350cmjvUN4kESlEZ");
  assert.equal(p.sourceAuthority.sourcePdfSha256,"80ec4d8df9a4d5bf98392cf846fac7df68c49781ba60eefa78e70e9109cbbe2c");
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.manualSourceChoiceRequired,false);
  assert.equal(p.sourceAuthority.currentAuthorityTreatment.ocrUsedAsAuthority,false);
});

test("W8 Q016 locks exact R04 geometry-property mappings without reclassification",()=>{
  for(const kp of KPS){
    const mapping=getR04KnowledgePointCapabilityMapping(kp);assert.ok(mapping);
    const expected=p.runtimeCapabilityAuthority.perKnowledgePointMappings[kp];
    assert.equal(mapping.mappingId,expected.mappingId);
    assert.equal(mapping.primaryRuntimeProfileId,"profile_geometry_property");
    assert.equal(mapping.classificationRuleId,"rule_geometry_property");
    assert.deepEqual(mapping.appliedModifierIds,expected.appliedModifierIds);
    assert.deepEqual(mapping.requiredRuntimeCapabilityIds,expected.requiredRuntimeCapabilityIds);
    assert.deepEqual(mapping.optionalRuntimeCapabilityIds,expected.optionalRuntimeCapabilityIds);
    assert.deepEqual(mapping.forbiddenRuntimeCapabilityIds,expected.forbiddenRuntimeCapabilityIds);
  }
  assert.equal(p.runtimeCapabilityAuthority.runtimeProfileReclassificationAllowed,false);
});

test("W8 Q016 remains prerequisite-escalated R05-W8 for both targets",()=>{
  for(const kp of KPS){
    const row=getR05DeliveryWaveAssignment(kp);assert.ok(row);
    assert.equal(row.baseDeliveryWaveId,"R05-W5");
    assert.equal(row.deliveryWaveId,"R05-W8");
    assert.equal(row.waveEscalatedByPrerequisite,true);
    assert.equal(row.intraWavePrerequisiteRank,9);
    assert.equal(row.primaryRuntimeProfileId,"profile_geometry_property");
    assert.deepEqual(row.contractOnlyCapabilityWaveIds,["R05-W5"]);
  }
  const scale=getR05DeliveryWaveAssignment(KPS[0]);
  assert.deepEqual(new Set(scale.contractOnlyRequiredCapabilityIds),new Set([
    "cap_geometry_property_reasoning","cap_geometry_domain_validator","cap_geometry_diagram_representation","cap_geometry_construction"
  ]));
  const angle=getR05DeliveryWaveAssignment(KPS[1]);
  assert.deepEqual(new Set(angle.contractOnlyRequiredCapabilityIds),new Set([
    "cap_geometry_property_reasoning","cap_geometry_domain_validator","cap_geometry_diagram_representation"
  ]));
});

test("W8 Q016 protects all prior G6A-U09 product ownership",()=>{
  assert.deepEqual(q007.queueAuthority.knowledgePointIds,["kp_g6a_u09_scale_factor_length"]);
  assert.deepEqual(q012.queueAuthority.knowledgePointIds,["kp_g6a_u09_scale_area_change"]);
  assert.deepEqual(q014.queueAuthority.knowledgePointIds,["kp_g6a_u09_map_scale_distance"]);
  assert.deepEqual(p.sameSourceOwnershipBoundary.priorImplementedKnowledgePointIds,[
    "kp_g6a_u09_scale_factor_length",
    "kp_g6a_u09_scale_area_change",
    "kp_g6a_u09_map_scale_distance"
  ]);
  assert.deepEqual(p.sameSourceOwnershipBoundary.currentQ016KnowledgePointIds,KPS);
  assert.deepEqual(p.sameSourceOwnershipBoundary.futureSameSourceW8KnowledgePointIds,[]);
  assert.equal(p.sameSourceOwnershipBoundary.q016MayConsumePriorScaleKnowledgeAsPrerequisiteButNotReown,true);
  assert.equal(p.sameSourceOwnershipBoundary.q016CompletesRemainingFrozenW8G6AU09KnowledgePoints,true);
});

test("W8 Q016 semantic lock is construction plus angle/parallel invariance only",()=>{
  const c=p.semanticProfileLock;
  assert.equal(c.scaleDrawingConstruction.singlePositiveNonzeroScaleFactorRequired,true);
  assert.equal(c.scaleDrawingConstruction.allCorrespondingPointOffsetsUseSameScaleFactor,true);
  assert.equal(c.scaleDrawingConstruction.boundedGridOrCoordinateRepresentationAllowed,true);
  assert.equal(c.scaleDrawingConstruction.genericCoordinateGeometryTeachingAllowed,false);
  assert.equal(c.similarShapeAngle.correspondingAngleEqualityRequired,true);
  assert.equal(c.similarShapeAngle.parallelRelationPreservationRequired,true);
  assert.equal(c.similarShapeAngle.lengthsMayScaleWhileAnglesRemainInvariant,true);
  assert.equal(c.sharedInitialImplementationBoundary.singleKnowledgePointRoutesOnly,true);
  assert.equal(c.sharedInitialImplementationBoundary.sameUnitMixedModeAllowed,false);
  assert.equal(c.sharedInitialImplementationBoundary.crossUnitMixedModeAllowed,false);
  assert.equal(c.sharedInitialImplementationBoundary.applicationContextAllowed,false);
  assert.ok(p.q016ScopeLock.excludedRelations.includes("Q017_OR_LATER_IMPLEMENTATION"));
});

test("W8 Q016 preflight remains planning-only SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(p.q016ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q016ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.deepEqual(impact.currentKnowledgePointIds,KPS);
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.equal(impact.scopeGuards.r04Mutation,false);
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_NODE_REGRESSION"),false);
  assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
  assert.equal(p.preflightDecision.separateImplementationApprovalRequired,true);
  assert.equal(p.preflightDecision.nextTask,"P08F_W8DirectProductVerticalSlice016Implementation");
});
