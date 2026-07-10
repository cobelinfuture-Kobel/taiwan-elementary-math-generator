import { BATCH_A_SELECTION_MODES } from "../assets/browser/state/config-state.js";
import {
  normalizePublicPatternGroupSelection,
  togglePublicPatternGroupSelection
} from "../assets/browser/state/public-pattern-group-selection.js";
import { listPixelKnowledgePointsForSource } from "./pixel-registry-bridge.js";

export { BATCH_A_SELECTION_MODES };

export const PIXEL_SELECTOR_WARNING_CODES = Object.freeze({
  MODE_FALLBACK: "pixel_selector_mode_fallback",
  KNOWLEDGE_POINT_DROPPED: "pixel_selector_knowledge_point_dropped",
  MIXED_MINIMUM_TWO: "pixel_selector_mixed_minimum_two"
});

const MODE_LABELS = Object.freeze({
  [BATCH_A_SELECTION_MODES.SOURCE_UNIT]: "單元出題",
  [BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT]: "單一知識點加強",
  [BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT]: "同單元知識點混合"
});

function uniqueStrings(values) {
  return [...new Set((Array.isArray(values) ? values : []).map((value) => String(value ?? "").trim()).filter(Boolean))];
}

export function listPixelKnowledgePointModeOptions(sourceId) {
  const visibleCount = listPixelKnowledgePointsForSource(sourceId).length;
  return Object.freeze([
    Object.freeze({ value: BATCH_A_SELECTION_MODES.SOURCE_UNIT, label: MODE_LABELS[BATCH_A_SELECTION_MODES.SOURCE_UNIT], disabled: false }),
    Object.freeze({ value: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT, label: MODE_LABELS[BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT], disabled: visibleCount < 1 }),
    Object.freeze({ value: BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT, label: MODE_LABELS[BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT], disabled: visibleCount < 2 })
  ]);
}

export function getPixelSelectionModeLabel(selectionMode) {
  return MODE_LABELS[selectionMode] ?? MODE_LABELS[BATCH_A_SELECTION_MODES.SOURCE_UNIT];
}

export function createPixelKnowledgePointSelectorState({
  sourceId,
  selectionMode = BATCH_A_SELECTION_MODES.SOURCE_UNIT,
  selectedKnowledgePointIds = [],
  selectedPatternGroupIds = []
} = {}) {
  const availableKnowledgePoints = listPixelKnowledgePointsForSource(sourceId);
  const visibleIds = new Set(availableKnowledgePoints.map((entry) => entry.knowledgePointId));
  const requestedIds = uniqueStrings(selectedKnowledgePointIds);
  const sanitizedIds = requestedIds.filter((knowledgePointId) => visibleIds.has(knowledgePointId));
  const warnings = [];
  const enabledModes = new Set(listPixelKnowledgePointModeOptions(sourceId).filter((entry) => !entry.disabled).map((entry) => entry.value));
  let normalizedMode = enabledModes.has(selectionMode) ? selectionMode : BATCH_A_SELECTION_MODES.SOURCE_UNIT;

  if (normalizedMode !== selectionMode) {
    warnings.push({ code: PIXEL_SELECTOR_WARNING_CODES.MODE_FALLBACK, from: selectionMode, to: normalizedMode });
  }
  if (requestedIds.length !== sanitizedIds.length) {
    warnings.push({ code: PIXEL_SELECTOR_WARNING_CODES.KNOWLEDGE_POINT_DROPPED, count: requestedIds.length - sanitizedIds.length });
  }

  let normalizedIds = [];
  if (normalizedMode === BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT) {
    normalizedIds = [sanitizedIds[0] ?? availableKnowledgePoints[0]?.knowledgePointId].filter(Boolean);
  } else if (normalizedMode === BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT) {
    normalizedIds = sanitizedIds.length >= 2 ? sanitizedIds : availableKnowledgePoints.map((entry) => entry.knowledgePointId);
    if (normalizedIds.length < 2) {
      normalizedMode = BATCH_A_SELECTION_MODES.SOURCE_UNIT;
      normalizedIds = [];
      warnings.push({ code: PIXEL_SELECTOR_WARNING_CODES.MODE_FALLBACK, from: BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT, to: BATCH_A_SELECTION_MODES.SOURCE_UNIT });
    }
  }

  const patternGroupState = normalizePublicPatternGroupSelection({
    selectionMode: normalizedMode,
    selectedKnowledgePointIds: normalizedIds,
    selectedPatternGroupIds
  });

  return Object.freeze({
    sourceId: sourceId ?? null,
    selectionMode: normalizedMode,
    availableKnowledgePoints: Object.freeze(availableKnowledgePoints),
    selectedKnowledgePointIds: Object.freeze(normalizedIds),
    selectedPatternGroupIds: patternGroupState.selectedPatternGroupIds,
    patternGroupChoices: patternGroupState.choices,
    warnings: Object.freeze([...warnings, ...patternGroupState.warnings]),
    visibleCount: availableKnowledgePoints.length
  });
}

export function togglePixelKnowledgePointSelection(state, knowledgePointId) {
  const visibleIds = new Set((state?.availableKnowledgePoints ?? []).map((entry) => entry.knowledgePointId));
  if (!visibleIds.has(knowledgePointId)) return state;

  if (state.selectionMode === BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT) {
    return createPixelKnowledgePointSelectorState({
      sourceId: state.sourceId,
      selectionMode: state.selectionMode,
      selectedKnowledgePointIds: [knowledgePointId],
      selectedPatternGroupIds: state.selectedPatternGroupIds
    });
  }

  if (state.selectionMode === BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT) {
    const selected = new Set(state.selectedKnowledgePointIds);
    if (selected.has(knowledgePointId)) {
      if (selected.size <= 2) {
        return Object.freeze({
          ...state,
          warnings: Object.freeze([{ code: PIXEL_SELECTOR_WARNING_CODES.MIXED_MINIMUM_TWO, minimum: 2 }])
        });
      }
      selected.delete(knowledgePointId);
    } else {
      selected.add(knowledgePointId);
    }
    return createPixelKnowledgePointSelectorState({
      sourceId: state.sourceId,
      selectionMode: state.selectionMode,
      selectedKnowledgePointIds: [...selected],
      selectedPatternGroupIds: state.selectedPatternGroupIds
    });
  }

  return state;
}

export function togglePixelPatternGroupSelection(state, patternGroupId) {
  const toggled = togglePublicPatternGroupSelection({
    selectionMode: state?.selectionMode,
    selectedKnowledgePointIds: state?.selectedKnowledgePointIds,
    selectedPatternGroupIds: state?.selectedPatternGroupIds,
    patternGroupId
  });
  const next = createPixelKnowledgePointSelectorState({
    sourceId: state?.sourceId,
    selectionMode: state?.selectionMode,
    selectedKnowledgePointIds: state?.selectedKnowledgePointIds,
    selectedPatternGroupIds: toggled.selectedPatternGroupIds
  });
  return Object.freeze({
    ...next,
    warnings: Object.freeze([...next.warnings, ...toggled.warnings])
  });
}
