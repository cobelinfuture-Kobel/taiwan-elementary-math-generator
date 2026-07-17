function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const S101_KINDS = new Set([
  "partition_count_length_pairs",
  "rectangle_square_partition_diagram",
  "square_tile_side_area_chain",
]);

export function isG5AU02S101PublicDocument(document = {}) {
  return document?.unitId === "g5a_u02"
    && (document.questionDisplayModels ?? []).some((row) => S101_KINDS.has(row?.questionDisplayModel?.kind));
}

function blankRows(count, leftLabel, rightLabel) {
  return Array.from({ length: count }, (_, index) => [
    '<div class="g5a-u02-s101-pair-row">',
    `<span>${index + 1}.</span>`,
    `<span>${escapeHtml(leftLabel)}：______</span>`,
    `<span>${escapeHtml(rightLabel)}：______</span>`,
    "</div>",
  ].join("")).join("");
}

function diagram(model) {
  const columns = Number(model?.diagramScale?.columns) || 1;
  const rows = Number(model?.diagramScale?.rows) || 1;
  const cellCount = Math.min(columns * rows, 81);
  const cells = Array.from({ length: cellCount }, () => '<span class="g5a-u02-s101-diagram__cell"></span>').join("");
  return [
    `<div class="g5a-u02-s101-diagram" role="img" aria-label="長 ${escapeHtml(model.length)}、寬 ${escapeHtml(model.width)} 的等正方形分割示意">`,
    `<div class="g5a-u02-s101-diagram__width">寬 ${escapeHtml(model.width)} ${escapeHtml(model.lengthUnit)}</div>`,
    `<div class="g5a-u02-s101-diagram__grid" style="--s101-cols:${columns};--s101-rows:${rows};aspect-ratio:${Number(model.length) || 1}/${Number(model.width) || 1};">${cells}</div>`,
    `<div class="g5a-u02-s101-diagram__length">長 ${escapeHtml(model.length)} ${escapeHtml(model.lengthUnit)}</div>`,
    '<div class="g5a-u02-s101-diagram__note">等正方形分割示意之一，答案可能不只一個。</div>',
    "</div>",
  ].join("");
}

function representation(model) {
  if (!S101_KINDS.has(model?.kind)) return "";
  if (model.kind === "partition_count_length_pairs") {
    return `<div class="g5a-u02-s101-representation" data-g5a-u02-s101-kind="${model.kind}">${blankRows(model.pairs?.length ?? 0, "段數", `每段長度（${model.lengthUnit}）`)}</div>`;
  }
  if (model.kind === "rectangle_square_partition_diagram") {
    return `<div class="g5a-u02-s101-representation" data-g5a-u02-s101-kind="${model.kind}">${diagram(model)}<div class="g5a-u02-s101-response">所有可能邊長：________________</div></div>`;
  }
  return `<div class="g5a-u02-s101-representation" data-g5a-u02-s101-kind="${model.kind}">${diagram(model)}${blankRows(model.sideAreaPairs?.length ?? 0, `邊長（${model.lengthUnit}）`, `面積（${model.areaUnit}）`)}</div>`;
}

function renderQuestionCell(cell) {
  if (cell?.cellType === "filler") return '<div class="worksheet-cell worksheet-cell--filler" aria-hidden="true"></div>';
  const model = cell?.displayModel;
  if (!model) throw new Error("G5AU02_S101_RENDERER_QUESTION_CELL_INVALID");
  return [
    `<article class="worksheet-cell worksheet-cell--question g5a-u02-s101-cell" data-question-number="${escapeHtml(cell.questionNumber)}" data-pattern-id="${escapeHtml(model.patternId)}">`,
    model.questionNumberText ? `<div class="worksheet-cell__number">${escapeHtml(model.questionNumberText)}</div>` : "",
    `<div class="worksheet-cell__prompt">${escapeHtml(model.blankedDisplayText)}</div>`,
    representation(model.questionDisplayModel),
    model.responsePrompt && !S101_KINDS.has(model.questionDisplayModel?.kind)
      ? `<div class="worksheet-cell__response">${escapeHtml(model.responsePrompt)}</div>`
      : "",
    "</article>",
  ].join("");
}

