export * from "./batch-a-selector-p03f48-extension.js";
import {listVisibleBatchAKnowledgePoints as baseList,getVisiblePatternGroupsForKnowledgePoint as baseGroups,resolveVisiblePatternSpecIdsForKnowledgePoint as baseSpecs,getBatchAPublicSelectorStats as baseStats} from "./batch-a-selector-p03f48-extension.js";
import {G5B_U04_P03F49_SOURCE_ID,listG5BU04P03F49SelectorRows,listG5BU04P03F49PatternGroups,resolveG5BU04P03F49PatternSpecIds,auditG5BU04P03F49SelectorProjection} from "./g5b-u04-rank11-application-estimation-selector-projection-p03f49.js";
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const addedRows=listG5BU04P03F49SelectorRows();
export function listVisibleBatchAKnowledgePoints(){return[...baseList().map(clone),...addedRows.map(clone)];}
export function getVisiblePatternGroupsForKnowledgePoint(id){const own=listG5BU04P03F49PatternGroups(id);return own.length?own:baseGroups(id);}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(id,mode="numeric"){const own=resolveG5BU04P03F49PatternSpecIds(id);return own.length&&mode==="numeric"?own:baseSpecs(id,mode);}
export function getBatchAPublicSelectorStats(){const base=baseStats();return Object.freeze({...base,publicSourceCount:33,sourceCount:33,visibleKnowledgePointCount:251,knowledgePointCount:251});}
export function getG5BU04P03F49Availability(){return Object.freeze({sourceId:G5B_U04_P03F49_SOURCE_ID,visibleKnowledgePointCount:5,hiddenKnowledgePointCount:0,notSelectableKnowledgePointCount:0});}
export function auditP03F49PublicSelectorComposition(){const projection=auditG5BU04P03F49SelectorProjection(),rows=listVisibleBatchAKnowledgePoints(),errors=[...projection.errors];if(rows.length!==251)errors.push("P03F49_PUBLIC_KP_COUNT_INVALID");if(new Set(rows.map(row=>row.knowledgePointId)).size!==251)errors.push("P03F49_PUBLIC_KP_DUPLICATE");const g5b=rows.filter(row=>row.sourceId===G5B_U04_P03F49_SOURCE_ID);if(g5b.length!==5)errors.push("P03F49_G5B_U04_VISIBLE_COUNT_INVALID");return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({sources:33,knowledgePoints:251,g5bU04Visible:5,g5bU04Hidden:0,g5bU04NotSelectable:0})});}
