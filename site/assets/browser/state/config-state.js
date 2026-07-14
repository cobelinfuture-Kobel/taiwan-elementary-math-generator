export * from "./config-state-core.js";

import * as core from "./config-state-core.js";
import {
  G4B_U04_PUBLIC_CONTROLS,
  G4B_U04_SOURCE_ID,
} from "../../../modules/curriculum/registry/g4b-u04-promotion.js";
import {
  G5A_U08_PUBLIC_CONTROLS,
} from "../../../modules/curriculum/registry/g5a-u08-promotion.js";
import {
  getPublicControlProfile,
  normalizePublicControlValue,
} from "../../../modules/curriculum/registry/public-control-profiles.js";

function normalizedControls(sourceId, input = {}) {
  if (sourceId === G4B_U04_SOURCE_ID) {
    return {
      questionMode: G4B_U04_PUBLIC_CONTROLS.questionModes.includes(input.questionMode)
        ? input.questionMode
        : G4B_U04_PUBLIC_CONTROLS.defaults.questionMode,
      layoutMode: G4B_U04_PUBLIC_CONTROLS.layoutModes.includes(input.layoutMode)
        ? input.layoutMode
        : G4B_U04_PUBLIC_CONTROLS.defaults.layoutMode,
      contextMode: G4B_U04_PUBLIC_CONTROLS.contextModes.includes(input.contextMode)
        ? input.contextMode
        : G4B_U04_PUBLIC_CONTROLS.defaults.contextMode,
    };
  }
  const profile = getPublicControlProfile(sourceId);
  if (!profile) return {};
  const normalized = {};
  if (profile.questionTypeControl.supported) normalized.questionMode = normalizePublicControlValue(profile, "questionTypeControl", input.questionMode);
  if (profile.reasoningDepthControl.supported) normalized.depthMode = normalizePublicControlValue(profile, "reasoningDepthControl", input.depthMode);
  if (profile.contextControl.supported) normalized.contextMode = normalizePublicControlValue(profile, "contextControl", input.contextMode);
  return normalized;
}

function applyControlsToState(state, input = {}) {
  const normalized = normalizedControls(state?.batchA?.sourceId, input);
  if (Object.keys(normalized).length > 0) Object.assign(state.batchA, normalized);
  return state;
}

function browserLayoutMode() {
  if (typeof document === "undefined") return null;
  const value = document.getElementById("g4b-u04-layout-mode")?.value
    ?? document.getElementById("pixel-g4b-u04-layout-mode")?.value;
  return G4B_U04_PUBLIC_CONTROLS.layoutModes.includes(value) ? value : null;
}

function browserContextMode() {
  if (typeof document === "undefined") return null;
  const value = document.getElementById("g4b-u04-context-mode")?.value
    ?? document.getElementById("pixel-g4b-u04-context-mode")?.value;
  return G4B_U04_PUBLIC_CONTROLS.contextModes.includes(value) ? value : null;
}

export function createConfigState(options = {}) {
  const state = core.createConfigState(options);
  return applyControlsToState(state, options.queryState ?? {});
}

export function setBatchASourceId(state, sourceId) {
  core.setBatchASourceId(state, sourceId);
  return applyControlsToState(state, state?.batchA ?? {});
}

export function setBatchAPrintLayout(state, patch = {}) {
  core.setBatchAPrintLayout(state, patch);
  if (state?.batchA?.sourceId === G4B_U04_SOURCE_ID) {
    const layoutMode = patch.layoutMode ?? browserLayoutMode();
    if (G4B_U04_PUBLIC_CONTROLS.layoutModes.includes(layoutMode)) state.batchA.layoutMode = layoutMode;
  }
  return state;
}

export function getBatchAWorksheetPlan(state) {
  const plan = core.getBatchAWorksheetPlan(state);
  const input = state?.batchA ?? {};
  const controls = normalizedControls(plan.sourceId, {
    ...input,
    layoutMode: plan.sourceId === G4B_U04_SOURCE_ID ? (browserLayoutMode() ?? input.layoutMode) : input.layoutMode,
    contextMode: plan.sourceId === G4B_U04_SOURCE_ID ? (browserContextMode() ?? input.contextMode) : input.contextMode,
  });
  if (plan.sourceId === G4B_U04_SOURCE_ID) {
    const publicControls = {
      questionMode: controls.questionMode,
      layoutMode: controls.layoutMode,
    };
    if (controls.contextMode !== G4B_U04_PUBLIC_CONTROLS.defaults.contextMode) {
      publicControls.contextMode = controls.contextMode;
    }
    return {
      ...plan,
      questionMode: controls.questionMode,
      layoutMode: controls.layoutMode,
      contextMode: controls.contextMode,
      publicControls,
    };
  }
  const profile = getPublicControlProfile(plan.sourceId);
  if (!profile) return plan;
  return {
    ...plan,
    ...controls,
    publicControls: { ...controls },
    publicNPlus2: false,
    publicFormalEquation: false,
    genericFallback: profile.genericFallback ?? false,
    freeFormAI: profile.freeFormAI ?? false,
  };
}

function setControl(state, field, value, controlName) {
  if (!state?.batchA) return state;
  if (state.batchA.sourceId === G4B_U04_SOURCE_ID && field === "questionMode") {
    if (G4B_U04_PUBLIC_CONTROLS.questionModes.includes(value)) state.batchA[field] = value;
  } else if (state.batchA.sourceId === G4B_U04_SOURCE_ID && field === "layoutMode") {
    if (G4B_U04_PUBLIC_CONTROLS.layoutModes.includes(value)) state.batchA[field] = value;
  } else if (state.batchA.sourceId === G4B_U04_SOURCE_ID && field === "contextMode") {
    if (G4B_U04_PUBLIC_CONTROLS.contextModes.includes(value)) state.batchA[field] = value;
  } else {
    const profile = getPublicControlProfile(state.batchA.sourceId);
    const definition = profile?.[controlName];
    if (!definition?.supported || !definition.options.some((option) => option.value === value)) return state;
    state.batchA[field] = value;
  }
  if (state.ui) state.ui.isDirty = true;
  return state;
}

export function setBatchAQuestionMode(state, value) { return setControl(state, "questionMode", value, "questionTypeControl"); }
export function setBatchALayoutMode(state, value) { return setControl(state, "layoutMode", value, "layoutControl"); }
export function setBatchADepthMode(state, value) { return setControl(state, "depthMode", value, "reasoningDepthControl"); }
export function setBatchAContextMode(state, value) { return setControl(state, "contextMode", value, "contextControl"); }

export {
  G4B_U04_PUBLIC_CONTROLS,
  G5A_U08_PUBLIC_CONTROLS,
  getPublicControlProfile,
};
