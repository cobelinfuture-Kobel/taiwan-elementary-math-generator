import { OPERATORS } from "../../../modules/core/constants.js";
import {
  BATCH_A_SELECTOR_AVAILABILITY,
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint
} from "../../../modules/curriculum/registry/batch-a-selector-candidates.js";
import { getPresetDefinition } from "./presets.js";
import {
  CONFIG_VALIDATION_MESSAGES,
  validateBrowserConfig
} from "./config-validation.js";

export const WORKSHEET_MODES = Object.freeze({
  BATCH_A_SOURCE: "batchASource",
  BATCH_A_KNOWLEDGE_POINT: "batchAKnowledgePoint"
});

export const BATCH_A_SELECTION_MODES = Object.freeze({
  SOURCE_UNIT: "sourceUnit",
  SINGLE_KNOWLEDGE_POINT: "singleKnowledgePoint",
  MIXED_KNOWLEDGE_POINTS_SAME_UNIT: "mixedKnowledgePointsSameUnit",
  MIXED_KNOWLEDGE_POINTS_CROSS_UNIT: "mixedKnowledgePointsCrossUnit"
});

export const SELECTOR_WARNING_CODES = Object.freeze({
  SELECTOR_ID_DROPPED: "selector_id_dropped",
  SELECTOR_MODE_FALLBACK: "selector_mode_fallback",
  NO_VISIBLE_KNOWLEDGE_POINTS: "no_visible_knowledge_points"
});

const VALID_SELECTION_MODES = Object.freeze(Object.values(BATCH_A_SELECTION_MODES));

function cloneValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, cloneValue(nestedValue)])
    );
  }

  return value;
}

function positiveInteger(value, fallback, min = 1, max = 200) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function normalizeOrderingMode(ordering) {
  return ["groupedByPattern", "shuffleAcrossPatterns"].includes(ordering) ? ordering : "groupedByPattern";
}

function normalizeSelectionMode(selectionMode) {
  return VALID_SELECTION_MODES.includes(selectionMode) ? selectionMode : BATCH_A_SELECTION_MODES.SOURCE_UNIT;
}

function normalizeIdArray(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((item) => String(item ?? "").trim()).filter(Boolean))];
}

function createSelectorWarning(code, details = {}) {
  return { code, ...details };
}

function createSelectorAvailability() {
  return cloneValue(BATCH_A_SELECTOR_AVAILABILITY);
}

function getVisiblePatternGroupIdSet(knowledgePointIds) {
  const ids = new Set();
  for (const knowledgePointId of knowledgePointIds) {
    for (const group of getVisiblePatternGroupsForKnowledgePoint(knowledgePointId)) {
      if (group?.patternGroupId) ids.add(group.patternGroupId);
    }
  }
  return ids;
}

