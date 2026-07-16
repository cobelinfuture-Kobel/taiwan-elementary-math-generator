import {
  GLOBAL_PUBLIC_LAYOUT_DEFAULT,
  approvedRowsForGlobalPublicColumns,
  getGlobalPublicApprovedLayout,
} from "../../modules/curriculum/batch-a/global-public-layout-contract.js";

const columnsInput = document.getElementById("columns-input");
const rowsInput = document.getElementById("rows-per-page-input");
const help = document.getElementById("global-layout-help");

function integerValue(input) {
  const value = Number(input?.value);
  return Number.isInteger(value) ? value : null;
}

function syncRowsForColumns({ preserveApproved = true } = {}) {
  if (!columnsInput || !rowsInput) return;
  let columns = integerValue(columnsInput);
  if (![1, 2, 3].includes(columns)) {
    columns = GLOBAL_PUBLIC_LAYOUT_DEFAULT.columns;
    columnsInput.value = String(columns);
  }
  const approvedRows = approvedRowsForGlobalPublicColumns(columns);
  const maximum = Math.max(...approvedRows);
  rowsInput.min = "1";
  rowsInput.max = String(maximum);
  let rows = integerValue(rowsInput);
  const approved = getGlobalPublicApprovedLayout(columns, rows);
  if (!preserveApproved || !approved) {
    rows = Math.min(maximum, Math.max(1, rows ?? GLOBAL_PUBLIC_LAYOUT_DEFAULT.rowsPerPage));
    rowsInput.value = String(rows);
  }
  if (help) {
    help.textContent = `目前 ${columns} 欄可選每頁 1～${maximum} 列；答案頁使用獨立安全版面。`;
  }
}

columnsInput?.addEventListener("change", () => syncRowsForColumns(), { capture: true });
rowsInput?.addEventListener("change", () => syncRowsForColumns(), { capture: true });
syncRowsForColumns();
