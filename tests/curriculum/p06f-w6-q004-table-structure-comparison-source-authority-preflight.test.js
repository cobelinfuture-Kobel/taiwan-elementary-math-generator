import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP06EW6DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p06e-w6-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const read=p=>JSON.parse(readFileSync(new URL(`../../${p}`,import.meta.url),"utf8"));
const text=p=>readFileSync(new URL(`../../${p}`,import.meta.url),"utf8");
const preflight=read("data/curriculum/full-product/p06f/q004-g3b-u10-table-structure-comparison-source-authority-preflight.json");
const queue=read("data/curriculum/full-product/p06e/w6-direct-product-vertical-slice-queue.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-01.json");
const profiles=read("data/curriculum/global/runtime/r04/runtime-capability-profiles.json");
const policy=read("data/curriculum/global/runtime/r04/runtime-capability-mapping-policy.json");
const r02ProjectionSource=text("src/curriculum/global/r02-global-kp-candidate-reconciliation.mjs");
const impact=read("data/project/change-impact/P06F_W6_Q004_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P06F_W6_Q004_PREFLIGHT.validation.json");
const KPS=["kp_table_data_comparison","kp_two_way_table_structure"],FUTURE=["kp_table_extrema_and_missing_value","kp_construct_two_way_table"],SLICE="p06e_q004_r1_g3b_u10_3b10_profile_chart_data_c1",CAPS=["cap_chart_data_model","cap_chart_representation","cap_data_domain_validator","cap_table_data_model"];

test("W6 Q004 preflight binds the exact fourth executable queue slice after Q003 D0",()=>{
  const materialized=materializeP06EW6DirectProductVerticalSliceQueue(),slice=materialized.queueEntries[3];
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.queueAuthority.queueDigest,queue.queueDigest);
  assert.equal(slice.queuePosition,4);
  assert.equal(slice.sliceId,SLICE);
  assert.equal(slice.implementationTaskId,"P06F_W6DirectProductVerticalSlice004Implementation");
  assert.equal(slice.previousSliceId,queue.orderedSliceIds[2]);
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.primarySourceNodeId,"g3b_u10_3b10");
  assert.equal(slice.intraWavePrerequisiteRank,1);
  assert.equal(slice.primaryRuntimeProfileId,"profile_chart_data");
  assert.deepEqual(slice.knowledgePointIds,KPS);
  assert.deepEqual(slice.requiredW6CapabilityIds,CAPS);
  assert.equal(preflight.predecessorD0Evidence.prNumber,977);
  assert.equal(preflight.predecessorD0Evidence.mergeSha,"66c7e6c40650827d1735f6fb40ac6e5f79b4e059");
  assert.equal(preflight.predecessorD0Evidence.postMergeWorkflowRunId,35292573647);
  assert.equal(preflight.predecessorD0Evidence.liveReportStatus,"PASS_E6_D0_COMPLETE");
});

test("W6 Q004 source authority binds both page-1 table candidates and no unsupported chart semantics",()=>{
  const source=r02.sourceRecords.find(row=>row.sourceNodeId==="g3b_u10_3b10");
  assert.ok(source);
  assert.equal(source.sourceTitle,"統計表");
  assert.equal(source.sourcePdfTitle,"meow911_3b10_statistics_table.pdf");
  assert.equal(source.pageCount,1);
  assert.deepEqual(source.reviewedPages,[1]);
  const actual=KPS.map(id=>source.candidates.find(row=>row.knowledgePointId===id));
  assert.ok(actual.every(Boolean));
  for(const expected of preflight.r02ReviewedCandidateAuthority.targetCandidates){
    const row=source.candidates.find(x=>x.knowledgePointId===expected.knowledgePointId);
    assert.equal(row.canonicalNameZh,expected.canonicalNameZh);
    assert.equal(row.capabilityStatement,expected.capabilityStatement);
    assert.equal(row.reasoningInvariant,expected.reasoningInvariant);
    assert.deepEqual(row.evidencePages,[1]);
    assert.equal(JSON.stringify(row).includes("圖表"),false);
  }
  assert.equal(preflight.sourceAuthority.sourcePdfDriveFileId,"1JjSBJxw3dHDTwsJKcBLd7obmomNm6GjQ");
  assert.equal(preflight.sourceAuthority.reviewMethod,"FULL_PAGE_VISUAL_READBACK");
  assert.equal(preflight.sourceAuthority.reusedFromQ003SourceAuthority,true);
  assert.equal(preflight.sourceAuthority.ocrUsedAsAuthority,false);
  assert.equal(preflight.sourceAuthority.driveMetadataReadback.reviewStatusUse,"STALE_METADATA_NOT_USED_AS_CURRENT_REVIEW_PROOF");
});

