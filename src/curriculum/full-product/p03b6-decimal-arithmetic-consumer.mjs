import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP03B2DecimalNumberSystemConsumer } from "./p03b2-decimal-number-system-consumer.mjs";
import { materializeP03B4DecimalDomainValidator } from "./p03b4-decimal-domain-validator.mjs";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../../..");
const P03B6_DIR = path.join(ROOT, "data/curriculum/full-product/p03b6");
const TARGET_CAPABILITY_ID = "cap_decimal_arithmetic";
const NUMBER_SYSTEM_CAPABILITY_ID = "cap_decimal_number_system";
const DOMAIN_VALIDATOR_CAPABILITY_ID = "cap_decimal_domain_validator";

export const P03B6_DECIMAL_ARITHMETIC_CONSUMER_VERSION =
  "p03b6-decimal-arithmetic-consumer-v1";

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(P03B6_DIR, fileName), "utf8"));
}

function readRepoJson(repoPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, repoPath), "utf8"));
}

function freezeArray(values) {
  return Object.freeze([...values]);
}

function unique(values) {
  return [...new Set((values ?? []).filter(Boolean))];
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function pow10(exponent) {
  return 10n ** BigInt(exponent);
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

function trimBase10(coefficient, scale) {
  let nextCoefficient = coefficient;
  let nextScale = scale;
  if (nextCoefficient === 0n) return { coefficient: 0n, scale: 0 };
  while (nextScale > 0 && nextCoefficient % 10n === 0n) {
    nextCoefficient /= 10n;
    nextScale -= 1;
  }
  return { coefficient: nextCoefficient, scale: nextScale };
}

function toInternal(canonicalValue) {
  return {
    coefficient: BigInt(canonicalValue.coefficient),
    scale: canonicalValue.scale,
  };
}

function blockedResult(request, errors) {
  return Object.freeze({
    ok: false,
    blocked: true,
    errors: freezeArray(errors),
    request: Object.freeze(clone(request)),
    consumerVersion: P03B6_DECIMAL_ARITHMETIC_CONSUMER_VERSION,
    consumerMode: "PRODUCTION_DETERMINISTIC_DECIMAL_ARITHMETIC",
    productionAdmissionState: "PRODUCTION_ADMITTED",
    descriptor: null,
    result: null,
  });
}

function successResult(request, descriptor, result) {
  return Object.freeze({
    ok: true,
    blocked: false,
    errors: Object.freeze([]),
    request: Object.freeze(clone(request)),
    consumerVersion: P03B6_DECIMAL_ARITHMETIC_CONSUMER_VERSION,
    consumerMode: "PRODUCTION_DETERMINISTIC_DECIMAL_ARITHMETIC",
    productionAdmissionState: "PRODUCTION_ADMITTED",
    descriptor,
    result: Object.freeze(result),
  });
}

function buildDescriptor(row, decimalNumberSystem, decimalDomainValidator) {
  const errors = [];
  if (!row.w3CapabilityIds.includes(TARGET_CAPABILITY_ID)) {
    errors.push(`P03B6_KP_NOT_DECIMAL_ARITHMETIC_DEPENDENT:${row.knowledgePointId}`);
  }
  if (!Array.isArray(row.sourceNodeIds) || row.sourceNodeIds.length === 0) {
    errors.push(`P03B6_SOURCE_AUTHORITY_MISSING:${row.knowledgePointId}`);
  }
  const numberSystemDescriptor = decimalNumberSystem.getDescriptor(row.knowledgePointId);
  if (!numberSystemDescriptor) {
    errors.push(`P03B6_NUMBER_SYSTEM_DESCRIPTOR_MISSING:${row.knowledgePointId}`);
  }
  const domainValidatorDescriptor = decimalDomainValidator.getDescriptor(row.knowledgePointId);
  if (!domainValidatorDescriptor) {
    errors.push(`P03B6_DOMAIN_VALIDATOR_DESCRIPTOR_MISSING:${row.knowledgePointId}`);
  }
  if (errors.length > 0) return { descriptor: null, errors };

  return {
    errors: [],
    descriptor: Object.freeze({
      descriptorId: `p03b6decarith_${row.knowledgePointId.replace(/^kp_/, "")}`,
      knowledgePointId: row.knowledgePointId,
      canonicalNameZh: row.canonicalNameZh,
      capabilityStatement: row.capabilityStatement,
      reasoningInvariant: row.reasoningInvariant,
      sourceNodeIds: freezeArray(row.sourceNodeIds),
      assignedDeliveryWaveId: row.assignedDeliveryWaveId,
      baseDeliveryWaveId: row.baseDeliveryWaveId,
      directW3CohortMember: row.directW3CohortMember,
      directlyRequiresDecimalArithmetic: row.directlyRequiredW3CapabilityIds.includes(
        TARGET_CAPABILITY_ID,
      ),
      protectedExistingD0: row.protectedExistingD0,
      productProductionAdmitted: row.productProductionAdmitted,
      productGapState: row.productGapState,
      numericDomainId: "NON_NEGATIVE_DECIMAL",
      numberSystemCapabilityId: NUMBER_SYSTEM_CAPABILITY_ID,
      numberSystemDescriptorId: numberSystemDescriptor.descriptorId,
      domainValidatorCapabilityId: DOMAIN_VALIDATOR_CAPABILITY_ID,
      domainValidatorDescriptorId: domainValidatorDescriptor.descriptorId,
      allowedActions: Object.freeze(["ADD", "SUBTRACT", "MULTIPLY", "DIVIDE"]),
      operandRoles: Object.freeze(["LEFT_OPERAND", "RIGHT_OPERAND"]),
      resultValueForm: "NORMALIZED_BASE10_COEFFICIENT_SCALE",
      exactBigIntIntermediateArithmetic: true,
      finiteDecimalDivisionOnly: true,
      negativeValuesAllowed: false,
      fractionConversionAllowed: false,
      crossDomainNormalizationAllowed: false,
      questionGenerationAllowed: false,
      productionAdmissionState: "PRODUCTION_ADMITTED",
    }),
  };
}

export function materializeP03B6DecimalArithmeticConsumer() {
  const policy = readJson("decimal-arithmetic-policy.json");
  const manifest = readJson("decimal-arithmetic.manifest.json");
  const promotionRegistry = readJson("w3-capability-promotion-registry.json");
  const predecessorPromotionRegistry = readRepoJson(
    promotionRegistry.predecessorPromotionRegistryPath,
  );
  const decimalNumberSystem = materializeP03B2DecimalNumberSystemConsumer();
  const decimalDomainValidator = materializeP03B4DecimalDomainValidator();
  const p03a = decimalNumberSystem.hardeningAuthority;
  const p03 = decimalNumberSystem.predecessorInventory;
  const queueEntry = p03a.getCapability(TARGET_CAPABILITY_ID);

  const dependentRows = p03.dependentKnowledgePointRows.filter((row) => (
    row.w3CapabilityIds.includes(TARGET_CAPABILITY_ID)
  ));
  const descriptorErrors = [];
  const descriptors = [];
  for (const row of dependentRows) {
    const built = buildDescriptor(row, decimalNumberSystem, decimalDomainValidator);
    descriptorErrors.push(...built.errors);
    if (built.descriptor) descriptors.push(built.descriptor);
  }
  descriptors.sort((a, b) => a.knowledgePointId.localeCompare(b.knowledgePointId));

  const descriptorByKnowledgePointId = new Map(
    descriptors.map((row) => [row.knowledgePointId, row]),
  );
  const dependentSourceNodeIds = unique(
    descriptors.flatMap((row) => row.sourceNodeIds),
  ).sort();
  const sourceKnowledgePointBindingCount = descriptors.reduce(
    (sum, row) => sum + row.sourceNodeIds.length,
    0,
  );
  const predecessorNumberSystemCoverageCount = descriptors.filter((row) => (
    decimalNumberSystem.getDescriptor(row.knowledgePointId) != null
  )).length;
  const predecessorDomainValidatorCoverageCount = descriptors.filter((row) => (
    decimalDomainValidator.getDescriptor(row.knowledgePointId) != null
  )).length;
  const inheritedPromotionCapabilityIds =
    predecessorPromotionRegistry.effectivePromotionCapabilityIds
    ?? predecessorPromotionRegistry.promotions.map((row) => row.capabilityId);
  const effectivePromotionCapabilityIds = unique([
    ...inheritedPromotionCapabilityIds,
    ...promotionRegistry.promotions.map((row) => row.capabilityId),
  ]).sort();

  const metrics = Object.freeze({
    effectiveDependentKnowledgePointCount: descriptors.length,
    directW3KnowledgePointCount: descriptors.filter((row) => row.directW3CohortMember).length,
    protectedExistingD0KnowledgePointCount: descriptors.filter((row) => row.protectedExistingD0).length,
    newProductDependentKnowledgePointCount: descriptors.filter((row) => !row.protectedExistingD0).length,
    directRequirementKnowledgePointCount: descriptors.filter(
      (row) => row.directlyRequiresDecimalArithmetic,
    ).length,
    dependentSourceNodeCount: dependentSourceNodeIds.length,
    sourceKnowledgePointBindingCount,
    predecessorNumberSystemCoverageCount,
    predecessorDomainValidatorCoverageCount,
    descriptorErrorCount: descriptorErrors.length,
    allowedActionCount: policy.allowedActions.length,
    newPromotionCount: promotionRegistry.promotions.length,
    effectivePromotionCount: effectivePromotionCapabilityIds.length,
    remainingW3ContractCapabilityCount: promotionRegistry.remainingW3ContractCapabilityIds.length,
  });

  function validateThroughDomain({ knowledgePointId, sourceNodeId, value, valuePolicy }) {
    const validation = decimalDomainValidator.execute({
      action: "VALIDATE_VALUE",
      knowledgePointId,
      sourceNodeId,
      value,
      valuePolicy,
      assertedCapabilityId: DOMAIN_VALIDATOR_CAPABILITY_ID,
    });
    if (!validation.ok) {
      return {
        ok: false,
        errors: validation.errors.map((error) => `P03B6_DOMAIN_VALIDATOR_REJECTED:${error}`),
      };
    }
    return { ok: true, canonical: validation.result.canonicalValue };
  }

  function normalizeResult({ knowledgePointId, sourceNodeId, coefficient, scale }) {
    const trimmed = trimBase10(coefficient, scale);
    const normalized = decimalNumberSystem.execute({
      action: "NORMALIZE",
      knowledgePointId,
      sourceNodeId,
      value: {
        coefficient: trimmed.coefficient.toString(),
        scale: trimmed.scale,
      },
      assertedCapabilityId: NUMBER_SYSTEM_CAPABILITY_ID,
    });
    if (!normalized.ok) {
      const overflow = normalized.errors.some((error) => (
        error.includes("RESULT_OVERFLOW") || error.includes("SCALE_INVALID")
      ));
      return {
        ok: false,
        errors: normalized.errors.map((error) => (
          overflow
            ? `P03B6_RESULT_OVERFLOW:${error}`
            : `P03B6_NUMBER_SYSTEM_REJECTED:${error}`
        )),
      };
    }
    return { ok: true, canonical: normalized.result.canonicalValue };
  }

  function execute({
    action = "ADD",
    knowledgePointId = null,
    sourceNodeId = null,
    leftValue = null,
    rightValue = null,
    operandPolicy = null,
    resultPolicy = null,
    assertedCapabilityId = null,
  } = {}) {
    const request = {
      action,
      knowledgePointId,
      sourceNodeId,
      leftValue: clone(leftValue),
      rightValue: clone(rightValue),
      operandPolicy: clone(operandPolicy),
      resultPolicy: clone(resultPolicy),
      assertedCapabilityId,
    };
    const errors = [];

    if (typeof knowledgePointId !== "string" || knowledgePointId.length === 0) {
      errors.push("P03B6_KP_ID_REQUIRED");
    }
    const descriptor = descriptorByKnowledgePointId.get(knowledgePointId) ?? null;
    if (knowledgePointId && !p03.getRow(knowledgePointId)) {
      errors.push(`P03B6_UNKNOWN_KNOWLEDGE_POINT:${knowledgePointId}`);
    } else if (knowledgePointId && !descriptor) {
      errors.push(`P03B6_KP_NOT_DECIMAL_ARITHMETIC_DEPENDENT:${knowledgePointId}`);
    }
    if (descriptor && sourceNodeId && !descriptor.sourceNodeIds.includes(sourceNodeId)) {
      errors.push(`P03B6_SOURCE_KP_MISMATCH:${knowledgePointId}:${sourceNodeId}`);
    }
    if (assertedCapabilityId && assertedCapabilityId !== TARGET_CAPABILITY_ID) {
      errors.push(`P03B6_CAPABILITY_ASSERTION_MISMATCH:${assertedCapabilityId}`);
    }
    if (!policy.allowedActions.includes(action)) {
      errors.push(`P03B6_ACTION_INVALID:${action}`);
    }
    if (leftValue == null) errors.push("P03B6_LEFT_VALUE_REQUIRED");
    if (rightValue == null) errors.push("P03B6_RIGHT_VALUE_REQUIRED");
    if (errors.length > 0) return blockedResult(request, errors);

    const left = validateThroughDomain({
      knowledgePointId,
      sourceNodeId,
      value: leftValue,
      valuePolicy: operandPolicy,
    });
    if (!left.ok) return blockedResult(request, left.errors);
    const right = validateThroughDomain({
      knowledgePointId,
      sourceNodeId,
      value: rightValue,
      valuePolicy: operandPolicy,
    });
    if (!right.ok) return blockedResult(request, right.errors);

    const leftInternal = toInternal(left.canonical);
    const rightInternal = toInternal(right.canonical);
    let resultCoefficient;
    let resultScale;
    let arithmeticModel;

    if (action === "ADD" || action === "SUBTRACT") {
      const commonScale = Math.max(leftInternal.scale, rightInternal.scale);
      const leftAligned = leftInternal.coefficient * pow10(commonScale - leftInternal.scale);
      const rightAligned = rightInternal.coefficient * pow10(commonScale - rightInternal.scale);
      if (action === "SUBTRACT" && leftAligned < rightAligned) {
        return blockedResult(request, ["P03B6_NEGATIVE_RESULT_FORBIDDEN"]);
      }
      resultCoefficient = action === "ADD"
        ? leftAligned + rightAligned
        : leftAligned - rightAligned;
      resultScale = commonScale;
      arithmeticModel = "COMMON_SCALE_EXACT_INTEGER_ARITHMETIC";
    } else if (action === "MULTIPLY") {
      resultCoefficient = leftInternal.coefficient * rightInternal.coefficient;
      resultScale = leftInternal.scale + rightInternal.scale;
      arithmeticModel = "COEFFICIENT_PRODUCT_SCALE_SUM";
    } else {
      if (rightInternal.coefficient === 0n) {
        return blockedResult(request, ["P03B6_DIVISION_BY_ZERO"]);
      }
      if (leftInternal.coefficient === 0n) {
        resultCoefficient = 0n;
        resultScale = 0;
      } else {
        let numerator = leftInternal.coefficient * pow10(rightInternal.scale);
        let denominator = rightInternal.coefficient * pow10(leftInternal.scale);
        const divisor = gcdBigInt(numerator, denominator);
        numerator /= divisor;
        denominator /= divisor;

        let twos = 0;
        let fives = 0;
        while (denominator % 2n === 0n) {
          denominator /= 2n;
          twos += 1;
        }
        while (denominator % 5n === 0n) {
          denominator /= 5n;
          fives += 1;
        }
        if (denominator !== 1n) {
          return blockedResult(request, ["P03B6_NON_TERMINATING_DECIMAL"]);
        }
        resultScale = Math.max(twos, fives);
        resultCoefficient = numerator
          * (2n ** BigInt(resultScale - twos))
          * (5n ** BigInt(resultScale - fives));
      }
      arithmeticModel = "REDUCED_RATIONAL_TO_FINITE_BASE10";
    }

    const normalizedResult = normalizeResult({
      knowledgePointId,
      sourceNodeId,
      coefficient: resultCoefficient,
      scale: resultScale,
    });
    if (!normalizedResult.ok) return blockedResult(request, normalizedResult.errors);

    const validatedResult = validateThroughDomain({
      knowledgePointId,
      sourceNodeId,
      value: {
        coefficient: normalizedResult.canonical.coefficient,
        scale: normalizedResult.canonical.scale,
      },
      valuePolicy: resultPolicy,
    });
    if (!validatedResult.ok) {
      return blockedResult(
        request,
        validatedResult.errors.map((error) => `P03B6_RESULT_POLICY_REJECTED:${error}`),
      );
    }

    return successResult(request, descriptor, {
      action,
      leftCanonicalValue: left.canonical,
      rightCanonicalValue: right.canonical,
      resultCanonicalValue: validatedResult.canonical,
      arithmeticModel,
      exact: true,
      floatingPointApproximationUsed: false,
    });
  }

  return Object.freeze({
    schemaName: manifest.schemaName,
    schemaVersion: manifest.schemaVersion,
    programId: manifest.programId,
    taskId: manifest.taskId,
    status: manifest.status,
    version: P03B6_DECIMAL_ARITHMETIC_CONSUMER_VERSION,
    policy: Object.freeze(policy),
    manifest: Object.freeze(manifest),
    promotionRegistry: Object.freeze(promotionRegistry),
    predecessorPromotionRegistry: Object.freeze(predecessorPromotionRegistry),
    decimalNumberSystem,
    decimalDomainValidator,
    hardeningAuthority: p03a,
    predecessorInventory: p03,
    queueEntry,
    capabilityId: TARGET_CAPABILITY_ID,
    descriptors: freezeArray(descriptors),
    descriptorErrors: freezeArray(descriptorErrors),
    dependentSourceNodeIds: freezeArray(dependentSourceNodeIds),
    effectivePromotionCapabilityIds: freezeArray(effectivePromotionCapabilityIds),
    metrics,
    getDescriptor(knowledgePointId) {
      return descriptorByKnowledgePointId.get(knowledgePointId) ?? null;
    },
    execute,
  });
}

export function executeP03B6DecimalArithmetic(request) {
  return materializeP03B6DecimalArithmeticConsumer().execute(request);
}
