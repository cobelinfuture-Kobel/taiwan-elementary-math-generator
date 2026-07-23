import {
  applyStudentFacingSemanticRemediationV2,
  instantiateStudentFacingPblTaskSetV2,
  validateStudentFacingPblTaskSetV2,
  validateStudentFacingSemanticRemediationV2
} from './student-facing-semantic-remediation-v2.mjs';

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

const PRODUCT_LABELS = Object.freeze({
  fraction_accumulation: '分數使用紀錄',
  discrete_fraction_conversion: '包裝換算方案',
  measurement_fraction: '測量換算紀錄',
  fraction_context_total: '資源數量紀錄',
  decimal_measure_conversion: '單位換算紀錄',
  fraction_times_integer: '行程規劃',
  rate_total: '路程或資源總量紀錄',
  exact_grouping: '分組方案',
  common_group_total: '共同分組方案',
  square_tiling: '拼排方案',
  quotient_fraction_context: '平均分配方案',
  segment_measure: '裁切方案'
});

const FAMILY_KEYWORDS = Object.freeze({
  discrete_fraction_conversion: ['整', '剩餘'],
  measurement_fraction: ['分數', '小數'],
  fraction_context_total: ['通分', '反向運算'],
  decimal_measure_conversion: ['1000', '反向換算'],
  fraction_times_integer: ['重複加法', '總路程'],
  rate_total: ['乘法', '反向運算'],
  exact_grouping: ['餘數', '組數'],
  common_group_total: ['倍數', '組數'],
  square_tiling: ['正方形', '長方形'],
  quotient_fraction_context: ['平均分配', '乘回去'],
  segment_measure: ['切點', '切割次數']
});

const FORBIDDEN_PBL_TEXT = /指出題目中最重要的限制|使用前面結果擬定一個|比較計算、檢查與草案結果|使用虛構練習數據|不宣稱未提供的史實細節|新聞不可作為唯一權威|有效期間到期須重新審核|不涉及個資或監控|設備性能不得虛構宣稱|不使用災害恐懼敘事|安全敘事不呈現傷亡細節/;

function frameFor(applicationRecord) {
  return CONTEXT_FRAMES[applicationRecord?.contextLineage?.macroContextId]
    ?? { actor: '任務小組', place: '活動場地', measureName: '材料長度', measureUnit: '公尺', countName: '材料', countUnit: '份', container: '盒' };
}

