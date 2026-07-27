import assert from "node:assert/strict";
import test from "node:test";

import {
  getP03CW3DownstreamUnblockRow,
  materializeP03CW3CapabilityCloseoutProductUnblockReconciliation,
} from "../../src/curriculum/full-product/p03c-w3-capability-closeout-product-unblock.mjs";
import { validateP03CW3CapabilityCloseoutProductUnblockReconciliation } from "../../tools/curriculum/validate-p03c-w3-capability-closeout-product-unblock.mjs";

test("P03C closes all seven W3 capabilities and unblocks the 119-row cohort", () => {
  const result = validateP03CW3CapabilityCloseoutProductUnblockReconciliation();
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.deepEqual(result.counts, {
    w3Capabilities: 7,
    productionAdmittedW3Capabilities: 7,
    remainingW3ContractCapabilities: 0,
    w3E5Claims: 7,
    effectivePromotions: 12,
    directW3KnowledgePoints: 82,
    dependentKnowledgePoints: 119,
    capabilityUnblockedKnowledgePoints: 119,
    capabilityBlockedKnowledgePoints: 0,
    protectedExistingD0KnowledgePoints: 4,
    newProductDependentKnowledgePoints: 115,
    dependentSources: 28,
    dependentWaves: 6,
    protectedD0CompatibilityRevalidationPending: 4,
    existingPublicPatternAcceptancePending: 0,
    patternBindingRequired: 0,
    publicProductVerticalSliceRequired: 115,
    currentProtectedProductAdmissions: 4,
    newProductAdmissions: 0,
  });
});

test("P03C preserves protected D0 admission while requiring compatibility revalidation", () => {
  const row = getP03CW3DownstreamUnblockRow("kp_g3a_u01_digit_arrangement_max_min");
  assert.ok(row);
  assert.equal(row.capabilityUnblocked, true);
  assert.equal(row.protectedExistingD0, true);
  assert.equal(row.productProductionAdmitted, true);
  assert.equal(row.productAdmissionState, "PROTECTED_D0_COMPATIBILITY_REVALIDATION_PENDING");
  assert.equal(row.newlyProductAdmittedByP03C, false);
});

test("P03C keeps new-product rows fail closed after capability unblock", () => {
  const runtime = materializeP03CW3CapabilityCloseoutProductUnblockReconciliation();
  const row = runtime.downstreamUnblockRows.find((candidate) => !candidate.protectedExistingD0);
  assert.ok(row);
  assert.equal(row.capabilityUnblocked, true);
  assert.equal(row.productProductionAdmitted, false);
  assert.equal(row.productAdmissionState, "PUBLIC_PRODUCT_VERTICAL_SLICE_REQUIRED");
  assert.equal(row.directNewProductAdmissionAllowed, false);
});
