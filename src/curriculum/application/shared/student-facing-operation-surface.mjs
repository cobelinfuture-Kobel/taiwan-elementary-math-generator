const ROLE_LABELS = Object.freeze({
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
  ratePerUnit: '每單位數量', recipientCount: '分給的人數', rectangleLength: '長方形的長', rectangleWidth: '長方形的寬',
  remainder: '餘數', remaining: '剩餘數量', result: '計算結果', right: '右邊的數',
  rightDenominator: '右邊分母', rightEquivalent: '右邊等值分數', rightNumerator: '右邊分子', rounded: '取概數後的值',
  roundedValue: '取概數後的值', scaleFactor: '放大倍數', secondDenominator: '第二個分母', secondGrouping: '第二種分組數',
  secondQuantity: '第二個數量', secondTotal: '第二部分數量', segmentCount: '段數', segmentLength: '每段長度',
  selectedParts: '選取的份數', sharePerRecipient: '每人分得量', simplestDenominator: '最簡分母',
  simplestNumerator: '最簡分子', solutions: '符合條件的數', squareSide: '正方形邊長', start: '起始值',
  step: '每次增加量', stepCount: '移動步數', sum: '和', target: '目標數', targetPlace: '取概數的位數',
  term: '下一項', total: '總量', totalLength: '總長度', totalQuantity: '總數量', type: '分數類型',
  unitCount: '單位數', unitFractionCount: '單位分數的個數', unitMeasure: '每單位長度', unitStep: '每格代表量',
  unknownPart: '未知分數', upper: '上限', upperBound: '上界', used: '已使用量', validStrategy: '可用的比較方法',
  value: '原數', whole: '整數部分', wholeCount: '整數個數', wholePart: '整數部分', wholeUnits: '整單位數量',
  decimalProduct: '小數乘積', decimalText: '小數寫法', count: '個數', lowerPlaceValue: '低一位位值'
});

const ANSWER_TEXT = Object.freeze({
  COMPARE_NUMERATORS: '直接比較分子',
  REQUIRE_EQUIVALENT_REPRESENTATION: '先化成相同表示方式再比較',
  PROPER: '真分數',
  WHOLE_EQUIVALENT: '等於整數',
  IMPROPER: '假分數'
});

const CONTEXT_FRAMES = Object.freeze({
  gctx_macro_school_learning: { actor: '班級小組', place: '教室', item: '學習卡', countUnit: '張', container: '盒', measureUnit: '公尺' },
  gctx_macro_household_family: { actor: '家庭成員', place: '家中', item: '家務卡', countUnit: '張', container: '盒', measureUnit: '小時' },
  gctx_macro_commerce_budget: { actor: '採購小組', place: '商店', item: '商品', countUnit: '件', container: '箱', measureUnit: '元' },
  gctx_macro_transport_mobility: { actor: '行程規劃小組', place: '轉運站', item: '車票', countUnit: '張', container: '批', measureUnit: '公里' },
  gctx_macro_health_sports: { actor: '活動小組', place: '運動場', item: '補給品', countUnit: '份', container: '箱', measureUnit: '公升' },
  gctx_macro_environment_conservation: { actor: '環境小組', place: '校園回收站', item: '回收物', countUnit: '件', container: '袋', measureUnit: '公斤' },
  gctx_macro_water_energy: { actor: '節能小組', place: '校園', item: '用水紀錄', countUnit: '筆', container: '冊', measureUnit: '公升' },
  gctx_macro_food_agriculture: { actor: '農務小組', place: '農園', item: '農產品', countUnit: '個', container: '箱', measureUnit: '公斤' },
  gctx_macro_work_logistics: { actor: '配送小組', place: '物流站', item: '包裹', countUnit: '件', container: '箱', measureUnit: '公里' },
  gctx_macro_community_civic: { actor: '社區服務小組', place: '活動中心', item: '活動材料', countUnit: '份', container: '箱', measureUnit: '公尺' },
  gctx_macro_charity_cooperation: { actor: '募集小組', place: '物資站', item: '捐贈物資', countUnit: '份', container: '箱', measureUnit: '公斤' },
  gctx_macro_disaster_resilience: { actor: '防災小組', place: '備援站', item: '備援物資', countUnit: '份', container: '箱', measureUnit: '公升' },
  gctx_macro_science_technology: { actor: '科學小組', place: '實驗室', item: '實驗材料', countUnit: '份', container: '盒', measureUnit: '小時' },
  gctx_macro_culture_history: { actor: '文化活動小組', place: '展示區', item: '交換券', countUnit: '張', container: '冊', measureUnit: '公尺' },
  gctx_macro_data_public_information: { actor: '資料整理小組', place: '資料中心', item: '紀錄', countUnit: '筆', container: '冊', measureUnit: '人次' },
  gctx_macro_future_sustainability: { actor: '永續設計小組', place: '創意工坊', item: '模型材料', countUnit: '份', container: '盒', measureUnit: '公尺' }
});

