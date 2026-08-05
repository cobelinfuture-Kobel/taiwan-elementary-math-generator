import {
  getVisiblePatternGroupsForKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
} from "../registry/batch-a-selector-p03f23-extension.js";
import { getFullProductPublicControlProfile } from "../registry/full-product-public-control-profiles.js";
import { listW01PublicApplicationGroupsForKnowledgePoint } from "../registry/w01-public-application-groups.js";
import { listFifteenUnitPublicApplicationGroupsForKnowledgePoint } from "../registry/fifteen-unit-public-application-groups.js";
import { listW1FullProductPublicApplicationGroupsForKnowledgePoint } from "../registry/w1-full-product-public-application-groups.js";
import {
  PUBLIC_GENERATOR_CAPACITY_REGISTRY_STATUS,
  PUBLIC_GENERATOR_CAPACITY_ROWS,
} from "./public-generator-capacity-registry.js";
import { isFifteenUnitPublicPblSource } from "./fifteen-unit-public-pbl-runtime.js";

export const PUBLIC_UI_SURFACES = Object.freeze({
  CLASSIC: "CLASSIC",
  FALLBACK_404: "FALLBACK_404",
  PIXEL: "PIXEL",
});

export const PUBLIC_UI_SAFE_QUESTION_COUNT = Object.freeze({
  min: 1,
  default: 20,
  max: 240,
  evidence: "PGC_R03_GLOBAL_PUBLIC_HARD_CEILING",
});

const SOURCE_UNIT_MODE = "sourceUnit";
const SINGLE_KP_MODE = "singleKnowledgePoint";
const SAME_UNIT_MIXED_MODE = "mixedKnowledgePointsSameUnit";
const P03F21_SOURCE_ID = "g5a_u01_5a01";
const P03F21_KP_ID = "kp_g5a_u01_decimal_read_place";
const CAPACITY_REGISTRY_READY = PUBLIC_GENERATOR_CAPACITY_ROWS.length > 0
  && PUBLIC_GENERATOR_CAPACITY_REGISTRY_STATUS !== "PENDING_PGC_R03";

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function uniqueStrings(values = []) {
  return [...new Set((Array.isArray(values) ? values : []).map((value) => String(value ?? "").trim()).filter(Boolean))];
}

