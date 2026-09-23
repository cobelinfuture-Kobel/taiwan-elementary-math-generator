import {
  paginateAnswerKeyItems,
  paginateQuestionDisplayModels
} from "../../core/index.js";
import { buildBatchABrowserWorksheetDocument as buildBaseBatchABrowserWorksheetDocument } from "./batch-a-browser-worksheet-s57f5-extension.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator.js";
import { generateBatchABrowserQuestions } from "./batch-a-browser-question-router.js";
import {
  G3B_U08_CANONICAL_ROUTE_KINDS,
  classifyG3BU08CanonicalRouterPlan
} from "./g3b-u08-canonical-semantic-router.js";
import {
  G3B_U08_PRODUCTION_WORKSHEET_ELIGIBILITY,
  isG3BU08ProductionWorksheetPlan,
  validateG3BU08ProductionWorksheetEligibility
} from "./g3b-u08-production-eligibility.js";
import {
  G3B_U08_CANONICAL_VALIDATOR_INTEGRATION,
  validateBatchABrowserQuestions
} from "./batch-a-browser-validator-s58h-extension.js";
import {
  G3B_U08_PRODUCTION_PROMOTION_OVERLAY_ID
} from "../registry/g3b-u08-semantic-production-promotion.js";
import {
  G3B_U08_SEMANTIC_PROMOTION_REGISTRY_ID
} from "../registry/g3b-u08-semantic-promotion.js";
import { BATCH_A_BROWSER_SCOPE } from "./production-eligibility.js";

export const G3B_U08_SEMANTIC_LONG_TEXT_LAYOUT_PROFILE = Object.freeze({
  profileId: "g3b_u08_semantic_long_text_v1",
  questionSheet: Object.freeze({
    paperSize: "A4",
    columns: 2,
    rowsPerPage: 4,
    longTextCardPolicy: "avoidSplit"
  }),
  answerKey: Object.freeze({
    paperSize: "A4",
    columns: 1,
    rowsPerPage: 8,
    longTextCardPolicy: "avoidSplit"
  }),
  appliesWhen: Object.freeze({
    sourceId: "g3b_u08_3b08",
    kind: "g3bU08SemanticApplication"
  })
});

