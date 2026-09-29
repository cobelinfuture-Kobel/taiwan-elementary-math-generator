import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p08f/q013-g5a-u05-polygon-angle-sum-reasoning-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-02.json");
const index=read("data/curriculum/full-product/p08e/w8-source-authority-index.json");
const q012=read("data/curriculum/full-product/p08f/q012-final-learner-visual-d0-closeout.json");
const q044=read("data/curriculum/full-product/p05f/q044-g5a-u05-polygon-definition-classification-implementation.json");
const q051=read("data/curriculum/full-product/p05f/q051-g5a-u05-polygon-diagonal-regular-properties-implementation.json");
const q056=read("data/curriculum/full-product/p05f/q056-g5a-u05-polygon-triangulation-implementation.json");
const impact=read("data/project/change-impact/P08F_W8_Q013_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P08F_W8_Q013_PREFLIGHT.validation.json");
const KP="kp_g5a_u05a_polygon_angle_sum_reasoning";
const SRC="g5a_u05_5a05a";

test("W8 Q013 preflight binds exact thirteenth frozen queue slice after Q012 D0",()=>{
  const result=materializeP08EW8DirectProductVerticalSliceQueue(),slice=result.queueEntries[12];
  assert.equal(q012.status,"Q012_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(q012.operatorAcceptance.d0Granted,true);
  assert.equal(p.predecessorAuthority.q012FinalCloseoutStatus,"Q012_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(p.predecessorAuthority.q012FinalCloseoutMergeSha,"9ef1079a7789f622f194578540c1f31c66a15c01");
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(result.queueFrozen,true);
  assert.equal(result.queueEntries.length,22);
  assert.equal(slice.queuePosition,13);
  assert.equal(slice.sliceId,"p08e_q013_r7_g5a_u05_5a05a_profile_geometry_property_c1");
  assert.equal(slice.implementationTaskId,"P08F_W8DirectProductVerticalSlice013Implementation");
  assert.equal(slice.previousSliceId,"p08e_q012_r6_g5a_u05_5a05a1_profile_geometry_property_c1");
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.primarySourceNodeId,SRC);
  assert.deepEqual(slice.supportingSourceNodeIds,[SRC]);
  assert.equal(slice.intraWavePrerequisiteRank,7);
  assert.equal(slice.primaryRuntimeProfileId,"profile_geometry_property");
  assert.equal(slice.chunkIndex,1);
  assert.equal(slice.knowledgePointCount,1);
  assert.deepEqual(slice.knowledgePointIds,[KP]);
  assert.deepEqual(slice.blockingCapabilityIds,["cap_geometry_diagram_representation","cap_geometry_domain_validator","cap_geometry_property_reasoning"]);
  assert.deepEqual(slice.blockingCapabilityWaveIds,["R05-W5"]);
  assert.equal(slice.targetEvidenceLevel,"E6_D0_COMPLETE");
  assert.deepEqual(p.queueAuthority.knowledgePointIds,[KP]);
  assert.equal(p.queueAuthority.queueDigest,"597a6fa497c8ac7738247847ef321d0c753e79800f5c38097b7a7a160be2f484");
});

test("W8 Q013 binds reviewed G5A-U05 polygon angle-sum candidate and exact source authority",()=>{
  const source=r02.sourceRecords.find(x=>x.sourceNodeId===SRC);assert.ok(source);
  const indexed=index.sources.find(x=>x.sourceNodeId===SRC);assert.ok(indexed);
  const candidate=source.candidates.find(x=>x.knowledgePointId===KP);assert.ok(candidate);
  assert.equal(source.sourceTitle,"多邊形與平面圖形");
  assert.equal(source.sourcePdfTitle,"meow911_5a05a_source.pdf");
  assert.deepEqual(source.reviewedPages,[1,2,3]);
  assert.equal(candidate.canonicalNameZh,"多邊形內角和推理");
  assert.equal(candidate.capabilityStatement,"學生能利用三角形分割求多邊形內角和。");
  assert.equal(candidate.reasoningInvariant,"內角和等於分割三角形數乘180度。");
  assert.deepEqual(candidate.evidencePages,[2]);
  assert.deepEqual(indexed.primaryW8KnowledgePointIds,[KP]);
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.sourceRefAmbiguity,false);
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.adjacentSourceNodeConfusionRejected,"g5a_u05_5a05a1");
});

