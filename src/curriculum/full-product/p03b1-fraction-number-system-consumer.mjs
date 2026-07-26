import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP03AW3CapabilityHardeningOrderEvidence } from "./p03a-w3-capability-hardening-order-evidence.mjs";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../../..");
const P03B1_DIR = path.join(ROOT, "data/curriculum/full-product/p03b1");
const TARGET_CAPABILITY_ID = "cap_fraction_number_system";
const MAX_SAFE_BIGINT = BigInt(Number.MAX_SAFE_INTEGER);

export const P03B1_FRACTION_NUMBER_SYSTEM_CONSUMER_VERSION =
  "p03b1-fraction-number-system-consumer-v1";

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(P03B1_DIR, fileName), "utf8"));
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

function isNonNegativeSafeInteger(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

function isPositiveSafeInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
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

function toSafeNumber(value, errorCode) {
  if (value < 0n || value > MAX_SAFE_BIGINT) {
    return { ok: false, error: `${errorCode}:${value.toString()}` };
  }
  return { ok: true, value: Number(value) };
}

function normalizeFractionValue(value) {
  let numerator;
  let denominator;
  let inputForm;

  if (isNonNegativeSafeInteger(value)) {
    numerator = BigInt(value);
    denominator = 1n;
    inputForm = "SAFE_INTEGER";
  } else if (value && typeof value === "object" && !Array.isArray(value)) {
    if (!isNonNegativeSafeInteger(value.numerator)) {
      return { ok: false, error: `P03B1_VALUE_INVALID:${JSON.stringify(value)}` };
    }
    if (!isPositiveSafeInteger(value.denominator)) {
      return { ok: false, error: `P03B1_DENOMINATOR_INVALID:${JSON.stringify(value)}` };
    }

    denominator = BigInt(value.denominator);
    if (Object.hasOwn(value, "wholeNumber")) {
      if (!isNonNegativeSafeInteger(value.wholeNumber)
        || value.numerator >= value.denominator) {
        return { ok: false, error: `P03B1_MIXED_NUMBER_INVALID:${JSON.stringify(value)}` };
      }
      numerator = BigInt(value.wholeNumber) * denominator + BigInt(value.numerator);
      inputForm = "MIXED_NUMBER";
    } else {
      numerator = BigInt(value.numerator);
      inputForm = "FRACTION";
    }
  } else {
    return { ok: false, error: `P03B1_VALUE_INVALID:${JSON.stringify(value)}` };
  }

  const divisor = gcdBigInt(numerator, denominator);
  numerator /= divisor;
  denominator /= divisor;

  const numeratorNumber = toSafeNumber(numerator, "P03B1_RESULT_OVERFLOW");
  if (!numeratorNumber.ok) return numeratorNumber;
  const denominatorNumber = toSafeNumber(denominator, "P03B1_RESULT_OVERFLOW");
  if (!denominatorNumber.ok) return denominatorNumber;

  const wholeNumber = numerator / denominator;
  const remainderNumerator = numerator % denominator;
  const wholeNumberNumber = toSafeNumber(wholeNumber, "P03B1_RESULT_OVERFLOW");
  if (!wholeNumberNumber.ok) return wholeNumberNumber;
  const remainderNumber = toSafeNumber(remainderNumerator, "P03B1_RESULT_OVERFLOW");
  if (!remainderNumber.ok) return remainderNumber;

  let magnitudeClass;
  if (numerator === 0n) magnitudeClass = "ZERO";
  else if (denominator === 1n) magnitudeClass = "WHOLE_NUMBER";
  else if (numerator < denominator) magnitudeClass = "PROPER_FRACTION";
  else magnitudeClass = "IMPROPER_FRACTION";

  return {
    ok: true,
    inputForm,
    numerator,
    denominator,
    canonical: Object.freeze({
      numericDomainId: "NON_NEGATIVE_RATIONAL",
      valueForm: "REDUCED_IMPROPER_FRACTION",
      numerator: numeratorNumber.value,
      denominator: denominatorNumber.value,
      mixedProjection: Object.freeze({
        wholeNumber: wholeNumberNumber.value,
        numerator: remainderNumber.value,
        denominator: denominatorNumber.value,
      }),
      magnitudeClass,
      isReduced: true,
      exact: true,
    }),
  };
}

function compareNormalized(left, right) {
  const leftCross = left.numerator * right.denominator;
  const rightCross = right.numerator * left.denominator;
  if (leftCross < rightCross) return -1;
  if (leftCross > rightCross) return 1;
  return 0;
}

function relationForComparison(comparison) {
  if (comparison < 0) return "LESS_THAN";
  if (comparison > 0) return "GREATER_THAN";
  return "EQUAL";
}

function blockedResult(request, errors) {
  return Object.freeze({
    ok: false,
    blocked: true,
    errors: freezeArray(errors),
    request: Object.freeze(clone(request)),
    consumerVersion: P03B1_FRACTION_NUMBER_SYSTEM_CONSUMER_VERSION,
    consumerMode: "PRODUCTION_DETERMINISTIC_FRACTION_NUMBER_SYSTEM",
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
    consumerVersion: P03B1_FRACTION_NUMBER_SYSTEM_CONSUMER_VERSION,
    consumerMode: "PRODUCTION_DETERMINISTIC_FRACTION_NUMBER_SYSTEM",
    productionAdmissionState: "PRODUCTION_ADMITTED",
    descriptor,
    result: Object.freeze(result),
  });
}

function buildDescriptor(row) {
  const errors = [];
  if (!row.w3CapabilityIds.includes(TARGET_CAPABILITY_ID)) {
    errors.push(`P03B1_KP_NOT_FRACTION_NUMBER_SYSTEM_DEPENDENT:${row.knowledgePointId}`);
  }
  if (!Array.isArray(row.sourceNodeIds) || row.sourceNodeIds.length === 0) {
    errors.push(`P03B1_SOURCE_AUTHORITY_MISSING:${row.knowledgePointId}`);
  }
  if (errors.length > 0) return { descriptor: null, errors };

  return {
    errors: [],
    descriptor: Object.freeze({
      descriptorId: `p03b1frac_${row.knowledgePointId.replace(/^kp_/, "")}`,
      knowledgePointId: row.knowledgePointId,
      canonicalNameZh: row.canonicalNameZh,
      capabilityStatement: row.capabilityStatement,
      reasoningInvariant: row.reasoningInvariant,
      sourceNodeIds: freezeArray(row.sourceNodeIds),
      assignedDeliveryWaveId: row.assignedDeliveryWaveId,
      baseDeliveryWaveId: row.baseDeliveryWaveId,
      directW3CohortMember: row.directW3CohortMember,
      directlyRequiresFractionNumberSystem: row.directlyRequiredW3CapabilityIds.includes(
        TARGET_CAPABILITY_ID,
      ),
      protectedExistingD0: row.protectedExistingD0,
      productProductionAdmitted: row.productProductionAdmitted,
      productGapState: row.productGapState,
      numericDomainId: "NON_NEGATIVE_RATIONAL",
      acceptedInputForms: Object.freeze(["SAFE_INTEGER", "FRACTION", "MIXED_NUMBER"]),
      canonicalValueForm: "REDUCED_IMPROPER_FRACTION",
      canonicalMixedProjection: "WHOLE_NUMBER_PLUS_PROPER_REMAINDER",
      allowedActions: Object.freeze([
        "NORMALIZE",
        "EQUIVALENCE",
        "COMPARE",
        "EXPAND_EQUIVALENT",
      ]),
      exactBigIntIntermediate: true,
      floatingPointApproximationAllowed: false,
      negativeValuesAllowed: false,
      arithmeticAllowed: false,
      decimalConversionAllowed: false,
      crossDomainNormalizationAllowed: false,
      questionGenerationAllowed: false,
      productionAdmissionState: "PRODUCTION_ADMITTED",
    }),
  };
}

export function materializeP03B1FractionNumberSystemConsumer() {
  const policy = readJson("fraction-number-system-policy.json");
  const manifest = readJson("fraction-number-system.manifest.json");
  const promotionRegistry = readJson("w3-capability-promotion-registry.json");
  const predecessorPromotionRegistry = readRepoJson(
    promotionRegistry.predecessorPromotionRegistryPath,
  );
  const p03a = materializeP03AW3CapabilityHardeningOrderEvidence();
  const p03 = p03a.predecessorInventory;
  const queueEntry = p03a.getCapability(TARGET_CAPABILITY_ID);

  const dependentRows = p03.dependentKnowledgePointRows.filter((row) => (
    row.w3CapabilityIds.includes(TARGET_CAPABILITY_ID)
  ));
  const descriptorErrors = [];
  const descriptors = [];
  for (const row of dependentRows) {
    const built = buildDescriptor(row);
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
    directW3KnowledgePointCount: descriptors.filter(
      (row) => row.directW3CohortMember,
    ).length,
    protectedExistingD0KnowledgePointCount: descriptors.filter(
      (row) => row.protectedExistingD0,
    ).length,
    newProductDependentKnowledgePointCount: descriptors.filter(
      (row) => !row.protectedExistingD0,
    ).length,
    directRequirementKnowledgePointCount: descriptors.filter(
      (row) => row.directlyRequiresFractionNumberSystem,
    ).length,
    dependentSourceNodeCount: dependentSourceNodeIds.length,
    sourceKnowledgePointBindingCount,
    descriptorErrorCount: descriptorErrors.length,
    acceptedInputFormCount: Object.keys(policy.acceptedInputForms).length,
    allowedActionCount: policy.allowedActions.length,
    newPromotionCount: promotionRegistry.promotions.length,
    effectivePromotionCount: effectivePromotionCapabilityIds.length,
    remainingW3ContractCapabilityCount:
      promotionRegistry.remainingW3ContractCapabilityIds.length,
  });

  function execute({
    action = "NORMALIZE",
    knowledgePointId = null,
    sourceNodeId = null,
    value = null,
    otherValue = null,
    equivalentFactor = null,
    assertedCapabilityId = null,
  } = {}) {
    const request = {
      action,
      knowledgePointId,
      sourceNodeId,
      value: clone(value),
      otherValue: clone(otherValue),
      equivalentFactor,
      assertedCapabilityId,
    };
    const errors = [];

    if (typeof knowledgePointId !== "string" || knowledgePointId.length === 0) {
      errors.push("P03B1_KP_ID_REQUIRED");
    }
    const descriptor = descriptorByKnowledgePointId.get(knowledgePointId) ?? null;
    if (knowledgePointId && !p03.getRow(knowledgePointId)) {
      errors.push(`P03B1_UNKNOWN_KNOWLEDGE_POINT:${knowledgePointId}`);
    } else if (knowledgePointId && !descriptor) {
      errors.push(`P03B1_KP_NOT_FRACTION_NUMBER_SYSTEM_DEPENDENT:${knowledgePointId}`);
    }
    if (descriptor && sourceNodeId && !descriptor.sourceNodeIds.includes(sourceNodeId)) {
      errors.push(`P03B1_SOURCE_KP_MISMATCH:${knowledgePointId}:${sourceNodeId}`);
    }
    if (assertedCapabilityId && assertedCapabilityId !== TARGET_CAPABILITY_ID) {
      errors.push(
        `P03B1_CAPABILITY_ASSERTION_MISMATCH:${assertedCapabilityId}`,
      );
    }
    if (!policy.allowedActions.includes(action)) {
      errors.push(`P03B1_ACTION_INVALID:${action}`);
    }
    if (value == null) {
      errors.push("P03B1_VALUE_REQUIRED");
    }
    if (errors.length > 0) return blockedResult(request, errors);

    const normalized = normalizeFractionValue(value);
    if (!normalized.ok) return blockedResult(request, [normalized.error]);

    if (action === "NORMALIZE") {
      return successResult(request, descriptor, {
        action,
        canonicalValue: normalized.canonical,
      });
    }

    if (action === "EQUIVALENCE" || action === "COMPARE") {
      if (otherValue == null) {
        return blockedResult(request, ["P03B1_OTHER_VALUE_REQUIRED"]);
      }
      const normalizedOther = normalizeFractionValue(otherValue);
      if (!normalizedOther.ok) {
        return blockedResult(request, [normalizedOther.error]);
      }
      const comparison = compareNormalized(normalized, normalizedOther);
      if (action === "EQUIVALENCE") {
        return successResult(request, descriptor, {
          action,
          equivalent: comparison === 0,
          leftCanonicalValue: normalized.canonical,
          rightCanonicalValue: normalizedOther.canonical,
        });
      }
      return successResult(request, descriptor, {
        action,
        comparison,
        relation: relationForComparison(comparison),
        leftCanonicalValue: normalized.canonical,
        rightCanonicalValue: normalizedOther.canonical,
      });
    }

    if (!isPositiveSafeInteger(equivalentFactor)) {
      return blockedResult(request, [
        `P03B1_EQUIVALENT_FACTOR_INVALID:${String(equivalentFactor)}`,
      ]);
    }
    const expandedNumerator =
      normalized.numerator * BigInt(equivalentFactor);
    const expandedDenominator =
      normalized.denominator * BigInt(equivalentFactor);
    const expandedNumeratorNumber = toSafeNumber(
      expandedNumerator,
      "P03B1_RESULT_OVERFLOW",
    );
    if (!expandedNumeratorNumber.ok) {
      return blockedResult(request, [expandedNumeratorNumber.error]);
    }
    const expandedDenominatorNumber = toSafeNumber(
      expandedDenominator,
      "P03B1_RESULT_OVERFLOW",
    );
    if (!expandedDenominatorNumber.ok) {
      return blockedResult(request, [expandedDenominatorNumber.error]);
    }
    return successResult(request, descriptor, {
      action,
      canonicalValue: normalized.canonical,
      equivalentRepresentation: Object.freeze({
        numerator: expandedNumeratorNumber.value,
        denominator: expandedDenominatorNumber.value,
        scaleFactor: equivalentFactor,
        isCanonicalReducedForm: equivalentFactor === 1,
        exact: true,
      }),
    });
  }

  return Object.freeze({
    schemaName: manifest.schemaName,
    schemaVersion: manifest.schemaVersion,
    programId: manifest.programId,
    taskId: manifest.taskId,
    status: manifest.status,
    version: P03B1_FRACTION_NUMBER_SYSTEM_CONSUMER_VERSION,
    policy: Object.freeze(policy),
    manifest: Object.freeze(manifest),
    promotionRegistry: Object.freeze(promotionRegistry),
    predecessorPromotionRegistry: Object.freeze(predecessorPromotionRegistry),
    hardeningAuthority: p03a,
    predecessorInventory: p03,
    queueEntry,
    capabilityId: TARGET_CAPABILITY_ID,
    descriptors: freezeArray(descriptors),
    descriptorErrors: freezeArray(descriptorErrors),
    dependentSourceNodeIds: freezeArray(dependentSourceNodeIds),
    effectivePromotionCapabilityIds: freezeArray(
      effectivePromotionCapabilityIds,
    ),
    metrics,
    getDescriptor(knowledgePointId) {
      return descriptorByKnowledgePointId.get(knowledgePointId) ?? null;
    },
    execute,
  });
}

export function executeP03B1FractionNumberSystem(request) {
  return materializeP03B1FractionNumberSystemConsumer().execute(request);
}

export function normalizeP03B1FractionValue(value) {
  const normalized = normalizeFractionValue(value);
  if (!normalized.ok) {
    return Object.freeze({
      ok: false,
      errors: Object.freeze([normalized.error]),
      canonicalValue: null,
    });
  }
  return Object.freeze({
    ok: true,
    errors: Object.freeze([]),
    canonicalValue: normalized.canonical,
  });
}
