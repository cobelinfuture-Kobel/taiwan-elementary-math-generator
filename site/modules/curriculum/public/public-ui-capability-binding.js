import {
  getVisiblePatternGroupsForKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
} from "../registry/batch-a-selector-p03f13-extension.js";
import { getFullProductPublicControlProfile } from "../registry/full-product-public-control-profiles.js";
import { listW01PublicApplicationGroupsForKnowledgePoint } from "../registry/w01-public-application-groups.js";
import { listFifteenUnitPublicApplicationGroupsForKnowledgePoint } from "../registry/fifteen-unit-public-application-groups.js";
import { listW1FullProductPublicApplicationGroupsForKnowledgePoint } from "../registry/w1-full-product-public-application-groups.js";
import { isFifteenUnitPublicPblSource } from "./fifteen-unit-public-pbl-runtime.js";

export const PUBLIC_UI_SURFACES = Object.freeze({
  CLASSIC: "CLASSIC",
  FALLBACK_404: "FALLBACK_404",
  PIXEL: "PIXEL",
});

export const PUBLIC_UI_SAFE_QUESTION_COUNT = Object.freeze({
  min: 1,
  default: 20,
  max: 20,
  evidence: "R01_DEFAULT_BASELINE_PENDING_PGC_R03_CAPACITY_PROOF",
});

const SOURCE_UNIT_MODE = "sourceUnit";
const SINGLE_KP_MODE = "singleKnowledgePoint";
const SAME_UNIT_MIXED_MODE = "mixedKnowledgePointsSameUnit";

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function uniqueStrings(values = []) {
  return [...new Set((Array.isArray(values) ? values : []).map((value) => String(value ?? "").trim()).filter(Boolean))];
}

function groupMode(group = {}) {
  const direct = String(group.publicQuestionMode ?? group.questionMode ?? group.mode ?? "").toLowerCase();
  const corpus = `${direct}|${JSON.stringify(group).toLowerCase()}`;
  if (corpus.includes("pbl")) return "pbl";
  if (corpus.includes("application") || corpus.includes("word_problem") || corpus.includes("應用題")) return "application";
  if (corpus.includes("reasoning") || corpus.includes("推理")) return "reasoning";
  if (corpus.includes("concept") || corpus.includes("概念")) return "concept";
  if (corpus.includes("estimation") || corpus.includes("估算")) return "operation_estimation";
  if (corpus.includes("representation") || corpus.includes("表徵")) return "representation";
  return "numeric";
}

function groupsForKnowledgePoint(knowledgePointId) {
  const rows = [
    ...getVisiblePatternGroupsForKnowledgePoint(knowledgePointId),
    ...listW01PublicApplicationGroupsForKnowledgePoint(knowledgePointId),
    ...listFifteenUnitPublicApplicationGroupsForKnowledgePoint(knowledgePointId),
    ...listW1FullProductPublicApplicationGroupsForKnowledgePoint(knowledgePointId),
  ].filter((group) => group?.visibilityStatus === undefined || group.visibilityStatus === "visible");
  return [...new Map(rows.map((group) => [group.patternGroupId, clone(group)])).values()];
}

function profileOptions(definition) {
  return definition?.supported === true ? (definition.options ?? []).map(clone) : [];
}

function uiTypeForGroup(group, profileQuestionTypeValues) {
  const mode = groupMode(group);
  if (profileQuestionTypeValues.has(mode)) return mode;
  if (["concept", "representation", "operation_estimation", "reasoning"].includes(mode) && profileQuestionTypeValues.has("numeric")) return "numeric";
  if (mode !== "pbl" && profileQuestionTypeValues.has("mixed")) return "mixed";
  return null;
}

function visibleKpsForSource(sourceId) {
  return listVisibleBatchAKnowledgePoints().filter((entry) => entry.sourceId === sourceId);
}

function selectedKnowledgePoints({ sourceId, selectionMode, selectedKnowledgePointIds }) {
  const visible = visibleKpsForSource(sourceId);
  const visibleById = new Map(visible.map((entry) => [entry.knowledgePointId, entry]));
  if (selectionMode === SOURCE_UNIT_MODE) return visible;
  const requested = uniqueStrings(selectedKnowledgePointIds).filter((knowledgePointId) => visibleById.has(knowledgePointId));
  if (selectionMode === SINGLE_KP_MODE) {
    const id = requested[0] ?? visible[0]?.knowledgePointId;
    return id ? [visibleById.get(id)] : [];
  }
  if (selectionMode === SAME_UNIT_MIXED_MODE) {
    const ids = requested.length >= 2 ? requested : visible.map((entry) => entry.knowledgePointId);
    return ids.map((id) => visibleById.get(id)).filter(Boolean);
  }
  return [];
}

