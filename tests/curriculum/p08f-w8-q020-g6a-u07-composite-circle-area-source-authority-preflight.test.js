import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";
import {getR03DirectPrerequisites} from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p08f/q020-g6a-u07-composite-circle-area-source-authority-preflight.json");
const q019=read("docs/ci/latest-p08f-w8-q019-pages-e2e.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-07.json");
const index=read("data/curriculum/full-product/p08e/w8-source-authority-index.json");
const impact=read("data/project/change-impact/P08F_W8_Q020_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P08F_W8_Q020_PREFLIGHT.validation.json");
const SRC="g6a_u07_6a07";
const KP="kp_g6a_u07_composite_circle_area";

test("W8 Q020 binds exact twentieth frozen queue slice after Q019 D0",()=>{
  const result=materializeP08EW8DirectProductVerticalSliceQueue(),slice=result.queueEntries[19];
  assert.equal(q019.status,"PASS_E6_D0_COMPLETE");
  assert.equal(q019.d0Granted,true);
  assert.equal(q019.exactHeadSha,"6ec13e0712d35731fca72b310e46a261fa0193ab");
  assert.equal(q019.operatorHumanVisualReview?.status,"PASS_OPERATOR_APPROVED");
  assert.equal(p.predecessorAuthority.q019Status,"PASS_E6_D0_COMPLETE");
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(result.queueFrozen,true);
  assert.equal(result.queueEntries.length,22);
  assert.equal(slice.queuePosition,20);
  assert.equal(slice.sliceId,"p08e_q020_r12_g6a_u07_6a07_profile_geometry_formula_c1");
  assert.equal(slice.implementationTaskId,"P08F_W8DirectProductVerticalSlice020Implementation");
  assert.equal(slice.previousSliceId,"p08e_q019_r11_g6a_u07_6a07_profile_geometry_formula_c1");
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.assignedDeliveryWaveId,"R05-W8");
  assert.equal(slice.primarySourceNodeId,SRC);
  assert.deepEqual(slice.supportingSourceNodeIds,[SRC]);
  assert.equal(slice.intraWavePrerequisiteRank,12);
  assert.equal(slice.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.deepEqual(slice.knowledgePointIds,[KP]);
  assert.deepEqual(slice.blockingCapabilityIds,[
    "cap_geometry_diagram_representation",
    "cap_geometry_domain_validator",
    "cap_geometry_formula_evaluation",
    "cap_geometry_property_reasoning"
  ]);
  assert.deepEqual(slice.blockingCapabilityWaveIds,["R05-W5"]);
  assert.equal(p.queueAuthority.queueDigest,"597a6fa497c8ac7738247847ef321d0c753e79800f5c38097b7a7a160be2f484");
});

test("W8 Q020 binds immutable G6A-U07 source and direct composite-area visual families",()=>{
  const source=r02.sourceRecords.find(x=>x.sourceNodeId===SRC);assert.ok(source);
  const indexed=index.sources.find(x=>x.sourceNodeId===SRC);assert.ok(indexed);
  const target=source.candidates.find(x=>x.knowledgePointId===KP);assert.ok(target);
  assert.equal(source.sourceTitle,"圓面積和扇形面積");
  assert.equal(source.sourcePdfTitle,"meow911_6a07_source.pdf");
  assert.deepEqual(source.reviewedPages,[1,2]);
  assert.equal(target.canonicalNameZh,"複合圓形面積");
  assert.equal(target.capabilityStatement,"學生能分割或扣除求含半圓、扇形的複合面積。");
  assert.equal(target.reasoningInvariant,"各部分不可重疊漏算，弧形部分按對應圓比例計算。");
  assert.equal(target.category,"geometry");
  assert.deepEqual(target.evidencePages,[1,2]);
  assert.equal(target.applicationSuitability,"APPLICATION_COMPATIBLE");
  assert.ok(indexed.primaryW8KnowledgePointIds.includes(KP));
  assert.equal(p.sourceAuthority.sourcePdfDriveFileId,"1mPMMJVgnBrbghylTKnlWL3nnjX9MPIYQ");
  assert.equal(p.sourceAuthority.sourcePdfSizeBytes,523526);
  assert.equal(p.sourceAuthority.sourcePdfSha256,"e4290341b2ddc3c3dd4a675272b2c77932748548fe89edef88e3dc799fa81648");
  assert.equal(p.sourceAuthority.currentVisualReadbackAuthority.directCompositeCircleAreaWitnessPresent,true);
  assert.ok(p.sourceAuthority.currentVisualReadbackAuthority.directCompositeCircleAreaWitnessFamilies.length>=5);
  assert.equal(p.sourceAuthority.currentVisualReadbackAuthority.ocrUsedAsAuthority,false);
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.manualSourceChoiceRequired,false);
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.manualEvidenceChoiceRequired,false);
});

