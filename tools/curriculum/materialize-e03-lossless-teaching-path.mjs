import { materializeR03GlobalKnowledgePointPrerequisiteGraph } from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";

export const E03_TARGET_KNOWLEDGE_POINT_ID = "kp_g6b_u01_mixed_domain_expression";

export const E03_EXPECTED_METRICS = Object.freeze({
  knowledgePointCount: 63,
  requiredEdgeCount: 89,
  alternativeEdgeCount: 0,
  supportingEdgeCount: 0,
  topologicalLayerCount: 14,
  teachingStageCount: 10,
});

export const E03_TEACHING_STAGE_DEFINITIONS = Object.freeze([
  Object.freeze({
    stageId: "E03-S01",
    labelZh: "十進位位值與基本乘法基礎",
    topologicalLayerStart: 0,
    topologicalLayerEnd: 1,
  }),
  Object.freeze({
    stageId: "E03-S02",
    labelZh: "整數乘除與分數入口",
    topologicalLayerStart: 2,
    topologicalLayerEnd: 4,
  }),
  Object.freeze({
    stageId: "E03-S03",
    labelZh: "分數與小數表示擴張",
    topologicalLayerStart: 5,
    topologicalLayerEnd: 5,
  }),
  Object.freeze({
    stageId: "E03-S04",
    labelZh: "運算順序與等值表示基礎",
    topologicalLayerStart: 6,
    topologicalLayerEnd: 6,
  }),
  Object.freeze({
    stageId: "E03-S05",
    labelZh: "同數域成熟運算與有限小數轉換",
    topologicalLayerStart: 7,
    topologicalLayerEnd: 7,
  }),
  Object.freeze({
    stageId: "E03-S06",
    labelZh: "跨數域轉換啟動",
    topologicalLayerStart: 8,
    topologicalLayerEnd: 8,
  }),
  Object.freeze({
    stageId: "E03-S07",
    labelZh: "高階除法與跨域運算前置",
    topologicalLayerStart: 9,
    topologicalLayerEnd: 9,
  }),
  Object.freeze({
    stageId: "E03-S08",
    labelZh: "第一次跨數域融合",
    topologicalLayerStart: 10,
    topologicalLayerEnd: 10,
  }),
  Object.freeze({
    stageId: "E03-S09",
    labelZh: "小數除法到跨域乘除整合",
    topologicalLayerStart: 11,
    topologicalLayerEnd: 12,
  }),
  Object.freeze({
    stageId: "E03-S10",
    labelZh: "E03 三數域混合算式終點",
    topologicalLayerStart: 13,
    topologicalLayerEnd: 13,
  }),
]);

function sorted(values) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function collectRequiredClosure(graph, targetKnowledgePointId) {
  const closure = new Set([targetKnowledgePointId]);
  const pending = [targetKnowledgePointId];

  while (pending.length > 0) {
    const targetId = pending.pop();
    const requiredIncoming = (graph.incomingByTarget.get(targetId) ?? [])
      .filter((edge) => edge.dependencyStrength === "required");

    for (const edge of requiredIncoming) {
      if (closure.has(edge.fromKnowledgePointId)) continue;
      closure.add(edge.fromKnowledgePointId);
      pending.push(edge.fromKnowledgePointId);
    }
  }

  return closure;
}

function buildTopologicalLayers(knowledgePointIds, requiredEdges) {
  const nodeSet = new Set(knowledgePointIds);
  const incomingCount = new Map([...nodeSet].map((id) => [id, 0]));
  const outgoing = new Map([...nodeSet].map((id) => [id, []]));

  for (const edge of requiredEdges) {
    incomingCount.set(edge.toKnowledgePointId, incomingCount.get(edge.toKnowledgePointId) + 1);
    outgoing.get(edge.fromKnowledgePointId).push(edge.toKnowledgePointId);
  }

  const remaining = new Set(nodeSet);
  const layers = [];

  while (remaining.size > 0) {
    const layer = sorted([...remaining].filter((id) => incomingCount.get(id) === 0));
    if (layer.length === 0) {
      throw new Error("E03 required closure is not a DAG");
    }

    layers.push(layer);
    for (const id of layer) {
      remaining.delete(id);
      for (const dependentId of outgoing.get(id) ?? []) {
        incomingCount.set(dependentId, incomingCount.get(dependentId) - 1);
      }
    }
  }

  return layers;
}

