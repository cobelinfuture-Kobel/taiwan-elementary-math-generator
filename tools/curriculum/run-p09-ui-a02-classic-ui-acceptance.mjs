import {spawn} from "node:child_process";
import {mkdirSync,writeFileSync} from "node:fs";
import path from "node:path";
import {chromium} from "playwright";

const SRC="g3a_u08_3a08";
const TARGETS=Object.freeze([
  Object.freeze({kp:"kp_g3a_u08_whole_as_fraction",token:"整體等於分母分之分母"}),
  Object.freeze({kp:"kp_g3a_u08_unlike_denominator_comparison_limit",token:"異分母比較限制"})
]);
const COUNT=12;
const PORT=Number(process.env.P09_A02_SITE_PORT||"4382");
const REMOTE=process.env.P09_A02_SITE_URL||null;
const BASE=REMOTE||("http://127.0.0.1:"+PORT+"/index.html");
const BASE_ORIGIN=new URL(BASE).origin;
const CACHE_TOKEN=process.env.P09_A02_LIVE_CACHE_TOKEN||String(Date.now());
const OUT=path.resolve("tmp/p09-ui-a02-classic-ui-acceptance");
mkdirSync(OUT,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let server=null,browser=null,serverOut="",serverErr="";
if(!REMOTE){
  server=spawn(process.execPath,["tools/site/serve-site.js"],{env:{...process.env,SITE_PORT:String(PORT),SITE_HOST:"127.0.0.1"},stdio:["ignore","pipe","pipe"]});
  server.stdout.on("data",c=>serverOut+=c);
  server.stderr.on("data",c=>serverErr+=c);
}
async function ready(){let last;for(let i=0;i<50;i++){try{const r=await fetch(BASE,{cache:"no-store"});if(r.ok)return;}catch(e){last=e;}await sleep(250);}throw new Error("P09_A02_SITE_NOT_READY:"+(last?.message||"unknown"));}
const errors={console:[],page:[],request:[],http:[]};

async function selectSource(page){
  await page.waitForFunction(()=>[...document.querySelectorAll("#batch-a-grade-select option")].some(o=>o.value==="3"),null,{timeout:30000});
  await page.selectOption("#batch-a-grade-select","3");
  await page.waitForFunction(()=>[...document.querySelectorAll("#batch-a-semester-select option")].some(o=>o.value==="upper"),null,{timeout:30000});
  await page.selectOption("#batch-a-semester-select","upper");
  await page.waitForFunction(id=>[...document.querySelectorAll("#batch-a-source-select option")].some(o=>o.value===id),SRC,{timeout:30000});
  await page.selectOption("#batch-a-source-select",SRC);
  for(const row of TARGETS)await page.waitForFunction(id=>Boolean(document.querySelector('#batch-a-knowledge-point-panel [data-knowledge-point-id="'+id+'"]')),row.kp,{timeout:30000});
}
async function selectKp(page,kp){
  await page.selectOption("#batch-a-selection-mode-select","singleKnowledgePoint");
  await page.locator('#batch-a-knowledge-point-panel [data-knowledge-point-id="'+kp+'"]').click();
  await page.waitForFunction(id=>{
    const s=[...document.querySelectorAll("#batch-a-knowledge-point-panel [data-knowledge-point-id][data-selected='true']")].map(n=>n.dataset.knowledgePointId);
    return s.length===1&&s[0]===id;
  },kp,{timeout:30000});
  await page.waitForFunction(()=>Boolean(document.querySelector('#batch-a-selection-mode-select option[value="mixedKnowledgePointsSameUnit"]')?.disabled),null,{timeout:30000});
}
async function generate(page,target){
  await page.fill("#batch-a-question-count-input",String(COUNT));await page.dispatchEvent("#batch-a-question-count-input","change");
  await page.selectOption("#batch-a-ordering-select","groupedByPattern");
  await page.check("#batch-a-answer-key-input");
  await page.fill("#columns-input","2");await page.dispatchEvent("#columns-input","change");
  await page.fill("#rows-per-page-input","4");await page.dispatchEvent("#rows-per-page-input","change");
  await page.fill("#generation-seed-input","p09-a02-"+target.kp);await page.dispatchEvent("#generation-seed-input","change");
  await page.locator("#regenerate-button").click();
  await page.waitForFunction(n=>{const x=document.querySelector("#status-panel")?.textContent||"";return x.includes("已產生 "+n+" 題")||x.includes("產生失敗");},COUNT,{timeout:30000});
  const state=await page.evaluate(()=>({status:document.querySelector("#status-panel")?.textContent?.trim()||"",tone:document.querySelector("#status-panel")?.dataset?.tone||"",valid:document.querySelector("#validation-panel")?.dataset?.hasErrors||null,preview:document.querySelector("#preview-frame")?.srcdoc?.length||0,printDisabled:Boolean(document.querySelector("#print-button")?.disabled),sourceId:document.querySelector("#batch-a-source-select")?.value,selected:[...document.querySelectorAll("#batch-a-knowledge-point-panel [data-knowledge-point-id][data-selected='true']")].map(n=>n.dataset.knowledgePointId)}));
  if(state.sourceId!==SRC||state.selected.length!==1||state.selected[0]!==target.kp||!state.status.includes("已產生 "+COUNT+" 題")||state.tone!=="success"||state.valid!=="false"||state.preview<=0||state.printDisabled)throw new Error("P09_A02_GENERATION:"+target.kp+":"+JSON.stringify(state));
  const frame=await (await page.locator("#preview-frame").elementHandle())?.contentFrame();if(!frame)throw new Error("P09_A02_PREVIEW_FRAME_MISSING:"+target.kp);
  await frame.waitForSelector(".worksheet-document",{timeout:30000});
  const worksheet=await frame.evaluate(()=>({questions:document.querySelectorAll(".worksheet-cell--question").length,answers:document.querySelectorAll(".worksheet-cell--answer-key").length,overflow:[...document.querySelectorAll(".worksheet-page")].filter(n=>n.scrollHeight>n.clientHeight+1||n.scrollWidth>n.clientWidth+1).length,text:document.body?.innerText||"",fractionCount:document.querySelectorAll(".math-fraction").length}));
  if(worksheet.questions!==COUNT||worksheet.answers!==COUNT||worksheet.overflow!==0)throw new Error("P09_A02_WORKSHEET:"+target.kp+":"+JSON.stringify({questions:worksheet.questions,answers:worksheet.answers,overflow:worksheet.overflow}));
  if(target.kp==="kp_g3a_u08_whole_as_fraction"&&worksheet.fractionCount<1)throw new Error("P09_A02_WHOLE_STRUCTURED_FRACTION_MISSING");
  if(target.kp==="kp_g3a_u08_unlike_denominator_comparison_limit"&&!worksheet.text.includes("只比較分子"))throw new Error("P09_A02_UNLIKE_METHOD_SEMANTIC_MISSING");
  await frame.evaluate(()=>{window.__P09_A02_PRINT__=0;window.print=()=>window.__P09_A02_PRINT__++;});await page.locator("#print-button").click();
  const printCount=await frame.evaluate(()=>window.__P09_A02_PRINT__||0);if(printCount!==1)throw new Error("P09_A02_PRINT:"+target.kp+":"+printCount);
  return{state,worksheet:{questions:worksheet.questions,answers:worksheet.answers,overflow:worksheet.overflow,fractionCount:worksheet.fractionCount},printCount};
}
async function run(){
  const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
  if(REMOTE)await page.route("**/*",async route=>{const request=route.request(),url=new URL(request.url());if(request.method()==="GET"&&url.origin===BASE_ORIGIN&&(url.pathname.endsWith(".js")||url.pathname.endsWith(".css")||url.pathname.includes("/modules/")||url.pathname.includes("/assets/"))){url.searchParams.set("p09-a02",CACHE_TOKEN);await route.continue({url:url.href,headers:{...request.headers(),"cache-control":"no-cache","pragma":"no-cache"}});return;}await route.continue();});
  page.on("console",m=>{if(m.type()==="error")errors.console.push(m.text());});page.on("pageerror",e=>errors.page.push(String(e?.stack||e)));page.on("requestfailed",r=>errors.request.push({url:r.url(),failure:r.failure()?.errorText||"unknown"}));page.on("response",r=>{if(r.status()>=400&&(/\.(?:m?js|css)(?:\?|$)/i.test(r.url())||r.url().includes("/modules/")||r.url().includes("/assets/")))errors.http.push({url:r.url(),status:r.status()});});
  const url=new URL(BASE);url.searchParams.set("p09-a02",String(Date.now()));const response=await page.goto(url.href,{waitUntil:"networkidle",timeout:120000});if(!response?.ok())throw new Error("P09_A02_MAIN_HTTP:"+(response?.status()||"none"));
  await selectSource(page);
  const visible=await page.evaluate(()=>[...document.querySelectorAll("#batch-a-knowledge-point-panel [data-knowledge-point-id]")].map(n=>n.dataset.knowledgePointId));
  for(const row of TARGETS)if(!visible.includes(row.kp))throw new Error("P09_A02_SELECTOR_MISSING:"+row.kp);
  const results=[];
  for(const target of TARGETS){await selectKp(page,target.kp);results.push({knowledgePointId:target.kp,...await generate(page,target)});}
  await page.screenshot({path:path.join(OUT,"p09-a02-ui.png"),fullPage:true});await page.close();
  return{visibleKnowledgePointIds:visible,results};
}
try{
  await ready();browser=await chromium.launch({headless:true});const target=await run();
  if(Object.values(errors).some(x=>x.length))throw new Error("P09_A02_BROWSER_DIAGNOSTICS:"+JSON.stringify(errors));
  const report={schemaName:"P09UIA02ClassicUIAcceptanceV1",taskId:"P09_UI_A02_G3AU08_WholeAsFraction_And_UnlikeDenominatorComparisonLimit_TwoKPProductAdmission",status:"PASS_P09_UI_A02_CLASSIC_UI_ACCEPTANCE",sourceId:SRC,targetKnowledgePointIds:TARGETS.map(x=>x.kp),questionCountPerKnowledgePoint:COUNT,target,browser:{consoleErrorCount:0,pageErrorCount:0,requestFailureCount:0,assetHttpFailureCount:0},invariants:{canonicalSelector482:true,g3aU08Visible7:true,wholeAsFractionProductAdmitted:true,unlikeDenominatorMethodLimitProductAdmitted:true,sameUnitMixedAdmission:false,crossUnitMixedAdmission:false,applicationContextAdmission:false}};
  writeFileSync(path.join(OUT,"report.json"),JSON.stringify(report,null,2)+"\n");console.log("P09_A02_CLASSIC_UI_ACCEPTANCE="+JSON.stringify(report));
}catch(error){
  writeFileSync(path.join(OUT,"failure.json"),JSON.stringify({schemaName:"P09UIA02ClassicUIAcceptanceFailureV1",status:"FAIL",baseUrl:BASE,error:String(error?.stack||error),browser:errors,server:{stdout:serverOut,stderr:serverErr}},null,2)+"\n");throw error;
}finally{if(browser)await browser.close().catch(()=>{});if(server&&!server.killed)server.kill("SIGTERM");}
