import {
  paginateAnswerKeyItems,
  paginateQuestionDisplayModels,
} from "../../core/index.js";
import {
  buildFifteenUnitPublicPblGeneratedItems,
  isFifteenUnitPublicPblSource,
} from "./fifteen-unit-public-pbl-runtime.js";

export const FIFTEEN_UNIT_PUBLIC_PBL_WORKSHEET_SCHEMA = "FifteenUnitPublicPblWorksheet";
export const FIFTEEN_UNIT_PUBLIC_PBL_PROGRAM_ID = "BATCH_A13_BATCH_B2_PUBLIC_WORKSHEET_CLOSEOUT_V1";

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, clone(nested)]));
  }
  return value;
}

function failedResult(code, plan, details = {}) {
  const error = {
    code,
    severity: "error",
    stage: "fifteen_unit_public_pbl_worksheet",
    sourceId: plan?.sourceId ?? null,
    ...details,
  };
  return {
    ok: false,
    errors: [error],
    warnings: [],
    worksheetDocument: null,
  };
}

function questionDisplayModel(item, index) {
  return {
    questionId: item.generatedItemId ?? item.id ?? `pbl-question-${index + 1}`,
    questionNumber: index + 1,
    patternId: item.patternSpecId ?? null,
    knowledgePointId: item.knowledgePointId ?? null,
    patternGroupId: null,
    questionNumberText: `${index + 1}.`,
    promptText: item.prompt,
    displayText: item.prompt,
    blankedDisplayText: item.prompt,
    responsePrompt: "",
    answerText: item.answerText,
    answerModelShape: "complete_pbl_task_set",
    renderKind: "reasoning_application",
    applicationText: true,
    mode: "PBL",
    implementationClass: "approved_complete_pbl_projection",
    metadataSnapshot: {
      ...(clone(item.metadata) ?? {}),
      globalContextProduction: clone(item.globalContextProduction),
      pblTaskSetRecord: clone(item.pblTaskSetRecord),
      productionUse: "allowed",
    },
    layoutHints: {
      estimatedTextLength: [...String(item.prompt ?? "")].length,
      estimatedResponseLength: 0,
      avoidPageBreakInside: true,
      representation: "complete_pbl_task_set",
      longTextCardPolicy: "avoidSplit",
      preserveTraditionalChinese: true,
      arbitraryPageSplitAllowed: false,
    },
  };
}

function answerKeyItem(item, index) {
  return {
    questionId: item.generatedItemId ?? item.id ?? `pbl-question-${index + 1}`,
    questionNumber: index + 1,
    patternId: item.patternSpecId ?? null,
    knowledgePointId: item.knowledgePointId ?? null,
    patternGroupId: null,
    promptText: item.prompt,
    answerText: item.answerText,
    answerModelShape: "complete_pbl_task_set",
    renderKind: "reasoning_application",
    structuredAnswer: null,
    metadataSnapshot: {
      ...(clone(item.metadata) ?? {}),
      globalContextProduction: clone(item.globalContextProduction),
      pblTaskSetRecord: clone(item.pblTaskSetRecord),
      productionUse: "allowed",
    },
    layoutHints: {
      estimatedTextLength: [...`${item.prompt ?? ""}${item.answerText ?? ""}`].length,
      avoidPageBreakInside: true,
      representation: "complete_pbl_task_set_answer",
      longTextCardPolicy: "avoidSplit",
      preserveTraditionalChinese: true,
      arbitraryPageSplitAllowed: false,
    },
  };
}