export function normalizeBatchASelectorState(batchA = {}) {
  const availability = createSelectorAvailability();
  const warnings = Array.isArray(batchA.selectorWarnings) ? cloneValue(batchA.selectorWarnings) : [];
  let selectionMode = normalizeSelectionMode(batchA.selectionMode);

  if (selectionMode === BATCH_A_SELECTION_MODES.SOURCE_UNIT) {
    return {
      selectionMode,
      selectedKnowledgePointIds: [],
      selectedPatternGroupIds: [],
      selectorAvailability: availability,
      selectorWarnings: warnings
    };
  }

  if ((availability.visibleCount ?? 0) <= 0) {
    warnings.push(createSelectorWarning(SELECTOR_WARNING_CODES.NO_VISIBLE_KNOWLEDGE_POINTS, {
      sourceId: batchA.sourceId
    }));
    warnings.push(createSelectorWarning(SELECTOR_WARNING_CODES.SELECTOR_MODE_FALLBACK, {
      from: selectionMode,
      to: BATCH_A_SELECTION_MODES.SOURCE_UNIT
    }));
    selectionMode = BATCH_A_SELECTION_MODES.SOURCE_UNIT;
    return {
      selectionMode,
      selectedKnowledgePointIds: [],
      selectedPatternGroupIds: [],
      selectorAvailability: availability,
      selectorWarnings: warnings
    };
  }

  const requestedKnowledgePointIds = normalizeIdArray(batchA.selectedKnowledgePointIds);
  const selectedKnowledgePointIds = requestedKnowledgePointIds.filter((knowledgePointId) => getVisibleBatchAKnowledgePoint(knowledgePointId));
  const droppedKnowledgePointCount = requestedKnowledgePointIds.length - selectedKnowledgePointIds.length;

  if (droppedKnowledgePointCount > 0) {
    warnings.push(createSelectorWarning(SELECTOR_WARNING_CODES.SELECTOR_ID_DROPPED, {
      field: "knowledgePointIds",
      count: droppedKnowledgePointCount
    }));
  }

  const visiblePatternGroupIds = getVisiblePatternGroupIdSet(selectedKnowledgePointIds);
  const requestedPatternGroupIds = normalizeIdArray(batchA.selectedPatternGroupIds);
  const selectedPatternGroupIds = requestedPatternGroupIds.filter((patternGroupId) => visiblePatternGroupIds.has(patternGroupId));
  const droppedPatternGroupCount = requestedPatternGroupIds.length - selectedPatternGroupIds.length;

  if (droppedPatternGroupCount > 0) {
    warnings.push(createSelectorWarning(SELECTOR_WARNING_CODES.SELECTOR_ID_DROPPED, {
      field: "patternGroupIds",
      count: droppedPatternGroupCount
    }));
  }

  if (selectedKnowledgePointIds.length === 0) {
    warnings.push(createSelectorWarning(SELECTOR_WARNING_CODES.SELECTOR_MODE_FALLBACK, {
      from: selectionMode,
      to: BATCH_A_SELECTION_MODES.SOURCE_UNIT
    }));
    selectionMode = BATCH_A_SELECTION_MODES.SOURCE_UNIT;
    return {
      selectionMode,
      selectedKnowledgePointIds: [],
      selectedPatternGroupIds: [],
      selectorAvailability: availability,
      selectorWarnings: warnings
    };
  }

  return {
    selectionMode,
    selectedKnowledgePointIds,
    selectedPatternGroupIds,
    selectorAvailability: availability,
    selectorWarnings: warnings
  };
}

function createBaseUiState() {
  return {
    isDirty: false,
    isGenerating: false,
    hasRendered: false,
    lastGeneratedAt: null,
    lastError: null
  };
}

function createBaseDerivedState() {
  return {
    validation: null,
    allocation: null,
    worksheetDocument: null,
    renderedHtml: null
  };
}

function createBatchAStateFromConfig(config, options = {}) {
  const baseState = {
    sourceId: options.sourceId ?? "g3a_u02_3a02",
    questionCount: positiveInteger(options.questionCount ?? config?.generation?.questionCount, 20),
    ordering: normalizeOrderingMode(options.ordering ?? config?.patternPlan?.worksheetOrdering?.mode),
    includeAnswerKey: options.includeAnswerKey ?? config?.printLayout?.showAnswerKeyPage ?? true,
    generationSeed: String(options.generationSeed ?? "batch-a-browser"),
    columns: positiveInteger(options.columns ?? config?.printLayout?.columns, 4, 1, 6),
    rowsPerPage: positiveInteger(options.rowsPerPage ?? config?.printLayout?.rowsPerPage, 10, 1, 20)
  };

  return {
    ...baseState,
    ...normalizeBatchASelectorState({
      ...baseState,
      selectionMode: options.selectionMode,
      selectedKnowledgePointIds: options.selectedKnowledgePointIds,
      selectedPatternGroupIds: options.selectedPatternGroupIds,
      selectorWarnings: options.selectorWarnings
    })
  };
}

function syncBatchAFromDraftConfig(state, patch = {}) {
  state.batchA = {
    ...(state.batchA ?? {}),
    ...createBatchAStateFromConfig(state.draftConfig, {
      sourceId: state.batchA?.sourceId,
      generationSeed: state.batchA?.generationSeed,
      selectionMode: state.batchA?.selectionMode,
      selectedKnowledgePointIds: state.batchA?.selectedKnowledgePointIds,
      selectedPatternGroupIds: state.batchA?.selectedPatternGroupIds,
      selectorWarnings: state.batchA?.selectorWarnings,
      ...patch
    })
  };
  state.worksheetMode = state.batchA.selectionMode === BATCH_A_SELECTION_MODES.SOURCE_UNIT
    ? WORKSHEET_MODES.BATCH_A_SOURCE
    : WORKSHEET_MODES.BATCH_A_KNOWLEDGE_POINT;
  return state;
}

