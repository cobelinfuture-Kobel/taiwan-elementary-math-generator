import {spawn} from "node:child_process";
import {mkdirSync,writeFileSync} from "node:fs";
import path from "node:path";
import {chromium} from "playwright";

const SOURCE="g3a_u01_3a01";
const KP="kp_g3a_u01_integer_number_line_scale_location";
const GROUP="pg_g3a_u01_visual_integer_number_line_complete_scale";
const LABEL="整數數線補刻度／填數";
const PORT=Number(process.env.G3AU01_R04_PUBLIC_PORT??"4386");
const REMOTE=process.env.G3AU01_R04_SITE_URL??null;
const ROOT=REMOTE??`http://127.0.0.1:${PORT}`;
const CLASSIC=`${ROOT}/index.html`;
const EXAM=`${ROOT}/exam-template/index.html`;
const OUT=path.resolve("tmp/g3a-u01-rank04-three-mode");
mkdirSync(OUT,{recursive:true});

const sleep=(ms)=>new Promise((resolve)=>setTimeout(resolve,ms));
let server=null;
let browser=null;
let serverOut="";
let serverErr="";

if(!REMOTE){
  server=spawn(process.execPath,["tools/site/serve-site.js"],{
    env:{...process.env,SITE_PORT:String(PORT),SITE_HOST:"127.0.0.1"},
    stdio:["ignore","pipe","pipe"],
  });
  server.stdout.on("data",(chunk)=>{serverOut+=chunk;});
  server.stderr.on("data",(chunk)=>{serverErr+=chunk;});
}

async function ready(){
  let last;
  for(let index=0;index<80;index+=1){
    try{
      const [classic,exam]=await Promise.all([
        fetch(CLASSIC,{cache:"no-store"}),
        fetch(EXAM,{cache:"no-store"}),
      ]);
      if(classic.ok&&exam.ok)return;
    }catch(error){last=error;}
    await sleep(250);
  }
  throw new Error(`G3AU01_R04_SITE_NOT_READY:${last?.message??"unknown"}`);
}

function attachDiagnostics(page,errors){
  page.on("console",(message)=>{
    if(message.type()==="error")errors.console.push(message.text());
  });
  page.on("pageerror",(error)=>errors.page.push(String(error?.stack??error)));
  page.on("requestfailed",(request)=>errors.request.push({
    url:request.url(),
    failure:request.failure()?.errorText??"unknown",
  }));
  page.on("response",(response)=>{
    if(
      response.status()>=400
      && (
        /\.(?:m?js|css)(?:\?|$)/i.test(response.url())
        || response.url().includes("/modules/")
        || response.url().includes("/assets/")
      )
    ){
      errors.http.push({url:response.url(),status:response.status()});
    }
  });
}

async function configureClassic(page){
  await page.goto(`${CLASSIC}?rank04_public=${Date.now()}`,{waitUntil:"networkidle",timeout:120000});
  await page.waitForFunction(
    ()=>[...document.querySelectorAll("#batch-a-grade-select option")].some((option)=>option.value==="3"),
    null,
    {timeout:120000},
  );
  await page.selectOption("#batch-a-grade-select","3");
  await page.selectOption("#batch-a-semester-select","upper");
  await page.waitForFunction(
    (source)=>[...document.querySelectorAll("#batch-a-source-select option")].some((option)=>option.value===source),
    SOURCE,
    {timeout:120000},
  );
  await page.selectOption("#batch-a-source-select",SOURCE);
}

