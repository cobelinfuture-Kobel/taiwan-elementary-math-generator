import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f1-extension.js";
import {validateG3AU05P05F1Question} from "../../site/modules/curriculum/batch-a/g3a-u05-angle-parts-runtime-p05f1.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
import {auditP05F1PublicSelectorComposition,listBatchAKnowledgePointAvailabilityBySource} from "../../site/modules/curriculum/registry/batch-a-selector-p05f1-extension.js";
import {resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p05f1.js";
import {G3A_U05_P05F1_FUTURE_KP_IDS,G3A_U05_P05F1_GROUP_ID,G3A_U05_P05F1_KP_ID,G3A_U05_P05F1_SOURCE_ID,G3A_U05_P05F1_SPEC_IDS} from "../../site/modules/curriculum/registry/g3a-u05-angle-parts-selector-projection-p05f1.js";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const OUTPUT=path.join(ROOT,"tmp/p05f-w5-slice001-targeted-route-replay");
fs.mkdirSync(OUTPUT,{recursive:true});
const printStyles=fs.readFileSync(path.join(ROOT,"site/assets/styles/print-styles.css"),"utf8");
const options={sourceId:G3A_U05_P05F1_SOURCE_ID,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[G3A_U05_P05F1_KP_ID],selectedPatternGroupIds:[G3A_U05_P05F1_GROUP_ID],patternSpecIds:[...G3A_U05_P05F1_SPEC_IDS],questionMode:"diagram",requestedQuestionType:"diagram",questionCount:24,generationSeed:"p05f-w5-slice001-targeted-route",includeAnswerKey:true,printLayout:{paperSize:"A4",columns:2,rowsPerPage:4,showQuestionNumbers:true,showAnswerKeyPage:true}};

const binding=resolvePublicUiCapabilityBinding(options);
if(binding.blocked||binding.questionType!=="diagram"||binding.questionCount.max!==240||binding.compatiblePatternGroupIds.length!==1||binding.patternSpecIds.length!==4||binding.geometryDiagramRepresentation!==true||binding.applicationSuitability!=="APPLICATION_NOT_APPLICABLE"||binding.sharedRuntimeScope!=="SHARED_RUNTIME_BOUNDED")throw new Error(`P05F1_PUBLIC_BINDING_FAILED:${JSON.stringify(binding)}`);
const result=buildBatchABrowserWorksheetDocument(options);
if(!result.ok||!result.worksheetDocument)throw new Error(`P05F1_TARGETED_WORKSHEET_FAILED:${JSON.stringify(result.errors)}`);
const document=result.worksheetDocument,questions=document.generatedQuestions;
const html=renderWorksheetDocumentToHtml(document,{stylesheetHref:""}).replace("</head>",`<style>${printStyles}</style></head>`);
const htmlPath=path.join(OUTPUT,"q001-targeted-g3a-u05-diagram.html");
fs.writeFileSync(htmlPath,html);

const consoleErrors=[],pageErrors=[];
let metrics=[],renderedWorksheetPageCount=0,diagramCount=0,sideLineCount=0,vertexMarkerCount=0,angleArcCount=0,labelPointCount=0,highlightedSideCount=0;
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage({viewport:{width:1280,height:960},deviceScaleFactor:1});
  page.on("console",message=>{if(message.type()==="error")consoleErrors.push(message.text());});
  page.on("pageerror",error=>pageErrors.push(String(error)));
  await page.setContent(html,{waitUntil:"networkidle"});
  renderedWorksheetPageCount=await page.locator(".worksheet-page").count();
  diagramCount=await page.locator(".worksheet-angle-parts-diagram").count();
  sideLineCount=await page.locator(".angle-parts-diagram__side").count();
  vertexMarkerCount=await page.locator(".angle-parts-diagram__marker--vertex").count();
  angleArcCount=await page.locator(".angle-parts-diagram__marker--arc").count();
  labelPointCount=await page.locator(".angle-parts-diagram__marker--label-point").count();
  highlightedSideCount=await page.locator('.angle-parts-diagram__side[stroke-width="7"]').count();
  await page.emulateMedia({media:"print"});
  metrics=await page.$$eval(".worksheet-page",nodes=>nodes.map((node,index)=>({index,overflowY:node.scrollHeight>node.clientHeight+1,overflowX:node.scrollWidth>node.clientWidth+1})));
}finally{await browser.close();}