function syncOperatorTargets(state) {
  const globalOps = Array.isArray(state?.draftConfig?.expression?.globalOperators)
    ? [...state.draftConfig.expression.globalOperators]
    : [];

  if (Array.isArray(state?.draftConfig?.expression?.operatorSlots) && state.draftConfig.expression.operatorSlots.length > 0) {
    state.draftConfig.expression.operatorSlots[0].allowedOperators = [...globalOps];
  }

  const patterns = state?.draftConfig?.patternPlan?.patternPool?.patterns;
  if (Array.isArray(patterns)) {
    for (const pattern of patterns) {
      if (Array.isArray(pattern?.expressionTemplate?.allowedOperatorsBySlot) && pattern.expressionTemplate.allowedOperatorsBySlot.length > 0) {
        pattern.expressionTemplate.allowedOperatorsBySlot[0] = [...globalOps];
      }
    }
  }
}

export function createConfigState(options = {}) {
  const preset = getPresetDefinition(options.presetId ?? "default");
  const queryState = options.queryState ?? {};
  const draftConfig = cloneValue(preset.draftConfig);
  const batchA = createBatchAStateFromConfig(draftConfig, queryState);

  return {
    version: "1",
    worksheetMode: batchA.selectionMode === BATCH_A_SELECTION_MODES.SOURCE_UNIT
      ? WORKSHEET_MODES.BATCH_A_SOURCE
      : WORKSHEET_MODES.BATCH_A_KNOWLEDGE_POINT,
    presetId: preset.id,
    draftConfig,
    seeds: cloneValue(preset.seeds),
    batchA,
    ui: createBaseUiState(),
    derived: createBaseDerivedState(),
    lastWorksheetDocument: null,
    lastValidation: null
  };
}

export function applyPreset(state, presetId, overrides = {}) {
  const preset = getPresetDefinition(presetId);

  state.presetId = preset.id;
  state.draftConfig = cloneValue(preset.draftConfig);
  state.seeds = {
    ...cloneValue(preset.seeds),
    ...cloneValue(overrides.seeds ?? {})
  };

  if (typeof overrides.showAnswerKeyPage === "boolean") {
    state.draftConfig.printLayout.showAnswerKeyPage = overrides.showAnswerKeyPage;
  }

  state.ui = {
    ...createBaseUiState(),
    isDirty: true
  };
  state.derived = createBaseDerivedState();
  syncBatchAFromDraftConfig(state, {
    includeAnswerKey: state.draftConfig?.printLayout?.showAnswerKeyPage,
    generationSeed: state.seeds?.generationSeed
  });

  return state;
}

export function setSeedField(state, field, value) {
  if (!["generationSeed", "orderingSeed"].includes(field)) {
    return state;
  }

  state.seeds[field] = String(value ?? "");
  if (field === "generationSeed") {
    state.batchA.generationSeed = state.seeds[field];
  }
  state.ui.isDirty = true;
  return state;
}

export function setLockOrderingSeedToGenerationSeed(state, checked) {
  state.seeds.lockOrderingSeedToGenerationSeed = Boolean(checked);
  state.ui.isDirty = true;
  return state;
}

export function setShowAnswerKeyPage(state, checked) {
  state.draftConfig.printLayout.showAnswerKeyPage = Boolean(checked);
  state.batchA.includeAnswerKey = Boolean(checked);
  state.ui.isDirty = true;
  return state;
}

