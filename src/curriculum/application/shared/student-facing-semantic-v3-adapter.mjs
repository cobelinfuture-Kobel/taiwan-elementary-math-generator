import {
  applyStudentFacingOperationSurface as applyBridgeSurface,
  instantiateStudentFacingPblTaskSet as instantiateBridgePbl,
  validateStudentFacingOperationSurface as validateBridgeSurface,
  validateStudentFacingPblTaskSet as validateBridgePbl
} from './student-facing-semantic-context-bridge.mjs';

export function applyStudentFacingOperationSurface(args = {}) {
  return applyBridgeSurface(args);
}

export function validateStudentFacingOperationSurface(args = {}) {
  const result = validateBridgeSurface(args);
  const issues = result.issues.filter((row) => row.code !== 'POSTG_APP_STUDENT_SURFACE_VERSION_INVALID');
  return { ...result, ok: issues.length === 0, issues };
}

export function instantiateStudentFacingPblTaskSet(args = {}) {
  return instantiateBridgePbl(args);
}

export function validateStudentFacingPblTaskSet(record) {
  const result = validateBridgePbl(record);
  const visible = [
    record.drivingProblem?.problemStatementZh,
    ...(record.drivingProblem?.constraints ?? []),
    ...(record.drivingProblem?.successCriteria ?? []),
    ...(record.tasks ?? []).map((task) => task.promptZh),
    record.finalProduct?.decisionWitnessCandidate
  ].join(' ');
  const issues = result.issues.filter((row) => !(
    record.operationFamilyId === 'rate_total'
    && row.code === 'POSTG_APP_STUDENT_PBL_OPERATION_KEYWORD_MISSING'
    && row.keyword === '乘法'
  ));
  if (record.operationFamilyId === 'rate_total' && (!visible.includes('乘以') || !visible.includes('反向運算'))) {
    issues.push({ code: 'POSTG_APP_STUDENT_PBL_RATE_RELATION_MISSING' });
  }
  return { ...result, ok: issues.length === 0, issues };
}
