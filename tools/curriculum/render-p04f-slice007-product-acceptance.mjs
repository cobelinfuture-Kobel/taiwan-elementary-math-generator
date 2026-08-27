import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import {buildP04F7QuestionIdentity} from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-p04f7.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
import {getCurrentPixelRegistrySnapshot} from "../../site/pixel/pixel-registry-bridge.js";
import {G3B_U02_P04F2_KP_ID,G3B_U02_P04F2_SPEC_ID} from "../../site/modules/curriculum/registry/g3b-u02-capacity-unit-identity-selector-projection-p04f2.js";
import {G3B_U02_P04F7_SOURCE_ID,G3B_U02_P04F7_SCALE_KP_ID,G3B_U02_P04F7_SCALE_SPEC_ID,G3B_U02_P04F7_CONVERSION_KP_ID,G3B_U02_P04F7_CONVERSION_SPEC_ID} from "../../site/modules/curriculum/registry/g3b-u02-capacity-scale-conversion-selector-projection-p04f7.js";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const OUTPUT=path.join(ROOT,"tmp/p04f-slice007-targeted-route-replay");
fs.mkdirSync(OUTPUT,{recursive:true});
const printStyles=fs.readFileSync(path.join(ROOT,"src/renderer/print-styles.css"),"utf8");
const physicalPages=file=>(fs.readFileSync(file).toString("latin1").match(/\/Type\s*\/Page(?!s)\b/g)??[]).length;
const options={sourceId:G3B_U02_P04F7_SOURCE_ID,selectionMode:"sourceUnit",questionMode:"numeric",questionCount:8,generationSeed:"p04f7-q007-targeted-route-replay",includeAnswerKey:true,printLayout:{paperSize:"A4",columns:2,rowsPerPage:4,showQuestionNumbers:true,showAnswerKeyPage:true}};
const result=buildBatchABrowserWorksheetDocument(options);
if(!result.ok||!result.worksheetDocument)throw new Error(`P04F7_TARGETED_WORKSHEET_FAILED:${JSON.stringify(result.errors)}`);
const document=result.worksheetDocument,questions=document.generatedQuestions;
const html=renderWorksheetDocumentToHtml(document,{stylesheetHref:""}).replace("</head>",`<style>${printStyles}</style></head>`);
const htmlPath=path.join(OUTPUT,"q007-targeted-route.html"),pdfPath=path.join(OUTPUT,"q007-targeted-route.pdf");
fs.writeFileSync(htmlPath,html);
const consoleErrors=[],pageErrors=[];let pageMetrics=[],renderedWorksheetPageCount=0,renderedScaleCount=0;
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage({viewport:{width:1280,height:960},deviceScaleFactor:1});
  page.on("console",m=>{if(m.type()==="error")consoleErrors.push(m.text());});
  page.on("pageerror",e=>pageErrors.push(String(e)));
  await page.setContent(html,{waitUntil:"networkidle"});
  renderedWorksheetPageCount=await page.locator(".worksheet-page").count();
  renderedScaleCount=await page.locator('[data-representation="measurement-scale"]').count();
  await page.emulateMedia({media:"print"});
  pageMetrics=await page.$$eval(".worksheet-page",nodes=>nodes.map((node,index)=>({index,overflowY:node.scrollHeight>node.clientHeight+1,overflowX:node.scrollWidth>node.clientWidth+1})));
  await page.pdf({path:pdfPath,format:"A4",printBackground:true,preferCSSPageSize:true,margin:{top:"0",right:"0",bottom:"0",left:"0"}});
}finally{await browser.close();}

