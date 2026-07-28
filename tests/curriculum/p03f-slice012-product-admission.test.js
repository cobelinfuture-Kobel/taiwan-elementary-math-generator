import test from "node:test";
import assert from "node:assert/strict";

import { validateP03FSlice012ProductAdmission } from "../../tools/curriculum/validate-p03f-slice012-product-admission.mjs";

test("P03F12 remains fail closed before reviewed Chromium artifacts", () => {
  const result = validateP03FSlice012ProductAdmission();
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.productAdmissionState, "RUNTIME_CONNECTED_PENDING_CHROMIUM_ACCEPTANCE");
  assert.equal(result.d0Complete, false);
  assert.equal(result.metrics.queuePosition, 12);
  assert.equal(result.metrics.requiredCapabilityCount, 3);
  assert.equal(result.metrics.questionWitnessCount, 8);
  assert.equal(result.metrics.answerKeyWitnessCount, 8);
  assert.equal(result.metrics.newProductAdmissionCount, 0);
  assert.equal(result.metrics.cumulativeW3ProductAdmissionCount, 13);
  assert.equal(result.metrics.remainingDirectSliceCount, 42);
  assert.equal(result.metrics.remainingDirectKnowledgePointCount, 69);
});
