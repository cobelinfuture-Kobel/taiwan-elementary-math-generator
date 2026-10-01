import assert from "node:assert/strict";
import test from "node:test";

globalThis.document = Object.create(null);

const { buildWorksheetDocumentFromPlan } = await import("../../site/assets/browser/pipeline/build-worksheet-document.js");
const { buildSchoolExamCrossUnitWorksheet } = await import("../../site/modules/exam/school-exam-cross-unit-coordinator.js");
const { listBatchASourceUnits } = await import("../../site/modules/curriculum/batch-a/source-units.js");
const {
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} = await import("../../site/modules/curriculum/registry/batch-a-selector-p09-mixed21-extension.js");

const TARGET_UNIT_CODES = Object.freeze([
  "5A-U01",
  "5A-U02",
  "5A-U03A",
  "5A-U03A1",
  "5A-U09",
  "5A-U10A",
]);

const PROBE_COUNTS = Object.freeze([49, 120, 240]);

const unique = (values = []) => [...new Set(values.filter(Boolean))];

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

function requestedGroupsForRow(row, mode) {
  if (mode !== "application") return [];
  return getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId)
    .filter(groupLooksApplication)
    .map((group) => group.patternGroupId);
}

function preferredModes(row) {
  return unique([
    ...(Array.isArray(row.questionModes) ? row.questionModes : []),
    row.questionMode,
    row.mode,
    "numeric",
    "diagram",
    "application",
    "reasoning",
  ].map((value) => String(value ?? "").trim()).filter((value) => value && value !== "mixed"));
}

function allocated(rows, questionCount) {
  const base = Math.floor(questionCount / rows.length);
  let remainder = questionCount % rows.length;
  return rows.map((row) => {
    const count = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
    return { row, questionCount: count };
  });
}

function leafShape(result) {
  const document = result?.worksheetDocument;
  return {
    ok: result?.ok === true,
    questionCountField: document?.questionCount ?? null,
    summaryQuestionCount: document?.summary?.questionCount ?? null,
    generatedQuestions: Array.isArray(document?.generatedQuestions) ? document.generatedQuestions.length : null,
    questions: Array.isArray(document?.questions) ? document.questions.length : null,
    questionDisplayModels: Array.isArray(document?.questionDisplayModels) ? document.questionDisplayModels.length : null,
    answerKeyItems: Array.isArray(document?.answerKeyItems) ? document.answerKeyItems.length : null,
    errors: result?.errors ?? result?.validation?.errors ?? [],
  };
}

function diagnoseLeaf(row, questionCount, rootSeed) {
  const attempts = [];
  for (const mode of preferredModes(row)) {
    const leafPlan = {
      sourceId: row.sourceId,
      selectionMode: "singleKnowledgePoint",
      selectedKnowledgePointIds: [row.knowledgePointId],
      knowledgePointIds: [row.knowledgePointId],
      selectedPatternGroupIds: requestedGroupsForRow(row, mode),
      patternSpecIds: undefined,
      questionMode: mode,
      requestedQuestionType: mode,
      questionCount,
      ordering: "groupedByPattern",
      includeAnswerKey: true,
      generationSeed: `${rootSeed}:${row.sourceId}:${row.knowledgePointId}:${mode}`,
      printLayout: {
        paperSize: "A4",
        columns: 2,
        rowsPerPage: 5,
        showAnswerKeyPage: true,
        showQuestionNumbers: true,
      },
      schoolExamCrossUnitLeafDispatch: true,
    };
    const result = buildWorksheetDocumentFromPlan(leafPlan);
    const shape = leafShape(result);
    attempts.push({ mode, ...shape });
    const coordinatorActualCount = shape.questionCountField
      ?? shape.summaryQuestionCount
      ?? shape.generatedQuestions
      ?? 0;
    if (shape.ok && result?.worksheetDocument && coordinatorActualCount === questionCount) {
      return {
        sourceId: row.sourceId,
        unitCode: row.unitCode,
        knowledgePointId: row.knowledgePointId,
        requested: questionCount,
        acceptedMode: mode,
        coordinatorActualCount,
        materializedQuestionCount: shape.generatedQuestions ?? shape.questions ?? 0,
        materializedModelCount: shape.questionDisplayModels,
        materializedAnswerCount: shape.answerKeyItems,
        attempts,
      };
    }
  }
  return {
    sourceId: row.sourceId,
    unitCode: row.unitCode,
    knowledgePointId: row.knowledgePointId,
    requested: questionCount,
    acceptedMode: null,
    attempts,
  };
}

