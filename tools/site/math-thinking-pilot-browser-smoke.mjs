// Focused browser acceptance for independent MathThinking pilot.
// This runner uses only its new route; no existing Taiwan curriculum route is changed.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import process from 'node:process';
import {chromium} from 'playwright';

const port=4376;
const origin='http://127.0.0.1:'+port;
const server=spawn(process.execPath,['tools/site/serve-site.js'],{
 env:{...process.env,SITE_PORT:String(port),SITE_HOST:'127.0.0.1'},stdio:['ignore','pipe','pipe']
});
let serverMessages='';
server.stdout.on('data',chunk=>{serverMessages+=chunk.toString();});
server.stderr.on('data',chunk=>{serverMessages+=chunk.toString();});
async function waitUntilReady(){
 const deadline=Date.now()+20000;
 while(Date.now()<deadline){
   try{const r=await fetch(origin+'/math-thinking/');if(r.status===200)return;}catch{}
   await new Promise(resolve=>setTimeout(resolve,160));
 }
 throw new Error('MathThinking site server not ready: '+serverMessages.slice(-1400));
}
let browser;
try{
 await waitUntilReady();
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 const pageErrors=[],consoleErrors=[];
 page.on('pageerror',e=>pageErrors.push(String(e)));
 page.on('console',msg=>{if(msg.type()==='error')consoleErrors.push(msg.text());});
 const response=await page.goto(origin+'/math-thinking/',{waitUntil:'networkidle'});
 assert.equal(response.status(),200);
 await page.waitForFunction(()=>document.querySelectorAll('.mt-question').length===6);
 assert.match(await page.locator('#mt-status').textContent(),/逐題驗證 6 題/);
 assert.equal(await page.locator('.mt-answer-item').count(),6);
 assert.equal(await page.locator('.mt-question svg').count(),6);
 const witness=await page.locator('.mt-question').first().locator('svg').getAttribute('aria-label');
 assert.match(witness,/和差線段圖/);
 const texts=await page.locator('.mt-question').allTextContents();
 assert.equal(new Set(texts).size,6);
 await page.selectOption('#mt-diagram','unlabeled');
 await page.fill('#mt-count','9');
 await page.locator('#mt-form button[type=submit]').click();
 await page.waitForFunction(()=>document.querySelectorAll('.mt-question').length===9);
 assert.match(await page.locator('.mt-question svg').first().innerHTML(),/總數：_____/);
 await page.locator('#mt-answers').uncheck();
 await page.locator('#mt-form button[type=submit]').click();
 assert.equal(await page.locator('.mt-question').count(),9);
 assert.equal(await page.locator('.mt-answer-sheet').count(),0);
 await page.locator('#mt-answers').check();
 await page.locator('#mt-form button[type=submit]').click();
 assert.equal(await page.locator('.mt-answer-item').count(),9);
 await page.emulateMedia({media:'print'});
 const pdf=await page.pdf({format:'A4',printBackground:true});
 assert.ok(pdf.length>5000,'A4 print PDF unexpectedly empty');
 assert.equal(pdf.subarray(0,4).toString(),'%PDF');
 await page.setViewportSize({width:375,height:820});
 await page.emulateMedia({media:'screen'});
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
 assert.ok(overflow<=3,'mobile horizontal overflow '+overflow);
 assert.deepEqual(pageErrors,[]);
 assert.deepEqual(consoleErrors,[]);
 console.log('MATH_THINKING_PILOT_E2E_PASS '+JSON.stringify({questions:9,answers:9,pdfBytes:pdf.length,overflow}));
}finally{
 if(browser)await browser.close();
 server.kill('SIGTERM');
}
