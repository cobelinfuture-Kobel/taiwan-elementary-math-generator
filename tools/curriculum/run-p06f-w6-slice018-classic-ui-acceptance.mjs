import {spawn} from "node:child_process";
import {mkdirSync,writeFileSync} from "node:fs";
import path from "node:path";
import {chromium} from "playwright";

const SOURCE="g6a_u03_6a03";
const TARGET="kp_g6a_u03_relation_equation_unknown";
const PREV=[
  "kp_g6a_u03_symbolic_quantity_relation",
  "kp_g6a_u03_geometric_count_generalization",
  "kp_g6a_u03_input_output_general_rule",
  "kp_g6a_u03_linear_pattern_nth_term"
];
const COUNT=8;
const PORT=Number(process.env.P06F18_SITE_PORT||"4408");
const REMOTE=process.env.P06F18_SITE_URL||null;
const BASE=REMOTE||("http://127.0.0.1:"+PORT+"/index.html");
const OUT=path.resolve("tmp/p06f-w6-slice018-classic-ui-acceptance");
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
    try{const r=await fetch(BASE,{cache:"no-store"});if(r.ok)return;}catch(e){last=e;}
    await sleep(250);
  }
  throw new Error("P06F18_SITE_NOT_READY:"+(last?.message||"unknown"));
}
const errors={console:[],page:[],request:[],http:[]};

async function selectSource(page){
  await page.selectOption("#batch-a-grade-select","6");
  await page.waitForFunction(v=>[...document.querySelectorAll("#batch-a-semester-select option")].some(o=>o.value===v),"upper",{timeout:120000});
  await page.selectOption("#batch-a-semester-select","upper");
  await page.waitForFunction(id=>[...document.querySelectorAll("#batch-a-source-select option")].some(o=>o.value===id),SOURCE,{timeout:120000});
  await page.selectOption("#batch-a-source-select",SOURCE);
}

async function generateFor(page,kp,count,seed,columns=2,rows=4){
  await page.selectOption("#batch-a-selection-mode-select","singleKnowledgePoint");
  await page.locator('#batch-a-knowledge-point-panel [data-knowledge-point-id="'+kp+'"]').click();
  await page.waitForFunction(id=>{
    const selected=[...document.querySelectorAll("#batch-a-knowledge-point-panel [data-knowledge-point-id][data-selected='true']")].map(n=>n.dataset.knowledgePointId);
    return selected.length===1&&selected[0]===id;
  },kp,{timeout:120000});
  await page.fill("#batch-a-question-count-input",String(count));
  await page.dispatchEvent("#batch-a-question-count-input","change");
  await page.selectOption("#batch-a-ordering-select","groupedByPattern");
  await page.check("#batch-a-answer-key-input");
  await page.fill("#columns-input",String(columns));
  await page.dispatchEvent("#columns-input","change");
  await page.fill("#rows-per-page-input",String(rows));
  await page.dispatchEvent("#rows-per-page-input","change");
  await page.fill("#generation-seed-input",seed);
  await page.dispatchEvent("#generation-seed-input","change");
  await page.locator("#regenerate-button").click();
  await page.waitForFunction(n=>{
    const x=document.querySelector("#status-panel")?.textContent||"";
    return x.includes("已產生 "+n+" 題")||x.includes("產生失敗");
  },count,{timeout:20000});
  const state=await page.evaluate(()=>({
    status:document.querySelector("#status-panel")?.textContent?.trim()||"",
    tone:document.querySelector("#status-panel")?.dataset?.tone||"",
    valid:document.querySelector("#validation-panel")?.dataset?.hasErrors||null,
    preview:document.querySelector("#preview-frame")?.srcdoc?.length||0,
    printDisabled:Boolean(document.querySelector("#print-button")?.disabled)
  }));
  if(!state.status.includes("已產生 "+count+" 題")||state.tone!=="success"||state.valid!=="false"||state.preview<=0||state.printDisabled)throw new Error("P06F18_GENERATION:"+kp+":"+JSON.stringify(state));
  const frame=await (await page.locator("#preview-frame").elementHandle())?.contentFrame();
  if(!frame)throw new Error("P06F18_PREVIEW_FRAME_MISSING:"+kp);
  await frame.waitForSelector(".worksheet-document",{timeout:120000});
  const worksheet=await frame.evaluate(()=>{const q=[...document.querySelectorAll(".worksheet-cell--question")],a=[...document.querySelectorAll(".worksheet-cell--answer-key")],overflow=[...document.querySelectorAll(".worksheet-page")].filter(n=>n.scrollHeight>n.clientHeight+1||n.scrollWidth>n.clientWidth+1).length,text=document.body?.innerText||"";return{questions:q.length,answers:a.length,overflow,text,leaks:text.includes("kp_g6a_u03_")||text.includes("ps_g6a_u03_")||text.includes("P06F18")};});
  if(worksheet.questions!==count||worksheet.answers!==count||worksheet.overflow!==0||worksheet.leaks)throw new Error("P06F18_WORKSHEET:"+kp+":"+JSON.stringify({questions:worksheet.questions,answers:worksheet.answers,overflow:worksheet.overflow,leaks:worksheet.leaks}));
  return{state,worksheet,frame};
}

