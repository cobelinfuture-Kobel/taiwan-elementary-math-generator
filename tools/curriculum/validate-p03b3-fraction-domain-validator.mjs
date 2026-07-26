import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP03B3FractionDomainValidator } from "../../src/curriculum/full-product/p03b3-fraction-domain-validator.mjs";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../..");
const CLAIM_PATH = path.join(ROOT, "data/project/milestones/FPL-P03B3.claim.json");

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

export function validateP03B3FractionDomainValidator() {
  const validator = materializeP03B3FractionDomainValidator();
  const { manifest, policy, promotionRegistry, metrics } = validator;
  const claim = readJson(CLAIM_PATH);

  assert(validator.capabilityId === "cap_fraction_domain_validator", "P03B3_VALIDATE_CAPABILITY_ID");
  assert(validator.queueEntry?.queueOrder === 3, "P03B3_VALIDATE_QUEUE_ORDER");
  assertArrayEqual(
    validator.queueEntry?.hardeningGateCapabilityIds ?? [],
    ["cap_fraction_number_system"],
    "P03B3_VALIDATE_HARDENING_GATE",
  );
  assert(
    validator.queueEntry?.nextTaskId === "P03B3_W3FractionDomainValidatorAdmission",
    "P03B3_VALIDATE_QUEUE_TASK",
  );
  assert(
    validator.queueEntry?.deliveryStatusBeforeP03A === "contract_only",
    "P03B3_VALIDATE_HISTORICAL_STATUS",
  );
  assert(
    validator.predecessorPromotionRegistry.effectivePromotionCapabilityIds.includes(
      "cap_fraction_number_system",
    ),
    "P03B3_VALIDATE_NUMBER_SYSTEM_PROMOTION",
  );
  assert(
    validator.fractionNumberSystem.status === "W3_FRACTION_NUMBER_SYSTEM_PRODUCTION_ADMITTED",
    "P03B3_VALIDATE_NUMBER_SYSTEM_RUNTIME",
  );

  for (const [name, expected] of Object.entries(manifest.expectedCounts)) {
    if (Object.hasOwn(metrics, name) && expected !== 0) {
      assert(metrics[name] === expected, `P03B3_VALIDATE_COUNT:${name}:${metrics[name]}:${expected}`);
    }
  }

  assert(metrics.descriptorErrorCount === 0, "P03B3_VALIDATE_DESCRIPTOR_ERRORS");
  assert(metrics.effectiveDependentKnowledgePointCount === 52, "P03B3_VALIDATE_DEPENDENT_COUNT");
  assert(metrics.directW3KnowledgePointCount === 40, "P03B3_VALIDATE_DIRECT_COUNT");
  assert(metrics.protectedExistingD0KnowledgePointCount === 1, "P03B3_VALIDATE_PROTECTED_COUNT");
  assert(metrics.newProductDependentKnowledgePointCount === 51, "P03B3_VALIDATE_NEW_PRODUCT_COUNT");
  assert(metrics.predecessorNumberSystemCoverageCount === 52, "P03B3_VALIDATE_PREDECESSOR_COVERAGE");
  assert(validator.descriptors.length === 52, "P03B3_VALIDATE_DESCRIPTOR_COUNT");
  assert(validator.dependentSourceNodeIds.length > 0, "P03B3_VALIDATE_SOURCE_COUNT");
  assert(metrics.sourceKnowledgePointBindingCount >= 52, "P03B3_VALIDATE_SOURCE_BINDINGS");

  for (const descriptor of validator.descriptors) {
    assert(descriptor.numericDomainId === "NON_NEGATIVE_RATIONAL", `P03B3_VALIDATE_DOMAIN:${descriptor.knowledgePointId}`);
    assert(descriptor.numberSystemCapabilityId === "cap_fraction_number_system", `P03B3_VALIDATE_NUMBER_SYSTEM_ID:${descriptor.knowledgePointId}`);
    assert(descriptor.numberSystemDescriptorId != null, `P03B3_VALIDATE_NUMBER_SYSTEM_DESCRIPTOR:${descriptor.knowledgePointId}`);
    assert(descriptor.productionAdmissionState === "PRODUCTION_ADMITTED", `P03B3_VALIDATE_ADMISSION:${descriptor.knowledgePointId}`);
    assert(descriptor.sourceNodeIds.length > 0, `P03B3_VALIDATE_SOURCE:${descriptor.knowledgePointId}`);
    assert(descriptor.arithmeticAllowed === false, `P03B3_VALIDATE_ARITHMETIC_BOUNDARY:${descriptor.knowledgePointId}`);
    assert(descriptor.decimalConversionAllowed === false, `P03B3_VALIDATE_DECIMAL_BOUNDARY:${descriptor.knowledgePointId}`);
  }

  assertArrayEqual(
    policy.allowedActions,
    ["VALIDATE_VALUE", "VALIDATE_PAIR", "VALIDATE_SET"],
    "P03B3_VALIDATE_ACTIONS",
  );
  assert(policy.allowedRelations.length === 6, "P03B3_VALIDATE_RELATION_COUNT");

  assert(promotionRegistry.promotions.length === 1, "P03B3_VALIDATE_PROMOTION_COUNT");
  const promotion = promotionRegistry.promotions[0];
  assert(promotion.capabilityId === "cap_fraction_domain_validator", "P03B3_VALIDATE_PROMOTION_ID");
  assert(promotion.previousDeliveryStatus === "contract_only", "P03B3_VALIDATE_PROMOTION_BEFORE");
  assert(promotion.effectiveDeliveryStatus === "production_admitted", "P03B3_VALIDATE_PROMOTION_AFTER");
  assert(promotion.fractionNumberSystemDependencySatisfied === true, "P03B3_VALIDATE_PROMOTION_GATE");
  assert(promotion.fractionArithmeticAllowed === false, "P03B3_VALIDATE_PROMOTION_ARITHMETIC_BOUNDARY");
  assert(metrics.effectivePromotionCount === 8, "P03B3_VALIDATE_EFFECTIVE_PROMOTIONS");
  assert(metrics.remainingW3ContractCapabilityCount === 4, "P03B3_VALIDATE_REMAINING_W3");

  assert(claim.actualEvidenceLevel === "E5_PRODUCTION_ADMITTED", "P03B3_VALIDATE_CLAIM_EVIDENCE");
  assert(claim.claims.runtimeIntegrated === true, "P03B3_VALIDATE_RUNTIME_CLAIM");
  assert(claim.claims.productionAdmitted === true, "P03B3_VALIDATE_PRODUCTION_CLAIM");
  assert(claim.claims.visibleOutputChanged === false, "P03B3_VALIDATE_VISIBLE_OUTPUT_CLAIM");
  assert(claim.claims.d0Complete === false, "P03B3_VALIDATE_D0_CLAIM");

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
  const result = validateP03B3FractionDomainValidator();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
