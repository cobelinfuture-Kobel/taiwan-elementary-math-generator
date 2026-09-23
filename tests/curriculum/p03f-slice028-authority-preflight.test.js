import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const read=(relative)=>JSON.parse(fs.readFileSync(path.join(root,relative),"utf8"));
const queue=read("data/curriculum/full-product/p03e/w3-direct-product-vertical-slice-queue.json");
const authority=read("data/curriculum/full-product/p03f/slice028-g5a-u01-rank8-decimal-authority.json");
const predecessor=read("data/curriculum/final-milestone-claims/p03f-w3-slice027-e6-d0-v1.json");
const canonical=read("data/curriculum/application/operations/w02/g5a_u01_5a01.canonical-operation.json");
const hidden=read("data/curriculum/application/pattern-specs/w02/g5a_u01_5a01.hidden-pattern-spec.json");

const SLICE_ID="p03e_q028_r8_g5a_u01_5a01_profile_decimal_c1";
const KP_ID="kp_g5a_u01_decimal_compose_decompose";
const SPEC_ID="ps_g5a_u01_decimal_compose_decompose_decimal_numeric";

test("P03F28 freezes exact queue position 28 after Slice027 D0",()=>{
  assert.equal(queue.orderedSliceIds[27],SLICE_ID);
  assert.equal(queue.orderedImplementationTaskIds[27],"P03F_W3DirectProductVerticalSlice028Implementation");
  assert.equal(authority.queueAuthority.queuePosition,28);
  assert.equal(authority.queueAuthority.sliceId,SLICE_ID);
  assert.equal(authority.queueAuthority.previousSliceId,queue.orderedSliceIds[26]);
  assert.equal(authority.queueAuthority.queueDigest,queue.queueDigest);
  assert.equal(predecessor.status,"PASS_D0_CLOSED");
  assert.equal(predecessor.productResult.d0Complete,true);
  assert.equal(authority.queueAuthority.previousSliceD0Complete,true);
});

test("P03F28 binds only the source-backed decimal compose/decompose capability",()=>{
  assert.equal(authority.sourceAuthority.sourceNodeId,"g5a_u01_5a01");
  assert.equal(authority.knowledgePoints.length,1);
  assert.equal(authority.knowledgePoints[0].knowledgePointId,KP_ID);
  assert.equal(authority.knowledgePoints[0].applicationClassification,"APPLICATION_NOT_APPLICABLE");
  assert.deepEqual(authority.knowledgePoints[0].requiredW3CapabilityIds,["cap_decimal_domain_validator","cap_decimal_number_system"]);
  const canonicalKp=canonical.knowledgePoints.find((row)=>row.knowledgePointId===KP_ID);
  assert.ok(canonicalKp);
  assert.equal(canonicalKp.operationModels[0].modelId,"op_g5a_u01_decimal_compose_decompose");
  assert.equal(canonicalKp.operationModels[0].operationFamilyId,"decimal_representation");
  const hiddenKp=hidden.knowledgePoints.find((row)=>row.knowledgePointId===KP_ID);
  assert.ok(hiddenKp);
  assert.equal(hiddenKp.patternSpecs.length,1);
  assert.equal(hiddenKp.patternSpecs[0].patternSpecId,SPEC_ID);
  assert.equal(hiddenKp.patternSpecs[0].mode,"NUMERIC");
});

test("P03F28 keeps the product boundary to existing G5A-U01 and 29/219 current authority",()=>{
  assert.equal(authority.productBoundary.publicSourceAlreadyExists,true);
  assert.equal(authority.productBoundary.newPublicSourceAllowed,false);
  assert.equal(authority.productBoundary.reuseSlice021G5AU01Source,true);
  assert.equal(authority.productBoundary.expectedSourceVisibleCountAfterAdmission,2);
  assert.equal(authority.productBoundary.expectedSourceHiddenCountAfterAdmission,6);
  assert.equal(authority.productBoundary.expectedPublicSourceCountAfterAdmission,29);
  assert.equal(authority.productBoundary.expectedCurrentPublicKnowledgePointCountAfterAdmission,219);
  assert.equal(authority.productBoundary.applicationExpansionAllowed,false);
  assert.equal(authority.productBoundary.globalContextExpansionAllowed,false);
  assert.equal(authority.productBoundary.parallelPipelineAllowed,false);
  assert.equal(authority.productBoundary.nextSliceMayStartBeforeD0Closeout,false);
});
