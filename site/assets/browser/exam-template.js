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
import {
  buildWorksheetDocumentFromPlan,
  buildWorksheetDocumentFromState,
} from "./pipeline/build-worksheet-document.js";
import {
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
} from "../../modules/curriculum/registry/batch-a-selector-extension.js";
import { resolvePublicUiCapabilityBinding } from "../../modules/curriculum/public/public-ui-capability-binding-p04f33.js";
import {
  G3A_U01_VISUAL_RANK01_KP_ID,
  G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID,
  G3A_U01_VISUAL_RANK01_PUBLIC_PATTERN_GROUP,
  G3A_U01_VISUAL_RANK01_SOURCE_ID,
} from "../../modules/curriculum/registry/g3a-u01-visual-rank01-selector-projection.js";
import {
  buildSchoolExamLayoutPages,
  renderSchoolExamWorksheetToHtml,
} from "../../modules/renderer/school-exam-template-renderer.js";
import { buildSchoolExamCrossUnitWorksheet } from "../../modules/exam/school-exam-cross-unit-coordinator.js";
import {
  SCHOOL_EXAM_COMPOSITION_MODES,
  resolveSchoolExamCompositionMode,
} from "../../modules/exam/school-exam-composition-contract.js";

const EXAM_SINGLE_KP_MODE = "SINGLE_KP";

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
const crossUnitSelector = document.getElementById("exam-cross-unit-selector");
const crossUnitHelp = document.getElementById("exam-cross-unit-help");
const crossUnitSourcePanel = document.getElementById("exam-cross-unit-source-panel");
const crossUnitKpGroups = document.getElementById("exam-cross-unit-kp-groups");
const questionCountInput = document.getElementById("exam-question-count");
const pageQuestionTargetSelect = document.getElementById("exam-page-question-target");
const pageAutoFillInput = document.getElementById("exam-page-auto-fill");
const orderingSelect = document.getElementById("exam-ordering");
const seedInput = document.getElementById("exam-seed");
const answerKeyInput = document.getElementById("exam-answer-key");
const generateButton = document.getElementById("exam-generate");
const printButton = document.getElementById("exam-print");
const statusPanel = document.getElementById("exam-status");
const previewMeta = document.getElementById("exam-preview-meta");
const previewFrame = document.getElementById("exam-preview");

const crossUnitSelection = {
  selectedSourceIds: [],
  selectedKnowledgePointIds: [],
};

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

function singleKpPubliclyAdmitted(sourceId, knowledgePointId) {
  const binding = resolvePublicUiCapabilityBinding({
    sourceId,
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [knowledgePointId],
  });
  const option = binding?.availableSelectionModes?.find(
    (candidate) => candidate.value === BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
  );
  return binding?.blocked === false && option?.enabled !== false;
}

function crossUnitEligibleRowsForSource(sourceId) {
  return visibleKnowledgePointsForSource(sourceId).filter(
    (row) => singleKpPubliclyAdmitted(sourceId, row.knowledgePointId),
  );
}

function crossUnitEligibleUnits() {
  const grade = Number(gradeSelect.value);
  const semester = semesterSelect.value;
  return sortedUnits.filter(
    (unit) => unit.grade === grade
      && unit.semester === semester
      && crossUnitEligibleRowsForSource(unit.sourceId).length > 0,
  );
}

