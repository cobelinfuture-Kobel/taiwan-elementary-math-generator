import test from "node:test";
import assert from "node:assert/strict";

import { listBatchASourceUnits } from "../../site/modules/curriculum/batch-a/source-units.js";
import {
  auditG3AU01VisualRank03PublicSelector,
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-g3a-u01-visual-rank03-extension.js";
import {
  G3A_U01_VISUAL_RANK01_KP_ID as RANK01_KP,
  G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID as RANK01_GROUP,
} from "../../site/modules/curriculum/registry/g3a-u01-visual-rank01-selector-projection.js";
import {
  G3A_U01_VISUAL_RANK02_KP_ID as KP,
  G3A_U01_VISUAL_RANK02_PATTERN_GROUP_ID as RANK02_GROUP,
  G3A_U01_VISUAL_RANK02_PATTERN_SPEC_ID as RANK02_SPEC,
  G3A_U01_VISUAL_RANK02_SOURCE_ID as SRC,
} from "../../site/modules/curriculum/registry/g3a-u01-visual-rank02-selector-projection.js";
import {
  G3A_U01_VISUAL_RANK03_PATTERN_GROUP_ID as RANK03_GROUP,
  G3A_U01_VISUAL_RANK03_PATTERN_SPEC_ID as RANK03_SPEC,
  G3A_U01_VISUAL_RANK03_PUBLIC_PATTERN_GROUP,
} from "../../site/modules/curriculum/registry/g3a-u01-visual-rank03-selector-projection.js";
import { resolvePublicUiCapabilityBinding } from "../../site/modules/curriculum/public/public-ui-capability-binding-g3a-u01-rank03.js";
import {
  buildG3AU01VisualRank02PublicWorksheet,
  requestsG3AU01VisualRank02Public,
} from "../../site/modules/curriculum/batch-a/g3a-u01-visual-rank02-public-route.js";
import {
  buildG3AU01VisualRank03PublicWorksheet,
  requestsG3AU01VisualRank03Public,
} from "../../site/modules/curriculum/batch-a/g3a-u01-visual-rank03-public-route.js";
import {
  buildP09Mixed21Worksheet,
  requestsP09Mixed21Aggregation,
} from "../../site/modules/curriculum/batch-a/same-unit-mixed21-aggregation.js";
import { buildSchoolExamCrossUnitWorksheet } from "../../site/modules/exam/school-exam-cross-unit-coordinator.js";
import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";

const rank03Plan=Object.freeze({
  sourceId:SRC,
  selectionMode:"singleKnowledgePoint",
  selectedKnowledgePointIds:Object.freeze([KP]),
  selectedPatternGroupIds:Object.freeze([RANK03_GROUP]),
  patternSpecIds:Object.freeze([RANK03_SPEC]),
  questionMode:"numeric",
  questionCount:12,
  ordering:"groupedByPattern",
  generationSeed:"g3a-u01-rank03-public-cutover",
  includeAnswerKey:true,
  printLayout:Object.freeze({
    paperSize:"A4",
    columns:2,
    rowsPerPage:3,
    showQuestionNumbers:true,
    showAnswerKeyPage:true,
  }),
});

test("Rank03 public selector adds one sibling target without minting a second number-line KP",()=>{
  const audit=auditG3AU01VisualRank03PublicSelector();
  assert.equal(audit.ok,true,audit.errors.join("\n"));
  assert.equal(audit.counts.sourceVisibleKnowledgePoints,9);
  assert.equal(audit.counts.addedKnowledgePoints,0);
  assert.equal(audit.counts.addedSiblingSelectorTargets,1);
  assert.equal(audit.counts.expectedSameUnitSelectorTargets,11);

  const rows=listVisibleBatchAKnowledgePoints().filter((row)=>row.sourceId===SRC);
  assert.equal(rows.filter((row)=>row.knowledgePointId===KP).length,1);
  const numberLineRow=getVisibleBatchAKnowledgePoint(KP);
  assert.equal(numberLineRow.displayName,"整數數線讀值");

  const groups=getVisiblePatternGroupsForKnowledgePoint(KP);
  assert.equal(groups.filter((group)=>group.patternGroupId===RANK02_GROUP).length,1);
  assert.equal(groups.filter((group)=>group.patternGroupId===RANK03_GROUP).length,1);
  assert.equal(groups.find((group)=>group.patternGroupId===RANK03_GROUP)?.displayName,"整數數線定位／標記");
});

test("Rank02 and Rank03 single-KP routes are explicitly disambiguated by PatternGroup/PatternSpec",()=>{
  const rank02Plan={
    ...rank03Plan,
    selectedPatternGroupIds:[RANK02_GROUP],
    patternSpecIds:[RANK02_SPEC],
  };
  assert.equal(requestsG3AU01VisualRank02Public(rank02Plan),true);
  assert.equal(requestsG3AU01VisualRank03Public(rank02Plan),false);
  assert.equal(requestsG3AU01VisualRank03Public(rank03Plan),true);
  assert.equal(requestsG3AU01VisualRank02Public(rank03Plan),false);

  const kpOnly={...rank03Plan,selectedPatternGroupIds:[],patternSpecIds:[]};
  assert.equal(requestsG3AU01VisualRank02Public(kpOnly),false);
  assert.equal(requestsG3AU01VisualRank03Public(kpOnly),false);
});

test("Rank03 public binding exposes the sibling runtime at max 240 while Rank02 canonical remains available",()=>{
  const rank03=resolvePublicUiCapabilityBinding({
    sourceId:SRC,
    selectionMode:"singleKnowledgePoint",
    selectedKnowledgePointIds:[KP],
    selectedPatternGroupIds:[RANK03_GROUP],
  });
  assert.equal(rank03.blocked,false);
  assert.equal(rank03.rank03VisualAdmission,true);
  assert.equal(rank03.questionCount.max,240);
  assert.deepEqual(rank03.compatiblePatternGroupIds,[RANK03_GROUP]);

  const rank02=resolvePublicUiCapabilityBinding({
    sourceId:SRC,
    selectionMode:"singleKnowledgePoint",
    selectedKnowledgePointIds:[KP],
    selectedPatternGroupIds:[RANK02_GROUP],
  });
  assert.equal(rank02.blocked,false);
  assert.equal(rank02.rank02VisualAdmission,true);
  assert.deepEqual(rank02.compatiblePatternGroupIds,[RANK02_GROUP]);

  const mixed=resolvePublicUiCapabilityBinding({
    sourceId:SRC,
    selectionMode:"mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds:[RANK01_KP,KP],
    selectedPatternGroupIds:[RANK01_GROUP,RANK02_GROUP,RANK03_GROUP],
  });
  assert.equal(mixed.blocked,false);
  assert.equal(mixed.rank01MixedAdmission,true);
  assert.equal(mixed.rank02MixedAdmission,true);
  assert.equal(mixed.rank03MixedAdmission,true);
});

test("Rank03 public worksheet renders marker-free questions and marked answers",()=>{
  const result=buildG3AU01VisualRank03PublicWorksheet(rank03Plan);
  assert.equal(result.ok,true,result.errors?.join("\n"));
  assert.equal(result.publicCutover,true);
  const doc=result.worksheetDocument;
  assert.equal(doc.questionCount,12);
  assert.equal(doc.metadata.selectorVisible,true);
  assert.equal(doc.metadata.productionUse,"public_review");
  assert.equal(doc.metadata.questionMarkerPolicy,"forbidden");
  assert.equal(doc.metadata.answerMarkerPolicy,"required");
  assert.ok(doc.generatedQuestions.every((q)=>q.patternSpecId===RANK03_SPEC&&q.metadata.selectorVisible===true));

  const html=renderWorksheetDocumentToHtml(doc,{stylesheetHref:""});
  const answerStart=html.indexOf("worksheet-section--answer-key");
  assert.notEqual(answerStart,-1);
  const questionHtml=html.slice(0,answerStart);
  const answerHtml=html.slice(answerStart);
  assert.equal((questionHtml.match(/data-representation="integer-number-line"/g)??[]).length,12);
  assert.equal((questionHtml.match(/data-answer-marker="true"/g)??[]).length,0);
  assert.equal((answerHtml.match(/data-answer-marker="true"/g)??[]).length,12);
});

test("same-unit all-select materializes all 11 targets including independent Rank02 and Rank03 leaves",()=>{
  const rows=listVisibleBatchAKnowledgePoints().filter((row)=>row.sourceId===SRC);
  const targets=[];
  for(const row of rows){
    targets.push(row.knowledgePointId);
    if(row.knowledgePointId===RANK01_KP)targets.push(RANK01_GROUP);
    if(row.knowledgePointId===KP)targets.push(RANK03_GROUP);
  }
  assert.equal(targets.length,11);
  assert.equal(new Set(targets).size,11);
  assert.ok(targets.includes(KP));
  assert.ok(targets.includes(RANK03_GROUP));

  const plan={
    sourceId:SRC,
    selectionMode:"mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds:rows.map((row)=>row.knowledgePointId),
    selectedPatternGroupIds:[RANK01_GROUP,RANK02_GROUP,RANK03_GROUP],
    selectedSelectorTargetIds:targets,
    questionCount:33,
    ordering:"groupedByPattern",
    includeAnswerKey:true,
    generationSeed:"g3a-u01-rank03-all-select",
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
  assert.equal(result.worksheetDocument.summary.questionCount,33);
  assert.equal(result.leafDispatch.length,11);
  assert.deepEqual(result.worksheetDocument.metadata.selectedSelectorTargetIds,targets);

  const rank02Leaf=result.leafDispatch.find((leaf)=>leaf.selectorTargetId===KP);
  const rank03Leaf=result.leafDispatch.find((leaf)=>leaf.selectorTargetId===RANK03_GROUP);
  assert.ok(rank02Leaf);
  assert.ok(rank03Leaf);
  assert.equal(rank02Leaf.knowledgePointId,KP);
  assert.equal(rank03Leaf.knowledgePointId,KP);

  const specs=new Set(result.worksheetDocument.generatedQuestions.map((q)=>q.patternSpecId));
  assert.ok(specs.has(RANK02_SPEC));
  assert.ok(specs.has(RANK03_SPEC));
  assert.ok(specs.has("ps_g3a_u01_visual_one_way_table_compare"));
});

test("cross-unit aggregation preserves Rank03 selector identity beside another same-grade same-semester unit",()=>{
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

  const rank03Key=`${sourceUnit.unitCode}::${RANK03_GROUP}`;
  const otherKey=`${otherUnit.unitCode}::${otherRow.knowledgePointId}`;
  const result=buildSchoolExamCrossUnitWorksheet({
    grade:sourceUnit.grade,
    semester:sourceUnit.semester,
    selectedSourceIds:[SRC,otherRow.sourceId],
    selectedKnowledgePointIds:[KP,otherRow.knowledgePointId],
    selectedPatternGroupIds:[RANK03_GROUP],
    selectedSelectorTargetIds:[rank03Key,otherKey],
    questionCount:6,
    ordering:"groupedByPattern",
    includeAnswerKey:true,
    generationSeed:"g3a-u01-rank03-cross-unit",
    printLayout:{paperSize:"A4",columns:2,rowsPerPage:3,showAnswerKeyPage:true},
  },buildWorksheetDocumentFromPlan);

  assert.equal(result.ok,true,JSON.stringify(result.errors??[]));
  assert.equal(result.worksheetDocument.metadata.crossUnitMixedUsed,true);
  const rank03Leaf=result.leafDispatch.find((leaf)=>leaf.selectorTargetId===rank03Key);
  assert.ok(rank03Leaf);
  assert.equal(rank03Leaf.knowledgePointId,KP);
  assert.ok(result.worksheetDocument.generatedQuestions.some((q)=>q.patternSpecId===RANK03_SPEC));
});
