import {
  materializeP03EW3DirectProductVerticalSliceQueue,
} from "../../src/curriculum/full-product/p03e-w3-direct-product-vertical-slice-queue.mjs";

function unique(values) {
  return [...new Set(values)];
}

export function validateP03EW3DirectProductVerticalSliceQueue() {
  const evidence = materializeP03EW3DirectProductVerticalSliceQueue();
  const errors = [];
  const { policy, manifest, metrics, queueEntries, directRows } = evidence;
  const expected = policy.cohortRules;

  if (metrics.directW3KnowledgePointCount !== expected.expectedDirectKnowledgePointCount) {
    errors.push(`P03E_DIRECT_W3_COUNT_INVALID:${metrics.directW3KnowledgePointCount}`);
  }
  if (metrics.protectedD0ExcludedCount !== expected.expectedProtectedExcludedCount) {
    errors.push(`P03E_PROTECTED_EXCLUSION_COUNT_INVALID:${metrics.protectedD0ExcludedCount}`);
  }
  if (metrics.laterWaveDependentExcludedCount !== expected.expectedLaterWaveDependentExcludedCount) {
    errors.push(`P03E_LATER_WAVE_EXCLUSION_COUNT_INVALID:${metrics.laterWaveDependentExcludedCount}`);
  }
  if (metrics.unaffectedNewProductRowCount !== expected.expectedAllNewProductRowsStillNotAdmitted) {
    errors.push(`P03E_NEW_PRODUCT_ROW_COUNT_INVALID:${metrics.unaffectedNewProductRowCount}`);
  }
  if (metrics.newProductAdmissionCount !== 0) errors.push("P03E_NEW_PRODUCT_ADMISSION_CHANGED");

  if (evidence.predecessorP03C.metrics.productionAdmittedW3CapabilityCount !== 7
    || evidence.predecessorP03C.metrics.remainingW3ContractCapabilityCount !== 0) {
    errors.push("P03E_P03C_PREDECESSOR_NOT_CLOSED");
  }
  if (evidence.predecessorP03DManifest.expectedCounts.revalidatedProtectedCount !== 4
    || evidence.predecessorP03DManifest.exactAcceptance.scopeBoundaryPassed !== true) {
    errors.push("P03E_P03D_PREDECESSOR_NOT_CLOSED");
  }

  for (const row of directRows) {
    if (row.assignedDeliveryWaveId !== expected.assignedDeliveryWaveId) {
      errors.push(`P03E_DIRECT_ROW_WAVE_INVALID:${row.knowledgePointId}:${row.assignedDeliveryWaveId}`);
    }
    if (!row.directW3CohortMember || row.laterWaveDependent || row.protectedExistingD0) {
      errors.push(`P03E_DIRECT_ROW_COHORT_INVALID:${row.knowledgePointId}`);
    }
    if (!row.capabilityUnblocked || row.missingW3CapabilityIds.length !== 0) {
      errors.push(`P03E_DIRECT_ROW_CAPABILITY_BLOCKED:${row.knowledgePointId}`);
    }
    if (row.productAdmissionState !== expected.requiredProductAdmissionState) {
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
    const expectedPosition = index + 1;
    if (entry.queuePosition !== expectedPosition) errors.push(`P03E_QUEUE_POSITION_INVALID:${entry.sliceId}`);
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

  if (metrics.maximumSliceKnowledgePointCount > policy.sliceRules.maxKnowledgePointsPerSlice) {
    errors.push(`P03E_MAX_SLICE_SIZE_INVALID:${metrics.maximumSliceKnowledgePointCount}`);
  }
  if (evidence.queueRegistryPresent && !evidence.queueRegistryParity) {
    errors.push("P03E_QUEUE_REGISTRY_PARITY_INVALID");
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
