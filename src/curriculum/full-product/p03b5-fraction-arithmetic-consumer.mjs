import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP03B3FractionDomainValidator } from "./p03b3-fraction-domain-validator.mjs";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../../..");
const P03B5_DIR = path.join(ROOT, "data/curriculum/full-product/p03b5");
const TARGET_CAPABILITY_ID = "cap_fraction_arithmetic";
const NUMBER_SYSTEM_CAPABILITY_ID = "cap_fraction_number_system";
const DOMAIN_VALIDATOR_CAPABILITY_ID = "cap_fraction_domain_validator";
const MAX_SAFE_BIGINT = BigInt(Number.MAX_SAFE_INTEGER);

export const P03B5_FRACTION_ARITHMETIC_CONSUMER_VERSION =
  "p03b5-fraction-arithmetic-consumer-v1";

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(P03B5_DIR, fileName), "utf8"));
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

function reduceFraction(numerator, denominator) {
  const divisor = gcdBigInt(numerator, denominator);
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
    reductionDivisor: divisor,
  };
}

function canonicalToBigInt(canonical) {
  return {
    numerator: BigInt(canonical.numerator),
    denominator: BigInt(canonical.denominator),
  };
}

function toSafeNumber(value) {
  if (value < 0n || value > MAX_SAFE_BIGINT) return null;
  return Number(value);
}

function operatorSymbol(action) {
  switch (action) {
    case "ADD": return "+";
    case "SUBTRACT": return "−";
    case "MULTIPLY": return "×";
    case "DIVIDE": return "÷";
    default: return "?";
  }
}

function blockedResult(request, errors) {
  return Object.freeze({
    ok: false,
    blocked: true,
    errors: freezeArray(errors),
    request: Object.freeze(clone(request)),
    consumerVersion: P03B5_FRACTION_ARITHMETIC_CONSUMER_VERSION,
    consumerMode: "PRODUCTION_DETERMINISTIC_FRACTION_ARITHMETIC",
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
    consumerVersion: P03B5_FRACTION_ARITHMETIC_CONSUMER_VERSION,
    consumerMode: "PRODUCTION_DETERMINISTIC_FRACTION_ARITHMETIC",
    productionAdmissionState: "PRODUCTION_ADMITTED",
    descriptor,
    result: Object.freeze(result),
  });
}

function buildDescriptor(row, fractionNumberSystem, fractionDomainValidator) {
  const errors = [];
  if (!row.w3CapabilityIds.includes(TARGET_CAPABILITY_ID)) {
    errors.push(`P03B5_KP_NOT_FRACTION_ARITHMETIC_DEPENDENT:${row.knowledgePointId}`);
  }
  if (!Array.isArray(row.sourceNodeIds) || row.sourceNodeIds.length === 0) {
    errors.push(`P03B5_SOURCE_AUTHORITY_MISSING:${row.knowledgePointId}`);
  }
  const numberSystemDescriptor = fractionNumberSystem.getDescriptor(row.knowledgePointId);
  if (!numberSystemDescriptor) {
    errors.push(`P03B5_NUMBER_SYSTEM_DESCRIPTOR_MISSING:${row.knowledgePointId}`);
  }
  const domainValidatorDescriptor = fractionDomainValidator.getDescriptor(row.knowledgePointId);
  if (!domainValidatorDescriptor) {
    errors.push(`P03B5_DOMAIN_VALIDATOR_DESCRIPTOR_MISSING:${row.knowledgePointId}`);
  }
  if (errors.length > 0) return { descriptor: null, errors };

  return {
    errors: [],
    descriptor: Object.freeze({
      descriptorId: `p03b5fracop_${row.knowledgePointId.replace(/^kp_/, "")}`,
      knowledgePointId: row.knowledgePointId,
      canonicalNameZh: row.canonicalNameZh,
      capabilityStatement: row.capabilityStatement,
      reasoningInvariant: row.reasoningInvariant,
      sourceNodeIds: freezeArray(row.sourceNodeIds),
      assignedDeliveryWaveId: row.assignedDeliveryWaveId,
      baseDeliveryWaveId: row.baseDeliveryWaveId,
      directW3CohortMember: row.directW3CohortMember,
      directlyRequiresFractionArithmetic: row.directlyRequiredW3CapabilityIds.includes(
        TARGET_CAPABILITY_ID,
      ),
      protectedExistingD0: row.protectedExistingD0,
      productProductionAdmitted: row.productProductionAdmitted,
      productGapState: row.productGapState,
      numericDomainId: "NON_NEGATIVE_RATIONAL",
      numberSystemCapabilityId: NUMBER_SYSTEM_CAPABILITY_ID,
      numberSystemDescriptorId: numberSystemDescriptor.descriptorId,
      domainValidatorCapabilityId: DOMAIN_VALIDATOR_CAPABILITY_ID,
      domainValidatorDescriptorId: domainValidatorDescriptor.descriptorId,
      allowedActions: Object.freeze(["ADD", "SUBTRACT", "MULTIPLY", "DIVIDE"]),
      operandRoles: Object.freeze(["LEFT_OPERAND", "RIGHT_OPERAND"]),
      resultValueForm: "REDUCED_IMPROPER_FRACTION",
      exactBigIntIntermediate: true,
      floatingPointApproximationAllowed: false,
      negativeResultAllowed: false,
      divisionByZeroAllowed: false,
      resultPolicyValidation: true,
      decimalArithmeticAllowed: false,
      fractionDecimalConversionAllowed: false,
      crossDomainNormalizationAllowed: false,
      questionGenerationAllowed: false,
      productionAdmissionState: "PRODUCTION_ADMITTED",
    }),
  };
}

