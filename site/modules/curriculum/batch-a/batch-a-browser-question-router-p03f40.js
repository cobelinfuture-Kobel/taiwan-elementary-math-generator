export * from "./batch-a-browser-question-router-p03f39.js";
import {generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-question-router-p03f39.js";
import {buildBatchABrowserPlan} from "./batch-a-browser-generator-p03f40.js";
import {canGenerateG5BU06P03F40Questions,generateG5BU06P03F40Questions} from "./g5b-u06-rank9-integer-division-decimal-quotient-runtime-p03f40.js";
export function generateBatchABrowserQuestions(options={}){const plan=options.plan??buildBatchABrowserPlan(options);if(!canGenerateG5BU06P03F40Questions(plan))return baseGenerate(options);return generateG5BU06P03F40Questions({...options,plan});}
