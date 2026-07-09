import { listBatchASourceUnits } from "../modules/curriculum/batch-a/source-units.js";
import {
  BATCH_A_SELECTOR_AVAILABILITY,
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints
} from "../modules/curriculum/registry/batch-a-selector-extension.js";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function visibleKnowledgePointsBySource() {
  const grouped = new Map();
  for (const knowledgePoint of listVisibleBatchAKnowledgePoints()) {
    const list = grouped.get(knowledgePoint.sourceId) ?? [];
    list.push(knowledgePoint);
    grouped.set(knowledgePoint.sourceId, list);
  }
  return grouped;
}

export function listPixelSourceOptions() {
  const grouped = visibleKnowledgePointsBySource();
  return listBatchASourceUnits().map((unit) => {
    const visibleKnowledgePoints = grouped.get(unit.sourceId) ?? [];
    const availability = listBatchAKnowledgePointAvailabilityBySource(unit.sourceId);
    return Object.freeze({
      sourceId: unit.sourceId,
      grade: unit.grade,
      semester: unit.semester,
      unitCode: unit.unitCode,
      title: unit.title,
      domain: unit.domain,
      label: `${unit.unitCode} ${unit.title}`,
      visibleKnowledgePointCount: visibleKnowledgePoints.length,
      hiddenPendingCount: availability.hiddenPendingCount ?? 0,
      notSelectableCount: availability.notSelectableCount ?? 0
    });
  });
}

export function getPixelSourceOption(sourceId) {
  return listPixelSourceOptions().find((unit) => unit.sourceId === sourceId) ?? null;
}

export function listPixelKnowledgePointsForSource(sourceId) {
  return listVisibleBatchAKnowledgePoints()
    .filter((entry) => entry.sourceId === sourceId)
    .map((entry) => Object.freeze({
      knowledgePointId: entry.knowledgePointId,
      sourceId: entry.sourceId,
      unitCode: entry.unitCode,
      displayName: entry.displayName,
      supportClass: entry.supportClass,
      qaStatusLabel: entry.qaStatusLabel,
      patternGroupIds: [...(entry.patternGroupIds ?? [])],
      patternSpecIds: [...(entry.patternSpecIds ?? [])]
    }));
}

export function getPixelSourceSummary(sourceId) {
  const sourceOption = getPixelSourceOption(sourceId);
  if (!sourceOption) return null;
  const knowledgePoints = listPixelKnowledgePointsForSource(sourceId);
  return Object.freeze({
    ...clone(sourceOption),
    visibleKnowledgePoints: knowledgePoints,
    summaryText: `${sourceOption.unitCode}｜${sourceOption.title}｜sourceId: ${sourceOption.sourceId}`,
    previewText: `目前讀取 ${sourceOption.unitCode}，可選知識點 ${knowledgePoints.length} 個。S45A 已接共用 registry bridge，尚未產生 worksheet。`
  });
}

export function getPixelRegistrySnapshot() {
  const sources = listPixelSourceOptions();
  return Object.freeze({
    sourceCount: sources.length,
    visibleKnowledgePointCount: BATCH_A_SELECTOR_AVAILABILITY.visibleCount,
    sources,
    bySourceId: Object.freeze(Object.fromEntries(sources.map((source) => [source.sourceId, getPixelSourceSummary(source.sourceId)])))
  });
}
