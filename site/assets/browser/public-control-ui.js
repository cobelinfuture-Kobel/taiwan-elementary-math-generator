import { getPublicControlProfile } from "../../modules/curriculum/registry/public-control-profiles.js";

const sourceSelect = document.getElementById("batch-a-source-select");
const selectionModeSelect = document.getElementById("batch-a-selection-mode-select");
const section = document.getElementById("g5a-u08-public-controls");
const questionSelect = document.getElementById("g5a-u08-question-mode");
const depthSelect = document.getElementById("g5a-u08-depth-mode");
const contextSelect = document.getElementById("g5a-u08-context-mode");
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

function syncPublicControlUi() {
  if (applying) return;
  applying = true;
  try {
    const sourceId = sourceSelect?.value;
    const profile = getPublicControlProfile(sourceId);
    const knowledgePointMode = selectionModeSelect?.value !== "sourceUnit";
    const visible = Boolean(profile && knowledgePointMode);
    if (section) {
      section.dataset.visible = visible ? "true" : "false";
      section.dataset.sourceId = sourceId ?? "";
    }
    if (!profile) return;
    populate(questionSelect, profile.questionTypeControl);
    populate(depthSelect, profile.reasoningDepthControl);
    populate(contextSelect, profile.contextControl);
    if (heading) heading.textContent = sourceId === "g5a_u02_5a02" ? "五上因數進階設定" : "五上整數四則設定";
    if (help) {
      help.textContent = sourceId === "g5a_u02_5a02"
        ? "題目類型、推理深度與情境會取交集；沒有可用題型時會阻擋產生，不會自動回退。"
        : "N+1 每題只增加一個可驗證的語意轉換；不提供 N+2 或正式方程式模式。";
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
    const expected = Boolean(getPublicControlProfile(sourceId) && selectionModeSelect?.value !== "sourceUnit");
    if ((section.dataset.visible === "true") !== expected || section.dataset.sourceId !== (sourceId ?? "")) {
      syncAfterMainHandler();
    }
  }).observe(section, { attributes: true, attributeFilter: ["data-visible", "data-source-id"] });
}

syncAfterMainHandler();
