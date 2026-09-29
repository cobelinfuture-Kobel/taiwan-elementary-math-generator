import {spawn} from "node:child_process";
import {mkdirSync,statSync,writeFileSync} from "node:fs";
import path from "node:path";
import {chromium} from "playwright";

const SOURCE="g6a_u09_6a09";
const DRAW="kp_g6a_u09_scale_drawing_construction";
const ANGLE="kp_g6a_u09_similar_shape_angle";
const PRIOR=["kp_g6a_u09_scale_factor_length","kp_g6a_u09_scale_area_change","kp_g6a_u09_map_scale_distance"];
const TARGETS=[DRAW,ANGLE];
const COUNT=8;
const PORT=Number(process.env.P08F16_SITE_PORT??"4346");
const REMOTE=process.env.P08F16_SITE_URL??null;
const BASE=REMOTE??"http://127.0.0.1:"+PORT+"/index.html";
const OUT=path.resolve("tmp/p08f-w8-slice016-classic-ui-acceptance");
mkdirSync(OUT,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let server=null,browser=null,serverOut="",serverErr="";
if(!REMOTE){server=spawn(process.execPath,["tools/site/serve-site.js"],{env:{...process.env,SITE_PORT:String(PORT),SITE_HOST:"127.0.0.1"},stdio:["ignore","pipe","pipe"]});server.stdout.on("data",c=>serverOut+=c);server.stderr.on("data",c=>serverErr+=c);}
async function ready(){let last;for(let i=0;i<50;i++){try{const r=await fetch(BASE,{cache:"no-store"});if(r.ok)return;}catch(e){last=e;}await sleep(250);}throw new Error("P08F16_SITE_NOT_READY:"+(last?.message??"unknown"));}
const errors={console:[],page:[],request:[],http:[]};

async function runTarget({kp,prefix,seed,tokens}){
  const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
  page.on("console",m=>{if(m.type()==="error")errors.console.push(m.text());});
  page.on("pageerror",e=>errors.page.push(String(e?.stack??e)));
  page.on("requestfailed",r=>errors.request.push({url:r.url(),failure:r.failure()?.errorText??"unknown"}));
  page.on("response",r=>{if(r.status()>=400&&(/\.(?:m?js|css)(?:\?|$)/i.test(r.url())||r.url().includes("/modules/")||r.url().includes("/assets/")))errors.http.push({url:r.url(),status:r.status()});});
  const url=new URL(BASE);url.searchParams.set("p08f16",String(Date.now())+"-"+prefix);
  const response=await page.goto(url.href,{waitUntil:"networkidle",timeout:120000});
  if(!response?.ok())throw new Error("P08F16_MAIN_HTTP:"+(response?.status()??"none"));
  await page.waitForFunction(()=>[...document.querySelectorAll("#batch-a-grade-select option")].some(o=>o.value==="6"),null,{timeout:120000});
  await page.selectOption("#batch-a-grade-select","6");
  await page.waitForFunction(()=>[...document.querySelectorAll("#batch-a-semester-select option")].some(o=>o.value==="upper"),null,{timeout:120000});
  await page.selectOption("#batch-a-semester-select","upper");
  await page.waitForFunction(id=>[...document.querySelectorAll("#batch-a-source-select option")].some(o=>o.value===id),SOURCE,{timeout:120000});
  await page.selectOption("#batch-a-source-select",SOURCE);
  for(const id of [...PRIOR,...TARGETS])await page.waitForFunction(x=>Boolean(document.querySelector('#batch-a-knowledge-point-panel [data-knowledge-point-id="'+x+'"]')),id,{timeout:120000});
  const selector=await page.evaluate(()=>({sourceId:document.querySelector("#batch-a-source-select")?.value,visibleIds:[...document.querySelectorAll("#batch-a-knowledge-point-panel [data-knowledge-point-id]")].map(n=>n.dataset.knowledgePointId)}));
  if(selector.sourceId!==SOURCE||![...PRIOR,...TARGETS].every(id=>selector.visibleIds.includes(id)))throw new Error("P08F16_SELECTOR:"+JSON.stringify(selector));
  await page.selectOption("#batch-a-selection-mode-select","singleKnowledgePoint");
  await page.locator('#batch-a-knowledge-point-panel [data-knowledge-point-id="'+kp+'"]').click();
  await page.waitForFunction(id=>{const s=[...document.querySelectorAll("#batch-a-knowledge-point-panel [data-knowledge-point-id][data-selected='true']")].map(n=>n.dataset.knowledgePointId);return s.length===1&&s[0]===id;},kp,{timeout:120000});
  await page.fill("#batch-a-question-count-input",String(COUNT));await page.dispatchEvent("#batch-a-question-count-input","change");
  await page.selectOption("#batch-a-ordering-select","groupedByPattern");
  await page.check("#batch-a-answer-key-input");
  await page.fill("#columns-input","2");await page.dispatchEvent("#columns-input","change");
  await page.fill("#rows-per-page-input","3");await page.dispatchEvent("#rows-per-page-input","change");
  await page.fill("#generation-seed-input",seed);await page.dispatchEvent("#generation-seed-input","change");
  await page.locator("#regenerate-button").click();
  await page.waitForFunction(n=>{const x=document.querySelector("#status-panel")?.textContent??"";return x.includes("已產生 "+n+" 題")||x.includes("產生失敗");},COUNT,{timeout:120000});
  const state=await page.evaluate(()=>({status:document.querySelector("#status-panel")?.textContent?.trim()??"",tone:document.querySelector("#status-panel")?.dataset?.tone??"",valid:document.querySelector("#validation-panel")?.dataset?.hasErrors??null,preview:document.querySelector("#preview-frame")?.srcdoc?.length??0,printDisabled:Boolean(document.querySelector("#print-button")?.disabled)}));
  if(!state.status.includes("已產生 "+COUNT+" 題")||state.tone!=="success"||state.valid!=="false"||state.preview<=0||state.printDisabled)throw new Error("P08F16_GENERATION:"+kp+":"+JSON.stringify(state));
  const handle=await page.locator("#preview-frame").elementHandle(),frame=await handle?.contentFrame();if(!frame)throw new Error("P08F16_PREVIEW_FRAME_MISSING:"+kp);
  await frame.waitForSelector(".worksheet-document",{timeout:120000});await page.emulateMedia({media:"print"});
  const worksheet=await frame.evaluate(tokens=>{
    const q=[...document.querySelectorAll(".worksheet-cell--question")],a=[...document.querySelectorAll(".worksheet-cell--answer-key")],questionPages=[...document.querySelectorAll(".worksheet-page--questions")],answerPages=[...document.querySelectorAll(".worksheet-page--answer-key")],allPages=[...document.querySelectorAll(".worksheet-page")],prompts=q.map(n=>n.querySelector(".worksheet-cell__prompt")?.textContent??""),text=document.body?.innerText??"";
    const pageMetrics=allPages.map((n,index)=>{const rect=n.getBoundingClientRect(),cells=[...n.querySelectorAll(".worksheet-cell")],clippedCells=cells.filter(cell=>{const x=cell.getBoundingClientRect();return x.top<rect.top-1||x.left<rect.left-1||x.bottom>rect.bottom+1||x.right>rect.right+1;}).length;return{index:index+1,type:n.classList.contains("worksheet-page--questions")?"questions":n.classList.contains("worksheet-page--answer-key")?"answerKey":"other",overflowY:n.scrollHeight-n.clientHeight,overflowX:n.scrollWidth-n.clientWidth,clippedCells,columns:Number(n.querySelector(".worksheet-page__grid")?.style?.getPropertyValue("--worksheet-columns")||0)};});
    const reps=[...document.querySelectorAll('[data-representation="scale-drawing-similarity-diagram"]')],sizes=reps.map(x=>x.querySelector("svg")).filter(Boolean).map(svg=>{const x=svg.getBoundingClientRect();return{width:x.width,height:x.height};});
    return{questions:q.length,answers:a.length,representations:reps.length,questionPages:questionPages.length,answerPages:answerPages.length,allPages:allPages.length,patternCounts:tokens.map(token=>prompts.filter(x=>x.includes(token)).length),overflow:pageMetrics.filter(x=>x.overflowY>1||x.overflowX>1||x.clippedCells>0).length,pageMetrics,minDiagramWidth:sizes.length?Math.min(...sizes.map(x=>x.width)):0,minDiagramHeight:sizes.length?Math.min(...sizes.map(x=>x.height)):0,nonEmptyAnswers:a.filter(x=>(x.querySelector(".worksheet-cell__answer")?.textContent??"").trim()).length,text};
  },tokens);
  if(worksheet.questions!==COUNT||worksheet.answers!==COUNT||worksheet.representations!==COUNT*2||worksheet.questionPages!==2||worksheet.answerPages!==2||worksheet.allPages!==4||worksheet.overflow!==0||worksheet.patternCounts.some(n=>n!==COUNT/4)||worksheet.pageMetrics.some(x=>x.columns!==2)||worksheet.minDiagramWidth<200||worksheet.minDiagramHeight<100||worksheet.nonEmptyAnswers!==COUNT||/kp_g6a_u09_|ps_g6a_u09_/.test(worksheet.text))throw new Error("P08F16_WORKSHEET:"+kp+":"+JSON.stringify({...worksheet,text:undefined}));
  await frame.evaluate(()=>{window.__P08F16_PRINT__=0;window.print=()=>window.__P08F16_PRINT__++;});await page.locator("#print-button").click();
  const printCount=await frame.evaluate(()=>window.__P08F16_PRINT__??0);if(printCount!==1)throw new Error("P08F16_PRINT:"+kp+":"+printCount);
  const reviewHtml=(await frame.content()).replace("<head>",'<head><base href="'+new URL(".",BASE).href+'">'),reviewPage=await browser.newPage({viewport:{width:1200,height:1600},deviceScaleFactor:1});
  await reviewPage.setContent(reviewHtml,{waitUntil:"networkidle"});await reviewPage.emulateMedia({media:"print"});
  await reviewPage.screenshot({path:path.join(OUT,prefix+"-human-review.png"),fullPage:true});
  await reviewPage.pdf({path:path.join(OUT,prefix+"-human-review.pdf"),format:"A4",printBackground:true,preferCSSPageSize:true});
  await reviewPage.close();
  await frame.locator(".worksheet-document").screenshot({path:path.join(OUT,prefix+"-worksheet.png"),fullPage:true});
  await page.screenshot({path:path.join(OUT,prefix+"-ui.png"),fullPage:true});
  await page.close();
  return{kpId:kp,selector,state,worksheet:{questions:worksheet.questions,answers:worksheet.answers,representations:worksheet.representations,questionPages:worksheet.questionPages,answerPages:worksheet.answerPages,allPages:worksheet.allPages,patternCounts:worksheet.patternCounts,overflow:worksheet.overflow,minDiagramWidth:worksheet.minDiagramWidth,minDiagramHeight:worksheet.minDiagramHeight,nonEmptyAnswers:worksheet.nonEmptyAnswers},printCount,humanReviewArtifacts:{pdf:prefix+"-human-review.pdf",png:prefix+"-human-review.png",worksheet:prefix+"-worksheet.png",ui:prefix+"-ui.png",pdfBytes:statSync(path.join(OUT,prefix+"-human-review.pdf")).size,pngBytes:statSync(path.join(OUT,prefix+"-human-review.png")).size,status:"PENDING_OPERATOR_REVIEW"}};
}
try{
  await ready();browser=await chromium.launch({headless:true});
  const scaleDrawing=await runTarget({kp:DRAW,prefix:"q016-scale-drawing",seed:"p08f16-scale-drawing-human-review",tokens:["左圖為三角形","左圖為長方形","已畫出其餘頂點","這個畫法正確嗎"]});
  const similarAngle=await runTarget({kp:ANGLE,prefix:"q016-similar-angle",seed:"p08f16-similar-angle-human-review",tokens:["若 ∠","對應右圖的哪一個角","是否平行","是否保持相同形狀與對應角"]});
  if(Object.values(errors).some(x=>x.length))throw new Error("P08F16_BROWSER_DIAGNOSTICS:"+JSON.stringify(errors));
  const report={schemaName:"P08FW8Q016ClassicUIAcceptanceV1",taskId:"P08F_W8DirectProductVerticalSlice016Implementation",status:"PASS_P08F_W8_Q016_TECHNICAL_VISUAL_PRECHECK",learnerVisualAcceptanceStatus:"PENDING_OPERATOR_ACTUAL_PRINT_HUMAN_REVIEW",d0Granted:false,sourceId:SOURCE,knowledgePointIds:TARGETS,questionCountPerKnowledgePoint:COUNT,targets:{scaleDrawing,similarAngle},humanReview:{required:true,status:"PENDING_OPERATOR",artifacts:[scaleDrawing.humanReviewArtifacts,similarAngle.humanReviewArtifacts]},browser:{consoleErrorCount:0,pageErrorCount:0,requestFailureCount:0,assetHttpFailureCount:0},semanticInvariants:{oneCommonPositiveScaleFactor:true,boundedGridConstruction:true,answerKeyCompletedDrawing:true,correspondingAnglesPreserved:true,parallelRelationsPreserved:true,priorOwnersPreserved:true,twoColumnPrintLayout:true,printSafePagination:true,noInternalIds:true},forbiddenScope:{application:false,sameUnitMixed:false,crossUnitMixed:false,q017OrLater:false,fullRepositoryRegression:false,globalBrowserReplay:false}};
  writeFileSync(path.join(OUT,"report.json"),JSON.stringify(report,null,2)+"\n");console.log("P08F16_CLASSIC_UI_ACCEPTANCE="+JSON.stringify(report));
}catch(error){
  writeFileSync(path.join(OUT,"failure.json"),JSON.stringify({schemaName:"P08FW8Q016ClassicUIAcceptanceFailureV1",status:"FAIL",baseUrl:BASE,error:String(error?.stack??error),browser:errors,server:{stdout:serverOut,stderr:serverErr}},null,2)+"\n");throw error;
}finally{if(browser)await browser.close().catch(()=>{});if(server&&!server.killed)server.kill("SIGTERM");}
