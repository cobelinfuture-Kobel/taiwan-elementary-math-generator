import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {materializeP05EW5DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import {materializeR04SharedRuntimeCapabilityMatrix} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),"utf8"));
const preflight=read("data/curriculum/full-product/p05f/q033-g4b-u02-parallel-distance-quadrilateral-classification-source-authority-preflight.json");
const q004=read("data/curriculum/full-product/p05f/q004-g4b-u02-parallel-lines-recognition-source-authority-preflight.json");
const q025=read("data/curriculum/full-product/p05f/q025-g4b-u02-perpendicular-lines-recognition-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-02.json");
const KPS=["kp_g4b_u02_parallel_distance_construction","kp_g4b_u02_quadrilateral_classification"];
const REQUIRED_W5=["cap_geometry_construction","cap_geometry_diagram_representation","cap_geometry_domain_validator","cap_geometry_property_reasoning"];

function sorted(values){return [...values].sort();}

test("Q033 binds exact frozen queue row and predecessor",()=>{
  const queue=materializeP05EW5DirectProductVerticalSliceQueue();
  assert.equal(queue.status,"W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN");
  assert.equal(queue.queueFrozen,true);
  assert.equal(queue.queueRegistryParity,true);
  const row=queue.queueEntries.find(x=>x.queuePosition===33); assert.ok(row);
  assert.equal(row.sliceId,"p05e_q033_r3_g4b_u02_4b02_profile_geometry_property_c1");
  assert.equal(row.implementationTaskId,"P05F_W5DirectProductVerticalSlice033Implementation");
  assert.equal(row.previousSliceId,"p05e_q032_r3_g4a_u05_4a05_profile_geometry_property_c1");
  assert.equal(row.previousSliceMustBeD0Complete,true);
  assert.equal(row.primarySourceNodeId,"g4b_u02_4b02");
  assert.equal(row.intraWavePrerequisiteRank,3);
  assert.equal(row.primaryRuntimeProfileId,"profile_geometry_property");
  assert.equal(row.chunkIndex,1);
  assert.equal(row.knowledgePointCount,2);
  assert.deepEqual(row.knowledgePointIds,KPS);
  assert.deepEqual(sorted(row.requiredW5CapabilityIds),sorted(REQUIRED_W5));
  assert.equal(row.targetEvidenceLevel,"E6_D0_COMPLETE");
  assert.equal(preflight.queueAuthority.queueDigest,queue.derivedRegistrySnapshot.queueDigest);
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds,row.knowledgePointIds);
  assert.equal(preflight.previousSliceD0Evidence.productPrNumber,906);
  assert.equal(preflight.previousSliceD0Evidence.productMergeSha,"ce9df0bd4ccaf5a1508abce4c9c7e6b9fb1fe45d");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesRunId,"34724619952");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactId,"10307870696");
  assert.equal(preflight.previousSliceD0Evidence.evidenceArtifactDigest,"sha256:8e1b01d129dbc861a7a46667f633d08767d247bf357c85da52f68c531704cb41");
  assert.equal(preflight.previousSliceD0Evidence.status,"PASS_E6_D0_COMPLETE");
});

test("Q033 binds both exact R02 candidates and same-source identity",()=>{
  const source=r02.sourceRecords.find(x=>x.sourceNodeId==="g4b_u02_4b02"); assert.ok(source);
  assert.equal(source.sourceTitle,"垂直平行與四邊形");
  assert.equal(source.sourcePdfTitle,"meow911_4b02_source.pdf");
  assert.equal(source.pageCount,2);
  assert.deepEqual(source.reviewedPages,[1,2]);
  const candidates=KPS.map(id=>source.candidates.find(x=>x.knowledgePointId===id));
  assert.ok(candidates.every(Boolean));
  assert.equal(candidates[0].canonicalNameZh,"平行線距離與作圖");
  assert.equal(candidates[0].capabilityStatement,"學生能量測或畫出指定距離的平行線。");
  assert.equal(candidates[0].reasoningInvariant,"兩平行線間的垂直距離處處相等。");
  assert.equal(candidates[1].canonicalNameZh,"四邊形分類");
  assert.equal(candidates[1].capabilityStatement,"學生能依邊與角性質分類梯形、平行四邊形、長方形、菱形與正方形。");
  assert.equal(candidates[1].reasoningInvariant,"分類必須同時檢查平行邊、等長邊與直角條件。");
  for(let i=0;i<KPS.length;i++){
    assert.equal(preflight.r02ReviewedCandidateAuthority[i].knowledgePointId,candidates[i].knowledgePointId);
    assert.equal(preflight.r02ReviewedCandidateAuthority[i].capabilityStatement,candidates[i].capabilityStatement);
    assert.equal(preflight.r02ReviewedCandidateAuthority[i].reasoningInvariant,candidates[i].reasoningInvariant);
  }
  assert.equal(q004.sourceAuthority.sourcePdfDriveFileId,preflight.sourceAuthority.sourcePdfDriveFileId);
  assert.equal(q025.sourceAuthority.sourcePdfDriveFileId,preflight.sourceAuthority.sourcePdfDriveFileId);
  assert.equal(q025.sourceAuthority.sourceIdentityCrossCheck.sourceRefAmbiguity,false);
  assert.equal(preflight.sourceAuthority.sourceRefAmbiguity,false);
});

