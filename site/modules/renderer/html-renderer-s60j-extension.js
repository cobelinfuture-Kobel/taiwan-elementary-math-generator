import { renderWorksheetDocumentToHtml as renderBaseWorksheetDocumentToHtml } from "./html-renderer-s59j-r1-extension.js";

export const G5A_U08_RENDERER_INTEGRATION = Object.freeze({
  task: "S60J_G5A_U08_WorksheetAnswerKeyAndRendererIntegration",
  status: "mixed_numeric_application_reasoning_renderer_integrated",
  profileIds: Object.freeze(["g5a_u08_numeric_reasoning_v1", "g5a_u08_mixed_long_text_v1"]),
  answerShapes: Object.freeze([
    "numericAnswer",
    "expressionAnswer",
    "operatorSequenceAnswer",
    "equalityJudgementAnswer",
    "averageInverseAnswer",
    "allocationTransferAnswer",
  ]),
  internalIdVisible: false,
  requiredNextGate: "S60K_G5A_U08_PublicUIPrintAndQueryStateQA",
});

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isG5AU08Document(document = {}) {
  return G5A_U08_RENDERER_INTEGRATION.profileIds.includes(document?.rendererProfile?.profileId);
}

function answerLabel(shape) {
  switch (shape) {
    case "operatorSequenceAnswer": return "運算符號";
    case "equalityJudgementAnswer": return "判斷與理由";
    case "expressionAnswer": return "算式與答案";
    case "averageInverseAnswer": return "逆推結果";
    case "allocationTransferAnswer": return "平均分攤";
    default: return "答案";
  }
}

function pageHeader(document, page, answerKey) {
  return [
    '<header class="g5a-u08-page-header">',
    `<div><h1>${escapeHtml(document.title ?? "五上整數四則")}</h1><p>${escapeHtml(answerKey ? "答案頁" : document.subtitle ?? "整數四則練習")}</p></div>`,
    answerKey ? "" : '<div class="g5a-u08-student-fields"><span>姓名：____________</span><span>日期：____________</span></div>',
    `<span class="g5a-u08-page-number">${answerKey ? "答案" : "題目"} ${escapeHtml(page.pageNumber)}</span>`,
    "</header>",
  ].join("");
}

function renderQuestionCell(cell) {
  if (cell?.cellType === "filler") return '<div class="g5a-u08-cell g5a-u08-cell--filler" aria-hidden="true"></div>';
  const model = cell?.displayModel;
  if (!model) throw new Error("G5A_U08_RENDERER_QUESTION_CELL_INVALID");
  return [
    `<article class="g5a-u08-cell g5a-u08-cell--question g5a-u08-cell--${escapeHtml(model.renderKind)}" data-render-kind="${escapeHtml(model.renderKind)}" data-answer-shape="${escapeHtml(model.answerModelShape)}">`,
    model.questionNumberText ? `<div class="g5a-u08-cell__number">${escapeHtml(model.questionNumberText)}</div>` : "",
    `<div class="g5a-u08-cell__prompt">${escapeHtml(model.blankedDisplayText)}</div>`,
    model.responsePrompt ? `<div class="g5a-u08-cell__response">${escapeHtml(model.responsePrompt)}</div>` : "",
    "</article>",
  ].join("");
}

function renderAnswerCell(cell) {
  if (cell?.cellType === "filler") return '<div class="g5a-u08-cell g5a-u08-cell--filler" aria-hidden="true"></div>';
  const item = cell?.answerKeyItem;
  if (!item) throw new Error("G5A_U08_RENDERER_ANSWER_CELL_INVALID");
  return [
    `<article class="g5a-u08-cell g5a-u08-cell--answer g5a-u08-cell--${escapeHtml(item.renderKind)}" data-render-kind="${escapeHtml(item.renderKind)}" data-answer-shape="${escapeHtml(item.answerModelShape)}">`,
    `<div class="g5a-u08-cell__number">${escapeHtml(`${item.questionNumber}.`)}</div>`,
    `<div class="g5a-u08-cell__prompt g5a-u08-cell__prompt--answer">${escapeHtml(item.promptText)}</div>`,
    `<div class="g5a-u08-cell__answer"><strong>${escapeHtml(answerLabel(item.answerModelShape))}：</strong>${escapeHtml(item.answerText)}</div>`,
    "</article>",
  ].join("");
}

function renderPage(document, page, answerKey) {
  const cells = (page.cells ?? []).map(answerKey ? renderAnswerCell : renderQuestionCell).join("");
  return [
    `<section class="worksheet-page print-page g5a-u08-page ${answerKey ? "g5a-u08-page--answers" : "g5a-u08-page--questions"}" data-page-type="${answerKey ? "answer" : "question"}">`,
    pageHeader(document, page, answerKey),
    `<div class="g5a-u08-grid" style="--g5a-columns:${Number(page.columns) || 1};">${cells}</div>`,
    "</section>",
  ].join("");
}

