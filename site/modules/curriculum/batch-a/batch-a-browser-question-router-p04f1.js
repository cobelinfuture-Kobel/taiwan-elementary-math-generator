export * from "./batch-a-browser-question-router-p03f53.js";
import {generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-question-router-p03f53.js";
import {buildBatchABrowserPlan} from "./batch-a-browser-generator-p04f1.js";
import {canGenerateG3AU04P04F1Questions,generateG3AU04P04F1Questions} from "./quantity-measurement-runtime-p04f1.js";
import {G3A_U04_P04F1_SPEC_ID} from "../registry/g3a-u04-ruler-reading-selector-projection-p04f1.js";
export function generateBatchABrowserQuestions(options={}){const plan=options.plan??buildBatchABrowserPlan(options);if(!plan.patternSpecIds?.includes(G3A_U04_P04F1_SPEC_ID))return baseGenerate({...options,plan});if(plan.patternSpecIds.length===1&&canGenerateG3AU04P04F1Questions(plan))return generateG3AU04P04F1Questions({...options,plan});return Object.freeze({ok:false,errors:Object.freeze([{code:"p04f1_pattern_set_invalid",severity:"error",path:"patternSpecIds",message:"p04f1_pattern_set_invalid"}]),warnings:Object.freeze([]),questions:Object.freeze([]),allocation:Object.freeze([]),plan});}
