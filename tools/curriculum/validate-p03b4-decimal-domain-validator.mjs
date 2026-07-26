import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP03B4DecimalDomainValidator } from "../../src/curriculum/full-product/p03b4-decimal-domain-validator.mjs";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../..");
const CLAIM_PATH = path.join(ROOT, "data/project/milestones/FPL-P03B4.claim.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function assert(condition, code) {
  if (!condition) throw new Error(code);
}

function assertArrayEqual(actual, expected, code) {
  assert(
    JSON.stringify([...actual].sort()) === JSON.stringify([...expected].sort()),
    code,
  );
}

export function validateP03B4DecimalDomainValidator() {
  const validator = materializeP03B4DecimalDomainValidator();
  const { manifest, policy, promotionRegistry, metrics, queueEntry } = validator;
  const claim = readJson(CLAIM_PATH);

  assert(validator.capabilityId === "cap_decimal_domain_validator", "P03B4_VALIDATE_CAPABILITY_ID");
  assert(queueEntry?.queueOrder === 4, "P03B4_VALIDATE_QUEUE_ORDER");
  assertArrayEqual(
    queueEntry?.hardeningGateCapabilityIds ?? [],
    ["cap_decimal_number_system"],
    "P03B4_VALIDATE_HARDENING_GATE",
  );
  assert(
    queueEntry?.nextTaskId === "P03B4_W3DecimalDomainValidatorAdmission",
    "P03B4_VALIDATE_QUEUE_TASK",
  );
  assert(queueEntry?.deliveryStatusBeforeP03A === "contract_only", "P03B4_VALIDATE_HISTORICAL_STATUS");
  assert(
    validator.predecessorPromotionRegistry.effectivePromotionCapabilityIds.includes(
      "cap_decimal_number_system",
    ),
    "P03B4_VALIDATE_NUMBER_SYSTEM_PROMOTION",
  );
  assert(
    validator.predecessorPromotionRegistry.effectivePromotionCapabilityIds.includes(
      "cap_fraction_domain_validator",
    ),
    "P03B4_VALIDATE_PREDECESSOR_VALIDATOR_PROMOTION",
  );
  assert(
    validator.decimalNumberSystem.status === "W3_DECIMAL_NUMBER_SYSTEM_PRODUCTION_ADMITTED",
    "P03B4_VALIDATE_NUMBER_SYSTEM_RUNTIME",
  );

  assert(
    metrics.effectiveDependentKnowledgePointCount === queueEntry.effectiveDependentKnowledgePointCount,
    "P03B4_VALIDATE_DEPENDENT_COUNT",
  );
  assert(
    metrics.directW3KnowledgePointCount === queueEntry.directW3KnowledgePointCount,
    "P03B4_VALIDATE_DIRECT_COUNT",
  );
  assert(
    metrics.protectedExistingD0KnowledgePointCount
      === queueEntry.protectedExistingD0KnowledgePointCount,
    "P03B4_VALIDATE_PROTECTED_COUNT",
  );
  assert(
    metrics.newProductDependentKnowledgePointCount
      === metrics.effectiveDependentKnowledgePointCount
        - metrics.protectedExistingD0KnowledgePointCount,
    "P03B4_VALIDATE_NEW_PRODUCT_COUNT",
  );
  assert(metrics.descriptorErrorCount === 0, "P03B4_VALIDATE_DESCRIPTOR_ERRORS");
  assert(validator.descriptors.length > 0, "P03B4_VALIDATE_DESCRIPTOR_COUNT");
  assert(validator.dependentSourceNodeIds.length > 0, "P03B4_VALIDATE_SOURCE_COUNT");
  assert(
    metrics.sourceKnowledgePointBindingCount >= metrics.effectiveDependentKnowledgePointCount,
    "P03B4_VALIDATE_SOURCE_BINDINGS",
  );
  assert(
    metrics.predecessorNumberSystemCoverageCount === metrics.effectiveDependentKnowledgePointCount,
    "P03B4_VALIDATE_PREDECESSOR_COVERAGE",
  );

  for (const descriptor of validator.descriptors) {
    assert(descriptor.numericDomainId === "NON_NEGATIVE_DECIMAL", `P03B4_VALIDATE_DOMAIN:${descriptor.knowledgePointId}`);
    assert(descriptor.numberSystemCapabilityId === "cap_decimal_number_system", `P03B4_VALIDATE_NUMBER_SYSTEM_ID:${descriptor.knowledgePointId}`);
    assert(descriptor.numberSystemDescriptorId != null, `P03B4_VALIDATE_NUMBER_SYSTEM_DESCRIPTOR:${descriptor.knowledgePointId}`);
    assert(descriptor.productionAdmissionState === "PRODUCTION_ADMITTED", `P03B4_VALIDATE_ADMISSION:${descriptor.knowledgePointId}`);
    assert(descriptor.sourceNodeIds.length > 0, `P03B4_VALIDATE_SOURCE:${descriptor.knowledgePointId}`);
    assert(descriptor.arithmeticAllowed === false, `P03B4_VALIDATE_ARITHMETIC_BOUNDARY:${descriptor.knowledgePointId}`);
    assert(descriptor.fractionConversionAllowed === false, `P03B4_VALIDATE_FRACTION_BOUNDARY:${descriptor.knowledgePointId}`);
  }

  assertArrayEqual(
    policy.allowedActions,
    ["VALIDATE_VALUE", "VALIDATE_PAIR", "VALIDATE_SET"],
    "P03B4_VALIDATE_ACTIONS",
  );
  assert(policy.allowedRelations.length === 6, "P03B4_VALIDATE_RELATION_COUNT");

  assert(promotionRegistry.promotions.length === 1, "P03B4_VALIDATE_PROMOTION_COUNT");
  const promotion = promotionRegistry.promotions[0];
  assert(promotion.capabilityId === "cap_decimal_domain_validator", "P03B4_VALIDATE_PROMOTION_ID");
  assert(promotion.previousDeliveryStatus === "contract_only", "P03B4_VALIDATE_PROMOTION_BEFORE");
  assert(promotion.effectiveDeliveryStatus === "production_admitted", "P03B4_VALIDATE_PROMOTION_AFTER");
  assert(promotion.decimalNumberSystemDependencySatisfied === true, "P03B4_VALIDATE_PROMOTION_GATE");
  assert(promotion.decimalArithmeticAllowed === false, "P03B4_VALIDATE_PROMOTION_ARITHMETIC_BOUNDARY");
  assert(metrics.effectivePromotionCount === 9, "P03B4_VALIDATE_EFFECTIVE_PROMOTIONS");
  assert(metrics.remainingW3ContractCapabilityCount === 3, "P03B4_VALIDATE_REMAINING_W3");

  for (const [name, expected] of Object.entries(manifest.expectedCounts)) {
    if (Object.hasOwn(metrics, name) && expected !== 0) {
      assert(metrics[name] === expected, `P03B4_VALIDATE_COUNT:${name}:${metrics[name]}:${expected}`);
    }
  }

  assert(claim.actualEvidenceLevel === "E5_PRODUCTION_ADMITTED", "P03B4_VALIDATE_CLAIM_EVIDENCE");
  assert(claim.claims.runtimeIntegrated === true, "P03B4_VALIDATE_RUNTIME_CLAIM");
  assert(claim.claims.productionAdmitted === true, "P03B4_VALIDATE_PRODUCTION_CLAIM");
  assert(claim.claims.visibleOutputChanged === false, "P03B4_VALIDATE_VISIBLE_OUTPUT_CLAIM");
  assert(claim.claims.d0Complete === false, "P03B4_VALIDATE_D0_CLAIM");

  return Object.freeze({
    taskId: validator.taskId,
    status: validator.status,
    capabilityId: validator.capabilityId,
    metrics,
    validation: Object.freeze({
      hardeningQueueEntryPassed: true,
      hardeningGateSatisfied: true,
      predecessorPromotionPassed: true,
      cohortSweepPassed: true,
      sourceKnowledgePointBindingSweepPassed: true,
      predecessorNumberSystemCoveragePassed: true,
      promotionStatusPassed: true,
      historicalR04Preserved: true,
      scopeBoundaryPassed: true,
      milestoneClaimIntegrityPassed: true,
    }),
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.stdout.write(`${JSON.stringify(validateP03B4DecimalDomainValidator(), null, 2)}\n`);
}
