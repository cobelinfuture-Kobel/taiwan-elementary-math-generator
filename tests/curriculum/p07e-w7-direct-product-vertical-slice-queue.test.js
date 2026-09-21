import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const sourceIndex=read("data/curriculum/full-product/p07e/w7-source-authority-index.json");

test("P07E freezes the exact R05-W7 cohort with registry parity",()=>{
  const result=materializeP07EW7DirectProductVerticalSliceQueue();
  assert.equal(result.status,"W7_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN");
  assert.equal(result.queueRegistryPresent,true);
  assert.equal(result.queueRegistryParity,true);
  assert.equal(result.queueFrozen,true);
  assert.equal(result.metrics.directW7KnowledgePointCount,32);
  assert.equal(result.metrics.directW7CapabilityPlanCount,3);
  assert.equal(result.metrics.directW7SourceNodeCount,10);
  assert.equal(result.metrics.directW7RuntimeProfileCount,7);
  assert.equal(result.metrics.directW7PrerequisiteRankCount,11);
  assert.equal(result.metrics.queueSliceCount,26);
  assert.equal(result.metrics.allocatedKnowledgePointCount,32);
  assert.equal(result.metrics.uniqueAllocatedKnowledgePointCount,32);
  assert.equal(result.derivedRegistrySnapshot.queueDigest,"ad37a23f07b3de22a088f5bf9f59e2b45f13cc3c350bb84def21860d21135843");
  assert.equal(result.nextExecutableSlice.sliceId,"p07e_q001_r5_g6a_u05_6a05_profile_ratio_percent_c1");
  assert.deepEqual(result.nextExecutableSlice.knowledgePointIds,["kp_g6a_u05_ratio_notation_order"]);
  assert.equal(result.derivedRegistrySnapshot.lastSliceId,"p07e_q026_r15_g6a_u08_6a08_profile_speed_rate_c1");
});

test("P07E W7 queue is source/profile/rank partitioned and strictly serial",()=>{
  const result=materializeP07EW7DirectProductVerticalSliceQueue();
  for(let i=0;i<result.queueEntries.length;i++){
    const row=result.queueEntries[i];
    assert.equal(row.queuePosition,i+1);
    assert.equal(row.previousSliceId,i===0?null:result.queueEntries[i-1].sliceId);
    assert.equal(row.previousSliceMustBeD0Complete,i>0);
    assert.ok(row.primarySourceNodeId);
    assert.ok(row.supportingSourceNodeIds.includes(row.primarySourceNodeId));
    assert.ok(row.knowledgePointIds.length>0&&row.knowledgePointIds.length<=8);
    assert.equal(row.assignedDeliveryWaveId,"R05-W7");
    assert.equal(row.productProductionAdmitted,false);
    assert.equal(row.implementationAllowedByP07E,false);
  }
});

test("P07E W7 capability plan is exactly ratio percent speed-rate validator",()=>{
  const result=materializeP07EW7DirectProductVerticalSliceQueue();
  assert.deepEqual(result.capabilityPlan.map(row=>row.capabilityId).sort(),[
    "cap_ratio_percent_reasoning",
    "cap_ratio_rate_validator",
    "cap_speed_rate_reasoning"
  ]);
  const ratio=result.capabilityPlan.find(row=>row.capabilityId==="cap_ratio_percent_reasoning");
  const validator=result.capabilityPlan.find(row=>row.capabilityId==="cap_ratio_rate_validator");
  const speed=result.capabilityPlan.find(row=>row.capabilityId==="cap_speed_rate_reasoning");
  assert.equal(ratio.requiredByKnowledgePointCount,21);
  assert.equal(validator.requiredByKnowledgePointCount,21);
  assert.equal(speed.requiredByKnowledgePointCount,5);
});

test("P07E W7 source authority index covers all 32 W7 KPs and all primary/supporting R02 sources",()=>{
  const result=materializeP07EW7DirectProductVerticalSliceQueue();
  const primaryIds=[...new Set(result.directRows.map(row=>row.primarySourceNodeId))].sort();
  const supportingIds=[...new Set(result.directRows.flatMap(row=>row.supportingSourceNodeIds))].sort();
  const indexedPrimary=sourceIndex.sources.filter(x=>x.role==="PRIMARY").map(x=>x.sourceNodeId).sort();
  const indexedAll=sourceIndex.sources.map(x=>x.sourceNodeId).sort();
  assert.deepEqual(indexedPrimary,primaryIds);
  assert.deepEqual(indexedAll,supportingIds);
  assert.equal(sourceIndex.primarySourceNodeCount,10);
  assert.equal(sourceIndex.supportingAuthoritySourceNodeCount,11);
  assert.equal(sourceIndex.directW7KnowledgePointCount,32);
  const indexedKps=[...new Set(sourceIndex.sources.filter(x=>x.role==="PRIMARY").flatMap(x=>x.w7KnowledgePointIds))].sort();
  assert.deepEqual(indexedKps,[...result.directRows.map(x=>x.knowledgePointId)].sort());

  const r02Sources=[];
  for(let i=1;i<=8;i++){
    const chunk=read("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-"+String(i).padStart(2,"0")+".json");
    r02Sources.push(...(chunk.sourceRecords??[]));
  }
  for(const source of sourceIndex.sources){
    const r02=r02Sources.find(x=>x.sourceNodeId===source.sourceNodeId);assert.ok(r02,source.sourceNodeId);
    assert.equal(r02.sourceTitle,source.sourceTitle);
    assert.equal(r02.sourcePdfTitle,source.sourcePdfTitle);
    assert.deepEqual(r02.reviewedPages,source.reviewedPages);
    for(const kp of source.w7KnowledgePointIds){
      const candidate=r02.candidates.find(x=>x.knowledgePointId===kp);assert.ok(candidate,source.sourceNodeId+":"+kp);
      assert.ok(candidate.evidencePages.length>0);
    }
  }
});

