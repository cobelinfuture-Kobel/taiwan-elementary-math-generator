import {
  listBatchASourceUnits,
  listCurrentFullProductPublicSourceUnits,
  listFullProductPublicSourceUnits,
} from "../modules/curriculum/batch-a/source-units.js";
import {
  BATCH_A_SELECTOR_AVAILABILITY as CURRENT_SELECTOR_AVAILABILITY,
  listBatchAKnowledgePointAvailabilityBySource as listCurrentKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints as listCurrentVisibleBatchAKnowledgePoints
} from "../modules/curriculum/registry/batch-a-selector-p03f14-extension.js";
import {
  BATCH_A_SELECTOR_AVAILABILITY as P01E_SELECTOR_AVAILABILITY,
  listBatchAKnowledgePointAvailabilityBySource as listP01EKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints as listP01EVisibleBatchAKnowledgePoints
} from "../modules/curriculum/registry/batch-a-selector-p01e-extension.js";
import { G4B_U04_SOURCE_ID } from "../modules/curriculum/registry/g4b-u04-promotion.js";

const G4B_U04_PIXEL_SOURCE_UNIT = Object.freeze({
  sourceId: G4B_U04_SOURCE_ID, grade: 4, semester: "lower", unitCode: "4B-U04",
  title: "概數", domain: "rounding_approximation",
});
const CURRENT_SELECTOR = Object.freeze({
  availability: CURRENT_SELECTOR_AVAILABILITY,
  listAvailabilityBySource: listCurrentKnowledgePointAvailabilityBySource,
  listVisibleKnowledgePoints: listCurrentVisibleBatchAKnowledgePoints,
});
const P01E_SELECTOR = Object.freeze({
  availability: P01E_SELECTOR_AVAILABILITY,
  listAvailabilityBySource: listP01EKnowledgePointAvailabilityBySource,
  listVisibleKnowledgePoints: listP01EVisibleBatchAKnowledgePoints,
});
const currentPixelSurfaceActive = () => typeof document !== "undefined";
const selectorForPixelSurface = () => currentPixelSurfaceActive() ? CURRENT_SELECTOR : P01E_SELECTOR;
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function visibleKnowledgePointsBySource(selector) {
  const grouped = new Map();
  for (const knowledgePoint of selector.listVisibleKnowledgePoints()) {
    const list = grouped.get(knowledgePoint.sourceId) ?? [];
    list.push(knowledgePoint);
    grouped.set(knowledgePoint.sourceId, list);
  }
  return grouped;
}
function mapPixelSourceOptions(units, selector) {
  const grouped = visibleKnowledgePointsBySource(selector);
  return units.map((unit) => {
    const visibleKnowledgePoints = grouped.get(unit.sourceId) ?? [];
    const availability = selector.listAvailabilityBySource(unit.sourceId);
    return Object.freeze({
      sourceId: unit.sourceId, grade: unit.grade, semester: unit.semester,
      unitCode: unit.unitCode, title: unit.title, domain: unit.domain,
      label: `${unit.unitCode} ${unit.title}`,
      semesterLabel: unit.semester === "upper" ? "上學期" : "下學期",
      visibleKnowledgePointCount: visibleKnowledgePoints.length,
      hiddenPendingCount: availability.hiddenPendingCount ?? 0,
      notSelectableCount: availability.notSelectableCount ?? 0,
    });
  });
}
function listLegacyS74PixelSourceOptions() {
  const units = listBatchASourceUnits({ includePublicCandidates: false });
  if (!units.some((unit) => unit.sourceId === G4B_U04_SOURCE_ID)) units.splice(12, 0, { ...G4B_U04_PIXEL_SOURCE_UNIT });
  return mapPixelSourceOptions(units, P01E_SELECTOR);
}
export function listCurrentPixelSourceOptions() { return mapPixelSourceOptions(listCurrentFullProductPublicSourceUnits(), CURRENT_SELECTOR); }
export function listPixelSourceOptions() {
  return currentPixelSurfaceActive()
    ? listCurrentPixelSourceOptions()
    : mapPixelSourceOptions(listFullProductPublicSourceUnits(), P01E_SELECTOR);
}
function listPixelSurfaceSourceOptions() { return listPixelSourceOptions(); }
export function listPixelGrades() { return [...new Set(listPixelSourceOptions().map((entry) => entry.grade))].sort((a, b) => a - b); }
export function listPixelSemestersForGrade(grade) { return [...new Set(listPixelSourceOptions().filter((entry) => entry.grade === grade).map((entry) => entry.semester))]; }
export function listPixelSourceOptionsByFilter({ grade, semester } = {}) {
  return listPixelSurfaceSourceOptions().filter((entry) => (!Number.isInteger(grade) || entry.grade === grade) && (!semester || entry.semester === semester));
}
export function listCurrentPixelSourceOptionsByFilter({ grade, semester } = {}) {
  return listCurrentPixelSourceOptions().filter((entry) => (!Number.isInteger(grade) || entry.grade === grade) && (!semester || entry.semester === semester));
}
export function listS74PixelSourceOptionsByFilter({ grade, semester } = {}) {
  return listLegacyS74PixelSourceOptions().filter((entry) => (!Number.isInteger(grade) || entry.grade === grade) && (!semester || entry.semester === semester));
}
export function getPixelSourceOption(sourceId) { return listPixelSurfaceSourceOptions().find((unit) => unit.sourceId === sourceId) ?? null; }
export function getCurrentPixelSourceOption(sourceId) { return listCurrentPixelSourceOptions().find((unit) => unit.sourceId === sourceId) ?? null; }
export function getS74PixelSourceOption(sourceId) { return listLegacyS74PixelSourceOptions().find((unit) => unit.sourceId === sourceId) ?? null; }
function listKnowledgePointsForSource(sourceId, selector) {
  return selector.listVisibleKnowledgePoints().filter((entry) => entry.sourceId === sourceId).map((entry) => Object.freeze({
    knowledgePointId: entry.knowledgePointId, sourceId: entry.sourceId, unitCode: entry.unitCode,
    displayName: entry.displayName, supportClass: entry.supportClass, qaStatusLabel: entry.qaStatusLabel,
    patternGroupIds: [...(entry.patternGroupIds ?? [])], patternSpecIds: [...(entry.patternSpecIds ?? [])],
  }));
}
export function listPixelKnowledgePointsForSource(sourceId) {
  return listKnowledgePointsForSource(sourceId, selectorForPixelSurface());
}
function buildPixelSourceSummary(sourceOption, selector) {
  if (!sourceOption) return null;
  const knowledgePoints = listKnowledgePointsForSource(sourceOption.sourceId, selector);
  return Object.freeze({
    ...clone(sourceOption), visibleKnowledgePoints: knowledgePoints,
    summaryText: `${sourceOption.unitCode}｜${sourceOption.title}｜${sourceOption.grade} 年級${sourceOption.semesterLabel}`,
    previewText: `目前選擇 ${sourceOption.unitCode}，可選知識點 ${knowledgePoints.length} 個。`,
  });
}
export function getPixelSourceSummary(sourceId) { return buildPixelSourceSummary(getPixelSourceOption(sourceId), selectorForPixelSurface()); }
export function getCurrentPixelSourceSummary(sourceId) { return buildPixelSourceSummary(getCurrentPixelSourceOption(sourceId), CURRENT_SELECTOR); }
export function getS74PixelSourceSummary(sourceId) { return buildPixelSourceSummary(getS74PixelSourceOption(sourceId), P01E_SELECTOR); }
function registrySnapshot(sources, selector) {
  return Object.freeze({
    sourceCount: sources.length, visibleKnowledgePointCount: selector.availability.visibleCount,
    grades: [...new Set(sources.map((entry) => entry.grade))].sort((a, b) => a - b),
    sources,
    bySourceId: Object.freeze(Object.fromEntries(sources.map((source) => [source.sourceId, buildPixelSourceSummary(source, selector)]))),
  });
}
export function getPixelRegistrySnapshot() {
  const selector = selectorForPixelSurface();
  const sources = currentPixelSurfaceActive() ? listCurrentPixelSourceOptions() : listPixelSourceOptions();
  return registrySnapshot(sources, selector);
}
export function getCurrentPixelRegistrySnapshot() { return registrySnapshot(listCurrentPixelSourceOptions(), CURRENT_SELECTOR); }
