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
  getFullProductPublicControlProfile,
  normalizeFullProductPublicControlValue,
} from "../../../modules/curriculum/registry/full-product-public-control-profiles.js";
import { getPublicControlProfile } from "../../../modules/curriculum/registry/public-control-profiles.js";

const P05F1_G3A_U05_SOURCE_ID = "g3a_u05_3a05";
const P05F2_G3A_U09_SOURCE_ID = "g3a_u09_3a09";
const P05F3_G3B_U05_SOURCE_ID = "g3b_u05_3b05";
const P05F4_G4B_U02_SOURCE_ID = "g4b_u02_4b02";
const P05F5_G4B_U10_SOURCE_ID = "g4b_u10_4b10";
const P05F6_G5A_U07_SOURCE_ID = "g5a_u07_5a07";
const P05F7_G5A_U10A_SOURCE_ID = "g5a_u10_5a10a";
const P05F8_G5A_U10A1_SOURCE_ID = "g5a_u10_5a10a1";
const P05F9_G5B_U10A_SOURCE_ID = "g5b_u10_5b10a";
const P05F9_G5B_U10A_KP_ID = "kp_g5b_u10a_large_area_unit_identity";
function isP05FDiagramSelection(sourceId, input = {}) {
  if (sourceId === P05F1_G3A_U05_SOURCE_ID || sourceId === P05F2_G3A_U09_SOURCE_ID || sourceId === P05F3_G3B_U05_SOURCE_ID || sourceId === P05F4_G4B_U02_SOURCE_ID || sourceId === P05F5_G4B_U10_SOURCE_ID || sourceId === P05F6_G5A_U07_SOURCE_ID || sourceId === P05F7_G5A_U10A_SOURCE_ID || sourceId === P05F8_G5A_U10A1_SOURCE_ID) return true;
  const selected = input.selectedKnowledgePointIds ?? input.knowledgePointIds ?? [];
  return sourceId === P05F9_G5B_U10A_SOURCE_ID && input.selectionMode !== "sourceUnit" && selected.includes(P05F9_G5B_U10A_KP_ID);
}

function normalizedControls(sourceId, input = {}) {
  if (isP05FDiagramSelection(sourceId, input)) return { questionMode: "diagram" };
  const profile = getFullProductPublicControlProfile(sourceId);
  const normalized = {};
  if (profile?.questionTypeControl.supported) normalized.questionMode = normalizeFullProductPublicControlValue(profile, "questionTypeControl", input.questionMode);
  if (profile?.reasoningDepthControl.supported) normalized.depthMode = normalizeFullProductPublicControlValue(profile, "reasoningDepthControl", input.depthMode);
  if (profile?.contextControl.supported) normalized.contextMode = normalizeFullProductPublicControlValue(profile, "contextControl", input.contextMode);
  if (sourceId === G4B_U04_SOURCE_ID) {
    normalized.layoutMode = G4B_U04_PUBLIC_CONTROLS.layoutModes.includes(input.layoutMode) ? input.layoutMode : G4B_U04_PUBLIC_CONTROLS.defaults.layoutMode;
    if (!normalized.contextMode) normalized.contextMode = G4B_U04_PUBLIC_CONTROLS.contextModes.includes(input.contextMode) ? input.contextMode : G4B_U04_PUBLIC_CONTROLS.defaults.contextMode;
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
  const requested = { columns: input.columns ?? state.batchA.columns, rowsPerPage: input.rowsPerPage ?? state.batchA.rowsPerPage };
  const normalization = normalizeGlobalPublicLayout(requested, { allowLegacyMigration: options.allowLegacyMigration !== false });
  if (!normalization.ok) { state.batchA.layoutNormalization = normalization; return state; }
  const explicitRequest = input.columns !== undefined || input.rowsPerPage !== undefined;
  const suppressInitialDefaultMigration = options.suppressInitialDefaultMigration === true && !explicitRequest;
  const effectiveNormalization = suppressInitialDefaultMigration ? { ...normalization, requestedLayout: { ...GLOBAL_PUBLIC_LAYOUT_DEFAULT }, legacyMigrationApplied: false, warnings: [] } : normalization;
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
  const value = document.getElementById("g4b-u04-layout-mode")?.value ?? document.getElementById("pixel-g4b-u04-layout-mode")?.value;
  return G4B_U04_PUBLIC_CONTROLS.layoutModes.includes(value) ? value : null;
}
function browserContextMode() {
  if (typeof document === "undefined") return null;
  const value = document.getElementById("g4b-u04-context-mode")?.value ?? document.getElementById("pixel-g4b-u04-context-mode")?.value;
  return G4B_U04_PUBLIC_CONTROLS.contextModes.includes(value) ? value : null;
}

export function createConfigState(options = {}) {
  const state = core.createConfigState(options);
  applyControlsToState(state, { ...(options.queryState ?? {}), ...(state.batchA ?? {}) });
  return applyGlobalLayoutToState(state, options.queryState ?? {}, { suppressInitialDefaultMigration: true });
}
export function setBatchASourceId(state, sourceId) { core.setBatchASourceId(state, sourceId); return applyControlsToState(state, state.batchA ?? {}); }
export function setBatchASelectionMode(state, value) { core.setBatchASelectionMode(state, value); return applyControlsToState(state, state.batchA ?? {}); }
export function setBatchASelectedKnowledgePointIds(state, value = []) { core.setBatchASelectedKnowledgePointIds(state, value); return applyControlsToState(state, state.batchA ?? {}); }
export function setBatchASelectedPatternGroupIds(state, value = []) { core.setBatchASelectedPatternGroupIds(state, value); return applyControlsToState(state, state.batchA ?? {}); }
export function setBatchASelectorSelection(state, patch = {}) { core.setBatchASelectorSelection(state, patch); return applyControlsToState(state, state.batchA ?? {}); }
export function setBatchAPrintLayout(state, patch = {}) {
  applyGlobalLayoutToState(state, { columns: patch.columns ?? state?.batchA?.columns, rowsPerPage: patch.rowsPerPage ?? state?.batchA?.rowsPerPage });
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
    printLayout: { ...plan.printLayout, columns: input.columns, rowsPerPage: input.rowsPerPage },
    globalLayoutNormalization: globalLayout,
  };
  if (isP05FDiagramSelection(plan.sourceId, input)) {
    return { ...common, questionMode: "diagram", publicControls: { questionMode: "diagram" }, genericFallback: false, freeFormAI: false };
  }
  const profile = getFullProductPublicControlProfile(plan.sourceId);
  if (plan.sourceId === G4B_U04_SOURCE_ID) {
    const publicControls = { questionMode: controls.questionMode, layoutMode: controls.layoutMode };
    if (controls.contextMode !== G4B_U04_PUBLIC_CONTROLS.defaults.contextMode) publicControls.contextMode = controls.contextMode;
    return { ...common, ...controls, publicControls, genericFallback: false, freeFormAI: false };
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
  if (isP05FDiagramSelection(state.batchA.sourceId, state.batchA) && field === "questionMode") {
    state.batchA.questionMode = "diagram";
  } else if (state.batchA.sourceId === G4B_U04_SOURCE_ID && field === "layoutMode") {
    if (G4B_U04_PUBLIC_CONTROLS.layoutModes.includes(value)) state.batchA[field] = value;
  } else {
    const profile = getFullProductPublicControlProfile(state.batchA.sourceId);
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

export { G4B_U04_PUBLIC_CONTROLS, G5A_U08_PUBLIC_CONTROLS, getPublicControlProfile, getFullProductPublicControlProfile };