export function buildFifteenUnitPublicPblWorksheetResult(plan = {}) {
  if (!isFifteenUnitPublicPblSource(plan.sourceId)) {
    return failedResult("PBL_SOURCE_NOT_ADMITTED", plan);
  }

  const generated = buildFifteenUnitPublicPblGeneratedItems(plan);
  if (!generated.ok || generated.generatedItems.length === 0) {
    return {
      ok: false,
      errors: [...(generated.errors ?? [])],
      warnings: [...(generated.warnings ?? [])],
      worksheetDocument: null,
      pblGeneration: generated,
    };
  }

  const generatedQuestions = generated.generatedItems.map((item) => ({
    ...clone(item),
    promptText: item.prompt,
    displayText: item.prompt,
    blankedDisplayText: item.prompt,
    responsePrompt: "",
    renderKind: "reasoning_application",
    applicationText: true,
  }));
  const questionDisplayModels = generated.generatedItems.map(questionDisplayModel);
  const answerKeyItems = generated.generatedItems.map(answerKeyItem);
  const printLayout = {
    paperSize: "A4",
    columns: 1,
    rowsPerPage: 1,
    showQuestionNumbers: true,
    showAnswerKeyPage: plan.includeAnswerKey !== false,
    longTextCardPolicy: "avoidSplit",
    noWrapExpression: false,
  };
  const questionPages = paginateQuestionDisplayModels(questionDisplayModels, printLayout);
  const answerKeyPages = printLayout.showAnswerKeyPage
    ? paginateAnswerKeyItems(answerKeyItems, printLayout)
    : [];
  const pblTaskSetRecords = generated.generatedItems.map((item) => clone(item.pblTaskSetRecord));
  const globalContextProduction = generated.generatedItems.map((item) => clone(item.globalContextProduction));
  const warnings = [...(generated.warnings ?? [])];

  const worksheetDocument = {
    schemaName: FIFTEEN_UNIT_PUBLIC_PBL_WORKSHEET_SCHEMA,
    schemaVersion: 1,
    worksheetId: `pbl-${plan.sourceId}-${plan.generationSeed ?? "public"}`,
    generatedAt: "DETERMINISTIC",
    title: `PBL 專題任務｜${plan.sourceId}`,
    subtitle: "完整題組與答案",
    orderingMode: "completePblTaskSets",
    questionCount: generatedQuestions.length,
    generatedQuestions,
    questions: generatedQuestions,
    questionDisplayModels,
    answerKeyItems,
    questionPages,
    answerKeyPages,
    pblTaskSetRecords,
    printOptions: {
      ...printLayout,
      showAnswerKey: printLayout.showAnswerKeyPage,
      answerKeyPlacement: printLayout.showAnswerKeyPage ? "afterQuestions" : "none",
      answerKeyColumns: 1,
      answerKeyRowsPerPage: 1,
    },
    batchA: {
      sourceId: plan.sourceId,
      questionMode: "pbl",
      publicSelectionMode: plan.selectionMode ?? "sourceUnit",
    },
    publicControls: {
      sourceId: plan.sourceId,
      questionMode: "pbl",
      depthMode: plan.depthMode ?? "mixed",
      contextMode: plan.contextMode ?? "mixed",
      globalContextRegistry: "GCTX_15_UNIT_PUBLIC_WORKSHEET_V1",
    },
    metadata: {
      programId: FIFTEEN_UNIT_PUBLIC_PBL_PROGRAM_ID,
      sourceId: plan.sourceId,
      questionMode: "pbl",
      globalContextRegistryId: "GCTX_15_UNIT_PUBLIC_WORKSHEET_V1",
      globalContextProduction,
      pblTaskSetCount: pblTaskSetRecords.length,
      completeProjectionCount: pblTaskSetRecords.filter((row) => row.completeProjection === true).length,
      arbitraryPageSplitAllowed: false,
      productionUse: "allowed",
    },
    provenance: {
      sourceTaskIds: [FIFTEEN_UNIT_PUBLIC_PBL_PROGRAM_ID],
      sourceId: plan.sourceId,
      globalContextRegistryId: "GCTX_15_UNIT_PUBLIC_WORKSHEET_V1",
      projectionAuthority: "approved_complete_pbl_projection",
    },
    validationSummary: {
      ok: true,
      errors: [],
      warnings,
      pblCompleteProjectionValidated: true,
    },
    report: {
      ok: true,
      errors: [],
      warnings,
      summary: {
        questionCount: generatedQuestions.length,
        questionPageCount: questionPages.length,
        answerKeyPageCount: answerKeyPages.length,
        pblTaskSetCount: pblTaskSetRecords.length,
        completeProjectionCount: pblTaskSetRecords.length,
      },
    },
    summary: {
      questionCount: generatedQuestions.length,
      questionPageCount: questionPages.length,
      answerKeyPageCount: answerKeyPages.length,
      pblTaskSetCount: pblTaskSetRecords.length,
      completeProjectionCount: pblTaskSetRecords.length,
      globalContextBoundQuestionCount: globalContextProduction.filter((row) => row?.runtimeResolvable === true).length,
    },
    configSnapshot: {
      generation: {
        questionCount: generatedQuestions.length,
        generationSeed: plan.generationSeed ?? null,
      },
      questionMode: "pbl",
      printLayout,
      metadata: {
        sourceId: plan.sourceId,
        programId: FIFTEEN_UNIT_PUBLIC_PBL_PROGRAM_ID,
      },
    },
  };

  return {
    ok: true,
    errors: [],
    warnings,
    worksheetDocument,
    pblGeneration: generated,
  };
}
