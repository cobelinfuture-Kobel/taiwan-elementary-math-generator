import {
  buildPath1P105MultiplicativeModelingItems,
} from "../../../modules/curriculum/learning-paths/path1-p1-05-zero-special-multiplicative-modeling-generator.js";
import {
  PATH1_P1_05_MULTIPLICATIVE_MODELING_MASTERY_CREDIT,
  PATH1_P1_05_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
  PATH1_P1_05_MULTIPLICATIVE_MODELING_RELATION_ID,
} from "../../../modules/curriculum/learning-paths/path1-p1-05-zero-special-multiplicative-modeling-patterns.js";
import {
  validatePath1P105MultiplicativeModelingItem,
} from "../../../modules/curriculum/learning-paths/path1-p1-05-zero-special-multiplicative-modeling-validator.js";
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

export function buildPath1P105MultiplicativeModelingWorksheet({
  blockId = "P1-05",
  questionCount = 20,
  generationSeed = "path1-p105-zero-special-multiplicative-modeling",
  includeAnswerKey = true,
  printLayout = { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true },
  practiceMode = PATH1_P1_05_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
} = {}) {
  if (blockId !== "P1-05") {
    return failed(blockId, [{ code: "PATH1_P105_MODELING_BLOCK_NOT_SUPPORTED", blockId }]);
  }
  if (practiceMode !== PATH1_P1_05_MULTIPLICATIVE_MODELING_PRACTICE_MODE) {
    return failed(blockId, [{ code: "PATH1_P105_MODELING_PRACTICE_MODE_INVALID", practiceMode }]);
  }

  const count = Math.max(1, Math.min(120, Number(questionCount) || 20));
  const transfer = buildPath1P105MultiplicativeModelingItems({
    count,
    seed: `${generationSeed}:${blockId}:multiplicative-modeling`,
  });
  if (!transfer.ok) return failed(blockId, transfer.errors);

  const failures = transfer.items
    .map((entry, index) => ({ index, validation: validatePath1P105MultiplicativeModelingItem(entry) }))
    .filter(({ validation }) => !validation.ok);
  if (failures.length > 0) {
    return failed(blockId, [{ code: "PATH1_P105_MODELING_WORKSHEET_VALIDATION_FAILED", failures }]);
  }

  const documentResult = buildWorksheetDocumentFromGeneratedItems({
    worksheetId: `path1-p105-modeling-${generationSeed}`,
    generatedItems: transfer.items,
    title: "Path 1｜P1-05 0 特殊情況｜乘法文字建模練習",
    subtitle: "先辨認每組量與組數，再用中間為 0 的三位數乘一位數求總量。",
    orderingMode: "path1P105ZeroSpecialMultiplicativeModelingTransfer",
    printLayout: {
      ...printLayout,
      showAnswerKeyPage: includeAnswerKey !== false,
      showQuestionNumbers: true,
    },
    report: {
      summary: {
        questionCount: transfer.items.length,
        path1BlockId: "P1-05",
        practiceMode: PATH1_P1_05_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
        patternFamilyCount: transfer.summary.patternFamilyCount,
        familyCounts: transfer.summary.familyCounts,
        distinctPromptCount: transfer.summary.distinctPromptCount,
        relationId: transfer.summary.relationId,
        unknownRole: transfer.summary.unknownRole,
        includesTotalAbove999: transfer.summary.includesTotalAbove999,
        includesLowBoundary: transfer.summary.includesLowBoundary,
        includesHighBoundary: transfer.summary.includesHighBoundary,
      },
      warnings: [],
      errors: [],
    },
    metadata: {
      pathId: "PATH1_INTEGER_FOUNDATIONS",
      path1BlockId: "P1-05",
      path1BlockTitle: "0 特殊情況",
      practiceMode: PATH1_P1_05_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
      relationId: PATH1_P1_05_MULTIPLICATIVE_MODELING_RELATION_ID,
      unknownRole: "totalAmount",
      zeroMiddleArithmeticBoundaryPreserved: true,
      manualProgression: true,
      automaticNPlus1: false,
      masteryCredit: PATH1_P1_05_MULTIPLICATIVE_MODELING_MASTERY_CREDIT,
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
      blockId: "P1-05",
      title: "0 特殊情況",
      practiceMode: PATH1_P1_05_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
    }),
  });
}
