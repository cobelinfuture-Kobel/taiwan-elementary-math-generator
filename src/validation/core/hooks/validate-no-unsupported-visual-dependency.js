import { ERROR_CODES } from "../constants/error-codes.js";
import { WARNING_CODES } from "../constants/warning-codes.js";

function createHookResult(overrides = {}) {
  return {
    hookName: "validateNoUnsupportedVisualDependency",
    passed: true,
    errorCodes: [],
    warnings: [],
    computedAnswer: null,
    normalizedInput: null,
    notes: "",
    ...overrides
  };
}

function isStructuredValue(value) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return Boolean(value) && typeof value === "object" && Object.keys(value).length > 0;
}

function hasStructuredFallbackData(item) {
  return isStructuredValue(item?.structuredTextFallback)
    || isStructuredValue(item?.textFallbackData)
    || isStructuredValue(item?.fallbackData)
    || isStructuredValue(item?.textFallback?.structuredData);
}

export function validateNoUnsupportedVisualDependency(item = {}, visualConstraint = {}) {
  const requiresVisualExtraction = item.requiresVisualExtraction === true || item.visualDependency === "source_visual";
  const requiresVisualRenderer = visualConstraint.requiresVisualRenderer === true || item.requiresVisualRenderer === true;
  const textFallbackAvailable = visualConstraint.textFallbackAvailable === true || item.textFallbackAvailable === true;
  const structuredFallback = hasStructuredFallbackData(item);

  const blocked =
    (requiresVisualExtraction && !structuredFallback)
    || (requiresVisualRenderer && !textFallbackAvailable)
    || (textFallbackAvailable && !structuredFallback);

  return createHookResult({
    passed: !blocked,
    errorCodes: blocked ? [ERROR_CODES.E_VISUAL_DEPENDENCY_UNSTRUCTURED] : [],
    warnings: !blocked && textFallbackAvailable ? [WARNING_CODES.W_TEXT_FALLBACK_ONLY] : [],
    normalizedInput: {
      requiresVisualExtraction,
      requiresVisualRenderer,
      textFallbackAvailable,
      structuredFallback
    }
  });
}