function renderAnswerCell(cell) {
  if (cell?.cellType === "filler") return '<div class="worksheet-cell worksheet-cell--filler" aria-hidden="true"></div>';
  const item = cell?.answerKeyItem;
  if (!item) throw new Error("G5AU02_S101_RENDERER_ANSWER_CELL_INVALID");
  return [
    `<article class="worksheet-cell worksheet-cell--answer-key g5a-u02-s101-answer" data-question-number="${escapeHtml(item.questionNumber)}">`,
    `<div class="worksheet-cell__number">${escapeHtml(`${item.questionNumber}.`)}</div>`,
    `<div class="worksheet-cell__prompt">${escapeHtml(item.promptText)}</div>`,
    `<div class="worksheet-cell__answer">${escapeHtml(item.answerText)}</div>`,
    "</article>",
  ].join("");
}

function renderPage(page, answerKey) {
  const cells = (page.cells ?? []).map(answerKey ? renderAnswerCell : renderQuestionCell).join("");
  return [
    `<section class="worksheet-page ${answerKey ? "worksheet-page--answer-key" : "worksheet-page--questions"} print-page" data-page-number="${escapeHtml(page.pageNumber)}" data-page-type="${answerKey ? "answer" : "question"}">`,
    `<header class="worksheet-page__meta screen-only">${answerKey ? "答案" : "題目"}頁 ${escapeHtml(page.pageNumber)}</header>`,
    `<div class="worksheet-page__grid" style="--worksheet-columns:${Number(page.columns) || 1};">${cells}</div>`,
    "</section>",
  ].join("");
}

const STYLE = [
  '<style id="g5a-u02-s101-public-renderer-style">',
  '.g5a-u02-s101-cell{gap:4px;}',
  '.g5a-u02-s101-cell .worksheet-cell__prompt{font-size:.82rem;line-height:1.35;}',
  '.g5a-u02-s101-representation{display:flex;flex-direction:column;gap:4px;min-height:0;font-size:.72rem;}',
  '.g5a-u02-s101-pair-row{display:grid;grid-template-columns:auto 1fr 1.35fr;gap:5px;border-bottom:1px dotted #aeb8c2;padding:1px 0;}',
  '.g5a-u02-s101-diagram{display:grid;grid-template-columns:auto minmax(0,1fr);grid-template-areas:"width grid" ". length" "note note";gap:3px 5px;align-items:center;min-height:0;}',
  '.g5a-u02-s101-diagram__width{grid-area:width;writing-mode:vertical-rl;font-size:.66rem;}',
  '.g5a-u02-s101-diagram__grid{grid-area:grid;display:grid;grid-template-columns:repeat(var(--s101-cols),minmax(0,1fr));grid-template-rows:repeat(var(--s101-rows),minmax(0,1fr));width:min(100%,120px);max-height:82px;border:1px solid #596775;background:#fff;}',
  '.g5a-u02-s101-diagram__cell{border:.5px solid #98a5b2;min-width:0;min-height:0;}',
  '.g5a-u02-s101-diagram__length{grid-area:length;text-align:center;font-size:.66rem;}',
  '.g5a-u02-s101-diagram__note{grid-area:note;font-size:.64rem;}',
  '.g5a-u02-s101-response{font-size:.72rem;padding-top:2px;}',
  '.g5a-u02-s101-answer .worksheet-cell__prompt{font-size:.72rem;line-height:1.25;}',
  '.g5a-u02-s101-answer .worksheet-cell__answer{font-size:.76rem;line-height:1.3;}',
  '@media print{.g5a-u02-s101-diagram__grid{max-height:72px;width:min(100%,108px);}.g5a-u02-s101-cell{padding:6px 7px;}}',
  "</style>",
].join("");

export function renderG5AU02S101PublicDocument(document, options = {}) {
  const title = options.title ?? document.title ?? "五上因數與公因數";
  const stylesheetHref = options.stylesheetHref ?? "./assets/styles/print-styles.css";
  const questions = (document.questionPages ?? []).map((page) => renderPage(page, false)).join("");
  const answers = (document.answerKeyPages ?? []).map((page) => renderPage(page, true)).join("");
  return [
    "<!doctype html>", '<html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
    `<title>${escapeHtml(title)}</title>`, stylesheetHref ? `<link rel="stylesheet" href="${escapeHtml(stylesheetHref)}">` : "", STYLE,
    '</head><body class="worksheet-renderer worksheet-renderer--g5a-u02-s101" data-renderer-profile="g5a_u02_s101_structured_geometry_v1">',
    '<main class="worksheet-document" data-worksheet-kind="batchAWorksheet">',
    `<section class="worksheet-section worksheet-section--questions">${questions}</section>`,
    answers ? `<section class="worksheet-section worksheet-section--answer-key">${answers}</section>` : "",
    "</main></body></html>",
  ].join("");
}
