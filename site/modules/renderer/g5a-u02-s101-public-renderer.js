import {
  compactG5AU02S106Prompt,
  G5A_U02_S106_RENDER_KINDS,
  G5A_U02_S106_STYLE,
  G5A_U02_S107_STYLE,
  isG5AU02S106RenderKind,
  renderG5AU02S106Representation,
} from "./g5a-u02-s106-public-representation.js";
import {
  G5A_U02_S107_RENDER_KINDS,
  G5A_U02_S107_STYLE,
  isG5AU02S107RenderKind,
  renderG5AU02S107Representation,
} from "./g5a-u02-s107-public-representation.js";
import { compactG5AU02S107Prompt } from "../../../src/curriculum/g5a-u02/s107-question-display.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const S100_STRUCTURED_KINDS = new Set([
  "factor_relation_dual_witness",
  "trial_division_table",
  "factor_pairs_to_ordered_list",
  "factor_list_reasoning_statement_set",
]);
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
const S106_KINDS = new Set(G5A_U02_S106_RENDER_KINDS);
const S107_KINDS = new Set(G5A_U02_S107_RENDER_KINDS);
const PUBLIC_SYMBOL_KINDS = new Set(["symbolic_complete_factor_sequence"]);
const STRUCTURED_KINDS = new Set([
  ...S100_STRUCTURED_KINDS,
  ...S101_KINDS,
  ...S102_KINDS,
  ...S103_KINDS,
  ...S106_KINDS,
  ...S107_KINDS,
  ...PUBLIC_SYMBOL_KINDS,
]);

export const G5A_U02_S104_RENDERER_PROFILE = "g5a_u02_s104_p0_integrated_v1";

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

function factorRelationRepresentation() {
  return [
    '<div class="g5a-u02-semantic-representation g5a-u02-factor-relation" data-g5a-u02-s100-kind="factor_relation_dual_witness">',
    '<div class="g5a-u02-semantic-response">乘法：________________________________</div>',
    '<div class="g5a-u02-semantic-response">除法：________________________________</div>',
    '<div class="g5a-u02-semantic-response">判斷：________________________________</div>',
    "</div>",
  ].join("");
}

function trialDivisionRepresentation(model) {
  const rows = (model.rows ?? []).map((row) => [
    '<div class="g5a-u02-trial-row">',
    `<strong>除 ${escapeHtml(row.divisor)}</strong>`,
    '<span>商___</span>',
    '<span>餘___</span>',
    '<span>整除□</span>',
    "</div>",
  ].join("")).join("");
  return [
    '<div class="g5a-u02-semantic-representation g5a-u02-trial" data-g5a-u02-s100-kind="trial_division_table">',
    `<div class="g5a-u02-trial-grid">${rows}</div>`,
    '<div class="g5a-u02-semantic-response">因數：________________________________</div>',
    "</div>",
  ].join("");
}

function factorPairsRepresentation(model) {
  const pairs = (model.factorPairs ?? []).map((pair) => `<span>${escapeHtml(pair[0])}×${escapeHtml(pair[1])}</span>`).join("");
  return [
    '<div class="g5a-u02-semantic-representation g5a-u02-factor-pairs" data-g5a-u02-s100-kind="factor_pairs_to_ordered_list">',
    `<div class="g5a-u02-factor-pair-chips">${pairs}</div>`,
    '<div class="g5a-u02-semantic-response">完整因數：________________________________</div>',
    "</div>",
  ].join("");
}

function statementText(statement = {}, index = 0) {
  return statement.text ?? statement.statementText ?? `敘述 ${index + 1}`;
}

