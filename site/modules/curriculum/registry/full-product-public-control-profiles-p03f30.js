export * from "./full-product-public-control-profiles.js";
import { getFullProductPublicControlProfile as baseGetFullProductPublicControlProfile } from "./full-product-public-control-profiles.js";

const option = (value, label) => Object.freeze({ value, label });
const unsupported = Object.freeze({ supported: false, partial: false, defaultValue: null, options: Object.freeze([]) });
const G5A_U06_P03F30_PROFILE = Object.freeze({
  sourceId: "g5a_u06_5a06",
  task: "P03F_W3DirectProductVerticalSlice030Implementation",
  questionTypeControl: Object.freeze({
    supported: true,
    partial: false,
    defaultValue: "numeric",
    options: Object.freeze([option("numeric", "數字題")]),
  }),
  reasoningDepthControl: unsupported,
  contextControl: unsupported,
  compatibilityPolicy: "w3_slice030_four_kp_fraction_numeric_only_application_hidden",
  sdgSupported: false,
  genericFallback: false,
  freeFormAI: false,
});

export function getFullProductPublicControlProfile(sourceId) {
  return sourceId === G5A_U06_P03F30_PROFILE.sourceId
    ? G5A_U06_P03F30_PROFILE
    : baseGetFullProductPublicControlProfile(sourceId);
}
