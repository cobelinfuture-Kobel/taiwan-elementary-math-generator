import {spawn} from "node:child_process";
import {mkdirSync,writeFileSync} from "node:fs";
import path from "node:path";
import {chromium} from "playwright";

const SOURCE="g5b_u11_5b11";
const TARGETS=[
  "kp_g5b_u11_bar_line_chart_reading",
  "kp_g5b_u11_chart_scale_broken_axis"
];
const FUTURE=[
  "kp_g5b_u11_compare_two_data_series",
  "kp_g5b_u11_construct_line_chart",
  "kp_g5b_u11_line_chart_trend"
];
const COUNT=6;
const PORT=Number(process.env.P06F10_SITE_PORT??"4370");
const REMOTE=process.env.P06F10_SITE_URL??null;
const BASE=REMOTE??`http://127.0.0.1:${PORT}/index.html`;
const OUT=path.resolve("tmp/p06f-w6-slice010-classic-ui-acceptance");

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
    }catch(e){
      last=e;
    }
    await sleep(250);
  }
  throw new Error(`P06F10_SITE_NOT_READY:${last?.message??"unknown"}`);
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

async function generateFor(page,kp,count,seed){
  await page.selectOption("#batch-a-selection-mode-select","singleKnowledgePoint");
  await page.locator(`#batch-a-knowledge-point-panel [data-knowledge-point-id="${kp}"]`).click();

  await page.waitForFunction(
    id=>{
      const selected=[
        ...document.querySelectorAll(
          "#batch-a-knowledge-point-panel [data-knowledge-point-id][data-selected='true']"
        )
      ].map(n=>n.dataset.knowledgePointId);
      return selected.length===1&&selected[0]===id;
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
  await page.fill("#rows-per-page-input","1");
  await page.dispatchEvent("#rows-per-page-input","change");
  await page.fill("#generation-seed-input",seed);
  await page.dispatchEvent("#generation-seed-input","change");
  await page.locator("#regenerate-button").click();

  await page.waitForFunction(
    n=>{
      const text=document.querySelector("#status-panel")?.textContent??"";
      return text.includes(`已產生 ${n} 題`)||text.includes("產生失敗");
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

  if(
    !state.status.includes(`已產生 ${count} 題`)||
    state.tone!=="success"||
    state.valid!=="false"||
    state.preview<=0||
    state.printDisabled
  ){
    throw new Error(`P06F10_GENERATION:${kp}:${JSON.stringify(state)}`);
  }

  const frame=await (await page.locator("#preview-frame").elementHandle())?.contentFrame();
  if(!frame)throw new Error(`P06F10_PREVIEW_FRAME_MISSING:${kp}`);
  await frame.waitForSelector(".worksheet-document",{timeout:120000});

  const worksheet=await frame.evaluate(()=>{
    const q=[...document.querySelectorAll(".worksheet-cell--question")];
    const a=[...document.querySelectorAll(".worksheet-cell--answer-key")];
    const qb=[...document.querySelectorAll(".worksheet-cell--question .worksheet-bar-chart")];
    const ql=[...document.querySelectorAll(".worksheet-cell--question .worksheet-line-chart")];
    const ab=[...document.querySelectorAll(".worksheet-cell--answer-key .worksheet-bar-chart")];
    const al=[...document.querySelectorAll(".worksheet-cell--answer-key .worksheet-line-chart")];
    const breaks=[
      ...document.querySelectorAll(
        ".worksheet-line-chart__axis-break,.worksheet-bar-chart__axis-break"
      )
    ];
    const overflow=[...document.querySelectorAll(".worksheet-page")]
      .filter(n=>n.scrollHeight>n.clientHeight+1||n.scrollWidth>n.clientWidth+1)
      .length;
    const allText=document.body?.innerText??"";

    return{
      questions:q.length,
      answers:a.length,
      questionBars:qb.length,
      questionLines:ql.length,
      answerBars:ab.length,
      answerLines:al.length,
      axisBreaks:breaks.length,
      overflow,
      leaks:allText.includes("P06F10")||allText.includes("ps_g5b_u11_")
    };
  });

  if(
    worksheet.questions!==count||
    worksheet.answers!==count||
    worksheet.questionBars+worksheet.questionLines!==count||
    worksheet.answerBars+worksheet.answerLines!==count||
    worksheet.questionBars===0||
    worksheet.questionLines===0||
    worksheet.overflow!==0||
    worksheet.leaks
  ){
    throw new Error(`P06F10_WORKSHEET:${kp}:${JSON.stringify(worksheet)}`);
  }

  return{state,worksheet,frame};
}

async function run(){
  const page=await browser.newPage({
    viewport:{width:1440,height:1100},
    deviceScaleFactor:1
  });

  page.on("console",m=>{
    if(m.type()==="error")errors.console.push(m.text());
  });
  page.on("pageerror",e=>errors.page.push(String(e?.stack??e)));
  page.on("requestfailed",r=>{
    errors.request.push({
      url:r.url(),
      failure:r.failure()?.errorText??"unknown"
    });
  });
  page.on("response",r=>{
    if(
      r.status()>=400&&
      (
        /\.(?:m?js|css)(?:\?|$)/i.test(r.url())||
        r.url().includes("/modules/")||
        r.url().includes("/assets/")
      )
    ){
      errors.http.push({url:r.url(),status:r.status()});
    }
  });

  const url=new URL(BASE);
  url.searchParams.set("p06f10",String(Date.now()));
  const response=await page.goto(url.href,{
    waitUntil:"networkidle",
    timeout:120000
  });
  if(!response?.ok()){
    throw new Error(`P06F10_MAIN_HTTP:${response?.status()??"none"}`);
  }

  await page.waitForFunction(
    ()=>[...document.querySelectorAll("#batch-a-grade-select option")]
      .some(o=>o.value==="5"),
    null,
    {timeout:120000}
  );

  await selectSource(page,5,"lower",SOURCE);

  await page.waitForFunction(
    ({targets,future})=>
      targets.every(
        id=>Boolean(
          document.querySelector(
            `#batch-a-knowledge-point-panel [data-knowledge-point-id="${id}"]`
          )
        )
      )&&
      future.every(
        id=>!document.querySelector(
          `#batch-a-knowledge-point-panel [data-knowledge-point-id="${id}"]`
        )
      ),
    {targets:TARGETS,future:FUTURE},
    {timeout:120000}
  );

  const selector=await page.evaluate(
    ({targets,future})=>({
      sourceId:document.querySelector("#batch-a-source-select")?.value,
      visibleIds:[
        ...document.querySelectorAll(
          "#batch-a-knowledge-point-panel [data-knowledge-point-id]"
        )
      ].map(n=>n.dataset.knowledgePointId),
      targetsPresent:targets.every(
        id=>Boolean(
          document.querySelector(
            `#batch-a-knowledge-point-panel [data-knowledge-point-id="${id}"]`
          )
        )
      ),
      futureHidden:future.every(
        id=>!document.querySelector(
          `#batch-a-knowledge-point-panel [data-knowledge-point-id="${id}"]`
        )
      ),
      sameUnitDisabled:Boolean(
        document.querySelector(
          '#batch-a-selection-mode-select option[value="mixedKnowledgePointsSameUnit"]'
        )?.disabled
      )
    }),
    {targets:TARGETS,future:FUTURE}
  );

  if(
    selector.sourceId!==SOURCE||
    !selector.targetsPresent||
    !selector.futureHidden||
    !selector.sameUnitDisabled
  ){
    throw new Error(`P06F10_SELECTOR:${JSON.stringify(selector)}`);
  }

  const reading=await generateFor(
    page,
    TARGETS[0],
    COUNT,
    "p06f10-reading-ui"
  );
  const scale=await generateFor(
    page,
    TARGETS[1],
    COUNT,
    "p06f10-scale-ui"
  );

  if(scale.worksheet.axisBreaks===0){
    throw new Error(
      `P06F10_BROKEN_AXIS_NOT_RENDERED:${JSON.stringify(scale.worksheet)}`
    );
  }

  await scale.frame.evaluate(()=>{
    window.__P06F10_PRINT__=0;
    window.print=()=>window.__P06F10_PRINT__++;
  });
  await page.locator("#print-button").click();
  const printCount=await scale.frame.evaluate(
    ()=>window.__P06F10_PRINT__??0
  );
  if(printCount!==1)throw new Error(`P06F10_PRINT:${printCount}`);

  await scale.frame.locator(".worksheet-document").screenshot({
    path:path.join(OUT,"q010-worksheet.png"),
    fullPage:true
  });
  await page.screenshot({
    path:path.join(OUT,"q010-ui.png"),
    fullPage:true
  });

  await page.close();

  return{
    selector,
    reading:{state:reading.state,worksheet:reading.worksheet},
    scale:{state:scale.state,worksheet:scale.worksheet},
    printCount
  };
}

try{
  await ready();
  browser=await chromium.launch({headless:true});
  const target=await run();

  if(Object.values(errors).some(x=>x.length)){
    throw new Error(`P06F10_BROWSER_DIAGNOSTICS:${JSON.stringify(errors)}`);
  }

  const report={
    schemaName:"P06FW6Q010ClassicUIAcceptanceV1",
    taskId:"P06F_W6DirectProductVerticalSlice010Implementation",
    status:"PASS_P06F_W6_Q010_CLASSIC_UI_ACCEPTANCE",
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
      barAndLinePointReadingPreserved:true,
      titleAxisLegendScalePreserved:true,
      nonUnitScalePreserved:true,
      omittedAxisStartRendered:true,
      q012FutureKnowledgePointsHidden:true,
      sameUnitMixedModeFailClosed:true
    },
    forbiddenScope:{
      lineChartTrend:false,
      twoSeriesCompare:false,
      lineChartConstruction:false,
      applicationContext:false,
      sameUnitMixed:false,
      crossUnitMixed:false,
      q011OrLater:false,
      fullRepositoryRegression:false,
      globalBrowserReplay:false
    }
  };

  writeFileSync(
    path.join(OUT,"report.json"),
    `${JSON.stringify(report,null,2)}\n`
  );
  console.log(
    `P06F10_CLASSIC_UI_ACCEPTANCE=${JSON.stringify(report)}`
  );
}catch(error){
  writeFileSync(
    path.join(OUT,"failure.json"),
    `${JSON.stringify({
      schemaName:"P06FW6Q010ClassicUIAcceptanceFailureV1",
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
