import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p07f/q008-g5b-u08-ratio-fraction-decimal-percent-conversion-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-05.json");
const KP="kp_g5b_u08_ratio_fraction_decimal_percent_conversion";

test("W7 Q008 preflight binds the frozen eighth queue slice after Q007 D0",()=>{
  const result=materializeP07EW7DirectProductVerticalSliceQueue(),slice=result.queueEntries[7];
  assert.ok(["PREFLIGHT_MATERIALIZED_AWAITING_EXECUTABLE_RUNTIME_READBACK","PASS_SOURCE_AUTHORITY_PREFLIGHT"].includes(p.status));
  assert.equal(result.queueEntries.length,26);assert.equal(result.queueRegistryParity,true);
  assert.equal(slice.queuePosition,8);
  assert.equal(slice.sliceId,"p07e_q008_r9_g5b_u08_5b08_profile_ratio_percent_c1");
  assert.equal(slice.implementationTaskId,"P07F_W7DirectProductVerticalSlice008Implementation");
  assert.equal(slice.previousSliceId,"p07e_q007_r8_g6a_u09_6a09_profile_quantity_measurement_c1");
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.primarySourceNodeId,"g5b_u08_5b08");
  assert.ok(slice.supportingSourceNodeIds.includes("g5b_u08_5b08"));
  assert.equal(slice.intraWavePrerequisiteRank,9);
  assert.equal(slice.primaryRuntimeProfileId,"profile_ratio_percent");
  assert.ok(slice.knowledgePointIds.includes(KP));
  assert.equal(p.predecessorD0Evidence.q007Status,"PASS_E6_D0_COMPLETE");
  assert.equal(p.predecessorD0Evidence.q007PostMergeWorkflowRunId,35682529386);
});

test("W7 Q008 binds reviewed conversion candidate to immutable PDF and current direct page-1 evidence",()=>{
  const source=r02.sourceRecords.find(row=>row.sourceNodeId==="g5b_u08_5b08");assert.ok(source);
  const target=source.candidates.find(row=>row.knowledgePointId===KP);assert.ok(target);
  assert.equal(target.canonicalNameZh,"分數小數百分率互換");
  assert.equal(target.capabilityStatement,"學生能在分數、小數與百分率間轉換。");
  assert.equal(target.reasoningInvariant,"三種表示須代表相同部分占全體的比率。");
  assert.deepEqual(target.evidencePages,[1,2]);
  assert.equal(p.sourceAuthority.sourcePdfDriveFileId,"1k6bQoFDRjVNtHwOXPlD5Op9dnD5RpPrw");
  assert.equal(p.sourceAuthority.sourcePdfSizeBytes,716229);
  assert.equal(p.sourceAuthority.sourcePdfSha256,"5f170aa99ab3a8bde561a8c6bf0cbacce5fc368ab4ea5c9a89ddbc6e0e45c9e7");
  const v=p.sourceAuthority.currentVisualReadbackAuthority.q008DirectVisualEvidence;
  assert.equal(v.ratioAsDecimalVisible,true);
  assert.equal(v.percentSymbolIdentityVisible,true);
  assert.equal(v.decimalToPercentVisible,true);
  assert.equal(v.percentToDecimalVisible,true);
  assert.equal(v.fractionPercentInterconversionVisible,true);
  assert.equal(v.percentAbove100DirectlyVisible,true);
  assert.equal(p.sourceAuthority.evidenceResolution.currentVisualSupportLevel,"DIRECT_LITERAL_FRACTION_DECIMAL_PERCENT_INTERCONVERSION");
  assert.equal(p.sourceAuthority.auxiliaryDriveMetadata.verificationNotesStatus,"pending");
  assert.equal(p.sourceAuthority.sourceIdentityArtifactLock.sourceRefAmbiguity,false);
});

test("W7 Q008 runtime readback resolves the frozen ratio-percent profile without reclassification",()=>{
  const r04=getR04KnowledgePointCapabilityMapping(KP),r05=getR05DeliveryWaveAssignment(KP);
  assert.ok(r04);assert.ok(r05);
  assert.equal(r04.primaryRuntimeProfileId,"profile_ratio_percent");
  assert.equal(r05.primaryRuntimeProfileId,"profile_ratio_percent");
  assert.equal(r05.deliveryWaveId,"R05-W7");
  assert.equal(r05.intraWavePrerequisiteRank,9);
  assert.equal(p.runtimeCapabilityAuthority.runtimeProfileReclassificationAllowed,false);
});

test("W7 Q008 semantic lock owns representation equivalence only and protects rate/quantity/application siblings",()=>{
  const s=p.semanticProfileLock.implementationSemanticLock;
  assert.equal(p.semanticProfileLock.targetSemanticCore,"FRACTION_DECIMAL_PERCENT_REPRESENT_THE_SAME_RATIO");
  assert.equal(s.fractionRepresentationRequired,true);
  assert.equal(s.decimalRepresentationRequired,true);
  assert.equal(s.percentRepresentationRequired,true);
  assert.equal(s.representationValueEquivalenceRequired,true);
  assert.equal(s.fractionToDecimalAllowed,true);
  assert.equal(s.decimalToFractionAllowed,true);
  assert.equal(s.decimalToPercentAllowed,true);
  assert.equal(s.percentToDecimalAllowed,true);
  assert.equal(s.fractionToPercentAllowed,true);
  assert.equal(s.percentToFractionAllowed,true);
  assert.equal(s.percentMayExceed100,true);
  assert.equal(s.percentIdentityOnePercentEqualsOneOverHundred,true);
  assert.equal(s.findPercentageRateFromTwoQuantitiesAllowed,false);
  assert.equal(s.percentageOfQuantityAllowed,false);
  assert.equal(s.findBaseQuantityAllowed,false);
  assert.equal(s.discountIncreaseApplicationAllowed,false);
  assert.equal(s.roleBasedBaseComparisonQuantityTeachingAllowed,false);
  assert.equal(s.applicationContextAllowed,false);
  assert.equal(s.sameUnitMixedModeAllowed,false);
  assert.equal(s.crossUnitMixedModeAllowed,false);
});

test("W7 Q008 preflight remains planning-only SHARED_RUNTIME_BOUNDED",()=>{
  const impact=read("data/project/change-impact/P07F_W7_Q008_PREFLIGHT.impact.json");
  const validation=read("data/project/validation-plans/P07F_W7_Q008_PREFLIGHT.validation.json");
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.equal(impact.scopeGuards.publicAdmission,false);
  assert.equal(p.q008ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q008ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(validation.lanes.SHARED_RUNTIME_BOUNDED[1].runtime,"NODE_ONLY");
  assert.equal(p.preflightValidationBoundary.fullRepositoryRegressionAllowed,false);
  assert.equal(p.preflightValidationBoundary.globalBrowserReplayAllowed,false);
});
