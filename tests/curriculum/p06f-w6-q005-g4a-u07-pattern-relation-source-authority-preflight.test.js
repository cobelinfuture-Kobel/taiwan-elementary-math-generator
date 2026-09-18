import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP06EW6DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p06e-w6-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const read=p=>JSON.parse(readFileSync(new URL(`../../${p}`,import.meta.url),"utf8"));
const preflight=read("data/curriculum/full-product/p06f/q005-g4a-u07-pattern-relation-source-authority-preflight.json");
const queue=read("data/curriculum/full-product/p06e/w6-direct-product-vertical-slice-queue.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-02.json");
const profiles=read("data/curriculum/global/runtime/r04/runtime-capability-profiles.json");
const impact=read("data/project/change-impact/P06F_W6_Q005_PREFLIGHT.impact.json");
const validation=read("data/project/validation-plans/P06F_W6_Q005_PREFLIGHT.validation.json");
const KPS=["kp_g4a_u07_geometric_arrangement_count","kp_g4a_u07_quantity_additive_pattern"];
const FUTURE=["kp_g4a_u07_input_output_table_rule","kp_g4a_u07_quantity_multiplicative_pattern","kp_g4a_u07_pattern_missing_term_reasoning"];
const CAPS=["cap_pattern_relation_validator","cap_pattern_sequence_reasoning"];
const SLICE="p06e_q005_r1_g4a_u07_4a07_profile_pattern_relation_c1";

test("W6 Q005 preflight binds the exact fifth executable queue slice after Q004 D0",()=>{
  const materialized=materializeP06EW6DirectProductVerticalSliceQueue(),slice=materialized.queueEntries[4];
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.queueAuthority.queueDigest,queue.queueDigest);
  assert.equal(slice.queuePosition,5);
  assert.equal(slice.sliceId,SLICE);
  assert.equal(slice.implementationTaskId,"P06F_W6DirectProductVerticalSlice005Implementation");
  assert.equal(slice.previousSliceId,queue.orderedSliceIds[3]);
  assert.equal(slice.previousSliceMustBeD0Complete,true);
  assert.equal(slice.primarySourceNodeId,"g4a_u07_4a07");
  assert.equal(slice.intraWavePrerequisiteRank,1);
  assert.equal(slice.primaryRuntimeProfileId,"profile_pattern_relation");
  assert.deepEqual(slice.knowledgePointIds,KPS);
  assert.deepEqual(slice.requiredW6CapabilityIds,CAPS);
  assert.equal(preflight.predecessorD0Evidence.prNumber,979);
  assert.equal(preflight.predecessorD0Evidence.mergeSha,"879b912d819be7d8eade4eacf74622b1db51511a");
  assert.equal(preflight.predecessorD0Evidence.postMergeWorkflowRunId,35320006582);
  assert.equal(preflight.predecessorD0Evidence.liveReportStatus,"PASS_E6_D0_COMPLETE");
  assert.equal(preflight.predecessorD0Evidence.classicUiAcceptanceStatus,"PASS_P06F_W6_Q004_CLASSIC_UI_ACCEPTANCE");
});

test("W6 Q005 source authority binds the two R02 full-page reviewed G4A-U07 pattern candidates",()=>{
  const source=r02.sourceRecords.find(row=>row.sourceNodeId==="g4a_u07_4a07");
  assert.ok(source);
  assert.equal(source.sourceTitle,"數量關係與規律");
  assert.equal(source.sourcePdfTitle,"meow911_4a07_source.pdf");
  assert.equal(source.pageCount,2);
  assert.deepEqual(source.reviewedPages,[1,2]);
  const candidates=new Map(source.candidates.map(row=>[row.knowledgePointId,row]));
  for(const expected of preflight.r02ReviewedCandidateAuthority.targetCandidates){
    const actual=candidates.get(expected.knowledgePointId);
    assert.ok(actual,expected.knowledgePointId);
    assert.equal(actual.canonicalNameZh,expected.canonicalNameZh);
    assert.equal(actual.capabilityStatement,expected.capabilityStatement);
    assert.equal(actual.reasoningInvariant,expected.reasoningInvariant);
    assert.equal(actual.category,"pattern");
    assert.deepEqual(actual.evidencePages,[1,2]);
    assert.equal(actual.applicationSuitability,"APPLICATION_COMPATIBLE");
  }
  assert.equal(preflight.sourceAuthority.sourcePdfDriveFileId,"1NKZfif1y-iujwps73SB6P6LtcdDWWdsd");
  assert.equal(preflight.sourceAuthority.reviewMethod,"FULL_PAGE_VISUAL_READBACK");
  assert.equal(preflight.sourceAuthority.ocrUsedAsAuthority,false);
  assert.equal(preflight.sourceAuthority.driveMetadataReadback.reviewStatusUse,"STALE_METADATA_NOT_USED_AS_CURRENT_REVIEW_PROOF");
});

