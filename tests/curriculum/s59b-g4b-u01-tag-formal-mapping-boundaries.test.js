import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const contractUrl = new URL(
  '../../data/curriculum/contracts/S59B_G4B_U01_TagRegistryFormalMappingAndBoundaryDesign.json',
  import.meta.url,
);
const contract = JSON.parse(readFileSync(contractUrl, 'utf8'));

const unique = (values) => new Set(values).size === values.length;

function getMapping(patternSpecId) {
  return contract.formalMappings.find((row) => row.patternSpecId === patternSpecId);
}

test('S59B maps all nine approved KnowledgePoints to twelve deterministic FormalMappings', () => {
  assert.equal(contract.task, 'S59B_G4B_U01_TagRegistryFormalMappingAndBoundaryDesign');
  assert.equal(contract.knowledgePointMappings.length, 9);
  assert.equal(contract.formalMappings.length, 12);
  assert.ok(unique(contract.knowledgePointMappings.map((row) => row.knowledgePointId)));
  assert.ok(unique(contract.formalMappings.map((row) => row.patternSpecId)));

  const kpIds = new Set(contract.knowledgePointMappings.map((row) => row.knowledgePointId));
  for (const mapping of contract.formalMappings) {
    assert.ok(kpIds.has(mapping.knowledgePointId));
    assert.equal(mapping.equationShape === 'a*b' || mapping.equationShape === 'a/b', true);
    assert.equal(mapping.validatorHooks.includes('validateG4BU01Identity'), true);
    assert.equal(mapping.validatorHooks.includes('validateG4BU01HorizontalOnly'), true);
  }

  const expectedIds = contract.knowledgePointMappings.flatMap((row) => row.patternSpecIds);
  assert.deepEqual(new Set(expectedIds), new Set(contract.formalMappings.map((row) => row.patternSpecId)));
});

test('S59B freezes the public horizontal-only and no-fallback boundary', () => {
  assert.equal(contract.scope.representation, 'horizontal_only');
  assert.equal(contract.scope.applicationProblems, 'forbidden_in_core');
  assert.equal(contract.scope.verticalAlgorithm, 'evidence_only');
  assert.equal(contract.scope.missingDigit, 'deferred_extension');
  assert.equal(contract.scope.genericFallbackAllowed, false);
  assert.equal(contract.scope.maximumFinalValue, 9_999_999);
  assert.ok(contract.globalInvariants.includes('no vertical algorithm markup or application wording is emitted'));
  assert.ok(contract.globalInvariants.includes('validator failure produces zero canonical output and no fallback'));
});

test('S59B distinguishes multiplication zero-position families exactly', () => {
  const internal = getMapping('ps_g4b_u01_multiplier_internal_zero');
  assert.equal(
    internal.zeroPolicy,
    'b_has_at_least_one_internal_zero_and_nonzero_leading_and_ones_digits',
  );

  assert.equal(
    getMapping('ps_g4b_u01_multiplier_trailing_zero').zeroPolicy,
    'a_not_divisible_by_10_and_b_trailing_zero_count_1_to_3',
  );
  assert.equal(
    getMapping('ps_g4b_u01_multiplicand_trailing_zero').zeroPolicy,
    'a_trailing_zero_count_1_to_3_and_b_not_divisible_by_10',
  );
  assert.equal(
    getMapping('ps_g4b_u01_both_factors_trailing_zero').zeroPolicy,
    'both_factors_trailing_zero_count_1_to_3',
  );
  assert.equal(
    getMapping('ps_g4b_u01_power10_multiplication').zeroPolicy,
    'result_equals_base_product_times_10_to_total_exponent',
  );
});

test('S59B freezes quotient digit and remainder policies for division', () => {
  assert.deepEqual(
    getMapping('ps_g4b_u01_3digit_div_3digit').quotientBoundary,
    { min: 1, max: 9, digits: 1 },
  );
  assert.deepEqual(
    getMapping('ps_g4b_u01_4digit_div_3digit_2digit_quotient').quotientBoundary,
    { min: 10, max: 99, digits: 2 },
  );
  assert.deepEqual(
    getMapping('ps_g4b_u01_4digit_div_3digit_1digit_quotient').quotientBoundary,
    { min: 1, max: 9, digits: 1 },
  );
  assert.equal(
    getMapping('ps_g4b_u01_trailing_zero_division_exact').remainderPolicy,
    'must_be_zero',
  );
  assert.equal(
    getMapping('ps_g4b_u01_trailing_zero_division_remainder_restore').remainderPolicy,
    'reduced_remainder_positive_original_remainder_equals_reduced_remainder_times_10_to_common_zero_count',
  );
});

test('S59B defines a complete future blocking contract without warning promotion', () => {
  assert.equal(contract.plannedBlockingCodes.length, 24);
  assert.equal(contract.warnings.length, 2);
  assert.ok(unique(contract.plannedBlockingCodes));
  assert.ok(unique(contract.warnings));
  assert.ok(contract.plannedBlockingCodes.every((code) => code.startsWith('G4B_U01_')));
  assert.ok(contract.warnings.every((code) => code.endsWith('_WARNING')));
  assert.equal(contract.acceptance.allMappingsDeterministic, true);
  assert.equal(contract.goalDistance.after, 'D2_G4B_U01_TAG_FORMAL_MAPPING_AND_BOUNDARIES_LOCKED');
  assert.equal(
    contract.goalDistance.nextShortestStep,
    'S59C_G4B_U01_HiddenPatternSpecMaterialization',
  );
});
