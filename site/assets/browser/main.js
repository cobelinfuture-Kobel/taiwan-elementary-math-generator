import { listBatchASourceUnits } from "../../modules/curriculum/batch-a/source-units.js";
import {
  BATCH_A_SELECTION_MODES,
  createConfigState,
  setBatchAContextMode,
  setBatchADepthMode,
  setBatchAIncludeAnswerKey,
  setBatchAGenerationSeed,
  setBatchAOrdering,
  setBatchAPrintLayout,
  setBatchAQuestionCount,
  setBatchAQuestionMode,
  setBatchASelectorSelection,
  setBatchASourceId,
  getBatchAWorksheetPlan
} from "./state/config-state.js";
import {
  BATCH_A_SELECTOR_AVAILABILITY,
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints
} from "../../modules/curriculum/registry/batch-a-selector-extension.js";
import { G5A_U08_SOURCE_ID } from "../../modules/curriculum/registry/g5a-u08-promotion.js";
import {
  G3A_U01_VISUAL_RANK01_KP_ID,
  G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID,
  G3A_U01_VISUAL_RANK01_PUBLIC_PATTERN_GROUP,
  G3A_U01_VISUAL_RANK01_SOURCE_ID
} from "../../modules/curriculum/registry/g3a-u01-visual-rank01-selector-projection.js";
import {
  G3A_U01_VISUAL_RANK02_KP_ID,
  G3A_U01_VISUAL_RANK02_PATTERN_GROUP_ID
} from "../../modules/curriculum/registry/g3a-u01-visual-rank02-selector-projection.js";
import {
  G3A_U01_VISUAL_RANK03_KP_ID,
  G3A_U01_VISUAL_RANK03_PATTERN_GROUP_ID,
  G3A_U01_VISUAL_RANK03_PUBLIC_PATTERN_GROUP,
  G3A_U01_VISUAL_RANK03_SOURCE_ID
} from "../../modules/curriculum/registry/g3a-u01-visual-rank03-selector-projection.js";
import { maxSafeG3AU01VisualRank01Rows } from "../../modules/curriculum/batch-a/g3a-u01-visual-rank01-layout.js";
import { approvedRowsForGlobalPublicColumns } from "../../modules/curriculum/batch-a/global-public-layout-contract.js";
import {
  normalizePublicPatternGroupSelection,
  togglePublicPatternGroupSelection
} from "./state/public-pattern-group-selection.js";
import {
  publicIssueMessage,
  publicSelectorWarningMessage
} from "./state/public-ui-messages.js";
import { parseQueryState, writeQueryStateFromState } from "./state/query-state.js";
import {
  buildWorksheetDocumentFromPlan,
  buildWorksheetDocumentFromState
} from "./pipeline/build-worksheet-document.js";
import { printPreviewFrame, renderPreviewFrame } from "./pipeline/render-preview-frame.js";

const queryState = parseQueryState();
const state = createConfigState({ queryState });
const sourceUnits = listBatchASourceUnits();
const semesterOrder = {
  upper: 0,
  lower: 1
};

function unitNumber(unitCode = "") {
  const match = unitCode.match(/U(\d+)/i);
  return match ? Number(match[1]) : 999;
}

const sortedSourceUnits = [...sourceUnits].sort((a, b) =>
  a.grade - b.grade
  || (semesterOrder[a.semester] ?? 99) - (semesterOrder[b.semester] ?? 99)
  || unitNumber(a.unitCode) - unitNumber(b.unitCode)
  || a.unitCode.localeCompare(b.unitCode)
);

const gradeSelect = document.getElementById("batch-a-grade-select");
const semesterSelect = document.getElementById("batch-a-semester-select");
const sourceSelect = document.getElementById("batch-a-source-select");
const sourceHelp = document.getElementById("batch-a-source-help");
const selectionModeSelect = document.getElementById("batch-a-selection-mode-select");
const knowledgePointEmptyState = document.getElementById("batch-a-knowledge-point-empty-state");
const knowledgePointAvailabilitySummary = document.getElementById("batch-a-knowledge-point-availability-summary");
const knowledgePointPanel = document.getElementById("batch-a-knowledge-point-panel");
const patternGroupSection = document.getElementById("batch-a-pattern-group-selector");
const patternGroupHelp = document.getElementById("batch-a-pattern-group-help");
const patternGroupPanel = document.getElementById("batch-a-pattern-group-panel");
const knowledgePointWarningList = document.getElementById("batch-a-knowledge-point-warning-list");
const g5aU08ControlSection = document.getElementById("g5a-u08-public-controls");
const g5aU08QuestionMode = document.getElementById("g5a-u08-question-mode");
const g5aU08DepthMode = document.getElementById("g5a-u08-depth-mode");
const g5aU08ContextMode = document.getElementById("g5a-u08-context-mode");
const questionCountInput = document.getElementById("batch-a-question-count-input");
const orderingSelect = document.getElementById("batch-a-ordering-select");
const answerKeyInput = document.getElementById("batch-a-answer-key-input");
const generationSeedInput = document.getElementById("generation-seed-input");
const columnsInput = document.getElementById("columns-input");
const rowsPerPageInput = document.getElementById("rows-per-page-input");
const globalLayoutHelp = document.getElementById("global-layout-help");
const regenerateButton = document.getElementById("regenerate-button");
const printButton = document.getElementById("print-button");
const statusPanel = document.getElementById("status-panel");
const validationPanel = document.getElementById("validation-panel");
const previewMeta = document.getElementById("preview-meta");
const previewFrame = document.getElementById("preview-frame");

