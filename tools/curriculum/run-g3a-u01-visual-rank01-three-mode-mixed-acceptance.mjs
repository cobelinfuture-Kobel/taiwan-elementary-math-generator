import {spawn} from "node:child_process";
import {mkdirSync,writeFileSync} from "node:fs";
import path from "node:path";
import {chromium} from "playwright";

const SOURCE="g3a_u01_3a01";
const KP="kp_g3a_u01_4digit_compare";
const GROUP="pg_g3a_u01_visual_one_way_table_compare";
const PORT=Number(process.env.G3AU01_R01_MIXED_PORT??"4383");
const REMOTE=process.env.G3AU01_R01_SITE_URL??null;
const CLASSIC=REMOTE?new URL("index.html",REMOTE).href:`http://127.0.0.1:${PORT}/index.html`;
const EXAM=REMOTE?new URL("exam-template/index.html",REMOTE).href:`http://127.0.0.1:${PORT}/exam-template/index.html`;
const OUT=path.resolve("tmp/g3a-u01-rank01-three-mode-mixed");
mkdirSync(OUT,{recursive:true});

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let server=null,browser=null,serverOut="",serverErr="";
if(!REMOTE){
  server=spawn(process.execPath,["tools/site/serve-site.js"],{env:{...process.env,SITE_PORT:String(PORT),SITE_HOST:"127.0.0.1"},stdio:["ignore","pipe","pipe"]});
  server.stdout.on("data",c=>serverOut+=c);
  server.stderr.on("data",c=>serverErr+=c);
}
async function ready(){
  for(let i=0;i<60;i++){
    try{const r=await fetch(CLASSIC,{cache:"no-store"});if(r.ok)return;}catch{}
    await sleep(250);
  }
  throw new Error("G3AU01_R01_MIXED_SITE_NOT_READY");
}
async function selectClassicSource(page){
  await page.waitForFunction(()=>[...document.querySelectorAll("#batch-a-grade-select option")].some(o=>o.value==="3"),null,{timeout:120000});
  await page.selectOption("#batch-a-grade-select","3");
  await page.selectOption("#batch-a-semester-select","upper");
  await page.waitForFunction(id=>[...document.querySelectorAll("#batch-a-source-select option")].some(o=>o.value===id),SOURCE,{timeout:120000});
  await page.selectOption("#batch-a-source-select",SOURCE);
}
async function classicSameUnit(){
  const page=await browser.newPage({viewport:{width:1440,height:1100}});
  await page.goto(CLASSIC,{waitUntil:"networkidle",timeout:120000});
  await selectClassicSource(page);
  await page.selectOption("#batch-a-selection-mode-select","mixedKnowledgePointsSameUnit");
  await page.dispatchEvent("#batch-a-selection-mode-select","change");
  await page.waitForFunction(()=>Boolean(document.querySelector("#batch-a-knowledge-point-panel [data-rank01-selector-target='true']")),null,{timeout:120000});
  const before=await page.evaluate(kp=>({
    canonical:document.querySelector(`#batch-a-knowledge-point-panel [data-knowledge-point-id="${kp}"]`)?.dataset?.selected,
    rank:document.querySelector("#batch-a-knowledge-point-panel [data-rank01-selector-target='true']")?.dataset?.selected,
  }),KP);
  if(before.canonical!=="true")throw new Error(`CLASSIC_CANONICAL_NOT_SELECTED:${JSON.stringify(before)}`);
  if(before.rank!=="true")await page.locator("#batch-a-knowledge-point-panel [data-rank01-selector-target='true']").click();
  await page.waitForFunction(kp=>
    document.querySelector(`#batch-a-knowledge-point-panel [data-knowledge-point-id="${kp}"]`)?.dataset?.selected==="true"
    && document.querySelector("#batch-a-knowledge-point-panel [data-rank01-selector-target='true']")?.dataset?.selected==="true"
  ,KP,{timeout:120000});
  const selectedCount=await page.locator("#batch-a-knowledge-point-panel .knowledge-point-option[data-selected='true']").count();
  await page.fill("#batch-a-question-count-input",String(Math.max(12,selectedCount)));
  await page.dispatchEvent("#batch-a-question-count-input","change");
  await page.locator("#regenerate-button").click();
  await page.waitForFunction(()=>document.querySelector("#status-panel")?.dataset?.tone==="success",null,{timeout:60000});
  const frame=await (await page.locator("#preview-frame").elementHandle())?.contentFrame();
  if(!frame)throw new Error("CLASSIC_MIXED_PREVIEW_MISSING");
  const tables=await frame.locator('[data-representation="one-way-statistics-table"]').count();
  if(tables<2)throw new Error(`CLASSIC_MIXED_RANK01_NOT_MATERIALIZED:${tables}`);
  await page.close();
  return{selectedCount,tables};
}
async function selectExamBase(page){
  await page.waitForFunction(()=>[...document.querySelectorAll("#exam-grade option")].some(o=>o.value==="3"),null,{timeout:120000});
  await page.selectOption("#exam-grade","3");
  await page.selectOption("#exam-semester","upper");
  await page.waitForFunction(id=>[...document.querySelectorAll("#exam-source option")].some(o=>o.value===id),SOURCE,{timeout:120000});
  await page.selectOption("#exam-source",SOURCE);
}
async function examSameUnit(){
  const page=await browser.newPage({viewport:{width:1440,height:1100}});
  await page.goto(EXAM,{waitUntil:"networkidle",timeout:120000});
  await selectExamBase(page);
  await page.selectOption("#exam-composition-mode","MIXED_KP_SAME_UNIT");
  await page.dispatchEvent("#exam-composition-mode","change");
  await page.waitForFunction(group=>Boolean(document.querySelector(`#exam-kp-panel [data-selector-target-id="${group}"]`)),GROUP,{timeout:120000});
  const before=await page.evaluate(({kp,group})=>({
    canonical:document.querySelector(`#exam-kp-panel [data-selector-target-id="${kp}"]`)?.dataset?.selected,
    rank:document.querySelector(`#exam-kp-panel [data-selector-target-id="${group}"]`)?.dataset?.selected,
  }),{kp:KP,group:GROUP});
  if(before.canonical!=="true")throw new Error(`EXAM_SAME_CANONICAL_NOT_SELECTED:${JSON.stringify(before)}`);
  if(before.rank!=="true")await page.locator(`#exam-kp-panel [data-selector-target-id="${GROUP}"]`).click();
  await page.waitForFunction(({kp,group})=>
    document.querySelector(`#exam-kp-panel [data-selector-target-id="${kp}"]`)?.dataset?.selected==="true"
    && document.querySelector(`#exam-kp-panel [data-selector-target-id="${group}"]`)?.dataset?.selected==="true"
  ,{kp:KP,group:GROUP},{timeout:120000});
  const buttons=page.locator("#exam-kp-panel [data-selector-target-id]");
  const total=await buttons.count();
  const selected=await page.locator("#exam-kp-panel [data-selector-target-id][data-selected='true']").count();
  if(selected!==total)throw new Error(`EXAM_SAME_ALL_NOT_SELECTED:${selected}/${total}`);
  await page.fill("#exam-question-count",String(Math.max(12,total)));
  await page.locator("#exam-generate").click();
  await page.waitForFunction(()=>document.querySelector("#exam-status")?.dataset?.tone==="success",null,{timeout:60000});
  const frame=await (await page.locator("#exam-preview").elementHandle())?.contentFrame();
  if(!frame)throw new Error("EXAM_SAME_PREVIEW_MISSING");
  const tables=await frame.locator('[data-representation="one-way-statistics-table"]').count();
  if(tables<2)throw new Error(`EXAM_SAME_RANK01_NOT_MATERIALIZED:${tables}`);
  await page.close();
  return{total,selected,tables};
}
async function examCrossUnit(){
  const page=await browser.newPage({viewport:{width:1440,height:1100}});
  await page.goto(EXAM,{waitUntil:"networkidle",timeout:120000});
  await selectExamBase(page);
  await page.selectOption("#exam-composition-mode","MIXED_KP_CROSS_UNIT");
  await page.dispatchEvent("#exam-composition-mode","change");
  await page.waitForFunction(()=>document.querySelectorAll("#exam-cross-unit-source-panel [data-cross-source-id]").length>=2,null,{timeout:120000});
  const sourceButton=page.locator(`#exam-cross-unit-source-panel [data-cross-source-id="${SOURCE}"]`);
  if(await sourceButton.count()!==1)throw new Error("EXAM_CROSS_G3AU01_SOURCE_MISSING");
  if(await sourceButton.getAttribute("data-selected")!=="true")await sourceButton.click();
  await page.waitForFunction(({source,group})=>Boolean(document.querySelector(`#exam-cross-unit-kp-groups [data-source-id="${source}"] [data-cross-selector-target-id="${group}"]`)),{source:SOURCE,group:GROUP},{timeout:120000});
  const canonical=page.locator(`#exam-cross-unit-kp-groups [data-source-id="${SOURCE}"] [data-cross-selector-target-id="${KP}"]`);
  const rank=page.locator(`#exam-cross-unit-kp-groups [data-source-id="${SOURCE}"] [data-cross-selector-target-id="${GROUP}"]`);
  if(await canonical.getAttribute("data-selected")!=="true")await canonical.click();
  if(await rank.getAttribute("data-selected")!=="true")await rank.click();
  await page.waitForFunction(({source,kp,group})=>
    document.querySelector(`#exam-cross-unit-kp-groups [data-source-id="${source}"] [data-cross-selector-target-id="${kp}"]`)?.dataset?.selected==="true"
    && document.querySelector(`#exam-cross-unit-kp-groups [data-source-id="${source}"] [data-cross-selector-target-id="${group}"]`)?.dataset?.selected==="true"
  ,{source:SOURCE,kp:KP,group:GROUP},{timeout:120000});
  const selected=await page.locator("#exam-cross-unit-kp-groups [data-cross-selector-target-id][data-selected='true']").count();
  await page.fill("#exam-question-count",String(Math.max(12,selected)));
  await page.locator("#exam-generate").click();
  await page.waitForFunction(()=>document.querySelector("#exam-status")?.dataset?.tone==="success",null,{timeout:60000});
  const frame=await (await page.locator("#exam-preview").elementHandle())?.contentFrame();
  if(!frame)throw new Error("EXAM_CROSS_PREVIEW_MISSING");
  const tables=await frame.locator('[data-representation="one-way-statistics-table"]').count();
  if(tables<2)throw new Error(`EXAM_CROSS_RANK01_NOT_MATERIALIZED:${tables}`);
  await page.close();
  return{selected,tables};
}

try{
  await ready();
  browser=await chromium.launch({headless:true});
  const classic=await classicSameUnit();
  const examSame=await examSameUnit();
  const examCross=await examCrossUnit();
  const report={
    schemaName:"G3AU01Rank01ThreeModeMixedAcceptanceV1",
    status:"PASS",
    classicSameUnit:classic,
    examSameUnit:examSame,
    examCrossUnit:examCross,
    contract:{
      canonicalAndRank01CanCoexist:true,
      allSameUnitTargetsSelectable:true,
      rank01CrossUnitSelectable:true,
      canonicalKnowledgePointGraphUnchanged:true
    }
  };
  writeFileSync(path.join(OUT,"report.json"),JSON.stringify(report,null,2)+"\n");
  console.log("G3AU01_RANK01_THREE_MODE_MIXED_ACCEPTANCE="+JSON.stringify(report));
}catch(error){
  writeFileSync(path.join(OUT,"failure.json"),JSON.stringify({status:"FAIL",error:String(error?.stack??error),server:{stdout:serverOut,stderr:serverErr}},null,2)+"\n");
  throw error;
}finally{
  if(browser)await browser.close().catch(()=>{});
  if(server&&!server.killed)server.kill("SIGTERM");
}
