import assert from "node:assert/strict";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";
const r=materializeP08EW8DirectProductVerticalSliceQueue();
assert.equal(r.status,"W8_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_DERIVED_PENDING_SNAPSHOT_FREEZE");
assert.equal(r.queueRegistryPresent,false);
assert.equal(r.queueFrozen,false);
assert.equal(r.metrics.directW8KnowledgePointCount,24);
assert.equal(r.metrics.directW8CapabilityPlanCount,0);
const sourceViews=r.predecessorR05.prerequisiteGraph.sourceViews;
const sourceById=new Map(sourceViews.map(row=>[row.sourceNodeId,row]));
const supportingIds=[...new Set(r.directRows.flatMap(row=>row.supportingSourceNodeIds))].sort();
console.log("P08E_W8_SOURCE_AUTHORITY="+JSON.stringify(supportingIds.map(id=>sourceById.get(id))));
console.log(JSON.stringify({
  schemaName:"P08EW8QueueDiscoveryReadbackV1",
  status:"PASS",
  queueState:r.status,
  metrics:r.metrics,
  queueDigest:r.derivedRegistrySnapshot.queueDigest,
  firstExecutableSlice:r.nextExecutableSlice,
  lastSliceId:r.derivedRegistrySnapshot.lastSliceId,
  orderedSliceIds:r.derivedRegistrySnapshot.orderedSliceIds,
  orderedKnowledgePointIds:r.derivedRegistrySnapshot.orderedKnowledgePointIds,
  rows:r.directRows.map(row=>({
    knowledgePointId:row.knowledgePointId,
    baseDeliveryWaveId:row.baseDeliveryWaveId,
    waveEscalatedByPrerequisite:row.waveEscalatedByPrerequisite,
    prerequisiteWaveLowerBound:row.prerequisiteWaveLowerBound,
    primarySourceNodeId:row.primarySourceNodeId,
    supportingSourceNodeIds:[...row.supportingSourceNodeIds],
    intraWavePrerequisiteRank:row.intraWavePrerequisiteRank,
    primaryRuntimeProfileId:row.primaryRuntimeProfileId,
    blockingCapabilityIds:[...row.blockingCapabilityIds],
    blockingCapabilityWaveIds:[...row.blockingCapabilityWaveIds]
  }))
},null,2));