let patternGroupUiWarnings = [];
let hasGeneratedWorksheet = false;
let mixedSelectorTargetSourceId = null;
let mixedSelectorTargetIds = new Set();

function setPanel(panel, message, tone = "") {
  if (!panel) return;
  panel.textContent = message;
  panel.dataset.tone = tone;
}

function visibleKnowledgePointsForSource(sourceId) {
  return listVisibleBatchAKnowledgePoints().filter((entry) => entry.sourceId === sourceId);
}

function selectedVisibleKnowledgePointIds(sourceId) {
  const visibleIds = new Set(visibleKnowledgePointsForSource(sourceId).map((entry) => entry.knowledgePointId));
  return (state.batchA.selectedKnowledgePointIds ?? []).filter((knowledgePointId) => visibleIds.has(knowledgePointId));
}

function chooseSingleKnowledgePointId(sourceId) {
  const visibleKnowledgePoints = visibleKnowledgePointsForSource(sourceId);
  return selectedVisibleKnowledgePointIds(sourceId)[0] ?? visibleKnowledgePoints[0]?.knowledgePointId ?? null;
}

function chooseSameUnitKnowledgePointIds(sourceId) {
  const currentIds = selectedVisibleKnowledgePointIds(sourceId);
  if (currentIds.length >= 2) return currentIds;
  return visibleKnowledgePointsForSource(sourceId).map((entry) => entry.knowledgePointId);
}

function mixedSelectorTargetsForSource(sourceId) {
  const targets = [];
  for (const row of visibleKnowledgePointsForSource(sourceId)) {
    targets.push(row.knowledgePointId);
    if (
      sourceId === G3A_U01_VISUAL_RANK01_SOURCE_ID
      && row.knowledgePointId === G3A_U01_VISUAL_RANK01_KP_ID
    ) {
      targets.push(G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID);
    }
    if (
      sourceId === G3A_U01_VISUAL_RANK03_SOURCE_ID
      && row.knowledgePointId === G3A_U01_VISUAL_RANK03_KP_ID
    ) {
      targets.push(G3A_U01_VISUAL_RANK03_PATTERN_GROUP_ID);
    }
  }
  return targets;
}

function ensureMixedSelectorTargets({ reset = false } = {}) {
  if (state.batchA.selectionMode !== BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT) return;
  const sourceId = state.batchA.sourceId;
  const available = new Set(mixedSelectorTargetsForSource(sourceId));
  if (reset || mixedSelectorTargetSourceId !== sourceId || mixedSelectorTargetIds.size === 0) {
    mixedSelectorTargetIds = new Set(mixedSelectorTargetsForSource(sourceId));
    mixedSelectorTargetSourceId = sourceId;
  } else {
    mixedSelectorTargetIds = new Set([...mixedSelectorTargetIds].filter((id) => available.has(id)));
  }
}

function syncMixedSelectorTargetsToState() {
  ensureMixedSelectorTargets();
  const selectedKnowledgePointIds = [...new Set(
    [...mixedSelectorTargetIds].map((targetId) => {
      if (targetId === G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID) return G3A_U01_VISUAL_RANK01_KP_ID;
      if (targetId === G3A_U01_VISUAL_RANK03_PATTERN_GROUP_ID) return G3A_U01_VISUAL_RANK03_KP_ID;
      return targetId;
    })
  )];
  const boundedRankGroupIds = new Set([
    G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID,
    G3A_U01_VISUAL_RANK02_PATTERN_GROUP_ID,
    G3A_U01_VISUAL_RANK03_PATTERN_GROUP_ID
  ]);
  const selectedPatternGroupIds = [
    ...(state.batchA.selectedPatternGroupIds ?? []).filter((id) => !boundedRankGroupIds.has(id)),
    ...(mixedSelectorTargetIds.has(G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID)
      ? [G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID]
      : []),
    ...(mixedSelectorTargetIds.has(G3A_U01_VISUAL_RANK02_KP_ID)
      ? [G3A_U01_VISUAL_RANK02_PATTERN_GROUP_ID]
      : []),
    ...(mixedSelectorTargetIds.has(G3A_U01_VISUAL_RANK03_PATTERN_GROUP_ID)
      ? [G3A_U01_VISUAL_RANK03_PATTERN_GROUP_ID]
      : [])
  ];
  applySelectorSelection(
    BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds,
    selectedPatternGroupIds
  );
}

