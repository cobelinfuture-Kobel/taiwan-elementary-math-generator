import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";
import {getR03DirectPrerequisites} from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p08f/q019-g6a-u07-sector-area-source-authority-preflight.json");
const q018=read("docs/ci/latest-p08f-w8-q018-pages-e2e.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-07.json");
const index=read("data/curriculum/full-product/p08e/w8-source-authority-index.json");
const q011=read("data/curriculum/full-product/p07f/q011-g6a-u07-circle-area-derivation-implementation.json");
const q014=read("data/curriculum/full-product/p07f/q014-g6a-u07-circle-area-formula-implementation.json");
const q017=read("data/curriculum/full-product/p07f/q017-g6a-u07-annulus-area-implementation.json");
const impact=read("data/project/change-impact/P08F_W8_Q019_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P08F_W8_Q019_PREFLIGHT.validation.json");
const SRC="g6a_u07_6a07";
const KP="kp_g6a_u07_sector_area";

test("W8 Q019 binds exact nineteenth frozen queue slice after Q018 D0",()=>{
  const result=materializeP08EW8DirectProductVerticalSliceQueue(),slice=result.queueEntries[18];
  assert.equal(q018.status,"PASS_E6_D0_COMPLETE");
  assert.equal(q018.exactHeadSha,"6825e02fa1834d13929941400d2d06b6cb74cd65");
  assert.equal(q018.humanVisualReviewRequired,false);
  assert.equal(p.predecessorAuthority.q018Status,"PASS_E6_D0_COMPLETE");
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(result.queueFrozen,true);
  assert.equal(result.queueEntries.length,22);
  assert.equal(slice.queuePosition,19);
  assert.equal(slice.sliceId,"p08e_q019_r11_g6a_u07_6a07_profile_geometry_formula_c1");
  assert.equal(slice.implementationTaskId,"P08F_W8DirectProductVerticalSlice019Implementation");
  assert.equal(slice.previousSliceId,"p08e_q018_r10_g6b_u06_6b06_profile_ratio_percent_c1");
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.assignedDeliveryWaveId,"R05-W8");
  assert.equal(slice.primarySourceNodeId,SRC);
  assert.deepEqual(slice.supportingSourceNodeIds,[SRC]);
  assert.equal(slice.intraWavePrerequisiteRank,11);
  assert.equal(slice.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.equal(slice.chunkIndex,1);
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

test("W8 Q019 binds immutable G6A-U07 source and direct sector-area witness",()=>{
  const source=r02.sourceRecords.find(x=>x.sourceNodeId===SRC);assert.ok(source);
  const indexed=index.sources.find(x=>x.sourceNodeId===SRC);assert.ok(indexed);
  const target=source.candidates.find(x=>x.knowledgePointId===KP);assert.ok(target);
  assert.equal(source.sourceTitle,"圓面積和扇形面積");
  assert.equal(source.sourcePdfTitle,"meow911_6a07_source.pdf");
  assert.deepEqual(source.reviewedPages,[1,2]);
  assert.equal(target.canonicalNameZh,"扇形面積");
  assert.equal(target.capabilityStatement,"學生能依圓心角比例求扇形面積。");
  assert.equal(target.reasoningInvariant,"扇形面積等於圓面積乘圓心角除以360度。");
  assert.equal(target.category,"geometry");
  assert.deepEqual(target.evidencePages,[1,2]);
  assert.equal(target.applicationSuitability,"APPLICATION_COMPATIBLE");
  assert.ok(indexed.primaryW8KnowledgePointIds.includes(KP));
  assert.equal(p.sourceAuthority.sourcePdfDriveFileId,"1mPMMJVgnBrbghylTKnlWL3nnjX9MPIYQ");
  assert.equal(p.sourceAuthority.sourcePdfSizeBytes,523526);
  assert.equal(p.sourceAuthority.sourcePdfSha256,"e4290341b2ddc3c3dd4a675272b2c77932748548fe89edef88e3dc799fa81648");
  assert.equal(p.sourceAuthority.currentVisualReadbackAuthority.directSectorAreaWitnessPresent,true);
  assert.equal(p.sourceAuthority.currentVisualReadbackAuthority.directSectorAreaWitness.visibleRadiusCm,18);
  assert.equal(p.sourceAuthority.currentVisualReadbackAuthority.directSectorAreaWitness.visibleCentralAngleDeg,30);
  assert.equal(p.sourceAuthority.currentVisualReadbackAuthority.ocrUsedAsAuthority,false);
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.manualSourceChoiceRequired,false);
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.manualEvidenceChoiceRequired,false);
});

test("W8 Q019 locks R03 prerequisite foundation without taking predecessor ownership",()=>{
  const edges=getR03DirectPrerequisites(KP);
  assert.ok(edges.length>=1);
  assert.ok(edges.every(x=>x.toKnowledgePointId===KP));
  assert.ok(edges.every(x=>x.status==="approved"));
  assert.ok(edges.some(x=>x.fromKnowledgePointId==="kp_g6a_u07_circle_area_formula"&&x.dependencyStrength==="required"));
  assert.equal(p.semanticProfileLock.implementationSemanticLock.diameterToRadiusNormalizationMayBeConsumedFromPriorCircleAreaFormula,true);
  assert.equal(p.semanticProfileLock.implementationSemanticLock.q014CircleAreaFormulaTeachingReownershipAllowed,false);
});

