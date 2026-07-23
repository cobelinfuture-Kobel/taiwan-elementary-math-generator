import {
  applyStudentFacingOperationSurface as applyV3Surface,
  instantiateStudentFacingPblTaskSet as instantiateV3Pbl,
  validateStudentFacingOperationSurface as validateV3Surface,
  validateStudentFacingPblTaskSet as validateV3Pbl
} from './student-facing-semantic-v3-adapter.mjs';

export const W02_A08R3_NUMERIC_SURFACE_VERSION = 'W02_A08R3_V1';
export const W02_A08R3_NUMERIC_SEMANTIC_REVISION = 4;

const PLACE_LABELS = Object.freeze({
  ones: '個位',
  tens: '十位',
  hundreds: '百位',
  thousands: '千位',
  tenths: '小數第一位',
  hundredths: '小數第二位',
  thousandths: '小數第三位'
});

const TARGET_FINDING_CODES = Object.freeze({
  unresolved: 'POSTG_APP_W02_A08R3_NUMERIC_REQUESTED_UNKNOWN_UNRESOLVED',
  givenSet: 'POSTG_APP_W02_A08R3_NUMERIC_GIVEN_SET_NOT_MINIMAL',
  malformed: 'POSTG_APP_W02_A08R3_NUMERIC_RELATION_SURFACE_INCOHERENT',
  notation: 'POSTG_APP_W02_A08R3_NUMERIC_GRADE_UNSAFE_NOTATION'
});

const sortedKeys = (value) => Object.keys(value ?? {}).sort();
const sameKeys = (left, right) => JSON.stringify(sortedKeys(left)) === JSON.stringify([...right].sort());
const fractionValue = (value) => {
  const match = /^(-?\d+)\/(\d+)$/.exec(String(value));
  return match ? Number(match[1]) / Number(match[2]) : Number(value);
};
const pick = (source, keys) => Object.fromEntries(keys.map((key) => [key, source[key]]));
const comparisonPrompt = (left, right) => `比較${left}和${right}，請填入「＞、＜或＝」。`;
const fractionText = (values, prefix) => `${values[`${prefix}Numerator`]}/${values[`${prefix}Denominator`]}`;
const placeLabel = (value) => PLACE_LABELS[value] ?? '指定數位';

function inverseRoundingAnswerText(answer) {
  const match = /^\[\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)$/.exec(String(answer));
  return match ? `大於或等於${match[1]}且小於${match[2]}` : String(answer);
}

