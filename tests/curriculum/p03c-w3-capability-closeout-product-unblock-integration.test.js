import assert from "node:assert/strict";
import test from "node:test";

import { materializeP03W3ProductAdmissionInventory } from "../../src/curriculum/full-product/p03-w3-product-admission-inventory.mjs";
import { materializeP03CW3CapabilityCloseoutProductUnblockReconciliation } from "../../src/curriculum/full-product/p03c-w3-capability-closeout-product-unblock.mjs";

test("P03C overlays successor promotions without mutating the P03 historical inventory", () => {
  const historical = materializeP03W3ProductAdmissionInventory();
  const closeout = materializeP03CW3CapabilityCloseoutProductUnblockReconciliation();

  assert.equal(historical.metrics.capabilityBlockedNewProductCount, 115);
  assert.equal(historical.metrics.capabilityUnblockedNewProductCount, 0);
  assert.equal(closeout.metrics.capabilityBlockedKnowledgePointCount, 0);
  assert.equal(closeout.metrics.capabilityUnblockedKnowledgePointCount, 119);
  assert.equal(closeout.metrics.newProductAdmissionCount, 0);
  assert.equal(closeout.metrics.currentProtectedProductAdmissionCount, 4);
});

test("P03C final successor authority contains every W3 capability and no W3 contract remainder", () => {
  const closeout = materializeP03CW3CapabilityCloseoutProductUnblockReconciliation();
  assert.equal(closeout.capabilityCloseoutRows.length, 7);
  assert.equal(closeout.capabilityCloseoutRows.every((row) => row.closeoutState === "W3_CAPABILITY_PRODUCTION_ADMISSION_CLOSED"), true);
  assert.deepEqual(closeout.finalPromotionRegistry.remainingW3ContractCapabilityIds, []);
  assert.equal(closeout.requiredW3CapabilityIds.every((id) => closeout.effectivePromotionCapabilityIds.includes(id)), true);
});
