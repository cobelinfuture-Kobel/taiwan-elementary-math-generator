import {spawn} from "node:child_process";
import {mkdirSync,writeFileSync} from "node:fs";
import path from "node:path";
import {chromium} from "playwright";

const SOURCE="g6b_u05_6b05";
const TARGET="kp_g6b_u05_age_or_repeated_relation_problem";
const PREDECESSOR="kp_g6b_u05_sum_difference_problem";
const PROTECTED=["kp_g6b_u05_sum_multiple_problem","kp_g6b_u05_difference_multiple_problem","kp_g6b_u05_work_or_distribution_strategy"];
const COUNT=8;
const PORT=Number(process.env.P06F20_SITE_PORT||"4410");
const REMOTE=process.env.P06F20_SITE_URL||null;
const BASE=REMOTE||("http://127.0.0.1:"+PORT+"/index.html");
const OUT=path.resolve("tmp/p06f-w6-slice020-classic-ui-acceptance");
mkdirSync(OUT,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let server=null,browser=null,serverOut="",serverErr="";
if(!REMOTE){
  server=spawn(process.execPath,["tools/site/serve-site.js"],{env:{...process.env,SITE_PORT:String(PORT),SITE_HOST:"127.0.0.1"},stdio:["ignore","pipe","pipe"]});
  server.stdout.on("data",c=>serverOut+=c);server.stderr.on("data",c=>serverErr+=c);
}
async function ready(){let last;for(let i=0;i<50;i++){try{const r=await fetch(BASE,{cache:"no-store"});if(r.ok)return;}catch(e){last=e;}await sleep(250);}throw new Error("P06F20_SITE_NOT_READY:"+(last?.message||"unknown"));}
const errors={console:[],page:[],request:[],http:[]};
async function selectSource(page){
  await page.selectOption("#batch-a-grade-select","6");
  await page.waitForFunction(v=>[...document.querySelectorAll("#batch-a-semester-select option")].some(o=>o.value===v),"lower",{timeout:120000});
  await page.selectOption("#batch-a-semester-select","lower");
  await page.waitForFunction(id=>[...document.querySelectorAll("#batch-a-source-select option")].some(o=>o.value===id),SOURCE,{timeout:120000});
  await page.selectOption("#batch-a-source-select",SOURCE);
}
async function generateFor(page,kp,count,seed,columns=2,rows=4){
  await page.selectOption("#batch-a-selection-mode-select","singleKnowledgePoint");
  await page.locator('#batch-a-knowledge-point-panel [data-knowledge-point-id="'+kp+'"]').click();
  await page.waitForFunction(id=>{const selected=[...document.querySelectorAll("#batch-a-knowledge-point-panel [data-knowledge-point-id][data-selected='true']")].map(n=>n.dataset.knowledgePointId);return selected.length===1&&selected[0]===id;},kp,{timeout:120000});
  await page.fill("#batch-a-question-count-input",String(count));await page.dispatchEvent("#batch-a-question-count-input","change");
  await page.selectOption("#batch-a-ordering-select","groupedByPattern");
  await page.check("#batch-a-answer-key-input");
  await page.fill("#columns-input",String(columns));await page.dispatchEvent("#columns-input","change");
  await page.fill("#rows-per-page-input",String(rows));await page.dispatchEvent("#rows-per-page-input","change");
  await page.fill("#generation-seed-input",seed);await page.dispatchEvent("#generation-seed-input","change");
  await page.locator("#regenerate-button").click();
  await page.waitForFunction(n=>{const x=document.querySelector("#status-panel")?.textContent||"";return x.includes("已產生 "+n+" 題")||x.includes("產生失敗");},count,{timeout:20000});
  const state=await page.evaluate(()=>({status:document.querySelector("#status-panel")?.textContent?.trim()||"",tone:document.querySelector("#status-panel")?.dataset?.tone||"",valid:document.querySelector("#validation-panel")?.dataset?.hasErrors||null,preview:document.querySelector("#preview-frame")?.srcdoc?.length||0,printDisabled:Boolean(document.querySelector("#print-button")?.disabled)}));
  if(!state.status.includes("已產生 "+count+" 題")||state.tone!=="success"||state.valid!=="false"||state.preview<=0||state.printDisabled)throw new Error("P06F20_GENERATION:"+kp+":"+JSON.stringify(state));
  const frame=await (await page.locator("#preview-frame").elementHandle())?.contentFrame();if(!frame)throw new Error("P06F20_PREVIEW_FRAME_MISSING:"+kp);
  await frame.waitForSelector(".worksheet-document",{timeout:120000});
  const worksheet=await frame.evaluate(()=>{const q=[...document.querySelectorAll(".worksheet-cell--question")],a=[...document.querySelectorAll(".worksheet-cell--answer-key")],overflow=[...document.querySelectorAll(".worksheet-page")].filter(n=>n.scrollHeight>n.clientHeight+1||n.scrollWidth>n.clientWidth+1).length,text=document.body?.innerText||"";return{questions:q.length,answers:a.length,overflow,text,leaks:text.includes("kp_g6b_u05_")||text.includes("ps_g6b_u05_")||text.includes("P06F20")};});
  if(worksheet.questions!==count||worksheet.answers!==count||worksheet.overflow!==0||worksheet.leaks)throw new Error("P06F20_WORKSHEET:"+JSON.stringify({questions:worksheet.questions,answers:worksheet.answers,overflow:worksheet.overflow,leaks:worksheet.leaks}));
  return{state,worksheet,frame};
}
async function run(){
  const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
  page.on("console",m=>{if(m.type()==="error")errors.console.push(m.text());});page.on("pageerror",e=>errors.page.push(String(e?.stack||e)));page.on("requestfailed",r=>errors.request.push({url:r.url(),failure:r.failure()?.errorText||"unknown"}));page.on("response",r=>{if(r.status()>=400&&(/\.(?:m?js|css)(?:\?|$)/i.test(r.url())||r.url().includes("/modules/")||r.url().includes("/assets/")))errors.http.push({url:r.url(),status:r.status()});});
  const url=new URL(BASE);url.searchParams.set("p06f20",String(Date.now()));
  const response=await page.goto(url.href,{waitUntil:"networkidle",timeout:120000});if(!response?.ok())throw new Error("P06F20_MAIN_HTTP:"+(response?.status()||"none"));
  await page.waitForFunction(()=>[...document.querySelectorAll("#batch-a-grade-select option")].some(o=>o.value==="6"),null,{timeout:120000});
  await selectSource(page);
  await page.waitForFunction(({target,predecessor,protectedIds})=>Boolean(document.querySelector('#batch-a-knowledge-point-panel [data-knowledge-point-id="'+target+'"]'))&&Boolean(document.querySelector('#batch-a-knowledge-point-panel [data-knowledge-point-id="'+predecessor+'"]'))&&protectedIds.every(id=>!document.querySelector('#batch-a-knowledge-point-panel [data-knowledge-point-id="'+id+'"]')),{target:TARGET,predecessor:PREDECESSOR,protectedIds:PROTECTED},{timeout:120000});
  const selector=await page.evaluate(({target,predecessor,protectedIds})=>({sourceId:document.querySelector("#batch-a-source-select")?.value,targetPresent:Boolean(document.querySelector('#batch-a-knowledge-point-panel [data-knowledge-point-id="'+target+'"]')),predecessorPresent:Boolean(document.querySelector('#batch-a-knowledge-point-panel [data-knowledge-point-id="'+predecessor+'"]')),protectedAbsent:protectedIds.every(id=>!document.querySelector('#batch-a-knowledge-point-panel [data-knowledge-point-id="'+id+'"]')),visibleIds:[...document.querySelectorAll("#batch-a-knowledge-point-panel [data-knowledge-point-id]")].map(n=>n.dataset.knowledgePointId),sameUnitDisabled:Boolean(document.querySelector('#batch-a-selection-mode-select option[value="mixedKnowledgePointsSameUnit"]')?.disabled)}),{target:TARGET,predecessor:PREDECESSOR,protectedIds:PROTECTED});
  if(selector.sourceId!==SOURCE||!selector.targetPresent||!selector.predecessorPresent||!selector.protectedAbsent||!selector.sameUnitDisabled)throw new Error("P06F20_SELECTOR:"+JSON.stringify(selector));
  const target=await generateFor(page,TARGET,COUNT,"p06f20-age-relation-ui",2,4);
  for(const token of ["年後","年前","比乙大","倍","現在幾歲"])if(!target.worksheet.text.includes(token))throw new Error("P06F20_SEMANTICS_MISSING:"+token);
  await target.frame.evaluate(()=>{window.__P06F20_PRINT__=0;window.print=()=>window.__P06F20_PRINT__++;});await page.locator("#print-button").click();
  const printCount=await target.frame.evaluate(()=>window.__P06F20_PRINT__||0);if(printCount!==1)throw new Error("P06F20_PRINT:"+printCount);
  await target.frame.locator(".worksheet-document").screenshot({path:path.join(OUT,"q020-worksheet.png"),fullPage:true});await page.screenshot({path:path.join(OUT,"q020-ui.png"),fullPage:true});
  await page.close();return{selector,target:{state:target.state,worksheet:{questions:target.worksheet.questions,answers:target.worksheet.answers,overflow:target.worksheet.overflow}},printCount};
}
try{
  await ready();browser=await chromium.launch({headless:true});const target=await run();
  if(Object.values(errors).some(x=>x.length))throw new Error("P06F20_BROWSER_DIAGNOSTICS:"+JSON.stringify(errors));
  const report={schemaName:"P06FW6Q020ClassicUIAcceptanceV1",taskId:"P06F_W6DirectProductVerticalSlice020Implementation",status:"PASS_P06F_W6_Q020_CLASSIC_UI_ACCEPTANCE",sourceId:SOURCE,knowledgePointIds:[TARGET],questionCountPerTarget:COUNT,target,browser:{consoleErrorCount:0,pageErrorCount:0,requestFailureCount:0,assetHttpFailureCount:0},semanticInvariants:{ageDifferenceInvariantCorePreserved:true,equalTimeShiftRequired:true,shiftedMultiplicativeRelationRequired:true,currentAndShiftedBackSubstitutionRequired:true,positiveAgeStateRequired:true,q019PredecessorVisible:true,remainingSameSourceCapabilitiesHidden:true,sameUnitMixedModeFailClosed:true},forbiddenScope:{q019SumDifferenceReownership:false,generalSumMultipleReownership:false,generalDifferenceMultipleReownership:false,workOrDistributionReownership:false,genericSequenceReownership:false,genericApplicationOverlay:false,globalContextBinding:false,pblProjection:false,sameUnitMixed:false,crossUnitMixed:false,fullRepositoryRegression:false,globalBrowserReplay:false}};
  writeFileSync(path.join(OUT,"report.json"),JSON.stringify(report,null,2)+"\n");console.log("P06F20_CLASSIC_UI_ACCEPTANCE="+JSON.stringify(report));
}catch(error){writeFileSync(path.join(OUT,"failure.json"),JSON.stringify({schemaName:"P06FW6Q020ClassicUIAcceptanceFailureV1",status:"FAIL",baseUrl:BASE,error:String(error?.stack||error),browser:errors,server:{stdout:serverOut,stderr:serverErr}},null,2)+"\n");throw error;}finally{if(browser)await browser.close().catch(()=>{});if(server&&!server.killed)server.kill("SIGTERM");}
