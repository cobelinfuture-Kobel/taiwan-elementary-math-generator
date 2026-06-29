function createPaginationError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function getCellsPerPage(printLayout) {
  const columns = printLayout?.columns;
  const rowsPerPage = printLayout?.rowsPerPage;

  if (!Number.isInteger(columns) || columns < 1 || !Number.isInteger(rowsPerPage) || rowsPerPage < 1) {
    throw createPaginationError("print_layout_invalid", "Print layout must provide positive integer columns and rowsPerPage.");
  }

  return columns * rowsPerPage;
}

function createCell(pageNumber, cellIndex, columns, payload = {}) {
  return {
    pageNumber,
    rowIndex: Math.floor(cellIndex / columns),
    columnIndex: cellIndex % columns,
    cellIndex,
    cellType: payload.cellType,
    questionId: payload.questionId ?? null,
    questionNumber: payload.questionNumber ?? null,
    displayModel: payload.displayModel ?? null,
    answerKeyItem: payload.answerKeyItem ?? null
  };
}

function paginateItems(items, printLayout, pageType, createPayload) {
  const cellsPerPage = getCellsPerPage(printLayout);
  const columns = printLayout.columns;
  const pages = [];

  if (!Array.isArray(items) || items.length === 0) {
    return pages;
  }

  for (let offset = 0, pageNumber = 1; offset < items.length; offset += cellsPerPage, pageNumber += 1) {
    const pageItems = items.slice(offset, offset + cellsPerPage);
    const cells = [];

    for (let cellIndex = 0; cellIndex < cellsPerPage; cellIndex += 1) {
      const item = pageItems[cellIndex];
      if (item) {
        cells.push(createCell(pageNumber, cellIndex, columns, createPayload(item)));
      } else {
        cells.push(createCell(pageNumber, cellIndex, columns, { cellType: "filler" }));
      }
    }

    pages.push({
      pageNumber,
      pageType,
      paperSize: printLayout.paperSize,
      columns: printLayout.columns,
      rowsPerPage: printLayout.rowsPerPage,
      cellsPerPage,
      cells,
      fillerCellCount: cells.filter((cell) => cell.cellType === "filler").length
    });
  }

  return pages;
}

export function paginateQuestionDisplayModels(questionDisplayModels, printLayout) {
  return paginateItems(questionDisplayModels, printLayout, "questions", (displayModel) => ({
    cellType: "question",
    questionId: displayModel.questionId,
    questionNumber: displayModel.questionNumber,
    displayModel
  }));
}

export function paginateAnswerKeyItems(answerKeyItems, printLayout) {
  if (printLayout?.showAnswerKeyPage === false) {
    return [];
  }

  return paginateItems(answerKeyItems, printLayout, "answerKey", (answerKeyItem) => ({
    cellType: "answerKey",
    questionId: answerKeyItem.questionId,
    questionNumber: answerKeyItem.questionNumber,
    answerKeyItem
  }));
}
