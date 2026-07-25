import { getFullProductPublicControlProfile } from "../modules/curriculum/registry/full-product-public-control-profiles.js";

const sourceSelect = document.getElementById("pixel-source-select");
const questionSelect = document.getElementById("pixel-g5a-question-mode");
const depthSelect = document.getElementById("pixel-g5a-depth-mode");
const contextSelect = document.getElementById("pixel-g5a-context-mode");
const questionField = document.getElementById("pixel-g5a-question-mode-field");
const depthField = document.getElementById("pixel-g5a-depth-mode-field");
const contextField = document.getElementById("pixel-g5a-context-mode-field");
const help = document.getElementById("pixel-g5a-control-help");
let syncing = false;

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

function setVisible(element, definition) {
  if (!element) return;
  const visible = definition?.supported === true;
  element.dataset.visible = visible ? "true" : "false";
  element.hidden = !visible;
}

function syncPixelPublicControls() {
  if (syncing) return;
  syncing = true;
  try {
    const sourceId = sourceSelect?.value ?? "";
    const profile = getFullProductPublicControlProfile(sourceId);
    populate(questionSelect, profile?.questionTypeControl);
    populate(depthSelect, profile?.reasoningDepthControl);
    populate(contextSelect, profile?.contextControl);
    setVisible(questionField, profile?.questionTypeControl);
    setVisible(depthField, profile?.reasoningDepthControl);
    setVisible(contextField, profile?.contextControl);
    if (help) {
      help.dataset.visible = profile ? "true" : "false";
      help.hidden = !profile;
      const hasPbl = profile?.questionTypeControl?.options?.some((row) => row.value === "pbl") === true;
      help.textContent = hasPbl
        ? "可分開產生數字題、應用題與核准 PBL 題組。"
        : "可分開產生數字題與應用題；只有適合生活情境化的知識點會使用應用題。";
    }
    document.body.dataset.pixelPublicControlSourceId = sourceId;
    document.body.dataset.pixelPublicQuestionModeCount = String(profile?.questionTypeControl?.options?.length ?? 0);
  } finally {
    syncing = false;
  }
}

function scheduleSync() {
  queueMicrotask(syncPixelPublicControls);
}

sourceSelect?.addEventListener("change", scheduleSync);
if (sourceSelect) {
  new MutationObserver(scheduleSync).observe(sourceSelect, {
    childList: true,
    attributes: true,
    attributeFilter: ["value"],
  });
}
for (const field of [questionField, depthField, contextField, help]) {
  if (!field) continue;
  new MutationObserver(scheduleSync).observe(field, {
    attributes: true,
    attributeFilter: ["data-visible", "hidden"],
  });
}
scheduleSync();
