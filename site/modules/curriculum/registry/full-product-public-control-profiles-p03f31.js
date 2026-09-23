export * from "./full-product-public-control-profiles-p03f30.js";
import { getFullProductPublicControlProfile as baseGetFullProductPublicControlProfile } from "./full-product-public-control-profiles-p03f30.js";

const option = (value, label) => Object.freeze({ value, label });
const unsupported = Object.freeze({ supported:false, partial:false, defaultValue:null, options:Object.freeze([]) });
const G5B_U04_P03F31_PROFILE = Object.freeze({
  sourceId: "g5b_u04_5b04",
  task: "P03F_W3DirectProductVerticalSlice031Implementation",
  questionTypeControl: Object.freeze({
    supported: true,
    partial: false,
    defaultValue: "numeric",
    options: Object.freeze([option("numeric", "數字題")]),
  }),
  reasoningDepthControl: unsupported,
  contextControl: unsupported,
  compatibilityPolicy: "w3_slice031_decimal_times_integer_numeric_only_future_application_reserved",
  sdgSupported: false,
  genericFallback: false,
  freeFormAI: false,
});

export function getFullProductPublicControlProfile(sourceId) {
  return sourceId === G5B_U04_P03F31_PROFILE.sourceId
    ? G5B_U04_P03F31_PROFILE
    : baseGetFullProductPublicControlProfile(sourceId);
}
