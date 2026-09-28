import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p08f/q012-g5a-u05a1-sector-compare-same-circle-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-02.json");
const index=read("data/curriculum/full-product/p08e/w8-source-authority-index.json");
const q011=read("data/curriculum/full-product/p08f/q011-final-learner-visual-d0-closeout.json");
const impact=read("data/project/change-impact/P08F_W8_Q012_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P08F_W8_Q012_PREFLIGHT.validation.json");
const KP="kp_g5a_u05a1_sector_compare_same_circle";
const SRC="g5a_u05_5a05a1";

test("W8 Q012 preflight binds exact twelfth frozen queue slice after Q011 D0",()=>{
 const result=materializeP08EW8DirectProductVerticalSliceQueue(),slice=result.queueEntries[11];
 assert.equal(q011.status,"Q011_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");assert.equal(q011.operatorAcceptance.d0Granted,true);
 assert.equal(p.predecessorAuthority.q011FinalCloseoutStatus,"Q011_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");assert.equal(p.predecessorAuthority.q011FinalCloseoutMergeSha,"64e9399ab7705de2450f44696e3c279dc318cf51");
 assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");assert.equal(result.queueFrozen,true);assert.equal(result.queueEntries.length,22);
 assert.equal(slice.queuePosition,12);assert.equal(slice.sliceId,"p08e_q012_r6_g5a_u05_5a05a1_profile_geometry_property_c1");assert.equal(slice.implementationTaskId,"P08F_W8DirectProductVerticalSlice012Implementation");
 assert.equal(slice.previousSliceId,"p08e_q011_r5_g5a_u07_5a07_profile_geometry_property_c1");assert.equal(slice.previousSliceMustBeD0Complete,true);
 assert.equal(slice.primarySourceNodeId,SRC);assert.deepEqual(slice.supportingSourceNodeIds,[SRC]);assert.equal(slice.intraWavePrerequisiteRank,6);assert.equal(slice.primaryRuntimeProfileId,"profile_geometry_property");assert.equal(slice.chunkIndex,1);
 assert.deepEqual(slice.knowledgePointIds,[KP]);
 assert.deepEqual(slice.blockingCapabilityIds,["cap_geometry_diagram_representation","cap_geometry_domain_validator","cap_geometry_property_reasoning"]);
 assert.deepEqual(slice.blockingCapabilityWaveIds,["R05-W5"]);
 assert.deepEqual(p.queueAuthority.knowledgePointIds,[KP]);assert.equal(p.queueAuthority.queueDigest,"597a6fa497c8ac7738247847ef321d0c753e79800f5c38097b7a7a160be2f484");
});

test("W8 Q012 binds reviewed G5A-U05A1 same-circle sector comparison candidate and source",()=>{
 const source=r02.sourceRecords.find(x=>x.sourceNodeId===SRC);assert.ok(source);const indexed=index.sources.find(x=>x.sourceNodeId===SRC);assert.ok(indexed);
 const candidate=source.candidates.find(x=>x.knowledgePointId===KP);assert.ok(candidate);
 assert.equal(source.sourceTitle,"扇形與圓心角");assert.equal(source.sourcePdfTitle,"meow911_5a05a1_source.pdf");assert.deepEqual(source.reviewedPages,[1,2]);
 assert.equal(candidate.canonicalNameZh,"同圓扇形大小比較");assert.equal(candidate.capabilityStatement,"學生能在同半徑下比較扇形大小。");assert.equal(candidate.reasoningInvariant,"同一圓中圓心角越大，弧與扇形越大。");assert.deepEqual(candidate.evidencePages,[1,2]);
 assert.ok(indexed.primaryW8KnowledgePointIds.includes(KP));assert.equal(p.r02ReviewedCandidateAuthority.knowledgePointId,KP);assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.sourceRefAmbiguity,false);
});

test("W8 Q012 locks exact geometry-property runtime mapping without modifier",()=>{
 const mapping=getR04KnowledgePointCapabilityMapping(KP);assert.ok(mapping);const a=p.runtimeCapabilityAuthority;
 assert.equal(mapping.primaryRuntimeProfileId,"profile_geometry_property");assert.equal(mapping.classificationRuleId,"rule_geometry_property");assert.deepEqual(mapping.appliedModifierIds,[]);
 assert.deepEqual(mapping.requiredRuntimeCapabilityIds,a.exactMappingRequiredRuntimeCapabilityIds);
 assert.deepEqual(mapping.optionalRuntimeCapabilityIds,["cap_geometry_construction"]);assert.deepEqual(mapping.forbiddenRuntimeCapabilityIds,[]);
 assert.equal(a.runtimeProfileReclassificationAllowed,false);
});

test("W8 Q012 semantic lock isolates same-circle size comparison from existing sector owners",()=>{
 const c=p.semanticProfileLock.sameCircleSectorComparison,g=p.semanticProfileLock.ownershipGuards;
 for(const key of ["sameCircleOrEqualRadiusRequired","comparedSectorCentralAnglesRequired","largerCentralAngleImpliesLargerArc","largerCentralAngleImpliesLargerSector","equalCentralAnglesImplyEqualSectorSize","noAreaFormulaRequired","noArcLengthFormulaRequired","noRulerMeasurementRequired"])assert.equal(c[key],true,key);
 assert.equal(g.centralAngleMeasurementReownershipAllowed,false);assert.equal(g.combinedSectorUnknownAngleReownershipAllowed,false);assert.equal(g.sectorFractionReownershipAllowed,false);assert.equal(g.sectorElementNamingReownershipAllowed,false);assert.equal(g.sectorAreaOrArcLengthFormulaReownershipAllowed,false);assert.equal(g.geometryConstructionReownershipAllowed,false);
 assert.deepEqual(p.sameSourceOwnershipBoundary.priorImplementedKnowledgePointIds,["kp_g5a_u05a1_central_angle_measurement","kp_g5a_u05a1_combined_sector_angle","kp_g5a_u05a1_sector_fraction_of_circle"]);
 assert.deepEqual(p.sameSourceOwnershipBoundary.protectedNonTargetKnowledgePointIds,["kp_g5a_u05a1_sector_center_radius_arc"]);
 assert.equal(p.sameSourceOwnershipBoundary.q012CompletesW8CandidateSetForSource,true);
 assert.ok(p.q012ScopeLock.excludedRelations.includes("Q013_OR_LATER_IMPLEMENTATION"));
});

test("W8 Q012 preflight remains planning-only SHARED_RUNTIME_BOUNDED",()=>{
 assert.equal(p.q012ScopeLock.implementationAllowedByThisPreflight,false);assert.equal(p.q012ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
 assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.deepEqual(impact.currentKnowledgePointIds,[KP]);assert.equal(impact.scopeGuards.productImplementation,false);
 assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
 assert.equal(JSON.stringify(validation).includes("FULL_NODE_REGRESSION"),false);assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
});
