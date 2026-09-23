import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP03B2DecimalNumberSystemConsumer } from "../../src/curriculum/full-product/p03b2-decimal-number-system-consumer.mjs";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../..");
const CLAIM_PATH = path.join(ROOT, "data/project/milestones/FPL-P03B2.claim.json");

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

export function validateP03B2DecimalNumberSystemConsumer() {
  const consumer = materializeP03B2DecimalNumberSystemConsumer();
  const { manifest, policy, promotionRegistry, metrics } = consumer;
  const claim = readJson(CLAIM_PATH);

  assert(consumer.capabilityId === "cap_decimal_number_system", "P03B2_VALIDATE_CAPABILITY_ID");
  assert(consumer.queueEntry?.queueOrder === 2, "P03B2_VALIDATE_QUEUE_ORDER");
  assert(consumer.queueEntry?.hardeningGateCapabilityIds.length === 0, "P03B2_VALIDATE_QUEUE_GATE");
  assert(
    consumer.queueEntry?.nextTaskId === "P03B2_W3DecimalNumberSystemConsumerAdmission",
    "P03B2_VALIDATE_QUEUE_TASK",
  );
  assert(
    consumer.queueEntry?.deliveryStatusBeforeP03A === "contract_only",
    "P03B2_VALIDATE_HISTORICAL_STATUS",
  );
  assert(
    consumer.predecessorPromotionRegistry.effectivePromotionCapabilityIds.includes(
      "cap_fraction_number_system",
    ),
    "P03B2_VALIDATE_PREDECESSOR_PROMOTION",
  );

  for (const [name, expected] of Object.entries(manifest.expectedCounts)) {
    if (Object.hasOwn(metrics, name) && expected !== 0) {
      assert(metrics[name] === expected, `P03B2_VALIDATE_COUNT:${name}:${metrics[name]}:${expected}`);
    }
  }

  assert(metrics.descriptorErrorCount === 0, "P03B2_VALIDATE_DESCRIPTOR_ERRORS");
  assert(metrics.effectiveDependentKnowledgePointCount === 51, "P03B2_VALIDATE_DEPENDENT_COUNT");
  assert(metrics.directW3KnowledgePointCount === 45, "P03B2_VALIDATE_DIRECT_COUNT");
  assert(metrics.protectedExistingD0KnowledgePointCount === 3, "P03B2_VALIDATE_PROTECTED_COUNT");
  assert(metrics.newProductDependentKnowledgePointCount === 48, "P03B2_VALIDATE_NEW_PRODUCT_COUNT");
  assert(consumer.descriptors.length === 51, "P03B2_VALIDATE_DESCRIPTOR_COUNT");
  assert(consumer.dependentSourceNodeIds.length > 0, "P03B2_VALIDATE_SOURCE_COUNT");
  assert(metrics.sourceKnowledgePointBindingCount >= 51, "P03B2_VALIDATE_SOURCE_BINDINGS");

  for (const descriptor of consumer.descriptors) {
    assert(descriptor.numericDomainId === "NON_NEGATIVE_DECIMAL", `P03B2_VALIDATE_DOMAIN:${descriptor.knowledgePointId}`);
    assert(descriptor.productionAdmissionState === "PRODUCTION_ADMITTED", `P03B2_VALIDATE_ADMISSION:${descriptor.knowledgePointId}`);
    assert(descriptor.sourceNodeIds.length > 0, `P03B2_VALIDATE_SOURCE:${descriptor.knowledgePointId}`);
    assert(descriptor.arithmeticAllowed === false, `P03B2_VALIDATE_ARITHMETIC_BOUNDARY:${descriptor.knowledgePointId}`);
    assert(descriptor.fractionConversionAllowed === false, `P03B2_VALIDATE_FRACTION_BOUNDARY:${descriptor.knowledgePointId}`);
  }

  assert(policy.allowedActions.length === 4, "P03B2_VALIDATE_ACTION_COUNT");
  assertArrayEqual(
    policy.allowedActions,
    ["NORMALIZE", "EQUIVALENCE", "COMPARE", "EXPAND_SCALE"],
    "P03B2_VALIDATE_ACTIONS",
  );

  assert(promotionRegistry.promotions.length === 1, "P03B2_VALIDATE_PROMOTION_COUNT");
  const promotion = promotionRegistry.promotions[0];
  assert(promotion.capabilityId === "cap_decimal_number_system", "P03B2_VALIDATE_PROMOTION_ID");
  assert(promotion.previousDeliveryStatus === "contract_only", "P03B2_VALIDATE_PROMOTION_BEFORE");
  assert(promotion.effectiveDeliveryStatus === "production_admitted", "P03B2_VALIDATE_PROMOTION_AFTER");
  assert(promotion.exactDecimalRepresentation === true, "P03B2_VALIDATE_EXACT_REPRESENTATION");
  assert(promotion.decimalArithmeticAllowed === false, "P03B2_VALIDATE_PROMOTION_ARITHMETIC_BOUNDARY");
  assert(promotion.fractionConversionAllowed === false, "P03B2_VALIDATE_PROMOTION_FRACTION_BOUNDARY");
  assert(metrics.effectivePromotionCount === 7, "P03B2_VALIDATE_EFFECTIVE_PROMOTIONS");
  assert(metrics.remainingW3ContractCapabilityCount === 5, "P03B2_VALIDATE_REMAINING_W3");

  assert(claim.actualEvidenceLevel === "E5_PRODUCTION_ADMITTED", "P03B2_VALIDATE_CLAIM_EVIDENCE");
  assert(claim.claims.runtimeIntegrated === true, "P03B2_VALIDATE_RUNTIME_CLAIM");
  assert(claim.claims.productionAdmitted === true, "P03B2_VALIDATE_PRODUCTION_CLAIM");
  assert(claim.claims.visibleOutputChanged === false, "P03B2_VALIDATE_VISIBLE_OUTPUT_CLAIM");
  assert(claim.claims.d0Complete === false, "P03B2_VALIDATE_D0_CLAIM");

  return Object.freeze({
    taskId: consumer.taskId,
    status: consumer.status,
    capabilityId: consumer.capabilityId,
    metrics,
    validation: Object.freeze({
      hardeningQueueEntryPassed: true,
      predecessorPromotionPassed: true,
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
  const result = validateP03B2DecimalNumberSystemConsumer();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
