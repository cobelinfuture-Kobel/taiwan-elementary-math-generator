import test from "node:test";
import assert from "node:assert/strict";

import { listBatchASourceUnits } from "../../site/modules/curriculum/batch-a/source-units.js";
import {
  auditG3AU01VisualRank04PublicSelector,
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-g3a-u01-visual-rank04-extension.js";
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
} from "../../site/modules/curriculum/registry/g3a-u01-visual-rank03-selector-projection.js";
import {
  G3A_U01_VISUAL_RANK04_PATTERN_GROUP_ID as RANK04_GROUP,
  G3A_U01_VISUAL_RANK04_PATTERN_SPEC_ID as RANK04_SPEC,
} from "../../site/modules/curriculum/registry/g3a-u01-visual-rank04-selector-projection.js";
import { resolvePublicUiCapabilityBinding } from "../../site/modules/curriculum/public/public-ui-capability-binding-g3a-u01-rank04.js";
import { requestsG3AU01VisualRank02Public } from "../../site/modules/curriculum/batch-a/g3a-u01-visual-rank02-public-route.js";
import { requestsG3AU01VisualRank03Public } from "../../site/modules/curriculum/batch-a/g3a-u01-visual-rank03-public-route.js";
import {
  buildG3AU01VisualRank04PublicWorksheet,
  requestsG3AU01VisualRank04Public,
} from "../../site/modules/curriculum/batch-a/g3a-u01-visual-rank04-public-route.js";
import {
  buildP09Mixed21Worksheet,
  requestsP09Mixed21Aggregation,
} from "../../site/modules/curriculum/batch-a/same-unit-mixed21-aggregation.js";
import { buildSchoolExamCrossUnitWorksheet } from "../../site/modules/exam/school-exam-cross-unit-coordinator.js";
import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";

const rank04Plan=Object.freeze({
  sourceId:SRC,
  selectionMode:"singleKnowledgePoint",
  selectedKnowledgePointIds:Object.freeze([KP]),
  selectedPatternGroupIds:Object.freeze([RANK04_GROUP]),
  patternSpecIds:Object.freeze([RANK04_SPEC]),
  questionMode:"numeric",
  questionCount:12,
  ordering:"groupedByPattern",
  generationSeed:"g3a-u01-rank04-public-cutover",
  includeAnswerKey:true,
  printLayout:Object.freeze({
    paperSize:"A4",
    columns:2,
    rowsPerPage:3,
    showQuestionNumbers:true,
    showAnswerKeyPage:true,
  }),
});

test("Rank04 public selector adds one third sibling target without minting another number-line KP",()=>{
  const audit=auditG3AU01VisualRank04PublicSelector();
  assert.equal(audit.ok,true,audit.errors.join("\n"));
  assert.equal(audit.counts.sourceVisibleKnowledgePoints,9);
  assert.equal(audit.counts.addedKnowledgePoints,0);
  assert.equal(audit.counts.addedSiblingSelectorTargets,1);
  assert.equal(audit.counts.expectedSameUnitSelectorTargets,12);

  const rows=listVisibleBatchAKnowledgePoints().filter((row)=>row.sourceId===SRC);
  assert.equal(rows.filter((row)=>row.knowledgePointId===KP).length,1);
  assert.equal(getVisibleBatchAKnowledgePoint(KP)?.displayName,"整數數線讀值");

  const groups=getVisiblePatternGroupsForKnowledgePoint(KP);
  assert.equal(groups.filter((g)=>g.patternGroupId===RANK02_GROUP).length,1);
  assert.equal(groups.filter((g)=>g.patternGroupId===RANK03_GROUP).length,1);
  assert.equal(groups.filter((g)=>g.patternGroupId===RANK04_GROUP).length,1);
});

