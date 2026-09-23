import {
  buildPath1P112InverseEqualGroupsItems,
  PATH1_P112_INVERSE_EQUAL_GROUPS_BLOCK_ID,
  PATH1_P112_INVERSE_EQUAL_GROUPS_PRACTICE_MODE,
} from "../../../modules/curriculum/learning-paths/path1-p1-12-inverse-equal-groups-generator.js";
import {
  validatePath1P112InverseEqualGroupsItems,
} from "../../../modules/curriculum/learning-paths/path1-p1-12-inverse-equal-groups-validator.js";
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

export function buildPath1P112InverseEqualGroupsWorksheet({
  blockId = PATH1_P112_INVERSE_EQUAL_GROUPS_BLOCK_ID,
  questionCount = 20,
  generationSeed = "path1-p112-inverse-equal-groups",
  includeAnswerKey = true,
  printLayout = { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true },
  practiceMode = PATH1_P112_INVERSE_EQUAL_GROUPS_PRACTICE_MODE,
} = {}) {
  if (blockId !== PATH1_P112_INVERSE_EQUAL_GROUPS_BLOCK_ID) {
    return failed(blockId, [{ code: "PATH1_P112_INVERSE_MODE_BLOCK_NOT_SUPPORTED", blockId }]);
  }
  if (practiceMode !== PATH1_P112_INVERSE_EQUAL_GROUPS_PRACTICE_MODE) {
    return failed(blockId, [{ code: "PATH1_P112_INVERSE_PRACTICE_MODE_INVALID", practiceMode }]);
  }
  const count = Math.max(1, Math.min(120, Number(questionCount) || 20));
  const transfer = buildPath1P112InverseEqualGroupsItems({
    blockId,
    count,
    seed: `${generationSeed}:${blockId}:inverse-equal-groups`,
    practiceMode,
  });
  if (!transfer.ok) return failed(blockId, transfer.errors);

  const validation = validatePath1P112InverseEqualGroupsItems(transfer.items);
  if (!validation.ok) {
    return failed(blockId, [{
      code: "PATH1_P112_INVERSE_VALIDATION_FAILED",
      failures: validation.errors,
    }]);
  }

  const documentResult = buildWorksheetDocumentFromGeneratedItems({
    worksheetId: `path1-p112-inverse-${generationSeed}`,
    generatedItems: transfer.items,
    title: "Path 1｜P1-12 乘除互逆｜文字建模練習",
    subtitle: "判斷未知角色，再依等組量關係列出乘法或整除算式。",
    orderingMode: "path1P112InverseEqualGroups",
    printLayout: {
      ...printLayout,
      showAnswerKeyPage: includeAnswerKey !== false,
      showQuestionNumbers: true,
    },
    report: {
      summary: {
        questionCount: transfer.items.length,
        path1BlockId: PATH1_P112_INVERSE_EQUAL_GROUPS_BLOCK_ID,
        practiceMode: PATH1_P112_INVERSE_EQUAL_GROUPS_PRACTICE_MODE,
        unknownRolesUsed: transfer.summary.unknownRolesUsed,
        unknownRoleCounts: transfer.summary.unknownRoleCounts,
        relationKnowledgePointIdsUsed: transfer.summary.relationKnowledgePointIdsUsed,
        semanticPatternSpecIdsUsed: transfer.summary.semanticPatternSpecIdsUsed,
        semanticPatternSpecCounts: transfer.summary.semanticPatternSpecCounts,
        distinctPromptCount: transfer.summary.distinctPromptCount,
      },
      warnings: [],
      errors: [],
    },
    metadata: {
      pathId: "PATH1_INTEGER_FOUNDATIONS",
      path1BlockId: PATH1_P112_INVERSE_EQUAL_GROUPS_BLOCK_ID,
      path1BlockTitle: "乘除互逆",
      practiceMode: PATH1_P112_INVERSE_EQUAL_GROUPS_PRACTICE_MODE,
      relationId: "R03_EQUAL_GROUPS",
      unknownRolesUsed: transfer.summary.unknownRolesUsed,
      relationKnowledgePointIdsUsed: transfer.summary.relationKnowledgePointIdsUsed,
      semanticPatternSpecIdsUsed: transfer.summary.semanticPatternSpecIdsUsed,
      manualProgression: true,
      automaticNPlus1: false,
      masteryCredit: "NONE_UNTIL_SEPARATE_MASTERY_INTEGRATION_APPROVAL",
      publicCutoverApplied: false,
    },
  });

  return Object.freeze({
    ...documentResult,
    ok: true,
    errors: Object.freeze([]),
    warnings: Object.freeze([]),
    block: Object.freeze({
      blockId: PATH1_P112_INVERSE_EQUAL_GROUPS_BLOCK_ID,
      title: "乘除互逆",
      practiceMode: PATH1_P112_INVERSE_EQUAL_GROUPS_PRACTICE_MODE,
    }),
  });
}
