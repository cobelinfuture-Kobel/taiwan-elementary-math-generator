import test from "node:test";
import assert from "node:assert/strict";

import {
  materializeP03EW3DirectProductVerticalSliceQueue,
} from "../../src/curriculum/full-product/p03e-w3-direct-product-vertical-slice-queue.mjs";

test("P03E consumes closed P03C capability authority and completed P03D compatibility state", () => {
  const evidence = materializeP03EW3DirectProductVerticalSliceQueue();
  assert.equal(evidence.predecessorP03C.metrics.productionAdmittedW3CapabilityCount, 7);
  assert.equal(evidence.predecessorP03C.metrics.remainingW3ContractCapabilityCount, 0);
  assert.equal(evidence.predecessorP03DManifest.expectedCounts.revalidatedProtectedCount, 4);
  assert.equal(evidence.predecessorP03DManifest.exactAcceptance.protectedAdmissionPreservationPassed, true);
});

test("P03E does not pull protected or later-wave rows into the direct queue", () => {
  const evidence = materializeP03EW3DirectProductVerticalSliceQueue();
  const queuedIds = new Set(evidence.queueEntries.flatMap((entry) => entry.knowledgePointIds));
  for (const row of evidence.protectedExcludedRows) assert.equal(queuedIds.has(row.knowledgePointId), false);
  for (const row of evidence.laterWaveExcludedRows) assert.equal(queuedIds.has(row.knowledgePointId), false);
  assert.equal(evidence.protectedExcludedRows.length, 4);
  assert.equal(evidence.laterWaveExcludedRows.length, 33);
});

test("P03E records the complete per-slice D0 gate without starting implementation", () => {
  const evidence = materializeP03EW3DirectProductVerticalSliceQueue();
  const requiredNodes = evidence.policy.verticalSliceD0Gate.requiredNodes;
  assert.deepEqual(requiredNodes, [
    "SOURCE_EVIDENCE",
    "KNOWLEDGE_POINT_IDENTITY",
    "TAG_REGISTRY_BINDING",
    "FORMAL_MAPPING",
    "PATTERN_SPEC",
    "SHARED_GENERATOR_BINDING",
    "DETERMINISTIC_VALIDATOR_BINDING",
    "PUBLIC_SOURCE_ADAPTER",
    "PUBLIC_UI_SELECTION",
    "WORKSHEET_AND_ANSWER_KEY",
    "PRODUCTION_HTML",
    "CHROMIUM_PDF_AND_PRINT",
    "PRODUCT_ADMISSION_CLAIM",
  ]);
  assert.equal(evidence.queueEntries.every((entry) => entry.requiredProductNodes.length === requiredNodes.length), true);
  assert.equal(evidence.queueEntries.every((entry) => entry.admissionState === "QUEUE_FROZEN_IMPLEMENTATION_NOT_STARTED"), true);
});

test("P03E exposes exactly one next executable slice", () => {
  const evidence = materializeP03EW3DirectProductVerticalSliceQueue();
  assert.equal(evidence.nextExecutableSlice.queuePosition, 1);
  assert.equal(evidence.nextExecutableSlice.previousSliceId, null);
  assert.equal(evidence.nextExecutableSlice.implementationTaskId, "P03F_W3DirectProductVerticalSlice001Implementation");
  assert.equal(evidence.policy.sliceRules.executionMode, "STRICT_SINGLE_SLICE_SERIAL");
});
