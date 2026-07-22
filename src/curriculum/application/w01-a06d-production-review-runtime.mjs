import {
  paginateAnswerKeyItems,
  paginateQuestionDisplayModels
} from '../../../site/modules/core/index.js';
import {
  materializeW01RelationSurfaceRemediationRuntime,
  validateW01RelationSurfaceRemediationRuntime
} from './w01-relation-surface-remediation-runtime.mjs';

const TASK_ID = 'POSTG-APP-W01-A06D_RegeneratedHTMLPDFHumanReviewPackage';
const REVIEW_MODE = 'postg_app_w01_a06d_regenerated_human_review';

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const uniqueSorted = (values) => [...new Set(values)].sort();
const issue = (code, path, details = {}) => ({ code, path, ...details });

function displayModel(question, questionNumber) {
  return {
    questionId: question.id,
    questionNumber,
    patternId: question.patternSpecId ?? question.metadata?.patternId ?? null,
    knowledgePointId: question.knowledgePointId,
    questionNumberText: `${questionNumber}.`,
    promptText: question.promptText,
    displayText: question.displayText,
    blankedDisplayText: question.blankedDisplayText,
    answerText: question.answerText,
    metadataSnapshot: clone(question.metadata),
    semanticSnapshot: clone(question.semanticSnapshot),
    layoutHints: {
      estimatedTextLength: String(question.blankedDisplayText ?? '').length,
      hasGrouping: true,
      avoidPageBreakInside: true,
      representation: question.applicationReview?.surfaceMode?.startsWith('NUMERIC_PRESERVED')
        ? 'numeric_preserved_review_candidate'
        : 'relation_application_review_candidate',
      longTextCardPolicy: 'avoidSplit'
    }
  };
}

function answerKeyItem(question, model) {
  const unit = typeof question.answerUnit === 'string' && question.answerUnit.length > 0
    ? question.answerUnit
    : null;
  const rawAnswer = question.answerText ?? '';
  const answerText = unit && !String(rawAnswer).endsWith(unit)
    ? `${rawAnswer}${unit}`
    : String(rawAnswer);
  return {
    questionId: question.id,
    questionNumber: model.questionNumber,
    patternId: model.patternId,
    knowledgePointId: question.knowledgePointId,
    promptText: question.blankedDisplayText,
    answerText,
    answerUnit: unit,
    interpretationStatement: question.applicationReview?.interpretationStatement ?? null,
    semanticClass: question.applicationReview?.semanticClass ?? null,
    suitability: question.applicationReview?.suitability ?? null,
    metadataSnapshot: clone(question.metadata),
    semanticSnapshot: clone(question.semanticSnapshot),
    layoutHints: {
      estimatedTextLength: String(`${question.blankedDisplayText ?? ''}${answerText}`).length,
      avoidPageBreakInside: true,
      representation: 'relation_application_review_answer'
    }
  };
}

