export * from "./batch-a-browser-question-router-p03f19.js";
import { generateBatchABrowserQuestions as baseGenerate } from "./batch-a-browser-question-router-p03f19.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f20.js";
import { canGenerateG4BU08Slice020Questions,generateG4BU08Slice020Questions } from "./fraction-decimal-conversion-runtime-p03f20.js";
export function generateBatchABrowserQuestions(o={}){const plan=buildBatchABrowserPlan(o);return canGenerateG4BU08Slice020Questions(plan)?generateG4BU08Slice020Questions({...o,plan}):baseGenerate(o);}
