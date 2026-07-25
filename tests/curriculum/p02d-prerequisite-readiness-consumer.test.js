import test from "node:test";
import assert from "node:assert/strict";

import {
  getP02DPrerequisiteReadinessDescriptor,
  listP02DEffectiveW2PromotionCapabilityIds,
  listP02DPrerequisiteReadinessDescriptors,
  listP02DReadyKnowledgePoints,
  materializeP02DPrerequisiteReadinessConsumer,
  resolveP02DPrerequisiteReadiness,
} from "../../src/curriculum/full-product/p02d-prerequisite-readiness-consumer.mjs";
import { validateP02DPrerequisiteReadinessConsumer } from "../../tools/curriculum/validate-p02d-prerequisite-readiness-consumer.mjs";

function satisfyingMasteredSet(descriptor) {
  return [...new Set([
    ...descriptor.requiredPrerequisiteKnowledgePointIds,
    ...descriptor.alternativePrerequisiteGroups.flatMap((group) => (
      group.sourceKnowledgePointIds.slice(0, group.minimumSatisfied)
    )),
  ])].sort();
}

test("P02D materializes all 482 prerequisite-readiness descriptors from R03 and P02B", () => {
  const runtime = materializeP02DPrerequisiteReadinessConsumer();
  assert.equal(runtime.metrics.canonicalKnowledgePointCount, 482);
  assert.equal(runtime.metrics.directPrerequisiteEdgeCount, 668);
  assert.equal(runtime.metrics.requiredEdgeCount, 665);
  assert.equal(runtime.metrics.alternativeEdgeCount, 2);
  assert.equal(runtime.metrics.supportingEdgeCount, 1);
  assert.equal(runtime.metrics.rootKnowledgePointCount, 25);
  assert.equal(runtime.metrics.alternativeGroupCount, 1);
  assert.equal(runtime.metrics.descriptorErrorCount, 0, runtime.descriptorErrors.join("\n"));
  assert.equal(runtime.descriptors.length, 482);
  assert.equal(new Set(runtime.descriptors.map((row) => row.knowledgePointId)).size, 482);
  assert.equal(runtime.consumerMode, "PRODUCTION_READ_ONLY_PREREQUISITE_READINESS");
  assert.equal(runtime.productionAdmissionState, "PRODUCTION_ADMITTED");
});

test("P02D empty mastered set exposes exactly the 25 graph roots", () => {
  const result = listP02DReadyKnowledgePoints([]);
  assert.equal(result.ok, true);
  assert.equal(result.blocked, false);
  assert.equal(result.candidates.length, 25);
  for (const candidate of result.candidates) {
    assert.equal(candidate.ready, true);
    assert.equal(candidate.readinessState, "READY_N_PLUS_ONE");
    assert.equal(getP02DPrerequisiteReadinessDescriptor(candidate.knowledgePointId).isRoot, true);
  }
});

test("P02D required prerequisites gate N+1 readiness without blocking a valid not-ready response", () => {
  const descriptor = listP02DPrerequisiteReadinessDescriptors()
    .find((row) => row.requiredPrerequisiteKnowledgePointIds.length > 0);
  assert.ok(descriptor);
  const mastered = satisfyingMasteredSet(descriptor);
  const ready = resolveP02DPrerequisiteReadiness({
    targetKnowledgePointId: descriptor.knowledgePointId,
    masteredKnowledgePointIds: mastered,
  });
  assert.equal(ready.ok, true);
  assert.equal(ready.blocked, false);
  assert.equal(ready.ready, true);

  const removed = descriptor.requiredPrerequisiteKnowledgePointIds[0];
  const notReady = resolveP02DPrerequisiteReadiness({
    targetKnowledgePointId: descriptor.knowledgePointId,
    masteredKnowledgePointIds: mastered.filter((id) => id !== removed),
  });
  assert.equal(notReady.ok, true);
  assert.equal(notReady.blocked, false);
  assert.equal(notReady.ready, false);
  assert.equal(notReady.readiness.readinessState, "BLOCKED_BY_PREREQUISITES");
  assert.ok(notReady.readiness.missingRequiredKnowledgePointIds.includes(removed));
});

