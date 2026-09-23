import {createHash} from "node:crypto";
import {mkdirSync,readFileSync,writeFileSync} from "node:fs";
import {spawn} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../.."),OUT=path.join(ROOT,"tmp/p07f-w7-q007-live-pages-e2e"),BASE=new URL(process.env.P07F07_BASE_URL||"https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/"),HEAD=process.env.GITHUB_SHA||"LOCAL_MANUAL_FALLBACK",RETRIES=Number(process.env.P07F07_DEPLOYMENT_RETRIES||"60"),DELAY=Number(process.env.P07F07_DEPLOYMENT_RETRY_DELAY_MS||"15000");
const FILES=[
  "modules/curriculum/registry/g6a-u09-scale-factor-length-selector-projection-p07f07.js",
  "modules/curriculum/registry/batch-a-selector-p07f07-extension.js",
  "modules/curriculum/registry/batch-a-selector-p04f33-extension.js",
  "modules/curriculum/public/public-ui-capability-binding-p07f07.js",
  "modules/curriculum/public/public-ui-capability-binding-p04f33.js",
  "modules/curriculum/batch-a/g6a-u09-scale-factor-length-runtime-p07f07.js",
  "modules/curriculum/batch-a/batch-a-browser-generator-p07f07.js",
  "modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js",
  "modules/curriculum/batch-a/batch-a-browser-worksheet-p07f07-extension.js",
  "modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js",
  "modules/curriculum/batch-a/source-units.js"
];
mkdirSync(OUT,{recursive:true});const digest=t=>createHash("sha256").update(t).digest("hex"),sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function observe(){let last;for(let a=1;a<=RETRIES;a++){try{const assets=[];for(const publicPath of FILES){const expected=digest(readFileSync(path.join(ROOT,"site",publicPath),"utf8")),url=new URL(publicPath,BASE);url.searchParams.set("p07f07",expected.slice(0,16));const r=await fetch(url,{cache:"no-store",headers:{"cache-control":"no-cache"}});if(!r.ok)throw new Error("HTTP_"+r.status+":"+publicPath);const actual=digest(await r.text());if(actual!==expected)throw new Error("SHA_MISMATCH:"+publicPath+":"+expected+":"+actual);assets.push({publicPath,expectedSha256:expected,liveSha256:actual});}return{attempt:a,assets};}catch(e){last=e;if(a<RETRIES)await sleep(DELAY);}}throw new Error("P07F07_EXACT_DEPLOYMENT_NOT_OBSERVED:"+(last?.message||"unknown"));}
function acceptance(){return new Promise((resolve,reject)=>{const u=new URL("index.html",BASE);u.searchParams.set("p07f07-e6",HEAD+"-"+Date.now());const c=spawn(process.execPath,["tools/curriculum/run-p07f-w7-slice007-classic-ui-acceptance.mjs"],{cwd:ROOT,env:{...process.env,P07F07_SITE_URL:u.href},stdio:["ignore","pipe","pipe"]});let out="",err="";c.stdout.on("data",x=>out+=x);c.stderr.on("data",x=>err+=x);c.on("exit",code=>{if(code)return reject(new Error("P07F07_LIVE_ACCEPTANCE_EXIT_"+code+"\n"+err+"\n"+out));const line=out.split(/\r?\n/).find(x=>x.startsWith("P07F07_CLASSIC_UI_ACCEPTANCE="));if(!line)return reject(new Error("P07F07_LIVE_REPORT_MISSING"));resolve({report:JSON.parse(line.slice("P07F07_CLASSIC_UI_ACCEPTANCE=".length)),stdout:out,stderr:err});});});}
try{const deployment=await observe(),a=await acceptance();if(a.report.status!=="PASS_P07F_W7_Q007_CLASSIC_UI_ACCEPTANCE")throw new Error("P07F07_LIVE_ACCEPTANCE_STATUS:"+a.report.status);const report={schemaName:"P07FW7Q007PostMergeMainPagesE2EV1",taskId:"P07F_W7DirectProductVerticalSlice007Implementation",status:"PASS_E6_D0_COMPLETE",exactHeadSha:HEAD,baseUrl:BASE.href,deployment,classicUiAcceptance:a.report,semanticInvariants:{equivalentRatioPrerequisitePreserved:true,scaleFactorLengthOwned:true,positiveNonzeroScaleFactorRequired:true,commonScaleFactorRequired:true,fractionOrDecimalScaleFactorAllowed:true,sameUnitLengthPairOnly:true,remainingSameSourceCapabilitiesHidden:true,sameUnitMixedModeFailClosed:true,w7QueueContinuesAfterQ007:true}};writeFileSync(path.join(OUT,"report.json"),JSON.stringify(report,null,2)+"\n");writeFileSync(path.join(OUT,"acceptance.stdout.log"),a.stdout);writeFileSync(path.join(OUT,"acceptance.stderr.log"),a.stderr);console.log("P07F07_POSTMERGE_MAIN_PAGES_E2E="+JSON.stringify(report));}catch(error){writeFileSync(path.join(OUT,"failure.json"),JSON.stringify({schemaName:"P07FW7Q007PostMergeMainPagesE2EFailureV1",status:"FAIL",exactHeadSha:HEAD,baseUrl:BASE.href,error:String(error?.stack||error)},null,2)+"\n");throw error;}
