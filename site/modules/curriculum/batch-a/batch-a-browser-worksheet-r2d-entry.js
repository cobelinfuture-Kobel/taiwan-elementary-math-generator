import {
  paginateAnswerKeyItems,
  paginateQuestionDisplayModels,
} from "../../core/index.js";
import {
  buildBatchABrowserWorksheetDocument as buildBaseBatchABrowserWorksheetDocument,
} from "./batch-a-browser-worksheet-s76j-entry.js";
import {
  G4B_U04_SOURCE_ID,
  G4B_U04_R2D_LAYOUT_OVERLAY_ID,
} from "../registry/g4b-u04-promotion.js";
import {
  resolveG4BU04WorksheetLayout,
} from "../batch-b/g4b-u04-layout-resolution.js";

export const G4B_U04_R2D_WORKSHEET_LAYOUT_INTEGRATION = Object.freeze({
  task: "G4B_U04_R2D_WorksheetLayoutReadbackAndPrintDensityQA",
  status: "layout_readback_integrated_pending_ci",
  layoutModes: Object.freeze(["auto_safe", "custom_with_caps"]),
  answerKeyProfileControlled: true,
  profileCapBypassAllowed: false,
  publicAppliedLayoutReadbackRequired: true,
  requiredNextGate: "G4B_U04_R2E_ControlledSDGTemplateVariantsAndContextMode",
});

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, clone(nested)]));
  }
  return value;
}

