import {
  buildPath1P103MultiplicativeModelingItems,
} from "../../../modules/curriculum/learning-paths/path1-p1-03-multiplicative-modeling-generator.js";
import {
  PATH1_P1_03_MULTIPLICATIVE_MODELING_MASTERY_CREDIT,
  PATH1_P1_03_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
  PATH1_P1_03_MULTIPLICATIVE_MODELING_RELATION_ID,
} from "../../../modules/curriculum/learning-paths/path1-p1-03-multiplicative-modeling-patterns.js";
import {
  validatePath1P103MultiplicativeModelingItem,
} from "../../../modules/curriculum/learning-paths/path1-p1-03-multiplicative-modeling-validator.js";
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

export function buildPath1P103MultiplicativeModelingWorksheet({
  blockId = "P1-03",
  questionCount = 20,
  generationSeed = "path1-p103-multiplicative-modeling",
  includeAnswerKey = true,
  printLayout = { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true },
  practiceMode = PATH1_P1_03_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
} = {}) {
  if (blockId !== "P1-03") {
    return failed(blockId, [{ code: "PATH1_P103_MODELING_BLOCK_NOT_SUPPORTED", blockId }]);
  }
  if (practiceMode !== PATH1_P1_03_MULTIPLICATIVE_MODELING_PRACTICE_MODE) {
    return failed(blockId, [{ code: "PATH1_P103_MODELING_PRACTICE_MODE_INVALID", practiceMode }]);
  }

  const count = Math.max(1, Math.min(120, Number(questionCount) || 20));
  const transfer = buildPath1P103MultiplicativeModelingItems({
    count,
    seed: `${generationSeed}:${blockId}:multiplicative-modeling`,
  });
  if (!transfer.ok) return failed(blockId, transfer.errors);

  const failures = transfer.items
    .map((entry, index) => ({ index, validation: validatePath1P103MultiplicativeModelingItem(entry) }))
    .filter(({ validation }) => !validation.ok);
  if (failures.length > 0) {
    return failed(blockId, [{ code: "PATH1_P103_MODELING_WORKSHEET_VALIDATION_FAILED", failures }]);
  }

  const documentResult = buildWorksheetDocumentFromGeneratedItems({
    worksheetId: `path1-p103-modeling-${generationSeed}`,
    generatedItems: transfer.items,
    title: "Path 1｜P1-03 二位數×二位數｜乘法文字建模練習",
    subtitle: "辨認每組量與組數，自行列出二位數×二位數算式，再回答總量。",
    orderingMode: "path1P103MultiplicativeModelingTransfer",
    printLayout: {
      ...printLayout,
      showAnswerKeyPage: includeAnswerKey !== false,
      showQuestionNumbers: true,
    },
    report: {
      summary: {
        questionCount: transfer.items.length,
        path1BlockId: "P1-03",
        practiceMode: PATH1_P1_03_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
        patternFamilyCount: transfer.summary.patternFamilyCount,
        familyCounts: transfer.summary.familyCounts,
        contextCounts: transfer.summary.contextCounts,
        distinctPromptCount: transfer.summary.distinctPromptCount,
        relationId: transfer.summary.relationId,
        unknownRole: transfer.summary.unknownRole,
      },
      warnings: [],
      errors: [],
    },
    metadata: {
      pathId: "PATH1_INTEGER_FOUNDATIONS",
      path1BlockId: "P1-03",
      path1BlockTitle: "二位數×二位數",
      practiceMode: PATH1_P1_03_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
      relationId: PATH1_P1_03_MULTIPLICATIVE_MODELING_RELATION_ID,
      unknownRole: "totalAmount",
      manualProgression: true,
      automaticNPlus1: false,
      masteryCredit: PATH1_P1_03_MULTIPLICATIVE_MODELING_MASTERY_CREDIT,
      publicCutoverApplied: false,
    },
  });

  return Object.freeze({
    ...documentResult,
    ok: true,
    errors: Object.freeze([]),
    warnings: Object.freeze([]),
    block: Object.freeze({
      blockId: "P1-03",
      title: "二位數×二位數",
      practiceMode: PATH1_P1_03_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
    }),
  });
}
