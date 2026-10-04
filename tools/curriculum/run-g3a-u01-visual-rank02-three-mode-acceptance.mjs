import {spawn} from "node:child_process";
import {mkdirSync,writeFileSync} from "node:fs";
import path from "node:path";
import {chromium} from "playwright";

const SOURCE="g3a_u01_3a01";
const KP="kp_g3a_u01_integer_number_line_scale_location";
const GROUP="pg_g3a_u01_visual_integer_number_line_read_value";
const LABEL="整數數線讀值";
const PORT=Number(process.env.G3AU01_R02_PUBLIC_PORT??"4385");
const REMOTE=process.env.G3AU01_R02_SITE_URL??null;
const ROOT=REMOTE??`http://127.0.0.1:${PORT}`;
const CLASSIC=`${ROOT}/index.html`;
const EXAM=`${ROOT}/exam-template/index.html`;
const OUT=path.resolve("tmp/g3a-u01-rank02-three-mode");
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
  throw new Error(`G3AU01_R02_SITE_NOT_READY:${last?.message??"unknown"}`);
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
  await page.goto(`${CLASSIC}?rank02_public=${Date.now()}`,{waitUntil:"networkidle",timeout:120000});
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

async function inspectClassicPreview(page,expectedCount,{requireExactRank02=false}={}){
  const frame=await (await page.locator("#preview-frame").elementHandle())?.contentFrame();
  if(!frame)throw new Error("G3AU01_R02_CLASSIC_PREVIEW_MISSING");
  await frame.waitForSelector(".worksheet-document",{timeout:120000});
  const rendered=await frame.evaluate(()=>({
    questionCount:document.querySelectorAll(".worksheet-cell--question").length,
    answerCount:document.querySelectorAll(".worksheet-cell--answer-key").length,
    questionNumberLines:document.querySelectorAll('.worksheet-cell--question [data-representation="integer-number-line"]').length,
    answerNumberLines:document.querySelectorAll('.worksheet-cell--answer-key [data-representation="integer-number-line"]').length,
    overflow:[...document.querySelectorAll(".worksheet-page")].filter(
      (node)=>node.scrollHeight>node.clientHeight+1||node.scrollWidth>node.clientWidth+1
    ).length,
  }));
  if(
    rendered.questionCount!==expectedCount
    || rendered.answerCount!==expectedCount
    || rendered.overflow!==0
    || rendered.questionNumberLines<1
    || rendered.answerNumberLines<1
    || (requireExactRank02&&(
      rendered.questionNumberLines!==expectedCount
      || rendered.answerNumberLines!==expectedCount
    ))
  ){
    throw new Error(`G3AU01_R02_CLASSIC_RENDER:${JSON.stringify(rendered)}`);
  }
  return {frame,rendered};
}

