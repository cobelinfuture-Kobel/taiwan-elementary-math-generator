import {
  getPixelRegistrySnapshot,
  getPixelSourceSummary,
  listPixelSourceOptions
} from "./pixel-registry-bridge.js";

const sourceSelect = document.getElementById("pixel-source-select");
const sourceSummary = document.getElementById("pixel-source-summary");
const kpCount = document.getElementById("pixel-kp-count");
const previewMeta = document.getElementById("pixel-preview-meta");

const sourceOptions = listPixelSourceOptions();
const registrySnapshot = getPixelRegistrySnapshot();

function selectedSourceSummary() {
  return getPixelSourceSummary(sourceSelect?.value) ?? getPixelSourceSummary(sourceOptions[0]?.sourceId) ?? null;
}

function renderSourceOptions() {
  if (!sourceSelect) return;
  sourceSelect.replaceChildren();
  for (const unit of sourceOptions) {
    const option = document.createElement("option");
    option.value = unit.sourceId;
    option.textContent = unit.label;
    option.dataset.visibleKnowledgePointCount = String(unit.visibleKnowledgePointCount);
    sourceSelect.append(option);
  }
}

function renderSummary() {
  const summary = selectedSourceSummary();
  if (!summary) {
    if (sourceSummary) sourceSummary.textContent = "尚未讀取到 Batch A source unit。";
    if (kpCount) kpCount.textContent = "0";
    if (previewMeta) previewMeta.textContent = "尚未接入產生流程。";
    return;
  }

  if (sourceSummary) sourceSummary.textContent = summary.summaryText;
  if (kpCount) kpCount.textContent = String(summary.visibleKnowledgePoints.length);
  if (previewMeta) previewMeta.textContent = summary.previewText;
}

renderSourceOptions();
renderSummary();
sourceSelect?.addEventListener("change", renderSummary);
document.body.dataset.pixelRegistrySourceCount = String(registrySnapshot.sourceCount);
document.body.dataset.pixelRegistryVisibleKnowledgePointCount = String(registrySnapshot.visibleKnowledgePointCount);