function availableSelectionModes(sourceId) {
  const availability = listBatchAKnowledgePointAvailabilityBySource(sourceId);
  return [
    Object.freeze({ value: SOURCE_UNIT_MODE, enabled: true }),
    Object.freeze({ value: SINGLE_KP_MODE, enabled: availability.visibleCount > 0 }),
    Object.freeze({ value: SAME_UNIT_MIXED_MODE, enabled: availability.visibleCount >= 2 }),
    Object.freeze({ value: "mixedKnowledgePointsCrossUnit", enabled: false }),
  ];
}

function contextBearing(questionType) {
  return ["mixed", "application", "reasoning", "pbl"].includes(questionType);
}

function depthBearing(questionType) {
  return ["mixed", "application", "reasoning", "pbl"].includes(questionType);
}

function groupDisplayLabel(group = {}) {
  if (group.representationTag === "numeric") return "計算題";
  if (["application_word_problem", "controlled_semantic_application"].includes(group.representationTag)) return "應用題";
  return String(group.displayName ?? group.representationTag ?? group.patternGroupId ?? "題目形式");
}

export function resolvePublicUiCapabilityBinding({
  sourceId,
  selectionMode = SOURCE_UNIT_MODE,
  selectedKnowledgePointIds = [],
  selectedPatternGroupIds = [],
  requestedQuestionType = null,
  surfaceId = PUBLIC_UI_SURFACES.CLASSIC,
} = {}) {
  const profile = getFullProductPublicControlProfile(sourceId);
  const knowledgePoints = selectedKnowledgePoints({ sourceId, selectionMode, selectedKnowledgePointIds });
  const requestedGroupIds = new Set(uniqueStrings(selectedPatternGroupIds));
  const allGroups = knowledgePoints.flatMap((knowledgePoint) =>
    groupsForKnowledgePoint(knowledgePoint.knowledgePointId).map((group) => ({
      ...group,
      knowledgePointId: knowledgePoint.knowledgePointId,
      knowledgePointDisplayName: knowledgePoint.displayName,
      selected: requestedGroupIds.size === 0 || requestedGroupIds.has(group.patternGroupId),
    })),
  );

  const profileQuestionOptions = profileOptions(profile?.questionTypeControl);
  const profileQuestionValues = new Set(profileQuestionOptions.map((option) => option.value));
  const annotatedGroups = allGroups.map((group) => ({
    ...group,
    effectiveQuestionType: groupMode(group),
    uiQuestionType: uiTypeForGroup(group, profileQuestionValues),
    displayLabel: groupDisplayLabel(group),
  }));
  const availableQuestionTypeOptions = profileQuestionOptions.filter((option) => {
    if (option.value === "pbl") return selectionMode === SOURCE_UNIT_MODE && isFifteenUnitPublicPblSource(sourceId);
    if (option.value === "mixed") return annotatedGroups.some((group) => group.uiQuestionType !== null && group.effectiveQuestionType !== "pbl");
    return annotatedGroups.some((group) => group.uiQuestionType === option.value);
  });

  const availableQuestionTypeValues = new Set(availableQuestionTypeOptions.map((option) => option.value));
  const defaultQuestionType = availableQuestionTypeValues.has(profile?.questionTypeControl?.defaultValue)
    ? profile.questionTypeControl.defaultValue
    : availableQuestionTypeOptions[0]?.value ?? null;
  const questionType = availableQuestionTypeValues.has(requestedQuestionType)
    ? requestedQuestionType
    : defaultQuestionType;
  const compatiblePatternGroups = questionType === "pbl"
    ? []
    : annotatedGroups.filter((group) => questionType === "mixed" ? group.uiQuestionType !== null : group.uiQuestionType === questionType);
  const compatiblePatternGroupIds = uniqueStrings(compatiblePatternGroups.map((group) => group.patternGroupId));
  const selectedCompatiblePatternGroupIds = uniqueStrings(
    compatiblePatternGroups.filter((group) => group.selected).map((group) => group.patternGroupId),
  );

  const depthOptions = depthBearing(questionType) ? profileOptions(profile?.reasoningDepthControl) : [];
  const contextOptions = contextBearing(questionType) ? profileOptions(profile?.contextControl) : [];
  const blockedReasons = [];
  if (!profile) blockedReasons.push("PUBLIC_CONTROL_PROFILE_MISSING");
  if (knowledgePoints.length === 0) blockedReasons.push("VISIBLE_KNOWLEDGE_POINT_MISSING");
  if (availableQuestionTypeOptions.length === 0) blockedReasons.push("COMPATIBLE_QUESTION_TYPE_MISSING");
  if (questionType !== "pbl" && compatiblePatternGroups.length === 0) blockedReasons.push("COMPATIBLE_PATTERN_GROUP_MISSING");

  return Object.freeze({
    sourceId,
    surfaceId,
    selectionMode,
    availableSelectionModes: Object.freeze(availableSelectionModes(sourceId)),
    selectedKnowledgePointIds: Object.freeze(knowledgePoints.map((entry) => entry.knowledgePointId)),
    selectedKnowledgePointCount: knowledgePoints.length,
    availableQuestionTypeOptions: Object.freeze(availableQuestionTypeOptions.map(Object.freeze)),
    questionType,
    compatiblePatternGroups: Object.freeze(compatiblePatternGroups.map((group) => Object.freeze({
      knowledgePointId: group.knowledgePointId,
      knowledgePointDisplayName: group.knowledgePointDisplayName,
      patternGroupId: group.patternGroupId,
      patternSpecIds: Object.freeze([...(group.patternSpecIds ?? [])]),
      effectiveQuestionType: group.effectiveQuestionType,
      uiQuestionType: group.uiQuestionType,
      displayLabel: group.displayLabel,
      selected: group.selected,
    }))),
    compatiblePatternGroupIds: Object.freeze(compatiblePatternGroupIds),
    selectedCompatiblePatternGroupIds: Object.freeze(selectedCompatiblePatternGroupIds),
    depthOptions: Object.freeze(depthOptions.map(Object.freeze)),
    contextOptions: Object.freeze(contextOptions.map(Object.freeze)),
    questionCount: PUBLIC_UI_SAFE_QUESTION_COUNT,
    capacityStatus: "FAIL_CLOSED_PENDING_PGC_R03",
    blocked: blockedReasons.length > 0,
    blockedReasons: Object.freeze(blockedReasons),
  });
}