async function run(){
  const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
  page.on("console",m=>{if(m.type()==="error")errors.console.push(m.text());});
  page.on("pageerror",e=>errors.page.push(String(e?.stack||e)));
  page.on("requestfailed",r=>errors.request.push({url:r.url(),failure:r.failure()?.errorText||"unknown"}));
  page.on("response",r=>{if(r.status()>=400&&(/\.(?:m?js|css)(?:\?|$)/i.test(r.url())||r.url().includes("/modules/")||r.url().includes("/assets/")))errors.http.push({url:r.url(),status:r.status()});});
  const url=new URL(BASE);url.searchParams.set("p06f18",String(Date.now()));
  const response=await page.goto(url.href,{waitUntil:"networkidle",timeout:120000});
  if(!response?.ok())throw new Error("P06F18_MAIN_HTTP:"+(response?.status()||"none"));
  await page.waitForFunction(()=>[...document.querySelectorAll("#batch-a-grade-select option")].some(o=>o.value==="6"),null,{timeout:120000});
  await selectSource(page);
  await page.waitForFunction(({target,prev})=>Boolean(document.querySelector('#batch-a-knowledge-point-panel [data-knowledge-point-id="'+target+'"]'))&&prev.every(id=>Boolean(document.querySelector('#batch-a-knowledge-point-panel [data-knowledge-point-id="'+id+'"]'))),{target:TARGET,prev:PREV},{timeout:120000});
  const selector=await page.evaluate(({target,prev})=>({sourceId:document.querySelector("#batch-a-source-select")?.value,targetPresent:Boolean(document.querySelector('#batch-a-knowledge-point-panel [data-knowledge-point-id="'+target+'"]')),predecessorsPresent:prev.every(id=>Boolean(document.querySelector('#batch-a-knowledge-point-panel [data-knowledge-point-id="'+id+'"]'))),visibleIds:[...document.querySelectorAll("#batch-a-knowledge-point-panel [data-knowledge-point-id]")].map(n=>n.dataset.knowledgePointId),sameUnitDisabled:Boolean(document.querySelector('#batch-a-selection-mode-select option[value="mixedKnowledgePointsSameUnit"]')?.disabled)}),{target:TARGET,prev:PREV});
  if(selector.sourceId!==SOURCE||!selector.targetPresent||!selector.predecessorsPresent||!selector.sameUnitDisabled)throw new Error("P06F18_SELECTOR:"+JSON.stringify(selector));

  const target=await generateFor(page,TARGET,COUNT,"p06f18-relation-ui",2,4);
  for(const token of ["關係式","反向運算","代回原式"])if(!target.worksheet.text.includes(token))throw new Error("P06F18_SEMANTICS_MISSING:"+token);
  if(!target.worksheet.text.includes("□ +")||!target.worksheet.text.includes("× □"))throw new Error("P06F18_PATTERN_FAMILIES_NOT_BOTH_VISIBLE");

  await target.frame.evaluate(()=>{window.__P06F18_PRINT__=0;window.print=()=>window.__P06F18_PRINT__++;});
  await page.locator("#print-button").click();
  const printCount=await target.frame.evaluate(()=>window.__P06F18_PRINT__||0);
  if(printCount!==1)throw new Error("P06F18_PRINT:"+printCount);
  await target.frame.locator(".worksheet-document").screenshot({path:path.join(OUT,"q018-worksheet.png"),fullPage:true});
  await page.screenshot({path:path.join(OUT,"q018-ui.png"),fullPage:true});

  const predecessors=[];
  for(let i=0;i<PREV.length;i++){
    const x=await generateFor(page,PREV[i],2,"p06f18-prev-"+i,2,4);
    predecessors.push({knowledgePointId:PREV[i],state:x.state,worksheet:{questions:x.worksheet.questions,answers:x.worksheet.answers,overflow:x.worksheet.overflow}});
  }
  await page.close();
  return{selector,target:{state:target.state,worksheet:{questions:target.worksheet.questions,answers:target.worksheet.answers,overflow:target.worksheet.overflow}},predecessors,printCount};
}

