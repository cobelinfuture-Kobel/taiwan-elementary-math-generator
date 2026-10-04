import {spawn} from "node:child_process";
import {mkdirSync,writeFileSync} from "node:fs";
import path from "node:path";
import {chromium} from "playwright";

const SOURCE="g3a_u01_3a01";
const KP="kp_g3a_u01_4digit_compare";
const GROUP="pg_g3a_u01_visual_one_way_table_compare";
const PORT=Number(process.env.G3AU01_R01_MIXED_PORT??"4384");
const REMOTE=process.env.G3AU01_R01_SITE_URL??null;
const ROOT=REMOTE??`http://127.0.0.1:${PORT}`;
const CLASSIC=`${ROOT}/index.html`;
const EXAM=`${ROOT}/exam-template/index.html`;
const OUT=path.resolve("tmp/g3a-u01-rank01-mixed-selector");
mkdirSync(OUT,{recursive:true});

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let server=null,browser=null,serverOut="",serverErr="";
if(!REMOTE){
  server=spawn(process.execPath,["tools/site/serve-site.js"],{
    env:{...process.env,SITE_PORT:String(PORT),SITE_HOST:"127.0.0.1"},
    stdio:["ignore","pipe","pipe"],
  });
  server.stdout.on("data",c=>serverOut+=c);
  server.stderr.on("data",c=>serverErr+=c);
}
async function ready(){
  let last;
  for(let i=0;i<60;i++){
    try{
      const [a,b]=await Promise.all([fetch(CLASSIC,{cache:"no-store"}),fetch(EXAM,{cache:"no-store"})]);
      if(a.ok&&b.ok)return;
    }catch(e){last=e;}
    await sleep(250);
  }
  throw new Error(`G3AU01_R01_MIXED_SITE_NOT_READY:${last?.message??"unknown"}`);
}

function attachDiagnostics(page,errors){
  page.on("console",m=>{if(m.type()==="error")errors.console.push(m.text());});
  page.on("pageerror",e=>errors.page.push(String(e?.stack??e)));
  page.on("requestfailed",r=>errors.request.push({url:r.url(),failure:r.failure()?.errorText??"unknown"}));
  page.on("response",r=>{
    if(r.status()>=400&&(/\.(?:m?js|css)(?:\?|$)/i.test(r.url())||r.url().includes("/modules/")||r.url().includes("/assets/"))){
      errors.http.push({url:r.url(),status:r.status()});
    }
  });
}

async function configureClassic(page){
  await page.goto(`${CLASSIC}?rank01_mixed=${Date.now()}`,{waitUntil:"networkidle",timeout:120000});
  await page.waitForFunction(()=>[...document.querySelectorAll("#batch-a-grade-select option")].some(o=>o.value==="3"),null,{timeout:120000});
  await page.selectOption("#batch-a-grade-select","3");
  await page.selectOption("#batch-a-semester-select","upper");
  await page.waitForFunction(id=>[...document.querySelectorAll("#batch-a-source-select option")].some(o=>o.value===id),SOURCE,{timeout:120000});
  await page.selectOption("#batch-a-source-select",SOURCE);
}

