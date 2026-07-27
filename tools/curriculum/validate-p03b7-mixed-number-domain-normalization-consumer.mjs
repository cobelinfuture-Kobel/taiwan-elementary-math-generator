import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP03B7MixedNumberDomainNormalizationConsumer } from "../../src/curriculum/full-product/p03b7-mixed-number-domain-normalization-consumer.mjs";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../..");
const CLAIM_PATH = path.join(ROOT, "data/project/milestones/FPL-P03B7.claim.json");

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

export function validateP03B7MixedNumberDomainNormalizationConsumer() {
  const consumer = materializeP03B7MixedNumberDomainNormalizationConsumer();
  const { manifest, policy, promotionRegistry, metrics, queueEntry } = consumer;
  const claim = readJson(CLAIM_PATH);
  const requiredGateCapabilityIds = [
    "cap_fraction_number_system",
    "cap_decimal_number_system",
    "cap_fraction_domain_validator",
    "cap_decimal_domain_validator",
    "cap_fraction_arithmetic",
    "cap_decimal_arithmetic",
  ];

  assert(
    consumer.capabilityId === "cap_mixed_number_domain_normalization",
    "P03B7_VALIDATE_CAPABILITY_ID",
  );
  assert(queueEntry?.queueOrder === 7, "P03B7_VALIDATE_QUEUE_ORDER");
  assertArrayEqual(
    queueEntry?.hardeningGateCapabilityIds ?? [],
    requiredGateCapabilityIds,
    "P03B7_VALIDATE_HARDENING_GATE",
  );
  assert(
    queueEntry?.nextTaskId === "P03B7_W3MixedNumberDomainNormalizationAdmission",
    "P03B7_VALIDATE_QUEUE_TASK",
  );
  assert(
    queueEntry?.deliveryStatusBeforeP03A === "contract_only",
    "P03B7_VALIDATE_HISTORICAL_STATUS",
  );
  for (const capabilityId of requiredGateCapabilityIds) {
    assert(
      consumer.predecessorPromotionRegistry.effectivePromotionCapabilityIds.includes(
        capabilityId,
      ),
      `P03B7_VALIDATE_PREDECESSOR_PROMOTION:${capabilityId}`,
    );
  }

  assert(
    consumer.fractionNumberSystem.status === "W3_FRACTION_NUMBER_SYSTEM_PRODUCTION_ADMITTED",
    "P03B7_VALIDATE_FRACTION_NUMBER_SYSTEM_RUNTIME",
  );
  assert(
    consumer.decimalNumberSystem.status === "W3_DECIMAL_NUMBER_SYSTEM_PRODUCTION_ADMITTED",
    "P03B7_VALIDATE_DECIMAL_NUMBER_SYSTEM_RUNTIME",
  );
  assert(
    consumer.fractionDomainValidator.status === "W3_FRACTION_DOMAIN_VALIDATOR_PRODUCTION_ADMITTED",
    "P03B7_VALIDATE_FRACTION_DOMAIN_VALIDATOR_RUNTIME",
  );
  assert(
    consumer.decimalDomainValidator.status === "W3_DECIMAL_DOMAIN_VALIDATOR_PRODUCTION_ADMITTED",
    "P03B7_VALIDATE_DECIMAL_DOMAIN_VALIDATOR_RUNTIME",
  );
  assert(
    consumer.fractionArithmetic.status === "W3_FRACTION_ARITHMETIC_PRODUCTION_ADMITTED",
    "P03B7_VALIDATE_FRACTION_ARITHMETIC_RUNTIME",
  );
  assert(
    consumer.decimalArithmetic.status === "W3_DECIMAL_ARITHMETIC_PRODUCTION_ADMITTED",
    "P03B7_VALIDATE_DECIMAL_ARITHMETIC_RUNTIME",
  );

  assert(
    metrics.effectiveDependentKnowledgePointCount
      === queueEntry.effectiveDependentKnowledgePointCount,
    "P03B7_VALIDATE_DEPENDENT_COUNT",
  );
  assert(
    metrics.directW3KnowledgePointCount === queueEntry.directW3KnowledgePointCount,
    "P03B7_VALIDATE_DIRECT_COUNT",
  );
  assert(
    metrics.protectedExistingD0KnowledgePointCount
      === queueEntry.protectedExistingD0KnowledgePointCount,
    "P03B7_VALIDATE_PROTECTED_COUNT",
  );
  assert(
    metrics.newProductDependentKnowledgePointCount
      === metrics.effectiveDependentKnowledgePointCount
        - metrics.protectedExistingD0KnowledgePointCount,
    "P03B7_VALIDATE_NEW_PRODUCT_COUNT",
  );
  assert(metrics.descriptorErrorCount === 0, "P03B7_VALIDATE_DESCRIPTOR_ERRORS");
  assert(consumer.descriptors.length > 0, "P03B7_VALIDATE_DESCRIPTOR_COUNT");
  assert(consumer.dependentSourceNodeIds.length > 0, "P03B7_VALIDATE_SOURCE_COUNT");
  assert(
    metrics.sourceKnowledgePointBindingCount >= metrics.effectiveDependentKnowledgePointCount,
    "P03B7_VALIDATE_SOURCE_BINDINGS",
  );

  const coverageMetricNames = [
    "predecessorFractionNumberSystemCoverageCount",
    "predecessorDecimalNumberSystemCoverageCount",
    "predecessorFractionDomainValidatorCoverageCount",
    "predecessorDecimalDomainValidatorCoverageCount",
  ];
  for (const metricName of coverageMetricNames) {
    assert(
      metrics[metricName] === metrics.effectiveDependentKnowledgePointCount,
      `P03B7_VALIDATE_PREDECESSOR_COVERAGE:${metricName}`,
    );
  }

  for (const descriptor of consumer.descriptors) {
    assert(
      descriptor.sourceDomains.includes("FRACTION")
        && descriptor.sourceDomains.includes("DECIMAL"),
      `P03B7_VALIDATE_SOURCE_DOMAINS:${descriptor.knowledgePointId}`,
    );
    assert(
      descriptor.fractionNumberSystemDescriptorId != null,
      `P03B7_VALIDATE_FRACTION_NUMBER_SYSTEM_DESCRIPTOR:${descriptor.knowledgePointId}`,
    );
    assert(
      descriptor.decimalNumberSystemDescriptorId != null,
      `P03B7_VALIDATE_DECIMAL_NUMBER_SYSTEM_DESCRIPTOR:${descriptor.knowledgePointId}`,
    );
    assert(
      descriptor.fractionDomainValidatorDescriptorId != null,
      `P03B7_VALIDATE_FRACTION_VALIDATOR_DESCRIPTOR:${descriptor.knowledgePointId}`,
    );
    assert(
      descriptor.decimalDomainValidatorDescriptorId != null,
      `P03B7_VALIDATE_DECIMAL_VALIDATOR_DESCRIPTOR:${descriptor.knowledgePointId}`,
    );
    assert(
      descriptor.productionAdmissionState === "PRODUCTION_ADMITTED",
      `P03B7_VALIDATE_ADMISSION:${descriptor.knowledgePointId}`,
    );
    assert(
      descriptor.recurringDecimalApproximationAllowed === false,
      `P03B7_VALIDATE_RECURRING_BOUNDARY:${descriptor.knowledgePointId}`,
    );
    assert(
      descriptor.questionGenerationAllowed === false,
      `P03B7_VALIDATE_GENERATOR_BOUNDARY:${descriptor.knowledgePointId}`,
    );
  }

  assertArrayEqual(
    policy.allowedActions,
    ["TO_FRACTION", "TO_DECIMAL", "EQUIVALENCE", "COMPARE"],
    "P03B7_VALIDATE_ACTIONS",
  );
  assert(
    policy.conversionRules.recurringDecimalApproximationAllowed === false,
    "P03B7_VALIDATE_APPROXIMATION_BOUNDARY",
  );

  assert(promotionRegistry.promotions.length === 1, "P03B7_VALIDATE_PROMOTION_COUNT");
  const promotion = promotionRegistry.promotions[0];
  assert(
    promotion.capabilityId === "cap_mixed_number_domain_normalization",
    "P03B7_VALIDATE_PROMOTION_ID",
  );
  assert(
    promotion.previousDeliveryStatus === "contract_only",
    "P03B7_VALIDATE_PROMOTION_BEFORE",
  );
  assert(
    promotion.effectiveDeliveryStatus === "production_admitted",
    "P03B7_VALIDATE_PROMOTION_AFTER",
  );
  assert(
    promotion.fractionNumberSystemDependencySatisfied === true
      && promotion.decimalNumberSystemDependencySatisfied === true
      && promotion.fractionDomainValidatorDependencySatisfied === true
      && promotion.decimalDomainValidatorDependencySatisfied === true
      && promotion.fractionArithmeticDependencySatisfied === true
      && promotion.decimalArithmeticDependencySatisfied === true,
    "P03B7_VALIDATE_PROMOTION_GATES",
  );
  assert(metrics.effectivePromotionCount === 12, "P03B7_VALIDATE_EFFECTIVE_PROMOTIONS");
  assert(
    metrics.remainingW3ContractCapabilityCount === 0,
    "P03B7_VALIDATE_REMAINING_W3",
  );

  for (const [name, expected] of Object.entries(manifest.expectedCounts)) {
    if (Object.hasOwn(metrics, name) && expected !== 0) {
      assert(
        metrics[name] === expected,
        `P03B7_VALIDATE_COUNT:${name}:${metrics[name]}:${expected}`,
      );
    }
  }

  assert(
    claim.actualEvidenceLevel === "E5_PRODUCTION_ADMITTED",
    "P03B7_VALIDATE_CLAIM_EVIDENCE",
  );
  assert(claim.claims.runtimeIntegrated === true, "P03B7_VALIDATE_RUNTIME_CLAIM");
  assert(claim.claims.productionAdmitted === true, "P03B7_VALIDATE_PRODUCTION_CLAIM");
  assert(claim.claims.visibleOutputChanged === false, "P03B7_VALIDATE_VISIBLE_OUTPUT_CLAIM");
  assert(claim.claims.d0Complete === false, "P03B7_VALIDATE_D0_CLAIM");

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
      predecessorCoveragePassed: true,
      promotionStatusPassed: true,
      allW3ContractCapabilitiesProductionAdmitted: true,
      historicalR04Preserved: true,
      scopeBoundaryPassed: true,
      milestoneClaimIntegrityPassed: true,
    }),
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.stdout.write(`${JSON.stringify(validateP03B7MixedNumberDomainNormalizationConsumer(), null, 2)}\n`);
}
