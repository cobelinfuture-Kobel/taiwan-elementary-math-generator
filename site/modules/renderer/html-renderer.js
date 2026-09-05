import { renderAnglePartsDiagram } from "./angle-parts-diagram.js";
import { renderCirclePartsDiagram } from "./circle-parts-diagram.js";
import { renderSquareCentimeterUnitDiagram } from "./square-centimeter-unit-diagram.js";
import { renderParallelLinesRecognitionDiagram } from "./parallel-lines-recognition-diagram.js";
import { renderCubicCentimeterUnitDiagram } from "./cubic-centimeter-unit-diagram.js";
import { renderLineSymmetryRecognitionDiagram } from "./line-symmetry-recognition-diagram.js";
import { renderSolidShapeClassificationDiagram } from "./solid-shape-classification-diagram.js";
import { renderFractionNumberLine } from "./fraction-number-line.js";
import { renderMeasurementRuler } from "./measurement-ruler.js";
import { renderMeasurementScale } from "./measurement-scale.js";
import { renderInlineMathModel } from "./inline-math.js";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderStructuredText(model, plainText) {
  return model ? renderInlineMathModel(model, plainText) : escapeHtml(plainText);
}

function createRendererError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function buildDataAttributes(attributes, enabled) {
  if (!enabled) return "";
  return Object.entries(attributes)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => ` data-${key}="${escapeHtml(value)}"`)
    .join("");
}

function validateDecimalNumberLineModel(model) {
  if (!model || model.kind !== "decimal_number_line") return false;
  if (![10, 100].includes(model.scale) || !Number.isInteger(model.stepScaled) || model.stepScaled <= 0) return false;
  if (!Array.isArray(model.ticks) || model.ticks.length < 2 || model.ticks.length > 21 || model.tickCount !== model.ticks.length) return false;
  if (!Array.isArray(model.points) || model.points.length !== 2) return false;
  return model.ticks.every((tick, index) => tick && tick.index === index && Number.isInteger(tick.valueScaled) && typeof tick.label === "string")
    && model.points.every((point) => point && ["A", "B"].includes(point.label) && Number.isInteger(point.tickIndex) && point.tickIndex >= 0 && point.tickIndex < model.ticks.length && Number.isInteger(point.valueScaled));
}

export function renderDecimalNumberLine(model) {
  if (!validateDecimalNumberLineModel(model)) throw createRendererError("decimal_number_line_invalid", "Decimal number-line representation is invalid.");
  const width = 360;
  const left = 28;
  const right = 332;
  const axisY = 56;
  const count = model.ticks.length;
  const xForIndex = (index) => left + ((right - left) * index) / (count - 1);
  const pointByIndex = new Map(model.points.map((point) => [point.tickIndex, point]));
  const tickMarkup = model.ticks.map((tick, index) => {
    const x = xForIndex(index).toFixed(2);
    const point = pointByIndex.get(index);
    return [
      `<line x1="${x}" y1="50" x2="${x}" y2="62" stroke="currentColor" stroke-width="1" />`,
      `<text x="${x}" y="76" text-anchor="middle" font-size="9">${escapeHtml(tick.label)}</text>`,
      point ? `<circle cx="${x}" cy="${axisY}" r="4" fill="currentColor" />` : "",
      point ? `<text x="${x}" y="40" text-anchor="middle" font-size="12" font-weight="700">${escapeHtml(point.label)}</text>` : "",
    ].join("");
  }).join("");
  return [
    '<div class="worksheet-cell__representation worksheet-cell__representation--number-line" data-representation="decimal-number-line">',
    `<svg class="worksheet-number-line" viewBox="0 0 ${width} 84" role="img" aria-label="小數數線，標示 A、B 兩點" preserveAspectRatio="xMidYMid meet">`,
    `<line x1="${left}" y1="${axisY}" x2="${right}" y2="${axisY}" stroke="currentColor" stroke-width="2" />`,
    tickMarkup,
    "</svg>",
    "</div>",
  ].join("");
}

