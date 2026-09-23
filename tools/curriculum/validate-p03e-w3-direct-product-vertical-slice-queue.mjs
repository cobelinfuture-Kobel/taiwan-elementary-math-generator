import {
  materializeP03EW3DirectProductVerticalSliceQueue,
} from "../../src/curriculum/full-product/p03e-w3-direct-product-vertical-slice-queue.mjs";

const unique = (values) => [...new Set(values)];

export function validateP03EW3DirectProductVerticalSliceQueue() {
  const evidence = materializeP03EW3DirectProductVerticalSliceQueue();
  const errors = [];
  const { policy, manifest, metrics, queueEntries, directRows } = evidence;
  const cohort = policy.cohortRules;
  const exact = manifest.expectedCounts;

  const exactChecks = [
    ["directW3KnowledgePointCount", metrics.directW3KnowledgePointCount],
    ["directW3SourceNodeCount", metrics.directW3SourceNodeCount],
    ["directW3RuntimeProfileCount", metrics.directW3RuntimeProfileCount],
    ["directW3PrerequisiteRankCount", metrics.directW3PrerequisiteRankCount],
    ["queueSliceCount", metrics.queueSliceCount],
    ["protectedD0ExcludedCount", metrics.protectedD0ExcludedCount],
    ["laterWaveDependentExcludedCount", metrics.laterWaveDependentExcludedCount],
    ["unaffectedNewProductRowCount", metrics.unaffectedNewProductRowCount],
    ["newProductAdmissionCount", metrics.newProductAdmissionCount],
  ];
  for (const [key, actual] of exactChecks) {
    if (actual !== exact[key]) errors.push(`P03E_EXACT_COUNT_INVALID:${key}:${actual}:${exact[key]}`);
  }
  if (metrics.maximumSliceKnowledgePointCount !== exact.maximumActualKnowledgePointsPerSlice) {
    errors.push(`P03E_MAX_ACTUAL_SLICE_COUNT_INVALID:${metrics.maximumSliceKnowledgePointCount}`);
  }
  if (metrics.directW3KnowledgePointCount !== cohort.expectedDirectKnowledgePointCount
    || metrics.protectedD0ExcludedCount !== cohort.expectedProtectedExcludedCount
    || metrics.laterWaveDependentExcludedCount !== cohort.expectedLaterWaveDependentExcludedCount
    || metrics.unaffectedNewProductRowCount !== cohort.expectedAllNewProductRowsStillNotAdmitted) {
    errors.push("P03E_POLICY_COHORT_COUNT_INVALID");
  }

  if (evidence.predecessorP03C.metrics.productionAdmittedW3CapabilityCount !== 7
    || evidence.predecessorP03C.metrics.remainingW3ContractCapabilityCount !== 0) {
    errors.push("P03E_P03C_PREDECESSOR_NOT_CLOSED");
  }
  if (evidence.predecessorP03DManifest.expectedCounts.revalidatedProtectedCount !== 4
    || evidence.predecessorP03DManifest.exactAcceptance.scopeBoundaryPassed !== true) {
    errors.push("P03E_P03D_PREDECESSOR_NOT_CLOSED");
  }

  for (const row of directRows) {
    if (row.assignedDeliveryWaveId !== cohort.assignedDeliveryWaveId) {
      errors.push(`P03E_DIRECT_ROW_WAVE_INVALID:${row.knowledgePointId}:${row.assignedDeliveryWaveId}`);
    }
    if (!row.directW3CohortMember || row.laterWaveDependent || row.protectedExistingD0) {
      errors.push(`P03E_DIRECT_ROW_COHORT_INVALID:${row.knowledgePointId}`);
    }
    if (!row.capabilityUnblocked || row.missingW3CapabilityIds.length !== 0) {
      errors.push(`P03E_DIRECT_ROW_CAPABILITY_BLOCKED:${row.knowledgePointId}`);
    }
    if (row.productAdmissionState !== cohort.requiredProductAdmissionState) {
      errors.push(`P03E_DIRECT_ROW_PRODUCT_STATE_INVALID:${row.knowledgePointId}:${row.productAdmissionState}`);
    }
    if (row.productProductionAdmitted || row.newlyProductAdmittedByP03C) {
      errors.push(`P03E_DIRECT_ROW_ALREADY_ADMITTED:${row.knowledgePointId}`);
    }
  }

  const allocated = queueEntries.flatMap((entry) => entry.knowledgePointIds);
  if (allocated.length !== metrics.directW3KnowledgePointCount
    || unique(allocated).length !== metrics.directW3KnowledgePointCount) {
    errors.push(`P03E_QUEUE_ALLOCATION_INVALID:${allocated.length}:${unique(allocated).length}`);
  }
  const directIds = new Set(directRows.map((row) => row.knowledgePointId));
  for (const knowledgePointId of allocated) {
    if (!directIds.has(knowledgePointId)) errors.push(`P03E_QUEUE_UNKNOWN_KP:${knowledgePointId}`);
  }

  for (const [index, entry] of queueEntries.entries()) {
    if (entry.queuePosition !== index + 1) errors.push(`P03E_QUEUE_POSITION_INVALID:${entry.sliceId}`);
    if (entry.knowledgePointCount < 1 || entry.knowledgePointCount > policy.sliceRules.maxKnowledgePointsPerSlice) {
      errors.push(`P03E_SLICE_SIZE_INVALID:${entry.sliceId}:${entry.knowledgePointCount}`);
    }
    const entryRows = directRows.filter((row) => entry.knowledgePointIds.includes(row.knowledgePointId));
    if (new Set(entryRows.map((row) => row.primarySourceNodeId)).size !== 1
      || entryRows[0]?.primarySourceNodeId !== entry.primarySourceNodeId) {
      errors.push(`P03E_SLICE_SOURCE_ATOMICITY_INVALID:${entry.sliceId}`);
    }
    if (new Set(entryRows.map((row) => row.intraWavePrerequisiteRank)).size !== 1
      || entryRows[0]?.intraWavePrerequisiteRank !== entry.intraWavePrerequisiteRank) {
      errors.push(`P03E_SLICE_RANK_ATOMICITY_INVALID:${entry.sliceId}`);
    }
    if (new Set(entryRows.map((row) => row.primaryRuntimeProfileId)).size !== 1
      || entryRows[0]?.primaryRuntimeProfileId !== entry.primaryRuntimeProfileId) {
      errors.push(`P03E_SLICE_PROFILE_ATOMICITY_INVALID:${entry.sliceId}`);
    }
    const expectedPrevious = index === 0 ? null : queueEntries[index - 1].sliceId;
    if (entry.previousSliceId !== expectedPrevious) errors.push(`P03E_SERIAL_PREDECESSOR_INVALID:${entry.sliceId}`);
    if (entry.targetEvidenceLevel !== policy.verticalSliceD0Gate.targetEvidenceLevel) {
      errors.push(`P03E_SLICE_TARGET_LEVEL_INVALID:${entry.sliceId}`);
    }
    if (entry.productProductionAdmitted || entry.implementationAllowedByP03E) {
      errors.push(`P03E_SCOPE_BOUNDARY_INVALID:${entry.sliceId}`);
    }
  }

  if (!evidence.queueRegistryPresent) errors.push("P03E_QUEUE_REGISTRY_MISSING");
  if (!evidence.queueRegistryParity) errors.push("P03E_QUEUE_REGISTRY_PARITY_INVALID");
  if (evidence.derivedRegistrySnapshot.queueDigest !== manifest.queueDigest) {
    errors.push(`P03E_QUEUE_DIGEST_INVALID:${evidence.derivedRegistrySnapshot.queueDigest}`);
  }
  if (manifest.mainlineBoundary.newProductAdmissionChanged
    || manifest.mainlineBoundary.productImplementationStarted
    || manifest.mainlineBoundary.visibleOutputChanged) {
    errors.push("P03E_MANIFEST_SCOPE_BOUNDARY_INVALID");
  }

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    status: evidence.status,
    queueFrozen: evidence.queueFrozen,
    queueRegistryPresent: evidence.queueRegistryPresent,
    queueRegistryParity: evidence.queueRegistryParity,
    metrics,
    nextExecutableSlice: evidence.nextExecutableSlice,
    derivedRegistrySnapshot: evidence.derivedRegistrySnapshot,
  });
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const result = validateP03EW3DirectProductVerticalSliceQueue();
  console.log(`P03E_METRICS=${JSON.stringify(result.metrics)}`);
  console.log(`P03E_NEXT_SLICE=${JSON.stringify(result.nextExecutableSlice)}`);
  console.log(`P03E_QUEUE_SNAPSHOT=${JSON.stringify(result.derivedRegistrySnapshot)}`);
  if (!result.ok) console.error(`P03E_ERRORS=${JSON.stringify(result.errors)}`);
  process.exitCode = result.ok ? 0 : 1;
}
