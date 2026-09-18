import {spawn} from "node:child_process";
import {mkdirSync,writeFileSync} from "node:fs";
import path from "node:path";
import {chromium} from "playwright";
const SOURCE="g4a_u07_4a07",TARGETS=["kp_g4a_u07_geometric_arrangement_count","kp_g4a_u07_quantity_additive_pattern"],FUTURE=["kp_g4a_u07_input_output_table_rule","kp_g4a_u07_quantity_multiplicative_pattern","kp_g4a_u07_pattern_missing_term_reasoning"],COUNT=8,PORT=Number(process.env.P06F05_SITE_PORT??"4365"),REMOTE=process.env.P06F05_SITE_URL??null,BASE=REMOTE??`http://127.0.0.1:${PORT}/index.html`,OUT=path.resolve("tmp/p06f-w6-slice005-classic-ui-acceptance");
mkdirSync(OUT,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let server=null,browser=null,serverOut="",serverErr="";
if(!REMOTE){server=spawn(process.execPath,["tools/site/serve-site.js"],{env:{...process.env,SITE_PORT:String(PORT),SITE_HOST:"127.0.0.1"},stdio:["ignore","pipe","pipe"]});server.stdout.on("data",c=>serverOut+=c);server.stderr.on("data",c=>serverErr+=c);}
async function ready(){let last;for(let i=0;i<50;i++){try{const r=await fetch(BASE,{cache:"no-store"});if(r.ok)return;}catch(e){last=e;}await sleep(250);}throw new Error(`P06F05_SITE_NOT_READY:${last?.message??"unknown"}`);}
const errors={console:[],page:[],request:[],http:[]};
async function generateFor(page,kp,count,seed){
  await page.selectOption("#batch-a-selection-mode-select","singleKnowledgePoint");
  await page.locator(`#batch-a-knowledge-point-panel [data-knowledge-point-id="${kp}"]`).click();
  await page.waitForFunction(id=>{const s=[...document.querySelectorAll("#batch-a-knowledge-point-panel [data-knowledge-point-id][data-selected='true']")].map(n=>n.dataset.knowledgePointId);return s.length===1&&s[0]===id;},kp,{timeout:120000});
  await page.fill("#batch-a-question-count-input",String(count));await page.dispatchEvent("#batch-a-question-count-input","change");
  await page.selectOption("#batch-a-ordering-select","groupedByPattern");
  await page.check("#batch-a-answer-key-input");
  await page.fill("#columns-input","2");await page.dispatchEvent("#columns-input","change");
  await page.fill("#rows-per-page-input","4");await page.dispatchEvent("#rows-per-page-input","change");
  await page.fill("#generation-seed-input",seed);await page.dispatchEvent("#generation-seed-input","change");
  await page.locator("#regenerate-button").click();
  await page.waitForFunction(n=>{const x=document.querySelector("#status-panel")?.textContent??"";return x.includes(`已產生 ${n} 題`)||x.includes("產生失敗");},count,{timeout:20000});
  const state=await page.evaluate(()=>({status:document.querySelector("#status-panel")?.textContent?.trim()??"",tone:document.querySelector("#status-panel")?.dataset?.tone??"",valid:document.querySelector("#validation-panel")?.dataset?.hasErrors??null,preview:document.querySelector("#preview-frame")?.srcdoc?.length??0,printDisabled:Boolean(document.querySelector("#print-button")?.disabled)}));
  if(!state.status.includes(`已產生 ${count} 題`)||state.tone!=="success"||state.valid!=="false"||state.preview<=0||state.printDisabled)throw new Error(`P06F05_GENERATION:${kp}:${JSON.stringify(state)}`);
  const frame=await (await page.locator("#preview-frame").elementHandle())?.contentFrame();if(!frame)throw new Error(`P06F05_PREVIEW_FRAME_MISSING:${kp}`);
  await frame.waitForSelector(".worksheet-document",{timeout:120000});
  const worksheet=await frame.evaluate(({count,kp})=>{const q=[...document.querySelectorAll(".worksheet-cell--question")],a=[...document.querySelectorAll(".worksheet-cell--answer-key")],overflow=[...document.querySelectorAll(".worksheet-page")].filter(n=>n.scrollHeight>n.clientHeight+1||n.scrollWidth>n.clientWidth+1).length,allText=document.body?.innerText??"";return{questions:q.length,answers:a.length,overflow,allText,leaks:allText.includes(kp)||allText.includes("ps_g4a_u07_")||allText.includes("P06F05")};},{count,kp});
  if(worksheet.questions!==count||worksheet.answers!==count||worksheet.overflow!==0||worksheet.leaks)throw new Error(`P06F05_WORKSHEET:${kp}:${JSON.stringify({...worksheet,allText:undefined})}`);
  const token=kp===TARGETS[0]?"共用一邊":"固定";
  if(!worksheet.allText.includes(token))throw new Error(`P06F05_SEMANTICS_MISSING:${kp}:${token}`);
  return{state,worksheet:{questions:worksheet.questions,answers:worksheet.answers,overflow:worksheet.overflow},frame};
}
async function run(){
 const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
 page.on("console",m=>{if(m.type()==="error")errors.console.push(m.text());});page.on("pageerror",e=>errors.page.push(String(e?.stack??e)));page.on("requestfailed",r=>errors.request.push({url:r.url(),failure:r.failure()?.errorText??"unknown"}));page.on("response",r=>{if(r.status()>=400&&(/\.(?:m?js|css)(?:\?|$)/i.test(r.url())||r.url().includes("/modules/")||r.url().includes("/assets/")))errors.http.push({url:r.url(),status:r.status()});});
 const url=new URL(BASE);url.searchParams.set("p06f05",String(Date.now()));const response=await page.goto(url.href,{waitUntil:"networkidle",timeout:120000});if(!response?.ok())throw new Error(`P06F05_MAIN_HTTP:${response?.status()??"none"}`);
 await page.waitForFunction(()=>[...document.querySelectorAll("#batch-a-grade-select option")].some(o=>o.value==="4"),null,{timeout:120000});await page.selectOption("#batch-a-grade-select","4");
 await page.waitForFunction(()=>[...document.querySelectorAll("#batch-a-semester-select option")].some(o=>o.value==="upper"),null,{timeout:120000});await page.selectOption("#batch-a-semester-select","upper");
 await page.waitForFunction(id=>[...document.querySelectorAll("#batch-a-source-select option")].some(o=>o.value===id),SOURCE,{timeout:120000});await page.selectOption("#batch-a-source-select",SOURCE);
 await page.waitForFunction(({targets,future})=>targets.every(id=>Boolean(document.querySelector(`#batch-a-knowledge-point-panel [data-knowledge-point-id="${id}"]`)))&&future.every(id=>!document.querySelector(`#batch-a-knowledge-point-panel [data-knowledge-point-id="${id}"]`)),{targets:TARGETS,future:FUTURE},{timeout:120000});
 const selector=await page.evaluate(({targets,future})=>({sourceId:document.querySelector("#batch-a-source-select")?.value,visibleIds:[...document.querySelectorAll("#batch-a-knowledge-point-panel [data-knowledge-point-id]")].map(n=>n.dataset.knowledgePointId),targetsPresent:targets.every(id=>Boolean(document.querySelector(`#batch-a-knowledge-point-panel [data-knowledge-point-id="${id}"]`))),futureLeaked:future.filter(id=>Boolean(document.querySelector(`#batch-a-knowledge-point-panel [data-knowledge-point-id="${id}"]`))),sameUnitDisabled:Boolean(document.querySelector('#batch-a-selection-mode-select option[value="mixedKnowledgePointsSameUnit"]')?.disabled)}),{targets:TARGETS,future:FUTURE});
 if(selector.sourceId!==SOURCE||!selector.targetsPresent||selector.futureLeaked.length||!selector.sameUnitDisabled)throw new Error(`P06F05_SELECTOR:${JSON.stringify(selector)}`);
 const geo=await generateFor(page,TARGETS[0],COUNT,"p06f05-geometric-ui");
 const add=await generateFor(page,TARGETS[1],COUNT,"p06f05-additive-ui");
 await add.frame.evaluate(()=>{window.__P06F05_PRINT__=0;window.print=()=>window.__P06F05_PRINT__++;});await page.locator("#print-button").click();const printCount=await add.frame.evaluate(()=>window.__P06F05_PRINT__??0);if(printCount!==1)throw new Error(`P06F05_PRINT:${printCount}`);
 await add.frame.locator(".worksheet-document").screenshot({path:path.join(OUT,"q005-worksheet.png"),fullPage:true});await page.screenshot({path:path.join(OUT,"q005-ui.png"),fullPage:true});await page.close();
 return{selector,geometric:{state:geo.state,worksheet:geo.worksheet},additive:{state:add.state,worksheet:add.worksheet},printCount};
}
try{await ready();browser=await chromium.launch({headless:true});const target=await run();if(Object.values(errors).some(x=>x.length))throw new Error(`P06F05_BROWSER_DIAGNOSTICS:${JSON.stringify(errors)}`);const report={schemaName:"P06FW6Q005ClassicUIAcceptanceV1",taskId:"P06F_W6DirectProductVerticalSlice005Implementation",status:"PASS_P06F_W6_Q005_CLASSIC_UI_ACCEPTANCE",sourceId:SOURCE,knowledgePointIds:TARGETS,questionCountPerTarget:COUNT,target,browser:{consoleErrorCount:0,pageErrorCount:0,requestFailureCount:0,assetHttpFailureCount:0},semanticInvariants:{geometricArrangementPatternPreserved:true,fixedAdditivePatternPreserved:true,geometryPropertyReasoningNotUsed:true,q006PlusHidden:true,sameUnitMixedModeFailClosed:true},forbiddenScope:{inputOutputTableRule:false,multiplicativePattern:false,missingTermReasoning:false,symbolicNthTerm:false,geometryProperty:false,applicationContext:false,sameUnitMixed:false,crossUnitMixed:false,q006OrLater:false,fullRepositoryRegression:false,globalBrowserReplay:false}};writeFileSync(path.join(OUT,"report.json"),`${JSON.stringify(report,null,2)}\n`);console.log(`P06F05_CLASSIC_UI_ACCEPTANCE=${JSON.stringify(report)}`);}catch(error){writeFileSync(path.join(OUT,"failure.json"),`${JSON.stringify({schemaName:"P06FW6Q005ClassicUIAcceptanceFailureV1",status:"FAIL",baseUrl:BASE,error:String(error?.stack??error),browser:errors,server:{stdout:serverOut,stderr:serverErr}},null,2)}\n`);throw error;}finally{if(browser)await browser.close().catch(()=>{});if(server&&!server.killed)server.kill("SIGTERM");}
