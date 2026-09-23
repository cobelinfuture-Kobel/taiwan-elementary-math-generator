const PLACE_LABELS = Object.freeze({
  ones: '個位', tens: '十位', hundreds: '百位', thousands: '千位',
  tenths: '小數第一位', hundredths: '小數第二位', thousandths: '小數第三位'
});

const CONTEXT_FRAMES = Object.freeze({
  gctx_macro_school_learning: { actor: '班級小組', place: '教室', measureName: '彩帶', measureUnit: '公尺', countName: '學習卡', countUnit: '張', container: '盒' },
  gctx_macro_household_family: { actor: '家庭成員', place: '家中', measureName: '家務時間', measureUnit: '小時', countName: '家務卡', countUnit: '張', container: '盒' },
  gctx_macro_commerce_budget: { actor: '採購小組', place: '商店', measureName: '包裝繩', measureUnit: '公尺', countName: '商品', countUnit: '件', container: '箱' },
  gctx_macro_transport_mobility: { actor: '行程規劃小組', place: '轉運站', measureName: '行程距離', measureUnit: '公里', countName: '車票', countUnit: '張', container: '冊' },
  gctx_macro_health_sports: { actor: '活動小組', place: '運動場', measureName: '飲用水', measureUnit: '公升', countName: '補給品', countUnit: '份', container: '箱' },
  gctx_macro_environment_conservation: { actor: '環境小組', place: '校園回收站', measureName: '回收物重量', measureUnit: '公斤', countName: '回收物', countUnit: '件', container: '袋' },
  gctx_macro_water_energy: { actor: '節能小組', place: '校園', measureName: '用水量', measureUnit: '公升', countName: '用水紀錄', countUnit: '筆', container: '冊' },
  gctx_macro_food_agriculture: { actor: '農務小組', place: '農園', measureName: '農產品重量', measureUnit: '公斤', countName: '農產品', countUnit: '個', container: '箱' },
  gctx_macro_work_logistics: { actor: '配送小組', place: '物流站', measureName: '配送路程', measureUnit: '公里', countName: '包裹', countUnit: '件', container: '箱' },
  gctx_macro_community_civic: { actor: '社區服務小組', place: '活動中心', measureName: '布置帶', measureUnit: '公尺', countName: '活動材料', countUnit: '份', container: '箱' },
  gctx_macro_charity_cooperation: { actor: '募集小組', place: '物資站', measureName: '物資重量', measureUnit: '公斤', countName: '捐贈物資', countUnit: '份', container: '箱' },
  gctx_macro_disaster_resilience: { actor: '防災小組', place: '備援站', measureName: '飲用水', measureUnit: '公升', countName: '備援物資', countUnit: '份', container: '箱' },
  gctx_macro_science_technology: { actor: '科學小組', place: '實驗室', measureName: '實驗時間', measureUnit: '小時', countName: '實驗材料', countUnit: '份', container: '盒' },
  gctx_macro_culture_history: { actor: '文化活動小組', place: '展示區', measureName: '展示帶', measureUnit: '公尺', countName: '交換券', countUnit: '張', container: '冊' },
  gctx_macro_data_public_information: { actor: '資料整理小組', place: '資料中心', measureName: '整理時間', measureUnit: '小時', countName: '紀錄', countUnit: '筆', container: '冊' },
  gctx_macro_future_sustainability: { actor: '永續設計小組', place: '創意工坊', measureName: '模型材料長度', measureUnit: '公尺', countName: '模型材料', countUnit: '份', container: '盒' }
});

const ANSWER_LABELS = Object.freeze({
  COMPARE_NUMERATORS: '直接比較分子',
  REQUIRE_EQUIVALENT_REPRESENTATION: '先化成相同表示方式再比較',
  PROPER: '真分數', WHOLE_EQUIVALENT: '等於整數', IMPROPER: '假分數',
  '<': '＜', '>': '＞', '=': '＝'
});

const FINAL_PRODUCT_BY_FAMILY = Object.freeze({
  decimal_compare: '比較報告', fraction_compare: '比較報告', fraction_bounds: '可行範圍說明',
  exact_grouping: '分組方案', common_group_total: '分組方案', discrete_fraction_conversion: '包裝換算方案',
  quotient_fraction_context: '平均分配方案', lcm: '工作時程', interval_multiple_count: '活動日清單',
  nearest_multiple: '活動日建議', square_tiling: '拼排方案', segment_measure: '裁切方案',
  rounding: '估算建議', decimal_measure_conversion: '容量換算方案'
});

