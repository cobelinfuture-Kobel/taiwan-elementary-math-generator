import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  BATCH_A_SELECTION_MODES,
  createConfigState,
  getBatchAWorksheetPlan,
  setBatchAIncludeAnswerKey,
  setBatchAPrintLayout,
  setBatchAQuestionCount,
  setBatchASelectionMode,
  setBatchASourceId,
} from "../../site/assets/browser/state/config-state.js";
import { buildWorksheetDocumentFromState } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import {
  SCHOOL_EXAM_TEMPLATE_V1,
  renderSchoolExamWorksheetToHtml,
} from "../../site/modules/renderer/school-exam-template-renderer.js";
import {
  SCHOOL_EXAM_COMPOSITION_MODES,
  resolveSchoolExamCompositionMode,
} from "../../site/modules/exam/school-exam-composition-contract.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const readText = (relativePath) => readFileSync(path.join(ROOT, relativePath), "utf8");

test("school exam template route is linked from the Classic site", () => {
  const classic = readText("site/index.html");
  const route = readText("site/exam-template/index.html");

  assert.match(classic, /href="\.\/exam-template\/"/);
  assert.match(route, /學校考券模板/);
  assert.match(route, /id="exam-school-name"/);
  assert.match(route, /id="exam-composition-mode"/);
  assert.match(route, /value="SINGLE_UNIT" selected/);
  assert.match(route, /value="MIXED_KP_SAME_UNIT" disabled/);
  assert.match(route, /value="MIXED_KP_CROSS_UNIT" disabled/);
  assert.match(route, /id="exam-grade"/);
  assert.match(route, /id="exam-source"/);
  assert.match(route, /id="exam-preview"/);
  assert.match(route, /\.\.\/assets\/browser\/exam-template\.js/);
});

test("school exam template uses a derived A4 two-column school layout contract", () => {
  assert.equal(SCHOOL_EXAM_TEMPLATE_V1.pageSize, "A4 portrait");
  assert.equal(SCHOOL_EXAM_TEMPLATE_V1.bodyLayout, "two-column variable-height flow");
  assert.equal(SCHOOL_EXAM_TEMPLATE_V1.copiedSchoolBranding, false);
});

test("school exam renderer projects a real generated worksheet without replacing generator authority", () => {
  const state = createConfigState();
  setBatchAQuestionCount(state, 8);
  setBatchAIncludeAnswerKey(state, true);
  setBatchAPrintLayout(state, { columns: 2, rowsPerPage: 5 });

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);

  const html = renderSchoolExamWorksheetToHtml(result.worksheetDocument, {
    examMeta: {
      schoolName: "測試國民小學",
      academicYear: "115",
      semesterLabel: "上學期",
      gradeLabel: "三年級",
      examName: "第一次定期評量",
      subjectLabel: "數學",
      unitTitle: "四位數的加減",
    },
    stylesheetHref: "../assets/styles/print-styles.css",
  });

  assert.match(html, /data-renderer-profile="school_exam_tw_g06_common_v1"/);
  assert.match(html, /測試國民小學/);
  assert.match(html, /115 學年度 上學期 三年級/);
  assert.match(html, /第一次定期評量・數學/);
  assert.match(html, /班級：/);
  assert.match(html, /得分：/);
  assert.match(html, /school-exam-columns/);
  assert.match(html, /data-page-type="question"/);
  assert.match(html, /data-page-type="answer"/);
  assert.match(html, /@page \{ size: A4 portrait; margin: 0; \}/);
});


test("M2 exposes exactly one enabled top-level exam composition mode", () => {
  const single = resolveSchoolExamCompositionMode(SCHOOL_EXAM_COMPOSITION_MODES.SINGLE_UNIT);
  const sameUnit = resolveSchoolExamCompositionMode(SCHOOL_EXAM_COMPOSITION_MODES.MIXED_KP_SAME_UNIT);
  const crossUnit = resolveSchoolExamCompositionMode(SCHOOL_EXAM_COMPOSITION_MODES.MIXED_KP_CROSS_UNIT);

  assert.deepEqual(single, {
    examMode: "SINGLE_UNIT",
    batchASelectionMode: "sourceUnit",
    enabled: true,
    milestone: "M2",
  });
  assert.equal(sameUnit.enabled, false);
  assert.equal(sameUnit.milestone, "M3");
  assert.equal(crossUnit.enabled, false);
  assert.equal(crossUnit.milestone, "M4");
});

test("M2 single-unit mode materializes through the existing source-unit worksheet runtime", () => {
  const state = createConfigState();
  setBatchASourceId(state, "g3a_u02_3a02");
  setBatchASelectionMode(state, BATCH_A_SELECTION_MODES.SOURCE_UNIT);
  setBatchAQuestionCount(state, 8);
  setBatchAIncludeAnswerKey(state, true);
  setBatchAPrintLayout(state, { columns: 2, rowsPerPage: 5 });

  const plan = getBatchAWorksheetPlan(state);
  assert.equal(plan.sourceId, "g3a_u02_3a02");
  assert.equal(plan.selectionMode, "sourceUnit");
  assert.deepEqual(plan.selectedKnowledgePointIds, []);
  assert.deepEqual(plan.selectedPatternGroupIds, []);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true, JSON.stringify(result.errors ?? []));
  const document = result.worksheetDocument;
  assert.equal(document.batchA.sourceId, "g3a_u02_3a02");
  assert.equal(document.batchA.selectionMode, "sourceUnit");
  assert.equal(document.generatedQuestions.length, 8);
  assert.equal(document.answerKeyItems.length, 8);
  assert.equal(document.generatedQuestions.every((question) => question.sourceId === "g3a_u02_3a02"), true);
});
