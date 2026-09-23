import {
  buildPath1P106EstimateTrialQuotientItems,
} from "../../../modules/curriculum/learning-paths/path1-p1-06-estimate-trial-quotient-generator.js";
import {
  PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_MASTERY_CREDIT,
  PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PRACTICE_MODE,
} from "../../../modules/curriculum/learning-paths/path1-p1-06-estimate-trial-quotient-patterns.js";
import {
  validatePath1P106EstimateTrialQuotientItem,
} from "../../../modules/curriculum/learning-paths/path1-p1-06-estimate-trial-quotient-validator.js";
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

export function buildPath1P106EstimateTrialQuotientWorksheet({
  blockId = "P1-06",
  questionCount = 20,
  generationSeed = "path1-p106-estimate-trial-quotient",
  includeAnswerKey = true,
  printLayout = { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true },
  practiceMode = PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PRACTICE_MODE,
} = {}) {
  if (blockId !== "P1-06") {
    return failed(blockId, [{ code: "PATH1_P106_ESTIMATE_BLOCK_NOT_SUPPORTED", blockId }]);
  }
  if (practiceMode !== PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PRACTICE_MODE) {
    return failed(blockId, [{ code: "PATH1_P106_ESTIMATE_PRACTICE_MODE_INVALID", practiceMode }]);
  }

  const count = Math.max(1, Math.min(120, Number(questionCount) || 20));
  const generated = buildPath1P106EstimateTrialQuotientItems({
    blockId,
    count,
    seed: `${generationSeed}:${blockId}:estimate-trial-quotient`,
    practiceMode,
  });
  if (!generated.ok) return failed(blockId, generated.errors);

  const failures = generated.items
    .map((entry, index) => ({ index, validation: validatePath1P106EstimateTrialQuotientItem(entry) }))
    .filter(({ validation }) => !validation.ok);
  if (failures.length > 0) {
    return failed(blockId, [{ code: "PATH1_P106_ESTIMATE_WORKSHEET_VALIDATION_FAILED", failures }]);
  }

  const documentResult = buildWorksheetDocumentFromGeneratedItems({
    worksheetId: `path1-p106-estimate-trial-${generationSeed}`,
    generatedItems: generated.items,
    title: "Path 1｜P1-06 估商｜估商與試商練習",
    subtitle: "先把除數看成合適的整十數估商，再依題型完成估數或精確商與餘數。",
    orderingMode: "path1P106EstimateTrialQuotient",
    printLayout: {
      ...printLayout,
      showAnswerKeyPage: includeAnswerKey !== false,
      showQuestionNumbers: true,
    },
    report: {
      summary: {
        questionCount: generated.items.length,
        path1BlockId: "P1-06",
        practiceMode,
        patternFamilyCount: generated.summary.patternFamilyCount,
        familyCounts: generated.summary.familyCounts,
        knowledgePointCounts: generated.summary.knowledgePointCounts,
        distinctPromptCount: generated.summary.distinctPromptCount,
        wordProblemModelingUsed: false,
        observedEstimateAnchorsPresent: generated.summary.observedEstimateAnchorsPresent,
      },
      warnings: [],
      errors: [],
    },
    metadata: {
      pathId: "PATH1_INTEGER_FOUNDATIONS",
      path1BlockId: "P1-06",
      path1BlockTitle: "估商",
      practiceMode,
      questionMode: "numeric",
      representationLayer: "estimate_trial_quotient",
      relationId: null,
      wordProblemModelingUsed: false,
      manualProgression: true,
      automaticNPlus1: false,
      masteryCredit: PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_MASTERY_CREDIT,
      publicCutoverApplied: false,
      quotientPlaceTeachingUsed: false,
      remainderContextInterpretationUsed: false,
    },
  });

  return Object.freeze({
    ...documentResult,
    ok: true,
    errors: Object.freeze([]),
    warnings: Object.freeze([]),
    block: Object.freeze({
      blockId: "P1-06",
      title: "估商",
      practiceMode,
    }),
  });
}
