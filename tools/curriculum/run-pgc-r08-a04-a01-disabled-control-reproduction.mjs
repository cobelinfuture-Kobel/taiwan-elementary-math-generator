import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { materializeMatrix } from "./build-pgc-r08-a01-legal-route-browser-matrix.mjs";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const PLAN_PATH=path.join(ROOT,"data/curriculum/public-generation/PGC-R08-A04-A01.disabled-control-focused-reproduction-plan.json");
const A04_PATH=path.join(ROOT,"data/curriculum/public-generation/PGC-R08-A04-A00.failure-family-repair-canary-matrix.json");
const CAPACITY_PATH=path.join(ROOT,"data/curriculum/public-generation/generator_capacity_contract.json");
const R08_A00_PATH=path.join(ROOT,"data/curriculum/public-generation/PGC-R08-A00.public-generate-button-e2e-scope.json");
const OUT=path.join(ROOT,"tmp/pgc-r08-a04-a01-disabled-control-reproduction");
const SCREENSHOTS=path.join(OUT,"screenshots");
const ORIGIN="http://127.0.0.1:4196";
const S={source:"#batch-a-source-select",mode:"#batch-a-selection-mode-select",kp:"#batch-a-knowledge-point-panel",type:"#g5a-u08-question-mode",context:"#g5a-u08-context-mode",cap:"#g5a-u08-public-controls"};