function factorStatementRepresentation(model) {
  const statements = (model.statements ?? []).map((statement, index) => (
    `<li><span class="g5a-u02-judge-box">□</span>${escapeHtml(statementText(statement, index))}</li>`
  )).join("");
  return [
    '<div class="g5a-u02-semantic-representation g5a-u02-factor-statements" data-g5a-u02-s100-kind="factor_list_reasoning_statement_set">',
    `<div class="g5a-u02-factor-list-line"><strong>因數：</strong>${escapeHtml((model.factorList ?? []).join("、"))}</div>`,
    `<ol>${statements}</ol>`,
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
  const responses = ['<div class="g5a-u02-semantic-response">公因數（交集）：________________</div>'];
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
  if (isG5AU02S107RenderKind(model.kind)) return renderG5AU02S107Representation(model, escapeHtml);
  if (isG5AU02S106RenderKind(model.kind)) return renderG5AU02S106Representation(model, escapeHtml);
  if (model.kind === "factor_relation_dual_witness") return factorRelationRepresentation();
  if (model.kind === "trial_division_table") return trialDivisionRepresentation(model);
  if (model.kind === "factor_pairs_to_ordered_list") return factorPairsRepresentation(model);
  if (model.kind === "factor_list_reasoning_statement_set") return factorStatementRepresentation(model);
  if (model.kind === "partition_count_length_pairs") {
    return `<div class="g5a-u02-semantic-representation" data-g5a-u02-s101-kind="${escapeHtml(model.kind)}">${compactPairTable(model.pairs?.length ?? 0, "段數", `每段長度（${model.lengthUnit}）`)}</div>`;
  }
  if (model.kind === "rectangle_square_partition_diagram") {
    return `<div class="g5a-u02-semantic-representation" data-g5a-u02-s101-kind="${escapeHtml(model.kind)}">${diagram(model)}<div class="g5a-u02-semantic-response">所有可能邊長：________________</div></div>`;
  }
  if (model.kind === "square_tile_side_area_chain") {
    return `<div class="g5a-u02-semantic-representation" data-g5a-u02-s101-kind="${escapeHtml(model.kind)}">${diagram(model)}${compactPairTable(model.sideAreaPairs?.length ?? 0, `邊長（${model.lengthUnit}）`, `面積（${model.areaUnit}）`)}</div>`;
  }
  if (S102_KINDS.has(model.kind)) return s102Representation(model);
  if (S103_KINDS.has(model.kind)) return s103Representation(model);
  if (PUBLIC_SYMBOL_KINDS.has(model.kind)) return symbolicSequenceRepresentation(model);
  return "";
}

function compactPrompt(displayModel) {
  const model = displayModel?.questionDisplayModel;
  const s107Prompt = compactG5AU02S107Prompt(model);
  if (s107Prompt) return s107Prompt;
  const s106Prompt = compactG5AU02S106Prompt(model);
  if (s106Prompt) return s106Prompt;
  if (model?.kind === "factor_relation_dual_witness") return `用乘法和除法判斷 ${model.candidateDivisor} 是否為 ${model.target} 的因數。`;
  if (model?.kind === "trial_division_table") return `用試除法找出 ${model.target} 的所有因數。`;
  if (model?.kind === "factor_pairs_to_ordered_list") return `根據配對因數，整理 ${model.target} 的完整因數。`;
  if (model?.kind === "factor_list_reasoning_statement_set") return `根據 ${model.target} 的完整因數表，判斷各敘述。`;
  if (model?.kind === "parallel_factor_sets_with_intersection") return `比較 ${model.a} 和 ${model.b} 的完整因數集合，寫出所有公因數。`;
  if (model?.kind === "common_factor_set_with_gcf") return `比較 ${model.a} 和 ${model.b} 的完整因數集合，寫出公因數並找出最大公因數。`;
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
  const columns = Math.max(1, Number(page.columns) || 1);
  const rows = Math.max(1, Number(page.rowsPerPage) || Math.ceil((page.cells?.length ?? 1) / columns));
  const density = rows >= 6 ? "ultra" : rows >= 5 ? "high" : rows >= 3 ? "medium" : "low";
  const cells = (page.cells ?? []).map(answerKey ? renderAnswerCell : renderQuestionCell).join("");
  return [
    `<section class="worksheet-page ${answerKey ? "worksheet-page--answer-key" : "worksheet-page--questions"} print-page g5a-u02-density--${density}" data-page-number="${escapeHtml(page.pageNumber)}" data-page-type="${answerKey ? "answer" : "question"}" data-layout-columns="${columns}" data-layout-rows="${rows}">`,
    `<header class="worksheet-page__meta screen-only">${answerKey ? "答案" : "題目"}頁 ${escapeHtml(page.pageNumber)}</header>`,
    `<div class="worksheet-page__grid" style="--worksheet-columns:${columns};--worksheet-rows:${rows};">${cells}</div>`,
    "</section>",
  ].join("");
}

const STYLE = [
  '<style id="g5a-u02-s104-public-semantic-renderer-style">',
  '.worksheet-renderer--g5a-u02-s104 .worksheet-page{min-height:0;}',
  '.worksheet-renderer--g5a-u02-s104 .worksheet-page__grid{grid-template-rows:repeat(var(--worksheet-rows),minmax(0,1fr));min-height:0;overflow:hidden;gap:8px;}',
  '.worksheet-renderer--g5a-u02-s104 .worksheet-cell{min-width:0;min-height:0;overflow:hidden;padding:7px 8px;gap:3px;}',
  '.g5a-u02-semantic-cell .worksheet-cell__prompt{font-size:.76rem;line-height:1.22;white-space:pre-wrap;overflow-wrap:anywhere;}',
  '.g5a-u02-semantic-representation{display:flex;flex-direction:column;gap:3px;min-height:0;font-size:.64rem;line-height:1.16;}',
  '.g5a-u02-semantic-response{font-size:.64rem;padding-top:1px;border-bottom:1px dotted #aeb8c2;white-space:nowrap;overflow:hidden;}',
  '.g5a-u02-trial-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px 5px;min-height:0;}',
  '.g5a-u02-trial-row{display:grid;grid-template-columns:auto repeat(3,minmax(0,1fr));gap:2px;align-items:center;border-bottom:1px dotted #c5ccd3;white-space:nowrap;font-size:.58rem;}',
  '.g5a-u02-factor-pair-chips{display:flex;flex-wrap:wrap;gap:2px 4px;}.g5a-u02-factor-pair-chips span{border:1px solid #b9c3cd;border-radius:3px;padding:0 3px;}',
  '.g5a-u02-factor-statements ol{margin:0;padding-left:1.15rem;display:grid;gap:1px;}.g5a-u02-factor-statements li{padding-left:1px;}.g5a-u02-judge-box{padding-right:2px;}',
  '.g5a-u02-factor-list-line{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
  '.g5a-u02-semantic-pair-table{display:flex;flex-direction:column;gap:1px;min-height:0;}',
  '.g5a-u02-semantic-pair-table__header{font-weight:700;font-size:.6rem;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
  '.g5a-u02-semantic-pair-table__entries{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:5px;row-gap:0;}',
  '.g5a-u02-semantic-pair-entry{display:grid;grid-template-columns:auto minmax(0,1fr);gap:2px;border-bottom:1px dotted #aeb8c2;padding:0;line-height:1.08;white-space:nowrap;font-size:.58rem;}',
  '.g5a-u02-semantic-pair-entry__number{font-weight:600;}',
  '.g5a-u02-semantic-diagram{display:grid;grid-template-columns:auto minmax(0,1fr);grid-template-areas:"width grid" ". length" "note note";gap:1px 3px;align-items:center;min-height:0;}',
  '.g5a-u02-semantic-diagram__width{grid-area:width;writing-mode:vertical-rl;font-size:.56rem;}',
  '.g5a-u02-semantic-diagram__grid{grid-area:grid;display:grid;grid-template-columns:repeat(var(--semantic-cols),minmax(0,1fr));grid-template-rows:repeat(var(--semantic-rows),minmax(0,1fr));width:min(100%,94px);max-height:54px;border:1px solid #596775;background:#fff;}',
  '.g5a-u02-semantic-diagram__cell{border:.5px solid #98a5b2;min-width:0;min-height:0;}',
  '.g5a-u02-semantic-diagram__length{grid-area:length;text-align:center;font-size:.56rem;line-height:1;}',
  '.g5a-u02-semantic-diagram__note{grid-area:note;font-size:.52rem;line-height:1.05;}',
  '.g5a-u02-semantic-factor-sets{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:3px;}',
  '.g5a-u02-semantic-factor-set{display:flex;flex-direction:column;gap:1px;border:1px solid #b9c3cd;border-radius:3px;padding:2px;line-height:1.1;overflow:hidden;}',
  '.g5a-u02-semantic-domain{font-weight:700;line-height:1.1;}',
  '.g5a-u02-semantic-conditions{margin:0;padding-left:1.1rem;display:grid;gap:1px;line-height:1.1;}',
  '.g5a-u02-semantic-sequence{display:flex;flex-wrap:wrap;gap:2px;align-items:center;}',
  '.g5a-u02-semantic-sequence__item{border:1px solid #aeb8c2;border-radius:3px;padding:0 3px;}',
  '.g5a-u02-semantic-sequence__item--unknown{font-weight:700;border-style:dashed;}',
  '.g5a-u02-semantic-note{font-size:.56rem;line-height:1.08;}',
  G5A_U02_S106_STYLE,
  '.g5a-u02-semantic-answer .worksheet-cell__prompt{font-size:.64rem;line-height:1.12;}',
  '.g5a-u02-semantic-answer .worksheet-cell__answer{font-size:.68rem;line-height:1.2;white-space:pre-wrap;overflow-wrap:anywhere;}',
  '.g5a-u02-density--high .worksheet-cell,.g5a-u02-density--ultra .worksheet-cell{padding:4px 5px;gap:1px;}',
  '.g5a-u02-density--high .worksheet-cell__number,.g5a-u02-density--ultra .worksheet-cell__number{font-size:.68rem;line-height:1;}',
  '.g5a-u02-density--high .g5a-u02-semantic-cell .worksheet-cell__prompt,.g5a-u02-density--ultra .g5a-u02-semantic-cell .worksheet-cell__prompt{font-size:.62rem;line-height:1.08;}',
  '.g5a-u02-density--high .g5a-u02-semantic-representation,.g5a-u02-density--ultra .g5a-u02-semantic-representation{font-size:.52rem;gap:1px;line-height:1.04;}',
  '.g5a-u02-density--high .g5a-u02-trial-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:0 3px;}',
  '.g5a-u02-density--ultra .g5a-u02-trial-grid{grid-template-columns:repeat(4,minmax(0,1fr));gap:0 3px;}',
  '.g5a-u02-density--high .g5a-u02-trial-row,.g5a-u02-density--ultra .g5a-u02-trial-row{font-size:.47rem;grid-template-columns:auto repeat(3,minmax(0,1fr));gap:1px;}',
  '.g5a-u02-density--high .g5a-u02-semantic-response,.g5a-u02-density--ultra .g5a-u02-semantic-response{font-size:.52rem;line-height:1.05;}',
  '.g5a-u02-density--high .g5a-u02-semantic-pair-table__entries{grid-template-columns:repeat(3,minmax(0,1fr));column-gap:3px;}',
  '.g5a-u02-density--ultra .g5a-u02-semantic-pair-table__entries{grid-template-columns:repeat(4,minmax(0,1fr));column-gap:3px;}',
  '.g5a-u02-density--high .g5a-u02-semantic-pair-entry,.g5a-u02-density--ultra .g5a-u02-semantic-pair-entry{font-size:.48rem;}',
  '.g5a-u02-density--high .g5a-u02-semantic-diagram__grid,.g5a-u02-density--ultra .g5a-u02-semantic-diagram__grid{width:min(100%,68px);max-height:32px;}',
  '.g5a-u02-density--high .g5a-u02-semantic-diagram__note,.g5a-u02-density--ultra .g5a-u02-semantic-diagram__note{display:none;}',
  '.g5a-u02-density--high .g5a-u02-semantic-diagram__width,.g5a-u02-density--high .g5a-u02-semantic-diagram__length,.g5a-u02-density--ultra .g5a-u02-semantic-diagram__width,.g5a-u02-density--ultra .g5a-u02-semantic-diagram__length{font-size:.46rem;}',
  '.g5a-u02-density--high .g5a-u02-semantic-conditions,.g5a-u02-density--ultra .g5a-u02-semantic-conditions{grid-template-columns:repeat(2,minmax(0,1fr));font-size:.48rem;padding-left:.9rem;}',
  '.g5a-u02-density--high .g5a-u02-factor-statements ol,.g5a-u02-density--ultra .g5a-u02-factor-statements ol{grid-template-columns:repeat(2,minmax(0,1fr));font-size:.48rem;padding-left:1rem;}',
  '.g5a-u02-density--high .g5a-u02-semantic-factor-set,.g5a-u02-density--ultra .g5a-u02-semantic-factor-set{font-size:.48rem;padding:1px;}',
  '.worksheet-renderer--g5a-u02-s104 .worksheet-cell--filler{visibility:hidden;}',
  '@media print{.worksheet-renderer--g5a-u02-s104 .worksheet-page{padding:10mm;gap:4px;}.worksheet-renderer--g5a-u02-s104 .worksheet-page__grid{gap:6px;}.g5a-u02-semantic-answer .worksheet-cell__answer{font-size:.64rem;line-height:1.15;}}',
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
    `</head><body class="worksheet-renderer worksheet-renderer--g5a-u02-s104" data-renderer-profile="${G5A_U02_S104_RENDERER_PROFILE}">`,
    '<main class="worksheet-document" data-worksheet-kind="batchAWorksheet">',
    `<section class="worksheet-section worksheet-section--questions">${questions}</section>`,
    answers ? `<section class="worksheet-section worksheet-section--answer-key">${answers}</section>` : "",
    "</main></body></html>",
  ].join("");
}

export const renderG5AU02S101PublicDocument = renderG5AU02PublicSemanticDocument;
