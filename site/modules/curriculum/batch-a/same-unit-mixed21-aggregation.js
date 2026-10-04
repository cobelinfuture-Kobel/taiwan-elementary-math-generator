import {
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
  P09_MIXED21_TARGET_SOURCE_IDS,
} from "../registry/batch-a-selector-p09-mixed21-extension.js";
import {
  G3A_U01_VISUAL_RANK01_KP_ID,
  G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID,
  G3A_U01_VISUAL_RANK01_PUBLIC_PATTERN_GROUP,
  G3A_U01_VISUAL_RANK01_SOURCE_ID,
} from "../registry/g3a-u01-visual-rank01-selector-projection.js";
import { paginateAnswerKeyItems, paginateQuestionDisplayModels } from "../../core/worksheet-pagination.js";

export const P09_MIXED21_AGGREGATION_TASK_ID =
  "P09_UI_SameUnitMixed21_SharedUnitAggregationImplementation";

const TARGETS = new Set([...P09_MIXED21_TARGET_SOURCE_IDS, G3A_U01_VISUAL_RANK01_SOURCE_ID]);
const MIXED = "mixedKnowledgePointsSameUnit";
const unique = (values = []) => [...new Set((Array.isArray(values) ? values : []).filter(Boolean))];
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

export function requestsP09Mixed21Aggregation(plan = {}) {
  return TARGETS.has(plan.sourceId) && plan.selectionMode === MIXED;
}

function rowsForSource(sourceId) {
  return listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === sourceId);
}

function selectedRows(plan) {
  const rows = rowsForSource(plan.sourceId);
  const requestedTargets = unique(plan.selectedSelectorTargetIds ?? []);
  if (plan.sourceId === G3A_U01_VISUAL_RANK01_SOURCE_ID && requestedTargets.length >= 2) {
    const rowById = new Map(rows.map((row) => [row.knowledgePointId, row]));
    const targets = [];
    for (const targetId of requestedTargets) {
      if (targetId === G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID) {
        const baseRow = rowById.get(G3A_U01_VISUAL_RANK01_KP_ID);
        if (baseRow) {
          targets.push({
            ...baseRow,
            selectorTargetId: G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID,
            forcedPatternGroupIds: [G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID],
            selectorDisplayName: G3A_U01_VISUAL_RANK01_PUBLIC_PATTERN_GROUP.displayName,
          });
        }
        continue;
      }
      const row = rowById.get(targetId);
      if (!row) continue;
      targets.push({
        ...row,
        selectorTargetId: targetId,
        excludedPatternGroupIds: targetId === G3A_U01_VISUAL_RANK01_KP_ID
          ? [G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID]
          : [],
        selectorDisplayName: row.displayName ?? targetId,
      });
    }
    if (targets.length >= 2) return targets;
  }

  const requested = unique(plan.selectedKnowledgePointIds ?? plan.knowledgePointIds ?? []);
  if (requested.length < 2) return rows.map((row) => ({ ...row, selectorTargetId: row.knowledgePointId }));
  const requestedSet = new Set(requested);
  return rows
    .filter((row) => requestedSet.has(row.knowledgePointId))
    .map((row) => ({ ...row, selectorTargetId: row.knowledgePointId }));
}

function allocate(rows, questionCount) {
  const base = Math.floor(questionCount / rows.length);
  let remainder = questionCount % rows.length;
  return rows.map((row) => {
    const count = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
    return Object.freeze({
      selectorTargetId: row.selectorTargetId ?? row.knowledgePointId,
      knowledgePointId: row.knowledgePointId,
      questionCount: count,
    });
  });
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

function groupsForRow(row) {
  const groups = getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId);
  if (
    row.sourceId === G3A_U01_VISUAL_RANK01_SOURCE_ID
    && row.knowledgePointId === G3A_U01_VISUAL_RANK01_KP_ID
    && !groups.some((group) => group.patternGroupId === G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID)
  ) {
    return [...groups, G3A_U01_VISUAL_RANK01_PUBLIC_PATTERN_GROUP];
  }
  return groups;
}

