import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const BASELINE_PATH = 'data/curriculum/application/assessment/w02-source13-source-authority-baseline.json';
const OUTPUT_DIR = 'data/curriculum/application/operations/w02';
const TASK_ID = 'POSTG-APP-W02-A01C_CanonicalOperationModelMaterialization';

const P = (canonicalExpressions, operandRoles, unknownRoles, numberConstraints, equivalentForms, answerType, validationInvariants) => ({
  canonicalExpressions,
  operandRoles,
  unknownRoles,
  numberConstraints,
  equivalentForms,
  answerType,
  validationInvariants
});

const profiles = {
  fraction_part_whole: P(['fraction = selectedParts / equalParts'], { selectedParts: '所取等份數', equalParts: '整體等分數', fraction: '部分占整體的分數' }, ['fraction'], ['0 <= selectedParts <= equalParts', 'equalParts > 0'], ['diagram shading', 'discrete-set partition'], 'fraction', ['denominator equals the number of equal parts', 'numerator equals the selected equal parts']),
  fraction_accumulation: P(['fraction = unitFractionCount / denominator'], { unitFractionCount: '單位分數個數', denominator: '每一整體的等分數', fraction: '累積後分數' }, ['fraction'], ['unitFractionCount >= 0', 'denominator > 0'], ['unitFractionCount × (1/denominator)'], 'fraction', ['the denominator remains fixed', 'the numerator equals the accumulated unit-fraction count']),
  discrete_fraction_conversion: P(['itemCount = wholeUnits * itemsPerWhole + numerator * itemsPerWhole / denominator', 'fractionalUnits = itemCount / itemsPerWhole'], { wholeUnits: '完整大單位數', itemsPerWhole: '每大單位所含個數', numerator: '部分單位分子', denominator: '部分單位分母', itemCount: '換算後個數', fractionalUnits: '換算後分數單位數' }, ['itemCount', 'fractionalUnits'], ['itemsPerWhole > 0', 'denominator > 0', 'numerator * itemsPerWhole must be divisible by denominator when an integer count is required'], ['itemCount / itemsPerWhole', 'mixed unit plus fractional unit'], 'fraction_or_integer_quantity', ['both directions preserve total quantity', 'unit roles are not interchangeable']),
  measurement_fraction: P(['measure = wholeUnits + numerator / denominator'], { wholeUnits: '完整測量單位數', numerator: '部分單位分子', denominator: '單位等分數', measure: '帶單位測量值' }, ['measure'], ['denominator > 0', '0 <= numerator < denominator'], ['number-line coordinate', 'mixed-number measure'], 'fraction_measure', ['the measurement unit is preserved', 'tick spacing equals one unit divided by denominator']),
  whole_as_fraction: P(['wholeCount = numerator / denominator', 'numerator = wholeCount * denominator'], { wholeCount: '完整整體數', numerator: '等份總數', denominator: '每整體等分數' }, ['numerator'], ['wholeCount >= 0', 'denominator > 0'], ['1 = denominator/denominator'], 'fraction', ['numerator and denominator represent the same number of equal parts for one whole']),
  fraction_compare: P(['comparison = compare(leftNumerator * rightDenominator, rightNumerator * leftDenominator)'], { leftNumerator: '左分數分子', leftDenominator: '左分數分母', rightNumerator: '右分數分子', rightDenominator: '右分數分母', comparison: '大小關係' }, ['comparison'], ['leftDenominator > 0', 'rightDenominator > 0'], ['common-denominator comparison', 'cross-product comparison', 'number-line comparison'], 'comparison_symbol_or_order', ['comparison must equal the exact rational-number relation']),
  comparison_limit: P(['validStrategy = denominatorsEqual ? compare(numerators) : requireEquivalentRepresentation'], { denominatorsEqual: '分母是否相同', numerators: '待比較分子', validStrategy: '可採比較策略' }, ['validStrategy'], ['all denominators > 0'], ['counterexample to numerator-only comparison'], 'strategy_classification', ['numerator-only comparison is valid only for equal positive denominators']),
  quotient_fraction: P(['quotient = dividend / divisor'], { dividend: '被除數或總量', divisor: '除數或份數', quotient: '以分數表示的商' }, ['quotient'], ['divisor > 0'], ['dividend ÷ divisor', 'dividend/divisor'], 'fraction', ['fraction value equals the division result']),
  fraction_add_sub: P(['result = leftNumerator/leftDenominator + rightNumerator/rightDenominator', 'result = leftNumerator/leftDenominator - rightNumerator/rightDenominator'], { leftNumerator: '左分數分子', leftDenominator: '左分數分母', rightNumerator: '右分數分子', rightDenominator: '右分數分母', result: '和或差' }, ['result'], ['leftDenominator > 0', 'rightDenominator > 0', 'subtraction result must satisfy the source scope'], ['common-denominator form', 'improper-fraction form', 'mixed-number form'], 'fraction', ['result equals exact rational arithmetic', 'final form preserves value']),
  fraction_context_total: P(['total = firstQuantity + secondQuantity', 'original = used + remaining', 'difference = larger - smaller'], { firstQuantity: '第一個同單位分數量', secondQuantity: '第二個同單位分數量', used: '已使用量', remaining: '剩餘量', total: '合計量', original: '原量', difference: '差量' }, ['total', 'original', 'difference'], ['all quantities use a common measure before arithmetic', 'result >= 0'], ['join', 'part-whole reconstruction', 'comparison difference'], 'fraction_measure', ['operation follows the quantity relation', 'measurement units remain consistent']),
  decimal_representation: P(['decimal = whole + fractionalUnits * placeUnit'], { whole: '整數部分', fractionalUnits: '小數位單位個數', placeUnit: '0.1、0.01 或更小位值單位', decimal: '小數值' }, ['decimal'], ['whole >= 0', '0 <= each place digit <= 9'], ['place-value table', 'expanded decimal form'], 'decimal', ['place-value expansion recombines to the decimal exactly']),
  decimal_read_write: P(['decimalText = encodePlaceValue(digitsByPlace)'], { digitsByPlace: '各小數位數字', decimalText: '數字或讀法' }, ['decimalText'], ['0 <= each digit <= 9'], ['spoken form', 'standard decimal notation'], 'decimal_or_reading', ['reading and notation preserve every place value']),
  decimal_compare: P(['comparison = compare(normalizeScale(left), normalizeScale(right))'], { left: '左側小數', right: '右側小數', comparison: '大小關係' }, ['comparison'], ['inputs are finite decimals within the source precision'], ['place-value comparison', 'append trailing zeros'], 'comparison_symbol_or_order', ['trailing zeros do not change value', 'comparison is numerically correct']),
  decimal_add_sub: P(['result = alignDecimal(left) + alignDecimal(right)', 'result = alignDecimal(left) - alignDecimal(right)'], { left: '第一個小數', right: '第二個小數', result: '和或差' }, ['result'], ['inputs and result stay within source precision', 'subtraction result must satisfy the source scope'], ['column algorithm with aligned decimal points', 'equivalent trailing-zero form'], 'decimal', ['decimal points are aligned', 'result equals exact decimal arithmetic']),
  decimal_measure_conversion: P(['majorUnits = minorUnits / conversionFactor', 'minorUnits = majorUnits * conversionFactor'], { majorUnits: '較大測量單位數', minorUnits: '較小測量單位數', conversionFactor: '單位換算倍率' }, ['majorUnits', 'minorUnits'], ['conversionFactor is the exact unit ratio', 'quantities are nonnegative'], ['compound-unit notation', 'decimal major-unit notation'], 'decimal_measure', ['both forms represent the same physical measure']),
  fraction_decimal_conversion: P(['decimal = numerator / denominator', 'numerator = decimal * denominator'], { numerator: '分數分子', denominator: '分數分母', decimal: '有限小數' }, ['decimal', 'numerator'], ['denominator > 0', 'denominator is convertible to the required decimal scale'], ['tenths or hundredths fraction', 'finite decimal'], 'fraction_or_decimal', ['conversion preserves exact rational value']),
  fraction_type: P(['type = numerator < denominator ? proper : numerator == denominator ? wholeEquivalent : improper'], { numerator: '分子', denominator: '分母', wholePart: '帶分數整數部分', type: '分數類型' }, ['type'], ['denominator > 0', 'numerator >= 0'], ['proper fraction', 'improper fraction', 'mixed number'], 'classification_label', ['classification follows numerator-denominator relation and whole-part presence']),
  improper_mixed_conversion: P(['whole = floor(numerator / denominator)', 'remainder = numerator mod denominator', 'improperNumerator = whole * denominator + remainder'], { numerator: '假分數分子', denominator: '固定分母', whole: '帶分數整數部分', remainder: '帶分數分子', improperNumerator: '換算後假分數分子' }, ['whole', 'remainder', 'improperNumerator'], ['denominator > 0', '0 <= remainder < denominator'], ['improper fraction', 'mixed number', 'integer'], 'fraction_or_mixed_number', ['both representations have equal value']),
  number_line: P(['coordinate = origin + stepCount * unitStep', 'distance = abs(rightCoordinate - leftCoordinate)'], { origin: '數線起點', unitStep: '每格代表值', stepCount: '格數', coordinate: '座標', distance: '兩點距離' }, ['coordinate', 'distance'], ['unitStep > 0', 'stepCount is integer'], ['fraction coordinate', 'decimal coordinate'], 'number_or_distance', ['coordinate respects tick spacing', 'distance is nonnegative']),
  fraction_times_integer: P(['total = amountPerGroup * groupCount'], { amountPerGroup: '每份分數或帶分數量', groupCount: '份數', total: '總量' }, ['total'], ['groupCount is a nonnegative integer', 'amountPerGroup >= 0'], ['repeated addition', 'fraction multiplication'], 'fraction_measure', ['total equals repeated equal quantities', 'measurement unit is preserved']),
  place_factor: P(['higherPlaceValue = lowerPlaceValue * 10', 'lowerPlaceValue = higherPlaceValue / 10'], { higherPlaceValue: '較高位值', lowerPlaceValue: '相鄰較低位值' }, ['higherPlaceValue', 'lowerPlaceValue'], ['place values are adjacent in base ten'], ['ten times', 'one tenth'], 'numeric_relation', ['adjacent decimal places differ by exactly a factor of ten']),
  missing_digit_inequality: P(['possibleDigits = {d in 0..9 | relation(left(d), right(d))}'], { missingDigit: '未知位數', left: '左側小數', right: '右側小數', possibleDigits: '所有可行數字' }, ['possibleDigits'], ['0 <= missingDigit <= 9'], ['place-value case analysis'], 'digit_set', ['set is complete', 'every listed digit satisfies the inequality']),
  decimal_sequence: P(['term[n] = start + n * step'], { start: '首項', step: '固定小數增量', term: '指定項' }, ['term'], ['step is constant'], ['repeated addition', 'arithmetic sequence'], 'decimal_sequence', ['successive differences equal step']),
  missing_column_digit: P(['possibleDigits = digits satisfying aligned column arithmetic'], { addendsOrMinuend: '直式已知數字', missingDigits: '缺失數字', result: '直式結果' }, ['missingDigits'], ['each missing digit is 0..9', 'decimal points are aligned'], ['carry or borrow reconstruction'], 'digit_map', ['reconstructed operation is arithmetically exact']),
  decimal_multiply: P(['product = decimalFactor * integerFactor'], { decimalFactor: '小數因數', integerFactor: '整數因數', product: '積' }, ['product'], ['integerFactor is an integer', 'factors are nonnegative within source scope'], ['scaled integer multiplication', 'column multiplication'], 'decimal', ['product has correct place value', 'product equals exact multiplication']),
  decimal_scale: P(['result = value * scaleFactor'], { value: '原小數', scaleFactor: '10、100、0.1 或 0.01', result: '倍率後小數' }, ['result'], ['scaleFactor in {10,100,0.1,0.01}'], ['decimal-point shift', 'place-value scaling'], 'decimal', ['each digit changes place consistently with scaleFactor']),
  infer_decimal_product: P(['decimalProduct = integerProduct / 10^decimalPlaceCount'], { integerProduct: '忽略小數點的整數積', decimalPlaceCount: '兩因數小數位數總和', decimalProduct: '小數積' }, ['decimalProduct'], ['decimalPlaceCount >= 0'], ['scaled integer product'], 'decimal', ['decimal places in the product equal the total scaling of the factors']),
  rate_total: P(['total = ratePerUnit * unitCount', 'combined = firstTotal + secondTotal'], { ratePerUnit: '每單位距離或流量', unitCount: '次數或時間單位數', firstTotal: '第一方向或來源總量', secondTotal: '第二方向或來源總量', total: '單一總量', combined: '合計量' }, ['total', 'combined'], ['unitCount >= 0', 'rates and totals use compatible units'], ['repeated equal rate', 'same-direction or opposite-direction aggregation'], 'decimal_measure', ['rate units cancel correctly', 'direction rule matches the requested total']),
  equivalent_fraction: P(['equivalentNumerator = numerator * factor', 'equivalentDenominator = denominator * factor'], { numerator: '原分子', denominator: '原分母', factor: '非零擴約倍率', equivalentNumerator: '等值分子', equivalentDenominator: '等值分母' }, ['factor', 'equivalentNumerator', 'equivalentDenominator'], ['denominator > 0', 'factor > 0'], ['expansion', 'reduction'], 'fraction_or_missing_integer', ['numerator and denominator change by the same factor', 'value is preserved']),
  cross_product_equivalence: P(['equivalent = leftNumerator * rightDenominator == rightNumerator * leftDenominator'], { leftNumerator: '左分子', leftDenominator: '左分母', rightNumerator: '右分子', rightDenominator: '右分母', equivalent: '是否等值' }, ['equivalent'], ['both denominators > 0'], ['common-denominator equality'], 'boolean', ['equivalence holds iff cross products are equal']),
  fraction_bounds: P(['possibleValues = {x | lowerBound < value(x) < upperBound}'], { lowerBound: '下界分數', upperBound: '上界分數', unknownPart: '未知分子或帶分數部分', possibleValues: '可行集合' }, ['possibleValues'], ['lowerBound <= upperBound', 'denominators > 0'], ['common-denominator bounds', 'cross-product bounds'], 'integer_or_fraction_set', ['set contains exactly all values satisfying the bounds']),
  rounding: P(['rounded = roundToPlace(value, targetPlace)', 'estimate = operate(round(left), round(right))'], { value: '原小數', targetPlace: '指定取概數位', rounded: '概數', estimate: '估算結果' }, ['rounded', 'estimate'], ['targetPlace is within source precision'], ['half-up interval', 'front-end estimate'], 'decimal', ['rounding boundary is applied at the next lower place']),
  inverse_rounding: P(['range = {x | roundToPlace(x, targetPlace) = roundedValue}'], { roundedValue: '已知概數', targetPlace: '取概數位', range: '原數範圍' }, ['range'], ['precision and rounding rule are fixed'], ['half-open rounding interval'], 'decimal_range', ['every value in range rounds to roundedValue', 'bounds are tight']),
  multiple_enumeration: P(['isMultiple = candidate mod base == 0', 'multiples = {base * k | k is positive integer}'], { base: '基準整數', candidate: '候選整數', isMultiple: '是否為倍數', multiples: '倍數集合' }, ['isMultiple', 'multiples'], ['base > 0', 'candidate >= 0'], ['multiplication table', 'exact divisibility'], 'boolean_or_integer_list', ['every listed value is divisible by base', 'bounded list is complete']),
  nearest_multiple: P(['boundedMultiples = {base*k | lower <= base*k <= upper}', 'nearest = argmin(abs(base*k - target))'], { base: '基準整數', lower: '下界', upper: '上界', target: '目標數', boundedMultiples: '範圍內倍數', nearest: '最接近倍數' }, ['boundedMultiples', 'nearest'], ['base > 0', 'lower <= upper'], ['floor/ceiling quotient candidates'], 'integer_or_integer_list', ['bounds are respected', 'nearest minimizes absolute distance']),
  divisibility: P(['divisible = divisibilityRule(value, divisor)'], { value: '待判定整數', divisor: '2、3、5 或 10', divisible: '是否整除' }, ['divisible'], ['divisor in {2,3,5,10}'], ['last-digit rule', 'digit-sum rule'], 'boolean', ['rule result equals value mod divisor == 0']),
  factor_multiple_relation: P(['isFactor = product mod factor == 0', 'isMultiple = value mod base == 0'], { factor: '候選因數', product: '被整除數', value: '候選倍數', base: '基準數', isFactor: '是否為因數', isMultiple: '是否為倍數' }, ['isFactor', 'isMultiple'], ['positive integer domain'], ['multiplication equation', 'division equation'], 'classification_or_boolean', ['classification agrees with exact divisibility']),
  interval_multiple_count: P(['count = floor(upper/base) - floor((lower-1)/base)'], { base: '倍數基準', lower: '區間下界', upper: '區間上界', count: '符合倍數條件個數' }, ['count'], ['base > 0', 'lower <= upper'], ['enumeration of bounded multiples'], 'integer', ['count equals the complete bounded set size']),
  exact_grouping: P(['feasible = total mod groupSize == 0'], { total: '物品總數', groupSize: '每組量或組數', feasible: '能否整組分配' }, ['feasible'], ['total >= 0', 'groupSize > 0'], ['factor membership', 'integer quotient'], 'boolean_or_integer_selection', ['no remainder is allowed for a feasible plan']),
  lcm: P(['commonMultiples = multiples(left) intersection multiples(right)', 'leastCommonMultiple = min(commonMultiples)'], { left: '第一個正整數', right: '第二個正整數', commonMultiples: '公倍數集合', leastCommonMultiple: '最小公倍數' }, ['commonMultiples', 'leastCommonMultiple'], ['left > 0', 'right > 0'], ['prime-factor LCM', 'bounded enumeration'], 'integer_or_integer_list', ['every common multiple is divisible by both inputs', 'leastCommonMultiple is the smallest positive member']),
  common_group_total: P(['minimumTotal = lcm(firstGrouping, secondGrouping)'], { firstGrouping: '第一種分組規格', secondGrouping: '第二種分組規格', minimumTotal: '最小共同總量' }, ['minimumTotal'], ['grouping values are positive integers'], ['simultaneous divisibility', 'first common multiple'], 'integer_quantity', ['total is divisible by both grouping specifications', 'no smaller positive total satisfies both']),
  square_tiling: P(['squareSide = lcm(rectangleLength, rectangleWidth)'], { rectangleLength: '長方形長', rectangleWidth: '長方形寬', squareSide: '最小正方形邊長' }, ['squareSide'], ['lengths are positive compatible measures'], ['common-multiple tiling'], 'length', ['square side is divisible by both rectangle dimensions', 'tiling has no gaps or overlaps']),
  number_constraint: P(['solutions = {n formed from allowedDigits | all divisibility constraints hold}'], { allowedDigits: '可用數字卡', constraints: '倍數或位數限制', solutions: '所有合格整數' }, ['solutions'], ['digit-use rule is explicit', 'leading digit is nonzero'], ['divisibility-rule filtering'], 'integer_set', ['every solution uses only allowed digits', 'solution set is complete']),
  simplify_fraction: P(['simplestNumerator = numerator / gcd(numerator, denominator)', 'simplestDenominator = denominator / gcd(numerator, denominator)'], { numerator: '原分子', denominator: '原分母', commonFactor: '共同因數', simplestNumerator: '最簡分子', simplestDenominator: '最簡分母' }, ['commonFactor', 'simplestNumerator', 'simplestDenominator'], ['denominator > 0'], ['successive reduction', 'greatest-common-factor reduction'], 'fraction', ['value is preserved', 'final numerator and denominator are coprime']),
  common_denominator: P(['leftEquivalent = leftNumerator*(commonDenominator/leftDenominator)/commonDenominator', 'rightEquivalent = rightNumerator*(commonDenominator/rightDenominator)/commonDenominator'], { leftNumerator: '左分子', leftDenominator: '左分母', rightNumerator: '右分子', rightDenominator: '右分母', commonDenominator: '共同分母', leftEquivalent: '左側等值分數', rightEquivalent: '右側等值分數' }, ['commonDenominator', 'leftEquivalent', 'rightEquivalent'], ['commonDenominator is a common multiple of both denominators'], ['least-common-denominator form', 'any valid common-denominator form'], 'fraction_pair', ['both fraction values are preserved', 'resulting denominators are equal']),
  quotient_fraction_context: P(['sharePerRecipient = totalQuantity / recipientCount'], { totalQuantity: '待平均分配總量', recipientCount: '人數或容器數', sharePerRecipient: '每份分數量' }, ['sharePerRecipient'], ['recipientCount > 0', 'totalQuantity >= 0'], ['division quotient', 'fraction per recipient'], 'fraction_measure', ['all recipients receive equal shares', 'shares recombine to totalQuantity']),
  segment_measure: P(['segmentLength = totalLength / segmentCount', 'segmentCount = totalMeasure / unitMeasure'], { totalLength: '總長或總容量', segmentCount: '等分段數或所需單位數', unitMeasure: '每段或每單位量', segmentLength: '每段長度' }, ['segmentLength', 'segmentCount'], ['divisor or unitMeasure > 0'], ['equal partition', 'measurement iteration'], 'fraction_measure_or_integer', ['equal segments recombine to the total measure']),
  reciprocal_sum: P(['sum = 1/firstDenominator + 1/secondDenominator'], { firstDenominator: '第一單位分數分母', secondDenominator: '第二單位分數分母', sum: '合計' }, ['sum'], ['denominators > 0'], ['common-denominator sum', 'identified denominator relation'], 'fraction', ['sum equals exact rational addition']),
  missing_fraction_addend: P(['missing = total - known'], { total: '已知分數和', known: '已知加數', missing: '未知加數' }, ['missing'], ['denominators > 0'], ['inverse addition', 'common-denominator subtraction'], 'fraction', ['known + missing equals total'])
};

