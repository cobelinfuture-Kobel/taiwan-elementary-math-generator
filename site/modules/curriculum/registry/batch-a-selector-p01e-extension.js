export * from "./batch-a-selector-p01d3-extension.js";

import * as base from "./batch-a-selector-p01d3-extension.js";
import {
  listW1FullProductPublicApplicationGroupsForKnowledgePoint,
} from "./w1-full-product-public-application-groups.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const W1_SOURCE_IDS = new Set(["g5b_u05_5b05a", "g6a_u01_6a01", "g5a_u03_5a03a", "g5a_u03_5a03a1"]);

export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  publicSourceCutoverTask: "P01E_W1PublicUIHTMLPDFPrintCloseout",
  publicSourceCount: 19,
  w1ApplicationEligibleKnowledgePointCount: 13,
});

export function listVisibleBatchAKnowledgePoints() { return base.listVisibleBatchAKnowledgePoints(); }
export function listBatchAKnowledgePointAvailabilityBySource(sourceId) { return base.listBatchAKnowledgePointAvailabilityBySource(sourceId); }
export function getVisibleBatchAKnowledgePoint(knowledgePointId) { return base.getVisibleBatchAKnowledgePoint(knowledgePointId); }

export function getVisiblePatternGroupsForKnowledgePoint(knowledgePointId) {
  const numeric = base.getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
  const row = base.getVisibleBatchAKnowledgePoint(knowledgePointId);
  if (!row || !W1_SOURCE_IDS.has(row.sourceId)) return numeric;
  return clone([...numeric, ...listW1FullProductPublicApplicationGroupsForKnowledgePoint(knowledgePointId)]);
}

export function resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId) {
  return [...new Set(getVisiblePatternGroupsForKnowledgePoint(knowledgePointId).flatMap((group) => group.patternSpecIds ?? []))];
}

export function auditP01EPublicSelectorComposition() {
  const errors = [];
  const rows = listVisibleBatchAKnowledgePoints();
  const w1Rows = rows.filter((row) => W1_SOURCE_IDS.has(row.sourceId));
  const applicationRows = w1Rows.filter((row) => getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId).some((group) => group.publicQuestionMode === "application"));
  if (w1Rows.length !== 21) errors.push("P01E_W1_VISIBLE_KP_COUNT_INVALID");
  if (applicationRows.length !== 13) errors.push("P01E_W1_APPLICATION_KP_COUNT_INVALID");
  for (const row of w1Rows) {
    const groups = getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId);
    const numericCount = groups.filter((group) => group.publicQuestionMode === "numeric" || group.mode === "numeric").length;
    if (numericCount !== 1) errors.push(`P01E_W1_NUMERIC_GROUP_INVALID:${row.knowledgePointId}`);
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ w1KnowledgePoints: w1Rows.length, applicationEligibleKnowledgePoints: applicationRows.length, applicationIneligibleKnowledgePoints: w1Rows.length - applicationRows.length, publicSources: 19 }) });
}
