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

function fallbackRenderKind(question = {}) {
  if (question.renderKind) return question.renderKind;
  if (question.applicationText === true) return "contextual_application";
  if (question.mode === "application") return "contextual_application";
  if (question.mode === "reasoning_application") return "reasoning_application";
  if (question.mode === "geometry_application") return "geometry_application";
  if (question.mode === "reasoning") return "reasoning";
  if (question.mode === "representation") return "representation";
  if (question.mode === "concept") return "concept";
  return "numeric";
}

function fallbackResponsePrompt(question = {}) {
  if (typeof question.responsePrompt === "string") return question.responsePrompt;
  if (question.applicationText === true || String(question.mode ?? "").includes("application")) {
    return "作答：________________________________________________";
  }
  if (Array.isArray(question.finalAnswer)) return "答案：________________________________________";
  return "答案：________________";
}

function generatedQuestionDisplayModels(document) {
  const questions = Array.isArray(document?.generatedQuestions) ? document.generatedQuestions : [];
  return questions.map((question, index) => ({
    questionId: question.id ?? question.questionId ?? `global-question-${index + 1}`,
    questionNumber: index + 1,
    patternId: question.patternSpecId ?? question.patternId ?? null,
    knowledgePointId: question.knowledgePointId ?? null,
    patternGroupId: question.resolvedPatternGroupId ?? question.patternGroupId ?? null,
    questionNumberText: `${index + 1}.`,
    promptText: question.promptText ?? question.displayText ?? "",
    displayText: question.promptText ?? question.displayText ?? "",
    blankedDisplayText: question.promptText ?? question.displayText ?? "",
    responsePrompt: fallbackResponsePrompt(question),
    answerModelShape: question.answerModelShape ?? question.answerModel?.shape ?? null,
    renderKind: fallbackRenderKind(question),
    applicationText: question.applicationText === true,
    mode: question.mode ?? null,
    implementationClass: question.implementationClass ?? null,
    metadataSnapshot: clone(question.metadata ?? null),
    layoutHints: {
      estimatedTextLength: String(question.promptText ?? question.displayText ?? "").length,
      estimatedResponseLength: fallbackResponsePrompt(question).length,
      avoidPageBreakInside: true,
      representation: fallbackRenderKind(question),
      longTextCardPolicy: "avoidSplit",
      preserveTraditionalChinese: true,
    },
  }));
}

function generatedAnswerKeyItems(document) {
  const questions = Array.isArray(document?.generatedQuestions) ? document.generatedQuestions : [];
  return questions.map((question, index) => ({
    questionId: question.id ?? question.questionId ?? `global-question-${index + 1}`,
    questionNumber: index + 1,
    patternId: question.patternSpecId ?? question.patternId ?? null,
    knowledgePointId: question.knowledgePointId ?? null,
    patternGroupId: question.resolvedPatternGroupId ?? question.patternGroupId ?? null,
    promptText: question.promptText ?? question.displayText ?? "",
    answerText: question.answerText ?? String(question.finalAnswer ?? ""),
    expressionText: question.structuredAnswer?.expression ?? question.canonicalExpression ?? null,
    answerValue: clone(question.finalAnswer),
    answerUnit: question.structuredAnswer?.unitLabel ?? question.structuredAnswer?.unit ?? null,
    answerModelShape: question.answerModelShape ?? question.answerModel?.shape ?? null,
    renderKind: fallbackRenderKind(question),
    structuredAnswer: clone(question.structuredAnswer ?? null),
    metadataSnapshot: clone(question.metadata ?? null),
    layoutHints: {
      estimatedTextLength: String(`${question.promptText ?? ""}${question.answerText ?? ""}`).length,
      avoidPageBreakInside: true,
      representation: `${fallbackRenderKind(question)}_answer`,
      longTextCardPolicy: "avoidSplit",
      preserveTraditionalChinese: true,
    },
  }));
}

function flattenQuestionDisplayModels(document) {
  if (Array.isArray(document?.questionDisplayModels) && document.questionDisplayModels.length > 0) {
    return clone(document.questionDisplayModels);
  }
  const pageModels = (document?.questionPages ?? []).flatMap((page) => (
    (page?.cells ?? [])
      .filter((cell) => cell?.cellType === "question")
      .map((cell) => clone(cell.displayModel ?? cell.questionDisplayModel ?? cell))
  ));
  if (pageModels.length > 0) return pageModels;
  return generatedQuestionDisplayModels(document);
}

function flattenAnswerKeyItems(document) {
  if (Array.isArray(document?.answerKeyItems) && document.answerKeyItems.length > 0) {
    return clone(document.answerKeyItems);
  }
  const pageItems = (document?.answerKeyPages ?? []).flatMap((page) => (
    (page?.cells ?? [])
      .filter((cell) => cell?.cellType === "answer")
      .map((cell) => clone(cell.answerKeyItem ?? cell.answerItem ?? cell))
  ));
  if (pageItems.length > 0) return pageItems;
  return generatedAnswerKeyItems(document);
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
  const normalization = plan.globalLayoutNormalization?.ok
    ? plan.globalLayoutNormalization
    : normalizeGlobalPublicLayout(requested, {
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

  const availableAnswerKeyItems = flattenAnswerKeyItems(document);
  const includeAnswerKey = plan.includeAnswerKey !== false
    && (document?.printOptions?.showAnswerKey !== false)
    && availableAnswerKeyItems.length > 0;
  const questionOptions = questionPaginationOptions(normalization.layout, document, includeAnswerKey);
  const answerOptions = answerLayout(document, includeAnswerKey);
  const answerKeyItems = includeAnswerKey ? availableAnswerKeyItems : [];
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
