import {G4A_U10_P04F5_GROUP_ID,G4A_U10_P04F5_KP_ID,G4A_U10_P04F5_SOURCE_ID,G4A_U10_P04F5_SPEC_ID,P04F5_REQUIRED_W4_CAPABILITY_IDS} from "../registry/g4a-u10-kilometer-unit-identity-selector-projection-p04f5.js";
const PROMPTS=Object.freeze([
"表示兩個城市之間的長距離，最適合使用哪個長度單位？",
"記錄跨鄉鎮的長距離時，通常使用哪個長度單位？",
"描述汽車行駛的長距離，應選用哪個長度單位？",
"描述火車行駛的長距離，應選用哪個長度單位？",
"描述公路上的長距離，最適合使用哪個長度單位？",
"記錄長途旅行的距離，應使用哪個長度單位？",
"表示兩個地區相隔很遠的距離，應選哪個長度單位？",
"要記錄較大的地面距離，最適合用哪個長度單位？",
"描述騎車經過一段很長的路程時，應使用哪個長度單位？",
"描述巴士行駛的長距離時，應選用哪個長度單位？",
"地圖上標示城鎮間的長距離，通常使用哪個長度單位？",
"道路標誌表示前方地點尚有一段長距離時，通常使用哪個長度單位？",
"表示從一個城市到另一個城市的距離，應選用哪個長度單位？",
"記錄高速公路上的長距離，最適合使用哪個長度單位？",
"描述長途步道的總長度時，適合使用哪個長度單位？",
"表示跨區域的長距離時，通常使用哪個長度單位？",
"要用一個單位表示很長的道路距離，應選哪個長度單位？",
"在長度單位中，哪一個適合表示長程交通距離？",
"要表示比日常室內測量大很多的距離，應使用哪個長度單位？",
"記錄兩個觀光地點之間的長距離，最適合使用哪個長度單位？",
"描述船隻航行的一段長距離時，應選用哪個長度單位？",
"描述長距離自行車路線時，通常使用哪個長度單位？",
"若題目只要求選擇長距離使用的單位，應填哪個長度單位？",
"依教材的長度單位使用場合，較長距離應使用哪個單位？"
]);
const issue=(code,path)=>Object.freeze({code,severity:"error",path,message:code});
function hashSeed(value){let h=2166136261;for(const ch of String(value??"p04f5")){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function rotatedPrompts(seed){const offset=hashSeed(seed)%PROMPTS.length;return[...PROMPTS.slice(offset),...PROMPTS.slice(0,offset)];}
export function resolveKilometerUnitIdentity(distanceScaleClass){return distanceScaleClass==="long_distance"?Object.freeze({distanceScaleClass,answerText:"公里",canonicalUnitId:"kilometer",unitSymbol:"km",dimensionId:"LENGTH",unitFamilyId:"METRIC_LENGTH"}):null;}
export function canGenerateG4AU10P04F5Questions(plan={}){return plan.sourceId===G4A_U10_P04F5_SOURCE_ID&&Array.isArray(plan.patternSpecIds)&&plan.patternSpecIds.length===1&&plan.patternSpecIds[0]===G4A_U10_P04F5_SPEC_ID&&plan.questionMode==="numeric";}
export function generateG4AU10P04F5Questions(options={}){const plan=options.plan??options,count=Number(options.questionCount??plan.questionCount??8);if(!Number.isInteger(count)||count<1||count>PROMPTS.length)return Object.freeze({ok:false,errors:Object.freeze([issue("p04f5_question_count_invalid","questionCount")]),warnings:Object.freeze([]),questions:Object.freeze([]),allocation:Object.freeze([]),plan});if(!canGenerateG4AU10P04F5Questions({...plan,questionCount:count}))return Object.freeze({ok:false,errors:Object.freeze([issue("p04f5_plan_not_kilometer_unit_identity","plan")]),warnings:Object.freeze([]),questions:Object.freeze([]),allocation:Object.freeze([]),plan});const prompts=rotatedPrompts(options.generationSeed??plan.generationSeed??"p04f5-kilometer-unit").slice(0,count),resolved=resolveKilometerUnitIdentity("long_distance"),questions=prompts.map((prompt,index)=>Object.freeze({id:`p04f5-kilometer-unit-${index+1}`,generatedItemId:`p04f5-kilometer-unit-${index+1}`,sourceId:G4A_U10_P04F5_SOURCE_ID,sourceNodeId:G4A_U10_P04F5_SOURCE_ID,knowledgePointId:G4A_U10_P04F5_KP_ID,patternGroupId:G4A_U10_P04F5_GROUP_ID,patternSpecId:G4A_U10_P04F5_SPEC_ID,operationModelId:"op_g4a_u10_length_kilometer_unit_identity",operationFamilyId:"quantity_measurement",mode:"numeric",questionMode:"numeric",prompt,promptText:prompt,blankedDisplayText:prompt,displayText:`${prompt} ${resolved.answerText}`,answer:resolved.answerText,answerText:resolved.answerText,finalAnswer:resolved.answerText,givenRoleValues:Object.freeze({distanceScaleClass:"long_distance"}),metadata:Object.freeze({sourceId:G4A_U10_P04F5_SOURCE_ID,knowledgePointId:G4A_U10_P04F5_KP_ID,patternGroupId:G4A_U10_P04F5_GROUP_ID,patternId:G4A_U10_P04F5_SPEC_ID,requestedUnknownRole:"lengthUnit",answerType:"length_unit_label",distanceScaleClass:"long_distance",canonicalUnitId:resolved.canonicalUnitId,unitSymbol:resolved.unitSymbol,dimensionId:resolved.dimensionId,unitFamilyId:resolved.unitFamilyId,sourcePdfTitle:"meow911_4a10_source.pdf",sourceEvidencePages:Object.freeze([1]),requiredW4CapabilityIds:P04F5_REQUIRED_W4_CAPABILITY_IDS,operatorApprovedExtension:false,standaloneConversionQuestion:false,mixedUnitComparison:false,mixedUnitArithmetic:false,routeDistanceApplication:false})}));return Object.freeze({ok:true,errors:Object.freeze([]),warnings:Object.freeze([]),questions:Object.freeze(questions),allocation:Object.freeze([{patternSpecId:G4A_U10_P04F5_SPEC_ID,questionCount:questions.length}]),plan});}
export function validateG4AU10P04F5Question(question={}){const errors=[];if(question.sourceId!==G4A_U10_P04F5_SOURCE_ID)errors.push(issue("p04f5_source_invalid","sourceId"));if(question.knowledgePointId!==G4A_U10_P04F5_KP_ID&&question.metadata?.knowledgePointId!==G4A_U10_P04F5_KP_ID)errors.push(issue("p04f5_kp_invalid","knowledgePointId"));if(question.patternSpecId!==G4A_U10_P04F5_SPEC_ID)errors.push(issue("p04f5_spec_invalid","patternSpecId"));const scaleClass=question.metadata?.distanceScaleClass??question.givenRoleValues?.distanceScaleClass,resolved=resolveKilometerUnitIdentity(scaleClass);if(!resolved)errors.push(issue("p04f5_distance_scale_class_invalid","metadata.distanceScaleClass"));if(resolved&&(question.answer!==resolved.answerText||question.answerText!==resolved.answerText||question.finalAnswer!==resolved.answerText))errors.push(issue("p04f5_answer_mismatch","answer"));if(resolved&&(question.metadata?.canonicalUnitId!==resolved.canonicalUnitId||question.metadata?.unitSymbol!==resolved.unitSymbol))errors.push(issue("p04f5_unit_identity_mismatch","metadata"));if(question.metadata?.dimensionId!=="LENGTH"||question.metadata?.unitFamilyId!=="METRIC_LENGTH")errors.push(issue("p04f5_dimension_identity_invalid","metadata"));if(question.metadata?.standaloneConversionQuestion!==false||question.metadata?.mixedUnitComparison!==false||question.metadata?.mixedUnitArithmetic!==false||question.metadata?.routeDistanceApplication!==false)errors.push(issue("p04f5_scope_leak","metadata"));if(/1000|換算|加法|減法|乘法|除法|總里程|剩餘距離|相差/.test(String(question.blankedDisplayText??question.promptText??"")))errors.push(issue("p04f5_scope_wording_leak","blankedDisplayText"));return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),warnings:Object.freeze([])});}