test("Rank02, Rank03 and Rank04 single-KP routes remain explicitly disambiguated",()=>{
  const rank02={...rank04Plan,selectedPatternGroupIds:[RANK02_GROUP],patternSpecIds:[RANK02_SPEC]};
  const rank03={...rank04Plan,selectedPatternGroupIds:[RANK03_GROUP],patternSpecIds:[RANK03_SPEC]};
  assert.equal(requestsG3AU01VisualRank02Public(rank02),true);
  assert.equal(requestsG3AU01VisualRank03Public(rank02),false);
  assert.equal(requestsG3AU01VisualRank04Public(rank02),false);
  assert.equal(requestsG3AU01VisualRank03Public(rank03),true);
  assert.equal(requestsG3AU01VisualRank02Public(rank03),false);
  assert.equal(requestsG3AU01VisualRank04Public(rank03),false);
  assert.equal(requestsG3AU01VisualRank04Public(rank04Plan),true);
  assert.equal(requestsG3AU01VisualRank02Public(rank04Plan),false);
  assert.equal(requestsG3AU01VisualRank03Public(rank04Plan),false);
  const kpOnly={...rank04Plan,selectedPatternGroupIds:[],patternSpecIds:[]};
  assert.equal(requestsG3AU01VisualRank02Public(kpOnly),false);
  assert.equal(requestsG3AU01VisualRank03Public(kpOnly),false);
  assert.equal(requestsG3AU01VisualRank04Public(kpOnly),false);
});

test("Rank04 public binding exposes max 240 and mixed binding carries all three number-line groups",()=>{
  const single=resolvePublicUiCapabilityBinding({
    sourceId:SRC,
    selectionMode:"singleKnowledgePoint",
    selectedKnowledgePointIds:[KP],
    selectedPatternGroupIds:[RANK04_GROUP],
  });
  assert.equal(single.blocked,false);
  assert.equal(single.rank04VisualAdmission,true);
  assert.equal(single.questionCount.max,240);
  assert.deepEqual(single.compatiblePatternGroupIds,[RANK04_GROUP]);

  const mixed=resolvePublicUiCapabilityBinding({
    sourceId:SRC,
    selectionMode:"mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds:[RANK01_KP,KP],
    selectedPatternGroupIds:[RANK01_GROUP,RANK02_GROUP,RANK03_GROUP,RANK04_GROUP],
  });
  assert.equal(mixed.blocked,false);
  assert.equal(mixed.rank01MixedAdmission,true);
  assert.equal(mixed.rank02MixedAdmission,true);
  assert.equal(mixed.rank03MixedAdmission,true);
  assert.equal(mixed.rank04MixedAdmission,true);
  assert.ok(mixed.compatiblePatternGroupIds.includes(RANK04_GROUP));
});

test("Rank04 public worksheet preserves sparse question labels and restores all answer labels",()=>{
  const result=buildG3AU01VisualRank04PublicWorksheet(rank04Plan);
  assert.equal(result.ok,true,result.errors?.join("\n"));
  assert.equal(result.publicCutover,true);
  const doc=result.worksheetDocument;
  assert.equal(doc.questionCount,12);
  assert.equal(doc.metadata.selectorVisible,true);
  assert.equal(doc.metadata.productionUse,"public_review");
  assert.ok(doc.generatedQuestions.every((q)=>q.patternSpecId===RANK04_SPEC&&q.metadata.selectorVisible===true));
  assert.ok(doc.generatedQuestions.every((q)=>
    q.questionNumberLine.visibleAnchors.length<q.answerNumberLine.visibleAnchors.length
    && q.answerNumberLine.visibleAnchors.length===q.answerNumberLine.tickCount
  ));

  const html=renderWorksheetDocumentToHtml(doc,{stylesheetHref:""});
  const answerStart=html.indexOf("worksheet-section--answer-key");
  assert.notEqual(answerStart,-1);
  const questionHtml=html.slice(0,answerStart);
  const answerHtml=html.slice(answerStart);
  assert.equal((questionHtml.match(/data-representation="integer-number-line"/g)??[]).length,12);
  assert.equal((answerHtml.match(/data-representation="integer-number-line"/g)??[]).length,12);
  assert.equal((html.match(/data-answer-marker="true"/g)??[]).length,0);
});