function applySelectorSelection(selectionMode, selectedKnowledgePointIds, requestedPatternGroupIds = []) {
  const normalized = normalizePublicPatternGroupSelection({
    selectionMode,
    selectedKnowledgePointIds,
    selectedPatternGroupIds: requestedPatternGroupIds
  });
  setBatchASelectorSelection(state, {
    selectionMode,
    selectedKnowledgePointIds,
    selectedPatternGroupIds: normalized.selectedPatternGroupIds
  });
  patternGroupUiWarnings = [...normalized.warnings];
  return normalized;
}

function normalizeCurrentPatternGroups() {
  return applySelectorSelection(
    state.batchA.selectionMode,
    selectedVisibleKnowledgePointIds(state.batchA.sourceId),
    state.batchA.selectedPatternGroupIds ?? []
  );
}

function patternGroupsExcludingKnowledgePoint(knowledgePointId, selectedKnowledgePointIds, selectedPatternGroupIds) {
  const normalized = normalizePublicPatternGroupSelection({
    selectionMode: state.batchA.selectionMode,
    selectedKnowledgePointIds,
    selectedPatternGroupIds
  });
  const owned = new Set(
    normalized.choices
      .filter((choice) => choice.knowledgePointId === knowledgePointId)
      .map((choice) => choice.patternGroupId)
  );
  return (selectedPatternGroupIds ?? []).filter((patternGroupId) => !owned.has(patternGroupId));
}

function updateSourceHelp() {
  const unit = sourceUnits.find((entry) => entry.sourceId === state.batchA.sourceId);
  if (!sourceHelp || !unit) return;
  sourceHelp.textContent = `${unit.unitCode}｜${unit.title}｜${unit.grade} 年級${unit.semester === "upper" ? "上學期" : "下學期"}`;
}

function semesterLabel(semester) {
  return semester === "upper" ? "上學期" : "下學期";
}

function populateGradeSelect(selectedGrade) {
  if (!gradeSelect) return;

  const grades = [...new Set(sortedSourceUnits.map((unit) => unit.grade))].sort((a, b) => a - b);
  gradeSelect.replaceChildren();

  for (const grade of grades) {
    const option = document.createElement("option");
    option.value = String(grade);
    option.textContent = `${grade} 年級`;
    gradeSelect.append(option);
  }

  gradeSelect.value = String(selectedGrade ?? grades[0]);
}

function populateSemesterSelect(grade, selectedSemester) {
  if (!semesterSelect) return;

  const semesters = [...new Set(
    sortedSourceUnits
      .filter((unit) => unit.grade === Number(grade))
      .map((unit) => unit.semester)
  )].sort((a, b) => (semesterOrder[a] ?? 99) - (semesterOrder[b] ?? 99));

  semesterSelect.replaceChildren();

  for (const semester of semesters) {
    const option = document.createElement("option");
    option.value = semester;
    option.textContent = semesterLabel(semester);
    semesterSelect.append(option);
  }

  semesterSelect.value = semesters.includes(selectedSemester)
    ? selectedSemester
    : semesters[0];
}

function populateSourceSelect(
  grade = gradeSelect?.value,
  semester = semesterSelect?.value,
  selectedSourceId = state.batchA.sourceId
) {
  if (!sourceSelect) return;

  const units = sortedSourceUnits.filter(
    (unit) => unit.grade === Number(grade) && unit.semester === semester
  );

  sourceSelect.replaceChildren();

  for (const unit of units) {
    const option = document.createElement("option");
    option.value = unit.sourceId;
    option.textContent = `${unit.unitCode} ${unit.title}`;
    sourceSelect.append(option);
  }

  if (units.some((unit) => unit.sourceId === selectedSourceId)) {
    sourceSelect.value = selectedSourceId;
  } else if (units[0]) {
    sourceSelect.value = units[0].sourceId;
  }
}

function initializeSourceSelectors() {
  const currentUnit = sortedSourceUnits.find((unit) => unit.sourceId === state.batchA.sourceId)
    ?? sortedSourceUnits[0];
  if (!currentUnit) return;

  populateGradeSelect(currentUnit.grade);
  populateSemesterSelect(currentUnit.grade, currentUnit.semester);
  populateSourceSelect(currentUnit.grade, currentUnit.semester, currentUnit.sourceId);
}

function syncSelectionModeOptions() {
  if (!selectionModeSelect) return;
  const sourceAvailability = listBatchAKnowledgePointAvailabilityBySource(state.batchA.sourceId);
  const hasVisibleKnowledgePoint = sourceAvailability.visibleCount > 0;
  const hasSameUnitKnowledgePointMix = sourceAvailability.visibleCount >= 2 && sourceAvailability.sameUnitMixedAllowed !== false;
  for (const option of selectionModeSelect.options) {
    if (option.value === BATCH_A_SELECTION_MODES.SOURCE_UNIT) {
      option.disabled = false;
    } else if (option.value === BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT) {
      option.disabled = !hasVisibleKnowledgePoint;
    } else if (option.value === BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT) {
      option.disabled = !hasSameUnitKnowledgePointMix;
    } else {
      option.disabled = true;
    }
  }
  const allowedModes = new Set([BATCH_A_SELECTION_MODES.SOURCE_UNIT]);
  if (hasVisibleKnowledgePoint) allowedModes.add(BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT);
  if (hasSameUnitKnowledgePointMix) allowedModes.add(BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT);
  selectionModeSelect.value = allowedModes.has(state.batchA.selectionMode)
    ? state.batchA.selectionMode
    : BATCH_A_SELECTION_MODES.SOURCE_UNIT;
}

