import {
  paginateAnswerKeyItems,
  paginateQuestionDisplayModels,
} from "../../core/index.js";
import {
  GLOBAL_PUBLIC_LAYOUT_CONTRACT_VERSION,
  normalizeGlobalPublicLayout,
} from "./global-public-layout-contract.js";

export const GLOBAL_PUBLIC_LAYOUT_OVERLAY_TASK = "GLM-S05_Global18LayoutFullFix";

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, clone(nested)]));
  }
  return value;
}

function uniqueIssues(items = []) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item?.code ?? item ?? ""}|${item?.path ?? ""}|${item?.message ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function flattenQuestionDisplayModels(document) {
  if (Array.isArray(document?.questionDisplayModels) && document.questionDisplayModels.length > 0) {
    return clone(document.questionDisplayModels);
  }
  return (document?.questionPages ?? []).flatMap((page) => (
    (page?.cells ?? [])
      .filter((cell) => cell?.cellType === "question")
      .map((cell) => clone(cell.displayModel ?? cell.questionDisplayModel ?? cell))
  ));
}

function flattenAnswerKeyItems(document) {
  if (Array.isArray(document?.answerKeyItems) && document.answerKeyItems.length > 0) {
    return clone(document.answerKeyItems);
  }
  return (document?.answerKeyPages ?? []).flatMap((page) => (
    (page?.cells ?? [])
      .filter((cell) => cell?.cellType === "answer")
      .map((cell) => clone(cell.answerKeyItem ?? cell.answerItem ?? cell))
  ));
}

function answerLayout(document, includeAnswerKey) {
  const printOptions = document?.printOptions ?? {};
  const existing = document?.layoutResolution?.resolvedAnswerLayout ?? {};
  return {
    paperSize: existing.paperSize ?? printOptions.paperSize ?? "A4",
    columns: Number(existing.columns ?? printOptions.answerKeyColumns ?? 1) || 1,
    rowsPerPage: Number(existing.rowsPerPage ?? printOptions.answerKeyRowsPerPage ?? 5) || 5,
    showQuestionNumbers: printOptions.showQuestionNumbers !== false,
    showAnswerKeyPage: includeAnswerKey,
    longTextCardPolicy: "avoidSplit",
    noWrapExpression: false,
  };
}

function questionPaginationOptions(layout, document, includeAnswerKey) {
  const printOptions = document?.printOptions ?? {};
  return {
    paperSize: printOptions.paperSize ?? document?.layoutResolution?.resolvedQuestionLayout?.paperSize ?? "A4",
    columns: layout.columns,
    rowsPerPage: layout.rowsPerPage,
    showQuestionNumbers: printOptions.showQuestionNumbers !== false,
    showAnswerKeyPage: includeAnswerKey,
    longTextCardPolicy: "avoidSplit",
    noWrapExpression: false,
  };
}

function failedLayoutResult(result, normalization) {
  const errors = uniqueIssues([
    ...(result?.errors ?? []),
    ...(result?.validation?.errors ?? []),
    ...normalization.errors,
  ]);
  return {
    ...result,
    ok: false,
    worksheetDocument: null,
    errors,
    validation: {
      ...(result?.validation ?? {}),
      ok: false,
      errors,
    },
    globalLayoutResolution: normalization,
  };
}

export function applyGlobalPublicLayoutOverlay(result, plan = {}, options = {}) {
  if (!result?.ok || !result?.worksheetDocument) return result;
  const document = result.worksheetDocument;
  const requested = plan.printLayout ?? {};
  const normalization = normalizeGlobalPublicLayout(requested, {
    allowLegacyMigration: options.allowLegacyMigration !== false,
  });
  if (!normalization.ok) return failedLayoutResult(result, normalization);

  const questionDisplayModels = flattenQuestionDisplayModels(document);
  if (questionDisplayModels.length === 0) {
    return failedLayoutResult(result, {
      ...normalization,
      errors: [{
        code: "global_public_layout_question_models_missing",
        severity: "error",
        path: "worksheetDocument.questionDisplayModels",
        message: "無法取得題目顯示資料，不能套用指定版面。",
      }],
    });
  }

  const includeAnswerKey = plan.includeAnswerKey !== false
    && (document?.printOptions?.showAnswerKey !== false)
    && flattenAnswerKeyItems(document).length > 0;
  const questionOptions = questionPaginationOptions(normalization.layout, document, includeAnswerKey);
  const answerOptions = answerLayout(document, includeAnswerKey);
  const answerKeyItems = includeAnswerKey ? flattenAnswerKeyItems(document) : [];
  const questionPages = paginateQuestionDisplayModels(questionDisplayModels, questionOptions);
  const answerKeyPages = includeAnswerKey
    ? paginateAnswerKeyItems(answerKeyItems, answerOptions)
    : [];
  const resolvedQuestionLayout = {
    paperSize: questionOptions.paperSize,
    columns: normalization.layout.columns,
    rowsPerPage: normalization.layout.rowsPerPage,
  };
  const resolvedAnswerLayout = {
    paperSize: answerOptions.paperSize,
    columns: answerOptions.columns,
    rowsPerPage: answerOptions.rowsPerPage,
  };
  const requestedQuestionLayout = {
    columns: normalization.requestedLayout.columns,
    rowsPerPage: normalization.requestedLayout.rowsPerPage,
  };
  const appliedLayoutText = `題目 ${resolvedQuestionLayout.columns} 欄 × ${resolvedQuestionLayout.rowsPerPage} 列；答案 ${resolvedAnswerLayout.columns} 欄 × ${resolvedAnswerLayout.rowsPerPage} 列`;
  const sourceUnitAdapter = plan.sourceUnitAdapter ?? null;
  const layoutResolution = {
    contractVersion: GLOBAL_PUBLIC_LAYOUT_CONTRACT_VERSION,
    layoutMode: "exact_approved_matrix",
    authorizedLayoutId: normalization.layout.layoutId,
    requestedQuestionLayout,
    resolvedQuestionLayout,
    resolvedAnswerLayout,
    resolutionAuthority: "global_public_exact_layout_overlay",
    legacyMigrationApplied: normalization.legacyMigrationApplied,
    sourceUnitAdapterApplied: Boolean(sourceUnitAdapter?.applied),
    sourceUnitAdapter: clone(sourceUnitAdapter),
    layoutExact: true,
    capped: false,
    warnings: clone(normalization.warnings),
    appliedLayoutText,
    noticeText: normalization.legacyMigrationApplied
      ? "舊版列印設定已轉換為核准版面 3 欄 × 5 列。"
      : null,
  };
  const warnings = uniqueIssues([
    ...(result?.warnings ?? []),
    ...(document?.validationSummary?.warnings ?? []),
    ...normalization.warnings,
  ]);
  const printOptions = {
    ...(document.printOptions ?? {}),
    paperSize: questionOptions.paperSize,
    columns: questionOptions.columns,
    rowsPerPage: questionOptions.rowsPerPage,
    answerKeyColumns: answerOptions.columns,
    answerKeyRowsPerPage: answerOptions.rowsPerPage,
    showAnswerKey: includeAnswerKey,
    answerKeyPlacement: includeAnswerKey ? "afterQuestions" : "none",
  };
  const sourceTaskIds = [...new Set([
    ...(document?.provenance?.sourceTaskIds ?? []),
    GLOBAL_PUBLIC_LAYOUT_OVERLAY_TASK,
  ])];
  const publicControls = {
    ...(document.publicControls ?? {}),
    sourceId: plan.sourceId ?? document?.batchA?.sourceId,
    layoutMode: "exact_approved_matrix",
    columns: resolvedQuestionLayout.columns,
    rowsPerPage: resolvedQuestionLayout.rowsPerPage,
    layoutExact: true,
  };
  const worksheetDocument = {
    ...document,
    questionDisplayModels,
    answerKeyItems,
    questionPages,
    answerKeyPages,
    printOptions,
    layoutResolution,
    appliedLayoutText,
    layoutNoticeText: layoutResolution.noticeText,
    publicControls,
    metadata: {
      ...(document.metadata ?? {}),
      globalLayoutContractVersion: GLOBAL_PUBLIC_LAYOUT_CONTRACT_VERSION,
      layoutResolution: clone(layoutResolution),
      publicControls: clone(publicControls),
    },
    validationSummary: {
      ...(document.validationSummary ?? {}),
      warnings: clone(warnings),
      globalLayoutValidatorVersion: GLOBAL_PUBLIC_LAYOUT_CONTRACT_VERSION,
    },
    batchA: {
      ...(document.batchA ?? {}),
      sourceId: plan.sourceId ?? document?.batchA?.sourceId,
      publicSelectionMode: plan.publicSelectionMode ?? plan.selectionMode,
      sourceUnitAdapter: clone(sourceUnitAdapter),
      layoutMode: "exact_approved_matrix",
    },
    provenance: {
      ...(document.provenance ?? {}),
      sourceTaskIds,
      globalLayoutContractVersion: GLOBAL_PUBLIC_LAYOUT_CONTRACT_VERSION,
      sourceUnitAdapter: clone(sourceUnitAdapter),
    },
    configSnapshot: {
      ...(document.configSnapshot ?? {}),
      globalLayoutContractVersion: GLOBAL_PUBLIC_LAYOUT_CONTRACT_VERSION,
      requestedPrintLayout: clone(requestedQuestionLayout),
      printLayout: clone(questionOptions),
      answerKeyPrintLayout: clone(answerOptions),
      layoutExact: true,
      legacyMigrationApplied: normalization.legacyMigrationApplied,
      sourceUnitAdapterApplied: Boolean(sourceUnitAdapter?.applied),
    },
    summary: {
      ...(document.summary ?? {}),
      questionCount: questionDisplayModels.length,
      questionPageCount: questionPages.length,
      answerKeyPageCount: answerKeyPages.length,
      layoutMode: "exact_approved_matrix",
      layoutExact: true,
      layoutCapped: false,
      authorizedLayoutId: normalization.layout.layoutId,
      appliedLayoutText,
      legacyMigrationApplied: normalization.legacyMigrationApplied,
      sourceUnitAdapterApplied: Boolean(sourceUnitAdapter?.applied),
    },
    generationReport: {
      ...(document.generationReport ?? {}),
      validationWarnings: clone(warnings),
      generationWarnings: clone(warnings),
    },
  };
  return {
    ...result,
    worksheetDocument,
    validation: worksheetDocument.validationSummary,
    warnings,
    globalLayoutResolution: clone(layoutResolution),
  };
}
