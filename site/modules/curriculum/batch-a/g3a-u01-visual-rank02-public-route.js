import { buildG3AU01VisualRank02WorksheetDocument } from "./g3a-u01-visual-rank02-worksheet.js";
import {
  G3A_U01_VISUAL_RANK02_KP_ID as KP,
  G3A_U01_VISUAL_RANK02_PATTERN_GROUP_ID as GROUP_ID,
  G3A_U01_VISUAL_RANK02_PATTERN_SPEC_ID as SPEC_ID,
  G3A_U01_VISUAL_RANK02_SOURCE_ID as SRC,
} from "../registry/g3a-u01-visual-rank02-selector-projection.js";

export function requestsG3AU01VisualRank02Public(plan={}){
  if(plan.sourceId!==SRC||plan.selectionMode!=="singleKnowledgePoint")return false;
  const ids=[...new Set((plan.selectedKnowledgePointIds??plan.knowledgePointIds??[]).filter(Boolean))];
  if(ids.length!==1||ids[0]!==KP)return false;
  const groups=[...new Set((plan.selectedPatternGroupIds??[]).filter(Boolean))];
  if(groups.length)return groups.length===1&&groups[0]===GROUP_ID;
  const specs=[...new Set((plan.patternSpecIds??[]).filter(Boolean))];
  if(specs.length)return specs.length===1&&specs[0]===SPEC_ID;
  // Rank03 now shares this canonical KP, so KP identity alone is ambiguous.
  // Public leaves must carry an explicit Rank02 PatternGroup or PatternSpec.
  return false;
}

export function buildG3AU01VisualRank02PublicWorksheet(plan={}){
  if(!requestsG3AU01VisualRank02Public(plan)){
    return Object.freeze({
      ok:false,
      errors:Object.freeze(["G3A_U01_RANK02_PUBLIC_ROUTE_NOT_MATCHED"]),
      warnings:Object.freeze([]),
      worksheetDocument:null,
    });
  }
  const result=buildG3AU01VisualRank02WorksheetDocument({...plan,publicAdmission:true});
  if(!result.ok)return result;
  const d=result.worksheetDocument;
  return Object.freeze({
    ...result,
    worksheetDocument:Object.freeze({
      ...d,
      title:"3A-U01 10000以內的數｜整數數線讀值",
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
        publicCutoverTask:"G3A_U01_VisualRank02_PublicSelectorCutover_ThreeModeLinkage",
        selectorVisible:true,
        productionUse:"public_review",
        operatorLayoutReviewRequired:true,
        publicLayoutAuthority:"A4_2X3_BROWSER_ACCEPTED",
      }),
    }),
    publicCutover:true,
  });
}
