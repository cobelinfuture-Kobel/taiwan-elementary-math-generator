import {
  listBatchASourceUnits,
  listCurrentFullProductPublicSourceUnits,
  listFullProductPublicSourceUnits,
} from "../modules/curriculum/batch-a/source-units.js";
import {
  BATCH_A_SELECTOR_AVAILABILITY as CURRENT_SELECTOR_AVAILABILITY,
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints
} from "../modules/curriculum/registry/batch-a-selector-p03f3-extension.js";
import {
  BATCH_A_SELECTOR_AVAILABILITY as P01E_SELECTOR_AVAILABILITY,
} from "../modules/curriculum/registry/batch-a-selector-p01e-extension.js";
import { G4B_U04_SOURCE_ID } from "../modules/curriculum/registry/g4b-u04-promotion.js";

const G4B_U04_PIXEL_SOURCE_UNIT = Object.freeze({
  sourceId: G4B_U04_SOURCE_ID,
  grade: 4,
  semester: "lower",
  unitCode: "4B-U04",
  title: "概數",
  domain: "rounding_approximation",
});

const currentPixelSurfaceActive = () => typeof document !== "undefined";

function clone(value) { return JSON.parse(JSON.stringify(value)); }
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
      notSelectableCount: availability.notSelectableCount ?? 0,
    });
  });
}
function listLegacyS74PixelSourceOptions() {
  const units = listBatchASourceUnits({ includePublicCandidates: false });
  if (!units.some((unit) => unit.sourceId === G4B_U04_SOURCE_ID)) units.splice(12, 0, { ...G4B_U04_PIXEL_SOURCE_UNIT });
  return mapPixelSourceOptions(units);
}
export function listCurrentPixelSourceOptions() { return mapPixelSourceOptions(listCurrentFullProductPublicSourceUnits()); }
export function listPixelSourceOptions() {
  return currentPixelSurfaceActive()
    ? listCurrentPixelSourceOptions()
    : mapPixelSourceOptions(listFullProductPublicSourceUnits());
}
function listPixelSurfaceSourceOptions() { return currentPixelSurfaceActive() ? listCurrentPixelSourceOptions() : listLegacyS74PixelSourceOptions(); }
export function listPixelGradeOptions() { return [...new Set(listPixelSurfaceSourceOptions().map((unit) => unit.grade))].sort((a, b) => a - b); }
export function listPixelSemesterOptions(grade) { return [...new Set(listPixelSurfaceSourceOptions().filter((unit) => unit.grade === grade).map((unit) => unit.semester))]; }
export function listPixelUnitsForGradeSemester(grade, semester) { return listPixelSurfaceSourceOptions().filter((unit) => unit.grade === grade && unit.semester === semester); }
export function listPixelKnowledgePointsForSource(sourceId) { return listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === sourceId).map(clone); }
export function getPixelRegistrySnapshot() {
  const sourceUnits = listPixelSurfaceSourceOptions();
  return clone({ sourceCount: sourceUnits.length, sourceUnits, selectorAvailability: currentPixelSurfaceActive() ? CURRENT_SELECTOR_AVAILABILITY : P01E_SELECTOR_AVAILABILITY });
}
export function getCurrentPixelRegistrySnapshot() {
  const sourceUnits = listCurrentPixelSourceOptions();
  const bySourceId = Object.fromEntries(sourceUnits.map((unit) => [unit.sourceId, { source: unit, visibleKnowledgePoints: listPixelKnowledgePointsForSource(unit.sourceId) }]));
  return clone({ sourceCount: sourceUnits.length, visibleKnowledgePointCount: listVisibleBatchAKnowledgePoints().length, sourceUnits, bySourceId, selectorAvailability: CURRENT_SELECTOR_AVAILABILITY });
}
