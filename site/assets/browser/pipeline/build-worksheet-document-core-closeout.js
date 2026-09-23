import { buildBatchABrowserWorksheetDocument } from "../../../modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import { applyG3BU04GlobalContextPublicWorksheetAdmission } from "../../../modules/curriculum/batch-a/batch-a-browser-worksheet-gctx-p13-entry.js";
import { applyFifteenUnitPublicApplicationAdmission } from "../../../modules/curriculum/batch-a/fifteen-unit-public-application-admission.js";
import { projectG5AU02DynamicDocumentForGlobalLayout } from "../../../modules/curriculum/batch-a/g5a-u02-global-layout-projection.js";
import { applyGlobalPublicLayoutOverlay } from "../../../modules/curriculum/batch-a/global-public-layout-overlay.js";
import { adaptGlobalPublicSourceUnitPlan } from "../../../modules/curriculum/batch-a/global-public-source-unit-adapter.js";
import { buildG5AU02PublicCandidateWorksheet } from "../../../modules/curriculum/batch-a/g5a-u02-public-candidate.js";
import { resolveG5AU02BrowserPlan } from "../../../modules/curriculum/batch-b/g5a-u02-browser-resolver.js";
import { buildG5AU02BrowserDynamicWorksheet } from "../../../modules/curriculum/batch-b/g5a-u02-browser-dynamic-runtime.bundle.js";
import {
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../../../modules/curriculum/registry/batch-a-selector-extension.js";
import {
  buildFifteenUnitPublicPblGeneratedItems,
  isFifteenUnitPublicPblSource,
} from "../../../modules/curriculum/public/fifteen-unit-public-pbl-runtime.js";
import { paginateAnswerKeyItems, paginateQuestionDisplayModels } from "../../../modules/core/worksheet-pagination.js";
import { getBatchAWorksheetPlan, storeWorksheetResult } from "../state/config-state.js";
import { attachPublicControlOutputMetadata } from "./public-control-output-metadata.js";

function blockedKnowledgePointResult(resolution) {
  return Object.freeze({
    ok: false,
    errors: resolution.errors,
    worksheetDocument: null,
    browserResolution: resolution,
  });
}

function blockedSourceUnitAdapterResult(adaptation, publicPlan) {
  return Object.freeze({
    ok: false,
    errors: adaptation.errors ?? ["GS04_SOURCE_UNIT_ADAPTER_BLOCKED"],
    worksheetDocument: null,
    sourceUnitAdaptation: adaptation,
    browserResolution: null,
    requestedPlan: publicPlan,
  });
}

function groupLooksApplication(group) {
  const corpus = JSON.stringify({
    mode: group?.mode,
    publicQuestionMode: group?.publicQuestionMode,
    representationTag: group?.representationTag,
    representationTags: group?.representationTags,
    displayName: group?.displayName,
  }).toLowerCase();
  return corpus.includes("application") || corpus.includes("word_problem") || corpus.includes("應用題");
}

function resolveApplicationPublicPlan(publicPlan = {}) {
  if (publicPlan.questionMode !== "application") return publicPlan;
  if (Array.isArray(publicPlan.selectedPatternGroupIds) && publicPlan.selectedPatternGroupIds.length > 0) return publicPlan;
  const knowledgePoints = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === publicPlan.sourceId);
  const groups = knowledgePoints.flatMap((knowledgePoint) => getVisiblePatternGroupsForKnowledgePoint(knowledgePoint.knowledgePointId)
    .filter(groupLooksApplication));
  const uniqueGroups = [...new Map(groups.map((group) => [group.patternGroupId, group])).values()];
  const selectedKnowledgePointIds = [...new Set(uniqueGroups.flatMap((group) => [
    group.primaryKnowledgePointId,
    ...(group.knowledgePointIds ?? []),
  ]).filter(Boolean))];
  if (uniqueGroups.length === 0 || selectedKnowledgePointIds.length === 0) return publicPlan;
  return {
    ...publicPlan,
    selectionMode: selectedKnowledgePointIds.length > 1 ? "mixedKnowledgePointsSameUnit" : "singleKnowledgePoint",
    selectedKnowledgePointIds,
    selectedPatternGroupIds: uniqueGroups.map((group) => group.patternGroupId),
  };
}

