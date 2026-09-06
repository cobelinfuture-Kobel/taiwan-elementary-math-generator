import {
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../../../modules/curriculum/registry/batch-a-selector-extension.js";
import {
  getPath1PublicWorksheetBlock,
  listPath1PublicWorksheetBlocks,
} from "../../../modules/curriculum/learning-paths/path1-public-worksheet-binding.js";
import {
  buildPath1P101DiversityItems,
  PATH1_P1_01_DIVERSITY_PROFILE_ID,
  PATH1_P1_01_KNOWLEDGE_POINT_ID,
} from "../../../modules/curriculum/learning-paths/path1-p1-01-diversity.js";
import {
  PATH1_P1_02_KNOWLEDGE_POINT_IDS,
} from "../../../modules/curriculum/learning-paths/path1-p1-02-diversity.js";
import {
  buildPath1P102PublicDiversityItems,
  PATH1_P1_02_PUBLIC_DIVERSITY_PROFILE_ID,
} from "../../../modules/curriculum/learning-paths/path1-p1-02-public-diversity-v2.js";
import {
  buildPath1EqualGroupsTransferItems,
  PATH1_EQUAL_GROUPS_TRANSFER_PRACTICE_MODE,
  PATH1_EQUAL_GROUPS_TRANSFER_RELATION_KP_ID,
} from "../../../modules/curriculum/learning-paths/path1-equal-groups-transfer-generator.js";
import {
  validatePath1EqualGroupsTransferItems,
} from "../../../modules/curriculum/learning-paths/path1-equal-groups-transfer-validator.js";
import {
  buildWorksheetDocumentFromGeneratedItems,
  buildWorksheetDocumentFromPlan,
} from "./build-worksheet-document.js";

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function groupLooksApplication(group = {}) {
  const corpus = JSON.stringify({
    mode: group.mode,
    publicQuestionMode: group.publicQuestionMode,
    representationTag: group.representationTag,
    representationTags: group.representationTags,
    displayName: group.displayName,
  }).toLowerCase();
  return corpus.includes("application") || corpus.includes("word_problem") || corpus.includes("應用題");
}

function visibleEntryByKnowledgePointId() {
  return new Map(listVisibleBatchAKnowledgePoints().map((entry) => [entry.knowledgePointId, entry]));
}

function allocateCounts(total, itemCount) {
  if (!Number.isInteger(total) || total < 1) return [];
  if (!Number.isInteger(itemCount) || itemCount < 1) return [];
  const base = Math.floor(total / itemCount);
  const remainder = total % itemCount;
  return Array.from({ length: itemCount }, (_, index) => base + (index < remainder ? 1 : 0));
}

function selectedGroupsForKnowledgePoint(knowledgePointId, questionMode) {
  const groups = getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
  if (questionMode === "application") {
    const applicationGroups = groups.filter(groupLooksApplication);
    return applicationGroups.length > 0 ? applicationGroups : groups;
  }
  const nonApplicationGroups = groups.filter((group) => !groupLooksApplication(group));
  return nonApplicationGroups.length > 0 ? nonApplicationGroups : groups;
}

function firstNonEmptyText(...values) {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const text = String(value);
    if (text.trim().length > 0) return text;
  }
  return "";
}

function normalizeGeneratedQuestion(question, prefix, index) {
  return {
    ...question,
    generatedItemId: `${prefix}-${question.generatedItemId ?? question.id ?? index + 1}`,
    prompt: firstNonEmptyText(
      question.prompt,
      question.blankedDisplayText,
      question.promptText,
      question.displayText,
    ),
    answerText: firstNonEmptyText(question.answerText, question.answer),
    mode: question.mode ?? question.questionMode ?? "numeric",
    operationFamilyId: question.operationFamilyId ?? question.metadata?.operationFamilyId ?? "PATH1_EXISTING_RUNTIME",
    sourceNodeId: question.sourceNodeId ?? question.sourceId ?? null,
    knowledgePointId: question.knowledgePointId ?? question.metadata?.knowledgePointId ?? null,
  };
}

function recordForQuestion(records, question, index) {
  if (!Array.isArray(records) || records.length === 0) return null;
  const questionId = question?.generatedItemId ?? question?.id ?? null;
  if (questionId !== null) {
    const matched = records.find((record) => (
      record?.questionId === questionId
      || record?.generatedItemId === questionId
      || record?.id === questionId
    ));
    if (matched) return matched;
  }
  return records[index] ?? null;
}