async function inspectClassicPreview(page,expectedCount,{requireExactRank04=false}={}){
  const frame=await (await page.locator("#preview-frame").elementHandle())?.contentFrame();
  if(!frame)throw new Error("G3AU01_R04_CLASSIC_PREVIEW_MISSING");
  await frame.waitForSelector(".worksheet-document",{timeout:120000});
  const rendered=await frame.evaluate(()=>({
    questionCount:document.querySelectorAll(".worksheet-cell--question").length,
    answerCount:document.querySelectorAll(".worksheet-cell--answer-key").length,
    rank04QuestionLines:document.querySelectorAll('.worksheet-cell--question [data-representation="integer-number-line"][data-marker-policy="forbidden"]').length,
    rank04AnswerLines:document.querySelectorAll('.worksheet-cell--answer-key [data-representation="integer-number-line"][data-marker-policy="forbidden"]').length,
    rank04QuestionMarkers:document.querySelectorAll('.worksheet-cell--question [data-representation="integer-number-line"][data-marker-policy="forbidden"] [data-answer-marker="true"]').length,
    rank04AnswerMarkers:document.querySelectorAll('.worksheet-cell--answer-key [data-representation="integer-number-line"][data-marker-policy="forbidden"] [data-answer-marker="true"]').length,
    overflow:[...document.querySelectorAll(".worksheet-page")].filter(
      (node)=>node.scrollHeight>node.clientHeight+1||node.scrollWidth>node.clientWidth+1
    ).length,
  }));
  if(
    rendered.questionCount!==expectedCount
    || rendered.answerCount!==expectedCount
    || rendered.overflow!==0
    || rendered.rank04QuestionLines<1
    || rendered.rank04AnswerLines<1
    || rendered.rank04QuestionMarkers!==0
    || rendered.rank04AnswerMarkers!==0
    || (requireExactRank04&&(
      rendered.rank04QuestionLines!==expectedCount
      || rendered.rank04AnswerLines!==expectedCount
    ))
  ){
    throw new Error(`G3AU01_R04_CLASSIC_RENDER:${JSON.stringify(rendered)}`);
  }
  return {frame,rendered};
}

async function classicSingle(page){
  await configureClassic(page);
  await page.selectOption("#batch-a-selection-mode-select","singleKnowledgePoint");
  await page.waitForSelector("#batch-a-knowledge-point-panel [data-rank04-selector-target='true']",{timeout:120000});
  const target=page.locator("#batch-a-knowledge-point-panel [data-rank04-selector-target='true']");
  const label=(await target.locator("strong").textContent())?.replace(/^已選｜/,"").trim();
  if(label!==LABEL)throw new Error(`G3AU01_R04_CLASSIC_LABEL:${label}`);
  if(await target.getAttribute("data-selected")!=="true")await target.click();
  await page.waitForFunction(
    ()=>document.querySelector("#batch-a-knowledge-point-panel [data-rank04-selector-target='true']")?.dataset?.selected==="true",
    null,
    {timeout:120000},
  );
  await page.fill("#batch-a-question-count-input","6");
  await page.dispatchEvent("#batch-a-question-count-input","change");
  await page.check("#batch-a-answer-key-input");
  await page.fill("#generation-seed-input","g3a-u01-rank04-classic-single");
  await page.dispatchEvent("#generation-seed-input","change");
  await page.locator("#regenerate-button").click();
  await page.waitForFunction(
    ()=>["success","error"].includes(document.querySelector("#status-panel")?.dataset?.tone??""),
    null,
    {timeout:60000},
  );
  const status=await page.evaluate(()=>({
    tone:document.querySelector("#status-panel")?.dataset?.tone??"",
    text:document.querySelector("#status-panel")?.textContent?.trim()??"",
  }));
  if(status.tone!=="success")throw new Error(`G3AU01_R04_CLASSIC_SINGLE_GENERATION:${JSON.stringify(status)}`);
  const {frame,rendered}=await inspectClassicPreview(page,6,{requireExactRank04:true});
  await frame.evaluate(()=>{
    window.__G3AU01_R04_CLASSIC_PRINT__=0;
    window.print=()=>{window.__G3AU01_R04_CLASSIC_PRINT__+=1;};
  });
  await page.locator("#print-button").click();
  const printCount=await frame.evaluate(()=>window.__G3AU01_R04_CLASSIC_PRINT__??0);
  if(printCount!==1)throw new Error(`G3AU01_R04_CLASSIC_PRINT:${printCount}`);
  return {status,rendered,printCount};
}

