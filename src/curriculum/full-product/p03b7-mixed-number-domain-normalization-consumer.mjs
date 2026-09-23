import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP03B1FractionNumberSystemConsumer } from "./p03b1-fraction-number-system-consumer.mjs";
import { materializeP03B2DecimalNumberSystemConsumer } from "./p03b2-decimal-number-system-consumer.mjs";
import { materializeP03B3FractionDomainValidator } from "./p03b3-fraction-domain-validator.mjs";
import { materializeP03B4DecimalDomainValidator } from "./p03b4-decimal-domain-validator.mjs";
import { materializeP03B5FractionArithmeticConsumer } from "./p03b5-fraction-arithmetic-consumer.mjs";
import { materializeP03B6DecimalArithmeticConsumer } from "./p03b6-decimal-arithmetic-consumer.mjs";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../../..");
const P03B7_DIR = path.join(ROOT, "data/curriculum/full-product/p03b7");
const TARGET_CAPABILITY_ID = "cap_mixed_number_domain_normalization";
const FRACTION_NUMBER_SYSTEM_CAPABILITY_ID = "cap_fraction_number_system";
const DECIMAL_NUMBER_SYSTEM_CAPABILITY_ID = "cap_decimal_number_system";
const FRACTION_DOMAIN_VALIDATOR_CAPABILITY_ID = "cap_fraction_domain_validator";
const DECIMAL_DOMAIN_VALIDATOR_CAPABILITY_ID = "cap_decimal_domain_validator";
const MAX_SAFE_BIGINT = BigInt(Number.MAX_SAFE_INTEGER);

export const P03B7_MIXED_NUMBER_DOMAIN_NORMALIZATION_CONSUMER_VERSION =
  "p03b7-mixed-number-domain-normalization-consumer-v1";

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(P03B7_DIR, fileName), "utf8"));
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

function powBigInt(base, exponent) {
  return BigInt(base) ** BigInt(exponent);
}

function pow10BigInt(exponent) {
  return 10n ** BigInt(exponent);
}

function toSafeNumber(value, code) {
  if (value < 0n || value > MAX_SAFE_BIGINT) {
    return { ok: false, error: `${code}:${value.toString()}` };
  }
  return { ok: true, value: Number(value) };
}

function relationForComparison(comparison) {
  if (comparison < 0) return "LESS_THAN";
  if (comparison > 0) return "GREATER_THAN";
  return "EQUAL";
}

function reduceRational(numerator, denominator) {
  const divisor = gcdBigInt(numerator, denominator);
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
  };
}

function rationalIdentity(rational) {
  const reduced = reduceRational(rational.numerator, rational.denominator);
  return `${reduced.numerator.toString()}/${reduced.denominator.toString()}`;
}

function compareRational(left, right) {
  const leftCross = left.numerator * right.denominator;
  const rightCross = right.numerator * left.denominator;
  if (leftCross < rightCross) return -1;
  if (leftCross > rightCross) return 1;
  return 0;
}

function fractionCanonicalToRational(canonical) {
  return {
    numerator: BigInt(canonical.numerator),
    denominator: BigInt(canonical.denominator),
  };
}

function decimalCanonicalToRational(canonical) {
  return reduceRational(
    BigInt(canonical.coefficient),
    pow10BigInt(canonical.scale),
  );
}

function blockedResult(request, errors) {
  return Object.freeze({
    ok: false,
    blocked: true,
    errors: freezeArray(errors),
    request: Object.freeze(clone(request)),
    consumerVersion: P03B7_MIXED_NUMBER_DOMAIN_NORMALIZATION_CONSUMER_VERSION,
    consumerMode: "PRODUCTION_DETERMINISTIC_MIXED_NUMBER_DOMAIN_NORMALIZATION",
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
    consumerVersion: P03B7_MIXED_NUMBER_DOMAIN_NORMALIZATION_CONSUMER_VERSION,
    consumerMode: "PRODUCTION_DETERMINISTIC_MIXED_NUMBER_DOMAIN_NORMALIZATION",
    productionAdmissionState: "PRODUCTION_ADMITTED",
    descriptor,
    result: Object.freeze(result),
  });
}

