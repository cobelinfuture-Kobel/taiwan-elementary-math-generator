import { G4B_U04_PUBLIC_CONTROLS, G4B_U04_SOURCE_ID } from "./g4b-u04-promotion.js";
import { getPublicControlProfile } from "./public-control-profiles.js";

export const FIFTEEN_UNIT_PUBLIC_SOURCE_IDS = Object.freeze([
  "g3a_u01_3a01", "g3a_u02_3a02", "g3a_u03_3a03", "g3a_u06_3a06",
  "g3b_u01_3b01", "g3b_u04_3b04", "g3b_u08_3b08",
  "g4a_u01_4a01", "g4a_u02_4a02", "g4a_u04_4a04", "g4a_u08_4a08",
  "g4b_u01_4b01", "g5a_u08_5a08", G4B_U04_SOURCE_ID, "g5a_u02_5a02",
]);

export const FIFTEEN_UNIT_PBL_SOURCE_IDS = Object.freeze(new Set([
  "g3b_u04_3b04", "g4a_u08_4a08", "g5a_u08_5a08", G4B_U04_SOURCE_ID, "g5a_u02_5a02",
]));

const labels = Object.freeze(new Map([
  ["mixed", "混合題"], ["concept", "概念題"], ["numeric", "數字題"],
  ["application", "應用題"], ["operation_estimation", "運算估算題"],
  ["reasoning", "推理題"], ["representation", "表徵題"], ["pbl", "PBL 專題題組"],
]));

function option(value) {
  return Object.freeze({ value, label: labels.get(value) ?? value });
}

function control({ supported, defaultValue = null, options = [], partial = false }) {
  return Object.freeze({ supported, partial, defaultValue, options: Object.freeze([...options]) });
}

function questionModeValues(sourceId, base) {
  const inherited = base?.questionTypeControl?.options?.map((row) => row.value)
    ?? (sourceId === G4B_U04_SOURCE_ID ? G4B_U04_PUBLIC_CONTROLS.questionModes : []);
  return [...new Set([
    ...inherited,
    "numeric",
    "application",
    ...(FIFTEEN_UNIT_PBL_SOURCE_IDS.has(sourceId) ? ["pbl"] : []),
  ])];
}

export function getFifteenUnitPublicControlProfile(sourceId) {
  if (!FIFTEEN_UNIT_PUBLIC_SOURCE_IDS.includes(sourceId)) return null;
  const base = getPublicControlProfile(sourceId);
  const questionValues = questionModeValues(sourceId, base);
  const defaultQuestionMode = base?.questionTypeControl?.defaultValue
    ?? (sourceId === G4B_U04_SOURCE_ID ? G4B_U04_PUBLIC_CONTROLS.defaults.questionMode : "numeric");
  const contextControl = base?.contextControl
    ?? (sourceId === G4B_U04_SOURCE_ID
      ? control({
        supported: true,
        defaultValue: G4B_U04_PUBLIC_CONTROLS.defaults.contextMode,
        options: G4B_U04_PUBLIC_CONTROLS.contextModes.map(option),
      })
      : control({ supported: false }));
  return Object.freeze({
    sourceId,
    task: "BATCH_A13_BATCH_B2_PUBLIC_WORKSHEET_CLOSEOUT_V1",
    questionTypeControl: control({
      supported: true,
      defaultValue: questionValues.includes(defaultQuestionMode) ? defaultQuestionMode : "numeric",
      options: questionValues.map(option),
    }),
    reasoningDepthControl: base?.reasoningDepthControl ?? control({ supported: false }),
    contextControl,
    compatibilityPolicy: base?.compatibilityPolicy ?? "fifteen_unit_public_runtime_admission",
    sdgSupported: base?.sdgSupported ?? false,
    genericFallback: base?.genericFallback ?? false,
    freeFormAI: base?.freeFormAI ?? false,
  });
}

export function normalizeFifteenUnitPublicControlValue(profile, controlName, value) {
  const definition = profile?.[controlName];
  if (!definition?.supported) return null;
  return definition.options.some((row) => row.value === value)
    ? value
    : definition.defaultValue;
}

export function auditFifteenUnitPublicControlProfiles() {
  const errors = [];
  for (const sourceId of FIFTEEN_UNIT_PUBLIC_SOURCE_IDS) {
    const profile = getFifteenUnitPublicControlProfile(sourceId);
    if (!profile) {
      errors.push(`PROFILE_MISSING:${sourceId}`);
      continue;
    }
    const values = profile.questionTypeControl.options.map((row) => row.value);
    if (!values.includes("numeric")) errors.push(`NUMERIC_OPTION_MISSING:${sourceId}`);
    if (!values.includes("application")) errors.push(`APPLICATION_OPTION_MISSING:${sourceId}`);
    if (values.includes("pbl") !== FIFTEEN_UNIT_PBL_SOURCE_IDS.has(sourceId)) {
      errors.push(`PBL_ELIGIBILITY_MISMATCH:${sourceId}`);
    }
  }
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    profileCount: FIFTEEN_UNIT_PUBLIC_SOURCE_IDS.length,
    pblProfileCount: [...FIFTEEN_UNIT_PBL_SOURCE_IDS].length,
  });
}
