import assert from "node:assert/strict";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";
const r=materializeP08EW8DirectProductVerticalSliceQueue();
assert.equal(r.status,"W8_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN");
assert.equal(r.queueRegistryPresent,true);
assert.equal(r.queueRegistryParity,true);
assert.equal(r.queueFrozen,true);
assert.equal(r.metrics.directW8KnowledgePointCount,24);
assert.equal(r.metrics.directW8CapabilityPlanCount,0);
assert.equal(r.metrics.directW8SourceNodeCount,11);
assert.equal(r.metrics.directW8SupportingSourceNodeCount,12);
assert.equal(r.metrics.queueSliceCount,22);
assert.equal(r.derivedRegistrySnapshot.queueDigest,"597a6fa497c8ac7738247847ef321d0c753e79800f5c38097b7a7a160be2f484");
console.log("P08E_W8_ESCALATION="+JSON.stringify(r.directRows.map(row=>({
  knowledgePointId:row.knowledgePointId,
  baseDeliveryWaveId:row.baseDeliveryWaveId,
  deliveryWaveId:row.deliveryWaveId,
  waveEscalatedByPrerequisite:row.waveEscalatedByPrerequisite,
  prerequisiteWaveLowerBound:row.prerequisiteWaveLowerBound,
  primarySourceNodeId:row.primarySourceNodeId,
  primaryRuntimeProfileId:row.primaryRuntimeProfileId,
  blockingCapabilityWaveIds:[...row.blockingCapabilityWaveIds]
}))));
console.log(JSON.stringify({
  schemaName:"P08EW8QueueFrozenReadbackV1",
  status:"PASS",
  queueState:r.status,
  queueRegistryParity:r.queueRegistryParity,
  metrics:r.metrics,
  firstExecutableSlice:r.nextExecutableSlice,
  queueDigest:r.derivedRegistrySnapshot.queueDigest,
  orderedSliceIds:r.derivedRegistrySnapshot.orderedSliceIds,
  orderedKnowledgePointIds:r.derivedRegistrySnapshot.orderedKnowledgePointIds
},null,2));