const selectorAudit=auditP05F1PublicSelectorComposition();
const availability=listBatchAKnowledgePointAvailabilityBySource(G3A_U05_P05F1_SOURCE_ID);
const validatorFailureCount=questions.filter((question)=>!validateG3AU05P05F1Question(question).ok).length;
const crossLayerMismatchCount=questions.filter((question,index)=>!document.answerKeyItems[index]||document.answerKeyItems[index].questionId!==question.id||document.answerKeyItems[index].answerText!==question.answerText||document.questionDisplayModels[index]?.geometryDiagram?.kind!=="angle_parts_diagram"||document.answerKeyItems[index]?.geometryDiagram?.kind!=="angle_parts_diagram").length;
const duplicateSignatureCount=questions.length-new Set(questions.map((question)=>question.questionSignature)).size;
const scopeLeakCount=questions.filter((question)=>question.sourceId!==G3A_U05_P05F1_SOURCE_ID||question.knowledgePointId!==G3A_U05_P05F1_KP_ID||question.patternGroupId!==G3A_U05_P05F1_GROUP_ID||question.questionMode!=="diagram"||!G3A_U05_P05F1_SPEC_IDS.includes(question.patternSpecId)||question.metadata?.applicationContextUsed!==false||question.promptText.includes("射線")).length;
const allocation=G3A_U05_P05F1_SPEC_IDS.map((patternSpecId)=>questions.filter((question)=>question.patternSpecId===patternSpecId).length);
const answerParts=[...new Set(questions.map((question)=>question.answerText))].sort();
const futureBoundaryFailureCount=G3A_U05_P05F1_FUTURE_KP_IDS.filter((id)=>availability.visibleKnowledgePointIds.includes(id)||!availability.hiddenPendingKnowledgePointIds.includes(id)||!availability.notSelectableKnowledgePointIds.includes(id)).length;
const report={schemaName:"P05FW5Q001TargetedRouteReplayV1",publicSourceCount:selectorAudit.counts.sources,visibleKnowledgePointCount:selectorAudit.counts.knowledgePoints,g3aU05VisibleCount:availability.visibleCount,g3aU05HiddenCount:availability.hiddenPendingCount,g3aU05NotSelectableCount:availability.notSelectableCount,targetVisible:availability.visibleKnowledgePointIds.includes(G3A_U05_P05F1_KP_ID),futureBoundaryFailureCount,questionCount:questions.length,answerCount:document.answerKeyItems.length,allocation,answerParts,questionPageCount:document.questionPages.length,answerPageCount:document.answerKeyPages.length,renderedWorksheetPageCount,diagramCount,sideLineCount,vertexMarkerCount,angleArcCount,labelPointCount,highlightedSideCount,validatorFailureCount,crossLayerMismatchCount,duplicateSignatureCount,scopeLeakCount,overflowFindingCount:metrics.filter((metric)=>metric.overflowX||metric.overflowY).length,consoleErrorCount:consoleErrors.length,pageErrorCount:pageErrors.length,bindingQuestionType:binding.questionType,bindingQuestionCountMax:binding.questionCount.max,bindingPatternGroupCount:binding.compatiblePatternGroupIds.length,bindingPatternSpecCount:binding.patternSpecIds.length,geometryDiagramRepresentation:binding.geometryDiagramRepresentation,applicationSuitability:binding.applicationSuitability,sharedRuntimeScope:binding.sharedRuntimeScope};
const pass=selectorAudit.ok&&report.publicSourceCount===44&&report.visibleKnowledgePointCount===313&&report.g3aU05VisibleCount===1&&report.g3aU05HiddenCount===3&&report.g3aU05NotSelectableCount===3&&report.targetVisible&&report.futureBoundaryFailureCount===0&&report.questionCount===24&&report.answerCount===24&&report.allocation.every((count)=>count===6)&&JSON.stringify(report.answerParts)===JSON.stringify(["角","邊","頂點"].sort())&&report.questionPageCount===3&&report.answerPageCount===3&&report.renderedWorksheetPageCount===6&&report.diagramCount===48&&report.sideLineCount===96&&report.vertexMarkerCount===12&&report.angleArcCount===12&&report.labelPointCount===12&&report.highlightedSideCount===12&&report.validatorFailureCount===0&&report.crossLayerMismatchCount===0&&report.duplicateSignatureCount===0&&report.scopeLeakCount===0&&report.overflowFindingCount===0&&report.consoleErrorCount===0&&report.pageErrorCount===0&&report.bindingQuestionType==="diagram"&&report.bindingQuestionCountMax===240&&report.bindingPatternGroupCount===1&&report.bindingPatternSpecCount===4&&report.geometryDiagramRepresentation===true&&report.applicationSuitability==="APPLICATION_NOT_APPLICABLE"&&report.sharedRuntimeScope==="SHARED_RUNTIME_BOUNDED";
fs.writeFileSync(path.join(OUTPUT,"report.json"),`${JSON.stringify({...report,status:pass?"PASS":"FAIL"},null,2)}\n`);
if(!pass)throw new Error(`P05F1_TARGETED_ROUTE_REPLAY_FAILED:${JSON.stringify(report)}`);
console.log(JSON.stringify({...report,status:"PASS"},null,2));