function normalizeCrossUnitSelection({ reset = false } = {}) {
  const eligibleUnits = crossUnitEligibleUnits();
  const eligibleSourceIds = new Set(eligibleUnits.map((unit) => unit.sourceId));
  const rowById = new Map(
    eligibleUnits.flatMap((unit) => crossUnitEligibleRowsForSource(unit.sourceId))
      .map((row) => [row.knowledgePointId, row]),
  );

  let selectedSourceIds = reset
    ? []
    : crossUnitSelection.selectedSourceIds.filter((sourceId) => eligibleSourceIds.has(sourceId));
  let selectedKnowledgePointIds = reset
    ? []
    : crossUnitSelection.selectedKnowledgePointIds.filter((knowledgePointId) => {
        const row = rowById.get(knowledgePointId);
        return row && selectedSourceIds.includes(row.sourceId);
      });

  if (selectedSourceIds.length < 2 && eligibleUnits.length >= 2) {
    selectedSourceIds = eligibleUnits.slice(0, 2).map((unit) => unit.sourceId);
    selectedKnowledgePointIds = selectedSourceIds.map(
      (sourceId) => crossUnitEligibleRowsForSource(sourceId)[0]?.knowledgePointId,
    ).filter(Boolean);
  }

  for (const sourceId of selectedSourceIds) {
    const alreadyRepresented = selectedKnowledgePointIds.some(
      (knowledgePointId) => rowById.get(knowledgePointId)?.sourceId === sourceId,
    );
    if (!alreadyRepresented) {
      const first = crossUnitEligibleRowsForSource(sourceId)[0]?.knowledgePointId;
      if (first) selectedKnowledgePointIds.push(first);
    }
  }

  crossUnitSelection.selectedSourceIds = [...new Set(selectedSourceIds)];
  crossUnitSelection.selectedKnowledgePointIds = [...new Set(selectedKnowledgePointIds)];
  return {
    eligibleUnits,
    selectedSourceIds: crossUnitSelection.selectedSourceIds,
    selectedKnowledgePointIds: crossUnitSelection.selectedKnowledgePointIds,
  };
}

function renderCrossUnitSelection() {
  if (!crossUnitSelector || !crossUnitHelp || !crossUnitSourcePanel || !crossUnitKpGroups) return;
  const isCross = compositionModeSelect?.value === SCHOOL_EXAM_COMPOSITION_MODES.MIXED_KP_CROSS_UNIT;
  crossUnitSelector.hidden = !isCross;
  crossUnitSourcePanel.replaceChildren();
  crossUnitKpGroups.replaceChildren();
  if (!isCross) return;

  const normalized = normalizeCrossUnitSelection();
  const selectedSourceSet = new Set(normalized.selectedSourceIds);
  const selectedKpSet = new Set(normalized.selectedKnowledgePointIds);

  for (const unit of normalized.eligibleUnits) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cross-unit-source-option";
    button.dataset.crossSourceId = unit.sourceId;
    button.dataset.selected = selectedSourceSet.has(unit.sourceId) ? "true" : "false";
    button.setAttribute("aria-pressed", selectedSourceSet.has(unit.sourceId) ? "true" : "false");
    button.textContent = `${selectedSourceSet.has(unit.sourceId) ? "已選｜" : ""}${unit.unitCode}｜${unit.title}`;
    crossUnitSourcePanel.append(button);
  }

  for (const sourceId of normalized.selectedSourceIds) {
    const unit = normalized.eligibleUnits.find((candidate) => candidate.sourceId === sourceId);
    if (!unit) continue;
    const group = document.createElement("section");
    group.className = "cross-unit-kp-group";
    group.dataset.sourceId = sourceId;
    const heading = document.createElement("h4");
    heading.textContent = `${unit.unitCode}｜${unit.title}`;
    const panel = document.createElement("div");
    panel.className = "knowledge-point-panel";

    for (const row of crossUnitEligibleRowsForSource(sourceId)) {
      const selected = selectedKpSet.has(row.knowledgePointId);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "knowledge-point-option";
      button.dataset.crossKnowledgePointId = row.knowledgePointId;
      button.dataset.sourceId = sourceId;
      button.dataset.selected = selected ? "true" : "false";
      button.setAttribute("aria-pressed", selected ? "true" : "false");
      const strong = document.createElement("strong");
      strong.textContent = `${selected ? "已選｜" : ""}${row.displayName ?? row.knowledgePointId}`;
      const detail = document.createElement("span");
      detail.textContent = `${unit.unitCode}｜既有單一 KP runtime`;
      button.append(strong, detail);
      panel.append(button);
    }
    group.append(heading, panel);
    crossUnitKpGroups.append(group);
  }

  crossUnitHelp.textContent = [
    `目前已選 ${normalized.selectedSourceIds.length} 個單元`,
    `${normalized.selectedKnowledgePointIds.length} 個知識點`,
    "限定同年級、同學期；每個已選單元至少保留 1 個知識點。",
  ].join("｜");
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