export const G3B_U08_CANONICAL_WORKSHEET_INTEGRATION = Object.freeze({
  task: "S58H_G3B_U08_CanonicalValidatorWorksheetAndRendererIntegration",
  status: "canonical_validator_worksheet_renderer_integrated",
  schemaVersion: "worksheet-document-v1",
  semanticLongTextProfile: G3B_U08_SEMANTIC_LONG_TEXT_LAYOUT_PROFILE.profileId,
  applicationOnly: true,
  horizontalOnly: true,
  unrelatedWorksheetDensityChanged: false,
  publicPrintControlBehaviorChanged: false,
  requiredNextGate: "S58I_G3B_U08_PublicSelectorAndPrintControlsQA"
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
  const profile = G3B_U08_SEMANTIC_LONG_TEXT_LAYOUT_PROFILE.questionSheet;
  return {
    paperSize: requested.paperSize ?? profile.paperSize,
    columns: Math.min(positiveInteger(requested.columns, 4), profile.columns),
    rowsPerPage: Math.min(positiveInteger(requested.rowsPerPage, 10), profile.rowsPerPage),
    showQuestionNumbers: requested.showQuestionNumbers !== false,
    showAnswerKeyPage: options.includeAnswerKey !== false && requested.showAnswerKeyPage !== false,
    longTextCardPolicy: profile.longTextCardPolicy
  };
}

function normalizeAnswerLayout(questionLayout) {
  const profile = G3B_U08_SEMANTIC_LONG_TEXT_LAYOUT_PROFILE.answerKey;
  return {
    paperSize: questionLayout.paperSize ?? profile.paperSize,
    columns: profile.columns,
    rowsPerPage: profile.rowsPerPage,
    showQuestionNumbers: questionLayout.showQuestionNumbers,
    showAnswerKeyPage: questionLayout.showAnswerKeyPage,
    longTextCardPolicy: profile.longTextCardPolicy
  };
}

function isSemanticQuestion(question = {}) {
  return question?.sourceId === "g3b_u08_3b08"
    && question?.kind === "g3bU08SemanticApplication";
}

function promoteQuestionForWorksheet(question = {}) {
  const promoted = cloneValue(question);
  promoted.phase = "S58H";
  promoted.selectorStatus = "visible";
  promoted.visibilityStatus = "visible";
  promoted.productionUse = "allowed";
  promoted.promotionRegistryId = G3B_U08_PRODUCTION_PROMOTION_OVERLAY_ID;
  promoted.generatorRouting = "canonical_resolver_allocation";
  promoted.semanticSnapshot = {
    ...(promoted.semanticSnapshot ?? {}),
    runtimeStatus: "production_worksheet",
    resolverDerived: true,
    productionPromotionOverlayId: G3B_U08_PRODUCTION_PROMOTION_OVERLAY_ID,
    basePromotionRegistryId: G3B_U08_SEMANTIC_PROMOTION_REGISTRY_ID
  };
  promoted.metadata = {
    ...(promoted.metadata ?? {}),
    productionPromotionOverlayId: G3B_U08_PRODUCTION_PROMOTION_OVERLAY_ID,
    basePromotionRegistryId: G3B_U08_SEMANTIC_PROMOTION_REGISTRY_ID,
    patternTags: [...new Set([...(promoted.metadata?.patternTags ?? []), "s58h_canonical_worksheet"])]
  };
  return promoted;
}

function semanticDisplayModel(question, questionNumber, showQuestionNumbers) {
  return {
    questionId: question.id,
    questionNumber,
    patternId: question.patternSpecId,
    knowledgePointId: question.knowledgePointId,
    patternGroupId: question.resolvedPatternGroupId ?? question.patternGroupId,
    templateFamilyId: question.templateFamilyId,
    contextVariantId: question.contextVariantId,
    questionNumberText: showQuestionNumbers ? `${questionNumber}.` : null,
    promptText: question.promptText,
    displayText: question.displayText,
    blankedDisplayText: question.blankedDisplayText,
    equationModel: question.equationModel,
    answerUnit: question.finalAnswerUnit,
    answerText: question.answerText,
    finalAnswerWithUnit: question.finalAnswerWithUnit,
    metadataSnapshot: cloneValue(question.metadata),
    semanticSnapshot: cloneValue(question.semanticSnapshot),
    layoutHints: {
      estimatedTextLength: String(question.blankedDisplayText ?? "").length,
      hasGrouping: true,
      avoidPageBreakInside: true,
      representation: "semantic_word_problem",
      sourceRepresentation: "horizontal_only",
      longTextCardPolicy: "avoidSplit"
    }
  };
}

function semanticAnswerKeyItem(question, questionNumber) {
  return {
    questionId: question.id,
    questionNumber,
    patternId: question.patternSpecId,
    knowledgePointId: question.knowledgePointId,
    patternGroupId: question.resolvedPatternGroupId ?? question.patternGroupId,
    templateFamilyId: question.templateFamilyId,
    contextVariantId: question.contextVariantId,
    promptText: question.blankedDisplayText,
    equationText: question.equationModel,
    answerText: question.answerText,
    answerUnit: question.finalAnswerUnit,
    finalAnswerWithUnit: question.finalAnswerWithUnit,
    eventSequence: cloneValue(question.eventSequence),
    metadataSnapshot: cloneValue(question.metadata),
    semanticSnapshot: cloneValue(question.semanticSnapshot),
    layoutHints: {
      estimatedTextLength: String(`${question.blankedDisplayText ?? ""}${question.equationModel ?? ""}${question.answerText ?? ""}`).length,
      avoidPageBreakInside: true,
      representation: "semantic_word_problem_answer",
      sourceRepresentation: "horizontal_only",
      longTextCardPolicy: "avoidSplit"
    }
  };
}

function createGenerationReport({ plan, allocation, questions, errors, warnings }) {
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
      warnings: []
    })),
    validationWarnings: warnings,
    generationWarnings: warnings,
    errors
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
      validatorVersion: G3B_U08_CANONICAL_VALIDATOR_INTEGRATION.validatorVersion,
      validatedAt: null
    },
    errors,
    warnings,
    ...details
  };
}