function gcd(left, right) {
  let a = Math.abs(Number(left));
  let b = Math.abs(Number(right));
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

function fractionToMixed(value) {
  const match = /^(\d+)\/(\d+)$/.exec(String(value));
  if (!match) return String(value);
  const numerator = Number(match[1]);
  const denominator = Number(match[2]);
  if (numerator < denominator) return `${numerator}/${denominator}`;
  const whole = Math.floor(numerator / denominator);
  const remainder = numerator % denominator;
  if (!remainder) return String(whole);
  const common = gcd(remainder, denominator);
  return `${whole}又${remainder / common}/${denominator / common}`;
}

function normalizeSameDenominatorItem(spec, item) {
  if (spec.knowledgePointId !== 'kp_g3a_u08_same_denominator_compare') return item;
  const revised = structuredClone(item);
  revised.givenRoleValues.rightDenominator = revised.givenRoleValues.leftDenominator;
  const left = revised.givenRoleValues.leftNumerator;
  const right = revised.givenRoleValues.rightNumerator;
  revised.answer = left === right ? '=' : left > right ? '>' : '<';
  return revised;
}

function refineApplicationSurface(spec, item, applicationRecord) {
  if (spec.mode !== 'APPLICATION') return item;
  const revised = structuredClone(item);
  const values = revised.givenRoleValues;
  const frame = frameFor(applicationRecord);
  const intro = `${frame.actor}在${frame.place}`;

  if (spec.knowledgePointId === 'kp_g3b_u09_length_decimal_conversion'
      || spec.knowledgePointId === 'kp_g4a_u09_decimal_length_conversion') {
    if (spec.requestedUnknownRole === 'majorUnits') {
      revised.prompt = `${intro}量得${values.minorUnits}公尺的路程，換算成多少公里？`;
      revised.answerUnit = '公里';
    } else {
      revised.prompt = `${intro}規劃${values.majorUnits}公里的路程，換算成多少公尺？`;
      revised.answerUnit = '公尺';
    }
  }

  if (spec.patternSpecId.includes('rate_distance_context')) {
    if (spec.requestedUnknownRole === 'total') {
      revised.prompt = `${intro}規劃${values.unitCount}段相同路線，每段${values.ratePerUnit}公里。總路程是多少公里？`;
    } else {
      revised.prompt = `${intro}第一段路程是${values.firstTotal}公里，第二段也是${values.secondTotal}公里。兩段合計多少公里？`;
    }
    revised.answerUnit = '公里';
  }

  if (spec.operationFamilyId === 'fraction_times_integer') {
    revised.prompt = `${intro}規劃${values.groupCount}段相同路線，每段長${values.amountPerGroup}公里。總路程是多少公里？`;
    revised.answerUnit = '公里';
  }

  if (spec.operationFamilyId === 'discrete_fraction_conversion') {
    if (spec.requestedUnknownRole === 'itemCount') {
      revised.prompt = `${intro}已整理好${values.wholeUnits}${frame.container}${frame.countName}，另外還有${values.numerator}/${values.denominator}${frame.container}；每${frame.container}有${values.itemsPerWhole}${frame.countUnit}。共有多少${frame.countUnit}${frame.countName}？`;
    } else {
      revised.prompt = `${intro}有${values.itemCount}${frame.countUnit}${frame.countName}，每${values.itemsPerWhole}${frame.countUnit}可裝滿1${frame.container}。這些${frame.countName}相當於多少${frame.container}的容量？`;
      revised.answerText = fractionToMixed(revised.answer);
      revised.answerUnit = frame.container;
    }
  }

  if (spec.operationFamilyId === 'fraction_bounds') {
    revised.prompt = `${intro}找出所有分母是${values.denominator}、大於${values.lowerBound}且小於${values.upperBound}的分數。`;
  }

  return revised;
}

export function applyStudentFacingOperationSurface(args = {}) {
  const normalizedItem = normalizeSameDenominatorItem(args.spec, args.item);
  const surfaced = applyStudentFacingSemanticRemediationV2({ ...args, item: normalizedItem });
  const refined = refineApplicationSurface(args.spec, surfaced, args.applicationRecord);
  return Object.freeze({
    ...refined,
    studentFacingMacroContextId: args.applicationRecord?.contextLineage?.macroContextId ?? null,
    studentFacingSemanticRevision: 3
  });
}

export function validateStudentFacingOperationSurface(args = {}) {
  const base = validateStudentFacingSemanticRemediationV2(args);
  const issues = args.spec?.mode === 'NUMERIC'
    ? base.issues.filter((row) => row.code !== 'POSTG_APP_STUDENT_SURFACE_ROUNDING_ESTIMATE_SEMANTICS_MISSING')
    : [...base.issues];
  const item = args.item;
  const spec = args.spec;

  if (spec.knowledgePointId === 'kp_g3a_u08_same_denominator_compare'
      && item.givenRoleValues.leftDenominator !== item.givenRoleValues.rightDenominator) {
    issues.push({ code: 'POSTG_APP_STUDENT_SURFACE_SAME_DENOMINATOR_KP_MISMATCH' });
  }
  if ((spec.knowledgePointId === 'kp_g3b_u09_length_decimal_conversion'
      || spec.knowledgePointId === 'kp_g4a_u09_decimal_length_conversion')
      && spec.mode === 'APPLICATION'
      && (!item.prompt.includes('公尺') || !item.prompt.includes('公里') || /毫升|公升/.test(item.prompt))) {
    issues.push({ code: 'POSTG_APP_STUDENT_SURFACE_LENGTH_CONVERSION_MISMATCH' });
  }
  if (spec.patternSpecId.includes('rate_distance_context')
      && spec.mode === 'APPLICATION'
      && (!item.prompt.includes('公里') || /公升|公斤|公尺/.test(item.prompt))) {
    issues.push({ code: 'POSTG_APP_STUDENT_SURFACE_RATE_DISTANCE_MISMATCH' });
  }
  if (spec.operationFamilyId === 'fraction_times_integer'
      && spec.mode === 'APPLICATION'
      && (!item.prompt.includes('段相同路線') || !item.prompt.includes('總路程'))) {
    issues.push({ code: 'POSTG_APP_STUDENT_SURFACE_FRACTION_TIMES_INTEGER_CONTEXT_MISMATCH' });
  }
  if (spec.operationFamilyId === 'discrete_fraction_conversion'
      && spec.requestedUnknownRole === 'fractionalUnits'
      && spec.mode === 'APPLICATION'
      && (!item.prompt.includes('可裝滿') || !String(item.answerText).includes('又'))) {
    issues.push({ code: 'POSTG_APP_STUDENT_SURFACE_DISCRETE_FRACTION_CAPACITY_MISMATCH' });
  }
  if (spec.operationFamilyId === 'fraction_bounds'
      && spec.mode === 'APPLICATION'
      && (/\bx\//i.test(item.prompt) || !item.prompt.includes('分母是'))) {
    issues.push({ code: 'POSTG_APP_STUDENT_SURFACE_FRACTION_BOUND_NOT_GRADE_APPROPRIATE' });
  }
  if (item.studentFacingSemanticRevision !== 3) {
    issues.push({ code: 'POSTG_APP_STUDENT_SURFACE_SEMANTIC_REVISION_INVALID' });
  }
  return { ...base, ok: issues.length === 0, issues };
}

function productLabel(item) {
  if (item.knowledgePointId === 'kp_g3b_u09_length_decimal_conversion'
      || item.knowledgePointId === 'kp_g4a_u09_decimal_length_conversion') return '長度換算紀錄';
  return PRODUCT_LABELS[item.operationFamilyId] ?? '數學成果報告';
}

function pblPlan(record, item) {
  const values = item.givenRoleValues;
  const answer = `${item.answerText}${item.answerUnit ?? ''}`;
  const isPbl5 = record.graphType === 'PBL5_BOUNDED_DECISION';
  const product = productLabel(item);
  const baseChecks = [
    '主要計算答案與題目條件一致',
    '所有數量都使用正確單位',
    '最終成果引用前段計算與檢查結果'
  ];
  let prompts;
  let roles;
  let constraints = ['所有數量都必須來自題目或前一步計算', '每一步都要保留正確單位'];
  let success = [`主要答案為${answer}`, '至少使用一種反向運算或等值關係完成檢查', `最終完成${product}`];

  switch (item.operationFamilyId) {
    case 'discrete_fraction_conversion': {
      if (item.requestedUnknownRole === 'itemCount') {
        prompts = [
          `先算${values.wholeUnits}${item.answerUnit === '張' ? '冊' : '袋'}完整單位共有多少${item.answerUnit}。`,
          `再算${values.numerator}/${values.denominator}個單位包含多少${item.answerUnit}，並和第1題相加。`,
          `用每單位${values.itemsPerWhole}${item.answerUnit}檢查總數，完成${product}。`
        ];
        roles = ['完整單位的物品數', '分數單位與總物品數', product];
      } else {
        const full = Math.floor(values.itemCount / values.itemsPerWhole);
        const remainder = values.itemCount % values.itemsPerWhole;
        prompts = [
          `把${values.itemCount}${item.answerUnit ? item.answerUnit.replace(/盒|袋|冊|箱/, '份') : '份'}依每${values.itemsPerWhole}份裝1個完整單位，算出可裝滿${full}個單位並找出剩餘數。`,
          `把剩餘${remainder}份寫成完整單位的分數，並化成最簡分數。`,
          `合併完整單位與分數單位，寫出${answer}並完成${product}。`
        ];
        roles = ['完整單位與剩餘數', '剩餘量的分數表示', product];
      }
      break;
    }
    case 'measurement_fraction':
      prompts = [
        `把分數部分${values.numerator}/${values.denominator}換成小數。`,
        `把整數部分${values.wholeUnits}和第1題的小數相加，得到測量值。`,
        `把小數答案再換回帶分數，檢查是否等於題目的原數。`,
        `比較分數與小數兩種寫法，確認單位與數值都相同。`,
        `整理換算過程，完成${product}，結果須為${answer}。`
      ];
      roles = ['分數部分的小數值', '完整小數測量值', '反向換算結果', '等值檢查', product];
      constraints.push('分數與小數必須表示同一個測量值');
      break;
    case 'fraction_context_total': {
      const role = item.requestedUnknownRole;
      if (isPbl5) {
        prompts = [
          `判斷題目要求的是總量、原量或相差量，列出正確的分數關係。`,
          `把題目中的分數通分成可直接計算的形式。`,
          `依第1、2題的關係完成計算，得到${answer}。`,
          `使用反向運算代回原題，確認兩個已知量與答案一致。`,
          `依計算與檢查結果完成${product}，說明${role === 'difference' ? '哪個方案用量較少' : '總量如何重建'}。`
        ];
        roles = ['數量關係', '通分結果', '主要分數答案', '反向運算檢查', product];
      } else {
        prompts = [
          `把題目中的兩個分數通分，寫出可直接計算的形式。`,
          `依題目要求完成加法或減法，並用反向運算檢查${answer}。`,
          `整理通分、計算與檢查結果，完成${product}。`
        ];
        roles = ['通分結果', '主要答案與反向檢查', product];
      }
      break;
    }
    case 'decimal_measure_conversion': {
      const major = item.answerUnit === '公里' || item.answerUnit === '公升';
      const relation = item.answerUnit === '公里' || item.answerUnit === '公尺' ? '1公里＝1000公尺' : '1公升＝1000毫升';
      const basic = [
        `寫出換算關係「${relation}」，判斷要乘以1000還是除以1000。`,
        `依第1題完成換算，得到${answer}。`,
        `把${answer}反向換算回原單位，確認和題目已知量相同。`
      ];
      if (isPbl5) {
        prompts = [...basic,
          `比較大單位與小單位兩種寫法，選出較適合標示在紀錄表上的形式。`,
          `列出原數、換算式與反向換算，完成${product}。`
        ];
        roles = ['單位換算關係', '換算結果', '反向換算檢查', '標示方式選擇', product];
      } else {
        prompts = [...basic.slice(0, 2), `用反向換算驗證答案，完成${product}。`];
        roles = ['單位換算關係', '換算結果', product];
      }
      constraints.push(major ? '大單位與小單位之間相差1000倍' : '換算前後必須表示同一個量');
      break;
    }
    case 'fraction_times_integer':
      prompts = [
        `用分數乘法算出${values.groupCount}段路線的總長，得到${answer}。`,
        `改用${values.groupCount}個${values.amountPerGroup}公里做重複加法，檢查總路程。`,
        `把總路程平均分成2個階段，算出每階段可安排的路程。`,
        `比較乘法與重複加法結果，確認兩種方法一致。`,
        `依總路程、分段結果與檢查完成${product}。`
      ];
      roles = ['分數乘法總路程', '重複加法檢查', '兩階段路程', '方法一致性檢查', product];
      constraints.push('每段路線長度相同', '總路程必須可由重複加法重建');
      success = [`總路程為${answer}`, '乘法與重複加法結果相同', `最終完成${product}`];
      break;
    case 'rate_total': {
      if (item.requestedUnknownRole === 'total') {
        prompts = [
          `用每段${values.ratePerUnit}公里乘以${values.unitCount}段，算出總路程${answer}。`,
          `用總路程除以${values.unitCount}，確認每段仍是${values.ratePerUnit}公里。`,
          `整理乘法與反向運算結果，完成${product}。`
        ];
      } else {
        prompts = [
          `把第一段${values.firstTotal}公里和第二段${values.secondTotal}公里相加，得到${answer}。`,
          `從總路程減去其中一段，確認可回到另一段路程。`,
          `整理加法與反向運算結果，完成${product}。`
        ];
      }
      roles = ['主要路程計算', '反向運算檢查', product];
      break;
    }
    case 'exact_grouping':
      prompts = [
        `用${values.total}除以${values.groupSize}，判斷餘數是否為0。`,
        `算出可以分成的組數，並寫出「組數×每組數量＝總數」的檢查。`,
        `依餘數與組數完成${product}，明確回答能否剛好分完。`
      ];
      roles = ['整除與餘數判定', '組數與乘法檢查', product];
      constraints.push('能剛好分完時餘數必須是0');
      break;
    case 'common_group_total':
      prompts = [
        `列出${values.firstGrouping}的前幾個倍數。`,
        `列出${values.secondGrouping}的前幾個倍數。`,
        `找出兩組倍數中最小的共同數，確認答案是${answer}。`,
        `分別算出採用每${values.firstGrouping}筆一組和每${values.secondGrouping}筆一組時的組數。`,
        `依最小共同數與兩種組數完成${product}。`
      ];
      roles = ['第一組倍數', '第二組倍數', '最小共同倍數', '兩種分組數', product];
      constraints.push('總數必須同時能被兩種每組數量整除');
      break;
    case 'square_tiling': {
      const side = Number(item.answer);
      const rectangleCount = (side / values.rectangleLength) * (side / values.rectangleWidth);
      prompts = [
        `列出${values.rectangleLength}和${values.rectangleWidth}的倍數，找出最小共同倍數作為正方形邊長。`,
        `用正方形邊長分別除以長與寬，算出橫向與縱向需要幾個長方形，合計需要${rectangleCount}個。`,
        `畫出或文字說明${side}公分×${side}公分的拼排方式，完成${product}。`
      ];
      roles = ['最小正方形邊長', '長方形個數', product];
      constraints.push('正方形邊長必須同時是長與寬的倍數');
      break;
    }
    case 'quotient_fraction_context':
      prompts = [
        `把${values.totalQuantity}${item.answerUnit}平均分給${values.recipientCount}組，用分數寫出每組分得${answer}。`,
        `把每組分得的量乘回${values.recipientCount}組，確認總量回到${values.totalQuantity}${item.answerUnit}。`,
        `依平均分配與乘回去的檢查完成${product}。`
      ];
      roles = ['每組分得量', '乘回去的總量檢查', product];
      constraints.push('每組分得量必須相同');
      break;
    case 'segment_measure': {
      const segmentCount = item.requestedUnknownRole === 'segmentLength' ? Number(values.segmentCount) : Number(item.answer);
      const segmentLength = item.requestedUnknownRole === 'segmentLength' ? Number(item.answer) : Number(values.segmentLength);
      const cutPoints = Array.from({ length: Math.max(segmentCount - 1, 0) }, (_, index) => (index + 1) * segmentLength).join('、');
      prompts = [
        `用總長度除以段數或每段長度，算出${answer}。`,
        `用${segmentCount}段×每段${segmentLength}公尺，檢查是否回到總長度${values.totalLength}公尺。`,
        `從起點量出切點：${cutPoints}公尺。`,
        `算出需要${Math.max(segmentCount - 1, 0)}次切割，檢查最後一段長度是否正確。`,
        `依段數、段長、切點與切割次數完成${product}。`
      ];
      roles = ['段數或段長', '乘法檢查', '切點位置', '切割次數', product];
      constraints.push('所有段長必須相同', '切點不得超過材料總長度');
      break;
    }
    default:
      prompts = isPbl5
        ? [
          `依題目數量完成主要計算，得到${answer}。`,
          `使用反向運算檢查主要答案。`,
          `列出答案使用的數量關係與單位。`,
          `依計算、檢查與單位整理${product}草案。`,
          `完成${product}並說明所有數量如何由題目重建。`
        ]
        : [
          `依題目數量完成主要計算，得到${answer}。`,
          `使用反向運算檢查主要答案。`,
          `依計算與檢查完成${product}。`
        ];
      roles = isPbl5
        ? ['主要計算結果', '反向運算檢查', '數量關係與單位', `${product}草案`, product]
        : ['主要計算結果', '反向運算檢查', product];
  }

  return {
    product,
    prompts,
    roles,
    constraints,
    success,
    checks: baseChecks,
    answer
  };
}

function materializeOperationSpecificPbl(record, item) {
  const revised = structuredClone(record);
  const plan = pblPlan(revised, item);
  if (plan.prompts.length !== revised.tasks.length || plan.roles.length !== revised.milestones.length) {
    throw new Error(`PBL plan size mismatch for ${item.patternSpecId}`);
  }
  revised.drivingProblem.problemStatementZh = `${item.prompt} 請依序完成下列相互依賴的任務，最後完成${plan.product}。`;
  revised.drivingProblem.constraints = plan.constraints;
  revised.drivingProblem.successCriteria = plan.success;
  revised.drivingProblem.finalProductType = plan.product;
  revised.tasks = revised.tasks.map((task, index) => ({ ...task, promptZh: plan.prompts[index], fullyInstantiated: true }));
  revised.milestones = revised.milestones.map((milestone, index) => ({
    ...milestone,
    semanticRole: plan.roles[index],
    canonicalReconstructionCandidate: index === 0
      ? `由第1題依題目資料重建，主要答案為${plan.answer}`
      : `由前一里程碑與第${index + 1}題的計算或檢查結果重建`,
    expectedAnswerText: index === 0 ? plan.answer : `須完成「${plan.roles[index]}」並保留計算依據`
  }));
  revised.finalProduct.finalProductType = plan.product;
  revised.finalProduct.decisionWitnessCandidate = `最終成果須包含${plan.answer}，引用至少兩個前段計算或檢查結果，並說明${plan.product}如何符合題目條件。`;
  revised.finalProduct.constraintSatisfactionChecks = plan.checks;
  revised.studentFacingSemanticRevision = 3;
  return Object.freeze(revised);
}

export function instantiateStudentFacingPblTaskSet({ record, item } = {}) {
  const enrichedRecord = { ...record, operationFamilyId: item?.operationFamilyId ?? null };
  const applicationRecord = item?.studentFacingMacroContextId
    ? { contextLineage: { macroContextId: item.studentFacingMacroContextId } }
    : null;
  const base = instantiateStudentFacingPblTaskSetV2({ record: enrichedRecord, item, applicationRecord });
  return materializeOperationSpecificPbl(base, item);
}

export function validateStudentFacingPblTaskSet(record) {
  const base = validateStudentFacingPblTaskSetV2(record);
  const issues = base.issues.filter((row) => row.code !== 'POSTG_APP_STUDENT_PBL_VERSION_INVALID');
  const visible = [
    record.drivingProblem?.problemStatementZh,
    ...(record.drivingProblem?.constraints ?? []),
    ...(record.drivingProblem?.successCriteria ?? []),
    ...(record.tasks ?? []).map((task) => task.promptZh),
    ...(record.finalProduct?.constraintSatisfactionChecks ?? []),
    record.finalProduct?.decisionWitnessCandidate
  ].join(' ');
  if (record.drivingProblem?.finalProductType === '可執行方案' || record.drivingProblem?.finalProductType === '數學成果報告') {
    issues.push({ code: 'POSTG_APP_STUDENT_PBL_GENERIC_PRODUCT_LABEL' });
  }
  if (FORBIDDEN_PBL_TEXT.test(visible)) issues.push({ code: 'POSTG_APP_STUDENT_PBL_GENERIC_OR_GOVERNANCE_TEXT' });
  if (new Set((record.tasks ?? []).map((task) => task.promptZh)).size !== record.tasks.length) {
    issues.push({ code: 'POSTG_APP_STUDENT_PBL_DUPLICATED_TASK_SURFACE' });
  }
  for (const keyword of FAMILY_KEYWORDS[record.operationFamilyId] ?? []) {
    if (!visible.includes(keyword)) issues.push({ code: 'POSTG_APP_STUDENT_PBL_OPERATION_KEYWORD_MISSING', keyword });
  }
  if (record.studentFacingSemanticRevision !== 3) issues.push({ code: 'POSTG_APP_STUDENT_PBL_SEMANTIC_REVISION_INVALID' });
  return { ...base, ok: issues.length === 0, issues };
}