function singleKpTargetsForSource(sourceId) {
  const targets = [];
  for (const row of visibleKnowledgePointsForSource(sourceId)) {
    targets.push({
      targetId: row.knowledgePointId,
      knowledgePointId: row.knowledgePointId,
      selectedPatternGroupIds: [],
      displayName: row.displayName ?? row.knowledgePointId,
      unitCode: row.unitCode ?? selectedUnit()?.unitCode ?? "",
      rank01Sibling: false,
    });
    if (sourceId === G3A_U01_VISUAL_RANK01_SOURCE_ID && row.knowledgePointId === G3A_U01_VISUAL_RANK01_KP_ID) {
      targets.push({
        targetId: G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID,
        knowledgePointId: G3A_U01_VISUAL_RANK01_KP_ID,
        selectedPatternGroupIds: [G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID],
        displayName: G3A_U01_VISUAL_RANK01_PUBLIC_PATTERN_GROUP.displayName,
        unitCode: row.unitCode ?? selectedUnit()?.unitCode ?? "",
        rank01Sibling: true,
      });
    }
  }
  return targets;
}

function selectedSingleKpTargetId() {
  if (state.batchA.selectionMode !== BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT) return null;
  const selectedKnowledgePointId = (state.batchA.selectedKnowledgePointIds ?? [])[0] ?? null;
  if (
    state.batchA.sourceId === G3A_U01_VISUAL_RANK01_SOURCE_ID
    && selectedKnowledgePointId === G3A_U01_VISUAL_RANK01_KP_ID
    && (state.batchA.selectedPatternGroupIds ?? []).includes(G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID)
  ) {
    return G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID;
  }
  return selectedKnowledgePointId;
}

function singleKpCapability(sourceId, requestedTargetId = null) {
  const targets = singleKpTargetsForSource(sourceId);
  const selectedTarget = targets.find((target) => target.targetId === requestedTargetId) ?? targets[0] ?? null;
  const binding = selectedTarget ? resolvePublicUiCapabilityBinding({
    sourceId,
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [selectedTarget.knowledgePointId],
    selectedPatternGroupIds: selectedTarget.selectedPatternGroupIds,
  }) : null;
  return {
    targets,
    selectedTarget,
    binding,
    enabled: Boolean(selectedTarget) && binding?.blocked === false,
  };
}