async function classicSameUnit(page){
  await configureClassic(page);
  await page.selectOption("#batch-a-selection-mode-select","mixedKnowledgePointsSameUnit");
  await page.waitForFunction(()=>Boolean(document.querySelector("#batch-a-knowledge-point-panel [data-rank01-selector-target='true']")),null,{timeout:120000});
  const target=page.locator("#batch-a-knowledge-point-panel [data-rank01-selector-target='true']");
  if(await target.isDisabled())throw new Error("G3AU01_R01_CLASSIC_MIXED_TARGET_DISABLED");
  if(await target.getAttribute("data-selected")!=="true")await target.click();
  await page.waitForFunction(()=>document.querySelector("#batch-a-knowledge-point-panel [data-rank01-selector-target='true']")?.dataset?.selected==="true",null,{timeout:120000});

  const selectorState=await page.evaluate(kp=>({
    mode:document.querySelector("#batch-a-selection-mode-select")?.value,
    canonicalSelected:document.querySelector(`#batch-a-knowledge-point-panel [data-knowledge-point-id="${kp}"]`)?.dataset?.selected??null,
    rankSelected:document.querySelector("#batch-a-knowledge-point-panel [data-rank01-selector-target='true']")?.dataset?.selected??null,
    rankDisabled:Boolean(document.querySelector("#batch-a-knowledge-point-panel [data-rank01-selector-target='true']")?.disabled),
  }),KP);
  if(selectorState.mode!=="mixedKnowledgePointsSameUnit"||selectorState.canonicalSelected!=="false"||selectorState.rankSelected!=="true"||selectorState.rankDisabled){
    throw new Error(`G3AU01_R01_CLASSIC_MIXED_SELECTOR:${JSON.stringify(selectorState)}`);
  }

  await page.fill("#batch-a-question-count-input","24");
  await page.dispatchEvent("#batch-a-question-count-input","change");
  await page.check("#batch-a-answer-key-input");
  await page.fill("#generation-seed-input","g3a-u01-rank01-classic-mixed");
  await page.dispatchEvent("#generation-seed-input","change");
  await page.locator("#regenerate-button").click();
  await page.waitForFunction(()=>{
    const s=document.querySelector("#status-panel");
    return s?.dataset?.tone==="success"||s?.dataset?.tone==="error";
  },null,{timeout:30000});
  const status=await page.evaluate(()=>({
    tone:document.querySelector("#status-panel")?.dataset?.tone??"",
    text:document.querySelector("#status-panel")?.textContent?.trim()??"",
  }));
  if(status.tone!=="success")throw new Error(`G3AU01_R01_CLASSIC_MIXED_GENERATION:${JSON.stringify(status)}`);

  const frame=await (await page.locator("#preview-frame").elementHandle())?.contentFrame();
  if(!frame)throw new Error("G3AU01_R01_CLASSIC_MIXED_PREVIEW_MISSING");
  await frame.waitForSelector(".worksheet-document",{timeout:120000});
  const rendered=await frame.evaluate(()=>({
    questionTables:document.querySelectorAll(".worksheet-cell--question .worksheet-one-way-statistics-table").length,
    answerTables:document.querySelectorAll(".worksheet-cell--answer-key .worksheet-one-way-statistics-table").length,
    questionCount:document.querySelectorAll(".worksheet-cell--question").length,
  }));
  if(rendered.questionTables<1||rendered.answerTables<1||rendered.questionCount!==24){
    throw new Error(`G3AU01_R01_CLASSIC_MIXED_RENDER:${JSON.stringify(rendered)}`);
  }
  await page.screenshot({path:path.join(OUT,"classic-same-unit.png"),fullPage:true});
  return{selectorState,status,rendered};
}

async function configureExam(page){
  await page.goto(`${EXAM}?rank01_mixed=${Date.now()}`,{waitUntil:"networkidle",timeout:120000});
  await page.waitForFunction(()=>[...document.querySelectorAll("#exam-grade option")].some(o=>o.value==="3"),null,{timeout:120000});
  await page.selectOption("#exam-grade","3");
  await page.selectOption("#exam-semester","upper");
  await page.waitForFunction(id=>[...document.querySelectorAll("#exam-source option")].some(o=>o.value===id),SOURCE,{timeout:120000});
  await page.selectOption("#exam-source",SOURCE);
}

async function generateExamAndInspect(page,expectedStatusFragment){
  await page.locator("#exam-generate").click();
  await page.waitForFunction(()=>{
    const s=document.querySelector("#exam-status");
    return s?.dataset?.tone==="success"||s?.dataset?.tone==="error";
  },null,{timeout:45000});
  const status=await page.evaluate(()=>({
    tone:document.querySelector("#exam-status")?.dataset?.tone??"",
    text:document.querySelector("#exam-status")?.textContent?.trim()??"",
  }));
  if(status.tone!=="success"||!status.text.includes(expectedStatusFragment)){
    throw new Error(`G3AU01_R01_EXAM_GENERATION:${JSON.stringify(status)}`);
  }
  const frame=await (await page.locator("#exam-preview").elementHandle())?.contentFrame();
  if(!frame)throw new Error("G3AU01_R01_EXAM_PREVIEW_MISSING");
  await frame.waitForSelector("body",{timeout:120000});
  const rendered=await frame.evaluate(()=>({
    questionTables:document.querySelectorAll('.school-exam-page--questions [data-representation="one-way-statistics-table"]').length,
    answerTables:document.querySelectorAll('.school-exam-page--answers [data-representation="one-way-statistics-table"]').length,
    questionCount:document.querySelectorAll(".school-exam-page--questions .worksheet-cell--question").length,
  }));
  if(rendered.questionTables<1||rendered.answerTables<1){
    throw new Error(`G3AU01_R01_EXAM_RANK01_NOT_MATERIALIZED:${JSON.stringify(rendered)}`);
  }
  return{status,rendered};
}