export function materializeP03B5FractionArithmeticConsumer() {
  const policy = readJson("fraction-arithmetic-policy.json");
  const manifest = readJson("fraction-arithmetic.manifest.json");
  const promotionRegistry = readJson("w3-capability-promotion-registry.json");
  const predecessorPromotionRegistry = readRepoJson(
    promotionRegistry.predecessorPromotionRegistryPath,
  );
  const fractionDomainValidator = materializeP03B3FractionDomainValidator();
  const fractionNumberSystem = fractionDomainValidator.fractionNumberSystem;
  const p03a = fractionDomainValidator.hardeningAuthority;
  const p03 = fractionDomainValidator.predecessorInventory;
  const queueEntry = p03a.getCapability(TARGET_CAPABILITY_ID);

  const dependentRows = p03.dependentKnowledgePointRows.filter((row) => (
    row.w3CapabilityIds.includes(TARGET_CAPABILITY_ID)
  ));
  const descriptorErrors = [];
  const descriptors = [];
  for (const row of dependentRows) {
    const built = buildDescriptor(row, fractionNumberSystem, fractionDomainValidator);
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
    fractionNumberSystem.getDescriptor(row.knowledgePointId) != null
  )).length;
  const predecessorDomainValidatorCoverageCount = descriptors.filter((row) => (
    fractionDomainValidator.getDescriptor(row.knowledgePointId) != null
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
      (row) => row.directlyRequiresFractionArithmetic,
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

  function validateOperand({ knowledgePointId, sourceNodeId, value }) {
    const validated = fractionDomainValidator.execute({
      action: "VALIDATE_VALUE",
      knowledgePointId,
      sourceNodeId,
      value,
      assertedCapabilityId: DOMAIN_VALIDATOR_CAPABILITY_ID,
    });
    if (!validated.ok) {
      return {
        ok: false,
        errors: validated.errors.map((error) => `P03B5_DOMAIN_VALIDATOR_REJECTED:${error}`),
      };
    }
    return { ok: true, canonical: validated.result.canonicalValue };
  }

  function normalizeResult({ knowledgePointId, sourceNodeId, numerator, denominator }) {
    const reduced = reduceFraction(numerator, denominator);
    const numeratorNumber = toSafeNumber(reduced.numerator);
    const denominatorNumber = toSafeNumber(reduced.denominator);
    if (numeratorNumber == null || denominatorNumber == null || denominatorNumber === 0) {
      return {
        ok: false,
        errors: [
          `P03B5_RESULT_OVERFLOW:${reduced.numerator.toString()}/${reduced.denominator.toString()}`,
        ],
      };
    }
    const normalized = fractionNumberSystem.execute({
      action: "NORMALIZE",
      knowledgePointId,
      sourceNodeId,
      value: { numerator: numeratorNumber, denominator: denominatorNumber },
      assertedCapabilityId: NUMBER_SYSTEM_CAPABILITY_ID,
    });
    if (!normalized.ok) {
      return {
        ok: false,
        errors: normalized.errors.map((error) => `P03B5_NUMBER_SYSTEM_REJECTED:${error}`),
      };
    }
    return {
      ok: true,
      canonical: normalized.result.canonicalValue,
      reductionDivisor: reduced.reductionDivisor,
    };
  }

  function calculate(action, left, right) {
    const leftValue = canonicalToBigInt(left);
    const rightValue = canonicalToBigInt(right);

    if (action === "ADD" || action === "SUBTRACT") {
      const denominatorGcd = gcdBigInt(leftValue.denominator, rightValue.denominator);
      const leftScale = rightValue.denominator / denominatorGcd;
      const rightScale = leftValue.denominator / denominatorGcd;
      const leftScaledNumerator = leftValue.numerator * leftScale;
      const rightScaledNumerator = rightValue.numerator * rightScale;
      if (action === "SUBTRACT" && leftScaledNumerator < rightScaledNumerator) {
        return { ok: false, errors: ["P03B5_NEGATIVE_RESULT_FORBIDDEN"] };
      }
      return {
        ok: true,
        numerator: action === "ADD"
          ? leftScaledNumerator + rightScaledNumerator
          : leftScaledNumerator - rightScaledNumerator,
        denominator: leftValue.denominator * leftScale,
        trace: {
          algorithm: "LEAST_COMMON_DENOMINATOR_VIA_GCD",
          denominatorGcd: denominatorGcd.toString(),
          leftScale: leftScale.toString(),
          rightScale: rightScale.toString(),
          leftScaledNumerator: leftScaledNumerator.toString(),
          rightScaledNumerator: rightScaledNumerator.toString(),
        },
      };
    }

    if (action === "MULTIPLY") {
      const leftNumeratorRightDenominatorGcd = gcdBigInt(
        leftValue.numerator,
        rightValue.denominator,
      );
      const rightNumeratorLeftDenominatorGcd = gcdBigInt(
        rightValue.numerator,
        leftValue.denominator,
      );
      const numerator =
        (leftValue.numerator / leftNumeratorRightDenominatorGcd)
        * (rightValue.numerator / rightNumeratorLeftDenominatorGcd);
      const denominator =
        (leftValue.denominator / rightNumeratorLeftDenominatorGcd)
        * (rightValue.denominator / leftNumeratorRightDenominatorGcd);
      return {
        ok: true,
        numerator,
        denominator,
        trace: {
          algorithm: "CROSS_CANCEL_THEN_MULTIPLY",
          leftNumeratorRightDenominatorGcd:
            leftNumeratorRightDenominatorGcd.toString(),
          rightNumeratorLeftDenominatorGcd:
            rightNumeratorLeftDenominatorGcd.toString(),
        },
      };
    }

    if (rightValue.numerator === 0n) {
      return { ok: false, errors: ["P03B5_DIVISION_BY_ZERO"] };
    }
    const numerator = leftValue.numerator * rightValue.denominator;
    const denominator = leftValue.denominator * rightValue.numerator;
    return {
      ok: true,
      numerator,
      denominator,
      trace: {
        algorithm: "MULTIPLY_BY_RECIPROCAL_THEN_REDUCE",
        reciprocalNumerator: rightValue.denominator.toString(),
        reciprocalDenominator: rightValue.numerator.toString(),
      },
    };
  }

  function execute({
    action = "ADD",
    knowledgePointId = null,
    sourceNodeId = null,
    leftValue = null,
    rightValue = null,
    resultPolicy = null,
    assertedCapabilityId = null,
  } = {}) {
    const request = {
      action,
      knowledgePointId,
      sourceNodeId,
      leftValue: clone(leftValue),
      rightValue: clone(rightValue),
      resultPolicy: clone(resultPolicy),
      assertedCapabilityId,
    };
    const errors = [];

    if (typeof knowledgePointId !== "string" || knowledgePointId.length === 0) {
      errors.push("P03B5_KP_ID_REQUIRED");
    }
    const descriptor = descriptorByKnowledgePointId.get(knowledgePointId) ?? null;
    if (knowledgePointId && !p03.getRow(knowledgePointId)) {
      errors.push(`P03B5_UNKNOWN_KNOWLEDGE_POINT:${knowledgePointId}`);
    } else if (knowledgePointId && !descriptor) {
      errors.push(`P03B5_KP_NOT_FRACTION_ARITHMETIC_DEPENDENT:${knowledgePointId}`);
    }
    if (descriptor && sourceNodeId && !descriptor.sourceNodeIds.includes(sourceNodeId)) {
      errors.push(`P03B5_SOURCE_KP_MISMATCH:${knowledgePointId}:${sourceNodeId}`);
    }
    if (assertedCapabilityId && assertedCapabilityId !== TARGET_CAPABILITY_ID) {
      errors.push(`P03B5_CAPABILITY_ASSERTION_MISMATCH:${assertedCapabilityId}`);
    }
    if (!policy.allowedActions.includes(action)) {
      errors.push(`P03B5_ACTION_INVALID:${action}`);
    }
    if (leftValue == null) errors.push("P03B5_LEFT_VALUE_REQUIRED");
    if (rightValue == null) errors.push("P03B5_RIGHT_VALUE_REQUIRED");
    if (errors.length > 0) return blockedResult(request, errors);

    const left = validateOperand({ knowledgePointId, sourceNodeId, value: leftValue });
    if (!left.ok) return blockedResult(request, left.errors);
    const right = validateOperand({ knowledgePointId, sourceNodeId, value: rightValue });
    if (!right.ok) return blockedResult(request, right.errors);

    const calculated = calculate(action, left.canonical, right.canonical);
    if (!calculated.ok) return blockedResult(request, calculated.errors);

    const normalizedResult = normalizeResult({
      knowledgePointId,
      sourceNodeId,
      numerator: calculated.numerator,
      denominator: calculated.denominator,
    });
    if (!normalizedResult.ok) return blockedResult(request, normalizedResult.errors);

    const resultValidation = fractionDomainValidator.execute({
      action: "VALIDATE_VALUE",
      knowledgePointId,
      sourceNodeId,
      value: {
        numerator: normalizedResult.canonical.numerator,
        denominator: normalizedResult.canonical.denominator,
      },
      valuePolicy: resultPolicy,
      assertedCapabilityId: DOMAIN_VALIDATOR_CAPABILITY_ID,
    });
    if (!resultValidation.ok) {
      return blockedResult(request, resultValidation.errors.map(
        (error) => `P03B5_RESULT_POLICY_REJECTED:${error}`,
      ));
    }

    return successResult(request, descriptor, {
      action,
      operatorSymbol: operatorSymbol(action),
      leftCanonicalValue: left.canonical,
      rightCanonicalValue: right.canonical,
      canonicalValue: normalizedResult.canonical,
      resultPolicy: resultValidation.result.valuePolicy,
      arithmeticTrace: Object.freeze({
        ...calculated.trace,
        rawNumerator: calculated.numerator.toString(),
        rawDenominator: calculated.denominator.toString(),
        finalReductionDivisor: normalizedResult.reductionDivisor.toString(),
      }),
      exact: true,
    });
  }

  return Object.freeze({
    schemaName: manifest.schemaName,
    schemaVersion: manifest.schemaVersion,
    programId: manifest.programId,
    taskId: manifest.taskId,
    status: manifest.status,
    version: P03B5_FRACTION_ARITHMETIC_CONSUMER_VERSION,
    policy: Object.freeze(policy),
    manifest: Object.freeze(manifest),
    promotionRegistry: Object.freeze(promotionRegistry),
    predecessorPromotionRegistry: Object.freeze(predecessorPromotionRegistry),
    fractionNumberSystem,
    fractionDomainValidator,
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

export function executeP03B5FractionArithmetic(request) {
  return materializeP03B5FractionArithmeticConsumer().execute(request);
}