function projectedDisplayModels(questions, showQuestionNumbers = true) {
  return questions.map((question, index) => {
    const promptText = question.blankedDisplayText ?? question.promptText ?? question.prompt ?? "";
    return {
      questionId: question.id ?? `projected-${index + 1}`,
      questionNumber: index + 1,
      patternId: question.patternSpecId ?? question.metadata?.patternId ?? null,
      displayText: question.displayText ?? `${promptText} ${question.answerText ?? ""}`,
      blankedDisplayText: promptText,
      answerText: String(question.answerText ?? ""),
      questionNumberText: showQuestionNumbers ? `${index + 1}.` : null,
      metadataSnapshot: {
        ...(question.metadata ?? {}),
        globalContextProduction: question.globalContextProduction ?? question.metadata?.globalContextProduction ?? null,
      },
      layoutHints: {
        estimatedTextLength: String(promptText).length,
        hasGrouping: false,
        avoidPageBreakInside: true,
        questionMode: question.questionMode ?? question.mode ?? "application",
      },
    };
  });
}

function projectedAnswerKeyItems(questions, displayModels) {
  return questions.map((question, index) => ({
    questionId: displayModels[index].questionId,
    questionNumber: index + 1,
    patternId: displayModels[index].patternId,
    promptText: displayModels[index].blankedDisplayText,
    answerText: String(question.answerText ?? ""),
    metadataSnapshot: displayModels[index].metadataSnapshot,
    layoutHints: { avoidPageBreakInside: true },
  }));
}

function applicationPrintLayout(document, plan) {
  const current = document?.configSnapshot?.printLayout ?? document?.printOptions ?? plan.printLayout ?? {};
  return {
    paperSize: current.paperSize ?? "A4",
    columns: Math.min(Number.isInteger(current.columns) ? current.columns : 2, 2),
    rowsPerPage: Math.min(Number.isInteger(current.rowsPerPage) ? current.rowsPerPage : 4, 4),
    showQuestionNumbers: current.showQuestionNumbers !== false,
    showAnswerKeyPage: plan.includeAnswerKey !== false,
    longTextCardPolicy: "avoidSplit",
  };
}

function rebuildApplicationWorksheetResult(result, projected, plan) {
  if (!projected?.ok) {
    return {
      ...result,
      ok: false,
      errors: [...(result?.errors ?? []), ...(projected?.errors ?? [])],
      worksheetDocument: null,
    };
  }
  const document = result?.worksheetDocument;
  if (!document || !Array.isArray(projected.questions) || projected.questions.length === 0) return result;
  const printLayout = applicationPrintLayout(document, plan);
  const questionDisplayModels = projectedDisplayModels(projected.questions, printLayout.showQuestionNumbers);
  const answerKeyItems = printLayout.showAnswerKeyPage ? projectedAnswerKeyItems(projected.questions, questionDisplayModels) : [];
  const questionPages = paginateQuestionDisplayModels(questionDisplayModels, printLayout);
  const answerKeyPages = printLayout.showAnswerKeyPage ? paginateAnswerKeyItems(answerKeyItems, printLayout) : [];
  const globalContextBoundQuestionCount = projected.questions.filter((question) => (
    question.globalContextProduction?.runtimeResolvable === true
      || question.metadata?.globalContextProduction?.runtimeResolvable === true
  )).length;
  const worksheetDocument = {
    ...document,
    generatedQuestions: projected.questions,
    questions: projected.questions,
    questionDisplayModels,
    answerKeyItems,
    questionPages,
    answerKeyPages,
    questionCount: projected.questions.length,
    printOptions: {
      ...(document.printOptions ?? {}),
      ...printLayout,
      showAnswerKey: printLayout.showAnswerKeyPage,
      answerKeyPlacement: printLayout.showAnswerKeyPage ? "afterQuestions" : "none",
    },
    publicControls: {
      ...(document.publicControls ?? {}),
      sourceId: plan.sourceId,
      questionMode: "application",
      globalContextRegistry: "GCTX_15_UNIT_PUBLIC_WORKSHEET_V1",
    },
    metadata: {
      ...(document.metadata ?? {}),
      questionMode: "application",
      globalContextRegistryId: "GCTX_15_UNIT_PUBLIC_WORKSHEET_V1",
      globalContextBoundQuestionCount,
      fifteenUnitApplicationAdmission: projected.fifteenUnitApplicationAdmission ?? null,
    },
    configSnapshot: {
      ...(document.configSnapshot ?? {}),
      questionMode: "application",
      printLayout,
    },
    batchA: {
      ...(document.batchA ?? {}),
      sourceId: plan.sourceId,
      questionMode: "application",
    },
    summary: {
      ...(document.summary ?? {}),
      questionCount: projected.questions.length,
      questionPageCount: questionPages.length,
      answerKeyPageCount: answerKeyPages.length,
      applicationQuestionCount: projected.questions.length,
      globalContextBoundQuestionCount,
    },
  };
  return {
    ...result,
    ok: true,
    errors: [],
    worksheetDocument,
    fifteenUnitApplicationAdmission: projected.fifteenUnitApplicationAdmission ?? null,
  };
}

