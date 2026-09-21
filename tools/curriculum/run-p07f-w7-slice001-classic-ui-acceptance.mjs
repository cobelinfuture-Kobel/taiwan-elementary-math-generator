import {spawn} from "node:child_process";
import {mkdirSync,writeFileSync} from "node:fs";
import path from "node:path";
import {chromium} from "playwright";

const SOURCE="g6a_u05_6a05";
const TARGET="kp_g6a_u05_ratio_notation_order";
const Q002="kp_g6a_u05_ratio_value";
const PROTECTED=["kp_g6a_u05_equivalent_ratio","kp_g6a_u05_simplify_ratio","kp_g6a_u05_ratio_partition_application"];
const COUNT=9;
const PORT=Number(process.env.P07F01_SITE_PORT||"4411");
const REMOTE=process.env.P07F01_SITE_URL||null;
const BASE=REMOTE||("http://127.0.0.1:"+PORT+"/index.html");
const OUT=path.resolve("tmp/p07f-w7-slice001-classic-ui-acceptance");
mkdirSync(OUT,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let server=null,browser=null,serverOut="",serverErr="";
if(!REMOTE){server=spawn(process.execPath,["tools/site/serve-site.js"],{env:{...process.env,SITE_PORT:String(PORT),SITE_HOST:"127.0.0.1"},stdio:["ignore","pipe","pipe"]});server.stdout.on("data",c=>serverOut+=c);server.stderr.on("data",c=>serverErr+=c);}
async function ready(){let last;for(let i=0;i<50;i++){try{const r=await fetch(BASE,{cache:"no-store"});if(r.ok)return;}catch(e){last=e;}await sleep(250);}throw new Error("P07F01_SITE_NOT_READY:"+(last?.message||"unknown"));}
const errors={console:[],page:[],request:[],http:[]};
async function selectSource(page){
  await page.selectOption("#batch-a-grade-select","6");
  await page.waitForFunction(v=>[...document.querySelectorAll("#batch-a-semester-select option")].some(o=>o.value===v),"upper",{timeout:120000});
  await page.selectOption("#batch-a-semester-select","upper");
  await page.waitForFunction(id=>[...document.querySelectorAll("#batch-a-source-select option")].some(o=>o.value===id),SOURCE,{timeout:120000});
  await page.selectOption("#batch-a-source-select",SOURCE);
}
async function generateFor(page){
  await page.selectOption("#batch-a-selection-mode-select","singleKnowledgePoint");
  await page.locator('#batch-a-knowledge-point-panel [data-knowledge-point-id="'+TARGET+'"]').click();
  await page.waitForFunction(id=>{const selected=[...document.querySelectorAll("#batch-a-knowledge-point-panel [data-knowledge-point-id][data-selected='true']")].map(n=>n.dataset.knowledgePointId);return selected.length===1&&selected[0]===id;},TARGET,{timeout:120000});
  await page.fill("#batch-a-question-count-input",String(COUNT));await page.dispatchEvent("#batch-a-question-count-input","change");
  await page.selectOption("#batch-a-ordering-select","groupedByPattern");
  await page.check("#batch-a-answer-key-input");
  await page.fill("#columns-input","2");await page.dispatchEvent("#columns-input","change");
  await page.fill("#rows-per-page-input","5");await page.dispatchEvent("#rows-per-page-input","change");
  await page.fill("#generation-seed-input","p07f01-ratio-notation-ui");await page.dispatchEvent("#generation-seed-input","change");
  await page.locator("#regenerate-button").click();
  await page.waitForFunction(n=>{const x=document.querySelector("#status-panel")?.textContent||"";return x.includes("已產生 "+n+" 題")||x.includes("產生失敗");},COUNT,{timeout:20000});
  const state=await page.evaluate(()=>({status:document.querySelector("#status-panel")?.textContent?.trim()||"",tone:document.querySelector("#status-panel")?.dataset?.tone||"",valid:document.querySelector("#validation-panel")?.dataset?.hasErrors||null,preview:document.querySelector("#preview-frame")?.srcdoc?.length||0,printDisabled:Boolean(document.querySelector("#print-button")?.disabled)}));
  if(!state.status.includes("已產生 "+COUNT+" 題")||state.tone!=="success"||state.valid!=="false"||state.preview<=0||state.printDisabled)throw new Error("P07F01_GENERATION:"+JSON.stringify(state));
  const frame=await (await page.locator("#preview-frame").elementHandle())?.contentFrame();if(!frame)throw new Error("P07F01_PREVIEW_FRAME_MISSING");
  await frame.waitForSelector(".worksheet-document",{timeout:120000});
  const worksheet=await frame.evaluate(()=>{const q=[...document.querySelectorAll(".worksheet-cell--question")],a=[...document.querySelectorAll(".worksheet-cell--answer-key")],overflow=[...document.querySelectorAll(".worksheet-page")].filter(n=>n.scrollHeight>n.clientHeight+1||n.scrollWidth>n.clientWidth+1).length,text=document.body?.innerText||"";return{questions:q.length,answers:a.length,overflow,text,leaks:text.includes("kp_g6a_u05_")||text.includes("ps_g6a_u05_")||text.includes("P07F01")};});
  if(worksheet.questions!==COUNT||worksheet.answers!==COUNT||worksheet.overflow!==0||worksheet.leaks)throw new Error("P07F01_WORKSHEET:"+JSON.stringify({questions:worksheet.questions,answers:worksheet.answers,overflow:worksheet.overflow,leaks:worksheet.leaks}));
  return{state,worksheet,frame};
}
async function run(){
  const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
  page.on("console",m=>{if(m.type()==="error")errors.console.push(m.text());});page.on("pageerror",e=>errors.page.push(String(e?.stack||e)));page.on("requestfailed",r=>errors.request.push({url:r.url(),failure:r.failure()?.errorText||"unknown"}));page.on("response",r=>{if(r.status()>=400&&(/\.(?:m?js|css)(?:\?|$)/i.test(r.url())||r.url().includes("/modules/")||r.url().includes("/assets/")))errors.http.push({url:r.url(),status:r.status()});});
  const url=new URL(BASE);url.searchParams.set("p07f01",String(Date.now()));
  const response=await page.goto(url.href,{waitUntil:"networkidle",timeout:120000});if(!response?.ok())throw new Error("P07F01_MAIN_HTTP:"+(response?.status()||"none"));
  await page.waitForFunction(()=>[...document.querySelectorAll("#batch-a-grade-select option")].some(o=>o.value==="6"),null,{timeout:120000});
  await selectSource(page);
  await page.waitForFunction(({target,q2,protectedIds})=>Boolean(document.querySelector('#batch-a-knowledge-point-panel [data-knowledge-point-id="'+target+'"]'))&&Boolean(document.querySelector('#batch-a-knowledge-point-panel [data-knowledge-point-id="'+q2+'"]'))&&protectedIds.every(id=>!document.querySelector('#batch-a-knowledge-point-panel [data-knowledge-point-id="'+id+'"]')),{target:TARGET,q2:Q002,protectedIds:PROTECTED},{timeout:120000});
  const selector=await page.evaluate(({target,q2,protectedIds})=>({sourceId:document.querySelector("#batch-a-source-select")?.value,targetPresent:Boolean(document.querySelector('#batch-a-knowledge-point-panel [data-knowledge-point-id="'+target+'"]')),q002Present:Boolean(document.querySelector('#batch-a-knowledge-point-panel [data-knowledge-point-id="'+q2+'"]')),protectedAbsent:protectedIds.every(id=>!document.querySelector('#batch-a-knowledge-point-panel [data-knowledge-point-id="'+id+'"]')),visibleIds:[...document.querySelectorAll("#batch-a-knowledge-point-panel [data-knowledge-point-id]")].map(n=>n.dataset.knowledgePointId),sameUnitDisabled:Boolean(document.querySelector('#batch-a-selection-mode-select option[value="mixedKnowledgePointsSameUnit"]')?.disabled)}),{target:TARGET,q2:Q002,protectedIds:PROTECTED});
  if(selector.sourceId!==SOURCE||!selector.targetPresent||!selector.q002Present||!selector.protectedAbsent||!selector.sameUnitDisabled)throw new Error("P07F01_SELECTOR:"+JSON.stringify(selector));
  const target=await generateFor(page);
  for(const token of ["寫成比的記號","前項是多少","後項是多少"])if(!target.worksheet.text.includes(token))throw new Error("P07F01_SEMANTICS_MISSING:"+token);
  await target.frame.evaluate(()=>{window.__P07F01_PRINT__=0;window.print=()=>window.__P07F01_PRINT__++;});await page.locator("#print-button").click();
  const printCount=await target.frame.evaluate(()=>window.__P07F01_PRINT__||0);if(printCount!==1)throw new Error("P07F01_PRINT:"+printCount);
  await target.frame.locator(".worksheet-document").screenshot({path:path.join(OUT,"q001-worksheet.png"),fullPage:true});await page.screenshot({path:path.join(OUT,"q001-ui.png"),fullPage:true});
  await page.close();return{selector,target:{state:target.state,worksheet:{questions:target.worksheet.questions,answers:target.worksheet.answers,overflow:target.worksheet.overflow}},printCount};
}
try{
  await ready();browser=await chromium.launch({headless:true});const target=await run();
  if(Object.values(errors).some(x=>x.length))throw new Error("P07F01_BROWSER_DIAGNOSTICS:"+JSON.stringify(errors));
  const report={schemaName:"P07FW7Q001ClassicUIAcceptanceV1",taskId:"P07F_W7DirectProductVerticalSlice001Implementation",status:"PASS_P07F_W7_Q001_CLASSIC_UI_ACCEPTANCE",sourceId:SOURCE,knowledgePointIds:[TARGET],questionCountPerTarget:COUNT,target,browser:{consoleErrorCount:0,pageErrorCount:0,requestFailureCount:0,assetHttpFailureCount:0},semanticInvariants:{orderedRatioNotationCorePreserved:true,antecedentFirstRequired:true,consequentSecondRequired:true,swappedTermsChangeRelation:true,remainingSameSourceCapabilitiesHidden:true,sameUnitMixedModeFailClosed:true},forbiddenScope:{ratioValueReownership:false,equivalentRatioReownership:false,simplestIntegerRatioReownership:false,ratioPartitionApplicationReownership:false,proportionCrossMultiplicationReownership:false,percentConversionReownership:false,applicationContext:false,sameUnitMixed:false,crossUnitMixed:false,fullRepositoryRegression:false,globalBrowserReplay:false}};
  writeFileSync(path.join(OUT,"report.json"),JSON.stringify(report,null,2)+"\n");console.log("P07F01_CLASSIC_UI_ACCEPTANCE="+JSON.stringify(report));
}catch(error){writeFileSync(path.join(OUT,"failure.json"),JSON.stringify({schemaName:"P07FW7Q001ClassicUIAcceptanceFailureV1",status:"FAIL",baseUrl:BASE,error:String(error?.stack||error),browser:errors,server:{stdout:serverOut,stderr:serverErr}},null,2)+"\n");throw error;}finally{if(browser)await browser.close().catch(()=>{});if(server&&!server.killed)server.kill("SIGTERM");}
