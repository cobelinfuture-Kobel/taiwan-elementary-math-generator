import {
  getPixelRegistrySnapshot,
  getPixelSourceSummary,
  listPixelGrades,
  listPixelSemestersForGrade,
  listPixelSourceOptionsByFilter
} from "./pixel-registry-bridge.js";

const gradeSelect = document.getElementById("pixel-grade-select");
const semesterSelect = document.getElementById("pixel-semester-select");
const sourceSelect = document.getElementById("pixel-source-select");
const sourceSummary = document.getElementById("pixel-source-summary");
const kpCount = document.getElementById("pixel-kp-count");
const unitMeta = document.getElementById("pixel-unit-meta");
const previewMeta = document.getElementById("pixel-preview-meta");

const registrySnapshot = getPixelRegistrySnapshot();

function selectedGrade() {
  const value = Number(gradeSelect?.value);
  return Number.isInteger(value) ? value : listPixelGrades()[0] ?? null;
}

function selectedSemester() {
  return semesterSelect?.value || listPixelSemestersForGrade(selectedGrade())[0] || null;
}

function currentSourceOptions() {
  return listPixelSourceOptionsByFilter({
    grade: selectedGrade(),
    semester: selectedSemester()
  });
}

function selectedSourceSummary() {
  return getPixelSourceSummary(sourceSelect?.value) ?? getPixelSourceSummary(currentSourceOptions()[0]?.sourceId) ?? null;
}

function renderGradeOptions() {
  if (!gradeSelect) return;
  const previous = Number(gradeSelect.value);
  gradeSelect.replaceChildren();
  for (const grade of listPixelGrades()) {
    const option = document.createElement("option");
    option.value = String(grade);
    option.textContent = `${grade} 年級`;
    gradeSelect.append(option);
  }
  if (listPixelGrades().includes(previous)) gradeSelect.value = String(previous);
}

function renderSemesterOptions() {
  if (!semesterSelect) return;
  const previous = semesterSelect.value;
  const semesters = listPixelSemestersForGrade(selectedGrade());
  semesterSelect.replaceChildren();
  for (const semester of semesters) {
    const option = document.createElement("option");
    option.value = semester;
    option.textContent = semester === "upper" ? "上學期" : "下學期";
    semesterSelect.append(option);
  }
  if (semesters.includes(previous)) semesterSelect.value = previous;
}

function renderSourceOptions() {
  if (!sourceSelect) return;
  const previous = sourceSelect.value;
  const sourceOptions = currentSourceOptions();
  sourceSelect.replaceChildren();
  for (const unit of sourceOptions) {
    const option = document.createElement("option");
    option.value = unit.sourceId;
    option.textContent = unit.label;
    option.dataset.visibleKnowledgePointCount = String(unit.visibleKnowledgePointCount);
    sourceSelect.append(option);
  }
  if (sourceOptions.some((entry) => entry.sourceId === previous)) sourceSelect.value = previous;
}

function renderSummary() {
  const summary = selectedSourceSummary();
  if (!summary) {
    if (sourceSummary) sourceSummary.textContent = "目前篩選條件沒有 Batch A source unit。";
    if (kpCount) kpCount.textContent = "0";
    if (unitMeta) unitMeta.textContent = "請改選年級或學期。";
    if (previewMeta) previewMeta.textContent = "尚未接入產生流程。";
    return;
  }

  if (sourceSummary) sourceSummary.textContent = summary.summaryText;
  if (kpCount) kpCount.textContent = String(summary.visibleKnowledgePoints.length);
  if (unitMeta) unitMeta.textContent = `${summary.grade} 年級｜${summary.semesterLabel}｜${summary.domain}`;
  if (previewMeta) previewMeta.textContent = summary.previewText;
  document.body.dataset.pixelSelectedSourceId = summary.sourceId;
}

function syncFilteredSelectors() {
  renderSemesterOptions();
  renderSourceOptions();
  renderSummary();
}

renderGradeOptions();
syncFilteredSelectors();
gradeSelect?.addEventListener("change", syncFilteredSelectors);
semesterSelect?.addEventListener("change", () => {
  renderSourceOptions();
  renderSummary();
});
sourceSelect?.addEventListener("change", renderSummary);
document.body.dataset.pixelRegistrySourceCount = String(registrySnapshot.sourceCount);
document.body.dataset.pixelRegistryVisibleKnowledgePointCount = String(registrySnapshot.visibleKnowledgePointCount);