function buildStageProjection(topologicalLayers, knowledgePointById) {
  return E03_TEACHING_STAGE_DEFINITIONS.map((definition, stageIndex) => {
    const internalTopologicalLayers = topologicalLayers
      .slice(definition.topologicalLayerStart, definition.topologicalLayerEnd + 1)
      .map((layer, offset) => Object.freeze({
        topologicalLayerIndex: definition.topologicalLayerStart + offset,
        knowledgePointIds: Object.freeze([...layer]),
      }));

    const knowledgePointIds = internalTopologicalLayers.flatMap((row) => row.knowledgePointIds);
    return Object.freeze({
      ...definition,
      stageIndex,
      knowledgePointCount: knowledgePointIds.length,
      knowledgePointIds: Object.freeze(knowledgePointIds),
      knowledgePoints: Object.freeze(knowledgePointIds.map((knowledgePointId) => {
        const row = knowledgePointById.get(knowledgePointId);
        return Object.freeze({
          knowledgePointId,
          canonicalNameZh: row?.canonicalNameZh ?? null,
          sourceNodeIds: Object.freeze([...(row?.sourceNodeIds ?? [])]),
        });
      })),
      internalTopologicalLayers: Object.freeze(internalTopologicalLayers),
    });
  });
}

function setDifference(left, right) {
  return sorted([...left].filter((value) => !right.has(value)));
}

function reconstructAncestorClosure(targetKnowledgePointId, edges) {
  const incoming = new Map();
  for (const edge of edges) {
    if (!incoming.has(edge.toKnowledgePointId)) incoming.set(edge.toKnowledgePointId, []);
    incoming.get(edge.toKnowledgePointId).push(edge.fromKnowledgePointId);
  }

  const seen = new Set([targetKnowledgePointId]);
  const pending = [targetKnowledgePointId];
  while (pending.length > 0) {
    const targetId = pending.pop();
    for (const sourceId of incoming.get(targetId) ?? []) {
      if (seen.has(sourceId)) continue;
      seen.add(sourceId);
      pending.push(sourceId);
    }
  }
  return seen;
}

function canReachTarget(startId, targetId, edges) {
  if (startId === targetId) return true;
  const outgoing = new Map();
  for (const edge of edges) {
    if (!outgoing.has(edge.fromKnowledgePointId)) outgoing.set(edge.fromKnowledgePointId, []);
    outgoing.get(edge.fromKnowledgePointId).push(edge.toKnowledgePointId);
  }

  const seen = new Set([startId]);
  const pending = [startId];
  while (pending.length > 0) {
    const sourceId = pending.pop();
    for (const targetKnowledgePointId of outgoing.get(sourceId) ?? []) {
      if (targetKnowledgePointId === targetId) return true;
      if (seen.has(targetKnowledgePointId)) continue;
      seen.add(targetKnowledgePointId);
      pending.push(targetKnowledgePointId);
    }
  }
  return false;
}

function readyWithinProjection(knowledgePointId, masteredSet, incomingByTarget, alternativeGroups) {
  if (masteredSet.has(knowledgePointId)) return false;
  const incoming = incomingByTarget.get(knowledgePointId) ?? [];
  const required = incoming.filter((edge) => edge.dependencyStrength === "required");
  if (required.some((edge) => !masteredSet.has(edge.fromKnowledgePointId))) return false;

  const alternativesByGroup = new Map();
  for (const edge of incoming.filter((row) => row.dependencyStrength === "alternative")) {
    if (!alternativesByGroup.has(edge.alternativeGroupId)) alternativesByGroup.set(edge.alternativeGroupId, []);
    alternativesByGroup.get(edge.alternativeGroupId).push(edge.fromKnowledgePointId);
  }
  for (const [groupId, sourceIds] of alternativesByGroup.entries()) {
    const minimumSatisfied = alternativeGroups[groupId]?.minimumSatisfied ?? 1;
    const satisfied = sourceIds.filter((sourceId) => masteredSet.has(sourceId)).length;
    if (satisfied < minimumSatisfied) return false;
  }
  return true;
}

function buildIncomingMap(edges) {
  const incoming = new Map();
  for (const edge of edges) {
    if (!incoming.has(edge.toKnowledgePointId)) incoming.set(edge.toKnowledgePointId, []);
    incoming.get(edge.toKnowledgePointId).push(edge);
  }
  return incoming;
}