test("Q033 binds current R04 mappings and exact frozen W5 contract-only union",()=>{
  const r04=materializeR04SharedRuntimeCapabilityMatrix();
  const mappings=KPS.map(id=>r04.getMapping(id));
  assert.ok(mappings.every(Boolean));
  assert.equal(mappings[0].primaryRuntimeProfileId,"profile_geometry_property");
  assert.equal(mappings[0].classificationRuleId,"rule_geometry_property");
  assert.deepEqual(mappings[0].appliedModifierIds,["mod_geometry_construction"]);
  assert.ok(mappings[0].requiredRuntimeCapabilityIds.includes("cap_geometry_construction"));
  assert.deepEqual(mappings[0].optionalRuntimeCapabilityIds,[]);
  assert.equal(mappings[1].primaryRuntimeProfileId,"profile_geometry_property");
  assert.equal(mappings[1].classificationRuleId,"rule_geometry_property");
  assert.deepEqual(mappings[1].appliedModifierIds,[]);
  assert.deepEqual(mappings[1].optionalRuntimeCapabilityIds,["cap_geometry_construction"]);
  for(let i=0;i<mappings.length;i++){
    assert.equal(mappings[i].mappingId,preflight.runtimeCapabilityAuthority[i].mappingId);
    assert.deepEqual(mappings[i].requiredRuntimeCapabilityIds,preflight.runtimeCapabilityAuthority[i].requiredRuntimeCapabilityIds);
    assert.deepEqual(mappings[i].optionalRuntimeCapabilityIds,preflight.runtimeCapabilityAuthority[i].optionalRuntimeCapabilityIds);
    assert.deepEqual(mappings[i].forbiddenRuntimeCapabilityIds,[]);
    assert.equal(mappings[i].runtimeCapabilityDeliveryState,"BLOCKED_BY_CONTRACT_ONLY_CAPABILITIES");
  }
  const contractOnly=new Set(r04.capabilities.filter(x=>x.deliveryStatus==="contract_only").map(x=>x.capabilityId));
  const union=sorted(new Set(mappings.flatMap(x=>x.requiredRuntimeCapabilityIds.filter(id=>contractOnly.has(id)))));
  assert.deepEqual(union,sorted(REQUIRED_W5));
  assert.deepEqual(sorted(preflight.queueAuthority.requiredW5CapabilityIds),sorted(REQUIRED_W5));
});

test("Q033 scope preserves Q004/Q025 ownership and defers inclusion relation",()=>{
  assert.deepEqual(preflight.q033ScopeLock.includedKnowledgePointIds,KPS);
  assert.deepEqual(sorted(preflight.q033ScopeLock.protectedExistingSameSourceKnowledgePointIds),sorted(["kp_g4b_u02_parallel_lines_recognition","kp_g4b_u02_perpendicular_lines_recognition"]));
  assert.deepEqual(preflight.q033ScopeLock.excludedSameSourceKnowledgePointIds,["kp_g4b_u02_quadrilateral_inclusion_relation"]);
  assert.equal(preflight.q033ScopeLock.parallelDistanceMustBePerpendicular,true);
  assert.equal(preflight.q033ScopeLock.parallelDistanceMustBeConstant,true);
  assert.equal(preflight.q033ScopeLock.quadrilateralClassificationMustUsePropertyWitnesses,true);
  assert.equal(preflight.q033ScopeLock.quadrilateralInclusionDeferredToQ042,true);
  assert.equal(preflight.q033ScopeLock.applicationImplementationAllowedByThisPreflight,false);
  assert.equal(preflight.q033ScopeLock.implementationAllowedByThisPreflight,false);
  assert.equal(preflight.q033ScopeLock.publicProductAdmissionAllowedByThisPreflight,false);
  assert.equal(preflight.q033ScopeLock.frozenQueueAuthorityTouched,false);
  assert.equal(preflight.q033ScopeLock.r02AuthorityTouched,false);
  assert.equal(preflight.q033ScopeLock.r04AuthorityTouched,false);
  assert.equal(preflight.q033ScopeLock.q034OrLaterTouched,false);
});

test("Q033 preflight uses bounded validation and current operator continuation authorization",()=>{
  assert.equal(preflight.preflightValidationBoundary.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");
  assert.equal(preflight.preflightValidationBoundary.derivedLane,"SHARED_RUNTIME_BOUNDED");
  assert.equal(preflight.preflightValidationBoundary.fullRepositoryRegressionAllowed,false);
  assert.equal(preflight.preflightValidationBoundary.globalBrowserReplayAllowed,false);
  assert.equal(preflight.preflightDecision.exactFrozenQueueRowResolved,true);
  assert.equal(preflight.preflightDecision.previousSliceD0Satisfied,true);
  assert.equal(preflight.preflightDecision.manualSourceChoiceRequired,false);
  assert.equal(preflight.preflightDecision.sourceRefAmbiguity,false);
  assert.equal(preflight.preflightDecision.separateImplementationApprovalSatisfiedByCurrentOperatorInstruction,true);
  assert.equal(preflight.preflightDecision.nextTaskRequiresNewOperatorApproval,false);
  assert.equal(preflight.preflightDecision.nextTask,"P05F_W5DirectProductVerticalSlice033Implementation");
});
