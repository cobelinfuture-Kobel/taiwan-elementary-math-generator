import {
  FIFTEEN_UNIT_PBL_SOURCE_IDS,
  FIFTEEN_UNIT_PUBLIC_SOURCE_IDS,
  getFifteenUnitPublicControlProfile,
} from "./fifteen-unit-public-control-profiles.js";

export const W1_FULL_PRODUCT_PUBLIC_SOURCE_IDS = Object.freeze(["g5b_u05_5b05a", "g6a_u01_6a01", "g5a_u03_5a03a", "g5a_u03_5a03a1"]);
export const W3_SLICE001_PUBLIC_SOURCE_IDS = Object.freeze(["g3a_u08_3a08"]);
export const W3_SLICE003_PUBLIC_SOURCE_IDS = Object.freeze(["g3b_u07_3b07"]);
export const W3_SLICE004_PUBLIC_SOURCE_IDS = Object.freeze(["g3b_u09_3b09"]);
export const W3_SLICE005_PUBLIC_SOURCE_IDS = Object.freeze(["g4b_u08_4b08"]);
export const P01E_FULL_PRODUCT_PUBLIC_SOURCE_IDS = Object.freeze([...FIFTEEN_UNIT_PUBLIC_SOURCE_IDS, ...W1_FULL_PRODUCT_PUBLIC_SOURCE_IDS]);
export const P03F2_FULL_PRODUCT_PUBLIC_SOURCE_IDS = Object.freeze([...P01E_FULL_PRODUCT_PUBLIC_SOURCE_IDS, ...W3_SLICE001_PUBLIC_SOURCE_IDS]);
export const P03F3_FULL_PRODUCT_PUBLIC_SOURCE_IDS = Object.freeze([...P03F2_FULL_PRODUCT_PUBLIC_SOURCE_IDS, ...W3_SLICE003_PUBLIC_SOURCE_IDS]);
export const P03F4_FULL_PRODUCT_PUBLIC_SOURCE_IDS = Object.freeze([...P03F3_FULL_PRODUCT_PUBLIC_SOURCE_IDS, ...W3_SLICE004_PUBLIC_SOURCE_IDS]);
export const CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_IDS = Object.freeze([...P03F4_FULL_PRODUCT_PUBLIC_SOURCE_IDS, ...W3_SLICE005_PUBLIC_SOURCE_IDS]);
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
  sourceId: "g3a_u08_3a08", task: "P03F_W3DirectProductVerticalSlice006Implementation",
  questionTypeControl: Object.freeze({ supported: true, partial: false, defaultValue: "numeric", options: Object.freeze([option("numeric", "數字題"), option("application", "應用題")]) }),
  reasoningDepthControl: unsupported,
  contextControl: Object.freeze({ supported: true, partial: false, defaultValue: "global_primary", options: Object.freeze([option("global_primary", "全域情境")]) }),
  compatibilityPolicy: "w3_slice006_four_kp_numeric_application_global_context", sdgSupported: false, genericFallback: false, freeFormAI: false,
});
const currentG3BU07Profile = Object.freeze({
  sourceId: "g3b_u07_3b07", task: "P03F_W3DirectProductVerticalSlice003Implementation",
  questionTypeControl: Object.freeze({ supported: true, partial: false, defaultValue: "numeric", options: Object.freeze([option("numeric", "數字題")]) }),
  reasoningDepthControl: unsupported, contextControl: unsupported,
  compatibilityPolicy: "w3_slice003_quotient_fraction_numeric_only", sdgSupported: false, genericFallback: false, freeFormAI: false,
});
const currentG3BU09Profile = Object.freeze({
  sourceId: "g3b_u09_3b09", task: "P03F_W3DirectProductVerticalSlice004Implementation",
  questionTypeControl: Object.freeze({ supported: true, partial: false, defaultValue: "numeric", options: Object.freeze([option("numeric", "數字題")]) }),
  reasoningDepthControl: unsupported, contextControl: unsupported,
  compatibilityPolicy: "w3_slice004_tenth_decimal_numeric_only", sdgSupported: false, genericFallback: false, freeFormAI: false,
});
const currentG4BU08Profile = Object.freeze({
  sourceId: "g4b_u08_4b08", task: "P03F_W3DirectProductVerticalSlice005Implementation",
  questionTypeControl: Object.freeze({ supported: true, partial: false, defaultValue: "numeric", options: Object.freeze([option("numeric", "數字題")]) }),
  reasoningDepthControl: unsupported, contextControl: unsupported,
  compatibilityPolicy: "w3_slice005_equivalent_fraction_numeric_only", sdgSupported: false, genericFallback: false, freeFormAI: false,
});

