import {
  createAnswerKeyItem,
  createQuestionDisplayModel,
  paginateAnswerKeyItems,
  paginateQuestionDisplayModels
} from "../../core/index.js";
import { generateBatchABrowserQuestions } from "./batch-a-browser-question-router.js";
import { validateBatchABrowserQuestions } from "./batch-a-browser-validator-g4a-extension.js";
import { BATCH_A_BROWSER_SCOPE } from "./production-eligibility.js";

const DEFAULT_PRINT_LAYOUT = Object.freeze({
  paperSize: "A4",
  columns: 4,
  rowsPerPage: 10,
  showQuestionNumbers: true,
  showAnswerKeyPage: true
});
const G3A_U02_SOURCE_ID = "g3a_u02_3a02";
const G4A_U01_SOURCE_ID = "g4a_u01_4a01";
const G4A_U02_SOURCE_ID = "g4a_u02_4a02";
const G4A_U04_SOURCE_ID = "g4a_u04_4a04";
const G4A_U01_TALL_TEXT_LAYOUT_PROFILES = Object.freeze({
  ps_g4a_u01_same_digit_place_value_difference: Object.freeze({ columns: 4, rowsPerPage: 8 }),
  ps_g4a_u01_place_value_composition_to_number: Object.freeze({ columns: 4, rowsPerPage: 5 }),
  ps_g4a_u01_8digit_place_value_decomposition: Object.freeze({ columns: 4, rowsPerPage: 4 }),
  ps_g4a_u01_place_value_card_unit_model_composition: Object.freeze({ columns: 4, rowsPerPage: 8 })
});
const G4A_U01_TALL_TEXT_ANSWER_KEY_LAYOUT_PROFILES = Object.freeze({
  ps_g4a_u01_same_digit_place_value_difference: Object.freeze({ columns: 4, rowsPerPage: 6 }),
  ps_g4a_u01_place_value_composition_to_number: Object.freeze({ columns: 4, rowsPerPage: 4 }),
  ps_g4a_u01_8digit_place_value_decomposition: Object.freeze({ columns: 4, rowsPerPage: 3 }),
  ps_g4a_u01_place_value_card_unit_model_composition: Object.freeze({ columns: 4, rowsPerPage: 6 })
});
const G4A_U02_TALL_TEXT_LAYOUT_PROFILES = Object.freeze({
  ps_g4a_u02_digit_card_arrangement_product_max_min: Object.freeze({ columns: 3, rowsPerPage: 5 }),
  ps_g4a_u02_near_hundred_multiplication_strategy: Object.freeze({ columns: 3, rowsPerPage: 5 })
});
const G4A_U02_TALL_TEXT_ANSWER_KEY_LAYOUT_PROFILES = Object.freeze({
  ps_g4a_u02_digit_card_arrangement_product_max_min: Object.freeze({ columns: 3, rowsPerPage: 4 }),
  ps_g4a_u02_near_hundred_multiplication_strategy: Object.freeze({ columns: 3, rowsPerPage: 4 })
});
const G4A_U04_SAFE_LAYOUT_PROFILES = Object.freeze({
  ps_g4a_u04_4digit_by_1digit_thousands_sufficient: Object.freeze({ columns: 3, rowsPerPage: 9 }),
  ps_g4a_u04_4digit_by_1digit_thousands_insufficient: Object.freeze({ columns: 3, rowsPerPage: 9 }),
  ps_g4a_u04_4digit_by_1digit_thousands_exact: Object.freeze({ columns: 3, rowsPerPage: 9 }),
  ps_g4a_u04_2digit_by_2digit_ten_multiple_divisor: Object.freeze({ columns: 3, rowsPerPage: 9 }),
  ps_g4a_u04_3digit_by_2digit_tens_sufficient: Object.freeze({ columns: 3, rowsPerPage: 9 }),
  ps_g4a_u04_3digit_by_2digit_tens_insufficient: Object.freeze({ columns: 3, rowsPerPage: 9 }),
  ps_g4a_u04_division_check_with_remainder: Object.freeze({ columns: 3, rowsPerPage: 8 })
});
const G4A_U04_SAFE_ANSWER_KEY_LAYOUT_PROFILES = Object.freeze({
  ps_g4a_u04_4digit_by_1digit_thousands_sufficient: Object.freeze({ columns: 3, rowsPerPage: 8 }),
  ps_g4a_u04_4digit_by_1digit_thousands_insufficient: Object.freeze({ columns: 3, rowsPerPage: 8 }),
  ps_g4a_u04_4digit_by_1digit_thousands_exact: Object.freeze({ columns: 3, rowsPerPage: 8 }),
  ps_g4a_u04_2digit_by_2digit_ten_multiple_divisor: Object.freeze({ columns: 3, rowsPerPage: 8 }),
  ps_g4a_u04_3digit_by_2digit_tens_sufficient: Object.freeze({ columns: 3, rowsPerPage: 8 }),
  ps_g4a_u04_3digit_by_2digit_tens_insufficient: Object.freeze({ columns: 3, rowsPerPage: 8 }),
  ps_g4a_u04_division_check_with_remainder: Object.freeze({ columns: 3, rowsPerPage: 6 })
});

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  return value;
}

