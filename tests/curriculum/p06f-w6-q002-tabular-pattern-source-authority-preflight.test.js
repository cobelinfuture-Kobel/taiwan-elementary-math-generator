import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=p=>JSON.parse(readFileSync(new URL(`../../${p}`,import.meta.url),"utf8"));
const preflight=read("data/curriculum/full-product/p06f/q002-g3a-u07-tabular-pattern-source-authority-preflight.json");
const queue=read("data/curriculum/full-product/p06e/w6-direct-product-vertical-slice-queue.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-01.json");
const profiles=read("data/curriculum/global/runtime/r04/runtime-capability-profiles.json");
const caps=read("data/curriculum/global/runtime/r04/shared-runtime-capabilities.json");
const q001=read("data/curriculum/full-product/p06f/q001-g3a-u07-pattern-implementation.json");
const impact=read("data/project/change-impact/P06F_W6_Q002_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P06F_W6_Q002_PREFLIGHT.validation.json");

const KP="kp_tabular_pattern_rule";
const CAPS=["cap_data_domain_validator","cap_table_data_model","cap_table_representation"];
const SLICE="p06e_q002_r0_g3a_u07_3a07_profile_table_data_c1";

test("W6 Q002 preflight binds the exact second frozen queue successor and reuses Q001 D0 evidence",()=>{
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.queueAuthority.queueDigest,queue.queueDigest);
  assert.equal(queue.queueDigest,"9e22094dee0d66e459848741894a3347df1c985ec8720cdabb3efc2e5a68e1be");
  assert.equal(preflight.queueAuthority.queuePosition,2);
  assert.equal(preflight.queueAuthority.queueSliceCount,20);
  assert.equal(queue.orderedSliceIds[1],SLICE);
  assert.equal(queue.orderedImplementationTaskIds[1],"P06F_W6DirectProductVerticalSlice002Implementation");
  assert.equal(queue.orderedKnowledgePointIds[3],KP);
  assert.equal(preflight.queueAuthority.sliceId,SLICE);
  assert.equal(preflight.queueAuthority.previousSliceId,queue.orderedSliceIds[0]);
  assert.equal(preflight.queueAuthority.previousSliceMustBeD0Complete,true);
  assert.equal(preflight.queueAuthority.primarySourceNodeId,"g3a_u07_3a07");
  assert.equal(preflight.queueAuthority.primaryRuntimeProfileId,"profile_table_data");
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds,[KP]);
  assert.deepEqual(preflight.queueAuthority.requiredW6CapabilityIds,CAPS);
  assert.equal(preflight.predecessorD0Evidence.prNumber,973);
  assert.equal(preflight.predecessorD0Evidence.mergeSha,"cd0c4ee98994f1efd1a5dbbbd234286efc8fef62");
  assert.equal(preflight.predecessorD0Evidence.postMergeWorkflowRunId,35286547413);
  assert.equal(preflight.predecessorD0Evidence.postMergeWorkflowConclusion,"success");
  assert.equal(preflight.predecessorD0Evidence.liveReportStatus,"PASS_E6_D0_COMPLETE");
  assert.equal(preflight.predecessorD0Evidence.q002ProtectedDuringQ001,true);
  assert.equal(q001.scopeGuards.q002OrLaterTouched,false);
});