function requestedGroupsForRow(plan, row, mode) {
  const groups = groupsForRow(row)
    .filter((group) => !(row.excludedPatternGroupIds ?? []).includes(group.patternGroupId));
  if (Array.isArray(row.forcedPatternGroupIds) && row.forcedPatternGroupIds.length > 0) {
    return [...row.forcedPatternGroupIds];
  }
  const requested = new Set(unique(plan.selectedPatternGroupIds));
  const intersection = groups.filter((group) => requested.has(group.patternGroupId));
  if (intersection.length) return intersection.map((group) => group.patternGroupId);
  if (mode === "application") {
    return groups.filter(groupLooksApplication).map((group) => group.patternGroupId);
  }
  return [];
}

function preferredModes(row, plan) {
  if ((row.forcedPatternGroupIds ?? []).includes(G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID)) {
    return ["numeric"];
  }
  const explicit = String(plan.questionMode ?? "").trim();
  const rowModes = [
    ...(Array.isArray(row.questionModes) ? row.questionModes : []),
    row.questionMode,
    row.mode,
  ].map((value) => String(value ?? "").trim()).filter(Boolean);
  const fallbacks = ["numeric", "diagram", "application", "reasoning"];
  const candidates = explicit && explicit !== "mixed"
    ? [explicit, ...rowModes, ...fallbacks]
    : [...rowModes, ...fallbacks];
  return unique(candidates);
}

function issue(code, details = {}) {
  return Object.freeze({ code, severity: "error", ...details });
}

function buildLeaf(plan, row, questionCount, buildLeafWorksheet) {
  const attempts = [];
  for (const mode of preferredModes(row, plan)) {
    const selectedPatternGroupIds = requestedGroupsForRow(plan, row, mode);
    const leafPlan = {
      ...plan,
      selectionMode: "singleKnowledgePoint",
      selectedKnowledgePointIds: [row.knowledgePointId],
      knowledgePointIds: [row.knowledgePointId],
      selectedPatternGroupIds,
      patternSpecIds: undefined,
      questionMode: mode,
      requestedQuestionType: mode,
      questionCount,
      generationSeed: `${plan.generationSeed ?? "p09-mixed21"}:${row.selectorTargetId ?? row.knowledgePointId}:${mode}`,
      p09Mixed21LeafDispatch: true,
    };
    const result = buildLeafWorksheet(leafPlan);
    attempts.push({
      mode,
      ok: result?.ok === true,
      questionCount: result?.worksheetDocument?.questionCount
        ?? result?.worksheetDocument?.summary?.questionCount
        ?? result?.worksheetDocument?.generatedQuestions?.length
        ?? 0,
      errors: clone(result?.errors ?? result?.validation?.errors ?? []),
    });
    if (result?.ok && result?.worksheetDocument) {
      const count = result.worksheetDocument.questionCount
        ?? result.worksheetDocument.summary?.questionCount
        ?? result.worksheetDocument.generatedQuestions?.length
        ?? result.worksheetDocument.questions?.length
        ?? 0;
      if (count === questionCount) {
        return { ok: true, mode, leafPlan, result, attempts };
      }
    }
  }
  return { ok: false, attempts };
}

function fallbackDisplayModel(question, index) {
  const prompt = String(question.blankedDisplayText ?? question.promptText ?? question.prompt ?? question.questionText ?? "");
  const answer = String(question.answerText ?? question.answer ?? question.finalAnswer ?? "");
  return {
    questionId: question.id ?? question.generatedItemId ?? `mixed21-fallback-${index + 1}`,
    questionNumber: index + 1,
    patternId: question.patternSpecId ?? question.metadata?.patternId ?? null,
    knowledgePointId: question.knowledgePointId ?? question.metadata?.knowledgePointId ?? null,
    patternGroupId: question.patternGroupId ?? question.metadata?.patternGroupId ?? null,
    promptText: prompt,
    displayText: question.displayText ?? `${prompt} ${answer}`,
    blankedDisplayText: prompt,
    answerText: answer,
    questionNumberText: `${index + 1}.`,
    metadataSnapshot: { ...(question.metadata ?? {}) },
    layoutHints: {
      estimatedTextLength: prompt.length,
      hasGrouping: false,
      avoidPageBreakInside: true,
      questionMode: question.questionMode ?? question.mode ?? "mixed",
    },
  };
}

