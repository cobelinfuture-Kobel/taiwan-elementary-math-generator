import {
  applyStudentFacingSemanticRemediationV2,
  instantiateStudentFacingPblTaskSetV2,
  validateStudentFacingPblTaskSetV2,
  validateStudentFacingSemanticRemediationV2
} from './student-facing-semantic-remediation-v2.mjs';

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

export function instantiateStudentFacingPblTaskSet({ record, item } = {}) {
  const enrichedRecord = {
    ...record,
    operationFamilyId: item?.operationFamilyId ?? null
  };
  const applicationRecord = item?.studentFacingMacroContextId
    ? { contextLineage: { macroContextId: item.studentFacingMacroContextId } }
    : null;
  return instantiateStudentFacingPblTaskSetV2({ record: enrichedRecord, item, applicationRecord });
}

export function validateStudentFacingPblTaskSet(record) {
  return validateStudentFacingPblTaskSetV2(record);
}
