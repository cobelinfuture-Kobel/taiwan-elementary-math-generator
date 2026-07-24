import { G4B_U04_PUBLIC_CONTROLS, G4B_U04_SOURCE_ID } from "./g4b-u04-promotion.js";
import { G5A_U08_PUBLIC_CONTROLS, G5A_U08_SOURCE_ID } from "./g5a-u08-promotion.js";
import {
  G5A_U02_PUBLIC_QUESTION_TYPE_CONTRACT,
  G5A_U02_PUBLIC_QUESTION_TYPE_OPTIONS,
} from "../batch-b/g5a-u02-public-question-type-contract.js";
import {
  G5A_U02_REASONING_DEPTH_CONTRACT,
  G5A_U02_REASONING_DEPTH_OPTIONS,
} from "../batch-b/g5a-u02-reasoning-depth-contract.js";
import {
  G5A_U02_CONTEXT_OPTIONS,
  G5A_U02_CONTEXT_TAXONOMY,
} from "../batch-b/g5a-u02-context-taxonomy.js";

export const G5A_U02_PUBLIC_CONTROL_SOURCE_ID = "g5a_u02_5a02";

const FIFTEEN_UNIT_SOURCE_IDS = Object.freeze([
  "g3a_u01_3a01", "g3a_u02_3a02", "g3a_u03_3a03", "g3a_u06_3a06",
  "g3b_u01_3b01", "g3b_u04_3b04", "g3b_u08_3b08",
  "g4a_u01_4a01", "g4a_u02_4a02", "g4a_u04_4a04", "g4a_u08_4a08",
  "g4b_u01_4b01", "g5a_u08_5a08", G4B_U04_SOURCE_ID, G5A_U02_PUBLIC_CONTROL_SOURCE_ID,
]);
const PBL_SOURCE_IDS = Object.freeze(new Set([
  "g3b_u04_3b04", "g4a_u08_4a08", "g5a_u08_5a08", G4B_U04_SOURCE_ID, G5A_U02_PUBLIC_CONTROL_SOURCE_ID,
]));

function optionRows(values) {
  return Object.freeze(values.map((value) => Object.freeze({ value, label: value })));
}

function labeledOptions(rows) {
  return Object.freeze(rows.map(([value, label]) => Object.freeze({ value, label })));
}

function control({ supported, defaultValue = null, options = [], partial = false }) {
  return Object.freeze({ supported, partial, defaultValue, options: Object.freeze([...options]) });
}

function closeoutQuestionOptions(sourceId, existing = []) {
  const labels = new Map([
    ["mixed", "混合題"], ["concept", "概念題"], ["numeric", "數字題"],
    ["application", "應用題"], ["operation_estimation", "運算估算題"],
    ["reasoning", "推理題"], ["representation", "表徵題"], ["pbl", "PBL 專題題組"],
  ]);
  const values = [...new Set([...(existing ?? []), "numeric", "application", ...(PBL_SOURCE_IDS.has(sourceId) ? ["pbl"] : [])])];
  return labeledOptions(values.map((value) => [value, labels.get(value) ?? value]));
}

function genericProfile(sourceId) {
  return Object.freeze({
    sourceId,
    task: "BATCH_A13_BATCH_B2_PUBLIC_WORKSHEET_CLOSEOUT_V1",
    questionTypeControl: control({
      supported: true,
      defaultValue: "numeric",
      options: closeoutQuestionOptions(sourceId),
    }),
    reasoningDepthControl: control({ supported: false }),
    contextControl: control({ supported: false }),
    compatibilityPolicy: "fifteen_unit_public_runtime_admission",
    genericFallback: false,
    freeFormAI: false,
  });
}

const genericProfiles = Object.fromEntries(FIFTEEN_UNIT_SOURCE_IDS.map((sourceId) => [sourceId, genericProfile(sourceId)]));

