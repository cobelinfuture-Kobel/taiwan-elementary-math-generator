export { validatePlaceValueDecomposition } from "./hooks/validate-place-value-decomposition.js";
export { validatePlaceValueComposition } from "./hooks/validate-place-value-composition.js";
export { validateDigitArrangementMaxMin } from "./hooks/validate-digit-arrangement-max-min.js";
export { validateFourDigitComparison } from "./hooks/validate-four-digit-comparison.js";
export {
  buildNumberFromDigits,
  compareValues,
  composeFromPlaceValueParts,
  computePlaceValueParts,
  getDigitCount,
  getPlaceValue,
  hasLeadingZero,
  normalizeDigitArray,
  normalizeInteger,
  normalizePlaceName,
  normalizePlaceValueParts,
  splitDigits
} from "./utils/normalize-number.js";