function isTextDisplayQuestion(question) {
  return typeof question?.blankedDisplayText === "string" && typeof question?.answerText === "string";
}

function isOrderedFillQuestion(question) {
  return question?.answerOrder === "prompt_left_to_right" || question?.kind === "missingDigitEquation";
}

function formatAnswerKeyText(question) {
  if (isOrderedFillQuestion(question)) return `依序填入：${String(question.answerText).split(",").map((part) => part.trim()).join(", ")}`;
  return question.answerText;
}

function patternSpecIdOf(question) {
  return question?.patternSpecId ?? question?.metadata?.patternId ?? null;
}

function isG4AU01TallTextQuestion(question) {
  return question?.sourceId === G4A_U01_SOURCE_ID && Boolean(G4A_U01_TALL_TEXT_LAYOUT_PROFILES[patternSpecIdOf(question)]);
}

function isG4AU02TallTextQuestion(question) {
  return question?.sourceId === G4A_U02_SOURCE_ID && Boolean(G4A_U02_TALL_TEXT_LAYOUT_PROFILES[patternSpecIdOf(question)]);
}

function isG4AU04SafeLayoutQuestion(question) {
  return question?.sourceId === G4A_U04_SOURCE_ID && Boolean(G4A_U04_SAFE_LAYOUT_PROFILES[patternSpecIdOf(question)]);
}

function hasLongTextQuestion(questions) {
  return questions.some((question) => question?.sourceId === G3A_U02_SOURCE_ID && (question?.kind === "wordProblemEstimation" || String(question?.blankedDisplayText ?? "").length >= 52));
}

function mergePrintProfile(current, profile) {
  return {
    ...current,
    columns: Math.min(current.columns, profile.columns),
    rowsPerPage: Math.min(current.rowsPerPage, profile.rowsPerPage),
    longTextCardPolicy: "avoidSplit"
  };
}

function resolveTallTextProfile(questions, sourceId, profiles) {
  let profile = null;
  for (const question of questions) {
    if (question?.sourceId !== sourceId) continue;
    const nextProfile = profiles[patternSpecIdOf(question)];
    if (!nextProfile) continue;
    profile = profile
      ? { columns: Math.min(profile.columns, nextProfile.columns), rowsPerPage: Math.min(profile.rowsPerPage, nextProfile.rowsPerPage) }
      : nextProfile;
  }
  return profile;
}

function normalizePrintLayoutForGeneratedQuestions(printLayout, questions, options = {}) {
  let normalized = printLayout;
  if (hasLongTextQuestion(questions)) normalized = mergePrintProfile(normalized, { columns: 2, rowsPerPage: 8 });
  const g4aU01Profile = resolveTallTextProfile(
    questions,
    G4A_U01_SOURCE_ID,
    options.answerKey === true ? G4A_U01_TALL_TEXT_ANSWER_KEY_LAYOUT_PROFILES : G4A_U01_TALL_TEXT_LAYOUT_PROFILES
  );
  if (g4aU01Profile) normalized = mergePrintProfile(normalized, g4aU01Profile);
  const g4aU02Profile = resolveTallTextProfile(
    questions,
    G4A_U02_SOURCE_ID,
    options.answerKey === true ? G4A_U02_TALL_TEXT_ANSWER_KEY_LAYOUT_PROFILES : G4A_U02_TALL_TEXT_LAYOUT_PROFILES
  );
  if (g4aU02Profile) normalized = mergePrintProfile(normalized, g4aU02Profile);
  const g4aU04Profile = resolveTallTextProfile(
    questions,
    G4A_U04_SOURCE_ID,
    options.answerKey === true ? G4A_U04_SAFE_ANSWER_KEY_LAYOUT_PROFILES : G4A_U04_SAFE_LAYOUT_PROFILES
  );
  if (g4aU04Profile) normalized = mergePrintProfile(normalized, g4aU04Profile);
  return normalized;
}

