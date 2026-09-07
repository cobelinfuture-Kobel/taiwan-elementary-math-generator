import {mkdirSync,writeFileSync} from "node:fs";
import path from "node:path";
import {chromium} from "playwright";
import {createStaticPreviewServer} from "../preview/serve-preview.js";

const SOURCE_ID="g3b_u05_3b05";
const KP_ID="kp_area_grid_counting";
const QUESTION_COUNT=24;
const FORBIDDEN=["剪拼","周長相同","長方形面積公式","正方形面積公式","估測","應用題"];
const EXPECTED_MODES=["WHOLE_AND_HALF_GRID","WHOLE_UNIT_GRID"];
const EXTERNAL_BASE_URL=process.env.P05F12_SITE_URL??null;
const OUTPUT=path.resolve("tmp/p05f-w5-slice012-classic-ui-acceptance");
mkdirSync(OUTPUT,{recursive:true});
let BASE_URL=EXTERNAL_BASE_URL,server=null,browser=null;

async function startLocalSite(){
  if(BASE_URL)return;
  server=createStaticPreviewServer({rootDir:path.resolve("site"),defaultIndexRoute:"/index.html"});
  await new Promise((resolve,reject)=>{server.once("error",reject);server.listen(0,"127.0.0.1",resolve);});
  const address=server.address();
  if(!address||typeof address==="string")throw new Error("P05F12_LOCAL_SITE_ADDRESS_INVALID");
  BASE_URL=`http://127.0.0.1:${address.port}/index.html`;
  console.log(`P05F12_LOCAL_SITE_URL=${BASE_URL}`);
}

function parseLayout(meta){
  const q=String(meta).match(/題目\s*(\d+)\s*欄\s*[×x]\s*(\d+)\s*列/);
  const a=String(meta).match(/答案\s*(\d+)\s*欄\s*[×x]\s*(\d+)\s*列/);
  return q&&a?{questionColumns:Number(q[1]),questionRows:Number(q[2]),answerColumns:Number(a[1]),answerRows:Number(a[2])}:null;
}

