import {buildG3AU01VisualRank01WorksheetDocument} from "./g3a-u01-visual-rank01-worksheet.js";
import {
  G3A_U01_VISUAL_RANK01_KP_ID as KP,
  G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID as GROUP_ID,
  G3A_U01_VISUAL_RANK01_PATTERN_SPEC_ID as SPEC_ID,
  G3A_U01_VISUAL_RANK01_SOURCE_ID as SRC
} from "../registry/g3a-u01-visual-rank01-selector-projection.js";

export function requestsG3AU01VisualRank01Public(plan={}){
  if(plan.sourceId!==SRC||plan.selectionMode!=="singleKnowledgePoint")return false;
  const ids=[...new Set((plan.selectedKnowledgePointIds??plan.knowledgePointIds??[]).filter(Boolean))];
  if(ids.length!==1||ids[0]!==KP)return false;
  const groups=[...new Set((plan.selectedPatternGroupIds??[]).filter(Boolean))];
  if(groups.length)return groups.length===1&&groups[0]===GROUP_ID;
  const specs=[...new Set((plan.patternSpecIds??[]).filter(Boolean))];
  return specs.length===1&&specs[0]===SPEC_ID;
}

export function buildG3AU01VisualRank01PublicWorksheet(plan={}){
  if(!requestsG3AU01VisualRank01Public(plan))return Object.freeze({ok:false,errors:Object.freeze(["G3A_U01_RANK01_PUBLIC_ROUTE_NOT_MATCHED"]),warnings:Object.freeze([]),worksheetDocument:null});
  const result=buildG3AU01VisualRank01WorksheetDocument({...plan,publicAdmission:true});
  if(!result.ok)return result;
  const d=result.worksheetDocument;
  return Object.freeze({
    ...result,
    worksheetDocument:Object.freeze({
      ...d,
      title:"3A-U01 10000以內的數｜一維資料表比較",
      publicControls:Object.freeze({...d.publicControls,sourceId:SRC,questionMode:"numeric",selectorVisible:true,patternGroupId:GROUP_ID,patternSpecId:SPEC_ID,operatorLayoutReviewRequired:true}),
      batchA:Object.freeze({...d.batchA,sourceId:SRC,selectionMode:"singleKnowledgePoint",knowledgePointIds:Object.freeze([KP]),patternGroupIds:Object.freeze([GROUP_ID]),patternSpecIds:Object.freeze([SPEC_ID])}),
      metadata:Object.freeze({...d.metadata,publicCutoverTask:"G3A_U01_VisualPatternSpec_Rank01_SelectorAdmissionPreflight_ThenPublicCutover",selectorVisible:true,productionUse:"public_review",operatorLayoutReviewRequired:true})
    }),
    publicCutover:true
  });
}
