import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeR04SharedRuntimeCapabilityMatrix } from "./r04-shared-runtime-capability-matrix.mjs";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../../..");
const R05_DIR = path.join(ROOT, "data/curriculum/global/delivery/r05");

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(R05_DIR, fileName), "utf8"));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function freezeArray(values) {
  return Object.freeze([...values]);
}

function sourceNodeIdOf(ref) {
  return typeof ref === "string" ? ref : ref?.sourceNodeId;
}

function productUnitIdForSourceNode(sourceNodeId, policy) {
  return policy.publicBaseline.sourceNodeToProductUnitId[sourceNodeId] ?? sourceNodeId;
}

function buildCapabilityClosure(capabilityById, capabilityId, visiting = new Set(), memo = new Map()) {
  if (memo.has(capabilityId)) return memo.get(capabilityId);
  if (visiting.has(capabilityId)) throw new Error(`R05_CAPABILITY_DEPENDENCY_CYCLE:${capabilityId}`);
  const capability = capabilityById.get(capabilityId);
  if (!capability) throw new Error(`R05_UNKNOWN_CAPABILITY:${capabilityId}`);
  visiting.add(capabilityId);
  const closure = unique([
    capabilityId,
    ...capability.dependsOnCapabilityIds.flatMap((dependencyId) => (
      buildCapabilityClosure(capabilityById, dependencyId, visiting, memo)
    )),
  ]);
  visiting.delete(capabilityId);
  memo.set(capabilityId, closure);
  return closure;
}

function classifyCapabilityDelivery(effectiveRequiredCapabilityIds, capabilityById) {
  const production = [];
  const shadow = [];
  const contractOnly = [];
  for (const capabilityId of effectiveRequiredCapabilityIds) {
    const status = capabilityById.get(capabilityId)?.deliveryStatus;
    if (status === "production_admitted") production.push(capabilityId);
    else if (status === "shadow_available") shadow.push(capabilityId);
    else if (status === "contract_only") contractOnly.push(capabilityId);
    else throw new Error(`R05_CAPABILITY_DELIVERY_STATUS_INVALID:${capabilityId}:${status}`);
  }
  return { production, shadow, contractOnly };
}

function topologicalKnowledgePointOrder(graph) {
  const ids = graph.knowledgePoints.map((row) => row.knowledgePointId);
  const indegree = new Map(ids.map((id) => [id, 0]));
  const outgoing = new Map(ids.map((id) => [id, []]));
  for (const edge of graph.edges) {
    if (!edge.distanceBearing || edge.dependencyStrength === "supporting") continue;
    indegree.set(edge.toKnowledgePointId, (indegree.get(edge.toKnowledgePointId) ?? 0) + 1);
    outgoing.get(edge.fromKnowledgePointId)?.push(edge.toKnowledgePointId);
  }
  const queue = ids.filter((id) => indegree.get(id) === 0).sort();
  const order = [];
  while (queue.length > 0) {
    const id = queue.shift();
    order.push(id);
    for (const dependentId of outgoing.get(id) ?? []) {
      indegree.set(dependentId, indegree.get(dependentId) - 1);
      if (indegree.get(dependentId) === 0) {
        queue.push(dependentId);
        queue.sort();
      }
    }
  }
  if (order.length !== ids.length) throw new Error("R05_PREREQUISITE_GRAPH_NOT_DAG");
  return order;
}

function prerequisiteThreshold(values, minimumSatisfied = 1) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.max(0, Math.min(sorted.length - 1, minimumSatisfied - 1))];
}

function prerequisiteLowerBound(graph, knowledgePointId, valueById) {
  const incoming = graph.incomingByTarget.get(knowledgePointId) ?? [];
  const requiredValues = incoming
    .filter((edge) => edge.distanceBearing && edge.dependencyStrength === "required")
    .map((edge) => valueById.get(edge.fromKnowledgePointId) ?? 0);
  const alternatives = incoming
    .filter((edge) => edge.distanceBearing && edge.dependencyStrength === "alternative");
  const byGroup = new Map();
  for (const edge of alternatives) {
    if (!byGroup.has(edge.alternativeGroupId)) byGroup.set(edge.alternativeGroupId, []);
    byGroup.get(edge.alternativeGroupId).push(valueById.get(edge.fromKnowledgePointId) ?? 0);
  }
  const alternativeThresholds = [];
  for (const [groupId, values] of byGroup.entries()) {
    const minimumSatisfied = graph.alternativeGroups[groupId]?.minimumSatisfied ?? 1;
    alternativeThresholds.push(prerequisiteThreshold(values, minimumSatisfied));
  }
  return Math.max(0, ...requiredValues, ...alternativeThresholds);
}

