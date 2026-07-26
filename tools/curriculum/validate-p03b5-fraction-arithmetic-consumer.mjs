import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP03B5FractionArithmeticConsumer } from "../../src/curriculum/full-product/p03b5-fraction-arithmetic-consumer.mjs";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../..");
const CLAIM_PATH = path.join(ROOT, "data/project/milestones/FPL-P03B5.claim.json");

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

export function validateP03B5FractionArithmeticConsumer() {
  const consumer = materializeP03B5FractionArithmeticConsumer();
  const { manifest, policy, promotionRegistry, metrics } = consumer;
  const claim = readJson(CLAIM_PATH);

  assert(consumer.capabilityId === "cap_fraction_arithmetic", "P03B5_VALIDATE_CAPABILITY_ID");
  assert(consumer.queueEntry?.queueOrder === 5, "P03B5_VALIDATE_QUEUE_ORDER");
  assertArrayEqual(
    consumer.queueEntry?.hardeningGateCapabilityIds ?? [],
    ["cap_fraction_number_system", "cap_fraction_domain_validator"],
    "P03B5_VALIDATE_HARDENING_GATES",
  );
  assert(
    consumer.queueEntry?.nextTaskId === policy.queueTaskAlias,
    "P03B5_VALIDATE_QUEUE_TASK_ALIAS",
  );
  assert(
    consumer.queueEntry?.deliveryStatusBeforeP03A === "contract_only",
    "P03B5_VALIDATE_HISTORICAL_STATUS",
  );
  assert(
    consumer.predecessorPromotionRegistry.effectivePromotionCapabilityIds.includes(
      "cap_fraction_number_system",
    ),
    "P03B5_VALIDATE_NUMBER_SYSTEM_PROMOTION",
  );
  assert(
    consumer.predecessorPromotionRegistry.effectivePromotionCapabilityIds.includes(
      "cap_fraction_domain_validator",
    ),
    "P03B5_VALIDATE_DOMAIN_VALIDATOR_PROMOTION",
  );
  assert(
    consumer.fractionNumberSystem.status === "W3_FRACTION_NUMBER_SYSTEM_PRODUCTION_ADMITTED",
    "P03B5_VALIDATE_NUMBER_SYSTEM_RUNTIME",
  );
  assert(
    consumer.fractionDomainValidator.status === "W3_FRACTION_DOMAIN_VALIDATOR_PRODUCTION_ADMITTED",
    "P03B5_VALIDATE_DOMAIN_VALIDATOR_RUNTIME",
  );

  for (const [name, expected] of Object.entries(manifest.expectedCounts)) {
    if (Object.hasOwn(metrics, name) && expected !== 0) {
      assert(metrics[name] === expected, `P03B5_VALIDATE_COUNT:${name}:${metrics[name]}:${expected}`);
    }
  }

  assert(metrics.effectiveDependentKnowledgePointCount > 0, "P03B5_VALIDATE_DEPENDENT_COUNT");
  assert(metrics.directW3KnowledgePointCount > 0, "P03B5_VALIDATE_DIRECT_COUNT");
  assert(metrics.descriptorErrorCount === 0, "P03B5_VALIDATE_DESCRIPTOR_ERRORS");
  assert(
    metrics.predecessorNumberSystemCoverageCount === metrics.effectiveDependentKnowledgePointCount,
    "P03B5_VALIDATE_NUMBER_SYSTEM_COVERAGE",
  );
  assert(
    metrics.predecessorDomainValidatorCoverageCount === metrics.effectiveDependentKnowledgePointCount,
    "P03B5_VALIDATE_DOMAIN_VALIDATOR_COVERAGE",
  );
  assert(consumer.dependentSourceNodeIds.length > 0, "P03B5_VALIDATE_SOURCE_COUNT");
  assert(
    metrics.sourceKnowledgePointBindingCount >= metrics.effectiveDependentKnowledgePointCount,
    "P03B5_VALIDATE_SOURCE_BINDINGS",
  );

  for (const descriptor of consumer.descriptors) {
    assert(descriptor.numericDomainId === "NON_NEGATIVE_RATIONAL", `P03B5_VALIDATE_DOMAIN:${descriptor.knowledgePointId}`);
    assert(descriptor.numberSystemCapabilityId === "cap_fraction_number_system", `P03B5_VALIDATE_NUMBER_SYSTEM_ID:${descriptor.knowledgePointId}`);
    assert(descriptor.domainValidatorCapabilityId === "cap_fraction_domain_validator", `P03B5_VALIDATE_VALIDATOR_ID:${descriptor.knowledgePointId}`);
    assert(descriptor.numberSystemDescriptorId != null, `P03B5_VALIDATE_NUMBER_SYSTEM_DESCRIPTOR:${descriptor.knowledgePointId}`);
    assert(descriptor.domainValidatorDescriptorId != null, `P03B5_VALIDATE_DOMAIN_VALIDATOR_DESCRIPTOR:${descriptor.knowledgePointId}`);
    assert(descriptor.productionAdmissionState === "PRODUCTION_ADMITTED", `P03B5_VALIDATE_ADMISSION:${descriptor.knowledgePointId}`);
    assert(descriptor.sourceNodeIds.length > 0, `P03B5_VALIDATE_SOURCE:${descriptor.knowledgePointId}`);
    assert(descriptor.exactBigIntIntermediate === true, `P03B5_VALIDATE_EXACTNESS:${descriptor.knowledgePointId}`);
    assert(descriptor.floatingPointApproximationAllowed === false, `P03B5_VALIDATE_FLOAT_BOUNDARY:${descriptor.knowledgePointId}`);
    assert(descriptor.decimalArithmeticAllowed === false, `P03B5_VALIDATE_DECIMAL_BOUNDARY:${descriptor.knowledgePointId}`);
    assert(descriptor.crossDomainNormalizationAllowed === false, `P03B5_VALIDATE_CROSS_DOMAIN_BOUNDARY:${descriptor.knowledgePointId}`);
  }

  assertArrayEqual(
    policy.allowedActions,
    ["ADD", "SUBTRACT", "MULTIPLY", "DIVIDE"],
    "P03B5_VALIDATE_ACTIONS",
  );
  assert(policy.legacyCandidateBoundary.consumedAsArithmeticAuthority === false, "P03B5_VALIDATE_LEGACY_BOUNDARY");

  assert(promotionRegistry.promotions.length === 1, "P03B5_VALIDATE_PROMOTION_COUNT");
  const promotion = promotionRegistry.promotions[0];
  assert(promotion.capabilityId === "cap_fraction_arithmetic", "P03B5_VALIDATE_PROMOTION_ID");
  assert(promotion.previousDeliveryStatus === "contract_only", "P03B5_VALIDATE_PROMOTION_BEFORE");
  assert(promotion.effectiveDeliveryStatus === "production_admitted", "P03B5_VALIDATE_PROMOTION_AFTER");
  assert(promotion.fractionNumberSystemDependencySatisfied === true, "P03B5_VALIDATE_NUMBER_SYSTEM_GATE");
  assert(promotion.fractionDomainValidatorDependencySatisfied === true, "P03B5_VALIDATE_DOMAIN_VALIDATOR_GATE");
  assert(promotion.decimalArithmeticAllowed === false, "P03B5_VALIDATE_PROMOTION_DECIMAL_BOUNDARY");
  assert(metrics.effectivePromotionCount === 10, "P03B5_VALIDATE_EFFECTIVE_PROMOTIONS");
  assert(metrics.remainingW3ContractCapabilityCount === 2, "P03B5_VALIDATE_REMAINING_W3");

  assert(claim.actualEvidenceLevel === "E5_PRODUCTION_ADMITTED", "P03B5_VALIDATE_CLAIM_EVIDENCE");
  assert(claim.claims.runtimeIntegrated === true, "P03B5_VALIDATE_RUNTIME_CLAIM");
  assert(claim.claims.productionAdmitted === true, "P03B5_VALIDATE_PRODUCTION_CLAIM");
  assert(claim.claims.visibleOutputChanged === false, "P03B5_VALIDATE_VISIBLE_OUTPUT_CLAIM");
  assert(claim.claims.d0Complete === false, "P03B5_VALIDATE_D0_CLAIM");

  return Object.freeze({
    taskId: consumer.taskId,
    status: consumer.status,
    capabilityId: consumer.capabilityId,
    metrics,
    validation: Object.freeze({
      hardeningQueueEntryPassed: true,
      hardeningGatesSatisfied: true,
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
  const result = validateP03B5FractionArithmeticConsumer();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
