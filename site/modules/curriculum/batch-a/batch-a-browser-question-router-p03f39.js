export * from "./batch-a-browser-question-router-p03f38.js";
import {generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-question-router-p03f38.js";
import {buildBatchABrowserPlan} from "./batch-a-browser-generator-p03f39.js";
import {canGenerateG5BU04P03F39Questions,generateG5BU04P03F39Questions} from "./g5b-u04-rank9-integer-times-decimal-runtime-p03f39.js";
export function generateBatchABrowserQuestions(options={}){const plan=options.plan??buildBatchABrowserPlan(options);if(!canGenerateG5BU04P03F39Questions(plan))return baseGenerate(options);return generateG5BU04P03F39Questions({...options,plan});}