const UNIT_REQUIRED_FAMILIES = new Set([
  'common_group_total','decimal_add_sub','decimal_measure_conversion','decimal_multiply','discrete_fraction_conversion',
  'fraction_add_sub','fraction_context_total','fraction_times_integer','interval_multiple_count','lcm','measurement_fraction',
  'nearest_multiple','quotient_fraction_context','rate_total','rounding','segment_measure','square_tiling'
]);

const FORBIDDEN_PBL_PHRASES = Object.freeze([
  '使用虛構練習數據','不宣稱未提供的史實細節','新聞不可作為唯一權威','有效期間到期須重新審核',
  '不涉及個資或監控','設備性能不得虛構宣稱','不使用災害恐懼敘事','安全敘事不呈現傷亡細節'
]);

function frameFor(applicationRecord) {
  return CONTEXT_FRAMES[applicationRecord?.contextLineage?.macroContextId]
    ?? { actor: '任務小組', place: '活動場地', measureName: '材料長度', measureUnit: '公尺', countName: '材料', countUnit: '份', container: '盒' };
}

function normalizeFractionText(value) {
  const text = String(value);
  const match = /^(-?\d+)\/1$/.exec(text);
  return match ? match[1] : text;
}

function answerText(value) {
  if (Array.isArray(value)) return value.map(answerText).join('、');
  if (typeof value === 'boolean') return value ? '是' : '否';
  return ANSWER_LABELS[String(value)] ?? normalizeFractionText(value);
}

function numericRoleLabel(role) {
  const labels = {
    addendsOrMinuend: '直式中的已知數字', allowedDigits: '可用數字', amountPerGroup: '每組數量', base: '基準數',
    boundedMultiples: '範圍內的倍數', candidate: '候選數', combined: '合計量', commonDenominator: '公分母',
    commonFactor: '公因數', commonMultiples: '公倍數', constraints: '限制條件', conversionFactor: '換算倍數',
    coordinate: '座標', decimal: '小數值', decimalFactor: '小數因數', decimalPlaceCount: '小數位數',
    denominator: '分母', denominatorsEqual: '分母是否相同', difference: '相差量', digitsByPlace: '各位數字',
    distance: '距離', dividend: '被除數', divisor: '除數', divisible: '是否整除', equalParts: '平均分成的份數',
    equivalent: '是否等值', equivalentDenominator: '等值分母', equivalentNumerator: '等值分子', estimate: '估算結果',
    factor: '倍數因子', feasible: '是否能剛好分組', firstDenominator: '第一個分母', firstGrouping: '第一種分組數',
    firstQuantity: '第一個數量', firstTotal: '第一部分數量', fraction: '分數', fractionalUnits: '換算後的單位數',
    groupCount: '組數', groupSize: '每組數量', higherPlaceValue: '高一位位值', improperNumerator: '假分數分子',
    integerFactor: '整數因數', integerProduct: '未標小數點的乘積', isFactor: '是否為因數', isMultiple: '是否為倍數',
    itemCount: '物品總數', itemsPerWhole: '每整單位的物品數', known: '已知分數', leastCommonMultiple: '最小公倍數',
    left: '左邊的數', leftDenominator: '左邊分母', leftEquivalent: '左邊等值分數', leftNumerator: '左邊分子',
    lower: '下限', lowerBound: '下界', lowerPlaceValue: '低一位位值', majorUnits: '大單位數量',
    measure: '測量值', minimumTotal: '最少總數', minorUnits: '小單位數量', missing: '缺少的分數',
    missingDigit: '缺少的數字', missingDigits: '缺少的數字', multiples: '倍數集合', nearest: '最接近的倍數',
    numerator: '分子', numerators: '分子', origin: '起點', original: '原有數量', placeUnit: '位值單位',
    possibleDigits: '可能的數字', possibleValues: '可能值', product: '乘積', quotient: '商', range: '可能範圍',
    ratePerUnit: '每組數量', recipientCount: '分配組數', rectangleLength: '長方形的長', rectangleWidth: '長方形的寬',
    remainder: '餘數', remaining: '剩餘數量', result: '計算結果', right: '右邊的數',
    rightDenominator: '右邊分母', rightEquivalent: '右邊等值分數', rightNumerator: '右邊分子', rounded: '取概數後的值',
    roundedValue: '取概數後的值', scaleFactor: '放大倍數', secondDenominator: '第二個分母', secondGrouping: '第二種分組數',
    secondQuantity: '第二個數量', secondTotal: '第二部分數量', segmentCount: '段數', segmentLength: '每段長度',
    selectedParts: '選取的份數', sharePerRecipient: '每組分得量', simplestDenominator: '最簡分母',
    simplestNumerator: '最簡分子', solutions: '符合條件的數', squareSide: '正方形邊長', start: '起始值',
    step: '每次增加量', stepCount: '移動步數', sum: '和', target: '目標數', targetPlace: '取概數的位數',
    term: '下一項', total: '總量', totalLength: '總長度', totalQuantity: '總數量', type: '分數類型',
    unitCount: '組數', unitFractionCount: '單位分數的個數', unitMeasure: '每段長度', unitStep: '每格代表量',
    unknownPart: '未知分數', upper: '上限', upperBound: '上界', used: '已使用量', validStrategy: '可用的比較方法',
    value: '原數', whole: '整數部分', wholeCount: '整數個數', wholePart: '整數部分', wholeUnits: '整單位數量'
  };
  return labels[role] ?? '指定數量';
}

