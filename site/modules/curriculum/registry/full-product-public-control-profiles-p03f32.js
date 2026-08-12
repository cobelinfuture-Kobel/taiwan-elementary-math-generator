export * from "./full-product-public-control-profiles-p03f31.js";
import { getFullProductPublicControlProfile as baseGetFullProductPublicControlProfile } from "./full-product-public-control-profiles-p03f31.js";

const option = (value, label) => Object.freeze({ value, label });
const unsupported = Object.freeze({ supported:false, partial:false, defaultValue:null, options:Object.freeze([]) });
const G6B_U01_P03F32_PROFILE = Object.freeze({
  sourceId:"g6b_u01_6b01",
  task:"P03F_W3DirectProductVerticalSlice032Implementation",
  questionTypeControl:Object.freeze({
    supported:true,
    partial:false,
    defaultValue:"numeric",
    options:Object.freeze([option("numeric", "數字題")]),
  }),
  reasoningDepthControl:unsupported,
  contextControl:unsupported,
  compatibilityPolicy:"w3_slice032_mixed_domain_conversion_numeric_only_compare_arithmetic_application_reserved",
  sdgSupported:false,
  genericFallback:false,
  freeFormAI:false,
});

export function getFullProductPublicControlProfile(sourceId) {
  return sourceId === G6B_U01_P03F32_PROFILE.sourceId
    ? G6B_U01_P03F32_PROFILE
    : baseGetFullProductPublicControlProfile(sourceId);
}
