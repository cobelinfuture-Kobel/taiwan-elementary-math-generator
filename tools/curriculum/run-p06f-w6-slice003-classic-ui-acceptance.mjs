import {spawn} from "node:child_process";
import {mkdirSync,writeFileSync} from "node:fs";
import path from "node:path";
import {chromium} from "playwright";
const SOURCE="g3b_u10_3b10",KP="kp_one_way_table_reading",FUTURE=["kp_table_data_comparison","kp_two_way_table_structure","kp_table_extrema_and_missing_value","kp_construct_two_way_table"],Q002_SOURCE="g3a_u07_3a07",COUNT=8,PORT=Number(process.env.P06F03_SITE_PORT??"4363"),REMOTE=process.env.P06F03_SITE_URL??null,BASE=REMOTE??`http://127.0.0.1:${PORT}/index.html`,OUT=path.resolve("tmp/p06f-w6-slice003-classic-ui-acceptance");
mkdirSync(OUT,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let server=null,browser=null,serverOut="",serverErr="";
if(!REMOTE){server=spawn(process.execPath,["tools/site/serve-site.js"],{env:{...process.env,SITE_PORT:String(PORT),SITE_HOST:"127.0.0.1"},stdio:["ignore","pipe","pipe"]});server.stdout.on("data",c=>serverOut+=c);server.stderr.on("data",c=>serverErr+=c);}
async function ready(){let last;for(let i=0;i<50;i++){try{const r=await fetch(BASE,{cache:"no-store"});if(r.ok)return;}catch(e){last=e;}await sleep(250);}throw new Error(`P06F03_SITE_NOT_READY:${last?.message??"unknown"}`);}
const errors={console:[],page:[],request:[],http:[]};
async function run(){
  const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
  page.on("console",m=>{if(m.type()==="error")errors.console.push(m.text());});
  page.on("pageerror",e=>errors.page.push(String(e?.stack??e)));
  page.on("requestfailed",r=>errors.request.push({url:r.url(),failure:r.failure()?.errorText??"unknown"}));
  page.on("response",r=>{if(r.status()>=400&&(/\.(?:m?js|css)(?:\?|$)/i.test(r.url())||r.url().includes("/modules/")||r.url().includes("/assets/")))errors.http.push({url:r.url(),status:r.status()});});
  const url=new URL(BASE);url.searchParams.set("p06f03",String(Date.now()));
  const response=await page.goto(url.href,{waitUntil:"networkidle",timeout:120000});
  if(!response?.ok())throw new Error(`P06F03_MAIN_HTTP:${response?.status()??"none"}`);
  await page.waitForFunction(()=>[...document.querySelectorAll("#batch-a-grade-select option")].some(o=>o.value==="3"),null,{timeout:120000});
  await page.selectOption("#batch-a-grade-select","3");
  await page.waitForFunction(()=>[...document.querySelectorAll("#batch-a-semester-select option")].some(o=>o.value==="upper"),null,{timeout:120000});
  await page.selectOption("#batch-a-semester-select","upper");
  await page.waitForFunction(id=>[...document.querySelectorAll("#batch-a-source-select option")].some(o=>o.value===id),Q002_SOURCE,{timeout:120000});
  const q002SourceCheck=await page.evaluate(q2=>({semester:document.querySelector("#batch-a-semester-select")?.value,ids:[...document.querySelectorAll("#batch-a-source-select option")].map(o=>o.value),q002Present:[...document.querySelectorAll("#batch-a-source-select option")].some(o=>o.value===q2)}),Q002_SOURCE);
  if(!q002SourceCheck.q002Present)throw new Error(`P06F03_Q002_SOURCE_MISSING:${JSON.stringify(q002SourceCheck)}`);
  await page.selectOption("#batch-a-semester-select","lower");
  await page.waitForFunction(id=>[...document.querySelectorAll("#batch-a-source-select option")].some(o=>o.value===id),SOURCE,{timeout:120000});
  const sources=await page.evaluate(({q2,target})=>({semester:document.querySelector("#batch-a-semester-select")?.value,ids:[...document.querySelectorAll("#batch-a-source-select option")].map(o=>o.value),targetPresent:[...document.querySelectorAll("#batch-a-source-select option")].some(o=>o.value===target),q002VerifiedInUpper:true,q002SourceId:q2}),{q2:Q002_SOURCE,target:SOURCE});
  if(!sources.targetPresent)throw new Error(`P06F03_TARGET_SOURCE_MISSING:${JSON.stringify(sources)}`);
  await page.selectOption("#batch-a-source-select",SOURCE);
  await page.waitForFunction(({kp,future})=>Boolean(document.querySelector(`#batch-a-knowledge-point-panel [data-knowledge-point-id="${kp}"]`))&&future.every(id=>!document.querySelector(`#batch-a-knowledge-point-panel [data-knowledge-point-id="${id}"]`)),{kp:KP,future:FUTURE},{timeout:120000});
  const selector=await page.evaluate(({kp,future})=>({sourceId:document.querySelector("#batch-a-source-select")?.value,visibleIds:[...document.querySelectorAll("#batch-a-knowledge-point-panel [data-knowledge-point-id]")].map(n=>n.dataset.knowledgePointId),targetPresent:Boolean(document.querySelector(`#batch-a-knowledge-point-panel [data-knowledge-point-id="${kp}"]`)),futureLeaked:future.filter(id=>Boolean(document.querySelector(`#batch-a-knowledge-point-panel [data-knowledge-point-id="${id}"]`)))}),{kp:KP,future:FUTURE});
  if(selector.sourceId!==SOURCE||!selector.targetPresent||selector.futureLeaked.length)throw new Error(`P06F03_SELECTOR:${JSON.stringify(selector)}`);
  await page.selectOption("#batch-a-selection-mode-select","singleKnowledgePoint");
  await page.locator(`#batch-a-knowledge-point-panel [data-knowledge-point-id="${KP}"]`).click();
  await page.waitForFunction(id=>{const s=[...document.querySelectorAll("#batch-a-knowledge-point-panel [data-knowledge-point-id][data-selected='true']")].map(n=>n.dataset.knowledgePointId);return s.length===1&&s[0]===id;},KP,{timeout:120000});
  await page.fill("#batch-a-question-count-input",String(COUNT));
  await page.dispatchEvent("#batch-a-question-count-input","change");
  await page.selectOption("#batch-a-ordering-select","groupedByPattern");
  await page.check("#batch-a-answer-key-input");
  await page.fill("#columns-input","2");await page.dispatchEvent("#columns-input","change");
  await page.fill("#rows-per-page-input","4");await page.dispatchEvent("#rows-per-page-input","change");
  await page.fill("#generation-seed-input","p06f03-ui");await page.dispatchEvent("#generation-seed-input","change");
  await page.locator("#regenerate-button").click();
  await page.waitForFunction(n=>{const x=document.querySelector("#status-panel")?.textContent??"";return x.includes(`已產生 ${n} 題`)||x.includes("產生失敗");},COUNT,{timeout:20000});
  const state=await page.evaluate(()=>({status:document.querySelector("#status-panel")?.textContent?.trim()??"",tone:document.querySelector("#status-panel")?.dataset?.tone??"",valid:document.querySelector("#validation-panel")?.dataset?.hasErrors??null,preview:document.querySelector("#preview-frame")?.srcdoc?.length??0,printDisabled:Boolean(document.querySelector("#print-button")?.disabled)}));
  if(!state.status.includes(`已產生 ${COUNT} 題`)||state.tone!=="success"||state.valid!=="false"||state.preview<=0||state.printDisabled)throw new Error(`P06F03_GENERATION:${JSON.stringify(state)}`);
  const frame=await (await page.locator("#preview-frame").elementHandle())?.contentFrame();
  if(!frame)throw new Error("P06F03_PREVIEW_FRAME_MISSING");
  await frame.waitForSelector(".worksheet-document",{timeout:120000});
  const worksheet=await frame.evaluate(({count,kp})=>{const q=[...document.querySelectorAll(".worksheet-cell--question")],a=[...document.querySelectorAll(".worksheet-cell--answer-key")],qt=[...document.querySelectorAll(".worksheet-cell--question .worksheet-one-way-statistics-table")],at=[...document.querySelectorAll(".worksheet-cell--answer-key .worksheet-one-way-statistics-table")],charts=[...document.querySelectorAll('[data-representation*="chart"],.worksheet-chart')],overflow=[...document.querySelectorAll(".worksheet-page")].filter(n=>n.scrollHeight>n.clientHeight+1||n.scrollWidth>n.clientWidth+1).length,allText=document.body?.innerText??"";return{questions:q.length,answers:a.length,questionTables:qt.length,answerTables:at.length,chartRepresentations:charts.length,overflow,leaks:allText.includes(kp)||allText.includes("ps_g3b_u10_")||allText.includes("P06F03")};},{count:COUNT,kp:KP});
  if(worksheet.questions!==COUNT||worksheet.answers!==COUNT||worksheet.questionTables!==COUNT||worksheet.answerTables!==COUNT||worksheet.chartRepresentations!==0||worksheet.overflow!==0||worksheet.leaks)throw new Error(`P06F03_WORKSHEET:${JSON.stringify(worksheet)}`);
  await frame.evaluate(()=>{window.__P06F03_PRINT__=0;window.print=()=>window.__P06F03_PRINT__++;});
  await page.locator("#print-button").click();
  const printCount=await frame.evaluate(()=>window.__P06F03_PRINT__??0);
  if(printCount!==1)throw new Error(`P06F03_PRINT:${printCount}`);
  await frame.locator(".worksheet-document").screenshot({path:path.join(OUT,"q003-worksheet.png"),fullPage:true});
  await page.screenshot({path:path.join(OUT,"q003-ui.png"),fullPage:true});
  await page.close();
  return{sources,selector,state,worksheet,printCount};
}
try{
  await ready();
  browser=await chromium.launch({headless:true});
  const target=await run();
  if(Object.values(errors).some(x=>x.length))throw new Error(`P06F03_BROWSER_DIAGNOSTICS:${JSON.stringify(errors)}`);
  const report={schemaName:"P06FW6Q003ClassicUIAcceptanceV1",taskId:"P06F_W6DirectProductVerticalSlice003Implementation",status:"PASS_P06F_W6_Q003_CLASSIC_UI_ACCEPTANCE",sourceId:SOURCE,knowledgePointId:KP,questionCount:COUNT,target,browser:{consoleErrorCount:0,pageErrorCount:0,requestFailureCount:0,assetHttpFailureCount:0},semanticInvariants:{oneWayTableReadingPreserved:true,historicalChartProfileDoesNotRenderChart:true,q002PredecessorSourceVisible:true,q004PlusHidden:true},forbiddenScope:{comparison:false,twoWayTable:false,missingValue:false,chartReading:false,applicationContext:false,sameUnitMixed:false,crossUnitMixed:false,q004OrLater:false,fullRepositoryRegression:false,globalBrowserReplay:false}};
  writeFileSync(path.join(OUT,"report.json"),`${JSON.stringify(report,null,2)}\n`);
  console.log(`P06F03_CLASSIC_UI_ACCEPTANCE=${JSON.stringify(report)}`);
}catch(error){
  writeFileSync(path.join(OUT,"failure.json"),`${JSON.stringify({schemaName:"P06FW6Q003ClassicUIAcceptanceFailureV1",status:"FAIL",baseUrl:BASE,error:String(error?.stack??error),browser:errors,server:{stdout:serverOut,stderr:serverErr}},null,2)}\n`);
  throw error;
}finally{
  if(browser)await browser.close().catch(()=>{});
  if(server&&!server.killed)server.kill("SIGTERM");
}
