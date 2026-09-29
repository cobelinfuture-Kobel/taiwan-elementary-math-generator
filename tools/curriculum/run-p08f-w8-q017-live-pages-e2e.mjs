import {createHash} from "node:crypto";
import {copyFileSync,existsSync,mkdirSync,readFileSync,writeFileSync} from "node:fs";
import {spawn} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";

const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,"../.."),OUTPUT=path.resolve(ROOT,"tmp/p08f-w8-q017-live-pages-e2e"),CLASSIC_OUT=path.resolve(ROOT,"tmp/p08f-w8-slice017-classic-ui-acceptance"),BASE_URL=new URL(process.env.P08F17_BASE_URL??"https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/"),EXACT_HEAD_SHA=process.env.GITHUB_SHA??"LOCAL_MANUAL_FALLBACK",RETRIES=Number(process.env.P08F17_DEPLOYMENT_RETRIES??"30"),DELAY=Number(process.env.P08F17_DEPLOYMENT_RETRY_DELAY_MS??"15000");
const ASSETS=[
  ["site/modules/curriculum/registry/g6a-u06-composite-arc-perimeter-selector-projection-p08f17.js","modules/curriculum/registry/g6a-u06-composite-arc-perimeter-selector-projection-p08f17.js"],
  ["site/modules/curriculum/registry/batch-a-selector-p08f17-extension.js","modules/curriculum/registry/batch-a-selector-p08f17-extension.js"],
  ["site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js","modules/curriculum/registry/batch-a-selector-p04f33-extension.js"],
  ["site/modules/curriculum/public/public-ui-capability-binding-p08f17.js","modules/curriculum/public/public-ui-capability-binding-p08f17.js"],
  ["site/modules/curriculum/public/public-ui-capability-binding-p04f33.js","modules/curriculum/public/public-ui-capability-binding-p04f33.js"],
  ["site/modules/curriculum/batch-a/g6a-u06-composite-arc-perimeter-runtime-p08f17.js","modules/curriculum/batch-a/g6a-u06-composite-arc-perimeter-runtime-p08f17.js"],
  ["site/modules/curriculum/batch-a/batch-a-browser-generator-p08f17.js","modules/curriculum/batch-a/batch-a-browser-generator-p08f17.js"],
  ["site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js","modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js"],
  ["site/modules/curriculum/batch-a/batch-a-browser-worksheet-p08f17-extension.js","modules/curriculum/batch-a/batch-a-browser-worksheet-p08f17-extension.js"],
  ["site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js","modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js"],
  ["site/modules/renderer/composite-arc-perimeter-diagram-p08f17.js","modules/renderer/composite-arc-perimeter-diagram-p08f17.js"],
  ["site/modules/renderer/html-renderer.js","modules/renderer/html-renderer.js"],
  ["site/assets/browser/pipeline/build-worksheet-document-p01e-closeout.js","assets/browser/pipeline/build-worksheet-document-p01e-closeout.js"]
];
mkdirSync(OUTPUT,{recursive:true});
const sha=t=>createHash("sha256").update(t).digest("hex"),sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function fetchText(url){const r=await fetch(url,{cache:"no-store",headers:{"cache-control":"no-cache"}});if(!r.ok)throw new Error("HTTP_"+r.status+":"+url);return r.text();}
async function waitForExact(){
  let last;
  for(let attempt=1;attempt<=RETRIES;attempt++){
    try{
      const rows=[];
      for(const[repoPath,publicPath]of ASSETS){
        const local=readFileSync(path.join(ROOT,repoPath),"utf8"),expected=sha(local),url=new URL(publicPath,BASE_URL);
        url.searchParams.set("p08f17",expected.slice(0,16));
        const live=await fetchText(url),actual=sha(live);
        if(actual!==expected)throw new Error(publicPath+":expected="+expected+":actual="+actual);
        rows.push({repoPath,publicUrl:new URL(publicPath,BASE_URL).href,expectedSha256:expected,liveSha256:actual});
      }
      return{attempt,assets:rows};
    }catch(e){last=e;if(attempt<RETRIES)await sleep(DELAY);}
  }
  throw new Error("P08F17_EXACT_DEPLOYMENT_NOT_OBSERVED:"+(last?.message??"unknown"));
}
function runAcceptance(){
  return new Promise((resolve,reject)=>{
    const url=new URL("index.html",BASE_URL);url.searchParams.set("p08f17-e6",EXACT_HEAD_SHA+"-"+Date.now());
    const child=spawn(process.execPath,["tools/curriculum/run-p08f-w8-slice017-classic-ui-acceptance.mjs"],{cwd:ROOT,env:{...process.env,P08F17_SITE_URL:url.href},stdio:["ignore","pipe","pipe"]});
    let out="",err="";child.stdout.on("data",c=>out+=c);child.stderr.on("data",c=>err+=c);
    child.on("exit",code=>{
      if(code!==0)return reject(new Error("P08F17_LIVE_ACCEPTANCE_EXIT_"+code+"\n"+err+"\n"+out));
      const line=out.split(/\r?\n/).find(x=>x.startsWith("P08F17_CLASSIC_UI_ACCEPTANCE="));
      if(!line)return reject(new Error("P08F17_LIVE_REPORT_MISSING\n"+out));
      try{resolve({report:JSON.parse(line.slice("P08F17_CLASSIC_UI_ACCEPTANCE=".length)),stdout:out,stderr:err});}catch(e){reject(e);}
    });
  });
}
function copyHumanReviewArtifacts(){
  const names=["q017-composite-arc-perimeter-human-review.pdf","q017-composite-arc-perimeter-human-review.png","q017-composite-arc-perimeter-worksheet.png","q017-composite-arc-perimeter-ui.png"],copied=[];
  for(const name of names){const from=path.join(CLASSIC_OUT,name),to=path.join(OUTPUT,name);if(existsSync(from)){copyFileSync(from,to);copied.push(name);}}
  for(const required of ["q017-composite-arc-perimeter-human-review.pdf","q017-composite-arc-perimeter-human-review.png"])if(!copied.includes(required))throw new Error("P08F17_HUMAN_REVIEW_ARTIFACT_MISSING:"+required);
  return copied;
}
try{
  const deployment=await waitForExact(),acceptance=await runAcceptance();
  if(acceptance.report.status!=="PASS_P08F_W8_Q017_TECHNICAL_VISUAL_PRECHECK")throw new Error("P08F17_LIVE_ACCEPTANCE_STATUS:"+acceptance.report.status);
  const humanReviewArtifacts=copyHumanReviewArtifacts(),report={schemaName:"P08FW8Q017PostMergeMainPagesE2EV1",taskId:"P08F_W8DirectProductVerticalSlice017Implementation",status:"PASS_E6_TECHNICAL_AWAITING_HUMAN_VISUAL_REVIEW",d0Granted:false,exactHeadSha:EXACT_HEAD_SHA,baseUrl:BASE_URL.href,deployment,classicUiAcceptance:acceptance.report,humanReview:{required:true,status:"PENDING_OPERATOR",artifacts:humanReviewArtifacts},semanticInvariants:{externalBoundaryOnly:true,internalSharedEdgesExcluded:true,straightBoundaryAndArcSummation:true,visualContractVersion:"P08F17_R2",sectorAnglesUnambiguous:true,sectorEndpointsVisible:true,stadiumAndRectProportionalGeometry:true,doubleBumpOutwardSideBinding:true,sharedDiameterRenderingVerified:true,priorCircumferenceOwnersPreserved:true,priorSectorArcOwnerPreserved:true,twoColumnPrintLayout:true,printSafePagination:true,noInternalIds:true},forbiddenScope:{sectorArea:false,compositeCircleArea:false,application:false,sameUnitMixed:false,crossUnitMixed:false,q018OrLater:false,fullRepositoryRegression:false,globalBrowserReplay:false}};
  writeFileSync(path.join(OUTPUT,"report.json"),JSON.stringify(report,null,2)+"\n");writeFileSync(path.join(OUTPUT,"acceptance.stdout.log"),acceptance.stdout);writeFileSync(path.join(OUTPUT,"acceptance.stderr.log"),acceptance.stderr);
  console.log("P08F17_POSTMERGE_MAIN_PAGES_E2E="+JSON.stringify(report));
}catch(error){
  writeFileSync(path.join(OUTPUT,"failure.json"),JSON.stringify({schemaName:"P08FW8Q017PostMergeMainPagesE2EFailureV1",status:"FAIL",exactHeadSha:EXACT_HEAD_SHA,baseUrl:BASE_URL.href,error:String(error?.stack??error)},null,2)+"\n");
  throw error;
}
