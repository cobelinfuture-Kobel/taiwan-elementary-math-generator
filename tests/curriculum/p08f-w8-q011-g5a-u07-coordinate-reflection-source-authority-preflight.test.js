import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p08f/q011-g5a-u07-coordinate-reflection-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-03.json");
const index=read("data/curriculum/full-product/p08e/w8-source-authority-index.json");
const q010=read("data/curriculum/full-product/p08f/q010-final-learner-visual-d0-closeout.json");
const impact=read("data/project/change-impact/P08F_W8_Q011_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P08F_W8_Q011_PREFLIGHT.validation.json");
const KP="kp_g5a_u07_coordinate_reflection";
const SRC="g5a_u07_5a07";

test("W8 Q011 preflight binds exact eleventh frozen queue slice after Q010 D0",()=>{
 const result=materializeP08EW8DirectProductVerticalSliceQueue(),slice=result.queueEntries[10];
 assert.equal(q010.status,"Q010_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");assert.equal(q010.operatorAcceptance.d0Granted,true);
 assert.equal(p.predecessorAuthority.q010FinalCloseoutStatus,"Q010_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");assert.equal(p.predecessorAuthority.q010FinalCloseoutMergeSha,"48d37339568ab9428bfaecbf50c73c299158443c");
 assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");assert.equal(result.queueFrozen,true);assert.equal(result.queueEntries.length,22);
 assert.equal(slice.queuePosition,11);assert.equal(slice.sliceId,"p08e_q011_r5_g5a_u07_5a07_profile_geometry_property_c1");assert.equal(slice.implementationTaskId,"P08F_W8DirectProductVerticalSlice011Implementation");
 assert.equal(slice.previousSliceId,"p08e_q010_r5_g5a_u05_5a05a1_profile_geometry_property_c1");assert.equal(slice.previousSliceMustBeD0Complete,true);
 assert.equal(slice.primarySourceNodeId,SRC);assert.deepEqual(slice.supportingSourceNodeIds,[SRC]);assert.equal(slice.intraWavePrerequisiteRank,5);assert.equal(slice.primaryRuntimeProfileId,"profile_geometry_property");assert.equal(slice.chunkIndex,1);
 assert.deepEqual(slice.knowledgePointIds,[KP]);
 assert.deepEqual(slice.blockingCapabilityIds,["cap_coordinate_map_representation","cap_geometry_diagram_representation","cap_geometry_domain_validator","cap_geometry_property_reasoning"]);
 assert.deepEqual(slice.blockingCapabilityWaveIds,["R05-W5","R05-W6"]);
 assert.deepEqual(p.queueAuthority.knowledgePointIds,[KP]);assert.equal(p.queueAuthority.queueDigest,"597a6fa497c8ac7738247847ef321d0c753e79800f5c38097b7a7a160be2f484");
});

test("W8 Q011 binds reviewed G5A-U07 coordinate-reflection candidate and exact source authority",()=>{
 const source=r02.sourceRecords.find(x=>x.sourceNodeId===SRC);assert.ok(source);const indexed=index.sources.find(x=>x.sourceNodeId===SRC);assert.ok(indexed);
 const candidate=source.candidates.find(x=>x.knowledgePointId===KP);assert.ok(candidate);
 assert.equal(source.sourceTitle,"線對稱圖形");assert.equal(source.sourcePdfTitle,"meow911_5a07_source.pdf");assert.deepEqual(source.reviewedPages,[1]);
 assert.equal(candidate.canonicalNameZh,"方格座標鏡射");assert.equal(candidate.capabilityStatement,"學生能在方格或座標上進行線對稱映射。");assert.equal(candidate.reasoningInvariant,"鏡射保持長度與角度，只改變相對方向。");assert.deepEqual(candidate.evidencePages,[1]);
 assert.deepEqual(indexed.primaryW8KnowledgePointIds,[KP]);assert.equal(p.r02ReviewedCandidateAuthority.knowledgePointId,KP);assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.sourceRefAmbiguity,false);
});

test("W8 Q011 locks geometry-property plus coordinate-map modifier without reclassification",()=>{
 const mapping=getR04KnowledgePointCapabilityMapping(KP);assert.ok(mapping);const a=p.runtimeCapabilityAuthority;
 assert.equal(mapping.primaryRuntimeProfileId,"profile_geometry_property");assert.equal(mapping.classificationRuleId,"rule_geometry_property");assert.deepEqual(mapping.appliedModifierIds,["mod_coordinate_map"]);
 assert.deepEqual(mapping.requiredRuntimeCapabilityIds,a.exactMappingRequiredRuntimeCapabilityIds);
 assert.deepEqual(mapping.optionalRuntimeCapabilityIds,["cap_geometry_construction"]);assert.deepEqual(mapping.forbiddenRuntimeCapabilityIds,[]);
 assert.equal(a.runtimeProfileReclassificationAllowed,false);
});

test("W8 Q011 semantic lock isolates coordinate reflection from prior line-symmetry owners",()=>{
 const c=p.semanticProfileLock.coordinateReflection,g=p.semanticProfileLock.ownershipGuards;
 for(const key of ["reflectionAxisRequired","sourceAndImagePointsRequired","correspondingPointsLieOnOppositeSidesWhenNotOnAxis","perpendicularDistanceToAxisPreserved","segmentLengthsPreserved","angleMeasuresPreserved","orientationMayReverse","pointsOnAxisRemainFixed","coordinateOrGridRepresentationRequired"])assert.equal(c[key],true,key);
 assert.equal(g.lineSymmetryRecognitionReownershipAllowed,false);assert.equal(g.symmetryAxisCountReownershipAllowed,false);assert.equal(g.symmetricPointDistanceStandaloneReownershipAllowed,false);assert.equal(g.completeSymmetricFigureReownershipAllowed,false);assert.equal(g.geometryConstructionReownershipAllowed,false);assert.equal(g.freehandDrawingRequired,false);
 assert.deepEqual(p.sameSourceOwnershipBoundary.priorImplementedKnowledgePointIds,["kp_g5a_u07_line_symmetry_recognition","kp_g5a_u07_symmetry_axis_count","kp_g5a_u07_symmetric_point_distance","kp_g5a_u07_complete_symmetric_figure"]);
 assert.equal(p.sameSourceOwnershipBoundary.q011CompletesW8CandidateSetForSource,true);
 assert.ok(p.q011ScopeLock.excludedRelations.includes("Q012_OR_LATER_IMPLEMENTATION"));
});

test("W8 Q011 preflight remains planning-only SHARED_RUNTIME_BOUNDED",()=>{
 assert.equal(p.q011ScopeLock.implementationAllowedByThisPreflight,false);assert.equal(p.q011ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
 assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.deepEqual(impact.currentKnowledgePointIds,[KP]);assert.equal(impact.scopeGuards.productImplementation,false);
 assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
 assert.equal(JSON.stringify(validation).includes("FULL_NODE_REGRESSION"),false);assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
});
