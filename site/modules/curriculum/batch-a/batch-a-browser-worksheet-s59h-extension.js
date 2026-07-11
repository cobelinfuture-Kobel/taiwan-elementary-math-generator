import {
  paginateAnswerKeyItems,
  paginateQuestionDisplayModels,
} from "../../core/index.js";
import { buildBatchABrowserWorksheetDocument as buildBaseBatchABrowserWorksheetDocument } from "./batch-a-browser-worksheet-s58h-extension.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator.js";
import { generateBatchABrowserQuestions } from "./batch-a-browser-question-router.js";
import {
  G4B_U01_CANONICAL_ROUTE_KINDS,
  classifyG4BU01CanonicalRouterPlan,
  normalizeG4BU01ResolverPlan,
} from "./g4b-u01-canonical-horizontal-router.js";
import {
  isG4BU01ProductionWorksheetPlan,
  validateG4BU01ProductionWorksheetEligibility,
} from "./g4b-u01-production-eligibility.js";
import {
  G4B_U01_CANONICAL_VALIDATOR_INTEGRATION,
  validateBatchABrowserQuestions,
} from "./batch-a-browser-validator-s59h-extension.js";
import {
  G4B_U01_HORIZONTAL_PROMOTION_REGISTRY_ID,
} from "../registry/g4b-u01-horizontal-promotion.js";
import {
  G4B_U01_HORIZONTAL_NUMERIC_RENDERER_PROFILE,
  G4B_U01_PRODUCTION_PROMOTION_OVERLAY_ID,
} from "../registry/g4b-u01-horizontal-production-promotion.js";
import { BATCH_A_BROWSER_SCOPE } from "./production-eligibility.js";

export const G4B_U01_CANONICAL_WORKSHEET_INTEGRATION = Object.freeze({
  task: "S59H_G4B_U01_WorksheetAnswerKeyAndHorizontalRendererIntegration",
  status: "canonical_validator_worksheet_renderer_integrated",
  schemaVersion: "worksheet-document-v1",
  rendererProfileId: G4B_U01_HORIZONTAL_NUMERIC_RENDERER_PROFILE.profileId,
  questionLayout: "3x8",
  answerKeyLayout: "3x10",
  horizontalOnly: true,
  applicationModeAdded: false,
  unrelatedWorksheetDensityChanged: false,
  requiredNextGate: "S59I_G4B_U01_PublicUIAndPrintControlsQA",
});

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  }
  return value;
}

