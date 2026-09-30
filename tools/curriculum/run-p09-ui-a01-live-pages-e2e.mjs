import {createHash} from "node:crypto";
import {copyFileSync,existsSync,mkdirSync,readFileSync,writeFileSync} from "node:fs";
import {spawn} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const OUT=path.join(ROOT,"tmp/p09-ui-a01-live-pages-e2e");
const BASE=new URL(process.env.P09_A01_BASE_URL||"https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/");
const HEAD=process.env.GITHUB_SHA||"LOCAL_MANUAL_FALLBACK";
const RETRIES=Number(process.env.P09_A01_DEPLOYMENT_RETRIES||"60");
const DELAY=Number(process.env.P09_A01_DEPLOYMENT_RETRY_DELAY_MS||"15000");
const FILES=["modules/curriculum/batch-a/source-units.js"];
mkdirSync(OUT,{recursive:true});
const digest=t=>createHash("sha256").update(t).digest("hex");
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function observe(){
  let last;
  for(let attempt=1;attempt<=RETRIES;attempt++){
    try{
      const assets=[];
      for(const publicPath of FILES){
        const expected=digest(readFileSync(path.join(ROOT,"site",publicPath),"utf8"));
        const url=new URL(publicPath,BASE);
        url.searchParams.set("p09-a01",expected.slice(0,16));
        const response=await fetch(url,{cache:"no-store",headers:{"cache-control":"no-cache","pragma":"no-cache"}});
        if(!response.ok)throw new Error("HTTP_"+response.status+":"+publicPath);
        const actual=digest(await response.text());
        if(actual!==expected)throw new Error("SHA_MISMATCH:"+publicPath+":"+expected+":"+actual);
        assets.push({publicPath,expectedSha256:expected,liveSha256:actual});
      }
      return{attempt,assets};
    }catch(error){
      last=error;
      if(attempt<RETRIES)await sleep(DELAY);
    }
  }
  throw new Error("P09_A01_EXACT_DEPLOYMENT_NOT_OBSERVED:"+(last?.message||"unknown"));
}
function acceptance(){
  return new Promise((resolve,reject)=>{
    const url=new URL("index.html",BASE);
    url.searchParams.set("p09-a01-e6",HEAD+"-"+Date.now());
    const childOut=path.join(ROOT,"tmp/p09-ui-a01-classic-ui-acceptance");
    const child=spawn(process.execPath,["tools/curriculum/run-p09-ui-a01-classic-ui-acceptance.mjs"],{
      cwd:ROOT,
      env:{...process.env,P09_A01_SITE_URL:url.href,P09_A01_LIVE_CACHE_TOKEN:HEAD},
      stdio:["ignore","pipe","pipe"]
    });
    let stdout="",stderr="";
    child.stdout.on("data",x=>stdout+=x);
    child.stderr.on("data",x=>stderr+=x);
    child.on("exit",code=>{
      writeFileSync(path.join(OUT,"acceptance.stdout.log"),stdout);
      writeFileSync(path.join(OUT,"acceptance.stderr.log"),stderr);
      if(code){
        let childFailure=null;
        const p=path.join(childOut,"failure.json");
        if(existsSync(p)){copyFileSync(p,path.join(OUT,"acceptance.failure.json"));try{childFailure=JSON.parse(readFileSync(p,"utf8"));}catch{}}
        const error=new Error("P09_A01_LIVE_ACCEPTANCE_EXIT_"+code+"\n"+stderr+"\n"+stdout);
        error.childFailure=childFailure;
        return reject(error);
      }
      const line=stdout.split(/\r?\n/).find(x=>x.startsWith("P09_A01_CLASSIC_UI_ACCEPTANCE="));
      if(!line)return reject(new Error("P09_A01_LIVE_REPORT_MISSING"));
      resolve({report:JSON.parse(line.slice("P09_A01_CLASSIC_UI_ACCEPTANCE=".length)),stdout,stderr});
    });
  });
}
try{
  const deployment=await observe();
  const a=await acceptance();
  if(a.report.status!=="PASS_P09_UI_A01_CLASSIC_UI_ACCEPTANCE")throw new Error("P09_A01_LIVE_ACCEPTANCE_STATUS:"+a.report.status);
  const report={
    schemaName:"P09UIA01PostMergeMainPagesE2EV1",
    taskId:"P09_UI_A01_CurrentPublicInventoryParityRepair_76To79Sources_480To482KPs_AndDeployedSourceDropdownRecovery",
    status:"PASS_P09_UI_A01_SOURCE_PROVIDER_E6_COMPLETE",
    exactHeadSha:HEAD,
    baseUrl:BASE.href,
    deployment,
    classicUiAcceptance:a.report,
    remainingBlocker:{
      canonicalKnowledgePointProductAdmissionGap:2,
      knowledgePointIds:["kp_g3a_u08_whole_as_fraction","kp_g3a_u08_unlike_denominator_comparison_limit"],
      disposition:"SEPARATE_PRODUCT_ADMISSION_REQUIRED"
    }
  };
  writeFileSync(path.join(OUT,"report.json"),JSON.stringify(report,null,2)+"\n");
  console.log("P09_A01_POSTMERGE_MAIN_PAGES_E2E="+JSON.stringify(report));
}catch(error){
  writeFileSync(path.join(OUT,"failure.json"),JSON.stringify({
    schemaName:"P09UIA01PostMergeMainPagesE2EFailureV1",
    status:"FAIL",
    exactHeadSha:HEAD,
    baseUrl:BASE.href,
    error:String(error?.stack||error),
    childFailure:error?.childFailure||null
  },null,2)+"\n");
  throw error;
}
