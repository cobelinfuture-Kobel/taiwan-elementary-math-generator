export * from "./batch-a-browser-question-router-p03f50.js";
import {generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-question-router-p03f50.js";
import {buildBatchABrowserPlan} from "./batch-a-browser-generator-p03f51.js";
import {canGenerateG6AU04P03F51Questions,generateG6AU04P03F51Questions} from "./g6a-u04-rank11-decimal-divided-by-decimal-runtime-p03f51.js";
import {G6A_U04_P03F51_SPEC_ID} from "../registry/g6a-u04-rank11-decimal-divided-by-decimal-selector-projection-p03f51.js";
export function generateBatchABrowserQuestions(options={}){const plan=options.plan??buildBatchABrowserPlan(options);if(!plan.patternSpecIds?.includes(G6A_U04_P03F51_SPEC_ID))return baseGenerate({...options,plan});if(canGenerateG6AU04P03F51Questions(plan))return generateG6AU04P03F51Questions({...options,plan});return Object.freeze({ok:false,errors:Object.freeze([{code:"p03f51_target_plan_invalid",severity:"error",path:"plan",message:"q051 target plan must contain exactly the decimal-by-decimal PatternSpec."}]),warnings:Object.freeze([]),questions:Object.freeze([]),allocation:Object.freeze([]),plan});}
