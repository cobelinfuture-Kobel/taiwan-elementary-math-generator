import test from "node:test";
import assert from "node:assert/strict";

import {
  materializeP03EW3DirectProductVerticalSliceQueue,
} from "../../src/curriculum/full-product/p03e-w3-direct-product-vertical-slice-queue.mjs";
import {
  validateP03EW3DirectProductVerticalSliceQueue,
} from "../../tools/curriculum/validate-p03e-w3-direct-product-vertical-slice-queue.mjs";

test("P03E isolates the exact direct W3 new-product cohort", () => {
  const evidence = materializeP03EW3DirectProductVerticalSliceQueue();
  console.log(`P03E_METRICS=${JSON.stringify(evidence.metrics)}`);
  console.log(`P03E_NEXT_SLICE=${JSON.stringify(evidence.nextExecutableSlice)}`);
  console.log(`P03E_QUEUE_SNAPSHOT=${JSON.stringify(evidence.derivedRegistrySnapshot)}`);
  assert.equal(evidence.metrics.directW3KnowledgePointCount, 82);
  assert.equal(evidence.metrics.directW3SourceNodeCount, 16);
  assert.equal(evidence.metrics.directW3RuntimeProfileCount, 3);
  assert.equal(evidence.metrics.directW3PrerequisiteRankCount, 10);
  assert.equal(evidence.metrics.queueSliceCount, 53);
  assert.equal(evidence.metrics.maximumSliceKnowledgePointCount, 4);
  assert.equal(evidence.metrics.protectedD0ExcludedCount, 4);
  assert.equal(evidence.metrics.laterWaveDependentExcludedCount, 33);
  assert.equal(evidence.metrics.unaffectedNewProductRowCount, 115);
  assert.equal(evidence.metrics.newProductAdmissionCount, 0);
  assert.equal(evidence.directRows.every((row) => row.assignedDeliveryWaveId === "R05-W3"), true);
  assert.equal(evidence.directRows.every((row) => row.capabilityUnblocked), true);
  assert.equal(evidence.directRows.every((row) => !row.productProductionAdmitted), true);
});

test("P03E queue allocates every direct row exactly once", () => {
  const evidence = materializeP03EW3DirectProductVerticalSliceQueue();
  const allocated = evidence.queueEntries.flatMap((entry) => entry.knowledgePointIds);
  assert.equal(allocated.length, 82);
  assert.equal(new Set(allocated).size, 82);
  assert.deepEqual(
    [...allocated].sort(),
    evidence.directRows.map((row) => row.knowledgePointId).sort(),
  );
});

test("P03E slices preserve source, rank, profile and size atomicity", () => {
  const evidence = materializeP03EW3DirectProductVerticalSliceQueue();
  const rowById = new Map(evidence.directRows.map((row) => [row.knowledgePointId, row]));
  for (const entry of evidence.queueEntries) {
    const rows = entry.knowledgePointIds.map((id) => rowById.get(id));
    assert.equal(new Set(rows.map((row) => row.primarySourceNodeId)).size, 1);
    assert.equal(new Set(rows.map((row) => row.intraWavePrerequisiteRank)).size, 1);
    assert.equal(new Set(rows.map((row) => row.primaryRuntimeProfileId)).size, 1);
    assert.ok(entry.knowledgePointCount >= 1);
    assert.ok(entry.knowledgePointCount <= 8);
    assert.equal(entry.targetEvidenceLevel, "E6_D0_COMPLETE");
    assert.equal(entry.productProductionAdmitted, false);
    assert.equal(entry.implementationAllowedByP03E, false);
  }
});

test("P03E queue is strictly serial", () => {
  const evidence = materializeP03EW3DirectProductVerticalSliceQueue();
  for (const [index, entry] of evidence.queueEntries.entries()) {
    assert.equal(entry.queuePosition, index + 1);
    assert.equal(entry.previousSliceId, index === 0 ? null : evidence.queueEntries[index - 1].sliceId);
    assert.equal(entry.previousSliceMustBeD0Complete, index > 0);
  }
});

test("P03E frozen registry exactly matches the derived queue", () => {
  const result = validateP03EW3DirectProductVerticalSliceQueue();
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.queueRegistryPresent, true);
  assert.equal(result.queueRegistryParity, true);
  assert.equal(result.queueFrozen, true);
  assert.equal(result.derivedRegistrySnapshot.queueDigest, "06ce50b291f87f87dd4ef7a0dea04c21241dc70e7435fb62ab93dc64b31d4ce7");
  assert.equal(result.nextExecutableSlice.sliceId, "p03e_q001_r4_g3a_u08_3a08_profile_fraction_c1");
});
