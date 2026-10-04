import test from "node:test";
import assert from "node:assert/strict";

import {
  auditG3AU01VisualRank01PublicSelector,
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
} from "../../site/modules/curriculum/registry/batch-a-selector-g3a-u01-visual-rank01-extension.js";
import {
  G3A_U01_VISUAL_RANK01_KP_ID,
  G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID,
  G3A_U01_VISUAL_RANK01_PATTERN_SPEC_ID,
  G3A_U01_VISUAL_RANK01_SOURCE_ID,
} from "../../site/modules/curriculum/registry/g3a-u01-visual-rank01-selector-projection.js";
import {
  resolvePublicUiCapabilityBinding,
} from "../../site/modules/curriculum/public/public-ui-capability-binding-g3a-u01-rank01.js";
import {
  buildG3AU01VisualRank01Question,
  validateG3AU01VisualRank01Question,
} from "../../site/modules/curriculum/batch-a/g3a-u01-visual-rank01-runtime.js";
import {
  buildG3AU01VisualRank01PublicWorksheet,
  requestsG3AU01VisualRank01Public,
} from "../../site/modules/curriculum/batch-a/g3a-u01-visual-rank01-public-route.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";
import {
  normalizePublicPatternGroupSelection,
  togglePublicPatternGroupSelection,
} from "../../site/assets/browser/state/public-pattern-group-selection.js";

const publicPlan = Object.freeze({
  sourceId:G3A_U01_VISUAL_RANK01_SOURCE_ID,
  selectionMode:"singleKnowledgePoint",
  selectedKnowledgePointIds:Object.freeze([G3A_U01_VISUAL_RANK01_KP_ID]),
  selectedPatternGroupIds:Object.freeze([G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID]),
  patternSpecIds:Object.freeze([G3A_U01_VISUAL_RANK01_PATTERN_SPEC_ID]),
  questionMode:"numeric",
  questionCount:12,
  ordering:"groupedByPattern",
  generationSeed:"g3a-u01-rank01-public-cutover",
  includeAnswerKey:true,
  printLayout:Object.freeze({paperSize:"A4",columns:2,rowsPerPage:3,showQuestionNumbers:true,showAnswerKeyPage:true}),
});

test("Rank01 selector admission reuses the existing G3A U01 compare KP and adds exactly one public visual group", () => {
  const audit=auditG3AU01VisualRank01PublicSelector();
  assert.equal(audit.ok,true,audit.errors.join("\n"));
  assert.equal(audit.counts.addedKnowledgePoints,0);
  assert.equal(audit.counts.rank01Groups,1);
  const kp=getVisibleBatchAKnowledgePoint(G3A_U01_VISUAL_RANK01_KP_ID);
  assert.ok(kp);
  assert.equal(kp.sourceId,G3A_U01_VISUAL_RANK01_SOURCE_ID);
  const groups=getVisiblePatternGroupsForKnowledgePoint(G3A_U01_VISUAL_RANK01_KP_ID);
  const rank=groups.filter(row=>row.patternGroupId===G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID);
  assert.equal(rank.length,1);
  assert.deepEqual(rank[0].patternSpecIds,[G3A_U01_VISUAL_RANK01_PATTERN_SPEC_ID]);
  assert.equal(rank[0].visibilityStatus,"visible");
});

test("Rank01 public capability binding exposes only a bounded single-KP visual admission", () => {
  const binding=resolvePublicUiCapabilityBinding({
    sourceId:G3A_U01_VISUAL_RANK01_SOURCE_ID,
    selectionMode:"singleKnowledgePoint",
    selectedKnowledgePointIds:[G3A_U01_VISUAL_RANK01_KP_ID],
    selectedPatternGroupIds:[G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID],
    requestedQuestionType:"numeric",
  });
  assert.equal(binding.blocked,false);
  assert.equal(binding.questionType,"numeric");
  assert.equal(binding.questionCount.max,240);
  assert.ok(binding.compatiblePatternGroupIds.includes(G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID));
  assert.equal(binding.rank01VisualAdmission,true);
  assert.equal(binding.operatorLayoutReviewRequired,true);
});

