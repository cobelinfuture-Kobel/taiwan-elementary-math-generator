import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import { buildP04F4QuestionIdentity } from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-p04f4.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";
import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";
import {G3B_U06_P04F4_SOURCE_ID,G3B_U06_P04F4_INDIRECT_KP_ID,G3B_U06_P04F4_INDIRECT_SPEC_ID,G3B_U06_P04F4_SCALE_KP_ID,G3B_U06_P04F4_SCALE_SPEC_ID} from "../../site/modules/curriculum/registry/g3b-u06-mass-selector-projection-p04f4.js";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const OUTPUT=path.join(ROOT,"tmp/p04f-slice004-targeted-route-replay");
fs.mkdirSync(OUTPUT,{recursive:true});
const printStyles=fs.readFileSync(path.join(ROOT,"src/renderer/print-styles.css"),"utf8");
const physicalPages=file=>(fs.readFileSync(file).toString("latin1").match(/\/Type\s*\/Page(?!s)\b/g)??[]).length;

const options={sourceId:G3B_U06_P04F4_SOURCE_ID,selectionMode:"sourceUnit",questionMode:"numeric",questionCount:8,generationSeed:"p04f4-q004-targeted-route-replay",includeAnswerKey:true,printLayout:{paperSize:"A4",columns:2,rowsPerPage:4,showQuestionNumbers:true,showAnswerKeyPage:true}};
const result=buildBatchABrowserWorksheetDocument(options);
if(!result.ok||!result.worksheetDocument)throw new Error(`P04F4_TARGETED_WORKSHEET_FAILED:${JSON.stringify(result.errors)}`);
const document=result.worksheetDocument,questions=document.generatedQuestions;
const html=renderWorksheetDocumentToHtml(document,{stylesheetHref:""}).replace("</head>",`<style>${printStyles}</style></head>`);
const htmlPath=path.join(OUTPUT,"q004-targeted-route.html"),pdfPath=path.join(OUTPUT,"q004-targeted-route.pdf");
fs.writeFileSync(htmlPath,html);
const consoleErrors=[],pageErrors=[];let pageMetrics=[],renderedWorksheetPageCount=0,renderedScaleCount=0;
const browser=await chromium.launch({headless:true});
try{const page=await browser.newPage({viewport:{width:1280,height:960},deviceScaleFactor:1});page.on("console",m=>{if(m.type()==="error")consoleErrors.push(m.text());});page.on("pageerror",e=>pageErrors.push(String(e)));await page.setContent(html,{waitUntil:"networkidle"});renderedWorksheetPageCount=await page.locator(".worksheet-page").count();renderedScaleCount=await page.locator('[data-representation="measurement-scale"]').count();await page.emulateMedia({media:"print"});pageMetrics=await page.$$eval(".worksheet-page",nodes=>nodes.map((node,index)=>({index,overflowY:node.scrollHeight>node.clientHeight+1,overflowX:node.scrollWidth>node.clientWidth+1})));await page.pdf({path:pdfPath,format:"A4",printBackground:true,preferCSSPageSize:true,margin:{top:"0",right:"0",bottom:"0",left:"0"}});}finally{await browser.close();}