export function auditPublicUiCapabilityBinding() {
  const errors = [];
  const surfaces = Object.values(PUBLIC_UI_SURFACES);
  let caseCount = 0;
  for (const source of [...new Set(listVisibleBatchAKnowledgePoints().map((entry) => entry.sourceId))]) {
    const visible = visibleKpsForSource(source);
    for (const surfaceId of surfaces) {
      const sourceUnit = resolvePublicUiCapabilityBinding({ sourceId: source, surfaceId });
      caseCount += 1;
      if (sourceUnit.blocked) errors.push(`${source}|${surfaceId}|sourceUnit:${sourceUnit.blockedReasons.join("|")}`);
      for (const kp of visible) {
        const single = resolvePublicUiCapabilityBinding({
          sourceId: source,
          surfaceId,
          selectionMode: SINGLE_KP_MODE,
          selectedKnowledgePointIds: [kp.knowledgePointId],
        });
        caseCount += 1;
        if (single.blocked) errors.push(`${source}|${surfaceId}|${kp.knowledgePointId}:${single.blockedReasons.join("|")}`);
      }
      if (visible.length >= 2) {
        const mixed = resolvePublicUiCapabilityBinding({
          sourceId: source,
          surfaceId,
          selectionMode: SAME_UNIT_MIXED_MODE,
          selectedKnowledgePointIds: visible.map((kp) => kp.knowledgePointId),
        });
        caseCount += 1;
        if (mixed.blocked) errors.push(`${source}|${surfaceId}|mixed:${mixed.blockedReasons.join("|")}`);
      }
    }
  }
  return Object.freeze({ ok: errors.length === 0, caseCount, errors: Object.freeze(errors) });
}
