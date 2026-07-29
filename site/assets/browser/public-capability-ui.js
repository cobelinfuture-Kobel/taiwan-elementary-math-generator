import "./global-public-layout-controls.js";
import {
  PUBLIC_UI_SAFE_QUESTION_COUNT,
  PUBLIC_UI_SURFACES,
  resolvePublicUiCapabilityBinding,
} from "../../modules/curriculum/public/public-ui-capability-binding.js";

const sourceSelect = document.getElementById("batch-a-source-select");
const selectionModeSelect = document.getElementById("batch-a-selection-mode-select");
const knowledgePointPanel = document.getElementById("batch-a-knowledge-point-panel");
const patternGroupPanel = document.getElementById("batch-a-pattern-group-panel");
const section = document.getElementById("g5a-u08-public-controls");
const questionSelect = document.getElementById("g5a-u08-question-mode");
const depthSelect = document.getElementById("g5a-u08-depth-mode");
const contextSelect = document.getElementById("g5a-u08-context-mode");
const questionCountInput = document.getElementById("batch-a-question-count-input");
const questionField = questionSelect?.closest("label");
const depthField = depthSelect?.closest("label");
const contextField = contextSelect?.closest("label");
const heading = section?.querySelector("h3");
const help = section?.querySelector(".help-text");
const surfaceId = document.body?.dataset.routeKind === "404"
  ? PUBLIC_UI_SURFACES.FALLBACK_404
  : PUBLIC_UI_SURFACES.CLASSIC;

let applying = false;
let scheduled = false;
let lastBindingSignature = "";

function selectedDataIds(panel, attribute) {
  if (!panel) return [];
  const property = attribute.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  return [...panel.querySelectorAll(`[data-${attribute}][data-selected="true"]`)]
    .map((element) => element.dataset[property])
    .filter(Boolean);
}

function populate(select, options, fallbackValue = null) {
  if (!select) return null;
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
  return nextValue;
}

function setFieldVisibility(field, visible) {
  if (!field) return;
  field.hidden = !visible;
  field.dataset.visible = visible ? "true" : "false";
}

function unitLabel() {
  return sourceSelect?.selectedOptions?.[0]?.textContent?.trim() ?? "目前單元";
}

function clampQuestionCount() {
  if (!questionCountInput) return;
  questionCountInput.min = String(PUBLIC_UI_SAFE_QUESTION_COUNT.min);
  questionCountInput.max = String(PUBLIC_UI_SAFE_QUESTION_COUNT.max);
  const current = Number(questionCountInput.value);
  if (!Number.isFinite(current)) {
    questionCountInput.value = String(PUBLIC_UI_SAFE_QUESTION_COUNT.default);
  } else {
    questionCountInput.value = String(Math.min(
      PUBLIC_UI_SAFE_QUESTION_COUNT.max,
      Math.max(PUBLIC_UI_SAFE_QUESTION_COUNT.min, Math.trunc(current)),
    ));
  }
  questionCountInput.dataset.capacityStatus = "fail-closed-pending-pgc-r03";
}

function applyPatternGroupCompatibility(binding) {
  if (!patternGroupPanel) return;
  const compatible = new Set(binding.compatiblePatternGroupIds);
  for (const button of patternGroupPanel.querySelectorAll("[data-pattern-group-id]")) {
    const isCompatible = compatible.has(button.dataset.patternGroupId);
    button.hidden = !isCompatible;
    button.disabled = !isCompatible;
    button.dataset.compatible = isCompatible ? "true" : "false";
    button.setAttribute("aria-hidden", isCompatible ? "false" : "true");
  }
  patternGroupPanel.dataset.compatiblePatternGroupCount = String(compatible.size);
}

function bindingInput() {
  return {
    sourceId: sourceSelect?.value ?? null,
    surfaceId,
    selectionMode: selectionModeSelect?.value ?? "sourceUnit",
    selectedKnowledgePointIds: selectedDataIds(knowledgePointPanel, "knowledge-point-id"),
    selectedPatternGroupIds: selectedDataIds(patternGroupPanel, "pattern-group-id"),
    requestedQuestionType: questionSelect?.value ?? null,
  };
}

