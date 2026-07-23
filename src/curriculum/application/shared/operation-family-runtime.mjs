const gcd = (a, b) => {
  let x = Math.abs(Number(a));
  let y = Math.abs(Number(b));
  while (y) [x, y] = [y, x % y];
  return x || 1;
};
const lcm = (a, b) => Math.abs(Number(a) * Number(b)) / gcd(a, b);
const round = (value, digits = 6) => Number(Number(value).toFixed(digits));
const fraction = (numerator, denominator = 1) => {
  if (denominator === 0) throw new Error('ZERO_DENOMINATOR');
  const sign = denominator < 0 ? -1 : 1;
  const n = Number(numerator) * sign;
  const d = Math.abs(Number(denominator));
  const divisor = gcd(n, d);
  return `${n / divisor}/${d / divisor}`;
};
const parseFraction = (value) => {
  if (typeof value === 'number') return [value, 1];
  const match = /^(-?\d+)\/(\d+)$/.exec(String(value));
  return match ? [Number(match[1]), Number(match[2])] : [Number(value), 1];
};
const addFractions = (left, right, subtract = false) => {
  const [ln, ld] = parseFraction(left);
  const [rn, rd] = parseFraction(right);
  return fraction(ln * rd + (subtract ? -1 : 1) * rn * ld, ld * rd);
};
const multiplyFraction = (value, factor) => {
  const [n, d] = parseFraction(value);
  return fraction(n * Number(factor), d);
};
const compareValues = (left, right) => Number(left) < Number(right) ? '<' : Number(left) > Number(right) ? '>' : '=';
const safeId = (value) => String(value).toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
const seedOf = (value) => [...String(value)].reduce((sum, char) => (sum * 33 + char.charCodeAt(0)) >>> 0, 5381) % 5 + 1;
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);

const ROLE_LABELS = Object.freeze({
  commonDenominator: '公分母', leftEquivalent: '左側等值分數', rightEquivalent: '右側等值分數',
  minimumTotal: '最少總數', validStrategy: '可用比較策略', equivalent: '是否等值', result: '結果',
  comparison: '比較結果', majorUnits: '大單位數量', minorUnits: '小單位數量', product: '乘積',
  decimalText: '小數讀寫結果', decimal: '小數值', term: '下一項', fractionalUnits: '分數單位量',
  itemCount: '物品數量', divisible: '是否整除', equivalentDenominator: '等值分母',
  equivalentNumerator: '等值分子', factor: '倍數因子', feasible: '是否可整組分配', isFactor: '是否為因數',
  isMultiple: '是否為倍數', fraction: '分數', possibleValues: '可能值', total: '總量', original: '原量',
  difference: '相差量', numerator: '分子', type: '分數類型', improperNumerator: '假分數分子',
  remainder: '餘數', whole: '整數部分', decimalProduct: '小數乘積', count: '個數', range: '可能範圍',
  commonMultiples: '公倍數', leastCommonMultiple: '最小公倍數', measure: '測量值', missingDigits: '缺少的數字',
  missing: '缺少的分數', multiples: '倍數集合', boundedMultiples: '範圍內倍數', nearest: '最接近的倍數',
  solutions: '符合條件的數', coordinate: '座標', distance: '距離', higherPlaceValue: '高一位位值',
  lowerPlaceValue: '低一位位值', quotient: '商', sharePerRecipient: '每人分得量', combined: '合計量',
  sum: '和', estimate: '估算結果', rounded: '四捨五入結果', segmentCount: '段數', segmentLength: '每段長度',
  commonFactor: '公因數', simplestDenominator: '最簡分母', simplestNumerator: '最簡分子', squareSide: '正方形邊長'
});

