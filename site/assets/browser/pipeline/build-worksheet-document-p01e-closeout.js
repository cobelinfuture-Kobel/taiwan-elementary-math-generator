import {
  buildWorksheetDocumentFromGeneratedItems,
  buildWorksheetDocumentFromPlan as buildBase,
} from "./build-worksheet-document-core-closeout.js";
import { generateBatchABrowserQuestions } from "../../../modules/curriculum/batch-a/batch-a-browser-question-router.js";
import { applyW1FullProductPublicApplicationAdmission } from "../../../modules/curriculum/batch-a/w1-full-product-public-application-admission.js";
import { paginateAnswerKeyItems, paginateQuestionDisplayModels } from "../../../modules/core/worksheet-pagination.js";

export { buildWorksheetDocumentFromGeneratedItems };

const W1_PUBLIC_SOURCE_IDS = new Set([
  "g5b_u05_5b05a",
  "g6a_u01_6a01",
  "g5a_u03_5a03a",
  "g5a_u03_5a03a1",
]);

function displayModels(questions, showQuestionNumbers) {
  return questions.map((question, index) => {
    const promptText = question.blankedDisplayText ?? question.promptText ?? question.prompt ?? "";
    return {
      questionId: question.id ?? `p01e-${index + 1}`,
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
        questionMode: "application",
      },
    };
  });
}

function answerItems(questions, models) {
  return questions.map((question, index) => ({
    questionId: models[index].questionId,
    questionNumber: index + 1,
    patternId: models[index].patternId,
    promptText: models[index].blankedDisplayText,
    answerText: String(question.answerText ?? ""),
    metadataSnapshot: models[index].metadataSnapshot,
    layoutHints: { avoidPageBreakInside: true },
  }));
}

function projectResult(result, projected, plan, currentRouterGeneration = null) {
  if (!projected?.ok) {
    return {
      ...result,
      ok: false,
      errors: [...(result?.errors ?? []), ...(projected?.errors ?? [])],
      worksheetDocument: null,
      currentRouterGeneration,
    };
  }
  const document = result?.worksheetDocument;
  if (!document || !Array.isArray(projected.questions) || projected.questions.length === 0 || !projected.p01eApplicationAdmission) {
    return result;
  }
  const current = document.configSnapshot?.printLayout ?? document.printOptions ?? plan.printLayout ?? {};
  const printLayout = {
    paperSize: current.paperSize ?? "A4",
    columns: Math.min(Number.isInteger(current.columns) ? current.columns : 2, 2),
    rowsPerPage: Math.min(Number.isInteger(current.rowsPerPage) ? current.rowsPerPage : 4, 4),
    showQuestionNumbers: current.showQuestionNumbers !== false,
    showAnswerKeyPage: plan.includeAnswerKey !== false,
    longTextCardPolicy: "avoidSplit",
  };
  const questionDisplayModels = displayModels(projected.questions, printLayout.showQuestionNumbers);
  const answerKeyItems = printLayout.showAnswerKeyPage ? answerItems(projected.questions, questionDisplayModels) : [];
  const questionPages = paginateQuestionDisplayModels(questionDisplayModels, printLayout);
  const answerKeyPages = printLayout.showAnswerKeyPage ? paginateAnswerKeyItems(answerKeyItems, printLayout) : [];
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
      p01eApplicationAdmission: projected.p01eApplicationAdmission,
      currentRouterQuestionAuthority: currentRouterGeneration
        ? {
          sourceId: plan.sourceId,
          questionCount: currentRouterGeneration.questions.length,
          allocation: currentRouterGeneration.allocation ?? currentRouterGeneration.plan?.allocation ?? [],
        }
        : null,
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
      globalContextBoundQuestionCount: projected.p01eApplicationAdmission.globalContextBoundQuestionCount,
    },
  };
  return {
    ...result,
    ok: true,
    errors: [],
    worksheetDocument,
    p01eApplicationAdmission: projected.p01eApplicationAdmission,
    currentRouterGeneration,
  };
}

function failedCurrentRouterGeneration(generation) {
  return {
    ok: false,
    errors: [...(generation?.errors ?? [])],
    warnings: [...(generation?.warnings ?? [])],
    worksheetDocument: null,
    currentRouterGeneration: generation,
  };
}

function normalizedCurrentRouterItems(questions = []) {
  return questions.map((question, index) => ({
    ...question,
    generatedItemId: question.generatedItemId ?? question.id ?? `p01e-current-${index + 1}`,
    prompt: String(
      question.prompt
        ?? question.promptText
        ?? question.blankedDisplayText
        ?? question.displayText
        ?? "",
    ),
    answerText: String(question.answerText ?? question.answer ?? ""),
    mode: question.mode ?? question.questionMode ?? "application",
  }));
}

function buildCurrentRouterBaseResult(plan, generation) {
  const generatedItems = normalizedCurrentRouterItems(generation.questions);
  const result = buildWorksheetDocumentFromGeneratedItems({
    worksheetId: `p01e-${plan.sourceId}-${plan.generationSeed ?? "public"}`,
    generatedItems,
    title: plan.worksheetTitle ?? "數學練習卷",
    subtitle: plan.worksheetSubtitle ?? "",
    orderingMode: plan.ordering ?? "groupedByPattern",
    printLayout: {
      ...(plan.printLayout ?? {}),
      showAnswerKeyPage: plan.includeAnswerKey !== false,
    },
    report: {
      summary: {
        questionCount: generatedItems.length,
        allocation: generation.allocation ?? generation.plan?.allocation ?? [],
      },
      warnings: generation.warnings ?? [],
      errors: [],
    },
    metadata: {
      sourceId: plan.sourceId,
      questionMode: "application",
      questionAuthority: "CURRENT_BATCH_A_BROWSER_ROUTER",
    },
  });
  return {
    ...result,
    generation,
  };
}

export function buildWorksheetDocumentFromPlan(plan = {}) {
  const useW1SharedBuilder = plan.questionMode === "application" && W1_PUBLIC_SOURCE_IDS.has(plan.sourceId);
  if (useW1SharedBuilder) {
    const currentRouterGeneration = generateBatchABrowserQuestions(plan);
    if (!currentRouterGeneration?.ok) {
      return failedCurrentRouterGeneration(currentRouterGeneration);
    }
    const result = buildCurrentRouterBaseResult(plan, currentRouterGeneration);
    const projected = applyW1FullProductPublicApplicationAdmission({
      ok: true,
      questions: currentRouterGeneration.questions,
      errors: [],
      warnings: currentRouterGeneration.warnings ?? [],
    }, plan);
    return projectResult(result, projected, plan, currentRouterGeneration);
  }

  const result = buildBase(plan);
  if (plan.questionMode !== "application" || !result?.ok || !result?.worksheetDocument) return result;
  const questions = result.worksheetDocument.generatedQuestions ?? result.worksheetDocument.questions ?? [];
  const projected = applyW1FullProductPublicApplicationAdmission({
    ok: true,
    questions,
    errors: [],
    warnings: result.warnings ?? [],
  }, plan);
  return projectResult(result, projected, plan, null);
}
