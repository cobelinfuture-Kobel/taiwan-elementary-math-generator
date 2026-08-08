export * from "./batch-a-browser-generator-p03f27.js";
import { buildBatchABrowserPlan as baseBuild } from "./batch-a-browser-generator-p03f27.js";
import { getBatchASourceUnit } from "./source-units.js";
import {
  G5A_U01_DECIMAL_READ_PLACE_GROUP_ID,
  G5A_U01_DECIMAL_READ_PLACE_KP_ID,
  G5A_U01_DECIMAL_READ_PLACE_SPEC_ID,
  G5A_U01_SOURCE_ID,
} from "../registry/g5a-u01-decimal-read-place-selector-projection.js";
import {
  G5A_U01_P03F28_GROUP_ID,
  G5A_U01_P03F28_KP_ID,
  G5A_U01_P03F28_SPEC_ID,
} from "../registry/g5a-u01-rank8-decimal-selector-projection-p03f28.js";

const KP_IDS=Object.freeze([G5A_U01_DECIMAL_READ_PLACE_KP_ID,G5A_U01_P03F28_KP_ID]);
const GROUP_IDS=Object.freeze([G5A_U01_DECIMAL_READ_PLACE_GROUP_ID,G5A_U01_P03F28_GROUP_ID]);
const SPEC_IDS=Object.freeze([G5A_U01_DECIMAL_READ_PLACE_SPEC_ID,G5A_U01_P03F28_SPEC_ID]);
const SPEC_BY_KP=Object.freeze({
  [G5A_U01_DECIMAL_READ_PLACE_KP_ID]:G5A_U01_DECIMAL_READ_PLACE_SPEC_ID,
  [G5A_U01_P03F28_KP_ID]:G5A_U01_P03F28_SPEC_ID,
});
const SPEC_BY_GROUP=Object.freeze({
  [G5A_U01_DECIMAL_READ_PLACE_GROUP_ID]:G5A_U01_DECIMAL_READ_PLACE_SPEC_ID,
  [G5A_U01_P03F28_GROUP_ID]:G5A_U01_P03F28_SPEC_ID,
});
const has=(values,id)=>Array.isArray(values)&&values.includes(id);
const hasExplicitSelection=(options={})=>[options.selectedKnowledgePointIds,options.selectedPatternGroupIds,options.patternSpecIds].some((values)=>Array.isArray(values)&&values.length>0);

export function requestsP03F28(options={}){
  if(options.sourceId!==G5A_U01_SOURCE_ID) return false;
  const targetRequested=has(options.selectedKnowledgePointIds,G5A_U01_P03F28_KP_ID)
    ||has(options.selectedPatternGroupIds,G5A_U01_P03F28_GROUP_ID)
    ||has(options.patternSpecIds,G5A_U01_P03F28_SPEC_ID);
  const sourceUnitCurrent=(options.selectionMode??"sourceUnit")==="sourceUnit"&&!hasExplicitSelection(options);
  return targetRequested||sourceUnitCurrent;
}
function requestedSpecs(options={}){
  if(Array.isArray(options.patternSpecIds)&&options.patternSpecIds.length) return [...new Set(options.patternSpecIds.filter((id)=>SPEC_IDS.includes(id)))];
  if(Array.isArray(options.selectedPatternGroupIds)&&options.selectedPatternGroupIds.length) return [...new Set(options.selectedPatternGroupIds.map((id)=>SPEC_BY_GROUP[id]).filter(Boolean))];
  if(Array.isArray(options.selectedKnowledgePointIds)&&options.selectedKnowledgePointIds.length) return [...new Set(options.selectedKnowledgePointIds.map((id)=>SPEC_BY_KP[id]).filter(Boolean))];
  return [];
}
export function buildBatchABrowserPlan(options={}){
  const plan=baseBuild(options);
  if(!requestsP03F28(options)) return plan;
  let patternSpecIds=requestedSpecs(options);
  if(patternSpecIds.length===0) patternSpecIds=[...SPEC_IDS];
  const requestedKnowledgePointIds=(options.selectedKnowledgePointIds??[]).filter((id)=>KP_IDS.includes(id));
  const requestedPatternGroupIds=(options.selectedPatternGroupIds??[]).filter((id)=>GROUP_IDS.includes(id));
  return {
    ...plan,
    sourceId:G5A_U01_SOURCE_ID,
    sourceUnit:{...getBatchASourceUnit(G5A_U01_SOURCE_ID)},
    patternSpecIds,
    allocation:null,
    questionMode:"numeric",
    requestedKnowledgePointIds:requestedKnowledgePointIds.length?requestedKnowledgePointIds:patternSpecIds.map((id)=>id===G5A_U01_P03F28_SPEC_ID?G5A_U01_P03F28_KP_ID:G5A_U01_DECIMAL_READ_PLACE_KP_ID),
    requestedPatternGroupIds:requestedPatternGroupIds.length?requestedPatternGroupIds:patternSpecIds.map((id)=>id===G5A_U01_P03F28_SPEC_ID?G5A_U01_P03F28_GROUP_ID:G5A_U01_DECIMAL_READ_PLACE_GROUP_ID),
    publicControls:{
      sourceId:G5A_U01_SOURCE_ID,
      questionMode:"numeric",
      productWave:"R05-W3",
      productAdmissionTask:"P03F_W3DirectProductVerticalSlice028Implementation",
      publicDropdownCutoverTask:"P03F_W3DirectProductVerticalSlice028Implementation",
      globalContextAuthority:"NOT_APPLICABLE_FOR_PUBLIC_SLICE028",
    },
    publicPatternSpecInjectionUsed:false,
    genericFallbackAllowed:false,
  };
}