function renderSameUnitKnowledgePoints() {
  if (!kpPanel || !sameUnitKpSelector || !kpHelp) return;
  const isSingle = compositionModeSelect?.value === EXAM_SINGLE_KP_MODE;
  const isMixed = compositionModeSelect?.value === SCHOOL_EXAM_COMPOSITION_MODES.MIXED_KP_SAME_UNIT;
  sameUnitKpSelector.hidden = !(isSingle || isMixed);
  kpPanel.replaceChildren();

  if (isSingle) {
    const capability = singleKpCapability(sourceSelect.value, selectedSingleKpTargetId());
    const selectedTargetId = capability.selectedTarget?.targetId ?? null;
    for (const target of capability.targets) {
      const selected = target.targetId === selectedTargetId;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "knowledge-point-option";
      button.dataset.selectorTargetId = target.targetId;
      button.dataset.knowledgePointId = target.knowledgePointId;
      button.dataset.rank01Sibling = target.rank01Sibling ? "true" : "false";
      button.dataset.selected = selected ? "true" : "false";
      button.setAttribute("aria-pressed", selected ? "true" : "false");

      const strong = document.createElement("strong");
      strong.textContent = `${selected ? "已選｜" : ""}${target.displayName}`;
      const detail = document.createElement("span");
      detail.textContent = `${target.unitCode}｜已通過出題驗證`;
      button.append(strong, detail);
      kpPanel.append(button);
    }
    kpHelp.textContent = `請選 1 個知識點或 Rank 題型；目前共有 ${capability.targets.length} 個同層可選項目。`;
    return;
  }

  if (!isMixed) return;
  const capability = sameUnitCapability(sourceSelect.value, selectedSameUnitIds());
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
  const singleKpOption = [...compositionModeSelect.options].find(
    (option) => option.value === EXAM_SINGLE_KP_MODE,
  );
  const m3Option = [...compositionModeSelect.options].find(
    (option) => option.value === SCHOOL_EXAM_COMPOSITION_MODES.MIXED_KP_SAME_UNIT,
  );
  const m4Option = [...compositionModeSelect.options].find(
    (option) => option.value === SCHOOL_EXAM_COMPOSITION_MODES.MIXED_KP_CROSS_UNIT,
  );
  const capability = sameUnitCapability(sourceSelect.value, selectedSameUnitIds());
  const singleCapability = singleKpCapability(sourceSelect.value, selectedSingleKpTargetId());
  if (singleKpOption) singleKpOption.disabled = !singleCapability.enabled;
  if (m3Option) m3Option.disabled = !capability.enabled;
  if (m4Option) m4Option.disabled = crossUnitEligibleUnits().length < 2;

  if (compositionModeSelect.value === EXAM_SINGLE_KP_MODE && !singleCapability.enabled) {
    compositionModeSelect.value = SCHOOL_EXAM_COMPOSITION_MODES.SINGLE_UNIT;
  }
  if (compositionModeSelect.value === SCHOOL_EXAM_COMPOSITION_MODES.MIXED_KP_SAME_UNIT && !capability.enabled) {
    compositionModeSelect.value = SCHOOL_EXAM_COMPOSITION_MODES.SINGLE_UNIT;
  }
  if (
    compositionModeSelect.value === SCHOOL_EXAM_COMPOSITION_MODES.MIXED_KP_CROSS_UNIT
    && crossUnitEligibleUnits().length < 2
  ) {
    compositionModeSelect.value = SCHOOL_EXAM_COMPOSITION_MODES.SINGLE_UNIT;
  }
}