function validateRenderableBodies(questions = []) {
  const failures = [];
  for (let index = 0; index < questions.length; index += 1) {
    const question = questions[index];
    const missing = [];
    if (!firstNonEmptyText(question?.prompt, question?.blankedDisplayText, question?.promptText, question?.displayText)) {
      missing.push("questionBody");
    }
    if (!firstNonEmptyText(question?.answerText, question?.answer)) {
      missing.push("answerBody");
    }
    if (missing.length > 0) {
      failures.push({
        questionNumber: index + 1,
        questionId: question?.generatedItemId ?? question?.id ?? null,
        missing,
      });
    }
  }
  return failures;
}

function extractSubplanQuestions(worksheetDocument = {}) {
  const directQuestions = worksheetDocument.generatedQuestions ?? worksheetDocument.questions;
  if (Array.isArray(directQuestions)) {
    const displayModels = Array.isArray(worksheetDocument.questionDisplayModels)
      ? worksheetDocument.questionDisplayModels
      : [];
    const answerKeyItems = Array.isArray(worksheetDocument.answerKeyItems)
      ? worksheetDocument.answerKeyItems
      : [];
    if (displayModels.length > 0 && displayModels.length !== directQuestions.length) {
      return {
        ok: false,
        questions: [],
        errors: [{
          code: "PATH1_SUBPLAN_DISPLAY_COUNT_MISMATCH",
          expected: directQuestions.length,
          actual: displayModels.length,
        }],
      };
    }

    const projectedQuestions = directQuestions.map((question, index) => {
      const displayModel = recordForQuestion(displayModels, question, index);
      const answerKeyItem = recordForQuestion(answerKeyItems, question, index);
      return {
        ...question,
        prompt: firstNonEmptyText(
          displayModel?.blankedDisplayText,
          displayModel?.promptText,
          question?.prompt,
          question?.blankedDisplayText,
          question?.promptText,
          question?.displayText,
        ),
        answerText: firstNonEmptyText(
          answerKeyItem?.answerText,
          displayModel?.answerText,
          question?.answerText,
          question?.answer,
        ),
        metadata: {
          ...(question?.metadata ?? {}),
          path1RenderableProjection: displayModel ? "questionDisplayModels" : "rawQuestion",
        },
      };
    });
    const renderableFailures = validateRenderableBodies(projectedQuestions);
    if (renderableFailures.length > 0) {
      return {
        ok: false,
        questions: [],
        errors: [{
          code: "PATH1_SUBPLAN_RENDERABLE_BODY_MISSING",
          failures: renderableFailures,
        }],
      };
    }
    return { ok: true, questions: projectedQuestions, errors: [] };
  }

  const questionItems = worksheetDocument.questionItems;
  if (!Array.isArray(questionItems)) {
    return { ok: true, questions: [], errors: [] };
  }

  const answerKeyItems = Array.isArray(worksheetDocument.answerKeyItems)
    ? worksheetDocument.answerKeyItems
    : [];
  if (answerKeyItems.length !== questionItems.length) {
    return {
      ok: false,
      questions: [],
      errors: [{
        code: "PATH1_SUBPLAN_ANSWER_COUNT_MISMATCH",
        expected: questionItems.length,
        actual: answerKeyItems.length,
      }],
    };
  }

  const answersByNumber = new Map(answerKeyItems.map((answer, index) => [
    answer.questionNumber ?? index + 1,
    answer,
  ]));
  const missingAnswerNumbers = [];
  const questions = questionItems.map((question, index) => {
    const questionNumber = question.questionNumber ?? index + 1;
    const answer = answersByNumber.get(questionNumber);
    if (!answer) missingAnswerNumbers.push(questionNumber);
    return {
      ...question,
      generatedItemId: question.generatedItemId
        ?? question.id
        ?? `${question.patternSpecId ?? "subplan-question"}-${questionNumber}`,
      prompt: firstNonEmptyText(
        question.blankedDisplayText,
        question.prompt,
        question.promptText,
        question.displayText,
      ),
      answerText: firstNonEmptyText(answer?.answerText, question.answerText, question.answer),
      metadata: {
        ...(question.metadata ?? {}),
        sourceIds: question.sourceIds ?? [],
        answerModelId: question.answerModelId ?? answer?.answerModelId ?? null,
        path1RenderableProjection: "questionItems+answerKeyItems",
      },
    };
  });

  if (missingAnswerNumbers.length > 0) {
    return {
      ok: false,
      questions: [],
      errors: [{
        code: "PATH1_SUBPLAN_ANSWER_BINDING_MISSING",
        questionNumbers: missingAnswerNumbers,
      }],
    };
  }
  const renderableFailures = validateRenderableBodies(questions);
  if (renderableFailures.length > 0) {
    return {
      ok: false,
      questions: [],
      errors: [{
        code: "PATH1_SUBPLAN_RENDERABLE_BODY_MISSING",
        failures: renderableFailures,
      }],
    };
  }
  return { ok: true, questions, errors: [] };
}

