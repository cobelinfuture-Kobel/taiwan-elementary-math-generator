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
const S102_KINDS = new Set([
  "parallel_factor_sets_with_intersection",
  "common_factor_set_with_gcf",
]);
const S103_KINDS = new Set(["unique_digit_code_constraints"]);
const PUBLIC_SYMBOL_KINDS = new Set(["symbolic_complete_factor_sequence"]);
const STRUCTURED_KINDS = new Set([
  ...S101_KINDS,
  ...S102_KINDS,
  ...S103_KINDS,
  ...PUBLIC_SYMBOL_KINDS,
]);

export function isG5AU02PublicSemanticDocument(document = {}) {
  return document?.unitId === "g5a_u02"
    && (document.questionDisplayModels ?? []).some((row) => row?.questionDisplayModel?.schemaName === "G5AU02QuestionDisplayModel");
}

export const isG5AU02S101PublicDocument = isG5AU02PublicSemanticDocument;

function compactPairTable(count, leftLabel, rightLabel) {
  const entries = Array.from({ length: count }, (_, index) => [
    '<div class="g5a-u02-semantic-pair-entry">',
    `<span class="g5a-u02-semantic-pair-entry__number">${index + 1}.</span>`,
    '<span>____｜____</span>',
    "</div>",
  ].join("")).join("");
  return [
    '<div class="g5a-u02-semantic-pair-table">',
    `<div class="g5a-u02-semantic-pair-table__header">${escapeHtml(leftLabel)}｜${escapeHtml(rightLabel)}</div>`,
    `<div class="g5a-u02-semantic-pair-table__entries">${entries}</div>`,
    "</div>",
  ].join("");
}

function diagram(model) {
  const columns = Number(model?.diagramScale?.columns) || 1;
  const rows = Number(model?.diagramScale?.rows) || 1;
  const cellCount = Math.min(columns * rows, 81);
  const cells = Array.from({ length: cellCount }, () => '<span class="g5a-u02-semantic-diagram__cell"></span>').join("");
  return [
    `<div class="g5a-u02-semantic-diagram" role="img" aria-label="長 ${escapeHtml(model.length)}、寬 ${escapeHtml(model.width)} 的等正方形分割示意">`,
    `<div class="g5a-u02-semantic-diagram__width">寬 ${escapeHtml(model.width)} ${escapeHtml(model.lengthUnit)}</div>`,
    `<div class="g5a-u02-semantic-diagram__grid" style="--semantic-cols:${columns};--semantic-rows:${rows};aspect-ratio:${Number(model.length) || 1}/${Number(model.width) || 1};">${cells}</div>`,
    `<div class="g5a-u02-semantic-diagram__length">長 ${escapeHtml(model.length)} ${escapeHtml(model.lengthUnit)}</div>`,
    '<div class="g5a-u02-semantic-diagram__note">等正方形分割示意之一，答案可能不只一個。</div>',
    "</div>",
  ].join("");
}

function factorSetCard(label, value, factors) {
  return [
    '<div class="g5a-u02-semantic-factor-set">',
    `<strong>${escapeHtml(label)} ${escapeHtml(value)}</strong>`,
    `<span>因數：${escapeHtml((factors ?? []).join("、"))}</span>`,
    "</div>",
  ].join("");
}

function s102Representation(model) {
  const responses = [
    '<div class="g5a-u02-semantic-response">公因數（交集）：________________</div>',
  ];
  if (model.kind === "common_factor_set_with_gcf") {
    responses.push('<div class="g5a-u02-semantic-response">最大公因數：________________</div>');
  }
  return [
    `<div class="g5a-u02-semantic-representation" data-g5a-u02-s102-kind="${escapeHtml(model.kind)}">`,
    '<div class="g5a-u02-semantic-factor-sets">',
    factorSetCard("甲數", model.a, model.factorSetA),
    factorSetCard("乙數", model.b, model.factorSetB),
    "</div>",
    ...responses,
    "</div>",
  ].join("");
}

function s103Representation(model) {
  const domain = model.candidateDomain ?? {};
  const rules = [
    `${domain.min}～${domain.max}`,
    domain.distinctDigits ? "四個數字互不重複" : null,
    domain.nonzeroThousandsDigit ? "千位不為0" : null,
  ].filter(Boolean);
  return [
    `<div class="g5a-u02-semantic-representation" data-g5a-u02-s103-kind="${escapeHtml(model.kind)}" data-profile-allocation="${escapeHtml(model.productionAllocation)}">`,
    `<div class="g5a-u02-semantic-domain">候選規則：${escapeHtml(rules.join("；"))}</div>`,
    '<ol class="g5a-u02-semantic-conditions">',
    ...(model.conditions ?? []).map((condition) => `<li>${escapeHtml(condition.text)}</li>`),
    "</ol>",
    '<div class="g5a-u02-semantic-response">四位數密碼：________________</div>',
    "</div>",
  ].join("");
}

