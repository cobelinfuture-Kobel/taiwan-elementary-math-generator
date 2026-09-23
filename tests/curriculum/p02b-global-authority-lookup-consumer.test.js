import test from "node:test";
import assert from "node:assert/strict";

import {
  getP02BW2CapabilityPromotion,
  materializeP02BGlobalAuthorityLookupConsumer,
  resolveP02BGlobalAuthorityLookup,
} from "../../src/curriculum/full-product/p02b-global-authority-lookup-consumer.mjs";
import { validateP02BGlobalAuthorityLookupConsumer } from "../../tools/curriculum/validate-p02b-global-authority-lookup-consumer.mjs";
import { listVisibleBatchAKnowledgePoints } from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";

const REMAINING_SHADOW_FOUNDATIONS = Object.freeze([
  "cap_prerequisite_readiness",
  "cap_quantity_dimension_unit_identity",
  "cap_quantity_semantic_role_binding",
  "cap_same_unit_quantity_arithmetic",
]);

test("P02B materializes the exact 79-source and 482-KP production lookup consumer", () => {
  const consumer = materializeP02BGlobalAuthorityLookupConsumer();
  assert.equal(consumer.metrics.globalSourceNodeCount, 79);
  assert.equal(consumer.metrics.canonicalKnowledgePointCount, 482);
  assert.equal(consumer.sourceDescriptors.length, 79);
  assert.equal(consumer.knowledgePointDescriptors.length, 482);
  assert.equal(new Set(consumer.sourceDescriptors.map((row) => row.sourceNodeId)).size, 79);
  assert.equal(new Set(consumer.knowledgePointDescriptors.map((row) => row.knowledgePointId)).size, 482);
  assert.equal(consumer.authorityMode, "GLOBAL_PRIMARY");
  assert.equal(consumer.consumerMode, "PRODUCTION_READ_ONLY_GLOBAL_AUTHORITY");
  assert.equal(consumer.productionAdmissionState, "PRODUCTION_ADMITTED");
});

test("P02B preserves complete source-to-KP and KP-to-source round trips", () => {
  const consumer = materializeP02BGlobalAuthorityLookupConsumer();
  const sourceById = new Map(consumer.sourceDescriptors.map((row) => [row.sourceNodeId, row]));
  const knowledgePointById = new Map(
    consumer.knowledgePointDescriptors.map((row) => [row.knowledgePointId, row]),
  );
  for (const source of consumer.sourceDescriptors) {
    assert.ok(source.knowledgePointIds.length > 0, source.sourceNodeId);
    const lookup = consumer.resolve({ sourceNodeId: source.sourceNodeId });
    assert.equal(lookup.ok, true, source.sourceNodeId);
    assert.equal(lookup.source.sourceNodeId, source.sourceNodeId);
    for (const knowledgePointId of source.knowledgePointIds) {
      const knowledgePoint = knowledgePointById.get(knowledgePointId);
      assert.ok(knowledgePoint, `${source.sourceNodeId}:${knowledgePointId}`);
      assert.ok(knowledgePoint.sourceNodeIds.includes(source.sourceNodeId));
      const pair = consumer.resolve({ sourceNodeId: source.sourceNodeId, knowledgePointId });
      assert.equal(pair.ok, true, `${source.sourceNodeId}:${knowledgePointId}`);
    }
  }
  for (const knowledgePoint of consumer.knowledgePointDescriptors) {
    assert.ok(knowledgePoint.sourceNodeIds.length > 0, knowledgePoint.knowledgePointId);
    const lookup = consumer.resolve({ knowledgePointId: knowledgePoint.knowledgePointId });
    assert.equal(lookup.ok, true, knowledgePoint.knowledgePointId);
    for (const sourceNodeId of knowledgePoint.sourceNodeIds) {
      const source = sourceById.get(sourceNodeId);
      assert.ok(source, `${knowledgePoint.knowledgePointId}:${sourceNodeId}`);
      assert.ok(source.knowledgePointIds.includes(knowledgePoint.knowledgePointId));
    }
  }
});

test("P02B fails closed for empty, unknown and mismatched identities", () => {
  const consumer = materializeP02BGlobalAuthorityLookupConsumer();
  const empty = resolveP02BGlobalAuthorityLookup({});
  assert.equal(empty.blocked, true);
  assert.ok(empty.errors.includes("P02B_LOOKUP_ID_REQUIRED"));

  const unknownSource = resolveP02BGlobalAuthorityLookup({ sourceNodeId: "g9z_u99_unknown" });
  assert.equal(unknownSource.blocked, true);
  assert.ok(unknownSource.errors.some((code) => code.startsWith("P02B_UNKNOWN_SOURCE_NODE:")));

  const unknownKnowledgePoint = resolveP02BGlobalAuthorityLookup({ knowledgePointId: "kp_unknown_p02b" });
  assert.equal(unknownKnowledgePoint.blocked, true);
  assert.ok(unknownKnowledgePoint.errors.some((code) => code.startsWith("P02B_UNKNOWN_KNOWLEDGE_POINT:")));

  const source = consumer.sourceDescriptors[0];
  const knowledgePoint = consumer.knowledgePointDescriptors.find((row) => (
    !source.knowledgePointIds.includes(row.knowledgePointId)
  ));
  assert.ok(knowledgePoint);
  const mismatch = resolveP02BGlobalAuthorityLookup({
    sourceNodeId: source.sourceNodeId,
    knowledgePointId: knowledgePoint.knowledgePointId,
  });
  assert.equal(mismatch.blocked, true);
  assert.ok(mismatch.errors.some((code) => code.startsWith("P02B_SOURCE_KP_MISMATCH:")));
});

