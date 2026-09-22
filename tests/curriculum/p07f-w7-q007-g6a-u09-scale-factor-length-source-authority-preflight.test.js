import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p07f/q007-g6a-u09-scale-factor-length-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-07.json");
const KP="kp_g6a_u09_scale_factor_length";

test("W7 Q007 preflight binds exact seventh frozen queue slice after Q006 D0",()=>{
  const result=materializeP07EW7DirectProductVerticalSliceQueue(),slice=result.queueEntries[6];
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(result.queueEntries.length,26);assert.equal(result.queueRegistryParity,true);
  assert.equal(slice.queuePosition,7);
  assert.equal(slice.sliceId,"p07e_q007_r8_g6a_u09_6a09_profile_quantity_measurement_c1");
  assert.equal(slice.implementationTaskId,"P07F_W7DirectProductVerticalSlice007Implementation");
  assert.equal(slice.previousSliceId,"p07e_q006_r8_g6a_u06_6a06_profile_geometry_formula_c1");
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.primarySourceNodeId,"g6a_u09_6a09");
  assert.deepEqual(slice.supportingSourceNodeIds,["g6a_u09_6a09"]);
  assert.equal(slice.intraWavePrerequisiteRank,8);
  assert.equal(slice.primaryRuntimeProfileId,"profile_quantity_measurement");
  assert.deepEqual(slice.knowledgePointIds,[KP]);
  assert.equal(p.predecessorD0Evidence.q006Status,"PASS_E6_D0_COMPLETE");
  assert.equal(p.predecessorD0Evidence.q006MergeSha,"4d045d7d745996b8a13dce4bb109b902b440f50d");
  assert.equal(p.predecessorD0Evidence.q006PostMergeWorkflowRunId,35677439612);
});

test("W7 Q007 binds reviewed length-scale candidate to immutable PDF and current direct visual evidence",()=>{
  const source=r02.sourceRecords.find(row=>row.sourceNodeId==="g6a_u09_6a09");assert.ok(source);
  const target=source.candidates.find(row=>row.knowledgePointId===KP);assert.ok(target);
  assert.equal(target.canonicalNameZh,"放大縮小倍數與邊長");
  assert.equal(target.capabilityStatement,"學生能依比例倍數求對應邊長。");
  assert.equal(target.reasoningInvariant,"所有對應長度必須乘同一非零比例因子。");
  assert.deepEqual(target.evidencePages,[1]);
  assert.equal(p.sourceAuthority.sourcePdfDriveFileId,"1qnZyEDcmOgb94BYU350cmjvUN4kESlEZ");
  assert.equal(p.sourceAuthority.sourcePdfSizeBytes,244370);
  assert.equal(p.sourceAuthority.sourcePdfSha256,"80ec4d8df9a4d5bf98392cf846fac7df68c49781ba60eefa78e70e9109cbbe2c");
  assert.equal(p.sourceAuthority.currentVisualReadbackAuthority.q007DirectVisualEvidence.directScaleFactorQuestionVisible,true);
  assert.deepEqual(p.sourceAuthority.currentVisualReadbackAuthority.q007DirectVisualEvidence.visibleCorrespondingLengthPairs,[{redLength:12,blueLength:8},{redLength:6,blueLength:4}]);
  assert.equal(p.sourceAuthority.evidenceResolution.currentVisualSupportLevel,"DIRECT_LITERAL_SCALE_FACTOR_LENGTH_RELATION");
  assert.equal(p.sourceAuthority.auxiliaryDriveMetadata.verificationNotesStatus,"pending");
  assert.equal(p.sourceAuthority.auxiliaryDriveMetadata.authorityTreatment,"STALE_AUXILIARY_NOTES_PRESERVED_NOT_USED_TO_OVERRIDE_LATER_R02_AND_CURRENT_VISUAL_READBACK");
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.sourceRefAmbiguity,false);
});

