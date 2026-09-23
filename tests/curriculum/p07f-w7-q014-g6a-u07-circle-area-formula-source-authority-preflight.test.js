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

test("Q014 discovery preflight binds exact frozen row and Q013 D0",()=>{
  const row=materializeP07EW7DirectProductVerticalSliceQueue().queueEntries[13];
  assert.equal(pre.queueAuthority.queuePosition,14);
  assert.equal(row.sliceId,"p07e_q014_r10_g6a_u07_6a07_profile_geometry_formula_c1");
  assert.deepEqual([...row.knowledgePointIds],[KP]);
  assert.deepEqual(pre.queueAuthority.knowledgePointIds,[KP]);
  assert.equal(pre.predecessorD0Evidence.q013Status,"PASS_E6_D0_COMPLETE");
});

test("Q014 exact original PDF visual readback operationally supports circle-area formula",()=>{
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
  assert.equal(d.diameterToRadiusWitnessPresent,true);
  assert.equal(d.directSupportClassification,"DIRECT_OPERATIONAL_FORMULA_APPLICATION_EVIDENCE");
  assert.equal(s.existingSupplementaryEvidenceCorroboration.requiredForQ014SourceSufficiency,false);
  assert.equal(s.existingSupplementaryEvidenceCorroboration.consumedAsQ014RequiredAuthority,false);
});

test("Q014 binds exact R02 candidate and protects Q011 derivation plus Q017 annulus ownership",()=>{
  const src=r02.sourceRecords.find(x=>x.sourceNodeId==="g6a_u07_6a07");assert.ok(src);
  const target=src.candidates.find(x=>x.knowledgePointId===KP);assert.ok(target);
  assert.deepEqual(pre.r02ReviewedCandidateAuthority.targetCandidate,target);
  assert.equal(pre.r02ReviewedCandidateAuthority.predecessorOwnedKnowledgePointRows[0].knowledgePointId,"kp_g6a_u07_circle_area_derivation");
  assert.equal(pre.r02ReviewedCandidateAuthority.protectedFutureQueueOwnership[0].knowledgePointIds[0],"kp_g6a_u07_annulus_area");
  assert.deepEqual(pre.r02ReviewedCandidateAuthority.sourceSiblingNotOwnedByQ014,["kp_g6a_u07_sector_area","kp_g6a_u07_composite_circle_area"]);
});

test("Q014 semantic lock owns pi-r-squared production but not derivation or later circle-area families",()=>{
  const s=pre.semanticProfileLock;
  assert.equal(s.present,true);
  assert.equal(s.targetSemanticCore,"CIRCLE_AREA_FORMULA_EVALUATION_PI_R_SQUARED_WITH_RADIUS_DIAMETER_NORMALIZATION");
  assert.equal(s.implementationSemanticLock.circleAreaFormulaRequired,true);
  assert.equal(s.implementationSemanticLock.radiusSquaredRequired,true);
  assert.equal(s.implementationSemanticLock.diameterToRadiusNormalizationRequired,true);
  assert.equal(s.implementationSemanticLock.computeCircleAreaFromRadiusAllowed,true);
  assert.equal(s.implementationSemanticLock.computeCircleAreaFromDiameterAllowed,true);
  assert.equal(s.implementationSemanticLock.q011DerivationTeachingReownershipAllowed,false);
  assert.equal(s.implementationSemanticLock.sectorAreaAllowed,false);
  assert.equal(s.implementationSemanticLock.annulusAreaAllowed,false);
  assert.equal(s.implementationSemanticLock.compositeCircleAreaAllowed,false);
  assert.equal(s.implementationSemanticLock.sameUnitMixedModeAllowed,false);
  assert.equal(s.implementationSemanticLock.crossUnitMixedModeAllowed,false);
});

test("Q014 executable R03 R04 R05 rows exist for discovery readback",()=>{
  const r03=getR03DirectPrerequisites(KP),r04=getR04KnowledgePointCapabilityMapping(KP),r05=getR05DeliveryWaveAssignment(KP);
  assert.ok(Array.isArray(r03));assert.ok(r04);assert.ok(r05);
  assert.equal(r04.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.equal(r05.deliveryWaveId,"R05-W7");
  assert.equal(r05.intraWavePrerequisiteRank,10);
});