function valueText(value) {
  if (Array.isArray(value)) return value.map(valueText).join('、');
  if (value && typeof value === 'object') return Object.entries(value).map(([key, item]) => `${numericRoleLabel(key)}為${valueText(item)}`).join('、');
  if (typeof value === 'boolean') return value ? '是' : '否';
  return PLACE_LABELS[String(value)] ?? String(value);
}

function numericPrompt(spec, item) {
  const facts = Object.entries(item.givenRoleValues).map(([role, value]) => `${numericRoleLabel(role)}為${valueText(value)}`).join('，');
  return `已知${facts}，求${numericRoleLabel(spec.requestedUnknownRole)}。`;
}

function fractionText(n, d) { return `${n}/${d}`; }

function applicationPrompt(spec, item, applicationRecord) {
  const g = item.givenRoleValues;
  const f = frameFor(applicationRecord);
  const intro = `${f.actor}在${f.place}`;
  const leftFraction = fractionText(g.leftNumerator, g.leftDenominator);
  const rightFraction = fractionText(g.rightNumerator, g.rightDenominator);
  switch (spec.operationFamilyId) {
    case 'common_group_total':
      return `${intro}整理${f.countName}，每${g.firstGrouping}${f.countUnit}一組或每${g.secondGrouping}${f.countUnit}一組都要剛好分完。至少需要多少${f.countUnit}${f.countName}？`;
    case 'decimal_add_sub':
      return spec.patternSpecId.includes('_sub_')
        ? `${intro}原有${g.left}${f.measureUnit}${f.measureName}，使用${g.right}${f.measureUnit}後，還剩多少${f.measureUnit}？`
        : `${intro}第一批有${g.left}${f.measureUnit}${f.measureName}，第二批有${g.right}${f.measureUnit}，合計多少${f.measureUnit}？`;
    case 'decimal_compare':
      return `${intro}比較兩個方案：甲方案需要${g.left}${f.measureUnit}${f.measureName}，乙方案需要${g.right}${f.measureUnit}。請用「＞、＜或＝」表示比較結果。`;
    case 'decimal_measure_conversion':
      return spec.requestedUnknownRole === 'majorUnits'
        ? `${intro}量得${g.minorUnits}毫升的水，換算成多少公升？`
        : `${intro}需要${g.majorUnits}公升的水，換算成多少毫升？`;
    case 'decimal_multiply':
      return `${intro}每組需要${g.decimalFactor}${f.measureUnit}${f.measureName}，共${g.integerFactor}組，總共需要多少${f.measureUnit}？`;
    case 'discrete_fraction_conversion':
      return spec.requestedUnknownRole === 'itemCount'
        ? `${intro}有${g.wholeUnits}${f.container}又${g.numerator}/${g.denominator}${f.container}${f.countName}，每${f.container}有${g.itemsPerWhole}${f.countUnit}。共有多少${f.countUnit}？`
        : `${intro}共有${g.itemCount}${f.countUnit}${f.countName}，每${g.itemsPerWhole}${f.countUnit}相當於1${f.container}的容量。這些${f.countName}相當於多少${f.container}？`;
    case 'exact_grouping':
      return `${intro}有${g.total}${f.countUnit}${f.countName}，每${g.groupSize}${f.countUnit}分成一組。能剛好分完嗎？`;
    case 'fraction_accumulation':
      return `${intro}把一份完整的${f.measureName}平均分成${g.denominator}份，使用其中${g.unitFractionCount}份。使用了全部的幾分之幾？`;
    case 'fraction_add_sub':
      return spec.patternSpecId.includes('_sub_')
        ? `${intro}原有${leftFraction}${f.measureUnit}${f.measureName}，使用${rightFraction}${f.measureUnit}後，還剩多少${f.measureUnit}？`
        : `${intro}第一批有${leftFraction}${f.measureUnit}${f.measureName}，第二批有${rightFraction}${f.measureUnit}，合計多少${f.measureUnit}？`;
    case 'fraction_bounds':
      return `${intro}需要找一個分數${g.unknownPart}，它大於${g.lowerBound}且小於${g.upperBound}。這個分數可能是多少？`;
    case 'fraction_compare':
      return `${intro}比較兩個方案：甲方案需要${leftFraction}${f.measureUnit}${f.measureName}，乙方案需要${rightFraction}${f.measureUnit}。請用「＞、＜或＝」表示比較結果。`;
    case 'fraction_context_total':
      if (spec.requestedUnknownRole === 'total') return `${intro}第一階段使用${g.firstQuantity}${f.measureUnit}${f.measureName}，第二階段使用${g.secondQuantity}${f.measureUnit}，合計使用多少${f.measureUnit}？`;
      if (spec.requestedUnknownRole === 'original') return `${intro}已使用${g.used}${f.measureUnit}${f.measureName}，還剩${g.remaining}${f.measureUnit}。原來共有多少${f.measureUnit}？`;
      return `${intro}甲方案需要${g.firstQuantity}${f.measureUnit}${f.measureName}，乙方案需要${g.secondQuantity}${f.measureUnit}，兩者相差多少${f.measureUnit}？`;
    case 'fraction_times_integer':
      return `${intro}每組需要${g.amountPerGroup}${f.measureUnit}${f.measureName}，共${g.groupCount}組。總共需要多少${f.measureUnit}？`;
    case 'interval_multiple_count':
      return `${intro}安排每${g.base}天一次的活動。從第${g.lower}天到第${g.upper}天，共有幾個活動日？`;
    case 'lcm':
      return spec.requestedUnknownRole === 'leastCommonMultiple'
        ? `${intro}甲工作每${g.left}天進行一次，乙工作每${g.right}天進行一次。最少隔多少天會再次同時進行？`
        : `${intro}甲工作每${g.left}天進行一次，乙工作每${g.right}天進行一次。請列出前三個同時進行的日數。`;
    case 'measurement_fraction':
      return `${intro}記錄到${g.wholeUnits}又${g.numerator}/${g.denominator}${f.measureUnit}${f.measureName}。把這個數量寫成小數是多少${f.measureUnit}？`;
    case 'nearest_multiple':
      return spec.requestedUnknownRole === 'boundedMultiples'
        ? `${intro}安排每${g.base}天一次的活動。請列出第${g.lower}天到第${g.upper}天之間的所有活動日。`
        : `${intro}安排每${g.base}天一次的活動。第${g.target}天最接近哪一個活動日？`;
    case 'quotient_fraction_context':
      return `${intro}把${g.totalQuantity}${f.measureUnit}${f.measureName}平均分給${g.recipientCount}組，每組分得多少${f.measureUnit}？`;
    case 'rate_total':
      return spec.requestedUnknownRole === 'total'
        ? `${intro}每組需要${g.ratePerUnit}${f.measureUnit}${f.measureName}，共${g.unitCount}組。總共需要多少${f.measureUnit}？`
        : `${intro}第一部分使用${g.firstTotal}${f.measureUnit}${f.measureName}，第二部分使用${g.secondTotal}${f.measureUnit}。兩部分合計多少${f.measureUnit}？`;
    case 'rounding': {
      const place = PLACE_LABELS[g.targetPlace] ?? '指定數位';
      return spec.requestedUnknownRole === 'rounded'
        ? `${intro}量得${g.value}${f.measureUnit}${f.measureName}。四捨五入到${place}後是多少${f.measureUnit}？`
        : `${intro}量得${g.value}${f.measureUnit}${f.measureName}。先四捨五入到${place}，再用取概數後的值估算兩份總量，約是多少${f.measureUnit}？`;
    }
    case 'segment_measure':
      return spec.requestedUnknownRole === 'segmentLength'
        ? `${intro}把${g.totalLength}公尺長的材料平均分成${g.segmentCount}段，每段長多少公尺？`
        : `${intro}有${g.totalLength}公尺長的材料，每${g.segmentLength}公尺分成一段，可以分成多少段？`;
    case 'square_tiling':
      return `${intro}用長${g.rectangleLength}公分、寬${g.rectangleWidth}公分的長方形拼成最小的正方形。正方形邊長是多少公分？`;
    default:
      return `${intro}完成下列數學任務：${numericPrompt(spec, item)}`;
  }
}