const rules = [
  [/part_whole_fraction$/, 'fraction_part_whole'], [/unit_fraction_accumulation$/, 'fraction_accumulation'], [/(discrete_set_fraction|fraction_unit_conversion)$/, 'discrete_fraction_conversion'], [/measurement_fraction$/, 'measurement_fraction'], [/whole_as_fraction$/, 'whole_as_fraction'],
  [/(same_denominator_compare|fraction_compare_order|fraction_compare_cross_product|unlike_fraction_compare)$/, 'fraction_compare'], [/unlike_denominator_comparison_limit$/, 'comparison_limit'], [/quotient_as_fraction$/, 'quotient_fraction'], [/(same_denominator_add_sub|whole_and_fraction_add_sub|mixed_fraction_add_sub|unlike_denominator_add_sub|unlike_fraction_add|unlike_fraction_sub|mixed_improper_add_sub)$/, 'fraction_add_sub'], [/(combined_fraction_context|fraction_plus_count_context|original_or_difference_context|measurement_difference_context)$/, 'fraction_context_total'],
  [/(tenth_representation|hundredth_representation|decimal_compose_decompose|decimal_read_place)$/, 'decimal_representation'], [/decimal_read_write$/, 'decimal_read_write'], [/decimal_compare$/, 'decimal_compare'], [/decimal_add_sub$/, 'decimal_add_sub'], [/(length_decimal_conversion|decimal_length_conversion)$/, 'decimal_measure_conversion'], [/tenths_fraction_decimal$/, 'fraction_decimal_conversion'],
  [/fraction_type_classification$/, 'fraction_type'], [/improper_mixed_conversion$/, 'improper_mixed_conversion'], [/(fraction_number_line|decimal_number_line|fraction_number_line_distance)$/, 'number_line'], [/fraction_times_integer_quantity$/, 'fraction_times_integer'], [/place_value_factor_relation$/, 'place_factor'], [/missing_digit_inequality$/, 'missing_digit_inequality'], [/decimal_sequence$/, 'decimal_sequence'], [/missing_digit_column_operation$/, 'missing_column_digit'],
  [/(one_decimal_times_integer|two_decimal_times_integer)$/, 'decimal_multiply'], [/decimal_scale_ten_hundred$/, 'decimal_scale'], [/infer_decimal_product$/, 'infer_decimal_product'], [/rate_distance_context$/, 'rate_total'], [/generate_equivalent_fraction$/, 'equivalent_fraction'], [/equivalence_cross_product$/, 'cross_product_equivalence'], [/fraction_decimal_conversion$/, 'fraction_decimal_conversion'], [/mixed_fraction_order_constraints$/, 'fraction_bounds'],
  [/decimal_round_estimate$/, 'rounding'], [/inverse_rounding_range$/, 'inverse_rounding'], [/multiple_identify_enumerate$/, 'multiple_enumeration'], [/bounded_or_nearest_multiple$/, 'nearest_multiple'], [/divisibility_rules$/, 'divisibility'], [/(factor_multiple_relation|divisor_multiple_classification|factor_multiple_language)$/, 'factor_multiple_relation'], [/count_multiples_interval$/, 'interval_multiple_count'], [/exact_grouping_feasibility$/, 'exact_grouping'],
  [/common_multiple_lcm$/, 'lcm'], [/grouping_constraints$/, 'common_group_total'], [/bounded_common_multiples$/, 'lcm'], [/rectangle_square_tiling$/, 'square_tiling'], [/number_constraint_construction$/, 'number_constraint'], [/(expand_reduce_simplest|divisibility_supported_reduction)$/, 'simplify_fraction'], [/common_denominator$/, 'common_denominator'], [/quotient_as_fraction_context$/, 'quotient_fraction_context'], [/fraction_measurement_segments$/, 'segment_measure'], [/equivalent_mixed_selection$/, 'improper_mixed_conversion'],
  [/reciprocal_unit_fraction_sum$/, 'reciprocal_sum'], [/missing_addend_structure$/, 'missing_fraction_addend']
];

