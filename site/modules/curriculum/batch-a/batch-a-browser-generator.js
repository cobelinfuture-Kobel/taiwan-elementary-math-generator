export * from "./batch-a-browser-generator-core.js";

import * as core from "./batch-a-browser-generator-core.js";
import {
  G5A_U08_PUBLIC_CONTROLS,
  G5A_U08_SOURCE_ID,
} from "../registry/g5a-u08-promotion.js";
import {
  G4B_U04_PUBLIC_CONTROLS,
  G4B_U04_SOURCE_ID,
} from "../registry/g4b-u04-promotion.js";
import {
  G4A_U08_PHASE2B_PUBLIC_CONTROLS,
  G4A_U08_SOURCE_ID,
} from "../registry/g4a-u08-phase2b-promotion.js";

function normalize(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

export function normalizeG5AU08PublicControls(options = {}) {
  return Object.freeze({
    questionMode: normalize(options.questionMode, G5A_U08_PUBLIC_CONTROLS.questionModes, G5A_U08_PUBLIC_CONTROLS.defaults.questionMode),
    depthMode: normalize(options.depthMode, G5A_U08_PUBLIC_CONTROLS.depthModes, G5A_U08_PUBLIC_CONTROLS.defaults.depthMode),
    contextMode: normalize(options.contextMode, G5A_U08_PUBLIC_CONTROLS.contextModes, G5A_U08_PUBLIC_CONTROLS.defaults.contextMode),
  });
}

export function normalizeG4BU04PublicControls(options = {}) {
  return Object.freeze({
    questionMode: normalize(options.questionMode, G4B_U04_PUBLIC_CONTROLS.questionModes, G4B_U04_PUBLIC_CONTROLS.defaults.questionMode),
  });
}

export function normalizeG4AU08PublicControls(options = {}) {
  return Object.freeze({
    questionMode: normalize(options.questionMode, G4A_U08_PHASE2B_PUBLIC_CONTROLS.questionModes, G4A_U08_PHASE2B_PUBLIC_CONTROLS.defaults.questionMode),
  });
}

export function buildBatchABrowserPlan(options = {}) {
  const plan = core.buildBatchABrowserPlan(options);
  if (options.sourceId === G4A_U08_SOURCE_ID) {
    const controls = normalizeG4AU08PublicControls(options);
    return {
      ...plan,
      ...controls,
      publicControls: { ...controls },
      requestedKnowledgePointIds: Array.isArray(options.selectedKnowledgePointIds) ? [...options.selectedKnowledgePointIds] : [],
      requestedPatternGroupIds: Array.isArray(options.selectedPatternGroupIds) ? [...options.selectedPatternGroupIds] : [],
      publicPatternSpecInjectionUsed: false,
      genericFallbackAllowed: false,
    };
  }
  if (options.sourceId === G4B_U04_SOURCE_ID) {
    const controls = normalizeG4BU04PublicControls(options);
    return {
      ...plan,
      ...controls,
      publicControls: { ...controls },
      publicPatternSpecInjectionUsed: false,
      genericFallbackAllowed: false,
    };
  }
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