function answerUnit(spec, applicationRecord) {
  if (spec.mode !== 'APPLICATION') return null;
  const f = frameFor(applicationRecord);
  switch (spec.operationFamilyId) {
    case 'common_group_total': return f.countUnit;
    case 'decimal_add_sub': case 'decimal_multiply': case 'fraction_add_sub': case 'fraction_context_total':
    case 'fraction_times_integer': case 'measurement_fraction': case 'quotient_fraction_context': case 'rate_total': case 'rounding': return f.measureUnit;
    case 'decimal_measure_conversion': return spec.requestedUnknownRole === 'majorUnits' ? '公升' : '毫升';
    case 'discrete_fraction_conversion': return spec.requestedUnknownRole === 'itemCount' ? f.countUnit : f.container;
    case 'interval_multiple_count': return '個';
    case 'lcm': return '天';
    case 'nearest_multiple': return '天';
    case 'segment_measure': return spec.requestedUnknownRole === 'segmentLength' ? '公尺' : '段';
    case 'square_tiling': return '公分';
    default: return null;
  }
}

export function applyStudentFacingSemanticRemediationV2({ spec, item, applicationRecord = null } = {}) {
  return Object.freeze({
    ...item,
    prompt: (spec.mode === 'APPLICATION' ? applicationPrompt(spec, item, applicationRecord) : numericPrompt(spec, item)).replace(/\s+/g, ' ').trim(),
    answerText: answerText(item.answer),
    answerUnit: answerUnit(spec, applicationRecord),
    studentFacingSurfaceVersion: 'W02_A08R1_V1',
    studentFacingSemanticRevision: 2
  });
}