function fallbackAnswerItem(question, index, model) {
  return {
    questionId: model.questionId,
    questionNumber: index + 1,
    patternId: model.patternId,
    knowledgePointId: model.knowledgePointId,
    patternGroupId: model.patternGroupId,
    promptText: model.blankedDisplayText,
    answerText: model.answerText,
    metadataSnapshot: model.metadataSnapshot,
    layoutHints: { avoidPageBreakInside: true },
  };
}

function stringSeed(value) {
  let hash = 2166136261;
  for (const char of String(value ?? "")) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function shuffled(records, seed) {
  const out = [...records];
  let state = stringSeed(seed) || 1;
  for (let i = out.length - 1; i > 0; i -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const j = state % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function safePrintLayout(plan, leafs) {
  const requested = plan.printLayout ?? {};
  const requestedColumns = Number.isInteger(requested.columns) ? Math.max(1, requested.columns) : 2;
  const requestedRows = Number.isInteger(requested.rowsPerPage) ? Math.max(1, requested.rowsPerPage) : 4;
  const leafColumns = leafs.map((leaf) => leaf.result.worksheetDocument.printOptions?.columns).filter(Number.isInteger);
  const leafRows = leafs.map((leaf) => leaf.result.worksheetDocument.printOptions?.rowsPerPage).filter(Number.isInteger);
  return Object.freeze({
    paperSize: requested.paperSize ?? "A4",
    columns: Math.min(requestedColumns, ...(leafColumns.length ? leafColumns : [requestedColumns])),
    rowsPerPage: Math.min(requestedRows, ...(leafRows.length ? leafRows : [requestedRows])),
    showQuestionNumbers: requested.showQuestionNumbers !== false,
    showAnswerKeyPage: plan.includeAnswerKey !== false && requested.showAnswerKeyPage !== false,
    longTextCardPolicy: "avoidSplit",
  });
}

function materializeRecords(leafs) {
  const records = [];
  for (const leaf of leafs) {
    const doc = leaf.result.worksheetDocument;
    const questions = doc.generatedQuestions ?? doc.questions ?? [];
    const models = doc.questionDisplayModels ?? questions.map(fallbackDisplayModel);
    const answers = doc.answerKeyItems ?? questions.map((question, index) => fallbackAnswerItem(question, index, models[index]));
    questions.forEach((question, index) => {
      records.push({
        selectorTargetId: leaf.row?.selectorTargetId ?? leaf.leafPlan.selectedKnowledgePointIds[0],
        knowledgePointId: leaf.leafPlan.selectedKnowledgePointIds[0],
        mode: leaf.mode,
        question,
        model: models[index] ?? fallbackDisplayModel(question, index),
        answer: answers[index] ?? fallbackAnswerItem(question, index, models[index] ?? fallbackDisplayModel(question, index)),
      });
    });
  }
  return records;
}

function normalizedRecord(record, index, sourceId) {
  const localId = record.model?.questionId
    ?? record.question?.id
    ?? record.question?.generatedItemId
    ?? `q-${index + 1}`;
  const questionId = `p09-mixed21-${sourceId}-${record.selectorTargetId ?? record.knowledgePointId}-${localId}`;
  const question = {
    ...record.question,
    ...(record.question?.id != null ? { id: questionId } : {}),
    ...(record.question?.generatedItemId != null ? { generatedItemId: questionId } : {}),
    knowledgePointId: record.question?.knowledgePointId ?? record.knowledgePointId,
    metadata: {
      ...(record.question?.metadata ?? {}),
      knowledgePointId: record.question?.metadata?.knowledgePointId ?? record.knowledgePointId,
      selectorTargetId: record.selectorTargetId ?? record.knowledgePointId,
      sameUnitMixed21Aggregation: true,
    },
  };
  const model = {
    ...record.model,
    questionId,
    questionNumber: index + 1,
    questionNumberText: record.model?.questionNumberText == null ? null : `${index + 1}.`,
    knowledgePointId: record.model?.knowledgePointId ?? record.knowledgePointId,
    metadataSnapshot: {
      ...(record.model?.metadataSnapshot ?? {}),
      sourceId,
      knowledgePointId: record.model?.knowledgePointId ?? record.knowledgePointId,
      selectorTargetId: record.selectorTargetId ?? record.knowledgePointId,
      sameUnitMixed21Aggregation: true,
    },
  };
  const answer = {
    ...record.answer,
    questionId,
    questionNumber: index + 1,
    knowledgePointId: record.answer?.knowledgePointId ?? record.knowledgePointId,
    metadataSnapshot: {
      ...(record.answer?.metadataSnapshot ?? model.metadataSnapshot),
      sourceId,
      knowledgePointId: record.answer?.knowledgePointId ?? record.knowledgePointId,
      selectorTargetId: record.selectorTargetId ?? record.knowledgePointId,
      sameUnitMixed21Aggregation: true,
    },
  };
  return { question, model, answer };
}

export function buildP09Mixed21Worksheet(plan = {}, buildLeafWorksheet) {
  if (!requestsP09Mixed21Aggregation(plan)) return null;
  if (typeof buildLeafWorksheet !== "function") {
    return Object.freeze({
      ok: false,
      errors: Object.freeze([issue("P09_MIXED21_LEAF_BUILDER_REQUIRED")]),
      warnings: Object.freeze([]),
      worksheetDocument: null,
    });
  }

  const rows = selectedRows(plan);
  const questionCount = Number(plan.questionCount ?? 20);
  if (rows.length < 2) {
    return Object.freeze({
      ok: false,
      errors: Object.freeze([issue("P09_MIXED21_KP_SELECTION_REQUIRES_AT_LEAST_TWO")]),
      warnings: Object.freeze([]),
      worksheetDocument: null,
    });
  }
  if (!Number.isInteger(questionCount) || questionCount < rows.length || questionCount > 240) {
    return Object.freeze({
      ok: false,
      errors: Object.freeze([issue("P09_MIXED21_QUESTION_COUNT_INVALID", {
        min: rows.length,
        max: 240,
        actual: questionCount,
      })]),
      warnings: Object.freeze([]),
      worksheetDocument: null,
    });
  }

  const allocation = allocate(rows, questionCount);
  const leafs = [];
  const errors = [];
  for (const entry of allocation) {
    const row = rows.find((candidate) => (candidate.selectorTargetId ?? candidate.knowledgePointId) === entry.selectorTargetId);
    const leaf = buildLeaf(plan, row, entry.questionCount, buildLeafWorksheet);
    if (!leaf.ok) {
      errors.push(issue("P09_MIXED21_LEAF_RUNTIME_FAILED", {
        sourceId: plan.sourceId,
        knowledgePointId: entry.knowledgePointId,
        attempts: leaf.attempts,
      }));
      continue;
    }
    leafs.push({ ...leaf, row });
  }
  if (errors.length || leafs.length !== rows.length) {
    return Object.freeze({
      ok: false,
      errors: Object.freeze(errors),
      warnings: Object.freeze([]),
      worksheetDocument: null,
      allocation: Object.freeze(allocation),
    });
  }

  let records = materializeRecords(leafs);
  if (records.length !== questionCount) {
    return Object.freeze({
      ok: false,
      errors: Object.freeze([issue("P09_MIXED21_OUTPUT_COUNT_MISMATCH", {
        expected: questionCount,
        actual: records.length,
      })]),
      warnings: Object.freeze([]),
      worksheetDocument: null,
      allocation: Object.freeze(allocation),
    });
  }
  if (plan.ordering === "shuffleAcrossPatterns") {
    records = shuffled(records, plan.generationSeed ?? "p09-mixed21");
  }

  const normalized = records.map((record, index) => normalizedRecord(record, index, plan.sourceId));
  const questions = normalized.map((entry) => entry.question);
  const models = normalized.map((entry) => entry.model);
  const layout = safePrintLayout(plan, leafs);
  const answers = layout.showAnswerKeyPage ? normalized.map((entry) => entry.answer) : [];
  const questionPages = paginateQuestionDisplayModels(models, layout);
  const answerKeyPages = layout.showAnswerKeyPage
    ? paginateAnswerKeyItems(answers, layout)
    : [];
  const firstRow = rows[0] ?? {};
  const selectedKnowledgePointIds = [...new Set(rows.map((row) => row.knowledgePointId))];
  const selectedSelectorTargetIds = rows.map((row) => row.selectorTargetId ?? row.knowledgePointId);
  const warnings = leafs.flatMap((leaf) => leaf.result.warnings ?? []);
  const worksheetDocument = Object.freeze({
    schemaVersion: "worksheet-document-v1",
    version: "1",
    worksheetId: `p09-mixed21-${plan.sourceId}-${questionCount}-${plan.generationSeed ?? "public"}`,
    worksheetKind: "batchAWorksheet",
    title: `${firstRow.unitCode ?? plan.sourceId}｜${firstRow.unitTitle ?? "同單元混合"}`,
    subtitle: "同單元混合知識點",
    generatedAt: "DETERMINISTIC",
    configSnapshot: Object.freeze({
      ...plan,
      selectionMode: MIXED,
      selectedKnowledgePointIds: Object.freeze(selectedKnowledgePointIds),
      selectedSelectorTargetIds: Object.freeze(selectedSelectorTargetIds),
      printLayout: layout,
    }),
    orderingMode: plan.ordering ?? "groupedByPattern",
    questionCount,
    questionPages: Object.freeze(questionPages),
    answerKeyPages: Object.freeze(answerKeyPages),
    sections: Object.freeze([]),
    generatedQuestions: Object.freeze(questions),
    questions: Object.freeze(questions),
    questionDisplayModels: Object.freeze(models),
    answerKeyItems: Object.freeze(answers),
    printOptions: Object.freeze({
      ...layout,
      showAnswerKey: layout.showAnswerKeyPage,
      answerKeyPlacement: layout.showAnswerKeyPage ? "afterQuestions" : "none",
    }),
    publicControls: Object.freeze({
      sourceId: plan.sourceId,
      productAdmissionTask: P09_MIXED21_AGGREGATION_TASK_ID,
      authorityMode: "P09_MIXED21_SHARED_UNIT_AGGREGATION",
      questionCountMax: 240,
    }),
    metadata: Object.freeze({
      taskId: P09_MIXED21_AGGREGATION_TASK_ID,
      sourceId: plan.sourceId,
      selectionMode: MIXED,
      selectedKnowledgePointIds: Object.freeze(selectedKnowledgePointIds),
      selectedSelectorTargetIds: Object.freeze(selectedSelectorTargetIds),
      sameUnitMixedUsed: true,
      crossUnitMixedUsed: false,
      sharedAggregationUsed: true,
      leafRuntimeOwnersPreserved: true,
      semanticAuthorityMutated: false,
      r02R05Mutated: false,
      allocation: Object.freeze(allocation.map((entry) => ({ ...entry }))),
    }),
    batchA: Object.freeze({
      sourceId: plan.sourceId,
      questionMode: "mixed",
      selectionMode: MIXED,
      selectedKnowledgePointIds: Object.freeze(selectedKnowledgePointIds),
      selectedSelectorTargetIds: Object.freeze(selectedSelectorTargetIds),
    }),
    report: Object.freeze({
      ok: true,
      errors: Object.freeze([]),
      warnings: Object.freeze(warnings),
      summary: Object.freeze({
        questionCount,
        questionPageCount: questionPages.length,
        answerKeyPageCount: answerKeyPages.length,
        selectedKnowledgePointCount: selectedKnowledgePointIds.length,
      }),
    }),
    summary: Object.freeze({
      questionCount,
      questionPageCount: questionPages.length,
      answerKeyPageCount: answerKeyPages.length,
      selectedKnowledgePointCount: selectedKnowledgePointIds.length,
      sameUnitMixedQuestionCount: questionCount,
    }),
  });

  return Object.freeze({
    ok: true,
    errors: Object.freeze([]),
    warnings: Object.freeze(warnings),
    worksheetDocument,
    allocation: Object.freeze(allocation),
    leafDispatch: Object.freeze(leafs.map((leaf) => Object.freeze({
      knowledgePointId: leaf.leafPlan.selectedKnowledgePointIds[0],
      questionCount: leaf.leafPlan.questionCount,
      questionMode: leaf.mode,
      attemptCount: leaf.attempts.length,
    }))),
    p09Mixed21Aggregation: true,
  });
}