test("W8 Q019 locks exact R04 geometry-formula mapping and R05 W8 assignment",()=>{
  const mapping=getR04KnowledgePointCapabilityMapping(KP);assert.ok(mapping);
  assert.equal(mapping.mappingId,p.runtimeCapabilityAuthority.mappingId);
  assert.equal(mapping.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.equal(mapping.classificationRuleId,"rule_geometry_formula");
  assert.deepEqual(mapping.appliedModifierIds,["mod_integer_division"]);
  assert.deepEqual(mapping.requiredRuntimeCapabilityIds,p.runtimeCapabilityAuthority.requiredRuntimeCapabilityIds);
  assert.ok(mapping.requiredRuntimeCapabilityIds.includes("cap_integer_division"));
  assert.deepEqual(mapping.optionalRuntimeCapabilityIds,[]);
  assert.deepEqual(mapping.forbiddenRuntimeCapabilityIds,[]);
  const row=getR05DeliveryWaveAssignment(KP);assert.ok(row);
  assert.equal(row.baseDeliveryWaveId,"R05-W5");
  assert.equal(row.deliveryWaveId,"R05-W8");
  assert.equal(row.prerequisiteWaveLowerBound,8);
  assert.equal(row.waveEscalatedByPrerequisite,true);
  assert.equal(row.intraWavePrerequisiteRank,11);
  assert.equal(row.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.deepEqual(row.contractOnlyCapabilityWaveIds,["R05-W5"]);
  assert.deepEqual(new Set(row.contractOnlyRequiredCapabilityIds),new Set(p.runtimeCapabilityAuthority.deliveryEnvelope.expectedContractOnlyRequiredCapabilityIds));
});

test("W8 Q019 preserves three prior G6A-U07 owners and protects composite-area successor",()=>{
  assert.deepEqual(q011.queueAuthority.knowledgePointIds,["kp_g6a_u07_circle_area_derivation"]);
  assert.deepEqual(q014.queueAuthority.knowledgePointIds,["kp_g6a_u07_circle_area_formula"]);
  assert.deepEqual(q017.queueAuthority.knowledgePointIds,["kp_g6a_u07_annulus_area"]);
  assert.deepEqual(p.ownershipBoundary.priorSameSourceImplementedKnowledgePointIds,[
    "kp_g6a_u07_circle_area_derivation",
    "kp_g6a_u07_circle_area_formula",
    "kp_g6a_u07_annulus_area"
  ]);
  assert.deepEqual(p.ownershipBoundary.currentQ019KnowledgePointIds,[KP]);
  assert.deepEqual(p.ownershipBoundary.futureSameSourceW8KnowledgePointIds,["kp_g6a_u07_composite_circle_area"]);
  assert.equal(p.ownershipBoundary.priorOwnersMayBeConsumedAsPrerequisiteButNotReowned,true);
});

test("W8 Q019 semantic scope is sector-area only",()=>{
  const c=p.semanticProfileLock.implementationSemanticLock;
  assert.equal(c.circleAreaAsWholeReferenceRequired,true);
  assert.equal(c.centralAngleFractionOf360Required,true);
  assert.equal(c.sectorAreaEqualsCircleAreaTimesAngleFractionRequired,true);
  assert.equal(c.q011CircleAreaDerivationTeachingReownershipAllowed,false);
  assert.equal(c.q014CircleAreaFormulaTeachingReownershipAllowed,false);
  assert.equal(c.q017AnnulusAreaTeachingReownershipAllowed,false);
  assert.equal(c.futureCompositeCircleAreaTeachingReownershipAllowed,false);
  assert.equal(c.arcLengthOrPerimeterTeachingAllowed,false);
  assert.equal(c.genericSectorFractionTeachingReownershipAllowed,false);
  assert.equal(c.applicationContextAllowed,false);
  assert.equal(c.sameUnitMixedModeAllowed,false);
  assert.equal(c.crossUnitMixedModeAllowed,false);
  assert.ok(p.q019ScopeLock.excludedRelations.includes("Q020_OR_LATER_IMPLEMENTATION"));
  assert.equal(p.q019ScopeLock.humanLearnerVisualAcceptanceExpectedAtD0,true);
});

test("W8 Q019 preflight remains planning-only SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(p.q019ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q019ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.deepEqual(impact.currentKnowledgePointIds,[KP]);
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.equal(impact.scopeGuards.r04Mutation,false);
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_NODE_REGRESSION"),false);
  assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
  assert.equal(p.preflightDecision.separateImplementationApprovalRequired,true);
  assert.equal(p.preflightDecision.nextTask,"P08F_W8DirectProductVerticalSlice019Implementation");
});
