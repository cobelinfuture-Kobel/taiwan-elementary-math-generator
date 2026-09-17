import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP06EW6DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p06e-w6-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const read=p=>JSON.parse(readFileSync(new URL(`../../${p}`,import.meta.url),"utf8"));
const text=p=>readFileSync(new URL(`../../${p}`,import.meta.url),"utf8");
const preflight=read("data/curriculum/full-product/p06f/q003-g3b-u10-one-way-table-source-authority-preflight.json");
const queue=read("data/curriculum/full-product/p06e/w6-direct-product-vertical-slice-queue.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-01.json");
const profiles=read("data/curriculum/global/runtime/r04/runtime-capability-profiles.json");
const policy=read("data/curriculum/global/runtime/r04/runtime-capability-mapping-policy.json");
const r02ProjectionSource=text("src/curriculum/global/r02-global-kp-candidate-reconciliation.mjs");
const impact=read("data/project/change-impact/P06F_W6_Q003_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P06F_W6_Q003_PREFLIGHT.validation.json");
const KP="kp_one_way_table_reading",SLICE="p06e_q003_r0_g3b_u10_3b10_profile_chart_data_c1",CAPS=["cap_chart_data_model","cap_chart_representation","cap_data_domain_validator"];

test("W6 Q003 preflight binds the exact third executable queue slice after Q002 D0",()=>{
  const materialized=materializeP06EW6DirectProductVerticalSliceQueue(),slice=materialized.queueEntries[2];
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.queueAuthority.queueDigest,queue.queueDigest);
  assert.equal(slice.queuePosition,3);assert.equal(slice.sliceId,SLICE);assert.equal(slice.implementationTaskId,"P06F_W6DirectProductVerticalSlice003Implementation");
  assert.equal(slice.previousSliceId,queue.orderedSliceIds[1]);assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.primarySourceNodeId,"g3b_u10_3b10");assert.equal(slice.intraWavePrerequisiteRank,0);assert.equal(slice.primaryRuntimeProfileId,"profile_chart_data");
  assert.deepEqual(slice.knowledgePointIds,[KP]);assert.deepEqual(slice.requiredW6CapabilityIds,CAPS);
  assert.equal(preflight.predecessorD0Evidence.prNumber,975);assert.equal(preflight.predecessorD0Evidence.mergeSha,"57012017b040c8c4c41fc5092bf7f450cfdf13ba");
  assert.equal(preflight.predecessorD0Evidence.postMergeWorkflowRunId,35288199556);assert.equal(preflight.predecessorD0Evidence.liveReportStatus,"PASS_E6_D0_COMPLETE");
});

test("W6 Q003 source authority is the one-page R02 full-page-reviewed one-way statistics table",()=>{
  const source=r02.sourceRecords.find(row=>row.sourceNodeId==="g3b_u10_3b10");assert.ok(source);
  assert.equal(source.sourceTitle,"統計表");assert.equal(source.sourcePdfTitle,"meow911_3b10_statistics_table.pdf");assert.equal(source.pageCount,1);assert.deepEqual(source.reviewedPages,[1]);
  const actual=source.candidates.find(row=>row.knowledgePointId===KP),expected=preflight.r02ReviewedCandidateAuthority.targetCandidate;assert.ok(actual);
  assert.equal(actual.canonicalNameZh,expected.canonicalNameZh);assert.equal(actual.capabilityStatement,expected.capabilityStatement);assert.equal(actual.reasoningInvariant,expected.reasoningInvariant);assert.deepEqual(actual.evidencePages,[1]);
  assert.equal(preflight.sourceAuthority.sourcePdfDriveFileId,"1JjSBJxw3dHDTwsJKcBLd7obmomNm6GjQ");assert.equal(preflight.sourceAuthority.driveMetadataFileId,"19zTjboeFu2scCwD9YibB9GmAfRqK2QlT");assert.equal(preflight.sourceAuthority.driveVerificationNotesFileId,"1nJB27UofgEr6KB3CYXa7Zn5A899f7vYS");
  assert.equal(preflight.sourceAuthority.reviewMethod,"FULL_PAGE_VISUAL_READBACK");assert.equal(preflight.sourceAuthority.ocrUsedAsAuthority,false);assert.equal(preflight.sourceAuthority.checksumStatus,"NOT_EXPOSED_BY_DRIVE_CONNECTOR");
  assert.equal(preflight.sourceAuthority.driveMetadataReadback.reviewStatusUse,"STALE_METADATA_NOT_USED_AS_CURRENT_REVIEW_PROOF");
});