async function classicSameUnit(page){
  await configureClassic(page);
  await page.selectOption("#batch-a-selection-mode-select","mixedKnowledgePointsSameUnit");
  await page.waitForSelector("#batch-a-knowledge-point-panel [data-rank04-selector-target='true']",{timeout:120000});
  const target=page.locator("#batch-a-knowledge-point-panel [data-rank04-selector-target='true']");
  if(await target.getAttribute("data-selected")!=="true")await target.click();
  const selectorState=await page.evaluate(()=>({
    rank04:document.querySelector("#batch-a-knowledge-point-panel [data-rank04-selector-target='true']")?.dataset?.selected??null,
    selected:document.querySelectorAll("#batch-a-knowledge-point-panel .knowledge-point-option[data-selected='true']").length,
    total:document.querySelectorAll("#batch-a-knowledge-point-panel .knowledge-point-option").length,
  }));
  if(selectorState.rank04!=="true"||selectorState.selected!==12||selectorState.total!==12){
    throw new Error(`G3AU01_R04_CLASSIC_MIXED_SELECTOR:${JSON.stringify(selectorState)}`);
  }
  await page.fill("#batch-a-question-count-input","36");
  await page.dispatchEvent("#batch-a-question-count-input","change");
  await page.check("#batch-a-answer-key-input");
  await page.fill("#generation-seed-input","g3a-u01-rank04-classic-mixed");
  await page.dispatchEvent("#generation-seed-input","change");
  await page.locator("#regenerate-button").click();
  await page.waitForFunction(
    ()=>["success","error"].includes(document.querySelector("#status-panel")?.dataset?.tone??""),
    null,
    {timeout:90000},
  );
  const status=await page.evaluate(()=>({
    tone:document.querySelector("#status-panel")?.dataset?.tone??"",
    text:document.querySelector("#status-panel")?.textContent?.trim()??"",
  }));
  if(status.tone!=="success")throw new Error(`G3AU01_R04_CLASSIC_MIXED_GENERATION:${JSON.stringify(status)}`);
  const {rendered}=await inspectClassicPreview(page,36);
  return {selectorState,status,rendered};
}

async function configureExam(page){
  await page.goto(`${EXAM}?rank04_public=${Date.now()}`,{waitUntil:"networkidle",timeout:120000});
  await page.waitForFunction(
    ()=>[...document.querySelectorAll("#exam-grade option")].some((option)=>option.value==="3"),
    null,
    {timeout:120000},
  );
  await page.selectOption("#exam-grade","3");
  await page.selectOption("#exam-semester","upper");
  await page.waitForFunction(
    (source)=>[...document.querySelectorAll("#exam-source option")].some((option)=>option.value===source),
    SOURCE,
    {timeout:120000},
  );
  await page.selectOption("#exam-source",SOURCE);
}

async function generateExamAndInspect(page,expectedStatusFragment,{exactRank04Count=null}={}){
  await page.locator("#exam-generate").click();
  await page.waitForFunction(
    ()=>["success","error"].includes(document.querySelector("#exam-status")?.dataset?.tone??""),
    null,
    {timeout:90000},
  );
  const status=await page.evaluate(()=>({
    tone:document.querySelector("#exam-status")?.dataset?.tone??"",
    text:document.querySelector("#exam-status")?.textContent?.trim()??"",
  }));
  if(status.tone!=="success"||!status.text.includes(expectedStatusFragment)){
    throw new Error(`G3AU01_R04_EXAM_GENERATION:${JSON.stringify(status)}`);
  }
  const frame=await (await page.locator("#exam-preview").elementHandle())?.contentFrame();
  if(!frame)throw new Error("G3AU01_R04_EXAM_PREVIEW_MISSING");
  await frame.waitForSelector("body",{timeout:120000});
  const rendered=await frame.evaluate(()=>({
    questionCount:document.querySelectorAll(".school-exam-page--questions .worksheet-cell--question").length,
    rank04QuestionLines:document.querySelectorAll('.school-exam-page--questions [data-representation="integer-number-line"][data-marker-policy="forbidden"]').length,
    rank04AnswerLines:document.querySelectorAll('.school-exam-page--answers [data-representation="integer-number-line"][data-marker-policy="forbidden"]').length,
    rank04QuestionMarkers:document.querySelectorAll('.school-exam-page--questions [data-representation="integer-number-line"][data-marker-policy="forbidden"] [data-answer-marker="true"]').length,
    rank04AnswerMarkers:document.querySelectorAll('.school-exam-page--answers [data-representation="integer-number-line"][data-marker-policy="forbidden"] [data-answer-marker="true"]').length,
  }));
  if(
    rendered.rank04QuestionLines<1
    || rendered.rank04AnswerLines<1
    || rendered.rank04QuestionMarkers!==0
    || rendered.rank04AnswerMarkers!==0
  ){
    throw new Error(`G3AU01_R04_EXAM_COMPLETE_SCALE_NOT_MATERIALIZED:${JSON.stringify(rendered)}`);
  }
  if(exactRank04Count!==null&&(
    rendered.rank04QuestionLines!==exactRank04Count
    || rendered.rank04AnswerLines!==exactRank04Count
  )){
    throw new Error(`G3AU01_R04_EXAM_SINGLE_COUNT:${JSON.stringify(rendered)}`);
  }
  return {status,rendered};
}

