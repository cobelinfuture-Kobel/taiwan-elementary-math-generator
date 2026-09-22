import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p07f/q010-g6a-u06-semicircle-perimeter-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-07.json");
const KP="kp_g6a_u06_semicircle_perimeter";

test("W7 Q010 provisional preflight binds frozen tenth queue slice after Q009 D0",()=>{
  const result=materializeP07EW7DirectProductVerticalSliceQueue(),slice=result.queueEntries[9];
  assert.equal(result.queueEntries.length,26);assert.equal(result.queueRegistryParity,true);
  assert.equal(slice.queuePosition,10);
  assert.equal(slice.sliceId,"p07e_q010_r9_g6a_u06_6a06_profile_geometry_formula_c1");
  assert.equal(slice.implementationTaskId,"P07F_W7DirectProductVerticalSlice010Implementation");
  assert.equal(slice.previousSliceId,"p07e_q009_r9_g6a_u05_6a05_profile_ratio_percent_c1");
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.primarySourceNodeId,"g6a_u06_6a06");
  assert.ok(slice.supportingSourceNodeIds.includes("g6a_u06_6a06"));
  assert.equal(slice.intraWavePrerequisiteRank,9);
  assert.equal(slice.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.deepEqual(slice.knowledgePointIds,[KP]);
  assert.deepEqual(slice.requiredW7CapabilityIds,[]);
  assert.equal(p.predecessorD0Evidence.q009Status,"PASS_E6_D0_COMPLETE");
  assert.equal(p.predecessorD0Evidence.q009PostMergeWorkflowRunId,35740000242);
});

test("W7 Q010 binds R02 semicircle perimeter candidate to existing full-page visual authority",()=>{
  const source=r02.sourceRecords.find(row=>row.sourceNodeId==="g6a_u06_6a06");assert.ok(source);
  const target=source.candidates.find(row=>row.knowledgePointId===KP);assert.ok(target);
  assert.equal(target.canonicalNameZh,"半圓周長");
  assert.equal(target.capabilityStatement,"學生能將半圓弧長與直徑相加求周長。");
  assert.equal(target.reasoningInvariant,"半圓周長包含半個圓周與一條直徑。");
  assert.deepEqual(target.evidencePages,[1,2]);
  assert.equal(p.sourceAuthority.sourcePdfDriveFileId,"1kUsHZcQ9pyLNyBc6bduLb7UOnQPUFmOk");
  assert.equal(p.sourceAuthority.sourcePdfSizeBytes,644331);
  assert.equal(p.sourceAuthority.sourcePdfSha256,"e21d00e73df47d6ce7ae2d8d1dd2e8cbed04380a45ece38bc4d4df7fe08ebcf4");
  assert.ok(p.sourceAuthority.currentVisualReadbackAuthority.page1VisibleFamilies.includes("SEMICIRCLE_PERIMETER"));
  assert.ok(p.sourceAuthority.currentVisualReadbackAuthority.page2VisibleFamilies.includes("SEMICIRCLE_ARC_COMPOSITION"));
  assert.deepEqual(p.sourceAuthority.directEvidence.r02TargetEvidencePages,[1,2]);
  assert.deepEqual(p.sourceAuthority.directEvidence.currentVisualDirectSupportingPages,[1,2]);
  assert.equal(p.sourceAuthority.directEvidence.semanticConflictDetected,false);
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.sourceRefAmbiguity,false);
});

test("W7 Q010 provisional semantic lock owns semicircle boundary only",()=>{
  const s=p.semanticProfileLock.implementationSemanticLock;
  assert.equal(p.semanticProfileLock.targetSemanticCore,"SEMICIRCLE_PERIMETER_EQUALS_HALF_CIRCUMFERENCE_PLUS_DIAMETER");
  assert.equal(s.q006CircleCircumferenceFormulaPrerequisiteRequired,true);
  assert.equal(s.semicircleBoundaryMustIncludeArcAndDiameter,true);
  assert.equal(s.halfCircumferenceArcRequired,true);
  assert.equal(s.diameterStraightEdgeRequired,true);
  assert.equal(s.addDiameterToArcRequired,true);
  assert.equal(s.q004PiRelationTeachingReownershipAllowed,false);
  assert.equal(s.q006CircleCircumferenceFormulaTeachingReownershipAllowed,false);
  assert.equal(s.sectorArcLengthAllowed,false);
  assert.equal(s.compositeArcPerimeterAllowed,false);
  assert.equal(s.sameUnitMixedModeAllowed,false);
  assert.equal(s.crossUnitMixedModeAllowed,false);
  assert.deepEqual(p.sameSourceQueueAuthority.exactPriorSlices.map(x=>x.queuePosition),[4,6]);
  assert.deepEqual(p.sameSourceQueueAuthority.exactFutureSlices,[]);
  assert.equal(p.sameSourceQueueAuthority.q010ClosesFrozenSameSourceCandidateSet,true);
});

test("W7 Q010 provisional preflight remains planning-only SHARED_RUNTIME_BOUNDED",()=>{
  const impact=read("data/project/change-impact/P07F_W7_Q010_PREFLIGHT.impact.json");
  const validation=read("data/project/validation-plans/P07F_W7_Q010_PREFLIGHT.validation.json");
  assert.equal(p.status,"PREFLIGHT_EXECUTABLE_READBACK_PENDING");
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.equal(impact.scopeGuards.publicAdmission,false);
  assert.equal(p.q010ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q010ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(validation.lanes.SHARED_RUNTIME_BOUNDED[1].runtime,"NODE_ONLY");
  assert.equal(p.preflightDecision.executableRuntimeReadbackRequiredBeforeMerge,true);
});