function renderKnowledgePointAvailability() {
  const sourceAvailability = listBatchAKnowledgePointAvailabilityBySource(state.batchA.sourceId);
  const globalAvailability = BATCH_A_SELECTOR_AVAILABILITY;
  const visibleKnowledgePoints = visibleKnowledgePointsForSource(state.batchA.sourceId);
  const selectedIds = new Set(state.batchA.selectedKnowledgePointIds ?? []);
  const isSourceUnitMode = state.batchA.selectionMode === BATCH_A_SELECTION_MODES.SOURCE_UNIT;
  const isSameUnitMixed = state.batchA.selectionMode === BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT;
  if (isSameUnitMixed) ensureMixedSelectorTargets();
  const rank01Selected = state.batchA.sourceId === G3A_U01_VISUAL_RANK01_SOURCE_ID
    && (isSameUnitMixed
      ? mixedSelectorTargetIds.has(G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID)
      : (
        selectedIds.has(G3A_U01_VISUAL_RANK01_KP_ID)
        && (state.batchA.selectedPatternGroupIds ?? []).includes(G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID)
      ));
  const rank03Selected = state.batchA.sourceId === G3A_U01_VISUAL_RANK03_SOURCE_ID
    && (isSameUnitMixed
      ? mixedSelectorTargetIds.has(G3A_U01_VISUAL_RANK03_PATTERN_GROUP_ID)
      : (
        selectedIds.has(G3A_U01_VISUAL_RANK03_KP_ID)
        && (state.batchA.selectedPatternGroupIds ?? []).includes(G3A_U01_VISUAL_RANK03_PATTERN_GROUP_ID)
      ));

  if (knowledgePointAvailabilitySummary) {
    knowledgePointAvailabilitySummary.textContent = [
      `本單元可選知識點：${sourceAvailability.visibleCount}`,
      `已建立但尚未開放：${sourceAvailability.hiddenPendingCount}`,
      `目前不可選：${sourceAvailability.notSelectableCount}`,
      `全部可選：${globalAvailability.visibleCount}`
    ].join("｜");
  }

  if (knowledgePointPanel) {
    knowledgePointPanel.replaceChildren();
    knowledgePointPanel.dataset.visibleCount = String(visibleKnowledgePoints.length);
    knowledgePointPanel.dataset.selectionMode = state.batchA.selectionMode;
    for (const knowledgePoint of visibleKnowledgePoints) {
      const selected = isSameUnitMixed
        ? mixedSelectorTargetIds.has(knowledgePoint.knowledgePointId)
        : (
          selectedIds.has(knowledgePoint.knowledgePointId)
          && !(knowledgePoint.knowledgePointId === G3A_U01_VISUAL_RANK01_KP_ID && rank01Selected)
          && !(knowledgePoint.knowledgePointId === G3A_U01_VISUAL_RANK03_KP_ID && rank03Selected)
        );
      const item = document.createElement("button");
      item.type = "button";
      item.className = "knowledge-point-option";
      item.dataset.knowledgePointId = knowledgePoint.knowledgePointId;
      item.dataset.selected = selected ? "true" : "false";
      item.disabled = isSourceUnitMode;
      item.setAttribute("aria-pressed", selected ? "true" : "false");
      item.innerHTML = `<strong>${selected ? "已選｜" : ""}${knowledgePoint.displayName}</strong><span>${knowledgePoint.unitCode}｜已通過出題驗證</span>`;
      knowledgePointPanel.append(item);

      if (
        state.batchA.sourceId === G3A_U01_VISUAL_RANK01_SOURCE_ID
        && knowledgePoint.knowledgePointId === G3A_U01_VISUAL_RANK01_KP_ID
      ) {
        const rankItem = document.createElement("button");
        rankItem.type = "button";
        rankItem.className = "knowledge-point-option";
        rankItem.dataset.rank01SelectorTarget = "true";
        rankItem.dataset.selected = rank01Selected ? "true" : "false";
        rankItem.disabled = isSourceUnitMode;
        rankItem.setAttribute("aria-pressed", rank01Selected ? "true" : "false");
        rankItem.innerHTML = `<strong>${rank01Selected ? "已選｜" : ""}${G3A_U01_VISUAL_RANK01_PUBLIC_PATTERN_GROUP.displayName}</strong><span>${knowledgePoint.unitCode}｜已通過出題驗證</span>`;
        knowledgePointPanel.append(rankItem);
      }

      if (
        state.batchA.sourceId === G3A_U01_VISUAL_RANK03_SOURCE_ID
        && knowledgePoint.knowledgePointId === G3A_U01_VISUAL_RANK03_KP_ID
      ) {
        const rankItem = document.createElement("button");
        rankItem.type = "button";
        rankItem.className = "knowledge-point-option";
        rankItem.dataset.rank03SelectorTarget = "true";
        rankItem.dataset.selected = rank03Selected ? "true" : "false";
        rankItem.disabled = isSourceUnitMode;
        rankItem.setAttribute("aria-pressed", rank03Selected ? "true" : "false");
        rankItem.innerHTML = `<strong>${rank03Selected ? "已選｜" : ""}${G3A_U01_VISUAL_RANK03_PUBLIC_PATTERN_GROUP.displayName}</strong><span>${knowledgePoint.unitCode}｜已通過出題驗證</span>`;
        knowledgePointPanel.append(rankItem);
      }
    }
  }

  if (knowledgePointEmptyState) {
    knowledgePointEmptyState.dataset.visible = visibleKnowledgePoints.length === 0 ? "true" : "false";
    if (visibleKnowledgePoints.length === 0) {
      knowledgePointEmptyState.textContent = "目前此單元尚無已通過驗證的可選知識點，請先使用單元出題。";
    } else if (isSourceUnitMode) {
      knowledgePointEmptyState.textContent = `此單元有 ${visibleKnowledgePoints.length} 個可選知識點；切換出題模式後可進行加強或混合。`;
    } else {
      knowledgePointEmptyState.textContent = isSameUnitMixed
        ? `目前已選 ${mixedSelectorTargetIds.size} 個知識點／Rank 題型。`
        : `目前已選 ${selectedIds.size} 個知識點。`;
    }
  }
}

