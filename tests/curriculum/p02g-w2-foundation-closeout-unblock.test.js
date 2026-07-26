import test from "node:test";
import assert from "node:assert/strict";

import {
  getP02GW2DownstreamUnblockRow,
  listP02GW2DownstreamUnblockRows,
  materializeP02GW2FoundationCloseoutUnblockMatrix,
} from "../../src/curriculum/full-product/p02g-w2-foundation-closeout-unblock.mjs";
import { validateP02GW2FoundationCloseoutUnblockMatrix } from "../../tools/curriculum/validate-p02g-w2-foundation-closeout-unblock.mjs";

const EXPECTED_FOUNDATION_IDS = [
  "cap_kp_authority_lookup",
  "cap_prerequisite_readiness",
  "cap_quantity_dimension_unit_identity",
  "cap_quantity_semantic_role_binding",
  "cap_same_unit_quantity_arithmetic",
];

test("P02G closes all five W2 foundations with E5 successor evidence", () => {
  const runtime = materializeP02GW2FoundationCloseoutUnblockMatrix();
  assert.deepEqual([...runtime.requiredFoundationCapabilityIds].sort(), EXPECTED_FOUNDATION_IDS);
  assert.deepEqual([...runtime.effectivePromotionCapabilityIds].sort(), EXPECTED_FOUNDATION_IDS);
  assert.equal(runtime.foundationCloseoutRows.length, 5);
  assert.equal(runtime.metrics.productionAdmittedFoundationCount, 5);
  assert.equal(runtime.metrics.remainingShadowFoundationCount, 0);
  assert.equal(runtime.metrics.foundationE5ClaimCount, 5);
  for (const row of runtime.foundationCloseoutRows) {
    assert.equal(row.closeoutState, "FOUNDATION_PRODUCTION_ADMISSION_CLOSED", row.capabilityId);
    assert.equal(row.actualEvidenceLevel, "E5_PRODUCTION_ADMITTED", row.capabilityId);
    assert.equal(row.runtimeIntegrated, true, row.capabilityId);
    assert.equal(row.productionAdmitted, true, row.capabilityId);
  }
});

test("P02G recomputes all 51 historical dependent rows as capability-unblocked without mutating P02", () => {
  const runtime = materializeP02GW2FoundationCloseoutUnblockMatrix();
  const rows = listP02GW2DownstreamUnblockRows();
  assert.equal(runtime.historicalInventory.metrics.directW2KnowledgePointCount, 0);
  assert.equal(rows.length, 51);
  assert.equal(runtime.metrics.capabilityUnblockedKnowledgePointCount, 51);
  assert.equal(runtime.metrics.capabilityBlockedKnowledgePointCount, 0);
  for (const row of rows) {
    assert.equal(row.historicalCapabilityBlocked, true, row.knowledgePointId);
    assert.equal(row.capabilityUnblocked, true, row.knowledgePointId);
    assert.deepEqual(row.missingW2CapabilityIds, [], row.knowledgePointId);
    assert.equal(row.capabilityGateState, "W2_FOUNDATION_DEPENDENCY_UNBLOCKED", row.knowledgePointId);
    assert.equal(row.productProductionAdmitted, false, row.knowledgePointId);
    assert.equal(getP02GW2DownstreamUnblockRow(row.knowledgePointId), row);
  }
});

test("P02G separates capability unblock from downstream product admission", () => {
  const runtime = materializeP02GW2FoundationCloseoutUnblockMatrix();
  const acceptanceRows = runtime.rows.filter((row) => row.productAdmissionState === "PRODUCT_ACCEPTANCE_PENDING");
  const bindingRows = runtime.rows.filter((row) => row.productAdmissionState === "PATTERN_BINDING_REQUIRED");
  const verticalRows = runtime.rows.filter((row) => row.productAdmissionState === "PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED");
  assert.equal(acceptanceRows.length, 3);
  assert.equal(bindingRows.length, 0);
  assert.equal(verticalRows.length, 48);
  assert.equal(runtime.metrics.directProductAdmissionCount, 0);
  for (const row of acceptanceRows) {
    assert.equal(row.currentProductCoverage.publicKnowledgePointVisible, true, row.knowledgePointId);
    assert.equal(row.currentProductCoverage.publicPatternBindingPresent, true, row.knowledgePointId);
  }
  for (const row of runtime.rows) {
    assert.equal(row.directProductAdmissionAllowed, false, row.knowledgePointId);
    assert.ok(row.nextProductActions.length > 0, row.knowledgePointId);
    assert.equal(row.nextProductActions.some((action) => action.startsWith("HARDEN_AND_ADMIT_SHARED_CAPABILITY")), false, row.knowledgePointId);
  }
  process.stdout.write(`P02G_ACCEPTANCE_PENDING ${JSON.stringify(acceptanceRows.map((row) => ({
    knowledgePointId: row.knowledgePointId,
    sourceNodeIds: row.sourceNodeIds,
    deliveryWaveId: row.assignedDeliveryWaveId,
    patternGroupIds: row.currentProductCoverage.patternGroupIds,
    patternSpecIds: row.currentProductCoverage.patternSpecIds,
  })))}\n`);
});

test("P02G preserves the exact five-wave and twenty-source downstream distribution", () => {
  const runtime = materializeP02GW2FoundationCloseoutUnblockMatrix();
  assert.equal(runtime.sourceSummaries.length, 20);
  assert.deepEqual(runtime.metrics.dependentCountsByWave, {
    "R05-W0": 3,
    "R05-W4": 41,
    "R05-W5": 1,
    "R05-W7": 5,
    "R05-W8": 1,
  });
  assert.equal(runtime.waveSummaries.reduce((sum, row) => sum + row.dependentKnowledgePointCount, 0), 51);
  assert.equal(runtime.waveSummaries.reduce((sum, row) => sum + row.capabilityUnblockedKnowledgePointCount, 0), 51);
  process.stdout.write(`P02G_WAVE_MATRIX ${JSON.stringify(runtime.waveSummaries)}\n`);
});

test("P02G validator accepts the closeout matrix and emits machine-readable counts", () => {
  const result = validateP02GW2FoundationCloseoutUnblockMatrix();
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.deepEqual(result.counts, {
    foundations: 5,
    productionAdmittedFoundations: 5,
    remainingShadowFoundations: 0,
    foundationE5Claims: 5,
    dependentKnowledgePoints: 51,
    capabilityUnblockedKnowledgePoints: 51,
    capabilityBlockedKnowledgePoints: 0,
    dependentSources: 20,
    dependentWaves: 5,
    existingPublicPatternAcceptancePending: 3,
    patternBindingRequired: 0,
    publicProductVerticalSliceRequired: 48,
    directProductAdmissions: 0,
  });
  assert.equal(result.acceptancePendingKnowledgePointIds.length, 3);
  process.stdout.write(`P02G_READBACK ${JSON.stringify(result.counts)}\n`);
});
