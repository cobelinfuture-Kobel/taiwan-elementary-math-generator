export * from "./batch-a-browser-question-router-p03f35.js";
import {generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-question-router-p03f35.js";
import {buildBatchABrowserPlan} from "./batch-a-browser-generator-p03f36.js";
import {canGenerateG5AU01P03F36Questions,generateG5AU01P03F36Questions} from "./g5a-u01-rank9-decimal-runtime-p03f36.js";
export function generateBatchABrowserQuestions(options={}){const plan=options.plan??buildBatchABrowserPlan(options);if(!canGenerateG5AU01P03F36Questions(plan))return baseGenerate(options);return generateG5AU01P03F36Questions({...options,plan});}
