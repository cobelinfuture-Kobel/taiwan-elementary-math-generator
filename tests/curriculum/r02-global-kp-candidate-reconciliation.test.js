import test from "node:test";
import assert from "node:assert/strict";

import {
  getR02SourceCandidateView,
  materializeR02GlobalKnowledgePointRegistry,
} from "../../src/curriculum/global/r02-global-kp-candidate-reconciliation.mjs";
import {
  validateR02GlobalKnowledgePointCandidateReconciliation,
} from "../../tools/curriculum/validate-r02-global-kp-candidate-reconciliation.mjs";

test("R02 reconciles all 79 source nodes across existing, W02 and reviewed evidence", () => {
  const result = validateR02GlobalKnowledgePointCandidateReconciliation();
  assert.equal(result.ok, true, JSON.stringify(result.issues, null, 2));
  assert.equal(result.counts.sourceNodeCount, 79);
  assert.equal(result.counts.sourceViewCount, 79);
  assert.equal(result.counts.existingProductionAuthoritySourceCount, 16);
  assert.equal(result.counts.existingW02CandidateAuthoritySourceCount, 13);
  assert.equal(result.counts.fullPageReviewedSourceCount, 50);
  assert.equal(result.counts.reviewedPdfCount, 50);
  assert.equal(result.counts.reviewedPageCount, 99);
  assert.equal(result.counts.reviewedCandidateProjectionCount, 247);
  assert.equal(result.counts.reviewedUniqueKnowledgePointCount, 242);
  assert.equal(result.counts.semanticIdentityConflictCount, 0);
});

test("R02 preserves existing production KnowledgePoint identities without consumer cutover", () => {
  const registry = materializeR02GlobalKnowledgePointRegistry();
  const preserved = registry.knowledgePoints.find((row) => row.knowledgePointId === "kp_g3a_u01_4digit_compare");
  assert.ok(preserved);
  assert.equal(preserved.candidateStatus, "RECONCILED_EXISTING_KP");
  assert.equal(preserved.mainlineBinding.productionCutoverAllowed, false);
  assert.equal(registry.mainlineBoundary.currentProductionConsumer, "site/assets/browser/pipeline/build-worksheet-document.js");
  assert.equal(registry.mainlineBoundary.productionCutoverAllowed, false);
  assert.equal(registry.mainlineBoundary.prerequisiteEdgesMaterialized, false);
  assert.equal(registry.mainlineBoundary.runtimeCapabilityMappingsMaterialized, false);
});

test("R02 decomposes g3b_u06 into six distinct quantity capabilities", () => {
  const view = getR02SourceCandidateView("g3b_u06_3b06");
  assert.ok(view);
  assert.equal(view.candidateProjectionCount, 6);
  assert.deepEqual(new Set(view.knowledgePointIds), new Set([
    "kp_mass_indirect_comparison",
    "kp_mass_scale_unit_and_reading",
    "kp_mass_kg_g_conversion",
    "kp_mass_mixed_unit_compare",
    "kp_mass_mixed_unit_add_sub",
    "kp_mass_times_integer",
  ]));
});

test("R02 merges duplicate source evidence without duplicating semantic identities", () => {
  const registry = materializeR02GlobalKnowledgePointRegistry();
  const fraction = registry.knowledgePoints.find((row) => row.knowledgePointId === "kp_fraction_improper_mixed_integer_conversion");
  assert.ok(fraction);
  assert.deepEqual(new Set(fraction.sourceRefs.map((row) => row.sourceNodeId)), new Set([
    "g4a_u06_4a06",
    "g4b_u03_4b03",
  ]));

  const speed = registry.knowledgePoints.find((row) => row.knowledgePointId === "kp_speed_distance_time_relation");
  assert.ok(speed);
  assert.deepEqual(new Set(speed.sourceRefs.map((row) => row.sourceNodeId)), new Set([
    "g6a_u08_6a08",
    "g6b_u02_6b02",
  ]));
});

test("R02 global registry contains both reconciled existing and candidate-only KnowledgePoints", () => {
  const registry = materializeR02GlobalKnowledgePointRegistry();
  assert.ok(registry.counts.globalKnowledgePointCount > registry.counts.reviewedUniqueKnowledgePointCount);
  assert.ok(registry.counts.reconciledExistingKnowledgePointCount > 0);
  assert.ok(registry.counts.candidateOnlyKnowledgePointCount > 0);
  assert.equal(registry.conflicts.length, 0);
});