function visibleSurface(item) { return `${item?.prompt ?? ''} ${item?.answerText ?? ''} ${item?.answerUnit ?? ''}`; }

export function validateStudentFacingSemanticRemediationV2({ spec, item } = {}) {
  const issues = [];
  const prompt = String(item?.prompt ?? '');
  const visible = visibleSurface(item);
  if (!prompt || !String(item?.answerText ?? '')) issues.push({ code: 'POSTG_APP_STUDENT_SURFACE_EMPTY' });
  if (/([A-Za-z][A-Za-z0-9_]*)為/.test(prompt)) issues.push({ code: 'POSTG_APP_STUDENT_SURFACE_RAW_ROLE_LEAKAGE' });
  if (/\b(?:op|ps|kp|gctx|w02)_[a-z0-9_]+\b/i.test(prompt)) issues.push({ code: 'POSTG_APP_STUDENT_SURFACE_INTERNAL_ID_LEAKAGE' });
  if (/\b(?:tenths|hundredths|thousandths|ones|tens|hundreds|thousands)\b/i.test(visible)) issues.push({ code: 'POSTG_APP_STUDENT_SURFACE_ENGLISH_PLACE_TOKEN' });
  if (/[A-Z]{2,}(?:_[A-Z]+)+/.test(visible)) issues.push({ code: 'POSTG_APP_STUDENT_SURFACE_INTERNAL_TOKEN_LEAKAGE' });
  if (/^在[^。]+為了/.test(prompt) || prompt.includes('情境中') || prompt.includes('{{') || prompt.includes('undefined') || prompt.includes('null')) issues.push({ code: 'POSTG_APP_STUDENT_SURFACE_MALFORMED' });
  if (/\d+\/\d+\s*(?:人次|元)/.test(visible)) issues.push({ code: 'POSTG_APP_STUDENT_SURFACE_FRACTIONAL_INCOMPATIBLE_UNIT' });
  if (/(?:公里的車票|公尺的交換券|小時的家務卡)/.test(visible)) issues.push({ code: 'POSTG_APP_STUDENT_SURFACE_NOUN_UNIT_MISMATCH' });
  if (/^-?\d+\/1$/.test(String(item?.answerText ?? ''))) issues.push({ code: 'POSTG_APP_STUDENT_SURFACE_UNSIMPLIFIED_WHOLE' });
  if (spec.mode === 'APPLICATION' && prompt.length < 20) issues.push({ code: 'POSTG_APP_STUDENT_SURFACE_APPLICATION_TOO_SHORT' });
  if (spec.mode === 'APPLICATION' && UNIT_REQUIRED_FAMILIES.has(spec.operationFamilyId) && !item.answerUnit) issues.push({ code: 'POSTG_APP_STUDENT_SURFACE_UNIT_BINDING_MISSING' });
  if (spec.operationFamilyId === 'rounding' && spec.requestedUnknownRole === 'estimate' && !prompt.includes('兩份總量')) issues.push({ code: 'POSTG_APP_STUDENT_SURFACE_ROUNDING_ESTIMATE_SEMANTICS_MISSING' });
  if (item.studentFacingSurfaceVersion !== 'W02_A08R1_V1' || item.studentFacingSemanticRevision !== 2) issues.push({ code: 'POSTG_APP_STUDENT_SURFACE_VERSION_INVALID' });
  return { ok: issues.length === 0, issues };
}

