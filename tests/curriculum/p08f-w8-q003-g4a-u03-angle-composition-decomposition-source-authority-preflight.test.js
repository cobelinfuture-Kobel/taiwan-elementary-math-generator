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
const KPS=["kp_angle_composition_decomposition","kp_rotation_angle_clock"];

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
  assert.deepEqual(slice.knowledgePointIds,KPS);
  assert.deepEqual(slice.blockingCapabilityIds,[
    "cap_geometry_diagram_representation",
    "cap_geometry_domain_validator",
    "cap_geometry_property_reasoning",
    "cap_scale_instrument_representation"
  ]);
  assert.deepEqual(slice.blockingCapabilityWaveIds,["R05-W4","R05-W5"]);
  assert.equal(p.queueAuthority.knowledgePointCount,2);
  assert.deepEqual(p.queueAuthority.knowledgePointIds,KPS);
  assert.equal(p.queueAuthority.queueDigest,"597a6fa497c8ac7738247847ef321d0c753e79800f5c38097b7a7a160be2f484");
});

test("W8 Q003 binds both reviewed G4A-U03 candidates from the exact frozen slice",()=>{
  const source=r02.sourceRecords.find(x=>x.sourceNodeId==="g4a_u03_4a03");assert.ok(source);
  const indexed=index.sources.find(x=>x.sourceNodeId==="g4a_u03_4a03");assert.ok(indexed);
  const byId=new Map(source.candidates.map(x=>[x.knowledgePointId,x]));
  const angle=byId.get(KPS[0]),clock=byId.get(KPS[1]);assert.ok(angle);assert.ok(clock);
  assert.equal(source.sourceTitle,"角度");
  assert.equal(source.sourcePdfTitle,"meow911_4a03_source.pdf");
  assert.deepEqual(source.reviewedPages,[1,2]);
  assert.equal(angle.canonicalNameZh,"角的合成與分解");
  assert.equal(angle.capabilityStatement,"學生能將相鄰角合成或把大角分解求未知角。");
  assert.equal(angle.reasoningInvariant,"相鄰且不重疊角的角度可相加，分解後各部分和等於原角。");
  assert.equal(clock.canonicalNameZh,"旋轉角與鐘面角");
  assert.equal(clock.capabilityStatement,"學生能把旋轉方向與圈數轉換為角度，並計算鐘面指針角。");
  assert.equal(clock.reasoningInvariant,"一周為360度，鐘面12等分，每格30度。");
  assert.deepEqual(angle.evidencePages,[1,2]);
  assert.deepEqual(clock.evidencePages,[1,2]);
  assert.ok(KPS.every(id=>indexed.primaryW8KnowledgePointIds.includes(id)));
  assert.deepEqual(p.r02ReviewedCandidateAuthorities.map(x=>x.knowledgePointId),KPS);
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.sourceRefAmbiguity,false);
});

test("W8 Q003 locks exact runtime mappings for both KPs",()=>{
  const angle=getR04KnowledgePointCapabilityMapping(KPS[0]);assert.ok(angle);
  const clock=getR04KnowledgePointCapabilityMapping(KPS[1]);assert.ok(clock);
  const a=p.runtimeCapabilityAuthorities[KPS[0]],c=p.runtimeCapabilityAuthorities[KPS[1]];
  assert.equal(angle.primaryRuntimeProfileId,"profile_geometry_property");
  assert.equal(angle.classificationRuleId,"rule_geometry_property");
  assert.deepEqual(angle.appliedModifierIds,[]);
  assert.deepEqual(angle.requiredRuntimeCapabilityIds,a.exactMappingRequiredRuntimeCapabilityIds);
  assert.deepEqual(angle.optionalRuntimeCapabilityIds,["cap_geometry_construction"]);
  assert.deepEqual(angle.forbiddenRuntimeCapabilityIds,[]);
  assert.equal(clock.primaryRuntimeProfileId,"profile_geometry_property");
  assert.equal(clock.classificationRuleId,"rule_geometry_property");
  assert.deepEqual(clock.appliedModifierIds,["mod_scale_instrument"]);
  assert.deepEqual(clock.requiredRuntimeCapabilityIds,c.exactMappingRequiredRuntimeCapabilityIds);
  assert.deepEqual(clock.optionalRuntimeCapabilityIds,["cap_geometry_construction"]);
  assert.deepEqual(clock.forbiddenRuntimeCapabilityIds,[]);
  assert.equal(p.runtimeCapabilityAuthorities.runtimeProfileReclassificationAllowed,false);
});

test("W8 Q003 semantic lock covers angle composition plus rotation/clock without reowning later KPs",()=>{
  const a=p.semanticProfileLock.angleCompositionDecomposition;
  const c=p.semanticProfileLock.rotationAngleClock;
  const g=p.semanticProfileLock.ownershipGuards;
  assert.equal(a.adjacentAnglesShareVertex,true);
  assert.equal(a.nonOverlappingPartsRequired,true);
  assert.equal(a.wholeAngleEqualsSumOfParts,true);
  assert.equal(a.missingPartMayBeDerivedFromWholeMinusKnownPart,true);
  assert.equal(c.rotationDirectionAndTurnMagnitudeRequired,true);
  assert.equal(c.fullTurnDegrees,360);
  assert.equal(c.clockDivisionCount,12);
  assert.equal(c.clockDegreesPerDivision,30);
  assert.equal(g.protractorMeasurementReownershipAllowed,false);
  assert.equal(g.estimationClassificationReownershipAllowed,false);
  assert.equal(g.linearFullVerticalAngleReownershipAllowed,false);
  assert.deepEqual(p.q003ScopeLock.includedKnowledgePointIds,KPS);
  assert.ok(p.q003ScopeLock.excludedRelations.includes("Q004_OR_LATER_IMPLEMENTATION"));
});

test("W8 Q003 preflight remains planning-only SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(p.q003ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q003ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.deepEqual(impact.currentKnowledgePointIds,KPS);
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_NODE_REGRESSION"),false);
  assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
});