const isIdentity=q=>q.knowledgePointId===G3B_U02_P04F2_KP_ID&&q.patternSpecId===G3B_U02_P04F2_SPEC_ID;
const isScale=q=>q.knowledgePointId===G3B_U02_P04F7_SCALE_KP_ID&&q.patternSpecId===G3B_U02_P04F7_SCALE_SPEC_ID;
const isConversion=q=>q.knowledgePointId===G3B_U02_P04F7_CONVERSION_KP_ID&&q.patternSpecId===G3B_U02_P04F7_CONVERSION_SPEC_ID;
function expected(q){
  if(isIdentity(q)){const text=q.metadata?.capacityScaleClass==="smaller_capacity"?"毫升":q.metadata?.capacityScaleClass==="larger_capacity"?"公升":null;return{answer:text,answerText:text};}
  if(isScale(q)){const value=Number(q.metadata?.stepValue)*Number(q.metadata?.pointerTickIndex);return{answer:value,answerText:`${value} 毫升`};}
  if(isConversion(q)){const total=Number(q.metadata?.litres)*1000+Number(q.metadata?.remainderMillilitres);const text=q.metadata?.conversionDirection==="ML_TO_L_ML"?`${q.metadata?.litres} 公升 ${q.metadata?.remainderMillilitres} 毫升`:`${total} 毫升`;return{answer:text,answerText:text,total};}
  return{answer:null,answerText:null};
}
const exactAnswerMismatchCount=questions.filter(q=>{const e=expected(q);return e.answer==null||q.answer!==e.answer||q.answerText!==e.answerText||q.finalAnswer!==e.answer||(isConversion(q)&&q.metadata?.totalMillilitres!==e.total);}).length;
const crossLayerMismatchCount=questions.filter((q,index)=>!document.answerKeyItems[index]||document.answerKeyItems[index].questionId!==q.id||document.answerKeyItems[index].answerText!==q.answerText||document.questionDisplayModels[index]?.promptText!==q.blankedDisplayText||(isScale(q)&&document.questionDisplayModels[index]?.numberLine?.kind!=="measurement_scale")||(!isScale(q)&&document.questionDisplayModels[index]?.numberLine)).length;
const duplicatePromptCount=questions.length-new Set(questions.map(buildP04F7QuestionIdentity)).size;
const forbiddenWordingCount=questions.filter(q=>(isScale(q)||isConversion(q))&&/估算|比較|比大小|加法|減法|進位|退位|相差|合計/.test(String(q.blankedDisplayText??""))).length;
const scopeLeakCount=questions.filter(q=>q.sourceId!==G3B_U02_P04F7_SOURCE_ID||(!isIdentity(q)&&!isScale(q)&&!isConversion(q))||(isScale(q)&&(q.metadata?.containerScaleReading!==true||q.metadata?.capacityEstimation!==false||q.metadata?.mixedUnitComparison!==false||q.metadata?.mixedUnitArithmetic!==false))||(isConversion(q)&&(q.metadata?.millilitresPerLitre!==1000||q.metadata?.standaloneConversionQuestion!==true||q.metadata?.capacityEstimation!==false||q.metadata?.mixedUnitComparison!==false||q.metadata?.mixedUnitArithmetic!==false))).length;
const conversionDirections=[...new Set(questions.filter(isConversion).map(q=>q.metadata?.conversionDirection).filter(Boolean))].sort();
const registry=getCurrentPixelRegistrySnapshot(),source=registry.bySourceId[G3B_U02_P04F7_SOURCE_ID],adapter=document.metadata?.worksheetAdapter??result.p04f7WorksheetAdapter;
const report={schemaName:"P04F7Q007TargetedRouteReplayV1",publicSourceCount:registry.sourceCount,visibleKnowledgePointCount:registry.visibleKnowledgePointCount,sourceVisibleKnowledgePointCount:source?.visibleKnowledgePoints?.length??0,sourceHiddenKnowledgePointCount:source?.hiddenPendingCount??0,sourceNotSelectableKnowledgePointCount:source?.notSelectableCount??0,questionCount:questions.length,answerCount:document.answerKeyItems.length,identityQuestionCount:questions.filter(isIdentity).length,scaleQuestionCount:questions.filter(isScale).length,conversionQuestionCount:questions.filter(isConversion).length,conversionDirections,questionPageCount:document.questionPages.length,answerPageCount:document.answerKeyPages.length,renderedWorksheetPageCount,physicalPdfPageCount:physicalPages(pdfPath),renderedScaleCount,exactAnswerMismatchCount,crossLayerMismatchCount,duplicatePromptCount,forbiddenWordingCount,scopeLeakCount,overflowFindingCount:pageMetrics.filter(m=>m.overflowX||m.overflowY).length,consoleErrorCount:consoleErrors.length,pageErrorCount:pageErrors.length,directTextbookWitness:questions.every(q=>q.metadata?.sourcePdfTitle==="meow911_3b02_l_ml.pdf"&&q.metadata?.sourceEvidencePages?.includes(1)),sharedQuantityRuntime:adapter?.sharedQuantityRuntime===true,sharedPagination:adapter?.sharedPagination===true,sharedRenderer:adapter?.sharedRenderer===true,parallelPipeline:adapter?.parallelPipeline===true};
const pass=report.publicSourceCount===39&&report.visibleKnowledgePointCount===269&&report.sourceVisibleKnowledgePointCount===3&&report.sourceHiddenKnowledgePointCount===0&&report.sourceNotSelectableKnowledgePointCount===0&&report.questionCount===8&&report.answerCount===8&&report.identityQuestionCount===3&&report.scaleQuestionCount===3&&report.conversionQuestionCount===2&&JSON.stringify(report.conversionDirections)===JSON.stringify(["L_ML_TO_ML","ML_TO_L_ML"])&&report.questionPageCount===1&&report.answerPageCount===1&&report.renderedWorksheetPageCount===2&&report.physicalPdfPageCount===2&&report.renderedScaleCount===6&&report.exactAnswerMismatchCount===0&&report.crossLayerMismatchCount===0&&report.duplicatePromptCount===0&&report.forbiddenWordingCount===0&&report.scopeLeakCount===0&&report.overflowFindingCount===0&&report.consoleErrorCount===0&&report.pageErrorCount===0&&report.directTextbookWitness&&report.sharedQuantityRuntime&&report.sharedPagination&&report.sharedRenderer&&!report.parallelPipeline;
fs.writeFileSync(path.join(OUTPUT,"report.json"),`${JSON.stringify({...report,status:pass?"PASS":"FAIL"},null,2)}\n`);
if(!pass)throw new Error(`P04F7_TARGETED_ROUTE_REPLAY_FAILED:${JSON.stringify(report)}`);
console.log(`P04F7_TARGETED_ROUTE_REPLAY=${JSON.stringify(report)}`);
