import {createHash} from "node:crypto";
import {mkdirSync,readFileSync,writeFileSync} from "node:fs";
import {spawn} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../.."),OUT=path.join(ROOT,"tmp/p07f-w7-q011-live-pages-e2e"),BASE=new URL(process.env.P07F11_BASE_URL||"https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/"),HEAD=process.env.GITHUB_SHA||"LOCAL_MANUAL_FALLBACK",RETRIES=Number(process.env.P07F11_DEPLOYMENT_RETRIES||"60"),DELAY=Number(process.env.P07F11_DEPLOYMENT_RETRY_DELAY_MS||"15000");
const FILES=[
  "modules/curriculum/batch-a/source-units.js",
  "modules/curriculum/registry/g6a-u07-circle-area-derivation-selector-projection-p07f11.js",
  "modules/curriculum/registry/batch-a-selector-p07f11-extension.js",
  "modules/curriculum/registry/batch-a-selector-p04f33-extension.js",
  "modules/curriculum/public/public-ui-capability-binding-p07f11.js",
  "modules/curriculum/public/public-ui-capability-binding-p04f33.js",
  "modules/curriculum/batch-a/g6a-u07-circle-area-derivation-runtime-p07f11.js",
  "modules/curriculum/batch-a/batch-a-browser-generator-p07f11.js",
  "modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js",
  "modules/curriculum/batch-a/batch-a-browser-worksheet-p07f11-extension.js",
  "modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js",
  "modules/renderer/circle-area-derivation-diagram-p07f11.js",
  "modules/renderer/html-renderer.js"
];
mkdirSync(OUT,{recursive:true});const digest=text=>createHash("sha256").update(text).digest("hex"),sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function observe(){let last;for(let attempt=1;attempt<=RETRIES;attempt++){try{const assets=[];for(const publicPath of FILES){const expected=digest(readFileSync(path.join(ROOT,"site",publicPath),"utf8")),url=new URL(publicPath,BASE);url.searchParams.set("p07f11",expected.slice(0,16));const response=await fetch(url,{cache:"no-store",headers:{"cache-control":"no-cache"}});if(!response.ok)throw new Error("HTTP_"+response.status+":"+publicPath);const actual=digest(await response.text());if(actual!==expected)throw new Error("SHA_MISMATCH:"+publicPath+":"+expected+":"+actual);assets.push({publicPath,expectedSha256:expected,liveSha256:actual});}return{attempt,assets};}catch(error){last=error;if(attempt<RETRIES)await sleep(DELAY);}}throw new Error("P07F11_EXACT_DEPLOYMENT_NOT_OBSERVED:"+(last?.message||"unknown"));}
function acceptance(){return new Promise((resolve,reject)=>{const url=new URL("index.html",BASE);url.searchParams.set("p07f11-e6",HEAD+"-"+Date.now());const child=spawn(process.execPath,["tools/curriculum/run-p07f-w7-slice011-classic-ui-acceptance.mjs"],{cwd:ROOT,env:{...process.env,P07F11_SITE_URL:url.href},stdio:["ignore","pipe","pipe"]});let stdout="",stderr="";child.stdout.on("data",chunk=>stdout+=chunk);child.stderr.on("data",chunk=>stderr+=chunk);child.on("exit",code=>{if(code)return reject(new Error("P07F11_LIVE_ACCEPTANCE_EXIT_"+code+"\n"+stderr+"\n"+stdout));const line=stdout.split(/\r?\n/).find(row=>row.startsWith("P07F11_CLASSIC_UI_ACCEPTANCE="));if(!line)return reject(new Error("P07F11_LIVE_REPORT_MISSING"));resolve({report:JSON.parse(line.slice("P07F11_CLASSIC_UI_ACCEPTANCE=".length)),stdout,stderr});});});}
try{const deployment=await observe(),acceptanceResult=await acceptance();if(acceptanceResult.report.status!=="PASS_P07F_W7_Q011_CLASSIC_UI_ACCEPTANCE")throw new Error("P07F11_LIVE_ACCEPTANCE_STATUS:"+acceptanceResult.report.status);const report={schemaName:"P07FW7Q011PostMergeMainPagesE2EV1",taskId:"P07F_W7DirectProductVerticalSlice011Implementation",status:"PASS_E6_D0_COMPLETE",exactHeadSha:HEAD,baseUrl:BASE.href,deployment,classicUiAcceptance:acceptanceResult.report,semanticInvariants:{originalPdfDirectDerivationSupport:false,supplementaryVisualEvidenceUsed:true,areaConservationPrerequisitePreserved:true,circleCircumferenceFormulaPrerequisitePreserved:true,circleAreaDerivationOwned:true,sectorRearrangementRequired:true,halfCircumferenceLengthRequired:true,radiusWidthRequired:true,finerSectorApproximationRequired:true,piRSquaredConclusionRequired:true,sameUnitMixedModeFailClosed:true,w7QueueContinuesAfterQ011:true}};writeFileSync(path.join(OUT,"report.json"),JSON.stringify(report,null,2)+"\n");writeFileSync(path.join(OUT,"acceptance.stdout.log"),acceptanceResult.stdout);writeFileSync(path.join(OUT,"acceptance.stderr.log"),acceptanceResult.stderr);console.log("P07F11_POSTMERGE_MAIN_PAGES_E2E="+JSON.stringify(report));}catch(error){writeFileSync(path.join(OUT,"failure.json"),JSON.stringify({schemaName:"P07FW7Q011PostMergeMainPagesE2EFailureV1",status:"FAIL",exactHeadSha:HEAD,baseUrl:BASE.href,error:String(error?.stack||error)},null,2)+"\n");throw error;}
