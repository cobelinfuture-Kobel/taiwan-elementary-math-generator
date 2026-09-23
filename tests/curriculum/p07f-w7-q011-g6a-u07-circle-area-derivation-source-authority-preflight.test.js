import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p07f/q011-g6a-u07-circle-area-derivation-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-07.json");
const KP="kp_g6a_u07_circle_area_derivation";

test("W7 Q011 preflight binds frozen eleventh queue identity after Q010 D0",()=>{
  const result=materializeP07EW7DirectProductVerticalSliceQueue(),slice=result.queueEntries[10];
  assert.equal(result.queueEntries.length,26);assert.equal(result.queueRegistryParity,true);
  assert.equal(slice.queuePosition,11);
  assert.equal(slice.sliceId,"p07e_q011_r9_g6a_u07_6a07_profile_geometry_formula_c1");
  assert.equal(slice.implementationTaskId,"P07F_W7DirectProductVerticalSlice011Implementation");
  assert.equal(slice.previousSliceId,"p07e_q010_r9_g6a_u06_6a06_profile_geometry_formula_c1");
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.primarySourceNodeId,"g6a_u07_6a07");
  assert.equal(slice.intraWavePrerequisiteRank,9);
  assert.equal(slice.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.ok(slice.knowledgePointIds.includes(KP));
  assert.equal(p.predecessorD0Evidence.q010Status,"PASS_E6_D0_COMPLETE");
  assert.equal(p.predecessorD0Evidence.q010PostMergeWorkflowRunId,35744406174);
});

test("W7 Q011 R02 target identity is exact but current PDF visual evidence does not show derivation",()=>{
  const source=r02.sourceRecords.find(row=>row.sourceNodeId==="g6a_u07_6a07");assert.ok(source);
  const target=source.candidates.find(row=>row.knowledgePointId===KP);assert.ok(target);
  assert.equal(target.canonicalNameZh,"圓面積剪拼推導");
  assert.equal(target.capabilityStatement,"學生能由扇形剪拼近似長方形理解公式。");
  assert.equal(target.reasoningInvariant,"剪拼保持面積，近似長方形長為半圓周、寬為半徑。");
  assert.deepEqual(target.evidencePages,[1,2]);
  assert.equal(p.sourceAuthority.sourcePdfDriveFileId,"1mPMMJVgnBrbghylTKnlWL3nnjX9MPIYQ");
  assert.equal(p.sourceAuthority.sourcePdfSizeBytes,523526);
  assert.equal(p.sourceAuthority.sourcePdfSha256,"e4290341b2ddc3c3dd4a675272b2c77932748548fe89edef88e3dc799fa81648");
  assert.deepEqual(p.sourceAuthority.currentVisualReadbackAuthority.reviewedPages,[1,2]);
  assert.equal(p.sourceAuthority.currentVisualReadbackAuthority.targetVisualFamilyPresent,false);
  assert.deepEqual(p.sourceAuthority.currentVisualReadbackAuthority.currentVisualDirectSupportingPages,[]);
  assert.equal(p.sourceAuthority.directEvidenceAssessment.r02ClaimsDirectCandidate,true);
  assert.equal(p.sourceAuthority.directEvidenceAssessment.currentPdfDirectlySupportsTarget,false);
  assert.equal(p.sourceAuthority.directEvidenceAssessment.semanticConflictDetected,true);
  assert.equal(p.sourceAuthority.directEvidenceAssessment.manualSourceEvidenceSelectionRequired,true);
});

test("W7 Q011 runtime identity remains geometry-formula W7 while source evidence gate stays closed",()=>{
  const r04=getR04KnowledgePointCapabilityMapping(KP),r05=getR05DeliveryWaveAssignment(KP);
  assert.ok(r04);assert.ok(r05);
  assert.equal(r04.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.equal(r04.classificationRuleId,"rule_geometry_formula");
  assert.deepEqual([...r04.appliedModifierIds],[]);
  assert.equal(r05.deliveryWaveId,"R05-W7");
  assert.equal(r05.intraWavePrerequisiteRank,9);
  assert.equal(p.runtimeCapabilityAuthority.runtimeProfileReclassificationAllowed,false);
  assert.equal(p.semanticProfileLock.present,false);
  assert.equal(p.semanticProfileLock.implementationSemanticLockAllowed,false);
});

test("W7 Q011 preflight fails closed instead of inventing a derivation source family",()=>{
  assert.equal(p.status,"BLOCKED_SOURCE_EVIDENCE_MISMATCH_REQUIRES_OPERATOR_SOURCE_EVIDENCE_SELECTION");
  assert.equal(p.preflightDecision.sourceAuthoritySufficientForQ011ImplementationPlanning,false);
  assert.equal(p.preflightDecision.currentVisualReadbackDirectlySupportsTarget,false);
  assert.equal(p.preflightDecision.manualEvidenceChoiceRequired,true);
  assert.equal(p.preflightDecision.implementationMayProceed,false);
  assert.equal(p.q011ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q011ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(p.q011ScopeLock.sourceEvidenceRepairAllowedByThisPreflight,false);
});

test("W7 Q011 blocked preflight remains SHARED_RUNTIME_BOUNDED planning-only",()=>{
  const impact=read("data/project/change-impact/P07F_W7_Q011_PREFLIGHT.impact.json");
  const validation=read("data/project/validation-plans/P07F_W7_Q011_PREFLIGHT.validation.json");
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.equal(impact.scopeGuards.publicAdmission,false);
  assert.equal(impact.scopeGuards.driveSourceMutation,false);
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(validation.lanes.SHARED_RUNTIME_BOUNDED[1].runtime,"NODE_ONLY");
  assert.equal(p.preflightValidationBoundary.fullRepositoryRegressionAllowed,false);
  assert.equal(p.preflightValidationBoundary.globalBrowserReplayAllowed,false);
});
