import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {getR03DirectPrerequisites} from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const pre=read("data/curriculum/full-product/p07f/q013-g5b-u08-rate-and-percentage-quantity-source-authority-preflight.json");
const r02=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-05.json");
const KPS=["kp_g5b_u08_find_percentage_rate","kp_g5b_u08_percentage_of_quantity"];

test("Q013 discovery preflight binds exact two-KP frozen row and Q012 D0",()=>{
  const queue=materializeP07EW7DirectProductVerticalSliceQueue(),row=queue.queueEntries[12];
  assert.equal(pre.queueAuthority.queuePosition,13);
  assert.equal(row.sliceId,"p07e_q013_r10_g5b_u08_5b08_profile_ratio_percent_c1");
  assert.deepEqual([...row.knowledgePointIds],KPS);
  assert.deepEqual(pre.queueAuthority.knowledgePointIds,KPS);
  assert.deepEqual([...row.requiredW7CapabilityIds],["cap_ratio_percent_reasoning","cap_ratio_rate_validator"]);
  assert.equal(pre.predecessorD0Evidence.q012Status,"PASS_E6_D0_COMPLETE");
});

test("Q013 current visual readback directly supports both rate from quantities and percentage of quantity",()=>{
  const v=pre.sourceAuthority.currentVisualReadbackAuthority;
  assert.equal(v.reviewMethod,"CURRENT_FULL_PAGE_VISUAL_READBACK_200_DPI");
  assert.equal(v.ocrUsedAsAuthority,false);
  assert.equal(v.findPercentageRateDirectVisualEvidence.directEvidencePresent,true);
  assert.equal(v.findPercentageRateDirectVisualEvidence.visibleExamples.length,2);
  assert.equal(v.percentageOfQuantityDirectVisualEvidence.directEvidencePresent,true);
  assert.equal(v.percentageOfQuantityDirectVisualEvidence.visibleExamples.length,2);
  assert.deepEqual(pre.sourceAuthority.currentQ013DirectEvidencePages,[2]);
});

test("Q013 binds exact R02 candidates and protects Q008/Q016 ownership",()=>{
  const src=r02.sourceRecords.find(x=>x.sourceNodeId==="g5b_u08_5b08");assert.ok(src);
  const targets=KPS.map(id=>src.candidates.find(x=>x.knowledgePointId===id));assert.ok(targets.every(Boolean));
  assert.deepEqual(pre.r02ReviewedCandidateAuthority.targetCandidates,targets);
  assert.equal(pre.r02ReviewedCandidateAuthority.predecessorOwnedKnowledgePointRows[0].knowledgePointId,"kp_g5b_u08_ratio_fraction_decimal_percent_conversion");
  assert.deepEqual(pre.r02ReviewedCandidateAuthority.protectedFutureQueueOwnership[0].knowledgePointIds,[
    "kp_g5b_u08_find_base_quantity_percent","kp_g5b_u08_percent_discount_increase_application"
  ]);
});

test("Q013 executable R03 R04 R05 rows exist for both targets for discovery readback",()=>{
  for(const kp of KPS){
    const r03=getR03DirectPrerequisites(kp),r04=getR04KnowledgePointCapabilityMapping(kp),r05=getR05DeliveryWaveAssignment(kp);
    assert.ok(Array.isArray(r03));assert.ok(r04);assert.ok(r05);
    assert.equal(r04.primaryRuntimeProfileId,"profile_ratio_percent");
    assert.equal(r05.deliveryWaveId,"R05-W7");
    assert.equal(r05.intraWavePrerequisiteRank,10);
  }
});