test("W6 Q003 explicitly locks the historical chart-profile term collision without redefining table semantics",()=>{
  const mapping=getR04KnowledgePointCapabilityMapping(KP),profile=profiles.profiles.find(row=>row.profileId==="profile_chart_data");
  assert.ok(mapping);assert.equal(mapping.primaryRuntimeProfileId,"profile_chart_data");assert.equal(mapping.classificationRuleId,"rule_chart_data");
  assert.deepEqual(profile.requiredCapabilityIds,["cap_chart_data_model","cap_data_domain_validator","cap_chart_representation"]);
  assert.deepEqual(preflight.runtimeCapabilityAuthority.exactFrozenQueueRequiredW6CapabilityIds,CAPS);
  const chartIndex=policy.classificationRules.findIndex(row=>row.ruleId==="rule_chart_data"),tableIndex=policy.classificationRules.findIndex(row=>row.ruleId==="rule_table_data");
  assert.ok(chartIndex>=0&&tableIndex>chartIndex);
  assert.ok(policy.classificationRules[chartIndex].anyTerms.includes("圖表"));assert.ok(policy.classificationRules[tableIndex].anyTerms.includes("one_way_table"));assert.ok(policy.classificationRules[tableIndex].anyTerms.includes("統計表"));
  assert.ok(r02ProjectionSource.includes('"表圖對應"'));assert.ok(r02ProjectionSource.includes('"讀錯表格或圖表尺度"'));
  const candidate=preflight.r02ReviewedCandidateAuthority.targetCandidate;assert.equal(JSON.stringify(candidate).includes("圖表"),false);
  assert.equal(preflight.semanticProfileArtifactLock.classification,"HISTORICAL_GENERIC_DATA_PROFILE_TERM_COLLISION");
  assert.equal(preflight.semanticProfileArtifactLock.implementationSemanticLock.oneWayTableReadingIsCore,true);
  assert.equal(preflight.semanticProfileArtifactLock.implementationSemanticLock.chartConstructionIsCore,false);
  assert.equal(preflight.semanticProfileArtifactLock.implementationSemanticLock.frozenQueueMayNotBeSilentlyReclassified,true);
});

test("W6 Q003 protects Q004 and later table/chart semantics and remains planning-only",()=>{
  assert.equal(preflight.q003ScopeLock.implementationAllowedByThisPreflight,false);assert.equal(preflight.q003ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.ok(preflight.q003ScopeLock.excludedRelations.includes("TABLE_DATA_COMPARISON_AS_TARGET"));assert.ok(preflight.q003ScopeLock.excludedRelations.includes("TWO_WAY_TABLE_STRUCTURE_AS_TARGET"));
  assert.ok(preflight.q003ScopeLock.excludedRelations.includes("BAR_CHART_READING"));assert.ok(preflight.q003ScopeLock.excludedRelations.includes("CHART_SCALE_INTERPRETATION"));
  assert.equal(preflight.q003ScopeLock.q004OrLaterTouched,false);assert.equal(preflight.preflightDecision.separateImplementationApprovalRequired,true);
  assert.equal(preflight.preflightDecision.nextTask,"P06F_W6DirectProductVerticalSlice003Implementation");
});

test("W6 Q003 preflight remains SHARED_RUNTIME_BOUNDED and Node-only",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.equal(impact.changeImpact.planningAuthorityAdded,true);assert.equal(impact.scopeGuards.productImplementation,false);assert.equal(impact.scopeGuards.publicAdmission,false);
  assert.equal(validation.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");const lane=validation.lanes.SHARED_RUNTIME_BOUNDED;
  assert.deepEqual(lane.map(row=>row.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);assert.equal(lane[1].runtime,"NODE_ONLY");
  assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"),false);assert.equal(JSON.stringify(validation).includes("PLAYWRIGHT_CHROMIUM"),false);
});