function computePrerequisiteRanks(graph, topologicalOrder) {
  const rankById = new Map();
  for (const knowledgePointId of topologicalOrder) {
    const incoming = graph.incomingByTarget.get(knowledgePointId) ?? [];
    const hasDistanceBearing = incoming.some((edge) => (
      edge.distanceBearing && edge.dependencyStrength !== "supporting"
    ));
    const lowerBound = prerequisiteLowerBound(graph, knowledgePointId, rankById);
    rankById.set(knowledgePointId, hasDistanceBearing ? lowerBound + 1 : 0);
  }
  return rankById;
}

function waveOrderMaps(policy) {
  const waveById = new Map(policy.waves.map((row) => [row.waveId, row]));
  const waveIdByOrder = new Map(policy.waves.map((row) => [row.order, row.waveId]));
  return { waveById, waveIdByOrder };
}

function capabilityGapWave(contractOnlyIds, capabilityById, policy, waveById, closureMemo) {
  if (contractOnlyIds.length === 0) return null;
  const capabilityWaveId = (capabilityId) => {
    const waveId = policy.contractOnlyCapabilityWaveMap[capabilityId];
    if (!waveId) throw new Error(`R05_CONTRACT_CAPABILITY_WAVE_UNASSIGNED:${capabilityId}`);
    return waveId;
  };
  const waveIds = unique(contractOnlyIds.map(capabilityWaveId));
  const highestWaveId = [...waveIds].sort((a, b) => waveById.get(b).order - waveById.get(a).order)[0];
  if (waveIds.length === 1) return highestWaveId;

  const highestCapabilities = contractOnlyIds.filter((id) => capabilityWaveId(id) === highestWaveId);
  const naturallyCovered = contractOnlyIds.every((candidateId) => (
    capabilityWaveId(candidateId) === highestWaveId
    || highestCapabilities.some((highestId) => (
      buildCapabilityClosure(capabilityById, highestId, new Set(), closureMemo).includes(candidateId)
    ))
  ));
  return naturallyCovered ? highestWaveId : policy.rules.multiContractDomainGapUsesWave;
}

function baseWaveForMapping(mapping, knowledgePoint, registry) {
  const sourceNodeIds = unique((knowledgePoint.sourceRefs ?? []).map(sourceNodeIdOf));
  const protectedSourceNodeIds = sourceNodeIds.filter((id) => registry.publicBaselineSourceNodeIds.has(id));
  const protectedProductUnitIds = unique(
    protectedSourceNodeIds.map((id) => productUnitIdForSourceNode(id, registry.policy)),
  ).sort();

  const effectiveRequiredCapabilityIds = unique(mapping.requiredRuntimeCapabilityIds.flatMap((capabilityId) => (
    buildCapabilityClosure(registry.capabilityById, capabilityId, new Set(), registry.capabilityClosureMemo)
  )));
  const delivery = classifyCapabilityDelivery(effectiveRequiredCapabilityIds, registry.capabilityById);

  let baseDeliveryWaveId;
  if (protectedProductUnitIds.length > 0) {
    baseDeliveryWaveId = "R05-W0";
  } else if (delivery.contractOnly.length > 0) {
    baseDeliveryWaveId = capabilityGapWave(
      delivery.contractOnly,
      registry.capabilityById,
      registry.policy,
      registry.waveById,
      registry.capabilityClosureMemo,
    );
  } else {
    baseDeliveryWaveId = registry.policy.deliveryStateDefaultWave[
      delivery.shadow.length > 0
        ? "ALL_REQUIRED_CAPABILITIES_AVAILABLE_SHADOW"
        : "ALL_REQUIRED_CAPABILITIES_PRODUCTION_ADMITTED"
    ];
  }

  return {
    sourceNodeIds,
    protectedSourceNodeIds,
    protectedProductUnitIds,
    effectiveRequiredCapabilityIds,
    delivery,
    baseDeliveryWaveId,
  };
}

