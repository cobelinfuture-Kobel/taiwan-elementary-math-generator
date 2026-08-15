export * from "./batch-a-browser-question-router-p03f36.js";
import {generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-question-router-p03f36.js";
import {buildBatchABrowserPlan} from "./batch-a-browser-generator-p03f37.js";
import {canGenerateG5AU04P03F37Questions,generateG5AU04P03F37Questions} from "./g5a-u04-rank9-equivalent-mixed-runtime-p03f37.js";
export function generateBatchABrowserQuestions(options={}){const plan=options.plan??buildBatchABrowserPlan(options);if(!canGenerateG5AU04P03F37Questions(plan))return baseGenerate(options);return generateG5AU04P03F37Questions({...options,plan});}
