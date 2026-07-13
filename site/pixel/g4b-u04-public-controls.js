import {
  G4B_U04_PUBLIC_CONTROLS,
  G4B_U04_SOURCE_ID,
} from "../modules/curriculum/registry/g4b-u04-promotion.js";

export const G4B_U04_PIXEL_PUBLIC_CONTROL_IDS = Object.freeze({
  field: "pixel-g4b-u04-question-mode-field",
  questionMode: "pixel-g4b-u04-question-mode",
  help: "pixel-g4b-u04-control-help",
  proxyQuestionMode: "pixel-g5a-question-mode",
  source: "pixel-source-select",
  selectionMode: "pixel-selection-mode-select",
});

export const G4B_U04_PIXEL_QUESTION_MODE_LABELS = Object.freeze({
  mixed: "全部題型混合",
  concept: "概念判讀",
  numeric: "直接取概數",
  application: "生活應用",
  operation_estimation: "取概數後估算",
  reasoning: "逆推推理",
});

const G4_ONLY_MODES = Object.freeze(["concept", "operation_estimation"]);

function isAllowedMode(value) {
  return G4B_U04_PUBLIC_CONTROLS.questionModes.includes(value);
}

function ensureProxyOptions(proxy, enabled) {
  if (!proxy) return;
  for (const mode of G4_ONLY_MODES) {
    const existing = [...proxy.options].find((option) => option.value === mode);
    if (enabled && !existing) {
      const option = document.createElement("option");
      option.value = mode;
      option.textContent = G4B_U04_PIXEL_QUESTION_MODE_LABELS[mode];
      option.dataset.g4bU04Proxy = "true";
      proxy.append(option);
    }
    if (!enabled && existing?.dataset.g4bU04Proxy === "true") existing.remove();
  }
}

function createField(root) {
  const existing = root.getElementById(G4B_U04_PIXEL_PUBLIC_CONTROL_IDS.field);
  if (existing) return existing;
  const field = root.createElement("label");
  field.className = "pixel-field";
  field.id = G4B_U04_PIXEL_PUBLIC_CONTROL_IDS.field;
  field.dataset.visible = "false";
  const options = G4B_U04_PUBLIC_CONTROLS.questionModes
    .map((mode) => `<option value="${mode}">${G4B_U04_PIXEL_QUESTION_MODE_LABELS[mode]}</option>`)
    .join("");
  field.innerHTML = `<span>概數題目類型</span><select id="${G4B_U04_PIXEL_PUBLIC_CONTROL_IDS.questionMode}">${options}</select>`;
  const grid = root.querySelector(".pixel-setting-grid");
  const seedField = root.getElementById("pixel-generation-seed")?.closest("label");
  if (grid) grid.insertBefore(field, seedField ?? null);

  const help = root.createElement("p");
  help.className = "pixel-help";
  help.id = G4B_U04_PIXEL_PUBLIC_CONTROL_IDS.help;
  help.dataset.visible = "false";
  help.textContent = "可分別產生概數語意、直接取概數、生活應用、估算與逆推題。";
  const planSummary = root.getElementById("pixel-plan-summary");
  planSummary?.before(help);
  return field;
}

export function syncG4BU04PixelPublicControls(root = document) {
  const source = root.getElementById(G4B_U04_PIXEL_PUBLIC_CONTROL_IDS.source);
  const selectionMode = root.getElementById(G4B_U04_PIXEL_PUBLIC_CONTROL_IDS.selectionMode);
  const proxy = root.getElementById(G4B_U04_PIXEL_PUBLIC_CONTROL_IDS.proxyQuestionMode);
  const field = root.getElementById(G4B_U04_PIXEL_PUBLIC_CONTROL_IDS.field) ?? createField(root);
  const select = root.getElementById(G4B_U04_PIXEL_PUBLIC_CONTROL_IDS.questionMode);
  const help = root.getElementById(G4B_U04_PIXEL_PUBLIC_CONTROL_IDS.help);
  const active = source?.value === G4B_U04_SOURCE_ID;
  ensureProxyOptions(proxy, active);
  const visible = active && selectionMode?.value !== "sourceUnit";
  field.dataset.visible = visible ? "true" : "false";
  if (help) help.dataset.visible = visible ? "true" : "false";
  const requested = active && isAllowedMode(proxy?.value)
    ? proxy.value
    : G4B_U04_PUBLIC_CONTROLS.defaults.questionMode;
  if (active && proxy) proxy.value = requested;
  if (select) select.value = requested;
  return Object.freeze({ active, visible, questionMode: requested });
}

export function mountG4BU04PixelPublicControls(root = document) {
  createField(root);
  const source = root.getElementById(G4B_U04_PIXEL_PUBLIC_CONTROL_IDS.source);
  const selectionMode = root.getElementById(G4B_U04_PIXEL_PUBLIC_CONTROL_IDS.selectionMode);
  const proxy = root.getElementById(G4B_U04_PIXEL_PUBLIC_CONTROL_IDS.proxyQuestionMode);
  const select = root.getElementById(G4B_U04_PIXEL_PUBLIC_CONTROL_IDS.questionMode);
  const sync = () => syncG4BU04PixelPublicControls(root);
  source?.addEventListener("change", sync);
  selectionMode?.addEventListener("change", sync);
  proxy?.addEventListener("change", () => {
    if (source?.value === G4B_U04_SOURCE_ID && select && isAllowedMode(proxy.value)) select.value = proxy.value;
  });
  select?.addEventListener("change", () => {
    if (!proxy || source?.value !== G4B_U04_SOURCE_ID || !isAllowedMode(select.value)) return;
    ensureProxyOptions(proxy, true);
    proxy.value = select.value;
    proxy.dispatchEvent(new Event("change", { bubbles: true }));
  });
  sync();
  return root.getElementById(G4B_U04_PIXEL_PUBLIC_CONTROL_IDS.field);
}

if (typeof document !== "undefined") mountG4BU04PixelPublicControls(document);
