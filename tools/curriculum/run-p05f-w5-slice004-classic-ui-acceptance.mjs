import {spawn} from "node:child_process";
import {mkdirSync,writeFileSync} from "node:fs";
import path from "node:path";
import {chromium} from "playwright";

const SOURCE_ID="g4b_u02_4b02";
const KP_ID="kp_g4b_u02_parallel_lines_recognition";
const GROUP_ID="pg_g4b_u02_parallel_lines_recognition";
const SPEC_IDS=Object.freeze([
  "ps_g4b_u02_identify_parallel_line_pair",
  "ps_g4b_u02_coplanar_nonintersection",
  "ps_g4b_u02_extension_nonintersection",
  "ps_g4b_u02_consistent_direction",
]);
const QUESTION_COUNT=24;
const GENERATION_SEED="p05f-w5-q004-classic-ui";
const FORBIDDEN_PROMPT_TERMS=["垂直","直角","量距離","作圖","四邊形","應用題"];
const PORT=Number(process.env.P05F4_SITE_PORT??"4184");
const BASE_URL=process.env.P05F4_SITE_URL??`http://127.0.0.1:${PORT}/index.html`;
const OUTPUT=path.resolve("tmp/p05f-w5-slice004-classic-ui-acceptance");
mkdirSync(OUTPUT,{recursive:true});

function sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
async function waitForServer(){let last=null;for(let attempt=0;attempt<40;attempt+=1){try{const response=await fetch(BASE_URL,{cache:"no-store"});if(response.ok)return;}catch(error){last=error;}await sleep(250);}throw new Error(`P05F4_LOCAL_SITE_NOT_READY:${last?.message??"unknown"}`);}
function parseLayout(meta){const q=String(meta).match(/題目\s*(\d+)\s*欄\s*[×x]\s*(\d+)\s*列/);const a=String(meta).match(/答案\s*(\d+)\s*欄\s*[×x]\s*(\d+)\s*列/);return q&&a?{questionColumns:Number(q[1]),questionRows:Number(q[2]),answerColumns:Number(a[1]),answerRows:Number(a[2])}:null;}

