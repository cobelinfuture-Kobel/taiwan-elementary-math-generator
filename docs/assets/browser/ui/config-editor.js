import {
  applyPreset,
  setColumns,
  setOrderingMode,
  setQuestionCount,
  setRowsPerPage,
  setShowAnswerKeyPage
} from "../state/config-state.js";
import { getPresetDefinition } from "../state/presets.js";

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
      error: "JSON 內容為空。"
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (error) {
    return {
      ok: false,
      error: `JSON 解析錯誤：${error.message}`
    };
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {
      ok: false,
      error: "設定必須是 JSON 物件。"
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

      const rawText = textarea.value;
      const parseResult = parseEditedJson(rawText);

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
    }
  };
}