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
  setBatchASelectorSelection,
  setBatchASourceId,
} from "./state/config-state.js";
import { buildWorksheetDocumentFromState } from "./pipeline/build-worksheet-document.js";
import {
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
} from "../../modules/curriculum/registry/batch-a-selector-extension.js";
import { resolvePublicUiCapabilityBinding } from "../../modules/curriculum/public/public-ui-capability-binding-p04f33.js";
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
const sameUnitKpSelector = document.getElementById("exam-same-unit-kp-selector");
const kpHelp = document.getElementById("exam-kp-help");
const kpPanel = document.getElementById("exam-kp-panel");
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

function visibleKnowledgePointsForSource(sourceId) {
  return listVisibleBatchAKnowledgePoints().filter((entry) => entry.sourceId === sourceId);
}

function sameUnitCapability(sourceId, requestedIds = []) {
  const rows = visibleKnowledgePointsForSource(sourceId);
  const availability = listBatchAKnowledgePointAvailabilityBySource(sourceId);
  const fallbackIds = rows.map((row) => row.knowledgePointId);
  const selectedKnowledgePointIds = requestedIds.length >= 2 ? requestedIds : fallbackIds;
  const binding = rows.length >= 2 && availability?.sameUnitMixedAllowed !== false
    ? resolvePublicUiCapabilityBinding({
        sourceId,
        selectionMode: BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
        selectedKnowledgePointIds,
      })
    : null;
  const option = binding?.availableSelectionModes?.find(
    (candidate) => candidate.value === BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
  );
  return {
    rows,
    availability,
    selectedKnowledgePointIds,
    enabled: rows.length >= 2
      && availability?.sameUnitMixedAllowed !== false
      && binding?.blocked === false
      && option?.enabled === true,
  };
}

function selectedSameUnitIds() {
  const visibleIds = new Set(visibleKnowledgePointsForSource(sourceSelect.value).map((row) => row.knowledgePointId));
  return (state.batchA.selectedKnowledgePointIds ?? []).filter((id) => visibleIds.has(id));
}

function renderSameUnitKnowledgePoints() {
  if (!kpPanel || !sameUnitKpSelector || !kpHelp) return;
  const isMixed = compositionModeSelect?.value === SCHOOL_EXAM_COMPOSITION_MODES.MIXED_KP_SAME_UNIT;
  const capability = sameUnitCapability(sourceSelect.value, selectedSameUnitIds());
  sameUnitKpSelector.hidden = !isMixed;
  kpPanel.replaceChildren();

  if (!isMixed) return;
  const selected = new Set(selectedSameUnitIds());
  for (const row of capability.rows) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "knowledge-point-option";
    button.dataset.knowledgePointId = row.knowledgePointId;
    button.dataset.selected = selected.has(row.knowledgePointId) ? "true" : "false";
    button.setAttribute("aria-pressed", selected.has(row.knowledgePointId) ? "true" : "false");

    const strong = document.createElement("strong");
    strong.textContent = `${selected.has(row.knowledgePointId) ? "已選｜" : ""}${row.displayName ?? row.knowledgePointId}`;
    const detail = document.createElement("span");
    detail.textContent = `${row.unitCode ?? selectedUnit()?.unitCode ?? ""}｜已通過出題驗證`;
    button.append(strong, detail);
    kpPanel.append(button);
  }
  kpHelp.textContent = `目前已選 ${selected.size} / ${capability.rows.length} 個知識點；至少選 2 個。題量會平均分配，餘數依知識點順序分配。`;
}

function syncCompositionModeAvailability() {
  if (!compositionModeSelect) return;
  const m3Option = [...compositionModeSelect.options].find(
    (option) => option.value === SCHOOL_EXAM_COMPOSITION_MODES.MIXED_KP_SAME_UNIT,
  );
  const capability = sameUnitCapability(sourceSelect.value, selectedSameUnitIds());
  if (m3Option) m3Option.disabled = !capability.enabled;

  if (compositionModeSelect.value === SCHOOL_EXAM_COMPOSITION_MODES.MIXED_KP_SAME_UNIT && !capability.enabled) {
    compositionModeSelect.value = SCHOOL_EXAM_COMPOSITION_MODES.SINGLE_UNIT;
  }
}

