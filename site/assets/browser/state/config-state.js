export * from "./config-state-core.js";

import * as core from "./config-state-core.js";
import {
  getPublicControlProfile,
  normalizePublicControlValue,
} from "../../../modules/curriculum/registry/public-control-profiles.js";

function normalizedControls(sourceId, input = {}) {
  const profile = getPublicControlProfile(sourceId);
  if (!profile) return {};
  const normalized = {};
  if (profile.questionTypeControl.supported) {
    normalized.questionMode = normalizePublicControlValue(profile, "questionTypeControl", input.questionMode);
  }
  if (profile.reasoningDepthControl.supported) {
    normalized.depthMode = normalizePublicControlValue(profile, "reasoningDepthControl", input.depthMode);
  }
  if (profile.contextControl.supported) {
    normalized.contextMode = normalizePublicControlValue(profile, "contextControl", input.contextMode);
  }
  return normalized;
}

function applyControlsToState(state, input = {}) {
  const normalized = normalizedControls(state?.batchA?.sourceId, input);
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
  const profile = getPublicControlProfile(plan.sourceId);
  if (!profile) return plan;
  const controls = normalizedControls(plan.sourceId, state?.batchA ?? {});
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
  const profile = getPublicControlProfile(state?.batchA?.sourceId);
  const definition = profile?.[controlName];
  if (!state?.batchA || !definition?.supported || !definition.options.some((option) => option.value === value)) return state;
  state.batchA[field] = value;
  if (state.ui) state.ui.isDirty = true;
  return state;
}

export function setBatchAQuestionMode(state, value) {
  return setControl(state, "questionMode", value, "questionTypeControl");
}

export function setBatchADepthMode(state, value) {
  return setControl(state, "depthMode", value, "reasoningDepthControl");
}

export function setBatchAContextMode(state, value) {
  return setControl(state, "contextMode", value, "contextControl");
}

export { getPublicControlProfile };
