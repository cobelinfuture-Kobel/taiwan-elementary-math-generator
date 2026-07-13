import { listBatchASourceUnits } from "../modules/curriculum/batch-a/source-units.js";
import {
  BATCH_A_SELECTOR_AVAILABILITY,
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints
} from "../modules/curriculum/registry/batch-a-selector-extension.js";
import { G4B_U04_SOURCE_ID } from "../modules/curriculum/registry/g4b-u04-promotion.js";

const G4B_U04_PIXEL_SOURCE_UNIT = Object.freeze({
  sourceId: G4B_U04_SOURCE_ID,
  grade: 4,
  semester: "lower",
  unitCode: "4B-U04",
  title: "概數",
  domain: "rounding_approximation",
});

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

function mapPixelSourceOptions(units) {
  const grouped = visibleKnowledgePointsBySource();
  return units.map((unit) => {
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
      semesterLabel: unit.semester === "upper" ? "上學期" : "下學期",
      visibleKnowledgePointCount: visibleKnowledgePoints.length,
      hiddenPendingCount: availability.hiddenPendingCount ?? 0,
      notSelectableCount: availability.notSelectableCount ?? 0
    });
  });
}

function listS74PixelSourceOptions() {
  const units = listBatchASourceUnits();
  if (!units.some((unit) => unit.sourceId === G4B_U04_SOURCE_ID)) units.splice(12, 0, { ...G4B_U04_PIXEL_SOURCE_UNIT });
  return mapPixelSourceOptions(units);
}

function listPixelSurfaceSourceOptions() {
  return typeof document === "undefined" ? listPixelSourceOptions() : listS74PixelSourceOptions();
}

export function listPixelSourceOptions() {
  return mapPixelSourceOptions(listBatchASourceUnits());
}

export function listPixelGrades() {
  return [...new Set(listPixelSourceOptions().map((entry) => entry.grade))].sort((a, b) => a - b);
}

export function listPixelSemestersForGrade(grade) {
  return [...new Set(listPixelSourceOptions().filter((entry) => entry.grade === grade).map((entry) => entry.semester))];
}

export function listPixelSourceOptionsByFilter({ grade, semester } = {}) {
  return listPixelSurfaceSourceOptions().filter((entry) => {
    if (Number.isInteger(grade) && entry.grade !== grade) return false;
    if (semester && entry.semester !== semester) return false;
    return true;
  });
}

export function listS74PixelSourceOptionsByFilter({ grade, semester } = {}) {
  return listS74PixelSourceOptions().filter((entry) => {
    if (Number.isInteger(grade) && entry.grade !== grade) return false;
    if (semester && entry.semester !== semester) return false;
    return true;
  });
}

export function getPixelSourceOption(sourceId) {
  return listPixelSurfaceSourceOptions().find((unit) => unit.sourceId === sourceId) ?? null;
}

export function getS74PixelSourceOption(sourceId) {
  return listS74PixelSourceOptions().find((unit) => unit.sourceId === sourceId) ?? null;
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

function buildPixelSourceSummary(sourceOption) {
  if (!sourceOption) return null;
  const knowledgePoints = listPixelKnowledgePointsForSource(sourceOption.sourceId);
  return Object.freeze({
    ...clone(sourceOption),
    visibleKnowledgePoints: knowledgePoints,
    summaryText: `${sourceOption.unitCode}｜${sourceOption.title}｜${sourceOption.grade} 年級${sourceOption.semesterLabel}`,
    previewText: `目前選擇 ${sourceOption.unitCode}，可選知識點 ${knowledgePoints.length} 個。`
  });
}

export function getPixelSourceSummary(sourceId) {
  return buildPixelSourceSummary(getPixelSourceOption(sourceId));
}

export function getS74PixelSourceSummary(sourceId) {
  return buildPixelSourceSummary(getS74PixelSourceOption(sourceId));
}

export function getPixelRegistrySnapshot() {
  const sources = listPixelSourceOptions();
  return Object.freeze({
    sourceCount: sources.length,
    visibleKnowledgePointCount: BATCH_A_SELECTOR_AVAILABILITY.visibleCount,
    grades: listPixelGrades(),
    sources,
    bySourceId: Object.freeze(Object.fromEntries(sources.map((source) => [source.sourceId, buildPixelSourceSummary(source)])))
  });
}