function hashSeed(input) {
  let hash = 2166136261;
  for (const char of String(input)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function buildFourDigitByTwoDigitItems({ count, seed, blockId }) {
  const items = [];
  const used = new Set();
  let cursor = hashSeed(`${seed}:${blockId}`);
  let attempts = 0;
  while (items.length < count && attempts < count * 40) {
    attempts += 1;
    cursor = (Math.imul(cursor, 1664525) + 1013904223) >>> 0;
    const divisor = 21 + (cursor % 69);
    cursor = (Math.imul(cursor, 1664525) + 1013904223) >>> 0;
    const quotient = 20 + (cursor % 80);
    cursor = (Math.imul(cursor, 1664525) + 1013904223) >>> 0;
    const remainder = cursor % divisor;
    const dividend = divisor * quotient + remainder;
    if (dividend < 1000 || dividend > 9999) continue;
    const key = `${dividend}/${divisor}`;
    if (used.has(key)) continue;
    used.add(key);
    items.push({
      generatedItemId: `path1-p1-09-${items.length + 1}-${dividend}-${divisor}`,
      prompt: `${dividend} ÷ ${divisor} = ______（寫出商與餘數）`,
      answerText: `${quotient} 餘 ${remainder}`,
      mode: "numeric",
      operationFamilyId: "INTEGER_LONG_DIVISION_DIFFICULTY_EXPANSION",
      sourceNodeId: "path1_four_digit_by_two_digit_division",
      knowledgePointId: null,
      metadata: {
        path1BlockId: blockId,
        pathDifficultyExpansionId: "path1_four_digit_by_two_digit_division",
        dividend,
        divisor,
        quotient,
        remainder,
        invariantPassed: dividend === divisor * quotient + remainder && remainder < divisor,
        canonicalKnowledgePointMinted: false,
      },
    });
  }
  if (items.length !== count) {
    return {
      ok: false,
      errors: [{ code: "PATH1_DIFFICULTY_EXPANSION_CAPACITY_FAILED", blockId, requested: count, generated: items.length }],
      items: [],
    };
  }
  return { ok: true, errors: [], items };
}

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
  return listPath1PublicWorksheetBlocks();
}

export function buildPath1ManualWorksheet({
  blockId,
  questionCount = 20,
  generationSeed = "path1-manual",
  includeAnswerKey = true,
  printLayout = { paperSize: "A4", columns: 3, rowsPerPage: 5, showQuestionNumbers: true },
  practiceMode = "arithmetic",
} = {}) {
  const block = getPath1PublicWorksheetBlock(blockId);
  if (!block) return failed(blockId, [{ code: "PATH1_BLOCK_NOT_FOUND", blockId }]);
  const count = Math.max(1, Math.min(120, Number(questionCount) || 20));
  let generatedItems = [];
  let diversitySummary = null;
  let transferSummary = null;
  const warnings = [];

  if (practiceMode === PATH1_EQUAL_GROUPS_TRANSFER_PRACTICE_MODE) {
    if (!["P1-01", "P1-02"].includes(blockId)) {
      return failed(blockId, [{ code: "PATH1_TRANSFER_MODE_BLOCK_NOT_SUPPORTED", blockId }]);
    }
    const transfer = buildPath1EqualGroupsTransferItems({
      blockId,
      count,
      seed: `${generationSeed}:${blockId}:equal-groups-transfer`,
      practiceMode,
    });
    if (!transfer.ok) return failed(blockId, transfer.errors);
    const validation = validatePath1EqualGroupsTransferItems(transfer.items);
    if (!validation.ok) {
      return failed(blockId, [{
        code: "PATH1_TRANSFER_VALIDATION_FAILED",
        blockId,
        failures: validation.errors,
      }]);
    }
    generatedItems = [...transfer.items];
    transferSummary = transfer.summary;
  } else if (practiceMode !== "arithmetic") {
    return failed(blockId, [{ code: "PATH1_PRACTICE_MODE_NOT_SUPPORTED", blockId, practiceMode }]);
  } else if (block.generationKind === "DIFFICULTY_EXPANSION") {
    const difficulty = buildFourDigitByTwoDigitItems({ count, seed: generationSeed, blockId });
    if (!difficulty.ok) return failed(blockId, difficulty.errors);
    generatedItems = difficulty.items;
  } else if (block.diversityProfileId === PATH1_P1_01_DIVERSITY_PROFILE_ID) {
    const visibility = visibleEntryByKnowledgePointId();
    const missing = block.knowledgePointIds.filter((knowledgePointId) => !visibility.has(knowledgePointId));
    if (missing.length > 0) {
      return failed(blockId, [{ code: "PATH1_KP_NOT_PUBLICLY_VISIBLE", blockId, knowledgePointIds: missing }]);
    }
    if (
      block.knowledgePointIds.length !== 1
      || block.knowledgePointIds[0] !== PATH1_P1_01_KNOWLEDGE_POINT_ID
    ) {
      return failed(blockId, [{
        code: "PATH1_DIVERSITY_PROFILE_KP_MISMATCH",
        blockId,
        diversityProfileId: block.diversityProfileId,
        knowledgePointIds: block.knowledgePointIds,
      }]);
    }
    const diversity = buildPath1P101DiversityItems({
      count,
      seed: `${generationSeed}:${blockId}`,
    });
    if (!diversity.ok) return failed(blockId, diversity.errors);
    generatedItems = diversity.items;
    diversitySummary = diversity.summary;
  } else if (block.diversityProfileId === PATH1_P1_02_PUBLIC_DIVERSITY_PROFILE_ID) {
    const visibility = visibleEntryByKnowledgePointId();
    const missing = block.knowledgePointIds.filter((knowledgePointId) => !visibility.has(knowledgePointId));
    if (missing.length > 0) {
      return failed(blockId, [{ code: "PATH1_KP_NOT_PUBLICLY_VISIBLE", blockId, knowledgePointIds: missing }]);
    }
    if (
      block.knowledgePointIds.length !== PATH1_P1_02_KNOWLEDGE_POINT_IDS.length
      || block.knowledgePointIds.some((knowledgePointId, index) => (
        knowledgePointId !== PATH1_P1_02_KNOWLEDGE_POINT_IDS[index]
      ))
    ) {
      return failed(blockId, [{
        code: "PATH1_DIVERSITY_PROFILE_KP_MISMATCH",
        blockId,
        diversityProfileId: block.diversityProfileId,
        knowledgePointIds: block.knowledgePointIds,
      }]);
    }
    const diversity = buildPath1P102PublicDiversityItems({
      count,
      seed: `${generationSeed}:${blockId}`,
    });
    if (!diversity.ok) return failed(blockId, diversity.errors);
    generatedItems = diversity.items;
    diversitySummary = diversity.summary;
  } else {
    const visibility = visibleEntryByKnowledgePointId();
    const missing = block.knowledgePointIds.filter((knowledgePointId) => !visibility.has(knowledgePointId));
    if (missing.length > 0) {
      return failed(blockId, [{ code: "PATH1_KP_NOT_PUBLICLY_VISIBLE", blockId, knowledgePointIds: missing }]);
    }
    if (count < block.knowledgePointIds.length) {
      return failed(blockId, [{
        code: "PATH1_QUESTION_COUNT_BELOW_KP_COVERAGE",
        blockId,
        questionCount: count,
        requiredMinimum: block.knowledgePointIds.length,
      }]);
    }

    const allocations = allocateCounts(count, block.knowledgePointIds.length);
    for (let index = 0; index < block.knowledgePointIds.length; index += 1) {
      const knowledgePointId = block.knowledgePointIds[index];
      const source = visibility.get(knowledgePointId);
      const groups = selectedGroupsForKnowledgePoint(knowledgePointId, block.questionMode);
      if (groups.length === 0) {
        return failed(blockId, [{ code: "PATH1_KP_HAS_NO_VISIBLE_PATTERN_GROUP", blockId, knowledgePointId }]);
      }
      const requiresProjectedAnswerJoin = source.sourceId === "g5a_u02_5a02";
      const subPlan = {
        sourceId: source.sourceId,
        selectionMode: "singleKnowledgePoint",
        selectedKnowledgePointIds: [knowledgePointId],
        selectedPatternGroupIds: unique(groups.map((group) => group.patternGroupId)),
        questionCount: allocations[index],
        generationSeed: `${generationSeed}:${blockId}:${knowledgePointId}`,
        ordering: "shuffleAcrossPatterns",
        includeAnswerKey: requiresProjectedAnswerJoin,
        printLayout: {
          paperSize: "A4",
          columns: 2,
          rowsPerPage: 4,
          showQuestionNumbers: true,
          showAnswerKeyPage: requiresProjectedAnswerJoin,
        },
        ...(block.questionMode ? { questionMode: block.questionMode } : {}),
      };
      const result = buildWorksheetDocumentFromPlan(subPlan);
      if (!result?.ok || !result?.worksheetDocument) {
        return failed(blockId, [{
          code: "PATH1_SUBPLAN_GENERATION_FAILED",
          blockId,
          knowledgePointId,
          sourceId: source.sourceId,
          errors: result?.errors ?? [],
        }], result?.warnings ?? []);
      }
      const extracted = extractSubplanQuestions(result.worksheetDocument);
      if (!extracted.ok) {
        return failed(blockId, extracted.errors.map((error) => ({
          ...error,
          blockId,
          knowledgePointId,
          sourceId: source.sourceId,
        })));
      }
      const questions = extracted.questions;
      if (questions.length !== allocations[index]) {
        return failed(blockId, [{
          code: "PATH1_SUBPLAN_QUESTION_COUNT_MISMATCH",
          blockId,
          knowledgePointId,
          expected: allocations[index],
          actual: questions.length,
        }]);
      }
      generatedItems.push(...questions.map((question, questionIndex) => (
        normalizeGeneratedQuestion(question, `${blockId}-${knowledgePointId}`, questionIndex)
      )));
      warnings.push(...(result.warnings ?? []));
    }
  }

  const renderableFailures = validateRenderableBodies(generatedItems);
  if (renderableFailures.length > 0) {
    return failed(blockId, [{
      code: "PATH1_RENDERABLE_BODY_MISSING",
      blockId,
      failures: renderableFailures,
    }], warnings);
  }

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
        ...(diversitySummary ? {
          diversityProfileId: block.diversityProfileId,
          patternFamilyCount: diversitySummary.patternFamilyCount,
          distinctPromptCapacity: diversitySummary.distinctPromptCapacity,
          familyCounts: diversitySummary.familyCounts,
        } : {}),
        ...(transferSummary ? {
          practiceMode: PATH1_EQUAL_GROUPS_TRANSFER_PRACTICE_MODE,
          relationKnowledgePointId: PATH1_EQUAL_GROUPS_TRANSFER_RELATION_KP_ID,
          semanticPatternSpecIdsUsed: transferSummary.semanticPatternSpecIdsUsed,
          semanticPatternSpecCounts: transferSummary.semanticPatternSpecCounts,
          arithmeticKnowledgePointCounts: transferSummary.arithmeticKnowledgePointCounts,
          distinctPromptCount: transferSummary.distinctPromptCount,
        } : {}),
      },
      warnings,
      errors: [],
    },
    metadata: {
      pathId: "PATH1_INTEGER_FOUNDATIONS",
      path1BlockId: blockId,
      path1BlockTitle: block.title,
      path1GenerationKind: block.generationKind,
      path1DiversityProfileId: block.diversityProfileId ?? null,
      manualProgression: true,
      automaticNPlus1: false,
      ...(transferSummary ? {
        practiceMode: PATH1_EQUAL_GROUPS_TRANSFER_PRACTICE_MODE,
        relationKnowledgePointId: PATH1_EQUAL_GROUPS_TRANSFER_RELATION_KP_ID,
        semanticPatternSpecIdsUsed: transferSummary.semanticPatternSpecIdsUsed,
      } : {}),
    },
  });

  return Object.freeze({
    ...documentResult,
    ok: true,
    errors: Object.freeze([]),
    warnings: Object.freeze(warnings),
    block,
  });
}
