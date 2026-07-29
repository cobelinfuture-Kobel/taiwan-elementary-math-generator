import test from "node:test";
import assert from "node:assert/strict";

import { validateP03FSlice013ProductAdmission } from "../../tools/curriculum/validate-p03f-slice013-product-admission.mjs";

test("P03F13 remains fail closed before reviewed Chromium artifacts", () => {
  const result = validateP03FSlice013ProductAdmission();
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.productAdmissionState, "RUNTIME_CONNECTED_PENDING_CHROMIUM_ACCEPTANCE");
  assert.equal(result.d0Complete, false);
  assert.equal(result.metrics.queuePosition, 13);
  assert.equal(result.metrics.knowledgePointCount, 2);
  assert.equal(result.metrics.patternSpecCount, 5);
  assert.equal(result.metrics.applicationPatternSpecCount, 1);
  assert.equal(result.metrics.globalContextBindingCount, 1);
  assert.equal(result.metrics.requiredCapabilityCount, 3);
  assert.equal(result.metrics.questionWitnessCount, 9);
  assert.equal(result.metrics.answerKeyWitnessCount, 9);
  assert.equal(result.metrics.newProductAdmissionCount, 0);
  assert.equal(result.metrics.cumulativeW3ProductAdmissionCount, 14);
  assert.equal(result.metrics.remainingDirectSliceCount, 41);
  assert.equal(result.metrics.remainingDirectKnowledgePointCount, 68);
});
