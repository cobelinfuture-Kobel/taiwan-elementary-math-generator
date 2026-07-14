import {
  G4B_U04_PUBLIC_CONTROLS,
  G4B_U04_SOURCE_ID,
} from "../modules/curriculum/registry/g4b-u04-promotion.js";

export const G4B_U04_PIXEL_PUBLIC_CONTROL_IDS = Object.freeze({
  field: "pixel-g4b-u04-question-mode-field",
  questionMode: "pixel-g4b-u04-question-mode",
  layoutField: "pixel-g4b-u04-layout-mode-field",
  layoutMode: "pixel-g4b-u04-layout-mode",
  help: "pixel-g4b-u04-control-help",
  proxyQuestionMode: "pixel-g5a-question-mode",
  proxyLayoutChange: "pixel-columns",
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

export const G4B_U04_PIXEL_LAYOUT_MODE_LABELS = Object.freeze({
  auto_safe: "自動安全版面",
  custom_with_caps: "自訂欄列（安全上限）",
});

const G4_ONLY_MODES = Object.freeze(["concept", "operation_estimation"]);

function isAllowedMode(value) {
  return G4B_U04_PUBLIC_CONTROLS.questionModes.includes(value);
}

function isAllowedLayoutMode(value) {
  return G4B_U04_PUBLIC_CONTROLS.layoutModes.includes(value);
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

function createControls(root) {
  let questionField = root.getElementById(G4B_U04_PIXEL_PUBLIC_CONTROL_IDS.field);
  let layoutField = root.getElementById(G4B_U04_PIXEL_PUBLIC_CONTROL_IDS.layoutField);
  const grid = root.querySelector(".pixel-setting-grid");
  const seedField = root.getElementById("pixel-generation-seed")?.closest("label");

  if (!questionField) {
    questionField = root.createElement("label");
    questionField.className = "pixel-field";
    questionField.id = G4B_U04_PIXEL_PUBLIC_CONTROL_IDS.field;
    questionField.dataset.visible = "false";
    const options = G4B_U04_PUBLIC_CONTROLS.questionModes
      .map((mode) => `<option value="${mode}">${G4B_U04_PIXEL_QUESTION_MODE_LABELS[mode]}</option>`)
      .join("");
    questionField.innerHTML = `<span>概數題目類型</span><select id="${G4B_U04_PIXEL_PUBLIC_CONTROL_IDS.questionMode}">${options}</select>`;
    if (grid) grid.insertBefore(questionField, seedField ?? null);
  }

  if (!layoutField) {
    layoutField = root.createElement("label");
    layoutField.className = "pixel-field";
    layoutField.id = G4B_U04_PIXEL_PUBLIC_CONTROL_IDS.layoutField;
    layoutField.dataset.visible = "false";
    const options = G4B_U04_PUBLIC_CONTROLS.layoutModes
      .map((mode) => `<option value="${mode}">${G4B_U04_PIXEL_LAYOUT_MODE_LABELS[mode]}</option>`)
      .join("");
    layoutField.innerHTML = `<span>概數版面模式</span><select id="${G4B_U04_PIXEL_PUBLIC_CONTROL_IDS.layoutMode}">${options}</select>`;
    if (grid) grid.insertBefore(layoutField, seedField ?? null);
  }

  let help = root.getElementById(G4B_U04_PIXEL_PUBLIC_CONTROL_IDS.help);
  if (!help) {
    help = root.createElement("p");
    help.className = "pixel-help";
    help.id = G4B_U04_PIXEL_PUBLIC_CONTROL_IDS.help;
    help.dataset.visible = "false";
    help.textContent = "自動安全版面依題型套用欄列；自訂模式可降低密度，超過上限時會顯示實際套用版面。";
    const planSummary = root.getElementById("pixel-plan-summary");
    planSummary?.before(help);
  }
  return { questionField, layoutField, help };
}

export function syncG4BU04PixelPublicControls(root = document) {
  const source = root.getElementById(G4B_U04_PIXEL_PUBLIC_CONTROL_IDS.source);
  const selectionMode = root.getElementById(G4B_U04_PIXEL_PUBLIC_CONTROL_IDS.selectionMode);
  const proxy = root.getElementById(G4B_U04_PIXEL_PUBLIC_CONTROL_IDS.proxyQuestionMode);
  const { questionField, layoutField, help } = createControls(root);
  const select = root.getElementById(G4B_U04_PIXEL_PUBLIC_CONTROL_IDS.questionMode);
  const layoutSelect = root.getElementById(G4B_U04_PIXEL_PUBLIC_CONTROL_IDS.layoutMode);
  const active = source?.value === G4B_U04_SOURCE_ID;
  ensureProxyOptions(proxy, active);
  const visible = active && selectionMode?.value !== "sourceUnit";
  questionField.dataset.visible = visible ? "true" : "false";
  layoutField.dataset.visible = visible ? "true" : "false";
  if (help) help.dataset.visible = visible ? "true" : "false";
  const requested = active && isAllowedMode(proxy?.value)
    ? proxy.value
    : G4B_U04_PUBLIC_CONTROLS.defaults.questionMode;
  const layoutMode = isAllowedLayoutMode(layoutSelect?.value)
    ? layoutSelect.value
    : G4B_U04_PUBLIC_CONTROLS.defaults.layoutMode;
  if (active && proxy) proxy.value = requested;
  if (select) select.value = requested;
  if (layoutSelect) layoutSelect.value = layoutMode;
  return Object.freeze({ active, visible, questionMode: requested, layoutMode });
}

export function mountG4BU04PixelPublicControls(root = document) {
  createControls(root);
  const source = root.getElementById(G4B_U04_PIXEL_PUBLIC_CONTROL_IDS.source);
  const selectionMode = root.getElementById(G4B_U04_PIXEL_PUBLIC_CONTROL_IDS.selectionMode);
  const proxy = root.getElementById(G4B_U04_PIXEL_PUBLIC_CONTROL_IDS.proxyQuestionMode);
  const proxyLayoutChange = root.getElementById(G4B_U04_PIXEL_PUBLIC_CONTROL_IDS.proxyLayoutChange);
  const select = root.getElementById(G4B_U04_PIXEL_PUBLIC_CONTROL_IDS.questionMode);
  const layoutSelect = root.getElementById(G4B_U04_PIXEL_PUBLIC_CONTROL_IDS.layoutMode);
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
  layoutSelect?.addEventListener("change", () => {
    if (source?.value !== G4B_U04_SOURCE_ID || !isAllowedLayoutMode(layoutSelect.value)) return;
    proxyLayoutChange?.dispatchEvent(new Event("change", { bubbles: true }));
  });
  sync();
  return root.getElementById(G4B_U04_PIXEL_PUBLIC_CONTROL_IDS.field);
}

if (typeof document !== "undefined") mountG4BU04PixelPublicControls(document);
