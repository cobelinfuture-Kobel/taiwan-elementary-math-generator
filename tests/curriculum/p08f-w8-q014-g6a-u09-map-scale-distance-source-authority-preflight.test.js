import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p08f/q014-g6a-u09-map-scale-distance-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-07.json");
const index=read("data/curriculum/full-product/p08e/w8-source-authority-index.json");
const q013=read("data/curriculum/full-product/p08f/q013-final-learner-visual-d0-closeout.json");
const w7q007=read("data/curriculum/full-product/p07f/q007-g6a-u09-scale-factor-length-implementation.json");
const w7q012=read("data/curriculum/full-product/p07f/q012-g6a-u09-scale-area-change-implementation.json");
const impact=read("data/project/change-impact/P08F_W8_Q014_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P08F_W8_Q014_PREFLIGHT.validation.json");
const KP="kp_g6a_u09_map_scale_distance";
const SRC="g6a_u09_6a09";

test("W8 Q014 preflight binds exact fourteenth frozen queue slice after Q013 D0",()=>{
  const result=materializeP08EW8DirectProductVerticalSliceQueue(),slice=result.queueEntries[13];
  assert.equal(q013.status,"Q013_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(q013.operatorAcceptance.d0Granted,true);
  assert.equal(p.predecessorAuthority.q013FinalCloseoutStatus,"Q013_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(p.predecessorAuthority.q013FinalCloseoutMergeSha,"4f164e47eb39a55d0bf5a8dfe3276d141b243842");
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(result.queueFrozen,true);
  assert.equal(result.queueEntries.length,22);
  assert.equal(slice.queuePosition,14);
  assert.equal(slice.sliceId,"p08e_q014_r7_g6a_u09_6a09_profile_geometry_property_c1");
  assert.equal(slice.implementationTaskId,"P08F_W8DirectProductVerticalSlice014Implementation");
  assert.equal(slice.previousSliceId,"p08e_q013_r7_g5a_u05_5a05a_profile_geometry_property_c1");
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.assignedDeliveryWaveId,"R05-W8");
  assert.equal(slice.primarySourceNodeId,SRC);
  assert.deepEqual(slice.supportingSourceNodeIds,[SRC]);
  assert.equal(slice.intraWavePrerequisiteRank,7);
  assert.equal(slice.primaryRuntimeProfileId,"profile_geometry_property");
  assert.equal(slice.chunkIndex,1);
  assert.equal(slice.knowledgePointCount,1);
  assert.deepEqual(slice.knowledgePointIds,[KP]);
  assert.deepEqual(slice.blockingCapabilityIds,[
    "cap_coordinate_map_representation",
    "cap_geometry_diagram_representation",
    "cap_geometry_domain_validator",
    "cap_geometry_property_reasoning"
  ]);
  assert.deepEqual(slice.blockingCapabilityWaveIds,["R05-W5","R05-W6"]);
  assert.equal(slice.targetEvidenceLevel,"E6_D0_COMPLETE");
  assert.equal(p.queueAuthority.queueDigest,"597a6fa497c8ac7738247847ef321d0c753e79800f5c38097b7a7a160be2f484");
});

test("W8 Q014 binds reviewed G6A-U09 map-scale candidate and immutable source authority",()=>{
  const source=r02.sourceRecords.find(x=>x.sourceNodeId===SRC);assert.ok(source);
  const indexed=index.sources.find(x=>x.sourceNodeId===SRC);assert.ok(indexed);
  const candidate=source.candidates.find(x=>x.knowledgePointId===KP);assert.ok(candidate);
  assert.equal(source.sourceTitle,"放大圖縮圖與比例尺");
  assert.equal(source.sourcePdfTitle,"meow911_6a09_source.pdf");
  assert.deepEqual(source.reviewedPages,[1]);
  assert.equal(candidate.canonicalNameZh,"比例尺與實際距離");
  assert.equal(candidate.capabilityStatement,"學生能由圖上距離與比例尺求實際距離。");
  assert.equal(candidate.reasoningInvariant,"圖上距離與實際距離的比固定且單位須統一。");
  assert.deepEqual(candidate.evidencePages,[1]);
  assert.ok(indexed.primaryW8KnowledgePointIds.includes(KP));
  assert.deepEqual(indexed.reviewedPages,[1]);
  assert.equal(p.sourceAuthority.sourcePdfDriveFileId,"1qnZyEDcmOgb94BYU350cmjvUN4kESlEZ");
  assert.equal(p.sourceAuthority.sourcePdfSha256,"80ec4d8df9a4d5bf98392cf846fac7df68c49781ba60eefa78e70e9109cbbe2c");
  assert.equal(p.sourceAuthority.currentVisualReadbackAuthority.q014DirectVisualEvidence.directMapScaleFamilyVisible,true);
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.sourceRefAmbiguity,false);
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.manualSourceChoiceRequired,false);
});

