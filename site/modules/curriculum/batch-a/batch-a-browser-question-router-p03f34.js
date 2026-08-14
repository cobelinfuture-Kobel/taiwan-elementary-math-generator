export * from "./batch-a-browser-question-router-p03f33.js";
import { generateBatchABrowserQuestions as baseGenerate } from "./batch-a-browser-question-router-p03f33.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f34.js";
import { canGenerateG4AU09P03F34Questions, generateG4AU09P03F34Questions } from "./g4a-u09-rank9-missing-digit-inequality-runtime-p03f34.js";
export function generateBatchABrowserQuestions(options={}){
  const plan=options.plan??buildBatchABrowserPlan(options);
  if(!canGenerateG4AU09P03F34Questions(plan)) return baseGenerate(options);
  return generateG4AU09P03F34Questions({...options,plan});
}