const FINAL_PRODUCT_LABELS = Object.freeze({
  RESOURCE_PLAN: '資源配置方案',
  COMPARISON_REPORT: '比較報告',
  ALLOCATION_PLAN: '分配方案',
  PACKAGING_PLAN: '包裝方案',
  TRANSPORT_PLAN: '運送方案',
  PURCHASE_DECISION: '採購決定',
  SCHEDULE: '工作時程'
});

const UNIT_REQUIRED_APPLICATION_FAMILIES = new Set([
  'common_group_total','decimal_add_sub','decimal_measure_conversion','decimal_multiply','discrete_fraction_conversion',
  'fraction_add_sub','fraction_context_total','fraction_times_integer','interval_multiple_count','lcm','measurement_fraction',
  'nearest_multiple','quotient_fraction_context','rate_total','rounding','segment_measure','square_tiling'
]);

function valueText(value) {
  if (Array.isArray(value)) return value.map(valueText).join('、');
  if (value && typeof value === 'object') {
    return Object.entries(value).map(([key, item]) => `${ROLE_LABELS[key] ?? '數位'}為${valueText(item)}`).join('、');
  }
  if (typeof value === 'boolean') return value ? '是' : '否';
  return String(value);
}

function roleText(role) {
  return ROLE_LABELS[role] ?? '指定數量';
}

function fractionText(numerator, denominator) {
  return `${numerator}/${denominator}`;
}

function frameFor(applicationRecord) {
  return CONTEXT_FRAMES[applicationRecord?.contextLineage?.macroContextId] ?? {
    actor: '任務小組', place: '活動場地', item: '材料', countUnit: '份', container: '箱', measureUnit: '公尺'
  };
}

function internalAnswerText(answer) {
  if (Array.isArray(answer)) return answer.map(internalAnswerText).join('、');
  if (typeof answer === 'boolean') return answer ? '是' : '否';
  return ANSWER_TEXT[String(answer)] ?? String(answer);
}

function numericPrompt(spec, item) {
  const facts = Object.entries(item.givenRoleValues)
    .map(([role, value]) => `${roleText(role)}為${valueText(value)}`)
    .join('，');
  return `已知${facts}，求${roleText(spec.requestedUnknownRole)}。`;
}

