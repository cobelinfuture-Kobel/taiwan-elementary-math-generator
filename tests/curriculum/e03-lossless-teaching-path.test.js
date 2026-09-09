import test from "node:test";
import assert from "node:assert/strict";

import {
  E03_EXPECTED_METRICS,
  E03_TARGET_KNOWLEDGE_POINT_ID,
  materializeE03LosslessTeachingPath,
  validateE03LosslessTeachingPath,
} from "../../tools/curriculum/materialize-e03-lossless-teaching-path.mjs";

const projection = materializeE03LosslessTeachingPath();
const validation = validateE03LosslessTeachingPath();

console.log("E03_LOSSLESS_STAGE_SUMMARY=" + JSON.stringify({
  targetKnowledgePointId: validation.targetKnowledgePointId,
  actualMetrics: validation.actualMetrics,
  stages: validation.teachingStageSummary.map((stage) => ({
    stageId: stage.stageId,
    labelZh: stage.labelZh,
    layers: [stage.topologicalLayerStart, stage.topologicalLayerEnd],
    knowledgePointCount: stage.knowledgePointCount,
    knowledgePointIds: stage.knowledgePointIds,
  })),
  gates: validation.gates.map(({ gateId, pass }) => ({ gateId, pass })),
  pass: validation.pass,
}));

test("E03 authority projection remains the exact 63-KP / 89-required-edge closure", () => {
  assert.equal(projection.targetKnowledgePointId, E03_TARGET_KNOWLEDGE_POINT_ID);
  assert.equal(projection.closureKnowledgePointCount, E03_EXPECTED_METRICS.knowledgePointCount);
  assert.equal(projection.requiredEdgeCount, E03_EXPECTED_METRICS.requiredEdgeCount);
  assert.equal(projection.alternativeEdgeCount, E03_EXPECTED_METRICS.alternativeEdgeCount);
  assert.equal(projection.supportingEdgeCount, E03_EXPECTED_METRICS.supportingEdgeCount);
  assert.equal(projection.topologicalLayers.length, E03_EXPECTED_METRICS.topologicalLayerCount);
  assert.equal(projection.teachingStages.length, E03_EXPECTED_METRICS.teachingStageCount);
});

test("E03 G1 node coverage is lossless", () => {
  const gate = validation.gates.find((row) => row.gateId === "G1_NODE_COVERAGE");
  assert.ok(gate?.pass, JSON.stringify(gate));
  assert.equal(gate.originalKnowledgePointCount, 63);
  assert.equal(gate.stagedKnowledgePointCount, 63);
  assert.deepEqual(gate.duplicateKnowledgePointIds, []);
  assert.deepEqual(gate.missingKnowledgePointIds, []);
  assert.deepEqual(gate.extraKnowledgePointIds, []);
});

test("E03 G2 preserves all 89 required direct edges", () => {
  const gate = validation.gates.find((row) => row.gateId === "G2_EDGE_PRESERVATION");
  assert.ok(gate?.pass, JSON.stringify(gate));
  assert.equal(gate.originalRequiredEdgeCount, 89);
  assert.equal(gate.preservedRequiredEdgeCount, 89);
  assert.deepEqual(gate.missingRequiredEdgeIds, []);
  assert.deepEqual(gate.extraRequiredEdgeIds, []);
});

test("E03 G3 keeps topological integrity across 10 teaching stages", () => {
  const gate = validation.gates.find((row) => row.gateId === "G3_TOPOLOGICAL_INTEGRITY");
  assert.ok(gate?.pass, JSON.stringify(gate));
  assert.equal(gate.topologicalLayerCount, 14);
  assert.equal(gate.teachingStageCount, 10);
  assert.equal(gate.backwardRequiredEdgeCount, 0);
  assert.equal(gate.intraStageOrderViolationCount, 0);
});

test("E03 G4 reconstructs the complete ancestor closure", () => {
  const gate = validation.gates.find((row) => row.gateId === "G4_ANCESTOR_CLOSURE");
  assert.ok(gate?.pass, JSON.stringify(gate));
  assert.equal(gate.originalClosureCount, 63);
  assert.equal(gate.reconstructedClosureCount, 63);
  assert.deepEqual(gate.missingReconstructedAncestors, []);
  assert.deepEqual(gate.extraReconstructedAncestors, []);
});

test("E03 G5 preserves readiness at every topological checkpoint", () => {
  const gate = validation.gates.find((row) => row.gateId === "G5_READINESS_EQUIVALENCE");
  assert.ok(gate?.pass, JSON.stringify(gate));
  assert.equal(gate.checkpointCount, 15);
  assert.equal(gate.readinessMismatchCount, 0);
  assert.equal(gate.layerProgressionMismatchCount, 0);
  assert.equal(gate.terminalFirstReadyCheckpoint, 13);
});

test("E03 G6 keeps every closure node connected to the terminal", () => {
  const gate = validation.gates.find((row) => row.gateId === "G6_TERMINAL_REACHABILITY");
  assert.ok(gate?.pass, JSON.stringify(gate));
  assert.equal(gate.reachableKnowledgePointCount, 63);
  assert.deepEqual(gate.unreachableKnowledgePointIds, []);
});

test("E03 lossless teaching path aggregate gate passes", () => {
  assert.equal(validation.pass, true, JSON.stringify(validation.gates, null, 2));
});
