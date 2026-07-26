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
const EXPLICIT_SOURCE_UNIT_ID = "explicit_fractional_quantity_unit";

function readJson(repoPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, repoPath), "utf8"));
}

function push(errors, condition, code) {
  if (!condition) errors.push(code);
}

function validRequestFor(descriptor, sourceNodeId, quantityValue = 7, integerMultiplier = 4) {
  if (descriptor.sourceDeclaredUnitRequired) {
    return {
      knowledgePointId: descriptor.knowledgePointId,
      sourceNodeId,
      quantity: { value: quantityValue, unitId: EXPLICIT_SOURCE_UNIT_ID },
      sourceDeclaredUnitId: EXPLICIT_SOURCE_UNIT_ID,
      integerMultiplier,
      assertedOperationFamilyId: "QUANTITY_TIMES_INTEGER",
      assertedResultUnitId: EXPLICIT_SOURCE_UNIT_ID,
    };
  }
  const unitId = descriptor.executableCanonicalUnitIds[0];
  return {
    knowledgePointId: descriptor.knowledgePointId,
    sourceNodeId,
    quantity: { value: quantityValue, unitId },
    integerMultiplier,
    assertedOperationFamilyId: "QUANTITY_TIMES_INTEGER",
    assertedResultUnitId: unitId,
  };
}

