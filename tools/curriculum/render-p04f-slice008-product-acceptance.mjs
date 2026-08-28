import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import {buildP04F8QuestionIdentity} from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-p04f8.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
import {getCurrentPixelRegistrySnapshot} from "../../site/pixel/pixel-registry-bridge.js";
import {G3B_U03_P04F3_KP_ID,G3B_U03_P04F3_SPEC_ID,G3B_U03_P04F3_UNIT_CONVERSION_KP_ID,G3B_U03_P04F3_UNIT_CONVERSION_SPEC_ID} from "../../site/modules/curriculum/registry/g3b-u03-time-12-24-conversion-selector-projection-p04f3.js";
import {G3B_U03_P04F8_SOURCE_ID,G3B_U03_P04F8_ELAPSED_KP_ID,G3B_U03_P04F8_ELAPSED_SPEC_ID,G3B_U03_P04F8_ARITHMETIC_KP_ID,G3B_U03_P04F8_ARITHMETIC_SPEC_ID} from "../../site/modules/curriculum/registry/g3b-u03-elapsed-time-regrouping-selector-projection-p04f8.js";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const OUTPUT=path.join(ROOT,"tmp/p04f-slice008-targeted-route-replay");
fs.mkdirSync(OUTPUT,{recursive:true});
const printStyles=fs.readFileSync(path.join(ROOT,"src/renderer/print-styles.css"),"utf8");
const physicalPages=file=>(fs.readFileSync(file).toString("latin1").match(/\/Type\s*\/Page(?!s)\b/g)??[]).length;
const options={sourceId:G3B_U03_P04F8_SOURCE_ID,selectionMode:"sourceUnit",questionMode:"numeric",questionCount:8,generationSeed:"p04f8-q008-targeted-route-replay",includeAnswerKey:true,printLayout:{paperSize:"A4",columns:2,rowsPerPage:4,showQuestionNumbers:true,showAnswerKeyPage:true}};
const result=buildBatchABrowserWorksheetDocument(options);
if(!result.ok||!result.worksheetDocument)throw new Error(`P04F8_TARGETED_WORKSHEET_FAILED:${JSON.stringify(result.errors)}`);
const document=result.worksheetDocument,questions=document.generatedQuestions;
const html=renderWorksheetDocumentToHtml(document,{stylesheetHref:""}).replace("</head>",`<style>${printStyles}</style></head>`);
const htmlPath=path.join(OUTPUT,"q008-targeted-route.html"),pdfPath=path.join(OUTPUT,"q008-targeted-route.pdf");
fs.writeFileSync(htmlPath,html);
const consoleErrors=[],pageErrors=[];let pageMetrics=[],renderedWorksheetPageCount=0;
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage({viewport:{width:1280,height:960},deviceScaleFactor:1});
  page.on("console",message=>{if(message.type()==="error")consoleErrors.push(message.text());});
  page.on("pageerror",error=>pageErrors.push(String(error)));
  await page.setContent(html,{waitUntil:"networkidle"});
  renderedWorksheetPageCount=await page.locator(".worksheet-page").count();
  await page.emulateMedia({media:"print"});
  pageMetrics=await page.$$eval(".worksheet-page",nodes=>nodes.map((node,index)=>({index,overflowY:node.scrollHeight>node.clientHeight+1,overflowX:node.scrollWidth>node.clientWidth+1})));
  await page.pdf({path:pdfPath,format:"A4",printBackground:true,preferCSSPageSize:true,margin:{top:"0",right:"0",bottom:"0",left:"0"}});
}finally{await browser.close();}
const isClock=q=>q.knowledgePointId===G3B_U03_P04F3_KP_ID&&q.patternSpecId===G3B_U03_P04F3_SPEC_ID;
const isUnit=q=>q.knowledgePointId===G3B_U03_P04F3_UNIT_CONVERSION_KP_ID&&q.patternSpecId===G3B_U03_P04F3_UNIT_CONVERSION_SPEC_ID;
const isElapsed=q=>q.knowledgePointId===G3B_U03_P04F8_ELAPSED_KP_ID&&q.patternSpecId===G3B_U03_P04F8_ELAPSED_SPEC_ID;
const isArithmetic=q=>q.knowledgePointId===G3B_U03_P04F8_ARITHMETIC_KP_ID&&q.patternSpecId===G3B_U03_P04F8_ARITHMETIC_SPEC_ID;
const durationText=minutes=>`${Math.floor(minutes/60)}時${minutes%60}分`;
function expected(q){
  if(isClock(q)){const h=Number(q.metadata?.hour24),direction=q.metadata?.conversionDirection;if(direction==="12_TO_24")return`${h}時`;if(h===0)return"上午12時";if(h<12)return`上午${h}時`;if(h===12)return"中午12時";return`下午${h-12}時`;}
  if(isUnit(q)){const source=Number(q.metadata?.sourceQuantity),target=Number(q.metadata?.targetQuantity),unit=q.metadata?.targetUnit;if(unit==="hour")return`${target}時`;if(unit==="minute")return`${target}分`;if(unit==="day_hour")return`${target}日${source-target*24}時`;if(unit==="hour_minute")return`${target}時${source-target*60}分`;return null;}
  if(isElapsed(q))return durationText(Number(q.metadata?.endTotalMinutes)-Number(q.metadata?.startTotalMinutes));
  if(isArithmetic(q)){const total=q.metadata?.operationDirection==="ADD"?Number(q.metadata?.leftTotalMinutes)+Number(q.metadata?.rightTotalMinutes):Number(q.metadata?.leftTotalMinutes)-Number(q.metadata?.rightTotalMinutes);return durationText(total);}
  return null;
}
const exactAnswerMismatchCount=questions.filter(q=>{const answer=expected(q);return answer==null||q.answer!==answer||q.answerText!==answer||q.finalAnswer!==answer;}).length;
const crossLayerMismatchCount=questions.filter((q,index)=>!document.answerKeyItems[index]||document.answerKeyItems[index].questionId!==q.id||document.answerKeyItems[index].answerText!==q.answerText||document.questionDisplayModels[index]?.promptText!==q.blankedDisplayText).length;
const duplicatePromptCount=questions.length-new Set(questions.map(buildP04F8QuestionIdentity)).size;
const forbiddenWordingCount=questions.filter(q=>(isElapsed(q)||isArithmetic(q))&&/班次|火車|電影|時刻表|求開始時刻|求結束時刻/.test(String(q.blankedDisplayText??""))).length;
const scopeLeakCount=questions.filter(q=>q.sourceId!==G3B_U03_P04F8_SOURCE_ID||(!isClock(q)&&!isUnit(q)&&!isElapsed(q)&&!isArithmetic(q))||(isElapsed(q)&&(q.metadata?.sameDayElapsedDuration!==true||q.metadata?.crossDayElapsed!==false||q.metadata?.scheduleReasoning!==false||q.metadata?.scheduleStartEndDurationTriad!==false||q.metadata?.solveForStartTime!==false||q.metadata?.solveForEndTime!==false))||(isArithmetic(q)&&(q.metadata?.regroupingRequired!==true||q.metadata?.durationArithmetic!==true||q.metadata?.clockTimeAddition!==false||q.metadata?.scheduleReasoning!==false||q.metadata?.scheduleStartEndDurationTriad!==false||q.metadata?.crossDayClockReasoning!==false))).length;
const arithmeticDirections=[...new Set(questions.filter(isArithmetic).map(q=>q.metadata?.operationDirection).filter(Boolean))].sort();
const registry=getCurrentPixelRegistrySnapshot(),source=registry.bySourceId[G3B_U03_P04F8_SOURCE_ID],adapter=document.metadata?.worksheetAdapter??result.p04f8WorksheetAdapter;
const report={schemaName:"P04F8Q008TargetedRouteReplayV1",publicSourceCount:registry.sourceCount,visibleKnowledgePointCount:registry.visibleKnowledgePointCount,sourceVisibleKnowledgePointCount:source?.visibleKnowledgePoints?.length??0,sourceHiddenKnowledgePointCount:source?.hiddenPendingCount??0,sourceNotSelectableKnowledgePointCount:source?.notSelectableCount??0,questionCount:questions.length,answerCount:document.answerKeyItems.length,timeSystemConversionQuestionCount:questions.filter(isClock).length,timeUnitConversionQuestionCount:questions.filter(isUnit).length,sameDayElapsedQuestionCount:questions.filter(isElapsed).length,timeRegroupingArithmeticQuestionCount:questions.filter(isArithmetic).length,arithmeticDirections,questionPageCount:document.questionPages.length,answerPageCount:document.answerKeyPages.length,renderedWorksheetPageCount,physicalPdfPageCount:physicalPages(pdfPath),exactAnswerMismatchCount,crossLayerMismatchCount,duplicatePromptCount,forbiddenWordingCount,scopeLeakCount,overflowFindingCount:pageMetrics.filter(metric=>metric.overflowX||metric.overflowY).length,consoleErrorCount:consoleErrors.length,pageErrorCount:pageErrors.length,directTextbookWitness:questions.every(q=>q.metadata?.sourcePdfTitle==="meow911_3b03_time.pdf"&&q.metadata?.sourceEvidencePages?.includes(1)),q014ScheduleSemanticsReserved:document.metadata?.reservedQ014KnowledgePointId==="kp_schedule_start_end_duration"&&document.metadata?.scheduleStartEndDurationTriad===false,sharedTimeRuntime:adapter?.sharedTimeRuntime===true,sharedPagination:adapter?.sharedPagination===true,sharedRenderer:adapter?.sharedRenderer===true,parallelPipeline:adapter?.parallelPipeline===true};
const pass=report.publicSourceCount===39&&report.visibleKnowledgePointCount===271&&report.sourceVisibleKnowledgePointCount===4&&report.sourceHiddenKnowledgePointCount===0&&report.sourceNotSelectableKnowledgePointCount===0&&report.questionCount===8&&report.answerCount===8&&report.timeSystemConversionQuestionCount===2&&report.timeUnitConversionQuestionCount===2&&report.sameDayElapsedQuestionCount===2&&report.timeRegroupingArithmeticQuestionCount===2&&JSON.stringify(report.arithmeticDirections)===JSON.stringify(["ADD","SUBTRACT"])&&report.questionPageCount===1&&report.answerPageCount===1&&report.renderedWorksheetPageCount===2&&report.physicalPdfPageCount===2&&report.exactAnswerMismatchCount===0&&report.crossLayerMismatchCount===0&&report.duplicatePromptCount===0&&report.forbiddenWordingCount===0&&report.scopeLeakCount===0&&report.overflowFindingCount===0&&report.consoleErrorCount===0&&report.pageErrorCount===0&&report.directTextbookWitness&&report.q014ScheduleSemanticsReserved&&report.sharedTimeRuntime&&report.sharedPagination&&report.sharedRenderer&&!report.parallelPipeline;
fs.writeFileSync(path.join(OUTPUT,"report.json"),`${JSON.stringify({...report,status:pass?"PASS":"FAIL"},null,2)}\n`);
if(!pass)throw new Error(`P04F8_TARGETED_ROUTE_REPLAY_FAILED:${JSON.stringify(report)}`);
console.log(`P04F8_TARGETED_ROUTE_REPLAY=${JSON.stringify(report)}`);