test("W6 Q005 explicitly locks source-title and embedded-URL artifacts without creating source ambiguity",()=>{
  const lock=preflight.sourceAuthority.sourceIdentityArtifactLock;
  assert.equal(lock.titleNormalizationDifference.present,true);
  assert.equal(lock.titleNormalizationDifference.r02SourceTitle,"數量關係與規律");
  assert.equal(lock.titleNormalizationDifference.driveMetadataSourceTitle,"數量規律");
  assert.equal(lock.embeddedHeaderUrlMismatch.present,true);
  assert.equal(lock.embeddedHeaderUrlMismatch.pdfTextReadbackUrl,"https://meow911.com/4b04/");
  assert.equal(lock.embeddedHeaderUrlMismatch.driveMetadataSourceUrl,"https://meow911.com/4a07/");
  assert.equal(lock.embeddedHeaderUrlMismatch.sourceRefAmbiguity,false);
  assert.equal(lock.embeddedHeaderUrlMismatch.manualSourceChoiceRequired,false);
  assert.equal(preflight.preflightDecision.sourceRefAmbiguity,false);
  assert.equal(preflight.preflightDecision.manualSourceChoiceRequired,false);
});

test("W6 Q005 keeps both targets in the pattern-relation runtime envelope and protects future same-source KPs",()=>{
  const profile=profiles.profiles.find(row=>row.profileId==="profile_pattern_relation");
  assert.ok(profile);
  assert.deepEqual(profile.requiredCapabilityIds,["cap_pattern_sequence_reasoning","cap_pattern_relation_validator","cap_text_numeric_representation"]);
  assert.deepEqual(preflight.runtimeCapabilityAuthority.exactFrozenQueueRequiredW6CapabilityIds,CAPS);
  for(const id of KPS){
    const mapping=getR04KnowledgePointCapabilityMapping(id);
    assert.ok(mapping);
    assert.equal(mapping.primaryRuntimeProfileId,"profile_pattern_relation");
    assert.equal(mapping.classificationRuleId,"rule_pattern_relation");
  }
  assert.equal(preflight.semanticProfileLock.classification,"PROFILE_MATCHES_SOURCE_PATTERN_SEMANTICS");
  assert.equal(preflight.semanticProfileLock.implementationSemanticLock.geometricArrangementIsPatternRelationCore,true);
  assert.equal(preflight.semanticProfileLock.implementationSemanticLock.geometricArrangementIsGeometryPropertyCore,false);
  assert.equal(preflight.runtimeCapabilityAuthority.symbolicRelationReasoningRequiredForQ005,false);
  assert.deepEqual(preflight.r02ReviewedCandidateAuthority.protectedSameSourceFutureCandidates.map(x=>x.knowledgePointId),FUTURE);
  assert.equal(preflight.q005ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(preflight.q005ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(preflight.q005ScopeLock.q006OrLaterTouched,false);
  assert.equal(preflight.preflightDecision.separateImplementationApprovalRequired,true);
  assert.equal(preflight.preflightDecision.nextTask,"P06F_W6DirectProductVerticalSlice005Implementation");
});

test("W6 Q005 preflight remains SHARED_RUNTIME_BOUNDED and Node-only",()=>{
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