function buildDescriptor(row, authorities) {
  const errors = [];
  if (!row.w3CapabilityIds.includes(TARGET_CAPABILITY_ID)) {
    errors.push(`P03B7_KP_NOT_MIXED_DOMAIN_DEPENDENT:${row.knowledgePointId}`);
  }
  if (!Array.isArray(row.sourceNodeIds) || row.sourceNodeIds.length === 0) {
    errors.push(`P03B7_SOURCE_AUTHORITY_MISSING:${row.knowledgePointId}`);
  }

  const fractionNumberSystemDescriptor = authorities.fractionNumberSystem.getDescriptor(
    row.knowledgePointId,
  );
  const decimalNumberSystemDescriptor = authorities.decimalNumberSystem.getDescriptor(
    row.knowledgePointId,
  );
  const fractionDomainValidatorDescriptor = authorities.fractionDomainValidator.getDescriptor(
    row.knowledgePointId,
  );
  const decimalDomainValidatorDescriptor = authorities.decimalDomainValidator.getDescriptor(
    row.knowledgePointId,
  );

  if (!fractionNumberSystemDescriptor) {
    errors.push(`P03B7_FRACTION_NUMBER_SYSTEM_DESCRIPTOR_MISSING:${row.knowledgePointId}`);
  }
  if (!decimalNumberSystemDescriptor) {
    errors.push(`P03B7_DECIMAL_NUMBER_SYSTEM_DESCRIPTOR_MISSING:${row.knowledgePointId}`);
  }
  if (!fractionDomainValidatorDescriptor) {
    errors.push(`P03B7_FRACTION_DOMAIN_VALIDATOR_DESCRIPTOR_MISSING:${row.knowledgePointId}`);
  }
  if (!decimalDomainValidatorDescriptor) {
    errors.push(`P03B7_DECIMAL_DOMAIN_VALIDATOR_DESCRIPTOR_MISSING:${row.knowledgePointId}`);
  }
  if (errors.length > 0) return { descriptor: null, errors };

  return {
    errors: [],
    descriptor: Object.freeze({
      descriptorId: `p03b7mixed_${row.knowledgePointId.replace(/^kp_/, "")}`,
      knowledgePointId: row.knowledgePointId,
      canonicalNameZh: row.canonicalNameZh,
      capabilityStatement: row.capabilityStatement,
      reasoningInvariant: row.reasoningInvariant,
      sourceNodeIds: freezeArray(row.sourceNodeIds),
      assignedDeliveryWaveId: row.assignedDeliveryWaveId,
      baseDeliveryWaveId: row.baseDeliveryWaveId,
      directW3CohortMember: row.directW3CohortMember,
      directlyRequiresMixedNumberDomainNormalization:
        row.directlyRequiredW3CapabilityIds.includes(TARGET_CAPABILITY_ID),
      protectedExistingD0: row.protectedExistingD0,
      productProductionAdmitted: row.productProductionAdmitted,
      productGapState: row.productGapState,
      sourceDomains: Object.freeze(["FRACTION", "DECIMAL"]),
      targetDomains: Object.freeze(["FRACTION", "DECIMAL"]),
      allowedActions: Object.freeze([
        "TO_FRACTION",
        "TO_DECIMAL",
        "EQUIVALENCE",
        "COMPARE",
      ]),
      fractionNumberSystemDescriptorId: fractionNumberSystemDescriptor.descriptorId,
      decimalNumberSystemDescriptorId: decimalNumberSystemDescriptor.descriptorId,
      fractionDomainValidatorDescriptorId: fractionDomainValidatorDescriptor.descriptorId,
      decimalDomainValidatorDescriptorId: decimalDomainValidatorDescriptor.descriptorId,
      exactDecimalToFractionNormalization: true,
      exactTerminatingFractionToDecimalNormalization: true,
      crossDomainComparison: true,
      crossDomainEquivalence: true,
      recurringDecimalApproximationAllowed: false,
      floatingPointApproximationAllowed: false,
      arithmeticMutationAllowed: false,
      questionGenerationAllowed: false,
      productionAdmissionState: "PRODUCTION_ADMITTED",
    }),
  };
}

