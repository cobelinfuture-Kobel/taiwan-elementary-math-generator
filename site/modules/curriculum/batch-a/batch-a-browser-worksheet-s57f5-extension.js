import {
  createAnswerKeyItem,
  createQuestionDisplayModel,
  paginateAnswerKeyItems,
  paginateQuestionDisplayModels
} from "../../core/index.js";
import { buildBatchABrowserWorksheetDocument as buildBaseBatchABrowserWorksheetDocument } from "./batch-a-browser-worksheet.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator.js";
import { generateBatchABrowserQuestions } from "./batch-a-browser-question-router.js";
import {
  G3B_U04_CANONICAL_ROUTE_KINDS,
  classifyG3BU04CanonicalRouterPlan
} from "./g3b-u04-canonical-semantic-router.js";
import {
  G3B_U04_PRODUCTION_WORKSHEET_ELIGIBILITY,
  isG3BU04ProductionWorksheetPlan,
  validateG3BU04ProductionWorksheetEligibility
} from "./g3b-u04-production-eligibility.js";
import {
  G3B_U04_CANONICAL_VALIDATOR_INTEGRATION,
  validateBatchABrowserQuestions
} from "./batch-a-browser-validator-s57f5-extension.js";
import { BATCH_A_BROWSER_SCOPE } from "./production-eligibility.js";

export const G3B_U04_SEMANTIC_LONG_TEXT_LAYOUT_PROFILE = Object.freeze({
  profileId: "g3b_u04_semantic_long_text_v1",
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
    sourceId: "g3b_u04_3b04",
    kind: "g3bU04SemanticWordProblem"
  })
});

export const G3B_U04_CANONICAL_WORKSHEET_INTEGRATION = Object.freeze({
  task: "S57F5_G3B_U04_CanonicalValidatorWorksheetAndRendererIntegration",
  status: "canonical_validator_worksheet_renderer_integrated",
  schemaVersion: "worksheet-document-v1",
  semanticLongTextProfile: G3B_U04_SEMANTIC_LONG_TEXT_LAYOUT_PROFILE.profileId,
  unrelatedWorksheetDensityChanged: false,
  requiredNextGate: "S57F6_G3B_U04_PublicSelectorAndPrintControlsQA"
});

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  }
  return value;
}

function isSemanticQuestion(question = {}) {
  return question?.sourceId === "g3b_u04_3b04"
    && question?.kind === "g3bU04SemanticWordProblem";
}

