import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {materializeP05EW5DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import {materializeR04SharedRuntimeCapabilityMatrix} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),"utf8"));
const preflight=read("data/curriculum/full-product/p05f/q032-g4a-u05-triangle-inequality-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-02.json");
const KP="kp_g4a_u05_triangle_inequality";
const W5=["cap_geometry_diagram_representation","cap_geometry_domain_validator","cap_geometry_property_reasoning"];

test("Q032 binds exact frozen queue row",()=>{
  const q=materializeP05EW5DirectProductVerticalSliceQueue();
  assert.equal(q.queueFrozen,true); assert.equal(q.queueRegistryParity,true);
  const row=q.queueEntries.find(x=>x.queuePosition===32); assert.ok(row);
  assert.equal(row.sliceId,"p05e_q032_r3_g4a_u05_4a05_profile_geometry_property_c1");
  assert.equal(row.implementationTaskId,"P05F_W5DirectProductVerticalSlice032Implementation");
  assert.equal(row.previousSliceId,"p05e_q031_r2_g5b_u10_5b10a_profile_quantity_measurement_c1");
  assert.equal(row.primarySourceNodeId,"g4a_u05_4a05");
  assert.equal(row.intraWavePrerequisiteRank,3);
  assert.equal(row.primaryRuntimeProfileId,"profile_geometry_property");
  assert.deepEqual(row.knowledgePointIds,[KP]);
  assert.deepEqual([...row.requiredW5CapabilityIds].sort(),[...W5].sort());
  assert.equal(preflight.queueAuthority.queueDigest,q.derivedRegistrySnapshot.queueDigest);
});

test("Q032 binds reviewed triangle inequality source semantics",()=>{
  const source=r02.sourceRecords.find(x=>x.sourceNodeId==="g4a_u05_4a05"); assert.ok(source);
  const candidate=source.candidates.find(x=>x.knowledgePointId===KP); assert.ok(candidate);
  assert.equal(candidate.canonicalNameZh,"三角形成立條件");
  assert.equal(candidate.capabilityStatement,"學生能判斷三段長度是否能組成三角形。");
  assert.equal(candidate.reasoningInvariant,"任意兩邊長度和必須大於第三邊。");
  assert.equal(preflight.r02ReviewedCandidateAuthority.reasoningInvariant,candidate.reasoningInvariant);
  assert.equal(preflight.q032ScopeLock.strictInequalityRequired,true);
  assert.equal(preflight.q032ScopeLock.equalityCaseMustBeRejected,true);
  assert.equal(preflight.q032ScopeLock.allThreePairwiseSumChecksRequired,true);
});

test("Q032 binds current R04 geometry property contract",()=>{
  const r04=materializeR04SharedRuntimeCapabilityMatrix(); const m=r04.getMapping(KP); assert.ok(m);
  assert.equal(m.mappingId,"r04map_g4a_u05_triangle_inequality");
  assert.equal(m.primaryRuntimeProfileId,"profile_geometry_property");
  assert.equal(m.classificationRuleId,"rule_geometry_property");
  assert.deepEqual(m.appliedModifierIds,[]);
  assert.deepEqual(m.requiredRuntimeCapabilityIds,preflight.runtimeCapabilityAuthority.requiredRuntimeCapabilityIds);
  assert.deepEqual(m.optionalRuntimeCapabilityIds,["cap_geometry_construction"]);
  assert.equal(m.runtimeCapabilityDeliveryState,"BLOCKED_BY_CONTRACT_ONLY_CAPABILITIES");
});

test("Q032 predecessor and scope guards are locked",()=>{
  assert.equal(preflight.previousSliceD0Evidence.status,"PASS_E6_D0_COMPLETE");
  assert.equal(preflight.previousSliceD0Evidence.productMergeSha,"1bd85e2613c528ae7d2436fe310b1f68915130aa");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesRunId,"34703017770");
  assert.deepEqual(preflight.q032ScopeLock.protectedExistingSameSourceKnowledgePointIds,["kp_g4a_u05_triangle_elements_naming","kp_g4a_u05_triangle_side_classification"]);
  assert.deepEqual(preflight.q032ScopeLock.excludedSameSourceKnowledgePointIds,["kp_g4a_u05_triangle_angle_classification","kp_g4a_u05_congruent_triangle_correspondence"]);
  assert.equal(preflight.preflightValidationBoundary.fullRepositoryRegressionAllowed,false);
  assert.equal(preflight.preflightValidationBoundary.globalBrowserReplayAllowed,false);
  assert.equal(preflight.preflightDecision.nextTask,"P05F_W5DirectProductVerticalSlice032Implementation");
});