function buildCapabilityPlan(capabilities, assignments, policy) {
  const waveByStatus = {
    production_admitted: "R05-W0",
    shadow_available: "R05-W2",
  };
  return capabilities.map((capability) => {
    const deliveryWaveId = waveByStatus[capability.deliveryStatus]
      ?? policy.contractOnlyCapabilityWaveMap[capability.capabilityId];
    if (!deliveryWaveId) throw new Error(`R05_CAPABILITY_PLAN_WAVE_UNASSIGNED:${capability.capabilityId}`);
    const requiringAssignments = assignments.filter((row) => (
      row.effectiveRequiredRuntimeCapabilityIds.includes(capability.capabilityId)
    ));
    return Object.freeze({
      capabilityId: capability.capabilityId,
      capabilityClass: capability.capabilityClass,
      deliveryStatusBeforeR05: capability.deliveryStatus,
      deliveryWaveId,
      dependencyCapabilityIds: freezeArray(capability.dependsOnCapabilityIds),
      requiredByKnowledgePointCount: requiringAssignments.length,
      blockedKnowledgePointCount: requiringAssignments.filter((row) => (
        row.contractOnlyRequiredCapabilityIds.includes(capability.capabilityId)
      )).length,
      action: capability.deliveryStatus === "production_admitted"
        ? "PRESERVE_EXISTING_PRODUCTION_EVIDENCE"
        : capability.deliveryStatus === "shadow_available"
          ? "HARDEN_AND_ADMIT_SHARED_CAPABILITY"
          : "IMPLEMENT_VALIDATE_AND_ADMIT_SHARED_CAPABILITY",
    });
  }).sort((a, b) => {
    const waveOrder = policy.waves.find((row) => row.waveId === a.deliveryWaveId).order
      - policy.waves.find((row) => row.waveId === b.deliveryWaveId).order;
    return waveOrder || b.requiredByKnowledgePointCount - a.requiredByKnowledgePointCount
      || a.capabilityId.localeCompare(b.capabilityId);
  });
}

function buildMetrics(assignments, capabilityPlan, policy) {
  const waveMetrics = Object.fromEntries(policy.waves.map((wave) => [wave.waveId, {
    waveId: wave.waveId,
    order: wave.order,
    knowledgePointCount: 0,
    protectedKnowledgePointCount: 0,
    sourceNodeIds: new Set(),
    productUnitIds: new Set(),
    legacyBatchRefs: new Set(),
    capabilityPlanCount: 0,
  }]));
  for (const assignment of assignments) {
    const metric = waveMetrics[assignment.deliveryWaveId];
    metric.knowledgePointCount += 1;
    if (assignment.productionAdmissionState === "PROTECTED_EXISTING_D0") {
      metric.protectedKnowledgePointCount += 1;
    }
    assignment.sourceNodeIds.forEach((id) => metric.sourceNodeIds.add(id));
    assignment.protectedPublicProductUnitIds.forEach((id) => metric.productUnitIds.add(id));
    assignment.legacyBatchRefs.forEach((id) => metric.legacyBatchRefs.add(id));
  }
  for (const capability of capabilityPlan) waveMetrics[capability.deliveryWaveId].capabilityPlanCount += 1;

  const normalizedWaveMetrics = policy.waves.map((wave) => {
    const metric = waveMetrics[wave.waveId];
    return Object.freeze({
      waveId: wave.waveId,
      order: wave.order,
      knowledgePointCount: metric.knowledgePointCount,
      protectedKnowledgePointCount: metric.protectedKnowledgePointCount,
      sourceNodeCount: metric.sourceNodeIds.size,
      protectedProductUnitCount: metric.productUnitIds.size,
      legacyBatchRefs: freezeArray([...metric.legacyBatchRefs].sort()),
      capabilityPlanCount: metric.capabilityPlanCount,
    });
  });
  return Object.freeze({
    knowledgePointAssignmentCount: assignments.length,
    capabilityPlanCount: capabilityPlan.length,
    waveCount: policy.waves.length,
    protectedKnowledgePointCount: assignments.filter((row) => row.productionAdmissionState === "PROTECTED_EXISTING_D0").length,
    protectedSourceNodeCount: new Set(assignments.flatMap((row) => row.protectedBaselineSourceNodeIds)).size,
    protectedProductUnitCount: new Set(assignments.flatMap((row) => row.protectedPublicProductUnitIds)).size,
    prerequisiteEscalatedKnowledgePointCount: assignments.filter((row) => row.waveEscalatedByPrerequisite).length,
    protectedGlobalModelReconciliationCount: assignments.filter((row) => (
      row.productionAdmissionState === "PROTECTED_EXISTING_D0"
      && row.protectedPrerequisiteCapabilityContradictionIds.length > 0
    )).length,
    waveMetrics: freezeArray(normalizedWaveMetrics),
  });
}