test("G06 current 5A six-unit all-KP selection isolates cross-unit output-count mismatch", () => {
  const units = listBatchASourceUnits({ includeCurrentFullProductPublic: true });
  const targetUnits = TARGET_UNIT_CODES.map((unitCode) => units.find((unit) => unit.unitCode === unitCode));
  assert.equal(targetUnits.every(Boolean), true, JSON.stringify({
    missingUnitCodes: TARGET_UNIT_CODES.filter((unitCode, index) => !targetUnits[index]),
  }));

  const allRows = listVisibleBatchAKnowledgePoints();
  const rowsBySource = new Map(targetUnits.map((unit) => [
    unit.sourceId,
    allRows.filter((row) => row.sourceId === unit.sourceId),
  ]));
  const selectedRows = targetUnits.flatMap((unit) => rowsBySource.get(unit.sourceId) ?? []);
  const selectionSummary = targetUnits.map((unit) => ({
    unitCode: unit.unitCode,
    sourceId: unit.sourceId,
    knowledgePointCount: (rowsBySource.get(unit.sourceId) ?? []).length,
  }));
  console.log("G06_CROSS_UNIT_CURRENT_SELECTION=" + JSON.stringify({
    targetUnitCodes: TARGET_UNIT_CODES,
    selectionSummary,
    selectedKnowledgePointCount: selectedRows.length,
  }));

  assert.equal(selectedRows.length, 49, JSON.stringify(selectionSummary));

  for (const questionCount of PROBE_COUNTS) {
    const rootSeed = `g06-current-six-unit-all-kp-${questionCount}`;
    const plan = {
      grade: 5,
      semester: "upper",
      selectedSourceIds: targetUnits.map((unit) => unit.sourceId),
      selectedKnowledgePointIds: selectedRows.map((row) => row.knowledgePointId),
      selectedPatternGroupIds: [],
      questionCount,
      ordering: "shuffleAcrossPatterns",
      includeAnswerKey: true,
      generationSeed: rootSeed,
      printLayout: {
        paperSize: "A4",
        columns: 2,
        rowsPerPage: 5,
        showAnswerKeyPage: true,
        showQuestionNumbers: true,
      },
    };

    const result = buildSchoolExamCrossUnitWorksheet(plan, buildWorksheetDocumentFromPlan);
    console.log("G06_CROSS_UNIT_PROBE=" + JSON.stringify({
      questionCount,
      ok: result?.ok === true,
      errors: result?.errors ?? [],
      allocation: result?.allocation ?? [],
      outputQuestionCount: result?.worksheetDocument?.generatedQuestions?.length ?? null,
      outputModelCount: result?.worksheetDocument?.questionDisplayModels?.length ?? null,
      outputAnswerCount: result?.worksheetDocument?.answerKeyItems?.length ?? null,
    }));

    if (result?.ok !== true) {
      const allocations = allocated(selectedRows, questionCount);
      const diagnostics = allocations.map(({ row, questionCount: leafCount }) =>
        diagnoseLeaf(row, leafCount, rootSeed));
      const suspectLeaves = diagnostics.filter((entry) =>
        entry.acceptedMode == null
        || entry.materializedQuestionCount !== entry.requested
        || (entry.materializedModelCount != null && entry.materializedModelCount !== entry.requested)
        || (entry.materializedAnswerCount != null && entry.materializedAnswerCount !== entry.requested));

      console.log("G06_CROSS_UNIT_SUSPECT_LEAVES=" + JSON.stringify(suspectLeaves));
      assert.fail(JSON.stringify({
        questionCount,
        aggregateErrors: result?.errors ?? [],
        suspectLeaves,
      }));
    }

    assert.equal(result.worksheetDocument.generatedQuestions.length, questionCount);
    assert.equal(result.worksheetDocument.questionDisplayModels.length, questionCount);
    assert.equal(result.worksheetDocument.answerKeyItems.length, questionCount);
  }
});