function symbolicSequenceRepresentation(model) {
  return [
    `<div class="g5a-u02-semantic-representation" data-g5a-u02-public-symbol-kind="${escapeHtml(model.kind)}">`,
    '<div class="g5a-u02-semantic-sequence">',
    ...(model.sequence ?? []).map((entry) => `<span class="g5a-u02-semantic-sequence__item g5a-u02-semantic-sequence__item--${escapeHtml(entry.role)}">${escapeHtml(entry.text)}</span>`),
    "</div>",
    `<div class="g5a-u02-semantic-note">${escapeHtml(model.targetRuleText)}</div>`,
    "</div>",
  ].join("");
}

function representation(model) {
  if (!model || !STRUCTURED_KINDS.has(model.kind)) return "";
  if (model.kind === "partition_count_length_pairs") {
    return [
      `<div class="g5a-u02-semantic-representation" data-g5a-u02-s101-kind="${model.kind}">`,
      compactPairTable(model.pairs?.length ?? 0, "段數", `每段長度（${model.lengthUnit}）`),
      "</div>",
    ].join("");
  }
  if (model.kind === "rectangle_square_partition_diagram") {
    return `<div class="g5a-u02-semantic-representation" data-g5a-u02-s101-kind="${model.kind}">${diagram(model)}<div class="g5a-u02-semantic-response">所有可能邊長：________________</div></div>`;
  }
  if (model.kind === "square_tile_side_area_chain") {
    return [
      `<div class="g5a-u02-semantic-representation" data-g5a-u02-s101-kind="${model.kind}">`,
      diagram(model),
      compactPairTable(model.sideAreaPairs?.length ?? 0, `邊長（${model.lengthUnit}）`, `面積（${model.areaUnit}）`),
      "</div>",
    ].join("");
  }
  if (S102_KINDS.has(model.kind)) return s102Representation(model);
  if (S103_KINDS.has(model.kind)) return s103Representation(model);
  if (PUBLIC_SYMBOL_KINDS.has(model.kind)) return symbolicSequenceRepresentation(model);
  return "";
}

function compactPrompt(displayModel) {
  const model = displayModel?.questionDisplayModel;
  if (model?.kind === "parallel_factor_sets_with_intersection") {
    return `比較 ${model.a} 和 ${model.b} 的完整因數集合，寫出所有公因數。`;
  }
  if (model?.kind === "common_factor_set_with_gcf") {
    return `比較 ${model.a} 和 ${model.b} 的完整因數集合，寫出公因數並找出最大公因數。`;
  }
  if (model?.kind === "unique_digit_code_constraints") return "依照下列條件，找出唯一的四位數密碼。";
  if (model?.kind === "symbolic_complete_factor_sequence") return "觀察完整因數表，求出原數與所有代號。";
  return displayModel?.blankedDisplayText ?? displayModel?.promptText ?? "";
}

function renderQuestionCell(cell) {
  if (cell?.cellType === "filler") return '<div class="worksheet-cell worksheet-cell--filler" aria-hidden="true"></div>';
  const model = cell?.displayModel;
  if (!model) throw new Error("G5AU02_SEMANTIC_RENDERER_QUESTION_CELL_INVALID");
  const semanticKind = model.questionDisplayModel?.kind ?? "plain_prompt";
  return [
    `<article class="worksheet-cell worksheet-cell--question g5a-u02-semantic-cell" data-question-number="${escapeHtml(cell.questionNumber)}" data-semantic-kind="${escapeHtml(semanticKind)}">`,
    model.questionNumberText ? `<div class="worksheet-cell__number">${escapeHtml(model.questionNumberText)}</div>` : "",
    `<div class="worksheet-cell__prompt">${escapeHtml(compactPrompt(model))}</div>`,
    representation(model.questionDisplayModel),
    model.responsePrompt && !STRUCTURED_KINDS.has(model.questionDisplayModel?.kind)
      ? `<div class="worksheet-cell__response">${escapeHtml(model.responsePrompt)}</div>`
      : "",
    "</article>",
  ].join("");
}