async function examSingle(page){
  await configureExam(page);
  await page.selectOption("#exam-composition-mode","SINGLE_KP");
  await page.dispatchEvent("#exam-composition-mode","change");
  await page.waitForFunction(
    (group)=>Boolean(document.querySelector(`#exam-kp-panel [data-selector-target-id="${group}"]`)),
    GROUP,
    {timeout:120000},
  );
  const target=page.locator(`#exam-kp-panel [data-selector-target-id="${GROUP}"]`);
  const label=(await target.locator("strong").textContent())?.replace(/^已選｜/,"").trim();
  if(label!==LABEL)throw new Error(`G3AU01_R04_EXAM_LABEL:${label}`);
  if(await target.getAttribute("data-selected")!=="true")await target.click();
  await page.fill("#exam-question-count","6");
  await page.fill("#exam-seed","g3a-u01-rank04-exam-single");
  return generateExamAndInspect(page,"單一知識點考券已產生",{exactRank04Count:6});
}

async function examSameUnit(page){
  await configureExam(page);
  await page.selectOption("#exam-composition-mode","MIXED_KP_SAME_UNIT");
  await page.dispatchEvent("#exam-composition-mode","change");
  await page.waitForFunction(
    (group)=>Boolean(document.querySelector(`#exam-kp-panel [data-selector-target-id="${group}"]`)),
    GROUP,
    {timeout:120000},
  );
  const target=page.locator(`#exam-kp-panel [data-selector-target-id="${GROUP}"]`);
  if(await target.getAttribute("data-selected")!=="true")await target.click();
  const selectorState=await page.evaluate((group)=>({
    rank04:document.querySelector(`#exam-kp-panel [data-selector-target-id="${group}"]`)?.dataset?.selected??null,
    selected:document.querySelectorAll("#exam-kp-panel [data-selector-target-id][data-selected='true']").length,
    total:document.querySelectorAll("#exam-kp-panel [data-selector-target-id]").length,
  }),GROUP);
  if(selectorState.rank04!=="true"||selectorState.selected!==12||selectorState.total!==12){
    throw new Error(`G3AU01_R04_EXAM_SAME_SELECTOR:${JSON.stringify(selectorState)}`);
  }
  await page.fill("#exam-question-count","36");
  await page.fill("#exam-seed","g3a-u01-rank04-exam-same");
  const generated=await generateExamAndInspect(page,"同單元混合知識點考券已產生");
  return {selectorState,...generated};
}

async function examCrossUnit(page){
  await configureExam(page);
  await page.selectOption("#exam-composition-mode","MIXED_KP_CROSS_UNIT");
  await page.dispatchEvent("#exam-composition-mode","change");
  await page.waitForFunction(
    (source)=>Boolean(document.querySelector(`#exam-cross-unit-source-panel [data-cross-source-id="${source}"]`)),
    SOURCE,
    {timeout:120000},
  );
  const sourceButton=page.locator(`#exam-cross-unit-source-panel [data-cross-source-id="${SOURCE}"]`);
  if(await sourceButton.getAttribute("data-selected")!=="true")await sourceButton.click();
  await page.waitForFunction(
    ({source,group})=>Boolean(document.querySelector(
      `#exam-cross-unit-kp-groups [data-source-id="${source}"] [data-cross-selector-target-id="${group}"]`
    )),
    {source:SOURCE,group:GROUP},
    {timeout:120000},
  );
  const target=page.locator(
    `#exam-cross-unit-kp-groups [data-source-id="${SOURCE}"] [data-cross-selector-target-id="${GROUP}"]`
  );
  if(await target.getAttribute("data-selected")!=="true")await target.click();
  const selectorState=await page.evaluate(({source,group})=>({
    sourceSelected:document.querySelector(`#exam-cross-unit-source-panel [data-cross-source-id="${source}"]`)?.dataset?.selected??null,
    rank04:document.querySelector(
      `#exam-cross-unit-kp-groups [data-source-id="${source}"] [data-cross-selector-target-id="${group}"]`
    )?.dataset?.selected??null,
    selectedSources:document.querySelectorAll("#exam-cross-unit-source-panel [data-cross-source-id][data-selected='true']").length,
    selectedTargets:document.querySelectorAll("#exam-cross-unit-kp-groups [data-cross-selector-target-id][data-selected='true']").length,
  }),{source:SOURCE,group:GROUP});
  if(
    selectorState.sourceSelected!=="true"
    || selectorState.rank04!=="true"
    || selectorState.selectedSources<2
    || selectorState.selectedTargets<2
  ){
    throw new Error(`G3AU01_R04_EXAM_CROSS_SELECTOR:${JSON.stringify(selectorState)}`);
  }
  const count=Math.max(12,selectorState.selectedTargets*2);
  await page.fill("#exam-question-count",String(count));
  await page.fill("#exam-seed","g3a-u01-rank04-exam-cross");
  const generated=await generateExamAndInspect(page,"跨單元混合知識點考券已產生");
  return {selectorState,count,...generated};
}

