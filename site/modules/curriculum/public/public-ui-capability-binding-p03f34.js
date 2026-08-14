import {
  PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION,
  PUBLIC_UI_SAFE_QUESTION_COUNT,
  PUBLIC_UI_SURFACES,
  auditPublicUiCapabilityBinding as auditBasePublicUiCapabilityBinding,
  resolvePublicUiCapabilityBinding as resolveBasePublicUiCapabilityBinding,
} from "./public-ui-capability-binding-p03f33.js";
import { G4A_U09_P03F34_KP_ID, G4A_U09_P03F34_SOURCE_ID } from "../registry/g4a-u09-rank9-missing-digit-inequality-selector-projection-p03f34.js";
import { getVisiblePatternGroupsForKnowledgePoint, listVisibleBatchAKnowledgePoints } from "../registry/batch-a-selector-p03f34-extension.js";
export { PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION, PUBLIC_UI_SAFE_QUESTION_COUNT, PUBLIC_UI_SURFACES };
const SINGLE_KP_MODE="singleKnowledgePoint";
const SAME_UNIT_MIXED_MODE="mixedKnowledgePointsSameUnit";
const SOURCE_UNIT_MODE="sourceUnit";
const CROSS_UNIT_MIXED_MODE="mixedKnowledgePointsCrossUnit";
const unique=(values=[])=>[...new Set((Array.isArray(values)?values:[]).map((value)=>String(value??"").trim()).filter(Boolean))];
function slice034Binding(input={}){
  if(input.sourceId!==G4A_U09_P03F34_SOURCE_ID) return null;
  const selectionMode=input.selectionMode??SOURCE_UNIT_MODE;
  if(![SINGLE_KP_MODE,SAME_UNIT_MIXED_MODE].includes(selectionMode)) return null;
  const rows=listVisibleBatchAKnowledgePoints().filter((row)=>row.sourceId===G4A_U09_P03F34_SOURCE_ID);
  const visibleIds=new Set(rows.map((row)=>row.knowledgePointId));
  const requested=unique(input.selectedKnowledgePointIds).filter((id)=>visibleIds.has(id));
  if(!requested.includes(G4A_U09_P03F34_KP_ID)) return null;
  const selectedKnowledgePointIds=selectionMode===SINGLE_KP_MODE?[G4A_U09_P03F34_KP_ID]:requested;
  const requestedGroups=new Set(unique(input.selectedPatternGroupIds));
  let compatiblePatternGroups=selectedKnowledgePointIds.flatMap((knowledgePointId)=>{
    const row=rows.find((entry)=>entry.knowledgePointId===knowledgePointId);
    return getVisiblePatternGroupsForKnowledgePoint(knowledgePointId).map((group)=>Object.freeze({...group,knowledgePointId,knowledgePointDisplayName:row?.displayName??knowledgePointId,effectiveQuestionType:"numeric",uiQuestionType:"numeric",displayLabel:group.displayName??row?.displayName??"數字題",selected:true}));
  });
  if(requestedGroups.size>0){ const filtered=compatiblePatternGroups.filter((group)=>requestedGroups.has(group.patternGroupId)); if(filtered.some((group)=>group.knowledgePointId===G4A_U09_P03F34_KP_ID)) compatiblePatternGroups=filtered; }
  if(compatiblePatternGroups.length===0) return null;
  const groupIds=unique(compatiblePatternGroups.map((group)=>group.patternGroupId));
  return Object.freeze({sourceId:G4A_U09_P03F34_SOURCE_ID,surfaceId:input.surfaceId??PUBLIC_UI_SURFACES.CLASSIC,selectionMode,availableSelectionModes:Object.freeze([Object.freeze({value:SOURCE_UNIT_MODE,enabled:true}),Object.freeze({value:SINGLE_KP_MODE,enabled:true}),Object.freeze({value:SAME_UNIT_MIXED_MODE,enabled:selectedKnowledgePointIds.length>=2}),Object.freeze({value:CROSS_UNIT_MIXED_MODE,enabled:false})]),selectedKnowledgePointIds:Object.freeze(selectedKnowledgePointIds),selectedKnowledgePointCount:selectedKnowledgePointIds.length,availableQuestionTypeOptions:Object.freeze([Object.freeze({value:"numeric",label:"數字題"})]),questionType:"numeric",compatiblePatternGroups:Object.freeze(compatiblePatternGroups),compatiblePatternGroupIds:Object.freeze(groupIds),selectedCompatiblePatternGroupIds:Object.freeze(groupIds),depthOptions:Object.freeze([]),contextOptions:Object.freeze([]),depthMode:null,contextMode:null,questionCount:PUBLIC_UI_SAFE_QUESTION_COUNT,capacityStatus:"STRUCTURAL_FALLBACK_AVAILABLE",capacityRegistryStatus:PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION.registryStatus,capacityRouteIds:Object.freeze([]),capacityQualityStatuses:Object.freeze(["P03F34_G4A_U09_RANK9_MISSING_DIGIT_INEQUALITY_STRUCTURAL_RUNTIME"]),capacityReconciliation:PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION,blocked:false,blockedReasons:Object.freeze([])});
}
export function resolvePublicUiCapabilityBinding(input={}){ return slice034Binding(input)??resolveBasePublicUiCapabilityBinding(input); }
export function auditPublicUiCapabilityBinding(){
  const baseAudit=auditBasePublicUiCapabilityBinding();
  const errors=[...(baseAudit.errors??[])];
  let slice034CaseCount=0;
  for(const surfaceId of Object.values(PUBLIC_UI_SURFACES)){
    const binding=slice034Binding({sourceId:G4A_U09_P03F34_SOURCE_ID,surfaceId,selectionMode:SINGLE_KP_MODE,selectedKnowledgePointIds:[G4A_U09_P03F34_KP_ID]});
    slice034CaseCount+=1;
    if(!binding||binding.blocked||binding.questionType!=="numeric"||binding.compatiblePatternGroupIds.length!==1) errors.push(`P03F34_PUBLIC_BINDING_INVALID:${surfaceId}`);
    if(binding?.selectedKnowledgePointIds?.[0]!==G4A_U09_P03F34_KP_ID||binding?.depthOptions?.length!==0||binding?.contextOptions?.length!==0) errors.push(`P03F34_PUBLIC_BINDING_SCOPE_INVALID:${surfaceId}`);
  }
  const oldRow=listVisibleBatchAKnowledgePoints().find((row)=>row.sourceId===G4A_U09_P03F34_SOURCE_ID&&row.knowledgePointId!==G4A_U09_P03F34_KP_ID);
  if(oldRow){
    const mixed=slice034Binding({sourceId:G4A_U09_P03F34_SOURCE_ID,surfaceId:PUBLIC_UI_SURFACES.CLASSIC,selectionMode:SAME_UNIT_MIXED_MODE,selectedKnowledgePointIds:[oldRow.knowledgePointId,G4A_U09_P03F34_KP_ID]});
    slice034CaseCount+=1;
    if(!mixed||mixed.blocked||mixed.selectedKnowledgePointCount!==2||mixed.compatiblePatternGroupIds.length<2) errors.push("P03F34_PUBLIC_BINDING_MIXED_INVALID");
  }
  return Object.freeze({ok:errors.length===0,caseCount:Number(baseAudit.caseCount??0)+slice034CaseCount,errors:Object.freeze(errors),baseAuditCaseCount:Number(baseAudit.caseCount??0),slice034AuditCaseCount:slice034CaseCount});
}
