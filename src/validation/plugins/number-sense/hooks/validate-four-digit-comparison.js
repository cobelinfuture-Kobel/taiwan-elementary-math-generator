import { ERROR_CODES } from "../../../core/constants/error-codes.js";
import {
  compareValues,
  normalizeInteger
} from "../utils/normalize-number.js";

const HOOK_NAME = "validateFourDigitComparison";

const RELATION_ALIASES = Object.freeze({
  "<": "<",
  less_than: "<",
  lt: "<",
  ">": ">",
  greater_than: ">",
  gt: ">",
  "=": "=",
  equal: "=",
  equals: "=",
  eq: "="
});

function createHookResult(overrides = {}) {
  return {
    hookName: HOOK_NAME,
    passed: true,
    errorCodes: [],
    warnings: [],
    computedAnswer: null,
    normalizedInput: null,
    notes: "",
    ...overrides
  };
}

function normalizeRelation(relation) {
  return typeof relation === "string" ? RELATION_ALIASES[relation.trim()] ?? null : null;
}

export function validateFourDigitComparison(a, b, relation, constraint = {}) {
  const normalizedA = normalizeInteger(a);
  const normalizedB = normalizeInteger(b);
  const candidateRelation = normalizeRelation(relation);
  const actualRelation = compareValues(a, b);
  const normalizedInput = {
    a,
    b,
    relation,
    constraint
  };

  if (normalizedA === null || normalizedB === null || candidateRelation === null || actualRelation === null) {
    return createHookResult({
      passed: false,
      errorCodes: [ERROR_CODES.E_COMPARISON_MISMATCH],
      normalizedInput,
      notes: "Only numeric and numeric-string comparison values are supported in S21I; Chinese numeral parsing remains out of scope."
    });
  }

  const passed = candidateRelation === actualRelation;
  return createHookResult({
    passed,
    errorCodes: passed ? [] : [ERROR_CODES.E_COMPARISON_MISMATCH],
    computedAnswer: {
      a: normalizedA,
      b: normalizedB,
      relation: actualRelation
    },
    normalizedInput: {
      ...normalizedInput,
      a: normalizedA,
      b: normalizedB,
      candidateRelation
    }
  });
}