test("W8 Q014 locks exact geometry-property plus coordinate-map runtime mapping",()=>{
  const mapping=getR04KnowledgePointCapabilityMapping(KP);assert.ok(mapping);
  const a=p.runtimeCapabilityAuthority;
  assert.equal(mapping.mappingId,"r04map_g6a_u09_map_scale_distance");
  assert.equal(mapping.primaryRuntimeProfileId,"profile_geometry_property");
  assert.equal(mapping.classificationRuleId,"rule_geometry_property");
  assert.deepEqual(mapping.appliedModifierIds,["mod_coordinate_map"]);
  assert.deepEqual(mapping.requiredRuntimeCapabilityIds,a.exactMappingRequiredRuntimeCapabilityIds);
  assert.deepEqual(mapping.optionalRuntimeCapabilityIds,["cap_geometry_construction"]);
  assert.deepEqual(mapping.forbiddenRuntimeCapabilityIds,[]);
  assert.equal(a.runtimeProfileReclassificationAllowed,false);
  assert.equal(p.semanticProfileLock.runtimeSemanticCompatibility.exactR04MappingIncludesGlobalUnitConversionCapability,false);
  assert.equal(mapping.requiredRuntimeCapabilityIds.includes("cap_unit_conversion"),false);
});

test("W8 Q014 remains exact R05-W8 cross-domain assignment",()=>{
  const row=getR05DeliveryWaveAssignment(KP);assert.ok(row);
  assert.equal(row.baseDeliveryWaveId,"R05-W8");
  assert.equal(row.deliveryWaveId,"R05-W8");
  assert.equal(row.waveEscalatedByPrerequisite,false);
  assert.equal(row.intraWavePrerequisiteRank,7);
  assert.equal(row.primaryRuntimeProfileId,"profile_geometry_property");
  assert.deepEqual(row.contractOnlyRequiredCapabilityIds,[
    "cap_geometry_property_reasoning",
    "cap_geometry_domain_validator",
    "cap_geometry_diagram_representation",
    "cap_coordinate_map_representation"
  ]);
  assert.deepEqual(row.contractOnlyCapabilityWaveIds,["R05-W5","R05-W6"]);
});

test("W8 Q014 protects prior and future same-source ownership",()=>{
  assert.deepEqual(w7q007.queueAuthority.knowledgePointIds,["kp_g6a_u09_scale_factor_length"]);
  assert.deepEqual(w7q012.queueAuthority.knowledgePointIds,["kp_g6a_u09_scale_area_change"]);
  assert.deepEqual(p.sameSourceOwnershipBoundary.priorImplementedKnowledgePointIds,[
    "kp_g6a_u09_scale_factor_length",
    "kp_g6a_u09_scale_area_change"
  ]);
  assert.deepEqual(p.sameSourceOwnershipBoundary.futureW8KnowledgePointIds,[
    "kp_g6a_u09_scale_drawing_construction",
    "kp_g6a_u09_similar_shape_angle"
  ]);
  assert.equal(p.sameSourceOwnershipBoundary.q014MayConsumeScaleFactorAsPrerequisiteButNotReown,true);
  assert.equal(p.sameSourceOwnershipBoundary.q014MayUseMapLikeRepresentationButNotReownScaleDrawingConstruction,true);
  assert.equal(p.sameSourceOwnershipBoundary.q014MayUseCorrespondingGeometryContextButNotReownSimilarShapeAngle,true);
});

test("W8 Q014 semantic lock stays map distance to actual distance with bounded unit normalization",()=>{
  const c=p.semanticProfileLock.implementationSemanticLock;
  assert.equal(c.mapDistanceRequired,true);
  assert.equal(c.scaleRequired,true);
  assert.equal(c.actualDistanceTargetRequired,true);
  assert.equal(c.mapToActualDirectionRequired,true);
  assert.equal(c.ratioMustRemainFixed,true);
  assert.equal(c.unitNormalizationBeforeRatioEvaluationRequired,true);
  assert.equal(c.unsupportedUnitPairsMustFailClosed,true);
  assert.equal(c.reverseActualToMapDirectionAllowed,false);
  assert.equal(c.scaleDrawingConstructionAllowed,false);
  assert.equal(c.similarShapeAngleTeachingAllowed,false);
  assert.equal(c.scaleAreaChangeTeachingReownershipAllowed,false);
  assert.ok(p.q014ScopeLock.excludedRelations.includes("Q015_OR_LATER_IMPLEMENTATION"));
  assert.equal(p.semanticProfileLock.runtimeSemanticCompatibility.r04MutationRequired,false);
  assert.equal(p.semanticProfileLock.runtimeSemanticCompatibility.manualOperatorChoiceRequired,false);
});

test("W8 Q014 preflight remains planning-only SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(p.q014ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q014ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.deepEqual(impact.currentKnowledgePointIds,[KP]);
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.equal(impact.scopeGuards.r04Mutation,false);
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_NODE_REGRESSION"),false);
  assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
});