export function getP03F1HistoricalFullProductPublicControlProfile(sourceId) {
  return sourceId === "g3a_u08_3a08" ? historicalW3Profile : getFifteenUnitPublicControlProfile(sourceId) ?? w1ProfileBySource.get(sourceId) ?? null;
}
export function getFullProductPublicControlProfile(sourceId) {
  return getFifteenUnitPublicControlProfile(sourceId)
    ?? w1ProfileBySource.get(sourceId)
    ?? (sourceId === "g3a_u08_3a08" ? currentG3AU08Profile : null)
    ?? (sourceId === "g3b_u07_3b07" ? currentG3BU07Profile : null)
    ?? (sourceId === "g3b_u09_3b09" ? currentG3BU09Profile : null)
    ?? (sourceId === "g4b_u08_4b08" ? currentG4BU08Profile : null);
}
export function normalizeFullProductPublicControlValue(profile, controlName, value) {
  const definition = profile?.[controlName];
  if (!definition?.supported) return null;
  return definition.options.some((row) => row.value === value) ? value : definition.defaultValue;
}
export function auditFullProductPublicControlProfiles(options = {}) {
  const historicalW3 = options.includeW3Slice001 === true
    && options.includeW3Slice002 !== true && options.includeW3Slice003 !== true
    && options.includeW3Slice004 !== true && options.includeW3Slice005 !== true && options.includeW3Slice006 !== true;
  const includeSlice6 = options.includeW3Slice006 === true;
  const includeSlice5 = options.includeW3Slice005 === true || includeSlice6;
  const includeSlice4 = options.includeW3Slice004 === true || includeSlice5;
  const includeSlice3 = options.includeW3Slice003 === true || includeSlice4;
  const includeSlice2 = options.includeW3Slice002 === true || includeSlice3;
  const sourceIds = historicalW3
    ? [...P01E_FULL_PRODUCT_PUBLIC_SOURCE_IDS, ...W3_SLICE001_PUBLIC_SOURCE_IDS]
    : includeSlice5
      ? CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_IDS
      : includeSlice4
        ? P03F4_FULL_PRODUCT_PUBLIC_SOURCE_IDS
        : includeSlice3
          ? P03F3_FULL_PRODUCT_PUBLIC_SOURCE_IDS
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
    const numericOnly = ["g3b_u07_3b07", "g3b_u09_3b09", "g4b_u08_4b08"].includes(sourceId);
    const applicationExpected = numericOnly ? false : sourceId === "g3a_u08_3a08" ? !historicalW3 : true;
    if (values.includes("application") !== applicationExpected) errors.push(`APPLICATION_ELIGIBILITY_MISMATCH:${sourceId}`);
    if (values.includes("pbl") !== FULL_PRODUCT_PBL_SOURCE_IDS.has(sourceId)) errors.push(`PBL_ELIGIBILITY_MISMATCH:${sourceId}`);
  }
  return Object.freeze({
    ok: errors.length === 0, errors: Object.freeze(errors), profileCount: sourceIds.length,
    w1ProfileCount: W1_FULL_PRODUCT_PUBLIC_SOURCE_IDS.length,
    w3Slice001ProfileCount: historicalW3 ? 1 : 0,
    w3Slice002ProfileCount: includeSlice2 && !historicalW3 ? 1 : 0,
    w3Slice003ProfileCount: includeSlice3 ? 1 : 0,
    w3Slice004ProfileCount: includeSlice4 ? 1 : 0,
    w3Slice005ProfileCount: includeSlice5 ? 1 : 0,
    w3Slice006ProfileCount: includeSlice6 ? 1 : 0,
    pblProfileCount: [...FULL_PRODUCT_PBL_SOURCE_IDS].length,
  });
}
