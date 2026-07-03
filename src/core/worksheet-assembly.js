import { createSeededRandom } from "./random.js";
import {
  createAnswerKeyItem,
  createQuestionDisplayModel
} from "./worksheet-formatting.js";
import {
  paginateAnswerKeyItems,
  paginateQuestionDisplayModels
} from "./worksheet-pagination.js";

function createAssemblyError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function getOrderingConfig(input) {
  return input?.configSnapshot?.patternPlan?.worksheetOrdering ?? {
    mode: "groupedByPattern",
    stablePatternOrder: []
  };
}

function getQuestionPatternId(question) {
  return question?.metadata?.patternId ?? null;
}

function resolveOrderingSeed(input) {
  return input?.orderingSeed ?? input?.generationSeed ?? null;
}

function shuffleQuestions(questions, seed) {
  const shuffled = [...questions];
  const randomFn = createSeededRandom(seed);

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(randomFn() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

export function resolveWorksheetOrdering(input) {
  const questions = Array.isArray(input?.generatedQuestions) ? [...input.generatedQuestions] : [];
  const ordering = getOrderingConfig(input);

  if (ordering.mode === "shuffleAcrossPatterns") {
    return shuffleQuestions(questions, resolveOrderingSeed(input));
  }

  if (ordering.mode !== "groupedByPattern") {
    throw createAssemblyError("worksheet_ordering_invalid", `Unsupported worksheet ordering mode '${ordering.mode}'.`);
  }

  const groups = new Map();
  const firstSeenUnknownPatternIds = [];
  const stablePatternOrder = Array.isArray(ordering.stablePatternOrder) ? ordering.stablePatternOrder : [];
  const stablePatternIdSet = new Set(stablePatternOrder);

  for (const question of questions) {
    const patternId = getQuestionPatternId(question);
    if (!groups.has(patternId)) {
      groups.set(patternId, []);
      if (!stablePatternIdSet.has(patternId)) {
        firstSeenUnknownPatternIds.push(patternId);
      }
    }
    groups.get(patternId).push(question);
  }

  const orderedQuestions = [];
  for (const patternId of stablePatternOrder) {
    const patternQuestions = groups.get(patternId);
    if (patternQuestions) {
      orderedQuestions.push(...patternQuestions);
    }
  }

  for (const patternId of firstSeenUnknownPatternIds) {
    orderedQuestions.push(...groups.get(patternId));
  }

  return orderedQuestions;
}

export function buildQuestionDisplayModels(orderedQuestions, configSnapshot) {
  return orderedQuestions.map((question, index) => createQuestionDisplayModel(question, index + 1, {
    showQuestionNumbers: configSnapshot?.printLayout?.showQuestionNumbers
  }));
}

export function buildAnswerKeyItems(orderedQuestions, questionDisplayModels) {
  return orderedQuestions.map((question, index) => createAnswerKeyItem(question, questionDisplayModels[index]));
}

export function assembleWorksheetDocument(input) {
  if (!input || typeof input !== "object") {
    throw createAssemblyError("worksheet_assembly_input_invalid", "Worksheet assembly input must be an object.");
  }

  const configSnapshot = input.configSnapshot;
  const generatedQuestions = Array.isArray(input.generatedQuestions) ? [...input.generatedQuestions] : [];
  const orderedQuestions = resolveWorksheetOrdering(input);
  const orderedQuestionIds = orderedQuestions.map((question) => question.id);
  const questionDisplayModels = buildQuestionDisplayModels(orderedQuestions, configSnapshot);
  const answerKeyItems = buildAnswerKeyItems(orderedQuestions, questionDisplayModels);
  const questionPages = paginateQuestionDisplayModels(questionDisplayModels, configSnapshot.printLayout);
  const answerKeyPages = paginateAnswerKeyItems(answerKeyItems, configSnapshot.printLayout);

  const orderedQuestionIdSet = new Set(orderedQuestionIds);
  if (orderedQuestionIds.length !== generatedQuestions.length || orderedQuestionIdSet.size !== generatedQuestions.length) {
    throw createAssemblyError("ordered_question_count_invalid", "Ordered question ids must resolve one-to-one to source generated questions.");
  }

  const patternIdsInRenderOrder = [];
  for (const question of orderedQuestions) {
    const patternId = getQuestionPatternId(question);
    if (!patternIdsInRenderOrder.includes(patternId)) {
      patternIdsInRenderOrder.push(patternId);
    }
  }

  return {
    schemaVersion: "worksheet-document-v1",
    version: "1",
    worksheetKind: "expressionWorksheet",
    configSnapshot,
    generationContext: {
      questionKind: configSnapshot?.questionKind ?? "expression",
      generationMode: configSnapshot?.generationMode ?? null,
      generationSeed: input.generationSeed ?? null,
      orderingSeed: input.orderingSeed ?? null,
      resolvedOrderingSeed: resolveOrderingSeed(input),
      orderingMode: getOrderingConfig(input).mode
    },
    allocationResult: Array.isArray(input.allocationResult) ? input.allocationResult.map((item) => ({ ...item })) : [],
    generatedQuestions,
    orderedQuestionIds,
    questionDisplayModels,
    answerKeyItems,
    questionPages,
    answerKeyPages,
    summary: {
      questionCount: generatedQuestions.length,
      questionPageCount: questionPages.length,
      answerKeyPageCount: answerKeyPages.length,
      orderingMode: getOrderingConfig(input).mode,
      patternIdsInRenderOrder
    },
    report: input.generationReport ?? null
  };
}
