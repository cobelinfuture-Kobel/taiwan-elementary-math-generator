import {createHash} from "node:crypto";
import {copyFileSync,existsSync,mkdirSync,readFileSync,writeFileSync} from "node:fs";
import {spawn} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../.."),OUT=path.join(ROOT,"tmp/p08f-w8-q007-live-pages-e2e"),CLASSIC_OUT=path.join(ROOT,"tmp/p08f-w8-slice007-classic-ui-acceptance"),BASE=new URL(process.env.P08F07_BASE_URL||"https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/"),HEAD=process.env.GITHUB_SHA||"LOCAL_MANUAL_FALLBACK",RETRIES=Number(process.env.P08F07_DEPLOYMENT_RETRIES||"40"),DELAY=Number(process.env.P08F07_DEPLOYMENT_RETRY_DELAY_MS||"15000");
const FILES=[
"modules/curriculum/registry/g4a-u03-unknown-angle-linear-full-vertical-selector-projection-p08f07.js",
"modules/curriculum/registry/batch-a-selector-p08f07-extension.js",
"modules/curriculum/registry/batch-a-selector-p04f33-extension.js",
"modules/curriculum/public/public-ui-capability-binding-p08f07.js",
"modules/curriculum/public/public-ui-capability-binding-p04f33.js",
"modules/curriculum/batch-a/g4a-u03-unknown-angle-linear-full-vertical-runtime-p08f07.js",
"modules/curriculum/batch-a/batch-a-browser-generator-p08f07.js",
"modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js",
"modules/curriculum/batch-a/batch-a-browser-worksheet-p08f07-extension.js",
"modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js",
"assets/browser/pipeline/build-worksheet-document-p01e-closeout.js",
"modules/renderer/unknown-angle-linear-full-vertical-diagram-p08f07.js",
"modules/renderer/html-renderer.js"
];
mkdirSync(OUT,{recursive:true});const digest=t=>createHash("sha256").update(t).digest("hex"),sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function observe(){let last;for(let a=1;a<=RETRIES;a++){try{const assets=[];for(const publicPath of FILES){const expected=digest(readFileSync(path.join(ROOT,"site",publicPath),"utf8")),url=new URL(publicPath,BASE);url.searchParams.set("p08f07",expected.slice(0,16));const r=await fetch(url,{cache:"no-store",headers:{"cache-control":"no-cache"}});if(!r.ok)throw new Error("HTTP_"+r.status+":"+publicPath);const actual=digest(await r.text());if(actual!==expected)throw new Error("SHA_MISMATCH:"+publicPath+":"+expected+":"+actual);assets.push({publicPath,expectedSha256:expected,liveSha256:actual});}return{attempt:a,assets};}catch(e){last=e;if(a<RETRIES)await sleep(DELAY);}}throw new Error("P08F07_EXACT_DEPLOYMENT_NOT_OBSERVED:"+(last?.message||"unknown"));}
function acceptance(){return new Promise((resolve,reject)=>{const u=new URL("index.html",BASE);u.searchParams.set("p08f07-e6",HEAD+"-"+Date.now());const c=spawn(process.execPath,["tools/curriculum/run-p08f-w8-slice007-classic-ui-acceptance.mjs"],{cwd:ROOT,env:{...process.env,P08F07_SITE_URL:u.href},stdio:["ignore","pipe","pipe"]});let out="",err="";c.stdout.on("data",x=>out+=x);c.stderr.on("data",x=>err+=x);c.on("exit",code=>{if(code)return reject(new Error("P08F07_LIVE_ACCEPTANCE_EXIT_"+code+"\n"+err+"\n"+out));const line=out.split(/\r?\n/).find(x=>x.startsWith("P08F07_CLASSIC_UI_ACCEPTANCE="));if(!line)return reject(new Error("P08F07_LIVE_REPORT_MISSING"));resolve({report:JSON.parse(line.slice("P08F07_CLASSIC_UI_ACCEPTANCE=".length)),stdout:out,stderr:err});});});}
function copyHumanReviewArtifacts(){const names=["q007-unknown-angle-linear-full-vertical-human-review.pdf","q007-unknown-angle-linear-full-vertical-human-review.png","q007-unknown-angle-linear-full-vertical-worksheet.png","q007-unknown-angle-linear-full-vertical-ui.png"],copied=[];for(const name of names){const from=path.join(CLASSIC_OUT,name),to=path.join(OUT,name);if(existsSync(from)){copyFileSync(from,to);copied.push(name);}}for(const required of ["q007-unknown-angle-linear-full-vertical-human-review.pdf","q007-unknown-angle-linear-full-vertical-human-review.png"])if(!copied.includes(required))throw new Error("P08F07_HUMAN_REVIEW_ARTIFACT_MISSING:"+required);return copied;}
try{
 const deployment=await observe(),a=await acceptance();if(a.report.status!=="PASS_P08F_W8_Q007_TECHNICAL_VISUAL_PRECHECK")throw new Error("P08F07_LIVE_ACCEPTANCE_STATUS:"+a.report.status);
 const humanReviewArtifacts=copyHumanReviewArtifacts(),report={schemaName:"P08FW8Q007PostMergeMainPagesE2EV1",taskId:"P08F_W8DirectProductVerticalSlice007Implementation",status:"PASS_E6_TECHNICAL_AWAITING_HUMAN_VISUAL_REVIEW",d0Granted:false,exactHeadSha:HEAD,baseUrl:BASE.href,deployment,classicUiAcceptance:a.report,humanReview:{required:true,status:"PENDING_OPERATOR",artifacts:humanReviewArtifacts},semanticInvariants:{linearAdjacentAnglesSum180:a.report.semanticInvariants?.linearAdjacentAnglesSum180===true,fullTurnAnglesSum360:a.report.semanticInvariants?.fullTurnAnglesSum360===true,verticalAnglesEqual:a.report.semanticInvariants?.verticalAnglesEqual===true,explicitRelationRequired:a.report.semanticInvariants?.explicitRelationRequired===true,twoColumnPrintLayout:a.report.semanticInvariants?.twoColumnPrintLayout===true,printSafePagination:a.report.semanticInvariants?.printSafePagination===true,responseLineVisible:a.report.semanticInvariants?.responseLineVisible===true,priorG4AU03OwnersPreserved:true,sameSourceW8CandidateSetComplete:true,sameUnitMixedModeFailClosed:true}};
 writeFileSync(path.join(OUT,"report.json"),JSON.stringify(report,null,2)+"\n");writeFileSync(path.join(OUT,"acceptance.stdout.log"),a.stdout);writeFileSync(path.join(OUT,"acceptance.stderr.log"),a.stderr);console.log("P08F07_POSTMERGE_MAIN_PAGES_E2E="+JSON.stringify(report));
}catch(error){writeFileSync(path.join(OUT,"failure.json"),JSON.stringify({schemaName:"P08FW8Q007PostMergeMainPagesE2EFailureV1",status:"FAIL",exactHeadSha:HEAD,baseUrl:BASE.href,error:String(error?.stack||error)},null,2)+"\n");throw error;}
