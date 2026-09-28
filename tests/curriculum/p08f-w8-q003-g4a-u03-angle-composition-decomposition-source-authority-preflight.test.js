import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p08f/q003-g4a-u03-angle-composition-decomposition-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-01.json");
const index=read("data/curriculum/full-product/p08e/w8-source-authority-index.json");
const q002=read("data/curriculum/full-product/p08f/q002-final-learner-visual-d0-closeout.json");
const impact=read("data/project/change-impact/P08F_W8_Q003_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P08F_W8_Q003_PREFLIGHT.validation.json");
const KP="kp_angle_composition_decomposition";

test("W8 Q003 preflight binds exact third frozen queue slice after Q002 D0",()=>{
  const result=materializeP08EW8DirectProductVerticalSliceQueue(),slice=result.queueEntries[2];
  assert.equal(q002.status,"Q002_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(q002.operatorAcceptance.d0Granted,true);
  assert.equal(p.predecessorAuthority.q002FinalCloseoutPath,"data/curriculum/full-product/p08f/q002-final-learner-visual-d0-closeout.json");
  assert.equal(p.predecessorAuthority.q002FinalCloseoutStatus,"Q002_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(p.predecessorAuthority.q002FinalCloseoutMergeSha,"20b8dd415e0b9bcd343fec17ccf3ca0afda20160");
  assert.equal(p.predecessorAuthority.q002ActualPrintHumanAccepted,true);
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(result.queueFrozen,true);
  assert.equal(result.queueEntries.length,22);
  assert.equal(slice.queuePosition,3);
  assert.equal(slice.sliceId,"p08e_q003_r2_g4a_u03_4a03_profile_geometry_property_c1");
  assert.equal(slice.implementationTaskId,"P08F_W8DirectProductVerticalSlice003Implementation");
  assert.equal(slice.previousSliceId,"p08e_q002_r1_g5a_u10_5a10a_profile_spatial_solid_c1");
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.primarySourceNodeId,"g4a_u03_4a03");
  assert.deepEqual(slice.supportingSourceNodeIds,["g4a_u03_4a03"]);
  assert.equal(slice.intraWavePrerequisiteRank,2);
  assert.equal(slice.primaryRuntimeProfileId,"profile_geometry_property");
  assert.deepEqual(slice.knowledgePointIds,[KP]);
  assert.deepEqual(slice.blockingCapabilityIds,[
    "cap_geometry_diagram_representation",
    "cap_geometry_domain_validator",
    "cap_geometry_property_reasoning"
  ]);
  assert.deepEqual(slice.blockingCapabilityWaveIds,["R05-W5"]);
  assert.equal(p.queueAuthority.queueDigest,"597a6fa497c8ac7738247847ef321d0c753e79800f5c38097b7a7a160be2f484");
});

test("W8 Q003 binds reviewed G4A-U03 source and angle composition candidate",()=>{
  const source=r02.sourceRecords.find(x=>x.sourceNodeId==="g4a_u03_4a03");assert.ok(source);
  const target=source.candidates.find(x=>x.knowledgePointId===KP);assert.ok(target);
  const indexed=index.sources.find(x=>x.sourceNodeId==="g4a_u03_4a03");assert.ok(indexed);
  assert.equal(source.sourceTitle,"角度");
  assert.equal(source.sourcePdfTitle,"meow911_4a03_source.pdf");
  assert.deepEqual(source.reviewedPages,[1,2]);
  assert.equal(target.canonicalNameZh,"角的合成與分解");
  assert.equal(target.capabilityStatement,"學生能將相鄰角合成或把大角分解求未知角。");
  assert.equal(target.reasoningInvariant,"相鄰且不重疊角的角度可相加，分解後各部分和等於原角。");
  assert.deepEqual(target.evidencePages,[1,2]);
  assert.ok(indexed.primaryW8KnowledgePointIds.includes(KP));
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.sourceRefAmbiguity,false);
});

test("W8 Q003 locks exact geometry-property runtime mapping without modifiers",()=>{
  const mapping=getR04KnowledgePointCapabilityMapping(KP);assert.ok(mapping);
  assert.equal(mapping.primaryRuntimeProfileId,"profile_geometry_property");
  assert.equal(mapping.classificationRuleId,"rule_geometry_property");
  assert.deepEqual(mapping.appliedModifierIds,[]);
  assert.deepEqual(mapping.requiredRuntimeCapabilityIds,p.runtimeCapabilityAuthority.exactMappingRequiredRuntimeCapabilityIds);
  assert.deepEqual(mapping.optionalRuntimeCapabilityIds,["cap_geometry_construction"]);
  assert.deepEqual(mapping.forbiddenRuntimeCapabilityIds,[]);
  assert.equal(p.runtimeCapabilityAuthority.runtimeProfileReclassificationAllowed,false);
});

test("W8 Q003 semantic lock owns adjacent angle composition/decomposition only",()=>{
  const s=p.semanticProfileLock.implementationSemanticLock;
  assert.equal(s.adjacentAnglesShareVertex,true);
  assert.equal(s.nonOverlappingPartsRequired,true);
  assert.equal(s.wholeAngleEqualsSumOfParts,true);
  assert.equal(s.missingPartMayBeDerivedFromWholeMinusKnownPart,true);
  assert.equal(s.protractorMeasurementReownershipAllowed,false);
  assert.equal(s.rotationClockReownershipAllowed,false);
  assert.equal(s.estimationClassificationReownershipAllowed,false);
  assert.equal(s.linearFullVerticalAngleReownershipAllowed,false);
  assert.ok(p.q003ScopeLock.excludedRelations.includes("Q004_OR_LATER_IMPLEMENTATION"));
});

test("W8 Q003 preflight remains planning-only SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(p.q003ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q003ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_NODE_REGRESSION"),false);
  assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
});
