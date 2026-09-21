import test from "node:test";
import assert from "node:assert/strict";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";

test("P07E derives the exact R05-W7 cohort before snapshot freeze",()=>{
  const result=materializeP07EW7DirectProductVerticalSliceQueue();
  assert.equal(result.status,"W7_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_DERIVED_PENDING_SNAPSHOT_FREEZE");
  assert.equal(result.queueRegistryPresent,false);
  assert.equal(result.queueFrozen,false);
  assert.equal(result.metrics.directW7KnowledgePointCount,32);
  assert.equal(result.metrics.directW7CapabilityPlanCount,3);
  assert.equal(result.metrics.allocatedKnowledgePointCount,32);
  assert.equal(result.metrics.uniqueAllocatedKnowledgePointCount,32);
  assert.ok(result.queueEntries.length>0);
  assert.ok(result.queueEntries.every(row=>row.assignedDeliveryWaveId==="R05-W7"));
  assert.ok(result.queueEntries.every(row=>row.productProductionAdmitted===false));
  assert.ok(result.queueEntries.every(row=>row.implementationAllowedByP07E===false));
  assert.ok(result.queueEntries.every(row=>row.knowledgePointCount<=8));
  assert.deepEqual(result.capabilityPlan.map(row=>row.capabilityId).sort(),["cap_ratio_percent_reasoning","cap_ratio_rate_validator","cap_speed_rate_reasoning"]);
});

test("P07E W7 queue derivation is source/profile/rank partitioned and strictly serial",()=>{
  const result=materializeP07EW7DirectProductVerticalSliceQueue();
  for(let i=0;i<result.queueEntries.length;i++){
    const row=result.queueEntries[i];
    assert.equal(row.queuePosition,i+1);
    assert.equal(row.previousSliceId,i===0?null:result.queueEntries[i-1].sliceId);
    assert.equal(row.previousSliceMustBeD0Complete,i>0);
    assert.ok(row.primarySourceNodeId);
    assert.ok(row.supportingSourceNodeIds.includes(row.primarySourceNodeId));
    assert.ok(row.knowledgePointIds.length>0);
  }
});

test("P07E W7 source discovery readback materializes exact queue identities",()=>{
  const result=materializeP07EW7DirectProductVerticalSliceQueue();
  console.log("P07E_W7_DISCOVERY="+JSON.stringify({
    status:result.status,
    metrics:result.metrics,
    capabilityPlan:result.capabilityPlan.map(row=>({capabilityId:row.capabilityId,deliveryWaveId:row.deliveryWaveId,requiredByKnowledgePointCount:row.requiredByKnowledgePointCount,blockedKnowledgePointCount:row.blockedKnowledgePointCount,dependencyCapabilityIds:[...row.dependencyCapabilityIds]})),
    directRows:result.directRows.map(row=>({knowledgePointId:row.knowledgePointId,primarySourceNodeId:row.primarySourceNodeId,supportingSourceNodeIds:[...row.supportingSourceNodeIds],intraWavePrerequisiteRank:row.intraWavePrerequisiteRank,primaryRuntimeProfileId:row.primaryRuntimeProfileId,requiredW7CapabilityIds:[...row.requiredW7CapabilityIds],contractOnlyRequiredCapabilityIds:[...row.contractOnlyRequiredCapabilityIds]})),
    queueEntries:result.queueEntries,
    derivedRegistrySnapshot:result.derivedRegistrySnapshot
  }));
});
