import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p07f/q006-g6a-u06-circle-circumference-formula-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-07.json");
const KP="kp_g6a_u06_circle_circumference_formula";

test("W7 Q006 preflight binds exact sixth frozen queue slice after Q005 D0",()=>{
  const result=materializeP07EW7DirectProductVerticalSliceQueue(),slice=result.queueEntries[5];
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(result.queueEntries.length,26);assert.equal(result.queueRegistryParity,true);
  assert.equal(slice.queuePosition,6);
  assert.equal(slice.sliceId,"p07e_q006_r8_g6a_u06_6a06_profile_geometry_formula_c1");
  assert.equal(slice.implementationTaskId,"P07F_W7DirectProductVerticalSlice006Implementation");
  assert.equal(slice.previousSliceId,"p07e_q005_r8_g6a_u05_6a05_profile_factor_multiple_c1");
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.primarySourceNodeId,"g6a_u06_6a06");
  assert.deepEqual(slice.supportingSourceNodeIds,["g6a_u06_6a06"]);
  assert.equal(slice.intraWavePrerequisiteRank,8);
  assert.equal(slice.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.deepEqual(slice.knowledgePointIds,[KP]);
  assert.deepEqual(slice.requiredW7CapabilityIds,[]);
  assert.equal(p.predecessorD0Evidence.q005Status,"PASS_E6_D0_COMPLETE");
  assert.equal(p.predecessorD0Evidence.q005PostMergeWorkflowRunAttempt,2);
});

test("W7 Q006 binds reviewed circumference-formula candidate and preserves current visual evidence limits",()=>{
  const source=r02.sourceRecords.find(row=>row.sourceNodeId==="g6a_u06_6a06");assert.ok(source);
  const target=source.candidates.find(row=>row.knowledgePointId===KP);assert.ok(target);
  assert.equal(target.canonicalNameZh,"圓周長公式");
  assert.equal(target.capabilityStatement,"學生能用直徑乘圓周率或半徑乘2乘圓周率求圓周長。");
  assert.equal(target.reasoningInvariant,"直徑等於兩倍半徑，兩種公式必須等值。");
  assert.deepEqual(target.evidencePages,[1,2]);
  assert.equal(p.sourceAuthority.sourcePdfDriveFileId,"1kUsHZcQ9pyLNyBc6bduLb7UOnQPUFmOk");
  assert.equal(p.sourceAuthority.sourcePdfSha256,"e21d00e73df47d6ce7ae2d8d1dd2e8cbed04380a45ece38bc4d4df7fe08ebcf4");
  assert.equal(p.sourceAuthority.currentVisualReadbackAuthority.literalCircleCircumferenceFormulaStatementVisiblyAsserted,false);
  assert.equal(p.sourceAuthority.evidenceResolution.currentVisualSupportLevel,"CIRCUMFERENCE_APPLICATION_CONTEXT_VISIBLE_FORMULA_LITERAL_NOT_ASSERTED");
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.sourceRefAmbiguity,false);
});

test("W7 Q006 runtime readback resolves the frozen geometry-formula profile without reclassification",()=>{
  const r04=getR04KnowledgePointCapabilityMapping(KP),r05=getR05DeliveryWaveAssignment(KP);
  assert.ok(r04);assert.ok(r05);
  assert.equal(r04.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.equal(r05.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.deepEqual(p.runtimeCapabilityAuthority.executableR04Mapping,{primaryRuntimeProfileId:r04.primaryRuntimeProfileId,classificationRuleId:r04.classificationRuleId,appliedModifierIds:[...r04.appliedModifierIds],requiredRuntimeCapabilityIds:[...r04.requiredRuntimeCapabilityIds],optionalRuntimeCapabilityIds:[...r04.optionalRuntimeCapabilityIds],forbiddenRuntimeCapabilityIds:[...r04.forbiddenRuntimeCapabilityIds]});
  assert.deepEqual(p.r05AssignmentAuthority.exactR05Assignment,{baseDeliveryWaveId:r05.baseDeliveryWaveId,deliveryWaveId:r05.deliveryWaveId,waveEscalatedByPrerequisite:r05.waveEscalatedByPrerequisite,prerequisiteWaveLowerBound:r05.prerequisiteWaveLowerBound,intraWavePrerequisiteRank:r05.intraWavePrerequisiteRank});
  assert.equal(p.runtimeCapabilityAuthority.exactR04MappingVerified,true);
  assert.equal(p.r05AssignmentAuthority.exactR05AssignmentVerified,true);
  assert.equal(r05.deliveryWaveId,"R05-W7");
  assert.equal(r05.intraWavePrerequisiteRank,8);
  assert.equal(p.runtimeCapabilityAuthority.runtimeProfileReclassificationAllowed,false);
});

test("W7 Q006 semantic lock owns C=pi*d / 2*pi*r circumference evaluation while protecting Q004 and Q010",()=>{
  const s=p.semanticProfileLock.implementationSemanticLock;
  assert.equal(p.semanticProfileLock.targetSemanticCore,"CIRCLE_CIRCUMFERENCE_FROM_DIAMETER_OR_RADIUS_FORMULA");
  assert.equal(s.q004PiCircumferenceRelationPrerequisiteRequired,true);
  assert.equal(s.multiplicationPrerequisiteRequired,true);
  assert.deepEqual(p.prerequisiteGraphAuthority.requiredPrerequisiteKnowledgePointIds,["kp_g4a_u02_2digit_by_2digit","kp_g6a_u06_pi_circumference_relation"]);
  assert.equal(p.prerequisiteGraphAuthority.multiplicationPrerequisiteRequired,true);
  assert.equal(p.prerequisiteGraphAuthority.q004PiCircumferenceRelationPrerequisiteRequired,true);
  assert.equal(s.diameterFormulaRequired,"C = π × d");
  assert.equal(s.radiusFormulaRequired,"C = 2 × π × r");
  assert.equal(s.diameterEqualsTwoRadiusRequired,true);
  assert.equal(s.twoFormulaEquivalenceRequired,true);
  assert.equal(s.solveCircumferenceFromDiameterAllowed,true);
  assert.equal(s.solveCircumferenceFromRadiusAllowed,true);
  assert.equal(s.solveDiameterFromCircumferenceAllowed,false);
  assert.equal(s.solveRadiusFromCircumferenceAllowed,false);
  assert.equal(s.q004PiRelationTeachingReownershipAllowed,false);
  assert.equal(s.semicirclePerimeterAllowed,false);
  assert.equal(s.sectorArcLengthAllowed,false);
  assert.equal(s.compositeArcPerimeterAllowed,false);
  assert.equal(s.rollingWheelDistanceApplicationAllowed,false);
  assert.equal(s.applicationContextAllowed,false);
});

test("W7 Q006 preflight remains planning-only SHARED_RUNTIME_BOUNDED",()=>{
  const impact=read("data/project/change-impact/P07F_W7_Q006_PREFLIGHT.impact.json");
  const validation=read("data/project/validation-plans/P07F_W7_Q006_PREFLIGHT.validation.json");
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.equal(impact.scopeGuards.publicAdmission,false);
  assert.equal(p.q006ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q006ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(validation.lanes.SHARED_RUNTIME_BOUNDED[1].runtime,"NODE_ONLY");
  assert.equal(p.preflightValidationBoundary.fullRepositoryRegressionAllowed,false);
  assert.equal(p.preflightValidationBoundary.globalBrowserReplayAllowed,false);
});
