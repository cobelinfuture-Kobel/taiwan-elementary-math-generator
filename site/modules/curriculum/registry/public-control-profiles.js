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

function optionRows(values) {
  return Object.freeze(values.map((value) => Object.freeze({ value, label: value })));
}

function control({ supported, defaultValue = null, options = [], partial = false }) {
  return Object.freeze({ supported, partial, defaultValue, options: Object.freeze([...options]) });
}

const profiles = Object.freeze({
  [G5A_U08_SOURCE_ID]: Object.freeze({
    sourceId: G5A_U08_SOURCE_ID,
    task: "S96N_SharedPublicControlProfile",
    questionTypeControl: control({
      supported: true,
      defaultValue: G5A_U08_PUBLIC_CONTROLS.defaults.questionMode,
      options: optionRows(G5A_U08_PUBLIC_CONTROLS.questionModes),
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
    compatibilityPolicy: "existing_g5a_u08_runtime_contract",
  }),
  [G5A_U02_PUBLIC_CONTROL_SOURCE_ID]: Object.freeze({
    sourceId: G5A_U02_PUBLIC_CONTROL_SOURCE_ID,
    task: "S96N_SharedPublicControlProfile",
    questionTypeControl: control({
      supported: true,
      defaultValue: G5A_U02_PUBLIC_QUESTION_TYPE_CONTRACT.defaultValue,
      options: G5A_U02_PUBLIC_QUESTION_TYPE_OPTIONS,
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
    compatibilityPolicy: "intersection_must_resolve_to_at_least_one_canonical_pattern",
    sdgSupported: false,
    genericFallback: false,
    freeFormAI: false,
  }),
});

export const PUBLIC_CONTROL_PROFILE_REGISTRY = Object.freeze({
  task: "S96N_SharedPublicControlProfile",
  status: "shared_profile_registry_ready_pending_ui_integration",
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
  const g5aU02 = profiles[G5A_U02_PUBLIC_CONTROL_SOURCE_ID];
  if (g5aU02.contextControl.options.some((option) => option.value === "sdg")) errors.push("G5AU02_UNSUPPORTED_SDG_EXPOSED");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    profileCount: Object.keys(profiles).length,
  });
}
