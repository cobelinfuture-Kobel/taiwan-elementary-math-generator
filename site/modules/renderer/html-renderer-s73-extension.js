import { renderWorksheetDocumentToHtml as renderBaseWorksheetDocumentToHtml } from "./html-renderer-s60j-extension.js";

export const G4B_U04_RENDERER_INTEGRATION = Object.freeze({
  task: "S73_G4B_U04_WorksheetAnswerKeyAndRendererIntegration",
  status: "concept_numeric_application_estimation_reasoning_renderer_integrated",
  profileIds: Object.freeze([
    "g4b_u04_compact_concept_numeric_v1",
    "g4b_u04_contextual_estimation_v1",
    "g4b_u04_inverse_long_answer_v1",
  ]),
  answerShapes: Object.freeze([
    "classificationAnswer",
    "symbolReadingAnswer",
    "methodComparisonAnswer",
    "methodChoiceAnswer",
    "numericAnswer",
    "moneyAmountAnswer",
    "banknoteCountAnswer",
    "digitSetAnswer",
    "possibleValuesAnswer",
  ]),
  internalIdVisible: false,
  requiredNextGate: "S74_G4B_U04_PublicUIPrintAndQueryStateQA",
});

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isG4BU04Document(document = {}) {
  return G4B_U04_RENDERER_INTEGRATION.profileIds.includes(document?.rendererProfile?.profileId);
}

function answerLabel(shape) {
  switch (shape) {
    case "classificationAnswer": return "判斷";
    case "symbolReadingAnswer": return "讀法";
    case "methodComparisonAnswer": return "三種方法";
    case "methodChoiceAnswer": return "方法";
    case "moneyAmountAnswer": return "付款金額";
    case "banknoteCountAnswer": return "鈔票張數";
    case "digitSetAnswer": return "可填數字";
    case "possibleValuesAnswer": return "所有可能值";
    default: return "答案";
  }
}

function pageHeader(document, page, answerKey) {
  return [
    '<header class="g4b-u04-page-header">',
    `<div><h1>${escapeHtml(document.title ?? "四下概數")}</h1><p>${escapeHtml(answerKey ? "答案頁" : document.subtitle ?? "概數綜合練習")}</p></div>`,
    answerKey ? "" : '<div class="g4b-u04-student-fields"><span>姓名：____________</span><span>日期：____________</span></div>',
    `<span class="g4b-u04-page-number">${answerKey ? "答案" : "題目"} ${escapeHtml(page.pageNumber)}</span>`,
    "</header>",
  ].join("");
}

function renderQuestionCell(cell) {
  if (cell?.cellType === "filler") return '<div class="g4b-u04-cell g4b-u04-cell--filler" aria-hidden="true"></div>';
  const model = cell?.displayModel;
  if (!model) throw new Error("G4B_U04_RENDERER_QUESTION_CELL_INVALID");
  return [
    `<article class="g4b-u04-cell g4b-u04-cell--question g4b-u04-cell--${escapeHtml(model.renderKind)}" data-render-kind="${escapeHtml(model.renderKind)}" data-answer-shape="${escapeHtml(model.answerModelShape)}">`,
    model.questionNumberText ? `<div class="g4b-u04-cell__number">${escapeHtml(model.questionNumberText)}</div>` : "",
    `<div class="g4b-u04-cell__prompt">${escapeHtml(model.blankedDisplayText)}</div>`,
    model.responsePrompt ? `<div class="g4b-u04-cell__response">${escapeHtml(model.responsePrompt)}</div>` : "",
    "</article>",
  ].join("");
}

function renderAnswerCell(cell) {
  if (cell?.cellType === "filler") return '<div class="g4b-u04-cell g4b-u04-cell--filler" aria-hidden="true"></div>';
  const item = cell?.answerKeyItem;
  if (!item) throw new Error("G4B_U04_RENDERER_ANSWER_CELL_INVALID");
  const unit = item.answerUnit ? ` ${escapeHtml(item.answerUnit)}` : "";
  return [
    `<article class="g4b-u04-cell g4b-u04-cell--answer g4b-u04-cell--${escapeHtml(item.renderKind)}" data-render-kind="${escapeHtml(item.renderKind)}" data-answer-shape="${escapeHtml(item.answerModelShape)}">`,
    `<div class="g4b-u04-cell__number">${escapeHtml(`${item.questionNumber}.`)}</div>`,
    `<div class="g4b-u04-cell__prompt g4b-u04-cell__prompt--answer">${escapeHtml(item.promptText)}</div>`,
    `<div class="g4b-u04-cell__answer"><strong>${escapeHtml(answerLabel(item.answerModelShape))}：</strong>${escapeHtml(item.answerText)}${unit}</div>`,
    "</article>",
  ].join("");
}

function renderPage(document, page, answerKey) {
  const cells = (page.cells ?? []).map(answerKey ? renderAnswerCell : renderQuestionCell).join("");
  return [
    `<section class="worksheet-page print-page g4b-u04-page ${answerKey ? "g4b-u04-page--answers" : "g4b-u04-page--questions"}" data-page-type="${answerKey ? "answer" : "question"}">`,
    pageHeader(document, page, answerKey),
    `<div class="g4b-u04-grid" style="--g4b-u04-columns:${Number(page.columns) || 1};">${cells}</div>`,
    "</section>",
  ].join("");
}

