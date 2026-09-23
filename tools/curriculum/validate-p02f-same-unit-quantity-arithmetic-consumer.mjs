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
const EXPECTED_KNOWLEDGE_POINT_IDS = [
  "kp_fraction_times_integer_quantity",
  "kp_mass_times_integer",
];

function readJson(repoPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, repoPath), "utf8"));
}

function push(errors, condition, code) {
  if (!condition) errors.push(code);
}

function descriptorUnitRequest(descriptor, sourceNodeId, value) {
  if (descriptor.sourceDeclaredUnitRequired) {
    return {
      sourceNodeId,
      quantity: { value, unitId: "metre" },
      sourceDeclaredUnitId: "metre",
    };
  }
  return {
    sourceNodeId,
    quantity: { value, unitId: descriptor.executableCanonicalUnitIds[0] },
  };
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
  push(errors, JSON.stringify(runtime.descriptors.map((row) => row.knowledgePointId)) === JSON.stringify(EXPECTED_KNOWLEDGE_POINT_IDS), `P02F_KP_IDENTITY_DRIFT:${runtime.descriptors.map((row) => row.knowledgePointId).join(",")}`);
  push(errors, runtime.metrics.dependentSourceNodeCount === 3, `P02F_SOURCE_COUNT_DRIFT:${runtime.metrics.dependentSourceNodeCount}`);
  push(errors, runtime.metrics.sourceKnowledgePointBindingCount === 3, `P02F_SOURCE_BINDING_COUNT_DRIFT:${runtime.metrics.sourceKnowledgePointBindingCount}`);
  push(errors, runtime.metrics.semanticRoleBindingCount === 2, `P02F_SEMANTIC_BINDING_COUNT_DRIFT:${runtime.metrics.semanticRoleBindingCount}`);
  push(errors, runtime.metrics.fixedCanonicalUnitBindingCount === 4, `P02F_FIXED_UNIT_COUNT_DRIFT:${runtime.metrics.fixedCanonicalUnitBindingCount}`);
  push(errors, runtime.metrics.sourceDeclaredUnitDescriptorCount === 1, `P02F_SOURCE_DECLARED_COUNT_DRIFT:${runtime.metrics.sourceDeclaredUnitDescriptorCount}`);
  push(errors, runtime.metrics.exactRationalDescriptorCount === 1, `P02F_RATIONAL_DESCRIPTOR_COUNT_DRIFT:${runtime.metrics.exactRationalDescriptorCount}`);

  for (const descriptor of runtime.descriptors) {
    const authority = p02b.getKnowledgePoint(descriptor.knowledgePointId);
    const identity = p02c.getIdentity(descriptor.knowledgePointId);
    const semanticBinding = p02e.getBinding(descriptor.knowledgePointId);
    push(errors, Boolean(authority), `P02F_AUTHORITY_MISSING:${descriptor.knowledgePointId}`);
    push(errors, Boolean(identity), `P02F_IDENTITY_MISSING:${descriptor.knowledgePointId}`);
    push(errors, Boolean(semanticBinding), `P02F_SEMANTIC_BINDING_MISSING:${descriptor.knowledgePointId}`);
    push(errors, descriptor.operationFamilyId === "QUANTITY_TIMES_INTEGER", `P02F_DESCRIPTOR_OPERATION_DRIFT:${descriptor.knowledgePointId}`);
    push(errors, descriptor.quantityIdentityId === identity?.identityId, `P02F_DESCRIPTOR_IDENTITY_DRIFT:${descriptor.knowledgePointId}`);
    push(errors, descriptor.semanticRoleBindingId === semanticBinding?.bindingId, `P02F_SEMANTIC_BINDING_DRIFT:${descriptor.knowledgePointId}`);
    push(errors, descriptor.primaryRuntimeProfileId === "profile_quantity_measurement", `P02F_DESCRIPTOR_PROFILE_DRIFT:${descriptor.knowledgePointId}`);
    push(errors, descriptor.canonicalUnitIds.length > 0, `P02F_DESCRIPTOR_UNIT_AUTHORITY_EMPTY:${descriptor.knowledgePointId}`);
    push(errors, descriptor.unitConversionAllowed === false, `P02F_CONVERSION_ENABLED:${descriptor.knowledgePointId}`);
    push(errors, descriptor.mixedUnitNormalizationAllowed === false, `P02F_MIXED_UNIT_ENABLED:${descriptor.knowledgePointId}`);
    push(errors, descriptor.storyTemplateGenerationAllowed === false, `P02F_STORY_ENABLED:${descriptor.knowledgePointId}`);
    push(errors, descriptor.questionGenerationAllowed === false, `P02F_QUESTION_GENERATION_ENABLED:${descriptor.knowledgePointId}`);

    const isFraction = descriptor.knowledgePointId === "kp_fraction_times_integer_quantity";
    push(errors, descriptor.numericDomainId === (isFraction ? "NON_NEGATIVE_RATIONAL" : "NON_NEGATIVE_SAFE_INTEGER"), `P02F_NUMERIC_DOMAIN_DRIFT:${descriptor.knowledgePointId}:${descriptor.numericDomainId}`);
    push(errors, descriptor.sourceDeclaredUnitRequired === isFraction, `P02F_UNIT_MODE_DRIFT:${descriptor.knowledgePointId}`);

    for (const sourceNodeId of descriptor.sourceNodeIds) {
      const value = isFraction ? { wholeNumber: 1, numerator: 1, denominator: 2 } : 7;
      const request = descriptorUnitRequest(descriptor, sourceNodeId, value);
      const pair = runtime.execute({
        knowledgePointId: descriptor.knowledgePointId,
        ...request,
        integerMultiplier: isFraction ? 3 : 4,
        assertedOperationFamilyId: "QUANTITY_TIMES_INTEGER",
        assertedResultUnitId: request.quantity.unitId,
      });
      push(errors, pair.ok, `P02F_SOURCE_EXECUTION_FAILED:${sourceNodeId}:${descriptor.knowledgePointId}:${pair.errors.join("|")}`);
      if (isFraction) {
        push(errors, pair.resultQuantity?.valueModel === "REDUCED_RATIONAL", `P02F_RATIONAL_RESULT_MODEL_INVALID:${sourceNodeId}`);
        push(errors, pair.resultQuantity?.value?.numerator === 9 && pair.resultQuantity?.value?.denominator === 2, `P02F_RATIONAL_RESULT_INVALID:${sourceNodeId}`);
        push(errors, pair.resultQuantity?.value?.wholeNumber === 4 && pair.resultQuantity?.value?.remainderNumerator === 1, `P02F_MIXED_RESULT_INVALID:${sourceNodeId}`);
      } else {
        push(errors, pair.resultQuantity?.valueModel === "SAFE_INTEGER", `P02F_INTEGER_RESULT_MODEL_INVALID:${sourceNodeId}`);
        push(errors, pair.resultQuantity?.value === 28, `P02F_INTEGER_RESULT_INVALID:${sourceNodeId}`);
      }
      push(errors, pair.resultQuantity?.unitId === request.quantity.unitId, `P02F_RESULT_UNIT_NOT_PRESERVED:${sourceNodeId}:${descriptor.knowledgePointId}`);
    }

    if (!descriptor.sourceDeclaredUnitRequired) {
      for (const unitId of descriptor.executableCanonicalUnitIds) {
        const result = runtime.execute({
          knowledgePointId: descriptor.knowledgePointId,
          quantity: { value: 3, unitId },
          integerMultiplier: 5,
        });
        push(errors, result.ok, `P02F_CANONICAL_UNIT_EXECUTION_FAILED:${descriptor.knowledgePointId}:${unitId}:${result.errors.join("|")}`);
        push(errors, result.resultQuantity?.value === 15, `P02F_CANONICAL_UNIT_RESULT_INVALID:${descriptor.knowledgePointId}:${unitId}`);
        push(errors, result.resultQuantity?.unitId === unitId, `P02F_CANONICAL_UNIT_CHANGED:${descriptor.knowledgePointId}:${unitId}`);
      }
    }
  }

  const fractionDescriptor = runtime.getDescriptor("kp_fraction_times_integer_quantity");
  const massDescriptor = runtime.getDescriptor("kp_mass_times_integer");
  if (fractionDescriptor) {
    const sourceNodeId = fractionDescriptor.sourceNodeIds[0];
    push(errors, runtime.execute({ knowledgePointId: fractionDescriptor.knowledgePointId, quantity: { value: { numerator: 1, denominator: 2 }, unitId: "metre" }, integerMultiplier: 2 }).errors[0]?.startsWith("P02F_SOURCE_DECLARED_UNIT_SOURCE_REQUIRED"), "P02F_SOURCE_DECLARED_SOURCE_NOT_REQUIRED");
    push(errors, runtime.execute({ knowledgePointId: fractionDescriptor.knowledgePointId, sourceNodeId, quantity: { value: { numerator: 1, denominator: 2 }, unitId: "metre" }, integerMultiplier: 2 }).errors[0]?.startsWith("P02F_SOURCE_DECLARED_UNIT_REQUIRED"), "P02F_SOURCE_DECLARED_UNIT_NOT_REQUIRED");
    push(errors, runtime.execute({ knowledgePointId: fractionDescriptor.knowledgePointId, sourceNodeId, quantity: { value: { numerator: 1, denominator: 2 }, unitId: "source_declared_unit" }, sourceDeclaredUnitId: "source_declared_unit", integerMultiplier: 2 }).errors[0]?.startsWith("P02F_SOURCE_DECLARED_UNIT_PLACEHOLDER_FORBIDDEN"), "P02F_SOURCE_DECLARED_PLACEHOLDER_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: fractionDescriptor.knowledgePointId, sourceNodeId, quantity: { value: { numerator: 1, denominator: 2 }, unitId: "metre" }, sourceDeclaredUnitId: "litre", integerMultiplier: 2 }).errors[0]?.startsWith("P02F_SOURCE_DECLARED_UNIT_MISMATCH"), "P02F_SOURCE_DECLARED_MISMATCH_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: fractionDescriptor.knowledgePointId, sourceNodeId, quantity: { value: { numerator: 1, denominator: 0 }, unitId: "metre" }, sourceDeclaredUnitId: "metre", integerMultiplier: 2 }).errors[0]?.startsWith("P02F_RATIONAL_VALUE_INVALID"), "P02F_ZERO_DENOMINATOR_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: fractionDescriptor.knowledgePointId, sourceNodeId, quantity: { value: { wholeNumber: 1, numerator: 3, denominator: 2 }, unitId: "metre" }, sourceDeclaredUnitId: "metre", integerMultiplier: 2 }).errors[0]?.startsWith("P02F_RATIONAL_VALUE_INVALID"), "P02F_INVALID_MIXED_NUMBER_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: fractionDescriptor.knowledgePointId, sourceNodeId, quantity: { value: { numerator: Number.MAX_SAFE_INTEGER, denominator: 1 }, unitId: "metre" }, sourceDeclaredUnitId: "metre", integerMultiplier: 2 }).errors[0]?.startsWith("P02F_RESULT_OVERFLOW"), "P02F_RATIONAL_OVERFLOW_NOT_BLOCKED");
  }

  if (massDescriptor) {
    const unitId = massDescriptor.executableCanonicalUnitIds[0];
    const wrongSource = p02b.sourceDescriptors.find((row) => !massDescriptor.sourceNodeIds.includes(row.sourceNodeId));
    push(errors, runtime.execute({}).errors[0] === "P02F_ARITHMETIC_KP_ID_REQUIRED", "P02F_MISSING_KP_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: "kp_unknown_p02f" }).errors[0]?.startsWith("P02F_UNKNOWN_KNOWLEDGE_POINT"), "P02F_UNKNOWN_KP_NOT_BLOCKED");
    const nonDependent = p02b.knowledgePointDescriptors.find((row) => !runtime.descriptors.some((descriptor) => descriptor.knowledgePointId === row.knowledgePointId));
    push(errors, runtime.execute({ knowledgePointId: nonDependent?.knowledgePointId }).errors[0]?.startsWith("P02F_KP_NOT_SAME_UNIT_ARITHMETIC_DEPENDENT"), "P02F_NON_DEPENDENT_KP_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: massDescriptor.knowledgePointId, integerMultiplier: 2 }).errors[0] === "P02F_QUANTITY_INPUT_REQUIRED", "P02F_MISSING_QUANTITY_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: massDescriptor.knowledgePointId, quantity: { value: 2 }, integerMultiplier: 2 }).errors[0] === "P02F_UNIT_ID_REQUIRED", "P02F_MISSING_UNIT_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: massDescriptor.knowledgePointId, quantity: { value: -1, unitId }, integerMultiplier: 2 }).errors[0]?.startsWith("P02F_QUANTITY_VALUE_INVALID"), "P02F_NEGATIVE_QUANTITY_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: massDescriptor.knowledgePointId, quantity: { value: 1.5, unitId }, integerMultiplier: 2 }).errors[0]?.startsWith("P02F_QUANTITY_VALUE_INVALID"), "P02F_FRACTIONAL_INTEGER_DOMAIN_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: massDescriptor.knowledgePointId, quantity: { value: 2, unitId }, integerMultiplier: -1 }).errors[0]?.startsWith("P02F_INTEGER_MULTIPLIER_INVALID"), "P02F_NEGATIVE_MULTIPLIER_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: massDescriptor.knowledgePointId, quantity: { value: 2, unitId }, integerMultiplier: 1.5 }).errors[0]?.startsWith("P02F_INTEGER_MULTIPLIER_INVALID"), "P02F_FRACTIONAL_MULTIPLIER_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: massDescriptor.knowledgePointId, quantity: { value: 2, unitId: "unit_not_allowed_p02f" }, integerMultiplier: 2 }).errors[0]?.startsWith("P02F_UNIT_ID_INVALID"), "P02F_INVALID_UNIT_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: massDescriptor.knowledgePointId, quantity: { value: 2, unitId }, integerMultiplier: 2, assertedOperationFamilyId: "WRONG_OPERATION" }).errors[0]?.startsWith("P02F_OPERATION_FAMILY_MISMATCH"), "P02F_WRONG_OPERATION_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: massDescriptor.knowledgePointId, quantity: { value: 2, unitId }, integerMultiplier: 2, assertedResultUnitId: "different_unit" }).errors[0]?.startsWith("P02F_RESULT_UNIT_MISMATCH"), "P02F_RESULT_UNIT_CHANGE_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: massDescriptor.knowledgePointId, quantity: { value: Number.MAX_SAFE_INTEGER, unitId }, integerMultiplier: 2 }).errors[0]?.startsWith("P02F_RESULT_OVERFLOW"), "P02F_INTEGER_OVERFLOW_NOT_BLOCKED");
    if (wrongSource) {
      push(errors, runtime.execute({ knowledgePointId: massDescriptor.knowledgePointId, sourceNodeId: wrongSource.sourceNodeId, quantity: { value: 2, unitId }, integerMultiplier: 2 }).errors[0]?.startsWith("P02F_SOURCE_KP_MISMATCH"), "P02F_SOURCE_MISMATCH_NOT_BLOCKED");
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
      fixedCanonicalUnitBindings: runtime.metrics.fixedCanonicalUnitBindingCount,
      sourceDeclaredUnitDescriptors: runtime.metrics.sourceDeclaredUnitDescriptorCount,
      exactRationalDescriptors: runtime.metrics.exactRationalDescriptorCount,
      semanticRoleBindings: runtime.metrics.semanticRoleBindingCount,
      effectivePromotions: runtime.metrics.effectivePromotionCount,
      remainingShadowFoundations: runtime.metrics.remainingShadowFoundationCount,
      knowledgePointIds: Object.freeze(runtime.descriptors.map((row) => row.knowledgePointId)),
      dimensionCounts: runtime.metrics.dimensionCounts,
      unitFamilyCounts: runtime.metrics.unitFamilyCounts,
      numericDomainCounts: runtime.metrics.numericDomainCounts,
    }),
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = validateP02FSameUnitQuantityArithmeticConsumer();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.ok) process.exitCode = 1;
}