test("P02B resolves all nineteen existing public sources without changing public selection", () => {
  const consumer = materializeP02BGlobalAuthorityLookupConsumer();
  const publicSourceIds = [...new Set(listVisibleBatchAKnowledgePoints().map((row) => row.sourceId))].sort();
  assert.equal(publicSourceIds.length, 19);
  for (const sourceNodeId of publicSourceIds) {
    const result = consumer.resolve({ sourceNodeId });
    assert.equal(result.ok, true, sourceNodeId);
    assert.equal(result.blocked, false, sourceNodeId);
  }
  assert.equal(consumer.policy.rules.publicUiChangeAllowed, false);
  assert.equal(consumer.manifest.mainlineBoundary.existing19SourceProductPreserved, true);
});

test("P02B promotes only cap_kp_authority_lookup through a successor authority", () => {
  const consumer = materializeP02BGlobalAuthorityLookupConsumer();
  const promotion = getP02BW2CapabilityPromotion("cap_kp_authority_lookup");
  assert.ok(promotion);
  assert.equal(promotion.previousDeliveryStatus, "shadow_available");
  assert.equal(promotion.effectiveDeliveryStatus, "production_admitted");
  assert.equal(promotion.scope.sourceNodeCount, 79);
  assert.equal(promotion.scope.knowledgePointCount, 482);
  assert.equal(consumer.promotionRegistry.promotions.length, 1);
  assert.deepEqual(
    [...consumer.promotionRegistry.remainingShadowFoundationCapabilityIds].sort(),
    [...REMAINING_SHADOW_FOUNDATIONS].sort(),
  );
  for (const capabilityId of REMAINING_SHADOW_FOUNDATIONS) {
    assert.equal(getP02BW2CapabilityPromotion(capabilityId), null);
  }
});

test("P02B validator passes the exact production consumer admission", () => {
  const report = validateP02BGlobalAuthorityLookupConsumer();
  assert.equal(report.ok, true, JSON.stringify(report.errors, null, 2));
  assert.equal(report.summary.globalSourceNodeCount, 79);
  assert.equal(report.summary.canonicalKnowledgePointCount, 482);
  assert.equal(report.summary.currentPublicSourceNodeCount, 19);
  assert.equal(report.summary.promotedCapabilityCount, 1);
  assert.equal(report.summary.remainingShadowFoundationCount, 4);
  console.log(`P02B_GLOBAL_AUTHORITY_LOOKUP_READBACK=${JSON.stringify(report.summary)}`);
});

test("P02B validator fails closed if the global source scope is truncated", () => {
  const consumer = materializeP02BGlobalAuthorityLookupConsumer();
  const tampered = {
    ...consumer,
    sourceDescriptors: consumer.sourceDescriptors.slice(1),
    metrics: { ...consumer.metrics, globalSourceNodeCount: 78 },
  };
  const report = validateP02BGlobalAuthorityLookupConsumer(tampered);
  assert.equal(report.ok, false);
  assert.ok(report.errors.some((row) => row.code === "P02B_SOURCE_COUNT_INVALID"));
});

test("P02B validator fails closed on premature or expanded capability promotion", () => {
  const consumer = materializeP02BGlobalAuthorityLookupConsumer();
  const tampered = {
    ...consumer,
    promotionRegistry: {
      ...consumer.promotionRegistry,
      promotions: [
        ...consumer.promotionRegistry.promotions,
        {
          capabilityId: "cap_prerequisite_readiness",
          previousDeliveryStatus: "shadow_available",
          effectiveDeliveryStatus: "production_admitted",
          scope: { sourceNodeCount: 79, knowledgePointCount: 482 },
        },
      ],
      remainingShadowFoundationCapabilityIds: REMAINING_SHADOW_FOUNDATIONS.slice(1),
    },
  };
  const report = validateP02BGlobalAuthorityLookupConsumer(tampered);
  assert.equal(report.ok, false);
  assert.ok(report.errors.some((row) => row.code === "P02B_PROMOTED_CAPABILITY_COUNT_INVALID"));
});

test("P02B keeps all downstream product work behind separate gates", () => {
  const consumer = materializeP02BGlobalAuthorityLookupConsumer();
  assert.equal(consumer.policy.rules.patternSpecImplementationAllowed, false);
  assert.equal(consumer.policy.rules.generatorImplementationAllowed, false);
  assert.equal(consumer.policy.rules.worksheetImplementationAllowed, false);
  assert.equal(consumer.policy.rules.rendererImplementationAllowed, false);
  assert.equal(consumer.policy.rules.p03ToP08ImplementationAllowed, false);
  assert.equal(consumer.policy.nextTask.taskId, "P02C_W2QuantityDimensionUnitIdentityContractAndConsumerAdmission");
  assert.equal(consumer.policy.nextTask.separateApprovalRequired, true);
});
