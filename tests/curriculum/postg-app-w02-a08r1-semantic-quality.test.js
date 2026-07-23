import assert from 'node:assert/strict';
import test from 'node:test';

import { materializeW02A06ProductionEquivalentPackage } from '../../src/curriculum/application/shared/production-equivalent-html-pdf-runtime.mjs';
import { validateStudentFacingOperationSurface, validateStudentFacingPblTaskSet } from '../../src/curriculum/application/shared/student-facing-operation-surface.mjs';

const pkg = materializeW02A06ProductionEquivalentPackage();
const itemByPattern = new Map(pkg.generatedItems.map((item) => [item.patternSpecId, item]));
const specByPattern = new Map(pkg.specs.map((spec) => [spec.patternSpecId, spec]));
const forbiddenPblPhrases = [
  '使用虛構練習數據','不宣稱未提供的史實細節','新聞不可作為唯一權威','有效期間到期須重新審核',
  '不涉及個資或監控','設備性能不得虛構宣稱','不使用災害恐懼敘事','安全敘事不呈現傷亡細節'
];

function visiblePblText(record) {
  return [
    record.drivingProblem?.problemStatementZh,
    ...(record.drivingProblem?.constraints ?? []),
    ...(record.drivingProblem?.successCriteria ?? []),
    ...(record.tasks ?? []).map((task) => task.promptZh),
    record.finalProduct?.decisionWitnessCandidate
  ].join(' ');
}

test('all 195 student-facing records pass semantic revision 2 validation', () => {
  for (const item of pkg.generatedItems) {
    const spec = specByPattern.get(item.patternSpecId);
    const result = validateStudentFacingOperationSurface({ spec, item });
    assert.equal(result.ok, true, `${item.patternSpecId}\n${item.prompt}\n${JSON.stringify(result.issues)}`);
    assert.equal(item.studentFacingSemanticRevision, 2);
  }
});

test('fractional quantities use continuous units rather than fractional people or currency', () => {
  const applicationText = pkg.applicationItems.map((item) => `${item.prompt} ${item.answerText} ${item.answerUnit ?? ''}`).join('\n');
  assert.equal(/\d+\/\d+\s*(?:人次|元)/.test(applicationText), false, applicationText);
  assert.equal(applicationText.includes('公里的車票'), false);
  assert.equal(applicationText.includes('公尺的交換券'), false);
  assert.equal(applicationText.includes('小時的家務卡'), false);
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

test('fraction-times-integer and quotient contexts use normalized answers and compatible resources', () => {
  const fractionTimes = itemByPattern.get('ps_g4a_u06_fraction_times_integer_quantity_total_application');
  const quotient = itemByPattern.get('ps_g5a_u04_quotient_as_fraction_context_share_per_recipient_application');
  assert.equal(fractionTimes.answerText, '3');
  assert.equal(fractionTimes.prompt.includes('車票'), false, fractionTimes.prompt);
  assert.equal(fractionTimes.prompt.includes('行程距離'), true, fractionTimes.prompt);
  assert.equal(quotient.prompt.includes('平均分給4組'), true, quotient.prompt);
  assert.equal(quotient.answerUnit, '公斤');
});

test('all 31 PBL records remove governance prose and retain authentic calculation lineage', () => {
  for (const record of pkg.pblTaskSetRecords) {
    const result = validateStudentFacingPblTaskSet(record);
    const visible = visiblePblText(record);
    assert.equal(result.ok, true, `${record.patternSpecId}\n${visible}\n${JSON.stringify(result.issues)}`);
    assert.equal(record.studentFacingSemanticRevision, 2);
    assert.equal(forbiddenPblPhrases.some((phrase) => visible.includes(phrase)), false, visible);
    assert.equal(visible.includes('代回原題'), true, visible);
    assert.equal(visible.includes('正確單位'), true, visible);
  }
});

test('semantic validators reject the reviewed defect classes', () => {
  const base = itemByPattern.get('ps_g5a_u01_decimal_round_estimate_estimate_application');
  const spec = specByPattern.get(base.patternSpecId);
  const broken = {
    ...base,
    prompt: '資料整理小組在資料中心記錄1/4人次，按照tenths取概數後是多少？',
    answerText: '6/1',
    answerUnit: '人次'
  };
  const codes = validateStudentFacingOperationSurface({ spec, item: broken }).issues.map((row) => row.code);
  assert.equal(codes.includes('POSTG_APP_STUDENT_SURFACE_ENGLISH_PLACE_TOKEN'), true);
  assert.equal(codes.includes('POSTG_APP_STUDENT_SURFACE_FRACTIONAL_INCOMPATIBLE_UNIT'), true);
  assert.equal(codes.includes('POSTG_APP_STUDENT_SURFACE_UNSIMPLIFIED_WHOLE'), true);
  assert.equal(codes.includes('POSTG_APP_STUDENT_SURFACE_ROUNDING_ESTIMATE_SEMANTICS_MISSING'), true);
});