function numericContract(spec, sourceItem) {
  const values = sourceItem.givenRoleValues ?? {};
  const requested = spec.requestedUnknownRole;

  switch (spec.operationFamilyId) {
    case 'fraction_compare': {
      const keys = ['leftNumerator', 'leftDenominator', 'rightNumerator', 'rightDenominator'];
      return {
        keys,
        givens: pick(values, keys),
        prompt: comparisonPrompt(fractionText(values, 'left'), fractionText(values, 'right'))
      };
    }
    case 'decimal_compare': {
      const keys = ['left', 'right'];
      return { keys, givens: pick(values, keys), prompt: comparisonPrompt(values.left, values.right) };
    }
    case 'decimal_read_write': {
      const keys = ['digitsByPlace'];
      const digits = values.digitsByPlace ?? {};
      const ordered = ['ones', 'tenths', 'hundredths', 'thousandths']
        .filter((role) => digits[role] != null)
        .map((role) => `${PLACE_LABELS[role]}是${digits[role]}`);
      return { keys, givens: pick(values, keys), prompt: `${ordered.join('，')}。寫出這個小數。` };
    }
    case 'infer_decimal_product': {
      const keys = ['integerProduct', 'decimalPlaceCount'];
      return {
        keys,
        givens: pick(values, keys),
        prompt: `未標小數點的乘積是${values.integerProduct}，兩個因數合計有${values.decimalPlaceCount}位小數。正確乘積是多少？`
      };
    }
    case 'interval_multiple_count': {
      const keys = ['base', 'lower', 'upper'];
      return {
        keys,
        givens: pick(values, keys),
        prompt: `從${values.lower}到${values.upper}之間（包含兩端），共有幾個${values.base}的倍數？`
      };
    }
    case 'fraction_context_total': {
      if (requested === 'total') {
        const keys = ['firstQuantity', 'secondQuantity'];
        return { keys, givens: pick(values, keys), prompt: `計算${values.firstQuantity}和${values.secondQuantity}的總和。` };
      }
      if (requested === 'original') {
        const keys = ['used', 'remaining'];
        return { keys, givens: pick(values, keys), prompt: `已使用${values.used}，還剩${values.remaining}。原來共有多少？` };
      }
      const candidates = [values.firstQuantity, values.secondQuantity].sort((a, b) => fractionValue(b) - fractionValue(a));
      const givens = { larger: candidates[0], smaller: candidates[1] };
      return { keys: ['larger', 'smaller'], givens, prompt: `${givens.larger}和${givens.smaller}相差多少？` };
    }
    case 'improper_mixed_conversion': {
      if (requested !== 'improperNumerator') return null;
      const keys = ['whole', 'denominator', 'remainder'];
      return {
        keys,
        givens: pick(values, keys),
        prompt: `把帶分數${values.whole}又${values.remainder}/${values.denominator}化成假分數，分子是多少？`
      };
    }
    case 'rate_total': {
      if (requested === 'total') {
        const keys = ['ratePerUnit', 'unitCount'];
        return { keys, givens: pick(values, keys), prompt: `每組有${values.ratePerUnit}，共有${values.unitCount}組，總量是多少？` };
      }
      const keys = ['firstTotal', 'secondTotal'];
      return { keys, givens: pick(values, keys), prompt: `第一部分是${values.firstTotal}，第二部分是${values.secondTotal}，合計是多少？` };
    }
    case 'common_denominator': {
      if (requested !== 'commonDenominator') return null;
      const keys = ['leftNumerator', 'leftDenominator', 'rightNumerator', 'rightDenominator'];
      return {
        keys,
        givens: pick(values, keys),
        prompt: `把${fractionText(values, 'left')}和${fractionText(values, 'right')}通分，最小公分母是多少？`
      };
    }
    case 'segment_measure': {
      if (requested === 'segmentLength') {
        const keys = ['totalLength', 'segmentCount'];
        return { keys, givens: pick(values, keys), prompt: `把總長${values.totalLength}平均分成${values.segmentCount}段，每段長多少？` };
      }
      const keys = ['totalLength', 'segmentLength'];
      return { keys, givens: pick(values, keys), prompt: `總長是${values.totalLength}，每段長${values.segmentLength}，可以分成多少段？` };
    }
    case 'rounding': {
      const keys = ['value', 'targetPlace'];
      const place = placeLabel(values.targetPlace);
      return requested === 'rounded'
        ? { keys, givens: pick(values, keys), prompt: `把${values.value}四捨五入到${place}，結果是多少？` }
        : { keys, givens: pick(values, keys), prompt: `先把${values.value}四捨五入到${place}，再估算兩個相同數量的總和。結果約是多少？` };
    }
    case 'multiple_enumeration': {
      if (requested === 'isMultiple') {
        const keys = ['base', 'candidate'];
        return { keys, givens: pick(values, keys), prompt: `${values.candidate}是不是${values.base}的倍數？` };
      }
      const upperBound = Number(values.base) * 5;
      return {
        keys: ['base', 'upperBound'],
        givens: { base: values.base, upperBound },
        prompt: `列出所有不超過${upperBound}的${values.base}的正倍數。`
      };
    }
    case 'factor_multiple_relation': {
      if (requested === 'isFactor') {
        const keys = ['factor', 'product'];
        return { keys, givens: pick(values, keys), prompt: `${values.factor}是不是${values.product}的因數？` };
      }
      const keys = ['base', 'value'];
      return { keys, givens: pick(values, keys), prompt: `${values.value}是不是${values.base}的倍數？` };
    }
    case 'fraction_bounds': {
      const denominator = Number(String(values.unknownPart ?? '').split('/')[1]);
      const givens = { lowerBound: values.lowerBound, upperBound: values.upperBound, denominator };
      return {
        keys: ['lowerBound', 'upperBound', 'denominator'],
        givens,
        prompt: `分母是${denominator}、大於${values.lowerBound}且小於${values.upperBound}的分數有哪些？`
      };
    }
    case 'inverse_rounding': {
      const keys = ['roundedValue', 'targetPlace'];
      return {
        keys,
        givens: pick(values, keys),
        prompt: `一個小數四捨五入到${placeLabel(values.targetPlace)}後是${values.roundedValue}。原數大於或等於多少，且必須小於多少？`,
        answerText: inverseRoundingAnswerText(sourceItem.answer)
      };
    }
    default:
      return null;
  }
}

function applyNumericRevision4(spec, item) {
  if (spec.mode !== 'NUMERIC') return item;
  const revised = structuredClone(item);
  const contract = numericContract(spec, revised);
  if (contract) {
    revised.givenRoleValues = Object.freeze(contract.givens);
    revised.prompt = contract.prompt;
    if (contract.answerText != null) revised.answerText = contract.answerText;
    revised.studentFacingNumericExpectedGivenRoles = Object.freeze([...contract.keys]);
  }
  revised.studentFacingSurfaceVersion = W02_A08R3_NUMERIC_SURFACE_VERSION;
  revised.studentFacingSemanticRevision = W02_A08R3_NUMERIC_SEMANTIC_REVISION;
  revised.studentFacingNumericContractId = `A08R3:${spec.operationFamilyId}:${spec.requestedUnknownRole}`;
  return Object.freeze(revised);
}