export function materializeE03LosslessTeachingPath(options = {}) {
  const graph = materializeR03GlobalKnowledgePointPrerequisiteGraph(options);
  const closure = collectRequiredClosure(graph, E03_TARGET_KNOWLEDGE_POINT_ID);
  const allClosureEdges = graph.edges.filter((edge) =>
    closure.has(edge.fromKnowledgePointId) && closure.has(edge.toKnowledgePointId));
  const requiredEdges = allClosureEdges.filter((edge) => edge.dependencyStrength === "required");
  const topologicalLayers = buildTopologicalLayers(closure, requiredEdges);
  const knowledgePointById = new Map(graph.knowledgePoints.map((row) => [row.knowledgePointId, row]));
  const stages = buildStageProjection(topologicalLayers, knowledgePointById);

  const stageIndexByKnowledgePointId = new Map();
  const layerIndexByKnowledgePointId = new Map();
  for (const stage of stages) {
    for (const layer of stage.internalTopologicalLayers) {
      for (const knowledgePointId of layer.knowledgePointIds) {
        stageIndexByKnowledgePointId.set(knowledgePointId, stage.stageIndex);
        layerIndexByKnowledgePointId.set(knowledgePointId, layer.topologicalLayerIndex);
      }
    }
  }

  const edgeWitnesses = allClosureEdges.map((edge) => Object.freeze({
    edgeId: edge.edgeId,
    fromKnowledgePointId: edge.fromKnowledgePointId,
    toKnowledgePointId: edge.toKnowledgePointId,
    dependencyStrength: edge.dependencyStrength,
    dependencyRole: edge.dependencyRole,
    alternativeGroupId: edge.alternativeGroupId,
    fromStageIndex: stageIndexByKnowledgePointId.get(edge.fromKnowledgePointId),
    toStageIndex: stageIndexByKnowledgePointId.get(edge.toKnowledgePointId),
    fromTopologicalLayerIndex: layerIndexByKnowledgePointId.get(edge.fromKnowledgePointId),
    toTopologicalLayerIndex: layerIndexByKnowledgePointId.get(edge.toKnowledgePointId),
  }));

  return Object.freeze({
    schemaName: "E03LosslessTeachingPathProjectionV1",
    schemaVersion: 1,
    authority: Object.freeze({
      graphTaskId: graph.taskId,
      graphVersion: graph.graphVersion,
      graphKnowledgePointCount: graph.metrics.actualKnowledgePointCount,
      graphEdgeCount: graph.metrics.actualEdgeCount,
    }),
    targetKnowledgePointId: E03_TARGET_KNOWLEDGE_POINT_ID,
    closureKnowledgePointIds: Object.freeze(sorted(closure)),
    closureKnowledgePointCount: closure.size,
    closureEdgeCount: allClosureEdges.length,
    requiredEdgeCount: requiredEdges.length,
    alternativeEdgeCount: allClosureEdges.filter((edge) => edge.dependencyStrength === "alternative").length,
    supportingEdgeCount: allClosureEdges.filter((edge) => edge.dependencyStrength === "supporting").length,
    topologicalLayers: Object.freeze(topologicalLayers.map((layer, index) => Object.freeze({
      topologicalLayerIndex: index,
      knowledgePointIds: Object.freeze([...layer]),
    }))),
    teachingStages: Object.freeze(stages),
    edgeWitnesses: Object.freeze(edgeWitnesses),
    alternativeGroups: graph.alternativeGroups,
  });
}

