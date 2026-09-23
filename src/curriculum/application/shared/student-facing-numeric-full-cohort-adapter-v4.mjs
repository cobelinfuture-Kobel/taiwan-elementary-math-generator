import {
  applyStudentFacingOperationSurface as applyRevision4Surface,
  instantiateStudentFacingPblTaskSet,
  validateStudentFacingOperationSurface as validateRevision4Surface,
  validateStudentFacingPblTaskSet,
  W02_A08R3_NUMERIC_SEMANTIC_REVISION,
  W02_A08R3_NUMERIC_SURFACE_VERSION,
  W02_A08R3_TARGET_FINDING_CODES
} from './student-facing-numeric-remediation-v4.mjs';
import { buildNumericFullCohortContract } from './student-facing-numeric-full-cohort-contracts-v4.mjs';

const sortedKeys = (value) => Object.keys(value ?? {}).sort();
const sameKeys = (left, right) => JSON.stringify(sortedKeys(left)) === JSON.stringify([...right].sort());
const pick = (source, keys) => Object.fromEntries(keys.map((key) => [key, source[key]]));
const FILTERED_CODES = new Set(Object.values(W02_A08R3_TARGET_FINDING_CODES));

function fullCohortContract(spec, item) {
  const values = item.givenRoleValues ?? {};
  if (spec.operationFamilyId === 'common_denominator' && spec.requestedUnknownRole === 'commonDenominator') {
    const keys = ['leftDenominator', 'rightDenominator'];
    return {
      keys,
      givens: pick(values, keys),
      prompt: `分母${values.leftDenominator}和${values.rightDenominator}的最小公分母是多少？`
    };
  }
  if (spec.operationFamilyId === 'discrete_fraction_conversion' && spec.requestedUnknownRole === 'itemCount') {
    const keys = ['wholeUnits', 'itemsPerWhole', 'numerator', 'denominator'];
    return {
      keys,
      givens: pick(values, keys),
      prompt: `${values.wholeUnits}個完整單位和${values.numerator}/${values.denominator}個單位，每1個完整單位有${values.itemsPerWhole}件物品，共有幾件物品？`
    };
  }
  return buildNumericFullCohortContract(spec, item);
}

function applyContract(spec, item) {
  if (spec.mode !== 'NUMERIC') return item;
  const contract = fullCohortContract(spec, item);
  if (!contract) return item;
  const revised = structuredClone(item);
  revised.givenRoleValues = Object.freeze(contract.givens);
  revised.prompt = contract.prompt;
  if (contract.answerText != null) revised.answerText = contract.answerText;
  revised.studentFacingNumericExpectedGivenRoles = Object.freeze([...contract.keys]);
  revised.studentFacingNumericContractId = `A08R3_FULL:${spec.operationFamilyId}:${spec.requestedUnknownRole}`;
  return Object.freeze(revised);
}

export function applyStudentFacingOperationSurface(args = {}) {
  return applyContract(args.spec, applyRevision4Surface(args));
}

export function validateStudentFacingOperationSurface(args = {}) {
  const base = validateRevision4Surface(args);
  if (args.spec?.mode !== 'NUMERIC') return base;
  const contract = fullCohortContract(args.spec, args.item ?? {});
  if (!contract) return base;

  const item = args.item ?? {};
  const issues = base.issues.filter((row) => !FILTERED_CODES.has(row.code));
  const prompt = String(item.prompt ?? '');
  const answerText = String(item.answerText ?? '');

  if (!sameKeys(item.givenRoleValues, contract.keys)) {
    issues.push({
      code: W02_A08R3_TARGET_FINDING_CODES.givenSet,
      expectedRoles: contract.keys,
      actualRoles: sortedKeys(item.givenRoleValues)
    });
  }
  if (item.givenRoleValues && Object.prototype.hasOwnProperty.call(item.givenRoleValues, args.spec.requestedUnknownRole)) {
    issues.push({ code: W02_A08R3_TARGET_FINDING_CODES.givenSet, reason: 'REQUESTED_ROLE_PRESENT' });
  }
  if (prompt !== contract.prompt || !prompt || /求(?:計算結果|指定數量|未知數量)/.test(prompt)) {
    issues.push({
      code: W02_A08R3_TARGET_FINDING_CODES.malformed,
      expectedPrompt: contract.prompt,
      actualPrompt: prompt
    });
  }
  if (/\bx\s*\/\s*\d+/i.test(prompt)
      || /^\s*[\[(].*[,，].*[\])]/.test(answerText)
      || /\[[^\]]+[,，][^\]]+\)/.test(`${prompt} ${answerText}`)) {
    issues.push({ code: W02_A08R3_TARGET_FINDING_CODES.notation });
  }
  if (item.studentFacingSurfaceVersion !== W02_A08R3_NUMERIC_SURFACE_VERSION
      || item.studentFacingSemanticRevision !== W02_A08R3_NUMERIC_SEMANTIC_REVISION) {
    issues.push({ code: 'POSTG_APP_W02_A08R3_NUMERIC_SURFACE_VERSION_INVALID' });
  }
  return { ...base, ok: issues.length === 0, issues };
}

export function auditNumericStudentFacingSurfaceV4({ specs = [], items = [] } = {}) {
  const specByPattern = new Map(specs.map((spec) => [spec.patternSpecId, spec]));
  const findings = {
    unresolvedRequestedUnknown: [],
    answerEquivalentOrNonMinimalGivenSet: [],
    malformedOrIncoherentSurface: [],
    gradeUnsafeNotation: []
  };
  for (const item of items.filter((row) => row.mode === 'NUMERIC')) {
    const spec = specByPattern.get(item.patternSpecId);
    const result = validateStudentFacingOperationSurface({ spec, item });
    const codes = new Set(result.issues.map((row) => row.code));
    if (codes.has(W02_A08R3_TARGET_FINDING_CODES.unresolved)) findings.unresolvedRequestedUnknown.push(item.generatedItemId);
    if (codes.has(W02_A08R3_TARGET_FINDING_CODES.givenSet)) findings.answerEquivalentOrNonMinimalGivenSet.push(item.generatedItemId);
    if (codes.has(W02_A08R3_TARGET_FINDING_CODES.malformed)) findings.malformedOrIncoherentSurface.push(item.generatedItemId);
    if (codes.has(W02_A08R3_TARGET_FINDING_CODES.notation)) findings.gradeUnsafeNotation.push(item.generatedItemId);
  }
  return Object.freeze({
    reviewedCount: items.filter((row) => row.mode === 'NUMERIC').length,
    operationRoleContractCount: new Set(items.filter((row) => row.mode === 'NUMERIC').map((row) => `${row.operationFamilyId}:${row.requestedUnknownRole}`)).size,
    counts: Object.freeze(Object.fromEntries(Object.entries(findings).map(([key, rows]) => [key, rows.length]))),
    findings: Object.freeze(Object.fromEntries(Object.entries(findings).map(([key, rows]) => [key, Object.freeze(rows)])))
  });
}

export {
  instantiateStudentFacingPblTaskSet,
  validateStudentFacingPblTaskSet,
  W02_A08R3_NUMERIC_SEMANTIC_REVISION,
  W02_A08R3_NUMERIC_SURFACE_VERSION,
  W02_A08R3_TARGET_FINDING_CODES
};
