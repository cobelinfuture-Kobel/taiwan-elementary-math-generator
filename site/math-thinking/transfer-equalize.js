// MathThinking M2: mathematically original transfer equalisation, independent of textbook wording.
export const TOPIC_ID='mt_topic_transfer_equalization';
export const KNOWLEDGE_POINT_ID='mt_kp_transfer_equalize_two_groups';
const CONTEXTS=Object.freeze([
 {id:'robot',place:'機器人社團',large:'甲組',small:'乙組',thing:'零件',unit:'個'},
 {id:'puzzle',place:'益智遊戲區',large:'紅盒',small:'藍盒',thing:'拼圖',unit:'片'},
 {id:'art',place:'手作教室',large:'左籃',small:'右籃',thing:'紙星星',unit:'顆'},
 {id:'library',place:'圖書角',large:'甲書架',small:'乙書架',thing:'繪本',unit:'本'},
 {id:'building',place:'積木教室',large:'第一組',small:'第二組',thing:'積木',unit:'塊'},
 {id:'science',place:'自然實驗室',large:'甲盒',small:'乙盒',thing:'觀察卡',unit:'張'},
 {id:'music',place:'音樂教室',large:'左箱',small:'右箱',thing:'節奏卡',unit:'張'},
 {id:'class',place:'班級活動',large:'甲桌',small:'乙桌',thing:'貼紙',unit:'張'}
]);
function hash(input){let h=2166136261;for(const c of String(input))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
function rng(seed){let s=hash(seed)||1;return ()=>{s+=0x6D2B79F5;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
function intBetween(r,min,max){return min+Math.floor(r()*(max-min+1));}
function wording(c,big,small){return c.place+'的'+c.large+'有 '+big+' '+c.unit+c.thing+'，'+c.small+'有 '+small+' '+c.unit+c.thing+'。從'+c.large+'移多少'+c.unit+c.thing+'到'+c.small+'，兩邊才會一樣多？';}
function esc(s){return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');}
export function validateTransferQuestion(q){
 if(!q||q.topicId!==TOPIC_ID||q.knowledgePointId!==KNOWLEDGE_POINT_ID||q.originality!=='MODEL_GENERATED_ORIGINAL')return false;
 const c=CONTEXTS.find(x=>x.id===q.contextId);
 if(!c||q.largerGroup!==c.large||q.smallerGroup!==c.small||q.thing!==c.thing||q.unit!==c.unit)return false;
 if(![q.initialLarge,q.initialSmall,q.transfer,q.difference,q.total,q.finalEach].every(Number.isSafeInteger))return false;
 return q.initialSmall>0&&q.transfer>0&&q.initialLarge>q.initialSmall
   &&q.initialLarge-q.initialSmall===q.difference&&q.difference===2*q.transfer
   &&q.initialLarge+q.initialSmall===q.total
   &&q.initialLarge-q.transfer===q.finalEach&&q.initialSmall+q.transfer===q.finalEach
   &&2*q.finalEach===q.total&&q.text===wording(c,q.initialLarge,q.initialSmall);
}
export function createTransferQuestion({small,transfer,contextId='robot',index=1}){
 const c=CONTEXTS.find(x=>x.id===contextId);
 if(!c||![small,transfer,index].every(Number.isSafeInteger)||small<1||transfer<1||index<1)throw new RangeError('invalid transfer parameters');
 const initialLarge=small+2*transfer,total=initialLarge+small,finalEach=small+transfer;
 if(![initialLarge,total,finalEach].every(Number.isSafeInteger))throw new RangeError('integer overflow');
 const q={questionId:'MT-TE-'+String(index).padStart(3,'0'),topicId:TOPIC_ID,knowledgePointId:KNOWLEDGE_POINT_ID,originality:'MODEL_GENERATED_ORIGINAL',contextId,largerGroup:c.large,smallerGroup:c.small,thing:c.thing,unit:c.unit,initialLarge,initialSmall:small,transfer,difference:2*transfer,total,finalEach,text:wording(c,initialLarge,small)};
 if(!validateTransferQuestion(q))throw new Error('invalid generated witness');
 return Object.freeze(q);
}
export function generateTransferQuestions({count=6,seed='mt-transfer-pilot',level='basic'}={}){
 if(!Number.isInteger(count)||count<1||count>30)throw new RangeError('count must be between 1 and 30');
 if(!['basic','extended'].includes(level))throw new RangeError('invalid level');
 const r=rng(String(seed)+'|transfer|'+level),out=[],seen=new Set();
 const smallRange=level==='basic'?[8,70]:[75,350],moveRange=level==='basic'?[2,25]:[25,140];
 for(let n=0;out.length<count&&n<3000;n++){
  const small=intBetween(r,...smallRange),transfer=intBetween(r,...moveRange),context=CONTEXTS[intBetween(r,0,CONTEXTS.length-1)];
  const key=[small,transfer,context.id].join(':');if(seen.has(key))continue;seen.add(key);
  out.push(createTransferQuestion({small,transfer,contextId:context.id,index:out.length+1}));
 }
 if(out.length!==count)throw new Error('not enough distinct questions');
 return out;
}
export function transferSolutionSteps(q){
 if(!validateTransferQuestion(q))throw new Error('invalid transfer question');
 return [
  q.initialLarge+'－'+q.initialSmall+'＝'+q.difference+'（'+q.unit+'）',
  q.difference+'÷2＝'+q.transfer+'（'+q.unit+'）',
  '驗算：'+q.initialLarge+'－'+q.transfer+'＝'+q.finalEach+'；'+q.initialSmall+'＋'+q.transfer+'＝'+q.finalEach+'。',
  '答：從'+q.largerGroup+'移 '+q.transfer+' '+q.unit+q.thing+'到'+q.smallerGroup+'。'
 ];
}
export function renderTransferSvg(q,{guided=true}={}){
 if(!validateTransferQuestion(q))throw new Error('invalid transfer diagram');
 const start=167,width=350,base=width*q.initialSmall/q.initialLarge,half=(width-base)/2;
 const a=base.toFixed(3),b=half.toFixed(3),x=(start+base).toFixed(3),y=(start+base+half).toFixed(3),end=start+width;
 return '<svg viewBox="0 0 605 178" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+esc(q.largerGroup+'與'+q.smallerGroup+'的移多補少線段圖')+'" data-common-width="'+a+'" data-half-difference-width="'+b+'">'
  +'<text x="8" y="42" font-size="13" fill="#24435b">'+esc(q.largerGroup)+'（'+q.initialLarge+'）</text>'
  +'<rect x="'+start+'" y="25" width="'+a+'" height="29" fill="#c5dff5" stroke="#426c96" stroke-width="1.5"/>'
  +'<rect x="'+x+'" y="25" width="'+b+'" height="29" fill="#f5d9a8" stroke="#af792d" stroke-width="1.5"/>'
  +'<rect x="'+y+'" y="25" width="'+b+'" height="29" fill="#f5d9a8" stroke="#af792d" stroke-width="1.5"/>'
  +'<text x="8" y="105" font-size="13" fill="#24435b">'+esc(q.smallerGroup)+'（'+q.initialSmall+'）</text>'
  +'<rect x="'+start+'" y="88" width="'+a+'" height="29" fill="#c5dff5" stroke="#426c96" stroke-width="1.5"/>'
  +'<path d="M '+x+' 123 v5 M '+end+' 123 v5 M '+x+' 127 H '+end+'" stroke="#af792d" fill="none" stroke-width="1.4"/>'
  +'<text x="355" y="145" text-anchor="middle" font-size="13" fill="#815619">'+esc(guided?'相差 '+q.difference+' '+q.unit:'相差：_____')+'</text>'
  +'<text x="302" y="169" text-anchor="middle" font-size="13" fill="#24435b">將多出的部分分成兩等份，移一份到較少的一邊</text>'
  +'</svg>';
}
export function buildTransferWorksheet({count=6,seed='mt-transfer-pilot',level='basic',diagram='guided',answers=true}={}){
 if(!['guided','unlabeled','none'].includes(diagram))throw new RangeError('invalid diagram mode');
 const questions=generateTransferQuestions({count,seed,level});
 return Object.freeze({worksheetId:'mt-transfer-equalization-pilot',topicId:TOPIC_ID,questions,diagram,answers:!!answers,validated:questions.every(validateTransferQuestion)});
}
