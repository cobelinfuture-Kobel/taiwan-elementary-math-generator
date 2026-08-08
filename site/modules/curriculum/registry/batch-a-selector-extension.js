export * from "./batch-a-selector-p01e-extension.js";

import * as historical from "./batch-a-selector-p01e-extension.js";
import * as current from "./batch-a-selector-p03f29-extension.js";

// Earlier inventory milestones run in Node and retain the exact P01E selector snapshot.
// The actual Classic browser consumes the bounded P03F29 successor without mutating those histories.
const currentBrowserSelectorActive = () => typeof document !== "undefined";

export const BATCH_A_SELECTOR_AVAILABILITY = currentBrowserSelectorActive()
  ? current.BATCH_A_SELECTOR_AVAILABILITY
  : historical.BATCH_A_SELECTOR_AVAILABILITY;
export function listVisibleBatchAKnowledgePoints() { return currentBrowserSelectorActive() ? current.listVisibleBatchAKnowledgePoints() : historical.listVisibleBatchAKnowledgePoints(); }
export function listBatchAKnowledgePointAvailabilityBySource(sourceId) { return currentBrowserSelectorActive() ? current.listBatchAKnowledgePointAvailabilityBySource(sourceId) : historical.listBatchAKnowledgePointAvailabilityBySource(sourceId); }
export function getVisibleBatchAKnowledgePoint(knowledgePointId) { return currentBrowserSelectorActive() ? current.getVisibleBatchAKnowledgePoint(knowledgePointId) : historical.getVisibleBatchAKnowledgePoint(knowledgePointId); }
export function getVisiblePatternGroupsForKnowledgePoint(knowledgePointId) { return currentBrowserSelectorActive() ? current.getVisiblePatternGroupsForKnowledgePoint(knowledgePointId) : historical.getVisiblePatternGroupsForKnowledgePoint(knowledgePointId); }
export function resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId, mode = null) { return currentBrowserSelectorActive() ? current.resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId, mode) : historical.resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId, mode); }
export {
  BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA as P01D2_BASE_SELECTOR_COMPOSER_METADATA,
  BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA as P01D3_BASE_SELECTOR_COMPOSER_METADATA,
  BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA as P01E_BASE_SELECTOR_COMPOSER_METADATA,
} from "./batch-a-selector-composer.js";