function profileFor(knowledgePointId) {
  const matches = rules.filter(([pattern]) => pattern.test(knowledgePointId));
  if (matches.length !== 1) throw new Error(`Expected exactly one operation profile for ${knowledgePointId}; got ${matches.length}`);
  return { profileId: matches[0][1], profile: profiles[matches[0][1]] };
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function materializeRegistry(root, candidatePath, candidate) {
  const knowledgePoints = candidate.knowledgePoints.map((kp) => {
    const { profileId, profile } = profileFor(kp.candidateId);
    return {
      knowledgePointId: kp.candidateId,
      knowledgePointName: kp.name,
      scope: kp.scope,
      evidencePages: kp.evidencePages,
      applicationClassification: kp.applicationClassification,
      classificationRationale: kp.classificationRationale,
      operationModels: [{
        modelId: kp.candidateId.replace(/^kp_/, 'op_'),
        operationFamilyId: profileId,
        ...profile
      }]
    };
  });
  return {
    schemaName: 'POSTGAPPW02CanonicalOperationUnitV1',
    schemaVersion: 1,
    programId: 'POST_GOLDEN_APPLICATION_CAPABILITY_EXPANSION_V1',
    taskId: TASK_ID,
    sourceNodeId: candidate.sourceNodeId,
    queueOrdinal: candidate.queueOrdinal,
    sourceCode: candidate.sourceCode,
    sourceTitle: candidate.sourceTitle,
    domainFamily: candidate.domainFamily,
    canonicalState: 'PAGE_EVIDENCED_CANONICAL_OPERATION_MODELS_COMPLETE_PATTERNSPEC_PENDING',
    sourceCandidate: {
      path: candidatePath,
      sha256: sha256(fs.readFileSync(path.join(root, candidatePath))),
      taskId: candidate.taskId,
      candidateState: candidate.candidateState
    },
    sourceEvidence: candidate.sourceEvidence,
    knowledgePoints,
    counts: {
      knowledgePointCount: knowledgePoints.length,
      canonicalOperationModelCount: knowledgePoints.reduce((sum, kp) => sum + kp.operationModels.length, 0)
    },
    productionBoundary: {
      patternSpecsAuthored: false,
      storyTemplatesAuthored: false,
      runtimeConsumerEnabled: false,
      worksheetOutputAllowed: false,
      publicSelectionEnabled: false,
      productionAdmissionAllowed: false
    },
    nextRequiredGate: 'PATTERNSPEC_CONTRACT_AND_HIDDEN_MATERIALIZATION'
  };
}

export function runMaterialization({ root = ROOT, write = true } = {}) {
  const baseline = JSON.parse(fs.readFileSync(path.join(root, BASELINE_PATH), 'utf8'));
  const outputs = baseline.records.map((row) => {
    const candidatePath = row.knowledgeOperationExpectedPath;
    const candidate = JSON.parse(fs.readFileSync(path.join(root, candidatePath), 'utf8'));
    const registry = materializeRegistry(root, candidatePath, candidate);
    const outputPath = `${OUTPUT_DIR}/${row.sourceNodeId}.canonical-operation.json`;
    if (write) {
      fs.mkdirSync(path.join(root, OUTPUT_DIR), { recursive: true });
      fs.writeFileSync(path.join(root, outputPath), `${JSON.stringify(registry, null, 2)}\n`);
    }
    return { outputPath, registry };
  });
  return {
    sourceNodeCount: outputs.length,
    knowledgePointCount: outputs.reduce((sum, row) => sum + row.registry.counts.knowledgePointCount, 0),
    canonicalOperationModelCount: outputs.reduce((sum, row) => sum + row.registry.counts.canonicalOperationModelCount, 0),
    outputs
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = runMaterialization();
  process.stdout.write(`${JSON.stringify({
    sourceNodeCount: result.sourceNodeCount,
    knowledgePointCount: result.knowledgePointCount,
    canonicalOperationModelCount: result.canonicalOperationModelCount,
    outputPaths: result.outputs.map((row) => row.outputPath)
  }, null, 2)}\n`);
}
