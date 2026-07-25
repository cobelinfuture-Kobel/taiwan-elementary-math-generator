import {
  FIFTEEN_UNIT_PBL_SOURCE_IDS,
  FIFTEEN_UNIT_PUBLIC_SOURCE_IDS,
  getFifteenUnitPublicControlProfile,
} from "./fifteen-unit-public-control-profiles.js";

export const W1_FULL_PRODUCT_PUBLIC_SOURCE_IDS = Object.freeze([
  "g5b_u05_5b05a",
  "g6a_u01_6a01",
  "g5a_u03_5a03a",
  "g5a_u03_5a03a1",
]);
export const FULL_PRODUCT_PUBLIC_SOURCE_IDS = Object.freeze([...FIFTEEN_UNIT_PUBLIC_SOURCE_IDS, ...W1_FULL_PRODUCT_PUBLIC_SOURCE_IDS]);
export const FULL_PRODUCT_PBL_SOURCE_IDS = FIFTEEN_UNIT_PBL_SOURCE_IDS;

const option = (value, label) => Object.freeze({ value, label });
const unsupported = Object.freeze({ supported: false, partial: false, defaultValue: null, options: Object.freeze([]) });
const w1ProfileBySource = new Map(W1_FULL_PRODUCT_PUBLIC_SOURCE_IDS.map((sourceId) => [sourceId, Object.freeze({
  sourceId,
  task: "P01E_W1PublicUIHTMLPDFPrintCloseout",
  questionTypeControl: Object.freeze({ supported: true, partial: false, defaultValue: "numeric", options: Object.freeze([option("numeric", "數字題"), option("application", "應用題")]) }),
  reasoningDepthControl: unsupported,
  contextControl: unsupported,
  compatibilityPolicy: "w1_full_product_public_runtime_admission",
  sdgSupported: true,
  genericFallback: false,
  freeFormAI: false,
})]));

export function getFullProductPublicControlProfile(sourceId) {
  return getFifteenUnitPublicControlProfile(sourceId) ?? w1ProfileBySource.get(sourceId) ?? null;
}

export function normalizeFullProductPublicControlValue(profile, controlName, value) {
  const definition = profile?.[controlName];
  if (!definition?.supported) return null;
  return definition.options.some((row) => row.value === value) ? value : definition.defaultValue;
}

export function auditFullProductPublicControlProfiles() {
  const errors = [];
  for (const sourceId of FULL_PRODUCT_PUBLIC_SOURCE_IDS) {
    const profile = getFullProductPublicControlProfile(sourceId);
    const values = profile?.questionTypeControl?.options?.map((row) => row.value) ?? [];
    if (!values.includes("numeric")) errors.push(`NUMERIC_OPTION_MISSING:${sourceId}`);
    if (!values.includes("application")) errors.push(`APPLICATION_OPTION_MISSING:${sourceId}`);
    if (values.includes("pbl") !== FULL_PRODUCT_PBL_SOURCE_IDS.has(sourceId)) errors.push(`PBL_ELIGIBILITY_MISMATCH:${sourceId}`);
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), profileCount: FULL_PRODUCT_PUBLIC_SOURCE_IDS.length, w1ProfileCount: W1_FULL_PRODUCT_PUBLIC_SOURCE_IDS.length, pblProfileCount: [...FULL_PRODUCT_PBL_SOURCE_IDS].length });
}