export function applyStudentFacingOperationSurface(args = {}) {
  return applyNumericRevision4(args.spec, applyV3Surface(args));
}

export function validateStudentFacingOperationSurface(args = {}) {
  const base = validateV3Surface(args);
  if (args.spec?.mode !== 'NUMERIC') return base;

  const issues = base.issues.filter((row) => ![
    'POSTG_APP_STUDENT_SURFACE_VERSION_INVALID',
    'POSTG_APP_STUDENT_SURFACE_SEMANTIC_REVISION_INVALID'
  ].includes(row.code));
  const item = args.item ?? {};
  const prompt = String(item.prompt ?? '');
  const answerText = String(item.answerText ?? '');
  const contract = numericContract(args.spec, item);

  if (prompt.includes('指定數量') || /求\s*(?:指定|未知)數量/.test(prompt)) {
    issues.push({ code: TARGET_FINDING_CODES.unresolved });
  }
  if (item.givenRoleValues && Object.prototype.hasOwnProperty.call(item.givenRoleValues, args.spec.requestedUnknownRole)) {
    issues.push({ code: TARGET_FINDING_CODES.givenSet, reason: 'REQUESTED_ROLE_PRESENT' });
  }
  if (contract && !sameKeys(item.givenRoleValues, contract.keys)) {
    issues.push({ code: TARGET_FINDING_CODES.givenSet, expectedRoles: contract.keys, actualRoles: sortedKeys(item.givenRoleValues) });
  }
  if (contract && prompt !== contract.prompt) {
    issues.push({ code: TARGET_FINDING_CODES.malformed, expectedPrompt: contract.prompt, actualPrompt: prompt });
  }
  if (/\bx\s*\/\s*\d+/i.test(prompt)
      || /^\s*[\[(].*[,，].*[\])]/.test(answerText)
      || /\[[^\]]+[,，][^\]]+\)/.test(`${prompt} ${answerText}`)) {
    issues.push({ code: TARGET_FINDING_CODES.notation });
  }
  if (item.studentFacingSurfaceVersion !== W02_A08R3_NUMERIC_SURFACE_VERSION
      || item.studentFacingSemanticRevision !== W02_A08R3_NUMERIC_SEMANTIC_REVISION) {
    issues.push({ code: 'POSTG_APP_W02_A08R3_NUMERIC_SURFACE_VERSION_INVALID' });
  }
  return { ...base, ok: issues.length === 0, issues };
}

export function auditNumericStudentFacingSurfaceV4({ specs = [], items = [] } = {}) {
  const specByPattern = new Map(specs.map((spec) => [spec.patternSpecId, spec]));
  const findings = {
    unresolvedRequestedUnknown: [],
    answerEquivalentOrNonMinimalGivenSet: [],
    malformedOrIncoherentSurface: [],
    gradeUnsafeNotation: []
  };
  for (const item of items.filter((row) => row.mode === 'NUMERIC')) {
    const spec = specByPattern.get(item.patternSpecId);
    const result = validateStudentFacingOperationSurface({ spec, item });
    const codes = new Set(result.issues.map((row) => row.code));
    if (codes.has(TARGET_FINDING_CODES.unresolved)) findings.unresolvedRequestedUnknown.push(item.generatedItemId);
    if (codes.has(TARGET_FINDING_CODES.givenSet)) findings.answerEquivalentOrNonMinimalGivenSet.push(item.generatedItemId);
    if (codes.has(TARGET_FINDING_CODES.malformed)) findings.malformedOrIncoherentSurface.push(item.generatedItemId);
    if (codes.has(TARGET_FINDING_CODES.notation)) findings.gradeUnsafeNotation.push(item.generatedItemId);
  }
  return Object.freeze({
    reviewedCount: items.filter((row) => row.mode === 'NUMERIC').length,
    counts: Object.freeze(Object.fromEntries(Object.entries(findings).map(([key, rows]) => [key, rows.length]))),
    findings: Object.freeze(Object.fromEntries(Object.entries(findings).map(([key, rows]) => [key, Object.freeze(rows)])))
  });
}

export function instantiateStudentFacingPblTaskSet(args = {}) {
  return instantiateV3Pbl(args);
}

export function validateStudentFacingPblTaskSet(record) {
  return validateV3Pbl(record);
}

export const W02_A08R3_TARGET_FINDING_CODES = TARGET_FINDING_CODES;
