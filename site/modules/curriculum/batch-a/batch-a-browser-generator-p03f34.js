export * from "./batch-a-browser-generator-p03f33.js";
import { buildBatchABrowserPlan as baseBuild } from "./batch-a-browser-generator-p03f33.js";
import { getBatchASourceUnit } from "./source-units.js";
import {
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
  resolveVisiblePatternSpecIdsForKnowledgePoint,
} from "../registry/batch-a-selector-p03f34-extension.js";
import {
  G4A_U09_P03F34_KP_ID,
  G4A_U09_P03F34_PATTERN_GROUP_ID,
  G4A_U09_P03F34_PATTERN_SPEC_ID,
  G4A_U09_P03F34_SOURCE_ID,
} from "../registry/g4a-u09-rank9-missing-digit-inequality-selector-projection-p03f34.js";

const unique=(values=[])=>[...new Set(values.filter(Boolean))];
const sourceRows=()=>listVisibleBatchAKnowledgePoints().filter((row)=>row.sourceId===G4A_U09_P03F34_SOURCE_ID);
const allowedSpecIds=()=>unique(sourceRows().flatMap((row)=>resolveVisiblePatternSpecIdsForKnowledgePoint(row.knowledgePointId,"numeric")));
const allowedGroupIds=()=>unique(sourceRows().flatMap((row)=>getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId).map((group)=>group.patternGroupId)));
const has=(values,value)=>Array.isArray(values)&&values.includes(value);
export function requestsP03F34(options={}){
  return options.sourceId===G4A_U09_P03F34_SOURCE_ID&&(
    has(options.selectedKnowledgePointIds,G4A_U09_P03F34_KP_ID)
    ||has(options.selectedPatternGroupIds,G4A_U09_P03F34_PATTERN_GROUP_ID)
    ||has(options.patternSpecIds,G4A_U09_P03F34_PATTERN_SPEC_ID)
  );
}
function resolveRequestedPatternSpecIds(options={}){
  const allowed=new Set(allowedSpecIds());
  if(Array.isArray(options.patternSpecIds)&&options.patternSpecIds.includes(G4A_U09_P03F34_PATTERN_SPEC_ID)) return unique(options.patternSpecIds.filter((id)=>allowed.has(id)));
  if(Array.isArray(options.selectedPatternGroupIds)&&options.selectedPatternGroupIds.includes(G4A_U09_P03F34_PATTERN_GROUP_ID)){
    const requested=new Set(options.selectedPatternGroupIds);
    return unique(sourceRows().flatMap((row)=>getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId).filter((group)=>requested.has(group.patternGroupId)).flatMap((group)=>group.patternSpecIds)).filter((id)=>allowed.has(id)));
  }
  if(Array.isArray(options.selectedKnowledgePointIds)&&options.selectedKnowledgePointIds.includes(G4A_U09_P03F34_KP_ID)){
    const selected=new Set(options.selectedKnowledgePointIds);
    return unique(sourceRows().filter((row)=>selected.has(row.knowledgePointId)).flatMap((row)=>resolveVisiblePatternSpecIdsForKnowledgePoint(row.knowledgePointId,"numeric")).filter((id)=>allowed.has(id)));
  }
  return [G4A_U09_P03F34_PATTERN_SPEC_ID];
}
export function buildBatchABrowserPlan(options={}){
  const plan=baseBuild(options);
  if(!requestsP03F34(options)) return plan;
  const patternSpecIds=resolveRequestedPatternSpecIds(options);
  const rows=sourceRows();
  const rowIds=new Set(rows.map((row)=>row.knowledgePointId));
  const groups=new Set(allowedGroupIds());
  const requestedKnowledgePointIds=unique((options.selectedKnowledgePointIds??[]).filter((id)=>rowIds.has(id)));
  const requestedPatternGroupIds=unique((options.selectedPatternGroupIds??[]).filter((id)=>groups.has(id)));
  return {...plan,
    sourceId:G4A_U09_P03F34_SOURCE_ID,
    sourceUnit:{...(getBatchASourceUnit(G4A_U09_P03F34_SOURCE_ID)??{sourceId:G4A_U09_P03F34_SOURCE_ID,grade:4,semester:"upper",unitCode:"4A-U09",title:"2位小數",domain:"decimal_hundredths"})},
    patternSpecIds,
    allocation:null,
    questionMode:"numeric",
    requestedKnowledgePointIds:requestedKnowledgePointIds.length?requestedKnowledgePointIds:[G4A_U09_P03F34_KP_ID],
    requestedPatternGroupIds:requestedPatternGroupIds.length?requestedPatternGroupIds:[G4A_U09_P03F34_PATTERN_GROUP_ID],
    publicControls:{sourceId:G4A_U09_P03F34_SOURCE_ID,questionMode:"numeric",productWave:"R05-W3",productAdmissionTask:"P03F_W3DirectProductVerticalSlice034Implementation",publicDropdownCutoverTask:"P03F_W3DirectProductVerticalSlice034Implementation",globalContextAuthority:"NOT_APPLICABLE"},
    publicPatternSpecInjectionUsed:false,
    genericFallbackAllowed:false,
  };
}
