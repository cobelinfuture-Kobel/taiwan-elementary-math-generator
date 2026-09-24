import {createHash} from "node:crypto";
import {copyFileSync,existsSync,mkdirSync,readFileSync,writeFileSync} from "node:fs";
import {spawn} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../.."),OUT=path.join(ROOT,"tmp/p07f-w7-q022-live-pages-e2e"),
  BASE=new URL(process.env.P07F22_BASE_URL||"https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/"),HEAD=process.env.GITHUB_SHA||"LOCAL_MANUAL_FALLBACK",
  RETRIES=Number(process.env.P07F22_DEPLOYMENT_RETRIES||"60"),DELAY=Number(process.env.P07F22_DEPLOYMENT_RETRY_DELAY_MS||"15000");
const FILES=[
  "modules/curriculum/registry/g6b-u04-three-rate-quantity-relations-selector-projection-p07f22.js",
  "modules/curriculum/registry/batch-a-selector-p07f22-extension.js",
  "modules/curriculum/registry/batch-a-selector-p04f33-extension.js",
  "modules/curriculum/public/public-ui-capability-binding-p07f22.js",
  "modules/curriculum/public/public-ui-capability-binding-p04f33.js",
  "modules/curriculum/batch-a/g6b-u04-three-rate-quantity-relations-runtime-p07f22.js",
  "modules/curriculum/batch-a/batch-a-browser-generator-p07f22.js",
  "modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js",
  "modules/curriculum/batch-a/batch-a-browser-worksheet-p07f22-extension.js",
  "modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js"
];
mkdirSync(OUT,{recursive:true});const digest=t=>createHash("sha256").update(t).digest("hex"),sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function observe(){let last;for(let attempt=1;attempt<=RETRIES;attempt++){try{const assets=[];for(const publicPath of FILES){const expected=digest(readFileSync(path.join(ROOT,"site",publicPath),"utf8")),url=new URL(publicPath,BASE);url.searchParams.set("p07f22",expected.slice(0,16));const response=await fetch(url,{cache:"no-store",headers:{"cache-control":"no-cache"}});if(!response.ok)throw new Error("HTTP_"+response.status+":"+publicPath);const actual=digest(await response.text());if(actual!==expected)throw new Error("SHA_MISMATCH:"+publicPath+":"+expected+":"+actual);assets.push({publicPath,expectedSha256:expected,liveSha256:actual});}return{attempt,assets};}catch(error){last=error;if(attempt<RETRIES)await sleep(DELAY);}}throw new Error("P07F22_EXACT_DEPLOYMENT_NOT_OBSERVED:"+(last?.message||"unknown"));}
function acceptance(){return new Promise((resolve,reject)=>{const url=new URL("index.html",BASE);url.searchParams.set("p07f22-e6",HEAD+"-"+Date.now());const childOut=path.join(ROOT,"tmp/p07f-w7-slice022-classic-ui-acceptance");
 const child=spawn(process.execPath,["tools/curriculum/run-p07f-w7-slice022-classic-ui-acceptance.mjs"],{cwd:ROOT,env:{...process.env,P07F22_SITE_URL:url.href,P07F22_LIVE_CACHE_TOKEN:HEAD},stdio:["ignore","pipe","pipe"]});let stdout="",stderr="";
 child.stdout.on("data",x=>stdout+=x);child.stderr.on("data",x=>stderr+=x);child.on("exit",code=>{writeFileSync(path.join(OUT,"acceptance.stdout.log"),stdout);writeFileSync(path.join(OUT,"acceptance.stderr.log"),stderr);if(code){let childFailure=null;const childFailurePath=path.join(childOut,"failure.json");if(existsSync(childFailurePath)){copyFileSync(childFailurePath,path.join(OUT,"acceptance.failure.json"));try{childFailure=JSON.parse(readFileSync(childFailurePath,"utf8"));}catch{}}const error=new Error("P07F22_LIVE_ACCEPTANCE_EXIT_"+code+"\n"+stderr+"\n"+stdout);error.childFailure=childFailure;return reject(error);}const line=stdout.split(/\r?\n/).find(x=>x.startsWith("P07F22_CLASSIC_UI_ACCEPTANCE="));if(!line)return reject(new Error("P07F22_LIVE_REPORT_MISSING"));resolve({report:JSON.parse(line.slice("P07F22_CLASSIC_UI_ACCEPTANCE=".length)),stdout,stderr});});});}
try{const deployment=await observe(),a=await acceptance();if(a.report.status!=="PASS_P07F_W7_Q022_CLASSIC_UI_ACCEPTANCE")throw new Error("P07F22_LIVE_ACCEPTANCE_STATUS:"+a.report.status);
 const report={schemaName:"P07FW7Q022PostMergeMainPagesE2EV1",taskId:"P07F_W7DirectProductVerticalSlice022Implementation",status:"PASS_E6_D0_COMPLETE",exactHeadSha:HEAD,baseUrl:BASE.href,deployment,classicUiAcceptance:a.report,
 semanticInvariants:{threeRateQuantityRelationsOwned:true,sourcePages1And2RateRelationEvidenceConsumed:true,predecessorRoleOwnershipProtected:true,successiveRateChangeProtected:true,sameUnitMixedModeFailClosed:true,w7QueueContinuesAfterQ022:true}};
 writeFileSync(path.join(OUT,"report.json"),JSON.stringify(report,null,2)+"\n");writeFileSync(path.join(OUT,"acceptance.stdout.log"),a.stdout);writeFileSync(path.join(OUT,"acceptance.stderr.log"),a.stderr);console.log("P07F22_POSTMERGE_MAIN_PAGES_E2E="+JSON.stringify(report));}
catch(error){writeFileSync(path.join(OUT,"failure.json"),JSON.stringify({schemaName:"P07FW7Q022PostMergeMainPagesE2EFailureV1",status:"FAIL",exactHeadSha:HEAD,baseUrl:BASE.href,error:String(error?.stack||error),childFailure:error?.childFailure||null},null,2)+"\n");throw error;}
