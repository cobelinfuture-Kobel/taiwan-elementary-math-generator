import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP02W2ProductAdmissionInventory } from "./p02-w2-product-admission-inventory.mjs";
import { materializeP02BGlobalAuthorityLookupConsumer } from "./p02b-global-authority-lookup-consumer.mjs";
import { materializeP02CQuantityDimensionUnitIdentityConsumer } from "./p02c-quantity-dimension-unit-identity-consumer.mjs";
import { materializeP02EQuantitySemanticRoleBindingConsumer } from "./p02e-quantity-semantic-role-binding-consumer.mjs";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../../..");
const P02F_DIR = path.join(ROOT, "data/curriculum/full-product/p02f");
const TARGET_CAPABILITY_ID = "cap_same_unit_quantity_arithmetic";
const OPERATION_FAMILY_ID = "QUANTITY_TIMES_INTEGER";
const SOURCE_DECLARED_UNIT_PLACEHOLDER = "source_declared_unit";
const MAX_SAFE_BIGINT = BigInt(Number.MAX_SAFE_INTEGER);

export const P02F_SAME_UNIT_QUANTITY_ARITHMETIC_CONSUMER_VERSION = "p02f-same-unit-quantity-arithmetic-v1";

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(P02F_DIR, fileName), "utf8"));
}

function readRepoJson(repoPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, repoPath), "utf8"));
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function unique(values) {
  return [...new Set((values ?? []).filter(Boolean))];
}

function freezeArray(values) {
  return Object.freeze([...values]);
}

function isNonNegativeSafeInteger(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

function gcdBigInt(a, b) {
  let left = a < 0n ? -a : a;
  let right = b < 0n ? -b : b;
  while (right !== 0n) {
    const remainder = left % right;
    left = right;
    right = remainder;
  }
  return left === 0n ? 1n : left;
}

function normalizeRationalInput(value) {
  if (isNonNegativeSafeInteger(value)) {
    return { ok: true, numerator: BigInt(value), denominator: 1n, inputForm: "SAFE_INTEGER" };
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, error: `P02F_RATIONAL_VALUE_INVALID:${JSON.stringify(value)}` };
  }

  const hasWholeNumber = Object.hasOwn(value, "wholeNumber");
  const numerator = value.numerator;
  const denominator = value.denominator;
  if (!isNonNegativeSafeInteger(numerator)
    || !Number.isSafeInteger(denominator)
    || denominator <= 0) {
    return { ok: false, error: `P02F_RATIONAL_VALUE_INVALID:${JSON.stringify(value)}` };
  }

  let improperNumerator;
  let inputForm;
  if (hasWholeNumber) {
    if (!isNonNegativeSafeInteger(value.wholeNumber) || numerator >= denominator) {
      return { ok: false, error: `P02F_RATIONAL_VALUE_INVALID:${JSON.stringify(value)}` };
    }
    improperNumerator = BigInt(value.wholeNumber) * BigInt(denominator) + BigInt(numerator);
    inputForm = "MIXED_NUMBER";
  } else {
    improperNumerator = BigInt(numerator);
    inputForm = "RATIONAL";
  }
  const denominatorBigInt = BigInt(denominator);
  const divisor = gcdBigInt(improperNumerator, denominatorBigInt);
  return {
    ok: true,
    numerator: improperNumerator / divisor,
    denominator: denominatorBigInt / divisor,
    inputForm,
  };
}

