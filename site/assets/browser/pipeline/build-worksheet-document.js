import {
  buildWorksheetDocumentFromGeneratedItems,
  buildWorksheetDocumentFromPlan as buildCoreWorksheetDocumentFromPlan,
} from "./build-worksheet-document-core-closeout.js";
import {
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../../../modules/curriculum/registry/batch-a-selector-extension.js";
import { listW01PublicApplicationGroupsForKnowledgePoint } from "../../../modules/curriculum/registry/w01-public-application-groups.js";
import { listFifteenUnitPublicApplicationGroupsForKnowledgePoint } from "../../../modules/curriculum/registry/fifteen-unit-public-application-groups.js";
import { getBatchAWorksheetPlan, storeWorksheetResult } from "../state/config-state.js";

function groupLooksApplication(group) {
  const corpus = JSON.stringify({
    mode: group?.mode,
    publicQuestionMode: group?.publicQuestionMode,
    representationTag: group?.representationTag,
    representationTags: group?.representationTags,
    displayName: group?.displayName,
  }).toLowerCase();
  return corpus.includes("application") || corpus.includes("word_problem") || corpus.includes("應用題");
}

function resolveCloseoutApplicationPlan(publicPlan = {}) {
  if (publicPlan.questionMode !== "application") return publicPlan;
  if (Array.isArray(publicPlan.selectedPatternGroupIds) && publicPlan.selectedPatternGroupIds.length > 0) return publicPlan;

  const knowledgePoints = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === publicPlan.sourceId);
  const groups = knowledgePoints.flatMap((knowledgePoint) => [
    ...getVisiblePatternGroupsForKnowledgePoint(knowledgePoint.knowledgePointId),
    ...listW01PublicApplicationGroupsForKnowledgePoint(knowledgePoint.knowledgePointId),
    ...listFifteenUnitPublicApplicationGroupsForKnowledgePoint(knowledgePoint.knowledgePointId),
  ].filter(groupLooksApplication));
  const uniqueGroups = [...new Map(groups.map((group) => [group.patternGroupId, group])).values()];
  const selectedKnowledgePointIds = [...new Set(uniqueGroups.flatMap((group) => [
    group.primaryKnowledgePointId,
    ...(group.knowledgePointIds ?? []),
  ]).filter(Boolean))];
  if (uniqueGroups.length === 0 || selectedKnowledgePointIds.length === 0) return publicPlan;

  return {
    ...publicPlan,
    selectionMode: selectedKnowledgePointIds.length > 1 ? "mixedKnowledgePointsSameUnit" : "singleKnowledgePoint",
    selectedKnowledgePointIds,
    selectedPatternGroupIds: uniqueGroups.map((group) => group.patternGroupId),
  };
}

export function buildWorksheetDocumentFromPlan(publicPlan) {
  return buildCoreWorksheetDocumentFromPlan(resolveCloseoutApplicationPlan(publicPlan));
}

export function buildWorksheetDocumentFromState(state) {
  const plan = getBatchAWorksheetPlan(state);
  const result = buildWorksheetDocumentFromPlan(plan);
  storeWorksheetResult(state, result);
  return result;
}

export { buildWorksheetDocumentFromGeneratedItems };
