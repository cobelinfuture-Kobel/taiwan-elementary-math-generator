import {readFileSync as readTextFileSync} from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const m=read("data/curriculum/full-product/p08f/q022-postmerge-full-regression-compatibility-repair.json");
const impact=read("data/project/change-impact/P08F_W8_Q022_POSTMERGE_FULL_REGRESSION_COMPATIBILITY_REPAIR.impact.json");
const plan=read("data/project/validation-plans/P08F_W8_Q022_POSTMERGE_FULL_REGRESSION_COMPATIBILITY_REPAIR.validation.json");
test("Q022 postmerge attribution isolates six stale successor expectations and no product regression",()=>{
  assert.equal(m.exactFailureSetAttribution.node.addedFailures,6);assert.equal(m.exactFailureSetAttribution.node.removedFailures,1);
  assert.equal(m.exactFailureSetAttribution.mathCi.addedFailures,6);assert.equal(m.exactFailureSetAttribution.mathCi.removedFailures,1);
  assert.equal(m.exactFailureSetAttribution.q022ProductSemanticRegressionDetected,false);
  assert.equal(m.exactFailureSetAttribution.disposition,"SIX_STALE_SUCCESSOR_EXPECTATIONS_ONLY");
});
test("compatibility repair is historical-test-only and does not mutate Q022 product",()=>{
  for(const k of ["productRuntimeChanged","sourceAuthorityChanged","selectorRuntimeChanged","generatorChanged","validatorChanged","rendererChanged","worksheetRuntimeChanged","q022SemanticContractChanged","frozenQueueChanged"])assert.equal(m.repair[k],false,k);
  assert.equal(m.repair.mutationClass,"HISTORICAL_COMPATIBILITY_TEST_ONLY");assert.equal(m.repair.modifiedTests.length,6);
});
test("repair validation remains KP focused",()=>{
  assert.equal(impact.expectedDerivedGate,"KP_FOCUSED");assert.deepEqual(plan.lanes.KP_FOCUSED.map(x=>x.gateId),["FOCUSED_TEST","TARGETED_BROWSER_E2E","DIRECT_DEPENDENCY_CONTRACTS"]);
  assert.deepEqual(plan.forbidden,["FULL_NODE_REGRESSION","GLOBAL_BROWSER_REPLAY"]);
});

test("Q025 repair locks only the approved Q022 unit-conversion successor while preserving unrelated baseline debt",()=>{
  const text=readTextFileSync(new URL("../../tests/curriculum/p07f-w7-slice025-g6a-u08-average-relative-speed.test.js",import.meta.url),"utf8");
  assert.match(text,/q022-approved-successor/);
  assert.match(text,/assert\.equal\(unitConversion\.ok,true/);
  assert.match(text,/batch-a-selector-p08f01-extension/);
  assert.equal(plan.focusedBaselineException.baselineDebtRepairAllowed,false);
});
