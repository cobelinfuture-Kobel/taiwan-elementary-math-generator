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
  return validateStudentFacingSemanticRemediationV2(args);
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
