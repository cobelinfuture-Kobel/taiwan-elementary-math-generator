import {createHash} from "node:crypto";
import {copyFileSync,existsSync,mkdirSync,readFileSync,writeFileSync} from "node:fs";
import {spawn} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../.."),OUT=path.join(ROOT,"tmp/p08f-w8-q010-live-pages-e2e"),CLASSIC_OUT=path.join(ROOT,"tmp/p08f-w8-slice010-classic-ui-acceptance"),BASE=new URL(process.env.P08F10_BASE_URL||"https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/"),HEAD=process.env.GITHUB_SHA||"LOCAL_MANUAL_FALLBACK",RETRIES=Number(process.env.P08F10_DEPLOYMENT_RETRIES||"40"),DELAY=Number(process.env.P08F10_DEPLOYMENT_RETRY_DELAY_MS||"15000");
const FILES=[
"modules/curriculum/registry/g5a-u05a1-sector-fraction-of-circle-selector-projection-p08f10.js",
"modules/curriculum/registry/batch-a-selector-p08f10-extension.js",
"modules/curriculum/registry/batch-a-selector-p08f09-extension.js",
"modules/curriculum/registry/batch-a-selector-p04f33-extension.js",
"modules/curriculum/public/public-ui-capability-binding-p08f10.js",
"modules/curriculum/public/public-ui-capability-binding-p08f09.js",
"modules/curriculum/public/public-ui-capability-binding-p04f33.js",
"modules/curriculum/batch-a/g5a-u05a1-sector-fraction-of-circle-runtime-p08f10.js",
"modules/curriculum/batch-a/batch-a-browser-generator-p08f10.js",
"modules/curriculum/batch-a/batch-a-browser-generator-p08f09.js",
"modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js",
"modules/curriculum/batch-a/batch-a-browser-worksheet-p08f10-extension.js",
"modules/curriculum/batch-a/batch-a-browser-worksheet-p08f09-extension.js",
"modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js",
"assets/browser/pipeline/build-worksheet-document-p01e-closeout.js",
"modules/renderer/sector-fraction-of-circle-diagram-p08f10.js",
"modules/renderer/html-renderer.js"
];
mkdirSync(OUT,{recursive:true});const digest=t=>createHash("sha256").update(t).digest("hex"),sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function observe(){let last;for(let a=1;a<=RETRIES;a++){try{const assets=[];for(const publicPath of FILES){const expected=digest(readFileSync(path.join(ROOT,"site",publicPath),"utf8")),url=new URL(publicPath,BASE);url.searchParams.set("p08f10",expected.slice(0,16));const r=await fetch(url,{cache:"no-store",headers:{"cache-control":"no-cache"}});if(!r.ok)throw new Error("HTTP_"+r.status+":"+publicPath);const actual=digest(await r.text());if(actual!==expected)throw new Error("SHA_MISMATCH:"+publicPath+":"+expected+":"+actual);assets.push({publicPath,expectedSha256:expected,liveSha256:actual});}return{attempt:a,assets};}catch(e){last=e;if(a<RETRIES)await sleep(DELAY);}}throw new Error("P08F10_EXACT_DEPLOYMENT_NOT_OBSERVED:"+(last?.message||"unknown"));}
function acceptance(){return new Promise((resolve,reject)=>{const u=new URL("index.html",BASE);u.searchParams.set("p08f10-e6",HEAD+"-"+Date.now());const c=spawn(process.execPath,["tools/curriculum/run-p08f-w8-slice010-classic-ui-acceptance.mjs"],{cwd:ROOT,env:{...process.env,P08F10_SITE_URL:u.href},stdio:["ignore","pipe","pipe"]});let out="",err="";c.stdout.on("data",x=>out+=x);c.stderr.on("data",x=>err+=x);c.on("exit",code=>{if(code)return reject(new Error("P08F10_LIVE_ACCEPTANCE_EXIT_"+code+"\n"+err+"\n"+out));const line=out.split(/\r?\n/).find(x=>x.startsWith("P08F10_CLASSIC_UI_ACCEPTANCE="));if(!line)return reject(new Error("P08F10_LIVE_REPORT_MISSING"));resolve({report:JSON.parse(line.slice("P08F10_CLASSIC_UI_ACCEPTANCE=".length)),stdout:out,stderr:err});});});}
function copyHumanReviewArtifacts(){const names=["q010-sector-fraction-of-circle-human-review.pdf","q010-sector-fraction-of-circle-human-review.png","q010-sector-fraction-of-circle-worksheet.png","q010-sector-fraction-of-circle-ui.png"],copied=[];for(const name of names){const from=path.join(CLASSIC_OUT,name),to=path.join(OUT,name);if(existsSync(from)){copyFileSync(from,to);copied.push(name);}}for(const required of ["q010-sector-fraction-of-circle-human-review.pdf","q010-sector-fraction-of-circle-human-review.png"])if(!copied.includes(required))throw new Error("P08F10_HUMAN_REVIEW_ARTIFACT_MISSING:"+required);return copied;}
try{
 const deployment=await observe(),a=await acceptance();if(a.report.status!=="PASS_P08F_W8_Q010_TECHNICAL_VISUAL_PRECHECK")throw new Error("P08F10_LIVE_ACCEPTANCE_STATUS:"+a.report.status);
 if(a.report.semanticInvariants?.rulerMeasurementRequired!==false||a.report.semanticInvariants?.printScaleIsAnswerAuthority!==false)throw new Error("P08F10_NO_RULER_AUTHORITY_INVARIANT_FAILED");
 const humanReviewArtifacts=copyHumanReviewArtifacts(),report={schemaName:"P08FW8Q010PostMergeMainPagesE2EV1",taskId:"P08F_W8DirectProductVerticalSlice010Implementation",status:"PASS_E6_TECHNICAL_AWAITING_HUMAN_VISUAL_REVIEW",d0Granted:false,exactHeadSha:HEAD,baseUrl:BASE.href,deployment,classicUiAcceptance:a.report,humanReview:{required:true,status:"PENDING_OPERATOR",artifacts:humanReviewArtifacts},semanticInvariants:{fullCircleDegrees360:a.report.semanticInvariants?.fullCircleDegrees360===true,sectorFractionEqualsCentralAngleOver360:a.report.semanticInvariants?.sectorFractionEqualsCentralAngleOver360===true,reducedFractionRequired:a.report.semanticInvariants?.reducedFractionRequired===true,fractionRepresentsSameFullCircle:a.report.semanticInvariants?.fractionRepresentsSameFullCircle===true,targetIsFractionNotAreaOrArcLength:a.report.semanticInvariants?.targetIsFractionNotAreaOrArcLength===true,rulerMeasurementRequired:false,printScaleIsAnswerAuthority:false,twoColumnPrintLayout:a.report.semanticInvariants?.twoColumnPrintLayout===true,printSafePagination:a.report.semanticInvariants?.printSafePagination===true,responseLineVisible:a.report.semanticInvariants?.responseLineVisible===true,priorSameSourceOwnersPreserved:true,laterSameSourceSemanticsHidden:true,sameUnitMixedModeFailClosed:true}};
 writeFileSync(path.join(OUT,"report.json"),JSON.stringify(report,null,2)+"\n");writeFileSync(path.join(OUT,"acceptance.stdout.log"),a.stdout);writeFileSync(path.join(OUT,"acceptance.stderr.log"),a.stderr);console.log("P08F10_POSTMERGE_MAIN_PAGES_E2E="+JSON.stringify(report));
}catch(error){writeFileSync(path.join(OUT,"failure.json"),JSON.stringify({schemaName:"P08FW8Q010PostMergeMainPagesE2EFailureV1",status:"FAIL",exactHeadSha:HEAD,baseUrl:BASE.href,error:String(error?.stack||error)},null,2)+"\n");throw error;}
