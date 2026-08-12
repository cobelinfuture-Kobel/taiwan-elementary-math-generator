import test from "node:test";
import assert from "node:assert/strict";

import { materializeP03B7MixedNumberDomainNormalizationConsumer } from "../../src/curriculum/full-product/p03b7-mixed-number-domain-normalization-consumer.mjs";
import {
  executeSharedMixedDomainNormalization,
  exactDecimalToFraction,
  exactFractionToDecimal,
  exactMixedDomainEquivalence,
  exactMixedDomainCompare,
} from "../../site/modules/curriculum/public/shared-mixed-domain-normalizer-p03f32.js";

const KP = "kp_g6b_u01_decimal_fraction_conversion";
const SOURCE = "g6b_u01_6b01";
const p03b7 = materializeP03B7MixedNumberDomainNormalizationConsumer();
const base = {
  knowledgePointId: KP,
  sourceNodeId: SOURCE,
  assertedCapabilityId: "cap_mixed_number_domain_normalization",
};

test("P03F32 browser-safe mixed-domain normalizer exactly reduces decimal to fraction", () => {
  const cases = [
    ["0.5", 1, 2],
    ["0.75", 3, 4],
    ["0.24", 6, 25],
    ["0.125", 1, 8],
    ["1.8", 9, 5],
    ["2.40", 12, 5],
  ];
  for (const [decimal, numerator, denominator] of cases) {
    const result = exactDecimalToFraction(decimal);
    assert.equal(result.ok, true);
    assert.equal(result.canonicalValue.numerator, numerator);
    assert.equal(result.canonicalValue.denominator, denominator);
    assert.equal(result.canonicalValue.numericDomainId, "NON_NEGATIVE_RATIONAL");
    assert.equal(result.canonicalValue.valueForm, "REDUCED_IMPROPER_FRACTION");
    assert.equal(result.canonicalValue.isReduced, true);
    assert.equal(result.canonicalValue.exact, true);
    assert.equal(result.canonicalRationalIdentity, `${numerator}/${denominator}`);
    assert.equal(result.exact, true);
  }
});

test("P03F32 browser-safe mixed-domain normalizer admits terminating fractions only", () => {
  const cases = [
    [{ numerator:1, denominator:2 }, "0.5"],
    [{ numerator:3, denominator:4 }, "0.75"],
    [{ numerator:3, denominator:8 }, "0.375"],
    [{ numerator:7, denominator:20 }, "0.35"],
    [{ numerator:29, denominator:25 }, "1.16"],
  ];
  for (const [fraction, decimal] of cases) {
    const result = exactFractionToDecimal(fraction);
    assert.equal(result.ok, true);
    assert.equal(result.canonicalValue.canonicalText, decimal);
    assert.equal(result.exact, true);
  }
  for (const fraction of [{numerator:1,denominator:3},{numerator:2,denominator:7},{numerator:5,denominator:6}]) {
    const blocked = executeSharedMixedDomainNormalization({ action:"TO_DECIMAL", sourceDomain:"FRACTION", value:fraction });
    assert.equal(blocked.ok, false);
    assert.ok(blocked.errors.includes("MIXED_DOMAIN_NON_TERMINATING_DECIMAL"));
  }
});

test("P03F32 browser projection remains exact and fail-closed for invalid domain values", () => {
  const invalidRequests = [
    { action:"TO_DECIMAL", sourceDomain:"FRACTION", value:{numerator:1,denominator:0} },
    { action:"TO_DECIMAL", sourceDomain:"FRACTION", value:{numerator:-1,denominator:2} },
    { action:"TO_FRACTION", sourceDomain:"DECIMAL", value:"-0.5" },
    { action:"TO_FRACTION", sourceDomain:"DECIMAL", value:"1e-3" },
    { action:"ADD", sourceDomain:"DECIMAL", value:"0.5" },
  ];
  for (const request of invalidRequests) {
    assert.equal(executeSharedMixedDomainNormalization(request).ok, false);
  }
});

test("P03F32 browser projection matches P03B7 canonical identities for exact conversions", () => {
  for (const decimal of ["0.5","0.75","0.24","0.125","1.8","2.4"]) {
    const canonical = p03b7.execute({ ...base, action:"TO_FRACTION", sourceDomain:"DECIMAL", value:decimal });
    const browser = executeSharedMixedDomainNormalization({ action:"TO_FRACTION", sourceDomain:"DECIMAL", value:decimal });
    assert.equal(canonical.ok, true, JSON.stringify(canonical.errors));
    assert.equal(browser.ok, true, JSON.stringify(browser.errors));
    assert.equal(browser.canonicalRationalIdentity, canonical.result.canonicalRationalIdentity);
    assert.deepEqual(browser.canonicalValue, canonical.result.canonicalValue);
  }

  for (const fraction of [
    {numerator:1,denominator:2},
    {numerator:3,denominator:4},
    {numerator:3,denominator:8},
    {numerator:7,denominator:20},
    {numerator:29,denominator:25},
  ]) {
    const canonical = p03b7.execute({ ...base, action:"TO_DECIMAL", sourceDomain:"FRACTION", value:fraction });
    const browser = executeSharedMixedDomainNormalization({ action:"TO_DECIMAL", sourceDomain:"FRACTION", value:fraction });
    assert.equal(canonical.ok, true, JSON.stringify(canonical.errors));
    assert.equal(browser.ok, true, JSON.stringify(browser.errors));
    assert.equal(browser.canonicalRationalIdentity, canonical.result.canonicalRationalIdentity);
    assert.equal(browser.canonicalValue.canonicalText, canonical.result.canonicalValue.canonicalText);
  }
});

test("P03F32 internal equivalence/compare helpers are exact but are not learner pattern surfaces", () => {
  assert.equal(exactMixedDomainEquivalence({ leftDomain:"DECIMAL", leftValue:"0.75", rightDomain:"FRACTION", rightValue:{numerator:3,denominator:4} }).equivalent, true);
  assert.equal(exactMixedDomainCompare({ leftDomain:"DECIMAL", leftValue:"0.75", rightDomain:"FRACTION", rightValue:{numerator:4,denominator:5} }).relation, "LESS_THAN");
});
