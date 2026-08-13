export * from "./batch-a-browser-generator-p03f32.js";
import { buildBatchABrowserPlan as baseBuild } from "./batch-a-browser-generator-p03f32.js";
import { getBatchASourceUnit } from "./source-units.js";
import {
  G4A_U06_P03F33_KP_IDS,
  G4A_U06_P03F33_NUMERIC_PATTERN_SPEC_IDS,
  G4A_U06_P03F33_PATTERN_GROUPS,
  G4A_U06_P03F33_SOURCE_ID,
  resolveG4AU06P03F33PatternSpecIds,
} from "../registry/g4a-u06-rank9-fraction-selector-projection-p03f33.js";
const GROUP_IDS=Object.freeze(G4A_U06_P03F33_PATTERN_GROUPS.map((group)=>group.patternGroupId));
const hasAny=(values,candidates)=>Array.isArray(values)&&values.some((value)=>candidates.includes(value));
export function requestsP03F33(options={}){ return options.sourceId===G4A_U06_P03F33_SOURCE_ID&&(hasAny(options.selectedKnowledgePointIds,G4A_U06_P03F33_KP_IDS)||hasAny(options.selectedPatternGroupIds,GROUP_IDS)||hasAny(options.patternSpecIds,G4A_U06_P03F33_NUMERIC_PATTERN_SPEC_IDS)); }
function resolveRequestedPatternSpecIds(options={}){
  if(Array.isArray(options.patternSpecIds)&&options.patternSpecIds.length) return options.patternSpecIds.filter((id)=>G4A_U06_P03F33_NUMERIC_PATTERN_SPEC_IDS.includes(id));
  if(Array.isArray(options.selectedPatternGroupIds)&&options.selectedPatternGroupIds.length) return G4A_U06_P03F33_PATTERN_GROUPS.filter((group)=>options.selectedPatternGroupIds.includes(group.patternGroupId)).flatMap((group)=>group.patternSpecIds);
  if(Array.isArray(options.selectedKnowledgePointIds)&&options.selectedKnowledgePointIds.length) return options.selectedKnowledgePointIds.filter((id)=>G4A_U06_P03F33_KP_IDS.includes(id)).flatMap((id)=>resolveG4AU06P03F33PatternSpecIds(id));
  return [];
}
export function buildBatchABrowserPlan(options={}){
  const plan=baseBuild(options); if(!requestsP03F33(options)) return plan; let patternSpecIds=[...new Set(resolveRequestedPatternSpecIds(options))]; if(patternSpecIds.length===0) patternSpecIds=[...G4A_U06_P03F33_NUMERIC_PATTERN_SPEC_IDS];
  const requestedKnowledgePointIds=(options.selectedKnowledgePointIds??[]).filter((id)=>G4A_U06_P03F33_KP_IDS.includes(id)); const requestedPatternGroupIds=(options.selectedPatternGroupIds??[]).filter((id)=>GROUP_IDS.includes(id));
  return {...plan,sourceId:G4A_U06_P03F33_SOURCE_ID,sourceUnit:{...(getBatchASourceUnit(G4A_U06_P03F33_SOURCE_ID)??{sourceId:G4A_U06_P03F33_SOURCE_ID,grade:4,semester:"upper",unitCode:"4A-U06",title:"假分數與帶分數",domain:"improper_and_mixed_fraction_representation"})},patternSpecIds,allocation:null,questionMode:"numeric",requestedKnowledgePointIds:requestedKnowledgePointIds.length?requestedKnowledgePointIds:[...G4A_U06_P03F33_KP_IDS],requestedPatternGroupIds:requestedPatternGroupIds.length?requestedPatternGroupIds:[...GROUP_IDS],publicControls:{sourceId:G4A_U06_P03F33_SOURCE_ID,questionMode:"numeric",productWave:"R05-W3",productAdmissionTask:"P03F_W3DirectProductVerticalSlice033Implementation",publicDropdownCutoverTask:"P03F_W3DirectProductVerticalSlice033Implementation",globalContextAuthority:"HIDDEN_APPLICATION_SURFACES_NOT_ADMITTED",fractionTimesIntegerAuthority:"LATER_APPLICATION_REQUIRED_WORK_NOT_ADMITTED"},publicPatternSpecInjectionUsed:false,genericFallbackAllowed:false};
}