function applyCompositionMode({ defaultMixedSelection = false, resetCrossSelection = false } = {}) {
  if (compositionModeSelect?.value === EXAM_SINGLE_KP_MODE) {
    sourceSelect.disabled = false;
    const capability = singleKpCapability(sourceSelect.value, selectedSingleKpTargetId());
    if (!capability.enabled || !capability.selectedTarget) {
      compositionModeSelect.value = SCHOOL_EXAM_COMPOSITION_MODES.SINGLE_UNIT;
      setBatchASelectionMode(state, BATCH_A_SELECTION_MODES.SOURCE_UNIT);
      setStatus("目前單元尚未開放單一知識點考券，已切回「單一單元」。", "error");
      renderSameUnitKnowledgePoints();
      return false;
    }
    setBatchASelectorSelection(state, {
      selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
      selectedKnowledgePointIds: [capability.selectedTarget.knowledgePointId],
      selectedPatternGroupIds: capability.selectedTarget.selectedPatternGroupIds,
    });
    questionCountInput.min = "1";
    if (compositionHelp) {
      compositionHelp.textContent = "單一知識點模式：一般 KP 與 Rank 題型使用同一層選擇器；底層沿用既有 single-KP Generator / Validator route。";
    }
    renderSameUnitKnowledgePoints();
    renderCrossUnitSelection();
    return true;
  }

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
    sourceSelect.disabled = false;
    questionCountInput.min = "1";
    if (compositionHelp) {
      compositionHelp.textContent = "單一單元模式：所有題目都由目前選取單元的既有 Generator / Validator 產生與驗證。";
    }
    renderSameUnitKnowledgePoints();
    renderCrossUnitSelection();
    return true;
  }

  if (resolved.examMode === SCHOOL_EXAM_COMPOSITION_MODES.MIXED_KP_SAME_UNIT) {
    sourceSelect.disabled = false;
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
    renderCrossUnitSelection();
    return true;
  }

  if (resolved.examMode === SCHOOL_EXAM_COMPOSITION_MODES.MIXED_KP_CROSS_UNIT) {
    const normalized = normalizeCrossUnitSelection({ reset: resetCrossSelection });
    if (normalized.eligibleUnits.length < 2 || normalized.selectedSourceIds.length < 2) {
      compositionModeSelect.value = SCHOOL_EXAM_COMPOSITION_MODES.SINGLE_UNIT;
      sourceSelect.disabled = false;
      setBatchASelectorSelection(state, {
        selectionMode: BATCH_A_SELECTION_MODES.SOURCE_UNIT,
        selectedKnowledgePointIds: [],
        selectedPatternGroupIds: [],
      });
      setStatus("目前年級與學期沒有至少 2 個可跨單元出題的公開單元。", "error");
      renderSameUnitKnowledgePoints();
      renderCrossUnitSelection();
      return false;
    }

    // Keep the shared Batch A state on sourceUnit. Cross-unit composition is a
    // route-local coordinator so the generic resolver remains fail-closed.
    setBatchASelectorSelection(state, {
      selectionMode: BATCH_A_SELECTION_MODES.SOURCE_UNIT,
      selectedKnowledgePointIds: [],
      selectedPatternGroupIds: [],
    });
    sourceSelect.disabled = true;
    questionCountInput.min = String(normalized.selectedKnowledgePointIds.length);
    if (Number(questionCountInput.value) < normalized.selectedKnowledgePointIds.length) {
      questionCountInput.value = String(normalized.selectedKnowledgePointIds.length);
    }
    if (compositionHelp) {
      compositionHelp.textContent = "跨單元模式：限定同年級、同學期；每個知識點回到自己的單元，以既有 single-KP Generator / Validator 產生後再聚合。";
    }
    renderSameUnitKnowledgePoints();
    renderCrossUnitSelection();
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
  const isCross = compositionModeSelect?.value === SCHOOL_EXAM_COMPOSITION_MODES.MIXED_KP_CROSS_UNIT;
  const crossTitles = crossUnitSelection.selectedSourceIds
    .map((sourceId) => sortedUnits.find((candidate) => candidate.sourceId === sourceId))
    .filter(Boolean)
    .map((candidate) => `${candidate.unitCode} ${candidate.title}`);
  return {
    schoolName: schoolNameInput.value.trim() || "○○國民小學",
    academicYear: academicYearInput.value.trim() || "115",
    semesterLabel: semesterLabel(isCross ? semesterSelect.value : (unit?.semester ?? semesterSelect.value)),
    gradeLabel: isCross ? `${gradeSelect.value} 年級` : (unit ? `${unit.grade} 年級` : `${gradeSelect.value} 年級`),
    examName: examNameSelect.value,
    subjectLabel: "數學",
    unitTitle: isCross ? crossTitles.join("＋") : (unit?.title ?? ""),
    studentFields: ["班級", "座號", "姓名"],
    showScoreBox: true,
  };
}

function examLayoutOptions() {
  const rawTarget = pageQuestionTargetSelect?.value ?? "auto";
  return {
    targetQuestionsPerPage: rawTarget === "auto" ? null : Number(rawTarget),
    autoFill: pageAutoFillInput?.checked !== false,
  };
}

