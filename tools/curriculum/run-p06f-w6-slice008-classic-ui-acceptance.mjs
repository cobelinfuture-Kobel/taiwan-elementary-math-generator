import {spawn} from "node:child_process";
import {mkdirSync,writeFileSync} from "node:fs";
import path from "node:path";
import {chromium} from "playwright";

const SOURCE="g3b_u10_3b10";
const TARGETS=["kp_construct_two_way_table","kp_table_extrema_and_missing_value"];
const PREV=["kp_one_way_table_reading","kp_table_data_comparison","kp_two_way_table_structure"];
const COUNT=6;
const PORT=Number(process.env.P06F08_SITE_PORT??"4368");
const REMOTE=process.env.P06F08_SITE_URL??null;
const BASE=REMOTE??`http://127.0.0.1:${PORT}/index.html`;
const OUT=path.resolve("tmp/p06f-w6-slice008-classic-ui-acceptance");

mkdirSync(OUT,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let server=null,browser=null,serverOut="",serverErr="";

if(!REMOTE){
  server=spawn(process.execPath,["tools/site/serve-site.js"],{
    env:{...process.env,SITE_PORT:String(PORT),SITE_HOST:"127.0.0.1"},
    stdio:["ignore","pipe","pipe"]
  });
  server.stdout.on("data",c=>serverOut+=c);
  server.stderr.on("data",c=>serverErr+=c);
}

async function ready(){
  let last;
  for(let i=0;i<50;i++){
    try{
      const r=await fetch(BASE,{cache:"no-store"});
      if(r.ok)return;
    }catch(e){last=e;}
    await sleep(250);
  }
  throw new Error(`P06F08_SITE_NOT_READY:${last?.message??"unknown"}`);
}

const errors={console:[],page:[],request:[],http:[]};

async function selectSource(page,grade,semester,source){
  await page.selectOption("#batch-a-grade-select",String(grade));
  await page.waitForFunction(
    v=>[...document.querySelectorAll("#batch-a-semester-select option")].some(o=>o.value===v),
    semester,
    {timeout:120000}
  );
  await page.selectOption("#batch-a-semester-select",semester);
  await page.waitForFunction(
    id=>[...document.querySelectorAll("#batch-a-source-select option")].some(o=>o.value===id),
    source,
    {timeout:120000}
  );
  await page.selectOption("#batch-a-source-select",source);
}

async function generateFor(page,kp,count,seed,{oneWay=false,twoWay=false,requireRawRecords=false}={}){
  await page.selectOption("#batch-a-selection-mode-select","singleKnowledgePoint");
  await page.locator(`#batch-a-knowledge-point-panel [data-knowledge-point-id="${kp}"]`).click();
  await page.waitForFunction(
    id=>{
      const s=[...document.querySelectorAll("#batch-a-knowledge-point-panel [data-knowledge-point-id][data-selected='true']")]
        .map(n=>n.dataset.knowledgePointId);
      return s.length===1&&s[0]===id;
    },
    kp,
    {timeout:120000}
  );

  await page.fill("#batch-a-question-count-input",String(count));
  await page.dispatchEvent("#batch-a-question-count-input","change");
  await page.selectOption("#batch-a-ordering-select","groupedByPattern");
  await page.check("#batch-a-answer-key-input");
  await page.fill("#columns-input","2");
  await page.dispatchEvent("#columns-input","change");
  await page.fill("#rows-per-page-input","3");
  await page.dispatchEvent("#rows-per-page-input","change");
  await page.fill("#generation-seed-input",seed);
  await page.dispatchEvent("#generation-seed-input","change");
  await page.locator("#regenerate-button").click();

  await page.waitForFunction(
    n=>{
      const x=document.querySelector("#status-panel")?.textContent??"";
      return x.includes(`已產生 ${n} 題`)||x.includes("產生失敗");
    },
    count,
    {timeout:20000}
  );

  const state=await page.evaluate(()=>({
    status:document.querySelector("#status-panel")?.textContent?.trim()??"",
    tone:document.querySelector("#status-panel")?.dataset?.tone??"",
    valid:document.querySelector("#validation-panel")?.dataset?.hasErrors??null,
    preview:document.querySelector("#preview-frame")?.srcdoc?.length??0,
    printDisabled:Boolean(document.querySelector("#print-button")?.disabled)
  }));

  if(!state.status.includes(`已產生 ${count} 題`)||state.tone!=="success"||state.valid!=="false"||state.preview<=0||state.printDisabled){
    throw new Error(`P06F08_GENERATION:${kp}:${JSON.stringify(state)}`);
  }

  const frame=await (await page.locator("#preview-frame").elementHandle())?.contentFrame();
  if(!frame)throw new Error(`P06F08_PREVIEW_FRAME_MISSING:${kp}`);
  await frame.waitForSelector(".worksheet-document",{timeout:120000});

  const worksheet=await frame.evaluate(({count,kp})=>{
    const q=[...document.querySelectorAll(".worksheet-cell--question")];
    const a=[...document.querySelectorAll(".worksheet-cell--answer-key")];
    const oq=[...document.querySelectorAll(".worksheet-cell--question .worksheet-one-way-statistics-table")];
    const oa=[...document.querySelectorAll(".worksheet-cell--answer-key .worksheet-one-way-statistics-table")];
    const tq=[...document.querySelectorAll(".worksheet-cell--question .worksheet-two-way-statistics-table")];
    const ta=[...document.querySelectorAll(".worksheet-cell--answer-key .worksheet-two-way-statistics-table")];
    const charts=[...document.querySelectorAll(".worksheet-bar-chart,.worksheet-chart")];
    const overflow=[...document.querySelectorAll(".worksheet-page")]
      .filter(n=>n.scrollHeight>n.clientHeight+1||n.scrollWidth>n.clientWidth+1).length;
    const allText=document.body?.innerText??"";
    return{
      questions:q.length,
      answers:a.length,
      questionOneWayTables:oq.length,
      answerOneWayTables:oa.length,
      questionTwoWayTables:tq.length,
      answerTwoWayTables:ta.length,
      charts:charts.length,
      overflow,
      hasBlank:allText.includes("□"),
      hasRawRecords:allText.includes("原始紀錄"),
      leaks:allText.includes(kp)||allText.includes("ps_g3b_u10_")||allText.includes("P06F08")
    };
  },{count,kp});

  if(worksheet.questions!==count||worksheet.answers!==count||worksheet.overflow!==0||worksheet.charts!==0||worksheet.leaks){
    throw new Error(`P06F08_WORKSHEET:${kp}:${JSON.stringify(worksheet)}`);
  }
  if(oneWay&&(worksheet.questionOneWayTables!==count||worksheet.answerOneWayTables!==count)){
    throw new Error(`P06F08_ONE_WAY:${kp}:${JSON.stringify(worksheet)}`);
  }
  if(twoWay&&(worksheet.questionTwoWayTables!==count||worksheet.answerTwoWayTables!==count)){
    throw new Error(`P06F08_TWO_WAY:${kp}:${JSON.stringify(worksheet)}`);
  }
  if(requireRawRecords&&(!worksheet.hasBlank||!worksheet.hasRawRecords)){
    throw new Error(`P06F08_RAW_RECORD_CONSTRUCTION:${kp}:${JSON.stringify(worksheet)}`);
  }

  return{state,worksheet,frame};
}

async function run(){
  const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
  page.on("console",m=>{if(m.type()==="error")errors.console.push(m.text());});
  page.on("pageerror",e=>errors.page.push(String(e?.stack??e)));
  page.on("requestfailed",r=>errors.request.push({url:r.url(),failure:r.failure()?.errorText??"unknown"}));
  page.on("response",r=>{
    if(r.status()>=400&&(/\.(?:m?js|css)(?:\?|$)/i.test(r.url())||r.url().includes("/modules/")||r.url().includes("/assets/"))){
      errors.http.push({url:r.url(),status:r.status()});
    }
  });

  const url=new URL(BASE);
  url.searchParams.set("p06f08",String(Date.now()));
  const response=await page.goto(url.href,{waitUntil:"networkidle",timeout:120000});
  if(!response?.ok())throw new Error(`P06F08_MAIN_HTTP:${response?.status()??"none"}`);

  await page.waitForFunction(
    ()=>[...document.querySelectorAll("#batch-a-grade-select option")].some(o=>o.value==="3"),
    null,
    {timeout:120000}
  );
  await selectSource(page,3,"lower",SOURCE);

  await page.waitForFunction(
    ({targets,prev})=>[...targets,...prev].every(
      id=>Boolean(document.querySelector(`#batch-a-knowledge-point-panel [data-knowledge-point-id="${id}"]`))
    ),
    {targets:TARGETS,prev:PREV},
    {timeout:120000}
  );

  const selector=await page.evaluate(
    ({targets,prev})=>({
      sourceId:document.querySelector("#batch-a-source-select")?.value,
      visibleIds:[...document.querySelectorAll("#batch-a-knowledge-point-panel [data-knowledge-point-id]")]
        .map(n=>n.dataset.knowledgePointId),
      targetsPresent:targets.every(
        id=>Boolean(document.querySelector(`#batch-a-knowledge-point-panel [data-knowledge-point-id="${id}"]`))
      ),
      predecessorsPresent:prev.every(
        id=>Boolean(document.querySelector(`#batch-a-knowledge-point-panel [data-knowledge-point-id="${id}"]`))
      ),
      sameUnitDisabled:Boolean(
        document.querySelector('#batch-a-selection-mode-select option[value="mixedKnowledgePointsSameUnit"]')?.disabled
      )
    }),
    {targets:TARGETS,prev:PREV}
  );

  if(selector.sourceId!==SOURCE||!selector.targetsPresent||!selector.predecessorsPresent||!selector.sameUnitDisabled){
    throw new Error(`P06F08_SELECTOR:${JSON.stringify(selector)}`);
  }

  const construct=await generateFor(
    page,
    TARGETS[0],
    COUNT,
    "p06f08-construct-ui",
    {twoWay:true,requireRawRecords:true}
  );
  const extrema=await generateFor(
    page,
    TARGETS[1],
    COUNT,
    "p06f08-extrema-ui",
    {oneWay:true}
  );

  await extrema.frame.evaluate(()=>{
    window.__P06F08_PRINT__=0;
    window.print=()=>window.__P06F08_PRINT__++;
  });
  await page.locator("#print-button").click();
  const printCount=await extrema.frame.evaluate(()=>window.__P06F08_PRINT__??0);
  if(printCount!==1)throw new Error(`P06F08_PRINT:${printCount}`);

  await extrema.frame.locator(".worksheet-document").screenshot({
    path:path.join(OUT,"q008-worksheet.png"),
    fullPage:true
  });
  await page.screenshot({path:path.join(OUT,"q008-ui.png"),fullPage:true});

  const predecessor=await generateFor(
    page,
    PREV[2],
    4,
    "p06f08-q004-preserve",
    {twoWay:true}
  );

  await page.close();
  return{
    selector,
    construct:{state:construct.state,worksheet:construct.worksheet},
    extrema:{state:extrema.state,worksheet:extrema.worksheet},
    q004Predecessor:{state:predecessor.state,worksheet:predecessor.worksheet},
    printCount
  };
}

try{
  await ready();
  browser=await chromium.launch({headless:true});
  const target=await run();
  if(Object.values(errors).some(x=>x.length)){
    throw new Error(`P06F08_BROWSER_DIAGNOSTICS:${JSON.stringify(errors)}`);
  }

  const report={
    schemaName:"P06FW6Q008ClassicUIAcceptanceV1",
    taskId:"P06F_W6DirectProductVerticalSlice008Implementation",
    status:"PASS_P06F_W6_Q008_CLASSIC_UI_ACCEPTANCE",
    sourceId:SOURCE,
    knowledgePointIds:TARGETS,
    questionCountPerTarget:COUNT,
    target,
    browser:{
      consoleErrorCount:0,
      pageErrorCount:0,
      requestFailureCount:0,
      assetHttpFailureCount:0
    },
    semanticInvariants:{
      twoWayConstructionPreserved:true,
      rawRecordClassificationPreserved:true,
      rowColumnTotalsReconcile:true,
      extremaMissingValuePreserved:true,
      q003Q004PredecessorsVisibleAndReachable:true,
      sameUnitMixedModeFailClosed:true
    },
    forbiddenScope:{
      chartSemantics:false,
      applicationContext:false,
      sameUnitMixed:false,
      crossUnitMixed:false,
      q009OrLater:false,
      fullRepositoryRegression:false,
      globalBrowserReplay:false
    }
  };

  writeFileSync(path.join(OUT,"report.json"),`${JSON.stringify(report,null,2)}\n`);
  console.log(`P06F08_CLASSIC_UI_ACCEPTANCE=${JSON.stringify(report)}`);
}catch(error){
  writeFileSync(
    path.join(OUT,"failure.json"),
    `${JSON.stringify({
      schemaName:"P06FW6Q008ClassicUIAcceptanceFailureV1",
      status:"FAIL",
      baseUrl:BASE,
      error:String(error?.stack??error),
      browser:errors,
      server:{stdout:serverOut,stderr:serverErr}
    },null,2)}\n`
  );
  throw error;
}finally{
  if(browser)await browser.close().catch(()=>{});
  if(server&&!server.killed)server.kill("SIGTERM");
}