function displayModelForTextQuestion(question, questionNumber, showQuestionNumbers = true) {
  const avoidPageBreakInside = (question.sourceId === G3A_U02_SOURCE_ID && String(question.blankedDisplayText ?? "").length >= 52)
    || isG4AU01TallTextQuestion(question)
    || isG4AU02TallTextQuestion(question)
    || isG4AU04SafeLayoutQuestion(question);
  return {
    questionId: question.id,
    questionNumber,
    patternId: question.patternSpecId,
    displayText: question.displayText,
    blankedDisplayText: question.blankedDisplayText,
    answerText: question.answerText,
    questionNumberText: showQuestionNumbers === false ? null : `${questionNumber}.`,
    metadataSnapshot: cloneValue(question.metadata),
    layoutHints: {
      estimatedTextLength: String(question.displayText ?? "").length,
      hasGrouping: false,
      avoidPageBreakInside
    }
  };
}

function answerKeyItemForTextQuestion(question, displayModel) {
  return {
    questionId: question.id,
    questionNumber: displayModel.questionNumber,
    patternId: question.patternSpecId,
    promptText: displayModel.blankedDisplayText,
    answerText: formatAnswerKeyText(question),
    metadataSnapshot: cloneValue(question.metadata),
    layoutHints: {
      estimatedTextLength: String(`${displayModel.blankedDisplayText ?? ""}${question.answerText ?? ""}`).length,
      avoidPageBreakInside: displayModel.layoutHints?.avoidPageBreakInside === true || isG4AU01TallTextQuestion(question) || isG4AU02TallTextQuestion(question) || isG4AU04SafeLayoutQuestion(question)
    }
  };
}

function createDisplayModels(questions, printLayout) {
  return questions.map((question, index) => {
    const questionNumber = index + 1;
    return isTextDisplayQuestion(question)
      ? displayModelForTextQuestion(question, questionNumber, printLayout.showQuestionNumbers)
      : createQuestionDisplayModel(question, questionNumber, { showQuestionNumbers: printLayout.showQuestionNumbers });
  });
}

function createAnswerKeyItems(questions, displayModels) {
  return questions.map((question, index) => isTextDisplayQuestion(question)
    ? answerKeyItemForTextQuestion(question, displayModels[index])
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
      generatedQuestionCount: questions.filter((question) => question?.metadata?.patternId === entry.patternSpecId).length,
      failureCount: 0,
      warnings: []
    })),
    validationWarnings: warnings,
    generationWarnings: warnings,
    errors
  };
}

function createWorksheetTitle(options, plan) {
  if (plan.worksheetMode === "batchAKnowledgePoint") return options.title ?? `Batch A ${plan.sourceUnit?.unitCode ?? ""} 知識點加強`.trim();
  return options.title ?? `Batch A ${plan.sourceUnit?.unitCode ?? ""} ${plan.sourceUnit?.title ?? "數學練習卷"}`.trim();
}

