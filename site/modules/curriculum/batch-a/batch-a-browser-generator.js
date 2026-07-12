export * from "./batch-a-browser-generator-core.js";

import * as core from "./batch-a-browser-generator-core.js";
import {
  G5A_U08_PUBLIC_CONTROLS,
  G5A_U08_SOURCE_ID,
} from "../registry/g5a-u08-promotion.js";

function normalize(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

export function normalizeG5AU08PublicControls(options = {}) {
  return Object.freeze({
    questionMode: normalize(
      options.questionMode,
      G5A_U08_PUBLIC_CONTROLS.questionModes,
      G5A_U08_PUBLIC_CONTROLS.defaults.questionMode,
    ),
    depthMode: normalize(
      options.depthMode,
      G5A_U08_PUBLIC_CONTROLS.depthModes,
      G5A_U08_PUBLIC_CONTROLS.defaults.depthMode,
    ),
    contextMode: normalize(
      options.contextMode,
      G5A_U08_PUBLIC_CONTROLS.contextModes,
      G5A_U08_PUBLIC_CONTROLS.defaults.contextMode,
    ),
  });
}

export function buildBatchABrowserPlan(options = {}) {
  const plan = core.buildBatchABrowserPlan(options);
  if (options.sourceId !== G5A_U08_SOURCE_ID) return plan;
  const controls = normalizeG5AU08PublicControls(options);
  return {
    ...plan,
    ...controls,
    publicControls: { ...controls },
    publicNPlus2: false,
    publicFormalEquation: false,
  };
}

export function generateBatchABrowserQuestions(options = {}) {
  return core.generateBatchABrowserQuestions(options);
}
