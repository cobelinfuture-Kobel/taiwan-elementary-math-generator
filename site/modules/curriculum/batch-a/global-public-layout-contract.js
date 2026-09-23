export const GLOBAL_PUBLIC_LAYOUT_CONTRACT_VERSION = "glm-s05-global-18-layout-v1";
export const GLOBAL_PUBLIC_LAYOUT_DEFAULT = Object.freeze({
  layoutId: "3x5",
  columns: 3,
  rowsPerPage: 5,
});

export const GLOBAL_PUBLIC_ROWS_BY_COLUMNS = Object.freeze({
  3: Object.freeze([1, 2, 3, 4, 5]),
  2: Object.freeze([1, 2, 3, 4, 5, 6]),
  1: Object.freeze([1, 2, 3, 4, 5, 6, 7]),
});

export const GLOBAL_PUBLIC_APPROVED_LAYOUTS = Object.freeze(
  Object.entries(GLOBAL_PUBLIC_ROWS_BY_COLUMNS).flatMap(([columns, rows]) => (
    rows.map((rowsPerPage) => Object.freeze({
      layoutId: `${columns}x${rowsPerPage}`,
      columns: Number(columns),
      rowsPerPage,
    }))
  )),
);

const approvedById = new Map(GLOBAL_PUBLIC_APPROVED_LAYOUTS.map((layout) => [layout.layoutId, layout]));

function positiveInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

export function globalPublicLayoutId(columns, rowsPerPage) {
  return `${columns}x${rowsPerPage}`;
}

export function getGlobalPublicApprovedLayout(columns, rowsPerPage) {
  const normalizedColumns = positiveInteger(columns);
  const normalizedRows = positiveInteger(rowsPerPage);
  if (normalizedColumns === null || normalizedRows === null) return null;
  return approvedById.get(globalPublicLayoutId(normalizedColumns, normalizedRows)) ?? null;
}

export function isGlobalPublicApprovedLayout(columns, rowsPerPage) {
  return getGlobalPublicApprovedLayout(columns, rowsPerPage) !== null;
}

export function normalizeGlobalPublicLayout(input = {}, options = {}) {
  const columns = positiveInteger(input.columns);
  const rowsPerPage = positiveInteger(input.rowsPerPage);
  const approved = getGlobalPublicApprovedLayout(columns, rowsPerPage);
  if (approved) {
    return Object.freeze({
      ok: true,
      layout: { ...approved },
      requestedLayout: { columns, rowsPerPage },
      legacyMigrationApplied: false,
      warnings: Object.freeze([]),
      errors: Object.freeze([]),
    });
  }

  const missing = columns === null || rowsPerPage === null;
  const legacyRange = columns !== null && rowsPerPage !== null
    && columns >= 1 && columns <= 6
    && rowsPerPage >= 1 && rowsPerPage <= 20;
  const allowLegacyMigration = options.allowLegacyMigration !== false;

  if ((missing || legacyRange) && allowLegacyMigration) {
    const warning = Object.freeze({
      code: "global_public_layout_legacy_migrated",
      severity: "warning",
      path: "printLayout",
      message: "舊版列印設定已轉換為核准版面 3 欄 × 5 列。",
      requestedColumns: columns,
      requestedRowsPerPage: rowsPerPage,
      resolvedColumns: GLOBAL_PUBLIC_LAYOUT_DEFAULT.columns,
      resolvedRowsPerPage: GLOBAL_PUBLIC_LAYOUT_DEFAULT.rowsPerPage,
    });
    return Object.freeze({
      ok: true,
      layout: { ...GLOBAL_PUBLIC_LAYOUT_DEFAULT },
      requestedLayout: { columns, rowsPerPage },
      legacyMigrationApplied: true,
      warnings: Object.freeze([warning]),
      errors: Object.freeze([]),
    });
  }

  const error = Object.freeze({
    code: "global_public_layout_invalid",
    severity: "error",
    path: "printLayout",
    message: "題目頁版面必須使用系統核准的 18 種欄列組合。",
    requestedColumns: columns,
    requestedRowsPerPage: rowsPerPage,
  });
  return Object.freeze({
    ok: false,
    layout: null,
    requestedLayout: { columns, rowsPerPage },
    legacyMigrationApplied: false,
    warnings: Object.freeze([]),
    errors: Object.freeze([error]),
  });
}

export function approvedRowsForGlobalPublicColumns(columns) {
  return [...(GLOBAL_PUBLIC_ROWS_BY_COLUMNS[Number(columns)] ?? [])];
}

export function validateGlobalPublicLayoutContract() {
  const errors = [];
  if (GLOBAL_PUBLIC_APPROVED_LAYOUTS.length !== 18) errors.push("approved_layout_count_mismatch");
  if (new Set(GLOBAL_PUBLIC_APPROVED_LAYOUTS.map((layout) => layout.layoutId)).size !== 18) errors.push("duplicate_layout_id");
  if (!isGlobalPublicApprovedLayout(3, 5)) errors.push("default_layout_missing");
  if (GLOBAL_PUBLIC_APPROVED_LAYOUTS.some((layout) => layout.columns < 1 || layout.columns > 3)) errors.push("column_range_invalid");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}
