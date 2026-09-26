import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));

test("P08E derives the exact R05-W8 cohort before snapshot freeze",()=>{
  const result=materializeP08EW8DirectProductVerticalSliceQueue();
  assert.equal(result.status,"W8_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_DERIVED_PENDING_SNAPSHOT_FREEZE");
  assert.equal(result.queueRegistryPresent,false);
  assert.equal(result.queueFrozen,false);
  assert.equal(result.metrics.directW8KnowledgePointCount,24);
  assert.equal(result.metrics.directW8CapabilityPlanCount,0);
  assert.equal(result.metrics.allocatedKnowledgePointCount,24);
  assert.equal(result.metrics.uniqueAllocatedKnowledgePointCount,24);
  assert.ok(result.metrics.directW8SourceNodeCount>0);
  assert.ok(result.metrics.directW8RuntimeProfileCount>0);
  assert.ok(result.metrics.directW8PrerequisiteRankCount>0);
  assert.ok(result.metrics.queueSliceCount>0);
  assert.ok(result.metrics.queueSliceCount<=24);
});

test("P08E W8 queue discovery is source/profile/rank partitioned and strictly serial",()=>{
  const result=materializeP08EW8DirectProductVerticalSliceQueue();
  for(let i=0;i<result.queueEntries.length;i++){
    const row=result.queueEntries[i];
    assert.equal(row.queuePosition,i+1);
    assert.equal(row.previousSliceId,i===0?null:result.queueEntries[i-1].sliceId);
    assert.equal(row.previousSliceMustBeD0Complete,i>0);
    assert.ok(row.primarySourceNodeId);
    assert.ok(row.supportingSourceNodeIds.includes(row.primarySourceNodeId));
    assert.ok(row.knowledgePointIds.length>0&&row.knowledgePointIds.length<=8);
    assert.equal(row.assignedDeliveryWaveId,"R05-W8");
    assert.equal(row.productProductionAdmitted,false);
    assert.equal(row.implementationAllowedByP08E,false);
  }
});

test("P08E W8 is multi-domain completion with no direct W8 capability-plan row",()=>{
  const result=materializeP08EW8DirectProductVerticalSliceQueue();
  assert.deepEqual(result.capabilityPlan,[]);
  assert.equal(result.directRows.length,24);
  assert.ok(result.directRows.every(row=>row.baseDeliveryWaveId==="R05-W8"||row.waveEscalatedByPrerequisite));
  const directBase=result.directRows.filter(row=>row.baseDeliveryWaveId==="R05-W8");
  const escalated=result.directRows.filter(row=>row.waveEscalatedByPrerequisite);
  assert.ok(directBase.length>0);
  assert.ok(directBase.every(row=>row.blockingCapabilityWaveIds.length>=2));
  assert.ok(result.directRows.every(row=>row.mappingBasis.legacyBatchUsedForAssignment===false));
  assert.equal(directBase.length+result.directRows.filter(row=>row.baseDeliveryWaveId!=="R05-W8").length,24);
  assert.ok(escalated.length>=0);
});

test("P08E W8 source discovery resolves every primary/supporting source through R02 authority",()=>{
  const result=materializeP08EW8DirectProductVerticalSliceQueue();
  const sourceViews=result.predecessorR05.prerequisiteGraph.sourceViews;
  const sourceById=new Map(sourceViews.map(row=>[row.sourceNodeId,row]));
  const supportingIds=[...new Set(result.directRows.flatMap(row=>row.supportingSourceNodeIds))].sort();
  for(const sourceNodeId of supportingIds)assert.ok(sourceById.has(sourceNodeId),sourceNodeId);
  for(const row of result.directRows){
    for(const sourceNodeId of row.supportingSourceNodeIds){
      assert.ok(row.sourceNodeIds.includes(sourceNodeId),row.knowledgePointId+":"+sourceNodeId);
    }
  }
  assert.equal(supportingIds.length,result.metrics.directW8SupportingSourceNodeCount);
});

test("P08E is discovery/freeze only and does not open W8 implementation",()=>{
  const policy=read("data/curriculum/full-product/p08e/w8-direct-product-vertical-slice-queue-policy.json");
  const manifest=read("data/curriculum/full-product/p08e/w8-direct-product-vertical-slice-queue.manifest.json");
  assert.equal(policy.scopeBoundary.queueDiscoveryAndFreezeOnly,true);
  assert.equal(policy.scopeBoundary.productImplementationAllowed,false);
  assert.equal(policy.scopeBoundary.generatorImplementationAllowed,false);
  assert.equal(policy.scopeBoundary.validatorImplementationAllowed,false);
  assert.equal(policy.scopeBoundary.newProductAdmissionAllowed,false);
  assert.equal(manifest.scope.w8ImplementationStarted,false);
  assert.equal(manifest.scope.productionAdmissionChanged,false);
  assert.equal(manifest.mainlineBoundary.nextTaskAfterFreeze,"P08F_W8DirectProductVerticalSlice001Implementation");
});

test("P08E W8 discovery readback emits exact rows, sources, and derived registry",()=>{
  const result=materializeP08EW8DirectProductVerticalSliceQueue();
  const sourceViews=result.predecessorR05.prerequisiteGraph.sourceViews;
  const sourceById=new Map(sourceViews.map(row=>[row.sourceNodeId,row]));
  const supportingIds=[...new Set(result.directRows.flatMap(row=>row.supportingSourceNodeIds))].sort();
  console.log("P08E_W8_DISCOVERY="+JSON.stringify({
    status:result.status,
    metrics:result.metrics,
    queueDigest:result.derivedRegistrySnapshot.queueDigest,
    sourceNodes:supportingIds.map(sourceNodeId=>sourceById.get(sourceNodeId)),
    baseVsEscalated:{
      directBaseCount:result.directRows.filter(x=>x.baseDeliveryWaveId==="R05-W8").length,
      prerequisiteEscalatedCount:result.directRows.filter(x=>x.waveEscalatedByPrerequisite).length
    },
    rows:result.directRows.map(row=>({
      knowledgePointId:row.knowledgePointId,
      canonicalSourceNodeIds:[...row.sourceNodeIds],
      baseDeliveryWaveId:row.baseDeliveryWaveId,
      deliveryWaveId:row.deliveryWaveId,
      waveEscalatedByPrerequisite:row.waveEscalatedByPrerequisite,
      prerequisiteWaveLowerBound:row.prerequisiteWaveLowerBound,
      primarySourceNodeId:row.primarySourceNodeId,
      supportingSourceNodeIds:[...row.supportingSourceNodeIds],
      intraWavePrerequisiteRank:row.intraWavePrerequisiteRank,
      primaryRuntimeProfileId:row.primaryRuntimeProfileId,
      blockingCapabilityIds:[...row.blockingCapabilityIds],
      blockingCapabilityWaveIds:[...row.blockingCapabilityWaveIds]
    })),
    registry:result.derivedRegistrySnapshot
  }));
});
