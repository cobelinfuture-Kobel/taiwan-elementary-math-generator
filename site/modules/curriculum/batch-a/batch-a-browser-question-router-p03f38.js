export * from "./batch-a-browser-question-router-p03f37.js";
import {generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-question-router-p03f37.js";
import {buildBatchABrowserPlan} from "./batch-a-browser-generator-p03f38.js";
import {canGenerateG5AU06P03F38Questions,generateG5AU06P03F38Questions} from "./g5a-u06-rank9-mixed-improper-add-sub-runtime-p03f38.js";
export function generateBatchABrowserQuestions(options={}){const plan=options.plan??buildBatchABrowserPlan(options);if(!canGenerateG5AU06P03F38Questions(plan))return baseGenerate(options);return generateG5AU06P03F38Questions({...options,plan});}
