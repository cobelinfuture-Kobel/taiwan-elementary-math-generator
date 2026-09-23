import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP03B1FractionNumberSystemConsumer } from "../../src/curriculum/full-product/p03b1-fraction-number-system-consumer.mjs";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../..");
const CLAIM_PATH = path.join(ROOT, "data/project/milestones/FPL-P03B1.claim.json");

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

export function validateP03B1FractionNumberSystemConsumer() {
  const consumer = materializeP03B1FractionNumberSystemConsumer();
  const { manifest, policy, promotionRegistry, metrics } = consumer;
  const claim = readJson(CLAIM_PATH);

  assert(consumer.capabilityId === "cap_fraction_number_system", "P03B1_VALIDATE_CAPABILITY_ID");
  assert(consumer.queueEntry?.queueOrder === 1, "P03B1_VALIDATE_QUEUE_ORDER");
  assert(consumer.queueEntry?.readyForImplementationTask === true, "P03B1_VALIDATE_QUEUE_READY");
  assert(
    consumer.queueEntry?.nextTaskId === "P03B1_W3FractionNumberSystemConsumerAdmission",
    "P03B1_VALIDATE_QUEUE_TASK",
  );
  assert(
    consumer.queueEntry?.deliveryStatusBeforeP03A === "contract_only",
    "P03B1_VALIDATE_HISTORICAL_STATUS",
  );

  for (const [name, expected] of Object.entries(manifest.expectedCounts)) {
    if (Object.hasOwn(metrics, name) && expected !== 0) {
      assert(metrics[name] === expected, `P03B1_VALIDATE_COUNT:${name}:${metrics[name]}:${expected}`);
    }
  }

  assert(metrics.descriptorErrorCount === 0, "P03B1_VALIDATE_DESCRIPTOR_ERRORS");
  assert(metrics.effectiveDependentKnowledgePointCount === 73, "P03B1_VALIDATE_DEPENDENT_COUNT");
  assert(metrics.directW3KnowledgePointCount === 40, "P03B1_VALIDATE_DIRECT_COUNT");
  assert(metrics.protectedExistingD0KnowledgePointCount === 1, "P03B1_VALIDATE_PROTECTED_COUNT");
  assert(metrics.newProductDependentKnowledgePointCount === 72, "P03B1_VALIDATE_NEW_PRODUCT_COUNT");
  assert(consumer.descriptors.length === 73, "P03B1_VALIDATE_DESCRIPTOR_COUNT");
  assert(consumer.dependentSourceNodeIds.length > 0, "P03B1_VALIDATE_SOURCE_COUNT");
  assert(metrics.sourceKnowledgePointBindingCount >= 73, "P03B1_VALIDATE_SOURCE_BINDINGS");

  for (const descriptor of consumer.descriptors) {
    assert(descriptor.numericDomainId === "NON_NEGATIVE_RATIONAL", `P03B1_VALIDATE_DOMAIN:${descriptor.knowledgePointId}`);
    assert(descriptor.productionAdmissionState === "PRODUCTION_ADMITTED", `P03B1_VALIDATE_ADMISSION:${descriptor.knowledgePointId}`);
    assert(descriptor.sourceNodeIds.length > 0, `P03B1_VALIDATE_SOURCE:${descriptor.knowledgePointId}`);
    assert(descriptor.arithmeticAllowed === false, `P03B1_VALIDATE_ARITHMETIC_BOUNDARY:${descriptor.knowledgePointId}`);
    assert(descriptor.decimalConversionAllowed === false, `P03B1_VALIDATE_DECIMAL_BOUNDARY:${descriptor.knowledgePointId}`);
  }

  assert(policy.allowedActions.length === 4, "P03B1_VALIDATE_ACTION_COUNT");
  assertArrayEqual(
    policy.allowedActions,
    ["NORMALIZE", "EQUIVALENCE", "COMPARE", "EXPAND_EQUIVALENT"],
    "P03B1_VALIDATE_ACTIONS",
  );

  assert(promotionRegistry.promotions.length === 1, "P03B1_VALIDATE_PROMOTION_COUNT");
  const promotion = promotionRegistry.promotions[0];
  assert(promotion.capabilityId === "cap_fraction_number_system", "P03B1_VALIDATE_PROMOTION_ID");
  assert(promotion.previousDeliveryStatus === "contract_only", "P03B1_VALIDATE_PROMOTION_BEFORE");
  assert(promotion.effectiveDeliveryStatus === "production_admitted", "P03B1_VALIDATE_PROMOTION_AFTER");
  assert(promotion.exactRationalRepresentation === true, "P03B1_VALIDATE_EXACT_REPRESENTATION");
  assert(promotion.fractionArithmeticAllowed === false, "P03B1_VALIDATE_PROMOTION_ARITHMETIC_BOUNDARY");
  assert(promotion.decimalConversionAllowed === false, "P03B1_VALIDATE_PROMOTION_DECIMAL_BOUNDARY");
  assert(metrics.effectivePromotionCount === 6, "P03B1_VALIDATE_EFFECTIVE_PROMOTIONS");
  assert(metrics.remainingW3ContractCapabilityCount === 6, "P03B1_VALIDATE_REMAINING_W3");

  assert(claim.actualEvidenceLevel === "E5_PRODUCTION_ADMITTED", "P03B1_VALIDATE_CLAIM_EVIDENCE");
  assert(claim.claims.runtimeIntegrated === true, "P03B1_VALIDATE_RUNTIME_CLAIM");
  assert(claim.claims.productionAdmitted === true, "P03B1_VALIDATE_PRODUCTION_CLAIM");
  assert(claim.claims.visibleOutputChanged === false, "P03B1_VALIDATE_VISIBLE_OUTPUT_CLAIM");
  assert(claim.claims.d0Complete === false, "P03B1_VALIDATE_D0_CLAIM");

  return Object.freeze({
    taskId: consumer.taskId,
    status: consumer.status,
    capabilityId: consumer.capabilityId,
    metrics,
    validation: Object.freeze({
      hardeningQueueEntryPassed: true,
      cohortSweepPassed: true,
      sourceKnowledgePointBindingSweepPassed: true,
      promotionStatusPassed: true,
      historicalR04Preserved: true,
      scopeBoundaryPassed: true,
      milestoneClaimIntegrityPassed: true,
    }),
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = validateP03B1FractionNumberSystemConsumer();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
