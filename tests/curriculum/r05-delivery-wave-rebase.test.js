import test from "node:test";
import assert from "node:assert/strict";

import {
  getR05DeliveryWaveAssignment,
  materializeR05DeliveryWaveRebase,
} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";
import { validateR05DeliveryWaveRebase } from "../../tools/curriculum/validate-r05-delivery-wave-rebase.mjs";

test("R05 materializes one capability-based delivery wave assignment for all 482 KnowledgePoints", () => {
  const plan = materializeR05DeliveryWaveRebase();
  assert.equal(plan.waves.length, 9);
  assert.equal(plan.knowledgePointAssignments.length, 482);
  assert.equal(plan.capabilityDeliveryPlan.length, 58);
  assert.equal(new Set(plan.knowledgePointAssignments.map((row) => row.knowledgePointId)).size, 482);
  assert.equal(plan.metrics.waveMetrics.reduce((sum, row) => sum + row.knowledgePointCount, 0), 482);
  assert.equal(plan.mainlineBoundary.currentProductionConsumer, "site/assets/browser/pipeline/build-worksheet-document.js");
  assert.equal(plan.mainlineBoundary.productionConsumerChanged, false);
  assert.equal(plan.mainlineBoundary.productionCutoverAllowed, false);
  assert.equal(plan.mainlineBoundary.nextTask, "R06_LegacyCompatibilityMigration");
  console.log(`R05_DELIVERY_WAVE_SUMMARY=${JSON.stringify(plan.metrics)}`);
});

test("R05 preserves the existing 15-unit D0 baseline without rebuilding or demotion", () => {
  const plan = materializeR05DeliveryWaveRebase();
  assert.equal(plan.policy.publicBaseline.rebuildRequired, false);
  assert.equal(plan.policy.publicBaseline.revalidationRequired, true);
  assert.equal(plan.metrics.protectedProductUnitCount, 15);
  assert.equal(plan.metrics.protectedSourceNodeCount, 16);
  const protectedRows = plan.knowledgePointAssignments.filter((row) => (
    row.productionAdmissionState === "PROTECTED_EXISTING_D0"
  ));
  assert.ok(protectedRows.length > 0);
  assert.ok(protectedRows.every((row) => row.deliveryWaveId === "R05-W0"));
  assert.ok(protectedRows.every((row) => row.r06CompatibilityMigrationRequired === true));
  const reconciliationRows = protectedRows.filter((row) => row.protectedPrerequisiteCapabilityContradictionIds.length > 0);
  assert.ok(reconciliationRows.length > 0);
  assert.equal(plan.metrics.protectedGlobalModelReconciliationCount, reconciliationRows.length);
  assert.ok(reconciliationRows.every((row) => row.r06CompatibilityMigrationRequired === true));
});

test("R05 separates same-unit quantity capability hardening from mixed-unit implementation", () => {
  const sameUnit = getR05DeliveryWaveAssignment("kp_mass_times_integer");
  const mixedUnit = getR05DeliveryWaveAssignment("kp_mass_mixed_unit_add_sub");
  assert.ok(sameUnit);
  assert.ok(mixedUnit);
  assert.equal(sameUnit.baseDeliveryWaveId, "R05-W4");
  assert.equal(sameUnit.deliveryWaveId, "R05-W4");
  assert.equal(sameUnit.waveEscalatedByPrerequisite, false);
  assert.ok(sameUnit.contractOnlyRequiredCapabilityIds.includes("cap_quantity_domain_validator"));
  assert.ok(!sameUnit.contractOnlyRequiredCapabilityIds.includes("cap_unit_conversion"));
  assert.ok(!sameUnit.contractOnlyRequiredCapabilityIds.includes("cap_mixed_unit_normalization"));
  assert.ok(sameUnit.shadowRequiredCapabilityIds.includes("cap_same_unit_quantity_arithmetic"));
  assert.equal(mixedUnit.deliveryWaveId, "R05-W4");
  assert.ok(mixedUnit.contractOnlyRequiredCapabilityIds.includes("cap_unit_conversion"));
  assert.ok(mixedUnit.contractOnlyRequiredCapabilityIds.includes("cap_mixed_unit_normalization"));
});

test("R05 places number-domain and rate capability gaps after their actual shared foundations", () => {
  const plan = materializeR05DeliveryWaveRebase();
  const decimal = plan.knowledgePointAssignments.find((row) => (
    row.productionAdmissionState === "PLANNED_NOT_ADMITTED"
    && row.primaryRuntimeProfileId === "profile_decimal"
    && row.contractOnlyRequiredCapabilityIds.includes("cap_decimal_number_system")
  ));
  const fraction = plan.knowledgePointAssignments.find((row) => (
    row.productionAdmissionState === "PLANNED_NOT_ADMITTED"
    && row.primaryRuntimeProfileId === "profile_fraction"
    && row.contractOnlyRequiredCapabilityIds.includes("cap_fraction_number_system")
  ));
  const speed = getR05DeliveryWaveAssignment("kp_speed_distance_time_relation");
  assert.ok(decimal);
  assert.ok(fraction);
  assert.ok(speed);
  assert.equal(decimal.deliveryWaveId, "R05-W3");
  assert.equal(fraction.deliveryWaveId, "R05-W3");
  assert.equal(speed.deliveryWaveId, "R05-W7");
  assert.ok(speed.contractOnlyRequiredCapabilityIds.includes("cap_speed_rate_reasoning"));
});

test("R05 delivery waves are independent of legacy Batch A-E membership", () => {
  const plan = materializeR05DeliveryWaveRebase();
  assert.equal(plan.policy.rules.legacyBatchMayAssignWave, false);
  for (const assignment of plan.knowledgePointAssignments) {
    assert.equal(assignment.legacyBatchUsedForAssignment, false);
    assert.equal(assignment.mappingBasis.legacyBatchUsedForAssignment, false);
    assert.equal("primaryBatch" in assignment, false);
  }
});

test("R05 validator passes prerequisite monotonicity, capability sequencing, and mainline protection", () => {
  const plan = materializeR05DeliveryWaveRebase();
  const report = validateR05DeliveryWaveRebase(plan);
  assert.equal(report.ok, true, JSON.stringify(report.errors, null, 2));
  assert.equal(report.summary.knowledgePointAssignmentCount, 482);
  assert.equal(report.summary.capabilityPlanCount, 58);
  assert.equal(report.summary.protectedProductUnitCount, 15);
});

test("R05 validator fails closed on baseline demotion and premature production cutover", () => {
  const plan = materializeR05DeliveryWaveRebase();
  const protectedIndex = plan.knowledgePointAssignments.findIndex((row) => (
    row.productionAdmissionState === "PROTECTED_EXISTING_D0"
  ));
  assert.notEqual(protectedIndex, -1);
  const assignments = plan.knowledgePointAssignments.map((row, index) => (
    index === protectedIndex ? { ...row, deliveryWaveId: "R05-W1" } : row
  ));
  const tampered = {
    ...plan,
    knowledgePointAssignments: assignments,
    mainlineBoundary: { ...plan.mainlineBoundary, productionCutoverAllowed: true },
  };
  const report = validateR05DeliveryWaveRebase(tampered);
  assert.equal(report.ok, false);
  assert.ok(report.errors.some((row) => row.code === "R05_EXISTING_D0_DEMOTED"));
  assert.ok(report.errors.some((row) => row.code === "R05_PRODUCTION_CUTOVER_PREMATURE"));
});