function positiveInteger(value, fallback) {
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function normalizeQuestionLayout(options = {}) {
  const requested = options.printLayout ?? {};
  const profile = G3B_U04_SEMANTIC_LONG_TEXT_LAYOUT_PROFILE.questionSheet;
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
  const profile = G3B_U04_SEMANTIC_LONG_TEXT_LAYOUT_PROFILE.answerKey;
  return {
    paperSize: questionLayout.paperSize ?? profile.paperSize,
    columns: profile.columns,
    rowsPerPage: profile.rowsPerPage,
    showQuestionNumbers: questionLayout.showQuestionNumbers,
    showAnswerKeyPage: questionLayout.showAnswerKeyPage,
    longTextCardPolicy: profile.longTextCardPolicy
  };
}

function semanticDisplayModel(question, questionNumber, showQuestionNumbers) {
  return {
    questionId: question.id,
    questionNumber,
    patternId: question.patternSpecId,
    knowledgePointId: question.knowledgePointId,
    patternGroupId: question.resolvedPatternGroupId ?? question.patternGroupId,
    templateFamilyId: question.templateFamilyId,
    questionNumberText: showQuestionNumbers ? `${questionNumber}.` : null,
    promptText: question.promptText,
    displayText: question.displayText,
    blankedDisplayText: question.blankedDisplayText,
    equationModel: question.equationModel,
    answerUnit: question.answerUnit,
    answerText: question.answerText,
    metadataSnapshot: cloneValue(question.metadata),
    semanticSnapshot: cloneValue(question.semanticSnapshot),
    layoutHints: {
      estimatedTextLength: String(question.blankedDisplayText ?? "").length,
      hasGrouping: true,
      avoidPageBreakInside: true,
      representation: "semantic_word_problem",
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
    promptText: question.blankedDisplayText,
    equationText: question.equationModel,
    answerText: question.answerText,
    answerUnit: question.answerUnit,
    eventSequence: cloneValue(question.eventSequence),
    metadataSnapshot: cloneValue(question.metadata),
    semanticSnapshot: cloneValue(question.semanticSnapshot),
    layoutHints: {
      estimatedTextLength: String(`${question.blankedDisplayText ?? ""}${question.equationModel ?? ""}${question.answerText ?? ""}`).length,
      avoidPageBreakInside: true,
      representation: "semantic_word_problem_answer",
      longTextCardPolicy: "avoidSplit"
    }
  };
}

function createDisplayModels(questions, printLayout) {
  return questions.map((question, index) => isSemanticQuestion(question)
    ? semanticDisplayModel(question, index + 1, printLayout.showQuestionNumbers)
    : createQuestionDisplayModel(question, index + 1, {
      showQuestionNumbers: printLayout.showQuestionNumbers
    }));
}

function createAnswerKeyItems(questions, displayModels) {
  return questions.map((question, index) => isSemanticQuestion(question)
    ? semanticAnswerKeyItem(question, index + 1)
    : createAnswerKeyItem(question, displayModels[index]));
}

function mergeValidationWarnings(validation, generationWarnings = []) {
  return {
    ...validation,
    warnings: [...generationWarnings, ...(validation?.warnings ?? [])]
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
    validation: details.validation ?? { ok: false, errors, warnings, infos: [], validatorVersion: G3B_U04_CANONICAL_VALIDATOR_INTEGRATION.validatorVersion, validatedAt: null },
    errors,
    warnings,
    ...details
  };
}

export function isS57F5G3BU04CanonicalWorksheetOptions(options = {}) {
  return isG3BU04ProductionWorksheetPlan(buildBatchABrowserPlan(options));
}

export function buildBatchABrowserWorksheetDocument(options = {}) {
  const initialPlan = buildBatchABrowserPlan(options);
  const routeKind = classifyG3BU04CanonicalRouterPlan(initialPlan);
  const semanticRoute = routeKind === G3B_U04_CANONICAL_ROUTE_KINDS.PURE_SEMANTIC
    || routeKind === G3B_U04_CANONICAL_ROUTE_KINDS.NUMERIC_SEMANTIC_HYBRID;
  if (!semanticRoute) return buildBaseBatchABrowserWorksheetDocument(options);

  const eligibility = validateG3BU04ProductionWorksheetEligibility(initialPlan);
  if (!eligibility.ok) return failedResult(eligibility.errors, eligibility.warnings, { eligibility });

  const generated = generateBatchABrowserQuestions(options);
  if (!generated.ok) {
    return failedResult(generated.errors ?? [], generated.warnings ?? [], { generation: generated, eligibility });
  }

  const validation = validateBatchABrowserQuestions(generated.questions, { plan: generated.plan });
  const combinedValidation = mergeValidationWarnings(validation, generated.warnings ?? []);
  if (!validation.ok) {
    return failedResult(validation.errors, combinedValidation.warnings, {
      generation: generated,
      validation: combinedValidation,
      eligibility
    });
  }

  const printLayout = normalizeQuestionLayout(options);
  const answerKeyPrintLayout = normalizeAnswerLayout(printLayout);
  const questionDisplayModels = createDisplayModels(generated.questions, printLayout);
  const answerKeyItems = printLayout.showAnswerKeyPage
    ? createAnswerKeyItems(generated.questions, questionDisplayModels)
    : [];
  const questionPages = paginateQuestionDisplayModels(questionDisplayModels, printLayout);
  const answerKeyPages = printLayout.showAnswerKeyPage
    ? paginateAnswerKeyItems(answerKeyItems, answerKeyPrintLayout)
    : [];
  const plan = generated.plan;
  const title = options.title ?? `Batch A ${plan.sourceUnit?.unitCode ?? "3B-U04"} 知識點加強`;
  const semanticQuestions = generated.questions.filter(isSemanticQuestion);
  const semanticKnowledgePointIds = [...new Set(semanticQuestions.map((question) => question.knowledgePointId))];
  const semanticTemplateFamilyIds = [...new Set(semanticQuestions.map((question) => question.templateFamilyId))];

  const worksheetDocument = {
    schemaVersion: "worksheet-document-v1",
    version: "1",
    worksheetId: `batch-a-${plan.sourceId}-${plan.selectionMode}-${plan.questionCount}-${plan.generationSeed}`,
    worksheetKind: "batchAWorksheet",
    title,
    subtitle: "Batch A visible KnowledgePoint canonical semantic worksheet",
    locale: "zh-Hant",
    generatedAt: null,
    visibilityStatus: "visible",
    productionUse: "allowed",
    promotionRegistryId: eligibility.promotionRegistryId,
    rendererProfile: cloneValue(G3B_U04_SEMANTIC_LONG_TEXT_LAYOUT_PROFILE),
    productionEligibility: cloneValue(eligibility),
    curriculumInfo: {
      publisher: "Batch A",
      grade: plan.sourceUnit?.grade ?? null,
      semester: plan.sourceUnit?.semester ?? null,
      unitNumber: plan.sourceUnit?.unitCode ?? "3B-U04",
      unitTitle: plan.sourceUnit?.title ?? "兩步驟計算",
      curriculumNodeIds: [plan.sourceId],
      canonicalSkillIds: [...new Set(semanticQuestions.flatMap((question) => question.metadata?.canonicalSkillIds ?? []))]
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
      routeKind: plan.routeKind ?? routeKind,
      knowledgePointIds: cloneValue(plan.selectedKnowledgePointIds ?? []),
      patternGroupIds: cloneValue(plan.selectedPatternGroupIds ?? []),
      patternSpecIds: cloneValue(plan.patternSpecIds ?? []),
      allocation: cloneValue(generated.allocation)
    },
    semanticSummary: {
      semanticQuestionCount: semanticQuestions.length,
      numericQuestionCount: generated.questions.length - semanticQuestions.length,
      knowledgePointCount: semanticKnowledgePointIds.length,
      templateFamilyCount: semanticTemplateFamilyIds.length,
      knowledgePointIds: semanticKnowledgePointIds,
      templateFamilyIds: semanticTemplateFamilyIds
    },
    provenance: {
      sourceType: "batch_a_browser_bridge",
      sourceTaskIds: [
        "S57F3_G3B_U04_ResolverAndBrowserStateIntegration",
        "S57F4_G3B_U04_CanonicalRouterAndHybridIntegration",
        "S57F5_G3B_U04_CanonicalValidatorWorksheetAndRendererIntegration"
      ],
      patternSpecIds: cloneValue(plan.patternSpecIds ?? []),
      curriculumNodeIds: [plan.sourceId],
      knowledgePointIds: cloneValue(plan.selectedKnowledgePointIds ?? []),
      patternGroupIds: cloneValue(plan.selectedPatternGroupIds ?? []),
      promotionRegistryId: eligibility.promotionRegistryId,
      productionStorageCategory: "none",
      notes: [BATCH_A_BROWSER_SCOPE.limit]
    },
    sections: [{
      sectionId: `section-${plan.sourceId}`,
      title: "知識點加強",
      description: null,
      patternIds: cloneValue(plan.patternSpecIds ?? []),
      questionIds: generated.questions.map((question) => question.id),
      orderingIndex: 0
    }],
    configSnapshot: {
      schemaVersion: "s57f5.batch_a.g3b_u04.canonical_worksheet_plan.v1",
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
      rendererProfileId: G3B_U04_SEMANTIC_LONG_TEXT_LAYOUT_PROFILE.profileId
    },
    generationContext: {
      questionKind: "batchAWorksheet",
      generationMode: "batchAKnowledgePoint",
      questionCount: generated.questions.length,
      generationSeed: plan.generationSeed,
      orderingSeed: plan.generationSeed,
      resolvedOrderingSeed: plan.generationSeed,
      orderingMode: plan.ordering,
      patternIdsInRenderOrder: cloneValue(plan.patternSpecIds ?? [])
    },
    allocationResult: cloneValue(generated.allocation),
    generatedQuestions: cloneValue(generated.questions),
    orderedQuestionIds: generated.questions.map((question) => question.id),
    questionDisplayModels,
    answerKeyItems,
    questionPages,
    answerKeyPages,
    summary: {
      questionCount: generated.questions.length,
      questionPageCount: questionPages.length,
      answerKeyPageCount: answerKeyPages.length,
      orderingMode: plan.ordering,
      patternIdsInRenderOrder: cloneValue(plan.patternSpecIds ?? []),
      semanticQuestionCount: semanticQuestions.length,
      numericQuestionCount: generated.questions.length - semanticQuestions.length
    },
    generationReport: createGenerationReport({
      plan,
      allocation: generated.allocation,
      questions: generated.questions,
      errors: generated.errors ?? [],
      warnings: combinedValidation.warnings
    })
  };

  return {
    ok: true,
    worksheetDocument,
    generation: generated,
    validation: combinedValidation,
    eligibility,
    errors: [],
    warnings: combinedValidation.warnings
  };
}
