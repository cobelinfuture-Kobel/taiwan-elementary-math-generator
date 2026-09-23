import { pathToFileURL } from "node:url";

import { materializeR05DeliveryWaveRebase } from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

function finding(code, details = {}) {
  return Object.freeze({ code, ...details });
}

function waveOrderMap(plan) {
  return new Map(plan.waves.map((row) => [row.waveId, row.order]));
}

function prerequisiteWaveThreshold(plan, knowledgePointId, waveOrderByKnowledgePointId) {
  const incoming = plan.prerequisiteGraph.incomingByTarget.get(knowledgePointId) ?? [];
  const requiredOrders = incoming
    .filter((edge) => edge.distanceBearing && edge.dependencyStrength === "required")
    .map((edge) => waveOrderByKnowledgePointId.get(edge.fromKnowledgePointId) ?? 0);
  const alternatives = incoming
    .filter((edge) => edge.distanceBearing && edge.dependencyStrength === "alternative");
  const byGroup = new Map();
  for (const edge of alternatives) {
    if (!byGroup.has(edge.alternativeGroupId)) byGroup.set(edge.alternativeGroupId, []);
    byGroup.get(edge.alternativeGroupId).push(
      waveOrderByKnowledgePointId.get(edge.fromKnowledgePointId) ?? 0,
    );
  }
  const alternativeThresholds = [];
  for (const [groupId, values] of byGroup.entries()) {
    const minimumSatisfied = plan.prerequisiteGraph.alternativeGroups[groupId]?.minimumSatisfied ?? 1;
    const sorted = [...values].sort((a, b) => a - b);
    alternativeThresholds.push(sorted[Math.max(0, Math.min(sorted.length - 1, minimumSatisfied - 1))] ?? 0);
  }
  return Math.max(0, ...requiredOrders, ...alternativeThresholds);
}