export { renderAnglePartsDiagram, renderCirclePartsDiagram, renderSquareCentimeterUnitDiagram, renderParallelLinesRecognitionDiagram, renderCubicCentimeterUnitDiagram, renderLineSymmetryRecognitionDiagram, renderSolidShapeClassificationDiagram, renderFractionNumberLine, renderMeasurementRuler, renderMeasurementScale };
export function renderNumberLine(model) {
  if (model?.kind === "fraction_number_line") return renderFractionNumberLine(model);
  if (model?.kind === "measurement_ruler") return renderMeasurementRuler(model);
  if (model?.kind === "measurement_scale") return renderMeasurementScale(model);
  return renderDecimalNumberLine(model);
}

function renderGeometryDiagram(model) {
  if (model?.kind === "angle_parts_diagram") return renderAnglePartsDiagram(model);
  if (model?.kind === "circle_parts_diagram") return renderCirclePartsDiagram(model);
  if (model?.kind === "square_centimeter_unit_diagram") return renderSquareCentimeterUnitDiagram(model);
  if (model?.kind === "parallel_lines_recognition_diagram") return renderParallelLinesRecognitionDiagram(model);
  if (model?.kind === "cubic_centimeter_unit_diagram") return renderCubicCentimeterUnitDiagram(model);
  if (model?.kind === "line_symmetry_recognition_diagram") return renderLineSymmetryRecognitionDiagram(model);
  if (model?.kind === "solid_shape_classification_diagram") return renderSolidShapeClassificationDiagram(model);
  throw createRendererError("geometry_diagram_invalid", `Unsupported geometry diagram kind '${model?.kind ?? "missing"}'.`);
}

function renderPageSection(title, pagesHtml, sectionClassName, options) {
  return [
    `<section class="worksheet-section ${sectionClassName}">`,
    `<header class="worksheet-section__header screen-only"><h2 class="worksheet-section__title">${escapeHtml(title)}</h2></header>`,
    pagesHtml,
    "</section>",
  ].join("");
}

function renderPageGrid(page, options) {
  return [
    `<div class="worksheet-page__grid" style="--worksheet-columns:${page.columns};">`,
    page.cells.map((cell) => renderWorksheetCell(cell, options)).join(""),
    "</div>",
  ].join("");
}

export function renderQuestionCell(cell, options = {}) {
  const displayModel = cell?.displayModel;
  if (!displayModel) throw createRendererError("question_cell_invalid", "Question cells must contain a displayModel.");
  const dataAttributes = buildDataAttributes({
    "cell-index": cell.cellIndex,
    "row-index": cell.rowIndex,
    "column-index": cell.columnIndex,
    "cell-type": cell.cellType,
    "question-id": cell.questionId,
    "question-number": cell.questionNumber,
    "pattern-id": displayModel.patternId,
  }, options.debugDataAttributes !== false);
  return [
    `<article class="worksheet-cell worksheet-cell--question"${dataAttributes}>`,
    displayModel.questionNumberText ? `<div class="worksheet-cell__number">${escapeHtml(displayModel.questionNumberText)}</div>` : "",
    `<div class="worksheet-cell__prompt">${renderStructuredText(displayModel.promptInlineMath, displayModel.blankedDisplayText)}</div>`,
    displayModel.numberLine ? renderNumberLine(displayModel.numberLine) : "",
    displayModel.geometryDiagram ? renderGeometryDiagram(displayModel.geometryDiagram) : "",
    "</article>",
  ].join("");
}

export function renderAnswerKeyCell(cell, options = {}) {
  const answerKeyItem = cell?.answerKeyItem;
  if (!answerKeyItem) throw createRendererError("answer_key_cell_invalid", "Answer-key cells must contain an answerKeyItem.");
  const dataAttributes = buildDataAttributes({
    "cell-index": cell.cellIndex,
    "row-index": cell.rowIndex,
    "column-index": cell.columnIndex,
    "cell-type": cell.cellType,
    "question-id": cell.questionId,
    "question-number": cell.questionNumber,
    "pattern-id": answerKeyItem.patternId,
  }, options.debugDataAttributes !== false);
  return [
    `<article class="worksheet-cell worksheet-cell--answer-key"${dataAttributes}>`,
    `<div class="worksheet-cell__number">${escapeHtml(`${answerKeyItem.questionNumber}.`)}</div>`,
    `<div class="worksheet-cell__prompt">${renderStructuredText(answerKeyItem.promptInlineMath, answerKeyItem.promptText)}</div>`,
    answerKeyItem.numberLine ? renderNumberLine(answerKeyItem.numberLine) : "",
    answerKeyItem.geometryDiagram ? renderGeometryDiagram(answerKeyItem.geometryDiagram) : "",
    `<div class="worksheet-cell__answer">${renderStructuredText(answerKeyItem.answerInlineMath, answerKeyItem.answerText)}</div>`,
    "</article>",
  ].join("");
}