function generateExam() {
  if (!sourceSelect.value) {
    setStatus("目前沒有可產生的單元。", "error");
    return;
  }

  const isCross = compositionModeSelect?.value === SCHOOL_EXAM_COMPOSITION_MODES.MIXED_KP_CROSS_UNIT;
  setBatchASourceId(state, sourceSelect.value);
  syncCompositionModeAvailability();
  if (!applyCompositionMode()) {
    printButton.disabled = true;
    return;
  }

  let result;
  if (isCross) {
    result = buildSchoolExamCrossUnitWorksheet({
      grade: Number(gradeSelect.value),
      semester: semesterSelect.value,
      selectedSourceIds: [...crossUnitSelection.selectedSourceIds],
      selectedKnowledgePointIds: [...crossUnitSelection.selectedKnowledgePointIds],
      selectedPatternGroupIds: [],
      questionCount: Number(questionCountInput.value),
      ordering: orderingSelect.value,
      includeAnswerKey: answerKeyInput.checked,
      generationSeed: seedInput.value,
      printLayout: {
        paperSize: "A4",
        columns: 2,
        rowsPerPage: 5,
        showAnswerKeyPage: answerKeyInput.checked,
        showQuestionNumbers: true,
      },
    }, buildWorksheetDocumentFromPlan);
  } else {
    setBatchAQuestionCount(state, Number(questionCountInput.value));
    setBatchAOrdering(state, orderingSelect.value);
    setBatchAGenerationSeed(state, seedInput.value);
    setBatchAIncludeAnswerKey(state, answerKeyInput.checked);

    // The school-exam projection is intentionally fixed at a safe 2-column,
    // 5-row source allocation. M5 will repair the visible fill/pagination issue.
    setBatchAPrintLayout(state, { columns: 2, rowsPerPage: 5 });
    result = buildWorksheetDocumentFromState(state);
  }
  if (!result?.ok || !result.worksheetDocument) {
    const errors = (result?.errors ?? []).map((error) => error?.message ?? error?.code ?? String(error));
    setStatus(errors.length > 0 ? errors.join("｜") : "考券產生失敗。", "error");
    printButton.disabled = true;
    return;
  }

  const layoutOptions = examLayoutOptions();
  const html = renderSchoolExamWorksheetToHtml(result.worksheetDocument, {
    examMeta: examMeta(),
    stylesheetHref: "../assets/styles/print-styles.css",
    layout: layoutOptions,
  });
  previewFrame.srcdoc = html;
  printButton.disabled = false;

  const questionCount = result.worksheetDocument?.summary?.questionCount
    ?? result.worksheetDocument?.orderedQuestionIds?.length
    ?? Number(questionCountInput.value);
  const examLayout = buildSchoolExamLayoutPages(result.worksheetDocument, layoutOptions);
  const pageCount = examLayout.questionPages.length;
  const targetLabel = examLayout.targetQuestionsPerPage === null
    ? "每頁題數：自動"
    : `每頁最多：${examLayout.targetQuestionsPerPage} 題`;
  const fillLabel = examLayout.autoFill ? "實際高度自動換頁" : "估算分頁";
  previewMeta.textContent = `已產生 ${questionCount} 題｜題目頁 ${pageCount} 頁（初始估算）｜${targetLabel}｜${fillLabel}｜A4 直式雙欄｜Layout V1.1`;
  const crossUsed = result.worksheetDocument?.metadata?.crossUnitMixedUsed === true;
  const singleKpUsed = result.worksheetDocument?.batchA?.selectionMode === BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT;
  const mixedUsed = result.worksheetDocument?.metadata?.sameUnitMixedUsed === true
    || result.worksheetDocument?.batchA?.selectionMode === BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT;
  const allocation = result.allocation ?? result.worksheetDocument?.metadata?.allocation ?? [];
  const allocationText = Array.isArray(allocation) && allocation.length > 0
    ? `｜配置：${allocation.map((entry) => `${entry.knowledgePointId}=${entry.questionCount}`).join("、")}`
    : "";
  setStatus(
    crossUsed
      ? `跨單元混合知識點考券已產生${allocationText}。`
      : mixedUsed
        ? `同單元混合知識點考券已產生${allocationText}。`
        : singleKpUsed
          ? "單一知識點考券已產生。題目沿用既有 single-KP Generator / Validator 管線。"
          : "單一單元考券已產生。題目仍由既有 Generator / Validator 管線負責，僅改用學校考券版面輸出.",
    "success",
  );
}