test("W6 Q004 keeps the historical chart profile as envelope while locking two table semantic cores",()=>{
  const profile=profiles.profiles.find(row=>row.profileId==="profile_chart_data");
  assert.deepEqual(profile.requiredCapabilityIds,["cap_chart_data_model","cap_data_domain_validator","cap_chart_representation"]);
  assert.deepEqual(preflight.runtimeCapabilityAuthority.exactFrozenQueueRequiredW6CapabilityIds,CAPS);
  assert.deepEqual(preflight.runtimeCapabilityAuthority.dependencyClosureCapabilityIds,["cap_table_data_model"]);
  for(const id of KPS){
    const mapping=getR04KnowledgePointCapabilityMapping(id);
    assert.ok(mapping);
    assert.equal(mapping.primaryRuntimeProfileId,"profile_chart_data");
    assert.equal(mapping.classificationRuleId,"rule_chart_data");
  }
  const chartIndex=policy.classificationRules.findIndex(row=>row.ruleId==="rule_chart_data"),tableIndex=policy.classificationRules.findIndex(row=>row.ruleId==="rule_table_data");
  assert.ok(chartIndex>=0&&tableIndex>chartIndex);
  assert.ok(r02ProjectionSource.includes('"表圖對應"'));
  assert.ok(r02ProjectionSource.includes('"讀錯表格或圖表尺度"'));
  assert.equal(preflight.semanticProfileArtifactLock.classification,"HISTORICAL_GENERIC_DATA_PROFILE_TERM_COLLISION");
  assert.equal(preflight.semanticProfileArtifactLock.implementationSemanticLock.tableComparisonIsCore,true);
  assert.equal(preflight.semanticProfileArtifactLock.implementationSemanticLock.twoWayTableStructureIsCore,true);
  assert.equal(preflight.semanticProfileArtifactLock.implementationSemanticLock.barLinePieChartReadingIsCore,false);
  assert.equal(preflight.semanticProfileArtifactLock.implementationSemanticLock.frozenQueueMayNotBeSilentlyReclassified,true);
});

test("W6 Q004 protects Q008 future table reasoning and remains planning-only",()=>{
  assert.deepEqual(preflight.q004ScopeLock.includedKnowledgePointIds,KPS);
  assert.equal(preflight.q004ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(preflight.q004ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.ok(preflight.q004ScopeLock.excludedRelations.includes("TABLE_EXTREMA_OR_MISSING_VALUE_AS_TARGET"));
  assert.ok(preflight.q004ScopeLock.excludedRelations.includes("CONSTRUCT_TWO_WAY_TABLE_AS_TARGET"));
  assert.ok(preflight.q004ScopeLock.excludedRelations.includes("BAR_CHART_READING"));
  assert.deepEqual(preflight.r02ReviewedCandidateAuthority.protectedSameSourceFutureCandidates.map(x=>x.knowledgePointId),FUTURE);
  assert.equal(preflight.q004ScopeLock.q005OrLaterTouched,false);
  assert.equal(preflight.preflightDecision.separateImplementationApprovalRequired,true);
  assert.equal(preflight.preflightDecision.nextTask,"P06F_W6DirectProductVerticalSlice004Implementation");
});

test("W6 Q004 preflight remains SHARED_RUNTIME_BOUNDED and Node-only",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.changeImpact.planningAuthorityAdded,true);
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.equal(impact.scopeGuards.publicAdmission,false);
  assert.equal(validation.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");
  const lane=validation.lanes.SHARED_RUNTIME_BOUNDED;
  assert.deepEqual(lane.map(row=>row.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(lane[1].runtime,"NODE_ONLY");
  assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"),false);
  assert.equal(JSON.stringify(validation).includes("PLAYWRIGHT_CHROMIUM"),false);
});