const relation=(l,r)=>l<r?"<":l>r?">":"=";
const expectedAnswer=q=>q.knowledgePointId===G3B_U06_P04F4_INDIRECT_KP_ID?relation(Number(q.metadata?.leftReferenceMassGrams),Number(q.metadata?.rightReferenceMassGrams)):q.knowledgePointId===G3B_U06_P04F4_SCALE_KP_ID?`${q.metadata?.pointerValue} ${q.metadata?.unitLabel}`:null;
const isIndirect=q=>q.knowledgePointId===G3B_U06_P04F4_INDIRECT_KP_ID&&q.patternSpecId===G3B_U06_P04F4_INDIRECT_SPEC_ID;
const isScale=q=>q.knowledgePointId===G3B_U06_P04F4_SCALE_KP_ID&&q.patternSpecId===G3B_U06_P04F4_SCALE_SPEC_ID;
const forbidden=/換算|加法|減法|乘法|進位|退位|公斤換公克|公克換公斤/;
const exactAnswerMismatchCount=questions.filter(q=>{const expected=expectedAnswer(q);if(isIndirect(q))return q.answer!==expected||q.answerText!==expected||q.finalAnswer!==expected;if(isScale(q))return q.answer!==Number(q.metadata?.pointerValue)||q.answerText!==expected||q.finalAnswer!==expected;return true;}).length;
const crossLayerMismatchCount=questions.filter((q,index)=>!document.answerKeyItems[index]||document.answerKeyItems[index].questionId!==q.id||document.answerKeyItems[index].answerText!==q.answerText||document.questionDisplayModels[index]?.promptText!==q.blankedDisplayText||(isScale(q)&&document.questionDisplayModels[index]?.numberLine?.kind!=="measurement_scale")).length;
const duplicatePromptCount=questions.length-new Set(questions.map(buildP04F4QuestionIdentity)).size;
const forbiddenWordingCount=questions.filter(q=>forbidden.test(String(q.blankedDisplayText??""))).length;
const scopeLeakCount=questions.filter(q=>q.sourceId!==G3B_U06_P04F4_SOURCE_ID||(!isIndirect(q)&&!isScale(q))||q.metadata?.kgGConversion!==false||q.metadata?.mixedUnitComparison!==false||q.metadata?.massArithmetic!==false||q.metadata?.massTimesInteger!==false||(isIndirect(q)&&q.numberLine)||(isScale(q)&&(q.numberLine?.kind!=="measurement_scale"||q.metadata?.scaleInstrument!==true))).length;
const registry=getCurrentPixelRegistrySnapshot(),source=registry.bySourceId[G3B_U06_P04F4_SOURCE_ID],adapter=document.metadata?.worksheetAdapter??result.p04f4WorksheetAdapter;
const report={schemaName:"P04F4Q004TargetedRouteReplayV1",publicSourceCount:registry.sourceCount,visibleKnowledgePointCount:registry.visibleKnowledgePointCount,sourceVisibleKnowledgePointCount:source?.visibleKnowledgePoints?.length??0,sourceHiddenKnowledgePointCount:source?.hiddenPendingCount??0,sourceNotSelectableKnowledgePointCount:source?.notSelectableCount??0,questionCount:questions.length,answerCount:document.answerKeyItems.length,indirectQuestionCount:questions.filter(isIndirect).length,scaleQuestionCount:questions.filter(isScale).length,questionPageCount:document.questionPages.length,answerPageCount:document.answerKeyPages.length,renderedWorksheetPageCount,physicalPdfPageCount:physicalPages(pdfPath),renderedScaleCount,exactAnswerMismatchCount,crossLayerMismatchCount,duplicatePromptCount,forbiddenWordingCount,scopeLeakCount,overflowFindingCount:pageMetrics.filter(m=>m.overflowX||m.overflowY).length,consoleErrorCount:consoleErrors.length,pageErrorCount:pageErrors.length,directTextbookWitness:questions.every(q=>q.metadata?.sourcePdfTitle==="meow911_3b06_kg_g.pdf"&&q.metadata?.sourceEvidencePages?.includes(1)),sharedQuantityRuntime:adapter?.sharedQuantityRuntime===true,sharedPagination:adapter?.sharedPagination===true,sharedRenderer:adapter?.sharedRenderer===true,parallelPipeline:adapter?.parallelPipeline===true};
const pass=report.publicSourceCount===38&&report.visibleKnowledgePointCount===265&&report.sourceVisibleKnowledgePointCount===2&&report.sourceHiddenKnowledgePointCount===0&&report.sourceNotSelectableKnowledgePointCount===0&&report.questionCount===8&&report.answerCount===8&&report.indirectQuestionCount===4&&report.scaleQuestionCount===4&&report.questionPageCount===1&&report.answerPageCount===1&&report.renderedWorksheetPageCount===2&&report.physicalPdfPageCount===2&&report.renderedScaleCount===8&&report.exactAnswerMismatchCount===0&&report.crossLayerMismatchCount===0&&report.duplicatePromptCount===0&&report.forbiddenWordingCount===0&&report.scopeLeakCount===0&&report.overflowFindingCount===0&&report.consoleErrorCount===0&&report.pageErrorCount===0&&report.directTextbookWitness&&report.sharedQuantityRuntime&&report.sharedPagination&&report.sharedRenderer&&!report.parallelPipeline;
fs.writeFileSync(path.join(OUTPUT,"report.json"),`${JSON.stringify({...report,status:pass?"PASS":"FAIL"},null,2)}\n`);
if(!pass)throw new Error(`P04F4_TARGETED_ROUTE_REPLAY_FAILED:${JSON.stringify(report)}`);
console.log(`P04F4_TARGETED_ROUTE_REPLAY=${JSON.stringify(report)}`);
