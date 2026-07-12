import { buildBatchABrowserWorksheetDocument as buildBaseBatchABrowserWorksheetDocument } from "./batch-a-browser-worksheet-s59h-extension.js";

export const G4B_U01_PUBLIC_WARNING_FULLFIX = Object.freeze({
  task: "S59J_R1_G4B_U01_PublicWarningAndPrintLayout_FullFix",
  status: "public_warning_localization_and_deduplication_integrated",
  sourceId: "g4b_u01_4b01",
  dedupeKey: "severity_and_code",
  preserveBlockingErrors: true,
  preserveWarningNonblockingSemantics: true,
});

const PUBLIC_WARNING_MESSAGE_BY_CODE = Object.freeze({
  G4B_U01_REPEATED_SIGNATURE_WARNING: "部分題目組合重複；答案與題型驗證仍然通過。",
  G4B_U01_LOW_CARRY_COMPLEXITY_WARNING: "部分乘法題的個位計算不需要進位。",
});

function localizeWarning(issue = {}) {
  const code = String(issue?.code ?? "").trim();
  return {
    ...issue,
    severity: "warning",
    message: PUBLIC_WARNING_MESSAGE_BY_CODE[code]
      ?? "題目已通過驗證；非阻塞提示已自動彙整。",
  };
}

function issueKey(issue = {}) {
  const severity = String(issue?.severity ?? "warning");
  const code = String(issue?.code ?? "").trim();
  const message = String(issue?.message ?? "").trim();
  return `${severity}:${code || message}`;
}

export function dedupeG4BU01PublicIssues(issues = []) {
  const seen = new Set();
  const output = [];
  for (const rawIssue of Array.isArray(issues) ? issues : []) {
    const issue = localizeWarning(rawIssue);
    const key = issueKey(issue);
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(issue);
  }
  return output;
}

function isG4BU01Result(result = {}) {
  return result?.worksheetDocument?.batchA?.sourceId === G4B_U01_PUBLIC_WARNING_FULLFIX.sourceId;
}

export function buildBatchABrowserWorksheetDocument(options = {}) {
  const result = buildBaseBatchABrowserWorksheetDocument(options);
  if (!isG4BU01Result(result)) return result;

  const warnings = dedupeG4BU01PublicIssues([
    ...(result.warnings ?? []),
    ...(result.validation?.warnings ?? []),
  ]);
  const validation = result.validation
    ? { ...result.validation, warnings }
    : result.validation;
  const worksheetDocument = {
    ...result.worksheetDocument,
    validationSummary: result.worksheetDocument?.validationSummary
      ? { ...result.worksheetDocument.validationSummary, warnings }
      : result.worksheetDocument?.validationSummary,
    generationReport: result.worksheetDocument?.generationReport
      ? {
        ...result.worksheetDocument.generationReport,
        validationWarnings: warnings,
        generationWarnings: warnings,
      }
      : result.worksheetDocument?.generationReport,
  };

  return {
    ...result,
    worksheetDocument,
    validation,
    warnings,
  };
}
