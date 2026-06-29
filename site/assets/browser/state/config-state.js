import { OPERATORS } from "../../../modules/core/constants.js";
import { getPresetDefinition } from "./presets.js";
import {
  CONFIG_VALIDATION_MESSAGES,
  validateBrowserConfig
} from "./config-validation.js";

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

  state.draftConfig.generation.questionCount = Math.floor(value);

  const allocation = state.draftConfig?.patternPlan?.allocation;
  if (allocation) {
    const normalizedMode = String(allocation.mode ?? "fixedCounts");

    if (normalizedMode === "fixedCounts" && Array.isArray(allocation.fixedCounts) && allocation.fixedCounts.length > 0) {
      const fixedCounts = allocation.fixedCounts;
      const oldTotal = fixedCounts.reduce((sum, item) => sum + (item?.questionCount ?? 0), 0) || 1;

      let assigned = 0;
      const newCounts = fixedCounts.map((item, index) => {
        if (index === fixedCounts.length - 1) {
          return Math.max(1, value - assigned);
        }

        const ratio = (item?.questionCount ?? 1) / oldTotal;
        const nextValue = Math.max(1, Math.round(ratio * value));
        assigned += nextValue;
        return nextValue;
      });

      fixedCounts.forEach((item, index) => {
        if (item) {
          item.questionCount = Math.max(1, newCounts[index] ?? 1);
        }
      });

      const correctedTotal = fixedCounts.reduce((sum, item) => sum + (item?.questionCount ?? 0), 0);
      const delta = value - correctedTotal;
      if (delta !== 0 && fixedCounts.length > 0) {
        fixedCounts[fixedCounts.length - 1].questionCount += delta;
      }
    }

    allocation.totalQuestionCount = Math.floor(value);
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
  state.ui.isDirty = true;
  return state;
}

export function setRowsPerPage(state, rows) {
  const value = Number(rows);
  if (!Number.isFinite(value) || value < 1 || value > 20) {
    return state;
  }

  state.draftConfig.printLayout.rowsPerPage = Math.floor(value);
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

export { CONFIG_VALIDATION_MESSAGES };