function multiplyQuantityValue(descriptor, value, integerMultiplier) {
  if (!isNonNegativeSafeInteger(integerMultiplier)) {
    return {
      ok: false,
      error: `P02F_INTEGER_MULTIPLIER_INVALID:${String(integerMultiplier)}`,
    };
  }

  if (descriptor.numericDomainId === "NON_NEGATIVE_SAFE_INTEGER") {
    if (!isNonNegativeSafeInteger(value)) {
      return { ok: false, error: `P02F_QUANTITY_VALUE_INVALID:${JSON.stringify(value)}` };
    }
    const result = BigInt(value) * BigInt(integerMultiplier);
    if (result > MAX_SAFE_BIGINT) {
      return { ok: false, error: `P02F_RESULT_OVERFLOW:${descriptor.knowledgePointId}:${value}:${integerMultiplier}` };
    }
    return {
      ok: true,
      inputValueModel: "SAFE_INTEGER",
      resultValueModel: "SAFE_INTEGER",
      value: Number(result),
    };
  }

  const normalized = normalizeRationalInput(value);
  if (!normalized.ok) return normalized;
  let resultNumerator = normalized.numerator * BigInt(integerMultiplier);
  let resultDenominator = normalized.denominator;
  const divisor = gcdBigInt(resultNumerator, resultDenominator);
  resultNumerator /= divisor;
  resultDenominator /= divisor;
  if (resultNumerator > MAX_SAFE_BIGINT || resultDenominator > MAX_SAFE_BIGINT) {
    return {
      ok: false,
      error: `P02F_RESULT_OVERFLOW:${descriptor.knowledgePointId}:${JSON.stringify(value)}:${integerMultiplier}`,
    };
  }
  const wholeNumber = resultNumerator / resultDenominator;
  const remainderNumerator = resultNumerator % resultDenominator;
  return {
    ok: true,
    inputValueModel: normalized.inputForm,
    resultValueModel: "REDUCED_RATIONAL",
    value: Object.freeze({
      numerator: Number(resultNumerator),
      denominator: Number(resultDenominator),
      wholeNumber: Number(wholeNumber),
      remainderNumerator: Number(remainderNumerator),
    }),
  };
}

function blockedResult(request, errors) {
  return Object.freeze({
    ok: false,
    blocked: true,
    errors: freezeArray(errors),
    request: Object.freeze({ ...request }),
    consumerVersion: P02F_SAME_UNIT_QUANTITY_ARITHMETIC_CONSUMER_VERSION,
    consumerMode: "PRODUCTION_DETERMINISTIC_SAME_UNIT_QUANTITY_ARITHMETIC",
    productionAdmissionState: "PRODUCTION_ADMITTED",
    descriptor: null,
    resultQuantity: null,
  });
}

function successResult(request, descriptor, quantityIdentity, semanticRoleBinding, arithmetic) {
  return Object.freeze({
    ok: true,
    blocked: false,
    errors: Object.freeze([]),
    request: Object.freeze({ ...request }),
    consumerVersion: P02F_SAME_UNIT_QUANTITY_ARITHMETIC_CONSUMER_VERSION,
    consumerMode: "PRODUCTION_DETERMINISTIC_SAME_UNIT_QUANTITY_ARITHMETIC",
    productionAdmissionState: "PRODUCTION_ADMITTED",
    descriptor: Object.freeze(clone(descriptor)),
    quantityIdentity: Object.freeze(clone(quantityIdentity)),
    semanticRoleBinding: semanticRoleBinding ? Object.freeze(clone(semanticRoleBinding)) : null,
    resultQuantity: Object.freeze({
      valueModel: arithmetic.resultValueModel,
      value: arithmetic.value,
      unitId: request.unitId,
      dimensionId: quantityIdentity.dimensionId,
      unitFamilyId: quantityIdentity.unitFamilyId,
    }),
  });
}

function numericDomainFor(row, semanticRoleBinding) {
  if (row.knowledgePointId.includes("fraction")
    || semanticRoleBinding?.relationFamilyId === "FRACTIONAL_QUANTITY_SCALING") {
    return "NON_NEGATIVE_RATIONAL";
  }
  return "NON_NEGATIVE_SAFE_INTEGER";
}

