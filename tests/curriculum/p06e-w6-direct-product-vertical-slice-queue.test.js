import test from "node:test";
import assert from "node:assert/strict";
import { materializeP06EW6DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p06e-w6-direct-product-vertical-slice-queue.mjs";

const W6_CAPS = new Set([
  "cap_table_data_model","cap_chart_data_model","cap_table_representation","cap_chart_representation",
  "cap_coordinate_map_representation","cap_pattern_sequence_reasoning","cap_symbolic_relation_reasoning",
  "cap_data_domain_validator","cap_pattern_relation_validator",
]);

test("P06E derives exactly the 33 R05-W6 KnowledgePoints from executable R05 authority", () => {
  const result = materializeP06EW6DirectProductVerticalSliceQueue();
  assert.equal(result.metrics.directW6KnowledgePointCount, 33);
  assert.equal(result.metrics.directW6CapabilityPlanCount, 9);
  assert.equal(result.metrics.allocatedKnowledgePointCount, 33);
  assert.equal(result.metrics.uniqueAllocatedKnowledgePointCount, 33);
  assert.ok(result.metrics.queueSliceCount > 0);
  assert.ok(result.metrics.maximumSliceKnowledgePointCount <= 8);
  assert.ok(result.directRows.every((row) => row.deliveryWaveId === "R05-W6"));
  assert.ok(result.directRows.every((row) => row.productionAdmissionState === "PLANNED_NOT_ADMITTED"));
  assert.ok(result.queueEntries.every((row) => row.assignedDeliveryWaveId === "R05-W6"));
  assert.ok(result.queueEntries.every((row) => row.requiredW6CapabilityIds.every((id) => W6_CAPS.has(id))));
  assert.ok(result.nextExecutableSlice);
});

test("P06E W6 slices never mix rank, source, or runtime profile and remain strictly serial", () => {
  const result = materializeP06EW6DirectProductVerticalSliceQueue();
  for (const [index, slice] of result.queueEntries.entries()) {
    const rows = result.directRows.filter((row) => slice.knowledgePointIds.includes(row.knowledgePointId));
    assert.ok(rows.every((row) => row.intraWavePrerequisiteRank === slice.intraWavePrerequisiteRank));
    assert.ok(rows.every((row) => row.primarySourceNodeId === slice.primarySourceNodeId));
    assert.ok(rows.every((row) => row.primaryRuntimeProfileId === slice.primaryRuntimeProfileId));
    assert.equal(slice.previousSliceId, index === 0 ? null : result.queueEntries[index - 1].sliceId);
    assert.equal(slice.previousSliceMustBeD0Complete, index > 0);
    assert.equal(slice.productProductionAdmitted, false);
    assert.equal(slice.implementationAllowedByP06E, false);
  }
});

test("P06E initial derivation is planning-only and emits a freezeable deterministic snapshot", () => {
  const result = materializeP06EW6DirectProductVerticalSliceQueue();
  assert.equal(result.manifest.scope.queueFreezeOnly, true);
  assert.equal(result.manifest.scope.w6ImplementationStarted, false);
  assert.equal(result.manifest.scope.productionAdmissionChanged, false);
  assert.equal(result.derivedRegistrySnapshot.directW6KnowledgePointCount, 33);
  assert.equal(result.derivedRegistrySnapshot.queueSliceCount, result.metrics.queueSliceCount);
  assert.equal(result.derivedRegistrySnapshot.orderedKnowledgePointIds.length, 33);
  assert.equal(new Set(result.derivedRegistrySnapshot.orderedKnowledgePointIds).size, 33);
  assert.equal(result.derivedRegistrySnapshot.firstExecutableSlice.queuePosition, 1);
  if (!result.queueRegistryPresent) {
    assert.equal(result.status, "W6_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_DERIVED_PENDING_SNAPSHOT_FREEZE");
    assert.equal(result.queueFrozen, false);
  }
});