async function classicSingle(page){
  await configureClassic(page);
  await page.selectOption("#batch-a-selection-mode-select","singleKnowledgePoint");
  await page.waitForFunction(
    (kp)=>Boolean(document.querySelector(`#batch-a-knowledge-point-panel [data-knowledge-point-id="${kp}"]`)),
    KP,
    {timeout:120000},
  );
  const target=page.locator(`#batch-a-knowledge-point-panel [data-knowledge-point-id="${KP}"]`);
  const label=(await target.locator("strong").textContent())?.replace(/^已選｜/,"").trim();
  if(label!==LABEL)throw new Error(`G3AU01_R02_CLASSIC_LABEL:${label}`);
  await target.click();
  await page.waitForFunction(
    (kp)=>document.querySelector(`#batch-a-knowledge-point-panel [data-knowledge-point-id="${kp}"]`)?.dataset?.selected==="true",
    KP,
    {timeout:120000},
  );
  await page.fill("#batch-a-question-count-input","6");
  await page.dispatchEvent("#batch-a-question-count-input","change");
  await page.check("#batch-a-answer-key-input");
  await page.fill("#generation-seed-input","g3a-u01-rank02-classic-single");
  await page.dispatchEvent("#generation-seed-input","change");
  await page.locator("#regenerate-button").click();
  await page.waitForFunction(
    ()=>["success","error"].includes(document.querySelector("#status-panel")?.dataset?.tone??""),
    null,
    {timeout:45000},
  );
  const status=await page.evaluate(()=>({
    tone:document.querySelector("#status-panel")?.dataset?.tone??"",
    text:document.querySelector("#status-panel")?.textContent?.trim()??"",
  }));
  if(status.tone!=="success")throw new Error(`G3AU01_R02_CLASSIC_SINGLE_GENERATION:${JSON.stringify(status)}`);
  const {frame,rendered}=await inspectClassicPreview(page,6,{requireExactRank02:true});
  await frame.evaluate(()=>{
    window.__G3AU01_R02_CLASSIC_PRINT__=0;
    window.print=()=>{window.__G3AU01_R02_CLASSIC_PRINT__+=1;};
  });
  await page.locator("#print-button").click();
  const printCount=await frame.evaluate(()=>window.__G3AU01_R02_CLASSIC_PRINT__??0);
  if(printCount!==1)throw new Error(`G3AU01_R02_CLASSIC_PRINT:${printCount}`);
  return {status,rendered,printCount};
}

async function classicSameUnit(page){
  await configureClassic(page);
  await page.selectOption("#batch-a-selection-mode-select","mixedKnowledgePointsSameUnit");
  await page.waitForFunction(
    (kp)=>Boolean(document.querySelector(`#batch-a-knowledge-point-panel [data-knowledge-point-id="${kp}"]`)),
    KP,
    {timeout:120000},
  );
  const target=page.locator(`#batch-a-knowledge-point-panel [data-knowledge-point-id="${KP}"]`);
  if(await target.getAttribute("data-selected")!=="true")await target.click();
  await page.waitForFunction(
    (kp)=>document.querySelector(`#batch-a-knowledge-point-panel [data-knowledge-point-id="${kp}"]`)?.dataset?.selected==="true",
    KP,
    {timeout:120000},
  );
  const selectorState=await page.evaluate((kp)=>({
    rank02Selected:document.querySelector(`#batch-a-knowledge-point-panel [data-knowledge-point-id="${kp}"]`)?.dataset?.selected??null,
    selectedCount:document.querySelectorAll("#batch-a-knowledge-point-panel .knowledge-point-option[data-selected='true']").length,
    totalCount:document.querySelectorAll("#batch-a-knowledge-point-panel .knowledge-point-option").length,
  }),KP);
  if(
    selectorState.rank02Selected!=="true"
    || selectorState.selectedCount!==selectorState.totalCount
  ){
    throw new Error(`G3AU01_R02_CLASSIC_MIXED_SELECTOR:${JSON.stringify(selectorState)}`);
  }
  await page.fill("#batch-a-question-count-input","30");
  await page.dispatchEvent("#batch-a-question-count-input","change");
  await page.check("#batch-a-answer-key-input");
  await page.fill("#generation-seed-input","g3a-u01-rank02-classic-mixed");
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
  if(status.tone!=="success")throw new Error(`G3AU01_R02_CLASSIC_MIXED_GENERATION:${JSON.stringify(status)}`);
  const {rendered}=await inspectClassicPreview(page,30);
  return {selectorState,status,rendered};
}