function uniqueIssues(items = []) {
  const seen = new Set();
  return (Array.isArray(items) ? items : []).filter((item) => {
    const key = `${item?.code ?? ""}|${item?.path ?? ""}|${item?.message ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function paginationOptions(document, layoutResolution) {
  const printOptions = document.printOptions ?? {};
  const showAnswerKeyPage = printOptions.showAnswerKey !== false && document.answerKeyItems?.length > 0;
  return {
    question: {
      paperSize: layoutResolution.resolvedQuestionLayout.paperSize,
      columns: layoutResolution.resolvedQuestionLayout.columns,
      rowsPerPage: layoutResolution.resolvedQuestionLayout.rowsPerPage,
      showQuestionNumbers: printOptions.showQuestionNumbers !== false,
      showAnswerKeyPage,
      longTextCardPolicy: "avoidSplit",
      noWrapExpression: false,
    },
    answer: {
      paperSize: layoutResolution.resolvedAnswerLayout.paperSize,
      columns: layoutResolution.resolvedAnswerLayout.columns,
      rowsPerPage: layoutResolution.resolvedAnswerLayout.rowsPerPage,
      showQuestionNumbers: printOptions.showQuestionNumbers !== false,
      showAnswerKeyPage,
      longTextCardPolicy: "avoidSplit",
      noWrapExpression: false,
    },
  };
}

function applyR2DLayout(result, options) {
  const document = result?.worksheetDocument;
  if (!result?.ok || !document || document.batchA?.sourceId !== G4B_U04_SOURCE_ID) return result;

  const layoutResolution = resolveG4BU04WorksheetLayout({
    profile: document.rendererProfile,
    layoutMode: options.layoutMode,
    requestedLayout: options.printLayout,
    includeAnswerKey: options.includeAnswerKey,
  });
  const layouts = paginationOptions(document, layoutResolution);
  const questionDisplayModels = clone(document.questionDisplayModels ?? []);
  const answerKeyItems = layouts.question.showAnswerKeyPage ? clone(document.answerKeyItems ?? []) : [];
  const questionPages = paginateQuestionDisplayModels(questionDisplayModels, layouts.question);
  const answerKeyPages = layouts.question.showAnswerKeyPage
    ? paginateAnswerKeyItems(answerKeyItems, layouts.answer)
    : [];
  const warnings = uniqueIssues([
    ...(result.warnings ?? []),
    ...(document.validationSummary?.warnings ?? []),
    ...layoutResolution.warnings,
  ]);
  const printOptions = {
    ...(document.printOptions ?? {}),
    paperSize: layouts.question.paperSize,
    columns: layouts.question.columns,
    rowsPerPage: layouts.question.rowsPerPage,
    answerKeyColumns: layouts.answer.columns,
    answerKeyRowsPerPage: layouts.answer.rowsPerPage,
    showAnswerKey: layouts.question.showAnswerKeyPage,
    answerKeyPlacement: layouts.question.showAnswerKeyPage ? "afterQuestions" : "none",
  };
  const sourceTaskIds = [...new Set([
    ...(document.provenance?.sourceTaskIds ?? []),
    G4B_U04_R2D_WORKSHEET_LAYOUT_INTEGRATION.task,
  ])];
  const publicControls = {
    ...(document.publicControls ?? {}),
    sourceId: G4B_U04_SOURCE_ID,
    questionMode: options.questionMode ?? document.batchA?.questionMode ?? "mixed",
    layoutMode: layoutResolution.layoutMode,
    genericFallback: false,
    freeFormAI: false,
    printScope: "resolved_question_layout_and_profile_controlled_answer_layout",
  };
  const worksheetDocument = {
    ...document,
    publicControls,
    layoutResolution: clone(layoutResolution),
    appliedLayoutText: layoutResolution.appliedLayoutText,
    layoutNoticeText: layoutResolution.noticeText,
    printOptions,
    metadata: {
      ...(document.metadata ?? {}),
      publicControls: clone(publicControls),
      layoutResolution: clone(layoutResolution),
      appliedLayoutText: layoutResolution.appliedLayoutText,
      layoutNoticeText: layoutResolution.noticeText,
    },
    validationSummary: {
      ...(document.validationSummary ?? {}),
      warnings: clone(warnings),
      validatorVersion: "r2d-g4b-u04-layout-v1",
    },
    batchA: {
      ...(document.batchA ?? {}),
      layoutMode: layoutResolution.layoutMode,
    },
    g4bU04Summary: {
      ...(document.g4bU04Summary ?? {}),
      layoutMode: layoutResolution.layoutMode,
      rendererProfileId: layoutResolution.profileId,
      requestedQuestionLayout: clone(layoutResolution.requestedQuestionLayout),
      resolvedQuestionLayout: clone(layoutResolution.resolvedQuestionLayout),
      resolvedAnswerLayout: clone(layoutResolution.resolvedAnswerLayout),
      layoutCapped: layoutResolution.capped,
      appliedLayoutText: layoutResolution.appliedLayoutText,
    },
    provenance: {
      ...(document.provenance ?? {}),
      sourceTaskIds,
      layoutPromotionOverlayId: G4B_U04_R2D_LAYOUT_OVERLAY_ID,
    },
    configSnapshot: {
      ...(document.configSnapshot ?? {}),
      schemaVersion: "r2d.batch_b.g4b_u04.worksheet_plan.v1",
      layoutMode: layoutResolution.layoutMode,
      requestedPrintLayout: clone(layoutResolution.requestedQuestionLayout),
      printLayout: clone(layouts.question),
      answerKeyPrintLayout: clone(layouts.answer),
      rendererProfileId: layoutResolution.profileId,
      layoutCapped: layoutResolution.capped,
    },
    questionDisplayModels,
    answerKeyItems,
    questionPages,
    answerKeyPages,
    summary: {
      ...(document.summary ?? {}),
      questionPageCount: questionPages.length,
      answerKeyPageCount: answerKeyPages.length,
      layoutMode: layoutResolution.layoutMode,
      layoutCapped: layoutResolution.capped,
      appliedLayoutText: layoutResolution.appliedLayoutText,
    },
    generationReport: {
      ...(document.generationReport ?? {}),
      validationWarnings: clone(warnings),
      generationWarnings: clone(warnings),
    },
  };
  const validation = worksheetDocument.validationSummary;
  return {
    ...result,
    worksheetDocument,
    validation,
    warnings,
  };
}

export function buildBatchABrowserWorksheetDocument(options = {}) {
  return applyR2DLayout(buildBaseBatchABrowserWorksheetDocument(options), options);
}
