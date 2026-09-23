const pick = (source, keys) => Object.fromEntries(keys.map((key) => [key, source[key]]));
const valueText = (value) => Array.isArray(value) ? value.join('、') : String(value);
const fractionText = (values, prefix) => `${values[`${prefix}Numerator`]}/${values[`${prefix}Denominator`]}`;
const operationSign = (spec) => String(spec.patternSpecId).includes('_sub_') ? '－' : '＋';

function mixedNumberText(value) {
  const match = /^(\d+)\/(\d+)$/.exec(String(value));
  if (!match) return String(value);
  const numerator = Number(match[1]);
  const denominator = Number(match[2]);
  const whole = Math.floor(numerator / denominator);
  const remainder = numerator % denominator;
  if (!whole || !remainder) return String(value);
  return `${whole}又${remainder}/${denominator}`;
}

export function buildNumericFullCohortContract(spec, sourceItem) {
  const values = sourceItem.givenRoleValues ?? {};
  const requested = spec.requestedUnknownRole;

  switch (spec.operationFamilyId) {
    case 'common_denominator': {
      if (requested === 'leftEquivalent') {
        const keys = ['leftNumerator', 'leftDenominator', 'commonDenominator'];
        return {
          keys,
          givens: pick(values, keys),
          prompt: `把${fractionText(values, 'left')}改寫成分母為${values.commonDenominator}的等值分數。`
        };
      }
      if (requested === 'rightEquivalent') {
        const keys = ['rightNumerator', 'rightDenominator', 'commonDenominator'];
        return {
          keys,
          givens: pick(values, keys),
          prompt: `把${fractionText(values, 'right')}改寫成分母為${values.commonDenominator}的等值分數。`
        };
      }
      return null;
    }
    case 'common_group_total': {
      const keys = ['firstGrouping', 'secondGrouping'];
      return { keys, givens: pick(values, keys), prompt: `一批物品按每${values.firstGrouping}個或每${values.secondGrouping}個分組都能剛好分完，最少有多少個？` };
    }
    case 'comparison_limit': {
      const keys = ['denominatorsEqual', 'numerators'];
      const numerators = values.numerators ?? [];
      return { keys, givens: pick(values, keys), prompt: `兩個分數的分母相同，分子分別是${numerators[0]}和${numerators[1]}。應使用哪一種比較方法？` };
    }
    case 'cross_product_equivalence': {
      const keys = ['leftNumerator', 'leftDenominator', 'rightNumerator', 'rightDenominator'];
      return { keys, givens: pick(values, keys), prompt: `${fractionText(values, 'left')}和${fractionText(values, 'right')}是否為等值分數？` };
    }
    case 'decimal_add_sub': {
      const keys = ['left', 'right'];
      const sign = operationSign(spec);
      return { keys, givens: pick(values, keys), prompt: `計算${values.left}${sign}${values.right}。` };
    }
    case 'decimal_measure_conversion': {
      if (requested === 'majorUnits') {
        const keys = ['minorUnits', 'conversionFactor'];
        return { keys, givens: pick(values, keys), prompt: `每${values.conversionFactor}個小單位等於1個大單位，${values.minorUnits}個小單位等於多少個大單位？` };
      }
      const keys = ['majorUnits', 'conversionFactor'];
      return { keys, givens: pick(values, keys), prompt: `每1個大單位等於${values.conversionFactor}個小單位，${values.majorUnits}個大單位等於多少個小單位？` };
    }
    case 'decimal_multiply': {
      const keys = ['decimalFactor', 'integerFactor'];
      return { keys, givens: pick(values, keys), prompt: `計算${values.decimalFactor}×${values.integerFactor}。` };
    }
    case 'decimal_representation': {
      const keys = ['whole', 'fractionalUnits', 'placeUnit'];
      return { keys, givens: pick(values, keys), prompt: `${values.whole}個一和${values.fractionalUnits}個${values.placeUnit}合起來是多少？` };
    }
    case 'decimal_scale': {
      const keys = ['value', 'scaleFactor'];
      return { keys, givens: pick(values, keys), prompt: `${values.value}放大${values.scaleFactor}倍後是多少？` };
    }
    case 'decimal_sequence': {
      const keys = ['start', 'step'];
      return { keys, givens: pick(values, keys), prompt: `從${values.start}開始，每次增加${values.step}，連續增加4次後是多少？` };
    }
    case 'discrete_fraction_conversion': {
      if (requested === 'itemCount') {
        const keys = ['fractionalUnits', 'itemsPerWhole'];
        return {
          keys,
          givens: pick(values, keys),
          prompt: `每1個完整單位有${values.itemsPerWhole}件物品，${mixedNumberText(values.fractionalUnits)}個單位共有幾件物品？`
        };
      }
      const keys = ['itemCount', 'itemsPerWhole'];
      return {
        keys,
        givens: pick(values, keys),
        prompt: `每${values.itemsPerWhole}件物品算1個完整單位，${values.itemCount}件物品共有多少個單位？`,
        answerText: mixedNumberText(sourceItem.answer)
      };
    }
    case 'divisibility': {
      const keys = ['value', 'divisor'];
      return { keys, givens: pick(values, keys), prompt: `${values.value}能不能被${values.divisor}整除？` };
    }
    case 'equivalent_fraction': {
      if (requested === 'factor') {
        const keys = ['numerator', 'equivalentNumerator'];
        return { keys, givens: pick(values, keys), prompt: `分子從${values.numerator}變成${values.equivalentNumerator}，分子和分母都乘以幾？` };
      }
      if (requested === 'equivalentNumerator') {
        const keys = ['numerator', 'factor'];
        return { keys, givens: pick(values, keys), prompt: `分子${values.numerator}乘以${values.factor}後，等值分數的分子是多少？` };
      }
      const keys = ['denominator', 'factor'];
      return { keys, givens: pick(values, keys), prompt: `分母${values.denominator}乘以${values.factor}後，等值分數的分母是多少？` };
    }
    case 'exact_grouping': {
      const keys = ['total', 'groupSize'];
      return { keys, givens: pick(values, keys), prompt: `${values.total}個物品，每${values.groupSize}個分成一組，能不能剛好分完？` };
    }
    case 'fraction_accumulation': {
      const keys = ['unitFractionCount', 'denominator'];
      return { keys, givens: pick(values, keys), prompt: `${values.unitFractionCount}個1/${values.denominator}合起來是多少？` };
    }
    case 'fraction_add_sub': {
      const keys = ['leftNumerator', 'leftDenominator', 'rightNumerator', 'rightDenominator'];
      return { keys, givens: pick(values, keys), prompt: `計算${fractionText(values, 'left')}${operationSign(spec)}${fractionText(values, 'right')}。` };
    }
    case 'fraction_decimal_conversion': {
      if (requested === 'decimal') {
        const keys = ['numerator', 'denominator'];
        return { keys, givens: pick(values, keys), prompt: `把${values.numerator}/${values.denominator}化成小數。` };
      }
      const keys = ['denominator', 'decimal'];
      return { keys, givens: pick(values, keys), prompt: `分母是${values.denominator}的分數化成小數後是${values.decimal}，分子是多少？` };
    }
    case 'fraction_part_whole': {
      const keys = ['selectedParts', 'equalParts'];
      return { keys, givens: pick(values, keys), prompt: `把一個整體平均分成${values.equalParts}份，取其中${values.selectedParts}份，是多少？` };
    }
    case 'fraction_times_integer': {
      const keys = ['amountPerGroup', 'groupCount'];
      return { keys, givens: pick(values, keys), prompt: `每組是${values.amountPerGroup}，共有${values.groupCount}組，總量是多少？` };
    }
    case 'fraction_type': {
      const keys = ['numerator', 'denominator'];
      return { keys, givens: pick(values, keys), prompt: `${values.numerator}/${values.denominator}是真分數、假分數，還是整數等值分數？` };
    }
    case 'improper_mixed_conversion': {
      if (requested === 'whole') {
        const keys = ['numerator', 'denominator'];
        return { keys, givens: pick(values, keys), prompt: `把${values.numerator}/${values.denominator}化成帶分數，整數部分是多少？` };
      }
      if (requested === 'remainder') {
        const keys = ['numerator', 'denominator'];
        return { keys, givens: pick(values, keys), prompt: `把${values.numerator}/${values.denominator}化成帶分數，分數部分的分子是多少？` };
      }
      return null;
    }
    case 'lcm': {
      const keys = ['left', 'right'];
      if (requested === 'commonMultiples') {
        return { keys, givens: pick(values, keys), prompt: `列出${values.left}和${values.right}最小的三個正公倍數。` };
      }
      return { keys, givens: pick(values, keys), prompt: `${values.left}和${values.right}的最小公倍數是多少？` };
    }
    case 'measurement_fraction': {
      const keys = ['wholeUnits', 'numerator', 'denominator'];
      return { keys, givens: pick(values, keys), prompt: `${values.wholeUnits}個完整單位和${values.numerator}/${values.denominator}個單位合起來是多少？` };
    }
    case 'missing_column_digit': {
      const keys = ['addendsOrMinuend', 'result'];
      return { keys, givens: pick(values, keys), prompt: `直式${values.addendsOrMinuend}的結果是${values.result}，□應填什麼數字？` };
    }
    case 'missing_digit_inequality': {
      const keys = ['left', 'right'];
      return { keys, givens: pick(values, keys), prompt: `在${values.left}＜${values.right}中，□可以填哪些數字？` };
    }
    case 'missing_fraction_addend': {
      const keys = ['total', 'known'];
      return { keys, givens: pick(values, keys), prompt: `${values.known}加上多少等於${values.total}？` };
    }
    case 'nearest_multiple': {
      if (requested === 'boundedMultiples') {
        const keys = ['base', 'lower', 'upper'];
        return { keys, givens: pick(values, keys), prompt: `列出${values.lower}到${values.upper}之間（包含兩端）所有${values.base}的倍數。` };
      }
      const keys = ['base', 'lower', 'upper', 'target'];
      return { keys, givens: pick(values, keys), prompt: `在${values.lower}到${values.upper}之間，最接近${values.target}的${values.base}的倍數是多少？` };
    }
    case 'number_constraint': {
      const keys = ['allowedDigits', 'constraints'];
      return { keys, givens: pick(values, keys), prompt: `只使用${valueText(values.allowedDigits)}，找出所有符合「${valueText(values.constraints)}」的數。` };
    }
    case 'number_line': {
      if (requested === 'coordinate') {
        const keys = ['origin', 'unitStep', 'stepCount'];
        return { keys, givens: pick(values, keys), prompt: `從${values.origin}開始，每格是${values.unitStep}，向右走${values.stepCount}格後到哪個數？` };
      }
      const keys = ['origin', 'coordinate'];
      return { keys, givens: pick(values, keys), prompt: `數線上${values.origin}到${values.coordinate}的距離是多少？` };
    }
    case 'place_factor': {
      if (requested === 'higherPlaceValue') {
        const keys = ['lowerPlaceValue'];
        return { keys, givens: pick(values, keys), prompt: `某一位的位值是${values.lowerPlaceValue}，它左邊一位的位值是多少？` };
      }
      const keys = ['higherPlaceValue'];
      return { keys, givens: pick(values, keys), prompt: `某一位的位值是${values.higherPlaceValue}，它右邊一位的位值是多少？` };
    }
    case 'quotient_fraction': {
      const keys = ['dividend', 'divisor'];
      return { keys, givens: pick(values, keys), prompt: `把${values.dividend}÷${values.divisor}的商用分數表示。` };
    }
    case 'quotient_fraction_context': {
      const keys = ['totalQuantity', 'recipientCount'];
      return { keys, givens: pick(values, keys), prompt: `把${values.totalQuantity}平均分給${values.recipientCount}組，每組分得多少？` };
    }
    case 'reciprocal_sum': {
      const keys = ['firstDenominator', 'secondDenominator'];
      return { keys, givens: pick(values, keys), prompt: `計算1/${values.firstDenominator}＋1/${values.secondDenominator}。` };
    }
    case 'simplify_fraction': {
      const keys = ['numerator', 'denominator'];
      if (requested === 'commonFactor') {
        return { keys, givens: pick(values, keys), prompt: `${values.numerator}/${values.denominator}約分時，分子和分母的最大公因數是多少？` };
      }
      if (requested === 'simplestNumerator') {
        return { keys, givens: pick(values, keys), prompt: `把${values.numerator}/${values.denominator}約成最簡分數，分子是多少？` };
      }
      return { keys, givens: pick(values, keys), prompt: `把${values.numerator}/${values.denominator}約成最簡分數，分母是多少？` };
    }
    case 'square_tiling': {
      const keys = ['rectangleLength', 'rectangleWidth'];
      return { keys, givens: pick(values, keys), prompt: `用長${values.rectangleLength}、寬${values.rectangleWidth}的長方形拼成最小的正方形，正方形邊長是多少？` };
    }
    case 'whole_as_fraction': {
      const keys = ['wholeCount', 'denominator'];
      return { keys, givens: pick(values, keys), prompt: `把整數${values.wholeCount}寫成分母為${values.denominator}的分數，分子是多少？` };
    }
    default:
      return null;
  }
}