test("Rank01 visual pattern selection is exclusive inside the existing compare KP", () => {
  const normalized=normalizePublicPatternGroupSelection({
    selectionMode:"singleKnowledgePoint",
    selectedKnowledgePointIds:[G3A_U01_VISUAL_RANK01_KP_ID],
    selectedPatternGroupIds:[],
  });
  assert.ok(normalized.choices.some(row=>row.patternGroupId===G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID));
  const toggled=togglePublicPatternGroupSelection({
    selectionMode:"singleKnowledgePoint",
    selectedKnowledgePointIds:[G3A_U01_VISUAL_RANK01_KP_ID],
    selectedPatternGroupIds:normalized.selectedPatternGroupIds,
    patternGroupId:G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID,
  });
  assert.deepEqual([...toggled.selectedPatternGroupIds],[G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID]);
});

test("Rank01 public route does not intercept source-unit, same-unit mixed, or unrelated group requests", () => {
  assert.equal(requestsG3AU01VisualRank01Public(publicPlan),true);
  assert.equal(requestsG3AU01VisualRank01Public({...publicPlan,selectionMode:"sourceUnit",selectedKnowledgePointIds:[],selectedPatternGroupIds:[]}),false);
  assert.equal(requestsG3AU01VisualRank01Public({...publicPlan,selectionMode:"mixedKnowledgePointsSameUnit"}),false);
  assert.equal(requestsG3AU01VisualRank01Public({...publicPlan,selectedPatternGroupIds:["pg_unrelated"],patternSpecIds:[]}),false);
});

test("Rank01 public runtime validates public metadata while hidden defaults remain valid", () => {
  const publicQ=buildG3AU01VisualRank01Question({variant:11,promptVariant:"MINIMUM_CATEGORY",publicAdmission:true});
  assert.equal(validateG3AU01VisualRank01Question(publicQ).ok,true);
  assert.equal(publicQ.metadata.hiddenRuntime,false);
  assert.equal(publicQ.metadata.selectorVisible,true);
  assert.equal(publicQ.metadata.productionUse,"public_review");

  const hiddenQ=buildG3AU01VisualRank01Question({variant:11,promptVariant:"MINIMUM_CATEGORY"});
  assert.equal(validateG3AU01VisualRank01Question(hiddenQ).ok,true);
  assert.equal(hiddenQ.metadata.hiddenRuntime,true);
  assert.equal(hiddenQ.metadata.selectorVisible,false);
  assert.equal(hiddenQ.metadata.productionUse,"forbidden");
});

test("Rank01 public worksheet produces table-backed question and answer pages for operator website review", () => {
  const result=buildG3AU01VisualRank01PublicWorksheet(publicPlan);
  assert.equal(result.ok,true,result.errors?.join("\n"));
  assert.equal(result.publicCutover,true);
  const doc=result.worksheetDocument;
  assert.equal(doc.questionCount,12);
  assert.equal(doc.generatedQuestions.length,12);
  assert.equal(doc.answerKeyItems.length,12);
  assert.equal(doc.printOptions.columns,2);
  assert.equal(doc.printOptions.rowsPerPage,3);
  assert.equal(doc.metadata.selectorVisible,true);
  assert.equal(doc.metadata.productionUse,"public_review");
  assert.equal(doc.metadata.operatorLayoutReviewRequired,true);
  assert.equal(doc.publicControls.patternGroupId,G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID);
  assert.ok(doc.generatedQuestions.every(q=>q.patternSpecId===G3A_U01_VISUAL_RANK01_PATTERN_SPEC_ID&&q.metadata.selectorVisible===true));
  const html=renderWorksheetDocumentToHtml(doc,{stylesheetHref:""});
  assert.equal((html.match(/data-representation="one-way-statistics-table"/g)??[]).length,24);
  assert.equal((html.match(/worksheet-cell--question/g)??[]).length,12);
  assert.equal((html.match(/worksheet-cell--answer-key/g)??[]).length,12);
  assert.doesNotMatch(html,/worksheet-chart/);
});
