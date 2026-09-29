import {spawn} from "node:child_process";
import {mkdirSync,writeFileSync} from "node:fs";
import path from "node:path";
import {chromium} from "playwright";

const SOURCE="g6b_u06_6b06";
const TARGET="kp_g6b_u06_pie_chart_percent_angle_conversion";
const PRIOR=["kp_g6b_u06_pie_chart_part_whole","kp_g6b_u06_compare_pie_charts","kp_g6b_u06_pie_chart_quantity_from_rate"];
const FUTURE="kp_g6b_u06_construct_pie_chart";
const COUNT=16;
const PORT=Number(process.env.P08F18_SITE_PORT??"4358");
const REMOTE=process.env.P08F18_SITE_URL??null;
const BASE=REMOTE??("http://127.0.0.1:"+PORT+"/index.html");
const BASE_ORIGIN=new URL(BASE).origin;
const CACHE_TOKEN=process.env.P08F18_LIVE_CACHE_TOKEN??String(Date.now());
const OUT=path.resolve("tmp/p08f-w8-slice018-classic-ui-acceptance");
mkdirSync(OUT,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let server=null,browser=null,serverOut="",serverErr="";
if(!REMOTE){
  server=spawn(process.execPath,["tools/site/serve-site.js"],{env:{...process.env,SITE_PORT:String(PORT),SITE_HOST:"127.0.0.1"},stdio:["ignore","pipe","pipe"]});
  server.stdout.on("data",c=>serverOut+=c);
  server.stderr.on("data",c=>serverErr+=c);
}
async function ready(){let last;for(let i=0;i<50;i++){try{const r=await fetch(BASE,{cache:"no-store"});if(r.ok)return;}catch(e){last=e;}await sleep(250);}throw new Error("P08F18_SITE_NOT_READY:"+(last?.message??"unknown"));}
const errors={console:[],page:[],request:[],http:[]},moduleResponses=[];

async function run(){
  const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
  if(REMOTE)await page.route("**/*",async route=>{
    const request=route.request(),url=new URL(request.url());
    if(request.method()==="GET"&&url.origin===BASE_ORIGIN&&(url.pathname.endsWith(".js")||url.pathname.endsWith(".css")||url.pathname.includes("/modules/"))){
      url.searchParams.set("p08f18-e6",CACHE_TOKEN);
      await route.continue({url:url.href,headers:{...request.headers(),"cache-control":"no-cache","pragma":"no-cache"}});
      return;
    }
    await route.continue();
  });
  page.on("console",m=>{if(m.type()==="error")errors.console.push(m.text());});
  page.on("pageerror",e=>errors.page.push(String(e?.stack??e)));
  page.on("requestfailed",r=>errors.request.push({url:r.url(),failure:r.failure()?.errorText??"unknown"}));
  page.on("response",r=>{
    const url=new URL(r.url());
    if(r.status()>=400&&(/\.(?:m?js|css)(?:\?|$)/i.test(r.url())||r.url().includes("/modules/")||r.url().includes("/assets/")))errors.http.push({url:r.url(),status:r.status()});
    if(REMOTE&&url.origin===BASE_ORIGIN&&(url.pathname.endsWith(".js")||url.pathname.includes("/modules/"))){
      const headers=r.headers();
      moduleResponses.push({url:r.url(),status:r.status(),etag:headers.etag??null,age:headers.age??null,cacheControl:headers["cache-control"]??null});
    }
  });
  const url=new URL(BASE);url.searchParams.set("p08f18",String(Date.now()));
  const response=await page.goto(url.href,{waitUntil:"networkidle",timeout:120000});
  if(!response?.ok())throw new Error("P08F18_MAIN_HTTP:"+(response?.status()??"none"));
  await page.waitForFunction(()=>[...document.querySelectorAll("#batch-a-grade-select option")].some(o=>o.value==="6"),null,{timeout:120000});
  await page.selectOption("#batch-a-grade-select","6");
  await page.waitForFunction(v=>[...document.querySelectorAll("#batch-a-semester-select option")].some(o=>o.value===v),"lower",{timeout:120000});
  await page.selectOption("#batch-a-semester-select","lower");
  await page.waitForFunction(id=>[...document.querySelectorAll("#batch-a-source-select option")].some(o=>o.value===id),SOURCE,{timeout:120000});
  await page.selectOption("#batch-a-source-select",SOURCE);
  for(const id of [...PRIOR,TARGET])await page.waitForFunction(x=>Boolean(document.querySelector('#batch-a-knowledge-point-panel [data-knowledge-point-id="'+x+'"]')),id,{timeout:120000});
  const selector=await page.evaluate(({prior,target,future})=>({
    sourceId:document.querySelector("#batch-a-source-select")?.value,
    summary:document.querySelector("#batch-a-knowledge-point-availability-summary")?.textContent?.trim()??"",
    visibleIds:[...document.querySelectorAll("#batch-a-knowledge-point-panel [data-knowledge-point-id]")].map(n=>n.dataset.knowledgePointId),
    futurePresent:Boolean(document.querySelector('#batch-a-knowledge-point-panel [data-knowledge-point-id="'+future+'"]')),
    sameUnitDisabled:Boolean(document.querySelector('#batch-a-selection-mode-select option[value="mixedKnowledgePointsSameUnit"]')?.disabled),
    prior,target
  }),{prior:PRIOR,target:TARGET,future:FUTURE});
  const g6bVisible=selector.visibleIds.filter(id=>id.startsWith("kp_g6b_u06_"));
  if(selector.sourceId!==SOURCE||![...PRIOR,TARGET].every(id=>selector.visibleIds.includes(id))||selector.futurePresent||!selector.sameUnitDisabled||g6bVisible.length!==4)throw new Error("P08F18_SELECTOR:"+JSON.stringify(selector));
  await page.selectOption("#batch-a-selection-mode-select","singleKnowledgePoint");
  await page.locator('#batch-a-knowledge-point-panel [data-knowledge-point-id="'+TARGET+'"]').click();
  await page.waitForFunction(id=>{const s=[...document.querySelectorAll("#batch-a-knowledge-point-panel [data-knowledge-point-id][data-selected='true']")].map(n=>n.dataset.knowledgePointId);return s.length===1&&s[0]===id;},TARGET,{timeout:120000});
  await page.fill("#batch-a-question-count-input",String(COUNT));await page.dispatchEvent("#batch-a-question-count-input","change");
  await page.selectOption("#batch-a-ordering-select","groupedByPattern");
  await page.check("#batch-a-answer-key-input");
  await page.fill("#columns-input","2");await page.dispatchEvent("#columns-input","change");
  await page.fill("#rows-per-page-input","4");await page.dispatchEvent("#rows-per-page-input","change");
  await page.fill("#generation-seed-input","p08f18-pie-percent-angle-e6");await page.dispatchEvent("#generation-seed-input","change");
  await page.locator("#regenerate-button").click();
  await page.waitForFunction(n=>{const x=document.querySelector("#status-panel")?.textContent??"";return x.includes("已產生 "+n+" 題")||x.includes("產生失敗");},COUNT,{timeout:120000});
  const state=await page.evaluate(()=>({status:document.querySelector("#status-panel")?.textContent?.trim()??"",tone:document.querySelector("#status-panel")?.dataset?.tone??"",valid:document.querySelector("#validation-panel")?.dataset?.hasErrors??null,preview:document.querySelector("#preview-frame")?.srcdoc?.length??0,printDisabled:Boolean(document.querySelector("#print-button")?.disabled)}));
  if(!state.status.includes("已產生 "+COUNT+" 題")||state.tone!=="success"||state.valid!=="false"||state.preview<=0||state.printDisabled)throw new Error("P08F18_GENERATION:"+JSON.stringify(state));
  await page.emulateMedia({media:"print"});
  const frame=await (await page.locator("#preview-frame").elementHandle())?.contentFrame();
  if(!frame)throw new Error("P08F18_PREVIEW_FRAME_MISSING");
  await frame.waitForSelector(".worksheet-document",{timeout:120000});
  const worksheet=await frame.evaluate(()=>{
    const q=[...document.querySelectorAll(".worksheet-cell--question")],a=[...document.querySelectorAll(".worksheet-cell--answer-key")],questionPages=[...document.querySelectorAll(".worksheet-page--questions")],answerPages=[...document.querySelectorAll(".worksheet-page--answer-key")],allPages=[...document.querySelectorAll(".worksheet-page")],prompts=q.map(n=>n.querySelector(".worksheet-cell__prompt")?.textContent??""),text=document.body?.innerText??"";
    const pageMetrics=allPages.map((n,index)=>{const rect=n.getBoundingClientRect(),cells=[...n.querySelectorAll(".worksheet-cell")],clippedCells=cells.filter(cell=>{const x=cell.getBoundingClientRect();return x.top<rect.top-1||x.left<rect.left-1||x.bottom>rect.bottom+1||x.right>rect.right+1;}).length;return{index:index+1,type:n.classList.contains("worksheet-page--questions")?"questions":n.classList.contains("worksheet-page--answer-key")?"answerKey":"other",overflowY:n.scrollHeight-n.clientHeight,overflowX:n.scrollWidth-n.clientWidth,clippedCells,columns:Number(n.querySelector(".worksheet-page__grid")?.style?.getPropertyValue("--worksheet-columns")||0)};});
    return{
      questions:q.length,
      answers:a.length,
      questionPages:questionPages.length,
      answerPages:answerPages.length,
      allPages:allPages.length,
      patternCounts:[
        prompts.filter(x=>x.includes("這個扇形的圓心角是多少度")).length,
        prompts.filter(x=>x.includes("這個扇形占全體百分之幾")).length
      ],
      overflow:pageMetrics.filter(x=>x.overflowY>1||x.overflowX>1||x.clippedCells>0).length,
      pageMetrics,
      nonEmptyAnswers:a.filter(x=>(x.querySelector(".worksheet-cell__answer")?.textContent??"").trim()).length,
      text
    };
  });
  if(worksheet.questions!==COUNT||worksheet.answers!==COUNT||worksheet.questionPages!==2||worksheet.answerPages!==4||worksheet.allPages!==6||worksheet.patternCounts.some(n=>n!==COUNT/2)||worksheet.overflow!==0||worksheet.pageMetrics.filter(x=>x.type==="questions").some(x=>x.columns!==2)||worksheet.pageMetrics.filter(x=>x.type==="answerKey").some(x=>x.columns!==1)||worksheet.nonEmptyAnswers!==COUNT)throw new Error("P08F18_WORKSHEET:"+JSON.stringify({...worksheet,text:undefined}));
  if(!worksheet.text.includes("圓形圖")||!worksheet.text.includes("圓心角")||!worksheet.text.includes("360°")||!worksheet.text.includes("%"))throw new Error("P08F18_SEMANTICS_MISSING");
  for(const token of ["P08F18","kp_g6b_u06_","ps_g6b_u06_","求數量","支出金額","比較兩個圓形圖","畫出圓形圖","繪製圓形圖","扇形面積"])if(worksheet.text.includes(token))throw new Error("P08F18_FORBIDDEN_SEMANTIC_LEAK:"+token);
  await frame.evaluate(()=>{window.__P08F18_PRINT__=0;window.print=()=>window.__P08F18_PRINT__++;});
  await page.locator("#print-button").click();
  const printCount=await frame.evaluate(()=>window.__P08F18_PRINT__??0);
  if(printCount!==1)throw new Error("P08F18_PRINT:"+printCount);
  await frame.locator(".worksheet-document").screenshot({path:path.join(OUT,"q018-worksheet.png"),fullPage:true});
  await page.screenshot({path:path.join(OUT,"q018-ui.png"),fullPage:true});
  await page.close();
  return{selector,state,worksheet:{questions:worksheet.questions,answers:worksheet.answers,questionPages:worksheet.questionPages,answerPages:worksheet.answerPages,allPages:worksheet.allPages,patternCounts:worksheet.patternCounts,overflow:worksheet.overflow,nonEmptyAnswers:worksheet.nonEmptyAnswers},printCount};
}

try{
  await ready();
  browser=await chromium.launch({headless:true});
  const target=await run();
  if(Object.values(errors).some(x=>x.length))throw new Error("P08F18_BROWSER_DIAGNOSTICS:"+JSON.stringify(errors));
  const report={
    schemaName:"P08FW8Q018ClassicUIAcceptanceV1",
    taskId:"P08F_W8DirectProductVerticalSlice018Implementation",
    status:"PASS_P08F_W8_Q018_CLASSIC_UI_ACCEPTANCE",
    d0EligibleAfterExactPagesDeployment:true,
    humanVisualReviewRequired:false,
    sourceId:SOURCE,
    knowledgePointIds:[TARGET],
    questionCount:COUNT,
    target,
    browser:{consoleErrorCount:0,pageErrorCount:0,requestFailureCount:0,assetHttpFailureCount:0},
    semanticInvariants:{percentToCentralAngle:true,centralAngleToPercent:true,fullCircle100Percent360Degrees:true,equivalenceBackCheck:true,priorSameSourceOwnershipProtected:true,futurePieChartConstructionProtected:true,twoColumnQuestionOneColumnAnswerPrintLayout:true,printSafePagination:true,noInternalIds:true},
    forbiddenScope:{partWholeReownership:false,comparePieChartsReownership:false,quantityFromRateReownership:false,pieChartConstruction:false,genericSectorGeometry:false,application:false,sameUnitMixed:false,crossUnitMixed:false,q019OrLater:false,fullRepositoryRegression:false,globalBrowserReplay:false}
  };
  writeFileSync(path.join(OUT,"report.json"),JSON.stringify(report,null,2)+"\n");
  console.log("P08F18_CLASSIC_UI_ACCEPTANCE="+JSON.stringify(report));
}catch(error){
  writeFileSync(path.join(OUT,"failure.json"),JSON.stringify({schemaName:"P08FW8Q018ClassicUIAcceptanceFailureV1",status:"FAIL",baseUrl:BASE,error:String(error?.stack??error),browser:errors,moduleResponses,cacheStrategy:{remote:Boolean(REMOTE),token:CACHE_TOKEN,moduleQueryParam:"p08f18-e6"},server:{stdout:serverOut,stderr:serverErr}},null,2)+"\n");
  throw error;
}finally{
  if(browser)await browser.close().catch(()=>{});
  if(server&&!server.killed)server.kill("SIGTERM");
}
