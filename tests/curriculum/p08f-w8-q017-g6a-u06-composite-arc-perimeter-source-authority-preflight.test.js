import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p08f/q017-g6a-u06-composite-arc-perimeter-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-07.json");
const index=read("data/curriculum/full-product/p08e/w8-source-authority-index.json");
const q016=read("data/curriculum/full-product/p08f/q016-final-learner-visual-d0-closeout.json");
const q004=read("data/curriculum/full-product/p07f/q004-g6a-u06-pi-circumference-relation-implementation.json");
const q006=read("data/curriculum/full-product/p07f/q006-g6a-u06-circle-circumference-formula-implementation.json");
const q010=read("data/curriculum/full-product/p07f/q010-g6a-u06-semicircle-perimeter-implementation.json");
const q015=read("data/curriculum/full-product/p08f/q015-g6a-u06-sector-arc-length-implementation.json");
const impact=read("data/project/change-impact/P08F_W8_Q017_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P08F_W8_Q017_PREFLIGHT.validation.json");

const SRC="g6a_u06_6a06";
const KP="kp_g6a_u06_composite_arc_perimeter";

test("W8 Q017 preflight binds exact seventeenth frozen queue slice after Q016 D0",()=>{
  const result=materializeP08EW8DirectProductVerticalSliceQueue(),slice=result.queueEntries[16];
  assert.equal(q016.status,"Q016_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(q016.operatorAcceptance.d0Granted,true);
  assert.equal(p.predecessorAuthority.q016FinalCloseoutStatus,"Q016_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(p.predecessorAuthority.q016FinalCloseoutMergeSha,"2c3ccb8955ccafe95b0a1b13027a02b67448e9fe");
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(result.queueFrozen,true);
  assert.equal(result.queueEntries.length,22);
  assert.equal(slice.queuePosition,17);
  assert.equal(slice.sliceId,"p08e_q017_r10_g6a_u06_6a06_profile_geometry_formula_c1");
  assert.equal(slice.implementationTaskId,"P08F_W8DirectProductVerticalSlice017Implementation");
  assert.equal(slice.previousSliceId,"p08e_q016_r9_g6a_u09_6a09_profile_geometry_property_c1");
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.assignedDeliveryWaveId,"R05-W8");
  assert.equal(slice.primarySourceNodeId,SRC);
  assert.deepEqual(slice.supportingSourceNodeIds,[SRC]);
  assert.equal(slice.intraWavePrerequisiteRank,10);
  assert.equal(slice.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.equal(slice.chunkIndex,1);
  assert.equal(slice.knowledgePointCount,1);
  assert.deepEqual(slice.knowledgePointIds,[KP]);
  assert.deepEqual(slice.blockingCapabilityIds,[
    "cap_geometry_diagram_representation",
    "cap_geometry_domain_validator",
    "cap_geometry_formula_evaluation",
    "cap_geometry_property_reasoning"
  ]);
  assert.deepEqual(slice.blockingCapabilityWaveIds,["R05-W5"]);
  assert.equal(slice.targetEvidenceLevel,"E6_D0_COMPLETE");
  assert.equal(p.queueAuthority.queueDigest,"597a6fa497c8ac7738247847ef321d0c753e79800f5c38097b7a7a160be2f484");
});

test("W8 Q017 binds reviewed composite-arc candidate and immutable G6A-U06 source",()=>{
  const source=r02.sourceRecords.find(x=>x.sourceNodeId===SRC);assert.ok(source);
  const indexed=index.sources.find(x=>x.sourceNodeId===SRC);assert.ok(indexed);
  assert.equal(source.sourceTitle,"圓周長與扇形周長");
  assert.equal(source.sourcePdfTitle,"meow911_6a06_source.pdf");
  assert.deepEqual(source.reviewedPages,[1,2]);
  const target=source.candidates.find(x=>x.knowledgePointId===KP);assert.ok(target);
  assert.equal(target.canonicalNameZh,"複合弧形周長");
  assert.equal(target.capabilityStatement,"學生能辨認外部直線與弧線並求總周長。");
  assert.equal(target.reasoningInvariant,"只計外部邊界，各弧須依其半徑與圓心角計算。");
  assert.equal(target.category,"geometry");
  assert.deepEqual(target.evidencePages,[1,2]);
  assert.equal(target.applicationSuitability,"APPLICATION_COMPATIBLE");
  assert.ok(indexed.primaryW8KnowledgePointIds.includes(KP));
  assert.equal(p.sourceAuthority.sourcePdfDriveFileId,"1kUsHZcQ9pyLNyBc6bduLb7UOnQPUFmOk");
  assert.equal(p.sourceAuthority.sourcePdfSizeBytes,644331);
  assert.equal(p.sourceAuthority.sourcePdfSha256,"e21d00e73df47d6ce7ae2d8d1dd2e8cbed04380a45ece38bc4d4df7fe08ebcf4");
  assert.equal(p.sourceAuthority.currentVisualReadbackAuthority.compositeArcPerimeterVisiblyPresent,true);
  assert.equal(p.sourceAuthority.currentVisualReadbackAuthority.ocrUsedAsAuthority,false);
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.manualSourceChoiceRequired,false);
});

test("W8 Q017 locks exact R04 geometry-formula mapping without reclassification",()=>{
  const mapping=getR04KnowledgePointCapabilityMapping(KP);assert.ok(mapping);
  assert.equal(mapping.mappingId,p.runtimeCapabilityAuthority.mappingId);
  assert.equal(mapping.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.equal(mapping.classificationRuleId,"rule_geometry_formula");
  assert.deepEqual(mapping.appliedModifierIds,[]);
  assert.deepEqual(mapping.requiredRuntimeCapabilityIds,p.runtimeCapabilityAuthority.requiredRuntimeCapabilityIds);
  assert.deepEqual(mapping.optionalRuntimeCapabilityIds,[]);
  assert.deepEqual(mapping.forbiddenRuntimeCapabilityIds,[]);
  assert.equal(p.runtimeCapabilityAuthority.runtimeProfileReclassificationAllowed,false);
});

test("W8 Q017 remains prerequisite-escalated R05-W8 at rank 10",()=>{
  const row=getR05DeliveryWaveAssignment(KP);assert.ok(row);
  assert.equal(row.baseDeliveryWaveId,"R05-W5");
  assert.equal(row.deliveryWaveId,"R05-W8");
  assert.equal(row.waveEscalatedByPrerequisite,true);
  assert.equal(row.intraWavePrerequisiteRank,10);
  assert.equal(row.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.deepEqual(row.contractOnlyCapabilityWaveIds,["R05-W5"]);
  assert.deepEqual(new Set(row.contractOnlyRequiredCapabilityIds),new Set([
    "cap_geometry_property_reasoning",
    "cap_geometry_formula_evaluation",
    "cap_geometry_domain_validator",
    "cap_geometry_diagram_representation"
  ]));
});

test("W8 Q017 preserves all prior G6A-U06 owners and completes remaining W8 source target",()=>{
  assert.deepEqual(q004.queueAuthority.knowledgePointIds,["kp_g6a_u06_pi_circumference_relation"]);
  assert.deepEqual(q006.queueAuthority.knowledgePointIds,["kp_g6a_u06_circle_circumference_formula"]);
  assert.deepEqual(q010.queueAuthority.knowledgePointIds,["kp_g6a_u06_semicircle_perimeter"]);
  assert.deepEqual(q015.queueAuthority.knowledgePointIds,["kp_g6a_u06_sector_arc_length"]);
  assert.deepEqual(p.ownershipBoundary.priorSameSourceImplementedKnowledgePointIds,[
    "kp_g6a_u06_pi_circumference_relation",
    "kp_g6a_u06_circle_circumference_formula",
    "kp_g6a_u06_semicircle_perimeter",
    "kp_g6a_u06_sector_arc_length"
  ]);
  assert.deepEqual(p.ownershipBoundary.currentQ017KnowledgePointIds,[KP]);
  assert.deepEqual(p.ownershipBoundary.futureSameSourceW8KnowledgePointIds,[]);
  assert.equal(p.ownershipBoundary.priorOwnersMayBeConsumedAsPrerequisiteButNotReowned,true);
  assert.equal(p.ownershipBoundary.q017CompletesRemainingFrozenW8G6AU06KnowledgePoints,true);
});

test("W8 Q017 semantic lock is external composite boundary only",()=>{
  const c=p.semanticProfileLock.implementationSemanticLock;
  assert.equal(c.externalBoundaryOnlyRequired,true);
  assert.equal(c.internalOrSharedEdgesExcluded,true);
  assert.equal(c.straightBoundarySegmentsAllowed,true);
  assert.equal(c.multipleArcSegmentsAllowed,true);
  assert.equal(c.eachArcUsesItsOwnRadiusAndCentralAngle,true);
  assert.equal(c.sectorPerimeterAsCompositeBoundaryPatternAllowed,true);
  assert.equal(c.stadiumCapsuleBoundaryPatternAllowed,true);
  assert.equal(c.semicircleArcCompositionAllowed,true);
  assert.equal(c.q004PiCircumferenceRelationTeachingReownershipAllowed,false);
  assert.equal(c.q006CircleCircumferenceFormulaTeachingReownershipAllowed,false);
  assert.equal(c.q010SemicirclePerimeterTeachingReownershipAllowed,false);
  assert.equal(c.q015SectorArcLengthTeachingReownershipAllowed,false);
  assert.equal(c.sectorAreaAllowed,false);
  assert.equal(c.compositeCircleAreaAllowed,false);
  assert.equal(c.applicationContextAllowed,false);
  assert.equal(c.sameUnitMixedModeAllowed,false);
  assert.equal(c.crossUnitMixedModeAllowed,false);
  assert.ok(p.q017ScopeLock.excludedRelations.includes("Q018_OR_LATER_IMPLEMENTATION"));
});

test("W8 Q017 preflight remains planning-only SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(p.q017ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q017ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.deepEqual(impact.currentKnowledgePointIds,[KP]);
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.equal(impact.scopeGuards.r04Mutation,false);
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_NODE_REGRESSION"),false);
  assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
  assert.equal(p.preflightDecision.separateImplementationApprovalRequired,true);
  assert.equal(p.preflightDecision.nextTask,"P08F_W8DirectProductVerticalSlice017Implementation");
});
