import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p08f/q008-g4a-u05-triangle-angle-classification-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-02.json");
const index=read("data/curriculum/full-product/p08e/w8-source-authority-index.json");
const q007=read("data/curriculum/full-product/p08f/q007-final-learner-visual-d0-closeout.json");
const impact=read("data/project/change-impact/P08F_W8_Q008_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P08F_W8_Q008_PREFLIGHT.validation.json");
const KP="kp_g4a_u05_triangle_angle_classification";

test("W8 Q008 preflight binds exact eighth frozen queue slice after Q007 D0",()=>{
  const result=materializeP08EW8DirectProductVerticalSliceQueue(),slice=result.queueEntries[7];
  assert.equal(q007.status,"Q007_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(q007.operatorAcceptance.d0Granted,true);
  assert.equal(p.predecessorAuthority.q007FinalCloseoutStatus,"Q007_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(p.predecessorAuthority.q007FinalCloseoutMergeSha,"18ed9a678b7c95e64692fa4af4012865be0911ab");
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(result.queueFrozen,true);
  assert.equal(result.queueEntries.length,22);
  assert.equal(slice.queuePosition,8);
  assert.equal(slice.sliceId,"p08e_q008_r4_g4a_u05_4a05_profile_geometry_property_c1");
  assert.equal(slice.implementationTaskId,"P08F_W8DirectProductVerticalSlice008Implementation");
  assert.equal(slice.previousSliceId,"p08e_q007_r4_g4a_u03_4a03_profile_geometry_property_c1");
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.primarySourceNodeId,"g4a_u05_4a05");
  assert.deepEqual(slice.supportingSourceNodeIds,["g4a_u05_4a05"]);
  assert.equal(slice.intraWavePrerequisiteRank,4);
  assert.equal(slice.primaryRuntimeProfileId,"profile_geometry_property");
  assert.equal(slice.chunkIndex,1);
  assert.deepEqual(slice.knowledgePointIds,[KP]);
  assert.deepEqual(slice.blockingCapabilityIds,["cap_geometry_diagram_representation","cap_geometry_domain_validator","cap_geometry_property_reasoning"]);
  assert.deepEqual(slice.blockingCapabilityWaveIds,["R05-W5"]);
  assert.deepEqual(p.queueAuthority.knowledgePointIds,[KP]);
  assert.equal(p.queueAuthority.queueDigest,"597a6fa497c8ac7738247847ef321d0c753e79800f5c38097b7a7a160be2f484");
});

test("W8 Q008 binds reviewed G4A-U05 triangle-angle candidate and exact source authority",()=>{
  const source=r02.sourceRecords.find(x=>x.sourceNodeId==="g4a_u05_4a05");assert.ok(source);
  const indexed=index.sources.find(x=>x.sourceNodeId==="g4a_u05_4a05");assert.ok(indexed);
  const candidate=source.candidates.find(x=>x.knowledgePointId===KP);assert.ok(candidate);
  assert.equal(source.sourceTitle,"三角形與全等");
  assert.equal(source.sourcePdfTitle,"meow911_4a05_source.pdf");
  assert.deepEqual(source.reviewedPages,[1,2]);
  assert.equal(candidate.canonicalNameZh,"依角度分類三角形");
  assert.equal(candidate.capabilityStatement,"學生能依最大內角分類銳角、直角與鈍角三角形。");
  assert.equal(candidate.reasoningInvariant,"三角形只能依其角度結構歸入一種角類別。");
  assert.deepEqual(candidate.evidencePages,[1,2]);
  assert.ok(indexed.primaryW8KnowledgePointIds.includes(KP));
  assert.equal(p.r02ReviewedCandidateAuthority.knowledgePointId,KP);
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.sourceRefAmbiguity,false);
});

test("W8 Q008 locks exact geometry-property runtime mapping without modifier",()=>{
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

test("W8 Q008 semantic lock isolates angle classification from prior and future G4A-U05 owners",()=>{
  const c=p.semanticProfileLock.triangleAngleClassification,g=p.semanticProfileLock.ownershipGuards;
  assert.deepEqual(c.categorySet,["ACUTE_TRIANGLE","RIGHT_TRIANGLE","OBTUSE_TRIANGLE"]);
  assert.equal(c.classificationBasis,"MAXIMUM_INTERIOR_ANGLE");
  assert.equal(c.exactlyOneCategoryRequired,true);
  assert.equal(c.rotationOrTranslationPreservesCategory,true);
  assert.equal(g.triangleElementsNamingReownershipAllowed,false);
  assert.equal(g.triangleSideClassificationReownershipAllowed,false);
  assert.equal(g.triangleInequalityReownershipAllowed,false);
  assert.equal(g.congruentTriangleCorrespondenceReownershipAllowed,false);
  assert.deepEqual(p.sameSourceOwnershipBoundary.priorImplementedKnowledgePointIds,["kp_g4a_u05_triangle_elements_naming","kp_g4a_u05_triangle_side_classification","kp_g4a_u05_triangle_inequality"]);
  assert.deepEqual(p.sameSourceOwnershipBoundary.futureW8KnowledgePointIds,["kp_g4a_u05_congruent_triangle_correspondence"]);
  assert.ok(p.q008ScopeLock.excludedRelations.includes("Q009_OR_LATER_IMPLEMENTATION"));
});

test("W8 Q008 preflight remains planning-only SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(p.q008ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q008ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.deepEqual(impact.currentKnowledgePointIds,[KP]);
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_NODE_REGRESSION"),false);
  assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
});