function renderPatternGroupChoices() {
  if (!patternGroupSection || !patternGroupPanel || !patternGroupHelp) return;
  const rank01Selected = state.batchA.sourceId === G3A_U01_VISUAL_RANK01_SOURCE_ID
    && state.batchA.selectionMode === BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT
    && (state.batchA.selectedKnowledgePointIds ?? []).length === 1
    && state.batchA.selectedKnowledgePointIds[0] === G3A_U01_VISUAL_RANK01_KP_ID
    && (state.batchA.selectedPatternGroupIds ?? []).length === 1
    && state.batchA.selectedPatternGroupIds[0] === G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID;
  const rank03Selected = state.batchA.sourceId === G3A_U01_VISUAL_RANK03_SOURCE_ID
    && state.batchA.selectionMode === BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT
    && (state.batchA.selectedKnowledgePointIds ?? []).length === 1
    && state.batchA.selectedKnowledgePointIds[0] === G3A_U01_VISUAL_RANK03_KP_ID
    && (state.batchA.selectedPatternGroupIds ?? []).length === 1
    && state.batchA.selectedPatternGroupIds[0] === G3A_U01_VISUAL_RANK03_PATTERN_GROUP_ID;
  if (rank01Selected || rank03Selected) {
    patternGroupPanel.replaceChildren();
    patternGroupSection.dataset.visible = "false";
    patternGroupHelp.textContent = "此 Rank 題型已直接選定，不需要第二層題目形式。";
    return;
  }
  const normalized = normalizePublicPatternGroupSelection({
    selectionMode: state.batchA.selectionMode,
    selectedKnowledgePointIds: state.batchA.selectedKnowledgePointIds,
    selectedPatternGroupIds: state.batchA.selectedPatternGroupIds
  });
  const choiceGroups = new Map();
  for (const choice of normalized.choices) {
    if (
      choice.patternGroupId === G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID
      || choice.patternGroupId === G3A_U01_VISUAL_RANK03_PATTERN_GROUP_ID
    ) continue;
    if (!choice.hasRepresentationChoice) continue;
    const list = choiceGroups.get(choice.knowledgePointId) ?? [];
    list.push(choice);
    choiceGroups.set(choice.knowledgePointId, list);
  }
  for (const [knowledgePointId, choices] of [...choiceGroups.entries()]) {
    if (choices.length < 2) choiceGroups.delete(knowledgePointId);
  }

  patternGroupPanel.replaceChildren();
  const visible = state.batchA.selectionMode !== BATCH_A_SELECTION_MODES.SOURCE_UNIT
    && choiceGroups.size > 0;
  patternGroupSection.dataset.visible = visible ? "true" : "false";
  if (!visible) {
    patternGroupHelp.textContent = state.batchA.selectionMode === BATCH_A_SELECTION_MODES.SOURCE_UNIT
      ? "切換到知識點模式後，可選擇已開放的單一知識點。"
      : "目前選取的知識點只有一種題目形式，系統已自動套用。";
    return;
  }

  patternGroupHelp.textContent = "可同時選擇計算題、應用題與推理題；每個知識點至少保留一種形式。";
  for (const choices of choiceGroups.values()) {
    const group = document.createElement("section");
    group.className = "pattern-group-choice";
    const heading = document.createElement("h4");
    heading.textContent = choices[0].knowledgePointDisplayName;
    group.append(heading);
    const buttons = document.createElement("div");
    buttons.className = "pattern-group-choice__buttons";
    for (const choice of choices) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "pattern-group-option";
      button.dataset.patternGroupId = choice.patternGroupId;
      button.dataset.selected = choice.selected ? "true" : "false";
      button.setAttribute("aria-pressed", choice.selected ? "true" : "false");
      button.textContent = `${choice.selected ? "已選｜" : ""}${choice.displayLabel}`;
      buttons.append(button);
    }
    group.append(buttons);
    patternGroupPanel.append(group);
  }
}

