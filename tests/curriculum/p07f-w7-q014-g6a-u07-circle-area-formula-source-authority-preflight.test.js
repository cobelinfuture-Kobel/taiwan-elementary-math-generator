import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {getR03DirectPrerequisites} from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const pre=read("data/curriculum/full-product/p07f/q014-g6a-u07-circle-area-formula-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-07.json");
const KP="kp_g6a_u07_circle_area_formula";
const strip=e=>({edgeId:e.edgeId,fromKnowledgePointId:e.fromKnowledgePointId,toKnowledgePointId:e.toKnowledgePointId,dependencyStrength:e.dependencyStrength,dependencyRole:e.dependencyRole,alternativeGroupId:e.alternativeGroupId,distanceBearing:e.distanceBearing,rationale:e.rationale,evidenceRefs:e.evidenceRefs});

test("Q014 preflight binds exact frozen row and Q013 D0",()=>{
  const row=materializeP07EW7DirectProductVerticalSliceQueue().queueEntries[13];
  assert.equal(pre.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(row.queuePosition,14);
  assert.equal(row.sliceId,"p07e_q014_r10_g6a_u07_6a07_profile_geometry_formula_c1");
  assert.deepEqual([...row.knowledgePointIds],[KP]);
  assert.deepEqual(pre.queueAuthority.knowledgePointIds,[KP]);
  assert.equal(pre.predecessorD0Evidence.q013Status,"PASS_E6_D0_COMPLETE");
});

test("Q014 exact original PDF operationally supports pi-r-squared formula application without new supplement",()=>{
  const s=pre.sourceAuthority,v=s.currentVisualReadbackAuthority,d=v.q014DirectVisualEvidence;
  assert.equal(s.sourcePdfDriveFileId,"1mPMMJVgnBrbghylTKnlWL3nnjX9MPIYQ");
  assert.equal(s.sourcePdfSizeBytes,523526);
  assert.equal(s.sourcePdfSha256,"e4290341b2ddc3c3dd4a675272b2c77932748548fe89edef88e3dc799fa81648");
  assert.equal(v.reviewMethod,"CURRENT_FULL_PAGE_VISUAL_READBACK_200_DPI");
  assert.equal(v.ocrUsedAsAuthority,false);
  assert.equal(v.standaloneFormulaLiteralVisible,false);
  assert.equal(v.formulaOperationallyRequiredByVisibleItems,true);
  assert.equal(d.circleAreaFormulaApplicationPresent,true);
  assert.equal(d.radiusGivenWitnessPresent,true);
  assert.equal(d.radiusGivenWitness.visibleRadiusCm,18);
  assert.equal(d.diameterToRadiusWitnessPresent,true);
  assert.equal(d.diameterToRadiusWitness.visibleInnerDiameterMeters,4);
  assert.equal(d.directSupportClassification,"DIRECT_OPERATIONAL_FORMULA_APPLICATION_EVIDENCE");
  assert.equal(s.evidenceResolution.newSupplementaryEvidenceRequired,false);
  assert.equal(s.existingSupplementaryEvidenceCorroboration.requiredForQ014SourceSufficiency,false);
  assert.equal(s.existingSupplementaryEvidenceCorroboration.consumedAsQ014RequiredAuthority,false);
});

test("Q014 exact R02 candidate protects Q011 derivation and Q017 annulus",()=>{
  const src=r02.sourceRecords.find(x=>x.sourceNodeId==="g6a_u07_6a07");assert.ok(src);
  const target=src.candidates.find(x=>x.knowledgePointId===KP);assert.ok(target);
  assert.deepEqual(pre.r02ReviewedCandidateAuthority.targetCandidate,target);
  assert.equal(pre.r02ReviewedCandidateAuthority.predecessorOwnedKnowledgePointRows[0].knowledgePointId,"kp_g6a_u07_circle_area_derivation");
  assert.equal(pre.r02ReviewedCandidateAuthority.protectedFutureQueueOwnership[0].knowledgePointIds[0],"kp_g6a_u07_annulus_area");
  assert.deepEqual(pre.r02ReviewedCandidateAuthority.sourceSiblingNotOwnedByQ014,["kp_g6a_u07_sector_area","kp_g6a_u07_composite_circle_area"]);
});

test("Q014 exact R03 prerequisite is Q011 circle-area derivation only",()=>{
  const actual=getR03DirectPrerequisites(KP).map(strip).sort((a,b)=>a.edgeId.localeCompare(b.edgeId));
  const expected=[...pre.prerequisiteGraphAuthority.exactIncomingRequiredDistanceBearingEdges].sort((a,b)=>a.edgeId.localeCompare(b.edgeId));
  assert.deepEqual(actual,expected);
  assert.deepEqual(pre.prerequisiteGraphAuthority.requiredPrerequisiteKnowledgePointIds,["kp_g6a_u07_circle_area_derivation"]);
  assert.equal(pre.prerequisiteGraphAuthority.circleAreaDerivationPrerequisiteRequired,true);
  assert.equal(pre.prerequisiteGraphAuthority.q011DerivationTeachingMayNotBeReowned,true);
});

test("Q014 exact R04 mapping is frozen geometry-formula with no modifiers",()=>{
  const r04=getR04KnowledgePointCapabilityMapping(KP),e=pre.runtimeCapabilityAuthority.executableR04Mapping;assert.ok(r04);
  assert.equal(r04.primaryRuntimeProfileId,e.primaryRuntimeProfileId);
  assert.equal(r04.classificationRuleId,e.classificationRuleId);
  assert.deepEqual([...r04.appliedModifierIds],e.appliedModifierIds);
  assert.deepEqual([...r04.requiredRuntimeCapabilityIds],e.requiredRuntimeCapabilityIds);
  assert.deepEqual([...r04.optionalRuntimeCapabilityIds],e.optionalRuntimeCapabilityIds);
  assert.deepEqual([...r04.forbiddenRuntimeCapabilityIds],e.forbiddenRuntimeCapabilityIds);
  assert.equal(pre.runtimeCapabilityAuthority.exactR04MappingVerified,true);
});

test("Q014 exact R05 assignment is W5 base escalated to W7 rank 10",()=>{
  const r05=getR05DeliveryWaveAssignment(KP),e=pre.r05AssignmentAuthority.exactR05Assignment;assert.ok(r05);
  for(const k of ["baseDeliveryWaveId","deliveryWaveId","waveEscalatedByPrerequisite","prerequisiteWaveLowerBound","intraWavePrerequisiteRank"])assert.equal(r05[k],e[k]);
  assert.equal(pre.r05AssignmentAuthority.exactR05AssignmentVerified,true);
});

test("Q014 semantic ownership locks formula evaluation and excludes derivation, sector, annulus and composite families",()=>{
  const s=pre.semanticProfileLock.implementationSemanticLock;
  assert.equal(pre.semanticProfileLock.targetSemanticCore,"CIRCLE_AREA_FORMULA_EVALUATION_PI_R_SQUARED_WITH_RADIUS_DIAMETER_NORMALIZATION");
  assert.equal(s.circleAreaFormulaRequired,true);
  assert.equal(s.radiusSquaredRequired,true);
  assert.equal(s.diameterToRadiusNormalizationRequired,true);
  assert.equal(s.computeCircleAreaFromRadiusAllowed,true);
  assert.equal(s.computeCircleAreaFromDiameterAllowed,true);
  assert.equal(s.q011DerivationTeachingReownershipAllowed,false);
  assert.equal(s.sectorAreaAllowed,false);
  assert.equal(s.annulusAreaAllowed,false);
  assert.equal(s.compositeCircleAreaAllowed,false);
  assert.equal(s.circularSegmentAreaAllowed,false);
  assert.equal(s.cowGrazingApplicationAllowed,false);
  assert.equal(s.sameUnitMixedModeAllowed,false);
  assert.equal(s.crossUnitMixedModeAllowed,false);
});

test("Q014 preflight is planning-only and ready only for separate implementation approval",()=>{
  assert.equal(pre.q014ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(pre.q014ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(pre.preflightDecision.executableRuntimeReadbackRequiredBeforeMerge,false);
  assert.equal(pre.preflightDecision.exactRuntimeMappingBound,true);
  assert.equal(pre.preflightDecision.exactR05AssignmentBound,true);
  assert.equal(pre.preflightDecision.exactPrerequisiteGraphBound,true);
  assert.equal(pre.preflightDecision.sourceAuthoritySufficientForQ014ImplementationPlanning,true);
  assert.equal(pre.preflightDecision.newSupplementaryEvidenceRequired,false);
  assert.equal(pre.preflightDecision.separateImplementationApprovalRequired,true);
  assert.equal(pre.preflightDecision.nextTask,"P07F_W7DirectProductVerticalSlice014Implementation");
});