export function materializeR05DeliveryWaveRebase() {
  const policy = readJson("delivery-wave-policy.json");
  const manifest = readJson("delivery-wave-rebase.manifest.json");
  const r04 = materializeR04SharedRuntimeCapabilityMatrix();
  const graph = r04.prerequisiteGraph;
  const capabilityById = new Map(r04.capabilities.map((row) => [row.capabilityId, row]));
  const mappingById = new Map(r04.knowledgePointMappings.map((row) => [row.knowledgePointId, row]));
  const knowledgePointById = new Map(r04.knowledgePoints.map((row) => [row.knowledgePointId, row]));
  const publicBaselineSourceNodeIds = new Set(policy.publicBaseline.sourceNodeIds);
  const { waveById, waveIdByOrder } = waveOrderMaps(policy);
  const capabilityClosureMemo = new Map();
  const registry = {
    policy,
    capabilityById,
    publicBaselineSourceNodeIds,
    waveById,
    capabilityClosureMemo,
  };

  const topologicalOrder = topologicalKnowledgePointOrder(graph);
  const prerequisiteRankById = computePrerequisiteRanks(graph, topologicalOrder);
  const baseRows = new Map();

  for (const knowledgePointId of topologicalOrder) {
    const mapping = mappingById.get(knowledgePointId);
    const knowledgePoint = knowledgePointById.get(knowledgePointId);
    if (!mapping || !knowledgePoint) throw new Error(`R05_MAPPING_OR_KP_MISSING:${knowledgePointId}`);
    baseRows.set(knowledgePointId, baseWaveForMapping(mapping, knowledgePoint, registry));
  }

  const finalWaveOrderById = new Map();
  const assignments = [];
  for (const knowledgePointId of topologicalOrder) {
    const mapping = mappingById.get(knowledgePointId);
    const knowledgePoint = knowledgePointById.get(knowledgePointId);
    const base = baseRows.get(knowledgePointId);
    const baseOrder = waveById.get(base.baseDeliveryWaveId).order;
    const prerequisiteWaveLowerBound = prerequisiteLowerBound(graph, knowledgePointId, finalWaveOrderById);
    const protectedExistingD0 = base.protectedProductUnitIds.length > 0;
    const finalOrder = protectedExistingD0 ? 0 : Math.max(baseOrder, prerequisiteWaveLowerBound);
    const deliveryWaveId = waveIdByOrder.get(finalOrder);
    if (!deliveryWaveId) throw new Error(`R05_FINAL_WAVE_ORDER_INVALID:${knowledgePointId}:${finalOrder}`);
    finalWaveOrderById.set(knowledgePointId, finalOrder);

    const protectedPrerequisiteCapabilityContradictions = protectedExistingD0
      ? (graph.incomingByTarget.get(knowledgePointId) ?? [])
        .filter((edge) => edge.distanceBearing && edge.dependencyStrength !== "supporting")
        .map((edge) => baseRows.get(edge.fromKnowledgePointId))
        .filter(Boolean)
        .flatMap((row) => row.delivery.contractOnly)
      : [];

    assignments.push(Object.freeze({
      assignmentId: `r05wave_${knowledgePointId.replace(/^kp_/, "")}`,
      knowledgePointId,
      baseDeliveryWaveId: base.baseDeliveryWaveId,
      deliveryWaveId,
      intraWavePrerequisiteRank: prerequisiteRankById.get(knowledgePointId),
      prerequisiteWaveLowerBound,
      waveEscalatedByPrerequisite: finalOrder > baseOrder,
      primaryRuntimeProfileId: mapping.primaryRuntimeProfileId,
      requiredRuntimeCapabilityIds: freezeArray(mapping.requiredRuntimeCapabilityIds),
      effectiveRequiredRuntimeCapabilityIds: freezeArray(base.effectiveRequiredCapabilityIds),
      productionAdmittedRequiredCapabilityIds: freezeArray(base.delivery.production),
      shadowRequiredCapabilityIds: freezeArray(base.delivery.shadow),
      contractOnlyRequiredCapabilityIds: freezeArray(base.delivery.contractOnly),
      contractOnlyCapabilityWaveIds: freezeArray(unique(base.delivery.contractOnly.map((id) => (
        policy.contractOnlyCapabilityWaveMap[id]
      ))).sort()),
      sourceNodeIds: freezeArray(base.sourceNodeIds.sort()),
      protectedBaselineSourceNodeIds: freezeArray(base.protectedSourceNodeIds.sort()),
      protectedPublicProductUnitIds: freezeArray(base.protectedProductUnitIds),
      protectedPrerequisiteCapabilityContradictionIds: freezeArray(unique(protectedPrerequisiteCapabilityContradictions).sort()),
      legacyBatchRefs: freezeArray(mapping.legacyBatchRefs),
      legacyBatchUsedForAssignment: false,
      productionAdmissionState: protectedExistingD0 ? "PROTECTED_EXISTING_D0" : "PLANNED_NOT_ADMITTED",
      r06CompatibilityMigrationRequired: protectedExistingD0,
      mappingBasis: Object.freeze({
        prerequisiteGraphUsed: true,
        runtimeCapabilityClosureUsed: true,
        productionBaselineProtectionUsed: protectedExistingD0,
        legacyBatchUsedForAssignment: false,
      }),
    }));
  }

  assignments.sort((a, b) => (
    waveById.get(a.deliveryWaveId).order - waveById.get(b.deliveryWaveId).order
    || a.intraWavePrerequisiteRank - b.intraWavePrerequisiteRank
    || a.knowledgePointId.localeCompare(b.knowledgePointId)
  ));
  const assignmentByKnowledgePointId = new Map(assignments.map((row) => [row.knowledgePointId, row]));
  const capabilityPlan = buildCapabilityPlan(r04.capabilities, assignments, policy);
  const metrics = buildMetrics(assignments, capabilityPlan, policy);

  return Object.freeze({
    schemaName: manifest.schemaName,
    schemaVersion: manifest.schemaVersion,
    programId: manifest.programId,
    taskId: manifest.taskId,
    status: manifest.status,
    policy: Object.freeze(policy),
    waves: freezeArray(policy.waves.map((row) => Object.freeze({ ...row }))),
    knowledgePointAssignments: freezeArray(assignments),
    capabilityDeliveryPlan: freezeArray(capabilityPlan),
    metrics,
    prerequisiteGraph: graph,
    runtimeCapabilityMatrix: r04,
    manifest: Object.freeze(manifest),
    mainlineBoundary: Object.freeze(manifest.mainlineBoundary),
    getAssignment(knowledgePointId) {
      return assignmentByKnowledgePointId.get(knowledgePointId) ?? null;
    },
  });
}

export function getR05DeliveryWaveAssignment(knowledgePointId) {
  return materializeR05DeliveryWaveRebase().getAssignment(knowledgePointId);
}

export function listR05KnowledgePointsByWave(deliveryWaveId) {
  return materializeR05DeliveryWaveRebase().knowledgePointAssignments
    .filter((row) => row.deliveryWaveId === deliveryWaveId);
}

export function listR05CapabilityPlanByWave(deliveryWaveId) {
  return materializeR05DeliveryWaveRebase().capabilityDeliveryPlan
    .filter((row) => row.deliveryWaveId === deliveryWaveId);
}