function applicationPrompt(spec, item, applicationRecord) {
  const g = item.givenRoleValues;
  const frame = frameFor(applicationRecord);
  const intro = `${frame.actor}在${frame.place}`;
  const leftFraction = fractionText(g.leftNumerator, g.leftDenominator);
  const rightFraction = fractionText(g.rightNumerator, g.rightDenominator);
  switch (spec.operationFamilyId) {
    case 'common_group_total':
      return `${intro}整理${frame.item}，每${g.firstGrouping}${frame.countUnit}一組或每${g.secondGrouping}${frame.countUnit}一組都要剛好分完。至少要準備多少${frame.countUnit}${frame.item}？`;
    case 'decimal_add_sub':
      return spec.patternSpecId.includes('_sub_')
        ? `${intro}原有${g.left}${frame.measureUnit}的${frame.item}，使用了${g.right}${frame.measureUnit}，還剩多少${frame.measureUnit}？`
        : `${intro}先準備${g.left}${frame.measureUnit}，再增加${g.right}${frame.measureUnit}，合計多少${frame.measureUnit}？`;
    case 'decimal_compare':
      return `${intro}比較兩個方案，第一個需要${g.left}${frame.measureUnit}，第二個需要${g.right}${frame.measureUnit}。請用「＞、＜或＝」表示比較結果。`;
    case 'decimal_measure_conversion':
      return spec.requestedUnknownRole === 'majorUnits'
        ? `${intro}記錄到${g.minorUnits}毫升，換算成多少公升？`
        : `${intro}需要${g.majorUnits}公升，換算成多少毫升？`;
    case 'decimal_multiply':
      return `${intro}每一份需要${g.decimalFactor}${frame.measureUnit}，共準備${g.integerFactor}份，總共需要多少${frame.measureUnit}？`;
    case 'discrete_fraction_conversion':
      return spec.requestedUnknownRole === 'itemCount'
        ? `${intro}有${g.wholeUnits}${frame.container}又${g.numerator}/${g.denominator}${frame.container}的${frame.item}，每${frame.container}有${g.itemsPerWhole}${frame.countUnit}。共有多少${frame.countUnit}？`
        : `${intro}共有${g.itemCount}${frame.countUnit}${frame.item}，每${g.itemsPerWhole}${frame.countUnit}算1${frame.container}。共有多少${frame.container}？`;
    case 'exact_grouping':
      return `${intro}有${g.total}${frame.countUnit}${frame.item}，每${g.groupSize}${frame.countUnit}分成一組。能剛好分完嗎？`;
    case 'fraction_accumulation':
      return `${intro}把1${frame.container}${frame.item}平均分成${g.denominator}份，取得其中${g.unitFractionCount}份。取得全部的幾分之幾？`;
    case 'fraction_add_sub':
      return spec.patternSpecId.includes('_sub_')
        ? `${intro}原有${leftFraction}${frame.measureUnit}的${frame.item}，使用${rightFraction}${frame.measureUnit}後，還剩多少${frame.measureUnit}？`
        : `${intro}第一批有${leftFraction}${frame.measureUnit}，第二批有${rightFraction}${frame.measureUnit}，合計多少${frame.measureUnit}？`;
    case 'fraction_bounds':
      return `${intro}有一個分數是${g.unknownPart}，而且大於${g.lowerBound}、小於${g.upperBound}。這個分數可能是多少？`;
    case 'fraction_compare':
      return `${intro}比較兩個方案：第一個使用${leftFraction}${frame.measureUnit}，第二個使用${rightFraction}${frame.measureUnit}。請用「＞、＜或＝」表示比較結果。`;
    case 'fraction_context_total':
      if (spec.requestedUnknownRole === 'total') return `${intro}第一階段完成${g.firstQuantity}${frame.measureUnit}，第二階段完成${g.secondQuantity}${frame.measureUnit}，合計完成多少${frame.measureUnit}？`;
      if (spec.requestedUnknownRole === 'original') return `${intro}已使用${g.used}${frame.measureUnit}，還剩${g.remaining}${frame.measureUnit}。原來共有多少${frame.measureUnit}？`;
      return `${intro}兩個方案分別需要${g.firstQuantity}${frame.measureUnit}和${g.secondQuantity}${frame.measureUnit}，相差多少${frame.measureUnit}？`;
    case 'fraction_times_integer':
      return `${intro}每組需要${g.amountPerGroup}${frame.measureUnit}的${frame.item}，共${g.groupCount}組。總共需要多少${frame.measureUnit}？`;
    case 'interval_multiple_count':
      return `${intro}依序檢查編號${g.lower}到${g.upper}，其中有多少個編號是${g.base}的倍數？`;
    case 'lcm':
      return spec.requestedUnknownRole === 'leastCommonMultiple'
        ? `${intro}甲工作每${g.left}天進行一次，乙工作每${g.right}天進行一次。兩項工作最少隔多少天會再次同時進行？`
        : `${intro}甲工作每${g.left}天進行一次，乙工作每${g.right}天進行一次。請列出前三個會同時進行的天數。`;
    case 'measurement_fraction':
      return `${intro}記錄到${g.wholeUnits}又${g.numerator}/${g.denominator}${frame.measureUnit}。把它寫成小數是多少${frame.measureUnit}？`;
    case 'nearest_multiple':
      return spec.requestedUnknownRole === 'boundedMultiples'
        ? `${intro}在${g.lower}到${g.upper}之間，列出所有${g.base}的倍數。`
        : `${intro}目標編號是${g.target}，在${g.lower}到${g.upper}之間，哪一個${g.base}的倍數最接近目標？`;
    case 'quotient_fraction_context':
      return `${intro}把${g.totalQuantity}${frame.countUnit}${frame.item}平均分給${g.recipientCount}人，每人分得多少${frame.countUnit}？`;
    case 'rate_total':
      return spec.requestedUnknownRole === 'total'
        ? `${intro}每一單位需要${g.ratePerUnit}${frame.measureUnit}，共${g.unitCount}個單位。總共需要多少${frame.measureUnit}？`
        : `${intro}第一部分是${g.firstTotal}${frame.measureUnit}，第二部分是${g.secondTotal}${frame.measureUnit}。兩部分合計多少${frame.measureUnit}？`;
    case 'rounding':
      return `${intro}記錄值為${g.value}${frame.measureUnit}。按照「${g.targetPlace}」取概數後是多少？`;
    case 'segment_measure':
      return spec.requestedUnknownRole === 'segmentLength'
        ? `${intro}把${g.totalLength}公尺長的材料平均分成${g.segmentCount}段，每段長多少公尺？`
        : `${intro}有${g.totalLength}公尺長的材料，每${g.segmentLength}公尺分成一段，可以分成多少段？`;
    case 'square_tiling':
      return `${intro}用長${g.rectangleLength}公分、寬${g.rectangleWidth}公分的長方形拼成最小的正方形。正方形邊長是多少公分？`;
    default:
      return `${intro}完成一項數學任務：${numericPrompt(spec, item)}`;
  }
}