function fail(code,details={}){const error=new Error(code);error.details=details;throw error;}
async function waitForServer(){
  for(let i=0;i<120;i+=1){
    try{if((await fetch(`${ORIGIN}/index.html`,{cache:"no-store"})).ok)return;}catch{}
    await new Promise((resolve)=>setTimeout(resolve,250));
  }
  fail("PGC_R08_A04_A01_SITE_SERVER_TIMEOUT");
}
async function selectEnabled(page,selector,value){
  await page.waitForFunction(({selector,value})=>[...(document.querySelector(selector)?.options??[])].some((option)=>option.value===value),{selector,value},{timeout:120000});
  const disabled=await page.locator(selector).isDisabled();
  if(disabled)fail("PGC_R08_A04_A01_REQUIRED_ENABLED_CONTROL_DISABLED",{selector,value,actual:await page.locator(selector).inputValue()});
  await page.selectOption(selector,value);
  await page.waitForFunction(({selector,value})=>document.querySelector(selector)?.value===value,{selector,value},{timeout:120000});
}
async function selectedKnowledgePoints(page){
  return page.locator(`${S.kp} [data-knowledge-point-id][data-selected="true"]`).evaluateAll((nodes)=>nodes.map((node)=>node.dataset.knowledgePointId).filter(Boolean).sort());
}
async function setKnowledgePoints(page,row){
  if(row.selectionMode==="sourceUnit")return;
  const wanted=[...new Set(row.selectedKnowledgePointIds)].sort();
  await page.locator(`${S.kp} [data-knowledge-point-id]`).first().waitFor({state:"visible",timeout:120000});
  for(const id of wanted){
    const button=page.locator(`${S.kp} [data-knowledge-point-id="${id}"]`);
    await button.waitFor({state:"visible",timeout:120000});
    if(await button.isDisabled())fail("PGC_R08_A04_A01_KP_NOT_SELECTABLE",{routeId:row.routeId,id});
    if(await button.getAttribute("data-selected")!=="true")await button.click();
  }
  for(let i=0;i<80;i+=1){
    const extra=(await selectedKnowledgePoints(page)).find((id)=>!wanted.includes(id));
    if(!extra)break;
    await page.locator(`${S.kp} [data-knowledge-point-id="${extra}"]`).click();
  }
  const actual=await selectedKnowledgePoints(page);
  if(JSON.stringify(actual)!==JSON.stringify(wanted))fail("PGC_R08_A04_A01_KP_SELECTION_MISMATCH",{routeId:row.routeId,wanted,actual});
}
async function probeControl(page,selector,requestedValue){
  await page.waitForFunction(({selector,requestedValue})=>[...(document.querySelector(selector)?.options??[])].some((option)=>option.value===requestedValue),{selector,requestedValue},{timeout:120000});
  const before=await page.locator(selector).evaluate((element,requestedValue)=>({
    disabled:element.disabled,
    actualValue:element.value,
    requestedValue,
    requestedOptionDisabled:[...element.options].find((option)=>option.value===requestedValue)?.disabled??null,
    optionValues:[...element.options].map((option)=>option.value)
  }),requestedValue);
  if(before.disabled){
    return {...before,classification:before.actualValue===requestedValue?"DISABLED_CURRENT_VALUE_MATCH":"DISABLED_VALUE_MISMATCH",mutationPerformed:false};
  }
  await page.selectOption(selector,requestedValue);
  await page.waitForFunction(({selector,requestedValue})=>document.querySelector(selector)?.value===requestedValue,{selector,requestedValue},{timeout:120000});
  return {...before,actualValue:await page.locator(selector).inputValue(),classification:"ENABLED_SELECTION_PASS",mutationPerformed:true};
}
async function probeCanary(browser,row,failureFamily){
  const page=await browser.newPage({viewport:{width:1440,height:1200}});
  const screenshotPath=path.join(SCREENSHOTS,`${String(row.routeIndex).padStart(4,"0")}-${failureFamily.toLowerCase()}.png`);
  try{
    const response=await page.goto(`${ORIGIN}/index.html?pgcR08A04A01=${row.routeIndex}-${Date.now()}`,{waitUntil:"networkidle",timeout:120000});
    if(!response?.ok())fail("PGC_R08_A04_A01_PUBLIC_UI_HTTP_FAILED",{status:response?.status()});
    await selectEnabled(page,S.source,row.sourceId);
    await selectEnabled(page,S.mode,row.selectionMode);
    await setKnowledgePoints(page,row);
    await page.waitForFunction(({selector,sourceId})=>document.querySelector(selector)?.dataset.sourceId===sourceId,{selector:S.cap,sourceId:row.sourceId},{timeout:120000});
    const questionTypeProbe=await probeControl(page,S.type,row.questionType);
    await setKnowledgePoints(page,row);
    let targetProbe=questionTypeProbe;
    let contextProbe=null;
    if(failureFamily==="CONTEXT_MODE_CONTROL_DISABLED"){
      contextProbe=await probeControl(page,S.context,row.contextMode);
      targetProbe=contextProbe;
    }
    await page.screenshot({path:screenshotPath,fullPage:true});
    return {
      routeIndex:row.routeIndex,routeId:row.routeId,sourceId:row.sourceId,selectionMode:row.selectionMode,questionType:row.questionType,contextMode:row.contextMode,
      expectedFailureFamily:failureFamily,terminalClassification:targetProbe.classification,
      questionTypeProbe,contextProbe,
      selectedKnowledgePointIds:await selectedKnowledgePoints(page),
      publicControlSourceId:await page.locator(S.cap).getAttribute("data-source-id"),
      screenshotPath:path.relative(ROOT,screenshotPath)
    };
  }catch(error){
    try{await page.screenshot({path:screenshotPath,fullPage:true});}catch{}
    return {
      routeIndex:row.routeIndex,routeId:row.routeId,sourceId:row.sourceId,selectionMode:row.selectionMode,questionType:row.questionType,contextMode:row.contextMode,
      expectedFailureFamily:failureFamily,terminalClassification:"SYSTEM_FAILURE",
      errorCode:error.message,details:error.details??null,pageUrl:page.url(),screenshotPath:path.relative(ROOT,screenshotPath)
    };
  }finally{await page.close();}
}