function buildDescriptor(row, authority, quantityIdentity, semanticRoleBinding, policy) {
  const errors = [];
  if (!row.directlyRequiredW2CapabilityIds.includes(TARGET_CAPABILITY_ID)) {
    errors.push(`P02F_DIRECT_CAPABILITY_REQUIREMENT_MISSING:${row.knowledgePointId}`);
  }
  if (!policy.scope.allowedPrimaryRuntimeProfileIds.includes(row.primaryRuntimeProfileId)) {
    errors.push(`P02F_PRIMARY_PROFILE_INVALID:${row.knowledgePointId}:${row.primaryRuntimeProfileId}`);
  }
  if (!quantityIdentity) {
    errors.push(`P02F_QUANTITY_IDENTITY_REQUIRED:${row.knowledgePointId}`);
  } else if (!Array.isArray(quantityIdentity.canonicalUnitIds) || quantityIdentity.canonicalUnitIds.length === 0) {
    errors.push(`P02F_CANONICAL_UNIT_REQUIRED:${row.knowledgePointId}`);
  }
  if (errors.length > 0) return { descriptor: null, errors };

  const sourceDeclaredUnitRequired = quantityIdentity.unitIdentityMode === "SOURCE_DECLARED_ONLY";
  const numericDomainId = numericDomainFor(row, semanticRoleBinding);
  return {
    errors: [],
    descriptor: Object.freeze({
      descriptorId: `p02fop_${row.knowledgePointId.replace(/^kp_/, "")}`,
      knowledgePointId: row.knowledgePointId,
      canonicalNameZh: authority?.canonicalNameZh ?? row.canonicalNameZh,
      primaryRuntimeProfileId: row.primaryRuntimeProfileId,
      operationFamilyId: OPERATION_FAMILY_ID,
      numericDomainId,
      acceptedValueForms: freezeArray(policy.numericDomains[numericDomainId].inputForms),
      resultValueForm: policy.numericDomains[numericDomainId].resultForm,
      inputRoles: Object.freeze(["BASE_QUANTITY", "INTEGER_MULTIPLIER"]),
      resultRoleId: "PRODUCT_QUANTITY",
      arithmeticExpression: "resultQuantity = baseQuantity × integerMultiplier",
      quantityIdentityId: quantityIdentity.identityId,
      dimensionId: quantityIdentity.dimensionId,
      unitFamilyId: quantityIdentity.unitFamilyId,
      canonicalUnitIds: freezeArray(quantityIdentity.canonicalUnitIds),
      executableCanonicalUnitIds: freezeArray(
        sourceDeclaredUnitRequired ? [] : quantityIdentity.canonicalUnitIds,
      ),
      unitIdentityMode: quantityIdentity.unitIdentityMode,
      sourceDeclaredUnitRequired,
      inputUnitRule: sourceDeclaredUnitRequired
        ? "EXPLICIT_SOURCE_DECLARED_UNIT_REQUIRED"
        : "P02C_CANONICAL_UNIT_REQUIRED",
      resultUnitRule: "PRESERVE_INPUT_UNIT_ID_EXACTLY",
      semanticRoleBindingId: semanticRoleBinding?.bindingId ?? null,
      semanticRelationFamilyId: semanticRoleBinding?.relationFamilyId ?? null,
      sourceNodeIds: freezeArray(unique(row.sourceNodeIds).sort()),
      assignedDeliveryWaveId: row.assignedDeliveryWaveId,
      authorityMode: "GLOBAL_PRIMARY",
      consumerMode: "PRODUCTION_DETERMINISTIC_SAME_UNIT_QUANTITY_ARITHMETIC",
      productionAdmissionState: "PRODUCTION_ADMITTED",
      exactRationalArithmetic: numericDomainId === "NON_NEGATIVE_RATIONAL",
      unitConversionAllowed: false,
      mixedUnitNormalizationAllowed: false,
      crossDimensionArithmeticAllowed: false,
      storyTemplateGenerationAllowed: false,
      questionGenerationAllowed: false,
    }),
  };
}