const server=spawn(process.execPath,["tools/site/serve-site.js"],{env:{...process.env,SITE_PORT:String(PORT),SITE_HOST:"127.0.0.1"},stdio:["ignore","pipe","pipe"]});
let serverStdout="",serverStderr="";server.stdout.on("data",chunk=>{serverStdout+=chunk.toString();});server.stderr.on("data",chunk=>{serverStderr+=chunk.toString();});
let browser=null;const consoleErrors=[],pageErrors=[],requestFailures=[],assetHttpFailures=[];
try{
  await waitForServer();
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
  page.on("console",message=>{if(message.type()==="error")consoleErrors.push(message.text());});
  page.on("pageerror",error=>pageErrors.push(String(error?.stack??error)));
  page.on("requestfailed",request=>requestFailures.push({url:request.url(),failure:request.failure()?.errorText??"unknown"}));
  page.on("response",response=>{if(response.status()>=400&&(/\.(?:m?js|css)(?:\?|$)/i.test(response.url())||response.url().includes("/assets/")||response.url().includes("/modules/")))assetHttpFailures.push({url:response.url(),status:response.status()});});

  const url=new URL(BASE_URL);url.searchParams.set("p05f4-focused",String(Date.now()));
  const response=await page.goto(url.href,{waitUntil:"networkidle",timeout:120000});
  if(!response?.ok())throw new Error(`P05F4_CLASSIC_UI_MAIN_RESPONSE_FAILED:${response?.status()??"none"}`);
  await page.waitForFunction(()=>[...document.querySelectorAll("#batch-a-grade-select option")].some(o=>o.value==="4"),null,{timeout:120000});
  await page.selectOption("#batch-a-grade-select","4");
  await page.waitForFunction(()=>[...document.querySelectorAll("#batch-a-semester-select option")].some(o=>o.value==="lower"),null,{timeout:120000});
  await page.selectOption("#batch-a-semester-select","lower");
  await page.waitForFunction(sourceId=>[...document.querySelectorAll("#batch-a-source-select option")].some(o=>o.value===sourceId),SOURCE_ID,{timeout:120000});
  await page.selectOption("#batch-a-source-select",SOURCE_ID);
  await page.waitForFunction(kpId=>Boolean(document.querySelector(`[data-knowledge-point-id="${kpId}"]`)),KP_ID,{timeout:120000});
  await page.selectOption("#batch-a-selection-mode-select","singleKnowledgePoint");
  await page.locator(`[data-knowledge-point-id="${KP_ID}"]`).click();
  await page.waitForFunction(kpId=>document.querySelector(`[data-knowledge-point-id="${kpId}"]`)?.dataset?.selected==="true",KP_ID,{timeout:120000});
  await page.fill("#batch-a-question-count-input",String(QUESTION_COUNT));await page.dispatchEvent("#batch-a-question-count-input","change");
  await page.selectOption("#batch-a-ordering-select","groupedByPattern");
  await page.fill("#generation-seed-input",GENERATION_SEED);await page.dispatchEvent("#generation-seed-input","change");
  await page.check("#batch-a-answer-key-input");
  await page.fill("#columns-input","2");await page.dispatchEvent("#columns-input","change");
  await page.fill("#rows-per-page-input","4");await page.dispatchEvent("#rows-per-page-input","change");

  const selector=await page.evaluate(kpId=>({grade:document.querySelector("#batch-a-grade-select")?.value??null,semester:document.querySelector("#batch-a-semester-select")?.value??null,sourceId:document.querySelector("#batch-a-source-select")?.value??null,selectionMode:document.querySelector("#batch-a-selection-mode-select")?.value??null,selectedKnowledgePointIds:[...document.querySelectorAll("[data-knowledge-point-id][data-selected='true']")].map(n=>n.dataset.knowledgePointId),questionCount:document.querySelector("#batch-a-question-count-input")?.value??null,ordering:document.querySelector("#batch-a-ordering-select")?.value??null,answerKey:Boolean(document.querySelector("#batch-a-answer-key-input")?.checked),generationSeed:document.querySelector("#generation-seed-input")?.value??null,columns:document.querySelector("#columns-input")?.value??null,rowsPerPage:document.querySelector("#rows-per-page-input")?.value??null,availabilitySummary:document.querySelector("#batch-a-knowledge-point-availability-summary")?.textContent?.trim()??"",targetSelected:document.querySelector(`[data-knowledge-point-id="${kpId}"]`)?.dataset?.selected==="true"}),KP_ID);
  const selectorPass=selector.grade==="4"&&selector.semester==="lower"&&selector.sourceId===SOURCE_ID&&selector.selectionMode==="singleKnowledgePoint"&&selector.selectedKnowledgePointIds.length===1&&selector.selectedKnowledgePointIds[0]===KP_ID&&selector.questionCount===String(QUESTION_COUNT)&&selector.ordering==="groupedByPattern"&&selector.answerKey&&selector.generationSeed===GENERATION_SEED&&selector.columns==="2"&&selector.rowsPerPage==="4"&&selector.targetSelected&&selector.availabilitySummary.includes("可選知識點：1")&&selector.availabilitySummary.includes("尚未開放：4")&&selector.availabilitySummary.includes("不可選：4")&&selector.availabilitySummary.includes("全部可選：316");
  if(!selectorPass)throw new Error(`P05F4_CLASSIC_UI_SELECTOR_FAILED:${JSON.stringify(selector)}`);

  await page.locator("#regenerate-button").click();
  await page.waitForFunction(()=>{const t=document.querySelector("#status-panel")?.textContent??"";return t.includes("已產生")||t.includes("產生失敗");},null,{timeout:120000});
  const generation=await page.evaluate(()=>({statusText:document.querySelector("#status-panel")?.textContent?.trim()??"",statusTone:document.querySelector("#status-panel")?.dataset?.tone??"",validationText:document.querySelector("#validation-panel")?.textContent?.trim()??"",validationHasErrors:document.querySelector("#validation-panel")?.dataset?.hasErrors??null,previewMeta:document.querySelector("#preview-meta")?.textContent?.trim()??"",previewSrcdocLength:document.querySelector("#preview-frame")?.srcdoc?.length??0,printButtonDisabled:Boolean(document.querySelector("#print-button")?.disabled)}));
  if(!generation.statusText.includes(`已產生 ${QUESTION_COUNT} 題`)||generation.statusTone!=="success"||generation.validationHasErrors!=="false"||!generation.validationText.includes("驗證通過")||generation.previewSrcdocLength<=0||generation.printButtonDisabled)throw new Error(`P05F4_CLASSIC_UI_GENERATION_FAILED:${JSON.stringify(generation)}`);

  const frameElement=await page.locator("#preview-frame").elementHandle();const frame=await frameElement?.contentFrame();if(!frame)throw new Error("P05F4_PREVIEW_FRAME_MISSING");
  await frame.waitForSelector(".worksheet-document",{timeout:120000});
  const worksheet=await frame.evaluate(()=>{const q=[...document.querySelectorAll(".worksheet-cell--question")],a=[...document.querySelectorAll(".worksheet-cell--answer-key")],pages=[...document.querySelectorAll(".worksheet-page")];return{questionCount:q.length,answerCount:a.length,questionPageCount:document.querySelectorAll(".worksheet-page--questions").length,answerPageCount:document.querySelectorAll(".worksheet-page--answer-key").length,diagramCount:document.querySelectorAll(".worksheet-parallel-lines-recognition-diagram").length,lineCount:document.querySelectorAll(".parallel-lines-recognition-diagram__line").length,extensionCount:document.querySelectorAll(".parallel-lines-recognition-diagram__extension").length,directionArrowCount:document.querySelectorAll(".parallel-lines-recognition-diagram__direction-arrow").length,plainModeCount:document.querySelectorAll('[data-diagram-mode="PLAIN_PAIR"]').length,nonintersectingModeCount:document.querySelectorAll('[data-diagram-mode="NONINTERSECTING_PAIR"]').length,extensionModeCount:document.querySelectorAll('[data-diagram-mode="EXTENSION_GUIDES"]').length,directionModeCount:document.querySelectorAll('[data-diagram-mode="DIRECTION_ARROWS"]').length,answerTexts:a.map(c=>c.querySelector(".worksheet-cell__answer")?.textContent?.trim()??""),promptTexts:q.map(c=>c.querySelector(".worksheet-cell__prompt")?.textContent?.trim()??""),questionSignatures:q.map(c=>`${c.querySelector(".worksheet-cell__prompt")?.textContent?.trim()??""}::${c.querySelector("svg")?.outerHTML??""}`),allText:document.body?.innerText??"",overflowFindingCount:pages.filter(n=>n.scrollHeight>n.clientHeight+1||n.scrollWidth>n.clientWidth+1).length,sharedRenderer:Boolean(document.querySelector(".worksheet-document"))};});
  const answerSet=[...new Set(worksheet.answerTexts)].sort();const expectedAnswerSet=["平行線","不會相交","方向一致"].sort();
  const duplicateSignatureCount=worksheet.questionSignatures.length-new Set(worksheet.questionSignatures).size;
  const internalIdLeakage=[SOURCE_ID,KP_ID,GROUP_ID,...SPEC_IDS].filter(token=>worksheet.allText.includes(token));const forbiddenPromptVocabulary=FORBIDDEN_PROMPT_TERMS.filter(term=>worksheet.promptTexts.some(text=>text.includes(term)));
  const layout=parseLayout(generation.previewMeta);const expectedQuestionPages=layout?Math.ceil(QUESTION_COUNT/(layout.questionColumns*layout.questionRows)):null;const expectedAnswerPages=layout?Math.ceil(QUESTION_COUNT/(layout.answerColumns*layout.answerRows)):null;
  const worksheetPass=worksheet.questionCount===24&&worksheet.answerCount===24&&worksheet.diagramCount===48&&worksheet.lineCount===96&&worksheet.extensionCount===48&&worksheet.directionArrowCount===24&&worksheet.plainModeCount===12&&worksheet.nonintersectingModeCount===12&&worksheet.extensionModeCount===12&&worksheet.directionModeCount===12&&JSON.stringify(answerSet)===JSON.stringify(expectedAnswerSet)&&duplicateSignatureCount===0&&internalIdLeakage.length===0&&forbiddenPromptVocabulary.length===0&&worksheet.overflowFindingCount===0&&worksheet.sharedRenderer&&layout&&worksheet.questionPageCount===expectedQuestionPages&&worksheet.answerPageCount===expectedAnswerPages;
  if(!worksheetPass)throw new Error(`P05F4_CLASSIC_UI_WORKSHEET_FAILED:${JSON.stringify({...worksheet,allText:undefined,questionSignatures:undefined,promptTexts:undefined,answerSet,duplicateSignatureCount,internalIdLeakage,forbiddenPromptVocabulary,layout,expectedQuestionPages,expectedAnswerPages})}`);

  await frame.evaluate(()=>{window.__P05F4_PRINT_INVOKED__=0;window.print=()=>{window.__P05F4_PRINT_INVOKED__+=1;};});await page.locator("#print-button").click();const printInvocationCount=await frame.evaluate(()=>window.__P05F4_PRINT_INVOKED__??0);if(printInvocationCount!==1)throw new Error(`P05F4_PRINT_DISPATCH_FAILED:${printInvocationCount}`);
  await page.screenshot({path:path.join(OUTPUT,"P05F4_CLASSIC_UI.png"),fullPage:true});await frame.locator(".worksheet-document").screenshot({path:path.join(OUTPUT,"P05F4_WORKSHEET.png")});writeFileSync(path.join(OUTPUT,"P05F4_WORKSHEET.html"),await frame.content());
  if(consoleErrors.length||pageErrors.length||requestFailures.length||assetHttpFailures.length)throw new Error(`P05F4_BROWSER_DIAGNOSTICS_FAILED:${JSON.stringify({consoleErrors,pageErrors,requestFailures,assetHttpFailures})}`);
  const report={schemaName:"P05FW5Q004ClassicUIAcceptanceV1",taskId:"P05F_W5DirectProductVerticalSlice004Implementation",status:"PASS_P05F_W5_Q004_CLASSIC_UI_ACCEPTANCE",sourceId:SOURCE_ID,knowledgePointId:KP_ID,patternGroupId:GROUP_ID,patternSpecIds:SPEC_IDS,selector,generation,worksheet:{questionCount:worksheet.questionCount,answerCount:worksheet.answerCount,questionPageCount:worksheet.questionPageCount,answerPageCount:worksheet.answerPageCount,diagramCount:worksheet.diagramCount,lineCount:worksheet.lineCount,extensionCount:worksheet.extensionCount,directionArrowCount:worksheet.directionArrowCount,plainModeCount:worksheet.plainModeCount,nonintersectingModeCount:worksheet.nonintersectingModeCount,extensionModeCount:worksheet.extensionModeCount,directionModeCount:worksheet.directionModeCount,answerSet,duplicateSignatureCount,internalIdLeakage,forbiddenPromptVocabulary,overflowFindingCount:worksheet.overflowFindingCount,layout},print:{invocationCount:printInvocationCount},browser:{consoleErrorCount:0,pageErrorCount:0,requestFailureCount:0,assetHttpFailureCount:0},forbiddenScope:{q001SemanticsTouched:false,q002SemanticsTouched:false,q003SemanticsTouched:false,perpendicularExpansion:false,parallelDistanceExpansion:false,parallelConstructionExpansion:false,quadrilateralExpansion:false,applicationExpansion:false,fullRepositoryRegression:false,globalBrowserReplay:false}};
  writeFileSync(path.join(OUTPUT,"report.json"),`${JSON.stringify(report,null,2)}\n`);console.log(`P05F4_CLASSIC_UI_ACCEPTANCE=${JSON.stringify(report)}`);
}finally{if(browser)await browser.close();server.kill("SIGTERM");await Promise.race([new Promise(resolve=>server.once("exit",resolve)),sleep(2000)]);if(!server.killed)server.kill("SIGKILL");writeFileSync(path.join(OUTPUT,"server.stdout.log"),serverStdout);writeFileSync(path.join(OUTPUT,"server.stderr.log"),serverStderr);}
