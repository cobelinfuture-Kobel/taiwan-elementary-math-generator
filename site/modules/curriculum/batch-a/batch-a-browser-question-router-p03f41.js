export * from "./batch-a-browser-question-router-p03f40.js";
import {generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-question-router-p03f40.js";
import {buildBatchABrowserPlan} from "./batch-a-browser-generator-p03f41.js";
import {generateG6BU01P03F32Questions} from "./g6b-u01-rank8-decimal-fraction-conversion-runtime-p03f32.js";
import {canGenerateG6BU01P03F41Questions,generateG6BU01P03F41Questions} from "./g6b-u01-rank9-mixed-domain-order-runtime-p03f41.js";
import {G6B_U01_P03F32_SPEC_IDS} from "../registry/g6b-u01-rank8-decimal-fraction-conversion-selector-projection-p03f32.js";
import {G6B_U01_P03F41_SPEC_ID} from "../registry/g6b-u01-rank9-mixed-domain-order-selector-projection-p03f41.js";
const issue=(code,path)=>({code,severity:"error",path,message:code});
export function generateBatchABrowserQuestions(options={}){
  const plan=options.plan??buildBatchABrowserPlan(options);
  if(!plan.patternSpecIds?.includes(G6B_U01_P03F41_SPEC_ID))return baseGenerate({...options,plan});
  if(canGenerateG6BU01P03F41Questions(plan))return generateG6BU01P03F41Questions({...options,plan});
  const count=Number(options.questionCount??plan.questionCount??24);
  if(!Number.isInteger(count)||count<1||count>240)return{ok:false,errors:[issue("p03f41_question_count_invalid","questionCount")],warnings:[],questions:[],allocation:[],plan};
  const sequence=plan.patternSpecIds,conversionSpecs=sequence.filter(id=>G6B_U01_P03F32_SPEC_IDS.includes(id));
  if(!conversionSpecs.length||sequence.some(id=>id!==G6B_U01_P03F41_SPEC_ID&&!G6B_U01_P03F32_SPEC_IDS.includes(id)))return{ok:false,errors:[issue("p03f41_mixed_pattern_set_invalid","patternSpecIds")],warnings:[],questions:[],allocation:[],plan};
  const counts=new Map(sequence.map(id=>[id,0]));for(let index=0;index<count;index++){const id=sequence[index%sequence.length];counts.set(id,(counts.get(id)??0)+1);}
  const conversionCount=conversionSpecs.reduce((sum,id)=>sum+(counts.get(id)??0),0),compareCount=counts.get(G6B_U01_P03F41_SPEC_ID)??0;
  const seed=options.generationSeed??plan.generationSeed??"p03f41";
  const conversion=generateG6BU01P03F32Questions({...options,generationSeed:`${seed}-conversion`,questionCount:conversionCount,plan:{...plan,patternSpecIds:conversionSpecs,questionCount:conversionCount}});
  const compare=generateG6BU01P03F41Questions({...options,generationSeed:`${seed}-compare`,questionCount:compareCount,plan:{...plan,patternSpecIds:[G6B_U01_P03F41_SPEC_ID],questionCount:compareCount}});
  if(!conversion.ok||!compare.ok)return{ok:false,errors:[...(conversion.errors??[]),...(compare.errors??[])],warnings:[],questions:[],allocation:[],plan};
  const queues=new Map();for(const question of[...conversion.questions,...compare.questions]){const queue=queues.get(question.patternSpecId)??[];queue.push(question);queues.set(question.patternSpecId,queue);}
  const questions=[];for(let index=0;index<count;index++){const id=sequence[index%sequence.length],queue=queues.get(id)??[],question=queue.shift();if(!question)return{ok:false,errors:[issue("p03f41_mixed_allocation_underflow",`questions[${index}]`)],warnings:[],questions:[],allocation:[],plan};questions.push(question);}
  const allocation=sequence.map(patternSpecId=>({patternSpecId,questionCount:questions.filter(question=>question.patternSpecId===patternSpecId).length}));
  return Object.freeze({ok:true,errors:Object.freeze([]),warnings:Object.freeze([]),questions:Object.freeze(questions),allocation:Object.freeze(allocation),plan});
}
