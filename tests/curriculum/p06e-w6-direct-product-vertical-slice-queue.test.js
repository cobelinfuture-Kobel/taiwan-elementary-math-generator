import test from "node:test";
import assert from "node:assert/strict";
import { materializeP06EW6DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p06e-w6-direct-product-vertical-slice-queue.mjs";

const W6_CAPS = new Set([
  "cap_table_data_model","cap_chart_data_model","cap_table_representation","cap_chart_representation",
  "cap_coordinate_map_representation","cap_pattern_sequence_reasoning","cap_symbolic_relation_reasoning",
  "cap_data_domain_validator","cap_pattern_relation_validator",
]);

test("P06E freezes exactly the 33 R05-W6 KnowledgePoints into 20 deterministic slices", () => {
  const result = materializeP06EW6DirectProductVerticalSliceQueue();
  assert.equal(result.metrics.directW6KnowledgePointCount, 33);
  assert.equal(result.metrics.directW6CapabilityPlanCount, 9);
  assert.equal(result.metrics.allocatedKnowledgePointCount, 33);
  assert.equal(result.metrics.uniqueAllocatedKnowledgePointCount, 33);
  assert.equal(result.metrics.queueSliceCount, 20);
  assert.equal(result.metrics.maximumSliceKnowledgePointCount, 3);
  assert.equal(result.metrics.directW6SourceNodeCount, 8);
  assert.equal(result.metrics.directW6RuntimeProfileCount, 5);
  assert.equal(result.metrics.directW6PrerequisiteRankCount, 11);
  assert.ok(result.directRows.every((row) => row.deliveryWaveId === "R05-W6"));
  assert.ok(result.directRows.every((row) => row.productionAdmissionState === "PLANNED_NOT_ADMITTED"));
  assert.ok(result.queueEntries.every((row) => row.assignedDeliveryWaveId === "R05-W6"));
  assert.ok(result.queueEntries.every((row) => row.requiredW6CapabilityIds.every((id) => W6_CAPS.has(id))));
});

test("P06E W6 slices never mix rank source or runtime profile and remain strictly serial", () => {
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

test("P06E frozen registry exactly matches executable R05 authority and locks Q001", () => {
  const result = materializeP06EW6DirectProductVerticalSliceQueue();
  assert.equal(result.status, "W6_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN");
  assert.equal(result.queueRegistryPresent, true);
  assert.equal(result.queueRegistryParity, true);
  assert.equal(result.queueFrozen, true);
  assert.equal(result.derivedRegistrySnapshot.queueDigest, "9e22094dee0d66e459848741894a3347df1c985ec8720cdabb3efc2e5a68e1be");
  assert.equal(result.nextExecutableSlice.sliceId, "p06e_q001_r0_g3a_u07_3a07_profile_pattern_relation_c1");
  assert.deepEqual(result.nextExecutableSlice.knowledgePointIds, [
    "kp_arithmetic_sequence_extension",
    "kp_repeating_visual_pattern",
    "kp_spatial_growth_pattern_count",
  ]);
  assert.deepEqual(result.nextExecutableSlice.requiredW6CapabilityIds, [
    "cap_pattern_relation_validator",
    "cap_pattern_sequence_reasoning",
  ]);
  assert.equal(result.queueEntries.at(-1).sliceId, "p06e_q020_r11_g6b_u05_6b05_profile_word_problem_c1");
  assert.equal(result.manifest.scope.queueFreezeOnly, true);
  assert.equal(result.manifest.scope.w6ImplementationStarted, false);
  assert.equal(result.manifest.scope.productionAdmissionChanged, false);
});

test("P06E preserves the corrected G4A-U07 multiplicative-pattern assignment in W6", () => {
  const result = materializeP06EW6DirectProductVerticalSliceQueue();
  const row = result.directRows.find((item) => item.knowledgePointId === "kp_g4a_u07_quantity_multiplicative_pattern");
  assert.ok(row);
  assert.equal(row.deliveryWaveId, "R05-W6");
  assert.equal(row.primaryRuntimeProfileId, "profile_pattern_relation");
  assert.ok(result.queueEntries.some((slice) => slice.knowledgePointIds.includes(row.knowledgePointId)));
});