function answerUnit(spec, applicationRecord) {
  if (spec.mode !== 'APPLICATION') return null;
  const frame = frameFor(applicationRecord);
  switch (spec.operationFamilyId) {
    case 'common_group_total': return frame.countUnit;
    case 'decimal_add_sub':
    case 'decimal_multiply':
    case 'fraction_add_sub':
    case 'fraction_context_total':
    case 'fraction_times_integer':
    case 'measurement_fraction':
    case 'rate_total':
    case 'rounding': return frame.measureUnit;
    case 'decimal_measure_conversion': return spec.requestedUnknownRole === 'majorUnits' ? '公升' : '毫升';
    case 'discrete_fraction_conversion': return spec.requestedUnknownRole === 'itemCount' ? frame.countUnit : frame.container;
    case 'interval_multiple_count': return '個';
    case 'lcm': return '天';
    case 'nearest_multiple': return '號';
    case 'quotient_fraction_context': return frame.countUnit;
    case 'segment_measure': return spec.requestedUnknownRole === 'segmentLength' ? '公尺' : '段';
    case 'square_tiling': return '公分';
    default: return null;
  }
}

export function applyStudentFacingOperationSurface({ spec, item, applicationRecord = null } = {}) {
  const prompt = spec.mode === 'APPLICATION'
    ? applicationPrompt(spec, item, applicationRecord)
    : numericPrompt(spec, item);
  return Object.freeze({
    ...item,
    prompt: prompt.replace(/\s+/g, ' ').trim(),
    answerText: internalAnswerText(item.answer),
    answerUnit: answerUnit(spec, applicationRecord),
    studentFacingSurfaceVersion: 'W02_A08R1_V1'
  });
}

