import {
  G3B_U03_P04F3_GROUP_ID,
  G3B_U03_P04F3_KP_ID,
  G3B_U03_P04F3_SOURCE_ID,
  G3B_U03_P04F3_SPEC_ID,
  P04F3_REQUIRED_W4_CAPABILITY_IDS,
} from "../registry/g3b-u03-time-12-24-conversion-selector-projection-p04f3.js";

const CASES=Object.freeze([
  ["12_TO_24","上午12時","0時","上午",12,0],
  ["24_TO_12","0時","上午12時","上午",12,0],
  ["12_TO_24","上午1時","1時","上午",1,1],
  ["24_TO_12","1時","上午1時","上午",1,1],
  ["12_TO_24","上午6時","6時","上午",6,6],
  ["24_TO_12","6時","上午6時","上午",6,6],
  ["12_TO_24","上午9時","9時","上午",9,9],
  ["24_TO_12","9時","上午9時","上午",9,9],
  ["12_TO_24","上午11時","11時","上午",11,11],
  ["24_TO_12","11時","上午11時","上午",11,11],
  ["12_TO_24","中午12時","12時","中午",12,12],
  ["24_TO_12","12時","中午12時","中午",12,12],
  ["12_TO_24","下午1時","13時","下午",1,13],
  ["24_TO_12","13時","下午1時","下午",1,13],
  ["12_TO_24","下午3時","15時","下午",3,15],
  ["24_TO_12","15時","下午3時","下午",3,15],
  ["12_TO_24","下午4時","16時","下午",4,16],
  ["24_TO_12","16時","下午4時","下午",4,16],
  ["12_TO_24","下午6時","18時","下午",6,18],
  ["24_TO_12","18時","下午6時","下午",6,18],
  ["12_TO_24","下午9時","21時","下午",9,21],
  ["24_TO_12","21時","下午9時","下午",9,21],
  ["12_TO_24","下午11時","23時","下午",11,23],
  ["24_TO_12","23時","下午11時","下午",11,23],
]);
const issue=(code,path)=>Object.freeze({code,severity:"error",path,message:code});
function hashSeed(value){let h=2166136261;for(const ch of String(value??"p04f3")){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function rotatedCases(seed){const offset=hashSeed(seed)%CASES.length;return[...CASES.slice(offset),...CASES.slice(0,offset)];}
export function resolve12HourTo24(period,hour12){const h=Number(hour12);if(period==="上午"&&h===12)return 0;if(period==="上午"&&h>=1&&h<=11)return h;if(period==="中午"&&h===12)return 12;if(period==="下午"&&h>=1&&h<=11)return h+12;return null;}
export function resolve24HourTo12(hour24){const h=Number(hour24);if(!Number.isInteger(h)||h<0||h>23)return null;if(h===0)return Object.freeze({period:"上午",hour12:12,answerText:"上午12時"});if(h<12)return Object.freeze({period:"上午",hour12:h,answerText:`上午${h}時`});if(h===12)return Object.freeze({period:"中午",hour12:12,answerText:"中午12時"});return Object.freeze({period:"下午",hour12:h-12,answerText:`下午${h-12}時`});}
export function canGenerateG3BU03P04F3Questions(plan={}){return plan.sourceId===G3B_U03_P04F3_SOURCE_ID&&Array.isArray(plan.patternSpecIds)&&plan.patternSpecIds.length===1&&plan.patternSpecIds[0]===G3B_U03_P04F3_SPEC_ID&&plan.questionMode==="numeric";}
function promptFor(direction,sourceText){return direction==="12_TO_24"?`把「${sourceText}」改用二十四小時制表示，應寫成幾時？`:`把二十四小時制的「${sourceText}」改用十二小時制表示，應寫成什麼時刻？`;}
export function generateG3BU03P04F3Questions(options={}){const plan=options.plan??options;const count=Number(options.questionCount??plan.questionCount??8);if(!Number.isInteger(count)||count<1||count>CASES.length)return Object.freeze({ok:false,errors:Object.freeze([issue("p04f3_question_count_invalid","questionCount")]),warnings:Object.freeze([]),questions:Object.freeze([]),allocation:Object.freeze([]),plan});if(!canGenerateG3BU03P04F3Questions({...plan,questionCount:count}))return Object.freeze({ok:false,errors:Object.freeze([issue("p04f3_plan_not_time_system_conversion","plan")]),warnings:Object.freeze([]),questions:Object.freeze([]),allocation:Object.freeze([]),plan});const rows=rotatedCases(options.generationSeed??plan.generationSeed??"p04f3-time-system").slice(0,count);const questions=rows.map(([direction,sourceText,answerText,period,hour12,hour24],index)=>{const prompt=promptFor(direction,sourceText);return Object.freeze({id:`p04f3-time-${index+1}-${direction.toLowerCase()}-${hour24}`,generatedItemId:`p04f3-time-${index+1}-${direction.toLowerCase()}-${hour24}`,sourceId:G3B_U03_P04F3_SOURCE_ID,sourceNodeId:G3B_U03_P04F3_SOURCE_ID,knowledgePointId:G3B_U03_P04F3_KP_ID,patternGroupId:G3B_U03_P04F3_GROUP_ID,patternSpecId:G3B_U03_P04F3_SPEC_ID,operationModelId:"op_g3b_u03_time_12_24_hour_conversion",operationFamilyId:"time_system_conversion",mode:"numeric",questionMode:"numeric",prompt,promptText:prompt,blankedDisplayText:prompt,displayText:`${prompt} ${answerText}`,answer:answerText,answerText,finalAnswer:answerText,givenRoleValues:Object.freeze({sourceTimeRepresentation:sourceText,conversionDirection:direction}),metadata:Object.freeze({sourceId:G3B_U03_P04F3_SOURCE_ID,knowledgePointId:G3B_U03_P04F3_KP_ID,patternGroupId:G3B_U03_P04F3_GROUP_ID,patternId:G3B_U03_P04F3_SPEC_ID,requestedUnknownRole:"convertedTimeRepresentation",answerType:"time_system_representation",conversionDirection:direction,sourceTimeRepresentation:sourceText,period,hour12,hour24,sourcePdfTitle:"meow911_3b03_time.pdf",sourceEvidencePages:Object.freeze([1]),requiredW4CapabilityIds:P04F3_REQUIRED_W4_CAPABILITY_IDS,operatorApprovedExtension:false,crossDayConversion:false,elapsedTime:false,durationUnitConversion:false,timeArithmetic:false,scheduleReasoning:false})});});return Object.freeze({ok:true,errors:Object.freeze([]),warnings:Object.freeze([]),questions:Object.freeze(questions),allocation:Object.freeze([{patternSpecId:G3B_U03_P04F3_SPEC_ID,questionCount:questions.length}]),plan});}
export function validateG3BU03P04F3Question(question={}){const errors=[];if(question.sourceId!==G3B_U03_P04F3_SOURCE_ID)errors.push(issue("p04f3_source_invalid","sourceId"));if(question.knowledgePointId!==G3B_U03_P04F3_KP_ID&&question.metadata?.knowledgePointId!==G3B_U03_P04F3_KP_ID)errors.push(issue("p04f3_kp_invalid","knowledgePointId"));if(question.patternSpecId!==G3B_U03_P04F3_SPEC_ID)errors.push(issue("p04f3_spec_invalid","patternSpecId"));const direction=question.metadata?.conversionDirection??question.givenRoleValues?.conversionDirection,period=question.metadata?.period,hour12=Number(question.metadata?.hour12),hour24=Number(question.metadata?.hour24);let expected=null;if(direction==="12_TO_24"){const resolved=resolve12HourTo24(period,hour12);expected=resolved==null?null:`${resolved}時`;if(resolved!==hour24)errors.push(issue("p04f3_hour_relation_invalid","metadata.hour24"));}else if(direction==="24_TO_12"){const resolved=resolve24HourTo12(hour24);expected=resolved?.answerText??null;if(resolved&&(resolved.period!==period||resolved.hour12!==hour12))errors.push(issue("p04f3_period_relation_invalid","metadata"));}else errors.push(issue("p04f3_direction_invalid","metadata.conversionDirection"));if(!expected)errors.push(issue("p04f3_time_representation_invalid","metadata"));if(expected&&(question.answer!==expected||question.answerText!==expected||question.finalAnswer!==expected))errors.push(issue("p04f3_answer_mismatch","answer"));if(question.metadata?.crossDayConversion!==false||question.metadata?.elapsedTime!==false||question.metadata?.durationUnitConversion!==false||question.metadata?.timeArithmetic!==false||question.metadata?.scheduleReasoning!==false)errors.push(issue("p04f3_scope_leak","metadata"));if(/跨日|隔天|經過時間|多久|幾小時|幾分鐘|幾秒|日換時|時換分|分換秒|加法|減法|加減|進位|退位|借位|時刻表|行程/.test(String(question.blankedDisplayText??question.promptText??"")))errors.push(issue("p04f3_scope_wording_leak","blankedDisplayText"));return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),warnings:Object.freeze([])});}
