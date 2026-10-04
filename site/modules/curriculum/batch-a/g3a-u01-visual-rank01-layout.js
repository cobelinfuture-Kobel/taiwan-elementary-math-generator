export const G3A_U01_VISUAL_RANK01_SAFE_ROWS_BY_COLUMNS = Object.freeze({
  1: Object.freeze([1, 2, 3, 4]),
  2: Object.freeze([1, 2, 3]),
  3: Object.freeze([1, 2]),
});

function positiveInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

export function maxSafeG3AU01VisualRank01Rows(columns) {
  const normalizedColumns = positiveInteger(columns);
  const rows = G3A_U01_VISUAL_RANK01_SAFE_ROWS_BY_COLUMNS[normalizedColumns] ?? [];
  return rows.length ? Math.max(...rows) : null;
}

export function normalizeG3AU01VisualRank01PublicLayout(printLayout = {}) {
  const requestedColumns = positiveInteger(printLayout.columns);
  const columns = [1, 2, 3].includes(requestedColumns) ? requestedColumns : 2;
  const maximumRows = maxSafeG3AU01VisualRank01Rows(columns);
  const requestedRows = positiveInteger(printLayout.rowsPerPage);
  const rowsPerPage = Math.min(
    Math.max(requestedRows ?? Math.min(3, maximumRows), 1),
    maximumRows,
  );
  return Object.freeze({
    paperSize: printLayout.paperSize ?? "A4",
    columns,
    rowsPerPage,
    maximumRows,
    adjusted: requestedColumns !== columns || requestedRows !== rowsPerPage,
    requested: Object.freeze({
      columns: requestedColumns,
      rowsPerPage: requestedRows,
    }),
  });
}
