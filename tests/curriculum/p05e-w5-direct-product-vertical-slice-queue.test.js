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
  assert.ok(result.metrics.queueSliceCount > 0);
  assert.ok(result.metrics.maximumSliceKnowledgePointCount <= 8);
  assert.ok(result.directRows.every((row) => row.deliveryWaveId === "R05-W5"));
  assert.ok(result.queueEntries.every((row) => row.assignedDeliveryWaveId === "R05-W5"));
  assert.ok(result.nextExecutableSlice);
  console.log(`P05E_W5_DERIVED_QUEUE_SNAPSHOT=${JSON.stringify(result.derivedRegistrySnapshot)}`);
  console.log(`P05E_W5_METRICS=${JSON.stringify(result.metrics)}`);
  console.log(`P05E_W5_FIRST_SLICE=${JSON.stringify(result.nextExecutableSlice)}`);
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

test("P05E W5 initial derivation remains planning-only until the deterministic registry snapshot is frozen", () => {
  const result = materializeP05EW5DirectProductVerticalSliceQueue();
  assert.equal(result.status, "W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_DERIVED_PENDING_SNAPSHOT_FREEZE");
  assert.equal(result.queueRegistryPresent, false);
  assert.equal(result.queueRegistryParity, false);
  assert.equal(result.queueFrozen, false);
  assert.equal(result.manifest.scope.queueFreezeOnly, true);
  assert.equal(result.manifest.scope.w5ImplementationStarted, false);
  assert.equal(result.manifest.scope.productionAdmissionChanged, false);
});
