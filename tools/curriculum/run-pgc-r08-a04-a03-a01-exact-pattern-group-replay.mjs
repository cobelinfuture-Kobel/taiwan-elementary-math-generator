import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { materializeMatrix } from "./build-pgc-r08-a01-legal-route-browser-matrix.mjs";
import { executeRoute, GATE_CODES } from "./pgc-r08-a03-browser-harness-core.mjs";
import { enrichBrowserRowWithExactPatternGroups } from "./pgc-r08-exact-pattern-group-authority.mjs";
import { wrapBrowserWithExactPatternGroupBinder } from "./pgc-r08-exact-pattern-group-binder.mjs";
import { DISABLED_CONTROL_POLICY_CODES, wrapBrowserWithDisabledCurrentValueSelectionPolicy } from "./pgc-r08-browser-control-selection-policy.mjs";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const PLAN=JSON.parse(await readFile(path.join(ROOT,"data/curriculum/public-generation/PGC-R08-A04-A03-A01.exact-pattern-group-binding-plan.json"),"utf8"));
const CAPACITY_PATH=path.join(ROOT,"data/curriculum/public-generation/generator_capacity_contract.json");
const A00_PATH=path.join(ROOT,"data/curriculum/public-generation/PGC-R08-A00.public-generate-button-e2e-scope.json");
const OUT=path.join(ROOT,"tmp/pgc-r08-a04-a03-a01-exact-pattern-group-replay");
const CORE_OUT=path.join(ROOT,"tmp/pgc-r08-a03-all-legal-routes");
const ORIGIN="http://127.0.0.1:4196";
const fail=(code,details={})=>{const error=new Error(code);error.details=details;throw error;};
async function waitForServer(){for(let i=0;i<160;i+=1){try{if((await fetch(`${ORIGIN}/index.html`,{cache:"no-store"})).ok)return;}catch{}await new Promise((resolve)=>setTimeout(resolve,250));}fail("PGC_R08_A03_A01_SITE_SERVER_TIMEOUT");}
function queueRows(queue){const c=Object.fromEntries(queue.rowColumns.map((name,index)=>[name,index]));return queue.rows.map((row)=>({routeIndex:row[c.routeIndex],routeId:row[c.routeId]}));}

const capacityRaw=await readFile(CAPACITY_PATH,"utf8");
const matrix=materializeMatrix(JSON.parse(capacityRaw),JSON.parse(await readFile(A00_PATH,"utf8")),capacityRaw);
const queue=JSON.parse(await readFile(path.join(ROOT,PLAN.queuePath),"utf8"));
const targets=queueRows(queue).map((target)=>{const row=matrix.rows.find((candidate)=>candidate.routeIndex===target.routeIndex&&candidate.routeId===target.routeId);if(!row)fail("PGC_R08_A03_A01_ROUTE_MISSING",target);return enrichBrowserRowWithExactPatternGroups(row);});
if(targets.length!==PLAN.targetRouteCount)fail("PGC_R08_A03_A01_ROUTE_COUNT_DRIFT",{actual:targets.length});
await Promise.all([rm(OUT,{recursive:true,force:true}),rm(CORE_OUT,{recursive:true,force:true})]);
await Promise.all([mkdir(OUT,{recursive:true}),mkdir(path.join(CORE_OUT,"samples"),{recursive:true}),mkdir(path.join(CORE_OUT,"failures"),{recursive:true})]);
const server=spawn(process.execPath,[path.join(ROOT,"tools/site/serve-site.js")],{cwd:ROOT,env:{...process.env,SITE_PORT:"4196",SITE_HOST:"127.0.0.1"},stdio:["ignore","pipe","pipe"]});
let browser;
try{
  await waitForServer();browser=await chromium.launch({headless:true});
  const results=Array(targets.length),binderEvents=[],controlEvents=[];let cursor=0;
  const worker=async()=>{while(true){const index=cursor;cursor+=1;if(index>=targets.length)return;const row=targets[index];const exactBrowser=wrapBrowserWithExactPatternGroupBinder(browser,row,{onDisposition:(event)=>binderEvents.push(event)});const policyBrowser=wrapBrowserWithDisabledCurrentValueSelectionPolicy(exactBrowser,{onDisposition:(event)=>controlEvents.push(event)});results[index]=await executeRoute(policyBrowser,row);}};
  await Promise.all(Array.from({length:PLAN.workerConcurrency},()=>worker()));
  const failed=results.filter((row)=>row.overallStatus!=="PASS");
  const routeBindingFailed=failed.filter((row)=>row.gateStatus.UI_OPTIONS_PASS!=="PASS");
  const dispositionCounts=Object.fromEntries(Object.values(DISABLED_CONTROL_POLICY_CODES).map((code)=>[code,controlEvents.filter((event)=>event.disposition===code).length]));
  const report={schemaName:"PGCR08A04A03A01ExactPatternGroupReplayReportV1",schemaVersion:1,programId:PLAN.programId,taskId:PLAN.taskId,status:routeBindingFailed.length===0?"PASS_EXACT_PATTERN_GROUP_BINDING_136_OF_136":"FAIL_EXACT_PATTERN_GROUP_BINDING_NONZERO",summary:{targetRouteCount:targets.length,terminalRouteCount:results.length,routeBindingResolvedCount:targets.length-routeBindingFailed.length,routeBindingStillFailedCount:routeBindingFailed.length,fullNineGatePassCount:results.filter((row)=>GATE_CODES.every((gate)=>row.gateStatus[gate]==="PASS")).length,downstreamFailCount:failed.length-routeBindingFailed.length,binderEventCount:binderEvents.length,browserConsoleErrorCount:results.reduce((sum,row)=>sum+(row.browserEvidence?.consoleErrors?.length??row.browserEvidence?.consoleErrorCount??0),0),browserPageErrorCount:results.reduce((sum,row)=>sum+(row.browserEvidence?.pageErrors?.length??row.browserEvidence?.pageErrorCount??0),0),...dispositionCounts},failures:failed.map((row)=>({routeIndex:row.routeIndex,routeId:row.routeId,errorCode:row.browserEvidence?.errorCode??"UNKNOWN",details:row.browserEvidence?.details??null,passedGateCodes:GATE_CODES.filter((gate)=>row.gateStatus[gate]==="PASS")})),rows:results};
  await writeFile(path.join(OUT,"report.json"),`${JSON.stringify(report,null,2)}\n`);await writeFile(path.join(OUT,"binder-events.json"),`${JSON.stringify(binderEvents,null,2)}\n`);await writeFile(path.join(OUT,"control-events.json"),`${JSON.stringify(controlEvents,null,2)}\n`);console.log(JSON.stringify({status:report.status,summary:report.summary},null,2));
  if(report.summary.terminalRouteCount!==PLAN.acceptance.terminalRouteCount||report.summary.routeBindingResolvedCount!==PLAN.acceptance.routeBindingResolvedCount||report.summary.DISABLED_VALUE_MISMATCH!==0)fail("PGC_R08_A03_A01_ACCEPTANCE_FAILED",report.summary);
}finally{if(browser)await browser.close();server.kill("SIGTERM");}
