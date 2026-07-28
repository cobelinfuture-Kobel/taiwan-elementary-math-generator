import test from "node:test";
import assert from "node:assert/strict";

import { validateP03FSlice012ProductAdmission } from "../../tools/curriculum/validate-p03f-slice012-product-admission.mjs";

test("P03F12 admits exactly one KP after reviewed Chromium artifacts", () => {
  const result = validateP03FSlice012ProductAdmission();
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.productAdmissionState, "PRODUCTION_ADMITTED_D0");
  assert.equal(result.d0Complete, true);
  assert.equal(result.artifactIntegrity.ok, true);
  assert.equal(result.metrics.queuePosition, 12);
  assert.equal(result.metrics.requiredCapabilityCount, 3);
  assert.equal(result.metrics.questionWitnessCount, 8);
  assert.equal(result.metrics.answerKeyWitnessCount, 8);
  assert.equal(result.metrics.newProductAdmissionCount, 1);
  assert.equal(result.metrics.cumulativeW3ProductAdmissionCount, 14);
  assert.equal(result.metrics.remainingDirectSliceCount, 41);
  assert.equal(result.metrics.remainingDirectKnowledgePointCount, 68);
});
