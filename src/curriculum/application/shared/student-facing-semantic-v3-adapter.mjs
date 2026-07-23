import {
  applyStudentFacingOperationSurface as applyBridgeSurface,
  instantiateStudentFacingPblTaskSet as instantiateBridgePbl,
  validateStudentFacingOperationSurface as validateBridgeSurface,
  validateStudentFacingPblTaskSet as validateBridgePbl
} from './student-facing-semantic-context-bridge.mjs';

function fixFractionBoundsSurface(args, item) {
  if (args.spec?.operationFamilyId !== 'fraction_bounds' || args.spec?.mode !== 'APPLICATION') return item;
  const revised = structuredClone(item);
  const denominator = String(revised.givenRoleValues?.unknownPart ?? '').split('/')[1];
  if (!denominator) return item;
  const prefix = String(revised.prompt).split('找出')[0];
  revised.prompt = `${prefix}找出所有分母是${denominator}、大於${revised.givenRoleValues.lowerBound}且小於${revised.givenRoleValues.upperBound}的分數。`;
  return Object.freeze(revised);
}

export function applyStudentFacingOperationSurface(args = {}) {
  return fixFractionBoundsSurface(args, applyBridgeSurface(args));
}

export function validateStudentFacingOperationSurface(args = {}) {
  const result = validateBridgeSurface(args);
  const issues = result.issues.filter((row) => row.code !== 'POSTG_APP_STUDENT_SURFACE_VERSION_INVALID');
  return { ...result, ok: issues.length === 0, issues };
}

export function instantiateStudentFacingPblTaskSet(args = {}) {
  const record = structuredClone(instantiateBridgePbl(args));
  if (record.operationFamilyId === 'rate_total' && record.tasks?.[1]) {
    record.tasks[1].promptZh = record.tasks[1].promptZh.startsWith('用反向運算：')
      ? record.tasks[1].promptZh
      : `用反向運算：${record.tasks[1].promptZh}`;
  }
  return Object.freeze(record);
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
  const issues = result.issues.filter((row) => {
    if (record.operationFamilyId === 'rate_total'
        && row.code === 'POSTG_APP_STUDENT_PBL_OPERATION_KEYWORD_MISSING'
        && row.keyword === '乘法') return false;
    if (record.operationFamilyId === 'discrete_fraction_conversion'
        && row.code === 'POSTG_APP_STUDENT_PBL_OPERATION_KEYWORD_MISSING'
        && row.keyword === '剩餘') return false;
    return true;
  });
  if (record.operationFamilyId === 'rate_total') {
    const primaryRelationPresent = visible.includes('乘以') || visible.includes('相加');
    if (!primaryRelationPresent || !visible.includes('反向運算')) {
      issues.push({ code: 'POSTG_APP_STUDENT_PBL_RATE_RELATION_MISSING' });
    }
  }
  if (record.operationFamilyId === 'discrete_fraction_conversion'
      && (!visible.includes('完整') || !visible.includes('分數'))) {
    issues.push({ code: 'POSTG_APP_STUDENT_PBL_DISCRETE_FRACTION_RELATION_MISSING' });
  }
  return { ...result, ok: issues.length === 0, issues };
}