test("W6 Q002 source evidence binds the exact R02 reviewed tabular-pattern candidate",()=>{
  const source=r02.sourceRecords.find(row=>row.sourceNodeId==="g3a_u07_3a07");
  assert.ok(source);
  assert.equal(source.sourceTitle,"尋找規律");
  assert.equal(source.sourcePdfTitle,"meow911_3a07_patterns.pdf");
  assert.equal(source.pageCount,3);
  assert.deepEqual(source.reviewedPages,[1,2,3]);
  const actual=source.candidates.find(row=>row.knowledgePointId===KP);
  assert.ok(actual);
  const expected=preflight.r02ReviewedCandidateAuthority.targetCandidate;
  assert.equal(actual.canonicalNameZh,expected.canonicalNameZh);
  assert.equal(actual.capabilityStatement,expected.capabilityStatement);
  assert.equal(actual.reasoningInvariant,expected.reasoningInvariant);
  assert.deepEqual(actual.evidencePages,[1]);
  assert.equal(actual.applicationSuitability,"APPLICATION_COMPATIBLE");
  assert.equal(preflight.sourceAuthority.sourcePdfDriveFileId,"1HzOOsMf5y7R5nXWMnlulfdQlu7KG-1iv");
  assert.equal(preflight.sourceAuthority.sourcePdfSha256,"ef0a25e91ef3ef92117497ecc52ea074a5f940380b61c01f17bbbfc8401d097d");
  assert.equal(preflight.sourceAuthority.reviewMethod,"FULL_PAGE_VISUAL_READBACK");
  assert.equal(preflight.sourceAuthority.ocrUsedAsAuthority,false);
  assert.deepEqual(preflight.sourceAuthority.q002EvidenceAnchor.canonicalEvidencePages,[1]);
  assert.equal(preflight.sourceAuthority.q002EvidenceAnchor.corroboratingPreviouslyRecordedEvidence.classification,"SAME_SOURCE_CORROBORATING_EVIDENCE_NOT_A_SOURCE_REF_CONFLICT");
  assert.equal(preflight.sourceAuthority.embeddedHeaderMismatch.sourceRefAmbiguity,false);
  assert.equal(preflight.sourceAuthority.embeddedHeaderMismatch.manualSourceChoiceRequired,false);
});

test("W6 Q002 locks profile_table_data and the exact W6 capability delta without profile drift",()=>{
  const profile=profiles.profiles.find(row=>row.profileId==="profile_table_data");
  assert.ok(profile);
  assert.deepEqual(profile.requiredCapabilityIds,["cap_table_data_model","cap_data_domain_validator","cap_table_representation"]);
  assert.deepEqual(profile.optionalCapabilityIds,[]);
  assert.deepEqual(preflight.runtimeCapabilityAuthority.exactFrozenQueueRequiredW6CapabilityIds,CAPS);
  const byId=new Map(caps.capabilities.map(row=>[row.capabilityId,row]));
  for(const id of CAPS)assert.equal(byId.get(id)?.status,"contract_only",id);
  assert.equal(byId.get("cap_data_domain_validator")?.dependsOn.includes("cap_table_data_model"),true);
  assert.equal(byId.get("cap_table_representation")?.dependsOn.includes("cap_table_data_model"),true);
  assert.equal(preflight.runtimeCapabilityAuthority.chartDataModelRequiredForQ002,false);
  assert.equal(preflight.runtimeCapabilityAuthority.patternRelationReownershipAllowed,false);
  assert.equal(preflight.runtimeCapabilityAuthority.runtimeProfileReclassificationAllowed,false);
});

test("W6 Q002 remains planning-only and protects Q001 plus Q003-or-later scope",()=>{
  assert.equal(preflight.q002ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(preflight.q002ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(preflight.q002ScopeLock.q001ProductMutationAllowed,false);
  assert.equal(preflight.q002ScopeLock.q003OrLaterTouched,false);
  assert.ok(preflight.q002ScopeLock.excludedRelations.includes("REOWN_Q001_PATTERN_RELATION_KPS"));
  assert.ok(preflight.q002ScopeLock.excludedRelations.includes("GENERIC_ONE_WAY_TABLE_DATA_READING"));
  assert.equal(preflight.preflightDecision.predecessorQ001D0Verified,true);
  assert.equal(preflight.preflightDecision.separateImplementationApprovalRequired,true);
  assert.equal(preflight.preflightDecision.nextTask,"P06F_W6DirectProductVerticalSlice002Implementation");
});

test("W6 Q002 preflight stays SHARED_RUNTIME_BOUNDED with no full or global replay",()=>{
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
