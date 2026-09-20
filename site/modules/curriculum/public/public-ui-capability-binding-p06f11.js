export * from "./public-ui-capability-binding-p06f10.js";
import {resolvePublicUiCapabilityBinding as baseResolve,auditPublicUiCapabilityBinding as baseAudit} from "./public-ui-capability-binding-p06f10.js";
import {G4A_U07_P06F11_KP_ID as KP,G4A_U07_P06F11_PATTERN_GROUP as GROUP,G4A_U07_P06F11_PATTERN_SPECS as PATTERNS,G4A_U07_P06F11_QUEUE_REQUIRED_CAPABILITY_IDS as REQUIRED,G4A_U07_P06F11_SOURCE_ID as SRC} from "../registry/g4a-u07-multiplicative-pattern-selector-projection-p06f11.js";
const SPEC_IDS=PATTERNS.map(x=>x.patternSpecId);
function target(i={}){
  if(i.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(i.selectionMode))return false;
  const ids=[...new Set((i.selectedKnowledgePointIds??i.knowledgePointIds??[]).filter(Boolean))];
  if(ids.length)return ids.length===1&&ids[0]===KP;
  const gs=i.selectedPatternGroupIds??[];if(gs.length)return gs.length===1&&gs[0]===GROUP.patternGroupId;
  const ss=i.patternSpecIds??[];return ss.length>0&&ss.every(id=>SPEC_IDS.includes(id));
}
function q11Binding(){return Object.freeze({
  sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:Object.freeze([KP]),selectedPatternGroupIds:Object.freeze([GROUP.patternGroupId]),
  availableSelectionModes:Object.freeze([{value:"sourceUnit",label:"整個單元",enabled:true},{value:"singleKnowledgePoint",label:"單一知識點",enabled:true},{value:"mixedKnowledgePointsSameUnit",label:"同單元混合",enabled:false},{value:"mixedKnowledgePointsCrossUnit",label:"跨單元混合",enabled:false}].map(Object.freeze)),
  availableQuestionTypeOptions:Object.freeze([Object.freeze({value:"numeric",label:"倍數型數量規律",enabled:true})]),
  questionType:"numeric",compatiblePatternGroups:Object.freeze([GROUP]),compatiblePatternGroupIds:Object.freeze([GROUP.patternGroupId]),patternSpecIds:Object.freeze([...SPEC_IDS]),questionCount:Object.freeze({min:1,max:240,default:20}),depthOptions:Object.freeze([]),contextOptions:Object.freeze([]),blocked:false,errors:Object.freeze([]),warnings:Object.freeze([]),genericFallback:false,freeFormAI:false,applicationSuitability:"APPLICATION_COMPATIBLE",applicationImplementationAllowed:false,
  patternSequenceReasoningRequired:true,patternRelationValidationRequired:true,textNumericRepresentationRequired:true,fixedMultiplicativeFactorRequired:true,constantAdjacentRatioRequired:true,multiplicativeGrowthOrShrinkAllowed:true,
  symbolicRelationReasoningUsed:false,q005GeometricPatternReowned:false,q005AdditivePatternReowned:false,q006InputOutputTableReowned:false,q013MissingTermReasoningReowned:false,q012OrLaterTouched:false,sameUnitMixedAdmission:false,crossUnitMixedAdmission:false,
  requiredCapabilityIds:REQUIRED,optionalCapabilityIds:Object.freeze([]),appliedRuntimeModifierIds:Object.freeze([]),frozenRuntimeProfile:"profile_pattern_relation",sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"
});}
export const resolvePublicUiCapabilityBinding=(i={})=>target(i)?q11Binding():baseResolve(i);
export function auditPublicUiCapabilityBinding(){
  const b0=baseAudit(),e=[];if(!b0.ok)e.push(...b0.errors.map(x=>`P06F11_BASE:${x}`));
  const b=q11Binding();
  if(b.blocked||b.questionType!=="numeric"||b.questionCount.max!==240||b.applicationImplementationAllowed||!b.patternSequenceReasoningRequired||!b.patternRelationValidationRequired||!b.textNumericRepresentationRequired||!b.fixedMultiplicativeFactorRequired||!b.constantAdjacentRatioRequired||!b.multiplicativeGrowthOrShrinkAllowed||b.symbolicRelationReasoningUsed||b.q005GeometricPatternReowned||b.q005AdditivePatternReowned||b.q006InputOutputTableReowned||b.q013MissingTermReasoningReowned||b.q012OrLaterTouched||b.sameUnitMixedAdmission||b.crossUnitMixedAdmission||b.requiredCapabilityIds.join("|")!==REQUIRED.join("|")||b.frozenRuntimeProfile!=="profile_pattern_relation")e.push("P06F11_BINDING_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),q011KnowledgePointCount:1,q011PatternGroupCount:1,q011PatternSpecCount:SPEC_IDS.length});
}