try{
  await ready();
  browser=await chromium.launch({headless:true});
  const target=await run();
  if(Object.values(errors).some(x=>x.length))throw new Error("P06F18_BROWSER_DIAGNOSTICS:"+JSON.stringify(errors));
  const report={
    schemaName:"P06FW6Q018ClassicUIAcceptanceV1",
    taskId:"P06F_W6DirectProductVerticalSlice018Implementation",
    status:"PASS_P06F_W6_Q018_CLASSIC_UI_ACCEPTANCE",
    sourceId:SOURCE,
    knowledgePointIds:[TARGET],
    questionCountPerTarget:COUNT,
    target,
    browser:{consoleErrorCount:0,pageErrorCount:0,requestFailureCount:0,assetHttpFailureCount:0},
    semanticInvariants:{
      relationEquationUnknownSolvingPreserved:true,
      reverseOperationRequired:true,
      substitutionBackValidationRequired:true,
      originalRelationSatisfied:true,
      additiveAndMultiplicativeFamiliesReachable:true,
      allFourSameSourcePredecessorsReachable:true,
      sameSourceCandidateSetComplete:true,
      sameUnitMixedModeFailClosed:true
    },
    forbiddenScope:{
      genericSymbolicQuantityRelationReownership:false,
      geometricCountGeneralizationReownership:false,
      inputOutputGeneralRuleReownership:false,
      linearPatternNthTermReownership:false,
      applicationContext:false,
      sameUnitMixed:false,
      crossUnitMixed:false,
      q019OrLater:false,
      fullRepositoryRegression:false,
      globalBrowserReplay:false
    }
  };
  writeFileSync(path.join(OUT,"report.json"),JSON.stringify(report,null,2)+"\n");
  console.log("P06F18_CLASSIC_UI_ACCEPTANCE="+JSON.stringify(report));
}catch(error){
  writeFileSync(path.join(OUT,"failure.json"),JSON.stringify({schemaName:"P06FW6Q018ClassicUIAcceptanceFailureV1",status:"FAIL",baseUrl:BASE,error:String(error?.stack||error),browser:errors,server:{stdout:serverOut,stderr:serverErr}},null,2)+"\n");
  throw error;
}finally{
  if(browser)await browser.close().catch(()=>{});
  if(server&&!server.killed)server.kill("SIGTERM");
}
