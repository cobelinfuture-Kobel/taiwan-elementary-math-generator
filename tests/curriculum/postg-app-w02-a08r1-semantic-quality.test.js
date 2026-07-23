import assert from 'node:assert/strict';
import test from 'node:test';

import { materializeW02A06ProductionEquivalentPackage } from '../../src/curriculum/application/shared/production-equivalent-html-pdf-runtime.mjs';
import { validateStudentFacingOperationSurface, validateStudentFacingPblTaskSet } from '../../src/curriculum/application/shared/student-facing-operation-surface.mjs';

const pkg = materializeW02A06ProductionEquivalentPackage();
const itemByPattern = new Map(pkg.generatedItems.map((item) => [item.patternSpecId, item]));
const specByPattern = new Map(pkg.specs.map((spec) => [spec.patternSpecId, spec]));
const forbiddenPblPhrases = [
  '指出題目中最重要的限制','使用前面結果擬定一個','比較計算、檢查與草案結果',
  '使用虛構練習數據','不宣稱未提供的史實細節','新聞不可作為唯一權威','有效期間到期須重新審核',
  '不涉及個資或監控','設備性能不得虛構宣稱','不使用災害恐懼敘事','安全敘事不呈現傷亡細節'
];

function visiblePblText(record) {
  return [
    record.drivingProblem?.problemStatementZh,
    ...(record.drivingProblem?.constraints ?? []),
    ...(record.drivingProblem?.successCriteria ?? []),
    ...(record.tasks ?? []).map((task) => task.promptZh),
    ...(record.finalProduct?.constraintSatisfactionChecks ?? []),
    record.finalProduct?.decisionWitnessCandidate
  ].join(' ');
}

test('all 195 student-facing records pass semantic revision 3 validation', () => {
  for (const item of pkg.generatedItems) {
    const spec = specByPattern.get(item.patternSpecId);
    const result = validateStudentFacingOperationSurface({ spec, item });
    assert.equal(result.ok, true, `${item.patternSpecId}\n${item.prompt}\n${JSON.stringify(result.issues)}`);
    assert.equal(item.studentFacingSemanticRevision, 3);
    if (item.mode === 'APPLICATION') assert.equal(typeof item.studentFacingMacroContextId, 'string');
  }
});

test('PatternSpec-specific surfaces preserve knowledge-point semantics', () => {
  const sameDenominator = itemByPattern.get('ps_g3a_u08_same_denominator_compare_comparison_application');
  assert.equal(sameDenominator.givenRoleValues.leftDenominator, sameDenominator.givenRoleValues.rightDenominator);
  assert.equal(sameDenominator.prompt, '班級小組在教室比較兩個方案：甲方案需要3/5公尺彩帶，乙方案需要1/5公尺。請用「＞、＜或＝」表示比較結果。');

  for (const id of [
    'ps_g3b_u09_length_decimal_conversion_major_units_application',
    'ps_g3b_u09_length_decimal_conversion_minor_units_application',
    'ps_g4a_u09_decimal_length_conversion_major_units_application',
    'ps_g4a_u09_decimal_length_conversion_minor_units_application'
  ]) {
    const item = itemByPattern.get(id);
    assert.equal(item.prompt.includes('公尺'), true, item.prompt);
    assert.equal(item.prompt.includes('公里'), true, item.prompt);
    assert.equal(/公升|毫升/.test(item.prompt), false, item.prompt);
  }

  for (const id of [
    'ps_g4b_u06_rate_distance_context_total_application',
    'ps_g4b_u06_rate_distance_context_combined_application'
  ]) {
    const item = itemByPattern.get(id);
    assert.equal(item.prompt.includes('公里'), true, item.prompt);
    assert.equal(item.answerUnit, '公里');
  }
});

test('fractional quantities use compatible continuous or capacity units', () => {
  const applicationText = pkg.applicationItems.map((item) => `${item.prompt} ${item.answerText} ${item.answerUnit ?? ''}`).join('\n');
  assert.equal(/\d+\/\d+\s*(?:人次|元)/.test(applicationText), false, applicationText);
  assert.equal(applicationText.includes('公里的車票'), false);
  assert.equal(applicationText.includes('公尺的交換券'), false);
  assert.equal(applicationText.includes('小時的家務卡'), false);

  for (const id of [
    'ps_g3a_u08_discrete_set_fraction_fractional_units_application',
    'ps_g3b_u07_fraction_unit_conversion_fractional_units_application'
  ]) {
    const item = itemByPattern.get(id);
    assert.equal(item.prompt.includes('可裝滿1'), true, item.prompt);
    assert.equal(item.answerText, '1又1/3');
  }
});

