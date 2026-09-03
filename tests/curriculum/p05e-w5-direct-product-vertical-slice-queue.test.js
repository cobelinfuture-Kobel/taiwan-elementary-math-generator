import test from "node:test";
import assert from "node:assert/strict";

import {
  materializeP05EW5DirectProductVerticalSliceQueue,
} from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";

test("P05E derives exactly the 79 R05-W5 KnowledgePoints into one deterministic queue", () => {
  const result = materializeP05EW5DirectProductVerticalSliceQueue();
  assert.equal(result.metrics.directW5KnowledgePointCount, 79);
  assert.equal(result.metrics.allocatedKnowledgePointCount, 79);
  assert.equal(result.metrics.uniqueAllocatedKnowledgePointCount, 79);
  assert.equal(result.metrics.queueSliceCount, 63);
  assert.equal(result.metrics.maximumSliceKnowledgePointCount, 3);
  assert.ok(result.directRows.every((row) => row.deliveryWaveId === "R05-W5"));
  assert.ok(result.queueEntries.every((row) => row.assignedDeliveryWaveId === "R05-W5"));
  assert.ok(result.nextExecutableSlice);
});

test("P05E W5 slices never mix rank, source, or runtime profile", () => {
  const result = materializeP05EW5DirectProductVerticalSliceQueue();
  for (const slice of result.queueEntries) {
    const rows = result.directRows.filter((row) => slice.knowledgePointIds.includes(row.knowledgePointId));
    assert.ok(rows.every((row) => row.intraWavePrerequisiteRank === slice.intraWavePrerequisiteRank));
    assert.ok(rows.every((row) => row.primarySourceNodeId === slice.primarySourceNodeId));
    assert.ok(rows.every((row) => row.primaryRuntimeProfileId === slice.primaryRuntimeProfileId));
  }
});

test("P05E frozen registry exactly matches the deterministic W5 queue", () => {
  const result = materializeP05EW5DirectProductVerticalSliceQueue();
  assert.equal(result.status, "W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN");
  assert.equal(result.queueRegistryPresent, true);
  assert.equal(result.queueRegistryParity, true);
  assert.equal(result.queueFrozen, true);
  assert.equal(result.metrics.queueSliceCount, 63);
  assert.equal(result.derivedRegistrySnapshot.queueDigest, "a4dae65a1a907ba963a135fce84ba292b8486a12513ae8f1fa54fbf07a6598ae");
  assert.equal(result.nextExecutableSlice.sliceId, "p05e_q001_r0_g3a_u05_3a05_profile_geometry_property_c1");
  assert.deepEqual(result.nextExecutableSlice.knowledgePointIds, ["kp_angle_parts_identification"]);
  assert.equal(result.manifest.scope.queueFreezeOnly, true);
  assert.equal(result.manifest.scope.w5ImplementationStarted, false);
  assert.equal(result.manifest.scope.productionAdmissionChanged, false);
});
