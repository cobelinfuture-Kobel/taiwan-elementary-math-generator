import {buildPilotWorksheet,renderSumDifferenceSvg,solutionSteps} from './sum-difference.js';
import {buildTransferWorksheet,renderTransferSvg,transferSolutionSteps} from './transfer-equalize.js';
import {renderLearningPathHtml,recommendedReadiness} from './learning-path.js';

const form=document.getElementById('mt-form');
const out=document.getElementById('mt-output');
const status=document.getElementById('mt-status');
const printButton=document.getElementById('mt-print');
const topicInput=document.getElementById('mt-topic');
const pathList=document.getElementById('mt-path-list');
const SUM_DIFFERENCE='mt_topic_sum_difference';
const TRANSFER='mt_topic_transfer_equalization';
function esc(x){return String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');}
function topicTitle(topic){return topic===TRANSFER?'移多補少':'和差問題';}
function diagramOf(question,guided){
 return question.topicId===TRANSFER?renderTransferSvg(question,{guided}):renderSumDifferenceSvg(question,{guided});
}
function stepsOf(question){return question.topicId===TRANSFER?transferSolutionSteps(question):solutionSteps(question);}
function updateGuidance(){
 const topic=topicInput.value;
 pathList.innerHTML=renderLearningPathHtml(topic);
 // This is a recommendation, not an unlock decision and not mastery evidence.
 const assessment=recommendedReadiness(topic,[]);
 const note=document.querySelector('.mt-note');
 note.textContent='建議順序：S00 數量比較與線段圖 → S01 移多補少 → S02 和差問題。'+
  '目前主題需要 '+assessment.missing.length+' 項未認證的先備能力，仍可自由練習。尚未提供正式前測或自動解鎖。';
}
function renderPilot(data){
 const topic=data.questions[0]?.topicId??SUM_DIFFERENCE;
 const title=topicTitle(topic);
 const questions=data.questions.map((q,i)=>'<article class="mt-question"><h3>第 '+(i+1)+' 題</h3><p>'+esc(q.text)+'</p>'
 +(data.diagram==='none'?'':diagramOf(q,data.diagram==='guided'))
 +'<p class="mt-work">列式：________________________________________________</p><p class="mt-work">答：__________________________________________________</p></article>').join('');
 const answerSection=data.answers?'<section class="mt-answer-sheet"><h2>'+title+'｜答案與解題過程</h2>'
  +data.questions.map((q,i)=>'<article class="mt-answer-item"><h3>第 '+(i+1)+' 題</h3>'
  +stepsOf(q).map(line=>'<p>'+esc(line)+'</p>').join('')+'</article>').join('')+'</section>':'';
 out.innerHTML='<section class="mt-question-sheet"><h2>數學思維｜'+title+'練習卷</h2><p>班級：________　姓名：________　日期：________</p>'+questions+'</section>'+answerSection;
}
form.addEventListener('submit',event=>{
 event.preventDefault();
 try{
  const topic=topicInput.value;
  if(topic!==TRANSFER&&topic!==SUM_DIFFERENCE)throw new RangeError('不支援的學習主題');
  const options={count:Number(document.getElementById('mt-count').value),seed:document.getElementById('mt-seed').value,
   level:document.getElementById('mt-level').value,diagram:document.getElementById('mt-diagram').value,
   answers:document.getElementById('mt-answers').checked};
  const data=topic===TRANSFER?buildTransferWorksheet(options):buildPilotWorksheet(options);
  if(!data.validated)throw new Error('題目驗算未通過');
  renderPilot(data);
  updateGuidance();
  status.textContent='已產生並逐題驗證 '+data.questions.length+' 題（'+topicTitle(topic)+'）；獨立題型原型，尚未自動導入臺灣課綱。';
  printButton.disabled=false;
 }catch(e){out.replaceChildren();printButton.disabled=true;status.textContent='產題失敗：'+String(e.message||e);}
});
topicInput.addEventListener('change',()=>form.requestSubmit());
printButton.addEventListener('click',()=>{if(!printButton.disabled)window.print();});
form.requestSubmit();
