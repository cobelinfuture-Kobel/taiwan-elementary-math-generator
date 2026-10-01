import assert from "node:assert/strict";
import test from "node:test";

globalThis.document = Object.create(null);

const {
  buildWorksheetDocumentFromPlan,
} = await import("../../site/assets/browser/pipeline/build-worksheet-document.js");
const {
  buildSchoolExamCrossUnitWorksheet,
} = await import("../../site/modules/exam/school-exam-cross-unit-coordinator.js");
const {
  listVisibleBatchAKnowledgePoints,
} = await import("../../site/modules/curriculum/registry/batch-a-selector-p09-mixed21-extension.js");
const {
  BATCH_A_RESOLVER_ERROR_CODES,
  resolveVisiblePatternGroupSelection,
} = await import("../../site/modules/curriculum/batch-a/visible-pattern-group-resolver-core.js");
const {
  renderSchoolExamWorksheetToHtml,
} = await import("../../site/modules/renderer/school-exam-template-renderer.js");

function rowsFor(sourceId) {
  return listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === sourceId);
}

function crossPlan(overrides = {}) {
  const sourceA = "g5a_u05_5a05a";
  const sourceB = "g5a_u07_5a07";
  const rowsA = rowsFor(sourceA).slice(0, 2);
  const rowsB = rowsFor(sourceB).slice(0, 2);
  assert.equal(rowsA.length, 2);
  assert.equal(rowsB.length, 2);
  return {
    grade: 5,
    semester: "upper",
    selectedSourceIds: [sourceA, sourceB],
    selectedKnowledgePointIds: [...rowsA, ...rowsB].map((row) => row.knowledgePointId),
    selectedPatternGroupIds: [],
    questionCount: 8,
    ordering: "shuffleAcrossPatterns",
    includeAnswerKey: true,
    generationSeed: "school-exam-m4-cross-unit",
    printLayout: {
      paperSize: "A4",
      columns: 2,
      rowsPerPage: 5,
      showAnswerKeyPage: true,
      showQuestionNumbers: true,
    },
    ...overrides,
  };
}

test("M4 cross-unit coordinator composes two same-grade same-semester units through existing single-KP leaf runtimes", () => {
  const plan = crossPlan();
  const result = buildSchoolExamCrossUnitWorksheet(plan, buildWorksheetDocumentFromPlan);
  assert.equal(result?.ok, true, JSON.stringify(result?.errors ?? []));
  assert.equal(result.schoolExamCrossUnitAggregation, true);

  const document = result.worksheetDocument;
  assert.equal(document.metadata.crossUnitMixedUsed, true);
  assert.equal(document.metadata.sameUnitMixedUsed, false);
  assert.equal(document.metadata.semanticAuthorityMutated, false);
  assert.equal(document.metadata.compositeKnowledgePointCreated, false);
  assert.deepEqual(document.metadata.selectedSourceIds, plan.selectedSourceIds);
  assert.deepEqual(document.metadata.selectedKnowledgePointIds, plan.selectedKnowledgePointIds);
  assert.equal(document.generatedQuestions.length, 8);
  assert.equal(document.answerKeyItems.length, 8);
  assert.equal(result.leafDispatch.length, 4);
  assert.equal(result.leafDispatch.every((leaf) => leaf.questionCount === 2), true);

  const questionIds = document.questionDisplayModels.map((model) => model.questionId);
  const answerIds = document.answerKeyItems.map((item) => item.questionId);
  assert.equal(new Set(questionIds).size, 8);
  assert.deepEqual(answerIds, questionIds);

  const actualSources = new Set(document.questionDisplayModels.map((model) => model.metadataSnapshot?.sourceId));
  assert.deepEqual([...actualSources].sort(), [...plan.selectedSourceIds].sort());
  assert.equal(
    document.questionDisplayModels.every(
      (model) => plan.selectedKnowledgePointIds.includes(model.knowledgePointId)
        && plan.selectedSourceIds.includes(model.metadataSnapshot?.sourceId),
    ),
    true,
  );

  const html = renderSchoolExamWorksheetToHtml(document, {
    examMeta: {
      schoolName: "測試國民小學",
      academicYear: "115",
      semesterLabel: "上學期",
      gradeLabel: "五年級",
      examName: "數學綜合評量",
      subjectLabel: "數學",
      unitTitle: "5A-U05＋5A-U07",
    },
    stylesheetHref: "../assets/styles/print-styles.css",
  });
  assert.match(html, /data-renderer-profile="school_exam_tw_g06_common_v1"/);
  assert.match(html, /data-page-type="question"/);
  assert.match(html, /data-page-type="answer"/);
});

test("M4 coordinator rejects cross-grade source sets before any leaf dispatch", () => {
  const sourceA = "g5a_u07_5a07";
  const sourceB = "g4a_u03_4a03";
  const rowA = rowsFor(sourceA)[0];
  const rowB = rowsFor(sourceB)[0];
  assert.ok(rowA);
  assert.ok(rowB);

  const result = buildSchoolExamCrossUnitWorksheet(crossPlan({
    grade: 5,
    semester: "upper",
    selectedSourceIds: [sourceA, sourceB],
    selectedKnowledgePointIds: [rowA.knowledgePointId, rowB.knowledgePointId],
    questionCount: 2,
  }), () => {
    throw new Error("leaf dispatch must not run for invalid cross-grade selection");
  });

  assert.equal(result.ok, false);
  assert.equal(result.errors[0].code, "SCHOOL_EXAM_CROSS_UNIT_GRADE_SEMESTER_MISMATCH");
});

test("M4 coordinator rejects a nominal two-unit selection when selected KPs span only one source", () => {
  const plan = crossPlan();
  const sourceA = plan.selectedSourceIds[0];
  const sourceB = plan.selectedSourceIds[1];
  const sourceAKps = rowsFor(sourceA).slice(0, 2).map((row) => row.knowledgePointId);
  const result = buildSchoolExamCrossUnitWorksheet({
    ...plan,
    selectedSourceIds: [sourceA, sourceB],
    selectedKnowledgePointIds: sourceAKps,
    questionCount: 4,
  }, () => {
    throw new Error("leaf dispatch must not run for invalid source span");
  });

  assert.equal(result.ok, false);
  assert.equal(result.errors[0].code, "SCHOOL_EXAM_CROSS_UNIT_KP_SPAN_REQUIRES_TWO_SOURCES");
});

test("M4 does not unlock the generic cross-unit resolver; only the school-exam coordinator owns this route", () => {
  const plan = crossPlan();
  const result = resolveVisiblePatternGroupSelection({
    sourceId: plan.selectedSourceIds[0],
    selectionMode: "mixedKnowledgePointsCrossUnit",
    selectedKnowledgePointIds: plan.selectedKnowledgePointIds,
    questionCount: plan.questionCount,
  });
  assert.equal(result.ok, false);
  assert.equal(
    result.errors[0].code,
    BATCH_A_RESOLVER_ERROR_CODES.CROSS_UNIT_NOT_SUPPORTED_YET,
  );
});