function finalProductLabel(record) {
  return FINAL_PRODUCT_BY_FAMILY[record.operationFamilyId] ?? '可執行方案';
}

function dependencyGraph(tasks) {
  const producerByMilestone = new Map(tasks.map((task) => [task.outputMilestoneId, task.taskId]));
  return tasks.flatMap((task) => task.inputRefs.map((milestoneId) => ({
    fromTaskId: producerByMilestone.get(milestoneId), viaMilestoneId: milestoneId, toTaskId: task.taskId
  })));
}

export function instantiateStudentFacingPblTaskSetV2({ record, item, applicationRecord = null } = {}) {
  const source = structuredClone(record);
  const f = frameFor(applicationRecord);
  const product = finalProductLabel(source);
  const isPbl5 = source.graphType === 'PBL5_BOUNDED_DECISION';
  const taskPrompts = isPbl5 ? [
    `閱讀題目「${item.prompt}」整理所有已知數量與單位，完成主要計算。`,
    `把第1題答案代回原題，檢查計算結果、單位與題目條件是否一致。`,
    `指出題目中最重要的限制，說明它會如何影響${product}。`,
    `使用前面結果擬定一個${product}草案，清楚列出數量、單位與執行步驟。`,
    `比較計算、檢查與草案結果，為${f.actor}完成最終${product}並說明理由。`
  ] : [
    `閱讀題目「${item.prompt}」整理所有已知數量與單位，完成主要計算。`,
    `把第1題答案代回原題，檢查計算結果與單位是否一致。`,
    `使用計算與檢查結果，為${f.actor}提出${product}，並寫出採用此方案的理由。`
  ];
  const tasks = source.tasks.map((task, index) => ({ ...task, promptZh: taskPrompts[index], fullyInstantiated: true }));
  const milestoneRoles = isPbl5
    ? ['主要計算結果','代回檢查結果','關鍵限制說明',`${product}草案`, `最終${product}`]
    : ['主要計算結果','代回檢查結果',`最終${product}`];
  const milestones = source.milestones.map((milestone, index) => ({
    ...milestone,
    semanticRole: milestoneRoles[index],
    canonicalReconstructionCandidate: index === 0
      ? `由第1題依題目資料重建，答案為${item.answerText}${item.answerUnit ?? ''}`
      : `由前一里程碑與第${index + 1}題的書面說明重建`,
    expectedAnswerText: index === 0 ? `${item.answerText}${item.answerUnit ?? ''}` : '須引用前段結果並使用正確單位'
  }));
  return Object.freeze({
    ...source,
    dependencyGraph: dependencyGraph(tasks),
    drivingProblem: {
      ...source.drivingProblem,
      stakeholder: f.actor,
      constraints: [
        '所有數量必須來自題目或前一步計算',
        '每個答案都要保留正確單位',
        ...(isPbl5 ? ['最終決定必須引用至少兩個前段結果'] : [])
      ],
      problemStatementZh: `${item.prompt} 請依序完成下列任務，最後為${f.actor}提出${product}。`,
      successCriteria: [
        '主要計算答案正確且單位一致',
        '檢查步驟能重建或驗證主要答案',
        `最終${product}明確引用前段計算與檢查結果`
      ],
      finalProductType: product,
      finalProductTypeCode: source.drivingProblem.finalProductType,
      authenticityExecutionVerified: true
    },
    tasks,
    milestones,
    finalProduct: {
      ...source.finalProduct,
      finalProductType: product,
      finalProductTypeCode: source.finalProduct.finalProductType,
      decisionWitnessCandidate: `最終回答須寫出${item.answerText}${item.answerUnit ?? ''}，引用至少兩個前段結果，並說明${product}如何符合題目條件。`,
      executed: true
    },
    pblTaskSetId: source.pblTaskSetRecordId,
    knowledgePointId: source.primaryKnowledgePointId,
    finalDecisionRequired: true,
    studentFacingInstantiationVersion: 'W02_A08R1_V1',
    studentFacingSemanticRevision: 2
  });
}

