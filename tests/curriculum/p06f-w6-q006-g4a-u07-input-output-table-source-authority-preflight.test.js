import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP06EW6DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p06e-w6-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const read=p=>JSON.parse(readFileSync(new URL(`../../${p}`,import.meta.url),"utf8"));
const p=read("data/curriculum/full-product/p06f/q006-g4a-u07-input-output-table-source-authority-preflight.json");
const queue=read("data/curriculum/full-product/p06e/w6-direct-product-vertical-slice-queue.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-02.json");
const profiles=read("data/curriculum/global/runtime/r04/runtime-capability-profiles.json");
const impact=read("data/project/change-impact/P06F_W6_Q006_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P06F_W6_Q006_PREFLIGHT.validation.json");
const KP="kp_g4a_u07_input_output_table_rule";
const CAPS=["cap_data_domain_validator","cap_table_data_model","cap_table_representation"];
const SLICE="p06e_q006_r1_g4a_u07_4a07_profile_table_data_c1";

test("W6 Q006 preflight binds the exact sixth executable queue slice after Q005 D0",()=>{
  const materialized=materializeP06EW6DirectProductVerticalSliceQueue(),slice=materialized.queueEntries[5];
  assert.equal(p.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(p.queueAuthority.queueDigest,queue.queueDigest);
  assert.equal(slice.queuePosition,6);
  assert.equal(slice.sliceId,SLICE);
  assert.equal(slice.implementationTaskId,"P06F_W6DirectProductVerticalSlice006Implementation");
  assert.equal(slice.previousSliceId,queue.orderedSliceIds[4]);
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.primarySourceNodeId,"g4a_u07_4a07");
  assert.equal(slice.intraWavePrerequisiteRank,1);
  assert.equal(slice.primaryRuntimeProfileId,"profile_table_data");
  assert.deepEqual(slice.knowledgePointIds,[KP]);
  assert.deepEqual(slice.requiredW6CapabilityIds,CAPS);
  assert.equal(p.predecessorD0Evidence.prNumber,981);
  assert.equal(p.predecessorD0Evidence.mergeSha,"99e166ea0cd224d112d3a23f33a88e3481c5ea2a");
  assert.equal(p.predecessorD0Evidence.postMergeWorkflowRunId,35340723771);
  assert.equal(p.predecessorD0Evidence.liveReportStatus,"PASS_E6_D0_COMPLETE");
  assert.equal(p.predecessorD0Evidence.classicUiAcceptanceStatus,"PASS_P06F_W6_Q005_CLASSIC_UI_ACCEPTANCE");
});

test("W6 Q006 source authority binds the R02 full-page reviewed input-output-table candidate",()=>{
  const source=r02.sourceRecords.find(row=>row.sourceNodeId==="g4a_u07_4a07");
  assert.ok(source);
  const actual=source.candidates.find(row=>row.knowledgePointId===KP);
  assert.ok(actual);
  assert.equal(actual.canonicalNameZh,"輸入輸出表規則");
  assert.equal(actual.capabilityStatement,"學生能由對應表找出輸入與輸出的運算規則。");
  assert.equal(actual.reasoningInvariant,"每組輸入輸出必須符合同一個可重複運算關係。");
  assert.equal(actual.category,"pattern");
  assert.deepEqual(actual.evidencePages,[1,2]);
  assert.equal(actual.applicationSuitability,"APPLICATION_COMPATIBLE");
  assert.equal(p.sourceAuthority.sourcePdfDriveFileId,"1NKZfif1y-iujwps73SB6P6LtcdDWWdsd");
  assert.equal(p.sourceAuthority.reviewMethod,"FULL_PAGE_VISUAL_READBACK");
  assert.equal(p.sourceAuthority.driveMetadataReadback.reviewStatusUse,"STALE_METADATA_NOT_USED_AS_CURRENT_REVIEW_PROOF");
});

test("W6 Q006 locks the table-data runtime envelope without reclassifying its pattern-rule semantics",()=>{
  const profile=profiles.profiles.find(row=>row.profileId==="profile_table_data");
  assert.ok(profile);
  assert.deepEqual(profile.requiredCapabilityIds,["cap_table_data_model","cap_data_domain_validator","cap_table_representation"]);
  const mapping=getR04KnowledgePointCapabilityMapping(KP);
  assert.ok(mapping);
  assert.equal(mapping.primaryRuntimeProfileId,"profile_table_data");
  assert.equal(mapping.classificationRuleId,"rule_table_data");
  assert.deepEqual(p.runtimeCapabilityAuthority.exactFrozenQueueRequiredW6CapabilityIds,CAPS);
  assert.equal(p.semanticProfileLock.classification,"TABLE_DATA_RUNTIME_WITH_INPUT_OUTPUT_PATTERN_RULE_SEMANTICS");
  assert.equal(p.semanticProfileLock.targetSemanticCore,"INPUT_OUTPUT_TABLE_RULE");
  assert.equal(p.semanticProfileLock.implementationSemanticLock.tablePairsArePrimaryRepresentation,true);
  assert.equal(p.semanticProfileLock.implementationSemanticLock.oneConsistentOperationRuleRequired,true);
  assert.equal(p.runtimeCapabilityAuthority.patternRelationRuntimeReclassificationAllowed,false);
});

test("W6 Q006 protects Q005 predecessors and the later multiplicative and missing-term successors",()=>{
  assert.deepEqual(p.r02ReviewedCandidateAuthority.protectedPredecessorKnowledgePointIds,[
    "kp_g4a_u07_geometric_arrangement_count",
    "kp_g4a_u07_quantity_additive_pattern"
  ]);
  assert.deepEqual(p.r02ReviewedCandidateAuthority.protectedSameSourceFutureCandidates.map(x=>x.knowledgePointId),[
    "kp_g4a_u07_quantity_multiplicative_pattern",
    "kp_g4a_u07_pattern_missing_term_reasoning"
  ]);
  assert.equal(p.q006ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(p.q006ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(p.q006ScopeLock.q005ProductMutationAllowed,false);
  assert.equal(p.q006ScopeLock.q007OrLaterTouched,false);
  assert.equal(p.preflightDecision.separateImplementationApprovalRequired,true);
  assert.equal(p.preflightDecision.nextTask,"P06F_W6DirectProductVerticalSlice006Implementation");
});

test("W6 Q006 preflight remains SHARED_RUNTIME_BOUNDED and Node-only",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.changeImpact.planningAuthorityAdded,true);
  assert.equal(impact.scopeGuards.productImplementation,false);
  assert.equal(impact.scopeGuards.publicAdmission,false);
  const lane=validation.lanes.SHARED_RUNTIME_BOUNDED;
  assert.deepEqual(lane.map(row=>row.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(lane[1].runtime,"NODE_ONLY");
  assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"),false);
  assert.equal(JSON.stringify(validation).includes("PLAYWRIGHT_CHROMIUM"),false);
});