export function setQuestionCount(state, count) {
  const value = Number(count);
  if (!Number.isFinite(value) || value < 1) {
    return state;
  }

  const normalizedValue = Math.floor(value);
  state.draftConfig.generation.questionCount = normalizedValue;
  state.batchA.questionCount = positiveInteger(normalizedValue, state.batchA.questionCount);

  const allocation = state.draftConfig?.patternPlan?.allocation;
  if (allocation) {
    const normalizedMode = String(allocation.mode ?? "fixedCounts");

    if (normalizedMode === "fixedCounts" && Array.isArray(allocation.fixedCounts) && allocation.fixedCounts.length > 0) {
      const fixedCounts = allocation.fixedCounts;
      const oldTotal = fixedCounts.reduce((sum, item) => sum + (item?.questionCount ?? 0), 0) || 1;

      let assigned = 0;
      const newCounts = fixedCounts.map((item, index) => {
        if (index === fixedCounts.length - 1) {
          return Math.max(1, normalizedValue - assigned);
        }

        const ratio = (item?.questionCount ?? 1) / oldTotal;
        const nextValue = Math.max(1, Math.round(ratio * normalizedValue));
        assigned += nextValue;
        return nextValue;
      });

      fixedCounts.forEach((item, index) => {
        if (item) {
          item.questionCount = Math.max(1, newCounts[index] ?? 1);
        }
      });

      const correctedTotal = fixedCounts.reduce((sum, item) => sum + (item?.questionCount ?? 0), 0);
      const delta = normalizedValue - correctedTotal;
      if (delta !== 0 && fixedCounts.length > 0) {
        fixedCounts[fixedCounts.length - 1].questionCount += delta;
      }
    }

    allocation.totalQuestionCount = normalizedValue;
  }

  state.ui.isDirty = true;
  return state;
}

export function setColumns(state, columns) {
  const value = Number(columns);
  if (!Number.isFinite(value) || value < 1 || value > 6) {
    return state;
  }

  state.draftConfig.printLayout.columns = Math.floor(value);
  state.batchA.columns = positiveInteger(value, state.batchA.columns, 1, 6);
  state.ui.isDirty = true;
  return state;
}

export function setRowsPerPage(state, rows) {
  const value = Number(rows);
  if (!Number.isFinite(value) || value < 1 || value > 20) {
    return state;
  }

  state.draftConfig.printLayout.rowsPerPage = Math.floor(value);
  state.batchA.rowsPerPage = positiveInteger(value, state.batchA.rowsPerPage, 1, 20);
  state.ui.isDirty = true;
  return state;
}

export function setOrderingMode(state, mode) {
  const normalizedMode = normalizeOrderingMode(mode);
  if (mode !== normalizedMode) {
    return state;
  }

  state.draftConfig.patternPlan.worksheetOrdering.mode = normalizedMode;
  state.batchA.ordering = normalizedMode;
  state.ui.isDirty = true;
  return state;
}

export function setOperatorEnabled(state, operator, checked) {
  const validOps = [OPERATORS.ADD, OPERATORS.SUBTRACT, OPERATORS.MULTIPLY, OPERATORS.DIVIDE];
  if (!validOps.includes(operator)) {
    return state;
  }

  const globalOps = state?.draftConfig?.expression?.globalOperators;
  if (!Array.isArray(globalOps)) {
    return state;
  }

  const isCurrentlyEnabled = globalOps.includes(operator);
  if (checked && !isCurrentlyEnabled) {
    globalOps.push(operator);
  } else if (!checked && isCurrentlyEnabled) {
    if (globalOps.length === 1) {
      return state;
    }

    const nextOperators = globalOps.filter((candidate) => candidate !== operator);
    globalOps.splice(0, globalOps.length, ...nextOperators);
  }

  syncOperatorTargets(state);
  state.ui.isDirty = true;
  return state;
}

export function getOperatorsEnabled(state) {
  const globalOps = state?.draftConfig?.expression?.globalOperators ?? [];

  return {
    add: globalOps.includes(OPERATORS.ADD),
    subtract: globalOps.includes(OPERATORS.SUBTRACT),
    multiply: globalOps.includes(OPERATORS.MULTIPLY),
    divide: globalOps.includes(OPERATORS.DIVIDE)
  };
}

export function setOperandRange(state, position, field, value) {
  const numValue = Number(value);
  if (!Number.isFinite(numValue)) {
    return state;
  }

  const operandRanges = state?.draftConfig?.expression?.operandRanges;
  if (!Array.isArray(operandRanges) || !["min", "max"].includes(field)) {
    return state;
  }

  const range = operandRanges.find((item) => item?.position === position);
  if (!range) {
    return state;
  }

  range[field] = Math.floor(numValue);
  state.ui.isDirty = true;
  return state;
}

export function setAnswerMax(state, value) {
  const raw = String(value ?? "").trim();
  if (raw === "") {
    state.draftConfig.answerConstraint.max = null;
    state.ui.isDirty = true;
    return state;
  }

  const numValue = Number(value);
  if (!Number.isFinite(numValue) || numValue < 0) {
    return state;
  }

  state.draftConfig.answerConstraint.max = Math.floor(numValue);
  state.ui.isDirty = true;
  return state;
}