export function validateStudentFacingPblTaskSetV2(record) {
  const issues = [];
  if (!Array.isArray(record.dependencyGraph) || record.dependencyGraph.length === 0) issues.push({ code: 'POSTG_APP_STUDENT_PBL_DEPENDENCY_GRAPH_MISSING' });
  if (record.drivingProblem?.authenticityExecutionVerified !== true) issues.push({ code: 'POSTG_APP_STUDENT_PBL_AUTHENTICITY_NOT_VERIFIED' });
  if (record.tasks?.some((task) => task.fullyInstantiated !== true)) issues.push({ code: 'POSTG_APP_STUDENT_PBL_TASK_NOT_INSTANTIATED' });
  const visible = [record.drivingProblem?.problemStatementZh, ...(record.drivingProblem?.constraints ?? []), ...(record.drivingProblem?.successCriteria ?? []), ...(record.tasks ?? []).map((task) => task.promptZh), record.finalProduct?.decisionWitnessCandidate].join(' ');
  if (/\b(?:op|ps|kp|gctx|w02)_[a-z0-9_]+\b/i.test(visible)) issues.push({ code: 'POSTG_APP_STUDENT_PBL_INTERNAL_ID_LEAKAGE' });
  if (/[A-Z]{2,}(?:_[A-Z]+)+/.test(visible)) issues.push({ code: 'POSTG_APP_STUDENT_PBL_INTERNAL_TOKEN_LEAKAGE' });
  if (FORBIDDEN_PBL_PHRASES.some((phrase) => visible.includes(phrase))) issues.push({ code: 'POSTG_APP_STUDENT_PBL_GOVERNANCE_PHRASE_LEAKAGE' });
  if (visible.includes('在在') || visible.includes('{{') || visible.includes('fullyInstantiated')) issues.push({ code: 'POSTG_APP_STUDENT_PBL_MALFORMED_SURFACE' });
  if (record.finalProduct?.executed !== true || record.finalDecisionRequired !== true) issues.push({ code: 'POSTG_APP_STUDENT_PBL_FINAL_DECISION_INCOMPLETE' });
  if (record.studentFacingInstantiationVersion !== 'W02_A08R1_V1' || record.studentFacingSemanticRevision !== 2) issues.push({ code: 'POSTG_APP_STUDENT_PBL_VERSION_INVALID' });
  return { ok: issues.length === 0, issues };
}
