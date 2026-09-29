import {spawn} from "node:child_process";
import {mkdirSync,statSync,writeFileSync} from "node:fs";
import path from "node:path";
import {chromium} from "playwright";

const SOURCE="g6a_u07_6a07";
const KP="kp_g6a_u07_sector_area";
const PRIOR=["kp_g6a_u07_circle_area_derivation","kp_g6a_u07_circle_area_formula","kp_g6a_u07_annulus_area"];
const FUTURE="kp_g6a_u07_composite_circle_area";
const COUNT=16;
const PORT=Number(process.env.P08F19_SITE_PORT??"4369");
const REMOTE=process.env.P08F19_SITE_URL??null;
const BASE=REMOTE??"http://127.0.0.1:"+PORT+"/index.html";
const OUT=path.resolve("tmp/p08f-w8-slice019-classic-ui-acceptance");
mkdirSync(OUT,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let server=null,browser=null,serverOut="",serverErr="";
if(!REMOTE){
  server=spawn(process.execPath,["tools/site/serve-site.js"],{env:{...process.env,SITE_PORT:String(PORT),SITE_HOST:"127.0.0.1"},stdio:["ignore","pipe","pipe"]});
  server.stdout.on("data",c=>serverOut+=c);server.stderr.on("data",c=>serverErr+=c);
}
async function ready(){let last;for(let i=0;i<50;i++){try{const r=await fetch(BASE,{cache:"no-store"});if(r.ok)return;}catch(e){last=e;}await sleep(250);}throw new Error("P08F19_SITE_NOT_READY:"+(last?.message??"unknown"));}
const errors={console:[],page:[],request:[],http:[]};

async function run(){
  const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
  page.on("console",m=>{if(m.type()==="error")errors.console.push(m.text());});
  page.on("pageerror",e=>errors.page.push(String(e?.stack??e)));
  page.on("requestfailed",r=>errors.request.push({url:r.url(),failure:r.failure()?.errorText??"unknown"}));
  page.on("response",r=>{if(r.status()>=400&&(/\.(?:m?js|css)(?:\?|$)/i.test(r.url())||r.url().includes("/modules/")||r.url().includes("/assets/")))errors.http.push({url:r.url(),status:r.status()});});
  const url=new URL(BASE);url.searchParams.set("p08f19",String(Date.now()));
  const response=await page.goto(url.href,{waitUntil:"networkidle",timeout:120000});
  if(!response?.ok())throw new Error("P08F19_MAIN_HTTP:"+(response?.status()??"none"));
  await page.waitForFunction(()=>[...document.querySelectorAll("#batch-a-grade-select option")].some(o=>o.value==="6"),null,{timeout:120000});
  await page.selectOption("#batch-a-grade-select","6");
  await page.waitForFunction(()=>[...document.querySelectorAll("#batch-a-semester-select option")].some(o=>o.value==="upper"),null,{timeout:120000});
  await page.selectOption("#batch-a-semester-select","upper");
  await page.waitForFunction(id=>[...document.querySelectorAll("#batch-a-source-select option")].some(o=>o.value===id),SOURCE,{timeout:120000});
  await page.selectOption("#batch-a-source-select",SOURCE);
  for(const id of [...PRIOR,KP])await page.waitForFunction(x=>Boolean(document.querySelector('#batch-a-knowledge-point-panel [data-knowledge-point-id="'+x+'"]')),id,{timeout:120000});
  const selector=await page.evaluate(({prior,kp,future})=>({
    sourceId:document.querySelector("#batch-a-source-select")?.value,
    summary:document.querySelector("#batch-a-knowledge-point-availability-summary")?.textContent?.trim()??"",
    visibleIds:[...document.querySelectorAll("#batch-a-knowledge-point-panel [data-knowledge-point-id]")].map(n=>n.dataset.knowledgePointId),
    futurePresent:Boolean(document.querySelector('#batch-a-knowledge-point-panel [data-knowledge-point-id="'+future+'"]')),
    sameUnitDisabled:Boolean(document.querySelector('#batch-a-selection-mode-select option[value="mixedKnowledgePointsSameUnit"]')?.disabled),
    prior,kp
  }),{prior:PRIOR,kp:KP,future:FUTURE});
  const sourceVisible=selector.visibleIds.filter(id=>id.startsWith("kp_g6a_u07_"));
  if(selector.sourceId!==SOURCE||![...PRIOR,KP].every(id=>selector.visibleIds.includes(id))||selector.futurePresent||!selector.sameUnitDisabled||sourceVisible.length!==4)throw new Error("P08F19_SELECTOR:"+JSON.stringify(selector));
  await page.selectOption("#batch-a-selection-mode-select","singleKnowledgePoint");
  await page.locator('#batch-a-knowledge-point-panel [data-knowledge-point-id="'+KP+'"]').click();
  await page.waitForFunction(id=>{const s=[...document.querySelectorAll("#batch-a-knowledge-point-panel [data-knowledge-point-id][data-selected='true']")].map(n=>n.dataset.knowledgePointId);return s.length===1&&s[0]===id;},KP,{timeout:120000});
  await page.fill("#batch-a-question-count-input",String(COUNT));await page.dispatchEvent("#batch-a-question-count-input","change");
  await page.selectOption("#batch-a-ordering-select","groupedByPattern");
  await page.check("#batch-a-answer-key-input");
  await page.fill("#columns-input","2");await page.dispatchEvent("#columns-input","change");
  await page.fill("#rows-per-page-input","2");await page.dispatchEvent("#rows-per-page-input","change");
  await page.fill("#generation-seed-input","p08f19-sector-area-human-review");await page.dispatchEvent("#generation-seed-input","change");
  await page.locator("#regenerate-button").click();
  await page.waitForFunction(n=>{const x=document.querySelector("#status-panel")?.textContent??"";return x.includes("已產生 "+n+" 題")||x.includes("產生失敗");},COUNT,{timeout:120000});
  const state=await page.evaluate(()=>({status:document.querySelector("#status-panel")?.textContent?.trim()??"",tone:document.querySelector("#status-panel")?.dataset?.tone??"",valid:document.querySelector("#validation-panel")?.dataset?.hasErrors??null,preview:document.querySelector("#preview-frame")?.srcdoc?.length??0,printDisabled:Boolean(document.querySelector("#print-button")?.disabled)}));
  if(!state.status.includes("已產生 "+COUNT+" 題")||state.tone!=="success"||state.valid!=="false"||state.preview<=0||state.printDisabled)throw new Error("P08F19_GENERATION:"+JSON.stringify(state));
  await page.emulateMedia({media:"print"});
  const frame=await (await page.locator("#preview-frame").elementHandle())?.contentFrame();
  if(!frame)throw new Error("P08F19_PREVIEW_FRAME_MISSING");
  await frame.waitForSelector(".worksheet-document",{timeout:120000});
  const worksheet=await frame.evaluate(()=>{
    const q=[...document.querySelectorAll(".worksheet-cell--question")],a=[...document.querySelectorAll(".worksheet-cell--answer-key")],questionPages=[...document.querySelectorAll(".worksheet-page--questions")],answerPages=[...document.querySelectorAll(".worksheet-page--answer-key")],allPages=[...document.querySelectorAll(".worksheet-page")],prompts=q.map(n=>n.querySelector(".worksheet-cell__prompt")?.textContent??""),text=document.body?.innerText??"";
    const pageMetrics=allPages.map((n,index)=>{const rect=n.getBoundingClientRect(),cells=[...n.querySelectorAll(".worksheet-cell")],clippedCells=cells.filter(cell=>{const x=cell.getBoundingClientRect();return x.top<rect.top-1||x.left<rect.left-1||x.bottom>rect.bottom+1||x.right>rect.right+1;}).length;return{index:index+1,type:n.classList.contains("worksheet-page--questions")?"questions":n.classList.contains("worksheet-page--answer-key")?"answerKey":"other",overflowY:n.scrollHeight-n.clientHeight,overflowX:n.scrollWidth-n.clientWidth,clippedCells,columns:Number(n.querySelector(".worksheet-page__grid")?.style?.getPropertyValue("--worksheet-columns")||0)};});
    const reps=[...document.querySelectorAll('[data-representation="sector-area-diagram-p08f19"]')],svgs=[...document.querySelectorAll(".worksheet-sector-area-diagram-p08f19")],sizes=svgs.map(svg=>{const x=svg.getBoundingClientRect();return{width:x.width,height:x.height};});
    const overlaps=(a,b,pad=1)=>!(a.right+pad<=b.left||b.right+pad<=a.left||a.bottom+pad<=b.top||b.bottom+pad<=a.top);
    const visuals=reps.map(rep=>{
      const svg=rep.querySelector("svg"),labels=[...svg.querySelectorAll("text")].map(n=>(n.textContent??"").trim());
      const collisionNodes=[...svg.querySelectorAll(".sector-area-diagram__measure-label,.sector-area-diagram__angle-label,.sector-area-diagram__center-label,.sector-area-diagram__endpoint-label,.sector-area-diagram__formula-label")];
      const collisionPairs=[];
      for(let i=0;i<collisionNodes.length;i++)for(let j=i+1;j<collisionNodes.length;j++){
        const a=collisionNodes[i].getBoundingClientRect(),b=collisionNodes[j].getBoundingClientRect();
        if(overlaps(a,b))collisionPairs.push([(collisionNodes[i].textContent??"").trim(),(collisionNodes[j].textContent??"").trim()]);
      }
      return{
        contract:rep.dataset.visualContractVersion??"",
        mode:rep.dataset.measurementMode??"",
        centralAngle:Number(rep.dataset.centralAngleDeg??0),
        wholeCircles:svg.querySelectorAll(".sector-area-diagram__whole-circle").length,
        fills:svg.querySelectorAll(".sector-area-diagram__sector-fill").length,
        boundaries:svg.querySelectorAll(".sector-area-diagram__sector-boundary").length,
        angleMarkers:svg.querySelectorAll(".sector-area-diagram__angle-marker").length,
        radiusMeasures:svg.querySelectorAll(".sector-area-diagram__radius").length,
        diameterMeasures:svg.querySelectorAll(".sector-area-diagram__diameter").length,
        labels,
        labelOverlapCount:collisionPairs.length,
        collisionPairs,
        hasABO:["A","B","O"].every(t=>labels.includes(t)),
        hasFormula:labels.some(t=>t.includes("扇形面積＝圓面積×圓心角÷360"))
      };
    });
    const visualContractViolations=visuals.filter(v=>v.contract!=="P08F19_R1"||!["RADIUS","DIAMETER"].includes(v.mode)||!(v.centralAngle>0&&v.centralAngle<=360)||v.wholeCircles!==1||v.fills!==1||v.boundaries!==1||v.angleMarkers!==1||v.labelOverlapCount!==0||!v.hasABO||!v.hasFormula||(v.mode==="RADIUS"?(v.radiusMeasures!==1||v.diameterMeasures!==0):(v.diameterMeasures!==1||v.radiusMeasures!==0))).length;
    return{
      questions:q.length,answers:a.length,representations:reps.length,questionPages:questionPages.length,answerPages:answerPages.length,allPages:allPages.length,
      patternCounts:[prompts.filter(x=>x.includes("半徑是")).length,prompts.filter(x=>x.includes("直徑是")).length],
      overflow:pageMetrics.filter(x=>x.overflowY>1||x.overflowX>1||x.clippedCells>0).length,pageMetrics,
      minDiagramWidth:sizes.length?Math.min(...sizes.map(x=>x.width)):0,minDiagramHeight:sizes.length?Math.min(...sizes.map(x=>x.height)):0,
      nonEmptyAnswers:a.filter(x=>(x.querySelector(".worksheet-cell__answer")?.textContent??"").trim()).length,visualContractViolations,visuals,text
    };
  });
  if(worksheet.questions!==COUNT||worksheet.answers!==COUNT||worksheet.representations!==COUNT*2||worksheet.questionPages!==4||worksheet.answerPages!==4||worksheet.allPages!==8||worksheet.overflow!==0||worksheet.patternCounts.some(n=>n!==COUNT/2)||worksheet.pageMetrics.some(x=>x.columns!==2)||worksheet.minDiagramWidth<200||worksheet.minDiagramHeight<100||worksheet.nonEmptyAnswers!==COUNT||worksheet.visualContractViolations!==0||/kp_g6a_u07_|ps_g6a_u07_|圓環|複合圖形|弧長|牛吃草/.test(worksheet.text))throw new Error("P08F19_WORKSHEET:"+JSON.stringify({...worksheet,text:undefined}));
  await frame.evaluate(()=>{window.__P08F19_PRINT__=0;window.print=()=>window.__P08F19_PRINT__++;});
  await page.locator("#print-button").click();
  const printCount=await frame.evaluate(()=>window.__P08F19_PRINT__??0);
  if(printCount!==1)throw new Error("P08F19_PRINT:"+printCount);
  const reviewHtml=(await frame.content()).replace("<head>",'<head><base href="'+new URL(".",BASE).href+'">');
  const reviewPage=await browser.newPage({viewport:{width:1200,height:1600},deviceScaleFactor:1});
  await reviewPage.setContent(reviewHtml,{waitUntil:"networkidle"});await reviewPage.emulateMedia({media:"print"});
  await reviewPage.screenshot({path:path.join(OUT,"q019-sector-area-human-review.png"),fullPage:true});
  await reviewPage.pdf({path:path.join(OUT,"q019-sector-area-human-review.pdf"),format:"A4",printBackground:true,preferCSSPageSize:true});
  await reviewPage.close();
  await frame.locator(".worksheet-document").screenshot({path:path.join(OUT,"q019-sector-area-worksheet.png"),fullPage:true});
  await page.screenshot({path:path.join(OUT,"q019-sector-area-ui.png"),fullPage:true});
  await page.close();
  return{kpId:KP,selector,state,worksheet:{questions:worksheet.questions,answers:worksheet.answers,representations:worksheet.representations,questionPages:worksheet.questionPages,answerPages:worksheet.answerPages,allPages:worksheet.allPages,patternCounts:worksheet.patternCounts,overflow:worksheet.overflow,minDiagramWidth:worksheet.minDiagramWidth,minDiagramHeight:worksheet.minDiagramHeight,nonEmptyAnswers:worksheet.nonEmptyAnswers,visualContractViolations:worksheet.visualContractViolations,visualContractVersion:"P08F19_R1"},printCount,humanReviewArtifacts:{pdf:"q019-sector-area-human-review.pdf",png:"q019-sector-area-human-review.png",worksheet:"q019-sector-area-worksheet.png",ui:"q019-sector-area-ui.png",pdfBytes:statSync(path.join(OUT,"q019-sector-area-human-review.pdf")).size,pngBytes:statSync(path.join(OUT,"q019-sector-area-human-review.png")).size,status:"PENDING_OPERATOR_REVIEW"}};
}

try{
  await ready();browser=await chromium.launch({headless:true});const target=await run();
  if(Object.values(errors).some(x=>x.length))throw new Error("P08F19_BROWSER_DIAGNOSTICS:"+JSON.stringify(errors));
  const report={
    schemaName:"P08FW8Q019ClassicUIAcceptanceV1",taskId:"P08F_W8DirectProductVerticalSlice019Implementation",
    status:"PASS_P08F_W8_Q019_TECHNICAL_VISUAL_PRECHECK",learnerVisualAcceptanceStatus:"PENDING_OPERATOR_ACTUAL_PRINT_HUMAN_REVIEW",d0Granted:false,
    sourceId:SOURCE,knowledgePointIds:[KP],questionCount:COUNT,target,humanReview:{required:true,status:"PENDING_OPERATOR",artifacts:[target.humanReviewArtifacts]},
    browser:{consoleErrorCount:0,pageErrorCount:0,requestFailureCount:0,assetHttpFailureCount:0},
    semanticInvariants:{sectorAreaAsCircleAreaTimesAngleFraction:true,fullCircle360Degrees:true,visualContractVersion:"P08F19_R1",sectorHighlighted:true,wholeCircleReferenceVisible:true,centralAngleMarkerVisible:true,radiusAndDiameterModesSeparated:true,priorCircleAreaOwnersPreserved:true,futureCompositeCircleAreaProtected:true,twoColumnTwoRowPrintLayout:true,printSafePagination:true,noInternalIds:true},
    forbiddenScope:{circleAreaDerivationReownership:false,circleAreaFormulaReownership:false,annulusAreaReownership:false,compositeCircleArea:false,arcLengthOrPerimeter:false,application:false,sameUnitMixed:false,crossUnitMixed:false,q020OrLater:false,fullRepositoryRegression:false,globalBrowserReplay:false}
  };
  writeFileSync(path.join(OUT,"report.json"),JSON.stringify(report,null,2)+"\n");
  console.log("P08F19_CLASSIC_UI_ACCEPTANCE="+JSON.stringify(report));
}catch(error){
  writeFileSync(path.join(OUT,"failure.json"),JSON.stringify({schemaName:"P08FW8Q019ClassicUIAcceptanceFailureV1",status:"FAIL",baseUrl:BASE,error:String(error?.stack??error),browser:errors,server:{stdout:serverOut,stderr:serverErr}},null,2)+"\n");
  throw error;
}finally{if(browser)await browser.close().catch(()=>{});if(server&&!server.killed)server.kill("SIGTERM");}
