import assert from "node:assert/strict";
import { materializeP06EW6DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p06e-w6-direct-product-vertical-slice-queue.mjs";
const result = materializeP06EW6DirectProductVerticalSliceQueue();
assert.equal(result.status, "W6_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN");
assert.equal(result.queueRegistryPresent, true);
assert.equal(result.queueRegistryParity, true);
assert.equal(result.queueFrozen, true);
assert.equal(result.metrics.directW6KnowledgePointCount, 33);
assert.equal(result.metrics.directW6CapabilityPlanCount, 9);
assert.equal(result.metrics.queueSliceCount, 20);
assert.equal(result.metrics.directW6SourceNodeCount, 8);
assert.equal(result.metrics.directW6RuntimeProfileCount, 5);
assert.equal(result.metrics.directW6PrerequisiteRankCount, 11);
assert.equal(result.metrics.maximumSliceKnowledgePointCount, 3);
assert.equal(result.derivedRegistrySnapshot.queueDigest, "9e22094dee0d66e459848741894a3347df1c985ec8720cdabb3efc2e5a68e1be");
assert.equal(result.nextExecutableSlice.sliceId, "p06e_q001_r0_g3a_u07_3a07_profile_pattern_relation_c1");
assert.deepEqual(result.nextExecutableSlice.knowledgePointIds, ["kp_arithmetic_sequence_extension","kp_repeating_visual_pattern","kp_spatial_growth_pattern_count"]);
assert.ok(result.queueEntries.every((row) => row.assignedDeliveryWaveId === "R05-W6"));
assert.ok(result.queueEntries.every((row) => row.productProductionAdmitted === false));
assert.ok(result.queueEntries.every((row) => row.implementationAllowedByP06E === false));
console.log(JSON.stringify({
  schemaName: "P06EW6QueueFrozenReadbackV1",
  status: "PASS",
  queueState: result.status,
  queueRegistryParity: result.queueRegistryParity,
  metrics: result.metrics,
  firstExecutableSlice: result.nextExecutableSlice,
  queueDigest: result.derivedRegistrySnapshot.queueDigest,
  orderedSliceIds: result.derivedRegistrySnapshot.orderedSliceIds,
  orderedKnowledgePointIds: result.derivedRegistrySnapshot.orderedKnowledgePointIds
}, null, 2));
