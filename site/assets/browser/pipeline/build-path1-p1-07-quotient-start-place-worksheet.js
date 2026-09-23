import {
  buildPath1P107QuotientStartPlaceItems,
} from "../../../modules/curriculum/learning-paths/path1-p1-07-quotient-start-place-generator.js";
import {
  PATH1_P1_07_QUOTIENT_START_PLACE_MASTERY_CREDIT,
  PATH1_P1_07_QUOTIENT_START_PLACE_PRACTICE_MODE,
} from "../../../modules/curriculum/learning-paths/path1-p1-07-quotient-start-place-patterns.js";
import {
  validatePath1P107QuotientStartPlaceItem,
} from "../../../modules/curriculum/learning-paths/path1-p1-07-quotient-start-place-validator.js";
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

export function buildPath1P107QuotientStartPlaceWorksheet({
  blockId = "P1-07",
  questionCount = 20,
  generationSeed = "path1-p107-quotient-start-place",
  includeAnswerKey = true,
  printLayout = { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true },
  practiceMode = PATH1_P1_07_QUOTIENT_START_PLACE_PRACTICE_MODE,
} = {}) {
  if (blockId !== "P1-07") {
    return failed(blockId, [{ code: "PATH1_P107_QUOTIENT_PLACE_BLOCK_NOT_SUPPORTED", blockId }]);
  }
  if (practiceMode !== PATH1_P1_07_QUOTIENT_START_PLACE_PRACTICE_MODE) {
    return failed(blockId, [{ code: "PATH1_P107_QUOTIENT_PLACE_PRACTICE_MODE_INVALID", practiceMode }]);
  }

  const count = Math.max(1, Math.min(120, Number(questionCount) || 20));
  const generated = buildPath1P107QuotientStartPlaceItems({
    blockId,
    count,
    seed: `${generationSeed}:${blockId}:quotient-start-place`,
    practiceMode,
  });
  if (!generated.ok) return failed(blockId, generated.errors);

  const failures = generated.items
    .map((entry, index) => ({ index, validation: validatePath1P107QuotientStartPlaceItem(entry) }))
    .filter(({ validation }) => !validation.ok);
  if (failures.length > 0) {
    return failed(blockId, [{ code: "PATH1_P107_QUOTIENT_PLACE_WORKSHEET_VALIDATION_FAILED", failures }]);
  }

  const documentResult = buildWorksheetDocumentFromGeneratedItems({
    worksheetId: `path1-p107-quotient-start-place-${generationSeed}`,
    generatedItems: generated.items,
    title: "Path 1｜P1-07 商的位值｜商起始位與位數判斷",
    subtitle: "先比較被除數最高位與除數，再判斷商從哪一位開始寫，以及商是幾位數。",
    orderingMode: "path1P107QuotientStartPlace",
    printLayout: {
      ...printLayout,
      showAnswerKeyPage: includeAnswerKey !== false,
      showQuestionNumbers: true,
    },
    report: {
      summary: {
        questionCount: generated.items.length,
        path1BlockId: "P1-07",
        practiceMode,
        patternFamilyCount: generated.summary.patternFamilyCount,
        familyCounts: generated.summary.familyCounts,
        knowledgePointCounts: generated.summary.knowledgePointCounts,
        caseCounts: generated.summary.caseCounts,
        distinctPromptCount: generated.summary.distinctPromptCount,
        exactDivisionOnly: true,
        quotientZeroCaseUsed: false,
        twoDigitDivisorRepresentationUsed: false,
        wordProblemModelingUsed: false,
      },
      warnings: [],
      errors: [],
    },
    metadata: {
      pathId: "PATH1_INTEGER_FOUNDATIONS",
      path1BlockId: "P1-07",
      path1BlockTitle: "商的位值",
      practiceMode,
      questionMode: "numeric",
      representationLayer: "quotient_start_place_cases",
      relationId: null,
      wordProblemModelingUsed: false,
      divisorEstimationUsed: false,
      remainderContextInterpretationUsed: false,
      twoDigitDivisorRepresentationUsed: false,
      quotientZeroCaseUsed: false,
      manualProgression: true,
      automaticNPlus1: false,
      masteryCredit: PATH1_P1_07_QUOTIENT_START_PLACE_MASTERY_CREDIT,
      publicCutoverApplied: false,
    },
  });

  return Object.freeze({
    ...documentResult,
    ok: true,
    errors: Object.freeze([]),
    warnings: Object.freeze([]),
    block: Object.freeze({
      blockId: "P1-07",
      title: "商的位值",
      practiceMode,
    }),
  });
}
