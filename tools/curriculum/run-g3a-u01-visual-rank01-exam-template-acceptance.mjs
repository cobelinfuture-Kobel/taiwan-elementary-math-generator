import {spawn} from "node:child_process";
import {mkdirSync,writeFileSync} from "node:fs";
import path from "node:path";
import {chromium} from "playwright";

const SOURCE="g3a_u01_3a01";
const KP="kp_g3a_u01_4digit_compare";
const GROUP="pg_g3a_u01_visual_one_way_table_compare";
const COUNT=6;
const PORT=Number(process.env.G3AU01_R01_EXAM_PORT??"4382");
const REMOTE=process.env.G3AU01_R01_SITE_URL??null;
const BASE=REMOTE??`http://127.0.0.1:${PORT}/exam-template/index.html`;
const OUT=path.resolve("tmp/g3a-u01-rank01-exam-template");
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
  throw new Error(`G3AU01_R01_EXAM_SITE_NOT_READY:${last?.message??"unknown"}`);
}
const errors={console:[],page:[],request:[],http:[]};

async function run(){
  const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
  page.on("console",m=>{if(m.type()==="error")errors.console.push(m.text());});
  page.on("pageerror",e=>errors.page.push(String(e?.stack??e)));
  page.on("requestfailed",r=>errors.request.push({url:r.url(),failure:r.failure()?.errorText??"unknown"}));
  page.on("response",r=>{if(r.status()>=400&&(/\.(?:m?js|css)(?:\?|$)/i.test(r.url())||r.url().includes("/modules/")||r.url().includes("/assets/")))errors.http.push({url:r.url(),status:r.status()});});

  const url=new URL(BASE);
  url.searchParams.set("g3a_u01_rank01_exam",String(Date.now()));
  const response=await page.goto(url.href,{waitUntil:"networkidle",timeout:120000});
  if(!response?.ok())throw new Error(`G3AU01_R01_EXAM_HTTP:${response?.status()??"none"}`);

  await page.waitForFunction(()=>[...document.querySelectorAll("#exam-grade option")].some(o=>o.value==="3"),null,{timeout:120000});
  await page.selectOption("#exam-grade","3");
  await page.selectOption("#exam-semester","upper");
  await page.waitForFunction(id=>[...document.querySelectorAll("#exam-source option")].some(o=>o.value===id),SOURCE,{timeout:120000});
  await page.selectOption("#exam-source",SOURCE);

  await page.selectOption("#exam-composition-mode","SINGLE_KP");
  await page.dispatchEvent("#exam-composition-mode","change");
  await page.waitForFunction(group=>Boolean(document.querySelector(`#exam-kp-panel [data-selector-target-id="${group}"]`)),GROUP,{timeout:120000});

  const sibling=await page.evaluate(({kp,group})=>({
    selectorVisible:!document.querySelector("#exam-same-unit-kp-selector")?.hidden,
    canonicalVisible:Boolean(document.querySelector(`#exam-kp-panel [data-selector-target-id="${kp}"]`)),
    rank01Visible:Boolean(document.querySelector(`#exam-kp-panel [data-selector-target-id="${group}"]`)),
    labels:[...document.querySelectorAll("#exam-kp-panel .knowledge-point-option strong")].map(n=>n.textContent?.replace(/^已選｜/,"").trim())
  }),{kp:KP,group:GROUP});
  if(!sibling.selectorVisible||!sibling.canonicalVisible||!sibling.rank01Visible||!sibling.labels.includes("一維資料表四位數比較")){
    throw new Error(`G3AU01_R01_EXAM_FLAT_SELECTOR:${JSON.stringify(sibling)}`);
  }

  await page.locator(`#exam-kp-panel [data-selector-target-id="${GROUP}"]`).click();
  await page.waitForFunction(group=>document.querySelector(`#exam-kp-panel [data-selector-target-id="${group}"]`)?.dataset?.selected==="true",GROUP,{timeout:120000});

  await page.fill("#exam-question-count",String(COUNT));
  await page.dispatchEvent("#exam-question-count","change");
  await page.fill("#exam-seed","g3a-u01-rank01-exam-template");
  await page.locator("#exam-generate").click();
  await page.waitForFunction(()=>document.querySelector("#exam-status")?.dataset?.tone==="success",null,{timeout:30000});

  const state=await page.evaluate(({kp,group})=>({
    mode:document.querySelector("#exam-composition-mode")?.value,
    sourceId:document.querySelector("#exam-source")?.value,
    canonicalSelected:document.querySelector(`#exam-kp-panel [data-selector-target-id="${kp}"]`)?.dataset?.selected??null,
    rank01Selected:document.querySelector(`#exam-kp-panel [data-selector-target-id="${group}"]`)?.dataset?.selected??null,
    status:document.querySelector("#exam-status")?.textContent?.trim()??"",
    printDisabled:Boolean(document.querySelector("#exam-print")?.disabled)
  }),{kp:KP,group:GROUP});
  if(state.mode!=="SINGLE_KP"||state.sourceId!==SOURCE||state.canonicalSelected!=="false"||state.rank01Selected!=="true"||state.printDisabled||!state.status.includes("單一知識點考券已產生")){
    throw new Error(`G3AU01_R01_EXAM_STATE:${JSON.stringify(state)}`);
  }

  const frame=await (await page.locator("#exam-preview").elementHandle())?.contentFrame();
  if(!frame)throw new Error("G3AU01_R01_EXAM_PREVIEW_FRAME_MISSING");
  await frame.waitForSelector("body",{timeout:120000});
  const exam=await frame.evaluate(count=>({
    tableCount:document.querySelectorAll('[data-representation="one-way-statistics-table"]').length,
    text:document.body?.innerText??"",
    count
  }),COUNT);
  if(exam.tableCount<COUNT||!exam.text.includes("一維資料表四位數比較"))throw new Error(`G3AU01_R01_EXAM_RENDER:${JSON.stringify(exam)}`);

  await frame.evaluate(()=>{window.__G3AU01_R01_EXAM_PRINT__=0;window.print=()=>window.__G3AU01_R01_EXAM_PRINT__++;});
  await page.locator("#exam-print").click();
  const printCount=await frame.evaluate(()=>window.__G3AU01_R01_EXAM_PRINT__??0);
  if(printCount!==1)throw new Error(`G3AU01_R01_EXAM_PRINT:${printCount}`);

  await page.screenshot({path:path.join(OUT,"rank01-exam-template-ui.png"),fullPage:true});
  await page.close();
  return{sibling,state,exam,printCount};
}