export function validateE03LosslessTeachingPath(options = {}) {
  const graph = materializeR03GlobalKnowledgePointPrerequisiteGraph(options);
  const projection = materializeE03LosslessTeachingPath(options);
  const closureSet = new Set(projection.closureKnowledgePointIds);
  const stageMembers = projection.teachingStages.flatMap((stage) => stage.knowledgePointIds);
  const stageMemberSet = new Set(stageMembers);
  const duplicateKnowledgePointIds = sorted(stageMembers.filter((id, index) => stageMembers.indexOf(id) !== index));
  const missingKnowledgePointIds = setDifference(closureSet, stageMemberSet);
  const extraKnowledgePointIds = setDifference(stageMemberSet, closureSet);

  const requiredWitnesses = projection.edgeWitnesses.filter((edge) => edge.dependencyStrength === "required");
  const originalRequiredEdgeIds = new Set(
    graph.edges
      .filter((edge) => edge.dependencyStrength === "required")
      .filter((edge) => closureSet.has(edge.fromKnowledgePointId) && closureSet.has(edge.toKnowledgePointId))
      .map((edge) => edge.edgeId),
  );
  const witnessedRequiredEdgeIds = new Set(requiredWitnesses.map((edge) => edge.edgeId));
  const missingRequiredEdgeIds = setDifference(originalRequiredEdgeIds, witnessedRequiredEdgeIds);
  const extraRequiredEdgeIds = setDifference(witnessedRequiredEdgeIds, originalRequiredEdgeIds);

  const backwardRequiredEdges = requiredWitnesses.filter((edge) => edge.fromStageIndex > edge.toStageIndex);
  const intraStageOrderViolations = requiredWitnesses.filter((edge) =>
    edge.fromStageIndex === edge.toStageIndex
      && edge.fromTopologicalLayerIndex >= edge.toTopologicalLayerIndex);

  const reconstructedClosure = reconstructAncestorClosure(
    projection.targetKnowledgePointId,
    requiredWitnesses,
  );
  const missingReconstructedAncestors = setDifference(closureSet, reconstructedClosure);
  const extraReconstructedAncestors = setDifference(reconstructedClosure, closureSet);

  const projectedIncoming = buildIncomingMap(projection.edgeWitnesses);
  const fullIncoming = new Map();
  for (const knowledgePointId of projection.closureKnowledgePointIds) {
    fullIncoming.set(
      knowledgePointId,
      (graph.incomingByTarget.get(knowledgePointId) ?? [])
        .filter((edge) => closureSet.has(edge.fromKnowledgePointId)),
    );
  }

  const readinessCheckpoints = [];
  const masteredSet = new Set();
  const layerProgressionMismatches = [];
  let terminalFirstReadyCheckpoint = null;

  for (let checkpointIndex = 0; checkpointIndex <= projection.topologicalLayers.length; checkpointIndex += 1) {
    const originalReady = sorted(projection.closureKnowledgePointIds.filter((knowledgePointId) =>
      readyWithinProjection(knowledgePointId, masteredSet, fullIncoming, graph.alternativeGroups)));
    const projectedReady = sorted(projection.closureKnowledgePointIds.filter((knowledgePointId) =>
      readyWithinProjection(knowledgePointId, masteredSet, projectedIncoming, projection.alternativeGroups)));

    if (terminalFirstReadyCheckpoint === null && projectedReady.includes(projection.targetKnowledgePointId)) {
      terminalFirstReadyCheckpoint = checkpointIndex;
    }

    const expectedReady = checkpointIndex < projection.topologicalLayers.length
      ? projection.topologicalLayers[checkpointIndex].knowledgePointIds
      : [];
    const expectedSet = new Set(expectedReady);
    const projectedSet = new Set(projectedReady);
    const missingExpectedReady = setDifference(expectedSet, projectedSet);
    const unexpectedReady = setDifference(projectedSet, expectedSet);
    if (missingExpectedReady.length > 0 || unexpectedReady.length > 0) {
      layerProgressionMismatches.push({
        checkpointIndex,
        missingExpectedReady,
        unexpectedReady,
      });
    }

    readinessCheckpoints.push(Object.freeze({
      checkpointIndex,
      masteredKnowledgePointCount: masteredSet.size,
      originalReadyKnowledgePointIds: Object.freeze(originalReady),
      projectedReadyKnowledgePointIds: Object.freeze(projectedReady),
      mismatch: originalReady.join("\n") !== projectedReady.join("\n"),
    }));

    if (checkpointIndex < projection.topologicalLayers.length) {
      for (const knowledgePointId of projection.topologicalLayers[checkpointIndex].knowledgePointIds) {
        masteredSet.add(knowledgePointId);
      }
    }
  }

  const readinessMismatchCount = readinessCheckpoints.filter((row) => row.mismatch).length;
  const unreachableKnowledgePointIds = sorted(projection.closureKnowledgePointIds.filter((knowledgePointId) =>
    !canReachTarget(knowledgePointId, projection.targetKnowledgePointId, requiredWitnesses)));

  const gate1NodeCoverage = Object.freeze({
    gateId: "G1_NODE_COVERAGE",
    pass: projection.closureKnowledgePointCount === E03_EXPECTED_METRICS.knowledgePointCount
      && stageMemberSet.size === E03_EXPECTED_METRICS.knowledgePointCount
      && duplicateKnowledgePointIds.length === 0
      && missingKnowledgePointIds.length === 0
      && extraKnowledgePointIds.length === 0,
    originalKnowledgePointCount: projection.closureKnowledgePointCount,
    stagedKnowledgePointCount: stageMemberSet.size,
    duplicateKnowledgePointIds,
    missingKnowledgePointIds,
    extraKnowledgePointIds,
  });

  const gate2EdgePreservation = Object.freeze({
    gateId: "G2_EDGE_PRESERVATION",
    pass: originalRequiredEdgeIds.size === E03_EXPECTED_METRICS.requiredEdgeCount
      && witnessedRequiredEdgeIds.size === E03_EXPECTED_METRICS.requiredEdgeCount
      && missingRequiredEdgeIds.length === 0
      && extraRequiredEdgeIds.length === 0,
    originalRequiredEdgeCount: originalRequiredEdgeIds.size,
    preservedRequiredEdgeCount: witnessedRequiredEdgeIds.size,
    missingRequiredEdgeIds,
    extraRequiredEdgeIds,
  });

  const gate3TopologicalIntegrity = Object.freeze({
    gateId: "G3_TOPOLOGICAL_INTEGRITY",
    pass: projection.topologicalLayers.length === E03_EXPECTED_METRICS.topologicalLayerCount
      && projection.teachingStages.length === E03_EXPECTED_METRICS.teachingStageCount
      && backwardRequiredEdges.length === 0
      && intraStageOrderViolations.length === 0,
    topologicalLayerCount: projection.topologicalLayers.length,
    teachingStageCount: projection.teachingStages.length,
    backwardRequiredEdgeCount: backwardRequiredEdges.length,
    intraStageOrderViolationCount: intraStageOrderViolations.length,
  });

  const gate4AncestorClosure = Object.freeze({
    gateId: "G4_ANCESTOR_CLOSURE",
    pass: reconstructedClosure.size === E03_EXPECTED_METRICS.knowledgePointCount
      && missingReconstructedAncestors.length === 0
      && extraReconstructedAncestors.length === 0,
    originalClosureCount: closureSet.size,
    reconstructedClosureCount: reconstructedClosure.size,
    missingReconstructedAncestors,
    extraReconstructedAncestors,
  });

  const gate5ReadinessEquivalence = Object.freeze({
    gateId: "G5_READINESS_EQUIVALENCE",
    pass: readinessMismatchCount === 0
      && layerProgressionMismatches.length === 0
      && terminalFirstReadyCheckpoint === E03_EXPECTED_METRICS.topologicalLayerCount - 1,
    checkpointCount: readinessCheckpoints.length,
    readinessMismatchCount,
    layerProgressionMismatchCount: layerProgressionMismatches.length,
    terminalFirstReadyCheckpoint,
    expectedTerminalFirstReadyCheckpoint: E03_EXPECTED_METRICS.topologicalLayerCount - 1,
  });

  const gate6TerminalReachability = Object.freeze({
    gateId: "G6_TERMINAL_REACHABILITY",
    pass: unreachableKnowledgePointIds.length === 0,
    reachableKnowledgePointCount: projection.closureKnowledgePointCount - unreachableKnowledgePointIds.length,
    unreachableKnowledgePointIds,
  });

  const gates = Object.freeze([
    gate1NodeCoverage,
    gate2EdgePreservation,
    gate3TopologicalIntegrity,
    gate4AncestorClosure,
    gate5ReadinessEquivalence,
    gate6TerminalReachability,
  ]);

  return Object.freeze({
    schemaName: "E03LosslessTeachingPathValidationV1",
    schemaVersion: 1,
    targetKnowledgePointId: projection.targetKnowledgePointId,
    authority: projection.authority,
    expectedMetrics: E03_EXPECTED_METRICS,
    actualMetrics: Object.freeze({
      knowledgePointCount: projection.closureKnowledgePointCount,
      requiredEdgeCount: projection.requiredEdgeCount,
      alternativeEdgeCount: projection.alternativeEdgeCount,
      supportingEdgeCount: projection.supportingEdgeCount,
      topologicalLayerCount: projection.topologicalLayers.length,
      teachingStageCount: projection.teachingStages.length,
    }),
    teachingStageSummary: Object.freeze(projection.teachingStages.map((stage) => Object.freeze({
      stageId: stage.stageId,
      labelZh: stage.labelZh,
      topologicalLayerStart: stage.topologicalLayerStart,
      topologicalLayerEnd: stage.topologicalLayerEnd,
      knowledgePointCount: stage.knowledgePointCount,
      knowledgePointIds: stage.knowledgePointIds,
    }))),
    gates,
    pass: gates.every((gate) => gate.pass)
      && projection.alternativeEdgeCount === E03_EXPECTED_METRICS.alternativeEdgeCount
      && projection.supportingEdgeCount === E03_EXPECTED_METRICS.supportingEdgeCount,
  });
}
