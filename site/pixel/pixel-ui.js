import { listBatchASourceUnits } from "../modules/curriculum/batch-a/source-units.js";
import { listVisibleBatchAKnowledgePoints } from "../modules/curriculum/registry/batch-a-selector-extension.js";

const sourceSelect = document.getElementById("pixel-source-select");
const sourceSummary = document.getElementById("pixel-source-summary");
const kpCount = document.getElementById("pixel-kp-count");
const previewMeta = document.getElementById("pixel-preview-meta");

const sourceUnits = listBatchASourceUnits();
const visibleKnowledgePoints = listVisibleBatchAKnowledgePoints();

function visibleKnowledgePointCountForSource(sourceId) {
  return visibleKnowledgePoints.filter((entry) => entry.sourceId === sourceId).length;
}

function selectedSourceUnit() {
  return sourceUnits.find((entry) => entry.sourceId === sourceSelect?.value) ?? sourceUnits[0] ?? null;
}

function renderSourceOptions() {
  if (!sourceSelect) return;
  sourceSelect.replaceChildren();
  for (const unit of sourceUnits) {
    const option = document.createElement("option");
    option.value = unit.sourceId;
    option.textContent = `${unit.unitCode} ${unit.title}`;
    sourceSelect.append(option);
  }
}

function renderSummary() {
  const unit = selectedSourceUnit();
  if (!unit) {
    if (sourceSummary) sourceSummary.textContent = "尚未讀取到 Batch A source unit。";
    if (kpCount) kpCount.textContent = "0";
    if (previewMeta) previewMeta.textContent = "尚未接入產生流程。";
    return;
  }

  const count = visibleKnowledgePointCountForSource(unit.sourceId);
  if (sourceSummary) sourceSummary.textContent = `${unit.unitCode}｜${unit.title}｜sourceId: ${unit.sourceId}`;
  if (kpCount) kpCount.textContent = String(count);
  if (previewMeta) previewMeta.textContent = `目前讀取 ${unit.unitCode}，可選知識點 ${count} 個。S44B 僅顯示 scaffold，尚未產生 worksheet。`;
}

renderSourceOptions();
renderSummary();
sourceSelect?.addEventListener("change", renderSummary);