function positiveInteger(value, fallback) {
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function normalizeQuestionLayout(options = {}) {
  const requested = options.printLayout ?? {};
  const profile = G4B_U01_HORIZONTAL_NUMERIC_RENDERER_PROFILE.questionSheet;
  return {
    paperSize: requested.paperSize ?? profile.paperSize,
    columns: Math.min(positiveInteger(requested.columns, profile.columns), profile.columns),
    rowsPerPage: Math.min(positiveInteger(requested.rowsPerPage, profile.rowsPerPage), profile.rowsPerPage),
    showQuestionNumbers: requested.showQuestionNumbers !== false,
    showAnswerKeyPage: options.includeAnswerKey !== false && requested.showAnswerKeyPage !== false,
    longTextCardPolicy: "avoidSplit",
    noWrapExpression: true,
  };
}

function normalizeAnswerLayout(questionLayout) {
  const profile = G4B_U01_HORIZONTAL_NUMERIC_RENDERER_PROFILE.answerKey;
  return {
    paperSize: questionLayout.paperSize ?? profile.paperSize,
    columns: profile.columns,
    rowsPerPage: profile.rowsPerPage,
    showQuestionNumbers: questionLayout.showQuestionNumbers,
    showAnswerKeyPage: questionLayout.showAnswerKeyPage,
    longTextCardPolicy: "avoidSplit",
    noWrapExpression: true,
  };
}

function promoteQuestion(question = {}) {
  return {
    ...cloneValue(question),
    phase: "S59H",
    productionUse: "allowed",
    promotionRegistryId: G4B_U01_PRODUCTION_PROMOTION_OVERLAY_ID,
    basePromotionRegistryId: G4B_U01_HORIZONTAL_PROMOTION_REGISTRY_ID,
    productionWorksheetStatus: "production_worksheet",
    rendererProfileId: G4B_U01_HORIZONTAL_NUMERIC_RENDERER_PROFILE.profileId,
    metadata: {
      ...cloneValue(question.metadata ?? {}),
      productionPromotionOverlayId: G4B_U01_PRODUCTION_PROMOTION_OVERLAY_ID,
      basePromotionRegistryId: G4B_U01_HORIZONTAL_PROMOTION_REGISTRY_ID,
      rendererProfileId: G4B_U01_HORIZONTAL_NUMERIC_RENDERER_PROFILE.profileId,
    },
  };
}

function displayModel(question, questionNumber, showQuestionNumbers) {
  return {
    questionId: question.id,
    questionNumber,
    patternId: question.patternSpecId,
    knowledgePointId: question.knowledgePointId,
    patternGroupId: question.resolvedPatternGroupId ?? question.patternGroupId,
    questionNumberText: showQuestionNumbers ? `${questionNumber}.` : null,
    promptText: question.promptText,
    displayText: question.displayText,
    blankedDisplayText: question.blankedDisplayText,
    equationModel: question.equationModel,
    answerText: question.answerText,
    quotient: question.quotient,
    remainder: question.remainder,
    metadataSnapshot: cloneValue(question.metadata),
    layoutHints: {
      estimatedTextLength: String(question.blankedDisplayText ?? "").length,
      hasGrouping: false,
      avoidPageBreakInside: true,
      representation: "horizontal_numeric",
      noWrapExpression: true,
      longTextCardPolicy: "avoidSplit",
    },
  };
}

function answerKeyItem(question, questionNumber) {
  return {
    questionId: question.id,
    questionNumber,
    patternId: question.patternSpecId,
    knowledgePointId: question.knowledgePointId,
    patternGroupId: question.resolvedPatternGroupId ?? question.patternGroupId,
    promptText: question.blankedDisplayText,
    equationText: question.equationModel,
    answerText: question.answerText,
    quotient: question.quotient,
    remainder: question.remainder,
    metadataSnapshot: cloneValue(question.metadata),
    layoutHints: {
      estimatedTextLength: String(`${question.blankedDisplayText ?? ""}${question.answerText ?? ""}`).length,
      avoidPageBreakInside: true,
      representation: "horizontal_numeric_answer",
      noWrapExpression: true,
      longTextCardPolicy: "avoidSplit",
    },
  };
}

function failedResult(errors, warnings = [], details = {}) {
  return {
    ok: false,
    worksheetDocument: null,
    validation: details.validation ?? {
      ok: false,
      errors,
      warnings,
      infos: [],
      validatorVersion: G4B_U01_CANONICAL_VALIDATOR_INTEGRATION.validatorVersion,
      validatedAt: null,
    },
    errors,
    warnings,
    ...details,
  };
}

function generationReport(plan, allocation, questions, errors, warnings) {
  return {
    requestedQuestionCount: plan.questionCount,
    generatedQuestionCount: questions.length,
    totalAttempts: questions.length,
    duplicateRejectCount: 0,
    constraintRejectCount: 0,
    patternReports: allocation.map((entry) => ({
      patternId: entry.patternSpecId,
      requestedQuestionCount: entry.questionCount,
      generatedQuestionCount: questions.filter((question) => question.patternSpecId === entry.patternSpecId).length,
      failureCount: 0,
      warnings: [],
    })),
    validationWarnings: warnings,
    generationWarnings: warnings,
    errors,
  };
}

export function isS59HG4BU01CanonicalWorksheetOptions(options = {}) {
  const plan = normalizeG4BU01ResolverPlan(buildBatchABrowserPlan(options));
  return isG4BU01ProductionWorksheetPlan(plan);
}

export function buildBatchABrowserWorksheetDocument(options = {}) {
  const initialPlan = normalizeG4BU01ResolverPlan(buildBatchABrowserPlan(options));
  const routeKind = classifyG4BU01CanonicalRouterPlan(initialPlan);
  if (routeKind !== G4B_U01_CANONICAL_ROUTE_KINDS.PURE_HORIZONTAL) {
    return buildBaseBatchABrowserWorksheetDocument(options);
  }

  const eligibility = validateG4BU01ProductionWorksheetEligibility(initialPlan);
  if (!eligibility.ok) return failedResult(eligibility.errors, eligibility.warnings, { eligibility });

  const generated = generateBatchABrowserQuestions(options);
  if (!generated.ok) {
    return failedResult(generated.errors ?? [], generated.warnings ?? [], { generation: generated, eligibility });
  }

  const productionQuestions = generated.questions.map(promoteQuestion);
  const validation = validateBatchABrowserQuestions(productionQuestions, { plan: generated.plan });
  const combinedWarnings = [...(generated.warnings ?? []), ...(validation.warnings ?? [])];
  const combinedValidation = { ...validation, warnings: combinedWarnings };
  if (!validation.ok) {
    return failedResult(validation.errors, combinedWarnings, {
      generation: generated,
      validation: combinedValidation,
      eligibility,
    });
  }

  const printLayout = normalizeQuestionLayout(options);
  const answerKeyPrintLayout = normalizeAnswerLayout(printLayout);
  const questionDisplayModels = productionQuestions.map((question, index) =>
    displayModel(question, index + 1, printLayout.showQuestionNumbers));
  const answerKeyItems = printLayout.showAnswerKeyPage
    ? productionQuestions.map((question, index) => answerKeyItem(question, index + 1))
    : [];
  const questionPages = paginateQuestionDisplayModels(questionDisplayModels, printLayout);
  const answerKeyPages = printLayout.showAnswerKeyPage
    ? paginateAnswerKeyItems(answerKeyItems, answerKeyPrintLayout)
    : [];
  const plan = generated.plan;
  const knowledgePointIds = [...new Set(productionQuestions.map((question) => question.knowledgePointId))];

  const worksheetDocument = {
    schemaVersion: "worksheet-document-v1",
    version: "1",
    worksheetId: `batch-a-${plan.sourceId}-${plan.selectionMode}-${plan.questionCount}-${plan.generationSeed}`,
    worksheetKind: "batchAWorksheet",
    title: options.title ?? `Batch A ${plan.sourceUnit?.unitCode ?? "4B-U01"} 多位數的乘與除`,
    subtitle: "Batch A visible KnowledgePoint canonical horizontal worksheet",
    locale: "zh-Hant",
    generatedAt: null,
    visibilityStatus: "visible",
    productionUse: "allowed",
    promotionRegistryId: G4B_U01_PRODUCTION_PROMOTION_OVERLAY_ID,
    basePromotionRegistryId: G4B_U01_HORIZONTAL_PROMOTION_REGISTRY_ID,
    rendererProfile: cloneValue(G4B_U01_HORIZONTAL_NUMERIC_RENDERER_PROFILE),
    productionEligibility: cloneValue(eligibility),
    curriculumInfo: {
      publisher: "Batch A",
      grade: plan.sourceUnit?.grade ?? 4,
      semester: plan.sourceUnit?.semester ?? "B",
      unitNumber: plan.sourceUnit?.unitCode ?? "4B-U01",
      unitTitle: plan.sourceUnit?.title ?? "多位數的乘與除",
      curriculumNodeIds: [plan.sourceId],
      canonicalSkillIds: ["multi_digit_multiplication", "multi_digit_division"],
    },
    studentFields: {
      showName: true,
      showDate: true,
      showClass: false,
      showScore: false,
      labels: { name: "姓名", date: "日期", className: "班級", score: "分數" },
    },
    printOptions: {
      paperSize: printLayout.paperSize,
      orientation: "portrait",
      columns: printLayout.columns,
      rowsPerPage: printLayout.rowsPerPage,
      answerKeyColumns: answerKeyPrintLayout.columns,
      answerKeyRowsPerPage: answerKeyPrintLayout.rowsPerPage,
      fontSizeMode: "normal",
      showQuestionNumbers: printLayout.showQuestionNumbers,
      showAnswerKey: printLayout.showAnswerKeyPage,
      answerKeyPlacement: printLayout.showAnswerKeyPage ? "afterQuestions" : "none",
      pageBreakMode: "avoidLongTextCards",
      marginMode: "default",
      debugDataAttributes: false,
      noWrapExpression: true,
    },
    validationSummary: combinedValidation,
    batchA: {
      sourceId: plan.sourceId,
      selectionMode: plan.selectionMode,
      routeKind: plan.routeKind ?? G4B_U01_CANONICAL_ROUTE_KINDS.PURE_HORIZONTAL,
      knowledgePointIds: cloneValue(plan.selectedKnowledgePointIds ?? []),
      patternGroupIds: cloneValue(plan.selectedPatternGroupIds ?? []),
      patternSpecIds: cloneValue(plan.patternSpecIds ?? []),
      allocation: cloneValue(generated.allocation),
    },
    numericSummary: {
      questionCount: productionQuestions.length,
      knowledgePointCount: knowledgePointIds.length,
      patternSpecCount: new Set(productionQuestions.map((question) => question.patternSpecId)).size,
      knowledgePointIds,
      horizontalOnly: true,
      applicationQuestionCount: 0,
    },
    provenance: {
      sourceType: "batch_a_browser_bridge",
      sourceTaskIds: [
        "S59G_G4B_U01_ResolverBrowserStateAndCanonicalRouterIntegration",
        "S59H_G4B_U01_WorksheetAnswerKeyAndHorizontalRendererIntegration",
      ],
      patternSpecIds: cloneValue(plan.patternSpecIds ?? []),
      curriculumNodeIds: [plan.sourceId],
      knowledgePointIds: cloneValue(plan.selectedKnowledgePointIds ?? []),
      patternGroupIds: cloneValue(plan.selectedPatternGroupIds ?? []),
      promotionRegistryId: G4B_U01_PRODUCTION_PROMOTION_OVERLAY_ID,
      basePromotionRegistryId: G4B_U01_HORIZONTAL_PROMOTION_REGISTRY_ID,
      productionStorageCategory: "none",
      notes: [BATCH_A_BROWSER_SCOPE.limit],
    },
    sections: [{
      sectionId: `section-${plan.sourceId}`,
      title: "多位數乘除橫式計算",
      description: null,
      patternIds: cloneValue(plan.patternSpecIds ?? []),
      questionIds: productionQuestions.map((question) => question.id),
      orderingIndex: 0,
    }],
    configSnapshot: {
      schemaVersion: "s59h.batch_a.g4b_u01.canonical_worksheet_plan.v1",
      sourceId: plan.sourceId,
      questionCount: plan.questionCount,
      ordering: plan.ordering,
      includeAnswerKey: printLayout.showAnswerKeyPage,
      generationSeed: plan.generationSeed,
      selectionMode: plan.selectionMode,
      selectedKnowledgePointIds: cloneValue(plan.selectedKnowledgePointIds ?? []),
      selectedPatternGroupIds: cloneValue(plan.selectedPatternGroupIds ?? []),
      printLayout,
      answerKeyPrintLayout,
      rendererProfileId: G4B_U01_HORIZONTAL_NUMERIC_RENDERER_PROFILE.profileId,
    },
    generationContext: {
      questionKind: "batchAWorksheet",
      generationMode: "batchAKnowledgePoint",
      questionCount: productionQuestions.length,
      generationSeed: plan.generationSeed,
      orderingSeed: plan.generationSeed,
      resolvedOrderingSeed: plan.generationSeed,
      orderingMode: plan.ordering,
      patternIdsInRenderOrder: cloneValue(plan.patternSpecIds ?? []),
    },
    allocationResult: cloneValue(generated.allocation),
    generatedQuestions: cloneValue(productionQuestions),
    orderedQuestionIds: productionQuestions.map((question) => question.id),
    questionDisplayModels,
    answerKeyItems,
    questionPages,
    answerKeyPages,
    summary: {
      questionCount: productionQuestions.length,
      questionPageCount: questionPages.length,
      answerKeyPageCount: answerKeyPages.length,
      orderingMode: plan.ordering,
      patternIdsInRenderOrder: cloneValue(plan.patternSpecIds ?? []),
      numericQuestionCount: productionQuestions.length,
      applicationQuestionCount: 0,
    },
    generationReport: generationReport(
      plan,
      generated.allocation,
      productionQuestions,
      generated.errors ?? [],
      combinedWarnings,
    ),
  };

  return {
    ok: true,
    worksheetDocument,
    generation: { ...generated, questions: productionQuestions },
    validation: combinedValidation,
    eligibility,
    errors: [],
    warnings: combinedWarnings,
  };
}