function sortedKey(values = []) {
  return uniqueStrings(values).sort().join("|");
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

function decodeCapacityRow(row) {
  return {
    sourceId: row[0],
    selectionMode: row[1],
    selectedKnowledgePointKey: row[2],
    questionType: row[3],
    publicPatternGroupKey: row[4],
    depthMode: row[5] || null,
    contextMode: row[6] || null,
    verifiedMaxQuestionCount: Number(row[7] ?? 0),
    legalRoute: row[8] === "LEGAL",
    qualityStatus: row[9] ?? "UNKNOWN",
    routeId: row[10] ?? null,
  };
}

const CAPACITY_ROWS = CAPACITY_REGISTRY_READY
  ? PUBLIC_GENERATOR_CAPACITY_ROWS.map(decodeCapacityRow)
  : [];

function capacityRowsForCase({ sourceId, selectionMode, selectedKnowledgePointIds, questionType }) {
  if (!CAPACITY_REGISTRY_READY) return [];
  const kpKey = selectionMode === SOURCE_UNIT_MODE ? "" : sortedKey(selectedKnowledgePointIds);
  return CAPACITY_ROWS.filter((row) => row.sourceId === sourceId
    && row.selectionMode === selectionMode
    && row.selectedKnowledgePointKey === kpKey
    && row.questionType === questionType
    && row.legalRoute
    && row.verifiedMaxQuestionCount > 0);
}

function isP03F21StructuralFallback({ sourceId, selectionMode, selectedKnowledgePointIds, questionType }) {
  if (sourceId !== P03F21_SOURCE_ID || questionType !== "numeric") return false;
  if (selectionMode === SOURCE_UNIT_MODE) return true;
  return selectionMode === SINGLE_KP_MODE
    && selectedKnowledgePointIds.length === 1
    && selectedKnowledgePointIds[0] === P03F21_KP_ID;
}

function rowsForSelectedGroups(rows, selectedPatternGroupIds) {
  const requested = uniqueStrings(selectedPatternGroupIds);
  if (requested.length === 0) return rows;
  const requestedSet = new Set(requested);
  const exactKey = sortedKey(requested);
  const exact = rows.filter((row) => row.publicPatternGroupKey === exactKey);
  if (exact.length > 0) return exact;
  return rows.filter((row) => {
    const groupSet = new Set(uniqueStrings(row.publicPatternGroupKey.split("|")));
    return [...requestedSet].every((groupId) => groupSet.has(groupId));
  });
}

function optionSubset(options, values) {
  const allowed = new Set(values.filter(Boolean));
  return options.filter((option) => allowed.has(option.value));
}

function chooseValue(requested, options) {
  const values = new Set(options.map((option) => option.value));
  if (values.has(requested)) return requested;
  return options[0]?.value ?? null;
}

function capacityResolution({
  sourceId,
  selectionMode,
  selectedKnowledgePointIds,
  selectedPatternGroupIds,
  questionType,
  requestedDepthMode,
  requestedContextMode,
  profile,
}) {
  if (!CAPACITY_REGISTRY_READY) {
    return {
      registryReady: false,
      legalRows: [],
      depthOptions: depthBearing(questionType) ? profileOptions(profile?.reasoningDepthControl) : [],
      contextOptions: contextBearing(questionType) ? profileOptions(profile?.contextControl) : [],
      depthMode: requestedDepthMode ?? null,
      contextMode: requestedContextMode ?? null,
      questionCount: PUBLIC_UI_SAFE_QUESTION_COUNT,
      capacityStatus: "FAIL_CLOSED_PENDING_PGC_R03",
      qualityStatuses: [],
      routeIds: [],
    };
  }

  if (isP03F21StructuralFallback({ sourceId, selectionMode, selectedKnowledgePointIds, questionType })) {
    return {
      registryReady: true,
      structuralFallback: true,
      legalRows: [],
      depthOptions: [],
      contextOptions: [],
      depthMode: null,
      contextMode: null,
      questionCount: Object.freeze({ min: 1, default: 20, max: 240, evidence: "P03F21_DETERMINISTIC_240_UNIQUE_STRUCTURAL_FALLBACK" }),
      capacityStatus: "STRUCTURAL_FALLBACK_AVAILABLE",
      qualityStatuses: ["P03F21_DETERMINISTIC_240_UNIQUE"],
      routeIds: ["p03f21_g5a_u01_decimal_read_place_numeric_20"],
    };
  }

  const caseRows = capacityRowsForCase({ sourceId, selectionMode, selectedKnowledgePointIds, questionType });
  const groupRows = rowsForSelectedGroups(caseRows, selectedPatternGroupIds);
  const profileDepth = depthBearing(questionType) ? profileOptions(profile?.reasoningDepthControl) : [];
  const profileContext = contextBearing(questionType) ? profileOptions(profile?.contextControl) : [];

  const depthCandidateRows = requestedContextMode
    ? groupRows.filter((row) => row.contextMode === requestedContextMode)
    : groupRows;
  const depthValues = uniqueStrings(depthCandidateRows.map((row) => row.depthMode));
  const depthOptions = profileDepth.length > 0 ? optionSubset(profileDepth, depthValues) : [];
  const depthMode = chooseValue(requestedDepthMode, depthOptions);

  const contextCandidateRows = depthMode
    ? groupRows.filter((row) => row.depthMode === depthMode)
    : groupRows;
  const contextValues = uniqueStrings(contextCandidateRows.map((row) => row.contextMode));
  const contextOptions = profileContext.length > 0 ? optionSubset(profileContext, contextValues) : [];
  const contextMode = chooseValue(requestedContextMode, contextOptions);

  const exactRows = groupRows.filter((row) => {
    const depthMatches = depthOptions.length === 0 ? row.depthMode == null : row.depthMode === depthMode;
    const contextMatches = contextOptions.length === 0 ? row.contextMode == null : row.contextMode === contextMode;
    return depthMatches && contextMatches;
  });
  const legalRows = exactRows.length > 0 ? exactRows : groupRows;
  const routeVerifiedMax = legalRows.length > 0
    ? Math.min(...legalRows.map((row) => row.verifiedMaxQuestionCount))
    : 0;
  const verifiedMax = routeVerifiedMax > 0 ? PUBLIC_UI_SAFE_QUESTION_COUNT.max : 0;
  const boundedMax = Number.isInteger(verifiedMax) && verifiedMax > 0 ? verifiedMax : 0;
  const questionCount = boundedMax > 0
    ? Object.freeze({
      min: PUBLIC_UI_SAFE_QUESTION_COUNT.min,
      default: Math.min(PUBLIC_UI_SAFE_QUESTION_COUNT.default, boundedMax),
      max: boundedMax,
      evidence: "PUBLIC_GLOBAL_QUESTION_COUNT_MAX_240",
    })
    : Object.freeze({ min: 0, default: 0, max: 0, evidence: "PGC_R03_NO_LEGAL_CAPACITY" });

  return {
    registryReady: true,
    legalRows,
    depthOptions,
    contextOptions,
    depthMode,
    contextMode,
    questionCount,
    capacityStatus: boundedMax === PUBLIC_UI_SAFE_QUESTION_COUNT.max ? "VERIFIED_LIMITED" : boundedMax > 0 ? "VERIFIED_LIMITED" : "FAIL_CLOSED_NO_LEGAL_CAPACITY",
    qualityStatuses: uniqueStrings(legalRows.map((row) => row.qualityStatus)),
    routeIds: uniqueStrings(legalRows.map((row) => row.routeId)),
  };
}

function hasLegalCapacityForType(input, questionType) {
  if (!CAPACITY_REGISTRY_READY) return true;
  if (isP03F21StructuralFallback({ ...input, questionType })) return true;
  const rows = capacityRowsForCase({ ...input, questionType });
  return rows.length > 0;
}

export function resolvePublicUiCapabilityBinding({
  sourceId,
  selectionMode = SOURCE_UNIT_MODE,
  selectedKnowledgePointIds = [],
  selectedPatternGroupIds = [],
  requestedQuestionType = null,
  requestedDepthMode = null,
  requestedContextMode = null,
  surfaceId = PUBLIC_UI_SURFACES.CLASSIC,
} = {}) {
  const profile = getFullProductPublicControlProfile(sourceId);
  const knowledgePoints = selectedKnowledgePoints({ sourceId, selectionMode, selectedKnowledgePointIds });
  const normalizedKnowledgePointIds = knowledgePoints.map((entry) => entry.knowledgePointId);
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
  const capacityCaseInput = { sourceId, selectionMode, selectedKnowledgePointIds: normalizedKnowledgePointIds };
  const availableQuestionTypeOptions = profileQuestionOptions.filter((option) => {
    const structurallyAvailable = option.value === "pbl"
      ? selectionMode === SOURCE_UNIT_MODE && isFifteenUnitPublicPblSource(sourceId)
      : option.value === "mixed"
        ? annotatedGroups.some((group) => group.uiQuestionType !== null && group.effectiveQuestionType !== "pbl")
        : annotatedGroups.some((group) => group.uiQuestionType === option.value);
    return structurallyAvailable && hasLegalCapacityForType(capacityCaseInput, option.value);
  });

  const availableQuestionTypeValues = new Set(availableQuestionTypeOptions.map((option) => option.value));
  const defaultQuestionType = availableQuestionTypeValues.has(profile?.questionTypeControl?.defaultValue)
    ? profile.questionTypeControl.defaultValue
    : availableQuestionTypeOptions[0]?.value ?? null;
  const questionType = availableQuestionTypeValues.has(requestedQuestionType)
    ? requestedQuestionType
    : defaultQuestionType;

  const capacity = capacityResolution({
    sourceId,
    selectionMode,
    selectedKnowledgePointIds: normalizedKnowledgePointIds,
    selectedPatternGroupIds,
    questionType: questionType ?? "",
    requestedDepthMode,
    requestedContextMode,
    profile,
  });

  const legalCapacityRows = CAPACITY_REGISTRY_READY
    ? capacityRowsForCase({
      sourceId,
      selectionMode,
      selectedKnowledgePointIds: normalizedKnowledgePointIds,
      questionType,
    })
    : [];
  const wholeCaseCapacity = legalCapacityRows.some((row) => !row.publicPatternGroupKey);
  const legalPublicGroupIds = CAPACITY_REGISTRY_READY && !wholeCaseCapacity && !capacity.structuralFallback
    ? new Set(legalCapacityRows.flatMap((row) => uniqueStrings(row.publicPatternGroupKey.split("|"))))
    : null;

  const compatiblePatternGroups = questionType === "pbl"
    ? []
    : annotatedGroups.filter((group) => {
      const typeMatches = questionType === "mixed" ? group.uiQuestionType !== null : group.uiQuestionType === questionType;
      return typeMatches && (!legalPublicGroupIds || legalPublicGroupIds.has(group.patternGroupId));
    });
  const compatiblePatternGroupIds = uniqueStrings(compatiblePatternGroups.map((group) => group.patternGroupId));
  const selectedCompatiblePatternGroupIds = uniqueStrings(
    compatiblePatternGroups.filter((group) => group.selected).map((group) => group.patternGroupId),
  );

  const blockedReasons = [];
  if (!profile) blockedReasons.push("PUBLIC_CONTROL_PROFILE_MISSING");
  if (knowledgePoints.length === 0) blockedReasons.push("VISIBLE_KNOWLEDGE_POINT_MISSING");
  if (availableQuestionTypeOptions.length === 0) blockedReasons.push("COMPATIBLE_QUESTION_TYPE_MISSING");
  if (questionType !== "pbl" && compatiblePatternGroups.length === 0) blockedReasons.push("COMPATIBLE_PATTERN_GROUP_MISSING");
  if (capacity.registryReady && capacity.questionCount.max <= 0) blockedReasons.push("PUBLIC_CAPACITY_ROUTE_UNAVAILABLE");

  return Object.freeze({
    sourceId,
    surfaceId,
    selectionMode,
    availableSelectionModes: Object.freeze(availableSelectionModes(sourceId)),
    selectedKnowledgePointIds: Object.freeze(normalizedKnowledgePointIds),
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
    depthOptions: Object.freeze(capacity.depthOptions.map(Object.freeze)),
    contextOptions: Object.freeze(capacity.contextOptions.map(Object.freeze)),
    depthMode: capacity.depthMode,
    contextMode: capacity.contextMode,
    questionCount: capacity.questionCount,
    capacityStatus: capacity.capacityStatus,
    capacityRegistryStatus: PUBLIC_GENERATOR_CAPACITY_REGISTRY_STATUS,
    capacityRouteIds: Object.freeze(capacity.routeIds),
    capacityQualityStatuses: Object.freeze(capacity.qualityStatuses),
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
