import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildW02A08R3NumericRemediationReadback,
  materializeW02A08R3NumericRemediation,
  validateW02A08R3NumericRemediation,
  W02_A08R3_STATUS,
  W02_A08R4_TASK
} from '../../src/curriculum/application/w02-a08r3-numeric-surface-remediation.mjs';
import {
  validateStudentFacingOperationSurface,
  W02_A08R3_TARGET_FINDING_CODES
} from '../../src/curriculum/application/shared/student-facing-numeric-full-cohort-adapter-v4.mjs';

const materialized = materializeW02A08R3NumericRemediation();
const pkg = materialized.a06Package;
const itemByPattern = new Map(pkg.generatedItems.map((item) => [item.patternSpecId, item]));
const specByPattern = new Map(pkg.specs.map((spec) => [spec.patternSpecId, spec]));
const issueCodes = (result) => result.issues.map((row) => row.code);
const keys = (item) => Object.keys(item.givenRoleValues).sort();

function validateMutated(patternSpecId, mutate) {
  const spec = specByPattern.get(patternSpecId);
  const item = structuredClone(itemByPattern.get(patternSpecId));
  mutate(item);
  return validateStudentFacingOperationSurface({ spec, item });
}

test('A08R3 covers all 71 numeric operation-role contracts with zero blocking findings', () => {
  const result = buildW02A08R3NumericRemediationReadback();
  assert.equal(result.ok, true, JSON.stringify(result.issues, null, 2));
  assert.equal(result.status, W02_A08R3_STATUS);
  assert.deepEqual(result.counts, {
    generatedItemCount: 195,
    numericQuestionCount: 134,
    applicationQuestionCount: 61,
    pblTaskSetCount: 31,
    operationFamilyCount: 49,
    operationRoleContractCount: 71,
    historicalAffectedItemCount: 45
  });
  assert.deepEqual(result.audit.counts, {
    unresolvedRequestedUnknown: 0,
    answerEquivalentOrNonMinimalGivenSet: 0,
    malformedOrIncoherentSurface: 0,
    gradeUnsafeNotation: 0
  });
  assert.equal(result.historicalFindingReadback.every((row) => row.ok), true);
  assert.equal(result.thirdOperatorReviewReady, true);
  assert.equal(result.productionAdmissionGranted, false);
  assert.equal(result.publicSelectable, false);
  assert.equal(result.nextShortestStep, W02_A08R4_TASK);
});

test('all 134 numeric items are explicit, minimal, grade-safe and validator-clean', () => {
  assert.equal(pkg.numericItems.length, 134);
  for (const item of pkg.numericItems) {
    const spec = specByPattern.get(item.patternSpecId);
    const validation = validateStudentFacingOperationSurface({ spec, item });
    assert.equal(validation.ok, true, `${item.patternSpecId}\n${item.prompt}\n${JSON.stringify(validation.issues)}`);
    assert.equal(item.studentFacingSurfaceVersion, 'W02_A08R3_V1');
    assert.equal(item.studentFacingSemanticRevision, 4);
    assert.equal(/指定數量|求計算結果|\bx\s*\/\s*\d+/i.test(item.prompt), false, item.prompt);
    assert.equal(/^\s*[\[(].*[,，].*[\])]/.test(String(item.answerText)), false, String(item.answerText));
    assert.equal(Object.prototype.hasOwnProperty.call(item.givenRoleValues, item.requestedUnknownRole), false, item.generatedItemId);
  }
});

