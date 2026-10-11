// MathThinking S01 — original, source-neutral sum-and-difference pilot.
// No external question text, image or curricular KP identity is consumed here.
export const TOPIC_ID = 'mt_topic_sum_difference';
export const KNOWLEDGE_POINT_ID = 'mt_kp_sum_difference_two_groups';
const CONTEXTS = Object.freeze([
  { id: 'school-books', more: '科學書', less: '故事書', unit: '本', place: '學校圖書角' },
  { id: 'paper-flowers', more: '紅色紙花', less: '黃色紙花', unit: '朵', place: '美術社' },
  { id: 'robot-parts', more: '銀色零件', less: '藍色零件', unit: '個', place: '機器人社團' },
  { id: 'garden-plants', more: '向日葵', less: '雛菊', unit: '株', place: '校園花圃' },
  { id: 'model-blocks', more: '長形積木', less: '方形積木', unit: '塊', place: '積木教室' },
  { id: 'science-tickets', more: '學生入場券', less: '家長入場券', unit: '張', place: '校園科學展' },
  { id: 'craft-cards', more: '星星卡片', less: '月亮卡片', unit: '張', place: '手作教室' },
  { id: 'classroom-stickers', more: '彩虹貼紙', less: '雲朵貼紙', unit: '張', place: '班級布告欄' }
]);
function fnv1a(input) {
  let h=2166136261;
  for(const c of String(input)){h=Math.imul(h ^ c.charCodeAt(0),16777619);}
  return h>>>0;
}
function randomFactory(seed){
  let state=fnv1a(seed)||1;
  return ()=>{state+=0x6D2B79F5;let t=state;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};
}
function between(rng,min,max){return min+Math.floor(rng()*(max-min+1));}
export function createSumDifferenceQuestion({small,difference,contextId='school-books',index=1}){
  const context=CONTEXTS.find(x=>x.id===contextId);
  if(!context || !Number.isSafeInteger(small)|| !Number.isSafeInteger(difference)||small<1||difference<1||!Number.isSafeInteger(index)||index<1)throw new RangeError('invalid parameters');
  const large=small+difference;const total=small+large;
  if(!Number.isSafeInteger(total))throw new RangeError('integer overflow');
  const text=context.place+'的'+context.more+'和'+context.less+'共有 '+total+' '+context.unit+'，'+context.more+'比'+context.less+'多 '+difference+' '+context.unit+'。請問兩種各有多少'+context.unit+'？';
  const result={questionId:'MT-SD-'+String(index).padStart(3,'0'),topicId:TOPIC_ID,knowledgePointId:KNOWLEDGE_POINT_ID,originality:'MODEL_GENERATED_ORIGINAL',contextId,more:context.more,less:context.less,unit:context.unit,small,large,difference,total,text};
  if(!validateSumDifferenceQuestion(result))throw new Error('generated witness is not valid');
  return Object.freeze(result);
}
export function validateSumDifferenceQuestion(q){
  if(!q||q.topicId!==TOPIC_ID||q.knowledgePointId!==KNOWLEDGE_POINT_ID||q.originality!=='MODEL_GENERATED_ORIGINAL')return false;
  if(!CONTEXTS.some(c=>c.id===q.contextId&&c.more===q.more&&c.less===q.less&&c.unit===q.unit))return false;
  if(![q.small,q.large,q.difference,q.total].every(Number.isSafeInteger))return false;
  return q.small>0&&q.large>q.small&&q.difference>0&&q.total>q.difference
    &&(q.total-q.difference)%2===0&&q.large-q.small===q.difference
    &&q.large+q.small===q.total&&(q.total-q.difference)/2===q.small;
}
export function generateSumDifferenceQuestions({count=6,seed='math-thinking-pilot',level='basic'}={}){
  if(!Number.isInteger(count)||count<1||count>30)throw new RangeError('count out of range');
  if(!['basic','extended'].includes(level))throw new RangeError('unsupported difficulty');
  const rng=randomFactory(String(seed)+'|'+level);const rows=[];const seen=new Set();
  const smallRange=level==='basic'?[12,80]:[80,400];
  const differenceRange=level==='basic'?[2,45]:[25,280];
  for(let attempt=0;rows.length<count&&attempt<3000;attempt++){
    const small=between(rng,...smallRange),difference=between(rng,...differenceRange);
    const context=CONTEXTS[between(rng,0,CONTEXTS.length-1)];
    const key=[small,difference,context.id].join(':');
    if(seen.has(key))continue;
    seen.add(key);
    rows.push(createSumDifferenceQuestion({small,difference,contextId:context.id,index:rows.length+1}));
  }
  if(rows.length!==count)throw new Error('distinct capacity insufficient');
  return rows;
}
export function solutionSteps(q){
  if(!validateSumDifferenceQuestion(q))throw new Error('invalid question cannot have an answer');
  return Object.freeze([
    '('+q.total+'－'+q.difference+')÷2＝'+q.small+'（'+q.unit+'）',
    q.small+'＋'+q.difference+'＝'+q.large+'（'+q.unit+'）',
    '答：'+q.more+' '+q.large+' '+q.unit+'；'+q.less+' '+q.small+' '+q.unit+'。'
  ]);
}
function esc(x){return String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');}
export function renderSumDifferenceSvg(q,{guided=true}={}){
  if(!validateSumDifferenceQuestion(q))throw new Error('invalid diagram model');
  const maximumBar=365, start=142, base=maximumBar*q.small/q.large, extra=maximumBar-base;
  const labelTotal=guided?('總數 '+q.total+' '+q.unit):'總數：_____';
  const labelDifference=guided?('多 '+q.difference+' '+q.unit):'多：_____';
  return '<svg viewBox="0 0 555 154" role="img" aria-label="'+esc(q.more+'與'+q.less+'的和差線段圖')+'" xmlns="http://www.w3.org/2000/svg">'
    +'<text x="135" y="16" font-size="13" fill="#29445e">'+esc(labelTotal)+'</text>'
    +'<text x="6" y="58" font-size="13" fill="#263e53">'+esc(q.less)+'</text>'
    +'<rect x="'+start+'" y="38" width="'+base.toFixed(3)+'" height="27" fill="#c5dff5" stroke="#386b95" stroke-width="1.5" />'
    +'<text x="145" y="57" font-size="14" fill="#214766">？</text>'
    +'<text x="6" y="111" font-size="13" fill="#263e53">'+esc(q.more)+'</text>'
    +'<rect x="'+start+'" y="89" width="'+base.toFixed(3)+'" height="27" fill="#c5dff5" stroke="#386b95" stroke-width="1.5"/>'
    +'<rect x="'+(start+base).toFixed(3)+'" y="89" width="'+extra.toFixed(3)+'" height="27" fill="#f9dbab" stroke="#a56c22" stroke-width="1.5"/>'
    +'<text x="145" y="109" font-size="14" fill="#214766">？</text>'
    +'<text x="365" y="142" font-size="13" text-anchor="middle" fill="#874e0e">'+esc(labelDifference)+'</text>'
    +'<line x1="'+(start+base).toFixed(3)+'" x2="'+(start+base).toFixed(3)+'" y1="119" y2="128" stroke="#a56c22" />'
    +'<line x1="507" x2="507" y1="119" y2="128" stroke="#a56c22" />'
    +'<line x1="'+(start+base).toFixed(3)+'" x2="507" y1="127" y2="127" stroke="#a56c22" />'
    +'</svg>';
}
export function buildPilotWorksheet({count=6,seed='math-thinking-pilot',level='basic',diagram='guided',answers=true}={}){
  if(!['guided','unlabeled','none'].includes(diagram))throw new RangeError('invalid diagram mode');
  const questions=generateSumDifferenceQuestions({count,seed,level});
  return Object.freeze({worksheetId:'mt-sum-difference-pilot',questions,diagram,answers:!!answers,validated:questions.every(validateSumDifferenceQuestion)});
}
