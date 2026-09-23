import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP03AW3CapabilityHardeningOrderEvidence } from "./p03a-w3-capability-hardening-order-evidence.mjs";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../../..");
const P03B2_DIR = path.join(ROOT, "data/curriculum/full-product/p03b2");
const TARGET_CAPABILITY_ID = "cap_decimal_number_system";
const MAX_DECIMAL_DIGITS = 64;
const MAX_DECIMAL_SCALE = 32;

export const P03B2_DECIMAL_NUMBER_SYSTEM_CONSUMER_VERSION =
  "p03b2-decimal-number-system-consumer-v1";

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(P03B2_DIR, fileName), "utf8"));
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

function isDigitString(value) {
  return typeof value === "string" && /^[0-9]+$/.test(value);
}

function pow10BigInt(exponent) {
  return 10n ** BigInt(exponent);
}

function canonicalText(coefficient, scale) {
  const digits = coefficient.toString();
  if (scale === 0) return digits;
  const padded = digits.padStart(scale + 1, "0");
  const split = padded.length - scale;
  return `${padded.slice(0, split)}.${padded.slice(split)}`;
}

function validateDigitBudget(digits, scale) {
  if (digits.length > MAX_DECIMAL_DIGITS) {
    return `P03B2_RESULT_OVERFLOW:DIGITS:${digits.length}`;
  }
  if (!Number.isSafeInteger(scale) || scale < 0 || scale > MAX_DECIMAL_SCALE) {
    return `P03B2_SCALE_INVALID:${String(scale)}`;
  }
  return null;
}

function parseDecimalValue(value) {
  let coefficientDigits;
  let scale;
  let inputScale;
  let inputForm;

  if (isNonNegativeSafeInteger(value)) {
    coefficientDigits = String(value);
    scale = 0;
    inputScale = 0;
    inputForm = "SAFE_INTEGER";
  } else if (typeof value === "string") {
    const match = /^([0-9]+)(?:\.([0-9]+))?$/.exec(value);
    if (!match) {
      return { ok: false, error: `P03B2_DECIMAL_STRING_INVALID:${JSON.stringify(value)}` };
    }
    const wholeDigits = match[1];
    const fractionalDigits = match[2] ?? "";
    coefficientDigits = `${wholeDigits}${fractionalDigits}`;
    scale = fractionalDigits.length;
    inputScale = scale;
    inputForm = "DECIMAL_STRING";
  } else if (value && typeof value === "object" && !Array.isArray(value)) {
    if (Object.hasOwn(value, "coefficient") || Object.hasOwn(value, "scale")) {
      const rawCoefficient = value.coefficient;
      const coefficientValid = isNonNegativeSafeInteger(rawCoefficient) || isDigitString(rawCoefficient);
      if (!coefficientValid || !Number.isSafeInteger(value.scale) || value.scale < 0) {
        return { ok: false, error: `P03B2_SCALED_INTEGER_INVALID:${JSON.stringify(value)}` };
      }
      coefficientDigits = String(rawCoefficient);
      scale = value.scale;
      inputScale = scale;
      inputForm = "SCALED_INTEGER";
    } else if (Object.hasOwn(value, "wholeNumber") || Object.hasOwn(value, "fractionalDigits")) {
      if (!isNonNegativeSafeInteger(value.wholeNumber) || !isDigitString(value.fractionalDigits)) {
        return { ok: false, error: `P03B2_DECIMAL_PARTS_INVALID:${JSON.stringify(value)}` };
      }
      coefficientDigits = `${value.wholeNumber}${value.fractionalDigits}`;
      scale = value.fractionalDigits.length;
      inputScale = scale;
      inputForm = "DECIMAL_PARTS";
    } else {
      return { ok: false, error: `P03B2_VALUE_INVALID:${JSON.stringify(value)}` };
    }
  } else {
    return { ok: false, error: `P03B2_VALUE_INVALID:${JSON.stringify(value)}` };
  }

  const budgetError = validateDigitBudget(coefficientDigits, scale);
  if (budgetError) return { ok: false, error: budgetError };

  let coefficient = BigInt(coefficientDigits);
  let canonicalScale = scale;
  if (coefficient === 0n) {
    canonicalScale = 0;
  } else {
    while (canonicalScale > 0 && coefficient % 10n === 0n) {
      coefficient /= 10n;
      canonicalScale -= 1;
    }
  }

  const text = canonicalText(coefficient, canonicalScale);
  const [wholeNumberText, fractionalDigits = ""] = text.split(".");
  const magnitudeClass = coefficient === 0n
    ? "ZERO"
    : canonicalScale === 0
      ? "WHOLE_NUMBER"
      : "DECIMAL_FRACTION";

  return {
    ok: true,
    inputForm,
    coefficient,
    scale: canonicalScale,
    inputScale,
    canonical: Object.freeze({
      numericDomainId: "NON_NEGATIVE_DECIMAL",
      valueForm: "NORMALIZED_BASE10_COEFFICIENT_SCALE",
      coefficient: coefficient.toString(),
      scale: canonicalScale,
      canonicalText: text,
      wholeNumberText,
      fractionalDigits,
      magnitudeClass,
      base: 10,
      trailingZerosRemoved: inputScale - canonicalScale,
      exact: true,
    }),
  };
}

