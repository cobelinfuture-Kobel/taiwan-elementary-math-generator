export * from "./config-state-core.js";

import * as core from "./config-state-core.js";
import {
  GLOBAL_PUBLIC_LAYOUT_DEFAULT,
  normalizeGlobalPublicLayout,
} from "../../../modules/curriculum/batch-a/global-public-layout-contract.js";
import {
  G4B_U04_PUBLIC_CONTROLS,
  G4B_U04_SOURCE_ID,
} from "../../../modules/curriculum/registry/g4b-u04-promotion.js";
import {
  G5A_U08_PUBLIC_CONTROLS,
} from "../../../modules/curriculum/registry/g5a-u08-promotion.js";
import {
  getFifteenUnitPublicControlProfile,
  normalizeFifteenUnitPublicControlValue,
} from "../../../modules/curriculum/registry/fifteen-unit-public-control-profiles.js";
import { getPublicControlProfile } from "../../../modules/curriculum/registry/public-control-profiles.js";

function normalizedControls(sourceId, input = {}) {
  const profile = getFifteenUnitPublicControlProfile(sourceId);
  const normalized = {};
  if (profile?.questionTypeControl.supported) {
    normalized.questionMode = normalizeFifteenUnitPublicControlValue(profile, "questionTypeControl", input.questionMode);
  }
  if (profile?.reasoningDepthControl.supported) {
    normalized.depthMode = normalizeFifteenUnitPublicControlValue(profile, "reasoningDepthControl", input.depthMode);
  }
  if (profile?.contextControl.supported) {
    normalized.contextMode = normalizeFifteenUnitPublicControlValue(profile, "contextControl", input.contextMode);
  }
  if (sourceId === G4B_U04_SOURCE_ID) {
    normalized.layoutMode = G4B_U04_PUBLIC_CONTROLS.layoutModes.includes(input.layoutMode)
      ? input.layoutMode
      : G4B_U04_PUBLIC_CONTROLS.defaults.layoutMode;
    if (!normalized.contextMode) {
      normalized.contextMode = G4B_U04_PUBLIC_CONTROLS.contextModes.includes(input.contextMode)
        ? input.contextMode
        : G4B_U04_PUBLIC_CONTROLS.defaults.contextMode;
    }
  }
  return normalized;
}

function applyControlsToState(state, input = {}) {
  const normalized = normalizedControls(state?.batchA?.sourceId, input);
  if (Object.keys(normalized).length > 0) Object.assign(state.batchA, normalized);
  return state;
}

function applyGlobalLayoutToState(state, input = {}, options = {}) {
  if (!state?.batchA) return state;
  const requested = {
    columns: input.columns ?? state.batchA.columns,
    rowsPerPage: input.rowsPerPage ?? state.batchA.rowsPerPage,
  };
  const normalization = normalizeGlobalPublicLayout(requested, {
    allowLegacyMigration: options.allowLegacyMigration !== false,
  });
  if (!normalization.ok) {
    state.batchA.layoutNormalization = normalization;
    return state;
  }
  const explicitRequest = input.columns !== undefined || input.rowsPerPage !== undefined;
  const suppressInitialDefaultMigration = options.suppressInitialDefaultMigration === true
    && !explicitRequest;
  const effectiveNormalization = suppressInitialDefaultMigration
    ? {
      ...normalization,
      requestedLayout: { ...GLOBAL_PUBLIC_LAYOUT_DEFAULT },
      legacyMigrationApplied: false,
      warnings: [],
    }
    : normalization;
  state.batchA.columns = normalization.layout.columns;
  state.batchA.rowsPerPage = normalization.layout.rowsPerPage;
  state.batchA.layoutNormalization = effectiveNormalization;
  if (state.draftConfig?.printLayout) {
    state.draftConfig.printLayout.columns = normalization.layout.columns;
    state.draftConfig.printLayout.rowsPerPage = normalization.layout.rowsPerPage;
  }
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
  applyControlsToState(state, options.queryState ?? {});
  return applyGlobalLayoutToState(state, options.queryState ?? {}, {
    suppressInitialDefaultMigration: true,
  });
}

export function setBatchASourceId(state, sourceId) {
  core.setBatchASourceId(state, sourceId);
  return applyControlsToState(state, {});
}

export function setBatchAPrintLayout(state, patch = {}) {
  applyGlobalLayoutToState(state, {
    columns: patch.columns ?? state?.batchA?.columns,
    rowsPerPage: patch.rowsPerPage ?? state?.batchA?.rowsPerPage,
  });
  if (state?.batchA?.sourceId === G4B_U04_SOURCE_ID) {
    const layoutMode = patch.layoutMode ?? browserLayoutMode();
    if (G4B_U04_PUBLIC_CONTROLS.layoutModes.includes(layoutMode)) state.batchA.layoutMode = layoutMode;
  }
  if (state?.ui) state.ui.isDirty = true;
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
  const globalLayout = input.layoutNormalization ?? normalizeGlobalPublicLayout(plan.printLayout);
  const common = {
    ...plan,
    printLayout: {
      ...plan.printLayout,
      columns: input.columns,
      rowsPerPage: input.rowsPerPage,
    },
    globalLayoutNormalization: globalLayout,
  };
  const profile = getFifteenUnitPublicControlProfile(plan.sourceId);
  if (plan.sourceId === G4B_U04_SOURCE_ID) {
    const publicControls = {
      questionMode: controls.questionMode,
      layoutMode: controls.layoutMode,
    };
    if (controls.contextMode !== G4B_U04_PUBLIC_CONTROLS.defaults.contextMode) {
      publicControls.contextMode = controls.contextMode;
    }
    return {
      ...common,
      ...controls,
      publicControls,
      genericFallback: false,
      freeFormAI: false,
    };
  }
  if (!profile) return common;
  return {
    ...common,
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
  if (state.batchA.sourceId === G4B_U04_SOURCE_ID && field === "layoutMode") {
    if (G4B_U04_PUBLIC_CONTROLS.layoutModes.includes(value)) state.batchA[field] = value;
  } else {
    const profile = getFifteenUnitPublicControlProfile(state.batchA.sourceId);
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
