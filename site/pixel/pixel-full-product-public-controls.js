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
let scheduled = false;

function optionSignature(definition) {
  return (definition?.options ?? []).map((row) => `${row.value}:${row.label}`).join("|");
}

function populate(select, definition) {
  if (!select || !definition?.supported) return;
  const desiredSignature = optionSignature(definition);
  const currentSignature = [...select.options].map((row) => `${row.value}:${row.textContent}`).join("|");
  const currentValue = select.value;
  if (desiredSignature !== currentSignature) {
    select.replaceChildren();
    for (const row of definition.options) {
      const option = document.createElement("option");
      option.value = row.value;
      option.textContent = row.label;
      select.append(option);
    }
  }
  const nextValue = definition.options.some((row) => row.value === currentValue)
    ? currentValue
    : definition.defaultValue;
  if (select.value !== nextValue) select.value = nextValue;
}

function setVisible(element, definition) {
  if (!element) return;
  const visible = definition?.supported === true;
  const value = visible ? "true" : "false";
  if (element.dataset.visible !== value) element.dataset.visible = value;
  if (element.hidden === visible) element.hidden = !visible;
}

function setBodyData(name, value) {
  if (document.body.dataset[name] !== value) document.body.dataset[name] = value;
}

function syncPixelPublicControls() {
  scheduled = false;
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
      const visible = Boolean(profile);
      const value = visible ? "true" : "false";
      if (help.dataset.visible !== value) help.dataset.visible = value;
      if (help.hidden === visible) help.hidden = !visible;
      const hasPbl = profile?.questionTypeControl?.options?.some((row) => row.value === "pbl") === true;
      const text = hasPbl
        ? "可分開產生數字題、應用題與核准 PBL 題組。"
        : "可分開產生數字題與應用題；只有適合生活情境化的知識點會使用應用題。";
      if (help.textContent !== text) help.textContent = text;
    }
    setBodyData("pixelPublicControlSourceId", sourceId);
    setBodyData("pixelPublicQuestionModeCount", String(profile?.questionTypeControl?.options?.length ?? 0));
  } finally {
    syncing = false;
  }
}

function scheduleSync() {
  if (scheduled) return;
  scheduled = true;
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
