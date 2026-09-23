import {
  G4B_U04_PUBLIC_CONTROLS,
  G4B_U04_SOURCE_ID,
} from "../../modules/curriculum/registry/g4b-u04-promotion.js";

export const G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS = Object.freeze({
  section: "g4b-u04-public-controls",
  questionMode: "g4b-u04-question-mode",
  layoutMode: "g4b-u04-layout-mode",
  contextMode: "g4b-u04-context-mode",
  proxyQuestionMode: "g5a-u08-question-mode",
  proxyContextMode: "g5a-u08-context-mode",
  source: "batch-a-source-select",
  sourceHelp: "batch-a-source-help",
  selectionMode: "batch-a-selection-mode-select",
  proxyLayoutChange: "columns-input",
  proxyLayoutRowChange: "rows-per-page-input",
});

export const G4B_U04_QUESTION_MODE_LABELS = Object.freeze({
  mixed: "概念、取概數、應用、估算與逆推混合",
  concept: "概念判讀",
  numeric: "直接取概數",
  application: "生活應用",
  operation_estimation: "先取概數再估算",
  reasoning: "逆推推理",
});

export const G4B_U04_LAYOUT_MODE_LABELS = Object.freeze({
  auto_safe: "自動安全版面",
  custom_with_caps: "自訂欄列（受安全上限保護）",
});

export const G4B_U04_CONTEXT_MODE_LABELS = Object.freeze({
  mixed: "一般生活與永續情境混合",
  daily_life: "一般生活情境",
  sdg: "受控永續情境",
});

const G4_ONLY_MODES = Object.freeze(["concept", "operation_estimation"]);
const G4B_U04_LAYOUT_QUERY_HYDRATED_DATASET_KEY = "g4bU04QueryHydrated";
const G4B_U04_CUSTOM_LAYOUT_INPUT_IDS = Object.freeze(new Set([
  G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.proxyLayoutChange,
  G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.proxyLayoutRowChange,
]));

function isAllowedMode(value) {
  return G4B_U04_PUBLIC_CONTROLS.questionModes.includes(value);
}

function isAllowedLayoutMode(value) {
  return G4B_U04_PUBLIC_CONTROLS.layoutModes.includes(value);
}

function isAllowedContextMode(value) {
  return G4B_U04_PUBLIC_CONTROLS.contextModes.includes(value);
}

function queryParam(name) {
  if (typeof window === "undefined") return null;
  return new URL(window.location.href).searchParams.get(name);
}

function queryMode() {
  const value = queryParam("questionMode");
  return isAllowedMode(value) ? value : G4B_U04_PUBLIC_CONTROLS.defaults.questionMode;
}

function queryLayoutMode() {
  const value = queryParam("layoutMode");
  return isAllowedLayoutMode(value) ? value : G4B_U04_PUBLIC_CONTROLS.defaults.layoutMode;
}

function queryContextMode() {
  const value = queryParam("contextMode");
  return isAllowedContextMode(value) ? value : G4B_U04_PUBLIC_CONTROLS.defaults.contextMode;
}

function resolveLayoutModeForSync({ active, layoutSelect }) {
  const queryValue = queryLayoutMode();
  if (!layoutSelect) return queryValue;
  if (active && layoutSelect.dataset[G4B_U04_LAYOUT_QUERY_HYDRATED_DATASET_KEY] !== "true") {
    layoutSelect.dataset[G4B_U04_LAYOUT_QUERY_HYDRATED_DATASET_KEY] = "true";
    return queryValue;
  }
  return isAllowedLayoutMode(layoutSelect.value) ? layoutSelect.value : queryValue;
}

export function activateG4BU04CustomLayoutFromPrintInput({ source, layoutSelect, target } = {}) {
  if (source?.value !== G4B_U04_SOURCE_ID
    || !layoutSelect
    || !G4B_U04_CUSTOM_LAYOUT_INPUT_IDS.has(target?.id)) {
    return false;
  }
  layoutSelect.value = "custom_with_caps";
  return true;
}

function ensureProxyOptions(proxy, enabled) {
  if (!proxy) return;
  for (const mode of G4_ONLY_MODES) {
    const existing = [...proxy.options].find((option) => option.value === mode);
    if (enabled && !existing) {
      const option = document.createElement("option");
      option.value = mode;
      option.textContent = G4B_U04_QUESTION_MODE_LABELS[mode];
      option.dataset.g4bU04Proxy = "true";
      proxy.append(option);
    }
    if (!enabled && existing?.dataset.g4bU04Proxy === "true") existing.remove();
  }
}