const STYLE = [
  '<style id="g4b-u04-s73-renderer-style">',
  'body.worksheet-renderer--g4b-u04 { font-family:"Noto Sans CJK TC","Noto Sans TC","Microsoft JhengHei",Arial,sans-serif; }',
  '.worksheet-renderer--g4b-u04 .worksheet-document { gap:24px; }',
  '.g4b-u04-page { break-after:page; page-break-after:always; break-inside:avoid; page-break-inside:avoid; overflow:hidden; }',
  '.g4b-u04-page:last-child { break-after:auto; page-break-after:auto; }',
  '.g4b-u04-page-header { display:grid; grid-template-columns:minmax(0,1fr) auto auto; align-items:start; gap:12px; border-bottom:1px solid #9aa7b3; padding-bottom:8px; }',
  '.g4b-u04-page-header h1 { margin:0; font-size:1.15rem; }',
  '.g4b-u04-page-header p { margin:3px 0 0; font-size:.82rem; }',
  '.g4b-u04-student-fields { display:flex; gap:10px; font-size:.82rem; white-space:nowrap; }',
  '.g4b-u04-page-number { font-size:.78rem; white-space:nowrap; }',
  '.g4b-u04-grid { display:grid; grid-template-columns:repeat(var(--g4b-u04-columns),minmax(0,1fr)); grid-auto-rows:minmax(0,1fr); gap:10px; flex:1; min-height:0; }',
  '.g4b-u04-cell { min-width:0; min-height:0; border:1px solid #b8c2cc; border-radius:4px; padding:9px 11px; display:flex; flex-direction:column; gap:6px; overflow:hidden; break-inside:avoid; page-break-inside:avoid; }',
  '.g4b-u04-cell__number { font-weight:700; font-size:.85rem; }',
  '.g4b-u04-cell__prompt { font-size:.91rem; line-height:1.55; white-space:pre-wrap; overflow-wrap:anywhere; word-break:normal; }',
  '.g4b-u04-cell__response { margin-top:auto; padding-top:8px; font-size:.83rem; line-height:1.65; white-space:pre-wrap; overflow-wrap:anywhere; }',
  '.g4b-u04-cell--numeric_rounding .g4b-u04-cell__prompt, .g4b-u04-cell--symbol_reading .g4b-u04-cell__prompt { font-variant-numeric:tabular-nums; font-size:1rem; }',
  '.g4b-u04-cell--method_comparison .g4b-u04-cell__prompt, .g4b-u04-cell--inverse_digit_set .g4b-u04-cell__prompt { font-size:.88rem; }',
  '.g4b-u04-cell--contextual_application .g4b-u04-cell__prompt, .g4b-u04-cell--operation_estimation .g4b-u04-cell__prompt, .g4b-u04-cell--inverse_possible_values .g4b-u04-cell__prompt { font-size:.87rem; }',
  '.g4b-u04-cell--answer { display:grid; grid-template-columns:auto minmax(0,1fr); grid-template-areas:"number prompt" "answer answer"; align-content:start; column-gap:8px; row-gap:4px; }',
  '.g4b-u04-cell--answer .g4b-u04-cell__number { grid-area:number; }',
  '.g4b-u04-cell--answer .g4b-u04-cell__prompt { grid-area:prompt; font-size:.79rem; line-height:1.35; }',
  '.g4b-u04-cell__answer { grid-area:answer; font-size:.87rem; line-height:1.45; overflow-wrap:anywhere; white-space:pre-wrap; }',
  '.g4b-u04-cell--inverse_possible_values.g4b-u04-cell--answer .g4b-u04-cell__answer, .g4b-u04-cell--method_comparison.g4b-u04-cell--answer .g4b-u04-cell__answer { font-size:.8rem; }',
  '.g4b-u04-cell--filler { visibility:hidden; }',
  '@media print {',
  ' .worksheet-renderer--g4b-u04 .worksheet-document { padding:0; }',
  ' .g4b-u04-page { width:210mm; height:296mm; min-height:296mm; max-height:296mm; padding:12mm 12mm; border:0; box-shadow:none; margin:0; }',
  ' .g4b-u04-grid { gap:8px; }',
  ' .g4b-u04-cell { padding:8px 9px; }',
  '}',
  '</style>',
].join("");

export function renderWorksheetDocumentToHtml(worksheetDocument, options = {}) {
  if (!isG4BU04Document(worksheetDocument)) return renderBaseWorksheetDocumentToHtml(worksheetDocument, options);
  const title = options.title ?? worksheetDocument.title ?? "四下概數";
  const stylesheetHref = options.stylesheetHref ?? "./assets/styles/print-styles.css";
  const questionPages = (worksheetDocument.questionPages ?? []).map((page) => renderPage(worksheetDocument, page, false)).join("");
  const answerPages = (worksheetDocument.answerKeyPages ?? []).map((page) => renderPage(worksheetDocument, page, true)).join("");
  return [
    "<!doctype html>",
    '<html lang="zh-Hant">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${escapeHtml(title)}</title>`,
    stylesheetHref ? `<link rel="stylesheet" href="${escapeHtml(stylesheetHref)}">` : "",
    STYLE,
    "</head>",
    '<body class="worksheet-renderer worksheet-renderer--g4b-u04" data-renderer-profile="g4b_u04_s73">',
    '<main class="worksheet-document" data-worksheet-kind="batchAWorksheet">',
    `<section class="worksheet-section worksheet-section--questions">${questionPages}</section>`,
    answerPages ? `<section class="worksheet-section worksheet-section--answer-key">${answerPages}</section>` : "",
    "</main>",
    "</body>",
    "</html>",
  ].join("");
}
