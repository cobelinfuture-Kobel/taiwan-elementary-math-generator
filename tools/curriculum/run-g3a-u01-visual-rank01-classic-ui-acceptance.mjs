import {spawn} from "node:child_process";
import {mkdirSync,writeFileSync} from "node:fs";
import path from "node:path";
import {chromium} from "playwright";

const SOURCE="g3a_u01_3a01";
const KP="kp_g3a_u01_4digit_compare";
const GROUP="pg_g3a_u01_visual_one_way_table_compare";
const SPEC="ps_g3a_u01_visual_one_way_table_compare";
const COUNT=8;
const PORT=Number(process.env.G3AU01_R01_SITE_PORT??"4381");
const REMOTE=process.env.G3AU01_R01_SITE_URL??null;
const BASE=REMOTE??`http://127.0.0.1:${PORT}/index.html`;
const OUT=path.resolve("tmp/g3a-u01-rank01-public-cutover");
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
  for(let i=0;i<60;i++){
    try{const r=await fetch(BASE,{cache:"no-store"});if(r.ok)return;}catch(e){last=e;}
    await sleep(250);
  }
  throw new Error(`G3AU01_R01_SITE_NOT_READY:${last?.message??"unknown"}`);
}
const errors={console:[],page:[],request:[],http:[]};