export function validateR05DeliveryWaveRebase(plan = materializeR05DeliveryWaveRebase()) {
  const errors = [];
  const warnings = [];
  const waveOrder = waveOrderMap(plan);
  const assignmentIds = plan.knowledgePointAssignments.map((row) => row.assignmentId);
  const knowledgePointIds = plan.knowledgePointAssignments.map((row) => row.knowledgePointId);
  const capabilityIds = new Set(plan.runtimeCapabilityMatrix.capabilities.map((row) => row.capabilityId));
  const policyContractCapabilities = new Set(Object.keys(plan.policy.contractOnlyCapabilityWaveMap));
  const waveOrderByKnowledgePointId = new Map(
    plan.knowledgePointAssignments.map((row) => [row.knowledgePointId, waveOrder.get(row.deliveryWaveId)]),
  );

  if (plan.waves.length !== 9) errors.push(finding("R05_WAVE_COUNT_INVALID"));
  if (plan.knowledgePointAssignments.length !== 482) errors.push(finding("R05_KNOWLEDGE_POINT_ASSIGNMENT_COUNT_INVALID"));
  if (plan.capabilityDeliveryPlan.length !== 58) errors.push(finding("R05_CAPABILITY_PLAN_COUNT_INVALID"));
  if (new Set(assignmentIds).size !== assignmentIds.length) errors.push(finding("R05_DUPLICATE_ASSIGNMENT_ID"));
  if (new Set(knowledgePointIds).size !== knowledgePointIds.length) errors.push(finding("R05_DUPLICATE_KNOWLEDGE_POINT_ASSIGNMENT"));
  if (plan.metrics.protectedProductUnitCount !== 15) errors.push(finding("R05_PROTECTED_PRODUCT_UNIT_COUNT_INVALID", { actual: plan.metrics.protectedProductUnitCount }));
  if (plan.metrics.protectedSourceNodeCount !== 16) errors.push(finding("R05_PROTECTED_SOURCE_NODE_COUNT_INVALID", { actual: plan.metrics.protectedSourceNodeCount }));

  for (const capability of plan.runtimeCapabilityMatrix.capabilities) {
    if (capability.deliveryStatus === "contract_only" && !policyContractCapabilities.has(capability.capabilityId)) {
      errors.push(finding("R05_CONTRACT_CAPABILITY_WAVE_UNASSIGNED", { capabilityId: capability.capabilityId }));
    }
  }

  for (const row of plan.knowledgePointAssignments) {
    if (!waveOrder.has(row.baseDeliveryWaveId) || !waveOrder.has(row.deliveryWaveId)) {
      errors.push(finding("R05_UNKNOWN_DELIVERY_WAVE", { knowledgePointId: row.knowledgePointId }));
      continue;
    }
    if (row.legacyBatchUsedForAssignment !== false || row.mappingBasis?.legacyBatchUsedForAssignment !== false) {
      errors.push(finding("R05_LEGACY_BATCH_ASSIGNMENT_FORBIDDEN", { knowledgePointId: row.knowledgePointId }));
    }
    if (row.productionAdmissionState === "PROTECTED_EXISTING_D0") {
      if (row.deliveryWaveId !== "R05-W0") errors.push(finding("R05_EXISTING_D0_DEMOTED", { knowledgePointId: row.knowledgePointId, deliveryWaveId: row.deliveryWaveId }));
      if (row.r06CompatibilityMigrationRequired !== true) errors.push(finding("R05_PROTECTED_KP_R06_MIGRATION_REQUIRED", { knowledgePointId: row.knowledgePointId }));
      if (row.protectedPrerequisiteCapabilityContradictionIds.length > 0) warnings.push(finding("R05_PROTECTED_D0_GLOBAL_MODEL_RECONCILIATION_REQUIRED", { knowledgePointId: row.knowledgePointId, capabilityIds: row.protectedPrerequisiteCapabilityContradictionIds, nextTask: "R06_LegacyCompatibilityMigration" }));
    } else if (row.productionAdmissionState !== "PLANNED_NOT_ADMITTED") {
      errors.push(finding("R05_PRODUCTION_ADMISSION_STATE_INVALID", { knowledgePointId: row.knowledgePointId }));
    }

    for (const capabilityId of row.effectiveRequiredRuntimeCapabilityIds) {
      if (!capabilityIds.has(capabilityId)) errors.push(finding("R05_UNKNOWN_EFFECTIVE_CAPABILITY", { knowledgePointId: row.knowledgePointId, capabilityId }));
    }
    for (const capabilityId of row.contractOnlyRequiredCapabilityIds) {
      if (!policyContractCapabilities.has(capabilityId)) errors.push(finding("R05_CONTRACT_CAPABILITY_NOT_PLANNED", { knowledgePointId: row.knowledgePointId, capabilityId }));
    }

    if (row.productionAdmissionState !== "PROTECTED_EXISTING_D0") {
      const expectedThreshold = prerequisiteWaveThreshold(plan, row.knowledgePointId, waveOrderByKnowledgePointId);
      if (waveOrder.get(row.deliveryWaveId) < expectedThreshold) {
        errors.push(finding("R05_PREREQUISITE_WAVE_ORDER_VIOLATION", {
          knowledgePointId: row.knowledgePointId,
          deliveryWaveId: row.deliveryWaveId,
          expectedMinimumWaveOrder: expectedThreshold,
        }));
      }
    }

    if (row.deliveryWaveId === "R05-W8" && row.contractOnlyCapabilityWaveIds.length < 2 && !row.waveEscalatedByPrerequisite) {
      warnings.push(finding("R05_W8_SINGLE_DOMAIN_REVIEW", { knowledgePointId: row.knowledgePointId }));
    }
  }

  const capabilityWaveById = new Map(
    plan.capabilityDeliveryPlan.map((row) => [row.capabilityId, waveOrder.get(row.deliveryWaveId)]),
  );
  for (const capability of plan.capabilityDeliveryPlan) {
    if (!waveOrder.has(capability.deliveryWaveId)) {
      errors.push(finding("R05_CAPABILITY_PLAN_UNKNOWN_WAVE", { capabilityId: capability.capabilityId }));
      continue;
    }
    for (const dependencyId of capability.dependencyCapabilityIds) {
      if (!capabilityWaveById.has(dependencyId)) {
        errors.push(finding("R05_CAPABILITY_PLAN_UNKNOWN_DEPENDENCY", { capabilityId: capability.capabilityId, dependencyId }));
      } else if (capabilityWaveById.get(dependencyId) > capabilityWaveById.get(capability.capabilityId)) {
        errors.push(finding("R05_CAPABILITY_DEPENDENCY_WAVE_ORDER_VIOLATION", { capabilityId: capability.capabilityId, dependencyId }));
      }
    }
  }

  const protectedProductUnits = new Set(
    plan.knowledgePointAssignments.flatMap((row) => row.protectedPublicProductUnitIds),
  );
  for (const productUnitId of plan.policy.publicBaseline.productUnitIds) {
    if (!protectedProductUnits.has(productUnitId)) errors.push(finding("R05_PUBLIC_BASELINE_UNIT_NOT_PROTECTED", { productUnitId }));
  }

  if (plan.mainlineBoundary.productionConsumerChanged !== false) errors.push(finding("R05_PRODUCTION_CONSUMER_CHANGED"));
  if (plan.mainlineBoundary.deliveryWaveRebased !== true) errors.push(finding("R05_DELIVERY_WAVE_NOT_REBASED"));
  if (plan.mainlineBoundary.legacyCompatibilityMigrated !== false) errors.push(finding("R05_LEGACY_COMPATIBILITY_MIGRATED_PREMATURELY"));
  if (plan.mainlineBoundary.productionCutoverAllowed !== false) errors.push(finding("R05_PRODUCTION_CUTOVER_PREMATURE"));
  if (plan.mainlineBoundary.parallelRuntimePipelineAllowed !== false) errors.push(finding("R05_PARALLEL_RUNTIME_PIPELINE_FORBIDDEN"));
  if (plan.mainlineBoundary.existing15UnitProductionUsePreserved !== true) errors.push(finding("R05_EXISTING_15_UNIT_PRODUCTION_USE_NOT_PRESERVED"));

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    warnings: Object.freeze(warnings),
    summary: Object.freeze({
      knowledgePointAssignmentCount: plan.knowledgePointAssignments.length,
      capabilityPlanCount: plan.capabilityDeliveryPlan.length,
      waveCount: plan.waves.length,
      protectedKnowledgePointCount: plan.metrics.protectedKnowledgePointCount,
      protectedSourceNodeCount: plan.metrics.protectedSourceNodeCount,
      protectedProductUnitCount: plan.metrics.protectedProductUnitCount,
      prerequisiteEscalatedKnowledgePointCount: plan.metrics.prerequisiteEscalatedKnowledgePointCount,
      protectedGlobalModelReconciliationCount: plan.metrics.protectedGlobalModelReconciliationCount,
      waveMetrics: plan.metrics.waveMetrics,
    }),
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const report = validateR05DeliveryWaveRebase();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!report.ok) process.exitCode = 1;
}