export function renderFillerCell(cell, options = {}) {
  if (options.renderFillerCells !== true) return "";
  const dataAttributes = buildDataAttributes({
    "cell-index": cell.cellIndex,
    "row-index": cell.rowIndex,
    "column-index": cell.columnIndex,
    "cell-type": cell.cellType,
  }, options.debugDataAttributes !== false);
  return `<div class="worksheet-cell worksheet-cell--filler"${dataAttributes}></div>`;
}

export function renderWorksheetCell(cell, options = {}) {
  if (!cell || typeof cell !== "object") throw createRendererError("worksheet_cell_invalid", "Worksheet cell must be an object.");
  if (cell.cellType === "question") return renderQuestionCell(cell, options);
  if (cell.cellType === "answerKey") return renderAnswerKeyCell(cell, options);
  if (cell.cellType === "filler") return renderFillerCell(cell, options);
  throw createRendererError("worksheet_cell_type_invalid", `Unsupported worksheet cell type '${cell.cellType}'.`);
}

export function renderQuestionPage(page, options = {}) {
  const dataAttributes = buildDataAttributes({ "page-number": page.pageNumber, "page-type": page.pageType }, options.debugDataAttributes !== false);
  return [
    `<section class="worksheet-page worksheet-page--questions print-page"${dataAttributes}>`,
    `<header class="worksheet-page__meta screen-only">題目頁 ${escapeHtml(page.pageNumber)}</header>`,
    renderPageGrid(page, options),
    "</section>",
  ].join("");
}

export function renderAnswerKeyPage(page, options = {}) {
  const dataAttributes = buildDataAttributes({ "page-number": page.pageNumber, "page-type": page.pageType }, options.debugDataAttributes !== false);
  return [
    `<section class="worksheet-page worksheet-page--answer-key print-page"${dataAttributes}>`,
    `<header class="worksheet-page__meta screen-only">答案頁 ${escapeHtml(page.pageNumber)}</header>`,
    renderPageGrid(page, options),
    "</section>",
  ].join("");
}

export function renderWorksheetDocumentToHtml(worksheetDocument, options = {}) {
  if (!worksheetDocument || typeof worksheetDocument !== "object") throw createRendererError("worksheet_document_invalid", "WorksheetDocument must be an object.");
  const questionPages = Array.isArray(worksheetDocument.questionPages) ? worksheetDocument.questionPages : [];
  const answerKeyPages = Array.isArray(worksheetDocument.answerKeyPages) ? worksheetDocument.answerKeyPages : [];
  const title = options.title ?? "數學練習題預覽";
  const stylesheetHref = options.stylesheetHref ?? "./src/renderer/print-styles.css";
  const questionPagesHtml = questionPages.map((page) => renderQuestionPage(page, options)).join("");
  const answerKeyPagesHtml = answerKeyPages.length > 0
    ? renderPageSection("答案頁", answerKeyPages.map((page) => renderAnswerKeyPage(page, options)).join(""), "worksheet-section--answer-key", options)
    : "";
  return [
    "<!doctype html>",
    '<html lang="zh-Hant">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${escapeHtml(title)}</title>`,
    stylesheetHref ? `<link rel="stylesheet" href="${escapeHtml(stylesheetHref)}">` : "",
    "</head>",
    '<body class="worksheet-renderer">',
    `<main class="worksheet-document" data-worksheet-kind="${escapeHtml(worksheetDocument.worksheetKind ?? "worksheet")}">`,
    renderPageSection("題目頁", questionPagesHtml, "worksheet-section--questions", options),
    answerKeyPagesHtml,
    "</main>",
    "</body>",
    "</html>",
  ].join("");
}
