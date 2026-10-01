import { listBatchASourceUnits } from "../../modules/curriculum/batch-a/source-units.js";
import {
  BATCH_A_SELECTION_MODES,
  createConfigState,
  setBatchAIncludeAnswerKey,
  setBatchAGenerationSeed,
  setBatchAOrdering,
  setBatchAPrintLayout,
  setBatchAQuestionCount,
  setBatchASelectionMode,
  setBatchASourceId,
} from "./state/config-state.js";
import { buildWorksheetDocumentFromState } from "./pipeline/build-worksheet-document.js";
import { renderSchoolExamWorksheetToHtml } from "../../modules/renderer/school-exam-template-renderer.js";
import {
  SCHOOL_EXAM_COMPOSITION_MODES,
  resolveSchoolExamCompositionMode,
} from "../../modules/exam/school-exam-composition-contract.js";

const state = createConfigState();
const sourceUnits = [...listBatchASourceUnits()];
const semesterOrder = { upper: 0, lower: 1 };

const schoolNameInput = document.getElementById("exam-school-name");
const academicYearInput = document.getElementById("exam-academic-year");
const examNameSelect = document.getElementById("exam-name");
const compositionModeSelect = document.getElementById("exam-composition-mode");
const compositionHelp = document.getElementById("exam-composition-help");
const gradeSelect = document.getElementById("exam-grade");
const semesterSelect = document.getElementById("exam-semester");
const sourceSelect = document.getElementById("exam-source");
const sourceHelp = document.getElementById("exam-source-help");
const questionCountInput = document.getElementById("exam-question-count");
const orderingSelect = document.getElementById("exam-ordering");
const seedInput = document.getElementById("exam-seed");
const answerKeyInput = document.getElementById("exam-answer-key");
const generateButton = document.getElementById("exam-generate");
const printButton = document.getElementById("exam-print");
const statusPanel = document.getElementById("exam-status");
const previewMeta = document.getElementById("exam-preview-meta");
const previewFrame = document.getElementById("exam-preview");

function unitNumber(unitCode = "") {
  const match = String(unitCode).match(/U(\d+)/i);
  return match ? Number(match[1]) : 999;
}

const sortedUnits = sourceUnits.sort((a, b) =>
  a.grade - b.grade
  || (semesterOrder[a.semester] ?? 99) - (semesterOrder[b.semester] ?? 99)
  || unitNumber(a.unitCode) - unitNumber(b.unitCode)
  || String(a.unitCode).localeCompare(String(b.unitCode))
);

function semesterLabel(value) {
  return value === "upper" ? "上學期" : "下學期";
}

function selectedUnit() {
  return sortedUnits.find((row) => row.sourceId === sourceSelect?.value) ?? null;
}

function setStatus(message, tone = "") {
  statusPanel.textContent = message;
  statusPanel.dataset.tone = tone;
}

function applyCompositionMode() {
  const resolved = resolveSchoolExamCompositionMode(compositionModeSelect?.value);
  if (!resolved.enabled) {
    setStatus("此考券組成模式尚未啟用，請使用「單一單元」。", "error");
    return false;
  }

  setBatchASelectionMode(state, resolved.batchASelectionMode);
  if (compositionHelp) {
    compositionHelp.textContent = "單一單元模式：所有題目都由目前選取單元的既有 Generator / Validator 產生與驗證。";
  }
  return true;
}

function populateGrades() {
  const grades = [...new Set(sortedUnits.map((row) => row.grade))].sort((a, b) => a - b);
  gradeSelect.replaceChildren();
  for (const grade of grades) {
    const option = document.createElement("option");
    option.value = String(grade);
    option.textContent = `${grade} 年級`;
    gradeSelect.append(option);
  }
  const defaultUnit = sortedUnits.find((row) => row.sourceId === state.batchA.sourceId) ?? sortedUnits[0];
  gradeSelect.value = String(defaultUnit?.grade ?? grades[0] ?? "");
}

function populateSemesters(preferred = semesterSelect?.value) {
  const grade = Number(gradeSelect.value);
  const semesters = [...new Set(sortedUnits.filter((row) => row.grade === grade).map((row) => row.semester))]
    .sort((a, b) => (semesterOrder[a] ?? 99) - (semesterOrder[b] ?? 99));
  semesterSelect.replaceChildren();
  for (const semester of semesters) {
    const option = document.createElement("option");
    option.value = semester;
    option.textContent = semesterLabel(semester);
    semesterSelect.append(option);
  }
  semesterSelect.value = semesters.includes(preferred) ? preferred : (semesters[0] ?? "");
}

