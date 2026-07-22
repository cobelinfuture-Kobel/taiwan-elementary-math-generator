import {
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint
} from "../../../modules/curriculum/registry/batch-a-selector-extension.js";
import {
  listW01PublicApplicationGroupsForKnowledgePoint,
} from "../../../modules/curriculum/registry/w01-public-application-groups.js";

const SOURCE_UNIT_MODE = "sourceUnit";

export const PUBLIC_PATTERN_GROUP_WARNING_CODES = Object.freeze({
  PATTERN_GROUP_DROPPED: "public_pattern_group_dropped",
  PATTERN_GROUP_DEFAULTED: "public_pattern_group_defaulted",
  PATTERN_GROUP_MINIMUM_ONE: "public_pattern_group_minimum_one"
});

function uniqueStrings(values) {
  return [...new Set((Array.isArray(values) ? values : [])
    .map((value) => String(value ?? "").trim())
    .filter(Boolean))];
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function groupsForKnowledgePoint(knowledgePointId) {
  return [
    ...getVisiblePatternGroupsForKnowledgePoint(knowledgePointId),
    ...listW01PublicApplicationGroupsForKnowledgePoint(knowledgePointId),
  ]
    .filter((group) => group?.visibilityStatus === "visible" || group?.visibilityStatus === undefined);
}

export function getPublicPatternGroupDisplayLabel(group = {}) {
  if (group.globalContextAdmission === "POSTG-APP-W01-A06E") return "全域情境應用題";
  if (group.representationTag === "numeric") return "計算題";
  if (group.representationTag === "application_word_problem") return "應用題";
  return String(group.displayName ?? "題目形式");
}

export function listPublicPatternGroupChoices(selectedKnowledgePointIds = []) {
  const choices = [];
  for (const knowledgePointId of uniqueStrings(selectedKnowledgePointIds)) {
    const knowledgePoint = getVisibleBatchAKnowledgePoint(knowledgePointId);
    if (!knowledgePoint) continue;
    const groups = groupsForKnowledgePoint(knowledgePointId);
    for (const group of groups) {
      choices.push({
        ...clone(group),
        knowledgePointId,
        knowledgePointDisplayName: knowledgePoint.displayName,
        displayLabel: getPublicPatternGroupDisplayLabel(group),
        hasRepresentationChoice: groups.length > 1
      });
    }
  }
  return choices;
}

export function normalizePublicPatternGroupSelection({
  selectionMode = SOURCE_UNIT_MODE,
  selectedKnowledgePointIds = [],
  selectedPatternGroupIds = []
} = {}) {
  const knowledgePointIds = uniqueStrings(selectedKnowledgePointIds)
    .filter((knowledgePointId) => getVisibleBatchAKnowledgePoint(knowledgePointId));
  if (selectionMode === SOURCE_UNIT_MODE || knowledgePointIds.length === 0) {
    return Object.freeze({
      selectedPatternGroupIds: Object.freeze([]),
      choices: Object.freeze([]),
      warnings: Object.freeze([])
    });
  }

  const requestedIds = uniqueStrings(selectedPatternGroupIds);
  const choices = listPublicPatternGroupChoices(knowledgePointIds);
  const linkedIds = new Set(choices.map((choice) => choice.patternGroupId));
  const warnings = [];
  const selectedIds = [];

  const droppedIds = requestedIds.filter((patternGroupId) => !linkedIds.has(patternGroupId));
  if (droppedIds.length > 0) {
    warnings.push({
      code: PUBLIC_PATTERN_GROUP_WARNING_CODES.PATTERN_GROUP_DROPPED,
      count: droppedIds.length
    });
  }

  for (const knowledgePointId of knowledgePointIds) {
    const groups = choices.filter((choice) => choice.knowledgePointId === knowledgePointId);
    const requestedForKnowledgePoint = groups
      .filter((group) => requestedIds.includes(group.patternGroupId))
      .map((group) => group.patternGroupId);
    if (requestedForKnowledgePoint.length > 0) {
      selectedIds.push(...requestedForKnowledgePoint);
      continue;
    }
    const defaultGroupId = groups[0]?.patternGroupId ?? null;
    if (defaultGroupId) {
      selectedIds.push(defaultGroupId);
      if (requestedIds.length > 0) {
        warnings.push({
          code: PUBLIC_PATTERN_GROUP_WARNING_CODES.PATTERN_GROUP_DEFAULTED,
          knowledgePointId
        });
      }
    }
  }

  const selectedSet = new Set(selectedIds);
  const annotatedChoices = choices.map((choice) => Object.freeze({
    ...choice,
    selected: selectedSet.has(choice.patternGroupId),
    canDeselect: choices.filter((candidate) => (
      candidate.knowledgePointId === choice.knowledgePointId
      && selectedSet.has(candidate.patternGroupId)
    )).length > 1
  }));

  return Object.freeze({
    selectedPatternGroupIds: Object.freeze([...selectedSet]),
    choices: Object.freeze(annotatedChoices),
    warnings: Object.freeze(warnings)
  });
}

export function togglePublicPatternGroupSelection({
  selectionMode,
  selectedKnowledgePointIds = [],
  selectedPatternGroupIds = [],
  patternGroupId
} = {}) {
  const normalized = normalizePublicPatternGroupSelection({
    selectionMode,
    selectedKnowledgePointIds,
    selectedPatternGroupIds
  });
  const target = normalized.choices.find((choice) => choice.patternGroupId === patternGroupId);
  if (!target) return normalized;

  const selected = new Set(normalized.selectedPatternGroupIds);
  if (selected.has(patternGroupId)) {
    const selectedForKnowledgePoint = normalized.choices.filter((choice) => (
      choice.knowledgePointId === target.knowledgePointId
      && selected.has(choice.patternGroupId)
    ));
    if (selectedForKnowledgePoint.length <= 1) {
      return Object.freeze({
        ...normalized,
        warnings: Object.freeze([{
          code: PUBLIC_PATTERN_GROUP_WARNING_CODES.PATTERN_GROUP_MINIMUM_ONE,
          knowledgePointId: target.knowledgePointId
        }])
      });
    }
    selected.delete(patternGroupId);
  } else {
    selected.add(patternGroupId);
  }

  return normalizePublicPatternGroupSelection({
    selectionMode,
    selectedKnowledgePointIds,
    selectedPatternGroupIds: [...selected]
  });
}