const STYLE = [
  '<style id="g5a-u08-s60j-renderer-style">',
  'body.worksheet-renderer--g5a-u08 { font-family:"Noto Sans CJK TC","Noto Sans TC","Microsoft JhengHei",Arial,sans-serif; }',
  '.worksheet-renderer--g5a-u08 .worksheet-document { gap:24px; }',
  '.g5a-u08-page { break-after:page; page-break-after:always; break-inside:avoid; page-break-inside:avoid; overflow:hidden; }',
  '.g5a-u08-page:last-child { break-after:auto; page-break-after:auto; }',
  '.g5a-u08-page-header { display:grid; grid-template-columns:minmax(0,1fr) auto auto; align-items:start; gap:12px; border-bottom:1px solid #9aa7b3; padding-bottom:8px; }',
  '.g5a-u08-page-header h1 { margin:0; font-size:1.15rem; }',
  '.g5a-u08-page-header p { margin:3px 0 0; font-size:.82rem; }',
  '.g5a-u08-student-fields { display:flex; gap:10px; font-size:.82rem; white-space:nowrap; }',
  '.g5a-u08-page-number { font-size:.78rem; white-space:nowrap; }',
  '.g5a-u08-grid { display:grid; grid-template-columns:repeat(var(--g5a-columns),minmax(0,1fr)); grid-auto-rows:minmax(0,1fr); gap:10px; flex:1; min-height:0; }',
  '.g5a-u08-cell { min-width:0; min-height:0; border:1px solid #b8c2cc; border-radius:4px; padding:9px 11px; display:flex; flex-direction:column; gap:6px; overflow:hidden; break-inside:avoid; page-break-inside:avoid; }',
  '.g5a-u08-cell__number { font-weight:700; font-size:.85rem; }',
  '.g5a-u08-cell__prompt { font-size:.92rem; line-height:1.55; white-space:pre-wrap; overflow-wrap:anywhere; word-break:normal; }',
  '.g5a-u08-cell__response { margin-top:auto; padding-top:8px; font-size:.84rem; line-height:1.6; white-space:pre-wrap; }',
  '.g5a-u08-cell--numeric_expression .g5a-u08-cell__prompt, .g5a-u08-cell--operator_sequence .g5a-u08-cell__prompt { font-variant-numeric:tabular-nums; font-size:1rem; }',
  '.g5a-u08-cell--equality_judgement .g5a-u08-cell__prompt { font-size:.88rem; }',
  '.g5a-u08-cell--word_problem .g5a-u08-cell__prompt, .g5a-u08-cell--average_reasoning .g5a-u08-cell__prompt, .g5a-u08-cell--allocation_transfer .g5a-u08-cell__prompt { font-size:.88rem; }',
  '.g5a-u08-cell--answer { display:grid; grid-template-columns:auto minmax(0,1fr); grid-template-areas:"number prompt" "answer answer"; align-content:start; column-gap:8px; row-gap:4px; }',
  '.g5a-u08-cell--answer .g5a-u08-cell__number { grid-area:number; }',
  '.g5a-u08-cell--answer .g5a-u08-cell__prompt { grid-area:prompt; font-size:.8rem; line-height:1.35; }',
  '.g5a-u08-cell__answer { grid-area:answer; font-size:.88rem; line-height:1.45; overflow-wrap:anywhere; }',
  '.g5a-u08-cell--filler { visibility:hidden; }',
  '@media print {',
  ' .worksheet-renderer--g5a-u08 .worksheet-document { padding:0; }',
  ' .g5a-u08-page { width:210mm; height:296mm; min-height:296mm; max-height:296mm; padding:12mm 12mm; border:0; box-shadow:none; margin:0; }',
  ' .g5a-u08-grid { gap:8px; }',
  ' .g5a-u08-cell { padding:8px 9px; }',
  '}',
  '</style>',
].join("");

export function renderWorksheetDocumentToHtml(worksheetDocument, options = {}) {
  if (!isG5AU08Document(worksheetDocument)) return renderBaseWorksheetDocumentToHtml(worksheetDocument, options);
  const title = options.title ?? worksheetDocument.title ?? "五上整數四則";
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
    '<body class="worksheet-renderer worksheet-renderer--g5a-u08" data-renderer-profile="g5a_u08_s60j">',
    '<main class="worksheet-document" data-worksheet-kind="batchAWorksheet">',
    `<section class="worksheet-section worksheet-section--questions">${questionPages}</section>`,
    answerPages ? `<section class="worksheet-section worksheet-section--answer-key">${answerPages}</section>` : "",
    "</main>",
    "</body>",
    "</html>",
  ].join("");
}