gradeSelect.addEventListener("change", () => {
  populateSemesters();
  populateSources();
  setBatchASourceId(state, sourceSelect.value);
  normalizeCrossUnitSelection({ reset: true });
  syncCompositionModeAvailability();
  applyCompositionMode({ resetCrossSelection: true });
});

semesterSelect.addEventListener("change", () => {
  populateSources();
  setBatchASourceId(state, sourceSelect.value);
  normalizeCrossUnitSelection({ reset: true });
  syncCompositionModeAvailability();
  applyCompositionMode({ resetCrossSelection: true });
});

compositionModeSelect?.addEventListener("change", () => {
  syncCompositionModeAvailability();
  const resolved = resolveSchoolExamCompositionMode(compositionModeSelect.value);
  if (!resolved.enabled) {
    compositionModeSelect.value = SCHOOL_EXAM_COMPOSITION_MODES.SINGLE_UNIT;
  }
  applyCompositionMode({
    defaultMixedSelection: compositionModeSelect.value === SCHOOL_EXAM_COMPOSITION_MODES.MIXED_KP_SAME_UNIT,
    resetCrossSelection: compositionModeSelect.value === SCHOOL_EXAM_COMPOSITION_MODES.MIXED_KP_CROSS_UNIT,
  });
  printButton.disabled = true;
});