async function runCase(){
  const diagnostics={consoleErrors:[],pageErrors:[],requestFailures:[],assetHttpFailures:[]};
  const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
  page.on("console",m=>{if(m.type()==="error")diagnostics.consoleErrors.push(m.text());});
  page.on("pageerror",e=>diagnostics.pageErrors.push(String(e?.stack??e)));
  page.on("requestfailed",r=>diagnostics.requestFailures.push({url:r.url(),failure:r.failure()?.errorText??"unknown"}));
  page.on("response",r=>{if(r.status()>=400&&(/\.(?:m?js|css)(?:\?|$)/i.test(r.url())||r.url().includes("/assets/")||r.url().includes("/modules/")))diagnostics.assetHttpFailures.push({url:r.url(),status:r.status()});});
  try{
    const url=new URL(BASE_URL);
    url.searchParams.set("p05f12-focused",String(Date.now()));
    const response=await page.goto(url.href,{waitUntil:"networkidle",timeout:120000});
    if(!response?.ok())throw new Error(`P05F12_CLASSIC_UI_MAIN_RESPONSE_FAILED:${response?.status()??"none"}`);

    await page.waitForFunction(()=>[...document.querySelectorAll("#batch-a-grade-select option")].some(o=>o.value==="3"),null,{timeout:120000});
    await page.selectOption("#batch-a-grade-select","3");
    await page.selectOption("#batch-a-semester-select","lower");
    await page.waitForFunction(sourceId=>[...document.querySelectorAll("#batch-a-source-select option")].some(o=>o.value===sourceId),SOURCE_ID,{timeout:120000});
    await page.selectOption("#batch-a-source-select",SOURCE_ID);
    await page.waitForFunction(kpId=>Boolean(document.querySelector(`[data-knowledge-point-id="${kpId}"]`)),KP_ID,{timeout:120000});
    await page.selectOption("#batch-a-selection-mode-select","singleKnowledgePoint");
    await page.locator(`[data-knowledge-point-id="${KP_ID}"]`).click();
    await page.waitForFunction(kpId=>document.querySelector(`[data-knowledge-point-id="${kpId}"]`)?.dataset?.selected==="true",KP_ID,{timeout:120000});
    await page.fill("#batch-a-question-count-input",String(QUESTION_COUNT));
    await page.dispatchEvent("#batch-a-question-count-input","change");
    await page.selectOption("#batch-a-ordering-select","groupedByPattern");
    await page.fill("#generation-seed-input","p05f12-classic-area-grid-counting");
    await page.dispatchEvent("#generation-seed-input","change");
    await page.check("#batch-a-answer-key-input");
    await page.fill("#columns-input","2");
    await page.dispatchEvent("#columns-input","change");
    await page.fill("#rows-per-page-input","4");
    await page.dispatchEvent("#rows-per-page-input","change");

    const selector=await page.evaluate(()=>({
      grade:document.querySelector("#batch-a-grade-select")?.value,
      semester:document.querySelector("#batch-a-semester-select")?.value,
      sourceId:document.querySelector("#batch-a-source-select")?.value,
      selectionMode:document.querySelector("#batch-a-selection-mode-select")?.value,
      selectedKnowledgePointIds:[...document.querySelectorAll("[data-knowledge-point-id][data-selected='true']")].map(n=>n.dataset.knowledgePointId),
      availabilitySummary:document.querySelector("#batch-a-knowledge-point-availability-summary")?.textContent?.trim()??"",
    }));
    if(selector.grade!=="3"||selector.semester!=="lower"||selector.sourceId!==SOURCE_ID||selector.selectionMode!=="singleKnowledgePoint"||selector.selectedKnowledgePointIds.join(",")!==KP_ID||!selector.availabilitySummary.includes("可選知識點：2")||!selector.availabilitySummary.includes("尚未開放：3")||!selector.availabilitySummary.includes("不可選：3")||!selector.availabilitySummary.includes("全部可選：326"))throw new Error(`P05F12_CLASSIC_UI_SELECTOR_FAILED:${JSON.stringify(selector)}`);

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
    if(!generation.statusText.includes(`已產生 ${QUESTION_COUNT} 題`)||generation.statusTone!=="success"||generation.validationHasErrors!=="false"||!generation.validationText.includes("驗證通過")||generation.previewSrcdocLength<=0||generation.printButtonDisabled)throw new Error(`P05F12_CLASSIC_UI_GENERATION_FAILED:${JSON.stringify(generation)}`);

    const frameElement=await page.locator("#preview-frame").elementHandle();
    const frame=await frameElement?.contentFrame();
    if(!frame)throw new Error("P05F12_PREVIEW_FRAME_MISSING");
    await frame.waitForSelector(".worksheet-document",{timeout:120000});
    const worksheet=await frame.evaluate(()=>{
      const q=[...document.querySelectorAll(".worksheet-cell--question")];
      const a=[...document.querySelectorAll(".worksheet-cell--answer-key")];
      const pages=[...document.querySelectorAll(".worksheet-page")];
      return {
        questionCount:q.length,
        answerCount:a.length,
        questionPageCount:document.querySelectorAll(".worksheet-page--questions").length,
        answerPageCount:document.querySelectorAll(".worksheet-page--answer-key").length,
        diagramCount:document.querySelectorAll(".worksheet-area-grid-counting-diagram").length,
        diagramModes:[...new Set([...document.querySelectorAll('[data-representation="area-grid-counting-diagram"]')].map(n=>n.dataset.diagramMode))].sort(),
        prompts:q.map(c=>c.querySelector(".worksheet-cell__prompt")?.textContent?.trim()??""),
        signatures:q.map(c=>`${c.querySelector(".worksheet-cell__prompt")?.textContent?.trim()??""}::${c.querySelector("svg")?.outerHTML??""}`),
        allText:document.body?.innerText??"",
        overflow:pages.filter(n=>n.scrollHeight>n.clientHeight+1||n.scrollWidth>n.clientWidth+1).length,
      };
    });
    const duplicates=worksheet.signatures.length-new Set(worksheet.signatures).size;
    const forbidden=FORBIDDEN.filter(t=>worksheet.prompts.some(p=>p.includes(t)));
    const internalIdLeakage=[SOURCE_ID,KP_ID,"pg_g3b_u05_area_grid_counting"].filter(t=>worksheet.allText.includes(t));
    const layout=parseLayout(generation.previewMeta);
    const expectedQ=layout?Math.ceil(QUESTION_COUNT/(layout.questionColumns*layout.questionRows)):null;
    const expectedA=layout?Math.ceil(QUESTION_COUNT/(layout.answerColumns*layout.answerRows)):null;
    if(!(worksheet.questionCount===QUESTION_COUNT&&worksheet.answerCount===QUESTION_COUNT&&worksheet.diagramCount===QUESTION_COUNT*2&&JSON.stringify(worksheet.diagramModes)===JSON.stringify(EXPECTED_MODES)&&duplicates===0&&forbidden.length===0&&internalIdLeakage.length===0&&worksheet.overflow===0&&layout&&worksheet.questionPageCount===expectedQ&&worksheet.answerPageCount===expectedA))throw new Error(`P05F12_CLASSIC_UI_WORKSHEET_FAILED:${JSON.stringify({...worksheet,allText:undefined,signatures:undefined,prompts:undefined,duplicates,forbidden,internalIdLeakage,layout})}`);

    await frame.evaluate(()=>{window.__P05F12_PRINT_INVOKED__=0;window.print=()=>window.__P05F12_PRINT_INVOKED__+=1;});
    await page.locator("#print-button").click();
    const printInvocationCount=await frame.evaluate(()=>window.__P05F12_PRINT_INVOKED__??0);
    if(printInvocationCount!==1)throw new Error(`P05F12_PRINT_DISPATCH_FAILED:${printInvocationCount}`);

    await page.screenshot({path:path.join(OUTPUT,"P05F12_CLASSIC_UI.png"),fullPage:true});
    await frame.locator(".worksheet-document").screenshot({path:path.join(OUTPUT,"P05F12_WORKSHEET.png")});
    writeFileSync(path.join(OUTPUT,"P05F12_WORKSHEET.html"),await frame.content());
    if(diagnostics.consoleErrors.length||diagnostics.pageErrors.length||diagnostics.requestFailures.length||diagnostics.assetHttpFailures.length)throw new Error(`P05F12_BROWSER_DIAGNOSTICS_FAILED:${JSON.stringify(diagnostics)}`);
    return {selector,generation:{statusText:generation.statusText,previewMeta:generation.previewMeta},worksheet:{questionCount:worksheet.questionCount,answerCount:worksheet.answerCount,questionPageCount:worksheet.questionPageCount,answerPageCount:worksheet.answerPageCount,diagramCount:worksheet.diagramCount,diagramModes:worksheet.diagramModes,duplicates,forbidden,overflow:worksheet.overflow,layout},printInvocationCount};
  } finally {
    await page.close();
  }
}

