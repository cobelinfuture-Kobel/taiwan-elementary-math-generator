import test from "node:test";
import assert from "node:assert/strict";

import {
  estimateAddSubToUnit,
  isSupportedEstimateOperator
} from "../../../site/modules/curriculum/batch-a/context-estimate-core.js";

test("S43G2O context estimate core supports add and subtract", () => {
  assert.equal(isSupportedEstimateOperator("add"), true);
  assert.equal(isSupportedEstimateOperator("subtract"), true);
  assert.equal(isSupportedEstimateOperator("multiply"), false);
});

test("S43G2O context estimate core rounds both terms before add", () => {
  const result = estimateAddSubToUnit(1499, 2500, "add", 1000);
  assert.deepEqual(result, { roundedLeft: 1000, roundedRight: 3000, answer: 4000 });
});

test("S43G2O context estimate core rounds both terms before subtract", () => {
  const result = estimateAddSubToUnit(9499, 1500, "subtract", 1000);
  assert.deepEqual(result, { roundedLeft: 9000, roundedRight: 2000, answer: 7000 });
});
