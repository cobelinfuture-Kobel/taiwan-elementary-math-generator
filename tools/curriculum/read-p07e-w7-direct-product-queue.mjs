import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
const r=materializeP07EW7DirectProductVerticalSliceQueue();
console.log("P07E_W7_REGISTRY="+JSON.stringify(r.derivedRegistrySnapshot));
console.log("P07E_W7_SOURCE_ROWS="+JSON.stringify(r.directRows.map(row=>({
  knowledgePointId:row.knowledgePointId,
  primarySourceNodeId:row.primarySourceNodeId,
  supportingSourceNodeIds:[...row.supportingSourceNodeIds],
  intraWavePrerequisiteRank:row.intraWavePrerequisiteRank,
  primaryRuntimeProfileId:row.primaryRuntimeProfileId,
  requiredW7CapabilityIds:[...row.requiredW7CapabilityIds]
}))));
console.log(JSON.stringify({
  schemaName:"P07EW7SourceDiscoveryReadbackV1",
  status:r.status,
  metrics:r.metrics,
  capabilityPlan:r.capabilityPlan.map(row=>({
    capabilityId:row.capabilityId,
    deliveryWaveId:row.deliveryWaveId,
    requiredByKnowledgePointCount:row.requiredByKnowledgePointCount,
    blockedKnowledgePointCount:row.blockedKnowledgePointCount,
    dependencyCapabilityIds:[...row.dependencyCapabilityIds]
  })),
  firstExecutableSlice:r.nextExecutableSlice,
  lastSliceId:r.derivedRegistrySnapshot.lastSliceId
},null,2));