function renderSelectorWarnings() {
  if (!knowledgePointWarningList) return;
  const warnings = [...(state.batchA.selectorWarnings ?? []), ...patternGroupUiWarnings];
  knowledgePointWarningList.replaceChildren();
  knowledgePointWarningList.dataset.visible = warnings.length > 0 ? "true" : "false";
  for (const warning of warnings) {
    const item = document.createElement("li");
    item.textContent = publicSelectorWarningMessage(warning);
    knowledgePointWarningList.append(item);
  }
}

function syncG5AU08Controls() {
  const visible = state.batchA.sourceId === G5A_U08_SOURCE_ID
    && state.batchA.selectionMode !== BATCH_A_SELECTION_MODES.SOURCE_UNIT;
  if (g5aU08ControlSection) g5aU08ControlSection.dataset.visible = visible ? "true" : "false";
  if (g5aU08QuestionMode) g5aU08QuestionMode.value = state.batchA.questionMode ?? "mixed";
  if (g5aU08DepthMode) g5aU08DepthMode.value = state.batchA.depthMode ?? "mixed";
  if (g5aU08ContextMode) g5aU08ContextMode.value = state.batchA.contextMode ?? "mixed";
}

function syncKnowledgePointSelectorFromState() {
  syncSelectionModeOptions();
  renderKnowledgePointAvailability();
  renderPatternGroupChoices();
  renderSelectorWarnings();
  syncG5AU08Controls();
}

function isG3AU01VisualRank01LayoutActive() {
  const selectedKps = state.batchA.selectedKnowledgePointIds ?? [];
  const selectedGroups = state.batchA.selectedPatternGroupIds ?? [];
  return state.batchA.sourceId === G3A_U01_VISUAL_RANK01_SOURCE_ID
    && state.batchA.selectionMode !== BATCH_A_SELECTION_MODES.SOURCE_UNIT
    && selectedKps.includes(G3A_U01_VISUAL_RANK01_KP_ID)
    && selectedGroups.includes(G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID);
}

function syncPublicLayoutControls() {
  if (!columnsInput || !rowsPerPageInput) return;
  const columns = Number(columnsInput.value ?? state.batchA.columns);
  const globalRows = approvedRowsForGlobalPublicColumns(columns);
  const globalMaximum = globalRows.length ? Math.max(...globalRows) : 5;
  const rank01Active = isG3AU01VisualRank01LayoutActive();
  const maximum = rank01Active
    ? (maxSafeG3AU01VisualRank01Rows(columns) ?? globalMaximum)
    : globalMaximum;
  const currentRows = Number(rowsPerPageInput.value ?? state.batchA.rowsPerPage);
  const rowsPerPage = Math.min(Math.max(Number.isInteger(currentRows) ? currentRows : 1, 1), maximum);
  rowsPerPageInput.min = "1";
  rowsPerPageInput.max = String(maximum);
  rowsPerPageInput.value = String(rowsPerPage);
  if (state.batchA.columns !== columns || state.batchA.rowsPerPage !== rowsPerPage) {
    setBatchAPrintLayout(state, { columns, rowsPerPage });
  }
  if (globalLayoutHelp) {
    globalLayoutHelp.textContent = rank01Active
      ? `此題型含最多 8 列資料表；目前 ${columns} 欄每頁可選 1～${maximum} 列，以避免 A4 列印裁切。`
      : `目前 ${columns} 欄可選每頁 1～${maximum} 列；答案頁使用獨立安全版面。`;
  }
}

function syncControlsFromState() {
  if (sourceSelect) sourceSelect.value = state.batchA.sourceId;
  if (questionCountInput) questionCountInput.value = String(state.batchA.questionCount);
  if (orderingSelect) orderingSelect.value = state.batchA.ordering;
  if (answerKeyInput) answerKeyInput.checked = state.batchA.includeAnswerKey;
  if (generationSeedInput) generationSeedInput.value = state.batchA.generationSeed;
  if (columnsInput) columnsInput.value = String(state.batchA.columns);
  if (rowsPerPageInput) rowsPerPageInput.value = String(state.batchA.rowsPerPage);
  updateSourceHelp();
  syncKnowledgePointSelectorFromState();
  syncPublicLayoutControls();
}

function readSelectorControlsIntoState() {
  const requestedMode = selectionModeSelect?.value ?? BATCH_A_SELECTION_MODES.SOURCE_UNIT;

  if (requestedMode === BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT) {
    const knowledgePointId = chooseSingleKnowledgePointId(state.batchA.sourceId);
    if (knowledgePointId) {
      applySelectorSelection(
        BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
        [knowledgePointId],
        state.batchA.selectedPatternGroupIds
      );
      return;
    }
  }

  if (requestedMode === BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT) {
    if (state.batchA.selectionMode !== BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT) {
      const knowledgePointIds = chooseSameUnitKnowledgePointIds(state.batchA.sourceId);
      if (knowledgePointIds.length >= 2) {
        applySelectorSelection(
          BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
          knowledgePointIds,
          state.batchA.selectedPatternGroupIds
        );
        ensureMixedSelectorTargets({ reset: true });
        syncMixedSelectorTargetsToState();
        return;
      }
    } else {
      ensureMixedSelectorTargets();
      if (mixedSelectorTargetIds.size >= 2) {
        syncMixedSelectorTargetsToState();
        return;
      }
    }
  }

  applySelectorSelection(BATCH_A_SELECTION_MODES.SOURCE_UNIT, [], []);
}