test("W8 Q013 locks exact geometry-property runtime mapping without modifier",()=>{
  const mapping=getR04KnowledgePointCapabilityMapping(KP);assert.ok(mapping);
  const a=p.runtimeCapabilityAuthority;
  assert.equal(mapping.mappingId,"r04map_g5a_u05a_polygon_angle_sum_reasoning");
  assert.equal(mapping.primaryRuntimeProfileId,"profile_geometry_property");
  assert.equal(mapping.classificationRuleId,"rule_geometry_property");
  assert.deepEqual(mapping.appliedModifierIds,[]);
  assert.deepEqual(mapping.requiredRuntimeCapabilityIds,a.exactMappingRequiredRuntimeCapabilityIds);
  assert.deepEqual(mapping.optionalRuntimeCapabilityIds,["cap_geometry_construction"]);
  assert.deepEqual(mapping.forbiddenRuntimeCapabilityIds,[]);
  assert.equal(a.runtimeProfileReclassificationAllowed,false);
  assert.equal(a.geometryConstructionRequired,false);
});

test("W8 Q013 preserves Q044 Q051 Q056 owners and consumes triangulation only as prerequisite",()=>{
  assert.equal(q044.queueAuthority.knowledgePointId,"kp_g5a_u05a_polygon_definition_classification");
  assert.deepEqual(q051.queueAuthority.knowledgePointIds,["kp_g5a_u05a_polygon_diagonal","kp_g5a_u05a_regular_polygon_properties"]);
  assert.deepEqual(q056.queueAuthority.knowledgePointIds,["kp_g5a_u05a_polygon_triangulation"]);
  assert.deepEqual(p.sameSourceOwnershipBoundary.priorImplementedKnowledgePointIds,[
    "kp_g5a_u05a_polygon_definition_classification",
    "kp_g5a_u05a_polygon_diagonal",
    "kp_g5a_u05a_regular_polygon_properties",
    "kp_g5a_u05a_polygon_triangulation"
  ]);
  assert.equal(p.sameSourceOwnershipBoundary.triangulationMayBeConsumedAsPrerequisiteButNotReowned,true);
  assert.equal(p.sameSourceOwnershipBoundary.q013CompletesReviewedCandidateSetForSource,true);
  const g=p.semanticProfileLock.ownershipGuards;
  assert.equal(g.polygonDefinitionClassificationReownershipAllowed,false);
  assert.equal(g.polygonDiagonalReownershipAllowed,false);
  assert.equal(g.regularPolygonPropertiesReownershipAllowed,false);
  assert.equal(g.polygonTriangulationStandaloneReownershipAllowed,false);
  assert.equal(g.interactiveGeometryConstructionReownershipAllowed,false);
});

test("W8 Q013 semantic lock remains interior-angle-sum reasoning only",()=>{
  const c=p.semanticProfileLock.polygonInteriorAngleSum;
  assert.equal(c.polygonSideCountRequired,true);
  assert.equal(c.priorTriangulationInvariantMayBeConsumed,true);
  assert.equal(c.triangleCountRelation,"n - 2");
  assert.equal(c.triangleInteriorAngleSumDeg,180);
  assert.equal(c.polygonInteriorAngleSumRelation,"(n - 2) × 180°");
  assert.equal(c.triangleCountMustRepresentNonOverlappingInteriorPartition,true);
  assert.equal(c.interiorAngleSumTargetRequired,true);
  assert.equal(c.regularPolygonSingleInteriorAngleNotRequired,true);
  assert.equal(c.exteriorAngleReasoningNotRequired,true);
  assert.equal(c.rulerMeasurementRequired,false);
  assert.equal(c.protractorMeasurementRequired,false);
  assert.equal(c.freehandConstructionRequired,false);
  assert.ok(p.q013ScopeLock.excludedRelations.includes("Q014_OR_LATER_IMPLEMENTATION"));
  assert.ok(p.q013ScopeLock.excludedRelations.includes("SECTOR_OR_CENTRAL_ANGLE_SEMANTICS"));
});

test("W8 Q013 preflight remains planning-only SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(p.q013ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q013ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.deepEqual(impact.currentKnowledgePointIds,[KP]);
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_NODE_REGRESSION"),false);
  assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
});
