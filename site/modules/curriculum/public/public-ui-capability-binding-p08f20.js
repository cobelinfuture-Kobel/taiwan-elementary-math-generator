export * from "./public-ui-capability-binding-p08f19.js";
import {resolvePublicUiCapabilityBinding as baseResolve,auditPublicUiCapabilityBinding as baseAudit} from "./public-ui-capability-binding-p08f19.js";
import {
  G6A_U07_P08F20_APPLIED_MODIFIER_IDS as MODIFIERS,
  G6A_U07_P08F20_CONTRACT_ONLY_CAPABILITY_IDS as CONTRACT_ONLY,
  G6A_U07_P08F20_KP_ID as KP,
  G6A_U07_P08F20_OPTIONAL_CAPABILITY_IDS as OPTIONAL,
  G6A_U07_P08F20_PATTERN_GROUP as GROUP,
  G6A_U07_P08F20_REQUIRED_CAPABILITY_IDS as REQUIRED,
  G6A_U07_P08F20_SOURCE_ID as SRC,
  G6A_U07_P08F20_SPEC_IDS as SPEC_IDS
} from "../registry/g6a-u07-composite-circle-area-selector-projection-p08f20.js";
function target(i={}){
  if(i.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(i.selectionMode))return false;
  const ids=[...new Set((i.selectedKnowledgePointIds??i.knowledgePointIds??[]).filter(Boolean))];
  if(ids.length)return ids.length===1&&ids[0]===KP;
  if((i.selectedPatternGroupIds??[]).includes(GROUP.patternGroupId))return true;
  const specs=i.patternSpecIds??[];return specs.length>0&&specs.every(id=>SPEC_IDS.includes(id));
}
function current(){
  return Object.freeze({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:Object.freeze([KP]),selectedPatternGroupIds:Object.freeze([GROUP.patternGroupId]),
    availableSelectionModes:Object.freeze([
      {value:"sourceUnit",label:"整個單元",enabled:true},{value:"singleKnowledgePoint",label:"單一知識點",enabled:true},
      {value:"mixedKnowledgePointsSameUnit",label:"同單元混合",enabled:false},{value:"mixedKnowledgePointsCrossUnit",label:"跨單元混合",enabled:false}
    ].map(Object.freeze)),
    availableQuestionTypeOptions:Object.freeze([Object.freeze({value:"diagram",label:"複合圓形面積",enabled:true})]),questionType:"diagram",
    compatiblePatternGroups:Object.freeze([GROUP]),compatiblePatternGroupIds:Object.freeze([GROUP.patternGroupId]),patternSpecIds:SPEC_IDS,
    questionCount:Object.freeze({min:1,max:240,default:20}),depthOptions:Object.freeze([]),contextOptions:Object.freeze([]),
    blocked:false,errors:Object.freeze([]),warnings:Object.freeze([]),genericFallback:false,freeFormAI:false,
    applicationSuitability:"APPLICATION_COMPATIBLE_BUT_NOT_ADMITTED",compositeCircleAreaOwned:true,
    decompositionIntoNonOverlappingRegionsRequired:true,noOverlapOrOmissionRequired:true,circleAreaFormulaPrerequisiteAllowed:true,sectorAreaPrerequisiteAllowed:true,
    q011CircleAreaDerivationTeachingReownershipAllowed:false,q014CircleAreaFormulaTeachingReownershipAllowed:false,
    q017AnnulusAreaTeachingReownershipAllowed:false,q019SectorAreaTeachingReownershipAllowed:false,
    arcLengthOrPerimeterTeachingAllowed:false,applicationContextAllowed:false,sameUnitMixedAdmission:false,crossUnitMixedAdmission:false,
    requiredCapabilityIds:REQUIRED,contractOnlyRequiredCapabilityIds:CONTRACT_ONLY,optionalCapabilityIds:OPTIONAL,appliedRuntimeModifierIds:MODIFIERS,
    frozenRuntimeProfile:"profile_geometry_formula",sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED",humanVisualReviewRequired:true});
}
export function resolvePublicUiCapabilityBinding(i={}){return target(i)?current():baseResolve(i);}
export function auditPublicUiCapabilityBinding(){
  const b0=baseAudit(),e=[],b=current();if(b0&&!b0.ok)e.push(...b0.errors.map(x=>"P08F20_BASE:"+x));
  if(b.blocked||b.questionType!=="diagram"||b.questionCount.max!==240||!b.compositeCircleAreaOwned||
    !b.decompositionIntoNonOverlappingRegionsRequired||!b.noOverlapOrOmissionRequired||!b.circleAreaFormulaPrerequisiteAllowed||!b.sectorAreaPrerequisiteAllowed||
    b.q011CircleAreaDerivationTeachingReownershipAllowed||b.q014CircleAreaFormulaTeachingReownershipAllowed||
    b.q017AnnulusAreaTeachingReownershipAllowed||b.q019SectorAreaTeachingReownershipAllowed||b.arcLengthOrPerimeterTeachingAllowed||
    b.applicationContextAllowed||b.sameUnitMixedAdmission||b.crossUnitMixedAdmission||
    b.requiredCapabilityIds.join("|")!==REQUIRED.join("|")||b.contractOnlyRequiredCapabilityIds.join("|")!==CONTRACT_ONLY.join("|")||
    b.optionalCapabilityIds.length!==0||b.appliedRuntimeModifierIds.length!==0||b.frozenRuntimeProfile!=="profile_geometry_formula"||b.humanVisualReviewRequired!==true)
    e.push("P08F20_BINDING_INVALID");
  return Object.freeze({ok:e.length===0,errors:Object.freeze(e),q020KnowledgePointCount:1,q020PatternGroupCount:1,q020PatternSpecCount:2});
}
