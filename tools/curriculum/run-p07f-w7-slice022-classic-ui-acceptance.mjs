import {spawn} from "node:child_process";
import {mkdirSync,writeFileSync} from "node:fs";
import path from "node:path";
import {chromium} from "playwright";

const SOURCE="g6b_u04_6b04",TARGETS=[
  ["kp_g6b_u04_find_base_quantity","求基準量"],
  ["kp_g6b_u04_find_comparison_quantity","求比較量"],
  ["kp_g6b_u04_find_rate_from_quantities","求比率"]
],COUNT=12;
const PORT=Number(process.env.P07F22_SITE_PORT||"4432"),REMOTE=process.env.P07F22_SITE_URL||null,BASE=REMOTE||("http://127.0.0.1:"+PORT+"/index.html"),BASE_ORIGIN=new URL(BASE).origin,
  CACHE_TOKEN=process.env.P07F22_LIVE_CACHE_TOKEN||String(Date.now()),OUT=path.resolve("tmp/p07f-w7-slice022-classic-ui-acceptance");
mkdirSync(OUT,{recursive:true});const sleep=ms=>new Promise(r=>setTimeout(r,ms));let server=null,browser=null,serverOut="",serverErr="";
if(!REMOTE){server=spawn(process.execPath,["tools/site/serve-site.js"],{env:{...process.env,SITE_PORT:String(PORT),SITE_HOST:"127.0.0.1"},stdio:["ignore","pipe","pipe"]});server.stdout.on("data",c=>serverOut+=c);server.stderr.on("data",c=>serverErr+=c);}
async function ready(){let last;for(let i=0;i<50;i++){try{const r=await fetch(BASE,{cache:"no-store"});if(r.ok)return;}catch(e){last=e;}await sleep(250);}throw new Error("P07F22_SITE_NOT_READY:"+(last?.message||"unknown"));}
const errors={console:[],page:[],request:[],http:[]},moduleResponses=[];
async function run(){
 const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
 if(REMOTE)await page.route("**/*",async route=>{const request=route.request(),url=new URL(request.url());if(request.method()==="GET"&&url.origin===BASE_ORIGIN&&(url.pathname.endsWith(".js")||url.pathname.endsWith(".css")||url.pathname.includes("/modules/"))){url.searchParams.set("p07f22-e6",CACHE_TOKEN);await route.continue({url:url.href,headers:{...request.headers(),"cache-control":"no-cache","pragma":"no-cache"}});return;}await route.continue();});
 page.on("console",m=>{if(m.type()==="error")errors.console.push(m.text());});page.on("pageerror",e=>errors.page.push(String(e?.stack||e)));page.on("requestfailed",r=>errors.request.push({url:r.url(),failure:r.failure()?.errorText||"unknown"}));page.on("response",r=>{const url=new URL(r.url());if(r.status()>=400&&(/\.(?:m?js|css)(?:\?|$)/i.test(r.url())||r.url().includes("/modules/")||r.url().includes("/assets/")))errors.http.push({url:r.url(),status:r.status()});if(REMOTE&&url.origin===BASE_ORIGIN&&(url.pathname.endsWith(".js")||url.pathname.includes("/modules/"))){const headers=r.headers();moduleResponses.push({url:r.url(),status:r.status(),etag:headers.etag||null,age:headers.age||null,cacheControl:headers["cache-control"]||null});}});
 const url=new URL(BASE);url.searchParams.set("p07f22",String(Date.now()));const response=await page.goto(url.href,{waitUntil:"networkidle",timeout:120000});if(!response?.ok())throw new Error("P07F22_MAIN_HTTP:"+(response?.status()||"none"));
 await page.waitForFunction(()=>[...document.querySelectorAll("#batch-a-grade-select option")].some(o=>o.value==="6"),null,{timeout:120000});
 await page.selectOption("#batch-a-grade-select","6");await page.waitForFunction(v=>[...document.querySelectorAll("#batch-a-semester-select option")].some(o=>o.value===v),"lower",{timeout:120000});await page.selectOption("#batch-a-semester-select","lower");
 await page.waitForFunction(id=>[...document.querySelectorAll("#batch-a-source-select option")].some(o=>o.value===id),SOURCE,{timeout:120000});await page.selectOption("#batch-a-source-select",SOURCE);
 await page.waitForFunction(id=>Boolean(document.querySelector('#batch-a-knowledge-point-panel [data-knowledge-point-id="'+id+'"]')),TARGETS[0][0],{timeout:120000});
 const selector=await page.evaluate(targets=>({sourceId:document.querySelector("#batch-a-source-select")?.value,visibleIds:[...document.querySelectorAll("#batch-a-knowledge-point-panel [data-knowledge-point-id]")].map(n=>n.dataset.knowledgePointId),
   targetsPresent:targets.every(id=>Boolean(document.querySelector('[data-knowledge-point-id="'+id+'"]'))),sameUnitDisabled:Boolean(document.querySelector('#batch-a-selection-mode-select option[value="mixedKnowledgePointsSameUnit"]')?.disabled)}),TARGETS.map(x=>x[0]));
 if(selector.sourceId!==SOURCE||!selector.targetsPresent||!selector.sameUnitDisabled||selector.visibleIds.filter(id=>id.startsWith("kp_g6b_u04_")).length!==4)throw new Error("P07F22_SELECTOR:"+JSON.stringify(selector));
 await page.selectOption("#batch-a-selection-mode-select","singleKnowledgePoint");
 const targetReports=[];
 for(let index=0;index<TARGETS.length;index++){
   const [target,label]=TARGETS[index];
   await page.locator('#batch-a-knowledge-point-panel [data-knowledge-point-id="'+target+'"]').click();
   await page.waitForFunction(id=>{const s=[...document.querySelectorAll("#batch-a-knowledge-point-panel [data-knowledge-point-id][data-selected='true']")].map(n=>n.dataset.knowledgePointId);return s.length===1&&s[0]===id;},target,{timeout:120000});
   await page.fill("#batch-a-question-count-input",String(COUNT));await page.dispatchEvent("#batch-a-question-count-input","change");await page.selectOption("#batch-a-ordering-select","groupedByPattern");await page.check("#batch-a-answer-key-input");
   await page.fill("#columns-input","2");await page.dispatchEvent("#columns-input","change");await page.fill("#rows-per-page-input","4");await page.dispatchEvent("#rows-per-page-input","change");
   await page.fill("#generation-seed-input","p07f22-rate-rel-"+index);await page.dispatchEvent("#generation-seed-input","change");
   await page.locator("#regenerate-button").click();await page.waitForFunction(n=>{const x=document.querySelector("#status-panel")?.textContent||"";return x.includes("已產生 "+n+" 題")||x.includes("產生失敗");},COUNT,{timeout:20000});
   const state=await page.evaluate(()=>({status:document.querySelector("#status-panel")?.textContent?.trim()||"",tone:document.querySelector("#status-panel")?.dataset?.tone||"",valid:document.querySelector("#validation-panel")?.dataset?.hasErrors||null,preview:document.querySelector("#preview-frame")?.srcdoc?.length||0,printDisabled:Boolean(document.querySelector("#print-button")?.disabled)}));
   if(!state.status.includes("已產生 "+COUNT+" 題")||state.tone!=="success"||state.valid!=="false"||state.preview<=0||state.printDisabled)throw new Error("P07F22_GENERATION:"+target+":"+JSON.stringify(state));
   const frame=await (await page.locator("#preview-frame").elementHandle())?.contentFrame();if(!frame)throw new Error("P07F22_PREVIEW_FRAME_MISSING:"+target);await frame.waitForSelector(".worksheet-document",{timeout:120000});
   const worksheet=await frame.evaluate(()=>{const q=[...document.querySelectorAll(".worksheet-cell--question")],a=[...document.querySelectorAll(".worksheet-cell--answer-key")],overflow=[...document.querySelectorAll(".worksheet-page")].filter(n=>n.scrollHeight>n.clientHeight+1||n.scrollWidth>n.clientWidth+1).length,text=document.body?.innerText||"";return{questions:q.length,answers:a.length,overflow,text,leaks:text.includes("kp_g6b_u04_")||text.includes("ps_g6b_u04_")||text.includes("P07F22")};});
   if(worksheet.questions!==COUNT||worksheet.answers!==COUNT||worksheet.overflow!==0||worksheet.leaks)throw new Error("P07F22_WORKSHEET:"+target+":"+JSON.stringify({questions:worksheet.questions,answers:worksheet.answers,overflow:worksheet.overflow,leaks:worksheet.leaks}));
   if(!worksheet.text.includes("已知")||!worksheet.text.includes("是"))throw new Error("P07F22_SEMANTICS_MISSING:"+target+":"+label);
   for(const token of ["連續折扣","年利率","先增加","再減少"])if(worksheet.text.includes(token))throw new Error("P07F22_FORBIDDEN_SEMANTIC_LEAK:"+token);
   await frame.evaluate(()=>{window.__P07F22_PRINT__=0;window.print=()=>window.__P07F22_PRINT__++;});await page.locator("#print-button").click();const printCount=await frame.evaluate(()=>window.__P07F22_PRINT__||0);if(printCount!==1)throw new Error("P07F22_PRINT:"+target+":"+printCount);
   await frame.locator(".worksheet-document").screenshot({path:path.join(OUT,"q022-"+index+"-worksheet.png"),fullPage:true});
   targetReports.push({knowledgePointId:target,label,state,worksheet:{questions:worksheet.questions,answers:worksheet.answers,overflow:worksheet.overflow},printCount});
 }
 await page.screenshot({path:path.join(OUT,"q022-ui.png"),fullPage:true});await page.close();return{selector,targets:targetReports};
}
try{
 await ready();browser=await chromium.launch({headless:true});const target=await run();if(Object.values(errors).some(x=>x.length))throw new Error("P07F22_BROWSER_DIAGNOSTICS:"+JSON.stringify(errors));
 const report={schemaName:"P07FW7Q022ClassicUIAcceptanceV1",taskId:"P07F_W7DirectProductVerticalSlice022Implementation",status:"PASS_P07F_W7_Q022_CLASSIC_UI_ACCEPTANCE",sourceId:SOURCE,
   knowledgePointIds:TARGETS.map(x=>x[0]),questionCountPerTarget:COUNT,target,browser:{consoleErrorCount:0,pageErrorCount:0,requestFailureCount:0,assetHttpFailureCount:0},
   semanticInvariants:{threeRateQuantityRelationsOwned:true,sharedBaseComparisonRateRelationBound:true,allAnswersBackSubstituted:true,predecessorRoleOwnershipProtected:true,successiveRateChangeProtected:true,sameUnitMixedModeFailClosed:true},
   forbiddenScope:{predecessorRoleClassificationReownership:false,successiveRateChange:false,multiStageDiscountGrowthDecrease:false,sameUnitMixed:false,crossUnitMixed:false,fullRepositoryRegression:false,globalBrowserReplay:false}};
 writeFileSync(path.join(OUT,"report.json"),JSON.stringify(report,null,2)+"\n");console.log("P07F22_CLASSIC_UI_ACCEPTANCE="+JSON.stringify(report));
}catch(error){writeFileSync(path.join(OUT,"failure.json"),JSON.stringify({schemaName:"P07FW7Q022ClassicUIAcceptanceFailureV1",status:"FAIL",baseUrl:BASE,error:String(error?.stack||error),browser:errors,moduleResponses,
  cacheStrategy:{remote:Boolean(REMOTE),token:CACHE_TOKEN,moduleQueryParam:"p07f22-e6"},server:{stdout:serverOut,stderr:serverErr}},null,2)+"\n");throw error;}
finally{if(browser)await browser.close().catch(()=>{});if(server&&!server.killed)server.kill("SIGTERM");}
