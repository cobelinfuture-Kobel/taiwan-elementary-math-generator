import "./global-public-layout-controls.js";
import { getFifteenUnitPublicControlProfile } from "../../modules/curriculum/registry/fifteen-unit-public-control-profiles.js";

const sourceSelect = document.getElementById("batch-a-source-select");
const selectionModeSelect = document.getElementById("batch-a-selection-mode-select");
const section = document.getElementById("g5a-u08-public-controls");
const questionSelect = document.getElementById("g5a-u08-question-mode");
const depthSelect = document.getElementById("g5a-u08-depth-mode");
const contextSelect = document.getElementById("g5a-u08-context-mode");
const questionField = questionSelect?.closest("label");
const depthField = depthSelect?.closest("label");
const contextField = contextSelect?.closest("label");
const heading = section?.querySelector("h3");
const help = section?.querySelector(".help-text");
let applying = false;

function populate(select, definition) {
  if (!select || !definition?.supported) return;
  const current = select.value;
  select.replaceChildren();
  for (const row of definition.options) {
    const option = document.createElement("option");
    option.value = row.value;
    option.textContent = row.label;
    select.append(option);
  }
  select.value = definition.options.some((row) => row.value === current)
    ? current
    : definition.defaultValue;
}

function setFieldVisibility(field, definition) {
  if (!field) return;
  field.hidden = definition?.supported !== true;
  field.dataset.visible = definition?.supported === true ? "true" : "false";
}

function unitLabel() {
  return sourceSelect?.selectedOptions?.[0]?.textContent?.trim() ?? "目前單元";
}

function syncPublicControlUi() {
  if (applying) return;
  applying = true;
  try {
    const sourceId = sourceSelect?.value;
    const profile = getFifteenUnitPublicControlProfile(sourceId);
    const visible = Boolean(profile);
    if (section) {
      section.dataset.visible = visible ? "true" : "false";
      section.dataset.sourceId = sourceId ?? "";
      section.setAttribute("aria-label", `${unitLabel()}題目類型設定`);
    }
    if (!profile) return;
    populate(questionSelect, profile.questionTypeControl);
    populate(depthSelect, profile.reasoningDepthControl);
    populate(contextSelect, profile.contextControl);
    setFieldVisibility(questionField, profile.questionTypeControl);
    setFieldVisibility(depthField, profile.reasoningDepthControl);
    setFieldVisibility(contextField, profile.contextControl);
    if (heading) heading.textContent = `${unitLabel()}｜題目類型`;
    if (help) {
      const pblEnabled = profile.questionTypeControl.options.some((option) => option.value === "pbl");
      help.textContent = pblEnabled
        ? "可分開產生數字題、應用題與核准 PBL 題組；PBL 會完整保留共同題幹、相依小題與最終決策。"
        : "可分開產生數字題與應用題；此單元未核准 PBL，因此不顯示 PBL 選項。";
    }
  } finally {
    applying = false;
  }
}

function syncAfterMainHandler() {
  queueMicrotask(syncPublicControlUi);
}

sourceSelect?.addEventListener("change", syncAfterMainHandler);
selectionModeSelect?.addEventListener("change", syncAfterMainHandler);
for (const select of [questionSelect, depthSelect, contextSelect]) {
  select?.addEventListener("change", syncAfterMainHandler);
}

if (section) {
  new MutationObserver(() => {
    const sourceId = sourceSelect?.value;
    const expected = Boolean(getFifteenUnitPublicControlProfile(sourceId));
    if ((section.dataset.visible === "true") !== expected || section.dataset.sourceId !== (sourceId ?? "")) {
      syncAfterMainHandler();
    }
  }).observe(section, { attributes: true, attributeFilter: ["data-visible", "data-source-id"] });
}

syncAfterMainHandler();
