import assert from "node:assert/strict";
import test from "node:test";

import {
  SCHOOL_EXAM_LAYOUT_V11,
  buildSchoolExamLayoutPages,
  estimateSchoolExamAnswerUnits,
  estimateSchoolExamQuestionUnits,
  renderSchoolExamWorksheetToHtml,
} from "../../site/modules/renderer/school-exam-template-renderer.js";

function question(index, overrides = {}) {
  return {
    questionId: `m5-q-${index}`,
    questionNumber: index,
    questionNumberText: `${index}.`,
    blankedDisplayText: `${index + 10} + ${index + 3} = ______`,
    answerText: String(index * 2),
    ...overrides,
  };
}

test("M5 estimation assigns more space to representations and application response prompts", () => {
  const plain = { cellType: "question", displayModel: question(1) };
  const geometry = {
    cellType: "question",
    displayModel: question(2, {
      geometryDiagram: { kind: "synthetic" },
      responsePrompt: "請列出算式並說明你的想法。",
      layoutHints: { questionMode: "application" },
    }),
  };
  assert.ok(estimateSchoolExamQuestionUnits(geometry) > estimateSchoolExamQuestionUnits(plain));

  const answerPlain = {
    cellType: "answerKey",
    answerKeyItem: { questionId: "a1", questionNumber: 1, promptText: "8+7", answerText: "15" },
  };
  const answerChart = {
    cellType: "answerKey",
    answerKeyItem: {
      questionId: "a2",
      questionNumber: 2,
      promptText: "請看圖回答",
      answerText: "15",
      chartData: { kind: "synthetic" },
    },
  };
  assert.ok(estimateSchoolExamAnswerUnits(answerChart) > estimateSchoolExamAnswerUnits(answerPlain));
});

test("M5 final partial page still balances across two columns when at least two questions remain", () => {
  const models = Array.from({ length: 23 }, (_, index) => question(index + 1));
  const answers = models.map((model) => ({
    questionId: model.questionId,
    questionNumber: model.questionNumber,
    promptText: model.blankedDisplayText,
    answerText: model.answerText,
  }));
  const layout = buildSchoolExamLayoutPages({
    questionDisplayModels: models,
    answerKeyItems: answers,
  });
  const last = layout.questionPages.at(-1);
  assert.ok(last.itemCount >= 2);
  assert.ok(last.columns[0].cells.length > 0);
  assert.ok(last.columns[1].cells.length > 0);
});

test("M5 renderer marks every page with Layout V1.1 and explicit column containers", () => {
  const models = Array.from({ length: 24 }, (_, index) => question(index + 1));
  const answers = models.map((model) => ({
    questionId: model.questionId,
    questionNumber: model.questionNumber,
    promptText: model.blankedDisplayText,
    answerText: model.answerText,
  }));
  const html = renderSchoolExamWorksheetToHtml({
    questionDisplayModels: models,
    answerKeyItems: answers,
  }, {
    examMeta: {
      schoolName: "測試國民小學",
      academicYear: "115",
      semesterLabel: "上學期",
      gradeLabel: "四年級",
      examName: "數學綜合評量",
      subjectLabel: "數學",
      unitTitle: "測試範圍",
    },
    stylesheetHref: "../assets/styles/print-styles.css",
  });

  assert.match(html, new RegExp(`data-layout-version="${SCHOOL_EXAM_LAYOUT_V11.layoutVersion}"`));
  assert.match(html, /data-column-count="2"/);
  assert.match(html, /school-exam-column--questions/);
  assert.match(html, /school-exam-column--answers/);
  assert.doesNotMatch(html, /column-count:\s*2/);
});


test("M6 rich-representation budgeting prevents two tall geometry cells from sharing one column", () => {
  const geometryModels = Array.from({ length: 20 }, (_, index) =>
    question(index + 1, {
      blankedDisplayText: `請觀察圖形並回答第 ${index + 1} 題。`,
      geometryDiagram: { kind: "synthetic_geometry_for_m6_budget" },
    })
  );
  const layout = buildSchoolExamLayoutPages({
    questionDisplayModels: geometryModels,
    answerKeyItems: geometryModels.map((model) => ({
      questionId: model.questionId,
      questionNumber: model.questionNumber,
      promptText: model.blankedDisplayText,
      answerText: model.answerText,
      geometryDiagram: model.geometryDiagram,
    })),
  });

  const cells = layout.questionPages.flatMap((page) =>
    page.columns.flatMap((column) => column.cells)
  );
  assert.equal(cells.length, 20);
  for (const page of layout.questionPages) {
    for (const column of page.columns) {
      assert.ok(
        column.cells.length <= 1,
        `rich geometry question column overpacked: ${column.cells.length} cells / ${column.usedUnits} units`,
      );
    }
  }
  const answerCells = layout.answerPages.flatMap((page) =>
    page.columns.flatMap((column) => column.cells)
  );
  assert.equal(answerCells.length, 20);
  for (const page of layout.answerPages) {
    for (const column of page.columns) {
      assert.ok(
        column.cells.length <= 2,
        `rich geometry answer column overpacked: ${column.cells.length} cells / ${column.usedUnits} units`,
      );
    }
  }
});
