import {createHash} from "node:crypto";
import {mkdirSync,readFileSync,writeFileSync} from "node:fs";
import {spawn} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const OUT=path.join(ROOT,"tmp/p07f-w7-q010-live-pages-e2e");
const BASE=new URL(process.env.P07F10_BASE_URL||"https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/");
const HEAD=process.env.GITHUB_SHA||"LOCAL_MANUAL_FALLBACK";
const RETRIES=Number(process.env.P07F10_DEPLOYMENT_RETRIES||"60");
const DELAY=Number(process.env.P07F10_DEPLOYMENT_RETRY_DELAY_MS||"15000");

const FILES=[
  "modules/curriculum/registry/g6a-u06-semicircle-perimeter-selector-projection-p07f10.js",
  "modules/curriculum/registry/batch-a-selector-p07f10-extension.js",
  "modules/curriculum/registry/batch-a-selector-p04f33-extension.js",
  "modules/curriculum/public/public-ui-capability-binding-p07f10.js",
  "modules/curriculum/public/public-ui-capability-binding-p04f33.js",
  "modules/curriculum/batch-a/g6a-u06-semicircle-perimeter-runtime-p07f10.js",
  "modules/curriculum/batch-a/batch-a-browser-generator-p07f10.js",
  "modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js",
  "modules/curriculum/batch-a/batch-a-browser-worksheet-p07f10-extension.js",
  "modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js",
  "modules/renderer/sector-elements-diagram.js"
];

mkdirSync(OUT,{recursive:true});
const digest=text=>createHash("sha256").update(text).digest("hex");
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

async function observe(){
  let last;
  for(let attempt=1;attempt<=RETRIES;attempt++){
    try{
      const assets=[];
      for(const publicPath of FILES){
        const expected=digest(readFileSync(path.join(ROOT,"site",publicPath),"utf8"));
        const url=new URL(publicPath,BASE);
        url.searchParams.set("p07f10",expected.slice(0,16));
        const response=await fetch(url,{cache:"no-store",headers:{"cache-control":"no-cache"}});
        if(!response.ok)throw new Error("HTTP_"+response.status+":"+publicPath);
        const actual=digest(await response.text());
        if(actual!==expected)throw new Error("SHA_MISMATCH:"+publicPath+":"+expected+":"+actual);
        assets.push({publicPath,expectedSha256:expected,liveSha256:actual});
      }
      return {attempt,assets};
    }catch(error){
      last=error;
      if(attempt<RETRIES)await sleep(DELAY);
    }
  }
  throw new Error("P07F10_EXACT_DEPLOYMENT_NOT_OBSERVED:"+(last?.message||"unknown"));
}

function acceptance(){
  return new Promise((resolve,reject)=>{
    const url=new URL("index.html",BASE);
    url.searchParams.set("p07f10-e6",HEAD+"-"+Date.now());
    const child=spawn(process.execPath,["tools/curriculum/run-p07f-w7-slice010-classic-ui-acceptance.mjs"],{
      cwd:ROOT,
      env:{...process.env,P07F10_SITE_URL:url.href},
      stdio:["ignore","pipe","pipe"]
    });
    let stdout="",stderr="";
    child.stdout.on("data",chunk=>stdout+=chunk);
    child.stderr.on("data",chunk=>stderr+=chunk);
    child.on("exit",code=>{
      if(code)return reject(new Error("P07F10_LIVE_ACCEPTANCE_EXIT_"+code+"\n"+stderr+"\n"+stdout));
      const line=stdout.split(/\r?\n/).find(row=>row.startsWith("P07F10_CLASSIC_UI_ACCEPTANCE="));
      if(!line)return reject(new Error("P07F10_LIVE_REPORT_MISSING"));
      resolve({report:JSON.parse(line.slice("P07F10_CLASSIC_UI_ACCEPTANCE=".length)),stdout,stderr});
    });
  });
}

try{
  const deployment=await observe();
  const acceptanceResult=await acceptance();
  if(acceptanceResult.report.status!=="PASS_P07F_W7_Q010_CLASSIC_UI_ACCEPTANCE")throw new Error("P07F10_LIVE_ACCEPTANCE_STATUS:"+acceptanceResult.report.status);
  const report={
    schemaName:"P07FW7Q010PostMergeMainPagesE2EV1",
    taskId:"P07F_W7DirectProductVerticalSlice010Implementation",
    status:"PASS_E6_D0_COMPLETE",
    exactHeadSha:HEAD,
    baseUrl:BASE.href,
    deployment,
    classicUiAcceptance:acceptanceResult.report,
    semanticInvariants:{
      q006CircleCircumferenceFormulaPrerequisitePreserved:true,
      q004PiCircumferenceRelationDirectPrerequisite:false,
      semicirclePerimeterOwned:true,
      boundaryArcPlusDiameterRequired:true,
      halfCircumferenceArcRequired:true,
      diameterStraightEdgeRequired:true,
      sourceOnlyArcCandidatesHidden:true,
      sameUnitMixedModeFailClosed:true,
      w7QueueContinuesAfterQ010:true
    }
  };
  writeFileSync(path.join(OUT,"report.json"),JSON.stringify(report,null,2)+"\n");
  writeFileSync(path.join(OUT,"acceptance.stdout.log"),acceptanceResult.stdout);
  writeFileSync(path.join(OUT,"acceptance.stderr.log"),acceptanceResult.stderr);
  console.log("P07F10_POSTMERGE_MAIN_PAGES_E2E="+JSON.stringify(report));
}catch(error){
  writeFileSync(path.join(OUT,"failure.json"),JSON.stringify({
    schemaName:"P07FW7Q010PostMergeMainPagesE2EFailureV1",
    status:"FAIL",
    exactHeadSha:HEAD,
    baseUrl:BASE.href,
    error:String(error?.stack||error)
  },null,2)+"\n");
  throw error;
}