test("W7 Q007 runtime readback resolves the frozen quantity-measurement profile without reclassification",()=>{
  const r04=getR04KnowledgePointCapabilityMapping(KP),r05=getR05DeliveryWaveAssignment(KP);
  assert.ok(r04);assert.ok(r05);
  assert.equal(r04.primaryRuntimeProfileId,"profile_quantity_measurement");
  assert.equal(r05.primaryRuntimeProfileId,"profile_quantity_measurement");
  assert.deepEqual(p.runtimeCapabilityAuthority.executableR04Mapping,{primaryRuntimeProfileId:r04.primaryRuntimeProfileId,classificationRuleId:r04.classificationRuleId,appliedModifierIds:[...r04.appliedModifierIds],requiredRuntimeCapabilityIds:[...r04.requiredRuntimeCapabilityIds],optionalRuntimeCapabilityIds:[...r04.optionalRuntimeCapabilityIds],forbiddenRuntimeCapabilityIds:[...r04.forbiddenRuntimeCapabilityIds]});
  assert.deepEqual(p.r05AssignmentAuthority.exactR05Assignment,{baseDeliveryWaveId:r05.baseDeliveryWaveId,deliveryWaveId:r05.deliveryWaveId,waveEscalatedByPrerequisite:r05.waveEscalatedByPrerequisite,prerequisiteWaveLowerBound:r05.prerequisiteWaveLowerBound,intraWavePrerequisiteRank:r05.intraWavePrerequisiteRank});
  assert.equal(p.runtimeCapabilityAuthority.exactR04MappingVerified,true);
  assert.equal(p.r05AssignmentAuthority.exactR05AssignmentVerified,true);
  assert.equal(r05.deliveryWaveId,"R05-W7");
  assert.equal(r05.intraWavePrerequisiteRank,8);
  assert.equal(p.runtimeCapabilityAuthority.runtimeProfileReclassificationAllowed,false);
});

test("W7 Q007 semantic lock owns corresponding-length scale factor only while protecting sibling source concepts",()=>{
  const s=p.semanticProfileLock.implementationSemanticLock;
  assert.equal(p.semanticProfileLock.targetSemanticCore,"CORRESPONDING_LENGTHS_SHARE_ONE_POSITIVE_NONZERO_SCALE_FACTOR");
  assert.equal(s.equivalentRatioPrerequisiteRequired,true);
  assert.deepEqual(p.prerequisiteGraphAuthority.requiredPrerequisiteKnowledgePointIds,["kp_g6a_u05_equivalent_ratio"]);
  assert.equal(p.prerequisiteGraphAuthority.equivalentRatioPrerequisiteRequired,true);
  assert.equal(s.correspondingLengthRolesRequired,true);
  assert.equal(s.oneCommonScaleFactorAcrossAllCorrespondingLengthsRequired,true);
  assert.equal(s.scaleFactorMustBePositive,true);assert.equal(s.scaleFactorMustBeNonzero,true);
  assert.equal(s.enlargementFactorGreaterThanOneAllowed,true);assert.equal(s.reductionFactorBetweenZeroAndOneAllowed,true);
  assert.equal(s.scaleFactorMayBeFractionOrDecimal,true);
  assert.equal(s.computeTargetLengthFromKnownCorrespondingLengthAndScaleFactorAllowed,true);
  assert.equal(s.inferScaleFactorFromOneCorrespondingLengthPairAllowed,true);
  assert.equal(s.verifySameScaleFactorAcrossMultipleCorrespondingLengthPairsAllowed,true);
  assert.equal(s.sameUnitLengthPairOnlyForInitialGenerator,true);
  assert.equal(s.unitConversionAllowed,false);
  assert.equal(s.anglePreservationTeachingAllowed,false);
  assert.equal(s.scaleDrawingConstructionAllowed,false);
  assert.equal(s.mapScaleDistanceAllowed,false);
  assert.equal(s.scaleAreaChangeAllowed,false);
  assert.equal(s.mapScaleBarInterpretationAllowed,false);
  assert.equal(s.applicationContextAllowed,false);
  assert.equal(s.sameUnitMixedModeAllowed,false);
  assert.equal(s.crossUnitMixedModeAllowed,false);
});

test("W7 Q007 preflight stays planning-only SHARED_RUNTIME_BOUNDED",()=>{
  const impact=read("data/project/change-impact/P07F_W7_Q007_PREFLIGHT.impact.json");
  const validation=read("data/project/validation-plans/P07F_W7_Q007_PREFLIGHT.validation.json");
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.equal(impact.scopeGuards.publicAdmission,false);
  assert.equal(p.q007ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q007ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(validation.lanes.SHARED_RUNTIME_BOUNDED[1].runtime,"NODE_ONLY");
  assert.equal(p.preflightValidationBoundary.fullRepositoryRegressionAllowed,false);
  assert.equal(p.preflightValidationBoundary.globalBrowserReplayAllowed,false);
});