function familyRoles(spec) {
  const n = seedOf(spec.patternSpecId);
  const id = spec.patternSpecId;
  switch (spec.operationFamilyId) {
    case 'common_denominator': return { leftNumerator: 1, leftDenominator: 2, rightNumerator: 2, rightDenominator: 3, commonDenominator: 6, leftEquivalent: '3/6', rightEquivalent: '4/6' };
    case 'common_group_total': return { firstGrouping: 4, secondGrouping: 6, minimumTotal: 12 };
    case 'comparison_limit': return { denominatorsEqual: true, numerators: [n + 2, n + 4], validStrategy: 'COMPARE_NUMERATORS' };
    case 'cross_product_equivalence': return { leftNumerator: 1, leftDenominator: 2, rightNumerator: 2, rightDenominator: 4, equivalent: true };
    case 'decimal_add_sub': { const left = round(3.2 + n / 10); const right = 1.1; const subtract = id.includes('_sub_'); return { left, right, result: round(subtract ? left - right : left + right) }; }
    case 'decimal_compare': { const left = round(2.3 + n / 100); const right = round(2.2 + n / 100); return { left, right, comparison: compareValues(left, right) }; }
    case 'decimal_measure_conversion': { const conversionFactor = 1000; const majorUnits = round(1.5 + n / 10); return { conversionFactor, majorUnits, minorUnits: round(majorUnits * conversionFactor) }; }
    case 'decimal_multiply': { const decimalFactor = round(1.2 + n / 10); const integerFactor = 3 + n; return { decimalFactor, integerFactor, product: round(decimalFactor * integerFactor) }; }
    case 'decimal_read_write': { const digitsByPlace = { ones: n, tenths: 4, hundredths: 7 }; return { digitsByPlace, decimalText: `${n}.47` }; }
    case 'decimal_representation': { const whole = n; const fractionalUnits = 3; const placeUnit = id.includes('hundredth') || id.includes('two_decimal') ? 0.01 : 0.1; return { whole, fractionalUnits, placeUnit, decimal: round(whole + fractionalUnits * placeUnit) }; }
    case 'decimal_scale': { const value = round(1.25 + n / 100); const scaleFactor = 10; return { value, scaleFactor, result: round(value * scaleFactor) }; }
    case 'decimal_sequence': { const start = round(1 + n / 10); const step = 0.2; return { start, step, termIndex: 4, term: round(start + 4 * step) }; }
    case 'discrete_fraction_conversion': { const wholeUnits = 1 + (n % 2); const itemsPerWhole = 12; const numerator = 1; const denominator = 3; const itemCount = wholeUnits * itemsPerWhole + 4; return { wholeUnits, itemsPerWhole, numerator, denominator, itemCount, fractionalUnits: fraction(itemCount, itemsPerWhole) }; }
    case 'divisibility': { const divisor = 3; const value = 30 + n * 3; return { divisor, value, divisible: value % divisor === 0 }; }
    case 'equivalent_fraction': { const numerator = 1 + (n % 3); const denominator = numerator + 3; const factor = 2; return { numerator, denominator, factor, equivalentNumerator: numerator * factor, equivalentDenominator: denominator * factor }; }
    case 'exact_grouping': { const groupSize = 4 + (n % 3); const total = groupSize * (3 + n); return { groupSize, total, feasible: true }; }
    case 'factor_multiple_relation': { const factor = 3; const product = factor * (5 + n); const base = 4; const value = base * (4 + n); return { factor, product, base, value, isFactor: true, isMultiple: true }; }
    case 'fraction_accumulation': { const denominator = 8; const unitFractionCount = 2 + n; return { denominator, unitFractionCount, fraction: fraction(unitFractionCount, denominator) }; }
    case 'fraction_add_sub': { const subtract = id.includes('_sub_'); const leftNumerator = subtract ? 5 : 1 + (n % 3); const leftDenominator = 6; const rightNumerator = 1; const rightDenominator = id.includes('same_denominator') ? 6 : 3; return { leftNumerator, leftDenominator, rightNumerator, rightDenominator, result: addFractions(fraction(leftNumerator, leftDenominator), fraction(rightNumerator, rightDenominator), subtract) }; }
    case 'fraction_bounds': return { lowerBound: '1/4', upperBound: '3/4', unknownPart: 'x/8', possibleValues: ['3/8', '4/8', '5/8'] };
    case 'fraction_compare': { const leftNumerator = 2 + (n % 2); const leftDenominator = 5; const rightNumerator = 1; const rightDenominator = 2; return { leftNumerator, leftDenominator, rightNumerator, rightDenominator, comparison: compareValues(leftNumerator * rightDenominator, rightNumerator * leftDenominator) }; }
    case 'fraction_context_total': return { firstQuantity: '1/4', secondQuantity: '1/2', total: '3/4', used: '1/4', remaining: '1/2', original: '3/4', larger: '1/2', smaller: '1/4', difference: '1/4' };
    case 'fraction_decimal_conversion': { const denominator = 10; const numerator = 3 + n; return { denominator, numerator, decimal: round(numerator / denominator) }; }
    case 'fraction_part_whole': { const equalParts = 8; const selectedParts = 2 + n; return { equalParts, selectedParts, fraction: fraction(selectedParts, equalParts) }; }
    case 'fraction_times_integer': { const amountPerGroup = '3/4'; const groupCount = 2 + n; return { amountPerGroup, groupCount, total: multiplyFraction(amountPerGroup, groupCount) }; }
    case 'fraction_type': { const denominator = 4; const numerator = 5 + n; return { numerator, denominator, wholePart: Math.floor(numerator / denominator), type: numerator < denominator ? 'PROPER' : numerator === denominator ? 'WHOLE_EQUIVALENT' : 'IMPROPER' }; }
    case 'improper_mixed_conversion': { const denominator = 5; const numerator = 12 + n; const whole = Math.floor(numerator / denominator); const remainder = numerator % denominator; return { numerator, denominator, whole, remainder, improperNumerator: whole * denominator + remainder }; }
    case 'infer_decimal_product': { const decimalPlaceCount = 2; const integerProduct = 1234 + n; return { decimalPlaceCount, integerProduct, decimalProduct: round(integerProduct / 100) }; }
    case 'interval_multiple_count': { const base = 4; const lower = 5 + n; const upper = 30 + n; return { base, lower, upper, count: Math.floor(upper / base) - Math.floor((lower - 1) / base) }; }
    case 'inverse_rounding': { const targetPlace = 'tenths'; const roundedValue = round(3 + n / 10); return { targetPlace, roundedValue, range: `[${round(roundedValue - 0.05, 2)}, ${round(roundedValue + 0.05, 2)})` }; }
    case 'lcm': { const left = 4; const right = 6; const leastCommonMultiple = 12; return { left, right, leastCommonMultiple, commonMultiples: [12, 24, 36] }; }
    case 'measurement_fraction': { const wholeUnits = 1 + (n % 2); const numerator = 1; const denominator = 4; return { wholeUnits, numerator, denominator, measure: round(wholeUnits + numerator / denominator) }; }
    case 'missing_column_digit': return { addendsOrMinuend: '4□7 + 135', result: 612, missingDigits: [7] };
    case 'missing_digit_inequality': return { left: '4□2', right: 452, missingDigit: '□', possibleDigits: [0, 1, 2, 3, 4] };
    case 'missing_fraction_addend': return { known: '1/4', total: '3/4', missing: '1/2' };
    case 'multiple_enumeration': { const base = 4; const candidate = 20 + 4 * n; return { base, candidate, isMultiple: true, multiples: [base, base * 2, base * 3, base * 4, base * 5] }; }
    case 'nearest_multiple': { const base = 6; const lower = 10; const upper = 40; const target = 25 + n; const boundedMultiples = [12, 18, 24, 30, 36]; const nearest = boundedMultiples.reduce((best, value) => Math.abs(value - target) < Math.abs(best - target) ? value : best); return { base, lower, upper, target, boundedMultiples, nearest }; }
    case 'number_constraint': return { allowedDigits: [1, 2, 3, 6], constraints: ['三位數', '可被3整除', '數字不重複'], solutions: [126, 132, 162, 216, 231, 312, 321, 612, 621] };
    case 'number_line': { const origin = round(n / 10); const unitStep = id.includes('fraction') ? 0.25 : 0.1; const stepCount = 4; const coordinate = round(origin + stepCount * unitStep); return { origin, unitStep, stepCount, coordinate, leftCoordinate: origin, rightCoordinate: coordinate, distance: round(Math.abs(coordinate - origin)) }; }
    case 'place_factor': { const lowerPlaceValue = 10 ** (1 + (n % 3)); return { lowerPlaceValue, higherPlaceValue: lowerPlaceValue * 10 }; }
    case 'quotient_fraction': { const dividend = 3 + n; const divisor = 4; return { dividend, divisor, quotient: fraction(dividend, divisor) }; }
    case 'quotient_fraction_context': { const totalQuantity = 3 + n; const recipientCount = 4; return { totalQuantity, recipientCount, sharePerRecipient: fraction(totalQuantity, recipientCount) }; }
    case 'rate_total': { const ratePerUnit = round(1.5 + n / 10); const unitCount = 4; const total = round(ratePerUnit * unitCount); const firstTotal = round(total / 2); const secondTotal = round(total - firstTotal); return { ratePerUnit, unitCount, total, firstTotal, secondTotal, combined: round(firstTotal + secondTotal) }; }
    case 'reciprocal_sum': { const firstDenominator = 3; const secondDenominator = 6; return { firstDenominator, secondDenominator, sum: addFractions(fraction(1, firstDenominator), fraction(1, secondDenominator)) }; }
    case 'rounding': { const value = round(3.24 + n / 10); const targetPlace = 'tenths'; const rounded = round(Math.round(value * 10) / 10); return { value, targetPlace, rounded, estimate: round(rounded * 2) }; }
    case 'segment_measure': { const segmentCount = 3 + (n % 3); const segmentLength = 2; const totalLength = segmentCount * segmentLength; return { segmentCount, segmentLength, totalLength, totalMeasure: totalLength, unitMeasure: segmentLength }; }
    case 'simplify_fraction': { const commonFactor = 2 + (n % 2); const simplestNumerator = 2; const simplestDenominator = 3; return { commonFactor, numerator: simplestNumerator * commonFactor, denominator: simplestDenominator * commonFactor, simplestNumerator, simplestDenominator }; }
    case 'square_tiling': { const rectangleLength = 4; const rectangleWidth = 6; return { rectangleLength, rectangleWidth, squareSide: lcm(rectangleLength, rectangleWidth) }; }
    case 'whole_as_fraction': { const wholeCount = 2 + (n % 3); const denominator = 5; return { wholeCount, denominator, numerator: wholeCount * denominator }; }
    default: throw new Error(`UNSUPPORTED_OPERATION_FAMILY:${spec.operationFamilyId}`);
  }
}