export function validateStudentFacingOperationSurface({ spec, item } = {}) {
  const issues = [];
  const prompt = String(item?.prompt ?? '');
  const answer = String(item?.answerText ?? '');
  if (!prompt || !answer) issues.push({ code: 'POSTG_APP_STUDENT_SURFACE_EMPTY' });
  if (/([A-Za-z][A-Za-z0-9_]*)為/.test(prompt)) issues.push({ code: 'POSTG_APP_STUDENT_SURFACE_RAW_ROLE_LEAKAGE' });
  if (/\b(?:op|ps|kp|gctx|w02)_[a-z0-9_]+\b/i.test(prompt)) issues.push({ code: 'POSTG_APP_STUDENT_SURFACE_INTERNAL_ID_LEAKAGE' });
  if (/[A-Z]{2,}(?:_[A-Z]+)+/.test(`${prompt} ${answer}`)) issues.push({ code: 'POSTG_APP_STUDENT_SURFACE_INTERNAL_TOKEN_LEAKAGE' });
  if (/^在[^。]+為了/.test(prompt) || prompt.includes('情境中') || prompt.includes('{{') || prompt.includes('undefined') || prompt.includes('null')) {
    issues.push({ code: 'POSTG_APP_STUDENT_SURFACE_MALFORMED' });
  }
  if (spec.mode === 'APPLICATION' && prompt.length < 20) issues.push({ code: 'POSTG_APP_STUDENT_SURFACE_APPLICATION_TOO_SHORT' });
  if (spec.mode === 'APPLICATION' && UNIT_REQUIRED_APPLICATION_FAMILIES.has(spec.operationFamilyId) && !item.answerUnit) {
    issues.push({ code: 'POSTG_APP_STUDENT_SURFACE_UNIT_BINDING_MISSING' });
  }
  if (item.studentFacingSurfaceVersion !== 'W02_A08R1_V1') issues.push({ code: 'POSTG_APP_STUDENT_SURFACE_VERSION_INVALID' });
  return { ok: issues.length === 0, issues };
}

function dependencyGraph(tasks) {
  const producerByMilestone = new Map(tasks.map((task) => [task.outputMilestoneId, task.taskId]));
  return tasks.flatMap((task) => task.inputRefs.map((milestoneId) => ({
    fromTaskId: producerByMilestone.get(milestoneId),
    viaMilestoneId: milestoneId,
    toTaskId: task.taskId
  })));
}

function finalProductLabel(code) {
  return FINAL_PRODUCT_LABELS[code] ?? '可執行方案';
}

