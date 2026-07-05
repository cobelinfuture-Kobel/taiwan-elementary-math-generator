function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function createRendererError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function buildDataAttributes(attributes, enabled) {
  if (!enabled) {
    return "";
  }

  return Object.entries(attributes)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => ` data-${key}="${escapeHtml(value)}"`)
    .join("");
}

function renderPageSection(title, pagesHtml, sectionClassName, options) {
  return [
    `<section class="worksheet-section ${sectionClassName}">`,
    `<header class="worksheet-section__header screen-only"><h2 class="worksheet-section__title">${escapeHtml(title)}</h2></header>`,
    pagesHtml,
    "</section>"
  ].join("");
}

function renderPageGrid(page, options) {
  return [
    `<div class="worksheet-page__grid" style="--worksheet-columns:${page.columns};">`,
    page.cells.map((cell) => renderWorksheetCell(cell, options)).join(""),
    "</div>"
  ].join("");
}

export function renderQuestionCell(cell, options = {}) {
  const displayModel = cell?.displayModel;
  if (!displayModel) {
    throw createRendererError("question_cell_invalid", "Question cells must contain a displayModel.");
  }

  const dataAttributes = buildDataAttributes({
    "cell-index": cell.cellIndex,
    "row-index": cell.rowIndex,
    "column-index": cell.columnIndex,
    "cell-type": cell.cellType,
    "question-id": cell.questionId,
    "question-number": cell.questionNumber,
    "pattern-id": displayModel.patternId
  }, options.debugDataAttributes !== false);

  return [
    `<article class="worksheet-cell worksheet-cell--question"${dataAttributes}>`,
    displayModel.questionNumberText
      ? `<div class="worksheet-cell__number">${escapeHtml(displayModel.questionNumberText)}</div>`
      : "",
    `<div class="worksheet-cell__prompt">${escapeHtml(displayModel.blankedDisplayText)}</div>`,
    "</article>"
  ].join("");
}

export function renderAnswerKeyCell(cell, options = {}) {
  const answerKeyItem = cell?.answerKeyItem;
  if (!answerKeyItem) {
    throw createRendererError("answer_key_cell_invalid", "Answer-key cells must contain an answerKeyItem.");
  }

  const dataAttributes = buildDataAttributes({
    "cell-index": cell.cellIndex,
    "row-index": cell.rowIndex,
    "column-index": cell.columnIndex,
    "cell-type": cell.cellType,
    "question-id": cell.questionId,
    "question-number": cell.questionNumber,
    "pattern-id": answerKeyItem.patternId
  }, options.debugDataAttributes !== false);

  return [
    `<article class="worksheet-cell worksheet-cell--answer-key"${dataAttributes}>`,
    `<div class="worksheet-cell__number">${escapeHtml(`${answerKeyItem.questionNumber}.`)}</div>`,
    `<div class="worksheet-cell__prompt">${escapeHtml(answerKeyItem.promptText)}</div>`,
    `<div class="worksheet-cell__answer">${escapeHtml(answerKeyItem.answerText)}</div>`,
    "</article>"
  ].join("");
}

export function renderFillerCell(cell, options = {}) {
  if (options.renderFillerCells !== true) {
    return "";
  }

  const dataAttributes = buildDataAttributes({
    "cell-index": cell.cellIndex,
    "row-index": cell.rowIndex,
    "column-index": cell.columnIndex,
    "cell-type": cell.cellType
  }, options.debugDataAttributes !== false);

  return `<div class="worksheet-cell worksheet-cell--filler"${dataAttributes}></div>`;
}

export function renderWorksheetCell(cell, options = {}) {
  if (!cell || typeof cell !== "object") {
    throw createRendererError("worksheet_cell_invalid", "Worksheet cell must be an object.");
  }

  if (cell.cellType === "question") {
    return renderQuestionCell(cell, options);
  }

  if (cell.cellType === "answerKey") {
    return renderAnswerKeyCell(cell, options);
  }

  if (cell.cellType === "filler") {
    return renderFillerCell(cell, options);
  }

  throw createRendererError("worksheet_cell_type_invalid", `Unsupported worksheet cell type '${cell.cellType}'.`);
}

export function renderQuestionPage(page, options = {}) {
  const dataAttributes = buildDataAttributes({
    "page-number": page.pageNumber,
    "page-type": page.pageType
  }, options.debugDataAttributes !== false);

  return [
    `<section class="worksheet-page worksheet-page--questions print-page"${dataAttributes}>`,
    `<header class="worksheet-page__meta screen-only">題目頁 ${escapeHtml(page.pageNumber)}</header>`,
    renderPageGrid(page, options),
    "</section>"
  ].join("");
}

export function renderAnswerKeyPage(page, options = {}) {
  const dataAttributes = buildDataAttributes({
    "page-number": page.pageNumber,
    "page-type": page.pageType
  }, options.debugDataAttributes !== false);

  return [
    `<section class="worksheet-page worksheet-page--answer-key print-page"${dataAttributes}>`,
    `<header class="worksheet-page__meta screen-only">答案頁 ${escapeHtml(page.pageNumber)}</header>`,
    renderPageGrid(page, options),
    "</section>"
  ].join("");
}

export function renderWorksheetDocumentToHtml(worksheetDocument, options = {}) {
  if (!worksheetDocument || typeof worksheetDocument !== "object") {
    throw createRendererError("worksheet_document_invalid", "WorksheetDocument must be an object.");
  }

  const questionPages = Array.isArray(worksheetDocument.questionPages) ? worksheetDocument.questionPages : [];
  const answerKeyPages = Array.isArray(worksheetDocument.answerKeyPages) ? worksheetDocument.answerKeyPages : [];
  const title = options.title ?? "數學練習題預覽";
  const stylesheetHref = options.stylesheetHref ?? "./src/renderer/print-styles.css";

  const questionPagesHtml = questionPages.map((page) => renderQuestionPage(page, options)).join("");
  const answerKeyPagesHtml = answerKeyPages.length > 0
    ? renderPageSection(
      "答案頁",
      answerKeyPages.map((page) => renderAnswerKeyPage(page, options)).join(""),
      "worksheet-section--answer-key",
      options
    )
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
    "</html>"
  ].join("");
}
