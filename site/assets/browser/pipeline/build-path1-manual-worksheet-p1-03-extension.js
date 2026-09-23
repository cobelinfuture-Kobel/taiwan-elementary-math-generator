import {
  buildPath1ManualWorksheet as buildBasePath1ManualWorksheet,
  listPath1ManualWorksheetBlocks as listBasePath1ManualWorksheetBlocks,
} from "./build-path1-manual-worksheet.js";
import { buildWorksheetDocumentFromGeneratedItems } from "./build-worksheet-document.js";
import { listVisibleBatchAKnowledgePoints } from "../../../modules/curriculum/registry/batch-a-selector-extension.js";
import { getPath1PublicWorksheetBlock } from "../../../modules/curriculum/learning-paths/path1-public-worksheet-binding.js";
import {
  buildPath1P103DiversityItems,
  PATH1_P1_03_DIVERSITY_PROFILE_ID,
  PATH1_P1_03_KNOWLEDGE_POINT_ID,
} from "../../../modules/curriculum/learning-paths/path1-p1-03-diversity.js";

function failed(blockId, errors, warnings = []) {
  return Object.freeze({
    ok: false,
    blockId,
    errors: Object.freeze(errors),
    warnings: Object.freeze(warnings),
    worksheetDocument: null,
  });
}

export function listPath1ManualWorksheetBlocks() {
  return listBasePath1ManualWorksheetBlocks();
}

export function buildPath1ManualWorksheet({
  blockId,
  questionCount = 20,
  generationSeed = "path1-manual",
  includeAnswerKey = true,
  printLayout = { paperSize: "A4", columns: 3, rowsPerPage: 5, showQuestionNumbers: true },
} = {}) {
  if (blockId !== "P1-03") {
    return buildBasePath1ManualWorksheet({
      blockId,
      questionCount,
      generationSeed,
      includeAnswerKey,
      printLayout,
    });
  }

  const block = getPath1PublicWorksheetBlock(blockId);
  if (!block) return failed(blockId, [{ code: "PATH1_BLOCK_NOT_FOUND", blockId }]);
  if (block.diversityProfileId !== PATH1_P1_03_DIVERSITY_PROFILE_ID) {
    return failed(blockId, [{
      code: "PATH1_P1_03_DIVERSITY_PROFILE_MISMATCH",
      blockId,
      diversityProfileId: block.diversityProfileId,
    }]);
  }
  if (
    block.knowledgePointIds.length !== 1
    || block.knowledgePointIds[0] !== PATH1_P1_03_KNOWLEDGE_POINT_ID
  ) {
    return failed(blockId, [{
      code: "PATH1_DIVERSITY_PROFILE_KP_MISMATCH",
      blockId,
      diversityProfileId: block.diversityProfileId,
      knowledgePointIds: block.knowledgePointIds,
    }]);
  }

  const visibleKnowledgePointIds = new Set(
    listVisibleBatchAKnowledgePoints().map((entry) => entry.knowledgePointId),
  );
  if (!visibleKnowledgePointIds.has(PATH1_P1_03_KNOWLEDGE_POINT_ID)) {
    return failed(blockId, [{
      code: "PATH1_KP_NOT_PUBLICLY_VISIBLE",
      blockId,
      knowledgePointIds: [PATH1_P1_03_KNOWLEDGE_POINT_ID],
    }]);
  }

  const count = Math.max(1, Math.min(120, Number(questionCount) || 20));
  const diversity = buildPath1P103DiversityItems({
    count,
    seed: `${generationSeed}:${blockId}`,
  });
  if (!diversity.ok) return failed(blockId, diversity.errors);

  const generatedItems = diversity.items;
  const documentResult = buildWorksheetDocumentFromGeneratedItems({
    worksheetId: `path1-${blockId}-${generationSeed}`,
    generatedItems,
    title: `Path 1｜${blockId} ${block.title}`,
    subtitle: "依路徑順序練習；完成後由使用者手動選擇下一個 P1 Block。",
    orderingMode: "path1ManualBlock",
    printLayout: {
      ...printLayout,
      showAnswerKeyPage: includeAnswerKey !== false,
      showQuestionNumbers: true,
    },
    report: {
      summary: {
        questionCount: generatedItems.length,
        path1BlockId: blockId,
        generationKind: block.generationKind,
        diversityProfileId: block.diversityProfileId,
        patternFamilyCount: diversity.summary.patternFamilyCount,
        distinctPromptCapacity: diversity.summary.distinctPromptCapacity,
        familyCounts: diversity.summary.familyCounts,
      },
      warnings: [],
      errors: [],
    },
    metadata: {
      pathId: "PATH1_INTEGER_FOUNDATIONS",
      path1BlockId: blockId,
      path1BlockTitle: block.title,
      path1GenerationKind: block.generationKind,
      path1DiversityProfileId: block.diversityProfileId,
      manualProgression: true,
      automaticNPlus1: false,
    },
  });

  return Object.freeze({
    ...documentResult,
    ok: true,
    errors: Object.freeze([]),
    warnings: Object.freeze([]),
    block,
  });
}
