import {
  PUBLIC_UI_SAFE_QUESTION_COUNT,
  PUBLIC_UI_SURFACES,
  resolvePublicUiCapabilityBinding,
} from "../modules/curriculum/public/public-ui-capability-binding.js";

const sourceSelect = document.getElementById("pixel-source-select");
const selectionModeSelect = document.getElementById("pixel-selection-mode-select");
const questionSelect = document.getElementById("pixel-g5a-question-mode");
const depthSelect = document.getElementById("pixel-g5a-depth-mode");
const contextSelect = document.getElementById("pixel-g5a-context-mode");
const questionField = document.getElementById("pixel-g5a-question-mode-field");
const depthField = document.getElementById("pixel-g5a-depth-mode-field");
const contextField = document.getElementById("pixel-g5a-context-mode-field");
const help = document.getElementById("pixel-g5a-control-help");
const questionCountInput = document.getElementById("pixel-question-count");
const patternGroupPanel = document.getElementById("pixel-pattern-group-panel");
const knowledgePointPanel = document.getElementById("pixel-kp-panel");

let applying = false;
let scheduled = false;
let lastSignature = "";

function commaList(value) {
  return String(value ?? "").split(",").map((entry) => entry.trim()).filter(Boolean);
}

function populate(select, options, fallbackValue = null) {
  if (!select) return { value: null, changed: false };
  const current = select.value;
  select.replaceChildren();
  for (const row of options) {
    const option = document.createElement("option");
    option.value = row.value;
    option.textContent = row.label;
    select.append(option);
  }
  const nextValue = options.some((row) => row.value === current)
    ? current
    : options.some((row) => row.value === fallbackValue)
      ? fallbackValue
      : options[0]?.value ?? "";
  select.value = nextValue;
  select.disabled = options.length <= 1;
  return { value: nextValue, changed: current !== nextValue };
}

function setVisible(element, visible) {
  if (!element) return;
  element.dataset.visible = visible ? "true" : "false";
  element.hidden = !visible;
}

function clampQuestionCount() {
  if (!questionCountInput) return;
  questionCountInput.min = String(PUBLIC_UI_SAFE_QUESTION_COUNT.min);
  questionCountInput.max = String(PUBLIC_UI_SAFE_QUESTION_COUNT.max);
  const current = Number(questionCountInput.value);
  questionCountInput.value = String(Number.isFinite(current)
    ? Math.min(PUBLIC_UI_SAFE_QUESTION_COUNT.max, Math.max(PUBLIC_UI_SAFE_QUESTION_COUNT.min, Math.trunc(current)))
    : PUBLIC_UI_SAFE_QUESTION_COUNT.default);
  questionCountInput.dataset.capacityStatus = "fail-closed-pending-pgc-r03";
}

function selectedPatternGroupIds() {
  const fromBody = commaList(document.body.dataset.pixelSelectedPatternGroupIds);
  if (fromBody.length > 0) return fromBody;
  return [...(patternGroupPanel?.querySelectorAll('[data-pattern-group-id][data-selected="true"]') ?? [])]
    .map((element) => element.dataset.patternGroupId)
    .filter(Boolean);
}

function bindingInput() {
  return {
    sourceId: document.body.dataset.pixelSelectedSourceId || sourceSelect?.value || null,
    surfaceId: PUBLIC_UI_SURFACES.PIXEL,
    selectionMode: document.body.dataset.pixelSelectionMode || selectionModeSelect?.value || "sourceUnit",
    selectedKnowledgePointIds: commaList(document.body.dataset.pixelSelectedKnowledgePointIds),
    selectedPatternGroupIds: selectedPatternGroupIds(),
    requestedQuestionType: questionSelect?.value ?? null,
  };
}

