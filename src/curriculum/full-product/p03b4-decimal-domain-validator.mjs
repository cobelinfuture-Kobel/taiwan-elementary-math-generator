import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP03B2DecimalNumberSystemConsumer } from "./p03b2-decimal-number-system-consumer.mjs";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../../..");
const P03B4_DIR = path.join(ROOT, "data/curriculum/full-product/p03b4");
const TARGET_CAPABILITY_ID = "cap_decimal_domain_validator";
const NUMBER_SYSTEM_CAPABILITY_ID = "cap_decimal_number_system";

export const P03B4_DECIMAL_DOMAIN_VALIDATOR_VERSION =
  "p03b4-decimal-domain-validator-v1";

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(P03B4_DIR, fileName), "utf8"));
}

function readRepoJson(repoPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, repoPath), "utf8"));
}

function freezeArray(values) {
  return Object.freeze([...values]);
}

function unique(values) {
  return [...new Set((values ?? []).filter((value) => value !== null && value !== undefined))];
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function isNonNegativeSafeInteger(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

function isPositiveSafeInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

function pow10(exponent) {
  return 10n ** BigInt(exponent);
}

function compareCanonical(left, right) {
  const commonScale = Math.max(left.scale, right.scale);
  const leftScaled = BigInt(left.coefficient) * pow10(commonScale - left.scale);
  const rightScaled = BigInt(right.coefficient) * pow10(commonScale - right.scale);
  if (leftScaled < rightScaled) return -1;
  if (leftScaled > rightScaled) return 1;
  return 0;
}

function relationForComparison(comparison) {
  if (comparison < 0) return "LESS_THAN";
  if (comparison > 0) return "GREATER_THAN";
  return "EQUAL";
}

function relationSatisfied(comparison, requiredRelation) {
  switch (requiredRelation) {
    case "EQUAL": return comparison === 0;
    case "NOT_EQUAL": return comparison !== 0;
    case "LESS_THAN": return comparison < 0;
    case "LESS_THAN_OR_EQUAL": return comparison <= 0;
    case "GREATER_THAN": return comparison > 0;
    case "GREATER_THAN_OR_EQUAL": return comparison >= 0;
    default: return false;
  }
}

function canonicalIdentity(canonical) {
  return `${canonical.coefficient}e-${canonical.scale}`;
}

function blockedResult(request, errors) {
  return Object.freeze({
    ok: false,
    valid: false,
    blocked: true,
    errors: freezeArray(errors),
    request: Object.freeze(clone(request)),
    validatorVersion: P03B4_DECIMAL_DOMAIN_VALIDATOR_VERSION,
    validatorMode: "PRODUCTION_DETERMINISTIC_DECIMAL_DOMAIN_VALIDATOR",
    productionAdmissionState: "PRODUCTION_ADMITTED",
    descriptor: null,
    result: null,
  });
}

function successResult(request, descriptor, result) {
  return Object.freeze({
    ok: true,
    valid: true,
    blocked: false,
    errors: Object.freeze([]),
    request: Object.freeze(clone(request)),
    validatorVersion: P03B4_DECIMAL_DOMAIN_VALIDATOR_VERSION,
    validatorMode: "PRODUCTION_DETERMINISTIC_DECIMAL_DOMAIN_VALIDATOR",
    productionAdmissionState: "PRODUCTION_ADMITTED",
    descriptor,
    result: Object.freeze(result),
  });
}

function buildDescriptor(row, decimalNumberSystem) {
  const errors = [];
  if (!row.w3CapabilityIds.includes(TARGET_CAPABILITY_ID)) {
    errors.push(`P03B4_KP_NOT_DECIMAL_DOMAIN_VALIDATOR_DEPENDENT:${row.knowledgePointId}`);
  }
  if (!Array.isArray(row.sourceNodeIds) || row.sourceNodeIds.length === 0) {
    errors.push(`P03B4_SOURCE_AUTHORITY_MISSING:${row.knowledgePointId}`);
  }
  const numberSystemDescriptor = decimalNumberSystem.getDescriptor(row.knowledgePointId);
  if (!numberSystemDescriptor) {
    errors.push(`P03B4_NUMBER_SYSTEM_DESCRIPTOR_MISSING:${row.knowledgePointId}`);
  }
  if (errors.length > 0) return { descriptor: null, errors };

  return {
    errors: [],
    descriptor: Object.freeze({
      descriptorId: `p03b4decval_${row.knowledgePointId.replace(/^kp_/, "")}`,
      knowledgePointId: row.knowledgePointId,
      canonicalNameZh: row.canonicalNameZh,
      capabilityStatement: row.capabilityStatement,
      reasoningInvariant: row.reasoningInvariant,
      sourceNodeIds: freezeArray(row.sourceNodeIds),
      assignedDeliveryWaveId: row.assignedDeliveryWaveId,
      baseDeliveryWaveId: row.baseDeliveryWaveId,
      directW3CohortMember: row.directW3CohortMember,
      directlyRequiresDecimalDomainValidator: row.directlyRequiredW3CapabilityIds.includes(
        TARGET_CAPABILITY_ID,
      ),
      protectedExistingD0: row.protectedExistingD0,
      productProductionAdmitted: row.productProductionAdmitted,
      productGapState: row.productGapState,
      numericDomainId: "NON_NEGATIVE_DECIMAL",
      numberSystemCapabilityId: NUMBER_SYSTEM_CAPABILITY_ID,
      numberSystemDescriptorId: numberSystemDescriptor.descriptorId,
      allowedActions: Object.freeze(["VALIDATE_VALUE", "VALIDATE_PAIR", "VALIDATE_SET"]),
      exactCanonicalConstraintValidation: true,
      exactPairRelationValidation: true,
      canonicalSetValidation: true,
      arithmeticAllowed: false,
      fractionConversionAllowed: false,
      crossDomainNormalizationAllowed: false,
      questionGenerationAllowed: false,
      productionAdmissionState: "PRODUCTION_ADMITTED",
    }),
  };
}

export function materializeP03B4DecimalDomainValidator() {
  const policy = readJson("decimal-domain-validator-policy.json");
  const manifest = readJson("decimal-domain-validator.manifest.json");
  const promotionRegistry = readJson("w3-capability-promotion-registry.json");
  const predecessorPromotionRegistry = readRepoJson(
    promotionRegistry.predecessorPromotionRegistryPath,
  );
  const decimalNumberSystem = materializeP03B2DecimalNumberSystemConsumer();
  const p03a = decimalNumberSystem.hardeningAuthority;
  const p03 = decimalNumberSystem.predecessorInventory;
  const queueEntry = p03a.getCapability(TARGET_CAPABILITY_ID);

  const dependentRows = p03.dependentKnowledgePointRows.filter((row) => (
    row.w3CapabilityIds.includes(TARGET_CAPABILITY_ID)
  ));
  const descriptorErrors = [];
  const descriptors = [];
  for (const row of dependentRows) {
    const built = buildDescriptor(row, decimalNumberSystem);
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
      (row) => row.directlyRequiresDecimalDomainValidator,
    ).length,
    dependentSourceNodeCount: dependentSourceNodeIds.length,
    sourceKnowledgePointBindingCount,
    predecessorNumberSystemCoverageCount,
    descriptorErrorCount: descriptorErrors.length,
    allowedActionCount: policy.allowedActions.length,
    allowedRelationCount: policy.allowedRelations.length,
    newPromotionCount: promotionRegistry.promotions.length,
    effectivePromotionCount: effectivePromotionCapabilityIds.length,
    remainingW3ContractCapabilityCount: promotionRegistry.remainingW3ContractCapabilityIds.length,
  });

  function normalizeThroughNumberSystem({ knowledgePointId, sourceNodeId, value }) {
    const normalized = decimalNumberSystem.execute({
      action: "NORMALIZE",
      knowledgePointId,
      sourceNodeId,
      value,
      assertedCapabilityId: NUMBER_SYSTEM_CAPABILITY_ID,
    });
    if (!normalized.ok) {
      return {
        ok: false,
        errors: normalized.errors.map((error) => `P03B4_NUMBER_SYSTEM_REJECTED:${error}`),
      };
    }
    return { ok: true, canonical: normalized.result.canonicalValue };
  }

  function normalizeValuePolicy({ knowledgePointId, sourceNodeId, valuePolicy }) {
    if (valuePolicy == null) {
      return {
        ok: true,
        policy: Object.freeze({
          allowedMagnitudeClasses: freezeArray(policy.allowedMagnitudeClasses),
          allowZero: true,
          minimumCanonical: null,
          maximumCanonical: null,
          maxCanonicalCoefficientDigits: null,
          maxCanonicalScale: null,
          allowedCanonicalScales: null,
        }),
      };
    }
    if (!isPlainObject(valuePolicy)) {
      return { ok: false, errors: ["P03B4_VALUE_POLICY_INVALID:NOT_OBJECT"] };
    }
    const unknownKeys = Object.keys(valuePolicy).filter(
      (key) => !policy.valuePolicyKeys.includes(key),
    );
    if (unknownKeys.length > 0) {
      return { ok: false, errors: [`P03B4_VALUE_POLICY_INVALID:UNKNOWN_KEYS:${unknownKeys.join(",")}`] };
    }

    let allowedMagnitudeClasses = policy.allowedMagnitudeClasses;
    if (Object.hasOwn(valuePolicy, "allowedMagnitudeClasses")) {
      if (!Array.isArray(valuePolicy.allowedMagnitudeClasses)
        || valuePolicy.allowedMagnitudeClasses.length === 0
        || valuePolicy.allowedMagnitudeClasses.some(
          (item) => !policy.allowedMagnitudeClasses.includes(item),
        )) {
        return { ok: false, errors: ["P03B4_VALUE_POLICY_INVALID:MAGNITUDE_CLASSES"] };
      }
      allowedMagnitudeClasses = unique(valuePolicy.allowedMagnitudeClasses);
    }

    const allowZero = Object.hasOwn(valuePolicy, "allowZero") ? valuePolicy.allowZero : true;
    if (typeof allowZero !== "boolean") {
      return { ok: false, errors: ["P03B4_VALUE_POLICY_INVALID:ALLOW_ZERO"] };
    }

    const maxCanonicalCoefficientDigits = valuePolicy.maxCanonicalCoefficientDigits ?? null;
    if (maxCanonicalCoefficientDigits != null
      && (!isPositiveSafeInteger(maxCanonicalCoefficientDigits)
        || maxCanonicalCoefficientDigits > policy.limits.maximumCanonicalCoefficientDigits)) {
      return { ok: false, errors: ["P03B4_VALUE_POLICY_INVALID:MAX_COEFFICIENT_DIGITS"] };
    }

    const maxCanonicalScale = valuePolicy.maxCanonicalScale ?? null;
    if (maxCanonicalScale != null
      && (!isNonNegativeSafeInteger(maxCanonicalScale)
        || maxCanonicalScale > policy.limits.maximumCanonicalScale)) {
      return { ok: false, errors: ["P03B4_VALUE_POLICY_INVALID:MAX_SCALE"] };
    }

    let allowedCanonicalScales = null;
    if (Object.hasOwn(valuePolicy, "allowedCanonicalScales")) {
      if (!Array.isArray(valuePolicy.allowedCanonicalScales)
        || valuePolicy.allowedCanonicalScales.length === 0
        || valuePolicy.allowedCanonicalScales.some(
          (scale) => !isNonNegativeSafeInteger(scale)
            || scale > policy.limits.maximumCanonicalScale,
        )) {
        return { ok: false, errors: ["P03B4_VALUE_POLICY_INVALID:ALLOWED_SCALES"] };
      }
      allowedCanonicalScales = unique(valuePolicy.allowedCanonicalScales).sort((a, b) => a - b);
    }

    let minimumCanonical = null;
    if (Object.hasOwn(valuePolicy, "minimumValue")) {
      const minimum = normalizeThroughNumberSystem({
        knowledgePointId,
        sourceNodeId,
        value: valuePolicy.minimumValue,
      });
      if (!minimum.ok) return minimum;
      minimumCanonical = minimum.canonical;
    }

    let maximumCanonical = null;
    if (Object.hasOwn(valuePolicy, "maximumValue")) {
      const maximum = normalizeThroughNumberSystem({
        knowledgePointId,
        sourceNodeId,
        value: valuePolicy.maximumValue,
      });
      if (!maximum.ok) return maximum;
      maximumCanonical = maximum.canonical;
    }

    if (minimumCanonical && maximumCanonical
      && compareCanonical(minimumCanonical, maximumCanonical) > 0) {
      return { ok: false, errors: ["P03B4_VALUE_POLICY_INVALID:MINIMUM_EXCEEDS_MAXIMUM"] };
    }

    return {
      ok: true,
      policy: Object.freeze({
        allowedMagnitudeClasses: freezeArray(allowedMagnitudeClasses),
        allowZero,
        minimumCanonical,
        maximumCanonical,
        maxCanonicalCoefficientDigits,
        maxCanonicalScale,
        allowedCanonicalScales: allowedCanonicalScales == null
          ? null
          : freezeArray(allowedCanonicalScales),
      }),
    };
  }

  function validateCanonical(canonical, normalizedPolicy) {
    const errors = [];
    if (!normalizedPolicy.allowedMagnitudeClasses.includes(canonical.magnitudeClass)) {
      errors.push(`P03B4_MAGNITUDE_CLASS_NOT_ALLOWED:${canonical.magnitudeClass}`);
    }
    if (!normalizedPolicy.allowZero && canonical.coefficient === "0") {
      errors.push("P03B4_ZERO_FORBIDDEN");
    }
    if (normalizedPolicy.maxCanonicalCoefficientDigits != null
      && canonical.coefficient.length > normalizedPolicy.maxCanonicalCoefficientDigits) {
      errors.push(`P03B4_COEFFICIENT_DIGIT_LIMIT_EXCEEDED:${canonical.coefficient.length}`);
    }
    if (normalizedPolicy.maxCanonicalScale != null
      && canonical.scale > normalizedPolicy.maxCanonicalScale) {
      errors.push(`P03B4_SCALE_LIMIT_EXCEEDED:${canonical.scale}`);
    }
    if (normalizedPolicy.allowedCanonicalScales != null
      && !normalizedPolicy.allowedCanonicalScales.includes(canonical.scale)) {
      errors.push(`P03B4_SCALE_NOT_ALLOWED:${canonical.scale}`);
    }
    if (normalizedPolicy.minimumCanonical
      && compareCanonical(canonical, normalizedPolicy.minimumCanonical) < 0) {
      errors.push("P03B4_MINIMUM_VALUE_VIOLATION");
    }
    if (normalizedPolicy.maximumCanonical
      && compareCanonical(canonical, normalizedPolicy.maximumCanonical) > 0) {
      errors.push("P03B4_MAXIMUM_VALUE_VIOLATION");
    }
    return errors;
  }

  function normalizeSetPolicy(setPolicy) {
    if (setPolicy == null) {
      return {
        ok: true,
        policy: Object.freeze({
          minCount: 1,
          maxCount: policy.limits.maximumSetSize,
          uniqueCanonicalValues: false,
        }),
      };
    }
    if (!isPlainObject(setPolicy)) {
      return { ok: false, errors: ["P03B4_SET_POLICY_INVALID:NOT_OBJECT"] };
    }
    const unknownKeys = Object.keys(setPolicy).filter(
      (key) => !policy.setPolicyKeys.includes(key),
    );
    if (unknownKeys.length > 0) {
      return { ok: false, errors: [`P03B4_SET_POLICY_INVALID:UNKNOWN_KEYS:${unknownKeys.join(",")}`] };
    }
    const minCount = setPolicy.minCount ?? 1;
    const maxCount = setPolicy.maxCount ?? policy.limits.maximumSetSize;
    const uniqueCanonicalValues = setPolicy.uniqueCanonicalValues ?? false;
    if (!isPositiveSafeInteger(minCount)
      || !isPositiveSafeInteger(maxCount)
      || minCount > maxCount
      || maxCount > policy.limits.maximumSetSize
      || typeof uniqueCanonicalValues !== "boolean") {
      return { ok: false, errors: ["P03B4_SET_POLICY_INVALID:LIMITS"] };
    }
    return { ok: true, policy: Object.freeze({ minCount, maxCount, uniqueCanonicalValues }) };
  }

  function execute({
    action = "VALIDATE_VALUE",
    knowledgePointId = null,
    sourceNodeId = null,
    value = null,
    otherValue = null,
    values = null,
    valuePolicy = null,
    requiredRelation = null,
    setPolicy = null,
    assertedCapabilityId = null,
  } = {}) {
    const request = {
      action,
      knowledgePointId,
      sourceNodeId,
      value: clone(value),
      otherValue: clone(otherValue),
      values: clone(values),
      valuePolicy: clone(valuePolicy),
      requiredRelation,
      setPolicy: clone(setPolicy),
      assertedCapabilityId,
    };
    const errors = [];

    if (typeof knowledgePointId !== "string" || knowledgePointId.length === 0) {
      errors.push("P03B4_KP_ID_REQUIRED");
    }
    const descriptor = descriptorByKnowledgePointId.get(knowledgePointId) ?? null;
    if (knowledgePointId && !p03.getRow(knowledgePointId)) {
      errors.push(`P03B4_UNKNOWN_KNOWLEDGE_POINT:${knowledgePointId}`);
    } else if (knowledgePointId && !descriptor) {
      errors.push(`P03B4_KP_NOT_DECIMAL_DOMAIN_VALIDATOR_DEPENDENT:${knowledgePointId}`);
    }
    if (descriptor && sourceNodeId && !descriptor.sourceNodeIds.includes(sourceNodeId)) {
      errors.push(`P03B4_SOURCE_KP_MISMATCH:${knowledgePointId}:${sourceNodeId}`);
    }
    if (assertedCapabilityId && assertedCapabilityId !== TARGET_CAPABILITY_ID) {
      errors.push(`P03B4_CAPABILITY_ASSERTION_MISMATCH:${assertedCapabilityId}`);
    }
    if (!policy.allowedActions.includes(action)) {
      errors.push(`P03B4_ACTION_INVALID:${action}`);
    }
    if (errors.length > 0) return blockedResult(request, errors);

    const normalizedValuePolicy = normalizeValuePolicy({
      knowledgePointId,
      sourceNodeId,
      valuePolicy,
    });
    if (!normalizedValuePolicy.ok) {
      return blockedResult(request, normalizedValuePolicy.errors);
    }

    if (action === "VALIDATE_VALUE") {
      if (value == null) return blockedResult(request, ["P03B4_VALUE_REQUIRED"]);
      const normalized = normalizeThroughNumberSystem({ knowledgePointId, sourceNodeId, value });
      if (!normalized.ok) return blockedResult(request, normalized.errors);
      const domainErrors = validateCanonical(normalized.canonical, normalizedValuePolicy.policy);
      if (domainErrors.length > 0) return blockedResult(request, domainErrors);
      return successResult(request, descriptor, {
        action,
        canonicalValue: normalized.canonical,
        canonicalIdentity: canonicalIdentity(normalized.canonical),
        valuePolicy: normalizedValuePolicy.policy,
      });
    }

    if (action === "VALIDATE_PAIR") {
      if (value == null) return blockedResult(request, ["P03B4_VALUE_REQUIRED"]);
      if (otherValue == null) return blockedResult(request, ["P03B4_OTHER_VALUE_REQUIRED"]);
      if (requiredRelation != null && !policy.allowedRelations.includes(requiredRelation)) {
        return blockedResult(request, [`P03B4_RELATION_INVALID:${String(requiredRelation)}`]);
      }
      const left = normalizeThroughNumberSystem({ knowledgePointId, sourceNodeId, value });
      if (!left.ok) return blockedResult(request, left.errors);
      const right = normalizeThroughNumberSystem({
        knowledgePointId,
        sourceNodeId,
        value: otherValue,
      });
      if (!right.ok) return blockedResult(request, right.errors);
      const pairErrors = unique([
        ...validateCanonical(left.canonical, normalizedValuePolicy.policy),
        ...validateCanonical(right.canonical, normalizedValuePolicy.policy),
      ]);
      if (pairErrors.length > 0) return blockedResult(request, pairErrors);
      const comparison = compareCanonical(left.canonical, right.canonical);
      const actualRelation = relationForComparison(comparison);
      if (requiredRelation != null && !relationSatisfied(comparison, requiredRelation)) {
        return blockedResult(request, [
          `P03B4_RELATION_MISMATCH:${requiredRelation}:${actualRelation}`,
        ]);
      }
      return successResult(request, descriptor, {
        action,
        leftCanonicalValue: left.canonical,
        rightCanonicalValue: right.canonical,
        comparison,
        relation: actualRelation,
        requiredRelation,
        relationSatisfied: requiredRelation == null ? null : true,
      });
    }

    if (!Array.isArray(values) || values.length === 0) {
      return blockedResult(request, ["P03B4_VALUES_REQUIRED"]);
    }
    const normalizedSetPolicy = normalizeSetPolicy(setPolicy);
    if (!normalizedSetPolicy.ok) {
      return blockedResult(request, normalizedSetPolicy.errors);
    }
    if (values.length < normalizedSetPolicy.policy.minCount
      || values.length > normalizedSetPolicy.policy.maxCount) {
      return blockedResult(request, [
        `P03B4_SET_SIZE_INVALID:${values.length}:${normalizedSetPolicy.policy.minCount}:${normalizedSetPolicy.policy.maxCount}`,
      ]);
    }

    const canonicalValues = [];
    const setErrors = [];
    for (const item of values) {
      const normalized = normalizeThroughNumberSystem({
        knowledgePointId,
        sourceNodeId,
        value: item,
      });
      if (!normalized.ok) {
        setErrors.push(...normalized.errors);
        continue;
      }
      setErrors.push(...validateCanonical(normalized.canonical, normalizedValuePolicy.policy));
      canonicalValues.push(normalized.canonical);
    }
    if (setErrors.length > 0) return blockedResult(request, unique(setErrors));

    const identities = canonicalValues.map(canonicalIdentity);
    const uniqueIdentities = unique(identities);
    if (normalizedSetPolicy.policy.uniqueCanonicalValues
      && uniqueIdentities.length !== identities.length) {
      return blockedResult(request, ["P03B4_DUPLICATE_CANONICAL_VALUE"]);
    }
    return successResult(request, descriptor, {
      action,
      canonicalValues: freezeArray(canonicalValues),
      canonicalIdentities: freezeArray(identities),
      uniqueCanonicalValueCount: uniqueIdentities.length,
      setPolicy: normalizedSetPolicy.policy,
    });
  }

  return Object.freeze({
    schemaName: manifest.schemaName,
    schemaVersion: manifest.schemaVersion,
    programId: manifest.programId,
    taskId: manifest.taskId,
    status: manifest.status,
    version: P03B4_DECIMAL_DOMAIN_VALIDATOR_VERSION,
    policy: Object.freeze(policy),
    manifest: Object.freeze(manifest),
    promotionRegistry: Object.freeze(promotionRegistry),
    predecessorPromotionRegistry: Object.freeze(predecessorPromotionRegistry),
    decimalNumberSystem,
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

export function executeP03B4DecimalDomainValidation(request) {
  return materializeP03B4DecimalDomainValidator().execute(request);
}
