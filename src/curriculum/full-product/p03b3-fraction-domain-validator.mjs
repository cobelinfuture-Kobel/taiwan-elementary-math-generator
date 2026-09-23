import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP03B1FractionNumberSystemConsumer } from "./p03b1-fraction-number-system-consumer.mjs";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../../..");
const P03B3_DIR = path.join(ROOT, "data/curriculum/full-product/p03b3");
const TARGET_CAPABILITY_ID = "cap_fraction_domain_validator";
const NUMBER_SYSTEM_CAPABILITY_ID = "cap_fraction_number_system";

export const P03B3_FRACTION_DOMAIN_VALIDATOR_VERSION =
  "p03b3-fraction-domain-validator-v1";

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(P03B3_DIR, fileName), "utf8"));
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

function isPlainObject(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function isNonNegativeSafeInteger(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

function isPositiveSafeInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

function compareCanonical(left, right) {
  const leftCross = BigInt(left.numerator) * BigInt(right.denominator);
  const rightCross = BigInt(right.numerator) * BigInt(left.denominator);
  if (leftCross < rightCross) return -1;
  if (leftCross > rightCross) return 1;
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
  return `${canonical.numerator}/${canonical.denominator}`;
}

function blockedResult(request, errors) {
  return Object.freeze({
    ok: false,
    valid: false,
    blocked: true,
    errors: freezeArray(errors),
    request: Object.freeze(clone(request)),
    validatorVersion: P03B3_FRACTION_DOMAIN_VALIDATOR_VERSION,
    validatorMode: "PRODUCTION_DETERMINISTIC_FRACTION_DOMAIN_VALIDATOR",
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
    validatorVersion: P03B3_FRACTION_DOMAIN_VALIDATOR_VERSION,
    validatorMode: "PRODUCTION_DETERMINISTIC_FRACTION_DOMAIN_VALIDATOR",
    productionAdmissionState: "PRODUCTION_ADMITTED",
    descriptor,
    result: Object.freeze(result),
  });
}

function buildDescriptor(row, fractionNumberSystem) {
  const errors = [];
  if (!row.w3CapabilityIds.includes(TARGET_CAPABILITY_ID)) {
    errors.push(`P03B3_KP_NOT_FRACTION_DOMAIN_VALIDATOR_DEPENDENT:${row.knowledgePointId}`);
  }
  if (!Array.isArray(row.sourceNodeIds) || row.sourceNodeIds.length === 0) {
    errors.push(`P03B3_SOURCE_AUTHORITY_MISSING:${row.knowledgePointId}`);
  }
  const numberSystemDescriptor = fractionNumberSystem.getDescriptor(row.knowledgePointId);
  if (!numberSystemDescriptor) {
    errors.push(`P03B3_NUMBER_SYSTEM_DESCRIPTOR_MISSING:${row.knowledgePointId}`);
  }
  if (errors.length > 0) return { descriptor: null, errors };

  return {
    errors: [],
    descriptor: Object.freeze({
      descriptorId: `p03b3fracval_${row.knowledgePointId.replace(/^kp_/, "")}`,
      knowledgePointId: row.knowledgePointId,
      canonicalNameZh: row.canonicalNameZh,
      capabilityStatement: row.capabilityStatement,
      reasoningInvariant: row.reasoningInvariant,
      sourceNodeIds: freezeArray(row.sourceNodeIds),
      assignedDeliveryWaveId: row.assignedDeliveryWaveId,
      baseDeliveryWaveId: row.baseDeliveryWaveId,
      directW3CohortMember: row.directW3CohortMember,
      directlyRequiresFractionDomainValidator: row.directlyRequiredW3CapabilityIds.includes(
        TARGET_CAPABILITY_ID,
      ),
      protectedExistingD0: row.protectedExistingD0,
      productProductionAdmitted: row.productProductionAdmitted,
      productGapState: row.productGapState,
      numericDomainId: "NON_NEGATIVE_RATIONAL",
      numberSystemCapabilityId: NUMBER_SYSTEM_CAPABILITY_ID,
      numberSystemDescriptorId: numberSystemDescriptor.descriptorId,
      allowedActions: Object.freeze(["VALIDATE_VALUE", "VALIDATE_PAIR", "VALIDATE_SET"]),
      exactCanonicalConstraintValidation: true,
      exactPairRelationValidation: true,
      canonicalSetValidation: true,
      arithmeticAllowed: false,
      decimalConversionAllowed: false,
      crossDomainNormalizationAllowed: false,
      questionGenerationAllowed: false,
      productionAdmissionState: "PRODUCTION_ADMITTED",
    }),
  };
}

export function materializeP03B3FractionDomainValidator() {
  const policy = readJson("fraction-domain-validator-policy.json");
  const manifest = readJson("fraction-domain-validator.manifest.json");
  const promotionRegistry = readJson("w3-capability-promotion-registry.json");
  const predecessorPromotionRegistry = readRepoJson(
    promotionRegistry.predecessorPromotionRegistryPath,
  );
  const fractionNumberSystem = materializeP03B1FractionNumberSystemConsumer();
  const p03a = fractionNumberSystem.hardeningAuthority;
  const p03 = fractionNumberSystem.predecessorInventory;
  const queueEntry = p03a.getCapability(TARGET_CAPABILITY_ID);

  const dependentRows = p03.dependentKnowledgePointRows.filter((row) => (
    row.w3CapabilityIds.includes(TARGET_CAPABILITY_ID)
  ));
  const descriptorErrors = [];
  const descriptors = [];
  for (const row of dependentRows) {
    const built = buildDescriptor(row, fractionNumberSystem);
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
      (row) => row.directlyRequiresFractionDomainValidator,
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
    const normalized = fractionNumberSystem.execute({
      action: "NORMALIZE",
      knowledgePointId,
      sourceNodeId,
      value,
      assertedCapabilityId: NUMBER_SYSTEM_CAPABILITY_ID,
    });
    if (!normalized.ok) {
      return {
        ok: false,
        errors: normalized.errors.map((error) => `P03B3_NUMBER_SYSTEM_REJECTED:${error}`),
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
          maxCanonicalNumerator: null,
          maxCanonicalDenominator: null,
        }),
      };
    }
    if (!isPlainObject(valuePolicy)) {
      return { ok: false, errors: ["P03B3_VALUE_POLICY_INVALID:NOT_OBJECT"] };
    }
    const unknownKeys = Object.keys(valuePolicy).filter(
      (key) => !policy.valuePolicyKeys.includes(key),
    );
    if (unknownKeys.length > 0) {
      return { ok: false, errors: [`P03B3_VALUE_POLICY_INVALID:UNKNOWN_KEYS:${unknownKeys.join(",")}`] };
    }

    let allowedMagnitudeClasses = policy.allowedMagnitudeClasses;
    if (Object.hasOwn(valuePolicy, "allowedMagnitudeClasses")) {
      if (!Array.isArray(valuePolicy.allowedMagnitudeClasses)
        || valuePolicy.allowedMagnitudeClasses.length === 0
        || valuePolicy.allowedMagnitudeClasses.some(
          (item) => !policy.allowedMagnitudeClasses.includes(item),
        )) {
        return { ok: false, errors: ["P03B3_VALUE_POLICY_INVALID:MAGNITUDE_CLASSES"] };
      }
      allowedMagnitudeClasses = unique(valuePolicy.allowedMagnitudeClasses);
    }

    const allowZero = Object.hasOwn(valuePolicy, "allowZero") ? valuePolicy.allowZero : true;
    if (typeof allowZero !== "boolean") {
      return { ok: false, errors: ["P03B3_VALUE_POLICY_INVALID:ALLOW_ZERO"] };
    }

    const maxCanonicalNumerator = valuePolicy.maxCanonicalNumerator ?? null;
    if (maxCanonicalNumerator != null && !isNonNegativeSafeInteger(maxCanonicalNumerator)) {
      return { ok: false, errors: ["P03B3_VALUE_POLICY_INVALID:MAX_NUMERATOR"] };
    }
    const maxCanonicalDenominator = valuePolicy.maxCanonicalDenominator ?? null;
    if (maxCanonicalDenominator != null && !isPositiveSafeInteger(maxCanonicalDenominator)) {
      return { ok: false, errors: ["P03B3_VALUE_POLICY_INVALID:MAX_DENOMINATOR"] };
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
      return { ok: false, errors: ["P03B3_VALUE_POLICY_INVALID:MINIMUM_EXCEEDS_MAXIMUM"] };
    }

    return {
      ok: true,
      policy: Object.freeze({
        allowedMagnitudeClasses: freezeArray(allowedMagnitudeClasses),
        allowZero,
        minimumCanonical,
        maximumCanonical,
        maxCanonicalNumerator,
        maxCanonicalDenominator,
      }),
    };
  }

  function validateCanonical(canonical, normalizedPolicy) {
    const errors = [];
    if (!normalizedPolicy.allowedMagnitudeClasses.includes(canonical.magnitudeClass)) {
      errors.push(`P03B3_MAGNITUDE_CLASS_NOT_ALLOWED:${canonical.magnitudeClass}`);
    }
    if (!normalizedPolicy.allowZero && canonical.numerator === 0) {
      errors.push("P03B3_ZERO_FORBIDDEN");
    }
    if (normalizedPolicy.maxCanonicalNumerator != null
      && canonical.numerator > normalizedPolicy.maxCanonicalNumerator) {
      errors.push(`P03B3_NUMERATOR_LIMIT_EXCEEDED:${canonical.numerator}`);
    }
    if (normalizedPolicy.maxCanonicalDenominator != null
      && canonical.denominator > normalizedPolicy.maxCanonicalDenominator) {
      errors.push(`P03B3_DENOMINATOR_LIMIT_EXCEEDED:${canonical.denominator}`);
    }
    if (normalizedPolicy.minimumCanonical
      && compareCanonical(canonical, normalizedPolicy.minimumCanonical) < 0) {
      errors.push("P03B3_MINIMUM_VALUE_VIOLATION");
    }
    if (normalizedPolicy.maximumCanonical
      && compareCanonical(canonical, normalizedPolicy.maximumCanonical) > 0) {
      errors.push("P03B3_MAXIMUM_VALUE_VIOLATION");
    }
    return errors;
  }

  function normalizeSetPolicy(setPolicy) {
    if (setPolicy == null) {
      return { ok: true, policy: Object.freeze({ minCount: 1, maxCount: 32, uniqueCanonicalValues: false }) };
    }
    if (!isPlainObject(setPolicy)) {
      return { ok: false, errors: ["P03B3_SET_POLICY_INVALID:NOT_OBJECT"] };
    }
    const unknownKeys = Object.keys(setPolicy).filter(
      (key) => !policy.setPolicyKeys.includes(key),
    );
    if (unknownKeys.length > 0) {
      return { ok: false, errors: [`P03B3_SET_POLICY_INVALID:UNKNOWN_KEYS:${unknownKeys.join(",")}`] };
    }
    const minCount = setPolicy.minCount ?? 1;
    const maxCount = setPolicy.maxCount ?? policy.limits.maximumSetSize;
    const uniqueCanonicalValues = setPolicy.uniqueCanonicalValues ?? false;
    if (!isPositiveSafeInteger(minCount)
      || !isPositiveSafeInteger(maxCount)
      || minCount > maxCount
      || maxCount > policy.limits.maximumSetSize
      || typeof uniqueCanonicalValues !== "boolean") {
      return { ok: false, errors: ["P03B3_SET_POLICY_INVALID:LIMITS"] };
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
      errors.push("P03B3_KP_ID_REQUIRED");
    }
    const descriptor = descriptorByKnowledgePointId.get(knowledgePointId) ?? null;
    if (knowledgePointId && !p03.getRow(knowledgePointId)) {
      errors.push(`P03B3_UNKNOWN_KNOWLEDGE_POINT:${knowledgePointId}`);
    } else if (knowledgePointId && !descriptor) {
      errors.push(`P03B3_KP_NOT_FRACTION_DOMAIN_VALIDATOR_DEPENDENT:${knowledgePointId}`);
    }
    if (descriptor && sourceNodeId && !descriptor.sourceNodeIds.includes(sourceNodeId)) {
      errors.push(`P03B3_SOURCE_KP_MISMATCH:${knowledgePointId}:${sourceNodeId}`);
    }
    if (assertedCapabilityId && assertedCapabilityId !== TARGET_CAPABILITY_ID) {
      errors.push(`P03B3_CAPABILITY_ASSERTION_MISMATCH:${assertedCapabilityId}`);
    }
    if (!policy.allowedActions.includes(action)) {
      errors.push(`P03B3_ACTION_INVALID:${action}`);
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
      if (value == null) return blockedResult(request, ["P03B3_VALUE_REQUIRED"]);
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
      if (value == null) return blockedResult(request, ["P03B3_VALUE_REQUIRED"]);
      if (otherValue == null) return blockedResult(request, ["P03B3_OTHER_VALUE_REQUIRED"]);
      if (requiredRelation != null && !policy.allowedRelations.includes(requiredRelation)) {
        return blockedResult(request, [`P03B3_RELATION_INVALID:${String(requiredRelation)}`]);
      }
      const left = normalizeThroughNumberSystem({ knowledgePointId, sourceNodeId, value });
      if (!left.ok) return blockedResult(request, left.errors);
      const right = normalizeThroughNumberSystem({ knowledgePointId, sourceNodeId, value: otherValue });
      if (!right.ok) return blockedResult(request, right.errors);
      const pairErrors = [
        ...validateCanonical(left.canonical, normalizedValuePolicy.policy),
        ...validateCanonical(right.canonical, normalizedValuePolicy.policy),
      ];
      if (pairErrors.length > 0) return blockedResult(request, unique(pairErrors));
      const comparison = compareCanonical(left.canonical, right.canonical);
      const actualRelation = relationForComparison(comparison);
      if (requiredRelation != null && !relationSatisfied(comparison, requiredRelation)) {
        return blockedResult(request, [
          `P03B3_RELATION_MISMATCH:${requiredRelation}:${actualRelation}`,
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
      return blockedResult(request, ["P03B3_VALUES_REQUIRED"]);
    }
    const normalizedSetPolicy = normalizeSetPolicy(setPolicy);
    if (!normalizedSetPolicy.ok) {
      return blockedResult(request, normalizedSetPolicy.errors);
    }
    if (values.length < normalizedSetPolicy.policy.minCount
      || values.length > normalizedSetPolicy.policy.maxCount) {
      return blockedResult(request, [
        `P03B3_SET_SIZE_INVALID:${values.length}:${normalizedSetPolicy.policy.minCount}:${normalizedSetPolicy.policy.maxCount}`,
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
      return blockedResult(request, ["P03B3_DUPLICATE_CANONICAL_VALUE"]);
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
    version: P03B3_FRACTION_DOMAIN_VALIDATOR_VERSION,
    policy: Object.freeze(policy),
    manifest: Object.freeze(manifest),
    promotionRegistry: Object.freeze(promotionRegistry),
    predecessorPromotionRegistry: Object.freeze(predecessorPromotionRegistry),
    fractionNumberSystem,
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

export function executeP03B3FractionDomainValidation(request) {
  return materializeP03B3FractionDomainValidator().execute(request);
}
