import * as base from "./config-state.js";
import {
  BATCH_A_SELECTOR_AVAILABILITY,
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint
} from "../../../modules/curriculum/registry/batch-a-selector-equation-extension.js";

export const WORKSHEET_MODES = base.WORKSHEET_MODES;
export const BATCH_A_SELECTION_MODES = base.BATCH_A_SELECTION_MODES;
export const SELECTOR_WARNING_CODES = base.SELECTOR_WARNING_CODES;
export const CONFIG_VALIDATION_MESSAGES = base.CONFIG_VALIDATION_MESSAGES;

const clone = (value) => JSON.parse(JSON.stringify(value));

function visibleGroupIds(kpIds) {
  const ids = new Set();
  for (const kpId of kpIds) {
    for (const group of getVisiblePatternGroupsForKnowledgePoint(kpId)) {
      ids.add(group.patternGroupId);
    }
  }
  return ids;
}

function applyMode(state) {
  state.worksheetMode = state.batchA.selectionMode === BATCH_A_SELECTION_MODES.SOURCE_UNIT
    ? WORKSHEET_MODES.BATCH_A_SOURCE
    : WORKSHEET_MODES.BATCH_A_KNOWLEDGE_POINT;
  state.ui.isDirty = true;
  return state;
}

export function createConfigState(options = {}) {
  const state = base.createConfigState(options);
  state.batchA.selectorAvailability = clone(BATCH_A_SELECTOR_AVAILABILITY);
  return state;
}

export function setBatchASelectorSelection(state, patch = {}) {
  const selectionMode = patch.selectionMode ?? BATCH_A_SELECTION_MODES.SOURCE_UNIT;
  if (selectionMode === BATCH_A_SELECTION_MODES.SOURCE_UNIT) {
    state.batchA.selectionMode = selectionMode;
    state.batchA.selectedKnowledgePointIds = [];
    state.batchA.selectedPatternGroupIds = [];
    state.batchA.selectorAvailability = clone(BATCH_A_SELECTOR_AVAILABILITY);
    return applyMode(state);
  }

  const kpIds = Array.isArray(patch.selectedKnowledgePointIds) ? patch.selectedKnowledgePointIds.filter((kpId) => getVisibleBatchAKnowledgePoint(kpId)) : [];
  const groupSet = visibleGroupIds(kpIds);
  const groupIds = Array.isArray(patch.selectedPatternGroupIds) ? patch.selectedPatternGroupIds.filter((groupId) => groupSet.has(groupId)) : [];
  if (kpIds.length === 0) {
    state.batchA.selectionMode = BATCH_A_SELECTION_MODES.SOURCE_UNIT;
    state.batchA.selectedKnowledgePointIds = [];
    state.batchA.selectedPatternGroupIds = [];
  } else {
    state.batchA.selectionMode = selectionMode;
    state.batchA.selectedKnowledgePointIds = kpIds;
    state.batchA.selectedPatternGroupIds = groupIds;
  }
  state.batchA.selectorAvailability = clone(BATCH_A_SELECTOR_AVAILABILITY);
  state.batchA.selectorWarnings = [];
  return applyMode(state);
}

export const applyPreset = base.applyPreset;
export const setSeedField = base.setSeedField;
export const setLockOrderingSeedToGenerationSeed = base.setLockOrderingSeedToGenerationSeed;
export const setShowAnswerKeyPage = base.setShowAnswerKeyPage;
export const setQuestionCount = base.setQuestionCount;
export const setColumns = base.setColumns;
export const setRowsPerPage = base.setRowsPerPage;
export const setOrderingMode = base.setOrderingMode;
export const setOperatorEnabled = base.setOperatorEnabled;
export const getOperatorsEnabled = base.getOperatorsEnabled;
export const setOperandRange = base.setOperandRange;
export const setAnswerMax = base.setAnswerMax;
export const getEffectiveOrderingSeed = base.getEffectiveOrderingSeed;
export const validateConfigState = base.validateConfigState;
export const setBatchASourceId = base.setBatchASourceId;
export const setBatchAQuestionCount = base.setBatchAQuestionCount;
export const setBatchAOrdering = base.setBatchAOrdering;
export const setBatchAIncludeAnswerKey = base.setBatchAIncludeAnswerKey;
export const setBatchAGenerationSeed = base.setBatchAGenerationSeed;
export const setBatchAPrintLayout = base.setBatchAPrintLayout;
export const setBatchASelectionMode = base.setBatchASelectionMode;
export const setBatchASelectedKnowledgePointIds = base.setBatchASelectedKnowledgePointIds;
export const setBatchASelectedPatternGroupIds = base.setBatchASelectedPatternGroupIds;
export const getBatchAWorksheetPlan = base.getBatchAWorksheetPlan;
export const storeWorksheetResult = base.storeWorksheetResult;