function buildWorksheetDocument(rows) {
  const generatedQuestions = rows.map((row) => ({
    ...clone(row.transformed),
    productionUse: 'forbidden_pending_second_human_review',
    selectorStatus: 'hidden',
    visibilityStatus: 'hidden',
    applicationReview: {
      ...(clone(row.transformed.applicationReview) ?? {}),
      taskId: TASK_ID,
      reviewMode: REVIEW_MODE,
      humanReviewReady: true,
      humanNaturalnessReviewRequired: true,
      productionAdmissionAllowed: false
    }
  }));
  const questionDisplayModels = generatedQuestions.map((question, index) => displayModel(question, index + 1));
  const answerKeyItems = generatedQuestions.map((question, index) => answerKeyItem(question, questionDisplayModels[index]));
  const questionLayout = {
    paperSize: 'A4',
    columns: 1,
    rowsPerPage: 3,
    showQuestionNumbers: true,
    showAnswerKeyPage: true,
    longTextCardPolicy: 'avoidSplit'
  };
  const answerLayout = {
    ...questionLayout,
    rowsPerPage: 4
  };
  const questionPages = paginateQuestionDisplayModels(questionDisplayModels, questionLayout);
  const answerKeyPages = paginateAnswerKeyItems(answerKeyItems, answerLayout);
  return {
    schemaVersion: 'worksheet-document-v1',
    version: '1',
    worksheetId: 'postg-app-w01-a06d-regenerated-review',
    worksheetKind: 'applicationSemanticRemediationHumanReview',
    title: 'Wave 01 應用題語意修正版人工審核卷',
    subtitle: null,
    locale: 'zh-Hant',
    generatedAt: null,
    visibilityStatus: 'hidden_review_only',
    productionUse: 'forbidden_pending_second_human_review',
    generatedQuestions,
    questionDisplayModels,
    answerKeyItems,
    questionPages,
    answerKeyPages,
    printOptions: {
      paperSize: 'A4',
      columns: 1,
      rowsPerPage: 3,
      answerKeyColumns: 1,
      answerKeyRowsPerPage: 4,
      showAnswerKey: true,
      answerKeyPlacement: 'afterQuestions'
    },
    rendererProfile: {
      profileId: 'postg_app_w01_a06d_relation_review_long_text_v1',
      questionSheet: questionLayout,
      answerKey: answerLayout
    },
    reviewRuntime: {
      taskId: TASK_ID,
      reviewMode: REVIEW_MODE,
      exactProductionGeneratorUsed: true,
      productionRendererRequired: true,
      questionLevelMacroTitleVisible: false,
      humanReviewReady: true,
      productionSelectable: false,
      productionAdmissionGranted: false
    },
    validationSummary: {
      ok: true,
      errors: [],
      warnings: [],
      validatorVersion: 'postg-app-w01-a06d-review-v1',
      validatedAt: null
    },
    generationReport: {
      requestedQuestionCount: generatedQuestions.length,
      generatedQuestionCount: generatedQuestions.length,
      totalAttempts: generatedQuestions.length,
      exactGeneratorCount: generatedQuestions.length,
      validationWarnings: [],
      generationWarnings: [],
      errors: []
    },
    summary: {
      questionCount: generatedQuestions.length,
      answerKeyItemCount: answerKeyItems.length,
      questionPageCount: questionPages.length,
      answerKeyPageCount: answerKeyPages.length,
      sourceCount: uniqueSorted(generatedQuestions.map((question) => question.sourceId)).length,
      macroContextCount: uniqueSorted(generatedQuestions.map((question) => question.metadata?.contextMacroId)).length
    },
    configSnapshot: {
      schemaVersion: 'postg-app-w01-a06d-review-plan-v1',
      reviewMode: REVIEW_MODE,
      questionLevelMacroTitleVisible: false,
      productionAdmissionAllowed: false
    },
    provenance: {
      programId: 'POST_GOLDEN_APPLICATION_CAPABILITY_EXPANSION_V1',
      taskId: TASK_ID,
      sourceTaskIds: [
        'POSTG-APP-W01-A05_UnitFlowExactGeneratorRendererAndHumanReviewRemediation',
        'POSTG-APP-W01-A06_HumanReviewDecisionAndProductionAdmissionRemediation',
        'POSTG-APP-W01-A06B_SemanticClassQuantitySchemaAndValidatorRuntime',
        'POSTG-APP-W01-A06C_RelationSpecificSurfaceTemplatesAndTitleSuppression'
      ],
      exactGeneratorLineageRequired: true,
      productionRendererRequired: true,
      secondHumanReviewRequired: true,
      freeFormAIUsed: false
    }
  };
}

function buildReviewPairs(rows) {
  return rows.map((row) => ({
    bindingCandidateId: row.bindingCandidateId,
    sourceId: row.sourceId,
    knowledgePointId: row.knowledgePointId,
    macroContextId: row.transformed.metadata?.contextMacroId ?? null,
    exactPatternSpecId: row.exactPatternSpecId,
    exactPatternGroupId: row.exactPatternGroupId,
    semanticClass: row.semanticClass,
    suitability: row.suitability,
    surfaceMode: row.surface.surfaceMode,
    templateFamilyId: row.surface.templateFamilyId,
    originalPrompt: row.originalPrompt,
    rejectedA05Prompt: row.oldReviewPrompt,
    remediatedPrompt: row.remediatedPrompt,
    answerText: row.transformed.answerText ?? null,
    answerUnit: row.surface.answerUnit,
    quantityFacts: clone(row.surface.quantityFacts),
    relationEvidence: clone(row.surface.relationEvidence),
    mathPreserved: row.mathPreserved,
    numberFactsPreserved: row.numberMultisetPreserved,
    questionLevelMacroTitleVisible: false,
    humanNaturalnessReviewRequired: true
  }));
}

function buildUnitReviewRows(rows) {
  return rows.map((row) => ({
    bindingCandidateId: row.bindingCandidateId,
    sourceId: row.sourceId,
    knowledgePointId: row.knowledgePointId,
    semanticClass: row.semanticClass,
    suitability: row.suitability,
    rejectedA05AnswerUnit: row.oldReviewPrompt == null
      ? null
      : row.transformed.applicationReview?.unitFlow?.resolvedAnswerUnitCandidate ?? null,
    remediatedAnswerUnit: row.surface.answerUnit,
    answerShape: row.transformed.semanticSnapshot?.applicationRemediation?.answerSchema?.answerShape ?? null,
    unitPolicy: row.transformed.semanticSnapshot?.applicationRemediation?.answerSchema?.unitPolicy ?? null,
    reviewStatus: 'SECOND_HUMAN_REVIEW_REQUIRED',
    productionAdmissionAllowed: false
  }));
}

