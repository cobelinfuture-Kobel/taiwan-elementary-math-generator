import {
  buildPath1P104MultiplicativeModelingItems,
} from "../../../modules/curriculum/learning-paths/path1-p1-04-multiplicative-modeling-generator.js";
import {
  PATH1_P1_04_MULTIPLICATIVE_MODELING_MASTERY_CREDIT,
  PATH1_P1_04_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
  PATH1_P1_04_MULTIPLICATIVE_MODELING_RELATION_ID,
} from "../../../modules/curriculum/learning-paths/path1-p1-04-multiplicative-modeling-patterns.js";
import {
  validatePath1P104MultiplicativeModelingItem,
} from "../../../modules/curriculum/learning-paths/path1-p1-04-multiplicative-modeling-validator.js";
import {
  buildWorksheetDocumentFromGeneratedItems,
} from "./build-worksheet-document.js";

function failed(blockId, errors, warnings = []) {
  return Object.freeze({
    ok: false,
    blockId,
    errors: Object.freeze(errors),
    warnings: Object.freeze(warnings),
    worksheetDocument: null,
  });
}

export function buildPath1P104MultiplicativeModelingWorksheet({
  blockId = "P1-04",
  questionCount = 20,
  generationSeed = "path1-p104-multiplicative-modeling",
  includeAnswerKey = true,
  printLayout = { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true },
  practiceMode = PATH1_P1_04_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
} = {}) {
  if (blockId !== "P1-04") {
    return failed(blockId, [{ code: "PATH1_P104_MODELING_BLOCK_NOT_SUPPORTED", blockId }]);
  }
  if (practiceMode !== PATH1_P1_04_MULTIPLICATIVE_MODELING_PRACTICE_MODE) {
    return failed(blockId, [{ code: "PATH1_P104_MODELING_PRACTICE_MODE_INVALID", practiceMode }]);
  }

  const count = Math.max(1, Math.min(120, Number(questionCount) || 20));
  const transfer = buildPath1P104MultiplicativeModelingItems({
    count,
    seed: `${generationSeed}:${blockId}:multiplicative-modeling`,
  });
  if (!transfer.ok) return failed(blockId, transfer.errors);

  const failures = transfer.items
    .map((entry, index) => ({ index, validation: validatePath1P104MultiplicativeModelingItem(entry) }))
    .filter(({ validation }) => !validation.ok);
  if (failures.length > 0) {
    return failed(blockId, [{ code: "PATH1_P104_MODELING_WORKSHEET_VALIDATION_FAILED", failures }]);
  }

  const documentResult = buildWorksheetDocumentFromGeneratedItems({
    worksheetId: `path1-p104-modeling-${generationSeed}`,
    generatedItems: transfer.items,
    title: "Path 1｜P1-04 多位數×多位數｜乘法文字建模練習",
    subtitle: "辨認每組量與組數，依角色順序選擇二位×三位或三位×二位算式，再回答總量。",
    orderingMode: "path1P104MultiplicativeModelingTransfer",
    printLayout: {
      ...printLayout,
      showAnswerKeyPage: includeAnswerKey !== false,
      showQuestionNumbers: true,
    },
    report: {
      summary: {
        questionCount: transfer.items.length,
        path1BlockId: "P1-04",
        practiceMode: PATH1_P1_04_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
        patternFamilyCount: transfer.summary.patternFamilyCount,
        arithmeticFormCount: transfer.summary.arithmeticFormCount,
        familyCounts: transfer.summary.familyCounts,
        formCounts: transfer.summary.formCounts,
        familyFormCounts: transfer.summary.familyFormCounts,
        distinctPromptCount: transfer.summary.distinctPromptCount,
        relationId: transfer.summary.relationId,
        unknownRole: transfer.summary.unknownRole,
      },
      warnings: [],
      errors: [],
    },
    metadata: {
      pathId: "PATH1_INTEGER_FOUNDATIONS",
      path1BlockId: "P1-04",
      path1BlockTitle: "多位數×多位數",
      practiceMode: PATH1_P1_04_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
      relationId: PATH1_P1_04_MULTIPLICATIVE_MODELING_RELATION_ID,
      unknownRole: "totalAmount",
      manualProgression: true,
      automaticNPlus1: false,
      masteryCredit: PATH1_P1_04_MULTIPLICATIVE_MODELING_MASTERY_CREDIT,
      publicCutoverApplied: false,
      publicBindingReconciled: false,
      g4bU01ModelingExpanded: false,
    },
  });

  return Object.freeze({
    ...documentResult,
    ok: true,
    errors: Object.freeze([]),
    warnings: Object.freeze([]),
    block: Object.freeze({
      blockId: "P1-04",
      title: "多位數×多位數",
      practiceMode: PATH1_P1_04_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
    }),
  });
}
