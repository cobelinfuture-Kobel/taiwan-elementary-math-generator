import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {LEARNING_PATH,recommendedReadiness,renderLearningPathHtml} from '../../site/math-thinking/learning-path.js';

const plan=JSON.parse(readFileSync('data/math-thinking/learning-path-v1.json','utf8'));
test('source contract matches all three UI nodes and preserves old pilot ordering',()=>{
 assert.deepEqual(plan.nodes.map(n=>n.step),['S00','S01','S02']);
 assert.deepEqual(plan.nodes.map(n=>n.nodeId),LEARNING_PATH.map(n=>n.id));
 for(let i=0;i<3;i++)assert.deepEqual(plan.nodes[i].requires,LEARNING_PATH[i].prerequisites);
 assert.equal(plan.nodes[0].practiceAvailable,false);
 assert.equal(plan.nodes[1].knowledgePointId,'mt_kp_transfer_equalize_two_groups');
 assert.equal(plan.nodes[2].knowledgePointId,'mt_kp_sum_difference_two_groups');
 assert.equal(plan.developmentOrderIsNotLearningOrder,true);
 assert.equal(plan.autoUnlockEnabled,false);
 assert.equal(plan.certifiedMastery,false);
 assert.equal(plan.bridge.admissionState,'NOT_ADMITTED');
});
test('readiness never confuses a list of claimed capabilities with certified mastery',()=>{
 const transfer=recommendedReadiness('mt_topic_transfer_equalization',[]);
 const sum=recommendedReadiness('mt_topic_sum_difference',[]);
 assert.equal(transfer.missing.length,3);
 assert.equal(sum.missing.length,4);
 assert.ok(sum.missing.includes('mt_topic_transfer_equalization'));
 const proof=['mt_topic_transfer_equalization','mt_cap_compare_two_quantities','mt_cap_equal_parts_division','mt_cap_two_step_add_sub_div'];
 const cleared=recommendedReadiness('mt_topic_sum_difference',proof);
 assert.deepEqual(cleared.missing,[]);
 assert.equal(cleared.masteryCertified,false);
 assert.equal(cleared.autoUnlocked,false);
 assert.equal(cleared.advisoryOnly,true);
 assert.throws(()=>recommendedReadiness('incorrect',[]),RangeError);
 assert.throws(()=>recommendedReadiness('mt_topic_sum_difference',[null]),TypeError);
});
test('UI learning path highlights current topic without representing S00 as mastered',()=>{
 const html=renderLearningPathHtml('mt_topic_transfer_equalization');
 assert.match(html,/data-step="S00"/);assert.match(html,/data-step="S01" aria-current="step"/);
 assert.match(html,/data-step="S02"/);assert.match(html,/未評量/);
});
