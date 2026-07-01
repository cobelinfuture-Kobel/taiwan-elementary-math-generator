import { ERROR_CODES } from "../constants/error-codes.js";

const DOMAIN_MARKERS = Object.freeze({
  decimals: ["decimal", "decimals", "placevalue_decimal", "tenths", "hundredths"],
  fractions: ["fraction", "fractions", "numerator", "denominator", "mixednumber"],
  geometry: ["geometry", "angle", "polygon", "circle", "perimeter"],
  speedRate: ["speed", "rate", "unitrate", "distance_time", "time_distance"],
  areaVolume: ["area", "volume", "surfacearea", "capacity"],
  probability: ["probability", "chance", "likelihood"],
  statistics: ["statistics", "data_table", "bar_chart", "line_plot", "mean", "median", "mode"],
  algebra: ["algebra", "equation", "variable", "unknown_value"],
  negativeNumbers: ["negative", "negative_number", "below_zero", "signed_integer"]
});

function createHookResult(overrides = {}) {
  return {
    hookName: "validateNoFutureDomainLeakage",
    passed: true,
    errorCodes: [],
    warnings: [],
    computedAnswer: null,
    normalizedInput: null,
    notes: "",
    ...overrides
  };
}

function normalizeToken(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

function hasMarker(value) {
  const token = normalizeToken(value);
  return Object.values(DOMAIN_MARKERS).some((markers) => markers.some((marker) => token.includes(marker)));
}

function scanForLeakage(node) {
  if (typeof node === "number") {
    return !Number.isInteger(node) || node < 0;
  }

  if (typeof node === "string") {
    return hasMarker(node);
  }

  if (Array.isArray(node)) {
    return node.some(scanForLeakage);
  }

  if (node && typeof node === "object") {
    return Object.entries(node).some(([key, value]) => hasMarker(key) || scanForLeakage(value));
  }

  return false;
}

export function validateNoFutureDomainLeakage(itemContent) {
  const passed = !scanForLeakage(itemContent);

  return createHookResult({
    passed,
    errorCodes: passed ? [] : [ERROR_CODES.E_FUTURE_DOMAIN_LEAKAGE],
    normalizedInput: itemContent ?? null,
    notes: passed
      ? ""
      : "Checked structured fields first, then scanned English-only domain marker keys and values."
  });
}
