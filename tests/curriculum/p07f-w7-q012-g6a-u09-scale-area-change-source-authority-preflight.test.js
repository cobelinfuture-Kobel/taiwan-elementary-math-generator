import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {getR03DirectPrerequisites} from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const pre=read("data/curriculum/full-product/p07f/q012-g6a-u09-scale-area-change-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-07.json");
const KP="kp_g6a_u09_scale_area_change";

test("Q012 discovery preflight binds exact frozen row, Q011 D0 and current visual source identity",()=>{
  assert.equal(pre.queueAuthority.queuePosition,12);
  assert.equal(pre.queueAuthority.sliceId,"p07e_q012_r9_g6a_u09_6a09_profile_geometry_formula_c1");
  assert.deepEqual(pre.queueAuthority.knowledgePointIds,[KP]);
  assert.equal(pre.predecessorD0Evidence.q011Status,"PASS_E6_D0_COMPLETE");
  assert.equal(pre.sourceAuthority.sourcePdfDriveFileId,"1qnZyEDcmOgb94BYU350cmjvUN4kESlEZ");
  assert.equal(pre.sourceAuthority.sourcePdfSha256,"80ec4d8df9a4d5bf98392cf846fac7df68c49781ba60eefa78e70e9109cbbe2c");
  assert.equal(pre.sourceAuthority.currentVisualReadbackAuthority.q012DirectVisualEvidence.directScaleAreaChangeQuestionVisible,true);
  assert.equal(pre.sourceAuthority.currentVisualReadbackAuthority.q012DirectVisualEvidence.visibleScale,"1:300");
});

test("Q012 binds exact R02 candidate without mutating sibling ownership",()=>{
  const src=r02.sourceRecords.find(x=>x.sourceNodeId==="g6a_u09_6a09");assert.ok(src);
  const target=src.candidates.find(x=>x.knowledgePointId===KP);assert.ok(target);
  assert.deepEqual(pre.r02ReviewedCandidateAuthority.targetCandidate,{
    knowledgePointId:target.knowledgePointId,canonicalNameZh:target.canonicalNameZh,capabilityStatement:target.capabilityStatement,
    reasoningInvariant:target.reasoningInvariant,category:target.category,evidencePages:target.evidencePages,applicationSuitability:target.applicationSuitability
  });
  assert.equal(pre.semanticProfileLock.targetSemanticCore,"LENGTH_SCALE_FACTOR_K_IMPLIES_AREA_SCALE_FACTOR_K_SQUARED");
  assert.equal(pre.q012ScopeLock.implementationAllowedByThisPreflight,false);
});

test("Q012 executable R03 R04 R05 rows exist for discovery readback",()=>{
  const r03=getR03DirectPrerequisites(KP),r04=getR04KnowledgePointCapabilityMapping(KP),r05=getR05DeliveryWaveAssignment(KP);
  assert.ok(Array.isArray(r03));assert.ok(r04);assert.ok(r05);
  assert.equal(r04.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.equal(r05.deliveryWaveId,"R05-W7");
  assert.equal(r05.intraWavePrerequisiteRank,9);
});