const plan=JSON.parse(await readFile(PLAN_PATH,"utf8"));
const a04=JSON.parse(await readFile(A04_PATH,"utf8"));
const capacityRaw=await readFile(CAPACITY_PATH,"utf8");
const matrix=materializeMatrix(JSON.parse(capacityRaw),JSON.parse(await readFile(R08_A00_PATH,"utf8")),capacityRaw);
const targets=a04.failureFamilies.filter((family)=>plan.targetFamilies.includes(family.failureFamily)).flatMap((family)=>family.canaries.map((canary)=>({failureFamily:family.failureFamily,canary})));
if(targets.length!==plan.canaryCount)fail("PGC_R08_A04_A01_CANARY_COUNT_DRIFT",{expected:plan.canaryCount,actual:targets.length});
const rows=targets.map(({failureFamily,canary})=>{
  const row=matrix.rows.find((candidate)=>candidate.routeIndex===canary.routeIndex&&candidate.routeId===canary.routeId);
  if(!row)fail("PGC_R08_A04_A01_CANARY_ROUTE_NOT_FOUND",{failureFamily,canary});
  return{failureFamily,row};
});

await rm(OUT,{recursive:true,force:true});
await Promise.all([mkdir(OUT,{recursive:true}),mkdir(SCREENSHOTS,{recursive:true})]);
const server=spawn(process.execPath,[path.join(ROOT,"tools/site/serve-site.js")],{cwd:ROOT,env:{...process.env,SITE_PORT:"4196",SITE_HOST:"127.0.0.1"},stdio:["ignore","pipe","pipe"]});
let browser;
try{
  await waitForServer();
  browser=await chromium.launch({headless:true});
  const results=Array(rows.length);
  let cursor=0;
  const worker=async()=>{
    while(true){
      const index=cursor++;
      if(index>=rows.length)return;
      results[index]=await probeCanary(browser,rows[index].row,rows[index].failureFamily);
    }
  };
  await Promise.all(Array.from({length:plan.workerConcurrency},()=>worker()));
  const counts=Object.fromEntries(plan.terminalClassifications.map((classification)=>[classification,results.filter((row)=>row.terminalClassification===classification).length]));
  const report={
    schemaName:"PGCR08A04A01DisabledControlFocusedReproductionReportV1",
    schemaVersion:1,
    programId:plan.programId,
    taskId:plan.taskId,
    status:counts.SYSTEM_FAILURE===0?"PASS_FOCUSED_REPRODUCTION_CLASSIFIED":"FAIL_SYSTEM_REPRODUCTION",
    summary:{
      canaryCount:results.length,
      terminalCanaryCount:results.filter(Boolean).length,
      questionTypeControlCanaryCount:results.filter((row)=>row.expectedFailureFamily==="QUESTION_TYPE_CONTROL_DISABLED").length,
      contextModeControlCanaryCount:results.filter((row)=>row.expectedFailureFamily==="CONTEXT_MODE_CONTROL_DISABLED").length,
      ...counts
    },
    repairDecision:
      counts.DISABLED_VALUE_MISMATCH>0?"PRODUCT_OR_AUTHORITY_MISMATCH_EVIDENCE":
      counts.ENABLED_SELECTION_PASS>0?"MIXED_OR_TEMPORAL_CONTROL_STATE_EVIDENCE":
      "HARNESS_DISABLED_CURRENT_VALUE_POLICY_CONFIRMED",
    productMutationPerformed:false,
    capacityAuthorityMutationPerformed:false,
    rows:results
  };
  await writeFile(path.join(OUT,"report.json"),`${JSON.stringify(report,null,2)}\n`);
  console.log(JSON.stringify({status:report.status,summary:report.summary,repairDecision:report.repairDecision},null,2));
  if(report.summary.terminalCanaryCount!==plan.canaryCount)fail("PGC_R08_A04_A01_TERMINAL_CLASSIFICATION_INCOMPLETE",report.summary);
  if(counts.SYSTEM_FAILURE!==0)fail("PGC_R08_A04_A01_SYSTEM_FAILURES_PRESENT",report.summary);
}finally{
  if(browser)await browser.close();
  server.kill("SIGTERM");
}
