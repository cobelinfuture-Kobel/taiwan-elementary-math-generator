import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

import { materializeR02GlobalKnowledgePointRegistry } from "./r02-global-kp-candidate-reconciliation.mjs";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../../..");
const MANIFEST_PATH = "data/curriculum/global/graph/r03/global-kp-prerequisite-graph.manifest.json";

function readJson(root, repoPath) {
  return JSON.parse(fs.readFileSync(path.join(root, repoPath), "utf8"));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function expandEdgeRow(row, graphVersion) {
  const [
    edgeId,
    fromKnowledgePointId,
    toKnowledgePointId,
    dependencyStrength,
    dependencyRole,
    alternativeGroupId,
    distanceBearing,
    rationale,
    evidenceRefs,
  ] = row;

  return Object.freeze({
    edgeId,
    fromKnowledgePointId,
    toKnowledgePointId,
    dependencyStrength,
    dependencyRole,
    alternativeGroupId,
    isImmediatePrerequisite: dependencyStrength !== "supporting",
    distanceBearing,
    rationale,
    evidenceRefs: Object.freeze([...(evidenceRefs ?? [])]),
    status: "approved",
    introducedVersion: graphVersion,
  });
}

export function materializeR03GlobalKnowledgePointPrerequisiteGraph(options = {}) {
  const root = options.root ?? ROOT;
  const manifestPath = options.manifestPath ?? MANIFEST_PATH;
  const manifest = readJson(root, manifestPath);
  const r02Registry = materializeR02GlobalKnowledgePointRegistry({ root });

  const encodedEdgePack = manifest.edgeStorage.chunkPaths
    .map((repoPath) => fs.readFileSync(path.join(root, repoPath), "utf8").trim())
    .join("");
  const decodedEdgePack = JSON.parse(
    zlib.gunzipSync(Buffer.from(encodedEdgePack, "base64")).toString("utf8"),
  );
  const edges = (decodedEdgePack.edgeRows ?? [])
    .map((row) => expandEdgeRow(row, manifest.graphVersion))
    .sort((a, b) => a.edgeId.localeCompare(b.edgeId));

  const rootRegistry = readJson(root, manifest.rootRegistryPath);
  const rootKnowledgePoints = [...(rootRegistry.rootKnowledgePoints ?? [])]
    .sort((a, b) => a.knowledgePointId.localeCompare(b.knowledgePointId));
  const boundaryReviewKnowledgePoints = [...(rootRegistry.boundaryReviewKnowledgePoints ?? [])]
    .sort((a, b) => a.knowledgePointId.localeCompare(b.knowledgePointId));

  const incomingByTarget = new Map();
  const outgoingBySource = new Map();
  for (const edge of edges) {
    if (!incomingByTarget.has(edge.toKnowledgePointId)) incomingByTarget.set(edge.toKnowledgePointId, []);
    if (!outgoingBySource.has(edge.fromKnowledgePointId)) outgoingBySource.set(edge.fromKnowledgePointId, []);
    incomingByTarget.get(edge.toKnowledgePointId).push(edge);
    outgoingBySource.get(edge.fromKnowledgePointId).push(edge);
  }

  return Object.freeze({
    schemaName: "R03GlobalKnowledgePointPrerequisiteGraphV1",
    schemaVersion: 1,
    programId: manifest.programId,
    taskId: manifest.taskId,
    status: manifest.status,
    graphVersion: manifest.graphVersion,
    manifestPath,
    knowledgePoints: r02Registry.knowledgePoints,
    sourceViews: r02Registry.sourceViews,
    edges: Object.freeze(edges),
    rootKnowledgePoints: Object.freeze(rootKnowledgePoints),
    boundaryReviewKnowledgePoints: Object.freeze(boundaryReviewKnowledgePoints),
    alternativeGroups: Object.freeze(clone(manifest.alternativeGroups ?? {})),
    metrics: Object.freeze({
      ...clone(manifest.metrics),
      actualKnowledgePointCount: r02Registry.knowledgePoints.length,
      actualEdgeCount: edges.length,
      actualRootKnowledgePointCount: rootKnowledgePoints.length,
      semanticIdentityConflictCount: r02Registry.conflicts.length,
    }),
    graphPolicy: Object.freeze(clone(manifest.graphPolicy)),
    mainlineBoundary: Object.freeze(clone(manifest.mainlineBoundary)),
    incomingByTarget,
    outgoingBySource,
  });
}

export function listR03PrerequisiteEdges(options = {}) {
  return clone(materializeR03GlobalKnowledgePointPrerequisiteGraph(options).edges);
}

export function getR03DirectPrerequisites(knowledgePointId, options = {}) {
  const graph = materializeR03GlobalKnowledgePointPrerequisiteGraph(options);
  return clone(graph.incomingByTarget.get(knowledgePointId) ?? []);
}

export function getR03DirectDependents(knowledgePointId, options = {}) {
  const graph = materializeR03GlobalKnowledgePointPrerequisiteGraph(options);
  return clone(graph.outgoingBySource.get(knowledgePointId) ?? []);
}

function readinessForKnowledgePoint(graph, knowledgePointId, masteredSet) {
  const incoming = graph.incomingByTarget.get(knowledgePointId) ?? [];
  const required = incoming.filter((edge) => edge.dependencyStrength === "required");
  const alternative = incoming.filter((edge) => edge.dependencyStrength === "alternative");

  const missingRequired = required
    .filter((edge) => !masteredSet.has(edge.fromKnowledgePointId))
    .map((edge) => edge.fromKnowledgePointId);

  const alternativesByGroup = new Map();
  for (const edge of alternative) {
    if (!alternativesByGroup.has(edge.alternativeGroupId)) alternativesByGroup.set(edge.alternativeGroupId, []);
    alternativesByGroup.get(edge.alternativeGroupId).push(edge.fromKnowledgePointId);
  }

  const unsatisfiedAlternativeGroups = [];
  const satisfiedAlternativeGroups = [];
  for (const [groupId, sourceIds] of alternativesByGroup.entries()) {
    const contract = graph.alternativeGroups[groupId] ?? { minimumSatisfied: 1 };
    const satisfiedIds = sourceIds.filter((sourceId) => masteredSet.has(sourceId));
    const row = {
      alternativeGroupId: groupId,
      minimumSatisfied: contract.minimumSatisfied,
      sourceKnowledgePointIds: sourceIds,
      satisfiedKnowledgePointIds: satisfiedIds,
    };
    if (satisfiedIds.length >= contract.minimumSatisfied) {
      satisfiedAlternativeGroups.push(row);
    } else {
      unsatisfiedAlternativeGroups.push(row);
    }
  }

  return {
    knowledgePointId,
    ready: !masteredSet.has(knowledgePointId)
      && missingRequired.length === 0
      && unsatisfiedAlternativeGroups.length === 0,
    missingRequiredKnowledgePointIds: missingRequired,
    satisfiedAlternativeGroups,
    unsatisfiedAlternativeGroups,
  };
}

export function getR03ReadyKnowledgePoints(masteredKnowledgePointIds, options = {}) {
  const graph = materializeR03GlobalKnowledgePointPrerequisiteGraph(options);
  const masteredSet = new Set(masteredKnowledgePointIds ?? []);
  return graph.knowledgePoints
    .map((row) => readinessForKnowledgePoint(graph, row.knowledgePointId, masteredSet))
    .filter((row) => row.ready)
    .sort((a, b) => a.knowledgePointId.localeCompare(b.knowledgePointId));
}

export function getR03KnowledgePointReadiness(knowledgePointId, masteredKnowledgePointIds, options = {}) {
  const graph = materializeR03GlobalKnowledgePointPrerequisiteGraph(options);
  return readinessForKnowledgePoint(graph, knowledgePointId, new Set(masteredKnowledgePointIds ?? []));
}