function readControlsIntoState() {
  setBatchASourceId(state, sourceSelect?.value ?? state.batchA.sourceId);
  setBatchAQuestionCount(state, Number(questionCountInput?.value ?? state.batchA.questionCount));
  setBatchAOrdering(state, orderingSelect?.value ?? state.batchA.ordering);
  setBatchAIncludeAnswerKey(state, Boolean(answerKeyInput?.checked));
  setBatchAGenerationSeed(state, generationSeedInput?.value ?? state.batchA.generationSeed);
  setBatchAPrintLayout(state, {
    columns: Number(columnsInput?.value ?? state.batchA.columns),
    rowsPerPage: Number(rowsPerPageInput?.value ?? state.batchA.rowsPerPage)
  });
  readSelectorControlsIntoState();
  setBatchAQuestionMode(state, g5aU08QuestionMode?.value ?? state.batchA.questionMode);
  setBatchADepthMode(state, g5aU08DepthMode?.value ?? state.batchA.depthMode);
  setBatchAContextMode(state, g5aU08ContextMode?.value ?? state.batchA.contextMode);
}

function renderIssues(result) {
  const errors = result?.errors ?? result?.validation?.errors ?? [];
  const warnings = result?.warnings ?? result?.validation?.warnings ?? [];
  if (!validationPanel) return;
  if (errors.length === 0 && warnings.length === 0) {
    validationPanel.dataset.hasErrors = "false";
    validationPanel.textContent = "驗證通過，沒有發現出題錯誤。";
    return;
  }
  validationPanel.dataset.hasErrors = errors.length > 0 ? "true" : "false";
  const list = document.createElement("ul");
  list.className = "validation-list";
  for (const issue of [...errors, ...warnings]) {
    const item = document.createElement("li");
    item.textContent = publicIssueMessage(issue);
    list.append(item);
  }
  validationPanel.replaceChildren(list);
}

function markOutputStale() {
  if (!hasGeneratedWorksheet) return;
  if (printButton) {
    printButton.disabled = true;
    printButton.textContent = "請重新產生後列印";
  }
  setPanel(statusPanel, "設定已變更，請重新產生考卷。", "");
}

function regenerate() {
  readControlsIntoState();
  writeQueryStateFromState(state);
  setPanel(statusPanel, "正在產生練習題...", "");
  if (printButton) {
    printButton.disabled = true;
    printButton.textContent = "列印";
  }

  const result = state.batchA.selectionMode === BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT
    ? buildWorksheetDocumentFromPlan({
      ...getBatchAWorksheetPlan(state),
      selectedSelectorTargetIds: [...mixedSelectorTargetIds],
    })
    : buildWorksheetDocumentFromState(state);
  renderIssues(result);
  if (!result.ok || !result.worksheetDocument) {
    hasGeneratedWorksheet = false;
    setPanel(statusPanel, "產生失敗，請檢查知識點、題目形式、深度、情境與題數設定。", "error");
    if (previewMeta) previewMeta.textContent = "產生失敗。";
    return;
  }

  renderPreviewFrame(previewFrame, result.worksheetDocument, {
    title: result.worksheetDocument.title,
    outputMode: "studentPrint",
    stylesheetHref: "./assets/styles/print-styles.css"
  });
  const count = result.worksheetDocument.summary?.questionCount ?? result.worksheetDocument.generatedQuestions?.length ?? 0;
  hasGeneratedWorksheet = true;
  setPanel(statusPanel, `已產生 ${count} 題，可預覽與列印。`, "success");
  if (previewMeta) {
    previewMeta.textContent = `${result.worksheetDocument.title}｜${count} 題｜${state.batchA.includeAnswerKey ? "含答案頁" : "不含答案頁"}`;
  }
  if (printButton) {
    printButton.disabled = false;
    printButton.textContent = "列印目前考卷";
  }
}