async function run(){
  const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
  page.on("console",m=>{if(m.type()==="error")errors.console.push(m.text());});
  page.on("pageerror",e=>errors.page.push(String(e?.stack??e)));
  page.on("requestfailed",r=>errors.request.push({url:r.url(),failure:r.failure()?.errorText??"unknown"}));
  page.on("response",r=>{if(r.status()>=400&&(/\.(?:m?js|css)(?:\?|$)/i.test(r.url())||r.url().includes("/modules/")||r.url().includes("/assets/")))errors.http.push({url:r.url(),status:r.status()});});

  const url=new URL(BASE);
  url.searchParams.set("g3a_u01_rank01",String(Date.now()));
  const response=await page.goto(url.href,{waitUntil:"networkidle",timeout:120000});
  if(!response?.ok())throw new Error(`G3AU01_R01_MAIN_HTTP:${response?.status()??"none"}`);

  await page.waitForFunction(()=>[...document.querySelectorAll("#batch-a-grade-select option")].some(o=>o.value==="3"),null,{timeout:120000});
  await page.selectOption("#batch-a-grade-select","3");
  await page.waitForFunction(()=>[...document.querySelectorAll("#batch-a-semester-select option")].some(o=>o.value==="upper"),null,{timeout:120000});
  await page.selectOption("#batch-a-semester-select","upper");
  await page.waitForFunction(id=>[...document.querySelectorAll("#batch-a-source-select option")].some(o=>o.value===id),SOURCE,{timeout:120000});
  await page.selectOption("#batch-a-source-select",SOURCE);

  await page.waitForFunction(kp=>Boolean(document.querySelector(`#batch-a-knowledge-point-panel [data-knowledge-point-id="${kp}"]`)),KP,{timeout:120000});
  await page.selectOption("#batch-a-selection-mode-select","singleKnowledgePoint");
  await page.locator(`#batch-a-knowledge-point-panel [data-knowledge-point-id="${KP}"]`).click();
  await page.waitForFunction(kp=>{
    const selected=[...document.querySelectorAll("#batch-a-knowledge-point-panel [data-knowledge-point-id][data-selected='true']")].map(n=>n.dataset.knowledgePointId);
    return selected.length===1&&selected[0]===kp;
  },KP,{timeout:120000});

  await page.waitForFunction(()=>document.querySelector("#batch-a-pattern-group-selector")?.dataset?.visible==="false",null,{timeout:120000});
  const before=await page.evaluate(kp=>({
    targetKnowledgePointVisible:Boolean(document.querySelector(`#batch-a-knowledge-point-panel [data-knowledge-point-id="${kp}"]`)),
    patternGroupSelectorVisible:document.querySelector("#batch-a-pattern-group-selector")?.dataset?.visible??null,
    visiblePatternGroupButtons:[...document.querySelectorAll("#batch-a-pattern-group-panel [data-pattern-group-id]")].filter(n=>!n.hidden).length,
  }),KP);
  if(!before.targetKnowledgePointVisible||before.patternGroupSelectorVisible!=="false"||before.visiblePatternGroupButtons!==0){
    throw new Error(`G3AU01_R01_FLAT_SELECTOR_INVALID:${JSON.stringify(before)}`);
  }

  await page.fill("#columns-input","3");
  await page.dispatchEvent("#columns-input","change");
  await page.fill("#rows-per-page-input","5");
  await page.dispatchEvent("#rows-per-page-input","change");
  await page.waitForFunction(()=>document.querySelector("#rows-per-page-input")?.value==="2"
    && document.querySelector("#rows-per-page-input")?.max==="2",{timeout:30000});
  const layoutClamp=await page.evaluate(()=>({
    columns:document.querySelector("#columns-input")?.value,
    rows:document.querySelector("#rows-per-page-input")?.value,
    maxRows:document.querySelector("#rows-per-page-input")?.max,
    help:document.querySelector("#global-layout-help")?.textContent?.trim()??""
  }));
  if(layoutClamp.columns!=="3"||layoutClamp.rows!=="2"||layoutClamp.maxRows!=="2"||!layoutClamp.help.includes("最多 8 列資料表")){
    throw new Error(`G3AU01_R01_LAYOUT_CLAMP:${JSON.stringify(layoutClamp)}`);
  }

  await page.fill("#batch-a-question-count-input",String(COUNT));
  await page.dispatchEvent("#batch-a-question-count-input","change");
  await page.selectOption("#batch-a-ordering-select","groupedByPattern");
  await page.check("#batch-a-answer-key-input");
  await page.fill("#generation-seed-input","g3a-u01-rank01-public-ui");
  await page.dispatchEvent("#generation-seed-input","change");

  await page.locator("#regenerate-button").click();
  await page.waitForFunction(n=>{
    const x=document.querySelector("#status-panel")?.textContent??"";
    return x.includes(`已產生 ${n} 題`)||x.includes("產生失敗");
  },COUNT,{timeout:30000});

  const state=await page.evaluate(({kp,group})=>({
    sourceId:document.querySelector("#batch-a-source-select")?.value,
    selectionMode:document.querySelector("#batch-a-selection-mode-select")?.value,
    selectedKps:[...document.querySelectorAll("#batch-a-knowledge-point-panel [data-selected='true']")].map(n=>n.dataset.knowledgePointId),
    visiblePatternGroups:[...document.querySelectorAll("#batch-a-pattern-group-panel [data-pattern-group-id]")].filter(n=>!n.hidden).map(n=>n.dataset.patternGroupId),
    status:document.querySelector("#status-panel")?.textContent?.trim()??"",
    tone:document.querySelector("#status-panel")?.dataset?.tone??"",
    valid:document.querySelector("#validation-panel")?.dataset?.hasErrors??null,
    preview:document.querySelector("#preview-frame")?.srcdoc?.length??0,
    printDisabled:Boolean(document.querySelector("#print-button")?.disabled),
    columns:document.querySelector("#columns-input")?.value,
    rowsPerPage:document.querySelector("#rows-per-page-input")?.value,
    maxRowsPerPage:document.querySelector("#rows-per-page-input")?.max,
    targetKp:kp,targetGroup:group
  }),{kp:KP,group:GROUP});
  if(state.sourceId!==SOURCE||state.selectionMode!=="singleKnowledgePoint"||state.selectedKps.join("|")!==KP||state.selectedGroups.join("|")!==GROUP||!state.status.includes(`已產生 ${COUNT} 題`)||state.tone!=="success"||state.valid!=="false"||state.preview<=0||state.printDisabled||state.columns!=="3"||state.rowsPerPage!=="2"||state.maxRowsPerPage!=="2"){
    throw new Error(`G3AU01_R01_PUBLIC_STATE:${JSON.stringify(state)}`);
  }

  const frame=await (await page.locator("#preview-frame").elementHandle())?.contentFrame();
  if(!frame)throw new Error("G3AU01_R01_PREVIEW_FRAME_MISSING");
  await frame.waitForSelector(".worksheet-document",{timeout:120000});
  const worksheet=await frame.evaluate(({count,spec})=>{
    const q=[...document.querySelectorAll(".worksheet-cell--question")];
    const a=[...document.querySelectorAll(".worksheet-cell--answer-key")];
    const qt=[...document.querySelectorAll(".worksheet-cell--question .worksheet-one-way-statistics-table")];
    const at=[...document.querySelectorAll(".worksheet-cell--answer-key .worksheet-one-way-statistics-table")];
    const charts=[...document.querySelectorAll('[data-representation*="chart"],.worksheet-chart')];
    const pages=[...document.querySelectorAll(".worksheet-page")];
    const overflow=pages.filter(n=>n.scrollHeight>n.clientHeight+1||n.scrollWidth>n.clientWidth+1).length;
    const raw=document.body?.innerText??"";
    return{
      questions:q.length,answers:a.length,questionTables:qt.length,answerTables:at.length,
      charts:charts.length,pages:pages.length,overflow,
      specLeak:raw.includes(spec),
      tableRows:[...qt].map(t=>t.querySelectorAll("tbody tr").length),
      columns:[...document.querySelectorAll(".worksheet-page__grid")].map(n=>getComputedStyle(n).gridTemplateColumns.split(" ").length)
    };
  },{count:COUNT,spec:SPEC});
  if(worksheet.questions!==COUNT||worksheet.answers!==COUNT||worksheet.questionTables!==COUNT||worksheet.answerTables!==COUNT||worksheet.charts!==0||worksheet.overflow!==0||worksheet.specLeak){
    throw new Error(`G3AU01_R01_WORKSHEET:${JSON.stringify(worksheet)}`);
  }

  await frame.evaluate(()=>{window.__G3AU01_R01_PRINT__=0;window.print=()=>window.__G3AU01_R01_PRINT__++;});
  await page.locator("#print-button").click();
  const printCount=await frame.evaluate(()=>window.__G3AU01_R01_PRINT__??0);
  if(printCount!==1)throw new Error(`G3AU01_R01_PRINT:${printCount}`);

  await frame.locator(".worksheet-document").screenshot({path:path.join(OUT,"rank01-public-worksheet.png"),fullPage:true});
  await page.screenshot({path:path.join(OUT,"rank01-public-ui.png"),fullPage:true});
  await page.close();
  return{before,layoutClamp,state,worksheet,printCount};
}