test("P02D alternative group requires its minimum while supporting edges never block", () => {
  const runtime = materializeP02DPrerequisiteReadinessConsumer();
  const alternative = runtime.descriptors.find((row) => row.alternativePrerequisiteGroups.length > 0);
  assert.ok(alternative);
  const noAlternative = runtime.resolve({
    targetKnowledgePointId: alternative.knowledgePointId,
    masteredKnowledgePointIds: [...alternative.requiredPrerequisiteKnowledgePointIds],
  });
  assert.equal(noAlternative.ok, true);
  assert.equal(noAlternative.ready, false);
  assert.ok(noAlternative.readiness.unsatisfiedAlternativeGroupIds.length > 0);

  const withAlternative = runtime.resolve({
    targetKnowledgePointId: alternative.knowledgePointId,
    masteredKnowledgePointIds: satisfyingMasteredSet(alternative),
  });
  assert.equal(withAlternative.ok, true);
  assert.equal(withAlternative.ready, true);

  const supporting = runtime.descriptors.find((row) => row.supportingKnowledgePointIds.length > 0);
  assert.ok(supporting);
  const withoutSupporting = runtime.resolve({
    targetKnowledgePointId: supporting.knowledgePointId,
    masteredKnowledgePointIds: satisfyingMasteredSet(supporting),
  });
  assert.equal(withoutSupporting.ok, true);
  assert.equal(withoutSupporting.ready, true);
});

test("P02D fails closed for malformed, unknown, duplicate and already-mastered identities", () => {
  const runtime = materializeP02DPrerequisiteReadinessConsumer();
  const first = runtime.descriptors[0].knowledgePointId;
  const second = runtime.descriptors[1].knowledgePointId;

  assert.deepEqual(runtime.resolve({ masteredKnowledgePointIds: [] }).errors, ["P02D_TARGET_KP_ID_REQUIRED"]);
  assert.deepEqual(runtime.resolve({ targetKnowledgePointId: first }).errors, ["P02D_MASTERED_SET_REQUIRED"]);
  assert.deepEqual(runtime.resolve({ targetKnowledgePointId: first, masteredKnowledgePointIds: "bad" }).errors, ["P02D_MASTERED_SET_INVALID"]);
  assert.match(runtime.resolve({
    targetKnowledgePointId: "kp_p02d_unknown",
    masteredKnowledgePointIds: [],
  }).errors[0], /^P02D_UNKNOWN_TARGET_KP:/);
  assert.match(runtime.resolve({
    targetKnowledgePointId: first,
    masteredKnowledgePointIds: ["kp_p02d_unknown"],
  }).errors[0], /^P02D_UNKNOWN_MASTERED_KP:/);
  assert.match(runtime.resolve({
    targetKnowledgePointId: first,
    masteredKnowledgePointIds: [second, second],
  }).errors[0], /^P02D_DUPLICATE_MASTERED_KP:/);
  assert.match(runtime.resolve({
    targetKnowledgePointId: first,
    masteredKnowledgePointIds: [first],
  }).errors[0], /^P02D_TARGET_ALREADY_MASTERED:/);
});

test("P02D preserves P02B and P02C promotions and admits exactly one new capability", () => {
  const runtime = materializeP02DPrerequisiteReadinessConsumer();
  assert.deepEqual(listP02DEffectiveW2PromotionCapabilityIds().sort(), [
    "cap_kp_authority_lookup",
    "cap_prerequisite_readiness",
    "cap_quantity_dimension_unit_identity",
  ]);
  assert.equal(runtime.promotionRegistry.promotions.length, 1);
  assert.equal(runtime.promotionRegistry.promotions[0].capabilityId, "cap_prerequisite_readiness");
  assert.deepEqual(runtime.promotionRegistry.remainingShadowFoundationCapabilityIds, [
    "cap_quantity_semantic_role_binding",
    "cap_same_unit_quantity_arithmetic",
  ]);
});

test("P02D contract remains read-only and does not implement planner or mastery persistence", () => {
  const runtime = materializeP02DPrerequisiteReadinessConsumer();
  assert.equal(runtime.policy.consumerContract.learnerStatePersistenceAllowed, false);
  assert.equal(runtime.policy.consumerContract.masteryMutationAllowed, false);
  assert.equal(runtime.policy.consumerContract.lessonSchedulingAllowed, false);
  assert.equal(runtime.manifest.mainlineBoundary.learnerProfileImplemented, false);
  assert.equal(runtime.manifest.mainlineBoundary.masteryStoreImplemented, false);
  assert.equal(runtime.manifest.mainlineBoundary.lessonPlannerImplemented, false);
});

test("P02D fail-closed validator accepts exact production admission", () => {
  const result = validateP02DPrerequisiteReadinessConsumer();
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.equal(result.counts.canonicalKnowledgePoints, 482);
  assert.equal(result.counts.directPrerequisiteEdges, 668);
  assert.equal(result.counts.rootsReadyFromEmptySet, 25);
  assert.equal(result.counts.fullReadinessSweepPassed, 482);
  assert.equal(result.counts.alternativeGroups, 1);
  assert.equal(result.counts.effectivePromotions, 3);
  assert.equal(result.counts.remainingShadowFoundations, 2);
  process.stdout.write(`P02D_READBACK ${JSON.stringify(result.counts)}\n`);
});
