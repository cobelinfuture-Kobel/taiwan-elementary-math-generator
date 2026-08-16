export * from "./batch-a-browser-generator-p03f40.js";
import {buildBatchABrowserPlan as baseBuild} from "./batch-a-browser-generator-p03f40.js";
import {getBatchASourceUnit} from "./source-units.js";
import {getVisiblePatternGroupsForKnowledgePoint,listVisibleBatchAKnowledgePoints,resolveVisiblePatternSpecIdsForKnowledgePoint} from "../registry/batch-a-selector-p03f41-extension.js";
import {G6B_U01_P03F41_GROUP_ID,G6B_U01_P03F41_KP_ID,G6B_U01_P03F41_SOURCE_ID,G6B_U01_P03F41_SPEC_ID} from "../registry/g6b-u01-rank9-mixed-domain-order-selector-projection-p03f41.js";
const unique=(values=[])=>[...new Set(values.filter(Boolean))];
const intersects=(values,targets)=>Array.isArray(values)&&values.some(value=>targets.includes(value));
const sourceRows=()=>listVisibleBatchAKnowledgePoints().filter(row=>row.sourceId===G6B_U01_P03F41_SOURCE_ID);
const allowedSpecIds=()=>unique(sourceRows().flatMap(row=>resolveVisiblePatternSpecIdsForKnowledgePoint(row.knowledgePointId,"numeric")));
const allowedGroupIds=()=>unique(sourceRows().flatMap(row=>getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId).filter(group=>group.publicQuestionMode==="numeric"||group.mode==="numeric").map(group=>group.patternGroupId)));
export function requestsP03F41(options={}){return options.sourceId===G6B_U01_P03F41_SOURCE_ID&&(options.selectionMode==="sourceUnit"||intersects(options.selectedKnowledgePointIds,[G6B_U01_P03F41_KP_ID])||intersects(options.patternSpecIds,[G6B_U01_P03F41_SPEC_ID])||intersects(options.selectedPatternGroupIds,[G6B_U01_P03F41_GROUP_ID]));}
function resolveRequestedPatternSpecIds(options={}){
  const allowed=new Set(allowedSpecIds());
  if(Array.isArray(options.patternSpecIds)){const ids=unique(options.patternSpecIds.filter(id=>allowed.has(id)));if(ids.length&&(ids.includes(G6B_U01_P03F41_SPEC_ID)||options.selectionMode==="sourceUnit"))return ids;}
  if(Array.isArray(options.selectedPatternGroupIds)&&options.selectedPatternGroupIds.length){const requested=new Set(options.selectedPatternGroupIds);const ids=unique(sourceRows().flatMap(row=>getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId).filter(group=>requested.has(group.patternGroupId)&&(group.publicQuestionMode==="numeric"||group.mode==="numeric")).flatMap(group=>group.patternSpecIds)).filter(id=>allowed.has(id)));if(ids.includes(G6B_U01_P03F41_SPEC_ID))return ids;}
  if(Array.isArray(options.selectedKnowledgePointIds)&&options.selectedKnowledgePointIds.length){const selected=new Set(options.selectedKnowledgePointIds);const ids=unique(sourceRows().filter(row=>selected.has(row.knowledgePointId)).flatMap(row=>resolveVisiblePatternSpecIdsForKnowledgePoint(row.knowledgePointId,"numeric")).filter(id=>allowed.has(id)));if(ids.includes(G6B_U01_P03F41_SPEC_ID))return ids;}
  if(options.selectionMode==="sourceUnit")return allowedSpecIds();
  return[G6B_U01_P03F41_SPEC_ID];
}
export function buildBatchABrowserPlan(options={}){
  const plan=baseBuild(options);if(!requestsP03F41(options))return plan;
  const rows=sourceRows(),rowIds=new Set(rows.map(row=>row.knowledgePointId)),groups=new Set(allowedGroupIds());
  const requestedKnowledgePointIds=unique((options.selectedKnowledgePointIds??[]).filter(id=>rowIds.has(id)));
  const requestedPatternGroupIds=unique((options.selectedPatternGroupIds??[]).filter(id=>groups.has(id)));
  const patternSpecIds=resolveRequestedPatternSpecIds(options);
  return{...plan,sourceId:G6B_U01_P03F41_SOURCE_ID,sourceUnit:{...(getBatchASourceUnit(G6B_U01_P03F41_SOURCE_ID)??{sourceId:G6B_U01_P03F41_SOURCE_ID,grade:6,semester:"lower",unitCode:"6B-U01",title:"小數與分數的計算",domain:"mixed_decimal_fraction"})},patternSpecIds,allocation:null,questionMode:"numeric",requestedKnowledgePointIds:requestedKnowledgePointIds.length?requestedKnowledgePointIds:(options.selectionMode==="sourceUnit"?rows.map(row=>row.knowledgePointId):[G6B_U01_P03F41_KP_ID]),requestedPatternGroupIds,publicControls:{sourceId:G6B_U01_P03F41_SOURCE_ID,questionMode:"numeric",productWave:"R05-W3",productAdmissionTask:"P03F_W3DirectProductVerticalSlice041Implementation",publicDropdownCutoverTask:"P03F_W3DirectProductVerticalSlice041Implementation",globalContextAuthority:"NOT_APPLICABLE"},publicPatternSpecInjectionUsed:false,genericFallbackAllowed:false};
}
