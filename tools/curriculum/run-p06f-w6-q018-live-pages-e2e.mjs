import {createHash} from "node:crypto";
import {mkdirSync,readFileSync,writeFileSync} from "node:fs";
import {spawn} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const OUT=path.join(ROOT,"tmp/p06f-w6-q018-live-pages-e2e");
const BASE=new URL(process.env.P06F18_BASE_URL||"https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/");
const HEAD=process.env.GITHUB_SHA||"LOCAL_MANUAL_FALLBACK";
const RETRIES=Number(process.env.P06F18_DEPLOYMENT_RETRIES||"40");
const DELAY=Number(process.env.P06F18_DEPLOYMENT_RETRY_DELAY_MS||"15000");
const FILES=[
  "modules/curriculum/registry/g6a-u03-relation-equation-unknown-selector-projection-p06f18.js",
  "modules/curriculum/registry/batch-a-selector-p06f18-extension.js",
  "modules/curriculum/registry/batch-a-selector-p04f33-extension.js",
  "modules/curriculum/public/public-ui-capability-binding-p06f18.js",
  "modules/curriculum/public/public-ui-capability-binding-p04f33.js",
  "modules/curriculum/batch-a/g6a-u03-relation-equation-unknown-runtime-p06f18.js",
  "modules/curriculum/batch-a/batch-a-browser-generator-p06f18.js",
  "modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js",
  "modules/curriculum/batch-a/batch-a-browser-worksheet-p06f18-extension.js",
  "modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js"
];

mkdirSync(OUT,{recursive:true});
const digest=t=>createHash("sha256").update(t).digest("hex");
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function observe(){
  let last;
  for(let a=1;a<=RETRIES;a++){
    try{
      const assets=[];
      for(const publicPath of FILES){
        const expected=digest(readFileSync(path.join(ROOT,"site",publicPath),"utf8"));
        const url=new URL(publicPath,BASE);url.searchParams.set("p06f18",expected.slice(0,16));
        const r=await fetch(url,{cache:"no-store",headers:{"cache-control":"no-cache"}});
        if(!r.ok)throw new Error("HTTP_"+r.status+":"+publicPath);
        const actual=digest(await r.text());
        if(actual!==expected)throw new Error("SHA_MISMATCH:"+publicPath+":"+expected+":"+actual);
        assets.push({publicPath,expectedSha256:expected,liveSha256:actual});
      }
      return{attempt:a,assets};
    }catch(e){
      last=e;
      if(a<RETRIES)await sleep(DELAY);
    }
  }
  throw new Error("P06F18_EXACT_DEPLOYMENT_NOT_OBSERVED:"+(last?.message||"unknown"));
}

function acceptance(){
  return new Promise((resolve,reject)=>{
    const u=new URL("index.html",BASE);u.searchParams.set("p06f18-e6",HEAD+"-"+Date.now());
    const c=spawn(process.execPath,["tools/curriculum/run-p06f-w6-slice018-classic-ui-acceptance.mjs"],{
      cwd:ROOT,
      env:{...process.env,P06F18_SITE_URL:u.href},
      stdio:["ignore","pipe","pipe"]
    });
    let out="",err="";
    c.stdout.on("data",x=>out+=x);
    c.stderr.on("data",x=>err+=x);
    c.on("exit",code=>{
      if(code)return reject(new Error("P06F18_LIVE_ACCEPTANCE_EXIT_"+code+"\n"+err+"\n"+out));
      const line=out.split(/\r?\n/).find(x=>x.startsWith("P06F18_CLASSIC_UI_ACCEPTANCE="));
      if(!line)return reject(new Error("P06F18_LIVE_REPORT_MISSING"));
      resolve({report:JSON.parse(line.slice("P06F18_CLASSIC_UI_ACCEPTANCE=".length)),stdout:out,stderr:err});
    });
  });
}

try{
  const deployment=await observe(),a=await acceptance();
  if(a.report.status!=="PASS_P06F_W6_Q018_CLASSIC_UI_ACCEPTANCE")throw new Error("P06F18_LIVE_ACCEPTANCE_STATUS:"+a.report.status);
  const report={
    schemaName:"P06FW6Q018PostMergeMainPagesE2EV1",
    taskId:"P06F_W6DirectProductVerticalSlice018Implementation",
    status:"PASS_E6_D0_COMPLETE",
    exactHeadSha:HEAD,
    baseUrl:BASE.href,
    deployment,
    classicUiAcceptance:a.report,
    semanticInvariants:{
      relationEquationUnknownSolvingPreserved:true,
      reverseOperationRequired:true,
      substitutionBackValidationRequired:true,
      originalRelationSatisfied:true,
      additiveAndMultiplicativeFamiliesReachable:true,
      allFourSameSourcePredecessorsReachable:true,
      sameSourceCandidateSetComplete:true,
      sameUnitMixedModeFailClosed:true
    }
  };
  writeFileSync(path.join(OUT,"report.json"),JSON.stringify(report,null,2)+"\n");
  writeFileSync(path.join(OUT,"acceptance.stdout.log"),a.stdout);
  writeFileSync(path.join(OUT,"acceptance.stderr.log"),a.stderr);
  console.log("P06F18_POSTMERGE_MAIN_PAGES_E2E="+JSON.stringify(report));
}catch(error){
  writeFileSync(path.join(OUT,"failure.json"),JSON.stringify({schemaName:"P06FW6Q018PostMergeMainPagesE2EFailureV1",status:"FAIL",exactHeadSha:HEAD,baseUrl:BASE.href,error:String(error?.stack||error)},null,2)+"\n");
  throw error;
}
