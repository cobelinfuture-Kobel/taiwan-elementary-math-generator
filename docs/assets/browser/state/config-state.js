import { getPresetDefinition } from "./presets.js";

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

export function createConfigState(options = {}) {
  const preset = getPresetDefinition(options.presetId ?? "default");

  return {
    version: "1",
    presetId: preset.id,
    draftConfig: cloneValue(preset.draftConfig),
    seeds: cloneValue(preset.seeds),
    ui: createBaseUiState(),
    derived: createBaseDerivedState()
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

  return state;
}

export function setSeedField(state, field, value) {
  if (!["generationSeed", "orderingSeed"].includes(field)) {
    return state;
  }

  state.seeds[field] = String(value ?? "");
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
  state.ui.isDirty = true;
  return state;
}

export function setQuestionCount(state, count) {
  const value = Number(count);
  if (!Number.isFinite(value) || value < 1) {
    return state;
  }
  state.draftConfig.generation.questionCount = value;

  // Keep patternPlan.allocation in sync so config validation passes.
  // allocation.totalQuestionCount must equal generation.questionCount,
  // and for fixedCounts mode the item counts must sum to the new value.
  const allocation = state.draftConfig?.patternPlan?.allocation;
  if (allocation) {
    const normalizedMode = String(allocation.mode ?? "fixedCounts");

    if (normalizedMode === "fixedCounts" && Array.isArray(allocation.fixedCounts) && allocation.fixedCounts.length > 0) {
      const fixedCounts = allocation.fixedCounts;
      const oldTotal = fixedCounts.reduce((sum, item) => sum + (item?.questionCount ?? 0), 0) || 1;

      // Proportionally redistribute the new question count across patterns,
      // ensuring every pattern gets at least 1 question.
      let remaining = value;
      const newCounts = fixedCounts.map((item, index) => {
        if (index === fixedCounts.length - 1) {
          return Math.max(1, remaining);
        }
        const share = Math.max(1, Math.round((item?.questionCount ?? 1) / oldTotal * value));
        remaining -= share;
        return share;
      });

      let cursor = 0;
      for (const item of fixedCounts) {
        if (item && typeof item.questionCount === "number") {
          item.questionCount = Math.max(1, newCounts[cursor] ?? 1);
        }
        cursor += 1;
      }
    }

    allocation.totalQuestionCount = value;
  }

  state.ui.isDirty = true;
  return state;
}

export function setColumns(state, columns) {
  const value = Number(columns);
  if (!Number.isFinite(value) || value < 1 || value > 6) {
    return state;
  }
  state.draftConfig.printLayout.columns = value;
  state.ui.isDirty = true;
  return state;
}

export function setRowsPerPage(state, rows) {
  const value = Number(rows);
  if (!Number.isFinite(value) || value < 1 || value > 20) {
    return state;
  }
  state.draftConfig.printLayout.rowsPerPage = value;
  state.ui.isDirty = true;
  return state;
}

export function setOrderingMode(state, mode) {
  const validModes = ["groupedByPattern", "shuffleAcrossPatterns"];
  if (!validModes.includes(mode)) {
    return state;
  }
  state.draftConfig.patternPlan.worksheetOrdering.mode = mode;
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