function bindingSignature(binding) {
  return JSON.stringify({
    sourceId: binding.sourceId,
    surfaceId: binding.surfaceId,
    selectionMode: binding.selectionMode,
    selectedKnowledgePointIds: binding.selectedKnowledgePointIds,
    questionType: binding.questionType,
    questionTypes: binding.availableQuestionTypeOptions.map((row) => row.value),
    patternGroupIds: binding.compatiblePatternGroupIds,
    depth: binding.depthOptions.map((row) => row.value),
    context: binding.contextOptions.map((row) => row.value),
    blocked: binding.blockedReasons,
  });
}

export function syncPublicCapabilityUi() {
  if (applying) return null;
  applying = true;
  try {
    clampQuestionCount();
    const initial = resolvePublicUiCapabilityBinding(bindingInput());
    const selectedQuestionType = populate(
      questionSelect,
      initial.availableQuestionTypeOptions,
      initial.questionType,
    );
    const binding = selectedQuestionType === initial.questionType
      ? initial
      : resolvePublicUiCapabilityBinding({ ...bindingInput(), requestedQuestionType: selectedQuestionType });

    const visible = !binding.blocked && binding.availableQuestionTypeOptions.length > 0;
    if (section) {
      section.dataset.visible = visible ? "true" : "false";
      section.dataset.sourceId = binding.sourceId ?? "";
      section.dataset.surfaceId = binding.surfaceId;
      section.dataset.questionType = binding.questionType ?? "";
      section.dataset.blocked = binding.blocked ? "true" : "false";
      section.dataset.capacityMax = String(PUBLIC_UI_SAFE_QUESTION_COUNT.max);
      section.setAttribute("aria-label", `${unitLabel()}題目能力設定`);
    }

    setFieldVisibility(questionField, binding.availableQuestionTypeOptions.length > 0);
    populate(depthSelect, binding.depthOptions, binding.depthOptions[0]?.value ?? null);
    populate(contextSelect, binding.contextOptions, binding.contextOptions[0]?.value ?? null);
    setFieldVisibility(depthField, binding.depthOptions.length > 0);
    setFieldVisibility(contextField, binding.contextOptions.length > 0);
    applyPatternGroupCompatibility(binding);

    if (heading) heading.textContent = `${unitLabel()}｜可用題目能力`;
    if (help) {
      help.textContent = binding.blocked
        ? `目前組合不可產生：${binding.blockedReasons.join("、")}`
        : `已依 ${binding.selectedKnowledgePointCount} 個知識點過濾題目類型與形式；題數在 PGC-R03 容量驗證前上限為 ${PUBLIC_UI_SAFE_QUESTION_COUNT.max} 題。`;
    }

    const signature = bindingSignature(binding);
    if (signature !== lastBindingSignature) {
      lastBindingSignature = signature;
      document.dispatchEvent(new CustomEvent("public:capability-binding", {
        detail: {
          ...binding,
          availableQuestionTypeOptions: binding.availableQuestionTypeOptions.map((row) => ({ ...row })),
          compatiblePatternGroups: binding.compatiblePatternGroups.map((row) => ({ ...row })),
          depthOptions: binding.depthOptions.map((row) => ({ ...row })),
          contextOptions: binding.contextOptions.map((row) => ({ ...row })),
        },
      }));
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
    syncPublicCapabilityUi();
  });
}

for (const element of [sourceSelect, selectionModeSelect, questionSelect, depthSelect, contextSelect, questionCountInput]) {
  element?.addEventListener("change", scheduleSync);
}
questionCountInput?.addEventListener("input", clampQuestionCount);

for (const panel of [knowledgePointPanel, patternGroupPanel, sourceSelect]) {
  if (!panel) continue;
  new MutationObserver(scheduleSync).observe(panel, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["data-selected", "data-source-id"],
  });
}

scheduleSync();
