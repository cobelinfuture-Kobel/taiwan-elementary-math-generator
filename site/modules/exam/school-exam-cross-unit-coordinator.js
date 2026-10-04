import { listBatchASourceUnits } from "../curriculum/batch-a/source-units.js";
import {
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../curriculum/registry/batch-a-selector-g3a-u01-visual-rank03-extension.js";
import {
  G3A_U01_VISUAL_RANK01_KP_ID,
  G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID,
  G3A_U01_VISUAL_RANK01_PUBLIC_PATTERN_GROUP,
  G3A_U01_VISUAL_RANK01_SOURCE_ID,
} from "../curriculum/registry/g3a-u01-visual-rank01-selector-projection.js";
import {
  G3A_U01_VISUAL_RANK02_KP_ID,
  G3A_U01_VISUAL_RANK02_PATTERN_GROUP_ID,
} from "../curriculum/registry/g3a-u01-visual-rank02-selector-projection.js";
import {
  G3A_U01_VISUAL_RANK03_KP_ID,
  G3A_U01_VISUAL_RANK03_PATTERN_GROUP_ID,
  G3A_U01_VISUAL_RANK03_PUBLIC_PATTERN_GROUP,
} from "../curriculum/registry/g3a-u01-visual-rank03-selector-projection.js";
import {
  paginateAnswerKeyItems,
  paginateQuestionDisplayModels,
} from "../core/worksheet-pagination.js";

export const SCHOOL_EXAM_CROSS_UNIT_TASK_ID =
  "G06_SCHOOL_EXAM_TEMPLATE_V11_M4_MixedKPCrossUnitRuntime";

const CROSS = "mixedKnowledgePointsCrossUnit";
const SINGLE = "singleKnowledgePoint";
const unique = (values = []) => [...new Set((Array.isArray(values) ? values : []).filter(Boolean))];
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

function issue(code, details = {}) {
  return Object.freeze({ code, severity: "error", ...details });
}

function currentSourceUnits() {
  return listBatchASourceUnits({ includeCurrentFullProductPublic: true });
}

function sourceMap() {
  return new Map(currentSourceUnits().map((unit) => [unit.sourceId, unit]));
}

function visibleRowMap() {
  return new Map(listVisibleBatchAKnowledgePoints().map((row) => [row.knowledgePointId, row]));
}

function allocate(rows, questionCount) {
  const base = Math.floor(questionCount / rows.length);
  let remainder = questionCount % rows.length;
  return rows.map((row) => {
    const count = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
    return Object.freeze({
      selectorTargetId: row.selectorTargetId ?? row.knowledgePointId,
      sourceId: row.sourceId,
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
  if (
    row.sourceId === G3A_U01_VISUAL_RANK01_SOURCE_ID
    && row.knowledgePointId === G3A_U01_VISUAL_RANK01_KP_ID
    && (row.excludedPatternGroupIds ?? []).includes(G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID)
    && mode === "numeric"
  ) {
    return groups.filter((group) => !groupLooksApplication(group)).map((group) => group.patternGroupId);
  }
  if (mode === "application") {
    return groups.filter(groupLooksApplication).map((group) => group.patternGroupId);
  }
  return [];
}

function preferredModes(row, plan) {
  const forced = row.forcedPatternGroupIds ?? [];
  if (
    forced.includes(G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID)
    || forced.includes(G3A_U01_VISUAL_RANK02_PATTERN_GROUP_ID)
    || forced.includes(G3A_U01_VISUAL_RANK03_PATTERN_GROUP_ID)
  ) {
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

function materializedQuestions(document = {}) {
  const candidates = [
    document?.generatedQuestions,
    document?.questions,
    document?.questionItems,
    document?.questionRecords,
  ];
  return candidates.find((items) => Array.isArray(items) && items.length > 0)
    ?? candidates.find(Array.isArray)
    ?? null;
}

function buildLeaf(plan, row, questionCount, buildLeafWorksheet) {
  const attempts = [];
  for (const mode of preferredModes(row, plan)) {
    const selectedPatternGroupIds = requestedGroupsForRow(plan, row, mode);
    const leafPlan = {
      sourceId: row.sourceId,
      selectionMode: SINGLE,
      selectedKnowledgePointIds: [row.knowledgePointId],
      knowledgePointIds: [row.knowledgePointId],
      selectedPatternGroupIds,
      patternSpecIds: undefined,
      questionMode: mode,
      requestedQuestionType: mode,
      questionCount,
      ordering: "groupedByPattern",
      includeAnswerKey: plan.includeAnswerKey !== false,
      generationSeed: `${plan.generationSeed ?? "school-exam-cross-unit"}:${row.sourceId}:${row.selectorTargetId ?? row.knowledgePointId}:${mode}`,
      printLayout: plan.printLayout,
      schoolExamCrossUnitLeafDispatch: true,
    };
    const result = buildLeafWorksheet(leafPlan);
    const actualQuestions = materializedQuestions(result?.worksheetDocument);
    const actualCount = Array.isArray(actualQuestions)
      ? actualQuestions.length
      : (
        result?.worksheetDocument?.questionCount
        ?? result?.worksheetDocument?.summary?.questionCount
        ?? 0
      );
    attempts.push({
      mode,
      ok: result?.ok === true,
      questionCount: actualCount,
      errors: clone(result?.errors ?? result?.validation?.errors ?? []),
    });
    if (result?.ok && result?.worksheetDocument && actualCount === questionCount) {
      return { ok: true, mode, leafPlan, result, attempts };
    }
  }
  return { ok: false, attempts };
}

function fallbackDisplayModel(question, index, row) {
  const prompt = String(
    question?.blankedDisplayText
    ?? question?.promptText
    ?? question?.prompt
    ?? question?.questionText
    ?? "",
  );
  const answer = String(question?.answerText ?? question?.answer ?? question?.finalAnswer ?? "");
  return {
    questionId: question?.id ?? question?.generatedItemId ?? `cross-unit-fallback-${index + 1}`,
    questionNumber: index + 1,
    patternId: question?.patternSpecId ?? question?.metadata?.patternId ?? null,
    sourceId: row.sourceId,
    knowledgePointId: row.knowledgePointId,
    patternGroupId: question?.patternGroupId ?? question?.metadata?.patternGroupId ?? null,
    promptText: prompt,
    displayText: question?.displayText ?? `${prompt} ${answer}`,
    blankedDisplayText: prompt,
    answerText: answer,
    questionNumberText: `${index + 1}.`,
    metadataSnapshot: {
      ...(question?.metadata ?? {}),
      sourceId: row.sourceId,
      knowledgePointId: row.knowledgePointId,
    },
    layoutHints: {
      estimatedTextLength: prompt.length,
      hasGrouping: false,
      avoidPageBreakInside: true,
      questionMode: question?.questionMode ?? question?.mode ?? "mixed",
    },
  };
}

function fallbackAnswerItem(question, index, model, row) {
  return {
    questionId: model.questionId,
    questionNumber: index + 1,
    patternId: model.patternId,
    sourceId: row.sourceId,
    knowledgePointId: row.knowledgePointId,
    patternGroupId: model.patternGroupId,
    promptText: model.blankedDisplayText,
    answerText: model.answerText,
    metadataSnapshot: {
      ...(model.metadataSnapshot ?? {}),
      sourceId: row.sourceId,
      knowledgePointId: row.knowledgePointId,
    },
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
  for (let index = out.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const swapIndex = state % (index + 1);
    [out[index], out[swapIndex]] = [out[swapIndex], out[index]];
  }
  return out;
}

function safePrintLayout(plan, leafs) {
  const requested = plan.printLayout ?? {};
  const requestedColumns = Number.isInteger(requested.columns) ? Math.max(1, requested.columns) : 2;
  const requestedRows = Number.isInteger(requested.rowsPerPage) ? Math.max(1, requested.rowsPerPage) : 5;
  const leafColumns = leafs
    .map((leaf) => leaf.result.worksheetDocument.printOptions?.columns)
    .filter(Number.isInteger);
  const leafRows = leafs
    .map((leaf) => leaf.result.worksheetDocument.printOptions?.rowsPerPage)
    .filter(Number.isInteger);
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
    const row = leaf.row;
    const document = leaf.result.worksheetDocument;
    const questions = materializedQuestions(document) ?? [];
    const models = document.questionDisplayModels
      ?? questions.map((question, index) => fallbackDisplayModel(question, index, row));
    const answers = document.answerKeyItems
      ?? questions.map((question, index) => fallbackAnswerItem(
        question,
        index,
        models[index] ?? fallbackDisplayModel(question, index, row),
        row,
      ));
    questions.forEach((question, index) => {
      const model = models[index] ?? fallbackDisplayModel(question, index, row);
      const answer = answers[index] ?? fallbackAnswerItem(question, index, model, row);
      records.push({ row, selectorTargetId: row.selectorTargetId ?? row.knowledgePointId, mode: leaf.mode, question, model, answer });
    });
  }
  return records;
}

function normalizedRecord(record, index) {
  const { row } = record;
  const localId = record.model?.questionId
    ?? record.question?.id
    ?? record.question?.generatedItemId
    ?? `q-${index + 1}`;
  const questionId = `school-exam-cross-${row.sourceId}-${record.selectorTargetId ?? row.knowledgePointId}-${localId}`;
  const originalQuestionId = String(localId);

  const question = {
    ...record.question,
    ...(record.question?.id != null ? { id: questionId } : {}),
    ...(record.question?.generatedItemId != null ? { generatedItemId: questionId } : {}),
    sourceId: row.sourceId,
    knowledgePointId: row.knowledgePointId,
    metadata: {
      ...(record.question?.metadata ?? {}),
      sourceId: row.sourceId,
      knowledgePointId: row.knowledgePointId,
      originalQuestionId,
      selectorTargetId: record.selectorTargetId ?? row.knowledgePointId,
      schoolExamCrossUnitAggregation: true,
    },
  };
  const model = {
    ...record.model,
    questionId,
    questionNumber: index + 1,
    questionNumberText: record.model?.questionNumberText == null ? null : `${index + 1}.`,
    sourceId: row.sourceId,
    knowledgePointId: row.knowledgePointId,
    metadataSnapshot: {
      ...(record.model?.metadataSnapshot ?? {}),
      sourceId: row.sourceId,
      knowledgePointId: row.knowledgePointId,
      originalQuestionId,
      selectorTargetId: record.selectorTargetId ?? row.knowledgePointId,
      schoolExamCrossUnitAggregation: true,
    },
  };
  const answer = {
    ...record.answer,
    questionId,
    questionNumber: index + 1,
    sourceId: row.sourceId,
    knowledgePointId: row.knowledgePointId,
    metadataSnapshot: {
      ...(record.answer?.metadataSnapshot ?? model.metadataSnapshot),
      sourceId: row.sourceId,
      knowledgePointId: row.knowledgePointId,
      originalQuestionId,
      selectorTargetId: record.selectorTargetId ?? row.knowledgePointId,
      schoolExamCrossUnitAggregation: true,
    },
  };
  return { question, model, answer };
}

function validatePlan(plan = {}) {
  const selectedSourceIds = unique(plan.selectedSourceIds);
  const selectedKnowledgePointIds = unique(plan.selectedKnowledgePointIds);
  const selectedSelectorTargetIds = unique(plan.selectedSelectorTargetIds);
  if (selectedSourceIds.length < 2) {
    return { ok: false, errors: [issue("SCHOOL_EXAM_CROSS_UNIT_REQUIRES_TWO_SOURCES")] };
  }

  const units = sourceMap();
  const selectedUnits = selectedSourceIds.map((sourceId) => units.get(sourceId));
  const missingSources = selectedSourceIds.filter((sourceId, index) => !selectedUnits[index]);
  if (missingSources.length) {
    return {
      ok: false,
      errors: [issue("SCHOOL_EXAM_CROSS_UNIT_SOURCE_NOT_PUBLIC", { sourceIds: missingSources })],
    };
  }

  const grade = Number(plan.grade ?? selectedUnits[0]?.grade);
  const semester = String(plan.semester ?? selectedUnits[0]?.semester ?? "");
  const mismatchedUnits = selectedUnits.filter(
    (unit) => Number(unit.grade) !== grade || String(unit.semester) !== semester,
  );
  if (mismatchedUnits.length) {
    return {
      ok: false,
      errors: [issue("SCHOOL_EXAM_CROSS_UNIT_GRADE_SEMESTER_MISMATCH", {
        grade,
        semester,
        sourceIds: mismatchedUnits.map((unit) => unit.sourceId),
      })],
    };
  }

  const rowMap = visibleRowMap();
  let rows = [];
  let effectiveSelectorTargetIds = [];

  if (selectedSelectorTargetIds.length >= 2) {
    const unitByCode = new Map(selectedUnits.map((unit) => [unit.unitCode, unit]));
    const errors = [];
    for (const selectorKey of selectedSelectorTargetIds) {
      const split = String(selectorKey).indexOf("::");
      if (split <= 0) {
        errors.push(issue("SCHOOL_EXAM_CROSS_UNIT_SELECTOR_TARGET_INVALID", { selectorTargetId: selectorKey }));
        continue;
      }
      const unitCode = selectorKey.slice(0, split);
      const targetId = selectorKey.slice(split + 2);
      const unit = unitByCode.get(unitCode);
      if (!unit) {
        errors.push(issue("SCHOOL_EXAM_CROSS_UNIT_SELECTOR_TARGET_UNIT_NOT_SELECTED", { selectorTargetId: selectorKey }));
        continue;
      }
      if (
        unit.sourceId === G3A_U01_VISUAL_RANK01_SOURCE_ID
        && targetId === G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID
      ) {
        const baseRow = rowMap.get(G3A_U01_VISUAL_RANK01_KP_ID);
        if (!baseRow || baseRow.sourceId !== unit.sourceId) {
          errors.push(issue("SCHOOL_EXAM_CROSS_UNIT_RANK01_KP_NOT_PUBLIC", { selectorTargetId: selectorKey }));
          continue;
        }
        rows.push({
          ...baseRow,
          selectorTargetId: selectorKey,
          forcedPatternGroupIds: [G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID],
          selectorDisplayName: G3A_U01_VISUAL_RANK01_PUBLIC_PATTERN_GROUP.displayName,
        });
        effectiveSelectorTargetIds.push(selectorKey);
        continue;
      }
      if (
        unit.sourceId === G3A_U01_VISUAL_RANK01_SOURCE_ID
        && targetId === G3A_U01_VISUAL_RANK03_PATTERN_GROUP_ID
      ) {
        const baseRow = rowMap.get(G3A_U01_VISUAL_RANK03_KP_ID);
        if (!baseRow || baseRow.sourceId !== unit.sourceId) {
          errors.push(issue("SCHOOL_EXAM_CROSS_UNIT_RANK03_KP_NOT_PUBLIC", { selectorTargetId: selectorKey }));
          continue;
        }
        rows.push({
          ...baseRow,
          selectorTargetId: selectorKey,
          forcedPatternGroupIds: [G3A_U01_VISUAL_RANK03_PATTERN_GROUP_ID],
          selectorDisplayName: G3A_U01_VISUAL_RANK03_PUBLIC_PATTERN_GROUP.displayName,
        });
        effectiveSelectorTargetIds.push(selectorKey);
        continue;
      }
      const row = rowMap.get(targetId);
      if (!row || row.sourceId !== unit.sourceId) {
        errors.push(issue("SCHOOL_EXAM_CROSS_UNIT_SELECTOR_TARGET_NOT_PUBLIC", { selectorTargetId: selectorKey }));
        continue;
      }
      const forcedPatternGroupIds = (
        unit.sourceId === G3A_U01_VISUAL_RANK01_SOURCE_ID
        && row.knowledgePointId === G3A_U01_VISUAL_RANK02_KP_ID
      ) ? [G3A_U01_VISUAL_RANK02_PATTERN_GROUP_ID] : undefined;
      rows.push({
        ...row,
        selectorTargetId: selectorKey,
        ...(forcedPatternGroupIds ? { forcedPatternGroupIds } : {}),
        excludedPatternGroupIds: (
          unit.sourceId === G3A_U01_VISUAL_RANK01_SOURCE_ID
          && row.knowledgePointId === G3A_U01_VISUAL_RANK01_KP_ID
        ) ? [G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID] : [],
        selectorDisplayName: row.displayName ?? targetId,
      });
      effectiveSelectorTargetIds.push(selectorKey);
    }
    if (errors.length) return { ok: false, errors };
  } else {
    if (selectedKnowledgePointIds.length < 2) {
      return { ok: false, errors: [issue("SCHOOL_EXAM_CROSS_UNIT_REQUIRES_TWO_KPS")] };
    }
    rows = selectedKnowledgePointIds.map((knowledgePointId) => rowMap.get(knowledgePointId));
    const missingKps = selectedKnowledgePointIds.filter((knowledgePointId, index) => !rows[index]);
    if (missingKps.length) {
      return {
        ok: false,
        errors: [issue("SCHOOL_EXAM_CROSS_UNIT_KP_NOT_PUBLIC", { knowledgePointIds: missingKps })],
      };
    }
    rows = rows.map((row) => ({
      ...row,
      selectorTargetId: `${selectedUnits.find((unit) => unit.sourceId === row.sourceId)?.unitCode ?? row.sourceId}::${row.knowledgePointId}`,
    }));
    effectiveSelectorTargetIds = rows.map((row) => row.selectorTargetId);
  }

  const selectedSourceSet = new Set(selectedSourceIds);
  const foreignRows = rows.filter((row) => !selectedSourceSet.has(row.sourceId));
  if (foreignRows.length) {
    return {
      ok: false,
      errors: [issue("SCHOOL_EXAM_CROSS_UNIT_KP_SOURCE_NOT_SELECTED", {
        knowledgePointIds: foreignRows.map((row) => row.knowledgePointId),
      })],
    };
  }

  const representedSourceIds = unique(rows.map((row) => row.sourceId));
  if (representedSourceIds.length < 2) {
    return {
      ok: false,
      errors: [issue("SCHOOL_EXAM_CROSS_UNIT_KP_SPAN_REQUIRES_TWO_SOURCES")],
    };
  }
  const sourcesWithoutTarget = selectedSourceIds.filter((sourceId) => !representedSourceIds.includes(sourceId));
  if (sourcesWithoutTarget.length) {
    return {
      ok: false,
      errors: [issue("SCHOOL_EXAM_CROSS_UNIT_SOURCE_WITHOUT_SELECTED_KP", {
        sourceIds: sourcesWithoutTarget,
      })],
    };
  }

  const questionCount = Number(plan.questionCount ?? 20);
  if (!Number.isInteger(questionCount) || questionCount < rows.length || questionCount > 240) {
    return {
      ok: false,
      errors: [issue("SCHOOL_EXAM_CROSS_UNIT_QUESTION_COUNT_INVALID", {
        min: rows.length,
        max: 240,
        actual: questionCount,
      })],
    };
  }

  return {
    ok: true,
    grade,
    semester,
    selectedSourceIds,
    selectedKnowledgePointIds: [...new Set(rows.map((row) => row.knowledgePointId))],
    selectedSelectorTargetIds: effectiveSelectorTargetIds,
    selectedUnits,
    rows,
    questionCount,
  };
}

export function buildSchoolExamCrossUnitWorksheet(plan = {}, buildLeafWorksheet) {
  if (typeof buildLeafWorksheet !== "function") {
    return Object.freeze({
      ok: false,
      errors: Object.freeze([issue("SCHOOL_EXAM_CROSS_UNIT_LEAF_BUILDER_REQUIRED")]),
      warnings: Object.freeze([]),
      worksheetDocument: null,
    });
  }

  const validation = validatePlan(plan);
  if (!validation.ok) {
    return Object.freeze({
      ok: false,
      errors: Object.freeze(validation.errors),
      warnings: Object.freeze([]),
      worksheetDocument: null,
    });
  }

  const allocation = allocate(validation.rows, validation.questionCount);
  const leafs = [];
  const errors = [];
  for (const entry of allocation) {
    const row = validation.rows.find(
      (candidate) => (candidate.selectorTargetId ?? candidate.knowledgePointId) === entry.selectorTargetId,
    );
    const leaf = buildLeaf(plan, row, entry.questionCount, buildLeafWorksheet);
    if (!leaf.ok) {
      errors.push(issue("SCHOOL_EXAM_CROSS_UNIT_LEAF_RUNTIME_FAILED", {
        sourceId: row.sourceId,
        knowledgePointId: row.knowledgePointId,
        attempts: leaf.attempts,
      }));
      continue;
    }
    leafs.push({ ...leaf, row });
  }

  if (errors.length || leafs.length !== validation.rows.length) {
    return Object.freeze({
      ok: false,
      errors: Object.freeze(errors),
      warnings: Object.freeze([]),
      worksheetDocument: null,
      allocation: Object.freeze(allocation),
    });
  }

  let records = materializeRecords(leafs);
  if (records.length !== validation.questionCount) {
    return Object.freeze({
      ok: false,
      errors: Object.freeze([issue("SCHOOL_EXAM_CROSS_UNIT_OUTPUT_COUNT_MISMATCH", {
        expected: validation.questionCount,
        actual: records.length,
      })]),
      warnings: Object.freeze([]),
      worksheetDocument: null,
      allocation: Object.freeze(allocation),
    });
  }

  if (plan.ordering === "shuffleAcrossPatterns") {
    records = shuffled(records, plan.generationSeed ?? "school-exam-cross-unit");
  }

  const normalized = records.map(normalizedRecord);
  const questions = normalized.map((entry) => entry.question);
  const models = normalized.map((entry) => entry.model);
  const layout = safePrintLayout(plan, leafs);
  const answers = layout.showAnswerKeyPage ? normalized.map((entry) => entry.answer) : [];
  const questionPages = paginateQuestionDisplayModels(models, layout);
  const answerKeyPages = layout.showAnswerKeyPage ? paginateAnswerKeyItems(answers, layout) : [];
  const warnings = leafs.flatMap((leaf) => leaf.result.warnings ?? []);
  const unitCodes = validation.selectedUnits.map((unit) => unit.unitCode);
  const semesterLabel = validation.semester === "upper" ? "上學期" : "下學期";

  const worksheetDocument = Object.freeze({
    schemaVersion: "worksheet-document-v1",
    version: "1",
    worksheetId: `school-exam-cross-${validation.grade}-${validation.semester}-${validation.questionCount}-${plan.generationSeed ?? "public"}`,
    worksheetKind: "batchAWorksheet",
    title: `${validation.grade} 年級${semesterLabel}｜跨單元混合知識點`,
    subtitle: unitCodes.join("＋"),
    generatedAt: "DETERMINISTIC",
    configSnapshot: Object.freeze({
      ...plan,
      selectionMode: CROSS,
      selectedSourceIds: Object.freeze(validation.selectedSourceIds),
      selectedKnowledgePointIds: Object.freeze(validation.selectedKnowledgePointIds),
      selectedSelectorTargetIds: Object.freeze(validation.selectedSelectorTargetIds),
      printLayout: layout,
    }),
    orderingMode: plan.ordering ?? "groupedByPattern",
    questionCount: validation.questionCount,
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
      sourceId: null,
      sourceIds: Object.freeze(validation.selectedSourceIds),
      productAdmissionTask: SCHOOL_EXAM_CROSS_UNIT_TASK_ID,
      authorityMode: "SCHOOL_EXAM_CROSS_UNIT_COORDINATOR",
      questionCountMax: 240,
    }),
    metadata: Object.freeze({
      taskId: SCHOOL_EXAM_CROSS_UNIT_TASK_ID,
      sourceId: null,
      sourceIds: Object.freeze(validation.selectedSourceIds),
      grade: validation.grade,
      semester: validation.semester,
      selectionMode: CROSS,
      selectedSourceIds: Object.freeze(validation.selectedSourceIds),
      selectedKnowledgePointIds: Object.freeze(validation.selectedKnowledgePointIds),
      selectedSelectorTargetIds: Object.freeze(validation.selectedSelectorTargetIds),
      sameUnitMixedUsed: false,
      crossUnitMixedUsed: true,
      sharedAggregationUsed: true,
      leafRuntimeOwnersPreserved: true,
      semanticAuthorityMutated: false,
      compositeKnowledgePointCreated: false,
      allocation: Object.freeze(allocation.map((entry) => ({ ...entry }))),
    }),
    batchA: Object.freeze({
      sourceId: null,
      sourceIds: Object.freeze(validation.selectedSourceIds),
      questionMode: "mixed",
      selectionMode: CROSS,
      selectedKnowledgePointIds: Object.freeze(validation.selectedKnowledgePointIds),
      selectedSelectorTargetIds: Object.freeze(validation.selectedSelectorTargetIds),
    }),
    report: Object.freeze({
      ok: true,
      errors: Object.freeze([]),
      warnings: Object.freeze(warnings),
      summary: Object.freeze({
        questionCount: validation.questionCount,
        questionPageCount: questionPages.length,
        answerKeyPageCount: answerKeyPages.length,
        selectedSourceCount: validation.selectedSourceIds.length,
        selectedKnowledgePointCount: validation.selectedKnowledgePointIds.length,
      }),
    }),
    summary: Object.freeze({
      questionCount: validation.questionCount,
      questionPageCount: questionPages.length,
      answerKeyPageCount: answerKeyPages.length,
      selectedSourceCount: validation.selectedSourceIds.length,
      selectedKnowledgePointCount: validation.selectedKnowledgePointIds.length,
      crossUnitMixedQuestionCount: validation.questionCount,
    }),
  });

  return Object.freeze({
    ok: true,
    errors: Object.freeze([]),
    warnings: Object.freeze(warnings),
    worksheetDocument,
    allocation: Object.freeze(allocation),
    leafDispatch: Object.freeze(leafs.map((leaf) => Object.freeze({
      sourceId: leaf.row.sourceId,
      knowledgePointId: leaf.row.knowledgePointId,
      selectorTargetId: leaf.row.selectorTargetId ?? leaf.row.knowledgePointId,
      questionCount: leaf.leafPlan.questionCount,
      questionMode: leaf.mode,
      attemptCount: leaf.attempts.length,
    }))),
    schoolExamCrossUnitAggregation: true,
  });
}