try{
  await startLocalSite();
  browser=await chromium.launch({headless:true});
  const result=await runCase();
  const report={
    schemaName:"P05FW5Q012ClassicUIAcceptanceV1",
    taskId:"P05F_W5DirectProductVerticalSlice012Implementation",
    status:"PASS_P05F_W5_Q012_CLASSIC_UI_ACCEPTANCE",
    sourceId:SOURCE_ID,
    knowledgePointId:KP_ID,
    result,
    publicCounts:{sources:51,visibleKnowledgePoints:326,g3bU05Visible:2,g3bU05Hidden:3,g3bU05NotSelectable:3},
    forbiddenScope:{q003SquareCentimeterUnitSemanticsTouched:false,generalIrregularGridAreaExpansion:false,cutRearrangeAreaConservationExpansion:false,samePerimeterAreaComparisonExpansion:false,rectangleSquareAreaFormulaExpansion:false,realWorldAreaEstimationExpansion:false,applicationExpansion:false,q013Expansion:false,fullRepositoryRegression:false,globalBrowserReplay:false},
  };
  writeFileSync(path.join(OUTPUT,"report.json"),`${JSON.stringify(report,null,2)}\n`);
  console.log(`P05F12_CLASSIC_UI_ACCEPTANCE=${JSON.stringify(report)}`);
} finally {
  if(browser)await browser.close();
  if(server?.listening)await new Promise(resolve=>server.close(resolve));
}