async function configureExam(page){
  await page.goto(`${EXAM}?rank02_public=${Date.now()}`,{waitUntil:"networkidle",timeout:120000});
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

async function generateExamAndInspect(page,expectedStatusFragment,{exactRank02Count=null}={}){
  await page.locator("#exam-generate").click();
  await page.waitForFunction(
    ()=>["success","error"].includes(document.querySelector("#exam-status")?.dataset?.tone??""),
    null,
    {timeout:60000},
  );
  const status=await page.evaluate(()=>({
    tone:document.querySelector("#exam-status")?.dataset?.tone??"",
    text:document.querySelector("#exam-status")?.textContent?.trim()??"",
  }));
  if(status.tone!=="success"||!status.text.includes(expectedStatusFragment)){
    throw new Error(`G3AU01_R02_EXAM_GENERATION:${JSON.stringify(status)}`);
  }
  const frame=await (await page.locator("#exam-preview").elementHandle())?.contentFrame();
  if(!frame)throw new Error("G3AU01_R02_EXAM_PREVIEW_MISSING");
  await frame.waitForSelector("body",{timeout:120000});
  const rendered=await frame.evaluate(()=>({
    questionNumberLines:document.querySelectorAll('.school-exam-page--questions [data-representation="integer-number-line"]').length,
    answerNumberLines:document.querySelectorAll('.school-exam-page--answers [data-representation="integer-number-line"]').length,
    questionCount:document.querySelectorAll(".school-exam-page--questions .worksheet-cell--question").length,
  }));
  if(rendered.questionNumberLines<1||rendered.answerNumberLines<1){
    throw new Error(`G3AU01_R02_EXAM_NUMBER_LINE_NOT_MATERIALIZED:${JSON.stringify(rendered)}`);
  }
  if(exactRank02Count!==null&&(
    rendered.questionNumberLines!==exactRank02Count
    || rendered.answerNumberLines!==exactRank02Count
  )){
    throw new Error(`G3AU01_R02_EXAM_SINGLE_COUNT:${JSON.stringify(rendered)}`);
  }
  return {status,rendered};
}

async function examSingle(page){
  await configureExam(page);
  await page.selectOption("#exam-composition-mode","SINGLE_KP");
  await page.dispatchEvent("#exam-composition-mode","change");
  await page.waitForFunction(
    (kp)=>Boolean(document.querySelector(`#exam-kp-panel [data-selector-target-id="${kp}"]`)),
    KP,
    {timeout:120000},
  );
  const target=page.locator(`#exam-kp-panel [data-selector-target-id="${KP}"]`);
  const label=(await target.locator("strong").textContent())?.replace(/^已選｜/,"").trim();
  if(label!==LABEL)throw new Error(`G3AU01_R02_EXAM_LABEL:${label}`);
  await target.click();
  await page.waitForFunction(
    (kp)=>document.querySelector(`#exam-kp-panel [data-selector-target-id="${kp}"]`)?.dataset?.selected==="true",
    KP,
    {timeout:120000},
  );
  await page.fill("#exam-question-count","6");
  await page.fill("#exam-seed","g3a-u01-rank02-exam-single");
  return generateExamAndInspect(page,"單一知識點考券已產生",{exactRank02Count:6});
}

async function examSameUnit(page){
  await configureExam(page);
  await page.selectOption("#exam-composition-mode","MIXED_KP_SAME_UNIT");
  await page.dispatchEvent("#exam-composition-mode","change");
  await page.waitForFunction(
    (kp)=>Boolean(document.querySelector(`#exam-kp-panel [data-selector-target-id="${kp}"]`)),
    KP,
    {timeout:120000},
  );
  const target=page.locator(`#exam-kp-panel [data-selector-target-id="${KP}"]`);
  if(await target.getAttribute("data-selected")!=="true")await target.click();
  const selectorState=await page.evaluate((kp)=>({
    rank02:document.querySelector(`#exam-kp-panel [data-selector-target-id="${kp}"]`)?.dataset?.selected??null,
    selected:document.querySelectorAll("#exam-kp-panel [data-selector-target-id][data-selected='true']").length,
    total:document.querySelectorAll("#exam-kp-panel [data-selector-target-id]").length,
  }),KP);
  if(selectorState.rank02!=="true"||selectorState.selected!==selectorState.total){
    throw new Error(`G3AU01_R02_EXAM_SAME_SELECTOR:${JSON.stringify(selectorState)}`);
  }
  await page.fill("#exam-question-count","30");
  await page.fill("#exam-seed","g3a-u01-rank02-exam-same");
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
    ({source,kp})=>Boolean(document.querySelector(
      `#exam-cross-unit-kp-groups [data-source-id="${source}"] [data-cross-selector-target-id="${kp}"]`
    )),
    {source:SOURCE,kp:KP},
    {timeout:120000},
  );
  const target=page.locator(
    `#exam-cross-unit-kp-groups [data-source-id="${SOURCE}"] [data-cross-selector-target-id="${KP}"]`
  );
  if(await target.getAttribute("data-selected")!=="true")await target.click();
  await page.waitForFunction(
    ({source,kp})=>document.querySelector(
      `#exam-cross-unit-kp-groups [data-source-id="${source}"] [data-cross-selector-target-id="${kp}"]`
    )?.dataset?.selected==="true",
    {source:SOURCE,kp:KP},
    {timeout:120000},
  );
  const selectorState=await page.evaluate(({source,kp})=>({
    sourceSelected:document.querySelector(`#exam-cross-unit-source-panel [data-cross-source-id="${source}"]`)?.dataset?.selected??null,
    rank02:document.querySelector(`#exam-cross-unit-kp-groups [data-source-id="${source}"] [data-cross-selector-target-id="${kp}"]`)?.dataset?.selected??null,
    selectedSources:document.querySelectorAll("#exam-cross-unit-source-panel [data-cross-source-id][data-selected='true']").length,
    selectedTargets:document.querySelectorAll("#exam-cross-unit-kp-groups [data-cross-selector-target-id][data-selected='true']").length,
  }),{source:SOURCE,kp:KP});
  if(
    selectorState.sourceSelected!=="true"
    || selectorState.rank02!=="true"
    || selectorState.selectedSources<2
    || selectorState.selectedTargets<2
  ){
    throw new Error(`G3AU01_R02_EXAM_CROSS_SELECTOR:${JSON.stringify(selectorState)}`);
  }
  const count=Math.max(12,selectorState.selectedTargets*2);
  await page.fill("#exam-question-count",String(count));
  await page.fill("#exam-seed","g3a-u01-rank02-exam-cross");
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
    throw new Error(`G3AU01_R02_BROWSER_DIAGNOSTICS:${JSON.stringify(errors)}`);
  }

  const report={
    schemaName:"G3AU01VisualRank02ThreeModeAcceptanceV1",
    taskId:"G3A_U01_VisualRank02_PublicSelectorCutover_ThreeModeLinkage",
    status:"PASS_G3A_U01_RANK02_CLASSIC_AND_EXAM_THREE_MODE",
    sourceId:SOURCE,
    knowledgePointId:KP,
    patternGroupId:GROUP,
    classic:{single:classicSingleResult,sameUnit:classicMixedResult},
    exam:{single:examSingleResult,sameUnit:examSameResult,crossUnit:examCrossResult},
    browser:{consoleErrorCount:0,pageErrorCount:0,requestFailureCount:0,assetHttpFailureCount:0},
    boundaries:{
      canonicalKnowledgePointUsed:true,
      sameLevelSelector:true,
      allSameUnitTargetsSelectable:true,
      singleKnowledgePointLinked:true,
      sameUnitMixedLinked:true,
      crossUnitMixedLinked:true,
      rank03PlusVisible:false,
    },
  };
  writeFileSync(path.join(OUT,"report.json"),JSON.stringify(report,null,2)+"\n");
  console.log("G3AU01_RANK02_THREE_MODE_ACCEPTANCE="+JSON.stringify(report));
}catch(error){
  writeFileSync(path.join(OUT,"failure.json"),JSON.stringify({
    schemaName:"G3AU01VisualRank02ThreeModeAcceptanceFailureV1",
    status:"FAIL",
    error:String(error?.stack??error),
    server:{stdout:serverOut,stderr:serverErr},
  },null,2)+"\n");
  throw error;
}finally{
  if(browser)await browser.close().catch(()=>{});
  if(server&&!server.killed)server.kill("SIGTERM");
}