export function materializeP02FSameUnitQuantityArithmeticConsumer() {
  const policy = readJson("same-unit-quantity-arithmetic-policy.json");
  const manifest = readJson("same-unit-quantity-arithmetic.manifest.json");
  const promotionRegistry = readJson("w2-capability-promotion-registry.json");
  const predecessorPromotionRegistry = readRepoJson(promotionRegistry.predecessorPromotionRegistryPath);
  const p02 = materializeP02W2ProductAdmissionInventory();
  const p02b = materializeP02BGlobalAuthorityLookupConsumer();
  const p02c = materializeP02CQuantityDimensionUnitIdentityConsumer();
  const p02e = materializeP02EQuantitySemanticRoleBindingConsumer();
  const dependentRows = p02.dependentKnowledgePointRows.filter((row) => (
    row.w2FoundationCapabilityIds.includes(TARGET_CAPABILITY_ID)
  ));

  const descriptorErrors = [];
  const descriptors = [];
  for (const row of dependentRows) {
    const authority = p02b.getKnowledgePoint(row.knowledgePointId);
    if (!authority) {
      descriptorErrors.push(`P02F_UNKNOWN_KNOWLEDGE_POINT:${row.knowledgePointId}`);
      continue;
    }
    const built = buildDescriptor(
      row,
      authority,
      p02c.getIdentity(row.knowledgePointId),
      p02e.getBinding(row.knowledgePointId),
      policy,
    );
    descriptorErrors.push(...built.errors);
    if (built.descriptor) descriptors.push(built.descriptor);
  }

  descriptors.sort((a, b) => a.knowledgePointId.localeCompare(b.knowledgePointId));
  const descriptorByKnowledgePointId = new Map(descriptors.map((row) => [row.knowledgePointId, row]));
  const dependentByKnowledgePointId = new Map(dependentRows.map((row) => [row.knowledgePointId, row]));
  const sourceNodeIds = unique(descriptors.flatMap((row) => row.sourceNodeIds)).sort();
  const dimensionCounts = Object.fromEntries(unique(descriptors.map((row) => row.dimensionId)).sort().map((dimensionId) => [
    dimensionId,
    descriptors.filter((row) => row.dimensionId === dimensionId).length,
  ]));
  const unitFamilyCounts = Object.fromEntries(unique(descriptors.map((row) => row.unitFamilyId)).sort().map((unitFamilyId) => [
    unitFamilyId,
    descriptors.filter((row) => row.unitFamilyId === unitFamilyId).length,
  ]));
  const numericDomainCounts = Object.fromEntries(unique(descriptors.map((row) => row.numericDomainId)).sort().map((numericDomainId) => [
    numericDomainId,
    descriptors.filter((row) => row.numericDomainId === numericDomainId).length,
  ]));
  const inheritedPromotionIds = predecessorPromotionRegistry.effectivePromotionCapabilityIds
    ?? predecessorPromotionRegistry.promotions.map((row) => row.capabilityId);
  const effectivePromotionCapabilityIds = unique([
    ...inheritedPromotionIds,
    ...promotionRegistry.promotions.map((row) => row.capabilityId),
  ]).sort();

  function execute({
    knowledgePointId = null,
    sourceNodeId = null,
    quantity = null,
    integerMultiplier = null,
    sourceDeclaredUnitId = null,
    assertedOperationFamilyId = null,
    assertedResultUnitId = null,
  } = {}) {
    const request = {
      knowledgePointId: typeof knowledgePointId === "string" && knowledgePointId.length > 0 ? knowledgePointId : null,
      sourceNodeId: typeof sourceNodeId === "string" && sourceNodeId.length > 0 ? sourceNodeId : null,
      quantityValue: quantity && Object.hasOwn(quantity, "value") ? clone(quantity.value) : null,
      unitId: quantity && typeof quantity.unitId === "string" && quantity.unitId.length > 0 ? quantity.unitId : null,
      integerMultiplier,
      sourceDeclaredUnitId: typeof sourceDeclaredUnitId === "string" && sourceDeclaredUnitId.length > 0
        ? sourceDeclaredUnitId
        : null,
      assertedOperationFamilyId: typeof assertedOperationFamilyId === "string" && assertedOperationFamilyId.length > 0
        ? assertedOperationFamilyId
        : null,
      assertedResultUnitId: typeof assertedResultUnitId === "string" && assertedResultUnitId.length > 0
        ? assertedResultUnitId
        : null,
    };

    if (!request.knowledgePointId) {
      return blockedResult(request, ["P02F_ARITHMETIC_KP_ID_REQUIRED"]);
    }
    if (!p02b.getKnowledgePoint(request.knowledgePointId)) {
      return blockedResult(request, [`P02F_UNKNOWN_KNOWLEDGE_POINT:${request.knowledgePointId}`]);
    }
    if (!dependentByKnowledgePointId.has(request.knowledgePointId)) {
      return blockedResult(request, [`P02F_KP_NOT_SAME_UNIT_ARITHMETIC_DEPENDENT:${request.knowledgePointId}`]);
    }
    const descriptor = descriptorByKnowledgePointId.get(request.knowledgePointId);
    if (!descriptor) {
      const errors = descriptorErrors.filter((code) => code.includes(request.knowledgePointId));
      return blockedResult(request, errors.length > 0 ? errors : [`P02F_OPERATION_DESCRIPTOR_MISSING:${request.knowledgePointId}`]);
    }
    if (!quantity || typeof quantity !== "object" || Array.isArray(quantity)) {
      return blockedResult(request, ["P02F_QUANTITY_INPUT_REQUIRED"]);
    }
    if (!request.unitId) {
      return blockedResult(request, ["P02F_UNIT_ID_REQUIRED"]);
    }
    if (request.assertedOperationFamilyId && request.assertedOperationFamilyId !== descriptor.operationFamilyId) {
      return blockedResult(request, [
        `P02F_OPERATION_FAMILY_MISMATCH:${request.knowledgePointId}:${request.assertedOperationFamilyId}:${descriptor.operationFamilyId}`,
      ]);
    }

    let quantityResolution;
    if (descriptor.sourceDeclaredUnitRequired) {
      if (!request.sourceNodeId) {
        return blockedResult(request, [`P02F_SOURCE_DECLARED_UNIT_SOURCE_REQUIRED:${request.knowledgePointId}`]);
      }
      if (!request.sourceDeclaredUnitId) {
        return blockedResult(request, [`P02F_SOURCE_DECLARED_UNIT_REQUIRED:${request.knowledgePointId}`]);
      }
      if (request.unitId === SOURCE_DECLARED_UNIT_PLACEHOLDER
        || request.sourceDeclaredUnitId === SOURCE_DECLARED_UNIT_PLACEHOLDER) {
        return blockedResult(request, [`P02F_SOURCE_DECLARED_UNIT_PLACEHOLDER_FORBIDDEN:${request.knowledgePointId}`]);
      }
      if (request.sourceDeclaredUnitId !== request.unitId) {
        return blockedResult(request, [
          `P02F_SOURCE_DECLARED_UNIT_MISMATCH:${request.knowledgePointId}:${request.sourceDeclaredUnitId}:${request.unitId}`,
        ]);
      }
      quantityResolution = p02c.resolve({
        knowledgePointId: request.knowledgePointId,
        sourceNodeId: request.sourceNodeId,
      });
    } else {
      quantityResolution = p02c.resolve({
        knowledgePointId: request.knowledgePointId,
        sourceNodeId: request.sourceNodeId,
        assertedUnitId: request.unitId,
      });
    }

    if (!quantityResolution.ok) {
      if (quantityResolution.errors.some((code) => code.startsWith("P02C_SOURCE_KP_MISMATCH"))) {
        return blockedResult(request, [`P02F_SOURCE_KP_MISMATCH:${request.sourceNodeId}:${request.knowledgePointId}`]);
      }
      if (quantityResolution.errors.some((code) => code.startsWith("P02C_UNIT_ID_MISMATCH"))) {
        return blockedResult(request, [`P02F_UNIT_ID_INVALID:${request.knowledgePointId}:${request.unitId}`]);
      }
      return blockedResult(request, [`P02F_QUANTITY_IDENTITY_REQUIRED:${request.knowledgePointId}`]);
    }
    if (request.assertedResultUnitId && request.assertedResultUnitId !== request.unitId) {
      return blockedResult(request, [
        `P02F_RESULT_UNIT_MISMATCH:${request.knowledgePointId}:${request.assertedResultUnitId}:${request.unitId}`,
      ]);
    }

    const arithmetic = multiplyQuantityValue(descriptor, request.quantityValue, request.integerMultiplier);
    if (!arithmetic.ok) return blockedResult(request, [arithmetic.error]);
    return successResult(
      request,
      descriptor,
      quantityResolution.identity,
      p02e.getBinding(request.knowledgePointId),
      arithmetic,
    );
  }

  return Object.freeze({
    schemaName: manifest.schemaName,
    schemaVersion: manifest.schemaVersion,
    programId: manifest.programId,
    taskId: manifest.taskId,
    status: manifest.status,
    consumerVersion: P02F_SAME_UNIT_QUANTITY_ARITHMETIC_CONSUMER_VERSION,
    consumerMode: "PRODUCTION_DETERMINISTIC_SAME_UNIT_QUANTITY_ARITHMETIC",
    productionAdmissionState: "PRODUCTION_ADMITTED",
    operationFamilyId: OPERATION_FAMILY_ID,
    policy: Object.freeze(policy),
    manifest: Object.freeze(manifest),
    promotionRegistry: Object.freeze(promotionRegistry),
    predecessorPromotionRegistry: Object.freeze(predecessorPromotionRegistry),
    descriptors: freezeArray(descriptors),
    descriptorErrors: freezeArray(descriptorErrors),
    sourceNodeIds: freezeArray(sourceNodeIds),
    effectivePromotionCapabilityIds: freezeArray(effectivePromotionCapabilityIds),
    metrics: Object.freeze({
      effectiveDependentKnowledgePointCount: dependentRows.length,
      operationDescriptorCount: descriptors.length,
      descriptorErrorCount: descriptorErrors.length,
      dependentSourceNodeCount: sourceNodeIds.length,
      sourceKnowledgePointBindingCount: descriptors.reduce((sum, row) => sum + row.sourceNodeIds.length, 0),
      semanticRoleBindingCount: descriptors.filter((row) => row.semanticRoleBindingId).length,
      fixedCanonicalUnitBindingCount: descriptors.reduce((sum, row) => sum + row.executableCanonicalUnitIds.length, 0),
      sourceDeclaredUnitDescriptorCount: descriptors.filter((row) => row.sourceDeclaredUnitRequired).length,
      exactRationalDescriptorCount: descriptors.filter((row) => row.exactRationalArithmetic).length,
      dimensionCounts: Object.freeze(dimensionCounts),
      unitFamilyCounts: Object.freeze(unitFamilyCounts),
      numericDomainCounts: Object.freeze(numericDomainCounts),
      inheritedPromotionCount: inheritedPromotionIds.length,
      newPromotionCount: promotionRegistry.promotions.length,
      effectivePromotionCount: effectivePromotionCapabilityIds.length,
      remainingShadowFoundationCount: promotionRegistry.remainingShadowFoundationCapabilityIds.length,
    }),
    execute,
    getDescriptor(knowledgePointId) {
      return descriptorByKnowledgePointId.get(knowledgePointId) ?? null;
    },
  });
}

export function executeP02FSameUnitQuantityArithmetic(request = {}) {
  return materializeP02FSameUnitQuantityArithmeticConsumer().execute(request);
}

export function listP02FSameUnitQuantityArithmeticDescriptors() {
  return clone(materializeP02FSameUnitQuantityArithmeticConsumer().descriptors);
}

export function getP02FSameUnitQuantityArithmeticDescriptor(knowledgePointId) {
  const descriptor = materializeP02FSameUnitQuantityArithmeticConsumer().getDescriptor(knowledgePointId);
  return descriptor ? clone(descriptor) : null;
}

export function listP02FEffectiveW2PromotionCapabilityIds() {
  return clone(materializeP02FSameUnitQuantityArithmeticConsumer().effectivePromotionCapabilityIds);
}
