import {
  FIFTEEN_UNIT_PBL_SOURCE_IDS,
  FIFTEEN_UNIT_PUBLIC_SOURCE_IDS,
  getFifteenUnitPublicControlProfile,
} from "./fifteen-unit-public-control-profiles.js";

export const W1_FULL_PRODUCT_PUBLIC_SOURCE_IDS = Object.freeze(["g5b_u05_5b05a", "g6a_u01_6a01", "g5a_u03_5a03a", "g5a_u03_5a03a1"]);
export const W3_SLICE001_PUBLIC_SOURCE_IDS = Object.freeze(["g3a_u08_3a08"]);
export const W3_SLICE003_PUBLIC_SOURCE_IDS = Object.freeze(["g3b_u07_3b07"]);
export const P01E_FULL_PRODUCT_PUBLIC_SOURCE_IDS = Object.freeze([...FIFTEEN_UNIT_PUBLIC_SOURCE_IDS, ...W1_FULL_PRODUCT_PUBLIC_SOURCE_IDS]);
export const P03F2_FULL_PRODUCT_PUBLIC_SOURCE_IDS = Object.freeze([...P01E_FULL_PRODUCT_PUBLIC_SOURCE_IDS, ...W3_SLICE001_PUBLIC_SOURCE_IDS]);
export const CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_IDS = Object.freeze([...P03F2_FULL_PRODUCT_PUBLIC_SOURCE_IDS, ...W3_SLICE003_PUBLIC_SOURCE_IDS]);
export const FULL_PRODUCT_PUBLIC_SOURCE_IDS = P01E_FULL_PRODUCT_PUBLIC_SOURCE_IDS;
export const FULL_PRODUCT_PBL_SOURCE_IDS = FIFTEEN_UNIT_PBL_SOURCE_IDS;

const option = (value, label) => Object.freeze({ value, label });
const unsupported = Object.freeze({ supported: false, partial: false, defaultValue: null, options: Object.freeze([]) });
const w1ProfileBySource = new Map(W1_FULL_PRODUCT_PUBLIC_SOURCE_IDS.map((sourceId) => [sourceId, Object.freeze({
  sourceId, task: "P01E_W1PublicUIHTMLPDFPrintCloseout",
  questionTypeControl: Object.freeze({ supported: true, partial: false, defaultValue: "numeric", options: Object.freeze([option("numeric", "數字題"), option("application", "應用題")]) }),
  reasoningDepthControl: unsupported, contextControl: unsupported,
  compatibilityPolicy: "w1_full_product_public_runtime_admission", sdgSupported: true, genericFallback: false, freeFormAI: false,
})]));
const historicalW3Profile = Object.freeze({
  sourceId: "g3a_u08_3a08", task: "P03F_W3DirectProductVerticalSlice001Implementation",
  questionTypeControl: Object.freeze({ supported: true, partial: false, defaultValue: "numeric", options: Object.freeze([option("numeric", "數字題")]) }),
  reasoningDepthControl: unsupported, contextControl: unsupported,
  compatibilityPolicy: "w3_slice001_numeric_only_application_not_applicable", sdgSupported: false, genericFallback: false, freeFormAI: false,
});
const currentG3AU08Profile = Object.freeze({
  sourceId: "g3a_u08_3a08", task: "P03F_W3DirectProductVerticalSlice002Implementation",
  questionTypeControl: Object.freeze({ supported: true, partial: false, defaultValue: "numeric", options: Object.freeze([option("numeric", "數字題"), option("application", "應用題")]) }),
  reasoningDepthControl: unsupported,
  contextControl: Object.freeze({ supported: true, partial: false, defaultValue: "global_primary", options: Object.freeze([option("global_primary", "全域情境")]) }),
  compatibilityPolicy: "w3_slice002_numeric_application_global_context", sdgSupported: false, genericFallback: false, freeFormAI: false,
});
const currentG3BU07Profile = Object.freeze({
  sourceId: "g3b_u07_3b07", task: "P03F_W3DirectProductVerticalSlice003Implementation",
  questionTypeControl: Object.freeze({ supported: true, partial: false, defaultValue: "numeric", options: Object.freeze([option("numeric", "數字題")]) }),
  reasoningDepthControl: unsupported, contextControl: unsupported,
  compatibilityPolicy: "w3_slice003_quotient_fraction_numeric_only", sdgSupported: false, genericFallback: false, freeFormAI: false,
});

export function getP03F1HistoricalFullProductPublicControlProfile(sourceId) {
  return sourceId === "g3a_u08_3a08" ? historicalW3Profile : getFifteenUnitPublicControlProfile(sourceId) ?? w1ProfileBySource.get(sourceId) ?? null;
}
export function getFullProductPublicControlProfile(sourceId) {
  return getFifteenUnitPublicControlProfile(sourceId)
    ?? w1ProfileBySource.get(sourceId)
    ?? (sourceId === "g3a_u08_3a08" ? currentG3AU08Profile : null)
    ?? (sourceId === "g3b_u07_3b07" ? currentG3BU07Profile : null);
}
export function normalizeFullProductPublicControlValue(profile, controlName, value) {
  const definition = profile?.[controlName];
  if (!definition?.supported) return null;
  return definition.options.some((row) => row.value === value) ? value : definition.defaultValue;
}
export function auditFullProductPublicControlProfiles(options = {}) {
  const historicalW3 = options.includeW3Slice001 === true && options.includeW3Slice002 !== true && options.includeW3Slice003 !== true;
  const includeSlice3 = options.includeW3Slice003 === true;
  const includeSlice2 = options.includeW3Slice002 === true || includeSlice3;
  const sourceIds = historicalW3
    ? [...P01E_FULL_PRODUCT_PUBLIC_SOURCE_IDS, ...W3_SLICE001_PUBLIC_SOURCE_IDS]
    : includeSlice3
      ? CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_IDS
      : includeSlice2
        ? P03F2_FULL_PRODUCT_PUBLIC_SOURCE_IDS
        : P01E_FULL_PRODUCT_PUBLIC_SOURCE_IDS;
  const errors = [];
  for (const sourceId of sourceIds) {
    const profile = historicalW3 && sourceId === "g3a_u08_3a08"
      ? getP03F1HistoricalFullProductPublicControlProfile(sourceId)
      : getFullProductPublicControlProfile(sourceId);
    const values = profile?.questionTypeControl?.options?.map((row) => row.value) ?? [];
    if (!values.includes("numeric")) errors.push(`NUMERIC_OPTION_MISSING:${sourceId}`);
    const applicationExpected = sourceId === "g3b_u07_3b07" ? false : sourceId === "g3a_u08_3a08" ? !historicalW3 : true;
    if (values.includes("application") !== applicationExpected) errors.push(`APPLICATION_ELIGIBILITY_MISMATCH:${sourceId}`);
    if (values.includes("pbl") !== FULL_PRODUCT_PBL_SOURCE_IDS.has(sourceId)) errors.push(`PBL_ELIGIBILITY_MISMATCH:${sourceId}`);
  }
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    profileCount: sourceIds.length,
    w1ProfileCount: W1_FULL_PRODUCT_PUBLIC_SOURCE_IDS.length,
    w3Slice001ProfileCount: historicalW3 ? 1 : 0,
    w3Slice002ProfileCount: includeSlice2 && !historicalW3 ? 1 : 0,
    w3Slice003ProfileCount: includeSlice3 ? 1 : 0,
    pblProfileCount: [...FULL_PRODUCT_PBL_SOURCE_IDS].length,
  });
}
