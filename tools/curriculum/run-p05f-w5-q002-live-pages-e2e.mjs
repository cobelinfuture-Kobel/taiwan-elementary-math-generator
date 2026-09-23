import {createHash} from "node:crypto";
import {mkdirSync,readFileSync,writeFileSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright";

const HERE=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(HERE,"../..");
const DEFAULT_BASE_URL="https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/";
const OUTPUT=path.resolve(ROOT,"tmp/p05f-w5-q002-live-pages-e2e");
const EXACT_MERGE_SHA="e7c35eb7779ed2881330b527227eb0ea45f09be7";
const EXACT_PAGES_RUN_ID=33884662896;
const SOURCE_ID="g3a_u09_3a09";
const KP_ID="kp_circle_center_radius_diameter";
const GROUP_ID="pg_g3a_u09_circle_parts_identification";
const SPEC_IDS=Object.freeze([
  "ps_g3a_u09_identify_circle_center",
  "ps_g3a_u09_identify_radius",
  "ps_g3a_u09_identify_diameter",
  "ps_g3a_u09_match_circle_part_label_to_diagram",
  "ps_g3a_u09_distinguish_diameter_from_noncenter_segment",
]);
const QUESTION_COUNT=24;
const GENERATION_SEED="p05f-w5-q002-postmerge-pages-e2e";
const FORBIDDEN_TERMS=["圓周","圓規","弦","相切","外切","內切"];
const ASSETS=[
  ["site/modules/curriculum/registry/g3a-u09-circle-parts-selector-projection-p05f2.js","modules/curriculum/registry/g3a-u09-circle-parts-selector-projection-p05f2.js"],
  ["site/modules/curriculum/registry/batch-a-selector-p05f2-extension.js","modules/curriculum/registry/batch-a-selector-p05f2-extension.js"],
  ["site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js","modules/curriculum/registry/batch-a-selector-p04f33-extension.js"],
  ["site/modules/curriculum/public/public-ui-capability-binding-p05f2.js","modules/curriculum/public/public-ui-capability-binding-p05f2.js"],
  ["site/modules/curriculum/public/public-ui-capability-binding-p04f33.js","modules/curriculum/public/public-ui-capability-binding-p04f33.js"],
  ["site/modules/curriculum/batch-a/g3a-u09-circle-parts-runtime-p05f2.js","modules/curriculum/batch-a/g3a-u09-circle-parts-runtime-p05f2.js"],
  ["site/modules/curriculum/batch-a/batch-a-browser-generator-p05f2.js","modules/curriculum/batch-a/batch-a-browser-generator-p05f2.js"],
  ["site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f2-extension.js","modules/curriculum/batch-a/batch-a-browser-worksheet-p05f2-extension.js"],
  ["site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js","modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js"],
  ["site/assets/browser/state/config-state.js","assets/browser/state/config-state.js"],
  ["site/modules/renderer/circle-parts-diagram.js","modules/renderer/circle-parts-diagram.js"],
  ["site/modules/renderer/html-renderer.js","modules/renderer/html-renderer.js"],
];

function arg(name,fallback){const prefix=`--${name}=`;return process.argv.find(v=>v.startsWith(prefix))?.slice(prefix.length)??fallback;}
function sha256(text){return createHash("sha256").update(text).digest("hex");}
function sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
function parseLayout(meta){
  const q=String(meta).match(/題目\s*(\d+)\s*欄\s*[×x]\s*(\d+)\s*列/);
  const a=String(meta).match(/答案\s*(\d+)\s*欄\s*[×x]\s*(\d+)\s*列/);
  return q&&a?{questionColumns:Number(q[1]),questionRows:Number(q[2]),answerColumns:Number(a[1]),answerRows:Number(a[2])}:null;
}

const baseUrl=new URL(arg("base-url",process.env.P05F2_BASE_URL??DEFAULT_BASE_URL));
const retryCount=Number(arg("deployment-retries",process.env.P05F2_DEPLOYMENT_RETRIES??"20"));
const retryDelay=Number(arg("deployment-retry-delay-ms",process.env.P05F2_DEPLOYMENT_RETRY_DELAY_MS??"15000"));
mkdirSync(OUTPUT,{recursive:true});

async function fetchText(url){
  const response=await fetch(url,{cache:"no-store",headers:{"cache-control":"no-cache"}});
  if(!response.ok)throw new Error(`HTTP_${response.status}:${url}`);
  return response.text();
}

async function waitForExactDeployment(){
  let lastError=null;
  for(let attempt=1;attempt<=retryCount;attempt+=1){
    try{
      const assets=[];
      for(const [repoPath,publicPath] of ASSETS){
        const localText=readFileSync(path.resolve(ROOT,repoPath),"utf8");
        const expectedSha256=sha256(localText);
        const url=new URL(publicPath,baseUrl);
        url.searchParams.set("p05f2-sha",expectedSha256.slice(0,16));
        const liveText=await fetchText(url);
        const liveSha256=sha256(liveText);
        if(liveSha256!==expectedSha256)throw new Error(`${publicPath}:expected=${expectedSha256}:actual=${liveSha256}`);
        assets.push({repoPath,publicUrl:new URL(publicPath,baseUrl).href,expectedSha256,liveSha256});
      }
      return{attempt,assets};
    }catch(error){
      lastError=error;
      if(attempt<retryCount)await sleep(retryDelay);
    }
  }
  throw new Error(`P05F2_EXACT_DEPLOYMENT_NOT_OBSERVED:${lastError?.message??"unknown"}`);
}

const consoleErrors=[],pageErrors=[],requestFailures=[],assetHttpFailures=[];
let browser=null;
let deployment=null;
try{
  deployment=await waitForExactDeployment();
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
  page.on("console",message=>{if(message.type()==="error")consoleErrors.push(message.text());});
  page.on("pageerror",error=>pageErrors.push(String(error?.stack??error)));
  page.on("requestfailed",request=>requestFailures.push({url:request.url(),failure:request.failure()?.errorText??"unknown"}));
  page.on("response",response=>{if(response.status()>=400&&(/\.(?:m?js|css)(?:\?|$)/i.test(response.url())||response.url().includes("/assets/")||response.url().includes("/modules/")))assetHttpFailures.push({url:response.url(),status:response.status()});});

  const liveUrl=new URL("index.html",baseUrl);liveUrl.searchParams.set("p05f2-postmerge",String(Date.now()));
  const response=await page.goto(liveUrl.href,{waitUntil:"networkidle",timeout:120000});
  if(!response?.ok())throw new Error(`P05F2_LIVE_MAIN_RESPONSE_FAILED:${response?.status()??"none"}`);

  await page.waitForFunction(()=>[...document.querySelectorAll("#batch-a-grade-select option")].some(o=>o.value==="3"),null,{timeout:120000});
  await page.selectOption("#batch-a-grade-select","3");
  await page.waitForFunction(()=>[...document.querySelectorAll("#batch-a-semester-select option")].some(o=>o.value==="upper"),null,{timeout:120000});
  await page.selectOption("#batch-a-semester-select","upper");
  await page.waitForFunction(sourceId=>[...document.querySelectorAll("#batch-a-source-select option")].some(o=>o.value===sourceId),SOURCE_ID,{timeout:120000});
  await page.selectOption("#batch-a-source-select",SOURCE_ID);
  await page.waitForFunction(sourceId=>document.querySelector("#batch-a-source-select")?.value===sourceId,SOURCE_ID,{timeout:120000});
  await page.waitForFunction(kpId=>Boolean(document.querySelector(`[data-knowledge-point-id="${kpId}"]`)),KP_ID,{timeout:120000});
  await page.selectOption("#batch-a-selection-mode-select","singleKnowledgePoint");
  await page.locator(`[data-knowledge-point-id="${KP_ID}"]`).click();
  await page.waitForFunction(kpId=>document.querySelector(`[data-knowledge-point-id="${kpId}"]`)?.dataset?.selected==="true",KP_ID,{timeout:120000});
  await page.fill("#batch-a-question-count-input",String(QUESTION_COUNT));await page.dispatchEvent("#batch-a-question-count-input","change");
  await page.selectOption("#batch-a-ordering-select","groupedByPattern");
  await page.fill("#generation-seed-input",GENERATION_SEED);await page.dispatchEvent("#generation-seed-input","change");
  await page.check("#batch-a-answer-key-input");
  await page.fill("#columns-input","2");await page.dispatchEvent("#columns-input","change");
  await page.fill("#rows-per-page-input","4");await page.dispatchEvent("#rows-per-page-input","change");

  const selector=await page.evaluate(kpId=>({
    grade:document.querySelector("#batch-a-grade-select")?.value??null,
    semester:document.querySelector("#batch-a-semester-select")?.value??null,
    sourceId:document.querySelector("#batch-a-source-select")?.value??null,
    selectionMode:document.querySelector("#batch-a-selection-mode-select")?.value??null,
    selectedKnowledgePointIds:[...document.querySelectorAll("[data-knowledge-point-id][data-selected='true']")].map(n=>n.dataset.knowledgePointId),
    selectedPatternGroupIds:[...document.querySelectorAll("[data-pattern-group-id][data-selected='true']")].map(n=>n.dataset.patternGroupId),
    questionCount:document.querySelector("#batch-a-question-count-input")?.value??null,
    ordering:document.querySelector("#batch-a-ordering-select")?.value??null,
    answerKey:Boolean(document.querySelector("#batch-a-answer-key-input")?.checked),
    generationSeed:document.querySelector("#generation-seed-input")?.value??null,
    columns:document.querySelector("#columns-input")?.value??null,
    rowsPerPage:document.querySelector("#rows-per-page-input")?.value??null,
    availabilitySummary:document.querySelector("#batch-a-knowledge-point-availability-summary")?.textContent?.trim()??"",
    targetSelected:document.querySelector(`[data-knowledge-point-id="${kpId}"]`)?.dataset?.selected==="true",
  }),KP_ID);
  const selectorPass=selector.grade==="3"&&selector.semester==="upper"&&selector.sourceId===SOURCE_ID&&selector.selectionMode==="singleKnowledgePoint"&&selector.selectedKnowledgePointIds.length===1&&selector.selectedKnowledgePointIds[0]===KP_ID&&selector.questionCount===String(QUESTION_COUNT)&&selector.ordering==="groupedByPattern"&&selector.answerKey===true&&selector.generationSeed===GENERATION_SEED&&selector.columns==="2"&&selector.rowsPerPage==="4"&&selector.targetSelected&&selector.availabilitySummary.includes("可選知識點：1")&&selector.availabilitySummary.includes("尚未開放：3")&&selector.availabilitySummary.includes("不可選：3")&&selector.availabilitySummary.includes("全部可選：314");
  if(!selectorPass)throw new Error(`P05F2_LIVE_SELECTOR_FAILED:${JSON.stringify(selector)}`);

  await page.locator("#regenerate-button").click();
  await page.waitForFunction(()=>{const t=document.querySelector("#status-panel")?.textContent??"";return t.includes("已產生")||t.includes("產生失敗");},null,{timeout:120000});
  const generation=await page.evaluate(()=>({
    statusText:document.querySelector("#status-panel")?.textContent?.trim()??"",
    statusTone:document.querySelector("#status-panel")?.dataset?.tone??"",
    validationText:document.querySelector("#validation-panel")?.textContent?.trim()??"",
    validationHasErrors:document.querySelector("#validation-panel")?.dataset?.hasErrors??null,
    previewMeta:document.querySelector("#preview-meta")?.textContent?.trim()??"",
    previewSrcdocLength:document.querySelector("#preview-frame")?.srcdoc?.length??0,
    printButtonDisabled:Boolean(document.querySelector("#print-button")?.disabled),
  }));
  if(!generation.statusText.includes(`已產生 ${QUESTION_COUNT} 題`)||generation.statusTone!=="success"||generation.validationHasErrors!=="false"||!generation.validationText.includes("驗證通過")||generation.previewSrcdocLength<=0||generation.printButtonDisabled)throw new Error(`P05F2_LIVE_GENERATION_FAILED:${JSON.stringify(generation)}`);

  const frameElement=await page.locator("#preview-frame").elementHandle();
  const frame=await frameElement?.contentFrame();
  if(!frame)throw new Error("P05F2_PREVIEW_FRAME_MISSING");
  await frame.waitForSelector(".worksheet-document",{timeout:120000});
  const worksheet=await frame.evaluate(()=>{
    const q=[...document.querySelectorAll(".worksheet-cell--question")],a=[...document.querySelectorAll(".worksheet-cell--answer-key")],pages=[...document.querySelectorAll(".worksheet-page")];
    return{
      questionCount:q.length,answerCount:a.length,
      questionPageCount:document.querySelectorAll(".worksheet-page--questions").length,
      answerPageCount:document.querySelectorAll(".worksheet-page--answer-key").length,
      diagramCount:document.querySelectorAll(".worksheet-circle-parts-diagram").length,
      circleCount:document.querySelectorAll(".circle-parts-diagram__circle").length,
      centerReferenceCount:document.querySelectorAll(".circle-parts-diagram__center-reference").length,
      targetCenterCount:document.querySelectorAll(".circle-parts-diagram__target-center").length,
      radiusSegmentCount:document.querySelectorAll(".circle-parts-diagram__segment--radius").length,
      diameterSegmentCount:document.querySelectorAll(".circle-parts-diagram__segment--diameter").length,
      diameterTestSegmentCount:document.querySelectorAll(".circle-parts-diagram__segment--diameter-test").length,
      labelPointCount:document.querySelectorAll(".circle-parts-diagram__label-point").length,
      trueDiameterTestCount:document.querySelectorAll('[data-target-part="DIAMETER_TEST"][data-is-diameter="true"]').length,
      falseDiameterTestCount:document.querySelectorAll('[data-target-part="DIAMETER_TEST"][data-is-diameter="false"]').length,
      answerTexts:a.map(c=>c.querySelector(".worksheet-cell__answer")?.textContent?.trim()??""),
      questionSignatures:q.map(c=>`${c.querySelector(".worksheet-cell__prompt")?.textContent?.trim()??""}::${c.querySelector("svg")?.outerHTML??""}`),
      allText:document.body?.innerText??"",
      overflowFindingCount:pages.filter(n=>n.scrollHeight>n.clientHeight+1||n.scrollWidth>n.clientWidth+1).length,
      sharedRenderer:Boolean(document.querySelector(".worksheet-document")),
    };
  });
  const answerSet=[...new Set(worksheet.answerTexts)].sort();
  const expectedAnswerSet=["圓心","半徑","直徑","是直徑","不是直徑"].sort();
  const duplicateSignatureCount=worksheet.questionSignatures.length-new Set(worksheet.questionSignatures).size;
  const internalIdLeakage=[SOURCE_ID,KP_ID,GROUP_ID,...SPEC_IDS].filter(token=>worksheet.allText.includes(token));
  const forbiddenVocabulary=FORBIDDEN_TERMS.filter(term=>worksheet.allText.includes(term));
  const layout=parseLayout(generation.previewMeta);
  const expectedQuestionPages=layout?Math.ceil(QUESTION_COUNT/(layout.questionColumns*layout.questionRows)):null;
  const expectedAnswerPages=layout?Math.ceil(QUESTION_COUNT/(layout.answerColumns*layout.answerRows)):null;
  const worksheetPass=worksheet.questionCount===24&&worksheet.answerCount===24&&worksheet.diagramCount===48&&worksheet.circleCount===48&&worksheet.centerReferenceCount===48&&worksheet.targetCenterCount>0&&worksheet.radiusSegmentCount>0&&worksheet.diameterSegmentCount>0&&worksheet.diameterTestSegmentCount>0&&worksheet.labelPointCount>0&&worksheet.trueDiameterTestCount>0&&worksheet.falseDiameterTestCount>0&&JSON.stringify(answerSet)===JSON.stringify(expectedAnswerSet)&&duplicateSignatureCount===0&&internalIdLeakage.length===0&&forbiddenVocabulary.length===0&&worksheet.overflowFindingCount===0&&worksheet.sharedRenderer&&layout&&worksheet.questionPageCount===expectedQuestionPages&&worksheet.answerPageCount===expectedAnswerPages;
  if(!worksheetPass)throw new Error(`P05F2_LIVE_WORKSHEET_FAILED:${JSON.stringify({...worksheet,allText:undefined,questionSignatures:undefined,answerSet,duplicateSignatureCount,internalIdLeakage,forbiddenVocabulary,layout,expectedQuestionPages,expectedAnswerPages})}`);

  await frame.evaluate(()=>{window.__P05F2_PRINT_INVOKED__=0;window.print=()=>{window.__P05F2_PRINT_INVOKED__+=1;};});
  await page.locator("#print-button").click();
  const printInvocationCount=await frame.evaluate(()=>window.__P05F2_PRINT_INVOKED__??0);
  if(printInvocationCount!==1)throw new Error(`P05F2_PRINT_DISPATCH_FAILED:${printInvocationCount}`);
  await page.screenshot({path:path.join(OUTPUT,"P05F2_LIVE_PAGES_UI.png"),fullPage:true});
  await frame.locator(".worksheet-document").screenshot({path:path.join(OUTPUT,"P05F2_LIVE_PAGES_WORKSHEET.png")});
  writeFileSync(path.join(OUTPUT,"P05F2_LIVE_PAGES_WORKSHEET.html"),await frame.content());
  if(consoleErrors.length||pageErrors.length||requestFailures.length||assetHttpFailures.length)throw new Error(`P05F2_BROWSER_DIAGNOSTICS_FAILED:${JSON.stringify({consoleErrors,pageErrors,requestFailures,assetHttpFailures})}`);

  const report={schemaName:"P05FW5Q002PostMergeMainPagesE2EV1",taskId:"P05F_W5_Q002_PostMergeMainPagesE2E_ExactMergedEvidence",status:"PASS_P05F_W5_Q002_POSTMERGE_MAIN_PAGES_E2E",exactProductMergeSha:EXACT_MERGE_SHA,exactPagesRunId:EXACT_PAGES_RUN_ID,deployment,sourceId:SOURCE_ID,knowledgePointId:KP_ID,patternGroupId:GROUP_ID,patternSpecIds:SPEC_IDS,selector,generation,worksheet:{questionCount:worksheet.questionCount,answerCount:worksheet.answerCount,questionPageCount:worksheet.questionPageCount,answerPageCount:worksheet.answerPageCount,diagramCount:worksheet.diagramCount,circleCount:worksheet.circleCount,centerReferenceCount:worksheet.centerReferenceCount,targetCenterCount:worksheet.targetCenterCount,radiusSegmentCount:worksheet.radiusSegmentCount,diameterSegmentCount:worksheet.diameterSegmentCount,diameterTestSegmentCount:worksheet.diameterTestSegmentCount,labelPointCount:worksheet.labelPointCount,trueDiameterTestCount:worksheet.trueDiameterTestCount,falseDiameterTestCount:worksheet.falseDiameterTestCount,answerSet,duplicateSignatureCount,internalIdLeakage,forbiddenVocabulary,overflowFindingCount:worksheet.overflowFindingCount,layout},print:{invocationCount:printInvocationCount},browser:{consoleErrorCount:0,pageErrorCount:0,requestFailureCount:0,assetHttpFailureCount:0},forbiddenScope:{q001SemanticsTouched:false,q002ProductSemanticsChanged:false,circumferenceTargetExpansion:false,constructionExpansion:false,measurementOrNumericExpansion:false,circleIntersectionOrTangencyExpansion:false,applicationExpansion:false,fullRepositoryRegression:false,globalBrowserReplay:false}};
  writeFileSync(path.join(OUTPUT,"P05F2_POSTMERGE_MAIN_PAGES_E2E.json"),`${JSON.stringify(report,null,2)}\n`);
  console.log(`P05F2_POSTMERGE_MAIN_PAGES_E2E=${JSON.stringify(report)}`);
}catch(error){
  writeFileSync(path.join(OUTPUT,"P05F2_POSTMERGE_MAIN_PAGES_E2E_FAILURE.json"),`${JSON.stringify({status:"FAIL_P05F_W5_Q002_POSTMERGE_MAIN_PAGES_E2E",exactProductMergeSha:EXACT_MERGE_SHA,exactPagesRunId:EXACT_PAGES_RUN_ID,error:String(error?.stack??error),deployment},null,2)}\n`);
  throw error;
}finally{
  if(browser)await browser.close();
}