function renderAnswerCell(cell) {
  if (cell?.cellType === "filler") return '<div class="worksheet-cell worksheet-cell--filler" aria-hidden="true"></div>';
  const item = cell?.answerKeyItem;
  if (!item) throw new Error("G5AU02_SEMANTIC_RENDERER_ANSWER_CELL_INVALID");
  const semanticKind = item.questionDisplayModel?.kind ?? "plain_prompt";
  const promptModel = { questionDisplayModel: item.questionDisplayModel, blankedDisplayText: item.promptText, promptText: item.promptText };
  return [
    `<article class="worksheet-cell worksheet-cell--answer-key g5a-u02-semantic-answer" data-question-number="${escapeHtml(item.questionNumber)}" data-semantic-kind="${escapeHtml(semanticKind)}">`,
    `<div class="worksheet-cell__number">${escapeHtml(`${item.questionNumber}.`)}</div>`,
    `<div class="worksheet-cell__prompt">${escapeHtml(compactPrompt(promptModel))}</div>`,
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
  '<style id="g5a-u02-pre-s104-public-semantic-renderer-style">',
  '.g5a-u02-semantic-cell{gap:3px;}',
  '.g5a-u02-semantic-cell .worksheet-cell__prompt{font-size:.8rem;line-height:1.28;white-space:pre-wrap;}',
  '.g5a-u02-semantic-representation{display:flex;flex-direction:column;gap:3px;min-height:0;font-size:.68rem;}',
  '.g5a-u02-semantic-pair-table{display:flex;flex-direction:column;gap:1px;min-height:0;}',
  '.g5a-u02-semantic-pair-table__header{font-weight:700;font-size:.64rem;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
  '.g5a-u02-semantic-pair-table__entries{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:6px;row-gap:0;}',
  '.g5a-u02-semantic-pair-entry{display:grid;grid-template-columns:auto minmax(0,1fr);gap:2px;border-bottom:1px dotted #aeb8c2;padding:0;line-height:1.15;white-space:nowrap;}',
  '.g5a-u02-semantic-pair-entry__number{font-weight:600;}',
  '.g5a-u02-semantic-diagram{display:grid;grid-template-columns:auto minmax(0,1fr);grid-template-areas:"width grid" ". length" "note note";gap:2px 4px;align-items:center;min-height:0;}',
  '.g5a-u02-semantic-diagram__width{grid-area:width;writing-mode:vertical-rl;font-size:.62rem;}',
  '.g5a-u02-semantic-diagram__grid{grid-area:grid;display:grid;grid-template-columns:repeat(var(--semantic-cols),minmax(0,1fr));grid-template-rows:repeat(var(--semantic-rows),minmax(0,1fr));width:min(100%,112px);max-height:68px;border:1px solid #596775;background:#fff;}',
  '.g5a-u02-semantic-diagram__cell{border:.5px solid #98a5b2;min-width:0;min-height:0;}',
  '.g5a-u02-semantic-diagram__length{grid-area:length;text-align:center;font-size:.62rem;}',
  '.g5a-u02-semantic-diagram__note{grid-area:note;font-size:.6rem;line-height:1.15;}',
  '.g5a-u02-semantic-response{font-size:.68rem;padding-top:1px;border-bottom:1px dotted #aeb8c2;}',
  '.g5a-u02-semantic-factor-sets{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px;}',
  '.g5a-u02-semantic-factor-set{display:flex;flex-direction:column;gap:1px;border:1px solid #b9c3cd;border-radius:3px;padding:3px;line-height:1.18;}',
  '.g5a-u02-semantic-domain{font-weight:700;line-height:1.2;}',
  '.g5a-u02-semantic-conditions{margin:0;padding-left:1.25rem;display:grid;gap:1px;line-height:1.2;}',
  '.g5a-u02-semantic-sequence{display:flex;flex-wrap:wrap;gap:3px;align-items:center;}',
  '.g5a-u02-semantic-sequence__item{border:1px solid #aeb8c2;border-radius:3px;padding:1px 4px;}',
  '.g5a-u02-semantic-sequence__item--unknown{font-weight:700;border-style:dashed;}',
  '.g5a-u02-semantic-note{font-size:.62rem;line-height:1.15;}',
  '.g5a-u02-semantic-answer .worksheet-cell__prompt{font-size:.7rem;line-height:1.2;}',
  '.g5a-u02-semantic-answer .worksheet-cell__answer{font-size:.73rem;line-height:1.25;white-space:pre-wrap;}',
  '@media print{.g5a-u02-semantic-diagram__grid{max-height:62px;width:min(100%,102px);}.g5a-u02-semantic-cell{padding:5px 6px;}.g5a-u02-semantic-pair-table__entries{column-gap:4px;}}',
  "</style>",
].join("");

export function renderG5AU02PublicSemanticDocument(document, options = {}) {
  const title = options.title ?? document.title ?? "五上因數與公因數";
  const stylesheetHref = options.stylesheetHref ?? "./assets/styles/print-styles.css";
  const questions = (document.questionPages ?? []).map((page) => renderPage(page, false)).join("");
  const answers = (document.answerKeyPages ?? []).map((page) => renderPage(page, true)).join("");
  return [
    "<!doctype html>", '<html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
    `<title>${escapeHtml(title)}</title>`, stylesheetHref ? `<link rel="stylesheet" href="${escapeHtml(stylesheetHref)}">` : "", STYLE,
    '</head><body class="worksheet-renderer worksheet-renderer--g5a-u02-semantic" data-renderer-profile="g5a_u02_pre_s104_semantic_v1">',
    '<main class="worksheet-document" data-worksheet-kind="batchAWorksheet">',
    `<section class="worksheet-section worksheet-section--questions">${questions}</section>`,
    answers ? `<section class="worksheet-section worksheet-section--answer-key">${answers}</section>` : "",
    "</main></body></html>",
  ].join("");
}

export const renderG5AU02S101PublicDocument = renderG5AU02PublicSemanticDocument;