test('rounding application prompts distinguish rounded value from two-unit estimate', () => {
  const rounded = itemByPattern.get('ps_g5a_u01_decimal_round_estimate_rounded_application');
  const estimate = itemByPattern.get('ps_g5a_u01_decimal_round_estimate_estimate_application');
  assert.equal(rounded.prompt.includes('小數第一位'), true, rounded.prompt);
  assert.equal(rounded.answerText, '3.7');
  assert.equal(estimate.prompt.includes('小數第一位'), true, estimate.prompt);
  assert.equal(estimate.prompt.includes('兩份總量'), true, estimate.prompt);
  assert.equal(estimate.answerText, '6.6');
  assert.equal(/\b(?:tenths|hundredths)\b/i.test(`${rounded.prompt} ${estimate.prompt}`), false);
});

test('fraction-times-integer, bounds and quotient contexts are grade-appropriate', () => {
  const fractionTimes = itemByPattern.get('ps_g4a_u06_fraction_times_integer_quantity_total_application');
  const bounds = itemByPattern.get('ps_g4b_u08_mixed_fraction_order_constraints_possible_values_application');
  const quotient = itemByPattern.get('ps_g5a_u04_quotient_as_fraction_context_share_per_recipient_application');
  assert.equal(fractionTimes.answerText, '3');
  assert.equal(fractionTimes.prompt.includes('4段相同路線'), true, fractionTimes.prompt);
  assert.equal(fractionTimes.prompt.includes('總路程'), true, fractionTimes.prompt);
  assert.equal(bounds.prompt.includes('分母是8'), true, bounds.prompt);
  assert.equal(/\bx\//i.test(bounds.prompt), false, bounds.prompt);
  assert.equal(quotient.prompt.includes('平均分給4組'), true, quotient.prompt);
  assert.equal(quotient.answerUnit, '公斤');
});

test('all 31 PBL records use operation-specific dependent calculations', () => {
  for (const record of pkg.pblTaskSetRecords) {
    const result = validateStudentFacingPblTaskSet(record);
    const visible = visiblePblText(record);
    assert.equal(result.ok, true, `${record.patternSpecId}\n${visible}\n${JSON.stringify(result.issues)}`);
    assert.equal(record.studentFacingSemanticRevision, 3);
    assert.equal(forbiddenPblPhrases.some((phrase) => visible.includes(phrase)), false, visible);
    assert.equal(new Set(record.tasks.map((task) => task.promptZh)).size, record.tasks.length);
    assert.notEqual(record.drivingProblem.finalProductType, '可執行方案');
    assert.notEqual(record.drivingProblem.finalProductType, '數學成果報告');
    assert.deepEqual(record.finalProduct.constraintSatisfactionChecks, [
      '主要計算答案與題目條件一致',
      '所有數量都使用正確單位',
      '最終成果引用前段計算與檢查結果'
    ]);
  }
});

test('semantic validators reject reviewed defect and PatternSpec drift classes', () => {
  const rounding = itemByPattern.get('ps_g5a_u01_decimal_round_estimate_estimate_application');
  const roundingSpec = specByPattern.get(rounding.patternSpecId);
  const brokenRounding = {
    ...rounding,
    prompt: '資料整理小組在資料中心記錄1/4人次，按照tenths取概數後是多少？',
    answerText: '6/1',
    answerUnit: '人次'
  };
  const roundingCodes = validateStudentFacingOperationSurface({ spec: roundingSpec, item: brokenRounding }).issues.map((row) => row.code);
  assert.equal(roundingCodes.includes('POSTG_APP_STUDENT_SURFACE_ENGLISH_PLACE_TOKEN'), true);
  assert.equal(roundingCodes.includes('POSTG_APP_STUDENT_SURFACE_FRACTIONAL_INCOMPATIBLE_UNIT'), true);
  assert.equal(roundingCodes.includes('POSTG_APP_STUDENT_SURFACE_UNSIMPLIFIED_WHOLE'), true);
  assert.equal(roundingCodes.includes('POSTG_APP_STUDENT_SURFACE_ROUNDING_ESTIMATE_SEMANTICS_MISSING'), true);

  const same = itemByPattern.get('ps_g3a_u08_same_denominator_compare_comparison_application');
  const sameSpec = specByPattern.get(same.patternSpecId);
  const brokenSame = structuredClone(same);
  brokenSame.givenRoleValues.rightDenominator = 2;
  const sameCodes = validateStudentFacingOperationSurface({ spec: sameSpec, item: brokenSame }).issues.map((row) => row.code);
  assert.equal(sameCodes.includes('POSTG_APP_STUDENT_SURFACE_SAME_DENOMINATOR_KP_MISMATCH'), true);
});
