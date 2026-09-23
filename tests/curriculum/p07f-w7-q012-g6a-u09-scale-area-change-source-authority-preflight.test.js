import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {getR03DirectPrerequisites} from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const pre=read("data/curriculum/full-product/p07f/q012-g6a-u09-scale-area-change-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-07.json");
const KP="kp_g6a_u09_scale_area_change";
const stripR03=e=>({edgeId:e.edgeId,fromKnowledgePointId:e.fromKnowledgePointId,toKnowledgePointId:e.toKnowledgePointId,dependencyStrength:e.dependencyStrength,dependencyRole:e.dependencyRole,alternativeGroupId:e.alternativeGroupId,distanceBearing:e.distanceBearing,rationale:e.rationale,evidenceRefs:e.evidenceRefs});

test("Q012 preflight binds frozen row, Q011 D0 and exact source identity",()=>{
  assert.equal(pre.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(pre.queueAuthority.queuePosition,12);
  assert.equal(pre.queueAuthority.sliceId,"p07e_q012_r9_g6a_u09_6a09_profile_geometry_formula_c1");
  assert.deepEqual(pre.queueAuthority.knowledgePointIds,[KP]);
  assert.equal(pre.predecessorD0Evidence.q011Status,"PASS_E6_D0_COMPLETE");
  assert.equal(pre.sourceAuthority.sourcePdfDriveFileId,"1qnZyEDcmOgb94BYU350cmjvUN4kESlEZ");
  assert.equal(pre.sourceAuthority.sourcePdfSizeBytes,244370);
  assert.equal(pre.sourceAuthority.sourcePdfSha256,"80ec4d8df9a4d5bf98392cf846fac7df68c49781ba60eefa78e70e9109cbbe2c");
});

test("Q012 current full-page visual readback directly supports scale-area change",()=>{
  const v=pre.sourceAuthority.currentVisualReadbackAuthority;
  assert.equal(v.reviewMethod,"CURRENT_FULL_PAGE_VISUAL_READBACK_200_DPI");
  assert.equal(v.ocrUsedAsAuthority,false);
  assert.equal(v.q012DirectVisualEvidence.directScaleAreaChangeQuestionVisible,true);
  assert.deepEqual(v.q012DirectVisualEvidence.visibleActualDimensionsMeters,{length:18,width:9});
  assert.equal(v.q012DirectVisualEvidence.visibleScale,"1:300");
  assert.equal(v.q012DirectVisualEvidence.directLengthScaleToAreaScaleReasoningRequired,true);
  assert.equal(v.q012DirectVisualEvidence.directAreaComputationFromScaledLengthsRequired,true);
  assert.equal(pre.sourceAuthority.evidenceResolution.currentVisualSupportLevel,"DIRECT_LITERAL_SCALE_AREA_CHANGE_APPLICATION");
});

test("Q012 binds exact R02 candidate and protects Q007 plus source-only siblings",()=>{
  const src=r02.sourceRecords.find(x=>x.sourceNodeId==="g6a_u09_6a09");assert.ok(src);
  const target=src.candidates.find(x=>x.knowledgePointId===KP);assert.ok(target);
  assert.deepEqual(pre.r02ReviewedCandidateAuthority.targetCandidate,{
    knowledgePointId:target.knowledgePointId,canonicalNameZh:target.canonicalNameZh,capabilityStatement:target.capabilityStatement,
    reasoningInvariant:target.reasoningInvariant,category:target.category,evidencePages:target.evidencePages,applicationSuitability:target.applicationSuitability
  });
  assert.equal(pre.r02ReviewedCandidateAuthority.predecessorOwnedKnowledgePointRows[0].knowledgePointId,"kp_g6a_u09_scale_factor_length");
  assert.deepEqual(pre.r02ReviewedCandidateAuthority.sourceOnlyNotAdmittedByQ012KnowledgePointIds,[
    "kp_g6a_u09_similar_shape_angle","kp_g6a_u09_scale_drawing_construction","kp_g6a_u09_map_scale_distance"
  ]);
});

test("Q012 exact R03 prerequisites are rectangle area formula plus scale-factor length",()=>{
  const actual=getR03DirectPrerequisites(KP).map(stripR03).sort((a,b)=>a.edgeId.localeCompare(b.edgeId));
  const expected=[...pre.prerequisiteGraphAuthority.exactIncomingRequiredDistanceBearingEdges].sort((a,b)=>a.edgeId.localeCompare(b.edgeId));
  assert.deepEqual(actual,expected);
  assert.deepEqual(pre.prerequisiteGraphAuthority.requiredPrerequisiteKnowledgePointIds,[
    "kp_g4b_u07_rectangle_square_area_formula","kp_g6a_u09_scale_factor_length"
  ]);
  assert.equal(pre.prerequisiteGraphAuthority.rectangleSquareAreaFormulaPrerequisiteRequired,true);
  assert.equal(pre.prerequisiteGraphAuthority.scaleFactorLengthPrerequisiteRequired,true);
});

test("Q012 exact R04 mapping is frozen geometry-formula with no modifiers",()=>{
  const r04=getR04KnowledgePointCapabilityMapping(KP),expected=pre.runtimeCapabilityAuthority.executableR04Mapping;assert.ok(r04);
  assert.equal(r04.primaryRuntimeProfileId,expected.primaryRuntimeProfileId);
  assert.equal(r04.classificationRuleId,expected.classificationRuleId);
  assert.deepEqual([...r04.appliedModifierIds],expected.appliedModifierIds);
  assert.deepEqual([...r04.requiredRuntimeCapabilityIds],expected.requiredRuntimeCapabilityIds);
  assert.deepEqual([...r04.optionalRuntimeCapabilityIds],expected.optionalRuntimeCapabilityIds);
  assert.deepEqual([...r04.forbiddenRuntimeCapabilityIds],expected.forbiddenRuntimeCapabilityIds);
  assert.equal(pre.runtimeCapabilityAuthority.exactR04MappingVerified,true);
});

test("Q012 exact R05 assignment is W5 base escalated to W7 rank 9",()=>{
  const r05=getR05DeliveryWaveAssignment(KP),e=pre.r05AssignmentAuthority.exactR05Assignment;assert.ok(r05);
  for(const k of ["baseDeliveryWaveId","deliveryWaveId","waveEscalatedByPrerequisite","prerequisiteWaveLowerBound","intraWavePrerequisiteRank"])assert.equal(r05[k],e[k]);
  assert.equal(pre.r05AssignmentAuthority.exactR05AssignmentVerified,true);
});

test("Q012 semantic ownership locks k squared area scaling without reowning prerequisites or siblings",()=>{
  const s=pre.semanticProfileLock;
  assert.equal(s.present,true);
  assert.equal(s.targetSemanticCore,"LENGTH_SCALE_FACTOR_K_IMPLIES_AREA_SCALE_FACTOR_K_SQUARED");
  assert.equal(s.implementationSemanticLock.correspondingLinearScaleFactorRequired,true);
  assert.equal(s.implementationSemanticLock.areaScaleFactorEqualsSquareOfLinearScaleFactorRequired,true);
  assert.equal(s.implementationSemanticLock.q007LengthScaleFactorPrerequisiteTeachingReownershipAllowed,false);
  assert.equal(s.implementationSemanticLock.genericGeometryAreaFormulaReownershipAllowed,false);
  assert.equal(s.implementationSemanticLock.mapScaleDistanceAllowed,false);
  assert.equal(s.implementationSemanticLock.sameUnitMixedModeAllowed,false);
  assert.equal(s.implementationSemanticLock.crossUnitMixedModeAllowed,false);
});

test("Q012 preflight is planning-only and ready only for separate implementation approval",()=>{
  assert.equal(pre.q012ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(pre.q012ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(pre.preflightDecision.executableRuntimeReadbackRequiredBeforeMerge,false);
  assert.equal(pre.preflightDecision.exactRuntimeMappingBound,true);
  assert.equal(pre.preflightDecision.exactR05AssignmentBound,true);
  assert.equal(pre.preflightDecision.exactPrerequisiteGraphBound,true);
  assert.equal(pre.preflightDecision.separateImplementationApprovalRequired,true);
  assert.equal(pre.preflightDecision.nextTask,"P07F_W7DirectProductVerticalSlice012Implementation");
});
