import assert from 'node:assert/strict';
import test from 'node:test';
import {TOPIC_ID,KNOWLEDGE_POINT_ID,createTransferQuestion,validateTransferQuestion,generateTransferQuestions,transferSolutionSteps,renderTransferSvg,buildTransferWorksheet} from '../../site/math-thinking/transfer-equalize.js';

test('14 and 10 equalise by transfer 2, both become 12',()=>{
 const q=createTransferQuestion({small:10,transfer:2});
 assert.equal(q.initialLarge,14);assert.equal(q.initialSmall,10);
 assert.equal(q.transfer,2);assert.equal(q.difference,4);assert.equal(q.finalEach,12);
 assert.equal(q.total,24);assert.equal(q.topicId,TOPIC_ID);assert.equal(q.knowledgePointId,KNOWLEDGE_POINT_ID);
 assert.equal(validateTransferQuestion(q),true);
 const steps=transferSolutionSteps(q);
 assert.match(steps[0],/14－10＝4/);assert.match(steps[1],/4÷2＝2/);assert.match(steps[2],/12/);
});
test('all 50 seeds × 30 questions have consistent witnesses and reproducibility',()=>{
 for(let k=0;k<50;k++){
  const opts={count:30,seed:'m2-case-'+k,level:k%2?'basic':'extended'};
  const rows=generateTransferQuestions(opts);
  assert.deepEqual(rows,generateTransferQuestions(opts));
  assert.equal(rows.length,30);
  assert.equal(new Set(rows.map(x=>[x.contextId,x.initialSmall,x.transfer].join(':'))).size,30);
  for(const q of rows){assert.ok(validateTransferQuestion(q));assert.equal(q.initialLarge-q.transfer,q.initialSmall+q.transfer);assert.equal(q.difference,2*q.transfer);assert.equal(q.originality,'MODEL_GENERATED_ORIGINAL');}
 }
});
test('tampered arithmetic, source wording and invalid ranges fail closed',()=>{
 const q=createTransferQuestion({small:10,transfer:2,contextId:'puzzle'});
 for(const patch of [{initialLarge:16},{initialSmall:9},{transfer:3},{difference:6},{total:25},{finalEach:11},{text:'原始教材複製文字'},{unit:'根'},{originality:'SOURCE_COPIED'}])assert.equal(validateTransferQuestion({...q,...patch}),false);
 assert.throws(()=>createTransferQuestion({small:0,transfer:2}),RangeError);
 assert.throws(()=>createTransferQuestion({small:10,transfer:0}),RangeError);
 assert.throws(()=>generateTransferQuestions({count:31}),RangeError);
 assert.throws(()=>generateTransferQuestions({level:'middle'}),RangeError);
});
test('diagram uses one common bar and two exactly equal transfer-width segments',()=>{
 const q=createTransferQuestion({small:10,transfer:2});
 const diagram=renderTransferSvg(q,{guided:true});
 const common=(350*10/14).toFixed(3),half=((350-350*10/14)/2).toFixed(3);
 assert.match(diagram,new RegExp('data-common-width="'+common+'"'));
 assert.match(diagram,new RegExp('data-half-difference-width="'+half+'"'));
 assert.equal(diagram.split('width="'+half+'"').length-1,2);
 assert.match(diagram,/相差 4 個/);
 const blank=renderTransferSvg(q,{guided:false});
 assert.match(blank,/相差：_____/);
 assert.doesNotMatch(blank,/相差 4 個/);
 assert.throws(()=>renderTransferSvg({...q,transfer:3}));
});
test('worksheet toggles answer mode without affecting arithmetic',()=>{
 const a=buildTransferWorksheet({count:8,seed:'stable',answers:true,diagram:'guided'});
 const b=buildTransferWorksheet({count:8,seed:'stable',answers:false,diagram:'none'});
 assert.deepEqual(a.questions,b.questions);assert.equal(a.validated,true);assert.equal(b.answers,false);
 assert.equal(a.topicId,TOPIC_ID);
 assert.throws(()=>buildTransferWorksheet({diagram:'bitmap-copy'}),RangeError);
});
