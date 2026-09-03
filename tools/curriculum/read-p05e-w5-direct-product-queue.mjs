import assert from "node:assert/strict";
import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";

const result = materializeP05EW5DirectProductVerticalSliceQueue();
assert.equal(result.metrics.directW5KnowledgePointCount, 79);
assert.equal(result.metrics.allocatedKnowledgePointCount, 79);
assert.equal(result.metrics.uniqueAllocatedKnowledgePointCount, 79);
assert.ok(result.metrics.queueSliceCount > 0);
assert.ok(result.metrics.maximumSliceKnowledgePointCount <= 8);
assert.ok(result.nextExecutableSlice);
assert.ok(result.queueEntries.every((row) => row.assignedDeliveryWaveId === "R05-W5"));
assert.ok(result.queueEntries.every((row) => row.productProductionAdmitted === false));
assert.ok(result.queueEntries.every((row) => row.implementationAllowedByP05E === false));

console.log(JSON.stringify({
  schemaName: "P05EW5QueueDerivationReadbackV1",
  status: "PASS",
  queueState: result.status,
  metrics: result.metrics,
  firstExecutableSlice: result.nextExecutableSlice,
  derivedRegistrySnapshot: result.derivedRegistrySnapshot,
}, null, 2));