export function materializeW01A06DProductionReview(options = {}) {
  const relationRuntime = options.relationRuntime
    ?? materializeW01RelationSurfaceRemediationRuntime({ root: options.root ?? process.cwd() });
  const relationValidation = validateW01RelationSurfaceRemediationRuntime(relationRuntime);
  if (!relationValidation.ok) {
    throw new Error(JSON.stringify(relationValidation.issues));
  }
  const rows = relationRuntime.rows;
  const worksheetDocument = buildWorksheetDocument(rows);
  const reviewPairs = buildReviewPairs(rows);
  const unitReviewRows = buildUnitReviewRows(rows);
  const selectedSources = uniqueSorted(reviewPairs.map((row) => row.sourceId));
  const selectedMacros = uniqueSorted(reviewPairs.map((row) => row.macroContextId));
  return {
    programId: 'POST_GOLDEN_APPLICATION_CAPABILITY_EXPANSION_V1',
    taskId: TASK_ID,
    status: 'REGENERATED_PRODUCTION_REVIEW_DOCUMENT_READY',
    actualEvidenceLevel: 'E3_SHADOW_RUNTIME_INTEGRATED',
    productionAdmissionAllowed: false,
    productionSelectable: false,
    publicRouteChanged: false,
    relationRuntime,
    relationValidation,
    rows,
    worksheetDocument,
    reviewPairs,
    unitReviewRows,
    selectedSources,
    selectedMacros,
    pblReviewSections: clone(relationRuntime.a05.pblReviewSections ?? []),
    reviewBoundary: {
      exactProductionGeneratorUsed: true,
      productionRendererRequired: true,
      questionLevelMacroTitleVisible: false,
      htmlOutputVerified: false,
      pdfOutputVerified: false,
      reviewDocumentReady: true,
      humanReviewReady: false,
      humanDecisionRecorded: false,
      productionAdmissionGranted: false
    }
  };
}

