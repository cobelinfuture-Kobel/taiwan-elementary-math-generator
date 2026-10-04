import test from "node:test";
import assert from "node:assert/strict";

import { listBatchASourceUnits } from "../../site/modules/curriculum/batch-a/source-units.js";
import {
  auditG3AU01VisualRank02PublicSelector,
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-g3a-u01-visual-rank02-extension.js";
import {
  G3A_U01_VISUAL_RANK02_KP_ID as KP,
  G3A_U01_VISUAL_RANK02_PATTERN_GROUP_ID as GROUP,
  G3A_U01_VISUAL_RANK02_PATTERN_SPEC_ID as SPEC,
  G3A_U01_VISUAL_RANK02_SOURCE_ID as SRC,
} from "../../site/modules/curriculum/registry/g3a-u01-visual-rank02-selector-projection.js";
import {
  G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID as RANK01_GROUP,
} from "../../site/modules/curriculum/registry/g3a-u01-visual-rank01-selector-projection.js";
import { resolvePublicUiCapabilityBinding } from "../../site/modules/curriculum/public/public-ui-capability-binding-g3a-u01-rank02.js";
import {
  buildG3AU01VisualRank02Question,
  validateG3AU01VisualRank02Question,
} from "../../site/modules/curriculum/batch-a/g3a-u01-visual-rank02-runtime.js";
import {
  buildG3AU01VisualRank02PublicWorksheet,
  requestsG3AU01VisualRank02Public,
} from "../../site/modules/curriculum/batch-a/g3a-u01-visual-rank02-public-route.js";
import {
  buildP09Mixed21Worksheet,
  requestsP09Mixed21Aggregation,
} from "../../site/modules/curriculum/batch-a/same-unit-mixed21-aggregation.js";
import { buildSchoolExamCrossUnitWorksheet } from "../../site/modules/exam/school-exam-cross-unit-coordinator.js";
import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";

const publicPlan=Object.freeze({
  sourceId:SRC,
  selectionMode:"singleKnowledgePoint",
  selectedKnowledgePointIds:Object.freeze([KP]),
  selectedPatternGroupIds:Object.freeze([GROUP]),
  patternSpecIds:Object.freeze([SPEC]),
  questionMode:"numeric",
  questionCount:12,
  ordering:"groupedByPattern",
  generationSeed:"g3a-u01-rank02-public-cutover",
  includeAnswerKey:true,
  printLayout:Object.freeze({
    paperSize:"A4",
    columns:2,
    rowsPerPage:3,
    showQuestionNumbers:true,
    showAnswerKeyPage:true,
  }),
});

test("Rank02 selector admission adds exactly one canonical public KP and preserves Rank01", () => {
  const audit=auditG3AU01VisualRank02PublicSelector();
  assert.equal(audit.ok,true,audit.errors.join("\n"));
  assert.equal(audit.counts.addedKnowledgePoints,1);
  assert.equal(audit.counts.rank01Groups,1);
  assert.equal(audit.counts.rank02Groups,1);

  const row=getVisibleBatchAKnowledgePoint(KP);
  assert.ok(row);
  assert.equal(row.sourceId,SRC);
  assert.equal(row.displayName,"整數數線讀值");
  assert.equal(row.selectorNodeType,"canonical_knowledge_point");

  const groups=getVisiblePatternGroupsForKnowledgePoint(KP);
  assert.equal(groups.length,1);
  assert.equal(groups[0].patternGroupId,GROUP);
  assert.deepEqual(groups[0].patternSpecIds,[SPEC]);
  assert.equal(groups[0].visibilityStatus,"visible");

  const g3Rows=listVisibleBatchAKnowledgePoints().filter((item)=>item.sourceId===SRC);
  assert.equal(g3Rows.filter((item)=>item.knowledgePointId===KP).length,1);
  assert.equal(g3Rows.some((item)=>String(item.knowledgePointId).includes("visual_rank03")),false);
});

test("Rank02 public capability exposes single-KP and same-unit mixed admission at max 240", () => {
  const single=resolvePublicUiCapabilityBinding({
    sourceId:SRC,
    selectionMode:"singleKnowledgePoint",
    selectedKnowledgePointIds:[KP],
    selectedPatternGroupIds:[GROUP],
  });
  assert.equal(single.blocked,false);
  assert.equal(single.rank02VisualAdmission,true);
  assert.equal(single.questionType,"numeric");
  assert.equal(single.questionCount.max,240);
  assert.deepEqual(single.compatiblePatternGroupIds,[GROUP]);

  const rows=listVisibleBatchAKnowledgePoints().filter((row)=>row.sourceId===SRC);
  const compare=rows.find((row)=>row.knowledgePointId==="kp_g3a_u01_4digit_compare");
  assert.ok(compare);
  const mixed=resolvePublicUiCapabilityBinding({
    sourceId:SRC,
    selectionMode:"mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds:[compare.knowledgePointId,KP],
    selectedPatternGroupIds:[RANK01_GROUP,GROUP],
  });
  assert.equal(mixed.blocked,false);
  assert.equal(mixed.sameUnitMixedAdmission,true);
  assert.equal(mixed.rank02MixedAdmission,true);
  assert.ok(mixed.compatiblePatternGroupIds.includes(GROUP));
  assert.ok(mixed.compatiblePatternGroupIds.includes(RANK01_GROUP));
});

test("Rank02 public route resolves from canonical KP identity and renders question plus answer number lines", () => {
  assert.equal(requestsG3AU01VisualRank02Public(publicPlan),true);
  assert.equal(requestsG3AU01VisualRank02Public({...publicPlan,selectedPatternGroupIds:[],patternSpecIds:[]}),true);
  assert.equal(requestsG3AU01VisualRank02Public({...publicPlan,selectionMode:"sourceUnit"}),false);
  assert.equal(requestsG3AU01VisualRank02Public({...publicPlan,selectedPatternGroupIds:["pg_unrelated"],patternSpecIds:[]}),false);

  const result=buildG3AU01VisualRank02PublicWorksheet(publicPlan);
  assert.equal(result.ok,true,result.errors?.join("\n"));
  assert.equal(result.publicCutover,true);
  const doc=result.worksheetDocument;
  assert.equal(doc.questionCount,12);
  assert.equal(doc.metadata.selectorVisible,true);
  assert.equal(doc.metadata.productionUse,"public_review");
  assert.equal(doc.publicControls.knowledgePointId,KP);
  assert.equal(doc.publicControls.patternGroupId,GROUP);
  assert.ok(doc.generatedQuestions.every((q)=>q.patternSpecId===SPEC&&q.metadata.selectorVisible===true));
  const html=renderWorksheetDocumentToHtml(doc,{stylesheetHref:""});
  assert.equal((html.match(/data-representation="integer-number-line"/g)??[]).length,24);
});

test("Rank02 public metadata validates while hidden runtime defaults remain fail-closed", () => {
  const publicQuestion=buildG3AU01VisualRank02Question({
    variant:17,
    promptVariant:"READ_SYMBOL_MARKER_VALUE",
    publicAdmission:true,
  });
  assert.equal(validateG3AU01VisualRank02Question(publicQuestion).ok,true);
  assert.equal(publicQuestion.metadata.hiddenRuntime,false);
  assert.equal(publicQuestion.metadata.selectorVisible,true);
  assert.equal(publicQuestion.metadata.productionUse,"public_review");

  const hiddenQuestion=buildG3AU01VisualRank02Question({
    variant:17,
    promptVariant:"READ_SYMBOL_MARKER_VALUE",
  });
  assert.equal(validateG3AU01VisualRank02Question(hiddenQuestion).ok,true);
  assert.equal(hiddenQuestion.metadata.hiddenRuntime,true);
  assert.equal(hiddenQuestion.metadata.selectorVisible,false);
  assert.equal(hiddenQuestion.metadata.productionUse,"forbidden");
});

test("same-unit all-select includes Rank01 and Rank02 as independently materialized targets", () => {
  const rows=listVisibleBatchAKnowledgePoints().filter((row)=>row.sourceId===SRC);
  const selectorTargetIds=rows.map((row)=>row.knowledgePointId);
  const compareIndex=selectorTargetIds.indexOf("kp_g3a_u01_4digit_compare");
  assert.notEqual(compareIndex,-1);
  selectorTargetIds.splice(compareIndex+1,0,RANK01_GROUP);
  assert.ok(selectorTargetIds.includes(KP));

  const selectedPatternGroupIds=[RANK01_GROUP,GROUP];
  const plan={
    sourceId:SRC,
    selectionMode:"mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds:rows.map((row)=>row.knowledgePointId),
    selectedPatternGroupIds,
    selectedSelectorTargetIds:selectorTargetIds,
    questionCount:30,
    ordering:"groupedByPattern",
    includeAnswerKey:true,
    generationSeed:"g3a-u01-rank02-all-select",
    printLayout:{
      paperSize:"A4",
      columns:2,
      rowsPerPage:3,
      showAnswerKeyPage:true,
      showQuestionNumbers:true,
    },
  };
  assert.equal(requestsP09Mixed21Aggregation(plan),true);
  const result=buildP09Mixed21Worksheet(plan,buildWorksheetDocumentFromPlan);
  assert.equal(result.ok,true,JSON.stringify(result.errors??[]));
  assert.equal(result.worksheetDocument.summary.questionCount,30);
  assert.deepEqual(result.worksheetDocument.metadata.selectedSelectorTargetIds,selectorTargetIds);
  const rank02Leaf=result.leafDispatch.find((leaf)=>leaf.knowledgePointId===KP);
  assert.ok(rank02Leaf);
  assert.ok(result.worksheetDocument.generatedQuestions.some((q)=>q.patternSpecId===SPEC));
  assert.ok(result.worksheetDocument.generatedQuestions.some((q)=>q.patternSpecId==="ps_g3a_u01_visual_one_way_table_compare"));
});

test("cross-unit aggregation can materialize Rank02 beside another same-grade same-semester unit", () => {
  const unitMap=new Map(listBatchASourceUnits({includeCurrentFullProductPublic:true}).map((unit)=>[unit.sourceId,unit]));
  const sourceUnit=unitMap.get(SRC);
  assert.ok(sourceUnit);
  const rows=listVisibleBatchAKnowledgePoints();
  const otherRow=rows.find((row)=>{
    if(row.sourceId===SRC)return false;
    const unit=unitMap.get(row.sourceId);
    return unit&&unit.grade===sourceUnit.grade&&unit.semester===sourceUnit.semester;
  });
  assert.ok(otherRow);
  const otherUnit=unitMap.get(otherRow.sourceId);
  assert.ok(otherUnit);

  const plan={
    grade:sourceUnit.grade,
    semester:sourceUnit.semester,
    selectedSourceIds:[SRC,otherRow.sourceId],
    selectedKnowledgePointIds:[KP,otherRow.knowledgePointId],
    selectedPatternGroupIds:[GROUP],
    selectedSelectorTargetIds:[
      `${sourceUnit.unitCode}::${KP}`,
      `${otherUnit.unitCode}::${otherRow.knowledgePointId}`,
    ],
    questionCount:6,
    ordering:"groupedByPattern",
    includeAnswerKey:true,
    generationSeed:"g3a-u01-rank02-cross-unit",
    printLayout:{paperSize:"A4",columns:2,rowsPerPage:3,showAnswerKeyPage:true},
  };
  const result=buildSchoolExamCrossUnitWorksheet(plan,buildWorksheetDocumentFromPlan);
  assert.equal(result.ok,true,JSON.stringify(result.errors??[]));
  assert.equal(result.worksheetDocument.metadata.crossUnitMixedUsed,true);
  assert.ok(result.leafDispatch.some((leaf)=>leaf.knowledgePointId===KP));
  assert.ok(result.worksheetDocument.generatedQuestions.some((q)=>q.patternSpecId===SPEC));
});
