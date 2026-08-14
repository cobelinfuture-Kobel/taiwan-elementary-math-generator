export * from "./batch-a-browser-question-router-p03f34.js";
import {generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-question-router-p03f34.js";
import {buildBatchABrowserPlan} from "./batch-a-browser-generator-p03f35.js";
import {canGenerateG4BU06P03F35Questions,generateG4BU06P03F35Questions} from "./g4b-u06-rank9-decimal-scale-runtime-p03f35.js";
export function generateBatchABrowserQuestions(options={}){const plan=options.plan??buildBatchABrowserPlan(options);if(!canGenerateG4BU06P03F35Questions(plan))return baseGenerate(options);return generateG4BU06P03F35Questions({...options,plan});}
