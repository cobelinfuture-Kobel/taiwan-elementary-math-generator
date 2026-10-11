// M2 focused browser acceptance: local isolated route, original transfer and regression of sum-difference.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const port=4378,base='http://127.0.0.1:'+port;
const server=spawn(process.execPath,['tools/site/serve-site.js'],{env:{...process.env,SITE_PORT:String(port),SITE_HOST:'127.0.0.1'},stdio:'ignore'});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function waitForServer(){for(let i=0;i<100;i++){try{if((await fetch(base+'/math-thinking/')).status===200)return;}catch{}await delay(150);}throw new Error('site server not ready');}
let browser;
try{
 await waitForServer();
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const r=await page.goto(base+'/math-thinking/',{waitUntil:'networkidle'});
 assert.equal(r.status(),200);
 await page.waitForFunction(()=>document.querySelectorAll('.mt-question').length===6);
 assert.equal(await page.locator('#mt-topic').inputValue(),'mt_topic_sum_difference');
 assert.equal(await page.locator('.mt-question svg').count(),6);
 assert.equal(await page.locator('.mt-answer-item').count(),6);
 assert.match(await page.locator('.mt-question-sheet h2').textContent(),/和差問題/);
 assert.equal(await page.locator('#mt-path-list li').count(),3);
 await page.selectOption('#mt-topic','mt_topic_transfer_equalization');
 await page.waitForFunction(()=>document.querySelector('.mt-question-sheet h2')?.textContent?.includes('移多補少'));
 assert.equal(await page.locator('.mt-question svg').count(),6);
 assert.equal(await page.locator('.mt-answer-item').count(),6);
 assert.match((await page.locator('.mt-question svg').first().getAttribute('data-half-difference-width'))??'',
  /^\d+(?:\.\d+)?$/);
 const initial=await page.locator('.mt-question').allTextContents();
 await page.locator('#mt-form button[type="submit"]').click();
 assert.deepEqual(await page.locator('.mt-question').allTextContents(),initial);
 await page.fill('#mt-count','9');
 await page.selectOption('#mt-diagram','unlabeled');
 await page.locator('#mt-form button[type="submit"]').click();
 await page.waitForFunction(()=>document.querySelectorAll('.mt-question').length===9);
 assert.match((await page.locator('.mt-question svg').first().innerHTML())??'',/相差：_____/);
 const examples=await page.locator('.mt-question').allTextContents();
 assert.equal(new Set(examples).size,9);
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
 await page.emulateMedia({media:'screen'});
 await page.setViewportSize({width:375,height:812});
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
 assert.ok(overflow<=3,'mobile overflow '+overflow);
 await page.selectOption('#mt-topic','mt_topic_sum_difference');
 await page.waitForFunction(()=>document.querySelector('.mt-question-sheet h2')?.textContent?.includes('和差問題'));
 assert.equal(await page.locator('.mt-question').count(),9);
 assert.deepEqual(errors,[]);
 console.log('MATH_THINKING_M2_FOCUSED_E2E_PASS='+JSON.stringify({topicNodes:3,transferQuestions:9,transferAnswers:9,pdfBytes:pdf.length,mobileOverflow:overflow,sumDifferenceStillWorks:true}));
}finally{await browser?.close();server.kill('SIGTERM');}