test("same-unit all-select materializes all 12 targets including Rank02, Rank03 and Rank04 as independent leaves",()=>{
  const rows=listVisibleBatchAKnowledgePoints().filter((row)=>row.sourceId===SRC);
  const targets=[];
  for(const row of rows){
    targets.push(row.knowledgePointId);
    if(row.knowledgePointId===RANK01_KP)targets.push(RANK01_GROUP);
    if(row.knowledgePointId===KP){
      targets.push(RANK03_GROUP);
      targets.push(RANK04_GROUP);
    }
  }
  assert.equal(targets.length,12);
  assert.equal(new Set(targets).size,12);

  const plan={
    sourceId:SRC,
    selectionMode:"mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds:rows.map((row)=>row.knowledgePointId),
    selectedPatternGroupIds:[RANK01_GROUP,RANK02_GROUP,RANK03_GROUP,RANK04_GROUP],
    selectedSelectorTargetIds:targets,
    questionCount:36,
    ordering:"groupedByPattern",
    includeAnswerKey:true,
    generationSeed:"g3a-u01-rank04-all-select",
    printLayout:{paperSize:"A4",columns:2,rowsPerPage:3,showAnswerKeyPage:true,showQuestionNumbers:true},
  };
  assert.equal(requestsP09Mixed21Aggregation(plan),true);
  const result=buildP09Mixed21Worksheet(plan,buildWorksheetDocumentFromPlan);
  assert.equal(result.ok,true,JSON.stringify(result.errors??[]));
  assert.equal(result.worksheetDocument.summary.questionCount,36);
  assert.equal(result.leafDispatch.length,12);
  assert.deepEqual(result.worksheetDocument.metadata.selectedSelectorTargetIds,targets);
  for(const target of [KP,RANK03_GROUP,RANK04_GROUP]) assert.ok(result.leafDispatch.find((leaf)=>leaf.selectorTargetId===target));
  const specs=new Set(result.worksheetDocument.generatedQuestions.map((q)=>q.patternSpecId));
  assert.ok(specs.has(RANK02_SPEC));
  assert.ok(specs.has(RANK03_SPEC));
  assert.ok(specs.has(RANK04_SPEC));
});

test("cross-unit aggregation preserves Rank04 selector identity beside another same-grade same-semester unit",()=>{
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
  const rank04Key=`${sourceUnit.unitCode}::${RANK04_GROUP}`;
  const otherKey=`${otherUnit.unitCode}::${otherRow.knowledgePointId}`;
  const result=buildSchoolExamCrossUnitWorksheet({
    grade:sourceUnit.grade,
    semester:sourceUnit.semester,
    selectedSourceIds:[SRC,otherRow.sourceId],
    selectedKnowledgePointIds:[KP,otherRow.knowledgePointId],
    selectedPatternGroupIds:[RANK04_GROUP],
    selectedSelectorTargetIds:[rank04Key,otherKey],
    questionCount:6,
    ordering:"groupedByPattern",
    includeAnswerKey:true,
    generationSeed:"g3a-u01-rank04-cross-unit",
    printLayout:{paperSize:"A4",columns:2,rowsPerPage:3,showAnswerKeyPage:true},
  },buildWorksheetDocumentFromPlan);
  assert.equal(result.ok,true,JSON.stringify(result.errors??[]));
  assert.equal(result.worksheetDocument.metadata.crossUnitMixedUsed,true);
  const rank04Leaf=result.leafDispatch.find((leaf)=>leaf.selectorTargetId===rank04Key);
  assert.ok(rank04Leaf);
  assert.equal(rank04Leaf.knowledgePointId,KP);
  assert.ok(result.worksheetDocument.generatedQuestions.some((q)=>q.patternSpecId===RANK04_SPEC));
});
