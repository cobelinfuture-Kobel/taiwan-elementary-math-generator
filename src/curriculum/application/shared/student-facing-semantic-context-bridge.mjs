import {
  applyStudentFacingSemanticRemediationV2,
  instantiateStudentFacingPblTaskSetV2,
  validateStudentFacingPblTaskSetV2,
  validateStudentFacingSemanticRemediationV2
} from './student-facing-semantic-remediation-v2.mjs';

const PBL_PRODUCT_LABELS = Object.freeze({
  fraction_accumulation: '分數使用說明',
  measurement_fraction: '測量換算紀錄',
  decimal_add_sub: '資源使用紀錄',
  decimal_multiply: '材料準備方案',
  fraction_add_sub: '資源使用紀錄',
  fraction_context_total: '資源總量方案',
  fraction_times_integer: '材料準備方案',
  rate_total: '資源總量方案'
});

export function applyStudentFacingOperationSurface(args = {}) {
  const item = applyStudentFacingSemanticRemediationV2(args);
  return Object.freeze({
    ...item,
    studentFacingMacroContextId: args.applicationRecord?.contextLineage?.macroContextId ?? null
  });
}

export function validateStudentFacingOperationSurface(args = {}) {
  const result = validateStudentFacingSemanticRemediationV2(args);
  const issues = args.spec?.mode === 'NUMERIC'
    ? result.issues.filter((row) => row.code !== 'POSTG_APP_STUDENT_SURFACE_ROUNDING_ESTIMATE_SEMANTICS_MISSING')
    : result.issues;
  return { ...result, ok: issues.length === 0, issues };
}

function sanitizePblRecord(record, operationFamilyId) {
  const revised = structuredClone(record);
  const current = revised.drivingProblem?.finalProductType;
  const replacement = current === '可執行方案'
    ? (PBL_PRODUCT_LABELS[operationFamilyId] ?? '數學成果報告')
    : current;
  const replace = (text) => String(text ?? '').replaceAll(current, replacement);
  revised.drivingProblem.problemStatementZh = replace(revised.drivingProblem.problemStatementZh);
  revised.drivingProblem.successCriteria = revised.drivingProblem.successCriteria.map(replace);
  revised.drivingProblem.finalProductType = replacement;
  revised.tasks = revised.tasks.map((task) => ({ ...task, promptZh: replace(task.promptZh) }));
  revised.milestones = revised.milestones.map((milestone) => ({
    ...milestone,
    semanticRole: replace(milestone.semanticRole),
    canonicalReconstructionCandidate: replace(milestone.canonicalReconstructionCandidate),
    expectedAnswerText: replace(milestone.expectedAnswerText)
  }));
  revised.finalProduct.finalProductType = replacement;
  revised.finalProduct.decisionWitnessCandidate = replace(revised.finalProduct.decisionWitnessCandidate);
  revised.finalProduct.constraintSatisfactionChecks = [
    '主要計算答案與題目條件一致',
    '所有數量都使用正確單位',
    '最終決定引用至少兩個前段結果'
  ];
  return Object.freeze(revised);
}

export function instantiateStudentFacingPblTaskSet({ record, item } = {}) {
  const enrichedRecord = {
    ...record,
    operationFamilyId: item?.operationFamilyId ?? null
  };
  const applicationRecord = item?.studentFacingMacroContextId
    ? { contextLineage: { macroContextId: item.studentFacingMacroContextId } }
    : null;
  const materialized = instantiateStudentFacingPblTaskSetV2({ record: enrichedRecord, item, applicationRecord });
  return sanitizePblRecord(materialized, item?.operationFamilyId);
}

export function validateStudentFacingPblTaskSet(record) {
  const result = validateStudentFacingPblTaskSetV2(record);
  const visible = [
    ...(record.finalProduct?.constraintSatisfactionChecks ?? []),
    record.drivingProblem?.finalProductType
  ].join(' ');
  const issues = [...result.issues];
  if (record.drivingProblem?.finalProductType === '可執行方案') {
    issues.push({ code: 'POSTG_APP_STUDENT_PBL_GENERIC_PRODUCT_LABEL' });
  }
  if (/使用虛構練習數據|不宣稱未提供的史實細節|新聞不可作為唯一權威|有效期間到期須重新審核|不涉及個資或監控|設備性能不得虛構宣稱|不使用災害恐懼敘事|安全敘事不呈現傷亡細節/.test(visible)) {
    issues.push({ code: 'POSTG_APP_STUDENT_PBL_GOVERNANCE_CHECK_LEAKAGE' });
  }
  return { ...result, ok: issues.length === 0, issues };
}