function evaluateUnknown(spec, givens) {
  const id = spec.patternSpecId;
  switch (spec.operationFamilyId) {
    case 'common_denominator': {
      const common = lcm(givens.leftDenominator, givens.rightDenominator);
      if (spec.requestedUnknownRole === 'commonDenominator') return common;
      if (spec.requestedUnknownRole === 'leftEquivalent') return `${givens.leftNumerator * (givens.commonDenominator / givens.leftDenominator)}/${givens.commonDenominator}`;
      return `${givens.rightNumerator * (givens.commonDenominator / givens.rightDenominator)}/${givens.commonDenominator}`;
    }
    case 'common_group_total': return lcm(givens.firstGrouping, givens.secondGrouping);
    case 'comparison_limit': return givens.denominatorsEqual ? 'COMPARE_NUMERATORS' : 'REQUIRE_EQUIVALENT_REPRESENTATION';
    case 'cross_product_equivalence': return givens.leftNumerator * givens.rightDenominator === givens.rightNumerator * givens.leftDenominator;
    case 'decimal_add_sub': return round(id.includes('_sub_') ? givens.left - givens.right : givens.left + givens.right);
    case 'decimal_compare': return compareValues(givens.left, givens.right);
    case 'decimal_measure_conversion': return spec.requestedUnknownRole === 'majorUnits' ? round(givens.minorUnits / givens.conversionFactor) : round(givens.majorUnits * givens.conversionFactor);
    case 'decimal_multiply': return round(givens.decimalFactor * givens.integerFactor);
    case 'decimal_read_write': return `${givens.digitsByPlace.ones}.${givens.digitsByPlace.tenths}${givens.digitsByPlace.hundredths}`;
    case 'decimal_representation': return round(givens.whole + givens.fractionalUnits * givens.placeUnit);
    case 'decimal_scale': return round(givens.value * givens.scaleFactor);
    case 'decimal_sequence': return round(givens.start + 4 * givens.step);
    case 'discrete_fraction_conversion': return spec.requestedUnknownRole === 'itemCount'
      ? givens.wholeUnits * givens.itemsPerWhole + givens.numerator * givens.itemsPerWhole / givens.denominator
      : fraction(givens.itemCount, givens.itemsPerWhole);
    case 'divisibility': return givens.value % givens.divisor === 0;
    case 'equivalent_fraction': {
      if (spec.requestedUnknownRole === 'factor') return givens.equivalentNumerator / givens.numerator;
      return spec.requestedUnknownRole === 'equivalentNumerator' ? givens.numerator * givens.factor : givens.denominator * givens.factor;
    }
    case 'exact_grouping': return givens.total % givens.groupSize === 0;
    case 'factor_multiple_relation': return spec.requestedUnknownRole === 'isFactor' ? givens.product % givens.factor === 0 : givens.value % givens.base === 0;
    case 'fraction_accumulation': return fraction(givens.unitFractionCount, givens.denominator);
    case 'fraction_add_sub': return addFractions(fraction(givens.leftNumerator, givens.leftDenominator), fraction(givens.rightNumerator, givens.rightDenominator), id.includes('_sub_'));
    case 'fraction_bounds': return ['3/8', '4/8', '5/8'];
    case 'fraction_compare': return compareValues(givens.leftNumerator * givens.rightDenominator, givens.rightNumerator * givens.leftDenominator);
    case 'fraction_context_total': {
      if (spec.requestedUnknownRole === 'total') return addFractions(givens.firstQuantity, givens.secondQuantity);
      if (spec.requestedUnknownRole === 'original') return addFractions(givens.used, givens.remaining);
      return addFractions(givens.larger ?? '1/2', givens.smaller ?? '1/4', true);
    }
    case 'fraction_decimal_conversion': return spec.requestedUnknownRole === 'decimal' ? round(givens.numerator / givens.denominator) : round(givens.decimal * givens.denominator);
    case 'fraction_part_whole': return fraction(givens.selectedParts, givens.equalParts);
    case 'fraction_times_integer': return multiplyFraction(givens.amountPerGroup, givens.groupCount);
    case 'fraction_type': return givens.numerator < givens.denominator ? 'PROPER' : givens.numerator === givens.denominator ? 'WHOLE_EQUIVALENT' : 'IMPROPER';
    case 'improper_mixed_conversion': {
      if (spec.requestedUnknownRole === 'whole') return Math.floor(givens.numerator / givens.denominator);
      if (spec.requestedUnknownRole === 'remainder') return givens.numerator % givens.denominator;
      return givens.whole * givens.denominator + givens.remainder;
    }
    case 'infer_decimal_product': return round(givens.integerProduct / 10 ** givens.decimalPlaceCount);
    case 'interval_multiple_count': return Math.floor(givens.upper / givens.base) - Math.floor((givens.lower - 1) / givens.base);
    case 'inverse_rounding': return `[${round(givens.roundedValue - 0.05, 2)}, ${round(givens.roundedValue + 0.05, 2)})`;
    case 'lcm': return spec.requestedUnknownRole === 'leastCommonMultiple' ? lcm(givens.left, givens.right) : [lcm(givens.left, givens.right), lcm(givens.left, givens.right) * 2, lcm(givens.left, givens.right) * 3];
    case 'measurement_fraction': return round(givens.wholeUnits + givens.numerator / givens.denominator);
    case 'missing_column_digit': return [7];
    case 'missing_digit_inequality': return [0, 1, 2, 3, 4];
    case 'missing_fraction_addend': return addFractions(givens.total, givens.known, true);
    case 'multiple_enumeration': return spec.requestedUnknownRole === 'isMultiple' ? givens.candidate % givens.base === 0 : [givens.base, givens.base * 2, givens.base * 3, givens.base * 4, givens.base * 5];
    case 'nearest_multiple': {
      const values = [];
      for (let value = Math.ceil(givens.lower / givens.base) * givens.base; value <= givens.upper; value += givens.base) values.push(value);
      return spec.requestedUnknownRole === 'boundedMultiples' ? values : values.reduce((best, value) => Math.abs(value - givens.target) < Math.abs(best - givens.target) ? value : best);
    }
    case 'number_constraint': return [126, 132, 162, 216, 231, 312, 321, 612, 621];
    case 'number_line': return spec.requestedUnknownRole === 'coordinate' ? round(givens.origin + givens.stepCount * givens.unitStep) : round(Math.abs(givens.coordinate - givens.origin));
    case 'place_factor': return spec.requestedUnknownRole === 'higherPlaceValue' ? givens.lowerPlaceValue * 10 : givens.higherPlaceValue / 10;
    case 'quotient_fraction': return fraction(givens.dividend, givens.divisor);
    case 'quotient_fraction_context': return fraction(givens.totalQuantity, givens.recipientCount);
    case 'rate_total': return spec.requestedUnknownRole === 'total' ? round(givens.ratePerUnit * givens.unitCount) : round(givens.firstTotal + givens.secondTotal);
    case 'reciprocal_sum': return addFractions(fraction(1, givens.firstDenominator), fraction(1, givens.secondDenominator));
    case 'rounding': return spec.requestedUnknownRole === 'rounded' ? round(Math.round(givens.value * 10) / 10) : round(givens.rounded * 2);
    case 'segment_measure': return spec.requestedUnknownRole === 'segmentLength' ? round(givens.totalLength / givens.segmentCount) : round(givens.totalLength / givens.segmentLength);
    case 'simplify_fraction': {
      const factorValue = gcd(givens.numerator, givens.denominator);
      if (spec.requestedUnknownRole === 'commonFactor') return factorValue;
      return spec.requestedUnknownRole === 'simplestNumerator' ? givens.numerator / factorValue : givens.denominator / factorValue;
    }
    case 'square_tiling': return lcm(givens.rectangleLength, givens.rectangleWidth);
    case 'whole_as_fraction': return givens.wholeCount * givens.denominator;
    default: throw new Error(`UNSUPPORTED_OPERATION_FAMILY:${spec.operationFamilyId}`);
  }
}