function populateSources(preferred = sourceSelect?.value) {
  const grade = Number(gradeSelect.value);
  const semester = semesterSelect.value;
  const units = sortedUnits.filter((row) => row.grade === grade && row.semester === semester);
  sourceSelect.replaceChildren();
  for (const unit of units) {
    const option = document.createElement("option");
    option.value = unit.sourceId;
    option.textContent = `${unit.unitCode}｜${unit.title}`;
    sourceSelect.append(option);
  }
  sourceSelect.value = units.some((row) => row.sourceId === preferred)
    ? preferred
    : (units[0]?.sourceId ?? "");
  updateSourceHelp();
}

function updateSourceHelp() {
  const unit = selectedUnit();
  sourceHelp.textContent = unit
    ? `${unit.grade} 年級${semesterLabel(unit.semester)}｜${unit.unitCode}｜${unit.title}`
    : "目前沒有可用單元。";
}

function examMeta() {
  const unit = selectedUnit();
  return {
    schoolName: schoolNameInput.value.trim() || "○○國民小學",
    academicYear: academicYearInput.value.trim() || "115",
    semesterLabel: semesterLabel(unit?.semester ?? semesterSelect.value),
    gradeLabel: unit ? `${unit.grade} 年級` : `${gradeSelect.value} 年級`,
    examName: examNameSelect.value,
    subjectLabel: "數學",
    unitTitle: unit?.title ?? "",
    studentFields: ["班級", "座號", "姓名"],
    showScoreBox: true,
  };
}

function generateExam() {
  if (!sourceSelect.value) {
    setStatus("目前沒有可產生的單元。", "error");
    return;
  }

  setBatchASourceId(state, sourceSelect.value);
  if (!applyCompositionMode()) {
    printButton.disabled = true;
    return;
  }
  setBatchAQuestionCount(state, Number(questionCountInput.value));
  setBatchAOrdering(state, orderingSelect.value);
  setBatchAGenerationSeed(state, seedInput.value);
  setBatchAIncludeAnswerKey(state, answerKeyInput.checked);

  // The school-exam projection is intentionally fixed at a safe 2-column,
  // 5-row source allocation. The renderer itself uses variable-height columns.
  setBatchAPrintLayout(state, { columns: 2, rowsPerPage: 5 });

  const result = buildWorksheetDocumentFromState(state);
  if (!result?.ok || !result.worksheetDocument) {
    const errors = (result?.errors ?? []).map((error) => error?.message ?? error?.code ?? String(error));
    setStatus(errors.length > 0 ? errors.join("｜") : "考券產生失敗。", "error");
    printButton.disabled = true;
    return;
  }

  const html = renderSchoolExamWorksheetToHtml(result.worksheetDocument, {
    examMeta: examMeta(),
    stylesheetHref: "../assets/styles/print-styles.css",
  });
  previewFrame.srcdoc = html;
  printButton.disabled = false;

  const questionCount = result.worksheetDocument?.summary?.questionCount
    ?? result.worksheetDocument?.orderedQuestionIds?.length
    ?? Number(questionCountInput.value);
  const pageCount = result.worksheetDocument?.questionPages?.length ?? 0;
  previewMeta.textContent = `已產生 ${questionCount} 題｜題目頁 ${pageCount} 頁｜A4 直式雙欄`;
  setStatus("單一單元考券已產生。題目仍由既有 Generator / Validator 管線負責，僅改用學校考券版面輸出。", "success");
}

gradeSelect.addEventListener("change", () => {
  populateSemesters();
  populateSources();
});

semesterSelect.addEventListener("change", () => populateSources());

compositionModeSelect?.addEventListener("change", () => {
  const resolved = resolveSchoolExamCompositionMode(compositionModeSelect.value);
  if (!resolved.enabled) {
    compositionModeSelect.value = SCHOOL_EXAM_COMPOSITION_MODES.SINGLE_UNIT;
  }
  applyCompositionMode();
});
sourceSelect.addEventListener("change", updateSourceHelp);
generateButton.addEventListener("click", generateExam);
printButton.addEventListener("click", () => {
  const previewWindow = previewFrame.contentWindow;
  if (!previewWindow) return;
  previewWindow.focus();
  previewWindow.print();
});

populateGrades();
const initialUnit = sortedUnits.find((row) => row.sourceId === state.batchA.sourceId) ?? sortedUnits[0];
populateSemesters(initialUnit?.semester);
populateSources(initialUnit?.sourceId);
compositionModeSelect.value = SCHOOL_EXAM_COMPOSITION_MODES.SINGLE_UNIT;
applyCompositionMode();
generateExam();
