import assert from "node:assert/strict";
import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
const r=materializeP07EW7DirectProductVerticalSliceQueue();
assert.equal(r.status,"W7_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN");
assert.equal(r.queueRegistryPresent,true);
assert.equal(r.queueRegistryParity,true);
assert.equal(r.queueFrozen,true);
assert.equal(r.metrics.directW7KnowledgePointCount,32);
assert.equal(r.metrics.directW7CapabilityPlanCount,3);
assert.equal(r.metrics.queueSliceCount,26);
assert.equal(r.derivedRegistrySnapshot.queueDigest,"ad37a23f07b3de22a088f5bf9f59e2b45f13cc3c350bb84def21860d21135843");
console.log("P07E_W7_ESCALATION="+JSON.stringify(r.directRows.map(row=>({
  knowledgePointId:row.knowledgePointId,
  baseDeliveryWaveId:row.baseDeliveryWaveId,
  deliveryWaveId:row.deliveryWaveId,
  waveEscalatedByPrerequisite:row.waveEscalatedByPrerequisite,
  prerequisiteWaveLowerBound:row.prerequisiteWaveLowerBound,
  primarySourceNodeId:row.primarySourceNodeId,
  primaryRuntimeProfileId:row.primaryRuntimeProfileId
}))));
console.log(JSON.stringify({
  schemaName:"P07EW7QueueFrozenReadbackV1",
  status:"PASS",
  queueState:r.status,
  queueRegistryParity:r.queueRegistryParity,
  metrics:r.metrics,
  firstExecutableSlice:r.nextExecutableSlice,
  queueDigest:r.derivedRegistrySnapshot.queueDigest,
  orderedSliceIds:r.derivedRegistrySnapshot.orderedSliceIds,
  orderedKnowledgePointIds:r.derivedRegistrySnapshot.orderedKnowledgePointIds
},null,2));