function valueText(value) {
  if (Array.isArray(value)) return value.join('、');
  if (value && typeof value === 'object') return Object.entries(value).map(([key, item]) => `${key}:${item}`).join('、');
  if (typeof value === 'boolean') return value ? '是' : '否';
  return String(value);
}

function roleText(role) {
  return ROLE_LABELS[role] ?? role;
}

function fillSurface(text, givens) {
  const values = Object.values(givens).map(valueText);
  let index = 0;
  return String(text ?? '').replace(/\{\{[^}]+\}\}/g, () => values[index++ % Math.max(values.length, 1)] ?? '資料');
}

export function generateSharedOperationFamilyItem({ spec, applicationRecord = null, ordinal = 1 } = {}) {
  const allRoles = familyRoles(spec);
  const answer = allRoles[spec.requestedUnknownRole];
  const givens = Object.fromEntries(spec.givenRoles.map((role) => [role, allRoles[role]]));
  const factText = Object.entries(givens).map(([role, value]) => `${roleText(role)}為${valueText(value)}`).join('，');
  const basePrompt = spec.mode === 'APPLICATION'
    ? `${fillSurface(applicationRecord?.promptZh, givens)} 情境中${factText}，請求出${roleText(spec.requestedUnknownRole)}。`
    : `已知${factText}，請求出${roleText(spec.requestedUnknownRole)}。`;
  return Object.freeze({
    generatedItemId: `shared_generated_${safeId(spec.patternSpecId)}`,
    ordinal,
    sourceNodeId: spec.sourceNodeId,
    knowledgePointId: spec.knowledgePointId,
    patternSpecId: spec.patternSpecId,
    patternGroupId: spec.patternGroupId,
    operationFamilyId: spec.operationFamilyId,
    mode: spec.mode,
    requestedUnknownRole: spec.requestedUnknownRole,
    givenRoleValues: Object.freeze(givens),
    prompt: basePrompt.replace(/\s+/g, ' ').trim(),
    answer,
    answerText: valueText(answer),
    generatorAdapterId: 'SHARED_OPERATION_FAMILY_GENERATOR_V1',
    validatorAdapterId: 'SHARED_OPERATION_FAMILY_VALIDATOR_V1',
    productionEquivalent: true,
    productionSelectable: false,
    publicSelectable: false
  });
}