function applyCompositionMode({ defaultMixedSelection = false } = {}) {
  const resolved = resolveSchoolExamCompositionMode(compositionModeSelect?.value);
  if (!resolved.enabled) {
    setStatus("此考券組成模式尚未啟用。", "error");
    return false;
  }

  if (resolved.examMode === SCHOOL_EXAM_COMPOSITION_MODES.SINGLE_UNIT) {
    setBatchASelectorSelection(state, {
      selectionMode: BATCH_A_SELECTION_MODES.SOURCE_UNIT,
      selectedKnowledgePointIds: [],
      selectedPatternGroupIds: [],
    });
    questionCountInput.min = "1";
    if (compositionHelp) {
      compositionHelp.textContent = "單一單元模式：所有題目都由目前選取單元的既有 Generator / Validator 產生與驗證。";
    }
    renderSameUnitKnowledgePoints();
    return true;
  }

  if (resolved.examMode === SCHOOL_EXAM_COMPOSITION_MODES.MIXED_KP_SAME_UNIT) {
    const currentIds = selectedSameUnitIds();
    const capability = sameUnitCapability(
      sourceSelect.value,
      defaultMixedSelection || currentIds.length < 2 ? [] : currentIds,
    );
    if (!capability.enabled) {
      compositionModeSelect.value = SCHOOL_EXAM_COMPOSITION_MODES.SINGLE_UNIT;
      setBatchASelectionMode(state, BATCH_A_SELECTION_MODES.SOURCE_UNIT);
      setStatus("目前單元尚未開放同單元混合知識點，已切回「單一單元」。", "error");
      renderSameUnitKnowledgePoints();
      return false;
    }
    const selectedIds = currentIds.length >= 2 && !defaultMixedSelection
      ? currentIds
      : capability.selectedKnowledgePointIds;
    setBatchASelectorSelection(state, {
      selectionMode: BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
      selectedKnowledgePointIds: selectedIds,
      selectedPatternGroupIds: [],
    });
    questionCountInput.min = String(selectedIds.length);
    if (Number(questionCountInput.value) < selectedIds.length) {
      questionCountInput.value = String(selectedIds.length);
    }
    if (compositionHelp) {
      compositionHelp.textContent = "同單元混合模式：只混合目前單元內已開放的知識點；各知識點仍由自己的既有 leaf runtime 產生與驗證。";
    }
    renderSameUnitKnowledgePoints();
    return true;
  }

  return false;
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
  syncCompositionModeAvailability();
  applyCompositionMode();
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
  syncCompositionModeAvailability();
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
  const mixedUsed = result.worksheetDocument?.metadata?.sameUnitMixedUsed === true
    || result.worksheetDocument?.batchA?.selectionMode === BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT;
  const allocation = result.allocation ?? result.worksheetDocument?.metadata?.allocation ?? [];
  const allocationText = Array.isArray(allocation) && allocation.length > 0
    ? `｜配置：${allocation.map((entry) => `${entry.knowledgePointId}=${entry.questionCount}`).join("、")}`
    : "";
  setStatus(
    mixedUsed
      ? `同單元混合知識點考券已產生${allocationText}。`
      : "單一單元考券已產生。題目仍由既有 Generator / Validator 管線負責，僅改用學校考券版面輸出。",
    "success",
  );
}

gradeSelect.addEventListener("change", () => {
  populateSemesters();
  populateSources();
});

semesterSelect.addEventListener("change", () => populateSources());

compositionModeSelect?.addEventListener("change", () => {
  syncCompositionModeAvailability();
  const resolved = resolveSchoolExamCompositionMode(compositionModeSelect.value);
  if (!resolved.enabled) {
    compositionModeSelect.value = SCHOOL_EXAM_COMPOSITION_MODES.SINGLE_UNIT;
  }
  applyCompositionMode({ defaultMixedSelection: compositionModeSelect.value === SCHOOL_EXAM_COMPOSITION_MODES.MIXED_KP_SAME_UNIT });
  printButton.disabled = true;
});

kpPanel?.addEventListener("click", (event) => {
  const button = event.target.closest?.("[data-knowledge-point-id]");
  if (!button || compositionModeSelect?.value !== SCHOOL_EXAM_COMPOSITION_MODES.MIXED_KP_SAME_UNIT) return;
  const visibleIds = new Set(visibleKnowledgePointsForSource(sourceSelect.value).map((row) => row.knowledgePointId));
  const knowledgePointId = button.dataset.knowledgePointId;
  if (!visibleIds.has(knowledgePointId)) return;

  const selected = new Set(selectedSameUnitIds());
  if (selected.has(knowledgePointId)) {
    if (selected.size <= 2) {
      setStatus("同單元混合至少需要 2 個知識點。", "error");
      return;
    }
    selected.delete(knowledgePointId);
  } else {
    selected.add(knowledgePointId);
  }

  setBatchASelectorSelection(state, {
    selectionMode: BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: [...selected],
    selectedPatternGroupIds: [],
  });
  questionCountInput.min = String(selected.size);
  if (Number(questionCountInput.value) < selected.size) {
    questionCountInput.value = String(selected.size);
  }
  renderSameUnitKnowledgePoints();
  printButton.disabled = true;
  setStatus("知識點選擇已更新，請重新產生考券。");
});

sourceSelect.addEventListener("change", () => {
  updateSourceHelp();
  syncCompositionModeAvailability();
  applyCompositionMode({ defaultMixedSelection: true });
  printButton.disabled = true;
});
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
syncCompositionModeAvailability();
applyCompositionMode();
generateExam();
