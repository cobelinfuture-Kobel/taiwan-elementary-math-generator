export * from "./batch-a-browser-question-router-p03f27.js";
import { generateBatchABrowserQuestions as baseGenerate } from "./batch-a-browser-question-router-p03f27.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f28.js";
import { canGenerateG5AU01P03F28Questions, generateG5AU01P03F28Questions } from "./g5a-u01-rank8-decimal-runtime-p03f28.js";

export function generateBatchABrowserQuestions(options={}){
  const plan=buildBatchABrowserPlan(options);
  if(!canGenerateG5AU01P03F28Questions(plan)) return baseGenerate(options);
  return generateG5AU01P03F28Questions({...options,plan});
}
