import { materializeR03GlobalKnowledgePointPrerequisiteGraph } from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";

const ALLOWED_STRENGTHS = new Set(["required", "alternative", "supporting"]);
const ALLOWED_ROLES = new Set([
  "conceptual_foundation",
  "procedural_foundation",
  "relation_model_foundation",
  "representation_foundation",
  "domain_extension_foundation",
]);

function hasPath(adjacency, start, target, ignoredEdgeKey = null) {
  const stack = [start];
  const visited = new Set();
  while (stack.length > 0) {
    const current = stack.pop();
    if (current === target) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    for (const edge of adjacency.get(current) ?? []) {
      const key = `${edge.fromKnowledgePointId}->${edge.toKnowledgePointId}`;
      if (key === ignoredEdgeKey) continue;
      stack.push(edge.toKnowledgePointId);
    }
  }
  return false;
}

function detectCycle(nodeIds, adjacency) {
  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map(nodeIds.map((nodeId) => [nodeId, WHITE]));
  const parent = new Map();

  function visit(nodeId) {
    color.set(nodeId, GRAY);
    for (const edge of adjacency.get(nodeId) ?? []) {
      const next = edge.toKnowledgePointId;
      if (color.get(next) === WHITE) {
        parent.set(next, nodeId);
        const found = visit(next);
        if (found) return found;
      } else if (color.get(next) === GRAY) {
        const cycle = [next, nodeId];
        let cursor = parent.get(nodeId);
        while (cursor && cursor !== next) {
          cycle.push(cursor);
          cursor = parent.get(cursor);
        }
        cycle.push(next);
        return cycle.reverse();
      }
    }
    color.set(nodeId, BLACK);
    return null;
  }

  for (const nodeId of nodeIds) {
    if (color.get(nodeId) === WHITE) {
      const found = visit(nodeId);
      if (found) return found;
    }
  }
  return null;
}

