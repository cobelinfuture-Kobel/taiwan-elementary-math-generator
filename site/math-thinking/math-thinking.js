import {buildPilotWorksheet,renderSumDifferenceSvg,solutionSteps} from './sum-difference.js';
const form=document.getElementById('mt-form');
const out=document.getElementById('mt-output');
const status=document.getElementById('mt-status');
const printButton=document.getElementById('mt-print');
function esc(x){return String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');}
function renderPilot(data){
 const questions=data.questions.map((q,i)=>'<article class="mt-question"><h3>第 '+(i+1)+' 題</h3><p>'+esc(q.text)+'</p>'+(data.diagram==='none'?'':renderSumDifferenceSvg(q,{guided:data.diagram==='guided'}))+'<p class="mt-work">列式：________________________________________________</p><p class="mt-work">答：__________________________________________________</p></article>').join('');
 const answerSection=data.answers?'<section class="mt-answer-sheet"><h2>和差問題｜答案與解題過程</h2>'+data.questions.map((q,i)=>'<article class="mt-answer-item"><h3>第 '+(i+1)+' 題</h3>'+solutionSteps(q).map(step=>'<p>'+esc(step)+'</p>').join('')+'</article>').join('')+'</section>':'';
 out.innerHTML='<section class="mt-question-sheet"><h2>數學思維｜和差問題練習卷</h2><p>班級：________　姓名：________　日期：________</p>'+questions+'</section>'+answerSection;
}
form.addEventListener('submit',event=>{
 event.preventDefault();
 try {
   const data=buildPilotWorksheet({count:Number(document.getElementById('mt-count').value),seed:document.getElementById('mt-seed').value,level:document.getElementById('mt-level').value,diagram:document.getElementById('mt-diagram').value,answers:document.getElementById('mt-answers').checked});
   if(!data.validated)throw new Error('題目驗算未通過');
   renderPilot(data);
   status.textContent='已產生並逐題驗證 '+data.questions.length+' 題；題型狀態為工程原型，尚未接入臺灣課綱。';
   printButton.disabled=false;
 }catch(error){out.replaceChildren();printButton.disabled=true;status.textContent='產題失敗：'+String(error.message||error);}
});
printButton.addEventListener('click',()=>{if(!printButton.disabled)window.print();});
form.requestSubmit();
