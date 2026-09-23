import {
  paginateAnswerKeyItems,
  paginateQuestionDisplayModels
} from "../../core/index.js";
import {
  G3B_U04_GLOBAL_CONTEXT_PILOT_KNOWLEDGE_POINT_ID,
  G3B_U04_GLOBAL_CONTEXT_PILOT_MODE,
  G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID,
  G3B_U04_GLOBAL_CONTEXT_PILOT_RUNTIME,
  G3B_U04_GLOBAL_CONTEXT_PILOT_SOURCE_ID,
  generateG3BU04GlobalContextPilotQuestions
} from "./g3b-u04-global-context-pilot-runtime.js";
import {
  G3B_U04_SEMANTIC_LONG_TEXT_LAYOUT_PROFILE
} from "./batch-a-browser-worksheet-s57f5-extension.js";

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  }
  return value;
}

function questionDisplayModel(question, questionNumber) {
  return {
    questionId: question.id,
    questionNumber,
    patternId: question.patternSpecId,
    knowledgePointId: question.knowledgePointId,
    patternGroupId: question.resolvedPatternGroupId ?? question.patternGroupId,
    templateFamilyId: question.templateFamilyId,
    questionNumberText: `${questionNumber}.`,
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

function shadowBaselineQuestion(question) {
  return {
    ...cloneValue(question),
    selectorStatus: "hidden",
    visibilityStatus: "hidden",
    productionUse: "forbidden",
    generatorRouting: "canonical_resolver_shadow_baseline",
    globalContextPilot: {
      task: G3B_U04_GLOBAL_CONTEXT_PILOT_RUNTIME.task,
      mode: "gctx_p12r_before_baseline",
      runtimeResolvable: true,
      productionSelectable: false
    }
  };
}

function assemblePilotWorksheet(generated, options = {}, mode = "after") {
  const questions = mode === "before"
    ? generated.baseQuestions.map(shadowBaselineQuestion)
    : generated.questions.map(cloneValue);
  const includeAnswerKey = options.includeAnswerKey !== false;
  const questionLayout = {
    ...G3B_U04_SEMANTIC_LONG_TEXT_LAYOUT_PROFILE.questionSheet,
    showQuestionNumbers: true,
    showAnswerKeyPage: includeAnswerKey
  };
  const answerLayout = {
    ...G3B_U04_SEMANTIC_LONG_TEXT_LAYOUT_PROFILE.answerKey,
    showQuestionNumbers: true,
    showAnswerKeyPage: includeAnswerKey
  };
  const displayModels = questions.map((question, index) => questionDisplayModel(question, index + 1));
  const answerItems = includeAnswerKey
    ? questions.map((question, index) => semanticAnswerKeyItem(question, index + 1))
    : [];
  const questionPages = paginateQuestionDisplayModels(displayModels, questionLayout);
  const answerKeyPages = includeAnswerKey ? paginateAnswerKeyItems(answerItems, answerLayout) : [];
  const variantIds = questions.map((question) => question.globalContextPilot?.semanticVariantId).filter(Boolean);

  return {
    schemaVersion: "worksheet-document-v1",
    version: "1",
    worksheetId: `gctx-p12r-${mode}-${generated.plan.generationSeed}`,
    worksheetKind: "batchAWorksheet",
    title: mode === "before" ? "3B-U04 全域情境接入前" : "3B-U04 全域情境 Shadow Pilot",
    subtitle: mode === "before" ? "Canonical legacy context baseline" : "Canonical resolver + global context shadow runtime",
    locale: "zh-Hant",
    generatedAt: null,
    visibilityStatus: "hidden",
    productionUse: "forbidden",
    rendererProfile: cloneValue(G3B_U04_SEMANTIC_LONG_TEXT_LAYOUT_PROFILE),
    pilotRuntime: {
      task: G3B_U04_GLOBAL_CONTEXT_PILOT_RUNTIME.task,
      mode,
      canonicalResolverUsed: true,
      canonicalGeneratorUsed: true,
      productionRendererUsed: true,
      productionSelectable: false,
      publicRouteChanged: false
    },
    curriculumInfo: {
      publisher: "Batch A",
      grade: 3,
      semester: "B",
      unitNumber: "3B-U04",
      unitTitle: "兩步驟計算",
      curriculumNodeIds: [G3B_U04_GLOBAL_CONTEXT_PILOT_SOURCE_ID],
      canonicalSkillIds: ["integer_mixed_operations"]
    },
    studentFields: {
      showName: true,
      showDate: true,
      showClass: false,
      showScore: false,
      labels: { name: "姓名", date: "日期", className: "班級", score: "分數" }
    },
    printOptions: {
      paperSize: "A4",
      orientation: "portrait",
      columns: questionLayout.columns,
      rowsPerPage: questionLayout.rowsPerPage,
      answerKeyColumns: answerLayout.columns,
      answerKeyRowsPerPage: answerLayout.rowsPerPage,
      fontSizeMode: "normal",
      showQuestionNumbers: true,
      showAnswerKey: includeAnswerKey,
      answerKeyPlacement: includeAnswerKey ? "afterQuestions" : "none",
      pageBreakMode: "avoidLongTextCards",
      marginMode: "default",
      debugDataAttributes: false
    },
    validationSummary: cloneValue(generated.validation),
    batchA: {
      sourceId: generated.plan.sourceId,
      selectionMode: generated.plan.selectionMode,
      routeKind: "g3b_u04_global_context_shadow_pilot",
      knowledgePointIds: [G3B_U04_GLOBAL_CONTEXT_PILOT_KNOWLEDGE_POINT_ID],
      patternGroupIds: cloneValue(generated.plan.selectedPatternGroupIds),
      patternSpecIds: [G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID],
      allocation: cloneValue(generated.allocation)
    },
    semanticSummary: {
      semanticQuestionCount: questions.length,
      numericQuestionCount: 0,
      knowledgePointCount: 1,
      templateFamilyCount: 1,
      globalContextVariantCount: new Set(variantIds).size,
      knowledgePointIds: [G3B_U04_GLOBAL_CONTEXT_PILOT_KNOWLEDGE_POINT_ID],
      templateFamilyIds: ["tpl_g3b_u04_add_divide_joint_purchase_equal_share"]
    },
    provenance: {
      sourceType: "gctx_shadow_runtime",
      sourceTaskIds: [
        "S57F4_G3B_U04_CanonicalRouterAndHybridIntegration",
        "S57F5_G3B_U04_CanonicalValidatorWorksheetAndRendererIntegration",
        G3B_U04_GLOBAL_CONTEXT_PILOT_RUNTIME.task
      ],
      patternSpecIds: [G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID],
      curriculumNodeIds: [G3B_U04_GLOBAL_CONTEXT_PILOT_SOURCE_ID],
      knowledgePointIds: [G3B_U04_GLOBAL_CONTEXT_PILOT_KNOWLEDGE_POINT_ID],
      patternGroupIds: cloneValue(generated.plan.selectedPatternGroupIds),
      productionStorageCategory: "none",
      notes: ["Shadow-only evidence. No public selector or production admission."]
    },
    sections: [{
      sectionId: `section-${mode}`,
      title: mode === "before" ? "接入前題目" : "全域情境題目",
      description: null,
      patternIds: [G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID],
      questionIds: questions.map((question) => question.id),
      orderingIndex: 0
    }],
    configSnapshot: {
      schemaVersion: "gctx-p12r-shadow-pilot-v1",
      sourceId: generated.plan.sourceId,
      questionCount: questions.length,
      ordering: "groupedByPattern",
      includeAnswerKey,
      generationSeed: generated.plan.generationSeed,
      pilotMode: G3B_U04_GLOBAL_CONTEXT_PILOT_MODE,
      rendererProfileId: G3B_U04_SEMANTIC_LONG_TEXT_LAYOUT_PROFILE.profileId
    },
    generationContext: {
      questionKind: "batchAWorksheet",
      generationMode: "gctxGlobalContextShadowPilot",
      questionCount: questions.length,
      generationSeed: generated.plan.generationSeed,
      orderingSeed: generated.plan.generationSeed,
      resolvedOrderingSeed: generated.plan.generationSeed,
      orderingMode: "groupedByPattern",
      patternIdsInRenderOrder: [G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID]
    },
    allocationResult: cloneValue(generated.allocation),
    generatedQuestions: cloneValue(questions),
    orderedQuestionIds: questions.map((question) => question.id),
    questionDisplayModels: displayModels,
    answerKeyItems: answerItems,
    questionPages,
    answerKeyPages,
    summary: {
      questionCount: questions.length,
      questionPageCount: questionPages.length,
      answerKeyPageCount: answerKeyPages.length,
      orderingMode: "groupedByPattern",
      patternIdsInRenderOrder: [G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID],
      semanticQuestionCount: questions.length,
      numericQuestionCount: 0,
      globalContextVariantCount: new Set(variantIds).size
    },
    generationReport: {
      requestedQuestionCount: questions.length,
      generatedQuestionCount: questions.length,
      totalAttempts: questions.length,
      duplicateRejectCount: 0,
      constraintRejectCount: 0,
      patternReports: [{
        patternId: G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID,
        requestedQuestionCount: questions.length,
        generatedQuestionCount: questions.length,
        failureCount: 0,
        warnings: []
      }],
      validationWarnings: [],
      generationWarnings: [],
      errors: []
    }
  };
}

export function buildG3BU04GlobalContextPilotWorksheetDocuments(options = {}) {
  const generated = generateG3BU04GlobalContextPilotQuestions(options);
  if (!generated.ok) {
    return {
      ok: false,
      beforeWorksheetDocument: null,
      afterWorksheetDocument: null,
      generation: generated,
      errors: generated.errors,
      warnings: generated.warnings
    };
  }
  return {
    ok: true,
    beforeWorksheetDocument: assemblePilotWorksheet(generated, options, "before"),
    afterWorksheetDocument: assemblePilotWorksheet(generated, options, "after"),
    generation: generated,
    errors: [],
    warnings: []
  };
}