test("P07E W7 includes prerequisite-escalated cross-domain KPs without changing R05 semantics",()=>{
  const result=materializeP07EW7DirectProductVerticalSliceQueue();
  const escalated=result.directRows.filter(row=>row.waveEscalatedByPrerequisite);
  const directBase=result.directRows.filter(row=>!row.waveEscalatedByPrerequisite);
  assert.ok(escalated.length>0);
  assert.ok(directBase.length>0);
  assert.ok(escalated.some(row=>row.primaryRuntimeProfileId==="profile_geometry_formula"));
  assert.ok(escalated.some(row=>row.primaryRuntimeProfileId==="profile_factor_multiple"));
  assert.ok(directBase.some(row=>row.primaryRuntimeProfileId==="profile_ratio_percent"));
  assert.ok(directBase.some(row=>row.primaryRuntimeProfileId==="profile_speed_rate"));
  assert.ok(result.directRows.every(row=>row.mappingBasis.legacyBatchUsedForAssignment===false));
});

test("P07E is queue-freeze only and does not open W7 implementation",()=>{
  const policy=read("data/curriculum/full-product/p07e/w7-direct-product-vertical-slice-queue-policy.json");
  const manifest=read("data/curriculum/full-product/p07e/w7-direct-product-vertical-slice-queue.manifest.json");
  assert.equal(policy.scopeBoundary.queueFreezeOnly,true);
  assert.equal(policy.scopeBoundary.productImplementationAllowed,false);
  assert.equal(policy.scopeBoundary.generatorImplementationAllowed,false);
  assert.equal(policy.scopeBoundary.validatorImplementationAllowed,false);
  assert.equal(policy.scopeBoundary.newProductAdmissionAllowed,false);
  assert.equal(manifest.scope.w7ImplementationStarted,false);
  assert.equal(manifest.scope.productionAdmissionChanged,false);
  assert.equal(manifest.mainlineBoundary.nextTaskAfterFreeze,"P07F_W7DirectProductVerticalSlice001Implementation");
});

test("P07E W7 final readback materializes exact source and escalation identities",()=>{
  const result=materializeP07EW7DirectProductVerticalSliceQueue();
  console.log("P07E_W7_FINAL="+JSON.stringify({
    status:result.status,
    metrics:result.metrics,
    queueDigest:result.derivedRegistrySnapshot.queueDigest,
    sourceNodes:sourceIndex.sources.map(x=>({sourceNodeId:x.sourceNodeId,role:x.role,sourceTitle:x.sourceTitle,sourcePdfTitle:x.sourcePdfTitle,reviewedPages:x.reviewedPages,w7KnowledgePointCount:x.w7KnowledgePointIds.length})),
    baseVsEscalated:{
      directBaseCount:result.directRows.filter(x=>!x.waveEscalatedByPrerequisite).length,
      prerequisiteEscalatedCount:result.directRows.filter(x=>x.waveEscalatedByPrerequisite).length
    },
    rows:result.directRows.map(row=>({
      knowledgePointId:row.knowledgePointId,
      baseDeliveryWaveId:row.baseDeliveryWaveId,
      deliveryWaveId:row.deliveryWaveId,
      waveEscalatedByPrerequisite:row.waveEscalatedByPrerequisite,
      prerequisiteWaveLowerBound:row.prerequisiteWaveLowerBound,
      primarySourceNodeId:row.primarySourceNodeId,
      supportingSourceNodeIds:[...row.supportingSourceNodeIds],
      intraWavePrerequisiteRank:row.intraWavePrerequisiteRank,
      primaryRuntimeProfileId:row.primaryRuntimeProfileId,
      requiredW7CapabilityIds:[...row.requiredW7CapabilityIds]
    })),
    firstExecutableSlice:result.nextExecutableSlice,
    lastSliceId:result.derivedRegistrySnapshot.lastSliceId
  }));
});