export function validateW01A06DProductionReview(materialized) {
  const issues = [];
  const rows = materialized.rows ?? [];
  const document = materialized.worksheetDocument;
  const reviewPairs = materialized.reviewPairs ?? [];
  const forbiddenMacroPrefixCount = rows.filter((row) => /^在(?:公益、合作與資源共享|商業、交易與預算|社區、公民與公共服務|文化、歷史與地方記憶|資料、統計與公共資訊|防災、應變與韌性|環境保護與生態保育|食物、農業與生產|未來生活與永續設計|健康、運動與競賽|家庭與日常生活|學校與學習|科學、科技與觀察|交通、移動與行程|水資源與能源|工作流程、物流與配送)/u.test(row.remediatedPrompt)).length;
  const genericVisibleUnitCount = rows.flatMap((row) => row.surface.quantityFacts ?? [])
    .filter((fact) => ['份', 'UNBOUND_UNIT_CANDIDATE'].includes(fact.unit)).length;
  const visibleTitleCount = rows.filter((row) => row.visibleTitle != null
    || row.transformed.applicationReview?.visibleTitle != null).length;
  const applicationRows = rows.filter((row) => row.surface?.surfaceMode?.startsWith('RELATION_APPLICATION'));
  const numericRows = rows.filter((row) => row.surface?.surfaceMode?.startsWith('NUMERIC_PRESERVED'));

  if (!materialized.relationValidation?.ok) {
    issues.push(issue('POSTG_APP_W01_A06D_RELATION_RUNTIME_INVALID', 'relationRuntime', {
      issues: materialized.relationValidation?.issues ?? []
    }));
  }
  if (rows.length !== 16 || reviewPairs.length !== 16) {
    issues.push(issue('POSTG_APP_W01_A06D_REVIEW_COUNT_INVALID', 'rows', {
      rowCount: rows.length,
      reviewPairCount: reviewPairs.length
    }));
  }
  if (materialized.selectedSources.length !== 12) {
    issues.push(issue('POSTG_APP_W01_A06D_SOURCE_COVERAGE_INVALID', 'selectedSources', {
      actual: materialized.selectedSources
    }));
  }
  if (materialized.selectedMacros.length !== 16) {
    issues.push(issue('POSTG_APP_W01_A06D_MACRO_METADATA_COVERAGE_INVALID', 'selectedMacros', {
      actual: materialized.selectedMacros
    }));
  }
  if (rows.some((row) => !row.mathPreserved)) {
    issues.push(issue('APPSEM_MATHEMATICAL_WITNESS_DRIFT', 'rows'));
  }
  if (rows.some((row) => !row.numberMultisetPreserved)) {
    issues.push(issue('APPSEM_NUMERIC_FACT_DRIFT', 'rows'));
  }
  if (rows.some((row) => !row.promptChangedFromRejectedA05)) {
    issues.push(issue('APPSEM_REJECTED_PROMPT_NOT_REMEDIATED', 'rows'));
  }
  if (visibleTitleCount !== 0 || forbiddenMacroPrefixCount !== 0) {
    issues.push(issue('APPSEM_VISIBLE_MACRO_LABEL_FORBIDDEN', 'rows', {
      visibleTitleCount,
      forbiddenMacroPrefixCount
    }));
  }
  if (genericVisibleUnitCount !== 0) {
    issues.push(issue('APPSEM_GENERIC_VISIBLE_UNIT_FORBIDDEN', 'rows', {
      genericVisibleUnitCount
    }));
  }
  if (applicationRows.length === 0 || numericRows.length === 0) {
    issues.push(issue('POSTG_APP_W01_A06D_SURFACE_MODE_COVERAGE_INVALID', 'rows', {
      applicationSurfaceCount: applicationRows.length,
      numericPreservedCount: numericRows.length
    }));
  }
  if (!document || document.generatedQuestions.length !== 16
      || document.questionDisplayModels.length !== 16
      || document.answerKeyItems.length !== 16) {
    issues.push(issue('POSTG_APP_W01_A06D_WORKSHEET_PAIRING_INVALID', 'worksheetDocument'));
  } else {
    const questionIds = document.questionDisplayModels.map((row) => row.questionId);
    const answerIds = document.answerKeyItems.map((row) => row.questionId);
    if (JSON.stringify(questionIds) !== JSON.stringify(answerIds)) {
      issues.push(issue('POSTG_APP_W01_A06D_WORKSHEET_PAIRING_INVALID', 'worksheetDocument'));
    }
  }
  if (document?.reviewRuntime?.questionLevelMacroTitleVisible !== false
      || document?.reviewRuntime?.productionAdmissionGranted !== false) {
    issues.push(issue('POSTG_APP_W01_A06D_PRODUCTION_BOUNDARY_INVALID', 'worksheetDocument.reviewRuntime'));
  }
  if (materialized.productionAdmissionAllowed !== false
      || materialized.productionSelectable !== false
      || materialized.publicRouteChanged !== false) {
    issues.push(issue('POSTG_APP_W01_A06D_PRODUCTION_BOUNDARY_INVALID', 'materialized'));
  }

  const counts = {
    reviewCohortQuestionCount: rows.length,
    reviewCohortSourceCount: materialized.selectedSources.length,
    reviewCohortMacroContextCount: materialized.selectedMacros.length,
    mathPreservedCount: rows.filter((row) => row.mathPreserved).length,
    numberFactsPreservedCount: rows.filter((row) => row.numberMultisetPreserved).length,
    promptChangedCount: rows.filter((row) => row.promptChangedFromRejectedA05).length,
    visibleTitleCount,
    forbiddenMacroPrefixCount,
    genericVisibleUnitCount,
    applicationSurfaceCount: applicationRows.length,
    numericPreservedCount: numericRows.length,
    questionPageCount: document?.questionPages?.length ?? 0,
    answerKeyPageCount: document?.answerKeyPages?.length ?? 0,
    pblReviewSectionCount: materialized.pblReviewSections?.length ?? 0
  };
  return {
    ok: issues.length === 0,
    issues,
    counts,
    status: issues.length === 0
      ? 'REGENERATED_PRODUCTION_REVIEW_DOCUMENT_VALID'
      : 'REGENERATED_PRODUCTION_REVIEW_DOCUMENT_INVALID',
    reviewDocumentReady: issues.length === 0,
    productionAdmissionAllowed: false
  };
}

export function buildW01A06DProductionReviewReadback(options = {}) {
  const materialized = materializeW01A06DProductionReview(options);
  const validation = validateW01A06DProductionReview(materialized);
  return {
    taskId: materialized.taskId,
    status: validation.status,
    actualEvidenceLevel: materialized.actualEvidenceLevel,
    ok: validation.ok,
    issues: clone(validation.issues),
    reviewDocumentReady: validation.reviewDocumentReady,
    humanReviewReady: false,
    productionAdmissionGranted: false,
    productionSelectable: false,
    publicRouteChanged: false,
    counts: clone(validation.counts),
    selectedSources: clone(materialized.selectedSources),
    selectedMacros: clone(materialized.selectedMacros),
    worksheetDocument: clone(materialized.worksheetDocument),
    reviewPairs: clone(materialized.reviewPairs),
    unitReviewRows: clone(materialized.unitReviewRows),
    pblReviewSections: clone(materialized.pblReviewSections),
    reviewBoundary: clone(materialized.reviewBoundary)
  };
}
