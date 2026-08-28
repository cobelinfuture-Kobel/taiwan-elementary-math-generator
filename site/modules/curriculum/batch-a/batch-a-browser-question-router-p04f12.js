export * from "./batch-a-browser-question-router-p04f11.js";
import {generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-question-router-p04f11.js";
import {buildBatchABrowserPlan} from "./batch-a-browser-generator-p04f12.js";
import {generateG3AU04P04F12QuestionSet,P04F12_ALL_SPEC_IDS} from "./quantity-measurement-runtime-p04f12.js";
import {G3A_U04_P04F1_SPEC_ID} from "../registry/g3a-u04-ruler-reading-selector-projection-p04f1.js";
import {G3A_U04_P04F12_SOURCE_ID} from "../registry/g3a-u04-mixed-length-selector-projection-p04f12.js";
const issue=(code,path)=>Object.freeze({code,severity:"error",path,message:code});
export function generateBatchABrowserQuestions(options={}){const plan=options.plan??buildBatchABrowserPlan(options);if(plan.sourceId!==G3A_U04_P04F12_SOURCE_ID||!plan.patternSpecIds?.some(spec=>P04F12_ALL_SPEC_IDS.includes(spec)))return baseGenerate({...options,plan});const specs=plan.patternSpecIds??[],count=Number(options.questionCount??plan.questionCount??8),q001Only=specs.length===1&&specs[0]===G3A_U04_P04F1_SPEC_ID;if(q001Only&&(!Number.isInteger(count)||count<1||count>36))return Object.freeze({ok:false,errors:Object.freeze([issue("p04f12_q001_capacity_invalid","questionCount")]),warnings:Object.freeze([]),questions:Object.freeze([]),allocation:Object.freeze([]),plan});return generateG3AU04P04F12QuestionSet({...options,plan});}
