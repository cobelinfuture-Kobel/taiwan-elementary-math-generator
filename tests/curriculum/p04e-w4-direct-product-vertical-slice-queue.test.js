import test from "node:test";
import assert from "node:assert/strict";

import {
  materializeP04EW4DirectProductVerticalSliceQueue,
} from "../../src/curriculum/full-product/p04e-w4-direct-product-vertical-slice-queue.mjs";

test("P04E derives exactly the 53 R05-W4 KnowledgePoints into one deterministic queue", () => {
  const result = materializeP04EW4DirectProductVerticalSliceQueue();
  assert.equal(result.metrics.directW4KnowledgePointCount, 53);
  assert.equal(result.metrics.allocatedKnowledgePointCount, 53);
  assert.equal(result.metrics.uniqueAllocatedKnowledgePointCount, 53);
  assert.ok(result.metrics.queueSliceCount > 0);
  assert.ok(result.metrics.maximumSliceKnowledgePointCount <= 8);
  assert.ok(result.directRows.every((row) => row.deliveryWaveId === "R05-W4"));
  assert.ok(result.queueEntries.every((row) => row.assignedDeliveryWaveId === "R05-W4"));
  assert.ok(result.nextExecutableSlice);
  console.log(`P04E_W4_DERIVED_QUEUE_SNAPSHOT=${JSON.stringify(result.derivedRegistrySnapshot)}`);
  console.log(`P04E_W4_METRICS=${JSON.stringify(result.metrics)}`);
});

test("P04E W4 slices never mix rank, source, or runtime profile", () => {
  const result = materializeP04EW4DirectProductVerticalSliceQueue();
  for (const slice of result.queueEntries) {
    const rows = result.directRows.filter((row) => slice.knowledgePointIds.includes(row.knowledgePointId));
    assert.ok(rows.every((row) => row.intraWavePrerequisiteRank === slice.intraWavePrerequisiteRank));
    assert.ok(rows.every((row) => row.primarySourceNodeId === slice.primarySourceNodeId));
    assert.ok(rows.every((row) => row.primaryRuntimeProfileId === slice.primaryRuntimeProfileId));
  }
});