test('answer-equivalent and redundant givens are removed from representative families', () => {
  const mixedWhole = itemByPattern.get('ps_g4a_u06_improper_mixed_conversion_whole_numeric');
  const mixedRemainder = itemByPattern.get('ps_g4a_u06_improper_mixed_conversion_remainder_numeric');
  assert.deepEqual(keys(mixedWhole), ['denominator', 'numerator']);
  assert.deepEqual(keys(mixedRemainder), ['denominator', 'numerator']);

  const commonMultiples = itemByPattern.get('ps_g5a_u03a1_common_multiple_lcm_common_multiples_numeric');
  const leastCommonMultiple = itemByPattern.get('ps_g5a_u03a1_common_multiple_lcm_least_common_multiple_numeric');
  assert.deepEqual(keys(commonMultiples), ['left', 'right']);
  assert.deepEqual(keys(leastCommonMultiple), ['left', 'right']);
  assert.equal(commonMultiples.prompt.includes('最小的三個正公倍數'), true, commonMultiples.prompt);

  const bounded = itemByPattern.get('ps_g5a_u03a_bounded_or_nearest_multiple_bounded_multiples_numeric');
  const nearest = itemByPattern.get('ps_g5a_u03a_bounded_or_nearest_multiple_nearest_numeric');
  assert.deepEqual(keys(bounded), ['base', 'lower', 'upper']);
  assert.deepEqual(keys(nearest), ['base', 'lower', 'target', 'upper']);

  const simplestNumerator = itemByPattern.get('ps_g5a_u04_expand_reduce_simplest_simplest_numerator_numeric');
  const simplestDenominator = itemByPattern.get('ps_g5a_u04_expand_reduce_simplest_simplest_denominator_numeric');
  const commonFactor = itemByPattern.get('ps_g5a_u04_expand_reduce_simplest_common_factor_numeric');
  assert.deepEqual(keys(simplestNumerator), ['denominator', 'numerator']);
  assert.deepEqual(keys(simplestDenominator), ['denominator', 'numerator']);
  assert.deepEqual(keys(commonFactor), ['denominator', 'numerator']);
});

test('relations are bounded, coherent and expressed with elementary-grade notation', () => {
  const coordinate = itemByPattern.get('ps_g4a_u06_fraction_number_line_coordinate_numeric');
  const distance = itemByPattern.get('ps_g4a_u06_fraction_number_line_distance_numeric');
  assert.deepEqual(keys(coordinate), ['origin', 'stepCount', 'unitStep']);
  assert.deepEqual(keys(distance), ['coordinate', 'origin']);

  const missing = itemByPattern.get('ps_g4a_u09_missing_digit_inequality_possible_digits_numeric');
  assert.deepEqual(keys(missing), ['left', 'right']);
  assert.equal(missing.prompt.includes('＜'), true, missing.prompt);

  const bounds = itemByPattern.get('ps_g4b_u08_mixed_fraction_order_constraints_possible_values_numeric');
  assert.equal(bounds.prompt, '分母是8、大於1/4且小於3/4的分數有哪些？');
  assert.equal(bounds.answerText, '3/8、4/8、5/8');

  const inverse = itemByPattern.get('ps_g5a_u01_inverse_rounding_range_range_numeric');
  assert.equal(inverse.answerText, '大於或等於3.45且小於3.55');
  assert.equal(inverse.answerText.includes('['), false);
});

test('validators fail closed for all four reviewed defect classes', () => {
  const unresolved = validateMutated('ps_g3a_u08_same_denominator_compare_comparison_numeric', (item) => {
    item.prompt = '已知兩個分數，求指定數量。';
  });
  assert.equal(issueCodes(unresolved).includes(W02_A08R3_TARGET_FINDING_CODES.unresolved), true);

  const leakage = validateMutated('ps_g4b_u06_rate_distance_context_total_numeric', (item) => {
    item.givenRoleValues.total = item.answer;
  });
  assert.equal(issueCodes(leakage).includes(W02_A08R3_TARGET_FINDING_CODES.givenSet), true);

  const incoherent = validateMutated('ps_g5a_u03a_multiple_identify_enumerate_multiples_numeric', (item) => {
    item.prompt = '列出4的倍數。';
  });
  assert.equal(issueCodes(incoherent).includes(W02_A08R3_TARGET_FINDING_CODES.malformed), true);

  const unsafe = validateMutated('ps_g4b_u08_mixed_fraction_order_constraints_possible_values_numeric', (item) => {
    item.prompt = '找出x/8介於1/4與3/4之間的所有值。';
  });
  assert.equal(issueCodes(unsafe).includes(W02_A08R3_TARGET_FINDING_CODES.notation), true);
});

test('application/PBL remain revision 3 and production boundaries remain closed', () => {
  assert.equal(pkg.applicationItems.every((item) => item.studentFacingSurfaceVersion === 'W02_A08R1_V1'
    && item.studentFacingSemanticRevision === 3), true);
  assert.equal(pkg.pblTaskSetRecords.every((record) => record.studentFacingInstantiationVersion === 'W02_A08R1_V1'
    && record.studentFacingSemanticRevision === 3), true);

  const premature = structuredClone(materialized);
  premature.a06Package.generatedItems[0].productionSelectable = true;
  assert.equal(issueCodes(validateW02A08R3NumericRemediation(premature)).includes('POSTG_APP_W02_A08R3_PREMATURE_ADMISSION'), true);
}
);
