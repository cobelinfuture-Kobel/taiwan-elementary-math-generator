export * from "./config-state-core.js";

import * as core from "./config-state-core.js";
import {
  G5A_U08_PUBLIC_CONTROLS,
  G5A_U08_SOURCE_ID,
} from "../../../modules/curriculum/registry/g5a-u08-promotion.js";

function normalize(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

function normalizeControls(input = {}) {
  return {
    questionMode: normalize(input.questionMode, G5A_U08_PUBLIC_CONTROLS.questionModes, G5A_U08_PUBLIC_CONTROLS.defaults.questionMode),
    depthMode: normalize(input.depthMode, G5A_U08_PUBLIC_CONTROLS.depthModes, G5A_U08_PUBLIC_CONTROLS.defaults.depthMode),
    contextMode: normalize(input.contextMode, G5A_U08_PUBLIC_CONTROLS.contextModes, G5A_U08_PUBLIC_CONTROLS.defaults.contextMode),
  };
}

function applyControlsToState(state, input = {}) {
  if (state?.batchA?.sourceId !== G5A_U08_SOURCE_ID) return state;
  Object.assign(state.batchA, normalizeControls(input));
  return state;
}

export function createConfigState(options = {}) {
  const state = core.createConfigState(options);
  return applyControlsToState(state, options.queryState ?? {});
}

export function getBatchAWorksheetPlan(state) {
  const plan = core.getBatchAWorksheetPlan(state);
  if (plan.sourceId !== G5A_U08_SOURCE_ID) return plan;
  const controls = normalizeControls(state?.batchA ?? {});
  return {
    ...plan,
    ...controls,
    publicControls: { ...controls },
    publicNPlus2: false,
    publicFormalEquation: false,
  };
}

function setControl(state, field, value, allowed) {
  if (state?.batchA?.sourceId !== G5A_U08_SOURCE_ID || !allowed.includes(value)) return state;
  state.batchA[field] = value;
  if (state.ui) state.ui.isDirty = true;
  return state;
}

export function setBatchAQuestionMode(state, value) {
  return setControl(state, "questionMode", value, G5A_U08_PUBLIC_CONTROLS.questionModes);
}

export function setBatchADepthMode(state, value) {
  return setControl(state, "depthMode", value, G5A_U08_PUBLIC_CONTROLS.depthModes);
}

export function setBatchAContextMode(state, value) {
  return setControl(state, "contextMode", value, G5A_U08_PUBLIC_CONTROLS.contextModes);
}

export { G5A_U08_PUBLIC_CONTROLS };
