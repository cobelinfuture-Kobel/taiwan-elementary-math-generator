import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP02BGlobalAuthorityLookupConsumer } from "../../src/curriculum/full-product/p02b-global-authority-lookup-consumer.mjs";
import { materializeP02CQuantityDimensionUnitIdentityConsumer } from "../../src/curriculum/full-product/p02c-quantity-dimension-unit-identity-consumer.mjs";
import { materializeP02EQuantitySemanticRoleBindingConsumer } from "../../src/curriculum/full-product/p02e-quantity-semantic-role-binding-consumer.mjs";
import { materializeP02FSameUnitQuantityArithmeticConsumer } from "../../src/curriculum/full-product/p02f-same-unit-quantity-arithmetic-consumer.mjs";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../..");
const TARGET_CAPABILITY_ID = "cap_same_unit_quantity_arithmetic";

function readJson(repoPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, repoPath), "utf8"));
}

function push(errors, condition, code) {
  if (!condition) errors.push(code);
}

export function validateP02FSameUnitQuantityArithmeticConsumer() {
  const errors = [];
  const runtime = materializeP02FSameUnitQuantityArithmeticConsumer();
  const p02b = materializeP02BGlobalAuthorityLookupConsumer();
  const p02c = materializeP02CQuantityDimensionUnitIdentityConsumer();
  const p02e = materializeP02EQuantitySemanticRoleBindingConsumer();
  const r04 = readJson("data/curriculum/global/runtime/r04/shared-runtime-capabilities.json");
  const historicalCapability = r04.capabilities.find((row) => row.capabilityId === TARGET_CAPABILITY_ID);

  push(errors, runtime.taskId === "P02F_W2SameUnitQuantityArithmeticConsumerAdmission", "P02F_TASK_ID_DRIFT");
  push(errors, runtime.consumerMode === "PRODUCTION_DETERMINISTIC_SAME_UNIT_QUANTITY_ARITHMETIC", "P02F_CONSUMER_MODE_DRIFT");
  push(errors, runtime.productionAdmissionState === "PRODUCTION_ADMITTED", "P02F_PRODUCTION_ADMISSION_MISSING");
  push(errors, runtime.operationFamilyId === "QUANTITY_TIMES_INTEGER", "P02F_OPERATION_FAMILY_DRIFT");
  push(errors, runtime.metrics.effectiveDependentKnowledgePointCount === 2, `P02F_DEPENDENT_KP_COUNT_DRIFT:${runtime.metrics.effectiveDependentKnowledgePointCount}`);
  push(errors, runtime.metrics.operationDescriptorCount === 2, `P02F_DESCRIPTOR_COUNT_DRIFT:${runtime.metrics.operationDescriptorCount}`);
  push(errors, runtime.metrics.descriptorErrorCount === 0, `P02F_DESCRIPTOR_ERRORS:${runtime.descriptorErrors.join("|")}`);
  push(errors, runtime.descriptors.length === 2, `P02F_DESCRIPTOR_CARDINALITY_INVALID:${runtime.descriptors.length}`);

  for (const descriptor of runtime.descriptors) {
    const authority = p02b.getKnowledgePoint(descriptor.knowledgePointId);
    const identity = p02c.getIdentity(descriptor.knowledgePointId);
    push(errors, Boolean(authority), `P02F_AUTHORITY_MISSING:${descriptor.knowledgePointId}`);
    push(errors, Boolean(identity), `P02F_IDENTITY_MISSING:${descriptor.knowledgePointId}`);
    push(errors, descriptor.operationFamilyId === "QUANTITY_TIMES_INTEGER", `P02F_DESCRIPTOR_OPERATION_DRIFT:${descriptor.knowledgePointId}`);
    push(errors, descriptor.quantityIdentityId === identity?.identityId, `P02F_DESCRIPTOR_IDENTITY_DRIFT:${descriptor.knowledgePointId}`);
    push(errors, descriptor.primaryRuntimeProfileId === "profile_quantity_measurement", `P02F_DESCRIPTOR_PROFILE_DRIFT:${descriptor.knowledgePointId}`);
    push(errors, descriptor.canonicalUnitIds.length > 0, `P02F_DESCRIPTOR_UNIT_EMPTY:${descriptor.knowledgePointId}`);
    push(errors, descriptor.unitConversionAllowed === false, `P02F_CONVERSION_ENABLED:${descriptor.knowledgePointId}`);
    push(errors, descriptor.mixedUnitNormalizationAllowed === false, `P02F_MIXED_UNIT_ENABLED:${descriptor.knowledgePointId}`);
    push(errors, descriptor.storyTemplateGenerationAllowed === false, `P02F_STORY_ENABLED:${descriptor.knowledgePointId}`);
    push(errors, descriptor.questionGenerationAllowed === false, `P02F_QUESTION_GENERATION_ENABLED:${descriptor.knowledgePointId}`);

    const semanticBinding = p02e.getBinding(descriptor.knowledgePointId);
    if (semanticBinding) {
      push(errors, descriptor.semanticRoleBindingId === semanticBinding.bindingId, `P02F_SEMANTIC_BINDING_DRIFT:${descriptor.knowledgePointId}`);
    }

    for (const sourceNodeId of descriptor.sourceNodeIds) {
      const pair = runtime.execute({
        knowledgePointId: descriptor.knowledgePointId,
        sourceNodeId,
        quantity: { value: 7, unitId: descriptor.canonicalUnitIds[0] },
        integerMultiplier: 4,
        assertedOperationFamilyId: "QUANTITY_TIMES_INTEGER",
        assertedResultUnitId: descriptor.canonicalUnitIds[0],
      });
      push(errors, pair.ok, `P02F_SOURCE_EXECUTION_FAILED:${sourceNodeId}:${descriptor.knowledgePointId}:${pair.errors.join("|")}`);
      push(errors, pair.resultQuantity?.value === 28, `P02F_RESULT_VALUE_INVALID:${sourceNodeId}:${descriptor.knowledgePointId}`);
      push(errors, pair.resultQuantity?.unitId === descriptor.canonicalUnitIds[0], `P02F_RESULT_UNIT_NOT_PRESERVED:${sourceNodeId}:${descriptor.knowledgePointId}`);
    }

    for (const unitId of descriptor.canonicalUnitIds) {
      const result = runtime.execute({
        knowledgePointId: descriptor.knowledgePointId,
        quantity: { value: 3, unitId },
        integerMultiplier: 5,
      });
      push(errors, result.ok, `P02F_CANONICAL_UNIT_EXECUTION_FAILED:${descriptor.knowledgePointId}:${unitId}:${result.errors.join("|")}`);
      push(errors, result.resultQuantity?.value === 15, `P02F_CANONICAL_UNIT_RESULT_INVALID:${descriptor.knowledgePointId}:${unitId}`);
      push(errors, result.resultQuantity?.unitId === unitId, `P02F_CANONICAL_UNIT_CHANGED:${descriptor.knowledgePointId}:${unitId}`);
    }

    const zero = runtime.execute({
      knowledgePointId: descriptor.knowledgePointId,
      quantity: { value: 9, unitId: descriptor.canonicalUnitIds[0] },
      integerMultiplier: 0,
    });
    push(errors, zero.ok && zero.resultQuantity?.value === 0, `P02F_ZERO_MULTIPLIER_INVALID:${descriptor.knowledgePointId}`);
  }

  const first = runtime.descriptors[0];
  if (first) {
    const firstUnit = first.canonicalUnitIds[0];
    const wrongSource = p02b.sourceDescriptors.find((row) => !first.sourceNodeIds.includes(row.sourceNodeId));
    push(errors, runtime.execute({}).errors[0] === "P02F_ARITHMETIC_KP_ID_REQUIRED", "P02F_MISSING_KP_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: "kp_unknown_p02f" }).errors[0]?.startsWith("P02F_UNKNOWN_KNOWLEDGE_POINT"), "P02F_UNKNOWN_KP_NOT_BLOCKED");
    const nonDependent = p02b.knowledgePointDescriptors.find((row) => !runtime.descriptors.some((descriptor) => descriptor.knowledgePointId === row.knowledgePointId));
    push(errors, runtime.execute({ knowledgePointId: nonDependent?.knowledgePointId }).errors[0]?.startsWith("P02F_KP_NOT_SAME_UNIT_ARITHMETIC_DEPENDENT"), "P02F_NON_DEPENDENT_KP_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: first.knowledgePointId, integerMultiplier: 2 }).errors[0] === "P02F_QUANTITY_INPUT_REQUIRED", "P02F_MISSING_QUANTITY_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: first.knowledgePointId, quantity: { value: 2 }, integerMultiplier: 2 }).errors[0] === "P02F_UNIT_ID_REQUIRED", "P02F_MISSING_UNIT_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: first.knowledgePointId, quantity: { value: -1, unitId: firstUnit }, integerMultiplier: 2 }).errors[0]?.startsWith("P02F_QUANTITY_VALUE_INVALID"), "P02F_NEGATIVE_QUANTITY_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: first.knowledgePointId, quantity: { value: 1.5, unitId: firstUnit }, integerMultiplier: 2 }).errors[0]?.startsWith("P02F_QUANTITY_VALUE_INVALID"), "P02F_FRACTIONAL_QUANTITY_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: first.knowledgePointId, quantity: { value: 2, unitId: firstUnit }, integerMultiplier: -1 }).errors[0]?.startsWith("P02F_INTEGER_MULTIPLIER_INVALID"), "P02F_NEGATIVE_MULTIPLIER_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: first.knowledgePointId, quantity: { value: 2, unitId: firstUnit }, integerMultiplier: 1.5 }).errors[0]?.startsWith("P02F_INTEGER_MULTIPLIER_INVALID"), "P02F_FRACTIONAL_MULTIPLIER_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: first.knowledgePointId, quantity: { value: 2, unitId: "unit_not_allowed_p02f" }, integerMultiplier: 2 }).errors[0]?.startsWith("P02F_UNIT_ID_INVALID"), "P02F_INVALID_UNIT_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: first.knowledgePointId, quantity: { value: 2, unitId: firstUnit }, integerMultiplier: 2, assertedOperationFamilyId: "WRONG_OPERATION" }).errors[0]?.startsWith("P02F_OPERATION_FAMILY_MISMATCH"), "P02F_WRONG_OPERATION_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: first.knowledgePointId, quantity: { value: 2, unitId: firstUnit }, integerMultiplier: 2, assertedResultUnitId: "different_unit" }).errors[0]?.startsWith("P02F_RESULT_UNIT_MISMATCH"), "P02F_RESULT_UNIT_CHANGE_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: first.knowledgePointId, quantity: { value: Number.MAX_SAFE_INTEGER, unitId: firstUnit }, integerMultiplier: 2 }).errors[0]?.startsWith("P02F_RESULT_OVERFLOW"), "P02F_OVERFLOW_NOT_BLOCKED");
    if (wrongSource) {
      push(errors, runtime.execute({ knowledgePointId: first.knowledgePointId, sourceNodeId: wrongSource.sourceNodeId, quantity: { value: 2, unitId: firstUnit }, integerMultiplier: 2 }).errors[0]?.startsWith("P02F_SOURCE_KP_MISMATCH"), "P02F_SOURCE_MISMATCH_NOT_BLOCKED");
    }
  }

  push(errors, historicalCapability?.status === "shadow_available", `P02F_R04_HISTORY_MUTATED:${historicalCapability?.status}`);
  push(errors, runtime.promotionRegistry.promotions.length === 1, `P02F_NEW_PROMOTION_COUNT_INVALID:${runtime.promotionRegistry.promotions.length}`);
  push(errors, runtime.promotionRegistry.promotions[0]?.capabilityId === TARGET_CAPABILITY_ID, "P02F_PROMOTION_ID_INVALID");
  push(errors, runtime.metrics.inheritedPromotionCount === 4, `P02F_INHERITED_PROMOTION_COUNT_INVALID:${runtime.metrics.inheritedPromotionCount}`);
  push(errors, runtime.metrics.effectivePromotionCount === 5, `P02F_EFFECTIVE_PROMOTION_COUNT_INVALID:${runtime.metrics.effectivePromotionCount}`);
  push(errors, runtime.metrics.remainingShadowFoundationCount === 0, `P02F_REMAINING_SHADOW_COUNT_INVALID:${runtime.metrics.remainingShadowFoundationCount}`);
  push(errors, runtime.effectivePromotionCapabilityIds.includes(TARGET_CAPABILITY_ID), "P02F_EFFECTIVE_PROMOTION_MISSING");

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({
      effectiveDependentKnowledgePoints: runtime.metrics.effectiveDependentKnowledgePointCount,
      operationDescriptors: runtime.metrics.operationDescriptorCount,
      dependentSourceNodes: runtime.metrics.dependentSourceNodeCount,
      sourceKnowledgePointBindings: runtime.metrics.sourceKnowledgePointBindingCount,
      canonicalUnitBindings: runtime.metrics.canonicalUnitBindingCount,
      semanticRoleBindings: runtime.metrics.semanticRoleBindingCount,
      effectivePromotions: runtime.metrics.effectivePromotionCount,
      remainingShadowFoundations: runtime.metrics.remainingShadowFoundationCount,
      knowledgePointIds: Object.freeze(runtime.descriptors.map((row) => row.knowledgePointId)),
      dimensionCounts: runtime.metrics.dimensionCounts,
      unitFamilyCounts: runtime.metrics.unitFamilyCounts,
    }),
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = validateP02FSameUnitQuantityArithmeticConsumer();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.ok) process.exitCode = 1;
}