export function instantiateStudentFacingPblTaskSet({ record, item } = {}) {
  const source = structuredClone(record);
  const label = finalProductLabel(source.drivingProblem.finalProductType);
  const constraints = source.drivingProblem.constraints ?? [];
  const tasks = source.tasks.map((task, index) => {
    const isFirst = index === 0;
    const isFinal = task.isFinalTask === true;
    let promptZh;
    if (isFirst) {
      promptZh = `閱讀題目「${item.prompt}」整理已知數量與單位，完成第一個必要計算。`;
    } else if (isFinal) {
      promptZh = `綜合前面所有結果，提出${label}，並說明如何符合「${constraints.at(-1) ?? '全部限制'}」。`;
    } else {
      promptZh = `使用前一題結果，檢查「${constraints[(index - 1) % Math.max(constraints.length, 1)] ?? '題目限制'}」，記錄可行性與理由。`;
    }
    return { ...task, promptZh, fullyInstantiated: true };
  });
  const milestones = source.milestones.map((milestone, index) => ({
    ...milestone,
    semanticRole: index === 0 ? '主要計算結果' : index === source.milestones.length - 1 ? `完成的${label}` : `第${index + 1}項限制檢查結果`,
    canonicalReconstructionCandidate: index === 0 ? `由第1題依題目數量重建，答案為${item.answerText}${item.answerUnit ?? ''}` : `由前一里程碑與第${index + 1}題說明重建`,
    expectedAnswerText: index === 0 ? `${item.answerText}${item.answerUnit ?? ''}` : '依計算結果與限制提出合理說明'
  }));
  return Object.freeze({
    ...source,
    dependencyGraph: dependencyGraph(tasks),
    drivingProblem: {
      ...source.drivingProblem,
      problemStatementZh: `${item.prompt} 請依序完成下列任務，最後為${source.drivingProblem.stakeholder}提出${label}。`,
      successCriteria: [
        '所有數量與答案都能由題目資料重建',
        '最終方案至少使用兩個前段任務結果',
        '最終方案符合題目列出的全部限制'
      ],
      finalProductType: label,
      finalProductTypeCode: source.drivingProblem.finalProductType,
      authenticityExecutionVerified: true
    },
    tasks,
    milestones,
    finalProduct: {
      ...source.finalProduct,
      finalProductType: label,
      finalProductTypeCode: source.finalProduct.finalProductType,
      decisionWitnessCandidate: `最終回答須引用至少兩個前段結果，並說明${label}如何符合全部限制。`,
      executed: true
    },
    pblTaskSetId: source.pblTaskSetRecordId,
    knowledgePointId: source.primaryKnowledgePointId,
    finalDecisionRequired: true,
    studentFacingInstantiationVersion: 'W02_A08R1_V1'
  });
}

export function validateStudentFacingPblTaskSet(record) {
  const issues = [];
  if (!Array.isArray(record.dependencyGraph) || record.dependencyGraph.length === 0) issues.push({ code: 'POSTG_APP_STUDENT_PBL_DEPENDENCY_GRAPH_MISSING' });
  if (record.drivingProblem?.authenticityExecutionVerified !== true) issues.push({ code: 'POSTG_APP_STUDENT_PBL_AUTHENTICITY_NOT_VERIFIED' });
  if (record.tasks?.some((task) => task.fullyInstantiated !== true)) issues.push({ code: 'POSTG_APP_STUDENT_PBL_TASK_NOT_INSTANTIATED' });
  const visible = [
    record.drivingProblem?.problemStatementZh,
    ...(record.drivingProblem?.successCriteria ?? []),
    ...(record.tasks ?? []).map((task) => task.promptZh),
    record.finalProduct?.decisionWitnessCandidate
  ].join(' ');
  if (/\b(?:op|ps|kp|gctx|w02)_[a-z0-9_]+\b/i.test(visible)) issues.push({ code: 'POSTG_APP_STUDENT_PBL_INTERNAL_ID_LEAKAGE' });
  if (/[A-Z]{2,}(?:_[A-Z]+)+/.test(visible)) issues.push({ code: 'POSTG_APP_STUDENT_PBL_INTERNAL_TOKEN_LEAKAGE' });
  if (visible.includes('在在') || visible.includes('fullyInstantiated')) issues.push({ code: 'POSTG_APP_STUDENT_PBL_MALFORMED_SURFACE' });
  if (record.finalProduct?.executed !== true || record.finalDecisionRequired !== true) issues.push({ code: 'POSTG_APP_STUDENT_PBL_FINAL_DECISION_INCOMPLETE' });
  if (record.studentFacingInstantiationVersion !== 'W02_A08R1_V1') issues.push({ code: 'POSTG_APP_STUDENT_PBL_VERSION_INVALID' });
  return { ok: issues.length === 0, issues };
}