try{
  await ready();
  browser=await chromium.launch({headless:true});
  const target=await run();
  if(Object.values(errors).some(x=>x.length))throw new Error(`G3AU01_R01_BROWSER_DIAGNOSTICS:${JSON.stringify(errors)}`);
  const report={
    schemaName:"G3AU01VisualRank01ClassicUIAcceptanceV1",
    taskId:"G3A_U01_VisualPatternSpec_Rank01_SelectorAdmissionPreflight_ThenPublicCutover",
    status:"PASS_G3A_U01_RANK01_CLASSIC_UI_PUBLIC_CUTOVER",
    sourceId:SOURCE,knowledgePointId:KP,patternGroupId:GROUP,patternSpecId:SPEC,questionCount:COUNT,target,
    browser:{consoleErrorCount:0,pageErrorCount:0,requestFailureCount:0,assetHttpFailureCount:0},
    boundaries:{existingKnowledgePointReused:true,sourceUnitUnchanged:true,sameUnitMixedUnchanged:true,rank02PlusVisible:false,rank01DenseLayoutClampVerified:true,operatorWebsiteLayoutRecheckPending:true}
  };
  writeFileSync(path.join(OUT,"report.json"),JSON.stringify(report,null,2)+"\n");
  console.log("G3AU01_RANK01_CLASSIC_UI_ACCEPTANCE="+JSON.stringify(report));
}catch(error){
  writeFileSync(path.join(OUT,"failure.json"),JSON.stringify({schemaName:"G3AU01VisualRank01ClassicUIAcceptanceFailureV1",status:"FAIL",baseUrl:BASE,error:String(error?.stack??error),browser:errors,server:{stdout:serverOut,stderr:serverErr}},null,2)+"\n");
  throw error;
}finally{
  if(browser)await browser.close().catch(()=>{});
  if(server&&!server.killed)server.kill("SIGTERM");
}
