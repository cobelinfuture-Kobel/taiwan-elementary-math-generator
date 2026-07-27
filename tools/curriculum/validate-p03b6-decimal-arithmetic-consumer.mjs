import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP03B6DecimalArithmeticConsumer } from "../../src/curriculum/full-product/p03b6-decimal-arithmetic-consumer.mjs";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../..");
const CLAIM_PATH = path.join(ROOT, "data/project/milestones/FPL-P03B6.claim.json");

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

export function validateP03B6DecimalArithmeticConsumer() {
  const consumer = materializeP03B6DecimalArithmeticConsumer();
  const { manifest, policy, promotionRegistry, metrics, queueEntry } = consumer;
  const claim = readJson(CLAIM_PATH);

  assert(consumer.capabilityId === "cap_decimal_arithmetic", "P03B6_VALIDATE_CAPABILITY_ID");
  assert(queueEntry?.queueOrder === 6, "P03B6_VALIDATE_QUEUE_ORDER");
  assertArrayEqual(
    queueEntry?.hardeningGateCapabilityIds ?? [],
    ["cap_decimal_number_system", "cap_decimal_domain_validator"],
    "P03B6_VALIDATE_HARDENING_GATE",
  );
  assert(
    queueEntry?.nextTaskId === "P03B6_W3DecimalArithmeticConsumerAdmission",
    "P03B6_VALIDATE_QUEUE_TASK",
  );
  assert(queueEntry?.deliveryStatusBeforeP03A === "contract_only", "P03B6_VALIDATE_HISTORICAL_STATUS");
  assert(
    consumer.predecessorPromotionRegistry.effectivePromotionCapabilityIds.includes(
      "cap_decimal_number_system",
    ),
    "P03B6_VALIDATE_NUMBER_SYSTEM_PROMOTION",
  );
  assert(
    consumer.predecessorPromotionRegistry.effectivePromotionCapabilityIds.includes(
      "cap_decimal_domain_validator",
    ),
    "P03B6_VALIDATE_DOMAIN_VALIDATOR_PROMOTION",
  );
  assert(
    consumer.predecessorPromotionRegistry.effectivePromotionCapabilityIds.includes(
      "cap_fraction_arithmetic",
    ),
    "P03B6_VALIDATE_PREDECESSOR_PROMOTION",
  );
  assert(
    consumer.decimalNumberSystem.status === "W3_DECIMAL_NUMBER_SYSTEM_PRODUCTION_ADMITTED",
    "P03B6_VALIDATE_NUMBER_SYSTEM_RUNTIME",
  );
  assert(
    consumer.decimalDomainValidator.status === "W3_DECIMAL_DOMAIN_VALIDATOR_PRODUCTION_ADMITTED",
    "P03B6_VALIDATE_DOMAIN_VALIDATOR_RUNTIME",
  );

  assert(
    metrics.effectiveDependentKnowledgePointCount === queueEntry.effectiveDependentKnowledgePointCount,
    "P03B6_VALIDATE_DEPENDENT_COUNT",
  );
  assert(
    metrics.directW3KnowledgePointCount === queueEntry.directW3KnowledgePointCount,
    "P03B6_VALIDATE_DIRECT_COUNT",
  );
  assert(
    metrics.protectedExistingD0KnowledgePointCount
      === queueEntry.protectedExistingD0KnowledgePointCount,
    "P03B6_VALIDATE_PROTECTED_COUNT",
  );
  assert(
    metrics.newProductDependentKnowledgePointCount
      === metrics.effectiveDependentKnowledgePointCount
        - metrics.protectedExistingD0KnowledgePointCount,
    "P03B6_VALIDATE_NEW_PRODUCT_COUNT",
  );
  assert(metrics.descriptorErrorCount === 0, "P03B6_VALIDATE_DESCRIPTOR_ERRORS");
  assert(consumer.descriptors.length > 0, "P03B6_VALIDATE_DESCRIPTOR_COUNT");
  assert(consumer.dependentSourceNodeIds.length > 0, "P03B6_VALIDATE_SOURCE_COUNT");
  assert(
    metrics.sourceKnowledgePointBindingCount >= metrics.effectiveDependentKnowledgePointCount,
    "P03B6_VALIDATE_SOURCE_BINDINGS",
  );
  assert(
    metrics.predecessorNumberSystemCoverageCount === metrics.effectiveDependentKnowledgePointCount,
    "P03B6_VALIDATE_NUMBER_SYSTEM_COVERAGE",
  );
  assert(
    metrics.predecessorDomainValidatorCoverageCount === metrics.effectiveDependentKnowledgePointCount,
    "P03B6_VALIDATE_DOMAIN_VALIDATOR_COVERAGE",
  );

  for (const descriptor of consumer.descriptors) {
    assert(descriptor.numericDomainId === "NON_NEGATIVE_DECIMAL", `P03B6_VALIDATE_DOMAIN:${descriptor.knowledgePointId}`);
    assert(descriptor.numberSystemCapabilityId === "cap_decimal_number_system", `P03B6_VALIDATE_NUMBER_SYSTEM_ID:${descriptor.knowledgePointId}`);
    assert(descriptor.numberSystemDescriptorId != null, `P03B6_VALIDATE_NUMBER_SYSTEM_DESCRIPTOR:${descriptor.knowledgePointId}`);
    assert(descriptor.domainValidatorCapabilityId === "cap_decimal_domain_validator", `P03B6_VALIDATE_DOMAIN_VALIDATOR_ID:${descriptor.knowledgePointId}`);
    assert(descriptor.domainValidatorDescriptorId != null, `P03B6_VALIDATE_DOMAIN_VALIDATOR_DESCRIPTOR:${descriptor.knowledgePointId}`);
    assert(descriptor.productionAdmissionState === "PRODUCTION_ADMITTED", `P03B6_VALIDATE_ADMISSION:${descriptor.knowledgePointId}`);
    assert(descriptor.sourceNodeIds.length > 0, `P03B6_VALIDATE_SOURCE:${descriptor.knowledgePointId}`);
    assert(descriptor.exactBigIntIntermediateArithmetic === true, `P03B6_VALIDATE_EXACT:${descriptor.knowledgePointId}`);
    assert(descriptor.finiteDecimalDivisionOnly === true, `P03B6_VALIDATE_FINITE_DIVISION:${descriptor.knowledgePointId}`);
    assert(descriptor.fractionConversionAllowed === false, `P03B6_VALIDATE_FRACTION_BOUNDARY:${descriptor.knowledgePointId}`);
    assert(descriptor.crossDomainNormalizationAllowed === false, `P03B6_VALIDATE_CROSS_DOMAIN_BOUNDARY:${descriptor.knowledgePointId}`);
  }

  assertArrayEqual(
    policy.allowedActions,
    ["ADD", "SUBTRACT", "MULTIPLY", "DIVIDE"],
    "P03B6_VALIDATE_ACTIONS",
  );
  assert(policy.divisionPolicy.exactTerminationRequired === true, "P03B6_VALIDATE_DIVISION_TERMINATION");
  assertArrayEqual(
    policy.divisionPolicy.allowedReducedDenominatorPrimeFactors,
    [2, 5],
    "P03B6_VALIDATE_DIVISION_FACTORS",
  );

  assert(promotionRegistry.promotions.length === 1, "P03B6_VALIDATE_PROMOTION_COUNT");
  const promotion = promotionRegistry.promotions[0];
  assert(promotion.capabilityId === "cap_decimal_arithmetic", "P03B6_VALIDATE_PROMOTION_ID");
  assert(promotion.previousDeliveryStatus === "contract_only", "P03B6_VALIDATE_PROMOTION_BEFORE");
  assert(promotion.effectiveDeliveryStatus === "production_admitted", "P03B6_VALIDATE_PROMOTION_AFTER");
  assert(promotion.decimalNumberSystemDependencySatisfied === true, "P03B6_VALIDATE_NUMBER_SYSTEM_GATE");
  assert(promotion.decimalDomainValidatorDependencySatisfied === true, "P03B6_VALIDATE_DOMAIN_VALIDATOR_GATE");
  assert(promotion.nonTerminatingDecimalFailClosed === true, "P03B6_VALIDATE_NON_TERMINATING_BOUNDARY");
  assert(promotion.crossDomainNormalizationAllowed === false, "P03B6_VALIDATE_PROMOTION_SCOPE");
  assert(metrics.effectivePromotionCount === 11, "P03B6_VALIDATE_EFFECTIVE_PROMOTIONS");
  assert(metrics.remainingW3ContractCapabilityCount === 1, "P03B6_VALIDATE_REMAINING_W3");

  for (const [name, expected] of Object.entries(manifest.expectedCounts)) {
    if (Object.hasOwn(metrics, name) && expected !== 0) {
      assert(metrics[name] === expected, `P03B6_VALIDATE_COUNT:${name}:${metrics[name]}:${expected}`);
    }
  }

  assert(claim.actualEvidenceLevel === "E5_PRODUCTION_ADMITTED", "P03B6_VALIDATE_CLAIM_EVIDENCE");
  assert(claim.claims.runtimeIntegrated === true, "P03B6_VALIDATE_RUNTIME_CLAIM");
  assert(claim.claims.productionAdmitted === true, "P03B6_VALIDATE_PRODUCTION_CLAIM");
  assert(claim.claims.visibleOutputChanged === false, "P03B6_VALIDATE_VISIBLE_OUTPUT_CLAIM");
  assert(claim.claims.d0Complete === false, "P03B6_VALIDATE_D0_CLAIM");

  return Object.freeze({
    taskId: consumer.taskId,
    status: consumer.status,
    capabilityId: consumer.capabilityId,
    metrics,
    validation: Object.freeze({
      hardeningQueueEntryPassed: true,
      hardeningGateSatisfied: true,
      predecessorPromotionPassed: true,
      cohortSweepPassed: true,
      sourceKnowledgePointBindingSweepPassed: true,
      predecessorNumberSystemCoveragePassed: true,
      predecessorDomainValidatorCoveragePassed: true,
      promotionStatusPassed: true,
      historicalR04Preserved: true,
      scopeBoundaryPassed: true,
      milestoneClaimIntegrityPassed: true,
    }),
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.stdout.write(`${JSON.stringify(validateP03B6DecimalArithmeticConsumer(), null, 2)}\n`);
}