kpPanel?.addEventListener("click", (event) => {
  if (compositionModeSelect?.value === EXAM_SINGLE_KP_MODE) {
    const button = event.target.closest?.("[data-selector-target-id]");
    if (!button) return;
    const capability = singleKpCapability(sourceSelect.value, button.dataset.selectorTargetId);
    const target = capability.selectedTarget;
    if (!capability.enabled || !target || target.targetId !== button.dataset.selectorTargetId) {
      setStatus("此項目目前無法產生考券。", "error");
      return;
    }
    setBatchASelectorSelection(state, {
      selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
      selectedKnowledgePointIds: [target.knowledgePointId],
      selectedPatternGroupIds: target.selectedPatternGroupIds,
    });
    renderSameUnitKnowledgePoints();
    printButton.disabled = true;
    setStatus("單一知識點已更新，請重新產生考券。");
    return;
  }

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

crossUnitSourcePanel?.addEventListener("click", (event) => {
  const button = event.target.closest?.("[data-cross-source-id]");
  if (!button || compositionModeSelect?.value !== SCHOOL_EXAM_COMPOSITION_MODES.MIXED_KP_CROSS_UNIT) return;
  const sourceId = button.dataset.crossSourceId;
  const eligibleIds = new Set(crossUnitEligibleUnits().map((unit) => unit.sourceId));
  if (!eligibleIds.has(sourceId)) return;

  const selectedSources = new Set(crossUnitSelection.selectedSourceIds);
  if (selectedSources.has(sourceId)) {
    if (selectedSources.size <= 2) {
      setStatus("跨單元混合至少需要 2 個單元。", "error");
      return;
    }
    selectedSources.delete(sourceId);
    const owned = new Set(crossUnitEligibleRowsForSource(sourceId).map((row) => row.knowledgePointId));
    crossUnitSelection.selectedKnowledgePointIds =
      crossUnitSelection.selectedKnowledgePointIds.filter((id) => !owned.has(id));
  } else {
    selectedSources.add(sourceId);
    const first = crossUnitEligibleRowsForSource(sourceId)[0]?.knowledgePointId;
    if (first) crossUnitSelection.selectedKnowledgePointIds.push(first);
  }
  crossUnitSelection.selectedSourceIds = [...selectedSources];
  normalizeCrossUnitSelection();
  renderCrossUnitSelection();
  questionCountInput.min = String(crossUnitSelection.selectedKnowledgePointIds.length);
  if (Number(questionCountInput.value) < crossUnitSelection.selectedKnowledgePointIds.length) {
    questionCountInput.value = String(crossUnitSelection.selectedKnowledgePointIds.length);
  }
  printButton.disabled = true;
  setStatus("跨單元範圍已更新，請重新產生考券。");
});

crossUnitKpGroups?.addEventListener("click", (event) => {
  const button = event.target.closest?.("[data-cross-knowledge-point-id]");
  if (!button || compositionModeSelect?.value !== SCHOOL_EXAM_COMPOSITION_MODES.MIXED_KP_CROSS_UNIT) return;
  const knowledgePointId = button.dataset.crossKnowledgePointId;
  const sourceId = button.dataset.sourceId;
  if (!crossUnitSelection.selectedSourceIds.includes(sourceId)) return;
  const eligibleIds = new Set(crossUnitEligibleRowsForSource(sourceId).map((row) => row.knowledgePointId));
  if (!eligibleIds.has(knowledgePointId)) return;

  const selected = new Set(crossUnitSelection.selectedKnowledgePointIds);
  if (selected.has(knowledgePointId)) {
    const selectedForSource = [...selected].filter((id) => eligibleIds.has(id));
    if (selectedForSource.length <= 1) {
      setStatus("每個已選單元至少需要保留 1 個知識點。", "error");
      return;
    }
    selected.delete(knowledgePointId);
  } else {
    selected.add(knowledgePointId);
  }
  crossUnitSelection.selectedKnowledgePointIds = [...selected];
  renderCrossUnitSelection();
  questionCountInput.min = String(crossUnitSelection.selectedKnowledgePointIds.length);
  if (Number(questionCountInput.value) < crossUnitSelection.selectedKnowledgePointIds.length) {
    questionCountInput.value = String(crossUnitSelection.selectedKnowledgePointIds.length);
  }
  printButton.disabled = true;
  setStatus("跨單元知識點選擇已更新，請重新產生考券。");
});

sourceSelect.addEventListener("change", () => {
  setBatchASourceId(state, sourceSelect.value);
  updateSourceHelp();
  syncCompositionModeAvailability();
  applyCompositionMode({ defaultMixedSelection: true });
  printButton.disabled = true;
});
previewFrame.addEventListener("load", () => {
  const syncActualPageCount = () => {
    const doc = previewFrame.contentDocument;
    if (!doc) return;
    if (doc.body?.dataset?.questionLayoutReady !== "true") {
      setTimeout(syncActualPageCount, 40);
      return;
    }
    const actualPages = doc.querySelectorAll(".school-exam-page--questions").length;
    const actualQuestions = doc.querySelectorAll(
      ".school-exam-page--questions .worksheet-cell--question",
    ).length;
    const rawTarget = pageQuestionTargetSelect?.value ?? "auto";
    const targetLabel = rawTarget === "auto"
      ? "每頁題數：依實際高度"
      : `每頁最多：${rawTarget} 題`;
    const modeLabel = doc.body.dataset.questionLayoutMode === "actual-height"
      ? `固定 5mm 題間距｜實際高度換頁`
      : "估算分頁";
    previewMeta.textContent =
      `已產生 ${actualQuestions} 題｜題目頁 ${actualPages} 頁｜${targetLabel}｜${modeLabel}｜A4 直式雙欄｜Layout V1.1`;
  };
  syncActualPageCount();
});
pageQuestionTargetSelect?.addEventListener("change", () => {
  printButton.disabled = true;
  setStatus("每頁題數設定已更新，請重新產生考券。");
});
pageAutoFillInput?.addEventListener("change", () => {
  printButton.disabled = true;
  setStatus("頁面填滿設定已更新，請重新產生考券。");
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
