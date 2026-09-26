import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p08f/q001-g4a-u03-protractor-angle-measurement-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-01.json");
const impact=read("data/project/change-impact/P08F_W8_Q001_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P08F_W8_Q001_PREFLIGHT.validation.json");
const KP="kp_protractor_angle_measurement";

test("W8 Q001 preflight binds the exact first frozen queue slice",()=>{
  const result=materializeP08EW8DirectProductVerticalSliceQueue(),slice=result.queueEntries[0];
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(result.queueFrozen,true);
  assert.equal(result.queueEntries.length,22);
  assert.equal(slice.queuePosition,1);
  assert.equal(slice.sliceId,"p08e_q001_r1_g4a_u03_4a03_profile_geometry_property_c1");
  assert.equal(slice.implementationTaskId,"P08F_W8DirectProductVerticalSlice001Implementation");
  assert.equal(slice.previousSliceId,null);
  assert.equal(slice.primarySourceNodeId,"g4a_u03_4a03");
  assert.deepEqual(slice.supportingSourceNodeIds,["g4a_u03_4a03"]);
  assert.equal(slice.intraWavePrerequisiteRank,1);
  assert.equal(slice.primaryRuntimeProfileId,"profile_geometry_property");
  assert.deepEqual(slice.knowledgePointIds,[KP]);
  assert.deepEqual(slice.blockingCapabilityIds,[
    "cap_geometry_diagram_representation","cap_geometry_domain_validator","cap_geometry_property_reasoning","cap_scale_instrument_representation"
  ]);
  assert.equal(p.queueAuthority.queueDigest,"597a6fa497c8ac7738247847ef321d0c753e79800f5c38097b7a7a160be2f484");
});

test("W8 Q001 binds the R02 reviewed angle source and target candidate",()=>{
  const source=r02.sourceRecords.find(x=>x.sourceNodeId==="g4a_u03_4a03");assert.ok(source);
  const target=source.candidates.find(x=>x.knowledgePointId===KP);assert.ok(target);
  assert.equal(source.sourceTitle,"角度");
  assert.equal(source.sourcePdfTitle,"meow911_4a03_source.pdf");
  assert.deepEqual(source.reviewedPages,[1,2]);
  assert.equal(target.canonicalNameZh,"量角器量角");
  assert.equal(target.capabilityStatement,"學生能正確放置量角器並讀取角度。");
  assert.equal(target.reasoningInvariant,"量角器中心對準頂點、零度線對準一邊，從正確刻度方向讀值。");
  assert.deepEqual(target.evidencePages,[1,2]);
  assert.deepEqual(p.sourceAuthority.reviewedPages,[1,2]);
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.sourceRefAmbiguity,false);
});

test("W8 Q001 locks exact geometry-property plus scale-instrument runtime mapping",()=>{
  const mapping=getR04KnowledgePointCapabilityMapping(KP);assert.ok(mapping);
  assert.equal(mapping.primaryRuntimeProfileId,"profile_geometry_property");
  assert.equal(mapping.classificationRuleId,"rule_geometry_property");
  assert.deepEqual(mapping.appliedModifierIds,["mod_scale_instrument"]);
  assert.deepEqual(mapping.requiredRuntimeCapabilityIds,p.runtimeCapabilityAuthority.exactMappingRequiredRuntimeCapabilityIds);
  assert.deepEqual(mapping.optionalRuntimeCapabilityIds,p.runtimeCapabilityAuthority.exactMappingOptionalRuntimeCapabilityIds);
  assert.deepEqual(mapping.forbiddenRuntimeCapabilityIds,[]);
  assert.equal(p.runtimeCapabilityAuthority.runtimeProfileReclassificationAllowed,false);
});

test("W8 Q001 semantic lock owns only protractor placement and reading",()=>{
  const s=p.semanticProfileLock.implementationSemanticLock;
  assert.equal(s.protractorCenterMustAlignWithVertex,true);
  assert.equal(s.zeroDegreeBaselineMustAlignWithOneRay,true);
  assert.equal(s.readingDirectionMustMatchSelectedZeroScale,true);
  assert.equal(s.answerIsMeasuredAngleDegrees,true);
  assert.equal(s.angleCompositionReownershipAllowed,false);
  assert.equal(s.rotationClockReownershipAllowed,false);
  assert.equal(s.estimationClassificationReownershipAllowed,false);
  assert.equal(s.unknownAngleReownershipAllowed,false);
  assert.ok(p.q001ScopeLock.excludedRelations.includes("Q002_OR_LATER_IMPLEMENTATION"));
});

test("W8 Q001 preflight remains planning-only SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(p.q001ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q001ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_NODE_REGRESSION"),false);
  assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
});
