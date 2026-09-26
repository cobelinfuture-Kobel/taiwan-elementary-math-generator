import test from "node:test";
import assert from "node:assert/strict";
import {generateG4AU03P08F01Questions,validateG4AU03P08F01Question,validateG4AU03P08F01Answer} from "../../site/modules/curriculum/batch-a/g4a-u03-protractor-angle-measurement-runtime-p08f01.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p08f01-extension.js";
import {buildWorksheetDocumentFromPlan as buildPublicPipelineDocument} from "../../site/assets/browser/pipeline/build-worksheet-document-p01e-closeout.js";
import {renderWorksheetDocumentToHtml,renderProtractorAngleMeasurementDiagram} from "../../site/modules/renderer/html-renderer.js";
import {G4A_U03_P08F01_KP_ID as KP,G4A_U03_P08F01_SOURCE_ID as SRC,G4A_U03_P08F01_PATTERN_SPECS as SPECS} from "../../site/modules/curriculum/registry/g4a-u03-protractor-angle-measurement-selector-projection-p08f01.js";

const req=(count,seed="learner-facing")=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"diagram",questionCount:count,generationSeed:seed,includeAnswerKey:true,printLayout:{columns:3,rowsPerPage:5,showAnswerKeyPage:true}});
test("Q001 learner-facing generator is deterministic, balanced and non-linear at 15/20/120",()=>{
 for(const count of [15,20,120]){
  const a=generateG4AU03P08F01Questions({questionCount:count,generationSeed:"lf-"+count}),b=generateG4AU03P08F01Questions({questionCount:count,generationSeed:"lf-"+count});
  assert.equal(a.ok,true,a.errors.join("\n"));assert.deepEqual(a.questions,b.questions);assert.equal(a.questions.length,count);
  const counts=Object.fromEntries(SPECS.map(s=>[s.patternSpecId,a.questions.filter(q=>q.patternSpecId===s.patternSpecId).length]));
  assert.ok(Math.max(...Object.values(counts))-Math.min(...Object.values(counts))<=1);
  assert.ok(a.questions.every(q=>validateG4AU03P08F01Question(q).ok&&validateG4AU03P08F01Answer(q,q.answerText).ok));
 }
 const q=generateG4AU03P08F01Questions({questionCount:15,generationSeed:"lf-sequence"}).questions;
 assert.notDeepEqual(q.slice(0,9).map(x=>x.patternSpecId),Array.from({length:9},(_,i)=>SPECS[i%3].patternSpecId));
 const degrees=q.filter(x=>x.relation!=="VERIFY_PROTRACTOR_ALIGNMENT").map(x=>x.answerValue);
 assert.ok(new Set(degrees.slice(1).map((v,i)=>(v-degrees[i]+160)%160)).size>1);
});

test("Q001 alignment diagnosis exposes all four center/zero-line states without a new PatternSpec",()=>{
 const q=generateG4AU03P08F01Questions({questionCount:120,generationSeed:"lf-alignment"}).questions.filter(x=>x.relation==="VERIFY_PROTRACTOR_ALIGNMENT");
 assert.deepEqual([...new Set(q.map(x=>x.answerText))].sort(),["A","B","C","D"]);
 assert.ok(q.every(x=>x.metadata.alignmentDiagnosticResolution==="CENTER_AND_ZERO_LINE_4_STATE"));
 assert.equal(SPECS.find(x=>x.relation==="VERIFY_PROTRACTOR_ALIGNMENT").answerDomain,"ALIGNMENT_STATE_4WAY_ZH");
});

test("Q001 renderer always shows dual left-origin and right-origin scales",()=>{
 const q=generateG4AU03P08F01Questions({questionCount:1,patternSpecIds:[SPECS[0].patternSpecId],generationSeed:"lf-dual"}).questions[0];
 const html=renderProtractorAngleMeasurementDiagram(q.geometryDiagram);
 assert.match(html,/data-dual-scale="true"/);assert.match(html,/protractor-scale-label--outer/);assert.match(html,/protractor-scale-label--inner/);
 assert.match(html,/data-scale-origin="LEFT"/);assert.match(html,/data-scale-origin="RIGHT"/);assert.match(html,/aria-label="雙刻度量角器量角圖"/);
});

test("Q001 3x5 request is print-safely materialized as 3x4 pages so 15 items cannot occupy one page",()=>{
 const w=buildBatchABrowserWorksheetDocument(req(15,"lf-pagination"));assert.equal(w.ok,true,w.errors.join("\n"));
 assert.equal(w.worksheetDocument.printOptions.columns,3);assert.equal(w.worksheetDocument.printOptions.requestedRowsPerPage,5);assert.equal(w.worksheetDocument.printOptions.rowsPerPage,4);
 assert.equal(w.worksheetDocument.printOptions.layoutAdjustedForProtractor,true);assert.equal(w.worksheetDocument.questionPages.length,2);
 assert.deepEqual(w.worksheetDocument.questionPages.map(p=>p.cells.filter(c=>c.cellType==="question").length),[12,3]);
 assert.ok(w.warnings.includes("P08F01_PROTRACTOR_LAYOUT_ROWS_CLAMPED_FOR_PRINT_SAFETY"));
 const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""});
 assert.equal((html.match(/data-dual-scale="true"/g)||[]).length,30);
});

test("Q001 current public worksheet pipeline uses the same protractor-safe pagination contract",()=>{
 const w=buildPublicPipelineDocument(req(15,"lf-public-pipeline"));assert.equal(w.ok,true,w.errors?.join("\\n")??"");
 assert.equal(w.p08f01Implemented,true);assert.equal(w.worksheetDocument.printOptions.columns,3);assert.equal(w.worksheetDocument.printOptions.rowsPerPage,4);
 assert.equal(w.worksheetDocument.questionPages.length,2);assert.deepEqual(w.worksheetDocument.questionPages.map(p=>p.cells.filter(c=>c.cellType==="question").length),[12,3]);
});

test("Q001 repair preserves source FormalMapping identity and does not admit later G4A-U03 scope",()=>{
 const g=generateG4AU03P08F01Questions({questionCount:20,generationSeed:"lf-scope"});assert.equal(g.ok,true);
 assert.ok(g.questions.every(q=>q.sourceId===SRC&&q.knowledgePointId===KP&&!q.metadata.angleCompositionReowned&&!q.metadata.rotationClockReowned&&!q.metadata.estimationClassificationReowned&&!q.metadata.unknownAngleReowned&&!q.metadata.q002OrLaterTouched));
});