export function getEffectiveOrderingSeed(state) {
  const orderingSeed = String(state?.seeds?.orderingSeed ?? "").trim();
  if (orderingSeed) {
    return orderingSeed;
  }

  if (state?.seeds?.lockOrderingSeedToGenerationSeed) {
    return null;
  }

  return "";
}

export function validateConfigState(state) {
  return validateBrowserConfig(state?.draftConfig ?? {});
}

export function setBatchASourceId(state, sourceId) {
  state.batchA.sourceId = sourceId;
  return state;
}

export function setBatchAQuestionCount(state, questionCount) {
  return setQuestionCount(state, questionCount);
}

export function setBatchAOrdering(state, ordering) {
  return setOrderingMode(state, ordering);
}

export function setBatchAIncludeAnswerKey(state, includeAnswerKey) {
  return setShowAnswerKeyPage(state, includeAnswerKey);
}

export function setBatchAGenerationSeed(state, generationSeed) {
  state.batchA.generationSeed = String(generationSeed ?? "batch-a-browser");
  if (state.seeds) {
    state.seeds.generationSeed = state.batchA.generationSeed;
  }
  return state;
}

export function setBatchAPrintLayout(state, patch = {}) {
  if (patch.columns !== undefined) {
    setColumns(state, patch.columns);
  }
  if (patch.rowsPerPage !== undefined) {
    setRowsPerPage(state, patch.rowsPerPage);
  }
  return state;
}

function applyBatchASelectorPatch(state, patch = {}) {
  const normalized = normalizeBatchASelectorState({
    ...state.batchA,
    ...patch
  });
  state.batchA = {
    ...state.batchA,
    ...normalized
  };
  state.worksheetMode = state.batchA.selectionMode === BATCH_A_SELECTION_MODES.SOURCE_UNIT
    ? WORKSHEET_MODES.BATCH_A_SOURCE
    : WORKSHEET_MODES.BATCH_A_KNOWLEDGE_POINT;
  state.ui.isDirty = true;
  return state;
}

export function setBatchASelectionMode(state, selectionMode) {
  return applyBatchASelectorPatch(state, { selectionMode });
}

export function setBatchASelectedKnowledgePointIds(state, selectedKnowledgePointIds = []) {
  return applyBatchASelectorPatch(state, { selectedKnowledgePointIds });
}

export function setBatchASelectedPatternGroupIds(state, selectedPatternGroupIds = []) {
  return applyBatchASelectorPatch(state, { selectedPatternGroupIds });
}

export function setBatchASelectorSelection(state, patch = {}) {
  return applyBatchASelectorPatch(state, {
    selectionMode: patch.selectionMode,
    selectedKnowledgePointIds: patch.selectedKnowledgePointIds,
    selectedPatternGroupIds: patch.selectedPatternGroupIds,
    selectorWarnings: []
  });
}

export function getBatchAWorksheetPlan(state) {
  if (!state.batchA) {
    syncBatchAFromDraftConfig(state);
  }

  return {
    sourceId: state.batchA.sourceId,
    questionCount: state.batchA.questionCount,
    ordering: state.batchA.ordering,
    includeAnswerKey: state.batchA.includeAnswerKey,
    generationSeed: state.batchA.generationSeed,
    selectionMode: state.batchA.selectionMode,
    selectedKnowledgePointIds: cloneValue(state.batchA.selectedKnowledgePointIds ?? []),
    selectedPatternGroupIds: cloneValue(state.batchA.selectedPatternGroupIds ?? []),
    printLayout: {
      columns: state.batchA.columns,
      rowsPerPage: state.batchA.rowsPerPage,
      showAnswerKeyPage: state.batchA.includeAnswerKey
    }
  };
}

export function storeWorksheetResult(state, result) {
  state.lastWorksheetDocument = result?.worksheetDocument ?? null;
  state.lastValidation = result?.validation ?? null;
  if (state.derived) {
    state.derived.worksheetDocument = result?.worksheetDocument ?? null;
  }
  return state;
}

export { CONFIG_VALIDATION_MESSAGES };