function buildPblWorksheetResult(plan) {
  if (!isFifteenUnitPublicPblSource(plan.sourceId)) {
    return Object.freeze({
      ok: false,
      errors: Object.freeze([{ code: "PBL_SOURCE_NOT_ADMITTED", sourceId: plan.sourceId }]),
      warnings: Object.freeze([]),
      worksheetDocument: null,
    });
  }
  const generated = buildFifteenUnitPublicPblGeneratedItems(plan);
  if (!generated.ok) {
    return Object.freeze({ ok: false, errors: generated.errors, warnings: generated.warnings, worksheetDocument: null });
  }
  const result = buildWorksheetDocumentFromGeneratedItems({
    worksheetId: `pbl-${plan.sourceId}-${plan.generationSeed ?? "public"}`,
    generatedItems: generated.generatedItems,
    title: `PBL 專題任務｜${plan.sourceId}`,
    subtitle: "完整題組與答案",
    orderingMode: "completePblTaskSets",
    printLayout: {
      paperSize: "A4",
      columns: 1,
      rowsPerPage: 1,
      showAnswerKeyPage: plan.includeAnswerKey !== false,
      showQuestionNumbers: true,
    },
    report: { summary: generated.summary, warnings: generated.warnings, errors: generated.errors },
    metadata: {
      sourceId: plan.sourceId,
      questionMode: "pbl",
      globalContextRegistryId: "GCTX_15_UNIT_PUBLIC_WORKSHEET_V1",
      pblTaskSetCount: generated.generatedItems.length,
    },
  });
  const worksheetDocument = {
    ...result.worksheetDocument,
    batchA: { sourceId: plan.sourceId, questionMode: "pbl" },
    publicControls: {
      sourceId: plan.sourceId,
      questionMode: "pbl",
      globalContextRegistry: "GCTX_15_UNIT_PUBLIC_WORKSHEET_V1",
    },
    pblTaskSetRecords: generated.generatedItems.map((item) => item.pblTaskSetRecord),
    metadata: {
      ...(result.worksheetDocument.metadata ?? {}),
      questionMode: "pbl",
      globalContextRegistryId: "GCTX_15_UNIT_PUBLIC_WORKSHEET_V1",
      pblTaskSetCount: generated.generatedItems.length,
    },
  };
  return { ...result, worksheetDocument, pblGeneration: generated };
}

export function buildWorksheetDocumentFromPlan(publicPlan) {
  const requestedPlan = resolveApplicationPublicPlan(publicPlan);
  if (requestedPlan.questionMode === "pbl") {
    const pblResult = buildPblWorksheetResult(requestedPlan);
    return applyGlobalPublicLayoutOverlay(pblResult, requestedPlan);
  }

  const sourceUnitAdaptation = adaptGlobalPublicSourceUnitPlan(requestedPlan);
  const plan = sourceUnitAdaptation.plan ?? requestedPlan;
  let resolution = null;
  let result;
  if (sourceUnitAdaptation.blocked) {
    result = blockedSourceUnitAdapterResult(sourceUnitAdaptation, requestedPlan);
  } else {
    resolution = resolveG5AU02BrowserPlan(plan);
    if (resolution?.mode === "blocked") {
      result = blockedKnowledgePointResult(resolution);
    } else if (resolution?.mode === "singleKnowledgePoint" || resolution?.mode === "multiKnowledgePoint") {
      result = buildG5AU02BrowserDynamicWorksheet(resolution.plan);
    } else {
      const publicCandidate = buildG5AU02PublicCandidateWorksheet(resolution?.plan ?? plan);
      result = publicCandidate ?? buildBatchABrowserWorksheetDocument(plan);
    }
  }
  result = applyG3BU04GlobalContextPublicWorksheetAdmission(result);

  if (requestedPlan.questionMode === "application" && result?.ok && result?.worksheetDocument) {
    const documentQuestions = result.worksheetDocument.generatedQuestions
      ?? result.worksheetDocument.questions
      ?? [];
    const projected = applyFifteenUnitPublicApplicationAdmission({
      ok: true,
      questions: documentQuestions,
      errors: [],
      warnings: result.warnings ?? [],
    }, requestedPlan);
    result = rebuildApplicationWorksheetResult(result, projected, requestedPlan);
  }

  result = attachPublicControlOutputMetadata(result, resolution?.plan ?? plan);
  result = projectG5AU02DynamicDocumentForGlobalLayout(result);
  return applyGlobalPublicLayoutOverlay(result, resolution?.plan ?? plan);
}