function applyPatternGroupCompatibility(binding) {
  if (!patternGroupPanel) return;
  const compatible = new Set(binding.compatiblePatternGroupIds);
  for (const button of patternGroupPanel.querySelectorAll("[data-pattern-group-id]")) {
    const enabled = compatible.has(button.dataset.patternGroupId);
    button.hidden = !enabled;
    button.disabled = !enabled;
    button.dataset.compatible = enabled ? "true" : "false";
    button.setAttribute("aria-hidden", enabled ? "false" : "true");
  }
  patternGroupPanel.dataset.compatiblePatternGroupCount = String(compatible.size);
}

function signature(binding) {
  return JSON.stringify({
    sourceId: binding.sourceId,
    selectionMode: binding.selectionMode,
    kps: binding.selectedKnowledgePointIds,
    type: binding.questionType,
    types: binding.availableQuestionTypeOptions.map((row) => row.value),
    groups: binding.compatiblePatternGroupIds,
    depth: binding.depthOptions.map((row) => row.value),
    context: binding.contextOptions.map((row) => row.value),
    blocked: binding.blockedReasons,
  });
}

export function syncPixelPublicCapabilityUi() {
  if (applying) return null;
  applying = true;
  try {
    clampQuestionCount();
    const initial = resolvePublicUiCapabilityBinding(bindingInput());
    const questionResult = populate(questionSelect, initial.availableQuestionTypeOptions, initial.questionType);
    const binding = questionResult.value === initial.questionType
      ? initial
      : resolvePublicUiCapabilityBinding({ ...bindingInput(), requestedQuestionType: questionResult.value });
    const depthResult = populate(depthSelect, binding.depthOptions, binding.depthOptions[0]?.value ?? null);
    const contextResult = populate(contextSelect, binding.contextOptions, binding.contextOptions[0]?.value ?? null);

    setVisible(questionField, !binding.blocked && binding.availableQuestionTypeOptions.length > 0);
    setVisible(depthField, binding.depthOptions.length > 0);
    setVisible(contextField, binding.contextOptions.length > 0);
    setVisible(help, !binding.blocked && binding.availableQuestionTypeOptions.length > 0);
    applyPatternGroupCompatibility(binding);

    if (help) {
      help.textContent = binding.blocked
        ? `目前組合不可產生：${binding.blockedReasons.join("、")}`
        : `題目類型與形式已依 ${binding.selectedKnowledgePointCount} 個知識點過濾；PGC-R03 完成前最多 ${PUBLIC_UI_SAFE_QUESTION_COUNT.max} 題。`;
    }
    document.body.dataset.pixelCapabilityBindingStatus = binding.blocked ? "blocked" : "ready";
    document.body.dataset.pixelCapabilityQuestionType = binding.questionType ?? "";
    document.body.dataset.pixelCapabilityMaxQuestionCount = String(PUBLIC_UI_SAFE_QUESTION_COUNT.max);

    const nextSignature = signature(binding);
    if (nextSignature !== lastSignature) {
      lastSignature = nextSignature;
      document.dispatchEvent(new CustomEvent("pixel:public-capability-binding", { detail: binding }));
    }
    if (questionResult.changed || depthResult.changed || contextResult.changed) {
      questionSelect?.dispatchEvent(new Event("change", { bubbles: true }));
    }
    return binding;
  } finally {
    applying = false;
  }
}

function scheduleSync() {
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(() => {
    scheduled = false;
    syncPixelPublicCapabilityUi();
  });
}

for (const element of [sourceSelect, selectionModeSelect, questionSelect, depthSelect, contextSelect, questionCountInput]) {
  element?.addEventListener("change", scheduleSync);
}
questionCountInput?.addEventListener("input", clampQuestionCount);

new MutationObserver(scheduleSync).observe(document.body, {
  attributes: true,
  attributeFilter: [
    "data-pixel-selected-source-id",
    "data-pixel-selection-mode",
    "data-pixel-selected-knowledge-point-ids",
    "data-pixel-selected-pattern-group-ids",
  ],
});
for (const panel of [knowledgePointPanel, patternGroupPanel, questionField, depthField, contextField]) {
  if (!panel) continue;
  new MutationObserver(scheduleSync).observe(panel, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["data-selected", "data-visible", "disabled"],
  });
}

scheduleSync();