export function isS58HG3BU08CanonicalWorksheetOptions(options = {}) {
  return isG3BU08ProductionWorksheetPlan(buildBatchABrowserPlan(options));
}

export function buildBatchABrowserWorksheetDocument(options = {}) {
  const initialPlan = buildBatchABrowserPlan(options);
  if (classifyG3BU08CanonicalRouterPlan(initialPlan) !== G3B_U08_CANONICAL_ROUTE_KINDS.PURE_SEMANTIC) {
    return buildBaseBatchABrowserWorksheetDocument(options);
  }

  const eligibility = validateG3BU08ProductionWorksheetEligibility(initialPlan);
  if (!eligibility.ok) return failedResult(eligibility.errors, eligibility.warnings, { eligibility });

  const generated = generateBatchABrowserQuestions(options);
  if (!generated.ok) {
    return failedResult(generated.errors ?? [], generated.warnings ?? [], { generation: generated, eligibility });
  }

  const productionQuestions = (generated.questions ?? []).map(promoteQuestionForWorksheet);
  const validation = validateBatchABrowserQuestions(productionQuestions, { plan: generated.plan });
  const combinedValidation = {
    ...validation,
    warnings: [...(generated.warnings ?? []), ...(validation.warnings ?? [])]
  };
  if (!validation.ok) {
    return failedResult(validation.errors, combinedValidation.warnings, {
      generation: generated,
      validation: combinedValidation,
      eligibility
    });
  }

  const printLayout = normalizeQuestionLayout(options);
  const answerKeyPrintLayout = normalizeAnswerLayout(printLayout);
  const questionDisplayModels = productionQuestions.map((question, index) => semanticDisplayModel(question, index + 1, printLayout.showQuestionNumbers));
  const answerKeyItems = printLayout.showAnswerKeyPage
    ? productionQuestions.map((question, index) => semanticAnswerKeyItem(question, index + 1))
    : [];
  const questionPages = paginateQuestionDisplayModels(questionDisplayModels, printLayout);
  const answerKeyPages = printLayout.showAnswerKeyPage
    ? paginateAnswerKeyItems(answerKeyItems, answerKeyPrintLayout)
    : [];
  const plan = generated.plan;
  const title = options.title ?? `Batch A ${plan.sourceUnit?.unitCode ?? "3B-U08"} 應用題加強`;
  const knowledgePointIds = [...new Set(productionQuestions.map((question) => question.knowledgePointId))];
  const templateFamilyIds = [...new Set(productionQuestions.map((question) => question.templateFamilyId))];

  const worksheetDocument = {
    schemaVersion: "worksheet-document-v1",
    version: "1",
    worksheetId: `batch-a-${plan.sourceId}-${plan.selectionMode}-${plan.questionCount}-${plan.generationSeed}`,
    worksheetKind: "batchAWorksheet",
    title,
    subtitle: "Batch A 3B-U08 應用題 canonical semantic worksheet",
    locale: "zh-Hant",
    generatedAt: null,
    visibilityStatus: "visible",
    productionUse: "allowed",
    promotionRegistryId: G3B_U08_PRODUCTION_PROMOTION_OVERLAY_ID,
    basePromotionRegistryId: G3B_U08_SEMANTIC_PROMOTION_REGISTRY_ID,
    rendererProfile: cloneValue(G3B_U08_SEMANTIC_LONG_TEXT_LAYOUT_PROFILE),
    productionEligibility: cloneValue(eligibility),
    curriculumInfo: {
      publisher: "Batch A",
      grade: plan.sourceUnit?.grade ?? 3,
      semester: plan.sourceUnit?.semester ?? "B",
      unitNumber: plan.sourceUnit?.unitCode ?? "3B-U08",
      unitTitle: plan.sourceUnit?.title ?? "乘法與除法",
      curriculumNodeIds: [plan.sourceId],
      canonicalSkillIds: [...new Set(productionQuestions.flatMap((question) => question.metadata?.canonicalSkillIds ?? []))]
    },
    studentFields: {
      showName: true,
      showDate: true,
      showClass: false,
      showScore: false,
      labels: { name: "姓名", date: "日期", className: "班級", score: "分數" }
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
      debugDataAttributes: false
    },
    validationSummary: combinedValidation,
    batchA: {
      sourceId: plan.sourceId,
      selectionMode: plan.selectionMode,
      routeKind: plan.routeKind ?? G3B_U08_CANONICAL_ROUTE_KINDS.PURE_SEMANTIC,
      knowledgePointIds: cloneValue(plan.selectedKnowledgePointIds ?? []),
      patternGroupIds: cloneValue(plan.selectedPatternGroupIds ?? []),
      patternSpecIds: cloneValue(plan.patternSpecIds ?? []),
      allocation: cloneValue(generated.allocation)
    },
    semanticSummary: {
      semanticQuestionCount: productionQuestions.length,
      numericQuestionCount: 0,
      knowledgePointCount: knowledgePointIds.length,
      templateFamilyCount: templateFamilyIds.length,
      knowledgePointIds,
      templateFamilyIds,
      applicationOnly: true,
      horizontalOnly: true
    },
    provenance: {
      sourceType: "batch_a_browser_bridge",
      sourceTaskIds: [
        "S58G_G3B_U08_ResolverBrowserStateAndCanonicalRouterIntegration",
        "S58H_G3B_U08_CanonicalValidatorWorksheetAndRendererIntegration"
      ],
      patternSpecIds: cloneValue(plan.patternSpecIds ?? []),
      curriculumNodeIds: [plan.sourceId],
      knowledgePointIds: cloneValue(plan.selectedKnowledgePointIds ?? []),
      patternGroupIds: cloneValue(plan.selectedPatternGroupIds ?? []),
      promotionRegistryId: G3B_U08_PRODUCTION_PROMOTION_OVERLAY_ID,
      basePromotionRegistryId: G3B_U08_SEMANTIC_PROMOTION_REGISTRY_ID,
      productionStorageCategory: "none",
      notes: [BATCH_A_BROWSER_SCOPE.limit]
    },
    sections: [{
      sectionId: `section-${plan.sourceId}`,
      title: "應用題加強",
      description: null,
      patternIds: cloneValue(plan.patternSpecIds ?? []),
      questionIds: productionQuestions.map((question) => question.id),
      orderingIndex: 0
    }],
    configSnapshot: {
      schemaVersion: "s58h.batch_a.g3b_u08.canonical_worksheet_plan.v1",
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
      rendererProfileId: G3B_U08_SEMANTIC_LONG_TEXT_LAYOUT_PROFILE.profileId
    },
    generationContext: {
      questionKind: "batchAWorksheet",
      generationMode: "batchAKnowledgePoint",
      questionCount: productionQuestions.length,
      generationSeed: plan.generationSeed,
      orderingSeed: plan.generationSeed,
      resolvedOrderingSeed: plan.generationSeed,
      orderingMode: plan.ordering,
      patternIdsInRenderOrder: cloneValue(plan.patternSpecIds ?? [])
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
      semanticQuestionCount: productionQuestions.length,
      numericQuestionCount: 0
    },
    generationReport: createGenerationReport({
      plan,
      allocation: generated.allocation,
      questions: productionQuestions,
      errors: generated.errors ?? [],
      warnings: combinedValidation.warnings
    })
  };

  return {
    ok: true,
    worksheetDocument,
    generation: { ...generated, questions: productionQuestions },
    validation: combinedValidation,
    eligibility,
    errors: [],
    warnings: combinedValidation.warnings
  };
}