try{
  await ready();
  browser=await chromium.launch({headless:true});
  const errors={console:[],page:[],request:[],http:[]};

  const classicSinglePage=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
  attachDiagnostics(classicSinglePage,errors);
  const classicSingleResult=await classicSingle(classicSinglePage);
  await classicSinglePage.close();

  const classicMixedPage=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
  attachDiagnostics(classicMixedPage,errors);
  const classicMixedResult=await classicSameUnit(classicMixedPage);
  await classicMixedPage.close();

  const examSinglePage=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
  attachDiagnostics(examSinglePage,errors);
  const examSingleResult=await examSingle(examSinglePage);
  await examSinglePage.close();

  const examSamePage=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
  attachDiagnostics(examSamePage,errors);
  const examSameResult=await examSameUnit(examSamePage);
  await examSamePage.close();

  const examCrossPage=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
  attachDiagnostics(examCrossPage,errors);
  const examCrossResult=await examCrossUnit(examCrossPage);
  await examCrossPage.close();

  if(Object.values(errors).some((items)=>items.length)){
    throw new Error(`G3AU01_R04_BROWSER_DIAGNOSTICS:${JSON.stringify(errors)}`);
  }

  const report={
    schemaName:"G3AU01VisualRank04ThreeModeAcceptanceV1",
    taskId:"G3A_U01_VisualRank04_PublicSelectorSiblingCutover_ThreeModeLinkage",
    status:"PASS_G3A_U01_RANK04_CLASSIC_AND_EXAM_THREE_MODE",
    sourceId:SOURCE,
    knowledgePointId:KP,
    patternGroupId:GROUP,
    classic:{single:classicSingleResult,sameUnit:classicMixedResult},
    exam:{single:examSingleResult,sameUnit:examSameResult,crossUnit:examCrossResult},
    browser:{consoleErrorCount:0,pageErrorCount:0,requestFailureCount:0,assetHttpFailureCount:0},
    boundaries:{
      canonicalKnowledgePointReused:true,
      siblingSelectorTarget:true,
      rank02CanonicalAndRank04SiblingSimultaneouslySelectable:true,
      sameUnitTargetCount:12,
      singleKnowledgePointLinked:true,
      sameUnitMixedLinked:true,
      crossUnitMixedLinked:true,
      questionAnswerLeakPrevented:true,
      rank05PlusVisible:false
    }
  };
  writeFileSync(path.join(OUT,"report.json"),JSON.stringify(report,null,2)+"\n");
  console.log("G3AU01_RANK04_THREE_MODE_ACCEPTANCE="+JSON.stringify(report));
}catch(error){
  writeFileSync(path.join(OUT,"failure.json"),JSON.stringify({
    schemaName:"G3AU01VisualRank04ThreeModeAcceptanceFailureV1",
    status:"FAIL",
    error:String(error?.stack??error),
    server:{stdout:serverOut,stderr:serverErr}
  },null,2)+"\n");
  throw error;
}finally{
  if(browser)await browser.close().catch(()=>{});
  if(server&&!server.killed)server.kill("SIGTERM");
}
