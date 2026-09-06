export * from "./batch-a-selector-p04f33-base.js";
import * as base from "./batch-a-selector-p04f33-base.js";
import * as current from "./batch-a-selector-p05f10-extension.js";
const currentBrowserSelectorActive=()=>typeof document!=="undefined";
export const BATCH_A_SELECTOR_AVAILABILITY=currentBrowserSelectorActive()?current.BATCH_A_SELECTOR_AVAILABILITY:base.BATCH_A_SELECTOR_AVAILABILITY;
export function listVisibleBatchAKnowledgePoints(){return currentBrowserSelectorActive()?current.listVisibleBatchAKnowledgePoints():base.listVisibleBatchAKnowledgePoints();}
export function listBatchAKnowledgePointAvailabilityBySource(sourceId){return currentBrowserSelectorActive()?current.listBatchAKnowledgePointAvailabilityBySource(sourceId):base.listBatchAKnowledgePointAvailabilityBySource(sourceId);}
export function getVisibleBatchAKnowledgePoint(id){return currentBrowserSelectorActive()?current.getVisibleBatchAKnowledgePoint(id):base.getVisibleBatchAKnowledgePoint(id);}
export function getVisiblePatternGroupsForKnowledgePoint(id){return currentBrowserSelectorActive()?current.getVisiblePatternGroupsForKnowledgePoint(id):base.getVisiblePatternGroupsForKnowledgePoint(id);}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode=null){return currentBrowserSelectorActive()?current.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode):base.resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode);}
