function nonEmptyText(value) {
  const text = String(value ?? "").trim();
  return text && text !== "undefined" && text !== "null" ? text : null;
}

export function resolveWorksheetTitle(worksheetDocument = {}, plan = {}) {
  return nonEmptyText(worksheetDocument.title)
    ?? nonEmptyText(worksheetDocument.unitTitle)
    ?? nonEmptyText(plan.title)
    ?? nonEmptyText(plan.unitTitle)
    ?? "數學練習題";
}
