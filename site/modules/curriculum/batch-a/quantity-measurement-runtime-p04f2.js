import {
  G3B_U02_P04F2_GROUP_ID,
  G3B_U02_P04F2_KP_ID,
  G3B_U02_P04F2_SOURCE_ID,
  G3B_U02_P04F2_SPEC_ID,
  P04F2_REQUIRED_W4_CAPABILITY_IDS,
} from "../registry/g3b-u02-capacity-unit-identity-selector-projection-p04f2.js";

const LABEL_BY_SCALE=Object.freeze({smaller_capacity:"毫升",larger_capacity:"公升"});
const ENGLISH_UNIT_BY_SCALE=Object.freeze({smaller_capacity:"millilitre",larger_capacity:"litre"});
const PROMPTS=Object.freeze([
  ["smaller_capacity","較小的容量通常用哪個單位表示？請填「毫升」或「公升」。"],
  ["larger_capacity","較大的容量通常用哪個單位表示？請填「毫升」或「公升」。"],
  ["smaller_capacity","記錄較小容量時，應選「毫升」還是「公升」？"],
  ["larger_capacity","記錄較大容量時，應選「毫升」還是「公升」？"],
  ["smaller_capacity","容量尺度較小時，較適合使用哪個容量單位？"],
  ["larger_capacity","容量尺度較大時，較適合使用哪個容量單位？"],
  ["smaller_capacity","要表示較小的容量，請填最適合的單位名稱。"],
  ["larger_capacity","要表示較大的容量，請填最適合的單位名稱。"],
  ["smaller_capacity","在毫升與公升中，哪一個較適合表示小容量？"],
  ["larger_capacity","在毫升與公升中，哪一個較適合表示大容量？"],
  ["smaller_capacity","遇到較小容量時，容量單位應選毫升還是公升？"],
  ["larger_capacity","遇到較大容量時，容量單位應選毫升還是公升？"],
  ["smaller_capacity","若只判斷容量單位，較小容量應使用哪一個？"],
  ["larger_capacity","若只判斷容量單位，較大容量應使用哪一個？"],
  ["smaller_capacity","請依容量大小選單位：較小容量應填什麼？"],
  ["larger_capacity","請依容量大小選單位：較大容量應填什麼？"],
  ["smaller_capacity","容量較小，不做換算時應直接選哪個單位？"],
  ["larger_capacity","容量較大，不做換算時應直接選哪個單位？"],
  ["smaller_capacity","只比較單位適用尺度：小容量對應哪個單位？"],
  ["larger_capacity","只比較單位適用尺度：大容量對應哪個單位？"],
  ["smaller_capacity","毫升與公升二選一：表示小容量應選哪個？"],
  ["larger_capacity","毫升與公升二選一：表示大容量應選哪個？"],
  ["smaller_capacity","依教材的容量單位規則，較小容量使用哪個單位？"],
  ["larger_capacity","依教材的容量單位規則，較大容量使用哪個單位？"],
]);
const issue=(code,path)=>Object.freeze({code,severity:"error",path,message:code});
function hashSeed(value){let h=2166136261;for(const ch of String(value??"p04f2")){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function rotatedPrompts(seed){const offset=hashSeed(seed)%PROMPTS.length;return[...PROMPTS.slice(offset),...PROMPTS.slice(0,offset)];}
export function resolveCapacityUnitIdentity(capacityScaleClass){const answerText=LABEL_BY_SCALE[capacityScaleClass]??null;return answerText?Object.freeze({capacityScaleClass,answerText,canonicalUnitId:ENGLISH_UNIT_BY_SCALE[capacityScaleClass],dimensionId:"CAPACITY",unitFamilyId:"METRIC_CAPACITY"}):null;}
export function canGenerateG3BU02P04F2Questions(plan={}){return plan.sourceId===G3B_U02_P04F2_SOURCE_ID&&Array.isArray(plan.patternSpecIds)&&plan.patternSpecIds.length===1&&plan.patternSpecIds[0]===G3B_U02_P04F2_SPEC_ID&&plan.questionMode==="numeric";}
export function generateG3BU02P04F2Questions(options={}){const plan=options.plan??options;const count=Number(options.questionCount??plan.questionCount??8);if(!Number.isInteger(count)||count<1||count>PROMPTS.length)return Object.freeze({ok:false,errors:Object.freeze([issue("p04f2_question_count_invalid","questionCount")]),warnings:Object.freeze([]),questions:Object.freeze([]),allocation:Object.freeze([]),plan});if(!canGenerateG3BU02P04F2Questions({...plan,questionCount:count}))return Object.freeze({ok:false,errors:Object.freeze([issue("p04f2_plan_not_capacity_unit_identity","plan")]),warnings:Object.freeze([]),questions:Object.freeze([]),allocation:Object.freeze([]),plan});const prompts=rotatedPrompts(options.generationSeed??plan.generationSeed??"p04f2-capacity-unit").slice(0,count);const questions=prompts.map(([capacityScaleClass,prompt],index)=>{const resolved=resolveCapacityUnitIdentity(capacityScaleClass);return Object.freeze({id:`p04f2-capacity-unit-${index+1}-${capacityScaleClass}`,generatedItemId:`p04f2-capacity-unit-${index+1}-${capacityScaleClass}`,sourceId:G3B_U02_P04F2_SOURCE_ID,sourceNodeId:G3B_U02_P04F2_SOURCE_ID,knowledgePointId:G3B_U02_P04F2_KP_ID,patternGroupId:G3B_U02_P04F2_GROUP_ID,patternSpecId:G3B_U02_P04F2_SPEC_ID,operationModelId:"op_g3b_u02_capacity_ml_l_unit_identity",operationFamilyId:"quantity_measurement",mode:"numeric",questionMode:"numeric",prompt,promptText:prompt,blankedDisplayText:prompt,displayText:`${prompt} ${resolved.answerText}`,answer:resolved.answerText,answerText:resolved.answerText,finalAnswer:resolved.answerText,givenRoleValues:Object.freeze({capacityScaleClass}),metadata:Object.freeze({sourceId:G3B_U02_P04F2_SOURCE_ID,knowledgePointId:G3B_U02_P04F2_KP_ID,patternGroupId:G3B_U02_P04F2_GROUP_ID,patternId:G3B_U02_P04F2_SPEC_ID,requestedUnknownRole:"capacityUnit",answerType:"capacity_unit_label",capacityScaleClass,canonicalUnitId:resolved.canonicalUnitId,dimensionId:resolved.dimensionId,unitFamilyId:resolved.unitFamilyId,sourcePdfTitle:"meow911_3b02_l_ml.pdf",sourceEvidencePages:Object.freeze([1]),requiredW4CapabilityIds:P04F2_REQUIRED_W4_CAPABILITY_IDS,operatorApprovedExtension:false,containerScaleReading:false,standaloneConversionQuestion:false,mixedUnitComparison:false,mixedUnitArithmetic:false})});});return Object.freeze({ok:true,errors:Object.freeze([]),warnings:Object.freeze([]),questions:Object.freeze(questions),allocation:Object.freeze([{patternSpecId:G3B_U02_P04F2_SPEC_ID,questionCount:questions.length}]),plan});}
export function validateG3BU02P04F2Question(question={}){const errors=[];if(question.sourceId!==G3B_U02_P04F2_SOURCE_ID)errors.push(issue("p04f2_source_invalid","sourceId"));if(question.knowledgePointId!==G3B_U02_P04F2_KP_ID&&question.metadata?.knowledgePointId!==G3B_U02_P04F2_KP_ID)errors.push(issue("p04f2_kp_invalid","knowledgePointId"));if(question.patternSpecId!==G3B_U02_P04F2_SPEC_ID)errors.push(issue("p04f2_spec_invalid","patternSpecId"));const scaleClass=question.metadata?.capacityScaleClass??question.givenRoleValues?.capacityScaleClass,resolved=resolveCapacityUnitIdentity(scaleClass);if(!resolved)errors.push(issue("p04f2_capacity_scale_class_invalid","metadata.capacityScaleClass"));if(resolved&&(question.answer!==resolved.answerText||question.answerText!==resolved.answerText||question.finalAnswer!==resolved.answerText))errors.push(issue("p04f2_answer_mismatch","answer"));if(resolved&&question.metadata?.canonicalUnitId!==resolved.canonicalUnitId)errors.push(issue("p04f2_unit_identity_mismatch","metadata.canonicalUnitId"));if(question.metadata?.dimensionId!=="CAPACITY"||question.metadata?.unitFamilyId!=="METRIC_CAPACITY")errors.push(issue("p04f2_dimension_identity_invalid","metadata"));if(question.metadata?.containerScaleReading!==false||question.metadata?.standaloneConversionQuestion!==false||question.metadata?.mixedUnitComparison!==false||question.metadata?.mixedUnitArithmetic!==false)errors.push(issue("p04f2_scope_leak","metadata"));return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),warnings:Object.freeze([])});}
