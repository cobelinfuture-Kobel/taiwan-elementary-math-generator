export * from "./batch-a-browser-question-router-p04f1.js";
import {generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-question-router-p04f1.js";
import {buildBatchABrowserPlan} from "./batch-a-browser-generator-p04f2.js";
import {canGenerateG3BU02P04F2Questions,generateG3BU02P04F2Questions} from "./quantity-measurement-runtime-p04f2.js";
import {G3B_U02_P04F2_SPEC_ID} from "../registry/g3b-u02-capacity-unit-identity-selector-projection-p04f2.js";
export function generateBatchABrowserQuestions(options={}){const plan=options.plan??buildBatchABrowserPlan(options);if(!plan.patternSpecIds?.includes(G3B_U02_P04F2_SPEC_ID))return baseGenerate({...options,plan});if(plan.patternSpecIds.length===1&&canGenerateG3BU02P04F2Questions(plan))return generateG3BU02P04F2Questions({...options,plan});return Object.freeze({ok:false,errors:Object.freeze([{code:"p04f2_pattern_set_invalid",severity:"error",path:"patternSpecIds",message:"p04f2_pattern_set_invalid"}]),warnings:Object.freeze([]),questions:Object.freeze([]),allocation:Object.freeze([]),plan});}