function compareNormalized(left, right) {
  const commonScale = Math.max(left.scale, right.scale);
  const leftScaled = left.coefficient * pow10BigInt(commonScale - left.scale);
  const rightScaled = right.coefficient * pow10BigInt(commonScale - right.scale);
  if (leftScaled < rightScaled) return -1;
  if (leftScaled > rightScaled) return 1;
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
    consumerVersion: P03B2_DECIMAL_NUMBER_SYSTEM_CONSUMER_VERSION,
    consumerMode: "PRODUCTION_DETERMINISTIC_DECIMAL_NUMBER_SYSTEM",
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
    consumerVersion: P03B2_DECIMAL_NUMBER_SYSTEM_CONSUMER_VERSION,
    consumerMode: "PRODUCTION_DETERMINISTIC_DECIMAL_NUMBER_SYSTEM",
    productionAdmissionState: "PRODUCTION_ADMITTED",
    descriptor,
    result: Object.freeze(result),
  });
}

function buildDescriptor(row) {
  const errors = [];
  if (!row.w3CapabilityIds.includes(TARGET_CAPABILITY_ID)) {
    errors.push(`P03B2_KP_NOT_DECIMAL_NUMBER_SYSTEM_DEPENDENT:${row.knowledgePointId}`);
  }
  if (!Array.isArray(row.sourceNodeIds) || row.sourceNodeIds.length === 0) {
    errors.push(`P03B2_SOURCE_AUTHORITY_MISSING:${row.knowledgePointId}`);
  }
  if (errors.length > 0) return { descriptor: null, errors };

  return {
    errors: [],
    descriptor: Object.freeze({
      descriptorId: `p03b2dec_${row.knowledgePointId.replace(/^kp_/, "")}`,
      knowledgePointId: row.knowledgePointId,
      canonicalNameZh: row.canonicalNameZh,
      capabilityStatement: row.capabilityStatement,
      reasoningInvariant: row.reasoningInvariant,
      sourceNodeIds: freezeArray(row.sourceNodeIds),
      assignedDeliveryWaveId: row.assignedDeliveryWaveId,
      baseDeliveryWaveId: row.baseDeliveryWaveId,
      directW3CohortMember: row.directW3CohortMember,
      directlyRequiresDecimalNumberSystem: row.directlyRequiredW3CapabilityIds.includes(
        TARGET_CAPABILITY_ID,
      ),
      protectedExistingD0: row.protectedExistingD0,
      productProductionAdmitted: row.productProductionAdmitted,
      productGapState: row.productGapState,
      numericDomainId: "NON_NEGATIVE_DECIMAL",
      acceptedInputForms: Object.freeze([
        "SAFE_INTEGER",
        "DECIMAL_STRING",
        "SCALED_INTEGER",
        "DECIMAL_PARTS",
      ]),
      canonicalValueForm: "NORMALIZED_BASE10_COEFFICIENT_SCALE",
      allowedActions: Object.freeze([
        "NORMALIZE",
        "EQUIVALENCE",
        "COMPARE",
        "EXPAND_SCALE",
      ]),
      maxDecimalDigits: MAX_DECIMAL_DIGITS,
      maxDecimalScale: MAX_DECIMAL_SCALE,
      exactBigIntIntermediate: true,
      floatingPointApproximationAllowed: false,
      negativeValuesAllowed: false,
      arithmeticAllowed: false,
      fractionConversionAllowed: false,
      crossDomainNormalizationAllowed: false,
      questionGenerationAllowed: false,
      productionAdmissionState: "PRODUCTION_ADMITTED",
    }),
  };
}