export function buildWorksheetDocumentFromGeneratedItems({
  worksheetId,
  generatedItems,
  title = "數學練習卷",
  subtitle = "",
  orderingMode = "sharedGeneratorOrder",
  printLayout = {},
  report = {},
  metadata = {}
} = {}) {
  if (!Array.isArray(generatedItems) || generatedItems.length === 0) {
    throw new Error("generated_items_required");
  }
  const resolvedLayout = Object.freeze({
    paperSize: printLayout.paperSize ?? "A4",
    columns: Number.isInteger(printLayout.columns) ? printLayout.columns : 1,
    rowsPerPage: Number.isInteger(printLayout.rowsPerPage) ? printLayout.rowsPerPage : 4,
    showAnswerKeyPage: printLayout.showAnswerKeyPage !== false,
    showQuestionNumbers: printLayout.showQuestionNumbers !== false,
    worksheetTitle: printLayout.worksheetTitle ?? title
  });
  const displayModels = generatedItems.map((item, index) => Object.freeze({
    questionId: item.generatedItemId ?? item.id,
    questionNumber: index + 1,
    patternId: item.patternSpecId ?? null,
    displayText: `${item.prompt} ${item.answerText}`,
    blankedDisplayText: item.prompt,
    answerText: item.answerText,
    questionNumberText: resolvedLayout.showQuestionNumbers ? `${index + 1}.` : null,
    metadataSnapshot: Object.freeze({
      patternId: item.patternSpecId ?? null,
      patternTags: Object.freeze([item.mode ?? "UNKNOWN", item.operationFamilyId ?? "UNKNOWN"]),
      skillTags: Object.freeze([]),
      difficultyTags: Object.freeze([]),
      curriculumNodeIds: Object.freeze([item.sourceNodeId].filter(Boolean)),
      canonicalSkillIds: Object.freeze([item.knowledgePointId].filter(Boolean)),
      precedenceMode: null,
      parenthesesMode: null,
      blankTarget: null,
      duplicateKey: item.generatedItemId ?? item.id,
      globalContextProduction: item.globalContextProduction ?? item.metadata?.globalContextProduction ?? null,
      pblTaskSetRecord: item.pblTaskSetRecord ?? null,
    }),
    layoutHints: Object.freeze({
      operandCount: Object.keys(item.givenRoleValues ?? {}).length,
      operatorCount: 0,
      estimatedTextLength: item.prompt.length,
      hasGrouping: false,
      avoidPageBreakInside: item.mode === "PBL",
      questionMode: item.mode ?? "UNKNOWN"
    })
  }));
  const answerKeyItems = generatedItems.map((item, index) => Object.freeze({
    questionId: item.generatedItemId ?? item.id,
    questionNumber: index + 1,
    patternId: item.patternSpecId ?? null,
    promptText: item.prompt,
    answerText: item.answerText,
    metadataSnapshot: displayModels[index].metadataSnapshot
  }));
  const questionPages = paginateQuestionDisplayModels(displayModels, resolvedLayout);
  const answerKeyPages = paginateAnswerKeyItems(answerKeyItems, resolvedLayout);
  const warnings = Array.isArray(report.warnings) ? report.warnings : [];
  const errors = Array.isArray(report.errors) ? report.errors : [];
  const worksheetDocument = Object.freeze({
    schemaVersion: 1,
    worksheetId: worksheetId ?? `shared-worksheet-${generatedItems.length}`,
    generatedAt: "DETERMINISTIC",
    configSnapshot: Object.freeze({
      generation: Object.freeze({ questionCount: generatedItems.length }),
      printLayout: resolvedLayout,
      title,
      subtitle,
      metadata: Object.freeze({ ...metadata })
    }),
    orderingMode,
    questionCount: generatedItems.length,
    questionPages: Object.freeze(questionPages),
    answerKeyPages: Object.freeze(answerKeyPages),
    sections: Object.freeze([]),
    questions: Object.freeze(generatedItems.map((item) => Object.freeze({ ...item }))),
    report: Object.freeze({
      ok: errors.length === 0,
      errors: Object.freeze([...errors]),
      warnings: Object.freeze([...warnings]),
      summary: Object.freeze({
        questionCount: generatedItems.length,
        questionPageCount: questionPages.length,
        answerKeyPageCount: answerKeyPages.length,
        ...(report.summary ?? {})
      })
    })
  });
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze([...errors]),
    warnings: Object.freeze([...warnings]),
    worksheetDocument
  });
}

export function buildWorksheetDocumentFromState(state) {
  const publicPlan = getBatchAWorksheetPlan(state);
  const result = buildWorksheetDocumentFromPlan(publicPlan);
  storeWorksheetResult(state, result);
  return result;
}
