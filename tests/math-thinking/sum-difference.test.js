import assert from 'node:assert/strict';
import test from 'node:test';
import {TOPIC_ID,KNOWLEDGE_POINT_ID,createSumDifferenceQuestion,generateSumDifferenceQuestions,validateSumDifferenceQuestion,renderSumDifferenceSvg,solutionSteps,buildPilotWorksheet} from '../../site/math-thinking/sum-difference.js';

test('known sum 120 and difference 30 yields 75 and 45',()=>{
 const q=createSumDifferenceQuestion({small:45,difference:30});
 assert.equal(q.total,120);assert.equal(q.large,75);assert.equal(q.small,45);
 assert.equal(q.topicId,TOPIC_ID);assert.equal(q.knowledgePointId,KNOWLEDGE_POINT_ID);
 assert.equal(validateSumDifferenceQuestion(q),true);
 assert.match(solutionSteps(q)[0],/120－30/);
});
test('generated questions are deterministic, diverse, original and independently validated',()=>{
 for(let n=0;n<50;n++){
   const opts={count:30,seed:'case-'+n,level:n%2?'extended':'basic'};
   const questions=generateSumDifferenceQuestions(opts);
   assert.deepEqual(questions,generateSumDifferenceQuestions(opts));
   assert.equal(questions.length,30);
   assert.equal(new Set(questions.map(q=>[q.contextId,q.small,q.difference].join(':'))).size,30);
   assert.equal(questions.every(validateSumDifferenceQuestion),true);
   assert.equal(questions.every(q=>q.originality==='MODEL_GENERATED_ORIGINAL'),true);
   assert.equal(questions.every(q=>q.total>q.difference && q.text.includes(String(q.total))),true);
 }
});
test('validator rejects manipulated answers and relations',()=>{
 const q=createSumDifferenceQuestion({small:39,difference:18,contextId:'science-tickets'});
 for(const change of [{small:38},{large:56},{difference:20},{total:98},{originality:'COPIED_SOURCE'},{unit:'盒'}]){
   assert.equal(validateSumDifferenceQuestion({...q,...change}),false);
 }
 assert.throws(()=>createSumDifferenceQuestion({small:-1,difference:2}),RangeError);
 assert.throws(()=>createSumDifferenceQuestion({small:1,difference:0}),RangeError);
});
test('SVG proportional segments use witness values and present total/difference',()=>{
 const q=createSumDifferenceQuestion({small:45,difference:30});
 const html=renderSumDifferenceSvg(q,{guided:true});
 const base=365*45/75;
 assert.match(html,new RegExp('width="'+base.toFixed(3)+'"'));
 assert.match(html,new RegExp('width="'+(365-base).toFixed(3)+'"'));
 assert.match(html,/總數 120 本/);
 assert.match(html,/多 30 本/);
 const blank=renderSumDifferenceSvg(q,{guided:false});
 assert.doesNotMatch(blank,/總數 120/);
 assert.match(blank,/總數：_____/);
 assert.throws(()=>renderSumDifferenceSvg({...q,difference:31}));
});
test('worksheet supports answer toggle and fail-closed invalid options',()=>{
 const a=buildPilotWorksheet({seed:'seed',count:5,answers:true,diagram:'guided'});
 const b=buildPilotWorksheet({seed:'seed',count:5,answers:false,diagram:'none'});
 assert.equal(a.validated,true);assert.equal(a.questions.length,5);
 assert.equal(b.answers,false);assert.deepEqual(a.questions,b.questions);
 assert.throws(()=>buildPilotWorksheet({count:31}),RangeError);
 assert.throws(()=>buildPilotWorksheet({diagram:'source-copy'}),RangeError);
});