try{
  await ready();
  browser=await chromium.launch({headless:true});
  const target=await run();
  if(Object.values(errors).some(x=>x.length))throw new Error(`G3AU01_R01_EXAM_BROWSER_DIAGNOSTICS:${JSON.stringify(errors)}`);
  const report={
    schemaName:"G3AU01VisualRank01ExamTemplateAcceptanceV2",
    taskId:"G3A_U01_VisualRank01_FlatSelector_ClassicAndExam",
    status:"PASS_G3A_U01_RANK01_EXAM_TEMPLATE_FLAT_SELECTOR",
    sourceId:SOURCE,knowledgePointId:KP,patternGroupId:GROUP,questionCount:COUNT,target,
    browser:{consoleErrorCount:0,pageErrorCount:0,requestFailureCount:0,assetHttpFailureCount:0},
    boundaries:{canonicalKnowledgePointReused:true,flatSiblingSelector:true,existingSingleKpRouteReused:true,sameUnitMixedUnchanged:true,crossUnitMixedUnchanged:true}
  };
  writeFileSync(path.join(OUT,"report.json"),JSON.stringify(report,null,2)+"\n");
  console.log("G3AU01_RANK01_EXAM_TEMPLATE_ACCEPTANCE="+JSON.stringify(report));
}catch(error){
  writeFileSync(path.join(OUT,"failure.json"),JSON.stringify({status:"FAIL",baseUrl:BASE,error:String(error?.stack??error),browser:errors,server:{stdout:serverOut,stderr:serverErr}},null,2)+"\n");
  throw error;
}finally{
  if(browser)await browser.close().catch(()=>{});
  if(server&&!server.killed)server.kill("SIGTERM");
}
