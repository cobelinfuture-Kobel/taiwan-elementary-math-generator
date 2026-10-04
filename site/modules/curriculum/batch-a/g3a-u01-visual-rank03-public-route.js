import { buildG3AU01VisualRank03WorksheetDocument } from "./g3a-u01-visual-rank03-worksheet.js";
import {
  G3A_U01_VISUAL_RANK03_KP_ID as KP,
  G3A_U01_VISUAL_RANK03_PATTERN_GROUP_ID as GROUP_ID,
  G3A_U01_VISUAL_RANK03_PATTERN_SPEC_ID as SPEC_ID,
  G3A_U01_VISUAL_RANK03_SOURCE_ID as SRC,
} from "../registry/g3a-u01-visual-rank03-selector-projection.js";

export function requestsG3AU01VisualRank03Public(plan={}){
  if(plan.sourceId!==SRC||plan.selectionMode!=="singleKnowledgePoint")return false;
  const ids=[...new Set((plan.selectedKnowledgePointIds??plan.knowledgePointIds??[]).filter(Boolean))];
  if(ids.length!==1||ids[0]!==KP)return false;
  const groups=[...new Set((plan.selectedPatternGroupIds??[]).filter(Boolean))];
  const specs=[...new Set((plan.patternSpecIds??[]).filter(Boolean))];
  if(groups.length)return groups.length===1&&groups[0]===GROUP_ID;
  if(specs.length)return specs.length===1&&specs[0]===SPEC_ID;
  return false;
}

export function buildG3AU01VisualRank03PublicWorksheet(plan={}){
  if(!requestsG3AU01VisualRank03Public(plan)){
    return Object.freeze({
      ok:false,
      errors:Object.freeze(["G3A_U01_RANK03_PUBLIC_ROUTE_NOT_MATCHED"]),
      warnings:Object.freeze([]),
      worksheetDocument:null,
    });
  }
  const requestedLayout=plan.printLayout??{};
  const safeLayout={
    ...requestedLayout,
    paperSize:requestedLayout.paperSize??"A4",
    columns:Math.min(Number.isInteger(requestedLayout.columns)?requestedLayout.columns:2,2),
    rowsPerPage:Math.min(Number.isInteger(requestedLayout.rowsPerPage)?requestedLayout.rowsPerPage:3,3),
    showQuestionNumbers:requestedLayout.showQuestionNumbers!==false,
    showAnswerKeyPage:plan.includeAnswerKey!==false&&requestedLayout.showAnswerKeyPage!==false,
  };
  const result=buildG3AU01VisualRank03WorksheetDocument({
    ...plan,
    publicAdmission:true,
    printLayout:safeLayout,
  });
  if(!result.ok)return result;
  const d=result.worksheetDocument;
  return Object.freeze({
    ...result,
    worksheetDocument:Object.freeze({
      ...d,
      title:"3A-U01 10000以內的數｜整數數線定位／標記",
      publicControls:Object.freeze({
        ...d.publicControls,
        sourceId:SRC,
        questionMode:"numeric",
        selectorVisible:true,
        knowledgePointId:KP,
        patternGroupId:GROUP_ID,
        patternSpecId:SPEC_ID,
        operatorLayoutReviewRequired:true,
      }),
      batchA:Object.freeze({
        ...d.batchA,
        sourceId:SRC,
        selectionMode:"singleKnowledgePoint",
        knowledgePointIds:Object.freeze([KP]),
        patternGroupIds:Object.freeze([GROUP_ID]),
        patternSpecIds:Object.freeze([SPEC_ID]),
      }),
      metadata:Object.freeze({
        ...d.metadata,
        publicCutoverTask:"G3A_U01_VisualRank03_PublicSelectorSiblingCutover_ThreeModeLinkage",
        selectorVisible:true,
        productionUse:"public_review",
        operatorLayoutReviewRequired:true,
        publicLayoutAuthority:"A4_2X3_HIDDEN_BROWSER_ACCEPTED_PUBLIC_REVIEW_PENDING",
        questionMarkerPolicy:"forbidden",
        answerMarkerPolicy:"required",
      }),
    }),
    publicCutover:true,
  });
}