export function materializeP03B7MixedNumberDomainNormalizationConsumer() {
  const policy = readJson("mixed-number-domain-normalization-policy.json");
  const manifest = readJson("mixed-number-domain-normalization.manifest.json");
  const promotionRegistry = readJson("w3-capability-promotion-registry.json");
  const predecessorPromotionRegistry = readRepoJson(
    promotionRegistry.predecessorPromotionRegistryPath,
  );

  const fractionNumberSystem = materializeP03B1FractionNumberSystemConsumer();
  const decimalNumberSystem = materializeP03B2DecimalNumberSystemConsumer();
  const fractionDomainValidator = materializeP03B3FractionDomainValidator();
  const decimalDomainValidator = materializeP03B4DecimalDomainValidator();
  const fractionArithmetic = materializeP03B5FractionArithmeticConsumer();
  const decimalArithmetic = materializeP03B6DecimalArithmeticConsumer();
  const p03a = fractionNumberSystem.hardeningAuthority;
  const p03 = fractionNumberSystem.predecessorInventory;
  const queueEntry = p03a.getCapability(TARGET_CAPABILITY_ID);

  const dependentRows = p03.dependentKnowledgePointRows.filter((row) => (
    row.w3CapabilityIds.includes(TARGET_CAPABILITY_ID)
  ));
  const descriptorErrors = [];
  const descriptors = [];
  const authorities = {
    fractionNumberSystem,
    decimalNumberSystem,
    fractionDomainValidator,
    decimalDomainValidator,
  };
  for (const row of dependentRows) {
    const built = buildDescriptor(row, authorities);
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
    protectedExistingD0KnowledgePointCount: descriptors.filter(
      (row) => row.protectedExistingD0,
    ).length,
    newProductDependentKnowledgePointCount: descriptors.filter(
      (row) => !row.protectedExistingD0,
    ).length,
    directRequirementKnowledgePointCount: descriptors.filter(
      (row) => row.directlyRequiresMixedNumberDomainNormalization,
    ).length,
    dependentSourceNodeCount: dependentSourceNodeIds.length,
    sourceKnowledgePointBindingCount,
    predecessorFractionNumberSystemCoverageCount: descriptors.filter(
      (row) => row.fractionNumberSystemDescriptorId != null,
    ).length,
    predecessorDecimalNumberSystemCoverageCount: descriptors.filter(
      (row) => row.decimalNumberSystemDescriptorId != null,
    ).length,
    predecessorFractionDomainValidatorCoverageCount: descriptors.filter(
      (row) => row.fractionDomainValidatorDescriptorId != null,
    ).length,
    predecessorDecimalDomainValidatorCoverageCount: descriptors.filter(
      (row) => row.decimalDomainValidatorDescriptorId != null,
    ).length,
    descriptorErrorCount: descriptorErrors.length,
    allowedActionCount: policy.allowedActions.length,
    newPromotionCount: promotionRegistry.promotions.length,
    effectivePromotionCount: effectivePromotionCapabilityIds.length,
    remainingW3ContractCapabilityCount:
      promotionRegistry.remainingW3ContractCapabilityIds.length,
  });

  function validateFraction({ knowledgePointId, sourceNodeId, value, valuePolicy }) {
    const validated = fractionDomainValidator.execute({
      action: "VALIDATE_VALUE",
      knowledgePointId,
      sourceNodeId,
      value,
      valuePolicy,
      assertedCapabilityId: FRACTION_DOMAIN_VALIDATOR_CAPABILITY_ID,
    });
    if (!validated.ok) {
      return {
        ok: false,
        errors: validated.errors.map(
          (error) => `P03B7_FRACTION_VALIDATOR_REJECTED:${error}`,
        ),
      };
    }
    return {
      ok: true,
      canonical: validated.result.canonicalValue,
      rational: fractionCanonicalToRational(validated.result.canonicalValue),
    };
  }

  function validateDecimal({ knowledgePointId, sourceNodeId, value, valuePolicy }) {
    const validated = decimalDomainValidator.execute({
      action: "VALIDATE_VALUE",
      knowledgePointId,
      sourceNodeId,
      value,
      valuePolicy,
      assertedCapabilityId: DECIMAL_DOMAIN_VALIDATOR_CAPABILITY_ID,
    });
    if (!validated.ok) {
      return {
        ok: false,
        errors: validated.errors.map(
          (error) => `P03B7_DECIMAL_VALIDATOR_REJECTED:${error}`,
        ),
      };
    }
    return {
      ok: true,
      canonical: validated.result.canonicalValue,
      rational: decimalCanonicalToRational(validated.result.canonicalValue),
    };
  }

  function decimalToFraction({
    knowledgePointId,
    sourceNodeId,
    value,
    decimalPolicy,
    fractionPolicy,
  }) {
    const decimal = validateDecimal({
      knowledgePointId,
      sourceNodeId,
      value,
      valuePolicy: decimalPolicy,
    });
    if (!decimal.ok) return decimal;

    const reduced = reduceRational(
      BigInt(decimal.canonical.coefficient),
      pow10BigInt(decimal.canonical.scale),
    );
    const numerator = toSafeNumber(reduced.numerator, "P03B7_RESULT_OVERFLOW");
    if (!numerator.ok) return { ok: false, errors: [numerator.error] };
    const denominator = toSafeNumber(reduced.denominator, "P03B7_RESULT_OVERFLOW");
    if (!denominator.ok) return { ok: false, errors: [denominator.error] };

    const fraction = validateFraction({
      knowledgePointId,
      sourceNodeId,
      value: {
        numerator: numerator.value,
        denominator: denominator.value,
      },
      valuePolicy: fractionPolicy,
    });
    if (!fraction.ok) {
      return {
        ok: false,
        errors: fraction.errors.map(
          (error) => `P03B7_TARGET_VALIDATOR_REJECTED:${error}`,
        ),
      };
    }
    return {
      ok: true,
      sourceCanonical: decimal.canonical,
      targetCanonical: fraction.canonical,
      rational: reduced,
    };
  }

  function fractionToDecimal({
    knowledgePointId,
    sourceNodeId,
    value,
    fractionPolicy,
    decimalPolicy,
  }) {
    const fraction = validateFraction({
      knowledgePointId,
      sourceNodeId,
      value,
      valuePolicy: fractionPolicy,
    });
    if (!fraction.ok) return fraction;

    const numerator = BigInt(fraction.canonical.numerator);
    const denominator = BigInt(fraction.canonical.denominator);
    let remainder = denominator;
    let factorTwoCount = 0;
    let factorFiveCount = 0;
    while (remainder % 2n === 0n) {
      remainder /= 2n;
      factorTwoCount += 1;
    }
    while (remainder % 5n === 0n) {
      remainder /= 5n;
      factorFiveCount += 1;
    }
    if (remainder !== 1n) {
      return {
        ok: false,
        errors: [
          `P03B7_NON_TERMINATING_DECIMAL:${fraction.canonical.numerator}/${fraction.canonical.denominator}`,
        ],
      };
    }

    const scale = Math.max(factorTwoCount, factorFiveCount);
    const coefficient = numerator
      * powBigInt(2, scale - factorTwoCount)
      * powBigInt(5, scale - factorFiveCount);
    if (scale > policy.limits.maximumDecimalScale
      || coefficient.toString().length > policy.limits.maximumDecimalDigits) {
      return {
        ok: false,
        errors: [
          `P03B7_RESULT_OVERFLOW:${coefficient.toString()}:${scale}`,
        ],
      };
    }

    const decimal = validateDecimal({
      knowledgePointId,
      sourceNodeId,
      value: {
        coefficient: coefficient.toString(),
        scale,
      },
      valuePolicy: decimalPolicy,
    });
    if (!decimal.ok) {
      return {
        ok: false,
        errors: decimal.errors.map(
          (error) => `P03B7_TARGET_VALIDATOR_REJECTED:${error}`,
        ),
      };
    }
    return {
      ok: true,
      sourceCanonical: fraction.canonical,
      targetCanonical: decimal.canonical,
      rational: fraction.rational,
      termination: Object.freeze({
        factorTwoCount,
        factorFiveCount,
        canonicalScale: decimal.canonical.scale,
      }),
    };
  }

  function normalizeByDomain({
    knowledgePointId,
    sourceNodeId,
    domain,
    value,
    fractionPolicy,
    decimalPolicy,
  }) {
    if (domain === "FRACTION") {
      const normalized = validateFraction({
        knowledgePointId,
        sourceNodeId,
        value,
        valuePolicy: fractionPolicy,
      });
      if (!normalized.ok) return normalized;
      return { ...normalized, domain };
    }
    if (domain === "DECIMAL") {
      const normalized = validateDecimal({
        knowledgePointId,
        sourceNodeId,
        value,
        valuePolicy: decimalPolicy,
      });
      if (!normalized.ok) return normalized;
      return { ...normalized, domain };
    }
    return {
      ok: false,
      errors: [`P03B7_SOURCE_DOMAIN_INVALID:${String(domain)}`],
    };
  }

  function execute({
    action = "TO_FRACTION",
    knowledgePointId = null,
    sourceNodeId = null,
    sourceDomain = null,
    value = null,
    leftDomain = null,
    leftValue = null,
    rightDomain = null,
    rightValue = null,
    fractionPolicy = null,
    decimalPolicy = null,
    assertedCapabilityId = null,
  } = {}) {
    const request = {
      action,
      knowledgePointId,
      sourceNodeId,
      sourceDomain,
      value: clone(value),
      leftDomain,
      leftValue: clone(leftValue),
      rightDomain,
      rightValue: clone(rightValue),
      fractionPolicy: clone(fractionPolicy),
      decimalPolicy: clone(decimalPolicy),
      assertedCapabilityId,
    };
    const errors = [];

    if (typeof knowledgePointId !== "string" || knowledgePointId.length === 0) {
      errors.push("P03B7_KP_ID_REQUIRED");
    }
    const descriptor = descriptorByKnowledgePointId.get(knowledgePointId) ?? null;
    if (knowledgePointId && !p03.getRow(knowledgePointId)) {
      errors.push(`P03B7_UNKNOWN_KNOWLEDGE_POINT:${knowledgePointId}`);
    } else if (knowledgePointId && !descriptor) {
      errors.push(`P03B7_KP_NOT_MIXED_DOMAIN_DEPENDENT:${knowledgePointId}`);
    }
    if (descriptor && sourceNodeId && !descriptor.sourceNodeIds.includes(sourceNodeId)) {
      errors.push(`P03B7_SOURCE_KP_MISMATCH:${knowledgePointId}:${sourceNodeId}`);
    }
    if (assertedCapabilityId && assertedCapabilityId !== TARGET_CAPABILITY_ID) {
      errors.push(`P03B7_CAPABILITY_ASSERTION_MISMATCH:${assertedCapabilityId}`);
    }
    if (!policy.allowedActions.includes(action)) {
      errors.push(`P03B7_ACTION_INVALID:${action}`);
    }
    if (errors.length > 0) return blockedResult(request, errors);

    if (action === "TO_FRACTION") {
      if (sourceDomain !== "DECIMAL") {
        return blockedResult(request, [
          `P03B7_SOURCE_DOMAIN_INVALID:TO_FRACTION:${String(sourceDomain)}`,
        ]);
      }
      if (value == null) return blockedResult(request, ["P03B7_VALUE_REQUIRED"]);
      const converted = decimalToFraction({
        knowledgePointId,
        sourceNodeId,
        value,
        decimalPolicy,
        fractionPolicy,
      });
      if (!converted.ok) return blockedResult(request, converted.errors);
      return successResult(request, descriptor, {
        action,
        sourceDomain: "DECIMAL",
        targetDomain: "FRACTION",
        sourceCanonicalValue: converted.sourceCanonical,
        canonicalValue: converted.targetCanonical,
        canonicalRationalIdentity: rationalIdentity(converted.rational),
        exact: true,
      });
    }

    if (action === "TO_DECIMAL") {
      if (sourceDomain !== "FRACTION") {
        return blockedResult(request, [
          `P03B7_SOURCE_DOMAIN_INVALID:TO_DECIMAL:${String(sourceDomain)}`,
        ]);
      }
      if (value == null) return blockedResult(request, ["P03B7_VALUE_REQUIRED"]);
      const converted = fractionToDecimal({
        knowledgePointId,
        sourceNodeId,
        value,
        fractionPolicy,
        decimalPolicy,
      });
      if (!converted.ok) return blockedResult(request, converted.errors);
      return successResult(request, descriptor, {
        action,
        sourceDomain: "FRACTION",
        targetDomain: "DECIMAL",
        sourceCanonicalValue: converted.sourceCanonical,
        canonicalValue: converted.targetCanonical,
        canonicalRationalIdentity: rationalIdentity(converted.rational),
        termination: converted.termination,
        exact: true,
      });
    }

    if (leftValue == null) return blockedResult(request, ["P03B7_LEFT_VALUE_REQUIRED"]);
    if (rightValue == null) return blockedResult(request, ["P03B7_RIGHT_VALUE_REQUIRED"]);
    if (!policy.scope.sourceDomains.includes(leftDomain)
      || !policy.scope.sourceDomains.includes(rightDomain)) {
      return blockedResult(request, [
        `P03B7_SOURCE_DOMAIN_INVALID:${String(leftDomain)}:${String(rightDomain)}`,
      ]);
    }
    if (leftDomain === rightDomain) {
      return blockedResult(request, [
        `P03B7_CROSS_DOMAIN_REQUIRED:${leftDomain}:${rightDomain}`,
      ]);
    }

    const left = normalizeByDomain({
      knowledgePointId,
      sourceNodeId,
      domain: leftDomain,
      value: leftValue,
      fractionPolicy,
      decimalPolicy,
    });
    if (!left.ok) return blockedResult(request, left.errors);
    const right = normalizeByDomain({
      knowledgePointId,
      sourceNodeId,
      domain: rightDomain,
      value: rightValue,
      fractionPolicy,
      decimalPolicy,
    });
    if (!right.ok) return blockedResult(request, right.errors);

    const comparison = compareRational(left.rational, right.rational);
    const relation = relationForComparison(comparison);
    const commonResult = {
      action,
      leftDomain,
      rightDomain,
      leftCanonicalValue: left.canonical,
      rightCanonicalValue: right.canonical,
      leftCanonicalRationalIdentity: rationalIdentity(left.rational),
      rightCanonicalRationalIdentity: rationalIdentity(right.rational),
      comparison,
      relation,
      exact: true,
    };
    if (action === "EQUIVALENCE") {
      return successResult(request, descriptor, {
        ...commonResult,
        equivalent: comparison === 0,
      });
    }
    return successResult(request, descriptor, commonResult);
  }

  return Object.freeze({
    schemaName: manifest.schemaName,
    schemaVersion: manifest.schemaVersion,
    programId: manifest.programId,
    taskId: manifest.taskId,
    status: manifest.status,
    version: P03B7_MIXED_NUMBER_DOMAIN_NORMALIZATION_CONSUMER_VERSION,
    policy: Object.freeze(policy),
    manifest: Object.freeze(manifest),
    promotionRegistry: Object.freeze(promotionRegistry),
    predecessorPromotionRegistry: Object.freeze(predecessorPromotionRegistry),
    fractionNumberSystem,
    decimalNumberSystem,
    fractionDomainValidator,
    decimalDomainValidator,
    fractionArithmetic,
    decimalArithmetic,
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

export function executeP03B7MixedNumberDomainNormalization(request) {
  return materializeP03B7MixedNumberDomainNormalizationConsumer().execute(request);
}
