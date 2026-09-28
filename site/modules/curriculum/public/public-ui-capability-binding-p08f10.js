export * from "./public-ui-capability-binding-p08f09.js";
import {resolvePublicUiCapabilityBinding as baseResolve,auditPublicUiCapabilityBinding as baseAudit} from "./public-ui-capability-binding-p08f09.js";
import {G5A_U05A1_P08F10_KP_ID as KP,G5A_U05A1_P08F10_PATTERN_GROUP as GROUP,G5A_U05A1_P08F10_REQUIRED_CAPABILITY_IDS as REQUIRED,G5A_U05A1_P08F10_OPTIONAL_CAPABILITY_IDS as OPTIONAL,G5A_U05A1_P08F10_APPLIED_MODIFIER_IDS as MODIFIERS,G5A_U05A1_P08F10_SOURCE_ID as SRC,G5A_U05A1_P08F10_SPEC_IDS as SPEC_IDS} from "../registry/g5a-u05a1-sector-fraction-of-circle-selector-projection-p08f10.js";
function target(i={}){if(i.sourceId!==SRC||["sourceUnit","mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"].includes(i.selectionMode))return false;const ids=[...new Set((i.selectedKnowledgePointIds??i.knowledgePointIds??[]).filter(Boolean))];if(ids.length)return ids.length===1&&ids[0]===KP;if((i.selectedPatternGroupIds??[]).includes(GROUP.patternGroupId))return true;return (i.patternSpecIds??[]).some(id=>SPEC_IDS.includes(id));}
function current(){return Object.freeze({
 sourceId:SRC,
 selectionMode:"singleKnowledgePoint",
 selectedKnowledgePointIds:Object.freeze([KP]),
 selectedPatternGroupIds:Object.freeze([GROUP.patternGroupId]),
 availableSelectionModes:Object.freeze([
  {value:"sourceUnit",label:"整個單元",enabled:true},
  {value:"singleKnowledgePoint",label:"單一知識點",enabled:true},
  {value:"mixedKnowledgePointsSameUnit",label:"同單元混合",enabled:false},
  {value:"mixedKnowledgePointsCrossUnit",label:"跨單元混合",enabled:false}
 ].map(Object.freeze)),
 availableQuestionTypeOptions:Object.freeze([Object.freeze({value:"diagram",label:"扇形占全圓比例圖形題",enabled:true})]),
 questionType:"diagram",
 compatiblePatternGroups:Object.freeze([GROUP]),
 compatiblePatternGroupIds:Object.freeze([GROUP.patternGroupId]),
 patternSpecIds:SPEC_IDS,
 questionCount:Object.freeze({min:1,max:240,default:20}),
 depthOptions:Object.freeze([]),
 contextOptions:Object.freeze([]),
 blocked:false,
 errors:Object.freeze([]),
 warnings:Object.freeze([]),
 genericFallback:false,
 freeFormAI:false,
 applicationSuitability:"APPLICATION_COMPATIBLE",
 sectorFractionOfCircleRequired:true,
 fullTurnInvariantDegrees:360,
 centralAngleToFractionRequired:true,
 reducedFractionRequired:true,
 fractionRepresentsSameFullCircleRequired:true,
 targetIsFractionNotAreaOrArcLength:true,
 centralAngleMeasurementReownershipAllowed:false,
 combinedSectorUnknownAngleReownershipAllowed:false,
 sectorElementNamingReownershipAllowed:false,
 sameCircleSectorSizeComparisonReownershipAllowed:false,
 sectorAreaArcLengthReownershipAllowed:false,
 geometryConstructionReownershipAllowed:false,
 sameUnitMixedAdmission:false,
 crossUnitMixedAdmission:false,
 requiredCapabilityIds:REQUIRED,
 optionalCapabilityIds:OPTIONAL,
 appliedRuntimeModifierIds:MODIFIERS,
 frozenRuntimeProfile:"profile_geometry_property",
 sharedRuntimeScope:"SHARED_RUNTIME_BOUNDED"
});}
export function resolvePublicUiCapabilityBinding(i={}){return target(i)?current():baseResolve(i);}
export function auditPublicUiCapabilityBinding(){
 const b0=baseAudit(),e=[],b=current();
 if(!b0.ok)e.push(...b0.errors.map(x=>"P08F10_BASE:"+x));
 if(b.blocked||b.questionType!=="diagram"||b.questionCount.max!==240||!b.sectorFractionOfCircleRequired||b.fullTurnInvariantDegrees!==360||!b.centralAngleToFractionRequired||!b.reducedFractionRequired||!b.fractionRepresentsSameFullCircleRequired||!b.targetIsFractionNotAreaOrArcLength||b.centralAngleMeasurementReownershipAllowed||b.combinedSectorUnknownAngleReownershipAllowed||b.sectorElementNamingReownershipAllowed||b.sameCircleSectorSizeComparisonReownershipAllowed||b.sectorAreaArcLengthReownershipAllowed||b.geometryConstructionReownershipAllowed||b.sameUnitMixedAdmission||b.crossUnitMixedAdmission||b.requiredCapabilityIds.join("|")!==REQUIRED.join("|")||b.optionalCapabilityIds.join("|")!==OPTIONAL.join("|")||b.appliedRuntimeModifierIds.length!==0||b.frozenRuntimeProfile!=="profile_geometry_property")e.push("P08F10_BINDING_INVALID");
 return Object.freeze({ok:e.length===0,errors:Object.freeze(e),q010KnowledgePointCount:1,q010PatternGroupCount:1,q010PatternSpecCount:3});
}
