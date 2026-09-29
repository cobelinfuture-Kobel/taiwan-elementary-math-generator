import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p08f/q015-g6a-u06-sector-arc-length-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-07.json");
const index=read("data/curriculum/full-product/p08e/w8-source-authority-index.json");
const q014=read("data/curriculum/full-product/p08f/q014-final-learner-visual-d0-closeout.json");
const w7q004=read("data/curriculum/full-product/p07f/q004-g6a-u06-pi-circumference-relation-implementation.json");
const w7q006=read("data/curriculum/full-product/p07f/q006-g6a-u06-circle-circumference-formula-implementation.json");
const w7q010=read("data/curriculum/full-product/p07f/q010-g6a-u06-semicircle-perimeter-implementation.json");
const w8q010=read("data/curriculum/full-product/p08f/q010-g5a-u05a1-sector-fraction-of-circle-implementation.json");
const impact=read("data/project/change-impact/P08F_W8_Q015_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P08F_W8_Q015_PREFLIGHT.validation.json");
const KP="kp_g6a_u06_sector_arc_length",SRC="g6a_u06_6a06";

test("W8 Q015 preflight binds exact fifteenth frozen queue slice after Q014 D0",()=>{
  const result=materializeP08EW8DirectProductVerticalSliceQueue(),slice=result.queueEntries[14];
  assert.equal(q014.status,"Q014_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(q014.operatorAcceptance.d0Granted,true);
  assert.equal(p.predecessorAuthority.q014FinalCloseoutStatus,"Q014_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(p.predecessorAuthority.q014FinalCloseoutMergeSha,"2a5a65cb2c09c50d2f8333ada59ef19a05f0bec5");
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(result.queueFrozen,true);assert.equal(result.queueEntries.length,22);
  assert.equal(slice.queuePosition,15);assert.equal(slice.sliceId,"p08e_q015_r9_g6a_u06_6a06_profile_geometry_formula_c1");
  assert.equal(slice.implementationTaskId,"P08F_W8DirectProductVerticalSlice015Implementation");
  assert.equal(slice.previousSliceId,"p08e_q014_r7_g6a_u09_6a09_profile_geometry_property_c1");
  assert.equal(slice.previousSliceMustBeD0Complete,true);assert.equal(slice.assignedDeliveryWaveId,"R05-W8");
  assert.equal(slice.primarySourceNodeId,SRC);assert.deepEqual(slice.supportingSourceNodeIds,[SRC]);
  assert.equal(slice.intraWavePrerequisiteRank,9);assert.equal(slice.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.equal(slice.chunkIndex,1);assert.equal(slice.knowledgePointCount,1);assert.deepEqual(slice.knowledgePointIds,[KP]);
  assert.deepEqual(slice.blockingCapabilityIds,["cap_geometry_diagram_representation","cap_geometry_domain_validator","cap_geometry_formula_evaluation","cap_geometry_property_reasoning"]);
  assert.deepEqual(slice.blockingCapabilityWaveIds,["R05-W5"]);assert.equal(slice.targetEvidenceLevel,"E6_D0_COMPLETE");
  assert.equal(p.queueAuthority.queueDigest,"597a6fa497c8ac7738247847ef321d0c753e79800f5c38097b7a7a160be2f484");
});

test("W8 Q015 binds reviewed G6A-U06 sector-arc candidate and immutable source authority",()=>{
  const source=r02.sourceRecords.find(x=>x.sourceNodeId===SRC);assert.ok(source);
  const indexed=index.sources.find(x=>x.sourceNodeId===SRC);assert.ok(indexed);
  const candidate=source.candidates.find(x=>x.knowledgePointId===KP);assert.ok(candidate);
  assert.equal(source.sourceTitle,"圓周長與扇形周長");assert.equal(source.sourcePdfTitle,"meow911_6a06_source.pdf");
  assert.deepEqual(source.reviewedPages,[1,2]);assert.equal(candidate.canonicalNameZh,"扇形弧長");
  assert.equal(candidate.capabilityStatement,"學生能依圓心角占全圓比例求弧長。");
  assert.equal(candidate.reasoningInvariant,"弧長等於圓周長乘圓心角除以360度。");
  assert.deepEqual(candidate.evidencePages,[1,2]);assert.ok(indexed.primaryW8KnowledgePointIds.includes(KP));
  assert.equal(p.sourceAuthority.sourcePdfDriveFileId,"1kUsHZcQ9pyLNyBc6bduLb7UOnQPUFmOk");
  assert.equal(p.sourceAuthority.sourcePdfSha256,"e21d00e73df47d6ce7ae2d8d1dd2e8cbed04380a45ece38bc4d4df7fe08ebcf4");
  assert.equal(p.sourceAuthority.currentVisualReadbackAuthority.sectorPerimeterContextVisiblyPresent,true);
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.manualSourceChoiceRequired,false);
});

test("W8 Q015 locks exact geometry-formula plus division runtime mapping",()=>{
  const mapping=getR04KnowledgePointCapabilityMapping(KP);assert.ok(mapping);
  const a=p.runtimeCapabilityAuthority;
  assert.equal(mapping.mappingId,"r04map_g6a_u06_sector_arc_length");
  assert.equal(mapping.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.equal(mapping.classificationRuleId,"rule_geometry_formula");
  assert.deepEqual(mapping.appliedModifierIds,["mod_integer_division"]);
  assert.deepEqual(mapping.requiredRuntimeCapabilityIds,a.exactMappingRequiredRuntimeCapabilityIds);
  assert.deepEqual(mapping.optionalRuntimeCapabilityIds,[]);
  assert.deepEqual(mapping.forbiddenRuntimeCapabilityIds,[]);
  assert.equal(mapping.requiredRuntimeCapabilityIds.includes("cap_integer_division"),true);
  assert.equal(a.runtimeProfileReclassificationAllowed,false);
});

test("W8 Q015 remains prerequisite-escalated R05-W8 assignment",()=>{
  const row=getR05DeliveryWaveAssignment(KP);assert.ok(row);
  assert.equal(row.baseDeliveryWaveId,"R05-W5");
  assert.equal(row.deliveryWaveId,"R05-W8");
  assert.equal(row.waveEscalatedByPrerequisite,true);
  assert.equal(row.intraWavePrerequisiteRank,9);
  assert.equal(row.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.deepEqual(row.contractOnlyRequiredCapabilityIds,["cap_geometry_formula_evaluation","cap_geometry_property_reasoning","cap_geometry_domain_validator","cap_geometry_diagram_representation"]);
  assert.deepEqual(row.contractOnlyCapabilityWaveIds,["R05-W5"]);
});

test("W8 Q015 protects prior circumference and sector-fraction ownership plus future composite arc perimeter",()=>{
  assert.deepEqual(w7q004.queueAuthority.knowledgePointIds,["kp_g6a_u06_pi_circumference_relation"]);
  assert.deepEqual(w7q006.queueAuthority.knowledgePointIds,["kp_g6a_u06_circle_circumference_formula"]);
  assert.deepEqual(w7q010.queueAuthority.knowledgePointIds,["kp_g6a_u06_semicircle_perimeter"]);
  assert.deepEqual(w8q010.queueAuthority.knowledgePointIds,["kp_g5a_u05a1_sector_fraction_of_circle"]);
  assert.deepEqual(p.ownershipBoundary.priorSameSourceImplementedKnowledgePointIds,[
    "kp_g6a_u06_pi_circumference_relation","kp_g6a_u06_circle_circumference_formula","kp_g6a_u06_semicircle_perimeter"
  ]);
  assert.deepEqual(p.ownershipBoundary.futureSameSourceW8KnowledgePointIds,["kp_g6a_u06_composite_arc_perimeter"]);
  assert.equal(p.ownershipBoundary.priorOwnersMayBeConsumedAsPrerequisiteButNotReowned,true);
  assert.equal(p.ownershipBoundary.futureCompositeArcPerimeterMustRemainUnimplemented,true);
});

test("W8 Q015 semantic lock stays sector arc length only",()=>{
  const c=p.semanticProfileLock.implementationSemanticLock;
  assert.equal(c.sectorArcTargetRequired,true);assert.equal(c.fullCircleInvariantDegrees,360);
  assert.equal(c.centralAngleRequired,true);assert.equal(c.circumferenceRoleRequired,true);
  assert.equal(c.arcLengthFormulaRequired,"ARC_LENGTH = CIRCUMFERENCE * CENTRAL_ANGLE / 360");
  assert.equal(c.centralAngleFractionOfCircleRequired,true);
  assert.equal(c.q006CircleCircumferenceFormulaTeachingReownershipAllowed,false);
  assert.equal(c.w8SectorFractionOfCircleTeachingReownershipAllowed,false);
  assert.equal(c.compositeArcPerimeterAllowed,false);assert.equal(c.sectorPerimeterArcPlusTwoRadiiAllowed,false);
  assert.equal(c.sectorAreaAllowed,false);assert.equal(c.applicationContextAllowed,false);
  assert.ok(p.q015ScopeLock.excludedRelations.includes("Q016_OR_LATER_IMPLEMENTATION"));
});

test("W8 Q015 preflight remains planning-only SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(p.q015ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q015ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.deepEqual(impact.currentKnowledgePointIds,[KP]);
  assert.equal(impact.scopeGuards.productImplementation,false);assert.equal(impact.scopeGuards.r04Mutation,false);
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_NODE_REGRESSION"),false);
  assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
});
