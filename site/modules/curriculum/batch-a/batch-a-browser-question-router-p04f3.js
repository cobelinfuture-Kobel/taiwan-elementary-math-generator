export * from "./batch-a-browser-question-router-p04f2.js";
import {generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-question-router-p04f2.js";
import {buildBatchABrowserPlan} from "./batch-a-browser-generator-p04f3.js";
import {canGenerateG3BU03P04F3Questions,generateG3BU03P04F3Questions} from "./time-system-runtime-p04f3.js";
import {G3B_U03_P04F3_SPEC_ID} from "../registry/g3b-u03-time-12-24-conversion-selector-projection-p04f3.js";
export function generateBatchABrowserQuestions(options={}){const plan=options.plan??buildBatchABrowserPlan(options);if(!plan.patternSpecIds?.includes(G3B_U03_P04F3_SPEC_ID))return baseGenerate({...options,plan});if(plan.patternSpecIds.length===1&&canGenerateG3BU03P04F3Questions(plan))return generateG3BU03P04F3Questions({...options,plan});return Object.freeze({ok:false,errors:Object.freeze([{code:"p04f3_pattern_set_invalid",severity:"error",path:"patternSpecIds",message:"p04f3_pattern_set_invalid"}]),warnings:Object.freeze([]),questions:Object.freeze([]),allocation:Object.freeze([]),plan});}
