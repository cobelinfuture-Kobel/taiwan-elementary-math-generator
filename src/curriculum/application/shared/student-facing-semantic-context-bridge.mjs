import {
  applyStudentFacingSemanticRemediationV2,
  instantiateStudentFacingPblTaskSetV2,
  validateStudentFacingPblTaskSetV2,
  validateStudentFacingSemanticRemediationV2
} from './student-facing-semantic-remediation-v2.mjs';

const PBL_PRODUCT_LABELS = Object.freeze({
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

function replaceProductLabel(record, operationFamilyId) {
  const replacement = PBL_PRODUCT_LABELS[operationFamilyId];
  const current = record.drivingProblem?.finalProductType;
  if (!replacement || current !== '可執行方案') return record;
  const revised = structuredClone(record);
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
  return replaceProductLabel(materialized, item?.operationFamilyId);
}

export function validateStudentFacingPblTaskSet(record) {
  return validateStudentFacingPblTaskSetV2(record);
}
