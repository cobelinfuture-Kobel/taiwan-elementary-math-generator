// MathThinking M2: prerequisites are guidance, not a fabricated mastery/unlock service.
export const LEARNING_PATH=Object.freeze([
 Object.freeze({step:'S00',id:'mt_cap_quantity_bar_foundation',title:'數量比較與線段圖先備',topic:null,prerequisites:['mt_cap_compare_two_quantities','mt_cap_equal_parts_division','mt_cap_two_step_add_sub_div']}),
 Object.freeze({step:'S01',id:'mt_topic_transfer_equalization',title:'移多補少',topic:'mt_topic_transfer_equalization',prerequisites:['mt_cap_compare_two_quantities','mt_cap_equal_parts_division','mt_cap_two_step_add_sub_div']}),
 Object.freeze({step:'S02',id:'mt_topic_sum_difference',title:'和差問題',topic:'mt_topic_sum_difference',prerequisites:['mt_topic_transfer_equalization','mt_cap_compare_two_quantities','mt_cap_equal_parts_division','mt_cap_two_step_add_sub_div']})
]);
export function recommendedReadiness(topicId,evidence=[]){
 if(!Array.isArray(evidence)||!evidence.every(x=>typeof x==='string'))throw new TypeError('invalid evidence');
 const node=LEARNING_PATH.find(x=>x.topic===topicId);
 if(!node)throw new RangeError('unknown topic');
 const known=new Set(evidence);
 return Object.freeze({topicId,missing:node.prerequisites.filter(x=>!known.has(x)),advisoryOnly:true,masteryCertified:false,autoUnlocked:false});
}
export function renderLearningPathHtml(activeTopic){
 return LEARNING_PATH.map(x=>'<li data-step="'+x.step+'"'+(x.topic===activeTopic?' aria-current="step"':'')+'><strong>'+x.step+' '+x.title+'</strong><span> '+(x.topic===activeTopic?'目前練習':x.topic?'可自由練習':'建議先備（未評量）')+'</span></li>').join('');
}