export function materializeP03B2DecimalNumberSystemConsumer() {
  const policy = readJson("decimal-number-system-policy.json");
  const manifest = readJson("decimal-number-system.manifest.json");
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
      (row) => row.directlyRequiresDecimalNumberSystem,
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
    targetScale = null,
    assertedCapabilityId = null,
  } = {}) {
    const request = {
      action,
      knowledgePointId,
      sourceNodeId,
      value: clone(value),
      otherValue: clone(otherValue),
      targetScale,
      assertedCapabilityId,
    };
    const errors = [];

    if (typeof knowledgePointId !== "string" || knowledgePointId.length === 0) {
      errors.push("P03B2_KP_ID_REQUIRED");
    }
    const descriptor = descriptorByKnowledgePointId.get(knowledgePointId) ?? null;
    if (knowledgePointId && !p03.getRow(knowledgePointId)) {
      errors.push(`P03B2_UNKNOWN_KNOWLEDGE_POINT:${knowledgePointId}`);
    } else if (knowledgePointId && !descriptor) {
      errors.push(`P03B2_KP_NOT_DECIMAL_NUMBER_SYSTEM_DEPENDENT:${knowledgePointId}`);
    }
    if (descriptor && sourceNodeId && !descriptor.sourceNodeIds.includes(sourceNodeId)) {
      errors.push(`P03B2_SOURCE_KP_MISMATCH:${knowledgePointId}:${sourceNodeId}`);
    }
    if (assertedCapabilityId && assertedCapabilityId !== TARGET_CAPABILITY_ID) {
      errors.push(`P03B2_CAPABILITY_ASSERTION_MISMATCH:${assertedCapabilityId}`);
    }
    if (!policy.allowedActions.includes(action)) {
      errors.push(`P03B2_ACTION_INVALID:${action}`);
    }
    if (value == null) {
      errors.push("P03B2_VALUE_REQUIRED");
    }
    if (errors.length > 0) return blockedResult(request, errors);

    const normalized = parseDecimalValue(value);
    if (!normalized.ok) return blockedResult(request, [normalized.error]);

    if (action === "NORMALIZE") {
      return successResult(request, descriptor, {
        action,
        canonicalValue: normalized.canonical,
      });
    }

    if (action === "EQUIVALENCE" || action === "COMPARE") {
      if (otherValue == null) {
        return blockedResult(request, ["P03B2_OTHER_VALUE_REQUIRED"]);
      }
      const normalizedOther = parseDecimalValue(otherValue);
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

    if (!Number.isSafeInteger(targetScale)
      || targetScale < normalized.scale
      || targetScale > MAX_DECIMAL_SCALE) {
      return blockedResult(request, [
        `P03B2_TARGET_SCALE_INVALID:${String(targetScale)}`,
      ]);
    }
    const expandedCoefficient = normalized.coefficient
      * pow10BigInt(targetScale - normalized.scale);
    const expandedDigits = expandedCoefficient.toString();
    const expandedBudgetError = validateDigitBudget(expandedDigits, targetScale);
    if (expandedBudgetError) return blockedResult(request, [expandedBudgetError]);

    return successResult(request, descriptor, {
      action,
      canonicalValue: normalized.canonical,
      equivalentRepresentation: Object.freeze({
        coefficient: expandedDigits,
        scale: targetScale,
        decimalText: canonicalText(expandedCoefficient, targetScale),
        isCanonicalNormalizedForm: targetScale === normalized.scale,
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
    version: P03B2_DECIMAL_NUMBER_SYSTEM_CONSUMER_VERSION,
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
    effectivePromotionCapabilityIds: freezeArray(effectivePromotionCapabilityIds),
    metrics,
    getDescriptor(knowledgePointId) {
      return descriptorByKnowledgePointId.get(knowledgePointId) ?? null;
    },
    execute,
  });
}

export function executeP03B2DecimalNumberSystem(request) {
  return materializeP03B2DecimalNumberSystemConsumer().execute(request);
}

export function normalizeP03B2DecimalValue(value) {
  const normalized = parseDecimalValue(value);
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
