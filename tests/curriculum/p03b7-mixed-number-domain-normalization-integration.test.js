import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP03B7MixedNumberDomainNormalizationConsumer } from "../../src/curriculum/full-product/p03b7-mixed-number-domain-normalization-consumer.mjs";
import { validateP03B7MixedNumberDomainNormalizationConsumer } from "../../tools/curriculum/validate-p03b7-mixed-number-domain-normalization-consumer.mjs";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../..");

function readJson(repoPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, repoPath), "utf8"));
}

test("P03B7 admission validator closes the six-capability hardening gate", () => {
  const result = validateP03B7MixedNumberDomainNormalizationConsumer();
  assert.equal(result.capabilityId, "cap_mixed_number_domain_normalization");
  assert.equal(result.status, "W3_MIXED_NUMBER_DOMAIN_NORMALIZATION_PRODUCTION_ADMITTED");
  assert.equal(result.validation.hardeningQueueEntryPassed, true);
  assert.equal(result.validation.hardeningGateSatisfied, true);
  assert.equal(result.validation.predecessorPromotionPassed, true);
  assert.equal(result.validation.predecessorCoveragePassed, true);
  assert.equal(result.validation.allW3ContractCapabilitiesProductionAdmitted, true);
  assert.equal(result.validation.historicalR04Preserved, true);
  assert.equal(result.validation.scopeBoundaryPassed, true);
  assert.equal(result.validation.milestoneClaimIntegrityPassed, true);
});

test("P03B7 promotion extends P03B6 and closes the W3 contract-only set", () => {
  const consumer = materializeP03B7MixedNumberDomainNormalizationConsumer();
  const expectedPredecessors = [
    "cap_fraction_number_system",
    "cap_decimal_number_system",
    "cap_fraction_domain_validator",
    "cap_decimal_domain_validator",
    "cap_fraction_arithmetic",
    "cap_decimal_arithmetic",
  ];
  for (const capabilityId of expectedPredecessors) {
    assert.ok(
      consumer.predecessorPromotionRegistry.effectivePromotionCapabilityIds.includes(
        capabilityId,
      ),
    );
  }
  assert.equal(
    consumer.promotionRegistry.predecessorPromotionRegistryPath,
    "data/curriculum/full-product/p03b6/w3-capability-promotion-registry.json",
  );
  assert.equal(consumer.metrics.newPromotionCount, 1);
  assert.equal(consumer.metrics.effectivePromotionCount, 12);
  assert.equal(consumer.metrics.remainingW3ContractCapabilityCount, 0);
  assert.deepEqual(consumer.promotionRegistry.remainingW3ContractCapabilityIds, []);
  assert.ok(
    consumer.effectivePromotionCapabilityIds.includes(
      "cap_mixed_number_domain_normalization",
    ),
  );
});

test("P03B7 executes exact normalization across every dependent KnowledgePoint", () => {
  const consumer = materializeP03B7MixedNumberDomainNormalizationConsumer();
  assert.ok(consumer.descriptors.length > 0);

  for (const descriptor of consumer.descriptors) {
    const base = {
      knowledgePointId: descriptor.knowledgePointId,
      sourceNodeId: descriptor.sourceNodeIds[0],
      assertedCapabilityId: "cap_mixed_number_domain_normalization",
    };

    const toFraction = consumer.execute({
      ...base,
      action: "TO_FRACTION",
      sourceDomain: "DECIMAL",
      value: "0.5",
    });
    assert.equal(toFraction.ok, true, descriptor.knowledgePointId);
    assert.equal(toFraction.result.canonicalRationalIdentity, "1/2");

    const toDecimal = consumer.execute({
      ...base,
      action: "TO_DECIMAL",
      sourceDomain: "FRACTION",
      value: { numerator: 1, denominator: 4 },
    });
    assert.equal(toDecimal.ok, true, descriptor.knowledgePointId);
    assert.equal(toDecimal.result.canonicalValue.canonicalText, "0.25");

    const equivalence = consumer.execute({
      ...base,
      action: "EQUIVALENCE",
      leftDomain: "FRACTION",
      leftValue: { numerator: 3, denominator: 4 },
      rightDomain: "DECIMAL",
      rightValue: "0.75",
    });
    assert.equal(equivalence.ok, true, descriptor.knowledgePointId);
    assert.equal(equivalence.result.equivalent, true, descriptor.knowledgePointId);
  }
});

test("P03B7 preserves historical R04 and product boundaries", () => {
  const consumer = materializeP03B7MixedNumberDomainNormalizationConsumer();
  const r04 = readJson("data/curriculum/global/runtime/r04/shared-runtime-capabilities.json");
  const historical = r04.capabilities.find(
    (row) => row.capabilityId === "cap_mixed_number_domain_normalization",
  );
  assert.ok(historical);
  assert.equal(historical.status, "contract_only");

  assert.equal(consumer.manifest.mainlineBoundary.allW3ContractCapabilitiesProductionAdmitted, true);
  assert.equal(consumer.manifest.mainlineBoundary.crossDomainNormalizationProductionAdmitted, true);
  assert.equal(consumer.manifest.mainlineBoundary.newProductAdmissionChanged, false);
  assert.equal(consumer.manifest.mainlineBoundary.protectedExistingD0ProductAdmissionChanged, false);
  assert.equal(consumer.manifest.mainlineBoundary.formalMappingImplementationStarted, false);
  assert.equal(consumer.manifest.mainlineBoundary.patternSpecImplementationStarted, false);
  assert.equal(consumer.manifest.mainlineBoundary.questionGeneratorImplementationStarted, false);
  assert.equal(consumer.manifest.mainlineBoundary.publicUiChanged, false);
  assert.equal(consumer.manifest.mainlineBoundary.worksheetRendererChanged, false);
  assert.equal(consumer.manifest.exactAcceptance.chromiumRequired, false);
});

test("P03B7 manifest and claim identify the next reconciliation boundary", () => {
  const manifest = readJson(
    "data/curriculum/full-product/p03b7/mixed-number-domain-normalization.manifest.json",
  );
  const claim = readJson("data/project/milestones/FPL-P03B7.claim.json");

  assert.equal(manifest.status, "W3_MIXED_NUMBER_DOMAIN_NORMALIZATION_PRODUCTION_ADMITTED");
  assert.equal(
    manifest.mainlineBoundary.nextTask,
    "P03C_W3CapabilityCloseoutAndProductUnblockReconciliation",
  );
  assert.equal(manifest.mainlineBoundary.nextTaskRequiresSeparateApproval, true);
  assert.equal(claim.actualEvidenceLevel, "E5_PRODUCTION_ADMITTED");
  assert.equal(claim.claims.productionAdmitted, true);
  assert.equal(claim.claims.visibleOutputChanged, false);
  assert.equal(claim.claims.d0Complete, false);
  assert.equal(
    claim.nextStep.taskId,
    "P03C_W3CapabilityCloseoutAndProductUnblockReconciliation",
  );
});
