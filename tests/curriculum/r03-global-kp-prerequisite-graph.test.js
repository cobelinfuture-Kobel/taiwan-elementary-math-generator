import test from "node:test";
import assert from "node:assert/strict";

import {
  getR03DirectPrerequisites,
  getR03KnowledgePointReadiness,
  getR03ReadyKnowledgePoints,
  materializeR03GlobalKnowledgePointPrerequisiteGraph,
} from "../../src/curriculum/global/r03-global-kp-prerequisite-graph.mjs";
import { validateR03GlobalKnowledgePointPrerequisiteGraph } from "../../tools/curriculum/validate-r03-global-kp-prerequisite-graph.mjs";

test("R03 materializes all 482 KnowledgePoints and explicit graph accounting", () => {
  const graph = materializeR03GlobalKnowledgePointPrerequisiteGraph();
  assert.equal(graph.knowledgePoints.length, 482);
  assert.equal(graph.edges.length, 668);
  assert.equal(graph.rootKnowledgePoints.length, 25);
  assert.equal(graph.boundaryReviewKnowledgePoints.length, 0);
  assert.equal(graph.metrics.requiredEdgeCount, 665);
  assert.equal(graph.metrics.alternativeEdgeCount, 2);
  assert.equal(graph.metrics.supportingEdgeCount, 1);
  assert.equal(graph.metrics.semanticIdentityConflictCount, 0);
});

test("R03 graph validator enforces DAG, transitive reduction, edge schema and mainline boundary", () => {
  const report = validateR03GlobalKnowledgePointPrerequisiteGraph();
  assert.equal(report.status, "PASS_R03_GLOBAL_KP_PREREQUISITE_GRAPH");
  assert.deepEqual(report.errors, []);
  assert.equal(report.metrics.knowledgePointCount, 482);
  assert.equal(report.metrics.edgeCount, 668);
});

test("R03 cross-Batch mass graph distinguishes same-unit multiplication from conversion-required arithmetic", () => {
  const massTimesInteger = getR03KnowledgePointReadiness(
    "kp_mass_times_integer",
    ["kp_mass_scale_unit_and_reading", "kp_g3a_u03_2digit_by_1digit_carry"],
  );
  assert.equal(massTimesInteger.ready, true);

  const conversionMissing = getR03KnowledgePointReadiness(
    "kp_mass_mixed_unit_add_sub",
    ["kp_g3a_u02_add_multi_carry", "kp_g3a_u02_sub_multi_borrow"],
  );
  assert.equal(conversionMissing.ready, false);
  assert.deepEqual(
    conversionMissing.missingRequiredKnowledgePointIds,
    ["kp_mass_kg_g_conversion"],
  );

  const conversionReady = getR03KnowledgePointReadiness(
    "kp_mass_mixed_unit_add_sub",
    [
      "kp_mass_kg_g_conversion",
      "kp_g3a_u02_add_multi_carry",
      "kp_g3a_u02_sub_multi_borrow",
    ],
  );
  assert.equal(conversionReady.ready, true);
});

test("R03 N+1 readiness exposes fraction part-whole after equal-sharing mastery", () => {
  const ready = getR03ReadyKnowledgePoints([
    "kp_g3a_u06_partitive_division_equal_sharing",
  ]);
  assert.equal(
    ready.some((row) => row.knowledgePointId === "kp_g3a_u08_part_whole_fraction"),
    true,
  );
});

test("R03 alternative group permits either approved mixed-number comparison route", () => {
  const byConversion = getR03KnowledgePointReadiness(
    "kp_g6b_u01_mixed_number_domain_order",
    ["kp_g6b_u01_decimal_fraction_conversion"],
  );
  assert.equal(byConversion.ready, true);

  const byCrossProduct = getR03KnowledgePointReadiness(
    "kp_g6b_u01_mixed_number_domain_order",
    ["kp_g4b_u08_fraction_compare_cross_product"],
  );
  assert.equal(byCrossProduct.ready, true);

  const withNeither = getR03KnowledgePointReadiness(
    "kp_g6b_u01_mixed_number_domain_order",
    [],
  );
  assert.equal(withNeither.ready, false);
  assert.equal(withNeither.unsatisfiedAlternativeGroups.length, 1);
});

test("R03 direct prerequisites preserve immediate edges and supporting edges do not block readiness", () => {
  const direct = getR03DirectPrerequisites("kp_mass_mixed_unit_add_sub");
  assert.deepEqual(
    direct.filter((row) => row.dependencyStrength === "required")
      .map((row) => row.fromKnowledgePointId)
      .sort(),
    [
      "kp_g3a_u02_add_multi_carry",
      "kp_g3a_u02_sub_multi_borrow",
      "kp_mass_kg_g_conversion",
    ],
  );

  const graph = materializeR03GlobalKnowledgePointPrerequisiteGraph();
  const supporting = graph.edges.filter((row) => row.dependencyStrength === "supporting");
  assert.equal(supporting.length, 1);
  assert.equal(supporting[0].distanceBearing, false);
});

test("R03 remains shadow-only and does not modify the production worksheet consumer", () => {
  const graph = materializeR03GlobalKnowledgePointPrerequisiteGraph();
  assert.deepEqual(graph.mainlineBoundary, {
    currentProductionConsumer: "site/assets/browser/pipeline/build-worksheet-document.js",
    productionConsumerChanged: false,
    runtimeCapabilityMappingsMaterialized: false,
    deliveryWaveRebased: false,
    productionCutoverAllowed: false,
    parallelAuthorityAllowed: false,
    nextTask: "R04_SharedRuntimeCapabilityMatrix",
  });
});