async function examSingle(page){
  await configureExam(page);
  await page.selectOption("#exam-composition-mode","SINGLE_KP");
  await page.waitForFunction(group=>Boolean(document.querySelector(`#exam-kp-panel [data-selector-target-id="${group}"]`)),GROUP,{timeout:120000});
  await page.locator(`#exam-kp-panel [data-selector-target-id="${GROUP}"]`).click();
  await page.waitForFunction(group=>document.querySelector(`#exam-kp-panel [data-selector-target-id="${group}"]`)?.dataset?.selected==="true",GROUP,{timeout:120000});
  await page.fill("#exam-question-count","6");
  await page.fill("#exam-seed","g3a-u01-rank01-exam-single");
  const result=await generateExamAndInspect(page,"單一知識點考券已產生");
  if(result.rendered.questionTables!==6||result.rendered.answerTables!==6){
    throw new Error(`G3AU01_R01_EXAM_SINGLE_COUNT:${JSON.stringify(result.rendered)}`);
  }
  await page.screenshot({path:path.join(OUT,"exam-single.png"),fullPage:true});
  return result;
}

async function examSameUnit(page){
  await configureExam(page);
  await page.selectOption("#exam-composition-mode","MIXED_KP_SAME_UNIT");
  await page.waitForFunction(group=>Boolean(document.querySelector(`#exam-kp-panel [data-selector-target-id="${group}"]`)),GROUP,{timeout:120000});
  const target=page.locator(`#exam-kp-panel [data-selector-target-id="${GROUP}"]`);
  if(await target.getAttribute("data-selected")!=="true")await target.click();
  await page.waitForFunction(group=>document.querySelector(`#exam-kp-panel [data-selector-target-id="${group}"]`)?.dataset?.selected==="true",GROUP,{timeout:120000});
  const selectorState=await page.evaluate(({kp,group})=>({
    canonical:document.querySelector(`#exam-kp-panel [data-selector-target-id="${kp}"]`)?.dataset?.selected??null,
    rank:document.querySelector(`#exam-kp-panel [data-selector-target-id="${group}"]`)?.dataset?.selected??null,
  }),{kp:KP,group:GROUP});
  if(selectorState.canonical!=="false"||selectorState.rank!=="true"){
    throw new Error(`G3AU01_R01_EXAM_SAME_SELECTOR:${JSON.stringify(selectorState)}`);
  }
  await page.fill("#exam-question-count","24");
  await page.fill("#exam-seed","g3a-u01-rank01-exam-same");
  const result=await generateExamAndInspect(page,"同單元混合知識點考券已產生");
  await page.screenshot({path:path.join(OUT,"exam-same-unit.png"),fullPage:true});
  return{selectorState,...result};
}

