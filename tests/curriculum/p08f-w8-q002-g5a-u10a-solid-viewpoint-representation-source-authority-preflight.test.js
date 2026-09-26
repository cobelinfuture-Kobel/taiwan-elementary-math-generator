import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p08f/q002-g5a-u10a-solid-viewpoint-representation-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-03.json");
const index=read("data/curriculum/full-product/p08e/w8-source-authority-index.json");
const q001=read("data/curriculum/full-product/p08f/q001-g4a-u03-protractor-angle-measurement-final-d0-closeout.json");
const impact=read("data/project/change-impact/P08F_W8_Q002_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P08F_W8_Q002_PREFLIGHT.validation.json");
const KP="kp_g5a_u10a_solid_viewpoint_representation";

test("W8 Q002 preflight binds exact second frozen queue slice after Q001 D0",()=>{
  const result=materializeP08EW8DirectProductVerticalSliceQueue(),slice=result.queueEntries[1];
  assert.equal(q001.status,"Q001_PASS_E6_D0_EXACT_FAILURE_SET_PARITY_CLOSED");
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(result.queueFrozen,true);
  assert.equal(result.queueEntries.length,22);
  assert.equal(slice.queuePosition,2);
  assert.equal(slice.sliceId,"p08e_q002_r1_g5a_u10_5a10a_profile_spatial_solid_c1");
  assert.equal(slice.implementationTaskId,"P08F_W8DirectProductVerticalSlice002Implementation");
  assert.equal(slice.previousSliceId,"p08e_q001_r1_g4a_u03_4a03_profile_geometry_property_c1");
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.primarySourceNodeId,"g5a_u10_5a10a");
  assert.deepEqual(slice.supportingSourceNodeIds,["g5a_u10_5a10a"]);
  assert.equal(slice.intraWavePrerequisiteRank,1);
  assert.equal(slice.primaryRuntimeProfileId,"profile_spatial_solid");
  assert.deepEqual(slice.knowledgePointIds,[KP]);
  assert.deepEqual(slice.blockingCapabilityIds,[
    "cap_coordinate_map_representation",
    "cap_geometry_domain_validator",
    "cap_geometry_property_reasoning",
    "cap_solid_geometry_representation",
    "cap_spatial_solid_reasoning"
  ]);
  assert.deepEqual(slice.blockingCapabilityWaveIds,["R05-W5","R05-W6"]);
  assert.equal(p.queueAuthority.queueDigest,"597a6fa497c8ac7738247847ef321d0c753e79800f5c38097b7a7a160be2f484");
});

test("W8 Q002 binds reviewed G5A-U10a source and viewpoint candidate",()=>{
  const source=r02.sourceRecords.find(x=>x.sourceNodeId==="g5a_u10_5a10a");assert.ok(source);
  const target=source.candidates.find(x=>x.knowledgePointId===KP);assert.ok(target);
  const indexed=index.sources.find(x=>x.sourceNodeId==="g5a_u10_5a10a");assert.ok(indexed);
  assert.equal(source.sourceTitle,"柱體錐體和球");
  assert.equal(source.sourcePdfTitle,"meow911_5a10a_source.pdf");
  assert.deepEqual(source.reviewedPages,[1,2]);
  assert.equal(target.canonicalNameZh,"立體視圖與位置");
  assert.equal(target.capabilityStatement,"學生能由不同視角辨認或表示立體。");
  assert.equal(target.reasoningInvariant,"旋轉改變可見面但不改變立體的構成與相鄰關係。");
  assert.deepEqual(target.evidencePages,[1,2]);
  assert.deepEqual(indexed.primaryW8KnowledgePointIds,[KP]);
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.sourceRefAmbiguity,false);
});

test("W8 Q002 locks exact spatial-solid plus viewpoint coordinate-map runtime mapping",()=>{
  const mapping=getR04KnowledgePointCapabilityMapping(KP);assert.ok(mapping);
  assert.equal(mapping.primaryRuntimeProfileId,"profile_spatial_solid");
  assert.equal(mapping.classificationRuleId,"rule_spatial_solid");
  assert.deepEqual(mapping.appliedModifierIds,["mod_coordinate_map"]);
  assert.deepEqual(mapping.requiredRuntimeCapabilityIds,p.runtimeCapabilityAuthority.exactMappingRequiredRuntimeCapabilityIds);
  assert.deepEqual(mapping.optionalRuntimeCapabilityIds,["cap_geometry_construction"]);
  assert.deepEqual(mapping.forbiddenRuntimeCapabilityIds,[]);
  assert.equal(p.runtimeCapabilityAuthority.runtimeProfileReclassificationAllowed,false);
});

test("W8 Q002 semantic lock owns viewpoint representation only and protects other same-source KPs",()=>{
  const s=p.semanticProfileLock.implementationSemanticLock;
  assert.equal(s.differentViewpointRecognitionOrRepresentationRequired,true);
  assert.equal(s.rotationMayChangeVisibleFaces,true);
  assert.equal(s.solidCompositionMustRemainInvariantUnderRotation,true);
  assert.equal(s.solidAdjacencyMustRemainInvariantUnderRotation,true);
  assert.equal(s.solidShapeClassificationReownershipAllowed,false);
  assert.equal(s.prismPyramidElementsReownershipAllowed,false);
  assert.equal(s.solidNetCorrespondenceReownershipAllowed,false);
  assert.equal(s.solidCrossSectionReownershipAllowed,false);
  assert.ok(p.q002ScopeLock.excludedRelations.includes("Q003_OR_LATER_IMPLEMENTATION"));
});

test("W8 Q002 preflight remains planning-only SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(p.q002ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q002ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_NODE_REGRESSION"),false);
  assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
});