function createSection() {
  const existing = document.getElementById(G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.section);
  if (existing) return existing;
  const section = document.createElement("section");
  section.className = "pattern-group-selector";
  section.id = G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.section;
  section.dataset.visible = "false";
  section.setAttribute("aria-label", "四下概數題目、情境與版面設定");
  const questionOptions = G4B_U04_PUBLIC_CONTROLS.questionModes
    .map((mode) => `<option value="${mode}">${G4B_U04_QUESTION_MODE_LABELS[mode]}</option>`)
    .join("");
  const contextOptions = G4B_U04_PUBLIC_CONTROLS.contextModes
    .map((mode) => `<option value="${mode}">${G4B_U04_CONTEXT_MODE_LABELS[mode]}</option>`)
    .join("");
  const layoutOptions = G4B_U04_PUBLIC_CONTROLS.layoutModes
    .map((mode) => `<option value="${mode}">${G4B_U04_LAYOUT_MODE_LABELS[mode]}</option>`)
    .join("");
  section.innerHTML = [
    "<h3>四下概數設定</h3>",
    '<div class="control-grid">',
    '<label class="field"><span>題目類型</span>',
    `<select id="${G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.questionMode}" name="g4bU04QuestionMode">${questionOptions}</select>`,
    "</label>",
    '<label class="field"><span>情境模式</span>',
    `<select id="${G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.contextMode}" name="g4bU04ContextMode">${contextOptions}</select>`,
    "</label>",
    '<label class="field"><span>版面模式</span>',
    `<select id="${G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.layoutMode}" name="g4bU04LayoutMode">${layoutOptions}</select>`,
    "</label></div>",
    '<p class="help-text">永續情境只套用於已核准的應用與估算模板；所有資料均為虛構練習資料。變更題目頁欄數或列數會自動切換為自訂版面，超過安全上限時會自動調整。</p>',
  ].join("");
  const anchor = document.getElementById("batch-a-knowledge-point-warning-list");
  anchor?.before(section);
  return section;
}

export function syncG4BU04ClassicPublicControls(root = document) {
  const source = root.getElementById(G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.source);
  const sourceHelp = root.getElementById(G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.sourceHelp);
  const selectionMode = root.getElementById(G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.selectionMode);
  const proxy = root.getElementById(G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.proxyQuestionMode);
  const proxyContext = root.getElementById(G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.proxyContextMode);
  const section = root.getElementById(G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.section) ?? createSection();
  const select = root.getElementById(G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.questionMode);
  const contextSelect = root.getElementById(G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.contextMode);
  const layoutSelect = root.getElementById(G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.layoutMode);
  const active = source?.value === G4B_U04_SOURCE_ID;
  if (active && sourceHelp) sourceHelp.textContent = "4B-U04｜概數｜4 年級下學期";
  ensureProxyOptions(proxy, active);
  const visible = active && selectionMode?.value !== "sourceUnit";
  section.dataset.visible = visible ? "true" : "false";
  const requested = active && isAllowedMode(proxy?.value) ? proxy.value : queryMode();
  const mode = isAllowedMode(requested) ? requested : G4B_U04_PUBLIC_CONTROLS.defaults.questionMode;
  const contextMode = active && isAllowedContextMode(proxyContext?.value)
    ? proxyContext.value
    : (isAllowedContextMode(contextSelect?.value) ? contextSelect.value : queryContextMode());
  const layoutMode = resolveLayoutModeForSync({ active, layoutSelect });
  if (active && proxy) proxy.value = mode;
  if (active && proxyContext) proxyContext.value = contextMode;
  if (select) select.value = mode;
  if (contextSelect) contextSelect.value = contextMode;
  if (layoutSelect) layoutSelect.value = layoutMode;
  return Object.freeze({ active, visible, questionMode: mode, contextMode, layoutMode });
}

export function mountG4BU04ClassicPublicControls(root = document) {
  const section = createSection();
  const source = root.getElementById(G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.source);
  const selectionMode = root.getElementById(G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.selectionMode);
  const proxy = root.getElementById(G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.proxyQuestionMode);
  const proxyContext = root.getElementById(G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.proxyContextMode);
  const select = root.getElementById(G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.questionMode);
  const contextSelect = root.getElementById(G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.contextMode);
  const layoutSelect = root.getElementById(G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.layoutMode);
  const proxyLayoutChange = root.getElementById(G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.proxyLayoutChange);
  const sync = () => syncG4BU04ClassicPublicControls(root);
  const activateCustomLayout = (event) => {
    activateG4BU04CustomLayoutFromPrintInput({ source, layoutSelect, target: event.target });
  };
  root.addEventListener?.("change", activateCustomLayout, true);
  source?.addEventListener("change", sync);
  selectionMode?.addEventListener("change", sync);
  proxy?.addEventListener("change", () => {
    if (source?.value === G4B_U04_SOURCE_ID && select && isAllowedMode(proxy.value)) select.value = proxy.value;
  });
  proxyContext?.addEventListener("change", () => {
    if (source?.value === G4B_U04_SOURCE_ID && contextSelect && isAllowedContextMode(proxyContext.value)) contextSelect.value = proxyContext.value;
  });
  select?.addEventListener("change", () => {
    if (!proxy || source?.value !== G4B_U04_SOURCE_ID || !isAllowedMode(select.value)) return;
    ensureProxyOptions(proxy, true);
    proxy.value = select.value;
    proxy.dispatchEvent(new Event("change", { bubbles: true }));
  });
  contextSelect?.addEventListener("change", () => {
    if (!proxyContext || source?.value !== G4B_U04_SOURCE_ID || !isAllowedContextMode(contextSelect.value)) return;
    proxyContext.value = contextSelect.value;
    proxyContext.dispatchEvent(new Event("change", { bubbles: true }));
  });
  layoutSelect?.addEventListener("change", () => {
    if (source?.value !== G4B_U04_SOURCE_ID || !isAllowedLayoutMode(layoutSelect.value)) return;
    proxyLayoutChange?.dispatchEvent(new Event("change", { bubbles: true }));
  });
  sync();
  if (typeof queueMicrotask === "function") queueMicrotask(sync);
  return section;
}

if (typeof document !== "undefined") mountG4BU04ClassicPublicControls(document);