export function validateR03GlobalKnowledgePointPrerequisiteGraph(options = {}) {
  const graph = materializeR03GlobalKnowledgePointPrerequisiteGraph(options);
  const errors = [];
  const warnings = [];
  const nodeIds = new Set(graph.knowledgePoints.map((row) => row.knowledgePointId));
  const rootIds = new Set(graph.rootKnowledgePoints.map((row) => row.knowledgePointId));
  const reviewIds = new Set(graph.boundaryReviewKnowledgePoints.map((row) => row.knowledgePointId));
  const pairKeys = new Set();

  const distanceAdjacency = new Map();
  const requiredAdjacency = new Map();
  const incomingDistanceCount = new Map();

  for (const edge of graph.edges) {
    if (!nodeIds.has(edge.fromKnowledgePointId) || !nodeIds.has(edge.toKnowledgePointId)) {
      errors.push({
        code: "KP_GRAPH_UNKNOWN_NODE",
        edgeId: edge.edgeId,
        fromKnowledgePointId: edge.fromKnowledgePointId,
        toKnowledgePointId: edge.toKnowledgePointId,
      });
    }
    if (edge.fromKnowledgePointId === edge.toKnowledgePointId) {
      errors.push({ code: "KP_GRAPH_SELF_LOOP", edgeId: edge.edgeId });
    }
    if (!ALLOWED_STRENGTHS.has(edge.dependencyStrength)) {
      errors.push({ code: "KP_GRAPH_INVALID_STRENGTH", edgeId: edge.edgeId });
    }
    if (!ALLOWED_ROLES.has(edge.dependencyRole)) {
      errors.push({ code: "KP_GRAPH_INVALID_ROLE", edgeId: edge.edgeId });
    }
    const pairKey = `${edge.fromKnowledgePointId}->${edge.toKnowledgePointId}`;
    if (pairKeys.has(pairKey)) {
      errors.push({ code: "KP_GRAPH_DUPLICATE_EDGE", edgeId: edge.edgeId, pairKey });
    }
    pairKeys.add(pairKey);

    if (edge.dependencyStrength === "supporting" && edge.distanceBearing) {
      errors.push({ code: "KP_GRAPH_SUPPORTING_EDGE_DISTANCE_BEARING", edgeId: edge.edgeId });
    }
    if (edge.dependencyStrength === "alternative" && !edge.alternativeGroupId) {
      errors.push({ code: "KP_GRAPH_ALTERNATIVE_GROUP_MISSING", edgeId: edge.edgeId });
    }
    if (edge.dependencyStrength !== "alternative" && edge.alternativeGroupId) {
      errors.push({ code: "KP_GRAPH_NON_ALTERNATIVE_GROUP_PRESENT", edgeId: edge.edgeId });
    }

    if (edge.distanceBearing) {
      if (!distanceAdjacency.has(edge.fromKnowledgePointId)) distanceAdjacency.set(edge.fromKnowledgePointId, []);
      distanceAdjacency.get(edge.fromKnowledgePointId).push(edge);
      incomingDistanceCount.set(
        edge.toKnowledgePointId,
        (incomingDistanceCount.get(edge.toKnowledgePointId) ?? 0) + 1,
      );
    }
    if (edge.dependencyStrength === "required") {
      if (!requiredAdjacency.has(edge.fromKnowledgePointId)) requiredAdjacency.set(edge.fromKnowledgePointId, []);
      requiredAdjacency.get(edge.fromKnowledgePointId).push(edge);
    }
  }

  const cycle = detectCycle([...nodeIds], distanceAdjacency);
  if (cycle) errors.push({ code: "KP_GRAPH_CYCLE_DETECTED", cycle });

  for (const edge of graph.edges.filter((row) => row.dependencyStrength === "required")) {
    const key = `${edge.fromKnowledgePointId}->${edge.toKnowledgePointId}`;
    if (hasPath(requiredAdjacency, edge.fromKnowledgePointId, edge.toKnowledgePointId, key)) {
      errors.push({
        code: "KP_GRAPH_REDUNDANT_TRANSITIVE_EDGE",
        edgeId: edge.edgeId,
        fromKnowledgePointId: edge.fromKnowledgePointId,
        toKnowledgePointId: edge.toKnowledgePointId,
      });
    }
  }

  const alternativeEdgesByGroup = new Map();
  for (const edge of graph.edges.filter((row) => row.dependencyStrength === "alternative")) {
    if (!alternativeEdgesByGroup.has(edge.alternativeGroupId)) alternativeEdgesByGroup.set(edge.alternativeGroupId, []);
    alternativeEdgesByGroup.get(edge.alternativeGroupId).push(edge);
  }
  for (const [groupId, contract] of Object.entries(graph.alternativeGroups)) {
    const groupEdges = alternativeEdgesByGroup.get(groupId) ?? [];
    if (groupEdges.length < 2) {
      errors.push({ code: "KP_GRAPH_ALTERNATIVE_GROUP_TOO_SMALL", alternativeGroupId: groupId });
    }
    const targets = new Set(groupEdges.map((edge) => edge.toKnowledgePointId));
    if (targets.size !== 1 || !targets.has(contract.targetKnowledgePointId)) {
      errors.push({ code: "KP_GRAPH_ALTERNATIVE_GROUP_TARGET_MISMATCH", alternativeGroupId: groupId });
    }
    if (!Number.isInteger(contract.minimumSatisfied)
      || contract.minimumSatisfied < 1
      || contract.minimumSatisfied > groupEdges.length) {
      errors.push({ code: "KP_GRAPH_ALTERNATIVE_GROUP_MINIMUM_INVALID", alternativeGroupId: groupId });
    }
  }

  for (const nodeId of nodeIds) {
    const incomingCount = incomingDistanceCount.get(nodeId) ?? 0;
    const classifiedAsRoot = rootIds.has(nodeId);
    const classifiedForReview = reviewIds.has(nodeId);
    const classCount = Number(incomingCount > 0) + Number(classifiedAsRoot) + Number(classifiedForReview);
    if (classCount !== 1) {
      errors.push({
        code: "KP_GRAPH_NODE_ACCOUNTING_INVALID",
        knowledgePointId: nodeId,
        incomingDistanceEdgeCount: incomingCount,
        classifiedAsRoot,
        classifiedForReview,
      });
    }
  }

  for (const rootId of rootIds) {
    if (!nodeIds.has(rootId)) errors.push({ code: "KP_GRAPH_UNKNOWN_ROOT", knowledgePointId: rootId });
    if ((incomingDistanceCount.get(rootId) ?? 0) > 0) {
      errors.push({ code: "KP_GRAPH_ROOT_HAS_INCOMING_DISTANCE_EDGE", knowledgePointId: rootId });
    }
  }

  const expected = graph.metrics;
  const actual = {
    knowledgePointCount: nodeIds.size,
    edgeCount: graph.edges.length,
    requiredEdgeCount: graph.edges.filter((row) => row.dependencyStrength === "required").length,
    alternativeEdgeCount: graph.edges.filter((row) => row.dependencyStrength === "alternative").length,
    supportingEdgeCount: graph.edges.filter((row) => row.dependencyStrength === "supporting").length,
    rootKnowledgePointCount: rootIds.size,
    boundaryReviewCount: reviewIds.size,
  };
  for (const [key, value] of Object.entries(actual)) {
    if (expected[key] !== value) {
      errors.push({ code: "KP_GRAPH_METRIC_MISMATCH", metric: key, expected: expected[key], actual: value });
    }
  }

  if (graph.metrics.semanticIdentityConflictCount !== 0) {
    errors.push({
      code: "KP_GRAPH_UPSTREAM_SEMANTIC_CONFLICT",
      conflictCount: graph.metrics.semanticIdentityConflictCount,
    });
  }

  const boundary = graph.mainlineBoundary;
  if (boundary.currentProductionConsumer !== "site/assets/browser/pipeline/build-worksheet-document.js"
    || boundary.productionConsumerChanged !== false
    || boundary.productionCutoverAllowed !== false
    || boundary.parallelAuthorityAllowed !== false) {
    errors.push({ code: "KP_GRAPH_MAINLINE_BOUNDARY_VIOLATION", boundary });
  }

  return {
    schemaName: "R03GlobalKnowledgePointPrerequisiteGraphValidationReportV1",
    schemaVersion: 1,
    taskId: graph.taskId,
    status: errors.length === 0
      ? "PASS_R03_GLOBAL_KP_PREREQUISITE_GRAPH"
      : "FAIL_R03_GLOBAL_KP_PREREQUISITE_GRAPH",
    errors,
    warnings,
    metrics: actual,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const report = validateR03GlobalKnowledgePointPrerequisiteGraph();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (report.errors.length > 0) process.exitCode = 1;
}
