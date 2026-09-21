import {materializeP07EW7DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p07e-w7-direct-product-vertical-slice-queue.mjs";
const r=materializeP07EW7DirectProductVerticalSliceQueue();
console.log(JSON.stringify({
  schemaName:"P07EW7SourceDiscoveryReadbackV1",
  status:r.status,
  metrics:r.metrics,
  capabilityPlan:r.capabilityPlan,
  directRows:r.directRows,
  queueEntries:r.queueEntries,
  derivedRegistrySnapshot:r.derivedRegistrySnapshot
},null,2));