test("W8 Q020 reads executable R03/R04/R05 authority without mutating it",()=>{
  const edges=getR03DirectPrerequisites(KP);
  assert.ok(edges.length>=1);
  assert.ok(edges.every(x=>x.toKnowledgePointId===KP));
  assert.ok(edges.every(x=>x.status==="approved"));
  const mapping=getR04KnowledgePointCapabilityMapping(KP);assert.ok(mapping);
  assert.equal(mapping.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.equal(mapping.classificationRuleId,"rule_geometry_formula");
  const row=getR05DeliveryWaveAssignment(KP);assert.ok(row);
  assert.equal(row.deliveryWaveId,"R05-W8");
  assert.equal(row.intraWavePrerequisiteRank,12);
  assert.deepEqual(row.contractOnlyCapabilityWaveIds,["R05-W5"]);
  assert.equal(p.runtimeCapabilityAuthority.exactR03PrerequisitesBoundByFocusedCI,true);
  assert.equal(p.runtimeCapabilityAuthority.exactR04MappingBoundByFocusedCI,true);
  assert.equal(p.runtimeCapabilityAuthority.exactR05AssignmentBoundByFocusedCI,true);
});

test("W8 Q020 preserves prior G6A-U07 owners and is composite-area only",()=>{
  assert.deepEqual(p.ownershipBoundary.priorSameSourceImplementedKnowledgePointIds,[
    "kp_g6a_u07_circle_area_derivation",
    "kp_g6a_u07_circle_area_formula",
    "kp_g6a_u07_annulus_area",
    "kp_g6a_u07_sector_area"
  ]);
  assert.deepEqual(p.ownershipBoundary.currentQ020KnowledgePointIds,[KP]);
  assert.deepEqual(p.ownershipBoundary.futureSameSourceW8KnowledgePointIds,[]);
  const c=p.semanticProfileLock.implementationSemanticLock;
  assert.equal(c.decompositionIntoNonOverlappingRegionsRequired,true);
  assert.equal(c.circleAreaFormulaMayBeConsumedFromPriorOwner,true);
  assert.equal(c.sectorAreaMayBeConsumedFromQ019,true);
  assert.equal(c.q014CircleAreaFormulaTeachingReownershipAllowed,false);
  assert.equal(c.q017AnnulusAreaTeachingReownershipAllowed,false);
  assert.equal(c.q019SectorAreaTeachingReownershipAllowed,false);
  assert.equal(c.arcLengthOrPerimeterTeachingAllowed,false);
  assert.equal(c.applicationContextAllowed,false);
  assert.equal(c.sameUnitMixedModeAllowed,false);
  assert.equal(c.crossUnitMixedModeAllowed,false);
  assert.ok(p.q020ScopeLock.excludedRelations.includes("Q021_OR_LATER_IMPLEMENTATION"));
});

test("W8 Q020 preflight remains planning-only SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(p.q020ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q020ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.deepEqual(impact.currentKnowledgePointIds,[KP]);
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.equal(impact.scopeGuards.r04Mutation,false);
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_NODE_REGRESSION"),false);
  assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
  assert.equal(p.preflightDecision.separateImplementationApprovalRequired,true);
  assert.equal(p.preflightDecision.nextTask,"P08F_W8DirectProductVerticalSlice020Implementation");
});
