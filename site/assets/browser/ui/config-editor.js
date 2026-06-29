import {
  getOperatorsEnabled,
  setAnswerMax,
  setColumns,
  setOperandRange,
  setOperatorEnabled,
  setOrderingMode,
  setQuestionCount,
  setRowsPerPage
} from "../state/config-state.js";

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

function formatJson(value, space = 2) {
  return JSON.stringify(value, null, space);
}

function parseEditedJson(rawText) {
  if (!rawText || !String(rawText).trim()) {
    return {
      ok: false,
      error: "JSON 內容不能空白。"
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (error) {
    return {
      ok: false,
      error: `JSON 格式錯誤：${error.message}`
    };
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {
      ok: false,
      error: "編輯結果必須是 JSON 物件。"
    };
  }

  return {
    ok: true,
    value: parsed
  };
}

export function createConfigEditor(options = {}) {
  const { onApplyEdit, onResetPreset, state } = options;

  return {
    syncEditorFromState() {
      const textarea = document.querySelector("#config-json-editor");
      if (!textarea) {
        return;
      }

      textarea.value = formatJson(state.draftConfig);

      const errorPanel = document.querySelector("#json-error-panel");
      if (errorPanel) {
        errorPanel.innerHTML = "";
        errorPanel.dataset.hasError = "false";
      }
    },

    handleEdit() {
      const textarea = document.querySelector("#config-json-editor");
      const errorPanel = document.querySelector("#json-error-panel");

      if (!textarea) {
        return;
      }

      const parseResult = parseEditedJson(textarea.value);

      if (!parseResult.ok) {
        if (errorPanel) {
          errorPanel.innerHTML = `<p>${parseResult.error}</p>`;
          errorPanel.dataset.hasError = "true";
        }
        return;
      }

      if (errorPanel) {
        errorPanel.innerHTML = "";
        errorPanel.dataset.hasError = "false";
      }

      state.draftConfig = cloneValue(parseResult.value);

      if (onApplyEdit) {
        onApplyEdit();
      }
    },

    handleResetPreset() {
      if (onResetPreset) {
        onResetPreset();
      }
    },

    handleQuestionCountChange(value) {
      setQuestionCount(state, value);
      this.syncEditorFromState();
      if (onApplyEdit) {
        onApplyEdit();
      }
    },

    handleColumnsChange(value) {
      setColumns(state, value);
      this.syncEditorFromState();
      if (onApplyEdit) {
        onApplyEdit();
      }
    },

    handleRowsPerPageChange(value) {
      setRowsPerPage(state, value);
      this.syncEditorFromState();
      if (onApplyEdit) {
        onApplyEdit();
      }
    },

    handleOrderingModeChange(value) {
      setOrderingMode(state, value);
      this.syncEditorFromState();
      if (onApplyEdit) {
        onApplyEdit();
      }
    },

    handleOperatorToggle(operator, checked) {
      setOperatorEnabled(state, operator, checked);
      this.syncEditorFromState();
      if (onApplyEdit) {
        onApplyEdit();
      }
    },

    handleOperandRangeChange(position, field, value) {
      setOperandRange(state, position, field, value);
      this.syncEditorFromState();
      if (onApplyEdit) {
        onApplyEdit();
      }
    },

    handleAnswerMaxChange(value) {
      setAnswerMax(state, value);
      this.syncEditorFromState();
      if (onApplyEdit) {
        onApplyEdit();
      }
    },

    syncFormControlsFromState() {
      const questionCountInput = document.querySelector("#question-count-input");
      const columnsInput = document.querySelector("#columns-input");
      const rowsPerPageInput = document.querySelector("#rows-per-page-input");
      const orderingModeSelect = document.querySelector("#ordering-mode-select");

      if (questionCountInput) {
        questionCountInput.value = state.draftConfig.generation.questionCount ?? "";
      }
      if (columnsInput) {
        columnsInput.value = state.draftConfig.printLayout.columns ?? "";
      }
      if (rowsPerPageInput) {
        rowsPerPageInput.value = state.draftConfig.printLayout.rowsPerPage ?? "";
      }
      if (orderingModeSelect) {
        orderingModeSelect.value = state.draftConfig.patternPlan.worksheetOrdering.mode ?? "";
      }

      const enabled = getOperatorsEnabled(state);
      const operatorMap = {
        "operator-add-input": enabled.add,
        "operator-subtract-input": enabled.subtract,
        "operator-multiply-input": enabled.multiply,
        "operator-divide-input": enabled.divide
      };

      for (const [id, checked] of Object.entries(operatorMap)) {
        const element = document.querySelector(`#${id}`);
        if (element) {
          element.checked = checked;
        }
      }

      const ranges = Array.isArray(state?.draftConfig?.expression?.operandRanges)
        ? state.draftConfig.expression.operandRanges
        : [];

      for (let position = 1; position <= 2; position += 1) {
        const range = ranges.find((item) => item?.position === position) ?? { min: "", max: "" };
        const minElement = document.querySelector(`#operand-${position}-min-input`);
        const maxElement = document.querySelector(`#operand-${position}-max-input`);

        if (minElement) {
          minElement.value = range.min ?? "";
        }
        if (maxElement) {
          maxElement.value = range.max ?? "";
        }
      }

      const answerMaxInput = document.querySelector("#answer-max-input");
      if (answerMaxInput) {
        const answerMax = state.draftConfig?.answerConstraint?.max;
        answerMaxInput.value = (answerMax !== null && answerMax !== undefined) ? answerMax : "";
      }
    }
  };
}