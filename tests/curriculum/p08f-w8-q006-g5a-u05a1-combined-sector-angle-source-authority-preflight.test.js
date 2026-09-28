import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p08f/q006-g5a-u05a1-combined-sector-angle-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-02.json");
const index=read("data/curriculum/full-product/p08e/w8-source-authority-index.json");
const q005=read("data/curriculum/full-product/p08f/q005-final-learner-visual-d0-closeout.json");
const impact=read("data/project/change-impact/P08F_W8_Q006_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P08F_W8_Q006_PREFLIGHT.validation.json");
const KP="kp_g5a_u05a1_combined_sector_angle";

test("W8 Q006 preflight binds exact sixth frozen queue slice after Q005 D0",()=>{
  const result=materializeP08EW8DirectProductVerticalSliceQueue(),slice=result.queueEntries[5];
  assert.equal(q005.status,"Q005_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(q005.operatorAcceptance.d0Granted,true);
  assert.equal(p.predecessorAuthority.q005FinalCloseoutStatus,"Q005_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(p.predecessorAuthority.q005FinalCloseoutMergeSha,"73accbb1fe475e70c42e65c8a30e22353937b85b");
  assert.equal(p.predecessorAuthority.q005ActualPrintHumanAccepted,true);
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(result.queueFrozen,true);
  assert.equal(result.queueEntries.length,22);
  assert.equal(slice.queuePosition,6);
  assert.equal(slice.sliceId,"p08e_q006_r3_g5a_u05_5a05a1_profile_geometry_property_c1");
  assert.equal(slice.implementationTaskId,"P08F_W8DirectProductVerticalSlice006Implementation");
  assert.equal(slice.previousSliceId,"p08e_q005_r3_g4a_u03_4a03_profile_geometry_property_c1");
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.primarySourceNodeId,"g5a_u05_5a05a1");
  assert.deepEqual(slice.supportingSourceNodeIds,["g5a_u05_5a05a1"]);
  assert.equal(slice.intraWavePrerequisiteRank,3);
  assert.equal(slice.primaryRuntimeProfileId,"profile_geometry_property");
  assert.equal(slice.chunkIndex,1);
  assert.deepEqual(slice.knowledgePointIds,[KP]);
  assert.deepEqual(slice.blockingCapabilityIds,[
    "cap_geometry_diagram_representation",
    "cap_geometry_domain_validator",
    "cap_geometry_property_reasoning"
  ]);
  assert.deepEqual(slice.blockingCapabilityWaveIds,["R05-W5"]);
  assert.deepEqual(p.queueAuthority.knowledgePointIds,[KP]);
  assert.equal(p.queueAuthority.queueDigest,"597a6fa497c8ac7738247847ef321d0c753e79800f5c38097b7a7a160be2f484");
});

test("W8 Q006 binds reviewed G5A-U05A1 combined-sector candidate and exact source authority",()=>{
  const source=r02.sourceRecords.find(x=>x.sourceNodeId==="g5a_u05_5a05a1"); assert.ok(source);
  const indexed=index.sources.find(x=>x.sourceNodeId==="g5a_u05_5a05a1"); assert.ok(indexed);
  const candidate=source.candidates.find(x=>x.knowledgePointId===KP); assert.ok(candidate);
  assert.equal(source.sourceTitle,"扇形與圓心角");
  assert.equal(source.sourcePdfTitle,"meow911_5a05a1_source.pdf");
  assert.deepEqual(source.reviewedPages,[1,2]);
  assert.equal(candidate.canonicalNameZh,"複合扇形角度");
  assert.equal(candidate.capabilityStatement,"學生能利用周角與已知圓心角求未知扇形角。");
  assert.equal(candidate.reasoningInvariant,"同一圓心周圍互不重疊圓心角和為360度。");
  assert.deepEqual(candidate.evidencePages,[1,2]);
  assert.ok(indexed.primaryW8KnowledgePointIds.includes(KP));
  assert.equal(p.r02ReviewedCandidateAuthority.knowledgePointId,KP);
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.sourceRefAmbiguity,false);
});

test("W8 Q006 locks exact geometry-property runtime mapping without modifier",()=>{
  const mapping=getR04KnowledgePointCapabilityMapping(KP); assert.ok(mapping);
  const a=p.runtimeCapabilityAuthority;
  assert.equal(mapping.primaryRuntimeProfileId,"profile_geometry_property");
  assert.equal(mapping.classificationRuleId,"rule_geometry_property");
  assert.deepEqual(mapping.appliedModifierIds,[]);
  assert.deepEqual(mapping.requiredRuntimeCapabilityIds,a.exactMappingRequiredRuntimeCapabilityIds);
  assert.deepEqual(mapping.optionalRuntimeCapabilityIds,["cap_geometry_construction"]);
  assert.deepEqual(mapping.forbiddenRuntimeCapabilityIds,[]);
  assert.equal(a.runtimeProfileReclassificationAllowed,false);
});

test("W8 Q006 semantic lock isolates combined-sector unknown angle from adjacent owners",()=>{
  const c=p.semanticProfileLock.combinedSectorAngle,g=p.semanticProfileLock.ownershipGuards;
  assert.equal(c.sameCircleCenterRequired,true);
  assert.equal(c.nonOverlappingCentralAnglesRequired,true);
  assert.equal(c.fullTurnInvariantDegrees,360);
  assert.equal(c.knownCentralAnglesMayBeSummed,true);
  assert.equal(c.unknownAngleDerivedBySubtractingKnownAngleSumFrom360,true);
  assert.equal(g.centralAngleMeasurementReownershipAllowed,false);
  assert.equal(g.sectorElementNamingReownershipAllowed,false);
  assert.equal(g.sectorFractionOfCircleReownershipAllowed,false);
  assert.equal(g.sameCircleSectorSizeComparisonReownershipAllowed,false);
  assert.deepEqual(p.sameSourceOwnershipBoundary.priorImplementedKnowledgePointIds,["kp_g5a_u05a1_central_angle_measurement"]);
  assert.deepEqual(p.sameSourceOwnershipBoundary.futureW8KnowledgePointIds,[
    "kp_g5a_u05a1_sector_fraction_of_circle",
    "kp_g5a_u05a1_sector_compare_same_circle"
  ]);
  assert.ok(p.q006ScopeLock.excludedRelations.includes("Q007_OR_LATER_IMPLEMENTATION"));
});

test("W8 Q006 preflight remains planning-only SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(p.q006ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q006ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.deepEqual(impact.currentKnowledgePointIds,[KP]);
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_NODE_REGRESSION"),false);
  assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
});
