import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p08f/q007-g4a-u03-unknown-angle-linear-full-vertical-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-01.json");
const index=read("data/curriculum/full-product/p08e/w8-source-authority-index.json");
const q006=read("data/curriculum/full-product/p08f/q006-final-learner-visual-d0-closeout.json");
const impact=read("data/project/change-impact/P08F_W8_Q007_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P08F_W8_Q007_PREFLIGHT.validation.json");
const KP="kp_unknown_angle_linear_full_vertical";

test("W8 Q007 preflight binds exact seventh frozen queue slice after Q006 D0",()=>{
  const result=materializeP08EW8DirectProductVerticalSliceQueue(),slice=result.queueEntries[6];
  assert.equal(q006.status,"Q006_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(q006.operatorAcceptance.d0Granted,true);
  assert.equal(p.predecessorAuthority.q006FinalCloseoutStatus,"Q006_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(p.predecessorAuthority.q006FinalCloseoutMergeSha,"a7dbbfa865bf34111e2ddc0c38238e6b3b35c58a");
  assert.equal(p.predecessorAuthority.q006ActualPrintHumanAccepted,true);
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(result.queueFrozen,true);
  assert.equal(result.queueEntries.length,22);
  assert.equal(slice.queuePosition,7);
  assert.equal(slice.sliceId,"p08e_q007_r4_g4a_u03_4a03_profile_geometry_property_c1");
  assert.equal(slice.implementationTaskId,"P08F_W8DirectProductVerticalSlice007Implementation");
  assert.equal(slice.previousSliceId,"p08e_q006_r3_g5a_u05_5a05a1_profile_geometry_property_c1");
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.primarySourceNodeId,"g4a_u03_4a03");
  assert.deepEqual(slice.supportingSourceNodeIds,["g4a_u03_4a03"]);
  assert.equal(slice.intraWavePrerequisiteRank,4);
  assert.equal(slice.primaryRuntimeProfileId,"profile_geometry_property");
  assert.equal(slice.chunkIndex,1);
  assert.deepEqual(slice.knowledgePointIds,[KP]);
  assert.deepEqual(slice.blockingCapabilityIds,["cap_geometry_diagram_representation","cap_geometry_domain_validator","cap_geometry_property_reasoning"]);
  assert.deepEqual(slice.blockingCapabilityWaveIds,["R05-W5"]);
  assert.deepEqual(p.queueAuthority.knowledgePointIds,[KP]);
  assert.equal(p.queueAuthority.queueDigest,"597a6fa497c8ac7738247847ef321d0c753e79800f5c38097b7a7a160be2f484");
});

test("W8 Q007 binds reviewed G4A-U03 unknown-angle candidate and exact source authority",()=>{
  const source=r02.sourceRecords.find(x=>x.sourceNodeId==="g4a_u03_4a03");assert.ok(source);
  const indexed=index.sources.find(x=>x.sourceNodeId==="g4a_u03_4a03");assert.ok(indexed);
  const candidate=source.candidates.find(x=>x.knowledgePointId===KP);assert.ok(candidate);
  assert.equal(source.sourceTitle,"角度");
  assert.equal(source.sourcePdfTitle,"meow911_4a03_source.pdf");
  assert.deepEqual(source.reviewedPages,[1,2]);
  assert.equal(candidate.canonicalNameZh,"平角周角對頂角未知角");
  assert.equal(candidate.capabilityStatement,"學生能利用平角、周角與對頂角性質求未知角。");
  assert.equal(candidate.reasoningInvariant,"一直線上的相鄰角和為180度，一周為360度，對頂角相等。");
  assert.deepEqual(candidate.evidencePages,[1,2]);
  assert.ok(indexed.primaryW8KnowledgePointIds.includes(KP));
  assert.equal(p.r02ReviewedCandidateAuthority.knowledgePointId,KP);
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.sourceRefAmbiguity,false);
});

test("W8 Q007 locks exact geometry-property runtime mapping without modifier",()=>{
  const mapping=getR04KnowledgePointCapabilityMapping(KP);assert.ok(mapping);
  const a=p.runtimeCapabilityAuthority;
  assert.equal(mapping.primaryRuntimeProfileId,"profile_geometry_property");
  assert.equal(mapping.classificationRuleId,"rule_geometry_property");
  assert.deepEqual(mapping.appliedModifierIds,[]);
  assert.deepEqual(mapping.requiredRuntimeCapabilityIds,a.exactMappingRequiredRuntimeCapabilityIds);
  assert.deepEqual(mapping.optionalRuntimeCapabilityIds,["cap_geometry_construction"]);
  assert.deepEqual(mapping.forbiddenRuntimeCapabilityIds,[]);
  assert.equal(a.runtimeProfileReclassificationAllowed,false);
});

test("W8 Q007 semantic lock isolates linear/full/vertical unknown-angle relations from prior owners",()=>{
  const c=p.semanticProfileLock.unknownAngleLinearFullVertical,g=p.semanticProfileLock.ownershipGuards;
  assert.equal(c.linearAdjacentAngleSumDegrees,180);
  assert.equal(c.fullTurnAngleSumDegrees,360);
  assert.equal(c.verticalAnglesEqual,true);
  assert.equal(c.unknownAngleMustBeDerivedFromExplicitGeometricRelation,true);
  assert.equal(c.exactIntegerDegreeAnswerRequired,true);
  assert.equal(g.protractorMeasurementReownershipAllowed,false);
  assert.equal(g.angleCompositionDecompositionReownershipAllowed,false);
  assert.equal(g.rotationClockAngleReownershipAllowed,false);
  assert.equal(g.estimationClassificationReownershipAllowed,false);
  assert.deepEqual(p.sameSourceOwnershipBoundary.priorImplementedKnowledgePointIds,[
    "kp_protractor_angle_measurement",
    "kp_angle_composition_decomposition",
    "kp_rotation_angle_clock",
    "kp_angle_estimation_and_classification"
  ]);
  assert.deepEqual(p.sameSourceOwnershipBoundary.futureW8KnowledgePointIds,[]);
  assert.ok(p.q007ScopeLock.excludedRelations.includes("Q008_OR_LATER_IMPLEMENTATION"));
});

test("W8 Q007 preflight remains planning-only SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(p.q007ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q007ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.deepEqual(impact.currentKnowledgePointIds,[KP]);
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_NODE_REGRESSION"),false);
  assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
});
