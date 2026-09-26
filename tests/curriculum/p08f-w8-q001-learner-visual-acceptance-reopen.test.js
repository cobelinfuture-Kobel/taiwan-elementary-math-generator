import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {generateG4AU03P08F01Questions} from "../../site/modules/curriculum/batch-a/g4a-u03-protractor-angle-measurement-runtime-p08f01.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p08f01-extension.js";
import {renderProtractorAngleMeasurementDiagram} from "../../site/modules/renderer/html-renderer.js";
import {G4A_U03_P08F01_KP_ID as KP,G4A_U03_P08F01_SOURCE_ID as SRC,G4A_U03_P08F01_PATTERN_SPECS as SPECS} from "../../site/modules/curriculum/registry/g4a-u03-protractor-angle-measurement-selector-projection-p08f01.js";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const authority=read("data/curriculum/full-product/p08f/q001-learner-visual-acceptance-reopen.json");
const req=(count,seed="visual")=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"diagram",questionCount:count,generationSeed:seed,includeAnswerKey:true,printLayout:{columns:3,rowsPerPage:5,showAnswerKeyPage:true}});

test("Q001 false D0 is reopened until actual print human review",()=>{
 assert.equal(authority.status,"REOPENED_IMPLEMENTATION_MATERIALIZED_AWAITING_ACTUAL_PRINT_HUMAN_REVIEW");
 assert.equal(authority.previousCloseout.disposition,"REVOKED_AS_CURRENT_D0_AUTHORITY_BY_OPERATOR_VISUAL_EVIDENCE");
 assert.deepEqual(authority.distance.remainingBlockers,["OPERATOR_ACTUAL_PRINT_HUMAN_REVIEW"]);
 assert.equal(authority.forbiddenScope.q002Implementation,false);
});

test("Q001 reading questions use fixed-horizontal complete dual-scale protractors and explicit answer space",()=>{
 for(const s of SPECS.filter(x=>x.relation!=="VERIFY_PROTRACTOR_ALIGNMENT")){
  const q=generateG4AU03P08F01Questions({questionCount:40,patternSpecIds:[s.patternSpecId],generationSeed:"visual-"+s.patternSpecId});assert.equal(q.ok,true,q.errors.join("\n"));
  assert.ok(q.questions.every(x=>x.geometryDiagram.rotationDeg===0&&x.geometryDiagram.instrumentFixedHorizontal===true&&x.geometryDiagram.centerAligned&&x.geometryDiagram.zeroBaselineAligned));
  assert.ok(q.questions.every(x=>/答：______ 度/.test(x.promptText)));
  assert.equal(new Set(q.questions.map(x=>x.answerValue)).size,40);
  const html=renderProtractorAngleMeasurementDiagram(q.questions[0].geometryDiagram);
  assert.match(html,/viewBox="0 0 320 205"/);assert.match(html,/height="165"/);assert.match(html,/data-instrument-horizontal="true"/);assert.match(html,/protractor-tick--minor/);
  assert.match(html,/data-scale-origin="LEFT"/);assert.match(html,/data-scale-origin="RIGHT"/);
 }
});

test("Q001 alignment keeps instrument horizontal and expresses center/zero errors on the angle itself",()=>{
 const q=generateG4AU03P08F01Questions({questionCount:120,patternSpecIds:[SPECS.find(x=>x.relation==="VERIFY_PROTRACTOR_ALIGNMENT").patternSpecId],generationSeed:"visual-alignment"});assert.equal(q.ok,true,q.errors.join("\n"));
 assert.deepEqual([...new Set(q.questions.map(x=>x.answerText))].sort(),["A","B","C","D"]);
 assert.ok(q.questions.every(x=>x.geometryDiagram.rotationDeg===0&&x.geometryDiagram.instrumentFixedHorizontal===true));
 assert.ok(q.questions.some(x=>!x.geometryDiagram.centerAligned&&x.geometryDiagram.centerOffsetPx!==0));
 assert.ok(q.questions.some(x=>!x.geometryDiagram.zeroBaselineAligned&&x.geometryDiagram.scaleRotationOffsetDeg!==0));
 assert.ok(q.questions.every(x=>/答案：______/.test(x.promptText)));
});

test("Q001 learner worksheet forces 2 columns x 3 rows and expands pages instead of shrinking diagrams",()=>{
 const w=buildBatchABrowserWorksheetDocument(req(15,"visual-pagination"));assert.equal(w.ok,true,w.errors.join("\n"));
 assert.equal(w.worksheetDocument.printOptions.requestedColumns,3);assert.equal(w.worksheetDocument.printOptions.columns,2);
 assert.equal(w.worksheetDocument.printOptions.requestedRowsPerPage,5);assert.equal(w.worksheetDocument.printOptions.rowsPerPage,3);
 assert.deepEqual(w.worksheetDocument.questionPages.map(p=>p.cells.filter(c=>c.cellType==="question").length),[6,6,3]);
 assert.deepEqual(w.worksheetDocument.answerKeyPages.map(p=>p.cells.filter(c=>c.cellType==="answerKey").length),[6,6,3]);
 assert.equal(w.worksheetDocument.metadata.humanVisualReviewStatus,"PENDING_OPERATOR");
 assert.ok(w.warnings.includes("P08F01_PROTRACTOR_LAYOUT_FORCED_TO_TWO_COLUMNS_THREE_ROWS_FOR_HUMAN_READABILITY"));
});