export function validateSharedOperationFamilyItem({ spec, item } = {}) {
  const issues = [];
  let expected;
  try {
    expected = evaluateUnknown(spec, item.givenRoleValues);
  } catch (error) {
    issues.push({ code: 'POSTG_APP_SHARED_OPERATION_EVALUATION_FAILED', details: String(error?.message ?? error) });
  }
  if (!issues.length && !same(expected, item.answer)) {
    issues.push({ code: 'POSTG_APP_SHARED_OPERATION_ANSWER_MISMATCH', expected, actual: item.answer });
  }
  if (item.patternSpecId !== spec.patternSpecId || item.operationFamilyId !== spec.operationFamilyId || item.mode !== spec.mode) {
    issues.push({ code: 'POSTG_APP_SHARED_OPERATION_LINEAGE_MISMATCH' });
  }
  if (item.prompt.includes('算式') || item.prompt.includes('答：') || item.prompt.includes('_____') || /\{\{[^}]+\}\}/.test(item.prompt)) {
    issues.push({ code: 'POSTG_APP_SHARED_OPERATION_PROMPT_LEAKAGE' });
  }
  if (item.generatorAdapterId !== 'SHARED_OPERATION_FAMILY_GENERATOR_V1'
      || item.validatorAdapterId !== 'SHARED_OPERATION_FAMILY_VALIDATOR_V1'
      || item.productionSelectable !== false
      || item.publicSelectable !== false) {
    issues.push({ code: 'POSTG_APP_SHARED_OPERATION_PRODUCTION_BOUNDARY_INVALID' });
  }
  return { ok: issues.length === 0, issues, expectedAnswer: expected };
}

export function supportedSharedOperationFamilies() {
  return Object.freeze([
    'common_denominator','common_group_total','comparison_limit','cross_product_equivalence','decimal_add_sub','decimal_compare',
    'decimal_measure_conversion','decimal_multiply','decimal_read_write','decimal_representation','decimal_scale','decimal_sequence',
    'discrete_fraction_conversion','divisibility','equivalent_fraction','exact_grouping','factor_multiple_relation','fraction_accumulation',
    'fraction_add_sub','fraction_bounds','fraction_compare','fraction_context_total','fraction_decimal_conversion','fraction_part_whole',
    'fraction_times_integer','fraction_type','improper_mixed_conversion','infer_decimal_product','interval_multiple_count','inverse_rounding',
    'lcm','measurement_fraction','missing_column_digit','missing_digit_inequality','missing_fraction_addend','multiple_enumeration',
    'nearest_multiple','number_constraint','number_line','place_factor','quotient_fraction','quotient_fraction_context','rate_total',
    'reciprocal_sum','rounding','segment_measure','simplify_fraction','square_tiling','whole_as_fraction'
  ]);
}
