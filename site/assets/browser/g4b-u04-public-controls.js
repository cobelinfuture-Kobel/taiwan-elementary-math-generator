import {
  G4B_U04_PUBLIC_CONTROLS,
  G4B_U04_SOURCE_ID,
} from "../../modules/curriculum/registry/g4b-u04-promotion.js";

export const G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS = Object.freeze({
  section: "g4b-u04-public-controls",
  questionMode: "g4b-u04-question-mode",
  proxyQuestionMode: "g5a-u08-question-mode",
  source: "batch-a-source-select",
  sourceHelp: "batch-a-source-help",
  selectionMode: "batch-a-selection-mode-select",
});

export const G4B_U04_QUESTION_MODE_LABELS = Object.freeze({
  mixed: "概念、取概數、應用、估算與逆推混合",
  concept: "概念判讀",
  numeric: "直接取概數",
  application: "生活應用",
  operation_estimation: "先取概數再估算",
  reasoning: "逆推推理",
});

const G4_ONLY_MODES = Object.freeze(["concept", "operation_estimation"]);

function isAllowedMode(value) {
  return G4B_U04_PUBLIC_CONTROLS.questionModes.includes(value);
}

function queryParam(name) {
  if (typeof window === "undefined") return null;
  return new URL(window.location.href).searchParams.get(name);
}

function queryMode() {
  const value = queryParam("questionMode");
  return isAllowedMode(value) ? value : G4B_U04_PUBLIC_CONTROLS.defaults.questionMode;
}

function ensureSourceOption(source) {
  if (!source) return;
  let option = [...source.options].find((entry) => entry.value === G4B_U04_SOURCE_ID);
  if (!option) {
    option = document.createElement("option");
    option.value = G4B_U04_SOURCE_ID;
    option.textContent = "4B-U04 概數";
    option.dataset.s74PublicSource = "true";
    const next = [...source.options].find((entry) => entry.value === "g5a_u08_5a08");
    source.insertBefore(option, next ?? null);
  }
  if (!source.value && queryParam("sourceId") === G4B_U04_SOURCE_ID) source.value = G4B_U04_SOURCE_ID;
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
  section.setAttribute("aria-label", "四下概數題目模式設定");
  const options = G4B_U04_PUBLIC_CONTROLS.questionModes
    .map((mode) => `<option value="${mode}">${G4B_U04_QUESTION_MODE_LABELS[mode]}</option>`)
    .join("");
  section.innerHTML = [
    "<h3>四下概數設定</h3>",
    '<div class="control-grid">',
    '<label class="field"><span>題目類型</span>',
    `<select id="${G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.questionMode}" name="g4bU04QuestionMode">${options}</select>`,
    "</label></div>",
    '<p class="help-text">可分別練習概數語意、三種取概數方法、生活應用、先取概數再估算與逆推題。</p>',
  ].join("");
  const anchor = document.getElementById("batch-a-knowledge-point-warning-list");
  anchor?.before(section);
  return section;
}

export function syncG4BU04ClassicPublicControls(root = document) {
  const source = root.getElementById(G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.source);
  ensureSourceOption(source);
  const sourceHelp = root.getElementById(G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.sourceHelp);
  const selectionMode = root.getElementById(G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.selectionMode);
  const proxy = root.getElementById(G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.proxyQuestionMode);
  const section = root.getElementById(G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.section) ?? createSection();
  const select = root.getElementById(G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.questionMode);
  const active = source?.value === G4B_U04_SOURCE_ID;
  if (active && sourceHelp) sourceHelp.textContent = "4B-U04｜概數｜4 年級下學期";
  ensureProxyOptions(proxy, active);
  const visible = active && selectionMode?.value !== "sourceUnit";
  section.dataset.visible = visible ? "true" : "false";
  const requested = active && isAllowedMode(proxy?.value) ? proxy.value : queryMode();
  const mode = isAllowedMode(requested) ? requested : G4B_U04_PUBLIC_CONTROLS.defaults.questionMode;
  if (active && proxy) proxy.value = mode;
  if (select) select.value = mode;
  return Object.freeze({ active, visible, questionMode: mode });
}

export function mountG4BU04ClassicPublicControls(root = document) {
  const section = createSection();
  const source = root.getElementById(G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.source);
  const selectionMode = root.getElementById(G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.selectionMode);
  const proxy = root.getElementById(G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.proxyQuestionMode);
  const select = root.getElementById(G4B_U04_CLASSIC_PUBLIC_CONTROL_IDS.questionMode);
  const sync = () => syncG4BU04ClassicPublicControls(root);
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
  if (typeof queueMicrotask === "function") queueMicrotask(sync);
  return section;
}

if (typeof document !== "undefined") mountG4BU04ClassicPublicControls(document);