export function validateP02FSameUnitQuantityArithmeticConsumer() {
  const errors = [];
  const runtime = materializeP02FSameUnitQuantityArithmeticConsumer();
  const p02b = materializeP02BGlobalAuthorityLookupConsumer();
  const p02c = materializeP02CQuantityDimensionUnitIdentityConsumer();
  const p02e = materializeP02EQuantitySemanticRoleBindingConsumer();
  const r04 = readJson("data/curriculum/global/runtime/r04/shared-runtime-capabilities.json");
  const claim = readJson("data/project/milestones/FPL-P02F.claim.json");
  const historicalCapability = r04.capabilities.find((row) => row.capabilityId === TARGET_CAPABILITY_ID);

  push(errors, runtime.taskId === "P02F_W2SameUnitQuantityArithmeticConsumerAdmission", "P02F_TASK_ID_DRIFT");
  push(errors, runtime.consumerMode === "PRODUCTION_DETERMINISTIC_SAME_UNIT_QUANTITY_ARITHMETIC", "P02F_CONSUMER_MODE_DRIFT");
  push(errors, runtime.productionAdmissionState === "PRODUCTION_ADMITTED", "P02F_PRODUCTION_ADMISSION_MISSING");
  push(errors, runtime.operationFamilyId === "QUANTITY_TIMES_INTEGER", "P02F_OPERATION_FAMILY_DRIFT");
  push(errors, runtime.metrics.effectiveDependentKnowledgePointCount === 2, `P02F_DEPENDENT_KP_COUNT_DRIFT:${runtime.metrics.effectiveDependentKnowledgePointCount}`);
  push(errors, runtime.metrics.operationDescriptorCount === 2, `P02F_DESCRIPTOR_COUNT_DRIFT:${runtime.metrics.operationDescriptorCount}`);
  push(errors, runtime.metrics.descriptorErrorCount === 0, `P02F_DESCRIPTOR_ERRORS:${runtime.descriptorErrors.join("|")}`);
  push(errors, JSON.stringify(runtime.descriptors.map((row) => row.knowledgePointId)) === JSON.stringify(EXPECTED_KNOWLEDGE_POINT_IDS), `P02F_KP_IDENTITY_DRIFT:${runtime.descriptors.map((row) => row.knowledgePointId).join(",")}`);
  push(errors, runtime.metrics.dependentSourceNodeCount === 3, `P02F_SOURCE_COUNT_DRIFT:${runtime.metrics.dependentSourceNodeCount}`);
  push(errors, runtime.metrics.sourceKnowledgePointBindingCount === 3, `P02F_SOURCE_BINDING_COUNT_DRIFT:${runtime.metrics.sourceKnowledgePointBindingCount}`);
  push(errors, runtime.metrics.semanticRoleBindingCount === 2, `P02F_SEMANTIC_BINDING_COUNT_DRIFT:${runtime.metrics.semanticRoleBindingCount}`);
  push(errors, runtime.metrics.fixedCanonicalUnitBindingCount === 4, `P02F_FIXED_UNIT_COUNT_DRIFT:${runtime.metrics.fixedCanonicalUnitBindingCount}`);
  push(errors, runtime.metrics.sourceDeclaredUnitDescriptorCount === 1, `P02F_SOURCE_DECLARED_COUNT_DRIFT:${runtime.metrics.sourceDeclaredUnitDescriptorCount}`);
  push(errors, runtime.metrics.safeIntegerDescriptorCount === 2, `P02F_SAFE_INTEGER_DESCRIPTOR_COUNT_DRIFT:${runtime.metrics.safeIntegerDescriptorCount}`);

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
    push(errors, descriptor.nonNegativeSafeIntegerOnly === true, `P02F_INTEGER_BOUNDARY_MISSING:${descriptor.knowledgePointId}`);
    push(errors, descriptor.rationalObjectInputAllowed === false, `P02F_RATIONAL_INPUT_ENABLED:${descriptor.knowledgePointId}`);
    push(errors, descriptor.fractionMagnitudeParsingAllowed === false, `P02F_FRACTION_PARSING_ENABLED:${descriptor.knowledgePointId}`);
    push(errors, descriptor.unitConversionAllowed === false, `P02F_CONVERSION_ENABLED:${descriptor.knowledgePointId}`);
    push(errors, descriptor.mixedUnitNormalizationAllowed === false, `P02F_MIXED_UNIT_ENABLED:${descriptor.knowledgePointId}`);
    push(errors, descriptor.storyTemplateGenerationAllowed === false, `P02F_STORY_ENABLED:${descriptor.knowledgePointId}`);
    push(errors, descriptor.questionGenerationAllowed === false, `P02F_QUESTION_GENERATION_ENABLED:${descriptor.knowledgePointId}`);

    for (const sourceNodeId of descriptor.sourceNodeIds) {
      const request = validRequestFor(descriptor, sourceNodeId);
      const result = runtime.execute(request);
      push(errors, result.ok, `P02F_SOURCE_EXECUTION_FAILED:${sourceNodeId}:${descriptor.knowledgePointId}:${result.errors.join("|")}`);
      push(errors, result.resultQuantity?.value === 28, `P02F_RESULT_INVALID:${sourceNodeId}:${descriptor.knowledgePointId}`);
      push(errors, result.resultQuantity?.unitId === request.quantity.unitId, `P02F_RESULT_UNIT_NOT_PRESERVED:${sourceNodeId}:${descriptor.knowledgePointId}`);
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
    push(errors, runtime.execute({ knowledgePointId: fractionDescriptor.knowledgePointId, quantity: { value: 2, unitId: EXPLICIT_SOURCE_UNIT_ID }, integerMultiplier: 2 }).errors[0]?.startsWith("P02F_SOURCE_DECLARED_UNIT_SOURCE_REQUIRED"), "P02F_SOURCE_DECLARED_SOURCE_NOT_REQUIRED");
    push(errors, runtime.execute({ knowledgePointId: fractionDescriptor.knowledgePointId, sourceNodeId, quantity: { value: 2, unitId: EXPLICIT_SOURCE_UNIT_ID }, integerMultiplier: 2 }).errors[0]?.startsWith("P02F_SOURCE_DECLARED_UNIT_REQUIRED"), "P02F_SOURCE_DECLARED_UNIT_NOT_REQUIRED");
    push(errors, runtime.execute({ knowledgePointId: fractionDescriptor.knowledgePointId, sourceNodeId, quantity: { value: 2, unitId: "source_declared_unit" }, sourceDeclaredUnitId: "source_declared_unit", integerMultiplier: 2 }).errors[0]?.startsWith("P02F_SOURCE_DECLARED_UNIT_PLACEHOLDER_FORBIDDEN"), "P02F_SOURCE_DECLARED_PLACEHOLDER_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: fractionDescriptor.knowledgePointId, sourceNodeId, quantity: { value: 2, unitId: EXPLICIT_SOURCE_UNIT_ID }, sourceDeclaredUnitId: "different_source_unit", integerMultiplier: 2 }).errors[0]?.startsWith("P02F_SOURCE_DECLARED_UNIT_MISMATCH"), "P02F_SOURCE_DECLARED_MISMATCH_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: fractionDescriptor.knowledgePointId, sourceNodeId, quantity: { value: { numerator: 1, denominator: 2 }, unitId: EXPLICIT_SOURCE_UNIT_ID }, sourceDeclaredUnitId: EXPLICIT_SOURCE_UNIT_ID, integerMultiplier: 2 }).errors[0]?.startsWith("P02F_QUANTITY_VALUE_INVALID"), "P02F_RATIONAL_OBJECT_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: fractionDescriptor.knowledgePointId, sourceNodeId, quantity: { value: 1.5, unitId: EXPLICIT_SOURCE_UNIT_ID }, sourceDeclaredUnitId: EXPLICIT_SOURCE_UNIT_ID, integerMultiplier: 2 }).errors[0]?.startsWith("P02F_QUANTITY_VALUE_INVALID"), "P02F_FRACTIONAL_COEFFICIENT_NOT_BLOCKED");
  }

  if (massDescriptor) {
    const unitId = massDescriptor.executableCanonicalUnitIds[0];
    const wrongSource = p02b.sourceDescriptors.find((row) => !massDescriptor.sourceNodeIds.includes(row.sourceNodeId));
    const nonDependent = p02b.knowledgePointDescriptors.find((row) => !runtime.descriptors.some((descriptor) => descriptor.knowledgePointId === row.knowledgePointId));
    push(errors, runtime.execute({}).errors[0] === "P02F_ARITHMETIC_KP_ID_REQUIRED", "P02F_MISSING_KP_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: "kp_unknown_p02f" }).errors[0]?.startsWith("P02F_UNKNOWN_KNOWLEDGE_POINT"), "P02F_UNKNOWN_KP_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: nonDependent?.knowledgePointId }).errors[0]?.startsWith("P02F_KP_NOT_SAME_UNIT_ARITHMETIC_DEPENDENT"), "P02F_NON_DEPENDENT_KP_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: massDescriptor.knowledgePointId, integerMultiplier: 2 }).errors[0] === "P02F_QUANTITY_INPUT_REQUIRED", "P02F_MISSING_QUANTITY_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: massDescriptor.knowledgePointId, quantity: { value: 2 }, integerMultiplier: 2 }).errors[0] === "P02F_UNIT_ID_REQUIRED", "P02F_MISSING_UNIT_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: massDescriptor.knowledgePointId, quantity: { value: -1, unitId }, integerMultiplier: 2 }).errors[0]?.startsWith("P02F_QUANTITY_VALUE_INVALID"), "P02F_NEGATIVE_QUANTITY_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: massDescriptor.knowledgePointId, quantity: { value: 1.5, unitId }, integerMultiplier: 2 }).errors[0]?.startsWith("P02F_QUANTITY_VALUE_INVALID"), "P02F_DECIMAL_QUANTITY_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: massDescriptor.knowledgePointId, quantity: { value: 2, unitId }, integerMultiplier: -1 }).errors[0]?.startsWith("P02F_INTEGER_MULTIPLIER_INVALID"), "P02F_NEGATIVE_MULTIPLIER_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: massDescriptor.knowledgePointId, quantity: { value: 2, unitId }, integerMultiplier: 1.5 }).errors[0]?.startsWith("P02F_INTEGER_MULTIPLIER_INVALID"), "P02F_FRACTIONAL_MULTIPLIER_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: massDescriptor.knowledgePointId, quantity: { value: 2, unitId: "unit_not_allowed_p02f" }, integerMultiplier: 2 }).errors[0]?.startsWith("P02F_UNIT_ID_INVALID"), "P02F_INVALID_UNIT_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: massDescriptor.knowledgePointId, quantity: { value: 2, unitId }, integerMultiplier: 2, assertedOperationFamilyId: "WRONG_OPERATION" }).errors[0]?.startsWith("P02F_OPERATION_FAMILY_MISMATCH"), "P02F_WRONG_OPERATION_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: massDescriptor.knowledgePointId, quantity: { value: 2, unitId }, integerMultiplier: 2, assertedResultUnitId: "different_unit" }).errors[0]?.startsWith("P02F_RESULT_UNIT_MISMATCH"), "P02F_RESULT_UNIT_CHANGE_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: massDescriptor.knowledgePointId, quantity: { value: Number.MAX_SAFE_INTEGER, unitId }, integerMultiplier: 2 }).errors[0]?.startsWith("P02F_RESULT_OVERFLOW"), "P02F_OVERFLOW_NOT_BLOCKED");
    push(errors, runtime.execute({ knowledgePointId: massDescriptor.knowledgePointId, sourceNodeId: wrongSource?.sourceNodeId, quantity: { value: 2, unitId }, integerMultiplier: 2 }).errors[0]?.startsWith("P02F_SOURCE_KP_MISMATCH"), "P02F_WRONG_SOURCE_NOT_BLOCKED");
  }

  push(errors, historicalCapability?.status === "shadow_available", `P02F_R04_HISTORICAL_STATUS_DRIFT:${historicalCapability?.status}`);
  push(errors, runtime.promotionRegistry.promotions.length === 1, `P02F_PROMOTION_CARDINALITY_INVALID:${runtime.promotionRegistry.promotions.length}`);
  push(errors, runtime.promotionRegistry.promotions[0]?.capabilityId === TARGET_CAPABILITY_ID, `P02F_PROMOTION_IDENTITY_INVALID:${runtime.promotionRegistry.promotions[0]?.capabilityId}`);
  push(errors, runtime.metrics.effectivePromotionCount === 5, `P02F_EFFECTIVE_PROMOTION_COUNT_DRIFT:${runtime.metrics.effectivePromotionCount}`);
  push(errors, runtime.metrics.remainingShadowFoundationCount === 0, `P02F_REMAINING_SHADOW_COUNT_DRIFT:${runtime.metrics.remainingShadowFoundationCount}`);
  push(errors, claim.actualEvidenceLevel === "E5_PRODUCTION_ADMITTED", `P02F_CLAIM_EVIDENCE_INVALID:${claim.actualEvidenceLevel}`);
  push(errors, claim.claims.productionAdmitted === true, "P02F_CLAIM_PRODUCTION_ADMISSION_MISSING");
  push(errors, claim.claims.visibleOutputChanged === false, "P02F_VISIBLE_OUTPUT_CLAIM_INVALID");
  push(errors, runtime.manifest.mainlineBoundary.unitConversionImplemented === false, "P02F_MANIFEST_CONVERSION_SCOPE_DRIFT");
  push(errors, runtime.manifest.mainlineBoundary.mixedUnitNormalizationImplemented === false, "P02F_MANIFEST_MIXED_UNIT_SCOPE_DRIFT");
  push(errors, runtime.manifest.mainlineBoundary.publicUiChanged === false, "P02F_MANIFEST_UI_SCOPE_DRIFT");
  push(errors, runtime.manifest.mainlineBoundary.patternSpecImplementationStarted === false, "P02F_MANIFEST_PATTERNSPEC_SCOPE_DRIFT");
  push(errors, runtime.manifest.mainlineBoundary.p03ToP08WorkStarted === false, "P02F_MANIFEST_DOWNSTREAM_SCOPE_DRIFT");

  const counts = Object.freeze({
    effectiveDependentKnowledgePoints: runtime.metrics.effectiveDependentKnowledgePointCount,
    operationDescriptors: runtime.metrics.operationDescriptorCount,
    dependentSources: runtime.metrics.dependentSourceNodeCount,
    sourceKnowledgePointBindings: runtime.metrics.sourceKnowledgePointBindingCount,
    semanticRoleBindings: runtime.metrics.semanticRoleBindingCount,
    fixedCanonicalUnitBindings: runtime.metrics.fixedCanonicalUnitBindingCount,
    sourceDeclaredUnitDescriptors: runtime.metrics.sourceDeclaredUnitDescriptorCount,
    safeIntegerDescriptors: runtime.metrics.safeIntegerDescriptorCount,
    effectivePromotions: runtime.metrics.effectivePromotionCount,
    remainingShadowFoundations: runtime.metrics.remainingShadowFoundationCount,
  });

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts,
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = validateP02FSameUnitQuantityArithmeticConsumer();
  process.stdout.write(`P02F_READBACK ${JSON.stringify(result.counts)}\n`);
  if (!result.ok) {
    process.stderr.write(`${result.errors.join("\n")}\n`);
    process.exitCode = 1;
  }
}
