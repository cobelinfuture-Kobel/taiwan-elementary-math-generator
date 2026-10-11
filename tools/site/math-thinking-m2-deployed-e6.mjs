// MathThinking M1: exact deployed GitHub Pages E6.
// Tests the public Pages route, not a localhost server or PR preview.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';

const BASE='https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator';
const PILOT_MERGE_SHA='f05e443d26d2eb52d92ae1b4f1dd669ffd7e6cd7';
const paths=[
  ['site/math-thinking/index.html','/math-thinking/'],
  ['site/math-thinking/sum-difference.js','/math-thinking/sum-difference.js'],
  ['site/math-thinking/math-thinking.js','/math-thinking/math-thinking.js'],
  ['site/math-thinking/math-thinking.css','/math-thinking/math-thinking.css'],
  ['site/math-thinking/transfer-equalize.js','/math-thinking/transfer-equalize.js'],
  ['site/math-thinking/learning-path.js','/math-thinking/learning-path.js'],
];
const digest=data=>createHash('sha256').update(data).digest('hex');
async function fetchDeployed(path){
 let error;
 for(let i=0;i<3;i++){
   try{
     const url=BASE+path+(path.includes('?')?'&':'?')+'mtE6='+PILOT_MERGE_SHA+'-'+Date.now()+'-'+i;
     const response=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(45000)});
     if(response.status===200)return Buffer.from(await response.arrayBuffer());
     error=new Error('DEPLOYED_HTTP_'+response.status+': '+path);
   }catch(e){error=e}
 }
 throw error;
}
const witness={schemaVersion:'math-thinking-m2-deployed-e6-v1',task:'MathThinking_M2_ExactPagesE6',pilotMergeSha:PILOT_MERGE_SHA,checks:[]};
let browser;
try{
 for(const [file,url] of paths){
   const local=await readFile(file), deployed=await fetchDeployed(url);
   const a=digest(local),b=digest(deployed);
   assert.equal(b,a,'DEPLOYED_FILE_PARITY_FAILED: '+url);
   witness.checks.push({check:'DEPLOYED_BYTES',url,sha256:b,bytes:deployed.length});
 }
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1366,height:980}});
 const pageErrors=[];
 page.on('pageerror',e=>pageErrors.push(e.message));
 const response=await page.goto(BASE+'/math-thinking/?mtE6='+PILOT_MERGE_SHA,{waitUntil:'networkidle',timeout:60000});
 assert.equal(response?.status(),200);
 assert.equal(await page.locator('body').getAttribute('data-route-kind'),'math-thinking-pilot');
 await page.waitForFunction(()=>document.querySelectorAll('.mt-question').length===6);
 assert.equal(await page.locator('.mt-question svg').count(),6);
 assert.equal(await page.locator('.mt-answer-item').count(),6);
 assert.match((await page.locator('#mt-status').textContent())??'',/逐題驗證 6 題/);
 witness.checks.push({check:'INITIAL_GENERATE_SVG_ANSWER',questions:6,svg:6,answers:6});
 const initial=await page.locator('.mt-question').allTextContents();
 await page.locator('#mt-form button[type="submit"]').click();
 assert.deepEqual(await page.locator('.mt-question').allTextContents(),initial,'SAME_SEED_NOT_REPRODUCIBLE');
 await page.fill('#mt-seed','e6-live-seed-transfer-stage');
 await page.fill('#mt-count','9');
 await page.selectOption('#mt-level','extended');
 await page.selectOption('#mt-diagram','unlabeled');
 await page.locator('#mt-form button[type="submit"]').click();
 await page.waitForFunction(()=>document.querySelectorAll('.mt-question').length===9);
 assert.equal(await page.locator('.mt-answer-item').count(),9);
 assert.equal(await page.locator('.mt-question svg').count(),9);
 assert.match((await page.locator('.mt-question svg').first().innerHTML())??'',/總數：_____/);
 const variants=await page.locator('.mt-question').allTextContents();
 assert.equal(new Set(variants).size,9);
 assert.notDeepEqual(variants.slice(0,6),initial);
 witness.checks.push({check:'SEED_LEVEL_AND_UNLABELED_VARIANTS',count:9,unique:9});
 await page.locator('#mt-answers').uncheck();
 await page.locator('#mt-form button[type="submit"]').click();
 assert.equal(await page.locator('.mt-answer-sheet').count(),0);
 await page.locator('#mt-answers').check();
 await page.locator('#mt-form button[type="submit"]').click();
 assert.equal(await page.locator('.mt-answer-item').count(),9);
 await page.emulateMedia({media:'print'});
 const pdf=await page.pdf({format:'A4',printBackground:true});
 assert.equal(pdf.subarray(0,4).toString(),'%PDF');
 assert.ok(pdf.length>5000);
 witness.checks.push({check:'ANSWER_TOGGLE_AND_A4_PRINT',pdfBytes:pdf.length});
 await page.emulateMedia({media:'screen'});
 await page.setViewportSize({width:375,height:812});
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
 assert.ok(overflow<=3,'MOBILE_HORIZONTAL_OVERFLOW: '+overflow);
 assert.deepEqual(pageErrors,[],'LIVE_PAGE_ERROR');
 witness.checks.push({check:'MOBILE_WIDTH_AND_PAGE_ERRORS',overflow,pageErrorCount:pageErrors.length});
 // M2 adds a second original thinking leaf; also verify it on the exact public deployment.
 await page.selectOption('#mt-topic','mt_topic_transfer_equalization');
 await page.waitForFunction(()=>document.querySelector('.mt-question-sheet h2')?.textContent?.includes('移多補少'));
 assert.equal(await page.locator('.mt-question').count(),9);
 assert.equal(await page.locator('.mt-answer-item').count(),9);
 assert.equal(await page.locator('.mt-question svg').count(),9);
 assert.equal(await page.locator('#mt-path-list li').count(),3);
 assert.equal(await page.locator('#mt-path-list li[aria-current="step"]').getAttribute('data-step'),'S01');
 const texts=await page.locator('.mt-question > p:first-of-type').allTextContents();
 const answers=await page.locator('.mt-answer-item').allTextContents();
 for(let i=0;i<texts.length;i++){
   const numbers=Array.from(texts[i].matchAll(/有 (\d+) /g),x=>Number(x[1]));
   assert.equal(numbers.length,2,'transfer scenario needs two initial quantities');
   const [large,small]=numbers;
   assert.ok(large>small&&(large-small)%2===0);
   assert.ok(answers[i].includes((large-small)+'÷2＝'+(large-small)/2),'answer mismatch at '+i);
 }
 assert.equal(new Set(texts).size,9);
 assert.match((await page.locator('.mt-question svg').first().getAttribute('data-half-difference-width'))??'',/^\d+(?:\.\d+)?$/);
 witness.checks.push({check:'M2_TRANSFER_ANSWER_PARITY_AND_GRAPH',questions:9,answers:9,svgs:9,nodes:3});
 await page.locator('#mt-answers').uncheck();
 await page.locator('#mt-form button[type=submit]').click();
 assert.equal(await page.locator('.mt-answer-item').count(),0);
 await page.locator('#mt-answers').check();
 await page.locator('#mt-form button[type=submit]').click();
 assert.equal(await page.locator('.mt-answer-item').count(),9);
 await page.emulateMedia({media:'print'});
 const transferPdf=await page.pdf({format:'A4',printBackground:true});
 assert.equal(transferPdf.subarray(0,4).toString(),'%PDF');
 assert.ok(transferPdf.length>5000);
 await page.emulateMedia({media:'screen'});
 const mobileOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
 assert.ok(mobileOverflow<=3,'M2_MOBILE_OVERFLOW '+mobileOverflow);
 witness.checks.push({check:'M2_PRINT_AND_MOBILE',pdfBytes:transferPdf.length,mobileOverflow});
 await page.selectOption('#mt-topic','mt_topic_sum_difference');
 await page.waitForFunction(()=>document.querySelector('.mt-question-sheet h2')?.textContent?.includes('和差問題'));
 assert.equal(await page.locator('.mt-question').count(),9);
 witness.checks.push({check:'M2_SUM_DIFFERENCE_EXISTING_TOPIC_RETAINED',questions:9});
 assert.deepEqual(pageErrors,[],'LIVE_PAGE_ERROR_AFTER_TOPIC_SWITCH');

 witness.result='PASS_M2_EXACT_PUBLIC_PAGES_E6';
 console.log('MATH_THINKING_M2_E6_READBACK='+JSON.stringify(witness));
} catch(error){
 witness.result='FAIL';
 witness.error=String(error?.stack||error);
 console.error('MATH_THINKING_M2_E6_READBACK='+JSON.stringify(witness));
 throw error;
} finally {await browser?.close();}
