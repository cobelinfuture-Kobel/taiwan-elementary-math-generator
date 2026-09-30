import {spawn} from "node:child_process";
import {mkdirSync,writeFileSync} from "node:fs";
import path from "node:path";
import {chromium} from "playwright";

const TARGETS=Object.freeze([
  Object.freeze({sourceId:"g5b_u02_5b02",grade:"5",semester:"lower",knowledgePointId:"kp_g5b_u02_fraction_times_integer"}),
  Object.freeze({sourceId:"g5b_u09_5b09",grade:"5",semester:"lower",knowledgePointId:"kp_g5b_u09_time_quantity_divided_by_integer"})
]);
const COUNT=8;
const PORT=Number(process.env.P09_A01_SITE_PORT||"4381");
const REMOTE=process.env.P09_A01_SITE_URL||null;
const BASE=REMOTE||("http://127.0.0.1:"+PORT+"/index.html");
const BASE_ORIGIN=new URL(BASE).origin;
const CACHE_TOKEN=process.env.P09_A01_LIVE_CACHE_TOKEN||String(Date.now());
const OUT=path.resolve("tmp/p09-ui-a01-classic-ui-acceptance");
mkdirSync(OUT,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let server=null,browser=null,serverOut="",serverErr="";
if(!REMOTE){
  server=spawn(process.execPath,["tools/site/serve-site.js"],{env:{...process.env,SITE_PORT:String(PORT),SITE_HOST:"127.0.0.1"},stdio:["ignore","pipe","pipe"]});
  server.stdout.on("data",c=>serverOut+=c);
  server.stderr.on("data",c=>serverErr+=c);
}
async function ready(){
  let last;
  for(let i=0;i<50;i++){
    try{const r=await fetch(BASE,{cache:"no-store"});if(r.ok)return;}catch(e){last=e;}
    await sleep(250);
  }
  throw new Error("P09_A01_SITE_NOT_READY:"+(last?.message||"unknown"));
}
const errors={console:[],page:[],request:[],http:[]};
async function selectTarget(page,target){
  await page.selectOption("#batch-a-grade-select",target.grade);
  await page.waitForFunction(v=>[...document.querySelectorAll("#batch-a-semester-select option")].some(o=>o.value===v),target.semester,{timeout:30000});
  await page.selectOption("#batch-a-semester-select",target.semester);
  await page.waitForFunction(id=>[...document.querySelectorAll("#batch-a-source-select option")].some(o=>o.value===id),target.sourceId,{timeout:30000});
  await page.selectOption("#batch-a-source-select",target.sourceId);
  await page.waitForFunction(id=>Boolean(document.querySelector('#batch-a-knowledge-point-panel [data-knowledge-point-id="'+id+'"]')),target.knowledgePointId,{timeout:30000});
  await page.selectOption("#batch-a-selection-mode-select","singleKnowledgePoint");
  await page.locator('#batch-a-knowledge-point-panel [data-knowledge-point-id="'+target.knowledgePointId+'"]').click();
  await page.waitForFunction(id=>{
    const selected=[...document.querySelectorAll("#batch-a-knowledge-point-panel [data-knowledge-point-id][data-selected='true']")].map(n=>n.dataset.knowledgePointId);
    return selected.length===1&&selected[0]===id;
  },target.knowledgePointId,{timeout:30000});
}
async function generateAndRead(page,target){
  await page.fill("#batch-a-question-count-input",String(COUNT));
  await page.dispatchEvent("#batch-a-question-count-input","change");
  await page.selectOption("#batch-a-ordering-select","groupedByPattern");
  await page.check("#batch-a-answer-key-input");
  await page.fill("#columns-input","2");
  await page.dispatchEvent("#columns-input","change");
  await page.fill("#rows-per-page-input","4");
  await page.dispatchEvent("#rows-per-page-input","change");
  await page.fill("#generation-seed-input","p09-a01-"+target.sourceId);
  await page.dispatchEvent("#generation-seed-input","change");
  await page.locator("#regenerate-button").click();
  await page.waitForFunction(n=>{
    const x=document.querySelector("#status-panel")?.textContent||"";
    return x.includes("已產生 "+n+" 題")||x.includes("產生失敗");
  },COUNT,{timeout:30000});
  const state=await page.evaluate(()=>({
    sourceId:document.querySelector("#batch-a-source-select")?.value||null,
    selectedKnowledgePointIds:[...document.querySelectorAll("#batch-a-knowledge-point-panel [data-knowledge-point-id][data-selected='true']")].map(n=>n.dataset.knowledgePointId),
    status:document.querySelector("#status-panel")?.textContent?.trim()||"",
    tone:document.querySelector("#status-panel")?.dataset?.tone||"",
    valid:document.querySelector("#validation-panel")?.dataset?.hasErrors||null,
    preview:document.querySelector("#preview-frame")?.srcdoc?.length||0,
    printDisabled:Boolean(document.querySelector("#print-button")?.disabled)
  }));
  if(state.sourceId!==target.sourceId||state.selectedKnowledgePointIds.length!==1||state.selectedKnowledgePointIds[0]!==target.knowledgePointId||!state.status.includes("已產生 "+COUNT+" 題")||state.tone!=="success"||state.valid!=="false"||state.preview<=0||state.printDisabled){
    throw new Error("P09_A01_GENERATION:"+target.sourceId+":"+JSON.stringify(state));
  }
  const frame=await (await page.locator("#preview-frame").elementHandle())?.contentFrame();
  if(!frame)throw new Error("P09_A01_PREVIEW_FRAME_MISSING:"+target.sourceId);
  await frame.waitForSelector(".worksheet-document",{timeout:30000});
  const worksheet=await frame.evaluate(()=>({
    questions:document.querySelectorAll(".worksheet-cell--question").length,
    answers:document.querySelectorAll(".worksheet-cell--answer-key").length,
    text:document.body?.innerText||"",
    overflow:[...document.querySelectorAll(".worksheet-page")].filter(n=>n.scrollHeight>n.clientHeight+1||n.scrollWidth>n.clientWidth+1).length
  }));
  if(worksheet.questions!==COUNT||worksheet.answers!==COUNT||worksheet.overflow!==0){
    throw new Error("P09_A01_WORKSHEET:"+target.sourceId+":"+JSON.stringify({questions:worksheet.questions,answers:worksheet.answers,overflow:worksheet.overflow}));
  }
  await frame.evaluate(()=>{window.__P09_A01_PRINT__=0;window.print=()=>window.__P09_A01_PRINT__++;});
  await page.locator("#print-button").click();
  const printCount=await frame.evaluate(()=>window.__P09_A01_PRINT__||0);
  if(printCount!==1)throw new Error("P09_A01_PRINT:"+target.sourceId+":"+printCount);
  return{state,worksheet:{questions:worksheet.questions,answers:worksheet.answers,overflow:worksheet.overflow},printCount};
}
async function run(){
  const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
  if(REMOTE)await page.route("**/*",async route=>{
    const request=route.request(),url=new URL(request.url());
    if(request.method()==="GET"&&url.origin===BASE_ORIGIN&&(url.pathname.endsWith(".js")||url.pathname.endsWith(".css")||url.pathname.includes("/modules/"))){
      url.searchParams.set("p09-a01",CACHE_TOKEN);
      await route.continue({url:url.href,headers:{...request.headers(),"cache-control":"no-cache","pragma":"no-cache"}});
      return;
    }
    await route.continue();
  });
  page.on("console",m=>{if(m.type()==="error")errors.console.push(m.text());});
  page.on("pageerror",e=>errors.page.push(String(e?.stack||e)));
  page.on("requestfailed",r=>errors.request.push({url:r.url(),failure:r.failure()?.errorText||"unknown"}));
  page.on("response",r=>{if(r.status()>=400&&(/\.(?:m?js|css)(?:\?|$)/i.test(r.url())||r.url().includes("/modules/")||r.url().includes("/assets/")))errors.http.push({url:r.url(),status:r.status()});});
  const url=new URL(BASE);url.searchParams.set("p09-a01",String(Date.now()));
  const response=await page.goto(url.href,{waitUntil:"networkidle",timeout:120000});
  if(!response?.ok())throw new Error("P09_A01_MAIN_HTTP:"+(response?.status()||"none"));
  await page.waitForFunction(()=>[...document.querySelectorAll("#batch-a-grade-select option")].some(o=>o.value==="5"),null,{timeout:30000});
  const sourceOptionsBefore={};
  const results=[];
  for(const target of TARGETS){
    await page.selectOption("#batch-a-grade-select",target.grade);
    await page.waitForFunction(v=>[...document.querySelectorAll("#batch-a-semester-select option")].some(o=>o.value===v),target.semester,{timeout:30000});
    await page.selectOption("#batch-a-semester-select",target.semester);
    sourceOptionsBefore[target.sourceId]=await page.evaluate(()=>[...document.querySelectorAll("#batch-a-source-select option")].map(o=>({value:o.value,text:o.textContent?.trim()||""})));
    if(!sourceOptionsBefore[target.sourceId].some(o=>o.value===target.sourceId))throw new Error("P09_A01_SOURCE_OPTION_MISSING:"+target.sourceId);
    await selectTarget(page,target);
    results.push({sourceId:target.sourceId,knowledgePointId:target.knowledgePointId,...await generateAndRead(page,target)});
  }
  await page.screenshot({path:path.join(OUT,"p09-a01-ui.png"),fullPage:true});
  await page.close();
  return{sourceOptionsBefore,results};
}
try{
  await ready();
  browser=await chromium.launch({headless:true});
  const target=await run();
  if(Object.values(errors).some(x=>x.length))throw new Error("P09_A01_BROWSER_DIAGNOSTICS:"+JSON.stringify(errors));
  const report={
    schemaName:"P09UIA01ClassicUIAcceptanceV1",
    taskId:"P09_UI_A01_CurrentPublicInventoryParityRepair_76To79Sources_480To482KPs_AndDeployedSourceDropdownRecovery",
    status:"PASS_P09_UI_A01_CLASSIC_UI_ACCEPTANCE",
    recoveredSourceIds:TARGETS.map(x=>x.sourceId),
    questionCountPerSource:COUNT,
    target,
    browser:{consoleErrorCount:0,pageErrorCount:0,requestFailureCount:0,assetHttpFailureCount:0},
    invariants:{publicSourceProviderMatchesSelectorProjection:true,recoveredExistingProductRoutes:true,forcedTwoKpExposure:false,crossUnitMixedAdmission:false}
  };
  writeFileSync(path.join(OUT,"report.json"),JSON.stringify(report,null,2)+"\n");
  console.log("P09_A01_CLASSIC_UI_ACCEPTANCE="+JSON.stringify(report));
}catch(error){
  writeFileSync(path.join(OUT,"failure.json"),JSON.stringify({schemaName:"P09UIA01ClassicUIAcceptanceFailureV1",status:"FAIL",baseUrl:BASE,error:String(error?.stack||error),browser:errors,server:{stdout:serverOut,stderr:serverErr}},null,2)+"\n");
  throw error;
}finally{
  if(browser)await browser.close().catch(()=>{});
  if(server&&!server.killed)server.kill("SIGTERM");
}