function bindControls() {
  gradeSelect?.addEventListener("change", () => {
    populateSemesterSelect(Number(gradeSelect.value));
    populateSourceSelect();
    sourceSelect?.dispatchEvent(new Event("change", { bubbles: true }));
  });

  semesterSelect?.addEventListener("change", () => {
    populateSourceSelect();
    sourceSelect?.dispatchEvent(new Event("change", { bubbles: true }));
  });

  for (const element of [
    sourceSelect,
    selectionModeSelect,
    questionCountInput,
    orderingSelect,
    answerKeyInput,
    generationSeedInput,
    columnsInput,
    rowsPerPageInput,
    g5aU08QuestionMode,
    g5aU08DepthMode,
    g5aU08ContextMode
  ]) {
    element?.addEventListener("change", () => {
      readControlsIntoState();
      syncControlsFromState();
      writeQueryStateFromState(state);
      markOutputStale();
    });
  }

  knowledgePointPanel?.addEventListener("click", (event) => {
    const rank01Target = event.target.closest?.("[data-rank01-selector-target='true']");
    if (rank01Target) {
      if (rank01Target.disabled) return;
      if (state.batchA.selectionMode === BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT) {
        ensureMixedSelectorTargets();
        if (mixedSelectorTargetIds.has(G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID)) {
          if (mixedSelectorTargetIds.size <= 2) {
            patternGroupUiWarnings = [{ code: "public_pattern_group_minimum_one" }];
            renderSelectorWarnings();
            return;
          }
          mixedSelectorTargetIds.delete(G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID);
        } else {
          mixedSelectorTargetIds.add(G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID);
        }
        syncMixedSelectorTargetsToState();
      } else {
        applySelectorSelection(
          BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
          [G3A_U01_VISUAL_RANK01_KP_ID],
          [G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID]
        );
      }
      syncControlsFromState();
      writeQueryStateFromState(state);
      markOutputStale();
      return;
    }

    const rank03Target = event.target.closest?.("[data-rank03-selector-target='true']");
    if (rank03Target) {
      if (rank03Target.disabled) return;
      if (state.batchA.selectionMode === BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT) {
        ensureMixedSelectorTargets();
        if (mixedSelectorTargetIds.has(G3A_U01_VISUAL_RANK03_PATTERN_GROUP_ID)) {
          if (mixedSelectorTargetIds.size <= 2) {
            patternGroupUiWarnings = [{ code: "public_pattern_group_minimum_one" }];
            renderSelectorWarnings();
            return;
          }
          mixedSelectorTargetIds.delete(G3A_U01_VISUAL_RANK03_PATTERN_GROUP_ID);
        } else {
          mixedSelectorTargetIds.add(G3A_U01_VISUAL_RANK03_PATTERN_GROUP_ID);
        }
        syncMixedSelectorTargetsToState();
      } else {
        applySelectorSelection(
          BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
          [G3A_U01_VISUAL_RANK03_KP_ID],
          [G3A_U01_VISUAL_RANK03_PATTERN_GROUP_ID]
        );
      }
      syncControlsFromState();
      writeQueryStateFromState(state);
      markOutputStale();
      return;
    }

    const item = event.target.closest?.("[data-knowledge-point-id]");
    if (!item || item.disabled) return;
    const knowledgePointId = item.dataset.knowledgePointId;
    const visibleIds = new Set(visibleKnowledgePointsForSource(state.batchA.sourceId).map((entry) => entry.knowledgePointId));
    if (!visibleIds.has(knowledgePointId)) return;

    if (state.batchA.selectionMode === BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT) {
      ensureMixedSelectorTargets();
      if (mixedSelectorTargetIds.has(knowledgePointId)) {
        if (mixedSelectorTargetIds.size <= 2) {
          patternGroupUiWarnings = [{ code: "public_pattern_group_minimum_one" }];
          renderSelectorWarnings();
          return;
        }
        mixedSelectorTargetIds.delete(knowledgePointId);
      } else {
        mixedSelectorTargetIds.add(knowledgePointId);
      }
      syncMixedSelectorTargetsToState();
    } else {
      const explicitPatternGroups = knowledgePointId === G3A_U01_VISUAL_RANK02_KP_ID
        ? [G3A_U01_VISUAL_RANK02_PATTERN_GROUP_ID]
        : state.batchA.selectedPatternGroupIds;
      applySelectorSelection(
        BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
        [knowledgePointId],
        explicitPatternGroups
      );
    }
    syncControlsFromState();
    writeQueryStateFromState(state);
    markOutputStale();
  });

  patternGroupPanel?.addEventListener("click", (event) => {
    const item = event.target.closest?.("[data-pattern-group-id]");
    if (!item) return;
    const toggled = togglePublicPatternGroupSelection({
      selectionMode: state.batchA.selectionMode,
      selectedKnowledgePointIds: state.batchA.selectedKnowledgePointIds,
      selectedPatternGroupIds: state.batchA.selectedPatternGroupIds,
      patternGroupId: item.dataset.patternGroupId
    });
    setBatchASelectorSelection(state, {
      selectionMode: state.batchA.selectionMode,
      selectedKnowledgePointIds: state.batchA.selectedKnowledgePointIds,
      selectedPatternGroupIds: toggled.selectedPatternGroupIds
    });
    patternGroupUiWarnings = [...toggled.warnings];
    syncControlsFromState();
    writeQueryStateFromState(state);
    markOutputStale();
  });

  regenerateButton?.addEventListener("click", regenerate);
  printButton?.addEventListener("click", () => {
    if (!hasGeneratedWorksheet) return;
    printPreviewFrame(previewFrame);
  });
}

initializeSourceSelectors();
normalizeCurrentPatternGroups();
syncControlsFromState();
bindControls();