async function examCrossUnit(page){
  await configureExam(page);
  await page.selectOption("#exam-composition-mode","MIXED_KP_CROSS_UNIT");
  await page.waitForFunction(id=>Boolean(document.querySelector(`#exam-cross-unit-source-panel [data-cross-source-id="${id}"]`)),SOURCE,{timeout:120000});

  const sourceButton=page.locator(`#exam-cross-unit-source-panel [data-cross-source-id="${SOURCE}"]`);
  if(await sourceButton.getAttribute("data-selected")!=="true"){
    await sourceButton.click();
  }
  await page.waitForFunction(({source,group})=>Boolean(document.querySelector(`#exam-cross-unit-kp-groups [data-source-id="${source}"] [data-cross-selector-target-id="${group}"]`)),{source:SOURCE,group:GROUP},{timeout:120000});

  const rankTarget=page.locator(`#exam-cross-unit-kp-groups [data-source-id="${SOURCE}"] [data-cross-selector-target-id="${GROUP}"]`);
  if(await rankTarget.getAttribute("data-selected")!=="true")await rankTarget.click();
  await page.waitForFunction(({source,group})=>document.querySelector(`#exam-cross-unit-kp-groups [data-source-id="${source}"] [data-cross-selector-target-id="${group}"]`)?.dataset?.selected==="true",{source:SOURCE,group:GROUP},{timeout:120000});

  const selectorState=await page.evaluate(({source,kp,group})=>({
    sourceSelected:document.querySelector(`#exam-cross-unit-source-panel [data-cross-source-id="${source}"]`)?.dataset?.selected??null,
    canonical:document.querySelector(`#exam-cross-unit-kp-groups [data-source-id="${source}"] [data-cross-selector-target-id="${kp}"]`)?.dataset?.selected??null,
    rank:document.querySelector(`#exam-cross-unit-kp-groups [data-source-id="${source}"] [data-cross-selector-target-id="${group}"]`)?.dataset?.selected??null,
    selectedSources:[...document.querySelectorAll("#exam-cross-unit-source-panel [data-cross-source-id][data-selected='true']")].length,
    selectedTargets:[...document.querySelectorAll("#exam-cross-unit-kp-groups [data-cross-selector-target-id][data-selected='true']")].length,
  }),{source:SOURCE,kp:KP,group:GROUP});
  if(selectorState.sourceSelected!=="true"||selectorState.canonical!=="false"||selectorState.rank!=="true"||selectorState.selectedSources<2||selectorState.selectedTargets<2){
    throw new Error(`G3AU01_R01_EXAM_CROSS_SELECTOR:${JSON.stringify(selectorState)}`);
  }

  const count=Math.max(12,selectorState.selectedTargets*2);
  await page.fill("#exam-question-count",String(count));
  await page.fill("#exam-seed","g3a-u01-rank01-exam-cross");
  const result=await generateExamAndInspect(page,"跨單元混合知識點考券已產生");
  await page.screenshot({path:path.join(OUT,"exam-cross-unit.png"),fullPage:true});
  return{selectorState,count,...result};
}

try{
  await ready();
  browser=await chromium.launch({headless:true});
  const errors={console:[],page:[],request:[],http:[]};

  const classicPage=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
  attachDiagnostics(classicPage,errors);
  const classic=await classicSameUnit(classicPage);
  await classicPage.close();

  const singlePage=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
  attachDiagnostics(singlePage,errors);
  const single=await examSingle(singlePage);
  await singlePage.close();

  const samePage=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
  attachDiagnostics(samePage,errors);
  const sameUnit=await examSameUnit(samePage);
  await samePage.close();

  const crossPage=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
  attachDiagnostics(crossPage,errors);
  const crossUnit=await examCrossUnit(crossPage);
  await crossPage.close();

  if(Object.values(errors).some((items)=>items.length)){
    throw new Error(`G3AU01_R01_MIXED_BROWSER_DIAGNOSTICS:${JSON.stringify(errors)}`);
  }

  const report={
    schemaName:"G3AU01VisualRank01MixedSelectorAcceptanceV1",
    taskId:"G3A_U01_Rank01_SameUnitAndCrossUnitMixedFullLinkage_Then_ThreeModeE2E_PRGate",
    status:"PASS_G3A_U01_RANK01_SINGLE_SAME_CROSS_LINKAGE",
    sourceId:SOURCE,
    knowledgePointId:KP,
    patternGroupId:GROUP,
    classic,
    exam:{single,sameUnit,crossUnit},
    browser:{consoleErrorCount:0,pageErrorCount:0,requestFailureCount:0,assetHttpFailureCount:0},
    boundaries:{
      canonicalKnowledgePointReused:true,
      rank01SiblingSameLevel:true,
      singleKnowledgePointLinked:true,
      sameUnitMixedLinked:true,
      crossUnitMixedLinked:true,
      generatorChanged:false,
      validatorChanged:false,
      rendererChanged:false,
    },
  };
  writeFileSync(path.join(OUT,"report.json"),JSON.stringify(report,null,2)+"\n");
  console.log("G3AU01_RANK01_MIXED_SELECTOR_ACCEPTANCE="+JSON.stringify(report));
}catch(error){
  writeFileSync(path.join(OUT,"failure.json"),JSON.stringify({
    schemaName:"G3AU01VisualRank01MixedSelectorAcceptanceFailureV1",
    status:"FAIL",
    error:String(error?.stack??error),
    server:{stdout:serverOut,stderr:serverErr},
  },null,2)+"\n");
  throw error;
}finally{
  if(browser)await browser.close().catch(()=>{});
  if(server&&!server.killed)server.kill("SIGTERM");
}