const profiles = Object.freeze({
  ...genericProfiles,
  [G5A_U08_SOURCE_ID]: Object.freeze({
    sourceId: G5A_U08_SOURCE_ID,
    task: "BATCH_A13_BATCH_B2_PUBLIC_WORKSHEET_CLOSEOUT_V1",
    questionTypeControl: control({
      supported: true,
      defaultValue: G5A_U08_PUBLIC_CONTROLS.defaults.questionMode,
      options: closeoutQuestionOptions(G5A_U08_SOURCE_ID, G5A_U08_PUBLIC_CONTROLS.questionModes),
    }),
    reasoningDepthControl: control({
      supported: true,
      defaultValue: G5A_U08_PUBLIC_CONTROLS.defaults.depthMode,
      options: optionRows(G5A_U08_PUBLIC_CONTROLS.depthModes),
    }),
    contextControl: control({
      supported: true,
      defaultValue: G5A_U08_PUBLIC_CONTROLS.defaults.contextMode,
      options: optionRows(G5A_U08_PUBLIC_CONTROLS.contextModes),
    }),
    compatibilityPolicy: "existing_g5a_u08_runtime_contract_plus_public_pbl",
    genericFallback: false,
    freeFormAI: false,
  }),
  [G5A_U02_PUBLIC_CONTROL_SOURCE_ID]: Object.freeze({
    sourceId: G5A_U02_PUBLIC_CONTROL_SOURCE_ID,
    task: "BATCH_A13_BATCH_B2_PUBLIC_WORKSHEET_CLOSEOUT_V1",
    questionTypeControl: control({
      supported: true,
      defaultValue: G5A_U02_PUBLIC_QUESTION_TYPE_CONTRACT.defaultValue,
      options: closeoutQuestionOptions(G5A_U02_PUBLIC_CONTROL_SOURCE_ID, G5A_U02_PUBLIC_QUESTION_TYPE_OPTIONS.map((row) => row.value)),
    }),
    reasoningDepthControl: control({
      supported: true,
      defaultValue: G5A_U02_REASONING_DEPTH_CONTRACT.defaultValue,
      options: G5A_U02_REASONING_DEPTH_OPTIONS,
    }),
    contextControl: control({
      supported: true,
      partial: true,
      defaultValue: G5A_U02_CONTEXT_TAXONOMY.defaultValue,
      options: G5A_U02_CONTEXT_OPTIONS,
    }),
    compatibilityPolicy: "existing_g5a_u02_runtime_contract_plus_public_pbl",
    sdgSupported: false,
    genericFallback: false,
    freeFormAI: false,
  }),
  [G4B_U04_SOURCE_ID]: Object.freeze({
    sourceId: G4B_U04_SOURCE_ID,
    task: "BATCH_A13_BATCH_B2_PUBLIC_WORKSHEET_CLOSEOUT_V1",
    questionTypeControl: control({
      supported: true,
      defaultValue: G4B_U04_PUBLIC_CONTROLS.defaults.questionMode,
      options: closeoutQuestionOptions(G4B_U04_SOURCE_ID, G4B_U04_PUBLIC_CONTROLS.questionModes),
    }),
    reasoningDepthControl: control({ supported: false }),
    contextControl: control({
      supported: true,
      defaultValue: G4B_U04_PUBLIC_CONTROLS.defaults.contextMode,
      options: optionRows(G4B_U04_PUBLIC_CONTROLS.contextModes),
    }),
    compatibilityPolicy: "existing_g4b_u04_runtime_contract_plus_public_pbl",
    genericFallback: false,
    freeFormAI: false,
  }),
});

export const PUBLIC_CONTROL_PROFILE_REGISTRY = Object.freeze({
  task: "BATCH_A13_BATCH_B2_PUBLIC_WORKSHEET_CLOSEOUT_V1",
  status: "fifteen_unit_question_mode_ui_ready",
  sourceIds: Object.freeze(Object.keys(profiles)),
  profiles,
});

export function getPublicControlProfile(sourceId) {
  return profiles[sourceId] ?? null;
}

export function normalizePublicControlValue(profile, controlName, value) {
  const definition = profile?.[controlName];
  if (!definition?.supported) return null;
  return definition.options.some((option) => option.value === value)
    ? value
    : definition.defaultValue;
}

export function auditPublicControlProfiles() {
  const errors = [];
  for (const [sourceId, profile] of Object.entries(profiles)) {
    if (profile.sourceId !== sourceId) errors.push(`PUBLIC_CONTROL_SOURCE_MISMATCH:${sourceId}`);
    for (const controlName of ["questionTypeControl", "reasoningDepthControl", "contextControl"]) {
      const definition = profile[controlName];
      if (!definition || typeof definition.supported !== "boolean") {
        errors.push(`PUBLIC_CONTROL_DEFINITION_MISSING:${sourceId}:${controlName}`);
        continue;
      }
      if (definition.supported) {
        if (definition.options.length === 0) errors.push(`PUBLIC_CONTROL_OPTIONS_EMPTY:${sourceId}:${controlName}`);
        if (!definition.options.some((option) => option.value === definition.defaultValue)) {
          errors.push(`PUBLIC_CONTROL_DEFAULT_INVALID:${sourceId}:${controlName}`);
        }
      }
    }
  }
  if (Object.keys(profiles).length !== 15) errors.push("FIFTEEN_UNIT_PROFILE_COUNT_MISMATCH");
  for (const sourceId of PBL_SOURCE_IDS) {
    if (!profiles[sourceId]?.questionTypeControl.options.some((option) => option.value === "pbl")) {
      errors.push(`PBL_OPTION_MISSING:${sourceId}`);
    }
  }
  for (const sourceId of FIFTEEN_UNIT_SOURCE_IDS.filter((sourceId) => !PBL_SOURCE_IDS.has(sourceId))) {
    if (profiles[sourceId]?.questionTypeControl.options.some((option) => option.value === "pbl")) {
      errors.push(`UNAPPROVED_PBL_OPTION_EXPOSED:${sourceId}`);
    }
  }
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    profileCount: Object.keys(profiles).length,
  });
}