export function buildBatchABrowserWorksheetDocument(options = {}) {
  const generated = generateBatchABrowserQuestions(options);
  if (!generated.ok) {
    return {
      ok: false,
      worksheetDocument: null,
      validation: { ok: false, errors: generated.errors, warnings: generated.warnings, infos: [], validatorVersion: "s42b10-batch-a-browser-worksheet-v1", validatedAt: null },
      errors: generated.errors,
      warnings: generated.warnings
    };
  }

  const basePrintLayout = {
    ...DEFAULT_PRINT_LAYOUT,
    ...(options.printLayout ?? {}),
    showAnswerKeyPage: options.includeAnswerKey !== false
  };
  const printLayout = normalizePrintLayoutForGeneratedQuestions(basePrintLayout, generated.questions);
  const answerKeyPrintLayout = printLayout.showAnswerKeyPage
    ? normalizePrintLayoutForGeneratedQuestions(printLayout, generated.questions, { answerKey: true })
    : { ...printLayout, showAnswerKeyPage: false };
  const validation = validateBatchABrowserQuestions(generated.questions);
  const combinedValidation = mergeValidationWarnings(validation, generated.warnings ?? []);
  if (!validation.ok) return { ok: false, worksheetDocument: null, validation: combinedValidation, errors: validation.errors, warnings: combinedValidation.warnings };

  const questionDisplayModels = createDisplayModels(generated.questions, printLayout);
  const answerKeyItems = printLayout.showAnswerKeyPage ? createAnswerKeyItems(generated.questions, questionDisplayModels) : [];
  const questionPages = paginateQuestionDisplayModels(questionDisplayModels, printLayout);
  const answerKeyPages = printLayout.showAnswerKeyPage ? paginateAnswerKeyItems(answerKeyItems, answerKeyPrintLayout) : [];
  const plan = generated.plan;
  const title = createWorksheetTitle(options, plan);
  const generationMode = plan.worksheetMode === "batchAKnowledgePoint" ? "batchAKnowledgePoint" : "batchASourceId";

  const worksheetDocument = {
    schemaVersion: "worksheet-document-v1",
    version: "1",
    worksheetId: `batch-a-${plan.sourceId}-${plan.selectionMode}-${plan.questionCount}-${plan.generationSeed}`,
    worksheetKind: "batchAWorksheet",
    title,
    subtitle: plan.worksheetMode === "batchAKnowledgePoint" ? "Batch A visible KnowledgePoint browser worksheet bridge" : "Batch A sourceId browser worksheet bridge",
    locale: "zh-Hant",
    generatedAt: null,
    curriculumInfo: {
      publisher: "Batch A",
      grade: plan.sourceUnit?.grade ?? null,
      semester: plan.sourceUnit?.semester ?? null,
      unitNumber: plan.sourceUnit?.unitCode ?? null,
      unitTitle: plan.sourceUnit?.title ?? null,
      curriculumNodeIds: [plan.sourceId],
      canonicalSkillIds: []
    },
    studentFields: { showName: true, showDate: true, showClass: false, showScore: false, labels: { name: "姓名", date: "日期", className: "班級", score: "分數" } },
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
      pageBreakMode: printLayout.longTextCardPolicy === "avoidSplit" || answerKeyPrintLayout.longTextCardPolicy === "avoidSplit" ? "avoidLongTextCards" : "fixedGrid",
      marginMode: "default",
      debugDataAttributes: false
    },
    validationSummary: combinedValidation,
    batchA: {
      sourceId: plan.sourceId,
      selectionMode: plan.selectionMode,
      knowledgePointIds: cloneValue(plan.selectedKnowledgePointIds ?? []),
      patternGroupIds: cloneValue(plan.selectedPatternGroupIds ?? []),
      patternSpecIds: [...plan.patternSpecIds],
      allocation: cloneValue(generated.allocation)
    },
    provenance: {
      sourceType: "batch_a_browser_bridge",
      sourceTaskIds: ["S42B10_CreateBatchASiteBridgeFiles", "S43C13_G3AU02_HTMLSingleVisibleKPEnablement", "S43G5B_G3AU03MultiplicationGeneratorQualityFix", "S44_G3AU06DivisionKPMappingFix", "S45B_G3AU02OutputQualityFullFix"],
      patternSpecIds: [...plan.patternSpecIds],
      curriculumNodeIds: [plan.sourceId],
      knowledgePointIds: cloneValue(plan.selectedKnowledgePointIds ?? []),
      patternGroupIds: cloneValue(plan.selectedPatternGroupIds ?? []),
      productionStorageCategory: "none",
      notes: [BATCH_A_BROWSER_SCOPE.limit]
    },
    sections: [{ sectionId: `section-${plan.sourceId}`, title: plan.worksheetMode === "batchAKnowledgePoint" ? "知識點加強" : (plan.sourceUnit?.title ?? plan.sourceId), description: null, patternIds: [...plan.patternSpecIds], questionIds: generated.questions.map((question) => question.id), orderingIndex: 0 }],
    configSnapshot: { schemaVersion: "s42b10.batch_a.browser_worksheet_plan.v1", sourceId: plan.sourceId, questionCount: plan.questionCount, ordering: plan.ordering, includeAnswerKey: printLayout.showAnswerKeyPage, generationSeed: plan.generationSeed, selectionMode: plan.selectionMode, selectedKnowledgePointIds: cloneValue(plan.selectedKnowledgePointIds ?? []), selectedPatternGroupIds: cloneValue(plan.selectedPatternGroupIds ?? []), printLayout, answerKeyPrintLayout },
    generationContext: { questionKind: "batchAWorksheet", generationMode, questionCount: generated.questions.length, generationSeed: plan.generationSeed, orderingSeed: plan.generationSeed, resolvedOrderingSeed: plan.generationSeed, orderingMode: plan.ordering, patternIdsInRenderOrder: [...plan.patternSpecIds] },
    allocationResult: cloneValue(generated.allocation),
    generatedQuestions: cloneValue(generated.questions),
    orderedQuestionIds: generated.questions.map((question) => question.id),
    questionDisplayModels,
    answerKeyItems,
    questionPages,
    answerKeyPages,
    summary: { questionCount: generated.questions.length, questionPageCount: questionPages.length, answerKeyPageCount: answerKeyPages.length, orderingMode: plan.ordering, patternIdsInRenderOrder: [...plan.patternSpecIds] },
    generationReport: createGenerationReport({ plan, allocation: generated.allocation, questions: generated.questions, errors: generated.errors, warnings: combinedValidation.warnings })
  };

  return { ok: true, worksheetDocument, validation: combinedValidation, errors: [], warnings: combinedValidation.warnings };
}
