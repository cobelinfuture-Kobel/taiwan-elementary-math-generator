export * from "./config-state-core.js";

import * as core from "./config-state-core.js";
import {
  G4B_U04_PUBLIC_CONTROLS,
  G4B_U04_SOURCE_ID,
} from "../../../modules/curriculum/registry/g4b-u04-promotion.js";
import {
  G5A_U08_PUBLIC_CONTROLS,
  G5A_U08_SOURCE_ID,
} from "../../../modules/curriculum/registry/g5a-u08-promotion.js";

function normalize(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

function sourceControls(sourceId) {
  if (sourceId === G4B_U04_SOURCE_ID) {
    return {
      questionModes: G4B_U04_PUBLIC_CONTROLS.questionModes,
      defaults: G4B_U04_PUBLIC_CONTROLS.defaults,
      hasDepthMode: false,
      hasContextMode: false,
    };
  }
  if (sourceId === G5A_U08_SOURCE_ID) {
    return {
      questionModes: G5A_U08_PUBLIC_CONTROLS.questionModes,
      depthModes: G5A_U08_PUBLIC_CONTROLS.depthModes,
      contextModes: G5A_U08_PUBLIC_CONTROLS.contextModes,
      defaults: G5A_U08_PUBLIC_CONTROLS.defaults,
      hasDepthMode: true,
      hasContextMode: true,
    };
  }
  return null;
}

function normalizeControls(sourceId, input = {}) {
  const controls = sourceControls(sourceId);
  if (!controls) return {};
  const normalized = {
    questionMode: normalize(input.questionMode, controls.questionModes, controls.defaults.questionMode),
  };
  if (controls.hasDepthMode) {
    normalized.depthMode = normalize(input.depthMode, controls.depthModes, controls.defaults.depthMode);
  }
  if (controls.hasContextMode) {
    normalized.contextMode = normalize(input.contextMode, controls.contextModes, controls.defaults.contextMode);
  }
  return normalized;
}

function applyControlsToState(state, input = {}) {
  const sourceId = state?.batchA?.sourceId;
  const normalized = normalizeControls(sourceId, input);
  if (Object.keys(normalized).length > 0) Object.assign(state.batchA, normalized);
  return state;
}

export function createConfigState(options = {}) {
  const state = core.createConfigState(options);
  return applyControlsToState(state, options.queryState ?? {});
}

export function setBatchASourceId(state, sourceId) {
  core.setBatchASourceId(state, sourceId);
  return applyControlsToState(state, state?.batchA ?? {});
}

export function getBatchAWorksheetPlan(state) {
  const plan = core.getBatchAWorksheetPlan(state);
  const controls = normalizeControls(plan.sourceId, state?.batchA ?? {});
  if (plan.sourceId === G4B_U04_SOURCE_ID) {
    return {
      ...plan,
      questionMode: controls.questionMode,
      publicControls: { questionMode: controls.questionMode },
    };
  }
  if (plan.sourceId === G5A_U08_SOURCE_ID) {
    return {
      ...plan,
      ...controls,
      publicControls: { ...controls },
      publicNPlus2: false,
      publicFormalEquation: false,
    };
  }
  return plan;
}

function setControl(state, field, value, allowed) {
  if (!state?.batchA || !allowed.includes(value)) return state;
  state.batchA[field] = value;
  if (state.ui) state.ui.isDirty = true;
  return state;
}

export function setBatchAQuestionMode(state, value) {
  const controls = sourceControls(state?.batchA?.sourceId);
  if (!controls) return state;
  return setControl(state, "questionMode", value, controls.questionModes);
}

export function setBatchADepthMode(state, value) {
  if (state?.batchA?.sourceId !== G5A_U08_SOURCE_ID) return state;
  return setControl(state, "depthMode", value, G5A_U08_PUBLIC_CONTROLS.depthModes);
}

export function setBatchAContextMode(state, value) {
  if (state?.batchA?.sourceId !== G5A_U08_SOURCE_ID) return state;
  return setControl(state, "contextMode", value, G5A_U08_PUBLIC_CONTROLS.contextModes);
}

export { G4B_U04_PUBLIC_CONTROLS, G5A_U08_PUBLIC_CONTROLS };
